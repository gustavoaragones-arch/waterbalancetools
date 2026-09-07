# PHASE 8O — SPANISH CORE REFERENCE COMPLETION & SEMANTIC EXPANSION

## 1. Baseline

Mandatory baseline: `aca5542ddb96651e107a0c3250dd98da431cea76` (Phase 8N
closeout, "Phase 8N: launch Spanish core reference knowledge cluster").
Verified present in `git log`, `HEAD`, and `origin/main` before any work
began; working tree was clean.

## 2. Objective

Complete the Spanish Core Reference Knowledge cluster Phase 8N launched.
Phase 8N shipped 101 Spanish production pages (13 calculators + 54 of 100
glossary terms + 9 formulas + 25 reference pages) but left four gaps,
explicitly documented as scope limitations in
`docs/PHASE-8N-SPANISH-CORE-REFERENCE-PRODUCTION.md`:

- 46 glossary records untranslated.
- Formula variable-table labels/rows English-only.
- Reference table headers/rows English-only (only table `title` fields
  were translated).
- 13 unique / 14 total dangling `formulas.json` `relatedGlossary`
  references, unaudited against the newly-completed glossary.

Phase 8O closes all four gaps and re-audits the formula→glossary
relationship graph, without fabricating anything or touching mathematics.

## 3. Repository Re-Audit (Section 1 of the spec — done from scratch)

Re-derived directly from current repository state, not trusted from the
Phase 8N report:

| Family | Count | Source |
|---|---|---|
| Glossary total | 100 | `data/glossary.json` |
| Glossary translated (pre-8O) | 54 | `data/glossary.json` (`t.es` present) |
| Glossary untranslated (pre-8O) | 46 | computed directly |
| Formulas total | 9 | `data/formulas.json` |
| Reference JSON-driven | 25 | `js/i18n/reference-locale-scope.js#getJsonDrivenScope()` |
| Reference legacy (out of scope) | 11 | `reference-locale-scope.js#LEGACY_EXCLUDED` |
| Reference noindex datasets (out of scope) | 16 | `reference-locale-scope.js#getNoindexDatasetPages()` |
| Spanish calculator pages (pre-8O) | 13 | `es/calculators/*.html` |
| Spanish non-calculator pages (pre-8O) | 88 | `54 + 9 + 25` |
| translation-status.json units (pre-8O) | 105 | `data/i18n/translation-status.json` |
| Formula→glossary unique dangling targets | 13 | computed directly against `data/glossary.json` slugs |
| Formula→glossary total dangling occurrences | 14 | computed directly |

All counts matched the Phase 8N report exactly. No STOP-and-report
condition was triggered.

## 4. Section 2 — Completing the Remaining 46 Glossary Records

All 46 remaining `gl-XXX` records (`gl-013`–`gl-099`, the full list
outside the Phase 8L 54-candidate first wave) received a complete
embedded `es` object: `term`, `definition`, `explanation`,
`whyItMatters`, and `typicalValues` (plus `abbreviation` where the
English record has one), written as professional, natural Spanish and
consistent with the terminology already established in the Phase 8N
cluster and `data/i18n/es/terminology.json` (e.g. `cloro libre`,
`alcalinidad total`, `dureza cálcica`, `ácido cianúrico`, `spa` as the
canonical hot-tub term). English fields were never touched — verified by
a field-by-field diff against the Phase 8N baseline for every record
(`id`, `slug`, `term`, `abbreviation`, `definition`, `explanation`,
`whyItMatters`, `typicalValues`, `relatedCalculators`, `relatedArticles`,
`relatedFormulas`, `lastReviewed`): **0 mismatches**.

Result: **100/100 glossary records now carry an `es` object.**

## 5. Section 3 — Formula→Glossary Relationship Audit

Re-audited all 32 `relatedGlossary` occurrences across the 9 formulas
against the now-complete 100-record glossary, using the existing
`js/i18n/related-link-resolver.js#resolveRelatedLink()` (locale `es`,
`targetFamilyHint: 'glossary'`) — no new resolution logic was written.

- **18 occurrences** (16 unique targets: `pool-volume`, `free-chlorine`,
  `sodium-hypochlorite`, `chlorine-demand`, `shock`, `combined-chlorine`,
  `breakpoint-chlorination`, `calcium-hypochlorite`, `ph`,
  `total-alkalinity`, `muriatic-acid`, `sodium-bicarbonate`,
  `cyanuric-acid`, `gpm`, `langelier-saturation-index`,
  `calcium-hardness`) resolve to their Spanish glossary URL. All 16 of
  these targets were **already** among the Phase 8N 54-term first wave,
  so this was a pure verification step — no data changed to make this
  true, it was already correct before Phase 8O began.
