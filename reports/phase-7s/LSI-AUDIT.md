# Phase 7S -- LSI Audit (P0-B)

## Mandate

Audit only. Do NOT build a calculator. Do NOT invent lookup tables. The standing decision against an interactive LSI calculator remains in force unless this phase produces unusually strong evidence that explicitly changes it.

## 1. What the formula page claims

`formulas/lsi-formula.html` (pre-fix) stated the equation `LSI = pH + TF + CF + AF − 12.1` and a worked example (pH 7.4, temp 80°F, CH 300 ppm, TA 100 ppm) that computed **three different results for the same inputs**:

1. `7.4 + 0.6 + 1.8 + 1.9 − 12.1 = 1.6`
2. An abandoned alternate method: `"pHs (saturation pH) ≈ 9.6... LSI = 7.4 − 9.6 = −2.2?"` (note the trailing "?", itself a sign the author was uncertain)
3. `"Using the simplified additive form"` again: `7.4 + 0.6 + 1.9 + 2.0 − 12.1 = −0.2` (using yet a third set of factor values: CF=1.9 and AF=2.0, neither matching attempt #1's CF=1.8/AF=1.9)

None of the three attempts cite where their factor values (0.6, 1.8, 1.9, 2.0, etc.) came from.

## 2. Repository-wide confirmation: no LSI computation exists

Confirmed via direct `grep` for `LSI|lsi|saturation|TF|CHF|TAF` (and temperature/calcium/alkalinity-factor variants) across every `.js` file in `js/`:

- `js/calc-utils.js`: zero matches.
- `js/calculator.js`: zero matches.
- No other client-side script computes or displays an LSI value anywhere on the site.

**This confirms Phase 7R's core finding: there is no interactive LSI calculator, and none was built this phase.**

## 3. Correction to Phase 7R's finding: lookup-table data DOES exist

Phase 7R's report stated "no LSI lookup-table data exists anywhere in the codebase." This phase's fresh, independent search found this to be **incorrect** -- `data/datasets/water-balance.json` (and its true source, referenced by `scripts/generate-datasets.js`) contains a complete, real, sourced dataset:

- `formula`: `"LSI = pH + TF + CHF + TAF − 12.1 (at 0 TDS)"` -- matches the formula page's equation exactly (once the page's variable names were aligned, see Section 5).
- A full temperature-factor table (10 rows, 32°F-105°F, sourced "Taylor Technologies Pool/Spa Water Chemistry," `confidenceLevel: "high"`).
- A full calcium-hardness-factor table (13 rows, 5-1000 ppm, same source).
- A full total-alkalinity-factor table (10 rows, 5-800 ppm, same source, with an explicit note on correcting TA for CYA content: `TA_corrected = TA − (CYA × 0.33)`).
- A `tds-constant` record: `12.1` for standard pools (~1,000 ppm TDS), `12.2` for saltwater pools (~3,200 ppm TDS).
- A `lsi-target-range` record: balanced −0.3 to +0.5, warning at −0.5/+0.8, critical at −1/+1.5.

**Also found:** `data/trust/formulas.json` already has a complete `formula-lsi` registry record (name, formula string, variable descriptions) referencing this exact same TF/CHF/TAF/12.1 structure -- someone had already built out the full trust/provenance metadata for an LSI formula. And `calculators/chemical-calculator.html`'s trust panel was **already citing this formula and dataset as something the calculator uses** (see Section 4) -- meaning the data layer, the trust metadata, and the calculator's own self-description all assumed LSI was live, but the actual computation code was never written.

## 4. New finding: a false capability claim

`calculators/chemical-calculator.html`'s trust panel (generated from `scripts/data/trust-calculator-metadata.js`) listed `formula-lsi` in `formulaIds` and stated in its custom note: *"LSI (very-high, pure chemistry equation)... reliable."* This directly asserts the calculator computes LSI. It does not (Section 2). This is a genuine, previously-undetected false claim, not merely an ambiguous or optimistic one -- the calculator has no code path that reads pH, temperature, calcium hardness, or alkalinity and produces an LSI value.

## 5. Disposition and production changes

**Formula page (`formulas/lsi-formula.html`): DOCUMENTATION_ERROR, corrected using the existing, already-sourced architecture** -- consistent with Section 6's narrow allowance ("If the formula page itself can be corrected using authoritative evidence and the existing architecture, that may be considered"). The worked example was rewritten to use exact entries from `data/datasets/water-balance.json`'s real tables (temp 76°F -> TF 0.6, CH 300 ppm -> CHF 2.1, TA 100 ppm -> TAF 2.0; no interpolation was invented), producing one single, consistent result: LSI = 7.5 + 0.6 + 2.1 + 2.0 − 12.1 = **0.1**. Variable names aligned to the dataset's own naming (CHF/TAF, not CF/AF). This is a documentation correction using data that already existed and was already sourced -- not new evidence synthesis, not a calculator build.

**Chemical calculator's trust panel: DOCUMENTATION_ERROR (false capability claim), corrected.** `formula-lsi` and `water-balance` removed from `chemical-calculator`'s `formulaIds`/`datasetDependencies` in `scripts/data/trust-calculator-metadata.js` (the true source; `data/trust/datasets.json` is generated from it); the custom trust-panel note rewritten to explicitly state the calculator does NOT compute LSI, with a link to the formula page.

**Interactive LSI calculator: ARCHITECTURAL_GAP, confirmed, NOT built.** No JS computation was added to `calc-utils.js`, `calculator.js`, or any new file. No lookup-table interpolation logic was written. The standing decision against a new standalone LSI calculator remains in force.

## 6. Does this phase's finding constitute "unusually strong evidence" to reopen the standing decision?

**No, and this phase does not attempt to.** The Director's Phase 7R carry-forward framing was: "we must not allow a future phase to 'repair' the example by simply choosing an LSI formula from the internet. The underlying computational architecture needs an expert-backed decision first." This phase's finding -- that the *data layer* (lookup tables) already exists and is sourced, while the *computation layer* (interpolation logic, input validation, UI, result rendering) does not -- actually narrows the gap that would need to be closed, but does not close it. Building a real calculator would still require: (a) an interpolation methodology for inputs that fall between table rows (not specified anywhere in the existing architecture, and not something this phase should invent), and (b) an explicit product decision about UI/UX. Both remain out of this phase's mandate. The correct disposition remains: audit the documentation using what exists, do not build.
