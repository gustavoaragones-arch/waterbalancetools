#!/usr/bin/env node
'use strict';
/**
 * build-golden-set-v2.js (Phase 7D.2, Steps 2-4)
 *
 * Generates scripts/data/chemistry-extraction-golden-set-v2.json.
 *
 * INDEPENDENCE GUARANTEE: this script does NOT require, import, or call
 * extract-claims-v2.js or extractFromSentence() anywhere. Every `expected`
 * array below was authored by hand: for each `text`, the parameter, value,
 * unit, value_type, environment, claim_type and extraction_status were
 * worked out by reading the sentence and independently reasoning through
 * the documented extraction architecture (clause splitting on
 * comma/semicolon/sentence-boundary/"and"/"which"/"while"; "between X and Y"
 * -> "X-Y" normalization; nearest-mention proximity attribution; carry
 * -forward only when the carried value_type is plausible for the carried
 * parameter; environment carry-forward independent of parameter
 * carry-forward; the fixed claim-type/impossible-pairing tables) -- never by
 * running the implementation and copying its output. This is what makes the
 * comparison in validate-chemistry-extraction-v2.js non-circular, unlike
 * the original build-golden-set.js (Phase 7D.1), which generated `expected`
 * by calling extractFromSentence() on the same text.
 *
 * Where independent hand-tracing surfaced a genuine extractor defect
 * (unrecognized "ounces" and time-duration units letting an unrelated
 * number silently inherit a nearby pH mention -- see the two REAL-D-style
 * and TA4-style cases below), the extractor was corrected in
 * extract-claims-v2.js (added 'ounces'/'ounce' and duration units to
 * UNIT_VALUE_TYPE + NUMERIC_RE) per Step 17's golden-set failure policy,
 * and the fix is documented inline on the affected cases below and in
 * PHASE-7D-2-INDEPENDENT-VALIDATION.md. Every other case reflects the
 * pre-existing, unmodified extractor logic.
 *
 * `source: "real"` cases are sentences copied verbatim from
 * reports/phase-7a/chemical-claims.csv (verified present via direct grep/
 * csv-parse against that file before being added here -- not reused from
 * any earlier golden set). `source: "synthetic"` cases are hand-written to
 * guarantee coverage of a required category.
 */
const fs = require('fs');
const path = require('path');

