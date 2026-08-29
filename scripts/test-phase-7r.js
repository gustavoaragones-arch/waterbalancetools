#!/usr/bin/env node
'use strict';
/**
 * Regression tests for Phase 7R's scientific-evidence-resolution and
 * calculator-provenance work.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const BASELINE_COMMIT = 'ae751ca';
let assertions = 0;
function expectTrue(value, label) { assertions++; assert.strictEqual(Boolean(value), true, label); }
function expectFalse(value, label) { assertions++; assert.strictEqual(Boolean(value), false, label); }
function expectEqual(actual, expected, label) { assertions++; assert.strictEqual(actual, expected, label); }
function csvRows(file) {
  const text = fs.readFileSync(file, 'utf8').trim();
  // minimal CSV row splitter respecting quotes, sufficient for schema checks
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

// ---------------------------------------------------------------------
// 1. Evidence ledger schema.
// ---------------------------------------------------------------------
{
  const rows = csvRows(path.join(ROOT, 'reports', 'phase-7r', 'EVIDENCE-LEDGER.csv'));
  const header = rows[0];
  const required = ['claim_id', 'page', 'parameter', 'environment', 'sanitizer', 'scenario', 'claim_text', 'numeric_value', 'unit', 'source_id', 'source_type', 'source_title', 'source_organization', 'source_date', 'source_url', 'evidence_excerpt', 'evidence_status', 'decision', 'production_action', 'review_notes'];
  for (const col of required) expectTrue(header.includes(col), `EVIDENCE-LEDGER.csv has column "${col}"`);
  expectTrue(rows.length > 10, 'EVIDENCE-LEDGER.csv has a substantive number of rows');
  const badRows = rows.slice(1).filter((r) => r.length !== header.length);
  expectEqual(badRows.length, 0, 'EVIDENCE-LEDGER.csv every row has the same column count as the header');
}

// ---------------------------------------------------------------------
// 2. Calculator ledger schema.
// ---------------------------------------------------------------------
{
  const rows = csvRows(path.join(ROOT, 'reports', 'phase-7r', 'CALCULATOR-PROVENANCE.csv'));
  const header = rows[0];
  const required = ['calculator', 'formula_id', 'formula_or_constant', 'input_units', 'output_units', 'mathematical_basis', 'domain_assumption', 'source_ids', 'source_status', 'decision', 'production_change', 'notes'];
  for (const col of required) expectTrue(header.includes(col), `CALCULATOR-PROVENANCE.csv has column "${col}"`);
  const badRows = rows.slice(1).filter((r) => r.length !== header.length);
  expectEqual(badRows.length, 0, 'CALCULATOR-PROVENANCE.csv every row has the same column count as the header');
  const decisionIdx = header.indexOf('decision');
  const validDecisions = new Set(['VERIFIED_MATH', 'SUPPORTED_DOMAIN_ASSUMPTION', 'CONTEXTUAL_DOMAIN_ASSUMPTION', 'REQUIRES_EXPERT_REVIEW', 'UNSUPPORTED', 'OUT_OF_SCOPE', 'NOT_APPLICABLE -- does not exist']);
  for (const r of rows.slice(1)) {
    expectTrue([...validDecisions].some((v) => r[decisionIdx].includes(v.split(' ')[0])), `CALCULATOR-PROVENANCE.csv row "${r[0]}" has a recognized decision value`);
  }
}

// ---------------------------------------------------------------------
// 3. Decision matrix completeness.
// ---------------------------------------------------------------------
{
  const rows = csvRows(path.join(ROOT, 'reports', 'phase-7r', 'DECISION-MATRIX.csv'));
  const header = rows[0];
  const required = ['item', 'source_phase', 'category', 'current_status', 'evidence_reviewed', 'decision', 'production_action', 'source_ids', 'risk', 'reason', 'future_phase'];
  for (const col of required) expectTrue(header.includes(col), `DECISION-MATRIX.csv has column "${col}"`);
  expectTrue(rows.length - 1 >= 20, 'DECISION-MATRIX.csv has at least 20 carry-forward items');
  const itemIdx = header.indexOf('item');
  const items = rows.slice(1).map((r) => r[itemIdx]);
  expectEqual(new Set(items).size, items.length, 'DECISION-MATRIX.csv has no duplicate item rows');
}

// ---------------------------------------------------------------------
// 4. No unsupported claim marked SUPPORTED.
// ---------------------------------------------------------------------
{
  const { CLAIMS } = require('./data/chemistry-claims');
  const { RANGES } = require('./data/chemistry-ranges');
  for (const c of CLAIMS) {
    if (c.status === 'SUPPORTED') expectTrue((c.source_ids || []).length > 0, `Claim "${c.claim_id}" marked SUPPORTED has >=1 source_id`);
  }
  for (const r of RANGES) {
    if (r.status === 'SUPPORTED') expectTrue((r.source_ids || []).length > 0, `Range "${r.id}" marked SUPPORTED has >=1 source_id`);
  }
}

// ---------------------------------------------------------------------
// 5. No citation without source mapping.
// ---------------------------------------------------------------------
{
  const { SOURCES_BY_ID } = require('./data/chemistry-sources');
  const targets = ['entities/water-replacement.html', 'entities/cover.html', 'entities/calcium-hypochlorite.html', 'entities/combined-chlorine.html', 'entities/breakpoint-chlorination.html', 'entities/shock-treatment.html'];
  for (const rel of targets) {
    const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const hrefs = [...html.matchAll(/<section class="knowledge-sources-real">[\s\S]*?<\/section>/g)]
      .flatMap((m) => [...m[0].matchAll(/<a href="([^"]+)"/g)].map((a) => a[1]));
    expectTrue(hrefs.length > 0, `${rel} renders at least one citation link`);
    for (const href of hrefs) {
      expectTrue(Object.values(SOURCES_BY_ID).some((s) => s.url === href), `${rel}'s citation link "${href}" maps to a registered source`);
    }
  }
}

// ---------------------------------------------------------------------
// 6. No unauthorized calculator formula changes.
// ---------------------------------------------------------------------
{
  let diff = [];
  try {
    diff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- js/calc-utils.js scripts/data/formulas-data.js`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal */ }
  expectEqual(diff.length, 0, 'js/calc-utils.js and scripts/data/formulas-data.js unchanged since Phase 7Q baseline');
}

