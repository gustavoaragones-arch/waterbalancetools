#!/usr/bin/env node
'use strict';
/**
 * validate-provenance.js (Phase 7E.7)
 *
 * Validates reports/phase-7e/provenance-mapping.csv and
 * reports/phase-7e/high-risk-provenance.csv.
 */
const fs = require('fs');
const path = require('path');
const { parseCsv } = require('./phase-7d-1/reconcile-claims-v2');
const { SOURCES } = require('./data/chemistry-sources');
const { CLAIMS_BY_ID } = require('./data/chemistry-claims');

const ROOT = path.join(__dirname, '..');
const PROV_PATH = path.join(ROOT, 'reports', 'phase-7e', 'provenance-mapping.csv');
const HIGH_RISK_PATH = path.join(ROOT, 'reports', 'phase-7e', 'high-risk-provenance.csv');
const EVIDENCE_PATH = path.join(ROOT, 'reports', 'phase-7d-3', 'chemistry-evidence.csv');

const VALID_PROVENANCE_STATUSES = new Set(['UNREVIEWED', 'SUPPORTED', 'PARTIALLY_SUPPORTED', 'CONFLICTING', 'NOT_SUPPORTED', 'EXPERT_REVIEW_REQUIRED']);
const VALID_SUPPORT_TYPES = new Set(['', 'DIRECT', 'CONTEXTUAL', 'CORROBORATING', 'CONFLICTING', 'NOT_SUPPORTED']);
const VALID_CLASSIFICATIONS = new Set(['SOURCE_CAN_RESOLVE', 'SOURCE_PARTIALLY_RELEVANT', 'SOURCE_CONFLICT', 'SOURCE_NOT_FOUND', 'REQUIRES_EXPERT_REVIEW', 'NOT_A_TRUE_CHEMISTRY_CLAIM']);
const VALID_SOURCE_IDS = new Set(SOURCES.map((s) => s.id));
const NOT_EXTRACTED_STATUSES = new Set(['NO_NUMERIC_CONTENT', 'IMPOSSIBLE_MAPPING', 'NO_PARAMETER_IN_CLAUSE']);

