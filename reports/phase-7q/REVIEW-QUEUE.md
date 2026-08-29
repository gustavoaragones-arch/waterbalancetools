# Phase 7Q -- Review Queue (Carry-Forward to Phase 7R and beyond)

Full detail and evidence for every item below is in `DECISION-MATRIX.csv`. This file is the condensed narrative version.

## Genuinely unresolved (evidence insufficient or conflicting)

- **Routine-maintenance shock dosing** (2-5 ppm vs. 10-20 ppm) -- still disputed between two professional trade sources; the most-likely authoritative candidate (a PHTA fact sheet) was checked this phase and confirmed it defers to product labels rather than resolving it. Needs a dedicated future phase with room for label-level research, not another quick search pass.
- **Water-replacement CYA (80ppm) / calcium (500ppm) / pool-TDS (3000ppm) specific drain-trigger figures** -- the new PHTA source found this phase supports the general principle and the hot-tub 1,500ppm figure, but not these specific numbers. Remain common industry guidance without an independently confirmed primary source.
- **pool-shock-calculator.html's breakpoint-dosing default** -- still no confirmed primary source (unchanged since Phase 7E).
- **entities/unit-fahrenheit.html's 78-84°F/104°F extraction near-miss** -- unchanged; a content-authoring task (splitting one sentence into two), not an evidence-research one.

## Architecturally blocked (would require template/pipeline restructuring, not a content fix)

- **hot-tub-chemical-levels-chart.html and salt-water-pool-chemical-levels-chart.html row-level citations** -- the single-citation-block-per-page pattern can't express mixed row support without a per-`<td>` footnote mechanism. Still genuinely eligible, still not renderable without that restructure.
- **salt-water-pool-chemical-levels-chart.html's FC/CYA scenario-mismatch question** (1-3ppm vs. 2-4ppm CYA-stabilized target) -- needs research into whether the site's SWG-specific guidance intentionally differs; not resolved this phase.
- **Production-content footer-whitespace nondeterminism** -- root cause now identified precisely (Phase 7Q's genuine new finding: `generate-entity-pages.js` runs twice in the pipeline; the second render's whitespace baseline differs from what runs between the two calls). Fixing it safely means reconciling why it runs twice at all -- real pipeline-architecture work for a dedicated future phase, not a quick patch.

## Incremental, not disproportionate to force in one phase

- **61-entity RESEARCH_REQUIRED queue** -- 7 of the 61 now carry at least one resolved/cited claim (up from 5 before this phase); the remaining ~54 are unchanged. This will keep closing incrementally as future phases' real research (not a mechanical coverage push) surfaces citable sources for specific claims.
- **~40 lower-priority qualitative entity claims** (LSI/corrosion, metal staining, chloramine/irritation mechanisms) -- carried forward unchanged from Phase 7K/7L, still correctly untouched (disproportionate research effort for ordinary, non-safety-critical claims).

## Explicitly out of scope for any future closure-style phase to reconsider without new evidence

- **Bromine dosing calculator** and **standalone LSI calculator** -- both blocked by the standing prohibition on calculator-formula/architecture changes; both need a dedicated calculator-architecture phase, not incidental treatment inside a review-queue closure phase.
- **Programmatic families (chlorine/shock/hot-tubs/pH)** -- Phase 7N.1's decision remains closed; re-verified unchanged (26 pages, 0 violations) but not reopened.

## Confirmed safe, no action needed (verified, not assumed)

- Trichlor/calcium-hypochlorite mixing-hazard resolution (Phase 7K) -- intact, now independently corroborated by a second source type.
- Vinyl-liner-bleaching and fiberglass-gelcoat material claims (Phase 7K) -- both re-verified live, unchanged.
- Sitewide TITLE_TOO_LONG findings (43, up from 39 only because of Phase 7P's own new page) -- same category distribution as Phase 7N's per-category KEEP review; no mechanical shortening performed.
- QA/report build-timestamp variability -- confirmed deliberate, not a defect.

## Resolved this phase

- Covered-pool chemistry (real evidence found; existing entity expanded, no new page).
- Water-replacement entity's TDS-increase claim (real citation added, scoped precisely).
- Calcium-hypochlorite entity's calcium-addition claim (real citation added).
- Forensic-audit `AUTHORITY_RE` domain regex (416/416 -> 402/416 on the same content; metric-definition change only, documented, not retroactive).
- Legacy `scripts/generate-sitemap.js` (deprecation guard added; dead code confirmed, kept per policy).
- `data/academy.json`'s duplicate `fund-06` id (genuinely functionally significant, not inert as Phase 7P assumed -- fixed at the data source, corrected a silent cross-link bug).
