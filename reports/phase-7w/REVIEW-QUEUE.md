# Phase 7W -- Review Queue (Carry-Forward)

Full detail in `FORMULA-DECISION-LEDGER.csv`, `SHOCK-IMPLEMENTATION.md`, `PRODUCTION-CHANGES.md`. Condensed narrative version.

## Resolved this phase

- **Shock product-selector architecture (Option B)**: fully implemented across all 3 live consumers of the shock functions (`pool-shock-calculator.html`, `hot-tub-shock-calculator.html`, `chemical-calculator.html`'s granular option), their JS source (`js/calc-utils.js`, `js/calculator.js`), `formula-03` documentation, and trust panels (including a separate, previously-undiscovered stale trust-formula record). The unsupported generic divisor no longer produces a live numeric result anywhere on the site -- it has been removed from both JS files entirely.
- **A previously-undiscovered stale trust-formula record** (`scripts/data/trust-formulas.js`'s `formula-shock-dose`, describing a breakpoint formula the calculator never implemented) was found during this phase's consumer inspection and corrected.
- **A title-length regression** introduced by this phase's own copy change (`hot-tub-shock-calculator.html`, 68 characters) was caught by `validate-phase-7i.js` during the regression sweep and fixed (57 characters) before finalizing.

## Discovered, NOT fixed -- genuinely out of scope

- **`guides/chlorine/free-chlorine-vs-total-chlorine.html`** explains breakpoint chlorination conceptually and then says "Use the shock calculator for your exact pool size," directly implying the linked Pool Shock Calculator computes a breakpoint (10× CC) dose. It has never done so, before or after this phase -- the calculator has always used flat preset ppm values and has never read combined chlorine. This is a **pre-existing** mismatch, not one this phase's implementation makes newly false, so per the Phase 7V precedent for an analogous discovery (the pH guide's independent dose table), it is documented here rather than fixed. Recommended for a future dedicated content-alignment phase.
- **Several `programmatic/shock/*` pages** (e.g. `how-much-shock-for-10000-gallon-pool.html`) contain similar generic-shock-calculator language. **Explicitly not touched**, per Section 13's hard programmatic-family boundary and the standing Phase 7N.1 KEEP decision. Flagged for a future phase with explicit authorization to touch that family.
- **The generic/unspecified-product shock divisor** remains `REQUIRES_EXPERT_REVIEW` -- this phase resolves the divisor question only for the 6 named products with approved data; it does not invent a replacement generic number for users who select "I don't know my product" (they receive qualitative guidance only), consistent with Phase 7T/7U's finding that no single divisor is defensible across products.
- **Breakpoint-chlorination dosing** remains architecturally un-built, per explicit instruction (Section 6, Phase 7U Option E rejected, Phase 7T `SHOCK-ARCHITECTURE-AUDIT.md`).

## Confirmed safe, no action needed

- `formula-02` (liquid chlorine), all Phase 7S/7T/7U/7V `RESOLVED` decisions -- reconfirmed unchanged, no contradictory evidence found.
- LSI and bromine calculator decisions -- unchanged, reconfirmed via the Phase 7W validator.
- `programmatic/` (all families), `es/`, `fr/`, `ads.txt`, sitemap files, `REDIRECT_SOURCES` registry -- confirmed untouched via diff and the Phase 7W test suite.
- pH, alkalinity, CYA, salt, volume, and turnover calculators -- confirmed unchanged via code review and dedicated per-file tests.
- The same pre-existing sitewide template/injector drift documented since Phase 7S -- reconfirmed present, reverted every time it appeared during this phase's regression work, not investigated further (separate infrastructure queue).

## Recommended for a future, separately-scoped phase

1. Content-alignment pass reconciling `guides/chlorine/free-chlorine-vs-total-chlorine.html` (and any similarly-framed guide content) with the shock calculators' actual, unchanged scope (flat FC-increase, not breakpoint).
2. A phase explicitly authorized to reconcile `programmatic/shock/*`/`programmatic/chlorine/*` content with the now-corrected shock calculators.
3. A product decision on whether to invest in a genuine breakpoint-chlorination (combined-chlorine-based) calculator as a distinct tool, per Phase 7T/7U's carried-forward option F.
4. The sitewide template/injector drift infrastructure decision.
