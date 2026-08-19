#!/usr/bin/env node
'use strict';
/**
 * build-provenance.js (Phase 7E, Steps 7E.1, 7E.2, 7E.7)
 *
 * Computes provenance_status / support_type / source_registry_ids for
 * every record in reports/phase-7d-3/chemistry-evidence.csv, WITHOUT
 * mutating that file (it is preserved as historical/superseded evidence
 * per the established pattern -- see reports/phase-7d-3/*).
 *
 * METHODOLOGY (why this is not the "infer from range overlap" fabrication
 * the brief prohibits): scripts/data/chemistry-ranges.js's 23 RANGES
 * records are Phase 7D's hand-researched claim-family layer -- each one
 * already carries explicit source_ids and a rationale explaining why that
 * specific source supports that specific (parameter, environment,
 * sanitizer, scenario) range. reconcile-claims-v2.js's
 * scientificReviewStatus() already uses these exact records to decide
 * SUPPORTED/CONTEXTUAL/REQUIRES_REVIEW/AMBIGUOUS -- this script does not
 * introduce a new inference, it exposes and disambiguates the reasoning
 * that computation already relied on, and never marks a record SUPPORTED
 * or gives it a source_registry_ids value the RANGES record didn't
 * already explicitly carry itself.
 *
 * Disambiguation added here (the existing scientific_review_status
 * conflates two different situations under REQUIRES_REVIEW):
 *   (a) the record's value does not overlap ANY candidate range for its
 *       parameter/environment (a real conflict with the authoritative
 *       range) -> SOURCE_CONFLICT
 *   (b) the record's value DOES overlap a candidate range, but that
 *       range's own status is REQUIRES_REVIEW (the canonical range itself
 *       has no confirmed source) -> SOURCE_NOT_FOUND (nothing to cite)
 *
 * claim_type EXAMPLE_INPUT / CALCULATED_VALUE records are never
 * source-checked at all: they assert an instance/example, not a general
 * recommendation, so "does this match the authoritative range" is not
 * even the right question -> NOT_A_TRUE_CHEMISTRY_CLAIM.
 */
const fs = require('fs');
const path = require('path');
const { parseCsv } = require('../phase-7d-1/reconcile-claims-v2');
const { RANGES } = require('../data/chemistry-ranges');
const { SOURCES } = require('../data/chemistry-sources');
const { claimFamilyFor } = require('../data/chemistry-claim-family-map');

const ROOT = path.join(__dirname, '..', '..');
const IN_PATH = path.join(ROOT, 'reports', 'phase-7d-3', 'chemistry-evidence.csv');
const OUT_DIR = path.join(ROOT, 'reports', 'phase-7e');

const SOURCE_TOPICS = new Map(SOURCES.map((s) => [s.id, s.topics || []]));
function anySourceCoversTopic(parameterId) {
  for (const topics of SOURCE_TOPICS.values()) if (topics.includes(parameterId)) return true;
  return false;
}

function toCsv(rows, fields) {
  const esc = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [fields.join(','), ...rows.map((r) => fields.map((f) => esc(r[f])).join(','))].join('\n') + '\n';
}

function candidateRangesFor(parameterId, environment) {
  return RANGES.filter((r) => r.parameter_id === parameterId
    && (environment === 'unspecified' || environment === 'both' || r.environment === environment));
}

