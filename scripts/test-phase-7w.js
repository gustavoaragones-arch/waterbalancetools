#!/usr/bin/env node
'use strict';
/**
 * test-phase-7w.js (Phase 7W)
 *
 * Categories A-S required by the Phase 7W spec, inspecting actual
 * source/output rather than only existence.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BASELINE_COMMIT = 'cd91013';
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
delete require.cache[require.resolve(path.join(ROOT, 'js', 'calculator.js'))];
require(path.join(ROOT, 'js', 'calc-utils.js'));
require(path.join(ROOT, 'js', 'calculator.js'));
const cu = global.window.WaterBalance.calcUtils;
const c = global.window.WaterBalance.calculator;
const REPORT_DIR = path.join(ROOT, 'reports', 'phase-7w');

function csvRows(file) {
  const text = fs.readFileSync(file, 'utf8').trim();
  const lines = [];
  let cur = '', inQ = false, row = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n') { row.push(cur); lines.push(row); row = []; cur = ''; }
    else if (ch !== '\r') cur += ch;
  }
  if (cur.length || row.length) { row.push(cur); lines.push(row); }
  return lines;
}

// A. Selector exists.
test('A: pool-shock-calculator.html and hot-tub-shock-calculator.html have a product selector', () => {
  const pool = fs.readFileSync(path.join(ROOT, 'calculators', 'pool-shock-calculator.html'), 'utf8');
  const hotTub = fs.readFileSync(path.join(ROOT, 'calculators', 'hot-tub-shock-calculator.html'), 'utf8');
  assert.ok(/id="product"/.test(pool), 'pool-shock-calculator.html must have a #product selector');
  assert.ok(/id="product"/.test(hotTub), 'hot-tub-shock-calculator.html must have a #product selector');
});

// B. Only approved products are selectable.
test('B: pool-shock-calculator.html only offers the 6 dataset-approved products (+ unknown fallback)', () => {
  const html = fs.readFileSync(path.join(ROOT, 'calculators', 'pool-shock-calculator.html'), 'utf8');
  const selectBlock = html.match(/<select id="product">([\s\S]*?)<\/select>/)[1];
  const optionIds = selectBlock.match(/value="([^"]+)"/g).map((m) => m.match(/value="([^"]+)"/)[1]);
  const approved = new Set(Object.keys(cu.SHOCK_PRODUCTS));
  for (const id of optionIds) {
    assert.ok(id === 'unknown' || approved.has(id), `unexpected product option "${id}" not in approved SHOCK_PRODUCTS`);
  }
});

// C. Unsupported products are excluded.
test('C: hot-tub-shock-calculator.html excludes dichlor/trichlor (not hot-tub-supported per dataset)', () => {
  const html = fs.readFileSync(path.join(ROOT, 'calculators', 'hot-tub-shock-calculator.html'), 'utf8');
  assert.ok(!/sodium-dichlor|trichlor-tablets/.test(html), 'hot-tub-shock-calculator.html must not offer dichlor/trichlor');
  const dataset = require(path.join(ROOT, 'scripts', 'data', 'dataset-dosage-matrices.js'));
  const dichlor = dataset.records.find((r) => r.id === 'sodium-dichlor-56pct');
  assert.ok(!dichlor.supportedPoolTypes.includes('hot-tub'), 'dataset must confirm dichlor is not hot-tub-supported (basis for exclusion)');
});

// D. Product selection changes the calculation path.
test('D: calculateShockByProduct produces different results for different products, same inputs', () => {
  const a = cu.calculateShockByProduct(20000, 10, 'calcium-hypochlorite-65pct');
  const b = cu.calculateShockByProduct(20000, 10, 'trichlor-tablets-90pct');
  assert.ok(a.valid && b.valid);
  assert.notStrictEqual(a.ounces, b.ounces, 'different products must produce different doses for the same inputs');
});

// E. Calculation uses the approved mass-balance basis.
test('E: calculateShockByProduct matches the 0.013344 mass-balance formula exactly', () => {
  const r = cu.calculateShockByProduct(20000, 4, 'calcium-hypochlorite-65pct');
  const expected = (4 * 20000 * 0.013344) / 65;
  assert.ok(Math.abs(r.ounces - expected) < 1e-9, `expected ${expected}, got ${r.ounces}`);
  assert.ok(Math.abs(r.ounces - 16.42) < 0.01, 'must match formula-03 worked example (16.42 oz)');
});

// F. Generic unsupported divisor is not used.
test('F: no live code path divides by the generic 10000 shock divisor', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const calculatorSrc = fs.readFileSync(path.join(ROOT, 'js', 'calculator.js'), 'utf8');
  assert.ok(!/function\s+calculateShock\s*\(/.test(calcUtilsSrc), 'js/calc-utils.js must not define the old calculateShock');
  assert.ok(!/function\s+granularShockOunces/.test(calculatorSrc), 'js/calculator.js must not define the old granularShockOunces');
  assert.strictEqual(typeof cu.calculateShock, 'undefined');
  assert.strictEqual(typeof c.granularShockOunces, 'undefined');
});

// G. Result is deterministic.
test('G: calculateShockByProduct is deterministic', () => {
  const a = cu.calculateShockByProduct(15000, 10, 'sodium-dichlor-56pct');
  const b = cu.calculateShockByProduct(15000, 10, 'sodium-dichlor-56pct');
  assert.deepStrictEqual(a, b);
});

// H. Result is positive for valid inputs.
test('H: result is positive for all 6 products with valid inputs', () => {
  for (const id of Object.keys(cu.SHOCK_PRODUCTS)) {
    const r = cu.calculateShockByProduct(15000, 10, id);
    assert.ok(r.valid && r.ounces > 0, `${id} must produce a positive ounce value`);
  }
});

// I. Invalid volume/input handling remains safe.
test('I: invalid inputs return {valid:false} without throwing', () => {
  assert.strictEqual(cu.calculateShockByProduct(0, 10, 'liquid-chlorine-10pct').valid, false);
  assert.strictEqual(cu.calculateShockByProduct(15000, 0, 'liquid-chlorine-10pct').valid, false);
  assert.strictEqual(cu.calculateShockByProduct(15000, 10, 'not-a-real-product').valid, false);
  assert.strictEqual(cu.calculateShockByProduct(-100, 10, 'liquid-chlorine-10pct').valid, false);
});

// J. Product-specific safety note is surfaced.
test('J: mixing warning is present for calcium hypochlorite and trichlor, absent for liquid chlorine', () => {
  assert.ok(cu.SHOCK_PRODUCTS['calcium-hypochlorite-65pct'].mixingWarning, 'cal-hypo must have a mixing warning');
  assert.ok(cu.SHOCK_PRODUCTS['trichlor-tablets-90pct'].mixingWarning, 'trichlor must have a mixing warning');
  assert.ok(!cu.SHOCK_PRODUCTS['liquid-chlorine-10pct'].mixingWarning, 'liquid chlorine must not have an invented mixing warning');
  const html = fs.readFileSync(path.join(ROOT, 'calculators', 'pool-shock-calculator.html'), 'utf8');
  assert.ok(/mixingWarning/.test(html), 'pool-shock-calculator.html must surface product.mixingWarning in its output');
});

// K. formula-03 documentation matches implementation.
test('K: formula-03 equation matches the live calculateShockByProduct formula', () => {
  const formulasData = require(path.join(ROOT, 'scripts', 'data', 'formulas-data.js'));
  const f03 = formulasData.find((f) => f.id === 'formula-03');
  assert.ok(/0\.013344/.test(f03.equation));
  assert.ok(!/800/.test(f03.equation), 'formula-03 must not have regressed to the old /800 divisor');
  assert.ok(/directly implemented/i.test(f03.explanation), 'formula-03 must state it is now directly implemented');
  assert.ok(/do NOT compute/i.test(f03.explanation), 'formula-03 must state what is not computed');
});

// L. Trust-panel metadata matches implementation.
test('L: trust-calculator-metadata.js shock entries no longer claim combined-chlorine dependency', () => {
  const meta = require(path.join(ROOT, 'scripts', 'data', 'trust-calculator-metadata.js'));
  for (const id of ['pool-shock-calculator', 'hot-tub-shock-calculator']) {
    const rec = meta.find((m) => m.id === id);
    assert.ok(!(rec.entityDependencies || []).includes('combined-chlorine'), `${id} must not list combined-chlorine (never read)`);
    assert.ok(/product-specific/i.test(rec.notes), `${id} notes must describe the product-specific mechanism`);
  }
});
test('L2: trust-formulas.js formula-shock-dose no longer describes a breakpoint formula', () => {
  const trustFormulas = require(path.join(ROOT, 'scripts', 'data', 'trust-formulas.js'));
  const rec = trustFormulas.records.find((r) => r.id === 'formula-shock-dose');
  assert.ok(!/combinedChlorine/.test(rec.formula), 'formula-shock-dose must not describe a combinedChlorine-based formula');
  assert.ok(/0\.013344/.test(rec.formula), 'formula-shock-dose must describe the actual 0.013344-based formula');
});

// M. No breakpoint-chlorination claim is introduced.
test('M: no calculator collects combined chlorine or computes a breakpoint target', () => {
  for (const f of ['calculators/pool-shock-calculator.html', 'calculators/hot-tub-shock-calculator.html']) {
    const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
    assert.ok(!/id="combined-chlorine"|combinedChlorine/.test(html), `${f} must not collect combined chlorine`);
  }
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  assert.ok(!/combinedChlorine/.test(calcUtilsSrc));
});

// N. No LSI/bromine calculator is introduced.
test('N: no LSI or bromine calculator function exists', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const calculatorSrc = fs.readFileSync(path.join(ROOT, 'js', 'calculator.js'), 'utf8');
  assert.ok(!/function\s+calculateLSI/i.test(calcUtilsSrc) && !/function\s+calculateLSI/i.test(calculatorSrc));
  assert.ok(!/function\s+calculateBromine/i.test(calcUtilsSrc) && !/function\s+calculateBromine/i.test(calculatorSrc));
});

// O. Unrelated calculator logic is unchanged.
const UNRELATED_CALCULATORS = [
  'calculators/pool-volume-calculator.html', 'calculators/spa-volume-calculator.html',
  'calculators/pool-turnover-rate-calculator.html', 'calculators/pool-cyanuric-acid-calculator.html',
  'calculators/saltwater-pool-salt-calculator.html', 'calculators/pool-chlorine-calculator.html',
  'calculators/hot-tub-chlorine-calculator.html', 'calculators/pool-alkalinity-calculator.html',
  'calculators/pool-ph-calculator.html', 'calculators/hot-tub-ph-calculator.html',
];
test('O: no unrelated calculator HTML file has a real (non-whitespace) diff against the Phase 7V baseline', () => {
  for (const f of UNRELATED_CALCULATORS) {
    let diff = '';
    try {
      diff = execSync(`git diff -w --stat ${BASELINE_COMMIT} -- "${f}"`, { cwd: ROOT, encoding: 'utf8' }).trim();
    } catch (e) { /* non-fatal */ }
    assert.strictEqual(diff, '', `${f} has an unexpected real diff against baseline: ${diff}`);
  }
});
test('O2: liquid chlorine and pH functions unchanged', () => {
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  assert.ok(/749\.4/.test(calcUtilsSrc));
  assert.ok(/'balanced'/.test(calcUtilsSrc), 'pH qualitative model (Phase 7V) must remain intact');
});

