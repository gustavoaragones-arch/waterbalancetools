# Phase 7S -- Fresh Baseline

Established by running `npm run build` and the applicable validators on the Phase 7R-committed state (`219a57d`) before any Phase 7S production change was made, and by directly re-reading `js/calc-utils.js`, `js/calculator.js`, `scripts/data/formulas-data.js`, and every relevant dataset from the actual current source files -- not assumed from Phase 7R's own report.

## Build

`npm run build`: PASS. QA 99/100, 0 errors, 6 warnings (unchanged from Phase 7R).

## Fresh reproduction of the Phase 7R findings

All 4 Phase 7R findings were independently reproduced from the live source files before any change:

1. **Liquid chlorine**: `js/calc-utils.js`'s `calculateChlorine` used a `/128000` divisor for `type === 'liquid'`. `scripts/data/formulas-data.js`'s `formula-02` documented equation used `Strength% x 0.0128` as a divisor. Applying the documented equation to its own worked example (20,000 gal, 2.5 ppm increase, 10% product) gives 390,625 fl oz; the worked example's own text says "Wait -- that looks wrong. Let's recheck," then switches to an undocumented alternate method. Confirmed exactly as Phase 7R described.
2. **LSI**: `formulas/lsi-formula.html`'s worked example computed LSI = 1.6, then -2.2 (with a trailing "?"), then -0.2, for the same stated inputs. Confirmed exactly as described.
3. **Alkalinity**: `js/calc-utils.js`'s `calculateAlkalinity` used a `1.4` multiplier; `formulas-data.js`'s `formula-05` explanation text stated "1.5 lbs per 10,000 gallons." Confirmed.
4. **pH adjustment**: `formulas-data.js`'s `formula-04` worked example computes the documented equation partway, then switches to an unreferenced "commonly used rule-of-thumb" without reconciling. Confirmed.

## New findings surfaced during fresh reproduction (not in the Phase 7R report)

- **`js/calculator.js` is a second, independent, duplicate implementation** of the liquid/granular/tablets chlorine formulas and the pH-adjustment formulas, used by `calculators/chemical-calculator.html` -- numerically identical to (and therefore equally affected by) the `js/calc-utils.js` bugs. Phase 7R's audit did not examine this file.
- **`data/datasets/dosage-matrices.json`** (a separate, structured "canonical dosage matrices" dataset the site itself describes as "used by all calculators and generators") has its own liquid-chlorine coefficients, and they were ALSO wrong -- and wrong in a specific, diagnosable way (the "10%" record's coefficient exactly matched a 12% product per an authoritative government table). This dataset was not examined by Phase 7R.
- **`calculators/chemical-calculator.html`'s trust panel explicitly claimed** ("Formulas Used": Langelier Saturation Index (LSI)) that the calculator computes LSI. It does not -- confirmed via direct inspection of `js/calculator.js` (zero LSI/TF/CHF/TAF references). Phase 7R's LSI audit did not check calculator-page trust-panel claims against actual JS behavior.
- **`data/datasets/water-balance.json` already contains a complete, sourced LSI lookup-table dataset** (temperature/calcium-hardness/total-alkalinity factor tables, attributed to Taylor Technologies, plus target/warning/critical ranges and a documented CYA-correction note). Phase 7R's report stated "no LSI lookup-table data exists in the repository" -- this is corrected in this phase's findings; the data layer exists and is well-sourced, but no computation code reads it.
- **`data/academy.json` architecture risk (discovered and immediately remediated during this phase, unrelated to calculators):** running `scripts/populate-data.js` (needed to sync the corrected `formulas-data.js` into `data/formulas.json`) also regenerates `data/academy.json` from 8 separate `scripts/data/academy-*.js` source files -- and 2 academy articles (`new-pool-startup-chemistry` from Phase 7P, `indoor-pool-chemistry`) exist only as direct edits to the generated `data/academy.json`, not in any of those source files. Running `populate-data.js` silently deleted both. Caught immediately via a fresh Phase 7P/7M validator run, restored from the Phase 7R git commit, and NOT re-triggered for the remainder of this phase. Documented as a real, pre-existing (not Phase-7S-caused) infrastructure gap in the review queue.

## Citation coverage (pre-Phase-7S)

23 citation blocks, 29 citation links (Phase 7R's ending state, re-verified via `validate-citation-coverage.js`).

## Chemistry knowledge registry (pre-Phase-7S)

19 sources, 19 claims, 25 ranges (Phase 7R's ending state).
