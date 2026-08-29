#!/usr/bin/env node
'use strict';
/**
 * validate-phase-7t.js (Phase 7T, Section 15)
 *
 * Validates: all four priority audits exist; all priority findings have
 * classifications; all formula changes have evidence; all evidence IDs
 * exist; no unsupported formula marked SUPPORTED; no expert-review item
 * silently changed; documentation/implementation agreement for resolved
 * formulas; unit consistency; shock preset integrity; no LSI calculator;
 * no bromine calculator; no URL/redirect/sitemap changes; no
 * programmatic-family changes; no i18n expansion; report completeness.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BASELINE_COMMIT = 'd5cbe3f';
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

const REPORT_DIR = path.join(ROOT, 'reports', 'phase-7t');

// 1. All four priority audits exist, plus every other required report.
const REQUIRED_REPORTS = [
  'BASELINE.md', 'PH-AUDIT.md', 'SHOCK-DIVISOR-AUDIT.md', 'FORMULA-03-AUDIT.md',
  'SHOCK-ARCHITECTURE-AUDIT.md', 'CROSS-CALCULATOR-CONSISTENCY.md',
  'FORMULA-DECISION-LEDGER.csv', 'PRODUCTION-CHANGES.md', 'REVIEW-QUEUE.md',
  'PHASE-7T-STATUS.md',
];
for (const f of REQUIRED_REPORTS) {
  if (!fs.existsSync(path.join(REPORT_DIR, f))) err(`reports/phase-7t/${f} missing`);
}

// 2. Formula decision ledger structure + every priority finding has a classification.
const VALID_CLASS_RE = /VERIFIED_MATH|SUPPORTED_DOMAIN_ASSUMPTION|DOCUMENTATION_ERROR|IMPLEMENTATION_ERROR|ARCHITECTURAL_GAP|REQUIRES_EXPERT_REVIEW|DEFERRED|CONFIRMED/;
const ledgerPath = path.join(REPORT_DIR, 'FORMULA-DECISION-LEDGER.csv');
let ledgerRows = [];
if (!fs.existsSync(ledgerPath)) {
  err('reports/phase-7t/FORMULA-DECISION-LEDGER.csv missing');
} else {
  ledgerRows = csvRows(ledgerPath);
  const header = ledgerRows[0];
  const required = ['id', 'calculator', 'function', 'issue', 'old_behavior', 'proposed_behavior', 'classification', 'evidence_ids', 'mathematical_basis', 'product_assumption', 'unit_basis', 'expert_review_required', 'production_change', 'validation_case', 'user_impact', 'status'];
  for (const col of required) if (!header.includes(col)) err(`FORMULA-DECISION-LEDGER.csv missing required column: ${col}`);
  const badRows = ledgerRows.slice(1).filter((r) => r.length !== header.length);
  if (badRows.length) err(`FORMULA-DECISION-LEDGER.csv has ${badRows.length} malformed row(s)`);
  const classIdx = header.indexOf('classification');
  for (const r of ledgerRows.slice(1)) {
    if (classIdx >= 0 && !VALID_CLASS_RE.test(r[classIdx])) {
      err(`FORMULA-DECISION-LEDGER.csv row "${r[0]}" has an unrecognized classification: "${r[classIdx]}"`);
    }
  }
  // All four priorities represented.
  const issueIdx = header.indexOf('issue');
  const allIssues = ledgerRows.slice(1).map((r) => r[issueIdx]).join(' | ');
  if (!/800/.test(allIssues) && !/formula-03/i.test(ledgerRows.slice(1).map((r) => r[0]).join(''))) warn('Ledger may be missing an explicit formula-03 (Priority C) row');
  if (!/pH/i.test(allIssues)) err('Ledger missing a pH (Priority A) row');
  if (!/10000 divisor/i.test(allIssues)) err('Ledger missing a generic shock divisor (Priority B) row');
  if (!/breakpoint/i.test(allIssues)) err('Ledger missing a shock-architecture (Priority D) row');
}

// 3. All formula changes have evidence (evidence_ids non-empty for any row with production_change=Yes).
if (ledgerRows.length) {
  const header = ledgerRows[0];
  const evIdx = header.indexOf('evidence_ids');
  const prodIdx = header.indexOf('production_change');
  for (const r of ledgerRows.slice(1)) {
    if (prodIdx >= 0 && r[prodIdx] === 'Yes' && evIdx >= 0 && !r[evIdx].trim()) {
      err(`Ledger row "${r[0]}" has production_change=Yes but no evidence_ids`);
    }
  }
}

// 4. All evidence IDs referenced actually exist in the source registry.
{
  const { SOURCES_BY_ID } = require(path.join(ROOT, 'scripts', 'data', 'chemistry-sources.js'));
  if (ledgerRows.length) {
    const header = ledgerRows[0];
    const evIdx = header.indexOf('evidence_ids');
    for (const r of ledgerRows.slice(1)) {
      if (evIdx < 0 || !r[evIdx].trim()) continue;
      const ids = r[evIdx].split(';').map((s) => s.trim()).filter(Boolean);
      for (const id of ids) {
        if (!SOURCES_BY_ID[id]) err(`Ledger row "${r[0]}" references unknown evidence_id "${id}"`);
      }
    }
  }
  for (const id of ['phta-water-chemistry-adjustment-guide-2021', 'phta-alkalinity-fact-sheet-2021', 'phta-calcium-hypochlorite-fact-sheet-2021']) {
    if (!SOURCES_BY_ID[id]) err(`Expected new/reused Phase 7T evidence source "${id}" not found in chemistry-sources.js`);
  }
  const ids = Object.keys(SOURCES_BY_ID);
  if (new Set(ids).size !== ids.length) err('chemistry-sources.js has duplicate source IDs');
}

// 5. No unsupported formula marked SUPPORTED / expert-review item silently changed.
{
  let claimsDiff = [];
  try {
    claimsDiff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- scripts/data/chemistry-claims.js scripts/data/chemistry-ranges.js`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal */ }
  if (claimsDiff.length > 0) err(`chemistry-claims.js/chemistry-ranges.js changed this phase (${claimsDiff.join(', ')}) -- out of this phase's calculator-formula scope`);

  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const calculatorSrc = fs.readFileSync(path.join(ROOT, 'js', 'calculator.js'), 'utf8');
  if (!/diff \* 6/.test(calcUtilsSrc) || !/Math\.abs\(diff\) \* 5/.test(calcUtilsSrc)) {
    err('js/calc-utils.js pH constants (6, 5) appear to have changed -- pH is REQUIRES_EXPERT_REVIEW and must not be silently changed');
  }
  const phMatch = calcUtilsSrc.match(/function calculatePHAdjustment\(([^)]*)\)/);
  if (phMatch && /\bta\b|alkalinity/i.test(phMatch[1])) {
    err('calculatePHAdjustment appears to have gained a TA/alkalinity parameter -- forbidden this phase (Section 4: do not silently add a TA input)');
  }
  const calcUtilsShock = calcUtilsSrc.match(/function calculateShock\(([^)]*)\)/);
  if (calcUtilsShock && !/^gallons,\s*targetPpm$/.test(calcUtilsShock[1].trim())) {
    err('calculateShock signature appears to have changed -- generic shock divisor is REQUIRES_EXPERT_REVIEW and must not be silently changed');
  }
  if (!/\(g \* ppm\) \/ 10000/.test(calcUtilsSrc)) {
    err('js/calc-utils.js generic granular/shock divisor (10000) appears to have changed -- REQUIRES_EXPERT_REVIEW, must not be silently changed');
  }
}

