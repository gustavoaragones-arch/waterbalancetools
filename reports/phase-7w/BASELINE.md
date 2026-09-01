# Phase 7W -- Baseline

## Starting state

HEAD verified at `cd91013` (Phase 7V commit). Working tree clean. `npm run build` run; the same pre-existing, sitewide latent template/injector drift documented since Phase 7S resurfaced and was reverted before any Phase 7W work began, plus one empty untracked directory (`programmatic/alkalinity/`) created as a build side effect, removed. `validate-phase-7v.js`: PASS, 0 errors. `test-phase-7v.js`: 28/28 PASS. `check-broken-links.js`: PASS, 0/526.

## Artifacts read in full

`reports/phase-7u/SHOCK-ARCHITECTURE-DECISION.md`, `reports/phase-7u/INPUT-CONTRACTS.md` (shock Option B section), `reports/phase-7u/FORMULA-GOVERNANCE.md`, `reports/phase-7u/REVIEW-QUEUE.md`, `reports/phase-7s/SHOCK-AUDIT.md`, `reports/phase-7t/SHOCK-DIVISOR-AUDIT.md`, `reports/phase-7t/FORMULA-03-AUDIT.md`, `reports/phase-7v/PHASE-7V-STATUS.md`, `reports/phase-7v/REVIEW-QUEUE.md`.

## Files inspected and their actual dependency graph

- `js/calc-utils.js` `calculateShock(gallons, targetPpm)`: the generic divisor (`oz = gallons*ppm/10000`), used by `pool-shock-calculator.html`/`hot-tub-shock-calculator.html` only.
- `js/calculator.js` `granularShockOunces`/`chlorineOuncesForType('granular', ...)`: the same generic divisor, used only by `calculators/chemical-calculator.html`'s "Granular shock" chlorine-type option. Confirmed via `grep` that no other page references either function.
- `calculators/pool-shock-calculator.html`, `calculators/hot-tub-shock-calculator.html`: both load `js/calc-utils.js`, form has `#volume` and `#strength` (target ppm) inputs, no product selector prior to this phase.
- `calculators/chemical-calculator.html`: loads `js/calculator.js`. Its `#chlorine-type` `<select>` (liquid/granular/tablets) already used **product-specific, Phase-7S-approved constants for "liquid" and "tablets"** (749.4 and 6666.7 divisors respectively) -- only "granular" remained on the unsupported generic divisor. Confirmed its own FAQ explicitly frames this tool as distinct from "the shock calculator" ("Use the shock calculator for big raises; use this tool for ongoing balance"), so its granular option was determined to be the same underlying defect (ledger item 7T-02 in `reports/phase-7t/FORMULA-DECISION-LEDGER.csv` explicitly groups `calc-utils.js`'s shock branch and `calculator.js`'s `granularShockOunces` as one unresolved item), not a separate scenario -- both fixed together.
- `scripts/data/dataset-dosage-matrices.js`: read in full. 6 chlorine-relevant records (`parameter: 'free-chlorine'`): `liquid-chlorine-10pct`, `liquid-chlorine-12pct`, `calcium-hypochlorite-65pct`, `calcium-hypochlorite-73pct`, `sodium-dichlor-56pct`, `trichlor-tablets-90pct`. All already carry Phase 7U cross-validation citations in their `notes` field except the two liquid-chlorine records (Phase 7S citations).
- `scripts/data/chemistry-sources.js`, `scripts/data/chemistry-claims.js`: checked for existing safety evidence -- found `claim-trichlor-calhypo-mixing-hazard` (Phase 7K), backed by manufacturer SDS documents, a PHTA fact sheet, and CPSC/CDC sources, already formally registered. No new source or claim record was needed or added this phase.
- `scripts/data/formulas-data.js` `formula-03`: already correct (Phase 7T `RESOLVED`) -- equation, constant, and worked example required no mathematical change, only documentation of the now-live implementation.
- `scripts/data/trust-calculator-metadata.js`: `pool-shock-calculator`, `hot-tub-shock-calculator`, `chemical-calculator` entries inspected.
- `scripts/data/trust-formulas.js`: a **separate** trust-formula registry (distinct from `formulas-data.js`, feeding `data/trust/formulas.json` -> the "Formulas Used" trust-panel link title via `scripts/inject-trust-panels.js`'s `FORMULA_MAP`). Its `formula-shock-dose` record was found to describe a **breakpoint-style formula** (`shockTarget = max(10 x combinedChlorine, shockMinFC); ...`) that the live calculator had never implemented -- a stale, aspirational description, not a defect this phase introduced, but one this phase's implementation makes newly worth correcting since the record must now accurately describe what changed.
- Generators: `scripts/generate-formulas.js` (formula pages, unchanged logic), `scripts/generate-trust.js` (reads `trust-calculator-metadata.js` and `trust-formulas.js`, writes `data/trust/datasets.json` and `data/trust/formulas.json`), `scripts/inject-trust-panels.js` (idempotent-by-marker; strip-and-reinject required for each touched calculator page, per established pattern).
- Existing validators/tests: `scripts/validate-phase-7v.js`/`test-phase-7v.js`, `scripts/validate-phase-7u.js`/`test-phase-7u.js` inspected as the template for this phase's own `validate-phase-7w.js`/`test-phase-7w.js`.

## Internal shock data-contract audit (Section 3)

**A. Which shock products already have product-specific dosage data?** 6 chlorine-relevant records in `dataset-dosage-matrices.js` (listed above).

**B. Exact units stored:** `coefficient` in the product's natural retail unit (`fl oz` for liquid, `oz (dry)` for solids), `coefficientGrams` for the 100%-basis mass, `activePercent` as a whole-number percentage (e.g. `65` for 65%).

**C. Pool volume units expected:** gallons (`volumeUnit: 'gallons'`, `volumeBase: 10000`), matching every existing calculator's input.

**D. Chlorine-available concentration/dosage basis:** `activePercent`, used directly (not `coefficient`, which is a pre-rounded, product-form-specific figure) -- the live implementation computes from `activePercent` via the exact `0.013344` mass-balance constant, so the two stay traceably consistent without duplicating rounded numbers that could drift.

**E. Source supporting each product-specific value:** all 6 records' `notes` fields cite Phase 7S/7T cross-validation against PHTA's Water Chemistry Adjustment Guide and/or the Indiana DOH table (both fetched and read in full in prior phases).

**F. Genuinely supported vs. merely named:** all 6 chlorine-relevant records are genuinely supported (cross-validated coefficients, explicit `supportedPoolTypes`). The dataset's other records (`muriatic-acid-31pct-ph`, `soda-ash-100pct-ph`, `baking-soda-100pct-ta`, `calcium-chloride-77pct-ch`, `stabilizer-100pct-cya`, `pool-salt-99pct`) are for different parameters (pH, TA, CH, CYA, salt) and are **not shock products** -- correctly out of scope for this phase.

**G. Products that cannot safely be supported by the selector:** none of the 6 chlorine-relevant records were excluded -- all 6 are supported for the pool calculator. For the **hot tub** calculator specifically, `sodium-dichlor-56pct` and `trichlor-tablets-90pct` are excluded: the dataset's own `supportedPoolTypes` field lists only `residential-pool`/`outdoor-pool` for both (no `hot-tub`), while the other 4 records explicitly list `hot-tub`. This is existing, already-approved data, not a new judgment call -- the selector's product lists are directly traceable to it.

**H. Already-approved/cross-validated records:** all 6, per E above -- no coefficient was invented or re-derived differently from the already-established `0.013344`-constant approach.

## No new manufacturer/product coefficient was invented this phase.
