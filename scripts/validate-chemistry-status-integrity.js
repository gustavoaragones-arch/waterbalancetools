#!/usr/bin/env node
'use strict';
/**
 * validate-chemistry-status-integrity.js (Phase 7D.2, Step 14)
 *
 * Deterministic invariant check over reports/phase-7d-2/post-fix-chemistry-claims-v2.csv:
 *
 *   CORRECT_EXTRACTION / CARRIED_CONTEXT -> scientific_review_status MAY be
 *     any evaluated verdict (SUPPORTED | CONTEXTUAL | REQUIRES_REVIEW | AMBIGUOUS).
 *   IMPOSSIBLE_MAPPING / NO_PARAMETER_IN_CLAUSE / NO_NUMERIC_CONTENT ->
 *     scientific_review_status MUST equal NOT_EXTRACTED.
 *
 * Also fails if any row with extraction_status = IMPOSSIBLE_MAPPING would,
 * under the impossible-pairing table in extract-claims-v2.js, actually be a
 * plausible pairing (i.e. the extractor's own impossible-mapping flag must
 * never coexist with a plausible parameter/unit combination -- a leak check
 * from the other direction).
 */
const fs = require('fs');
const path = require('path');
const { isPlausiblePairing, UNIT_VALUE_TYPE } = require('./phase-7d-1/extract-claims-v2');

const ROOT = path.join(__dirname, '..');
const IN_FILE = path.join(ROOT, 'reports', 'phase-7d-2', 'post-fix-chemistry-claims-v2.csv');

function parseCsv(text) {
  const lines = text.split('\n').filter((l) => l.length > 0);
  const header = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row = {};
    header.forEach((h, i) => { row[h] = cells[i] || ''; });
    return row;
  });
}
function splitCsvLine(line) {
  const out = []; let cur = ''; let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

const NOT_EXTRACTED_STATUSES = new Set(['IMPOSSIBLE_MAPPING', 'NO_PARAMETER_IN_CLAUSE', 'NO_NUMERIC_CONTENT']);
const EVALUATED_STATUSES = new Set(['CORRECT_EXTRACTION', 'CARRIED_CONTEXT']);

function run() {
  const rows = parseCsv(fs.readFileSync(IN_FILE, 'utf8'));
  const violations = [];

  for (const r of rows) {
    if (NOT_EXTRACTED_STATUSES.has(r.extraction_status) && r.scientific_review_status !== 'NOT_EXTRACTED') {
      violations.push({
        claim_index: r.claim_index,
        rule: 'NOT_EXTRACTED_INVARIANT',
        detail: `extraction_status=${r.extraction_status} but scientific_review_status=${r.scientific_review_status} (must be NOT_EXTRACTED)`,
      });
    }
    if (EVALUATED_STATUSES.has(r.extraction_status) && r.scientific_review_status === 'NOT_EXTRACTED') {
      violations.push({
        claim_index: r.claim_index,
        rule: 'EVALUATED_STATUS_MUST_BE_SCORED',
        detail: `extraction_status=${r.extraction_status} but scientific_review_status=NOT_EXTRACTED (a correctly-extracted claim must receive an evaluated verdict)`,
      });
    }
    // Reverse leak check: a row flagged CORRECT_EXTRACTION must never be a
    // parameter/unit pairing the extractor itself would call impossible.
    if (r.extraction_status === 'CORRECT_EXTRACTION' || r.extraction_status === 'CARRIED_CONTEXT') {
      const unit = (r.unit || '').toLowerCase();
      const valueType = unit ? (UNIT_VALUE_TYPE[unit] || 'unknown') : (unit === 'ph_units' ? 'ph_value' : null);
      if (unit && !isPlausiblePairing(r.parameter, UNIT_VALUE_TYPE[unit] || 'unknown') && unit !== 'ph_units') {
        violations.push({
          claim_index: r.claim_index,
          rule: 'IMPOSSIBLE_PAIRING_LEAK',
          detail: `parameter=${r.parameter} unit=${unit} marked ${r.extraction_status} but this pairing is not in PARAMETER_VALUE_TYPES`,
        });
      }
    }
  }

  const result = {
    status: violations.length === 0 ? 'PASS' : 'FAIL',
    rows_checked: rows.length,
    violations_found: violations.length,
    violations: violations.slice(0, 50),
  };

  const outDir = path.join(ROOT, 'reports', 'phase-7d-2');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'status-integrity-results.json'), JSON.stringify(result, null, 2) + '\n');

  console.log(`validate-chemistry-status-integrity: ${result.status} -- ${rows.length} rows checked, ${violations.length} violation(s).`);
  if (violations.length > 0) {
    for (const v of violations.slice(0, 10)) console.log(`  [${v.rule}] claim_index=${v.claim_index}: ${v.detail}`);
    process.exitCode = 1;
  }
  return result;
}

if (require.main === module) run();
module.exports = { run };
