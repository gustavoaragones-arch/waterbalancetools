# Phase 7K — Review Queue (Carry-Forward)

## Resolved this phase
6 claims (see `ENTITY-RESOLUTION.md`): trichlor+cal-hypo mixing hazard, green-algae shock dosing, vinyl-liner bleaching, fiberglass gelcoat nuance, hot-tub max temperature. All backed by real, directly-read sources.

## Still open, prioritized

1. **Routine-maintenance shock dosing** (`ec-shock-treatment-0140`) — genuine 2-5 ppm vs. 10-20 ppm disagreement between two professional trade sources. Needs either a higher-tier source (CDC/MAHC/PHTA does not appear to publish a residential routine-shock figure at all — their guidance is incident-response-scoped) or an explicit acceptance that this stays a disclosed range of professional opinion rather than a single number.
2. **~40 qualitative mechanism claims** with zero existing registry-level source coverage: LSI/corrosion/scaling, copper/iron/manganese staining, chloramine/eye-irritation mechanisms. None are known-incorrect; all are verification debt. A future phase could deliberately scope a "water-balance mechanism sourcing" pass (PHTA Pool & Spa Operator Handbook, NPIC fact sheets, or similar) rather than one-off research per entity.
3. **`ec-stabilizer-0338`** — the one real production claim confirmed affected by the extraction-attribution limitation (proximity misattribution to "salt pool[s]"). Not hand-patched this phase (see `ENTITY-RESOLUTION.md`); worth a deliberate, disclosed manual correction in a future phase rather than leaving it silently wrong under a generic REQUIRES_REVIEW label.
4. **`ec-unit-fahrenheit-0369`** — near-miss noted this phase (78-84°F pool comfort range extracted; hot-tub 104°F max within the same sentence not separately captured as its own claim). Not a defect requiring extractor changes, but a candidate for the entity's `longDescription` to be split into two sentences in a future phase so each numeric fact gets its own claim row.
5. **Dosing-math claims** (baking soda, calcium chloride, sodium dichlor, gallons-per-cubic-foot) — calculator-adjacent, deliberately out of scope this phase; would need to be scoped explicitly if pursued, since they touch the same math the formula engine relies on.

## What was deliberately NOT done
- No routine-maintenance shock number was invented to close the gap.
- No qualitative mechanism claim was upgraded to SUPPORTED/CONTEXTUAL without a real source found this phase.
- The extractor was not modified or expanded based on one isolated, bounded misattribution.
- `ec-stabilizer-0338`'s wrong extracted value was not silently hand-corrected.
