# Phase 7S -- Alkalinity Audit (P1-C)

## The question

Live calculator constant: **1.4** (lbs sodium bicarbonate per 10,000 gal per 10 ppm TA increase, in `js/calc-utils.js`'s `calculateAlkalinity`). Documentation constant: **1.5 lbs**, in `scripts/data/formulas-data.js`'s `formula-05` explanation text. Which is right?

## Evidence

**Source:** Indiana Department of Health, "Adjusting Chemical Levels in a Swimming Pool" (`in-doh-chemical-adjustment-2021`), read in full. Its "Water Chemistry Adjustment Guide" table states:

> Sodium Bicarbonate: **1.4 lbs** to increase Total Alkalinity by 10 ppm per 10,000 gallons.

This is the same table already used to resolve the liquid-chlorine and trichlor-tablets constants (see `LIQUID-CHLORINE-AUDIT.md`), independently attributed to the National Swimming Pool Foundation Pool & Spa Operator Handbook.

## Finding

**The live implementation (1.4) was already correct.** The documentation (1.5) was the error. This is confirmed by an authoritative government source with a full published table, not a preference between two plausible numbers.

A second, deeper defect was also found and is more significant than the 1.4-vs-1.5 headline number: `formula-05`'s **documented equation itself** (`oz = TA_increase × Volume × 0.0012`) does not reconcile with either value -- for the equation's own stated units (10 ppm, 10,000 gal), it computes 120 oz (7.5 lbs), which matches neither the "1.4" implementation nor the "1.5" prose. The worked example then silently abandons the documented equation ("Dose = 40 × 18,000 × 0.0012 = 864 oz... let's convert") and switches to an unreferenced "simpler rule" to reach its final answer -- the same class of defect found in the liquid-chlorine and pH formulas.

## Disposition and production changes

**Classification: DOCUMENTATION_ERROR** (implementation is correct and evidence-confirmed; the equation, explanation text, and worked example were all wrong or self-contradictory).

`scripts/data/formulas-data.js` (`formula-05`) corrected:
- Equation changed to `oz = TA_increase(ppm) x Volume(gal) x 0.000224` (the constant that actually reproduces the correct, government-table-confirmed 1.4 lbs / 22.4 oz per 10,000 gal per 10 ppm -- verified: `10 x 10,000 x 0.000224 = 22.4 oz = 1.4 lbs`).
- Explanation text changed from "1.5 lbs" to "1.4 lbs," with the Indiana DOH source cited.
- Worked example rewritten to a single, consistent calculation (18,000 gal, 40 ppm increase: `40 x 18,000 x 0.000224 = 161.3 oz = 10.1 lbs`), matching what `js/calc-utils.js` itself computes for the same inputs (verified directly: `(18000/10000)*(40/10)*1.4 = 10.08 lbs`).

**No change to `js/calc-utils.js`** -- it was already correct; only the documentation was brought into agreement with it and with the government table.
