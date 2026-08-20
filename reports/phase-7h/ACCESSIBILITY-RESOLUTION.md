# Accessibility Resolution (Phase 7H, Steps 14-17)

## Method

Re-ran the Phase 7A UX/accessibility audit fresh against the current, post-7G repository state. Baseline: **26 of 523 pages flagged**, all with exactly one finding type: `HEADING_LEVEL_SKIP` (a heading jumps more than one level, e.g. h1 → h3 with no h2 — WCAG 1.3.1 / 2.4.6). No images-missing-alt, no missing-viewport-meta, no calculator-form-missing-labels, and no table-missing-th-headers findings were present in the baseline.

## Classification

All 26 findings classified **P1_HIGH** (heading-hierarchy skips break document-outline / screen-reader heading-navigation, but don't block core functionality — not P0).

| Group | Count | Root cause | Fix |
|---|---:|---|---|
| Calculator pages (`calculators/*`) | 12 | Static, hand-authored `<h3>Result</h3>` immediately after `<h1>`, with no intervening `<h2>` (the next real `<h2>` — "Recommended Levels" — comes later). No generator exists for these files (confirmed). | Hand-corrected `<h3>Result</h3>` → `<h2>Result</h2>` on all 12; also `<h3>Rectangular/Circular/Oval</h3>` (shape-selector sub-labels) → `<h2>` on `pool-volume-calculator.html`, the 1 file with a second instance of the same pattern. |
| `editorial/*` (6) + `methodology/*` sub-pages (7) | 13 | Shared `renderSections()` helper in `scripts/generate-trust.js` rendered every policy section as `<h3>` directly under `<h1>`, with no `<h2>` in between. | Generator-level fix: `renderSections()` now emits `<h2>` (with the accompanying CSS rule updated to match); regenerating via `scripts/generate-trust.js` fixed all 13 pages from one source change. |
| `reference/datasets/index.html` | 1 | `scripts/generate-data-docs.js` rendered each dataset card's `<h3>` title directly under the page `<h1>`, with no `<h2>`. | Generator-level fix: inserted a single `<h2>Datasets</h2>` before the card grid, giving the correct h1 → h2 → h3 nesting. |

All fixes were made at the generator or shared-template source (Step 20), not by patching individual rendered HTML files, except the 12+1 calculator pages, which have no generator (verified via `grep -rl "writeFileSync"` across every script referencing each filename) and were hand-edited per the documented exception.

## Verification

Re-ran the accessibility audit after each fix batch:

- After calculator fixes: 26 → 1 (`calculators/pool-volume-calculator.html`, the shape-selector sub-heading pattern, missed in the first pass).
- After the `pool-volume-calculator.html` fix: 1 → 0.

**Final: 0 of 523 pages flagged.** P0 = 0, P1 = 0.

## Calculator accessibility (Step 15)

Verified directly (not just via the audit tool) across all 13 calculator pages:

- Every `<input>` inside `#calc-form` has a matching `<label for="...">` — confirmed programmatically (`validate-phase-7h.js`'s `P1_CALCULATOR_INPUT_MISSING_LABEL` check, 0 violations).
- Units are stated in the label text itself (e.g. "Pool volume (gallons)"), not conveyed by placeholder text alone.
- The "Result" output panel is a proper heading-labeled region (now `<h2>`), not a bare `<div>`.
- No calculation logic was touched — only heading levels.

## Table accessibility (Step 16)

Checked the chemistry reference/chart tables sitewide for `<th>` usage: the Phase 7A `TABLE_MISSING_TH_HEADERS` check found 0 violations in the current baseline (all chemistry tables already use `<th>` header cells). No captions were mechanically added — per the brief's explicit instruction not to add captions where they add no value, and none of the reviewed tables were ambiguous enough to need one beyond their existing `<h2>`/`<h3>` section heading.

## Image accessibility (Step 17)

The Phase 7A `IMAGE(S)_MISSING_ALT` check found 0 violations in the current baseline (every image sitewide already has alt text or is correctly decorative). No changes were needed or made.

## Remaining review queue

None outstanding for the specific findings this phase's baseline surfaced. A full manual (not static-heuristic) accessibility pass — focus-visibility, keyboard-trap testing, live-region announcements for calculator results, contrast ratios — was not performed; the Phase 7A tooling is a static/heuristic audit, not a full WCAG conformance test, and a genuine manual/automated-tool (e.g. axe-core, Lighthouse) pass is recommended as a future phase.
