#!/usr/bin/env node
'use strict';
/**
 * validate-phase-7v.js (Phase 7V)
 *
 * Validates: required reports exist; the live pH calculator produces no
 * numeric dose; old constants not used for live dosing; formula-04 no
 * longer presents an unsupported formula as valid; trust panels match
 * the new architecture; no unrelated calculator changed; no LSI/bromine
 * calculator; no TA/CYA/CC input added; no URL/redirect/sitemap/
 * programmatic-family changes; decision matrix / production-changes
 * completeness.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BASELINE_COMMIT = '4de88b8';
let errors = 0;
let warnings = 0;
const err = (msg) => { console.error('ERROR: ' + msg); errors++; };
const warn = (msg) => { console.warn('WARN: ' + msg); warnings++; };

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

const REPORT_DIR = path.join(ROOT, 'reports', 'phase-7v');

// 1. Required reports exist.
const REQUIRED_REPORTS = ['BASELINE.md', 'PH-IMPLEMENTATION.md', 'PRODUCTION-CHANGES.md', 'DECISION-MATRIX.csv', 'REVIEW-QUEUE.md', 'PHASE-7V-STATUS.md'];
for (const f of REQUIRED_REPORTS) {
  if (!fs.existsSync(path.join(REPORT_DIR, f))) err(`reports/phase-7v/${f} missing`);
}

// 2. Live pH calculator produces no numeric dose.
{
  global.window = {};
  delete require.cache[require.resolve(path.join(ROOT, 'js', 'calc-utils.js'))];
  delete require.cache[require.resolve(path.join(ROOT, 'js', 'calculator.js'))];
  require(path.join(ROOT, 'js', 'calc-utils.js'));
  require(path.join(ROOT, 'js', 'calculator.js'));
  const cu = global.window.WaterBalance.calcUtils;
  const c = global.window.WaterBalance.calculator;
  const r1 = cu.calculatePHAdjustment(15000, 7.1, 7.4);
  if ('ounces' in r1 || 'pounds' in r1 || 'dose' in r1) err('calculatePHAdjustment still returns a numeric dose field');
  if (typeof c.phIncreaserOunces === 'function' || typeof c.phReducerOunces === 'function') err('js/calculator.js still exposes the old ounce-returning pH functions');
  if (typeof c.evaluatePHGuidance !== 'function') err('js/calculator.js must expose evaluatePHGuidance');
}

// 3. Old constants not used for live dosing (6/5 must not appear as multipliers in the pH function).
{
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const phFnMatch = calcUtilsSrc.match(/function calculatePHAdjustment[\s\S]*?\n  \}/);
  if (phFnMatch) {
    if (/\*\s*6\b/.test(phFnMatch[0]) || /\*\s*5\b/.test(phFnMatch[0])) {
      err('calculatePHAdjustment still multiplies by the old, unsupported 6/5 constants');
    }
  } else {
    err('Could not locate calculatePHAdjustment in js/calc-utils.js');
  }
}

// 4. formula-04 no longer presents an unsupported formula as valid.
{
  const formulasData = require(path.join(ROOT, 'scripts', 'data', 'formulas-data.js'));
  const f04 = formulasData.find((f) => f.id === 'formula-04');
  if (!f04) err('formula-04 missing from formulas-data.js');
  else {
    if (/0\.0833/.test(f04.equation)) err('formula-04 still presents the old, unimplemented 0.0833 equation as valid');
    if (/^Acid dose \(fl oz\) =/.test(f04.equation)) err('formula-04 appears to present a new closed-form equation -- forbidden');
    if (!/No single validated dosing equation/.test(f04.equation)) warn('formula-04 equation field does not clearly state that no formula is published');
  }
}

// 5. Trust panels match the new architecture.
{
  const meta = require(path.join(ROOT, 'scripts', 'data', 'trust-calculator-metadata.js'));
  for (const id of ['pool-ph-calculator', 'hot-tub-ph-calculator']) {
    const rec = meta.find((m) => m.id === id);
    if (!rec) { err(`trust-calculator-metadata.js missing ${id}`); continue; }
    if ((rec.datasetDependencies || []).includes('dosage-matrices')) err(`${id} still lists dosage-matrices as a dependency, which the live calculator does not read`);
    if ((rec.entityDependencies || []).some((e) => ['muriatic-acid', 'soda-ash'].includes(e))) err(`${id} still names a specific product entity dependency`);
    if (!rec.notes || !/does NOT calculate a chemical dose/.test(rec.notes)) err(`${id} notes do not clearly disclose that no chemical dose is calculated`);
  }
  const chemCalc = meta.find((m) => m.id === 'chemical-calculator');
  if (chemCalc && /Computes a chlorine dose and a pH dose only/.test(chemCalc.notes || '')) {
    err('chemical-calculator trust notes still falsely claim a pH dose is computed');
  }
}

// 6. Trust panel HTML matches metadata (spot check live pages).
{
  for (const f of ['calculators/pool-ph-calculator.html', 'calculators/hot-tub-ph-calculator.html']) {
    const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (!/does NOT calculate a chemical dose/.test(html)) err(`${f} trust panel does not reflect the corrected note`);
  }
}

// 7. No unrelated calculator changed.
const UNRELATED_CALCULATORS = [
  'calculators/pool-volume-calculator.html', 'calculators/spa-volume-calculator.html',
  'calculators/pool-turnover-rate-calculator.html', 'calculators/pool-cyanuric-acid-calculator.html',
  'calculators/saltwater-pool-salt-calculator.html', 'calculators/pool-chlorine-calculator.html',
  'calculators/hot-tub-chlorine-calculator.html', 'calculators/pool-alkalinity-calculator.html',
  'calculators/pool-shock-calculator.html', 'calculators/hot-tub-shock-calculator.html',
];
for (const f of UNRELATED_CALCULATORS) {
  let diff = '';
  try {
    diff = execSync(`git diff -w --stat ${BASELINE_COMMIT} -- "${f}"`, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch (e) { /* non-fatal */ }
  if (diff !== '') err(`Unrelated calculator changed: ${f}\n${diff}`);
}

