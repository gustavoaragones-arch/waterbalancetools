# PHASE 8M — CORE REFERENCE LOCALIZATION PLUMBING IMPLEMENTATION

## 1. Status
PASS

## 2. Baseline
- Expected: `6235c2d9f6894886f5b2ab5f1188f61c6806db12`
- Actual: `6235c2d9f6894886f5b2ab5f1188f61c6806db12`
- HEAD == origin/main: YES
- Working tree: clean at start; contains only the intentional Phase 8M changes at completion (listed in Section 12 below)

## 3. Implementation Summary

- Content-ID migration: 3 non-native fixture IDs in `data/i18n/translation-status.json` renamed to native source-record IDs, status preserved, traceable via `_migratedFrom`.
- New module `js/i18n/related-link-resolver.js`: generic, language-aware relationship resolver (Policy A fallback), reused by all 3 generators.
- New module `js/i18n/formula-equation-model.js`: hand-verified structured token decomposition for all 9 real formula records, proven to reconstruct the original equation string byte-for-byte.
- New module `js/i18n/reference-locale-scope.js`: deterministic 25/11/16 Reference scope classifier, derived live from `data/reference.json`, not filename-guessed.
- New module `js/i18n/translation-drift.js`: repository-based drift detector, verified to catch injected corruption and report 0 errors against the real, migrated data.
- `scripts/template-utils.js`: new `localizedHref()` helper; `buildTermContent`, `buildRefContent`, `buildRelatedTools` now accept an optional `locale` parameter.
- `scripts/generate-glossary.js`, `generate-formulas.js`, `generate-reference.js`: each generator function now accepts a `locale` parameter (default `'en'`), emits locale-aware `HTML_LANG_ATTR`/`CANONICAL_URL` via the existing, unmodified `js/i18n/html-lang.js`/`locale-url.js`.
- `templates/glossary-template.html`, `formula-template.html`, `reference-template.html`: `<html lang="en">` and the hardcoded canonical/JSON-LD-url string replaced with `{{HTML_LANG_ATTR}}`/`{{CANONICAL_URL}}` tokens.

## 4. Content-ID Integrity

| Old ID | New ID | Status preserved |
|---|---|---|
| `glossary:free-chlorine` | `glossary:gl-001` | en:translated / es:missing |
| `formula:pool-volume` | `formula:formula-01` | en:translated / es:missing |
| `reference:ideal-pool-levels` | `reference:ref-01` | en:translated / es:missing |

20 total units, all unique, no duplicates, no lost status. Drift detector: 0 errors against the real file; confirmed functional by catching 3 deliberately injected problems (malformed ID, nonexistent native ID, stale pre-migration ID) in a discarded test copy.

## 5. Localization Plumbing

`resolveRelatedLink()` normalizes 3 raw relationship shapes (English URL literal, cross-family bare slug, same-family bare slug suffix) to a `(family, nativeId)` pair, checks `translation-status.js`, and applies Policy A. Verified against real data: a translated calculator resolves to its Spanish URL at `locale:'es'`; an untranslated glossary term falls back to its English URL; `locale:'en'` always returns the English URL; a known-missing target (`turnover-rate`) returns `{resolved:false}` without throwing. Wired into all 3 generators via `template-utils.js`'s `localizedHref()`, which falls back to the pre-existing `href()` behavior for anything unresolved — the mechanism that guarantees English-output byte-identity.

## 6. Formula Safety

9/9 real formula records (the 10th Phase-8K/L page count is `formulas/index.html`, a hub, correctly excluded) individually decomposed into math/label tokens. `reconstructEquation()` verified to reproduce the exact original `data/formulas.json` equation string for all 9. All 6 known numeric constants (7.48, 0.013344, 0.000224, 0.0000834, 0.000133, 12.1) confirmed present and classified immutable. A synthetic (non-production) localization pass proved operators/constants survive unchanged while only label text changes. `formula-04` correctly modeled as pure prose (no equation); `formula-09` (LSI) correctly modeled as having zero localizable labels.

## 7. Reference Scope

- 25 JSON-driven eligible records (derived live from `data/reference.json`)
- 11 legacy older-template pages excluded — **correction of Phase 8L's erroneous "12"**: `reference/calculator-directory.html` is actually one of the 25 JSON-driven records, verified directly (its slug is present in `data/reference.json`, and it was correctly regenerated as part of the 25 in a full build run)
- 16 noindex `reference/datasets/*` pages excluded
- 1 hub (`index.html`)
- 25 + 11 + 16 + 1 = accounts for all 37 `reference/*.html` files + the 16 dataset pages; `classifyReferenceScope()` reports 0 unexpected/unclassified files

## 8. i18n Integration

