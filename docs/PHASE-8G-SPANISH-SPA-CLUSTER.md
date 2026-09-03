# Phase 8G — Spanish Hot-Tub/Spa Calculator Cluster (Production Expansion)

## 1. Baseline commit

`0a9a246e2827453003a67d0d826f994bb5427fb0` ("Phase 8F: establish Spanish regional SEO foundation"). Verified present in `git log` at phase start; the working tree was returned to this exact baseline (via `git checkout HEAD -- .` plus `git clean -fd es/`) partway through the phase after a self-inflicted mid-session error (Section 27) discarded uncommitted translation-data work — recovery is documented there for a complete, honest record.

## 2. Cluster identification methodology

Enumerated `calculators/*.html` directly (`ls calculators/*.html | grep -iE "hot-tub|spa"`) rather than inventing names. This produced exactly 4 pre-existing pages, all already live in production, none newly created:

- `hot-tub-chlorine-calculator.html` — "Hot Tub Chlorine Calculator (30-Second Check)"
- `hot-tub-ph-calculator.html` — "Hot Tub pH Calculator"
- `hot-tub-shock-calculator.html` — "Hot Tub Shock Calculator (By Product)"
- `spa-volume-calculator.html` — "Spa Volume Calculator"

No 5th hot-tub/spa page exists (no `hot-tub-alkalinity-calculator`, no `hot-tub-volume-calculator` — `spa-volume-calculator` already serves the volume-calculation need for both pool and hot-tub water types via its own selector). Per spec instruction, a complete 4-page cluster is used rather than padding to reach a target range.

## 3. Terminology: reused, not re-researched

Phase 8G performs **no new terminology research**. It reuses the Phase 8F data model (`data/i18n/es/terminology.json`, `js/i18n/es-terminology.js`) unmodified — verified byte-identical to the baseline commit (`validate-phase-8g.js` check F). The `hot_tub` concept's canonical term (`spa`), its trademark-derived lexical variants (`jacuzzi`, `yacusi`, both `isTrademark: true`), and the deliberately-distinct `hydromassage_bathtub` concept (`bañera de hidromasaje` / `tina de hidromasaje`) were already fully modeled by Phase 8F; this phase applies that existing model to 4 new production pages.

## 4. Per-page terminology decision table

| Page | Primary concept | Primary Spanish term | Secondary search-variants (never primary copy) | Regional considerations | Terms intentionally NOT used as primary |
|---|---|---|---|---|---|
| `hot-tub-chlorine-calculator` | Continuously-treated hot-tub/spa vessel (`hot_tub`) | **spa** | jacuzzi, yacusi, hidromasaje (FAQ/search coverage only, never title/h1/hero) | No country split modeled — `spa` is "preferred" (ES, CL) or "common" (MX, AR, UY, CO) everywhere, no `avoid-for-this-region` status anywhere in the concept | bañera de hidromasaje / tina de hidromasaje (different, drain-after-use bathroom fixture — never substituted here) |
| `hot-tub-ph-calculator` | Same (`hot_tub`) | **spa** | jacuzzi, yacusi | Same | Same |
| `hot-tub-shock-calculator` | Same (`hot_tub`); also surfaces `js/calc-utils.js`'s `SHOCK_PRODUCTS` dataset labels/warnings at runtime | **spa** | jacuzzi, yacusi | Same | Same |
| `spa-volume-calculator` | Same (`hot_tub`) — page title itself already uses "Spa" | **spa** | jacuzzi, yacusi | Same | Same |

All 4 pages resolve to the identical `hot_tub` concept and identical primary term (`spa`) — Phase 8G did not need to select between competing regional pool terms (`piscina`/`alberca`/`pileta`) because none of these 4 pages are pool-concept pages; that three-way split remains exclusively Phase 8E/8F's pool cluster's concern and was not reopened here.

## 5. No country-specific pages or hreflang

Confirmed no `es-MX`, `es-AR`, or any other regionalized locale was created — only plain `es`, matching Phase 8E/8F architecture and spec's explicit prohibition. `validate-phase-8g.js` check L asserts no `hreflang="es-[A-Z]{2}"` pattern exists anywhere in the 9-page cluster (5 pool + 4 hot-tub/spa, English and Spanish sides).