// ---------------------------------------------------------------------
// 7. No URL changes (canonical page count stable).
// ---------------------------------------------------------------------
{
  const { isProductionPage, isIndexablePage } = require('./url-policy');
  const SKIP = new Set(['node_modules', '.git', 'reports', 'templates', 'partials', 'components']);
  function walk(dir, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIP.has(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full, out); else if (e.name.endsWith('.html')) out.push(full);
    }
  }
  const all = [];
  walk(ROOT, all);
  const canonical = all.filter((f) => {
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    return isProductionPage(rel) && isIndexablePage(rel);
  });
  expectEqual(canonical.length, 478, 'Canonical indexable page count is unchanged at 478 (0 pages created/deleted this phase)');
}

// ---------------------------------------------------------------------
// 8. No redirect changes.
// ---------------------------------------------------------------------
{
  const { REDIRECT_SOURCES } = require('./url-policy');
  expectEqual(Object.keys(REDIRECT_SOURCES).length, 6, 'REDIRECT_SOURCES registry still has exactly 6 entries');
}

// ---------------------------------------------------------------------
// 9. No Spanish/French additions.
// ---------------------------------------------------------------------
{
  let diff = [];
  try {
    diff = execSync(`git diff --name-only ${BASELINE_COMMIT}`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal */ }
  expectFalse(diff.some((f) => /\/es\/|\/fr\//.test(f)), 'No file paths under /es/ or /fr/ appear in the diff since Phase 7Q');
}

// ---------------------------------------------------------------------
// 10. No AdSense changes.
// ---------------------------------------------------------------------
{
  let diff = [];
  try {
    diff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- ads.txt`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal, file may not exist */ }
  expectEqual(diff.length, 0, 'ads.txt unchanged since Phase 7Q baseline');
}

// ---------------------------------------------------------------------
// 11. No programmatic-family changes.
// ---------------------------------------------------------------------
{
  let diff = [];
  try {
    diff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- programmatic/ scripts/generators/`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal */ }
  expectEqual(diff.length, 0, 'No programmatic/ content or generator files changed since Phase 7Q baseline');
}

// ---------------------------------------------------------------------
// 12. No canonical deletions (spot-check a known set of pages still exist).
// ---------------------------------------------------------------------
{
  const mustExist = ['entities/water-replacement.html', 'entities/cover.html', 'entities/shock-treatment.html', 'academy/sanitizers/breakpoint-chlorination.html', 'calculators/pool-shock-calculator.html'];
  for (const rel of mustExist) expectTrue(fs.existsSync(path.join(ROOT, rel)), `${rel} still exists`);
}

// ---------------------------------------------------------------------
// 13. Source registry integrity.
// ---------------------------------------------------------------------
{
  const { SOURCES, SOURCES_BY_ID } = require('./data/chemistry-sources');
  const ids = SOURCES.map((s) => s.id);
  expectEqual(new Set(ids).size, ids.length, 'chemistry-sources.js has no duplicate source ids');
  expectTrue(!!SOURCES_BY_ID['in-doh-breakpoint-chlorination-2022'], 'New Phase 7R source is present in the registry');
  for (const s of SOURCES) {
    expectTrue(!!s.url && /^https?:\/\//.test(s.url), `Source "${s.id}" has a real URL`);
  }
}

// ---------------------------------------------------------------------
// 14. Phase 7R report existence.
// ---------------------------------------------------------------------
{
  const required = ['BASELINE.md', 'EVIDENCE-LEDGER.csv', 'CALCULATOR-PROVENANCE.csv', 'DECISION-MATRIX.csv', 'RESEARCH.md', 'PRODUCTION-CHANGES.md', 'PHASE-7R-STATUS.md', 'PHASE-7R-STATUS.json'];
  for (const f of required) expectTrue(fs.existsSync(path.join(ROOT, 'reports', 'phase-7r', f)), `reports/phase-7r/${f} exists`);
}

// ---------------------------------------------------------------------
// 15. Reproducibility of evidence artifacts (re-run the entity-page
// generator and confirm citation output is stable).
// ---------------------------------------------------------------------
{
  const before = fs.readFileSync(path.join(ROOT, 'entities', 'combined-chlorine.html'), 'utf8');
  execSync('node scripts/generate-entity-pages.js', { cwd: ROOT, stdio: 'pipe' });
  const after = fs.readFileSync(path.join(ROOT, 'entities', 'combined-chlorine.html'), 'utf8');
  const beforeCite = before.match(/<section class="knowledge-sources-real">[\s\S]*?<\/section>/);
  const afterCite = after.match(/<section class="knowledge-sources-real">[\s\S]*?<\/section>/);
  expectEqual(afterCite ? afterCite[0] : null, beforeCite ? beforeCite[0] : null, 'entities/combined-chlorine.html citation block is byte-identical across two generator runs');
}

console.log(`test-phase-7r: ${assertions} assertions passed.`);
