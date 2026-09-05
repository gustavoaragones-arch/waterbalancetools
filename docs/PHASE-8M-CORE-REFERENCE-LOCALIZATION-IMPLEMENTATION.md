# Phase 8M — Core Reference Localization Plumbing Implementation

Implementation phase, not a content-translation phase. Every component
below is architecture/plumbing: it makes Glossary, Formulas, and
Reference technically ready for a future Spanish production phase, and
produces zero Spanish non-calculator production output. All claims below
were verified empirically against the actual repository (full
`npm run build` pipeline runs, byte-diffs, and `scripts/test-phase-8m.js`),
not asserted from design intent alone.

## 1. Baseline

HEAD == origin/main == `6235c2d9f6894886f5b2ab5f1188f61c6806db12` (Phase
8L closeout), branch `main`, working tree clean at start. Pre-phase
production snapshot (unchanged after this phase, verified below): 539
production pages, 491 sitemap URLs, 0 violations, 13/13 calculators
(English/Spanish), 0 Spanish non-calculator pages.

## 2. Scope

In scope: Glossary (100 terms + hub), Formulas (9 records + hub),
Reference (25 JSON-driven records + hub, out of 37 total `reference/*.html`
files). Out of scope, untouched: Academy, Entities, Programmatic, Guides,
Resources, Comparisons, Charts, calculator logic
(`js/calc-utils.js`, byte-identical to baseline throughout), and any
Spanish production page of any kind.

## 3. Content-ID Implementation

Applied the Phase 8L-approved convention (reuse each source record's
native `id`) to the 3 non-conforming seed fixtures in
`data/i18n/translation-status.json`:

| Old ID | New ID | Status preserved |
|---|---|---|
| `glossary:free-chlorine` | `glossary:gl-001` | `en: translated`, `es: missing` |
| `formula:pool-volume` | `formula:formula-01` | `en: translated`, `es: missing` |
| `reference:ideal-pool-levels` | `reference:ref-01` | `en: translated`, `es: missing` |

Each migrated unit records `_migratedFrom` (the pre-migration contentId)
and `_nativeSourceId` for traceability — no status information was lost,
and no old ID survives as a duplicate. `academy:fund-01` and
`entity:algae` already matched the convention and were left untouched.
`guide:...` and `programmatic:...` have no external native-ID data source
and were left untouched, exactly as Phase 8L scoped it. Verified: 20 total
units, all unique, `data/search-index.json` correctly re-propagated the 2
new content IDs it displays (`formula:formula-01`, `glossary:gl-001`) on
the next full build — a live, empirical proof the migration flows
correctly through the existing generator pipeline, not just a
translation-status.json edit in isolation.

## 4. Translation Data Model

**Selected: embedded `es` object beside existing English fields, added
only when populated** (`{ ...existing English fields, "es": {...} }`),
confirming the Phase 8L design decision against the actual, now more
deeply understood, schemas:

- Glossary (12 fields: `id, slug, term, abbreviation, definition,
  explanation, whyItMatters, typicalValues, relatedCalculators,
  relatedArticles, relatedFormulas, lastReviewed`)
- Formulas (19 fields, including `equation`/`variables`/`workedExample`)
- Reference (14 fields, including `tables`/`checklists`/`sources`)

**Not implemented in any production file** — `data/glossary.json`,
`data/formulas.json`, `data/reference.json` are confirmed byte-identical
to the Phase 8L baseline (`git diff` empty). No record in any of the 3
families has an `es` key. This is deliberate: Phase 8M's job was to prove
the plumbing *works*, not to pre-populate 134 records with empty
placeholder objects that a careless future generator change could
misinterpret as "translated" — exactly the risk Task 5 warned against.
`scripts/validate-phase-8m.js` check 5 confirms both halves: the model is
documented here, and zero records have been populated with it.

## 5. Related-Link Resolver

New module: `js/i18n/related-link-resolver.js`. Builds a content index
directly from `data/glossary.json`, `data/formulas.json`,
`data/reference.json`, and `data/i18n/translation-status.json` (for
calculators, which have no dedicated JSON data file). `resolveRelatedLink({
raw, targetFamilyHint, locale })` normalizes any of the three raw
relationship shapes Phase 8L identified:

