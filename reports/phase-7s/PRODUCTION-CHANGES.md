# Phase 7S -- Production Changes

Every change was made at the smallest authoritative source (a JS engine file, a data-source `.js` file that a generator writes out to JSON, or hand-authored static content with no controlling generator), never by hand-patching a file a generator controls without also fixing the source. Zero URL, redirect, sitemap, programmatic-family, AdSense, or language changes.

## 1. `js/calc-utils.js`

**OLD:** `calculateChlorine` liquid divisor `128000`; tablets divisor `12000`.
**NEW:** liquid divisor `749.4`; tablets divisor `6666.7`.
**SOURCE:** `in-doh-chemical-adjustment-2021` (Indiana DOH, read in full) + independent first-principles derivation.
**REASON:** Both were demonstrably, conclusively wrong -- see `LIQUID-CHLORINE-AUDIT.md`. Liquid was ~171x too low; tablets was ~1.8x low relative to the government table and this site's own already-correct dosage-matrices.json trichlor entry.
**RISK:** Low-moderate. Output values increase substantially (toward correctness, not away from it); verified via direct function calls before and after.
**VALIDATION:** Manual invocation confirmed new outputs (66.7 oz for the standard worked example; 1.5 oz/10,000gal/1ppm for tablets, matching the government table exactly).

## 2. `js/calculator.js`

**OLD/NEW/SOURCE/REASON:** Identical fix to `js/calc-utils.js` above -- this file is a second, independent, duplicate implementation of the same formulas, used by `calculators/chemical-calculator.html`. Not consolidated into one file (de-duplication is a separate architecture question, out of this phase's mandate); kept numerically in sync.
**RISK:** Low-moderate, same as above.
**VALIDATION:** `node -c` syntax check; visual diff confirms identical constant values to `calc-utils.js`.

## 3. `scripts/data/formulas-data.js`

**OLD:** `formula-02` (liquid chlorine): equation `Strength% x 0.0128` divisor; worked example self-contradicting ("Wait -- that looks wrong"). `formula-05` (alkalinity): equation constant `0.0012`; explanation stated "1.5 lbs." `formula-09` (LSI): worked example computed 3 different values (1.6, -2.2, -0.2) for the same inputs.
**NEW:** `formula-02`: equation constant `0.013344`; single, consistent worked example (66.7 fl oz). `formula-05`: equation constant `0.000224`; explanation corrected to "1.4 lbs," matching the already-correct implementation; single consistent worked example (10.1 lbs). `formula-09`: equation variables renamed to match the real dataset (CHF/TAF); worked example rewritten using exact values from `data/datasets/water-balance.json`'s real lookup tables (single answer: LSI = 0.1); explanation and limitations updated to disclose that no interactive LSI calculator exists.
**SOURCE:** `in-doh-chemical-adjustment-2021` (formula-02, formula-05); `data/datasets/water-balance.json` + `data/trust/formulas.json` (formula-09, already-existing, already-sourced architecture).
**REASON:** See `LIQUID-CHLORINE-AUDIT.md`, `ALKALINITY-AUDIT.md`, `LSI-AUDIT.md`.
**RISK:** Low -- documentation/explainer content only; `formula-02`/`formula-05` bring documentation into agreement with corrected (formula-02) or already-correct (formula-05) calculator code; `formula-09` corrects a self-contradictory example using data that already existed.
**VALIDATION:** Regenerated via `node scripts/populate-data.js` (formulas.json only was verified clean; see the academy.json incident note below) and `node scripts/generate-formulas.js`; live HTML output spot-checked for the absence of "Wait" / contradictory-value patterns.

## 4. `scripts/data/dataset-dosage-matrices.js` (true source; `data/datasets/dosage-matrices.json` is generated from it by `scripts/generate-datasets.js`)

**OLD:** `liquid-chlorine-10pct` coefficient `10.7`; `liquid-chlorine-12pct` coefficient `8.6`.
**NEW:** `10.7` -> `13.3` (10% record); `8.6` -> `10.7` (12.5% record).
**SOURCE:** `in-doh-chemical-adjustment-2021`.
**REASON:** The prior "10%" coefficient exactly matched the government table's 12% figure (mislabeled); the "12.5%" coefficient did not match either. See `LIQUID-CHLORINE-AUDIT.md` Section 4.
**RISK:** Low -- this dataset is descriptive/reference (`/reference/datasets/dosage-matrices`), not directly read by any calculator's live JS (confirmed via grep; the calculators use `calc-utils.js`/`calculator.js`'s own hardcoded constants, now separately corrected above).
**VALIDATION:** `node scripts/generate-datasets.js` regenerated `data/datasets/dosage-matrices.json`; confirmed via direct read.

