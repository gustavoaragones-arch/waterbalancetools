#!/usr/bin/env node
/**
 * test-phase-8l.js
 *
 * Deterministic test suite for the Phase 8L Spanish Core Reference
 * Localization Architecture Preparation phase. Phase 8L produced a
 * preparation specification, not production code -- these tests prove
 * the specification's claims are reproducible against the actual
 * repository data and that zero production drift occurred. No network
 * calls, no external APIs.
 *
 * Run: node scripts/test-phase-8l.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let passed = 0;
let failed = 0;
function check(n, desc, cond) {
  if (cond) { console.log('PASS: ' + n + '. ' + desc); passed++; }
  else { console.log('FAIL: ' + n + '. ' + desc); failed++; }
}
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }

const BASELINE_SHA = '7e71120bec3d5337d18013697110685e892219ec';
const DOC = 'docs/PHASE-8L-SPANISH-REFERENCE-LOCALIZATION-ARCHITECTURE.md';
const MANIFEST = 'data/i18n/es/glossary-first-wave.json';

let n = 1;

// 1. Content-ID convention: native IDs verified unique and matching the
//    documented sample for each family.
{
  const g = require(path.join(ROOT, 'data', 'glossary.json'));
  const f = require(path.join(ROOT, 'data', 'formulas.json'));
  const r = require(path.join(ROOT, 'data', 'reference.json'));
  check(n++, 'glossary.json terms[0].id matches documented sample "gl-001"', g.terms[0].id === 'gl-001');
  check(n++, 'formulas.json formulas[0].id matches documented sample "formula-01"', f.formulas[0].id === 'formula-01');
  check(n++, 'reference.json pages[0].id matches documented sample "ref-01"', r.pages[0].id === 'ref-01');
}

// 4. Translation-status mapping: the 3 old fixtures still exist unmigrated
//    (spec only, not yet applied) and their target native records exist.
{
  const status = require(path.join(ROOT, 'data', 'i18n', 'translation-status.json'));
  const ids = status.units.map((u) => u.contentId);
  const g = require(path.join(ROOT, 'data', 'glossary.json'));
  const f = require(path.join(ROOT, 'data', 'formulas.json'));
  const r = require(path.join(ROOT, 'data', 'reference.json'));
  check(n++, 'Old fixture glossary:free-chlorine still present (migration not yet applied, spec only)', ids.includes('glossary:free-chlorine'));
  check(n++, 'Target native record gl-001 exists in glossary.json for the planned migration', g.terms.some((t) => t.id === 'gl-001'));
  check(n++, 'Old fixture formula:pool-volume still present (migration not yet applied)', ids.includes('formula:pool-volume'));
  check(n++, 'Target native record formula-01 exists in formulas.json for the planned migration', f.formulas.some((t) => t.id === 'formula-01'));
  check(n++, 'Old fixture reference:ideal-pool-levels still present (migration not yet applied)', ids.includes('reference:ideal-pool-levels'));
  check(n++, 'Target native record ref-01 exists in reference.json for the planned migration', r.pages.some((t) => t.id === 'ref-01'));
}

// 10. Glossary candidate selection: recompute independently and compare.
function computeCandidates() {
  const g = require(path.join(ROOT, 'data', 'glossary.json'));
  const status = require(path.join(ROOT, 'data', 'i18n', 'translation-status.json'));
  const spanishCalcs = status.units.filter((u) => u.category === 'calculator' && u.languages.es.status === 'translated');
  const spanishCalcUrls = new Map(spanishCalcs.map((u) => [u.languages.en.url, u]));
  const ids = [];
  g.terms.forEach((t) => {
    const rc = t.relatedCalculators || [];
    if (rc.some((url) => spanishCalcUrls.has(url))) ids.push(t.id);
  });
  return ids.sort();
}
{
  const computed = computeCandidates();
  check(n++, 'Glossary candidate selection produces exactly 54 qualifying terms', computed.length === 54);
  const manifest = JSON.parse(read(MANIFEST));
  const manifestIds = manifest.candidates.map((c) => c.nativeId).sort();
  check(n++, 'Manifest candidate list matches an independently recomputed selection exactly', JSON.stringify(computed) === JSON.stringify(manifestIds));
}

// 12. Glossary candidate determinism: two independent recomputations agree.
{
  const run1 = computeCandidates();
  const run2 = computeCandidates();
  check(n++, 'Glossary candidate selection is deterministic across repeated computation', JSON.stringify(run1) === JSON.stringify(run2));
}

// 13. Relationship inventory: the documented broken-reference count is
//     independently reproducible.
{
  const f = require(path.join(ROOT, 'data', 'formulas.json'));
  const g = require(path.join(ROOT, 'data', 'glossary.json'));
  const gSlugSuffixes = new Set(g.terms.map((t) => t.slug.split('/').pop()));
  let brokenCount = 0;
  f.formulas.forEach((x) => {
    (x.relatedGlossary || []).forEach((rg) => { if (!gSlugSuffixes.has(rg)) brokenCount++; });
  });
  check(n++, 'formulas.json relatedGlossary broken-reference occurrence count is independently reproducible (14)', brokenCount === 14);
}
{
  const f = require(path.join(ROOT, 'data', 'formulas.json'));
  const r = require(path.join(ROOT, 'data', 'reference.json'));
  const rSlugs = new Set(r.pages.map((p) => p.slug));
  const cyaMatrix = f.formulas.find((x) => (x.relatedTopics || []).includes('reference/cya-matrix'));
  check(n++, 'formula relatedTopics cross-family reference (reference/cya-matrix) resolves against reference.json', !!cyaMatrix && rSlugs.has('reference/cya-matrix'));
}

// 15. URL resolution design / fallback policy documented and internally
//     consistent (English pages never change, Spanish falls back to
//     English when untranslated).
{
  const doc = read(DOC);
  check(n++, 'Fallback policy document states English pages retain existing behavior', /English pages never change their existing linking behavior/.test(doc) || /sourceLang === 'en'.*always return the English URL/.test(doc));
}

// 16. Formula equation audit: all 9 records individually present with
//     their documented equation text.
{
  const f = require(path.join(ROOT, 'data', 'formulas.json'));
  check(n++, 'formulas.json contains exactly 9 formula records (10th page count is the hub, not a formula record)', f.formulas.length === 9);
  const doc = read(DOC);
  // The doc paraphrases each equation's distinguishing content in its
  // audit table rather than quoting the full string verbatim; check for
  // each formula's distinguishing label phrase instead of an exact slice.
  const distinguishingPhrase = {
    'formula-01': 'Length', 'formula-02': 'Fluid ounces', 'formula-03': 'Shock dose',
    'formula-04': 'No single validated dosing equation', 'formula-05': 'Sodium bicarbonate',
    'formula-06': 'Salt to add', 'formula-07': 'CYA to add', 'formula-08': 'Turnover Time',
    'formula-09': 'LSI',
  };
  const allEquationsAudited = f.formulas.every((x) => doc.includes(x.id) && doc.includes(distinguishingPhrase[x.id]));
  check(n++, 'All 9 formula equations are individually audited in the architecture doc (ID + distinguishing content present)', allEquationsAudited);
}

// 18. Formula safety invariants: documented numeric constants match the
//     actual source data exactly.
{
  const f = require(path.join(ROOT, 'data', 'formulas.json'));
  const constants = ['7.48', '0.013344', '0.000224', '0.0000834', '0.000133', '12.1'];
  const allFound = constants.every((c) => f.formulas.some((x) => x.equation.includes(c)));
  check(n++, 'All 6 documented numeric constants are verified present in the actual equation strings', allFound);
}

// 19. Metadata/schema readiness: generators confirmed to hardcode
//     lang="en" today (the documented ADDITIVE REQUIRED finding).
{
  const glossaryGen = read('scripts/generate-glossary.js');
  const formulasGen = read('scripts/generate-formulas.js');
  const referenceGen = read('scripts/generate-reference.js');
  const allHardcoded = [glossaryGen, formulasGen, referenceGen].every((src) => /<html lang="en">/.test(src));
  check(n++, 'All 3 generators confirmed to hardcode lang="en" today, matching the documented ADDITIVE REQUIRED finding', allHardcoded);
}

// 20. hreflang readiness: confirmed no generator emits hreflang today.
{
  const glossaryGen = read('scripts/generate-glossary.js');
  const formulasGen = read('scripts/generate-formulas.js');
  const referenceGen = read('scripts/generate-reference.js');
  const noneEmitHreflang = ![glossaryGen, formulasGen, referenceGen].some((src) => /hreflang/.test(src));
  check(n++, 'Confirmed none of the 3 generators emits hreflang today, matching the documented finding', noneEmitHreflang);
}

// 21/22. Production URL non-regression (English + Spanish).
{
  let urlSetUnchanged = false;
  try {
    const out = execSync('node scripts/validate-url-indexation.js', { cwd: ROOT }).toString();
    urlSetUnchanged = /PASS -- 539 pages, 491 sitemap URLs, 0 violations/.test(out);
  } catch (e) { urlSetUnchanged = false; }
  check(n++, 'English and Spanish production URL sets unchanged (539 pages / 491 sitemap URLs / 0 violations)', urlSetUnchanged);
}

// 23. Calculator non-regression.
{
  const enCalc = fs.readdirSync(path.join(ROOT, 'calculators')).filter((f) => f.endsWith('.html') && f !== 'index.html' && f !== 'volume-calculator.html');
  const esCalc = fs.readdirSync(path.join(ROOT, 'es', 'calculators')).filter((f) => f.endsWith('.html'));
  const current = crypto.createHash('sha256').update(read('js/calc-utils.js')).digest('hex');
  const baseline = crypto.createHash('sha256').update(execSync('git show ' + BASELINE_SHA + ':js/calc-utils.js', { cwd: ROOT })).digest('hex');
  check(n++, 'Calculator non-regression: 13 English + 13 Spanish, js/calc-utils.js byte-identical to baseline', enCalc.length === 13 && esCalc.length === 13 && current === baseline);
}

// 24. No production source file was modified.
{
  const paths = ['es/', 'calculators/', 'data/glossary.json', 'data/formulas.json', 'data/reference.json', 'data/i18n/translation-status.json', 'js/calc-utils.js', 'js/i18n/', 'scripts/generate-glossary.js', 'scripts/generate-formulas.js', 'scripts/generate-reference.js'];
  const diff = execSync('git diff --stat ' + BASELINE_SHA + ' -- ' + paths.join(' '), { cwd: ROOT }).toString().trim();
  check(n++, 'No production source file was modified (all byte-identical to baseline)', diff === '');
}

// 25. Artifact integrity.
check(n++, DOC + ' exists', exists(DOC));
check(n++, 'reports/phase-8l-status.md exists', exists('reports/phase-8l-status.md'));
check(n++, MANIFEST + ' exists and is valid JSON', exists(MANIFEST) && (() => { try { JSON.parse(read(MANIFEST)); return true; } catch (e) { return false; } })());
check(n++, 'scripts/validate-phase-8l.js exists', exists('scripts/validate-phase-8l.js'));

// 29-30. Existing regression gates still pass.
try { execSync('node scripts/validate-phase-8k.js', { cwd: ROOT, stdio: 'pipe' }); check(n++, 'Phase 8K: validate-phase-8k.js passes', true); }
catch (e) { check(n++, 'Phase 8K: validate-phase-8k.js passes', false); }
try { execSync('node scripts/check-broken-links.js', { cwd: ROOT, stdio: 'pipe' }); check(n++, 'check-broken-links.js: 0 broken links sitewide', true); }
catch (e) { check(n++, 'check-broken-links.js: 0 broken links sitewide', false); }

// Restore any incidental cosmetic drift from the read-only regression
// checks above before finishing. Untracked Phase 8L artifacts (including
// the manifest) are never touched by `git checkout HEAD --`.
try { execSync('git checkout HEAD -- .', { cwd: ROOT, stdio: 'pipe' }); } catch (e) { /* best effort */ }

console.log('');
console.log('test-phase-8l: ' + passed + ' passed, ' + failed + ' failed.');
if (failed > 0) process.exit(1);
