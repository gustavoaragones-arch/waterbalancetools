#!/usr/bin/env node
/**
 * test-phase-8o.js
 *
 * Deterministic test suite for Phase 8O (Spanish Core Reference
 * Completion & Semantic Expansion). Exercises the new behavior added on
 * top of Phase 8N's locale-aware rendering: full 100-record glossary
 * coverage, formula variable-description/equation-label localization
 * (localizeEquation()), and reference table header/row localization
 * (localizeRecord()'s per-index table/variable merge).
 *
 * Unlike test-phase-8n.js (which accepted require()-time side effects
 * from generate-glossary.js/generate-formulas.js/generate-reference.js
 * rewriting plain, pre-injector English pages to disk, and explicitly
 * warned "always re-run the full pipeline after this test suite"),
 * Phase 8O's spec requires the test suite to NEVER mutate the working
 * tree. Every require() of those three generator modules below is
 * wrapped with a temporary fs.writeFileSync/console.log no-op stub so
 * their top-level write loop becomes inert -- the exported functions
 * are then called directly and are pure (no disk I/O of their own).
 *
 * No network calls. No external APIs. Deterministic. Does not mutate or
 * clean the working tree.
 *
 * Run: node scripts/test-phase-8o.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let passed = 0;
let failed = 0;
function check(n, desc, cond) {
  if (cond) { console.log('PASS: ' + n + '. ' + desc); passed++; }
  else { console.log('FAIL: ' + n + '. ' + desc); failed++; }
}
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

let n = 1;

/**
 * requireGeneratorsQuietly() -- requires generate-glossary.js/
 * generate-formulas.js/generate-reference.js with fs.writeFileSync and
 * console.log stubbed to no-ops for the duration of the require() calls
 * only, so their require()-time write loop (an established convention in
 * this codebase -- see generate-spanish-cluster.js) never touches disk
 * or prints noise. The real fs.writeFileSync/console.log are restored
 * immediately after, before any test assertions run.
 */
function requireGeneratorsQuietly() {
  const realWriteFileSync = fs.writeFileSync;
  const realConsoleLog = console.log;
  fs.writeFileSync = () => {};
  console.log = () => {};
  delete require.cache[require.resolve('./generate-glossary')];
  delete require.cache[require.resolve('./generate-formulas')];
  delete require.cache[require.resolve('./generate-reference')];
  try {
    return {
      glossaryMod: require('./generate-glossary'),
      formulasMod: require('./generate-formulas'),
      referenceMod: require('./generate-reference'),
    };
  } finally {
    fs.writeFileSync = realWriteFileSync;
    console.log = realConsoleLog;
  }
}

const { glossaryMod, formulasMod, referenceMod } = requireGeneratorsQuietly();
const glossaryData = glossaryMod.data;
const formulasData = formulasMod.data;
const referenceData = referenceMod.data;

// ---------------------------------------------------------------------
// A. Full glossary coverage
// ---------------------------------------------------------------------
{
  check(n++, 'data/glossary.json has exactly 100 terms', glossaryData.terms.length === 100);
  const withEs = glossaryData.terms.filter((t) => t.es);
  check(n++, 'All 100 glossary terms carry an es object (0 missing)', withEs.length === 100);
  const term = glossaryData.terms.find((t) => t.id === 'gl-013'); // Phase 8O addition (ORP)
  check(n++, 'A Phase-8O-added term (gl-013 ORP) has es.term set', term.es && term.es.term === 'ORP (Potencial de Oxidación-Reducción)');
  check(n++, 'A Phase-8O-added term preserves its English abbreviation field unchanged', term.abbreviation === 'ORP');
}

