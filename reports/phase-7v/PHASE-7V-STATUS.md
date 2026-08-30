# Phase 7V -- pH Calculator Narrowing & Formula Governance -- Status Report

## Baseline

HEAD verified at `4de88b8` (Phase 7U). Working tree clean. `npm run build` run; the same pre-existing, sitewide latent template/injector drift documented since Phase 7S resurfaced and was reverted before any Phase 7V work began. `validate-phase-7u.js`/`test-phase-7u.js` confirmed clean before starting. Full detail, exact source files inspected, and two mid-implementation authoritative-source discoveries (see below) in `BASELINE.md`.

## Exact source files inspected

`js/calc-utils.js`, `js/calculator.js`, `calculators/pool-ph-calculator.html`, `calculators/hot-tub-ph-calculator.html`, `calculators/chemical-calculator.html` (a third consumer of the pH functions, discovered during inspection, correctly brought in scope), `scripts/data/formulas-data.js` (`formula-04`), `formulas/ph-adjustment-formula.html` and its generator, `scripts/data/trust-calculator-metadata.js`, and the established Phase 7S/7T/7U validator/test architecture used as this phase's own template.

## Old numeric behavior

`calculatePHAdjustment`/`phIncreaserOunces`/`phReducerOunces` computed `ounces = (gallons/10000) × |ΔpH| × (6 or 5)`, constants with no traceable derivation (Phase 7T/7U finding, reconfirmed). All 3 consumer pages rendered a specific ounce figure.

## New qualitative behavior

