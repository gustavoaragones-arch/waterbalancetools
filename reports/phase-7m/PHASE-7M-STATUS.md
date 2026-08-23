# Phase 7M — Content Quality, Topical Depth & Seasonal Resilience

**Status: PASS WITH REVIEW QUEUE**

## Baseline

Fresh audit against commit `3f7ce8f` (Phase 7L): 522 pages, 371 avg word count, 950/39/3 schema, 0 duplicate titles, 18 citation blocks, 86 TITLE_TOO_LONG findings, 0 THIN pages / 31 WEAK, all 4 Phase 7G programmatic families still HIGH duplication risk, 48 existing academy articles. Full detail: `PHASE-7M-BASELINE.md`.

## Content Quality

Full 522-row matrix in `CONTENT-QUALITY-MATRIX.csv`, joined from real forensic per-page measurements (word count, originality, repetition, AEO structure). Most WEAK-scored pages are internal QA/tooling dashboards, correctly left untouched (not real content, expanding them would be arbitrary word-count inflation). The 9 WEAK entity pages were individually read and found to be legitimately concise, complete answers that link out to deeper academy content -- not padded.

## Programmatic Differentiation

Root-caused the HIGH duplication risk to a literally-repeated 6-item "Quick tips" list and generic FAQ items shared across every page in a family, not to the genuinely unique per-page calculation. Removed the repeated block from all 4 generators; added real, page-specific arithmetic (unit conversions, container/bag counts) computed from each page's actual number. Measured, real reduction: chlorine 0.650->0.565 similarity, shock 0.715->0.621, hot-tubs 0.705->0.629 (all still HIGH, disclosed honestly), pH 0.579->0.488 (**HIGH->MEDIUM**). No synonym spinning, no sentence shuffling, no word-count padding.

## Advanced Guides

Audited all 48 existing academy articles plus guides/edge-cases and guides/seasonal against Steps 5-7's full suggested topic list before writing anything new. Nearly every suggested topic (chlorine demand, breakpoint chlorination, combined chlorine, LSI interpretation, winter spa care, pH drift, alkalinity buffering, etc.) already had a substantive existing article -- this materially changed the phase's strategy from "write many guides" to "confirm depth, close genuine gaps only." One new academy article created: **Indoor Pool Chemistry**, a confirmed gap.

## Edge Cases

29 edge cases evaluated in `EDGE-CASE-MATRIX.csv`. 24 already adequately covered. 5 logged INVESTIGATE (covered-pool chemistry, first-fill chemistry, fresh-water-dilution depth, dichlor and calcium-hypochlorite as dedicated academy articles) -- not created this phase, genuinely lower priority. One new page closes the rain/evaporation asymmetry: **evaporation-effect-on-pool-chemistry.html**.

## Seasonal Resilience

The new Indoor Pool Chemistry article and the evaporation edge-case page are both hemisphere-neutral and demand-independent of pool season (indoor pools and evaporation both apply year-round). Combined with the already-strong existing seasonal cluster (winter spa care, closing/opening/summer guides, temperature-chemistry article), this phase's additions target enduring problems rather than calendar-titled pages, per the brief's explicit instruction.

## Topical Depth

Full 14-cluster map in `TOPICAL-DEPTH-MATRIX.csv`. All 14 clusters have a cornerstone page, calculator, and glossary/entity support. Water balance and cyanuric acid clusters strengthened this phase via the new evaporation guide (closes the rain/evaporation symmetry gap and cross-links to the CYA calculator and chart).

## Entity / Glossary

Used Phase 7J/7K decisions directly, did not reopen any correctly-classified claim. One entity (`indoor-pool`) gained a link to the new academy article. No entity was turned into a full chemistry article; material/taxonomy/linguistic domain separation preserved.

## SEO Metadata

86 TITLE_TOO_LONG findings audited. Root cause identified (redundant double brand/category suffix) and fixed at the generator level across 7 files / 36 pages. Result: 86 -> 51 remaining, 0 duplicate-title regressions. The 51 remaining are a different, non-uniform pattern requiring individual review -- not sitewide-rewritten. Full detail: `TITLE-RESOLUTION.csv`.

## AEO / SERP

Citation ordering (answer -> explanation -> detail -> source) preserved on all touched pages. The new pages follow the established Direct Answer -> Why it happens -> What to do -> Safe ranges -> Calculator structure already used by sibling edge-case pages. No manufactured answer blocks; no duplicated direct answers.