// ---------------------------------------------------------------------
// B. generateTerm() on a Phase-8O-added term: English byte-identity + Spanish correctness
// ---------------------------------------------------------------------
{
  const term = glossaryData.terms.find((t) => t.id === 'gl-013');
  const enOutput = glossaryMod.generateTerm(term, 'en');
  const enDefault = glossaryMod.generateTerm(term);
  check(n++, 'generateTerm(term) with no locale arg matches generateTerm(term, "en") for a Phase-8O term', enOutput === enDefault);
  check(n++, 'generateTerm English output uses the English term as H1', /<h1>ORP \(Oxidation-Reduction Potential\)<\/h1>/.test(enOutput));

  const esOutput = glossaryMod.generateTerm(term, 'es');
  check(n++, 'generateTerm Spanish output declares html lang="es"', /<html lang="es">/.test(esOutput));
  check(n++, 'generateTerm Spanish output uses the Spanish term as H1', /<h1>ORP \(Potencial de Oxidación-Reducción\)<\/h1>/.test(esOutput));
  check(n++, 'generateTerm Spanish output has no unresolved {{...}} tokens', !/\{\{[A-Z0-9_]+\}\}/.test(esOutput));
  check(n++, 'generateTerm Spanish output canonical points at /es/glossary/orp', /https:\/\/waterbalancetools\.com\/es\/glossary\/orp/.test(esOutput));
}

// ---------------------------------------------------------------------
// C. Formula variable-table + equation-label localization
// ---------------------------------------------------------------------
{
  const { localizeRecord } = require('./template-utils');
  const { localizeEquation } = require('../js/i18n/formula-equation-model');
  const formula = formulasData.formulas.find((f) => f.id === 'formula-01');

  check(n++, 'formula-01.es.variables exists with 4 entries (Phase 8O addition)', Array.isArray(formula.es.variables) && formula.es.variables.length === 4);
  check(n++, 'formula-01.es.variables[0].symbol equals the English symbol "L" (never localized)', formula.es.variables[0].symbol === 'L');
  check(n++, 'formula-01.es.variables[0].description is Spanish, not English', formula.es.variables[0].description === 'Longitud de la piscina en pies');

  const localized = localizeRecord(formula, 'es');
  check(n++, 'localizeRecord(formula, "es").variables preserves English symbol/unit from the source record', localized.variables[0].symbol === 'L' && localized.variables[0].unit === 'ft');
  check(n++, 'localizeRecord(formula, "es").variables uses the Spanish description', localized.variables[0].description === 'Longitud de la piscina en pies');
  check(n++, 'localizeRecord(formula, "en") leaves variables completely untouched (same array reference-equal values)', JSON.stringify(localizeRecord(formula, 'en').variables) === JSON.stringify(formula.variables));

  // Tamper-resistance: even if an es.variables entry carried a bogus
  // symbol/unit, localizeRecord() must ignore it and use the English
  // source -- the mathematical-identity-preservation guarantee.
  const tampered = { variables: [{ symbol: 'X', description: 'orig', unit: 'ft' }], es: { variables: [{ symbol: 'SABOTAGE', description: 'traducido', unit: 'SABOTAGE' }] } };
  const tamperedResult = localizeRecord(tampered, 'es');
  check(n++, 'localizeRecord() ignores a symbol present in es.variables and always uses the English symbol', tamperedResult.variables[0].symbol === 'X');
  check(n++, 'localizeRecord() ignores a unit present in es.variables and always uses the English unit', tamperedResult.variables[0].unit === 'ft');
  check(n++, 'localizeRecord() still uses the es description when symbol/unit are correctly ignored', tamperedResult.variables[0].description === 'traducido');

  const labels = formula.es.equationLabels || {};
  const localizedEquation = localizeEquation('formula-01', (t) => (Object.prototype.hasOwnProperty.call(labels, t) ? labels[t] : t));
  check(n++, 'localizeEquation(formula-01) with es.equationLabels produces a fully Spanish-labeled equation', localizedEquation === 'Volumen (gal) = Longitud (ft) × Ancho (ft) × Profundidad Promedio (ft) × 7.48');
  check(n++, 'Localized equation preserves the numeric constant 7.48 exactly', localizedEquation.includes('7.48'));
  check(n++, 'Localized equation preserves every × operator exactly', (localizedEquation.match(/×/g) || []).length === (formula.equation.match(/×/g) || []).length);
}

