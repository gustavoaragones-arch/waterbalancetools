# Schema Resolution (Phase 7H, Steps 3-9)

## Canonical schema policy (Step 3)

Extended `lib/schemaEngine.js` with `generateWebPageSchema` (minimal WebPage: name/description/url) rather than creating a competing engine. Policy by page type:

| Page type | Expected schema |
|---|---|
| Calculator | WebApplication, BreadcrumbList; FAQPage only with genuine visible FAQ; HowTo only with a genuine visible procedure |
| Authority chart | BreadcrumbList; FAQPage only when genuinely visible |
| Guide / academy | BreadcrumbList; Article/HowTo/FAQPage only where justified |
| Glossary / entity | DefinedTerm, BreadcrumbList |
| Reference | BreadcrumbList |
| Legal | BreadcrumbList |
| Policy page (editorial/methodology/provenance/revisions) | WebPage, BreadcrumbList |
| Release notes | WebPage, BreadcrumbList |
| Printable | WebPage, BreadcrumbList |
| Programmatic long-tail | BreadcrumbList (WebApplication legitimately cross-references a related calculator's own URL, not this page's) |
| Home | Organization + WebSite — **homepage only**, by pre-existing deliberate policy (`components/global-schema.html`: "include once on the homepage `<head>` only — duplicate Organization/WebSite on other URLs can confuse parsers") |
| Hub/index pages (calculators/, glossary/, entities/) | BreadcrumbList only — a listing page is not itself a WebApplication or a single DefinedTerm |
| Internal tooling (reports/, audit/, qa/, tools/, search/) | None required — non-production per `url-policy.js`, all noindex |

## QUESTIONABLE resolution (Step 4)

Baseline (re-run against current, post-7G repository state, not assumed from the original Phase 7A numbers): **49 QUESTIONABLE findings**. All 49 individually investigated by reading the actual generator source, the actual rendered HTML, and (for breadcrumbs/DefinedTerm) the actual visible text — not assumed from the audit tool's label.

| Outcome | Count | Basis |
|---|---:|---|
| **CORRECT** (detector bug fixed at the source) | 27 | 19 FAQPage findings were a false positive: the forensic audit's visible-FAQ detector (`scripts/audit-forensic/lib/parse.js`) only recognized `class="faq-item"`, not the equally-real `class="paa-item"` `<details>` pattern used by `reference/*-explained.html`, `guides/questions/*.html`, and 5 of the root chart pages. Fixed the detector to recognize both (`parse.js`, `schema-audit.js`). 8 DefinedTerm findings were a false positive: `schema-audit.js` required `DefinedTerm.name` to equal H1, but per schema.org's own design `DefinedTerm.name` is the canonical *term* ("Chlorine"), not the page's descriptive title ("Chlorine in Pools Explained") — removed DefinedTerm from that equality check. |
| **FIXED (content made genuinely visible)** | 5 | `calculators/pool-chlorine-calculator.html`, `maintenance/how-often-add-chlorine-pool.html`, and 3 orphaned root chart pages (`pool-chemical-levels-chart.html`, `pool-chlorine-levels-chart.html`, `pool-ph-levels-chart.html`) declared real FAQPage schema with zero matching visible content. These 5 have no generator (confirmed via `grep -rl` for `writeFileSync`), so per Step 20's documented exception they were hand-edited: added a visible `<details class="paa-item">` FAQ section using the exact question/answer text already present in the schema — no new claims invented, the content already existed, it just wasn't rendered. |
| **CORRECTED (generator bug fixed)** | 8 | BreadcrumbList "last item does not match H1" findings where the mismatch was a genuine double-escaping bug: `scripts/template-utils.js`'s `buildBreadcrumb()` ran the shared HTML-escaper (`esc()`, converts `&`→`&amp;`) on the JSON-LD `"name"` value too, so any label containing "&" rendered as literal `&amp;` text inside the JSON string instead of a plain `&`. Fixed by using `JSON.stringify()` for the JSON-LD value and keeping `esc()` only for the HTML-rendering path. Affected 6 generator-produced pages (auto-fixed on rebuild) plus 2 static files with the same hardcoded bug (`calculators/chemical-calculator.html`, `resources/index.html`, hand-corrected). |
| **RECLASSIFY → VALID** (legitimate short breadcrumb label) | 8 | `academy/index.html` ("Academy" vs H1 "Pool & Hot Tub Chemistry Academy"), `formulas/index.html`, `glossary/index.html`, `guides/chlorine/why-pool-wont-hold-chlorine.html`, `guides/ph/how-to-lower-pool-ph.html`, `pool-chemistry-system.html`, `reference/index.html`, `releases/index.html`. Standard breadcrumb UX: a short nav label for a hub/parent crumb vs. a full descriptive H1 is normal, not a defect — Google's breadcrumb guidance does not require exact equality. Fixed the detector's rule (`schema-audit.js`) to only flag a breadcrumb/H1 pair when *neither* string contains the other as a normalized substring, which correctly passes this pattern while still catching a genuinely wrong label. `releases/index.html` ("Releases" vs "Release History") doesn't pass the substring heuristic but is the same legitimate pattern — documented as an accepted limitation of the heuristic rather than force-matched. |
| **NOT_APPROPRIATE** (non-production page) | 2 | `charts/hot-tub-chemical-levels-chart.html`, `charts/pool-chemical-levels-chart.html` — stale, orphaned duplicates of the current root-level chart pages. `scripts/generate-authority-charts.js` was migrated to write to the site root in an earlier phase and no longer targets `charts/`; these 2 files are exactly the `REDIRECT_SOURCES` entries in `scripts/url-policy.js`, whose own comment states they "must never be production/indexable/sitemap-eligible again, regardless of whether the physical file still exists on disk." Left untouched — no new content was added to a page that policy already retires, and the file was not deleted since ~10 internal links across `comparisons/`, `printables/`, `maintenance/`, `reference/` still reference the old path and rely on the existing `_redirects` 301 (touching that is redirect-architecture work, explicitly out of scope for this phase). |

