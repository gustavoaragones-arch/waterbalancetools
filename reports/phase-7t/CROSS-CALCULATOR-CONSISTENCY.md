# Phase 7T -- Cross-Calculator Consistency Audit

Bounded check across liquid chlorine, generic chlorine, granular chlorine, shock, alkalinity, and pH, confirming Phase 7S and 7T fixes did not establish mutually contradictory assumptions.

## ppm meaning

All six calculators treat `ppm` as `mg/L` by weight, consistent with the standard pool-industry convention and with `entities/ppm.html`'s existing definition. No contradiction found.

## FC increase convention

Liquid chlorine, tablets, and formula-03 (this phase) all compute `ΔFC = Target − Current`, clamped to non-negative where applicable. `calculateShock` takes a single `targetPpm` treated as the desired *increase* (not an absolute target), matching its callers' preset labels ("raise by 10 ppm"). No contradiction -- the two functions model different things (delta-from-current vs. flat-increase-amount) but neither is presented as the other.

## Product strength / mass-balance constant

Liquid chlorine (`formula-02`, `js/calc-utils.js`) and calcium hypochlorite shock (`formula-03`, this phase) now both use the identical `0.013344` mass-balance constant. This was not true before this phase -- `formula-03` previously used an unrelated, incorrect `800` divisor. This phase's fix directly resolves what would otherwise have been a cross-calculator inconsistency (two chlorine-dosing formulas using two unrelated, non-convertible constants for what is physically the same relationship). The generic granular/shock divisor (`10000`, unchanged, `REQUIRES_EXPERT_REVIEW`) remains dimensionally inconsistent with both -- documented in `SHOCK-DIVISOR-AUDIT.md`, not fixed, since (unlike formula-03) it has no product-identity input to anchor a correction to.

## Dosing units

Liquid chlorine: fl oz. Tablets: oz. Granular/shock (generic): oz, convertible to lbs. formula-03 (cal-hypo): oz, convertible to lbs (this phase, matching the site's own `dosage-matrices.json` cal-hypo entries' "oz (dry)" convention). Alkalinity: oz and lbs (both returned). pH: oz (undifferentiated by product). No unit-labeling contradiction remains between formula-02, formula-03, and the alkalinity formula after this phase's fix; formula-03's own internal oz/lbs mislabeling (fixed this phase) was the only true unit-consistency defect found in this scope.

## Volume units

All six calculators take gallons. None mix liters into a live calculation (liter conversions exist only as a separate, clearly-labeled display/reference conversion elsewhere on the site, out of this audit's scope). No contradiction.

## Concentration assumptions

Liquid chlorine and formula-03 both require an explicit user-supplied strength/available-chlorine percentage -- consistent design. The generic granular/shock calculator and the pH calculator both lack any concentration/product input at all -- also internally consistent with each other (both are "generic, no product identity" tools), though both are flagged (independently, in their own audits) as scientifically incomplete for that same reason. This is a real, shared architectural pattern worth naming: **the two REQUIRES_EXPERT_REVIEW/ARCHITECTURAL_GAP items in this phase (generic shock divisor, pH model) share the same root cause -- a generic calculator with no product/state-variable input, applied to a physical relationship that genuinely depends on that missing input.** This is noted as a pattern, not remediated as a single fix, since the two calculators need different missing inputs (product% vs. TA+CYA) and are otherwise unrelated.

## Target ranges

pH (7.2-7.8, ideal 7.4-7.6) and total alkalinity (60-180 ppm, ideal 80-100 or 100-120 depending on sanitizer) target ranges used elsewhere on the site were independently cross-checked against PHTA's own target-range table (`phta-water-chemistry-adjustment-guide-2021`, B-1) this phase and found consistent. No contradiction found; no change needed.

## Shock terminology

"Shock," "granular shock," "breakpoint chlorination," "superchlorination," and "maintenance shock" are used across `formula-03`, the shock calculators, and `entities/shock-treatment.html`/`entities/breakpoint-chlorination.html`. This phase did not find any calculator or formula page asserting these terms are interchangeable in a way that contradicts another page -- `formula-03`'s explanation already distinguishes breakpoint (10× CC), maintenance (10 ppm), and algae recovery (20-30 ppm) as separate scenarios, and the shock-architecture audit (above) confirms the live calculator's presets are presented as flat FC-increase tiers, not as claims about which named scenario they represent.

## Chlorine-equivalent terminology

"Available chlorine %," "active chlorine," and "free available chlorine (FAC)" are used across formula-02, formula-03, and the PHTA sources cited this phase without contradiction -- all consistently refer to the fraction of a product's mass that is active chlorine by weight, the same quantity the `0.013344` mass-balance constant is defined against.

## Conclusion

No cross-calculator contradiction found beyond the formula-03/formula-02 constant mismatch this phase already resolved. No additional production change required from this audit.
