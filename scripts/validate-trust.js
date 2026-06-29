#!/usr/bin/env node
/**
 * validate-trust.js
 *
 * Validates the Scientific Authority System (Phase 5B).
 * Rejects build if any trust component is missing or broken.
 *
 * Checks:
 *  1. All data/trust/*.json files exist and are parseable.
 *  2. Five confidence levels exist (very-high, high, moderate, limited, informational).
 *  3. Six source categories exist.
 *  4. All required editorial pages exist.
 *  5. All required methodology pages exist.
 *  6. /provenance/index.html and /revisions/index.html exist.
 *  7. All calculator files have a trust panel injected.
 *  8. All formula pages have a version badge.
 *  9. All dataset doc pages have a dataset panel.
 * 10. Every formula record in formulas.json references a known confidence level.
 * 11. Every calculator record references a known confidence level.
 * 12. Formula versions are present and non-empty.
 * 13. All trust partials exist.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT   = path.join(__dirname, '..');
const TRUST  = path.join(ROOT, 'data', 'trust');

let errors = 0, warnings = 0;
function fail(m) { console.error(`  FAIL: ${m}`); errors++; }
function warn(m) { console.warn(`  WARN: ${m}`); warnings++; }
function ok(m)   { console.log(`  ✓ ${m}`); }

// ── 1. Trust JSON files ───────────────────────────────────────────────────────

const REQUIRED_TRUST_FILES = ['confidence', 'references', 'editorial', 'methodology', 'formulas', 'revisions', 'datasets'];
const trust = {};
REQUIRED_TRUST_FILES.forEach(name => {
  const fp = path.join(TRUST, name + '.json');
  if (!fs.existsSync(fp)) {
    fail(`Missing data/trust/${name}.json`);
  } else {
    try { trust[name] = JSON.parse(fs.readFileSync(fp, 'utf8')); ok(`data/trust/${name}.json`); }
    catch(e) { fail(`Cannot parse data/trust/${name}.json: ${e.message}`); }
  }
});

// ── 2. Five confidence levels ─────────────────────────────────────────────────

const REQUIRED_LEVELS = ['very-high', 'high', 'moderate', 'limited', 'informational'];
if (trust.confidence && trust.confidence.levels) {
  const ids = new Set(trust.confidence.levels.map(l => l.id));
  REQUIRED_LEVELS.forEach(id => {
    if (!ids.has(id)) fail(`Missing confidence level: "${id}"`);
  });
  if (REQUIRED_LEVELS.every(id => ids.has(id))) ok(`5 confidence levels present`);
}

// ── 3. Six source categories ──────────────────────────────────────────────────

const REQUIRED_CATS = ['government-guidance', 'industry-standards', 'manufacturer-documentation', 'scientific-literature', 'educational-resources', 'internal-dataset'];
if (trust.references && trust.references.categories) {
  const ids = new Set(trust.references.categories.map(c => c.id));
  REQUIRED_CATS.forEach(id => {
    if (!ids.has(id)) fail(`Missing source category: "${id}"`);
  });
  if (REQUIRED_CATS.every(id => ids.has(id))) ok('6 source categories present');
}

// ── 4. Editorial pages ────────────────────────────────────────────────────────

const REQUIRED_EDITORIAL = ['index', 'editorial-policy', 'content-standards', 'review-process', 'correction-policy', 'update-policy'];
REQUIRED_EDITORIAL.forEach(slug => {
  const fp = slug === 'index'
    ? path.join(ROOT, 'editorial', 'index.html')
    : path.join(ROOT, 'editorial', slug, 'index.html');
  if (!fs.existsSync(fp)) fail(`Missing editorial page: /editorial/${slug}/`);
});
ok(`${REQUIRED_EDITORIAL.length} editorial pages`);

// ── 5. Methodology pages ──────────────────────────────────────────────────────

const REQUIRED_METH = ['index', 'calculation-methodology', 'calculation-assumptions', 'formula-selection', 'rounding-policy', 'precision-policy', 'known-limitations', 'confidence-system'];
REQUIRED_METH.forEach(slug => {
  const fp = slug === 'index'
    ? path.join(ROOT, 'methodology', 'index.html')
    : path.join(ROOT, 'methodology', slug, 'index.html');
  if (!fs.existsSync(fp)) fail(`Missing methodology page: /methodology/${slug}/`);
});
ok(`${REQUIRED_METH.length} methodology pages`);

// ── 6. Provenance and revision pages ─────────────────────────────────────────

[path.join(ROOT, 'provenance', 'index.html'), path.join(ROOT, 'revisions', 'index.html')]
  .forEach(fp => {
    if (!fs.existsSync(fp)) fail(`Missing page: ${path.relative(ROOT, fp)}`);
  });
ok('provenance/index.html and revisions/index.html');

// ── 7. Calculators have trust panels ─────────────────────────────────────────

const CALC_DIR = path.join(ROOT, 'calculators');
let calcTotal = 0, calcWithPanel = 0;
if (fs.existsSync(CALC_DIR)) {
  for (const file of fs.readdirSync(CALC_DIR)) {
    if (!file.endsWith('.html') || file === 'index.html') continue;
    calcTotal++;
    const html = fs.readFileSync(path.join(CALC_DIR, file), 'utf8');
    if (html.includes('<!-- trust-panel:')) calcWithPanel++;
    else fail(`Calculator missing trust panel: calculators/${file}`);
  }
}
if (calcTotal > 0 && calcWithPanel === calcTotal) ok(`All ${calcTotal} calculators have trust panels`);

// ── 8. Formula pages have version badges ─────────────────────────────────────

const FORM_DIR = path.join(ROOT, 'formulas');
let formTotal = 0, formWithBadge = 0;
if (fs.existsSync(FORM_DIR)) {
  for (const file of fs.readdirSync(FORM_DIR)) {
    if (!file.endsWith('.html') || file === 'index.html') continue;
    formTotal++;
    const html = fs.readFileSync(path.join(FORM_DIR, file), 'utf8');
    if (html.includes('version-badge')) formWithBadge++;
    else warn(`Formula page missing version badge: formulas/${file}`);
  }
}
if (formTotal > 0) ok(`${formWithBadge}/${formTotal} formula pages have version badges`);

// ── 9. Dataset pages have dataset panels ─────────────────────────────────────

const DS_DIR = path.join(ROOT, 'reference', 'datasets');
let dsTotal = 0, dsWithPanel = 0;
if (fs.existsSync(DS_DIR)) {
  for (const e of fs.readdirSync(DS_DIR, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const fp = path.join(DS_DIR, e.name, 'index.html');
    if (!fs.existsSync(fp)) continue;
    dsTotal++;
    const html = fs.readFileSync(fp, 'utf8');
    if (html.includes('<!-- dataset-panel:')) dsWithPanel++;
    else warn(`Dataset page missing dataset panel: reference/datasets/${e.name}/`);
  }
}
if (dsTotal > 0) ok(`${dsWithPanel}/${dsTotal} dataset pages have dataset panels`);

// ── 10. Formula confidence levels valid ──────────────────────────────────────

if (trust.confidence && trust.formulas && trust.formulas.records) {
  const validLevels = new Set(trust.confidence.levels.map(l => l.id));
  trust.formulas.records.forEach(f => {
    if (!f.confidenceLevel) fail(`Formula [${f.id}] missing confidenceLevel`);
    else if (!validLevels.has(f.confidenceLevel)) fail(`Formula [${f.id}] unknown confidenceLevel: "${f.confidenceLevel}"`);
  });
  ok('All formula confidence levels valid');
}

// ── 11. Calculator confidence levels valid ────────────────────────────────────

if (trust.confidence && trust.datasets && trust.datasets.calculators) {
  const validLevels = new Set(trust.confidence.levels.map(l => l.id));
  trust.datasets.calculators.forEach(c => {
    if (!c.confidenceLevel) fail(`Calculator [${c.id}] missing confidenceLevel`);
    else if (!validLevels.has(c.confidenceLevel)) fail(`Calculator [${c.id}] unknown confidenceLevel: "${c.confidenceLevel}"`);
  });
  ok('All calculator confidence levels valid');
}

// ── 12. Formula versions present ─────────────────────────────────────────────

if (trust.formulas && trust.formulas.records) {
  trust.formulas.records.forEach(f => {
    if (!f.version) fail(`Formula [${f.id}] missing version`);
    if (!f.lastReviewed) warn(`Formula [${f.id}] missing lastReviewed`);
  });
  ok(`${trust.formulas.records.length} formula records have versions`);
}

// ── 13. Trust partials exist ──────────────────────────────────────────────────

const REQUIRED_PARTIALS = [
  'trust-panel.html', 'dataset-panel.html', 'formula-panel.html',
  'revision-panel.html', 'methodology-panel.html', 'confidence-panel.html', 'sources-panel.html',
];
const PART_DIR = path.join(ROOT, 'partials');
REQUIRED_PARTIALS.forEach(name => {
  if (!fs.existsSync(path.join(PART_DIR, name))) fail(`Missing partial: partials/${name}`);
});
ok(`${REQUIRED_PARTIALS.length} trust partials exist`);

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\nvalidate-trust: checked ${Object.keys(trust).length} trust files`);
if (errors > 0 || warnings > 0) console.log(`  ${errors} error(s), ${warnings} warning(s)`);

if (errors > 0) {
  console.error('\nvalidate-trust: FAILED');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('\nvalidate-trust: PASSED with warnings');
} else {
  console.log('\nvalidate-trust: PASSED — 0 errors, 0 warnings');
}
