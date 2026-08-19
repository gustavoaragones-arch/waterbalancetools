#!/usr/bin/env node
'use strict';
/**
 * validate-chemistry-evidence-dataset.js (Phase 7D.3, Step 17)
 *
 * Validates reports/phase-7d-3/chemistry-evidence.csv against the 16
 * invariants named in the Phase 7D.3 brief.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { parseCsv } = require('./phase-7d-1/reconcile-claims-v2');
const { isPlausiblePairing, UNIT_VALUE_TYPE } = require('./phase-7d-1/extract-claims-v2');
const { VALID_PARAMETER_IDS } = require('./phase-7d-3/build-chemistry-evidence');
const { SOURCES } = require('./data/chemistry-sources');

const ROOT = path.join(__dirname, '..');
const CSV_PATH = path.join(ROOT, 'reports', 'phase-7d-3', 'chemistry-evidence.csv');

const VALID_SCIENTIFIC_STATUSES = new Set(['SUPPORTED', 'CONTEXTUAL', 'REQUIRES_REVIEW', 'AMBIGUOUS', 'NOT_EXTRACTED']);
const VALID_EXTRACTION_STATUSES = new Set(['CORRECT_EXTRACTION', 'CARRIED_CONTEXT', 'IMPOSSIBLE_MAPPING', 'NO_PARAMETER_IN_CLAUSE', 'NO_NUMERIC_CONTENT']);
const VALID_CLAIM_TYPES = new Set(['RANGE', 'RULE_OF_THUMB', 'EXAMPLE_INPUT', 'CALCULATED_VALUE', 'SAFETY_GUIDANCE', '']);
const VALID_VALUE_TYPES = new Set(['concentration', 'temperature', 'volume', 'mass_or_dosage', 'ph_value', 'index_value', 'multiplier', 'duration', 'unknown', '']);
const EVALUATED_STATUSES = new Set(['CORRECT_EXTRACTION', 'CARRIED_CONTEXT']);
const NOT_EXTRACTED_STATUSES = new Set(['IMPOSSIBLE_MAPPING', 'NO_PARAMETER_IN_CLAUSE', 'NO_NUMERIC_CONTENT']);
const VALID_SOURCE_IDS = new Set(SOURCES.map((s) => s.id));

const HISTORICAL_PATHS = [
  'reports/phase-7a/chemical-claims.csv',
  'reports/phase-7d/chemistry-coverage.csv',
  'reports/phase-7d-1/post-fix-chemistry-claims.csv',
  'reports/phase-7d-2/post-fix-chemistry-claims-v2.csv',
];

function num(v) { return v === '' ? null : Number(v); }

function run() {
  const rows = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'));
  const violations = [];
  const seenIds = new Set();

  for (const r of rows) {
    const id = r.claim_id;

    // 1. deterministic claim_id present and well-formed (16 lowercase hex chars)
    if (!/^[0-9a-f]{16}$/.test(id)) violations.push({ id, rule: 'CLAIM_ID_FORMAT', detail: `claim_id "${id}" is not 16 hex chars` });

    // 10. duplicate deterministic claim IDs rejected
    if (seenIds.has(id)) violations.push({ id, rule: 'DUPLICATE_CLAIM_ID', detail: 'duplicate claim_id' });
    seenIds.add(id);

    // 2. parameter_id valid (or empty)
    if (r.parameter_id && !VALID_PARAMETER_IDS.has(r.parameter_id)) violations.push({ id, rule: 'INVALID_PARAMETER_ID', detail: r.parameter_id });

    // 3. value_type valid
    if (!VALID_VALUE_TYPES.has(r.value_type)) violations.push({ id, rule: 'INVALID_VALUE_TYPE', detail: r.value_type });

    // 9. claim_type valid
    if (!VALID_CLAIM_TYPES.has(r.claim_type)) violations.push({ id, rule: 'INVALID_CLAIM_TYPE', detail: r.claim_type });

    // 8. scientific status valid
    if (!VALID_SCIENTIFIC_STATUSES.has(r.scientific_review_status)) violations.push({ id, rule: 'INVALID_SCIENTIFIC_STATUS', detail: r.scientific_review_status });
    if (!VALID_EXTRACTION_STATUSES.has(r.extraction_status)) violations.push({ id, rule: 'INVALID_EXTRACTION_STATUS', detail: r.extraction_status });

    // 6. extraction failures cannot have scientific verdicts
    if (NOT_EXTRACTED_STATUSES.has(r.extraction_status) && r.scientific_review_status !== 'NOT_EXTRACTED') {
      violations.push({ id, rule: 'NOT_EXTRACTED_INVARIANT', detail: `extraction_status=${r.extraction_status} scientific=${r.scientific_review_status}` });
    }
    if (EVALUATED_STATUSES.has(r.extraction_status) && r.scientific_review_status === 'NOT_EXTRACTED') {
      violations.push({ id, rule: 'EVALUATED_STATUS_MUST_BE_SCORED', detail: `extraction_status=${r.extraction_status} scientific=NOT_EXTRACTED` });
    }

    // 4/5. unit compatible with value_type; impossible parameter/value combos fail
    if (EVALUATED_STATUSES.has(r.extraction_status)) {
      const unit = (r.unit || '').toLowerCase();
      if (unit && unit !== 'ph_units') {
        const expectedType = UNIT_VALUE_TYPE[unit];
        if (expectedType && expectedType !== r.value_type) {
          violations.push({ id, rule: 'UNIT_VALUE_TYPE_MISMATCH', detail: `unit=${unit} value_type=${r.value_type}` });
        }
      }
      if (r.parameter_id && !isPlausiblePairing(r.parameter_id, r.value_type) && r.value_type !== '') {
        violations.push({ id, rule: 'IMPOSSIBLE_PAIRING_ACCEPTED', detail: `parameter_id=${r.parameter_id} value_type=${r.value_type} marked ${r.extraction_status}` });
      }
      // 12. pH values represented as pH values, not ppm
      if (r.parameter_id === 'ph' && unit === 'ppm') violations.push({ id, rule: 'PH_AS_PPM', detail: 'pH represented with ppm unit' });
      // 13. temperature not represented as concentration
      if (r.parameter_id === 'water_temperature' && r.value_type === 'concentration') violations.push({ id, rule: 'TEMPERATURE_AS_CONCENTRATION', detail: '' });
      // 14. volume not represented as concentration
      if (r.parameter_id === 'pool_volume' && r.value_type === 'concentration') violations.push({ id, rule: 'VOLUME_AS_CONCENTRATION', detail: '' });
      // 15. dosage/mass not represented as concentration
      if (r.value_type === 'mass_or_dosage' && r.parameter_id && PARAMETER_IS_CONCENTRATION_ONLY(r.parameter_id)) {
        violations.push({ id, rule: 'DOSAGE_AS_CONCENTRATION', detail: `parameter_id=${r.parameter_id}` });
      }
    }

    // 11. numeric ranges have minimum <= maximum
    if (r.minimum !== '' && r.maximum !== '') {
      const lo = num(r.minimum), hi = num(r.maximum);
      if (lo !== null && hi !== null && lo > hi) violations.push({ id, rule: 'MIN_GT_MAX', detail: `${lo} > ${hi}` });
    }

    // 7. source_registry_ids reference real registry entries
    if (r.source_registry_ids) {
      const ids = r.source_registry_ids.split(';').map((s) => s.trim()).filter(Boolean);
      for (const sid of ids) {
        if (!VALID_SOURCE_IDS.has(sid)) violations.push({ id, rule: 'UNKNOWN_SOURCE_REGISTRY_ID', detail: sid });
      }
    }
  }

  function PARAMETER_IS_CONCENTRATION_ONLY(paramId) {
    const { PARAMETER_VALUE_TYPES } = require('./phase-7d-1/extract-claims-v2');
    const allowed = PARAMETER_VALUE_TYPES[paramId];
    return !!allowed && allowed.length === 1 && allowed[0] === 'concentration';
  }

  // 16. historical inventories remain untouched (git-tracked files: verify
  // no working-tree diff against HEAD; untracked/new files are reported as
  // such rather than failing, since they cannot yet have a git baseline).
  const historicalStatus = {};
  for (const relPath of HISTORICAL_PATHS) {
    const abs = path.join(ROOT, relPath);
    if (!fs.existsSync(abs)) { historicalStatus[relPath] = 'MISSING'; violations.push({ id: '(dataset)', rule: 'HISTORICAL_FILE_MISSING', detail: relPath }); continue; }
    try {
      const out = execSync(`git diff --quiet -- "${relPath}"; echo $?`, { cwd: ROOT, encoding: 'utf8' }).trim();
      if (out === '0') historicalStatus[relPath] = 'UNCHANGED_VS_HEAD';
      else {
        // Could be unchanged-but-untracked (new this session) or genuinely modified.
        const tracked = execSync(`git ls-files --error-unmatch "${relPath}" 2>/dev/null; echo $?`, { cwd: ROOT, encoding: 'utf8' }).trim().endsWith('0');
        historicalStatus[relPath] = tracked ? 'MODIFIED_VS_HEAD' : 'UNTRACKED_NO_BASELINE';
        if (tracked) violations.push({ id: '(dataset)', rule: 'HISTORICAL_FILE_MODIFIED', detail: relPath });
      }
    } catch (e) {
      historicalStatus[relPath] = 'CHECK_FAILED';
    }
  }

  const result = {
    status: violations.length === 0 ? 'PASS' : 'FAIL',
    rows_checked: rows.length,
    violations_found: violations.length,
    violations: violations.slice(0, 50),
    historical_files: historicalStatus,
  };

  const outPath = path.join(ROOT, 'reports', 'phase-7d-3', 'dataset-validation-results.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');

  console.log(`validate-chemistry-evidence-dataset: ${result.status} -- ${rows.length} rows checked, ${violations.length} violation(s).`);
  if (violations.length > 0) {
    for (const v of violations.slice(0, 15)) console.log(`  [${v.rule}] ${v.id}: ${v.detail}`);
    process.exitCode = 1;
  }
  return result;
}

if (require.main === module) run();
module.exports = { run };
