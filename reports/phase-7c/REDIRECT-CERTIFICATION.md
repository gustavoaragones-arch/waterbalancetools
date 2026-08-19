# Phase 7C — Redirect Certification

## Redirects created

| Source | Destination | Code |
|---|---|---|
| `/calculators/volume-calculator` (+ `.html`) | `/calculators/pool-volume-calculator` | 301 |
| `/charts/hot-tub-chemical-levels-chart` (+ `.html`) | `/hot-tub-chemical-levels-chart` | 301 |
| `/charts/pool-chemical-levels-chart` (+ `.html`) | `/pool-chemical-levels-chart` | 301 |

Generated from a single source of truth (`scripts/url-policy.js` `REDIRECT_SOURCES`) into both `_redirects` (Cloudflare Pages' native redirect file) and `functions/_middleware.js` (an Edge Function that enforces the same map as defense-in-depth, ahead of static asset serving). Existing pre-Phase-7C redirect rules (`programmatic/*` legacy chlorine slugs, `explanations/*` typo redirects) were preserved unchanged.

## Verification performed

For each new redirect:
- **Source is not in sitemap.** Confirmed by `validate-url-indexation.js` (`SITEMAP_URL_IS_REDIRECT` would fire otherwise) and by direct sitemap grep.
- **Source has no conflicting canonical page.** The retired page's own `<link rel="canonical">` was updated to point at the destination (defense-in-depth), not left self-referencing.
- **Destination exists and is indexable/canonical.** All three destinations (`/calculators/pool-volume-calculator`, `/hot-tub-chemical-levels-chart`, `/pool-chemical-levels-chart`) are real, `index, follow`, self-canonical, sitemap-included pages.
- **No redirect loop.** Each source maps to exactly one destination; the destination is never itself a redirect source.
- **No redirect chain.** Every source routes directly to the final canonical URL in one hop (no A→B→C chains).

## Live (local) certification

Deployment was not authorized for this phase, so "live" verification was performed by serving the regenerated repository through a local static server that also honors `_redirects` (the same mechanism Cloudflare Pages uses), rather than relying on static file inspection alone.

| URL | Result |
|---|---|
| `/calculators/pool-volume-calculator` | `200`, `index, follow`, self-canonical |
| `/calculators/volume-calculator` | `301` → `/calculators/pool-volume-calculator` |
| `/charts/pool-chemical-levels-chart` | `301` → `/pool-chemical-levels-chart` |
| `/pool-chemical-levels-chart` | `200`, `index, follow`, self-canonical, in sitemap |
| `/reports/seo` | `200`, `noindex, nofollow`, not in sitemap |
| `/qa/index` | `200`, `noindex, nofollow`, canonical `/qa`, not in sitemap |
| `/audit/google/index` | `200`, `noindex, nofollow`, canonical `/audit/google`, not in sitemap |
| `/calculators/pool-chlorine-calculator` | `200`, `index, follow`, self-canonical, in sitemap |
| `/programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool` | `200`, `index, follow`, self-canonical, in sitemap |
| `/guides/pool-chemistry-basics` | `200`, `index, follow`, self-canonical, in sitemap |

All 10 representative URLs behaved exactly as designed.
