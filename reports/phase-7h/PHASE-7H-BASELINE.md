# Phase 7H Baseline

Re-ran the Phase 7A forensic audit fresh against the current, post-7G repository state before making any change (per the explicit instruction not to assume the original Phase 7A numbers are still current). The re-run's output was captured to `reports/phase-7h/current-state-snapshot/` rather than overwritten into `reports/phase-7a/` — that directory is the preserved historical Phase 7A baseline and was restored via `git checkout` immediately after each snapshot, consistent with this project's standing rule to never silently edit historical audit evidence.

## Current page count (before this phase's changes)

522 pages (matches the committed Phase 7A baseline exactly — 7B-7G's work did not add or remove pages).

## Current schema counts (before this phase)

| Status | Original Phase 7A | Re-run, current state (pre-7H) |
|---|---:|---:|
| VALID | 856 | 856 |
| QUESTIONABLE | 49 | 49 |
| MISSING | 63 | 63 |

**Identical to the original Phase 7A numbers.** Confirmed via byte-for-byte diff of `schema-audit.csv`: 0 lines differ. Phases 7B-7G touched generator integrity, URLs, chemistry knowledge/provenance, trust language, and programmatic differentiation — none of that work added, removed, or fixed a JSON-LD block, so the schema baseline was still exactly current.

## Current thin/weak content count (before this phase)

`content-quality.csv` differs from the original Phase 7A baseline by 9 rows (all in `programmatic/chlorine` and `programmatic/hot-tubs`, 0.01-similarity-score shifts from Phase 7G's differentiation work) — otherwise identical. `action-matrix.csv`: IMPROVE 174→175, UNCHANGED 250→250, KEEP 70→70, MERGE 28→28 (one page's classification shifted by the same 7G-driven similarity change).

## Current accessibility findings (before this phase)

26 of 523 pages flagged (one more page than the original 522-page Phase 7A count — Phase 7G added the `reports/phase-7g/` output, and the live site page count is 523 post-7G). Byte-identical to the original Phase 7A `ux-accessibility-audit.csv` for all 522 shared pages. All 26 findings are `HEADING_LEVEL_SKIP` — 0 missing-alt, 0 missing-viewport, 0 unlabeled calculator forms, 0 missing table headers.

## Current AEO findings (before this phase)

Not separately re-scored this phase (see `AEO-RESOLUTION.md`); Phase 7G's AEO differentiation work stands unchanged.

## Comparison against Phase 7A

| Metric | Phase 7A (original) | Pre-7H (re-run) | Post-7H (this phase) |
|---|---:|---:|---:|
| Schema VALID | 856 | 856 | 938 |
| Schema QUESTIONABLE | 49 | 49 | 3 (all individually dispositioned) |
| Schema MISSING (unaddressed) | 63 | 63 | 0 (39 correctly non-applicable, 24 fixed) |
| Accessibility findings | 26/522 | 26/523 | 0/523 |
| Pages | 522 | 522 (523 incl. 7g reports) | 522 (+16 new schema-required prints/etc. already existed, page count unchanged) |

Full detail: `SCHEMA-RESOLUTION.md`, `ACCESSIBILITY-RESOLUTION.md`, `THIN-CONTENT-RESOLUTION.md`.