- **14 occurrences** (13 unique targets: `turnover-rate`, `soda-ash`,
  `ph-buffering`, `salt-chlorinator`, `sodium-chloride`, `salt-level`,
  `chlorine-lock`, `uv-degradation`, `pump-head-pressure`,
  `pool-circulation`, `lsi`, `corrosion`, `scaling`) **do not correspond
  to any glossary record at all** — not even an English one. These are
  the pre-existing, documented `formulas.json` data gap from Phase 8L
  (`js/i18n/related-link-resolver.js`'s own header comment names this
  exact "14 reference occurrences (13 unique missing glossary terms)"
  figure). Per the explicit instruction never to fabricate a glossary
  record to satisfy a dangling reference, **these remain unresolved**,
  falling back to Policy A (English target) via the resolver's existing,
  unmodified fallback path. Confirmed after Phase 8O's glossary
  completion that none of these 13 slugs exist in `data/glossary.json` —
  verified directly, not assumed.

Note: `relatedGlossary` is a structured data field consumed only by the
resolver/drift-detection layer; no template currently renders it as a
visible link (confirmed by inspection of `generate-formulas.js` and
`buildFormulaContent()`), so this audit is a correctness proof of the
underlying relationship graph, not a change to any rendered page.

## 6. Section 4 — Formula Variable-Table & Equation-Label Localization

Two additions to each formula's existing `es` object (populated in Phase
8N with `title`/`explanation`/`workedExample`/`limitations`/SEO fields):

- **`es.variables`**: one entry per English `variables[i]`, with
  `description` translated to Spanish and `symbol`/`unit` **copied
  through from the English record** at write time. `template-utils.js#localizeRecord()`
  was additionally hardened to enforce this at render time too — even if
  a future `es.variables` entry carried a tampered `symbol`/`unit`, the
  merge always takes those two fields from the English source record,
  never from `es` (see `test-phase-8o.js` checks 17–18, which construct a
  deliberately sabotaged `es.variables` entry and confirm it is ignored).
- **`es.equationLabels`**: a map from each exact English `'label'`/`'prose'`
  token text in `js/i18n/formula-equation-model.js` to its Spanish
  equivalent (e.g. `"Volume": "Volumen"`, `"Length": "Longitud"`).
  `generate-formulas.js` now calls the existing, unmodified
  `localizeEquation(id, translateLabel)` for locale `es`, using
  `es.equationLabels` as the lookup (falling back to the English label
  text for anything not in the map, so a gap never renders blank/undefined
  text). `formula-09` (LSI) has an empty map because its equation
  contains no label tokens at all (pure symbolic notation).

**Mathematical safety gate result: 9/9 exact equation reconstruction**
(`js/i18n/formula-equation-model.js#reconstructEquation()` still equals
`data/formulas.json`'s own `equation` string for every formula — this is
the English-side proof and was unaffected by adding `es.equationLabels`,
which is a pure addition). The Spanish equation display
(`localizeEquation()`) was verified to preserve every operator, numeric
constant, variable identifier, and unit token exactly — only label/prose
tokens differ from English. Example (`formula-01`):

```
EN: Volume (gal) = Length (ft) × Width (ft) × Average Depth (ft) × 7.48
ES: Volumen (gal) = Longitud (ft) × Ancho (ft) × Profundidad Promedio (ft) × 7.48
```

`js/calc-utils.js` is byte-identical to the Phase 8N baseline (`git diff
--stat aca5542 -- js/calc-utils.js` is empty) — no calculator mathematics
were touched.

## 7. Section 5 — Reference Table Localization

Phase 8N translated only each table's `title` field (13 of 35 total
tables across the 25 pages did not even get that — see Section 7a below).
Phase 8O adds full `headers`/`rows` translation for all 35 tables across
22 of the 25 pages that contain tables (`ref-18`, `ref-20`, `ref-22` have
no tables, only checklists, which Phase 8N already fully translated).