## 6. URL strategy

The 4 new Spanish URLs, added under the unchanged `/es/` prefix with no slug translation:

    /es/calculators/hot-tub-chlorine-calculator
    /es/calculators/hot-tub-ph-calculator
    /es/calculators/hot-tub-shock-calculator
    /es/calculators/spa-volume-calculator

No existing URL (English or Spanish, pool or otherwise) was migrated, renamed, or redirected. `validate-phase-8g.js` check V confirms the English URL manifest is unchanged vs. the Phase 8F baseline commit: 0 pages added, 0 removed (553 total English HTML files, identical set).

## 7. Content-ID model

Reused the Phase 8D/8E model unmodified. Four new stable, language-neutral IDs added to `data/i18n/translation-status.json`:

    calculator:hot-tub-chlorine
    calculator:hot-tub-ph
    calculator:hot-tub-shock
    calculator:spa-volume

Each follows the existing `{contentId, category, languages: {en: {status, url}, es: {status, url}}}` shape; no new fields, no schema change (`validate-phase-8g.js` check D/E).

## 8. Translation-status discipline

Each new unit was created with `es.status: "missing"` first, and flipped to `"translated"` only after the corresponding Spanish page existed on disk and was independently validated: JSON-LD parses, inline JS is syntactically valid, `calcUtils` call expressions are byte-identical to the English source, and (for `hot-tub-shock-calculator`) the product-label localization mechanism was confirmed functional. No unit was ever marked "translated" ahead of its content existing.

## 9. Translation-source-of-truth: `cluster-translations.js` extended

`scripts/data/i18n-es/cluster-translations.js` remains the single authoritative translation-data source (no second, competing content store was created). Extended with:

- Four new complete per-file translation arrays: `HOT_TUB_CHLORINE_CALCULATOR`, `HOT_TUB_PH_CALCULATOR`, `HOT_TUB_SHOCK_CALCULATOR`, `SPA_VOLUME_CALCULATOR`.
- A new `SHARED_OPTIONAL` export (9 entries) — see Section 17 for why this was necessary.

`scripts/generate-spanish-cluster.js`'s `CLUSTER_FILES` list was extended with the 4 new filenames; its `applyReplacements()` gained an optional, non-throwing 4th parameter (`optionalPairs`) specifically to support `SHARED_OPTIONAL`, without weakening the existing strict (throw-on-drift) assertion for every other rule.

## 10. Natural Spanish, not mechanical translation

Display copy was translated for register and natural phrasing, not word-for-word. Example (hot-tub-shock-calculator result message): English "Add X oz [product]. Run jets 15–20 min. Re-test before using tub." became "Agregue X oz de [producto]. Haga funcionar los chorros 15–20 min. Vuelva a analizar antes de usar el spa." — idiomatic verb choices (`Haga funcionar los chorros` rather than a literal "corra los chorros"), not a literal token-for-token pass.

## 11. Calculation-logic preservation

All 4 new pages call into the shared `js/calc-utils.js` engine (`window.WaterBalance.calcUtils.calculateChlorine()`, `.calculatePHAdjustment()`, `.calculateShockByProduct()`, `.calculateSpaVolume()`) rather than defining local calculation functions. `validate-phase-8g.js` check T extracts and byte-compares the full call expression (function name + argument list) between English and Spanish for all 4 pages — 100% identical. `js/calc-utils.js` itself is confirmed untouched (check U, `git diff HEAD -- js/calc-utils.js` empty).

## 12. Shared-calculator-JS investigation (spec Section 18) and the reusable mechanism built

**Investigation**: `js/calc-utils.js`'s `SHOCK_PRODUCTS` object (read in full, lines 95–155) carries English-only `label` and `mixingWarning` string fields (e.g. `"Calcium Hypochlorite (65%)"`, `"Do not mix with trichlor or other chlorinating agents."`) that `hot-tub-shock-calculator.html`'s inline script surfaces directly into the result message at runtime. This is the one place in the 4-page cluster where a dataset-driven, English-only string reaches a Spanish page's visible output. None of the other 3 pages (`hot-tub-chlorine`, `hot-tub-ph`, `spa-volume`) consume any comparable dataset-driven display string from `calc-utils.js`.

