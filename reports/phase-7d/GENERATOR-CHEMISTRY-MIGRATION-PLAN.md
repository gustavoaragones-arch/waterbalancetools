# Phase 7D — Generator Chemistry Migration Plan

No generator is migrated in this phase. This is the target-setting document for a future programmatic-remediation phase, ranked by concentration of hard-coded chemistry values found in `chemistry-source-inventory.csv` (1,893 occurrences across 232 files).

## Migration targets, ranked by volume

| File | Occurrences found | Current data source | Canonical knowledge-layer target | Migration complexity | Suggested phase |
|---|---|---|---|---|---|
| `scripts/data/academy-content.js` / compiled `data/academy.json` | 338 | Hand-authored prose with embedded numbers, per-article | `chemistryKnowledge.getContextualRange()` for any numeric claim; most content stays prose (editorial, not swappable for a raw number) | High -- mostly narrative text, not simple constant substitution | Phase 7E+ (content-by-content, not bulk) |
| `scripts/data/formulas-data.js` / `data/formulas.json` | 109 each | Hand-authored formula pages | Cross-reference `chemistry-ranges.js` for any target-range mentions inside formula explanations; formula math itself stays in `js/calc-utils.js` | Medium | Phase 7E |
| `scripts/data/glossary-terms.js` / `data/glossary.json` | 86 each | Hand-authored glossary entries | Definitions already largely match `chemistry-knowledge.js` parameter `definition` fields; could be generated FROM the knowledge layer instead of independently authored | Medium -- risk of losing glossary-specific phrasing/tone | Phase 7E |
| `scripts/generate-authority-guides.js` | 86 | Inline template strings with embedded ranges | `getContextualRange()` per guide topic | Medium | Phase 7E |
| `scripts/data/academy-fundamentals.js`, `academy-water-balance.js`, `academy-sanitizers.js`, `academy-troubleshooting.js`, `academy-hot-tubs.js` | 70/70/56/42/35 | Hand-authored, per-topic | Same pattern as academy.json above | High (narrative) | Phase 7E+ |
| `scripts/generate-authority-charts.js` | 70 | Inline chart table data (`tableRows` arrays) | These are the highest-value, lowest-complexity migration target: chart tables are already structured `[parameter, range, ...]` tuples, close in shape to `chemistry-ranges.js` records | **Low** | **Phase 7E, first target** |
| `scripts/generate-question-pages.js`, `scripts/populate-data.js` | 57 each | Mixed inline + data-driven | Case-by-case | Medium | Phase 7E |
| `scripts/data/reference-pages.js` | 42 | Hand-authored reference tables | `chemistry-ranges.js` (several reference tables, e.g. `ideal-pool-levels.html`, `ideal-spa-levels.html`, already conceptually duplicate the knowledge layer) | Medium | Phase 7E |
| `scripts/data/entities-remaining.js`, `entities-equipment.js`, `academy-equipment.js` | 27 (+ related) | Entity/equipment definitions, including the CYA-saltwater discrepancy found in this phase | `chemistry-ranges.js` `range-cya-saltwater-outdoor` (already added, `REQUIRES_REVIEW`) | Low-medium | Phase 7E, alongside the Section-1 HIGH-RISK item |
| `js/calc-utils.js` | n/a (client-side math, not scanned as "content") | Hard-coded formula constants (see Calculator Assumption Audit in the main report) | Longer-term: constants like the pH-adjustment multipliers (6/5) and salt/CYA/alkalinity dosing coefficients could be sourced from `chemistry-ranges.js`/a future `chemistry-formulas.js`, but the *formulas themselves* are explicitly out of scope to change in Phase 7D | High (client-side, cross-cutting, needs care not to break live calculators) | Not before a dedicated calculator-engine phase |

## Recommended migration sequence

1. **`generate-authority-charts.js`** first -- lowest complexity, highest structural similarity to `chemistry-ranges.js`, and it is the generator responsible for the root-level chart pages that are among the site's highest-authority informational content (per Phase 7A's link-authority findings).
2. **`scripts/data/reference-pages.js`** and the `reference/ideal-*-levels.html` family -- these pages exist specifically to state target ranges, making them a natural first home for `chemistryKnowledge.getContextualRange()` calls plus real `renderSourceList()` citations.
3. **Academy content** (`academy-*.js` files) -- highest volume but highest complexity (narrative prose); should be done incrementally, one topic family at a time, with editorial review of each rewritten paragraph rather than a bulk find-and-replace.
4. **Glossary/formulas** -- lower priority; mostly already conceptually aligned with the knowledge layer's definitions.
5. **Calculator engine (`js/calc-utils.js`)** -- deliberately last, and only with a dedicated phase, given it is live, user-facing calculation logic rather than static content.

## Non-goals for the next phase (carried over from Phase 7D's own scope limits)

Do not attempt a single bulk migration across all 232 files in one pass. Each file above has different risk (narrative content vs. structured data vs. live calculator math) and should be migrated with review appropriate to that risk, matching the same incremental philosophy Phases 7B/7C used for URL/generator fixes.