function classify(rec) {
  const evaluated = rec.extraction_status === 'CORRECT_EXTRACTION' || rec.extraction_status === 'CARRIED_CONTEXT';
  const claimFamily = claimFamilyFor(rec.parameter_id, rec.environment);

  if (!evaluated) {
    return { classification: 'NOT_A_TRUE_CHEMISTRY_CLAIM', support_type: '', provenance_status: 'UNREVIEWED', source_registry_ids: [], matched_range_id: '', notes: `Not extracted (${rec.extraction_status}); no scientific or provenance question applies.` };
  }
  if (rec.claim_type === 'EXAMPLE_INPUT' || rec.claim_type === 'CALCULATED_VALUE') {
    return { classification: 'NOT_A_TRUE_CHEMISTRY_CLAIM', support_type: '', provenance_status: 'UNREVIEWED', source_registry_ids: [], matched_range_id: '', notes: `claim_type=${rec.claim_type} asserts an example/instance, not a general recommendation.` };
  }

  const candidates = candidateRangesFor(rec.parameter_id, rec.environment);
  const lo = rec.minimum === '' ? null : Number(rec.minimum);
  const hi = rec.maximum === '' ? null : Number(rec.maximum);
  let overlapping = null;
  for (const r of candidates) {
    if (r.minimum === null || r.maximum === null || lo === null || hi === null) continue;
    if (lo <= r.maximum && hi >= r.minimum) { overlapping = r; break; }
  }

  if (overlapping) {
    if (overlapping.status === 'SUPPORTED') {
      return { classification: 'SOURCE_CAN_RESOLVE', support_type: 'DIRECT', provenance_status: 'SUPPORTED', source_registry_ids: overlapping.source_ids, matched_range_id: overlapping.id, notes: `Value overlaps ${overlapping.id} (SUPPORTED): ${overlapping.rationale}` };
    }
    if (overlapping.status === 'CONTEXTUAL') {
      return { classification: 'SOURCE_CAN_RESOLVE', support_type: 'CONTEXTUAL', provenance_status: 'PARTIALLY_SUPPORTED', source_registry_ids: overlapping.source_ids, matched_range_id: overlapping.id, notes: `Value overlaps ${overlapping.id} (CONTEXTUAL): ${overlapping.rationale}` };
    }
    // Overlaps a range whose own status is REQUIRES_REVIEW -- the
    // canonical range itself has no confirmed source, so there is nothing
    // to cite yet, even though the value itself isn't in conflict.
    return { classification: 'SOURCE_NOT_FOUND', support_type: '', provenance_status: 'EXPERT_REVIEW_REQUIRED', source_registry_ids: [], matched_range_id: overlapping.id, notes: `Value overlaps ${overlapping.id}, but that canonical range itself has no confirmed source (status REQUIRES_REVIEW) -- see chemistry-ranges.js.` };
  }

  if (candidates.length > 0) {
    return { classification: 'SOURCE_CONFLICT', support_type: 'CONFLICTING', provenance_status: 'CONFLICTING', source_registry_ids: [], matched_range_id: '', notes: `Value ${rec.minimum}-${rec.maximum} ${rec.unit} does not overlap any canonical range for ${rec.parameter_id}/${rec.environment} (checked: ${candidates.map((c) => c.id).join(', ')}).` };
  }

  if (claimFamily.length === 0 && !anySourceCoversTopic(rec.parameter_id)) {
    return { classification: 'SOURCE_NOT_FOUND', support_type: '', provenance_status: 'UNREVIEWED', source_registry_ids: [], matched_range_id: '', notes: `No source in the registry covers "${rec.parameter_id}" at all.` };
  }
  if (claimFamily.length === 0) {
    return { classification: 'SOURCE_PARTIALLY_RELEVANT', support_type: '', provenance_status: 'EXPERT_REVIEW_REQUIRED', source_registry_ids: [], matched_range_id: '', notes: `A source covers "${rec.parameter_id}" generally, but no canonical range exists for environment "${rec.environment}" and no claim family is mapped.` };
  }
  return { classification: 'REQUIRES_EXPERT_REVIEW', support_type: '', provenance_status: 'EXPERT_REVIEW_REQUIRED', source_registry_ids: [], matched_range_id: '', notes: `Claim family exists (${claimFamily.join(', ')}) but no canonical range covers this specific environment/context -- needs individual human review.` };
}

function run() {
  const evidence = parseCsv(fs.readFileSync(IN_PATH, 'utf8'));
  const out = evidence.map((rec) => {
    const c = classify(rec);
    return {
      claim_id: rec.claim_id,
      parameter_id: rec.parameter_id,
      environment: rec.environment,
      minimum: rec.minimum, maximum: rec.maximum, unit: rec.unit,
      extraction_status: rec.extraction_status,
      scientific_review_status: rec.scientific_review_status,
      classification: c.classification,
      support_type: c.support_type,
      provenance_status: c.provenance_status,
      source_registry_ids: c.source_registry_ids.join(';'),
      matched_range_id: c.matched_range_id,
      reviewed_at: 'phase-7e-mechanical-pass',
      review_notes: c.notes,
    };
  });

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const FIELDS = ['claim_id', 'parameter_id', 'environment', 'minimum', 'maximum', 'unit', 'extraction_status',
    'scientific_review_status', 'classification', 'support_type', 'provenance_status', 'source_registry_ids',
    'matched_range_id', 'reviewed_at', 'review_notes'];
  fs.writeFileSync(path.join(OUT_DIR, 'provenance-mapping.csv'), toCsv(out, FIELDS));

  const classificationSummary = {};
  const provenanceSummary = {};
  for (const r of out) {
    classificationSummary[r.classification] = (classificationSummary[r.classification] || 0) + 1;
    provenanceSummary[r.provenance_status] = (provenanceSummary[r.provenance_status] || 0) + 1;
  }
  console.log(`build-provenance: ${out.length} records classified.`);
  console.log('classification:', classificationSummary);
  console.log('provenance_status:', provenanceSummary);
  return { out, classificationSummary, provenanceSummary };
}

if (require.main === module) run();
module.exports = { run, classify, candidateRangesFor };
