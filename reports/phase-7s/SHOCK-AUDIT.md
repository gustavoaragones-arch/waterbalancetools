# Phase 7S -- Shock Calculator Architecture Audit (P1-E)

## Mandate

Determine whether the existing preset-tier architecture (Light=5ppm / Standard=10ppm / Heavy=15ppm / Double=20ppm) is scientifically coherent and properly documented -- NOT whether to redesign it around the newly-SUPPORTED breakpoint-chlorination rule (Phase 7R). Do not replace the presets with 10x CC.

## What the presets represent

`calculators/pool-shock-calculator.html` and `hot-tub-shock-calculator.html` offer four fixed FC-increase targets (5/10/15/20 ppm). The user selects a tier; `js/calc-utils.js`'s `calculateShock(gallons, targetPpm)` computes `oz = (gallons x targetPpm) / 10000` -- i.e., an implicit, undisclosed assumption of ~1 oz of an unspecified product per 10,000 gal per 1 ppm. The calculator does **not** ask for a current combined-chlorine reading and cannot apply the breakpoint rule (10x CC) even in principle, because it never collects the input the rule requires.

## Is the preset-tier structure itself defensible?

**Yes, as a UX pattern.** Requiring users to first measure combined chlorine (which needs a DPD test kit capable of a two-step FC/TC test, not all consumer test strips support this) before they can get a shock recommendation would exclude many users who only have basic test strips. A simpler "how much do you want to raise it" model is a legitimate, common design choice for a consumer-facing tool, distinct from a professional breakpoint-chlorination calculation. Section 9 explicitly instructs against redesigning around this, and this audit agrees the preset structure itself is not a defect.

## Is the underlying divisor (10,000, i.e. ~1 oz/10,000gal/1ppm) defensible?

**No single product supports it exactly.** Cross-checking against the Indiana DOH government table (`in-doh-chemical-adjustment-2021`) and this site's own `dosage-matrices.json`:

| Product | Indiana table (oz per 10,000gal per 1ppm) |
|---|---|
| Chlorine gas | 1.3 |
| Calcium Hypochlorite (67%) | 2.0 |
| Lithium Hypochlorite | 3.8 |
| Dichlor (62%) | 2.1 |
| Dichlor (56%) | 2.4 |
| Trichlor | 1.5 |

None of these is "1.0." The calculator's UI does not ask which product the user is adding, so there is no way to know which of these (if any) the implicit "1" was meant to represent. This is the same ambiguous-product-assumption problem flagged for the generic "granular/shock" path in the liquid-chlorine audit.

## Does `formulas/shock-formula.html` (formula-03) resolve this?

**No -- and it has its own, separate, previously-undiscovered defect.** `formula-03` documents a percentage-aware equation (`oz = [(Target FC − Current FC) × Volume] ÷ [Available Chlorine% × 800]`) specifically for calcium hypochlorite, with a worked example using 65% cal-hypo. Checking that worked example's own arithmetic: it labels its result "1.54 lbs," but the equation as stated is labeled "Shock dose (**oz**)" -- the worked example silently changes units partway through without flagging it (a milder version of the same "silent inconsistency" pattern found in the liquid-chlorine, alkalinity, and pH formulas). Converting: 1.54 lbs = 24.6 oz for a 20,000-gal pool needing a 4 ppm increase, i.e. ~3.1 oz/10,000gal/1ppm -- about 1.5x higher than the Indiana table's 2.0 oz/10,000gal/1ppm for 65-67% cal-hypo. This is a real, additional inconsistency, but it is NOT the same calculator: `formula-03`'s equation is not implemented by `pool-shock-calculator.html`'s actual JS at all (that page uses the generic, product-unaware `calculateShock` function, never `formula-03`'s cal-hypo-specific equation). The two are independently wrong in different, unreconciled ways.

## Disposition

**Preset-tier UX architecture: SUPPORTED_DOMAIN_ASSUMPTION.** A legitimate, disclosed simplification for a consumer tool; not redesigned, per explicit instruction.

**The generic 10,000 divisor (unspecified product): REQUIRES_EXPERT_REVIEW**, unchanged from Phase 7R -- consistent with the liquid-chlorine audit's treatment of the same ambiguity in the "granular/shock" path.

**`formula-03`'s cal-hypo-specific equation and its oz/lbs unit-labeling inconsistency: REQUIRES_EXPERT_REVIEW, newly discovered this phase, NOT corrected.** Per Section 10's explicit instruction not to expand into a general content audit and not to automatically fix unrelated findings, and because this constant's discrepancy (~1.5x) is smaller and more entangled with a units-labeling question than the liquid-chlorine case's order-of-magnitude, unambiguous error, this phase records it for a future dedicated pass rather than fixing it now.

**No production change made to any shock calculator, its JS, or `formula-03`.** The breakpoint-chlorination rule (Phase 7R, SUPPORTED) is explicitly NOT applied to these calculators -- doing so would require redesigning them to collect a combined-chlorine input, which Section 9 explicitly prohibits in this phase.

## ARCHITECTURAL_GAP note

The site cannot currently offer a breakpoint-based shock calculation (even though the underlying chemistry claim is now SUPPORTED) without a genuine UI/architecture change: adding a combined-chlorine input field, a product-selection step, and a formula path that actually uses `claim-shock-breakpoint-rule`. This is recorded as a distinct, real architectural gap for a future phase's explicit consideration -- not something this phase should build unilaterally.
