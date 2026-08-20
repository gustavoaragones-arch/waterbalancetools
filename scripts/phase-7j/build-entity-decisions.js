#!/usr/bin/env node
'use strict';
/**
 * build-entity-decisions.js (Phase 7J, Step 10)
 * Per-entity content decision, aggregated from that entity's claim
 * dispositions (reports/phase-7j/entity-claim-inventory.csv).
 */
const fs = require('fs');
const path = require('path');
const { parseCsv } = require('../phase-7d-1/reconcile-claims-v2');

const ROOT = path.join(__dirname, '..', '..');
const claims = parseCsv(fs.readFileSync(path.join(ROOT, 'reports', 'phase-7j', 'entity-claim-inventory.csv'), 'utf8'));

const byEntity = {};
for (const c of claims) {
  byEntity[c.entity_id] = byEntity[c.entity_id] || [];
  byEntity[c.entity_id].push(c);
}

// High-priority claim types per Step 9 (safety, numeric chemistry,
// material-property claims about degradation/damage). A REQUIRES_REVIEW
// or AMBIGUOUS status on one of THESE is what should drive an entity-
// level RESEARCH REQUIRED decision -- a routine, low-stakes taxonomy/
// operational sentence sitting at the default REQUIRES_REVIEW status
// (simply because it was never individually re-verified this phase) is
// not itself a reason to flag the whole page as needing research. Per
// Step 10: "If it is correct but lacks provenance, add provenance
// infrastructure rather than rewriting the claim" -- the dataset itself
// (this CSV) IS that infrastructure for the low-priority claims.
const HIGH_PRIORITY_TYPES = new Set(['safety_claim', 'numeric_chemistry_claim', 'material_property_claim']);

const rows = [];
for (const [entityId, entityClaims] of Object.entries(byEntity)) {
  const statuses = entityClaims.map((c) => c.scientific_review_status);
  const hasUnsupported = statuses.includes('UNSUPPORTED');
  const highPriorityUnresolved = entityClaims.filter((c) =>
    HIGH_PRIORITY_TYPES.has(c.claim_type) && (c.scientific_review_status === 'REQUIRES_REVIEW' || c.scientific_review_status === 'AMBIGUOUS' || c.scientific_review_status === 'NO_EXISTING_SOURCE')
  );
  const allSupportedOrNonClaim = statuses.every((s) => ['SUPPORTED', 'DIRECTLY_SUPPORTED', 'SUPPORTED_BY_CONTEXT', 'CONTEXTUAL', 'NON_CLAIM', 'NOT_APPLICABLE'].includes(s));

  let decision, reason;
  if (hasUnsupported) {
    decision = 'RESEARCH_REQUIRED';
    reason = 'At least one claim marked UNSUPPORTED -- needs sourcing or removal before this page can be considered provenance-clean.';
  } else if (allSupportedOrNonClaim) {
    decision = 'KEEP AS WRITTEN';
    reason = 'Every extracted claim is either supported by the existing chemistry-ranges.js registry, contextually consistent with established site precedent, or not a chemistry claim requiring sourcing.';
  } else if (highPriorityUnresolved.length > 0) {
    decision = 'RESEARCH REQUIRED';
    reason = `${highPriorityUnresolved.length} HIGH-priority claim(s) (safety/numeric-chemistry/material-property) not yet independently verified: ${highPriorityUnresolved.map((c) => c.claim_id).join(', ')}. No claim is contradicted by evidence; page content is left unchanged pending research.`;
  } else {
    decision = 'KEEP AS WRITTEN';
    reason = `Only low-priority claims (basic definitions, routine operational statements) remain at REQUIRES_REVIEW; this dataset entry is the provenance record for them, per Step 10 -- no page rewrite needed.`;
  }

  rows.push({
    entity_id: entityId,
    page: `entities/${entityId}.html`,
    total_claims: entityClaims.length,
    supported_count: statuses.filter((s) => ['SUPPORTED', 'DIRECTLY_SUPPORTED', 'SUPPORTED_BY_CONTEXT'].includes(s)).length,
    contextual_count: statuses.filter((s) => s === 'CONTEXTUAL').length,
    requires_review_count: statuses.filter((s) => s === 'REQUIRES_REVIEW' || s === 'AMBIGUOUS').length,
    non_claim_count: statuses.filter((s) => s === 'NON_CLAIM' || s === 'NOT_APPLICABLE').length,
    unsupported_count: statuses.filter((s) => s === 'UNSUPPORTED').length,
    decision,
    reason,
    production_change_made: 'no',
  });
}

const header = ['entity_id', 'page', 'total_claims', 'supported_count', 'contextual_count', 'requires_review_count', 'non_claim_count', 'unsupported_count', 'decision', 'reason', 'production_change_made'];
const csv = [header.join(',')].concat(
  rows.map((r) => header.map((h) => '"' + String(r[h]).replace(/"/g, '""') + '"').join(','))
).join('\n') + '\n';
fs.writeFileSync(path.join(ROOT, 'reports', 'phase-7j', 'entity-provenance-decisions.csv'), csv);

const byDecision = {};
for (const r of rows) byDecision[r.decision] = (byDecision[r.decision] || 0) + 1;
console.log(`build-entity-decisions: ${rows.length} entities`, byDecision);
