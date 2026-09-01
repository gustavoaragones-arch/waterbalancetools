# Phase 7X -- Content Audit

Every candidate passage classified A-F with exact reasoning. Full change-level detail in `PRODUCTION-CHANGES.md`; tabular form in `DECISION-MATRIX.csv`.

## Category legend

- **A** -- correct as written.
- **B** -- correct but benefits from added context (none required this phase; no B findings were acted on).
- **C** -- misleading calculator association (implies a capability the tool does not have, without being numerically wrong).
- **D** -- factual error (a claim or figure that is demonstrably wrong, either mathematically or because the described capability is impossible with the tool's actual inputs/presets).
- **E** -- out of scope / legitimate (general chemistry education, bare navigational links, or content outside this phase's mandate).
- **F** -- requires expert review (none found this phase -- every finding had a clear, evidence-backed resolution using already-approved formulas/constants).

## Findings

### 1. `guides/chlorine/free-chlorine-vs-total-chlorine.html` (Priority A)

**Category C.** "Use the shock calculator for your exact pool size" directly follows the 10x-CC breakpoint instruction, implying the tool computes a breakpoint dose from a CC reading. It never has. **Corrected** at the true source (`scripts/generate-authority-guides.js`): the 10x-CC concept is preserved verbatim; a new sentence explicitly states the calculator does not read CC or auto-compute a breakpoint dose; the actual behavior (flat 5/10/15/20 ppm presets) is stated; a correct usage path (closest preset, or the shock dose formula directly) is given, linking to the existing `formulas/shock-formula.html`.

### 2. `programmatic/shock/*.html` (6 pages, Priority B)

**Category D.** The FAQ answer's "Confirm with the calculator using your actual current reading," attached to the ~30 ppm algae-recovery figure, is not merely misleading but impossible: the calculator's highest preset is 20 ppm, with no free-text entry. **Corrected** at the true source (`scripts/generators/generate-shock-pages.js`): the 10 ppm standard-dose sentence now correctly attributes that figure to the calculator's 10 ppm preset; the 30 ppm algae figure is reframed as a reference estimate to confirm against the product label, since the tool cannot produce it. The two HowTo/steps phrases referencing a "breakpoint dose... per label" were read in context and found to already correctly defer to the product label rather than the calculator -- **Category A/B, not modified**. `shockOz()`'s own numeric formula (the separate, pre-existing, out-of-scope generic-divisor question) was not touched.

### 3. `academy/sanitizers/breakpoint-chlorination.html`

**Category D** (two findings). Step 5 told readers to "use the pool shock calculator to determine how many pounds... to raise free chlorine to that target level" for an arbitrary CC-derived target (8 ppm in the worked example) -- not achievable via the tool's fixed presets. The worked example's "approximately 4.5 lbs" was independently verified wrong: `8 ppm x 15,000 gal x 0.013344 / 65 / 16 = 1.54 lb`, not 4.5 lb. **Corrected** at the true source (`scripts/data/academy-sanitizers.js`): Step 5 now states the calculator's actual preset-based behavior and gives the manual-formula path; the worked example's math is corrected to the verified 1.54 lb figure and reattributed to manual formula application rather than the calculator.

### 4. `academy/sanitizers/shock-treatments-explained.html`

**Category D.** "Weekly Shock Routine" worked example: "the shock calculator indicates 3.5 lbs of 65% cal-hypo" for a 6 ppm target on 20,000 gal. Verified: `6 x 20000 x 0.013344 / 65 / 16 = 1.54 lb`, not 3.5 lb. **Corrected**: figure changed to 1.54 lb, reattributed to the shock dose formula applied directly (6 ppm falls within the calculator's presets in principle, but the article's framing of "the calculator indicates" a number it never actually returns needed correcting regardless).

### 5. `academy/troubleshooting/strong-chlorine-smell.html`

**Category D** (two findings, the most severe in this audit). The "the-fix" section explicitly described the calculator's internal formula as "(combined chlorine x 10 x pool volume factor)" -- a direct, false statement of the tool's mechanism, not merely an implication. The "Fixing Pool Party Aftermath" worked example's "approximately 8 lbs" was independently verified wrong: `13 x 20000 x 0.013344 / 65 / 16 = 3.34 lb`, not 8 lb; 13 ppm is also above the calculator's highest preset (20 ppm is the max, but 13 falls within range -- however the article never says which preset applies, and the actual number was simply incorrect regardless). **Corrected** at the true source (`scripts/data/academy-troubleshooting.js`): the false formula description is replaced with an accurate statement of what the calculator does and does not do; the worked example's math corrected to 3.34 lb.

### 6. `glossary/breakpoint-dose.html`

**Category C.** "Use the shock calculator to determine how many pounds of product are needed to reach this target" implies arbitrary CC-derived-target entry. **Corrected** at the true source (`scripts/data/glossary-terms.js`): replaced with a statement that the calculator does not accept a CC reading and offers presets/formula application instead.

### 7. `reference/combined-chlorine-explained.html`

**Category C** (two identical occurrences -- FAQPage JSON-LD and visible body). "Use cal-hypo shock (65-73%) calculated for your pool volume with the shock calculator" follows a 10x-CC instruction, implying the tool performs this calculation. Confirmed hand-authored/static (no generator produces this page). **Corrected directly**: both occurrences replaced with an instruction to calculate the dose by hand using the shock dose formula, since the calculator does not accept a CC input.

### 8. `reference/emergency-recovery.html`

**Category D.** Step 3 of "Green Pool Recovery (Algae Bloom)": "Add shock to achieve 30 ppm FC -- use the shock calculator for exact dose." Verified: the calculator's highest preset is 20 ppm with no free-text entry, so it cannot produce an "exact dose" at 30 ppm -- the claim is not just misleading but impossible. **No fecal/contamination-incident section exists in this file** (full read confirmed only Initial Assessment, Green Pool Recovery, Moderately Compromised Water, Notes, Related Calculators) -- the more severe Section 1 prohibition does not apply. **Corrected** at the true source (`scripts/data/reference-pages.js`): the step now states the target exceeds the calculator's highest preset and directs the reader to apply the formula directly.

### 9. `reference/shock-dosage-matrix.html`

**Category D.** Independently recomputed the entire table against the approved formula. Found the "Maintenance (10 ppm)" and "Breakpoint CC 1 ppm" columns -- which represent the mathematically identical 10 ppm target -- showed different values at every volume in the table (e.g., 5,000 gal: 0.8 lb vs 1.25 lb), an internal arithmetic inconsistency unrelated to any calculator-attribution issue but squarely within scope (a breakpoint-labeled dosage table linked from/to the shock calculator). **Corrected** at the true source (`scripts/data/reference-pages.js`): every cell recomputed from the approved `ppm x gallons x 0.013344 / 65` formula; a note added explaining why the Maintenance and Breakpoint-CC-1ppm columns are now identical (by design, not error); the calculator's actual preset range disclosed. One unrelated, imprecise conversion footnote ("multiply by 6" for 10% liquid chlorine, actually 6.5x) was removed rather than left inconsistent next to corrected figures -- documented in `REVIEW-QUEUE.md` as a minor, out-of-scope precision issue for a future phase, not fixed to a new number since that would exceed this phase's narrow mandate.

### 10. `entities/breakpoint-chlorination.html`, `entities/shock-treatment.html`

**Category A/E.** Bare "Related Calculators" navigational cards, no descriptive capability text. Not modified.

### 11. `guides/chlorine/why-pool-wont-hold-chlorine.html`

**Category A/E.** "Breakpoint shock to 10x CC reading" appears only as a diagnostic-table cell value, followed by a generic, unattributed Calculator CTA section with no claim that the linked tool performs this calculation. Not modified.

### 12. `programmatic/chlorine/index.html`

**Category A/E.** Bare navigational links to `entities/breakpoint-chlorination` and `entities/combined-chlorine`, no capability claim. Not modified.

### 13. Remaining `scripts/data/*.js` sitewide sweep

**Category A/E throughout.** `dataset-supplemental.js`'s `resolutionOrder`/`recommendedCalculators` fields are terse navigational labels, not prose claims. `chemistry-knowledge.js`, `entities-problems.js`, `entities-processes.js`, `entities-chemicals.js`, `entities-remaining.js`, `entity-relationships.js`, `entity-synonyms.js`, `glossary-terms.js` (all entries other than `gl-096`), `chemistry-claim-family-map.js`, `programmatic-intents.js` -- all contain only general breakpoint-chlorination chemistry education (concept, ratio, chemistry) with no calculator-capability misattribution. Not modified.

## Totals

- Source files corrected: **7** (`scripts/generate-authority-guides.js`, `scripts/generators/generate-shock-pages.js`, `scripts/data/academy-sanitizers.js`, `scripts/data/academy-troubleshooting.js`, `scripts/data/glossary-terms.js`, `scripts/data/reference-pages.js`, `reference/combined-chlorine-explained.html` direct).
- Rendered output pages corrected: **14** (1 guide + 6 programmatic/shock pages + 2 academy articles + 1 troubleshooting article + 1 glossary term + 3 reference pages).
- Distinct problem passages corrected: **11** -- 3 Category C (items 1, 6, 7), 8 Category D (items 2, 3 x2, 4, 5 x2, 8, 9).
- Files/passages reviewed and confirmed Category A/E (no fix needed): **14** (`entities/breakpoint-chlorination.html`, `entities/shock-treatment.html`, `guides/chlorine/why-pool-wont-hold-chlorine.html`, `programmatic/chlorine/index.html`, plus 10 `scripts/data/*.js` files swept sitewide: `dataset-supplemental.js`, `chemistry-knowledge.js`, `dataset-chemical-ranges.js`, `entities-problems.js`, `entity-synonyms.js`, `entities-processes.js`, `entities-chemicals.js`, `entities-remaining.js`, `entity-relationships.js`, `chemistry-claim-family-map.js`/`programmatic-intents.js`), plus 2 borderline HowTo/steps phrases within `generate-shock-pages.js` read in context and confirmed already-correct (defer to product label, no calculator-capability claim).
- Category F (requires expert review): **0** -- every finding had a clear, evidence-backed resolution using already-approved formulas/constants; none required guessing chemistry.
- Chemistry claims found demonstrably wrong: **0** -- `chemistry-claims.js`/`chemistry-ranges.js`/`dataset-dosage-matrices.js` unmodified.