`calculatePHAdjustment`/`evaluatePHGuidance` now return `{ direction: 'balanced'|'raise'|'lower', magnitude: null|'small'|'moderate'|'substantial' }` — no numeric dose field anywhere in the return shape. Magnitude tiers (<0.2/<0.5/≥0.5 pH units) are a readability aid over input distance, explicitly documented as not a validated dosing threshold. All 3 pages now render direction + magnitude + generic (non-product-named) product-label + incremental + retest (30–60 min, matching the page's own pre-existing FAQ interval) guidance. Full detail: `PH-IMPLEMENTATION.md`.

## formula-04 disposition

Rewritten to state plainly that no validated dosing equation is published and why (buffering, missing TA/CYA/product inputs, authoritative sources deliberately omitting a pH dosing table); no new formula was created. Worked example now walks through the calculator's actual qualitative output rather than a number. `variables` repurposed from formula terms to the relevant factors, explicitly marked as not collected.

## FAQ changes

`pool-ph-calculator.html`'s "What lowers pH naturally?" PAA item reworded to remove an implied "measured amount" claim. `reference/common-pool-chemistry-mistakes.html` and `guides/ph/how-to-lower-pool-ph.html` (2 sentences each) corrected where they specifically claimed the calculator gives "exact" results. The latter's own separate, pre-existing hardcoded dose table was deliberately not touched (out of scope; see Review Queue). `programmatic/ph/*`/`programmatic/hot-tubs/*` pages with similar claims were found but explicitly not touched, per the hard programmatic-family boundary.

## Trust-panel changes

`pool-ph-calculator`/`hot-tub-ph-calculator` trust metadata: removed the unused `dosage-matrices` dependency and unnamed `muriatic-acid`/`soda-ash` entities; notes rewritten to state plainly that no chemical dose is calculated and why. `chemical-calculator`'s notes corrected from a now-false "computes a chlorine dose and a pH dose" claim. Propagated via `generate-trust.js` and the established strip/reinject procedure.

## Accessibility verification

No form markup, input, label, or heading structure touched — only script logic and prose. `audit-accessibility.js`: score 100, 0 missing alt/label/aria, 0 heading skips (unchanged from baseline). Label `for`/`id` associations spot-verified intact on both standalone pH calculator forms.

## Validator results

`validate-phase-7v.js`: PASS, 0 errors, 0 warnings. `test-phase-7v.js`: 28/28 PASS (direction, magnitude, numeric-dose prohibition, safety guidance, formula-04 disposition, unrelated-calculator isolation, LSI/bromine absence, no unauthorized inputs, scope control, ledger completeness).

## Regression results

`npm run build`: PASS (after reverting the pre-existing sitewide drift each time it resurfaced, as required — see Baseline.md for two mid-implementation authoritative-source corrections this required). `validate-phase-7u.js`/`test-phase-7u.js`: FAIL — **expected, documented stale-baseline pattern**: every flagged item (`js/calc-utils.js`, `js/calculator.js`, the calculator pages, `formulas-data.js`, `trust-calculator-metadata.js`) is a file this phase was explicitly authorized to change; Phase 7U's own guard has no knowledge of Phase 7V's separately-documented authorization, identical in kind to every prior phase transition. Prior validators 7H/7I/7K/7M/7N/7O: all PASS. `check-broken-links.js`: PASS, 0/526. All 3 provenance validators, `validate-datasets.js`: PASS clean. `validate-trust.js`: PASS with 1 pre-existing warning (`formulas/shock-formula.html` missing a version badge), confirmed unrelated to this phase. `validate-schema.js`/`validate-schema-content-consistency.js`: PASS, 0 critical. Forensic audit (snapshot-then-restore): P0 unchanged at 0; small, plausible shifts in AdSense-readiness and cannibalization counts consistent with the substantial, real content rewrite on the pH pages and `formula-04`; report restored to its exact `4de88b8` committed state afterward.

## Reproducibility

`generate-authority-guides.js` and the `data/formulas.json` regeneration step each run twice; byte-identical output both times. No new nondeterminism. (Two isolated-generator-run side effects — missing injector layer on regenerated pages — were caught, understood as the same known pattern from every prior phase, and corrected via a full `npm run build`, not treated as nondeterminism.)

## Scope-control verification

No Spanish/French, AdSense, URL, redirect, or sitemap changes (`REDIRECT_SOURCES` unchanged at 6). No programmatic-family changes (confirmed via direct diff — 0 files touched in `programmatic/`, despite discovering contradictory content there that was deliberately left alone). No chlorine, shock, alkalinity, CYA, salt, LSI, or volume calculator changed (confirmed via diff and the Phase 7V test suite's explicit per-file check). No client-side framework introduced — pure vanilla JS, matching the existing architecture. No fabricated sources, authors, credentials, or expertise. No new unsupported chemistry claim introduced; two pre-existing, independently-discovered unsupported claims (the guide's dose table; the programmatic pages' calculator references) were found, documented, and explicitly not touched.

## Remaining Review Queue

Carried forward without attempting to solve: the guide's hardcoded muriatic-acid dose table; the programmatic-page/calculator inconsistency; continued pH-target acid-demand-table research; the sitewide template/injector drift infrastructure decision; a minor `generate-hubs.js`/`generate-navigation.js` pipeline-ordering quirk discovered this phase. Full detail: `REVIEW-QUEUE.md`.

## Recommendation for Phase 7W

Per the Director's explicit two-phase plan: Phase 7W should implement the Phase 7U-approved Option B shock product-selector contract (product selector, per-product JS branching reusing the approved mass-balance formula, product-specific safety-note surfacing, updated `formula-03`/trust documentation, full testing/regeneration) — a separate, dedicated phase, not combined with this one.

## Final acceptance check

- Live pH calculator no longer produces a numeric chemical dose: **confirmed** (test suite + validator).
- Old constants no longer used for live pH dosing: **confirmed**.
- Direction correct: **confirmed** (4 direct test cases).
- Qualitative magnitude deterministic: **confirmed** (repeatability test + boundary cases).
- Safety guidance present: **confirmed** (retest interval, incremental addition, product label instruction on all 3 pages).
- formula-04 no longer presents an unsupported formula as valid: **confirmed**.
- Contradictory pH FAQ/content corrected (within scope): **confirmed**.
- Trust disclosure matches the new architecture: **confirmed**.
- Accessibility clean: **confirmed** (score 100, unchanged).
- No unrelated calculator behavior changed: **confirmed** (diff + dedicated test).
- Build passes: **confirmed**.
- Phase 7V tests pass: **confirmed** (28/28).
- Relevant regression validators pass: **confirmed** (all clean except the expected, documented stale-baseline pattern).
- No new unsupported chemistry claims introduced: **confirmed**.
- Reproducibility confirmed: **confirmed**.

All acceptance criteria met.

## Phase 7W Decision

GO — recommend Director authorize Phase 7W (shock product-selector implementation) as a separate, dedicated phase.

DO NOT BEGIN PHASE 7W AUTOMATICALLY.

END PHASE 7V
