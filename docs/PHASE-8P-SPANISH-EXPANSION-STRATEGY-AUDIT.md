# Phase 8P — Spanish Expansion Strategy & Next-Cluster Selection

**Type:** Audit / Strategy / Gating phase. No production content was created,
translated, or modified. No commit or push occurred as part of this phase.

**Certified baseline (verified, unmodified):** `a4a6b8e64cc0dfbf308bdb1e9ec96e68febb0662`
("Phase 8O: complete Spanish core reference knowledge cluster")

## 1. Purpose

Phase 8O completed the Spanish Core Reference Knowledge cluster (Calculators
13, Glossary 100, Formulas 9, JSON-driven Reference 25 = 147 pages). Phase 8P
independently re-audits the entire remaining English corpus, scores every
untranslated family against a consistent framework, and selects the single
highest-value next Spanish expansion candidate, along with a readiness gate
(A/B/C) and an explicit definition of what Phase 8Q should do.

This document is the full evidentiary audit. `reports/phase-8p-status.md`
carries the condensed executive report in the Section-18 format the Director
specified.

## 2. Method

All counts in this document were independently re-derived from the current
repository state (`data/*.json`, `data/graph/*.json`, `data/entities/*.json`,
`scripts/generate-*.js`, `scripts/generators/*.js`, `scripts/data/*.js`,
`data/i18n/translation-status.json`, `data/indexing/crawl-rules.json`,
`data/navigation.json`, `data/search-index.json`, `sitemap-*.xml`, and actual
`.html` files on disk) — not assumed from the Director's starting hypotheses,
and not assumed from the prior Phase 8K audit. Two corrections to Phase 8K's
`docs/PHASE-8K-SPANISH-NON-CALCULATOR-COVERAGE-AUDIT.md` are noted in Section
11 below where this audit's direct inspection disagrees with it.

## 3. Post-8O Architecture Health Check

Verified directly against the current repository (all PASS, zero regressions
from the `a4a6b8e` baseline):

| Check | Result |
|---|---|
| `git diff --stat a4a6b8e -- js/calc-utils.js` | empty (byte-identical) |
| `git diff --stat a4a6b8e -- data/formulas.json data/reference.json data/glossary.json` | empty (byte-identical) |
| `node scripts/check-broken-links.js` | 0 issues, 673 pages checked |
| `node scripts/validate-url-indexation.js` | PASS, 673 pages, 625 sitemap URLs, 0 violations |
| `node scripts/validate-source-data-consistency.js` | PASS, 0 errors (academy/formulas/glossary/reference all consistent) |
| Translation drift (`js/i18n/translation-drift.js`) | 0 errors, 0 warnings |
| Spanish production count | 147 (13 calculators + 100 glossary + 9 formulas + 25 reference) |
| Spanish pages under academy/entities/guides/resources/comparisons/charts/programmatic | 0 (confirmed via `find es/<family> -name '*.html'` for all seven) |

The Phase 8O architecture is healthy and untouched. No hard-stop condition
from Section 19 of the Phase 8P spec was triggered.

## 4. Current Spanish Production Inventory (re-verified)

| Family | Spanish pages |
|---|---|
| Calculators | 13 |
| Glossary | 100 |
| Formulas | 9 |
| Reference (JSON-driven) | 25 |
| **Total** | **147** |

`es/` contains exactly 4 subdirectories (`calculators/`, `glossary/`,
`formulas/`, `reference/`) and 147 files. There is no `/es/` homepage and no
Spanish hub page for any family — every Spanish page is a leaf, consistent
with the established "no hub translation" policy carried since Phase 8N.

## 5. Remaining English Corpus — Re-Audited Counts

The Director's starting hypotheses (Academy 59, Entities 105, Guides 49,
Resources 9, Comparisons 8, Charts 10, Programmatic 44) are **partially
correct as raw file counts but mask real structural differences** uncovered
by direct inspection. Corrected, decomposed counts:

