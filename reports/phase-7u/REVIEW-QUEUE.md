# Phase 7U -- Review Queue (Carry-Forward)

Full detail and evidence for every item is in `ARCHITECTURE-DECISION-MATRIX.csv`, `PH-ARCHITECTURE-DECISION.md`, and `SHOCK-ARCHITECTURE-DECISION.md`. This file is the condensed narrative version.

## Architecture decisions made this phase

- **pH calculator**: recommended target architecture is **Option A -- remove the numeric dosing claim, replace with directional/qualitative guidance**. This is the only option requiring no new unresolved chemistry evidence. Options C (TA/CYA closed-form) and E (retain current constants) are explicitly rejected/do-not-build. Options B (acid-demand-test) and D (product-specific pH table) remain architecturally promising but insufficiently evidenced -- both materially advanced by this phase's research (a real manufacturer test procedure and a working analogous TA-reduction table were found and read in full) without reaching the bar to build.
- **Generic shock calculator**: recommended target architecture is **Option B -- a product selector** (calcium hypochlorite, sodium dichlor, trichlor, liquid chlorine), using the site's own already-existing `dataset-dosage-matrices.js`, which this phase confirmed is genuinely defensible (4 dry-product coefficients independently cross-validated against PHTA's own dosing table in Phase 7T, now explicitly documented in the dataset's own provenance notes). Option A (bare percentage input) is mathematically sufficient but safety-inferior to Option B. Option E (integrate breakpoint mode) is explicitly rejected, reconfirming Phase 7T.

## Neither recommendation was implemented this phase

Both are real UI/UX redesigns of a live, safety-relevant calculator (new input fields, new output framing, new documentation), not narrow corrections -- outside this phase's own stated mandate ("Default expectation: NO PRODUCTION CALCULATOR CHANGES... do not redesign the calculator UI merely to demonstrate activity"). Both are fully specified (see `INPUT-CONTRACTS.md`) and ready for a dedicated, Director-authorized follow-up phase.

## Genuinely unresolved (evidence insufficient)

- **pH-target acid-demand scaling table**: a real, manufacturer-published example of exactly this kind of table exists for the closely-related total-alkalinity-reduction case (LaMotte); the pH-specific equivalent (referenced by Taylor's own instruction card as existing, "on the reverse" or via `www.swim-care.com`) was not found and read in full this phase. **Most promising unresolved lead for a future pH-architecture phase.**
- **Generic (product-agnostic) shock divisor**: reconfirmed dimensionally indefensible (Phase 7T); this phase's recommendation is to replace the generic tool with the product-selector architecture (Option B) rather than search further for a single generic number, since PHTA's own guidance (Phase 7T) already establishes that no such generic number should exist.

## Confirmed safe, no action needed

- All Phase 7S/7T `RESOLVED` decisions (liquid chlorine, alkalinity, LSI documentation, formula-03) -- reconfirmed unchanged, not reopened, no contradictory evidence found this phase.
- The standing no-LSI-calculator and no-bromine-calculator decisions.
- Phase 7T's breakpoint-as-separate-use-case conclusion -- reconfirmed, no new evidence bears on it.
- The same pre-existing sitewide template/injector drift Phase 7S/7T documented -- reconfirmed present, reverted, not investigated further (out of mandate).

## Recommended next phase(s)

1. **A dedicated pH-calculator implementation phase**, scoped narrowly to Option A (remove the numeric dosing claim): new output copy, FAQ updates, and a `formula-04` documentation rewrite consistent with `INPUT-CONTRACTS.md`'s Option A contract.
2. **A dedicated shock-calculator implementation phase**, scoped to Option B (product selector): new selector UI, per-product JS branching reusing the approved mass-balance formula, updated `formula-03`/trust-panel documentation, and full regeneration, consistent with `INPUT-CONTRACTS.md`'s Option B contract.
3. **Continued research into a pH-target (not TA-target) manufacturer acid-demand table** -- specifically Taylor's `www.swim-care.com` tool/reverse-card table, or an equivalent from another test-kit manufacturer (LaMotte, AquaChek) -- which could eventually upgrade pH's recommended architecture from Option A to Option B.
4. The sitewide template/injector drift infrastructure decision, carried forward unchanged from Phase 7S/7T.
