#!/usr/bin/env node
'use strict';
/**
 * build-conflict-inventory.js (Phase 7E.1, Step 1)
 *
 * Classifies all 499 SOURCE_CONFLICT records from
 * reports/phase-7e/provenance-mapping.csv into conflict_type +
 * resolution_status, using pattern rules grounded in the concrete
 * examples individually hand-reviewed in Phase 7E
 * (HIGH-RISK-PROVENANCE-REVIEW.md / MANUAL_OVERRIDES in
 * build-high-risk-review.js) plus a broader read of the full 499-record
 * population. Rules are applied uniformly and are fully disclosed here,
 * not hidden -- this is a triage pass, not a claim that every record was
 * individually read (Step 2 explicitly permits differentiated effort;
 * Tier 1 records ARE individually read -- see build-tier1-review.js).
 */
const fs = require('fs');
const path = require('path');
const { parseCsv } = require('../phase-7d-1/reconcile-claims-v2');
const { RANGES } = require('../data/chemistry-ranges');

const ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'reports', 'phase-7e-1');

const provenance = parseCsv(fs.readFileSync(path.join(ROOT, 'reports', 'phase-7e', 'provenance-mapping.csv'), 'utf8'));
const evidence = parseCsv(fs.readFileSync(path.join(ROOT, 'reports', 'phase-7d-3', 'chemistry-evidence.csv'), 'utf8'));
const evByClaim = new Map(evidence.map((r) => [r.claim_id, r]));

// Manual, individually-read overrides carried forward from Phase 7E's
// HIGH-RISK-PROVENANCE-REVIEW.md sample (real source text read, real
// reasoning -- not re-derived mechanically here).
const MANUAL = require('./manual-conflict-reviews.json');

