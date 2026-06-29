#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'audit', 'indexing-audit');
const REPORT_PATH = path.join(OUT_DIR, 'reports', 'internal-links.md');
const JSON_PATH = path.join(OUT_DIR, 'internal-links.json');

const SKIP_DIRS = new Set(['node_modules', '.git', 'assets', 'scripts', 'data', 'partials', 'templates', 'audit']);

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function cleanFromFile(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const clean = '/' + rel
    .replace(/^index\.html$/i, '')
    .replace(/\/index\.html$/i, '/')
    .replace(/\.html$/i, '')
    .replace(/\/$/, '');
  return clean === '' ? '/' : clean;
}

function linkToClean(link, sourcePath) {
  let href = link.split('#')[0].split('?')[0].trim();
  if (!href) return null;
  if (/^(https?:)?\/\//i.test(href)) return null;
  if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) return null;
  if (href.startsWith('/')) {
    href = href.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '').replace(/\/$/, '');
    return href || '/';
  }
  const sourceDir = path.dirname(cleanFromFile(sourcePath));
  const joined = path.posix.normalize(path.posix.join(sourceDir || '/', href));
  return (joined.startsWith('/') ? joined : '/' + joined)
    .replace(/\/index\.html$/i, '/')
    .replace(/\.html$/i, '')
    .replace(/\/$/, '') || '/';
}

function topEntries(map, n = 100) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

function run() {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const pages = walkHtml(ROOT);
  const pageSet = new Set(pages.map(cleanFromFile));
  const inbound = new Map([...pageSet].map((u) => [u, 0]));
  const outbound = new Map([...pageSet].map((u) => [u, 0]));
  const destinationCount = new Map();
  const broken = [];
  const relativeLinks = [];
  const unexpected = [];
  const anchors = [];

  let totalInternalLinks = 0;
  let htmlExtensionLinks = 0;
  let indexHtmlLinks = 0;

  for (const page of pages) {
    const sourceClean = cleanFromFile(page);
    const html = fs.readFileSync(page, 'utf8');
    const matches = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/gi)].map((m) => m[1]);
    const uniqueOut = new Set();
    for (const href of matches) {
      if (/^#/.test(href)) {
        anchors.push({ page: sourceClean, href });
        continue;
      }
      if (!/^(https?:)?\/\//i.test(href) && !/^(mailto:|tel:|javascript:|data:)/i.test(href)) {
        totalInternalLinks++;
        if (!href.startsWith('/')) relativeLinks.push({ page: sourceClean, href });
        if (/\.html(\?|#|$)/i.test(href)) htmlExtensionLinks++;
        if (/index\.html(\?|#|$)/i.test(href)) indexHtmlLinks++;
      }
      const target = linkToClean(href, page);
      if (!target) continue;
      uniqueOut.add(target);
      destinationCount.set(target, (destinationCount.get(target) || 0) + 1);
      inbound.set(target, (inbound.get(target) || 0) + 1);
      if (!pageSet.has(target)) broken.push({ source: sourceClean, href, target });
      if (/\/{2,}|calculators\/calculators|legal\/guides|guides\/tools|tools\/charts/i.test(target)) {
        unexpected.push({ source: sourceClean, href, target });
      }
    }
    outbound.set(sourceClean, uniqueOut.size);
  }

  const orphanRisk = [...pageSet]
    .filter((u) => u !== '/' && (inbound.get(u) || 0) <= 1)
    .sort((a, b) => (inbound.get(a) || 0) - (inbound.get(b) || 0))
    .slice(0, 100);

  const depth = {};
  for (const url of pageSet) {
    const d = url === '/' ? 0 : url.replace(/^\//, '').split('/').length;
    depth[d] = (depth[d] || 0) + 1;
  }

  const result = {
    generatedAt: new Date().toISOString(),
    pagesAudited: pages.length,
    totalInternalLinks,
    brokenInternalLinks: broken.length,
    relativeLinks: relativeLinks.length,
    htmlExtensionLinks,
    indexHtmlLinks,
    anchorsFound: anchors.length,
    topLinkedPages: topEntries(destinationCount, 100).map(([url, count]) => ({ url, count })),
    orphanRisk: orphanRisk.map((url) => ({ url, inbound: inbound.get(url) || 0, outbound: outbound.get(url) || 0 })),
    unexpectedPatterns: unexpected.slice(0, 100),
    crawlDepth: depth,
    sampleBroken: broken.slice(0, 100),
    sampleRelative: relativeLinks.slice(0, 100),
  };

  fs.writeFileSync(JSON_PATH, JSON.stringify(result, null, 2) + '\n', 'utf8');

  const md = `# Internal Link Audit\n\n` +
    `- Pages audited: ${result.pagesAudited}\n` +
    `- Internal links audited: ${result.totalInternalLinks}\n` +
    `- Broken internal links: ${result.brokenInternalLinks}\n` +
    `- Relative links: ${result.relativeLinks}\n` +
    `- Links with .html: ${result.htmlExtensionLinks}\n` +
    `- Links with index.html: ${result.indexHtmlLinks}\n\n` +
    `## Top 20 Most Linked Destinations\n\n` +
    result.topLinkedPages.slice(0, 20).map((x) => `- ${x.url} (${x.count})`).join('\n') + '\n\n' +
    `## Top Orphan Risks (Inbound <= 1)\n\n` +
    result.orphanRisk.slice(0, 30).map((x) => `- ${x.url} (inbound ${x.inbound}, outbound ${x.outbound})`).join('\n') + '\n\n' +
    `## Unexpected URL Patterns\n\n` +
    (result.unexpectedPatterns.length ? result.unexpectedPatterns.slice(0, 20).map((x) => `- ${x.source} -> ${x.href} (${x.target})`).join('\n') : '- None detected') + '\n\n' +
    `## Crawl Depth Distribution\n\n` +
    Object.entries(result.crawlDepth).sort((a, b) => Number(a[0]) - Number(b[0])).map(([d, c]) => `- Depth ${d}: ${c} pages`).join('\n') + '\n';

  fs.writeFileSync(REPORT_PATH, md, 'utf8');
  console.log(`audit-internal-links: wrote ${JSON_PATH} and ${REPORT_PATH}`);
}

run();
