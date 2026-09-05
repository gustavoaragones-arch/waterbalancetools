# Phase 8L — Spanish Core Reference Localization Architecture Preparation

Preparation-only. No Spanish production page, URL, sitemap entry,
navigation record, search-index record, hreflang pair, or translation was
created. Every finding below is evidence computed directly against
`data/glossary.json`, `data/formulas.json`, `data/reference.json`,
`data/i18n/translation-status.json`, and the actual generator/i18n source
at commit `7e71120bec3d5337d18013697110685e892219ec`.

## 1. Baseline

HEAD == origin/main == `7e71120bec3d5337d18013697110685e892219ec`, branch
`main`, working tree clean at start. Pre-phase production snapshot:
539 production pages, 491 sitemap URLs, 0 violations, 535 navigation
records, 492 search-index records, 13/13 calculators (English/Spanish).

## 2. Task A — Content-ID architecture decision

**CONTENT-ID STANDARD: reuse the source record's native `id` field
verbatim, prefixed by category.**

Verified directly against source data (not assumed):

| Family | Native ID field confirmed | Sample | Existing fixture | Fixture matches native ID? |
|---|---|---|---|---|
| Academy | `data/academy.json` `articles[].id` | `fund-01` | `academy:fund-01` | **Yes** |
| Entity | entity data `id` | `algae` | `entity:algae` | **Yes** |
| Glossary | `data/glossary.json` `terms[].id` | `gl-001` | `glossary:free-chlorine` | **No** — should become `glossary:gl-001` |
| Formula | `data/formulas.json` `formulas[].id` | `formula-01` | `formula:pool-volume` | **No** — should become `formula:formula-01` |
| Reference | `data/reference.json` `pages[].id` | `ref-01` | `reference:ideal-pool-levels` | **No** — should become `reference:ref-01` |

The Director's preferred decision (reuse native ID) is confirmed correct
by this evidence: every family already has a stable, unique, language-
neutral native ID (verified 100/100 unique glossary IDs, 9/9 unique
formula IDs, 25/25 unique reference IDs — Section 9), and two of five
families' existing fixtures already follow this exact convention. No
repository evidence supports a competing convention. Adopting the
slug-derived style instead (as the 3 non-conforming fixtures currently do)
would require inventing a second identity for records that already have
one, which is the exact "two competing identities for one content record"
the phase explicitly forbids.

## 3. Task B — Translation-status migration plan

| Old ID | New ID | Source record | Status to preserve |
|---|---|---|---|
| `glossary:free-chlorine` | `glossary:gl-001` | `data/glossary.json` term `id:"gl-001"`, slug `glossary/free-chlorine` | `en: translated`, `es: missing` |
| `formula:pool-volume` | `formula:formula-01` | `data/formulas.json` formula `id:"formula-01"`, slug `formulas/pool-volume-formula` | `en: translated`, `es: missing` |
| `reference:ideal-pool-levels` | `reference:ref-01` | `data/reference.json` page `id:"ref-01"`, slug `reference/ideal-pool-levels` | `en: translated`, `es: missing` |

`academy:fund-01` and `entity:algae` require **no change** — they already
match the native-ID convention.

