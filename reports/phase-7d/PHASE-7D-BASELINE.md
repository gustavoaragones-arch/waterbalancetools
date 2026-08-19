# Phase 7D — Chemistry Knowledge Baseline

Loaded from `reports/phase-7a/*` as it exists after Phase 7B/7C regeneration, plus a fresh source-level scan (this phase does not rely on the Phase 7A CSV alone).

## Extracted claims (current state)

- `reports/phase-7a/chemical-claims.csv`: **3,933** rows (the Phase 7A brief's original figure of 3,928 has drifted slightly across the two intervening full rebuilds in Phases 7B/7C, which regenerated `last-updated` stamps and minor content; this is the current, accurate count, not a discrepancy in this phase's work).
- Claim types present: `EDITORIAL_SIMPLIFICATION`, `RANGE`, `CALCULATED_VALUE`, `SAFETY_GUIDANCE`, `RULE_OF_THUMB` (per Phase 7A's `claim_type` column).
- `review_required` column: the large majority are `REQUIRES_EXPERT_REVIEW` (Phase 7A's own conservative default for any claim without a matched numeric range at extraction time).

## Current source/citation coverage

- `reports/phase-7a/source-audit.csv`: 413 major factual pages, **413/413** cite zero external authoritative sources (unchanged since Phase 7A; not addressed by Phases 7B/7C, which were explicitly URL/generator-integrity phases).
- Sitewide: 0 `<a href>` tags point off `waterbalancetools.com` (confirmed again during this phase's source-level scan).

## Existing chemistry data files found (pre-Phase-7D)

None of these existed as a *canonical, cross-referenced* knowledge layer before this phase — each is a standalone, independently-authored data source with its own numbers:

- `js/calc-utils.js` — shared client-side calculator formulas (chlorine, pH adjustment, shock, pool/spa volume, salt, CYA, alkalinity, turnover). Single source of truth for calculator *math*, but contains no citations and no explicit statement of which concentration/product is assumed.
- `data/trust/formulas.json`, `data/formulas.json` — formula metadata and page copy (separate from the calculator math itself).
- `scripts/data/entities-*.js` (chemicals, measurements, equipment, processes, problems, remaining) — entity definitions, some with embedded numeric claims (e.g. salt/CYA targets in `entities-equipment`/`academy-equipment`).
- `scripts/data/trust-calculator-metadata.js` — calculator-to-dataset/entity dependency metadata (no target ranges).
- `data/datasets/*.json` (chemical-ranges, dosage-matrices, hot-tub-ranges, etc.) — compiled canonical-*looking* dataset files, but not source-cited and not the actual input to most page copy (much page copy is hand-authored prose repeating similar-but-not-identical numbers).

None of these cross-referenced each other, so the same parameter (e.g. CYA) could and did carry different numeric values in different files with no mechanism to detect or explain the difference -- see `chemistry-consistency-matrix.csv` for a live example (CYA 30-50 ppm in general residential content vs. 60-80 ppm in saltwater-pool content).

## Generator locations containing chemistry values (non-exhaustive, see full inventory)

`scripts/data/academy-equipment.js`, `scripts/data/entities-*.js`, `js/calc-utils.js`, `data/formulas.json`, `data/reference.json`, plus programmatic-page generators (`scripts/generators/generate-chlorine-pages.js`, `generate-ph-pages.js`, `generate-shock-pages.js`, `generate-hot-tub-pages.js`) that embed numeric ranges directly in template strings. Full source-level inventory: `chemistry-source-inventory.csv` (1,893 numeric-chemistry-value occurrences across 232 scanned `scripts/`, `js/`, `data/` files).

## Parameter categories identified

pH, Free Chlorine, Combined Chlorine, Total Chlorine, Total Alkalinity, Calcium Hardness, Cyanuric Acid, Salt, Bromine, Water Temperature, Chlorine Demand, Shock Treatment, Sanitizer, Oxidation, Algae -- 15 concepts, now the canonical vocabulary in `scripts/data/chemistry-knowledge.js`.

## Affected page families

`academy/*` (fundamentals, sanitizers, equipment, hot-tubs, troubleshooting), `glossary/*`, `entities/*`, `reference/*`, `formulas/*`, `guides/*`, `programmatic/*` (chlorine, ph, shock, hot-tubs), `calculators/*` -- effectively every content family on the site references at least one chemistry parameter.
