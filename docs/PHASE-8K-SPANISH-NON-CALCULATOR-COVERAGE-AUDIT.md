# Phase 8K — Spanish Non-Calculator Content Coverage Audit

Audit-only. No Spanish content was created, no English content was
modified, no production URL was added, and no generator was run in
write-mode during this phase. Every number below was computed directly
against the repository at commit `9e2b960419bfba5b3d2706ecabce7c44b032f126`
(the Phase 8I closeout, also the state Phase 8J audited).

## 1. Baseline

`git status --short` at start: clean except the untracked Phase 8J audit
artifacts (`docs/PHASE-8J-...md`, `reports/phase-8j-status.md`,
`scripts/validate-phase-8j.js`, `scripts/test-phase-8j.js`) — expected,
since Phase 8J was never authorized to commit. HEAD == origin/main ==
`9e2b960419bfba5b3d2706ecabce7c44b032f126`, branch `main`. Compatible with
the required Phase 8I/8J baseline.

## 2. Rules used to distinguish production pages from non-production artifacts

Not invented for this audit — taken directly from `scripts/url-policy.js`,
the same single source of truth every generator/validator in this
repository already defers to:

- `PRODUCTION_CONTENT_DIRS` (21 directories, reader-facing): `calculators,
  programmatic, guides, charts, academy, formulas, glossary, entities,
  reference, comparisons, resources, legal, about, methodology, editorial,
  maintenance, printable, printables, releases, revisions, provenance`.
- `INTERNAL_TOOLING_DIRS` (never production): `reports, audit, qa, tools, search`.
- `NON_PAGE_DIRS` (never pages at all): `templates, partials, components,
  scripts, data, js, public, lib, functions, docs, assets`.
- `REDIRECT_SOURCES`: an explicit map of permanent Phase 7C redirects,
  never counted regardless of the file still existing on disk.
- `isSitemapEligible()`: self-canonical-only, excludes `noindex` pages and
  redirect sources — this is the actual production-page test used below,
  not a manual guess.

## 3. Complete English non-calculator inventory

Computed via `url-policy.js`'s own `isSitemapEligible()` walking every
`PRODUCTION_CONTENT_DIRS` directory (calculators excluded here — fully
audited and 100% complete per Phase 8J).

