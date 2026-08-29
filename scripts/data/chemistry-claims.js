/**
 * chemistry-claims.js
 *
 * Canonical claim-to-source mapping (Phase 7D, Step 7). This is the
 * controlled set of archetypal chemistry claims the site makes, each tied
 * to a parameter, context, canonical range (if numeric), and source(s).
 *
 * This is NOT a per-page transcription of all 3,928 extracted claims from
 * Phase 7A -- that reconciliation (Step 8) is a programmatic classification
 * of each extracted claim against this canonical set, produced as
 * reports/phase-7d/chemistry-coverage.csv by
 * scripts/phase-7d/reconcile-claims.js. This file is the reference the
 * reconciliation script classifies against.
 *
 * status vocabulary (shared with chemistry-ranges.js):
 *   VERIFIED         -- cross-checked against >=2 independent primary/
 *                        professional sources with no unresolved disagreement
 *   SUPPORTED         -- a primary/professional source substantively supports it
 *   CONTEXTUAL        -- correct within a specific, named context; would be
 *                        misleading stated as universal
 *   AMBIGUOUS         -- claim as worded doesn't specify enough context to
 *                        classify confidently
 *   REQUIRES_REVIEW   -- plausible industry claim, no primary source confirmed
 *   UNSUPPORTED       -- no credible source found; treat with caution
 *   DEPRECATED        -- superseded by a newer canonical claim
 *
 * Nothing here is marked VERIFIED: this phase found single-source support
 * for most parameters, which meets the bar for SUPPORTED, not VERIFIED.
 */
'use strict';

