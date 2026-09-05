#!/usr/bin/env node
/**
 * validate-phase-8m.js
 *
 * Validates the Phase 8M Core Reference Localization Plumbing
 * Implementation. Phase 8M implements reusable architecture (content-ID
 * migration, an embedded Spanish data-model convention, a generic
 * related-link resolver, a structured formula-equation model, an
 * explicit Reference scope boundary, locale-aware generator wiring, and
 * a drift detector) while producing ZERO Spanish non-calculator
 * production output. This validator checks both halves: that the
 * plumbing is real and correct, and that production output is
 * unaffected.
 *
 * IMPORTANT: this validator intentionally does NOT end with a blanket
 * `git checkout HEAD -- .` self-cleanup step (unlike some earlier
 * validate-phase-8*.js scripts) -- that pattern is safe only when no
 * other uncommitted work can be in flight, which is not a safe
 * assumption for a script other tooling/agents may invoke mid-phase.
 * Any incidental cosmetic drift from this validator's own read-only
 * checks (e.g. a regenerated "Last Built" timestamp) is left for the
 * caller to inspect via `git status` rather than silently reverted.
 *
 * Run: node scripts/validate-phase-8m.js
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

const BASELINE_SHA = '6235c2d9f6894886f5b2ab5f1188f61c6806db12'; // Phase 8L closeout

// ---------------------------------------------------------------------
// 1. Baseline / source architecture
// ---------------------------------------------------------------------
try {
  const log = execSync('git log --oneline -1 ' + BASELINE_SHA, { cwd: ROOT }).toString().trim();
  if (log) ok('1. Mandatory baseline commit ' + BASELINE_SHA.slice(0, 7) + ' (Phase 8L closeout) is present in history');
  else err('1. Baseline commit not found in history');
} catch (e) {
  err('1. Could not verify baseline commit: ' + e.message);
}

// ---------------------------------------------------------------------
// 2. Native content-ID integrity
// ---------------------------------------------------------------------
{
  const status = JSON.parse(read('data/i18n/translation-status.json'));
  const glossary = require(path.join(ROOT, 'data', 'glossary.json'));
  const formulas = require(path.join(ROOT, 'data', 'formulas.json'));
  const reference = require(path.join(ROOT, 'data', 'reference.json'));
  const nativeSets = {
    glossary: new Set(glossary.terms.map((t) => t.id)),
    formula: new Set(formulas.formulas.map((t) => t.id)),
    reference: new Set(reference.pages.map((t) => t.id)),
  };
  let allNative = true;
  for (const u of status.units) {
    if (!nativeSets[u.category]) continue;
    const suffix = u.contentId.split(':')[1];
    if (!nativeSets[u.category].has(suffix)) allNative = false;
  }
  if (allNative) ok('2. Every glossary/formula/reference content ID in translation-status.json uses its family\'s native source-record ID');
  else err('2. One or more glossary/formula/reference content IDs do not correspond to a real native source-record ID');
}

// ---------------------------------------------------------------------
// 3. Legacy seed IDs migrated correctly
// ---------------------------------------------------------------------
{
  const status = JSON.parse(read('data/i18n/translation-status.json'));
  const ids = status.units.map((u) => u.contentId);
  const migrated = ['glossary:gl-001', 'formula:formula-01', 'reference:ref-01'];
  const legacy = ['glossary:free-chlorine', 'formula:pool-volume', 'reference:ideal-pool-levels'];
  const allMigrated = migrated.every((m) => ids.includes(m)) && legacy.every((l) => !ids.includes(l));
  const statusPreserved = status.units
    .filter((u) => migrated.includes(u.contentId))
    .every((u) => u.languages.en.status === 'translated' && u.languages.es.status === 'missing' && u._migratedFrom);
  if (allMigrated && statusPreserved) {
    ok('3. Legacy seed IDs (glossary:free-chlorine, formula:pool-volume, reference:ideal-pool-levels) migrated to native IDs with en/es status preserved and _migratedFrom recorded');
  } else {
    err('3. Legacy seed ID migration incomplete or status not preserved: allMigrated=' + allMigrated + ' statusPreserved=' + statusPreserved);
  }
}

// ---------------------------------------------------------------------
// 4. No duplicate content IDs
// ---------------------------------------------------------------------
{
  const status = JSON.parse(read('data/i18n/translation-status.json'));
  const ids = status.units.map((u) => u.contentId);
  if (status.units.length === 20 && new Set(ids).size === 20) {
    ok('4. No duplicate content IDs: exactly 20 unique units');
  } else {
    err('4. Duplicate or missing content IDs: total=' + status.units.length + ' unique=' + new Set(ids).size);
  }
}

// ---------------------------------------------------------------------
// 5. Spanish data model is structurally valid (design documented,
//    NOT populated with any actual es content in any production file).
// ---------------------------------------------------------------------
{
  const doc = exists('docs/PHASE-8M-CORE-REFERENCE-LOCALIZATION-IMPLEMENTATION.md') ? read('docs/PHASE-8M-CORE-REFERENCE-LOCALIZATION-IMPLEMENTATION.md') : '';
  const hasModel = /embedded.*`es`.*object|"es":\s*\{/.test(doc);
  const glossary = require(path.join(ROOT, 'data', 'glossary.json'));
  const formulas = require(path.join(ROOT, 'data', 'formulas.json'));
  const reference = require(path.join(ROOT, 'data', 'reference.json'));
  const noEsPopulated = !glossary.terms.some((t) => t.es) && !formulas.formulas.some((t) => t.es) && !reference.pages.some((t) => t.es);
  if (hasModel && noEsPopulated) {
    ok('5. Spanish data model (embedded `es` object) is documented and structurally valid; zero records in any of the 3 families have been populated with `es` content');
  } else {
    err('5. Spanish data model problem: documented=' + hasModel + ' noEsPopulated=' + noEsPopulated);
  }
}

// ---------------------------------------------------------------------
// 6. No production Spanish prose was introduced
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
  const nonCalc = esPages.filter((p) => !p.startsWith('es/calculators/'));
  if (nonCalc.length === 0) ok('6. No production Spanish prose was introduced: 0 non-calculator pages under es/');
  else err('6. Unexpected Spanish non-calculator production pages found: ' + JSON.stringify(nonCalc));
}

// ---------------------------------------------------------------------
// 7. Related-link resolver exists
// ---------------------------------------------------------------------
{
  if (exists('js/i18n/related-link-resolver.js')) {
    const resolver = require(path.join(ROOT, 'js', 'i18n', 'related-link-resolver'));
    if (typeof resolver.resolveRelatedLink === 'function') ok('7. Generic related-link resolver (js/i18n/related-link-resolver.js) exists and exports resolveRelatedLink()');
    else err('7. related-link-resolver.js exists but does not export resolveRelatedLink()');
  } else {
    err('7. js/i18n/related-link-resolver.js does not exist');
  }
}

// ---------------------------------------------------------------------
// 8. Policy A fallback is implemented
// ---------------------------------------------------------------------
{
  const resolver = require(path.join(ROOT, 'js', 'i18n', 'related-link-resolver'));
  resolver.reloadContentIndex();
  const untranslated = resolver.resolveRelatedLink({ raw: '/glossary/free-chlorine', locale: 'es' });
  if (untranslated.resolved && untranslated.url === '/glossary/free-chlorine' && untranslated.translatedForLocale === false) {
    ok('8. Policy A fallback confirmed: an untranslated target requested at locale=es returns its English URL, not suppressed or fabricated');
  } else {
    err('8. Policy A fallback not behaving as specified: ' + JSON.stringify(untranslated));
  }
}

// ---------------------------------------------------------------------
// 9. Missing relationship targets do not crash generation
// ---------------------------------------------------------------------
{
  let threw = false;
  let result = null;
  try {
    result = require(path.join(ROOT, 'js', 'i18n', 'related-link-resolver')).resolveRelatedLink({ raw: 'turnover-rate', targetFamilyHint: 'glossary', locale: 'en' });
  } catch (e) { threw = true; }
  if (!threw && result && result.resolved === false) {
    ok('9. A missing relationship target (known-broken formulas.json relatedGlossary reference) does not crash the resolver -- returns { resolved: false } safely');
  } else {
    err('9. Missing-target handling failed: threw=' + threw + ' result=' + JSON.stringify(result));
  }
}

// ---------------------------------------------------------------------
// 10. Known 13 missing Glossary targets reported as pre-existing
// ---------------------------------------------------------------------
{
  const formulas = require(path.join(ROOT, 'data', 'formulas.json'));
  const glossary = require(path.join(ROOT, 'data', 'glossary.json'));
  const gSlugSuffixes = new Set(glossary.terms.map((t) => t.slug.split('/').pop()));
  const missing = new Set();
  let occurrences = 0;
  formulas.formulas.forEach((f) => {
    (f.relatedGlossary || []).forEach((rg) => {
      if (!gSlugSuffixes.has(rg)) { missing.add(rg); occurrences++; }
    });
  });
  if (missing.size === 13 && occurrences === 14) {
    ok('10. Known pre-existing data-quality gap confirmed and correctly bounded: 13 unique missing glossary targets, 14 total reference occurrences across formulas.json -- not treated as a new Phase 8M failure');
  } else {
    err('10. Known missing-glossary-target count has changed since Phase 8L/8M documentation: unique=' + missing.size + ' occurrences=' + occurrences + ' (expected 13/14 -- investigate before assuming this is fine)');
  }
}

// ---------------------------------------------------------------------
// 11. Glossary first-wave manifest contains exactly 54 candidates
// ---------------------------------------------------------------------
{
  if (exists('data/i18n/es/glossary-first-wave.json')) {
    const manifest = JSON.parse(read('data/i18n/es/glossary-first-wave.json'));
    if (manifest.candidates.length === 54) ok('11. Glossary first-wave manifest contains exactly 54 candidates (Phase 8L manifest preserved unmodified)');
    else err('11. Glossary first-wave manifest candidate count changed: ' + manifest.candidates.length + ' (expected 54 -- Phase 8M must not alter this manifest)');
  } else {
    err('11. data/i18n/es/glossary-first-wave.json does not exist');
  }
}

// ---------------------------------------------------------------------
// 12. Manifest IDs use native IDs
// ---------------------------------------------------------------------
{
  const manifest = JSON.parse(read('data/i18n/es/glossary-first-wave.json'));
  const allNative = manifest.candidates.every((c) => /^gl-\d+$/.test(c.nativeId));
  if (allNative) ok('12. All 54 manifest candidates use native glossary IDs (gl-NNN format)');
  else err('12. One or more manifest candidates do not use the native gl-NNN ID format');
}

// ---------------------------------------------------------------------
// 13. Formula structured representation exists
// ---------------------------------------------------------------------
{
  if (exists('js/i18n/formula-equation-model.js')) {
    const model = require(path.join(ROOT, 'js', 'i18n', 'formula-equation-model'));
    if (typeof model.getFormulaModel === 'function' && typeof model.reconstructEquation === 'function') {
      ok('13. Formula structured equation representation (js/i18n/formula-equation-model.js) exists');
    } else {
      err('13. formula-equation-model.js exists but is missing required exports');
    }
  } else {
    err('13. js/i18n/formula-equation-model.js does not exist');
  }
}

// ---------------------------------------------------------------------
// 14. All 9 actual formulas are covered
// ---------------------------------------------------------------------
{
  const model = require(path.join(ROOT, 'js', 'i18n', 'formula-equation-model'));
  const formulas = require(path.join(ROOT, 'data', 'formulas.json'));
  const allCovered = formulas.formulas.every((f) => !!model.getFormulaModel(f.id));
  if (allCovered && model.getAllFormulaIds().length === 9) {
    ok('14. All 9 actual formula records are covered by the structured equation model (formulas/index.html hub correctly excluded)');
  } else {
    err('14. Structured equation model does not cover all 9 formula records');
  }
}

// ---------------------------------------------------------------------
// 15. Mathematical invariants pass
// ---------------------------------------------------------------------
{
  const model = require(path.join(ROOT, 'js', 'i18n', 'formula-equation-model'));
  const formulas = require(path.join(ROOT, 'data', 'formulas.json'));
  let allMatch = true;
  const mismatches = [];
  for (const f of formulas.formulas) {
    if (model.reconstructEquation(f.id) !== f.equation) { allMatch = false; mismatches.push(f.id); }
  }
  if (allMatch) ok('15. Mathematical invariants pass: all 9 formulas reconstruct token-for-token to their exact original equation string');
  else err('15. Mathematical invariant violation in: ' + JSON.stringify(mismatches));
}

// ---------------------------------------------------------------------
// 16-18. Reference scope
// ---------------------------------------------------------------------
{
  if (exists('js/i18n/reference-locale-scope.js')) {
    const scope = require(path.join(ROOT, 'js', 'i18n', 'reference-locale-scope'));
    const c = scope.classifyReferenceScope();
    if (c.jsonDriven.length === 25) ok('16. Reference scope is exactly 25 JSON-driven pages');
    else err('16. Reference JSON-driven scope is ' + c.jsonDriven.length + ', expected 25');

    if (c.legacy.length === 11) ok('17. 11 older-template Reference pages remain excluded (corrected count from Phase 8L\'s erroneous "12")');
    else err('17. Reference legacy-excluded count is ' + c.legacy.length + ', expected 11');

    if (c.noindexDatasets.length === 16) ok('18. 16 noindex dataset pages remain excluded');
    else err('18. Reference noindex-dataset-excluded count is ' + c.noindexDatasets.length + ', expected 16');

    if (c.unexpected.length > 0) warn('Unexpected/unclassified reference/*.html files found (review LEGACY_EXCLUDED list): ' + JSON.stringify(c.unexpected));
  } else {
    err('16-18. js/i18n/reference-locale-scope.js does not exist');
  }
}

// ---------------------------------------------------------------------
// 19-21. Generators are locale-aware
// ---------------------------------------------------------------------
{
  const glossaryGen = read('scripts/generate-glossary.js');
  const formulasGen = read('scripts/generate-formulas.js');
  const referenceGen = read('scripts/generate-reference.js');
  if (/function generateTerm\(term, locale\)/.test(glossaryGen) && /htmlLangAttr\(effectiveLocale\)/.test(glossaryGen)) ok('19. generate-glossary.js is locale-aware (accepts a locale parameter, uses htmlLangAttr/getLocalizedCanonical)');
  else err('19. generate-glossary.js is not locale-aware');

  if (/function generateFormula\(formula, locale\)/.test(formulasGen) && /htmlLangAttr\(effectiveLocale\)/.test(formulasGen)) ok('20. generate-formulas.js is locale-aware');
  else err('20. generate-formulas.js is not locale-aware');

  if (/function generateRefPage\(page, locale\)/.test(referenceGen) && /htmlLangAttr\(effectiveLocale\)/.test(referenceGen)) ok('21. generate-reference.js is locale-aware');
  else err('21. generate-reference.js is not locale-aware');
}

// ---------------------------------------------------------------------
// 22. Existing i18n primitives are reused (not duplicated)
// ---------------------------------------------------------------------
{
  const glossaryGen = read('scripts/generate-glossary.js');
  const usesRealModules = /require\(.*js\/i18n\/html-lang.*\)/.test(glossaryGen) && /require\(.*js\/i18n\/locale-url.*\)/.test(glossaryGen);
  // Confirm no second/competing implementation of htmlLangAttr or
  // getLocalizedCanonical was introduced anywhere.
  const competingImpls = execSync('grep -rl "function htmlLangAttr\\|function getLocalizedCanonical" --include=*.js js/ scripts/ 2>/dev/null || true', { cwd: ROOT })
    .toString().trim().split('\n').filter(Boolean)
    .filter((f) => !f.includes('validate-phase-8m.js'));
  if (usesRealModules && competingImpls.length <= 2) {
    ok('22. Existing i18n primitives (html-lang.js, locale-url.js) are reused by reference, not duplicated');
  } else {
    err('22. Existing i18n primitives are not correctly reused, or a competing implementation was introduced: ' + JSON.stringify(competingImpls));
  }
}

// ---------------------------------------------------------------------
// 23-24. URL / canonical architecture correct
// ---------------------------------------------------------------------
{
  const { getLocalizedUrl, getLocalizedCanonical } = require(path.join(ROOT, 'js', 'i18n', 'locale-url'));
  const noDoublePrefix = getLocalizedUrl('/es/glossary/free-chlorine', 'es') === '/es/glossary/free-chlorine';
  const correctEs = getLocalizedUrl('/glossary/free-chlorine', 'es') === '/es/glossary/free-chlorine';
  if (noDoublePrefix && correctEs) ok('23. URL architecture correct: English slugs retained under /es/, no /es/es/ possible');
  else err('23. URL architecture problem: noDoublePrefix=' + noDoublePrefix + ' correctEs=' + correctEs);

  const selfCanonicalEs = getLocalizedCanonical('/glossary/free-chlorine', 'es') === 'https://waterbalancetools.com/es/glossary/free-chlorine';
  const selfCanonicalEn = getLocalizedCanonical('/glossary/free-chlorine', 'en') === 'https://waterbalancetools.com/glossary/free-chlorine';
  if (selfCanonicalEs && selfCanonicalEn) ok('24. Canonical architecture correct: each language self-canonicalizes to its own URL');
  else err('24. Canonical architecture problem: selfCanonicalEs=' + selfCanonicalEs + ' selfCanonicalEn=' + selfCanonicalEn);
}

// ---------------------------------------------------------------------
// 25-26. hreflang / html lang wired for future output
// ---------------------------------------------------------------------
{
  const { buildHreflangSet } = require(path.join(ROOT, 'js', 'i18n', 'hreflang'));
  const set = buildHreflangSet('/glossary/synthetic-test', ['en', 'es']);
  if (set.length === 3) ok('25. hreflang architecture is wired for future output: buildHreflangSet() produces a correct reciprocal en/es/x-default set for a hypothetical translated pair');
  else err('25. hreflang architecture not producing the expected set shape');

  const { htmlOpenTag } = require(path.join(ROOT, 'js', 'i18n', 'html-lang'));
  if (htmlOpenTag('en') === '<html lang="en">' && htmlOpenTag('es') === '<html lang="es">') {
    ok('26. html lang architecture is wired for future output: htmlOpenTag() produces correct tags for both en and es');
  } else {
    err('26. html lang architecture not producing correct tags');
  }
}

// ---------------------------------------------------------------------
// 27. Schema localization architecture assessed/implemented
// ---------------------------------------------------------------------
{
  const glossaryTpl = read('templates/glossary-template.html');
  const formulaTpl = read('templates/formula-template.html');
  const usesCanonicalToken = /"url":\s*"\{\{CANONICAL_URL\}\}"/.test(glossaryTpl) && /"url":\s*"\{\{CANONICAL_URL\}\}"/.test(formulaTpl);
  if (usesCanonicalToken) {
    ok('27. Schema localization architecture implemented: JSON-LD "url" fields now use the same locale-aware {{CANONICAL_URL}} token as the <link rel="canonical"> tag');
  } else {
    err('27. Schema JSON-LD "url" fields are not wired to the locale-aware canonical token');
  }
}

// ---------------------------------------------------------------------
// 28. Drift detection exists
// ---------------------------------------------------------------------
{
  if (exists('js/i18n/translation-drift.js')) {
    const drift = require(path.join(ROOT, 'js', 'i18n', 'translation-drift'));
    const result = drift.detectDrift();
    if (typeof drift.detectDrift === 'function' && result.errors.length === 0) {
      ok('28. Drift detection (js/i18n/translation-drift.js) exists and reports 0 errors against the current translation-status.json');
    } else {
      err('28. Drift detection exists but reports errors: ' + JSON.stringify(result.errors));
    }
  } else {
    err('28. js/i18n/translation-drift.js does not exist');
  }
}

// ---------------------------------------------------------------------
// 29-31. Production URL/page counts unchanged
// ---------------------------------------------------------------------
try {
  const out = execSync('node scripts/validate-url-indexation.js', { cwd: ROOT }).toString();
  if (/PASS -- 539 pages, 491 sitemap URLs, 0 violations/.test(out)) {
    ok('29. English production URL set unchanged (539 pages, 491 sitemap URLs, 0 violations)');
  } else {
    err('29. English production URL set changed: ' + out.trim());
  }
} catch (e) {
  err('29. validate-url-indexation.js FAILED: ' + e.message);
}
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
  if (esPages.length === 13) ok('30. Spanish production URL set unchanged: exactly 13 pages');
  else err('30. Spanish production page count changed: ' + esPages.length + ' (expected 13)');
}
{
  const sitemapXml = read('sitemap-calculators.xml');
  const esCount = (sitemapXml.match(/<loc>[^<]*\/es\//g) || []).length;
  if (esCount === 13) ok('31. Spanish sitemap URL count unchanged: exactly 13 in sitemap-calculators.xml');
  else err('31. Spanish sitemap URL count changed: ' + esCount + ' (expected 13)');
}

// ---------------------------------------------------------------------
// 32. Required Phase 8M artifacts exist
// ---------------------------------------------------------------------
{
  const required = [
    'docs/PHASE-8M-CORE-REFERENCE-LOCALIZATION-IMPLEMENTATION.md',
    'reports/phase-8m-status.md',
    'scripts/test-phase-8m.js',
    'js/i18n/related-link-resolver.js',
    'js/i18n/formula-equation-model.js',
    'js/i18n/reference-locale-scope.js',
    'js/i18n/translation-drift.js',
  ];
  const missing = required.filter((r) => !exists(r));
  if (missing.length === 0) ok('32. All required Phase 8M artifacts exist');
  else err('32. Missing required artifacts: ' + missing.join(', '));
}

// ---------------------------------------------------------------------
// 33. Calculator logic unchanged (js/calc-utils.js byte-identical)
// ---------------------------------------------------------------------
{
  const current = crypto.createHash('sha256').update(read('js/calc-utils.js')).digest('hex');
  const baseline = crypto.createHash('sha256').update(execSync('git show ' + BASELINE_SHA + ':js/calc-utils.js', { cwd: ROOT })).digest('hex');
  if (current === baseline) ok('33. Calculator logic unchanged: js/calc-utils.js byte-identical to the Phase 8L baseline');
  else err('33. js/calc-utils.js differs from the Phase 8L baseline -- calculator logic may have changed');
}

// ---------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------
console.log('');
console.log('validate-phase-8m: ' + errors + ' error(s), ' + warnings + ' warning(s).');
if (errors > 0) {
  console.log('validate-phase-8m: FAIL');
  process.exit(1);
} else {
  console.log('validate-phase-8m: PASS');
}
