# PHASE 8I STATUS — Spanish Calculator Expansion (Water Chemistry Cluster)

## Baseline
- Starting commit: `f7946653613d9addce2758721c6b7c8e6159c030` (Phase 8H closeout)
- Branch: `main`, HEAD == origin/main, working tree clean at start

## Selected Spanish cluster
4 pages — the untranslated remainder of the site's own pre-existing "Water
Chemistry (5)" related-calculators navigation group (spa-volume-calculator,
the 5th member, was already translated in Phase 8G):

- `calculator:pool-alkalinity` — `/calculators/pool-alkalinity-calculator` → `/es/calculators/pool-alkalinity-calculator`
- `calculator:pool-cyanuric-acid` — `/calculators/pool-cyanuric-acid-calculator` → `/es/calculators/pool-cyanuric-acid-calculator`
- `calculator:pool-turnover-rate` — `/calculators/pool-turnover-rate-calculator` → `/es/calculators/pool-turnover-rate-calculator`
- `calculator:saltwater-pool-salt` — `/calculators/saltwater-pool-salt-calculator` → `/es/calculators/saltwater-pool-salt-calculator`

## Selection rationale
Deterministic, repository-derived: every one of the 13 real production
calculators' own "Related Calculators" grid groups these 4 pages, verbatim
and identically across all source files, under a site-authored heading —
"Water Chemistry (5)". Alkalinity, cyanuric acid, and salt are direct
Priority-1 chemical-management parameters; turnover rate is included via
the spec's explicit tie-break rule ("prefer calculators already grouped
together in the existing navigation"). No editorial judgment, no invented
concepts, no synonym pages. 4 pages is within the required 3–8 range and is
the entire remaining coherent cluster.

## New Spanish pages
4 — `/es/calculators/pool-alkalinity-calculator`,
`/es/calculators/pool-cyanuric-acid-calculator`,
`/es/calculators/pool-turnover-rate-calculator`,
`/es/calculators/saltwater-pool-salt-calculator`

## Existing Spanish pages preserved
9/9

## Content IDs
PASS — 4 new IDs (`calculator:pool-alkalinity`, `calculator:pool-cyanuric-acid`,
`calculator:pool-turnover-rate`, `calculator:saltwater-pool-salt`) follow the
exact mechanical convention already used by all 9 prior units; each is
distinct from both its English and Spanish URL; no separate Spanish
content-ID system introduced.

## Translation
PASS — Complete, natural, professional Spanish across title, meta,
og/twitter, H1, hero, form labels, quick-tips, related-tools/link-matrix
anchor text, trust-panel notes, breadcrumb, and inline-JS result/validation
strings. URLs, slugs, content IDs, function/variable names, and schema
property names untouched. Numeric placeholder attributes intentionally
left untranslated, matching established sitewide precedent.

## Regional terminology
PASS — `data/i18n/es/terminology.json` and `js/i18n/es-terminology.js`
unmodified (byte-identical to Phase 8H baseline). No hot-tub/spa
terminology relevant to this pool-only cluster. No forced synonym
insertion; no country-specific or synonym pages/directories created.

## Navigation
PASS — Language-aware eligibility gate (unmodified generator) correctly
indexes all 4 new Spanish URLs with `lang:"es"`, exactly one record each,
no leakage, no duplicates.

## Search
PASS — Independent en/es documents for all 4 new pages, correctly sharing
`contentId`, never merged; each independently searchable.

## Sitemap
PASS — All 13 Spanish calculator URLs (9 prior + 4 new) present in
`sitemap-calculators.xml` exactly once each, apex hostname. English
sitemap URL count unchanged (478). Total sitemap URL count: 491.

## Canonical
PASS — All 4 new English pages self-canonical to their English URL; all 4
new Spanish pages self-canonical to their Spanish URL. Never
cross-canonicalized.

## hreflang
PASS — Reciprocal en/es/x-default across all 13 cluster pairs (26 files
total), verified programmatically via `js/i18n/hreflang.js`'s own
reciprocity checker. No unauthorized language codes.

## Schema
PASS — All 4 new Spanish pages carry 2 valid, parseable JSON-LD blocks
(WebApplication + BreadcrumbList) with Spanish-visible name/description
text; no calculation data altered.

## Calculator equivalence
PASS — `js/calc-utils.js` byte-identical to the Phase 8H baseline (git
diff empty). All 4 Spanish pages invoke the identical `calcUtils.*`
function as their English source, same call count. Representative
input/output cases produce identical numerical results (e.g.
`calculateAlkalinity(15000,60,100)` → 8.4 lb on both language versions).
No dataset-driven English display string exists in any of the 4 relevant
functions, so no shared-calculator-string mechanism was required.

## English non-regression
PASS — 478 English URLs sitewide before and after Phase 8I. 0 removed, 0
added, 0 changed. English calculator functionality unchanged (formulas
untouched).

## Broken links
PASS — 0 broken links sitewide (539 pages checked, including the full
13-page Spanish cluster).

## URL/indexation
PASS — `validate-url-indexation.js`: 539 pages, 491 sitemap URLs, 0
violations.

## Determinism
PASS — 4 total clean builds run this phase; Spanish pages, navigation,
search index, translation-status, and all 8 child sitemaps byte-identical
across runs (lastmod excluded as git-history-driven, per the Phase 8H
convention). Zero unexplained URL/content churn.

## Validation
`scripts/validate-phase-8i.js`: PASS — 0 errors, 0 warnings (25 checks,
A–Y). `scripts/test-phase-8i.js`: 26/26 PASS.

## Regression
7H/7I/7K/7M/7N/7O/7X: PASS. 7Y/7Z: FAIL for the same known,
already-dispositioned historical stale-baseline reasons documented in every
prior phase since Phase 8G (not new regressions; not modified). 8A/8B/8C/8D/8E/8G/8H:
PASS. 8F: FAIL — its own hardcoded `esPages === 5` assertion, now stale at
13 (identical already-dispositioned finding from Phase 8G's closeout); not
modified, per this phase's explicit instruction.

## Production source changes
- Modified: `scripts/data/i18n-es/cluster-translations.js`,
  `scripts/generate-spanish-cluster.js`, `data/i18n/translation-status.json`
- New: `es/calculators/pool-alkalinity-calculator.html`,
  `es/calculators/pool-cyanuric-acid-calculator.html`,
  `es/calculators/pool-turnover-rate-calculator.html`,
  `es/calculators/saltwater-pool-salt-calculator.html`,
  `scripts/validate-phase-8i.js`, `scripts/test-phase-8i.js`,
  `docs/PHASE-8I-SPANISH-CALCULATOR-EXPANSION.md`, this file
- Additive-only: the 4 English source pages (hreflang + language-switcher
  injection), the 9 pre-existing Spanish pages (Water Chemistry grid href
  updates only), `data/navigation.json`, `data/search-index.json`, all 9
  sitemap files, plus the standard sitewide build-artifact regeneration
  set (timestamps/counts only — same category documented in every prior
  phase)
- `js/calc-utils.js`: **not modified**

## Phase 8I status
PASS

Do not commit or push. Do not begin Phase 8J. Awaiting Director review.
