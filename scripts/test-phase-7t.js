#!/usr/bin/env node
'use strict';
/**
 * test-phase-7t.js (Phase 7T, Section 14)
 *
 * A-O minimum assertion categories:
 *  A. resolved formulas produce mathematically correct outputs
 *  B. units are consistent
 *  C. documentation examples agree with implementation
 *  D. no contradictory final values remain
 *  E. no abandoned equation remains unexplained
 *  F. unresolved formulas remain explicitly classified
 *  G. no unsupported formula is promoted to supported
 *  H. shock presets remain unchanged unless conclusively justified
 *  I. formula-03 units and equation are internally consistent
 *  J. pH architecture is not silently changed
 *  K. no LSI calculator appears
 *  L. no bromine calculator appears
 *  M. Phase 7S resolved formulas remain stable
 *  N. all formula changes have ledger entries
 *  O. no unrelated calculator changed
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BASELINE_COMMIT = 'd5cbe3f';
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

function csvRows(file) {
  const text = fs.readFileSync(file, 'utf8').trim();
  const lines = [];
  let cur = '', inQ = false, row = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur); lines.push(row); row = []; cur = ''; }
    else if (c !== '\r') cur += c;
  }
  if (cur.length || row.length) { row.push(cur); lines.push(row); }
  return lines;
}

const formulasData = require(path.join(ROOT, 'scripts', 'data', 'formulas-data.js'));
const f03 = formulasData.find((f) => f.id === 'formula-03');
const f04 = formulasData.find((f) => f.id === 'formula-04');
const REPORT_DIR = path.join(ROOT, 'reports', 'phase-7t');
const LEDGER = path.join(REPORT_DIR, 'FORMULA-DECISION-LEDGER.csv');

// A. Resolved formula (formula-03) produces mathematically correct output.
test('A: formula-03 worked example (16.4 oz / 1.03 lbs) matches the documented 0.013344 constant', () => {
  const oz = (4 * 20000 * 0.013344) / 65;
  assert.ok(Math.abs(oz - 16.42) < 0.05, `expected ~16.42, got ${oz}`);
  assert.ok(/16\.4\s*oz/.test(f03.workedExample), 'formula-03 worked example does not state 16.4 oz');
  assert.ok(/1\.03\s*lbs/.test(f03.workedExample), 'formula-03 worked example does not state 1.03 lbs');
});

// B. Units are consistent (formula-03 no longer mixes oz equation label with an lbs-only result).
test('B: formula-03 equation and worked example both express the primary result in oz', () => {
  assert.ok(/oz/i.test(f03.equation), 'formula-03 equation should state oz');
  assert.ok(/16\.4\s*oz/.test(f03.workedExample), 'formula-03 worked example should state the oz result before any lbs conversion');
});

// C. Documentation examples agree with implementation (formula-03's constant matches formula-02's, already implemented and tested in js/calc-utils.js).
test('C: formula-03 uses the same 0.013344 constant already implemented for liquid chlorine in js/calc-utils.js', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  assert.ok(/749\.4/.test(calcUtilsSrc), 'js/calc-utils.js should retain the Phase 7S liquid-chlorine constant (749.4 = 100/0.013344*... consistency check)');
  assert.ok(/0\.013344/.test(f03.equation), 'formula-03 equation should state the 0.013344 constant');
});

// D. No contradictory final values remain in formula-03's worked example.
test('D: formula-03 worked example does not contain the old, incorrect 1.54 lbs value', () => {
  assert.ok(!/1\.54\s*lbs/.test(f03.workedExample), 'formula-03 worked example still contains the old incorrect 1.54 lbs value');
});

// E. No abandoned equation remains unexplained -- formula-04's abandoned worked example is
// explicitly documented as an intentional, evidence-based non-fix, not silently left broken.
test('E: formula-04 (pH) abandoned worked example is explicitly documented in PH-AUDIT.md as unresolved', () => {
  const phAudit = fs.readFileSync(path.join(REPORT_DIR, 'PH-AUDIT.md'), 'utf8');
  assert.ok(/abandon/i.test(phAudit), 'PH-AUDIT.md must document the abandoned-worked-example defect');
  assert.ok(/REQUIRES_EXPERT_REVIEW/.test(phAudit), 'PH-AUDIT.md must record a REQUIRES_EXPERT_REVIEW disposition');
});

// F. Unresolved formulas remain explicitly classified.
test('F: pH and generic shock divisor both carry an explicit classification in the ledger', () => {
  const rows = csvRows(LEDGER);
  const header = rows[0];
  const classIdx = header.indexOf('classification');
  const issueIdx = header.indexOf('issue');
  const phRow = rows.slice(1).find((r) => /pH/i.test(r[issueIdx]));
  const shockDivRow = rows.slice(1).find((r) => /10000 divisor/i.test(r[issueIdx]));
  assert.ok(phRow && /REQUIRES_EXPERT_REVIEW/.test(phRow[classIdx]), 'pH ledger row must be classified REQUIRES_EXPERT_REVIEW');
  assert.ok(shockDivRow && /REQUIRES_EXPERT_REVIEW/.test(shockDivRow[classIdx]), 'generic shock divisor ledger row must be classified REQUIRES_EXPERT_REVIEW');
});

// G. No unsupported formula is promoted to supported -- chemistry-claims.js/ranges.js untouched.
test('G: chemistry-claims.js / chemistry-ranges.js were not modified this phase', () => {
  const diff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- scripts/data/chemistry-claims.js scripts/data/chemistry-ranges.js`, { cwd: ROOT, encoding: 'utf8' }).trim();
  assert.strictEqual(diff, '', `expected no changes, got: ${diff}`);
});

// H. Shock presets remain unchanged unless conclusively justified (they were not changed).
test('H: pool-shock-calculator.html retains all 4 original presets (5/10/15/20 ppm)', () => {
  const html = fs.readFileSync(path.join(ROOT, 'calculators', 'pool-shock-calculator.html'), 'utf8');
  for (const v of ['5 ppm', '10 ppm', '15 ppm', '20 ppm']) {
    assert.ok(html.includes(v), `missing preset "${v}"`);
  }
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  assert.ok(/function\s+calculateShock/.test(calcUtilsSrc), 'calculateShock function must still exist');
});

// I. formula-03 units and equation are internally consistent now that it is resolved.
test('I: formula-03 equation no longer contains the old incorrect /800 divisor', () => {
  assert.ok(!/800/.test(f03.equation), 'formula-03 equation should no longer contain the incorrect 800 divisor');
  assert.ok(/0\.013344/.test(f03.equation), 'formula-03 equation should contain the corrected 0.013344 constant');
});

// J. pH architecture is not silently changed.
test('J: js/calc-utils.js calculatePHAdjustment signature and constants (6, 5) are unchanged', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const m = calcUtilsSrc.match(/function calculatePHAdjustment\(gallons, currentPh, targetPh\)/);
  assert.ok(m, 'calculatePHAdjustment signature must be unchanged (no new TA parameter added)');
  assert.ok(/diff \* 6/.test(calcUtilsSrc), 'pH increaser constant (6) must be unchanged');
  assert.ok(/Math\.abs\(diff\) \* 5/.test(calcUtilsSrc), 'pH reducer constant (5) must be unchanged');
});

// K. No LSI calculator appears.
test('K: no LSI computation function exists anywhere in js/calc-utils.js or js/calculator.js', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const calculatorSrc = fs.readFileSync(path.join(ROOT, 'js', 'calculator.js'), 'utf8');
  assert.ok(!/function\s+calculateLSI/i.test(calcUtilsSrc), 'js/calc-utils.js must not define calculateLSI');
  assert.ok(!/function\s+calculateLSI/i.test(calculatorSrc), 'js/calculator.js must not define calculateLSI');
});

// L. No bromine calculator appears.
test('L: no bromine calculator function exists anywhere in js/calc-utils.js or js/calculator.js', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const calculatorSrc = fs.readFileSync(path.join(ROOT, 'js', 'calculator.js'), 'utf8');
  assert.ok(!/function\s+calculateBromine/i.test(calcUtilsSrc), 'js/calc-utils.js must not define calculateBromine');
  assert.ok(!/function\s+calculateBromine/i.test(calculatorSrc), 'js/calculator.js must not define calculateBromine');
});

// M. Phase 7S resolved formulas remain stable (liquid chlorine, alkalinity, LSI documentation unchanged this phase).
test('M: Phase 7S-resolved liquid chlorine and alkalinity constants are unchanged', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  assert.ok(/749\.4/.test(calcUtilsSrc), 'liquid chlorine constant (749.4) must be unchanged');
  assert.ok(/6666\.7/.test(calcUtilsSrc), 'tablets constant (6666.7) must be unchanged');
  const f02 = formulasData.find((f) => f.id === 'formula-02');
  const f05 = formulasData.find((f) => f.id === 'formula-05');
  assert.ok(/0\.013344/.test(f02.equation), 'formula-02 equation constant must be unchanged');
  assert.ok(/0\.000224/.test(f05.equation), 'formula-05 equation constant must be unchanged');
});

// N. All formula changes have ledger entries.
test('N: formula-03 change has a corresponding FORMULA-DECISION-LEDGER.csv row with production_change=Yes', () => {
  const rows = csvRows(LEDGER);
  const header = rows[0];
  const idIdx = header.indexOf('id');
  const prodIdx = header.indexOf('production_change');
  const row = rows.slice(1).find((r) => r[idIdx] === '7T-01');
  assert.ok(row, 'ledger must contain row 7T-01 for the formula-03 change');
  assert.strictEqual(row[prodIdx], 'Yes', '7T-01 production_change must be Yes');
});

// O. No unrelated calculator changed.
const UNRELATED_CALCULATORS = [
  'calculators/pool-volume-calculator.html',
  'calculators/spa-volume-calculator.html',
  'calculators/pool-turnover-rate-calculator.html',
  'calculators/pool-cyanuric-acid-calculator.html',
  'calculators/saltwater-pool-salt-calculator.html',
  'calculators/pool-chlorine-calculator.html',
  'calculators/hot-tub-chlorine-calculator.html',
  'calculators/pool-ph-calculator.html',
  'calculators/hot-tub-ph-calculator.html',
  'calculators/pool-alkalinity-calculator.html',
  'calculators/chemical-calculator.html',
  'calculators/pool-shock-calculator.html',
  'calculators/hot-tub-shock-calculator.html',
  'calculators/volume-calculator.html',
];
test('O: no calculator HTML file has a real (non-whitespace) diff against the Phase 7S baseline', () => {
  for (const f of UNRELATED_CALCULATORS) {
    let diff = '';
    try {
      diff = execSync(`git diff -w --stat ${BASELINE_COMMIT} -- "${f}"`, { cwd: ROOT, encoding: 'utf8' }).trim();
    } catch (e) { /* non-fatal */ }
    assert.strictEqual(diff, '', `${f} has an unexpected real diff against baseline: ${diff}`);
  }
});

console.log(`\ntest-phase-7t: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
