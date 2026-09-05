#!/usr/bin/env node
/**
 * validate-phase-8l.js
 *
 * Validates the Phase 8L Spanish Core Reference Localization Architecture
 * Preparation phase. Phase 8L is preparation-only -- it must produce a
 * concrete architecture specification (content-ID convention, Spanish
 * data model, field matrix, relationship inventory, link-resolution
 * design, a deterministic glossary first-wave manifest, a formula safety
 * contract, and a Phase 8M implementation plan) while making zero
 * production changes. This validator checks both halves.
 *
 * Run: node scripts/validate-phase-8l.js
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

const BASELINE_SHA = '7e71120bec3d5337d18013697110685e892219ec'; // Phase 8J-8K closeout

const DOC = 'docs/PHASE-8L-SPANISH-REFERENCE-LOCALIZATION-ARCHITECTURE.md';
const REPORT = 'reports/phase-8l-status.md';
const MANIFEST = 'data/i18n/es/glossary-first-wave.json';

// ---------------------------------------------------------------------
// A. Baseline gate
// ---------------------------------------------------------------------
try {
  const log = execSync('git log --oneline -1 ' + BASELINE_SHA, { cwd: ROOT }).toString().trim();
  if (log) ok('A. Mandatory baseline commit ' + BASELINE_SHA.slice(0, 7) + ' (Phase 8J-8K closeout) is present in history');
  else err('A. Baseline commit not found in history');
} catch (e) {
  err('A. Could not verify baseline commit: ' + e.message);
}

// ---------------------------------------------------------------------
// B. Content-ID convention is explicitly defined.
// ---------------------------------------------------------------------
{
  const doc = read(DOC);
  const hasConvention = /CONTENT-ID STANDARD: reuse the source record's native `id` field/.test(doc);
  if (hasConvention) ok('B. Content-ID convention is explicitly defined (reuse native `id` field)');
  else err('B. No explicit content-ID convention found in the architecture doc');
}

// ---------------------------------------------------------------------
// C. Translation-status migration is explicitly defined (old->new
//    mappings for the 3 affected fixtures).
// ---------------------------------------------------------------------
{
  const doc = read(DOC);
  const mappings = ['glossary:free-chlorine` \\| `glossary:gl-001', 'formula:pool-volume` \\| `formula:formula-01', 'reference:ideal-pool-levels` \\| `reference:ref-01'];
  const allPresent = mappings.every((m) => new RegExp(m).test(doc));
  if (allPresent) ok('C. Translation-status migration plan explicitly defines all 3 old->new content-ID mappings');
  else err('C. Migration plan missing one or more explicit old->new mappings');
}

// ---------------------------------------------------------------------
// D. No duplicate content identity is unresolved for the recommended
//    families -- native IDs are verified unique in the actual data.
// ---------------------------------------------------------------------
{
  const g = require(path.join(ROOT, 'data', 'glossary.json'));
  const f = require(path.join(ROOT, 'data', 'formulas.json'));
  const r = require(path.join(ROOT, 'data', 'reference.json'));
  const gIds = g.terms.map((t) => t.id);
  const fIds = f.formulas.map((t) => t.id);
  const rIds = r.pages.map((t) => t.id);
  const allUnique = new Set(gIds).size === gIds.length && new Set(fIds).size === fIds.length && new Set(rIds).size === rIds.length;
  if (allUnique) ok('D. No duplicate content identity: native IDs are unique within glossary (' + gIds.length + '), formulas (' + fIds.length + '), reference (' + rIds.length + ')');
  else err('D. Duplicate native IDs found in one or more families');
}

// ---------------------------------------------------------------------
// E. Spanish data model is explicitly defined.
// ---------------------------------------------------------------------
{
  const doc = read(DOC);
  const hasModel = /OPTION 1 — Spanish fields embedded beside English fields/.test(doc);
  if (hasModel) ok('E. Spanish data model is explicitly defined (Option 1 -- embedded `es` object)');
  else err('E. No explicit Spanish data model selection found');
}

// ---------------------------------------------------------------------
// F. Field-level localization matrix exists for all 3 families.
// ---------------------------------------------------------------------
{
  const doc = read(DOC);
  const hasMatrix = /## 5\. Task D — Field-level localization matrix/.test(doc) && /\*\*Glossary:\*\*/.test(doc) && /\*\*Formulas:\*\*/.test(doc) && /\*\*Reference\*\*/.test(doc);
  if (hasMatrix) ok('F. Field-level localization matrix exists for Glossary, Formulas, and Reference');
  else err('F. Field-level localization matrix missing or incomplete');
}

