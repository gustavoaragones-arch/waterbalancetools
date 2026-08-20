# Entity & Glossary Content Policy (Phase 7I, Steps 5-6)

## Entity content model

Created `scripts/data/entity-content-policy.js` — a policy reference documenting which content dimensions (concise definition, full definition, ideal range, chemistry implications, calculator relationship, related entities, source organizations, academy/glossary cross-reference) are legitimate for which entity `type` (chemical, measurement, unit, pool-type, equipment, process, problem, organization, resource, chemical-product). It does **not** create a second rendering pipeline — `scripts/generate-entity-pages.js` remains the single entity-page generator; this file documents intent so future entity records aren't padded with sections that don't fit them (the brief's explicit fiberglass-pool example: a pool-construction material entity should not get a chemical-treatment section merely because a chemical-parameter entity has one).

Every entity type gets a baseline (concise + full definition, related entities); richer dimensions (ideal range, chemistry implications, source organizations) are only used where the entity's own data genuinely supports them — this was already how `generate-entity-pages.js`'s `buildXSection()` functions behaved (they render nothing when the underlying field is empty), so this document mostly makes existing, correct behavior explicit rather than changing it.

## The actual root-cause finding

The reason 55 of 104 entity pages were flagged thin in the Phase 7H/7I baseline was not a missing-content-dimension problem — every entity already had a genuine, differentiated `longDescription` authored in `scripts/data/entities-*.js`. The bug was in the compiler: `scripts/generate-entities.js` built `data/graph/entity-index.json` (the file the page generator actually reads) with an explicit field list that omitted `longDescription`, `aliases`, `synonyms`, and `sourceOrganizations`. Every entity page sitewide rendered only the one-sentence `shortDescription` in its "Definition" section as a result. Fixed by adding the four fields to the compiler's output object. This is the single highest-leverage fix this phase made — one generator change surfaced already-authored, already-differentiated content across the entire entity corpus, with zero new content written.

## Glossary content model

Audited `scripts/generate-glossary.js` and `scripts/data/glossary-terms.js` (via `data/glossary.json`): the glossary already implements close to the brief's preferred pattern — `definition` (direct answer) → `explanation` (practical meaning) → `whyItMatters` (important distinction/context) → `typicalValues` (when applicable) → `relatedCalculators`/`relatedArticles`/`relatedFormulas` (tool/concept links). No architecture change was needed here; every glossary-term IMPROVE flag in the baseline (7 of 100) was a title-length SEO issue, not a content-depth issue — confirmed by direct read of the flagged pages.

## What distinguishes glossary from entity from guide

- **Glossary**: single-term lookup. Answers "what does X mean" concisely, points outward to calculators/articles rather than duplicating their content.
- **Entity**: a node in the site's knowledge graph — carries relationship data (related entities, calculators, academy articles, reference pages, charts) that a glossary term doesn't. Broader than a glossary definition; still not a full article.
- **Guide/Academy**: full articles answering "why/how" questions with multi-paragraph explanation, examples, and procedural steps — the tier above both glossary and entity pages.
- **Authority reference**: structured tables/charts for a specific parameter or comparison, not a definitional lookup.
- **Calculator**: an interactive tool; entity/glossary pages link to it, they don't replicate its function.

No glossary pages were expanded into miniature articles this phase; none needed to be.

## Duplication check after improvements (Step 11)

Re-ran the forensic duplication audit after all entity/glossary changes: `entities` family remains LOW risk (avg_pairwise_similarity essentially unchanged — the longDescription fix added real, differentiated prose per page, which if anything reduces cross-page similarity since every page's Definition section is now unique instead of near-identical boilerplate-length one-liners). No new shared paragraph/FAQ/CTA block was introduced across the corpus; the fix was purely a compiler field-inclusion change, not a new templated section.
