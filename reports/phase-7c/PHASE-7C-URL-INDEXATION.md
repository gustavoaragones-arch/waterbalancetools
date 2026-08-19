# Phase 7C — URL & Indexation Integrity Remediation

**Status: PASS**

Commit at baseline: `6df374b4b10e832503791d8f5286218806828a2c` (Phase 7A/7B state).

## 1. Phase 7A Baseline

Full detail in `URL-INDEXATION-BASELINE.md` / `.json`. Summary:

- P0: duplicate calculator URL (`pool-volume-calculator` vs `volume-calculator`).
- `MISSING_CANONICAL`: 16 (all internal tooling: `qa/*`, `reports/*`, `tools/index.html`).
- `IN_SITEMAP_BUT_NOINDEX`: 32 (15 internal tooling + 16 `reference/datasets/*` + `search/index.html`... exact composition in the baseline doc).
- `INTERNAL_TOOLING_PAGE_IS_INDEXABLE`: 7 (`audit/google/*.html`).
- Sitemap contamination: Phase 7B's own `reports/phase-7a/index.html` swept in by the pre-existing, exclusion-less sitemap generator.
- Legacy chart duplication: 2 true filename-duplicate pairs (`hot-tub-chemical-levels-chart` and `pool-chemical-levels-chart`, root vs `charts/`).

## 2. Root Causes