// ---------------------------------------------------------------------
// D. generateFormula() renders the localized equation for locale "es" only
// ---------------------------------------------------------------------
{
  const formula = formulasData.formulas.find((f) => f.id === 'formula-01');
  const enOutput = formulasMod.generateFormula(formula, 'en');
  const esOutput = formulasMod.generateFormula(formula, 'es');
  const equationEn = (enOutput.match(/<div class="formula-equation">([\s\S]*?)<\/div>/) || [])[1];
  const equationEs = (esOutput.match(/<div class="formula-equation">([\s\S]*?)<\/div>/) || [])[1];
  check(n++, 'generateFormula English equation display is unchanged from the raw data/formulas.json equation string', equationEn === formula.equation);
  check(n++, 'generateFormula Spanish equation display differs from English (labels localized)', equationEs !== equationEn);
  check(n++, 'generateFormula Spanish equation display still contains the exact numeric constant', equationEs.includes('7.48'));
  const symbolCells = [...esOutput.matchAll(/<code>([^<]*)<\/code>/g)].map((m) => m[1]);
  check(n++, 'generateFormula Spanish variable table symbol column is untranslated (L, W, D, 7.48)', JSON.stringify(symbolCells) === JSON.stringify(['L', 'W', 'D', '7.48']));
  check(n++, 'generateFormula Spanish variable table description column is in Spanish', esOutput.includes('Longitud de la piscina en pies'));
  check(n++, 'generateFormula(formula) default locale matches "en" exactly, including the equation', formulasMod.generateFormula(formula) === enOutput);
}

// ---------------------------------------------------------------------
// E. Reference table header/row localization
// ---------------------------------------------------------------------
{
  const { localizeRecord } = require('./template-utils');
  const page = referenceData.pages.find((p) => p.id === 'ref-01');
  check(n++, 'ref-01.es.tables[0] has full headers/rows (Phase 8O addition, not just title)', Array.isArray(page.es.tables[0].headers) && Array.isArray(page.es.tables[0].rows));
  check(n++, 'ref-01.es.tables[0].headers is fully Spanish', JSON.stringify(page.es.tables[0].headers) === JSON.stringify(['Parámetro', 'Mínimo', 'Rango Ideal', 'Máximo', 'Unidad']));

  const localized = localizeRecord(page, 'es');
  check(n++, 'localizeRecord(page, "es") uses the localized headers', localized.tables[0].headers[0] === 'Parámetro');
  check(n++, 'localizeRecord(page, "es") preserves every numeric cell exactly (row 0: 1.0, 1–3, 5, ppm)', JSON.stringify(localized.tables[0].rows[0].slice(1)) === JSON.stringify(page.tables[0].rows[0].slice(1)));
  check(n++, 'localizeRecord(page, "en") leaves tables completely untouched', JSON.stringify(localizeRecord(page, 'en').tables) === JSON.stringify(page.tables));

  // Fallback safety: a table with no es entry at that index must fall
  // through to the English table rather than crashing or dropping data.
  const partial = { tables: [{ title: 'A', headers: ['H'], rows: [['1']] }, { title: 'B', headers: ['H2'], rows: [['2']] }], es: { tables: [{ title: 'A-es', headers: ['H-es'], rows: [['1']] }] } };
  const partialLocalized = localizeRecord(partial, 'es');
  check(n++, 'localizeRecord() falls back to the English table when an es.tables entry is missing at that index', partialLocalized.tables[1].title === 'B' && JSON.stringify(partialLocalized.tables[1].headers) === JSON.stringify(['H2']));

  const enTableCount = referenceData.pages.reduce((sum, p) => sum + (p.tables || []).length, 0);
  const esTableCount = referenceData.pages.reduce((sum, p) => sum + ((p.es && p.es.tables) || []).length, 0);
  check(n++, 'Every reference table across all 25 pages has a corresponding es.tables entry', enTableCount === esTableCount);
}

