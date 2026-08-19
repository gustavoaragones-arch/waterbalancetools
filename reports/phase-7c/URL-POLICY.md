# Phase 7C — URL Policy

Centralized in `scripts/url-policy.js`. Every generator and validator that needs to decide whether a path is a real, indexable, sitemap-worthy production page goes through this module instead of re-implementing its own filesystem-walk-and-guess logic.

## Classification model

| Class | Meaning | Indexable | In sitemap |
|---|---|---|---|
| **A. Indexable canonical content** | Real reader-facing page, self-canonical, no noindex | Yes | Yes |
| **B. Noindex** | Legitimate content that shouldn't be indexed (e.g. `reference/datasets/*`, `search/`) | No | No |
| **C. Redirect source** | Retired duplicate/legacy URL, 301s to its replacement | No | No |
| **D. Non-production / internal tooling** | `reports/`, `audit/`, `qa/`, `tools/` — dashboards and internal artifacts | No | No |
| **E. Non-page** | Template sources, partials, components — not real pages at all | N/A | N/A |

Classification **fails closed**: a directory not explicitly on the production-content or internal-tooling allowlist is never treated as production, regardless of what `.html` files it contains. A new dashboard added tomorrow in an unlisted directory does not become sitemap-eligible just by existing.

## Directory boundaries

**Production content** (`PRODUCTION_CONTENT_DIRS`): `calculators`, `programmatic`, `guides`, `charts`, `academy`, `formulas`, `glossary`, `entities`, `reference`, `comparisons`, `resources`, `legal`, `about`, `methodology`, `editorial`, `maintenance`, `printable`, `printables`, `releases`, `revisions`, `provenance`, plus an explicit allowlist of root-level files (`index.html`, `all-pages.html`, and the 9 root-level chart pages).

**Internal tooling** (`INTERNAL_TOOLING_DIRS`): `reports`, `audit`, `qa`, `tools`, `search`.

**Non-page** (`NON_PAGE_DIRS`): `templates`, `partials`, `components`, `scripts`, `data`, `js`, `public`, `lib`, `functions`, `docs`, plus VCS/tooling dirs.

## API

- `isProductionPage(relPath)` — path-only decision, ignores current robots/canonical state.
- `isIndexablePage(relPath, html?)` — production + not noindex + not a redirect source.
- `isSitemapEligible(relPath, html?)` — indexable + has a canonical + canonical **equals** the page's own expected URL (self-canonical only; a page whose canonical points elsewhere never enters the sitemap under its own URL).
- `isInternalTooling(relPath)`, `isNonPage(relPath)` — path-only.
- `isRedirectSource(relPath)` / `isLegacyUrl(relPath)` (same registry) — is this path a registered retired URL?
- `redirectTarget(relPath)` — the destination for a redirect source.

## Redirect-source registry

`REDIRECT_SOURCES` is the single source of truth for every retired duplicate/legacy URL created in Phase 7C:

```js
{
  'calculators/volume-calculator.html': '/calculators/pool-volume-calculator',
  'charts/hot-tub-chemical-levels-chart.html': '/hot-tub-chemical-levels-chart',
  'charts/pool-chemical-levels-chart.html': '/pool-chemical-levels-chart',
}
```

`scripts/redirect-rules.js` (which feeds both `_redirects` and `functions/_middleware.js`) reads this registry directly, so a new retired URL only needs to be added in one place to get redirect rules, sitemap exclusion, hub-listing exclusion, and search-index exclusion all at once.

## Consumers

- `scripts/generate-sitemaps.js` — sitemap eligibility (Step 5).
- `scripts/generate-navigation.js`, `scripts/generate-hubs.js`, `scripts/generate-all-pages.js`, `scripts/generate-search-index.js` — exclude redirect sources from listings/indexes so a retired page cannot be regenerated as if it were still live (Step 6/9).
- `scripts/inject-seo-metadata.js` — decides the robots directive per page (`index, follow` / `noindex, follow` for redirect sources / `noindex, nofollow` for internal tooling) instead of hardcoding `index, follow` for everything it touches.
- `scripts/validate-url-indexation.js` — the build-time gate (Step 10).
