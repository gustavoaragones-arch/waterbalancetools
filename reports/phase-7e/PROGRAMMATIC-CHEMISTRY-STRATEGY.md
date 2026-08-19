# Programmatic Chemistry Provenance Strategy (7E.5)

Documentation only — no programmatic pages were modified in this phase.

## Finding

`programmatic/chlorine/*`, `programmatic/shock/*`, `programmatic/ph/*`, `programmatic/hot-tubs/*` are template-generated pages parameterized by pool size / scenario (e.g. `how-much-chlorine-for-10000-gallon-pool.html`). Sampling their evidence records in `reports/phase-7d-3/chemistry-evidence.csv` (filtered by `source_url` matching `programmatic/`) shows they already restate the same small set of canonical target ranges (FC 1-3 ppm, pH 7.2-7.6, TA 80-120 ppm) verbatim across dozens of pages — e.g. `programmatic/chlorine/how-much-chlorine-for-8000-gallon-pool.html`, `programmatic/explanations/why-shower-before-pool.html`, and `programmatic/problems/low-alkalinity-symptoms.html` (sampled in the Phase 7D.2 independent audit) all contain the identical "Recommended Levels" block. This confirms the brief's premise: these pages already **inherit from a small, controlled claim family** rather than each independently inventing its own numbers — they just don't currently attribute that inheritance to anything.

## Desired architecture (documented, not built this phase)

```
PROGRAMMATIC PAGE  (e.g. how-much-chlorine-for-8000-gallon-pool.html)
      |
CLAIM FAMILY        claim-fc-pool-no-cya / claim-fc-pool-with-cya
      |              (scripts/data/chemistry-claims.js, via
      |               scripts/data/chemistry-claim-family-map.js)
CANONICAL EVIDENCE  range-fc-pool-chlorine-no-cya (1-3 ppm)
      |
SOURCE REGISTRY     cdc-healthy-swimming-home-treatment, cdc-mahc-2023
      |
RENDERED PROVENANCE renderSources.js -> a single shared citation block
```

Because every programmatic page in a given family (e.g. all `chlorine-for-N-gallon-pool` pages) cites the *same* claim, the correct implementation is **one mapping per template/claim-family, not one per page**: the template's own generator would call `renderClaimSources('claim-fc-pool-no-cya')` once, and every page it produces inherits the identical, correct citation automatically. This is explicitly the model the brief asks for ("do not create hundreds of independent source mappings when one well-defined claim-family mapping is sufficient").

## Where claim-family inheritance would be WRONG

Not every programmatic page restates the identical claim. `programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool.html`'s own evidence records include page-specific numeric content (the "10,000 gallons" volume itself, dosage amounts computed for that volume) that is NOT part of the FC-target claim family — those are per-page calculator-output values, not general chemistry claims, and must never inherit a citation meant for a different, general claim ("1-3 ppm is CDC's target" does not source-support "this specific page's dosage arithmetic for a 10,000-gallon pool"). The architecture above only applies to the *target-range* sentences these pages share, not to their page-unique calculated content.

## Why this is not implemented in this phase

Wiring `renderClaimSources()` into the programmatic template generator (`scripts/generate-*` for these page families) touches the template shared by 40+ pages at once — exactly the "mass injection" the brief prohibits doing before Tier 1 quality is established. Tier 1 (2 calculators + 2 authority charts, see the main report) is implemented first, in this phase, as the proof of the rendering mechanism; extending it to the programmatic template family is explicitly deferred to a later phase once Tier 1's approach has been in production and reviewed.
