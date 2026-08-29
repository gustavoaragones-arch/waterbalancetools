# Phase 7U -- pH Calculator Architecture Decision (Priority A)

## The user's actual question

"I tested my pool's pH and it's not in range. How much of [some acid or base product] do I add to get it there?"

## Minimum variables mathematically required

Acid/base demand in pool water is a carbonate-buffered titration problem, not a linear ppm-mass-balance problem (unlike chlorine or alkalinity). At minimum: current pH, target pH, pool volume, and total alkalinity (the primary buffering capacity). PHTA's own Alkalinity fact sheet (Phase 7T) additionally established that cyanuric acid measurably confounds a raw TA reading via its own buffering contribution, so a fully rigorous model would also need CYA. Product identity/concentration (which acid, what %) is required for any specific dose in real-world units.

## Product assumptions required

Whichever acid or base is used (muriatic acid, sodium bisulfate, soda ash) must be specified by concentration; different products at different strengths require proportionally different volumes/weights for the same net effect.

## Can these variables be reliably obtained from a normal user?

Pool volume: yes (already collected). Current/target pH: yes (already collected, from a standard pH test). Total alkalinity: yes, in principle -- a standard test-kit parameter most pool owners already test, though the calculator does not currently collect it. CYA: yes, also a standard test-kit parameter, though rarer for casual owners to test as often. An acid-demand-test *result* (drops to color match) requires a specific reagent (Taylor R-0015/R-0016 or equivalent) most casual pool owners do not own -- this is the key reliability question for Option B.

## Options evaluated

### Option A -- Remove the dosing claim (convert to guidance tool)

Would replace the current "add X oz" numeric output with: pH direction (rising/falling needed), a recommendation to retest before and after any addition, and a link to the site's existing acid-demand-test explanation (if built) or general guidance to add product incrementally and retest. No numeric dose invented.

**Evaluation:** This directly resolves the defensibility problem Phase 7T identified (a numeric dose the model cannot support) without requiring any new chemistry evidence -- it is a scope-narrowing move, not a new-formula move. It remains useful (still tells the user which direction and roughly what to expect) without overclaiming precision. This is the only option that requires zero additional unresolved evidence to justify.

**Classification: `NARROW EXISTING TOOL`.** Recommended as the site's target direction for this calculator. **Not implemented this phase** -- see Section "Why no production change" below.

### Option B -- Acid-demand-test calculator

Investigated with real research this phase (not merely inherited from Phase 7T). Taylor Technologies' K-1005 test kit instruction card (`taylor-k1005-instruction-manual-2012`, fetched and read in full) confirms the Acid Demand Test is a real, standard, manufacturer-documented procedure: add reagent R-0015 dropwise to a pH-tested sample, counting drops until the color matches the target pH, "See treatment tables to continue." This confirms the *procedure* is real and the *pattern* (measured index -> volume-scaled dose) is standard industry practice -- LaMotte's own "Acid Demand Index for Total Alkalinity Adjustment" (`lamotte-acid-demand-index-2022`, fetched and read in full) is a working example of exactly this pattern: a measured index value looked up against a pool-volume table, with 2 fully-worked examples showing the volume-scaling arithmetic (dose amounts sum additively across volume-basis columns).

**However**, the LaMotte table is for *total-alkalinity reduction* (input: an alkalinity ppm reading), not *pH-target dosing* (input: a pH delta). Taylor's card explicitly defers its own pH-specific acid-demand table to "the reverse [of the physical card]" or a website (`www.swim-care.com`), neither of which this session could fetch and read in full. **The specific drops-to-dose scaling relationship needed to build a pH-targeted acid-demand calculator was not found and independently verified this phase.**

**Classification: `ARCHITECTURAL_GAP` (pattern confirmed viable) + `REQUIRES_EXPERT_REVIEW` (specific table not sourced).** Materially stronger evidence than Phase 7T had (a named procedure and a working analogous table, rather than only "PHTA defers to testing"), but still not sufficiently specified to build. Also requires a user-reliability judgment (does the target audience own an acid-demand reagent kit?) this phase cannot resolve alone.

