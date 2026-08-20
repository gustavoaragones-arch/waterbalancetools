# Remaining Review Queue (Phase 7J)

## HIGH priority

- **`ec-trichlor-tablets-0313`** (`entities/trichlor-tablets.html`): "should not be mixed with calcium hypochlorite — fire and explosion risk." REQUIRES_REVIEW — 4 real sources checked, none independently confirmed the exact claim (2 didn't cover it, 2 were inaccessible). Recommend checking a manufacturer SDS/product label directly in a future phase.
- **`ec-shock-treatment-0140` / `ec-green-water-0204`**: routine/algae-recovery shock dosing figures (10 ppm maintenance, 30 ppm algae recovery). The existing `chemistry-ranges.js` shock_treatment record only covers CDC/MAHC incident-response dosing (20 ppm) and explicitly disclaims routine-maintenance applicability. A genuine registry coverage gap — recommend adding a properly-sourced routine/algae-shock range record in a future chemistry-knowledge phase.
- **61 of 104 entities** classified `RESEARCH REQUIRED` in `entity-provenance-decisions.csv` — each has at least one unresolved HIGH-priority (safety/numeric-chemistry/material-property) claim. Full list and reasoning in that CSV; no claim in this set is known-incorrect, all are simply not yet independently verified.

## MEDIUM priority

- Material-science claims for `fiberglass-pool`, `vinyl-pool`, `concrete-pool` (gelcoat leaching, liner bleaching from undissolved chemicals, refinishing limitations) — plausible, mechanistically consistent with the site's existing LSI/corrosion knowledge, but outside `chemistry-ranges.js`'s water-chemistry-only scope. Recommend a materials/construction-industry source pass in a future phase if these claims are to carry formal citations.
- Calcium-chloride dose-response claim (12 oz raises CH by ~10 ppm/10,000 gal) — plausible, not cross-checked against an existing site formula this pass (unlike the soda-ash/baking-soda dose-response claims, which matched `formulas-data.js` exactly).

## LOW priority

- 13 entities have a synonym/alias list entry that duplicates the entity's own display name (e.g. "Total Alkalinity" entity lists "Total Alkalinity" as one of its own synonyms) — redundant, not incorrect. Not changed, per Step 14.
- 4 entities have the same term appearing in both `aliases` and `synonyms` for the same entity — same cosmetic redundancy.
- `sourceOrganizations` field (69 of 104 entities reference "phta") represents topical/organizational association, not verified per-claim citations — confirmed via Step 13 audit. Should not be rendered as inline citations without genuine claim-level verification; flagged for anyone building a future citation UI against this field.

## Infrastructure (inherited, not addressed this phase)

- Two-build nondeterminism (QA/freshness scoring, an internal noindex report lagging on page-title state) — same class already disclosed in Phase 7H/7I, not fixed this phase, does not affect the entity provenance results.
- 77 remaining sitewide `TITLE_TOO_LONG` findings outside Phase 7I's addressed scope.
- 8 noindex `reference/datasets/*` `TITLE_TOO_LONG` findings, deliberately excluded.

## Extraction-tool limitation discovered this phase

The proximity-based numeric extractor (`extractFromSentence`) can misattribute a number to the nearest preceding parameter mention rather than the parameter actually being measured, when a sentence names one parameter as context for a value belonging to a different parameter (e.g. "CYA target... 60-80 ppm for salt pools" attributed to "salt" instead of "cyanuric_acid", because "salt pools" was the nearer mention). Found on 1 claim (`ec-stabilizer-0338`) this phase; not systematically searched for elsewhere. Worth a dedicated extractor-precision pass in a future phase given it's the same class of proximity-attribution limitation already documented in the Phase 7D.1/7D.2 extractor's own known-limitations notes.
