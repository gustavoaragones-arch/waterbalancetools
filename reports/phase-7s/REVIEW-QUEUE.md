# Phase 7S -- Review Queue (Carry-Forward)

Full detail and evidence for every item is in `DECISION-MATRIX.csv`. This file is the condensed narrative version.

## Resolved this phase

- **Liquid chlorine** (P0-A): calculator, duplicate calculator, formula documentation, and internal dataset all corrected using a first-principles derivation plus an independent government table. See `LIQUID-CHLORINE-AUDIT.md`.
- **Trichlor tablets divisor** (discovered during the liquid-chlorine audit): corrected using the same government table and this site's own already-correct (but unused) dataset entry.
- **LSI formula documentation** (P0-B): rewritten to a single, consistent worked example using real, already-sourced lookup-table data. No calculator built.
- **Three false capability claims on `calculators/chemical-calculator.html`'s trust panel** (LSI, alkalinity dose, calcium-hardness dose -- discovered during the P0-B audit): all corrected to accurately describe what the calculator actually computes (chlorine + pH only).
- **Alkalinity** (P1-C): documentation corrected to match the already-correct implementation, using the same government table.

## Genuinely unresolved (evidence insufficient -- correctly left REQUIRES_EXPERT_REVIEW)

- **pH adjustment** (P1-D): pH dosing is inherently alkalinity-dependent; no source states a TA-independent dose-per-pH-unit figure. Fixing this responsibly requires either a TA-aware model (an architecture change) or a source this phase did not find. The formula page's own equation is also missing a normalization term -- documented, not patched, since patching it without resolving which constant is correct would be premature.
- **Generic granular/shock chlorine divisor**: no single product in the government table matches the calculator's implicit assumption. Same disposition inherited from Phase 7R, re-confirmed.
- **Shock formula (`formula-03`) cal-hypo equation**: a newly-discovered, smaller-magnitude (~1.5x) discrepancy entangled with an oz/lbs unit-labeling bug. Documented, not fixed, per the explicit instruction not to expand scope to fix every finding in one pass.

## Architectural gaps (confirmed, not built)

- **Interactive LSI calculator**: the data layer (lookup tables) exists and is sourced; the computation layer (interpolation methodology, UI, result rendering) does not. This narrows but does not close the gap the Phase 7R Director Assessment identified. The standing decision against building one remains in force.
- **Shock calculator breakpoint-CC input**: the now-SUPPORTED breakpoint-chlorination rule cannot be applied by the existing preset-tier shock calculators without adding a combined-chlorine input field -- a genuine UI/architecture change, explicitly out of this phase's mandate (Section 9: "DO NOT redesign the calculator merely because breakpoint chlorination exists").

## Infrastructure risk discovered and remediated

- **`data/academy.json` orphaned-entry risk**: 2 academy articles exist only as direct JSON edits, not in any `scripts/data/academy-*.js` source file. Running `scripts/populate-data.js` (needed for this phase's formula fixes) silently deleted both; caught and fully restored within this phase (see `PRODUCTION-CHANGES.md`'s incident note). The underlying architecture gap (properly merging these 2 entries into their source file) was NOT fixed this phase -- outside the calculator-formula mandate, and higher-risk to attempt without full familiarity with that file's shared-variable authoring conventions. **Flagged clearly for a future phase**, with an explicit warning that `populate-data.js` should not be re-run for academy content until this is resolved.

## Infrastructure risk discovered, NOT this phase's to fix (sitewide, pre-existing, out of mandate)

- **Latent template/injector drift affecting ~225 pages sitewide** (entities: 105, guides: 16, editorial: 6, methodology: 8, charts: 3, comparisons: 2, printables: 4, releases: 3, internal report dashboards: ~15, revisions/search/sitemap/legal/maintenance/qa/provenance/templates/404/about: ~20, plus 4 `data/indexing/*.json` + `data/navigation.json` + `data/search-index.json` + `data/platform/compatibility.json`). Discovered while running the required Section 17 regression sweep (`npm run build`), which is necessary to confirm this phase's own changes don't break anything. A full build correctly regenerates these pages using the *current* header/nav (`data-canonical-nav="v4"`, OG/Twitter meta tags, `content-version` badges) and the current indexing/navigation/search-index pipeline outputs -- but the versions of these ~225 pages currently committed to the repository predate that migration and were never regenerated afterward, so a full build produces a large, real (non-whitespace) diff against them that has nothing to do with calculator formulas.
  - **This is not a Phase 7S regression** -- these pages are untouched by any Phase 7S source edit; the drift exists between commits and predates this phase's baseline (`219a57d`).
  - **Handled by**: after each generator run during this phase, the diff was compared against `219a57d` with `git diff -w` (whitespace-insensitive) file-by-file, and every file whose only-real change was this latent template drift (not one of this phase's own calculator/formula/trust-panel edits) was reverted to its committed baseline state via `git checkout HEAD -- <file>`. Confirmed via a final `git status` showing only the 15 files listed in `PRODUCTION-CHANGES.md` as modified.
  - **Not fixed, not applied, not silently absorbed.** Applying this migration sitewide is a real, substantial content-regeneration decision (225 pages) far outside a calculator-formula-integrity mandate (Section 13 explicitly prohibits "a general content audit or rewrite unrelated to the 5 named findings").
  - **Flagged clearly for the Project Director**: a future phase should decide whether/when to run a full, intentional `npm run build` regeneration pass sitewide (with its own dedicated review, since it will touch ~225 pages at once) to bring these pages current with the site's own template/injector pipeline. Until then, routine full `npm run build` runs during any future phase's regression sweep will keep surfacing this same diff -- the correct handling is the same selective-revert-to-baseline procedure used here, not silence and not an incidental sitewide commit.

## Confirmed safe, no action needed

- Pool/spa volume and turnover formulas: exact physical constants, re-confirmed unchanged.
- CYA calculator constant: internally consistent between calculator and documentation (not independently source-verified this phase -- not one of the 5 named findings).
- Salt calculator constant: independently re-derived from water-density physical constants and confirmed to match the existing implementation exactly -- upgraded from unaudited to VERIFIED_MATH.
- Shock calculator preset-tier UX architecture: confirmed defensible as a disclosed simplification; explicitly NOT redesigned.
- Bromine calculator, standalone LSI calculator (as a build target), programmatic families, URL architecture, redirects, sitemap, Spanish/French, AdSense: all out of scope, all confirmed untouched.

## Recommended next phase

A **dedicated calculator-formula-audit phase** (as the Phase 7R Director Assessment already anticipated) should address, with domain-expert input:
1. The pH-adjustment model (TA-aware redesign vs. a sourced fixed-TA approximation).
2. The generic granular/shock chlorine divisor's product assumption.
3. The shock formula's (`formula-03`) cal-hypo equation and its unit-labeling bug.
4. Whether to invest in the shock calculator's combined-chlorine input (enabling real breakpoint-based dosing) -- a product decision, not a pure evidence question.
5. If ever revisited: an LSI interpolation methodology and UI decision, building on the now-corrected, now-sourced formula page.
