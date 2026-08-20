# Phase 7I — Thin Entity/Glossary Content & SEO Metadata Remediation

**Status: PASS WITH REVIEW QUEUE**

## Baseline

Re-run fresh: 522 pages, 105 entity pages, 101 glossary pages, schema VALID 950/QUESTIONABLE 3/MISSING 39 (unchanged from Phase 7H's close), accessibility 0/523 (unchanged), 174 content-quality IMPROVE flags, 28 P1/MERGE flags, 116 TITLE_TOO_LONG findings sitewide. All figures confirmed identical to Phase 7H's disclosed closing state.

## Thin Content

Root cause of nearly all entity thinness: `scripts/generate-entities.js` silently dropped the `longDescription` field (and `aliases`/`synonyms`/`sourceOrganizations`) when compiling `data/graph/entity-index.json`, even though all 104 entity records already had this content fully authored in `scripts/data/entities-*.js`. Fixed the compiler — no new content was written, existing content was surfaced. IMPROVE flags: 174 → 119. Full inventory of all 204 entity/glossary pages (KEEP/IMPROVE/MERGE/NOINDEX/INVESTIGATE) in `thin-page-inventory.csv`.

## Entity Pages

104 entities now render their full, already-authored Definition instead of a one-sentence fallback. 19 remaining IMPROVE-flagged entities individually reviewed and classified KEEP by policy: 4 organization stubs (cdc, epa, nsf, lamotte — concise "who is this org" answers that satisfy their query), 10 unit-definition entities (inherently short by design), 4 resource-pointer entities (concise but complete), 4 flagged on a duplication-heuristic false positive (verified: `entities` family LOW risk, avg_pairwise_similarity 0.201 — the flagged similarity is shared card-UI structure, not prose duplication). Full reasoning in `entity-content-decisions.csv`.

## Glossary Pages

Audited the existing architecture (`scripts/generate-glossary.js` / `glossary-terms.js`): already implements a rich definition → explanation → why-it-matters → typical-values → related-tools pattern close to the brief's preferred model. No architecture change needed. All 7 flagged glossary pages were a title-length issue only (confirmed by direct read) — fixed, 0 glossary IMPROVE flags remain.

## Confirmed Priority Pages

**fiberglass-pool**: root-caused to the entity-index.json bug above. Data already had a genuine, chemistry-specific longDescription (algae resistance, 150-250 ppm calcium target, gelcoat leaching risk, cannot be refinished). Now rendered. **vinyl-pool**: same root cause; its longDescription is genuinely distinct (metal/fitting corrosion risk instead of gelcoat, liner bleaching from undissolved chemicals, 8-15 year liner lifespan) — resolving both the thinness AND the Phase 7H near-duplication finding in one fix, since the two pages' content is now demonstrably different.

## SEO Metadata

39 of 116 sitewide TITLE_TOO_LONG findings addressed (entities 11, glossary 7, calculators 5, reference 7 — 1 of the original 6+8 calculator/reference findings was the retired `volume-calculator.html`, deliberately excluded; 1 was already KEEP-by-policy from Phase 7H). 2 META_DESCRIPTION_TOO_SHORT findings fixed via a longDescription-derived fallback. 0 duplicate titles remain (1 genuine collision found and fixed: `unit-liters` vs `liters`). Remaining 77 TITLE_TOO_LONG findings (programmatic, guides, academy, comparisons, formulas, root, resources, noindex dataset docs) logged for a future phase. Full detail in `title-resolution.csv`.

## AEO

No new answer blocks manufactured. The entity longDescription fix directly improves AEO answerability (each entity's Definition section now contains real, extractable, differentiated facts instead of a generic one-liner) as a side effect of fixing the underlying content-completeness bug, not as a separate AEO-specific change.

## Internal Linking

No internal-link changes made this phase — the entity/glossary relationship data (`calculatorIds`, `relatedEntities`, `academyIds`, etc.) was already present and correctly linked; only the compiler was dropping unrelated fields. No new links added merely to increase count, per Step 9.

## Schema

No schema regression. `validate-schema-content-consistency.js` (Phase 7H): PASS, 0 critical. No new schema type added to any page this phase — the entity/glossary content changes were prose-only.

## Accessibility

0/523 pages flagged, unchanged from Phase 7H's close. No heading-level, label, or table changes made this phase.

## Validators

`validate-phase-7i.js` (new): **PASS — 258 pages scanned (entities/glossary/calculators/reference), 0 violations, 2 warnings** (both pre-existing/acceptable H1-title natural-language variance, not defects).

## Regression

All prior-phase validators (7B, 7C, 7D, 7D.2, 7D.3, 7E, 7E.1, 7F, 7F.1, 7G, 7H) plus broken-links, URL-engine, and existing trust validator: **all PASS**, no regressions.

## Reproducibility

Two-build comparison found nondeterminism, consistent with — and now additionally touching — the two sources Phase 7H already disclosed and did NOT claim fixed: (1) `Date.now()`-based QA/freshness scoring, and (2) a build-order-dependent internal report (`audit/google/crawl-depth.html`, `data/indexing/freshness.json` — both noindex internal-tooling files) that lags one build behind the current page-title state before catching up, the same oscillation pattern as Phase 7H's breadcrumb finding. Neither is fixed by this phase; both are logged as inherited, per Step 20's explicit instruction. Confirmed this does not contaminate the actual content-quality result: every entity/glossary/title fix was independently verified against the live, current file state (not the oscillating report), and both `validate-phase-7i.js` and `validate-schema-content-consistency.js` pass against the current build.

## Scope Control

No Spanish/French paths exist. No AdSense config touched. `js/calc-utils.js` untouched. `scripts/url-policy.js`, `scripts/redirect-rules.js`, `scripts/generate-sitemaps.js`, `_redirects` untouched — no URL/redirect/sitemap architecture changes. `scripts/generators/*` (Phase 7G's programmatic generators) untouched — Phase 7G remains intact. Sitemap URL count stable at 478-479. No fake authors/reviewers/authority/Person schema added anywhere (validator-enforced). No mass citation injection — Step 7 reused the existing provenance architecture and added zero new source records.

## Remaining Review Queue

- Newly-surfaced entity `longDescription` content (104 pages) has not yet been run through the Phase 7D extraction → 7E provenance-classification → 7E.1 conflict-resolution pipeline, since it was never previously rendered and therefore never scanned. Spot-checked for consistency (no contradictions found); a full extraction pass is recommended for a future phase. See `SOURCE-RESEARCH.md`.
- 77 remaining sitewide `TITLE_TOO_LONG` findings (programmatic, guides, academy, comparisons, formulas, root pages, resources, noindex dataset docs) — out of this phase's entity/glossary/calculator/reference scope, logged for a future metadata pass.
- ~62 additional entity/glossary pages beyond the 19+individually-reviewed set were not each individually read in full (the systemic fix resolved their flagged symptom; the KEEP classifications for the 19 that remained flagged were each individually verified, but the ~85 that dropped off the IMPROVE list post-fix were verified in aggregate via the audit re-run, not each re-read by eye).
- Two inherited, undisclosed-as-fixed nondeterminism sources (QA/freshness scoring, internal report title lag) — logged, not resolved, confined to non-production internal tooling.
- `reference/datasets/*`'s 8 noindex `TITLE_TOO_LONG` findings — deliberately out of scope (noindex).

## Phase 7J Decision

**GO** — with the review queue above carried forward.

**DO NOT BEGIN PHASE 7J AUTOMATICALLY.**

END PHASE 7I
