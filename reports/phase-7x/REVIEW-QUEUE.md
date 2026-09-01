# Phase 7X -- Review Queue (Carry-Forward)

Full detail in `CONTENT-AUDIT.md`, `DECISION-MATRIX.csv`, `PRODUCTION-CHANGES.md`. Condensed narrative version.

## Resolved this phase

- **`guides/chlorine/free-chlorine-vs-total-chlorine.html`** (Priority A) and **`programmatic/shock/*.html`** (Priority B) -- both named targets from Phase 7W's review queue, corrected at their true generator sources.
- **Two academy articles' worked examples** (`breakpoint-chlorination`, `shock-treatments-explained`) and **one troubleshooting article** (`strong-chlorine-smell`) -- calculator-capability misattributions corrected, plus three independently-verified arithmetic errors (4.5 lb -> 1.54 lb, 3.5 lb -> 1.54 lb, 8 lb -> 3.34 lb) fixed using the already-approved 0.013344 constant.
- **`glossary/breakpoint-dose.html`** and **`reference/combined-chlorine-explained.html`** -- same class of calculator-capability misattribution, corrected.
- **`reference/emergency-recovery.html`** -- confirmed no fecal/contamination-incident section exists in this file (full read); the algae-recovery 30 ppm step corrected to disclose it exceeds the calculator's highest preset.
- **`reference/shock-dosage-matrix.html`** -- a previously-undiscovered internal arithmetic inconsistency (the "Maintenance" and "Breakpoint CC 1 ppm" columns represented the same target but showed different values) found and corrected; entire table recomputed against the approved formula.

## Discovered, NOT fixed -- genuinely out of scope

- **A pre-existing `data/academy.json` source/output desync**, unrelated to breakpoint claims: two academy articles (`fund-07` "new-pool-startup-chemistry", `fund-08` "indoor-pool-chemistry") exist in the committed JSON and as live rendered pages, but no longer exist in their true source file `scripts/data/academy-fundamentals.js`. A full `populate-data.js` regeneration (required for this phase's own edits) would silently drop them, orphaning two live pages. **Not resolved this phase** -- `data/academy.json` was rebuilt surgically to preserve them exactly as committed while applying only this phase's intended edits. Recommended for a future phase with explicit authorization to investigate and reconcile `academy-fundamentals.js` against its generated output (likely requires deciding whether to restore, formally retire, or rewrite the two orphaned articles).
- **The same desync pattern on a smaller scale**: the committed `academy.json` carried one extra source citation (`in-doh-...-how-to-shock-the-pool-2022`, on the breakpoint-chlorination article) and one extra related-resource link (`/maintenance/how-to-fix-cloudy-hot-tub`, on strong-chlorine-smell) that are absent from the current true source files. Same treatment: preserved via the surgical rebuild, not investigated further.
- **`scripts/generators/generate-shock-pages.js`'s `shockOz()` generic numeric formula** (`(gallons*ppm)/10000`) remains unresolved, per the standing Phase 7T/7U/7W `REQUIRES_EXPERT_REVIEW` classification -- explicitly out of scope for a content-alignment phase (no dosage/divisor changes authorized).
- **`js/calc-utils.js`'s `calculateChlorine` function's `'granular'/'shock'` type branch** (used by the separate pool-chlorine-calculator, not the shock calculators) still uses the same pre-existing generic `/10000` divisor, explicitly documented in its own header comment as an intentionally-unresolved item since Phase 7T/7U. Not this phase's mandate.
- **A liquid-chlorine conversion imprecision** in `reference/shock-dosage-matrix.html`'s notes ("multiply by 6" for 10% liquid chlorine -- the correct ratio from 65% cal-hypo is 6.5x). Removed rather than corrected to a new number, since auditing this conversion factor is outside the breakpoint-claim mandate. Recommended for a future phase or a general reference-table precision audit.
- **The two HowTo/steps phrases** in `generate-shock-pages.js` ("choose... a stronger breakpoint dose... per label") were evaluated and found already correct (defer to the product label, not the calculator) -- no action needed, but flagged here for completeness since they were part of the original discovery list.

## Confirmed safe, no action needed

- `formula-03` (shock), all Phase 7S/7T/7U/7V/7W `RESOLVED` decisions -- reconfirmed unchanged, no contradictory evidence found.
- `chemistry-claims.js`/`chemistry-ranges.js`/`dataset-dosage-matrices.js` -- confirmed unmodified via `git diff --stat`. No canonical chemistry claim was found demonstrably wrong this phase.
- The green-algae "breakpoint chlorinate to 30 ppm" terminology -- confirmed as a direct, legitimate quotation from a registered primary source (`poolspanews-algae-breakpoint-2016`), not fabricated or in need of correction.
- `entities/breakpoint-chlorination.html`, `entities/shock-treatment.html`, `guides/chlorine/why-pool-wont-hold-chlorine.html`, `programmatic/chlorine/index.html` -- all contain only bare navigational links or general education, no capability misattribution.
- Phase 7W's shock product-selector architecture (6/4 products, presets, mixing-hazard warnings, "I don't know my product" qualitative-only path) -- fully intact, confirmed via `test-phase-7x.js`.
- `js/calc-utils.js`, `js/calculator.js` -- confirmed unchanged.
- pH, alkalinity, CYA, salt, volume, and turnover calculators -- unaffected, not touched.
- The same pre-existing sitewide template/injector drift documented since Phase 7S -- reconfirmed present, reverted every time it appeared during this phase's regeneration work.

## Recommended for a future, separately-scoped phase

1. Reconcile `scripts/data/academy-fundamentals.js` against `data/academy.json`'s committed content -- decide whether to formally restore, retire, or rewrite the two orphaned articles (`fund-07`, `fund-08`) and the two dropped citation/resource links, and consider whether other `scripts/data/*.js` source files have similarly drifted from their generated JSON outputs (this phase checked only the academy family; glossary/reference were confirmed clean, but the same class of bug could exist elsewhere).
2. A decision on whether `populate-data.js` should run automatically as part of `npm run build` / `run-all-generators.js`, since its current status as a manual, separate step is what allowed the academy desync to go undetected across multiple prior phases.
3. A general precision audit of unit-conversion footnotes across reference tables (the "multiply by 6" liquid-chlorine issue found in `shock-dosage-matrix.html` may not be isolated).
4. A product decision on whether to invest in a genuine breakpoint-chlorination (combined-chlorine-based) calculator as a distinct tool, per Phase 7T/7U's carried-forward option F -- still the only way to make "use the shock calculator" for breakpoint dosing literally true rather than requiring a manual-formula workaround.
5. The generic/unspecified-product shock divisor (`calculateChlorine`'s `'granular'/'shock'` branch) remains `REQUIRES_EXPERT_REVIEW`, unchanged since Phase 7T/7U.
6. The sitewide template/injector drift infrastructure decision, unchanged since Phase 7S.
