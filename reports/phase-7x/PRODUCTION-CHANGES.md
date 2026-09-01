# Phase 7X -- Production Changes

Every change made at the smallest authoritative source; full evidence trail in `DECISION-MATRIX.csv`, full classification reasoning in `CONTENT-AUDIT.md`.

## 1. `scripts/generate-authority-guides.js`

**OLD:** `free-chlorine-vs-total-chlorine.html`'s "How to eliminate combined chlorine" section ended with "Use the shock calculator for your exact pool size" immediately after the 10x-CC instruction.
**NEW:** Preserves the 10x-CC concept verbatim; adds an explicit statement that the calculator does not read a CC value or compute a breakpoint dose automatically; states the actual behavior (flat 5/10/15/20 ppm presets per product); gives a correct usage path (closest preset, or the existing shock dose formula page directly).
**REASON:** Priority A target, Section 6.
**RISK:** Low -- documentation-only, no calculator/formula change.
**VALIDATION:** `node scripts/generate-authority-guides.js` re-run; content verified via grep; `validate-phase-7x.js` / `test-phase-7x.js` categories B and F.

## 2. `scripts/generators/generate-shock-pages.js`

**OLD:** FAQ answer: "...Recovering from a green algae bloom calls for a much stronger breakpoint dose, about 30 ppm... Confirm with the calculator using your actual current reading."
**NEW:** 10 ppm standard-dose figure correctly attributed to the calculator's 10 ppm preset; 30 ppm algae figure reframed as a reference estimate (for 65% cal-hypo) to confirm against the product label, since the calculator's highest preset (20 ppm) cannot produce it.
**REASON:** Priority B target, Section 7. The two HowTo/steps phrases referencing "breakpoint dose... per label" were read in context and left unmodified (Category A/B -- already correctly deferred to the label, not the calculator).
**RISK:** Low -- wording only; `shockOz()`'s numeric formula and the sourced "breakpoint...30ppm" terminology itself were explicitly not touched.
**VALIDATION:** `node scripts/generators/generate-shock-pages.js` re-run for all 6 volume pages via full build; content verified via grep on all 6 output pages; `test-phase-7x.js` category G.

## 3. `scripts/data/academy-sanitizers.js`

**OLD (`breakpoint-chlorination` article):** Step 5: "Use the pool shock calculator to determine how many pounds of shock product are needed..." Worked example: "the shock calculator shows approximately 4.5 lbs of calcium hypochlorite... will raise FC by 8 ppm."
**NEW:** Step 5 states the calculator does not accept a CC reading or compute the target automatically, and gives the preset-selection/manual-formula path. Worked example corrected to the verified figure (1.54 lb; `8 x 15000 x 0.013344 / 65 / 16 = 1.54`), reattributed to direct formula application.
**OLD (`shock-treatments-explained` article):** "Weekly Shock Routine" worked example: "the shock calculator indicates 3.5 lbs of 65% cal-hypo."
**NEW:** Corrected to the verified figure (1.54 lb; `6 x 20000 x 0.013344 / 65 / 16 = 1.54`), reattributed to the shock dose formula.
**REASON:** Both worked examples contained independently-verified arithmetic errors under the already-approved 0.013344 constant, in addition to the calculator-capability misattribution.
**RISK:** Low -- no formula/constant changed, only application of the existing approved formula to correct pre-existing wrong figures.
**VALIDATION:** `node -e` direct computation for both corrected figures; `node scripts/generate-academy.js` re-run; content verified in `data/academy.json` and both rendered HTML pages; `test-phase-7x.js` categories B, D.

## 4. `scripts/data/academy-troubleshooting.js`

**OLD (`strong-chlorine-smell` article):** "the-fix" section: "Calculate the dose using the shock calculator (combined chlorine x 10 x pool volume factor)..." "Fixing Pool Party Aftermath" worked example: "The shock calculator shows approximately 8 lbs of cal-hypo is needed" (13 ppm, 20,000 gal, 65% cal-hypo).
**NEW:** "the-fix" section no longer describes a false internal formula for the calculator -- replaced with an accurate statement (does not read CC, work out the target by hand, then select a preset or apply the formula directly). Worked example corrected to the verified figure (3.34 lb; `13 x 20000 x 0.013344 / 65 / 16 = 3.34`).
**REASON:** The most severe finding in this phase -- an explicit, direct misstatement of the calculator's internal mechanism, not merely an implication. The worked example also contained an independently-verified arithmetic error.
**RISK:** Low -- no formula/constant changed.
**VALIDATION:** `node -e` direct computation; `node scripts/generate-academy.js` re-run; content verified; `test-phase-7x.js` categories B, D.

## 5. `scripts/data/glossary-terms.js`

**OLD (`gl-096 breakpoint-dose`):** "Use the shock calculator to determine how many pounds of product are needed to reach this target for a specific pool volume."
**NEW:** States the calculator does not accept a CC reading or compute this target itself, and gives the preset-selection/manual-formula path.
**REASON:** Same class of finding as item 1 and item 3's Step 5.
**RISK:** Low -- documentation-only.
**VALIDATION:** `node scripts/generate-glossary.js` re-run; content verified in `data/glossary.json` and the rendered page; `test-phase-7x.js` category C.

## 6. `scripts/data/reference-pages.js`

