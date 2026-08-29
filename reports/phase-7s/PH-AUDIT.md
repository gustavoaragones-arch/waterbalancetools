# Phase 7S -- pH Adjustment Audit (P1-D)

## The question

`js/calc-utils.js` / `js/calculator.js`: `oz = (gal/10000) x pH_diff x 6` (increaser, e.g. soda ash) or `x 5` (reducer, e.g. muriatic/dry acid). `formulas-data.js`'s `formula-04` documents a different equation: `Acid dose (fl oz) = ΔpH × Volume(gal) × (0.0833 ÷ Acid Concentration %)`, and its worked example abandons that equation mid-calculation for an unreferenced "commonly used rule-of-thumb." Which, if either, is correct?

## Why this is fundamentally different from the liquid-chlorine and alkalinity cases

Chlorine-ppm and alkalinity-ppm dosing both reduce to a **direct mass-balance relationship**: a known mass of a known-purity substance dissolved in a known volume of water produces a directly calculable ppm change, independent of the water's other chemistry. This is why a clean, government-table-verifiable constant exists for both.

**pH does not work this way.** The amount of acid or base required to shift pH by a given amount is fundamentally dependent on total alkalinity (TA), which acts as a buffer. This is not a minor caveat -- it is the core chemistry: the same acid dose that drops pH by 0.4 in a low-TA pool might barely move pH at all in a high-TA pool. `formula-04`'s own "Limitations" section already says so ("Pools with alkalinity above 150 ppm may need 2-3x the estimated dose for the same pH change"), and the Indiana DOH government table used to resolve the chlorine/alkalinity findings **does not publish a standalone "ppm-pH-per-dose" figure at all** -- its acid-dosing entries are exclusively for *total alkalinity* reduction (26 fl oz of 31.4% muriatic acid per 10,000 gal per 10 ppm TA decrease), not for a TA-independent pH figure.

## What was checked

- The Indiana DOH table (`in-doh-chemical-adjustment-2021`): confirms TA-reduction dosing, provides no pH-specific figure.
- The PHTA sources already registered from Phase 7Q/7R (calcium hypochlorite, water conservation, drought fact sheets): none provide a pH-dose-per-pH-unit figure independent of TA.
- No new source search specifically for "muriatic acid pH dose per pH unit" was performed this phase beyond checking the already-registered chemistry-sources.js entries, because Section 12's stop condition applies directly here: *"a dosing constant depends on an unspecified product concentration"* -- more precisely here, a dosing constant that is inherently a function of a *second, unspecified* parameter (TA), not a fixed constant at all. No single "correct" ΔpH-to-dose constant can exist independent of TA; publishing one (calc-utils.js's 6/5, or formulas-data.js's 0.0833-based equation, or any third number) is necessarily a simplification, not a fact to be looked up.

## Internal-consistency defects found (documented, not resolved)

`formula-04`'s worked example has the same class of defect found in the liquid-chlorine and alkalinity formulas: it states the documented equation, computes an intermediate value ("Constant for 31.5% acid: 0.0833 ÷ 0.315 = 0.264"), then silently introduces an undocumented extra `÷ 10,000` term ("Dose = 0.4 × 15,000 × 0.264 ÷ 10,000") not present in the equation as originally stated -- making the *equation itself*, as literally written on the page, dimensionally incomplete (missing a gallons-normalization term). It then abandons this entirely for a third, unreferenced "rule of thumb" (10 fl oz per 10,000 gal per 0.2 pH) to reach its final answer.

## Disposition

**Classification: REQUIRES_EXPERT_REVIEW.** Per Section 8's explicit stop-rule, and Section 12's boundary ("If two credible sources support different formulations... and the repository lacks enough information to choose between them: STOP"), this phase does NOT alter `js/calc-utils.js`, `js/calculator.js`, or `formulas-data.js`'s pH-adjustment equation or worked example. Choosing between the calculator's 6/5 constants, the documented 0.0833-based equation, and the abandoned "rule of thumb" would require either (a) a real TA-aware dosing model (a genuine formula-architecture change, out of this phase's mandate per Section 13's "do not redesign calculator UX broadly"), or (b) picking one of three unreconciled numbers without evidence to prefer one -- exactly what this phase must not do.

**What an expert decision would need to resolve:**
1. Whether the calculator should remain a simplified, TA-independent linear approximation (current architecture, already self-disclosed as such) or be redesigned to take TA as an input (an architecture change).
2. If it remains a linear approximation: which constant (6/5, as implemented; or a value derived from the 0.0833-based equation once its missing normalization term is fixed; or a different published rule-of-thumb) has actual primary-source support, at a specified reference TA.
3. A specific, named source that states an acid/base dose-per-pH-unit figure *at a stated reference alkalinity* -- not found by this phase's research.

**Production changes: none to the pH formula/calculator.** No claim was promoted to SUPPORTED. The internal equation-inconsistency finding is recorded here and in `DECISION-MATRIX.csv` for a future phase with the mandate and evidence to resolve it properly.
