# Phase 7W -- Production Changes

Every change made at the smallest authoritative source; full derivation in `SHOCK-IMPLEMENTATION.md`, full evidence trail in `FORMULA-DECISION-LEDGER.csv`.

## 1. `js/calc-utils.js`

**OLD:** `calculateShock(gallons, targetPpm)`: `oz = (gallons × ppm) / 10000` -- generic, unsupported divisor (Phase 7T: implies a physically impossible 133.44%-available product).
**NEW:** `calculateShock` removed entirely. Added `SHOCK_PRODUCTS` (6 records: liquid chlorine 10%/12.5%, calcium hypochlorite 65%/73%, sodium dichlor 56%, trichlor tablets 90%, each with `activePercent`, CYA/calcium contribution, and mixing-warning/notes mirrored from `scripts/data/dataset-dosage-matrices.js`) and `calculateShockByProduct(gallons, targetPpm, productId)`, computing `oz = ppm × gallons × 0.013344 / activePercent`.
**REASON:** Phase 7U Option B, authorized for implementation this phase.
**SOURCE/EVIDENCE:** `phta-water-chemistry-adjustment-guide-2021`, `in-doh-chemical-adjustment-2021`, `phta-calcium-hypochlorite-fact-sheet-2021` (all previously fetched and registered, Phase 7T/7U); `claim-trichlor-calhypo-mixing-hazard` (Phase 7K) for the mixing warning.
**RISK:** Low -- verified against `formula-03`'s existing worked example (16.42 oz for 65% cal-hypo, 4ppm, 20,000gal) with an exact match.
**VALIDATION:** `node -e` direct function calls for all 6 products plus invalid-input cases (0 volume, 0 ppm, unknown product ID) -- all return `{valid:false}` safely.

## 2. `js/calculator.js`

**OLD:** `granularShockOunces(gallons, ppm)` and the `'granular'` case in `chlorineOuncesForType`: same generic divisor.
**NEW:** Both removed. Added `GRANULAR_PRODUCTS` (3 records: calcium hypochlorite 65%/73%, sodium dichlor 56% -- the dry products not already covered by `liquidChlorineOunces`/`tabletChlorineOunces`) and `granularChlorineOuncesForProduct(gallons, ppm, productId)`, identical formula to item 1.
**REASON/SOURCE/RISK:** Same as item 1; mirrored per the established duplicate-implementation pattern (Phase 7S/7T/7V).
**VALIDATION:** Confirmed byte-identical output to `js/calc-utils.js`'s function for the same product/inputs.

## 3. `calculators/pool-shock-calculator.html`

**OLD:** Volume + target-ppm-preset inputs only; submit handler called `calculateShock`; output: `'Add X oz (Y lb) granular shock...'`. Meta/hero/FAQ described "granular ounces" generically.
**NEW:** Added a 6-product selector (+ "I don't know my product"). Submit handler calls `calculateShockByProduct`; output includes the specific product name and, where applicable, its mixing-hazard note. The "I don't know" path returns qualitative guidance only (no number). Meta description, title, og/twitter tags, hero subtitle, and one FAQ item rewritten to reflect the product-specific model.
**RISK:** Low -- no other input changed; existing preset values (5/10/15/20 ppm) unchanged.
**VALIDATION:** Manual read-through of all 6 product + fallback output strings; `validate-phase-7i.js` re-run after a title-length correction (68→57 chars is `hot-tub`'s fix; this page's title is 65 chars, at the limit but passing).

## 4. `calculators/hot-tub-shock-calculator.html`

