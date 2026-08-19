#!/usr/bin/env node
'use strict';
/**
 * validate-provenance-resolution.js (Phase 7E.1, Step 14)
 * Validates reports/phase-7e-1/conflicting-claims.csv against
 * provenance-mapping.csv and chemistry-ranges.js.
 */
const fs = require('fs');
const path = require('path');
const { parseCsv } = require('./phase-7d-1/reconcile-claims-v2');
const { SOURCES } = require('./data/chemistry-sources');
const { RANGES } = require('./data/chemistry-ranges');

const ROOT = path.join(__dirname, '..');
const CONFLICTS_PATH = path.join(ROOT, 'reports', 'phase-7e-1', 'conflicting-claims.csv');
const PROV_PATH = path.join(ROOT, 'reports', 'phase-7e', 'provenance-mapping.csv');
const EVIDENCE_PATH = path.join(ROOT, 'reports', 'phase-7d-3', 'chemistry-evidence.csv');

const VALID_CONFLICT_TYPES = new Set(['RANGE_MISMATCH', 'CONTEXT_MISMATCH', 'PARAMETER_MISMATCH', 'SOURCE_SCOPE_MISMATCH', 'CLAIM_FAMILY_GAP', 'EXTRACTION_ARTIFACT', 'SOURCE_CONFLICT', 'UNSUPPORTED_PRODUCTION_CLAIM', 'OTHER']);
const VALID_RESOLUTION_STATUSES = new Set(['UNREVIEWED', 'FALSE_CONFLICT', 'RESOLVED_SUPPORTED', 'RESOLVED_CONTEXTUAL', 'REQUIRES_EXPERT_REVIEW', 'SOURCE_CONFLICT_REMAINS', 'NOT_A_CHEMISTRY_CLAIM']);
const VALID_SOURCE_IDS = new Set(SOURCES.map((s) => s.id));

