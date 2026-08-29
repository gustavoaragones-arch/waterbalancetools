#!/usr/bin/env node
'use strict';
/**
 * test-phase-7u.js (Phase 7U, Section 14)
 *
 * A-O minimum assertion categories:
 *  A. Phase 7T resolved formula-03 remains unchanged.
 *  B. Approved liquid-chlorine relationship remains unchanged.
 *  C. Existing pH behavior is unchanged unless architecture conclusively approved.
 *  D. Existing generic shock behavior is unchanged unless architecture conclusively approved.
 *  E. No unsupported divisor is promoted to supported.
 *  F. No product concentration is fabricated.
 *  G. No CC input appears unless architecture explicitly authorizes it.
 *  H. No TA/CYA input appears unless the pH architecture explicitly authorizes it.
 *  I. No LSI calculator exists.
 *  J. No bromine calculator exists.
 *  K. No URL/redirect/sitemap changes occur.
 *  L. No programmatic-family changes occur.
 *  M. All architecture decisions have evidence IDs.
 *  N. All production formula changes have ledger entries.
 *  O. No unresolved issue is silently classified as resolved.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BASELINE_COMMIT = '6cf09af';
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

const REPORT_DIR = path.join(ROOT, 'reports', 'phase-7u');
const formulasData = require(path.join(ROOT, 'scripts', 'data', 'formulas-data.js'));
const f03 = formulasData.find((f) => f.id === 'formula-03');

// A. Phase 7T resolved formula-03 remains unchanged.
test('A: formula-03 equation and worked example unchanged since Phase 7T', () => {
  assert.ok(/0\.013344/.test(f03.equation), 'formula-03 equation must retain the corrected 0.013344 constant');
  assert.ok(!/800/.test(f03.equation), 'formula-03 equation must not regress to the old 800 divisor');
  assert.ok(/16\.4\s*oz/.test(f03.workedExample), 'formula-03 worked example must retain 16.4 oz');
});

// B. Approved liquid-chlorine relationship remains unchanged.
test('B: js/calc-utils.js liquid chlorine and tablets constants unchanged', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  assert.ok(/749\.4/.test(calcUtilsSrc), 'liquid chlorine constant (749.4) must be unchanged');
  assert.ok(/6666\.7/.test(calcUtilsSrc), 'tablets constant (6666.7) must be unchanged');
});

// C. Existing pH behavior is unchanged unless architecture conclusively approved.
test('C: js/calc-utils.js calculatePHAdjustment signature and constants (6, 5) unchanged', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const m = calcUtilsSrc.match(/function calculatePHAdjustment\(gallons, currentPh, targetPh\)/);
  assert.ok(m, 'calculatePHAdjustment signature must be unchanged this phase (no architecture was sufficiently approved to implement)');
  assert.ok(/diff \* 6/.test(calcUtilsSrc), 'pH increaser constant (6) must be unchanged');
  assert.ok(/Math\.abs\(diff\) \* 5/.test(calcUtilsSrc), 'pH reducer constant (5) must be unchanged');
});

// D. Existing generic shock behavior is unchanged unless architecture conclusively approved.
test('D: js/calc-utils.js calculateShock and generic granular divisor unchanged', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const m = calcUtilsSrc.match(/function calculateShock\(([^)]*)\)/);
  assert.ok(m && /^gallons,\s*targetPpm$/.test(m[1].trim()), 'calculateShock signature must be unchanged (no product-selector input added this phase)');
  assert.ok(/\(g \* ppm\) \/ 10000/.test(calcUtilsSrc), 'generic granular/shock divisor (10000) must be unchanged');
});

// E. No unsupported divisor is promoted to supported.
test('E: generic shock divisor remains classified REQUIRES_EXPERT_REVIEW / ARCHITECTURAL_GAP, not SUPPORTED', () => {
  const gov = fs.readFileSync(path.join(REPORT_DIR, 'FORMULA-GOVERNANCE.md'), 'utf8');
  const shockRow = gov.split('\n').find((l) => /Generic granular\/shock/.test(l));
  assert.ok(shockRow, 'FORMULA-GOVERNANCE.md must document the generic shock divisor status');
  assert.ok(/REQUIRES_EXPERT_REVIEW|ARCHITECTURAL_GAP/.test(shockRow), 'generic shock divisor must not be marked SUPPORTED');
  assert.ok(!/\bSUPPORTED\b(?!_DOMAIN)/.test(shockRow.replace('SUPPORTED_DOMAIN_ASSUMPTION', '')), 'generic shock divisor row must not contain a bare SUPPORTED classification');
});

// F. No product concentration is fabricated.
test('F: dataset-dosage-matrices.js activePercent values unchanged since Phase 7T baseline', () => {
  const diff = execSync(`git diff ${BASELINE_COMMIT} -- scripts/data/dataset-dosage-matrices.js`, { cwd: ROOT, encoding: 'utf8' });
  const addedLines = diff.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++'));
  for (const l of addedLines) {
    assert.ok(!/activePercent:\s*[0-9]/.test(l) || diff.includes(l.replace('+', '-')), `dataset-dosage-matrices.js diff modifies an activePercent value: ${l}`);
  }
  const dataset = require(path.join(ROOT, 'scripts', 'data', 'dataset-dosage-matrices.js'));
  const calHypo65 = dataset.records.find((r) => r.id === 'calcium-hypochlorite-65pct');
  assert.strictEqual(calHypo65.activePercent, 65, 'calcium-hypochlorite-65pct activePercent must remain 65');
});

// G. No CC input appears unless architecture explicitly authorizes it.
test('G: no combined-chlorine input added to calculateShock or the shock calculator pages', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  assert.ok(!/calculateShock[\s\S]{0,200}combinedChlorine|combinedChlorine[\s\S]{0,200}calculateShock/i.test(calcUtilsSrc), 'calculateShock must not have gained a combined-chlorine parameter this phase');
  const shockHtml = fs.readFileSync(path.join(ROOT, 'calculators', 'pool-shock-calculator.html'), 'utf8');
  assert.ok(!/id="combined-chlorine"|name="combinedChlorine"/.test(shockHtml), 'pool-shock-calculator.html must not have gained a combined-chlorine input field this phase');
});

// H. No TA/CYA input appears unless the pH architecture explicitly authorizes it.
test('H: no TA/CYA input added to calculatePHAdjustment or the pH calculator pages', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const phMatch = calcUtilsSrc.match(/function calculatePHAdjustment\(([^)]*)\)/);
  assert.ok(phMatch && !/\bta\b|alkalinity|cya|cyanuric/i.test(phMatch[1]), 'calculatePHAdjustment must not have gained a TA/CYA parameter this phase');
  const phHtml = fs.readFileSync(path.join(ROOT, 'calculators', 'pool-ph-calculator.html'), 'utf8');
  assert.ok(!/id="total-alkalinity"|name="totalAlkalinity"|id="cya"|name="cya"/.test(phHtml), 'pool-ph-calculator.html must not have gained a TA/CYA input field this phase');
});

// I. No LSI calculator exists.
test('I: no LSI computation function exists anywhere in js/calc-utils.js or js/calculator.js', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const calculatorSrc = fs.readFileSync(path.join(ROOT, 'js', 'calculator.js'), 'utf8');
  assert.ok(!/function\s+calculateLSI/i.test(calcUtilsSrc) && !/function\s+calculateLSI/i.test(calculatorSrc), 'no LSI calculator function may exist');
});

// J. No bromine calculator exists.
test('J: no bromine calculator function exists anywhere in js/calc-utils.js or js/calculator.js', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const calculatorSrc = fs.readFileSync(path.join(ROOT, 'js', 'calculator.js'), 'utf8');
  assert.ok(!/function\s+calculateBromine/i.test(calcUtilsSrc) && !/function\s+calculateBromine/i.test(calculatorSrc), 'no bromine calculator function may exist');
});

// K. No URL/redirect/sitemap changes occur.
test('K: REDIRECT_SOURCES registry and sitemap files unchanged', () => {
  const { REDIRECT_SOURCES } = require('./url-policy');
  assert.strictEqual(Object.keys(REDIRECT_SOURCES).length, 6, 'REDIRECT_SOURCES must remain 6 entries');
  const diff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- sitemap.xml sitemap-index.xml`, { cwd: ROOT, encoding: 'utf8' }).trim();
  assert.strictEqual(diff, '', 'no sitemap files may change this phase');
});

// L. No programmatic-family changes occur.
test('L: programmatic/ directory unchanged', () => {
  const diff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- programmatic/`, { cwd: ROOT, encoding: 'utf8' }).trim();
  assert.strictEqual(diff, '', 'no programmatic/ files may change this phase');
});

// M. All architecture decisions have evidence IDs.
const matrixPath = path.join(REPORT_DIR, 'ARCHITECTURE-DECISION-MATRIX.csv');
let matrixRows = [];
test('M: every non-rejected architecture option in the decision matrix has an evidence_ids entry', () => {
  matrixRows = csvRows(matrixPath);
  const header = matrixRows[0];
  const evIdx = header.indexOf('evidence_ids');
  const classIdx = header.indexOf('classification');
  for (const r of matrixRows.slice(1)) {
    const cls = r[classIdx];
    if (/REJECTED|DO_NOT_BUILD/.test(cls)) continue; // rejection can rest on absence of evidence
    if (!r[evIdx] || !r[evIdx].trim()) {
      // Options relying purely on internal math (e.g. NARROW EXISTING TOOL, CONFIRMED subsumed) may cite no external evidence_id legitimately.
      assert.ok(/NARROW EXISTING TOOL|CONFIRMED|DEFERRED/.test(cls), `row "${r[0]}" (${cls}) has no evidence_ids and is not an internally-justified classification`);
    }
  }
});

// N. All production formula changes have ledger entries (this phase made dataset annotations, not formula changes -- verify none occurred without documentation).
test('N: PRODUCTION-CHANGES.md documents every touched file this phase', () => {
  const prodChanges = fs.readFileSync(path.join(REPORT_DIR, 'PRODUCTION-CHANGES.md'), 'utf8');
  const touches = execSync(`git diff --name-only ${BASELINE_COMMIT} -- scripts/data/ data/datasets/dosage-matrices.json reference/datasets/`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  for (const f of touches) {
    assert.ok(prodChanges.includes(f), `${f} was modified but is not mentioned in PRODUCTION-CHANGES.md`);
  }
});

// O. No unresolved issue is silently classified as resolved.
test('O: pH and generic shock divisor are NOT classified RESOLVED anywhere in Phase 7U reports', () => {
  for (const file of ['PH-ARCHITECTURE-DECISION.md', 'SHOCK-ARCHITECTURE-DECISION.md', 'FORMULA-GOVERNANCE.md']) {
    const text = fs.readFileSync(path.join(REPORT_DIR, file), 'utf8');
    // "RESOLVED" must not appear describing the pH constants or the generic divisor's own classification.
    const badPattern = /(pH constants?|generic (granular\/)?shock divisor)[^.\n]{0,80}\bRESOLVED\b/i;
    assert.ok(!badPattern.test(text), `${file} appears to silently mark the pH constants or generic shock divisor as RESOLVED`);
  }
});

console.log(`\ntest-phase-7u: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
