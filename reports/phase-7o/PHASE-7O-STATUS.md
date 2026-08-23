# Phase 7O — Indexing & Crawl Optimization

**Status: PASS WITH REVIEW QUEUE**

## Baseline

524 pages, 480 indexable, 953/39/3 schema, 0 duplicate titles/descriptions, 2 orphans (both intentional). Full detail: `PHASE-7O-BASELINE.md`.

## Canonical / Sitemap / Robots

Fixed a real duplicate `<loc>` (homepage appeared twice in `sitemap-calculators.xml`). Confirmed no noindex/redirect-source/tooling URLs in the sitemap after fixes. `robots.txt` audited and found already correct (permissive `Allow: /`, correct sitemap declaration, no unnecessary blocking) -- KEPT unchanged.

## Orphans

4 orphans post-fix (up from 2), all confirmed INTENTIONALLY_LOW_PRIORITY -- the 2 new ones are the legacy chart pages, which correctly *should* have zero inbound links now that 11 stray internal links were corrected to point at their canonical replacements instead. 0 TRUE ORPHANs. `qa-engine.js`'s release-gate orphan check fixed to recognize this as the correct end-state rather than a critical error. Full detail: `ORPHAN-AUDIT.csv`.

## Crawl Depth

Distribution: depth 0 (1), 1 (31), 2 (182), 3 (271), 4 (4), 5 (2), 6+ (0). 0 P0/P1 findings (no important page sits deeper than warranted). 3 P2 findings, all judged acceptable. Full detail: `CRAWL-DEPTH-AUDIT.csv`.

## Internal Discovery Paths / Hub Discovery

Verified Phase 7M's seasonal pages, Phase 7L's citation pages, and Tier-1/2 content all have real contextual paths. `all-pages.html` corrected (stray non-canonical href, missing Releases family).

## All-Pages Hub

Generator-driven, deterministic. No noindex/tooling/retired pages leak in (verified directly). One stray non-canonical href fixed; one missing family (Releases) added -- both genuine gaps, not cosmetic reordering. Otherwise KEPT as-is.

## Sitemap Architecture

Duplicate-loc bug fixed at the generator source. Partitioning, canonical consistency, and URL-policy alignment otherwise confirmed correct.

## Lastmod / Freshness

**Real, substantive fix.** Sitemap lastmod previously stamped every URL with the current build date. Now derived from real, non-fabricated git commit history per file. Full detail: `LASTMOD-AUDIT.md`.

## Robots

Audited, no issues found, unchanged.

## Redirect Crawl Efficiency

0 chains, 0 loops among the 3 known redirect sources (verified programmatically). 11 stray internal links corrected. Full detail: `REDIRECT-CRAWL-AUDIT.csv`.

## Canonical Discovery

Fixed at generator/source level per Step 12's explicit instruction -- no hundreds of files hand-patched; the 11 real fixes were a small, bounded, source-traceable set with no shared generator responsible (confirmed via search), so each was corrected directly.

## Crawl Waste

3 redirect sources: NECESSARY (serve real inbound-link/bookmark compatibility) + NOINDEX + REDIRECT via Cloudflare `_redirects` (confirmed real 301s exist, not just soft canonical). Internal tooling (`reports/`, `audit/`, `qa/`, `tools/`, `search/`) confirmed correctly excluded from sitemap/search-index by `url-policy.js`. 3 `printables/*` pages flagged as a genuine near-duplicate-content question for a future dedicated decision -- not resolved unilaterally.

## Internal Search

`data/search-index.json` (478 entries) audited -- correctly excludes redirect sources and internal tooling. KEPT unchanged.

## Crawl Priority

14-family Tier 1-4 map built from real internal-link-equity measurements, not invented scores. 5 pages/guides honestly reclassified from an initial Tier-1 assumption to Tier 2 after measuring their actual inbound counts (3-18) against the genuinely Tier-1-scale pages (25-468). Full detail: `CRAWL-PRIORITY-MAP.csv`.

## Tier 1 Internal-Link Equity

