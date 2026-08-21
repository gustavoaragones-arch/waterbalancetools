# Phase 7K Baseline

Re-run fresh against the current, post-7J repository state (not assumed from Phase 7J's historical numbers).

| Metric | Value |
|---|---:|
| Total indexable pages | 522 |
| Entity pages | 105 (104 entities + index) |
| Entity longDescriptions | 104 |
| Entity claims (Phase 7J extraction) | 378 |
| Chemistry evidence dataset (Phase 7D.3) | 5,861 records |
| Provenance mapping (Phase 7E) | 5,861 records |
| Conflict inventory (Phase 7E.1) | 499 conflicts |
| Chemistry source registry (`chemistry-sources.js`) | unchanged since Phase 7F.1 |
| Chemistry ranges (`chemistry-ranges.js`) | unchanged since Phase 7F.1 |
| Calculator formulas (`js/calc-utils.js`, `formulas-data.js`) | unchanged since Phase 7I |
| Programmatic shock pages | 6 (`programmatic/shock/*.html`), unchanged since Phase 7G |
| Chart pages | unchanged since Phase 7H |
| Entity provenance decisions (Phase 7J) | 104 rows: 43 KEEP AS WRITTEN, 61 RESEARCH REQUIRED |
| Schema VALID / QUESTIONABLE / MISSING | 950 / 3 / 39 (unchanged) |
| Accessibility findings | 0/523 (unchanged) |
| Content-quality IMPROVE flags | 119 (unchanged) |

All figures confirmed identical to Phase 7J's disclosed closing state — no drift between phases.

## Existing shock-treatment registry coverage (starting point for Step 4-6)

`scripts/data/chemistry-ranges.js` has exactly 2 `shock_treatment` records:
- `range-shock-breakpoint-rule-of-thumb`: multiplier heuristic (10x combined chlorine), `status: REQUIRES_REVIEW`, no source_ids.
- `range-shock-cdc-fecal-incident-response`: 20 ppm, CDC/MAHC fecal-incident response, `status: SUPPORTED`, explicitly scoped to public-facility incident response, explicitly disclaims routine-maintenance applicability.

Neither covers routine residential maintenance shock or algae-recovery shock dosing — confirmed as a genuine, real coverage gap, not previously misrepresented.
