# Phase 8P Status Report — Spanish Expansion Strategy & Next-Cluster Selection

## 1. Executive Decision

- **Selected family:** Academy
- **Selected cluster (bounded first wave):** Academy → Fundamentals category
  (`fund-01` through `fund-08`)
- **Page count:** 8 articles (of 50 total in the family; 42 remain for a
  later completion phase, mirroring the Glossary's 54-then-46 pattern)
- **Readiness:** **OPTION B — PREPARATION REQUIRED**
- **Preparation required:** Yes — four bounded, previously-solved-pattern
  architecture gaps (locale-aware content builders, generator locale wiring,
  resolver family registration, embedded `es` schema design) must be closed
  before any real Spanish Academy content is produced.
- **Exact reason:** Academy scores highest of all seven remaining families
  (53/60) on a 12-criterion evidence-based rubric — deepest editorial content
  in the site, native stable IDs, the same JSON-driven pipeline as the three
  already-completed families, and 3 of its 4 non-intra-family relationship
  types already resolve correctly through the existing link resolver without
  any change. It is not yet production-ready because its content builders
  (`buildArticleContent`, `buildAcademySidebar`) and generator
  (`generate-academy.js`) are locale-free, and the resolver does not index
  the `academy` family — the same class of gap Phase 8O closed for Formulas
  and Reference.

## 2. Certified Baseline

- Verified baseline: `a4a6b8e64cc0dfbf308bdb1e9ec96e68febb0662`
  ("Phase 8O: complete Spanish core reference knowledge cluster")
- `HEAD` == `origin/main` == `a4a6b8e64cc0dfbf308bdb1e9ec96e68febb0662` at
  phase start, confirmed by `git rev-parse`.
- Working tree was clean at phase start.
- No commit, no push, and no Phase 8Q work occurred during Phase 8P.

## 3. Current Spanish Production Inventory

| Family | Spanish pages |
|---|---|
| Calculators | 13 |
| Glossary | 100 |
| Formulas | 9 |
| Reference (JSON-driven) | 25 |
| **Total** | **147** |

All other families (Academy, Entities, Guides, Resources, Comparisons,
Charts, Programmatic): **0** Spanish pages each — confirmed via
`find es/<family> -name '*.html'` for all seven.

## 4. Remaining English Corpus

| Family | HTML pages | Native IDs | Source architecture |
|---|---|---|---|
| Academy | 59 (50 leaves + 9 hubs) | Yes | `data/academy.json`, `populate-data.js` pipeline |
| Entities | 105 (104 leaves + 1 hub) | Yes (bare slugs) | `data/graph/entity-index.json`, separate pipeline |
| Guides | 49 (41 leaves + 8 hubs) | No | Fragmented — 20 of 41 leaves have no generator at all |
| Resources | 9 (8 leaves + 1 hub) | No | Inline array in generator, no data file |
| Comparisons | 8 (5 generated leaves + 2 orphans + 1 hub) | No | Inline array in generator, no data file |
| Charts | 12 files / 10 unique URLs (9 indexable leaves + 1 hub + 2 noindex dupes) | No | Split: 5 generated, 4 ungenerated; own chrome, bypasses shared template system |
| Programmatic | 44 (36 leaves + 8 hubs) | No | 7 generator/config pairs; 26 leaves fully parametric, 10 editorial |

## 5. Translation-Status Audit

- Total units: **151**
- `es: translated`: 147 (calculator 13, glossary 100, formula 9, reference 25)
- `es: missing`: 4 (`academy:fund-01`, `guide:ph-can-you-swim-in-high-ph-water`,
  `entity:algae`, `programmatic:chlorine-10000-gallon` — all pre-Phase-8L
  fixtures, no `_migratedFrom`)
- Duplicate `contentId`s: 0
- Legacy fixture IDs: 0
- No structural blocker in the translation-status schema for any candidate
  family — adding a new category is additive, as already proven by
  Glossary's 46-unit Phase 8O expansion.

## 6. Family-by-Family Readiness Audit

See `docs/PHASE-8P-SPANISH-EXPANSION-STRATEGY-AUDIT.md` Section 8 for the
full evidence-backed audit of all seven families (Academy, Entities, Guides,
Resources, Comparisons, Charts, Programmatic).

## 7. Candidate Cluster Analysis

Primary: **Academy → Fundamentals** (8 articles). Sequenced second:
**Entities** (recommended only after Academy, since 189 of its relationship
references point at Academy articles and cannot resolve to Spanish until
Academy exists). Rejected as primary: Guides (lowest score, 20/41 leaves
have no data record), Resources (small size ≠ value), Comparisons (too
small a corpus to anchor a phase), Charts (bypasses the shared i18n chrome
system entirely), Programmatic (highest schema complexity, no native IDs,
real housekeeping debt — deferred per the Director's explicit high-risk
treatment despite a de-risked parametric subset).

## 8. Scoring Matrix

| Family | Total (/60) |
|---|---|
| Academy | **53** |
| Entities | 40 |
| Comparisons | 40 |
| Programmatic | 30 |
| Charts | 30 |
| Resources | 32 |
| Guides | 26 |

Full 12-criterion breakdown with cited evidence: audit doc Section 9.

## 9. Architecture Readiness

Four bounded blockers for Academy, all previously-solved patterns from
Phase 8O (not new architecture):

1. `buildArticleContent()` / `buildAcademySidebar()` in
   `scripts/template-utils.js` are locale-free.
2. `scripts/generate-academy.js` has zero `locale`/`localizeRecord` wiring.
3. `js/i18n/related-link-resolver.js` does not index the `academy` family
   (needed only for `relatedTopics`).
4. No embedded `es` schema is yet defined for an Academy article/category
   record.

## 10. Risks and Constraints

- Academy's average 587 words/article means full-family translation is a
  substantially larger content effort than Glossary's, even with a cleaner
  architecture — argues for the bounded Fundamentals-first wave.
- `relatedGlossary`/`relatedFormulas` (179 + 35 items) are stored in
  `data/academy.json` but never rendered in HTML today, in English or
  Spanish. This should be a deliberate decision in Phase 8Q, not a silent
  scope change.
- Entities' link value is partially gated on Academy — do not resequence
  without re-running this analysis.
- No `academy-locale-scope.js`-equivalent bounded-scope module exists yet;
  Phase 8Q should define the Fundamentals-cluster boundary explicitly and
  deterministically, mirroring `reference-locale-scope.js`.

## 11. Primary Recommendation

**OPTION B — PREPARATION REQUIRED.** See Section 1 and audit doc Section 15
for full reasoning.

## 12. Phase 8Q Definition

Phase 8Q = architecture preparation only, no Spanish Academy content
written. Full definition (files to change, exact preparation steps,
validation requirements, explicitly deferred production work): audit doc
Section 16.

## 13. Regression Results

| Check | Result |
|---|---|
| `node scripts/check-broken-links.js` | ✓ 0 issues, 673 pages |
| `node scripts/validate-url-indexation.js` | PASS, 673 pages, 625 sitemap URLs, 0 violations |
| `node scripts/validate-source-data-consistency.js` | PASS, 0 errors |
| Translation drift (`js/i18n/translation-drift.js`) | 0 errors, 0 warnings |
| `js/calc-utils.js` vs `a4a6b8e` | byte-identical |
| `data/formulas.json`/`data/reference.json`/`data/glossary.json` vs `a4a6b8e` | byte-identical |
| Spanish page count | 147 (unchanged) |
| English URL regression | 0 |
| Sitemap/navigation/search-index topology | unchanged |

## 14. Determinism Results

Phase 8P is read-only. All counts were derived via non-mutating `node -e`
inspection, `grep`, and `find` against the existing repository state — no
generator was run in a way that writes tracked output. `git status --short`
was empty both before and after the audit's investigation.

## 15. Files Created

1. `docs/PHASE-8P-SPANISH-EXPANSION-STRATEGY-AUDIT.md`
2. `reports/phase-8p-status.md` (this file)
3. `scripts/validate-phase-8p.js`
4. `scripts/test-phase-8p.js`

No other files were created or modified by Phase 8P.

## 16. Production-Scope Confirmation

- Zero new Spanish production pages were created.
- Zero English production pages were added, removed, or modified.
- Zero existing Spanish production pages (the 147-page Phase 8O corpus) were
  modified.
- Zero sitemap, navigation, or search-index entries were added or removed.
- Zero calculator, formula, or reference source data was mutated.
- Zero commits were made. Zero pushes were made.
- Phase 8Q was not started.

## 17. Final Gate

**PHASE 8P COMPLETE.**

Primary recommendation: **OPTION B — PREPARATION REQUIRED**, targeting
Academy (bounded first wave: Fundamentals, 8 articles) as the next Spanish
expansion cluster, with Phase 8Q scoped as pure architecture preparation
(Section 12 / audit doc Section 16). Phase 8Q has not been started. No
commit or push occurred.
