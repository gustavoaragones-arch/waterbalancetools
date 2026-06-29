# URL Architecture

## Philosophy

WaterBalanceTools uses one canonical URL system for all generated output.  
Every internal link, canonical URL, sitemap URL, breadcrumb URL, and schema URL must come from `js/url/url-engine.js`.

Core guarantees:
- extensionless public URLs
- root-relative internal URLs
- deterministic normalization
- no `index.html` or `.html` leakage
- no relative internal links (`../`, `./`)
- no duplicate slashes or duplicate path segments

## Public API

Use only these functions from `js/url/url-engine.js`:
- `cleanPath(path)`
- `buildUrl(path)`
- `absoluteUrl(path)`
- `canonicalUrl(path)`
- `sitemapUrl(path)`
- `href(path)`
- `normalizeHref(href)`
- `normalizeSegment(segment)`
- `join(...parts)`
- `isCanonical(url)`

## Generator Rules

- Never concatenate paths for public URLs.
- Never hand-normalize with `.replace('.html', ...)`, `/index`, or slash-collapsing regexes.
- Use:
  - `href()` for internal template links
  - `canonicalUrl()` for canonical tags
  - `sitemapUrl()` for sitemap entries
  - `absoluteUrl()` for JSON-LD and OG absolute URLs
  - `join()` for path composition

## Migration Pattern

- Before:
  - `href="/academy/${slug}/"`
  - `base + '/' + slug`
  - `url.replace(/\.html$/, '')`
- After:
  - `href(urlEngine.href(\`/academy/${slug}\`))`
  - `urlEngine.join(base, slug)`
  - `urlEngine.buildUrl(input)`

## Validation Gates

The build preflight now runs:
1. `scripts/validate-url-engine.js`
2. `scripts/test-url-engine.js`
3. `scripts/audit-url-engine-usage.js`

Build fails if URL integrity or URL-engine usage rules are violated.

## Common Mistakes

- Writing `.html` in href output.
- Emitting `/path/` instead of `/path`.
- Using `../` links in generated HTML.
- Re-implementing normalization in generators.
- Constructing absolute URLs manually instead of `absoluteUrl()`.

## Future Guidance

- New generators must consume URL helpers from `template-utils.js` or import `js/url/url-engine.js` directly.
- Any new URL helper in shared utilities must be a thin wrapper around `url-engine`.
- If URL policy changes, update `url-engine`, then update tests and validation — not individual generators.
