# Phase 7R -- Scientific Evidence Resolution & Calculator Provenance

**Status: PASS WITH REVIEW QUEUE**

## Baseline

Phase 7Q (commit `ae751ca`) re-verified fresh, not assumed: 478 canonical indexable pages, 21 citation blocks / 26 links, 19 chemistry claims (1 REQUIRES_REVIEW target of this phase), QA 99/100. Full detail: `BASELINE.md`.

## Research Performed

4 bounded web searches, 2 PDF fetches (1 read in full -- 12 pages, Indiana Department of Health), and a systematic re-check of the routine-shock-dosing question against every relevant source already in the registry plus 2 new candidates. One AI-search-summary hallucination caught and explicitly rejected rather than adopted as evidence. Full detail: `RESEARCH.md`.

## Sources Added

1 new source: `in-doh-breakpoint-chlorination-2022` (Indiana Department of Health, Environmental Public Health Division, "How To Shock The Pool (Chlorinate To Breakpoint)," 2022) -- government/public-health authority, read in full.

## Claims Resolved

- `claim-shock-breakpoint-rule` / `range-shock-breakpoint-rule-of-thumb`: REQUIRES_REVIEW -> **SUPPORTED**. Genuine, direct, almost-verbatim government-source confirmation of the 10x-combined-chlorine breakpoint rule, uncited since Phase 7E.
- `entities/combined-chlorine.html`'s CC=TC-FC definition and 0.5ppm breakpoint trigger: uncited -> **SUPPORTED** (same source, exact match).
- `entities/breakpoint-chlorination.html`: uncited -> **SUPPORTED** (same source).
- `entities/shock-treatment.html`'s existing citation extended to cover the breakpoint-rule figure specifically, while its still-genuinely-uncited routine-10ppm figure remains correctly uncited.

## Claims Remaining Unresolved (successful, honest outcomes)

- **Routine-maintenance shock dosing (2-5ppm vs. 10-20ppm)**: re-verified as a genuine, unresolved professional disagreement. 4 sources checked this phase (2 original trade sources re-examined for scenario/environment/sanitizer distinctions per the Anti-Hallucination Rule's checklist, plus 2 new candidate sources including a government-tier document) -- none resolves it. REQUIRES_REVIEW preserved, as required.
- **Water-replacement's 3 specific thresholds** (CYA 80ppm, calcium 500ppm, pool TDS 3000ppm): re-searched this phase; REMOVE was explicitly considered per the brief's own option and rejected in favor of DEFER (keep, don't invent a replacement) since all three are plausible and non-contradicted by the authoritative ranges that do exist, and removing actionable guidance to clean up a metric would be a content regression.

## Calculator Audit

Audited all of `js/calc-utils.js` plus cross-referenced `scripts/data/formulas-data.js`. Classified every formula/constant as VERIFIED_MATH, SUPPORTED_DOMAIN_ASSUMPTION, or REQUIRES_EXPERT_REVIEW per the mandated distinction. **No calculator formula was modified.**

**Most significant finding of this phase:** discovered 2 critical and 2 milder previously-undetected internal-consistency defects between documented formula pages and the live calculator engine (or within a single worked example):
1. Liquid chlorine formula's documented equation vs. the live calculator's constant -- a ~1,000,000x discrepancy; the page's own worked example says "Wait -- that looks wrong."
2. LSI worked example computes 3 different index values for the same inputs; confirmed zero LSI computation exists anywhere in the client-side JS.
3. Alkalinity calculator constant (1.4) vs. its own formula page's explanation text (1.5).
4. pH adjustment formula's documented equation abandoned mid-calculation for an unreferenced alternate rule of thumb.

Per Section 8's explicit stop-rule, **none of these were corrected this phase** -- reconciling them requires domain-expert validation this phase should not perform unilaterally. All 4 are flagged `REQUIRES_EXPERT_REVIEW` and recommended as the highest-priority item for a dedicated future calculator-formula-audit phase. Full detail: `CALCULATOR-PROVENANCE.csv`.

## Bromine

Re-confirmed OUT_OF_SCOPE: no calculator, formula, or dosing coefficient exists anywhere in the codebase. None invented.

## LSI

Audited, not built. Confirmed no LSI computation exists in any client-side JS file and no lookup-table data exists in the codebase -- the standing "no new standalone LSI calculator" decision is confirmed correct, and the underlying gap is deeper than previously documented (no data to build from, not merely "not yet built").

## Entity Provenance

2 more items closed from the ~54-item remaining queue this phase (now ~52), using the newly-found source cross-referenced against exact-match claims. No mechanical coverage push performed.

## Material Science

Vinyl-liner bleaching, fiberglass gelcoat, and concrete/gunite claims all re-verified live, unchanged from Phase 7K. No new material-science research needed or performed this phase.

## Citation Architecture

The two architecturally-blocked authority charts remain ARCHITECTURALLY_BLOCKED -- re-confirmed, no one-off hack built, no generic row-level mechanism designed (out of scope for a provenance-focused phase).

## Forensic Source Metric

Re-verified Phase 7Q's `AUTHORITY_RE` fix remains intact; manufacturer/professional/material-association domains still correctly recognized. The new Indiana `.gov` source was already covered by the pre-existing generic `.gov` pattern -- no regex change needed this phase.

## Citations

21 -> 23 citation blocks, 26 -> 29 citation links.

## Validator / Tests

`scripts/validate-phase-7r.js`: 0 errors, 0 warnings. `scripts/test-phase-7r.js`: all assertions pass, including a live reproducibility check (citation output byte-identical across two generator runs).

## Regression

All prior-phase validators and `npm run build` pass, QA 99/100 (0 change). One expected, explained non-issue: `validate-phase-7q.js` reports FAIL when re-run because its own scope-guard hardcodes a diff comparison against its own now-superseded baseline commit, not because any Phase 7Q invariant actually regressed -- every substantive Phase 7Q invariant (citation counts, redirect registry, page counts) was independently re-verified via other validators and passes.

## Forensic Re-Audit

525 total HTML files (unchanged, 0 pages created/deleted). Schema 952/39/6 (unchanged). 0 true orphans, 0 duplicate titles among canonical pages, 0 HIGH cannibalization. Source-audit metric improved from the 2 new entity citations: 402/416 -> 400/416.

## Reproducibility

Citation rendering confirmed byte-identical across two generator runs. No new nondeterminism introduced; the known footer-whitespace pattern (Phase 7Q root-cause, intentionally not touched this phase) is unchanged.

## Scope Control

Clean: no Spanish/French, no AdSense changes, no calculator formula changes, no URL/redirect changes, no programmatic-family changes, no fabricated sources/authors, no unsupported claim promoted, no closed decision reopened, no undocumented production change.

## Remaining Review Queue

Full detail in `DECISION-MATRIX.csv` (33 items, each individually dispositioned). Highest-priority carry-forward item: **the 4 calculator/formula internal-consistency defects discovered this phase**, recommended for a dedicated future calculator-formula-audit phase with domain-expert input. Also carried forward: the routine-shock disagreement, the 3 water-replacement thresholds, the ~52-item entity queue, the 2 architecturally-blocked chart citations, and the previously-identified (unchanged) generator double-execution and footer-whitespace items.

## Phase 7S Recommendation

**GO**, with the calculator-formula defects flagged as the clear top priority for whatever phase addresses them next -- ideally a dedicated, narrowly-scoped calculator-formula-audit phase rather than another broad provenance sweep.

DO NOT BEGIN PHASE 7S AUTOMATICALLY.

END PHASE 7R
