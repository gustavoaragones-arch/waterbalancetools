# Source Research (Phase 7I, Step 7)

## No new source registry created

Per the explicit instruction, this phase reused the existing Phase 7D/7E chemistry provenance architecture (`scripts/data/chemistry-sources.js`, `chemistry-ranges.js`, `chemistry-claims.js`) rather than creating a parallel one. No new source was researched or added this phase.

## What actually happened: surfacing pre-existing authored content, not new claims

The dominant Phase 7I finding was not a content gap requiring new research — it was a generator bug (`scripts/generate-entities.js`) silently dropping the `longDescription` field that already existed, fully authored, on all 104 entity records in `scripts/data/entities-*.js`. Fixing the generator surfaced this content; no new chemistry facts were written, sourced, or invented.

## Honest disclosure: this surfaced content was never run through the Phase 7D extraction pipeline

Because these `longDescription` fields were never rendered into production HTML before this phase, they were never scanned by `scripts/phase-7d-1/extract-claims-v2.js` (which operates on rendered site HTML) and therefore never appear in `reports/phase-7d-3/chemistry-evidence.csv` or the Phase 7E/7E.1 provenance-mapping/conflict-resolution work. This is a genuine gap this phase is disclosing rather than silently claiming as "already verified":

- The content itself long-predates Phase 7D (authored during the Phase 5A entity-layer work, based on file/commit context), and is internally consistent with the site's established chemistry knowledge where checked (see spot-check below).
- It has **not** been individually run through the Phase 7D.3 extraction → Phase 7E provenance-classification → Phase 7E.1 conflict-resolution pipeline the way the rest of the site's chemistry content has.
- Recommendation for a future phase: run the existing extractor against the newly-visible entity pages and fold any extracted claims into the evidence dataset for proper provenance classification, exactly as Phase 7D.3 did for the rest of the site.

## Spot-check performed this phase (not a full audit)

Read a sample of ~10 entity `longDescription` fields in full before relying on the generator fix (fiberglass-pool, vinyl-pool, free-chlorine, cyanuric-acid, biguanide, lsi, salt-chlorinator, calcium-chloride, unit-liters, closing-checklist). Findings:

- All were internally coherent, used correct terminology, and stated figures consistent with well-established pool-chemistry knowledge (e.g. HOCl being the dominant active sanitizing form at lower pH, CYA's UV-protection/chlorine-lock tradeoff, LSI's ±0.3/±0.5 corrosive/scaling thresholds).
- Cross-checked the calcium hardness figures used across several pool-type entities (150–250 ppm residential target) against `scripts/data/chemistry-ranges.js`'s `range-cc-*`-style calcium hardness record (ANSI/APSP/ICC-11 2019, 150–1,000 ppm acceptable for public pools) — the entity figures are a narrower, plausible residential subset of the broader standard's range, not a contradiction. This is the same pattern already seen and accepted elsewhere in this project (e.g. the CDC MAHC 0.4 ppm vs. common-usage 0.5 ppm combined-chlorine distinction resolved in Phase 7E/7F.1).
- No fabricated-sounding claim, invented statistic, or unsupported authority reference was found in the sample.

This spot-check is **not** a substitute for running the full extraction/provenance pipeline against this content, and is disclosed as such in the Remaining Review Queue.

## Claims explicitly NOT added

No new source citations were added to any entity/glossary page this phase. No new `source_registry`-style record was created. Where a page's meta description or title needed to change, the change drew only from text already present elsewhere on the same page (the `og:description`, the existing `shortDescription`/`longDescription` fields) — never from external research or an unverified search result.

## Record: source/claim/reason/scope/date (per the required template)

No new source was verified or used this phase, so there is no entry to record under this heading. If the future extraction-pipeline pass recommended above surfaces a genuinely new claim needing its own source, it should be recorded here in a future phase using this same source/claim/reason/scope/date-verified format.
