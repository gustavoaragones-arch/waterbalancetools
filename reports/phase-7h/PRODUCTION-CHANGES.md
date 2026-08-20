# Production Changes (Phase 7H)

All changes made at generator/template/schema-engine source per Step 20, except where explicitly noted "no generator exists" (verified via `grep -rl "writeFileSync"` across every script referencing that filename before hand-editing).

## Schema engine / generators

- **`lib/schemaEngine.js`** — added `generateWebPageSchema()` and wired `webPage` into `renderAllSchemas()`. New capability, no behavior change to existing callers.
- **`scripts/template-utils.js`** (`buildBreadcrumb()`) — fixed JSON-LD double-escaping bug: the shared HTML-escaper was applied to the JSON-LD `"name"` value, turning `&` into literal `&amp;` text inside the JSON string. Now uses `JSON.stringify()` for that value. Regenerates every page using the shared breadcrumb builder (academy, glossary, formulas, reference, hubs).
- **`scripts/generate-trust.js`** — (1) wired `lib/schemaEngine.js` into the shared `sitePage()` template: every editorial/methodology/provenance/revisions page now emits WebPage + BreadcrumbList JSON-LD (16 pages). (2) `renderSections()`: `<h3>` → `<h2>` for policy-section headings (accessibility heading-skip fix), with the matching CSS selector updated.
- **`scripts/generate-release.js`** — added WebPage + BreadcrumbList schema to `releases/index.html` and each `releases/{version}.html` page (3 pages).
- **`scripts/generate-compatibility.js`** — added WebPage + BreadcrumbList schema to `releases/compatibility.html`.
- **`scripts/generate-data-docs.js`** — inserted `<h2>Datasets</h2>` before the per-dataset `<h3>` card grid on `reference/datasets/index.html` (accessibility heading-skip fix).
- **`templates/release-template.html`** — added the `{{SCHEMA}}` placeholder token (only consumer is `generate-release.js`, updated in the same change).

## Forensic audit tooling (detector fixes, not site content)

- **`scripts/audit-forensic/lib/parse.js`** — visible-FAQ detection now recognizes both `.faq-item` and `.paa-item` (previously only the former), eliminating a false-positive source across 19 pages.
- **`scripts/audit-forensic/lib/schema-audit.js`** — (1) removed `DefinedTerm` from the strict name-must-equal-H1 check (schema.org design: DefinedTerm.name is the canonical term, not the page title). (2) BreadcrumbList/H1 comparison changed from exact-match to a bidirectional substring check, correctly allowing the standard short-breadcrumb-label pattern while still catching genuinely wrong labels.

## New validators (required Phase 7H deliverables)

- **`scripts/validate-schema-content-consistency.js`** (Step 6) — new.
- **`scripts/validate-phase-7h.js`** (Step 21) — new.
- **`scripts/phase-7h/build-schema-inventory.js`** (Step 2) — new.

## Hand-edited pages (no generator exists — confirmed before editing)

**FAQ made genuinely visible** (exact existing schema text, no new claims): `calculators/pool-chlorine-calculator.html`, `maintenance/how-often-add-chlorine-pool.html`, `pool-chemical-levels-chart.html`, `pool-chlorine-levels-chart.html`, `pool-ph-levels-chart.html`.

**HowTo removed** (misleading "simple calculator result" schema, Step 8 policy): all 12 real calculator pages — `calculators/{hot-tub-chlorine,hot-tub-ph,hot-tub-shock,pool-alkalinity,pool-cyanuric-acid,pool-ph,pool-shock,pool-turnover-rate,pool-volume,saltwater-pool-salt,spa-volume}-calculator.html`, `pool-chlorine-calculator.html`.

**WebApplication schema added** (was entirely absent; used each page's own existing title/description text): the same 12 calculator files plus `calculators/chemical-calculator.html` (13 total; `pool-chlorine-calculator.html` already had one, from an earlier phase).

**Breadcrumb double-escaping fixed directly** (static duplicates of the `template-utils.js` bug, no generator): `calculators/chemical-calculator.html`, `resources/index.html`.

**WebPage + BreadcrumbList schema added** (previously zero JSON-LD): `printable/maintenance-checklist.html`, `printables/{airbnb-pool-turnover-checklist,hot-tub-maintenance-log,pool-maintenance-checklist}.html`.

**Accessibility heading-level fix** (`<h3>` → `<h2>`, no generator): all 12 calculator "Result" headings, plus `calculators/pool-volume-calculator.html`'s "Rectangular/Circular/Oval" shape-selector sub-headings.

## Explicitly left unchanged, with reason

- `charts/hot-tub-chemical-levels-chart.html`, `charts/pool-chemical-levels-chart.html` — retired `REDIRECT_SOURCES` duplicates; adding content or schema to a page `url-policy.js` already says must never be production again would work against that existing policy. See `SCHEMA-RESOLUTION.md`.
- `about/index.html` — deliberately NOT given its own Organization schema; Organization/WebSite is homepage-only by pre-existing, documented policy in `components/global-schema.html`.
- Calculator dosing/volume/turnover formulas — no calculation logic was touched anywhere in this phase, per explicit scope control.
- The 26 `programmatic/*` near-duplication MERGE flags — not reopened; Phase 7G's KEEP decision stands. See `THIN-CONTENT-RESOLUTION.md`.
