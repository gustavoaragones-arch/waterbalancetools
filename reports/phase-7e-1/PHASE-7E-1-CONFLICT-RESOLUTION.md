# Phase 7E.1 — Provenance Conflict Resolution & Evidence Coverage

**Status: PASS WITH REVIEW QUEUE**

## 1. Conflict Inventory

499 SOURCE_CONFLICT records classified (`reports/phase-7e-1/conflicting-claims.csv`). Methodology: pattern rules grounded in individually-read examples (48 records — the 43 hand-reviewed in Phase 7E plus 5 new Tier-1 reviews this phase — informed and validated the rules before they were applied to the full population), fully disclosed in `build-conflict-inventory.js`.

| conflict_type | Count | | resolution_status | Count |
|---|---:|---|---|---:|
| RANGE_MISMATCH | 133 | | UNREVIEWED | 133 |
| CLAIM_FAMILY_GAP | 82 | | REQUIRES_EXPERT_REVIEW | 89 |
| EXTRACTION_ARTIFACT | 169 | | NOT_A_CHEMISTRY_CLAIM | 241 |
| UNSUPPORTED_PRODUCTION_CLAIM | 79 | | FALSE_CONFLICT | 31 |
| CONTEXT_MISMATCH | 31 | | SOURCE_CONFLICT_REMAINS | 5 |
| SOURCE_CONFLICT | 5 | | | |

**The headline finding**: of 499 mechanically-flagged "conflicts," only **5** are genuine, confirmed disagreements between production content and a confirmed authoritative source (`SOURCE_CONFLICT_REMAINS`). 241 aren't chemistry claims at all (list numbering, product specs, formula arithmetic, navigation noise — extraction picking up a real number that was never a chemistry assertion). 82 are the shock claim-family gap (Step 3). 31 are threshold/comparison phrasing correctly outside a target range by design. 133 remain genuinely unclassified and need individual review — an honest, bounded residual, not zero and not overclaimed as resolved.

## 2. Shock Claim Family

**Decision: do not invent a general numeric shock-treatment FC range** — no primary source confirms one. **Fixed a real gap**: added `claim-shock-fecal-incident-response` to `chemistry-claims.js`, referencing the previously-orphaned (but real, sourced) `range-shock-cdc-fecal-incident-response` (CDC MAHC, 20 ppm / 13-28 hrs). The routine-target, breakpoint-ratio-rule, incident-response, and general-residential-shock claim families are now explicitly distinguished, not collapsed. Full reasoning: `SHOCK-CLAIM-FAMILY-DECISION.md`.

## 3. Tier 1 Review

**30/30 Tier-1 conflicts (calculators + authority charts) individually reviewed — 0 remain UNREVIEWED.** New finding: the Hot Tub Chemical Levels Chart's "CYA 30-50 ppm (if using unstabilized chlorine)" row genuinely conflicts with CDC's guidance against CYA in hot tubs at all — flagged `SOURCE_CONFLICT_REMAINS` for editorial decision, production content not changed automatically.

## 4. Calculator Review

All 5 priority calculators re-organized into SUPPORTED TARGET RANGE / FORMULA ASSUMPTION / DOSING CONSTANT / EXPERT REVIEW REQUIRED (`CALCULATOR-REVIEW-QUEUE.md`). No formula modified. Every dosing constant across all 5 calculators remains an open ticket — a source-supported target range never validates the formula that doses toward it.

## 5. Authority Charts

All 8 charts reviewed at the per-row level, including the 3 not covered in Phase 7E (`AUTHORITY-CHART-REVIEW.md`). One new content finding (hot-tub CYA, above); one extraction artifact resolved (Total Alkalinity/Calcium Hardness table cross-attribution on `charts/pool-chemical-levels-chart.html`); the `pool-water-balance-chart.html` flow-diagram "conflicts" are confirmed to be step-numbering artifacts, not content issues.

## 6. Table Extraction Limitation

Quantified: 129 evaluated evidence records across 55 pages carry table-like structure; 2 confirmed false attributions found via individual review; 35 pre-existing conflicts among them now quarantined as `EXTRACTION_ARTIFACT`/`REQUIRES_EXPERT_REVIEW` rather than confident `RANGE_MISMATCH`. Judged safe to leave in place temporarily (no impossible pairing or fabricated citation results from it). Not redesigned — a remediation ticket is documented, not implemented, in `TABLE-EXTRACTION-LIMITATION.md`.