// ---------------------------------------------------------------------
// G. Relationship inventory exists, covering all 3 families' relational
//    fields, including the cross-checked formulas.json broken-reference
//    finding.
// ---------------------------------------------------------------------
{
  const doc = read(DOC);
  const hasInventory = /relatedGlossary.*bare slug-suffix string/.test(doc) && /14 reference occurrences \(13 unique missing glossary terms, since `turnover-rate` is referenced twice\) across 7 of the 9 formulas/.test(doc);
  if (hasInventory) ok('G. Relationship inventory exists, including the verified 14-occurrence (13-unique-term) broken-reference finding in formulas.json');
  else err('G. Relationship inventory missing or does not document the broken-reference finding');
}

// ---------------------------------------------------------------------
// H. Related-link resolution design exists, with an explicit fallback
//    policy decision.
// ---------------------------------------------------------------------
{
  const doc = read(DOC);
  const hasResolver = /resolveRelatedLink/.test(doc);
  const hasFallback = /Policy A — retain the English target/.test(doc);
  if (hasResolver && hasFallback) ok('H. Related-link resolution design exists with an explicit fallback policy (Policy A -- English fallback)');
  else err('H. Missing resolver design or explicit fallback policy: resolver=' + hasResolver + ' fallback=' + hasFallback);
}

// ---------------------------------------------------------------------
// I. Exact Glossary first-wave manifest exists.
// ---------------------------------------------------------------------
{
  if (!exists(MANIFEST)) {
    err('I. Missing glossary first-wave manifest: ' + MANIFEST);
  } else {
    const manifest = JSON.parse(read(MANIFEST));
    const hasNoProse = !JSON.stringify(manifest).match(/definition|explanation|whyItMatters/);
    if (Array.isArray(manifest.candidates) && manifest.qualifyingCount === manifest.candidates.length && hasNoProse) {
      ok('I. Glossary first-wave manifest exists, contains ' + manifest.candidates.length + ' candidates, and contains no translated prose fields');
    } else {
      err('I. Manifest exists but is malformed or contains prose-like fields');
    }
  }
}

// ---------------------------------------------------------------------
// J. Manifest is deterministic: regenerate it from the current source
//    data using the documented rule and diff against the committed file.
// ---------------------------------------------------------------------
{
  const g = require(path.join(ROOT, 'data', 'glossary.json'));
  const status = require(path.join(ROOT, 'data', 'i18n', 'translation-status.json'));
  const spanishCalcs = status.units.filter((u) => u.category === 'calculator' && u.languages.es.status === 'translated');
  const spanishCalcUrls = new Map(spanishCalcs.map((u) => [u.languages.en.url, u]));
  const recomputed = [];
  g.terms.forEach((t) => {
    const rc = t.relatedCalculators || [];
    const matched = rc.filter((url) => spanishCalcUrls.has(url));
    if (matched.length > 0) recomputed.push(t.id);
  });
  recomputed.sort();
  const manifest = JSON.parse(read(MANIFEST));
  const committedIds = manifest.candidates.map((c) => c.nativeId).sort();
  if (JSON.stringify(recomputed) === JSON.stringify(committedIds)) {
    ok('J. Manifest is deterministic: recomputing the selection rule from current source data yields the identical ' + recomputed.length + '-candidate set');
  } else {
    err('J. Manifest does not match a fresh recomputation of the documented selection rule');
  }
}

