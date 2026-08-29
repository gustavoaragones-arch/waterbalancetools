# Phase 7T -- Expert-Resolution Calculator & Chemistry Model Audit -- Status Report

## Baseline

HEAD verified at `d5cbe3f` (Phase 7S). Working tree clean. `npm run build` run; the same pre-existing, sitewide latent template/injector drift Phase 7S documented (~207-225 pages, unrelated to calculators) resurfaced and was reverted before any Phase 7T work began -- not caused by this phase, not re-investigated further (out of mandate). Phase 7S validator/tests confirmed clean (PASS, 0 errors; 17/17). All 4 carry-forward items reproduced fresh from live source, matching Phase 7S's findings exactly. Full detail in `BASELINE.md`.

## pH Audit (Priority A)

`REQUIRES_EXPERT_REVIEW` (implementation constants) + `ARCHITECTURAL_GAP` (missing TA/CYA inputs) -- **unresolved, no production change.** PHTA's own "Water Chemistry Adjustment Guide" -- the same authoritative dosing-table format this project already relies on for liquid chlorine, alkalinity, calcium hardness, and (this phase) formula-03 -- deliberately excludes pH from that table and defers to a separate, empirical "Acid Demand Test" procedure. PHTA's Alkalinity fact sheet independently confirms CYA measurably confounds a TA reading, meaning even a TA-aware model would be incomplete without CYA. No TA-independent or TA-aware closed-form model was found and independently verified. Per Section 4, no TA input was added without a complete, established model.

## Shock Divisor (Priority B)

