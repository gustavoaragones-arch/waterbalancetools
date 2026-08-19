/**
 * chemistry-claim-family-map.js (Phase 7E, Step 7E.1)
 *
 * Explicit, hand-authored mapping from (parameter_id, environment) to the
 * canonical claim family (or families) in chemistry-claims.js that governs
 * it. This is the "CLAIM FAMILY" layer the Phase 7E brief calls for,
 * sitting between individual evidence records and the source registry.
 *
 * This file does NOT decide whether any specific evidence record is
 * supported -- it only says "if you want to know whether a pool-context
 * free_chlorine claim is supported, claim-fc-pool-no-cya /
 * claim-fc-pool-with-cya are the relevant canonical claims to check
 * against." Whether a specific record's value actually falls inside that
 * claim family's range (and therefore gets a real source_registry_ids
 * value) is computed per-record in build-provenance.js, using the SAME
 * range-overlap logic already used for scientific_review_status -- never a
 * blanket "topic matches" assumption.
 */
'use strict';

// (parameter_id, environment) -> array of claim_ids from chemistry-claims.js
// that are the authoritative claim family for that combination. Multiple
// entries exist where sanitizer/CYA context further splits the family
// (e.g. free_chlorine/pool has both a no-CYA and a with-CYA claim).
const CLAIM_FAMILY_MAP = {
  'ph|pool': ['claim-ph-pool-routine'],
  'ph|hot_tub': ['claim-ph-hottub-routine'],
  'ph|both': ['claim-ph-pool-routine', 'claim-ph-hottub-routine'],
  'free_chlorine|pool': ['claim-fc-pool-no-cya', 'claim-fc-pool-with-cya'],
  'free_chlorine|hot_tub': ['claim-fc-hottub-routine'],
  'cyanuric_acid|hot_tub': ['claim-cya-hottub-avoid'],
  'cyanuric_acid|pool': ['claim-cya-routine-outdoor', 'claim-cya-max-incident-response'],
  'total_alkalinity|pool': ['claim-ta-target'],
  'total_alkalinity|hot_tub': ['claim-ta-target'], // same source/range applied; no hot-tub-specific TA source found (see AUTHORITY-CHART-PROVENANCE.md)
  'calcium_hardness|pool': ['claim-ch-target'],
  'calcium_hardness|hot_tub': ['claim-ch-target'],
  'salt|pool': ['claim-salt-generic'],
  'bromine|hot_tub': ['claim-bromine-hottub'],
  'shock_treatment|pool': ['claim-shock-breakpoint-rule'],
  'shock_treatment|hot_tub': ['claim-shock-breakpoint-rule'],
  'sanitizer|pool': ['claim-mixing-chemicals-danger'],
  'sanitizer|hot_tub': ['claim-mixing-chemicals-danger'],
  'combined_chlorine|pool': ['claim-cc-minimize'],
  'combined_chlorine|hot_tub': ['claim-cc-minimize'],
  // No claim family exists (yet) for these -- explicit absence, not an
  // oversight. Each was checked against chemistry-claims.js and
  // chemistry-ranges.js and no canonical claim covers it:
  //   total_chlorine (derived quantity, no independent target claim)
  //   water_temperature (no CDC/ANSI temperature *target* claim found --
  //     see AUTHORITY-CHART-PROVENANCE.md; CDC's temperature-adjacent
  //     guidance is about sanitizer levels AT elevated temperature, not a
  //     temperature target itself)
  //   chlorine_demand, sanitizer|unspecified, oxidation, algae (no numeric
  //     target concept)
  //   lsi, pool_volume, chemical_dosage (outside the 15-parameter
  //     chemistry-claims.js vocabulary entirely)
};

function claimFamilyFor(parameterId, environment) {
  const exact = CLAIM_FAMILY_MAP[`${parameterId}|${environment}`];
  if (exact) return exact;
  if (environment === 'unspecified' || environment === 'both') {
    // Fall back to whichever families exist for this parameter under any
    // environment, since "unspecified" genuinely could be either.
    const keys = Object.keys(CLAIM_FAMILY_MAP).filter((k) => k.startsWith(`${parameterId}|`));
    if (keys.length === 0) return [];
    return [...new Set(keys.flatMap((k) => CLAIM_FAMILY_MAP[k]))];
  }
  return [];
}

module.exports = { CLAIM_FAMILY_MAP, claimFamilyFor };
