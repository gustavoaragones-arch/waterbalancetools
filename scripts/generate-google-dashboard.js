#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const urlEngine = require('../js/url/url-engine');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'audit', 'google');
const INDEXING_DIR = path.join(ROOT, 'data', 'indexing');

function readJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function writeCsv(fp, rows) {
  fs.writeFileSync(fp, rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n') + '\n', 'utf8');
}

function injectFreshnessBlock(filePath, title, items) {
  if (!fs.existsSync(filePath)) return;
  const html = fs.readFileSync(filePath, 'utf8');
  const markerStart = '<!-- indexing-freshness:start -->';
  const markerEnd = '<!-- indexing-freshness:end -->';
  const list = items.map((i) => `<li><a href="${urlEngine.href(i.url)}">${i.url}</a></li>`).join('');
  const block = `${markerStart}<section class="indexing-freshness"><h2>${title}</h2><ul>${list}</ul></section>${markerEnd}`;
  // Strip both the marked block AND the trailing "\n" the insertion below
  // concatenates after markerEnd (outside the marker pair, so a strip that
  // only removed markerStart..markerEnd would leave that "\n" behind every
  // time, growing by one blank line per build -- see
  // docs/PHASE-8A-TEMPLATE-INJECTOR-REMEDIATION.md).
  let next = html.replace(new RegExp(`\\s*${markerStart}[\\s\\S]*?${markerEnd}\\s*`, 'g'), '\n');
  if (next.includes('</main>')) next = next.replace('</main>', `${block}\n</main>`);
  if (next !== html) fs.writeFileSync(filePath, next, 'utf8');
}

function run() {
  const priority = readJson(path.join(INDEXING_DIR, 'priority.json'), { records: [] });
  const freshness = readJson(path.join(INDEXING_DIR, 'freshness.json'), { recentlyUpdated: [] });
  const crawlRules = readJson(path.join(INDEXING_DIR, 'crawl-rules.json'), { rules: [] });

  const records = priority.records || [];
  const weak = [...records].sort((a, b) => a.priority - b.priority).slice(0, 150);
  const top = [...records].sort((a, b) => b.priority - a.priority).slice(0, 150);
  const updated = freshness.recentlyUpdated || [];

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const indexHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Google Indexing Dashboard</title><meta name="robots" content="noindex, nofollow"><link rel="canonical" href="${urlEngine.canonicalUrl('/audit/google')}"><link rel="stylesheet" href="/style.css"></head><body><main class="container"><h1>Google Indexing Optimization Dashboard</h1><ul><li>Total pages scored: ${records.length}</li><li>Top tier pages: ${crawlRules.rules.filter((r) => r.crawlTier === 'Tier 1').length}</li><li>Recently updated tracked: ${updated.length}</li></ul><h2>Reports</h2><ul><li><a href="${urlEngine.href('/audit/google/priority-report')}">Priority Report</a></li><li><a href="${urlEngine.href('/audit/google/weak-pages')}">Weak Pages</a></li><li><a href="${urlEngine.href('/audit/google/freshness')}">Freshness</a></li><li><a href="${urlEngine.href('/audit/google/crawl-depth')}">Crawl Depth</a></li><li><a href="${urlEngine.href('/audit/google/authority-flow')}">Authority Flow</a></li><li><a href="${urlEngine.href('/audit/google/search-console-helper')}">Search Console Helper</a></li></ul></main></body></html>`;
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexHtml, 'utf8');

  const freshnessRows = updated.slice(0, 300).map((p) => `<tr><td>${p.url}</td><td>${p.lastReviewed || ''}</td><td>${p.platformVersion || ''}</td><td>${p.datasetVersion || ''}</td></tr>`).join('\n');
  fs.writeFileSync(path.join(OUT_DIR, 'freshness.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Freshness</title><meta name="robots" content="noindex, nofollow"><link rel="canonical" href="${urlEngine.canonicalUrl('/audit/google/freshness')}"><link rel="stylesheet" href="/style.css"></head><body><main class="container"><h1>Freshness</h1><table class="qa-table"><thead><tr><th>URL</th><th>Last Reviewed</th><th>Platform Version</th><th>Dataset Version</th></tr></thead><tbody>${freshnessRows}</tbody></table></main></body></html>`, 'utf8');

  const helperHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Search Console Helper</title><meta name="robots" content="noindex, nofollow"><link rel="canonical" href="${urlEngine.canonicalUrl('/audit/google/search-console-helper')}"><link rel="stylesheet" href="/style.css"></head><body><main class="container"><h1>Search Console Helper</h1><p>Use companion CSV files for validation and re-crawl requests.</p><ul><li>validation-list.csv</li><li>priority-pages.csv</li><li>weak-pages.csv</li><li>recently-updated.csv</li><li>crawl-review.md</li></ul></main></body></html>`;
  fs.writeFileSync(path.join(OUT_DIR, 'search-console-helper.html'), helperHtml, 'utf8');

  writeCsv(path.join(OUT_DIR, 'validation-list.csv'), [['url', 'tier', 'priority'], ...records.map((r) => [r.url, r.crawlTier, r.priority])]);
  writeCsv(path.join(OUT_DIR, 'priority-pages.csv'), [['url', 'priority', 'tier', 'type'], ...top.map((r) => [r.url, r.priority, r.crawlTier, r.pageType])]);
  writeCsv(path.join(OUT_DIR, 'weak-pages.csv'), [['url', 'priority', 'tier', 'type'], ...weak.map((r) => [r.url, r.priority, r.crawlTier, r.pageType])]);
  writeCsv(path.join(OUT_DIR, 'recently-updated.csv'), [['url', 'lastReviewed', 'platformVersion'], ...updated.map((r) => [r.url, r.lastReviewed || '', r.platformVersion || ''])]);

  const review = [
    '# Crawl Review',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Total pages scored: ${records.length}`,
    `Top-tier pages: ${crawlRules.rules.filter((r) => r.crawlTier === 'Tier 1').length}`,
    `Low-priority pages: ${weak.length}`,
    '',
    '## Recommended Validation Sequence',
    '1. Validate top 50 priority pages',
    '2. Validate recently updated pages',
    '3. Validate weak pages after internal linking improvements',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(OUT_DIR, 'crawl-review.md'), review, 'utf8');

  // Homepage + hub freshness intelligence injection.
  injectFreshnessBlock(path.join(ROOT, 'index.html'), 'Recently Updated', updated.slice(0, 10));
  const hubFiles = [
    'academy/index.html',
    'reference/index.html',
    'resources/index.html',
    'guides/index.html',
    'calculators/index.html',
    'charts/index.html',
  ];
  for (const rel of hubFiles) {
    injectFreshnessBlock(path.join(ROOT, rel), 'Recently Updated', updated.filter((u) => u.url.startsWith('/' + rel.split('/')[0])).slice(0, 8));
  }

  console.log('generate-google-dashboard: wrote audit/google dashboard + companion CSV/MD artifacts');
}

run();