function run() {
  const conflicts = parseCsv(fs.readFileSync(CONFLICTS_PATH, 'utf8'));
  const prov = parseCsv(fs.readFileSync(PROV_PATH, 'utf8'));
  const provByClaim = new Map(prov.map((r) => [r.claim_id, r]));
  const evidence = parseCsv(fs.readFileSync(EVIDENCE_PATH, 'utf8'));
  const evByClaim = new Map(evidence.map((r) => [r.claim_id, r]));

  const violations = [];
  const seenClaimIds = new Set();

  for (const c of conflicts) {
    // duplicate conflict resolutions
    if (seenClaimIds.has(c.claim_id)) violations.push({ rule: 'DUPLICATE_CONFLICT_RESOLUTION', detail: c.claim_id });
    seenClaimIds.add(c.claim_id);

    if (!VALID_CONFLICT_TYPES.has(c.conflict_type)) violations.push({ rule: 'INVALID_CONFLICT_TYPE', detail: `${c.claim_id}: ${c.conflict_type}` });
    if (!VALID_RESOLUTION_STATUSES.has(c.resolution_status)) violations.push({ rule: 'INVALID_RESOLUTION_STATUS', detail: `${c.claim_id}: ${c.resolution_status}` });

    if (c.source_id && !VALID_SOURCE_IDS.has(c.source_id)) violations.push({ rule: 'NONEXISTENT_SOURCE_ID', detail: `${c.claim_id}: ${c.source_id}` });

    const pr = provByClaim.get(c.claim_id);
    if (!pr) { violations.push({ rule: 'CLAIM_NOT_IN_PROVENANCE_MAPPING', detail: c.claim_id }); continue; }

    // conflicting claim marked SUPPORTED without resolution evidence
    if (pr.provenance_status === 'SUPPORTED' && c.resolution_status !== 'RESOLVED_SUPPORTED') {
      violations.push({ rule: 'CONFLICT_MARKED_SUPPORTED_WITHOUT_RESOLUTION', detail: c.claim_id });
    }
    // unsupported claim marked DIRECT (support_type)
    if (pr.support_type === 'DIRECT' && !['RESOLVED_SUPPORTED', 'FALSE_CONFLICT'].includes(c.resolution_status)) {
      violations.push({ rule: 'UNSUPPORTED_MARKED_DIRECT', detail: c.claim_id });
    }
    // source conflict marked SUPPORTED without justification
    if (c.resolution_status === 'SOURCE_CONFLICT_REMAINS' && pr.provenance_status === 'SUPPORTED') {
      violations.push({ rule: 'SOURCE_CONFLICT_MARKED_SUPPORTED', detail: c.claim_id });
    }

    const ev = evByClaim.get(c.claim_id);
    if (ev) {
      // shock-treatment claim incorrectly mapped to routine FC range (i.e.
      // still silently classified as a value conflict against the routine
      // range, rather than surfaced as a claim-family gap)
      const shockLike = /\b(shock|shocking|breakpoint|superchlorinat|green pool)\b/i.test(ev.source_claim);
      if (shockLike && (ev.parameter_id === 'free_chlorine' || ev.parameter_id === 'combined_chlorine') && c.conflict_type === 'RANGE_MISMATCH') {
        violations.push({ rule: 'SHOCK_CLAIM_MAPPED_TO_ROUTINE_RANGE', detail: c.claim_id });
      }
      // pool claim mapped to a hot-tub-only source, or hot-tub claim
      // mapped to a pool-only source, without an explicit context note
      // explaining why that's still the right citation
      if (c.source_id) {
        const source = SOURCES.find((s) => s.id === c.source_id);
        if (source) {
          const hotTubOnly = source.topics.includes('hot_tubs') && !source.topics.includes('residential_pools');
          const poolOnly = source.topics.includes('residential_pools') && !source.topics.includes('hot_tubs');
          const mentionsEnv = /hot[\s-]?tub|pool/i.test(c.conflict_reason);
          if (((hotTubOnly && ev.environment === 'pool') || (poolOnly && ev.environment === 'hot_tub')) && !mentionsEnv) {
            violations.push({ rule: 'ENVIRONMENT_SOURCE_MISMATCH_UNEXPLAINED', detail: c.claim_id });
          }
        }
      }
      // provenance on NOT_EXTRACTED records
      if (['NO_NUMERIC_CONTENT', 'IMPOSSIBLE_MAPPING', 'NO_PARAMETER_IN_CLAUSE'].includes(ev.extraction_status) && c.source_id) {
        violations.push({ rule: 'PROVENANCE_ON_NOT_EXTRACTED', detail: c.claim_id });
      }
    }
  }

  // unresolved Tier 1 conflicts
  const TIER1 = [/^calculators\//, /levels-chart\.html$/, /^charts\//];
  for (const c of conflicts) {
    const ev = evByClaim.get(c.claim_id);
    if (ev && TIER1.some((p) => p.test(ev.source_url)) && c.resolution_status === 'UNREVIEWED') {
      violations.push({ rule: 'UNRESOLVED_TIER1_CONFLICT', detail: c.claim_id });
    }
  }

  const result = {
    status: violations.length === 0 ? 'PASS' : 'FAIL',
    conflicts_checked: conflicts.length,
    violations_found: violations.length,
    violations: violations.slice(0, 50),
  };

  const outDir = path.join(ROOT, 'reports', 'phase-7e-1');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'provenance-resolution-validation-results.json'), JSON.stringify(result, null, 2) + '\n');

  console.log(`validate-provenance-resolution: ${result.status} -- ${conflicts.length} conflicts checked, ${violations.length} violation(s).`);
  if (violations.length > 0) {
    for (const v of violations.slice(0, 15)) console.log(`  [${v.rule}] ${v.detail}`);
    process.exitCode = 1;
  }
  return result;
}

if (require.main === module) run();
module.exports = { run };
