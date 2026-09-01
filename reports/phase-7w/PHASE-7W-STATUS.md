# Phase 7W -- Shock Product-Selector Implementation -- Status Report

## Baseline

HEAD verified at `cd91013` (Phase 7V). Working tree clean. `npm run build` run; the same pre-existing, sitewide latent template/injector drift documented since Phase 7S resurfaced and was reverted before any Phase 7W work began. `validate-phase-7v.js`/`test-phase-7v.js` confirmed clean beforehand. Full internal shock data-contract audit (Section 3, items A-H) in `BASELINE.md`.

## Product Inventory

6 chlorine-relevant, already-cross-validated records in `scripts/data/dataset-dosage-matrices.js`: Liquid Chlorine (10%/12.5%), Calcium Hypochlorite (65%/73%), Sodium Dichlor (56%), Trichlor Tablets (90%). No new coefficient was invented; all 6 activePercent values and cross-validation citations were already present (Phase 7S/7T/7U). Hot tub selector narrowed to 4 products, directly traceable to the dataset's own `supportedPoolTypes` field (dichlor/trichlor list only `residential-pool`/`outdoor-pool`).

## Selector Implementation

`pool-shock-calculator.html`: 6 products + "I don't know my product." `hot-tub-shock-calculator.html`: 4 products + fallback. `chemical-calculator.html`: its single "Granular shock" option replaced with 3 named products (trichlor already covered by the existing "tablets" option). No vague "Shock"/"Granular" option remains as a calculation path.

## Calculation Architecture

`js/calc-utils.js`'s `calculateShockByProduct` and `js/calculator.js`'s `granularChlorineOuncesForProduct` both compute `oz = targetPpm × gallons × 0.013344 ÷ activePercent` -- the exact constant already approved for `formula-02` (Phase 7S) and `formula-03` (Phase 7T), applied per-product rather than a new derivation. The old generic `calculateShock`/`granularShockOunces` functions (dividing by `10000`) were **removed entirely** from both files, not left as unused dead code. Verified: `calculateShockByProduct(20000, 4, 'calcium-hypochlorite-65pct')` → 16.42 oz, exactly matching `formula-03`'s existing worked example.

## Product-Specific Safety

Mixing-hazard warnings (calcium hypochlorite ↔ trichlor) surfaced directly in calculator output, sourced from the already-registered `claim-trichlor-calhypo-mixing-hazard` (Phase 7K) and the dataset's own `notes` fields. No safety language was invented; no product-specific warning was broadened into a universal claim.

## Formula-03

Equation, constant, and worked example **not reopened** (Phase 7T `RESOLVED` stands). Explanation extended to state the formula is now directly implemented and to explicitly disclose what remains unimplemented (breakpoint dosing, a generic/unspecified-product number). Limitations extended with the mixing-hazard note.

## Trust / Provenance

`trust-calculator-metadata.js`: shock calculator entries rewritten to describe the product-specific mechanism; `combined-chlorine` removed from `entityDependencies` (never read, corrected not newly limited). A **previously-undiscovered stale record** in the separate `trust-formulas.js` registry (`formula-shock-dose`, describing a breakpoint formula the calculator never implemented) was found during consumer inspection and corrected. No new chemistry source or claim record created -- all evidence reused from Phase 7S/7T/7U/7K.

## Consumer Audit

All 3 live consumers of the shock functions found and updated to the same contract (`pool-shock-calculator.html`, `hot-tub-shock-calculator.html`, `chemical-calculator.html`). Confirmed via targeted grep that no other page calls the removed functions.

## Production Changes

