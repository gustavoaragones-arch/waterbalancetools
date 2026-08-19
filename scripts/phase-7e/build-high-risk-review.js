#!/usr/bin/env node
'use strict';
/**
 * build-high-risk-review.js (Phase 7E, Step 7E.2)
 *
 * Produces reports/phase-7e/high-risk-provenance.csv (required schema:
 * claim_id, claim_text, parameter, production_context, source_id,
 * source_support, support_type, decision, notes) for the full 792-record
 * mechanically-classified review queue (SOURCE_CONFLICT / SOURCE_NOT_FOUND
 * / REQUIRES_EXPERT_REVIEW / SOURCE_PARTIALLY_RELEVANT from
 * provenance-mapping.csv), with MANUAL_OVERRIDES layered on top for the
 * ~45-record hand-reviewed sample (real source_claim text read directly,
 * reasoned individually -- see HIGH-RISK-PROVENANCE-REVIEW.md for the
 * narrative writeup of the patterns this sample surfaced).
 */
const fs = require('fs');
const path = require('path');
const { parseCsv } = require('../phase-7d-1/reconcile-claims-v2');

const ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'reports', 'phase-7e');

const evidence = parseCsv(fs.readFileSync(path.join(ROOT, 'reports', 'phase-7d-3', 'chemistry-evidence.csv'), 'utf8'));
const provenance = parseCsv(fs.readFileSync(path.join(OUT_DIR, 'provenance-mapping.csv'), 'utf8'));
const evByClaim = new Map(evidence.map((r) => [r.claim_id, r]));

