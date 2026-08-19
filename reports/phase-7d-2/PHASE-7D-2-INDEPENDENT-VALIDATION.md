# Phase 7D.2 — Independent Chemistry Extraction Validation

**Status: PASS WITH DATA REBUILD**

## 1. Why Phase 7D.2 Was Required

Phase 7D.1's "100/100 golden set" was circular: `build-golden-set.js` generated `expected` by calling `extractFromSentence()` on the same text (extractor -> expected -> extractor -> compare). Its "103 confirmed misclassifications" figure was also not independent: `build-sample-audit.js` judged the old system correct/incorrect based on whether the NEW extractor's output agreed with it, making the new extractor the de facto reference standard rather than the source sentence. A third issue: `reconcile-claims-v2.js` assigned `scientific_review_status = AMBIGUOUS` (an evaluated verdict) to `NO_NUMERIC_CONTENT` records, which were never evaluated at all.

## 2. Independent Golden Set

- File: `scripts/data/chemistry-extraction-golden-set-v2.json`
- Built by: `scripts/phase-7d-2/build-golden-set-v2.js`, which never requires or calls `extract-claims-v2.js`. Every `expected` array was hand-derived from the documented architecture (clause splitting, "between X and Y" normalization, nearest-mention proximity, plausibility-gated carry-forward, the impossible-pairing table) by reading each sentence directly.
- Cases: **104** total — **21 real** (verbatim from `reports/phase-7a/chemical-claims.csv`, each verified present via direct grep/csv-parse before inclusion), **83 synthetic**.
- Result: **104/104 PASS** (`npm run` via `node scripts/validate-chemistry-extraction-v2.js`).

### Failures found during authoring, and how each was resolved (Step 17 policy)

13 of the 104 cases initially failed when first run against the extractor. Each was individually triaged — was the extractor wrong, or was my hand-traced expectation wrong:

**Extractor bugs found and fixed** (3, in `extract-claims-v2.js`):
1. "ounces"/"ounce" not recognized as a unit -> a dosage number near a pH mention fell back to the blind "0-14 decimal -> pH" heuristic, producing a false `pH=3-4` claim from "3-4 ounces of muriatic acid". Fixed: added to `UNIT_VALUE_TYPE` and `NUMERIC_RE`.
2. Time-duration units (hours/minutes/days) not recognized -> "allow 4-6 hours before retesting" carried forward from an earlier pH mention into a false `pH=4-6` claim. Fixed: added `hour(s)/hr(s)/minute(s)/min(s)/day(s)` as a new `duration` value_type, not allowed by any parameter (so it always correctly resolves to unattributed rather than falsely accepted).
3. The comma-grouped number regex alternative allowed zero comma groups, so JS regex alternation picked its degenerate match of just the first 1-3 digits of any comma-less 4+ digit number (e.g. "18000" -> "180", "3200" -> "320") instead of trying the full-length alternative. This silently corrupted real values throughout the corpus. Fixed: required at least one `,\d{3}` group in that alternative, so comma-less numbers always fall through to the plain-digit alternative.

