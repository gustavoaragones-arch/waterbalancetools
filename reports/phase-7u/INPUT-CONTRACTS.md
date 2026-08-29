# Phase 7U -- Input Contracts

Specifies the input contract for each calculator architecture this phase evaluated. These are **specifications for future implementation**, not descriptions of the current live calculators (which remain unchanged this phase, except the dataset documentation noted in `PRODUCTION-CHANGES.md`).

## pH calculator -- Option A (recommended target architecture, not yet implemented)

| Input | Unit | Range | Required? | Why it exists | Depends on it |
|---|---|---|---|---|---|
| Pool volume | gallons | > 0 | Required | Unrelated to the dosing-defensibility problem; kept unchanged | Direction/guidance framing only, no numeric scaling |
| Current pH | pH units | 6.0-8.5 (typical test-kit range) | Required | Determines direction (raise/lower) | Direction output |
| Target pH | pH units | 7.2-7.8 (site's existing target range) | Required | Determines direction and magnitude framing ("slightly"/"significantly") | Direction and qualitative-magnitude output |

**Output:** direction (raise/lower), a qualitative magnitude statement (e.g., "a small adjustment" vs. "a substantial adjustment," bounded by how far current is from target -- not a numeric dose), a recommendation to retest 30-60 minutes after any addition, and (if built) a link to an acid-demand-test explainer.

**If unavailable:** N/A -- all three inputs are already collected by the existing calculator; no new collection burden.

**Product assumptions:** none -- this architecture explicitly does not name a product or a dose.

**Precision limits:** none claimed -- this is the entire point of the architecture.

**Safety limitations:** must not imply a specific safe quantity to add; must direct the user to add incrementally and retest, consistent with Section 9's "preserve uncertainty" instruction.

## pH calculator -- Option B (acid-demand-test model; NOT sufficiently specified to build)

| Input | Unit | Range | Required? | Why it exists | Depends on it | If unavailable |
|---|---|---|---|---|---|---|
| Pool volume | gallons | > 0 | Required | Scales the measured index to a real-world dose | Dose calculation | Cannot compute |
| Acid-demand-test drop count | drops (Taylor reagent count) | 1-30 (typical) | Required | The empirical measurement replacing TA/CYA/temperature as separate inputs | Dose calculation | Falls back to Option A guidance |
| Acid product identity | enum (muriatic acid / dry acid) | -- | Required | Different products require different scaling per drop | Dose calculation | Cannot compute |

**Not specified this phase:** the drops-to-dose scaling table itself. `taylor-k1005-instruction-manual-2012` confirms the procedure exists; `lamotte-acid-demand-index-2022` confirms the *pattern* (index reading + volume table) is real and manufacturer-published, but for total-alkalinity reduction, not pH-target dosing. **This contract cannot be completed until a pH-keyed table is sourced and read in full.**

## Generic shock/granular calculator -- Option B (recommended target architecture, not yet implemented)

| Input | Unit | Range | Required? | Why it exists | Depends on it | If unavailable |
|---|---|---|---|---|---|---|
| Pool volume | gallons | > 0 | Required | Unchanged from today | Dose calculation | Cannot compute |
| Target FC increase | ppm | 1-30 (existing preset range) | Required | Unchanged from today; validated UX pattern (Phase 7T `SHOCK-ARCHITECTURE-AUDIT.md`) | Dose calculation | Cannot compute |
| Product selection | enum: liquid chlorine (10%/12.5%), calcium hypochlorite (65%/73%), sodium dichlor (56%), trichlor tablets (90%), or "I don't know" | -- | Required | Determines which dataset coefficient and safety notes apply | Dose calculation and safety-note display | "I don't know" path: display a narrowed, no-numeric-dose guidance message (Option D fallback) rather than guess a product |

**Output:** a weight-based dose (oz, with a lbs conversion) via the approved `0.013344`-constant mass-balance formula applied to the selected product's `activePercent`, plus the selected product's existing safety notes (CYA contribution, calcium contribution, mixing hazards, pH effect) surfaced alongside the numeric result.

**Product assumptions:** the four named products' `activePercent` and safety-note fields, already present and (for the four dry products) cross-validated this phase against PHTA's own dosing table.

**Precision limits:** same disclosed limitation as `formula-02`/`formula-03` -- assumes even distribution, does not account for chlorine demand from organic load; always retest.

**Safety limitations:** must display product-specific mixing/accumulation warnings alongside the numeric dose, not just the number -- the safety value of Option B over Option A depends on this being genuinely surfaced in the UI, not merely present in the underlying data.

**Explicitly out of contract:** combined-chlorine input, breakpoint-mode target-FC derivation (Option E, rejected this phase) -- remains a separate calculator concern per Phase 7T.

## Generic shock/granular calculator -- Option A (mathematical baseline, superseded)

Same as Option B's volume/target-FC/product inputs, except "product selection" is replaced by a free-text/numeric "available chlorine %" field with no product identity and no safety notes. Documented for completeness (it is evaluated and classified in `ARCHITECTURE-DECISION-MATRIX.csv`) but not recommended, since Option B provides the same math plus safety completeness at comparable implementation cost.

## Not specified this phase

No input contract is specified for: a breakpoint-chlorination calculator (Option F, deferred -- needs its own dedicated scoping including a CC-input safety design); a TA/CYA-aware pH formula (Option C, rejected -- no formula exists to specify inputs for beyond what Option B/D would need if their evidence gaps are later closed).
