# Phase 7S -- Liquid Chlorine Dosing: Deep Audit (P0-A)

## 1. The question

How many fluid ounces of liquid sodium hypochlorite (a given % "available chlorine" strength) must be added to a pool of a given volume to raise free chlorine (FC) by a given ppm?

## 2. First-principles derivation (units shown at every step)

**Step 1 -- what "ppm" means here.** In pool chemistry, "ppm" for a dissolved substance in water is treated as milligrams of substance per liter of water (mg/L), which for dilute aqueous solutions is numerically equivalent to "parts per million by weight" (water's density is close enough to 1.00 kg/L that the distinction is negligible at these concentrations).

**Step 2 -- gallons to mass of water.** 1 US gallon of water weighs 8.34 lb (standard reference value; e.g. used identically in this project's own turnover/volume content). So:

    mass_of_pool_water (lb) = Volume (gal) x 8.34 lb/gal

**Step 3 -- mass of 100%-available-chlorine needed for a 1 ppm increase.** By the definition of ppm-by-weight, raising a mass M of water by C ppm requires a mass of pure substance equal to:

    mass_needed (lb) = C (ppm) x M (lb) / 1,000,000

Substituting Step 2:

    mass_needed (lb) = C x Volume(gal) x 8.34 / 1,000,000

For C = 1 ppm and Volume = 10,000 gal:

    mass_needed = 1 x 10,000 x 8.34 / 1,000,000 = 0.0834 lb

This is the standard, widely-published pool-industry constant ("0.0834 lb of 100%-available chemical per 10,000 gal per 1 ppm"), independently reproduced here from first principles, not looked up.

**Step 4 -- pounds to fluid ounces.** 1 lb = 16 oz (weight, not fluid ounces -- see the caveat in Section 6):

    mass_needed (oz) = 0.0834 x 16 = 1.3344 oz per 10,000 gal per 1 ppm (at 100% available chlorine)

**Step 5 -- adjust for product strength.** A product labeled "X%" available chlorine requires 100/X times as much product by volume to deliver the same available-chlorine mass (assuming the labeled percentage is available-chlorine-by-weight and the product's density is close to water's -- see the caveat in Section 6):

    fl_oz_needed = 1.3344 x (10,000/gal... ) -- expressed generally:

    fl_oz_needed = ppm_increase x Volume(gal) x 1.3344 / (10,000 x Strength%/100)
                 = ppm_increase x Volume(gal) x 0.013344 / Strength%

For 10% product, gal=10,000, ppm=1:

    fl_oz = 1 x 10,000 x 0.013344 / 10 = 13.344 fl oz

**This derivation is VERIFIED_MATH up through Step 4** (pure dimensional analysis from a standard, independently-checkable water-density constant). **Step 5's "density close to water's" assumption is a SUPPORTED_DOMAIN_ASSUMPTION**, not pure math -- real sodium hypochlorite solutions are somewhat denser than water (see Section 6) -- but the resulting error from this assumption is on the order of a few percent, not orders of magnitude.

## 3. Independent authoritative corroboration

**Source:** Indiana Department of Health, Environmental Public Health Division, "Adjusting Chemical Levels in a Swimming Pool" (`in-doh-chemical-adjustment-2021`), fetched as a PDF and read in full (6 pages) on 2026-08-28.

This document independently states the identical relationship, via a different but equivalent route:

> "1.0 ppm equals about .083 lbs of chemical per 10,000 gallons of water... or 1.3 oz per 10,000 gallons... .083 Pounds of Chemical = 1 ppm x (10,000 gallons treated / 120,000). 120,000 is always used in the ppm formula when the chemicals used are weighed in pounds and the water measured in gallons since 120,000 gallons weighs 1 million pounds."

(Their "120,000 gal = 1,000,000 lb" is the same water-density relationship as this audit's 8.34 lb/gal, expressed as a rounded ratio: 1,000,000/120,000 = 8.333 lb/gal, vs. this audit's 8.34 -- a 0.08% difference, i.e. the same constant.)

The document's own "Water Chemistry Adjustment Guide" table (explicitly "adapted from the National Swimming Pool Foundation© Pool & Spa Operator™ Handbook" -- the same handbook already generically cited across dozens of this site's pre-existing pages) states:

> Sodium Hypochlorite (12%): **10.7 fl.oz.** to raise chlorine 1 ppm in 10,000 gallons.

Checking this audit's Step 5 formula at 12% strength: `1.3344/0.12 = 11.12 fl oz` -- within ~4% of Indiana's rounded 10.7. Confirms the derivation and the government table agree, within normal rounding.

**At 10% strength (this site's stated default product), this audit's derivation gives 13.34 fl oz per 10,000 gal per 1 ppm.**

## 4. What the two existing site values actually were, and why they are wrong

| Source | Divisor form | Implied fl oz per 10,000 gal per 1 ppm (10%) | vs. correct (13.34) |
|---|---|---|---|
| `js/calc-utils.js` / `js/calculator.js` (pre-fix) | `(gal x ppm) / 128000` | 10000/128000 = **0.078 fl oz** | ~171x too LOW |
| `formulas-data.js` documented equation (pre-fix) | `(ppm x gal) / (Strength% x 0.0128)` | 10000/(10x0.0128) = **78,125 fl oz** | ~5,857x too HIGH |
| `data/datasets/dosage-matrices.json` "10pct" record (pre-fix) | direct coefficient | **10.7 fl oz** | matches the 12% figure, not 10% (mislabeled) |

No two of the three pre-existing values agreed with each other, and none matched the independently-derived and government-table-corroborated correct value. This is not a case of "two credible sources disagree" (Section 12's STOP scenario) -- it is a case where the derivation and an independent authoritative source converge on one answer that differs from every value already in the codebase.

**Sanity check:** the pre-fix `calc-utils.js` formula would have told a user to add ~0.4 fl oz (about a tablespoon) of 10% chlorine to raise a 20,000-gallon pool's FC by 2.5 ppm -- physically implausible (real-world pool owners routinely add on the order of a pint to a gallon for a comparable adjustment). The corrected formula gives ~66.7 fl oz (about half a gallon), which is consistent with ordinary residential pool-maintenance experience and with the government table.

## 5. Disposition and production changes

**Classification: IMPLEMENTATION_ERROR (calculator code) + DOCUMENTATION_ERROR (formula page) + DATASET_ERROR (dosage-matrices.json), all for the same underlying constant, now resolved with conclusive evidence.**

This meets Section 5's "evidence conclusively establishes the correct implementation" bar: an independent first-principles derivation and a government-authority table (itself citing a recognized professional handbook) converge, within normal rounding, on the same value -- a value neither pre-existing site number matched.

Production changes made (see `PRODUCTION-CHANGES.md` for the full file-by-file log):
- `js/calc-utils.js`: liquid-chlorine divisor `128000` -> `749.4` (derived: `1,000,000 x 0.10 / (8.34 x 16)`).
- `js/calculator.js`: same fix, duplicate implementation.
- `scripts/data/formulas-data.js` (`formula-02`): equation, explanation, and worked example rewritten to use the derived `0.013344` constant; the self-contradictory "Wait -- that looks wrong" text removed; the worked example now shows exactly one final answer (66.7 fl oz).
- `scripts/data/dataset-dosage-matrices.js` (true source; `data/datasets/dosage-matrices.json` is generated from it): `liquid-chlorine-10pct` coefficient corrected 10.7 -> 13.3; `liquid-chlorine-12pct` coefficient corrected 8.6 -> 10.7 (now matching the Indiana table's 12% figure exactly).
- New source registered: `in-doh-chemical-adjustment-2021`.

## 6. Disclosed limitations (not resolved, correctly left as approximation)

- The 0.013344 constant assumes the labeled strength percentage is available-chlorine-by-weight and that product density is close to water's. Real commercial sodium hypochlorite solutions are somewhat denser than water (typically 1.1-1.2 g/mL for 10-12.5% product), which would make the true required volume slightly (not order-of-magnitude) less than this formula predicts. This is now explicitly disclosed in the formula page's Limitations section rather than presented as exact.
- Chlorine demand (immediate consumption by organics in the water) is not modeled -- already disclosed pre-existing text, unchanged.
- This audit did NOT re-derive or change the granular/tablets calculator paths' underlying assumptions beyond the trichlor-tablets correction documented separately (see `CALCULATOR-FORMULA-INVENTORY.csv` and `DECISION-MATRIX.csv`) -- the generic "granular" divisor remains REQUIRES_EXPERT_REVIEW because it is not tied to one specific, identifiable product.