### Option C -- TA/CYA-aware closed-form or tabulated model

No validated closed-form equation from pH + volume + TA (+ CYA) to an acid dose was found in any source read this phase or in Phase 7T. PHTA's own dosing-table format (Phase 7T) deliberately excludes pH and defers to testing rather than publishing such a formula -- the same authoritative body that publishes exactly this kind of table for every other parameter (including, this phase confirms via LaMotte, other manufacturers do too for TA) declining to do so for pH-target dosing is itself evidence that no such simple closed form is considered reliable enough to publish.

**Classification: `DO_NOT_BUILD`.** Fabricating a formula the authoritative sources themselves decline to publish would violate this phase's explicit prohibition on guessing.

### Option D -- Product-specific dosing table (manufacturer labels)

The LaMotte and Taylor documents found this phase are exactly this kind of manufacturer table -- but, as above, for TA reduction and for the test procedure respectively, not for pH-target dosing specifically. A genuine Option D resolution would require finding an analogous manufacturer table keyed to pH delta (not TA ppm). This phase did not locate one.

**Classification: `ARCHITECTURAL_GAP`, flagged as a promising, partially-explored lead** -- a future phase searching specifically for a pH-keyed (not TA-keyed) manufacturer table, or Taylor's referenced `www.swim-care.com` tool/reverse-card table, may find sufficient evidence where this phase did not.

### Option E -- Retain current approximation, explicitly labeled

The current constants (6 for pH increaser, 5 for reducer) have no traceable derivation or citation anywhere in the codebase, in Phase 7T's audit, or in this phase's fresh research. No authoritative source found this phase or prior phases supports these specific numbers.

**Classification: `REJECTED`**, per this phase's explicit instruction not to select this option merely because changing the calculator is inconvenient, and because no authoritative evidence supports the constants.

## pH decision requirements (Section 4), answered

1. Minimum scientifically meaningful input contract: pH delta, volume, TA (at minimum); CYA for full rigor. **Not currently collected.**
2. Is TA required? **Yes** -- established in Phase 7T and reconfirmed this phase.
3. Is CYA required? **Likely yes** for full rigor, per PHTA's own Cyanuric Acid Correction Factor table (Phase 7T).
4. Is product concentration required? **Yes** for any specific real-world dose.
5. Is temperature required? **Not established either way** -- no source found this phase or Phase 7T states temperature is a required carbonate-buffering variable at typical pool operating temperatures; not ruled in or out.
6. Can acid-demand testing replace those variables? **In principle yes** (it directly measures the net effect of pH + TA + CYA + temperature empirically) -- this is precisely why PHTA defers to it -- but the specific scaling table for pH-target dosing was not sourced this phase.
7. Is a reliable closed-form formula available? **No.**
8. Is a reliable dosing table available? **Not for pH-target dosing specifically** (a real, reliable table exists for the closely related TA-reduction case).
9. Can the model be independently validated? **Not with currently available evidence.**
10. Which architecture should the site adopt? **Option A (remove the numeric dosing claim) is the only option this phase can currently justify as evidence-sufficient. Option B remains the scientifically preferable long-term direction if the specific scaling table can be sourced in a future phase.**

## Why no production change this phase

Option A is evidence-sufficient, but implementing it means changing the calculator's fundamental output type (from a number to qualitative guidance) -- new copy, a redesigned output section, updated FAQ and worked-example content, and a corresponding documentation rewrite of `formula-04`. This is real UX/product design work, not a narrow wording correction, and Section 16's default expectation ("NO PRODUCTION CALCULATOR CHANGES... do not redesign the calculator UI merely to demonstrate activity") together with this phase's explicit framing as an architecture-decision phase means this is recommended for a dedicated, Director-scoped follow-up phase rather than built unilaterally here.

**No change was made to `js/calc-utils.js`, `js/calculator.js`, or `formulas-data.js` `formula-04` this phase.**