// ---------------------------------------------------------------------
// F. generateRefPage() renders localized table content for locale "es" only
// ---------------------------------------------------------------------
{
  const page = referenceData.pages.find((p) => p.id === 'ref-01');
  const enOutput = referenceMod.generateRefPage(page, 'en');
  const esOutput = referenceMod.generateRefPage(page, 'es');
  check(n++, 'generateRefPage English output is unaffected by the new es.tables content (still English headers)', /<th>Parameter<\/th>/.test(enOutput));
  check(n++, 'generateRefPage Spanish output uses translated headers', /<th>Parámetro<\/th>/.test(esOutput));
  check(n++, 'generateRefPage Spanish output preserves numeric cell "1–3" exactly', esOutput.includes('1–3'));
  check(n++, 'generateRefPage Spanish output preserves the unit cell "ppm" exactly', esOutput.includes('>ppm<'));
  check(n++, 'generateRefPage(page) default locale matches "en" exactly', referenceMod.generateRefPage(page) === enOutput);
  const enNumericCells = [...enOutput.matchAll(/<td>([0-9][0-9.,\-–— ]*)<\/td>/g)].map((m) => m[1]);
  const esNumericCells = [...esOutput.matchAll(/<td>([0-9][0-9.,\-–— ]*)<\/td>/g)].map((m) => m[1]);
  check(n++, 'Every purely-numeric <td> cell is identical in count and value between English and Spanish output', JSON.stringify(enNumericCells) === JSON.stringify(esNumericCells));
}

// ---------------------------------------------------------------------
// G. Translation-status: full glossary coverage, no duplicates
// ---------------------------------------------------------------------
{
  const ts = JSON.parse(read('data/i18n/translation-status.json'));
  const glossaryUnits = ts.units.filter((u) => u.category === 'glossary');
  check(n++, 'translation-status.json has exactly 100 glossary units', glossaryUnits.length === 100);
  check(n++, 'Every glossary unit is es: translated', glossaryUnits.every((u) => u.languages.es && u.languages.es.status === 'translated'));
  const ids = ts.units.map((u) => u.contentId);
  check(n++, 'translation-status.json has 0 duplicate contentIds', new Set(ids).size === ids.length);
  const gl001 = ts.units.find((u) => u.contentId === 'glossary:gl-001');
  check(n++, 'The Phase 8M-migrated gl-001 unit was updated in place, not duplicated', ts.units.filter((u) => u.contentId === 'glossary:gl-001').length === 1 && gl001.languages.es.status === 'translated');
}

// ---------------------------------------------------------------------
// H. Formula->glossary relationship resolution (no fabrication)
// ---------------------------------------------------------------------
{
  const resolver = require('../js/i18n/related-link-resolver');
  resolver.reloadContentIndex();
  const KNOWN_DANGLING = ['turnover-rate', 'soda-ash', 'ph-buffering', 'salt-chlorinator', 'sodium-chloride',
    'salt-level', 'chlorine-lock', 'uv-degradation', 'pump-head-pressure', 'pool-circulation', 'lsi', 'corrosion', 'scaling'];
  let resolved = 0;
  let unresolved = 0;
  formulasData.formulas.forEach((fm) => {
    (fm.relatedGlossary || []).forEach((target) => {
      const result = resolver.resolveRelatedLink({ raw: target, locale: 'es', targetFamilyHint: 'glossary' });
      if (result.resolved) resolved++; else unresolved++;
    });
  });
  check(n++, 'Formula->glossary relationships: exactly 18 occurrences resolve to a Spanish target', resolved === 18);
  check(n++, 'Formula->glossary relationships: exactly 14 occurrences remain intentionally unresolved (Policy A)', unresolved === 14);
  const glossaryBareSlugs = new Set(glossaryData.terms.map((t) => t.slug.replace(/^glossary\//, '')));
  const noFabrication = KNOWN_DANGLING.every((slug) => !glossaryBareSlugs.has(slug));
  check(n++, 'None of the 13 known-dangling glossary targets were fabricated as real records', noFabrication);
}

// ---------------------------------------------------------------------
// I. Mathematical safety: 9/9 equation reconstruction unaffected by Phase 8O
// ---------------------------------------------------------------------
{
  const model = require('../js/i18n/formula-equation-model');
  let ok = 0;
  model.getAllFormulaIds().forEach((id) => {
    const rec = formulasData.formulas.find((f) => f.id === id);
    if (model.reconstructEquation(id) === rec.equation) ok++;
  });
  check(n++, '9/9 formulas still reconstruct their exact original equation string', ok === 9);
}

console.log('');
console.log(`test-phase-8o: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
