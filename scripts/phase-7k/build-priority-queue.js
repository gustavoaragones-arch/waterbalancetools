#!/usr/bin/env node
'use strict';
/**
 * build-priority-queue.js (Phase 7K, Step 2)
 * Seeds the priority queue directly from Phase 7J's existing claim
 * inventory and manual-review decisions -- does not reinterpret Phase 7J's
 * classifications, only adds a priority ranking and a research-required
 * flag for triage.
 */
const fs = require('fs');
const path = require('path');
const { parseCsv } = require('../phase-7d-1/reconcile-claims-v2');

const ROOT = path.join(__dirname, '..', '..');
const claims = parseCsv(fs.readFileSync(path.join(ROOT, 'reports', 'phase-7j', 'entity-claim-inventory.csv'), 'utf8'));

// Priority ranking per Step 11: safety, numeric chemistry, treatment,
// material damage, pathogen/health first; ordinary definitions/operational
// statements last (Step 12 stop-rule: don't over-invest in those).
function priorityFor(c) {
  if (c.scientific_review_status === 'UNSUPPORTED') return 'P0';
  if (c.claim_type === 'safety_claim') return 'P1';
  if (c.claim_type === 'numeric_chemistry_claim' && (c.scientific_review_status === 'REQUIRES_REVIEW' || c.scientific_review_status === 'NO_EXISTING_SOURCE')) return 'P1';
  if (c.claim_type === 'material_property_claim') return 'P2';
  if (c.claim_type === 'operational_claim') return 'P3';
  if (c.claim_type === 'qualitative_chemistry_claim') return 'P3';
  return 'P4'; // taxonomy/definition
}

function targetSourceType(c) {
  if (c.claim_type === 'safety_claim') return 'government_or_manufacturer_sds';
  if (c.claim_type === 'material_property_claim') return 'manufacturer_technical_documentation';
  if (c.claim_type === 'numeric_chemistry_claim') return 'government_or_professional_standard';
  return 'not_applicable';
}

const rows = claims
  .filter((c) => ['REQUIRES_REVIEW', 'AMBIGUOUS', 'NO_EXISTING_SOURCE', 'UNSUPPORTED'].includes(c.scientific_review_status))
  .map((c) => ({
    claim_id: c.claim_id,
    entity_id: c.entity_id,
    url: `https://waterbalancetools.com/entities/${c.entity_id}`,
    source_text: c.source_text,
    claim_type: c.claim_type,
    parameter: c.parameter,
    value: c.value,
    unit: c.unit,
    environment: c.environment,
    scenario: c.scenario,
    current_status: c.scientific_review_status,
    priority: priorityFor(c),
    reason: c.claim_type === 'safety_claim' ? 'Safety/chemical-handling claim, unresolved from Phase 7J.'
      : c.claim_type === 'numeric_chemistry_claim' ? 'Numeric chemistry claim with no matching registry range or requiring re-verification.'
      : c.claim_type === 'material_property_claim' ? 'Material-science claim, distinct evidence domain from water chemistry.'
      : 'Lower-priority qualitative/operational/taxonomy claim -- not individually researched unless flagged during systematic entity review.',
    research_required: ['P0', 'P1', 'P2'].includes(priorityFor(c)) ? 'yes' : 'no',
    target_source_type: targetSourceType(c),
    final_disposition: '', // filled in during Steps 3-11
  }));

const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
rows.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

const header = ['claim_id', 'entity_id', 'url', 'source_text', 'claim_type', 'parameter', 'value', 'unit', 'environment', 'scenario', 'current_status', 'priority', 'reason', 'research_required', 'target_source_type', 'final_disposition'];
const csv = [header.join(',')].concat(
  rows.map((r) => header.map((h) => '"' + String(r[h]).replace(/"/g, '""') + '"').join(','))
).join('\n') + '\n';

const outDir = path.join(ROOT, 'reports', 'phase-7k');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'PRIORITY-EVIDENCE-QUEUE.csv'), csv);

const byPriority = {};
for (const r of rows) byPriority[r.priority] = (byPriority[r.priority] || 0) + 1;
console.log(`build-priority-queue: ${rows.length} unresolved claims`, byPriority);
