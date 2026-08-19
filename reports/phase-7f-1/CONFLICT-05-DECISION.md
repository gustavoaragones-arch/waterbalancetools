# Conflict #5 Decision — Combined Chlorine 0.5 ppm (FC vs TC Comparison Page)

**claim_id**: `3bb0e016bca28ac0` | **page**: `comparisons/free-chlorine-vs-total-chlorine.html` | **parameter**: combined_chlorine, pool, 0.5 ppm

## Production statement

"When CC exceeds 0.5 ppm, shock to 10× CC reading to eliminate chloramines" (within a feature-comparison table of FC vs. TC vs. CC).

## Context analysis

Same underlying finding as Conflicts #2/#3/#4. This is a comparison-table page contrasting three related parameters at a glance.

## Outcome

**B — correct only with context**; same reasoning as Conflicts #3/#4.

## Decision

`SUPPORTED_WITH_CONTEXT` → `production_action: NO_PRODUCTION_ACTION`

**REASON**: a comparison table cell is the least appropriate place of the four pages to introduce a regulatory-vs-residential caveat — it would break the at-a-glance format the page exists to provide. The nuance is addressed at the technical reference page (Conflict #2).

**Numeric value NOT changed.**

---

## Summary across Conflicts #2-5

One underlying factual question (0.4 ppm regulated public-facility MAHC figure vs. 0.5 ppm residential convention), appearing on 4 pages with 4 different roles. Rather than apply the same edit 4 times (which the brief's "prefer the smallest accurate correction" and "do not rewrite entire pages" caution against), the correction was made **once**, at the single page where a reader seeking the technical detail would land (`reference/combined-chlorine-explained.html`), with the other 3 pages explicitly reviewed and deliberately left unchanged with documented reasoning — not silently skipped.