| Family | HTML files | Hub/index pages | Leaf pages | Source-of-truth architecture | Native content IDs |
|---|---|---|---|---|---|
| Academy | 59 | 9 (1 top + 8 category) | 50 | `data/academy.json`, via `scripts/populate-data.js` (same pipeline as glossary/formulas/reference) | **Yes** — `fund-01`…`vr-06`, stable, unique |
| Entities | 105 | 1 | 104 | `data/graph/entity-index.json` (fed from `scripts/data/entities-*.js`); mirrored into 10 files under `data/entities/`; **not** on `populate-data.js` | **Yes** — bare slugs (`algae`, `free-chlorine`) |
| Guides | 49 | 8 (1 top + 7 sub) | 41 | **Fragmented**: 15 from `generate-authority-guides.js`, 6 from `generate-question-pages.js`, 8 hubs from `generate-hubs.js`, **20 leaves with no generator and no data record at all** (hand-authored HTML) | **No** |
| Resources | 9 | 1 | 8 | Inline array in `scripts/generate-resource-pages.js`, no `data/resources.json` | **No** |
| Comparisons | 8 | 1 | 5 generated + 2 orphan (no generator) | Inline array in `scripts/generate-comparison-pages.js` | **No** |
| Charts | 12 files / 10 unique URLs | 1 | 9 indexable (5 from `generate-authority-charts.js`, 4 with no generator) + 2 noindex redirect-source duplicates | Inline array in `scripts/generate-authority-charts.js`; hardcoded standalone template that does **not** use `template-utils.js` `SITE_HEADER`/`SITE_FOOTER`/`chrome()` | **No** |
| Programmatic | 44 | 8 (1 top + 7 sub) | 36 (26 fully parametric across 4 templates + 10 editorial across 3 templates) | 7 generator/config pairs under `scripts/generators/`, no `data/programmatic.json` | **No** (would require synthesized `<cluster>-<param>` compound IDs) |

Total English production pages (from `data/navigation.json` / `data/indexing/crawl-rules.json`,
both 669 entries = 522 English + 147 Spanish): confirmed by independent
`pageType` census: `entity` 104, `academy` 58, `guide` 48, `programmatic` 43,
`glossary` 100, `reference` 52, `calculator` 13, `formula` 9, `chart` 9,
`resource` 8, `comparison` 7, `other` 31, `documentation` 19, `qa` 16,
`release` 4, `homepage` 1. (Hub pages are folded into either their own
`pageType` or `other` depending on family — see `data/indexing/crawl-rules.json`.)

23 files carry a `noindex` meta tag and sit outside crawl-rules/navigation/
sitemaps entirely: 16 `reference/datasets/**/index.html`, 3 `printables/*.html`,
2 `charts/*.html` (the redirect-source duplicates), 1
`calculators/volume-calculator.html`, 1 `404.html`. No content-family page is
marked non-indexable inside `crawl-rules.json` itself; the 15 rows marked
non-indexable there are all QA/reports infrastructure pages, not content.

## 6. Translation-Status Audit

`data/i18n/translation-status.json`: **151 units total.**

| category | units | es: translated | es: missing |
|---|---|---|---|
| calculator | 13 | 13 | 0 |
| glossary | 100 | 100 | 0 |
| formula | 9 | 9 | 0 |
| reference | 25 | 25 | 0 |
| academy | 1 | 0 | 1 |
| guide | 1 | 0 | 1 |
| entity | 1 | 0 | 1 |
| programmatic | 1 | 0 | 1 |
| **total** | **151** | **147** | **4** |

Zero duplicate `contentId`s. Zero legacy fixture IDs. The four `es: missing`
units are historical Phase 8D fixtures, each carrying no `_migratedFrom`:

- `academy:fund-01` → `/academy/fundamentals/understanding-pool-water-chemistry`
- `guide:ph-can-you-swim-in-high-ph-water` → `/guides/ph/can-you-swim-in-high-ph-water`
- `entity:algae` → `/entities/algae`
- `programmatic:chlorine-10000-gallon` → `/programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool`

No `resource`, `comparison`, or `chart` category exists in the file at all —
these three families have never had a translation-status placeholder created.