`guide:ph-can-you-swim-in-high-ph-water` and
`programmatic:chlorine-10000-gallon` require **no change** for this
phase — Guides and Programmatic have no external native-ID data source
(Section "Guides/Resources/Comparisons" and "Programmatic" remain
out-of-scope per the phase's own exclusion list), so there is nothing to
reconcile them against. They are not touched.

**This migration was NOT executed in Phase 8L** (this is a preparation
specification, not an implementation step) — `data/i18n/translation-status.json`
remains byte-identical to the Phase 8I/8J/8K baseline, confirmed via
`git diff`. The migration plan above is what Phase 8M must apply, as a
`set`-style update (delete old key, insert new key with the same
`en`/`es` status values, same category) — never a blind delete-and-recreate
that could lose status history.

No other translation-status records require normalization under this
decision.

## 4. Task C — Spanish data model design

### Source schema, verified field-by-field (not assumed)

**Glossary** (`data/glossary.json`, 100 terms): `id, slug, term,
abbreviation, definition, explanation, whyItMatters, typicalValues,
relatedCalculators, relatedArticles, relatedFormulas, lastReviewed`.

**Formulas** (`data/formulas.json`, 9 formulas): `id, slug, title,
category, equation, variables[symbol,description,unit], explanation,
workedExample, limitations, relatedCalculators, relatedGlossary,
relatedTopics, keywords, seoTitle, metaDescription, ogTitle,
ogDescription, readingTime, lastReviewed, references`.

**Reference** (`data/reference.json`, 25 of the 37 `reference/*.html`
pages — see Section 9's important scope-narrowing finding): `id, slug,
title, description, summary, readingTime, lastReviewed, keywords,
overview, tables, notes, relatedCalculators, sources, checklists`.

The three schemas are **not identical** (formulas has `variables`/
`equation`/`workedExample`; reference has `tables`/`checklists`; glossary
has `abbreviation`/`whyItMatters`) — confirming the phase's instruction not
to assume a shared shape.

### Selected model: **OPTION 1 — Spanish fields embedded beside English fields, in the same source JSON file, under a nested `es` object per record.**

Rejected alternatives and why:

- **Option 2 (sibling Spanish data files, e.g. `glossary-es.json`)**:
  rejected as the primary mechanism. It would require every field-level
  edit to stay manually synchronized across two files with no single
  diff showing both languages together, increasing English/Spanish drift
  risk (Task K) rather than reducing it, and doubles the id-collision
  surface (both files would need identical native IDs kept in lockstep).
- **Option 3 (separate translation dictionaries keyed by content ID)**:
  this is architecturally what `scripts/data/i18n-es/cluster-translations.js`
  already does for calculators, but that mechanism works by string-
  replacing *rendered HTML* — these three families are generated *from*
  JSON, not hand-authored HTML, so there is no rendered-English-string to
  replace against; a dictionary would have to duplicate the entire English
  string as its "find" key for every field, which is exactly Option 2's
  drift risk wearing a different shape.
- **Option 1 (embedded `es` object)**: a single source-of-truth file per
  family, one diff shows both languages side by side (easy review, per
  the phase's explicit priority), a missing `es` object is trivially
  detectable as "not yet translated" (no drift-masking possible), and it
  extends cleanly to a third language later (`es`, then `fr`, etc., as
  sibling keys) without a schema redesign.

**Concrete shape** (illustrative structure only — no translated content
included, consistent with the phase's prohibition on producing Spanish
production/translation content):

```json
{
  "id": "gl-001",
  "slug": "glossary/free-chlorine",
  "term": "Free Chlorine",
  "...(existing English fields, unchanged)...": "...",
  "es": {
    "term": null,
    "definition": null,
    "explanation": null,
    "whyItMatters": null,
    "typicalValues": null
  }
}
```

A `null` (or an absent `es` key entirely) means "not yet translated" —
this is the drift-detection primitive Task K needs: the generator can
assert `es !== null && es.term` before treating a record as translatable,
with no separate status flag capable of drifting out of sync with the
data itself (unlike `translation-status.json`, which is a *derived
summary index* for build-tooling/reporting, not the source of truth for
whether translated text exists).

This design was **not implemented** in Phase 8L (no `es` object was added
to any of the three production JSON files) — `data/glossary.json`,
`data/formulas.json`, and `data/reference.json` are confirmed byte-
identical to the baseline via `git diff`.

## 5. Task D — Field-level localization matrix

**Glossary:**

| Field | Classification | Note |
|---|---|---|
| `id` | LANGUAGE-NEUTRAL | native identity, never touched |
| `slug` | LANGUAGE-NEUTRAL | English slug retained under `/es/` per Phase 8E–8I precedent (Section 8) |
| `term` | TRANSLATE | visible title |
| `abbreviation` | CONDITIONAL | some abbreviations are the same in Spanish (e.g. "pH"), some are not (e.g. "FC" for Free Chlorine has no standard Spanish equivalent) — requires per-term human judgment, not a blanket rule |
| `definition` | TRANSLATE | core prose |
| `explanation` | TRANSLATE | core prose |
| `whyItMatters` | TRANSLATE | core prose |
| `typicalValues` | CONDITIONAL | prose wrapper is TRANSLATE, but embedded numeric ranges/units (ppm, °F) are LANGUAGE-NEUTRAL and must survive unchanged |
| `relatedCalculators` | DERIVED | resolved at render time by the link resolver (Task E/Section 6), not hand-translated |
| `relatedArticles` | DERIVED | same |
| `relatedFormulas` | DERIVED | same |
| `lastReviewed` | LANGUAGE-NEUTRAL | date, unchanged |

**Formulas:**

| Field | Classification | Note |
|---|---|---|
| `id`, `slug` | LANGUAGE-NEUTRAL | |
| `title` | TRANSLATE | |
| `category` | LANGUAGE-NEUTRAL | internal grouping key, never rendered as-is |
| `equation` | CONDITIONAL — see the dedicated Formula Safety Contract, Section 7 | contains inline English words in 8/9 formulas; requires special handling, not a plain TRANSLATE |
| `variables[].description` | TRANSLATE | e.g. "Pool length in feet" |
| `variables[].symbol` | LANGUAGE-NEUTRAL | `L`, `W`, `7.48` — never translated |
| `variables[].unit` | LANGUAGE-NEUTRAL | `ft`, `gal/ft³` — never translated |
| `explanation` | TRANSLATE | prose |
| `workedExample` | TRANSLATE — numbers untouched | prose narrative around numbers; the numbers themselves (`17,234 gallons`) are LANGUAGE-NEUTRAL within the translated sentence |
| `limitations` | TRANSLATE | prose |
| `relatedCalculators`, `relatedGlossary`, `relatedTopics` | DERIVED | resolved by the link resolver; **relatedGlossary contains 14 broken/dangling reference occurrences (13 unique missing glossary terms) across 7 of 9 formulas** (Section 6) — the resolver must tolerate this, not crash |
| `keywords` | TRANSLATE | Spanish SEO keywords are a distinct, non-mechanically-derived list, not a translation of the English array item-by-item |
| `seoTitle`, `metaDescription`, `ogTitle`, `ogDescription` | TRANSLATE | metadata |
| `readingTime` | CONDITIONAL | "3 min read" — the number is language-neutral, the word "read" is translated (matches the existing calculator pattern already solved in Phase 8E) |
| `lastReviewed` | LANGUAGE-NEUTRAL | |
| `references` | DO NOT TRANSLATE | citation titles (e.g. "Pool & Hot Tub Alliance — Pool & Spa Operator Handbook, 2022") are proper names/titles of English-language source documents; translating them would misrepresent the citation |

**Reference** (scoped to the 25 JSON-driven pages only — Section 9):

| Field | Classification | Note |
|---|---|---|
| `id`, `slug` | LANGUAGE-NEUTRAL | |
| `title`, `description`, `summary` | TRANSLATE | |
| `readingTime` | CONDITIONAL | same as formulas |
| `keywords` | TRANSLATE | same as formulas |
| `overview` | TRANSLATE | prose |
| `tables` | CONDITIONAL | table *labels/headers* TRANSLATE; numeric range values (ppm/°F targets) LANGUAGE-NEUTRAL — not independently verified field-by-field for all 25 records in this audit, flagged for the Phase 8M implementer to confirm per-record |
| `notes` | TRANSLATE | prose |
| `relatedCalculators` | DERIVED | resolved by the link resolver |
| `sources` | DO NOT TRANSLATE | same reasoning as formulas' `references` |
| `checklists` | CONDITIONAL | checklist item labels TRANSLATE; any embedded numeric/unit values LANGUAGE-NEUTRAL |

## 6. Task E/F — Relationship inventory and link-resolution architecture

**Relationship inventory** (computed directly, not assumed):

| Family | Field | Target type | Current shape | Language-safe? | Required resolution |
|---|---|---|---|---|---|
| Glossary | `relatedCalculators` | calculator | English URL path (`/calculators/...`) | No | Resolve to Spanish sibling if translated |
| Glossary | `relatedArticles` | academy | academy slug (e.g. `academy/sanitizers/understanding-free-chlorine`) | No (academy has no Spanish yet) | Resolve when academy is translated later; fall back to English today |
| Glossary | `relatedFormulas` | formula | formula slug (e.g. `formulas/liquid-chlorine-formula`) | No | Resolve to Spanish sibling once formulas are translated |
| Formulas | `relatedCalculators` | calculator | English URL path | No | Same resolver as glossary |
| Formulas | `relatedGlossary` | glossary | **bare slug-suffix string** (e.g. `"pool-volume"`, not `"glossary/pool-volume"` and not the native ID `gl-057`) — a **third, different reference shape** from the other two families | No, and **14 reference occurrences (13 unique missing glossary terms, since `turnover-rate` is referenced twice) across 7 of the 9 formulas point at glossary slugs that do not exist** (`turnover-rate`, `soda-ash`, `ph-buffering`, `salt-chlorinator`, `sodium-chloride`, `salt-level`, `chlorine-lock`, `uv-degradation`, `pump-head-pressure`, `pool-circulation`, `lsi`, `corrosion`, `scaling`) — a pre-existing English-content data-quality gap, not a Phase 8L defect, but the resolver must tolerate it | Resolver must (a) normalize this shape to match glossary's actual slug/ID space, and (b) silently and safely skip a reference that resolves to nothing, never crash the build |
| Formulas | `relatedTopics` | **cross-family** — confirmed to reference both `formulas/*` and `reference/*` slugs (e.g. `formula-07`'s `reference/cya-matrix`, `formula-08`'s `reference/pump-sizing` — both verified to exist in `reference.json`, not broken) | bare slug, unprefixed by family | No | Resolver must detect the target family from the slug's leading path segment, not assume same-family |
| Reference | `relatedCalculators` | calculator | English URL path | No | Same resolver as glossary/formulas |

Reference has **no** `relatedGlossary`/`relatedArticles`/`relatedFormulas`
field at all (confirmed absent from its schema) — a narrower relationship
surface than the other two families.

**Conclusion: Glossary is not the only family with the English-URL-literal
problem — all three share it for `relatedCalculators`, and Formulas
additionally has two more relationship shapes (bare-slug same-family,
bare-slug cross-family) that Glossary and Reference don't have.** A single
fix scoped to Glossary alone would leave Formulas with three unaddressed
variants of the same underlying problem.

**Resolver design** (specification only — not implemented):

```
resolveRelatedLink(sourceLang, targetRef, targetFamily):
  1. Normalize targetRef to a canonical (family, nativeId) pair:
     - English URL path  -> strip /calculators/, /glossary/, etc. prefix,
       look up by slug within that family's data
     - bare same-family slug (formulas' relatedGlossary/relatedTopics
       shape) -> look up within the inferred family's slug index
     - if no match found in any family's slug/id index -> return
       { resolved: false } (never throw)
  2. Look up translation-status.json for that (family, nativeId)'s
     es.status.
  3. If sourceLang === 'en': always return the English URL (English pages
     never change their existing linking behavior -- explicitly required,
     Section "fallback policy" below).
  4. If sourceLang === 'es':
     - es.status === 'translated' -> return the Spanish URL
       (/es/<family>/<slug>)
     - es.status !== 'translated' or unresolved -> apply the fallback
       policy (below)
```

This operates at the data-resolution/generation level (a function called
while building each page's HTML), **not** as post-build string
replacement — directly satisfying the phase's explicit architectural
requirement, and a deliberate structural improvement over Phase 8G/8I's
`SHARED_OPTIONAL` HTML-string-rewrite approach, which only works because
calculators are hand-authored HTML with a small, fixed set of known
strings; a JSON-driven family with 100+ records needs a data-level
resolver, not a growing list of string pairs.

**Reusability**: the same resolver design is intended to serve Glossary,
Formulas, and Reference today, and Academy/Entities later — its inputs
(a normalized (family, nativeId) pair and a translation-status lookup) are
already family-agnostic. This was **not implemented or wired into any
generator** in Phase 8L; the design is the deliverable.

**Fallback policy (explicit decision, not invented silently):**

**Policy A — retain the English target when no Spanish translation
exists**, matching the exact behavior already shipped and accepted in
Phase 8E–8I (`rewriteRelativeLinks()`'s English-fallback branch, and the
"Spanish → English page only when no Spanish equivalent exists" rule
Phase 8G/8I/8K's own text already states as the established policy). This
is chosen over Policy B (suppress the link) because: (a) it is the
already-proven, already-accepted precedent, not a new decision requiring
separate justification; (b) suppressing a related link entirely removes
real user-facing navigational value and internal-link equity for no
crawlability benefit (an English-fallback link is still a real, live,
indexable, useful page — a Spanish-speaking user reaching an English
glossary/formula page via a Spanish page's related-link is a materially
better outcome than a dead end); (c) consistency — mixing "sometimes
suppress, sometimes fallback" across content types would itself create a
confusing, undocumented inconsistency Phase 8K's own findings warned
against.

## 7. Task H — Formula equation safety audit (10/10 — 9 formula records + 1 hub page)

All 9 `data/formulas.json` records were inspected directly (the 10th
"formula" in Phase 8K's page count is `formulas/index.html`, a hub page
with no equation to audit — confirmed, not assumed).

| ID | Equation contains natural-language words? | Numeric constants | Pure-symbolic risk |
|---|---|---|---|
| formula-01 | **Yes** — `Volume`, `Length`, `Width`, `Average Depth` inline | `7.48` | Low (already Phase 8K's flagged example) |
| formula-02 | **Yes** — `Fluid ounces`, `Target FC`, `Current FC`, `Pool Volume`, `Chlorine Strength %` | `0.013344` | Low |
| formula-03 | **Yes** — `Shock dose`, `Target FC`, `Current FC`, `Volume`, `Available Chlorine` | `0.013344` | Low |
| formula-04 | **N/A — not a mathematical equation at all.** The `equation` field contains a full explanatory paragraph ("No single validated dosing equation is published here...") — a genuinely distinct case not anticipated by a one-size equation-safety rule | none | None — pure prose, TRANSLATE in full, no math to preserve |
| formula-05 | **Yes** — `Sodium bicarbonate`, `Desired TA Increase`, `Volume` | `0.000224` | Low |
| formula-06 | **Yes** — `Salt to add`, `Target ppm`, `Current ppm`, `Volume` | `0.0000834` | Low |
| formula-07 | **Yes** — `CYA to add`, `Target CYA`, `Current CYA`, `Volume` | `0.000133` | Low |
| formula-08 | **Yes** — `Turnover Time`, `Pool Volume`, `Pump Flow Rate` | none (pure ratio) | Low |
| formula-09 (LSI) | **No** — nearly pure acronym/symbol notation (`LSI`, `TF`, `CHF`, `TAF`) | `12.1` | **Lowest risk of all 9** — closest to already-safe |

**8 of 9 formulas contain inline natural-language English words embedded
directly in the equation string** (confirming Phase 8K's formula-01
finding generalizes to nearly the whole family, not an isolated case).
**1 of 9 (formula-04) is not an equation at all.** **1 of 9 (formula-09) is
the least risky, being nearly symbol-only already.**

### Formula-Equation Safety Contract

The future implementation MUST preserve, byte-for-byte, across any
Spanish variant of an equation string:

1. All numeric constants exactly (`7.48`, `0.013344`, `0.000224`,
   `0.0000834`, `0.000133`, `12.1` — verified list, not "constants in
   general").
2. All mathematical operators (`=`, `×`, `÷`, `+`, `−`) unchanged.
3. All symbolic variable identities (`L`, `W`, `D`, `TF`, `CHF`, `TAF`,
   `LSI`) unchanged — these are not translated even when they stand for a
   translated concept.
4. Unit abbreviations attached to numbers (`ft`, `gal`, `ppm`, `%`,
   `hours`) — classified CONDITIONAL: the abbreviation itself is
   LANGUAGE-NEUTRAL (matches international convention), but the plain
   English label word preceding it (`Volume`, `Length`, `Target ppm`) is
   the TRANSLATE part.

**A structured equation representation (separating the natural-language
label strings from the operators/constants/symbols into distinct fields,
e.g. `equationTemplate` + a `labels` map) should be introduced before
Phase 8M translates any formula** — auditing 9 formulas by eyeballing a
single flat string for accidental corruption does not scale safely and is
exactly the "formula or input semantics that require special handling"
risk category the phase asked to identify. This was **not implemented**
in Phase 8L (no change was made to `data/formulas.json`); it is a
concrete requirement for Phase 8M's own preparation step, or an earlier
sub-step of Phase 8M itself, not optional polish.

**Original English equation strings remain the canonical source of truth**
in all cases — a Spanish equation label is a presentation-layer rendering
choice, never a fork of the calculation semantics (directly consistent
with every prior calculator phase's non-negotiable formula-preservation
rule, extended here to formula *documentation* pages, which do not
themselves execute code but must not misrepresent the math they document).

No production formula was translated or altered in Phase 8L.
`data/formulas.json` confirmed byte-identical to baseline via `git diff`.

## 8. Task I — Schema / metadata / hreflang readiness

Inspected the actual generator source, not assumed:

| Mechanism | Glossary | Formulas | Reference | Classification |
|---|---|---|---|---|
| `<html lang="en">` | Hardcoded literal in the template string (`scripts/generate-glossary.js` line 55) | Hardcoded literal (`scripts/generate-formulas.js` line 42) | Hardcoded literal (`scripts/generate-reference.js` line 62) | **ADDITIVE IMPLEMENTATION REQUIRED** — none currently calls `js/i18n/html-lang.js`'s `htmlOpenTag()`; each generator's template must be parameterized (small, well-scoped change per generator) |
| Canonical URL | `canonicalUrl()` from `scripts/template-utils.js`, which delegates to `js/url/url-engine.js`'s apex-only, single-language `canonicalUrl()` | Same | Same | **ADDITIVE IMPLEMENTATION REQUIRED** — the language-aware equivalent (`js/i18n/locale-url.js`'s `getLocalizedCanonical()`) already exists and is proven in production for calculators; these generators simply don't call it yet |
| hreflang | **Not generated at all** by any of the three generators (zero matches for "hreflang" in all three files) | Same | Same | **ADDITIVE IMPLEMENTATION REQUIRED** — `js/i18n/hreflang.js`'s `buildHreflangSet()`/`validateHreflangSet()`/`reciprocityCheck()` already exist, content-type-agnostic, proven for calculators; needs wiring in, not redesigning |
| Language switcher | Not generated | Not generated | Not generated | **ADDITIVE IMPLEMENTATION REQUIRED** — `js/i18n/language-switcher.js` is already content-type-agnostic (confirmed in Phase 8D/8E); needs wiring in |
| JSON-LD schema | Present (not itemized field-by-field in this audit — flagged as an open item) | Present | Present | **ADDITIVE REQUIRED, exact scope UNKNOWN** — needs the Phase 8M implementer to confirm each family's specific JSON-LD shape (`WebPage`? `DefinedTerm`? `BreadcrumbList`?) before deciding what, if anything, needs a Spanish-language `inLanguage` field or translated `name`/`description` |
| Sitemap eligibility | Governed by `url-policy.js`'s `isSitemapEligible()`, already confirmed language-prefix-aware via `stripLanguageSegment()` (proven working for `/es/calculators/...` since Phase 8E) | Same | Same | **ALREADY SUPPORTED** — no change needed; `stripLanguageSegment()` was built generically, not calculator-specific |
| Navigation/search-index language-awareness | `generate-navigation.js`/`generate-search-index.js`'s `TRANSLATED_ES_URLS` gate (Phase 8F) is built off `translation-status.js`'s `getAllUnits()`, filtered by `es.status === 'translated'` — already category-agnostic, not calculator-specific | Same | Same | **ALREADY SUPPORTED** — confirmed by reading the gate's own filter logic, which has no calculator-specific branch |

**Nothing is BLOCKED.** Every mechanism is either already supported
generically (sitemap eligibility, nav/search-index gating) or requires
additive, well-scoped wiring into three generator files (html lang,
canonical, hreflang, language switcher) using primitives that already
exist and are already proven — no architectural redesign of any `js/i18n/*`
module is required. This directly answers Section 12's requirement not to
assume language-agnosticism without proof: it is proven here by reading
the generators' own source, not inferred from the modules' age or intent.

## 9. Task J — URL architecture

**Confirmed future rule: identical to the Phase 8E–8I precedent, no new
policy needed.**

- English: `/glossary/free-chlorine`, `/formulas/pool-volume-formula`,
  `/reference/ideal-pool-levels` (unchanged).
- Spanish: `/es/glossary/free-chlorine`, `/es/formulas/pool-volume-formula`,
  `/es/reference/ideal-pool-levels` — **English slug retained under the
  `/es/` prefix**, exactly as Phase 8E established for calculators and as
  this phase's own instructions require (no localized-slug support exists
  or is being added).
- Canonical: each language version is self-canonical (never
  cross-canonicalized) — same rule as calculators, enforced by the same
  `url-policy.js` mechanism (`isSitemapEligible()`'s self-canonical-only
  check), which is already generic.
- Language-prefix handling / duplicate-prefix prevention: already proven
  via `stripLanguageSegment()` (Section 8) — no `/es/es/` construction is
  possible through the existing resolver, the same guarantee already
  validated for all 13 Spanish calculators in every prior phase's
  validator.
- Redirect interaction: none of the 25 Reference JSON-driven records, 9
  Formulas, or 100 Glossary terms is a `url-policy.js` `REDIRECT_SOURCES`
  entry (checked directly) — no redirect-interaction edge case exists for
  the recommended scope.
- Language switcher: not yet wired into these three generators (Section
  8) — additive work, no new URL-architecture question.

**Important scope-narrowing finding not present in the Phase 8K
inventory**: `reference/` contains 37 real pages, but only **25** are
generated from `data/reference.json`'s clean, JSON-driven, `knowledge-*`-
templated architecture (confirmed via template class-name comparison —
these 25 share `knowledge-hero`/`knowledge-card`/`knowledge-layout`
classes with Academy/Glossary/Formulas). The remaining **12** pages
(`chlorine-explained.html`, `calcium-hardness-explained.html`,
`free-chlorine-explained.html`, `combined-chlorine-explained.html`,
`cyanuric-acid-explained.html`, `total-alkalinity-explained.html`,
`shock-treatment-explained.html`, `salt-water-generator-explained.html`,
`common-pool-chemistry-mistakes.html`, `pool-chemicals-explained.html`,
`pool-chemistry-reference.html`, `calculator-directory.html`, and
`index.html`) use a structurally different, older template (`chart-table`/
`credibility`/`key-takeaways` classes, introduced per `git log` in Phase
7R) with **no corresponding JSON data source found** in this audit. **This
Phase 8L preparation architecture applies only to the 25 JSON-driven
Reference pages.** The other 12 are architecturally equivalent to
Guides/Resources/Comparisons (content not separated from
markup/generation) and remain explicitly out of scope, exactly as Phase
8K already excluded that family shape — this finding simply identifies
that Reference is not internally uniform the way Phase 8K's single "37
pages" figure implied.

## 10. Task K — Data drift / source-of-truth model

Minimum translation-status metadata to detect drift, using only the
existing repository-based mechanisms (no new CMS):

1. **Missing-treated-as-translated**: prevented structurally by the Task C
   `es` object design — a generator can assert `es && es.term` (or
   equivalent per field) before treating a record as renderable in
   Spanish; there is no separate boolean that can lie about the data's
   actual state.
2. **Stale Spanish copy**: add a `esLastReviewed` field (mirroring the
   existing `lastReviewed` field's format) inside each record's `es`
   object; a validator can flag `esLastReviewed < lastReviewed` as
   "Spanish copy predates the current English content" — the same
   git-log-based `lastmod` philosophy `generate-sitemaps.js` already uses
   for freshness (Phase 7O), applied to translation freshness instead of
   sitemap freshness.
3. **English record deletion leaving orphan Spanish content**: because
   Task C embeds `es` *inside* the same English record (not a sibling
   file), deleting the English record automatically deletes its Spanish
   content — structurally impossible to orphan, by construction. This is
   a concrete advantage of Option 1 over Option 2 not previously stated:
   Option 2 (sibling files) would have needed an explicit cross-file
   existence check to catch this; Option 1 needs none.
4. **Changed English slug breaking pairing**: not possible under the
   native-ID convention (Task A) — the `es` object lives under the native
   `id`, and the slug is a separate field that can change independently
   without breaking the Spanish pairing (unlike calculators, whose
   content ID today is itself slug-derived — a difference worth noting:
   these three families are *more* robust to a future slug rename than
   calculators currently are, because their native ID was never
   slug-derived to begin with).
5. **Changed native ID breaking pairing**: native IDs are treated as
   permanent once assigned (same discipline the project has already
   applied to calculator content IDs across 8D–8K) — not expected to
   change, and no repository evidence of any family's native ID ever
   changing historically.
6. **Relationship changes leaving stale Spanish links**: not applicable
   under the Task E resolver design — relationships are resolved at
   render time from current data, never cached/duplicated into the
   Spanish content, so a relationship change is picked up automatically
   on the next build (same "always regenerate from current source"
   philosophy the whole i18n architecture has followed since Phase 8D).
7. **Schema metadata inconsistency**: covered by Section 8's additive
   JSON-LD wiring requirement — not a separate drift risk once that wiring
   exists, since schema would be generated from the same `es` object as
   everything else, not authored independently.

No implementation of this drift-detection mechanism was performed in
Phase 8L — this is the specification Phase 8M (or a validator introduced
alongside it) must build.

## 11. Task L — Phase 8M implementation architecture

| # | Component | Existing module | Required change | New module? | Input | Output | Validation |
|---|---|---|---|---|---|---|---|
| 1 | Content identity | none (ad hoc) | Migrate 3 fixtures (Section 3) | No | `data/{glossary,formulas,reference}.json` native `id` | `<family>:<native-id>` content ID | Uniqueness + no-duplicate-identity check |
| 2 | Translation status | `data/i18n/translation-status.json` + `js/i18n/translation-status.js` | Apply the 3-fixture ID migration; add new units only after real Spanish content exists (never pre-flagged) | No | migration plan (Section 3) | updated `translation-status.json` | Existing `validate-phase-8*.js` pattern (schema/duplicate checks) |
| 3 | Spanish data storage | none yet | Add `es` object per record (Task C) | No — same JSON files, additive field | English record | English record + `es` sibling object | JSON schema validation per family |
| 4 | Translation generation | none yet | New: a Spanish-mode pass for `generate-glossary.js`/`generate-formulas.js`/`generate-reference.js` (or three small sibling scripts, matching the `generate-spanish-cluster.js` naming precedent) | **Yes** — one new generator (or 3 small ones) per family, reusing each family's existing template functions with `getLocalizedCanonical()`/`htmlOpenTag()` substituted in | `es` object data + existing template | `/es/<family>/<slug>.html` | Determinism (repeat-build byte-identity), the same discipline `generate-spanish-cluster.js` already proves for calculators |
| 5 | Related-link resolution | none yet | New: `resolveRelatedLink()` (Section 6) | **Yes** — one new, family-agnostic module (candidate location: `js/i18n/related-link-resolver.js`, alongside the other `js/i18n/*` modules) | relationship field value + source language + translation-status | resolved URL (en or es) | Confirm 0 crashes against the 13 known-broken `formulas.json` references (Section 6) — a required, explicit regression test |
| 6 | URL generation | `js/url/url-engine.js`, `js/i18n/locale-url.js` | None — already language-aware and content-type-agnostic | No | English slug + language code | localized URL | Already covered by existing `getLocalizedUrl`/`getLocalizedCanonical` tests |
| 7 | hreflang | `js/i18n/hreflang.js` | Wire into the 3 new Spanish-mode generators (Section 8) | No | en/es URL pair | reciprocal hreflang tags | `reciprocityCheck()` already exists |
| 8 | Canonical | `js/i18n/locale-url.js` | Same wiring | No | | | Existing self-canonical-only `isSitemapEligible()` check |
| 9 | Schema | generator-specific JSON-LD blocks | Needs the exact per-family shape audited first (Section 8's open item) | Possibly, once audited | | | JSON-LD parse validity, same pattern every prior phase used |
| 10 | Navigation | `scripts/generate-navigation.js` | None — `TRANSLATED_ES_URLS` gate already category-agnostic | No | | | Existing Phase 8F test pattern |
| 11 | Search index | `scripts/generate-search-index.js` | None — same gate | No | | | Same |
| 12 | Sitemap | `scripts/generate-sitemaps.js`, `url-policy.js` | None — `stripLanguageSegment()` already generic | No | | | Existing `validate-url-indexation.js` |
| 13 | Language switcher | `js/i18n/language-switcher.js` | Wire into the 3 new Spanish-mode generators | No | | | Existing pattern |
| 14 | Fallback behavior | Task E resolver | Implement Policy A (English fallback) inside the resolver | (part of #5) | | | Explicit test: an untranslated related target renders as an English link, never a broken one |
| 15 | Validation | none yet | New: `validate-phase-8m.js` (future), following the exact convention of every `validate-phase-8*.js` in this repository | **Yes**, in Phase 8M | | | |
| 16 | Deterministic build | existing `npm run build` pipeline wiring pattern (Phase 8E's two-slot `run-all-generators.js` insertion) | Insert the 3 new Spanish-mode generators after their English-mode counterparts, before navigation/search-index/sitemap regeneration — the exact ordering pattern Phase 8E/8F/8G/8I already established and proved | No new orchestration concept | | | 3-consecutive-build byte-identity, same discipline as every prior phase |

This table is intended to be detailed enough that Phase 8M's engineer can
begin implementation directly from it without re-deriving the
architecture from scratch — consistent with the phase's explicit
instruction.

## 12. Task M — Readiness classification

See Section 13 (Readiness) below for the final table; rationale:

- **Formulas: REQUIRES ADDITIONAL PREPARATION.** Every other family's
  blockers are pure wiring (additive). Formulas additionally carries two
  unresolved, concrete risks that are not "wiring": (a) the equation
  natural-language-word extraction needs a structured representation
  designed and built (Section 7 — explicitly flagged as needed *before*
  translation, not merely additive metadata plumbing), and (b) the
  `relatedGlossary` bare-slug shape plus its 14 broken reference occurrences need the
  resolver's normalization+tolerance logic proven working against this
  exact family before it's safe to trust in production, not just
  specified on paper.
- **Reference: REQUIRES ADDITIONAL PREPARATION**, for a different reason
  than Formulas — the family itself is not uniform (Section 9's 25-vs-37
  finding). Before Phase 8M can treat "Reference" as a single scoped unit,
  the exact 25-page JSON-driven subset must be the *only* one referenced
  by any Phase 8M content-ID/manifest work, and this needs to be
  explicitly re-confirmed as the scope boundary at Phase 8M's start (a
  one-line gate, not a large blocker, but a real unresolved item today).
- **Glossary: REQUIRES ADDITIONAL PREPARATION**, but the lightest of the
  three — its own relationship fields are 100% clean (0 broken references
  found, Section 6), its data schema is the simplest of the three, and its
  first-wave manifest (Section 13 / `data/i18n/es/glossary-first-wave.json`)
  is now a concrete, deterministic, reproducible 54-record list. Its
  remaining blocker is shared infrastructure, not a Glossary-specific
  defect: the `es`-object data-model change, the resolver module, and the
  three generators' hreflang/canonical/lang wiring (Section 8) do not yet
  exist for *any* of the three families — Glossary cannot go first alone
  without that shared plumbing being built regardless.

**No family is READY FOR PHASE 8M today** — every one of them depends on
the same not-yet-built shared plumbing (the `es`-object data model, the
related-link resolver, and the three generators' additive hreflang/
canonical/lang wiring), even though none of that plumbing requires an
architectural redesign (Section 8's "nothing is BLOCKED" finding stands).
"Additive work not yet done" is still "not ready," not "ready" — the
phase's own instruction not to declare READY merely because the design
looks reasonable is honored here explicitly.
