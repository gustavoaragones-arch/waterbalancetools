#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const urlEngine = require('../js/url/url-engine');

const ROOT = path.join(__dirname, '..');
const AUDIT_DIR = path.join(ROOT, 'audit');
const AUDIT_FILE = path.join(AUDIT_DIR, 'hub-topology.md');

const SKIP_DIRS = new Set(['node_modules', '.git', 'assets', 'scripts', 'data', 'partials', 'templates', 'js', 'functions', 'lib', 'mcps', 'terminals', 'agent-transcripts']);

function walkHtml(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(full, out);
    else if (e.isFile() && e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function read(fp) {
  return fs.readFileSync(fp, 'utf8');
}

function rel(fp) {
  return path.relative(ROOT, fp).replace(/\\/g, '/');
}

function pageUrlFromFile(fp) {
  const r = rel(fp);
  return urlEngine.buildUrl(r);
}

function extractInternalLinks(html) {
  const links = [];
  const re = /<a[^>]+href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    if (/^(mailto:|tel:|javascript:|data:|https?:\/\/(?!waterbalancetools\.com))/i.test(href)) continue;
    links.push(urlEngine.normalizeHref(href));
  }
  return links;
}

const files = walkHtml(ROOT);
const htmlByUrl = new Map();
const inbound = new Map();
const outbound = new Map();
const linkedDirectories = new Set();
const errors = [];

for (const fp of files) {
  const url = pageUrlFromFile(fp);
  const html = read(fp);
  htmlByUrl.set(url, { fp, html });
}

for (const [url, { html }] of htmlByUrl.entries()) {
  const links = extractInternalLinks(html);
  outbound.set(url, links.length);
  for (const link of links) {
    inbound.set(link, (inbound.get(link) || 0) + 1);
    if (link !== '/' && !path.extname(link)) {
      const dirCandidate = path.join(ROOT, link.slice(1));
      if (fs.existsSync(dirCandidate) && fs.statSync(dirCandidate).isDirectory()) {
        linkedDirectories.add(link);
      }
    }
  }
}

for (const dirUrl of linkedDirectories) {
  const indexPath = path.join(ROOT, dirUrl.slice(1), 'index.html');
  if (!fs.existsSync(indexPath)) {
    errors.push(`Linked directory missing hub page: ${dirUrl}`);
  }
}

const hubs = [];
for (const [url, { fp, html }] of htmlByUrl.entries()) {
  if (!/data-hub-page="true"/.test(html)) continue;
  hubs.push({ url, fp, html });
}

const canonicalSet = new Set();
for (const hub of hubs) {
  const canonicalMatch = hub.html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  if (!canonicalMatch) errors.push(`Hub missing canonical: ${rel(hub.fp)}`);
  else {
    const canonical = canonicalMatch[1];
    if (canonicalSet.has(canonical)) errors.push(`Hub duplicate canonical: ${canonical}`);
    canonicalSet.add(canonical);
  }

  if (!/CollectionPage/.test(hub.html) || !/BreadcrumbList/.test(hub.html)) {
    errors.push(`Hub missing required schema: ${rel(hub.fp)}`);
  }

  const childLinkCount = (hub.html.match(/data-hub-child-link="true"/g) || []).length;
  if (childLinkCount < 5) errors.push(`Hub has fewer than five child links: ${rel(hub.fp)} (${childLinkCount})`);
}

// Broken links for hub pages only.
for (const hub of hubs) {
  const links = extractInternalLinks(hub.html);
  for (const l of links) {
    if (l.startsWith('#')) continue;
    if (!htmlByUrl.has(l) && l !== '/') {
      errors.push(`Hub has broken link: ${hub.url} -> ${l}`);
    }
  }
}

// Crawl depth approximation by URL segment count.
function depthOf(url) {
  return url === '/' ? 0 : url.split('/').filter(Boolean).length;
}
const tooDeep = [...htmlByUrl.keys()].filter((u) => depthOf(u) > 4);
if (tooDeep.length) {
  errors.push(`Pages exceed max depth of four: ${tooDeep.length}`);
}

const hubRows = hubs.map((h) => {
  const links = extractInternalLinks(h.html);
  const childCount = (h.html.match(/data-hub-child-link="true"/g) || []).length;
  return {
    url: h.url,
    children: childCount,
    inbound: inbound.get(h.url) || 0,
    outbound: links.length,
    depth: depthOf(h.url),
  };
}).sort((a, b) => a.url.localeCompare(b.url));

const totalHubHealth = hubRows.length
  ? Math.round(hubRows.reduce((sum, r) => sum + Math.min(100, r.children * 8 + r.inbound * 4 + Math.max(0, 20 - r.depth * 4)), 0) / hubRows.length)
  : 0;

fs.mkdirSync(AUDIT_DIR, { recursive: true });
const md = [
  '# Hub Topology Audit',
  '',
  `- Generated: ${new Date().toISOString()}`,
  `- Total hubs: ${hubRows.length}`,
  `- Linked directories: ${linkedDirectories.size}`,
  `- Hub health score: ${totalHubHealth}/100`,
  '',
  '## Hubs',
  '',
  '| Hub | Child Pages | Inbound | Outbound | Depth |',
  '|---|---:|---:|---:|---:|',
  ...hubRows.map((r) => `| ${r.url} | ${r.children} | ${r.inbound} | ${r.outbound} | ${r.depth} |`),
  '',
  '## Topology Findings',
  '',
  `- Directories with backing hubs: ${[...linkedDirectories].filter((d) => fs.existsSync(path.join(ROOT, d.slice(1), 'index.html'))).length}/${linkedDirectories.size}`,
  `- Pages deeper than 4 clicks (path-depth proxy): ${tooDeep.length}`,
  `- Relationship density (hub outbound avg): ${hubRows.length ? (hubRows.reduce((s, r) => s + r.outbound, 0) / hubRows.length).toFixed(2) : '0.00'}`,
  '',
].join('\n');
fs.writeFileSync(AUDIT_FILE, md + '\n', 'utf8');

if (errors.length) {
  console.error('validate-hubs failed:');
  errors.forEach((e) => console.error(`- ${e}`));
  process.exit(1);
}

console.log(`validate-hubs: PASSED (${hubRows.length} hubs validated)`);
console.log(`hub topology audit: ${path.relative(ROOT, AUDIT_FILE).replace(/\\/g, '/')}`);
