# Claim ID Methodology

## Algorithm

```
claim_id = sha256(`${source_url}|${claim_index}|${record_index}`)[:16]  (hex)
```

- `source_url` — the `url` column from `reports/phase-7a/chemical-claims.csv` (the production page the claim was extracted from).
- `claim_index` — the row's 0-based position in `chemical-claims.csv`.
- `record_index` — the 0-based position of this specific numeric-occurrence record within `extractFromSentence()`'s output array for that claim (0 for the single synthetic record a `NO_NUMERIC_CONTENT` claim gets).

Implementation: `scripts/phase-7d-3/build-chemistry-evidence.js`, `makeClaimId()`.

## Why this design

- **No timestamps, no randomness.** The hash input contains nothing but data already present in the source CSV plus the record's position in a deterministic array. Two builds against unchanged source data always produce the identical ID for the identical record (verified: `reports/phase-7d-3/REBUILD-SUMMARY.json`, "reproducibility" — two independent runs are byte-identical, `claim_id` included).
- **Stable across repeated builds, not across source changes.** If `chemical-claims.csv` is regenerated with different row ordering, or the extractor's clause-splitting logic changes how many records a sentence produces, IDs will shift. This is intentional and disclosed, not hidden: a claim ID is a handle for "this specific extraction result," not a permanent identity that survives every possible future re-ingestion. `source_url` + `source_claim` (both present on every row) remain the durable way to re-locate a claim's origin if IDs shift between rebuilds.
- **16 hex characters (64 bits)** is enough to make accidental collisions across ~6,000 records vanishingly unlikely while keeping the CSV column compact; the full 256-bit hash is not needed for uniqueness at this scale and the build script hard-fails on any collision it does detect (`build-chemistry-evidence.js` throws if two rows ever produce the same `claim_id`).
- **`record_index` instead of a value-derived key** (e.g. hashing parameter_id/min/max) was chosen deliberately: two genuinely different numeric occurrences in the same sentence could otherwise coincidentally hash to related-looking values if position weren't part of the key, and position is itself meaningful provenance (it reflects reading order through the sentence).

## What is NOT in the hash

`parameter_id`, `minimum`, `maximum`, `unit`, `environment`, `extraction_status`, and `scientific_review_status` are deliberately excluded from the ID. If a future extractor bugfix changes what parameter a given occurrence resolves to (exactly what happened repeatedly during Phase 7D.2), the claim keeps the same ID across that correction — the ID identifies "the Nth numeric occurrence in this sentence," not "this sentence's Nth occurrence as currently classified." This makes diffing two rebuilds by `claim_id` meaningful for tracking how a specific occurrence's classification changed over time (see `OLD-VS-REBUILT-CHEMISTRY-DATA.md`), rather than the ID itself changing every time the classification does.
