# Phase 7E — Content Provenance & Citation Implementation

**Status: PASS WITH REVIEW QUEUE**

## 1. Source-to-Claim Mapping Architecture (7E.1)

Reused, did not duplicate: `chemistry-claims.js`'s 15 canonical claims and `chemistry-ranges.js`'s 23 canonical ranges already **are** the hand-researched, source-linked "claim family" layer the brief calls for — each range carries explicit `source_ids` and a `rationale`. New this phase: `scripts/data/chemistry-claim-family-map.js` (explicit `(parameter, environment) -> claim_id` lookup) and `scripts/phase-7e/build-provenance.js`, which computes, per evidence record, whether its value overlaps a specific named range and — only then — surfaces that range's own already-real `source_ids`. No new source relationship was invented; this phase exposes and disambiguates attribution the knowledge layer already carried but never propagated to individual claims. Full methodology and its limits: header comment in `build-provenance.js`.

## 2. Claim-to-Source Mapping

`reports/phase-7e/provenance-mapping.csv` — all 5,861 evidence records classified. 575 resolve with DIRECT source support (a SUPPORTED canonical range), 499 CONFLICT with their canonical range, 101 need expert review (topic covered but no specific range/context match), 4,686 remain UNREVIEWED (mostly non-evaluable extraction-status records, honestly disclosed, not silently marked supported). 0 fabricated mappings — `validate-provenance.js` confirms every non-empty `source_registry_ids` traces to a real registry entry.

## 3. High-Risk Claims (7E.2)

792-record review queue triaged; **43 individually hand-reviewed** with real source text read and real reasoning (`reports/phase-7e/HIGH-RISK-PROVENANCE-REVIEW.md`, `high-risk-provenance.csv`). One live source verification performed (CDC MAHC combined-chlorine threshold, confirmed 0.4 ppm) resulting in a real correction: `range-cc-pool-hottub-max` and `claim-cc-minimize` upgraded from REQUIRES_REVIEW to SUPPORTED. One systemic architecture gap found and documented (no numeric shock-treatment FC range exists, causing several legitimate shock-scenario claims to mechanically read as "conflicting" with the routine-maintenance range). One residual extraction limitation found (multi-column table cross-attribution) and disclosed, not fixed (out of phase scope). Site content was **not** rewritten to match the CC 0.4 ppm finding — flagged for editorial decision per the Content Correction Rule.

## 4. Calculator Provenance (7E.3)

All 5 priority calculators audited (`reports/phase-7e/CALCULATOR-PROVENANCE.md`). Target ranges for Pool Chlorine, Hot Tub Chlorine, Pool pH, and the All-in-One Calculator's pH/FC/TA/CH components are directly source-supported. Every dosing *formula constant* across all 5 calculators remains `CALCULATOR_REVIEW_REQUIRED` (carried forward from Phase 7D — not newly resolved, since verifying a dosing coefficient is chemistry-formula research, out of a provenance-implementation phase's scope). **No calculator formula was modified.**

## 5. Authority Charts (7E.4)