const CLAIMS = [
  {
    claim_id: 'claim-ph-pool-routine',
    parameter_id: 'ph', context: { environment: 'pool', sanitizer: 'chlorine', scenario: 'routine_maintenance' },
    claim_text: 'Pool pH should be maintained between 7.0 and 7.8 (commonly targeted around 7.2-7.6) for pathogen control, swimmer comfort, and equipment protection.',
    range_id: 'range-ph-pool-chlorine-routine', source_ids: ['cdc-healthy-swimming-home-treatment'], status: 'SUPPORTED',
  },
  {
    claim_id: 'claim-ph-hottub-routine',
    parameter_id: 'ph', context: { environment: 'hot_tub', sanitizer: 'chlorine', scenario: 'routine_maintenance' },
    claim_text: 'Hot tub pH should be maintained between 7.0 and 7.8.',
    range_id: 'range-ph-hottub-chlorine-routine', source_ids: ['cdc-healthy-swimming-home-treatment'], status: 'SUPPORTED',
  },
  {
    claim_id: 'claim-fc-pool-no-cya',
    parameter_id: 'free_chlorine', context: { environment: 'pool', sanitizer: 'chlorine', scenario: 'routine_maintenance' },
    claim_text: 'Pool free chlorine should be at least 1 ppm, commonly targeted in a 1-3 ppm range for unstabilized chlorine.',
    range_id: 'range-fc-pool-chlorine-no-cya', source_ids: ['cdc-healthy-swimming-home-treatment', 'cdc-mahc-2023'], status: 'SUPPORTED',
  },
  {
    claim_id: 'claim-fc-pool-with-cya',
    parameter_id: 'free_chlorine', context: { environment: 'pool', sanitizer: 'chlorine', scenario: 'routine_maintenance', cya_present: true },
    claim_text: 'Pool free chlorine should be at least 2 ppm when cyanuric acid / stabilized chlorine products are used, commonly targeted in a 2-4 ppm range.',
    range_id: 'range-fc-pool-chlorine-with-cya', source_ids: ['cdc-healthy-swimming-home-treatment', 'cdc-mahc-2023'], status: 'SUPPORTED',
  },
  {
    claim_id: 'claim-fc-hottub-routine',
    parameter_id: 'free_chlorine', context: { environment: 'hot_tub', sanitizer: 'chlorine', scenario: 'routine_maintenance' },
    claim_text: 'Hot tub free chlorine should be at least 3 ppm, commonly targeted in a 3-5 ppm range.',
    range_id: 'range-fc-hottub-chlorine-routine', source_ids: ['cdc-healthy-swimming-home-treatment'], status: 'SUPPORTED',
  },
  {
    claim_id: 'claim-cya-hottub-avoid',
    parameter_id: 'cyanuric_acid', context: { environment: 'hot_tub', sanitizer: 'chlorine', scenario: 'routine_maintenance' },
    claim_text: 'Cyanuric acid / stabilized chlorine products should not be used in hot tubs.',
    range_id: 'range-cya-hottub', source_ids: ['cdc-healthy-swimming-home-treatment'], status: 'SUPPORTED',
  },
  {
    claim_id: 'claim-cya-routine-outdoor',
    parameter_id: 'cyanuric_acid', context: { environment: 'pool', sanitizer: 'chlorine', scenario: 'routine_maintenance' },
    claim_text: 'Outdoor residential pool CYA is commonly targeted in a 30-50 ppm range for UV protection.',
    range_id: 'range-cya-residential-routine-outdoor', source_ids: [], status: 'REQUIRES_REVIEW',
  },
  {
    claim_id: 'claim-cya-max-incident-response',
    parameter_id: 'cyanuric_acid', context: { environment: 'pool', sanitizer: 'chlorine', scenario: 'treatment' },
    claim_text: 'CYA above roughly 100 ppm (or above 15 ppm during a specific contamination-response protocol) impairs chlorine\'s disinfection speed.',
    range_id: 'range-cya-public-pool-incident-response-max', source_ids: ['cdc-mahc-2023'], status: 'CONTEXTUAL',
  },
  {
    claim_id: 'claim-ta-target',
    parameter_id: 'total_alkalinity', context: { environment: 'pool', sanitizer: 'unspecified', scenario: 'target_range' },
    claim_text: 'Total alkalinity should be maintained between roughly 80-120 ppm (acceptable range 60-180 ppm per public-pool standards).',
    range_id: 'range-ta-residential-practical', source_ids: ['ansi-phta-11-2019', 'phta-total-alkalinity-fact-sheet'], status: 'SUPPORTED',
  },
  {
    claim_id: 'claim-ch-target',
    parameter_id: 'calcium_hardness', context: { environment: 'pool', sanitizer: 'unspecified', scenario: 'target_range' },
    claim_text: 'Calcium hardness should be maintained between roughly 200-400 ppm (acceptable range 150-1,000 ppm per public-pool standards).',
    range_id: 'range-ch-public-pool-standard', source_ids: ['ansi-phta-11-2019'], status: 'SUPPORTED',
  },
  {
    claim_id: 'claim-salt-generic',
    parameter_id: 'salt', context: { environment: 'pool', sanitizer: 'saltwater_chlorine_generator', scenario: 'target_range' },
    claim_text: 'Saltwater pools are commonly targeted around 3,200 ppm salt, with an acceptable range of roughly 2,700-3,400 ppm.',
    range_id: 'range-salt-generic-operating', source_ids: [], status: 'REQUIRES_REVIEW',
  },
  {
    claim_id: 'claim-bromine-hottub',
    parameter_id: 'bromine', context: { environment: 'hot_tub', sanitizer: 'bromine', scenario: 'routine_maintenance' },
    claim_text: 'Hot tub bromine should be maintained in a 4-8 ppm range.',
    range_id: 'range-bromine-hottub-routine', source_ids: ['cdc-healthy-swimming-what-you-can-do-hot-tubs'], status: 'SUPPORTED',
  },
  {
    claim_id: 'claim-shock-breakpoint-rule',
    parameter_id: 'shock_treatment', context: { environment: 'pool', sanitizer: 'chlorine', scenario: 'shock' },
    claim_text: 'To reach breakpoint chlorination, dose free chlorine to approximately 10x the current combined chlorine reading.',
    // Phase 7R: upgraded from REQUIRES_REVIEW -- Indiana Department of
    // Health (government/public-health authority, read in full) states
    // "The breakpoint chlorination value is 10 times the combined
    // chlorine (CC) level," an almost verbatim match.
    range_id: 'range-shock-breakpoint-rule-of-thumb', source_ids: ['in-doh-breakpoint-chlorination-2022'], status: 'SUPPORTED',
  },
  {
    // Added Phase 7E.1 (Step 3): distinct claim family for the public-pool
    // fecal/contamination incident-response protocol, deliberately
    // separate from routine shock/breakpoint guidance above -- these are
    // different scenarios with a different source and a different
    // (absolute, not relative) numeric target. Fixes an orphan-range
    // warning (range-shock-cdc-fecal-incident-response existed but no
    // canonical claim referenced it) and gives evidence records that
    // genuinely describe this specific protocol something real to resolve
    // against, without inventing a general numeric shock-FC target that no
    // primary source confirms -- see SHOCK-CLAIM-FAMILY-DECISION.md.
    claim_id: 'claim-shock-fecal-incident-response',
    parameter_id: 'shock_treatment', context: { environment: 'pool', sanitizer: 'chlorine', scenario: 'treatment' },
    claim_text: 'For a fecal/diarrheal contamination incident at a public aquatic facility, raise free chlorine to 20 ppm for approximately 13 hours (general incident), or, when CYA has been reduced to 15 ppm or below, maintain 20 ppm FC for approximately 28 hours at pH 7.5 or below for Cryptosporidium inactivation.',
    range_id: 'range-shock-cdc-fecal-incident-response', source_ids: ['cdc-mahc-2023'], status: 'SUPPORTED',
  },
  {
    claim_id: 'claim-mixing-chemicals-danger',
    parameter_id: 'sanitizer', context: { environment: 'pool', sanitizer: 'unspecified', scenario: 'safety_guidance' },
    claim_text: 'Never mix pool chemicals together (especially chlorine and acid); doing so can release toxic gas or cause a violent reaction.',
    range_id: null, source_ids: ['cdc-pool-chemical-safety-toolkit', 'npic-pool-spa-chemicals-fact-sheet', 'cdc-mmwr-pool-chemical-injuries'], status: 'SUPPORTED',
  },
  {
    claim_id: 'claim-cc-minimize',
    parameter_id: 'combined_chlorine', context: { environment: 'pool', sanitizer: 'chlorine', scenario: 'routine_maintenance' },
    claim_text: 'Combined chlorine should be kept as close to zero as possible; noticeable combined chlorine indicates a need for shock treatment.',
    range_id: 'range-cc-pool-hottub-max', source_ids: ['cdc-mahc-2023'], status: 'SUPPORTED',
    // Upgraded from REQUIRES_REVIEW 2026-08-18 during Phase 7E.2 -- see
    // range-cc-pool-hottub-max in chemistry-ranges.js for the verification.
  },
  {
    // Added Phase 7L (Step 3): distinct from the generic
    // claim-mixing-chemicals-danger above -- this is the specific
    // trichlor + calcium hypochlorite pairing, resolved in Phase 7K with
    // two manufacturer SDS documents naming the opposing chemical and the
    // fire/explosion consequence explicitly, not a generic "don't mix
    // chemicals" inference.
    claim_id: 'claim-trichlor-calhypo-mixing-hazard',
    parameter_id: 'sanitizer', context: { environment: 'pool', sanitizer: 'chlorine', scenario: 'safety_guidance' },
    claim_text: 'Trichlor tablets should not be mixed with calcium hypochlorite -- doing so carries a fire and explosion risk.',
    range_id: null, source_ids: ['microphor-trichlor-sds-2016', 'asepsis-calhypo-msds-2005'], status: 'SUPPORTED',
  },
  {
    // Added Phase 7L. Distinct scenario from claim-shock-breakpoint-rule
    // (routine/generic, REQUIRES_REVIEW) and claim-shock-fecal-incident-
    // response (public-facility contamination protocol, SUPPORTED) --
    // green-algae recovery is its own scenario per Phase 7K's research and
    // the Director's explicit "distinct scenarios" instruction.
    claim_id: 'claim-shock-algae-recovery-green',
    parameter_id: 'shock_treatment', context: { environment: 'pool', sanitizer: 'chlorine', scenario: 'algae_recovery' },
    claim_text: 'Recovering from a green algae bloom requires breakpoint-chlorinating to approximately 30 ppm free chlorine.',
    range_id: 'range-shock-algae-recovery-green', source_ids: ['poolspanews-algae-breakpoint-2016'], status: 'CONTEXTUAL',
  },
  {
    // Added Phase 7L. Hot-tub-specific safety ceiling, not a comfort target
    // range -- see range-temperature-hottub-max-safety's rationale.
    claim_id: 'claim-temperature-hottub-safety-max',
    parameter_id: 'water_temperature', context: { environment: 'hot_tub', sanitizer: 'unspecified', scenario: 'safety_guidance' },
    claim_text: 'Hot tub water temperature above 104°F (40°C) is a safety hazard and can cause hyperthermia.',
    range_id: 'range-temperature-hottub-max-safety', source_ids: ['cmahc-mahc-5th-edition-2024'], status: 'SUPPORTED',
  },
];

const CLAIMS_BY_ID = Object.fromEntries(CLAIMS.map((c) => [c.claim_id, c]));
function claimsForParameter(parameterId) {
  return CLAIMS.filter((c) => c.parameter_id === parameterId);
}

const STATUS_VALUES = ['VERIFIED', 'SUPPORTED', 'CONTEXTUAL', 'AMBIGUOUS', 'REQUIRES_REVIEW', 'UNSUPPORTED', 'DEPRECATED'];

module.exports = { CLAIMS, CLAIMS_BY_ID, claimsForParameter, STATUS_VALUES };
