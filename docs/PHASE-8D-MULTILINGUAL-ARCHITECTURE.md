# Phase 8D — Multilingual Architecture & Localization Readiness

## 1. Objective

Establish a centralized, deterministic, SEO-safe multilingual architecture for WaterBalanceTools.com so that a future Spanish (`es`) content rollout is a controlled content-population exercise, not an architectural experiment. This phase creates architecture only: zero Spanish content, zero `/es/` production pages, zero changes to any existing English page.

## 2. Phase 8C baseline

HEAD == origin/main == `04baec2` ("Phase 8C: certify navigation artifact determinism"), working tree clean at phase start. Phase 8C's `scripts/validate-phase-8c.js`, `scripts/test-phase-8c.js`, `docs/PHASE-8C-NAVIGATION-ARTIFACT-DETERMINISM.md`, `reports/phase-8c-status.md` confirmed present.

## 3. Current language architecture audit

A forensic sweep of the repository (`package.json`, `scripts/run-all-generators.js`, every page generator, `js/url/url-engine.js`, `scripts/url-policy.js`, `scripts/generate-sitemap(s).js`, `scripts/generate-navigation.js`, `scripts/generate-hubs.js`, schema generators, `robots.txt`, the Phase 7Z data pipeline, and the seven programmatic generators) found:

- **No existing i18n/hreflang/locale architecture of any kind.** Grep for `hreflang`, `x-default`, `locale`, `i18n`, `multilingual`, `translation`, `/es/`, `/en/`, `lang=`, `alternate` turns up only: (a) historical Phase 7T/7U/7W/7V/7Z/7R one-time completion gates that assert *no* `es/`/`fr/` directory existed *during those specific, already-closed phases* — not a standing architectural constraint on this phase; (b) `scripts/audit-forensic/run.js`, a static forensic-audit report that prints "Spanish: NOT STARTED" as a data point, not real logic; (c) false positives (`alternateCanonicals`, `alternateUnits`, unrelated variables named `lang`).
- **Default language**: implicitly English everywhere (no language concept exists to be "default" of).
- **URL language model**: none. `js/url/url-engine.js`'s `BASE_URL` is hardcoded with no locale segment; every URL is a flat, unprefixed path.
- **HTML `lang`**: hardcoded `lang="en"` independently in ~25 individual generator template strings (no shared `<html>`-emitting helper exists). `scripts/normalize-seo-metadata.js` additionally auto-injects `lang="en"` into any `<html>` tag found missing one.
- **Canonical behavior**: `urlEngine.canonicalUrl()`/`absoluteUrl()` are language-agnostic; every generator that builds a canonical routes through this one function.
- **Sitemap behavior**: `scripts/generate-sitemaps.js` (the live, build-wired generator; the older singular `generate-sitemap.js` is deprecated and self-disables) buckets pages into 8 category groups by top-level directory — no language dimension exists.
- **Schema language behavior**: `lib/schemaEngine.js` and per-generator JSON-LD builders (`WebApplication`, `BreadcrumbList`, `FAQPage`, `HowTo`, `CollectionPage`, `DefinedTerm`) all route their `url`/`@id` fields through `urlEngine.absoluteUrl`/`canonicalUrl` — no explicit language field exists in any schema output today.
- **Navigation behavior**: `data/navigation.json` (built by `scripts/generate-navigation.js`) has no `lang` field on any page record.
- **Generator assumptions**: every generator assumes a 1:1 mapping between a file's physical path and its final URL, and (in the seven `scripts/generators/*.js` programmatic families) the same string that forms the output filename also functions as the page's only identity — no independent, language-neutral content ID exists anywhere in the current architecture.
- **Content-source assumptions**: the Phase 7Z pipeline (`scripts/data/*.js` → `populate-data.js` → `data/*.json`) is single-language by construction; each source file is the sole authoritative English content for its topic.
- **Existing language implementation**: none. **Existing language-specific pages**: none.

Full agent findings are recorded in this phase's investigation; see Section 18 (deferred items) for the exact file-level citations that inform Sections 15, 18, 20, and 25 below.

