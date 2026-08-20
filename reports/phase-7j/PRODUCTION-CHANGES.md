# Production Changes (Phase 7J)

## No entity page content was changed

Per Step 20 ("Production content may be changed only when a claim is demonstrably incorrect, materially misleading, unsafe, or contradicted by authoritative evidence") and the explicit "this is an audit and resolution phase, not a broad editorial rewrite" instruction: **zero of the 104 entity pages had their visible content modified this phase.** No claim was found to be demonstrably incorrect, unsafe, or contradicted — the 21 individually-reviewed apparent conflicts all resolved to either an already-known/accepted site precedent, a different (and accurate) claim category than the automated tool compared it against, or a genuine-but-non-contradictory registry coverage gap.

## New provenance infrastructure (Steps 12, 18, 19)

- **`scripts/phase-7j/extract-entity-claims.js`** — new. Extracts and cross-references chemistry claims from all 104 entity `longDescription` fields, reusing the validated `extractFromSentence` from `scripts/phase-7d-1/extract-claims-v2.js` (no competing extraction algorithm).
- **`scripts/phase-7j/apply-manual-dispositions.js`** — new. Encodes the 31 individually-reviewed claim dispositions (21 automated-CONFLICTING + 10 material/safety claims reviewed for Steps 7/9) as an explicit, auditable mapping, applied on top of the automated pass.
- **`scripts/phase-7j/build-entity-decisions.js`** — new. Aggregates per-claim dispositions into a per-entity KEEP/RESEARCH_REQUIRED decision.
- **`scripts/validate-entity-provenance.js`** (Step 18) — new. Validates the entity claim dataset's internal integrity (unresolved entity/source IDs, invalid status values, fabricated-support detection, placeholder values, duplicate claim IDs).

## Datasets produced

- `reports/phase-7j/entity-longdescriptions.csv` — 104 rows, one per entity.
- `reports/phase-7j/entity-claim-inventory.csv` — 378 rows, one per extracted claim.
- `reports/phase-7j/high-risk-manual-review.csv` — 31 rows, the individually-reviewed subset with full reasoning.
- `reports/phase-7j/entity-provenance-decisions.csv` — 104 rows, per-entity KEEP AS WRITTEN / RESEARCH REQUIRED decision.

## No source registry changes

`scripts/data/chemistry-sources.js`, `chemistry-ranges.js`, `chemistry-claims.js`, `chemistry-knowledge.js` were read but not modified. No new source record was added (see `SOURCE-RESEARCH.md` — the one safety claim researched this phase could not be independently pinned to a specific new source, so none was fabricated or added).

## No aliases/synonyms/sourceOrganizations data changed

Step 13/14 audits (below, and in `REVIEW-QUEUE.md`) found only cosmetic redundancy (a handful of synonym-list entries duplicating the entity's own display name), not accuracy problems — per Step 14's explicit instruction not to alter valid linguistic data merely because it lacks a citation, nothing was changed.
