# Phase 8Q — Academy Localization Architecture Preparation

**Type:** Architecture preparation phase. Zero Spanish Academy production
content was created. No English production content was changed. No commit or
push occurred as part of this phase.

**Certified baseline (verified, unmodified):** `fc4b7c15c7371d4ce0a03ae2d4043d1677d73e21`
("Phase 8P: select Spanish Academy expansion cluster")

## 1. Phase Objective

Phase 8P selected Academy → Fundamentals (native IDs `fund-01` through
`fund-08`) as the next Spanish expansion cluster, with a readiness verdict of
**OPTION B — PREPARATION REQUIRED**. Phase 8Q's sole objective is to build the
architectural prerequisites that verdict named, so a future production phase
can translate the 8 Fundamentals articles without inventing any new
mechanism. Phase 8Q produces **zero** Spanish Academy pages, populates
**zero** `es` content on any real Academy record, and leaves the certified
147-page Spanish production corpus (13 calculators + 100 glossary + 9
formulas + 25 reference) untouched.

## 2. Baseline

Phase 8Q started from `fc4b7c15c7371d4ce0a03ae2d4043d1677d73e21` (Phase 8P
closeout), verified via `git rev-parse HEAD`, `git rev-parse origin/main`, and
`git status --short` (clean) before any file was touched. Phase 8Q makes no
commit; HEAD remains at this SHA throughout and after this phase.

## 3. Academy Architecture Before 8Q

