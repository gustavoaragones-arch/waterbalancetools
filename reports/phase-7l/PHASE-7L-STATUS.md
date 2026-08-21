# Phase 7L — Authority Citation Expansion & Source Coverage

**Status: PASS WITH REVIEW QUEUE**

## Baseline

Pre-phase: 536 HTML files, 4 pages with visible citations (5 citation links), 16 canonical claims in `chemistry-claims.js` (13 eligible). Full detail: `PHASE-7L-BASELINE.md`.

## Citation Eligibility

27 candidates individually reviewed (`CITATION-ELIGIBILITY.csv`): 14 TIER_1 rendered this phase (in addition to the 4 already rendered pre-phase), 2 TIER_2 reviewed and correctly not rendered (mixed-row authority charts), 8 explicitly NOT_ELIGIBLE with a disclosed reason (no source, category mismatch, or architectural limitation), 3 TIER_3 (lower-priority, no source found, stop-rule applies).

## Production Citations

5 entity pages (trichlor-tablets, green-water, temperature, shock-treatment, vinyl-pool), 2 newly-cited calculators (pool-ph-calculator, chemical-calculator) plus 2 reconfirmed, 1 newly-cited + corrected authority chart (pool-chlorine-levels-chart.html), 6 programmatic shock pages (generator-level, shared claim family). 3 new canonical claims added to `chemistry-claims.js`. Full detail: `PRODUCTION-CHANGES.md`.

## Source Coverage

18 citation blocks, 23 citation links sitewide (up from 4 blocks / 5 links). See `SOURCE-COVERAGE.md` for the full by-source, by-family, and claim-weighted breakdown, including an important disclosed finding: the Phase 7A forensic audit's own "413/413 major factual pages" KPI is unchanged because its authority-domain regex predates Phase 7K's expanded, legitimate source hierarchy (manufacturer/professional/material-association sources) -- not because citations weren't added.

## Calculators

Audited the 5 Phase 7E priority calculators plus pool-shock-calculator. Closed a real gap: `pool-ph-calculator.html` was found citable in Phase 7E but never rendered -- now cited. `chemical-calculator.html` now cites its 4 supported target ranges (pH/FC/TA/CH) with an explicit note excluding CYA/salt and all dosing constants. `pool-shock-calculator.html` remains uncited -- CALCULATOR_REVIEW_REQUIRED, unchanged.

## Authority Charts

5 `generate-authority-charts.js` charts + 3 legacy static charts audited row-by-row. 2 already had appropriate single-row citations (unchanged). 1 corrected and cited this phase (pool-chlorine-levels-chart.html's algae row, synced with Phase 7K). 2 (pool-cya-levels-chart.html) correctly left uncited -- no source. 2 (hot-tub-chemical-levels-chart.html, salt-water-pool-chemical-levels-chart.html) have genuinely supported rows but were NOT cited because the current one-block-per-page architecture would misleadingly extend support to unsupported rows on the same page -- flagged to the review queue rather than forced.

## Programmatic Pages

Did not mass-inject into all 26 Phase 7G pages. Identified the one genuinely shared, supported claim family (green-algae 30ppm shock dose) and implemented citation rendering at the generator level (`generate-shock-pages.js`), contextual to the specific row it supports, applied consistently across the 6 volume-variant pages that share the claim.

## Entity / Glossary Pages

Used Phase 7J/7K provenance decisions directly -- did not re-derive eligibility. 5 of 104 entities cited (the ones with an individually reviewed, directly-supporting claim from Phase 7K). Material-property claim (vinyl-pool) used a material-industry source (CFFA), not a chemistry source. One near-miss (unit-fahrenheit) explicitly identified and left uncited to avoid misattributing a source to a number it doesn't verify.

## AEO / E-E-A-T

Citation ordering follows Direct Answer -> Explanation -> Table/Detail -> Source on every page touched (Sources section placed after Quick Facts, before Relationships on entity pages; after the dosage table on programmatic pages; existing note-then-sources pattern on calculators). No artificial answer blocks added. No implication of expert authorship, medical approval, or site-wide endorsement -- each citation is scoped to its specific claim, and one entity (shock-treatment) has an explicit note limiting the citation to the exact figure it supports, not the surrounding paragraph. Fixed a real, pre-existing renderer bug (`sourceLabel()`) that would have mislabeled 3 new source types as "ANSI-accredited standard" -- caught before publication.

## Validator

`scripts/validate-citation-coverage.js` created (Step 19): checks unknown/unverified sources, malformed URLs, empty labels, source-scope-label mismatches, duplicate blocks, noindex-page citations, unresolved template tokens, and unsupported claims marked as supported. Result: 18 blocks / 23 links scanned, 0 errors, 0 warnings.

## Regression

`npm run build` clean. All prior-phase validators PASS: chemistry-knowledge, chemistry-extraction-v2, chemistry-evidence-dataset, provenance, provenance-resolution, trust-layer, trust, editorial-decisions, programmatic-quality, schema-content-consistency, phase-7h, phase-7i, entity-provenance, phase-7k, plus check-broken-links and test-url-engine/validate-url-engine. `validate-trust-layer.js`'s Tier-1-citation allowlist updated to include the 14 new pages so it continues distinguishing "reviewed" from "unexpected" citation blocks rather than producing spurious warnings.

## Forensic Re-Audit

522 pages, schema 950 VALID/39 MISSING/3 QUESTIONABLE, 0 duplicate-title groups, 0 duplicate-description groups, 0 accessibility issues -- all identical to the Phase 7K post-state. URL architecture, sitemap, canonicals, and redirects unchanged.

## Reproducibility

Two consecutive full builds produce citation content that is **byte-identical** (verified directly, not inferred) for every one of the 18 rendered citation blocks. Separately, this phase's reproducibility check uncovered that the previously-documented "nondeterminism confined to `qa/`/`reports/*.html`" characterization from Phase 7K was incomplete: a pre-existing footer-injection whitespace drift (`inject-footer.js` walks the full repo tree including two template files it doesn't exclude, `templates/entity-template.html` and `templates/release-template.html`) actually touches ~150-170 files per build, confirmed present and unchanged on the clean, already-committed Phase 7K baseline commit (`2e5c094`) before any Phase 7L edit -- i.e. entirely pre-existing, not introduced or worsened by this phase's citation work. Flagged honestly rather than silently reported as "15 files" again.

## Scope Control

No Spanish/French. No AdSense changes. No calculator formula changes. No URL/redirect/sitemap changes. Phase 7G's shock generator touched only for the one already-resolved Step 16 sync. No fake authors/reviewers. No fabricated citations -- every rendered source exists in `chemistry-sources.js` with a verified URL. No arbitrary citation percentage target -- coverage measured by claim-weighted eligibility, not page-count quota. No client-side citation framework -- all citations are static HTML, no JS, no runtime dependency.

## Remaining Review Queue

See `REVIEW-QUEUE.md`: 2 architecturally-blocked authority charts, 1 possible pre-existing FC/CYA scenario mismatch on the salt-water chart (not verified this phase), the forensic-audit domain-regex gap, 2 entity claims correctly left uncited, ~40 lower-priority entity claims carried forward from Phase 7K, and `pool-shock-calculator.html`.

---

## Phase 7M Decision

**GO** -- the citation architecture is extended cleanly, verified deterministic, regression-clean, and the review queue is explicit and bounded rather than open-ended.

DO NOT BEGIN PHASE 7M AUTOMATICALLY.

END PHASE 7L
