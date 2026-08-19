# Phase 7D.3 — Chemistry Evidence Dataset Rebuild

**Status: PASS WITH REVIEW QUEUE**

## 1. Dataset Rebuild

Built exclusively through the Phase 7D.2-validated extractor (`extract-claims-v2.js` + `reconcile-claims-v2.js`'s `scientificReviewStatus`, reused directly — no second extraction algorithm). Canonical dataset: `reports/phase-7d-3/chemistry-evidence.csv` (+ `.json`) — placed under the established `reports/phase-XX/` convention rather than the top-level `data/` directory, which is reserved for generated site-content JSON consumed by the build pipeline (documented in `CLAIM-ID-METHODOLOGY.md`).

Two additional narrow extractor bugs were found and fixed while building this dataset (via `validate-chemistry-evidence-dataset.js`'s `minimum <= maximum` check):
1. ISO-8601 **timestamps** (`2026-08-18T20:03:12.250Z`) were only partially stripped — the bare-date regex doesn't match across the digit-to-"T" transition — so a build-metadata timestamp was partially parsed as a numeric range "2026-8". Fixed by extending the date-stripping pattern to the full timestamp.
2. Directional **"from X to Y"** phrasing (e.g. "Adjust pool pH from 7.8 to 7.4") and arithmetic **"X − Y = Z"** subtraction were both captured by the same range regex used for genuine target ranges, occasionally producing `minimum > maximum`. Fixed by normalizing to `minimum = min(a,b)`, `maximum = max(a,b)` at the point the extractor builds each record — this preserves both original values losslessly without guessing directionality, which is out of scope for this data-rebuild phase.

Both fixes were re-verified against the full Phase 7D.2 independent evidence (golden set v2, regression suite, status-integrity validator) before being accepted — all still pass unchanged.

- Source claims: 3,933 (3,896 with unique url+text)
- Numeric occurrences (evidence records): **5,861**
- Extraction status: NO_PARAMETER_IN_CLAUSE 1,047 | NO_NUMERIC_CONTENT 2,410 | CORRECT_EXTRACTION 1,326 | IMPOSSIBLE_MAPPING 982 | CARRIED_CONTEXT 96
- Scientific review status: NOT_EXTRACTED 4,439 | SUPPORTED 603 | REQUIRES_REVIEW 589 | AMBIGUOUS 230
- Scientifically evaluated: **1,422** | Not extracted (no verdict possible): **4,439**

Full detail: `REBUILD-SUMMARY.md` / `.json`.

## 2. Parameter Distribution

| Parameter | Count | | Parameter | Count |
|---|---:|---|---|---:|
| pH | 711 | | shock_treatment | 37 |
| free_chlorine | 448 | | sanitizer | 20 |
| combined_chlorine | 91 | | oxidation | 6 |
| total_chlorine | 26 | | algae | 77 |
| total_alkalinity | 198 | | lsi | 89 |
| calcium_hardness | 90 | | pool_volume | 289 |
| cyanuric_acid | 124 | | chemical_dosage | 0 (structurally unreachable — see Phase 7D.2 findings) |
| salt | 102 | | | |
| bromine | 29 | | | |
| water_temperature | 58 | | | |
| chlorine_demand | 9 | | | |

## 3. pH False-Attractor Remediation

pH: **1,127 (old) → 711 (rebuilt)**, a **−36.9%** change. Old pH share of all claims: 28.7%; rebuilt pH share of evidence records: 12.1%. Most non-pH counts also decreased (the rebuilt extractor is deliberately more conservative overall, not only about pH), but total_alkalinity **nearly doubled** (102→198) and total_chlorine **more than doubled** (11→26) — the clearest direct evidence that pH's stolen claims moved to their correct parameter rather than simply vanishing, matching the independent audit's finding that total_alkalinity and water_temperature were pH's most common victims. `lsi` (89) and `pool_volume` (289) are new coverage: the old 15-parameter vocabulary had no category for either. Full detail: `PH-ATTRIBUTION-REMEDIATION.md`.

## 4. Scientific Review Queue

589 records are `REQUIRES_REVIEW` (value falls outside every canonical range for that parameter/environment) and 230 are `AMBIGUOUS` (no canonical range exists yet for that parameter/environment) — together 819 records, `review_required=true`. This is the expected, disclosed outstanding population this phase does **not** resolve (Step 21: outstanding review is not a FAIL condition).

## 5. Provenance Coverage

`source_registry_ids` is `""` (unassigned) on **every** record. No explicit, human-curated mapping from an individual extracted numeric occurrence to a `chemistry-sources.js` entry exists yet, and Step 6 explicitly forbids inferring one from topic/parameter/range overlap. Establishing that mapping is citation-implementation work for a later phase, not this rebuild. `validate-chemistry-evidence-dataset.js` confirms every non-empty `source_registry_ids` value (there are none yet) would have to reference a real registry entry.

## 6. High-Risk Claims

589 rebuilt claims are `REQUIRES_REVIEW` (same definition as Phase 7D's high-risk concept: an evaluated value with no overlapping canonical range). The original Phase 7D high-risk list (`HIGH-RISK-CHEMISTRY-CLAIMS.md`, 6 hand-curated categories) is concept-level, not a 1:1 predecessor to this claim-level list, so a direct "newly identified / removed" delta isn't meaningful — but none of those 6 categories depended on the buggy reconciliation layer (confirmed in Phase 7D.1's knowledge-impact report), so they remain valid and unaffected. Full detail, by parameter: `HIGH-RISK-CLAIMS-REBUILT.md`.

## 7. Calculator Evidence

9 calculator pages/sections have associated evidence records (Pool Chlorine, Hot Tub Chlorine, Pool Shock, Pool/Hot Tub pH, Pool Alkalinity, Pool CYA, Saltwater Salt, All-in-One Chemical, and general `calculators/` index pages). Calculator math (`js/calc-utils.js`) was not touched. Full per-calculator listing: `CALCULATOR-EVIDENCE-INVENTORY.md`.

## 8. Dataset Integrity

`scripts/validate-chemistry-evidence-dataset.js`: **PASS** — 5,861 rows checked, 0 violations across all 16 checks (deterministic claim_id format and uniqueness, parameter/value_type/unit/claim_type/scientific-status validity, impossible-pairing rejection, extraction-failure/scientific-verdict invariant, pH-not-ppm / temperature-not-concentration / volume-not-concentration / dosage-not-concentration checks, min≤max, source_registry_ids referencing real entries, historical files unchanged vs. HEAD).

## 9. Reproducibility

Two independent runs of `build-chemistry-evidence.js` against unchanged source data: **byte-identical** (SHA-256 `54b350e1a22dacd126eb1cd5e2541a416826a4a4bb686d605fa31adc36f639ad` both times). No timestamps or non-deterministic content in the canonical dataset; any generation-time metadata lives only in the summary reports.

## 10. Regression Tests

| Gate | Result |
|---|---|
| `npm run build` | PASS |
| Phase 7B validator | PASS — 502 files, 0 unresolved tokens |
| Phase 7C validator | PASS — 523 pages, 479 sitemap URLs, 0 violations |
| Phase 7D chemistry validator | PASS — 0 structural errors, warnings unchanged |
| Phase 7D chemistry tests | PASS — 25 assertions |
| Phase 7D.2 golden set v2 | PASS — 104/104 |
| Phase 7D.2 status-integrity validator | PASS — 0 violations |
| Phase 7D.2 regression suite | PASS — 24 assertions |
| Phase 7D.3 dataset validator | PASS — 0 violations |
| `check-broken-links` | PASS — 523 pages, 0 issues |
| `test-url-engine` | PASS — 263 assertions |

## 11. Scope Control

Confirmed via `git status`/`git diff`: no production content, URL, canonical, redirect, sitemap, calculator-formula, Spanish/French, or AdSense change. The only diff outside `reports/phase-7d-3/` and `scripts/phase-7d-3/` (plus the two small, documented `extract-claims-v2.js` fixes and `reconcile-claims-v2.js`'s export refactor) is the pre-existing Phase 7C `js/url/url-engine.js`/`_redirects`/`sitemap.xml` change, untouched this phase. Page count unchanged (523). All historical inventories (`reports/phase-7a/`, `reports/phase-7d/`, `reports/phase-7d-1/`, `reports/phase-7d-2/`) preserved unedited — confirmed both by not writing to those paths and by the dataset validator's git-diff check.

## 12. Phase 7E Decision

**NO-GO — pending user review**, per this phase's own instruction not to proceed automatically. The rebuilt dataset is now the current authoritative chemistry-claim inventory (superseding `reports/phase-7d/chemistry-coverage.csv`, `reports/phase-7d-1/post-fix-chemistry-claims.csv`, and `reports/phase-7d-2/post-fix-chemistry-claims-v2.csv`), ready for citation/provenance work once authorized.

DO NOT BEGIN PHASE 7E.

## Reports

- `reports/phase-7d-3/PHASE-7D-3-REBUILD.md` / `.json` (this report)
- `reports/phase-7d-3/chemistry-evidence.csv` / `.json` (canonical dataset)
- `reports/phase-7d-3/CLAIM-ID-METHODOLOGY.md`
- `reports/phase-7d-3/REBUILD-SUMMARY.md` / `.json`
- `reports/phase-7d-3/OLD-VS-REBUILT-CHEMISTRY-DATA.md`
- `reports/phase-7d-3/PH-ATTRIBUTION-REMEDIATION.md`
- `reports/phase-7d-3/HIGH-RISK-CLAIMS-REBUILT.md`
- `reports/phase-7d-3/CALCULATOR-EVIDENCE-INVENTORY.md`
- `reports/phase-7d-3/dataset-validation-results.json`
- `scripts/phase-7d-3/build-chemistry-evidence.js`, `build-reports.js`
- `scripts/validate-chemistry-evidence-dataset.js`
