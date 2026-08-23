# Phase 7O — Review Queue (Carry-Forward)

## printables/* vs resources/* duplicate content (requires an explicit decision, not resolved this phase)

`printables/pool-maintenance-checklist.html`, `printables/hot-tub-maintenance-log.html`, and `printables/airbnb-pool-turnover-checklist.html` are near-duplicate legacy content of the already-canonical, already-well-linked `resources/pool-maintenance-checklist.html`, `resources/hot-tub-maintenance-log.html`, and `resources/airbnb-pool-turnover-checklist.html`. They remain indexable (not noindex, not registered as redirect sources) but are reachable via contextual crawl only through their own mutual cross-links plus a `noindex, nofollow` internal tools page (`tools/index.html`) that a crawler will never index or follow links from.

This mirrors the exact situation Phase 7N surfaced for `calculators/volume-calculator.html`, which required a dedicated Director decision (Phase 7N Step 8) before any redirect/consolidation action was taken. Recommended options for that future decision, evaluated but not acted on:
1. Register all 3 as `REDIRECT_SOURCES` (noindex + canonical to their `resources/` equivalents) -- matches the established pattern exactly.
2. Confirm they are intentionally distinct (different print layout/format?) and add genuine, non-artificial contextual links from `resources/index.html` or elsewhere.
3. Leave as-is if a reason exists that this phase's investigation didn't surface.

Not resolved this phase because it requires the same kind of explicit "is this a real distinct asset or a legacy duplicate" architectural judgment call as the volume-calculator case, which Step 27 (no URL renaming without explicit migration decision) and Step 24 both flag as requiring deliberate sign-off rather than a source-level crawl-optimization fix.

## Secondary reference charts/guides reclassified from an initial Tier-1 assumption to Tier 2

`hot-tub-chemical-levels-chart.html` (13 inbound), `hot-tub-chlorine-levels-chart.html` (4), `pool-alkalinity-levels-chart.html` (3), `pool-cya-levels-chart.html` (4), `salt-water-pool-chemical-levels-chart.html` (4), and the 4 secondary silo guides (`chlorine-guide` 52, `ph-guide` 14, `hot-tub-chemistry` 18, `alkalinity-guide` 6) measured meaningfully lower internal-link equity than the "big 3" charts (25-468 inbound) and the primary calculator/guide hub. Reclassified honestly in `CRAWL-PRIORITY-MAP.csv` rather than artificially inflated with new links to match an initial Tier-1 assumption.

## Footer-whitespace nondeterminism

Reconfirmed present, exact same ~171-file footprint and category distribution as Phase 7M/7N's baseline. Not expanded by this phase. Sitemap XML files are now fully excluded from this footprint (confirmed byte-identical across builds) thanks to the lastmod fix -- a genuine, if incidental, improvement. Still not fixed at its source (pre-existing, cross-phase, its own dedicated-phase scope).

## Legacy `scripts/generate-sitemap.js` (singular)

Confirmed this standalone `npm run sitemap` script is not part of the automated `npm run build` pipeline and was not touched. It was not audited for lastmod/duplicate issues since it produces no build-time output. Flagged only for awareness -- if it is ever wired back into the pipeline, it should be checked for the same class of issue fixed this phase in `generate-sitemaps.js` (plural).