// Manually reviewed, individually reasoned (Step 7E.2's "highest-impact
// claims, perform actual source research"). decision uses the required
// vocabulary: DIRECT | CONTEXTUAL | CORROBORATING | CONFLICTING |
// NOT_SUPPORTED for support_type, plus a free-text `decision` action.
const MANUAL_OVERRIDES = {
  'd1feb9238ca02179': { support_type: 'NOT_SUPPORTED', decision: 'RECLASSIFY_NOT_A_TRUE_CLAIM', source_id: 'cdc-healthy-swimming-home-treatment',
    notes: 'Worked example illustrating a BELOW-minimum reading ("0.8 ppm — below the 1.0 ppm minimum"), consistent with CDC\'s 1.0 ppm pool minimum, not a conflicting target. The 0.8 is deliberately the "bad" example value.' },
  'cf37c869eeb2535e': { support_type: 'NOT_SUPPORTED', decision: 'CORRECT_CLAIM_FAMILY_IS_SHOCK_NOT_ROUTINE',
    notes: 'Breakpoint-dose ADDITIONAL FC amount (5-15 ppm on top of existing), not a routine-maintenance target. No numeric shock-treatment FC range exists yet in chemistry-ranges.js (range-shock-breakpoint-rule-of-thumb has null bounds) to check this against -- architecture gap, not a factual error.' },
  '4f3c8d7a833aa00e': { support_type: 'NOT_SUPPORTED', decision: 'CORRECT_CLAIM_FAMILY_IS_SHOCK_NOT_ROUTINE',
    notes: 'Superchlorination/shock target (10 ppm min, 30 ppm for green pool), not routine FC. Same architecture gap as above.' },
  '2a47d9d16148407b': { support_type: 'NOT_SUPPORTED', decision: 'CORRECT_CLAIM_FAMILY_IS_SHOCK_NOT_ROUTINE',
    notes: 'Green-pool recovery treatment value ("hold FC above 5 ppm"), not routine maintenance. Same architecture gap.' },
  'cbae4569f8cc7a99': { support_type: 'NOT_SUPPORTED', decision: 'CORRECT_CLAIM_FAMILY_IS_SHOCK_NOT_ROUTINE',
    notes: 'Green-pool shock dose target table value (30 ppm), not routine FC. Same architecture gap.' },
  '9b5883473f17b6cd': { support_type: 'CONFLICTING', decision: 'CONTENT_CITES_0.5_MAHC_SAYS_0.4', source_id: 'cdc-mahc-2023',
    notes: 'Live-verified 2026-08-18 (cdc.gov/model-aquatic-health-code): MAHC action threshold is 0.4 ppm combined chlorine, not 0.5 ppm as this page states. See chemistry-ranges.js range-cc-pool-hottub-max (upgraded to SUPPORTED this phase). Common industry rule-of-thumb (0.5) vs. regulatory figure (0.4) -- documented, not silently rewritten in production content.' },
  '3bb0e016bca28ac0': { support_type: 'CONFLICTING', decision: 'CONTENT_CITES_0.5_MAHC_SAYS_0.4', source_id: 'cdc-mahc-2023', notes: 'Same 0.5-vs-0.4 discrepancy as above.' },
  '608025031537cf13': { support_type: 'CONFLICTING', decision: 'CONTENT_CITES_0.5_MAHC_SAYS_0.4', source_id: 'cdc-mahc-2023', notes: 'Same 0.5-vs-0.4 discrepancy as above.' },
  '317e0ea96af98f4f': { support_type: 'CONFLICTING', decision: 'CONTENT_CITES_0.5_MAHC_SAYS_0.4', source_id: 'cdc-mahc-2023', notes: 'Same 0.5-vs-0.4 discrepancy as above.' },
  '248766bcbb170afc': { support_type: 'NOT_SUPPORTED', decision: 'CORRECT_CLAIM_FAMILY_IS_SHOCK_NOT_ROUTINE',
    notes: 'Shock-dosage matrix table cell (breakpoint CC=2ppm column), not a routine combined-chlorine reading -- table-context number, correctly a different claim family.' },
  '50e6c9bc170f48cb': { support_type: 'NOT_SUPPORTED', decision: 'NO_TC_RANGE_EXISTS', notes: 'total_chlorine is a derived quantity (FC+CC); chemistry-ranges.js has no independent TC target, correctly so -- TC is checked via its FC/CC components, not its own range. No action needed.' },
  '9851053f2310edfc': { support_type: 'NOT_SUPPORTED', decision: 'NO_TC_RANGE_EXISTS', notes: 'Same -- derived-quantity table cell (CC<0.5 column, hot tub).' },
  'dc2f7d8b382b051a': { support_type: 'NOT_SUPPORTED', decision: 'NO_TC_RANGE_EXISTS', notes: 'Worked example (FC=1,TC=2,CC=1) demonstrating the FC+CC=TC relationship, not a target claim.' },
  '835135942b949948': { support_type: 'NOT_SUPPORTED', decision: 'NO_TC_RANGE_EXISTS', notes: 'Reference table "Total chlorine = Equal to FC" -- definitional, not a numeric target of its own.' },
  '9299059b0c52fc37': { support_type: 'NOT_SUPPORTED', decision: 'GENERIC_SANITIZER_NOT_CHLORINE_SPECIFIC',
    notes: '"sanitizer" used generically (could mean FC or bromine); 1 ppm floor / 3 ppm ceiling roughly brackets both CDC FC minimums and typical bromine ranges but is not itself a source-stated combined figure. Needs either splitting into chlorine-specific/bromine-specific claims or a dedicated generic-sanitizer source.' },
  '0b859f5f51df429e': { support_type: 'CONTEXTUAL', decision: 'MATCHES_CDC_HOTTUB_FC_RANGE', source_id: 'cdc-healthy-swimming-home-treatment',
    notes: '3-5 ppm matches CDC\'s hot-tub FC range exactly (range-fc-hottub-chlorine-routine), but the page calls it generic "sanitizer" not specifically free chlorine -- contextually correct, wording could be tightened.' },
  'f1438d90ac278246': { support_type: 'NOT_SUPPORTED', decision: 'PRODUCT_SPEC_NOT_A_WATER_TARGET',
    notes: '10-12.5% is the concentration of the liquid PRODUCT (sodium hypochlorite solution) as sold, not a pool-water sanitizer target. Different claim category entirely -- product datasheet fact, not a water-chemistry range. No canonical range should ever be checked against this.' },
  'f0aa2fe49c9ebe0b': { support_type: 'NOT_SUPPORTED', decision: 'PRODUCT_SPEC_NOT_A_WATER_TARGET', notes: 'Same as above -- product concentration, not a water target.' },
  'f35783d3997ced37': { support_type: 'NOT_SUPPORTED', decision: 'PRODUCT_SPEC_NOT_A_WATER_TARGET',
    notes: 'BCDMH TABLET available-bromine content (~54%), a product spec, not a pool/spa water bromine reading. Different claim category from range-bromine-hottub-routine (4-8 ppm water target).' },
  '2f4bb94f093a66b9': { support_type: 'NOT_SUPPORTED', decision: 'PRODUCT_SPEC_NOT_A_WATER_TARGET', notes: 'Same as above.' },
  'd28e07917260e4e1': { support_type: 'DIRECT', decision: 'ENVIRONMENT_LABEL_MISMATCH_VALUE_CORRECT', source_id: 'cdc-healthy-swimming-what-you-can-do-hot-tubs',
    notes: 'Value (3-6 ppm) matches range-bromine-hottub-routine\'s neighborhood; page environment is tagged "pool" but source text says "Hot tubs and spas: 3-6 ppm; Indoor pools: 3-6 ppm" -- environment tag reflects real ambiguity in the source sentence itself (both mentioned), not an extraction error.' },
  'd82f11165634fed9': { support_type: 'NOT_SUPPORTED', decision: 'EXTRACTION_ARTIFACT_WRONG_NUMBER',
    notes: '"Bromine target: 3-6 ppm (compared to 1-3 ppm for chlorine)" -- the 1-3 chlorine-comparison figure was extracted and attributed to bromine\'s clause via carry-forward; the sentence\'s actual bromine figure (3-6) is a different number in the same sentence. Extraction nuance, not a factual claim to source-check as written.' },
  'eab05ab89dd50a1d': { support_type: 'DIRECT', decision: 'MATCHES_CDC_RANGE', source_id: 'cdc-healthy-swimming-what-you-can-do-hot-tubs', notes: '3-6 ppm bromine matches CDC guidance closely; page environment tag "pool" reflects a generic sanitizer-comparison table, not pool-specific bromine use (bromine is rare in pools).' },
  '85e63d3bd7e63fa4': { support_type: 'DIRECT', decision: 'MATCHES_CDC_RANGE', source_id: 'cdc-healthy-swimming-what-you-can-do-hot-tubs', notes: 'Same as above.' },
  'c65671f3c42e4e14': { support_type: 'NOT_SUPPORTED', decision: 'LIKELY_TABLE_COLUMN_CROSSOVER',
    notes: 'Multi-column reference table ("Free Chlorine 2.0 3-5 10 ppm | Bromine 3.0 3-6 8 ppm"); the value 10 is Free Chlorine\'s MAXIMUM column, not Bromine\'s. Proximity-based extraction can cross-attribute values between adjacent table cells -- a residual extraction limitation for tabular content, not a chemistry error. Flagged for a future extraction-phase fix; not corrected here (out of 7E scope).' },
  'c89a3bddc3b1b53f': { support_type: 'NOT_SUPPORTED', decision: 'PRODUCT_PROPERTY_NOT_WATER_TARGET',
    notes: 'pH of trichlor TABLET IN SOLUTION (2.8), a product property explaining why trichlor is acidic, not a pool-water pH target. Different claim category from range-ph-pool-chlorine-routine.' },
  'd6a9ad3956c3ac1e': { support_type: 'NOT_SUPPORTED', decision: 'NON_CHEMISTRY_NUMERIC_LEAK', notes: '"Pool Calculators (5)" navigation count misattributed as a pH value via the blind 0-14 heuristic -- extraction noise (a documented residual limitation from Phase 7D.2), not a real pH claim.' },
  '4a98ad508554b03a': { support_type: 'NOT_SUPPORTED', decision: 'EXTRACTION_ARTIFACT', notes: 'Step-number ("2" from a numbered how-to list) misread as a pH value near a pH mention elsewhere on the page -- extraction noise.' },
  'f1beba341d8b64ec': { support_type: 'NOT_SUPPORTED', decision: 'CALCULATOR_TOLERANCE_NOT_A_TARGET', notes: '"accurate within +/-0.5 pH units" describes calculator precision, not a water pH target -- different claim category.' },
  'c16939cf183da1f1': { support_type: 'NOT_SUPPORTED', decision: 'PRINTABLE_LOG_TEMPLATE_NOT_A_CLAIM', notes: 'Printable log-sheet column header/template text, not an asserted pH value at all.' },
  'e306b2ab27ea0bba': { support_type: 'NOT_SUPPORTED', decision: 'NO_HOTTUB_TA_SOURCE', notes: 'TA 80-120 ppm for hot tubs matches the pool figure but no hot-tub-specific primary source was found in Phase 7D research (range-ta-hottub has empty source_ids) -- genuinely unresolved, not wrong.' },
  '6282257e297aa439': { support_type: 'NOT_SUPPORTED', decision: 'FORMULA_WORKED_EXAMPLE', notes: 'Intermediate arithmetic step in a dosage-formula worked example (not a target claim).' },
  '4116f12641743bc6': { support_type: 'NOT_SUPPORTED', decision: 'DOSAGE_COEFFICIENT_NOT_A_TARGET', notes: 'Sodium bicarbonate dosage coefficient (6.7 ppm TA rise per lb per 10,000 gal), a formula constant, not a TA target range.' },
  '04d38ac4be76e18e': { support_type: 'NOT_SUPPORTED', decision: 'THRESHOLD_ABOVE_RANGE_BY_DESIGN', notes: '"TA test reads above 150 ppm" is describing a HIGH-alkalinity troubleshooting scenario (intentionally above the 80-120 target) -- consistent with, not conflicting with, the target range.' },
  '445e945a10b5b5d2': { support_type: 'NOT_SUPPORTED', decision: 'PRODUCT_SPEC_NOT_A_WATER_TARGET', notes: 'Muriatic acid product concentration (31.45%) in a dosage-matrix record, not a TA water target.' },
  'c3f9bc82301d28a9': { support_type: 'NOT_SUPPORTED', decision: 'THRESHOLD_ABOVE_RANGE_BY_DESIGN', notes: '"CYA can reach problem levels (80-100 ppm)" is explicitly a too-high troubleshooting scenario, not a target claim -- correctly outside the 30-50 target range by design.' },
  '8f597df833684976': { support_type: 'DIRECT', decision: 'MATCHES_SITE_OWN_RANGE_NO_PRIMARY_SOURCE', notes: '30-50 ppm matches chemistry-ranges.js\'s own range-cya-residential-routine-outdoor exactly, but that range itself has no confirmed primary source (source_ids: []) -- genuinely unresolved pending research, not a conflict.' },
  'a68ba736892fa6c2': { support_type: 'NOT_SUPPORTED', decision: 'PRODUCT_SPEC_NOT_A_WATER_TARGET', notes: 'Trichlor tablet CYA-by-weight product spec (58%), not a pool-water CYA target.' },
  'd2df890efcd3800e': { support_type: 'NOT_SUPPORTED', decision: 'THRESHOLD_ABOVE_RANGE_BY_DESIGN', notes: 'Remediation-action threshold ("above 100 ppm: partial drain"), intentionally above the target range.' },
  '0bd0584cd48621c3': { support_type: 'NOT_SUPPORTED', decision: 'EQUIPMENT_DEPENDENT_NO_PRIMARY_SOURCE', notes: '2,700-3,400 ppm matches chemistry-ranges.js\'s own range-salt-generic-operating, but Phase 7D explicitly could not confirm a single manufacturer-independent primary source (salt targets are equipment-specific) -- genuinely unresolved, not wrong.' },
  '442e75ccd480df29': { support_type: 'NOT_SUPPORTED', decision: 'EQUIPMENT_DEPENDENT_NO_PRIMARY_SOURCE', notes: 'Same figure, same status, on the salt-water-pool-chemical-levels-chart page itself.' },
  'fdb04ff80c03a4dc': { support_type: 'NOT_SUPPORTED', decision: 'NO_TEMPERATURE_TARGET_SOURCE', notes: 'No source in the registry sets a water-temperature TARGET (CDC discusses temperature\'s effect on chemistry, not a temperature range to maintain) -- genuinely out of current source coverage, not an error.' },
  '25f154830055ac84': { support_type: 'NOT_SUPPORTED', decision: 'NO_TEMPERATURE_TARGET_SOURCE', notes: 'Same -- no primary source for a hot-tub temperature range in the current registry.' },
};

