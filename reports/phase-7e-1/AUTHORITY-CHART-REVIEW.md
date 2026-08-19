# Authority Chart Review (All 8 Charts)

Builds on `reports/phase-7e/AUTHORITY-CHART-PROVENANCE.md` with per-row status for every chart, including the 2 static charts and `charts/pool-chemical-levels-chart.html` / `charts/pool-water-balance-chart.html` (not separately audited in Phase 7E).

| Chart | Row | Status |
|---|---|---|
| Pool CYA Levels Chart | CYA 30-50 ppm (pool) | CONTEXTUAL — matches `range-cya-residential-routine-outdoor`, but that range itself has no confirmed primary source |
| Pool CYA Levels Chart | CYA 60-80 ppm (saltwater) | CONTEXTUAL — same, `range-cya-saltwater-outdoor` unconfirmed |
| Pool Alkalinity Levels Chart | TA 80-120 ppm | **SUPPORTED** — cited in production (`phta-total-alkalinity-fact-sheet`) |
| Hot Tub Chlorine Levels Chart | FC 3-5 ppm | **SUPPORTED** — cited in production (CDC) |
| Hot Tub Chemical Levels Chart | FC 3-5 ppm, pH 7.2-7.8 | SUPPORTED (not yet rendered in production HTML — data-level only) |
| Hot Tub Chemical Levels Chart | TA 80-120 ppm, CH 150-250 ppm | UNSUPPORTED — no hot-tub-specific source found (`range-ta-hottub` source_ids empty; no CH hot-tub range exists) |
| Hot Tub Chemical Levels Chart | CYA 30-50 ppm "(if using unstabilized chlorine)" | **CONFLICTING** — individually reviewed this phase (Step 6): contradicts CDC's guidance that CYA/stabilized chlorine should not be used in hot tubs at all (`range-cya-hottub`, 0 ppm, SUPPORTED). Flagged `SOURCE_CONFLICT_REMAINS` for editorial review; not silently rewritten. |
| Salt Water Pool Chemical Levels Chart | Salt 2,700-3,400 ppm | REQUIRES_EXPERT_REVIEW — matches the site's own `range-salt-generic-operating` but no confirmed manufacturer-independent primary source (equipment-specific, per Phase 7D's disclosed limitation) |
| `charts/pool-chemical-levels-chart.html` | FC/pH/TA/CH/CYA "Ideal levels" table | Individually reviewed this phase: FC, pH, TA, CH, CYA target figures all independently correct per their canonical ranges; ONE extraction artifact found and resolved (a duplicate 80-120 reading misattributed to Calcium Hardness from the adjacent Total Alkalinity table cell — see `TABLE-EXTRACTION-LIMITATION.md`). The chart's own content is not in error; the extraction of it produced one redundant/incorrect evidence record, now correctly tagged `EXTRACTION_ARTIFACT`. |
| `charts/pool-water-balance-chart.html` | "Balance in this order: alkalinity, pH, chlorine" flow diagram | Individually reviewed: the 3 numeric "conflicts" from this page are all step-numbering artifacts (flow-diagram markers "1.", "2.", "3."), not chemistry claims. No content issue. |
| `pool-chlorine-levels-chart.html`, `pool-ph-levels-chart.html` (static pages) | — | Not re-audited at the individual-row level this phase (same limitation disclosed in Phase 7E: no safe generator to extend without hand-editing production HTML) |

## Citation policy holds

No row was cited merely because a sibling chart states the same number. The Hot Tub Chemical Levels Chart is the clearest example: FC/pH rows are SUPPORTED, TA/CH rows are UNSUPPORTED, and the CYA row is actively CONFLICTING — three different statuses on one page, none of them smoothed over.
