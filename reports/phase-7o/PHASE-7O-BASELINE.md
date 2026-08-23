# Phase 7O — Fresh Crawl/Indexation Baseline

Captured fresh against commit `b5fa47c` (Phase 7N.1, committed and pushed).

## Sitewide inventory

- 524 pages total, 480 indexable
- Schema: 953 VALID / 39 MISSING / 3 QUESTIONABLE
- 0 duplicate titles, 0 duplicate descriptions
- Orphan pages: 2 (404.html, audit/google/index.html -- both intentionally non-content)
- Sitemap: 481 URLs across 8 partition files (before this phase's duplicate-homepage-entry fix)
- Redirect sources: 3 known (calculators/volume-calculator.html, charts/hot-tub-chemical-levels-chart.html, charts/pool-chemical-levels-chart.html)

## Real findings discovered during this phase's investigation (not present in prior baselines because no prior phase specifically audited these dimensions)

1. **Sitemap lastmod was wall-clock, not content-based**: every one of 481 sitemap URLs was stamped with the current build date regardless of actual content change history.
2. **Duplicate homepage `<loc>`**: `/` appeared twice within `sitemap-calculators.xml` due to a leftover special-case branch in the category-assignment loop, in addition to the explicit homepage `unshift()`.
3. **11 pages linked to the 2 legacy chart redirect-source URLs** instead of their canonical root-level replacements.
4. **`qa-engine.js`'s "links" release-gate audit did not exempt known redirect-source pages from its orphan check**, meaning the correct end-state (a redirect source having zero internal inbound links) was treated as a critical build-blocking error.
5. **`releases/` (4 pages) and, effectively, `tools/index.html` + 3 `printables/*` pages were unreachable via any contextual crawl path** starting from the homepage -- not linked from anywhere outside their own small clusters, and not present in `all-pages.html` either.
6. **3 `printables/*` pages are near-duplicate legacy content** of already-canonical, already-well-linked `resources/*` equivalents -- a genuine architectural question flagged for a future dedicated decision, not resolved unilaterally this phase (see `REVIEW-QUEUE.md`).

## GSC / live data

None available in the repository (reconfirmed, consistent with Phase 7N). All analysis in this phase is architecture-based.

This is the pre-Phase-7O state. See `PRODUCTION-CHANGES.md` for what changed.