function run() {
  const evidence = parseCsv(fs.readFileSync(EVIDENCE_PATH, 'utf8'));
  const evByClaim = new Map(evidence.map((r) => [r.claim_id, r]));
  const prov = parseCsv(fs.readFileSync(PROV_PATH, 'utf8'));

  const violations = [];
  const warnings = [];
  const seenClaimIds = new Set();
  const sourceIdUrlCheck = new Map();
  for (const s of SOURCES) {
    if (sourceIdUrlCheck.has(s.id)) violations.push({ rule: 'DUPLICATE_SOURCE_ID', detail: s.id });
    sourceIdUrlCheck.set(s.id, s.url);
    if (!/^https:\/\//.test(s.url)) violations.push({ rule: 'MALFORMED_SOURCE_URL', detail: `${s.id}: ${s.url}` });
  }

  for (const r of prov) {
    // duplicate provenance records
    if (seenClaimIds.has(r.claim_id)) violations.push({ rule: 'DUPLICATE_PROVENANCE_RECORD', detail: r.claim_id });
    seenClaimIds.add(r.claim_id);

    // nonexistent claim IDs
    const ev = evByClaim.get(r.claim_id);
    if (!ev) { violations.push({ rule: 'NONEXISTENT_CLAIM_ID', detail: r.claim_id }); continue; }

    // unsupported provenance statuses / classifications / support types
    if (!VALID_PROVENANCE_STATUSES.has(r.provenance_status)) violations.push({ rule: 'INVALID_PROVENANCE_STATUS', detail: `${r.claim_id}: ${r.provenance_status}` });
    if (!VALID_CLASSIFICATIONS.has(r.classification)) violations.push({ rule: 'INVALID_CLASSIFICATION', detail: `${r.claim_id}: ${r.classification}` });
    if (!VALID_SUPPORT_TYPES.has(r.support_type)) violations.push({ rule: 'INVALID_SUPPORT_TYPE', detail: `${r.claim_id}: ${r.support_type}` });

    // nonexistent source IDs
    const sourceIds = (r.source_registry_ids || '').split(';').map((s) => s.trim()).filter(Boolean);
    for (const sid of sourceIds) {
      if (!VALID_SOURCE_IDS.has(sid)) violations.push({ rule: 'NONEXISTENT_SOURCE_ID', detail: `${r.claim_id}: ${sid}` });
    }

    // provenance assigned to NOT_EXTRACTED claims
    if (NOT_EXTRACTED_STATUSES.has(ev.extraction_status)) {
      if (r.provenance_status !== 'UNREVIEWED' || sourceIds.length > 0) {
        violations.push({ rule: 'PROVENANCE_ON_NOT_EXTRACTED_CLAIM', detail: `${r.claim_id}: extraction_status=${ev.extraction_status} but provenance_status=${r.provenance_status}, sources=${sourceIds.join(',')}` });
      }
    }
    if (ev.extraction_status === 'NO_NUMERIC_CONTENT' && (r.provenance_status !== 'UNREVIEWED' || sourceIds.length > 0)) {
      violations.push({ rule: 'PROVENANCE_ON_NOT_EXTRACTED_CLAIM', detail: `${r.claim_id}: NO_NUMERIC_CONTENT claim has provenance_status=${r.provenance_status}` });
    }

    // source assignments to impossible extraction records
    if (ev.extraction_status === 'IMPOSSIBLE_MAPPING' && sourceIds.length > 0) {
      violations.push({ rule: 'SOURCE_ON_IMPOSSIBLE_MAPPING', detail: r.claim_id });
    }

    // empty source IDs in records marked SUPPORTED provenance
    if (r.provenance_status === 'SUPPORTED' && sourceIds.length === 0) {
      violations.push({ rule: 'SUPPORTED_WITHOUT_SOURCE', detail: r.claim_id });
    }

    // VERIFIED claims without explicit verification evidence -- this
    // dataset never uses VERIFIED at all; fail if it ever appears, since
    // no explicit human verification workflow exists yet.
    if (r.provenance_status === 'VERIFIED' || r.classification === 'VERIFIED') {
      violations.push({ rule: 'VERIFIED_WITHOUT_EVIDENCE', detail: r.claim_id });
    }

    // conflicting source mappings marked SUPPORTED
    if (r.classification === 'SOURCE_CONFLICT' && r.provenance_status === 'SUPPORTED') {
      violations.push({ rule: 'CONFLICTING_MARKED_SUPPORTED', detail: r.claim_id });
    }

    if (r.provenance_status === 'EXPERT_REVIEW_REQUIRED' || r.provenance_status === 'UNREVIEWED') warnings.push(`${r.claim_id}: ${r.provenance_status}`);
  }

  // chemistry-claims.js source_ids sanity (claim family layer)
  for (const claimId of Object.keys(CLAIMS_BY_ID)) {
    const c = CLAIMS_BY_ID[claimId];
    for (const sid of c.source_ids) {
      if (!VALID_SOURCE_IDS.has(sid)) violations.push({ rule: 'CLAIM_FAMILY_UNKNOWN_SOURCE', detail: `${claimId}: ${sid}` });
    }
  }

  // high-risk-provenance.csv structural check
  const highRisk = fs.existsSync(HIGH_RISK_PATH) ? parseCsv(fs.readFileSync(HIGH_RISK_PATH, 'utf8')) : [];
  const REQUIRED_HR_FIELDS = ['claim_id', 'claim_text', 'parameter', 'production_context', 'source_id', 'source_support', 'support_type', 'decision', 'notes'];
  if (highRisk.length > 0) {
    const missing = REQUIRED_HR_FIELDS.filter((f) => !(f in highRisk[0]));
    if (missing.length > 0) violations.push({ rule: 'HIGH_RISK_CSV_MISSING_FIELDS', detail: missing.join(',') });
  }

  const result = {
    status: violations.length === 0 ? 'PASS' : 'FAIL',
    provenance_records_checked: prov.length,
    high_risk_records_checked: highRisk.length,
    violations_found: violations.length,
    violations: violations.slice(0, 60),
    warnings_count: warnings.length,
  };

  const outDir = path.join(ROOT, 'reports', 'phase-7e');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'provenance-validation-results.json'), JSON.stringify(result, null, 2) + '\n');

  console.log(`validate-provenance: ${result.status} -- ${prov.length} provenance records, ${highRisk.length} high-risk records checked, ${violations.length} violation(s), ${warnings.length} warning(s) (unreviewed/expert-review-required claims -- not a failure).`);
  if (violations.length > 0) {
    for (const v of violations.slice(0, 15)) console.log(`  [${v.rule}] ${v.detail}`);
    process.exitCode = 1;
  }
  return result;
}

if (require.main === module) run();
module.exports = { run };