## 4. Language model

Single authoritative source: `js/i18n/languages.js`, exporting a `LANGUAGES` array plus accessors (`getLanguage(code)`, `getDefaultLanguage()`, `getLanguageCodes()`, `getNonDefaultLanguages()`, `isValidLanguageCode()`). The module asserts its own invariants at load time (exactly one default, default has empty `pathPrefix`, no duplicate codes/prefixes, every non-default prefix matches `/xx`) so a future misconfiguration fails loudly at require-time rather than silently at build-time.

```js
{ code: 'en', hreflang: 'en', name: 'English', nativeName: 'English', default: true,  pathPrefix: '',    direction: 'ltr' }
{ code: 'es', hreflang: 'es', name: 'Spanish', nativeName: 'Español', default: false, pathPrefix: '/es', direction: 'ltr' }
```

No other file defines a competing language list. A future language (e.g. French) is added by appending one entry here; every consumer (`locale-url.js`, `hreflang.js`, `translation-status.js`, `language-switcher.js`) is written generically against `getLanguages()`/`getLanguage(code)`, not against `"es"` specifically, except where "the default language" is looked up as a property, not hard-coded as English by name.

## 5. URL architecture

`https://waterbalancetools.com/...` (English, unchanged) and `https://waterbalancetools.com/es/...` (Spanish, future). No subdomain, no `es-ES`/`es_US` region variant, no query-string language selection — the forensic audit found no existing constraint requiring any of those alternatives, so the spec's preferred `/es/` path-prefix model was adopted as specified.

`js/i18n/locale-url.js` implements the resolver, wrapping (never duplicating) `js/url/url-engine.js`'s existing normalization:

- `getLocalizedUrl(path, code)` — `getLocalizedUrl('/calculators/pool-volume', 'en')` → `/calculators/pool-volume`; `getLocalizedUrl('/calculators/pool-volume', 'es')` → `/es/calculators/pool-volume`. Matches the spec's exact required examples.
- `stripLanguagePrefix(path)` — detects and removes any existing language prefix, returning `{ code, path }`. Every other function in the module calls this first, which is what makes double-prefixing structurally impossible: `getLocalizedUrl('/es/es/calculators/pool-volume', 'es')` → `/es/calculators/pool-volume`, and `getLocalizedUrl('/es/calculators/pool-volume', 'en')` → `/calculators/pool-volume` (verified in `test-phase-8d.js` tests 4-5, `validate-phase-8d.js` check 15).
- `getLocalizedCanonical(path, code)` — `urlEngine.canonicalUrl(getLocalizedUrl(path, code))`.
- `detectLanguageFromPath(path)`, `withLanguage(path, code)` (alias for switcher call sites).

`url-engine.js` itself is **not modified** — this is a new, additive wrapper layer, so all 26 existing call sites into `url-engine.js` are provably unaffected.

## 6. Content/source architecture

The conceptual model (spec Section 8): **shared content identity → language-specific content → language-specific rendering.** Concretely:

- A **content ID** (e.g. `calculator:pool-volume`, `academy:fund-01`, `programmatic:chlorine-10000-gallon`) is a stable, language-neutral key, independent of any language's URL slug.
- Each content ID has zero or more **language records** (currently tracked in `data/i18n/translation-status.json`, one row per language: `status` + the language-specific `url`).
- Rendering (an actual generated page) is produced by a language-specific generator that consumes the language's own content and writes to the language's own URL via `getLocalizedUrl()`.

This directly addresses the one concrete architectural gap the forensic audit found: the seven programmatic generators (`scripts/generators/generate-{chlorine,shock,ph,hot-tub,problem,explanation,behavior}-pages.js`) currently conflate content identity with the English slug itself (e.g. `slugFor(volume)` in `generate-chlorine-pages.js` produces both the output filename and, indirectly, the URL — there is no separate ID). Phase 8D does not modify these seven generators (that would be unrequested, unauthorized production-generator surgery with no Spanish content yet to justify it); instead it demonstrates, via the `programmatic:chlorine-10000-gallon` fixture, the content-ID convention a future phase must introduce there (e.g. deriving both an English and a Spanish slug from the same stable `volume`-based ID) so that Spanish generation for these families does not require parsing or depending on the English HTML output.

