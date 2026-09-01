# Phase 7X -- Content Alignment & Breakpoint-Claim Reconciliation -- Status Report

## Baseline

HEAD verified at `13971e3` (Phase 7W, `origin/main`). Working tree clean at phase start. Full detail in `BASELINE.md`.

## Content discovery

23 files read and classified in full sentence/section context (14 corrected, 9 confirmed clean on inspection), across `guides/`, `academy/`, `entities/`, `calculators/`, `formulas/`, `reference/`, `programmatic/shock/`, `programmatic/chlorine/`, and 11 `scripts/data/*.js` files swept sitewide. 16 candidate passages evaluated. Full detail in `CONTENT-AUDIT.md`, `DECISION-MATRIX.csv`.

## Classification results

- Category A/E (correct / out of scope, no action): 7 files, 14 files/passages total when including the sitewide sweep set.
- Category C (misleading calculator association): 3 passages -- `free-chlorine-vs-total-chlorine.html`, `glossary/breakpoint-dose.html`, `reference/combined-chlorine-explained.html`.
- Category D (factual error): 8 passages across `programmatic/shock/*.html`, both `academy/sanitizers/*` worked examples plus one Step instruction, `academy/troubleshooting/strong-chlorine-smell.html` (2 findings, including the phase's most severe -- an explicit false description of the calculator's internal formula), `reference/emergency-recovery.html`, and `reference/shock-dosage-matrix.html` (a previously-undiscovered internal arithmetic inconsistency in the table itself).
- Category F (requires expert review): 0.
- Chemistry claims found demonstrably wrong: 0 -- `chemistry-claims.js`/`chemistry-ranges.js`/`dataset-dosage-matrices.js` unmodified.

## Corrections made

11 distinct problem passages corrected across 7 source files, rendering to 14 output pages. Three worked-example dosage figures independently verified wrong and corrected using the already-approved 0.013344 mass-balance constant (4.5 lb -> 1.54 lb; 3.5 lb -> 1.54 lb; 8 lb -> 3.34 lb). One reference table (`shock-dosage-matrix.html`) fully recomputed after discovering its "Maintenance" and "Breakpoint CC 1 ppm" columns represented the same target but showed different values. Full before/after/reason/evidence/risk/validation log in `PRODUCTION-CHANGES.md`.

## Files changed

**7 source files:** `scripts/generate-authority-guides.js`, `scripts/generators/generate-shock-pages.js`, `scripts/data/academy-sanitizers.js`, `scripts/data/academy-troubleshooting.js`, `scripts/data/glossary-terms.js`, `scripts/data/reference-pages.js`, `reference/combined-chlorine-explained.html` (direct edit, confirmed hand-authored/static).
**3 regenerated data files:** `data/academy.json`, `data/glossary.json`, `data/reference.json`.
**14 regenerated output pages:** `guides/chlorine/free-chlorine-vs-total-chlorine.html`; 6 `programmatic/shock/*.html` pages + `programmatic/shock/index.html` (a direct, legitimate cross-link-title catch-up from regenerating the edited generator); `academy/sanitizers/breakpoint-chlorination.html`, `academy/sanitizers/shock-treatments-explained.html`; `academy/troubleshooting/strong-chlorine-smell.html`; `glossary/breakpoint-dose.html`; `reference/emergency-recovery.html`, `reference/shock-dosage-matrix.html`.
**2 new scripts:** `scripts/validate-phase-7x.js`, `scripts/test-phase-7x.js`.
**1 report set:** `reports/phase-7x/` (this file plus 5 others).

## Unrelated pre-existing issue discovered and explicitly not absorbed

Regenerating `data/academy.json` (required for this phase's own edits) exposed that the committed JSON had been stale relative to its own true source (`scripts/data/academy-fundamentals.js`) for some time: two articles and two citation/resource links existed in the committed output but no longer exist in the source file. This is entirely unrelated to breakpoint claims and was **not investigated or resolved** -- `data/academy.json` was rebuilt surgically (reset to committed baseline, then only this phase's 5 intended body-text edits applied via exact string match) to avoid an unauthorized, out-of-scope content deletion as a side effect of the required regeneration. Full detail and recommendation in `REVIEW-QUEUE.md`.

## Validator/test results

`validate-phase-7x.js`: PASS -- 0 errors, 0 warnings (450 pages scanned, 14 corrected pages confirmed, 45 legitimate breakpoint-education mentions left untouched, 0 sitewide findings). `test-phase-7x.js`: 21/21 PASS (categories A-L plus 2 regression checks).

## Regression sweep