Before this phase, `scripts/generate-academy.js`'s `generateArticle()` took no
`locale` parameter, `templates/academy-template.html` hardcoded
`<html lang="en">` and a fixed `https://waterbalancetools.com/{{SLUG}}`
canonical (both in the `<link rel="canonical">` tag and the `Article`
JSON-LD `url` field), the header nav/aria-label strings were hardcoded
English, and `scripts/template-utils.js`'s `buildArticleContent()` /
`buildAcademySidebar()` hardcoded English section headings ("Key Facts",
"Examples", "Common Mistakes to Avoid", "Sources:", "In This Category", "On
This Page", "Calculators"). `js/i18n/related-link-resolver.js` indexed
Glossary, Formula, Reference, and Calculator but not Academy. No
`js/i18n/academy-locale-scope.js`-style bounded-scope module existed. This
matches exactly what the Phase 8P audit (`docs/PHASE-8P-SPANISH-EXPANSION-STRATEGY-AUDIT.md`,
Section 6.A) found and is the reason Phase 8P's verdict was Option B, not
Option A.

One piece of prior art already existed and needed no change:
`js/i18n/translation-drift.js#buildNativeIdIndex()` already loads
`data/academy.json` and indexes `articles[].id` — Academy was already the
only untranslated family wired into a live i18n module before Phase 8Q.

## 4. Locale Plumbing (Summary)

Phase 8Q reuses, verbatim, the exact plumbing Phase 8M/8N established for
Glossary/Formulas/Reference:

- `js/i18n/html-lang.js#htmlLangAttr(locale)` for the `<html {{HTML_LANG_ATTR}}>` tag.
- `js/i18n/locale-url.js#getLocalizedCanonical(path, locale)` for the
  `{{CANONICAL_URL}}` token (used for both the `<link rel="canonical">` tag
  and the JSON-LD `Article.url` field).
- `scripts/template-utils.js#localizeRecord(record, locale)` for merging a
  record's embedded `es` object over its English fields.
- `scripts/template-utils.js#chrome(key, locale)` / `ES_CHROME` for static
  UI-chrome string localization.
- `js/i18n/related-link-resolver.js#resolveRelatedLink()` /
  `localizedHref()` for relationship-field URL resolution under Policy A.

No second implementation of any of these was created. See Section 8 (No
Second Architecture) below.

## 5. Template Changes

`templates/academy-template.html`:

- `<html lang="en">` → `<html {{HTML_LANG_ATTR}}>`.
- `<link rel="canonical" href="https://waterbalancetools.com/{{SLUG}}">` →
  `<link rel="canonical" href="{{CANONICAL_URL}}">`.
- JSON-LD `"url": "https://waterbalancetools.com/{{SLUG}}"` →
  `"url": "{{CANONICAL_URL}}"`.
- Header nav literals (`Calculator`/`Resources`/`Charts`/`Academy`/`Guides`/`About`,
  and the `aria-label`s for primary nav / search / open-menu) replaced with
  `{{NAV_CALCULATOR_LABEL}}` / `{{NAV_CALCULATOR_HREF}}` / `{{NAV_RESOURCES}}` /
  `{{NAV_CHARTS}}` / `{{NAV_ACADEMY}}` / `{{NAV_GUIDES}}` / `{{NAV_ABOUT}}` /
  `{{ARIA_PRIMARY_NAV}}` / `{{ARIA_SEARCH}}` / `{{ARIA_OPEN_MENU}}` tokens.
- `Last reviewed: {{LAST_REVIEWED}}` → `{{LAST_REVIEWED_LABEL}} {{LAST_REVIEWED}}`.

This mirrors, token-for-token, the exact change already made to
`templates/glossary-template.html` / `formula-template.html` /
`reference-template.html` in Phase 8M/8N. It was not in the Phase 8Q spec's
literal "expected file scope" list, but is included because Section 12/13 of
the spec (canonical/hreflang/schema readiness) is unachievable without it —
the generator has no way to inject a Spanish canonical or `lang` attribute
into a template that hardcodes them as fixed English strings. Every
substituted token resolves to byte-identical original text at locale `en`
(`htmlLangAttr('en')` === `'lang="en"'`, `getLocalizedCanonical(path, 'en')`
=== the exact previous hardcoded canonical string, `chrome(key, 'en')` ===
the exact previous hardcoded label) — proven in Section 18 below by
regenerating all 59 Academy pages through the full `run-all-generators.js`
pipeline and diffing against the Phase 8P baseline (zero diff).

`templates/glossary-template.html`, `formula-template.html`,
`reference-template.html`, and the Academy hub/category chrome in
`scripts/generate-academy.js#pageWrap()` were **not** touched — hub and
category pages remain English-only in Phase 8Q (see Section 8: OUT OF SCOPE
explicitly excludes Spanish hubs/category pages).

## 6. Generator Changes

`scripts/generate-academy.js#generateArticle(article, locale)`:

- `locale` parameter, default `'en'`.
- `const a = localizeRecord(article, effectiveLocale)` — overlays
  `article.es` (schema in Section 10) when present; a strict passthrough
  (returns the original object reference) at `locale !== 'es'` or when no
  `es` object exists, so English generation is provably unaffected.
- `PAGE_TITLE` / `H1_TITLE` / `META_DESCRIPTION` / hero `TITLE`/`SUMMARY` now
  read from the localized view `a` rather than the raw `article`.
- `HTML_LANG_ATTR` / `CANONICAL_URL` tokens wired via `htmlLangAttr()` /
  `getLocalizedCanonical()`.
- All 10 nav/aria/last-reviewed chrome tokens wired via `chrome()`.
- `buildBreadcrumb(article.slug, a.title, effectiveLocale)`,
  `buildArticleContent(a, effectiveLocale)`,
  `buildAcademySidebar(a, catArticles, effectiveLocale)`,
  `buildRelatedTools(a, effectiveLocale)`,
  `buildRelatedTopics(article.relatedTopics || [], allArticles, effectiveLocale)`
  — every locale-aware helper receives the locale.
- `generateHub()` and `generateCategory()` are **unchanged** — no `locale`
  parameter, no Spanish hub/category output. This is deliberate: Section 8
  of the Phase 8Q spec (and Section 3's OUT OF SCOPE list) forbids Spanish
  Academy hubs/category pages in this phase.
- `module.exports` now includes `generateArticle` (previously the file had
  no exports at all — it only ran its own generation loop) so a future
  production phase can call `generateArticle(article, 'es')` without a
  second implementation, mirroring exactly how `generate-formulas.js` /
  `generate-glossary.js` / `generate-reference.js` already export their
  locale-aware generation functions for `generate-spanish-knowledge-cluster.js`
  to consume.

`scripts/template-utils.js`:

- `buildArticleContent(article, locale)` — "Key Facts" / "Examples" /
  "Common Mistakes to Avoid" / "Sources:" headings routed through `chrome()`.
  Article body content (`overview`, `sections[].body`, etc.) is rendered
  as-is from whatever record is passed in — localization of that content
  happens one layer up, in `localizeRecord()`, before the record reaches
  this function. This function does not itself decide language for prose.
- `buildAcademySidebar(article, categoryArticles, locale)` — "In This
  Category" / "On This Page" / "Key Facts" / "Examples" / "Common Mistakes"
  / "Calculators" headings routed through `chrome()`; the "In This Category"
  sibling-article links and the "Calculators" related-calculator links now
  route through `localizedHref()` instead of a bare `href()` call, so a
  future Spanish sidebar can resolve a translated sibling article or a
  translated calculator to its Spanish URL (Policy A: English fallback
  otherwise). The visible link **label** is still derived from the
  original English `href()`/slug, never from the resolved URL, so it can
  never accidentally render a Spanish slug segment as a title-cased label.
- `buildRelatedTopics(slugs, allArticles, locale)` — already had a `locale`
  parameter from Phase 8N (used for the `chrome('relatedTopics', ...)`
  heading), but its per-item `href(slug)` call was bare. Changed to
  `localizedHref(slug, locale)`. This function is shared by both Academy's
  `relatedTopics` field and Formulas' `relatedFormulas` field; the change is
  safe for both because Academy/Formula `relatedTopics`/`relatedFormulas`
  values are always full same-family slugs (e.g.
  `academy/water-balance/understanding-ph`), which `normalizeReference()`'s
  Shape 2 (cross-family bare slug) resolves without needing a
  `targetFamilyHint` — verified directly against real data in
  `scripts/test-phase-8q.js`.
- 9 new `ES_CHROME` keys added: `academyKeyFacts`, `academyExamples`,
  `academyCommonMistakes`, `academyCommonMistakesShort`,
  `academyInThisCategory`, `academyOnThisPage`, `academyCalculatorsHeading`,
  `academyRelatedChip`. `sources` and `relatedTopics` (already existing
  Formula/Reference-era keys) are reused for Academy's identical-text
  "Sources:" and "Related Topics" headings rather than duplicated.

## 7. Academy Relationship Resolver

`js/i18n/related-link-resolver.js`:

- New export `ACADEMY_FAMILY = 'academy'`.
- `buildContentIndex()` now also `require()`s `data/academy.json` and calls
  the exact same generic `index(ACADEMY_FAMILY, academy.articles, (t) => t.id, (t) => t.slug)`
  helper already used for Glossary/Formula/Reference — no family-specific
  branching exists anywhere in this module; Academy is indexed by the
  identical code path.
- This is purely additive: it only inserts new `academy:`-prefixed entries
  into `byEnglishUrl` / `bySlugSuffix` / `byFullSlug`; it cannot collide
  with or alter any existing Glossary/Formula/Reference/Calculator entry
  (confirmed in `scripts/test-phase-8q.js` by re-running the existing
  glossary/formula/calculator resolution assertions after adding Academy
  and observing identical results).

## 8. Native ID / Slug Indexing

Academy articles are indexed by **both**:

1. Native ID lookup (via `byEnglishUrl`, keyed by the article's English URL,
   which maps to `{family: 'academy', nativeId, slug}`).
2. Bare slug-suffix lookup (via `bySlugSuffix`, keyed by `'academy:' + lastPathSegment`),
   used when a caller supplies a bare suffix like `'how-water-balance-works'`
   with `targetFamilyHint: 'academy'`.
3. Full-slug lookup (via `byFullSlug`, keyed by the article's own `slug` field
   exactly, e.g. `'academy/fundamentals/how-water-balance-works'`), used for
   Academy's own `relatedTopics` field, whose values are always full
   same-family slugs.

All three lookup paths were verified against all 8 real Fundamentals
records in `scripts/validate-phase-8q.js` checks 9a/9b and
`scripts/test-phase-8q.js` Test F.

## 9. Policy A Fallback

Unchanged from the Phase 8L-established contract, applied to Academy without
modification:

- `locale === 'en'` → always the English URL (Policy A rule 1). Verified
  with a real Fundamentals article.
- `locale === 'es'` and the target has a `translated` status in
  `data/i18n/translation-status.json` → the localized URL via
  `getLocalizedUrl()`.
- `locale === 'es'` and the target does **not** have a `translated` status
  (this is the state of every real Academy article today, including the
  pre-existing `academy:fund-01` fixture, which is `es: missing`) → falls
  back to the English URL. Verified with the real `academy:fund-01` unit.
- The target does not exist at all (bad/typo'd slug) → `{resolved: false,
  reason: 'unknown-target'}`. No URL is ever fabricated. Verified with a
  synthetic nonexistent slug.

## 10. Embedded `es` Schema

### Article records

```json
{
  "es": {
    "title": "string, required if es object present",
    "description": "string, required if es object present",
    "summary": "string, optional -- falls back to English summary if omitted",
    "overview": "string, optional -- falls back to English overview if omitted",
    "keyFacts": ["string", "... optional array -- falls back to English keyFacts if omitted"],
    "sections": [
      { "h2": "string", "body": "string (markdown-lite, same renderBody() rules as English)" }
    ],
    "examples": [
      { "title": "string", "body": "string" }
    ],
    "commonMistakes": ["string", "..."]
  }
}
```

Field rules (enforced by `localizeRecord()`'s generic shallow-merge, which
Section 12/13 of `scripts/validate-phase-8q.js` proves against a synthetic
fixture):

- **Required if the `es` object exists at all:** `title`, `description`.
  A future production validator should refuse to mark a unit `translated`
  in `translation-status.json` without both present and non-empty.
- **Optional, per-field English fallback:** `summary`, `overview`,
  `keyFacts`, `sections`, `examples`, `commonMistakes`. Any field omitted
  from `es` is read from the English record instead — `localizeRecord()`'s
  `Object.assign({}, record, record.es)` merge means an *absent* key in
  `record.es` never overwrites the English value; there is no
  `undefined`-poisoning risk.
- **Array fields are wholesale-replaced, not merged element-by-element**
  (unlike Reference's `tables[]` or Formula's `variables[]`, which need
  per-index merging to protect numeric/machine-readable sub-fields).
  Academy's arrays (`keyFacts`, `sections`, `examples`, `commonMistakes`)
  contain no machine-readable or mathematical data, so a full-array
  Spanish replacement is safe and simpler; if `es.sections` exists it must
  contain a fully translated section list (not a partial/sparse array
  merged against English by index).
- **`id`, `slug`, `category`, `lastReviewed`, `relatedCalculators`,
  `relatedArticles`(if any), `relatedFormulas`, `relatedGlossary`,
  `relatedTopics`, `sources`** are **never** part of `es` and must never be
  overridden — they are structural/relationship fields, not display text.
  (This mirrors the Formula/Reference rule that `equation`/`variables[].symbol`/`variables[].unit`
  and `tables[].headers`/`rows` numeric cells are protected from `es`
  override.)
- **Missing `es` object entirely** → `localizeRecord()` returns the record
  unchanged for any locale — the exact behavior every other family already
  has for an untranslated record. This is the current state of all 50 real
  Academy articles.

No real `data/academy.json` record carries an `es` object after Phase 8Q —
verified by `scripts/validate-phase-8q.js` check 12c.

### Category records

```json
{ "es": { "label": "string" } }
```

`category.es.label` is the **only** localizable field defined for a category
record in Phase 8Q. It exists purely for a **future** breadcrumb/UI use (e.g.
a Spanish article page's breadcrumb showing "Fundamentos" instead of
"Fundamentals") — it is not consumed anywhere in Phase 8Q's code, and no
category record carries it today. Category `description`/`icon`/`slug` are
structural and are never localized.

## 11. Category / Hub / Article Localization Boundary

Phase 8Q draws an explicit three-way distinction, per spec Section 8:

| Layer | Localized in 8Q? | Will be localized in a future production phase? |
|---|---|---|
| Article content (`generateArticle`) | Architecture ready; 0 content populated | Yes — this is exactly what Phase 8P selected |
| Category label (`category.es.label`) | Schema documented only; not read by any code | Only as a UI label inside a future Spanish *article's* breadcrumb — never a Spanish category page |
| Hub / category pages (`generateHub`, `generateCategory`) | Not touched at all | Explicitly deferred — no Spanish Academy hub is planned by this selection |

`generateHub()` and `generateCategory()` receive no `locale` parameter and
produce no Spanish output. This prevents the exact failure mode Section 3 of
the Phase 8Q spec calls out by name: "Do not silently introduce Spanish
Academy hub generation."

## 12. relatedGlossary / relatedFormulas Decision

**Decision: DEFERRED**, per the spec's stated default.

Verified directly against the current source (not assumed): `data/academy.json`
articles do carry `relatedGlossary` (179 items across 50 articles) and
`relatedFormulas` (35 items across 28 articles) fields. Neither is rendered
anywhere in the production English Academy template today —
`scripts/template-utils.js#buildArticleContent()` never reads either field,
and `buildRelatedTools()` (used for `RELATED_TOOLS`) only reads
`relatedCalculators` / `relatedCharts` / `relatedResources`. This confirms
the spec's stated default assumption is correct for this codebase: these two
relationship fields are stored data with no existing English UI, so Phase 8Q
introduces no new visible UI for them and leaves them exactly as they are —
present in the data, unrendered, unlocalized. A future phase that wants to
surface them would need to (a) decide on the UI first for English, then (b)
localize it — that decision is out of scope here.

## 13. URL / Canonical / hreflang Readiness

Verified with a synthetic, non-production fixture
(`scripts/test-phase-8q.js` Test B/H, `scripts/validate-phase-8q.js` check
18): calling `generateArticle(fixture, 'es')` on a record carrying a
synthetic `es` object produces:

- `<html lang="es">`
- `<link rel="canonical" href="https://waterbalancetools.com/es/academy/fundamentals/zz-fixture-schema-test">`
  — self-canonical, no `/es/es/` duplication, via the existing
  `js/i18n/locale-url.js#getLocalizedCanonical()` (the same function every
  other localized family uses; no second URL resolver was created).
- The JSON-LD `Article.url` field matches the canonical exactly (both come
  from the same `CANONICAL_URL` token).
- Calling `generateArticle(fixture, 'en')` on the **same** fixture (which
  carries an `es` object) produces `<html lang="en">` and the ordinary
  English canonical with no `/es/` anywhere — proving the `es` object's mere
  presence cannot leak into English output.

hreflang and language-switcher injection are **not** exercised by generating
a real file, because `scripts/inject-i18n-cluster.js` is entirely
data-driven off `data/i18n/translation-status.json` (`getAllUnits()` →
units with 2+ `translated` languages) and Phase 8Q creates no such unit for
any Academy record (see Section 15). The architecture readiness claim is
therefore: *if* a future phase adds a `translated` Academy unit and writes
its Spanish file to `es/academy/...`, `inject-i18n-cluster.js` requires zero
changes to pick it up — it already works generically for calculators,
glossary, formulas, and reference the same way. This is proven by reading
`inject-i18n-cluster.js` (confirmed: it contains no family-specific branch;
`urlToFile()` resolves any `/es/academy/...` URL the same as any other
family, and `injectHreflang()`/`injectSwitcher()` operate on generic HTML
anchors — the canonical tag and the search-nav link — present in every
knowledge-page template including the now-updated `academy-template.html`).

## 14. Schema Readiness

Verified in `scripts/validate-phase-8q.js` check 18: generating the same
synthetic fixture at both `en` and `es` produces exactly one `Article`
JSON-LD block in each (no duplicate schema), the `es` output's
`headline`/`description` reflect the localized title/description, and the
`en` output is completely unaffected by the fixture's `es` object. No
change was made to the JSON-LD `@type`, the `BreadcrumbList` schema builder
(`buildBreadcrumb()`, already locale-aware since Phase 8N for the "Inicio"/
hub-label translation, reused unchanged here), or any other schema
architecture.

## 15. Translation-Status / Drift Readiness

Phase 8Q does **not** add, remove, or modify any unit in
`data/i18n/translation-status.json`. The file remains byte-identical to the
Phase 8P baseline (151 units: 13 calculator + 100 glossary + 9 formula + 25
reference + 4 legacy single-unit fixtures, one of which — `academy:fund-01`
— is already `es: missing`). Verified in `scripts/validate-phase-8q.js`
check 24 via `git diff` against the baseline SHA.

`js/i18n/translation-drift.js#buildNativeIdIndex()` already indexed
`data/academy.json` before Phase 8Q (a pre-existing capability, not new
work) and continues to report 0 drift errors after this phase's changes —
verified directly. No change to `translation-drift.js` was needed or made.

A future production phase adding real Academy `es` content would: (1)
populate the `es` object on the chosen article record(s), (2) add or flip a
`academy:fund-0N` translation-status unit to `es: translated` only after
the Spanish file is generated and validated (the same order Phase 8N/8O
enforced for Glossary/Formula/Reference), (3) call
`generateArticle(article, 'es')` and write to `es/academy/...`. None of
this happens in Phase 8Q.

## 16. Synthetic Fixture Strategy

`scripts/test-phase-8q.js` uses fixtures constructed entirely in-memory
inside the test file (never written to `data/academy.json` or any file
under `es/`). Real production data (the 8 real Fundamentals records, the
real pre-existing `academy:fund-01` translation-status unit) is used only
for tests that need to prove behavior against something genuinely
untranslated today (Tests A, D, F) — this is safer and more honest than
fabricating a fake "translated" status, and requires no mutation of
`data/i18n/translation-status.json` (transient or otherwise) to prove Policy
A's fallback branch. Test C (a translated target) is proven via the
generic, family-agnostic nature of `resolveRelatedLink()` itself: the
function contains no `family`-specific branch anywhere in its Policy-A
decision logic (confirmed by direct source inspection, asserted
structurally in the test), so its already-proven correct behavior for a
real translated Glossary/Formula/Reference target — established in
Phase 8M/8N/8O's own test suites — applies identically to Academy inputs
that reach the same code path. Test C additionally verifies the pure URL
transformation Academy would need (`getLocalizedUrl()` on a real Academy
English URL) produces the correct `/es/academy/...` string. No file on disk
(production or test-only) is ever written under `es/academy/`.

## 17. English Byte-Identical Requirement

After every source change in this phase, `node scripts/run-all-generators.js`
was run three times consecutively (see Section 20 below for the full
determinism results) and `git diff academy/` was checked after each full
pipeline run. Result: **zero-byte diff** across all 59 Academy HTML files
(1 hub + 8 category indexes + 50 articles) for every run. The first
isolated run of `node scripts/generate-academy.js` alone (not through the
full pipeline) *did* show large diffs — this was correctly diagnosed as an
artifact of skipping the later pipeline enrichment steps
(`inject-nav.js`/`inject-trust-panels.js`/`normalize-seo-metadata.js`/etc.,
which only run as part of `run-all-generators.js`), not a real regression;
running the full pipeline confirmed byte-identical output. This matches the
exact "isolated generator vs. full pipeline" lesson already documented in
Phase 8O's own status report.

## 18. Validation Results

See `reports/phase-8q-status.md` for the numeric summary. Full validator/test
output is reproduced in that report.

## 19. Three-Build Determinism Results

`node scripts/run-all-generators.js` was run four times consecutively. Every
file that changed between any two consecutive runs was inspected and
classified:

- **Category 1 (wall-clock timestamps):** `data/navigation.json`
  (`_generated`), `data/indexing/*.json` (`generatedAt`), `qa-summary.json`
  (`buildDate`), `audit/hub-topology.md` / `audit/google/*` (`Generated:`),
  `reports/*.html` hub-meta "Last updated" strings, `sitemap*.xml`
  (`<lastmod>`), `reference/datasets/version/index.html`.
- **Category 4 (unexplained content change):** **0** files.

Every Academy file (`academy/**/*.html`), every `es/**/*.html` Spanish
production file, every `sitemap-*.xml` URL set, `data/navigation.json`'s
page-URL set, and `data/search-index.json`'s entry count were confirmed
identical run-over-run (only their timestamp fields moved). Full detail in
`reports/phase-8q-status.md`.

## 20. Explicit Statement: Zero Spanish Academy Production Pages

No file was created under `es/academy/`. `find es/academy -name '*.html'`
returns 0 results (the directory does not exist). Spanish total production
remains 147 pages (13 calculators + 100 glossary + 9 formulas + 25
reference + 0 academy). No Spanish Academy sitemap, navigation, or
search-index entry exists.

## 21. Explicit Phase 8Q Completion Gate

Phase 8Q is **implementation-complete and intentionally uncommitted**. HEAD
remains at `fc4b7c15c7371d4ce0a03ae2d4043d1677d73e21` (the Phase 8P baseline)
throughout. `git status --short` shows exactly: 4 modified production files
(`scripts/template-utils.js`, `scripts/generate-academy.js`,
`js/i18n/related-link-resolver.js`, `templates/academy-template.html`) and 5
new files (`js/i18n/academy-locale-scope.js`,
`docs/PHASE-8Q-ACADEMY-LOCALIZATION-ARCHITECTURE.md`,
`reports/phase-8q-status.md`, `scripts/validate-phase-8q.js`,
`scripts/test-phase-8q.js`). No `git commit`, no `git push`.

## 22. Next Phase Remains Unopened

Phase 8R (or whatever a future Director designates as the Academy Fundamentals
production phase) was **not started**. No `docs/PHASE-8R-*.md`, no
`reports/phase-8r-status.md`, no `scripts/validate-phase-8r.js` exists. The
Director will review this implementation before authorizing any further
work.
