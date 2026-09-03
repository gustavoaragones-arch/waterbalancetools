# Phase 8G — Status Report

## Baseline

- Phase 8F commit: `0a9a246e2827453003a67d0d826f994bb5427fb0` ("Phase 8F: establish Spanish regional SEO foundation")
- HEAD at phase start: `0a9a246e2827453003a67d0d826f994bb5427fb0`
- origin/main: `0a9a246e2827453003a67d0d826f994bb5427fb0` (matches HEAD)
- Working-tree state at phase start: clean
- Node version: v24.13.0

## Cluster

4 real, pre-existing hot-tub/spa calculator pages identified by direct directory enumeration (no invented names): `hot-tub-chlorine-calculator`, `hot-tub-ph-calculator`, `hot-tub-shock-calculator`, `spa-volume-calculator`. Complete cluster (fewer than 5, per spec's "use the complete set" instruction) — no 5th hot-tub/spa page exists.

## Terminology

No new research — reused Phase 8F's `data/i18n/es/terminology.json`/`js/i18n/es-terminology.js` unmodified (verified byte-identical to baseline). All 4 pages resolve to the `hot_tub` concept, canonical term **spa**; `jacuzzi`/`yacusi` modeled as trademark-derived search-variants only, never primary copy; `bañera de hidromasaje`/`tina de hidromasaje` (distinct product) never substituted for the hot-tub/spa concept. Full per-page decision table: `docs/PHASE-8G-SPANISH-SPA-CLUSTER.md` Section 4.

## Architecture

- **Content-ID model**: reused Phase 8D/8E's shape exactly; 4 new IDs (`calculator:hot-tub-chlorine`, `calculator:hot-tub-ph`, `calculator:hot-tub-shock`, `calculator:spa-volume`) added to `translation-status.json` only after their Spanish pages were validated.
- **Translation source of truth**: `scripts/data/i18n-es/cluster-translations.js` extended (4 new per-file arrays + a new `SHARED_OPTIONAL` export); `scripts/generate-spanish-cluster.js`'s `CLUSTER_FILES` extended to 9, with a new non-throwing `optionalPairs` mechanism in `applyReplacements()`.
- **Shared-calculator-JS localization** (spec Section 18): `js/i18n/es-product-labels.js`, a new, additive, Spanish-only lookup for `js/calc-utils.js`'s English-only `SHOCK_PRODUCTS` `label`/`mixingWarning` strings. `calc-utils.js` itself is untouched. Loaded only on `es/calculators/hot-tub-shock-calculator.html`.
- **Internal-linking fix**: discovered and fixed a pre-existing (Phase 8E-era) gap where the related-calculators grid's non-active cards used absolute English hrefs untouched by link-rewriting — now all 9 cluster pages cross-link Spanish→Spanish.
- **Navigation/search-index/sitemaps**: no code changes needed — Phase 8F's eligibility-gate architecture and content-ID pairing were already generic across content units, not hardcoded to 5 pages.

## Validation

| Gate | Result |
|---|---|
| Phase 8G validator (`validate-phase-8g.js`, checks A–Z) | PASS — 0 errors, 0 warnings |
| Phase 8G tests (`test-phase-8g.js`) | PASS — 26/26 |
| Cluster membership (no invented pages) | PASS |
| Content-ID integrity | PASS |
| Translation-status discipline (validate-before-flip) | PASS |
| Terminology data untouched | PASS |
| "spa" canonical in title/h1, all 4 pages | PASS |
| jacuzzi/yacusi never primary | PASS |
| hydromassage-bathtub distinction preserved | PASS |
| html lang="es" | PASS — 4/4 |
| Self-referential canonical | PASS — 4/4 |
| hreflang reciprocity, plain es/en/x-default only | PASS — 9-page cluster, 18 files |
| Language switcher | PASS — 18/18 files |
| Navigation language separation (real gate) | PASS |
| Search-index language separation + contentId | PASS |
| Sitemap inclusion, correctly categorized | PASS |
| Metadata completeness | PASS — 4/4 |
| Schema (JSON-LD) validity | PASS — 4/4 |
| Internal linking Spanish→Spanish | PASS — 9/9 cluster pages |
| Calculation-logic preservation (calcUtils call sites) | PASS — byte-identical, 4/4 |
| Shared-JS product-label mechanism | PASS — functional, English fallback safe |
| English non-regression | PASS — 0 added, 0 removed |
| Deterministic full-pipeline regeneration | PASS — byte-identical, 9/9 Spanish pages |
| No `/es/es/` | PASS |
| No untranslated-page leakage | PASS |
| Accessibility spot-check | PASS (no violations found) |
| Phase 8A–8E regression | PASS |

## Regression

`validate-phase-7h/7i/7k/7m/7n/7o/7x`: PASS. `validate-phase-7y`/`7z`: FAIL, the same known historical stale-baseline-assertion pattern documented in every prior 8-series report (7Y flags any later phase's legitimate changes as "unexplained"; 7Z's forbidden-path list predates `es/`) — neither script's actual subject matter was touched. `validate-phase-8a/8b/8c/8d/8e`: all PASS. `validate-phase-8f.js` checks I/J: FAIL on a hardcoded `=== 5` Spanish-page-count assertion, stale now that this phase legitimately grew the cluster to 9 — the actual behavior those checks exist to verify is independently re-confirmed by `validate-phase-8g.js` checks N/O. Broken links: 0/535. URL/indexation: 0 violations (535 pages, 487 sitemap URLs).

Sitewide QA report shows a small SEO/content score dip (98→96, 95→92.5), fully traced and explained (not a Phase 8G regression): driven entirely by `tools/index.html` (byte-identical to the committed baseline, unrelated pre-existing gap resurfacing under the pipeline's early/late audit-ordering quirk) and by sitewide footer/glossary boilerplate crossing an arbitrary repeated-paragraph threshold as the site grows. Full account: `docs/PHASE-8G-SPANISH-SPA-CLUSTER.md` Section 25.

## Determinism

4 full `npm run build` cycles run this phase. `es/calculators/*.html` (all 9 files), `data/search-index.json`, `sitemap-calculators.xml` (excl. `<lastmod>`), and `translation-status.json`: byte-identical across 3 consecutive builds. One unrelated, pre-existing, non-Phase-8G rounding artifact found and explained (Section 23 of the doc) in an audit report page's descriptive text — not calculator content.

## English non-regression

Before/after English production-URL manifest vs. the Phase 8F baseline commit: 553 URLs, **0 removed, 0 added**. The 4 hot-tub/spa English source files were modified in place only (hreflang + language-switcher markup, additive), never renamed, duplicated, or migrated.

## Critical failures

None.

## Non-critical findings

1. `validate-phase-7y.js`/`validate-phase-7z.js`/`validate-phase-8f.js` (checks I/J) fail on stale hardcoded assertions predating this phase — known pattern, not a regression, not fixed (would require unauthorized modification of a prior accepted phase's validator).
2. Sitewide QA seo/content score dip, fully traced to pre-existing, Phase-8G-unrelated conditions (`tools/index.html`, sitewide boilerplate) — see above.
3. Pool cluster's own `pool-shock-calculator.html` has the identical English-passthrough shock-label limitation Phase 8G fixed for the hot-tub cluster; left untouched as out-of-scope (would modify an already-accepted Phase 8E deliverable).

## Files added / modified / deleted

See `docs/PHASE-8G-SPANISH-SPA-CLUSTER.md` Section 29 for the complete list.

## Final decision

**PASS.**

Four real, pre-existing hot-tub/spa calculator pages now have production Spanish translations, reusing Phase 8D–8F's architecture without modification to any of it. "spa" confirmed and enforced as the canonical term; jacuzzi/yacusi correctly modeled as search-only variants; the distinct hydromassage-bathtub concept never conflated with hot-tub/spa. A genuine pre-existing internal-linking gap (English cross-links in the related-calculators grid) was found and fixed across the full 9-page cluster, not just the 4 new pages. Calculation logic is provably byte-identical to English on every new page. Full pipeline determinism confirmed across 3 consecutive builds. English non-regression confirmed: 0 URLs added or removed. No synonym pages, no pool-cluster expansion, no additional languages, no URL migration.

---

Per instruction: **do not commit or push. STOP.** Awaiting Director Assessment.
