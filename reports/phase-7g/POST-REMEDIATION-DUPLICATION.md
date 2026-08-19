# Post-Remediation Duplication

Same audit tool, re-run after generator changes and a full rebuild (no manual HTML edits — every page in all 4 families was regenerated through the normal pipeline).

| Family | Before (risk / avg sim) | After (risk / avg sim) | Repeated paragraphs (before → after) | Repeated FAQs (before → after) |
|---|---|---|---|---|
| programmatic/hot-tubs | CRITICAL / 0.795 | **HIGH / 0.711** | 33 → 25 | 4 → 3 |
| programmatic/shock | CRITICAL / 0.784 | **HIGH / 0.689** | 29 → 23 | 4 → 3 |
| programmatic/chlorine | HIGH / 0.740 | HIGH / **0.651** | 34 → 26 | 4 → 3 |
| programmatic/ph | HIGH / 0.712 | HIGH / **0.579** | 30 → 31 | 4 → 5 |

## Honest assessment

**Real, measurable improvement — not a full resolution.** Both CRITICAL-risk families (hot-tubs, shock) dropped to HIGH. All 4 families show a real similarity-score reduction (largest: pH, -0.133; smallest: hot-tubs, -0.084). This was achieved by (a) removing genuinely redundant prose (multi-paragraph explanatory sections cut to one sentence + a link to the canonical guide, where the guide already existed) and (b) adding genuinely page-specific computed content (real per-page dosage numbers and a volume/scenario-specific FAQ) — not synonym-spinning or sentence reordering.

**No family reached LOW/MEDIUM risk.** The remaining similarity is concentrated in structural content this phase deliberately did NOT touch, per Step 20's explicit protection of shared safety/methodology content: the `stepsSection`, `recommendedLevelsSection`, and 3 of 5 FAQ answers (overdosing safety, swim-wait timing, product-type guidance) are legitimately identical across a family — the safe dosing procedure and target range genuinely don't change with pool volume. Further reduction below HIGH risk would require either accepting some loss of that shared safety content (not recommended) or a larger architectural change (e.g., consolidating the shared sections onto the family hub/guide page and having long-tail pages link to them entirely, rather than including a trimmed copy) — documented as a candidate for a future phase, not attempted here given the scope-control instruction against a full redesign.

**pH's repeated-paragraph/FAQ counts moved slightly the wrong direction** (30→31, 4→5) even as its overall similarity score dropped the most — the duplication-detection tool's block-matching is sensitive to exact paragraph boundaries, and trimming shifted where sentence/paragraph breaks fall. The aggregate similarity metric (the more meaningful summary figure) still improved substantially. Not hidden — reported as-is.
