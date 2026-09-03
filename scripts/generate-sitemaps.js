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
const { execSync } = require('child_process');
const { isLegacyProgrammaticChlorine } = require('./redirect-rules');
const urlEngine = require('../js/url/url-engine');
const urlPolicy = require('./url-policy');

const ROOT     = path.join(__dirname, '..');

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

// Directory-level skip is a performance/defense-in-depth measure only.
// Eligibility itself is decided per-file by url-policy.isSitemapEligible(),
// which is the single source of truth (Phase 7C Step 5) -- it fails closed
// for any directory that is not explicitly on the production-content
// allowlist, so a new reports/audit/qa-style directory added later cannot
// silently become sitemap-eligible just by containing .html files.
const SKIP_DIRS = new Set([...urlPolicy.NON_PAGE_DIRS, ...urlPolicy.INTERNAL_TOOLING_DIRS, 'components']);

// ── File walk ─────────────────────────────────────────────────────────────────

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    const rel  = path.relative(ROOT, full).replace(/\\/g, '/');
    if (e.isDirectory()) { walk(full, out); continue; }
    if (!e.name.endsWith('.html')) continue;
    if (isLegacyProgrammaticChlorine(rel)) continue;
    if (!urlPolicy.isSitemapEligible(rel)) continue;
    out.push(rel);
  }
  return out;
}

function toCleanPath(rel) {
  return urlEngine.buildUrl(rel);
}

function getCategory(cleanPath) {
  // Phase 8E: strip a leading language segment (e.g. "es/") before
  // categorizing, so a localized page gets the same priority/changefreq
  // as its English equivalent rather than falling through to "other".
  const { rest } = urlPolicy.stripLanguageSegment(cleanPath);
  const first = rest.split('/')[0];
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

// Phase 7O (Step 9): lastmod previously stamped every single sitemap URL
// with the current build date regardless of whether that page's content
// actually changed -- a well-known sitemap anti-pattern that both
// overstates freshness on stable pages and, at scale, teaches crawlers to
// discount the signal entirely. Real per-file lastmod comes from this
// file's actual git commit history (deterministic given the same commit
// history, and never fabricated) rather than wall-clock "today." A file
// with no commit history yet (newly added, not yet committed) falls back
// to TODAY -- which is honest, since that genuinely is the only date
// known for it.
let GIT_LASTMOD = null;
function buildGitLastmodMap() {
  if (GIT_LASTMOD) return GIT_LASTMOD;
  GIT_LASTMOD = new Map();
  try {
    const out = execSync('git log --format="C:%cs" --name-only -- "*.html"', { cwd: ROOT, maxBuffer: 1024 * 1024 * 64 }).toString();
    let currentDate = null;
    for (const line of out.split('\n')) {
      if (line.startsWith('C:')) { currentDate = line.slice(2); continue; }
      const rel = line.trim();
      if (!rel || GIT_LASTMOD.has(rel)) continue; // git log is newest-first; keep the first (most recent) date seen per file
      if (currentDate) GIT_LASTMOD.set(rel, currentDate);
    }
  } catch (e) {
    // Not a git checkout, or git unavailable -- fall back to TODAY for
    // every file rather than failing the build over a freshness signal.
  }
  return GIT_LASTMOD;
}

function lastmodFor(rel) {
  const map = buildGitLastmodMap();
  return (rel && map.get(rel)) || TODAY;
}

function urlEntry(cleanPath, prio, rel) {
  const url = urlEngine.sitemapUrl(cleanPath || '/');
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmodFor(rel)}</lastmod>
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
    `  <sitemap>\n    <loc>${urlEngine.absoluteUrl(n)}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>`
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
groups.calculators.unshift(urlEntry('/', { priority: '1.0', changefreq: 'weekly' }, 'index.html'));

for (const rel of files) {
  const cleanPath = toCleanPath(rel);
  if (!cleanPath && cleanPath !== '') continue;
  // Phase 7O (Step 8): the homepage is already added explicitly above via
  // unshift() -- root index.html was ALSO falling through this loop and
  // being re-added, producing a genuine duplicate <loc> for / within
  // sitemap-calculators.xml. Skip it here; it has exactly one entry.
  if (cleanPath === '/') continue;
  const cat = getCategory(cleanPath.replace(/^\//, ''));
  const prio = PRIORITIES[cat] || PRIORITIES.other;
  const group = groups[cat] || groups.other;
  group.push(urlEntry(cleanPath, prio, rel));
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
