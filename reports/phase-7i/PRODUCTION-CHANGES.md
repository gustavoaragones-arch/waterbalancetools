# Production Changes (Phase 7I)

All changes made at generator/data-source level per Step 17, except two static-file exceptions (documented, confirmed no generator exists before editing).

## Generator/data-source fixes

- **`scripts/generate-entities.js`** — the single highest-leverage fix this phase: `entityIndex` (compiled into `data/graph/entity-index.json`, the file `generate-entity-pages.js` actually reads) was silently dropping `longDescription`, `aliases`, `synonyms`, and `sourceOrganizations` for all 104 entity records, even though every one of them is fully authored in `scripts/data/entities-*.js`. Added the four fields. This alone resolved the "thin entity content" finding for the entire 104-page entity corpus, including both confirmed Phase 7H findings (fiberglass-pool, vinyl-pool) — no new content was written.
- **`scripts/generate-entity-pages.js`** — (1) shortened `PAGE_TITLE` from `"{Name} — Pool Chemistry Entity | WaterBalanceTools"` to `"{Name} | WaterBalanceTools"`, resolving 11 TITLE_TOO_LONG findings with zero collisions (verified). (2) Meta description now falls back to a `longDescription`-derived sentence when `shortDescription` is under the 50-char minimum (2 entities affected: calcium-chloride, unit-liters).
- **`scripts/data/entities-remaining.js`** — renamed the `unit-liters` record's `name` field from `'Liters'` to `'Metric Liters'`, resolving a genuine duplicate-title collision with the separate `liters` measurement entity (mirrors the sibling `'US Gallons'` naming already used for `unit-gallons` in the same file).
- **`scripts/generate-glossary.js`** — shortened `PAGE_TITLE` from `"{Term}: Definition | Glossary | WaterBalanceTools"` to a length-aware `"{Term} | Glossary | WaterBalanceTools"` (falling back to `"{Term} | WaterBalanceTools"` if still over 65 chars), resolving all 7 glossary TITLE_TOO_LONG findings. First attempt used a middle-brand form (`"{Term} | WaterBalanceTools Glossary"`) that collided with `scripts/normalize-seo-metadata.js`'s title-suffix enforcement (any title not literally ending in `"| WaterBalanceTools"` gets that suffix appended again) — caught via the two-build reproducibility check, corrected before finalizing.
- **`scripts/generate-reference.js`** — `PAGE_TITLE` now drops the `"| Reference"` category segment only when the full title (with it) would exceed 65 chars, keeping the category marker on every page where it still fits (5 of 7 flagged pages) rather than removing it site-wide.
- **`scripts/data/reference-pages.js`** — shortened the `title` field for 2 records where the title text itself (not just the suffix) needed trimming: `cya-matrix` ("CYA Level and Minimum Free Chlorine Matrix" → "CYA & Minimum Free Chlorine Matrix") and `pool-shape-guide` ("Pool Shape & Volume Calculation Guide" → "Pool Shape & Volume Guide"). This field also feeds the page's H1, so both title and H1 shortened together (Step 14 consistency).

## New validators / tooling (required Phase 7I deliverables)

- **`scripts/validate-phase-7i.js`** (Step 18) — new.
- **`scripts/phase-7i/build-thin-page-inventory.js`** (Step 2) — new.
- **`scripts/data/entity-content-policy.js`** (Step 5) — new, policy reference only.

## Hand-edited pages (no generator exists — confirmed before editing)

Five calculator `<title>`/`og:title`/`twitter:title` triples shortened directly (all three occurrences per file, verified no collision, no generator found via `grep -rl "writeFileSync"` across every script referencing each filename):

- `calculators/pool-ph-calculator.html`
- `calculators/hot-tub-chlorine-calculator.html` — also fixed a pre-existing H1/title wording mismatch ("Chemical" in title vs. "Chlorine" in H1) while already editing this title.
- `calculators/pool-shock-calculator.html`
- `calculators/chemical-calculator.html`
- `calculators/pool-chlorine-calculator.html`

## Compile step required and run

`scripts/populate-data.js` compiles `scripts/data/reference-pages.js` into `data/reference.json` (which `generate-reference.js` actually reads) — the same "source JS → compiled JSON → generator" pattern discovered in the `entity-index.json` bug. Run after the `reference-pages.js` title edits, before regenerating reference pages, so the data-source changes actually took effect (initially missed this step; caught when the rendered titles didn't change, corrected before finalizing).

## Explicitly left unchanged, with reason

- `calculators/volume-calculator.html` — retired `REDIRECT_SOURCES` duplicate (non-production per `url-policy.js` regardless of physical file presence), same policy Phase 7H applied to the retired chart-page duplicates. Its `TITLE_TOO_LONG` finding is not fixed.
- `reference/printable-resources-index.html` — carried forward Phase 7H's KEEP-by-policy disposition (word-count false positive; the page's directory table genuinely satisfies its query). No change.
- `reference/datasets/*` (16 pages, noindex) — several also carry `TITLE_TOO_LONG`, out of scope: noindex pages, not part of the indexable reference-page set this phase targeted.
- No calculator dosing/volume/turnover formula logic was touched anywhere in this phase.
- 4 organization entities (cdc, epa, nsf, lamotte), 10 unit-definition entities, 4 resource-pointer entities, and 4 entities flagged on a duplication-heuristic false positive — all reviewed individually and classified KEEP, not modified. See `entity-content-decisions.csv`.
