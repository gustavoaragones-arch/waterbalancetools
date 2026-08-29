# Phase 7T -- Production Changes

Every change made at the smallest authoritative source, never by hand-patching a generated file. Full derivation and evidence for each is in the corresponding audit report.

## 1. `scripts/data/formulas-data.js` -- `formula-03` (Pool Shock Formula)

**OLD equation:** `Shock dose (oz) = [(Target FC − Current FC) × Volume (gal)] ÷ [Available Chlorine (%) × 800]`
**NEW equation:** `Shock dose (oz) = (Target FC − Current FC) × Volume (gal) × 0.013344 ÷ Available Chlorine (%)`
**OLD worked example result:** `80,000 ÷ 52,000 = 1.54`, labeled "lbs" despite the equation stating "oz."
**NEW worked example result:** `4 × 20,000 × 0.013344 ÷ 65 = 16.4 oz (1.03 lbs)`, unit stated and used consistently.
**SOURCE:** `phta-water-chemistry-adjustment-guide-2021` (fetched and read in full), `phta-calcium-hypochlorite-fact-sheet-2021` (fetched and read in full), corroborated by `in-doh-chemical-adjustment-2021` (Phase 7S) and this site's own pre-existing `dataset-dosage-matrices.js` calcium-hypochlorite entries.
**REASON:** See `FORMULA-03-AUDIT.md`. The old `800` divisor was dimensionally wrong under either an oz or lbs interpretation (≈10.7x too low as oz, ≈1.5x too high as lbs) and corresponded to an uncited, incorrect "1 lb raises 10,000 gal by 8 ppm" assumption where the mass-balance-correct value is ≈12 ppm. The new constant (`0.013344`) is the same, already Director-approved, mass-balance constant used for liquid chlorine (`formula-02`), and converges with PHTA's own dosing table -- the independent external evidence -- to within normal rounding; this site's own pre-existing cal-hypo dataset entries provide additional, corroborating (not independent) confirmation.
**RISK:** Low. `formula-03` is documentation-only -- `calculators/pool-shock-calculator.html`'s live JS uses the generic `calculateShock` function, never this equation (confirmed in Phase 7S's `SHOCK-AUDIT.md` and re-confirmed this phase). No calculator behavior changes.
**VALIDATION:** `node -e "console.log((4*20000*0.013344/65).toFixed(2))"` → `16.42`, matching the worked example. Regression test added: `scripts/test-phase-7t.js` category I.

Also updated on the same record: explanation (states the shared mass-balance relationship with liquid chlorine and cites the new sources), limitations (adds PHTA's product/label-specificity caveat), `lastReviewed` (`2026-08-29`), and `references` (adds the two PHTA sources).

## 2. `scripts/data/chemistry-sources.js`

Added 2 new source records: `phta-water-chemistry-adjustment-guide-2021` (PHTA "Pool & Spa Management," Appendix B) and `phta-alkalinity-fact-sheet-2021` (PHTA "Fact Sheet: Alkalinity," May 2021). A third PHTA document read this phase (`phta-calcium-hypochlorite-fact-sheet-2021`) was found to already exist in the registry from Phase 7Q (same URL, same document) -- reused by ID rather than duplicated; confirmed via `validate-provenance.js`'s `DUPLICATE_SOURCE_ID` check, which caught the attempted duplicate and was corrected before proceeding. 22 total sources (was 20 after Phase 7S).

## Not changed

- `js/calc-utils.js`'s `calculateChlorine` granular/shock branch and `calculateShock` (generic divisor `10000`) -- `REQUIRES_EXPERT_REVIEW`/`ARCHITECTURAL_GAP`, no defensible single value found. See `SHOCK-DIVISOR-AUDIT.md`.
- `js/calc-utils.js`'s `calculatePHAdjustment`, `js/calculator.js`'s `phIncreaserOunces`/`phReducerOunces`, and `formulas-data.js`'s `formula-04` -- `REQUIRES_EXPERT_REVIEW`/`ARCHITECTURAL_GAP`, no conclusively supportable model found. See `PH-AUDIT.md`. `formula-04`'s abandoned-mid-calculation worked example is a known defect intentionally left uncorrected, since patching the arithmetic without resolving the underlying model question would misrepresent this audit's own finding.
- `calculators/pool-shock-calculator.html`, `hot-tub-shock-calculator.html`, and their trust panels -- confirmed the existing Phase 7S disclosure already accurately describes the architecture this phase independently re-derived. See `SHOCK-ARCHITECTURE-AUDIT.md`.
- `scripts/data/formulas-data.js`'s `formula-05` (alkalinity, Phase 7S `RESOLVED`) -- a new PHTA fact-sheet prose figure (1.5 lbs) was found to differ slightly from the current 1.4 lbs implementation, but PHTA's own more-specific dosing table (read this phase) reconfirms 1.4 lbs, and a ~7% prose-vs-table discrepancy within PHTA's own publications does not meet the "materially wrong" bar required to reopen a Phase 7S `RESOLVED` decision. Documented in `REVIEW-QUEUE.md`, not acted on.
- No calculator UI, input field, or output field was added, removed, or redesigned anywhere on the site. No LSI calculator, no bromine calculator, no breakpoint-CC calculator built.

## Regeneration

`scripts/generate-formulas.js` was run to propagate the `formula-03` source change into `data/formulas.json` and `formulas/shock-formula.html`. Per the pattern established in Phase 7S, running this generator in isolation regresses pages to a pre-injector state (missing the sitewide nav/meta template layer a separate injector normally supplies); a full `npm run build` was run instead, and every file whose only diff against the `d5cbe3f` baseline was that same pre-existing, unrelated sitewide template drift (documented in Phase 7S's `REVIEW-QUEUE.md` and reconfirmed in this phase's `BASELINE.md`) was reverted via `git checkout HEAD -- <file>`, leaving only the files listed above plus `data/formulas.json` and `formulas/shock-formula.html` (and `formulas/index.html` if its hub listing content changed -- verified via `git diff -w` before keeping or reverting it).
