# Phase 7U -- Generic Shock/Granular Calculator Architecture Decision (Priority B)

## The user's actual question

"I want to shock my pool. I have [some dry or liquid chlorine product]. How much do I add?"

## Minimum variables mathematically required

The already-approved mass-balance relationship (`oz = ΔFC × Volume × 0.013344 ÷ Available_Chlorine(%)`, used in `formula-02` since Phase 7S and `formula-03` since Phase 7T) requires: target FC increase, pool volume, and available-chlorine percentage. This is the complete mathematical requirement for a weight-based dose -- density is not needed, because the constant is already defined in terms of mass (oz) of active ingredient, not volume of product, and this has been demonstrated correct for both a liquid (10-12.5%) and dry (65-90%) product in Phases 7S and 7T.

## Options evaluated

### Option A -- Product-strength input only (user types a percentage)

**Mathematically sound.** The `0.013344` constant is product-form-independent; entering any accurate available-chlorine percentage produces a correct weight-based dose regardless of whether the product is liquid or dry. Density is not needed. Dry products *can* be represented by available-chlorine percentage alone for the core dosing math.

**But safety-incomplete.** A bare percentage input cannot warn the user about product-specific secondary effects that materially matter for real dosing decisions: calcium hypochlorite adds calcium hardness (and must not be mixed with trichlor); dichlor and trichlor add cyanuric acid (with accumulation risk from repeated use); trichlor is markedly acidic. This site's own `dataset-dosage-matrices.js` already tracks exactly these effects per product (`calciumContributionPpmPerOz`, `cyaContribution`, `phEffect`, mixing-hazard notes) -- a bare-percentage calculator would discard that safety-relevant information the site already has.

**Classification: `IMPLEMENT WITH EXPLICIT ASSUMPTION`** as a mathematical baseline, but superseded by Option B below as the safer, more complete architecture.

### Option B -- Product selector (calcium hypochlorite / sodium dichlor / trichlor / liquid chlorine)

**A defensible dataset already exists.** `scripts/data/dataset-dosage-matrices.js` (read in full this phase) already contains named-product records for calcium hypochlorite (65%, 73%), sodium dichlor (56%), and trichlor tablets (90%), each carrying `activePercent`, `coefficient`, `cyaContribution`, `calciumContributionPpmPerOz` (where relevant), `phEffect`, and product-specific safety notes (mixing hazards, pre-dissolution instructions). Cross-checking these coefficients against Phase 7T's `FORMULA-03-AUDIT.md` and `SHOCK-DIVISOR-AUDIT.md` comparison tables (which independently derived the same coefficients from the approved mass-balance constant and cross-validated them against PHTA's own Water Chemistry Adjustment Guide, fetched and read in full in Phase 7T) confirms **all four dry-product coefficients already match PHTA's published figures to within normal rounding** -- even though the dataset file's own inline comments do not yet record that cross-validation (only the two liquid-chlorine records, corrected in Phase 7S, carry inline citations). This dataset is therefore genuinely defensible, not merely present.

**Determining each product's requirements (Section 6, item by item):**
- Available chlorine %: yes, already recorded per product.
- Label-specific dosage: the dataset's coefficients are derived from the approved mass-balance formula and independently cross-validated against PHTA's own table -- functionally equivalent to label-based dosing for these four products, without requiring per-manufacturer label collection.
- Purity/formulation constraints: captured via `activePercent`; no evidence found that within-category formulation variance (e.g., different cal-hypo brands at the same labeled %) materially changes the dose beyond normal product-label rounding.
- Formulation-specific constraints (mixing hazards, CYA/calcium accumulation): already captured in the dataset's `notes`, `cyaContribution`, and `calciumContributionPpmPerOz` fields.

**Classification: `IMPLEMENT`.** This is the architecturally superior option -- it is the only one that is both mathematically correct and safety-complete, and it is the only option backed by an already-existing, already-cross-validated dataset rather than new research this phase would need to originate.

### Option C -- Label-based calculator (scale a manufacturer's stated dose directly)

Evaluated as a distinct approach: rather than deriving a dose from chemistry first principles, simply take a manufacturer's own stated dose (e.g., "1 scoop per 10,000 gallons") and scale linearly by volume.

