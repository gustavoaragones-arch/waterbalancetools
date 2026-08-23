# Phase 7O — Production Changes

## 1. Lastmod / freshness signal (Step 9)

`scripts/generate-sitemaps.js`: replaced the uniform wall-clock `TODAY` stamp on every sitemap URL with a per-file value derived from that file's actual git commit history (deterministic, never fabricated; a file with no commit history yet falls back to `TODAY`, which is honest). Verified: sitemap lastmod values now span real commit dates (2026-08-18 through 2026-08-23) instead of a single date repeated 481 times, and are byte-identical across two consecutive builds. Full detail: `LASTMOD-AUDIT.md`.

## 2. Duplicate sitemap entry (Step 8)

`scripts/generate-sitemaps.js`: fixed a leftover code path that added the homepage URL to `sitemap-calculators.xml` twice (once via an explicit `unshift()`, once via a special-case branch in the main category loop that was never removed after the explicit call was added). Sitemap URL count corrected from 481 (with 1 duplicate) to 480 (no duplicates).

## 3. Redirect-source link cleanup (Steps 11/12)

11 files corrected to link to the canonical root-level chart pages instead of the 2 legacy `charts/*.html` redirect sources: `comparisons/chlorine-vs-bromine-hot-tub.html`, `comparisons/saltwater-pool-vs-chlorine.html`, `charts/pool-water-balance-chart.html`, `printables/pool-maintenance-checklist.html`, `printables/airbnb-pool-turnover-checklist.html`, `printables/hot-tub-maintenance-log.html`, `maintenance/how-to-balance-pool-water.html`, `maintenance/how-often-add-chlorine-pool.html`, `maintenance/how-to-fix-cloudy-hot-tub.html`, `reference/common-pool-chemistry-mistakes.html`, `reference/pool-chemicals-explained.html` (14 individual link corrections total).

## 4. Orphan-detection false positive (Steps 3/21)

`scripts/qa-engine.js`'s `runLinksAudit` (part of the `npm run build` release-gate) treated ANY page with zero inbound links as a critical build-blocking error, with no exemption for known redirect-source pages. Fixing item 3 above correctly reduced the 2 legacy chart pages' inbound links to zero (the right end-state for a retired page) -- which then caused the release gate to fail the build. Fixed by exempting `url-policy.js`'s `REDIRECT_SOURCES` from the orphan check, consistent with the same exemption already applied to `normalize-seo-metadata.js`, `build-link-matrix.js`, and this same file's `runSeoAudit` in Phase 7N.

## 5. Crawl-discovery islands (Steps 3/20/21)

- `scripts/generate-all-pages.js`: fixed a stray non-canonical href (`/tools/index` instead of the declared canonical `/tools`) and added a "Releases" section linking to `releases/index.html` (which already links to its own 3 children). `all-pages.html` is the site's explicit crawl-support mechanism (Step 7); this was a genuinely missing family, not an artificial link addition.
- Verified via a real BFS crawl simulation (`scripts/phase-7o/crawl-path-simulation.js`) starting from the homepage: undiscovered canonical pages dropped from 7 to 3 after this fix. The remaining 3 (`printables/*`) are addressed in the Review Queue rather than linked artificially -- see below.

## Not changed (flagged for future decision, not resolved unilaterally)

The 3 `printables/*` pages remain technically under-discoverable. Investigation found they are near-duplicate legacy content of already-canonical `resources/*` pages covering the identical checklists. Per Step 27's explicit prohibition on artificial internal-link inflation, and per the established precedent (Phase 7N's volume-calculator investigation, which required an explicit Director decision before any redirect/consolidation action), this phase does **not** unilaterally add links to prop up these pages or convert them to redirect sources. Documented as a well-evidenced candidate for a future dedicated decision in `REVIEW-QUEUE.md`.

## No calculator formula changes, no chemistry claim rewrites, no citation architecture changes, no URL renaming, no Spanish/French, no fabricated dates or search data.
