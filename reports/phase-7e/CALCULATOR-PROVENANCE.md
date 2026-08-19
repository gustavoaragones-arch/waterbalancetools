# Calculator Provenance

Formulas audited: `js/calc-utils.js` (unchanged this phase). Evidence base: `reports/phase-7d-3/CALCULATOR-EVIDENCE-INVENTORY.md`. Priority calculators per the brief: Pool Chlorine, Pool Shock, Pool pH, Hot Tub Chlorine, All-in-One Chemical.

## Pool Chlorine Calculator (`calculators/pool-chlorine-calculator.html`)

- **Assumes:** `calculateChlorine()` — liquid 10%: `oz = (gal × Δppm) / 128000`; granular/shock: `/10000`; tablets: `/12000`.
- **Why:** Standard pool-dosing arithmetic scales a per-10,000-gallon dosing figure by pool volume and the ppm gap to close. The specific divisor constants (128000 for 10% liquid, 10000 for granular, 12000 for tablets) encode an implicit assumed product concentration.
- **Supported?** The *target range* it doses toward (1-3 ppm no-CYA / 2-4 ppm with-CYA) is directly supported (`claim-fc-pool-no-cya`, `claim-fc-pool-with-cya`, CDC). The *dosing constants themselves* were flagged in Phase 7D's `PHASE-7D-CHEMISTRY-KNOWLEDGE.md` ("undocumented concentration assumptions") and remain unverified against a specific product-strength reference this phase.
- **Source:** target range — `cdc-healthy-swimming-home-treatment`, `cdc-mahc-2023` (general, directly applicable). Dosing constants — none.
- **Decision:** `CALCULATOR_REVIEW_REQUIRED` (carried forward from Phase 7D, not newly resolved). Not modified.

## Pool Shock Calculator (`calculators/pool-shock-calculator.html`)

- **Assumes:** `calculateShock()` — `oz = (gal × targetPpm) / 10000`, default target 10 ppm.
- **Why:** Same per-10,000-gallon scaling pattern; the 10 ppm default matches a commonly-cited breakpoint/shock starting point.
- **Supported?** The underlying "shock to ~10x combined chlorine" rule of thumb is the site's own `claim-shock-breakpoint-rule`, itself `REQUIRES_REVIEW` with no confirmed primary source. Phase 7D's report separately flagged this calculator for having "no combined-chlorine-based breakpoint logic" — it doses to a flat default rather than reading the user's actual CC value, which is a real, disclosed methodology gap, not just a citation gap.
- **Source:** none (context-specific; no calculator-specific breakpoint source exists in the registry).
- **Decision:** `CALCULATOR_REVIEW_REQUIRED` (carried forward from Phase 7D). Not modified.

## Pool pH Calculator (`calculators/pool-ph-calculator.html`)

- **Assumes:** `calculatePHAdjustment()` — increaser: `oz = (gal/10000) × Δph × 6`; reducer: `× 5`. Already self-described in the code comment as "(simplified estimation)."
- **Why:** pH adjustment dose depends on total alkalinity (buffering capacity), which this calculator does not take as an input — the constants 6/5 are single-point approximations, already disclosed as simplified.
- **Supported?** The *target range* (7.0-7.8, commonly 7.2-7.6) is directly supported (`claim-ph-pool-routine`, CDC). The dosing constants are not independently sourced, and the calculator already discloses this is a simplification (matches Phase 7D's finding: "already self-disclosed as a simplification").
- **Source:** target range — `cdc-healthy-swimming-home-treatment`.
- **Decision:** No new review required beyond what's already disclosed in the UI copy; target range citable.

## Hot Tub Chlorine Calculator (`calculators/hot-tub-chlorine-calculator.html`)

- **Assumes:** Same `calculateChlorine()` engine as the pool version, applied to a hot-tub-scale volume.
- **Supported?** Target range (3-5 ppm) is directly supported (`claim-fc-hottub-routine`, CDC). Same undocumented-dosing-constant caveat as the pool version.
- **Source:** `cdc-healthy-swimming-home-treatment`.
- **Decision:** Target range citable; dosing constants `CALCULATOR_REVIEW_REQUIRED` (same as pool chlorine).

## All-in-One Chemical Calculator (`calculators/chemical-calculator.html`)

- **Assumes:** Combines `calculateChlorine`/`calculatePHAdjustment`/`calculateAlkalinity`/`calculateCYA`/`calculateSalt` behind one form; inherits every constant-level caveat listed above from each sub-formula, plus its own alkalinity (`1.4 lb per 10,000 gal per 10 ppm`), CYA (`13 oz per 10,000 gal per 10 ppm`), and salt (`1 lb per 10,000 gal ≈ 12 ppm`) constants, none of which are independently sourced.
- **Supported?** Target ranges for pH, FC, TA, CH are directly supported per their individual claim families. CYA and salt target ranges are `REQUIRES_REVIEW` (no confirmed primary source — see `claim-cya-routine-outdoor`, `claim-salt-generic`).
- **Decision:** `CALCULATOR_REVIEW_REQUIRED` for every dosing constant. Target ranges for pH/FC/TA/CH citable; CYA/salt target ranges not yet.

## Cross-cutting finding

Every dosing *formula* in `js/calc-utils.js` encodes a product-concentration assumption (10% liquid chlorine, 31.45% muriatic acid implied by the pH constants, etc.) that is nowhere stated to the user and was never independently verified against a manufacturer/regulatory reference in this project. This is not new — Phase 7D already flagged `calculateChlorine`/`calculateShock` for exactly this reason. This phase does not resolve it (no formula was proven incorrect by authoritative evidence, and disproving/confirming a dosing constant is genuine chemistry-formula research, explicitly out of scope for a provenance-implementation phase). It is carried forward, unresolved and disclosed, as `CALCULATOR_REVIEW_REQUIRED`.

No calculator formula was modified in this phase.
