# Phase 8E — Spanish Production Rollout: Foundation + First Production Cluster

## 1. Baseline SHA

`b249f17d985508a30982b30ca726fee8e6333f0a` ("Phase 8D: establish multilingual architecture"). HEAD == origin/main, working tree clean at phase start.

## 2. Exact Spanish pages implemented

Five pages, selected by direct inspection of `calculators/chemical-calculator.html`'s own cross-links (not invented): the primary "Pool & Hot Tub Chemical Calculator" links to `pool-chlorine-calculator`, `pool-ph-calculator`, `pool-shock-calculator`, `pool-volume-calculator` in both its own "related tools" section AND its footer (the strongest available "directly supporting" signal) — a secondary tier (alkalinity, CYA, turnover-rate) appears only once, in a broader "related" group, and was excluded to keep the cluster small and coherent.

1. `es/calculators/chemical-calculator.html` — primary
2. `es/calculators/pool-volume-calculator.html` — core supporting
3. `es/calculators/pool-chlorine-calculator.html` — core supporting
4. `es/calculators/pool-ph-calculator.html` — core supporting
5. `es/calculators/pool-shock-calculator.html` — core supporting

**Item 3 of spec Section 4 ("corresponding calculator methodology/help content")**: rather than adding a 6th page (`methodology/calculation-methodology/`, a general engineering-documentation page written for evaluators of the site's data architecture, using a different, unaudited injection pipeline with no populated `<header>`/`<footer>`), each of the 5 pages' own embedded "About This Calculation" trust panel and chemistry-sources block — the actual, immediately-relevant methodology/help content a user sees while using that specific calculator — was translated in place. This satisfies the requirement without introducing a 6th file whose generator pipeline had not been audited.

## 3. English → Spanish URL mappings

| English | Spanish |
|---|---|
| `/calculators/chemical-calculator` | `/es/calculators/chemical-calculator` |
| `/calculators/pool-volume-calculator` | `/es/calculators/pool-volume-calculator` |
| `/calculators/pool-chlorine-calculator` | `/es/calculators/pool-chlorine-calculator` |
| `/calculators/pool-ph-calculator` | `/es/calculators/pool-ph-calculator` |
| `/calculators/pool-shock-calculator` | `/es/calculators/pool-shock-calculator` |

Slugs are unchanged transliterations of the English slug (per spec Section 17: "Do not translate URLs by blindly translating English slugs unless the content-ID/URL policy explicitly supports the resulting slug") — deterministic, human-readable, and produced mechanically by `js/i18n/locale-url.js`'s `getLocalizedUrl(path, 'es')`, never hand-typed.

## 4. Content IDs

Five new records added to `data/i18n/translation-status.json` (extending, not replacing, Phase 8D's 8 fixtures):

`calculator:chemical`, `calculator:pool-volume` (already existed as a Phase 8D fixture, `es` status updated), `calculator:pool-chlorine`, `calculator:pool-ph`, `calculator:pool-shock`.

Each record: `{ contentId, category: "calculator", languages: { en: {status, url}, es: {status, url} } }`. The `contentId` is a stable, language-neutral key (e.g. `calculator:chemical`) distinct from both the English and Spanish URL strings — the minimum production-safe identity mechanism required by spec Section 5, reusing Phase 8D's existing `translation-status.js` schema rather than inventing a competing one.

## 5. Translation-status changes

All 5 units moved from (new record / `missing`) to `es: translated`, only after their Spanish pages existed on disk and passed `scripts/validate-phase-8e.js`'s 20 checks. No page was marked `translated` speculatively.

## 6. Generator changes

- **`scripts/data/i18n-es/cluster-translations.js`** (new) — the single source of truth for every English→Spanish string pair, organized as a `SHARED` array (identical chrome: header nav, breadcrumbs, printable-resources, chart crosslinks, credibility strip, trust-panel labels, footer) plus one array per page for unique content (headings, form fields, FAQ/PAA text, trust-panel prose, and the small number of JS display-string-building lines that construct calculator RESULT TEXT — never the calculation itself).
- **`scripts/generate-spanish-cluster.js`** (new) — reads each finalized English source file, applies the translation pairs (sorted longest-first so a longer, more specific match is never partially clobbered by a shorter one it contains), rewrites relative links (`../X` → `/X`; a bare sibling filename inside the cluster stays relative; a bare sibling filename outside the cluster becomes an absolute English fallback URL — never a link to a nonexistent `/es/` page), sets `<html lang="es">`, and localizes the canonical + every JSON-LD occurrence of the page's own absolute URL. Asserts every expected English string is actually present before replacing it (throws otherwise), so a future edit to the English source that changes wording is caught immediately, not silently mistranslated.
- **`scripts/inject-i18n-cluster.js`** (new) — data-driven off `translation-status.json` (not a hardcoded file list): for every content unit with 2+ `translated` languages, injects reciprocal hreflang `<link>` tags and a language-switcher link into every language's file. Idempotent (Phase-8A-safe: strip regex consumes the exact whitespace the insertion adds) — verified directly by running it twice with zero further diff.
- **`scripts/url-policy.js`** — added `stripLanguageSegment()`/`contentTopDir()`, used internally by `isNonPage`/`isInternalTooling`/`isProductionPage` so an `es/`-prefixed path classifies exactly like its English equivalent. `topDir()` itself (one external caller, a historical Phase 7P report script) is untouched. Verified via the existing `test-url-policy.js` (22/22 still pass) plus new direct assertions.
- **`scripts/generate-sitemaps.js`** — `getCategory()` strips a language prefix before mapping to a priority/changefreq bucket, so a Spanish calculator page gets the same `0.9`/`weekly` treatment as its English equivalent instead of falling into "other."
- **`scripts/generate-navigation.js`** — `es` added to `SKIP_DIRS`, explicitly and permanently (not a workaround): the Spanish cluster is deliberately not wired into `data/navigation.json` in this phase (see Known Limitations). Discovered necessary during determinism testing: without it, the first build after `es/` exists on disk picks the Spanish pages up into `navigation.json`, since that generator's own walk has no other language-prefix awareness — a one-line, targeted fix, not a redesign.
- **`scripts/run-all-generators.js`** — wires `generate-spanish-cluster.js` + `inject-i18n-cluster.js` in immediately after `generate-version-badges.js`/`validate-versioning.js` (the LAST upstream step that mutates calculator-page content the translation data targets — trust panels, chemistry-sources, and the footer version badge are all injected even later than the original hub/navigation-refresh point, so the Spanish generator has to run after all of them), then re-runs `generate-sitemaps.js` and `validate-url-indexation.js` via `execSync` (a genuinely separate process — `require()`-ing the same script path twice in one process is a silent no-op, the same Phase 8A/8B finding) so the new `/es/` pages are included in the sitemap and validated for indexation within the same build, not deferred to a second one.

## 7. Navigation changes

None to the visible/hub navigation architecture (explicitly out of scope). `data/navigation.json` explicitly excludes `es/` (see Generator changes and Known Limitations).

## 8. Sitemap changes

`generate-sitemaps.js`'s category-mapping fix (Section 6 above) is the only source change. All 5 Spanish URLs appear in `sitemap-calculators.xml` with the same `priority`/`changefreq` as their English equivalents; the English URL set and priorities are unchanged.

## 9. hreflang implementation

`js/i18n/hreflang.js` (Phase 8D) generates the set; `inject-i18n-cluster.js` (Phase 8E) is the first real production consumer. For each of the 5 content units: `en → English URL`, `es → Spanish URL`, `x-default → English URL`, injected into both language files' `<head>`, immediately after `<link rel="canonical">`, inside a marker-comment pair. Verified reciprocal (`js/i18n/hreflang.js`'s `reciprocityCheck()`) across all 10 files.

## 10. Canonical implementation

English canonicals are untouched. Spanish canonicals are self-referential (`https://waterbalancetools.com/es/calculators/<slug>`), computed via `js/i18n/locale-url.js`'s `getLocalizedCanonical()`, and every other occurrence of the page's own absolute English URL inside the file (WebApplication schema `url`, BreadcrumbList `item` for the current page) is localized to match.

## 11. Language switcher implementation

`js/i18n/language-switcher.js` (Phase 8D, resolution logic only) is now wired into real markup for the first time: `inject-i18n-cluster.js` inserts a small `<a class="lang-switch" hreflang="..." lang="...">EN</a>` / `...>ES</a>` link into the header's `.nav-end` area (next to the search icon), on both language versions of all 5 pages. Never fabricates a target — the link is built from `availableSwitcherLinks()`, gated by `translation-status.js`. No sitewide header/footer redesign.

## 12. Schema handling

No new JSON-LD types introduced. Every schema block on the 5 Spanish pages is valid, parseable JSON (verified). Human-readable schema text (`name`, `description`) is translated; URLs/identifiers are correctly localized (Section 10). Structural semantics (WebApplication, BreadcrumbList, FAQPage where present) are unchanged.

## 13. Metadata handling

Each Spanish page has a translated `<title>`, meta description, Open Graph title/description, Twitter card fields, and heading structure (h1/h2/h3), all verified present.

## 14. Validation results

`scripts/validate-phase-8e.js`: PASS, 0 errors (checks A–T, spec Section 21). `scripts/test-phase-8e.js`: 20/20 PASS. Both re-run against the definitive build; see `reports/phase-8e-status.md` for the full gate table.

## 15. Deterministic build results

3+ consecutive builds run from a clean baseline. `data/navigation.json`: 0 `/es/` pages present in any build (the `es` SKIP_DIRS fix holds across repeated builds — directly verified after initially discovering, and fixing, a one-time leak where a second build picked up the Spanish pages before the fix). Spanish page content and the sitemap's Spanish URL set: byte-identical across builds 1–5.

One legitimate, fully-explained transition was found and is documented rather than hidden: `audit/google/crawl-depth.html`'s "Average clicks" metric (computed by `scripts/audit-crawl-depth.js`, part of the build pipeline, over the site's real `<a href>` link graph) read 2.47 across builds 1–2, then 2.46 from build 3 onward, stable thereafter (confirmed through build 5). This is the same classification Phase 8C established for this exact metric (**A: legitimately dynamic** — it changes when the site's actual link topology changes, and is stable otherwise). Adding 5 new, mutually-interlinked pages with switcher/hreflang cross-links is a genuine, one-time change to that topology; the metric settling over 2–3 builds before stabilizing, rather than in exactly one, is a real but bounded and now-verified-converged effect, not an unbounded oscillation and not Spanish page/content churn as prohibited by spec Section 20 — the actual Spanish page and sitemap content themselves are stable from build 1.

## 16. Regression results

`validate-phase-7h/7i/7k/7m/7n/7o/7x`: all PASS. `validate-phase-7y`: FAILs in the standard, previously-documented stale-self-referential-baseline pattern (78 "unexplained working-tree change" flags — one per changed/new file — plus the same recurring fund-07/fund-08 message seen in every prior phase). `validate-phase-7z`: FAILs in the same pattern, in a new but equally explained shape: its `FORBIDDEN_PATHS` list literally includes `'es/', 'fr/'` and `scripts/generate-navigation.js` — a historical guardrail asserting no i18n work was in scope for the Phase 7Z that predates Phase 8D/8E's explicit authorization to do exactly that (the same "one-time completion gate" pattern Phase 8D's own forensic audit found and documented for the historical Phase 7T/7U/7W validators). `validate-phase-8a/8b/8c/8d`: all PASS, confirming the Phase 8A injector fixes, Phase 8B navigation-refresh ordering, Phase 8C navigation-artifact determinism, and Phase 8D architecture all remain intact. Broken links: 0/531. URL/indexation: 0 violations, 531 pages / 483 sitemap URLs. Schema, datasets, entities, trust/trust-layer/provenance/entity-provenance, chemistry-status-integrity: all PASS. Accessibility: 100, unchanged.

