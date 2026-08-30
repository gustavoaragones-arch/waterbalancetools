# Phase 7V -- pH Calculator Narrowing: Implementation Detail

Implements Option A, approved in `reports/phase-7u/PH-ARCHITECTURE-DECISION.md` and authorized for this dedicated phase by the Phase 7U Director Assessment. This is an implementation, not a re-decision -- no alternative pH model was investigated or considered.

## Old numeric behavior (removed)

- `js/calc-utils.js` `calculatePHAdjustment(gallons, currentPh, targetPh)`: returned `{ ounces, direction, diff }`. `ounces = (gallons/10000) × |diff| × 6` (raising) or `× 5` (lowering). No traceable derivation for 6/5.
- `js/calculator.js` `phIncreaserOunces(gallons, phDifference)` / `phReducerOunces(gallons, phDifference)`: the same formulas, split into two direction-specific functions, called directly by `chemical-calculator.html`.
- All three pH calculator pages rendered a specific ounce figure ("Add 4.2 oz pH increaser...").

## New qualitative behavior

`js/calc-utils.js` `calculatePHAdjustment` and `js/calculator.js`'s new unified `evaluatePHGuidance(gallons, phDifference)` (replacing the two ounce-named functions -- kept as two files per the established Phase 7S/7T duplicate-implementation pattern, since consolidating `calc-utils.js` and `calculator.js` is a separate, out-of-scope architecture question) now return:

```
{ valid: boolean, direction: 'balanced' | 'raise' | 'lower' | null, magnitude: null | 'small' | 'moderate' | 'substantial', diff: number }
```

(`calculator.js`'s `evaluatePHGuidance` omits `valid`, matching its pre-existing convention of the caller checking `gallons > 0` itself, mirrored in `chemical-calculator.html`'s updated submit handler.)

