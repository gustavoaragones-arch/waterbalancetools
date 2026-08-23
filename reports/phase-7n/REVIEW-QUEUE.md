# Phase 7N — Review Queue (Carry-Forward)

## Search-demand gaps logged, not created (see SEARCH-DEMAND-GAPS.csv)

- First-fill/newly-plastered pool chemistry (MISSING) -- distinct intent from seasonal reopening, needs its own evidence base.
- Bromine dosing calculator (MISSING) -- needs an independently-verified dosing formula first; explicitly out of scope (no calculator formula changes).
- Standalone LSI calculator page (MISSING) -- would need either a new page or a routing change to the existing chemical-calculator; deferred to a calculator-architecture phase.
- Covered-pool chemistry, dichlor, calcium hypochlorite, and salt-pool chemistry as dedicated guides (all PARTIALLY_COVERED) -- carried forward unchanged from Phase 7M's queue.

## Remaining TITLE_TOO_LONG findings (39, all KEEP)

academy/* (13), comparisons/* (5), formulas/* (4), guides/advanced+edge-cases+seasonal+chlorine (14), root chart pages (4), resources/1, programmatic/1 -- individually reviewed and judged non-redundant, informative overages. Full reasoning in `TITLE-AUDIT.csv`.

## Internal tooling metadata gaps (18, all NO_ACTION)

15 missing + 3 too-short meta descriptions, all on noindex internal QA/audit dashboards. Not real content pages; fixing would not satisfy any of the content-change justification criteria.

## Secondary calculators at depth 2 with lower inbound counts

`pool-turnover-rate-calculator`, `saltwater-pool-salt-calculator`, `spa-volume-calculator` reviewed and judged appropriately secondary (narrower intent than the 5 primary depth-1 calculators) -- not promoted.

## Footer-whitespace nondeterminism

Reconfirmed present, same ~171-file footprint as Phase 7M, zero non-whitespace difference on every file checked including the ones this phase touched. Not expanded by this phase's work. Still not fixed (pre-existing, cross-phase, would need its own dedicated phase).

## Architecture bugs found and fixed this phase (see PRODUCTION-CHANGES.md for full detail)

- `normalize-seo-metadata.js` title-disambiguation non-idempotence and directory-walk-order fragility.
- `build-link-matrix.js` and `qa-engine.js` not excluding retired/redirect-source pages from title-uniqueness and cross-link candidate pools.

These were root-caused and fixed generically (via `url-policy.js`'s existing `isRedirectSource()`), not patched only for the one page that surfaced them -- so any future retired page added to `REDIRECT_SOURCES` will automatically get the same correct treatment.

## Entity/glossary same-slug pairs (23)

Reviewed a 19-pair sample directly (not caught by the existing pairwise cannibalization tool) -- confirmed consistently, intentionally differentiated (entity = deep knowledge-graph node, glossary = short definition). No fix needed; documented as a confirmed-non-issue for future phases to avoid re-investigating from scratch.
