# Phase 7K — High-Priority Chemistry Evidence Resolution

**Status: PASS WITH REVIEW QUEUE**

## Trichlor + Calcium Hypochlorite

Researched and resolved. Two manufacturer SDS documents (`microphor-trichlor-sds-2016`, `asepsis-calhypo-msds-2005`), both fetched and read in full (one via a WebFetch→Read fallback after the compressed-PDF markdown extraction failed), each explicitly naming the opposing chemical as incompatible and tying the mixture to fire/explosion risk — the exact bar the evidence policy requires, not a generic "don't mix chemicals" inference. `ec-trichlor-tablets-0313` → **SUPPORTED**.

## Shock Dosing

Treated as three distinct scenarios, not one number. Routine maintenance: genuine 2-5 ppm vs. 10-20 ppm disagreement between two professional trade sources, left **REQUIRES_REVIEW** rather than resolved with a picked figure. Green algae recovery: 30 ppm, single trade-publication source, `ec-green-water-0204` → **CONTEXTUAL**, new range `range-shock-algae-recovery-green`. Fecal/incident response: pre-existing CDC/MAHC 20 ppm record, unchanged. Full detail: `SHOCK-EVIDENCE.md`.

## Material-Science Claims

Vinyl liner bleaching: CFFA (material-industry trade association) directly confirms the mechanism and named cause. `ec-vinyl-pool-0282` → **SUPPORTED**. Fiberglass gelcoat/calcium: Orenda Technologies confirms the mechanism but characterizes a single fixed calcium ceiling as an oversimplification. `ec-fiberglass-pool-0286` → **CONTEXTUAL**, no page rewrite. Full detail: `MATERIAL-EVIDENCE.md`.

## Systematic Entity Review

76 P1/P2 claims in the priority queue; 6 resolved with real new sourcing this phase (above, plus hot-tub max temperature). The remaining 70 were reviewed by category against the existing source registry's topic coverage and found to have no existing registry-level support — left honestly **REQUIRES_REVIEW**, consistent with the stop-rule against disproportionate research effort on ordinary claims. Full breakdown: `ENTITY-RESOLUTION.md`.

## Extraction Precision Audit

The known proximity-misattribution limitation (environment/sanitizer qualifier words like "salt" out-competing the true, more distant parameter mention) was reproduced on a second synthetic test sentence, confirming it is real, but did not generalize across 5 other structurally similar test cases, and was found in exactly 1 of 378 real production claims (`ec-stabilizer-0338`). **Verdict: isolated and safely bounded, not systemic** — documented, no extractor change made, no architecture stop triggered. Full detail: `ENTITY-RESOLUTION.md`.

## Production Corrections

**One.** `scripts/generators/generate-shock-pages.js` and its 6 output pages: corrected a conflation of "heavy algae" and "contamination" under one unsourced 20 ppm figure into a distinct, sourced 30 ppm green-algae-recovery tier, with surrounding copy updated for internal consistency. Regenerated, re-validated, byte-identical across two consecutive full builds. No entity page content was changed this phase. Full diff summary: `PRODUCTION-CHANGES.md`.

## Registry Growth

`chemistry-sources.js`: 9 → 15 records (6 new: 2 manufacturer SDS, 2 professional trade publications, 1 material-industry association, 1 government/standards-body document). `chemistry-ranges.js`: 23 → 25 records (2 new: green-algae shock recovery, hot-tub max-temperature safety limit). `CONTEXT_MODEL.scenario` extended with one new value (`algae_recovery`) to keep algae recovery genuinely distinct from incident response, matching the Director's explicit "distinct scenarios" instruction — the existing `safety_guidance` scenario was reused for the hot-tub temperature record rather than inventing a redundant value.

## Regression

Full validator suite re-run against the final build state: `validate-chemistry-knowledge` (PASS, 15 params/25 ranges/15 sources/16 claims, 0 structural errors), `validate-chemistry-extraction-v2` (PASS, 104/104 golden set), `validate-chemistry-evidence-dataset` (PASS, 5861 rows), `validate-provenance` (PASS, 5861 records), `validate-provenance-resolution` (PASS, 499 conflicts), `validate-trust-layer`/`validate-trust` (PASS), `validate-editorial-decisions` (PASS, 141 decisions), `validate-programmatic-quality` (PASS, 26 pages), `validate-schema-content-consistency` (PASS, 480 pages), `validate-phase-7h` (PASS, 536 pages), `validate-phase-7i` (PASS, 258 pages), `validate-entity-provenance` (PASS, 104 entities/378 claims), `check-broken-links` (PASS, 0 issues), `test-url-engine` (PASS, 263 assertions), new `validate-phase-7k` (PASS, 0 errors). `npm run build` completes clean end-to-end.

## Forensic Re-Audit

Re-ran against the Phase 7K baseline using the established snapshot-then-restore procedure. 522 pages, schema 950 VALID/39 MISSING/3 QUESTIONABLE, 0 duplicate-title groups, 0 duplicate-description groups — identical to baseline. (An early re-audit run briefly showed 523 pages/40 MISSING due to a self-inflicted stray dashboard-file copy in this phase's own snapshot directory; caught, removed, and the audit re-run clean — see `PRODUCTION-CHANGES.md`.) `reports/phase-7a/` restored to its untouched historical baseline afterward.

## Reproducibility

Two consecutive full `npm run build` runs produce byte-identical output for all real content pages (entities, glossary, programmatic, calculators, the shock pages touched this phase) and the forensic dashboard. The previously-documented inherited nondeterminism is confined to 15 internal `qa/*.html` and top-level `reports/*.html` dashboard pages (`Date.now()`-based freshness/QA scoring) — unchanged in scope from prior phases, not introduced or worsened this phase.

## Scope Control

No Spanish/French content. No AdSense changes. No calculator formula changes. No URL/redirect/sitemap redesign. Phase 7G's shock generator was touched exactly once, for the one verified factual correction described above — no broader generator rewrite. No fake authority/expert names or invented dates (one placeholder date was caught and self-corrected to `null` before being finalized). `scripts/data/chemistry-ranges.js`/`chemistry-sources.js`/`chemistry-knowledge.js` were extended, not replaced or forked. No duplicate sources. No mass citation injection — zero visible citations rendered, matching every prior phase in this arc.

---

DO NOT BEGIN PHASE 7L AUTOMATICALLY.

END PHASE 7K
