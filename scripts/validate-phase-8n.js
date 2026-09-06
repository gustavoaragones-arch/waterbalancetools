#!/usr/bin/env node
/**
 * validate-phase-8n.js
 *
 * Validates the Phase 8N Spanish Core Reference Knowledge Production
 * Cluster: the first real Spanish production content for Glossary,
 * Formulas, and Reference, built on the Phase 8L/8M localization
 * architecture. Checks the deterministic scope (54 glossary + 9 formula
 * + 25 reference records), content-ID integrity, mathematical/tabular
 * data preservation, the generation mechanism, i18n wiring, and
 * English non-regression.
 *
 * Read-only. Does not end with a blanket `git checkout HEAD -- .`
 * self-cleanup step (see validate-phase-8m.js's header comment for why
 * that pattern is unsafe to reuse here).
 *
 * Run: node scripts/validate-phase-8n.js
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
function readJson(rel) { return JSON.parse(read(rel)); }

const BASELINE_SHA = 'af4ba29ad344b0a52e874e961498e20b09ae0578'; // Phase 8M closeout

// ---------------------------------------------------------------------
// A. Baseline
// ---------------------------------------------------------------------
try {
  const log = execSync('git log --oneline -1 ' + BASELINE_SHA, { cwd: ROOT }).toString().trim();
  if (log) ok('A. Mandatory baseline commit ' + BASELINE_SHA.slice(0, 7) + ' (Phase 8M closeout) is present in history');
  else err('A. Baseline commit not found in history');
} catch (e) {
  err('A. Could not verify baseline commit: ' + e.message);
}

// ---------------------------------------------------------------------
// B. Repository re-audit: counts match what Phase 8N's spec re-derived
// ---------------------------------------------------------------------
{
  const glossary = readJson('data/glossary.json');
  const formulas = readJson('data/formulas.json');
  const reference = readJson('data/reference.json');
  if (glossary.terms.length === 100) ok('B1. Glossary: 100 total terms (unchanged from Phase 8L/8M)');
  else err('B1. Glossary: expected 100 total terms, found ' + glossary.terms.length);
  if (formulas.formulas.length === 9) ok('B2. Formulas: 9 total records (unchanged)');
  else err('B2. Formulas: expected 9, found ' + formulas.formulas.length);
  if (reference.pages.length === 25) ok('B3. Reference: 25 JSON-driven records (unchanged)');
  else err('B3. Reference: expected 25, found ' + reference.pages.length);

  const { classifyReferenceScope, EXPECTED_LEGACY_COUNT, EXPECTED_NOINDEX_DATASET_COUNT } = require('../js/i18n/reference-locale-scope');
  const scope = classifyReferenceScope();
  if (scope.legacy.length === EXPECTED_LEGACY_COUNT) ok('B4. Reference: 11 legacy pages confirmed out of scope');
  else err('B4. Reference: legacy count changed -- was ' + EXPECTED_LEGACY_COUNT + ', found ' + scope.legacy.length + ' (spec requires STOP-and-report on this exact condition)');
  if (scope.noindexDatasets.length === EXPECTED_NOINDEX_DATASET_COUNT) ok('B5. Reference: 16 noindex dataset pages confirmed out of scope');
  else err('B5. Reference: noindex dataset count changed -- was ' + EXPECTED_NOINDEX_DATASET_COUNT + ', found ' + scope.noindexDatasets.length);
  if (scope.unexpected.length === 0) ok('B6. Reference: 0 unexpected/unclassified files');
  else err('B6. Reference: unexpected files found: ' + JSON.stringify(scope.unexpected));
}

// ---------------------------------------------------------------------
// C. Deterministic production scope: exactly 54 + 9 + 25 records carry `es`
// ---------------------------------------------------------------------
{
  const glossary = readJson('data/glossary.json');
  const formulas = readJson('data/formulas.json');
  const reference = readJson('data/reference.json');
  const manifest = readJson('data/i18n/es/glossary-first-wave.json');
  const manifestIds = (manifest.candidates || manifest).map((c) => c.nativeId).sort();

  const glossaryWithEs = glossary.terms.filter((t) => t.es).map((t) => t.id).sort();
  if (glossaryWithEs.length === 54) ok('C1. Exactly 54 glossary terms carry Spanish content');
  else err('C1. Expected 54 glossary terms with es content, found ' + glossaryWithEs.length);
  if (JSON.stringify(glossaryWithEs) === JSON.stringify(manifestIds)) ok('C2. Populated glossary IDs match the Phase 8L 54-candidate manifest exactly (no drift, no substitution)');
  else err('C2. Populated glossary IDs diverge from data/i18n/es/glossary-first-wave.json manifest');

  const formulasWithEs = formulas.formulas.filter((f) => f.es);
  if (formulasWithEs.length === 9) ok('C3. All 9 formula records carry Spanish content');
  else err('C3. Expected 9 formulas with es content, found ' + formulasWithEs.length);

  const { getJsonDrivenScope } = require('../js/i18n/reference-locale-scope');
  const jsonDrivenScope = getJsonDrivenScope();
  const referenceWithEs = reference.pages.filter((p) => p.es);
  if (referenceWithEs.length === 25) ok('C4. All 25 JSON-driven reference records carry Spanish content');
  else err('C4. Expected 25 reference records with es content, found ' + referenceWithEs.length);
  const outOfScope = referenceWithEs.filter((p) => !jsonDrivenScope.has(p.slug.split('/').pop() + '.html'));
  if (outOfScope.length === 0) ok('C5. Every Spanish-populated reference record is in the 25-page JSON-driven scope (no legacy/noindex pages localized)');
  else err('C5. Reference records localized outside JSON-driven scope: ' + JSON.stringify(outOfScope.map((p) => p.id)));
}

// ---------------------------------------------------------------------
// D. Content-ID integrity: native IDs only, no duplicates, no legacy revival
// ---------------------------------------------------------------------
{
  const status = readJson('data/i18n/translation-status.json');
  const ids = status.units.map((u) => u.contentId);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length === 0) ok('D1. No duplicate content IDs in translation-status.json (' + ids.length + ' units)');
  else err('D1. Duplicate content IDs found: ' + JSON.stringify([...new Set(dup)]));

  const glossaryUnits = status.units.filter((u) => u.category === 'glossary');
  const formulaUnits = status.units.filter((u) => u.category === 'formula');
  const referenceUnits = status.units.filter((u) => u.category === 'reference');
  if (glossaryUnits.length === 54) ok('D2. Exactly 54 glossary translation-status units (1 pre-existing gl-001 updated in place + 53 new)');
  else err('D2. Expected 54 glossary units, found ' + glossaryUnits.length);
  if (formulaUnits.length === 9) ok('D3. Exactly 9 formula translation-status units');
  else err('D3. Expected 9 formula units, found ' + formulaUnits.length);
  if (referenceUnits.length === 25) ok('D4. Exactly 25 reference translation-status units');
  else err('D4. Expected 25 reference units, found ' + referenceUnits.length);

  const legacyRevival = ids.filter((id) => /^glossary:free-chlorine$|^formula:pool-volume$|^reference:ideal-pool-levels$/.test(id));
  if (legacyRevival.length === 0) ok('D5. No legacy fixture content IDs revived (glossary:free-chlorine / formula:pool-volume / reference:ideal-pool-levels)');
  else err('D5. Legacy fixture IDs found: ' + JSON.stringify(legacyRevival));

  const allTranslated = [...glossaryUnits, ...formulaUnits, ...referenceUnits].every((u) => u.languages.es.status === 'translated');
  if (allTranslated) ok('D6. All 88 Phase 8N units report es.status === "translated"');
  else err('D6. At least one Phase 8N unit does not report es: translated');
}

// ---------------------------------------------------------------------
// E. Mathematical / tabular identity preservation
// ---------------------------------------------------------------------
{
  const { reconstructEquation, getAllFormulaIds } = require('../js/i18n/formula-equation-model');
  const formulas = readJson('data/formulas.json');
  let equationMismatches = 0;
  for (const id of getAllFormulaIds()) {
    const record = formulas.formulas.find((f) => f.id === id);
    if (!record) { err('E1. Formula model references unknown id ' + id); continue; }
    if (reconstructEquation(id) !== record.equation) equationMismatches++;
  }
  if (equationMismatches === 0) ok('E1. reconstructEquation() matches data/formulas.json equation string for all 9 formulas (Spanish content did not touch equations)');
  else err('E1. ' + equationMismatches + ' formula(s) have a reconstructed equation mismatch');

  const variablesUntouched = formulas.formulas.every((f) => !f.es || !('variables' in f.es));
  if (variablesUntouched) ok('E2. No formula es object defines a `variables` override (symbols/units never localized)');
  else err('E2. A formula es object defines `variables` -- violates the never-alter-variables mandate');

  const reference = readJson('data/reference.json');
  let tableRowsUntouched = true;
  reference.pages.filter((p) => p.es && p.es.tables).forEach((p) => {
    p.es.tables.forEach((t) => {
      if ('headers' in t || 'rows' in t) tableRowsUntouched = false;
    });
  });
  if (tableRowsUntouched) ok('E3. Reference es.tables entries carry only translated titles -- headers/rows are not overridden (documented scope limitation)');
  else err('E3. A reference es.tables entry overrides headers/rows -- exceeds documented scope');
}

// ---------------------------------------------------------------------
// F. English non-regression
// ---------------------------------------------------------------------
{
  const families = [
    ['data/glossary.json', 'terms', ['id', 'slug', 'term', 'abbreviation', 'definition', 'explanation', 'whyItMatters', 'typicalValues', 'relatedCalculators', 'relatedArticles', 'relatedFormulas', 'lastReviewed']],
    ['data/formulas.json', 'formulas', ['id', 'slug', 'title', 'description', 'summary', 'readingTime', 'lastReviewed', 'keywords', 'equation', 'variables', 'workedExample', 'explanation', 'limitations', 'relatedCalculators', 'relatedGlossary', 'relatedFormulas', 'sources']],
    ['data/reference.json', 'pages', ['id', 'slug', 'title', 'description', 'summary', 'lastReviewed', 'readingTime', 'overview', 'tables', 'checklists', 'notes', 'relatedCalculators', 'sources']],
  ];
  let mismatches = 0;
  families.forEach(([file, key, fields]) => {
    const cur = readJson(file);
    const orig = JSON.parse(execSync('git show ' + BASELINE_SHA + ':' + file, { cwd: ROOT }).toString());
    cur[key].forEach((r) => {
      const o = orig[key].find((x) => x.id === r.id);
      if (!o) return;
      fields.forEach((f) => {
        if (JSON.stringify(o[f]) !== JSON.stringify(r[f])) mismatches++;
      });
    });
  });
  if (mismatches === 0) ok('F1. Every English field in data/glossary.json, data/formulas.json, data/reference.json is byte-identical to the Phase 8M baseline commit');
  else err('F1. ' + mismatches + ' English field mismatch(es) found vs baseline');
}

// ---------------------------------------------------------------------
// G. Spanish page generation mechanism
// ---------------------------------------------------------------------
{
  if (exists('scripts/generate-spanish-knowledge-cluster.js')) ok('G1. scripts/generate-spanish-knowledge-cluster.js exists (Phase 8E-pattern standalone generator)');
  else err('G1. scripts/generate-spanish-knowledge-cluster.js is missing');

  const glossaryGen = read('scripts/generate-glossary.js');
  const formulasGen = read('scripts/generate-formulas.js');
  const referenceGen = read('scripts/generate-reference.js');
  if (/module\.exports\s*=\s*\{\s*generateTerm/.test(glossaryGen)) ok('G2. generate-glossary.js exports generateTerm for reuse (no second implementation)');
  else err('G2. generate-glossary.js does not export generateTerm');
  if (/module\.exports\s*=\s*\{\s*generateFormula/.test(formulasGen)) ok('G3. generate-formulas.js exports generateFormula for reuse');
  else err('G3. generate-formulas.js does not export generateFormula');
  if (/module\.exports\s*=\s*\{\s*generateRefPage/.test(referenceGen)) ok('G4. generate-reference.js exports generateRefPage for reuse');
  else err('G4. generate-reference.js does not export generateRefPage');

  let esFileCount = 0;
  ['es/glossary', 'es/formulas', 'es/reference'].forEach((d) => {
    if (exists(d)) esFileCount += fs.readdirSync(path.join(ROOT, d)).filter((f) => f.endsWith('.html')).length;
  });
  if (esFileCount === 88) ok('G5. Exactly 88 Spanish production files exist on disk (54 + 9 + 25)');
  else err('G5. Expected 88 Spanish files on disk, found ' + esFileCount);
}

// ---------------------------------------------------------------------
// H. i18n integration: lang, canonical, hreflang, switcher
// ---------------------------------------------------------------------
{
  const sample = [
    ['es/glossary/free-chlorine.html', 'glossary/free-chlorine.html'],
    ['es/formulas/pool-volume-formula.html', 'formulas/pool-volume-formula.html'],
    ['es/reference/ideal-pool-levels.html', 'reference/ideal-pool-levels.html'],
  ];
  let allGood = true;
  sample.forEach(([esFile, enFile]) => {
    if (!exists(esFile) || !exists(enFile)) { allGood = false; return; }
    const esHtml = read(esFile);
    const enHtml = read(enFile);
    if (!/<html lang="es">/.test(esHtml)) allGood = false;
    if (!/<link rel="canonical" href="https:\/\/waterbalancetools\.com\/es\//.test(esHtml)) allGood = false;
    if (!/i18n-hreflang:start/.test(esHtml) || !/i18n-hreflang:start/.test(enHtml)) allGood = false;
    if (!/i18n-switcher:start/.test(esHtml) || !/i18n-switcher:start/.test(enHtml)) allGood = false;
    if (!/hreflang="en"/.test(esHtml) || !/hreflang="es"/.test(enHtml)) allGood = false;
  });
  if (allGood) ok('H1. Sampled Spanish pages have html lang="es", self-canonical /es/ URL, reciprocal hreflang + switcher on both sides');
  else err('H1. One or more sampled Spanish/English page pairs is missing required i18n wiring');
}

// ---------------------------------------------------------------------
// I. Related-link resolution: Policy A, no fabrication
// ---------------------------------------------------------------------
{
  const html = read('es/glossary/free-chlorine.html');
  if (/href="\/es\/calculators\/pool-chlorine-calculator"/.test(html)) ok('I1. Translated related-calculator target resolves to its /es/ URL');
  else warn('I1. Expected translated related-calculator link not found in sample page (non-fatal, spot-check only)');
  if (/href="\/academy\/sanitizers\/understanding-free-chlorine"/.test(html)) ok('I2. Untranslated related-article target correctly falls back to its English URL (Policy A)');
  else warn('I2. Expected Policy-A fallback link not found in sample page (non-fatal, spot-check only)');
}

// ---------------------------------------------------------------------
// J. Translation-status / drift integrity
// ---------------------------------------------------------------------
{
  const { buildNativeIdIndex, detectDrift } = require('../js/i18n/translation-drift');
  const drift = detectDrift(buildNativeIdIndex());
  if (drift.errors.length === 0) ok('J1. translation-drift.js reports 0 errors');
  else err('J1. translation-drift.js reports ' + drift.errors.length + ' error(s): ' + JSON.stringify(drift.errors).slice(0, 300));
}

// ---------------------------------------------------------------------
// K. Sitemap / navigation / search inclusion
// ---------------------------------------------------------------------
{
  const sitemapGlossary = exists('sitemap-glossary.xml') ? read('sitemap-glossary.xml') : '';
  const sitemapFormulas = exists('sitemap-formulas.xml') ? read('sitemap-formulas.xml') : '';
  const sitemapReference = exists('sitemap-reference.xml') ? read('sitemap-reference.xml') : '';
  const esInGlossarySitemap = (sitemapGlossary.match(/\/es\/glossary\//g) || []).length;
  const esInFormulasSitemap = (sitemapFormulas.match(/\/es\/formulas\//g) || []).length;
  const esInReferenceSitemap = (sitemapReference.match(/\/es\/reference\//g) || []).length;
  if (esInGlossarySitemap === 54) ok('K1. sitemap-glossary.xml lists exactly 54 /es/glossary/ URLs');
  else err('K1. Expected 54 /es/glossary/ sitemap URLs, found ' + esInGlossarySitemap);
  if (esInFormulasSitemap === 9) ok('K2. sitemap-formulas.xml lists exactly 9 /es/formulas/ URLs');
  else err('K2. Expected 9 /es/formulas/ sitemap URLs, found ' + esInFormulasSitemap);
  if (esInReferenceSitemap === 25) ok('K3. sitemap-reference.xml lists exactly 25 /es/reference/ URLs');
  else err('K3. Expected 25 /es/reference/ sitemap URLs, found ' + esInReferenceSitemap);

  if (exists('data/navigation.json')) {
    const nav = readJson('data/navigation.json');
    const navStr = JSON.stringify(nav);
    const navEsCount = (navStr.match(/"\/es\/(glossary|formulas|reference)\//g) || []).length;
    if (navEsCount >= 88) ok('K4. data/navigation.json indexes the new Spanish pages (>= 88 references found)');
    else warn('K4. data/navigation.json has fewer than 88 references to the new Spanish pages (' + navEsCount + ') -- verify manually');
  }
}

// ---------------------------------------------------------------------
// L. Absolute prohibitions spot-check
// ---------------------------------------------------------------------
{
  const calcUtils = read('js/calc-utils.js');
  const baselineCalcUtils = execSync('git show ' + BASELINE_SHA + ':js/calc-utils.js', { cwd: ROOT }).toString();
  if (calcUtils === baselineCalcUtils) ok('L1. js/calc-utils.js is byte-identical to the Phase 8M baseline (no calculator logic touched)');
  else err('L1. js/calc-utils.js has changed since the Phase 8M baseline');

  let noOtherFamilyLocalized = true;
  ['data/academy.json'].forEach((f) => {
    if (!exists(f)) return;
    const d = readJson(f);
    const arr = d.articles || [];
    if (arr.some((r) => r.es)) noOtherFamilyLocalized = false;
  });
  if (noOtherFamilyLocalized) ok('L2. No Academy records carry an es object (scope stayed within Glossary/Formulas/Reference)');
  else err('L2. An out-of-scope family (Academy) has been localized');
}

// ---------------------------------------------------------------------
// M. No commit / no push made by this phase
// ---------------------------------------------------------------------
{
  const status = execSync('git status --porcelain', { cwd: ROOT }).toString();
  if (status.trim().length > 0) ok('M1. Working tree has uncommitted changes, as required (Phase 8N must not self-commit)');
  else warn('M1. Working tree is clean -- unexpected if Phase 8N work is present and uncommitted');
  try {
    const logCount = execSync('git log --oneline -5', { cwd: ROOT }).toString();
    if (!/phase 8n/i.test(logCount)) ok('M2. No "Phase 8N" commit found in recent history (no self-commit occurred)');
    else err('M2. A Phase 8N commit was found in git history -- this phase must not commit');
  } catch (e) {
    warn('M2. Could not inspect git log: ' + e.message);
  }
}

console.log('');
console.log(`validate-phase-8n: ${errors} error(s), ${warnings} warning(s)`);
if (errors > 0) process.exit(1);
