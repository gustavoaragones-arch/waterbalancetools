# Phase 7T -- Shock Calculator Architecture Audit (Priority D)

## What the current calculator claims to calculate

`calculators/pool-shock-calculator.html`, read in full:
- Meta description: "Pool shock calculator: granular shock ounces from gallons + target ppm (10-30)."
- H1/hero: "Pool Shock Calculator... Calculate how much shock your pool needs based on volume and shock strength."
- FAQ: "Shock dose depends on gallons and how many ppm you want to raise -- often 10-30 ppm for algae or heavy use."
- Output: "Add X oz (Y lb) granular shock."

The page consistently frames itself as a **generic granular-shock-by-target-FC-increase** tool. It does not claim to compute a breakpoint-chlorination dose, a specific product's dose, or anything tied to a measured combined-chlorine reading.

## Are the presets target FC increases, treatment categories, product-dose categories, or something else?

The 4 presets are explicitly labeled: `Light (5 ppm)`, `Standard (10 ppm)` (default), `Heavy (15 ppm)`, `Double shock (20 ppm)`. Each label pairs a severity adjective with an explicit ppm value passed directly to `calculateShock(gallons, targetPpm)`. **These are target-FC-increase categories with descriptive severity labels, not product-dose categories and not breakpoint-CC multiples.** The severity label is presentation sugar over a plain FC-increase input; the underlying calculation treats "Standard (10 ppm)" identically to a user who typed "10" into a raw ppm field.

## Do the presets have a source-supported meaning?

Partially. PHTA's Water Chemistry Adjustment Guide and this site's own trust-panel/formula documentation already establish 10 ppm as a commonly-cited "maintenance shock" reference point and higher multiples (20-30 ppm) as consistent with algae-recovery guidance cited in `formula-03`'s explanation ("Algae recovery typically requires 20-30 ppm FC"). The "5 ppm / Light" tier has no specific authoritative citation found this session (it reads as an interpolated lighter option, not a cited industry category) -- this is a minor, low-risk gap, not a defect requiring a production change, since the page never claims 5 ppm is an authoritative "light shock" standard, only offers it as a lower option on the same linear scale.

## Is breakpoint treatment a separate use case?

Yes, definitively. Breakpoint chlorination (Phase 7R, `SUPPORTED`: target FC = 10× combined chlorine) requires a **combined-chlorine reading as input** -- a variable this calculator does not collect and, per its own generic FC-increase framing, was never designed to collect. Breakpoint dosing and "raise FC by a chosen flat amount" are mathematically different operations that happen to sometimes produce similar numbers by coincidence, not by relationship.

## Is a CC input required for any existing calculator promise?

No. The calculator never claims to compute a breakpoint dose. Its trust panel (added Phase 7S) already discloses: *"Breakpoint chlorination target (10x combined chlorine) is an industry rule of thumb, not independently confirmed by a primary source. This calculator also does not read the user's actual combined-chlorine reading."* The calculator's promises (an FC-increase-based generic granular dose) are met by its current inputs; it does not overclaim capability it lacks (unlike the pre-Phase-7S chemical-calculator.html LSI/alkalinity/calcium-hardness claims, which were false-capability defects -- this is not that pattern).

## Would adding a CC input create a materially different tool?

Yes. A breakpoint calculator is a different tool with a different input contract (requires a combined-chlorine test result, which not all consumer test kits can produce -- Phase 7S's `SHOCK-AUDIT.md` already noted this: DPD-based two-step FC/TC testing is needed to derive CC, and not every consumer test strip supports it). Converting the existing tool in place (rather than adding a distinct one) would either (a) silently change what "Standard (10 ppm)" means for existing users who don't have a CC reading, or (b) require the calculator to demand an input a meaningful fraction of its users cannot supply. Both are UX/product decisions, not evidence questions this phase can resolve.

## Outcome

**Outcome A: the existing architecture is defensible and needs only documentation clarification -- and Phase 7S already supplied that clarification.** Re-reading the current trust panel disclosure against this audit's findings, it already states the two facts that matter (breakpoint is a rule of thumb, and CC is not read). No gap was found between what this audit determined and what is already disclosed on the page. No further wording change is needed.

**Outcome C (separate future architecture), recorded but not built:** if the site wants to offer breakpoint-based dosing, it needs a distinct calculator (or a clearly-separated mode within this one) that collects a combined-chlorine reading, uses `formula-03`'s corrected mass-balance equation (this phase) or an equivalent, and is scoped, designed, and evidence-checked as its own effort -- not retrofitted onto the existing generic-FC-increase tool. This phase does not build it, per the explicit instruction not to implement a new breakpoint calculator unless the phase establishes that architecture as necessary and supportable; this audit establishes it as a *legitimate future option*, not a necessity, since the existing tool does not overclaim.

## Classification

**`SUPPORTED_DOMAIN_ASSUMPTION`** for the preset-tier UX pattern (confirmed, unchanged from Phase 7S). **`ARCHITECTURAL_GAP`** for breakpoint-based dosing as a capability the site does not offer (confirmed absent, not built, not necessary to build this phase).

## Production changes made

**None.** No calculator input, output, preset value, or trust-panel wording was changed. This audit confirms Phase 7S's existing disclosure already accurately describes the architecture this audit independently re-derived.
