# Phase 7U -- Formula Governance

A single reference for which calculator formulas are authoritative, which are historical/documentation-only, and how future changes must be approved. Supersedes no prior phase's findings; consolidates them.

## Live calculator formulas (implemented in `js/calc-utils.js` and/or `js/calculator.js`)

| Formula | Function(s) | Status | Constant(s) | Provenance |
|---|---|---|---|---|
| Liquid chlorine | `calculateChlorine` ('liquid'), `liquidChlorineOunces` | `RESOLVED` (Phase 7S) | 749.4 (divisor form of 0.013344) | First-principles mass balance + Indiana DOH, independently corroborated by PHTA (Phase 7T) |
| Trichlor tablets | `calculateChlorine` ('tablets'), `tabletChlorineOunces` | `RESOLVED` (Phase 7S) | 6666.7 | Same mass-balance derivation; matches Indiana DOH and PHTA tables exactly |
| Generic granular/shock | `calculateChlorine` ('granular'/'shock'), `calculateShock`, `granularShockOunces` | `REQUIRES_EXPERT_REVIEW` / `ARCHITECTURAL_GAP` (Phase 7T, reconfirmed Phase 7U) | 10000 (no defensible product basis -- dimensionally implies a 133.44%-available product) | None -- explicitly unsupported |
| pH adjustment | `calculatePHAdjustment`, `phIncreaserOunces`, `phReducerOunces` | `REQUIRES_EXPERT_REVIEW` / `ARCHITECTURAL_GAP` (Phase 7T, reconfirmed Phase 7U) | 6 (increaser), 5 (reducer) | None -- explicitly unsupported |
| Alkalinity adjustment | `calculateAlkalinity` | `RESOLVED` (Phase 7S) | 1.4 lbs/10,000gal/10ppm | Indiana DOH, PHTA's own dosing table (Phase 7T); a PHTA fact-sheet prose figure of 1.5 lbs was found and documented (not acted on -- Phase 7T item 7T-05) |
| CYA | `calculateCYA` | Not independently source-verified (out of scope for 7S/7T/7U -- not one of the named priority findings) | 13 oz/10,000gal/10ppm | Unaudited |
| Salt | `calculateSalt` | `VERIFIED_MATH` (Phase 7S) | 1 lb/10,000gal/12ppm | Independently re-derived from water-density physical constants |

## Documentation-only formulas (`scripts/data/formulas-data.js`, not wired to any live calculator)

| Formula | Page | Status | Provenance |
|---|---|---|---|
| `formula-02` (liquid chlorine) | `formulas/liquid-chlorine-formula` | `RESOLVED` (Phase 7S) | Matches the live implementation; same evidence as above |
| `formula-03` (calcium hypochlorite shock) | `formulas/shock-formula` | `RESOLVED` (Phase 7T) | Corrected `/800` -> `0.013344`-based; PHTA + site dataset cross-validation. **Must remain as corrected -- do not reopen without direct contradictory evidence (Section 13).** |
| `formula-04` (pH adjustment) | `formulas/ph-adjustment-formula` | `REQUIRES_EXPERT_REVIEW`, abandoned worked example intentionally left uncorrected (Phase 7T) | None -- documents an equation (`0.0833 ÷ Acid%`) not implemented anywhere |
| `formula-05` (alkalinity) | `formulas/alkalinity-formula` | `RESOLVED` (Phase 7S) | Matches the live implementation |
| `formula-09` (LSI) | `formulas/lsi-formula` | Documentation `RESOLVED` (Phase 7S); no calculator exists and none should be built (standing decision, reconfirmed every phase since Phase 7R) | Sourced lookup tables in `data/datasets/water-balance.json` |

## Reference datasets (not live calculator inputs; descriptive/documentation only)

`scripts/data/dataset-dosage-matrices.js` (13 records): 6 records now carry explicit Phase 7S/7T/7U cross-validation citations in their `notes` field (2 liquid chlorine, Phase 7S; 4 dry chlorine-shock products, Phase 7U -- see `PRODUCTION-CHANGES.md`). The `muriatic-acid-31pct-ph` record is explicitly flagged this phase as unsourced (editorial-interpretation tier) and not used as evidence for any pH architecture decision. The remaining 6 records (alkalinity-reduction, pH-increase via soda ash, calcium hardness, CYA, salt) were not re-audited this phase -- out of scope (not one of the two named priorities).

## How future formula changes must be approved

Consistent with the protocol established and followed across Phases 7R-7U:

1. A change to a `RESOLVED` formula's numeric constant requires **direct evidence that the resolution was materially wrong** -- not a rounding-level discrepancy (the accepted bar, per the Director's explicit guidance in the Phase 7S and 7T assessments, is roughly the ~4-7% range seen in the liquid-chlorine 12%-strength and alkalinity PHTA-prose comparisons; an order-of-magnitude or clearly-impossible-value error, as liquid chlorine and formula-03 both were pre-correction, meets the bar).
2. A change to a `REQUIRES_EXPERT_REVIEW`/`ARCHITECTURAL_GAP` item requires either (a) a newly-sourced, fully-read authoritative document supplying the missing model/table, or (b) an explicit Director architecture authorization to implement a specified, evidence-backed option from a `ARCHITECTURE-DECISION-MATRIX.csv`-style report (as this phase produced for pH and shock).
3. Every change must be made at the smallest authoritative source (the `scripts/data/*.js` file a generator controls), never by hand-patching generated JSON/HTML.
4. Every change must update all dependent consumers (live calculator constants, documentation formula, trust panel, dataset) in the same pass -- a change to only one, as happened before Phase 7S discovered `js/calculator.js`'s duplicate liquid-chlorine implementation, is itself a defect to catch, not a acceptable end state.
5. Every change must be accompanied by a regression test and a decision-ledger entry (this phase's `ARCHITECTURE-DECISION-MATRIX.csv`, or a future phase's equivalent) with evidence IDs traceable to `scripts/data/chemistry-sources.js`.

## Explicitly not reopened this phase

`formula-02`/liquid-chlorine live implementation (Phase 7S `RESOLVED`), `formula-05`/alkalinity (Phase 7S `RESOLVED`, including the documented-but-not-acted-on PHTA prose discrepancy), `formula-09`/LSI documentation and the standing no-LSI-calculator decision (Phase 7R/7S/7T), `formula-03`/calcium hypochlorite shock (Phase 7T `RESOLVED`). No evidence found this phase contradicts any of these.
