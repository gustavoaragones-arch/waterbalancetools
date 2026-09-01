# Phase 7W -- Shock Product-Selector Implementation Detail

Implements Option B, approved in `reports/phase-7u/SHOCK-ARCHITECTURE-DECISION.md` and authorized for this dedicated phase. This is an implementation, not a re-decision -- no alternative shock architecture was investigated or considered.

## Old generic behavior (removed)

- `js/calc-utils.js` `calculateShock(gallons, targetPpm)`: `oz = (gallons × ppm) / 10000`. Phase 7T established this divisor implies a physically impossible 133.44%-available-chlorine product.
- `js/calculator.js` `granularShockOunces(gallons, ppm)`: the identical divisor, used only by `chemical-calculator.html`'s "Granular shock" chlorine-type option.
- Both functions have been **removed** from their files' exported API (not left as unused dead code, matching the Phase 7V precedent for the old pH functions) -- there is no remaining code path that can produce a number from the generic divisor.

## New product-specific behavior

`js/calc-utils.js` `SHOCK_PRODUCTS` (6 entries) and `calculateShockByProduct(gallons, targetPpm, productId)`; `js/calculator.js` `GRANULAR_PRODUCTS` (3 entries, the dry products not already covered by `liquidChlorineOunces`/`tabletChlorineOunces`) and `granularChlorineOuncesForProduct(gallons, ppm, productId)`. Both compute:

```
oz = targetPpm × gallons × 0.013344 ÷ product.activePercent
```

-- the exact constant already approved for liquid chlorine (`formula-02`, Phase 7S) and calcium hypochlorite (`formula-03`, Phase 7T). No new constant was derived; no existing constant was modified.

**Traceability chain (Section 5):**
```
USER INPUT (gallons, target ppm, product selection)
  → PRODUCT ID (e.g. 'calcium-hypochlorite-65pct')
  → APPROVED PRODUCT DATA (SHOCK_PRODUCTS[productId].activePercent = 65, mirrored from
    scripts/data/dataset-dosage-matrices.js's calcium-hypochlorite-65pct record)
  → MASS-BALANCE INPUT (0.013344 constant, already approved formula-02/formula-03)
  → RESULT (oz = targetPpm × gallons × 0.013344 / 65)
```

**Verification:** `calculateShockByProduct(20000, 4, 'calcium-hypochlorite-65pct')` → 16.42 oz, 1.03 lbs -- exactly matches `formula-03`'s existing, Phase-7T-approved worked example for the identical inputs. `granularChlorineOuncesForProduct` (calculator.js) produces byte-identical results for the same product/inputs, confirming the two duplicate implementations stayed in sync.

## Product selector contract (Section 4)

**`pool-shock-calculator.html`:** 6 named products (Liquid Chlorine 10%/12.5%, Calcium Hypochlorite 65%/73%, Sodium Dichlor 56%, Trichlor Tablets 90%) plus "I don't know my product" -- exactly the set `dataset-dosage-matrices.js` supports for `residential-pool`/`outdoor-pool`.

**`hot-tub-shock-calculator.html`:** 4 named products (Liquid Chlorine 10%/12.5%, Calcium Hypochlorite 65%/73%) plus "I don't know my product" -- narrower than the pool selector, directly traceable to the dataset's own `supportedPoolTypes` field excluding sodium dichlor and trichlor tablets for hot tubs.

**`chemical-calculator.html`:** the existing "Chlorine type" selector's single "Granular shock" option was replaced with 3 specific products (Calcium Hypochlorite 65%/73%, Sodium Dichlor 56%) -- trichlor is not offered here since it is already covered by the existing, unchanged "Chlorine tablets" option, and this calculator's own framing (routine chlorine + pH balance, not "shock") does not include the hot-tub-only exclusion logic since it does not distinguish pool/hot-tub product support the way the dedicated calculators now do (a scope decision: this calculator's existing water-type toggle affects only target ranges, not chlorine-type options, and changing that is outside this phase's mandate).

No vague "Shock"/"Granular"/"Chlorine shock" option remains as a *calculation* path -- "granular" now only appears as a category prefix on specific, named products.

## Shock scenario semantics preserved (Section 6)

