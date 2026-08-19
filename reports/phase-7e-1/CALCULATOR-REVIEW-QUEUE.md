# Calculator Review Queue

Builds on `reports/phase-7e/CALCULATOR-PROVENANCE.md`, re-organized into the four required categories per calculator. `js/calc-utils.js` was **not modified**.

## Pool Chlorine Calculator

| Item | Category | Status |
|---|---|---|
| Target 1-3 ppm (no CYA) / 2-4 ppm (with CYA) | SUPPORTED TARGET RANGE | Cited in production (`claim-fc-pool-no-cya`, `claim-fc-pool-with-cya`) |
| `oz = (gal × Δppm) / 128000` (liquid 10%) | DOSING CONSTANT | `CALCULATOR_REVIEW_REQUIRED` — product-concentration assumption never independently verified |
| Granular/tablet divisors (10000 / 12000) | DOSING CONSTANT | `CALCULATOR_REVIEW_REQUIRED` |
| Overall dosing model (linear scaling by volume × ppm gap) | FORMULA ASSUMPTION | Standard, plausible industry approach; not independently verified against a manufacturer/regulatory reference |

## Hot Tub Chlorine Calculator

| Item | Category | Status |
|---|---|---|
| Target 3-5 ppm | SUPPORTED TARGET RANGE | Cited in production (`claim-fc-hottub-routine`) |
| Same dosing formula/constants as Pool Chlorine | DOSING CONSTANT | `CALCULATOR_REVIEW_REQUIRED` |

## Pool Shock Calculator

| Item | Category | Status |
|---|---|---|
| Default target 10 ppm | DOSING CONSTANT | `CALCULATOR_REVIEW_REQUIRED` — no confirmed general residential shock-target source (see `SHOCK-CLAIM-FAMILY-DECISION.md`) |
| `oz = (gal × targetPpm) / 10000` | DOSING CONSTANT | `CALCULATOR_REVIEW_REQUIRED` |
| Does not read the user's actual combined-chlorine value (no 10x-CC breakpoint logic) | FORMULA ASSUMPTION | `EXPERT REVIEW REQUIRED` — real methodology gap identified in Phase 7D, not just a citation gap |

## Pool pH Calculator

| Item | Category | Status |
|---|---|---|
| Target 7.0-7.8 (commonly 7.2-7.6) | SUPPORTED TARGET RANGE | Cited (`claim-ph-pool-routine`) |
| Increaser/reducer constants (×6 / ×5 per 0.2 pH per 10,000 gal) | DOSING CONSTANT | Already self-disclosed in the calculator's own code comment as "(simplified estimation)" — no further action needed beyond what's already disclosed |

## All-in-One Chemical Calculator

| Item | Category | Status |
|---|---|---|
| pH, FC, TA, CH target ranges | SUPPORTED TARGET RANGE | Citable per their individual claim families |
| CYA, salt target ranges | EXPERT REVIEW REQUIRED | `claim-cya-routine-outdoor` / `claim-salt-generic` both `REQUIRES_REVIEW`, no confirmed primary source |
| Alkalinity constant (1.4 lb/10,000gal/10ppm), CYA constant (13 oz/10,000gal/10ppm), salt constant (1 lb/10,000gal ≈ 12ppm) | DOSING CONSTANT | `CALCULATOR_REVIEW_REQUIRED`, all three |

## Safety guidance across all calculators

No calculator page's rendered copy makes a specific numeric safety claim beyond the target ranges above (e.g. "wait N minutes before swimming") that was found in the evidence dataset for these 5 pages specifically — general safety guidance lives on dedicated safety/reference pages, already covered in `reports/phase-7e/HIGH-RISK-PROVENANCE-REVIEW.md`.

## Summary

The existence of a source-supported *target range* never validates a calculator's *dosing formula* — this distinction is preserved throughout. Every dosing constant across all 5 calculators remains an open review ticket, not silently treated as validated because its neighboring target range is.