**OLD (`reference/emergency-recovery`):** Step 3: "Add shock to achieve 30 ppm FC -- use the shock calculator for exact dose."
**NEW:** States the target exceeds the calculator's highest preset (20 ppm) and directs the reader to apply the shock dose formula directly.
**OLD (`reference/shock-dosage-matrix`):** Table's "Maintenance (10 ppm)" and "Breakpoint CC 1 ppm" columns -- the same 10 ppm target -- showed different values at every volume (internal arithmetic inconsistency), plus a "Green Pool (30 ppm)" column with independently-unverifiable figures.
**NEW:** Every cell recomputed from the approved `ppm x gallons x 0.013344 / 65` formula (65% cal-hypo, matching the table's stated basis). Headers relabeled to show the ppm-raise each column represents. A note explains why the two leftmost columns are now identical (both represent a 10 ppm FC raise, by definition, not an error) and discloses that the live calculator offers only fixed presets (5/10/15/20 ppm) rather than the full range shown in the table. The pre-existing, imprecise "multiply by 6" liquid-chlorine conversion footnote (actual ratio is 6.5x, not 6x) was removed rather than left inconsistent beside newly-corrected figures -- not replaced with a new number, since auditing that conversion is outside this phase's breakpoint-claim mandate (carried forward in `REVIEW-QUEUE.md`).
**REASON:** Section 1 scope (emergency-recovery) and Section 20 sitewide sweep (shock-dosage-matrix, discovered during the `data/` sweep).
**RISK:** Low-moderate for the dosage-matrix table (numeric content changed across 9 rows x 3 columns) -- mitigated by computing every figure directly from the already-approved constant and independently spot-checking several cells by hand.
**VALIDATION:** `node -e` verification of the full recomputed table; `node scripts/generate-reference.js` re-run; content verified in `data/reference.json` and both rendered pages; `test-phase-7x.js` regression checks for both pages.

## 7. `reference/combined-chlorine-explained.html`

**OLD:** FAQPage JSON-LD and visible body both contained: "Use cal-hypo shock (65-73%) calculated for your pool volume with the shock calculator."
**NEW:** Both occurrences replaced with an instruction to calculate the dose by hand using the shock dose formula, stating the calculator does not accept a CC reading and directing to preset selection or direct formula application.
**REASON:** Confirmed hand-authored/static after exhaustive generator search (`generate-comparison-pages.js`, `build-link-matrix.js`, `inject-entity-schema.js`, targeted grep for the exact text -- no generator produces this page's content).
**RISK:** Low -- direct edit to a confirmed-static page, both occurrences kept in sync via a single `replace_all` edit.
**VALIDATION:** Content verified via grep (2 occurrences confirmed); `test-phase-7x.js` regression check for FAQ/body consistency.

## Regenerated outputs (no source-of-truth beyond items 1-7)

`data/academy.json`, `data/glossary.json`, `data/reference.json`, and 14 rendered HTML pages (`guides/chlorine/free-chlorine-vs-total-chlorine.html`; 6 `programmatic/shock/*.html` pages plus `programmatic/shock/index.html`'s cross-link title catch-up, a direct and legitimate consequence of regenerating the edited generator, not independently sourced; `academy/sanitizers/breakpoint-chlorination.html`, `academy/sanitizers/shock-treatments-explained.html`; `academy/troubleshooting/strong-chlorine-smell.html`; `glossary/breakpoint-dose.html`; `reference/emergency-recovery.html`, `reference/shock-dosage-matrix.html`) -- all regenerated via `node scripts/populate-data.js` (once, to pick up the 3 edited `scripts/data/*.js` source files) followed by `node scripts/generate-academy.js` / `generate-glossary.js` / `generate-reference.js` and a full `npm run build`, with every file the build also touched that was not an intentional target of this phase reverted, per the established full-build-then-selective-revert discipline.

## Unrelated pre-existing issue discovered and explicitly NOT absorbed

Running `populate-data.js` (required to regenerate the 3 edited data files) also regenerated `data/academy.json` from ALL `scripts/data/academy-*.js` source files, exposing that the **committed** `data/academy.json` had been stale relative to its own true source for some time: two articles (`fund-07` "new-pool-startup-chemistry", `fund-08` "indoor-pool-chemistry") existed in the committed JSON and their rendered HTML pages, but no longer existed in `scripts/data/academy-fundamentals.js` -- a source/output desync entirely unrelated to Phase 7X and never touched by this phase. Similarly, the committed `academy.json` carried an extra source citation and an extra related-resource link on two unrelated articles that are also no longer present in the true source files. **This phase did not investigate or resolve this desync.** To avoid an unauthorized, out-of-scope content deletion as a side effect of the required regeneration, `data/academy.json` was rebuilt surgically: reset to its committed baseline, then only the 5 specific body-text sentences this phase intended to change were replaced via exact string match, leaving `fund-07`/`fund-08` and all other unrelated fields byte-identical to the committed state. This is documented in `REVIEW-QUEUE.md` as a carried-forward finding for a future phase.

## Not changed

- `js/calc-utils.js`, `js/calculator.js` -- confirmed unchanged via `git diff --stat` (Phase 7W's product-selector architecture, presets, and the approved 0.013344 constant all intact).
- `scripts/data/chemistry-claims.js`, `chemistry-ranges.js`, `dataset-dosage-matrices.js` -- confirmed unchanged via `git diff --stat`. No canonical chemistry claim was found demonstrably wrong.
- `scripts/generators/generate-shock-pages.js`'s `shockOz()` numeric formula and the sourced "breakpoint...30ppm" algae-recovery terminology itself -- both explicitly out of scope; the terminology is a direct, legitimate quotation from a registered primary source (`poolspanews-algae-breakpoint-2016`).
- `js/calc-utils.js`'s `calculateChlorine` function's pre-existing, deliberately-unresolved `'granular'/'shock'` generic-divisor branch (documented `REQUIRES_EXPERT_REVIEW` since Phase 7T/7U) -- a separate function from the Phase 7W shock calculators, out of this phase's scope, confirmed untouched.
- No URL, redirect, sitemap, Spanish, French, or AdSense changes.
- No calculator preset, product-selector, or breakpoint-calculator changes -- Phase 7W's architecture is fully intact.
