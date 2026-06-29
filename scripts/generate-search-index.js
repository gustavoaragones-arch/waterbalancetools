/**
 * generate-search-index.js
 *
 * Generates data/search-index.json — a flat array of page records consumed
 * by the client-side search page at /search/.
 *
 * Each record:
 *   { url, title, description, category, readingTime, h1, keywords }
 *
 * Keywords are derived from the page title, h1, and tags (from navigation.json).
 * Runs after generate-navigation.js so navigation.json is current.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { ROOT, walkHtml } = require('./template-utils');

const DATA_DIR = path.join(ROOT, 'data');

// ── Skip rules ────────────────────────────────────────────────────────────────

const SKIP_DIRS = new Set([
  'node_modules', '.git', 'assets', 'js', 'functions', 'data', 'lib',
  'scripts', 'partials', 'templates',
]);
const SKIP_PATHS = [
  /^programmatic\/templates/,
  /^templates\//,
  /^partials\//,
  /404/,
];

function shouldSkip(relPath) {
  const first = relPath.split('/')[0];
  if (SKIP_DIRS.has(first)) return true;
  return SKIP_PATHS.some(re => re.test(relPath));
}

// ── Metadata extractors ───────────────────────────────────────────────────────

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1].replace(/ \| WaterBalanceTools$/, '').replace(/ \| .*$/, '').trim() : '';
}
function extractDesc(html) {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i) ||
            html.match(/<meta\s+content="([^"]+)"\s+name="description"/i);
  return m ? m[1].trim() : '';
}
function extractH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? m[1].replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').trim() : '';
}

function toCleanUrl(relPath) {
  return '/' + relPath.replace(/\.html$/i, '').replace(/\/index$/i, '');
}

function urlToCategory(url) {
  const seg = url.replace(/^\//, '').split('/')[0];
  const MAP = {
    calculators:'Calculators', guides:'Guides', charts:'Charts',
    resources:'Resources', academy:'Academy', formulas:'Formula Library',
    glossary:'Glossary', reference:'Reference', comparisons:'Comparisons',
    methodology:'Methodology', editorial:'Editorial', provenance:'Methodology',
    revisions:'Methodology', about:'About',
  };
  return MAP[seg] || 'Other';
}

function generateKeywords(title, h1, tags) {
  const words = `${title} ${h1} ${(tags || []).join(' ')}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
  return [...new Set(words)].join(' ');
}

// ── Build index ───────────────────────────────────────────────────────────────

// Load nav metadata for tags/readingTime
let navPages = [];
try {
  const nav = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'navigation.json'), 'utf8'));
  navPages = nav.pages || [];
} catch (_) {}

const index = [];
const seen  = new Set();

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { walk(full); continue; }
    if (!e.name.endsWith('.html')) continue;

    const relPath = path.relative(ROOT, full).replace(/\\/g, '/');
    if (shouldSkip(relPath)) continue;

    const url = toCleanUrl(relPath);
    if (seen.has(url)) continue;
    seen.add(url);

    const html  = fs.readFileSync(full, 'utf8');
    if (!html.includes('class="site-header"')) continue; // skip non-site pages

    const title   = extractTitle(html);
    const desc    = extractDesc(html);
    const h1      = extractH1(html);
    const cat     = urlToCategory(url);
    const navMeta = navPages.find(p => p.url === url) || {};

    index.push({
      url,
      title:       title || h1 || url,
      description: desc,
      h1,
      category:    cat,
      readingTime: navMeta.readingTime || null,
      updated:     navMeta.lastReviewed || null,
      keywords:    generateKeywords(title, h1, navMeta.tags),
    });
  }
}

walk(ROOT);

// Sort: calculators first by category order, then alphabetically
const CAT_ORDER = ['Calculators','Charts','Resources','Academy','Formula Library','Glossary','Reference','Guides','Comparisons','Methodology','About','Other'];
index.sort((a, b) => {
  const ai = CAT_ORDER.indexOf(a.category); const bi = CAT_ORDER.indexOf(b.category);
  if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  return a.url.localeCompare(b.url);
});

// ── Add canonical dataset entries ─────────────────────────────────────────────
// Dataset docs are generated at /reference/datasets/<name>/ but lack site-header,
// so we add them here directly from their JSON metadata.

const DATASETS_DIR = path.join(ROOT, 'data', 'datasets');
const DATASET_TITLES = {
  'chemical-ranges':       'Chemical Ranges — Canonical Dataset',
  'hot-tub-ranges':        'Hot Tub Ranges — Canonical Dataset',
  'water-balance':         'Water Balance (LSI) — Canonical Dataset',
  'dosage-matrices':       'Dosage Matrices — Canonical Dataset',
  'chemical-properties':   'Chemical Properties — Canonical Dataset',
  'compatibility':         'Chemical Compatibility — Canonical Dataset',
  'units':                 'Units — Canonical Dataset',
  'conversion-factors':    'Conversion Factors — Canonical Dataset',
  'temperature-guidelines':'Temperature Guidelines — Canonical Dataset',
  'testing-frequency':     'Testing Frequency — Canonical Dataset',
  'pool-types':            'Pool Types — Canonical Dataset',
  'water-problems':        'Water Problems — Canonical Dataset',
  'maintenance-schedules': 'Maintenance Schedules — Canonical Dataset',
  'confidence-levels':     'Confidence Levels — Canonical Dataset',
  'version':               'Version Registry — Canonical Dataset',
};

if (fs.existsSync(DATASETS_DIR)) {
  Object.entries(DATASET_TITLES).forEach(([name, title]) => {
    const fp = path.join(DATASETS_DIR, name + '.json');
    if (!fs.existsSync(fp)) return;
    let ds;
    try { ds = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (_) { return; }
    const url = `/reference/datasets/${name}`;
    if (!seen.has(url)) {
      seen.add(url);
      const recordCount = ds.records ? ds.records.length : 0;
      index.push({
        url,
        title,
        description: ds.description || '',
        h1: title,
        category: 'Reference',
        readingTime: null,
        updated: ds.lastReviewed || null,
        keywords: generateKeywords(title, ds.description || '', ['dataset', 'canonical', 'data-layer', name]),
      });
    }
  });
}

fs.writeFileSync(path.join(DATA_DIR, 'search-index.json'), JSON.stringify(index, null, 2), 'utf8');
console.log(`generate-search-index: indexed ${index.length} pages → data/search-index.json`);
