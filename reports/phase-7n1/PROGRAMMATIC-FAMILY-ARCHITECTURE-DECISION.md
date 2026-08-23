# Phase 7N.1 — Programmatic Family Architecture Audit

**Status: COMPLETE — architectural decision made for all 4 families**

## Method

Re-verified the Director's cited numbers directly against `programmatic-duplication.csv` (post-Phase-7N state, commit `1bab1c9`) — confirmed exact match. Computed the maximum possible within-family page pairs (excluding each family's `index.html`, which is a different page type/template and not part of the duplication analysis) and the percentage of those pairs classified HIGH, to normalize for family size:

| Family | Volume-page count | Volume/size range | HIGH pairs | Max possible pairs | % HIGH | Family risk |
|---|---|---|---|---|---|---|
| Chlorine | 11 | 5,000–30,000 gal (6x) | 55 | 55 | **100%** | HIGH |
| Shock | 6 | 5,000–30,000 gal (6x) | 15 | 15 | **100%** | HIGH |
| Hot tubs | 5 | 200–600 gal (3x) | 10 | 10 | **100%** | HIGH |
| pH | 4 | 4 distinct raise/lower adjustments | 2 | 6 | **33%** | MEDIUM |

This is a cleaner, starker picture than the raw HIGH-pair counts alone suggest: chlorine, shock, and hot tubs are **not at different points on a duplication spectrum** — every single within-family pair is HIGH for all three. pH is qualitatively different: two-thirds of its pairs are NOT high similarity.

## Why pH is structurally different

pH's 4 pages are not a numeric sweep of one variable -- they mix **direction** (raising vs. lowering) with **magnitude**. Raising and lowering pH use different products (soda ash vs. dry acid), different causes (`why-pool-ph-so-low` vs `why-pool-ph-so-high` -- entirely different paragraph content, not just different numbers), and different risk framing (corrosion vs. scale). This branching logic is real content variation, not just parameter substitution -- which is exactly why it already tests as MEDIUM, not HIGH, and why Phase 7M's earlier remediation moved it from HIGH to MEDIUM while chlorine/shock/hot-tubs stayed HIGH despite the same remediation technique.

## Why chlorine, shock, and hot tubs are structurally identical at 100%

All three are pure single-formula numeric templates: "how much of chemical X for volume Y." There is no branching logic -- every page uses the same formula, the same safety/target-range facts, and the same procedural steps, with only the volume number and its computed result differing. A Jaccard shingle-similarity metric (comparing overlapping word sequences) will always score two instances of the same template near-identically regardless of how different the underlying numbers are, because the *template text* dominates the *substituted numbers* by word count. This is a mathematical property of the metric applied to this content shape, not evidence that the pages are redundant to a user or a search engine.

## Evaluating the five architectural options, per family

For chlorine, shock, and hot tubs (evaluated together -- they share the identical structural situation):

1. **Retain all pages as independent indexable pages.** Supported by: (a) 0% cannibalization risk, confirmed twice (Phase 7N baseline and re-audit) -- a search engine can unambiguously route "how much chlorine for 12,000 gallon pool" to exactly one page; (b) each page's core deliverable (the computed dose for that specific volume) is objectively correct, unique, non-redundant information; (c) the volume/size points already reflect genuine real-world distribution rather than arbitrary round numbers -- chlorine's spacing is denser at common residential sizes (7000/8000/9000/10000/12000) and sparser at the high end (25000/30000), and hot tub sizes (200-600 gal) track real 2-person through 6-8-person spa capacity classes.
2. **Consolidate some pages into family-level reference/guide pages.** Rejected for now: no evidence (real click-through data, GSC data, or a demonstrated redundancy in the actual information delivered) supports that any specific volume point is unnecessary. The Director's own instruction is explicit: "Do not merge merely because pages share vocabulary." Textual similarity is exactly vocabulary-sharing here, not evidence of redundant user value.
3. **Move shared safety/methodology material entirely to canonical family guides.** Considered directly. Rejected as the primary fix: these are the exact pages most likely to be reached directly from a search engine result, bypassing the family hub entirely -- removing the self-contained target-range/safety context would degrade the page for that visitor (who would need to click through to get information relevant to the page they're already on). This tradeoff was already identified in Phase 7M's review queue and is reconfirmed here with the corrected 100% evidence, not overturned by it.
4. **Redesign the long-tail pages around genuinely query-specific information.** Already attempted in Phase 7M (removed the literal quick-tips list, added real per-volume unit-conversion/container-count content) and re-verified in this audit as still in place and functioning -- this reduced average similarity meaningfully (chlorine 0.650->0.565, shock 0.715->0.621, hot-tubs 0.705->0.629) without reaching LOW/MEDIUM, because the reduction touched the *removable* boilerplate, not the *necessary* shared reference facts. Further "redesign" beyond that would mean either fabricating volume-specific content that doesn't exist (explicitly prohibited: no invented differentiation) or removing real safety/target-range content (rejected under option 3's reasoning).
5. **Conclude the current structure is acceptable and formally close the issue.** **This is the decision for chlorine, shock, and hot tubs.**

For pH:

Already meaningfully differentiated (MEDIUM, not HIGH) through genuine content branching. **Decision: conclude the current structure is acceptable and formally close the issue.** No further action needed -- this family does not exhibit the 100%-density pattern the other three do.

## Decision

**All four programmatic families: KEEP the current 26-page structure. Formally closed as architecturally acceptable.**

This is not a refusal to engage with the duplication finding -- it is the outcome of applying the Director's own explicit test ("would a search engine reasonably struggle to determine which page should answer this query?") together with a direct evaluation of all five options against real evidence. The answer to that test is no for every page in every family. The remaining textual similarity is a predictable, low-risk consequence of an intentionally-consistent, self-contained-page architecture for legitimate long-tail volume/size queries -- not evidence of harmful duplication, cannibalization, or wasted content.

## Explicit dissent / monitoring note

Chlorine, shock, and hot tubs sharing an identical 100%-HIGH-pair signature (despite very different page counts and volume ranges) is worth tracking going forward, not dismissing. If real click-through or Search Console data ever becomes available (none exists in this repository today -- confirmed in Phase 7N), it should be checked specifically for whether adjacent, closely-spaced volume pages (e.g., 8,000 vs. 9,000 vs. 10,000 gallons) actually receive meaningfully independent search traffic, or whether users searching those adjacent values are functionally being served by whichever page ranks regardless of the small difference. That would be the evidence that could change this decision. No such evidence exists today.

## Production changes

**None.** Per the explicit acceptance criterion ("without changing production content merely to improve a similarity metric"), and because the architectural decision reached is KEEP-AS-IS for all four families, no generator, template, or page content was modified in this phase.

## Regression

No production content changed -> no regression risk introduced. Confirmed the working tree is unchanged from the Phase 7N commit before writing this report.