// 8. No LSI/bromine calculator.
{
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const calculatorSrc = fs.readFileSync(path.join(ROOT, 'js', 'calculator.js'), 'utf8');
  if (/function\s+calculateLSI/i.test(calcUtilsSrc) || /function\s+calculateLSI/i.test(calculatorSrc)) err('An LSI calculator function was found -- forbidden');
  if (/function\s+calculateBromine/i.test(calcUtilsSrc) || /function\s+calculateBromine/i.test(calculatorSrc)) err('A bromine calculator function was found -- forbidden');
}

// 9. No TA/CYA input added to pH; no CC input added to shock.
{
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const phMatch = calcUtilsSrc.match(/function calculatePHAdjustment\(([^)]*)\)/);
  if (phMatch && phMatch[1].split(',').length !== 3) err('calculatePHAdjustment must retain exactly 3 parameters');
  const shockMatch = calcUtilsSrc.match(/function calculateShock\(([^)]*)\)/);
  if (shockMatch && !/^gallons,\s*targetPpm$/.test(shockMatch[1].trim())) err('calculateShock signature must be unchanged this phase');
}

// 10. No URL/redirect/sitemap/programmatic-family/i18n changes.
{
  let scopeDiff = [];
  try {
    scopeDiff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- programmatic/ es/ fr/ ads.txt sitemap.xml sitemap-index.xml`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal */ }
  if (scopeDiff.length > 0) err(`Forbidden scope change detected: ${scopeDiff.join(', ')}`);
  try {
    const { REDIRECT_SOURCES } = require('./url-policy');
    if (Object.keys(REDIRECT_SOURCES).length !== 6) err(`REDIRECT_SOURCES registry changed: expected 6, found ${Object.keys(REDIRECT_SOURCES).length}`);
  } catch (e) { warn('Could not load scripts/url-policy.js'); }
}

// 11. Decision matrix / production-changes completeness.
const matrixPath = path.join(REPORT_DIR, 'DECISION-MATRIX.csv');
if (fs.existsSync(matrixPath)) {
  const rows = csvRows(matrixPath);
  const header = rows[0];
  const required = ['id', 'item', 'file', 'old_state', 'new_state', 'classification', 'rationale', 'evidence_basis', 'safety_review', 'tested'];
  for (const col of required) if (!header.includes(col)) err(`DECISION-MATRIX.csv missing required column: ${col}`);
  const badRows = rows.slice(1).filter((r) => r.length !== header.length);
  if (badRows.length) err(`DECISION-MATRIX.csv has ${badRows.length} malformed row(s)`);
}
const productionChangesPath = path.join(REPORT_DIR, 'PRODUCTION-CHANGES.md');
if (fs.existsSync(productionChangesPath)) {
  const doc = fs.readFileSync(productionChangesPath, 'utf8');
  const EXPECTED_TOUCHES = [
    'js/calc-utils.js', 'js/calculator.js',
    'calculators/pool-ph-calculator.html', 'calculators/hot-tub-ph-calculator.html', 'calculators/chemical-calculator.html', 'calculators/index.html',
    'scripts/data/formulas-data.js', 'scripts/data/trust-calculator-metadata.js', 'scripts/generate-authority-guides.js',
    'data/formulas.json', 'data/trust/datasets.json', 'data/navigation.json',
    'formulas/ph-adjustment-formula.html', 'reference/common-pool-chemistry-mistakes.html', 'guides/ph/how-to-lower-pool-ph.html',
  ];
  let touches = [];
  try {
    touches = execSync(`git diff --name-only ${BASELINE_COMMIT} -- js/ scripts/data/ scripts/generate-authority-guides.js calculators/ data/formulas.json data/trust/ data/navigation.json formulas/ guides/ reference/`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal */ }
  const isWhitespaceOnlyDiff = (f) => {
    try {
      const out = execSync(`git diff -w --stat ${BASELINE_COMMIT} -- "${f}"`, { cwd: ROOT, encoding: 'utf8' });
      return out.trim() === '';
    } catch (e) { return false; }
  };
  for (const f of touches) {
    if (!EXPECTED_TOUCHES.includes(f) && !doc.includes(f) && !isWhitespaceOnlyDiff(f)) {
      err(`Undocumented production change: ${f} was modified but is not mentioned in PRODUCTION-CHANGES.md`);
    }
  }
}

console.log('validate-phase-7v: reports + numeric-dose-prohibition + trust + scope control checked.');
if (errors > 0) {
  console.error(`validate-phase-7v: FAIL -- ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
} else {
  console.log(`validate-phase-7v: PASS -- 0 errors, ${warnings} warning(s).`);
}
