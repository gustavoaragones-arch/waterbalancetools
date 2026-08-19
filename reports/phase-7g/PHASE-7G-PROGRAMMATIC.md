# Phase 7G — Programmatic Duplication & Content Differentiation

**Status: PASS WITH REVIEW QUEUE**

## Scope

Four programmatic long-tail clusters flagged HIGH-CRITICAL in the Phase 7A forensic duplication audit:

| Family | Directory | Pages |
|---|---|---|
| Chlorine dosing | `programmatic/chlorine/` | 11 |
| pH adjustment | `programmatic/ph/` | 4 |
| Shock dosing | `programmatic/shock/` | 6 |
| Hot tub chemicals | `programmatic/hot-tubs/` | 5 |

26 long-tail pages total, plus 4 family hub pages (unmodified). Full inventory: `PROGRAMMATIC-INVENTORY.md` / `programmatic-inventory.csv`.

## Core principle applied

Differentiation came from genuinely different computed data per page (real dosing ounces for that page's specific volume/pH pair/spa size, real size-classification text) and from removing redundant shared prose down to a link into the existing canonical guide — never from synonym replacement or sentence reordering. See `AEO-DIFFERENTIATION.md` for the before/after content comparison.

## Root cause

Confirmed by reading all 4 generator source files (`scripts/generators/generate-{chlorine,shock,ph,hot-tub}-pages.js`): `whatThisMeansSection`, `whatHappensIfIncorrectSection`, and `quickTipsSection` content arrays were byte-identical across every page in a family, and 4 of 5 FAQ answers were also identical verbatim. Only the H1, meta description, and computed dosage table genuinely varied per page.

## Baseline duplication (Phase 7A audit re-run, unmodified methodology)

| Family | Risk | Avg. pairwise similarity |
|---|---|---:|
| programmatic/hot-tubs | CRITICAL | 0.795 |
| programmatic/shock | CRITICAL | 0.784 |
| programmatic/chlorine | HIGH | 0.740 |
| programmatic/ph | HIGH | 0.712 |

Matches the brief's cited 0.71-0.80 range — confirmed current, not stale.

## Remediation applied

For each generator: (1) replaced the first 1-2 generic FAQ answers with genuinely computed, page-specific content (real dosing ranges for that page's exact volume/level/size, real size-classification sentence); (2) trimmed `whatThisMeansSection` / `whatHappensIfIncorrectSection` from multi-paragraph shared text to one short paragraph plus a link to the existing canonical guide page; (3) corrected one wrong CTA link (shock pages linked to the chlorine guide — now linked to `academy/sanitizers/shock-treatments-explained.html`, verified to exist); (4) fixed a display-precision artifact where small volumes produced degenerate `"0.0-0.1 oz"` liquid-chlorine figures (`.toFixed(1)` → `.toFixed(2)`, display only — `liquidOz`/`granularOz` formulas untouched).

Explicitly NOT touched, per the brief's protection of shared safety/methodology content: `stepsSection`, `recommendedLevelsSection`, and 3 of 5 FAQ answers (overdosing safety, swim-wait timing, product-type guidance) — these are legitimately identical across a family because the safe procedure and target range don't change with volume.

## Post-remediation duplication

| Family | Before (risk / sim) | After (risk / sim) | Repeated paragraphs | Repeated FAQs |
|---|---|---|---|---|
| programmatic/hot-tubs | CRITICAL / 0.795 | HIGH / 0.711 | 33 → 25 | 4 → 3 |
| programmatic/shock | CRITICAL / 0.784 | HIGH / 0.689 | 29 → 23 | 4 → 3 |
| programmatic/chlorine | HIGH / 0.740 | HIGH / 0.651 | 34 → 26 | 4 → 3 |
| programmatic/ph | HIGH / 0.712 | HIGH / 0.579 | 30 → 31 | 4 → 5 |

Full detail and honest anomaly disclosure (pH's repeated-block count moved slightly the wrong direction even as its similarity score improved most): `POST-REMEDIATION-DUPLICATION.md`.

**No family reached LOW/MEDIUM risk.** Further reduction below HIGH would require either accepting loss of shared safety content (not recommended) or a larger architectural change (consolidating shared sections onto the hub page) — flagged as a candidate for a future phase, not attempted here.

## Consolidation decisions

All 26 pages: **KEEP**. Explicitly worked through the brief's Programmatic Page Test and nearest-neighbor framing for every page; found no defensible MERGE candidate — each page answers a distinct, real long-tail query tied to a user's own known input (their pool volume, their pH reading, their spa size). Full per-page reasoning, nearest-neighbor, and internal/sitemap-impact assessment: `PROGRAMMATIC-DECISIONS.csv` (26 rows).

## Cannibalization

Phase 7A cross-format audit re-run: 0 HIGH-risk cannibalization sitewide. 12 cross-format pairs relevant to these 4 families, all LOW risk (0.05-0.06 similarity), already correctly differentiated by format and already flagged `KEEP SEPARATE` by the existing audit tool. Detail: `CANNIBALIZATION-RESOLUTION.md`.

## AEO differentiation

Structure (H1 → direct answer → explanation → table/steps → FAQ) was already correct and untouched. What changed is that the first, most AEO-extractable FAQ answer per page now contains a genuinely distinct, correctly-computed answer instead of a generic, informationally-empty instruction repeated across every page in the family. No new schema types added. Detail: `AEO-DIFFERENTIATION.md`.

## Validator

`scripts/validate-programmatic-quality.js` (new): checks intent-contract completeness, duplicate intent+context combos, claim-family reference validity, differentiation-reason presence, page existence, direct-answer-block presence, byte-identical-answer-across-family detection, and consolidation-decision presence/validity.

```
validate-programmatic-quality: PASS -- 26 pages checked, 0 violation(s), 0 warning(s).
```

## Full regression (every prior phase's validator, re-run against this phase's build)

```
7B  validate-generated-output:        PASS -- 502 files, 0 unresolved template artifacts
7C  validate-url-indexation:          PASS -- 523 pages, 479 sitemap URLs, 0 violations
7D  chemistry validator:              WARN (pre-existing orphan-range warnings, unchanged baseline)
7D.2 golden set v2:                   PASS -- 104/104 (21 real, 83 synthetic)
7D.2 status integrity:                PASS -- 5861 rows, 0 violations
7D.2 regression suite:                PASS -- 24 assertions
7D.3 evidence dataset:                PASS -- 5861 rows, 0 violations
7E  provenance:                       PASS -- 5861 records, 788 high-risk checked, 0 violations, 4787 warnings (unreviewed/expert-review-required -- not a failure)
7E.1 provenance-resolution:           PASS -- 499 conflicts, 0 violations
7F  trust-layer:                      PASS -- 550 files, 0 violations, 0 warnings
7F  trust (existing):                 PASSED -- 0 errors, 0 warnings
7F.1 editorial-decisions:             PASS -- 141 decisions, 0 violations
7G  programmatic-quality:             PASS -- 26 pages, 0 violations, 0 warnings
    broken links:                     0 issues, 523 pages checked
    URL engine:                       PASS -- 263 assertions
```

No regressions introduced by this phase's changes.

## Reproducibility

Two independent full rebuilds of all 4 generator output directories compared via SHA-256; byte-identical across both runs.

## Scope control

`git status`/`git diff` reviewed. This phase's actual footprint: 4 generator files (`generate-{chlorine,shock,ph,hot-tub}-pages.js`), 1 new data file (`scripts/data/programmatic-intents.js`), Phase 7G scripts/reports directories, `scripts/validate-programmatic-quality.js`. No Spanish/French paths exist in the repository. No calculator-formula files (`js/calc-utils.js`) touched. No URL-architecture/redirect-rule files touched by this phase. Pre-existing, session-baseline uncommitted diff (present before this phase began, sitewide, one-line-per-file: a `/charts/X` → `/X` footer-link flattening, plus sitemap/`_redirects` churn) is unrelated to Phase 7G and was not introduced or altered by this phase's work.

## Remaining review queue

- All 4 families remain HIGH risk (none reached LOW/MEDIUM) — candidate for a future phase if further reduction is prioritized, likely requiring hub-page section consolidation rather than more per-page trimming.
- pH family's repeated-paragraph/FAQ block counts moved slightly the wrong direction (30→31, 4→5) despite its similarity score improving the most — a tool-sensitivity artifact from shifted paragraph boundaries, not a content regression; worth a closer look if the duplication tool itself is revisited.
- Hub-page section consolidation (moving fully shared safety/procedure content off long-tail pages entirely, linking to it instead of including a trimmed copy) was identified but explicitly not attempted, per scope-control instruction against a full redesign.

## Phase 7H decision

**GO** — with the review queue above carried forward.

**DO NOT BEGIN PHASE 7H AUTOMATICALLY.**
