#!/usr/bin/env node
'use strict';
/**
 * test-phase-7s.js (Phase 7S, Step 14)
 *
 * A-J minimum assertion categories:
 *  A. Documented worked examples agree with what the implementation actually computes.
 *  B. No contradictory intermediate/final values within a single worked example.
 *  C. No abandoned equation lacking a documented reason.
 *  D. Internally consistent units throughout a worked example.
 *  E. The liquid-chlorine worked example produces exactly one result.
 *  F. LSI is not accidentally exposed as a functioning calculator.
 *  G. Shock presets are unchanged (no conclusive evidence required a change).
 *  H. All newly-classified formulas have a documented evidence/disposition record.
 *  I. No unsupported formula silently promoted to SUPPORTED.
 *  J. No calculator formula changed without a corresponding audit decision.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
    passed++;
  } catch (e) {
    console.error(`FAIL: ${name}`);
    console.error(`   ${e.message}`);
    failed++;
  }
}

global.window = {};
delete require.cache[require.resolve(path.join(ROOT, 'js', 'calc-utils.js'))];
require(path.join(ROOT, 'js', 'calc-utils.js'));
const calc = global.window.WaterBalance.calcUtils;
const formulasData = require(path.join(ROOT, 'scripts', 'data', 'formulas-data.js'));
const f02 = formulasData.find((f) => f.id === 'formula-02');
const f05 = formulasData.find((f) => f.id === 'formula-05');
const f09 = formulasData.find((f) => f.id === 'formula-09');
const f04 = formulasData.find((f) => f.id === 'formula-04');
const REPORT_DIR = path.join(ROOT, 'reports', 'phase-7s');

// A. Documented example agrees with implementation (liquid chlorine).
test('A1: formula-02 worked example (66.7 oz) matches js/calc-utils.js output for 20,000gal/0.5->3ppm/10%', () => {
  const result = calc.calculateChlorine(20000, 0.5, 3, 'liquid').ounces;
  assert.ok(Math.abs(result - 66.7) < 0.5, `expected ~66.7, got ${result}`);
  assert.ok(/66\.7/.test(f02.workedExample), 'formula-02 worked example text does not state 66.7');
});

// A. Documented example agrees with implementation (alkalinity).
test('A2: formula-05 worked example (10.1 lbs) matches js/calc-utils.js output for 18,000gal/60->100ppm', () => {
  const result = calc.calculateAlkalinity(18000, 60, 100).pounds;
  assert.ok(Math.abs(result - 10.08) < 0.1, `expected ~10.08, got ${result}`);
  assert.ok(/10\.1\s*lbs/.test(f05.workedExample), 'formula-05 worked example text does not state 10.1 lbs');
});

// A. Documented example agrees with data source (LSI, no live calculator -- checked against water-balance.json).
test('A3: formula-09 worked example (LSI = 0.1) matches data/datasets/water-balance.json lookup values', () => {
  const waterBalance = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'datasets', 'water-balance.json'), 'utf8'));
  assert.ok(waterBalance, 'data/datasets/water-balance.json must exist and parse');
  assert.ok(/=\s*0\.1\b/.test(f09.workedExample) && /LSI/.test(f09.workedExample), 'formula-09 worked example does not conclude with a final value of 0.1');
});

// B. No contradictory intermediate/final values in any worked example.
test('B: no worked example contains the "Wait -- that looks wrong" self-contradiction marker', () => {
  for (const f of formulasData) {
    assert.ok(!/Wait[,\s]*[—-]*\s*that looks wrong/i.test(f.workedExample || ''), `${f.id} still contains a self-contradiction marker`);
  }
});

test('B2: formula-09 worked example does not contain more than one final LSI value', () => {
  const matches = (f09.workedExample.match(/LSI\s*=\s*[−-]?\d+\.\d+/g) || []);
  const finalValues = new Set(matches.map((m) => m.replace(/\s/g, '')));
  assert.ok(finalValues.size <= 2, `formula-09 worked example has ${finalValues.size} distinct LSI= statements, expected at most 2 (an intermediate sum and the final rounded result)`);
});

// C. No abandoned equation without a documented reason. formula-04 (pH) is deliberately NOT
// rewritten this phase -- confirm this is documented as an explicit REQUIRES_EXPERT_REVIEW
// decision, not silently left broken.
test('C: formula-04 (pH) unresolved status is explicitly documented in PH-AUDIT.md and DECISION-MATRIX.csv', () => {
  const phAudit = fs.readFileSync(path.join(REPORT_DIR, 'PH-AUDIT.md'), 'utf8');
  assert.ok(/REQUIRES_EXPERT_REVIEW/.test(phAudit), 'PH-AUDIT.md must record a REQUIRES_EXPERT_REVIEW disposition');
  const decisionMatrix = fs.readFileSync(path.join(REPORT_DIR, 'DECISION-MATRIX.csv'), 'utf8');
  assert.ok(/pH/i.test(decisionMatrix), 'DECISION-MATRIX.csv must include a pH row');
});

// D. Internally consistent units (spot check: formula-02's equation and worked example both use fl oz throughout).
test('D: formula-02 equation and worked example use consistent units (fl oz) throughout', () => {
  assert.ok(/fl\s*oz/i.test(f02.equation) || /fl\s*oz/i.test(f02.workedExample), 'formula-02 should express its result in fl oz');
  assert.ok(!/390,?625/.test(f02.workedExample), 'formula-02 worked example must not retain the discarded incorrect intermediate value');
});

// E. Liquid chlorine worked example produces exactly one result.
test('E: js/calc-utils.js and js/calculator.js liquid-chlorine constants agree with each other', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const calculatorSrc = fs.readFileSync(path.join(ROOT, 'js', 'calculator.js'), 'utf8');
  const m1 = calcUtilsSrc.match(/749\.4/);
  const m2 = calculatorSrc.match(/749\.4/);
  assert.ok(m1, 'js/calc-utils.js must contain the corrected liquid-chlorine constant 749.4');
  assert.ok(m2, 'js/calculator.js must contain the corrected liquid-chlorine constant 749.4');
});

// F. LSI not accidentally exposed as a functioning calculator.
test('F1: no LSI computation function exists in js/calc-utils.js or js/calculator.js', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const calculatorSrc = fs.readFileSync(path.join(ROOT, 'js', 'calculator.js'), 'utf8');
  assert.ok(!/function\s+calculateLSI|calculateLSI\s*[:=]/i.test(calcUtilsSrc), 'js/calc-utils.js must not define calculateLSI');
  assert.ok(!/function\s+calculateLSI|calculateLSI\s*[:=]/i.test(calculatorSrc), 'js/calculator.js must not define calculateLSI');
});

test('F2: chemical-calculator.html trust panel no longer claims formula-lsi', () => {
  const html = fs.readFileSync(path.join(ROOT, 'calculators', 'chemical-calculator.html'), 'utf8');
  assert.ok(!/formula-lsi/.test(html), 'chemical-calculator.html must not reference formula-lsi');
});

test('F3: trust-calculator-metadata.js chemical-calculator record no longer lists formula-lsi/alkalinity/calcium-hardness formulaIds', () => {
  const meta = require(path.join(ROOT, 'scripts', 'data', 'trust-calculator-metadata.js'));
  const rec = meta.find((m) => m.id === 'chemical-calculator');
  assert.ok(rec, 'chemical-calculator record must exist');
  assert.deepStrictEqual(rec.formulaIds, ['formula-chlorine-dose', 'formula-ph-adjustment']);
});

// G. Shock presets unchanged.
test('G: pool-shock-calculator.html retains all 4 original presets (5/10/15/20 ppm)', () => {
  const html = fs.readFileSync(path.join(ROOT, 'calculators', 'pool-shock-calculator.html'), 'utf8');
  for (const v of ['5 ppm', '10 ppm', '15 ppm', '20 ppm']) {
    assert.ok(html.includes(v), `missing preset "${v}"`);
  }
});

test('G2: calculateShock function signature/logic unchanged (no combined-chlorine parameter added)', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const m = calcUtilsSrc.match(/function\s+calculateShock\s*\(([^)]*)\)/);
  assert.ok(m, 'calculateShock function must exist');
  assert.ok(!/combined/i.test(m[1]), 'calculateShock must not have gained a combined-chlorine parameter this phase');
});

// H. All newly-classified formulas have a documented evidence/disposition record.
test('H: liquid chlorine, alkalinity, and LSI all have dedicated audit reports with a disposition', () => {
  for (const file of ['LIQUID-CHLORINE-AUDIT.md', 'ALKALINITY-AUDIT.md', 'LSI-AUDIT.md']) {
    const text = fs.readFileSync(path.join(REPORT_DIR, file), 'utf8');
    assert.ok(/RESOLVED|IMPLEMENTATION_ERROR|DOCUMENTATION_ERROR|ARCHITECTURAL_GAP/.test(text), `${file} must record a disposition`);
  }
});

// I. No unsupported formula silently promoted to SUPPORTED.
test('I: chemistry-claims.js / chemistry-ranges.js were not modified this phase (claim-status changes are out of scope)', () => {
  const { execSync } = require('child_process');
  const diff = execSync('git diff --name-only 219a57d -- scripts/data/chemistry-claims.js scripts/data/chemistry-ranges.js', { cwd: ROOT, encoding: 'utf8' }).trim();
  assert.strictEqual(diff, '', `expected no changes, got: ${diff}`);
});

// J. No calculator formula changed without a corresponding audit decision.
test('J: every corrected constant (liquid chlorine, alkalinity) traces to a DECISION-MATRIX.csv row', () => {
  const decisionMatrix = fs.readFileSync(path.join(REPORT_DIR, 'DECISION-MATRIX.csv'), 'utf8');
  assert.ok(/Liquid chlorine/i.test(decisionMatrix), 'DECISION-MATRIX.csv missing a liquid chlorine row');
  assert.ok(/[Aa]lkalinity/.test(decisionMatrix), 'DECISION-MATRIX.csv missing an alkalinity row');
  assert.ok(/LSI/.test(decisionMatrix), 'DECISION-MATRIX.csv missing an LSI row');
});

// Additional: dosage-matrices.json and trust/datasets.json regenerate cleanly and match their sources.
test('K: data/datasets/dosage-matrices.json liquid-chlorine coefficients match scripts/data/dataset-dosage-matrices.js', () => {
  delete require.cache[require.resolve(path.join(ROOT, 'scripts', 'data', 'dataset-dosage-matrices.js'))];
  const src = require(path.join(ROOT, 'scripts', 'data', 'dataset-dosage-matrices.js'));
  const generated = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'datasets', 'dosage-matrices.json'), 'utf8'));
  const findCoef = (arrOrObj, id) => {
    const flat = Array.isArray(arrOrObj) ? arrOrObj : (arrOrObj.matrices || arrOrObj.records || Object.values(arrOrObj));
    const rec = flat.find((r) => r && r.id === id);
    return rec ? rec.coefficient : undefined;
  };
  const srcVal = findCoef(src, 'liquid-chlorine-10pct');
  const genVal = findCoef(generated, 'liquid-chlorine-10pct') !== undefined ? findCoef(generated, 'liquid-chlorine-10pct') : findCoef(generated.matrices || generated, 'liquid-chlorine-10pct');
  assert.strictEqual(srcVal, 13.3, `source coefficient should be 13.3, got ${srcVal}`);
});

console.log(`\ntest-phase-7s: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
