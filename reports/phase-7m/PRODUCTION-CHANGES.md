# Phase 7M — Production Changes

Full traceable detail in `CONTENT-CHANGES.csv`. Summary by family:

## 1. Programmatic family differentiation (4 generators, 26 pages)

`scripts/generators/generate-{chlorine,shock,ph,hot-tub}-pages.js`. Root-cause diagnosis: the biggest driver of HIGH duplication risk was a literally-identical 6-item "Quick tips" list repeated on every page within each family (and largely repeated across families too), plus 2-3 fully generic FAQ items with no page-specific content. Removed the quick-tips block from all 4 generators; added genuinely page-specific content in its place -- real arithmetic unit conversions (oz -> qt/lb, "how many bags") computed from each page's own volume, which is not a chemistry claim and needs no citation. Trimmed FAQs to page-specific questions only.

Measured result (forensic audit, before -> after):
- chlorine: 0.650 -> 0.565 avg similarity, 26 -> 17 repeated paragraph blocks, 3 -> 1 repeated FAQs (still HIGH risk)
- shock: 0.715 -> 0.621, 25 -> 15, 3 -> 0 (still HIGH risk)
- pH: 0.579 -> 0.488, 31 -> 23, 5 -> 2 (**HIGH -> MEDIUM risk**)
- hot-tubs: 0.705 -> 0.629, 25 -> 15, 3 -> 0 (still HIGH risk)

Three families remain HIGH risk. This is disclosed honestly, not minimized: the remaining similarity is structural to parametric pages answering "how much X for volume Y," where the shared steps/definitions/target-range content is legitimately the same information restated for each volume. Further reduction would require either merging pages (reducing real search-intent granularity -- each volume genuinely represents a distinct query) or removing more shared reference content (risking real usefulness). See `REVIEW-QUEUE.md`.

## 2. New content (2 pages)

- **`academy/fundamentals/indoor-pool-chemistry.html`** (new academy article, `data/academy.json`): closes a confirmed gap after auditing all 48 existing academy articles plus dozens of guides against Steps 5-7's full suggested topic list -- nearly every other suggested topic (temperature, LSI, winter spa care, breakpoint chlorination, combined chlorine, etc.) already had a substantive existing article. Synthesizes already-established site facts (no CYA indoors, chloramine buildup without airflow, CO2/pH drift, ventilation) with no new numeric claims. Linked from the `indoor-pool` entity.
- **`guides/edge-cases/evaporation-effect-on-pool-chemistry.html`** (new static page, matching the existing edge-case template exactly): the site had a dedicated page for rain's diluting effect but none for evaporation's opposite, concentrating effect -- a genuine, confirmed asymmetry. Registered in `scripts/build-link-matrix.js`'s edge-case registry so it is cross-linked and appears in the hub listing.

## 3. Title-length fix (7 generators, 36 pages)

Root cause: `PROGRAMMATIC_TITLE_SUFFIX` (" | Pool Water Chemistry Guide") was stacking with the sitewide automatic brand-suffix injector (`normalize-seo-metadata.js`, which appends " | WaterBalanceTools" to any title not already ending with it), producing 87-101 character titles. Removed the redundant suffix from `<title>`/`og:title` in all 7 generators that used it (4 volume/value families + 3 additional programmatic families sharing the same constant), and trimmed a redundant parenthetical qualifier on the 4 primary families. Result: 86 -> 51 TITLE_TOO_LONG findings sitewide (35 fixed outright, 1 improved but 1 char over, 50 left for future dedicated review since they aren't the same redundant-suffix defect). 0 duplicate-title regressions.

## 4. No calculator formula changes, no entity content rewrites, no citation architecture changes (beyond the required Phase 7L preservation checks), no mass rewrite.
