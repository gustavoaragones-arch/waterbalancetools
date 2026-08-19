#!/usr/bin/env node
'use strict';
/**
 * build-consistency-matrix.js (Phase 7D Step 9)
 *
 * For every parameter with more than one canonical range record, compares
 * every pair and classifies the relationship using the vocabulary defined
 * in the Phase 7D brief's "CRITICAL SCIENTIFIC RULE" section:
 *
 *   CONSISTENT_CONTEXT_DIFFERENCE -- different environment/sanitizer/
 *                                     scenario/equipment explains the
 *                                     different values; not a conflict
 *   POTENTIAL_CONTRADICTION       -- same environment+sanitizer+scenario,
 *                                     genuinely different non-overlapping
 *                                     values, no distinguishing factor found
 *   REQUIRES_EXPERT_REVIEW        -- same context, differing values, but at
 *                                     least one side is not yet source-backed
 *   UNSUPPORTED / AMBIGUOUS       -- reserved for future rows once more
 *                                     ranges/claims exist; not produced by
 *                                     the current dataset
 *
 * This script never resolves a difference automatically -- it only
 * classifies and records why.
 */
const fs = require('fs');
const path = require('path');
const { RANGES } = require('../data/chemistry-ranges');

const ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'reports', 'phase-7d');

function overlaps(a, b) {
  if (a.minimum === null || a.maximum === null || b.minimum === null || b.maximum === null) return null;
  return a.minimum <= b.maximum && b.minimum <= a.maximum;
}

const byParam = {};
for (const r of RANGES) (byParam[r.parameter_id] = byParam[r.parameter_id] || []).push(r);

const rows = [];
for (const [parameterId, ranges] of Object.entries(byParam)) {
  if (ranges.length < 2) continue;
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      const a = ranges[i]; const b = ranges[j];
      const sameEnv = a.environment === b.environment;
      const sameSanitizer = a.sanitizer === b.sanitizer;
      const sameScenario = a.scenario === b.scenario;
      const ov = overlaps(a, b);

      let relationship; let status; let explanation;
      if (!sameEnv) {
        relationship = 'different environment (pool vs hot_tub)';
        status = 'CONSISTENT_CONTEXT_DIFFERENCE';
        explanation = 'Different environments legitimately carry different targets (e.g. hot tubs run hotter, smaller volume, higher bather load per gallon).';
      } else if (!sameSanitizer) {
        relationship = `different sanitizer (${a.sanitizer} vs ${b.sanitizer})`;
        status = 'CONSISTENT_CONTEXT_DIFFERENCE';
        explanation = 'Different sanitizer chemistries are not directly comparable on the same numeric scale/target.';
      } else if (!sameScenario) {
        relationship = `different scenario (${a.scenario} vs ${b.scenario})`;
        status = 'CONSISTENT_CONTEXT_DIFFERENCE';
        explanation = 'Routine maintenance targets and treatment/incident-response thresholds serve different purposes and are not comparable as if both were routine targets.';
      } else if (ov) {
        relationship = 'same context, overlapping ranges';
        status = 'CONSISTENT_CONTEXT_DIFFERENCE';
        explanation = 'Ranges overlap (e.g. a narrower practical target nested inside a wider acceptable standard) -- not a conflict.';
      } else if (a.id.includes('pentair') || b.id.includes('pentair') || a.id.includes('autopilot') || b.id.includes('autopilot')) {
        relationship = 'same context, different manufacturer/equipment target';
        status = 'CONSISTENT_CONTEXT_DIFFERENCE';
        explanation = 'Different salt-chlorine-generator manufacturers specify different equipment-level operating targets; both are legitimate for their respective equipment.';
      } else if (a.status === 'REQUIRES_REVIEW' || b.status === 'REQUIRES_REVIEW' || a.status === 'CONTEXTUAL' || b.status === 'CONTEXTUAL') {
        relationship = 'same context, non-overlapping values, at least one side not yet source-backed';
        status = 'REQUIRES_EXPERT_REVIEW';
        explanation = 'Cannot classify confidently as a true contradiction or a legitimate variant until the weaker-evidence side is independently confirmed.';
      } else {
        relationship = 'same context, non-overlapping values, both source-backed';
        status = 'POTENTIAL_CONTRADICTION';
        explanation = 'Same environment, sanitizer, and scenario, materially different values, no distinguishing factor identified -- genuine review candidate.';
      }

      rows.push({
        parameter: parameterId,
        context_a: `${a.environment}/${a.sanitizer}/${a.scenario}`,
        range_a: `${a.id} [${a.minimum ?? '?'}-${a.maximum ?? '?'} ${a.unit || ''}]`,
        context_b: `${b.environment}/${b.sanitizer}/${b.scenario}`,
        range_b: `${b.id} [${b.minimum ?? '?'}-${b.maximum ?? '?'} ${b.unit || ''}]`,
        relationship,
        status,
        explanation,
      });
    }
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });
function toCsv(rows, fields) {
  const esc = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [fields.join(','), ...rows.map((r) => fields.map((f) => esc(r[f])).join(','))].join('\n') + '\n';
}
const FIELDS = ['parameter', 'context_a', 'range_a', 'context_b', 'range_b', 'relationship', 'status', 'explanation'];
fs.writeFileSync(path.join(OUT_DIR, 'chemistry-consistency-matrix.csv'), toCsv(rows, FIELDS));

const summary = {};
for (const r of rows) summary[r.status] = (summary[r.status] || 0) + 1;
console.log(`build-consistency-matrix: ${rows.length} pairwise comparisons across ${Object.keys(byParam).filter((k) => byParam[k].length > 1).length} multi-range parameters.`);
console.log('Summary:', summary);
