#!/usr/bin/env node
'use strict';
/**
 * validate-phase-7u.js (Phase 7U, Section 15)
 *
 * Validates: required reports exist; every architecture option is
 * dispositioned; every recommendation has evidence; all evidence IDs
 * resolve; unresolved formulas remain explicitly unresolved; no
 * unsupported formula is marked supported; no unauthorized input was
 * added; no LSI/bromine calculator exists; Phase 7T resolved formula-03
 * remains consistent; liquid-chlorine mass balance remains consistent; no
 * URL/redirect/sitemap changes; no programmatic-family changes; no i18n
 * expansion; report completeness.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BASELINE_COMMIT = '6cf09af';
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

const REPORT_DIR = path.join(ROOT, 'reports', 'phase-7u');

// 1. Required reports exist.
const REQUIRED_REPORTS = [
  'BASELINE.md', 'PH-ARCHITECTURE-DECISION.md', 'SHOCK-ARCHITECTURE-DECISION.md',
  'ARCHITECTURE-DECISION-MATRIX.csv', 'INPUT-CONTRACTS.md', 'FORMULA-GOVERNANCE.md',
  'PRODUCTION-CHANGES.md', 'REVIEW-QUEUE.md', 'PHASE-7U-STATUS.md',
];
for (const f of REQUIRED_REPORTS) {
  if (!fs.existsSync(path.join(REPORT_DIR, f))) err(`reports/phase-7u/${f} missing`);
}

// 2. Every architecture option is dispositioned; matrix structure valid.
const VALID_CLASS_RE = /IMPLEMENT WITH EXPLICIT ASSUMPTION|IMPLEMENT|NARROW EXISTING TOOL|ARCHITECTURAL_GAP|REQUIRES_EXPERT_REVIEW|DEFERRED|DO_NOT_BUILD|REJECTED|CONFIRMED/;
const matrixPath = path.join(REPORT_DIR, 'ARCHITECTURE-DECISION-MATRIX.csv');
let matrixRows = [];
if (!fs.existsSync(matrixPath)) {
  err('reports/phase-7u/ARCHITECTURE-DECISION-MATRIX.csv missing');
} else {
  matrixRows = csvRows(matrixPath);
  const header = matrixRows[0];
  const required = ['id', 'calculator', 'architecture_option', 'required_inputs', 'required_product_data', 'mathematical_basis', 'evidence_ids', 'safety_implications', 'user_complexity', 'validationability', 'implementation_scope', 'classification', 'director_recommendation', 'rationale'];
  for (const col of required) if (!header.includes(col)) err(`ARCHITECTURE-DECISION-MATRIX.csv missing required column: ${col}`);
  const badRows = matrixRows.slice(1).filter((r) => r.length !== header.length);
  if (badRows.length) err(`ARCHITECTURE-DECISION-MATRIX.csv has ${badRows.length} malformed row(s)`);
  const classIdx = header.indexOf('classification');
  const recIdx = header.indexOf('director_recommendation');
  for (const r of matrixRows.slice(1)) {
    if (classIdx >= 0 && !VALID_CLASS_RE.test(r[classIdx])) err(`ARCHITECTURE-DECISION-MATRIX.csv row "${r[0]}" has an unrecognized classification: "${r[classIdx]}"`);
    if (recIdx >= 0 && !r[recIdx].trim()) err(`ARCHITECTURE-DECISION-MATRIX.csv row "${r[0]}" has no director_recommendation`);
  }
  // All pH options (A-E) and shock options (A-F) present.
  const ids = matrixRows.slice(1).map((r) => r[0]);
  for (const suffix of ['PH-A', 'PH-B', 'PH-C', 'PH-D', 'PH-E']) {
    if (!ids.some((id) => id.endsWith(suffix))) err(`Missing pH architecture option row for ${suffix}`);
  }
  for (const suffix of ['SHOCK-A', 'SHOCK-B', 'SHOCK-C', 'SHOCK-D', 'SHOCK-E', 'SHOCK-F']) {
    if (!ids.some((id) => id.endsWith(suffix))) err(`Missing shock architecture option row for ${suffix}`);
  }
}

// 3. Every recommendation has evidence; evidence IDs resolve.
{
  const { SOURCES_BY_ID } = require(path.join(ROOT, 'scripts', 'data', 'chemistry-sources.js'));
  if (matrixRows.length) {
    const header = matrixRows[0];
    const evIdx = header.indexOf('evidence_ids');
    const classIdx = header.indexOf('classification');
    for (const r of matrixRows.slice(1)) {
      const cls = r[classIdx];
      if (evIdx < 0 || !r[evIdx].trim()) {
        if (!/REJECTED|DO_NOT_BUILD|NARROW EXISTING TOOL|CONFIRMED|DEFERRED/.test(cls)) {
          err(`ARCHITECTURE-DECISION-MATRIX.csv row "${r[0]}" (${cls}) has no evidence_ids`);
        }
        continue;
      }
      const ids = r[evIdx].split(';').map((s) => s.trim()).filter(Boolean);
      for (const id of ids) {
        if (!SOURCES_BY_ID[id]) err(`ARCHITECTURE-DECISION-MATRIX.csv row "${r[0]}" references unknown evidence_id "${id}"`);
      }
    }
  }
  for (const id of ['lamotte-acid-demand-index-2022', 'taylor-k1005-instruction-manual-2012']) {
    if (!SOURCES_BY_ID[id]) err(`Expected new Phase 7U evidence source "${id}" not found in chemistry-sources.js`);
  }
  const ids = Object.keys(SOURCES_BY_ID);
  if (new Set(ids).size !== ids.length) err('chemistry-sources.js has duplicate source IDs');
}

// 4. Unresolved formulas remain explicitly unresolved; no unsupported formula marked supported.
{
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  if (!/diff \* 6/.test(calcUtilsSrc) || !/Math\.abs\(diff\) \* 5/.test(calcUtilsSrc)) {
    err('pH constants (6, 5) appear to have changed -- REQUIRES_EXPERT_REVIEW, must not be silently changed');
  }
  if (!/\(g \* ppm\) \/ 10000/.test(calcUtilsSrc)) {
    err('generic shock divisor (10000) appears to have changed -- REQUIRES_EXPERT_REVIEW, must not be silently changed');
  }
  let claimsDiff = [];
  try {
    claimsDiff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- scripts/data/chemistry-claims.js scripts/data/chemistry-ranges.js`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal */ }
  if (claimsDiff.length > 0) err(`chemistry-claims.js/chemistry-ranges.js changed this phase (${claimsDiff.join(', ')}) -- out of this phase's architecture-decision scope`);
}

