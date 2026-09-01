# Phase 7Y -- Baseline

## Starting state (verified)

- Branch: `main`
- HEAD: `e959f8d448b707f392d736f0269fef72b7b81699`
- origin/main (after `git fetch origin`): `e959f8d448b707f392d736f0269fef72b7b81699` -- **matches HEAD**
- Working tree: **clean** at phase start (`git status --porcelain` returned no output)
- HEAD commit: `e959f8d Phase 7X: content alignment & breakpoint-claim reconciliation` -- confirmed as the required starting commit
- Pre-existing uncommitted paths: **none**. Phase 7Y begins from the exact committed Phase 7X state.

## Relevant Phase 7X metrics (from `reports/phase-7x/PHASE-7X-STATUS.md`)

- 23 files read/classified, 11 problem passages corrected across 7 source files -> 14 rendered pages.
- 0 chemistry claims found wrong; `chemistry-claims.js`/`chemistry-ranges.js`/`dataset-dosage-matrices.js` unmodified.
- Forensic re-audit: P0/P1/P2/P3, schema, broken links, duplicate titles, orphans, cannibalization all unchanged from Phase 7W baseline.
- Reproducibility: byte-identical across two isolated regenerations.

## Exact academy desynchronization known at Phase 7X close

From `reports/phase-7x/REVIEW-QUEUE.md` and `PRODUCTION-CHANGES.md`: regenerating `data/academy.json` via `scripts/populate-data.js` (required to propagate Phase 7X's own content edits) exposed that the **committed** `data/academy.json` contained two articles -- `fund-07` (`academy/fundamentals/new-pool-startup-chemistry`) and `fund-08` (`academy/fundamentals/indoor-pool-chemistry`) -- that do **not** exist in `scripts/data/academy-fundamentals.js`, the file `populate-data.js` treats as that family's input. A full regeneration would silently drop both records (and their live HTML pages would become orphaned/unreferenced by any source). Phase 7X did not investigate the cause; it preserved the two records via a surgical JSON patch (reset to committed baseline, then applied only its own 5 intended body-text edits by exact string match) and flagged this for Phase 7Y as the HIGH PRIORITY carry-forward item.

Phase 7X also noted, without investigating: the committed `academy.json` carried one extra source citation (on the `breakpoint-chlorination` article) and one extra related-resource link (on `strong-chlorine-smell`) absent from their current source files.

## Phase 7X artifacts read in full before this phase's investigation began

`reports/phase-7x/PHASE-7X-STATUS.md`, `REVIEW-QUEUE.md`, `PRODUCTION-CHANGES.md`, `CONTENT-AUDIT.md`, `BASELINE.md`, `DECISION-MATRIX.csv` -- all authored in this same session immediately prior to this phase, content independently re-verified against the live repository rather than assumed correct (see `ACADEMY-RECONCILIATION.csv` and `GIT-HISTORY-FINDINGS.md` for the independent reproduction).
