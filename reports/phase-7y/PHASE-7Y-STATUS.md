# Phase 7Y -- Source/Data Pipeline Integrity & Academy Desynchronization Audit -- Status Report

## Baseline

HEAD verified at `e959f8d` (Phase 7X), matching `origin/main`. Working tree clean at phase start, no pre-existing uncommitted paths. Full detail: `BASELINE.md`.

## Central finding

The academy desync discovered in Phase 7X is **real, precisely bounded, and root-caused**: `fund-07` and `fund-08` (2 of 50 records in `data/academy.json`) have no backing in `scripts/data/academy-fundamentals.js`. Git history traces the exact origin -- both were added directly to `data/academy.json` in Phase 7M (`a6e7881`) and Phase 7P (`2a3a682`), each time correctly following `populate-data.js`'s own header comment, which has stated since Phase 5A (`4fb65ce`, never revised) that the JSON files "are the permanent source of truth" and instructs editors to modify them directly -- a direct contradiction of the script's actual behavior, which unconditionally overwrites those files from the `scripts/data/*.js` source files on every run. This is **not** evidence of any phase's error; it is evidence of a foundational, self-contradictory architecture. Phase 7Q partially patched a symptom (an id collision) without addressing the root cause.

## Is it isolated to academy, or broader?

**Isolated to academy**, with an important caveat. Formulas, glossary, and reference share the *identical architectural exposure* (same `populate-data.js` dual-entry-point pattern, same contradictory documentation) but are **currently clean** -- verified via direct source-vs-JSON comparison (9/9, 100/100, 25/25 records match exactly, 0 orphans in either direction). Every other family investigated (entities, datasets, trust, chemistry evidence, all 7 programmatic clusters, authority guides) uses a structurally different, single-source, fully-automatic pipeline with no manual/optional intermediate step and was confirmed clean. One unrelated, low-risk finding was made along the way: 3 completely dead legacy JSON files (`chlorine-dosage.json`, `ph-adjustment.json`, `shock-dosage.json`) with zero live readers, containing formula descriptions that contradict the current, approved calculators.

## Academy disposition (evidence only, no decision made)

Both `fund-07` and `fund-08` are live, indexed, linked, sitemap-listed pages with materially distinct content and no duplicate source elsewhere. Both were added following the architecture's own (contradictory) documented instructions. Both are classified `PRESERVE_PENDING_DECISION` -- restoring to source, retiring the output, or reconstructing differently are all left to a future, separately-authorized decision, per Section 10. Full evidence: `REVIEW-QUEUE.md` Section C.

## Is `populate-data.js` safe for automatic build use?

**No, not as currently written.** It would immediately delete `fund-07`/`fund-08` (confirmed via an isolated, non-destructive re-run: 48 records instead of the current 50) and is fully deterministic but blind to any direct JSON edit. Safe to keep as a manual, occasional tool only once its documentation contradiction is resolved and, ideally, a consistency gate exists. Full detail: `POPULATE-DATA-AUDIT.md`.

## Is the build order safe?

Mostly, with one known, pre-existing, unrelated issue: `generate-hubs.js` runs before `generate-navigation.js` in `run-all-generators.js` (documented since Phase 7V), requiring 2 build passes to converge navigation-dependent hub content. `populate-data.js` is confirmed **not** part of `npm run build` at all. Full pipeline map: `BUILD-PIPELINE.md`.

## Is the sitewide template drift related to the academy desync?

**No -- confirmed independent (Classification C).** A single clean `npm run build`, with `populate-data.js` never invoked, touched 241 files dominated by `entities/` (105) and `calculators/` (15) -- families structurally unrelated to academy's dual-entry-point defect. Root mechanism: `generate-entity-pages.js` runs twice in the pipeline with imperfect injector idempotency across the gap (a partially root-caused, not-yet-fixed nondeterminism Phase 7Q already flagged). Not fixed this phase, per Section 14. Repository fully restored (`git checkout HEAD -- .`) immediately after the isolating experiment; verified clean and at `e959f8d`.

## Production changes

**Zero.** Every artifact this phase produced is a new audit report or script; no existing production file was modified. `populate-data.js` was read in full but not touched. Full detail: `PRODUCTION-CHANGES.md`.

## Validator/test results

`validate-phase-7y.js`: PASS -- 0 errors, 0 warnings (re-run after all artifacts were in place). `test-phase-7y.js`: see result below.

## Reproducibility

`populate-data.js` confirmed deterministic via 2 runs in an isolated temp directory (byte-identical output, both runs producing 48/9/100/25 records) -- production repository never touched by this experiment. The build-drift isolation experiment was reverted, not re-run, per Section 9/17's isolation and no-broad-regeneration rules; a second run would not be expected to be byte-identical regardless, since Phase 7Q already documented a genuine nondeterminism component in that unrelated defect. Full detail: `REPRODUCIBILITY.md`.

## Review queue

7 categories (A-G) fully populated, no item marked resolved merely for having been investigated. Highlights: 2 confirmed architectural defects requiring a decision (academy desync + its enabling documentation contradiction), 3 record-integrity findings in the academy family (one a correction to Phase 7X's own review queue, one newly discovered by this phase's own audit methodology), 8 future governance recommendations. Full detail: `REVIEW-QUEUE.md`.

## Final status

**PASS WITH REVIEW QUEUE.**

Not PASS: a confirmed, unresolved architectural defect remains (the `populate-data.js` dual-entry-point contradiction, and the 2 orphaned academy records it produced) -- Section 21 explicitly prohibits forcing PASS merely because the audit scripts pass, and this audit's own central finding is exactly that defect.

Not FAIL: source-of-truth WAS successfully established for every family investigated (see `SOURCE-OF-TRUTH-MATRIX.csv` -- every family received a definite classification, A through E, with evidence; none was left truly unclassifiable), the audit is complete against its full required scope (all 23 sections addressed, all 17 required report artifacts produced), and no critical production family's source of truth is unknowable -- it is precisely known (and precisely why it is a problem).

## Phase 7Z recommendation

A decision-and-remediation phase, explicitly scoped to: (1) fix `populate-data.js`'s header comment to state a single, non-contradictory source-of-truth tier for academy/formulas/glossary/reference; (2) decide `fund-07`/`fund-08`'s disposition using the evidence in `REVIEW-QUEUE.md` Section C and execute it; (3) consider adding a source-vs-JSON consistency check (at minimum a validator, not necessarily a build-blocking gate) for the 4 `populate-data.js` families; (4) fix the 2 minor pre-existing record-integrity items (`san-03`'s extra citation, `ts-01`'s extra resource link) and the 1 newly-discovered Phase-7X-introduced typo (`ts-04`'s em-dash/hyphen inconsistency) once item 1 establishes which tier is authoritative. Items not recommended for Phase 7Z: the sitewide template/injector drift and the navigation-ordering bug (both independent, already-documented, lower urgency); the 3 orphaned legacy dosage JSON files (zero live risk, pure hygiene).

DO NOT COMMIT. DO NOT PUSH. DO NOT BEGIN PHASE 7Z.

END PHASE 7Y