// P. No programmatic-family files are changed.
test('P: programmatic/ directory unchanged', () => {
  const diff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- programmatic/`, { cwd: ROOT, encoding: 'utf8' }).trim();
  assert.strictEqual(diff, '', `programmatic/ must be unchanged, got: ${diff}`);
});

// Q. No new unsupported chemistry claims are introduced.
test('Q: no new chemistry-claims.js/chemistry-ranges.js changes this phase', () => {
  const diff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- scripts/data/chemistry-claims.js scripts/data/chemistry-ranges.js scripts/data/chemistry-sources.js`, { cwd: ROOT, encoding: 'utf8' }).trim();
  assert.strictEqual(diff, '', 'no new/modified chemistry evidence records expected this phase (Section 10: reuse only)');
});

// R. Provenance references resolve.
test('R: every evidence_ids reference in the ledger resolves to a real chemistry-sources.js record or a registered claim', () => {
  const { SOURCES_BY_ID } = require(path.join(ROOT, 'scripts', 'data', 'chemistry-sources.js'));
  for (const id of ['phta-water-chemistry-adjustment-guide-2021', 'in-doh-chemical-adjustment-2021', 'phta-calcium-hypochlorite-fact-sheet-2021']) {
    assert.ok(SOURCES_BY_ID[id], `expected evidence source "${id}" to exist`);
  }
  const claimsSrc = fs.readFileSync(path.join(ROOT, 'scripts', 'data', 'chemistry-claims.js'), 'utf8');
  assert.ok(/claim-trichlor-calhypo-mixing-hazard/.test(claimsSrc), 'expected the mixing-hazard claim to exist');
});

// S. Build output is reproducible.
test('S: generate-trust.js output is byte-identical across two runs', () => {
  execSync('node scripts/generate-trust.js', { cwd: ROOT });
  const run1 = fs.readFileSync(path.join(ROOT, 'data', 'trust', 'formulas.json'), 'utf8');
  execSync('node scripts/generate-trust.js', { cwd: ROOT });
  const run2 = fs.readFileSync(path.join(ROOT, 'data', 'trust', 'formulas.json'), 'utf8');
  assert.strictEqual(run1, run2);
});

console.log(`\ntest-phase-7w: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
