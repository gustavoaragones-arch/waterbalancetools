# PHASE 8N — SPANISH CORE REFERENCE KNOWLEDGE PRODUCTION CLUSTER

## 1. Baseline

Mandatory baseline: `af4ba29ad344b0a52e874e961498e20b09ae0578` (Phase 8M
closeout, "Phase 8M: core reference localization plumbing implementation").
Verified present in `git log` before any work began.

## 2. Objective

Use the localization architecture built in Phases 8L/8M (embedded `es`
data model, generic related-link resolver, structured formula-equation
model, reference scope boundary, locale-aware generator wiring, drift
detector) to produce the **first real Spanish production cluster** for
Glossary, Formulas, and Reference — the three non-calculator families
that, before this phase, had zero real Spanish content despite having
fully-built plumbing.

This is explicitly a **first controlled cluster**, not complete Spanish
coverage of these families. See Section 14.

## 3. Repository Re-Audit (Section 3 of the spec — done from scratch)

Re-derived directly from current repository state, not trusted from
historical Phase 8K/8L/8M counts:

| Family | Count | Source |
|---|---|---|
| Glossary total | 100 | `data/glossary.json` |
| Glossary manifest candidates | 54 | `data/i18n/es/glossary-first-wave.json` |
| Formulas total | 9 | `data/formulas.json` |
| Reference JSON-driven | 25 | `data/reference.json` / `js/i18n/reference-locale-scope.js` |
| Reference legacy (out of scope) | 11 | `reference-locale-scope.js#LEGACY_EXCLUDED` |
| Reference noindex datasets (out of scope) | 16 | `reference-locale-scope.js#getNoindexDatasetPages()` |
| Reference unexpected/unclassified | 0 | `classifyReferenceScope()` |
| translation-status.json units (pre-8N) | 20 | `data/i18n/translation-status.json` |

All counts matched Phase 8M's documented state exactly. No re-verification
finding required a STOP-and-report.

One re-verification finding did require a decision (not a stop): `gl-001`,
`formula-01`, and `ref-01` are simultaneously (a) in the 8N scope and (b)
already-registered `translation-status.json` units from the Phase 8M
content-ID migration, with `es: missing`. Resolution: those 3 units were
updated **in place** (`es.status` flipped to `translated`), not duplicated.
The remaining 85 records received brand-new native-ID units. See Section 6.

## 4. Deterministic Production Scope

- **Glossary**: exactly the 54 native IDs in
  `data/i18n/es/glossary-first-wave.json`, re-validated 1:1 against the
  glossary records that actually carry an `es` object
  (`scripts/validate-phase-8n.js` checks C1/C2).
- **Formulas**: all 9 records in `data/formulas.json`.
- **Reference**: exactly the 25 JSON-driven records
  `js/i18n/reference-locale-scope.js#getJsonDrivenScope()` returns. The 11
  legacy and 16 noindex-dataset pages were never touched — they have no
  `data/reference.json` record to carry an `es` object on in the first
  place, so the scope boundary is structural, not just a convention.

`scripts/generate-spanish-knowledge-cluster.js` re-asserts all three
cross-checks at generation time and throws (does not silently generate a
different set) on any mismatch.

## 5. Source-of-Truth Correction (found during implementation)

`data/glossary.json`, `data/formulas.json`, and `data/reference.json` are
**compiled output**, not editable source — `scripts/populate-data.js`'s
own header comment states this, and `scripts/validate-source-data-
consistency.js` (part of `npm run build`) enforces it. The Spanish
content was therefore written into the authoritative source files under
`scripts/data/` (`glossary-terms.js`, `formulas-data.js`,
`reference-pages.js`) as an `es: {...}` property on each in-scope record
— inserted immediately after that record's `id:` field via a scripted,
anchor-based text edit (never touching any other field) — and then
`node scripts/populate-data.js` was run to regenerate the compiled JSON.
`validate-source-data-consistency.js` reports 0 errors against the final
state.

## 6. Content-ID Integrity

- Native source IDs only: `glossary:gl-XXX`, `formula:formula-XX`,
  `reference:ref-XX`. No legacy fixture ID (`glossary:free-chlorine`,
  `formula:pool-volume`, `reference:ideal-pool-levels`) was reintroduced.
- `gl-001`, `formula-01`, `ref-01` (pre-existing, Phase-8M-migrated units)
  were updated in place: `es.status: missing` → `translated`. Their URLs
  were already correct and were asserted unchanged.
