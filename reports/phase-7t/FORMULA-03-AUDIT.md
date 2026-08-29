# Phase 7T -- formula-03 Calcium Hypochlorite Audit (Priority C)

## Exact pre-fix implementation

`formulas-data.js` `formula-03` (documentation only -- confirmed via Phase 7S's `SHOCK-AUDIT.md` and re-confirmed this phase that `calculators/pool-shock-calculator.html`'s live JS uses the generic, product-unaware `calculateShock` function, never this equation):

- Equation: `Shock dose (oz) = [(Target FC − Current FC) × Volume (gal)] ÷ [Available Chlorine (%) × 800]`
- Output unit stated: **oz**
- Worked example (65% cal-hypo, 4 ppm increase, 20,000 gal): `80,000 ÷ 52,000 = 1.54`, labeled **lbs** in the prose ("You need approximately 1.5 lbs")

## Unit-label defect, confirmed

The equation header states the output is in ounces; the worked example computes the identical numeric expression and calls the result pounds. `1.54 lbs = 24.6 oz`, not `1.54 oz` -- the equation and its own worked example do not describe the same unit for the same computed number. This is dimensionally incoherent as written, independent of whether the numeric constant is correct.

## Is the numeric result correct under either interpretation?

**Interpreted as OZ** (`oz = (ppm×gal)/(Available%×800)`): at 67% cal-hypo, 1 ppm, 10,000 gal → `10000/(67×800) = 0.187 oz`. PHTA's Water Chemistry Adjustment Guide and Indiana DOH both state **2 oz** for the same product/conditions -- the "oz" interpretation is roughly **10.7x too low**.

**Interpreted as LBS** (`lbs = (ppm×gal)/(Available%×800)`): at 67%, 1 ppm, 10,000 gal → `10000/(67×800) = 0.187 lbs = 2.99 oz`. Compared to the authoritative 2 oz figure, this is roughly **1.5x too high** -- closer, but still wrong, and this is the ~1.5x discrepancy Phase 7S flagged without resolving.

Neither interpretation of "800" reproduces the authoritative figure. The constant itself is wrong, not merely mislabeled.

## What "800" actually encodes

Solving for what per-pound ppm-increase-per-10,000-gal assumption would make `lbs = (ppm×gal)/(Available%×800)` true: this is algebraically equivalent to assuming **1 lb of 100%-available chlorine raises 10,000 gallons by 8 ppm** (`10,000 × 8 / 100 = 800`). The dimensionally correct value, independently derived from the same 8.34 lb/gal water-density mass-balance relationship already established and cross-validated for liquid chlorine in Phase 7S, is **1 lb of 100%-available chlorine raises 10,000 gallons by approximately 12 ppm** (`1 lb = 16 oz`; `16 / 1.3344 oz-per-ppm-per-10,000gal ≈ 12`). "800" corresponds to an uncited, incorrect "8 ppm per lb" assumption where the correct value is "12 ppm per lb" -- explaining both the ~1.5x-too-high result under the lbs interpretation and confirming this is a genuine `IMPLEMENTATION_ERROR`, not a product-ambiguity problem (unlike the generic shock divisor in `SHOCK-DIVISOR-AUDIT.md`, this equation already collects an explicit `Available Chlorine%` input, so there is no missing product-identity variable here).

## Corrected derivation and independent corroboration

Using the same mass-balance constant already established, sourced, and Director-approved for liquid chlorine (`0.013344` oz of 100%-available product per ppm per gallon, from `1,000,000 lb / 120,000 gal` ≡ `8.34 lb/gal` water density):

```
oz = ΔFC(ppm) × Volume(gal) × 0.013344 ÷ Available_Chlorine(%)
```

Cross-checked against three data points, all convergent -- but only one is independent external evidence; the other two are this site's own pre-existing internal data, useful as corroboration but not as independent confirmation:

| Source | Independence | Product | Available% | Stated dose (10,000 gal, 1 ppm) | Formula result |
|---|---|---|---|---|---|
| PHTA Water Chemistry Adjustment Guide (`phta-water-chemistry-adjustment-guide-2021`) | Independent external evidence | Calcium hypochlorite | 67% | 2 oz | 1.99 oz |
| This site's own `dataset-dosage-matrices.js` (pre-existing, unrelated to this phase) | Internal, corroborating only | Calcium hypochlorite | 65% | 2.0 oz | 2.05 oz |
| This site's own `dataset-dosage-matrices.js` (pre-existing, unrelated to this phase) | Internal, corroborating only | Calcium hypochlorite | 73% | 1.8 oz | 1.83 oz |

All three converge with the formula-derived value to within normal rounding (≤3%). The evidentiary basis for this resolution is the first-principles mass-balance derivation combined with the single independent external source (PHTA's table); the two site-dataset entries corroborate but do not independently establish the result, since they originate from this project's own prior work rather than a separately-authored source.

## Classification

**`IMPLEMENTATION_ERROR` + `DOCUMENTATION_ERROR`, `RESOLVED`.** The constant `800` is replaced with the same `0.013344`-based mass-balance formula already used for `formula-02` (liquid chlorine), and the output unit is stated and used consistently (oz, matching the site's own cal-hypo dataset entries' unit convention).

## Production change made

`scripts/data/formulas-data.js` `formula-03`:
- **Equation**: `[(Target FC − Current FC) × Volume] ÷ [Available Chlorine% × 800]` → `(Target FC − Current FC) × Volume(gal) × 0.013344 ÷ Available Chlorine(%)`.
- **Worked example**: recomputed for the same scenario (20,000 gal, 1→5 ppm via breakpoint, 65% cal-hypo) → `4 × 20,000 × 0.013344 ÷ 65 = 16.4 oz (1.03 lbs)`, replacing the old `1.54 lbs` figure. Unit stated consistently as oz throughout, with the lbs conversion shown alongside for practical dosing (matching how the site already presents shock-calculator output).
- **Explanation and limitations**: updated to state the shared mass-balance relationship with liquid chlorine, cite the PHTA/site-dataset convergence, and add PHTA's Calcium Hypochlorite fact sheet's caveat that exact dosage is product/label-specific.
- **References**: added the two PHTA sources fetched and read in full this phase.
- No calculator JS, no calculator UI, and no other formula were changed. `formula-03` is documentation-only (not read by any live calculator), so this is the same low-risk change class Phase 7S used for the alkalinity documentation fix.

## Validation

```
node -e "console.log((4*20000*0.013344/65).toFixed(2), (4*20000*0.013344/65/16).toFixed(2))"
16.42 1.03
```
Matches the corrected worked example. Regression test added in `scripts/test-phase-7t.js` (category I).
