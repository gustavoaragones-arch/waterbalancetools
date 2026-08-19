# Phase 7D.1 — Phase 7D Knowledge-Layer Impact Assessment

## What was NOT contaminated (KEEP)

| File | Disposition | Reason |
|---|---|---|
| `scripts/data/chemistry-knowledge.js` (15 parameters) | **KEEP** | Hand-authored from live CDC/PHTA/NPIC research (Phase 7D Step 16), not derived from the extraction pipeline. |
| `scripts/data/chemistry-sources.js` (9 sources) | **KEEP** | Same -- direct research output, no dependency on claim extraction. |
| `scripts/data/chemistry-ranges.js` (23 ranges) | **KEEP** | Same. Including `range-cya-saltwater-outdoor`, which was discovered via `scripts/phase-7d/scan-chemistry-sources.js` (a direct source-code numeric scan of `scripts/data/*.js`), **not** via the contaminated `reconcile-claims.js` whole-sentence classifier -- this finding is unaffected by the bug. |
| `scripts/data/chemistry-claims.js` (15 canonical claims) | **KEEP** | Hand-authored archetypal claims, cross-referenced against the (unaffected) ranges/sources files. |
| `scripts/chemistry/chemistryKnowledge.js`, `renderSources.js` | **KEEP** | Pure read/render API over the above; no claim-extraction dependency. |
| `reports/phase-7d/chemistry-source-inventory.csv/.json` | **KEEP** | Produced by the direct source-code scanner, not the sentence-level claim extractor. |
| `reports/phase-7d/chemistry-consistency-matrix.csv` | **KEEP** | Derived entirely from `chemistry-ranges.js` (unaffected). |
| `reports/phase-7d/HIGH-RISK-CHEMISTRY-CLAIMS.md`, `GENERATOR-CHEMISTRY-MIGRATION-PLAN.md`, `SOURCE-SELECTION-POLICY.md`, `CHEMISTRY-CONFLICT-POLICY.md` | **KEEP** | Narrative reports grounded in the unaffected data above and in direct reading of production source files, not the contaminated pipeline output. |

## What WAS contaminated (REBUILD -- superseded in this phase)

| File | Disposition | Reason |
|---|---|---|
| `reports/phase-7d/chemistry-coverage.csv` / `.json` | **REBUILD** (superseded by `reports/phase-7d-1/post-fix-chemistry-claims.csv`) | This is the *only* Phase 7D artifact produced by `scripts/phase-7d/reconcile-claims.js`, the file containing the whole-sentence-keyword-search bug this phase exists to fix. Its `parameter` column and resulting `SUPPORTED`/`AMBIGUOUS`/`REQUIRES_REVIEW` counts are unreliable and should not be cited going forward. **Not deleted** (Phase 7A/7D evidence-preservation policy), but its Section 7 numbers in `PHASE-7D-CHEMISTRY-KNOWLEDGE.md` are now formally superseded -- see the correction note added to that file. |
| `PHASE-7D-CHEMISTRY-KNOWLEDGE.md` / `.json`, Section 7 ("Claim Mapping") only | **REVISE (correction note added, not rewritten)** | The specific counts in that section (32 SUPPORTED / 146 CONTEXTUAL / 3,231 AMBIGUOUS / 524 REQUIRES_REVIEW / 0 VERIFIED) were computed by the contaminated classifier. A dated correction note has been added at the top of both files pointing to this report; the original numbers are left in place (not silently edited) so the historical record of what Phase 7D actually reported is preserved, with the correction clearly visible alongside it. |
| All other sections of `PHASE-7D-CHEMISTRY-KNOWLEDGE.md` | **KEEP, no impact** | Sections 2-6, 8-16 (knowledge layer, parameters, context model, ranges, sources, high-risk claims, calculator audit, migration plan, validators, tests, build, re-audit, scope control, acceptance gates) do not depend on the claim-reconciliation numbers and are unaffected. |

## Corrected numbers (this phase)

See `reports/phase-7d-1/post-fix-chemistry-claims.csv` and `post-fix-chemistry-claims-summary.json` for the full corrected dataset. Headline: 597 claims now confirmed `SUPPORTED` (vs. 32 originally reported -- the original number was itself an *undercount*, not an overcount, because the pH-attractor bug buried many genuinely-supportable non-pH claims under an incorrect "ph" label that then failed to match any pH range), 616 `REQUIRES_REVIEW`, 2,641 `AMBIGUOUS` (no canonical range exists yet for that parameter/context), 2,206 `NOT_EXTRACTED` (the extractor could not confidently identify a parameter for that numeric occurrence, and therefore -- correctly -- never assigned it a scientific review status at all).

## RESEARCH_REQUIRED

None of the canonical knowledge-layer records themselves require new research as a *direct result* of this phase's extraction fix (the extraction bug affected claim *reconciliation*, not the canonical data). The pre-existing `REQUIRES_REVIEW` status on 6 range records (`range-ph-pool-narrow-operational`, `range-cc-pool-hottub-max`, `range-ta-hottub`, `range-ch-residential-practical`, `range-cya-residential-routine-outdoor`, `range-salt-generic-operating`, `range-shock-breakpoint-rule-of-thumb`) and the CYA saltwater discrepancy remain exactly as reported in Phase 7D -- still pending real research, unrelated to this phase's fix.