- 85 new units were created (53 glossary + 8 formula + 24 reference).
- `data/i18n/translation-status.json` now holds 105 units total (was 20).
  Zero duplicate content IDs (`scripts/validate-phase-8n.js` check D1).

## 7. Spanish Content

All prose (`term`/`title`/`definition`/`explanation`/`whyItMatters`/
`typicalValues` for glossary; `title`/`explanation`/`workedExample`/
`limitations`/SEO fields for formulas; `title`/`description`/`summary`/
`overview`/`notes`/`checklists` for reference) was written as
professional, natural Spanish, using the Phase 8F terminology
architecture's default register (no synonym stuffing). Chemistry
abbreviations that are internationally standard (FC, CC, TA, CH, CYA,
LSI, HOCl, ppm, GPM, pHs) are kept unchanged in Spanish prose, consistent
with how Phase 8F already treats them.

**Documented, deliberate scope limitations** (per the spec's explicit
instruction to report rather than invent):

- Reference table **titles** are translated; table **headers and row
  data** are left as English structured/tabular data. A survey found 102
  unique column headers and hundreds of row cells across the 25 tables —
  translating all of it was out of proportion to a first controlled
  cluster. `js/i18n/reference-locale-scope`'s data model and
  `template-utils.js#localizeRecord()` merge only the table `title`
  field per table, by index, preserving `headers`/`rows` untouched.
- Formula **variable-table** rows (Symbol/Description/Unit) stay English.
  The spec's explicit prohibition on altering "variables" was read
  conservatively: the `variables` array is never touched by the `es`
  object at all, and the rendered table reads directly from the English
  `formula.variables`, never from a localized copy.

## 8. Formula Equation Safety

`js/i18n/formula-equation-model.js#reconstructEquation(id)` was re-run
after the Spanish content was added and still exactly matches
`data/formulas.json`'s `equation` string for all 9 formulas — the `es`
object never defines an `equation` or `variables` key, so nothing could
have touched them. `scripts/validate-phase-8n.js` checks E1/E2 assert
this permanently.

## 9. Generation Mechanism

Per the Phase 8M implementation contract (Section 15 of
`docs/PHASE-8M-...md`), a new small generator,
`scripts/generate-spanish-knowledge-cluster.js`, was added — mirroring
exactly how `scripts/generate-spanish-cluster.js` (Phase 8E) writes
`es/calculators/`. It calls `generateTerm(term, 'es')` /
`generateFormula(formula, 'es')` / `generateRefPage(page, 'es')` for the
approved records and writes to `es/glossary/<slug>.html`,
`es/formulas/<slug>.html`, `es/reference/<slug>.html`.

**Gap found and closed**: `generateTerm`/`generateFormula`/
`generateRefPage` accepted a `locale` parameter since Phase 8M, but only
wired it through to canonical URL, `html lang`, and related-link
resolution — the actual title/definition/content text always rendered
from the English fields regardless of locale, and all UI chrome (nav
labels, breadcrumb "Home", section headings like "Why It Matters") was
hardcoded English. This phase added:

- `template-utils.js#localizeRecord(record, locale)` — merges a record's
  `es` object over its English fields for locale `'es'`, with special
  handling for reference tables (Section 7). Returns the record
  unchanged for `'en'` or when no `es` object exists.
- `template-utils.js#chrome(key, locale)` — a small bilingual dictionary
  for the ~30 static UI strings used by these three templates/content
  builders (nav labels, aria-labels, section headings, breadcrumb "Home"/
  hub labels). Every call site defaults to the exact pre-existing English
  string for locale `'en'`.
- `buildBreadcrumb(cleanPath, pageTitle, locale)` gained an optional
  third parameter (`'Home'`→`'Inicio'`, hub labels translated, hub
  **hrefs** stay English since hub pages are not translated — Policy A).
- `buildTermContent`/`buildRefContent`/`buildFormulaContent`/
  `buildRelatedTools`/`buildRelatedTopics` now select their section
  headings via `chrome()`.