- **Deadband** (`|diff| < 0.05`): `direction: 'balanced'`, no magnitude. This threshold is unchanged from the prior implementation's own deadband -- not a new invented value.
- **Direction**: `diff > 0` (target above current) → `'raise'`; else `'lower'`. Pure sign comparison, no chemistry claim.
- **Magnitude tiers**: `|diff| < 0.2` → `'small'`; `0.2 ≤ |diff| < 0.5` → `'moderate'`; `|diff| ≥ 0.5` → `'substantial'`. These breakpoints are an implementation choice for output readability, chosen to roughly track standard colorimetric pH test-kit resolution (~0.2-unit color-match increments, consistent with the Taylor pH test procedure read in Phase 7U's `taylor-k1005-instruction-manual-2012` source) -- **not a claim that these bands correspond to a specific, validated chemical dose.** No numeric quantity is attached to any tier.

## Verification

```
$ node -e "... calculatePHAdjustment(15000, 7.4, 7.4) ..."
{"valid":true,"direction":"balanced","magnitude":null,"diff":0}
$ node -e "... calculatePHAdjustment(15000, 7.3, 7.4) ..."
{"valid":true,"direction":"raise","magnitude":"small", ...}
$ node -e "... calculatePHAdjustment(15000, 7.1, 7.4) ..."
{"valid":true,"direction":"raise","magnitude":"moderate", ...}
$ node -e "... calculatePHAdjustment(15000, 8.0, 7.4) ..."
{"valid":true,"direction":"lower","magnitude":"substantial", ...}
```
Direction and magnitude are deterministic pure functions of the two pH values; no randomness, no external state.

## Per-page implementation

**`calculators/pool-ph-calculator.html`**: submit handler rewritten to render direction + magnitude + a generic (non-product-specific) "pH increaser"/"pH reducer" recommendation, product label instructions, incremental addition, and the approved "retest 30-60 minutes" interval (matching the calculator's own pre-existing FAQ entry, which already used exactly that window -- not a new invented interval). Meta description, og/twitter tags, JSON-LD `description`, and hero subtitle rewritten to remove "exact... ounces" claims. One FAQ/PAA item ("What lowers pH naturally?") that said "use measured increaser or reducer amounts for your pool volume" rewritten to remove the implied precise-quantity claim. Chemistry-sources note (hand-authored, not generator-controlled) rewritten to explain the new architecture in place of a reference to "the dosing formula."

**`calculators/hot-tub-ph-calculator.html`**: identical submit-handler pattern, preserving the existing "Run jets 20 minutes" hot-tub-specific instruction. Same meta/hero copy corrections (initially missed in a first pass -- see `BASELINE.md` -- caught by a sitewide sweep and fixed before final regression).

**`calculators/chemical-calculator.html`**: only the pH-specific portion of the shared submit handler was touched (a signed-diff computation relative to whichever target-pH bound -- min or max -- was crossed, then `evaluatePHGuidance`, then a qualitative output line appended alongside the unchanged, still-numeric chlorine-dose line). The chlorine computation (`chlorineNeededPpm`, `chlorineOuncesForType`), all chlorine-type UI, and the entire schedule/PDF-export logic were not touched. Meta description, title, og/twitter tags, and hero copy corrected to stop claiming "exact chlorine, pH, and alkalinity doses" (the alkalinity portion of that claim was already false before this phase, per the existing trust-panel disclosure that this calculator never computes an alkalinity dose -- removing it from this one shared sentence was a minimal, directly-entangled correction, not a broader alkalinity-content pass).

**`calculators/index.html` (hub page)**: 2 card descriptions (hot-tub-ph-calculator, pool-ph-calculator) and 1 (chemical-calculator) corrected -- see Baseline.md for how this file's true source was traced to `data/navigation.json` after an initial incorrect direct edit.

## formula-04 disposition

`scripts/data/formulas-data.js` `formula-04` fully rewritten (see `PRODUCTION-CHANGES.md` for the exact before/after). Per the explicit instruction, **no new formula was created** -- the `equation` field now states plainly that no validated equation is published, and why (buffering, missing TA/CYA/product inputs, professional sources deliberately omitting a pH dosing table). The `variables` table was repurposed from formula terms to a list of the relevant *factors* (with an explicit note that none are collected by this site's calculators). The `workedExample` was rewritten to walk through the calculator's actual qualitative output for a concrete scenario, explicitly stating "This calculator does not compute a chemical quantity for this scenario" rather than presenting a number. `limitations` retained and extended to note the still-open acid-demand-test research lead from Phase 7U, without implementing it.

## FAQ/content alignment (sitewide sweep)

Beyond the three calculator pages, a targeted sweep (`grep` for dose-implying pH phrases, restricted to non-programmatic, non-calculator-unrelated content) found and corrected:
- `reference/common-pool-chemistry-mistakes.html`: "Use our Pool pH Calculator for the right amount" → "...to check direction and adjustment size before you start."
- `guides/ph/how-to-lower-pool-ph.html` (generator-controlled, see Baseline.md): 2 sentences referencing "the pH calculator" for "exact readings"/"exact amounts" corrected. **The page's own pre-existing, independently-hardcoded "Dose table: muriatic acid" and its `quickAnswer` rule-of-thumb figure were deliberately NOT touched** -- these are a separate, pre-existing numeric claim not derived from or made contradictory by this phase's calculator change; removing or auditing them would be a distinct scope (a chemistry-evidence audit of guide content, not a calculator-narrowing implementation). Flagged in `REVIEW-QUEUE.md`.
- `programmatic/ph/*` and `programmatic/hot-tubs/*` pages were found (via the same sweep) to contain similar calculator-referencing claims (e.g., a FAQPage JSON-LD saying "use the calculator for your exact volume"). **These were explicitly NOT touched**, per Section 19's hard "programmatic page families... must remain unchanged" boundary. This is a genuine, material inconsistency between programmatic content and the now-corrected calculator, carried forward in `REVIEW-QUEUE.md` for a future phase authorized to touch that family.

## Trust panel

`scripts/data/trust-calculator-metadata.js` `pool-ph-calculator` and `hot-tub-ph-calculator` entries rewritten: `datasetDependencies` narrowed to `['chemical-ranges']` (removed `dosage-matrices`, never actually read by the live calculator); `entityDependencies` narrowed to `['ph']` (removed `muriatic-acid`/`soda-ash`, since the tool no longer names products); `notes` rewritten to state plainly that the calculator provides direction/magnitude, not a dose, why (TA/CYA/product-concentration not collected), and the incremental/retest guidance -- no claim of independent validation, laboratory testing, or professional certification beyond what the repository already supports. `chemical-calculator`'s entry `notes` corrected from "Computes a chlorine dose and a pH dose only" (now false) to accurately describe the numeric chlorine dose alongside qualitative pH guidance. Propagated via `node scripts/generate-trust.js` plus the established strip-and-reinject procedure for each page's `<!-- trust-panel: inject-trust-panels.js -->` block (idempotent-by-marker; does not auto-refresh existing content).

## Accessibility

No form markup, input, label, or heading structure was touched on any page -- only `<script>` submit-handler logic and non-form prose content. `node scripts/audit-accessibility.js`: score 100, 0 missing alt/label/aria, 0 heading skips (sitewide, unchanged from baseline). Spot-verified `for`/`id` label associations on both standalone pH calculator forms remain intact.

## Product-independence confirmation

No page asks the user to identify an acid/base product. `calculators/chemical-calculator.html`'s pre-existing "pH adjustment" `<select>` (values `increaser`/`reducer` only -- not specific chemicals) was already unused by the pH computation before this phase and remains unused; it was not removed (a UI cleanup beyond this phase's narrow mandate) but does not participate in any calculation. No muriatic acid, dry acid, soda ash, sodium carbonate, or sodium bicarbonate dose is computed anywhere.
