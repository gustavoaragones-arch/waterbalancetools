# Phase 8I — Spanish Calculator Expansion (Water Chemistry Cluster)

Phase 8I expands the Spanish calculator publication beyond the 9-page
foundation established in Phases 8E and 8G, adding the 4 remaining members
of the site's own existing "Water Chemistry (5)" related-calculators
navigation group. No new architecture was introduced: this phase reuses the
Phase 8D content-ID model, the Phase 8E generator/translation-data pattern,
the Phase 8F language-aware navigation/search-index gate, and the Phase 8G
related-calculator Spanish-to-Spanish linking mechanism, unmodified.

## 1. Baseline

Starting commit: `f7946653613d9addce2758721c6b7c8e6159c030` (Phase 8H
closeout). Branch `main`, HEAD == origin/main, working tree clean at start.

## 2. Cluster selection (deterministic, repository-derived)

Every English calculator page (14 files in `calculators/`) was inventoried.
`calculators/volume-calculator.html` is a Phase 7C permanent redirect
source (`scripts/url-policy.js` `REDIRECT_SOURCES`) — not a real production
page, excluded. Of the remaining 13 production calculators, 9 were already
translated (Phase 8E's 5-page pool cluster + Phase 8G's 4-page hot-tub/spa
cluster). The 4 candidates were: `pool-alkalinity-calculator.html`,
`pool-cyanuric-acid-calculator.html`, `pool-turnover-rate-calculator.html`,
`saltwater-pool-salt-calculator.html`.

Selection did not rely on editorial judgment. Every one of these 4 pages'
own "Related Calculators" grid already groups them, verbatim and
identically across all 4 source files, under a heading the site itself
authored: **"Water Chemistry (5)"** — alongside `spa-volume-calculator.html`
(the 5th member, already translated in Phase 8G). This is the exact,
pre-existing, repository-derived cluster the spec's Step 3 priority rules
call for:

- **Priority 1** (chemical-management/calculation ecosystem): alkalinity,
  cyanuric acid (chlorine stabilizer), and salt (saltwater chlorination
  input) are all direct pool water-chemistry parameters — squarely
  Priority 1.
- **Tie-break rule 1** ("prefer calculators already grouped together in the
  existing English calculator navigation"): turnover rate — more of an
  operational/flow calculation on its own — is nonetheless already grouped
  with the other 3 under the same site-authored "Water Chemistry" heading
  on every one of the 13 cluster pages' own grids, so the whole group was
  treated as the coherent unit rather than splitting it.
- No invented calculator concepts, no synonym pages, no country pages.

4 calculators is within the required 3–8 target and is the smallest
coherent cluster available (the entire remaining group, no more, no less).

## 3. Content IDs

Following the exact, pre-existing, mechanical convention already used by
every one of the 9 prior units (`calculator:` + filename with the
`-calculator.html` suffix stripped — e.g. `hot-tub-chlorine-calculator.html`
→ `calculator:hot-tub-chlorine`):

| English file | Content ID |
|---|---|
| `pool-alkalinity-calculator.html` | `calculator:pool-alkalinity` |
| `pool-cyanuric-acid-calculator.html` | `calculator:pool-cyanuric-acid` |
| `pool-turnover-rate-calculator.html` | `calculator:pool-turnover-rate` |
| `saltwater-pool-salt-calculator.html` | `calculator:saltwater-pool-salt` |

No separate Spanish content ID was created; EN and ES reference the
identical entity in `data/i18n/translation-status.json`.

## 4. Translation

All visible strings were translated into natural, professional Spanish:
title, meta description, og/twitter tags, H1, hero-sub, form labels, the
button, quick-tips copy, related-tools/link-matrix anchor text (English
href retained only where the *target* page itself has no Spanish
equivalent — e.g. `programmatic/` and `reference/` pages, none of which
this phase is authorized to translate), trust-panel note text, breadcrumb
label, and the inline-JS result/validation strings. URLs, slugs, content
IDs, function names, variable names, and schema property names were never
translated. Numeric input `placeholder="e.g. ..."` attributes were left
untranslated, matching the exact precedent already established across all
9 prior Spanish pages (confirmed by inspecting the live committed
`es/calculators/pool-chlorine-calculator.html`, which shows the identical
practice).

## 5. Calculator-specific string audit (Section 18/Step 8)

`js/calc-utils.js`'s 4 relevant functions (`calculateAlkalinity`,
`calculateCYA`, `calculateTurnover`, `calculateSalt`) were inspected in
full. None returns a dataset-driven English display string — no
`SHOCK_PRODUCTS`-style label/warning object is consumed by any of these 4
pages (confirmed structurally and by `scripts/validate-phase-8i.js` check
Q, which asserts none of the 4 function bodies contains a `label`/
`mixingWarning` field or an embedded capitalized English phrase). All 4
functions return plain numeric objects (`pounds`, `ounces`, `ppm`, or a
bare number of hours). **No shared-calculator-string localization
mechanism (cf. `js/i18n/es-product-labels.js` from Phase 8G) was required
this phase.** `js/calc-utils.js` itself was not modified.

## 6. Translation data architecture

Extended the existing `scripts/data/i18n-es/cluster-translations.js`
(single source of truth, unchanged pattern):

- Removed the 4 obsolete `SHARED` text-only fallback rules for
  Salt/Alkalinity/CYA/Turnover Rate (previously correct only because no
  Spanish equivalent existed yet).
- Added 4 new combined href+text rules to `SHARED_OPTIONAL` (the Phase 8G
  mechanism for the related-calculators grid's non-active cards — applied
  only when present, since each is legitimately absent on exactly the one
  page that IS that calculator).
