# Phase 7L — Production Changes

## New canonical claims (`scripts/data/chemistry-claims.js`, 16 -> 19 records)

Three new claims added, each backed by a Phase 7K-verified source: `claim-trichlor-calhypo-mixing-hazard`, `claim-shock-algae-recovery-green`, `claim-temperature-hottub-safety-max`. Distinct from existing generic claims (e.g. the trichlor/cal-hypo claim is deliberately separate from `claim-mixing-chemicals-danger`, which is a generic "don't mix chemicals" claim, not this specific pairing).

## Renderer fix (`scripts/chemistry/renderSources.js`)

`authorityLabel()` mapped `authority_level: 'professional'` to "Industry standard (ANSI-accredited)" -- correct for the Phase 7D-era ANSI/PHTA sources it was written for, but wrong once Phase 7K introduced `professional_trade_publication` and `material_industry_association` source types that are also `authority_level: 'professional'` but are NOT ANSI-accredited standards. Rendering Pool & Spa News or CFFA as "ANSI-accredited" would have overstated their authority -- a direct E-E-A-T violation (Step 13). Fixed by adding a `sourceLabel()` function that prefers the precise `source_type` label when present, falling back to the original `authority_level` mapping for older records. Caught before any page was generated with the wrong label.

## Entity page citations (`scripts/generate-entity-pages.js`, `templates/entity-template.html`)

Added a `{{SOURCES_SECTION}}` token (rendered after Quick Facts, before Relationships -- answer/detail before source, per Step 12) and an explicit `ENTITY_CITATIONS` allowlist mapping 5 entity IDs to their reviewed claim/source. This is generator-level, not HTML-file injection, because entity pages are fully regenerated from data on every build -- a direct file edit would have been silently wiped on the next `npm run build`.

Entities cited: `trichlor-tablets`, `green-water`, `temperature`, `shock-treatment` (with an explicit scoping note limiting the citation to the 30ppm algae figure, not the whole paragraph), `vinyl-pool` (direct source citation, bypassing the parameter-based claims schema for this material-science claim).

## Calculator citations (`scripts/phase-7e/inject-calculator-sources.js`)

Extended the existing idempotent marker-injection TARGETS array with two entries: `calculators/pool-ph-calculator.html` (closes a gap identified but never implemented in Phase 7E) and `calculators/chemical-calculator.html` (cites only the pH/FC/TA/CH target ranges, with an explicit note that CYA/salt ranges and all dosing formula constants remain unverified).

## Programmatic shock pages (`scripts/generators/generate-shock-pages.js`)

Added a citation for the green-algae-recovery table row specifically (not the standard-dose row), generator-level so it applies consistently across all 6 volume-variant pages without hard-coding a source into HTML output directly.

## Static chart correction + citation (`pool-chlorine-levels-chart.html`)

Corrected the "Double shock / algae" table row from an unsourced ~20 ppm figure to the Phase 7K-verified ~30 ppm green-algae-recovery figure -- the same conflation already fixed in the Phase 7G shock generator during Phase 7K. Permitted under Step 16 ("an already-resolved Phase 7K issue requires synchronization"). Added a citation for the corrected row via the same calculator-sources injector (extended to accept a non-calculator static page). Three other pages containing looser 10-30ppm shock ranges (`academy/water-balance/understanding-cyanuric-acid.html`, `guides/questions/can-you-swim-after-shocking-a-pool.html`, `reference/shock-treatment-explained.html`) were reviewed and NOT changed -- their stated ranges already bracket 30ppm and are not the same false single-point claim, so touching them would have been scope creep beyond the one resolved issue.

## Regression fix (`scripts/validate-trust-layer.js`)

Its pre-existing `KNOWN_TIER1_CITED_PAGES` allowlist (used to warn if a citation block appears somewhere unreviewed) was updated to include all 14 pages this phase added citations to, so the validator continues to distinguish "known, individually-reviewed" from "unexpected" citation blocks rather than producing 14 new spurious warnings.

## No calculator formula changes, no entity content rewrites beyond the one chart-row sync, no URL/redirect/sitemap changes.
