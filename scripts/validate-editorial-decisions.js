#!/usr/bin/env node
'use strict';
/**
 * validate-editorial-decisions.js (Phase 7F.1, Step 19)
 */
const fs = require('fs');
const path = require('path');
const { parseCsv } = require('./phase-7d-1/reconcile-claims-v2');
const { SOURCES } = require('./data/chemistry-sources');

const ROOT = path.join(__dirname, '..');
const DECISIONS_PATH = path.join(ROOT, 'reports', 'phase-7f-1', 'EDITORIAL-DECISIONS.csv');
const EVIDENCE_PATH = path.join(ROOT, 'reports', 'phase-7d-3', 'chemistry-evidence.csv');

const VALID_DECISIONS = new Set(['SUPPORTED_AS_WRITTEN', 'SUPPORTED_WITH_CONTEXT', 'SUPPORTED_WITH_NARROWING', 'CORRECT_REQUIRED', 'CONFLICT_REMAINS', 'EXPERT_REVIEW_REQUIRED', 'NOT_A_CLAIM', 'DEFERRED']);
const VALID_ACTIONS = new Set(['NO_CHANGE', 'ADD_CONTEXT', 'NARROW_CLAIM', 'CORRECT_VALUE', 'CORRECT_SOURCE', 'REMOVE_UNSUPPORTED_ASSERTION', 'FLAG_FOR_EXPERT_REVIEW', 'NO_PRODUCTION_ACTION']);
const VALID_SOURCE_IDS = new Set(SOURCES.map((s) => s.id));

function run() {
  const decisions = parseCsv(fs.readFileSync(DECISIONS_PATH, 'utf8'));
  const evidence = parseCsv(fs.readFileSync(EVIDENCE_PATH, 'utf8'));
  const evByClaim = new Map(evidence.map((r) => [r.claim_id, r]));

  const violations = [];
  const seenIds = new Set();

  for (const d of decisions) {
    if (seenIds.has(d.claim_id)) violations.push({ rule: 'DUPLICATE_CLAIM_DECISION', detail: d.claim_id });
    seenIds.add(d.claim_id);

    const ev = evByClaim.get(d.claim_id);
    if (!ev) { violations.push({ rule: 'INVALID_CLAIM_ID', detail: d.claim_id }); continue; }

    if (!VALID_DECISIONS.has(d.decision)) violations.push({ rule: 'INVALID_DECISION_VALUE', detail: `${d.claim_id}: ${d.decision}` });
    if (!VALID_ACTIONS.has(d.production_action)) violations.push({ rule: 'INVALID_PRODUCTION_ACTION', detail: `${d.claim_id}: ${d.production_action}` });

    if (d.source_registry_ids) {
      for (const sid of d.source_registry_ids.split(';').map((s) => s.trim()).filter(Boolean)) {
        if (!VALID_SOURCE_IDS.has(sid)) violations.push({ rule: 'INVALID_SOURCE_ID', detail: `${d.claim_id}: ${sid}` });
      }
    }

    // CORRECT_REQUIRED without evidence (a decision_reason must be present and substantive)
    if (d.decision === 'CORRECT_REQUIRED' && (!d.decision_reason || d.decision_reason.length < 20)) {
      violations.push({ rule: 'CORRECT_REQUIRED_WITHOUT_EVIDENCE', detail: d.claim_id });
    }
    // SUPPORTED_AS_WRITTEN without source/provenance where a source is required
    if (d.decision === 'SUPPORTED_AS_WRITTEN' && !d.source_registry_ids) {
      violations.push({ rule: 'SUPPORTED_AS_WRITTEN_WITHOUT_SOURCE', detail: d.claim_id });
    }
    // CONFLICT_REMAINS without explanation
    if (d.decision === 'CONFLICT_REMAINS' && (!d.decision_reason || d.decision_reason.length < 20)) {
      violations.push({ rule: 'CONFLICT_REMAINS_WITHOUT_EXPLANATION', detail: d.claim_id });
    }
    // production correction without OLD/NEW documentation (checked via decision_reason mentioning correction context for CORRECT_VALUE actions)
    if (d.production_action === 'CORRECT_VALUE' && !/correct|CDC|source/i.test(d.decision_reason)) {
      violations.push({ rule: 'CORRECTION_WITHOUT_DOCUMENTATION', detail: d.claim_id });
    }
    // expert-review claims presented as resolved
    if (d.decision === 'EXPERT_REVIEW_REQUIRED' && d.production_action !== 'FLAG_FOR_EXPERT_REVIEW' && d.production_action !== 'NO_PRODUCTION_ACTION') {
      violations.push({ rule: 'EXPERT_REVIEW_PRESENTED_AS_RESOLVED', detail: d.claim_id });
    }
    // decisions attached to NOT_EXTRACTED evidence
    if (['NO_NUMERIC_CONTENT', 'IMPOSSIBLE_MAPPING', 'NO_PARAMETER_IN_CLAUSE'].includes(ev.extraction_status)
      && ['SUPPORTED_AS_WRITTEN', 'SUPPORTED_WITH_CONTEXT', 'SUPPORTED_WITH_NARROWING', 'CORRECT_REQUIRED'].includes(d.decision)) {
      violations.push({ rule: 'DECISION_ON_NOT_EXTRACTED_EVIDENCE', detail: `${d.claim_id}: extraction_status=${ev.extraction_status} decision=${d.decision}` });
    }
  }

  const result = {
    status: violations.length === 0 ? 'PASS' : 'FAIL',
    decisions_checked: decisions.length,
    violations_found: violations.length,
    violations: violations.slice(0, 50),
  };

  const outDir = path.join(ROOT, 'reports', 'phase-7f-1');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'editorial-decisions-validation-results.json'), JSON.stringify(result, null, 2) + '\n');

  console.log(`validate-editorial-decisions: ${result.status} -- ${decisions.length} decisions checked, ${violations.length} violation(s).`);
  if (violations.length > 0) {
    for (const v of violations.slice(0, 20)) console.log(`  [${v.rule}] ${v.detail}`);
    process.exitCode = 1;
  }
  return result;
}

if (require.main === module) run();
module.exports = { run };
