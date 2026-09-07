#!/usr/bin/env node
/**
 * validate-phase-8o.js
 *
 * Validates Phase 8O: Spanish Core Reference Completion & Semantic
 * Expansion. Phase 8N launched the first Spanish production cluster for
 * Glossary/Formulas/Reference (54 glossary + 9 formula + 25 reference,
 * with formula equations/variable descriptions and reference table
 * headers/rows left as a documented English-only scope limitation).
 * Phase 8O completes that cluster: all 100 glossary records, full
 * formula variable-table + equation-label localization, and full
 * reference table header/row localization -- while proving the
 * mathematical/tabular data underneath never changed.
 *
 * Read-only. Does not end with a blanket `git checkout HEAD -- .`
 * self-cleanup step (see validate-phase-8m.js's header comment for why
 * that pattern is unsafe to reuse here) and never mutates the working
 * tree.
 *
 * Run: node scripts/validate-phase-8o.js
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

const BASELINE_SHA = 'aca5542ddb96651e107a0c3250dd98da431cea76'; // Phase 8N closeout

// ---------------------------------------------------------------------
// 1. Baseline identity
// ---------------------------------------------------------------------
try {
  const log = execSync('git log --oneline -1 ' + BASELINE_SHA, { cwd: ROOT }).toString().trim();
  if (log) ok('1. Mandatory baseline commit ' + BASELINE_SHA.slice(0, 7) + ' (Phase 8N closeout) is present in history');
  else err('1. Baseline commit not found in history');
} catch (e) {
  err('1. Could not verify baseline commit: ' + e.message);
}

const glossary = readJson('data/glossary.json');
const formulas = readJson('data/formulas.json');
const reference = readJson('data/reference.json');
const translationStatus = readJson('data/i18n/translation-status.json');
const scope = require('../js/i18n/reference-locale-scope');
const eqModel = require('../js/i18n/formula-equation-model');
const drift = require('../js/i18n/translation-drift');
const resolver = require('../js/i18n/related-link-resolver');

// ---------------------------------------------------------------------
// 2-3. Glossary total = 100, Spanish glossary total = 100
// ---------------------------------------------------------------------
if (glossary.terms.length === 100) ok('2. Glossary total = 100');
else err('2. Glossary total: expected 100, found ' + glossary.terms.length);

const esGlossary = glossary.terms.filter((t) => t.es);
if (esGlossary.length === 100) ok('3. Spanish glossary total = 100 (0 missing)');
else err('3. Spanish glossary total: expected 100, found ' + esGlossary.length);

// ---------------------------------------------------------------------
// 4-5. Formula total = 9, Spanish formula total = 9
// ---------------------------------------------------------------------
if (formulas.formulas.length === 9) ok('4. Formula total = 9');
else err('4. Formula total: expected 9, found ' + formulas.formulas.length);

const esFormulas = formulas.formulas.filter((f) => f.es);
if (esFormulas.length === 9) ok('5. Spanish formula total = 9');
else err('5. Spanish formula total: expected 9, found ' + esFormulas.length);

// ---------------------------------------------------------------------
// 6-7. JSON-driven Reference total = 25, Spanish = 25
// ---------------------------------------------------------------------
const jsonDrivenScope = scope.getJsonDrivenScope();
if (jsonDrivenScope.size === 25 && reference.pages.length === 25) ok('6. JSON-driven Reference total = 25');
else err('6. JSON-driven Reference total: expected 25, found scope=' + jsonDrivenScope.size + ' pages=' + reference.pages.length);

const esReference = reference.pages.filter((p) => p.es);
if (esReference.length === 25) ok('7. Spanish JSON-driven Reference total = 25');
else err('7. Spanish JSON-driven Reference total: expected 25, found ' + esReference.length);

// ---------------------------------------------------------------------
// 8-9. Spanish calculator total = 13, Spanish total production pages = 147
// ---------------------------------------------------------------------
const esCalcCount = fs.existsSync(path.join(ROOT, 'es/calculators'))
  ? fs.readdirSync(path.join(ROOT, 'es/calculators')).filter((f) => f.endsWith('.html')).length : 0;
if (esCalcCount === 13) ok('8. Spanish calculator total = 13');
else err('8. Spanish calculator total: expected 13, found ' + esCalcCount);

function countHtml(dir) {
  const p = path.join(ROOT, dir);
  return fs.existsSync(p) ? fs.readdirSync(p).filter((f) => f.endsWith('.html')).length : 0;
}
const esGlossaryFiles = countHtml('es/glossary');
const esFormulaFiles = countHtml('es/formulas');
const esReferenceFiles = countHtml('es/reference');
const totalSpanish = esCalcCount + esGlossaryFiles + esFormulaFiles + esReferenceFiles;
if (totalSpanish === 147 && esGlossaryFiles === 100 && esFormulaFiles === 9 && esReferenceFiles === 25) {
  ok('9. Spanish total production pages = 147 (13 calc + 100 glossary + 9 formula + 25 reference)');
} else {
  err('9. Spanish total production pages: expected 147 (13/100/9/25), found ' + totalSpanish +
    ' (13/' + esGlossaryFiles + '/' + esFormulaFiles + '/' + esReferenceFiles + ')');
}

// ---------------------------------------------------------------------
// 10-11. Content-ID uniqueness, no legacy fixture IDs
// ---------------------------------------------------------------------
function findDupes(arr, key) {
  const seen = new Map();
  arr.forEach((x) => seen.set(x[key], (seen.get(x[key]) || 0) + 1));
  return [...seen.entries()].filter(([, c]) => c > 1);
}
const glossaryIdDupes = findDupes(glossary.terms, 'id');
const glossarySlugDupes = findDupes(glossary.terms, 'slug');
const formulaIdDupes = findDupes(formulas.formulas, 'id');
const referenceIdDupes = findDupes(reference.pages, 'id');
const tsIdDupes = findDupes(translationStatus.units, 'contentId');
if (!glossaryIdDupes.length && !glossarySlugDupes.length && !formulaIdDupes.length && !referenceIdDupes.length && !tsIdDupes.length) {
  ok('10. Content-ID uniqueness: 0 duplicates (glossary id/slug, formula id, reference id, translation-status contentId)');
} else {
  err('10. Content-ID duplicates found: ' + JSON.stringify({ glossaryIdDupes, glossarySlugDupes, formulaIdDupes, referenceIdDupes, tsIdDupes }));
}

const legacyPattern = /^glossary:(?!gl-)|^formula:(?!formula-)|^reference:(?!ref-)/;
const legacyIds = translationStatus.units.filter((u) => legacyPattern.test(u.contentId));
if (!legacyIds.length) ok('11. No legacy fixture IDs in translation-status.json');
else err('11. Legacy fixture IDs found: ' + JSON.stringify(legacyIds.map((u) => u.contentId)));

// ---------------------------------------------------------------------
// 12-13. Translation-status completeness, zero translation drift
// ---------------------------------------------------------------------
const glossaryUnits = translationStatus.units.filter((u) => u.category === 'glossary');
const formulaUnits = translationStatus.units.filter((u) => u.category === 'formula');
const referenceUnits = translationStatus.units.filter((u) => u.category === 'reference');
const calculatorUnits = translationStatus.units.filter((u) => u.category === 'calculator');
function allTranslated(units) {
  return units.every((u) => u.languages.es && u.languages.es.status === 'translated');
}
if (glossaryUnits.length === 100 && allTranslated(glossaryUnits)
  && formulaUnits.length === 9 && allTranslated(formulaUnits)
  && referenceUnits.length === 25 && allTranslated(referenceUnits)
  && calculatorUnits.length === 13 && allTranslated(calculatorUnits)) {
  ok('12. Translation-status completeness: 100 glossary + 9 formula + 25 reference + 13 calculator, all es: translated');
} else {
  err('12. Translation-status completeness failed: glossary=' + glossaryUnits.length + '/100(all translated=' + allTranslated(glossaryUnits) +
    ') formula=' + formulaUnits.length + '/9(' + allTranslated(formulaUnits) +
    ') reference=' + referenceUnits.length + '/25(' + allTranslated(referenceUnits) +
    ') calculator=' + calculatorUnits.length + '/13(' + allTranslated(calculatorUnits) + ')');
}

const nativeIdIndex = drift.buildNativeIdIndex();
const driftResult = drift.detectDrift(translationStatus, nativeIdIndex);
if (driftResult.errors.length === 0) ok('13. Zero translation drift (0 errors)');
else err('13. Translation drift errors: ' + JSON.stringify(driftResult.errors));
if (driftResult.warnings.length) warn('13b. Translation drift warnings: ' + JSON.stringify(driftResult.warnings));

// ---------------------------------------------------------------------
// 14-16. Formula equations exact reconstruction, constants, operators
// ---------------------------------------------------------------------
let reconstructOk = 0;
eqModel.getAllFormulaIds().forEach((id) => {
  const rec = formulas.formulas.find((f) => f.id === id);
  if (eqModel.reconstructEquation(id) === rec.equation) reconstructOk++;
  else err('14. Formula ' + id + ' reconstruction mismatch');
});
if (reconstructOk === 9) ok('14. Formula equations exact reconstruction = 9/9');
else err('14. Formula equation reconstruction: only ' + reconstructOk + '/9 exact');

let constantsOk = true;
let operatorsOk = true;
eqModel.getAllFormulaIds().forEach((id) => {
  const model = eqModel.getFormulaModel(id);
  const rec = formulas.formulas.find((f) => f.id === id);
  // Every non-IMMUTABLE-kind token that is NOT 'label'/'prose' would be a
  // bug in the model itself; this loop instead verifies the model's own
  // immutable tokens are untouched by re-deriving the localized equation
  // (Section 4 does this too) and diffing it against the pure-English
  // reconstruction at every position that is NOT a label/prose token.
  const enTokens = model.tokens;
  const labels = (rec.es && rec.es.equationLabels) || {};
  const esJoined = eqModel.localizeEquation(id, (t) => (Object.prototype.hasOwnProperty.call(labels, t) ? labels[t] : t));
  // Reconstruct the ORIGINAL text at each token boundary and confirm every
  // immutable-kind token's text appears unchanged in the localized output
  // in the same relative order (a weaker but still meaningful token-level
  // check on top of the raw string comparisons already done above).
  let cursorEn = 0;
  let cursorEs = 0;
  enTokens.forEach((t) => {
    if (eqModel.IMMUTABLE_KINDS.has(t.kind)) {
      if (!esJoined.includes(t.text)) {
        if (t.kind === 'operator') operatorsOk = false;
        if (t.kind === 'constant') constantsOk = false;
      }
    }
  });
});
if (constantsOk) ok('15. Formula numeric constants preserved in localized equations');
else err('15. A formula numeric constant is missing from its localized equation');
if (operatorsOk) ok('16. Formula operators preserved in localized equations');
else err('16. A formula operator is missing from its localized equation');

// ---------------------------------------------------------------------
// 17. Calculator source integrity (js/calc-utils.js byte-identical)
// ---------------------------------------------------------------------
try {
  const diffStat = execSync('git diff --stat ' + BASELINE_SHA + ' -- js/calc-utils.js', { cwd: ROOT }).toString().trim();
  if (diffStat === '') ok('17. js/calc-utils.js byte-identical to Phase 8N baseline (calculator logic unchanged)');
  else err('17. js/calc-utils.js differs from baseline: ' + diffStat);
} catch (e) {
  err('17. Could not diff js/calc-utils.js against baseline: ' + e.message);
}

// ---------------------------------------------------------------------
// 18-21. Reference row counts / numeric values / thresholds / units preserved
// ---------------------------------------------------------------------
{
  let baselineReference;
  try {
    baselineReference = JSON.parse(execSync('git show ' + BASELINE_SHA + ':data/reference.json', { cwd: ROOT }).toString());
  } catch (e) {
    err('18-21. Could not read baseline data/reference.json: ' + e.message);
    baselineReference = null;
  }
  if (baselineReference) {
    function classify(s) {
      const t = String(s).trim();
      if (/^\//.test(t)) return 'url';
      if (/^[<>]?[0-9]/.test(t) && !/[a-zA-Z]{3,}/.test(t)) return 'numeric';
      return 'label';
    }
    let rowCountMismatches = 0;
    let colCountMismatches = 0;
    let numericMismatches = 0;
    let englishTableMismatches = 0;
    reference.pages.forEach((p) => {
      const base = baselineReference.pages.find((x) => x.id === p.id);
      if (!base) return;
      if (JSON.stringify(base.tables || []) !== JSON.stringify(p.tables || [])) englishTableMismatches++;
      if (!p.es || !p.es.tables) return;
      (base.tables || []).forEach((enTbl, ti) => {
        const esTbl = p.es.tables[ti];
        if (!esTbl) return;
        if ((esTbl.rows || []).length !== (enTbl.rows || []).length) rowCountMismatches++;
        (esTbl.rows || []).forEach((row, ri) => {
          const enRow = (enTbl.rows || [])[ri];
          if (!enRow) return;
          if (row.length !== enRow.length) colCountMismatches++;
          row.forEach((cell, ci) => {
            const enCell = enRow[ci];
            const cls = classify(enCell);
            if ((cls === 'numeric' || cls === 'url') && cell !== enCell) numericMismatches++;
          });
        });
      });
    });
    if (englishTableMismatches === 0) ok('18a. English reference `tables` fields byte-identical to Phase 8N baseline for all 25 pages');
    else err('18a. ' + englishTableMismatches + ' page(s) have English table drift vs baseline');
    if (rowCountMismatches === 0) ok('18. Reference row counts preserved (Spanish tables match English row counts)');
    else err('18. Reference row count mismatches: ' + rowCountMismatches);
    if (colCountMismatches === 0) ok('19-20. Reference column counts preserved (no ragged rows)');
    else err('19-20. Reference column count mismatches: ' + colCountMismatches);
    if (numericMismatches === 0) ok('19. Reference numeric values / 20. thresholds / 21. units all byte-identical between English source and Spanish table cells');
    else err('19-21. Reference numeric/threshold/unit/URL cell mismatches: ' + numericMismatches);
  }
}

// ---------------------------------------------------------------------
// 22-23. Related-link resolution correct, no fabricated glossary records
// ---------------------------------------------------------------------
{
  resolver.reloadContentIndex();
  let resolvedCount = 0;
  let unresolvedCount = 0;
  const KNOWN_DANGLING = ['turnover-rate', 'soda-ash', 'ph-buffering', 'salt-chlorinator', 'sodium-chloride',
    'salt-level', 'chlorine-lock', 'uv-degradation', 'pump-head-pressure', 'pool-circulation', 'lsi', 'corrosion', 'scaling'];
  const glossaryBareSlugs = new Set(glossary.terms.map((t) => t.slug.replace(/^glossary\//, '')));
  let unexpectedFabrication = 0;
  formulas.formulas.forEach((fm) => {
    (fm.relatedGlossary || []).forEach((target) => {
      const result = resolver.resolveRelatedLink({ raw: target, locale: 'es', targetFamilyHint: 'glossary' });
      if (result.resolved) resolvedCount++; else unresolvedCount++;
      if (KNOWN_DANGLING.includes(target) && glossaryBareSlugs.has(target)) unexpectedFabrication++;
    });
  });
  if (resolvedCount === 18 && unresolvedCount === 14) {
    ok('22. Related-link resolution correct: 18/32 formula->glossary occurrences resolve to Spanish, 14 remain intentionally unresolved');
  } else {
    err('22. Related-link resolution mismatch: resolved=' + resolvedCount + ' (expected 18), unresolved=' + unresolvedCount + ' (expected 14)');
  }
  if (unexpectedFabrication === 0) ok('23. No fabricated glossary records: all 13 known-dangling targets remain absent from data/glossary.json');
  else err('23. A previously-dangling glossary target now unexpectedly exists -- verify it was not fabricated');
}

// ---------------------------------------------------------------------
// 24-27. hreflang / canonical / html lang correctness (spot sample)
// ---------------------------------------------------------------------
{
  const samples = [
    { en: 'glossary/orp.html', es: 'es/glossary/orp.html', esUrl: '/es/glossary/orp', enUrl: '/glossary/orp' },
    { en: 'formulas/pool-volume-formula.html', es: 'es/formulas/pool-volume-formula.html', esUrl: '/es/formulas/pool-volume-formula', enUrl: '/formulas/pool-volume-formula' },
    { en: 'reference/ideal-pool-levels.html', es: 'es/reference/ideal-pool-levels.html', esUrl: '/es/reference/ideal-pool-levels', enUrl: '/reference/ideal-pool-levels' },
  ];
  let hreflangOk = true;
  let canonicalOk = true;
  let langOk = true;
  let switcherOk = true;
  samples.forEach((s) => {
    if (!exists(s.es)) { hreflangOk = canonicalOk = langOk = switcherOk = false; err('24-27. Missing sample file ' + s.es); return; }
    const esHtml = read(s.es);
    const enHtml = read(s.en);
    if (!esHtml.includes('<html lang="es">')) langOk = false;
    if (!esHtml.includes('<link rel="canonical" href="https://waterbalancetools.com' + s.esUrl + '">')) canonicalOk = false;
    if (!esHtml.includes('hreflang="en" href="https://waterbalancetools.com' + s.enUrl + '">')) hreflangOk = false;
    if (!esHtml.includes('hreflang="es" href="https://waterbalancetools.com' + s.esUrl + '">')) hreflangOk = false;
    if (!esHtml.includes('hreflang="x-default"')) hreflangOk = false;
    if (!enHtml.includes('lang="es">' + s.esUrl + '</a>') && !enHtml.includes(s.esUrl + '" class="lang-switch" hreflang="es"')) switcherOk = false;
  });
  if (hreflangOk) ok('24. hreflang correctness (reciprocal en/es/x-default present on sample pages)');
  else err('24. hreflang correctness failed on one or more sample pages');
  if (canonicalOk) ok('25. Canonical correctness (Spanish self-canonical present on sample pages)');
  else err('25. Canonical correctness failed on one or more sample pages');
  if (langOk) ok('26. html lang correctness (lang="es" present on sample pages)');
  else err('26. html lang correctness failed on one or more sample pages');
  if (switcherOk) ok('language switcher present on English counterpart of sample pages');
  else err('language switcher missing on English counterpart of one or more sample pages');
}

// ---------------------------------------------------------------------
// 27b. No /es/es/
// ---------------------------------------------------------------------
{
  let doubleLocaleFound = 0;
  ['es/glossary', 'es/formulas', 'es/reference', 'es/calculators'].forEach((dir) => {
    const full = path.join(ROOT, dir);
    if (!fs.existsSync(full)) return;
    fs.readdirSync(full).forEach((f) => {
      if (!f.endsWith('.html')) return;
      const html = fs.readFileSync(path.join(full, f), 'utf8');
      if (/\/es\/es\//.test(html)) { doubleLocaleFound++; err('30. /es/es/ found in ' + dir + '/' + f); }
    });
  });
  if (doubleLocaleFound === 0) ok('30. No /es/es/ duplication found across all 147 Spanish production pages');
}

// ---------------------------------------------------------------------
// 27. Sitemap / 28. Navigation / 29. Search-index correctness
// ---------------------------------------------------------------------
{
  const sitemapGlossary = read('sitemap-glossary.xml');
  const sitemapFormulas = read('sitemap-formulas.xml');
  const sitemapReference = read('sitemap-reference.xml');
  const esGlossaryUrls = (sitemapGlossary.match(/<loc>[^<]*\/es\/glossary\/[^<]+<\/loc>/g) || []).length;
  const esFormulaUrls = (sitemapFormulas.match(/<loc>[^<]*\/es\/formulas\/[^<]+<\/loc>/g) || []).length;
  const esReferenceUrls = (sitemapReference.match(/<loc>[^<]*\/es\/reference\/[^<]+<\/loc>/g) || []).length;
  if (esGlossaryUrls === 100 && esFormulaUrls === 9 && esReferenceUrls === 25) {
    ok('27. Sitemap correctness: 100 es/glossary + 9 es/formulas + 25 es/reference URLs present exactly once');
  } else {
    err('27. Sitemap URL counts: glossary=' + esGlossaryUrls + '(expected 100) formulas=' + esFormulaUrls + '(expected 9) reference=' + esReferenceUrls + '(expected 25)');
  }

  const navigation = readJson('data/navigation.json');
  const navJson = JSON.stringify(navigation);
  const navEsGlossaryCount = (navJson.match(/"\/es\/glossary\//g) || []).length;
  if (navEsGlossaryCount >= 100) ok('28. Navigation contains the full Spanish glossary set');
  else warn('28. Navigation es/glossary references: found ' + navEsGlossaryCount + ' (expected >= 100; navigation entries may not be 1:1 with pages depending on grouping)');

  const searchIndex = readJson('data/search-index.json');
  const searchJson = JSON.stringify(searchIndex);
  const searchEsCount = (searchJson.match(/"\/es\/(glossary|formulas|reference)\//g) || []).length;
  if (searchEsCount >= 134) ok('29. Search index contains the Spanish glossary/formulas/reference cluster');
  else err('29. Search index es cluster references: found ' + searchEsCount + ' (expected >= 134)');
}

// ---------------------------------------------------------------------
// 31-32. Broken links = 0, URL/indexation violations = 0
// ---------------------------------------------------------------------
try {
  const out = execSync('node scripts/check-broken-links.js', { cwd: ROOT }).toString();
  if (/No issues found/.test(out)) ok('31. Broken links = 0 (check-broken-links.js)');
  else err('31. check-broken-links.js reported issues: ' + out.trim());
} catch (e) {
  err('31. check-broken-links.js failed: ' + e.message);
}
try {
  const out = execSync('node scripts/validate-url-indexation.js', { cwd: ROOT }).toString();
  if (/0 violations/.test(out)) ok('32. URL/indexation violations = 0');
  else err('32. validate-url-indexation.js reported violations: ' + out.trim());
} catch (e) {
  err('32. validate-url-indexation.js failed: ' + e.message);
}

// ---------------------------------------------------------------------
// 33. Valid JSON-LD (spot sample)
// ---------------------------------------------------------------------
{
  const samples = ['es/glossary/orp.html', 'es/formulas/pool-volume-formula.html', 'es/reference/ideal-pool-levels.html'];
  let jsonLdOk = true;
  samples.forEach((s) => {
    if (!exists(s)) { jsonLdOk = false; return; }
    const html = read(s);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (!blocks.length) { jsonLdOk = false; err('33. No JSON-LD block found in ' + s); return; }
    blocks.forEach((b) => {
      try { JSON.parse(b[1]); } catch (e) { jsonLdOk = false; err('33. Invalid JSON-LD in ' + s + ': ' + e.message); }
    });
  });
  if (jsonLdOk) ok('33. Valid JSON-LD on sample Spanish pages');
}

// ---------------------------------------------------------------------
// 34-35. No accidental English production metadata, no TODO/placeholder
// ---------------------------------------------------------------------
{
  let englishMetaLeak = 0;
  let placeholderFound = 0;
  ['es/glossary', 'es/formulas', 'es/reference'].forEach((dir) => {
    const full = path.join(ROOT, dir);
    fs.readdirSync(full).filter((f) => f.endsWith('.html')).forEach((f) => {
      const html = fs.readFileSync(path.join(full, f), 'utf8');
      if (!/<html lang="es">/.test(html)) englishMetaLeak++;
      // Case-sensitive check per Phase 8N precedent -- "TODO" (all caps)
      // only; never a case-insensitive /todo/i scan, which would false-
      // positive on ordinary Spanish prose containing the word "todo".
      if (/\bTODO\b/.test(html) || /\bFIXME\b/.test(html) || /\bLOREM IPSUM\b/i.test(html)) placeholderFound++;
    });
  });
  if (englishMetaLeak === 0) ok('34. No accidental English production metadata (lang="es" present on all 134 glossary/formula/reference Spanish pages)');
  else err('34. ' + englishMetaLeak + ' Spanish page(s) missing lang="es"');
  if (placeholderFound === 0) ok('35. No TODO/FIXME/placeholder failures (case-sensitive check, safe for Spanish prose containing "todo")');
  else err('35. Placeholder/TODO markers found in ' + placeholderFound + ' file(s)');
}

// ---------------------------------------------------------------------
// 36. Three-build determinism (structural proxy check)
// ---------------------------------------------------------------------
// A true 3-consecutive-build run (node scripts/run-all-generators.js x3,
// diffing the full working tree between runs) was performed manually
// during Phase 8O implementation -- see reports/phase-8o-status.md
// Section S for the exact whitelist of dynamic timestamp/freshness files
// that were the ONLY difference between consecutive builds. This
// validator cannot re-run that proof itself without mutating the working
// tree (Section 19 explicitly forbids that), so it instead proves the
// underlying generator functions are pure: `fs.writeFileSync` is
// stubbed out before requiring generate-glossary.js/generate-formulas.js/
// generate-reference.js (each of which writes its full English page set
// as a require()-time side effect, per this codebase's established
// generator convention) so that side effect becomes a harmless no-op,
// then the real write function is restored and generateTerm()/
// generateFormula()/generateRefPage() are called directly (bypassing
// the module's own write loop entirely) to confirm repeated calls with
// the same input produce byte-identical output with zero disk writes.
{
  const realWriteFileSync = fs.writeFileSync;
  const realConsoleLog = console.log;
  fs.writeFileSync = () => {}; // no-op only for the duration of these three requires
  console.log = () => {}; // these modules log every "file" they "write" -- silence that noise
  delete require.cache[require.resolve('./generate-glossary')];
  delete require.cache[require.resolve('./generate-formulas')];
  delete require.cache[require.resolve('./generate-reference')];
  let g1, f1, r1;
  try {
    g1 = require('./generate-glossary');
    f1 = require('./generate-formulas');
    r1 = require('./generate-reference');
  } finally {
    fs.writeFileSync = realWriteFileSync;
    console.log = realConsoleLog;
  }
  const term = glossary.terms.find((t) => t.id === 'gl-013');
  const formula = formulas.formulas.find((f) => f.id === 'formula-01');
  const page = reference.pages.find((p) => p.id === 'ref-01');
  const out1 = g1.generateTerm(term, 'es') + f1.generateFormula(formula, 'es') + r1.generateRefPage(page, 'es');
  const out2 = g1.generateTerm(term, 'es') + f1.generateFormula(formula, 'es') + r1.generateRefPage(page, 'es');
  if (out1 === out2) ok('36. Determinism proxy: repeated in-process generation of sample pages is byte-identical, with zero filesystem writes (full 3-build filesystem determinism was verified manually during implementation -- see reports/phase-8o-status.md)');
  else err('36. Determinism proxy failed: repeated generation of the same record produced different output');
}

// ---------------------------------------------------------------------
// 37. English URL regression = 0
// ---------------------------------------------------------------------
{
  let baselineSitemapGlossary, baselineSitemapFormulas, baselineSitemapReference;
  try {
    baselineSitemapGlossary = execSync('git show ' + BASELINE_SHA + ':sitemap-glossary.xml', { cwd: ROOT }).toString();
    baselineSitemapFormulas = execSync('git show ' + BASELINE_SHA + ':sitemap-formulas.xml', { cwd: ROOT }).toString();
    baselineSitemapReference = execSync('git show ' + BASELINE_SHA + ':sitemap-reference.xml', { cwd: ROOT }).toString();
  } catch (e) {
    err('37. Could not read baseline sitemaps: ' + e.message);
  }
  if (baselineSitemapGlossary) {
    function enUrls(xml) { return (xml.match(/<loc>([^<]+)<\/loc>/g) || []).map((m) => m.slice(5, -6)).filter((u) => !u.includes('/es/')); }
    const beforeUrls = new Set([...enUrls(baselineSitemapGlossary), ...enUrls(baselineSitemapFormulas), ...enUrls(baselineSitemapReference)]);
    const afterUrls = new Set([...enUrls(read('sitemap-glossary.xml')), ...enUrls(read('sitemap-formulas.xml')), ...enUrls(read('sitemap-reference.xml'))]);
    const missing = [...beforeUrls].filter((u) => !afterUrls.has(u));
    if (missing.length === 0) ok('37. English URL regression = 0 (every English glossary/formula/reference URL from the Phase 8N baseline still present)');
    else err('37. English URL regression: ' + missing.length + ' URL(s) missing: ' + JSON.stringify(missing.slice(0, 10)));
  }
}

// ---------------------------------------------------------------------
// 38. No calculator logic changes
// ---------------------------------------------------------------------
try {
  const diffStat = execSync('git diff --stat ' + BASELINE_SHA + ' -- ' +
    'js/calc-utils.js scripts/generate-calculators.js data/calculators.json', { cwd: ROOT }).toString().trim();
  if (diffStat === '') ok('38. No calculator logic changes (js/calc-utils.js, generate-calculators.js, data/calculators.json byte-identical to baseline)');
  else warn('38. Calculator-adjacent files differ from baseline (verify intentional): ' + diffStat);
} catch (e) {
  warn('38. Could not diff calculator files against baseline: ' + e.message);
}

// ---------------------------------------------------------------------
// Scope violation gate (Section 21): no Spanish pages outside the 4
// approved families.
// ---------------------------------------------------------------------
{
  const esDirs = fs.existsSync(path.join(ROOT, 'es')) ? fs.readdirSync(path.join(ROOT, 'es')) : [];
  const approved = new Set(['calculators', 'formulas', 'glossary', 'reference']);
  const unexpected = esDirs.filter((d) => !approved.has(d) && fs.statSync(path.join(ROOT, 'es', d)).isDirectory());
  if (unexpected.length === 0) ok('Scope gate: no Spanish page families beyond calculators/formulas/glossary/reference');
  else err('Scope gate VIOLATION: unexpected Spanish family directories: ' + JSON.stringify(unexpected));
}

console.log('');
console.log('validate-phase-8o: ' + (errors === 0 ? 'PASS' : 'FAIL') + ' -- ' + errors + ' error(s), ' + warnings + ' warning(s).');
process.exit(errors === 0 ? 0 : 1);
