# Entity Provenance Data Model (Phase 7J, Step 12)

## No parallel provenance system created

The existing Phase 7D-7E architecture (`chemistry-knowledge.js` → `chemistry-ranges.js` → `chemistry-claims.js` → `chemistry-sources.js`) was reused as-is for cross-referencing. This phase adds one new layer that expresses `entity → claim → source scope → review state`, deliberately kept thin and pointing back into the existing registry rather than duplicating it:

```
entity (data/graph/entity-index.json)
  -> claim (reports/phase-7j/entity-claim-inventory.csv, claim_id = ec-{entity_id}-{seq})
       -> source_registry_ids (references scripts/data/chemistry-ranges.js RANGES[].id -- never a duplicated source record)
       -> scientific_review_status (controlled vocabulary, Step 8)
  -> entity-level decision (reports/phase-7j/entity-provenance-decisions.csv, aggregated from that entity's claims)
```

## Deterministic IDs

`claim_id` = `ec-{entity_id}-{4-digit sequence}` (e.g. `ec-fiberglass-pool-0284`), assigned in a fixed, reproducible order (entity iteration order from `entity-index.json`, then sentence order within each entity's `longDescription`, then extraction order within each sentence). Re-running `scripts/phase-7j/extract-entity-claims.js` against unchanged source data produces identical IDs.

## No full source records duplicated inside entities

Entity claims reference existing `chemistry-ranges.js` range IDs (`source_registry_ids` column) rather than copying `organization`/`url`/`rationale` text into the entity claim record. A claim with `DIRECTLY_SUPPORTED` status and `source_registry_ids: range-ch-public-pool-standard` means "look up that ID in `chemistry-ranges.js` for the actual source" — exactly the same indirection pattern the Phase 7D-7E provenance-mapping architecture already uses for the rest of the site's evidence dataset.

## Why this is sufficient (no schema/architecture extension needed)

The existing model already separates `extraction_status` (was this number/parameter reliably parsed) from `scientific_review_status` (is this claim scientifically supported) — the same two-dimension design Phase 7D established for the rest of the site. Entity claims fit this model without modification; the only new artifact is the entity-scoped claim inventory itself (a CSV, following the same pattern as `reports/phase-7d-3/chemistry-evidence.csv`), not a new schema.

## Cross-reference method

`crossReferenceRange()` in `scripts/phase-7j/extract-entity-claims.js` checks whether a claim's numeric value overlaps an existing `chemistry-ranges.js` record for the same `parameter_id`. This method has a known precision limit, documented honestly rather than silently trusted: it cannot distinguish a **target-range claim** ("pool pH should be 7.0-7.8") from a **product-composition claim** ("trichlor is 58% CYA by weight"), a **dose-response claim** ("6 oz raises pH by 0.2"), or an **illustrative example inside a mechanism explanation** ("at pH 8.0 only 22% of chlorine is active"). All four categories mention a parameter's name and a number, but only the first is actually comparable to a target-range registry entry. The automated pass flagged 34 apparent conflicts; 13 were extractor-confidence artifacts (`IMPOSSIBLE_MAPPING`/`CARRIED_CONTEXT`, correctly reclassified `AMBIGUOUS` rather than compared at all) and the remaining 21 were individually read in full sentence context and reclassified by hand (`reports/phase-7j/high-risk-manual-review.csv`) — 0 genuine numeric contradictions were found in the entity corpus.