const queue = provenance.filter((r) => ['SOURCE_CONFLICT', 'SOURCE_NOT_FOUND', 'REQUIRES_EXPERT_REVIEW', 'SOURCE_PARTIALLY_RELEVANT'].includes(r.classification));

function toCsv(rows, fields) {
  const esc = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [fields.join(','), ...rows.map((r) => fields.map((f) => esc(r[f])).join(','))].join('\n') + '\n';
}

const out = queue.map((r) => {
  const ev = evByClaim.get(r.claim_id);
  const override = MANUAL_OVERRIDES[r.claim_id];
  return {
    claim_id: r.claim_id,
    claim_text: ev ? ev.source_claim : '',
    parameter: r.parameter_id,
    production_context: `${ev ? ev.source_url : ''} (env=${r.environment}, ${r.minimum}-${r.maximum} ${r.unit})`,
    source_id: override ? (override.source_id || '') : '',
    source_support: override ? 'MANUALLY_REVIEWED' : 'MECHANICAL_CLASSIFICATION_ONLY',
    support_type: override ? override.support_type : (r.support_type || 'NOT_SUPPORTED'),
    decision: override ? override.decision : r.classification,
    notes: override ? override.notes : r.review_notes,
  };
});

fs.writeFileSync(path.join(OUT_DIR, 'high-risk-provenance.csv'),
  toCsv(out, ['claim_id', 'claim_text', 'parameter', 'production_context', 'source_id', 'source_support', 'support_type', 'decision', 'notes']));

console.log(`build-high-risk-review: ${out.length} queue records written, ${Object.keys(MANUAL_OVERRIDES).length} individually hand-reviewed.`);
