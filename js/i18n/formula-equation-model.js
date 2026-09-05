'use strict';
/**
 * formula-equation-model.js — Phase 8M structured equation representation
 * for the 9 real records in data/formulas.json (spec Task G / Task 10).
 *
 * Phase 8L found that 8 of these 9 equation strings embed natural-language
 * English words directly inside the same string as the mathematical
 * expression (e.g. formula-01: "Volume (gal) = Length (ft) × Width (ft) ×
 * Average Depth (ft) × 7.48"), that formula-04's "equation" field is not a
 * mathematical equation at all (a full prose explanation of why none is
 * published), and that formula-09 (LSI) is nearly pure symbolic notation
 * already. A future Spanish generator must be able to localize the
 * natural-language labels WITHOUT ever touching a numeric constant,
 * operator, or symbolic variable identity.
 *
 * This module does NOT modify data/formulas.json (the existing `equation`
 * string field remains the untouched, canonical source of truth -- Phase
 * 8L Section 7: "If a formula cannot safely be converted without changing
 * production behavior: preserve the existing equation representation and
 * add a safe adapter layer instead"). It is a pure, additive, read-only
 * decomposition keyed by native formula ID, hand-verified against the
 * actual data/formulas.json equation strings (not derived from them by a
 * generic parser, since a generic natural-language/math tokenizer would
 * itself be a far riskier piece of new logic than nine hand-checked
 * decompositions of nine known strings).
 *
 * Each entry's `tokens` array, joined in order using each token's own
 * `text` field, reconstructs the ORIGINAL data/formulas.json `equation`
 * string exactly -- this reconstruction identity is what
 * scripts/test-phase-8m.js asserts for all 9 formulas, and is the
 * concrete proof that this decomposition preserves the original
 * mathematical meaning rather than silently altering it.
 *
 * Token kinds:
 *   'label'    — localizable human-language text (e.g. "Volume", "Target FC")
 *   'operator' — mathematical operator, never localized (=, ×, ÷, +, −)
 *   'constant' — numeric literal, never localized (7.48, 0.013344, 12.1, ...)
 *   'variable' — symbolic variable identity, never localized (L, W, D, TF, CHF, TAF, LSI)
 *   'unit'     — unit abbreviation, never localized (ft, gal, ppm, %, hours)
 *   'punct'    — parentheses/spacing/other structural literal text
 *   'prose'    — formula-04 only: the entire field is explanatory prose,
 *                not an equation; the whole string is one 'prose' token,
 *                fully TRANSLATE-able, with no mathematical structure to
 *                preserve at all.
 */

const IMMUTABLE_KINDS = new Set(['operator', 'constant', 'variable', 'unit', 'punct']);

