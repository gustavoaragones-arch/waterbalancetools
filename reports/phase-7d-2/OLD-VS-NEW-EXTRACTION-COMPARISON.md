# Old vs. New Extraction System — Independent Comparison

This report compares the OLD system (Phase 7D's `reconcile-claims.js`) and the NEW system (Phase 7D.1/7D.2's `extract-claims-v2.js` + `reconcile-claims-v2.js`) against an INDEPENDENT REFERENCE — never against each other directly, and never using the new extractor as the ground truth for judging the old one (that was Phase 7D.1's methodological flaw; see `PHASE-7D-2-INDEPENDENT-VALIDATION.md` Section 1).

The independent reference is two things, both built without ever calling `extractFromSentence()`:
1. `scripts/data/chemistry-extraction-golden-set-v2.json` — 104 hand-authored test cases.
2. `reports/phase-7d-2/INDEPENDENT-OLD-EXTRACTION-AUDIT.csv` — 136 real claims, each independently read and classified from the source sentence.

## OLD SYSTEM

Architecture: whole-sentence, first-match-wins keyword search (`scripts/phase-7d/reconcile-claims.js`). One parameter tag per claim, no value/unit/context fields, no proximity awareness.

Independent audit results (136 stratified real claims, judged from source text):

| Classification | Count | % |
|---|---:|---:|
| CORRECT | 84 | 61.8% |
| PARAMETER_MISCLASSIFICATION | 22 | 16.2% |
| MISSED_CLAIM | 13 | 9.6% |
| LEGITIMATE_AMBIGUITY | 15 | 11.0% |
| NON_CHEMISTRY_NUMERIC | 2 | 1.5% |
| VALUE_MISCLASSIFICATION | 0 | 0% |
| UNIT_MISCLASSIFICATION | 0 | 0% |
| CONTEXT_MISCLASSIFICATION | 0 | 0% |

VALUE/UNIT/CONTEXT_MISCLASSIFICATION are structurally impossible for the old system to commit in a way this audit can observe: `chemistry-coverage.csv` (the old output) has no value, unit, minimum/maximum, or environment columns at all — it is a single topic tag per claim, not a per-number extraction. Every old-system error this audit found is therefore a parameter-topic error (misclassification) or a structural inability to represent more than one parameter per sentence (missed claim).

The dominant, systemic failure pattern in the 22 PARAMETER_MISCLASSIFICATION rows: **pH as a false attractor**. In 14 of the 22, `pH` was the old system's tag while the true numeric/topical subject was something else entirely (total_alkalinity, water_temperature, LSI, cyanuric_acid, calcium_hardness) — confirming the user's original report, independently, on new evidence not used to build the fix. A second, distinct pattern: **navigation/menu chrome mistaken for a substantive claim** (7 of 22) — heading and related-links blocks that mention a parameter name once among many unrelated topics, with no real value at stake. The MISSED_CLAIM rows (13) are a different failure mode entirely: real, multi-parameter reference tables and composite sentences (e.g. "Free chlorine: 1-3 ppm ... pH: 7.2-7.6 ... Total alkalinity: 80-120 ppm ...") where the old one-tag-per-claim model can only ever record one of the parameters present, silently dropping the rest.

## NEW SYSTEM

Architecture: clause-splitting + proximity-based parameter attribution + explicit impossible-pairing rejection + separated `extraction_status`/`scientific_review_status` (`scripts/phase-7d-1/extract-claims-v2.js`, `reconcile-claims-v2.js`).

Independent evidence:
- Golden set v2: **104/104 pass** (21 real verbatim sentences, 83 synthetic; see `PHASE-7D-2-INDEPENDENT-VALIDATION.md` for the full circularity fix and iteration history).
- Dedicated regression suite (Steps 9-12, `test-extraction-regression.js`): **24/24 assertions pass**.
- Impossible-mapping leakage: **0 leaked** across 15 named pairings (2 resolve safely to a different, correct parameter instead of the literal named one — documented as such, not hidden).

Three real defects were found and fixed during the *authoring* of the independent golden set (not by running the extractor and rubber-stamping its output — by hand-tracing expected values first, then discovering the code disagreed, then determining the code was wrong):
1. Unrecognized "ounces" unit let a dosage number silently inherit a nearby pH mention's `ph_value` type.
2. Unrecognized time-duration units (hours/minutes/days) had the same effect for "wait N hours" / "allow N hours" phrasing.
3. A regex alternation bug silently truncated any comma-less 4+ digit number (e.g. "18000", "3200") to its first 1-3 digits, corrupting real values throughout the corpus (salt ppm, pool volumes, TDS, years).

All three are fixed in `extract-claims-v2.js`. Two additional, lower-severity residual limitations were found and are documented, not fixed in this phase (see `PHASE-7D-2-INDEPENDENT-VALIDATION.md` Section 7): (a) raw character-distance proximity is not grammar-aware and can occasionally prefer a farther-in-meaning-but-closer-in-characters mention over the grammatically bound one; (b) the unit-attachment regex requires whitespace, not a hyphen, so hyphenated compounds like "10,000-gallon" never attach their unit.

## INDEPENDENT REFERENCE

Golden-set-v2 (104 cases) and the old-extraction audit (136 cases) are the independent reference for this comparison. Neither was generated by, nor validated against, `extractFromSentence()`'s own output at authoring time. Golden-set-v2 failures found during authoring were triaged case-by-case per Step 17's policy (extractor fixed for genuine bugs; expected value corrected for genuine hand-tracing mistakes, each documented inline in `build-golden-set-v2.js`).

## Bottom line

The new system's proximity-based architecture directly and measurably fixes the old system's dominant, most consequential failure mode (pH as a false attractor for any nearby number) and its structural inability to represent composite, multi-parameter sentences. It introduces its own, smaller, now-mostly-fixed set of unit-recognition gaps, all caught by exactly the kind of independent, non-circular testing this phase was created to perform.
