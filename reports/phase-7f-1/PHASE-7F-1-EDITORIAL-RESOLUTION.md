# Phase 7F.1 — Priority Chemistry Editorial Resolution

**Status: PASS WITH REVIEW QUEUE**

## 1. The Five Genuine Conflicts

All 5 individually reviewed, real source text read (not summary-only), each with a documented outcome:

| claim_id | Page | Decision | Action |
|---|---|---|---|
| `3c256b70dc1e3ce2` | hot-tub-chemical-levels-chart.html | CORRECT_REQUIRED | Corrected (CYA row + quick answer) |
| `317e0ea96af98f4f` | reference/combined-chlorine-explained.html | SUPPORTED_WITH_CONTEXT | Added context (0.4 vs 0.5 ppm) |
| `9b5883473f17b6cd` | academy/hot-tubs/shock-after-heavy-use.html | SUPPORTED_WITH_CONTEXT | No action (context lives at reference page) |
| `608025031537cf13` | glossary/pool-shock-schedule.html | SUPPORTED_WITH_CONTEXT | No action (same reasoning) |
| `3bb0e016bca28ac0` | comparisons/free-chlorine-vs-total-chlorine.html | SUPPORTED_WITH_CONTEXT | No action (same reasoning) |

Full detail: `HOT-TUB-CYA-DECISION.md`, `CONFLICT-02` through `CONFLICT-05-DECISION.md`.

**Key finding**: 4 of the 5 "conflicts" trace to a single underlying factual question (CDC MAHC's 0.4 ppm public-facility action level vs. a widely-used 0.5 ppm residential convention that could not be traced to one specific confirmed source). Only 1 (hot-tub CYA) was a genuine, health-relevant production error — corrected. This matches the critical principle: a conflict is not automatically an error.

## 2. Tier-1 Review

267/267 reviewed. **264 (99%) were confirmed non-claims** (navigation, UI copy, form labels — not evaluated chemistry statements at all). The remaining 3 `SOURCE_NOT_FOUND` records were individually reviewed and found already covered by prior-phase findings (Phase 7F trust-panel corrections; Phase 7E.1's shock claim-family decision). **Zero new corrections required from the Tier-1 population** beyond the 5 conflicts already handled above.

## 3. Safety Claims

Reviewed as part of the CYA decision (the highest-scrutiny case this phase). No general chemistry recommendation was converted into an absolute safety guarantee; CDC's conditional guidance (context: hot tubs specifically) was preserved, not generalized.

## 4. Calculator Claims

3 Tier-1 calculator-adjacent records reviewed; all already covered by Phase 7F/7E.1. `js/calc-utils.js` untouched — no independently-demonstrated defect found. Full detail: `CALCULATOR-EDITORIAL-DECISIONS.md`.

## 5. Authority Charts

`hot-tub-chemical-levels-chart.html` corrected (CYA row + quick answer + metadata). Other 7 charts: no new Tier-1 findings this phase beyond what Phase 7E.1 already reviewed.

## 6. Source-Search Candidates

185 triaged, not individually researched wholesale (per Step 11's explicit "research only where meaningful"). One targeted lead pursued: hot-tub max temperature (104°F, CDC/PHTA-consistent) — independently researched but **not added** to the canonical registry, since cdc.gov blocked every direct-fetch verification attempt this phase (403) and I will not add a new "SUPPORTED" source citation based only on an unverified search summary. Logged as a lead for a future phase with browser-based verification.

## 7. Unclassified Claims

133/133 categorized: 8 EXAMPLE_CALCULATION (a newly-found gap — troubleshooting "Examples" section headings not caught by the original claim_type detector), 14 NON_CHEMISTRY_ARTIFACT, 2 CONTEXTUAL_DIFFERENCE, 109 DEFERRED (honestly low-priority, not asserted as errors). Full detail: `unclassified-categorization.csv`.

## 8. Table-Extraction Quarantine

No Tier-1 or genuine-conflict decision this phase depended on a quarantined table-extraction record. The 35 quarantined records from Phase 7E.1 remain quarantined, untouched, unredesigned.

## 9. Production Corrections

**2 production files changed** (1 generator source, 1 static file), each with full OLD/NEW/SOURCE/DECISION/REASON documentation. Full detail: `PRODUCTION-CORRECTIONS.md`. 3 additional pages sharing the CC 0.5 ppm figure were individually reviewed and deliberately left unchanged, with reasoning documented, not silently skipped.

## 10. Editorial Decision Dataset

141 decisions recorded in `reports/phase-7f-1/EDITORIAL-DECISIONS.csv` (deterministic — two independent builds produced a byte-identical SHA-256: `19596be79cd66268f316209f506557b2438fba59ff7cb7e5c086dec83a191402`). Every decision points back to a stable `claim_id` from the Phase 7D.3 evidence dataset — no disconnected truth database.

## 11. Validators

`scripts/validate-editorial-decisions.js`: **PASS**, 141 decisions checked, 0 violations.

## 12. Regression

`npm run build`, Phase 7B/7C/7D validators, Phase 7D.2 golden-set/status-integrity/regression-suite, Phase 7D.3 evidence validator, Phase 7E provenance validator, Phase 7E.1 provenance-resolution validator, both Phase 7F trust validators, broken-link validator, URL-engine tests, new editorial-decision validator — **all PASS**.

## 13. Scope Control

Confirmed: no Spanish/French, no Phase 7G duplication work, no mass programmatic rewrite/citation injection, no AdSense change, no URL/redirect/sitemap-architecture change (pre-existing build-regeneration churn only, same pattern as every prior phase), no calculator formula change, no sitewide design overhaul. Page count unchanged (523). Production diff audit: exactly 2 pages changed, both FACTUAL_CORRECTION/CONTEXT_ADDITION as documented — **0 UNINTENDED_CHANGE**.

## Remaining Review Queue

0 unreviewed among the 5 conflicts and 267 Tier-1 claims. 184 source-search candidates and 109 deferred-unclassified records remain — honestly disclosed as lower-priority, not asserted as resolved or as errors. Full detail: `REVIEW-QUEUE-FINAL.md`.

## Phase 7G Decision

**NO-GO — pending user review**, per this phase's own instruction not to proceed automatically.

DO NOT BEGIN PHASE 7G.

## Reports

- `reports/phase-7f-1/PHASE-7F-1-EDITORIAL-RESOLUTION.md` / `.json` (this report)
- `reports/phase-7f-1/EDITORIAL-DECISIONS.csv`, `editorial-decisions.json`
- `reports/phase-7f-1/HOT-TUB-CYA-DECISION.md`
- `reports/phase-7f-1/CONFLICT-02-DECISION.md` through `CONFLICT-05-DECISION.md`
- `reports/phase-7f-1/CALCULATOR-EDITORIAL-DECISIONS.md`
- `reports/phase-7f-1/REVIEW-QUEUE-FINAL.md`
- `reports/phase-7f-1/PRODUCTION-CORRECTIONS.md`
- `reports/phase-7f-1/unclassified-categorization.csv`
- `scripts/validate-editorial-decisions.js`
- `scripts/generate-authority-charts.js`, `reference/combined-chlorine-explained.html` (production corrections)