## Internal Linking

No global link architecture changes. New evaporation page registered in the existing `build-link-matrix.js` edge-case registry (cross-links to CYA calculator/chart and its rain-page sibling). New academy article linked from the `indoor-pool` entity. No link farms created.

## Provenance / Citations

Zero new unsupported chemistry claims introduced -- both new pages restate only already-established, already-verified site facts (CYA/UV mechanism, chloramine formation, CO2/pH dynamics, evaporation concentration mechanics). All 18 Phase 7L citation blocks (23 links) confirmed intact and unchanged -- verified directly via `validate-citation-coverage.js` and the new `validate-phase-7m.js`, not assumed.

## Validator

`scripts/validate-phase-7m.js` created (Step 20): checks unresolved tokens, byte-identical sibling programmatic pages, leftover quick-tips blocks, thin new pages, missing canonicals, Phase 7L citation regressions, malformed links, and title cannibalization between the new evaporation page and its rain sibling. Result: 513 pages scanned, 18/18 citation pages confirmed intact, 0 errors, 0 warnings.

## Regression

`npm run build` clean. All prior-phase validators PASS: chemistry-knowledge, chemistry-extraction-v2, chemistry-evidence-dataset, provenance, provenance-resolution, trust-layer, trust, editorial-decisions, programmatic-quality, schema-content-consistency, phase-7h, phase-7i, entity-provenance, phase-7k, citation-coverage, plus check-broken-links, test-url-engine, validate-url-engine.

## Forensic Re-Audit

524 pages (+2 for the new pages), schema 953/39/3 VALID (+3 from the 2 new pages' own schema blocks), 0 duplicate-title groups, 0 duplicate-description groups, 0 accessibility issues -- all stable or improved from baseline. URL architecture, canonicals, redirects, and sitemap unchanged in structure (only grew by the 2 new URLs). One new P1 finding investigated and disclosed (see Review Queue: pool-volume-calculator/volume-calculator borderline pair) -- confirmed pre-existing and incidental, not a regression this phase's edits caused.

## Reproducibility

Verified directly (not assumed): the 4 differentiated programmatic pages and the new academy article are byte-identical across two consecutive builds. The new evaporation page's only build-to-build difference is the same pre-existing footer-whitespace pattern confirmed on every other page checked (zero non-whitespace diff). Broader sitewide check found the inherited footer-injection whitespace drift touches ~171 files (broader than Phase 7L's "150-170, mostly qa/reports" characterization) -- reconfirmed as pre-existing, harmless, and unrelated to this phase's content generation, not a new nondeterminism this phase introduced.

## Scope Control

No Spanish/French (documented readiness only, see `I18N-READINESS-NOTE.md`). No AdSense changes. No calculator formula changes. No URL/redirect/sitemap redesign. No mass citation changes -- citation architecture untouched except the required preservation checks. No Phase 7G architecture replacement -- generators extended, not rewritten. No fake authors/reviewers. No fabricated first-hand experience. No unsupported chemistry claims. No broad sitewide rewrite -- 2 new pages, 2 config/registry files, 7 generator files with a targeted fix each.

## Production Changes

**11 files/families touched**: 4 programmatic generators (26 pages differentiated), 1 new academy article (`data/academy.json` + entity link), 1 new static edge-case page + its link-matrix registration, 7 generator files' title-suffix fix (36 pages). Full traceable detail in `CONTENT-CHANGES.csv`.

## Remaining Review Queue

See `REVIEW-QUEUE.md`: 3 programmatic families still HIGH duplication risk (real reduction achieved, structural ceiling reached without merging or deeper unsourced content); the newly-flagged pool-volume-calculator/volume-calculator borderline pair; 51 remaining TITLE_TOO_LONG findings requiring individual review; 5 edge cases logged INVESTIGATE; a dedicated salt-pool-chemistry guide candidate; the broader-than-disclosed footer-whitespace nondeterminism.

---

## Phase 7N Decision

**GO** -- real, measured content-quality improvement delivered without mass rewriting, fabrication, or citation regression; remaining issues are explicitly bounded and disclosed rather than hidden.

DO NOT BEGIN PHASE 7N AUTOMATICALLY.

END PHASE 7M
