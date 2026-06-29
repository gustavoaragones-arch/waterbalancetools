#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://waterbalancetools.com';
const OUT_DIR = path.join(ROOT, 'audit', 'indexing-audit');
const JSON_PATH = path.join(OUT_DIR, 'canonical-audit.json');
const REPORT_PATH = path.join(OUT_DIR, 'reports', 'canonical-audit.md');

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
  return clean || '/';
}

function normalizeCanonical(url) {
  const stripped = String(url || '').trim().replace(BASE, '') || '/';
  return stripped.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '').replace(/\/$/, '') || '/';
}

function loadSitemapUrls() {
  const files = fs.readdirSync(ROOT).filter((f) => /^sitemap-.*\.xml$/.test(f));
  const set = new Set();
  for (const file of files) {
    const xml = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const loc of locs) {
      if (loc.endsWith('.xml')) continue;
      set.add(normalizeCanonical(loc));
    }
  }
  return set;
}

function run() {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const pages = walkHtml(ROOT);
  const pageSet = new Set(pages.map(cleanFromFile));
  const sitemapSet = loadSitemapUrls();

  const missingCanonical = [];
  const nonSelfCanonical = [];
  const canonicalMissingTarget = [];
  const sitemapMismatch = [];
  const withHtmlCanonical = [];

  for (const page of pages) {
    const url = cleanFromFile(page);
    const html = fs.readFileSync(page, 'utf8');
    const raw = (html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) || [])[1];
    if (!raw) {
      missingCanonical.push(url);
      continue;
    }
    if (/\.html|index\.html/i.test(raw)) withHtmlCanonical.push({ page: url, canonical: raw });
    const canonicalClean = normalizeCanonical(raw);
    if (canonicalClean !== url) nonSelfCanonical.push({ page: url, canonical: canonicalClean, canonicalRaw: raw });
    if (!pageSet.has(canonicalClean)) canonicalMissingTarget.push({ page: url, canonical: canonicalClean, canonicalRaw: raw });
    if (!sitemapSet.has(canonicalClean)) sitemapMismatch.push({ page: url, canonical: canonicalClean });
  }

  const result = {
    generatedAt: new Date().toISOString(),
    pagesAudited: pages.length,
    missingCanonical: missingCanonical.length,
    nonSelfCanonical: nonSelfCanonical.length,
    canonicalMissingTarget: canonicalMissingTarget.length,
    sitemapMismatch: sitemapMismatch.length,
    withHtmlCanonical: withHtmlCanonical.length,
    samples: {
      missingCanonical: missingCanonical.slice(0, 100),
      nonSelfCanonical: nonSelfCanonical.slice(0, 100),
      canonicalMissingTarget: canonicalMissingTarget.slice(0, 100),
      sitemapMismatch: sitemapMismatch.slice(0, 100),
      withHtmlCanonical: withHtmlCanonical.slice(0, 100),
    },
  };

  fs.writeFileSync(JSON_PATH, JSON.stringify(result, null, 2) + '\n', 'utf8');

  const md = `# Canonical Audit\n\n` +
    `- Pages audited: ${result.pagesAudited}\n` +
    `- Missing canonical: ${result.missingCanonical}\n` +
    `- Non-self canonical: ${result.nonSelfCanonical}\n` +
    `- Canonical target missing in generated pages: ${result.canonicalMissingTarget}\n` +
    `- Canonical mismatch with sitemap: ${result.sitemapMismatch}\n` +
    `- Canonicals containing .html or index.html: ${result.withHtmlCanonical}\n\n` +
    `## Sample Non-Self Canonicals\n\n` +
    (result.samples.nonSelfCanonical.length ? result.samples.nonSelfCanonical.slice(0, 20).map((x) => `- ${x.page} -> ${x.canonicalRaw}`).join('\n') : '- None') + '\n\n' +
    `## Sample Canonical/Sitemap Mismatches\n\n` +
    (result.samples.sitemapMismatch.length ? result.samples.sitemapMismatch.slice(0, 20).map((x) => `- ${x.page} canonical ${x.canonical}`).join('\n') : '- None') + '\n';

  fs.writeFileSync(REPORT_PATH, md, 'utf8');
  console.log(`audit-canonicals: wrote ${JSON_PATH} and ${REPORT_PATH}`);
}

run();
