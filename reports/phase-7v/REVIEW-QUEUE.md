# Phase 7V -- Review Queue (Carry-Forward)

Full detail in `DECISION-MATRIX.csv`, `PH-IMPLEMENTATION.md`, `PRODUCTION-CHANGES.md`. Condensed narrative version.

## Resolved this phase

- **pH calculator narrowing (Option A)**: fully implemented across all 3 consumers of the pH functions (`pool-ph-calculator.html`, `hot-tub-ph-calculator.html`, `chemical-calculator.html`), their JS source (`js/calc-utils.js`, `js/calculator.js`), `formula-04` documentation, trust panels, and the calculators hub page. No numeric pH dose is produced anywhere on the live site as of this phase.

## Discovered and fixed (not originally scoped, but directly caused by this change)

- `calculators/index.html` hub page's stale card descriptions (traced to a generator-ordering quirk, see `BASELINE.md`).
- `calculators/hot-tub-ph-calculator.html`'s SEO/hero copy (missed in a first pass, caught by a sitewide sweep before final regression).
- `reference/common-pool-chemistry-mistakes.html` and `guides/ph/how-to-lower-pool-ph.html`'s calculator-referencing sentences (2 of the latter's sentences; its own separate dose table was not touched -- see below).
- A double-escaping bug in `scripts/generate-navigation.js`'s meta-description scraper, triggered by using an HTML entity (`&amp;`) in a page `<title>` -- worked around by avoiding the ampersand in the new title text rather than modifying the shared scraper (out of this phase's narrow mandate).

## Discovered, NOT fixed -- genuinely out of scope

- **`guides/ph/how-to-lower-pool-ph.html`'s own hardcoded "Dose table: muriatic acid" and `quickAnswer` rule-of-thumb figure** (`scripts/generate-authority-guides.js`, inline). This is a separate, pre-existing, uncited numeric pH-dosing claim -- not derived from the calculator constants this phase removed, and not made newly contradictory by this phase's change (only the 2 sentences directly *referencing the calculator* were). Auditing whether this table is defensible is chemistry-evidence work (Phase 7T/7U-class), not calculator-narrowing implementation. **Recommended as a future phase's first item.**
- **`programmatic/ph/*` and `programmatic/hot-tubs/*` pages** contain similar claims (e.g., a FAQPage JSON-LD stating a specific pool gets "roughly 2.0 oz... as a reference point... use the calculator for your exact volume"). This is now a genuine, material inconsistency between programmatic content and the corrected calculator. **Explicitly not touched**, per Section 19's hard programmatic-family boundary, which this phase respects even though it leaves a known inconsistency live. Flagged for a future phase with explicit authorization to touch that family (which Phase 7N.1's standing KEEP decision otherwise protects from routine changes).

## Confirmed safe, no action needed

- Chlorine, shock, alkalinity, CYA, salt, LSI, and volume calculators -- all confirmed unchanged via code review and the Phase 7V test suite.
- Generic shock/granular calculator architecture (Phase 7U Option B) -- confirmed not implemented this phase, per the Director's explicit two-phase plan (Phase 7W).
- Breakpoint-chlorination decision, bromine-calculator decision -- unchanged, reconfirmed via the Phase 7V validator.
- Sitewide template/injector drift -- reconfirmed present (resurfaces on every full build), reverted every time it appeared during this phase's regression work, not investigated further (separate infrastructure queue, carried forward unchanged from Phase 7S/7T/7U).
- The generator-ordering quirk (`generate-hubs.js` before `generate-navigation.js` in `run-all-generators.js`) -- documented, not fixed (a real but minor pipeline-sequencing issue, out of this phase's narrow mandate; workaround is simply running the build twice, which this phase did).

## Recommended for Phase 7W (per the Director's explicit plan)

Implement the approved Phase 7U Option B shock product-selector contract: product selector UI, per-product JS branching reusing the approved `0.013344` mass-balance formula, product-specific safety-note surfacing, updated `formula-03`/trust-panel documentation, full testing and regeneration. Do not begin this work in any phase other than the one explicitly authorized for it.

## Recommended for a future, separately-scoped phase

1. Chemistry-evidence audit of `guides/ph/how-to-lower-pool-ph.html`'s hardcoded dose table (item 7V-10).
2. A phase explicitly authorized to reconcile `programmatic/ph/*`/`programmatic/hot-tubs/*` content with the now-corrected pH calculator (item 7V-11).
3. Continued research into a pH-target (not TA-target) manufacturer acid-demand scaling table, per Phase 7U's carried-forward lead.
4. The sitewide template/injector drift infrastructure decision.
5. Optionally, the `generate-hubs.js`/`generate-navigation.js` pipeline-ordering fix (low priority, cosmetic-only impact discovered this phase).