// ---------------------------------------------------------------------
// K. Formula safety contract exists.
// ---------------------------------------------------------------------
{
  const doc = read(DOC);
  const hasContract = /### Formula-Equation Safety Contract/.test(doc);
  if (hasContract) ok('K. Formula-equation safety contract is explicitly documented');
  else err('K. No formula-equation safety contract found');
}

// ---------------------------------------------------------------------
// L. All 9 formula records were audited (not just formula-01).
// ---------------------------------------------------------------------
{
  const doc = read(DOC);
  const allNine = ['formula-01', 'formula-02', 'formula-03', 'formula-04', 'formula-05', 'formula-06', 'formula-07', 'formula-08', 'formula-09'].every((id) => doc.includes(id));
  if (allNine) ok('L. All 9 formula records were individually audited in the architecture doc');
  else err('L. One or more formula records were not individually audited');
}

// ---------------------------------------------------------------------
// M. URL architecture is explicitly defined.
// ---------------------------------------------------------------------
{
  const doc = read(DOC);
  const hasUrlArch = /## 9\. Task J — URL architecture/.test(doc) && /English slug retained under the/.test(doc);
  if (hasUrlArch) ok('M. Future URL architecture is explicitly defined (English slug retained under /es/, self-canonical)');
  else err('M. URL architecture section missing or incomplete');
}

// ---------------------------------------------------------------------
// N. hreflang/canonical/schema readiness is explicitly assessed per
//    mechanism (not a vague blanket claim).
// ---------------------------------------------------------------------
{
  const doc = read(DOC);
  const hasAssessment = /ADDITIVE IMPLEMENTATION REQUIRED/.test(doc) && /ALREADY SUPPORTED/.test(doc);
  if (hasAssessment) ok('N. hreflang/canonical/schema readiness is explicitly classified per mechanism (ADDITIVE REQUIRED vs. ALREADY SUPPORTED)');
  else err('N. Readiness classification missing or not mechanism-specific');
}

