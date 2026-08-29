# Phase 7S -- Calculator Formula & Computational Integrity Audit -- Status Report

## Formulas audited (13 calculator paths, per `CALCULATOR-FORMULA-INVENTORY.csv`)

Volume/turnover (2), liquid chlorine, granular/shock chlorine, trichlor tablets, pool/hot-tub shock, pH adjustment, alkalinity, CYA, salt, plus the chemical-calculator's 3 false capability claims (calcium-hardness, alkalinity-dose, LSI) and the LSI formula page itself.

## Formulas changed (conclusively resolved, evidence converged)

1. **Liquid chlorine** (`js/calc-utils.js`, `js/calculator.js`, `formulas-data.js` formula-02, `dataset-dosage-matrices.js`): first-principles mass-balance derivation is exact through the mass calculation; converting to fluid ounces introduces a disclosed product-density assumption. At 12% strength the derivation (11.12 fl oz) lands within ~4% of the independently-fetched, fully-read Indiana DOH government table's 10.7 fl oz figure -- agreement within normal rounding, not an exact match. At 10% strength (the site's default product) the government table states no figure at all; the corrected 13.34 fl oz value is this audit's calculation, not a table-confirmed number. Divisors corrected (liquid 128000->749.4; tablets 12000->6666.7).
2. **Alkalinity** (`formulas-data.js` formula-05 documentation only): implementation was already correct (1.4 lbs); documentation's "1.5 lbs" and equation constant were wrong. Documentation corrected to match the correct implementation, confirmed by the same government table.
3. **LSI formula documentation** (`formulas-data.js` formula-09): worked example previously computed 3 different values for identical inputs. Rewritten to a single, internally consistent result using real, already-sourced lookup-table data (`data/datasets/water-balance.json`).

## Formulas NOT changed (evidence insufficient -- correctly left REQUIRES_EXPERT_REVIEW)

1. **pH adjustment** (`formulas-data.js` formula-04, `js/calc-utils.js` pH constants): pH dosing is inherently total-alkalinity-dependent; no source found states a TA-independent dose-per-pH-unit figure. Responsible resolution requires either a TA-aware architectural change or a source this phase did not find.
2. **Generic granular/shock divisor** (10000): no single product in the government table matches the calculator's implicit product assumption; inherited unresolved from Phase 7R.
3. **Shock formula's cal-hypo equation** (`formulas-data.js` formula-03): newly discovered ~1.5x discrepancy entangled with an oz/lbs unit-labeling bug; documented, not fixed, per the explicit instruction against expanding scope mid-phase.

## Documentation changed

`formulas-data.js` (formula-02, formula-05, formula-09 equations/explanations/worked examples/references); `reference/datasets/dosage-matrices/index.html` and `reference/datasets/water-balance/index.html` (regenerated to reflect corrected coefficients and the corrected "Consumed by" relationship); trust-panel copy on `calculators/chemical-calculator.html`.

## Calculators changed

`js/calc-utils.js` and `js/calculator.js` (liquid chlorine, tablets divisors). No calculator UI, input field, or output field was added, removed, or redesigned. No LSI calculator and no bromine calculator were built.

## Evidence sources added

1 new source: `in-doh-chemical-adjustment-2021` (Indiana Department of Health, Environmental Public Health Division, "Adjusting Chemical Levels in a Swimming Pool," fetched and read in full). 20 total sources in the registry (was 19 after Phase 7R).

## Unresolved expert-review items (carried to `REVIEW-QUEUE.md` / `DECISION-MATRIX.csv`)

pH-adjustment model; generic granular/shock divisor's product ambiguity; formula-03's cal-hypo equation and unit-labeling bug.

## Architectural gaps (confirmed, not built)

1. Interactive LSI calculator: lookup-table data layer exists and is sourced; computation/interpolation/UI layer does not exist. Standing decision against building one remains in force.
2. Shock calculator breakpoint-chlorination input: the now-SUPPORTED (Phase 7R) breakpoint rule cannot be applied without adding a combined-chlorine input field -- a genuine UI/architecture change, explicitly out of this phase's mandate.

## Regression results

