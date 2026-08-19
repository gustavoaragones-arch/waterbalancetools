# Calculator Methodology

## What already existed

`methodology/calculation-assumptions/`, `methodology/known-limitations/`, and the per-calculator "Assumptions" / "Known Limitations" links in every Trust Panel already document: calculations are mathematical models based on documented inputs; calculators do not test water; output depends on user-provided measurements; manufacturer instructions may supersede generic calculations. This existing content was audited and found consistent with the non-negotiable rules — it does not claim every formula is scientifically validated.

## What was corrected this phase

The Trust Panel's **confidence badge**, which appears on every calculator page, is the primary reusable "trust block" the brief asks for (`## How this calculation was reviewed`, formula/dataset version, confidence level, last-reviewed date, links to Methodology/Assumptions/Known Limitations/Rounding Policy/Revision History — all already present). Rather than build a second, duplicate trust block next to it, this phase corrected the **accuracy** of the existing one, since Phase 7E's independent calculator audit found its confidence claims for 6 of 11 formulas were overstated (see `TRUST-LANGUAGE-AUDIT.md`). This avoids exactly the "duplicate trust block" / "no calculator may embed scientific values not traceable to source" problems the brief warns against.

## Distinction preserved: target range vs. dosing formula

Every corrected record's `notes` field now explicitly separates these two claims, per Phase 7D/7E's own distinction:
- **Target range** (e.g. "1-3 ppm free chlorine"): independently source-supported for pH, free chlorine (pool and hot tub), total alkalinity, calcium hardness.
- **Dosing formula constant** (e.g. "128000 divisor for 10% liquid chlorine"): not independently verified for any of the 6 dosing formulas — chlorine, shock, alkalinity, salt, CYA, and calcium hardness dosing.

A source-supported target range never implies the formula that doses toward it is validated. This is now stated explicitly in the trust data (`scripts/data/trust-formulas.js`, `scripts/data/trust-calculator-metadata.js`) rather than left implicit.

## Existing production Tier-1 citations (Phase 7E, unaffected)

Pool Chlorine Calculator and Hot Tub Chlorine Calculator already render a real external-source citation block (CDC) for their target ranges, added in Phase 7E and confirmed still live and unmodified this phase.

## Calculator functionality

`js/calc-utils.js` was not modified. All corrections were to trust *metadata* (confidence labels, source categories, disclosure notes) — no calculation logic changed.