Translation rule applied consistently: label/text cells (parameter names,
chemical names, notes, descriptive text, calculator/resource names) were
translated into professional Spanish; numeric values, ranges, thresholds,
percentages, and units were copied through **byte-identical** from the
English source; `Link`/`Download Link` URL cells were left completely
unchanged (pointing at the same English target — manually hardcoding
`/es/` URLs into raw table data was explicitly out of scope, and these
are static string cells, not resolver-mediated relationships).

**Reference data safety gate result** (machine-checked, not visual
inspection): for every page,

- English `tables` field is byte-identical to the Phase 8N baseline
  (0 mismatches across all 25 pages).
- Every Spanish table has the same row count and column count as its
  English counterpart (0 mismatches).
- Every cell classified as numeric, threshold, or URL (regex-classified:
  starts with `/`, or starts with a digit/`<`/`>` and contains no
  3+-letter word) is byte-identical between English and Spanish
  (337 numeric cells + 22 URL cells verified, 0 mismatches).

### 7a. Correction found and fixed during Phase 8O

While re-auditing, 13 of the 35 table `title` fields turned out to still
be in English despite Phase 8N's `es.tables` array already existing for
those pages (`ref-01` table 1 "Chemical to Raise or Lower", `ref-03`
table 1, `ref-04` table 1, `ref-06` table 1, `ref-08` table 1, `ref-09`
table 1, `ref-13` table 1, `ref-14` table 1, `ref-15` tables 1–2, `ref-23`
tables 1–2, `ref-25` table 1) — Phase 8N had only translated each page's
**first** table title. All 13 were translated and fixed as part of this
phase's table-content work; verified 0 remaining title collisions with
English afterward.

## 8. Section 6 — Content-ID Integrity

- Glossary: 100 unique `id` values, 100 unique `slug` values (0 duplicates).
- Formulas: 9 unique `id` values (0 duplicates).
- Reference: 25 unique `id` values (0 duplicates).
- `translation-status.json`: 151 units, 0 duplicate `contentId` values.
- No legacy fixture IDs (`glossary:free-chlorine`, `formula:pool-volume`,
  `reference:ideal-pool-levels` style) present anywhere.
- The Phase 8M-migrated `glossary:gl-001` unit remains a single unit,
  updated in place — never duplicated.

## 9. Section 7 — Translation-Status Update

46 new `glossary:gl-XXX` units were added (native IDs, `en`/`es` both
`translated`, correct URLs). The 9 `formula:formula-XX` and 25
`reference:ref-XX` units were already `es: translated` from Phase 8N and
did not need a status change — only their underlying content grew richer
(variables/equation labels; table headers/rows). `data/i18n/translation-status.json`'s
`_comment` field was extended (not rewritten) to document this phase's
change, preserving every prior phase's documented history in the same
field.

Final `translation-status.json` composition: 13 calculator + 100
glossary + 9 formula + 25 reference + 4 pre-existing single fixtures
(academy/guide/entity/programmatic) = **151 units, 0 duplicates.**

## 10. Section 8 — Generation Architecture (reused, not duplicated)

No new generator, translation framework, or terminology map was created.
Two additive, backward-compatible extensions were made to the **existing**
architecture:

- `scripts/template-utils.js#localizeRecord()`: extended its existing
  per-index table merge (previously title-only) to also carry
  `headers`/`rows` when present in `es.tables[i]`, and added an
  equivalent per-index merge for `variables[i].description` (always
  taking `symbol`/`unit` from the English record). Both changes are
  pure additions — locale `'en'` behavior is provably unchanged (see
  `test-phase-8o.js` checks 16 and 33).
- `scripts/generate-formulas.js`: now calls the existing (Phase 8M)
  `localizeEquation()` for locale `es`, using `formula.es.equationLabels`
  as the lookup; falls through to the raw `formula.equation` string for
  every other locale, byte-identical to Phase 8N behavior.
- `scripts/generate-spanish-knowledge-cluster.js`: the glossary
  cross-check was changed from "matches the 54-record Phase 8L manifest
  exactly" to "all 100 records carry `es`" — the manifest was always
  documented as the *first wave only*; this is the correct invariant now
  that the wave is complete, not a weakening of any check (a mismatch
  still throws).
- `scripts/data/glossary-terms.js` / `formulas-data.js` /
  `reference-pages.js` (the `populate-data.js` source-of-truth files)
  were synced to carry the same `es` content added to `data/*.json`,
  keeping `validate-source-data-consistency.js` passing — these are data
  files, not new architecture.

