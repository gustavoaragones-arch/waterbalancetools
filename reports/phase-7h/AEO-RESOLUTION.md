# AEO Resolution (Phase 7H, Step 18)

## Scope

Phase 7H's AEO work is narrower than Phase 7G's: verify that the schema/accessibility/thin-content fixes above did not degrade the answer-engine-optimization structure already established (H1 → direct answer → supporting explanation → structured facts/table → source where applicable → related tool), and that no fix in this phase created a schema-only answer (a claim that exists in JSON-LD but not in visible content).

## Verification

**No schema-only answers.** `scripts/validate-schema-content-consistency.js`'s `FAQ_SCHEMA_NOT_VISIBLE` check is CRITICAL (fails the build) and scans every page's FAQPage schema against actual visible `.faq-item`/`.paa-item` content: **0 violations**, sitewide. This is the direct, mechanical enforcement of "no hidden answer content."

**No new answer blocks manufactured to inflate audit counts.** Every content change this phase either (a) made an *already-declared* answer visible using its exact existing text (the 5 FAQ-visibility fixes — no new claims), (b) removed a misleading claim entirely (the 12 HowTo removals — a page shorter by a wrong assertion is not a new "answer"), or (c) added structurally-required schema with no visible-content change at all (WebPage/BreadcrumbList/WebApplication additions on editorial/methodology/releases/printables/calculators — these carry metadata, not user-facing answer text).

**High-value pages retain their direct-answer structure.** Spot-checked representative pages across the categories touched this phase:

- `calculators/pool-chlorine-calculator.html` — H1 → calculator form → Result (now `<h2>`, unchanged position in the flow) → Recommended Levels → Quick tips → visible FAQ (now genuinely matching its schema) → sources. Structure intact; only the heading *level* of "Result" changed, not its position or content.
- `reference/chlorine-explained.html` and the 7 other `reference/*-explained.html` pages — no content or structure change at all this phase; their FAQPage/DefinedTerm schema was reclassified VALID (detector fix), not their HTML.
- `pool-chemical-levels-chart.html`, `pool-chlorine-levels-chart.html`, `pool-ph-levels-chart.html` — direct-answer table and "How to use this chart" explanation untouched; the only change was appending a visible FAQ section using the already-declared schema questions, which *adds* to the AEO-extractable surface rather than reducing it.
- `editorial/*`, `methodology/*`, `releases/*`, `printables/*` — these are policy/reference/utility pages, not query-answering content pages; they were not carrying an AEO answer structure before this phase and were not given one — only the required WebPage/BreadcrumbList metadata was added, per Step 3's policy (no FAQPage/HowTo was added to a page without genuine visible FAQ/procedure content).

## Not attempted

A full AEO re-audit comparable to Phase 7G's `AEO-DIFFERENTIATION.md` (per-page answer-uniqueness scoring across the whole site) was not re-run in this phase — Phase 7H's brief scopes AEO work specifically to "where directly related to" the schema/content/accessibility fixes above, not a standalone AEO initiative. No regression was found in the pages this phase actually touched.