**Determination:** this is **functionally subsumed by Option B**, not a materially different architecture. The dataset entries Option B would use are themselves cross-validated against PHTA's own published dosing table (a manufacturer-tier, label-equivalent source), and PHTA's Calcium Hypochlorite fact sheet (Phase 7T) explicitly states dosage should ultimately follow "the label use instructions" -- Option B's coefficients already track that guidance as closely as available evidence allows. Option C's only distinct value would be count-based dosing (e.g., "X tablets," not weight) for products sold by discrete unit rather than bulk weight -- not evaluated further this phase, as the site's existing dry-shock products are all weight-dosed.

**Classification: `CONFIRMED (subsumed by Option B)`.**

### Option D -- Keep generic tool, remove the numeric claim

The fallback architecture if Option B is never authorized for implementation: narrow the existing generic calculator's claim (similar in spirit to the pH Option A) rather than leave an indefensible generic divisor unaddressed indefinitely.

**Classification: `NARROW EXISTING TOOL (fallback only)`** -- not the primary recommendation, since Option B is better-evidenced and does not require sacrificing the calculator's numeric usefulness.

### Option E -- Integrate breakpoint mode into this calculator

Phase 7T concluded breakpoint dosing (10× combined chlorine) is a distinct use case requiring a combined-chlorine input the generic FC-increase calculator does not collect, and that integrating it would conflate two different scenarios. **This phase finds no new evidence changing that conclusion.** Nothing in this phase's research into Options A-D bears on the CC-input question -- product selection (Option B) answers "what am I adding," not "how much do I need," which is what breakpoint chlorination changes.

**Classification: `REJECTED (not architecturally superior)`**, consistent with and not reopening Phase 7T.

### Option F -- Separate future breakpoint calculator

Remains a legitimate, un-built future option, as Phase 7T already concluded. This phase adds no new specification for it (no CC-input UX, no safety copy) and does not build it.

**Classification: `DEFERRED`**, unchanged from Phase 7T.

## Shock decision requirements (Section 6), answered

1. Can available-chlorine % alone define a generic dry-product dose? **Mathematically yes; safety-adequately, no** -- see Option A.
2. Is product identity required? **Yes**, for the safety-relevant secondary effects (CYA, calcium, mixing hazards) the site already tracks per product.
3. Is product label information required? **Effectively already satisfied** via the existing, cross-validated dataset.
4. Is density relevant for the supported dry products? **No** -- the mass-balance formula is weight-based throughout.
5. Can the existing calculator remain generic? **No, not defensibly** -- the generic `10000` divisor corresponds to no real product (Phase 7T), and this phase finds no basis for a different single generic number either.
6. Should target ppm remain a direct user input? **Yes** -- unrelated to the product-identity question, and already validated as a defensible UX pattern (Phase 7T `SHOCK-ARCHITECTURE-AUDIT.md`).
7. Should current FC be required? **No new evidence bears on this**; unrelated to the product-selection question addressed here.
8. Should CC be required? **No** -- see Option E; that is the separate breakpoint use case.
9. Is breakpoint treatment a separate use case? **Yes**, reconfirmed.
10. Minimum defensible input contract: **pool volume, target FC increase, and a product selection from the four already-dataset-backed dry/liquid products** (or an explicit "I don't know my product" path -- see `INPUT-CONTRACTS.md` for the full specification).

## Why no production change this phase

Option B is well-evidenced and the underlying dataset already exists, but *implementing* it is a real, non-trivial UI change: a new product-selector input, new per-product JS branching, new output copy reflecting per-product safety notes, updated `formula-03`/trust-panel documentation to describe the product-selector model, and full regeneration -- a materially larger change than any single-file documentation correction Phase 7S/7T made, and the kind of calculator redesign Section 16 defaults against building without dedicated scoping. Per this phase's own framing as an architecture-DECISION phase (not an implementation phase) and the precedent Phase 7T's Director explicitly praised (treating a well-evidenced future capability as "a separate product/tool decision rather than something that needs to be retrofitted" immediately), this phase recommends Option B as `IMPLEMENT`-classified and ready for a dedicated follow-up phase, but does not build it here.

**One narrow, low-risk documentation change was made** (not a calculator or formula behavior change): `scripts/data/dataset-dosage-matrices.js`'s four dry-shock-product records were annotated with the Phase 7T cross-validation finding, so the dataset's own provenance record reflects what this phase discovered. No `coefficient` value was changed. See `PRODUCTION-CHANGES.md`.