## 11. Sections 9–11 — hreflang / Canonical / Switcher / SEO / Schema

All handled by the **existing, unmodified** `js/i18n/hreflang.js`,
`js/i18n/language-switcher.js`, and `scripts/inject-i18n-cluster.js`
(itself unmodified — it is fully data-driven off
`translation-status.json`, so adding 46 new `translated` glossary units
was sufficient for it to inject hreflang + switcher into all 46 new
English/Spanish page pairs with zero code changes). Verified on sample
pages (`glossary/orp.html` ↔ `es/glossary/orp.html`,
`formulas/pool-volume-formula.html` ↔
`es/formulas/pool-volume-formula.html`,
`reference/ideal-pool-levels.html` ↔ `es/reference/ideal-pool-levels.html`):
`<html lang="es">`, self-canonical, reciprocal `hreflang` (en/es/x-default),
and the language switcher link are present on every sample, in both
directions, with no `/es/es/` and no accidental English canonicalization.

## 12. Section 10 — Related Links

Governed entirely by the existing resolver; see Section 5 above. No URL
was ever hand-written into a relationship array. Because the glossary is
now fully translated, every valid glossary relationship that formulas
reference now resolves Spanish→Spanish (it already did, since all valid
targets were in the Phase 8N wave) — the only thing this phase's
completion changed for `relatedGlossary` resolution specifically is
confirming, not creating, that correctness.

## 13. Section 12 — Sitemap / Navigation / Search / Production Count

| Family | Spanish pages |
|---|---|
| Calculators | 13 |
| Glossary | 100 |
| Formulas | 9 |
| Reference | 25 |
| **Total** | **147** |

- `sitemap-glossary.xml`: 100 `/es/glossary/` URLs (exactly once each).
- `sitemap-formulas.xml`: 9 `/es/formulas/` URLs.
- `sitemap-reference.xml`: 25 `/es/reference/` URLs.
- `data/navigation.json` and `data/search-index.json` both index the full
  147-page Spanish set via their existing, unmodified,
  translation-status-driven logic.
- No Spanish Academy/Entity/Guide/Resource/Comparison/Chart/Programmatic
  page exists anywhere in the repository — confirmed by directory
  listing (`es/` contains exactly 4 subdirectories:
  `calculators`, `formulas`, `glossary`, `reference`).

## 14. Section 13/14 — Mathematical & Reference Data Safety Gates

Both gates are described in detail in Sections 6–7 above. Summary:
**9/9** exact equation reconstruction, **0** mismatches in reference
numeric/threshold/unit/URL cells across 337+22 checked values, **0**
row/column count mismatches, `js/calc-utils.js` byte-identical to
baseline. All checks are machine-verified (scripted diffs against the
Phase 8N baseline), not visual inspection.

## 15. Section 15 — Drift Detection

`js/i18n/translation-drift.js#detectDrift()` (unmodified): **0 errors, 0
warnings** against the final `translation-status.json`.

## 16. Section 16 — QA for Spanish Text

`scripts/validate-phase-8o.js` (new, this phase) implements the required
checks: no `<html lang="es">` gaps, no unresolved `{{...}}` tokens, no
`/es/es/`, valid JSON-LD, correct hreflang/canonical, no case-insensitive
`todo` false-positive (uses the same case-sensitive `\bTODO\b` pattern
Phase 8N established), no duplicate content IDs, no fabricated glossary
records, broken-link count, URL/indexation violations, and the full
147-page production count. See Section 20 below for the full 38-item
mapping.

## 17. Section 17 — Determinism

Three separate pairs of consecutive full `node scripts/run-all-generators.js`
runs were executed and diffed file-by-file against the full working tree
(not just `git status` counts): builds 2→3, 3→4 (before the table-title
fix), and 5→6 (the final, corrected state). Every pair produced the
identical 28-file whitelist of differences, **all** pure wall-clock
generation timestamps (`buildDate`, `_generated`, `generatedAt`,
`lastModified`, QA report `timestamp`/"Generated:" lines) inside
`qa-summary.*`, `qa/*.html`, `reports/*.html`, `reports/phase-7*/*.json`,
`data/indexing/*.json`, `data/navigation.json`, `data/platform/compatibility.json`,
and `audit/*`. Every other file among the ~206 changed by the pipeline
was **byte-identical** between consecutive runs. No unexplained content
difference occurred; no normalization was applied to hide anything.

## 18. Section 18 — Full Site Regression