| Mechanism | Status |
|---|---|
| html lang | Wired (existing `html-lang.js`, unmodified) |
| Canonical | Wired (existing `locale-url.js`, unmodified) |
| hreflang | Wired for future output, proven against a synthetic translated pair (reciprocal en/es/x-default) and a synthetic untranslated unit (no false alternate) |
| Switcher | Wired for future output, proven against real data (translated calculator → available; untranslated glossary term → unavailable, never fabricated) |
| URL | Already supported (`url-engine.js`/`locale-url.js`, unmodified, no /es/es/ possible) |
| Schema (JSON-LD) | Additive fix: glossary/formula templates' `"url"` field now shares the same locale-aware `{{CANONICAL_URL}}` token as the canonical tag |

## 9. Drift Detection

`js/i18n/translation-drift.js`'s `detectDrift()` checks: malformed content ID, duplicate ID, family/ID mismatch, nonexistent native source ID (cross-checked live against the 4 known data files), unsupported locale, translated-status-without-es-data, and English-URL/slug mismatch. Verified functioning against both clean and deliberately-corrupted data.

## 10. Validation

- Phase 8M validator: 33/33 PASS, 0 errors, 0 warnings
- Phase 8M tests: 52/52 PASS
- Broken links: 0 (539 pages)
- URL/indexation: 0 violations (539 pages, 491 sitemap URLs — unchanged)
- Schema: JSON-LD parse-valid on all sampled pages (no change to structure, only the url-field token source)
- Data: `validate-source-data-consistency.js` PASS — 9 formulas / 100 glossary / 25 reference, fully consistent, 0 duplicate IDs
- Accessibility: score 100
- Calculator regression: 13/13 intact, `js/calc-utils.js` byte-identical to baseline
- Determinism: full `npm run build` run three consecutive times from the same source state (a final determinism gate added a third run beyond the two originally reported here). Across all three runs, exactly two specific, individually investigated cosmetic wall-clock artifacts were found to differ, both pre-existing and unrelated to Phase 8M's content: `reference/datasets/version/index.html`'s "Last Built" date, and `calculators/index.html`'s existing hub "Last updated" date. No third file ever differed. Separately, the final gate's third build also surfaced two internal QA-dashboard metric recomputations — `reports/architecture.html`'s `scripts` file count (242→250) and `reports/performance.html`'s `jsKb` size (65→99) — both auto-generated, internal-tooling-only reports (never production-facing or indexed), independently verified by hand-recomputing each metric with `scripts/qa-engine.js`'s own unmodified `SKIP_DIRS`-aware file-walk logic: `jsKb`'s increase is fully and directly attributable to Phase 8M's 4 new `js/i18n/` files, and the `scripts` count increase reflects Phase 8M's 2 new `scripts/` files plus pre-existing staleness in when that specific report was last regenerated. Neither metric difference touches page content, URLs, or calculator logic; both are retained here as audit history rather than omitted.

## 11. Production Safety

- Spanish production pages created: 0
- Spanish non-calculator pages: 0
- Spanish URLs added: 0
- Spanish sitemap URLs added: 0
- Spanish navigation records added: 0
- Spanish search records added: 0
- Calculator pages changed: 0
- Calculator logic changed: 0
- English output pages changed: 0 (calculators); Glossary/Formulas/Reference: 0 real content changes across all 134 pages + 3 hubs — across three independent full-build runs, the only diffs were the two pre-existing, unrelated cosmetic timestamp files (`reference/datasets/version/index.html` "Last Built" date, `calculators/index.html` "Last updated" date) — see Section 10

## 12. Files Changed

Modified (8): `data/i18n/translation-status.json`, `data/search-index.json` (correctly re-propagated content IDs via the real generator pipeline), `scripts/template-utils.js`, `scripts/generate-glossary.js`, `scripts/generate-formulas.js`, `scripts/generate-reference.js`, `templates/glossary-template.html`, `templates/formula-template.html`, `templates/reference-template.html`.

New (9): `js/i18n/related-link-resolver.js`, `js/i18n/formula-equation-model.js`, `js/i18n/reference-locale-scope.js`, `js/i18n/translation-drift.js`, `docs/PHASE-8M-CORE-REFERENCE-LOCALIZATION-IMPLEMENTATION.md`, `reports/phase-8m-status.md`, `scripts/validate-phase-8m.js`, `scripts/test-phase-8m.js`.

No other file was modified. `js/calc-utils.js`, all calculator pages, all `es/` pages, all sitemap/navigation files (beyond `search-index.json`'s correct content-ID propagation), and every other content family are byte-identical to the Phase 8L baseline.

## 13. Commit Status

Working tree: contains exactly the files listed in Section 12, nothing else. NOT committed, NOT pushed.

Ready for Director review.