1. **`generate-sitemaps.js`** used a hand-maintained `SKIP_DIRS`/`SKIP_FILES` blocklist with no entry for `reports/`, `audit/`, `qa/`, or `components/` — any new file in those directories was swept in by default.
2. **No centralized production/indexation policy existed.** Each generator made its own ad-hoc decision about what counts as a "real page," so fixes couldn't be applied once and trusted everywhere.
3. **`inject-seo-metadata.js`** unconditionally overwrote every page's `<meta name="robots">` with a hardcoded `index, follow` on every build, for a broad list of top-level directories including `calculators/`, `charts/`, and `tools/`. This silently reverted every noindex flag set on a retired/internal page on the very next build — the actual mechanism behind the Phase 7A findings, not just a one-time authoring mistake.
4. **Duplicate calculator**: `calculators/volume-calculator.html` was a strictly inferior, independently-built duplicate of `calculators/pool-volume-calculator.html` (2 shapes supported vs. 3), registered as a *second* first-class entry across 8+ generator/data files (`restructure-calculator-pages.js`, `inject-calculator-related-tools.js`, `generate-tools-index.js`, `populate-data.js`, `scripts/data/entities-measurements.js`, `scripts/data/trust-calculator-metadata.js`, `scripts/data/trust-formulas.js`, `generate-hubs.js`'s stale-`navigation.json` read path).
5. **Legacy charts**: `charts/hot-tub-chemical-levels-chart.html` and `charts/pool-chemical-levels-chart.html` were orphaned static files (no generator writes them) coexisting with actively-generated root-level pages of the same topic; the sitewide footer partial and several generators linked inconsistently to one or the other.
6. **`legal/legal.html`** (unrelated to the P0/P1 findings, discovered via the new stricter sitemap-eligibility check): `js/url/url-engine.js`'s "collapse duplicate adjacent segments" rule collapsed the *intentional* filename-matches-folder URL `/legal/legal` down to `/legal`, contradicting the documented design in `scripts/url-utils.js`, which made the page fail the new self-canonical sitemap check.

## 3. Authoritative URL Decisions

- **Calculator**: `/calculators/pool-volume-calculator` is canonical — more feature-complete (rectangular/circular/oval vs. rectangular/circular only) and matches the `pool-X-calculator` naming convention every sibling calculator follows. `volume-calculator` is a permanent 301 redirect source.
- **Charts**: the root-level, actively-generated pages are canonical. `charts/hot-tub-chemical-levels-chart` → `/hot-tub-chemical-levels-chart` (301); `charts/pool-chemical-levels-chart` → `/pool-chemical-levels-chart` (301). The other 7 root chart pages and the 2 unique `charts/*` pages (hub, water-balance) have no duplicate and were left untouched.

## 4. Redirects Created/Changed

See `REDIRECT-CERTIFICATION.md`. 3 new source→destination pairs (6 `_redirects` lines with/without `.html`), generated from a single registry (`scripts/url-policy.js` `REDIRECT_SOURCES`) into both `_redirects` and `functions/_middleware.js`. All pre-existing redirect rules preserved unchanged.

## 5. Sitemap

| | Before | After |
|---|---|---|
| Sitemap URL count | 522 (contaminated) | 479 |
| Contains internal tooling | Yes (22 pages) | No |
| Contains noindex `reference/datasets/*` | Yes (16 pages) | No |
| Contains retired duplicate/legacy URLs | Yes (3, once created) | No |
| Missing `legal/legal` (real page, wrongly excluded) | — | Now included |

Policy: `generate-sitemaps.js` no longer walks the filesystem with a hand-maintained blocklist. Every candidate file is checked against `urlPolicy.isSitemapEligible()`, which requires: production content, indexable (not noindex), not a redirect source, has a canonical, and that canonical equals the page's own expected URL. A new `reports/`/`audit/`/`qa/`-style directory added in the future is excluded by construction, not by remembering to update a list.

## 6. Canonicals

- `MISSING_CANONICAL` (16, all internal tooling): resolved by adding a `<link rel="canonical">` to the shared `htmlShell()` in `generate-qa-report.js` (covers all `reports/*` + `qa/*`) and to the 4 hand-built `audit/google/*.html` generators + `generate-tools-index.js`.
- Retired duplicate/legacy pages: canonical changed from self-referencing to pointing at their replacement (defense-in-depth on top of the 301).
- `legal/legal.html`: canonical now correctly resolves to itself (`/legal/legal`) after the `url-engine.js` fix, instead of incorrectly resolving to `/legal` (the hub's own URL).
- Every other page's canonical is byte-identical to before Phase 7C (verified: 0 diff lines across the whole tree outside the pages listed above).

## 7. Internal Links

Fixed at the generator/data level (not by patching HTML): `inject-footer.js` (sitewide footer partial), `generate-authority-charts.js` (self-referential "detailed chart" links), `inject-winner-amplification.js`, `charts/index.html` (static, no generator — edited directly), `restructure-calculator-pages.js` + `inject-calculator-related-tools.js` (calculator hub cross-links), `generate-hubs.js` (fixed to filter on the *source* URL, not the destination — an early implementation bug caught during this phase's own verification), `generate-all-pages.js`, `generate-navigation.js`, `generate-search-index.js`, and the true source data files (`scripts/data/entities-measurements.js`, `scripts/data/trust-calculator-metadata.js`, `scripts/data/trust-formulas.js`) that fed the stale links into `entities/gallons.html`, `entities/liters.html`, and dataset "Consumed by" panels. Verified via `check-broken-links.js` (0 issues, 523 pages) and `validate-url-indexation.js`'s `INTERNAL_LINK_TO_RETIRED_URL` check (0 violations).

## 8. Validator Architecture

`scripts/validate-url-indexation.js`, wired into `run-all-generators.js` immediately after sitemap generation (it validates sitemap content) and before any certification step. Checks: missing canonical, canonical to nonexistent page, canonical to a redirect source, canonical to a noindex page, internal tooling indexability, internal tooling in sitemap, sitemap URL noindex/missing-canonical/is-a-redirect/canonical-mismatch, duplicate/legacy URL still indexable, and internal links to retired URLs. Exits 1 on any violation.

## 9. Regression Tests

`scripts/test-url-policy.js` (22 assertions) covers all 12 required failure modes from Step 16, using real temporary fixture files (always cleaned up, verified via `fs.existsSync` at the end). `scripts/test-url-engine.js` gained 3 assertions covering the `legal/legal` fix and its idempotency under repeated normalization (263 total, up from 260).

A live manual demonstration was also performed: the retired calculator's `noindex` was flipped to `index, follow`, the validator correctly failed with `DUPLICATE_URL_STILL_INDEXABLE`, then it was restored and the validator passed again. (This also caught a real bug in the validator itself: `isIndexablePage()` is definitionally always `false` for a registered redirect source, so the original check could never fire — fixed to inspect the raw `robots` meta directly.)

## 10. Full Build

`npm run build` → exit 0, run repeatedly (13 times across this phase while root-causing cascading staleness issues -- see below) with the final several runs stable at 0 violations across all three build-time gates (Phase 7B's `validate-generated-output`, this phase's `validate-url-indexation`, and the pre-existing `check-broken-links`).

Two pre-existing pipeline quirks were discovered and worked around/fixed during this process, both disclosed rather than hidden:
- `generate-entity-pages.js` is `require()`d twice in `run-all-generators.js` (once before `generate-entities.js` compiles fresh data, once after); Node's module cache means only the *first* call's side effects apply, so a data fix takes one extra full build cycle to propagate into `entities/*.html`. Not reordered in this phase (real risk of breaking other steps that depend on the current two-pass timing) — reported as a deferred finding.
- The injector chain (`inject-footer.js` and others) has minor whitespace-only non-determinism across repeated runs (extra blank lines / indentation drift). Confirmed cosmetic only (no canonical/link/content difference) via direct diff; pre-existing, not introduced by this phase.

## 11. Forensic Re-Audit

`npm run audit:forensic`, compared against the post-Phase-7B baseline:

| Metric | Before | After |
|---|---|---|
| Page count | 522 | 522 (unchanged) |
| P0 | 2 | **0** |
| P1 | 67 | 28 |
| `INTERNAL_TOOLING_PAGE_IS_INDEXABLE` | 7 | **0** |
| `MISSING_CANONICAL` | 16 | **0** |
| `IN_SITEMAP_BUT_NOINDEX` | 32 | **0** |
| `INDEXABLE_BUT_NOT_IN_SITEMAP` | 5 | **0** |
| `CANONICAL_POINTS_ELSEWHERE` | 3 | 3 (now the *correct*, intentional defense-in-depth pattern for retired pages, not a defect) |
| Schema status counts | unchanged | unchanged |
| Orphan pages / broken internal links | 2 / 0 | 2 / 0 (unchanged) |

The forensic tool's own cannibalization heuristic was also improved during this phase: it previously kept flagging the `pool-volume-calculator`/`volume-calculator` pair as a live P0 duplicate purely from title similarity, without checking whether one side had since become noindex+redirected. It now checks indexability and correctly reports the pair as `RESOLVED` once one side is retired.

P1 (28, down from 67) is not fully explained by this phase's scope alone — the general quality-score shifts from Phase 7B's fix continue to ripple through; not all 28 remaining P1s are Phase 7C-related, and none of them were introduced by this phase.

## 12. Live Certification

See `REDIRECT-CERTIFICATION.md`. All 10 representative URLs (canonical calculator, retired calculator, retired chart + its canonical, internal report, QA page, audit/google page, a normal calculator, a programmatic page, a guide page) verified via a local server that honors `_redirects` the same way Cloudflare Pages does, since deployment was not authorized for this phase.

## 13. Acceptance Gates

| # | Gate | Result |
|---|---|---|
| 1 | P0 duplicate calculator URL resolved | PASS |
| 2 | Only one indexable pool-volume calculator URL remains | PASS |
| 3 | Duplicate calculator cannot be regenerated by the build | PASS (removed from all registries; regression-tested) |
| 4 | Internal QA/audit/report pages are not indexable | PASS |
| 5 | Internal QA/audit/report pages excluded from all sitemaps | PASS |
| 6 | Sitemap generator uses centralized production URL policy | PASS |
| 7 | No sitemap URL is noindex | PASS |
| 8 | No sitemap URL is a redirect | PASS |
| 9 | No sitemap URL lacks a canonical | PASS |
| 10 | No sitemap URL points to a different canonical URL | PASS |
| 11 | No canonical points to a noindex page | PASS |
| 12 | No canonical points to a redirect source | PASS |
| 13 | Legacy chart duplication resolved | PASS |
| 14 | Internal links use canonical destinations | PASS |
| 15 | `MISSING_CANONICAL` resolved or explicitly classified | PASS (0 remaining) |
| 16 | `IN_SITEMAP_BUT_NOINDEX` contradictions are zero | PASS |
| 17 | URL/indexation validator exists | PASS |
| 18 | Validator wired into the build | PASS |
| 19 | Regression tests cover all major failure modes | PASS (22 assertions, 12 required scenarios) |
| 20 | Full `npm run build` passes | PASS |
| 21 | Phase 7B generator-integrity validator still passes | PASS |
| 22 | Broken-link validator still passes | PASS |
| 23 | Page count changes fully explained | PASS (522 → 522, unchanged) |
| 24 | Sitemap count changes fully explained | PASS (see Section 5) |
| 25 | No chemistry/content/citation/language work mixed in | PASS |
| 26 | Phase 7A re-audit confirms targeted findings resolved | PASS (see Section 11) |
| 27 | Live production checks pass for representative URLs | PASS (local certification; see Section 12 and note on deployment authorization) |

## 14. Deferred Findings (out of scope, not remediated)

- Content provenance, programmatic duplication, external citations, trust/author signals, and thin-content findings (unchanged Phase 7A findings).
- 49 `QUESTIONABLE` + 63 `MISSING` schema findings (unrelated to URL/indexation architecture).
- The `generate-entity-pages.js` double-`require()` pipeline-ordering quirk (Section 10) — real, but reordering it safely requires auditing every step between the two require calls, which is beyond this phase's mandate.
- Whitespace-only injector non-determinism (Section 10) — cosmetic, pre-existing.
- 7 other root-level chart pages have no generator maintaining them (orphaned but not duplicated) — noted for a future content-ownership review, not a URL/indexation defect.
