# Pre-Phase 5B.8 Indexing & Crawl Audit Summary

## Scope Snapshot

- Platform version: `1.0.0 (Foundation)` (from `data/platform/platform.json`)
- Pages audited: `495`
- Generators audited: `10`
- Templates audited: `release-template.html` + shared template helper layer (`template-utils.js`)
- Internal links audited: `14,972`
- Redirect rules audited: `22`
- Canonical pages audited: `495`
- Sitemap entries audited: `494` across `8` grouped sitemaps
- Cloudflare repository configuration reviewed: `_redirects`, `functions/_middleware.js` (no `_headers`)
- Search Console issue categories analyzed: Redirected, 404, Alternate Canonical, Crawled Not Indexed (repository-evidence model)

## Confirmed Findings

1. **Internal link normalization drift is still present in generated HTML.**  
   Evidence: `1,727` relative links, `1,746` `.html` links, and `57` `index.html` links in `internal-links.json`.

2. **Directory hub links are emitted without matching pages for several top-level sections.**  
   Evidence: Broken samples include `/calculators/`, `/guides/advanced/`, `/charts/`, `/comparisons/` resolving to missing pages in `sampleBroken`.

3. **Sitemap root normalization defect exists (`/index` in sitemap).**  
   Evidence: `sitemap-audit.json` shows `missingInBuild: ["/index"]`, traced to `toCleanPath()` behavior in `scripts/generate-sitemaps.js`.

4. **Canonical coverage is incomplete on known non-content/system pages.**  
   Evidence: `missingCanonical: 17` on `/qa/*`, `/reports/*`, `/components/*`, `/tools`.

5. **Release pages currently use `.html` canonical URLs.**  
   Evidence: `withHtmlCanonical: 2` (`/releases/1.0.0`, `/releases/1.1.0`).

6. **Historical malformed-path generation likely existed.**  
   Evidence: Git history probe found prior commit evidence for `calculators/calculators/` pattern (`64f4c68`).

## Rejected / Not Confirmed

1. **Redirect chains:** not observed (`chains: 0`).
2. **Redirect loops:** not observed (`loops: 0`).
3. **Sitemap duplicates:** not observed (`duplicates: 0`).
4. **Sitemap parameter URLs:** not observed (`withParams: 0`).
5. **Sitemap `.html` URLs:** not observed (`withHtml: 0`).

## Requires Further Investigation

1. **Cloudflare dashboard behavior** (Email Obfuscation, Automatic HTTPS, Always HTTPS, trailing slash mode, cache/page rules) cannot be proven from repository alone.
2. **Search Console exact issue counts and last-crawl timestamps** need direct GSC export/API access.
3. **Crawled Not Indexed quality causes** require URL-level GSC and query/impression context beyond crawl topology.

## Search Console Category Assessment (Evidence-Based)

### Redirected URLs
- Estimated count driver: `22` explicit legacy redirects.
- Pattern: legacy explanation path migrations and `.html` legacy variants.
- Confidence: **High**.

### 404 URLs
- Estimated risk driver: `177` broken internal link targets from generated pages.
- Dominant pattern: directory-style links to non-existent index routes (e.g., `/calculators/`, `/guides/advanced/`).
- Confidence: **High** for crawler-visible risk.

### Alternate Canonicals
- Current non-self canonical count: `0`.
- Residual canonical style mismatch (`.html`) present on release pages.
- Confidence: **High**.

### Crawled, Not Indexed
- Risk heuristic: `68` low-inbound pages (orphan-risk set, many glossary/entity leaf pages).
- Confidence: **Medium** (needs GSC URL inspection data).

## URL Normalization Results (Local vs Production)

- Production serves canonicalized content for:
  - `/index.html` -> final `/` (200)
  - `/pool-chemical-levels-chart/` -> final `/pool-chemical-levels-chart` (200)
  - `/pool-chemical-levels-chart.html` -> final `/pool-chemical-levels-chart` (200)
  - query variant remains 200 with canonical to clean URL
- Uppercase-path variant `/Pool-chemical-levels-chart` returns `404` with canonical `/404`.
- Local static server (`python -m http.server`) does **not** reproduce extensionless URL behavior; it returns 404 for extensionless paths.  
  This explains local-vs-production crawl behavior differences and is expected for static local serving.

## Deployment Audit (Generated vs Published)

- Generated artifacts and published behavior are broadly aligned on canonical URL destinations.
- Main discrepancy observed: production-friendly extensionless routing is not reproducible on local static server.
- Redirect inventory in repository is consistent with production migration goals (legacy path consolidation).

## Evidence Matrix

| Issue | Evidence | Root Cause | Confidence | Recommended Fix (Phase 5B.8 input) |
| ----- | -------- | ---------- | ---------: | ----------------------------------- |
| Redirected URLs | `22` 301 rules in `_redirects` | Legacy path migrations retained for continuity | High | Keep 301s, but map remaining legacy references out of internal links/sitemaps |
| 404 URL risk | `177` broken internal links | Generators/injections emit section-directory links without backing pages | High | Normalize links to concrete existing URLs only |
| Relative URL leakage | `1,727` relative hrefs | Mixed generator patterns still use relative paths | High | Enforce root-relative URL policy in shared helpers |
| `.html`/`index.html` leakage | `1,746` `.html` links + `57` `index.html` links | Legacy hardcoded links in multiple generators/templates | High | Centralize URL builder and remove extension hardcoding |
| Sitemap root mismatch | `missingInBuild: /index` | `toCleanPath()` converts `index.html` to `/index` | High | Patch sitemap clean-path root handling |
| Canonical gaps | `17` missing canonical pages | Non-content/report/system pages excluded from canonical tagging | Medium | Decide explicit noindex/canonical policy for QA/report/system URLs |
| Release canonical style | 2 release pages canonicalize to `.html` | Release generator uses file-name canonical format | Medium | Switch to extensionless canonical convention for release pages |
| Historical malformed URLs | Git hit for `calculators/calculators/` | Prior generator bug in historical branch state | Medium | Add regression tests for duplicated path segments |
| Cloudflare feature influence | Dashboard settings not in repo | Cannot validate runtime toggles from filesystem | Low | Manual dashboard capture + export into audit evidence |
| Crawled Not Indexed risk | `68` low-inbound pages | Deep leaf pages have weak internal prominence | Medium | Improve internal linking distribution and crawl depth support |

## Phase 5B.8-Ready Recommendations (Investigation Output Only)

1. Normalize all internal href generation to root-relative, extensionless links via shared URL utility.
2. Remove section-directory links unless corresponding index pages exist.
3. Fix sitemap root normalization (`index.html` -> `/`).
4. Standardize canonical format (extensionless) including release pages.
5. Define explicit canonical/noindex strategy for QA/report/system endpoints.
6. Add regression checks for duplicated path segments and extension leaks in generators.
7. Capture Cloudflare dashboard settings as auditable configuration evidence.

---

Audit status:
- **Confirmed:** core URL/link/canonical/sitemap causes identified with repository evidence.
- **Rejected:** redirect chains/loops/duplicate sitemap assumptions not supported by evidence.
- **Further investigation:** GSC-export-specific and Cloudflare-dashboard-specific signals.
