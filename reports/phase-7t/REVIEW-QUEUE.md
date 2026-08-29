# Phase 7T -- Review Queue (Carry-Forward)

Full detail and evidence for every item is in the individual audit reports and `FORMULA-DECISION-LEDGER.csv`. This file is the condensed narrative version.

## Resolved this phase

- **`formula-03` (calcium hypochlorite shock formula), Priority C**: the uncited `/800` divisor and its oz/lbs unit-labeling defect were both genuine errors, confirmed via first-principles derivation (the same mass-balance constant already used and Director-approved for liquid chlorine) and PHTA's own "Water Chemistry Adjustment Guide" -- the independent external evidence. This site's own pre-existing (unrelated to this phase) `dataset-dosage-matrices.js` cal-hypo entries at two further concentrations converge with the same result but are internal, corroborating data, not independent confirmation. Documentation-only fix (this formula is not wired to any live calculator). See `FORMULA-03-AUDIT.md`.

## Genuinely unresolved (evidence insufficient -- correctly left REQUIRES_EXPERT_REVIEW / ARCHITECTURAL_GAP)

- **pH-adjustment model, Priority A**: PHTA's own authoritative dosing-table format -- the same format this project already trusts to have resolved liquid chlorine, alkalinity, and this phase's `formula-03` -- deliberately excludes pH from its table and defers to a separate, empirical "Acid Demand Test" procedure. A defensible formula-based dose additionally requires at minimum total alkalinity and, per PHTA's own Cyanuric Acid Correction Factor table, cyanuric acid -- neither of which the calculator collects. No TA-independent or TA-aware closed-form model was found and independently verified this phase. See `PH-AUDIT.md`.
- **Generic granular/shock divisor, Priority B**: dimensionally shown this phase to correspond to a physically impossible 133.44%-available-chlorine product -- not merely unsourced, but incompatible with any real product. PHTA's Calcium Hypochlorite fact sheet explicitly states exact dosage depends on the specific product and its label, directly supporting the conclusion that no single generic figure is defensible without a product-identity input the calculator does not collect. See `SHOCK-DIVISOR-AUDIT.md`.

## Architectural gaps (confirmed, not built)

- **pH acid-demand-test-based tooling or a full TA+CYA-aware pH formula**: the scientifically correct approach per PHTA's own dosing-table omission, but a UX/data-collection redesign outside this phase's mandate.
- **Product-selection input for the generic shock calculator** (converting it to the same explicit-strength pattern already used by liquid chlorine and `formula-03`): would resolve the generic-divisor problem but is a UI change, not a pure evidence question, and this phase does not implement it.
- **Breakpoint-chlorination (combined-chlorine-based) shock calculator**: confirmed as a legitimate, distinct future tool (Priority D), not built. The existing generic-FC-increase shock calculator does not overclaim this capability and already discloses the limitation (Phase 7S); no gap between disclosure and reality was found.

## New finding: an internal PHTA inconsistency, documented but not acted on

While researching alkalinity-adjacent evidence for the pH audit, this phase found PHTA's own "Alkalinity" fact sheet (May 2021) states "approximately 1.5 pounds of sodium bicarbonate... will raise the total alkalinity of 10,000 gallons of water by 10 ppm" -- 0.1 lb higher than the 1.4 lbs figure Phase 7S's `RESOLVED` alkalinity fix used (from Indiana DOH). This phase additionally read PHTA's own "Water Chemistry Adjustment Guide" (the organization's more specific, purpose-built practitioner dosing table, also newly read this phase), which states **1.4 lbs** -- matching Indiana DOH and the current implementation exactly, and reconfirming rather than undermining Phase 7S's resolution. The discrepancy is a genuine internal inconsistency between two PHTA-published documents (a narrative fact sheet's rounded prose figure vs. the organization's own authoritative dosing table), not a defect in this site. Per this phase's explicit "do not reopen a resolved Phase 7S decision unless new evidence directly demonstrates it was materially wrong" instruction, a ~7% prose-vs-table gap within the same organization's own publications does not meet that bar. Documented in `FORMULA-DECISION-LEDGER.csv` (item 7T-05) and `scripts/data/chemistry-sources.js`'s new source record notes; no production change made.

## Confirmed safe, no action needed

- **Shock calculator preset-tier architecture** (Priority D): independently re-derived from the page's own claims and confirmed to match exactly what Phase 7S's trust-panel disclosure already states. No wording change needed.
- **Cross-calculator consistency**: `formula-02` and `formula-03` now share the identical mass-balance constant, resolving what would otherwise have been a cross-calculator inconsistency. No other contradiction found across liquid chlorine, generic chlorine, granular chlorine, shock, alkalinity, or pH. See `CROSS-CALCULATOR-CONSISTENCY.md`.
- Volume, turnover, CYA, salt, and all Phase 7S `RESOLVED` items (liquid chlorine, LSI documentation) -- not reopened; no new evidence found that would meet the "materially wrong" bar.
- No LSI calculator, no bromine calculator, no URL/redirect/sitemap change, no programmatic-family change, no i18n expansion, no AdSense change -- all confirmed untouched (see `PHASE-7T-STATUS.md` Scope Control).
- The same pre-existing, sitewide latent template/injector drift Phase 7S discovered and documented was encountered again during this phase's `npm run build` regression checks -- reconfirmed as unrelated to calculators, reverted, not applied, consistent with Phase 7S's handling. Not re-investigated further; the recommendation to address it in a dedicated future infrastructure phase (from Phase 7S's `REVIEW-QUEUE.md`) stands unchanged.

## Recommended next phase

1. A domain-expert decision on the pH-adjustment architecture: whether to build an acid-demand-test-based tool, collect TA (and ideally CYA) as calculator inputs backed by a fully validated model, or explicitly narrow the current calculator's claimed accuracy.
2. A product decision on whether to add a product-selection input to the generic shock/granular calculator (resolving the divisor question by converting it to the same pattern as liquid chlorine/formula-03) or leave it as an explicitly-disclosed rough approximation.
3. If ever prioritized: design and evidence work for a distinct breakpoint-chlorination (combined-chlorine-based) shock calculator.
4. The sitewide template/injector drift infrastructure decision, carried forward unchanged from Phase 7S.
