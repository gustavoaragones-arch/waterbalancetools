# Phase 7Q -- Production Changes

Every change below was made at the smallest authoritative source (data file or generator/tooling script), not by hand-patching generated HTML. Zero new pages were created; zero calculator formulas, zero URL architecture, and zero programmatic-family generators were touched.

## 1. New chemistry sources registered (`scripts/data/chemistry-sources.js`)

Two new sources, fetched and read in full on 2026-08-28, added to the existing Phase 7D provenance registry:

- `phta-water-conservation-droughts-2021` -- PHTA "Water Conservation During Droughts" fact sheet (Dec 2021). Supports the water-replacement and covered-pool-chemistry expansions below.
- `phta-calcium-hypochlorite-fact-sheet-2021` -- PHTA "Calcium Hypochlorite" fact sheet (Aug 2021). Supports the calcium-hypochlorite expansion below. Also checked (and confirmed does NOT resolve) the routine-maintenance shock-dosing disagreement -- see `RESEARCH.md`.

## 2. Three entity pages expanded with real, scoped citations (`scripts/generate-entity-pages.js` `ENTITY_CITATIONS` map)

- `entities/water-replacement.html` -- cites `phta-water-conservation-droughts-2021` for the 1,500 ppm TDS-increase-over-baseline trigger only; the CYA(80ppm)/calcium(500ppm)/pool-TDS(3000ppm) figures explicitly remain uncited per the scoping note.
- `entities/cover.html` (`data/entities/equipment.json` `longDescription` extended by 2 sentences) -- cites `phta-water-conservation-droughts-2021` for the chemical-consumption (up to 60%) / heating-cost (up to 70%) reduction figures and the combined-chlorine/DBP-buildup caution; the pre-existing 95% evaporation-reduction and UV-degradation claims remain uncited (unchanged, not touched).
- `entities/calcium-hypochlorite.html` -- cites `phta-calcium-hypochlorite-fact-sheet-2021` for the calcium-addition figure (0.8 ppm hardness per ppm FAC) and independently corroborates the existing trichlor/cal-hypo mixing-hazard citation from a second, non-SDS source type.

Each citation carries an explicit scoping note (matching the pre-existing `shock-treatment` precedent) stating exactly which claims the source does and does not support -- no blanket "same source supports everything" citation was added.

Net effect: citation blocks 18 -> 21, citation links 23 -> 26 (verified via `validate-citation-coverage.js` and `validate-phase-7q.js`).

## 3. `data/academy.json` duplicate-id fix

`fund-06` was assigned to two different articles (`why-water-testing-matters` and `indoor-pool-chemistry`). Phase 7P had classified this as inert; tracing `generate-entity-pages.js`'s `articleById` lookup map (keyed by `id`) this phase found it was NOT inert -- `entities/maintenance-checklist.html` (which references `academyIds: ["fund-06"]`) was silently resolving to the wrong article (Indoor Pool Chemistry instead of the clearly-more-relevant Why Water Testing Matters) due to the id collision and object-key overwrite. Fixed by changing `indoor-pool-chemistry`'s id to `fund-08` (the next actually-unused id; `fund-07` belongs to Phase 7P's new page). Verified: `entities/maintenance-checklist.html` now correctly links to "Why Water Testing Matters."

## 4. Forensic-audit tooling: `scripts/audit-forensic/lib/derive.js`

`AUTHORITY_RE` expanded from `.gov`/`.edu`/`who.int`/`cdc.gov`/`epa.gov`/`nsf.org`/`cpsc.gov`-only to also recognize `phta.org`, `cmahc.org`, `blog.ansi.org`, `cffaperformanceproducts.org`, `msdsdigital.com`, `puraquapools.com`, `poolspanews.com`, `clevelandclinic.org`, and `hasa.com` -- the specific, verified domains already present in `chemistry-sources.js` as of this phase (a closed, explicit list, not a heuristic category match). This is a measurement-tool change only; it does not touch, and is not counted toward, any production content. Before/after on the current repository: 416/416 -> 402/416 major factual pages recognized as citing zero external authority sources. See `RESEARCH.md` for full detail and the explicit "this does not retroactively change what earlier phases' own reports said" disclosure.

## 5. Legacy `scripts/generate-sitemap.js` (singular) deprecation guard

Confirmed dead code (not required/imported anywhere in the automated pipeline) but still reachable via the live `npm run sitemap` entry point, where it would silently overwrite the partitioned, git-lastmod-based `sitemap.xml` that `scripts/generate-sitemaps.js` (plural) produces. Added a guard: the script now prints an explicit deprecation message and exits 1 without writing anything, unless run with `FORCE_LEGACY_SITEMAP=1`. Not deleted, per this project's policy against removing code merely because it is unused. Verified via `scripts/test-phase-7q.js`.

## Not changed

No calculator formula file, no `REDIRECT_SOURCES` entry, no programmatic-family generator, no page creation or deletion, no Spanish/French content, no author/reviewer schema. The pre-existing footer-whitespace nondeterminism and the routine-maintenance shock-dosing disagreement were investigated in depth (see `RESEARCH.md`) but deliberately left unfixed -- both would require architecture-level changes or a factual resolution this phase's evidence does not support.
