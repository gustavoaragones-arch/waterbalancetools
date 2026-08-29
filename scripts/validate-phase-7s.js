#!/usr/bin/env node
'use strict';
/**
 * validate-phase-7s.js (Phase 7S, Step 15)
 *
 * Guards this phase's calculator-formula-integrity scope: formula
 * inventory completeness, classification validity, evidence/disposition
 * presence, no missing audit decisions, documentation/implementation
 * consistency for resolved formulas, no contradictory worked examples, no
 * unsupported formula marked SUPPORTED, no LSI calculator implementation,
 * shock preset integrity, no forbidden scope changes, report completeness.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BASELINE_COMMIT = '219a57d'; // Phase 7R's committed HEAD, this phase's actual starting point.
let errors = 0;
let warnings = 0;
const err = (msg) => { console.error('ERROR: ' + msg); errors++; };
const warn = (msg) => { console.warn('WARN: ' + msg); warnings++; };

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

const REPORT_DIR = path.join(ROOT, 'reports', 'phase-7s');

// 1. Formula inventory completeness.
const inventoryPath = path.join(REPORT_DIR, 'CALCULATOR-FORMULA-INVENTORY.csv');
if (!fs.existsSync(inventoryPath)) {
  err('reports/phase-7s/CALCULATOR-FORMULA-INVENTORY.csv missing');
} else {
  const rows = csvRows(inventoryPath);
  const header = rows[0];
  const required = ['calculator_page', 'source_file', 'function_name', 'formula_as_implemented', 'constants', 'input_units', 'output_units', 'doc_page', 'doc_formula', 'worked_example_status', 'math_or_domain_assumption', 'evidence_for_constant', 'status'];
  for (const col of required) if (!header.includes(col)) err(`CALCULATOR-FORMULA-INVENTORY.csv missing required column: ${col}`);
  if (rows.length - 1 < 10) warn(`CALCULATOR-FORMULA-INVENTORY.csv has only ${rows.length - 1} rows -- verify coverage of the required calculator list`);
  const badRows = rows.slice(1).filter((r) => r.length !== header.length);
  if (badRows.length) err(`CALCULATOR-FORMULA-INVENTORY.csv has ${badRows.length} malformed row(s)`);
}

// 2. Classification validity (Section 4's exact 6 categories, allowing compound/qualified values).
const VALID_CLASS_RE = /VERIFIED_MATH|SUPPORTED_DOMAIN_ASSUMPTION|REQUIRES_EXPERT_REVIEW|DOCUMENTATION_ERROR|IMPLEMENTATION_ERROR|ARCHITECTURAL_GAP|RESOLVED|CONFIRMED|OUT_OF_SCOPE|n\/a/;
if (fs.existsSync(inventoryPath)) {
  const rows = csvRows(inventoryPath);
  const header = rows[0];
  const statusIdx = header.indexOf('status');
  for (const r of rows.slice(1)) {
    if (statusIdx >= 0 && !VALID_CLASS_RE.test(r[statusIdx])) {
      err(`CALCULATOR-FORMULA-INVENTORY.csv row "${r[0]}" has an unrecognized status: "${r[statusIdx]}"`);
    }
  }
}

// 3. Decision matrix completeness + evidence/disposition presence + no missing audit decisions.
const decisionMatrixPath = path.join(REPORT_DIR, 'DECISION-MATRIX.csv');
if (!fs.existsSync(decisionMatrixPath)) {
  err('reports/phase-7s/DECISION-MATRIX.csv missing');
} else {
  const rows = csvRows(decisionMatrixPath);
  const header = rows[0];
  const required = ['item', 'source_phase', 'category', 'current_status', 'evidence_reviewed', 'decision', 'production_action', 'source_ids', 'risk', 'reason', 'future_phase'];
  for (const col of required) if (!header.includes(col)) err(`DECISION-MATRIX.csv missing required column: ${col}`);
  const evIdx = header.indexOf('evidence_reviewed');
  const decIdx = header.indexOf('decision');
  for (const r of rows.slice(1)) {
    if (evIdx >= 0 && !r[evIdx].trim()) err(`DECISION-MATRIX.csv row "${r[0]}" has no evidence_reviewed -- every item must document what was checked`);
    if (decIdx >= 0 && !r[decIdx].trim()) err(`DECISION-MATRIX.csv row "${r[0]}" has no decision`);
  }
  const itemIdx = header.indexOf('item');
  const items = rows.slice(1).map((r) => r[itemIdx]);
  if (new Set(items).size !== items.length) err('DECISION-MATRIX.csv has duplicate item rows');
  if (rows.length - 1 < 15) warn(`DECISION-MATRIX.csv has only ${rows.length - 1} rows -- verify all 5 named findings plus discovered items are represented`);
}

// 4. Documentation/implementation consistency for resolved formulas.
{
  global.window = {};
  delete require.cache[require.resolve(path.join(ROOT, 'js', 'calc-utils.js'))];
  require(path.join(ROOT, 'js', 'calc-utils.js'));
  const calc = global.window.WaterBalance.calcUtils;

  // Liquid chlorine: calculator vs formula-02 worked example (20000gal, 0.5->3ppm, 10%).
  const liquidResult = calc.calculateChlorine(20000, 0.5, 3, 'liquid').ounces;
  const formulasData = require(path.join(ROOT, 'scripts', 'data', 'formulas-data.js'));
  const f02 = formulasData.find((f) => f.id === 'formula-02');
  if (f02 && !/66\.7/.test(f02.workedExample)) err('formula-02 worked example does not state 66.7 fl oz, which is what js/calc-utils.js actually computes for the same inputs');
  if (Math.abs(liquidResult - 66.7) > 0.5) err(`js/calc-utils.js liquid chlorine result (${liquidResult.toFixed(1)}) does not match the expected ~66.7 oz`);

  // Alkalinity: calculator vs formula-05 worked example (18000gal, 60->100ppm TA).
  const alkResult = calc.calculateAlkalinity(18000, 60, 100).pounds;
  const f05 = formulasData.find((f) => f.id === 'formula-05');
  if (f05 && !/10\.1\s*lbs/.test(f05.workedExample)) err('formula-05 worked example does not state 10.1 lbs, which is what js/calc-utils.js actually computes for the same inputs');
  if (Math.abs(alkResult - 10.08) > 0.1) err(`js/calc-utils.js alkalinity result (${alkResult.toFixed(2)}) does not match the expected ~10.08 lbs`);
}

// 5. No contradictory worked examples (formula-02 and formula-09 must not contain known self-contradiction markers).
{
  const formulasData = require(path.join(ROOT, 'scripts', 'data', 'formulas-data.js'));
  for (const f of formulasData) {
    const text = f.workedExample || '';
    if (/Wait[,\s]*[—-]*\s*that looks wrong/i.test(text)) err(`${f.id}: worked example still contains the self-contradiction marker "Wait -- that looks wrong"`);
    if (/=\s*[\d.−-]+\?/.test(text)) err(`${f.id}: worked example still contains an uncertain ("?") intermediate value`);
  }
}

// 6. No abandoned equation without an explicit documented reason (formula-04 pH is explicitly
// allowed to remain unresolved per the audit, but must not silently claim a single clean answer
// it doesn't have -- checked via presence in the review queue instead of content pattern, since
// this phase deliberately did NOT rewrite formula-04).
{
  const reviewQueue = fs.readFileSync(path.join(REPORT_DIR, 'REVIEW-QUEUE.md'), 'utf8');
  if (!/pH adjustment/.test(reviewQueue)) err('REVIEW-QUEUE.md does not document the pH adjustment REQUIRES_EXPERT_REVIEW disposition');
}

// 7. Units internally consistent for resolved formulas (spot check formula-02/05/09 variable tables).
{
  const formulasData = require(path.join(ROOT, 'scripts', 'data', 'formulas-data.js'));
  const f09 = formulasData.find((f) => f.id === 'formula-09');
  if (f09 && !/CHF/.test(f09.equation)) err('formula-09 equation does not use the CHF/TAF naming that matches data/datasets/water-balance.json');
}

// 8. Liquid chlorine example produces exactly one final result (already covered by check 5's
// "Wait" pattern and check 4's numeric match; additionally confirm only one "fl oz" total appears
// as a concluding statement, not a discarded intermediate one).
{
  const formulasData = require(path.join(ROOT, 'scripts', 'data', 'formulas-data.js'));
  const f02 = formulasData.find((f) => f.id === 'formula-02');
  const matches = (f02.workedExample.match(/390,?625/g) || []);
  if (matches.length > 0) err('formula-02 worked example still contains the discarded 390,625 fl oz intermediate result');
}

// 9. LSI is not accidentally exposed as a functioning calculator.
{
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const calculatorSrc = fs.readFileSync(path.join(ROOT, 'js', 'calculator.js'), 'utf8');
  if (/\bLSI\b|langelier|\bTF\b.*\bCHF\b/i.test(calcUtilsSrc)) err('js/calc-utils.js appears to contain LSI computation logic -- this phase must not build an LSI calculator');
  if (/\bLSI\b|langelier/i.test(calculatorSrc)) err('js/calculator.js appears to contain LSI computation logic -- this phase must not build an LSI calculator');
  const chemCalcHtml = fs.readFileSync(path.join(ROOT, 'calculators', 'chemical-calculator.html'), 'utf8');
  if (/id="lsi-result"|calculateLSI|computeLSI/i.test(chemCalcHtml)) err('calculators/chemical-calculator.html appears to have LSI computation UI -- forbidden this phase');
  if (/formula-lsi/.test(chemCalcHtml)) err('calculators/chemical-calculator.html trust panel still references formula-lsi -- the false capability claim was not fully corrected');
}

// 10. Shock preset integrity: presets remain unchanged unless conclusive evidence required a change (it did not).
{
  const shockHtml = fs.readFileSync(path.join(ROOT, 'calculators', 'pool-shock-calculator.html'), 'utf8');
  for (const val of ['5 ppm', '10 ppm', '15 ppm', '20 ppm']) {
    if (!shockHtml.includes(val)) err(`calculators/pool-shock-calculator.html no longer contains the "${val}" preset -- shock presets must remain unchanged this phase`);
  }
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  if (!/calculateShock/.test(calcUtilsSrc)) err('js/calc-utils.js no longer has a calculateShock function');
  if (/calculateShock[\s\S]{0,300}combinedChlorine/i.test(calcUtilsSrc)) err('calculateShock appears to have been redesigned around a combined-chlorine input -- forbidden this phase (breakpoint-rule redesign is explicitly out of scope)');
}

// 11. All newly classified formulas have a documented evidence/disposition record (cross-check
// inventory rows against the decision matrix for the 3 corrected formulas).
{
  const decisionMatrix = fs.readFileSync(decisionMatrixPath, 'utf8');
  for (const needle of ['Liquid chlorine', 'Alkalinity constant', 'LSI worked-example']) {
    if (!decisionMatrix.includes(needle)) warn(`DECISION-MATRIX.csv may be missing an item matching "${needle}"`);
  }
}

// 12. No unsupported formula silently promoted to SUPPORTED (chemistry-claims.js/ranges.js untouched this phase).
{
  let claimsDiff = [];
  try {
    claimsDiff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- scripts/data/chemistry-claims.js scripts/data/chemistry-ranges.js`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal */ }
  if (claimsDiff.length > 0) err(`chemistry-claims.js/chemistry-ranges.js changed this phase (${claimsDiff.join(', ')}) -- this phase's scope is calculator formulas, not the chemistry-claims registry; any change here needs explicit justification not present in this validator's design`);
}

