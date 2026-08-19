# Table-Column Cross-Attribution Limitation

## What it is

Proximity-based extraction (`extract-claims-v2.js`) attributes a numeric value to the nearest chemistry-parameter mention by character distance. In prose, this is reliable. In multi-column reference tables that got flattened to plain text during Phase 7A's extraction (e.g. `"Free Chlorine 2.0 3-5 10 ppm | Bromine 3.0 3-6 8 ppm"`), a value that belongs to one column (e.g. Free Chlorine's maximum) can be textually closer to the *next* row's parameter name than to its own, and gets misattributed.

## Investigation

- **Affected page types**: entity pages, glossary pages, and reference pages that render a "Parameter / Value / Notes" or "Minimum / Ideal Range / Maximum / Unit" style table (`reference/ideal-spa-levels.html`, `reference/ideal-pool-levels.html`, `entities/*`, several `reference/*-explained.html` pages, plus 2 authority charts).
- **Affected parameter classes**: any parameter that co-occurs in the same table row/block as another (free_chlorine near combined_chlorine/bromine; total_alkalinity near calcium_hardness).
- **Records potentially affected**: 129 evaluated (CORRECT_EXTRACTION/CARRIED_CONTEXT) evidence records match a table-structure text fingerprint (`Parameter Minimum/Value`, `Ideal Range`, etc.), across 55 distinct pages.
- **Confirmed false attributions in the current dataset**: **2**, individually verified by reading the actual table text — `c65671f3c42e4e14` (`reference/ideal-spa-levels.html`, Free Chlorine's max-column value 10 attributed to Bromine) and `3cae91354d89d46a` (`charts/pool-chemical-levels-chart.html`, Total Alkalinity's value 80-120 attributed to Calcium Hardness).
- Of the 129 table-like records, 35 are currently in the conflict queue (candidates, not all confirmed cross-attribution — some conflicts among them have other causes, e.g. product specs also appearing in table-formatted glossary entries) and 50 already resolve correctly against a real canonical range (i.e. the majority of table-sourced extraction is NOT wrong — this is a real but bounded limitation, not a systemic failure of tabular content).

## Is it safe to leave in place temporarily?

**Yes.** No confirmed false attribution in the current dataset produces an impossible pairing or a fabricated citation — the worst case is an incorrect *parameter* attribution for a *plausible* value (e.g. a real bromine-range number attributed to free_chlorine, or vice versa), which is caught downstream by the provenance layer's range-overlap check (that's exactly how both confirmed cases were found — they showed up as conflicts, not as silent false positives). No production citation in this phase rests on a table-sourced record.

## Decision

**Quarantined, not fixed.** `build-conflict-inventory.js` now tags any conflicting record matching the table-structure fingerprint as `EXTRACTION_ARTIFACT` / `REQUIRES_EXPERT_REVIEW` rather than a confirmed `RANGE_MISMATCH` — 36 records affected by this reclassification this phase (35 pre-existing conflicts + the table structure check catching them, one of which was already individually confirmed as the Total Alkalinity/Calcium Hardness case). This is disclosed uncertainty, not a false resolution.

**Remediation ticket (not implemented here, out of scope for a provenance phase):** teach the extractor to recognize repeated `Parameter Value Parameter Value...` row structure and either (a) refuse to attribute a value across a detected column boundary, or (b) require an explicit unit-adjacency check within a table row. This is an extraction-algorithm change, belonging to a future Phase 7D-series extractor iteration, not this provenance-resolution phase.

## Effect on mass programmatic provenance activation

Per Step 13, programmatic provenance rendering is deferred until "no known table-attribution contamination" — this finding confirms that condition is not yet met broadly (55 pages carry table-like structure), reinforcing the decision already made in Phase 7E's `PROGRAMMATIC-CHEMISTRY-STRATEGY.md` to hold off.