## 7. Translation-status architecture

`data/i18n/translation-status.json` + `js/i18n/translation-status.js`. Status values: `translated`, `missing`, `review`, `intentionally_untranslated`. API: `getStatus(contentId, lang)`, `isTranslated(...)`, `getAvailableLanguages(contentId)` (the *only* correct input to hreflang generation), `listMissing(lang)`, `listReadyForTranslation(lang)`, `listNeedingReview(lang)`, `getAllUnits()`.

Seeded with exactly the 8 representative fixtures required by spec Section 31 (calculator, Academy article, glossary term, formula, reference page, guide, entity page, programmatic page — see Section 21 below for the exact real URLs used), each with `en: translated`, `es: missing`. Per spec Section 24, this deliberately does **not** attempt to enumerate the remaining ~500 English pages — that is explicit future-phase (Spanish rollout) work.

## 8. Canonical rules

Deterministic and self-referential per language: `getLocalizedCanonical(path, 'en')` and `getLocalizedCanonical(path, 'es')` always differ and each equals the language's own URL. Verified directly: `en` → `https://waterbalancetools.com/calculators/pool-volume-calculator`, `es` → `https://waterbalancetools.com/es/calculators/pool-volume-calculator`. No page canonicalizes to a different language's URL. Existing English canonical output is untouched (no generator that emits a canonical was modified).

## 9. hreflang rules

`js/i18n/hreflang.js`'s `buildHreflangSet(path, availableLanguageCodes, options)` **only** emits an alternate for a language code present in `availableLanguageCodes` — and the only correct source of that list is `translationStatus.getAvailableLanguages(contentId)`, which filters strictly on `status === 'translated'`. A content unit with only English translated (all 8 current fixtures) produces `[]` — zero hreflang entries, not a partial/fabricated set. `x-default` is emitted only when at least 2 languages are available and only pointing at the configured default language (English). This was verified against the spec's literal requirement: en → English URL, es → Spanish URL, x-default → English URL, and against the "single language = zero entries" case (test 9, validator check 16).

## 10. HTML `lang` rules

`js/i18n/html-lang.js` provides `htmlLangAttr(code)` (`'lang="es"'`) and `htmlOpenTag(code)` (a full `<html lang="es">` tag, with `dir="rtl"` support for a future rtl language, though all current languages are `ltr`). **The ~25 existing generators that hard-code `lang="en"` are intentionally left unmodified** in Phase 8D — touching them now would be a sitewide, zero-benefit production diff, since no non-English page exists to need a different value yet (spec Section 15 explicitly prohibits mass-regeneration for this reason). The migration path for the Spanish rollout phase: each new Spanish-page-writing generator emits `<html lang="es">` explicitly in its own template string (mirroring exactly how the existing ~25 generators already hard-code `lang="en"`) — `scripts/normalize-seo-metadata.js`'s auto-injector only adds `lang="en"` when a `<html>` tag is missing a `lang` attribute entirely (regex: `<html(?![^>]*\blang=)...>`), so a Spanish generator that already emits its own `lang="es"` is left untouched by that normalizer, no changes to it required.

## 11. Navigation architecture

`scripts/generate-navigation.js` and `scripts/generate-hubs.js` are **intentionally unmodified** in Phase 8D (verified by `validate-phase-8d.js` checks 12 and by `test-phase-8d.js` test 11, which greps both files for any i18n wiring and asserts none exists). The documented, not-yet-implemented extension path for the Spanish rollout phase: `generate-navigation.js`'s per-page record gains an additive `lang` field (defaulting existing English records to `'en'` via `detectLanguageFromPath`), and `generate-hubs.js`'s `linksByPrefix`/`childCategories` prefix-matching becomes language-aware (matching within the same language's URL space) so that a Spanish hub page links primarily to Spanish leaf pages, falling back to English only where no Spanish equivalent exists (per spec Section 19's explicitly-permitted fallback). Implementing this now, before any Spanish content exists, would only produce an English-only, zero-benefit diff across all 522 navigation records — deferred by design.

