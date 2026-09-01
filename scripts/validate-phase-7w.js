#!/usr/bin/env node
'use strict';
/**
 * validate-phase-7w.js (Phase 7W)
 *
 * Validates: required reports exist; approved product selector is live;
 * unsupported generic divisor removed from live code; approved
 * mass-balance constant reused; product-specific data traceable;
 * product-specific safety guidance surfaced; formula-03/trust panel
 * match implementation; no breakpoint calculator implied; no unsupported
 * product selectable; all live shock consumers consistent; no
 * LSI/bromine; no programmatic-family/URL/redirect/sitemap changes; no
 * i18n expansion; report completeness.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BASELINE_COMMIT = 'cd91013';
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

const REPORT_DIR = path.join(ROOT, 'reports', 'phase-7w');

// 1. Required reports exist.
const REQUIRED_REPORTS = ['BASELINE.md', 'SHOCK-IMPLEMENTATION.md', 'PRODUCTION-CHANGES.md', 'FORMULA-DECISION-LEDGER.csv', 'REVIEW-QUEUE.md', 'PHASE-7W-STATUS.md'];
for (const f of REQUIRED_REPORTS) {
  if (!fs.existsSync(path.join(REPORT_DIR, f))) err(`reports/phase-7w/${f} missing`);
}

// 2. Approved product selector is live; unsupported products excluded.
{
  const pool = fs.readFileSync(path.join(ROOT, 'calculators', 'pool-shock-calculator.html'), 'utf8');
  const hotTub = fs.readFileSync(path.join(ROOT, 'calculators', 'hot-tub-shock-calculator.html'), 'utf8');
  if (!/id="product"/.test(pool)) err('pool-shock-calculator.html missing #product selector');
  if (!/id="product"/.test(hotTub)) err('hot-tub-shock-calculator.html missing #product selector');
  if (/sodium-dichlor|trichlor-tablets/.test(hotTub)) err('hot-tub-shock-calculator.html offers a product not supported for hot tubs per dataset-dosage-matrices.js');
}

// 3. Unsupported generic divisor removed from live code.
{
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const calculatorSrc = fs.readFileSync(path.join(ROOT, 'js', 'calculator.js'), 'utf8');
  if (/function\s+calculateShock\s*\(/.test(calcUtilsSrc)) err('js/calc-utils.js still defines the old generic calculateShock');
  if (/function\s+granularShockOunces/.test(calculatorSrc)) err('js/calculator.js still defines the old generic granularShockOunces');
  if (!/calculateShockByProduct/.test(calcUtilsSrc)) err('js/calc-utils.js missing calculateShockByProduct');
  if (!/granularChlorineOuncesForProduct/.test(calculatorSrc)) err('js/calculator.js missing granularChlorineOuncesForProduct');
}

// 4. Approved mass-balance constant reused; product data traceable.
{
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  if (!/0\.013344/.test(calcUtilsSrc)) err('js/calc-utils.js shock calculation does not use the approved 0.013344 constant');
  const dataset = require(path.join(ROOT, 'scripts', 'data', 'dataset-dosage-matrices.js'));
  const datasetPercents = {};
  dataset.records.filter((r) => r.parameter === 'free-chlorine').forEach((r) => { datasetPercents[r.id] = r.activePercent; });
  global.window = {};
  delete require.cache[require.resolve(path.join(ROOT, 'js', 'calc-utils.js'))];
  require(path.join(ROOT, 'js', 'calc-utils.js'));
  const cu = global.window.WaterBalance.calcUtils;
  for (const id of Object.keys(cu.SHOCK_PRODUCTS || {})) {
    if (datasetPercents[id] === undefined) err(`SHOCK_PRODUCTS["${id}"] has no corresponding dataset-dosage-matrices.js record`);
    else if (cu.SHOCK_PRODUCTS[id].activePercent !== datasetPercents[id]) err(`SHOCK_PRODUCTS["${id}"].activePercent (${cu.SHOCK_PRODUCTS[id].activePercent}) does not match dataset (${datasetPercents[id]})`);
  }
}

// 5. Product-specific safety guidance surfaced; no invented warnings.
{
  global.window = {};
  delete require.cache[require.resolve(path.join(ROOT, 'js', 'calc-utils.js'))];
  require(path.join(ROOT, 'js', 'calc-utils.js'));
  const cu = global.window.WaterBalance.calcUtils;
  if (!cu.SHOCK_PRODUCTS['calcium-hypochlorite-65pct'].mixingWarning) err('calcium-hypochlorite-65pct missing its mixing warning');
  if (cu.SHOCK_PRODUCTS['liquid-chlorine-10pct'].mixingWarning) err('liquid-chlorine-10pct should not have an invented mixing warning');
  const pool = fs.readFileSync(path.join(ROOT, 'calculators', 'pool-shock-calculator.html'), 'utf8');
  if (!/mixingWarning/.test(pool)) err('pool-shock-calculator.html does not surface product.mixingWarning');
}

// 6. formula-03 documentation matches implementation.
{
  const formulasData = require(path.join(ROOT, 'scripts', 'data', 'formulas-data.js'));
  const f03 = formulasData.find((f) => f.id === 'formula-03');
  if (!f03 || !/0\.013344/.test(f03.equation) || /800/.test(f03.equation)) err('formula-03 equation inconsistent with the approved, resolved formula');
  if (!/directly implemented/i.test(f03.explanation || '')) err('formula-03 does not state it is now directly implemented');
}

// 7. Trust panel matches implementation; no breakpoint claim.
{
  const meta = require(path.join(ROOT, 'scripts', 'data', 'trust-calculator-metadata.js'));
  for (const id of ['pool-shock-calculator', 'hot-tub-shock-calculator']) {
    const rec = meta.find((m) => m.id === id);
    if (!rec) { err(`trust-calculator-metadata.js missing ${id}`); continue; }
    if ((rec.entityDependencies || []).includes('combined-chlorine')) err(`${id} still lists combined-chlorine, which this calculator does not read`);
  }
  const trustFormulas = require(path.join(ROOT, 'scripts', 'data', 'trust-formulas.js'));
  const shockFormula = trustFormulas.records.find((r) => r.id === 'formula-shock-dose');
  if (shockFormula && /combinedChlorine/.test(shockFormula.formula)) err('trust-formulas.js formula-shock-dose still describes a breakpoint/combinedChlorine formula not actually implemented');
  for (const f of ['calculators/pool-shock-calculator.html', 'calculators/hot-tub-shock-calculator.html']) {
    const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (/id="combined-chlorine"/.test(html)) err(`${f} appears to collect combined chlorine -- forbidden this phase (breakpoint dosing out of scope)`);
  }
}

// 8. No LSI/bromine calculator.
{
  const calcUtilsSrc = fs.readFileSync(path.join(ROOT, 'js', 'calc-utils.js'), 'utf8');
  const calculatorSrc = fs.readFileSync(path.join(ROOT, 'js', 'calculator.js'), 'utf8');
  if (/function\s+calculateLSI/i.test(calcUtilsSrc) || /function\s+calculateLSI/i.test(calculatorSrc)) err('An LSI calculator function was found -- forbidden');
  if (/function\s+calculateBromine/i.test(calcUtilsSrc) || /function\s+calculateBromine/i.test(calculatorSrc)) err('A bromine calculator function was found -- forbidden');
}

// 9. No programmatic-family/URL/redirect/sitemap/i18n changes.
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
  if (fs.existsSync(path.join(ROOT, 'es')) || fs.existsSync(path.join(ROOT, 'fr'))) err('An es/ or fr/ directory exists -- i18n expansion forbidden this phase');
}

// 10. All live shock consumers consistent (no lingering old-model consumer).
{
  let consumers = [];
  try {
    // Match actual calls (a dot or whitespace before the name, immediately
    // followed by "("), not the explanatory code comments that reference
    // the old function names by name for documentation purposes.
    consumers = execSync('grep -rlE "[.[:space:]](calculateShock|granularShockOunces)\\(" --include="*.html" .', { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* grep exits 1 if no matches -- expected */ }
  if (consumers.length > 0) err(`Found lingering consumer(s) of the removed generic shock functions: ${consumers.join(', ')}`);
}