const FORMULAS = {
  'formula-01': {
    equation: 'Volume (gal) = Length (ft) × Width (ft) × Average Depth (ft) × 7.48',
    tokens: [
      { kind: 'label', text: 'Volume' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'gal' }, { kind: 'punct', text: ') ' },
      { kind: 'operator', text: '=' }, { kind: 'punct', text: ' ' },
      { kind: 'label', text: 'Length' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'ft' }, { kind: 'punct', text: ') ' },
      { kind: 'operator', text: '×' }, { kind: 'punct', text: ' ' },
      { kind: 'label', text: 'Width' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'ft' }, { kind: 'punct', text: ') ' },
      { kind: 'operator', text: '×' }, { kind: 'punct', text: ' ' },
      { kind: 'label', text: 'Average Depth' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'ft' }, { kind: 'punct', text: ') ' },
      { kind: 'operator', text: '×' }, { kind: 'punct', text: ' ' },
      { kind: 'constant', text: '7.48' },
    ],
  },
  'formula-02': {
    equation: 'Fluid ounces = (Target FC − Current FC) × Pool Volume (gal) × 0.013344 ÷ Chlorine Strength %',
    tokens: [
      { kind: 'label', text: 'Fluid ounces' }, { kind: 'punct', text: ' ' }, { kind: 'operator', text: '=' }, { kind: 'punct', text: ' (' },
      { kind: 'label', text: 'Target FC' }, { kind: 'punct', text: ' ' }, { kind: 'operator', text: '−' }, { kind: 'punct', text: ' ' },
      { kind: 'label', text: 'Current FC' }, { kind: 'punct', text: ') ' }, { kind: 'operator', text: '×' }, { kind: 'punct', text: ' ' },
      { kind: 'label', text: 'Pool Volume' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'gal' }, { kind: 'punct', text: ') ' },
      { kind: 'operator', text: '×' }, { kind: 'punct', text: ' ' }, { kind: 'constant', text: '0.013344' }, { kind: 'punct', text: ' ' },
      { kind: 'operator', text: '÷' }, { kind: 'punct', text: ' ' }, { kind: 'label', text: 'Chlorine Strength' }, { kind: 'punct', text: ' ' }, { kind: 'unit', text: '%' },
    ],
  },
  'formula-03': {
    equation: 'Shock dose (oz) = (Target FC − Current FC) × Volume (gal) × 0.013344 ÷ Available Chlorine (%)',
    tokens: [
      { kind: 'label', text: 'Shock dose' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'oz' }, { kind: 'punct', text: ') ' },
      { kind: 'operator', text: '=' }, { kind: 'punct', text: ' (' },
      { kind: 'label', text: 'Target FC' }, { kind: 'punct', text: ' ' }, { kind: 'operator', text: '−' }, { kind: 'punct', text: ' ' },
      { kind: 'label', text: 'Current FC' }, { kind: 'punct', text: ') ' }, { kind: 'operator', text: '×' }, { kind: 'punct', text: ' ' },
      { kind: 'label', text: 'Volume' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'gal' }, { kind: 'punct', text: ') ' },
      { kind: 'operator', text: '×' }, { kind: 'punct', text: ' ' }, { kind: 'constant', text: '0.013344' }, { kind: 'punct', text: ' ' },
      { kind: 'operator', text: '÷' }, { kind: 'punct', text: ' ' }, { kind: 'label', text: 'Available Chlorine' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: '%' }, { kind: 'punct', text: ')' },
    ],
  },
  'formula-04': {
    equation: 'No single validated dosing equation is published here. Unlike liquid chlorine or alkalinity, pH adjustment is a carbonate-buffered titration problem: the acid or base needed for a given pH change depends materially on total alkalinity (and, more weakly, cyanuric acid) -- neither of which a two-input pH/volume calculator can account for. Professional water-chemistry references that publish exact dosing tables for chlorine, alkalinity, and calcium hardness deliberately do not publish an equivalent fixed table for pH, and instead direct users to an empirical acid-demand test.',
    tokens: [
      { kind: 'prose', text: 'No single validated dosing equation is published here. Unlike liquid chlorine or alkalinity, pH adjustment is a carbonate-buffered titration problem: the acid or base needed for a given pH change depends materially on total alkalinity (and, more weakly, cyanuric acid) -- neither of which a two-input pH/volume calculator can account for. Professional water-chemistry references that publish exact dosing tables for chlorine, alkalinity, and calcium hardness deliberately do not publish an equivalent fixed table for pH, and instead direct users to an empirical acid-demand test.' },
    ],
  },
  'formula-05': {
    equation: 'Sodium bicarbonate (oz) = Desired TA Increase (ppm) × Volume (gal) × 0.000224',
    tokens: [
      { kind: 'label', text: 'Sodium bicarbonate' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'oz' }, { kind: 'punct', text: ') ' },
      { kind: 'operator', text: '=' }, { kind: 'punct', text: ' ' },
      { kind: 'label', text: 'Desired TA Increase' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'ppm' }, { kind: 'punct', text: ') ' },
      { kind: 'operator', text: '×' }, { kind: 'punct', text: ' ' },
      { kind: 'label', text: 'Volume' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'gal' }, { kind: 'punct', text: ') ' },
      { kind: 'operator', text: '×' }, { kind: 'punct', text: ' ' }, { kind: 'constant', text: '0.000224' },
    ],
  },
  'formula-06': {
    equation: 'Salt to add (lbs) = (Target ppm − Current ppm) × Volume (gal) × 0.0000834',
    tokens: [
      { kind: 'label', text: 'Salt to add' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'lbs' }, { kind: 'punct', text: ') ' },
      { kind: 'operator', text: '=' }, { kind: 'punct', text: ' (' },
      { kind: 'label', text: 'Target' }, { kind: 'punct', text: ' ' }, { kind: 'unit', text: 'ppm' }, { kind: 'punct', text: ' ' }, { kind: 'operator', text: '−' }, { kind: 'punct', text: ' ' },
      { kind: 'label', text: 'Current' }, { kind: 'punct', text: ' ' }, { kind: 'unit', text: 'ppm' }, { kind: 'punct', text: ') ' }, { kind: 'operator', text: '×' }, { kind: 'punct', text: ' ' },
      { kind: 'label', text: 'Volume' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'gal' }, { kind: 'punct', text: ') ' },
      { kind: 'operator', text: '×' }, { kind: 'punct', text: ' ' }, { kind: 'constant', text: '0.0000834' },
    ],
  },
  'formula-07': {
    equation: 'CYA to add (oz) = (Target CYA − Current CYA) × Volume (gal) × 0.000133',
    tokens: [
      { kind: 'label', text: 'CYA to add' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'oz' }, { kind: 'punct', text: ') ' },
      { kind: 'operator', text: '=' }, { kind: 'punct', text: ' (' },
      { kind: 'label', text: 'Target CYA' }, { kind: 'punct', text: ' ' }, { kind: 'operator', text: '−' }, { kind: 'punct', text: ' ' },
      { kind: 'label', text: 'Current CYA' }, { kind: 'punct', text: ') ' }, { kind: 'operator', text: '×' }, { kind: 'punct', text: ' ' },
      { kind: 'label', text: 'Volume' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'gal' }, { kind: 'punct', text: ') ' },
      { kind: 'operator', text: '×' }, { kind: 'punct', text: ' ' }, { kind: 'constant', text: '0.000133' },
    ],
  },
  'formula-08': {
    equation: 'Turnover Time (hours) = Pool Volume (gal) ÷ Pump Flow Rate (GPH)',
    tokens: [
      { kind: 'label', text: 'Turnover Time' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'hours' }, { kind: 'punct', text: ') ' },
      { kind: 'operator', text: '=' }, { kind: 'punct', text: ' ' },
      { kind: 'label', text: 'Pool Volume' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'gal' }, { kind: 'punct', text: ') ' },
      { kind: 'operator', text: '÷' }, { kind: 'punct', text: ' ' },
      { kind: 'label', text: 'Pump Flow Rate' }, { kind: 'punct', text: ' (' }, { kind: 'unit', text: 'GPH' }, { kind: 'punct', text: ')' },
    ],
  },
  'formula-09': {
    equation: 'LSI = pH + TF + CHF + TAF − 12.1',
    tokens: [
      { kind: 'variable', text: 'LSI' }, { kind: 'punct', text: ' ' }, { kind: 'operator', text: '=' }, { kind: 'punct', text: ' ' },
      { kind: 'variable', text: 'pH' }, { kind: 'punct', text: ' ' }, { kind: 'operator', text: '+' }, { kind: 'punct', text: ' ' },
      { kind: 'variable', text: 'TF' }, { kind: 'punct', text: ' ' }, { kind: 'operator', text: '+' }, { kind: 'punct', text: ' ' },
      { kind: 'variable', text: 'CHF' }, { kind: 'punct', text: ' ' }, { kind: 'operator', text: '+' }, { kind: 'punct', text: ' ' },
      { kind: 'variable', text: 'TAF' }, { kind: 'punct', text: ' ' }, { kind: 'operator', text: '−' }, { kind: 'punct', text: ' ' },
      { kind: 'constant', text: '12.1' },
    ],
  },
};