// 5. No unauthorized input was added (pH: TA/CYA; shock: CC/product selector).
{
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const phMatch = calcUtilsSrc.match(/function calculatePHAdjustment\(([^)]*)\)/);
  if (phMatch && /\bta\b|alkalinity|cya|cyanuric|temperature/i.test(phMatch[1])) {
    err('calculatePHAdjustment appears to have gained a new parameter -- forbidden this phase (architecture decision only, no implementation authorized)');
  }
  const shockMatch = calcUtilsSrc.match(/function calculateShock\(([^)]*)\)/);
  if (shockMatch && !/^gallons,\s*targetPpm$/.test(shockMatch[1].trim())) {
    err('calculateShock signature appears to have changed -- forbidden this phase (architecture decision only, no implementation authorized)');
  }
}

// 6. No LSI/bromine calculator.
{
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const calculatorSrc = fs.readFileSync(path.join(ROOT, 'js', 'calculator.js'), 'utf8');
  if (/function\s+calculateLSI/i.test(calcUtilsSrc) || /function\s+calculateLSI/i.test(calculatorSrc)) err('An LSI calculator function was found -- forbidden');
  if (/function\s+calculateBromine/i.test(calcUtilsSrc) || /function\s+calculateBromine/i.test(calculatorSrc)) err('A bromine calculator function was found -- forbidden');
}