// 11. No new unsupported chemistry evidence.
{
  let claimsDiff = [];
  try {
    claimsDiff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- scripts/data/chemistry-claims.js scripts/data/chemistry-ranges.js scripts/data/chemistry-sources.js`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal */ }
  if (claimsDiff.length > 0) err(`Chemistry evidence registry changed this phase (${claimsDiff.join(', ')}) -- Section 10 requires reuse only, no new research`);
}

// 12. Decision ledger / production-changes completeness.
const ledgerPath = path.join(REPORT_DIR, 'FORMULA-DECISION-LEDGER.csv');
if (fs.existsSync(ledgerPath)) {
  const rows = csvRows(ledgerPath);
  const header = rows[0];
  const required = ['id', 'item', 'old_architecture', 'new_architecture', 'files_changed', 'approved_formula_basis', 'product_data_dependency', 'evidence_dependency', 'scenario_limitations', 'safety_dependency', 'validation_status', 'unresolved_limitations'];
  for (const col of required) if (!header.includes(col)) err(`FORMULA-DECISION-LEDGER.csv missing required column: ${col}`);
  const badRows = rows.slice(1).filter((r) => r.length !== header.length);
  if (badRows.length) err(`FORMULA-DECISION-LEDGER.csv has ${badRows.length} malformed row(s)`);
}
const productionChangesPath = path.join(REPORT_DIR, 'PRODUCTION-CHANGES.md');
if (fs.existsSync(productionChangesPath)) {
  const doc = fs.readFileSync(productionChangesPath, 'utf8');
  const EXPECTED_TOUCHES = [
    'js/calc-utils.js', 'js/calculator.js',
    'calculators/pool-shock-calculator.html', 'calculators/hot-tub-shock-calculator.html', 'calculators/chemical-calculator.html',
    'scripts/data/formulas-data.js', 'scripts/data/trust-calculator-metadata.js', 'scripts/data/trust-formulas.js',
    'data/formulas.json', 'data/trust/datasets.json', 'data/trust/formulas.json', 'formulas/shock-formula.html',
  ];
  let touches = [];
  try {
    touches = execSync(`git diff --name-only ${BASELINE_COMMIT} -- js/ scripts/data/ calculators/ data/formulas.json data/trust/ formulas/`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
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

console.log('validate-phase-7w: selector + calculation + trust + scope control checked.');
if (errors > 0) {
  console.error(`validate-phase-7w: FAIL -- ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
} else {
  console.log(`validate-phase-7w: PASS -- 0 errors, ${warnings} warning(s).`);
}