1. English URL literal (`/calculators/pool-chlorine-calculator`)
2. Cross-family bare slug (`reference/cya-matrix`)
3. Same-family bare slug suffix, requiring a family hint
   (`pool-volume`, formulas.json's `relatedGlossary` shape)

...to a `(family, nativeId)` pair, looks up `translation-status.js`, and
returns a URL under **Policy A** (English fallback when untranslated or
when `locale` is the default `en`). It never fabricates a target: an
unresolvable reference (including all 13 of formulas.json's known-missing
glossary slugs) returns `{ resolved: false, reason: 'unknown-target' }`,
proven not to throw (`scripts/test-phase-8m.js` check 8/9,
`validate-phase-8m.js` check 9). Confirmed empirically: `resolveRelatedLink`
for a real translated calculator at `locale: 'es'` returns the Spanish
URL; for the (currently untranslated) `glossary:gl-001` at `locale: 'es'`
returns the English URL; for `locale: 'en'` always returns the English
URL regardless of translation status.

Wired into `scripts/template-utils.js`'s new `localizedHref(link, locale,
targetFamilyHint)` helper, which falls back to the pre-existing, unchanged
`href(link)` behavior whenever the resolver cannot place a reference
(Academy/Entities references, and the 13 known-broken formulas.json
slugs) — this fallback is what makes `locale: 'en'` (the only locale any
current production generator invocation ever uses) provably byte-identical
to pre-Phase-8M output.

## 6. Glossary Integration

`scripts/template-utils.js`'s `buildTermContent(term, locale)` now routes
`relatedCalculators`/`relatedArticles`/`relatedFormulas` through
`localizedHref()`. `scripts/generate-glossary.js`'s `generateTerm(term,
locale)` (default `'en'`) supplies `HTML_LANG_ATTR`/`CANONICAL_URL` via
`js/i18n/html-lang.js`/`js/i18n/locale-url.js` and passes `locale` through
to `buildTermContent`. English output verified byte-identical (Section
17). No Spanish glossary page was generated.

## 7. Formula Integration

`scripts/generate-formulas.js`'s `generateFormula(formula, locale)`
(default `'en'`) gained the same `HTML_LANG_ATTR`/`CANONICAL_URL` wiring
and passes `locale` to `buildRelatedTools()`, which now routes
`relatedCalculators` through `localizedHref()`. `relatedGlossary`/
`relatedTopics` were confirmed to have **zero current rendering call
sites** in the live generator (verified by direct grep — these two JSON
fields are not consumed by any template-building function today), so no
new rendering behavior was invented for them; the resolver itself
correctly handles their shapes and their 13 known-missing targets
(Section 9/10), ready for whichever future change actually renders them.
This is a deliberate scope boundary, not an oversight: inventing new
English rendering for a previously-inert field would be an English
content/behavior change outside this phase's plumbing-only mandate.

## 8. Structured Equation Model

New module: `js/i18n/formula-equation-model.js`. Hand-verified,
per-formula token decomposition for all 9 `data/formulas.json` records
(kinds: `label`, `operator`, `constant`, `variable`, `unit`, `punct`,
`prose`), NOT derived by a generic parser (a hand-checked decomposition of
9 known strings is safer than trusting a new natural-language/math
tokenizer). Does not modify `data/formulas.json` — the existing `equation`
string remains the untouched, canonical source of truth. **Verified
`reconstructEquation(id)` reproduces the original equation string
byte-for-byte for all 9 records** — the concrete mathematical-identity
proof. A synthetic (non-production) `localizeEquation()` call, using a
made-up label dictionary, was proven to change only label text while
leaving every operator/constant/variable/unit token untouched (`×`, `=`,
`7.48` all confirmed present unchanged after "translating" `Volume`/
`Length`/`Width`/`Average Depth`).

## 9. Reference Scope Boundary

New module: `js/i18n/reference-locale-scope.js`. **Correction to Phase
8L**: Phase 8L's document stated "12 legacy pages," incorrectly including
`reference/calculator-directory.html` in that list. Direct verification in
Phase 8M confirms `calculator-directory` IS one of the 25
`data/reference.json`-driven records (its slug
`"reference/calculator-directory"` is present in the file, confirmed by
running `generate-reference.js` inside the full build pipeline and
observing it correctly regenerated as one of the 25). **The correct
count is 11 legacy pages, not 12.** Verified breakdown of all 37
`reference/*.html` files: 25 JSON-driven (`getJsonDrivenScope()`, derived
live from `data/reference.json`'s own slugs, never filename-guessed) + 1
hub (`index.html`) + 11 legacy older-template pages (explicitly named in
`LEGACY_EXCLUDED`, not inferred) = 37. Separately, `reference/datasets/`
contains 16 noindex machine-documentation pages (also excluded).
`classifyReferenceScope()` returns 0 "unexpected" files, confirming this
36+1 breakdown is exhaustive against the real directory listing.
`generate-reference.js`'s own `generateRefPage(page, locale)` gained the
same `HTML_LANG_ATTR`/`CANONICAL_URL`/`buildRefContent(page, locale)`
wiring as the other two generators.

## 10. i18n Integration

| Mechanism | Status | Evidence |
|---|---|---|
| `lang` | Wired | `htmlLangAttr('en')` === `lang="en"`, `htmlLangAttr('es')` === `lang="es"` (existing `js/i18n/html-lang.js`, unmodified) |
| Canonical | Wired | `getLocalizedCanonical(path, 'en')` produces the exact pre-existing canonical string; `getLocalizedCanonical(path, 'es')` produces the correct `/es/` self-canonical (existing `js/i18n/locale-url.js`, unmodified) |
| hreflang | Wired for future output | `buildHreflangSet()` (existing, unmodified `js/i18n/hreflang.js`) proven against a synthetic translated pair to produce a correct reciprocal en/es/x-default set, and to produce NO set at all for an untranslated unit (no false alternate) |
| Switcher | Wired for future output | `resolveLanguageSwitcherLinks()` (existing, unmodified `js/i18n/language-switcher.js`) proven against real `translation-status.json` data: a translated calculator marks its Spanish option available; an untranslated glossary term marks it unavailable, never fabricating a live link |
| URL | Already supported | `js/url/url-engine.js` + `js/i18n/locale-url.js`, unmodified, already prevent `/es/es/` and already integrate correctly |
| Schema (JSON-LD) | Additive fix applied | `templates/glossary-template.html` and `templates/formula-template.html`'s `"url"` fields now use the same `{{CANONICAL_URL}}` token as the `<link rel="canonical">` tag (previously a separately hardcoded `https://waterbalancetools.com/{{SLUG}}` string that would have silently stayed English-only even after canonical went locale-aware) |

No new competing implementation of any of these primitives was created —
every one of the three generators imports and calls the existing,
unmodified `js/i18n/*` modules.

## 11. Drift Detection

New module: `js/i18n/translation-drift.js`. `detectDrift()` checks every
`translation-status.json` unit for: malformed content ID, duplicate
content ID, family/ID mismatch, nonexistent native source ID (cross-
checked live against `data/glossary.json`/`formulas.json`/
`reference.json`/`academy.json`), unsupported locale code, a "translated"
status with no corresponding `es` data object once the Section 4 data
model is populated, and an English URL that no longer matches its source
record's current slug. **Verified functioning, not a no-op**: run against
the real, correctly-migrated `translation-status.json` it reports 0
errors; run against a deliberately corrupted copy (a malformed ID, a
nonexistent native ID, and a stale pre-migration ID) it correctly reported
all 3 injected problems before the corrupted copy was discarded (never
written to the real file).

## 12. Validation Architecture

`scripts/validate-phase-8m.js` (33 checks) and `scripts/test-phase-8m.js`
(52 checks, including Task P's synthetic, clearly-non-production fixtures
for hreflang/switcher/localization proofs) — both described in full in
`reports/phase-8m-status.md`. Neither script ends with a blanket `git
checkout HEAD -- .` self-cleanup step (unlike some earlier
`validate-phase-8*.js` scripts) — a lesson learned the hard way during
this phase's own implementation, when running an earlier phase's
validator with that pattern silently reverted several hours of
just-written, uncommitted Phase 8M source changes. Both scripts leave any
incidental cosmetic drift from their own read-only checks for the caller
to inspect via `git status`, rather than risk discarding unrelated
in-flight work.

## 13. Production Safety Certification

- Spanish production pages created: **0**
- Spanish non-calculator pages: **0**
- Spanish production URLs added: **0**
- Spanish sitemap URLs added: **0**
- Spanish navigation records added: **0**
- Spanish search records added: **0**
- Calculator pages changed: **0**
- Calculator logic changed: **0** (`js/calc-utils.js` SHA-256 identical to baseline)
- English production output pages changed: **0** for calculators; for
  Glossary/Formulas/Reference, a full `npm run build` run was diffed
  against the pre-Phase-8M baseline twice (Section 17) and found exactly
  one difference sitewide across all 134 real content pages plus their 3
  hubs — a pre-existing, unrelated `reference/datasets/version/index.html`
  "Last Built" wall-clock timestamp, the same well-established drift
  category documented in every prior phase of this project.

## 14. Known Data Gaps (pre-existing, not introduced by Phase 8M)

- 13 unique glossary slugs referenced by `formulas.json`'s
  `relatedGlossary` field do not correspond to any real glossary term
  (`turnover-rate`, `soda-ash`, `ph-buffering`, `salt-chlorinator`,
  `sodium-chloride`, `salt-level`, `chlorine-lock`, `uv-degradation`,
  `pump-head-pressure`, `pool-circulation`, `lsi`, `corrosion`, `scaling`).
- 14 total broken reference *occurrences* (one slug, `turnover-rate`, is
  referenced twice — by `formula-01` and `formula-08`) across 7 of the 9
  formula records (`formula-01`, `04`, `05`, `06`, `07`, `08`, `09`) —
  **correcting Phase 8L's "6 of 9" to the verified "7 of 9."**
- These are data-quality gaps in the English source content, not
  localization records — no replacement glossary entries were invented.
- `formula-04`'s "equation" field is prose, not math (no formula is
  published for pH adjustment — a deliberate editorial choice, not a data
  error).
- `formula-09` (LSI) is nearly pure symbolic notation — the lowest
  localization risk of the 9.
- 8 of 9 formulas contain inline natural-language English words embedded
  directly in the equation string.
- 11 (not Phase 8L's stated 12) `reference/*.html` pages use an older
  template with no JSON data source and remain out of scope.
- 16 `reference/datasets/*` pages are noindex and remain out of scope.

## 15. Future Phase 8N Implementation Contract

To add real Spanish content to Glossary, Formulas, or Reference, a future
phase must, in order:

1. **Pick the exact record(s) to translate** — for Glossary, start from
   `data/i18n/es/glossary-first-wave.json`'s 54-candidate manifest
   (already native-ID-keyed, deterministic, unmodified since Phase 8L);
   for Formulas, all 9 are eligible; for Reference, only the 25 IDs
   `js/i18n/reference-locale-scope.js#getJsonDrivenScope()` returns.
2. **Populate the `es` object** on the chosen source record(s) in
   `data/glossary.json`/`formulas.json`/`reference.json` directly (Section
   4's schema) — `explanation`, `definition`, etc. per the
   TRANSLATE/DO-NOT-TRANSLATE classification Phase 8L's field matrix
   already defined. For a formula's equation specifically, use
   `js/i18n/formula-equation-model.js`'s `localizeEquation(nativeId,
   translateLabelFn)` — never hand-edit the equation string directly.
3. **Flip `translation-status.json`** for that exact native content ID
   from `es: missing` to `es: translated` — only after the `es` object
   genuinely exists (this is exactly what `translation-drift.js`'s check
   10-in-`validate-phase-8m.js`-style logic would catch if done out of
   order).
4. **Add a real Spanish-mode generation call** — call
   `generateTerm(term, 'es')` / `generateFormula(formula, 'es')` /
   `generateRefPage(page, 'es')` for the translated record(s) and write
   the result to `es/glossary/<slug>.html` etc. (mirroring exactly how
   `scripts/generate-spanish-cluster.js` writes to `es/calculators/` for
   calculators) — a new, small Phase-8E-pattern generator script, not a
   modification to the existing English-mode invocation loop.
5. **Re-run the existing, unmodified pipeline extensions already proven
   for calculators**: `generate-navigation.js`/`generate-search-index.js`
   (their `TRANSLATED_ES_URLS` gate is already category-agnostic — no
   change needed), `generate-sitemaps.js` (already language-prefix-aware
   via `stripLanguageSegment()` — no change needed), and an
   `inject-i18n-cluster.js`-equivalent step to inject the hreflang pair
   and language-switcher link into both the new Spanish file and its
   English counterpart (reusing `buildHreflangSet()`/
   `resolveLanguageSwitcherLinks()`, which this phase proved already work
   correctly for this content shape).
6. **Validate**: broken links, URL/indexation, schema, and a
   `validate-phase-8n.js`-equivalent script following the exact 33-check
   convention this phase and every phase since 8G established.

No architecture decision remains open for this contract — every module a
Phase 8N implementer needs already exists, is imported by name above, and
was proven working against real data in this phase.