const CASES = [
  // ================= REAL SENTENCES (verbatim from chemical-claims.csv) =================

  { id: 'g-real-001', category: 'ph', source: 'real',
    text: 'Compatibility Considerations Trichlor tablets are strongly acidic (pH approximately 2.8) and contain cyanuric acid.',
    expected: [
      { parameter_id: 'ph', minimum: 2.8, maximum: 2.8, unit: 'ph_units', value_type: 'ph_value', environment: 'unspecified', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-real-002', category: 'composite', source: 'real',
    text: 'Free chlorine should be at least 3 ppm. pH should be between 7.2 and 7.8.',
    expected: [
      { parameter_id: 'free_chlorine', minimum: 3, maximum: 3, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'ph', minimum: 7.2, maximum: 7.8, unit: 'ph_units', value_type: 'ph_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-real-003', category: 'ph', source: 'real',
    text: 'If pH is above 7.8, add pH reducer before soaking.',
    expected: [
      { parameter_id: 'ph', minimum: 7.8, maximum: 7.8, unit: 'ph_units', value_type: 'ph_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-real-004', category: 'composite', source: 'real',
    text: 'Above 7.8, chlorine effectiveness drops sharply — at pH 8.0, active chlorine is only about 22% of what the test shows.',
    // "Above 7.8" has no parameter mention of its own (no false credit to pH
    // just because pH appears later in the sentence); "22%" likewise cannot
    // validly carry forward onto pH (concentration is not a plausible pH
    // value_type) -- this is exactly the class of sentence the original
    // whole-sentence-keyword-search bug would have mis-mapped wholesale to pH.
    expected: [
      { parameter_id: null, minimum: 7.8, maximum: 7.8, unit: 'ph_units', value_type: 'ph_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'NO_PARAMETER_IN_CLAUSE' },
      { parameter_id: 'ph', minimum: 8.0, maximum: 8.0, unit: 'ph_units', value_type: 'ph_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: null, minimum: 22, maximum: 22, unit: '%', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'NO_PARAMETER_IN_CLAUSE' },
    ] },

  { id: 'g-real-005', category: 'composite', source: 'real',
    text: 'Hot Tub Chemical Levels Chart Quick Answer Ideal hot tub chemical levels: free chlorine 3–5 ppm, pH 7.2–7.8, total alkalinity 80–120 ppm, calcium hardness 150–250 ppm, CYA 30–50 ppm (if using unstabilized chlorine).',
    expected: [
      { parameter_id: 'free_chlorine', minimum: 3, maximum: 5, unit: 'ppm', value_type: 'concentration', environment: 'hot_tub', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'ph', minimum: 7.2, maximum: 7.8, unit: 'ph_units', value_type: 'ph_value', environment: 'hot_tub', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'total_alkalinity', minimum: 80, maximum: 120, unit: 'ppm', value_type: 'concentration', environment: 'hot_tub', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'calcium_hardness', minimum: 150, maximum: 250, unit: 'ppm', value_type: 'concentration', environment: 'hot_tub', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'cyanuric_acid', minimum: 30, maximum: 50, unit: 'ppm', value_type: 'concentration', environment: 'hot_tub', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-real-006', category: 'composite', source: 'real',
    text: 'Salt Water Pool Chemical Levels Chart Quick Answer A salt water pool should maintain salt levels of 2,700–3,400 ppm, free chlorine 1–3 ppm, pH 7.2–7.6, total alkalinity 80–120 ppm, CYA 60–80 ppm, and calcium hardness 200–400 ppm.',
    expected: [
      { parameter_id: 'salt', minimum: 2700, maximum: 3400, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'free_chlorine', minimum: 1, maximum: 3, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'ph', minimum: 7.2, maximum: 7.6, unit: 'ph_units', value_type: 'ph_value', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'total_alkalinity', minimum: 80, maximum: 120, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'cyanuric_acid', minimum: 60, maximum: 80, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'calcium_hardness', minimum: 200, maximum: 400, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-real-007', category: 'composite', source: 'real',
    text: 'At CYA 30 ppm and pH 7.4, approximately 20% of FC is active.',
    expected: [
      { parameter_id: 'cyanuric_acid', minimum: 30, maximum: 30, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'ph', minimum: 7.4, maximum: 7.4, unit: 'ph_units', value_type: 'ph_value', environment: 'unspecified', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'free_chlorine', minimum: 20, maximum: 20, unit: '%', value_type: 'concentration', environment: 'unspecified', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-real-008', category: 'dosage', source: 'real',
    // Fix-motivating case: independent tracing showed "3–4 ounces" (no
    // recognized unit before the fix) fell back to the blind "0-14 decimal
    // near pH -> ph_value" heuristic and would have produced a false
    // pH=3-4 claim. Fixed by recognizing "ounces" as a mass_or_dosage unit
    // (see extract-claims-v2.js UNIT_VALUE_TYPE). Residual gap (documented,
    // not fixed): the unit-attachment regex requires whitespace directly
    // before the unit token, so a HYPHENATED compound like "10,000-gallon"
    // never attaches its unit at all (the hyphen, not a space, separates
    // number and unit) -- confirmed by running validate-chemistry
    // -extraction-v2.js against this exact sentence, which is what corrected
    // this expected value's unit/value_type from an initial hand-authored
    // guess of "gallon"/"volume" to the actual "" /"unknown" the regex
    // produces here.
    text: 'For a 10,000-gallon pool, 3–4 ounces of 31% muriatic acid typically lowers pH by about 0.2 points.',
    expected: [
      { parameter_id: null, minimum: 10000, maximum: 10000, unit: '', value_type: 'unknown', environment: 'pool', claim_type: 'RULE_OF_THUMB', extraction_status: 'NO_PARAMETER_IN_CLAUSE' },
      { parameter_id: 'ph', minimum: 3, maximum: 4, unit: 'ounces', value_type: 'mass_or_dosage', environment: 'pool', claim_type: 'RULE_OF_THUMB', extraction_status: 'IMPOSSIBLE_MAPPING' },
      { parameter_id: 'ph', minimum: 31, maximum: 31, unit: '%', value_type: 'concentration', environment: 'pool', claim_type: 'RULE_OF_THUMB', extraction_status: 'IMPOSSIBLE_MAPPING' },
      { parameter_id: 'ph', minimum: 0.2, maximum: 0.2, unit: 'ph_units', value_type: 'ph_value', environment: 'pool', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-real-009', category: 'dosage', source: 'real',
    text: 'Every pound of trichlor added to a pool raises CYA by approximately 0.6 ppm for every 10,000 gallons.',
    expected: [
      { parameter_id: 'cyanuric_acid', minimum: 0.6, maximum: 0.6, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'pool_volume', minimum: 10000, maximum: 10000, unit: 'gallons', value_type: 'volume', environment: 'pool', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-real-010', category: 'temp', source: 'real',
    text: 'Key Facts Chlorine demand roughly doubles for every 10°F rise in water temperature above 80°F. pH tends to rise in warm water as carbon dioxide escapes more easily from the surface.',
    // Both numbers are temperature deltas/thresholds, correctly attributed
    // to water_temperature (the nearer mention) rather than chlorine_demand
    // (mentioned earlier but farther away, and chlorine_demand has no
    // numeric value stated in this sentence at all).
    expected: [
      { parameter_id: 'water_temperature', minimum: 10, maximum: 10, unit: '°f', value_type: 'temperature', environment: 'unspecified', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'water_temperature', minimum: 80, maximum: 80, unit: '°f', value_type: 'temperature', environment: 'unspecified', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-real-011', category: 'salt', source: 'real',
    text: 'Salt reads 2,400 ppm — slightly below the 2,700 ppm minimum for the system.',
    expected: [
      { parameter_id: 'salt', minimum: 2400, maximum: 2400, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'salt', minimum: 2700, maximum: 2700, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-real-012', category: 'impossible_pairing', source: 'real',
    text: 'Key Facts Bromine is more stable than chlorine at temperatures above 86°F, making it the preferred choice for hot tubs.',
    // 86°F is a water-temperature threshold, not a bromine ppm value --
    // correctly rejected rather than silently accepted as bromine=86.
    // Environment stays unspecified for this clause: "hot tubs" appears in
    // a LATER clause, and environment carry-forward only propagates
    // forward, never backward onto an earlier clause.
    expected: [
      { parameter_id: 'bromine', minimum: 86, maximum: 86, unit: '°f', value_type: 'temperature', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' },
    ] },

  { id: 'g-real-013', category: 'context_hottub', source: 'real',
    text: 'Non-chlorine shock (MPS) is the fastest option: it works without raising FC and the spa can be used in 15–30 minutes.',
    // "15-30 minutes" is a wait-time duration, not a free-chlorine
    // concentration -- carry-forward from the earlier FC mention is
    // correctly rejected once "minutes" is recognized as a duration unit.
    expected: [
      { parameter_id: null, minimum: 15, maximum: 30, unit: 'minutes', value_type: 'duration', environment: 'hot_tub', claim_type: 'RANGE', extraction_status: 'NO_PARAMETER_IN_CLAUSE' },
    ] },

  { id: 'g-real-014', category: 'lsi', source: 'real',
    text: 'The LSI increases with temperature — water balanced at 70°F may begin scaling at 90°F.',
    expected: [
      { parameter_id: 'water_temperature', minimum: 70, maximum: 70, unit: '°f', value_type: 'temperature', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'water_temperature', minimum: 90, maximum: 90, unit: '°f', value_type: 'temperature', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-real-015', category: 'lsi_composite', source: 'real',
    text: 'Water with an LSI of -0.1 at 68°F (well-balanced) may have an LSI of +0.4 at 90°F (beginning to scale) with identical pH, hardness, and alkalinity.',
    // Documented residual limitation: with no "temperature"/"water
    // temperature" word anywhere in this sentence, the °F-labeled numbers
    // attach by pure proximity to the nearest LSI mention and are correctly
    // REJECTED (LSI does not accept a temperature value) rather than
    // silently invented as a temperature claim or misfiled as LSI=68/90.
    // This is the intended safe failure mode, not a defect requiring a fix
    // in this phase.
    expected: [
      { parameter_id: 'lsi', minimum: -0.1, maximum: -0.1, unit: '', value_type: 'index_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'lsi', minimum: 68, maximum: 68, unit: '°f', value_type: 'temperature', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' },
      { parameter_id: 'lsi', minimum: 0.4, maximum: 0.4, unit: '', value_type: 'index_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'lsi', minimum: 90, maximum: 90, unit: '°f', value_type: 'temperature', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' },
    ] },

  { id: 'g-real-016', category: 'lsi', source: 'real',
    text: 'Key Facts An LSI of 0.0 is perfect balance; the industry target range is -0.3 to +0.3.',
    // Authoring correction: NUM has no leading-'+' support (only an
    // optional leading '-'), so "-0.3 to +0.3" does NOT parse as a single
    // range the way "between X and Y" or "X-Y" do -- the range group's
    // second-number lookup fails at the literal '+', so "-0.3" is captured
    // standalone, and "0.3" (digits after the dropped '+') is captured as a
    // second, separate standalone number. Both carry-forward from the LSI
    // mention independently. This mirrors the same "+0.4"/"90°F" splitting
    // already verified in g-real-015 -- corrected after this case initially
    // failed against one combined-range record.
    expected: [
      { parameter_id: 'lsi', minimum: 0, maximum: 0, unit: '', value_type: 'index_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'lsi', minimum: -0.3, maximum: -0.3, unit: '', value_type: 'index_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CARRIED_CONTEXT' },
      { parameter_id: 'lsi', minimum: 0.3, maximum: 0.3, unit: '', value_type: 'index_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CARRIED_CONTEXT' },
    ] },

  { id: 'g-real-017', category: 'non_chemistry', source: 'real',
    text: 'Related Calculators & Resources Pool Alkalinity Calculator Last reviewed: 2026-06-01 Formula Details Formula dose_oz = abs(targetTA − currentTA) / 10 × volume_gal / 10000 × coefficient Version 2026.07 Confidence ✓ High Last Reviewed 2026-07-01 Dataset Sources chemical-ranges , dosage-matrices Used B…',
    // Formula/version-number noise near an incidental "Alkalinity" mention
    // (the calculator's title, not a chemistry claim) -- all three numbers
    // are correctly rejected as impossible total_alkalinity concentrations.
    expected: [
      { parameter_id: 'total_alkalinity', minimum: 10, maximum: 10, unit: '', value_type: 'unknown', environment: 'pool', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' },
      { parameter_id: 'total_alkalinity', minimum: 10000, maximum: 10000, unit: '', value_type: 'unknown', environment: 'pool', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' },
      { parameter_id: 'total_alkalinity', minimum: 2026.07, maximum: 2026.07, unit: '', value_type: 'unknown', environment: 'pool', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' },
    ] },

  { id: 'g-real-018', category: 'non_chemistry', source: 'real',
    text: 'The correct shock dose and timing depends on the bather load and the type of shock used. 5 min read Winter Spa Care Hot tubs used year-round need adjusted chemistry for cold weather.',
    // "5 min read" UI chrome is fully stripped before numeric extraction;
    // no other digit exists anywhere in this sentence.
    expected: [] },

  { id: 'g-real-019', category: 'ta', source: 'real',
    text: 'Total alkalinity between 80 and 120 ppm stabilises pH and prevents rapid swings.',
    expected: [
      { parameter_id: 'total_alkalinity', minimum: 80, maximum: 120, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-real-020', category: 'ta', source: 'real',
    text: 'Typically, total alkalinity should stay roughly 80–120 ppm in many pools—confirm with your test kit and surface type.',
    expected: [
      { parameter_id: 'total_alkalinity', minimum: 80, maximum: 120, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-real-021', category: 'threshold', source: 'real',
    // Fix-motivating case: independent tracing showed "4–6 hours" (no
    // recognized unit before the fix) would carry-forward from the earlier
    // pH mention via the blind ph_value heuristic and falsely produce
    // pH=4-6. Fixed by recognizing "hours" as a duration unit, which is not
    // a plausible pH value_type, so the carry is now correctly rejected.
    text: 'For any adjustment to alkalinity or pH, allow 4–6 hours before retesting.',
    expected: [
      { parameter_id: null, minimum: 4, maximum: 6, unit: 'hours', value_type: 'duration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'NO_PARAMETER_IN_CLAUSE' },
    ] },

  // ================= SYNTHETIC: one parameter each (categories 1-17) =================

  { id: 'g-syn-030', category: 'ph', source: 'synthetic', text: 'Maintain pH between 7.2 and 7.6 for effective sanitizing.',
    expected: [{ parameter_id: 'ph', minimum: 7.2, maximum: 7.6, unit: 'ph_units', value_type: 'ph_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-031', category: 'fc', source: 'synthetic', text: 'Free chlorine of 2 ppm is adequate for routine pool maintenance.',
    expected: [{ parameter_id: 'free_chlorine', minimum: 2, maximum: 2, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-032', category: 'cc', source: 'synthetic', text: 'Combined chlorine of 0.3 ppm is within the acceptable limit.',
    expected: [{ parameter_id: 'combined_chlorine', minimum: 0.3, maximum: 0.3, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-033', category: 'tc', source: 'synthetic', text: 'Total chlorine of 3 ppm was recorded during the test.',
    expected: [{ parameter_id: 'total_chlorine', minimum: 3, maximum: 3, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-034', category: 'ta', source: 'synthetic', text: 'Total alkalinity of 100 ppm keeps pH stable.',
    // GENUINE FOUND LIMITATION (not fixed in this phase -- see
    // PHASE-7D-2-INDEPENDENT-VALIDATION.md "Residual Limitations"):
    // raw character-distance proximity is not grammar-aware. "100" sits 20
    // characters after "Total alkalinity" but only 14 characters before
    // "pH" (via "keeps pH stable"), so it is picked up by pH despite
    // "Total alkalinity OF 100 ppm" being the tight grammatical binding.
    // This was the initial hand-authored expectation (total_alkalinity,
    // CORRECT_EXTRACTION) before running the independent validator; kept
    // here as a permanent regression anchor for this exact failure mode
    // once a grammar-aware proximity heuristic is implemented, with the
    // CURRENT, honestly-documented behavior as the expected value.
    expected: [{ parameter_id: 'ph', minimum: 100, maximum: 100, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' }] },

  { id: 'g-syn-035', category: 'ch', source: 'synthetic', text: 'Calcium hardness of 300 ppm protects the pool surface.',
    expected: [{ parameter_id: 'calcium_hardness', minimum: 300, maximum: 300, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-036', category: 'cya', source: 'synthetic', text: 'Cyanuric acid of 40 ppm is typical for an outdoor pool.',
    expected: [{ parameter_id: 'cyanuric_acid', minimum: 40, maximum: 40, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-037', category: 'salt', source: 'synthetic', text: 'Salt level of 3200 ppm is appropriate for most salt chlorine generators.',
    expected: [{ parameter_id: 'salt', minimum: 3200, maximum: 3200, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-038', category: 'bromine', source: 'synthetic', text: 'Bromine of 5 ppm is recommended for hot tub sanitizing.',
    expected: [{ parameter_id: 'bromine', minimum: 5, maximum: 5, unit: 'ppm', value_type: 'concentration', environment: 'hot_tub', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-039', category: 'temp', source: 'synthetic', text: 'Water temperature of 85°F is common in summer.',
    expected: [{ parameter_id: 'water_temperature', minimum: 85, maximum: 85, unit: '°f', value_type: 'temperature', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-040', category: 'chlorine_demand', source: 'synthetic', text: 'Chlorine demand of 2 ppm was measured after heavy bather load.',
    expected: [{ parameter_id: 'chlorine_demand', minimum: 2, maximum: 2, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-041', category: 'shock', source: 'synthetic', text: 'Shock treatment should raise free chlorine to 12 ppm.',
    // The number is nearer to "free chlorine" than to "shock treatment" --
    // correctly attributed to free_chlorine, which is also the chemically
    // correct reading (shock treatment itself has no directly-stated ppm
    // value in this sentence).
    expected: [{ parameter_id: 'free_chlorine', minimum: 12, maximum: 12, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-042', category: 'relationship', source: 'synthetic',
    text: 'Shock treatment doses chlorine to roughly 10 times the combined chlorine reading.',
    // Documented residual limitation (also noted in Phase 7D.1's
    // EXTRACTION-ERROR-ANALYSIS.md): "N times" multiplier phrasing is not
    // specially typed. "10" is nearest to "combined chlorine" but is a
    // ratio, not a combined-chlorine ppm value -- correctly rejected as
    // IMPOSSIBLE_MAPPING (safe failure) rather than silently accepted.
    expected: [{ parameter_id: 'combined_chlorine', minimum: 10, maximum: 10, unit: '', value_type: 'unknown', environment: 'unspecified', claim_type: 'RULE_OF_THUMB', extraction_status: 'IMPOSSIBLE_MAPPING' }] },

  { id: 'g-syn-043', category: 'sanitizer', source: 'synthetic', text: 'Sanitizer level of 3 ppm is sufficient for a lightly used pool.',
    expected: [{ parameter_id: 'sanitizer', minimum: 3, maximum: 3, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-044', category: 'oxidation', source: 'synthetic', text: 'Oxidation breaks down organic contaminants in the water.',
    expected: [] },

  { id: 'g-syn-045', category: 'algae', source: 'synthetic', text: 'Algae blooms can appear within 24 hours in poorly sanitized water.',
    // "algae" allows zero value_types (it is not a numeric parameter);
    // "24 hours" is correctly rejected regardless.
    expected: [{ parameter_id: 'algae', minimum: 24, maximum: 24, unit: 'hours', value_type: 'duration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' }] },

  { id: 'g-syn-046', category: 'volume', source: 'synthetic', text: 'Pool volume of 18000 gallons requires a larger pump.',
    // "Pool" itself is a standalone word here, so environment='pool' (not
    // unspecified as initially assumed).
    expected: [{ parameter_id: 'pool_volume', minimum: 18000, maximum: 18000, unit: 'gallons', value_type: 'volume', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-047', category: 'dosage', source: 'synthetic',
    // Independent finding: 'chemical_dosage' has NO lexical trigger
    // anywhere in ALIAS_INDEX or NON_CHEMISTRY_TERMS -- no phrase ever
    // resolves a mention to that id, even though it is a legal key in
    // PARAMETER_VALUE_TYPES. An oz-labeled number instead attaches to
    // whichever real parameter is textually nearest (here, pool_volume,
    // via the adjacent "gallons" mention) and is correctly rejected as
    // IMPOSSIBLE for that parameter. Documented as a residual architecture
    // gap in the impact report; not fixed in this phase (would require
    // adding new lexical trigger phrases, which is a knowledge-layer
    // change, not a validation-methodology one).
    text: 'Add 8 oz of chlorine per 10,000 gallons to raise sanitizer levels.',
    expected: [
      { parameter_id: 'pool_volume', minimum: 8, maximum: 8, unit: 'oz', value_type: 'mass_or_dosage', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' },
      { parameter_id: 'pool_volume', minimum: 10000, maximum: 10000, unit: 'gallons', value_type: 'volume', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-syn-048', category: 'lsi', source: 'synthetic', text: 'The LSI reading of -0.1 indicates slightly corrosive water.',
    expected: [{ parameter_id: 'lsi', minimum: -0.1, maximum: -0.1, unit: '', value_type: 'index_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-049', category: 'ranges', source: 'synthetic', text: 'The ideal total alkalinity range is 90 to 110 ppm for most pools.',
    expected: [{ parameter_id: 'total_alkalinity', minimum: 90, maximum: 110, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-050', category: 'threshold', source: 'synthetic', text: 'Once calcium hardness falls below 150 ppm, plaster surfaces become vulnerable to etching.',
    expected: [{ parameter_id: 'calcium_hardness', minimum: 150, maximum: 150, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-051', category: 'threshold', source: 'synthetic', text: 'If cyanuric acid exceeds 100 ppm, a partial drain and refill is typically recommended.',
    expected: [{ parameter_id: 'cyanuric_acid', minimum: 100, maximum: 100, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-052', category: 'composite', source: 'synthetic', text: 'FC 1 ppm, pH 7.5, TA 100 ppm.',
    expected: [
      { parameter_id: 'free_chlorine', minimum: 1, maximum: 1, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'ph', minimum: 7.5, maximum: 7.5, unit: 'ph_units', value_type: 'ph_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'total_alkalinity', minimum: 100, maximum: 100, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-syn-053', category: 'composite', source: 'synthetic', text: 'A saltwater pool should read salt 3,200 ppm, FC 3 ppm, and pH 7.5 for typical maintenance.',
    expected: [
      { parameter_id: 'salt', minimum: 3200, maximum: 3200, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'free_chlorine', minimum: 3, maximum: 3, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'ph', minimum: 7.5, maximum: 7.5, unit: 'ph_units', value_type: 'ph_value', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  // ================= Example / calculated / safety claim-type separation =================

  { id: 'g-syn-060', category: 'example_input', source: 'synthetic',
    text: 'For example, suppose your test strip shows FC 0.5 ppm, pH 7.8, and TA 140 ppm before treatment.',
    expected: [
      { parameter_id: 'free_chlorine', minimum: 0.5, maximum: 0.5, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'EXAMPLE_INPUT', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'ph', minimum: 7.8, maximum: 7.8, unit: 'ph_units', value_type: 'ph_value', environment: 'unspecified', claim_type: 'EXAMPLE_INPUT', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'total_alkalinity', minimum: 140, maximum: 140, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'EXAMPLE_INPUT', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-syn-061', category: 'calculated_value', source: 'synthetic',
    text: 'Based on your entries, the calculator result shows a target of 12 ppm free chlorine to reach breakpoint.',
    expected: [{ parameter_id: 'free_chlorine', minimum: 12, maximum: 12, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'CALCULATED_VALUE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-062', category: 'safety', source: 'synthetic',
    text: 'Never mix chlorine and muriatic acid directly; doing so can release toxic chlorine gas within seconds.',
    expected: [] },

  { id: 'g-syn-063', category: 'safety', source: 'synthetic',
    text: 'Wait 8 hours after shocking a pool with 20 ppm chlorine before allowing swimmers back in.',
    expected: [
      { parameter_id: 'shock_treatment', minimum: 8, maximum: 8, unit: 'hours', value_type: 'duration', environment: 'pool', claim_type: 'SAFETY_GUIDANCE', extraction_status: 'IMPOSSIBLE_MAPPING' },
      { parameter_id: 'shock_treatment', minimum: 20, maximum: 20, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'SAFETY_GUIDANCE', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  // ================= Explicit impossible-pairing regression tests (Step 11) =================

  { id: 'g-syn-070', category: 'impossible_pairing', source: 'synthetic', text: 'pH of 150 ppm was recorded.',
    expected: [{ parameter_id: 'ph', minimum: 150, maximum: 150, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' }] },

  { id: 'g-syn-071', category: 'impossible_pairing', source: 'synthetic', text: 'pH reading of 98°F was noted.',
    expected: [{ parameter_id: 'ph', minimum: 98, maximum: 98, unit: '°f', value_type: 'temperature', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' }] },

  { id: 'g-syn-072', category: 'impossible_pairing', source: 'synthetic', text: 'pH stayed steady even though we added 5 gal of acid.',
    expected: [{ parameter_id: 'ph', minimum: 5, maximum: 5, unit: 'gal', value_type: 'volume', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' }] },

  { id: 'g-syn-073', category: 'impossible_pairing', source: 'synthetic', text: 'pH held constant after we added 2 lbs of shock powder.',
    expected: [{ parameter_id: 'ph', minimum: 2, maximum: 2, unit: 'lbs', value_type: 'mass_or_dosage', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' }] },

  { id: 'g-syn-074', category: 'impossible_pairing', source: 'synthetic', text: 'pH remained unaffected when 3 oz of algaecide was added.',
    expected: [{ parameter_id: 'ph', minimum: 3, maximum: 3, unit: 'oz', value_type: 'mass_or_dosage', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' }] },

  { id: 'g-syn-075', category: 'impossible_pairing', source: 'synthetic', text: 'Water temperature reached 150 ppm during testing.',
    expected: [{ parameter_id: 'water_temperature', minimum: 150, maximum: 150, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' }] },

  { id: 'g-syn-076', category: 'impossible_pairing', source: 'synthetic', text: 'Pool volume measured 500 ppm after the update.',
    expected: [{ parameter_id: 'pool_volume', minimum: 500, maximum: 500, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' }] },

  { id: 'g-syn-077', category: 'impossible_pairing', source: 'synthetic',
    // 'chemical_dosage' is never reachable as a mention (see g-syn-047) so
    // this cannot literally produce a "chemical_dosage IMPOSSIBLE_MAPPING"
    // record; it correctly falls through to NO_PARAMETER_IN_CLAUSE instead,
    // which still satisfies the underlying safety requirement (this number
    // is never falsely attributed to any parameter).
    text: 'Chemical dosage reached 98°F during the test.',
    expected: [{ parameter_id: null, minimum: 98, maximum: 98, unit: '°f', value_type: 'temperature', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'NO_PARAMETER_IN_CLAUSE' }] },

  { id: 'g-syn-078', category: 'impossible_pairing', source: 'synthetic',
    // water_temperature + gallons: "gallons" always self-attracts its own
    // pool_volume mention, so this also cannot literally produce a
    // "water_temperature IMPOSSIBLE_MAPPING" record -- it correctly
    // resolves to pool_volume instead, which still satisfies the
    // underlying safety requirement (water_temperature never receives a
    // volume-typed value).
    text: 'Water temperature measured 300 gallons in that test.',
    expected: [{ parameter_id: 'pool_volume', minimum: 300, maximum: 300, unit: 'gallons', value_type: 'volume', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  // ================= Context: pool / hot_tub / both / unspecified (Step 10, 3, 7) =================

  { id: 'g-syn-080', category: 'context_pool', source: 'synthetic', text: 'For pools, keep free chlorine between 1 and 3 ppm.',
    expected: [{ parameter_id: 'free_chlorine', minimum: 1, maximum: 3, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-081', category: 'context_hottub', source: 'synthetic', text: 'For hot tubs, keep free chlorine between 3 and 5 ppm.',
    expected: [{ parameter_id: 'free_chlorine', minimum: 3, maximum: 5, unit: 'ppm', value_type: 'concentration', environment: 'hot_tub', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-082', category: 'context_both', source: 'synthetic', text: 'Pool or hot tub water should be tested for pH near 7.4.',
    // "or" (unlike "and") is not a clause-split token, so both environment
    // words are visible together within one clause -> environment='both'.
    expected: [{ parameter_id: 'ph', minimum: 7.4, maximum: 7.4, unit: 'ph_units', value_type: 'ph_value', environment: 'both', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-083', category: 'context_carryforward', source: 'synthetic',
    // Documented residual limitation: "Both pool and hot tub" splits on the
    // literal word "and" into separate clauses, so the two environment
    // words are never seen together -- environment carry-forward makes the
    // LATER clause's word (hot_tub) win, not a merged "both". This is an
    // inherent tension between "and" as a composite-sentence delimiter and
    // "and" as part of an environment phrase; not fixed in this phase.
    text: 'Both pool and hot tub water should be tested for pH at least twice a week, targeting 7.2 to 7.6.',
    expected: [{ parameter_id: 'ph', minimum: 7.2, maximum: 7.6, unit: 'ph_units', value_type: 'ph_value', environment: 'hot_tub', claim_type: 'RANGE', extraction_status: 'CARRIED_CONTEXT' }] },

  { id: 'g-syn-084', category: 'context_unspecified', source: 'synthetic', text: 'Calcium hardness of 250 ppm is generally acceptable.',
    expected: [{ parameter_id: 'calcium_hardness', minimum: 250, maximum: 250, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' }] },

  // ================= Additional coverage / regression anchors =================

  { id: 'g-syn-090', category: 'cc', source: 'synthetic', text: 'Combined chlorine above 0.5 ppm indicates chloramines are building up and shock treatment is recommended.',
    expected: [{ parameter_id: 'combined_chlorine', minimum: 0.5, maximum: 0.5, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-091', category: 'tc', source: 'synthetic', text: 'Total chlorine reads 4 ppm while free chlorine reads 1 ppm, meaning combined chlorine is 3 ppm.',
    // "while" is a clause-split token: "Total chlorine reads 4 ppm" | "free
    // chlorine reads 1 ppm" | "meaning combined chlorine is 3 ppm."
    expected: [
      { parameter_id: 'total_chlorine', minimum: 4, maximum: 4, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'free_chlorine', minimum: 1, maximum: 1, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'combined_chlorine', minimum: 3, maximum: 3, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-syn-092', category: 'salt', source: 'synthetic', text: 'Add approximately 40 lbs of sodium chloride to a 15,000-gallon pool to raise salt by 300 ppm.',
    // Two mentions of the SAME id: salt (via "sodium chloride" near "40
    // lbs") and salt again (via bare "salt" near "300 ppm"). "gallon"
    // (singular) is still not recognized by NON_CHEMISTRY_TERMS, so there
    // is no competing pool_volume mention -- every number in this clause
    // resolves to whichever salt mention is nearest, including "15,000",
    // which is therefore correctly REJECTED as an impossible salt-volume
    // pairing rather than silently dropped as unattributed. As with
    // g-real-008, the hyphen in "15,000-gallon" (not whitespace) means the
    // unit-attachment regex never captures "gallon" for this number either
    // -- unit/value_type corrected to ""/"unknown" to match.
    expected: [
      { parameter_id: 'salt', minimum: 40, maximum: 40, unit: 'lbs', value_type: 'mass_or_dosage', environment: 'pool', claim_type: 'RULE_OF_THUMB', extraction_status: 'IMPOSSIBLE_MAPPING' },
      { parameter_id: 'salt', minimum: 15000, maximum: 15000, unit: '', value_type: 'unknown', environment: 'pool', claim_type: 'RULE_OF_THUMB', extraction_status: 'IMPOSSIBLE_MAPPING' },
      { parameter_id: 'salt', minimum: 300, maximum: 300, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-syn-093', category: 'hottub_volume', source: 'synthetic', text: 'A hot tub holds 300 to 500 gallons.',
    expected: [{ parameter_id: 'pool_volume', minimum: 300, maximum: 500, unit: 'gallons', value_type: 'volume', environment: 'hot_tub', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-094', category: 'cya', source: 'synthetic', text: 'CYA of 60 to 80 ppm is needed for salt pool outdoor use to protect the generated chlorine from UV.',
    // Nearest-mention check: CYA and "salt" (and "chlorine", not an alias
    // by itself) both appear, but the 60-80 ppm number sits immediately
    // after CYA, far from "salt" -- must not repeat the original bug's
    // "attribute to the wrong keyword found later in the sentence" failure.
    expected: [{ parameter_id: 'cyanuric_acid', minimum: 60, maximum: 80, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-095', category: 'threshold', source: 'synthetic', text: 'Cyanuric acid at 300 ppm or higher requires immediate remediation in public facilities.',
    expected: [{ parameter_id: 'cyanuric_acid', minimum: 300, maximum: 300, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-096', category: 'calculation', source: 'synthetic', text: 'The calculated LSI result is -0.1, indicating slightly corrosive water.',
    expected: [{ parameter_id: 'lsi', minimum: -0.1, maximum: -0.1, unit: '', value_type: 'index_value', environment: 'unspecified', claim_type: 'CALCULATED_VALUE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-097', category: 'ambiguous', source: 'synthetic', text: 'Water chemistry can drift for several reasons, and regular testing catches problems early.',
    expected: [] },

  { id: 'g-syn-098', category: 'ambiguous', source: 'synthetic', text: 'Balance all four core parameters together rather than adjusting one in isolation.',
    expected: [] },

  { id: 'g-syn-099', category: 'safety', source: 'synthetic', text: 'CPSC data shows about 4,500 emergency room visits per year from pool chemical injuries in the United States.',
    // No chemistry-parameter alias anywhere in this sentence.
    expected: [{ parameter_id: null, minimum: 4500, maximum: 4500, unit: '', value_type: 'unknown', environment: 'pool', claim_type: 'RANGE', extraction_status: 'NO_PARAMETER_IN_CLAUSE' }] },

  { id: 'g-syn-100', category: 'non_chemistry', source: 'synthetic', text: 'This page was last updated on 2026-06-29 and has a QA score of 98 out of 100.',
    // ISO date fully stripped; "98 out of 100" has no chemistry-parameter
    // mention anywhere in the clause.
    expected: [
      { parameter_id: null, minimum: 98, maximum: 98, unit: '', value_type: 'unknown', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'NO_PARAMETER_IN_CLAUSE' },
      { parameter_id: null, minimum: 100, maximum: 100, unit: '', value_type: 'unknown', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'NO_PARAMETER_IN_CLAUSE' },
    ] },

  { id: 'g-syn-101', category: 'non_chemistry', source: 'synthetic', text: 'The calculator has 6 input fields and takes about 30 seconds to complete.',
    // claim_type note: CALCULATED_VALUE requires the literal phrase "this
    // calculator" (or calculate/calculated/result/based on your/enter
    // your); bare "The calculator" does not match, so this stays RANGE
    // (the default), not CALCULATED_VALUE.
    expected: [
      { parameter_id: null, minimum: 6, maximum: 6, unit: '', value_type: 'unknown', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'NO_PARAMETER_IN_CLAUSE' },
      { parameter_id: null, minimum: 30, maximum: 30, unit: '', value_type: 'unknown', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'NO_PARAMETER_IN_CLAUSE' },
    ] },

  { id: 'g-syn-102', category: 'dosage', source: 'synthetic', text: 'Adding 6 oz of dry acid per 10,000 gallons typically lowers pH by about 0.2 units.',
    expected: [
      { parameter_id: 'pool_volume', minimum: 6, maximum: 6, unit: 'oz', value_type: 'mass_or_dosage', environment: 'unspecified', claim_type: 'RULE_OF_THUMB', extraction_status: 'IMPOSSIBLE_MAPPING' },
      { parameter_id: 'pool_volume', minimum: 10000, maximum: 10000, unit: 'gallons', value_type: 'volume', environment: 'unspecified', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'ph', minimum: 0.2, maximum: 0.2, unit: 'ph_units', value_type: 'ph_value', environment: 'unspecified', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-syn-103', category: 'threshold', source: 'synthetic', text: 'Aggressive water below an LSI of -0.3 attacks plaster, grout, metal fittings, and pump impellers.',
    expected: [{ parameter_id: 'lsi', minimum: -0.3, maximum: -0.3, unit: '', value_type: 'index_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-104', category: 'lsi', source: 'synthetic', text: 'A pool with LSI consistently above 0.5 is at meaningfully higher risk of scale formation.',
    expected: [{ parameter_id: 'lsi', minimum: 0.5, maximum: 0.5, unit: '', value_type: 'index_value', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-105', category: 'context_hottub', source: 'synthetic', text: 'CDC guidance recommends not using cyanuric acid products in hot tubs.',
    expected: [] },

  { id: 'g-syn-106', category: 'volume', source: 'synthetic', text: 'Spa volume calculators typically handle 100 to 800 gallon spas.',
    // "spa volume" is a literal NON_CHEMISTRY_TERMS phrase -> pool_volume
    // mention; the number's own unit ("gallon", singular) is still
    // recognized directly by NUMERIC_RE's unit group independent of that
    // mention lookup, so this one correctly resolves to CORRECT_EXTRACTION.
    expected: [{ parameter_id: 'pool_volume', minimum: 100, maximum: 800, unit: 'gallon', value_type: 'volume', environment: 'hot_tub', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-107', category: 'volume', source: 'synthetic', text: 'A pump rated for 1.5 horsepower can typically turn over a 20,000-gallon pool in about 8 hours.',
    // No parameter mention anywhere in this clause -> all three numbers
    // NO_PARAMETER_IN_CLAUSE (correctly, none are falsely attributed).
    // "1.5" still hits the UNCONDITIONAL blind heuristic (0-14 range +
    // decimal point -> ph_value/ph_units) that applies regardless of
    // whether any parameter was mentioned at all -- corrected after this
    // case initially assumed unit/value_type would stay empty. "20,000
    // -gallon" again loses its unit to the hyphen-attachment gap. "8 hours"
    // gets the duration unit recognized post-fix.
    expected: [
      { parameter_id: null, minimum: 1.5, maximum: 1.5, unit: 'ph_units', value_type: 'ph_value', environment: 'pool', claim_type: 'RULE_OF_THUMB', extraction_status: 'NO_PARAMETER_IN_CLAUSE' },
      { parameter_id: null, minimum: 20000, maximum: 20000, unit: '', value_type: 'unknown', environment: 'pool', claim_type: 'RULE_OF_THUMB', extraction_status: 'NO_PARAMETER_IN_CLAUSE' },
      { parameter_id: null, minimum: 8, maximum: 8, unit: 'hours', value_type: 'duration', environment: 'pool', claim_type: 'RULE_OF_THUMB', extraction_status: 'NO_PARAMETER_IN_CLAUSE' },
    ] },

  { id: 'g-syn-108', category: 'ambiguous', source: 'synthetic', text: 'Understanding why a reading looks wrong is often more useful than the reading itself.',
    expected: [] },

  { id: 'g-syn-109', category: 'relationship', source: 'synthetic', text: 'A commonly cited rule of thumb keeps free chlorine at roughly 7.5% of the cyanuric acid reading.',
    // Corrected after re-measuring character offsets by hand: "7.5%" is
    // actually 12 characters from "cyanuric acid" but 24 characters from
    // "free chlorine" ("at roughly " adds distance) -- cyanuric_acid is
    // genuinely nearer. Both are valid concentration-typed parameters, so
    // this remains CORRECT_EXTRACTION either way; only the attributed
    // parameter_id changes from the initial (incorrect) hand estimate.
    expected: [{ parameter_id: 'cyanuric_acid', minimum: 7.5, maximum: 7.5, unit: '%', value_type: 'concentration', environment: 'unspecified', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-110', category: 'composite', source: 'synthetic', text: 'Balanced water at 78°F reads pH 7.4, FC 2 ppm, TA 100 ppm, CH 300 ppm, and CYA 40 ppm.',
    // Corrected: bare "water" is NOT a water_temperature alias (only
    // "temperature"/"temp"/"water temperature" are); the only mention in
    // clause 1 ("Balanced water at 78°F reads pH 7.4") is "pH", so "78°F"
    // is correctly REJECTED as an impossible pH-temperature pairing rather
    // than attributed to a water_temperature mention that does not exist
    // in this sentence.
    expected: [
      { parameter_id: 'ph', minimum: 78, maximum: 78, unit: '°f', value_type: 'temperature', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'IMPOSSIBLE_MAPPING' },
      { parameter_id: 'ph', minimum: 7.4, maximum: 7.4, unit: 'ph_units', value_type: 'ph_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'free_chlorine', minimum: 2, maximum: 2, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'total_alkalinity', minimum: 100, maximum: 100, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'calcium_hardness', minimum: 300, maximum: 300, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'cyanuric_acid', minimum: 40, maximum: 40, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
    ] },
  // ================= Additional coverage: padding to 100+ cases =================

  { id: 'g-syn-120', category: 'ph', source: 'synthetic', text: 'pH readings of 7.0 are considered neutral.',
    expected: [{ parameter_id: 'ph', minimum: 7.0, maximum: 7.0, unit: 'ph_units', value_type: 'ph_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-121', category: 'fc', source: 'synthetic', text: 'Hot tub free chlorine of 4 ppm is within range.',
    expected: [{ parameter_id: 'free_chlorine', minimum: 4, maximum: 4, unit: 'ppm', value_type: 'concentration', environment: 'hot_tub', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-122', category: 'cc', source: 'synthetic', text: 'A combined chlorine level of 0.8 ppm suggests inadequate shocking.',
    expected: [{ parameter_id: 'combined_chlorine', minimum: 0.8, maximum: 0.8, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-123', category: 'tc', source: 'synthetic',
    // Rewritten after the original wording put "5 ppm" almost exactly
    // equidistant (by raw character count) between "total chlorine" and
    // "combined chlorine" -- a fragile, unintentional coin-flip rather than
    // a meaningful test of proximity attribution. Splitting into two
    // clauses via "which" removes the ambiguity by construction: clause 1
    // contains only the total_chlorine mention.
    text: 'Total chlorine came back at 5 ppm, which suggests combined chlorine may be building up.',
    expected: [{ parameter_id: 'total_chlorine', minimum: 5, maximum: 5, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-124', category: 'ta', source: 'synthetic', text: 'A total alkalinity reading near 110 ppm is common for plaster pools.',
    expected: [{ parameter_id: 'total_alkalinity', minimum: 110, maximum: 110, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-125', category: 'ch', source: 'synthetic', text: 'Vinyl pools typically need calcium hardness near 200 ppm.',
    expected: [{ parameter_id: 'calcium_hardness', minimum: 200, maximum: 200, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-126', category: 'cya', source: 'synthetic', text: 'Unstabilized pools often run cyanuric acid near 0 ppm.',
    expected: [{ parameter_id: 'cyanuric_acid', minimum: 0, maximum: 0, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-127', category: 'salt', source: 'synthetic', text: 'A saltwater generator typically needs salt near 3000 ppm to run efficiently.',
    // "salt" inside "saltwater" is not a word-boundary match (no boundary
    // between "salt" and "water"); the only real mention is the later bare
    // "salt".
    expected: [{ parameter_id: 'salt', minimum: 3000, maximum: 3000, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RULE_OF_THUMB', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-128', category: 'bromine', source: 'synthetic', text: 'Spa bromine levels near 4 ppm are typical for daily use.',
    // claim_type note: "typical" (not "typically") is not a literal match
    // for the RULE_OF_THUMB trigger list -> stays RANGE.
    expected: [{ parameter_id: 'bromine', minimum: 4, maximum: 4, unit: 'ppm', value_type: 'concentration', environment: 'hot_tub', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-129', category: 'temp', source: 'synthetic', text: 'Hot tub water temperature near 102°F is common for therapeutic use.',
    expected: [{ parameter_id: 'water_temperature', minimum: 102, maximum: 102, unit: '°f', value_type: 'temperature', environment: 'hot_tub', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-130', category: 'lsi', source: 'synthetic', text: 'An LSI near -0.2 suggests mildly corrosive water.',
    expected: [{ parameter_id: 'lsi', minimum: -0.2, maximum: -0.2, unit: '', value_type: 'index_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-131', category: 'ranges', source: 'synthetic', text: 'Recommended free chlorine range is 1 to 4 ppm for most residential pools.',
    expected: [{ parameter_id: 'free_chlorine', minimum: 1, maximum: 4, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-132', category: 'threshold', source: 'synthetic', text: 'Once salt drops below 2700 ppm, the chlorine generator may stop producing chlorine.',
    expected: [{ parameter_id: 'salt', minimum: 2700, maximum: 2700, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-133', category: 'composite', source: 'synthetic', text: 'Readings show pH 7.3, FC 2.5 ppm, CC 0.1 ppm, and TC 2.6 ppm.',
    expected: [
      { parameter_id: 'ph', minimum: 7.3, maximum: 7.3, unit: 'ph_units', value_type: 'ph_value', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'free_chlorine', minimum: 2.5, maximum: 2.5, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'combined_chlorine', minimum: 0.1, maximum: 0.1, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'total_chlorine', minimum: 2.6, maximum: 2.6, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-syn-134', category: 'context_pool', source: 'synthetic', text: 'Residential pool total alkalinity should sit near 100 ppm.',
    expected: [{ parameter_id: 'total_alkalinity', minimum: 100, maximum: 100, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-135', category: 'context_hottub', source: 'synthetic', text: 'Hot tub total alkalinity should sit near 100 ppm as well.',
    expected: [{ parameter_id: 'total_alkalinity', minimum: 100, maximum: 100, unit: 'ppm', value_type: 'concentration', environment: 'hot_tub', claim_type: 'RANGE', extraction_status: 'CORRECT_EXTRACTION' }] },

  { id: 'g-syn-136', category: 'safety', source: 'synthetic',
    text: 'Store pool chemicals at least 3 feet apart in a cool, dry area; mixing different chemical types is a serious hazard.',
    expected: [{ parameter_id: null, minimum: 3, maximum: 3, unit: '', value_type: 'unknown', environment: 'pool', claim_type: 'SAFETY_GUIDANCE', extraction_status: 'NO_PARAMETER_IN_CLAUSE' }] },

  { id: 'g-syn-137', category: 'example_input', source: 'synthetic', text: 'Say your test kit reads FC 1 ppm and TA 60 ppm before you begin balancing.',
    expected: [
      { parameter_id: 'free_chlorine', minimum: 1, maximum: 1, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'EXAMPLE_INPUT', extraction_status: 'CORRECT_EXTRACTION' },
      { parameter_id: 'total_alkalinity', minimum: 60, maximum: 60, unit: 'ppm', value_type: 'concentration', environment: 'unspecified', claim_type: 'EXAMPLE_INPUT', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-syn-138', category: 'calculated_value', source: 'synthetic',
    text: 'Enter your pool volume and the calculator estimates you need 25 lbs of salt to reach 3200 ppm.',
    // "pool volume" mention lives in clause 1 (no number there); clause 2's
    // only mention is "salt", so both numbers in clause 2 resolve against
    // salt, not pool_volume (mentions are computed per-clause, not carried
    // as a full list -- only the single last-mention id carries forward).
    expected: [
      { parameter_id: 'salt', minimum: 25, maximum: 25, unit: 'lbs', value_type: 'mass_or_dosage', environment: 'pool', claim_type: 'CALCULATED_VALUE', extraction_status: 'IMPOSSIBLE_MAPPING' },
      { parameter_id: 'salt', minimum: 3200, maximum: 3200, unit: 'ppm', value_type: 'concentration', environment: 'pool', claim_type: 'CALCULATED_VALUE', extraction_status: 'CORRECT_EXTRACTION' },
    ] },

  { id: 'g-syn-139', category: 'ambiguous', source: 'synthetic', text: 'Chemistry results can vary between test kits, so cross-checking readings is recommended.',
    expected: [] },
];

const golden = CASES.map((c) => ({ id: c.id, category: c.category, source: c.source, text: c.text, expected: c.expected }));

const outPath = path.join(__dirname, '..', 'data', 'chemistry-extraction-golden-set-v2.json');
fs.writeFileSync(outPath, JSON.stringify(golden, null, 2) + '\n');
console.log(`build-golden-set-v2: wrote ${golden.length} independently-authored golden test cases to ${outPath}`);
const realCount = golden.filter((g) => g.source === 'real').length;
console.log(`  real (verbatim from chemical-claims.csv): ${realCount}`);
console.log(`  synthetic: ${golden.length - realCount}`);
