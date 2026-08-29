# Phase 7T -- pH Adjustment Model Audit (Priority A)

## Current implementation, exhaustively enumerated

**`js/calc-utils.js` `calculatePHAdjustment(gallons, currentPh, targetPh)`:**
- Inputs: pool volume (gal), current pH, target pH. No total alkalinity, temperature, cyanuric acid, or product-concentration input of any kind.
- `diff = target − current`. If `|diff| < 0.05`, returns zero (no-op deadband).
- If raising pH: `ounces = (gallons / 10000) × diff × 6`.
- If lowering pH: `ounces = (gallons / 10000) × |diff| × 5`.
- Output: a single ounce figure and a direction ("increaser"/"reducer"). No product identity, no concentration, no unit-of-active-ingredient distinction.

**`js/calculator.js` `phIncreaserOunces`/`phReducerOunces`:** identical constants (6, 5), identical formula shape, a second independent implementation (same duplication pattern Phase 7S found and left in place for liquid chlorine).

**`formulas-data.js` `formula-04` (documentation):**
- States: `Acid dose (fl oz) = ΔpH × Volume (gal) × (0.0833 ÷ Acid Concentration %)`.
- This equation is **not implemented anywhere** -- neither `calc-utils.js` nor `calculator.js` reads an acid-concentration input or uses the constant `0.0833`. The live calculator has no concept of "which acid, what %."
- The worked example computes `Dose = 0.4 × 15,000 × 0.264 ÷ 10,000` and **never states the numeric result of that expression** -- it abandons the calculation mid-formula and switches to an unrelated, separately-sourced rule-of-thumb ("31.5% muriatic acid drops pH by 0.2 per 10,000 gal using approximately 10 fl oz") to reach a final answer. This is the same "abandoned equation" defect pattern found and left unresolved in Phase 7S (Category C in `scripts/test-phase-7s.js`), reconfirmed unchanged at the start of this phase.
- Limitations section already self-discloses: "Total alkalinity has a major effect on how much pH shifts per dose of acid... Pools with alkalinity above 150 ppm may need 2-3x the estimated dose."

**Product/units:** the live calculator's output unit ("oz") is not tied to any specific declared product -- unlike liquid chlorine and formula-03 (both of which take an explicit strength/available-chlorine percentage), pH adjustment collects no product-identity input at all. It cannot distinguish 31.45% muriatic acid from 20% muriatic acid from dry acid (sodium bisulfate), yet returns a single "ounces" figure regardless.

**Is pool volume the only water-property input?** Yes, confirmed -- `gallons`, `currentPh`, `targetPh` are the complete input set. No TA, no temperature.

## Model candidates tested against available evidence

**A. TA-independent model (current implementation).** No authoritative source found states a defensible TA-independent acid dose. The current 6/5 constants have no traceable derivation or citation in the codebase and no external corroboration was found for them specifically.

**B. TA-aware model.** A TA-aware formula would need at minimum a validated function `dose = f(ΔpH, Volume, TA)`. No authoritative source found publishes such a function in closed form. The closest available evidence (below) gives a single reference point (dose at TA≈100 ppm) with only a qualitative statement that higher TA requires proportionally more acid -- not a validated functional form across the TA range the site's calculators already accept (60-180 ppm per PHTA's own target-range table).

**C. Product-specific dosing-table model.** PHTA's own "Water Chemistry Adjustment Guide" (`phta-water-chemistry-adjustment-guide-2021`) is the exact table format already used to resolve liquid chlorine, alkalinity, and (this phase) formula-03 -- and it gives a clean, single-number dose for every other parameter in the guide (chlorine products, alkalinity, calcium hardness, CYA, dechlorination). **Its "Increase/Decrease pH" row contains no dosing figure at all.** It reads only: *"For more information on pH adjustments, see the pH Adjustment Testing section in the Chemical Testing chapter."* This is a deliberate editorial choice by the same authoritative body whose table format this project already trusts for every other parameter -- not an oversight. It is a direct, primary-source signal that PHTA does not consider pH adjustment reducible to the same kind of fixed dosing-table entry as the other parameters.