- Added 4 new complete per-file translation arrays (`POOL_ALKALINITY_CALCULATOR`,
  `POOL_CYANURIC_ACID_CALCULATOR`, `POOL_TURNOVER_RATE_CALCULATOR`,
  `SALTWATER_POOL_SALT_CALCULATOR`), each containing its own active-card
  rule, confidence-tooltip reference (reusing the existing
  `LIMITED_CONFIDENCE_TOOLTIP` / `VERY_HIGH_CONFIDENCE_TOOLTIP` constants),
  title/meta/og/twitter/schema-name/breadcrumb/H1/hero translations, form
  labels, quick-tips, related-tools/link-matrix link translations
  (reusing already-established Spanish phrasing verbatim wherever the same
  English link text recurs elsewhere in the cluster, for terminology
  consistency), trust-panel note translation, and inline-JS
  display-string translations.

`scripts/generate-spanish-cluster.js`'s `CLUSTER_FILES` array was extended
with the 4 new filenames — the only functional code change to the
generator itself; `applyReplacements()`, `rewriteRelativeLinks()`, and
`localizeSelfReferences()` were not touched.

## 7. Related-calculator linking (Spanish → Spanish)

Because these 4 pages are members of the SAME "Water Chemistry (5)" grid
that already appears, identically, on all 13 cluster pages (not just the 4
new ones), translating them required regenerating the full 13-page cluster
so the **9 pre-existing** Spanish pages also pick up the updated
Spanish-to-Spanish hrefs for their Water Chemistry grid entries — this was
an explicit, spec-required consequence (Step 9: "Spanish → translated
Spanish page when translation exists"), not scope creep. Verified: on every
one of the 13 Spanish pages, all 5 Water Chemistry grid entries now link to
`/es/calculators/...`, including the 4 newly-translated siblings.

## 8. Navigation, search index, sitemap

All three reuse their existing, unmodified generator architecture
(`generate-navigation.js`'s language-aware eligibility gate reading
`translation-status.json`; `generate-search-index.js`'s per-language
document separation with shared `contentId`; `generate-sitemaps.js`'s
`isSitemapEligible()` self-canonical-only inclusion). No generator code was
changed for any of the three. Post-build: `data/navigation.json` and
`data/search-index.json` both carry exactly one `lang:"es"` record per new
page, correctly content-ID-paired with the English record;
`sitemap-calculators.xml` carries all 13 Spanish URLs exactly once each,
apex hostname.

## 9. Regional terminology

`data/i18n/es/terminology.json` and `js/i18n/es-terminology.js` (Phase 8F)
were not modified. None of the 4 new pages required hot-tub/spa
terminology (they are pool-only concepts). Pool terminology
(`piscina`/`alberca`/`pileta`) was not force-inserted anywhere — the
existing pages already use `piscina` as the neutral default throughout, and
this phase did not introduce any new regional-variant copy, consistent
with the spec's explicit instruction not to insert every regional synonym
indiscriminately. No synonym or country-specific pages/directories were
created.

## 10. Validation, regression, determinism

- `scripts/validate-phase-8i.js`: PASS, 0 errors, 0 warnings (25 lettered
  checks, A–Y).
- `scripts/test-phase-8i.js`: 26/26 PASS.
- `check-broken-links.js`: 0 broken links (539 pages).
- `validate-url-indexation.js`: PASS, 539 pages, 491 sitemap URLs, 0
  violations.
- Full regression: 7H/7I/7K/7M/7N/7O/7X pass; 7Y and 7Z fail for the
  same known, already-dispositioned historical stale-baseline reasons
  documented in every prior phase's status report (7Y flags any later
  phase's legitimate changes as "unexplained"; 7Z's forbidden-path list
  predates the `es/` directory's existence) — neither is a Phase 8I
  regression. 8A/8B/8C/8D/8E/8G/8H all pass. 8F fails its own hardcoded
  `esPages === 5` / `esEntries.length === 5` assertions (now stale at 13,
  the identical already-dispositioned finding from Phase 8G's own
  closeout) — not modified, per this phase's explicit instruction not to
  repair stale prior-phase validators.
- Determinism: 4 total full builds run this phase (2 to establish the
  initial correct state, 2 more for the explicit determinism gate),
  producing byte-identical Spanish pages, navigation, search index,
  translation-status, and all 8 sitemap files (lastmod excluded as
  git-history-driven, per the established Phase 8H convention). Zero
  unexplained URL/content churn.
- English non-regression: 478 English URLs sitewide before and after — 0
  added, 0 removed, 0 changed.
- Spanish non-regression: all 9 pre-existing Spanish pages remain present,
  self-canonical, hreflang-reciprocal, and correctly indexed/sitemapped.

## 11. Files changed

New: `es/calculators/pool-alkalinity-calculator.html`,
`es/calculators/pool-cyanuric-acid-calculator.html`,
`es/calculators/pool-turnover-rate-calculator.html`,
`es/calculators/saltwater-pool-salt-calculator.html`,
`scripts/validate-phase-8i.js`, `scripts/test-phase-8i.js`, this document,
`reports/phase-8i-status.md`.

Modified: `scripts/data/i18n-es/cluster-translations.js`,
`scripts/generate-spanish-cluster.js`, `data/i18n/translation-status.json`,
the 4 English source pages (hreflang + switcher injection, additive only),
the 9 pre-existing Spanish pages (Water Chemistry grid href updates only),
`data/navigation.json`, `data/search-index.json`, all 9 sitemap files, plus
the standard sitewide build-artifact regeneration set (freshness/priority/
crawl-rules timestamps, QA report, hub "Last updated" dates) already
documented as a legitimate, non-content category in every prior phase's
report.

`js/calc-utils.js` was not modified. No calculator formula, constant, or
unit-conversion behavior changed anywhere.