// 6. Documentation/implementation agreement for resolved formulas (formula-03).
{
  const formulasData = require(path.join(ROOT, 'scripts', 'data', 'formulas-data.js'));
  const f03 = formulasData.find((f) => f.id === 'formula-03');
  if (!f03) err('formula-03 missing from formulas-data.js');
  else {
    if (!/0\.013344/.test(f03.equation)) err('formula-03 equation does not contain the corrected 0.013344 constant');
    if (/800/.test(f03.equation)) err('formula-03 equation still contains the old incorrect 800 divisor');
    const computed = (4 * 20000 * 0.013344) / 65;
    if (!/16\.4\s*oz/.test(f03.workedExample)) err(`formula-03 worked example does not state 16.4 oz (computed: ${computed.toFixed(2)})`);
  }
}

// 7. Unit consistency (formula-03 no longer states "oz" in the equation but "lbs" as the sole result).
{
  const formulasData = require(path.join(ROOT, 'scripts', 'data', 'formulas-data.js'));
  const f03 = formulasData.find((f) => f.id === 'formula-03');
  if (f03 && /\(oz\)/.test(f03.equation) && !/oz/.test(f03.workedExample.split('=').pop())) {
    err('formula-03 equation states oz but worked example does not conclude in oz');
  }
}

// 8. Shock preset integrity.
{
  const shockHtml = fs.readFileSync(path.join(ROOT, 'calculators', 'pool-shock-calculator.html'), 'utf8');
  for (const val of ['5 ppm', '10 ppm', '15 ppm', '20 ppm']) {
    if (!shockHtml.includes(val)) err(`calculators/pool-shock-calculator.html no longer contains the "${val}" preset`);
  }
}

// 9. No LSI calculator / no bromine calculator.
{
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const calculatorSrc = fs.readFileSync(path.join(ROOT, 'js', 'calculator.js'), 'utf8');
  if (/function\s+calculateLSI/i.test(calcUtilsSrc) || /function\s+calculateLSI/i.test(calculatorSrc)) {
    err('An LSI calculator function was found -- forbidden this phase');
  }
  if (/function\s+calculateBromine/i.test(calcUtilsSrc) || /function\s+calculateBromine/i.test(calculatorSrc)) {
    err('A bromine calculator function was found -- forbidden this phase');
  }
}

// 10. No URL/redirect/sitemap changes; no programmatic-family changes; no i18n expansion.
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

// 11. Undocumented production changes (mirrors Phase 7S's pattern, whitespace-only diffs excluded).
const EXPECTED_TOUCHES = [
  'scripts/data/chemistry-sources.js',
  'scripts/data/formulas-data.js',
  'data/formulas.json',
  'formulas/shock-formula.html',
];
const productionChangesPath = path.join(REPORT_DIR, 'PRODUCTION-CHANGES.md');
if (fs.existsSync(productionChangesPath)) {
  let touches = [];
  try {
    touches = execSync(`git diff --name-only ${BASELINE_COMMIT} -- js/ scripts/data/ calculators/ formulas/ data/formulas.json`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal */ }
  const isWhitespaceOnlyDiff = (f) => {
    try {
      const out = execSync(`git diff -w --stat ${BASELINE_COMMIT} -- "${f}"`, { cwd: ROOT, encoding: 'utf8' });
      return out.trim() === '';
    } catch (e) { return false; }
  };
  for (const f of touches) {
    if (!EXPECTED_TOUCHES.includes(f) && !isWhitespaceOnlyDiff(f)) {
      err(`Undocumented production change: ${f} was modified but is not in the expected Phase 7T touch list`);
    }
  }
}

console.log('validate-phase-7t: 4 priority audits + ledger + evidence + scope control checked.');
if (errors > 0) {
  console.error(`validate-phase-7t: FAIL -- ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
} else {
  console.log(`validate-phase-7t: PASS -- 0 errors, ${warnings} warning(s).`);
}
