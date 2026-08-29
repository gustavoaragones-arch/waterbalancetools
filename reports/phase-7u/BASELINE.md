# Phase 7U -- Baseline

## Starting state

HEAD verified at `6cf09af` (Phase 7T commit). Working tree clean. `npm run build` run; the same pre-existing, sitewide latent template/injector drift Phase 7S/7T documented resurfaced (unrelated to any calculator) and was reverted to the exact `6cf09af` committed state before any Phase 7U work began, plus one empty untracked directory (`programmatic/alkalinity/`) created as a build side effect, removed -- identical pattern to prior phases, not re-investigated further (out of mandate, Section 19).

`validate-phase-7t.js`: PASS, 0 errors, 0 warnings. `test-phase-7t.js`: 15/15 PASS. `validate-phase-7h.js` and `check-broken-links.js` spot-checked: both PASS clean on the restored baseline tree.

## Phase 7T documents read in full

`PHASE-7T-STATUS.md`, `BASELINE.md`, `PH-AUDIT.md`, `SHOCK-DIVISOR-AUDIT.md`, `FORMULA-03-AUDIT.md`, `SHOCK-ARCHITECTURE-AUDIT.md`, `CROSS-CALCULATOR-CONSISTENCY.md`, `FORMULA-DECISION-LEDGER.csv`, `REVIEW-QUEUE.md`.

## Current implementation re-inspected fresh from source

- `js/calc-utils.js` `calculatePHAdjustment`: unchanged since Phase 7T -- volume, current pH, target pH only; constants 6 (increaser)/5 (reducer); no TA/CYA/temperature/product input.
- `js/calculator.js` `phIncreaserOunces`/`phReducerOunces`: unchanged, same constants, duplicate implementation.
- `js/calc-utils.js` `calculateChlorine`'s `granular`/`shock` branch and `calculateShock`: unchanged, generic `10000` divisor, no product-identity input.
- `calculators/pool-ph-calculator.html` / `hot-tub-ph-calculator.html`: unchanged. Existing trust-panel disclosure: *"Linear pH adjustment approximation. Most accurate within ±0.5 pH units of target."* -- discloses imprecision but not the missing-TA/CYA architectural gap Phase 7T established.
- `calculators/pool-shock-calculator.html` / `hot-tub-shock-calculator.html`: unchanged. 4 fixed FC-increase presets (5/10/15/20 ppm); existing trust-panel disclosure already states the breakpoint/CC limitation (Phase 7S).
- `scripts/data/formulas-data.js` `formula-03` (RESOLVED, Phase 7T) and `formula-02` (RESOLVED, Phase 7S): unchanged, confirmed intact.
- `scripts/data/dataset-dosage-matrices.js`: read in full this phase (not previously read end-to-end in 7S/7T beyond the specific records those phases corrected). 13 records. Notably:
  - 4 dry chlorine-shock product records (`calcium-hypochlorite-65pct`, `calcium-hypochlorite-73pct`, `sodium-dichlor-56pct`, `trichlor-tablets-90pct`) carry coefficients that, cross-checked against Phase 7T's own `FORMULA-03-AUDIT.md`/`SHOCK-DIVISOR-AUDIT.md` comparison tables, match the PHTA Water Chemistry Adjustment Guide (fetched and read in full, Phase 7T) to within normal rounding -- even though the dataset file's own inline comments do not yet cite that cross-validation (only the 2 liquid-chlorine records, corrected in Phase 7S, carry inline phase/source citations).
  - 1 pH-relevant record (`muriatic-acid-31pct-ph`, "1.3 fl oz lowers pH by 0.1 per 10,000 gal") has no citation of any kind and is not referenced by any claim, formula, or calculator. Confirmed via `grep` that this dataset is not read by any calculator's live JS -- only by `generate-datasets.js` (writes `data/datasets/dosage-matrices.json`, a reference/documentation page) and `validate-datasets.js` (structural checks only, not evidentiary).
- `calculators/`, formula pages, and trust panels for all six calculators in scope (liquid chlorine, generic/granular chlorine, shock, pH, alkalinity, CYA) re-read for the input-contract work in this phase.

No Phase 7S or Phase 7T `RESOLVED` decision (liquid chlorine, alkalinity, LSI documentation, formula-03) was found to require reopening.