Homepage and primary calculators: 460-497 inbound links each, depth 0-1. Big-3 charts and cornerstone guide: 25-468 inbound. All genuinely well-supported -- no targeted fix needed for true Tier-1 pages.

## Programmatic Discovery

Did not reopen Phase 7N.1's KEEP decision. Verified all 26 pages have a legitimate hub/contextual path (via their family index + silo guide cross-links) -- confirmed via the crawl simulation, all 26 discovered.

## Entity / Glossary Discovery

Not re-audited in full depth (Phase 7N already reviewed 23 same-slug pairs and confirmed differentiation); spot-checked via the crawl simulation -- all entity/glossary pages discovered via contextual crawl, none in the undiscovered list.

## Seasonal Discovery

All Phase 7M year-round pages (indoor pool chemistry, evaporation, hot-tub winter care, temperature) confirmed discoverable via contextual crawl at depth 2-3, unchanged from Phase 7N's findings.

## Crawl Simulation

Real BFS from homepage: **477/480 canonical pages discovered** via contextual links alone (up from 473/480 before this phase's `all-pages.html` fix). 3 undiscovered (`printables/*`) -- documented in the Review Queue rather than artificially linked. Full detail: `CRAWL-PATH-SIMULATION.md` / `.json`.

## Indexation Contradictions

All resolved or explicitly justified: duplicate sitemap loc (FIXED), redirect sources with stray inbound links (FIXED), orphan-check false positive on redirect sources (FIXED), crawl-discovery islands (FIXED for releases/tools, DOCUMENTED for printables).

## Validator

`scripts/validate-phase-7o.js`: 511 pages, 488 sitemap URLs, 18/23 citations confirmed, checks sitemap purity, redirect-source link cleanliness, orphans (with intentional exceptions), lastmod determinism/non-fabrication, citation preservation. Result: 0 errors, 0 warnings.

## Regression

All prior-phase validators PASS (chemistry, provenance, trust, schema, editorial, programmatic-quality, entity-provenance, citation-coverage, phase-7h/i/k/m/n), plus check-broken-links, test-url-engine, validate-url-engine.

## Forensic Re-Audit

524 pages (unchanged), schema 953/39/3 (unchanged), 0 duplicate titles/descriptions (unchanged), 0 accessibility issues (unchanged), 0 HIGH cannibalization (unchanged). Orphans 2->4, fully explained and confirmed intentional (see Orphans section) -- no legitimate page was deleted or hidden.

## Reproducibility

Two-build hash comparison: same 171-file whitespace-only footprint as Phase 7M/7N's confirmed baseline, identical category distribution -- not expanded. Sitemap XML files are now fully excluded from that footprint (byte-identical across builds), a direct benefit of the lastmod fix.

## Scope Control

No Spanish/French, AdSense, formula changes, URL renaming, mass redirects, fabricated dates/search data/GSC data, keyword stuffing, or artificial link inflation. The one page-count-affecting change (all-pages.html gaining a Releases section) is a genuine missing-family fix, not link-farming.

## Production Changes

5 files: `scripts/generate-sitemaps.js` (lastmod + duplicate-loc fix), `scripts/qa-engine.js` (orphan-check exemption), `scripts/generate-all-pages.js` (canonical href fix + Releases section), and 11 content files' redirect-source link corrections. Full detail: `PRODUCTION-CHANGES.md`.

## Remaining Review Queue

`printables/*` vs `resources/*` duplicate-content decision (requires explicit sign-off, same class of decision as Phase 7N's volume-calculator case); 5 secondary charts/guides reclassified Tier 1->2; footer-whitespace nondeterminism (unchanged); legacy `generate-sitemap.js` flagged for awareness if ever reactivated.

---

## Phase 7P Decision

**GO** -- real, source-level crawl/indexation bugs found and fixed (not cosmetic), no fabricated data, no regressions, and the one genuine open question (printables duplication) explicitly queued for a dedicated decision rather than resolved unilaterally.

DO NOT BEGIN PHASE 7P AUTOMATICALLY.

END PHASE 7O
