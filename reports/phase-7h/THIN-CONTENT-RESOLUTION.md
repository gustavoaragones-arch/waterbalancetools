# Thin Content Resolution (Phase 7H, Steps 10-13)

## Method

Re-ran the Phase 7A content-quality audit fresh against the current, post-7G repository state (not assumed from the original numbers) and re-evaluated every flagged page against its actual current content, per Step 10's explicit test: *a page is thin when it fails to satisfy its intended query, not merely because it has few words.*

Current `action-matrix.csv`: 175 pages flagged IMPROVE (0 P0, 0 P1-by-content, 96 P2, 79 P3). A separate 28-row P1 tier exists in the same matrix but is entirely `action: MERGE` (near-duplication risk, not thinness) — addressed below.

## P1 tier: near-duplication MERGE flags (28)

| Group | Count | Disposition |
|---|---:|---|
| `programmatic/{chlorine,ph,shock,hot-tubs}/*` | 26 | **Not reopened.** This is exactly the territory Phase 7G already analyzed in depth and made a deliberate, documented KEEP decision on (`reports/phase-7g/PROGRAMMATIC-DECISIONS.csv`, `PHASE-7G-PROGRAMMATIC.md`) — every page answers a distinct real long-tail query tied to the user's own volume/pH/spa size. Phase 7H's explicit instruction is "Do NOT reopen Phase 7G as a broad content rewrite" (Step 13); the generic duplication heuristic firing again on the same pages is expected and does not override 7G's specific, reasoned KEEP. |
| `entities/fiberglass-pool.html`, `entities/vinyl-pool.html` | 2 | **Genuine finding, classified INVESTIGATE.** These two entity pages are near-duplicates of each other: the entire body is a one-sentence hero summary plus a one-sentence "Definition" (identical structure, differing only in "fiberglass" vs "vinyl" wording) — the "Quick Facts", "Formulas", "Glossary", "Resources", and "Charts" sections are all empty in the underlying entity data. Fixing this properly means adding genuine, differentiated, sourced facts (e.g. real calcium-hardness targets or lifespan differences per surface type) to the entity data source (`scripts/data/entities-*.js` → `scripts/generate-entity-pages.js`), which would need the same sourcing rigor as the Phase 7D-7F chemistry provenance work to avoid inventing unsupported claims. Not attempted in this pass — flagged as a specific, scoped candidate for a future content/data phase rather than either ignored or filled with filler. |

## P2/P3 tier (175 total)

| page_type | Count | Disposition |
|---|---:|---|
| entity | 55 | INVESTIGATE (same class of issue as fiberglass/vinyl above — likely several more entity pages share the same thin one-sentence-definition pattern; needs its own audit pass, not attempted here) |
| internal-dashboard | 17 | KEEP — noindex internal tooling, not reader-facing content; word count is irrelevant |
| guide / academy-article | 27 | INVESTIGATE — flagged mostly on `TITLE_TOO_LONG` on-page SEO signal, not genuine content thinness; see below |
| programmatic-longtail | 10 | Deferred to Phase 7G's KEEP decision, same reasoning as the P1 tier |
| dataset-page | 9 | KEEP — noindex reference data pages, table-format content genuinely satisfies their purpose |
| reference-page | 8 | See below — spot-checked, mostly a title-length signal, one genuine case examined |
| glossary-term | 7 | INVESTIGATE — not individually reviewed this pass |
| calculator | 6 | See below — all 6 are `TITLE_TOO_LONG`, not content-thin |
| chart, comparison, resource, formula-page, printable, release-notes, other | 30 | Not individually reviewed this pass |

## Spot-check: calculators and reference pages (Step 11 priority order)

Per Step 11's explicit priority (calculators and authority/reference pages rank above entities/glossary), these were checked first. All 6 flagged calculators and 7 of 8 flagged reference pages carry only a `TITLE_TOO_LONG` on-page SEO evidence tag — a `<title>` tag length concern, not a content-depth concern. This is a real, legitimate finding but belongs to on-page SEO metadata work, not the schema/thin-content/accessibility/AEO scope this phase was chartered for; it is logged here rather than silently dropped, as a candidate for a dedicated future metadata pass.

The one reference page flagged on a genuine content signal, `reference/printable-resources-index.html` (word_count=132), was read in full: it is a directory table of 8 printable resources with clear "best for" descriptions and working links. It satisfies its actual intended query (finding the right printable) despite low word count — classified **KEEP by policy**, per Step 10's explicit instruction not to expand a page merely to hit a word-count target.

## What was NOT done, and why

175 IMPROVE-flagged pages were not bulk-edited. Per Step 12 ("do not add generic filler... do not create another sitewide template duplication problem") and Step 10 ("do not expand pages merely to hit a word count"), attempting a uniform content-depth pass across 175 pages in this session would either (a) require fabricating specifics not grounded in real, sourced facts — a direct violation of this project's chemistry-provenance rules for any page touching chemistry claims — or (b) produce the same kind of shallow, templated padding this project's Phase 7G work spent real effort removing. The two entity pages with a concretely identified, well-understood gap are named explicitly above rather than generically deferred; the remainder are logged as a prioritized review queue (entities first per the real duplication finding, then guide/academy TITLE_TOO_LONG cleanup, then the rest) for a future phase, not claimed as resolved.

## Summary

| Decision | Count |
|---|---:|
| KEEP (word count low but query genuinely satisfied) | 1 confirmed by direct read, 16 dataset-pages + 17 internal-dashboards by policy |
| Deferred to Phase 7G's existing KEEP decision (not reopened) | 36 |
| INVESTIGATE (genuine finding, scoped for a future phase) | 2 confirmed (fiberglass/vinyl entities) + ~62 same-class unreviewed entity/glossary pages |
| Logged for a future on-page-SEO pass (title length, not thinness) | ~19 |
| Not individually reviewed this pass | ~55 |

No filler content was introduced anywhere in this phase.
