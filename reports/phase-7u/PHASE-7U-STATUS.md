# Phase 7U -- Calculator Model Architecture & Product-Input Decision -- Status Report

## Baseline

HEAD verified at `6cf09af` (Phase 7T). Working tree clean. `npm run build` run; the same pre-existing, sitewide latent template/injector drift Phase 7S/7T documented resurfaced (unrelated to any calculator) and was reverted before any Phase 7U work began. Phase 7T validator/tests confirmed clean before starting. Full detail in `BASELINE.md`.

## pH Architecture

**Recommended: Option A (remove the numeric dosing claim, replace with directional/qualitative guidance).** The only option requiring no new unresolved chemistry evidence -- directly resolves Phase 7T's defensibility finding by scope reduction rather than by inventing a formula. Options C (TA/CYA closed-form) and E (retain current constants) are explicitly `DO_NOT_BUILD`/`REJECTED`. Options B (acid-demand-test) and D (product-specific pH table) were materially advanced by new research this phase -- Taylor Technologies' K-1005 manual (fetched and read in full) confirms the acid-demand-test procedure is real and manufacturer-documented; LaMotte's own "Acid Demand Index" (fetched and read in full) confirms the "measured index -> volume-scaled table" pattern is standard manufacturer practice, working for total-alkalinity reduction specifically -- but the pH-target-specific scaling table was not found and read in full this phase, so both remain `ARCHITECTURAL_GAP`/`REQUIRES_EXPERT_REVIEW`. **No production change made** -- Option A is a real UI/output redesign, reserved for a dedicated follow-up phase. Full detail: `PH-ARCHITECTURE-DECISION.md`.

## Shock Architecture

**Recommended: Option B (product selector -- calcium hypochlorite, sodium dichlor, trichlor, liquid chlorine).** The site's own `dataset-dosage-matrices.js`, read in full this phase, already contains a genuinely defensible dataset for this: 4 dry-product coefficients that Phase 7T independently cross-validated against PHTA's own Water Chemistry Adjustment Guide, plus product-specific safety data (CYA contribution, calcium contribution, mixing hazards) the bare-percentage alternative (Option A) would discard. Option E (integrate breakpoint mode) is `REJECTED`, reconfirming Phase 7T with no new contrary evidence found. **No production change made to any calculator** -- Option B is a real UI redesign (new selector, new JS branching, new documentation), reserved for a dedicated follow-up phase. **One narrow documentation change made**: annotated 5 dataset records' `notes` fields with provenance findings (4 cross-validation citations, 1 explicit unsourced-data disclosure) -- no coefficient or calculator behavior touched. Full detail: `SHOCK-ARCHITECTURE-DECISION.md`.

## Formula Governance

Consolidated ledger of every live and documentation-only formula's status, provenance, and change-approval process in `FORMULA-GOVERNANCE.md`. All Phase 7S/7T `RESOLVED` decisions (liquid chlorine, alkalinity, LSI documentation, formula-03) reconfirmed unchanged; no contradictory evidence found this phase.

## Production Changes

2 files hand-edited: `scripts/data/dataset-dosage-matrices.js` (5 `notes`-field annotations, no numeric values changed), `scripts/data/chemistry-sources.js` (2 new manufacturer-tier source records: LaMotte, Taylor). 2 generated files regenerated to match: `data/datasets/dosage-matrices.json`, `reference/datasets/dosage-matrices/index.html`. **No calculator JS file changed. No calculator HTML changed.** Full detail: `PRODUCTION-CHANGES.md`.

## Validators

`validate-phase-7u.js`: PASS, 0 errors, 0 warnings. `scripts/test-phase-7u.js`: 15/15 PASS (categories A-O).

## Regression

`npm run build`: PASS. `validate-phase-7t.js`: FAIL -- **expected, documented stale-baseline pattern** (hardcodes an "expected touch list" scoped to its own phase; flags `dataset-dosage-matrices.js` as undocumented relative to *Phase 7T's own* `PRODUCTION-CHANGES.md`, which correctly has no knowledge of Phase 7U's separately-documented change -- same precedented pattern as every prior phase transition). `test-phase-7t.js`: 15/15 PASS. Prior validators 7H/7I/7K/7M/7N/7O: all PASS. `check-broken-links.js`: PASS, 0/526. All 3 provenance validators: PASS clean, 0 violations. `validate-datasets.js`: PASS, 16/16 datasets, 0 errors. `validate-trust.js`: PASS with 1 pre-existing warning ("Formula page missing version badge: formulas/shock-formula.html") -- confirmed via a clean-checkout comparison to be present on the unmodified `6cf09af` baseline already, i.e. inherited from Phase 7T, not caused by this phase; out of scope to fix without reopening formula-03. `validate-trust-layer.js`: PASS clean. Forensic audit (snapshot-then-restore discipline): re-run; found a real, non-whitespace diff in `trust-audit.json`'s "pages with zero external sources" figure (416 -> 400) and corresponding `url-inventory` reordering -- investigated and confirmed this is **pre-existing accumulated staleness between the committed `reports/phase-7a/` snapshot and the live tree, predating Phase 7U**: Phase 7T's own forensic runs already showed this same live 400/416 figure, meaning the committed snapshot has not reflected several phases' worth of citation additions (7L/7M/7N/7R). Not caused by this phase's changes; report restored to its exact `6cf09af` committed state afterward, per established precedent. Flagged as a growing staleness worth a dedicated future refresh, not a Phase 7U regression.

## Reproducibility

`generate-datasets.js` run twice; `data/datasets/dosage-matrices.json` byte-identical across both runs. No new nondeterminism.

## Scope Control

No Spanish/French, AdSense, URL/redirect/sitemap, or programmatic-family changes (confirmed via diff and `REDIRECT_SOURCES` unchanged at 6 entries). No i18n expansion. No fabricated sources or concentrations -- every quantitative claim traces to a fetched-and-fully-read manufacturer or government/professional-standard document, or to this site's own pre-existing dataset. No LSI or bromine calculator built. `chemistry-claims.js`/`chemistry-ranges.js` unmodified. Phase 7N.1, 7O.1, 7P/7Q, and Phase 7S/7T `RESOLVED` decisions (liquid chlorine, alkalinity, LSI, formula-03) not reopened.

## Remaining Review Queue

pH: a pH-target (not TA-target) manufacturer acid-demand scaling table remains the single most promising unresolved lead. Shock: Option B (product selector) is `IMPLEMENT`-classified and fully specified, awaiting a dedicated implementation phase. Both architecture decisions and their full input contracts are ready for Director-authorized follow-up. Full ledger: `ARCHITECTURE-DECISION-MATRIX.csv` (11 rows), `REVIEW-QUEUE.md`.

## Phase 7V Decision

GO (PASS WITH REVIEW QUEUE)

DO NOT BEGIN PHASE 7V AUTOMATICALLY.

END PHASE 7U
