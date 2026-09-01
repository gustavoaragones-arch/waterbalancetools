# Phase 7Y -- Reproducibility

No broad destructive regeneration was performed against the production repository at any point in this phase. `git status --porcelain` and `git rev-parse HEAD` were checked immediately before and after every experiment that touched the filesystem; the repository returned to a byte-identical, clean `e959f8d` state each time.

## `populate-data.js` (academy/formulas/glossary/reference) -- isolated, dynamic

Run entirely outside the production repository (in the session scratchpad, a copy of `scripts/populate-data.js` + `scripts/data/`):
- Run 1: `academy.json (48 items)`, `formulas.json (9 items)`, `glossary.json (100 items)`, `reference.json (25 items)`.
- Run 2 (same isolated location): identical counts; `diff` against Run 1's output files for all 4 files returned no differences.
- **Deterministic, confirmed.** See `POPULATE-DATA-AUDIT.md` for full detail.
- This also independently confirms the magnitude of the fund-07/fund-08 risk: an isolated run against the current source files produces 48 academy records, 2 fewer than the 50 currently committed in `data/academy.json`.

## Full `npm run build` -- production repository, single pass, immediately reverted

Run once against the clean, committed HEAD (no `populate-data.js` involved). Result: 241 files changed (`git status --porcelain` count), spanning `entities/` (105), `calculators/` (15), `reports/` (13), `reference/` (11), various `guides/` subdirectories, `audit/google/`, `maintenance/`, `charts/`, `releases/`, `printables/`, `legal/`, `comparisons/`, `templates/`, `qa/`, `data/`, `sitemap.xml`. This was the experiment used to answer Section 14 (sitewide drift vs. academy desync -- confirmed independent). The repository was restored via `git checkout HEAD -- .` immediately afterward; `git status --porcelain` returned empty and `git rev-parse HEAD` returned `e959f8d...`, matching the pre-experiment state exactly.

This experiment was **not** run a second time to check its own reproducibility (i.e., whether a second clean build produces the identical 241-file diff) -- doing so would have required a second full build-and-revert cycle whose sole purpose would be characterizing the sitewide drift itself, which Section 14 explicitly scopes out of this phase ("do not fix it unless it is conclusively part of the same defect" -- already established as independent without needing this additional run). Phase 7Q's own prior root-cause note (cited in `BUILD-PIPELINE.md`) already documents that this drift includes a genuine nondeterminism component (a footer-whitespace baseline difference from `generate-entity-pages.js`'s two-pass rendering), so a second run would likely NOT be byte-identical to the first even in file-list terms -- this is a known, separate, already-flagged issue, not newly investigated here.

## Single-source families (entities, datasets, trust, chemistry, programmatic clusters, authority guides)

**Not independently re-run and hash-compared this phase.** Their `CLEAN`/Classification-A status in `SOURCE-OF-TRUTH-MATRIX.csv` and `GLOBAL-DRIFT-AUDIT.csv` rests on: (a) direct code inspection confirming each has a single, automatic, always-in-`run-all-generators.js` generation path with no manual/optional intermediate step comparable to `populate-data.js`, and (b) a point-in-time content comparison (source-file record count and duplicate-id check against the currently-committed compiled output), not a fresh two-run determinism test. This is a **narrower reproducibility claim** than the one made for the `populate-data.js` families, and is stated as such rather than overstated: the architectural evidence (single automatic pipeline, no dual-entry-point) is strong enough to support the Classification A/CLEAN dispositions without a redundant regeneration experiment, since the defect class this phase investigates (a *documented, contradictory* dual-entry-point) does not exist for these families in the first place. Re-running `generate-entities.js`/`generate-datasets.js`/`generate-trust.js` in isolation to double-check their determinism is a reasonable follow-up for a future phase but was judged unnecessary to reach this phase's required conclusions, given the no-broad-regeneration rule (Section 9) and the absence of any evidence suggesting these families carry the same risk.

## Why no in-place production regeneration was performed

Per Section 9's explicit rule, no attempt was made to "fix" the academy desync (or characterize its exact regenerated shape) by running `populate-data.js` against the production repository and accepting the resulting deletions. Every dynamic experiment in this phase either ran in total isolation (the `populate-data.js` copy) or was immediately and verifiably reverted (the single `npm run build` pass).
