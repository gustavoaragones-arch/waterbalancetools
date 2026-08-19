# Trust Coverage

## Tier 1 (implemented/verified this phase)

| Page type | Coverage |
|---|---|
| Main calculators (11 pages) | Trust Panel present on all (pre-existing, via `inject-trust-panels.js`); confidence accuracy corrected on 8/11 formula records this phase. 2 calculators additionally carry a real external-source citation block (Phase 7E). |
| Authority charts (8 pages) | 2 carry a real, individually-reviewed source citation (Phase 7E); the rest correctly render none (no confirmed support) — see `reports/phase-7e-1/AUTHORITY-CHART-REVIEW.md`. |
| Methodology page | Exists, audited, accurate — no change needed. |
| Editorial policy page | Exists; 1 factual correction made this phase. |
| Ownership/about page | Exists, accurate; 1 correction made this phase (Methodology section wording). |

## Tier 2 (audited, not newly instrumented)

Major chemistry guides, hot-tub guides, and reference pages were covered by the Phase 7E/7E.1 provenance work (`reports/phase-7e/PROVENANCE-COVERAGE.md` page-tier breakdown: 1,221 Tier-2 evidence records) but do not carry a dedicated Trust Panel component (that component is calculator/formula/dataset-specific by design). No new Tier-2 trust blocks were mass-injected this phase, consistent with the brief's explicit "do not mass-inject" instruction.

## Tier 3 (untouched)

Programmatic pages remain governed by the deferred claim-family-inheritance strategy (`reports/phase-7e/PROGRAMMATIC-CHEMISTRY-STRATEGY.md`). No trust-block work performed here this phase.

## Validator coverage

`scripts/validate-trust-layer.js` scans all 550 production HTML files for dangerous language, malformed contact data, Person/medical/scholarly schema misuse, broken Organization logo references, contradictory dates, and duplicate editorial/methodology slugs — sitewide, not Tier-1-only, since a false trust claim on any page is a real problem regardless of traffic tier. It does not fail a build merely because Tier 2/3 pages lack a Trust Panel component (that's expected, not a defect).