`npm run build`: PASS (run multiple times; the same pre-existing sitewide template/injector drift documented since Phase 7S resurfaced each time and was reverted via the established full-build-then-selective-revert discipline). `validate-phase-7w.js`/`test-phase-7w.js`, `validate-phase-7v.js`/`test-phase-7v.js`, `validate-phase-7u.js`: all **FAIL as expected** -- the standard, documented stale-self-referential-baseline pattern identical in kind to every prior phase transition (each earlier phase's validator checks its own `PRODUCTION-CHANGES.md`/scope rules against the current tree; every flagged item is a file this phase was explicitly authorized to change; confirmed no unexpected item flagged). Prior validators `validate-phase-7h.js`, `validate-phase-7k.js`, `validate-phase-7o.js`, `validate-phase-7i.js`: all PASS clean. `validate-phase-7m.js`, `validate-phase-7n.js`: **initially FAILed** on the unrelated pre-existing `academy.json` desync described above (surfaced only by the required regeneration, not caused by any Phase 7X edit) -- both **PASS clean** after the surgical JSON rebuild preserved the orphaned content. `validate-provenance-resolution.js`, `validate-provenance.js`, `validate-datasets.js`, `validate-schema.js`, `validate-schema-content-consistency.js`, `validate-trust.js`, `validate-trust-layer.js`, `validate-url-indexation.js`, `check-broken-links.js`: all PASS clean (0 broken links / 526 pages). Accessibility: score 100, unchanged, 0 critical.

## Forensic re-audit

Snapshot-then-restore against `reports/phase-7a/` (Phase 7W baseline). P0/P1/P2/P3: 0/26/73/426, **unchanged**. Schema VALID count: 951, **unchanged**. Broken links: 0, **unchanged**. Duplicate-title groups: 3, **unchanged**. Orphan pages: 7, **unchanged**. Cannibalization pairs: 125, **unchanged**. Citation/source-audit figures (400/416 pages with zero external citations): **unchanged**. AdSense readiness: 359/113/53, **unchanged** (identical to Phase 7W's post-fix state -- this phase's edits were wording-level and did not shift readiness classification). Report restored to its exact committed state afterward. No unexplained drift found.

## Reproducibility

`generate-academy.js`, `generate-glossary.js`, `generate-reference.js` each run twice against the corrected JSON sources; all 7 affected output pages and 3 data files byte-identical (verified via `shasum`) across both runs. No new nondeterminism. (Each isolated-generator run's collateral effect -- missing injector layer on unrelated pages -- was caught and corrected via a full `npm run build` plus selective revert, the same established pattern from every prior phase, not treated as nondeterminism.)

## Scope control

No calculator formula/JS changes (`js/calc-utils.js`, `js/calculator.js` confirmed unchanged via `git diff --stat`). No product-selector/preset changes -- Phase 7W's 6/4-product architecture, presets, and the approved 0.013344 constant fully intact (confirmed via `test-phase-7x.js` categories J/K/L). No breakpoint calculator built. No dosage/divisor invented -- every corrected figure uses the already-approved constant; `generate-shock-pages.js`'s `shockOz()` generic formula and `calculateChlorine`'s separate, pre-existing `REQUIRES_EXPERT_REVIEW` divisor branch both confirmed untouched. No `chemistry-claims.js`/`chemistry-ranges.js`/`dataset-dosage-matrices.js` changes (confirmed via `git diff --stat`) -- no canonical claim was found demonstrably wrong. No programmatic-family architecture change -- only the named, narrowly-bounded wording fix to `programmatic/shock/*` content (Priority B), explicitly authorized. No URL, redirect, sitemap, Spanish, French, or AdSense changes (confirmed via `git diff --stat`). No fake authority or fabricated citations -- the green-algae 30 ppm figure's sourcing was verified, not altered.

## Remaining review queue

Carried forward: the pre-existing `academy.json`/`academy-fundamentals.js` desync (2 orphaned articles, 2 dropped citation/resource links -- not resolved, preserved as-is); a decision on whether `populate-data.js` should run automatically as part of the build pipeline; a general precision audit of reference-table unit-conversion footnotes; the standing generic-divisor `REQUIRES_EXPERT_REVIEW` classification; a genuine breakpoint-chlorination calculator as a future dedicated tool (Phase 7T/7U Option F); the sitewide template/injector drift infrastructure decision. Full detail: `REVIEW-QUEUE.md`.

## Phase 7Y recommendation

A dedicated phase to investigate and reconcile the newly-discovered `academy.json`/`academy-fundamentals.js` source/output desync (and check whether the same class of drift exists in other `scripts/data/*.js` families beyond academy) should be considered before further content-generation phases, since further un-audited `populate-data.js` runs could surface -- or silently absorb -- the same pattern elsewhere.

DO NOT COMMIT. DO NOT PUSH. DO NOT BEGIN PHASE 7Y.

END PHASE 7X
