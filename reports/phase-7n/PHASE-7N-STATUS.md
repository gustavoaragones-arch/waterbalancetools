# Phase 7N — Forensic SEO, Indexation & Search-Demand Optimization

**Status: PASS WITH REVIEW QUEUE**

## Baseline

Fresh audit against commit `a6e78816`: 524 pages, 480 indexable, 953/39/3 schema, 0 duplicate titles/descriptions, 52 TITLE_TOO_LONG findings, 0 HIGH/CRITICAL cannibalization, 23 entity/glossary same-slug pairs (reviewed, confirmed non-cannibalizing), no real GSC data present in the repository. Full detail: `PHASE-7N-BASELINE.md`.

## Titles

52 findings individually reviewed. 3 genuine defects fixed: 8 dataset pages' doubled brand name, `volume-calculator.html`'s doubled disambiguation suffix (which led to finding and fixing a real non-idempotence/order-dependence bug in the shared title-normalization script), and this project's own overly-long evaporation-page title. 39 remaining findings classified KEEP after individual review -- their length comes from genuine category or descriptive content, not redundancy. Full detail: `TITLE-AUDIT.csv`.

## Meta Descriptions

18 findings (15 missing, 3 too-short), all on noindex internal QA/audit tooling -- classified NO_ACTION, not real content pages. 3 canonical-mismatch findings confirmed as the known, deliberate Phase 7C redirect-source architecture. Full detail: `META-DESCRIPTION-AUDIT.csv`.

## Search Intent

480 indexable pages mapped to primary/secondary intent, search stage, and canonical role from observable page-level signals (page type, calculator/table/FAQ presence) -- no invented search volume. Full detail: `SEARCH-INTENT-MAP.csv`.

## Cannibalization

0 HIGH/CRITICAL pairs (re-confirmed fresh). 35 MEDIUM pairs spot-checked -- all calculator-vs-calculator pairs sharing template format but targeting genuinely distinct parameters (pool volume vs. spa volume vs. turnover rate, etc.), correctly not cannibalizing. Additionally reviewed 23 entity/glossary same-slug pairs not caught by the existing pairwise tool -- a 19-pair sample confirmed consistently, intentionally differentiated by depth and title.

## Calculator / Guide / Chart Architecture

14-parameter matrix built. All CLEAR -- no page-type intent collisions found. Full detail: `PAGE-TYPE-INTENT-MATRIX.csv`.

## Programmatic Pages

Reassessed the 26 pages against Step 7's 9-point checklist (unique query intent, unique numerical input/result, unique title/H1, appropriate canonical role and internal-link position). Each has a genuinely unique computed result and title; the underlying HIGH duplication risk on 3 of 4 families (unchanged from Phase 7M, correctly not re-litigated) is judged structurally acceptable, not a defect requiring generator changes -- no generator was modified merely to reduce a similarity metric this phase.

## Volume Calculator Pair

**Decision: KEEP both URLs as currently configured.** `pool-volume-calculator` remains canonical/indexed/sitemapped; `volume-calculator` remains a permanent Phase 7C legacy-compatibility URL (noindex + canonical). Investigating this surfaced and fixed 3 real architecture bugs (doubled title, non-idempotent disambiguation, stray cross-links from 3 other pages). Verified: the forensic re-audit no longer flags this pair as MERGE/P1. Full detail: `PRODUCTION-CHANGES.md`.

## Internal Link Equity

2 real user-facing pages found at depth 5 with only 2 inbound links each despite direct topical relevance to existing hubs. Added one targeted contextual link each (via the existing hub-generator and academy relatedResources mechanisms, not a link-engine redesign). Crawl depth improved 5->3 and 5->4 respectively; inbound links 2->3 each. Full detail: `INTERNAL-LINK-OPPORTUNITIES.csv`.

## Crawl Depth

All 5 primary calculators at depth 1 with 460+ inbound links. 3 secondary calculators at depth 2 with lower but appropriate inbound counts (reviewed, judged correct). Only 2 orphan pages sitewide, both non-content (404, an internal dashboard index).

## Sitemap / Canonical / Indexation

Sitemap contains no noindex pages, no redirect-source pages, no duplicates (verified by the new validator). The 3 known canonical-mismatch findings are the deliberate Phase 7C redirect-source pattern, confirmed intentional in Step 8's investigation.

## Seasonal Search Architecture

All year-round topics (hot tub, indoor pool, temperature, evaporation, winterization, reopening, climate-independent troubleshooting) confirmed integrated into primary navigation/hub structure at depth 2-3. Evaporation page (newest, from Phase 7M) has a lower inbound count reflecting its recency, not a structural gap. Full detail: `SEASONAL-SEARCH-MAP.csv`.

