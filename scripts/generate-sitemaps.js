/**
 * generate-sitemaps.js
 *
 * Generates grouped XML sitemaps + a sitemap index file.
 *
 * Output:
 *   sitemap.xml                 — sitemap index (references all group sitemaps)
 *   sitemap-calculators.xml
 *   sitemap-guides.xml
 *   sitemap-resources.xml
 *   sitemap-academy.xml
 *   sitemap-formulas.xml
 *   sitemap-glossary.xml
 *   sitemap-reference.xml
 *   sitemap-other.xml           — charts, comparisons, methodology, about, search, etc.
 *
 * Replaces the output of generate-sitemap.js for the indexed version.
 * The existing generate-sitemap.js continues to write the flat sitemap.xml
 * for backward compatibility; this script ALSO writes a new sitemap.xml.
 *
 * Cloudflare Pages compatibility: all files are plain XML, no server logic.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { isLegacyProgrammaticChlorine } = require('./redirect-rules');

const ROOT     = path.join(__dirname, '..');
const BASE_URL = 'https://waterbalancetools.com';

// ── Priorities & change-frequencies per category ─────────────────────────────

const PRIORITIES = {
  calculators: { priority: '0.9', changefreq: 'weekly' },
  charts:      { priority: '0.8', changefreq: 'monthly' },
  resources:   { priority: '0.8', changefreq: 'monthly' },
  academy:     { priority: '0.8', changefreq: 'monthly' },
  formulas:    { priority: '0.7', changefreq: 'monthly' },
  glossary:    { priority: '0.7', changefreq: 'monthly' },
  reference:   { priority: '0.7', changefreq: 'monthly' },
  guides:      { priority: '0.7', changefreq: 'monthly' },
  comparisons: { priority: '0.6', changefreq: 'monthly' },
  other:       { priority: '0.5', changefreq: 'monthly' },
};

const SKIP_DIRS = new Set([
  'node_modules', '.git', 'assets', 'js', 'functions', 'data', 'lib',
  'scripts', 'partials', 'templates',
]);
const SKIP_FILES = new Set([
  '404.html', 'tools/index.html',
]);

// ── File walk ─────────────────────────────────────────────────────────────────

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    const rel  = path.relative(ROOT, full).replace(/\\/g, '/');
    if (e.isDirectory()) { walk(full, out); continue; }
    if (!e.name.endsWith('.html')) continue;
    if (SKIP_FILES.has(rel)) continue;
    if (isLegacyProgrammaticChlorine(rel)) continue;
    out.push(rel);
  }
  return out;
}

function toCleanPath(rel) {
  return rel.replace(/\.html$/i, '').replace(/\/index$/i, '') || '';
}

function getCategory(cleanPath) {
  const first = cleanPath.split('/')[0];
  const map = {
    calculators: 'calculators', guides: 'guides', charts: 'charts',
    resources: 'resources', academy: 'academy', formulas: 'formulas',
    glossary: 'glossary', reference: 'reference', comparisons: 'comparisons',
    methodology: 'other', about: 'other', search: 'other',
    programmatic: 'other', legal: 'other',
  };
  return map[first] || 'other';
}

// ── XML builders ──────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().slice(0, 10);

function urlEntry(cleanPath, prio) {
  const url = cleanPath ? `${BASE_URL}/${cleanPath}` : BASE_URL;
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${prio.changefreq}</changefreq>
    <priority>${prio.priority}</priority>
  </url>`;
}

function buildSitemap(entries) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.join('\n') + '\n</urlset>';
}

function buildIndex(sitemapNames) {
  const items = sitemapNames.map(n =>
    `  <sitemap>\n    <loc>${BASE_URL}/${n}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>`
  ).join('\n');
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    items + '\n</sitemapindex>';
}

// ── Categorise files ──────────────────────────────────────────────────────────

const files = walk(ROOT);
const groups = {
  calculators: [], guides: [], resources: [], academy: [],
  formulas: [], glossary: [], reference: [], other: [],
};

// Homepage first
groups.calculators.unshift(urlEntry('', { priority: '1.0', changefreq: 'weekly' }));

for (const rel of files) {
  const cleanPath = toCleanPath(rel);
  if (!cleanPath && cleanPath !== '') continue;
  const cat = cleanPath === '' ? 'calculators' : getCategory(cleanPath);
  const prio = PRIORITIES[cat] || PRIORITIES.other;
  const group = groups[cat] || groups.other;
  group.push(urlEntry(cleanPath, prio));
}

// ── Write grouped sitemaps ────────────────────────────────────────────────────

const SITEMAP_FILES = [
  ['sitemap-calculators.xml', groups.calculators],
  ['sitemap-guides.xml',      groups.guides],
  ['sitemap-resources.xml',   groups.resources],
  ['sitemap-academy.xml',     groups.academy],
  ['sitemap-formulas.xml',    groups.formulas],
  ['sitemap-glossary.xml',    groups.glossary],
  ['sitemap-reference.xml',   groups.reference],
  ['sitemap-other.xml',       groups.other],
];

const usedSitemaps = [];
for (const [filename, entries] of SITEMAP_FILES) {
  if (entries.length === 0) continue;
  fs.writeFileSync(path.join(ROOT, filename), buildSitemap(entries), 'utf8');
  usedSitemaps.push(filename);
  console.log(`  → ${filename} (${entries.length} URLs)`);
}

// ── Write sitemap index ───────────────────────────────────────────────────────

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildIndex(usedSitemaps), 'utf8');
console.log(`generate-sitemaps: sitemap.xml index → ${usedSitemaps.length} groups, ${files.length + 1} total URLs`);
