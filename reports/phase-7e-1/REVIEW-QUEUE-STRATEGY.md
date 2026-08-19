# Review Queue Strategy

The 4,686 UNREVIEWED evidence records segmented into six priority buckets (fixed precedence: A page-tier check first, then source-search candidacy, then remaining page-tier, then claim-type, then extraction-status safety, so every record lands in exactly one bucket).

**Category F does not mean scientifically false. It means review priority is currently low** — most of Category F is editorial prose with no numeric chemistry content at all; there is nothing to fact-check.

| Bucket | Count | Meaning |
|---|---:|---|
| A — HIGH-VALUE REVIEW | 267 | Unreviewed records on Tier-1 pages (calculators, authority charts). Next review priority after this phase's work. |
| B — SOURCE-SEARCH CANDIDATES | 185 | Topic genuinely covered by no confirmed source (`SOURCE_NOT_FOUND`): 90 pool_volume, 64 lsi, 18 water_temperature, 8 total_chlorine, 7 chlorine_demand, 1 salt. Worth targeted primary-source research in a future phase (pool_volume and LSI are structurally outside the current 15-parameter canonical vocabulary entirely; water_temperature and chlorine_demand have no confirmed target-setting primary source at all — see Phase 7D.2's finding that this is a genuine, disclosed source-coverage gap, not an extraction defect). |
| C — CONTEXTUAL / LOW-RISK | 1,661 | Numbers already safely rejected or safely unattributed by the extraction layer itself (`IMPOSSIBLE_MAPPING`, `NO_PARAMETER_IN_CLAUSE`) — the extraction/impossible-mapping validator already confirmed these never leak as false claims. Low risk by construction, not by neglect. |
| D — PROGRAMMATIC SUPPORT | 631 | Records on `programmatic/*` template pages not already captured above. Governed by the claim-family-inheritance strategy in `reports/phase-7e/PROGRAMMATIC-CHEMISTRY-STRATEGY.md` — reviewed at the template/claim-family level, not intended for one-by-one page review. |
| E — EXAMPLE / CALCULATION | 58 | `claim_type = EXAMPLE_INPUT` or `CALCULATED_VALUE` — describes a hypothetical instance or a computed result, not a general recommendation. Not meaningfully "supportable" by a target-range source at all; a different kind of claim. |
| F — NOT CURRENTLY WORTH REVIEW | 1,884 | `NO_NUMERIC_CONTENT` — editorial/definitional prose with no number in dispute. |

## Priority for future work

1. **A (267)** — highest leverage, smallest set, directly visible to users on the highest-traffic page types.
2. **B (185)** — a concrete, bounded, well-defined research task (find or confirm primary sources for pool_volume/LSI-adjacent guidance, water_temperature targets, chlorine_demand).
3. **D (631)** — architectural work (wire the claim-family inheritance already designed), not per-record research.
4. **C, E, F** — not neglected, but correctly deprioritized: C is already safe by construction, E is a different claim type than target-range provenance addresses, F has nothing to check.