// 7. Phase 7T resolved formula-03 and liquid-chlorine mass balance remain consistent.
{
  const formulasData = require(path.join(ROOT, 'scripts', 'data', 'formulas-data.js'));
  const f03 = formulasData.find((f) => f.id === 'formula-03');
  const f02 = formulasData.find((f) => f.id === 'formula-02');
  if (!f03 || !/0\.013344/.test(f03.equation) || /800/.test(f03.equation)) err('formula-03 (Phase 7T RESOLVED) appears to have regressed');
  if (!f02 || !/0\.013344/.test(f02.equation)) err('formula-02 (Phase 7S RESOLVED) appears to have regressed');
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  if (!/749\.4/.test(calcUtilsSrc)) err('Liquid chlorine mass-balance constant (749.4) appears to have regressed');
}

// 8. No URL/redirect/sitemap changes; no programmatic-family changes; no i18n expansion.
{
  let scopeDiff = [];
  try {
    scopeDiff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- programmatic/ es/ fr/ ads.txt sitemap.xml sitemap-index.xml`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal */ }
  if (scopeDiff.length > 0) err(`Forbidden scope change detected: ${scopeDiff.join(', ')}`);
  try {
    const { REDIRECT_SOURCES } = require('./url-policy');
    if (Object.keys(REDIRECT_SOURCES).length !== 6) err(`REDIRECT_SOURCES registry changed: expected 6 entries, found ${Object.keys(REDIRECT_SOURCES).length}`);
  } catch (e) { warn('Could not load scripts/url-policy.js to verify redirect registry'); }
  if (fs.existsSync(path.join(ROOT, 'es')) || fs.existsSync(path.join(ROOT, 'fr'))) {
    err('An es/ or fr/ directory exists -- i18n expansion is forbidden this phase');
  }
}

// 9. Report completeness / undocumented production changes.
const productionChangesPath = path.join(REPORT_DIR, 'PRODUCTION-CHANGES.md');
if (fs.existsSync(productionChangesPath)) {
  const doc = fs.readFileSync(productionChangesPath, 'utf8');
  let touches = [];
  try {
    touches = execSync(`git diff --name-only ${BASELINE_COMMIT} -- js/ scripts/data/ calculators/ data/datasets/dosage-matrices.json reference/datasets/`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal */ }
  const isWhitespaceOnlyDiff = (f) => {
    try {
      const out = execSync(`git diff -w --stat ${BASELINE_COMMIT} -- "${f}"`, { cwd: ROOT, encoding: 'utf8' });
      return out.trim() === '';
    } catch (e) { return false; }
  };
  const EXPECTED_TOUCHES = ['scripts/data/chemistry-sources.js', 'scripts/data/dataset-dosage-matrices.js', 'data/datasets/dosage-matrices.json', 'reference/datasets/dosage-matrices/index.html'];
  for (const f of touches) {
    if (!EXPECTED_TOUCHES.includes(f) && !doc.includes(f) && !isWhitespaceOnlyDiff(f)) {
      err(`Undocumented production change: ${f} was modified but is not mentioned in PRODUCTION-CHANGES.md`);
    }
  }
  // No calculator JS file should have changed at all this phase.
  let jsTouches = [];
  try {
    jsTouches = execSync(`git diff --name-only ${BASELINE_COMMIT} -- js/`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal */ }
  if (jsTouches.length > 0) err(`js/ calculator files changed this phase (${jsTouches.join(', ')}) -- forbidden, this is an architecture-decision phase only`);
}

console.log('validate-phase-7u: reports + decision matrix + evidence + scope control checked.');
if (errors > 0) {
  console.error(`validate-phase-7u: FAIL -- ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
} else {
  console.log(`validate-phase-7u: PASS -- 0 errors, ${warnings} warning(s).`);
}