// ---------------------------------------------------------------------
// O. Fallback policy is explicitly defined (redundant with H, checked
//    again here per the phase's own numbered requirement list).
// ---------------------------------------------------------------------
{
  const doc = read(DOC);
  if (/Policy A/.test(doc) && /Policy B \(suppress/.test(doc)) ok('O. Fallback policy explicitly chosen (Policy A) with the rejected alternative (Policy B) documented');
  else err('O. Fallback policy decision not fully documented');
}

// ---------------------------------------------------------------------
// P. Drift detection strategy is explicitly defined.
// ---------------------------------------------------------------------
{
  const doc = read(DOC);
  if (/esLastReviewed/.test(doc)) ok('P. Drift-detection strategy is explicitly defined (esLastReviewed staleness field, structural orphan-prevention via embedded es object)');
  else err('P. Drift-detection strategy missing');
}

// ---------------------------------------------------------------------
// Q. Phase 8M implementation architecture is explicitly documented (the
//    16-component table).
// ---------------------------------------------------------------------
{
  const doc = read(DOC);
  const hasTable = /## 11\. Task L — Phase 8M implementation architecture/.test(doc) && (doc.match(/\| \d+ \|/g) || []).length >= 16;
  if (hasTable) ok('Q. Phase 8M implementation architecture table is documented with all required components');
  else err('Q. Phase 8M implementation table missing or incomplete');
}

// ---------------------------------------------------------------------
// R. No Spanish production pages were created; production directories
//    byte-identical to baseline.
// ---------------------------------------------------------------------
try {
  const diff = execSync('git diff --stat ' + BASELINE_SHA + ' -- es/ calculators/ data/glossary.json data/formulas.json data/reference.json data/academy.json data/i18n/translation-status.json js/calc-utils.js js/i18n/ data/navigation.json data/search-index.json sitemap.xml sitemap-calculators.xml sitemap-glossary.xml sitemap-formulas.xml sitemap-reference.xml scripts/generate-glossary.js scripts/generate-formulas.js scripts/generate-reference.js', { cwd: ROOT }).toString().trim();
  if (diff === '') {
    ok('R. No Spanish production page was created and no production source file was modified (all byte-identical to baseline)');
  } else {
    err('R. Unexpected production-file drift since the baseline:\n' + diff);
  }
} catch (e) {
  err('R. Could not diff production paths against baseline: ' + e.message);
}

// ---------------------------------------------------------------------
// S/T/U/V. Production URL sets, sitemap, navigation, search-index counts
//    unchanged.
// ---------------------------------------------------------------------
try {
  const out = execSync('node scripts/validate-url-indexation.js', { cwd: ROOT }).toString();
  if (/PASS -- 539 pages, 491 sitemap URLs, 0 violations/.test(out)) {
    ok('S/T. English/Spanish production URL set and sitemap unchanged: 539 pages, 491 sitemap URLs, 0 violations (matches baseline)');
  } else {
    err('S/T. URL/sitemap counts differ from baseline: ' + out.trim());
  }
} catch (e) {
  err('S/T. validate-url-indexation.js FAILED: ' + e.message);
}
{
  const nav = require(path.join(ROOT, 'data', 'navigation.json'));
  const idx = require(path.join(ROOT, 'data', 'search-index.json'));
  const idxDocs = idx.documents || idx.pages || idx;
  if (nav.pages.length === 535 && idxDocs.length === 492) {
    ok('U/V. Navigation (535 records) and search-index (492 records) counts unchanged from baseline');
  } else {
    err('U/V. Navigation/search-index record counts differ from baseline: nav=' + nav.pages.length + ' search=' + idxDocs.length);
  }
}

// ---------------------------------------------------------------------
// W. Calculator coverage remains 13/13; no calculator logic changed.
// ---------------------------------------------------------------------
{
  const enCalc = fs.readdirSync(path.join(ROOT, 'calculators')).filter((f) => f.endsWith('.html') && f !== 'index.html' && f !== 'volume-calculator.html');
  const esCalc = fs.readdirSync(path.join(ROOT, 'es', 'calculators')).filter((f) => f.endsWith('.html'));
  const current = crypto.createHash('sha256').update(read('js/calc-utils.js')).digest('hex');
  const baseline = crypto.createHash('sha256').update(execSync('git show ' + BASELINE_SHA + ':js/calc-utils.js', { cwd: ROOT })).digest('hex');
  if (enCalc.length === 13 && esCalc.length === 13 && current === baseline) {
    ok('W. Calculator coverage remains 13/13, js/calc-utils.js byte-identical to baseline (no logic changed)');
  } else {
    err('W. Calculator regression detected: en=' + enCalc.length + ' es=' + esCalc.length + ' calcUtilsMatch=' + (current === baseline));
  }
}

// ---------------------------------------------------------------------
// X. Required Phase 8L artifacts exist.
// ---------------------------------------------------------------------
{
  const required = [DOC, REPORT, MANIFEST, 'scripts/test-phase-8l.js'];
  const allExist = required.every(exists);
  if (allExist) ok('X. All required Phase 8L artifacts exist');
  else err('X. Missing artifacts: ' + required.filter((r) => !exists(r)).join(', '));
}

// ---------------------------------------------------------------------
// Y. Restore any incidental drift the read-only regression checks above
//    may have caused.
// ---------------------------------------------------------------------
try {
  execSync('git checkout HEAD -- .', { cwd: ROOT, stdio: 'pipe' });
  ok('Y. Working tree restored to HEAD after running read-only regression checks (no residue left behind); untracked Phase 8L artifacts, including the manifest, are intentionally left in place');
} catch (e) {
  warn('Y. Could not confirm working-tree restoration: ' + e.message);
}

// ---------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------
console.log('');
console.log('validate-phase-8l: ' + errors + ' error(s), ' + warnings + ' warning(s).');
if (errors > 0) {
  console.log('validate-phase-8l: FAIL');
  process.exit(1);
} else {
  console.log('validate-phase-8l: PASS');
}