## 5. `scripts/data/trust-calculator-metadata.js` (true source; `data/trust/datasets.json` is generated from it by `scripts/generate-trust.js`)

**OLD:** `chemical-calculator` record listed `formulaIds: [..., 'formula-lsi', ...]`, `datasetDependencies: [..., 'water-balance', ...]`, `entityDependencies: [..., 'lsi']`, and a note claiming "LSI (very-high, pure chemistry equation)... reliable" plus references to alkalinity and calcium-hardness dosing as formulas this calculator uses.
**NEW:** `formulaIds` reduced to `['formula-chlorine-dose', 'formula-ph-adjustment']` only; `datasetDependencies`/`entityDependencies` correspondingly reduced; note rewritten to state plainly that this calculator computes only a chlorine dose and a pH dose, reads alkalinity as unused informational context, and does not compute alkalinity, calcium-hardness, or LSI at all.
**SOURCE:** Direct inspection of the calculator's actual inline JS (`calculators/chemical-calculator.html`'s submit handler) and `js/calculator.js` -- not a claim requiring external research, a factual verification of what the code does.
**REASON:** Three false capability claims found on the same page during the LSI audit -- see `LSI-AUDIT.md` Sections 4 and the Decision Matrix. Explanatory correction only; Section 13 rule #3 explicitly permits this ("a purely explanatory correction can be made without changing calculation behavior") -- no calculation was ever performed for these three, so none was changed.
**RISK:** Low.
**VALIDATION:** Regenerated via `node scripts/generate-trust.js`; the calculator's trust panel was stripped and re-injected (`node scripts/inject-trust-panels.js`, since injection is idempotent-by-marker-presence and does not auto-refresh existing content) and the corrected note verified live, twice, across two full `npm run build` cycles.

## 6. `calculators/chemical-calculator.html` (trust panel only; hand-authored static content, not template-owned beyond the injector's own marker block)

Trust panel stripped and regenerated (see item 5) to reflect the corrected `trust-calculator-metadata.js`. No form field, input, output, or calculation logic in this file was touched.

## 7. `scripts/data/chemistry-sources.js`

