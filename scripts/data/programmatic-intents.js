'use strict';
/**
 * programmatic-intents.js (Phase 7G, Steps 3-4)
 *
 * Canonical intent taxonomy + per-page intent contract for the primary-
 * scope programmatic families (chlorine, ph, shock, hot-tubs). Built from
 * the real cluster-config volume/level lists already driving the
 * generators (scripts/generators/*-cluster-config.js) -- not invented.
 *
 * This is the single canonical intent registry; generators and audit
 * scripts should read from here rather than re-deriving intent labels.
 */

const CHLORINE_VOLUMES = [5000, 7000, 8000, 9000, 10000, 12000, 15000, 18000, 20000, 25000, 30000];
const SHOCK_VOLUMES = [5000, 10000, 15000, 20000, 25000, 30000];
const PH_LEVELS = [
  { from: 6.8, to: 7.2 },
  { from: 7.8, to: 7.4 },
  { from: 7.0, to: 7.4 },
  { from: 8.0, to: 7.5 },
];
const HOTTUB_SIZES = [200, 300, 400, 500, 600];

function sizeClass(volume, small, large) {
  return volume < small ? 'small' : volume <= large ? 'medium' : 'large';
}

const INTENTS = [];

for (const v of CHLORINE_VOLUMES) {
  INTENTS.push({
    page_id: `chlorine-${v}`,
    url: `programmatic/chlorine/how-much-chlorine-for-${v}-gallon-pool.html`,
    family: 'chlorine',
    primary_intent: 'dose_by_pool_volume',
    secondary_intent: 'pool_size_classification',
    environment: 'pool',
    parameter: 'free_chlorine',
    scenario: 'routine_adjustment',
    user_question: `How much chlorine does a ${v.toLocaleString()}-gallon pool need?`,
    answer_type: 'calculated_dose_table',
    claim_family: 'claim-fc-pool-no-cya',
    differentiation_reason: `User knows their own pool's volume (${v.toLocaleString()} gal) and needs dosing amounts scaled to that specific volume -- the computed oz-per-ppm table and size classification are genuinely page-specific, not reworded text.`,
  });
}

for (const v of SHOCK_VOLUMES) {
  INTENTS.push({
    page_id: `shock-${v}`,
    url: `programmatic/shock/how-much-shock-for-${v}-gallon-pool.html`,
    family: 'shock',
    primary_intent: 'shock_dose_by_pool_volume',
    secondary_intent: 'pool_size_classification',
    environment: 'pool',
    parameter: 'shock_treatment',
    scenario: 'shock',
    user_question: `How much shock does a ${v.toLocaleString()}-gallon pool need?`,
    answer_type: 'calculated_dose_table',
    claim_family: 'claim-shock-breakpoint-rule',
    differentiation_reason: `User knows their own pool's volume and needs shock ounces scaled to that specific volume -- computed table and size classification are page-specific.`,
  });
}

for (const lvl of PH_LEVELS) {
  const raise = lvl.to > lvl.from;
  INTENTS.push({
    page_id: `ph-${lvl.from}-${lvl.to}`,
    url: `programmatic/ph/how-to-adjust-ph-from-${String(lvl.from).replace('.', '-')}-to-${String(lvl.to).replace('.', '-')}.html`,
    family: 'ph',
    primary_intent: raise ? 'raise_ph_scenario' : 'lower_ph_scenario',
    secondary_intent: 'ph_drift_cause',
    environment: 'pool',
    parameter: 'ph',
    scenario: 'target_adjustment',
    user_question: `How do I adjust pool pH from ${lvl.from} to ${lvl.to}?`,
    answer_type: 'calculated_dose_reference',
    claim_family: 'claim-ph-pool-routine',
    differentiation_reason: `Distinct starting/target pH pair (a real, specific test-strip reading a user has in hand) with a genuinely different product (increaser vs. reducer) and different likely cause (low vs. high pH) -- not a cosmetic variant.`,
  });
}

for (const s of HOTTUB_SIZES) {
  INTENTS.push({
    page_id: `hottub-${s}`,
    url: `programmatic/hot-tubs/hot-tub-chemicals-for-${s}-gallons.html`,
    family: 'hot-tubs',
    primary_intent: 'sanitizer_dose_by_spa_volume',
    secondary_intent: 'spa_size_classification',
    environment: 'hot_tub',
    parameter: 'free_chlorine',
    scenario: 'routine_adjustment',
    user_question: `What chemicals does a ${s}-gallon hot tub need?`,
    answer_type: 'calculated_dose_table',
    claim_family: 'claim-fc-hottub-routine',
    differentiation_reason: `User knows their own spa's volume and needs sanitizer amounts scaled to that specific volume -- computed table and size classification are page-specific.`,
  });
}

module.exports = { INTENTS, CHLORINE_VOLUMES, SHOCK_VOLUMES, PH_LEVELS, HOTTUB_SIZES, sizeClass };