All 8 chart pages audited (`reports/phase-7e/AUTHORITY-CHART-PROVENANCE.md`): 5 template-generated (safe to extend), 3 static/hand-authored (audited at the data level only, not rendered into this phase — no safe generator to extend without hand-editing production HTML). Citations were deliberately withheld from ranges without confirmed source support even on charts that otherwise got a citation block (e.g. the Hot Tub Chemical Levels Chart's TA/CH rows) — per the brief's explicit instruction not to imply uniform support.

## 6. Programmatic Strategy (7E.5)

Documented, not implemented (`reports/phase-7e/PROGRAMMATIC-CHEMISTRY-STRATEGY.md`). Confirmed programmatic pages already inherit a small set of canonical claims verbatim across dozens of pages — the correct architecture is one claim-family mapping per template, not one per page. Explicitly deferred to a later phase: wiring `renderClaimSources()` into the programmatic generators would touch 40+ pages at once, which is exactly the premature mass-injection the brief prohibits before Tier 1 is proven in production.

## 7. Production Citation Coverage

**4 pages** carry a real, rendered, external-source citation block in production HTML this phase: Pool Chlorine Calculator, Hot Tub Chlorine Calculator, Pool Alkalinity Levels Chart, Hot Tub Chlorine Levels Chart. Implementation:
- Charts: `sourceIds` field added to the 2 qualifying chart records in `generate-authority-charts.js`; template renders `renderSourceList()` only when present (3 other charts render nothing, correctly — no confirmed support).
- Calculators: new idempotent `scripts/phase-7e/inject-calculator-sources.js`, wired into `run-all-generators.js` **after** `restructure-calculator-pages.js` (which rebuilds `<main>` from a fixed section whitelist and would otherwise silently discard any independently-inserted block on every rebuild — confirmed by testing, then fixed by pipeline ordering, not by fighting that script).
- New shared CSS (`.knowledge-sources-real` etc., appended to `style.css`) matches the existing card/table visual language; compact, no JS-only content, sources exist directly in rendered HTML.
- Both CDC citation URLs and the PHTA citation URL were live-verified (WebFetch/curl blocked by CDC's bot protection in this environment — cross-confirmed via WebSearch that the exact URL is live, indexed, and its cited content matches; PHTA URL fetched successfully as a real PDF).

Full page-level and claim-level coverage: `reports/phase-7e/PROVENANCE-COVERAGE.md`.

## 8. Provenance Validation

`scripts/validate-provenance.js`: **PASS** — 5,861 provenance records + 788 high-risk records checked, 0 violations (no fabricated source IDs, no VERIFIED claims, no provenance on NOT_EXTRACTED/impossible-mapping records, no SUPPORTED record with an empty source list, no conflicting record marked SUPPORTED, no duplicate records). 4,787 warnings (unreviewed / expert-review-required claims) — correctly not treated as failures.

## 9. Source URL Validation

3 sources used in production this phase, all verified live: `cdc-healthy-swimming-home-treatment` and `cdc-mahc-2023` (WebSearch-confirmed live and content-accurate; direct fetch blocked by CDC bot protection in this environment, not evidence of a broken link), `phta-total-alkalinity-fact-sheet` (fetched directly, confirmed a real, resolving PDF). No source was substituted due to a fetch failure; none marked `SOURCE_URL_UNVERIFIED`.

## 10. Regression

`npm run build`, Phase 7B/7C validators, Phase 7D chemistry validator/tests, Phase 7D.2 golden-set-v2/status-integrity/regression-suite, Phase 7D.3 dataset validator, new provenance validator, broken-link validator, URL-engine tests — **all PASS**, no regression in any prior phase's gate.

## 11. Scope Control

Confirmed: no Spanish/French, no URL/canonical/redirect/sitemap architecture change, no calculator formula change, no AdSense change, no broad content rewrite, no new duplicate canonical tags or JSON-LD blocks on any touched page, no report/audit files leaking into the sitemap, page count unchanged (523). One pre-existing, unrelated non-determinism was found and disclosed (a whitespace-before-`<footer>` drift on calculator pages, present even on calculator pages this phase never touched — inherited from `restructure-calculator-pages.js`/`inject-footer.js`, not introduced by Phase 7E; the citation content itself is fully deterministic).

## 12. Review Queue

4,686 evidence records remain `UNREVIEWED` (no individual provenance assessment yet — the honest, disclosed majority of the dataset). 499 `CONFLICTING`, 101 `EXPERT_REVIEW_REQUIRED`. This queue is preserved, not silently resolved or hidden — it is the explicit input for future provenance-review work.

## 13. Phase 7F Decision

**NO-GO — pending user review**, per this phase's own instruction not to proceed automatically.

DO NOT BEGIN PHASE 7F.

## Reports

- `reports/phase-7e/PHASE-7E-PROVENANCE.md` / `.json` (this report)
- `reports/phase-7e/PROVENANCE-COVERAGE.md` / `.json`
- `reports/phase-7e/HIGH-RISK-PROVENANCE-REVIEW.md`, `high-risk-provenance.csv`
- `reports/phase-7e/CALCULATOR-PROVENANCE.md`
- `reports/phase-7e/AUTHORITY-CHART-PROVENANCE.md`
- `reports/phase-7e/PROGRAMMATIC-CHEMISTRY-STRATEGY.md`
- `reports/phase-7e/provenance-mapping.csv`
- `reports/phase-7e/provenance-validation-results.json`
- `scripts/data/chemistry-claim-family-map.js`
- `scripts/phase-7e/build-provenance.js`, `build-high-risk-review.js`, `build-coverage.js`, `inject-calculator-sources.js`
- `scripts/validate-provenance.js`
- `scripts/chemistry/renderSources.js` (reviewed, reused as-is), `scripts/generate-authority-charts.js` (extended), `scripts/run-all-generators.js` (new pipeline step), `style.css` (new citation styles), `scripts/data/chemistry-ranges.js` / `chemistry-claims.js` (1 record each upgraded to SUPPORTED after live verification)
