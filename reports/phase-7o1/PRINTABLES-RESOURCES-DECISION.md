# Phase 7O.1 — Printables vs Resources Architectural Decision

**Baseline commit:** `85c92457d1206b9f210b397e5c815a250627a7aa` (Phase 7O)

## Question

Phase 7O's crawl-path simulation found 3 canonical, indexable pages unreachable by any real crawler path: `printables/pool-maintenance-checklist.html`, `printables/hot-tub-maintenance-log.html`, `printables/airbnb-pool-turnover-checklist.html`. Each has a near-identical, richer, already-canonical, already-well-linked counterpart at `resources/*`. The Director explicitly deferred this to a dedicated phase rather than allowing a source-level "add some links" fix, mirroring the evidentiary bar set by Phase 7N's volume-calculator decision: is this a real, distinct asset, or a legacy duplicate that should be retired?

## Evidence

Word count, schema richness, header/nav sophistication, title-bug presence, and print-functionality parity were compared across all 3 pairs (not just one representative example):

| Pair | printables/* words | resources/* words | printables/* schema | resources/* schema | printables/* title | Both have print button? |
|---|---|---|---|---|---|---|
| pool-maintenance-checklist | ~90 | ~250+ | `WebPage` | `HowTo` | `Pool Maintenance Checklist (printables) \| WaterBalanceTools`* | Yes |
| hot-tub-maintenance-log | 128 | 296 | `WebPage` | richer | buggy disambiguation suffix* | Yes |
| airbnb-pool-turnover-checklist | 213 | 340 | `WebPage` | richer | `Airbnb Pool Turnover Checklist (printables) \| WaterBalanceTools`* | Yes |

\* The `(printables)` disambiguation suffix is the same title-collision-dedup bug fixed at its source in Phase 7N (`normalize-seo-metadata.js`). Its presence on all 3 pages is independent corroborating evidence: the script's dedup logic only appends this suffix when it detects two pages converging on the same base title — i.e., the tooling itself flagged these as duplicates before any human judgment was applied.

Consistent pattern across all 3 pairs:
- `resources/*` versions are longer, carry richer schema (`HowTo` vs plain `WebPage`), have a modern header (`data-canonical-nav="v4"`, full nav, breadcrumb schema, hero section), and correct titles.
- `printables/*` versions are shorter legacy-format pages with a stripped-down 3-link nav, no breadcrumb schema, and titles that were only ever "fixed" by a disambiguation-suffix bug rather than genuinely written to be distinct.
- Both versions render a working print button — print functionality is not a distinguishing feature; `resources/*` covers it too.
- No content, layout, or purpose difference was found that would justify two independently indexable URLs for the same checklist.

## Decision

**Register all 3 `printables/*` pages as `REDIRECT_SOURCES`**, pointing to their `resources/*` canonical equivalents — the same architectural pattern already established for `calculators/volume-calculator.html` and the 2 legacy `charts/*.html` pages (Phase 7C). This was Option 1 of the 3 options Phase 7O's review queue laid out, and the evidence above supports it over Option 2 (no genuine distinguishing feature was found to justify contextual linking as separate assets) or Option 3 (no undiscovered justification surfaced).

## Implementation

1. `scripts/url-policy.js`: added the 3 pages to `REDIRECT_SOURCES`, mapping to `/resources/pool-maintenance-checklist`, `/resources/hot-tub-maintenance-log`, `/resources/airbnb-pool-turnover-checklist`.
2. Manually set `<meta name="robots" content="noindex, follow">` and `<link rel="canonical" href="https://waterbalancetools.com/resources/...">` directly on all 3 physical `printables/*.html` files (no generator applies this automatically — confirmed by grep, same as the 3 prior redirect sources).
3. `scripts/generate-tools-index.js`: the `PRINTABLES` array's 3 hrefs updated from `../printables/*.html` to `../resources/*.html` (fixed at generator source, not the generated file).
4. `printables/airbnb-pool-turnover-checklist.html`: its own 2 internal cross-links to `printables/pool-maintenance-checklist.html` updated to `resources/pool-maintenance-checklist.html` (same redirect-source-link-cleanup class as Phase 7O's chart-page fix).
5. Regenerated `_redirects` and `functions/_middleware.js` via `node scripts/generate-redirects.js` — confirmed real 301 rules now exist for all 3 pages (both extensionless and `.html` request forms), matching the existing belt-and-suspenders architecture.
6. Verified via sitewide grep that `tools/index.html` was the only file outside the printables/ pages' own mutual cross-links referencing them; all such references are now corrected.

## Verification

- `npm run build`: PASS, QA overall 99/100, all 13 audit categories at or above threshold, no score regression vs. Phase 7O baseline (0 score changes across every audit category).
- `validate-url-indexation.js`: PASS -- 525 pages, 477 sitemap URLs (down from 480; the 3 pages correctly dropped out), 0 violations.
- `scripts/validate-phase-7o.js`: PASS -- 511 pages scanned, 485 sitemap URLs, 18/23 citation blocks/links intact, 0 errors, 0 warnings.
- `scripts/phase-7o/crawl-path-simulation.js`: **477/477 canonical pages discovered, 0 undiscovered** (previously 477/480 with printables/* as the 3 undiscovered pages -- they are no longer part of the canonical/indexable set at all, so the discoverability question is resolved by removal rather than by artificial linking).
- check-broken-links.js: 0 issues (525 pages checked) -- the internal-link fixes did not break anything.
- Full regression: all 20 prior-phase validators (chemistry knowledge/extraction/evidence, provenance x2, trust x2, editorial-decisions, programmatic-quality, schema-content-consistency, phase-7h/7i/7k/7m/7n, entity-provenance, citation-coverage, url-engine x2) PASS, 0 errors.
- Reproducibility: two-build hash comparison shows the same known footer-whitespace-only nondeterminism (170 HTML files this run, same category signature as prior phases -- 104 entities/16 guides/14 calculators/11 reference/etc.), confirmed 0 non-whitespace content differences on every candidate file (whitespace-collapsed diff). `printables/*` now appears in this footprint because they remain real production HTML files sharing the same footer template as every other page -- this is the same pre-existing, already-disclosed bug class, not a new one, and this phase did not touch the footer-rendering code.

## Scope control

No calculator formula changes, no chemistry claim rewrites, no citation architecture changes, no URL renaming of any `resources/*` page, no mass redirects beyond the 3 in question, no fabricated dates/search/GSC data, no artificial internal-link inflation. The `printables/*` physical files were kept on disk (not deleted) and remain reachable at their old URLs via real 301s -- consistent with the established redirect-source pattern, not a content deletion.