## 12. Internal-link architecture

Rule established (not yet implemented, since no Spanish page exists to link from): a localized page must link to a localized equivalent where `translationStatus.isTranslated(targetContentId, currentLanguage)` is true, and may fall back to the English URL only when explicitly permitted by that same status check returning false for the target. `js/i18n/locale-url.js` and `js/i18n/translation-status.js` together supply everything an internal-link generator will need; no separate new module is required for this rule, only for its future application inside the actual link-generating scripts (`build-*-links.js`, `inject-calculator-related-tools.js`, etc.), which remain unmodified.

## 13. Sitemap architecture

`scripts/generate-sitemaps.js` is unmodified (verified: no `/es/` string appears in it, checked by `validate-phase-8d.js` check 13). Confirmed via `test-phase-8d.js` test 12 that no new normalization logic is needed for the future extension: `urlEngine.sitemapUrl(getLocalizedUrl(path, 'es'))` already produces a fully correct absolute Spanish sitemap `<loc>` value today, using only existing, unmodified functions. The documented rollout approach: either a 9th category dimension crossed with language, or a parallel `sitemap-es-*.xml` file set plus one additional `<sitemap>` entry in the existing `buildIndex()`'s output — either fits the current architecture without requiring a redesign.

## 14. Schema architecture

No new JSON-LD schema types introduced. Every existing schema generator already routes its `url`/`@id` fields through `urlEngine.absoluteUrl`/`canonicalUrl` — the single, centralized point through which `getLocalizedUrl()` output would flow once a future generator passes a Spanish path through it. English schema semantics are untouched (zero schema-generating script modified). No Spanish schema is generated on any English page (there is no code path that could do so, since no schema generator was touched).

## 15. Language-switcher architecture

`js/i18n/language-switcher.js`: `resolveLanguageSwitcherLinks(contentId, currentPath, currentLanguageCode)` returns every configured language annotated with `{ url, isCurrent, available }`, where `available` is strictly gated by `translation-status.js`. `availableSwitcherLinks(...)` is the convenience filter a real UI would use, returning only the current language plus any genuinely translated ones — for all 8 current fixtures, that means only English. **No visible switcher UI was added to any template or header in Phase 8D**, per spec Section 22's explicit instruction; this is resolution logic only.

## 16. Fallback rules

**Missing translation ≠ translated page.** No fallback content-substitution behavior was implemented or invented in Phase 8D. `translation-status.js` never reports a `missing` unit as `translated`, `hreflang.js` never emits an alternate for a `missing` unit, and `language-switcher.js` never marks a `missing` unit `available`. If a future phase wants a Spanish page to display in a fallback state (e.g., "not yet available in Spanish, showing English content") that is a new, explicit policy decision for that phase to make and document — Phase 8D deliberately does not decide it, per spec Section 23's instruction not to invent fallback behavior now.

## 17. Programmatic SEO safety

Content identity (`contentId`) is modeled as distinct from URL (Section 6). The one existing conflation (programmatic generators using the English slug as the only identity) is documented, not fixed, since fixing it productively requires the Spanish generation work that would consume it — attempting the refactor in isolation, with nothing yet to prove it against, risks exactly the kind of "architectural experiment" the spec says the next phase should avoid. `translation-status.json`'s `programmatic:chlorine-10000-gallon` fixture demonstrates the target shape: one `contentId`, one `en` URL, one (not-yet-real) `es` URL, with no duplicate canonical, no duplicate sitemap entry, and no duplicate slug possible, because nothing is generated.

## 18. Dataset/entity architecture