8 files hand-edited (2 JS engine files, 3 calculator HTML pages, `formula-03`, 2 trust-metadata registries); 4 generated files regenerated to match. Full before/after/reason/evidence/risk/validation log in `PRODUCTION-CHANGES.md`. One genuine regression (a title-length violation introduced by this phase's own copy change on `hot-tub-shock-calculator.html`) was caught by `validate-phase-7i.js` during the regression sweep and fixed before finalizing.

## Validators

`validate-phase-7w.js`: PASS, 0 errors, 0 warnings. `test-phase-7w.js`: 21/21 PASS (categories A-S).

## Regression

`npm run build`: PASS. `validate-phase-7v.js`/`test-phase-7v.js` and `validate-phase-7u.js`/`test-phase-7u.js`: FAIL -- **expected, documented stale-baseline pattern**, identical in kind to every prior phase transition (every flagged file/function is one this phase was explicitly authorized to change; confirmed no unexpected item). Prior validators 7H/7K/7M/7N/7O: all PASS. `validate-phase-7i.js`: **initially FAILed with a genuine regression** (title too long on `hot-tub-shock-calculator.html`, 68 chars) -- identified as caused by this phase, fixed (57 chars), re-run clean. All 3 provenance validators, `validate-datasets.js`, `validate-schema.js`, `validate-schema-content-consistency.js`: PASS clean. `validate-trust.js`: PASS, **0 warnings** (the pre-existing "formulas/shock-formula.html missing version badge" warning documented in Phase 7T/7U/7V is resolved as a side effect of this phase's `formula-03` content update). `validate-trust-layer.js`: PASS clean. `check-broken-links.js`: PASS, 0/526. Accessibility: score 100, unchanged. Forensic audit (snapshot-then-restore): P0 unchanged at 0; action/priority counts identical to the Phase 7V baseline; AdSense-readiness counts shifted slightly (361→359 ready, 111→113 review) and duplicate-title groups remained at 3, both consistent with the real content changes on 5 pages; report restored to its exact `cd91013` committed state afterward.

## Reproducibility

`generate-trust.js` and the `data/formulas.json` regeneration step each run twice; `data/formulas.json`, `data/trust/datasets.json`, and `data/trust/formulas.json` byte-identical across both runs. No new nondeterminism. (Each isolated-generator run's collateral effect -- missing injector layer on unrelated pages -- was caught and corrected via a full `npm run build`, the same established pattern from every prior phase, not treated as nondeterminism.)

## Forensic Re-Audit

P0/P1/P2/P3: 0/26/73/426, unchanged from Phase 7V baseline. Schema VALID count: 951, unchanged. Broken links: 0, unchanged. Duplicate-title groups: 3, unchanged (the title-length fix avoided creating a new collision). Orphan pages: 7, unchanged. Cannibalization pairs: 125, unchanged. Citation/source-audit figures (400/416 pages with zero external citations): unchanged. AdSense readiness: 359/113/53 (was 361/111/53) -- a small, explained shift from real content growth on 5 substantially-rewritten pages. Trust warnings: the pre-existing `formulas/shock-formula.html` version-badge warning is now resolved (0 trust warnings, was 1). No unexplained drift found.

## Scope Control

No Spanish/French, AdSense, URL, redirect, or sitemap changes (`REDIRECT_SOURCES` unchanged at 6; confirmed via diff). No programmatic-family changes (`git diff --stat` against `programmatic/` returns empty). No chlorine (liquid/tablets paths), alkalinity, CYA, salt, volume, turnover, or pH calculator changed (confirmed via diff and the Phase 7W test suite's explicit per-file check). No client-side framework introduced. No LSI or bromine calculator built. No new unsupported chemistry claim introduced -- confirmed via `git diff` showing zero changes to `chemistry-claims.js`/`chemistry-ranges.js`/`chemistry-sources.js`. No breakpoint-chlorination calculator implied or implemented. Two pre-existing, independently-discovered content mismatches (one guide page, several `programmatic/shock/*` pages implying the calculator computes a breakpoint dose -- it never has) were found and explicitly not touched, per the same discipline established in Phase 7V for an analogous discovery.

## Remaining Review Queue

Carried forward without attempting to solve: `guides/chlorine/free-chlorine-vs-total-chlorine.html`'s breakpoint/calculator conflation; similar language on several `programmatic/shock/*` pages; the generic/unspecified-product shock divisor (remains `REQUIRES_EXPERT_REVIEW`, "I don't know" path gives qualitative guidance only); a genuine breakpoint-chlorination calculator as a distinct future tool (Phase 7T/7U Option F); the sitewide template/injector drift infrastructure decision. Full detail: `REVIEW-QUEUE.md`.

## Phase 7X Decision

GO (PASS)

DO NOT BEGIN PHASE 7X AUTOMATICALLY.

END PHASE 7W