Same pattern as item 3, with a narrower 4-product selector (liquid chlorine and calcium hypochlorite only -- sodium dichlor and trichlor excluded per `dataset-dosage-matrices.js`'s own `supportedPoolTypes`, which does not list `hot-tub` for either). Existing "Run jets 15-20 min" instruction preserved. Title shortened to 57 characters after `validate-phase-7i.js` flagged the initial version as too long (68 chars) -- a genuine regression caught and fixed during this phase's own regression sweep.

## 5. `calculators/chemical-calculator.html`

**OLD:** "Chlorine type" selector offered `liquid` / `granular` / `tablets`; `granular` called `granularShockOunces` (generic divisor). "Liquid" and "tablets" already used Phase-7S-approved product-specific constants.
**NEW:** "Granular" replaced with 3 named products (calcium hypochlorite 65%/73%, sodium dichlor 56%); submit handler branches to `granularChlorineOuncesForProduct` for these, unchanged `chlorineOuncesForType` for liquid/tablets. Output line includes the product name and mixing warning where applicable.
**RISK:** Low-moderate (shared file with an unrelated pH calculation) -- mitigated by touching only the chlorine-computation code path; extracted-script `node -c` syntax check and manual trace confirmed the pH code path (Phase 7V's work) is untouched.
**VALIDATION:** Same as item 1's verification, invoked via this file's own call site.

## 6. `scripts/data/formulas-data.js` (`formula-03`)

**OLD:** Equation/constant/worked example already correct (Phase 7T `RESOLVED`); explanation and limitations did not describe a live implementation (none existed yet).
**NEW:** Equation and worked example **unchanged** (not reopened). Explanation extended with 2 paragraphs: what the live calculators now compute (product-specific dose via this exact formula) and what they explicitly do NOT compute (breakpoint dosing, a generic/unspecified-product number). Limitations extended with the mixing-hazard note and explicit cross-references to the still-open generic-divisor and breakpoint-architecture questions.
**REASON:** Section 8's explicit requirement to align documentation with the now-live architecture, without reopening the math.
**RISK:** None -- documentation-only.
**VALIDATION:** `node` parse check; content reviewed against Section 8's exact requirements list.

## 7. `scripts/data/trust-calculator-metadata.js`

**OLD:** `pool-shock-calculator`/`hot-tub-shock-calculator` notes covered only the breakpoint-rule-uncertainty limitation; `entityDependencies` listed `combined-chlorine` despite it never being read. `chemical-calculator`'s `formulaIds` did not include `formula-shock-dose` despite its granular option using that math.
**NEW:** Notes rewritten to state the product-specific mechanism, its evidence basis, and the unchanged limitations (CC still not read, breakpoint still not computed, "I don't know" path is qualitative-only). `combined-chlorine` removed from both shock calculators' `entityDependencies` (accurate correction, not a new limitation). `chemical-calculator` gained `formula-shock-dose` in `formulaIds` and an extended notes sentence.
**RISK:** None -- metadata only.
**VALIDATION:** `node scripts/generate-trust.js`; trust panels stripped and reinjected on all 3 pages; content verified via `grep`.

## 8. `scripts/data/trust-formulas.js`

**OLD:** `formula-shock-dose` record's `formula` field described `shockTarget = max(10 × combinedChlorine, shockMinFC); dose = (shockTarget − currentFC) × volume_gal × coefficient / 10000` -- a breakpoint-style formula the live calculator had never implemented (discovered this phase, not introduced by it).
**NEW:** Corrected to `dose (oz) = targetPpmIncrease × volume_gal × 0.013344 / product.activePercent`, matching what is now actually implemented. `variables` and `notes` updated to match.
**REASON:** This record feeds the "Formulas Used" trust-panel link title (via `scripts/inject-trust-panels.js`'s `FORMULA_MAP`, distinct from `formulas-data.js`) -- Section 9 requires the trust panel to accurately describe the live architecture, and this record was found to be inaccurate even before this phase's change made the correction newly necessary.
**RISK:** None -- metadata only, no calculator behavior depends on this record.
**VALIDATION:** `node` parse check; regenerated via `generate-trust.js`.

## Regenerated outputs (no source-of-truth beyond items 6-8)

`data/formulas.json`, `data/trust/datasets.json`, `data/trust/formulas.json`, `formulas/shock-formula.html` -- all regenerated from the corrected sources above via a full `npm run build`, with every unrelated file the build also touched (the same pre-existing sitewide template drift documented since Phase 7S) reverted before finalizing.

## Not changed

- `formula-02` (liquid chlorine, Phase 7S `RESOLVED`) -- confirmed unchanged.
- The generic granular/shock divisor concept as a *documented, unresolved* item -- `REQUIRES_EXPERT_REVIEW` for a truly generic/unspecified product remains the correct classification; this phase resolves it only for the 6 named products with approved data, per Section 5's explicit instruction not to invent a replacement generic number.
- Breakpoint-chlorination dosing -- not implemented, per explicit instruction.
- LSI, bromine calculators -- not built.
- `programmatic/chlorine/*`, `programmatic/shock/*`, `programmatic/ph/*`, `programmatic/hot-tubs/*` -- confirmed untouched via `git diff --stat`.
- `guides/chlorine/free-chlorine-vs-total-chlorine.html`'s pre-existing breakpoint/calculator conflation and several `programmatic/shock/*` pages' similar language -- discovered during the sitewide sweep, not newly made false by this implementation (the calculator never read combined chlorine, before or after), documented in `REVIEW-QUEUE.md` rather than fixed, matching the Phase 7V precedent for an analogous discovery.
- pH calculator, alkalinity calculator, CYA calculator, salt calculator, volume calculator, turnover calculator -- all confirmed unchanged.
