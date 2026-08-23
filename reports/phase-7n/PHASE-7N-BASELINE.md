# Phase 7N — Fresh SEO/Search Baseline

Captured fresh against commit `a6e78816` (Phase 7M, committed and pushed), not assumed from prior phases.

## Sitewide inventory

- Total pages: 524 (480 indexable)
- Schema: 953 VALID / 39 MISSING / 3 QUESTIONABLE
- Duplicate titles: 0. Duplicate descriptions: 0.
- TITLE_TOO_LONG: 52 findings (up slightly from Phase 7M's disclosed 51 -- a fresh count against the current page set, not an assumed carry-forward number)
- Missing meta description: 15 (all internal QA/audit dashboards, noindex)
- Meta description too short: 3 (2 internal audit tools, 1 noindex dataset doc)
- Canonical mismatch: 3 (the known, deliberate Phase 7C REDIRECT_SOURCES entries -- investigated in Step 8/12, confirmed intentional)
- Orphan pages: 2 (404.html, audit/google/index.html -- both non-content)

## Cannibalization (fresh re-run)

0 HIGH or CRITICAL pairs. 35 MEDIUM (spot-checked the top 15 -- all are calculator-vs-calculator pairs sharing template/format similarity but targeting genuinely distinct parameters, e.g. pool-volume vs. spa-volume vs. turnover-rate). 92 LOW.

## Entity/glossary same-slug pairs

23 entities share a slug with a glossary term of the same name (e.g. `entities/free-chlorine.html` / `glossary/free-chlorine.html`). Not caught by the existing pairwise cannibalization tool (which does not do an exhaustive entity-vs-glossary sweep). Manually reviewed a 19-pair sample: consistently differentiated (entity pages average ~450 words as knowledge-graph nodes with relationships/calculators/charts; glossary pages average ~325 words as short dictionary-style definitions, titled distinctly with a "| Glossary |" suffix).

## GSC / live search data

Checked `audit/google/` for real Search Console export data. Confirmed it is self-generated internal crawl-review/priority-scoring tooling built from the site's own structure (crawl-review.md, priority-pages.csv, freshness.html, etc.), not actual Google Search Console impressions/clicks/CTR/position data. No real GSC data exists anywhere in the repository. Per Step 18, this phase's entire analysis is architecture-based, not GSC-data-based -- no search impressions, clicks, CTR, or rankings are claimed anywhere in this phase's reports.

This is the pre-Phase-7N state. See `PRODUCTION-CHANGES.md` for what changed and `PHASE-7N-STATUS.md` for the post-phase comparison.
