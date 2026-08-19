#!/usr/bin/env node
'use strict';
/**
 * build-editorial-decisions.js (Phase 7F.1, Step 2/17)
 *
 * Canonical editorial decision dataset. Points back to stable claim_ids
 * from the Phase 7D.3 evidence dataset -- does not maintain a disconnected
 * truth database. Deterministic: no timestamps/randomness in the record
 * content itself (review_date is a fixed literal for this phase's pass,
 * not a generated one).
 */
const fs = require('fs');
const path = require('path');
const { parseCsv } = require('../phase-7d-1/reconcile-claims-v2');

const ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'reports', 'phase-7f-1');
const REVIEW_DATE = '2026-08-18';

const evidence = parseCsv(fs.readFileSync(path.join(ROOT, 'reports', 'phase-7d-3', 'chemistry-evidence.csv'), 'utf8'));
const evByClaim = new Map(evidence.map((r) => [r.claim_id, r]));

// The 5 genuine conflicts, individually reviewed (Steps 3-6).
const CONFLICT_DECISIONS = [
  { claim_id: '3c256b70dc1e3ce2', decision: 'CORRECT_REQUIRED', production_action: 'CORRECT_VALUE',
    reason: 'CDC recommends against CYA/stabilized chlorine in hot tubs; corrected chart row and quick-answer text.' },
  { claim_id: '317e0ea96af98f4f', decision: 'SUPPORTED_WITH_CONTEXT', production_action: 'ADD_CONTEXT',
    reason: 'Residential 0.5 ppm convention is real but site also has the stricter 0.4 ppm MAHC figure elsewhere; added context on the technical reference page.' },
  { claim_id: '9b5883473f17b6cd', decision: 'SUPPORTED_WITH_CONTEXT', production_action: 'NO_PRODUCTION_ACTION',
    reason: 'Same underlying finding as above; this page is a quick-answer callout, context added at the reference page instead (smallest correction principle).' },
  { claim_id: '608025031537cf13', decision: 'SUPPORTED_WITH_CONTEXT', production_action: 'NO_PRODUCTION_ACTION',
    reason: 'Same underlying finding; glossary quick-trigger entry, same reasoning as above.' },
  { claim_id: '3bb0e016bca28ac0', decision: 'SUPPORTED_WITH_CONTEXT', production_action: 'NO_PRODUCTION_ACTION',
    reason: 'Same underlying finding; comparison-table cell, same reasoning as above.' },
];

// The 3 genuine Tier-1 SOURCE_NOT_FOUND records, individually reviewed (Step 7).
const TIER1_SOURCE_NOT_FOUND_DECISIONS = [
  { claim_id: 'afafa0a42ca5ecd7', decision: 'NOT_A_CLAIM', production_action: 'NO_PRODUCTION_ACTION',
    reason: 'Typical hot tub volume (300-500 gal) is a physical-capacity fact, not a chemistry source-checkable claim.' },
  { claim_id: '95ff7debc53ce62f', decision: 'DEFERRED', production_action: 'NO_PRODUCTION_ACTION',
    reason: 'Alkalinity dosing coefficient -- already disclosed via Phase 7F Trust Panel correction (formula-alkalinity-adjustment, confidence=limited).' },
  { claim_id: 'dd0df4b5d44367b9', decision: 'DEFERRED', production_action: 'NO_PRODUCTION_ACTION',
    reason: 'Shock dosing example -- already covered by SHOCK-CLAIM-FAMILY-DECISION.md (Phase 7E.1).' },
];

function run() {
  const rows = [];
  for (const d of [...CONFLICT_DECISIONS, ...TIER1_SOURCE_NOT_FOUND_DECISIONS]) {
    const ev = evByClaim.get(d.claim_id);
    rows.push({
      claim_id: d.claim_id,
      page_url: ev.source_url,
      source_claim: ev.source_claim,
      parameter_id: ev.parameter_id,
      environment: ev.environment,
      claim_type: ev.claim_type,
      current_production_statement: ev.source_claim,
      evidence_statement: `extraction_status=${ev.extraction_status}, scientific_review_status=${ev.scientific_review_status}`,
      source_registry_ids: '',
      decision: d.decision,
      decision_reason: d.reason,
      production_action: d.production_action,
      review_date: REVIEW_DATE,
    });
  }

  // Unclassified 133 -> folded in as DEFERRED/NOT_A_CLAIM/CONTEXTUAL_DIFFERENCE
  // records per classify-unclassified.js, mapped to the Step 2 decision vocabulary.
  const { results: unclassifiedResults } = require('./classify-unclassified');
  const CATEGORY_TO_DECISION = {
    EXAMPLE_CALCULATION: 'NOT_A_CLAIM',
    NON_CHEMISTRY_ARTIFACT: 'NOT_A_CLAIM',
    CONTEXTUAL_DIFFERENCE: 'SUPPORTED_WITH_CONTEXT',
    DEFERRED: 'DEFERRED',
  };
  for (const r of unclassifiedResults) {
    rows.push({
      claim_id: r.claim_id,
      page_url: r.source_file,
      source_claim: r.source_claim,
      parameter_id: r.parameter_id,
      environment: '',
      claim_type: '',
      current_production_statement: r.source_claim,
      evidence_statement: `mechanical_category=${r.category}`,
      source_registry_ids: '',
      decision: CATEGORY_TO_DECISION[r.category],
      decision_reason: r.reason,
      production_action: 'NO_PRODUCTION_ACTION',
      review_date: REVIEW_DATE,
    });
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const FIELDS = ['claim_id', 'page_url', 'source_claim', 'parameter_id', 'environment', 'claim_type',
    'current_production_statement', 'evidence_statement', 'source_registry_ids', 'decision', 'decision_reason',
    'production_action', 'review_date'];
  function toCsv(rowsArg, fields) {
    const esc = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    return [fields.join(','), ...rowsArg.map((r) => fields.map((f) => esc(r[f])).join(','))].join('\n') + '\n';
  }
  fs.writeFileSync(path.join(OUT_DIR, 'EDITORIAL-DECISIONS.csv'), toCsv(rows, FIELDS));
  fs.writeFileSync(path.join(OUT_DIR, 'editorial-decisions.json'), JSON.stringify(rows, null, 2) + '\n');

  console.log(`build-editorial-decisions: ${rows.length} decisions recorded.`);
  const byDecision = {};
  for (const r of rows) byDecision[r.decision] = (byDecision[r.decision] || 0) + 1;
  console.log('by decision:', byDecision);
  return rows;
}

if (require.main === module) run();
module.exports = { run };
