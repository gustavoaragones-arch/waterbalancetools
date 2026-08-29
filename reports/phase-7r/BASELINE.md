# Phase 7R -- Fresh Baseline

Established by running `npm run build`, the applicable Phase 7 validators, and the forensic audit on the Phase 7Q-committed state (`ae751ca`) before any Phase 7R change was made. Not assumed from Phase 7Q's own historical report.

## Build

`npm run build`: PASS. QA 99/100, 0 errors, 6 warnings (unchanged from Phase 7Q).

## Chemistry knowledge registry (pre-Phase-7R)

- 15 parameters, 25 ranges, 18 sources, 19 claims (chemistry-claims.js -- 19 claims includes non-numeric/definitional entries; the range count of 25 differs from claim count because some claims share a range and some ranges have no canonical claim yet, per the architecture's own documentation).
- `claim-shock-breakpoint-rule` / `range-shock-breakpoint-rule-of-thumb`: REQUIRES_REVIEW, zero source_ids (unchanged since Phase 7E).

## Citation coverage (pre-Phase-7R)

21 citation blocks, 26 citation links (Phase 7Q's ending state, re-verified via `validate-citation-coverage.js` before any edit).

## URL / indexation

478 canonical indexable pages, 478 sitemap URLs, 6 redirect sources, 0 violations (`validate-url-indexation.js`).

## Forensic audit (pre-Phase-7R, on the clean Phase 7Q commit)

- 525 total HTML files.
- Schema: 952 valid / 39 missing / 6 questionable.
- Orphan pages: 7 (0 true orphans).
- Duplicate-title groups: 3 (broad scan; 0 among canonical indexable pages).
- Source audit (`AUTHORITY_RE`): 402/416 major factual pages recognized as citing zero external authority sources (Phase 7Q's fixed metric).
- Cannibalization: 0 HIGH risk.

## Prior-phase validators (all re-run fresh, not assumed)

All of: chemistry knowledge/extraction/evidence-dataset, provenance, provenance-resolution, trust/trust-layer, editorial decisions, programmatic quality, schema-content consistency, entity provenance, citation coverage, Phase 7H/7I/7K/7M/7N/7O/7P, URL engine + indexation, broken links -- PASS, 0 errors, matching Phase 7Q's own final regression state.

## Note on methodology

This baseline was captured by temporarily setting aside Phase 7R's in-progress edits (`git stash`), running the full pipeline and forensic audit against the clean Phase 7Q commit, then restoring the in-progress edits. `reports/phase-7a/` (the forensic audit's own output directory) was restored to its committed state immediately after this baseline capture, per this project's established snapshot-then-restore discipline for that directory.