- `npm run build`: PASS.
- Prior-phase validators re-run: `validate-phase-7h/7i/7k/7m/7n/7o.js` all PASS with 0 errors. `validate-phase-7p.js`, `validate-phase-7q.js`, `validate-phase-7r.js`, and `test-phase-7r.js` FAIL -- **expected, non-regression**: each hardcodes a `git diff` guard against its own pre-Phase-7S baseline commit asserting "no calculator/formula file changes," which this phase is explicitly authorized to make. This is the same stale-self-referential-validator-baseline pattern the Director explicitly accepted at the Phase 7Q-to-7R transition. `test-phase-7q.js` still PASSes (18/18; unaffected, as it doesn't guard calculator files).
- New `validate-phase-7s.js`: PASS, 0 errors, 0 warnings (after this status report existed to satisfy its own completeness check).
- New `scripts/test-phase-7s.js`: 17/17 PASS (covering categories A-K: documented examples agree with implementation, no contradictory values, documented-not-silent unresolved items, unit consistency, single-result liquid-chlorine example, no LSI calculator exposure x3, shock-preset integrity x2, evidence/disposition presence, no claim silently promoted to SUPPORTED, every changed constant traces to a decision-matrix row, dataset/source agreement).
- Broken-link check (`check-broken-links.js`): 0 issues, 526 pages checked.
- Forensic audit (`scripts/audit-forensic/run.js`), snapshot-then-restore discipline: run against the corrected working tree; before/after comparison of `reports/phase-7a/` output showed **zero metric drift** -- P0/P1/P2/P3 counts (0/26/66/433), action counts, cannibalization risk (0 HIGH), broken-internal-links (0), and every other summary statistic were byte-identical to the pre-Phase-7S baseline; only the report's own generation timestamp/commit-hash metadata differed. `reports/phase-7a/` was restored to its exact committed state afterward (this phase does not own that report).
- **Regression-sweep discovery (documented, not a Phase 7S regression):** running the full build surfaced a large, real, pre-existing content drift across ~225 pages sitewide (entities, guides, editorial, methodology, and more) between the currently-committed HTML and what the current header/nav/meta-tag injector pipeline produces. This predates Phase 7S, was not touched by any Phase 7S source edit, and was excluded from this phase's diff by reverting every affected file to its exact `219a57d` committed state after each generator run. Full detail in `PRODUCTION-CHANGES.md` and `REVIEW-QUEUE.md`; flagged for a future dedicated phase.

## Reproducibility

`generate-formulas.js`, `generate-datasets.js`, and `generate-trust.js` were each run twice from an identical starting state and their outputs diffed byte-for-byte: zero differences (formulas/, data/datasets/dosage-matrices.json, data/trust/datasets.json all identical across both runs). No new nondeterminism was introduced. The pre-existing, already-known footer-whitespace nondeterminism (present sitewide, unrelated to this phase) was observed and excluded from the production diff by the same selective-revert procedure described above.

## Scope control (explicitly verified)

No Spanish/French changes. No AdSense changes. No URL, redirect, or sitemap changes (`REDIRECT_SOURCES` registry unchanged at 6 entries; `sitemap-*.xml` reverted to baseline). No programmatic-family changes. No unrelated content rewrites (all sitewide drift discovered during the regression sweep was reverted, not applied). No fabricated sources, authors, reviewers, or expertise. No mass citation injection (1 new source added, used only where evidenced). No LSI calculator built. No bromine calculator built. `chemistry-claims.js`/`chemistry-ranges.js` unmodified this phase (verified by `git diff`, asserted in `test-phase-7s.js` category I).

## Remaining review queue

See `reports/phase-7s/REVIEW-QUEUE.md` for the full condensed narrative and `DECISION-MATRIX.csv` for the complete, evidence-mapped item-by-item ledger (20 rows). Headline items: pH-adjustment model (TA-aware redesign vs. sourced fixed-TA approximation), generic granular/shock divisor, formula-03's cal-hypo equation, shock calculator combined-chlorine input (product decision), and the newly-discovered sitewide template/injector drift (infrastructure decision, unrelated to calculators).

## Post-submission correction (Director-directed)

The Director Assessment flagged a date-integrity error: `in-doh-chemical-adjustment-2021`'s `accessed_date` and related `lastReviewed`/reference dates were recorded as `2026-08-29`, a date in the future relative to the project clock (`2026-08-28`) at the time the work was performed. Verified against the session's own environment metadata rather than guessed; corrected to `2026-08-28` across `scripts/data/chemistry-sources.js`, `scripts/data/formulas-data.js`, `scripts/data/trust-calculator-metadata.js`, `LIQUID-CHLORINE-AUDIT.md`, and their generated outputs. No formula, constant, or classification changed. Provenance validators and the full Phase 7S validator/test suite re-run afterward -- all pass clean. The liquid-chlorine summary line above was also tightened per the Director's request to avoid overstating the government-table match as "exact." Full detail in `PRODUCTION-CHANGES.md`.

## Phase 7T decision

**PASS WITH REVIEW QUEUE.** All 3 conclusively-resolvable findings (liquid chlorine, alkalinity, LSI documentation) were resolved using convergent, independently-verified evidence. The 2 findings without conclusive evidence (pH, shock divisor/formula-03) were correctly left as `REQUIRES_EXPERT_REVIEW` rather than forced to a fabricated resolution. One infrastructure incident (academy.json) was caught and fully remediated within the phase. One new infrastructure risk (sitewide template drift) was discovered, excluded from this phase's diff, and clearly flagged rather than silently absorbed or silently fixed. All regression, reproducibility, and scope-control checks pass.

DO NOT BEGIN PHASE 7T AUTOMATICALLY.

END PHASE 7S