**D. Rule-of-thumb approximation.** The one closed-form number found during general web research (not from a primary document this session fetched and read in full -- see Limitations) was "≈25.6 fl oz of 31.45% muriatic acid lowers pH of 10,000 gal by 0.2 units at TA≈100 ppm," attributed in secondary summaries to PHTA course materials. This session could not independently fetch and read that specific source in full (see below), so it is **not used as evidence** for a production change, consistent with Section 9's prohibition on search-snippet-only evidence.

## Why TA is not the only confound

The PHTA Alkalinity fact sheet (`phta-alkalinity-fact-sheet-2021`), read in full, supplies a "Cyanuric Acid Correction Factor" table (pH 7.0-8.0 → factor 0.23-0.36) used to compute *carbonate* alkalinity from a raw *total* alkalinity reading, because cyanurate ions contribute to a TA test result without contributing to true pH-buffering carbonate alkalinity. This is a primary-source confirmation that **CYA measurably confounds a raw TA reading** in exactly the water-balance context (buffering capacity) that governs how much acid a given ΔpH requires. A model that adds TA as an input without also accounting for CYA would still be an approximation, not a validated closed-form dose -- and the site's pH calculators do not collect CYA either.

## Determination

**Can the site's current pH-dosing model be scientifically specified from available evidence without inventing missing state variables? No.**

- A TA-independent model (current) has no supporting derivation.
- A TA-aware model requires an input (TA) the calculator does not collect, and even a TA-aware model is incomplete without a CYA correction, a second input the calculator also does not collect and industry guidance treats as necessary for an accurate buffering calculation.
- The authoritative professional-standard body whose dosing-table format this project already relies on for every other parameter deliberately excludes pH from that same table and defers to an empirical test procedure (an "Acid Demand Test," the standard practice in professional test kits) rather than a formula.

This is Section 4's explicit trigger: **TA is mathematically necessary for a defensible pH-dose prediction, and the current calculator architecture lacks that required input.**

## Classification

- **Current implementation's numeric constants (6, 5) and `formula-04`'s undocumented `0.0833` constant: `REQUIRES_EXPERT_REVIEW`.** No conclusive evidence establishes or refutes either; both remain unchanged.
- **The underlying computational architecture (a 2-variable pH+volume-only model, with no TA or CYA input, used where the authoritative professional reference defers to empirical testing): `ARCHITECTURAL_GAP`.** The scientifically correct tool is an acid-demand-test-based calculator (user performs a titration, the calculator scales the result), or at minimum a TA-and-CYA-aware model backed by a validated closed-form equation -- neither of which this phase establishes. Per Section 4's explicit instruction, **a TA input is NOT added this phase** -- doing so without the complete model and its UX/data implications would repeat exactly the mistake this phase is designed to avoid.

## Production changes made

**None.** `js/calc-utils.js`, `js/calculator.js`, and `formulas-data.js` `formula-04` are unchanged. The abandoned-mid-calculation worked example in `formula-04` is a genuine, previously-identified documentation defect, but correcting it responsibly requires first resolving which model (TA-independent vs. TA-aware) the corrected worked example should demonstrate -- which this audit has just determined cannot be conclusively resolved. Patching only the arithmetic while leaving the underlying model question open would misrepresent the audit's own finding. Left unchanged and flagged.

## Limitations / what would resolve this

- This session could not fetch and read in full the specific PHTA course-material page referenced in secondary summaries as containing "≈25.6 fl oz per 0.2 pH per 10,000 gal at TA≈100." If a future phase can locate and fully read that primary document (or an equivalent authoritative TA-aware dosing table, ideally also addressing CYA's confound), it could supply the missing functional form needed to responsibly resolve this to either a documented TA-aware formula or a validated single-reference-point approximation with an explicit, sourced TA-scaling caveat.
- A genuinely complete resolution likely requires an architecture decision (does the site want to collect TA and CYA on the pH calculator, or build an acid-demand-test-based tool instead) that is a product decision, not a pure evidence question -- explicitly out of this phase's mandate per Section 4 ("do not silently add a TA input unless the phase establishes the complete model").
