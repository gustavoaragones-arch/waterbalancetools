# Phase 7D — Chemistry Conflict Resolution Policy

Applies whenever two credible sources, or two site-content claims, state different values for what looks like the same chemistry parameter.

## Process (in order)

1. **Identify context.** What environment (pool / hot tub)? What sanitizer (chlorine / bromine / SWG)? What scenario (routine maintenance / target range / treatment / shock / troubleshooting)?
2. **Check units.** ppm and mg/L are equivalent for dilute aqueous solutions; a "different" value in different units may not be different at all.
3. **Check sanitizer.** Chlorine and bromine targets are never directly comparable on the same numeric scale.
4. **Check pool vs. spa.** Hot tubs run hotter, hold less water relative to bather load, and have different CDC minimums (e.g. free chlorine >=3 ppm vs >=1 ppm) for that reason -- a difference here is expected, not a defect.
5. **Check treatment scenario.** A routine-maintenance target and a shock/incident-response threshold answer different questions and are never merged into one range.
6. **Check publication date.** Prefer the more recent primary/professional source when two otherwise-comparable sources genuinely disagree and neither is contextually distinguishable from the other. (Not needed for any conflict resolved in this phase -- see below.)
7. **Check whether one is manufacturer-specific.** A brand's equipment target is not a general standard and does not conflict with a general standard; both are recorded as separate, correctly-labeled records.
8. **Check whether the values are targets vs. acceptable limits.** A "practical operating target" nested inside a wider "acceptable range" standard (e.g. 80-120 ppm total alkalinity inside the ANSI/APSP-11 60-180 ppm standard) is not a conflict -- it is a narrower recommendation within a wider tolerance.
9. **Preserve both when both are legitimate.** The knowledge layer is explicitly designed to hold multiple range records per parameter (see `chemistry-ranges.js`); nothing is collapsed into a single "winning" number.
10. **Escalate unresolved conflicts.** A difference that survives steps 1-9 unresolved is recorded with status `REQUIRES_EXPERT_REVIEW` (if at least one side lacks primary/professional sourcing) or `POTENTIAL_CONTRADICTION` (if both sides are source-backed and still disagree) in `chemistry-consistency-matrix.csv`. Neither status is silently resolved by this phase.

## What this policy explicitly forbids

- Majority vote ("three pages say X, one says Y, so X wins").
- Treating a difference as an error merely because a model, a person, or a more-recent-looking page believes one number is better.
- Collapsing a contextual difference (pool vs. hot tub, chlorine vs. bromine, routine vs. treatment) into one "universal" number.
- Silently editing production content to match whichever value this phase happens to research first.

## Worked example from this phase

`chemistry-consistency-matrix.csv` records a live case: the site's saltwater-pool content (`scripts/data/academy-equipment.js`) asserts CYA 60-80 ppm for outdoor saltwater pools, while other residential-pool content elsewhere on the site uses 30-50 ppm. Applying the process above: environment is the same (pool, outdoor), scenario is the same (routine maintenance), but *sanitizer delivery method* differs (saltwater chlorine generator vs. manually-added chlorine). Step 3/7 would normally treat a sanitizer difference as sufficient context to explain a different number -- but no chemical mechanism was confirmed during this phase's research that would require CYA (a UV-protection buffer for whatever chlorine is present) to differ based on how that chlorine was generated. This is recorded honestly as a case that is *mechanically* classified `CONSISTENT_CONTEXT_DIFFERENCE` by the automated consistency-matrix script (because the sanitizer field differs) but is flagged separately, by name, in `HIGH-RISK-CHEMISTRY-CLAIMS.md` for human expert judgment, because the automated classification rule is a reasonable default, not a substitute for chemistry expertise on a case where the mechanism is unclear. This is a deliberate escalation, not an automation failure -- the point of this policy is to make disagreements visible, not to force every case through the mechanical rule without comment.
