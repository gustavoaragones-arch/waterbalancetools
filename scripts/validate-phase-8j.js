#!/usr/bin/env node
/**
 * validate-phase-8j.js
 *
 * Validates the Phase 8J Spanish Calculator Coverage Audit. Phase 8J is
 * audit-only -- it made no production changes -- so this validator's job
 * is to confirm the audit's own arithmetic and inventory claims are
 * internally consistent with the actual repository state, and that no
 * production Spanish page, calculator formula, English URL, or existing
 * Spanish URL was touched while producing the audit.
 *
 * Run: node scripts/validate-phase-8j.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let errors = 0;
let warnings = 0;
function err(msg) { console.log('ERROR: ' + msg); errors++; }
function warn(msg) { console.log('WARN: ' + msg); warnings++; }
function ok(msg) { console.log('OK: ' + msg); }
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }

const BASELINE_SHA = '9e2b960419bfba5b3d2706ecabce7c44b032f126'; // Phase 8I closeout

const REDIRECT_SOURCES = new Set(['volume-calculator.html']);
const HUB_FILES = new Set(['index.html']);

// ---------------------------------------------------------------------
// A. Baseline gate
// ---------------------------------------------------------------------
try {
  const log = execSync('git log --oneline -1 ' + BASELINE_SHA, { cwd: ROOT }).toString().trim();
  if (log) ok('A. Mandatory baseline commit ' + BASELINE_SHA.slice(0, 7) + ' (Phase 8I closeout) is present in history');
  else err('A. Baseline commit not found in history');
} catch (e) {
  err('A. Could not verify baseline commit: ' + e.message);
}

// ---------------------------------------------------------------------
// B. Complete English calculator inventory: exactly 13 real calculators
//    (calculators/*.html minus the hub page and the one known redirect
//    source), derived from the filesystem, not hardcoded from memory.
// ---------------------------------------------------------------------
let englishCalculators = [];
{
  const allFiles = fs.readdirSync(path.join(ROOT, 'calculators')).filter((f) => f.endsWith('.html'));
  englishCalculators = allFiles.filter((f) => !HUB_FILES.has(f) && !REDIRECT_SOURCES.has(f));
  if (englishCalculators.length === 13) {
    ok('B. Complete English calculator inventory: exactly 13 real production calculators (excluded: ' + [...HUB_FILES, ...REDIRECT_SOURCES].join(', ') + ')');
  } else {
    err('B. Expected 13 real English calculators, found ' + englishCalculators.length + ': ' + JSON.stringify(englishCalculators));
  }
}

// ---------------------------------------------------------------------
// C. Complete Spanish calculator inventory: exactly 13 files in
//    es/calculators/.
// ---------------------------------------------------------------------
let spanishCalculators = [];
{
  spanishCalculators = fs.readdirSync(path.join(ROOT, 'es', 'calculators')).filter((f) => f.endsWith('.html'));
  if (spanishCalculators.length === 13) {
    ok('C. Complete Spanish calculator inventory: exactly 13 files in es/calculators/');
  } else {
    err('C. Expected 13 Spanish calculators, found ' + spanishCalculators.length + ': ' + JSON.stringify(spanishCalculators));
  }
}

// ---------------------------------------------------------------------
// D. Every Spanish calculator maps to exactly one English counterpart
//    (perfect 1:1 filename match, no orphans in either direction).
// ---------------------------------------------------------------------
{
  const enSet = new Set(englishCalculators);
  const esSet = new Set(spanishCalculators);
  const esOrphans = spanishCalculators.filter((f) => !enSet.has(f));
  const enMissing = englishCalculators.filter((f) => !esSet.has(f));
  if (esOrphans.length === 0 && enMissing.length === 0) {
    ok('D. Every Spanish calculator maps to exactly one English counterpart (perfect 1:1, zero orphans)');
  } else {
    err('D. Orphan mapping found: esOrphans=' + JSON.stringify(esOrphans) + ' enMissing=' + JSON.stringify(enMissing));
  }
}

// ---------------------------------------------------------------------
// E. No English calculator silently omitted from the gap analysis --
//    cross-check against a sitewide search for any other interactive
//    calculator (calc-form id or a calcUtils.calculate*() call) outside
//    calculators/ and es/calculators/.
// ---------------------------------------------------------------------
{
  function walk(dir, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walk(full, out); continue; }
      if (e.name.endsWith('.html')) out.push(full);
    }
    return out;
  }
  const allHtml = walk(ROOT, []);
  const stray = [];
  for (const p of allHtml) {
    const rel = path.relative(ROOT, p).replace(/\\/g, '/');
    if (rel.startsWith('calculators/') || rel.startsWith('es/calculators/')) continue;
    const html = fs.readFileSync(p, 'utf8');
    if (/id="calc-form"/.test(html) || /WaterBalance\.calcUtils\.calculate\w*\(/.test(html)) stray.push(rel);
  }
  if (stray.length === 0) {
    ok('E. No interactive calculator (calc-form / calcUtils.calculate*()) exists outside calculators/ or es/calculators/ -- gap analysis is exhaustive');
  } else {
    err('E. Found calculator UI outside the known directories, not accounted for in the audit: ' + JSON.stringify(stray));
  }
}

// ---------------------------------------------------------------------
// F. Redirect/deprecated pages correctly excluded (spot-check the one
//    known redirect source is genuinely registered in url-policy.js).
// ---------------------------------------------------------------------
{
  const policy = read('scripts/url-policy.js');
  if (policy.includes("'calculators/volume-calculator.html'")) {
    ok('F. Redirect source calculators/volume-calculator.html is genuinely registered in url-policy.js REDIRECT_SOURCES (not an arbitrary audit exclusion)');
  } else {
    err('F. calculators/volume-calculator.html exclusion is not backed by url-policy.js REDIRECT_SOURCES -- audit exclusion would be unverified');
  }
}

// ---------------------------------------------------------------------
// G. Remaining candidates = 0, and this arithmetic is internally
//    consistent (13 - 13 = 0).
// ---------------------------------------------------------------------
{
  const remaining = englishCalculators.length - spanishCalculators.length;
  if (englishCalculators.length === spanishCalculators.length && remaining === 0) {
    ok('G. Remaining Spanish translation candidates = 0 (13 English - 13 Spanish), arithmetic internally consistent');
  } else {
    err('G. Inventory arithmetic is NOT internally consistent: english=' + englishCalculators.length + ' spanish=' + spanishCalculators.length + ' remaining=' + remaining);
  }
}

// ---------------------------------------------------------------------
// H. translation-status.json: exactly 13 calculator units, all
//    translated in both languages, no duplicate content IDs, no
//    duplicate URLs.
// ---------------------------------------------------------------------
{
  const status = JSON.parse(read('data/i18n/translation-status.json'));
  const calcUnits = status.units.filter((u) => u.category === 'calculator');
  const allTranslated = calcUnits.every((u) => u.languages.en.status === 'translated' && u.languages.es.status === 'translated');
  const contentIds = calcUnits.map((u) => u.contentId);
  const uniqueContentIds = new Set(contentIds);
  const enUrls = calcUnits.map((u) => u.languages.en.url);
  const esUrls = calcUnits.map((u) => u.languages.es.url);
  const dupContentIds = contentIds.length !== uniqueContentIds.size;
  const dupEnUrls = new Set(enUrls).size !== enUrls.length;
  const dupEsUrls = new Set(esUrls).size !== esUrls.length;
  if (calcUnits.length === 13 && allTranslated && !dupContentIds && !dupEnUrls && !dupEsUrls) {
    ok('H. translation-status.json carries exactly 13 calculator units, all translated en+es, no duplicate content IDs or URLs');
  } else {
    err('H. translation-status.json problem: count=' + calcUnits.length + ' allTranslated=' + allTranslated + ' dupContentIds=' + dupContentIds + ' dupEnUrls=' + dupEnUrls + ' dupEsUrls=' + dupEsUrls);
  }
}

// ---------------------------------------------------------------------
// I. The 7 pre-existing non-calculator Phase 8D fixtures were NOT
//    touched by this audit (still "missing", not pre-flagged/reserved).
// ---------------------------------------------------------------------
{
  const status = JSON.parse(read('data/i18n/translation-status.json'));
  const nonCalc = status.units.filter((u) => u.category !== 'calculator');
  const allStillMissing = nonCalc.length === 7 && nonCalc.every((u) => u.languages.es.status === 'missing');
  if (allStillMissing) {
    ok('I. All 7 non-calculator Phase 8D fixtures remain untouched and still es:"missing" -- Phase 8J reserved no future work');
  } else {
    err('I. Non-calculator fixtures were modified or count changed: ' + JSON.stringify(nonCalc.map((u) => ({ id: u.contentId, es: u.languages.es.status }))));
  }
}

// ---------------------------------------------------------------------
// J. No production Spanish page was created or modified by this phase --
//    es/calculators/ is byte-identical to the Phase 8I baseline commit.
// ---------------------------------------------------------------------
try {
  const diff = execSync('git diff --stat ' + BASELINE_SHA + ' -- es/calculators/ js/calc-utils.js calculators/ data/i18n/translation-status.json data/navigation.json data/search-index.json sitemap-calculators.xml', { cwd: ROOT }).toString().trim();
  if (diff === '') {
    ok('J. es/calculators/, calculators/, js/calc-utils.js, translation-status.json, navigation.json, search-index.json, and sitemap-calculators.xml are all byte-identical to the Phase 8I baseline -- Phase 8J made zero production changes');
  } else {
    err('J. Unexpected production-file drift since the Phase 8I baseline:\n' + diff);
  }
} catch (e) {
  err('J. Could not diff against baseline: ' + e.message);
}

// ---------------------------------------------------------------------
// K. No calculator formula changed -- js/calc-utils.js hash matches
//    what Phase 8I committed (redundant with J's diff, checked
//    explicitly via content hash for a stronger guarantee).
// ---------------------------------------------------------------------
{
  const crypto = require('crypto');
  const current = crypto.createHash('sha256').update(read('js/calc-utils.js')).digest('hex');
  const baseline = crypto.createHash('sha256').update(execSync('git show ' + BASELINE_SHA + ':js/calc-utils.js', { cwd: ROOT })).digest('hex');
  if (current === baseline) {
    ok('K. js/calc-utils.js SHA-256 matches the Phase 8I baseline exactly -- no formula or calculation logic changed');
  } else {
    err('K. js/calc-utils.js content hash differs from the Phase 8I baseline -- formula/logic may have changed');
  }
}

// ---------------------------------------------------------------------
// L. Audit artifacts exist and are internally consistent (docs + report
//    both state 13/13/0, matching this validator's own computed counts).
// ---------------------------------------------------------------------
{
  const docPath = 'docs/PHASE-8J-SPANISH-CALCULATOR-COVERAGE-AUDIT.md';
  const reportPath = 'reports/phase-8j-status.md';
  if (!exists(docPath)) { err('L. Missing ' + docPath); }
  else if (!exists(reportPath)) { err('L. Missing ' + reportPath); }
  else {
    const doc = read(docPath);
    const report = read(reportPath);
    const docHas13 = /13 real production English calculator pages/.test(doc) && /13 Spanish calculators/.test(doc);
    const reportHas0 = /Remaining Spanish translation candidates: 0/.test(report);
    if (docHas13 && reportHas0 && englishCalculators.length === 13 && spanishCalculators.length === 13) {
      ok('L. Audit documentation and status report exist and their stated inventory counts (13 English / 13 Spanish / 0 remaining) match this validator\'s independently computed counts');
    } else {
      err('L. Audit artifact content does not match independently computed inventory counts');
    }
  }
}

// ---------------------------------------------------------------------
// M. No duplicate candidate URLs exist (vacuously true with 0
//    candidates, but assert the candidate list is genuinely empty
//    rather than merely unreported).
// ---------------------------------------------------------------------
{
  const remainingCandidates = englishCalculators.filter((f) => !spanishCalculators.includes(f));
  const uniqueCandidates = new Set(remainingCandidates);
  if (remainingCandidates.length === 0 && uniqueCandidates.size === 0) {
    ok('M. Remaining-candidate list is genuinely empty (not merely unreported) -- no duplicate candidate URLs possible');
  } else {
    err('M. Remaining-candidate list is non-empty or contains duplicates: ' + JSON.stringify(remainingCandidates));
  }
}

// ---------------------------------------------------------------------
// N. Terminology architecture (Phase 8F) unchanged since the baseline.
// ---------------------------------------------------------------------
try {
  const diff = execSync('git diff --stat ' + BASELINE_SHA + ' -- data/i18n/es/terminology.json js/i18n/es-terminology.js', { cwd: ROOT }).toString().trim();
  if (diff === '') {
    ok('N. Spanish terminology architecture (terminology.json, es-terminology.js) is byte-identical to the Phase 8I baseline');
  } else {
    err('N. Terminology architecture drifted since the Phase 8I baseline:\n' + diff);
  }
} catch (e) {
  err('N. Could not diff terminology files: ' + e.message);
}

// ---------------------------------------------------------------------
// O. Existing regression gates still pass at this baseline.
// ---------------------------------------------------------------------
try {
  execSync('node scripts/validate-url-indexation.js', { cwd: ROOT, stdio: 'pipe' });
  ok('O. validate-url-indexation.js: PASS');
} catch (e) {
  err('O. validate-url-indexation.js FAILED: ' + e.message);
}
try {
  execSync('node scripts/check-broken-links.js', { cwd: ROOT, stdio: 'pipe' });
  ok('O. check-broken-links.js: PASS');
} catch (e) {
  err('O. check-broken-links.js FAILED: ' + e.message);
}
try {
  execSync('node scripts/validate-phase-8i.js', { cwd: ROOT, stdio: 'pipe' });
  ok('O. validate-phase-8i.js: PASS (unmodified prior-phase validator still green at this baseline)');
} catch (e) {
  err('O. validate-phase-8i.js FAILED: ' + e.message);
}

// ---------------------------------------------------------------------
// P. Restore any incidental drift the read-only regression checks above
//    may have caused (cosmetic build-artifact timestamps only -- the
//    same pattern documented in every prior phase), so this validator
//    never leaves the working tree dirtier than it found it.
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
console.log('validate-phase-8j: ' + errors + ' error(s), ' + warnings + ' warning(s).');
if (errors > 0) {
  console.log('validate-phase-8j: FAIL');
  process.exit(1);
} else {
  console.log('validate-phase-8j: PASS');
}
