# High-Risk Claims (Rebuilt)

Definition unchanged from Phase 7D: an evaluated claim (CORRECT_EXTRACTION or CARRIED_CONTEXT) whose value does not overlap any canonical range recorded for its parameter/environment in `scripts/data/chemistry-ranges.js` -- flagged for expert review, not resolved here.

| | Count |
|---|---:|
| Previous (Phase 7D) high-risk claim categories | 6 (see reports/phase-7d/HIGH-RISK-CHEMISTRY-CLAIMS.md -- category-level, not a directly comparable per-claim count) |
| Rebuilt high-risk claims (REQUIRES_REVIEW) | 589 |

## By parameter

| Parameter | Count |
|---|---:|
| ph | 242 |
| free_chlorine | 139 |
| cyanuric_acid | 69 |
| salt | 49 |
| combined_chlorine | 41 |
| total_alkalinity | 22 |
| calcium_hardness | 16 |
| shock_treatment | 7 |
| bromine | 4 |

These claims are **not** scientifically resolved in this phase. Each remains `REQUIRES_REVIEW` and `review_required=true` in `chemistry-evidence.csv`. The Phase 7D category-level high-risk list (`HIGH-RISK-CHEMISTRY-CLAIMS.md`) was hand-curated at the concept level (e.g. "saltwater CYA target vs. general CYA target") and is not a 1:1 predecessor to this claim-level list, so "newly identified" / "removed" counts are not meaningful at the individual-claim level between the two; the concept-level findings in that report remain valid and unaffected by this rebuild (none of them depended on the buggy reconciliation layer -- see Phase 7D.1 PHASE-7D-KNOWLEDGE-IMPACT.md).
