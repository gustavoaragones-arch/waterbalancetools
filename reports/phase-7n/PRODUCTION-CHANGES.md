# Phase 7N — Production Changes

## 1. Volume calculator pair architecture decision (Steps 8/9/16)

**Decision: KEEP both URLs as currently configured.** `/calculators/pool-volume-calculator` is the canonical, indexed, sitemapped page. `/calculators/volume-calculator` remains a permanent legacy-compatibility URL under `scripts/url-policy.js`'s `REDIRECT_SOURCES` registry (noindex + canonical soft-redirect, the correct pattern for a static site with no server-side redirect infrastructure) -- this was a deliberate Phase 7C decision, confirmed still correct, not reversed.

Investigating this surfaced and fixed 3 real bugs:

- **Doubled title bug**: `calculators/volume-calculator.html`'s `<title>` had accumulated "(calculators) (calculators)" from a non-idempotent disambiguation bug in `scripts/normalize-seo-metadata.js`. Fixed the title directly and fixed the root cause (see below).
- **Non-idempotent + order-dependent disambiguation**: `normalize-seo-metadata.js`'s duplicate-title-disambiguation logic re-derived its "already seen this title" check from whatever was currently on disk (which could already carry a prior run's disambiguation suffix), and its file-processing order is not guaranteed -- on some orderings this could force the disambiguation suffix onto the *canonical* page instead of the retired one. Fixed by having the script skip retired/redirect-source pages entirely (via `url-policy.js`'s existing `isRedirectSource()`), so they never claim a title slot or get force-disambiguated.
- **Stray cross-links**: 3 pages (`guides/seasonal/winter-pool-maintenance-chemistry.html`, `guides/questions/can-rain-affect-pool-chemistry.html`, `printable/maintenance-checklist.html`) linked to the retired `volume-calculator.html` as if it were a second, live calculator -- directly contradicting an explicit policy comment in `scripts/restructure-calculator-pages.js` ("must not be listed, restructured, or cross-linked as if it were a second live calculator"). Root-caused to `scripts/build-link-matrix.js`'s `buildPool()` walking the `calculators/` directory with no exclusion for retired pages. Fixed by filtering `isRedirectSource()` pages out of that pool; fixed the one static hand-authored link directly.
- Also excluded redirect-source pages from `scripts/qa-engine.js`'s SEO audit duplicate-title check, for the same reason -- a noindexed, canonicalized legacy page sharing title text with its live replacement is not a real duplicate-title problem.

Verified: the forensic re-audit's action-matrix no longer flags `pool-volume-calculator` as MERGE/P1 (was newly flagged at the close of Phase 7M); it is now `UNCHANGED/P3`.

## 2. Title fixes (Step 2)

- `scripts/generate-data-docs.js`: fixed 8 `reference/datasets/*` pages' titles repeating the brand name twice (`WaterBalanceTools Datasets | WaterBalanceTools`) -> `Datasets | WaterBalanceTools`.
- `guides/edge-cases/evaporation-effect-on-pool-chemistry.html` (this project's own Phase 7M page): shortened from 89 to 59 characters, removing an explanatory parenthetical already covered by the page's own direct-answer paragraph.
- 39 remaining pages across academy/comparisons/formulas/guides/root/resources/programmatic individually reviewed and classified **KEEP** -- their length comes from genuine, non-redundant descriptive or category content, not filler. Full reasoning per group in `TITLE-AUDIT.csv`.

## 3. Internal-link equity (Step 9)

- `maintenance/how-often-add-chlorine-pool.html`: added a contextual link from `guides/chlorine-guide.html`'s silo list (`scripts/generate-hub-pages.js`). Crawl depth 5->3, inbound links 2->3.
- `maintenance/how-to-fix-cloudy-hot-tub.html`: added to `academy/troubleshooting/cloudy-water.html`'s `relatedResources` (`data/academy.json`). Crawl depth 5->4, inbound links 2->3.

## No calculator formula changes, no chemistry claim rewrites, no citation architecture changes, no URL renames, no Spanish/French, no fabricated search-demand or GSC data.

Every change above is a metadata, internal-link, or architecture-bug fix -- content wording was touched only for the two title shortenings (both this project's own recent pages, not chemistry claims).
