# Phase 7P -- Content Blueprints

Only one candidate reached P0/P1 (see `CONTENT-CANDIDATE-MATRIX.csv` and `SEARCH-GAP-REVALIDATION.csv`). Per Step 14, its blueprint was defined before writing.

## New Pool Startup Chemistry (Fresh Fill & New Plaster)

- **Exact URL:** `/academy/fundamentals/new-pool-startup-chemistry`
- **Exact title:** New Pool Startup Chemistry (Fresh Fill & New Plaster) | Academy | WaterBalanceTools
- **Exact H1:** New Pool Startup Chemistry (Fresh Fill & New Plaster)
- **Search intent:** "How do I balance the water in a brand-new pool / a freshly plastered pool?" -- a staged, day-by-day procedural intent, distinct from seasonal reopening.
- **Primary question:** What order do I add chemicals in during the first weeks of a new or newly plastered pool, and what should I avoid doing too early?
- **Direct-answer objective:** Overview + Key Facts box answer the core sequence (no chlorine 48h; alkalinity -> pH -> calcium hardness staged; CYA not before Day 4; brush twice daily) in under 60 words of scannable takeaways, matching the site's existing `knowledge-takeaways` pattern.
- **Sections:** Why This Is Different From Reopening a Pool; Days 1-3 (alkalinity, pH, first chlorine); Days 4-28 (calcium hardness, CYA, ongoing care); Examples (one worked scenario); Common Mistakes to Avoid.
- **Tables:** None added -- the staged sequence is inherently a day-by-day narrative better served by prose sections (matching the source document's own structure) than a table; no existing site convention was forced.
- **Safety considerations:** No-chlorine-for-48-hours, no-shock-for-30-days, no-heater-until-manufacturer-waiting-period, and never-mix-calcium-and-alkalinity-increasers-simultaneously are all stated explicitly, sourced directly from the PHTA fact sheet (Step 10 safety gate).
- **Evidence requirements:** Every numeric claim traces to the PHTA fact sheet read in full on 2026-08-28 (see `SEARCH-INTENT-RESEARCH.md`). No claim was inherited from a neighboring page without verifying context matched (Step 9) -- the CYA target (30-50 ppm) is explicitly flagged in the body as a startup-specific transitional target, distinct from the site's steady-state CYA range, to avoid a silent contradiction with `pool-cya-levels-chart.html`.
- **Internal links:**
  - Parent hub: `/academy/fundamentals` (category index, auto-updated by the generator)
  - Inbound (contextual): all 7 sibling `academy/fundamentals/*` pages now link to it via the auto-generated sidebar; `guides/seasonal/opening-pool-chemistry-checklist.html` was hand-edited to add one explicit differentiation link (see `PRODUCTION-CHANGES.md`)
  - Outbound: `/calculators/pool-ph-calculator`, `/calculators/pool-alkalinity-calculator`, `/calculators/pool-chlorine-calculator`, `/pool-chemical-levels-chart`, `/resources/water-test-log`, `academy/fundamentals/how-water-balance-works`, `academy/fundamentals/understanding-pool-water-chemistry`, `academy/water-balance/understanding-calcium-hardness`, `guides/seasonal/opening-pool-chemistry-checklist`, `formulas/alkalinity-formula`, `formulas/ph-adjustment-formula`, `glossary/total-alkalinity`, `glossary/calcium-hardness`, `glossary/cyanuric-acid`, `glossary/ph`
- **Schema type:** `Article` + `BreadcrumbList` -- matches every other `academy/fundamentals/*` page (Step 18: no HowTo forced onto a page that is fundamentally explanatory/procedural narrative, not a step-tracked task list with tools/materials/supply schema).
- **Citation requirements:** Plain-text source line matching this generator's existing citation convention (`"sources": [...]` in `data/academy.json`, rendered as the sitewide `knowledge-sources` block) -- consistent with how every other academy article on the site cites sources (e.g. `academy/equipment/salt-systems.html`). The full structured citation (with live URL) is separately registered in `scripts/data/chemistry-sources.js` as `phta-fresh-fill-startup-fact-sheet`, matching the Phase 7D provenance architecture, for future reuse by any page that adopts the linked `knowledge-sources-real` renderer.
- **Differentiation statement:** Distinct from `guides/seasonal/opening-pool-chemistry-checklist.html` (which addresses reopening an already-cured pool) because it addresses the one-time, 28-day curing-sensitive sequence for a pool that has never been chemically balanced before. The new page states this distinction explicitly in its own first section, and the reopening checklist now links to it for readers who land on the wrong page.
- **Maintenance owner / generator:** `data/academy.json` (entry `fund-07`) via `scripts/generate-academy.js` -- the existing academy-article generator, not hand-authored HTML. Regenerate with `node scripts/generate-academy.js` if the JSON entry changes.

## Deferred candidates (not blueprinted for implementation this phase)

Covered-pool chemistry and water-replacement/full-drain chemistry remain DEFER, not CREATE -- see `SEARCH-GAP-REVALIDATION.csv` for why neither reached a blueprint stage this phase.