**Structural capacity check:** the translation-status schema (`contentId`,
`category`, `languages.{en,es}.{status,url}`) is generic and requires no
schema change to support any of the seven remaining families. Adding a new
category is additive (as Phase 8O did for `glossary`'s 46-unit expansion).
**No structural blocker exists in translation-status.json itself** for any
candidate family.

## 7. Prior-Art Inventory (what already exists that a new cluster could reuse)

1. **`js/i18n/reference-locale-scope.js`** is the only bounded-scope
   classifier module in the codebase. No equivalent exists for any other
   family. Its pattern (explicit `LEGACY_EXCLUDED` set, `getJsonDrivenScope()`
   derived from the JSON's own records, an `unexpected`-bucket safety valve,
   `EXPECTED_*_COUNT` constants re-verified every run) is directly reusable
   as a template if a bounded (non-100%) scope is chosen for any large family.

2. **`js/i18n/translation-drift.js`** already indexes Academy — its
   `buildNativeIdIndex()` loads `data/academy.json` alongside glossary/
   formulas/reference. Academy is the *only* untranslated family already
   wired into a live i18n module. Entity is not indexed there.

3. **`js/i18n/related-link-resolver.js`** indexes exactly 4 families:
   `calculator`, `glossary`, `formula`, `reference`. It supports 3 raw
   reference shapes: URL literal, `family/slug`, and bare-slug-suffix with a
   family hint. Consequence per candidate family:
   - **Academy's relationship fields already resolve correctly today,
     unmodified**, for every field EXCEPT `relatedTopics` (intra-academy):
     `relatedCalculators` is Shape 1; `relatedGlossary`/`relatedFormulas`/
     `relatedResources` are Shape 2. Adding `academy` to the resolver's index
     is only needed to resolve `relatedTopics`.
   - **Entities cannot resolve at all** — `academyIds`/`glossaryIds`/
     `formulaIds`/`referenceIds`/etc. are bare native IDs, a 4th shape the
     resolver has no index for (`buildContentIndex()` has no `byNativeId`
     map).
   - **Guides, Resources, Comparisons, Charts, Programmatic** do not work
     with the resolver at all: their relationships are either inline
     hardcoded `<a href>` markup embedded in prose strings (Guides), or
     pre-resolved `{href, label}` objects baked at authoring time
     (Resources), or `.html`-suffixed relative literals (Comparisons) — none
     of which match any of the resolver's 3 shapes.

4. **`scripts/template-utils.js` `localizeRecord(record, locale)`** is the
   embedded-`es`-merge engine. It already has two hardened special-case
   merge strategies directly reusable by future families: per-index table
   merge with per-field English fallback (built for Reference, directly
   reusable for Charts' `tableHead`/`tableRows`), and per-index array merge
   with select fields locked to the English source (built for Formula
   `variables[].symbol/unit`, a pattern reusable anywhere a machine-readable
   field must never be overridden by translated content).

5. **`ES_CHROME`** in `template-utils.js` is a ~33-key `{en, es}` dictionary
   already containing `navAcademy: 'Academia'`, `navGuides: 'Guías'`,
   `navCharts: 'Gráficos'`, `navResources: 'Recursos'`. It does **not**
   contain Academy's own content-section headings (`Key Facts`, `Examples`,
   `Common Mistakes to Avoid`, `Sources:`) — those are hardcoded directly
   inside `buildArticleContent()`, which itself takes no `locale` parameter
   at all (confirmed: `function buildArticleContent(article)`, line 346).
   `buildAcademySidebar(article, categoryArticles)` (line 639) is likewise
   locale-free.

6. **`scripts/generate-academy.js` contains zero references to `locale` or
   `localizeRecord`** (confirmed via `grep -c locale` = 0). This is the exact
   same class of gap Phase 8O found and fixed in `generate-formulas.js`/
   `generate-reference.js` (where `locale` was accepted as a parameter but
   the actual content builders never consulted it) — a well-understood,
   previously-solved problem, not a novel one.

7. **`scripts/generate-spanish-knowledge-cluster.js`** (Phase 8N/8O) is the
   reference implementation for adding a new Spanish family cluster: a small
   standalone generator, never a modification of the English generation
   loop, rendering directly from data via `generateX(record, 'es')`, with
   deterministic data-driven scope that throws on any mismatch. This is the
   contract any new cluster generator (e.g. `generate-spanish-academy-cluster.js`)
   would follow.

8. **`scripts/data/i18n-es/cluster-translations.js`** already contains
   human-reviewed Spanish anchor-label pairs for untranslated families,
   currently used only inside `/es/calculators/*` cross-link lists pointing
   at **English** targets: 76 pairs / 19 distinct hrefs for `programmatic/`,
   36 pairs / 23 hrefs for `guides/`, 30 pairs / 20 hrefs for `reference/`,
   9 pairs / 6 hrefs for `comparisons/`. This is directly reusable as page
   title/H1 material for a future Programmatic or Guides cluster, and is
   concrete evidence that some Spanish terminology work for these families
   has already happened, informally, ahead of any dedicated phase.

## 8. Family-by-Family Readiness Audit

### A. Academy

- **Content:** 50 articles across 8 categories. Total source prose ≈ 29,334
  words (avg 587/article) — the single largest body of unique editorial prose
  remaining in the site (2.6× the entire English glossary, 6× the entire
  Reference family). Each record: `overview`, `keyFacts[]`, `sections[]`
  (`{id, h2, body}`, avg 2–4 per article), `examples[]`, `commonMistakes[]`,
  `sources[]`.
- **IDs:** native, stable, category-prefixed (`fund-01`…`vr-06`), verified
  unique across all 50.
- **Relationships:** `relatedCalculators` (50/50, 88 items, Shape 1),
  `relatedTopics` (50/50, 151 items, intra-family), `relatedGlossary` (50/50,
  179 items, Shape 2 — **stored but never rendered in HTML**, a pre-existing
  English-side gap unrelated to Phase 8P), `relatedResources` (49/50, 65
  items), `relatedFormulas` (28/50, 35 items, Shape 2 — also never rendered),
  `relatedCharts` (6/50, 6 items).
- **Schema:** `Article` + `BreadcrumbList` + `Organization` — simple, standard.
- **Blockers (real, but small and precedented):** `buildArticleContent()` and
  `buildAcademySidebar()` are locale-free and hardcode English section
  headings; `generate-academy.js` has no locale wiring at all;
  `related-link-resolver.js` does not index `academy` (needed only for
  `relatedTopics`); `ES_CHROME` needs 4 new keys.
- **Verdict:** the deepest content, the cleanest architecture (same
  populate-data.js pipeline as the three already-completed families), and
  the strongest immediate internal-link payoff into the existing 147-page
  Spanish corpus — but not production-ready without the locale-aware
  rendering path Phase 8O already proved out for three sibling families.

### B. Entities

- **Content:** 104 entities across 10 types (chemical 15, problem 13,
  process 11, unit 11, equipment 10, measurement 10, pool-type 10,
  chemical-product 10, resource 8, organization 6). Per-record translatable
  prose is thin (`shortDescription` avg 13 words, `longDescription` avg 70
  words; 8,585 words total — less than the English glossary), but rendered
  pages run ~450 words each because roughly 80% of each page is cross-link
  scaffolding into other families.
- **IDs:** native, bare-word, language-neutral by convention.
- **Relationships:** the densest in the repository — 13 distinct
  relationship/keyword fields (`relatedEntities` 420 items, `keywords` 473,
  `aliases` 262, `academyIds` 189, `synonyms` 178, `glossaryIds` 113,
  `referenceIds` 103, `calculatorIds` 99, `sourceOrganizations` 95,
  `problemIds` 88, `formulaIds` 54, `resourceIds` 44, `chartIds` 25) — but
  every one of these is a **bare native ID**, a 4th relationship shape the
  resolver does not support at all (no `byNativeId` map exists).
- **Schema:** `DefinedTerm` / `DefinedTermSet` — literally the same schema
  type Glossary already uses in Spanish today. Zero schema risk.
- **Dependency on Academy:** `academyIds` (189 references) cannot resolve to
  a Spanish target until Academy itself is translated. Entities' link value
  is therefore only partially realizable in isolation.
- **Verdict:** strong knowledge-graph/AEO candidate with a proven-safe schema
  type, but requires a materially larger resolver extension (new relationship
  shape, not just a new family index) than Academy, and its full value is
  gated on Academy going first.

### C. Guides

- **Content:** 49 pages, of which **20 of 41 leaves have no generator and no
  data record at all** — hand-authored static HTML with zero attachment
  point for an embedded `es` object. Content depth is highly uneven (315–1,066
  words per rendered page). Cross-links are hardcoded `<a href>` markup
  embedded directly inside authored prose/template-literal strings — the
  worst structural property of any family for localization, since there is
  no structured relationship field to route through a resolver at all.
- **IDs:** none.
- **Schema:** inconsistent — some pages `FAQPage`, most `BreadcrumbList`
  only, no `Article` schema anywhere.
- **Verdict:** genuinely the weakest candidate. A fifth of the family has no
  generator to modify in the first place; translating it would require
  inventing a new data model for 20 pages before any localization work could
  even begin.

### D. Resources

- **Content:** 8 records (checklists/logs), inline array in
  `generate-resource-pages.js`, no native ID. Smallest content footprint in
  the site: ~3,081 words across all 9 pages combined (~340/page, mostly
  chrome). A record is largely labels (`'Printable'`, `'Free Download'`),
  short tips, and a `preview` built from helper functions producing checklist
  bullet lists or blank log-table headers.
- **Relationships:** `relatedCalcs` is pre-resolved as `{href, label}`
  objects with `href()` already baked in at authoring time — incompatible
  with the resolver without an authoring-format refactor.
- **Verdict:** small page count does **not** make this attractive per the
  Director's explicit instruction not to assume so. Translation value here
  is mostly relabeling checklist items and table headers, not meaningful new
  Spanish prose or search-intent coverage.

### E. Comparisons

- **Content:** 5 generated records + 2 hand-authored orphan pages with no
  generator at all. The generated records are the cleanest inline-authored
  structure in the repository: a 50-word `quickAnswer`, 4 `keyTakeaways`, an
  8-row `comparisonRows` matrix (`[dimension, valueA, valueB]`), 4-5
  pros/cons arrays per side, 4 `bestUseCases`, a 60-word `verdict`. ~646
  words/page.
- **Relationships:** `relatedCalcs`/`relatedEntities` as tuple arrays with
  `.html`-suffixed relative literal paths — not resolver-compatible as-is.
- **Schema:** `BreadcrumbList` only — no comparison-specific structured data
  (a pre-existing SEO gap independent of language).
- **No dedicated sitemap** — comparisons are buried inside `sitemap-other.xml`.
- **Verdict:** structurally attractive (closest of the inline-authored
  families to the proven `es: {...}` overlay model) but too small (5 real
  records, plus 2 orphans needing a generator built from scratch first) to
  be a strategic anchor cluster on its own.

### F. Charts

- **Content:** real HTML `<table>` data, not images — confirmed by direct
  inspection (only `<img>` present is the site logo). 5 records from
  `generate-authority-charts.js`; 4 chart pages have no generator at all; 2
  further pages are noindex 301-redirect-source duplicates excluded from
  navigation/sitemaps/crawl-rules entirely.
- **Architecture blocker:** the chart generator's template is fully
  self-contained and does **not** use `template-utils.js`'s `SITE_HEADER`/
  `SITE_FOOTER`/`chrome()` at all — its own hardcoded English header, footer,
  and section headings (`Quick Answer`, `Calculate Your Levels`, `Reference
  table`, `Frequently Asked Questions`) exist entirely outside the i18n
  chrome system Phase 8M/8N/8O built. Bringing Charts under i18n would
  require refactoring this template to use the shared chrome, not merely
  adding a `locale` parameter to an existing call.
- **Verdict:** the pattern needed (numeric table cells stay English-invariant,
  headers/labels translate) is proven and directly reusable from Reference —
  but the surrounding page architecture is the most divergent from the
  established i18n system of any family, and the family is small and
  organizationally split (5 generated + 4 ungenerated + 2 dead duplicates).

### G. Programmatic

- **Content:** 44 pages — 8 hubs, 26 fully parametric leaves across 4
  templates (chlorine ×11, shock ×6, hot-tubs ×5, ph ×4), and 10 genuinely
  editorial leaves across 3 templates (problems ×4, explanations ×3,
  behavior ×3).
- **Empirical de-risking of the parametric subset:** a digits-stripped diff
  between two chlorine-volume pages (10,000 gal vs 20,000 gal) produces
  exactly 2 changed lines, both cross-link anchor text — zero prose
  differences. The same test on shock/hot-tubs/ph clusters produces 22–36
  changed lines, still trivially small. **A single translated template shell
  per cluster would cover all 26 parametric pages.** The 10 editorial leaves
  require genuine per-page translation (a digits-stripped diff between two
  editorial pages in the same cluster produces 136 changed lines — 4–6× the
  parametric clusters).
- **Prior art:** `scripts/data/i18n-es/cluster-translations.js` already
  contains 76 Spanish label pairs for 19 distinct programmatic hrefs,
  human-reviewed, ready to reuse as page titles.
- **Architecture blockers:** no native content IDs (would need synthesized
  `<cluster>-<param>` compound IDs, as the one existing fixture
  `programmatic:chlorine-10000-gallon` already does informally); richest and
  most complex schema stack in the site (`WebApplication` + `Offer` +
  `FAQPage` + `HowTo`), with computed numeric answers embedded directly in
  `acceptedAnswer.text` — schema translation is subject to the same
  template-shell logic as the visible page but adds one more surface to get
  right; two dead scaffold directories (`programmatic/alkalinity/` empty,
  `programmatic/pool-sizes/` `.gitkeep`-only) and one stray non-HTML script
  sitting inside the served content directory
  (`programmatic/generate-chlorine-pages.js`) indicate this family has the
  most operational housekeeping debt of any candidate.
- **Verdict:** genuinely less risky than its reputation for the 26-page
  parametric subset specifically, but the Director's explicit instruction —
  "treat Programmatic as HIGH-RISK until proven otherwise" and "do not
  recommend Programmatic merely because it has a large page inventory" —
  still applies to the family as a whole given its schema complexity, ID
  gap, and housekeeping debt. It is a stronger *second-wave* target once the
  embedded-`es`/shared-template pattern has been proven again on a cleaner
  family.

## 9. Scoring Matrix

Each family scored 0–5 on 12 criteria (criterion 12, Risk Control, scored
5 = lowest risk). Evidence for every score is in Section 8 above and the
background inventory this document is built from; no score is invented
without a cited repository fact.

| # | Criterion | Academy | Entities | Guides | Resources | Comparisons | Charts | Programmatic |
|---|---|---|---|---|---|---|---|---|
| 1 | Search-intent value | 5 | 3 | 4 | 2 | 4 | 3 | 3 |
| 2 | Semantic coherence | 5 | 3 | 2 | 4 | 4 | 3 | 4 |
| 3 | User value | 5 | 3 | 4 | 3 | 4 | 3 | 3 |
| 4 | AEO / knowledge authority value | 5 | 4 | 3 | 2 | 3 | 3 | 2 |
| 5 | Internal-linking value | 5 | 4 | 1 | 2 | 2 | 2 | 2 |
| 6 | Translation readiness | 3 | 4 | 1 | 3 | 4 | 3 | 3 |
| 7 | i18n architecture compatibility | 4 | 2 | 1 | 2 | 2 | 1 | 2 |
| 8 | Schema readiness | 4 | 5 | 2 | 3 | 2 | 3 | 1 |
| 9 | Content quality / depth | 5 | 2 | 3 | 1 | 4 | 2 | 2 |
| 10 | Expansion scalability | 4 | 4 | 2 | 2 | 3 | 2 | 3 |
| 11 | Cluster completeness potential | 4 | 3 | 2 | 5 | 5 | 3 | 3 |
| 12 | Risk control (5 = low risk) | 4 | 3 | 1 | 3 | 3 | 2 | 2 |
| | **Total (/60)** | **53** | **40** | **26** | **32** | **40** | **30** | **30** |

Academy leads by a clear margin (53/60). Entities and Comparisons tie for
second (40/60) for different reasons — Entities on relational/schema value,
Comparisons on structural cleanliness and content quality. Guides scores
lowest (26/60), directly reflecting its fragmented, largely generator-less
architecture and worst-in-class internal-linking value.

## 10. Candidate Cluster Analysis

### Primary candidate: Academy — Fundamentals category (bounded first wave)

- **Family:** Academy.
- **Exact candidate records:** the 8 articles in the `fundamentals` category
  (`fund-01` through `fund-08`), e.g. `fund-01` =
  "Understanding Pool Water Chemistry" (the article that already carries the
  lone `academy:fund-01` translation-status fixture from Phase 8D).
- **Why coherent:** Fundamentals is the entry-point learning path for the
  entire Academy — the natural on-ramp a Spanish-speaking user would want
  translated first, and the category that already has one pre-existing
  translation-status placeholder pointed at it.
- **Search-intent relationship:** foundational "what is X" / "how does X
  work" queries, distinct from and complementary to the already-translated
  Glossary (short definitions) and Reference (tables) — Academy supplies the
  connecting explanatory narrative neither of those families provides.
- **Relationship to the existing 147 Spanish pages:** every Fundamentals
  article's `relatedCalculators` (Shape 1) and `relatedGlossary`/
  `relatedFormulas` (Shape 2) fields already resolve correctly through the
  existing resolver the moment they are rendered with `locale: 'es'` — this
  cluster would immediately produce real, non-fabricated internal links into
  the already-Spanish-complete Calculator, Glossary, and Formula corpus.
- **Terminology dependencies:** relies on the same core concepts already
  canonicalized in `data/i18n/es/terminology.json` (chlorine, pH, alkalinity,
  hardness, CYA, stabilizer) — no new terminology decisions expected.
- **Expected page count (this bounded wave):** 8 article pages. (Full-family
  completion, mirroring the glossary's 54-then-46 pattern, would follow in a
  later phase for the remaining 42 articles across 7 categories.)
- **Prerequisites:** see Section 11 (Architecture Readiness) — all four are
  small, bounded, previously-solved-pattern changes, not new architecture.
- **Risks:** highest per-article word count of any family attempted so far
  means real translation effort is proportionally larger than the glossary's
  first wave was; the `relatedGlossary`/`relatedFormulas` rendering gap
  (stored but never displayed in HTML, English or Spanish) should be
  explicitly decided on (fix now while touching the content builder, or
  document and defer) rather than silently carried forward.

### Second-priority candidate (sequenced after Academy): Entities

Entities scores competitively (40/60) and has the safest schema profile of
any family, but a meaningful fraction of its value (`academyIds`, 189
references) is inert until Academy is translated, and its resolver
requirement (a new bare-native-ID lookup shape) is larger than Academy's.
Recommended as the logical **next** cluster after Academy's architecture and
first wave land, not as an alternative to it.

### Rejected as primary: Guides, Resources, Comparisons, Charts, Programmatic

- **Guides** — lowest score (26/60); 20 of 41 leaves have no data record to
  attach an `es` object to at all. Not a defensible lead candidate.
- **Resources** — small page count is not, by itself, evidence of value
  (per the Director's explicit instruction); content is mostly relabeling of
  checklist items with limited unique Spanish-search value.
- **Comparisons** — structurally clean but too small a corpus (5 real
  records) and missing comparison-specific schema even in English; a good
  *tertiary* candidate once a larger cluster proves the pattern again, not a
  phase-anchoring one.
- **Charts** — small, organizationally split across generated/ungenerated/
  duplicate origins, and its template bypasses the shared i18n chrome system
  entirely — the single largest architecture divergence of any family.
- **Programmatic** — the parametric subset (26 pages) is genuinely
  low-risk on inspection, but the family overall carries the richest/most
  complex schema stack in the site, no native IDs, and real housekeeping
  debt (empty scaffold directories, a stray script inside the served
  content directory). Per the Director's explicit instruction to treat it
  as high-risk until proven otherwise and never recommend it purely for page
  volume, it is deferred to a later, narrowly-scoped phase targeting the
  parametric subset specifically.

## 11. Architecture Readiness — Academy-Specific Blockers

Four blockers, all small, bounded, and directly modeled on work Phase 8O
already completed for Formulas and Reference:

1. **`buildArticleContent(article)` (template-utils.js:346) takes no
   `locale` parameter** and hardcodes the English section headings `Key
   Facts`, `Examples`, `Common Mistakes to Avoid`, `Sources:`. This is the
   exact class of gap Phase 8O fixed in `buildFormulaContent`/
   `buildTermContent`/`buildRefContent` by adding a `locale` parameter and
   routing headings through `chrome()`.
2. **`buildAcademySidebar(article, categoryArticles)` (template-utils.js:639)
   is likewise locale-free** — "In This Category" / "On This Page" /
   "Calculators" sidebar headings are hardcoded English.
3. **`scripts/generate-academy.js` has zero `locale`/`localizeRecord`
   wiring** — needs the same pattern added to `generate-formulas.js`/
   `generate-reference.js` in Phase 8O: accept a `locale` parameter,
   call `localizeRecord(article, locale)`, route `PAGE_TITLE`/`H1_TITLE`/
   `META_DESCRIPTION`/hero fields through the localized record, and pass
   `chrome()`-sourced values for the standard nav/breadcrumb tokens already
   proven for Glossary/Formulas/Reference.
4. **`related-link-resolver.js` does not index the `academy` family** —
   needed only to resolve `relatedTopics` (intra-academy links) to Spanish
   targets once a target article is translated; `relatedCalculators`/
   `relatedGlossary`/`relatedFormulas`/`relatedResources` already resolve
   correctly without any resolver change.

None of these require a new architecture, a new translation-status schema,
a new terminology system, or a new generator pattern — each is an additive
extension of a module Phase 8M/8N/8O already built and proved for three
other families.

## 12. Risks and Constraints

- Academy's word volume (avg 587 words/article) means the eventual
  full-family translation is a substantially larger content-authoring effort
  than the Glossary's was, even though the architecture is cleaner. This
  argues for the bounded Fundamentals-first approach rather than an
  all-50-at-once wave.
- `relatedGlossary`/`relatedFormulas` are currently unrendered in English
  output. Deciding whether to expose them (a genuine, if small, feature
  addition) alongside the locale work, or explicitly defer that decision,
  should happen before implementation begins so scope does not silently
  grow.
- Entities' full link value depends on Academy going first — sequencing
  matters and should not be reordered without re-running this analysis.
- No family currently has a dedicated Spanish-scope classifier analogous to
  `reference-locale-scope.js`; if a bounded (non-100%) subset is chosen for
  Academy (as recommended), a small `academy-locale-scope.js`-style module
  (or an inline equivalent) should define that boundary explicitly and
  deterministically, mirroring the reference precedent, rather than via an
  ad hoc file list.

## 13. Regression Results

All commands run against the current, unmodified working tree (baseline
`a4a6b8e`), after this audit's read-only investigation:

| Check | Result |
|---|---|
| `node scripts/check-broken-links.js` | 0 issues, 673 pages |
| `node scripts/validate-url-indexation.js` | PASS, 0 violations |
| `node scripts/validate-source-data-consistency.js` | PASS, 0 errors |
| Translation drift | 0 errors, 0 warnings |
| `js/calc-utils.js` vs `a4a6b8e` | byte-identical |
| `data/formulas.json`/`data/reference.json`/`data/glossary.json` vs `a4a6b8e` | byte-identical |
| Spanish page count | 147 (unchanged) |
| Sitemap/navigation/search topology | unchanged (669 nav/crawl entries, 626 search entries, 625 sitemap URLs — all pre-audit values) |

No pre-existing stale-validator issue was newly encountered in this phase;
none of Phase 8P's checks touch the historical Phase 8M/8N Academy validator
assertions the Director referenced as already-accepted.

## 14. Determinism

This is a read-only audit phase. No generator was run in a way that mutates
tracked production output; all counts above were derived via `node -e`
one-liners against existing JSON/HTML and via `grep`/`find`, never via a
build step. `git status --short` before and after this phase's investigation
is identical (empty), confirming zero incidental production drift from the
audit itself.

## 15. Primary Recommendation

**OPTION B — PREPARATION REQUIRED.**

Academy is the correct next family (highest score, 53/60; deepest content;
already on the shared JSON pipeline; already partially resolver-compatible;
strongest immediate internal-link payoff into the existing Spanish corpus).
It is not production-ready today: `buildArticleContent()` and
`buildAcademySidebar()` are locale-free, `generate-academy.js` has no locale
wiring, and the resolver does not index `academy`. These are the same shape
of gap Phase 8O found and fixed for Formulas and Reference before that
phase's content could render correctly in Spanish — a known, bounded,
previously-solved class of work, not a new architecture.

## 16. Phase 8Q Definition

Phase 8Q should be an **architecture preparation phase**, mirroring Phase
8M's role for the Core Reference cluster. No Spanish Academy content should
be written in Phase 8Q.

**Exact preparation work:**

1. Add a `locale` parameter to `buildArticleContent()` and
   `buildAcademySidebar()` in `scripts/template-utils.js`; route the
   hardcoded English headings (`Key Facts`, `Examples`, `Common Mistakes to
   Avoid`, `Sources:`, sidebar headings) through `chrome()`, adding the
   necessary new keys to `ES_CHROME`.
2. Wire `locale`/`localizeRecord` support into `scripts/generate-academy.js`,
   following the exact pattern already proven in `generate-formulas.js`/
   `generate-reference.js` (Phase 8O): accept `locale` in the article-page
   generator function, localize title/description/summary/hero fields, pass
   the standard `chrome()`-sourced nav/breadcrumb tokens.
3. Extend `js/i18n/related-link-resolver.js` with an `ACADEMY_FAMILY`
   constant and index entry (by `id` and `slug`, same pattern as the
   existing four families) so `relatedTopics` can resolve to Spanish
   targets.
4. Design the embedded `es` schema for an Academy article record
   (`title`, `description`, `summary`, `overview`, `keyFacts[]`,
   `sections[].{h2, body}`, `examples[]`, `commonMistakes[]`) and for a
   category record (label only, for breadcrumb text — hub pages remain
   English per established policy), following the exact embedded-object
   pattern used for Glossary/Formulas/Reference.
5. Decide and document whether `relatedGlossary`/`relatedFormulas` (both
   currently stored but never rendered in English output) will be exposed
   as part of this work or explicitly deferred — do not let this expand
   silently.
6. Define a bounded scope for the first production wave (recommended:
   `fundamentals` category, 8 articles) using an explicit, deterministic
   scope definition analogous to `reference-locale-scope.js`, rather than an
   ad hoc file list.
7. Build `scripts/validate-phase-8q.js` proving: locale-aware content
   builders produce byte-identical English output at `locale: 'en'`
   (the same non-regression guarantee every prior phase has required);
   the resolver correctly resolves a synthetic translated Academy fixture
   and correctly leaves an untranslated one on English fallback; no Spanish
   Academy production pages exist yet.

**Files/modules expected to change:** `scripts/template-utils.js`,
`scripts/generate-academy.js`, `js/i18n/related-link-resolver.js`, a new
`docs/PHASE-8Q-*.md` and `reports/phase-8q-status.md`, new
`scripts/validate-phase-8q.js`/`scripts/test-phase-8q.js`.

**Explicitly deferred (not part of Phase 8Q):** writing any real Spanish
Academy content; generating any `/es/academy/*.html` file; flipping any
`academy:*` translation-status unit to `translated`; touching Entities or
any other remaining family.