The calculators' existing scope is unchanged: flat, user-chosen target-FC-increase presets (5/10/15/20 ppm), explicitly not a breakpoint-chlorination calculator. No combined-chlorine input was added. No claim of appropriateness for fecal-incident, contamination, or public-facility response was added or implied -- none existed before this phase, and none exists now. No new scenario selector was added; only the product dimension changed.

## Product-specific safety notes (Section 7)

Surfaced directly in the result text when a mixing hazard applies: calcium hypochlorite and trichlor both display "Do not mix with [the other] or other chlorinating agents," sourced from the already-registered `claim-trichlor-calhypo-mixing-hazard` (Phase 7K, backed by manufacturer SDS documents, a PHTA fact sheet, and CPSC/CDC sources) and the corresponding `notes` fields already present in `dataset-dosage-matrices.js`. No new safety language was invented; no product-specific warning was broadened into a universal claim (e.g., the mixing warning is shown only for the 2 products it actually applies to, not attached to liquid chlorine or sodium dichlor).

## Formula-03 alignment (Section 8)

`scripts/data/formulas-data.js` `formula-03`'s mathematical content (equation, constant, worked example) was **not reopened** -- Phase 7T's derivation stands unchanged. Added: an explanation paragraph stating the equation is now directly implemented by the live calculators and describing the selector's mechanism; a paragraph stating what the calculators do NOT compute (breakpoint dosing, a generic/unspecified-product number); and limitations additions covering the mixing hazard and the still-unresolved generic-divisor/breakpoint-architecture questions (both explicitly carried forward, not addressed here).

## Trust panel / provenance alignment (Section 9-10)

`scripts/data/trust-calculator-metadata.js`: `pool-shock-calculator` and `hot-tub-shock-calculator` entries' `notes` rewritten to state the product-specific mechanism and its evidence basis, explicitly disclose that combined chlorine is still not read and breakpoint dosing is still not computed, and describe the "I don't know" fallback. `entityDependencies` corrected to remove `combined-chlorine` (never read, before or after this phase). `chemical-calculator`'s entry gained `formula-shock-dose` in `formulaIds` (the granular options now use that formula) and its notes were extended accordingly. `scripts/data/trust-formulas.js`'s `formula-shock-dose` record -- a **separate registry** discovered during this phase's inspection, previously describing a breakpoint-style formula the calculator never implemented -- was corrected to describe the actual, now-live product-specific formula. No new chemistry source or claim record was created; all evidence reused from Phase 7S/7T/7U/7K registrations. No language claiming "scientifically proven," "expert reviewed," "professionally approved," or "laboratory validated" was used or existed before.

## UI requirements (Section 11)

Every result now states: pool/hot tub volume (from the existing input), the selected product's name, the calculated amount (oz, with lbs for the pool calculator matching the prior output format), the applicable mixing-hazard note where relevant, and the existing pump-run/retest guidance (unchanged wording, e.g. "Run pump 4-6 hours. Re-test before swimming."). No new input beyond the product selector was added -- available-chlorine percentage, product concentration, and purity are all encoded in the selected product's record, never asked of the user. The "I don't know" path gives qualitative guidance only (no number), directing the user to select a product and follow label instructions, mirroring the pH calculator's Option A qualitative-fallback pattern from Phase 7V.

## Consumer audit (Section 12)

All 3 live consumers of the shock-related functions (`pool-shock-calculator.html`, `hot-tub-shock-calculator.html`, `chemical-calculator.html`) were found and updated to the same approved product/selector contract -- no consumer was left on the old generic model. Confirmed via `grep` that no other page references `calculateShock` or `granularShockOunces` (both now removed).

## Programmatic-family boundary (Section 13)

`programmatic/shock/*`, `programmatic/chlorine/*`, `programmatic/ph/*`, `programmatic/hot-tubs/*` were not modified -- confirmed via `git diff --stat` showing zero files touched in `programmatic/`. Several `programmatic/shock/*` pages and one non-programmatic guide (`guides/chlorine/free-chlorine-vs-total-chlorine.html`) were found during the sitewide sweep to contain language implying the shock calculator computes a breakpoint dose -- this predates Phase 7W (the calculator never read combined chlorine, before or after this phase) and is not newly made false by this implementation, so per the established Phase 7V precedent for an analogous discovery, it was documented in `REVIEW-QUEUE.md` rather than fixed.