- `templates/glossary-template.html` / `formula-template.html` /
  `reference-template.html` had their previously-hardcoded header nav
  labels/aria-labels (and, for formulas, the "The Formula"/"Worked
  Example" headings and table headers) replaced with tokens supplied by
  the generator per locale.

All of this is additive and gated on `locale`; `scripts/test-phase-8n.js`
proves locale `'en'` output is unchanged (byte-identical to calling the
function with no locale argument at all) for all three generators.

## 10. Related-Link Resolution (Policy A)

Every relationship link in the 88 new pages is routed through the
existing `js/i18n/related-link-resolver.js` (unmodified). Verified by
direct inspection: a translated relationship target (e.g. a Spanish
calculator) resolves to its `/es/` URL; an untranslated target (e.g. an
Academy article) falls back to its English URL. No missing glossary
target was fabricated — the previously-documented 13 unique / 14-
occurrence dangling `relatedGlossary` references in `formulas.json`
remain exactly as they were, unfabricated.

## 11. i18n Integration

- `html lang="es"` on every Spanish page, `lang="en"` unchanged on every
  English page (`js/i18n/html-lang.js`, unmodified).
- Self-canonical `/es/...` URL on Spanish pages
  (`js/i18n/locale-url.js`, unmodified).
- Reciprocal `hreflang` (en/es/x-default) and a language-switcher link on
  **both** the new Spanish file and its English counterpart, injected by
  the existing, unmodified `scripts/inject-i18n-cluster.js` — entirely
  data-driven from `translation-status.json`, no new injector written.
- **Bug found and fixed**: `inject-i18n-cluster.js`'s switcher-anchor
  regex required an exact `href="/search/"` (trailing slash) — true for
  calculator pages' final post-processed form, but glossary/formula/
  reference/academy pages resolve the same link to `href="/search"` (no
  trailing slash) via the shared URL engine. This is the first time any
  content in this second group was ever a translated unit, so the gap
  was latent, not something Phase 8N broke. Fixed by matching an optional
  trailing slash; the exact fail-fast guarantee (throws if neither form
  is present) is unchanged.
- Navigation (`generate-navigation.js`), search index
  (`generate-search-index.js`), and sitemaps (`generate-sitemaps.js`) all
  correctly include the 88 new pages — all three were already
  language-aware and gate strictly on `translation-status.json`, per
  Phase 8F. No change was needed in any of them.

## 12. Pipeline-Ordering Fix (build-order bug found and fixed)

`scripts/generate-glossary.js`/`generate-formulas.js`/
`generate-reference.js` rewrite their English pages **wholesale** from
data + template on every build (unlike calculators, which are edited in
place) — so any hreflang/switcher content injected into an English
glossary/formula/reference page on a previous build is wiped the moment
the next build's English-mode generation loop runs, and only re-added
later by `inject-i18n-cluster.js`. `generate-qa-report.js`'s orphan-page
audit (an inbound-internal-link count) previously ran in that
in-between window — it saw the 88 new Spanish pages, but not yet their
inbound switcher links, and failed the release gate as "88 orphan pages"
on every build after the first, not just a one-time bootstrap hiccup.
Calculators never hit this because their switcher links are baked into
hand-edited HTML that persists between builds untouched by any
wholesale-rewrite step.

Fix: moved the `generate-qa-report.js` call from immediately after
`validate-trust.js` to immediately after the post-i18n
`validate-url-indexation.js` refresh (i.e., after the Spanish cluster +
injection + nav/search/sitemap refresh). The only consumer positioned
before the new spot, `generate-version-badges.js`'s cosmetic "QA nn/100"
footer badge, now reads the previous build's score for one cycle — the
same one-run-behind staleness `generate-hubs.js`'s own read of
`qa-summary.json` has always had.

Two smaller, same-root-cause fixes, both found via this same first-real-
content exposure:

- `scripts/normalize-seo-metadata.js` (adds OG/Twitter/robots/last-
  updated/content-version meta tags) also runs before the Spanish
  cluster exists. Re-run via `execSync` after `inject-i18n-cluster.js` so
  the 88 new files get these tags too, reading their already-correct
  Spanish `<title>`/`<meta name="description">` — never overwriting them
  with English text.
- `scripts/qa-engine.js`'s content audit used `/\bTODO\b/i` (case-
  insensitive) to detect placeholder text — which matches the common
  Spanish word "todo" ("all"/"everything") wherever it appears in real
  prose. Made case-sensitive (real placeholder markers are always
  written in caps); `lorem ipsum` stays case-insensitive. The same
  audit's "missing updated date" check also now recognizes "última
  revisión" alongside "Last updated"/"last reviewed".

All four fixes are additive/corrective (new recognized patterns, a moved
gate), never a loosened threshold or a removed assertion.

