# Phase 7L — Source Coverage

## Sitewide citation totals

- Citation blocks rendered: 18 (4 pre-existing from Phase 7E, 14 new this phase)
- Citation links rendered: 23
- Pages touched: 14 (5 entities, 2 calculators newly cited + 2 reconfirmed, 3 authority-chart pages, 6 programmatic shock pages -- one page, the chemical-calculator, contributes 4 links from one block)

## By page family

| Family | Pages with citations | New this phase |
|---|---|---|
| Entity | 5 | 5 |
| Calculator | 4 | 2 (pool-ph-calculator, chemical-calculator) |
| Authority chart | 3 | 1 (pool-chlorine-levels-chart.html) |
| Programmatic (shock) | 6 | 6 |

## By source

| Source | Cited on |
|---|---|
| `cdc-healthy-swimming-home-treatment` | pool-chlorine-calculator, hot-tub-chlorine-calculator, pool-ph-calculator, chemical-calculator |
| `cdc-mahc-2023` | chemical-calculator |
| `ansi-phta-11-2019` | chemical-calculator |
| `phta-total-alkalinity-fact-sheet` | pool-alkalinity-levels-chart, chemical-calculator |
| `microphor-trichlor-sds-2016` | entities/trichlor-tablets |
| `asepsis-calhypo-msds-2005` | entities/trichlor-tablets |
| `poolspanews-algae-breakpoint-2016` | entities/green-water, entities/shock-treatment, pool-chlorine-levels-chart, 6 programmatic shock pages |
| `cmahc-mahc-5th-edition-2024` | entities/temperature |
| `cffa-vinyl-liner-bleaching` | entities/vinyl-pool |

## By claim family

- Chemical mixing safety: 1 claim cited (trichlor/cal-hypo)
- Algae treatment: 1 claim cited, on 8 pages (entity x2, chart x1, programmatic x6 -- shared claim family, contextual to Step 7's instruction)
- Water temperature safety: 1 claim cited
- Material property: 1 claim cited (vinyl liner bleaching)
- Sanitizer level (target range): 2 claims cited (pool/hot-tub free chlorine)
- pH/alkalinity/calcium hardness target ranges: 3 claims cited (chemical-calculator only)

## Claim-weighted coverage (Step 11 -- not a percentage target)

- Tier-1 supported claims with visible citations: 9 of 9 individually reviewed Tier-1 candidates that had a real, directly-supporting source (100% of what was found eligible -- not 100% of all claims sitewide)
- Tier-1 eligible pages with citations: 14 of 14 reviewed
- Supported safety claims with citations: 1 of 1 (trichlor/cal-hypo)
- Supported numeric target claims with citations: 8 of 8 reviewed this phase (free chlorine x2, pH, TA, CH, water temperature, shock/algae x2 counted by claim not by page)
- Genuinely eligible claims NOT cited: 4 (hot-tub-chemical-levels-chart FC/CYA rows, salt-water-pool-chemical-levels-chart TA/CH rows) -- architecturally blocked by the single-citation-block-per-page rendering pattern, not a review gap

## Forensic-audit KPI note (important, disclosed honestly)

The Phase 7A forensic audit's own "413/413 major factual pages have zero external authority citations" metric is **unchanged** after this phase's work. This is a measurement-tool limitation, not a failure to cite: `scripts/audit-forensic/lib/derive.js`'s `AUTHORITY_RE` only recognizes `.gov`, `.edu`, `who.int`, `cdc.gov`, `epa.gov`, `nsf.org`, and `cpsc.gov` domains as "authority" links. Every citation added this phase to an `entity` page_type (the only family in that audit's "major factual" set that this phase touched) points to a manufacturer SDS host, a professional trade publication, or CMAHC -- all real, directly-verified, Phase 7K-researched sources, none of which match that narrow domain list. The regex predates Phase 7K's expanded source hierarchy (manufacturer/professional/material-industry sources), which this project's own evidence policy explicitly endorses using where appropriate. Torturing citations onto only `.gov`/`.edu` sources to move this number would have meant fabricating or misapplying sources -- explicitly prohibited. The audit tool itself is flagged as a review-queue item (see `REVIEW-QUEUE.md`) rather than modified in this phase, since it is a separate, historically-protected measurement tool, not production content.