**Post-fix re-audit: 49 → 3 remaining QUESTIONABLE**, all three individually dispositioned above (2 NOT_APPROPRIATE, 1 accepted heuristic limitation) — none is an unresolved or silently-ignored finding.

## MISSING resolution (Step 5)

Baseline: **63 MISSING findings** (pages with zero JSON-LD).

| Classification | Count | Action |
|---|---:|---|
| SCHEMA_NOT_APPROPRIATE — internal tooling, noindex | 23 | `audit/google/*` (7), `reports/*` (13), `qa/*` (2), `tools/index.html` (1) — all `noindex, nofollow`, non-production per `url-policy.js` `INTERNAL_TOOLING_DIRS`. No schema added; adding structured data to pages that must never be indexed would be pointless. |
| SCHEMA_NOT_APPROPRIATE — noindex reference data | 16 | `reference/datasets/*` (16 pages) — all `noindex`. No schema added, for the same reason. |
| **SCHEMA_REQUIRED — implemented** | 24 | `editorial/*` (6), `methodology/*` (8), `provenance/index.html`, `revisions/index.html` — all indexable, all previously had zero JSON-LD. Added WebPage + BreadcrumbList via the shared `sitePage()` template in `scripts/generate-trust.js` (new `lib/schemaEngine.js` call). `releases/index.html`, `releases/1.0.0.html`, `releases/1.1.0.html` via `scripts/generate-release.js`; `releases/compatibility.html` via `scripts/generate-compatibility.js`. `printable/maintenance-checklist.html`, `printables/{airbnb-pool-turnover-checklist,hot-tub-maintenance-log,pool-maintenance-checklist}.html` — no generator exists for these 4 (confirmed), hand-edited per the Step 20 exception. |

**Post-fix re-audit: 63 → 0 unaddressed MISSING findings** — the 40 remaining rows in a fresh audit run are exactly the 39 correctly-non-applicable internal-tooling/noindex pages plus one harmless snapshot-directory artifact from this phase's own audit re-runs (excluded from the real count).

## WebApplication review (Step 9)

Reviewed every WebApplication schema. Found 11 of 13 real calculator pages had **no WebApplication schema at all** (only `calculators/pool-chlorine-calculator.html` had one). Added it to the other 11 (`chemical-calculator`, `hot-tub-chlorine`, `hot-tub-ph`, `hot-tub-shock`, `pool-alkalinity`, `pool-cyanuric-acid`, `pool-ph`, `pool-shock`, `pool-turnover-rate`, `pool-volume`, `saltwater-pool-salt`, `spa-volume`), using each page's own existing, already-published `<title>`/`og:description` text for `name`/`description` — no new claims, `applicationCategory: CalculatorApplication`, `offers: {price: 0, USD}`. None imply professional certification, scientific validation, or medical authority; the Phase 7F trust-panel confidence-level corrections remain the authoritative confidence signal and were not touched here.

## HowTo review (Step 8)

All 12 calculator pages had a HowTo schema describing "enter input → get result" (e.g. `["Enter pool volume in gallons", "Enter current and target chlorine (ppm)", "Get ounces of chlorine required"]`) — this is the brief's explicit "simple calculator result" **inappropriate** example: it describes using the page's own form fields, not a genuine chemistry procedure, and none of the 12 pages render these as a visible numbered/sequential steps section. Removed all 12 (no HowTo schema remains on any calculator page). No page in this pass had a genuine visible procedure that would newly qualify for HowTo schema, so none was added.

## FAQ policy (Step 7)

Confirmed the existing policy ("visible FAQ content → optional FAQPage schema, never the reverse") holds sitewide after the fixes above: `scripts/validate-schema-content-consistency.js`'s `FAQ_SCHEMA_NOT_VISIBLE` check (CRITICAL, fails the build) finds 0 violations. Native `<details>` content (`.faq-item` and `.paa-item`) both count as visible.

## Entity/schema identity (Step 19)

No duplicate Organization, no fake Person entities, no invented `sameAs` relationships. `validate-schema-content-consistency.js` explicitly checks for multiple distinct Organization names and any Person schema sitewide — 0 found. Organization/WebSite schema remains deliberately homepage-only, per the pre-existing policy comment in `components/global-schema.html`; `about/index.html` was confirmed NOT to need its own copy (would violate that policy), corrected in the Step-2 schema-inventory's expected-schema mapping rather than by adding schema.