**OLD:** 19 source records (through Phase 7R).
**NEW:** Added 1 new source record, `in-doh-chemical-adjustment-2021` (Indiana Department of Health, Environmental Public Health Division, "Adjusting Chemical Levels in a Swimming Pool" -- distinct document from Phase 7R's breakpoint-chlorination source, same issuing division), covering chlorine, shock treatment, total alkalinity, calcium hardness, cyanuric acid, and dosing math. 20 source records total.
**SOURCE:** The document itself, fetched and read in full.
**REASON:** This is the evidence source underlying the liquid-chlorine, tablets, and alkalinity fixes above -- registered per the established chemistry-evidence architecture (source registry -> claim mapping -> generator) rather than cited informally.
**RISK:** None -- additive only, no existing record modified or removed.
**VALIDATION:** Referenced by ID from `formulas-data.js` and `LIQUID-CHLORINE-AUDIT.md`/`ALKALINITY-AUDIT.md`; record shape matches the existing 19 entries.

## Not changed

- `js/calc-utils.js`'s pH-adjustment constants (6, 5) and `formulas-data.js`'s `formula-04` (pH) equation/worked example -- REQUIRES_EXPERT_REVIEW, no conclusive evidence found (see `PH-AUDIT.md`).
- `js/calc-utils.js`'s generic granular/shock divisor (10000) -- unspecified product, REQUIRES_EXPERT_REVIEW.
- `formulas-data.js`'s `formula-03` (shock) equation and its own oz/lbs unit-labeling inconsistency -- newly discovered, documented, not fixed (see `SHOCK-AUDIT.md`).
- Shock calculator preset tiers (5/10/15/20 ppm) -- confirmed architecturally defensible as a UX pattern, NOT replaced with a breakpoint/CC-based model, per explicit instruction.
- No LSI calculator, no bromine calculator, no interpolation logic, no new interactive tool of any kind.
- `data/academy.json`'s 2 orphaned entries were NOT merged into their proper `scripts/data/academy-*.js` source files this phase (see the incident note below) -- restored to their correct content via `git show`, left as direct JSON content (matching how 3 prior phases already treated this file), with the underlying architecture gap documented for a future phase.

## Post-submission correction: access-date metadata error (Director Assessment)

The Director Assessment flagged that `in-doh-chemical-adjustment-2021`'s `accessed_date` (and the associated `lastReviewed`/reference dates on formula-02, formula-05, formula-09, and the `chemical-calculator` trust record) were recorded as `2026-08-29`, one day in the future relative to the project date (`2026-08-28`) at the time the work was actually performed. Verified against the session's own environment metadata (its `currentDate` context read `2026-08-28` throughout Phase 7S's implementation, advancing to `2026-08-29` only after the phase was submitted for review) -- this is the actual observed date, not a guess. All occurrences corrected to `2026-08-28`: `scripts/data/chemistry-sources.js` (the source record's `accessed_date` and its authoring comment), `scripts/data/formulas-data.js` (3 `lastReviewed` fields and 2 `references` entries), `scripts/data/trust-calculator-metadata.js` (1 `lastReviewed` field), `reports/phase-7s/LIQUID-CHLORINE-AUDIT.md` (1 prose mention), and their generated outputs (`data/formulas.json`, `data/trust/datasets.json`, `formulas/alkalinity-formula.html`, `formulas/liquid-chlorine-formula.html`, `formulas/lsi-formula.html`, `calculators/chemical-calculator.html`). No formula, constant, or classification was changed as part of this correction. Provenance validators (`validate-provenance.js`, `validate-provenance-resolution.js`, `validate-entity-provenance.js`) and the full Phase 7S validator/test suite were re-run afterward; all pass clean.

The Director also asked that the liquid-chlorine summary avoid overclaiming an "exact" government-table match. `PHASE-7S-STATUS.md`'s summary line was tightened to match the more precise framing `LIQUID-CHLORINE-AUDIT.md` already used: the 12%-strength calculation (11.12 fl oz) is within ~4% of the table's 10.7 fl oz figure (agreement within normal rounding, not exact), and the 10% figure (13.34 fl oz) is this audit's calculation, not a table-confirmed number.

## Regression-sweep note: sitewide latent template/injector drift (discovered, NOT applied)

Running `npm run build` for the Section 17 regression sweep revealed that roughly 225 pages sitewide (entities, guides, editorial, methodology, charts, comparisons, printables, releases, internal report dashboards, revisions, search, sitemap XML, legal, maintenance, qa, provenance, templates, 404.html, about/, plus 4 `data/indexing/*.json` files, `data/navigation.json`, `data/search-index.json`, and `data/platform/compatibility.json`) have a real, non-whitespace diff between their currently-committed content and what the current generator/injector pipeline (`inject-nav.js`'s v4 header, OG/Twitter meta tags, `content-version` badges) would produce. This predates Phase 7S entirely -- none of these files were touched by any Phase 7S source edit -- and is unrelated to calculator formulas. Every one of these files was reverted to its exact `219a57d` committed state via `git checkout HEAD -- <file>` after each generator run; only the 15 files listed above remain modified. Full detail and the recommended handling are in `REVIEW-QUEUE.md`'s "Infrastructure risk discovered" section and `DECISION-MATRIX.csv`'s "Sitewide latent template/injector drift" row.

## Incident note: `data/academy.json` near-data-loss (caught and fully remediated within this phase)

While syncing the corrected `formulas-data.js` into `data/formulas.json` (a necessary step for the liquid-chlorine/alkalinity/LSI fixes to reach the live formula pages), `node scripts/populate-data.js` was run. This script also regenerates `data/academy.json` from 8 separate `scripts/data/academy-*.js` source files -- and 2 academy articles (`academy/fundamentals/new-pool-startup-chemistry`, added directly to `data/academy.json` in Phase 7P; `academy/fundamentals/indoor-pool-chemistry`, pre-existing) exist only as direct JSON edits, not in any of those source files. Running `populate-data.js` silently deleted both (162 lines, confirmed via `git diff --stat`).

This was caught within the same working session via a fresh `validate-phase-7m.js`/`validate-phase-7p.js` run (both failed with a clear, specific error identifying the missing content), root-caused via `git diff`, and fully corrected by restoring `data/academy.json` from the Phase 7R git commit (`219a57d`) and regenerating `academy/fundamentals/*.html` from the restored, correct file. Verified via a full subsequent `npm run build` plus `validate-phase-7m.js`/`validate-phase-7p.js` both passing clean. `scripts/populate-data.js` was not run again for the remainder of this phase. No content was permanently lost; the incident and the underlying architecture gap are both documented in `REVIEW-QUEUE.md` and `DECISION-MATRIX.csv` rather than hidden.