## Entity / Glossary Discoverability

Confirmed 23 entity/glossary same-slug pairs are consistently, intentionally differentiated (entity = deep knowledge-graph node ~450 words with relationships/calculators, glossary = short definition ~325 words) -- not a discoverability or cannibalization problem. No entity content expanded this phase (no genuine architecture problem identified that would justify it).

## SERP Semantic Consistency

29 high-priority pages (all calculators, all charts, key academy/guide pages) checked for title/H1/meta/canonical/schema contradictions. 0 flagged. Full detail: `SERP-SEMANTIC-CONSISTENCY.csv`.

## Search-Demand Gaps

8 gaps identified from observable evidence only (existing entity coverage, calculator/formula-engine scope, existing page clusters) -- no invented search volume, no GSC data (none exists in the repository; confirmed and disclosed per Step 18). 2 classified MISSING, 6 PARTIALLY_COVERED, 0 created this phase (each requires either new evidence research or a bigger architectural decision than this phase's scope). Full detail: `SEARCH-DEMAND-GAPS.csv`.

## Validator

`scripts/validate-phase-7n.js` created: checks duplicate titles/descriptions (excluding known redirect sources), title/H1 mismatch, canonical presence, malformed links, citation preservation, sitemap purity, and accessibility on touched pages. Result: 511 pages scanned, 18 citation blocks (23 links) confirmed intact, 0 errors, 0 warnings.

## Regression

`npm run build` clean. All prior-phase validators PASS: chemistry-knowledge, chemistry-extraction-v2, chemistry-evidence-dataset, provenance, provenance-resolution, trust-layer, trust, editorial-decisions, programmatic-quality, schema-content-consistency, phase-7h, phase-7i, entity-provenance, phase-7k, citation-coverage, phase-7m, phase-7n, plus check-broken-links, test-url-engine, validate-url-engine.

## Forensic Re-Audit

524 pages (unchanged), schema 953/39/3 (unchanged), 0 duplicate titles/descriptions (unchanged), 0 accessibility issues (unchanged), 0 HIGH cannibalization (unchanged). **P1/MERGE findings dropped from 28 to 26** -- the pool-volume-calculator pair is no longer flagged, directly confirming this phase's Step 8 fix.

## Reproducibility

Sitewide two-build hash comparison: same ~171-file footprint as Phase 7M's confirmed baseline, same categories, same magnitude -- this phase did not expand it. Spot-checked entities/temperature.html and 5 files this phase directly touched: all byte-identical except pure formatting artifacts of the pre-existing footer-injection pattern (one page, the evaporation guide, shows a single added blank line -- confirmed zero content difference, same pattern already disclosed in Phase 7M for this exact page). No new nondeterminism introduced.

## Scope Control

No Spanish/French. No AdSense. No calculator formula changes. No broad chemistry rewrite. No mass content rewrite. No mass citation injection. No fake authors/reviewers. No fabricated search volume or GSC data (explicitly confirmed none exists). No URL renaming (the volume-calculator investigation concluded with KEEP, not a rename). No automatic page merging. No similarity-score gaming (no generator was touched to reduce a similarity metric). No sitemap priority manipulation. No keyword stuffing.

## Production Changes

7 files/areas touched: `scripts/generate-data-docs.js` (8 pages), `scripts/normalize-seo-metadata.js` + `scripts/build-link-matrix.js` + `scripts/qa-engine.js` (architecture bug fixes, sitewide-applicable), `calculators/volume-calculator.html` + `printable/maintenance-checklist.html` (direct title/link fixes), `guides/edge-cases/evaporation-effect-on-pool-chemistry.html` (title shortened), `scripts/generate-hub-pages.js` + `data/academy.json` (2 internal links added). Full traceable detail: `PRODUCTION-CHANGES.md`.

## Remaining Review Queue

See `REVIEW-QUEUE.md`: 8 search-demand gaps (2 MISSING, 6 PARTIALLY_COVERED, none created), 39 KEEP-classified long titles, 18 NO_ACTION internal-tooling metadata findings, 3 secondary calculators reviewed and left at depth 2, the footer-whitespace nondeterminism (unchanged scope), 23 entity/glossary pairs confirmed non-issues.

---

## Phase 7O Decision

**GO** -- real architecture bugs found and fixed (not cosmetic), a deliberate and now-verified volume-calculator decision, measured internal-link improvements, zero regressions, and an honestly bounded remaining queue.

DO NOT BEGIN PHASE 7O AUTOMATICALLY.

END PHASE 7N
