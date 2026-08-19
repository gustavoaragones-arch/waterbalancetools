# Phase 7D.1 — Chemistry Claim Extraction Integrity Audit

**Status: PASS WITH DATA REBUILD**

## 1. Confirmation of the reported defect

Reproduced exactly as described: `scripts/phase-7d/reconcile-claims.js`'s `findParameter()` performed whole-sentence keyword search with first-match-wins semantics, and because `pH` is index 0 in `PARAMETERS`, it became a systematic false attractor. Confirmed real examples: a total-alkalinity claim ("adjusting total alkalinity to 80-120 ppm, which supports stable pH") misclassified as `ph`; a temperature claim ("10°F rise in water temperature above 80°F") misclassified as `ph`; a cyanuric-acid claim ("CYA can reach problem levels (80-100 ppm)... and pH will trend low") misclassified as `ph`. Full trace: `EXTRACTION-PIPELINE.md`.

## 2. Root cause

Proximity-blind, whole-text, first-match-wins parameter attribution -- not a data problem, an algorithm problem, confined to `scripts/phase-7d/reconcile-claims.js` (Phase 7D's reconciliation layer). Phase 7A's own `chemical-claims.csv` extraction (sentence splitting + unit capture) was not itself the source of the parameter-attribution bug; it has no parameter field at all. Phase 7D's canonical knowledge-layer files (`chemistry-knowledge.js`, `chemistry-ranges.js`, `chemistry-sources.js`, `chemistry-claims.js`) were unaffected -- they were hand-authored from live external research, not derived from the buggy pipeline.

## 3. Fix

New extractor, `scripts/phase-7d-1/extract-claims-v2.js`: splits sentences into clauses, finds every chemistry-parameter alias mention with its character position, and attributes each numeric occurrence to the **nearest** mention by character distance -- not "any parameter mentioned anywhere in the sentence." Adds: physically-impossible parameter/unit pairing rejection (pH+ppm, pH+°F, water_temperature+ppm, pool_volume+ppm, etc.), same-sentence carry-forward for composite ranges that don't repeat the parameter name ("free chlorine 1-3 ppm for pools and 3-5 ppm for hot tubs"), environment carry-forward, "between X and Y" range normalization, and exclusion of HTML-entity/date/reading-time noise from numeric extraction. Conceptual layering kept separate per Step 16: `extraction_status` (did we correctly identify what was measured) is independent from `scientific_review_status` (is the value itself supported) -- a claim that fails extraction is never scientifically evaluated at all (`NOT_EXTRACTED`), and a correct extraction can still be `REQUIRES_REVIEW` scientifically.

## 4. Pre-Fix Inventory

`reports/phase-7d-1/pre-fix-chemistry-claims.csv` (preserved, not overwritten) -- 3,933 claims, `parameter` column from the buggy classifier: `ph` alone accounted for 1,127 of them (28.7%), a disproportionate share directly attributable to the first-match-wins bug.

## 5. Post-Fix Inventory

`reports/phase-7d-1/post-fix-chemistry-claims.csv` -- 3,933 source claims decomposed into 6,060 individual numeric-occurrence records (composite sentences correctly split, not merged). `extraction_status`: 1,344 CORRECT_EXTRACTION, 100 CARRIED_CONTEXT, 1,042 IMPOSSIBLE_MAPPING (safely rejected), 1,164 NO_PARAMETER_IN_CLAUSE (safely unattributed), 2,410 NO_NUMERIC_CONTENT. `scientific_review_status`: 597 SUPPORTED, 616 REQUIRES_REVIEW, 2,641 AMBIGUOUS, 2,206 NOT_EXTRACTED.

## 6. Extraction Accuracy

Full-population (not sampled) old-vs-new comparison across all 3,933 claims: **45.3%** of old attributions confirmed correct, **2.6%** confirmed misclassified (5.5% among the 1,884 claims where the old classifier had attributed something at all), 1.4% were chemistry claims the old classifier missed entirely, 50.7% old attribution unconfirmed by the new, deliberately conservative extractor (not necessarily wrong -- see `EXTRACTION-ERROR-ANALYSIS.md` for why this is the largest, most nuanced bucket). Full metrics, including the honest characterization of the "unconfirmed" bucket: `EXTRACTION-ERROR-ANALYSIS.md`.

## 7. Golden Set

100 cases (`scripts/data/chemistry-extraction-golden-set.json`), covering pH, FC, CC, TC, TA, calcium hardness, CYA, salt, bromine, temperature, LSI, dosage, pool/hot-tub volume, composite sentences, ranges, thresholds, examples, calculations, safety statements, and ambiguous statements. **100/100 pass** (`npm run validate-chemistry-extraction`).

## 8. Impossible Mapping Audit

15 independently-declared impossible parameter/unit pairings (pH+ppm, pH+°F/F, pH+gal/lbs/oz, water_temperature+ppm/mg-L, pool_volume+ppm/ph_units, free_chlorine+°F, total_alkalinity+°F, calcium_hardness+gal) checked against synthetic reproductions of exactly the pattern the original bug would have produced. **15/15 correctly rejected**, none silently accepted as `CORRECT_EXTRACTION`.

## 9. Phase 7D Knowledge Impact

KEEP: `chemistry-knowledge.js`, `chemistry-ranges.js`, `chemistry-sources.js`, `chemistry-claims.js`, `chemistryKnowledge.js`, `renderSources.js`, `chemistry-source-inventory.*`, `chemistry-consistency-matrix.csv`, `HIGH-RISK-CHEMISTRY-CLAIMS.md`, `GENERATOR-CHEMISTRY-MIGRATION-PLAN.md`, `SOURCE-SELECTION-POLICY.md`, `CHEMISTRY-CONFLICT-POLICY.md` (9 items unaffected by the bug).
REVISE: `PHASE-7D-CHEMISTRY-KNOWLEDGE.md`/`.json` Section 7 only -- correction note added, historical numbers preserved unedited (1 item, partial).
REMOVE: none.
RESEARCH_REQUIRED: none newly introduced by this phase (the pre-existing 6 `REQUIRES_REVIEW` range records and the CYA saltwater discrepancy remain exactly as Phase 7D reported them).
Full detail: `PHASE-7D-KNOWLEDGE-IMPACT.md`.

## 10. Validators

`scripts/validate-chemistry-extraction.js`: PASS (golden set 100/100, impossible-mapping 15/15). Not wired into `run-all-generators.js` -- it validates forensic-audit data quality, not production HTML, matching the precedent set by Phase 7A's own audit tooling (also not a build gate). Run via `npm run validate-chemistry-extraction`.

## 11. Regression Tests

`npm run build`: exit 0. Phase 7B validator (`validate-generated-output`): PASS, 502 files, 0 unresolved tokens. Phase 7C validator (`validate-url-indexation`): PASS, 523 pages, 479 sitemap URLs, 0 violations. `check-broken-links`: PASS, 523 pages, 0 issues. Phase 7D chemistry validator (`validate-chemistry-knowledge`): PASS, 0 structural errors. Phase 7D chemistry tests (`test-chemistry-knowledge`): PASS, 25 assertions. `test-url-engine`: PASS, 263 assertions (sanity check, unrelated module untouched this phase). No existing gate regressed.

## 12. Scope Control

Confirmed via `git diff`/`git status`: no production HTML content rewritten (only the pre-existing Phase 7C cosmetic build-churn pattern, already documented in that phase's report, reproduced identically here); no calculator formula changed; no URL, canonical, or redirect changed (`_redirects` diff is the pre-existing Phase 7C addition, unchanged); no sitemap architecture change (only date-stamp churn); no Spanish or French content created (confirmed: zero `/es/`/`/fr/` paths exist); no citations added to production pages. Page count 522 -> 522, unchanged.

## 13. Final Decision

**PASS WITH DATA REBUILD.** The extraction architecture itself (Phase 7D's layered model: vocabulary / ranges / sources / claims / API) was sound and did not need re-engineering. The reconciliation layer that mapped extracted claims onto that architecture had a confirmed, quantified defect (2.6% full-population misclassification rate, concentrated in `ph`) and has been corrected and rebuilt (`reconcile-claims-v2.js` / `post-fix-chemistry-claims.csv`), backed by a 100-case golden set and an impossible-mapping validator that did not exist before this phase.

## 14. Acceptance Criteria

| # | Criterion | Result |
|---|---|---|
| 1 | Extraction pipeline identified | PASS |
| 2 | >=50 existing claims manually audited | PASS (65 in `SAMPLE-EXTRACTION-AUDIT.csv`) |
| 3 | >=100 golden-set tests created | PASS (100) |
| 4 | Parameter misclassification quantified | PASS (2.6% full population / 5.5% among attributed) |
| 5 | Unit misclassification quantified | PASS (0 in sample; old system had no unit typing to misclassify -- see Section "Error-class breakdown") |
| 6 | Value misclassification quantified | PASS (same basis as #5) |
| 7 | Context misclassification quantified | PASS (same basis; environment now proximity/carry-forward based, verified via golden set) |
| 8 | Non-chemistry numeric contamination quantified | PASS (61.3% of claims have no numeric content at all; HTML-entity/date/reading-time noise sources identified and filtered) |
| 9 | Composite sentence extraction tested | PASS (golden set + real "FC/pH/TA/hardness/CYA" composite cases) |
| 10 | Range extraction tested | PASS ("between X and Y", "X-Y", "X to Y" all covered) |
| 11 | Example values distinguished from target values | PASS (EXAMPLE_INPUT/CALCULATED_VALUE claim_type) |
| 12 | Calculation values distinguished from claims | PASS |
| 13 | Safety values distinguished from target ranges | PASS (SAFETY_GUIDANCE claim_type; safety claims with no number produce no false range) |
| 14 | Pool/hot-tub context extraction tested | PASS |
| 15 | pH/ppm impossible mappings eliminated or justified | PASS (0/15 leaked in impossible-mapping check) |
| 16 | Temperature/ppm impossible mappings eliminated or justified | PASS |
| 17 | Volume/ppm contamination eliminated | PASS |
| 18 | Dosage/mass contamination eliminated | PASS |
| 19 | Golden test suite passes | PASS (100/100) |
| 20 | Extraction validator passes | PASS |
| 21 | Full build passes | PASS |
| 22 | Phase 7B passes | PASS |
| 23 | Phase 7C passes | PASS |
| 24 | Phase 7D validator passes | PASS |
| 25 | No production content rewritten | PASS |
| 26 | No URLs changed | PASS |
| 27 | No sitemap architecture changes | PASS |
| 28 | No language expansion | PASS |
| 29 | Phase 7D knowledge-layer impact documented | PASS |
| 30 | Clear GO/NO-GO decision documented | PASS (see Section 15) |

## 15. GO/NO-GO for Phase 7E

**NO-GO, pending user review of this report.** The extraction layer is now demonstrably reliable (golden set + impossible-mapping validator both green, root cause fixed and quantified), but per this phase's own instruction ("Do NOT proceed to Phase 7E unless the extraction layer is demonstrably reliable" and "DO NOT BEGIN PHASE 7E AUTOMATICALLY"), that determination is reported here for confirmation rather than acted on unilaterally.

## 16. Reports

- `reports/phase-7d-1/EXTRACTION-PIPELINE.md`
- `reports/phase-7d-1/SAMPLE-EXTRACTION-AUDIT.csv` (65 rows)
- `reports/phase-7d-1/pre-fix-chemistry-claims.csv` (preserved evidence)
- `reports/phase-7d-1/post-fix-chemistry-claims.csv` / `-summary.json`
- `reports/phase-7d-1/EXTRACTION-ERROR-ANALYSIS.md`
- `reports/phase-7d-1/PHASE-7D-KNOWLEDGE-IMPACT.md`
- `reports/phase-7d-1/extraction-validation-results.json`
- `reports/phase-7d-1/full-population-classification-summary.json`
- `reports/phase-7d-1/PHASE-7D-1-EXTRACTION-INTEGRITY.md` / `.json` (this report)
- `scripts/data/chemistry-extraction-golden-set.json` (100 cases)
- `scripts/phase-7d-1/extract-claims-v2.js`, `reconcile-claims-v2.js`, `build-golden-set.js`, `build-sample-audit.js`
- `scripts/validate-chemistry-extraction.js`