## 13. Determinism

Three consecutive `node scripts/run-all-generators.js` runs from a clean
state were compared file-by-file (`diff -rq`) across `glossary/`,
`formulas/`, `reference/`, `es/glossary/`, `es/formulas/`,
`es/reference/`. Run 1→2 showed exactly one difference:
`reference/index.html`'s pre-existing "Recently Updated" freshness
widget (driven by `data/indexing/freshness.json`, a wall-clock/build-
history feature, not content) went from listing the just-changed pages
to an empty list once the tree had already converged. Run 2→3 was
**byte-identical** with zero differences. This matches the project's
established "freshness.json"/"navigation.json" convergence pattern
(Phase 8B) — not a Phase 8N regression.

## 14. Known Limitations (explicitly NOT complete coverage)

- 46 of 100 glossary terms remain `es: missing` — only the Phase 8L
  54-candidate manifest was translated.
- Reference table headers and row data (Section 7) remain English.
- Formula variable-table Symbol/Description/Unit rows remain English.
- The Glossary/Formulas/Reference **hub** pages
  (`/glossary`, `/formulas`, `/reference`) are not translated; Spanish
  breadcrumbs link to them with a translated label but an English href
  (Policy A), identical to how the Spanish calculator cluster already
  treats `/calculators/`.
- The pre-existing, documented 13 unique / 14-occurrence dangling
  `relatedGlossary` references in `formulas.json` (a Phase 8L finding)
  remain unfabricated and unresolved by this phase.
- Academy, Entities, Programmatic, Guides, Comparisons, and all other
  non-Glossary/Formula/Reference families remain entirely untranslated.

This is a first controlled production cluster, not complete Spanish
coverage of Glossary/Formulas/Reference.

## 15. Files Changed

New:
- `scripts/generate-spanish-knowledge-cluster.js`
- `scripts/validate-phase-8n.js`
- `scripts/test-phase-8n.js`
- `es/glossary/*.html` (54), `es/formulas/*.html` (9), `es/reference/*.html` (25)
- `docs/PHASE-8N-SPANISH-CORE-REFERENCE-PRODUCTION.md`, `reports/phase-8n-status.md`

Modified:
- `scripts/data/glossary-terms.js`, `formulas-data.js`, `reference-pages.js` (added `es` objects)
- `data/glossary.json`, `data/formulas.json`, `data/reference.json` (regenerated from source via `populate-data.js`)
- `data/i18n/translation-status.json` (88 units: 3 updated in place, 85 new)
- `scripts/template-utils.js` (`localizeRecord`, `chrome`, `ES_CHROME`, `ES_DIR_LABELS`, locale-aware `buildBreadcrumb`/content builders)
- `scripts/generate-glossary.js`, `generate-formulas.js`, `generate-reference.js` (locale-aware rendering, `module.exports`)
- `templates/glossary-template.html`, `formula-template.html`, `reference-template.html` (chrome tokens)
- `scripts/inject-i18n-cluster.js` (search-link anchor tolerance)
- `scripts/qa-engine.js` (bilingual-aware TODO/updated-date checks)
- `scripts/run-all-generators.js` (Spanish cluster wiring; `generate-qa-report.js`/`normalize-seo-metadata.js` reordering)
- Every English glossary/formula/reference page that received a translated counterpart (additive hreflang + switcher block only)

Untouched (verified byte-identical to the Phase 8M baseline):
- `js/calc-utils.js`
- Every English field in `data/glossary.json`/`formulas.json`/`reference.json`
- All 46 untranslated glossary terms' HTML
- Academy, Entities, Programmatic, Guides, Comparisons, and every other family

## 16. Validation

- `node scripts/validate-source-data-consistency.js` — PASS, 0 errors.
- `node scripts/validate-phase-8n.js` — 39 OK, 0 errors, 0 warnings.
- `node scripts/test-phase-8n.js` — 41 passed, 0 failed.
- `node scripts/check-broken-links.js` — 0 issues, 627 pages.
- `js/i18n/translation-drift.js#detectDrift()` — 0 errors, 0 warnings.
- `node scripts/run-all-generators.js` — exit 0; QA release gate 99/100, Green.
- Three-consecutive-build determinism — confirmed (Section 13).

## 17. Commit Status

**NOT COMMITTED, NOT PUSHED.** Per explicit instruction, this phase ends
with an uncommitted working tree for Director review. No Phase 8O work
was started.
