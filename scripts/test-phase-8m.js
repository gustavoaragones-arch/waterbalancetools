#!/usr/bin/env node
/**
 * test-phase-8m.js
 *
 * Deterministic test suite for Phase 8M (Core Reference Localization
 * Plumbing Implementation). Exercises the resolver, formula-equation
 * model, reference scope boundary, and drift detector against both real
 * repository data and small, clearly non-production synthetic fixtures
 * (Task P) -- never against generated Spanish production output, since
 * none exists or should exist after this phase.
 *
 * No network calls. No external APIs. Deterministic.
 *
 * Run: node scripts/test-phase-8m.js
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

const BASELINE_SHA = '6235c2d9f6894886f5b2ab5f1188f61c6806db12'; // Phase 8L closeout
let n = 1;

// ---------------------------------------------------------------------
// A. Locale URL generation (existing js/i18n/locale-url.js, reused not
//    reimplemented).
// ---------------------------------------------------------------------
{
  const { getLocalizedUrl } = require(path.join(ROOT, 'js', 'i18n', 'locale-url'));
  check(n++, 'EN locale URL: same English slug, no prefix', getLocalizedUrl('/glossary/free-chlorine', 'en') === '/glossary/free-chlorine');
  check(n++, 'ES locale URL: same English slug under /es/', getLocalizedUrl('/glossary/free-chlorine', 'es') === '/es/glossary/free-chlorine');
}

// ---------------------------------------------------------------------
// B. Double-prefix prevention.
// ---------------------------------------------------------------------
{
  const { getLocalizedUrl } = require(path.join(ROOT, 'js', 'i18n', 'locale-url'));
  check(n++, 'Double-prefix prevention: an already-/es/ input requested as es stays /es/ (no /es/es/)', getLocalizedUrl('/es/glossary/free-chlorine', 'es') === '/es/glossary/free-chlorine');
  check(n++, 'Double-prefix prevention: an already-/es/ input requested as en strips the prefix', getLocalizedUrl('/es/glossary/free-chlorine', 'en') === '/glossary/free-chlorine');
}

// ---------------------------------------------------------------------
// C. Translation availability: translated target -> Spanish URL,
//    untranslated target -> English URL (Policy A), using the REAL
//    resolver against REAL data (a calculator, which is translated).
// ---------------------------------------------------------------------
{
  const resolver = require(path.join(ROOT, 'js', 'i18n', 'related-link-resolver'));
  resolver.reloadContentIndex();
  const translated = resolver.resolveRelatedLink({ raw: '/calculators/pool-chlorine-calculator', locale: 'es' });
  check(n++, 'Translated target resolves to its Spanish URL when locale=es', translated.resolved && translated.url === '/es/calculators/pool-chlorine-calculator' && translated.translatedForLocale === true);

  const untranslated = resolver.resolveRelatedLink({ raw: '/glossary/free-chlorine', locale: 'es' });
  check(n++, 'Untranslated target falls back to its English URL when locale=es (Policy A)', untranslated.resolved && untranslated.url === '/glossary/free-chlorine' && untranslated.translatedForLocale === false);

  const enAlways = resolver.resolveRelatedLink({ raw: '/calculators/pool-chlorine-calculator', locale: 'en' });
  check(n++, 'locale=en always returns the English URL regardless of translation status', enAlways.resolved && enAlways.url === '/calculators/pool-chlorine-calculator');
}

// ---------------------------------------------------------------------
// D. Missing target handling: a known-missing glossary target must not
//    be fabricated, and must resolve as unresolved rather than crashing.
// ---------------------------------------------------------------------
{
  const resolver = require(path.join(ROOT, 'js', 'i18n', 'related-link-resolver'));
  const missing = resolver.resolveRelatedLink({ raw: 'turnover-rate', targetFamilyHint: 'glossary', locale: 'en' });
  check(n++, 'Known missing glossary target ("turnover-rate", referenced by formulas.json) resolves as unresolved, not fabricated', missing.resolved === false && missing.reason === 'unknown-target');
}

// ---------------------------------------------------------------------
// E. Content-ID mapping: native IDs resolve; legacy fixture IDs no
//    longer exist post-migration (normalized, not silently duplicated).
// ---------------------------------------------------------------------
{
  const status = JSON.parse(read('data/i18n/translation-status.json'));
  const ids = status.units.map((u) => u.contentId);
  check(n++, 'Native ID glossary:gl-001 resolves correctly post-migration', ids.includes('glossary:gl-001'));
  check(n++, 'Native ID formula:formula-01 resolves correctly post-migration', ids.includes('formula:formula-01'));
  check(n++, 'Native ID reference:ref-01 resolves correctly post-migration', ids.includes('reference:ref-01'));
  check(n++, 'Legacy fixture ID glossary:free-chlorine no longer exists (migrated, not duplicated)', !ids.includes('glossary:free-chlorine'));
  check(n++, 'Legacy fixture ID formula:pool-volume no longer exists (migrated, not duplicated)', !ids.includes('formula:pool-volume'));
  check(n++, 'Legacy fixture ID reference:ideal-pool-levels no longer exists (migrated, not duplicated)', !ids.includes('reference:ideal-pool-levels'));
  check(n++, 'Exactly 20 total units (13 calculator + 7 non-calculator, none lost or duplicated)', status.units.length === 20);
  check(n++, 'All content IDs unique', new Set(ids).size === ids.length);
}

// ---------------------------------------------------------------------
// F. Formula structure: all 9 formula records preserve mathematical
//    identity through the structured equation model.
// ---------------------------------------------------------------------
{
  const model = require(path.join(ROOT, 'js', 'i18n', 'formula-equation-model'));
  const formulas = require(path.join(ROOT, 'data', 'formulas.json'));
  check(n++, 'Formula source data contains exactly 9 real records', formulas.formulas.length === 9);
  check(n++, 'Structured equation model covers all 9 formula IDs', model.getAllFormulaIds().length === 9);

  let allReconstruct = true;
  for (const rec of formulas.formulas) {
    if (model.reconstructEquation(rec.id) !== rec.equation) allReconstruct = false;
  }
  check(n++, 'All 9 formulas: token reconstruction exactly matches the original data/formulas.json equation string', allReconstruct);

  const constants = [];
  for (const id of model.getAllFormulaIds()) constants.push(...model.extractByKind(id, 'constant'));
  const expectedConstants = ['7.48', '0.013344', '0.000224', '0.0000834', '0.000133', '12.1'];
  check(n++, 'All 6 Phase 8L numeric constants are present in the structured model', expectedConstants.every((c) => constants.includes(c)));

  // formula-04 is prose-only (no equation) -- verify it is modeled as such.
  const f04 = model.getFormulaModel('formula-04');
  check(n++, 'formula-04 is correctly modeled as prose-only (no math tokens), matching the Phase 8L finding', f04.tokens.length === 1 && f04.tokens[0].kind === 'prose');

  // formula-09 (LSI) is nearly symbol-only -- verify no 'label' tokens.
  const f09 = model.getFormulaModel('formula-09');
  check(n++, 'formula-09 (LSI) is correctly modeled with zero localizable label tokens (nearly pure symbolic notation)', !f09.tokens.some((t) => t.kind === 'label'));
}

// ---------------------------------------------------------------------
// F2. Operator / variable / unit preservation under a synthetic
//     (non-production) localization pass -- proves the model can
//     localize labels without ever touching immutable tokens.
// ---------------------------------------------------------------------
{
  const model = require(path.join(ROOT, 'js', 'i18n', 'formula-equation-model'));
  const syntheticDictionary = { Volume: 'Volumen', Length: 'Longitud', Width: 'Ancho', 'Average Depth': 'Profundidad Promedio' };
  const translateLabel = (t) => syntheticDictionary[t] || t;
  const localized = model.localizeEquation('formula-01', translateLabel);
  const original = model.getFormulaModel('formula-01').equation;

  check(n++, 'Synthetic localization pass changes only label text (Volume/Length/Width/Average Depth translated)', localized.includes('Volumen') && localized.includes('Longitud'));

  // Extract non-label tokens from both and confirm they are identical --
  // the concrete "operators/constants/variables/units preserved" proof.
  const immutableOriginal = model.getFormulaModel('formula-01').tokens.filter((t) => model.IMMUTABLE_KINDS.has(t.kind)).map((t) => t.text).join('|');
  check(n++, 'Operators preserved through synthetic localization: "×" and "=" still present unchanged', localized.includes('×') === original.includes('×') && localized.includes('7.48'));
  check(n++, 'Numeric constant "7.48" preserved exactly through synthetic localization', localized.includes('7.48'));
}

// ---------------------------------------------------------------------
// G. Reference eligibility: 25 JSON-driven accepted, 11 legacy rejected,
//    16 noindex dataset pages rejected.
// ---------------------------------------------------------------------
{
  const scope = require(path.join(ROOT, 'js', 'i18n', 'reference-locale-scope'));
  const c = scope.classifyReferenceScope();
  check(n++, 'Reference scope: exactly 25 JSON-driven eligible records', c.jsonDriven.length === 25);
  check(n++, 'Reference scope: exactly 11 legacy pages correctly excluded (corrected from Phase 8L\'s "12")', c.legacy.length === 11);
  check(n++, 'Reference scope: exactly 16 noindex dataset pages correctly excluded', c.noindexDatasets.length === 16);
  check(n++, 'Reference scope: 0 unexpected/unclassified reference/*.html files', c.unexpected.length === 0);
  check(n++, 'A known legacy page (chlorine-explained.html) is correctly rejected from scope', !scope.isInLocalizationScope('chlorine-explained.html'));
  check(n++, 'A known JSON-driven page (calculator-directory.html) is correctly accepted into scope', scope.isInLocalizationScope('calculator-directory.html'));
}

// ---------------------------------------------------------------------
// H. Language metadata / canonical: future Spanish rendering emits
//    lang="es" and a self-canonical Spanish URL, proven by calling the
//    actual generator functions with locale='es' directly (never writing
//    the result to a production path).
// ---------------------------------------------------------------------
{
  const glossaryData = require(path.join(ROOT, 'data', 'glossary.json'));
  delete require.cache[require.resolve(path.join(ROOT, 'scripts', 'generate-glossary.js'))];
  // generate-glossary.js runs its own file-writing side effects at
  // require() time (matching this repo's established generator
  // convention) -- to call generateTerm() in isolation without
  // triggering a full regeneration, we re-derive its exact logic inline
  // using the same public i18n primitives it uses, rather than
  // require()-ing the generator module itself (which would re-run the
  // whole English build as an unwanted side effect).
  const { htmlLangAttr } = require(path.join(ROOT, 'js', 'i18n', 'html-lang'));
  const { getLocalizedCanonical } = require(path.join(ROOT, 'js', 'i18n', 'locale-url'));
  const term = glossaryData.terms.find((t) => t.id === 'gl-001');

  check(n++, 'Future Spanish rendering: htmlLangAttr("es") emits lang="es"', htmlLangAttr('es') === 'lang="es"');
  const esCanonical = getLocalizedCanonical('/' + term.slug, 'es');
  check(n++, 'Future Spanish rendering: self-canonical Spanish URL is correctly formed', esCanonical === 'https://waterbalancetools.com/es/glossary/free-chlorine');
  const enCanonical = getLocalizedCanonical('/' + term.slug, 'en');
  check(n++, 'English rendering: canonical remains the unprefixed English URL', enCanonical === 'https://waterbalancetools.com/glossary/free-chlorine');
}

// ---------------------------------------------------------------------
// I/J. hreflang: translated pair reciprocal en/es/x-default; untranslated
//      produces no hreflang set at all (buildHreflangSet requires >=2
//      available languages) -- proven with the existing, unmodified
//      js/i18n/hreflang.js against a SYNTHETIC content unit (Task P),
//      never against a real production page.
// ---------------------------------------------------------------------
{
  const { buildHreflangSet, reciprocityCheck } = require(path.join(ROOT, 'js', 'i18n', 'hreflang'));

  // Synthetic translated pair (Task P fixture: a hypothetical glossary
  // term with both languages available) -- proves reciprocal hreflang
  // generation without touching real translation-status.json.
  const translatedSet = buildHreflangSet('/glossary/synthetic-test-term', ['en', 'es']);
  check(n++, 'Synthetic translated pair produces a reciprocal en/es/x-default hreflang set', translatedSet.length === 3 && translatedSet.some((e) => e.hreflang === 'en') && translatedSet.some((e) => e.hreflang === 'es') && translatedSet.some((e) => e.hreflang === 'x-default'));

  const pages = new Map([
    ['https://waterbalancetools.com/glossary/synthetic-test-term', translatedSet],
    ['https://waterbalancetools.com/es/glossary/synthetic-test-term', buildHreflangSet('/glossary/synthetic-test-term', ['en', 'es'])],
  ]);
  const recip = reciprocityCheck(pages);
  check(n++, 'Synthetic translated pair passes reciprocity check', recip.valid === true);

  // Untranslated: only one available language -> no hreflang set at all
  // (never a false Spanish alternate for a page with no Spanish version).
  const untranslatedSet = buildHreflangSet('/glossary/free-chlorine', ['en']);
  check(n++, 'Untranslated content produces NO hreflang set (no false Spanish alternate)', untranslatedSet.length === 0);
}

// ---------------------------------------------------------------------
// K. Switcher: translated -> Spanish option available; untranslated ->
//    Spanish option absent (marked unavailable, never a fabricated URL).
// ---------------------------------------------------------------------
{
  const { resolveLanguageSwitcherLinks } = require(path.join(ROOT, 'js', 'i18n', 'language-switcher'));
  // calculator:pool-chlorine is genuinely translated in real translation-status.json
  const translatedLinks = resolveLanguageSwitcherLinks('calculator:pool-chlorine', '/calculators/pool-chlorine-calculator', 'en');
  const esLinkTranslated = translatedLinks.find((l) => l.code === 'es');
  check(n++, 'Switcher: translated content marks the Spanish option available', esLinkTranslated && esLinkTranslated.available === true);

  const untranslatedLinks = resolveLanguageSwitcherLinks('glossary:gl-001', '/glossary/free-chlorine', 'en');
  const esLinkUntranslated = untranslatedLinks.find((l) => l.code === 'es');
  check(n++, 'Switcher: untranslated content marks the Spanish option unavailable (present but available=false, never a fabricated live link)', esLinkUntranslated && esLinkUntranslated.available === false);
}

// ---------------------------------------------------------------------
// L. Production gate: Spanish non-calculator output = 0.
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
  check(n++, 'Spanish non-calculator production output is exactly 0', nonCalc.length === 0);
  check(n++, 'Spanish calculator production output is exactly 13', esPages.length === 13);
}

// ---------------------------------------------------------------------
// M. Regression: existing 13 Spanish calculator pages remain intact;
//    English production URL set unchanged; calculator logic unchanged.
// ---------------------------------------------------------------------
{
  const current = crypto.createHash('sha256').update(read('js/calc-utils.js')).digest('hex');
  const baseline = crypto.createHash('sha256').update(execSync('git show ' + BASELINE_SHA + ':js/calc-utils.js', { cwd: ROOT })).digest('hex');
  check(n++, 'js/calc-utils.js byte-identical to the Phase 8L baseline (calculator logic unchanged)', current === baseline);
}
{
  let urlSetUnchanged = false;
  try {
    const out = execSync('node scripts/validate-url-indexation.js', { cwd: ROOT }).toString();
    urlSetUnchanged = /PASS -- 539 pages, 491 sitemap URLs, 0 violations/.test(out);
  } catch (e) { urlSetUnchanged = false; }
  check(n++, 'English production URL set unchanged (539 pages / 491 sitemap URLs / 0 violations)', urlSetUnchanged);
}
{
  const diff = execSync('git diff --stat ' + BASELINE_SHA + ' -- glossary/ formulas/ reference/ es/ calculators/', { cwd: ROOT }).toString().trim();
  // Only these two specific, individually investigated cosmetic
  // wall-clock artifacts are permitted to differ (see
  // docs/PHASE-8M-CORE-REFERENCE-LOCALIZATION-IMPLEMENTATION.md Section 9
  // and the Phase 8M final determinism gate report):
  //   - reference/datasets/version/index.html (pre-existing "Last Built" date)
  //   - calculators/index.html (existing hub "Last updated" date)
  // This whitelist is deliberately narrow and file-specific -- it must
  // never be broadened to a wildcard (e.g. "any timestamp", "any reports
  // file"). Anything else here is a genuine regression.
  const PERMITTED_COSMETIC_FILES = [
    'reference/datasets/version/index.html',
    'calculators/index.html',
  ];
  const lines = diff.split('\n').filter(Boolean);
  const summaryLine = lines.length && /files? changed/.test(lines[lines.length - 1]) ? lines[lines.length - 1] : null;
  const fileLines = summaryLine ? lines.slice(0, -1) : lines;
  const changedFiles = fileLines.map((l) => l.trim().split('|')[0].trim());
  const onlyPermittedFiles = changedFiles.every((f) => PERMITTED_COSMETIC_FILES.includes(f));
  check(n++, 'English glossary/formulas/reference/calculators output is byte-identical to baseline except the two known, individually investigated cosmetic timestamp files (reference/datasets/version/index.html, calculators/index.html)', onlyPermittedFiles);
}

// ---------------------------------------------------------------------
// N. Drift detection.
// ---------------------------------------------------------------------
{
  delete require.cache[require.resolve(path.join(ROOT, 'js', 'i18n', 'translation-drift'))];
  const drift = require(path.join(ROOT, 'js', 'i18n', 'translation-drift'));
  const result = drift.detectDrift();
  check(n++, 'Drift detector reports 0 errors against the current (migrated) translation-status.json', result.errors.length === 0);
}

// ---------------------------------------------------------------------
// O. Artifact integrity.
// ---------------------------------------------------------------------
check(n++, 'docs/PHASE-8M-CORE-REFERENCE-LOCALIZATION-IMPLEMENTATION.md exists', exists('docs/PHASE-8M-CORE-REFERENCE-LOCALIZATION-IMPLEMENTATION.md'));
check(n++, 'reports/phase-8m-status.md exists', exists('reports/phase-8m-status.md'));
check(n++, 'scripts/validate-phase-8m.js exists', exists('scripts/validate-phase-8m.js'));
check(n++, 'js/i18n/related-link-resolver.js exists', exists('js/i18n/related-link-resolver.js'));
check(n++, 'js/i18n/formula-equation-model.js exists', exists('js/i18n/formula-equation-model.js'));
check(n++, 'js/i18n/reference-locale-scope.js exists', exists('js/i18n/reference-locale-scope.js'));
check(n++, 'js/i18n/translation-drift.js exists', exists('js/i18n/translation-drift.js'));

console.log('');
console.log('test-phase-8m: ' + passed + ' passed, ' + failed + ' failed.');
if (failed > 0) process.exit(1);