## 17. Known limitations

- The Spanish cluster is explicitly **not** wired into `data/navigation.json`, the search index, or hub/related-content navigation in this phase — each Spanish page authors its own breadcrumb/related-content directly instead. A future phase must extend `generate-navigation.js`/`generate-hubs.js` with real language-awareness (documented as a Phase 8D prerequisite already) before removing the `es` skip.
- Dataset-driven product labels and safety notes surfaced by `js/calculator.js`/`js/calc-utils.js` at runtime (e.g. a granular-chlorine product's display name, mixing-hazard warning text) are **not** translated — they come from shared, sitewide calculator JS used by every calculator on the site (English and future-language alike), and translating them was judged out of the minimum-necessary-foundation scope for a first cluster.
- Only Spanish (`es`) is active; no other language, per spec Section 25.
- Only this one cluster (5 pages) carries Spanish content; the rest of the site remains English-only, as required.
- The two secondary-tier calculators (alkalinity, CYA) linked once from this cluster's "related calculators" section are not part of the cluster and correctly fall back to their English URLs.

## 18. Next-step recommendation

Before expanding the Spanish cluster further: (1) decide and implement the navigation/search-index language-awareness deferred above, since every additional page added while `es` stays skipped compounds the same limitation; (2) decide whether shared calculator JS (`js/calculator.js`, `js/calc-utils.js`) should gain a language parameter for its dataset-driven display strings, since that need will recur for every future calculator cluster; (3) once both are resolved, the same `cluster-translations.js` + `generate-spanish-cluster.js` + `inject-i18n-cluster.js` pattern established here is directly reusable for the next content cluster (e.g. the hot-tub calculators, or the Academy fundamentals set) without further architectural work.