## 7. Review Queue

4,686 UNREVIEWED records segmented (`REVIEW-QUEUE-STRATEGY.md`): **A** 267 (Tier-1 pages, next priority), **B** 185 (genuine source-search candidates — pool_volume/LSI/water_temperature/chlorine_demand topic coverage), **C** 1,661 (already safely rejected/unattributed by extraction, low risk by construction), **D** 631 (programmatic — governed by the deferred claim-family-inheritance strategy), **E** 58 (example/calculation instances, a different claim type), **F** 1,884 (no numeric content, nothing to review). Category F is explicitly not "scientifically false" — it's "nothing to check."

## 8. Provenance Coverage

Topline counts are unchanged from Phase 7E (575 DIRECT, 0 CONTEXTUAL by the mechanical matcher, 499 CONFLICTING, 101 EXPERT_REVIEW_REQUIRED, 4,686 UNREVIEWED) — this phase did not change the underlying range-overlap classifier, it triaged what the 499 CONFLICTING actually mean. That triage is the real progress: an opaque number became a mostly-understood, prioritized population (5 genuine conflicts, 82 architectural gaps, 133 still open, 279 confirmed not-actually-conflicts).

## 9. Production Changes

**Zero production content pages changed this phase.** Two genuine discrepancies were found (combined-chlorine 0.5-vs-0.4 ppm; hot-tub CYA guidance) and both were deliberately left for editorial decision rather than auto-corrected, per Step 12's explicit bar (context verified, but resolving an architectural conflict is not sufficient grounds for a content change on its own). Knowledge-layer changes only: `chemistry-claims.js` (+1 claim), `chemistry-ranges.js` (0 change this phase — the CC range upgrade happened in Phase 7E, not here).

## 10. Validators

`scripts/validate-provenance-resolution.js`: **PASS** — 499 conflicts checked, 0 violations (no fabricated resolutions, no unresolved Tier-1 conflicts, no shock claims silently left mapped to the routine range, no environment-source mismatches left unexplained, no duplicate resolutions).

## 11. Regression

`npm run build`, Phase 7B/7C/7D validators and tests, Phase 7D.2 golden-set-v2/status-integrity/regression-suite, Phase 7D.3 dataset validator, Phase 7E provenance validator, new Phase 7E.1 validator, broken-link validator, URL-engine tests — **all PASS**.

## 12. Scope Control

Confirmed: no Spanish/French, no URL/canonical/redirect/sitemap-architecture change (the `_redirects`/`sitemap.xml` diffs are pre-existing build-regeneration churn, same pattern documented in every prior phase — no new redirect *rules*, only re-run of existing ones plus timestamp regeneration), no calculator-formula change (`js/calc-utils.js` diff: none), no AdSense change, no broad content rewrite, no programmatic mass citation injection.

## Phase 7F Decision

**NO-GO — pending user review**, per this phase's own instruction not to proceed automatically.

DO NOT BEGIN PHASE 7F.

## Reports

- `reports/phase-7e-1/PHASE-7E-1-CONFLICT-RESOLUTION.md` / `.json` (this report)
- `reports/phase-7e-1/conflicting-claims.csv`, `conflict-inventory-summary.json`
- `reports/phase-7e-1/SHOCK-CLAIM-FAMILY-DECISION.md`
- `reports/phase-7e-1/CALCULATOR-REVIEW-QUEUE.md`
- `reports/phase-7e-1/AUTHORITY-CHART-REVIEW.md`
- `reports/phase-7e-1/TABLE-EXTRACTION-LIMITATION.md`
- `reports/phase-7e-1/REVIEW-QUEUE-STRATEGY.md`, `review-queue-segmentation.json`
- `reports/phase-7e-1/provenance-resolution-validation-results.json`
- `scripts/phase-7e-1/build-conflict-inventory.js`, `manual-conflict-reviews.json`, `build-review-queue-strategy.js`
- `scripts/validate-provenance-resolution.js`
- `scripts/data/chemistry-claims.js` (+1 claim family: `claim-shock-fecal-incident-response`)
