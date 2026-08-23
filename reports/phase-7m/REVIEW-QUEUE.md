# Phase 7M — Review Queue (Carry-Forward)

## Programmatic families still HIGH risk

chlorine, shock, and hot-tubs remain HIGH duplication risk after real, measured reduction (see `PRODUCTION-CHANGES.md`). pH moved to MEDIUM. Per Step 4's explicit framework, each family was evaluated against the 7-question test: the user problem and computed result ARE genuinely unique per page (a real, distinct volume/value), but the scenario, edge cases, and decision logic are largely shared across a family by design (the same target range and safety guidance apply regardless of pool size). Further reduction options, not taken this phase:
- **Merge candidates**: none of the 26 pages were marked MERGE_CANDIDATE -- each represents a genuinely distinct, real search query (a specific pool/spa volume or specific pH range), not a duplicate intent.
- **Deeper differentiation** would require either volume-specific edge cases that don't yet exist in the evidence base (e.g., "small pools heat faster" is directionally true but not sourced to a specific figure) or restructuring the shared reference content into a single canonical page with volume-pages linking to it rather than restating it -- a bigger architectural change than this phase's remit.

## Newly-flagged borderline pair: pool-volume-calculator vs volume-calculator

The forensic re-audit's action-matrix flagged these two calculators as MERGE (P1) for the first time this phase, driven by `originality_score=1`. Investigated directly: neither file's content was touched this phase. The change traces to `scripts/build-link-matrix.js`'s "Related in this topic" link selection, which is sensitive to the sitewide page graph (affected incidentally by this phase's 2 new pages) and pushed an already-borderline pairwise similarity (0.42-0.44, MEDIUM in `programmatic-duplication.csv`) across the action-matrix's separate per-page originality threshold. The family-level average similarity for `calculators` barely moved (0.272 -> 0.273). Confirmed via two consecutive builds from the final state that this is now stable, not ongoing randomness. Not fixed this phase (would mean either editing the shared link-matrix algorithm or deprecating one of two intentionally-aliased calculator URLs, both out of scope) -- flagged for a future phase to decide whether `pool-volume-calculator` and `volume-calculator` should be consolidated via redirect.

## Reproducibility: footer-whitespace nondeterminism, broader than previously characterized

Re-confirmed the inherited `inject-footer.js` whitespace-only drift (blank-line/indentation count before `<footer>`) touches ~171 files per build (entities, calculators, reference, guides, releases, printables, maintenance, charts, and others) -- broader than Phase 7L's "150-170 files, mostly qa/reports" characterization, though consistent in magnitude. Verified on a sample from multiple categories (entities/temperature.html, calculators/pool-ph-calculator.html, the new evaporation page) that every diff is exactly this whitespace/blank-line pattern with zero non-whitespace difference. Not fixed this phase (pre-existing, unrelated to Phase 7M's content work, and fixing the injector itself is a separate, dedicated-phase task).

## Remaining TITLE_TOO_LONG findings (51)

50 are not the redundant-suffix pattern this phase fixed and would need individual, page-specific review (guides 14, academy 13, reference 8, comparisons 5, formulas 4, root 4, calculators 1, resources 1) -- deferred rather than sitewide-rewritten. 1 (`programmatic/behavior/how-often-to-test-pool-water.html`, 66 chars) is the same pattern but 1 character over even after the fix, since its config-level title text is itself long; not hand-edited to avoid a piecemeal per-title rewrite.

## Edge cases logged INVESTIGATE (not created this phase)

Covered-pool chemistry (folded into winterization content, no dedicated guide), newly-filled/first-fill pool chemistry, fresh-water-dilution depth beyond the thin `water-replacement` entity, dichlor as a dedicated academy article, and calcium hypochlorite as a dedicated academy article. See `EDGE-CASE-MATRIX.csv` for the full disposition of all 29 evaluated cases -- these five are the only ones not already adequately covered.

## Salt-water pool chemistry guide (topical depth)

`TOPICAL-DEPTH-MATRIX.csv` notes salt systems has strong equipment coverage (academy/equipment/salt-systems) and comparison coverage, but no single dedicated "salt pool chemistry management" guide distinct from the equipment article -- logged as a future candidate, not created this phase since existing comparison/chart coverage was judged adequate for now.
