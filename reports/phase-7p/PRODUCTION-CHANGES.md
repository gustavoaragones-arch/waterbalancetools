# Phase 7P -- Production Changes

## 1. One new page created (Step 16)

`academy/fundamentals/new-pool-startup-chemistry.html` -- "New Pool Startup Chemistry (Fresh Fill & New Plaster)". Created via the existing `data/academy.json` + `scripts/generate-academy.js` generator architecture (entry `fund-07`), not hand-authored HTML. Full decision rationale in `SEARCH-GAP-REVALIDATION.csv`; full blueprint in `CONTENT-BLUEPRINTS.md`.

Regenerating the academy section (`node scripts/generate-academy.js`) automatically:
- Wrote the new article page with the standard academy template (header, breadcrumb, sidebar, hero, sections, examples, common mistakes, sources, related-calculators/topics, footer).
- Added the new page to the `academy/fundamentals` category index card grid.
- Added the new page to the "In This Category" sidebar on all 7 sibling `academy/fundamentals/*` pages (automatic inbound-link integration -- no manual link insertion needed).

## 2. New chemistry source registered (Steps 9/17)

`scripts/data/chemistry-sources.js`: added `phta-fresh-fill-startup-fact-sheet` (Pool & Hot Tub Alliance Recreational Water Quality Committee, "Fresh Fill Water Start-Up for Plastered Pools," March 2021), fetched and read in full on 2026-08-28 -- not a search-snippet paraphrase. Matches this project's existing provenance-registry schema and source-priority conventions exactly (same pattern as the pre-existing `phta-total-alkalinity-fact-sheet` record). This record is not yet wired into any page's rendered `knowledge-sources-real` block (the new academy page cites it via the plain-text `sources` convention that every other academy article already uses); it is registered for future reuse, matching the Phase 7D provenance architecture, which this project has consistently kept ahead of individual page adoption.

## 3. One differentiation link added to prevent cannibalization (Step 7/13)

`guides/seasonal/opening-pool-chemistry-checklist.html`: added one sentence directly under the existing intro paragraph, linking to the new page and explicitly stating that checklist is for reopening an already-cured pool, not a new/freshly-plastered one. This closes the loop so a reader who lands on the wrong page is redirected to the genuinely distinct content, and gives the new page a second real inbound contextual link beyond the auto-generated sidebar links.

## 4. Redistribution of the build pipeline's existing generators (no new architecture)

Running `npm run build` after the above two content changes regenerated (in the ordinary course of the existing pipeline, not as a special Phase 7P step): `data/search-index.json` (+1 entry), all `sitemap-*.xml` partitions (+1 URL), `qa-summary.{json,md,csv}` and `reports/*.html` (QA dashboard, timestamp-only changes), `tools/index.html`, `releases/*.html`, and the sitewide footer version-badge stamp on ~487 files (the same pre-existing, previously documented whitespace-only nondeterminism -- see `REVIEW-QUEUE.md` and the Reproducibility section of `PHASE-7P-STATUS.md`). None of this is Phase-7P-authored content; it is the existing generators doing their ordinary job in response to one new data entry.

## Not changed

No calculator formulas, no `REDIRECT_SOURCES` entries (still exactly the 6 from Phase 7O.1), no printables/resources architecture (not reopened, per the Director's instruction), no programmatic-family architecture, no Spanish/French content, no fabricated citations, no new dedicated pages for any of the other 7 candidate gaps (all DEFER/REJECT -- see `SEARCH-GAP-REVALIDATION.csv`).
