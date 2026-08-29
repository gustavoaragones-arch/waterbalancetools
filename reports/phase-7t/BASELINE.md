# Phase 7T -- Baseline

## Starting state

HEAD verified at `d5cbe3f` (Phase 7S commit) before any Phase 7T change. Working tree clean.

`npm run build` was run to confirm the build succeeds and to surface the same pre-existing, sitewide latent template/injector drift Phase 7S documented (~207-225 pages regenerate with real, non-whitespace differences against their committed content -- unrelated to any calculator, not caused by this phase). Every file touched only by that drift was reverted to its exact `d5cbe3f` committed state (`git checkout HEAD -- <file>`) before Phase 7T work began, plus one empty untracked directory (`programmatic/alkalinity/`) created as a build side effect, removed. This is the same pattern and the same finding Phase 7S already flagged in `reports/phase-7s/REVIEW-QUEUE.md` -- not re-investigated further here, since it is out of this phase's mandate (Section 19).

`validate-phase-7s.js`: PASS, 0 errors, 0 warnings. `test-phase-7s.js`: 17/17 PASS. Spot-checked prior validators (`validate-phase-7h.js`, `validate-phase-7m.js`) and `check-broken-links.js`: all PASS clean on the restored baseline tree.

## Phase 7S documents read in full

`PHASE-7S-STATUS.md`, `DECISION-MATRIX.csv`, `REVIEW-QUEUE.md`, `CALCULATOR-FORMULA-INVENTORY.csv`, `LIQUID-CHLORINE-AUDIT.md`, `ALKALINITY-AUDIT.md`, `PH-AUDIT.md`, `SHOCK-AUDIT.md`, `PRODUCTION-CHANGES.md`.

## Phase 7S carry-forward queue reproduced fresh from current source

1. **pH-adjustment model** (`formula-04`, `js/calc-utils.js` `calculatePHAdjustment`, `js/calculator.js` `phIncreaserOunces`/`phReducerOunces`): confirmed still using a pure `(gallons/10000) × ΔpH × constant` model with no total-alkalinity input anywhere in the calculator UI or JS. Constants (6 for increaser, 5 for reducer) unchanged since Phase 7S. `formula-04`'s documented equation (`ΔpH × Volume × (0.0833 ÷ Acid%)`) still diverges from the live implementation's constants and still contains an abandoned-mid-calculation worked example (computes a partial "Dose = 0.4 × 15,000 × 0.264 ÷ 10,000" that is never carried to a final number before switching to an unrelated rule-of-thumb estimate).
2. **Generic granular/shock divisor** (`js/calc-utils.js` `calculateChlorine`'s `granular`/`shock` branch and the standalone `calculateShock` function, both dividing by `10000`, i.e. an implicit 1 oz/10,000 gal/1 ppm assumption): confirmed unchanged, still not tied to any named product.
3. **`formula-03` calcium hypochlorite equation**: confirmed the pre-fix equation `[(Target FC − Current FC) × Volume] ÷ [Available Chlorine% × 800]` and the oz/lbs unit-labeling inconsistency Phase 7S found (equation header says "oz", worked example computes and labels the result "lbs") both still present, unchanged, at the start of this phase.
4. **Shock calculator architecture**: confirmed `calculators/pool-shock-calculator.html` still offers 4 fixed presets (Light 5 ppm / Standard 10 ppm / Heavy 15 ppm / Double shock 20 ppm), does not collect a combined-chlorine reading, and its trust panel still carries the Phase 7S-authored disclosure ("Breakpoint chlorination target (10x combined chlorine) is an industry rule of thumb, not independently confirmed by a primary source. This calculator also does not read the user's actual combined-chlorine reading.").

## Authoritative implementation/data files inspected

`js/calc-utils.js`, `js/calculator.js`, `scripts/data/formulas-data.js` (`formula-03`, `formula-04` read in full; all 9 formulas scanned for cross-consistency), `data/datasets/dosage-matrices.json` and its true source `scripts/data/dataset-dosage-matrices.js`, `scripts/generate-formulas.js`, `formulas/shock-formula.html`, `formulas/ph-adjustment-formula.html`, `calculators/pool-shock-calculator.html`, `scripts/data/chemistry-sources.js`, `scripts/data/chemistry-claims.js`, `scripts/data/chemistry-ranges.js`.

No Phase 7S RESOLVED decision (liquid chlorine, alkalinity, LSI documentation) was found to require reopening based on this fresh read -- see the Alkalinity Fact Sheet finding in `REVIEW-QUEUE.md` for the one borderline case, which does not meet the "materially wrong" bar.
