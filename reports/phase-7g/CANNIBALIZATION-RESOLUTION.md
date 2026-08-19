# Cannibalization Resolution

Cross-referenced Phase 7A's content-cannibalization audit (`content-cannibalization.csv`, re-run this phase: 133 cross-format pairs evaluated across 16 core intents, **0 HIGH risk sitewide**), Phase 7C's URL policy, the current sitemap, and the internal-link matrix.

## Findings for the 4 primary-scope families

**12 cross-format pairs** involve a `programmatic-longtail` page from chlorine/ph/shock/hot-tubs against a `guide` or `calculator` page sharing the same general topic (e.g. `guides/ph/does-rain-lower-pool-ph` vs. `programmatic/ph/how-to-adjust-ph-from-7-to-7-4`). **All 12 are LOW risk** (similarity 0.05-0.06), already correctly differentiated by format (`current_differentiation: "different formats"`), with `recommended_action: KEEP SEPARATE` already assigned by the audit tool.

This matches this phase's own intent-contract analysis: the programmatic long-tail pages answer a specific parametric question ("how much for MY exact pool size/pH reading"), while the guide pages answer conceptual questions ("why does X happen," "what causes Y") — genuinely different search intent, not competing for the same query.

## No CRITICAL or HIGH cannibalization found within scope

No action required. Priority order (CRITICAL → HIGH → MEDIUM) is moot for this scope since nothing in the primary families reached MEDIUM or above. The real content-quality issue in this scope was near-duplication *within* each family (addressed via `BASELINE-DUPLICATION.md`/`POST-REMEDIATION-DUPLICATION.md`), not cross-format cannibalization *between* families and other page types.
