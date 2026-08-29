# Phase 7T -- Generic Shock/Granular Divisor Audit (Priority B)

## What the divisor mathematically represents

`js/calc-utils.js`: `calculateChlorine`'s `granular`/`shock` branch and the standalone `calculateShock(gallons, targetPpm)` function both compute `ounces = (gallons × ppm) / 10000` -- i.e. an implicit assumption of exactly **1.0 oz of an unnamed product per 10,000 gallons per 1 ppm FC increase**. `js/calculator.js`'s `granularShockOunces` is the same formula, unchanged.

## Complete dimensional derivation, product held generic

The site's own already-validated mass-balance relationship (Phase 7S, reused and re-confirmed for formula-03 this phase) is:

```
oz of product = ΔFC(ppm) × Volume(gal) × 0.013344 ÷ Available_Chlorine(%)
```

For this to reduce to a divisor of exactly `10000` (i.e. `oz = ppm × gal / 10000`), the implied `Available_Chlorine%` must satisfy:

```
1 / 10000 = 0.013344 / Available%
Available% = 0.013344 × 10000 = 133.44
```

**A product cannot be 133.44% available chlorine.** The generic "1 oz/10,000gal/1ppm" divisor is not merely unsourced -- it does not correspond to any physically possible chlorine concentration. It is neither a scaled-down version of a real product's dosing rate nor a plausible average of several real products; it is dimensionally inconsistent with the mass-balance relationship the rest of the site's (now-corrected) chlorine formulas use.

## Cross-check against every named product this session found authoritative dosing figures for

| Product | Available Cl% | oz per 10,000 gal per 1 ppm (from `133.44/%`) | Authoritative match |
|---|---|---|---|
| Chlorine gas | 100% | 1.33 | PHTA table states 1.3 oz |
| Sodium hypochlorite | 12% | 11.12 | PHTA/Indiana DOH table: 10.7 fl oz (within ~4%, normal rounding -- see Phase 7S liquid-chlorine audit) |
| Sodium hypochlorite | 10% | 13.34 | Site's own corrected dosage-matrices entry: 13.3 oz |
| Calcium hypochlorite | 65% | 2.05 | Site dataset: 2.0 oz |
| Calcium hypochlorite | 67% | 1.99 | PHTA table: 2 oz |
| Calcium hypochlorite | 73% | 1.83 | Site dataset: 1.8 oz |
| Lithium hypochlorite | 35% (typical) | 3.81 | PHTA table: 3.8 oz |
| Dichlor | 62% | 2.15 | PHTA table: 2.1 oz |
| Dichlor | 56% | 2.38 | PHTA table: 2.4 oz |
| Trichlor | 90% | 1.48 | PHTA/Indiana/site dataset: 1.5 oz |

**No product, at any commercially available concentration, yields a coefficient of 1.0.** The closest is chlorine gas at 100% strength (1.3 oz per the PHTA table -- itself not exactly 1.0, and chlorine gas is essentially never used in residential pools, the site's primary audience). Every dry/liquid consumer product ranges from roughly 1.3 to 3.8 oz per 10,000 gal per 1 ppm depending on concentration.

## Is the generic divisor (1) mathematically derived, (2) product-specific, (3) a rule of thumb, (4) an undocumented assumption, or (5) simply wrong?

**(4) An undocumented assumption that does not correspond to any real product**, per the dimensional check above. It is not "simply wrong" in the sense of a transcription error (like the pre-Phase-7S liquid chlorine divisor was) -- it does not correspond to a plausible but mistaken concentration. It is a placeholder value with no traceable derivation anywhere in the codebase, comments, or prior phase reports.

## Manufacturer/product-label research

PHTA's Calcium Hypochlorite fact sheet (`phta-calcium-hypochlorite-fact-sheet-2021`, read in full) states explicitly: *"The amount of product to be used or dispensed depends upon the specific application and the volume of water being treated... The label use instructions will explain how to determine a typical dosage for the water volume to be treated."* This is a primary-source, professional-standards-body confirmation that **exact dosing is inherently product-specific** and that PHTA itself does not publish (nor endorse inferring) a single generic number independent of the actual product and its label. This directly supports treating "generic shock/granular" as an unresolvable question without either (a) picking a specific product to model, which the calculator's own generic framing does not do, or (b) collecting a product-identity input from the user, which is an architecture change.

## Outcome

The existing generic UI (a single "granular shock" input with no product selector) can only remain scientifically defensible as generic if the underlying number represents either a genuine industry-average or an explicitly-disclosed simplification. Neither holds: the number is dimensionally impossible as a real concentration, and no source (including three fully-read PHTA/government-tier documents) supports a defensible "generic" figure across dry chlorine products, which range roughly 1.3-3.8x higher than the current 1.0 assumption depending on the specific product chosen.

- **Classification: `REQUIRES_EXPERT_REVIEW`** for the specific numeric divisor, carried forward unchanged from Phase 7S -- now with a stronger, dimensionally-precise basis for why no single number is defensible, rather than merely "no authoritative source was found."
- **Classification: `ARCHITECTURAL_GAP`** for the underlying architecture question -- a scientifically defensible generic shock calculator requires either a product-selection input (converting it into the same pattern as liquid chlorine/formula-03, which already ask for a strength percentage) or an explicit, clearly-labeled "average dry chlorine product" disclosure with a citable basis for the chosen average. This phase does not select or implement either, per Section 5's explicit instruction not to invent a universal divisor and Section 12's stop rule (an expert/product decision, not a pure evidence gap).

## Production changes made

**None.** The generic divisor is unchanged. No UX redesign was performed, per the explicit instruction not to redesign UX merely because the current model is imperfect.
