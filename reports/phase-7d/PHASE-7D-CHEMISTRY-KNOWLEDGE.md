# Phase 7D — Chemistry Knowledge & Content Provenance Foundation

**Status: PASS**

> **CORRECTION NOTE (added 2026-08-18 during Phase 7D.1):** Section 7
> ("Claim Mapping") below was computed by `scripts/phase-7d/reconcile-claims.js`,
> which was found during Phase 7D.1 to have a whole-sentence-keyword-search
> bug causing systematic parameter misclassification (numeric values from
> other parameters, e.g. total alkalinity or temperature, attributed to
> "ph"). The numbers in Section 7 are preserved below **unedited**, as the
> historical record of what this phase originally reported, but should
> **not** be treated as authoritative. The corrected figures are in
> `reports/phase-7d-1/post-fix-chemistry-claims.csv` and
> `reports/phase-7d-1/PHASE-7D-KNOWLEDGE-IMPACT.md`. No other section of
> this report is affected -- see the impact assessment for the full
> file-by-file breakdown.

Baseline commit: `6df374b4b10e832503791d8f5286218806828a2c` (Phase 7A/7B/7C state).

## 1. Executive Summary

This phase built the first canonical, cross-referenced chemistry knowledge layer for WaterBalanceTools: a controlled vocabulary of 15 parameters, 23 context-specific range records, a 9-source registry built from live external research (CDC, PHTA/ANSI, NPIC, MMWR, Cleveland Clinic), 15 canonical claims, a deterministic read API, a structural validator wired into the build, and a full reconciliation of every one of the 3,933 chemistry claims Phase 7A extracted. It found one concrete, previously-invisible inconsistency (a saltwater-pool CYA target that doesn't match the rest of the site) and confirmed that the site's chemical-mixing safety guidance is well-supported by CDC/NPIC sources, even though it (like everything else on the site) is currently presented without a visible citation.

No production content was rewritten, no citations were injected into any page, and no calculator formula was changed -- this phase is the foundation the next phase will build on, per its explicit scope.

## 2. Chemistry Knowledge Layer

- `scripts/data/chemistry-knowledge.js` -- canonical vocabulary (15 parameters).
- `scripts/data/chemistry-ranges.js` -- 23 context-specific range records.
- `scripts/data/chemistry-sources.js` -- 9-source registry.
- `scripts/data/chemistry-claims.js` -- 15 canonical claim-to-source mappings.
- `scripts/chemistry/chemistryKnowledge.js` -- deterministic, offline read API (`getParameter`, `getRange`, `getContextualRange`, `getSources`, `getClaim`, `validateChemistryReference`).
- `scripts/chemistry/renderSources.js` -- citation-rendering helpers (architecture only; not wired into any page yet).

## 3. Parameters (15)

pH, Free Chlorine, Combined Chlorine, Total Chlorine, Total Alkalinity, Calcium Hardness, Cyanuric Acid, Salt, Bromine, Water Temperature, Chlorine Demand, Shock Treatment, Sanitizer, Oxidation, Algae.

Review status: 8 `supported` (cross-referenced against a real source), 7 `pending_review` (definitional, no dedicated source research this phase). **0 `verified`** -- nothing met the two-independent-source bar this phase.

## 4. Context Model

`environment`: pool, hot_tub. `sanitizer`: chlorine, bromine, saltwater_chlorine_generator, unspecified. `scenario`: routine_maintenance, target_range, treatment, shock, troubleshooting, calculator_input, calculator_output, safety_guidance. `temperature`: general, cold, normal, elevated. Enforced structurally by `validate-chemistry-knowledge.js` -- an invalid context value on any range/claim fails the build.

## 5. Canonical Ranges (23)

Cover pH (4 records: pool, hot-tub/chlorine, hot-tub/bromine, narrow-operational), free chlorine (3: pool no-CYA, pool with-CYA, hot tub), combined chlorine (1), total alkalinity (3: public standard, residential practical, hot tub), calcium hardness (2), cyanuric acid (4: public incident-response max, residential routine, hot tub prohibition, saltwater-pool discrepancy), salt (3: generic + 2 manufacturer-specific), bromine (1), shock treatment (2: rule-of-thumb, CDC incident response). Status breakdown: 12 `SUPPORTED`, 5 `CONTEXTUAL`, 6 `REQUIRES_REVIEW`, **0 `VERIFIED`**.

Multiple records per parameter are the norm, not an error -- see `chemistry-consistency-matrix.csv`.

## 6. Source Registry (9)

Hierarchy: 5 `primary` (CDC: Healthy Swimming x2, MAHC, MMWR, Pool Chemical Safety toolkit), 2 `professional` (ANSI/PHTA-11, PHTA Total Alkalinity fact sheet), 1 `academic` (NPIC/OSU Extension), 1 `secondary` (Cleveland Clinic, corroboration only). Every source carries `organization`, `title`, `url`, `source_type`, `accessed_date` (2026-08-18); `publication_date`/`last_updated` are `null` wherever not directly observed on the source (CDC topic pages did not expose one to this phase's research tools) rather than guessed. Full registry: `SOURCE-REGISTRY.json`.

## 7. Claim Mapping (3,933 total extracted claims, all classified)

| Status | Count |
|---|---|
| Total | 3,933 |
| Mapped to a parameter | 2,772 |
| Unmapped (no chemistry parameter matched; editorial/other content) | 1,161 (included below as AMBIGUOUS) |
| SUPPORTED | 32 |
| CONTEXTUAL | 146 |
| AMBIGUOUS | 3,231 |
| REQUIRES_REVIEW | 524 |
| VERIFIED | **0** |
| UNSUPPORTED | 0 |
| DEPRECATED | 0 |

No claim is marked VERIFIED or falsely treated as verified. The large AMBIGUOUS count is expected and honest: most of Phase 7A's 3,933 extracted "claims" are prose sentences containing a chemistry keyword, not numeric targets (e.g. page navigation text, editorial framing) -- see the reconciliation methodology in `scripts/phase-7d/reconcile-claims.js`. Full detail: `chemistry-coverage.csv` / `.json`.

## 8. High-Risk Claims

7 items across 6 categories in `HIGH-RISK-CHEMISTRY-CLAIMS.md`. Headline finding: a saltwater-pool CYA claim (60-80 ppm) that does not overlap the site's general residential outdoor-pool CYA guidance (30-50 ppm), with no confirmed chemical rationale found this phase for the difference. Chemical-mixing safety guidance sitewide was confirmed well-supported by CDC/NPIC sources. The systemic zero-citation problem (0/413 pages) is the umbrella risk across every category.

## 9. Calculator Assumption Audit

All calculator math lives in one shared module, `js/calc-utils.js` (9 functions), not scattered per-page -- a real asset for future knowledge-layer integration. Findings, none acted on in this phase:

- **`calculateChlorine`**: three concentration-implied constants (liquid /128000, granular-or-shock /10000, tablets /12000) with no comment stating which product concentration (e.g. 10% vs 12.5% liquid; 65% vs 73% cal-hypo) each assumes. **`CALCULATOR_REVIEW_REQUIRED`** -- the underlying math may well be correct for a commonly-assumed concentration, but that assumption is not documented anywhere a reader or reviewer can check it.
- **`calculatePHAdjustment`**: explicitly self-documented as a "simplified estimation" (linear, ignores total alkalinity's real nonlinear effect on pH buffering). Consistent with `reference/pool-chemistry-reference.html`'s own "linear pH adjustment approximation" disclosure elsewhere on the site. Not flagged as high-risk; the simplification is disclosed, if not prominently.
- **`calculateShock`**: defaults to a flat 10 ppm target and does not implement the commonly-cited "10x combined chlorine" breakpoint heuristic researched this phase. **`CALCULATOR_REVIEW_REQUIRED`** -- see `HIGH-RISK-CHEMISTRY-CLAIMS.md` Section 3.
- **`calculatePoolVolume` / `calculateSpaVolume`**: standard geometric formulas using 7.48052 gal/ft^3, which matches the conversion factor independently cited elsewhere on the site (`data/formulas.json`, `formulas/pool-volume-formula.html`, 7.48051948). Internally consistent; no action needed.
- **`calculateSalt`**: ~1 lb per 10,000 gal per 12 ppm rise. Arithmetically consistent with the commonly-cited industry rule "8.34 lb per 10,000 gal per 100 ppm" (1/12 ~= 0.0834), but not independently verified against a primary source this phase. `REQUIRES_REVIEW`, not treated as an error.
- **`calculateCYA`**, **`calculateAlkalinity`**: dosing coefficients (13 oz/10k gal/10 ppm; 1.4 lb/10k gal/10 ppm respectively) plausible but not independently verified against a primary source this phase. `REQUIRES_REVIEW`.
- **`calculateTurnover`**: pure arithmetic (volume / flow rate), no chemistry assumption to review.

No formula was changed. This audit is a documentation/verification gap map for a future phase, not a claim that any formula is wrong.

## 10. Generator Migration Plan

10 files/families ranked by concentration of embedded chemistry values (1,893 occurrences found across 232 scanned files); `scripts/generate-authority-charts.js` identified as the lowest-complexity, highest-value first migration target for a future phase. Full detail and sequencing: `GENERATOR-CHEMISTRY-MIGRATION-PLAN.md`.

## 11. Validators

`scripts/validate-chemistry-knowledge.js`: structural checks (duplicate IDs, invalid units/contexts, dangling source/range/parameter references, min>max, target-out-of-range, duplicate aliases, orphan sources/ranges as warnings). Final run: **PASS** -- 15 parameters, 23 ranges, 9 sources, 15 claims, 0 structural errors, 10 informational warnings (orphan sources/ranges -- content gaps, not defects). Wired into `scripts/run-all-generators.js` immediately after the Phase 7C URL-indexation gate.

## 12. Regression Tests

`scripts/test-chemistry-knowledge.js`: 25 assertions covering all 16 required scenarios (valid parameter, duplicate parameter ID, valid range, min>max, target-out-of-range, invalid unit, invalid context, missing source ID, invalid review status, duplicate alias, orphan source, valid multi-context ranges, pool-vs-hot-tub not falsely flagged, chlorine-vs-bromine stay distinct, REQUIRES_REVIEW allowed as a non-error state, malformed claim reference fails). **PASS**.

## 13. Full Build

`npm run build` -> exit 0. All prior gates (Phase 7B `validate-generated-output`, Phase 7C `validate-url-indexation`, `check-broken-links`) still pass. Page count, sitemap, canonicals, and redirects unchanged by this phase (verified via `git diff` -- only `scripts/`, `reports/phase-7d/`, and `package.json` changed; zero production HTML files touched).

## 14. Phase 7A Forensic Re-Audit

`npm run audit:forensic` re-run: page count 522 -> 522 (unchanged), P0/P1/P2/P3 and crawl/link/schema findings unchanged from the post-Phase-7C baseline (this phase touched no generated HTML). Confirms no accidental content/URL side effects.

## 15. Acceptance Gates

| # | Gate | Result |
|---|---|---|
| 1 | Canonical chemistry vocabulary exists | PASS |
| 2 | Canonical context model exists | PASS |
| 3 | Canonical range records exist for major parameters | PASS (23 records, 8 parameters with ranges) |
| 4 | Source registry exists | PASS (9 sources) |
| 5 | Claim-to-source mapping exists | PASS (15 canonical claims) |
| 6 | Chemistry consistency matrix exists | PASS (23 pairwise comparisons) |
| 7 | Calculator assumption inventory exists | PASS (Section 9) |
| 8 | Generator chemistry migration plan exists | PASS |
| 9 | Source-selection policy exists | PASS |
| 10 | Conflict-resolution policy exists | PASS |
| 11 | High-risk chemistry claim report exists | PASS |
| 12 | All 3,933 extracted claims have a classification/mapping status | PASS |
| 13 | No claim is falsely marked VERIFIED | PASS (0 VERIFIED anywhere in the dataset) |
| 14 | No unsupported claim is silently treated as verified | PASS |
| 15 | Structural chemistry validator exists | PASS |
| 16 | Chemistry validator integrated into the build | PASS |
| 17 | Regression tests pass | PASS (25 assertions) |
| 18 | Phase 7B validator passes | PASS |
| 19 | Phase 7C validator passes | PASS |
| 20 | Broken-link validator passes | PASS |
| 21 | Full build passes | PASS |
| 22 | No broad production content rewrite occurred | PASS |
| 23 | No Spanish pages created | PASS |
| 24 | No French pages created | PASS |
| 25 | No URL/canonical/redirect architecture changed | PASS |
| 26 | All external sources recorded with provenance metadata | PASS |
| 27 | Conflicting source values contextualized, not flattened | PASS |
| 28 | Every major calculator-used parameter has a knowledge-layer relationship or explicit review status | PASS |
| 29 | Complete generator migration plan exists | PASS |
| 30 | Final forensic re-audit completed | PASS |

## 16. Deferred Findings

- 524 `REQUIRES_REVIEW` and 3,231 `AMBIGUOUS` claims remain exactly that -- a future phase's job to research and reclassify, not this one's.
- The other Phase 7A findings explicitly out of this phase's scope (thin content, trust/author signals, programmatic duplication, remaining schema QUESTIONABLE/MISSING) are unchanged and still deferred.
- Calculator formula review items (`CALCULATOR_REVIEW_REQUIRED`, Section 9) are reported, not fixed.
- Citation injection into pages (the architecture exists in `renderSources.js`, unused) is explicitly deferred to a future phase per this phase's own scope limits.
