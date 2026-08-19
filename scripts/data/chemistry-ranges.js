/**
 * chemistry-ranges.js
 *
 * Context-specific canonical range records (Phase 7D, Step 5).
 *
 * IMPORTANT: multiple records for the same parameter_id are expected and
 * correct when contexts differ (pool vs hot_tub, with/without CYA,
 * manufacturer-specific equipment targets, routine maintenance vs incident
 * response). Do not treat differing ranges as contradictions without first
 * checking environment/sanitizer/scenario -- see
 * reports/phase-7d/CHEMISTRY-CONFLICT-POLICY.md.
 *
 * status uses the same controlled vocabulary as chemistry-claims.js:
 *   VERIFIED | SUPPORTED | CONTEXTUAL | AMBIGUOUS | REQUIRES_REVIEW | UNSUPPORTED | DEPRECATED
 *
 * reviewed_by is intentionally null everywhere in this file: no subject-
 * matter-expert review process exists yet for this site (see
 * reports/phase-7d/PHASE-7D-CHEMISTRY-KNOWLEDGE.md). Inventing a reviewer
 * name is explicitly prohibited by the Phase 7D brief.
 */
'use strict';

const RANGES = [
  // ---- pH ----------------------------------------------------------------
  {
    id: 'range-ph-pool-chlorine-routine',
    parameter_id: 'ph',
    environment: 'pool', sanitizer: 'chlorine', scenario: 'routine_maintenance',
    minimum: 7.0, maximum: 7.8, target: 7.4, unit: 'pH_units', temperature_context: 'general',
    source_ids: ['cdc-healthy-swimming-home-treatment'],
    rationale: 'CDC states pH 7.0-7.8 best balances pathogen inactivation, swimmer comfort, and equipment/pipe lifespan for pools.',
    status: 'SUPPORTED', reviewed_by: null, reviewed_date: '2026-08-18',
  },
  {
    id: 'range-ph-hottub-chlorine-routine',
    parameter_id: 'ph',
    environment: 'hot_tub', sanitizer: 'chlorine', scenario: 'routine_maintenance',
    minimum: 7.0, maximum: 7.8, target: 7.4, unit: 'pH_units', temperature_context: 'elevated',
    source_ids: ['cdc-healthy-swimming-home-treatment'],
    rationale: 'CDC applies the same 7.0-7.8 pH guidance to hot tubs as to pools.',
    status: 'SUPPORTED', reviewed_by: null, reviewed_date: '2026-08-18',
  },
  {
    id: 'range-ph-hottub-bromine-routine',
    parameter_id: 'ph',
    environment: 'hot_tub', sanitizer: 'bromine', scenario: 'routine_maintenance',
    minimum: 7.0, maximum: 7.8, target: 7.4, unit: 'pH_units', temperature_context: 'elevated',
    source_ids: ['cdc-healthy-swimming-home-treatment'],
    rationale: 'No sanitizer-specific pH deviation was found in CDC guidance for bromine hot tubs; the general 7.0-7.8 range is treated as applying, pending a bromine-specific primary source.',
    status: 'CONTEXTUAL', reviewed_by: null, reviewed_date: '2026-08-18',
  },
  {
    id: 'range-ph-pool-narrow-operational',
    parameter_id: 'ph',
    environment: 'pool', sanitizer: 'unspecified', scenario: 'target_range',
    minimum: 7.2, maximum: 7.6, target: 7.4, unit: 'pH_units', temperature_context: 'general',
    source_ids: [],
    rationale: 'A narrower 7.2-7.6 "sweet spot" is widely used in industry practice (and in this site\'s own existing calculator copy) as an operational target tighter than CDC\'s outer 7.0-7.8 acceptable range. No primary/professional source for the narrower band was confirmed during Phase 7D research.',
    status: 'REQUIRES_REVIEW', reviewed_by: null, reviewed_date: '2026-08-18',
  },

  // ---- Free Chlorine -------------------------------------------------------
  {
    id: 'range-fc-pool-chlorine-no-cya',
    parameter_id: 'free_chlorine',
    environment: 'pool', sanitizer: 'chlorine', scenario: 'routine_maintenance', cya_present: false,
    minimum: 1.0, maximum: 3.0, target: 2.0, unit: 'ppm', temperature_context: 'general',
    source_ids: ['cdc-healthy-swimming-home-treatment', 'cdc-mahc-2023'],
    rationale: 'CDC: at least 1 ppm free chlorine in pools. MAHC: 1.0-3.0 ppm FAC range for traditional (non-CYA-stabilized) chlorinated pools.',
    status: 'SUPPORTED', reviewed_by: null, reviewed_date: '2026-08-18',
  },
  {
    id: 'range-fc-pool-chlorine-with-cya',
    parameter_id: 'free_chlorine',
    environment: 'pool', sanitizer: 'chlorine', scenario: 'routine_maintenance', cya_present: true,
    minimum: 2.0, maximum: 4.0, target: 3.0, unit: 'ppm', temperature_context: 'general',
    source_ids: ['cdc-healthy-swimming-home-treatment', 'cdc-mahc-2023'],
    rationale: 'CDC: at least 2 ppm free chlorine in pools using cyanuric acid / stabilized chlorine products. MAHC: 2.0-4.0 ppm FAC range for CYA-stabilized pools.',
    status: 'SUPPORTED', reviewed_by: null, reviewed_date: '2026-08-18',
  },
  {
    id: 'range-fc-hottub-chlorine-routine',
    parameter_id: 'free_chlorine',
    environment: 'hot_tub', sanitizer: 'chlorine', scenario: 'routine_maintenance',
    minimum: 3.0, maximum: 5.0, target: 4.0, unit: 'ppm', temperature_context: 'elevated',
    source_ids: ['cdc-healthy-swimming-home-treatment'],
    rationale: 'CDC: at least 3 ppm free chlorine in hot tubs (higher minimum than pools due to elevated temperature and smaller water volume). CDC additionally recommends NOT using cyanuric acid or stabilized chlorine products in hot tubs at all, so no CYA-adjusted hot-tub FC record exists.',
    status: 'SUPPORTED', reviewed_by: null, reviewed_date: '2026-08-18',
  },

  // ---- Combined Chlorine ---------------------------------------------------
  {
    id: 'range-cc-pool-hottub-max',
    parameter_id: 'combined_chlorine',
    environment: 'pool', sanitizer: 'chlorine', scenario: 'routine_maintenance',
    minimum: 0, maximum: 0.4, target: 0, unit: 'ppm', temperature_context: 'general',
    source_ids: ['cdc-mahc-2023'],
    // Verified 2026-08-18 during Phase 7E.2 provenance review (live search
    // against cdc.gov/model-aquatic-health-code): MAHC requires the
    // facility to act when combined chlorine exceeds 0.4 ppm (mg/L), which
    // confirms the specific numeric clause this phase's earlier research
    // (Phase 7D) had left unconfirmed. Site content frequently cites a
    // "0.5 ppm" combined-chlorine shock threshold instead -- a common
    // consumer/industry rule-of-thumb, not the MAHC public-pool regulatory
    // figure. That discrepancy is documented, not silently corrected in
    // production content -- see reports/phase-7e/HIGH-RISK-PROVENANCE-REVIEW.md.
    rationale: 'MAHC requires action to reduce combined chlorine when it exceeds 0.4 ppm (mg/L) at public aquatic facilities.',
    status: 'SUPPORTED', reviewed_by: null, reviewed_date: '2026-08-18',
  },

  // ---- Total Alkalinity -----------------------------------------------------
  {
    id: 'range-ta-public-pool-standard',
    parameter_id: 'total_alkalinity',
    environment: 'pool', sanitizer: 'unspecified', scenario: 'target_range',
    minimum: 60, maximum: 180, target: null, unit: 'ppm', temperature_context: 'general',
    source_ids: ['ansi-phta-11-2019'],
    rationale: 'ANSI/APSP/ICC-11 2019 standard: total alkalinity 60-180 ppm as CaCO3 for public pools/spas.',
    status: 'SUPPORTED', reviewed_by: null, reviewed_date: '2026-08-18',
  },
  {
    id: 'range-ta-residential-practical',
    parameter_id: 'total_alkalinity',
    environment: 'pool', sanitizer: 'unspecified', scenario: 'target_range',
    minimum: 80, maximum: 120, target: 100, unit: 'ppm', temperature_context: 'general',
    source_ids: ['phta-total-alkalinity-fact-sheet'],
    rationale: 'Narrower practical residential operating target commonly used in industry guidance, inside the wider ANSI/APSP-11 acceptable band. Treated as CONTEXTUAL (a tighter operational target within a wider acceptable standard), not a contradiction.',
    status: 'CONTEXTUAL', reviewed_by: null, reviewed_date: '2026-08-18',
  },
  {
    id: 'range-ta-hottub',
    parameter_id: 'total_alkalinity',
    environment: 'hot_tub', sanitizer: 'unspecified', scenario: 'target_range',
    minimum: 80, maximum: 120, target: 100, unit: 'ppm', temperature_context: 'elevated',
    source_ids: [],
    rationale: 'No hot-tub-specific primary/professional total-alkalinity source was confirmed during this phase; the pool practical range is carried over pending dedicated research.',
    status: 'REQUIRES_REVIEW', reviewed_by: null, reviewed_date: '2026-08-18',
  },

  // ---- Calcium Hardness ------------------------------------------------------
  {
    id: 'range-ch-public-pool-standard',
    parameter_id: 'calcium_hardness',
    environment: 'pool', sanitizer: 'unspecified', scenario: 'target_range',
    minimum: 150, maximum: 1000, target: null, unit: 'ppm', temperature_context: 'general',
    source_ids: ['ansi-phta-11-2019'],
    rationale: 'ANSI/APSP/ICC-11 2019 standard: calcium hardness 150-1,000 ppm acceptable for public pools.',
    status: 'SUPPORTED', reviewed_by: null, reviewed_date: '2026-08-18',
  },
  {
    id: 'range-ch-residential-practical',
    parameter_id: 'calcium_hardness',
    environment: 'pool', sanitizer: 'unspecified', scenario: 'target_range',
    minimum: 200, maximum: 400, target: 300, unit: 'ppm', temperature_context: 'general',
    source_ids: [],
    rationale: 'Commonly-cited narrower residential practical range, inside the wider ANSI/APSP-11 acceptable band. No primary/professional source specifically for the 200-400 ppm residential figure was confirmed during this phase; treated as a plausible but unverified narrower operational target.',
    status: 'REQUIRES_REVIEW', reviewed_by: null, reviewed_date: '2026-08-18',
  },

  // ---- Cyanuric Acid -----------------------------------------------------------
  {
    id: 'range-cya-public-pool-incident-response-max',
    parameter_id: 'cyanuric_acid',
    environment: 'pool', sanitizer: 'chlorine', scenario: 'treatment',
    minimum: 0, maximum: 15, target: null, unit: 'ppm', temperature_context: 'general',
    source_ids: ['cdc-mahc-2023'],
    rationale: 'MAHC specifies CYA must be reduced to <=15 ppm as part of the specific Cryptosporidium-contamination response protocol, so that elevated free chlorine can inactivate the pathogen effectively. This is an INCIDENT-RESPONSE threshold, not a general residential operating ceiling -- do not conflate with routine maintenance guidance.',
    status: 'SUPPORTED', reviewed_by: null, reviewed_date: '2026-08-18',
  },
  {
    id: 'range-cya-residential-routine-outdoor',
    parameter_id: 'cyanuric_acid',
    environment: 'pool', sanitizer: 'chlorine', scenario: 'routine_maintenance',
    minimum: 30, maximum: 50, target: 40, unit: 'ppm', temperature_context: 'general',
    source_ids: [],
    rationale: 'Widely cited industry-practice range for routine outdoor residential pool CYA (to provide UV protection without excessive chlorine-demand suppression). No primary/professional source specifically endorsing 30-50 ppm as a routine maintenance target was confirmed during this phase\'s research -- flagged for expert review rather than asserted as CDC/MAHC-backed.',
    status: 'REQUIRES_REVIEW', reviewed_by: null, reviewed_date: '2026-08-18',
  },
  {
    id: 'range-cya-saltwater-outdoor',
    parameter_id: 'cyanuric_acid',
    environment: 'pool', sanitizer: 'saltwater_chlorine_generator', scenario: 'routine_maintenance',
    minimum: 60, maximum: 80, target: 70, unit: 'ppm', temperature_context: 'general',
    source_ids: [],
    rationale: 'Asserted in this site\'s existing production content (scripts/data/academy-equipment.js) for outdoor saltwater pools -- a materially higher, non-overlapping range than the 30-50 ppm figure used elsewhere on the site for general outdoor residential pools (see range-cya-residential-routine-outdoor). No chemical mechanism was confirmed during this phase that would require a saltwater-generated-chlorine pool to run CYA meaningfully higher than a tablet/liquid-chlorinated pool for the same UV-protection purpose. Flagged explicitly for expert review despite being mechanically classified as a "different sanitizer context" by the consistency-matrix script -- see reports/phase-7d/HIGH-RISK-CHEMISTRY-CLAIMS.md.',
    status: 'REQUIRES_REVIEW', reviewed_by: null, reviewed_date: '2026-08-18',
  },
  {
    id: 'range-cya-hottub',
    parameter_id: 'cyanuric_acid',
    environment: 'hot_tub', sanitizer: 'chlorine', scenario: 'routine_maintenance',
    minimum: 0, maximum: 0, target: 0, unit: 'ppm', temperature_context: 'elevated',
    source_ids: ['cdc-healthy-swimming-home-treatment'],
    rationale: 'CDC explicitly recommends NOT using cyanuric acid or chlorine products containing cyanuric acid in hot tubs.',
    status: 'SUPPORTED', reviewed_by: null, reviewed_date: '2026-08-18',
  },

  // ---- Salt (saltwater chlorine generators) --------------------------------------
  {
    id: 'range-salt-generic-operating',
    parameter_id: 'salt',
    environment: 'pool', sanitizer: 'saltwater_chlorine_generator', scenario: 'target_range',
    minimum: 2700, maximum: 3400, target: 3200, unit: 'ppm', temperature_context: 'general',
    source_ids: [],
    rationale: 'A commonly-cited generic operating range across salt-chlorine-generator marketing/technical material, described in industry sources as an approximate "universal" figure. No ANSI/NSF or CDC source specifying this exact band was confirmed; individual equipment manufacturers specify materially different targets (see manufacturer-specific records below), so this generic figure should be treated as a rough industry midpoint, not an authoritative target.',
    status: 'REQUIRES_REVIEW', reviewed_by: null, reviewed_date: '2026-08-18',
  },
  {
    id: 'range-salt-pentair',
    parameter_id: 'salt',
    environment: 'pool', sanitizer: 'saltwater_chlorine_generator', scenario: 'target_range',
    minimum: 3200, maximum: 3800, target: 3500, unit: 'ppm', temperature_context: 'general',
    source_ids: [],
    rationale: 'Pentair-brand salt chlorine generators are reported (secondary/manufacturer-adjacent sources) to target 3,500 ppm +/- 300 ppm. This is manufacturer-specific equipment guidance, not a universal water-chemistry standard -- a calculator or content page must state which brand/equipment a salt target applies to.',
    status: 'CONTEXTUAL', reviewed_by: null, reviewed_date: '2026-08-18',
  },
  {
    id: 'range-salt-autopilot',
    parameter_id: 'salt',
    environment: 'pool', sanitizer: 'saltwater_chlorine_generator', scenario: 'target_range',
    minimum: 3600, maximum: 4400, target: 4000, unit: 'ppm', temperature_context: 'general',
    source_ids: [],
    rationale: 'AutoPilot-brand salt chlorine generators are reported (secondary/manufacturer-adjacent sources) to target approximately 4,000 ppm. Manufacturer-specific equipment guidance, distinct from the Pentair target above -- both are legitimate, context-different values for different equipment, not a contradiction.',
    status: 'CONTEXTUAL', reviewed_by: null, reviewed_date: '2026-08-18',
  },

  // ---- Bromine ------------------------------------------------------------------
  {
    id: 'range-bromine-hottub-routine',
    parameter_id: 'bromine',
    environment: 'hot_tub', sanitizer: 'bromine', scenario: 'routine_maintenance',
    minimum: 4.0, maximum: 8.0, target: 5.0, unit: 'ppm', temperature_context: 'elevated',
    source_ids: ['cdc-healthy-swimming-what-you-can-do-hot-tubs'],
    rationale: 'CDC hot-tub guidance references a 4-8 ppm bromine range; some secondary industry sources cite a narrower practical 3-5 ppm operating target inside this range.',
    status: 'SUPPORTED', reviewed_by: null, reviewed_date: '2026-08-18',
  },

  // ---- Shock treatment ------------------------------------------------------------
  {
    id: 'range-shock-breakpoint-rule-of-thumb',
    parameter_id: 'shock_treatment',
    environment: 'pool', sanitizer: 'chlorine', scenario: 'shock',
    minimum: null, maximum: null, target: null, unit: 'multiplier_of_combined_chlorine',
    temperature_context: 'general',
    source_ids: [],
    rationale: 'Widely repeated industry rule of thumb: dose free chlorine to approximately 10x the current combined-chlorine reading to reach breakpoint chlorination. This is a heuristic, not a CDC/MAHC numeric standard, and its applicability depends on the combined-chlorine reading being reasonably accurate.',
    status: 'REQUIRES_REVIEW', reviewed_by: null, reviewed_date: '2026-08-18',
  },
  {
    id: 'range-shock-cdc-fecal-incident-response',
    parameter_id: 'shock_treatment',
    environment: 'pool', sanitizer: 'chlorine', scenario: 'treatment',
    minimum: 20, maximum: 20, target: 20, unit: 'ppm', temperature_context: 'general',
    source_ids: ['cdc-mahc-2023'],
    rationale: 'CDC/MAHC fecal-incident response: raise free chlorine to 20 ppm and maintain for approximately 13 hours for a formed-stool incident, or 20 ppm for ~28 hours at pH<=7.5 with CYA<=15 ppm for a diarrheal/Cryptosporidium incident. This is safety/incident-response guidance for public facilities, not routine residential shock dosing -- do not present as routine maintenance guidance.',
    status: 'SUPPORTED', reviewed_by: null, reviewed_date: '2026-08-18',
  },
];

const RANGES_BY_ID = Object.fromEntries(RANGES.map((r) => [r.id, r]));
function rangesForParameter(parameterId) {
  return RANGES.filter((r) => r.parameter_id === parameterId);
}

module.exports = { RANGES, RANGES_BY_ID, rangesForParameter };