const SHOCK_RE = /\b(shock|shocking|shocked|breakpoint|superchlorinat|hyperchlorinat|green pool|green-pool|algae bloom)\b/i;
const DELTA_RE = /\b(raise|lower|increase|decrease|drop|reduce)\b[^.]{0,20}\bby\b/i;
const COMPARISON_RE = /\b(compared to|versus|vs\.?|unlike|similar to|far (lower|higher|more|less) than|same as)\b/i;
const PROPORTION_RE = /\b(percent of|% of|fraction of|portion of|is in its)\b/i;
const SCALE_DEFINITION_RE = /\b(logarithmic scale|scale from|pH scale|ranges? from 0|full pH unit)\b/i;
const FREQUENCY_RE = /\b(times? (a|per) (week|day|month)|per week|per day|weekly|daily)\b/i;
const INDEX_NAV_RE = /\bIndex\s*(—|-|—)\s*\d|Related (Pool Chemistry )?Guides|Related in this topic/i;
// Phase 7E.1 Step 9: multi-column/multi-parameter reference-table
// structure (e.g. "Parameter Minimum Ideal Range Maximum Unit" headers,
// "Ideal Range" chart rows). Confirmed via individual review (2 cases,
// c65671f3c42e4e14 / 3cae91354d89d46a) that this structure can cause
// proximity-based extraction to cross-attribute a value from an adjacent
// table cell to the wrong parameter -- see TABLE-EXTRACTION-LIMITATION.md.
const TABLE_STRUCTURE_RE = /Parameter\s+(Minimum|Value)|Ideal Range|Chemical\s+Ideal range|Minimum\s+Ideal Range\s+Maximum/i;
const PRODUCT_RE = /\b(tablet|trichlor|dichlor|bcdmh|muriatic acid|sodium hypochlorite|liquid chlorine \(|calcium hypochlorite|cal-hypo|sodium bicarbonate|soda ash|available chlorine|by weight|product)\b/i;
const THRESHOLD_ABOVE_RE = /\b(above|exceeds?|over|greater than|more than)\b[^.]{0,25}(ppm|%|°f|ph)/i;
const THRESHOLD_BELOW_RE = /\b(below|under|less than|falls? below)\b[^.]{0,25}(ppm|%|°f|ph)/i;
const TABLE_RE = /\|.*\|.*\|/; // not applicable to prose; table-ish content instead detected via multiple param names + numbers density
const NAV_NOISE_RE = /\b(calculators? \(\d|related calculators|category cards|browse|entity type|last reviewed|version|dataset|platform)\b/i;
const FORMULA_RE = /[=×÷/]|constant|coefficient|dose\s*=|\bΔ/i;
const DERIVED_TC_RE = /total chlorine/i;

function candidateRangesFor(parameterId, environment) {
  return RANGES.filter((r) => r.parameter_id === parameterId
    && (environment === 'unspecified' || environment === 'both' || r.environment === environment));
}

function classify(r, ev) {
  const manual = MANUAL[r.claim_id];
  if (manual) return manual;

  const text = ev.source_claim;
  const lo = Number(r.minimum), hi = Number(r.maximum);
  const candidates = candidateRangesFor(r.parameter_id, r.environment);

  // Small-integer "pH" values that are actually step/day/test list
  // numbering near a pH mention (found via broad-sample review of the
  // 499-record population -- ~1 in 3 of all pH conflicts fit this exact
  // fingerprint). Only fires when the SPECIFIC number appears as a
  // recognizable list-numbering token in the text, not merely "any small
  // integer" (a genuine pH 1-5 claim, e.g. describing acid spill pH,
  // would not match one of these specific numbering patterns).
  if (r.parameter_id === 'ph' && lo === hi && Number.isInteger(lo) && lo >= 0 && lo <= 9) {
    const n = String(lo);
    const listMarkerRe = new RegExp(`\\b(Step|Day|Test|Week)\\s+${n}\\b|\\b${n}\\)|^${n}\\.\\s|\\b${n}(am|pm)\\b`, 'i');
    if (listMarkerRe.test(text)) {
      return { conflict_type: 'EXTRACTION_ARTIFACT', resolution_status: 'NOT_A_CHEMISTRY_CLAIM',
        conflict_reason: `"${lo}" is a step/day/test-numbering token ("Step ${lo}" / "${lo})" / list marker) near an unrelated pH mention elsewhere in the sentence, not a pH reading.` };
    }
  }

  // Dosage-delta language ("raise/lower X by N") -- N is a change amount,
  // not an absolute target value.
  if (DELTA_RE.test(text)) {
    return { conflict_type: 'UNSUPPORTED_PRODUCTION_CLAIM', resolution_status: 'NOT_A_CHEMISTRY_CLAIM',
      conflict_reason: 'Describes a dosage CHANGE amount ("raise/lower ... by N"), not an absolute water-chemistry target value.' };
  }

  // Comparison/analogy language (e.g. "far lower than ocean water") --
  // the number describes the comparison object, not the claimed parameter.
  if (COMPARISON_RE.test(text)) {
    return { conflict_type: 'CONTEXT_MISMATCH', resolution_status: 'FALSE_CONFLICT',
      conflict_reason: 'Value is part of a comparison/analogy (e.g. "far lower than ocean water"), not an assertion about the target parameter itself.' };
  }

  // Proportion/fraction-of-total language (e.g. "67% of free chlorine is
  // in its active form") -- a chemistry-equilibrium fact, not a
  // concentration target.
  if (PROPORTION_RE.test(text)) {
    return { conflict_type: 'UNSUPPORTED_PRODUCTION_CLAIM', resolution_status: 'NOT_A_CHEMISTRY_CLAIM',
      conflict_reason: 'Describes what fraction/percentage of the parameter is in a particular chemical form/state, not a concentration target.' };
  }

  // Product spec, not a water target
  if (PRODUCT_RE.test(text) && (r.unit === '%' || /tablet|solution|product/i.test(text))) {
    return { conflict_type: 'UNSUPPORTED_PRODUCTION_CLAIM', resolution_status: 'NOT_A_CHEMISTRY_CLAIM',
      conflict_reason: 'Value describes a product/chemical-supply specification (e.g. product concentration, %-by-weight), not a pool/spa water target -- never comparable to a water-chemistry range.' };
  }

  // Shock/breakpoint scenario compared against a routine-maintenance range
  if ((r.parameter_id === 'free_chlorine' || r.parameter_id === 'combined_chlorine' || r.parameter_id === 'shock_treatment') && SHOCK_RE.test(text)) {
    return { conflict_type: 'CLAIM_FAMILY_GAP', resolution_status: 'REQUIRES_EXPERT_REVIEW',
      conflict_reason: 'Value describes a shock/breakpoint-treatment scenario, correctly outside the routine-maintenance range it was checked against -- no numeric shock-treatment range exists in the claim family yet (see SHOCK-CLAIM-FAMILY-DECISION.md).' };
  }

  // total_chlorine is a derived quantity; never has its own range
  if (r.parameter_id === 'total_chlorine' || (candidates.length === 0 && DERIVED_TC_RE.test(text))) {
    return { conflict_type: 'CLAIM_FAMILY_GAP', resolution_status: 'NOT_A_CHEMISTRY_CLAIM',
      conflict_reason: 'total_chlorine is a derived quantity (FC+CC); no independent canonical range exists or should exist for it.' };
  }

  // Threshold/troubleshooting phrasing where the value is on the
  // range-consistent side of the threshold (i.e. describing a known
  // too-high/too-low condition, not asserting a new target)
  if (THRESHOLD_ABOVE_RE.test(text) && candidates.some((c) => c.maximum !== null && lo >= c.maximum)) {
    return { conflict_type: 'CONTEXT_MISMATCH', resolution_status: 'FALSE_CONFLICT',
      conflict_reason: `"Above/exceeds" threshold phrasing describing a too-high condition, consistent with (not contradicting) the canonical range's own maximum (${candidates[0] ? candidates[0].maximum : '?'}).` };
  }
  if (THRESHOLD_BELOW_RE.test(text) && candidates.some((c) => c.minimum !== null && hi <= c.minimum)) {
    return { conflict_type: 'CONTEXT_MISMATCH', resolution_status: 'FALSE_CONFLICT',
      conflict_reason: `"Below/under" threshold phrasing describing a too-low condition, consistent with (not contradicting) the canonical range's own minimum (${candidates[0] ? candidates[0].minimum : '?'}).` };
  }
  // Diagnostic/illustrative phrasing describing an out-of-range reading as
  // a problem ("X ppm is borderline", "at pH 8.0 [effect drops]",
  // "requires immediate treatment") rather than asserting X as the target.
  if (/\b(borderline|requires? (immediate )?treatment|drops? (sharply|to)|this drops? to)\b/i.test(text)
    && candidates.some((c) => (c.maximum !== null && lo >= c.maximum) || (c.minimum !== null && hi <= c.minimum))) {
    return { conflict_type: 'CONTEXT_MISMATCH', resolution_status: 'FALSE_CONFLICT',
      conflict_reason: 'Diagnostic/illustrative phrasing describing an out-of-range reading as a problem or a threshold effect, not asserting this value as the target.' };
  }

  // Formula/worked-example arithmetic, dosage coefficients
  if (FORMULA_RE.test(text) && /\d.*\d/.test(text)) {
    return { conflict_type: 'EXTRACTION_ARTIFACT', resolution_status: 'NOT_A_CHEMISTRY_CLAIM',
      conflict_reason: 'Intermediate arithmetic step, dosage coefficient, or formula constant in a worked example -- not an asserted target claim.' };
  }

  // pH-scale definitional statements ("0 to 14 logarithmic scale") --
  // describing the scale itself, not a target value.
  if (SCALE_DEFINITION_RE.test(text)) {
    return { conflict_type: 'UNSUPPORTED_PRODUCTION_CLAIM', resolution_status: 'NOT_A_CHEMISTRY_CLAIM',
      conflict_reason: 'Describes the pH scale itself (e.g. "0 to 14 logarithmic scale", "each full pH unit"), not a water-chemistry target value.' };
  }

  // Testing-frequency language ("2-3 times per week") -- the number is a
  // cadence, not a chemistry reading, misattributed via carry-forward.
  if (FREQUENCY_RE.test(text)) {
    return { conflict_type: 'EXTRACTION_ARTIFACT', resolution_status: 'NOT_A_CHEMISTRY_CLAIM',
      conflict_reason: 'Number describes testing/dosing FREQUENCY ("N times per week/day"), not a chemistry-parameter value.' };
  }

  // "Index — N" / related-guides navigation numbering
  if (INDEX_NAV_RE.test(text)) {
    return { conflict_type: 'EXTRACTION_ARTIFACT', resolution_status: 'NOT_A_CHEMISTRY_CLAIM',
      conflict_reason: 'Related-guides/index navigation list numbering, not a chemistry claim.' };
  }

  // Navigation/UI/metadata noise
  if (NAV_NOISE_RE.test(text)) {
    return { conflict_type: 'EXTRACTION_ARTIFACT', resolution_status: 'NOT_A_CHEMISTRY_CLAIM',
      conflict_reason: 'Navigation, UI chrome, or page-metadata text; the numeric value is not a chemistry claim at all.' };
  }

  // No candidate range exists for this environment at all (context mismatch, not a value dispute)
  if (candidates.length === 0) {
    return { conflict_type: 'CLAIM_FAMILY_GAP', resolution_status: 'REQUIRES_EXPERT_REVIEW',
      conflict_reason: `No canonical range exists for ${r.parameter_id}/${r.environment} at all -- cannot be a genuine value conflict, just unmodeled context.` };
  }

  // Multi-column reference-table structure: not confirmed wrong, but
  // structurally at elevated risk of column cross-attribution (Step 9) --
  // quarantined from a confident RANGE_MISMATCH verdict rather than
  // treated as either a confirmed error or a confirmed non-issue.
  if (TABLE_STRUCTURE_RE.test(text)) {
    return { conflict_type: 'EXTRACTION_ARTIFACT', resolution_status: 'REQUIRES_EXPERT_REVIEW',
      conflict_reason: 'Multi-column reference-table structure detected; not individually confirmed, but structurally at elevated risk of column cross-attribution (see TABLE-EXTRACTION-LIMITATION.md) -- quarantined from scientific/provenance decisions pending individual review, not treated as a confirmed value conflict.' };
  }

  // Default: genuine, unexplained numeric disagreement with the canonical range
  return { conflict_type: 'RANGE_MISMATCH', resolution_status: 'UNREVIEWED',
    conflict_reason: `Value ${r.minimum}-${r.maximum} ${r.unit} does not overlap the canonical range(s) ${candidates.map((c) => `${c.id} (${c.minimum}-${c.maximum})`).join(', ')} and does not match a recognized pattern (product spec / shock scenario / threshold phrasing / formula / nav noise) -- needs individual review.` };
}

function toCsv(rows, fields) {
  const esc = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [fields.join(','), ...rows.map((r) => fields.map((f) => esc(r[f])).join(','))].join('\n') + '\n';
}

function run() {
  const conflicts = provenance.filter((r) => r.classification === 'SOURCE_CONFLICT');
  const out = conflicts.map((r) => {
    const ev = evByClaim.get(r.claim_id);
    const c = classify(r, ev);
    return {
      claim_id: r.claim_id,
      source_file: ev.source_url,
      source_claim: ev.source_claim,
      parameter_id: r.parameter_id,
      environment: r.environment,
      claim_type: ev.claim_type,
      production_value: r.minimum === r.maximum ? r.minimum : `${r.minimum}-${r.maximum}`,
      production_unit: r.unit,
      source_id: c.source_id || '',
      source_value_if_available: c.source_value || '',
      conflict_type: c.conflict_type,
      conflict_reason: c.conflict_reason,
      resolution_status: c.resolution_status,
    };
  });

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const FIELDS = ['claim_id', 'source_file', 'source_claim', 'parameter_id', 'environment', 'claim_type',
    'production_value', 'production_unit', 'source_id', 'source_value_if_available',
    'conflict_type', 'conflict_reason', 'resolution_status'];
  fs.writeFileSync(path.join(OUT_DIR, 'conflicting-claims.csv'), toCsv(out, FIELDS));

  const byType = {}, byStatus = {};
  for (const r of out) { byType[r.conflict_type] = (byType[r.conflict_type] || 0) + 1; byStatus[r.resolution_status] = (byStatus[r.resolution_status] || 0) + 1; }
  console.log(`build-conflict-inventory: ${out.length} conflicts classified.`);
  console.log('by conflict_type:', byType);
  console.log('by resolution_status:', byStatus);
  fs.writeFileSync(path.join(OUT_DIR, 'conflict-inventory-summary.json'), JSON.stringify({ total: out.length, by_conflict_type: byType, by_resolution_status: byStatus }, null, 2) + '\n');
  return out;
}

if (require.main === module) run();
module.exports = { run, classify };