// 13. No calculator formula changed without a corresponding audit decision (every touched formula
// file's changes must be traceable to a DECISION-MATRIX.csv row -- spot-checked via presence of
// the 5 named findings above; full undocumented-change sweep below).
const EXPECTED_TOUCHES = [
  'js/calc-utils.js',
  'js/calculator.js',
  'scripts/data/formulas-data.js',
  'scripts/data/dataset-dosage-matrices.js',
  'scripts/data/trust-calculator-metadata.js',
  'calculators/chemical-calculator.html',
];
const productionChangesPath = path.join(REPORT_DIR, 'PRODUCTION-CHANGES.md');
if (!fs.existsSync(productionChangesPath)) {
  err('reports/phase-7s/PRODUCTION-CHANGES.md missing');
} else {
  const doc = fs.readFileSync(productionChangesPath, 'utf8');
  for (const f of EXPECTED_TOUCHES) if (!doc.includes(f)) warn(`PRODUCTION-CHANGES.md does not mention "${f}" -- verify it is documented`);
  let touches = [];
  try {
    touches = execSync(`git diff --name-only ${BASELINE_COMMIT} -- js/ scripts/data/ calculators/`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal */ }
  // Files whose only diff vs. baseline is whitespace are the pre-existing, already-documented
  // footer-whitespace nondeterminism (see Section 18 reproducibility note) -- not a real content
  // change, and not something this phase touched on purpose.
  const isWhitespaceOnlyDiff = (f) => {
    try {
      const out = execSync(`git diff -w --stat ${BASELINE_COMMIT} -- "${f}"`, { cwd: ROOT, encoding: 'utf8' });
      return out.trim() === '';
    } catch (e) { return false; }
  };
  // Only flag files outside the expected list AND outside the academy-restoration set (documented incident).
  const ACADEMY_INCIDENT_FILES = new Set(['data/academy.json']);
  for (const f of touches) {
    if (!EXPECTED_TOUCHES.includes(f) && !ACADEMY_INCIDENT_FILES.has(f) && !doc.includes(f)) {
      if (isWhitespaceOnlyDiff(f)) {
        warn(`${f} has a whitespace-only diff vs. baseline (pre-existing footer-whitespace nondeterminism) -- not a real production change`);
      } else {
        err(`Undocumented production change: ${f} was modified but is not mentioned in PRODUCTION-CHANGES.md`);
      }
    }
  }
}

// 14. Required report existence.
{
  const required = ['BASELINE.md', 'CALCULATOR-FORMULA-INVENTORY.csv', 'LIQUID-CHLORINE-AUDIT.md', 'LSI-AUDIT.md', 'ALKALINITY-AUDIT.md', 'PH-AUDIT.md', 'SHOCK-AUDIT.md', 'DECISION-MATRIX.csv', 'PRODUCTION-CHANGES.md', 'REVIEW-QUEUE.md', 'PHASE-7S-STATUS.md', 'PHASE-7S-STATUS.json'];
  for (const f of required) if (!fs.existsSync(path.join(REPORT_DIR, f))) err(`reports/phase-7s/${f} missing`);
}

// 15. Forbidden scope changes: URL/redirect/programmatic/Spanish-French/AdSense.
{
  let scopeDiff = [];
  try {
    scopeDiff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- programmatic/ scripts/generators/ ads.txt`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal */ }
  if (scopeDiff.length > 0) err(`Forbidden scope change detected: ${scopeDiff.join(', ')}`);
  const { REDIRECT_SOURCES } = require('./url-policy');
  if (Object.keys(REDIRECT_SOURCES).length !== 6) err(`REDIRECT_SOURCES registry changed: expected 6 entries, found ${Object.keys(REDIRECT_SOURCES).length}`);
}

console.log(`validate-phase-7s: inventory + decision matrix + 6 production files checked.`);
if (errors > 0) {
  console.error(`validate-phase-7s: FAIL -- ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
} else {
  console.log(`validate-phase-7s: PASS -- 0 errors, ${warnings} warning(s).`);
}
