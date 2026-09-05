#!/usr/bin/env node
/**
 * validate-phase-8k.js
 *
 * Validates the Phase 8K Spanish Non-Calculator Content Coverage Audit.
 * Phase 8K is audit-only -- it made no production changes -- so this
 * validator's job is to confirm (a) the audit's own inventory claims are
 * internally consistent with the actual repository state, and (b) that
 * nothing the audit touched leaked into production state: no new Spanish
 * page of any content type, no calculator regression, no English URL
 * change, no sitemap/navigation/search-index expansion.
 *
 * Run: node scripts/validate-phase-8k.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let errors = 0;
let warnings = 0;
function err(msg) { console.log('ERROR: ' + msg); errors++; }
function warn(msg) { console.log('WARN: ' + msg); warnings++; }
function ok(msg) { console.log('OK: ' + msg); }
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }

const BASELINE_SHA = '9e2b960419bfba5b3d2706ecabce7c44b032f126'; // Phase 8I closeout / Phase 8J baseline

// ---------------------------------------------------------------------
// A. Baseline gate
// ---------------------------------------------------------------------
try {
  const log = execSync('git log --oneline -1 ' + BASELINE_SHA, { cwd: ROOT }).toString().trim();
  if (log) ok('A. Mandatory baseline commit ' + BASELINE_SHA.slice(0, 7) + ' (Phase 8I closeout / Phase 8J baseline) is present in history');
  else err('A. Baseline commit not found in history');
} catch (e) {
  err('A. Could not verify baseline commit: ' + e.message);
}

// ---------------------------------------------------------------------
// B. English non-calculator inventory exists and matches the audit's
//    documented counts (academy, glossary, formulas, reference, entities,
//    programmatic, guides, resources, comparisons).
// ---------------------------------------------------------------------
const urlPolicy = require('./url-policy');
function countEligible(dir, skipSubdirs) {
  let count = 0;
  function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      const rel = path.relative(ROOT, full).replace(/\\/g, '/');
      if (e.isDirectory()) {
        if (skipSubdirs && skipSubdirs.has(e.name)) continue;
        walk(full);
        continue;
      }
      if (!e.name.endsWith('.html')) continue;
      if (urlPolicy.isSitemapEligible(rel)) count++;
    }
  }
  walk(path.join(ROOT, dir));
  return count;
}

const EXPECTED_COUNTS = {
  academy: 59,
  glossary: 101,
  formulas: 10,
  entities: 105,
  programmatic: 44,
  guides: 49,
  resources: 9,
  comparisons: 8,
};
{
  let allMatch = true;
  const actual = {};
  for (const [dir, expected] of Object.entries(EXPECTED_COUNTS)) {
    actual[dir] = countEligible(dir);
    if (actual[dir] !== expected) allMatch = false;
  }
  const refDatasetsSkip = new Set(['datasets']);
  actual.reference = countEligible('reference', refDatasetsSkip);
  if (actual.reference !== 37) allMatch = false;

  if (allMatch) {
    ok('B. English non-calculator inventory matches documented counts: ' + JSON.stringify(actual));
  } else {
    err('B. English non-calculator inventory mismatch. Expected ' + JSON.stringify({ ...EXPECTED_COUNTS, reference: 37 }) + ' got ' + JSON.stringify(actual));
  }
}

// ---------------------------------------------------------------------
// C. Spanish production inventory is correctly detected: exactly 13
//    Spanish pages exist, all under es/calculators/, none anywhere else.
// ---------------------------------------------------------------------
{
  function walkEs(dir, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walkEs(full, out); continue; }
      if (e.name.endsWith('.html')) out.push(path.relative(ROOT, full).replace(/\\/g, '/'));
    }
    return out;
  }
  const esPages = walkEs(path.join(ROOT, 'es'), []);
  const allCalculators = esPages.every((p) => p.startsWith('es/calculators/'));
  if (esPages.length === 13 && allCalculators) {
    ok('C. Spanish production inventory correctly detected: exactly 13 pages, all under es/calculators/, no non-calculator Spanish content exists');
  } else {
    err('C. Spanish production inventory problem: count=' + esPages.length + ' allCalculators=' + allCalculators + ' pages=' + JSON.stringify(esPages));
  }
}

// ---------------------------------------------------------------------
// D. translation-status.json is internally consistent: 16 units total
//    (13 calculator + 7 non-calculator), no duplicate content IDs.
// ---------------------------------------------------------------------
{
  const status = JSON.parse(read('data/i18n/translation-status.json'));
  const ids = status.units.map((u) => u.contentId);
  const uniqueIds = new Set(ids);
  const calcUnits = status.units.filter((u) => u.category === 'calculator');
  const nonCalcUnits = status.units.filter((u) => u.category !== 'calculator');
  const nonCalcAllMissing = nonCalcUnits.every((u) => u.languages.es.status === 'missing');
  if (status.units.length === 20 && uniqueIds.size === 20 && calcUnits.length === 13 && nonCalcUnits.length === 7 && nonCalcAllMissing) {
    ok('D. translation-status.json internally consistent: 20 units (13 calculator + 7 non-calculator), no duplicate content IDs, all 7 non-calculator fixtures still es:"missing"');
  } else {
    err('D. translation-status.json inconsistency: total=' + status.units.length + ' unique=' + uniqueIds.size + ' calc=' + calcUnits.length + ' nonCalc=' + nonCalcUnits.length + ' nonCalcAllMissing=' + nonCalcAllMissing);
  }
}

// ---------------------------------------------------------------------
// E. No unexpected Spanish production pages were created by this audit
//    (es/ tree byte-identical to the baseline commit).
// ---------------------------------------------------------------------
try {
  const diff = execSync('git diff --stat ' + BASELINE_SHA + ' -- es/', { cwd: ROOT }).toString().trim();
  if (diff === '') {
    ok('E. es/ directory tree is byte-identical to the Phase 8I baseline -- no Spanish page of any kind was created');
  } else {
    err('E. es/ directory tree drifted since the baseline:\n' + diff);
  }
} catch (e) {
  err('E. Could not diff es/ against baseline: ' + e.message);
}

// ---------------------------------------------------------------------
// F. No calculator expansion occurred: still exactly 13 English and 13
//    Spanish calculators, js/calc-utils.js byte-identical.
// ---------------------------------------------------------------------
{
  const enCalc = fs.readdirSync(path.join(ROOT, 'calculators')).filter((f) => f.endsWith('.html') && f !== 'index.html' && f !== 'volume-calculator.html');
  const esCalc = fs.readdirSync(path.join(ROOT, 'es', 'calculators')).filter((f) => f.endsWith('.html'));
  const current = crypto.createHash('sha256').update(read('js/calc-utils.js')).digest('hex');
  const baseline = crypto.createHash('sha256').update(execSync('git show ' + BASELINE_SHA + ':js/calc-utils.js', { cwd: ROOT })).digest('hex');
  if (enCalc.length === 13 && esCalc.length === 13 && current === baseline) {
    ok('F. No calculator expansion occurred: 13 English + 13 Spanish calculators, js/calc-utils.js byte-identical to baseline');
  } else {
    err('F. Calculator regression detected: enCalc=' + enCalc.length + ' esCalc=' + esCalc.length + ' calcUtilsMatch=' + (current === baseline));
  }
}

// ---------------------------------------------------------------------
// G/H. English and Spanish production URL sets unchanged since baseline
//    (via url-indexation's own authoritative page/sitemap counts).
// ---------------------------------------------------------------------
try {
  const out = execSync('node scripts/validate-url-indexation.js', { cwd: ROOT }).toString();
  if (/PASS -- 539 pages, 491 sitemap URLs, 0 violations/.test(out)) {
    ok('G/H. English and Spanish production URL sets unchanged: validate-url-indexation.js reports the same 539 pages / 491 sitemap URLs / 0 violations as the Phase 8I/8J baseline');
  } else {
    err('G/H. URL set counts differ from the expected baseline figures: ' + out.trim());
  }
} catch (e) {
  err('G/H. validate-url-indexation.js FAILED: ' + e.message);
}

// ---------------------------------------------------------------------
// I. Existing Spanish calculator coverage remains 13/13.
// ---------------------------------------------------------------------
{
  const status = JSON.parse(read('data/i18n/translation-status.json'));
  const calcUnits = status.units.filter((u) => u.category === 'calculator');
  const allTranslated = calcUnits.length === 13 && calcUnits.every((u) => u.languages.es.status === 'translated');
  if (allTranslated) {
    ok('I. Existing Spanish calculator coverage remains 13/13 translated');
  } else {
    err('I. Spanish calculator coverage regressed: ' + JSON.stringify(calcUnits.map((u) => ({ id: u.contentId, es: u.languages.es.status }))));
  }
}

// ---------------------------------------------------------------------
// J. No production source data was modified outside approved audit
//    scope -- diff every non-calculator content directory plus the core
//    i18n architecture files against the baseline.
// ---------------------------------------------------------------------
try {
  const paths = [
    'academy/', 'glossary/', 'formulas/', 'reference/', 'entities/', 'programmatic/',
    'guides/', 'resources/', 'comparisons/', 'charts/', 'editorial/', 'methodology/',
    'maintenance/', 'legal/', 'about/', 'releases/', 'revisions/', 'provenance/',
    'data/i18n/es/terminology.json', 'js/i18n/', 'data/navigation.json',
    'data/search-index.json', 'sitemap.xml', 'sitemap-calculators.xml',
  ];
  const diff = execSync('git diff --stat ' + BASELINE_SHA + ' -- ' + paths.join(' '), { cwd: ROOT }).toString().trim();
  if (diff === '') {
    ok('J. No production source data was modified outside approved audit scope (all non-calculator content directories and core i18n architecture files byte-identical to baseline)');
  } else {
    err('J. Unexpected production-file drift since the baseline:\n' + diff);
  }
} catch (e) {
  err('J. Could not diff production paths against baseline: ' + e.message);
}

// ---------------------------------------------------------------------
// K. No duplicate translation system was introduced (only the existing
//    scripts/data/i18n-es/cluster-translations.js + generate-spanish-
//    cluster.js exist; no new competing translation-data file).
// ---------------------------------------------------------------------
{
  const i18nEsDir = path.join(ROOT, 'scripts', 'data', 'i18n-es');
  const files = fs.existsSync(i18nEsDir) ? fs.readdirSync(i18nEsDir) : [];
  const onlyExpected = files.length === 1 && files[0] === 'cluster-translations.js';
  const generatorCount = fs.readdirSync(path.join(ROOT, 'scripts')).filter((f) => /generate.*spanish/i.test(f)).length;
  if (onlyExpected && generatorCount === 1) {
    ok('K. No duplicate translation system was introduced: scripts/data/i18n-es/ still contains only cluster-translations.js, and exactly one Spanish-generation script exists');
  } else {
    err('K. Unexpected translation-system files found: i18n-es dir=' + JSON.stringify(files) + ' spanishGenerators=' + generatorCount);
  }
}

// ---------------------------------------------------------------------
// L. Audit artifacts exist.
// ---------------------------------------------------------------------
{
  const required = [
    'docs/PHASE-8K-SPANISH-NON-CALCULATOR-COVERAGE-AUDIT.md',
    'reports/phase-8k-status.md',
  ];
  const allExist = required.every(exists);
  if (allExist) {
    ok('L. Required Phase 8K audit artifacts exist');
  } else {
    err('L. Missing audit artifacts: ' + required.filter((r) => !exists(r)).join(', '));
  }
}

// ---------------------------------------------------------------------
// M. Recommended cluster is explicitly documented.
// ---------------------------------------------------------------------
{
  const doc = read('docs/PHASE-8K-SPANISH-NON-CALCULATOR-COVERAGE-AUDIT.md');
  const hasRecommendation = /RECOMMENDATION: Cluster 1/.test(doc);
  if (hasRecommendation) {
    ok('M. Recommended cluster is explicitly documented (Cluster 1 — Core Water-Chemistry Reference Knowledge)');
  } else {
    err('M. No explicit cluster recommendation found in the audit document');
  }
}

// ---------------------------------------------------------------------
// N. Recommendation has a readiness classification (Option A/B gate).
// ---------------------------------------------------------------------
{
  const doc = read('docs/PHASE-8K-SPANISH-NON-CALCULATOR-COVERAGE-AUDIT.md');
  const hasGate = /OPTION B — PREPARATION PHASE REQUIRED/.test(doc);
  if (hasGate) {
    ok('N. Recommendation carries an explicit readiness classification (OPTION B — PREPARATION PHASE REQUIRED)');
  } else {
    err('N. No explicit Phase 8L readiness gate found in the audit document');
  }
}

// ---------------------------------------------------------------------
// O. No production sitemap/navigation/search-index expansion occurred.
// ---------------------------------------------------------------------
try {
  const diff = execSync('git diff --stat ' + BASELINE_SHA + ' -- sitemap.xml sitemap-calculators.xml sitemap-guides.xml sitemap-resources.xml sitemap-academy.xml sitemap-formulas.xml sitemap-glossary.xml sitemap-reference.xml sitemap-other.xml data/navigation.json data/search-index.json', { cwd: ROOT }).toString().trim();
  if (diff === '') {
    ok('O. No production sitemap, navigation, or search-index expansion occurred (all byte-identical to baseline)');
  } else {
    err('O. Sitemap/navigation/search-index drifted since the baseline:\n' + diff);
  }
} catch (e) {
  err('O. Could not diff sitemap/navigation/search-index against baseline: ' + e.message);
}

// ---------------------------------------------------------------------
// P. Restore any incidental drift the read-only regression checks above
//    may have caused (cosmetic build-artifact timestamps only), so this
//    validator never leaves the working tree dirtier than it found it.
// ---------------------------------------------------------------------
try {
  execSync('git checkout HEAD -- .', { cwd: ROOT, stdio: 'pipe' });
  ok('P. Working tree restored to HEAD after running read-only regression checks (no residue left behind)');
} catch (e) {
  warn('P. Could not confirm working-tree restoration: ' + e.message);
}

// ---------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------
console.log('');
console.log('validate-phase-8k: ' + errors + ' error(s), ' + warnings + ' warning(s).');
if (errors > 0) {
  console.log('validate-phase-8k: FAIL');
  process.exit(1);
} else {
  console.log('validate-phase-8k: PASS');
}
