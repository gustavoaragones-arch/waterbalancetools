#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'audit', 'indexing-audit');
const JSON_PATH = path.join(OUT_DIR, 'sitemap-audit.json');
const REPORT_PATH = path.join(OUT_DIR, 'reports', 'crawl-audit.md');

const SKIP_DIRS = new Set(['node_modules', '.git', 'assets', 'scripts', 'data', 'partials', 'templates', 'audit']);
const BASE = 'https://waterbalancetools.com';

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
  return ('/' + rel
    .replace(/^index\.html$/i, '')
    .replace(/\/index\.html$/i, '/')
    .replace(/\.html$/i, '')
    .replace(/\/$/, '')) || '/';
}

function cleanFromUrl(url) {
  return String(url).replace(BASE, '').replace(/\/index\.html$/i, '/').replace(/\.html$/i, '').replace(/\/$/, '') || '/';
}

function loadRedirectSources() {
  const redirectFile = path.join(ROOT, '_redirects');
  if (!fs.existsSync(redirectFile)) return new Set();
  const lines = fs.readFileSync(redirectFile, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
  const set = new Set();
  for (const line of lines) {
    const [source] = line.split(/\s+/);
    if (source && source.startsWith('/')) set.add(cleanFromUrl(source));
  }
  return set;
}

function run() {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const sitemapFiles = fs.readdirSync(ROOT).filter((f) => /^sitemap-.*\.xml$/.test(f));
  const entries = [];
  for (const file of sitemapFiles) {
    const xml = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const loc of locs) {
      if (loc.endsWith('.xml')) continue;
      entries.push({ file, loc, clean: cleanFromUrl(loc) });
    }
  }

  const seen = new Set();
  const duplicates = [];
  const withHtml = [];
  const withIndex = [];
  const withParams = [];
  const invalidBase = [];
  const redirectCandidates = [];
  const redirectSources = loadRedirectSources();
  const pageSet = new Set(walkHtml(ROOT).map(cleanFromFile));

  for (const e of entries) {
    if (!e.loc.startsWith(BASE)) invalidBase.push(e);
    if (/\.html/i.test(e.loc)) withHtml.push(e);
    if (/index\.html/i.test(e.loc)) withIndex.push(e);
    if (/[?#]/.test(e.loc)) withParams.push(e);
    if (seen.has(e.clean)) duplicates.push(e);
    seen.add(e.clean);
    if (redirectSources.has(e.clean)) redirectCandidates.push(e);
  }

  const missingFromSitemap = [...pageSet].filter((u) => !seen.has(u) && !['/404', '/tools'].includes(u));
  const missingInBuild = [...seen].filter((u) => !pageSet.has(u));

  const result = {
    generatedAt: new Date().toISOString(),
    sitemapFiles: sitemapFiles.length,
    sitemapEntries: entries.length,
    uniqueEntries: seen.size,
    duplicates: duplicates.length,
    withHtml: withHtml.length,
    withIndex: withIndex.length,
    withParams: withParams.length,
    invalidBase: invalidBase.length,
    redirectCandidates: redirectCandidates.length,
    missingFromSitemap: missingFromSitemap.length,
    missingInBuild: missingInBuild.length,
    samples: {
      duplicates: duplicates.slice(0, 100),
      withHtml: withHtml.slice(0, 100),
      missingFromSitemap: missingFromSitemap.slice(0, 100),
      missingInBuild: missingInBuild.slice(0, 100),
      redirectCandidates: redirectCandidates.slice(0, 100),
    },
  };

  fs.writeFileSync(JSON_PATH, JSON.stringify(result, null, 2) + '\n', 'utf8');

  const md = `# Sitemap Audit\n\n` +
    `- Sitemap files audited: ${result.sitemapFiles}\n` +
    `- Total sitemap URL entries: ${result.sitemapEntries}\n` +
    `- Unique sitemap URL entries: ${result.uniqueEntries}\n` +
    `- Duplicate entries: ${result.duplicates}\n` +
    `- Entries containing .html: ${result.withHtml}\n` +
    `- Entries containing index.html: ${result.withIndex}\n` +
    `- Entries with query/fragment params: ${result.withParams}\n` +
    `- Redirect-source candidates inside sitemap: ${result.redirectCandidates}\n` +
    `- Generated pages missing from sitemap: ${result.missingFromSitemap}\n` +
    `- Sitemap entries missing in generated pages: ${result.missingInBuild}\n\n` +
    `## Missing From Sitemap (Sample)\n\n` +
    (result.samples.missingFromSitemap.length ? result.samples.missingFromSitemap.slice(0, 30).map((x) => `- ${x}`).join('\n') : '- None') + '\n\n' +
    `## Redirect Candidates Present In Sitemap (Sample)\n\n` +
    (result.samples.redirectCandidates.length ? result.samples.redirectCandidates.slice(0, 20).map((x) => `- ${x.clean} (${x.file})`).join('\n') : '- None') + '\n';

  fs.writeFileSync(REPORT_PATH, md, 'utf8');
  console.log(`audit-sitemaps: wrote ${JSON_PATH} and ${REPORT_PATH}`);
}

run();