Ran the complete available validator/test suite:

| Check | Result |
|---|---|
| `validate-source-data-consistency.js` | PASS — 0 errors |
| `check-broken-links.js` | PASS — 0 issues, 673 pages |
| `validate-url-indexation.js` | PASS — 0 violations |
| `validate-schema.js` | PASS |
| `validate-schema-content-consistency.js` | PASS — 0 critical |
| `validate-entities.js` | PASSED |
| `validate-entity-provenance.js` | PASS — 0 critical |
| `validate-chemistry-status-integrity.js` | PASS — 0 violations |
| `validate-provenance.js` | PASS — 0 violations |
| `validate-trust.js` / `validate-trust-layer.js` | PASSED / PASS |
| `validate-phase-8m.js` | 7 stale errors (see Section 19) |
| `validate-phase-8n.js` | 8 stale errors (see Section 19) |
| `validate-phase-8o.js` (new) | **PASS — 0 errors, 0 warnings, all 38 checks** |
| `test-phase-8m.js` | 7 stale failures (see Section 19) |
| `test-phase-8n.js` | 3 stale failures (see Section 19) |
| `test-phase-8o.js` (new) | **49/49 passed** |
| `validate-knowledge.js` | 3 pre-existing Academy errors, unrelated to this phase (see Section 19) |
| `qa-engine.js` (full QA report) | 99/100, 0 errors, 6 warnings |

## 19. Stale Historical Assertions (documented, not modified)

Per the explicit instruction not to modify previous phase validators
merely to make them pass:

- **`validate-phase-8m.js`** checks 29/30 hardcode Phase 8M's own
  snapshot ("539 pages / 491 sitemap URLs", "exactly 13 Spanish pages")
  as the expected state. Both counts have legitimately grown since
  (Phase 8N added 88 Spanish pages, Phase 8O added 46 more) — these are
  by-design "this phase's own release fingerprint" checks, not
  regression detectors for later phases.
- **`validate-phase-8n.js`** checks G5/K1/M2 hardcode "88 Spanish files",
  "54 `/es/glossary/` sitemap URLs", and "no Phase 8N commit exists yet"
  — all true only during Phase 8N itself, all now superseded by design
  (100 glossary terms, and Phase 8N's commit `aca5542` is the current
  baseline).
- **`test-phase-8m.js`** checks 40/41/43/44 similarly hardcode Phase 8M's
  own zero-Spanish-non-calculator-content snapshot.
- **`test-phase-8n.js`** checks 27/33/34 assert the Phase 8N-era
  limitations this phase was explicitly created to remove (Spanish
  equation identical to English; Spanish table headers identical to
  English; the 54-record manifest cross-check) — failing them is the
  intended, correct outcome of Phase 8O's work, not a regression.
- **`validate-knowledge.js`** reports 3 Academy-related errors ("expected
  48 academy articles, found 50"; a category count mismatch; one
  `relatedTopics` slug). Verified via `git stash` that these three errors
  are **identical** on the unmodified Phase 8N baseline (`aca5542`) —
  Phase 8O never touched `data/academy.json` or any academy source file
  (confirmed: `git diff --stat aca5542 -- data/academy.json` is empty).
  This is a pre-existing condition from an earlier phase, unrelated to
  Spanish localization.

## 20. Known Limitations

- Reference table `Link`/`Download Link` URL cells (e.g. in `ref-24`,
  `ref-25`) point at English targets even where a Spanish calculator page
  exists, by deliberate policy (no manual `/es/` hardcoding into raw
  table data, per explicit instruction) — this is a minor, intentional
  UX gap, not an error.
- `relatedGlossary` in `data/formulas.json` remains a structured data
  field with no rendered UI surface anywhere on the site (true before
  and after this phase) — its resolution correctness was audited and
  proven, but no visible link exists for a user to click either way.
- 13 unique formula→glossary relationships remain permanently unresolved
  (Policy A English fallback) because no corresponding glossary record
  exists in English either — this is not a Spanish-specific gap and
  cannot be closed without adding new glossary records, which is
  explicitly out of scope for this phase.
- This phase does not claim complete Spanish coverage of the entire
  site — Academy, Entities, Guides, Resources, Comparisons, Charts, and
  Programmatic families remain entirely untranslated by design (out of
  scope, per Section headers above).

## 21. Files Changed / Created

See `reports/phase-8o-status.md` for the itemized file list.
