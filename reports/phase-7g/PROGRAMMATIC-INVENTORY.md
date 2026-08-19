# Programmatic Inventory

## Primary scope: 26 long-tail pages + 4 family hub pages

| Family | Generator | Data source | Long-tail pages | Hub page |
|---|---|---|---|---|
| chlorine | `scripts/generators/generate-chlorine-pages.js` | `chlorine-cluster-config.js` (11 pool volumes) | 11 | `programmatic/chlorine/index.html` |
| shock | `scripts/generators/generate-shock-pages.js` | `shock-cluster-config.js` (6 pool volumes) | 6 | `programmatic/shock/index.html` |
| ph | `scripts/generators/generate-ph-pages.js` | `ph-cluster-config.js` (4 from→to level pairs) | 4 | `programmatic/ph/index.html` |
| hot-tubs | `scripts/generators/generate-hot-tub-pages.js` | `hot-tub-cluster-config.js` (5 spa sizes) | 5 | `programmatic/hot-tubs/index.html` |

Full per-page record (page_id, url, family, primary_intent, secondary_intent, environment, parameter, scenario, claim_family, canonical_status, sitemap_status): `programmatic-inventory.csv`.

## Architecture found

All 4 families follow the identical pattern: one generator script, one cluster-config data file listing the parametric values (volumes or pH levels), and one `buildPage()` function producing near-identical HTML structure with only the parametric value and a couple of computed numbers changed. This is the literal "SAME TEMPLATE + DIFFERENT VARIABLES" pattern the brief describes — confirmed by reading the generator source, not inferred.

Every family shares the same section-helper library (`serp-dominance-helpers.js`: `stepsSection`, `whatThisMeansSection`, `recommendedLevelsSection`, `whatHappensIfIncorrectSection`, `quickTipsSection`, `commonQuestionsSection`) — the helpers themselves are generic renderers; the duplication lives entirely in the content arrays each generator passes them, which were near-identical string literals across all pages in a family before this phase.

## Claim-family references

All 4 families already reference a real, existing canonical claim (`claim-fc-pool-no-cya`, `claim-shock-breakpoint-rule`, `claim-ph-pool-routine`, `claim-fc-hottub-routine`) — no new chemistry facts were invented to build the intent taxonomy; it documents what the pages already draw on.

## Hub pages (secondary scope)

`programmatic/{chlorine,shock,ph,hot-tubs}/index.html` are aggregator/silo pages, not part of the near-duplicate long-tail cluster — not modified this phase (no defensible reason to touch them; they were not flagged in the duplication audit).