Entity identity (`entities/*.html`, `data/graph/entity-index.json`) is already language-neutral at the identifier level (an entity's slug, e.g. `algae`, is a stable concept key, not an English phrase requiring translation to remain valid) — confirmed via the `entity:algae` fixture, whose `contentId` is independent of any display string. Display names/schema names *can* be localized in a future phase without touching the entity's identity or its underlying scientific facts. Datasets (`data/dataset-*.json`, chemistry ranges/claims) are explicitly **not** duplicated or touched — they remain the single, language-neutral, authoritative source Phase 7Z established; only *display labels* around them would ever need localization, never the numbers themselves.

## 19. Build-determinism protection

Verified directly, not assumed: `npm run build` was run once from the clean, committed Phase 8C baseline plus these new, purely-additive Phase 8D files. Exit 0. Exactly the same 36-file canonical timestamp/sitemap category changed as in every prior phase's clean build (28 timestamp files + 8 sitemap files) — zero other files changed. `data/navigation.json`'s 522 page records were compared field-by-field against the pre-build committed version: **0 records changed.** Zero `/es/` URLs appeared anywhere. Phase 8A's 5 injector fixes, Phase 8B's pre-hub navigation-refresh ordering, and Phase 8C's navigation-artifact-determinism finding were all re-verified intact via their own validators (`validate-phase-8a.js`, `validate-phase-8b.js`, `validate-phase-8c.js`, all PASS) after this build.

## 20. Spanish rollout prerequisites

For the future phase that actually generates Spanish content, this phase leaves the following explicitly open (by design, not oversight):

1. Add `es` to `scripts/url-policy.js`'s production-directory classification (currently `topDir()`-based single-level; Spanish content under `es/<category>/...` needs a second-level-aware check, since `topDir('es/calculators/x.html') === 'es'`, not `'calculators'`).
2. Extend `generate-navigation.js` to add a `lang` field per record and `generate-hubs.js` to build language-aware hub cross-links (Section 11).
3. Extend `generate-sitemaps.js` for a Spanish sitemap group (Section 13).
4. Introduce a genuine, stable content-ID layer inside the seven programmatic generators, replacing the current slug-as-identity conflation (Section 6/17).
5. Decide and document an explicit fallback policy if any (Section 16) — Phase 8D deliberately leaves this undecided.
6. Populate `data/i18n/translation-status.json` for the full English content set as Spanish pages are actually produced (currently seeded with only the 8 required fixtures).
7. Wire a real language-switcher UI into the shared header/template, consuming `js/i18n/language-switcher.js`.
8. Add an `es`-language robots/indexation policy check to `scripts/url-policy.js`/`validate-url-indexation.js` (currently untouched, since no `/es/` content exists to classify).

## 21. Future-language extensibility

Every module in `js/i18n/` is written against `getLanguages()`/`getLanguage(code)` from the single `LANGUAGES` config, not against `"es"` as a special case (with the sole, correct exception of "the default language," which is looked up by its `default: true` property, not hard-coded to English by string). Adding French, for example, requires exactly one change: a new entry in `js/i18n/languages.js` (which self-validates its own invariants at load time). No other file needs to change for the architecture itself to support it.

## 22. Deferred items

All eight items in Section 20 above. Additionally: `scripts/audit-forensic/run.js`'s static "Spanish: NOT STARTED" report line is unmodified (out of scope, not part of `npm run build`, unrelated to the navigation/URL architecture this phase governs, consistent with Phase 8C's established scope discipline for that same script).

## 23. Final determination

**PASS.**

A complete, centralized, tested multilingual architecture now exists: one authoritative language config, a centralized URL resolver that provably prevents `/es/es/` duplication and preserves English URLs exactly, self-referential canonical generation per language, an hreflang generator/validator that structurally cannot emit a false alternate (gated by the translation-status model), a translation-completeness tracker seeded with 8 grounded, real-content fixtures, and a language-switcher resolver that never fabricates a missing translation. Zero Spanish production pages, zero `/es/` sitemap or navigation entries, zero modified English content — verified directly via a full `npm run build` plus a full regression suite (all PASS or in the standard, previously-documented stale-baseline pattern) and a field-level `data/navigation.json` diff showing 0 changed English records. Phase 7Z, 8A, 8B, and 8C all remain independently re-verified intact.