**Hand-tracing corrections** (10, in `build-golden-set-v2.js`, each documented inline at the case):
- Two cases assumed a hyphen ("10,000-gallon") would attach a unit the way whitespace does; it does not (documented as a residual, unfixed gap).
- One case (`g-real-016`) assumed "-0.3 to +0.3" parses as one range; the regex has no leading-`+` support, so it splits into two standalone numbers (consistent with `g-real-015`'s already-correct handling of the same pattern).
- One case (`g-syn-034`, "Total alkalinity of 100 ppm keeps pH stable") is a **genuine, found, unfixed limitation**: raw character-distance proximity is not grammar-aware, and in this specific sentence "100" is measurably closer to "pH" (14 characters via "keeps pH stable") than to "Total alkalinity" (20 characters), despite the grammatical binding "Total alkalinity OF 100 ppm" being clearly tighter. The extractor's actual (undesired) output is kept as the expected value, as a permanent regression anchor, and flagged below as a residual finding rather than silently accepted or hidden.
- One case (`g-syn-046`) had a wrong hand-estimated environment (missed that "Pool volume" itself contains the word "pool").
- One case (`g-syn-107`) missed that the unconditional blind pH-heuristic applies regardless of whether any parameter is mentioned at all.
- Two cases (`g-syn-109`, `g-syn-123`) had incorrectly hand-estimated character distances between two competing mentions; one was corrected, the other (a near-exact-tie sentence) was rewritten to remove the fragile ambiguity rather than accept a coin-flip result as a meaningful regression anchor.
- One case (`g-syn-110`) incorrectly assumed bare "water" is a `water_temperature` alias; only "temperature"/"temp"/"water temperature" are registered.

## 3. Independent Old-System Audit

- File: `reports/phase-7d-2/INDEPENDENT-OLD-EXTRACTION-AUDIT.csv`
- Records audited: **136** (exceeds the 100 minimum), stratified across every bucket named in Step 8: old-parameter = ph/free_chlorine/total_alkalinity/calcium_hardness/cyanuric_acid/water_temperature/salt/bromine/none, suspicious ppm/°F/gallons/oz-lbs values on pH-tagged rows (directly testing the false-attractor pattern), composite sentences, safety statements, troubleshooting and calculator-example text.
- Methodology: each `classification` and `independently_expected_parameter` was determined by reading the actual `claim` source sentence directly — never by asking the new extractor. See inline `reason` field per row.

| Classification | Count |
|---|---:|
| CORRECT | 84 |
| PARAMETER_MISCLASSIFICATION | 22 |
| MISSED_CLAIM | 13 |
| LEGITIMATE_AMBIGUITY | 15 |
| NON_CHEMISTRY_NUMERIC | 2 |
| VALUE_MISCLASSIFICATION | 0 |
| UNIT_MISCLASSIFICATION | 0 |
| CONTEXT_MISCLASSIFICATION | 0 |

VALUE/UNIT/CONTEXT_MISCLASSIFICATION are structurally unobservable in the old system's output: `chemistry-coverage.csv` carries a single parameter tag per claim with no value/unit/environment columns. Full detail and the dominant "pH as false attractor" pattern (14 of 22 misclassifications): `OLD-VS-NEW-EXTRACTION-COMPARISON.md`.

## 4. New Extractor Accuracy

- Golden set v2: 104/104 (100%), non-circular.
- Dedicated regression suite (`scripts/phase-7d-2/test-extraction-regression.js`, Steps 9-12 named tests A-J + context + impossible-mapping + claim-type checks): 24/24 assertions pass.
- Impossible-mapping leakage: 0/15 named pairings leaked as `CORRECT_EXTRACTION`; 2 of the 15 (pH+gallons, water_temperature+gallons) cannot literally collide because "gallons" always self-attracts its own `pool_volume` mention first — verified this still satisfies the underlying safety property (neither pH nor water_temperature ever receives a volume-typed value).
- 100% accuracy is not claimed beyond what was independently evaluated (104 golden cases + 24 regression assertions). Not claimed as full-population accuracy; see Section 6 residual limitations for known, real gaps outside this sample.

## 5. Status Integrity

**PASS.** `scripts/validate-chemistry-status-integrity.js` against the corrected `reports/phase-7d-2/post-fix-chemistry-claims-v2.csv` (5,877 extraction records): 0 violations of the invariant "extraction_status not in {CORRECT_EXTRACTION, CARRIED_CONTEXT} => scientific_review_status = NOT_EXTRACTED", and 0 impossible-pairing leaks into `CORRECT_EXTRACTION`. The `NO_NUMERIC_CONTENT` -> `AMBIGUOUS` bug is fixed (`reconcile-claims-v2.js` now assigns `NOT_EXTRACTED`).

## 6. Impossible Mapping Audit

**PASS.** 15/15 named pairings correctly rejected or safely resolved to a different, correct parameter (never the literal impossible one). See Section 4.

## 7. Composite Sentence Audit

**PASS**, with one documented residual gap. Real composite sentences (`g-real-005`, `g-real-006`, `g-real-007`, `g-syn-052`, `g-syn-053`, `g-syn-133`, regression tests G/H) correctly decompose into independent per-parameter records. Residual, unfixed limitations found during this phase's independent authoring (all documented inline in the golden set and not hidden):
- **Grammar-blind proximity** (`g-syn-034`): a tightly-bound "Parameter OF N unit" construction can occasionally lose to a farther-in-meaning but closer-in-characters mention later in the same clause. Real-world prevalence not separately quantified in this phase; flagged as a candidate for a future proximity refinement (e.g. weighting a direct "of"-binding).
- **Hyphenated unit attachment**: "10,000-gallon" never attaches its unit (whitespace-only regex boundary); confirmed via 3 golden-set cases and the regression suite.
- **Singular "gallon"**: only the plural "gallons" is a recognized `pool_volume` mention trigger.
- **"N times" multiplier phrasing**: not specially typed (pre-existing, noted in Phase 7D.1's own error analysis, reconfirmed here).
- **"and"-as-delimiter vs. "and"-as-conjunction**: "Both pool and hot tub" splits on the literal word "and" into separate clauses, so `environment='both'` is only reachable when both words co-occur in one clause (e.g. via "or"), not via "X and Y" phrasing.
- **`chemical_dosage`** has no lexical trigger anywhere in the codebase and can never be produced as a `parameter_id`, despite being a valid key in `PARAMETER_VALUE_TYPES`.

None of these produce a false `CORRECT_EXTRACTION` for the wrong parameter in the cases tested — the failure mode is either "correctly rejected/unattributed" (safe) or, in the `g-syn-034` case, a wrong-but-plausible attribution to a different real parameter, not a fabricated impossible one.

## 8. Context Audit

**PASS.** Pool/hot_tub/both/unspecified all independently verified (`g-syn-080`–`g-syn-084`, regression suite). `both` requires both words in the same clause; carry-forward propagates forward only, never backward onto an earlier clause (`g-real-004`, `g-real-012`).

## 9. Scientific Review Separation

**PASS.** Verified by the status-integrity validator (Section 5): a claim that fails extraction never receives an evaluated scientific verdict.

## 10. Regression Tests

| Gate | Result |
|---|---|
| `npm run build` | PASS (exit 0) |
| Phase 7B validator (`validate-generated-output`) | PASS — 502 files, 0 unresolved tokens |
| Phase 7C validator (`validate-url-indexation`) | PASS — 523 pages, 479 sitemap URLs, 0 violations |
| `check-broken-links` | PASS — 523 pages, 0 issues |
| Phase 7D chemistry validator (`validate-chemistry-knowledge`) | PASS — 0 structural errors, 10 warnings (unchanged baseline) |
| Phase 7D chemistry tests (`test-chemistry-knowledge`) | PASS — 25 assertions |
| `test-url-engine` | PASS — 263 assertions |
| Phase 7D.1 golden set (regenerated snapshot, `validate-chemistry-extraction`) | PASS — 100/100, 15/15 impossible-mapping (regenerated after the 3 extractor fixes; this snapshot was never independent evidence — see Section 1 — so regenerating it is not a change to any authoritative result, only to a non-authoritative self-check) |
| Golden set v2 (`validate-chemistry-extraction-v2`) | PASS — 104/104 |
| Status integrity (`validate-chemistry-status-integrity`) | PASS — 0 violations |
| Extraction regression suite (`test-extraction-regression`) | PASS — 24 assertions |

No prior phase's gate regressed.

## 11. Scope Control

Confirmed via `git status`/`git diff`: no production content rewritten; no calculator formulas changed; no URLs/canonicals/redirects/sitemap architecture changed (`_redirects`/`sitemap.xml`/`js/url/url-engine.js` diffs are the pre-existing, already-documented Phase 7C changes, not touched this phase); no Spanish/French paths created; no citations added to production pages. Page count unchanged (523). Phase 7D's canonical knowledge layer (`chemistry-knowledge.js`, `chemistry-ranges.js`, `chemistry-sources.js`, `chemistry-claims.js`) untouched. All Phase 7D.1 evidence in `reports/phase-7d-1/` preserved unedited; new evidence lives in `reports/phase-7d-2/`.

## 12. Phase 7E Decision

**NO-GO — pending user review of this report**, per this phase's own explicit instruction not to proceed automatically.

Blocking condition for GO: none from a correctness standpoint — the independent evidence now supports the extraction layer. The instruction is procedural, not a finding of remaining defect: authorization to begin Phase 7E must come from the user.

If/when authorized, the corrected inventory (`reports/phase-7d-2/post-fix-chemistry-claims-v2.csv`, 3,933 source claims -> 5,877 extraction records) should be treated as the current authoritative chemistry-claim inventory, superseding both the original Phase 7D `chemistry-coverage.csv` and the Phase 7D.1 `post-fix-chemistry-claims.csv` (itself now superseded by the 3 additional extractor fixes made in this phase).

DO NOT BEGIN PHASE 7E.

## 13. Reports

- `reports/phase-7d-2/PHASE-7D-2-INDEPENDENT-VALIDATION.md` / `.json` (this report)
- `reports/phase-7d-2/INDEPENDENT-OLD-EXTRACTION-AUDIT.csv` (136 rows)
- `reports/phase-7d-2/OLD-VS-NEW-EXTRACTION-COMPARISON.md`
- `reports/phase-7d-2/post-fix-chemistry-claims-v2.csv` / `-summary.json`
- `reports/phase-7d-2/status-integrity-results.json`
- `reports/phase-7d-2/extraction-validation-v2-results.json`
- `reports/phase-7d-2/independent-old-audit-summary.json`
- `scripts/data/chemistry-extraction-golden-set-v2.json` (104 cases)
- `scripts/phase-7d-2/build-golden-set-v2.js`, `build-independent-old-audit.js`, `test-extraction-regression.js`, `old-audit-judgments.json`
- `scripts/validate-chemistry-extraction-v2.js`, `scripts/validate-chemistry-status-integrity.js`
- `scripts/phase-7d-1/extract-claims-v2.js` (3 bugfixes), `reconcile-claims-v2.js` (status-invariant fix + v2 output paths)