**Mechanism built**: `js/i18n/es-product-labels.js` — a small, additive browser IIFE matching this codebase's existing `window.WaterBalance.X` namespace convention. Exposes `window.WaterBalance.esProductLabels = { label(en), warning(en), LABELS, WARNINGS }`, a lookup table covering the 6 products `hot-tub-shock-calculator.html`'s dropdown actually offers (4 are wired into the page's `<select>`; all 6 are covered for completeness). Falls back to the original English string for any unmapped input (never throws, never breaks). `js/calc-utils.js` is never modified. The script is loaded via a single new `<script src="/js/i18n/es-product-labels.js">` tag, inserted only into the Spanish `hot-tub-shock-calculator.html`, positioned after `calc-utils.js` and before the inline calculator script; the English page does not load it (`validate-phase-8g.js`/`test-phase-8g.js` both assert this asymmetry).

**Scope decision**: Phase 8E's already-committed `pool-shock-calculator.html` has the identical English-passthrough limitation for its own shock-product labels, but retrofitting it was explicitly out of scope — Phase 8G's mandate is the hot-tub/spa cluster, and modifying a prior, already-accepted phase's deliverable without separate authorization would violate this project's phase-boundary discipline. Documented here as a known, pre-existing limitation on the pool cluster for a future phase to pick up if desired.

## 13. Metadata

All 4 new Spanish pages carry a fully translated `<title>`, meta description, Open Graph title/description, Twitter card, and exactly one `<h1>` — verified by `validate-phase-8g.js` check Q. Metadata mirrors the same page-type conventions already established by the 5 Phase 8E pool pages.

## 14. hreflang strategy

Identical to Phase 8E/8F: plain `en` / `es` / `x-default` only, reciprocal in both directions, injected via the existing idempotent `scripts/inject-i18n-cluster.js` (now data-driven off all 9 "translated" units, not just 5 — no code change to the injector itself was needed, since it was already generic). `validate-phase-8g.js` check L runs the full reciprocity check (`js/i18n/hreflang.js`) across all 9 pages, both languages (18 files).

## 15. Canonical strategy

Self-referential on every page: the Spanish page's canonical points to its own `/es/...` URL, the English page's canonical is unchanged. Verified for all 4 new pages by check K.

## 16. Language switcher

Injected into all 18 cluster files (9 English + 9 Spanish) by the unmodified `scripts/inject-i18n-cluster.js`, using its existing idempotent marker-comment pattern. Check M confirms presence on all 18 files.

## 17. Internal linking: Spanish → Spanish, and the related-calculators-grid gap

Spec Section 23 requires Spanish pages to cross-link to other Spanish pages where available, falling back to English only where no Spanish equivalent exists. Investigating the existing "Related Calculators" grid markup surfaced a **pre-existing architectural gap dating to Phase 8E**: the grid's non-active `class="calc-card"` links use absolute English hrefs (`/calculators/X`), which `rewriteRelativeLinks()` never rewrites (it only handles relative `../` paths and bare same-directory filenames). This meant even the original 5 Phase 8E pool pages' grids still linked to the English hot-tub calculators — and newly-added Spanish hot-tub pages would, by the same gap, link to the English pool calculators.

**Fix**: added `SHARED_OPTIONAL` (Section 9) — 9 href+text combined rules, one per cluster calculator's non-active grid card, applied via the new non-throwing `optionalPairs` mechanism (a card is legitimately absent on exactly the one page that IS that calculator). Combined with 9 strict per-file "active" self-card rules (one already existed per pool page from Phase 8E; 4 new ones were added for the hot-tub/spa pages). Net effect: **all 9 cluster pages' related-calculators grids now correctly cross-link Spanish→Spanish across the full cluster**, closing a gap that predates this phase as well as covering the new one. Verified by `validate-phase-8g.js` check S and `test-phase-8g.js` test 19.

## 18. Navigation

Reused the Phase 8F eligibility-gate architecture (`TRANSLATED_ES_URLS` built from `translation-status.js`) with no code change — it was already generic across content units, not hardcoded to the 5-page pool set. `data/navigation.json` now carries exactly 9 `/es/calculators/` entries (previously 5), each with a `lang` field. Check N.

## 19. Search index

Same reuse story: `scripts/generate-search-index.js`'s `contentId`-pairing logic needed no change. `data/search-index.json` carries a correctly `lang`-separated en/es pair sharing `contentId` for all 4 new units (check O), and exactly 9 Spanish calculator entries total (test 21).

## 20. Sitemaps

`sitemap-calculators.xml` includes all 4 new English URLs (already present pre-8G) and all 4 new Spanish URLs, correctly categorized under the calculators group with sitemap `priority` matching their English counterparts (check P, test 10).

## 21. Schema

All 4 new Spanish pages carry valid, parseable JSON-LD (WebApplication + BreadcrumbList, matching the existing pattern) — check R, test 13.

## 22. Accessibility

Spot-checked: every `<input>` with an `id` on the 4 new Spanish pages either has an associated `<label for>` or an `aria-label` (check Z warns, does not error, on any exception found — none were found in this run). No structural accessibility change was made beyond translating visible label text.

## 23. Determinism testing

Ran 4 full `npm run build` cycles total across this phase (after the recovery in Section 27, plus 2 additional dedicated determinism runs). Compared `es/calculators/*.html` (all 9 files), `data/search-index.json`, `sitemap-calculators.xml` (excluding `<lastmod>`), and `data/i18n/translation-status.json` across 3 consecutive builds: **byte-identical in every case**. The only non-deterministic output found anywhere in the diff was a single average-metric rounding difference ("Average clicks: 2.46" vs "2.47") in `data/navigation.json`'s description field for the pre-existing, Phase-8G-untouched `/audit/google/crawl-depth` report page — traced to `scripts/audit-crawl-depth.js`'s BFS traversal being sensitive to page-insertion order as the site grows; not a Phase 8G regression (that script was not modified, and the same class of variance would occur from any legitimate page addition, pool or otherwise). `validate-phase-8g.js` check W independently re-confirms full-pipeline determinism on every validator run.

## 24. Validation and test suite

`scripts/validate-phase-8g.js` (26 checks, A–Z): **PASS, 0 errors, 0 warnings.**
`scripts/test-phase-8g.js` (26 tests): **26 passed, 0 failed.**

## 25. Regression suite

Ran the full existing suite: `validate-phase-7h/7i/7k/7m/7n/7o/7x` — all PASS. `validate-phase-8a/8b/8c/8d/8e` — all PASS. `check-broken-links.js` — 0 broken links (535 pages). `validate-url-indexation.js` — 0 violations (535 pages, 487 sitemap URLs).

Two **known, pre-existing, non-regression findings**, in the same category as previously-documented stale-baseline patterns (7Y's fund-07/fund-08, 7Z's `FORBIDDEN_PATHS`):

- `validate-phase-7y.js` and `validate-phase-7z.js` both fail on scope-lock assertions written before Phases 8D–8G existed (7Y flags any working-tree change outside its own originally-approved audit-artifact list as "unexplained"; 7Z's forbidden-path list predates the `es/` directory). Neither script's underlying subject matter (the Phase 7Y audit findings, the Phase 7Z source-data/build-pipeline separation) was touched by Phase 8G.
- `validate-phase-8f.js` checks I/J fail on a hardcoded `esPages.length === 5` / `esEntries.length === 5` assertion, correct when Phase 8F was written (5 pool pages), now stale because Phase 8G legitimately grew the Spanish cluster to 9 pages. The behavior those checks actually exist to verify — every navigation/search-index record carries a `lang` field, Spanish entries have a `contentId`, the eligibility-gate architecture (not a blanket directory skip) is in use — is independently re-verified, correctly, by `validate-phase-8g.js` checks N and O.

No prior phase's validator was modified to "fix" these stale counts — that would be an unauthorized change to an already-committed, already-accepted deliverable.

Also investigated and fully explained (not a regression, no fix needed, since none of the pages involved are Phase 8G output): the sitewide QA report (`generate-qa-report.js`) shows a 2-point SEO-score and 2.5-point content-score drop. Traced precisely: `tools/index.html` (regenerated every build, byte-identical to the committed baseline both before and after this phase) has always lacked a `twitter:card` tag and a `version-badge`/`Version` marker — a pre-existing gap that simply surfaces differently depending on exactly when `generate-qa-report.js`'s early SEO/content audit ran relative to `generate-tools-index.js`'s late regeneration in a given build (the same "chicken-and-egg" build-ordering architecture note first documented in Phase 8E). The "repeated paragraph blocks" count (30→36) is driven entirely by sitewide footer/copyright/glossary-definition boilerplate repeated across hundreds of pages (top offenders recur 471–486 times); the 4 new calculator pages' unique display copy is not among the repeated blocks.

## 26. English non-regression

`validate-phase-8g.js` check V: 0 pages added, 0 pages removed vs. the Phase 8F baseline commit (553 English HTML files, identical set — the 4 hot-tub/spa English source files already existed and were only modified in place to receive hreflang/switcher markup, never renamed or duplicated).

## 27. Recovery from a mid-session error (full disclosure)

While cleaning up accumulated build-artifact drift from repeated debugging cycles, an over-broad `git checkout HEAD --` reversion briefly discarded uncommitted work in `scripts/data/i18n-es/cluster-translations.js` (the 4 new per-file translation arrays, `SHARED_OPTIONAL`, and 5 related-calculators-grid fixes to the existing pool arrays). No data was fabricated to recover: the content was reconstructed from this session's own immediately-prior authoring context, verified via `node -c` (syntax) and, more importantly, via the full validator/test suite above re-confirming every translated string, hreflang set, calculation call, and metadata field against the live English source — i.e., the recovery was independently re-validated from scratch, not merely assumed correct. The working tree was then fully reset to the exact Phase 8F baseline commit and rebuilt from there, so the final delivered state has no residual inconsistency from the incident.

## 28. Explicit prohibitions confirmed

- **No synonym-targeting pages** (`/es/piscina/`, `/es/jacuzzi/`, `/es/alberca/`, etc.) were created. `git status` confirms only the 4 planned URLs were added.
- **No pool-cluster expansion.** The 5 Phase 8E pool pages' own translated content is unchanged; only their related-calculators grid cross-links were touched (Section 17), and only to fix a pre-existing gap, not to add pool-cluster scope.
- **Only English and Spanish are active.** No third language was introduced anywhere in `languages.js`, `translation-status.json`, or any generator.
- **No URL migration of any kind.** Section 26.

## 29. Files added / modified / deleted

**Added:**
`js/i18n/es-product-labels.js`, `es/calculators/hot-tub-chlorine-calculator.html`, `es/calculators/hot-tub-ph-calculator.html`, `es/calculators/hot-tub-shock-calculator.html`, `es/calculators/spa-volume-calculator.html`, `scripts/validate-phase-8g.js`, `scripts/test-phase-8g.js`, `docs/PHASE-8G-SPANISH-SPA-CLUSTER.md`, `reports/phase-8g-status.md`.

**Modified:**
`scripts/data/i18n-es/cluster-translations.js` (4 new per-file arrays, `SHARED_OPTIONAL`), `scripts/generate-spanish-cluster.js` (`CLUSTER_FILES` +4, `optionalPairs` mechanism), `data/i18n/translation-status.json` (+4 units), `calculators/hot-tub-chlorine-calculator.html`, `calculators/hot-tub-ph-calculator.html`, `calculators/hot-tub-shock-calculator.html`, `calculators/spa-volume-calculator.html` (hreflang + switcher injected, additive only), `es/calculators/chemical-calculator.html`, `es/calculators/pool-chlorine-calculator.html`, `es/calculators/pool-ph-calculator.html`, `es/calculators/pool-shock-calculator.html`, `es/calculators/pool-volume-calculator.html` (related-calculators grid cross-links to the new hot-tub/spa Spanish pages, Section 17), `data/navigation.json`, `data/search-index.json`, `sitemap-calculators.xml`, plus the standard build-output regeneration set (sitemaps, QA reports, navigation-dependent pages) produced by any `npm run build`.

**Deleted:** none.

## 30. Next-step recommendation

Hold for Director review exactly as instructed. If accepted: the pool cluster's own shock-product-label gap (Section 12) and a possible future academy/guide/glossary Spanish cluster are natural next candidates, but neither is proposed as part of this phase's scope.