`REQUIRES_EXPERT_REVIEW` (numeric divisor) + `ARCHITECTURAL_GAP` (no product-identity input) -- **unresolved, no production change.** Dimensional analysis shows the generic `10000` divisor corresponds to an implicit 133.44%-available-chlorine product -- not merely unsourced, but physically impossible. Cross-checked against 10 named products (PHTA/Indiana DOH tables, this site's own dataset): none match a coefficient of 1.0; real products range ~1.3-3.8 oz/10,000gal/1ppm. PHTA's Calcium Hypochlorite fact sheet confirms exact dosing is inherently product/label-specific.

## formula-03 (Priority C)

`IMPLEMENTATION_ERROR` + `DOCUMENTATION_ERROR`, **`RESOLVED`.** The uncited `/800` divisor was wrong under either an oz or lbs interpretation (~10.7x too low as oz, ~1.5x too high as lbs), corresponding to an incorrect "1 lb raises 10,000gal by 8 ppm" assumption where the mass-balance-correct value is ~12 ppm. Corrected using the same `0.013344` mass-balance constant already used and Director-approved for liquid chlorine, converging with PHTA's own dosing table (the independent external evidence) and, as corroborating but not independent confirmation, this site's own pre-existing 65%/73% cal-hypo dataset entries, all to within normal rounding. Documentation-only fix -- this formula was never wired to a live calculator.

## Shock Architecture (Priority D)

`SUPPORTED_DOMAIN_ASSUMPTION` (preset UX) + `ARCHITECTURAL_GAP` (breakpoint dosing, unbuilt) -- **confirmed, no production change.** The calculator consistently claims only a generic FC-increase tool; presets are severity-labeled FC-increase categories, not breakpoint-CC multiples or product doses. The existing Phase 7S trust-panel disclosure already accurately states both facts this audit independently re-derived (breakpoint is a rule of thumb; CC is not read). No gap between disclosure and reality found. A distinct breakpoint calculator remains a legitimate, un-built future option, not a necessity.

## Cross-Calculator Consistency

`formula-02` and `formula-03` now share the identical mass-balance constant, resolving what would otherwise have been the only cross-calculator inconsistency found. No other contradiction in ppm meaning, units, target ranges, or terminology across liquid chlorine, generic chlorine, granular chlorine, shock, alkalinity, or pH.

## Production Changes

2 files hand-edited: `scripts/data/formulas-data.js` (formula-03 equation, worked example, explanation, limitations, references), `scripts/data/chemistry-sources.js` (2 new PHTA source records; a 3rd PHTA document read this phase was found already registered from Phase 7Q and reused by ID rather than duplicated -- caught by `validate-provenance.js`'s duplicate-ID check). 2 generated files regenerated to match: `data/formulas.json`, `formulas/shock-formula.html`. No calculator JS, UI, input, or output changed anywhere on the site. Full detail in `PRODUCTION-CHANGES.md`.

**New finding, documented not acted on:** PHTA's Alkalinity fact sheet prose states 1.5 lbs sodium bicarbonate (vs. the 1.4 lbs Phase 7S's `RESOLVED` decision used); PHTA's own more-specific dosing table, also read this phase, reconfirms 1.4 lbs. A ~7% internal PHTA prose-vs-table discrepancy does not meet the "materially wrong" bar to reopen a Phase 7S decision. See `REVIEW-QUEUE.md` and ledger item 7T-05.

## Validators

`validate-phase-7t.js`: PASS, 0 errors, 0 warnings. `scripts/test-phase-7t.js`: 15/15 PASS (categories A-O).

## Regression

`npm run build`: PASS. `validate-phase-7s.js`: PASS (0 errors). `test-phase-7s.js`: 17/17 PASS. Prior validators 7H/7I/7K/7M/7N/7O: all PASS. 7P/7Q/7R and their tests: FAIL -- **expected, documented stale-baseline pattern** (each hardcodes a `git diff` guard against its own pre-Phase-7S baseline for "no calculator/formula changes," which Phase 7S and 7T are both explicitly authorized to make; confirmed every flagged file is one of the already-documented, legitimate calculator/formula/meta-script files, nothing unexpected). `check-broken-links.js`: PASS, 0/526. `validate-provenance.js`, `validate-provenance-resolution.js`, `validate-entity-provenance.js`: all PASS clean (provenance validator additionally caught and helped correct an attempted duplicate source-ID registration during this phase's own evidence gathering). `validate-trust.js`, `validate-trust-layer.js`: both PASS clean. Forensic audit (snapshot-then-restore discipline): re-run; found a fully deterministic (confirmed via an immediate repeat run producing zero diff), low-magnitude ripple in corpus-relative quality scores across ~230 unchanged pages (mostly ±0.1, entities pages shifting between UNCHANGED/IMPROVE at the P2/P3 boundary) -- traced to `formulas/shock-formula.html`'s content change affecting corpus-wide relative scoring baselines, not random drift; P0 count unchanged at 0, no page crossed into a critical tier, the only P1-tier pages affected (6 `programmatic/shock/*` longtail pages) kept their existing MERGE action with a negligible +0.1 score nudge. Report restored to its exact `d5cbe3f` committed state afterward, per Phase 7S's established precedent (this report is not owned by this phase).

## Reproducibility

`scripts/generate-formulas.js` run twice from an identical starting state; `data/formulas.json` and `formulas/shock-formula.html` byte-identical across both runs. No new nondeterminism in generator output. (The forensic-audit ripple described above is a separate, already-investigated, fully-deterministic phenomenon tied to a real content change, not generator nondeterminism.)

## Scope Control

No Spanish/French, AdSense, URL/redirect/sitemap, or programmatic-family changes (`REDIRECT_SOURCES` unchanged at 6 entries; `programmatic/`, `es/`, `fr/` untouched). No i18n expansion. No fabricated sources, product concentrations, or expertise -- every quantitative claim traces to a fetched-and-fully-read PHTA or government document, or to this site's own pre-existing, unrelated dataset. No LSI calculator, no bromine calculator built. `chemistry-claims.js`/`chemistry-ranges.js` unmodified. Phase 7N.1 (programmatic KEEP), 7O.1 (printables/resources), and 7P/7Q provenance decisions not reopened.

## Remaining Review Queue

pH-adjustment architecture decision (acid-demand-test tool vs. TA+CYA-aware formula vs. narrowed accuracy claim); generic shock/granular calculator's product-identity input decision; breakpoint-chlorination calculator as a distinct future tool; the sitewide template/injector drift infrastructure decision (carried unchanged from Phase 7S). Full ledger: `FORMULA-DECISION-LEDGER.csv` (5 rows), `REVIEW-QUEUE.md`.

## Phase 7U Decision

**PASS WITH REVIEW QUEUE.** One formula (formula-03) conclusively resolved via convergent first-principles derivation and two newly-fetched, fully-read authoritative sources. Three items (pH, generic shock divisor, breakpoint architecture) correctly and evidence-fully preserved as `REQUIRES_EXPERT_REVIEW`/`ARCHITECTURAL_GAP` rather than forced to a resolution -- each with stronger, more specific evidence than Phase 7S had, still correctly stopping short of a production change. One new evidence discrepancy (PHTA internal alkalinity inconsistency) found, investigated, and correctly not acted on. All regression, reproducibility, and scope-control checks pass, including one investigated and explained (not hidden) forensic-scoring ripple.

DO NOT BEGIN PHASE 7U AUTOMATICALLY.

END PHASE 7T
