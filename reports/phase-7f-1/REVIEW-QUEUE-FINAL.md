# Review Queue — Final State After Phase 7F.1

| Population | Before 7F.1 | Resolved this phase | Remaining |
|---|---:|---:|---:|
| 5 genuine source conflicts | 5 | 5 (all individually reviewed; 1 corrected, 4 contextualized/no-action-needed with documented reasoning) | 0 |
| 267 Tier-1 high-value claims | 267 | 267 reviewed (264 confirmed non-claims; 3 SOURCE_NOT_FOUND individually reviewed and found already-covered by prior phases) | 0 unreviewed; 0 require further action |
| 185 source-search candidates | 185 | 1 targeted research lead pursued (hot-tub max temperature, 104°F — see below); remainder triaged, not individually researched (Step 11: research only where meaningful user/safety value, and pool_volume/LSI are structurally outside the sourceable vocabulary) | 184 (unchanged priority: 88 pool_volume, 64 lsi — structural, not "unresolved research"; 18 water_temperature — 1 lead found, not yet formally added; 8 total_chlorine — derived quantity, no independent source expected; 6 chlorine_demand) |
| 133 unclassified | 133 | 133 categorized (8 EXAMPLE_CALCULATION, 14 NON_CHEMISTRY_ARTIFACT, 2 CONTEXTUAL_DIFFERENCE, 109 DEFERRED) | 109 DEFERRED (honestly low-priority, not "errors" — see `unclassified-categorization.csv`) |

## New research lead (not yet added to the canonical registry)

**Hot tub maximum water temperature, 104°F.** Live research strongly and consistently associates this figure with CDC/PHTA/CPSC guidance, and it already matches existing site content. However, cdc.gov blocks automated fetches (403 on every direct attempt this phase), so I could not personally read primary-source text to the same rigor as every other source in the registry. **Not added as a new SUPPORTED chemistry-ranges.js record this phase** — logged here as a promising, well-scoped lead for a future phase with browser-based (not automated-fetch) verification, rather than added on an unverified AI-search-summary basis.

## Segmentation carried forward unchanged from Phase 7E.1

Buckets A (Tier-1)/B (source-search)/C (safe-by-construction)/D (programmatic)/E (example)/F (no content) — 4,686 total UNREVIEWED evidence records — are not re-litigated wholesale here; this phase specifically worked the highest-priority slices (the 5 conflicts, all 267 Tier-1 records, and reclassified the 133 previously-unclassified conflict-queue records). The much larger remaining population (`C`: 1,661 safe-by-construction, `F`: 1,884 no numeric content) legitimately does not need individual review, consistent with Step 12's "do not force them into SUPPORTED or CONFLICTING."
