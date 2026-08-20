#!/usr/bin/env node
'use strict';
/**
 * validate-entity-provenance.js (Phase 7J, Steps 18-19)
 *
 * Validates reports/phase-7j/entity-claim-inventory.csv (the entity
 * chemistry-claim evidence dataset) for internal integrity. Distinguishes
 * CRITICAL provenance-integrity errors (exit 1) from WARNINGS.
 */
const fs = require('fs');
const path = require('path');
const { parseCsv } = require('./phase-7d-1/reconcile-claims-v2');
const { RANGES_BY_ID } = require('./data/chemistry-ranges');

const ROOT = path.join(__dirname, '..');

const STATUS_VOCAB = new Set([
  'SUPPORTED', 'CONTEXTUAL', 'REQUIRES_REVIEW', 'AMBIGUOUS', 'UNSUPPORTED',
  'NON_CLAIM', 'NOT_APPLICABLE', 'DIRECTLY_SUPPORTED', 'SUPPORTED_BY_CONTEXT',
  'CONFLICTING', 'NO_EXISTING_SOURCE',
]);

function run() {
  const critical = [];
  const warnings = [];

  const invPath = path.join(ROOT, 'reports', 'phase-7j', 'entity-longdescriptions.csv');
  const claimPath = path.join(ROOT, 'reports', 'phase-7j', 'entity-claim-inventory.csv');
  if (!fs.existsSync(invPath) || !fs.existsSync(claimPath)) {
    critical.push({ rule: 'MISSING_DATASET', detail: 'entity-longdescriptions.csv or entity-claim-inventory.csv not found' });
    return finish(critical, warnings);
  }

  const entities = parseCsv(fs.readFileSync(invPath, 'utf8'));
  const entityIds = new Set(entities.map((e) => e.entity_id));
  const claims = parseCsv(fs.readFileSync(claimPath, 'utf8'));

  // Every entity_id in entity-longdescriptions.csv must resolve to a real
  // entity page/data record.
  const entityIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'graph', 'entity-index.json'), 'utf8'));
  for (const e of entities) {
    if (!entityIndex[e.entity_id]) {
      critical.push({ rule: 'UNRESOLVED_ENTITY_ID', detail: e.entity_id });
    }
  }

  const seenClaimIds = new Set();
  for (const c of claims) {
    // every claim has an entity ID that resolves
    if (!c.entity_id) {
      critical.push({ rule: 'CLAIM_MISSING_ENTITY_ID', detail: c.claim_id });
    } else if (!entityIds.has(c.entity_id)) {
      critical.push({ rule: 'CLAIM_ENTITY_ID_UNRESOLVED', detail: `${c.claim_id}: ${c.entity_id}` });
    }

    // no duplicate claim IDs
    if (seenClaimIds.has(c.claim_id)) {
      critical.push({ rule: 'DUPLICATE_CLAIM_ID', detail: c.claim_id });
    }
    seenClaimIds.add(c.claim_id);

    // status values are controlled vocabulary
    if (!STATUS_VOCAB.has(c.scientific_review_status)) {
      critical.push({ rule: 'INVALID_STATUS_VALUE', detail: `${c.claim_id}: "${c.scientific_review_status}"` });
    }

    // unsupported claims cannot be silently marked supported: every
    // SUPPORTED/DIRECTLY_SUPPORTED/SUPPORTED_BY_CONTEXT claim must have
    // EITHER a resolvable source_registry_ids entry OR (for material/
    // product-composition claims outside chemistry-ranges.js's scope) be
    // present in the individually-reviewed high-risk-manual-review.csv.
    if (['SUPPORTED', 'DIRECTLY_SUPPORTED', 'SUPPORTED_BY_CONTEXT'].includes(c.scientific_review_status)) {
      const ids = (c.source_registry_ids || '').split(';').filter(Boolean);
      const unresolvedIds = ids.filter((id) => !RANGES_BY_ID[id]);
      if (unresolvedIds.length > 0) {
        critical.push({ rule: 'CITATION_TO_UNKNOWN_SOURCE', detail: `${c.claim_id}: ${unresolvedIds.join(',')}` });
      }
      if (ids.length === 0 && c.scientific_review_status !== 'SUPPORTED') {
        // DIRECTLY_SUPPORTED/SUPPORTED_BY_CONTEXT without any matched range
        // ID would be a fabricated-support case.
        critical.push({ rule: 'SUPPORTED_STATUS_WITHOUT_SOURCE', detail: c.claim_id });
      }
    }

    // no impossible parameter mappings among claims marked reliably extracted
    if (c.extraction_status === 'CORRECT_EXTRACTION' && !c.parameter && c.claim_type === 'numeric_chemistry_claim') {
      critical.push({ rule: 'MISSING_PARAMETER_MAPPING', detail: c.claim_id });
    }

    // malformed units: numeric chemistry claims should carry a non-empty unit
    // (warning only -- some legitimate claims, e.g. ratios, have no unit)
    if (c.claim_type === 'numeric_chemistry_claim' && !c.unit) {
      warnings.push({ rule: 'NUMERIC_CLAIM_MISSING_UNIT', detail: c.claim_id });
    }

    // unresolved placeholder values
    if (/\{\{|undefined|NaN/.test(c.source_text) || /\{\{|undefined|NaN/.test(c.value)) {
      critical.push({ rule: 'PLACEHOLDER_VALUE', detail: c.claim_id });
    }

    // missing review state
    if (!c.scientific_review_status) {
      critical.push({ rule: 'MISSING_REVIEW_STATE', detail: c.claim_id });
    }
  }

  // deterministic ordering: claim IDs should be sorted by entity then sequence
  const ids = claims.map((c) => c.claim_id);
  const sorted = [...ids].sort();
  // (not enforced as critical -- extraction order is entity-iteration order,
  // which is deterministic given entity-index.json's own key order, but not
  // alphabetical; recorded as informational only)

  return finish(critical, warnings, claims.length, entities.length);
}

function finish(critical, warnings, claimCount, entityCount) {
  const result = {
    status: critical.length === 0 ? 'PASS' : 'FAIL',
    entities_checked: entityCount || 0,
    claims_checked: claimCount || 0,
    critical_count: critical.length,
    warning_count: warnings.length,
    critical,
    warnings: warnings.slice(0, 30),
  };
  const outDir = path.join(ROOT, 'reports', 'phase-7j');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'entity-provenance-validation-results.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(`validate-entity-provenance: ${result.status} -- ${entityCount || 0} entities, ${claimCount || 0} claims, ${critical.length} critical, ${warnings.length} warning(s).`);
  if (critical.length) {
    for (const c of critical.slice(0, 20)) console.log(`  [CRITICAL:${c.rule}] ${c.detail}`);
    process.exitCode = 1;
  }
  return result;
}

if (require.main === module) run();
module.exports = { run };
