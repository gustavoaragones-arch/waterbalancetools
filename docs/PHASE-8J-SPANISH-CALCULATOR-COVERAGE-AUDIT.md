# Phase 8J — Spanish Calculator Coverage Audit

Phase 8J is audit-only: no Spanish content was created, no calculator logic
was touched, and no production URL was added or changed. Its purpose is to
determine the complete current state of Spanish calculator coverage and, if
a gap exists, identify the next coherent expansion cluster using repository
evidence rather than assumption.

**Headline finding, stated up front because it reshapes every later part of
this audit: there is no remaining gap.** All 13 real, production English
calculator pages already have a Spanish counterpart as of the Phase 8I
closeout commit. This was verified independently across five separate data
sources (Section 2), not assumed from memory or from prior phase reports.

## 1. Baseline

- Baseline commit: `9e2b960419bfba5b3d2706ecabce7c44b032f126` (Phase 8I closeout)
- `git status --short`: clean
- HEAD == origin/main == the baseline SHA, confirmed before any audit work began.

## Part 1 — Forensic English calculator inventory

Source of truth: the actual `calculators/` directory listing, cross-checked
against `scripts/url-policy.js` (the project's own single source of truth
for what counts as a real, indexable, sitemap-eligible production page —
Phase 7C's `isProductionPage()` / `isSitemapEligible()`).

`calculators/*.html` contains 15 files. Two are explicitly excluded by
repository-derived rules, not by judgment:

| File | Exclusion reason (repository evidence) |
|---|---|
| `calculators/index.html` | The calculators hub/directory page, not a calculator itself (no `calc-form`, no `calculateX()` call) |
| `calculators/volume-calculator.html` | Listed in `url-policy.js`'s `REDIRECT_SOURCES` map → `/calculators/pool-volume-calculator`; a permanent Phase 7C redirect source, never production/indexable/sitemap-eligible regardless of the file still existing on disk |

That leaves **13 real production English calculator pages**:

| # | Filename | Title | Category | Indexable | In sitemap | Cluster (site's own grouping) |
|---|---|---|---|---|---|---|
| 1 | chemical-calculator.html | Pool Chemical Calculator (Chlorine and pH) | calculator | yes | yes | Pool Calculators |
| 2 | pool-volume-calculator.html | Pool Volume Calculator (calculators) | calculator | yes | yes | Pool Calculators |
| 3 | pool-chlorine-calculator.html | Pool Chlorine Calculator (Oz by Volume) | calculator | yes | yes | Pool Calculators |
| 4 | pool-ph-calculator.html | Pool pH Calculator (Target 7.2–7.6) | calculator | yes | yes | Pool Calculators |
| 5 | pool-shock-calculator.html | Pool Shock Calculator (Product-Specific Dose) | calculator | yes | yes | Pool Calculators |
| 6 | hot-tub-chlorine-calculator.html | Hot Tub Chlorine Calculator (30-Second Check) | calculator | yes | yes | Hot Tub Calculators |
| 7 | hot-tub-ph-calculator.html | Hot Tub pH Calculator | calculator | yes | yes | Hot Tub Calculators |
| 8 | hot-tub-shock-calculator.html | Hot Tub Shock Calculator (By Product) | calculator | yes | yes | Hot Tub Calculators |
| 9 | spa-volume-calculator.html | Spa Volume Calculator | calculator | yes | yes | Water Chemistry |
| 10 | pool-alkalinity-calculator.html | Pool Alkalinity Calculator | calculator | yes | yes | Water Chemistry |
| 11 | pool-cyanuric-acid-calculator.html | Pool Cyanuric Acid Calculator | calculator | yes | yes | Water Chemistry |
| 12 | pool-turnover-rate-calculator.html | Pool Turnover Rate Calculator | calculator | yes | yes | Water Chemistry |
| 13 | saltwater-pool-salt-calculator.html | Saltwater Pool Salt Calculator | calculator | yes | yes | Water Chemistry |

The three-group classification ("Pool Calculators (5)", "Hot Tub
Calculators (3)", "Water Chemistry (5)") is not an editorial judgment made
for this audit — it is copied verbatim from the site's own
`related-calculators` grid, present identically on every one of the 13
pages (`calculators/*.html`, section `<h2>Related Calculators</h2>`). This
is the same repository-derived grouping Phase 8I used to select its cluster
and is reused here unchanged.

**Sitewide search for calculators outside `calculators/`:** grepped the
entire repository for `id="calc-form"` and
`WaterBalance.calcUtils.calculate*(` outside `calculators/` and `es/`. Zero
matches. Also checked filenames matching `*calculator*.html` anywhere in the
repo: only two extra matches, both confirmed non-calculators —
`reference/calculator-directory.html` (a links-only directory page, 0
`calc-form`/`calculateX()` occurrences, analogous to `calculators/index.html`)
and `reports/calculators.html` (an internal QA report, `reports/` is in
`url-policy.js`'s `INTERNAL_TOOLING_DIRS`, never production). `tools/index.html`
was also checked and confirmed to be an aggregator/directory page (0 calc
occurrences), not itself a calculator. **Conclusion: the 13 pages in
`calculators/` are the complete, exhaustive set of real production
calculators on this site.**

## Part 2 — Current Spanish coverage (independently verified, not assumed)

The count of 13 was not taken on faith. It was cross-checked against five
independent data sources, each computed fresh from the current committed
repository state:

| Source | Method | Result |
|---|---|---|
| `es/calculators/*.html` filesystem listing | `ls es/calculators/*.html` | 13 files |
| `data/i18n/translation-status.json` | filter `category === 'calculator'` | 13 units, all `en.status="translated"` and `es.status="translated"` |
| `sitemap-calculators.xml` | count `<loc>` containing `/es/` | 13 |
| `data/navigation.json` | filter `lang==='es' && url.startsWith('/es/calculators/')` | 13 |
| `data/search-index.json` | same filter | 13 |

**Filename-level 1:1 mapping** was verified directly: `diff` between the 13
English filenames (calculators/ minus index.html and volume-calculator.html)
and the 13 Spanish filenames in `es/calculators/` produced **zero
differences** — every Spanish page has exactly one English counterpart and
every English page (other than the hub and the redirect source) has exactly
one Spanish counterpart. No orphans in either direction.

Per-page detail (all 13):

| Content ID | EN URL | ES URL | Cluster | hreflang | Canonical | Sitemap |
|---|---|---|---|---|---|---|
| calculator:chemical | /calculators/chemical-calculator | /es/calculators/chemical-calculator | Pool | reciprocal | self | yes |
| calculator:pool-volume | /calculators/pool-volume-calculator | /es/calculators/pool-volume-calculator | Pool | reciprocal | self | yes |
| calculator:pool-chlorine | /calculators/pool-chlorine-calculator | /es/calculators/pool-chlorine-calculator | Pool | reciprocal | self | yes |
| calculator:pool-ph | /calculators/pool-ph-calculator | /es/calculators/pool-ph-calculator | Pool | reciprocal | self | yes |
| calculator:pool-shock | /calculators/pool-shock-calculator | /es/calculators/pool-shock-calculator | Pool | reciprocal | self | yes |
| calculator:hot-tub-chlorine | /calculators/hot-tub-chlorine-calculator | /es/calculators/hot-tub-chlorine-calculator | Hot Tub | reciprocal | self | yes |
| calculator:hot-tub-ph | /calculators/hot-tub-ph-calculator | /es/calculators/hot-tub-ph-calculator | Hot Tub | reciprocal | self | yes |
| calculator:hot-tub-shock | /calculators/hot-tub-shock-calculator | /es/calculators/hot-tub-shock-calculator | Hot Tub | reciprocal | self | yes |
| calculator:spa-volume | /calculators/spa-volume-calculator | /es/calculators/spa-volume-calculator | Water Chemistry | reciprocal | self | yes |
| calculator:pool-alkalinity | /calculators/pool-alkalinity-calculator | /es/calculators/pool-alkalinity-calculator | Water Chemistry | reciprocal | self | yes |
| calculator:pool-cyanuric-acid | /calculators/pool-cyanuric-acid-calculator | /es/calculators/pool-cyanuric-acid-calculator | Water Chemistry | reciprocal | self | yes |
| calculator:pool-turnover-rate | /calculators/pool-turnover-rate-calculator | /es/calculators/pool-turnover-rate-calculator | Water Chemistry | reciprocal | self | yes |
| calculator:saltwater-pool-salt | /calculators/saltwater-pool-salt-calculator | /es/calculators/saltwater-pool-salt-calculator | Water Chemistry | reciprocal | self | yes |

(hreflang/canonical/sitemap columns re-confirmed live via `scripts/validate-phase-8i.js` re-run at this baseline — 0 errors, 0 warnings — and `scripts/check-broken-links.js` / `scripts/validate-url-indexation.js`, both 0 violations, immediately before writing this document.)

## Part 3 — Remaining translation gap

```
TOTAL REAL ENGLISH CALCULATORS        = 13
MINUS ALREADY TRANSLATED (ES)         = 13
= REMAINING SPANISH CANDIDATES        = 0
```

**There are zero remaining calculator-translation candidates.** No
low-priority candidate was omitted — the search in Part 1 was exhaustive
over the entire repository, not just the `calculators/` directory, and
found nothing beyond the 13 already accounted for.

## Part 4 — Cluster classification

Not applicable in the form the phase template anticipates: clustering
requires untranslated members to classify, and there are none. For
completeness, the three existing clusters (all sourced from the site's own
`related-calculators` grid, Part 1) are recorded here in their final,
fully-translated state:

| Cluster | Members | Translated | Untranslated | Completeness |
|---|---|---|---|---|
| Pool Calculators | 5 | 5 | 0 | 100% |
| Hot Tub Calculators | 3 | 3 | 0 | 100% |
| Water Chemistry | 5 | 5 | 0 | 100% |
| **Total** | **13** | **13** | **0** | **100%** |

No cluster was invented to fill this section. All three clusters are
complete; none has an untranslated remainder to prioritize.

## Part 5 — Cluster completeness analysis

All three clusters are at 100% Spanish coverage. There is no partially
translated cluster remaining. The "goal is not simply to choose the largest
cluster" instruction is moot here because there is no cluster left to
choose from — the prior three phases (8E: Pool, 8G: Hot Tub, 8I: Water
Chemistry) already completed all three in exactly that order of increasing
completeness, and none was left partially done.

## Part 6 — Translation difficulty (remaining candidates)

N/A — there are no remaining candidates to classify LOW/MEDIUM/HIGH.

## Part 7 — SEO / AEO value (remaining candidates)

N/A for the same reason. Search-volume evidence not available from
repository audit, and there is no candidate cluster to evaluate it against
regardless.

## Part 8 — Terminology dependency audit

Inspected `data/i18n/es/terminology.json` (19 concepts) and
`js/i18n/es-terminology.js` (query API) — both unchanged since Phase 8H,
confirmed via `git diff` against the current HEAD (zero diff). Since there
are no remaining calculator candidates, there is no new terminology
requirement to identify. For the record, the terminology this audit
double-checked as still correctly scoped to calculators only (not spilled
into synonym pages): `piscina` (neutral/default), `alberca` (MX regional),
`pileta` (AR/UY regional), `spa` (canonical hot-tub term), `jacuzzi`/`yacusi`
(trademark/search variants only, never canonical copy), `bañera de
hidromasaje`/`tina de hidromasaje` (distinct bathroom-fixture concept, never
substituted for "hot tub"). All 13 existing Spanish calculator pages were
re-spot-checked and none of them uses a regional or trademark variant as
primary copy — this remains correctly enforced.

## Part 9 — Architectural dependency audit

N/A for a "next calculator cluster" — none exists. For the record, the
architecture that would receive any *future* Spanish expansion (calculator
or otherwise) is confirmed fully operational and unmodified at this
baseline: `scripts/generate-spanish-cluster.js`, `scripts/data/i18n-es/cluster-translations.js`,
`data/i18n/translation-status.json`, the language-aware navigation/search-index
gates (Phase 8F architecture), sitemap generation, hreflang generation,
canonical enforcement (`url-policy.js`'s self-canonical-only
`isSitemapEligible()`), and the language switcher — all re-verified passing
via `scripts/validate-phase-8i.js` at this exact baseline with 0 errors.

One pre-existing, already-documented limitation is worth restating here
since it touches calculator architecture even though it blocks nothing
today: `js/calc-utils.js`'s `SHOCK_PRODUCTS` (used by
`pool-shock-calculator.html`) still returns English-only `label`/
`mixingWarning` strings, unlike `SHOCK_PRODUCTS_HOT_TUB` (used by
`hot-tub-shock-calculator.html`), which Phase 8G covered via the additive
`js/i18n/es-product-labels.js` lookup. This was explicitly documented as an
intentional, unauthorized-to-fix-mid-phase scope boundary in Phase 8G's own
report (fixing an already-accepted, already-committed prior phase's
deliverable was out of that phase's scope) and remains true today. It is
not a defect blocking anything — `es/calculators/pool-shock-calculator.html`
works correctly, it simply falls back to the English product label string
inside its result text, exactly as Phase 8E shipped it. Flagged here only
because a hypothetical future re-open of the Pool Calculators cluster (not
recommended — it is complete) would need to extend
`es-product-labels.js`'s `LABELS`/`WARNINGS` maps to cover
`SHOCK_PRODUCTS`'s remaining two entries (`Sodium Dichlor (56%)`,
`Trichlor Tablets (90%)`) that `SHOCK_PRODUCTS_HOT_TUB` doesn't share.

## Part 10 — Next best cluster

**No further Spanish calculator cluster exists to recommend.** Selecting
one would mean inventing a cluster that does not exist in the repository,
which this audit was explicitly instructed not to do. The evidence in
Parts 1–3 is unambiguous and was independently cross-checked five ways: 13
real English calculators, 13 Spanish calculators, 0 remaining.

This is a decision point for the Director, not a translation
recommendation:

1. **Declare the Spanish calculator-expansion track COMPLETE.** All 13
   production calculators are now bilingual, cross-linked
   Spanish-to-Spanish, correctly indexed, and sitemap-integrated. This is a
   legitimate, evidence-backed stopping point for this specific initiative.
2. **Redirect future Spanish-expansion phases to a different content
   type.** `data/i18n/translation-status.json` has carried 7 non-calculator
   fixtures since Phase 8D, seeded specifically for this eventuality, all
   still `es: "missing"`: `academy:fund-01`, `glossary:free-chlorine`,
   `formula:pool-volume`, `reference:ideal-pool-levels`,
   `guide:ph-can-you-swim-in-high-ph-water`, `entity:algae`,
   `programmatic:chlorine-10000-gallon`. These are explicitly **not**
   calculators — recommending translation work on them would be outside
   this audit's calculator-coverage scope and would require its own
   Director-authorized audit (a "Phase 8K-style" content-type audit), not a
   continuation of the calculator cluster methodology used in 8E/8G/8I.

This audit does not recommend between these two — that is a strategic
scope decision, not a repository-evidence question, and belongs to the
Director.

## Part 11 — Alternatives

Framed here as the two next-most-plausible **strategic directions** (not
calculator clusters, since none exist) the Director could authorize:

**Alternative A — Close the calculator track formally.**
- Why attractive: the evidence supports it cleanly; no further calculator
  work is needed; a formal "calculator track complete" milestone is a
  legitimate, citable outcome (13/13, 100%, verified five ways).
- Why not simply declared unilaterally by this audit: closing a track is a
  program-management decision with downstream implications (whether future
  new English calculators get simultaneous ES treatment as policy, whether
  this track's tooling gets archived or kept live) that the Director should
  make explicitly, not have inferred from an audit finding zero.
- What would revisit it later: if a new English calculator is added to the
  site in a future phase, this same audit methodology (Parts 1-3) should be
  re-run to catch it — the gap-detection logic is cheap to repeat and
  should not be assumed permanently zero.

**Alternative B — Open a new non-calculator Spanish content track (academy/glossary/formulas/reference/guides/entities/programmatic).**
- Why attractive: the 8D-8I i18n architecture (content IDs, hreflang,
  canonical, navigation/search language-awareness, sitemap integration,
  translation-status tracking) is content-type-agnostic by design — Phase
  8D explicitly seeded one fixture from each of these 7 categories for this
  exact future scenario, and the underlying `js/i18n/*` modules never
  assumed "calculator" as their only content shape.
  Direct linking potential exists too: e.g. `glossary:free-chlorine` and
  `formula:pool-volume` are conceptually one hop from several already-
  translated calculators (`calculator:pool-chlorine`, `calculator:pool-volume`).
- Why it is NOT simply an extension of Phase 8J: these categories have
  fundamentally different page shapes (long-form explanatory prose,
  glossary definitions, formula derivations, entity knowledge-graph pages)
  than a calculator's form+result UI — the translation-complexity profile,
  content-ID mapping conventions, and even what "coherent cluster" means
  would need fresh repository-derived analysis specific to each content
  type, not a reuse of this audit's calculator-specific findings.
- What would make it preferable now: a Director decision that Spanish
  content depth (not just calculator utility) is the priority for the next
  phase, at which point a dedicated "Phase 8K: Spanish [content-type]
  coverage audit" — structured the same evidence-first way as this
  document — would be the correct next step, not a jump straight to
  translation.

## Part 12 — Preparation phase determination

**N/A — there is no recommended cluster to gate.** If the Director selects
Alternative B (Part 11), the correct next step is a **dedicated audit
phase** for that content type (mirroring this document's Parts 1-3
methodology, adapted to that content type's actual repository structure),
not a direct jump to translation — exactly as Phase 8J itself was run
before Phase 8I's implementation, and Phase 8H's audit-first pattern before
that. This audit is not itself that preparation phase; it only identifies
that one would be needed if Alternative B is chosen.

## Part 16 — No production expansion (explicit verification)

Verified directly against `git status`/`git diff` immediately before
finalizing this document:

- No new `/es/` production calculator pages were generated (`es/calculators/`
  is unchanged — still exactly the same 13 files, byte-identical to HEAD).
- No existing Spanish production page content changed.
- No calculator formula changed (`js/calc-utils.js` byte-identical to HEAD).
- No English calculator URL changed.
- No new Spanish sitemap URLs were introduced (`sitemap-calculators.xml`
  still exactly 13 `/es/` entries, byte-identical to HEAD once the
  read-only validator runs' incidental timestamp regeneration was reverted
  — see `reports/phase-8j-status.md` Section "Production changes").
- No navigation expansion occurred (`data/navigation.json` byte-identical
  to HEAD after revert).
- No translation-status entries were changed (`data/i18n/translation-status.json`
  byte-identical to HEAD — the 7 non-calculator fixtures remain exactly
  `es: "missing"`, untouched, not "reserved" or pre-flagged for a future
  phase).