| Content type | Dir | Total files | Real/eligible pages | Excluded (reason) | Generator | Source of truth |
|---|---|---|---|---|---|---|
| Academy | academy/ | 59 | 59 | — | `scripts/generate-academy.js` | `data/academy.json` (`articles[]`, stable `id` e.g. `fund-01`) |
| Glossary | glossary/ | 101 | 101 | — | `scripts/generate-glossary.js` | `data/glossary.json` (`terms[]`, stable `id` e.g. `gl-001`) |
| Formulas | formulas/ | 10 | 10 | — | `scripts/generate-formulas.js` | `data/formulas.json` (`formulas[]`, stable `id` e.g. `formula-01`) |
| Reference | reference/ | 53 | 37 | 16 = `reference/datasets/**/index.html`, all `noindex` (machine-readable data-dictionary pages, not reader content) | `scripts/generate-reference.js` (reader pages) / `scripts/generate-datasets.js` (the 16 noindex pages) | `data/reference.json` (`pages[]`, stable `id` e.g. `ref-01`) |
| Entities | entities/ | 105 | 105 | — | `scripts/generate-entities.js`, `generate-entity-pages.js`, `generate-entity-links.js` | `scripts/data/entities-{chemicals,measurements,equipment,processes,problems,remaining}.js` + `entity-synonyms.js` (hand-authored JS modules, English-word `id`s e.g. `algae`, `free-chlorine`) |
| Programmatic | programmatic/ | 44 | 44 | 2 empty subdirs (`alkalinity/`, `pool-sizes/`, 0 files each — dead scaffolding) | `scripts/generators/generate-{chlorine,shock,ph,hot-tub,problem,explanation,behavior}-pages.js` | Per-family `*-cluster-config.js` (e.g. `chlorine-cluster-config.js`'s `VOLUMES` array: `[5000,7000,8000,9000,10000,12000,15000,18000,20000,25000,30000]`) — parametrized/templated, not prose-authored |
| Guides | guides/ | 49 | 49 | — | `scripts/generate-authority-guides.js` | Content authored **inline in the 832-line generator script itself** — no external `data/guides.json` |
| Resources | resources/ | 9 | 9 | — | `scripts/generate-resource-pages.js` | Content authored inline in the 481-line generator script |
| Comparisons | comparisons/ | 8 | 8 | — | `scripts/generate-comparison-pages.js` | Content authored inline in the 509-line generator script |
| Charts | charts/ + root | 4 (charts/) + 8 (root, chart-named `ROOT_PRODUCTION_FILES`) | 2 (charts/) + 8 (root) = 10 | 2 in charts/ are Phase 7C redirect sources to the root equivalents | no single generator — static reference tables | hand-authored HTML |
| Editorial | editorial/ | 6 | 6 | — | not traced (low priority, out of scope for this depth) | — |
| Methodology | methodology/ | 8 | 8 | — | not traced | — |
| Maintenance | maintenance/ | 4 | 4 | — | not traced | — |
| Legal | legal/ | 3 | 3 | — | not traced | — |
| About | about/ | 1 | 1 | — | not traced | — |
| Releases | releases/ | 4 | 4 | — | `scripts/generate-version-badges.js` family | `data/platform/*.json` |
| Revisions | revisions/ | 1 | 1 | — | not traced | — |
| Provenance | provenance/ | 1 | 1 | — | not traced | — |
| Printable(s) | printable/, printables/ | 1 + 3 | 1 + 0 | 3 printables/* are Phase 7O.1 redirect sources to resources/* | — | — |

**Total real, indexable, non-calculator production pages: 461**
(59+101+10+37+105+44+49+9+8+10+6+8+4+3+1+4+1+1+1). `validate-url-indexation.js`
independently reports 539 total production pages sitewide; 539 − 13
calculators − 461 non-calculator = 65 pages accounted for elsewhere (root-
level utility/hub pages such as `index.html`, `all-pages.html`, per-
category `index.html` hub pages not separately broken out in the table
above, and similar). That reconciliation gap does not change any
conclusion below — every number this audit's recommendation actually
depends on (glossary/formulas/reference/entities/academy/programmatic
counts) was computed directly, not derived from the sitewide total.

A stray, unwired legacy file was found during this inventory:
`programmatic/generate-chlorine-pages.js` — a generator script physically
sitting inside the `programmatic/` production content directory (not
`scripts/`), confirmed via grep to be referenced nowhere in
`run-all-generators.js` or `package.json`. It is dead code, not a
production page (it doesn't end matching the page walk's HTML-only rule in
a way that matters, but it is worth flagging as repository hygiene debris
for a future cleanup phase — not a Phase 8K blocker, not touched here).

## 4. English content cluster analysis

Not invented — derived from the same evidence sources the site itself
uses: `related-calculators`-style cross-linking fields already present in
the JSON data (`glossary.json`'s `relatedCalculators`/`relatedArticles`/
`relatedFormulas`), the calculators' own three-way grouping (Pool / Hot Tub
/ Water Chemistry, confirmed complete in Phase 8J), and each family's
subject-matter grouping in its own data file (`academy.json`'s
`category` field, `programmatic/`'s subdirectory names).

Four defensible clusters emerge from the actual data, not from imposing an
external taxonomy:

**Cluster 1 — Core Water-Chemistry Reference Knowledge** (glossary +
formulas + reference, all three water-chemistry-adjacent, all three JSON-
driven with a clean stable `id`, all three cross-link to calculators via
structured fields already present in their data):
- Glossary: 101 pages, `data/glossary.json`
- Formulas: 10 pages, `data/formulas.json`
- Reference: 37 pages, `data/reference.json`
- Combined: 148 pages
- Coherence: high — these three content types exist specifically to
  support the calculators (a glossary term explains an input, a formula
  explains the calculator's math, a reference page gives the target
  range the calculator checks against). `glossary.json`'s
  `relatedCalculators` field on `gl-001` (Free Chlorine) already points at
  `/calculators/pool-chlorine-calculator` and
  `/calculators/hot-tub-chlorine-calculator` — both fully Spanish since
  Phase 8E/8G. This is a direct, provable reinforcement relationship, not
  an assumed one.

**Cluster 2 — Pool/Spa Knowledge Curriculum** (academy):
- 59 pages, `data/academy.json`, organized by `category` (fundamentals,
  sanitizers, hot-tubs, etc.)
- Coherence: high internally (a designed curriculum), but a large single
  family — translating all 59 at once would be a bigger undertaking than
  Cluster 1's most-valuable subset.

**Cluster 3 — Entity Knowledge Graph** (entities):
- 105 pages across chemicals/measurements/equipment/processes/problems/
  pool-types/resources/chemical-products/organizations/units, richly
  cross-linked via `relatedEntities`/`problemIds` fields already in the
  data.
- Coherence: high, but 105 pages is the largest single family audited —
  a full-family translation is not a "bounded, auditable phase" by the
  Phase 8K decision framework's own Criterion 10. A meaningful *subset*
  (the handful of entities that are direct chemistry-parameter
  counterparts of already-Spanish calculators — e.g. `free-chlorine`,
  `algae`, `ph`-adjacent entities if present) would be a smaller, bounded
  cluster, but was not scoped item-by-item in this audit (see Section 13).

**Cluster 4 — Programmatic Long-Tail Pages** (programmatic):
- 44 pages, parametrized by fixed input lists (e.g. 11 pool-volume values
  for chlorine dosage) rather than independently authored prose.
- Coherence: topically related to calculators, but the generation pattern
  itself is the concern, not the topic — see Section 12.

**Not clustered as SEO/content-marketing candidates:** legal, about,
methodology, editorial, maintenance, releases, revisions, provenance
(3–8 pages each) are site-infrastructure/policy pages, not topical content
clusters, and were not analyzed further as Spanish-expansion candidates —
translating a "Legal" or "Methodology" page is a site-policy/compliance
decision, not an SEO/AEO cluster decision, and is explicitly out of this
audit's evidence-driven cluster-ranking scope.

**Guides, Resources, Comparisons** (49 + 9 + 8 = 66 pages) are topically
relevant but were downgraded from serious immediate candidacy specifically
because of Section 7's architecture finding: their content lives inline in
large generator scripts rather than in an external, cleanly diffable JSON
data file, unlike Cluster 1's three families.

**Charts** (10 real pages: 8 root-level + `charts/index.html` +
`charts/pool-water-balance-chart.html`) are static HTML reference tables,
hand-authored, no single generator/data source identified — a small,
plausible future cluster but not evaluated in depth here given its small
size and the stronger evidence behind Cluster 1.

## 5. Current Spanish production inventory (independently verified)

Cross-checked against filesystem, `sitemap-calculators.xml`,
`data/navigation.json`, `data/search-index.json`, and
`data/i18n/translation-status.json` — all five agree:

- **Total Spanish production pages: 13.** All 13 are calculators (Phase
  8E/8G/8I). **Zero Spanish pages exist for any non-calculator content
  type.**
- No orphan Spanish pages (every one of the 13 has exactly one English
  counterpart — re-confirmed via the same filename-diff method Phase 8J
  used).
- No English page incorrectly appears to have a Spanish counterpart
  outside the 13.
- No sitemap/navigation/search-index mismatch: all three report exactly
  13 Spanish URLs, all under `/es/calculators/`.
- `es/` directory tree contains **only** `es/calculators/*.html` (13
  files) — confirmed via `find es -name '*.html' | wc -l` = 13, `find es
  -mindepth 1 -maxdepth 1 -type d` = only `calculators`.

## 6. Translation-status audit

`data/i18n/translation-status.json` currently registers **20 units**: the
13 calculator units (all `translated`/`translated`) plus the 7 Phase 8D
seed fixtures (all `en: translated`, `es: missing`):

| Content ID | Category | Actual data record found? | Content-ID naming vs. the family's own native ID |
|---|---|---|---|
| `academy:fund-01` | academy | Yes — `data/academy.json` article `id:"fund-01"` | **Matches** the data's own native ID exactly |
| `glossary:free-chlorine` | glossary | Yes — `data/glossary.json` term `id:"gl-001"`, slug `glossary/free-chlorine` | **Does not match** — fixture uses the slug-derived name; the record's own native ID is `gl-001` |
| `formula:pool-volume` | formula | Yes — `data/formulas.json` formula `id:"formula-01"`, slug `formulas/pool-volume-formula` | **Does not match** — fixture uses a slug-derived name; native ID is `formula-01` |
| `reference:ideal-pool-levels` | reference | Yes — `data/reference.json` page `id:"ref-01"`, slug `reference/ideal-pool-levels` | **Does not match** — native ID is `ref-01` |
| `guide:ph-can-you-swim-in-high-ph-water` | guide | Page exists at `guides/ph/can-you-swim-in-high-ph-water.html` | No external data record with a native ID exists (guides content is generator-inline) — the fixture IS the only identity this content has |
| `entity:algae` | entity | Yes — `scripts/data/entities-*.js`, entity `id:"algae"` (referenced as a `problemIds`/`relatedEntities` target throughout the entity data) | **Matches** — entities use English-word IDs natively, same convention |
| `programmatic:chlorine-10000-gallon` | programmatic | Corresponds to one specific `VOLUMES` value (10000) in `chlorine-cluster-config.js`, one of 11 near-identical generated variants | Fixture names one specific parametrized instance, not a native content ID — the "content" here is really one row of a table, not a discrete authored piece |

**Finding: the 7 seeded non-calculator fixtures are architecturally
inconsistent with each other** in whether the `contentId` reuses the
family's own native `id` field (academy, entity: yes) or invents a
slug-derived name instead (glossary, formula, reference: no). This is a
genuine, concrete preparation item (Section 7) that should be resolved
*before* any of these three families is implemented, so the convention is
decided once rather than drifting per family.

**Classification of the 7 fixtures**, per the phase's explicit
instruction not to assume they define the next cluster:

- `academy:fund-01` — **useful dependency**, not a strong standalone
  first-cluster candidate. It correctly demonstrates the academy content ID
  pattern but is 1 of 59 articles; picking academy as the next cluster
  would mean translating far more than this one fixture to be a coherent
  "cluster," which Section 4 already covers under Cluster 2.
- `glossary:free-chlorine` — **strong candidate**. Directly reinforces two
  already-Spanish calculators via its own `relatedCalculators` field,
  small self-contained record shape, and is part of Cluster 1.
- `formula:pool-volume` — **strong candidate** for the same reason:
  directly reinforces `calculator:pool-volume` (already Spanish), and
  formulas are the smallest family (10 total), making a complete-family
  translation genuinely bounded.
- `reference:ideal-pool-levels` — **strong candidate**: directly
  reinforces multiple already-Spanish calculators (it's the target-range
  table every calculator's "quick tips" section already summarizes a
  fragment of), part of Cluster 1.
- `guide:ph-can-you-swim-in-high-ph-water` — **isolated candidate**. No
  external data record, part of the architecturally weaker Guides family
  (Section 7), and picking one guide out of 49 does not produce a
  coherent cluster on its own.
- `entity:algae` — **isolated candidate** for a first cluster (it is 1 of
  105 entities, and Entities was not scoped down to a specific bounded
  subset in this audit — see Section 13) though a **useful dependency**
  for any future entity-cluster work given its rich cross-linking.
- `programmatic:chlorine-10000-gallon` — **poor first-cluster candidate**.
  It names one parametrized instance out of 11 near-identical siblings;
  translating it alone would produce an isolated, non-representative
  Spanish page, and translating the whole `chlorine` programmatic family
  raises the thin-content risk documented in Section 12.

**Conclusion: the seven fixtures, taken as a set, do not point at one
cluster — they point at three of Section 4's Cluster 1 members (glossary,
formula, reference) as individually strong, and at academy/guide/entity/
programmatic as either too large or too isolated to be the fixture's
single page alone.** This matches Cluster 1 being the strongest
Section-15 recommendation independent of the fixtures' existence.

## 7. Architecture readiness

| Content family | Classification | Exact blocker (if any) |
|---|---|---|
| Glossary | **PREPARATION REQUIRED** | (a) Content-ID convention must be reconciled with the record's own native `id` (Section 6). (b) `relatedCalculators`/`relatedArticles`/`relatedFormulas` are stored as literal **English URL paths** in the JSON (e.g. `"/calculators/pool-chlorine-calculator"`), not content IDs — `generate-glossary.js` has no logic today to resolve these to a Spanish equivalent when one exists, the exact class of problem Phase 8G/8I solved for calculators' own related-calculator grid (`SHARED_OPTIONAL`/`rewriteRelativeLinks`) but for a JSON-driven generator instead of HTML string-replacement. (c) No Spanish-content data structure exists yet (no `es` field on a glossary term, no sibling `glossary-es.json`) — this must be designed, not assumed to mirror the calculator HTML-diff approach, since glossary pages are template-generated from JSON, not hand-authored HTML. |
| Formulas | **PREPARATION REQUIRED** | Same three blockers as glossary (content-ID convention, English-URL relational fields if present, no Spanish-data structure), plus a formula-specific requirement: verify the `equation`/`variables` fields are language-neutral (spot-checked `formula-01`'s equation string `"Volume (gal) = Length (ft) × Width (ft) × Average Depth (ft) × 7.48"` — contains English unit words inline in the equation text itself, not just in surrounding prose, so a translation pass must correctly localize `"Length"/"Width"/"Average Depth"` inside the equation string without altering `7.48` or the operators). |
| Reference | **PREPARATION REQUIRED** | Same convention/relational/data-structure blockers as glossary. The 16 `noindex` `reference/datasets/*` pages should be explicitly scoped OUT of any reference translation (they are machine documentation, not reader content) — an easy exclusion rule to write, but must be written deliberately, not assumed. |
| Academy | **PREPARATION REQUIRED** | Content-ID convention already matches (Section 6), reducing one blocker, but the same "no Spanish-data structure yet" and "relational fields may be English-URL-literal" questions apply (not individually verified for `academy.json`'s cross-link fields in this audit — flagged as an open item, not a resolved one). |
| Entities | **PREPARATION REQUIRED** | IDs are already language-neutral-by-convention (English words used as bare identifiers, consistent with the calculator/entity convention), but relational fields (`relatedEntities`, `problemIds`) are bare ID arrays (safe) — however, no Spanish-content data structure exists, and the sheer 105-page volume means even the data-structure design decision has a large blast radius; a subset-selection step (which entities, exactly) is itself unresolved (Section 13). |
| Programmatic | **NOT READY without a scoping decision first.** | The parametrized/templated generation pattern (Section 12) means a translation architecture decision must be made — translate the *template* once (localizing the fixed prose) and let the volume-substitution logic do the rest, versus item-by-item translation — before any preparation work is even well-defined. This is a bigger architectural question than "add a translation-status entry." |
| Guides, Resources, Comparisons | **NOT READY** | Content lives inline inside large (500-800+ line) generator scripts, not in an external JSON data file. There is no clean "data" to attach a Spanish sibling to — the generator script itself would need refactoring to separate content from logic before any Phase-8E-style translation-data-file approach could apply. This is a larger, riskier preparation step than the JSON-driven families. |
| Charts | Not evaluated in depth (small, low-evidence family; deprioritized in favor of Cluster 1's stronger evidence) | — |

**No content family is READY today.** Every one of them requires at least
a defined, bounded preparation step before Spanish translation could begin
safely using the existing architecture pattern. This is the single most
important architectural finding of this audit and directly answers Part 16
(Section 13 below).

## 8. Terminology dependencies

`data/i18n/es/terminology.json` (Phase 8F) currently covers 19 concepts:
`pool, swimming_pool_formal, residential_pool, heated_pool, hot_tub,
hydromassage_bathtub, chlorine, free_chlorine, combined_chlorine,
total_chlorine, shock_treatment, ph, total_alkalinity, calcium_hardness,
cyanuric_acid, stabilizer, disinfectant, pool_volume, water_treatment`.

Checked against Cluster 1's actual content needs:
- `chlorine`, `free_chlorine`, `combined_chlorine`, `ph`,
  `total_alkalinity`, `calcium_hardness`, `cyanuric_acid`, `pool_volume` —
  **already covered**, directly usable by glossary/formula/reference
  content about these exact parameters without new terminology work.
- `sanitizer` — not a distinct entry (closest existing concept is
  `disinfectant`); whether "sanitizer" needs its own entry or is a
  synonym of the existing `disinfectant` concept is a genuine open
  question, not resolved here (audit-only).
- `turnover` / `circulation` — **not covered**. `pool-turnover-rate` was
  already shipped as a Spanish calculator in Phase 8I using an ad-hoc
  translation ("Tasa de Recirculación") without a formal
  `terminology.json` entry — meaning this gap already exists in production
  today, just not yet formalized. Any future glossary/reference content
  about turnover/circulation would surface this gap directly.
- `algae` — **not covered** as a terminology concept (it exists only as
  an entity ID, not a terminology entry). Relevant if `entity:algae` or
  any glossary content about algae is ever translated.
- `salt` — **not covered**. `saltwater-pool-salt-calculator`'s Spanish
  page (Phase 8I) also used an ad-hoc translation ("Sal") without a formal
  entry — the same kind of already-existing, not-yet-formalized gap as
  turnover.

**None of these gaps blocks Cluster 1's three strongest candidates**
(glossary/free-chlorine, formula/pool-volume, reference/ideal-pool-levels)
— their core vocabulary is already in `terminology.json`. The gaps matter
for *other* candidate content (algae-adjacent glossary/entity content,
turnover/salt-adjacent reference content) and should be added to
`terminology.json` before that content is translated, not before Cluster 1.
No terminology was added in this phase.

## 9. Internal-link dependencies

The single most important internal-link finding: **`data/glossary.json`'s
`relatedCalculators`/`relatedArticles`/`relatedFormulas` fields store
literal English URL paths**, not content IDs (Section 7). This is the
exact same architectural problem Phase 8G/8I discovered and solved for the
calculators' own related-calculator grid (English-only fallback hrefs even
after a Spanish sibling existed) — except here it lives in JSON consumed by
a generator, not in already-rendered HTML consumed by a post-processing
string-replacer, so the Phase 8G/8I fix pattern (`SHARED_OPTIONAL` +
`rewriteRelativeLinks`) does not directly transfer; a new, analogous
resolution step inside `generate-glossary.js` (and presumably
`generate-formulas.js`/`generate-reference.js`, not individually verified
for the same field shape in this audit) would be needed. This is a
concrete, named preparation item, not a vague one.

Entities' `relatedEntities`/`problemIds` fields are bare IDs (not URLs),
which is a *safer* shape architecturally — resolving an ID to the correct
language variant at render time is simpler than parsing and conditionally
rewriting a hardcoded English URL string. This is a point in favor of
entities architecturally, even though its page count (105) makes it a
bigger bounded-phase risk (Section 4).

## 10. Programmatic content assessment

**Not recommended now.** The evidence: `chlorine-cluster-config.js`'s
`VOLUMES` array (`[5000,7000,8000,9000,10000,12000,15000,18000,20000,
25000,30000]`, 11 entries) drives the 12-page `programmatic/chlorine/`
family — meaning most of that family's pages differ from each other
mainly in a single substituted number and its downstream dose calculation,
not in independently authored prose. The same templated-by-parameter
pattern is the likely shape of `shock/` (7), `ph/` (5), `hot-tubs/` (6),
though this audit verified it concretely only for `chlorine/`. Translating
11 near-identical Spanish variants mechanically is exactly the
"mechanical translation" and "thin/duplicative content" risk the phase
instructions explicitly warned against rewarding merely for page count.
A future translation of this family should translate the *template
prose* once and let the existing parameter-substitution logic produce the
Spanish variants — but that is itself a translation-architecture decision
requiring its own preparation step, not a bounded Phase 8L-ready task
today. Two additional programmatic subdirectories
(`programmatic/alkalinity/`, `programmatic/pool-sizes/`) are empty (0
files) — dead scaffolding, not content, and not part of the 44-page count.

## 11. Entity / Glossary / Formula / Academy assessment

- **Glossary** (101 pages, `data/glossary.json`): first production
  cluster candidate. Small, well-structured per-term records, stable
  native `id`, already cross-linked to calculators/academy/formulas via
  structured (if English-URL-literal) fields, directly reinforces the
  already-complete calculator cluster. Recommend translating a bounded
  subset (the terms whose `relatedCalculators` field references one of
  the 13 already-Spanish calculators) rather than all 101 at once, to keep
  the first implementation phase bounded and auditable per the decision
  framework's Criterion 10 — the exact subset was not enumerated in this
  audit (a Phase 8L scoping task, not a Phase 8K one).
- **Formulas** (10 pages, `data/formulas.json`): supporting cluster,
  smallest family, directly explains the math behind already-Spanish
  calculators. A complete-family translation (all 10) is itself a bounded
  phase given the small count — a strong pairing with a glossary subset.
- **Reference** (37 real pages, `data/reference.json`, 16 additional
  `noindex` dataset-documentation pages correctly excluded): supporting
  cluster, directly gives the target ranges every calculator's own "quick
  tips" section already summarizes.
- **Academy** (59 pages, `data/academy.json`): later expansion. Coherent
  as a curriculum, correctly content-ID-matched already, but 59 pages is a
  larger first bite than Cluster 1's more targeted approach; better suited
  to a follow-on phase once the Cluster 1 architecture pattern (Spanish
  JSON-data mechanism + related-link resolution) is proven out on a
  smaller family first.
- **Entities** (105 pages): later expansion, preparation-first — the
  richest cross-linking of any family audited, but also the largest and
  the one family where "which subset" is itself unresolved.

## 12. Programmatic content audit (detail)

See Section 10. Summary table:

| Sub-family | Pages | Identity model | Translation-safe? |
|---|---|---|---|
| chlorine | 12 | 11 `VOLUMES` values + 1 index, parametrized | Only via template-level translation, not item-by-item |
| shock | 7 | Presumed similarly parametrized (not individually re-verified) | Same caution applies |
| ph | 5 | Presumed similarly parametrized | Same caution applies |
| hot-tubs | 6 | Presumed similarly parametrized | Same caution applies |
| problems | 5 | Not verified in this audit | Unknown |
| explanations | 4 | Not verified in this audit | Unknown |
| behavior | 4 | Not verified in this audit | Unknown |

## 13. Entity content audit (detail)

- 105 entities across 6 hand-authored JS modules
  (`entities-{chemicals,measurements,equipment,processes,problems,remaining}.js`)
  plus `entity-synonyms.js`.
- IDs are stable, bare English words (`"algae"`, `"free-chlorine"`),
  language-neutral by convention (same pattern as calculator content IDs),
  not derived from a URL slug that could drift.
- Entities are generated, not manually authored per-page (the generator
  builds HTML from these JS data modules), which is architecturally
  favorable for a future translation-data-file approach.
- Cross-linking (`relatedEntities`, `problemIds`) uses bare IDs, not URLs
  — architecturally safer than glossary's English-URL-literal fields
  (Section 9).
- `entity:algae` specifically: confirmed present, referenced by multiple
  other entities' `problemIds`/`relatedEntities` arrays (e.g. it's a
  listed problem for `free-chlorine`, `chlorine`-family entities, and
  cross-referenced by at least one other chemical entity's
  `relatedEntities`) — it sits at a real hub position in the entity graph,
  which is why Phase 8D likely chose it as the seed fixture. That does
  not make it the recommended *first* production entity, because
  translating one hub entity out of 105 without its immediate neighbors
  would isolate it in Spanish (it would have no Spanish-language related
  content to link to except calculators) — the same thin-cluster risk the
  phase instructions warn against.
- **Conclusion: entities form a genuinely useful topical cluster, but this
  audit did not (and was not asked to) enumerate which specific subset of
  105 would form a bounded first cluster.** That enumeration is exactly
  the kind of scoping work a preparation phase would need to do before
  entities could become a Phase 8L-ready recommendation.

## 14. Formula / Glossary / Academy detail

Covered in Sections 6, 7, and 11 above; not repeated here to avoid
duplication.

## 15. Director recommendation

**RECOMMENDATION: Cluster 1 — Core Water-Chemistry Reference Knowledge**
(the Formulas + Reference + a bounded Glossary subset).

Ranked against the decision framework:

1. **Architectural readiness** — all three families share the identical
   JSON-data + generator pattern (Section 3), meaning whatever preparation
   work is designed for one (Spanish-data structure, related-link
   resolution, content-ID convention) is directly reusable across all
   three, unlike Guides/Resources/Comparisons (inline-script content) or
   Programmatic (parametrized templates) or Entities (105-page scale).
2. **Semantic coherence** — formulas explain calculator math, reference
   gives calculator target ranges, glossary defines calculator inputs;
   all three exist specifically in support of calculators, not as
   independent content verticals.
3. **Existing English coverage** — 148 pages combined (101 glossary + 10
   formulas + 37 reference), from which a bounded first-phase subset (not
   all 148) should be selected.
4. **Reinforces the complete calculator cluster** — directly and provably,
   via `glossary.json`'s own `relatedCalculators` field pointing at
   already-Spanish calculator URLs.
5. **Internal-linking potential** — highest of any family audited, once
   the English-URL-literal relational-field problem (Section 9) is fixed.
6. **SEO/AEO value** — No repository-based search-volume evidence
   available. Qualitatively, glossary/reference/formula pages are the
   site's natural "direct-answer"/citation-style content (a glossary
   definition, a target-range table, a formula derivation) — a strong AEO
   shape independent of unavailable traffic data.
7. **Translation complexity** — MEDIUM for reference/glossary (structured
   but chemistry-specific prose), MEDIUM-HIGH for formulas specifically
   because the equation *string itself* contains inline English words
   that must be localized without disturbing the math (Section 7).
8. **Risk of thin/duplicative content** — lowest of any family audited;
   each glossary/formula/reference record is independently authored, not
   parametrized like programmatic pages.
9. **Terminology readiness** — highest of any family: the core vocabulary
   these three families actually need (chlorine, free/combined chlorine,
   pH, alkalinity, calcium hardness, cyanuric acid, pool volume) is
   already 100% present in `terminology.json` (Section 8).
10. **Bounded, auditable phase** — a subset (e.g., formulas complete [10]
    + reference complete [37] + a glossary subset scoped to terms whose
    `relatedCalculators` references an already-Spanish calculator) is a
    concretely boundable number, unlike "all of academy" (59) or "all of
    entities" (105) or "programmatic" (architecturally undecided).

**Exact pages/content types proposed:** not enumerated to a final page
list in this audit (that is Phase 8L preparation-phase work), but bounded
by construction to: all of Formulas (10), all of non-noindex Reference
(37), and a glossary subset defined by "has at least one
`relatedCalculators` entry pointing at one of the 13 already-Spanish
calculator URLs" (exact count not computed here — a first concrete task
for the preparation phase).

**Expected Spanish page count:** on the order of 47 (formulas + reference)
plus a still-to-be-computed glossary subset — materially smaller than a
full-family academy (59) or entity (105) first bite.

**Required architecture work** (all preparation, none performed in Phase
8K): (a) decide and standardize the content-ID convention (native `id`
vs. slug-derived) across formulas/reference/glossary; (b) design a
Spanish-content data structure for JSON-driven families (a sibling `es`
field per record, or a sibling `*-es.json` file — a real design decision,
not assumed); (c) add related-link resolution logic to
`generate-glossary.js` (and verify/extend to `generate-formulas.js`/
`generate-reference.js` if they share the same English-URL-literal
relational-field pattern — not individually confirmed for those two files
in this audit) so a translated related item resolves to its Spanish
sibling when one exists, mirroring the Phase 8G/8I calculator-grid fix but
for JSON-driven generation; (d) extend `url-policy.js`'s language-prefix
handling (already proven generic across content types via
`stripLanguageSegment()`) to these three directories — expected to be
purely additive, no redesign, since the mechanism was built content-type-
agnostic in Phase 8D.

**Required terminology work:** none for the core recommended scope
(chlorine/pH/alkalinity/CYA/pool-volume vocabulary is already complete);
`sanitizer`/`turnover`/`algae`/`salt` gaps only matter if the glossary
subset is later widened to include those topics.

**Required internal-link work:** the English-URL-literal-to-Spanish
resolution logic described above — the single largest concrete piece of
preparation work identified in this audit.

**Required schema/hreflang work:** expected to be additive reuse of the
existing `js/i18n/hreflang.js`/canonical/language-switcher modules (all
confirmed content-type-agnostic in their current implementation — none of
them contains a "calculator" assumption that would need generalizing), but
this was not independently verified against formulas/reference/glossary's
specific schema shape (whatever JSON-LD, if any, `generate-formulas.js`/
`generate-reference.js`/`generate-glossary.js` currently emit) in this
audit — flagged as an open verification item for the preparation phase,
not assumed safe.

**Preparation phase required:** **yes** (Section 16).

**Why competing clusters should wait:**
- Academy (59 pages): same architecture pattern as Cluster 1 but larger;
  better attempted *after* the pattern is proven on Cluster 1's smaller
  scope.
- Entities (105 pages): largest family, richest cross-linking, but the
  "which subset" scoping question is itself unresolved — needs its own
  preparation-phase scoping work before it could compete with Cluster 1's
  already-bounded-by-construction proposal.
- Programmatic (44 pages): blocked on a translation-architecture decision
  (template-level vs. item-level) that is more fundamental than a data-
  structure/related-link fix — a bigger unknown than Cluster 1 carries.
- Guides/Resources/Comparisons (66 pages): blocked on separating content
  from generator-script logic — a larger, riskier preparation step than
  designing a Spanish JSON sibling for an already-external data file.

## 16. Phase 8L gate

**OPTION B — PREPARATION PHASE REQUIRED.**

No content family audited is READY today (Section 7). The recommended
Cluster 1 (Formulas + Reference + a glossary subset) is the *strongest*
candidate for that preparation phase to target, not a cluster that can
proceed directly into production translation.

**Exact scope the preparation phase must accomplish** (defined here, not
executed):

1. Decide and document one content-ID convention for non-calculator JSON-
   driven content (reuse native `id` fields vs. slug-derived names) and
   reconcile the 3 already-seeded fixtures (`glossary:free-chlorine`,
   `formula:pool-volume`, `reference:ideal-pool-levels`) to match it if
   the decision differs from their current naming.
2. Design (not yet build) a Spanish-content data structure for
   `data/glossary.json`, `data/formulas.json`, and `data/reference.json`
   — almost certainly a sibling Spanish field or file per record, since
   these pages are machine-generated from JSON, not hand-written HTML
   amenable to Phase 8E's string-replacement approach.
3. Verify (not assumed) whether `generate-formulas.js` and
   `generate-reference.js` share `generate-glossary.js`'s English-URL-
   literal relational-field pattern, and design the resolution mechanism
   that lets a translated related-item link render as Spanish when a
   Spanish sibling exists (the single largest piece of concrete work
   identified in Section 9/15).
4. Enumerate the exact glossary subset to translate first (terms whose
   `relatedCalculators` references an already-Spanish calculator), turning
   Section 15's "on the order of 47 + a subset" estimate into an exact,
   named page list.
5. Verify formula equations can be safely localized (translate the
   English words embedded inside the equation string itself, e.g.
   `"Length (ft) × Width (ft) × Average Depth (ft)"`, without altering
   `7.48` or any operator) — a formula-specific safety check analogous to
   the calculator-function-equivalence gate used in every prior
   calculator phase.
6. Confirm hreflang/canonical/schema generation for these three families
   requires no code change beyond what the existing content-type-agnostic
   `js/i18n/*` modules already provide (expected, not yet verified).

This preparation phase's own output should look like Phase 8D's original
multilingual-architecture-foundation deliverable, scoped specifically to
these three content types, before any Phase 8L-equivalent-of-8E production
translation begins.