/** getFormulaModel(nativeId) -- returns the structured decomposition, or null. */
function getFormulaModel(nativeId) {
  return FORMULAS[nativeId] || null;
}

function getAllFormulaIds() {
  return Object.keys(FORMULAS);
}

/**
 * reconstructEquation(nativeId) -- joins the token text in order. Must
 * equal data/formulas.json's own `equation` string exactly for every
 * formula -- this is the mathematical-identity-preservation proof
 * scripts/test-phase-8m.js asserts.
 */
function reconstructEquation(nativeId) {
  const model = getFormulaModel(nativeId);
  if (!model) return null;
  return model.tokens.map((t) => t.text).join('');
}

/**
 * extractByKind(nativeId, kind) -- convenience accessor, e.g.
 * extractByKind('formula-01', 'constant') -> ['7.48'].
 */
function extractByKind(nativeId, kind) {
  const model = getFormulaModel(nativeId);
  if (!model) return [];
  return model.tokens.filter((t) => t.kind === kind).map((t) => t.text);
}

/**
 * localizeEquation(nativeId, translateLabel) -- builds a localized
 * equation string by replacing only 'label'/'prose' token text via the
 * supplied translateLabel(text) => text function, leaving every
 * 'operator'/'constant'/'variable'/'unit'/'punct' token byte-identical.
 * Phase 8M does not call this with a real translation function anywhere
 * (no Spanish content is produced) -- it exists so scripts/test-phase-8m.js
 * can prove the model supports localization without disturbing math, using
 * a synthetic, clearly-non-production translateLabel fixture.
 */
function localizeEquation(nativeId, translateLabel) {
  const model = getFormulaModel(nativeId);
  if (!model) return null;
  return model.tokens
    .map((t) => (t.kind === 'label' || t.kind === 'prose' ? translateLabel(t.text) : t.text))
    .join('');
}

module.exports = {
  IMMUTABLE_KINDS,
  FORMULAS,
  getFormulaModel,
  getAllFormulaIds,
  reconstructEquation,
  extractByKind,
  localizeEquation,
};
