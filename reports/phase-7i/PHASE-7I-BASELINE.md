# Phase 7I Baseline

Re-run the forensic audit fresh against the current, post-7H repository state before making any change (not assumed from Phase 7H's historical numbers). Output captured to `reports/phase-7i/current-state-snapshot/` (not written over the preserved `reports/phase-7a/` historical baseline) then that directory restored via `git checkout` immediately after each snapshot, per this project's standing rule against silently editing historical audit evidence.

## Metrics before Phase 7I's changes

| Metric | Value |
|---|---:|
| Total indexable pages | 522 |
| Entity pages | 105 (104 entities + index) |
| Glossary pages | 101 (100 terms + index) |
| Schema VALID / QUESTIONABLE / MISSING | 950 / 3 / 39 (unchanged from Phase 7H's closing state) |
| Accessibility findings | 0/523 (unchanged from Phase 7H's closing state) |
| Duplicate title groups | 0 |
| Duplicate meta-description groups | 0 |
| Content-quality IMPROVE flags | 174 |
| Content-quality MERGE flags (P1 tier) | 28 |
| Content-quality KEEP | 70 |
| TITLE_TOO_LONG findings (sitewide) | 116 (entities 11, glossary 7, calculators 6, reference 15, programmatic 36, guides 14, academy 13, comparisons 5, formulas 4, root 4, resources 1) |
| Sitemap URLs | 478-479 |
| Source/provenance state | Unchanged from Phase 7E.1's closing state (499 conflicts resolved, 5861 evidence records) |
| AEO state | Unchanged from Phase 7G/7H's closing state |

Confirmed identical to Phase 7H's reported closing numbers for schema and accessibility (no drift between phases). Content-quality/IMPROVE numbers matched Phase 7H's disclosed figures exactly (174 IMPROVE, 28 P1/MERGE) — confirming Phase 7H's "review queue" was still accurate at the start of this phase.

## Scope decision

Phase 7I's brief names entity/glossary pages as the primary target and TITLE_TOO_LONG broadly as a secondary target. Given the "do not mass-rewrite" constraint, this phase scoped its TITLE_TOO_LONG work to the pages explicitly named in Phase 7H's review queue (entities, glossary, calculators, reference — 39 of the 116 total findings) rather than the full sitewide set, to keep the change footprint proportionate and traceable. The remaining 77 (programmatic, guides, academy, comparisons, formulas, root, resources) are logged in the review queue for a future phase.
