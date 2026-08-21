# Phase 7L — Review Queue (Carry-Forward)

## Architecturally blocked citations (real, eligible, not renderable without a restructure)

`hot-tub-chemical-levels-chart.html` and `salt-water-pool-chemical-levels-chart.html` each have some genuinely supported rows (FC/CYA on the hot-tub chart; TA/CH on the salt-water chart) mixed with unsupported or narrower-than-source rows on the same page. The current `sourceIds`-per-chart-config mechanism (`generate-authority-charts.js`) can only attach one citation block to the whole page. Rendering it would misleadingly extend apparent support to every row. A future phase could add row-level citation support to the chart template (e.g. a footnote marker per `<td>`) -- this was judged out of scope for a citation-implementation phase per Step 16's no-content-restructure guidance.

## Possible pre-existing content inconsistency, NOT resolved this phase

`salt-water-pool-chemical-levels-chart.html` states free chlorine target 1-3 ppm while also recommending CYA 60-80 ppm on the same page. Per the site's own CDC-sourced claim family, a CYA-stabilized pool's FC target should be the 2-4 ppm range, not the 1-3 ppm (no-CYA) range used elsewhere on the same page -- the same category of mismatch Phase 7F.1 already fixed for hot tubs. Not verified or corrected this phase (would require deeper research into whether the site's SWG-specific guidance intentionally differs); flagged for a future phase rather than silently patched.

## Forensic-audit tooling gap

`scripts/audit-forensic/lib/derive.js`'s `AUTHORITY_RE` domain allowlist (`.gov`/`.edu`/`who.int`/`cdc.gov`/`epa.gov`/`nsf.org`/`cpsc.gov`) does not recognize the source types Phase 7K's expanded hierarchy legitimately introduced (manufacturer SDS hosts, professional trade publications, material-industry associations, CMAHC). This keeps the audit's "413/413 major factual pages have zero external citations" KPI static even though 5 entity pages now carry real, verified citations. Not modified this phase (the forensic audit is a separate, historically-protected tool, and widening it is itself a judgment call about what should count as authoritative -- better made deliberately in its own phase than as a side effect of a citation-rendering phase).

## Entity claims still correctly uncited (REQUIRES_REVIEW, no source found)

- `entities/shock-treatment.html`: routine-maintenance (10 ppm) and breakpoint-rule (10x combined chlorine) figures remain uncited -- genuine source disagreement (Phase 7K) / no confirmed source, respectively.
- `entities/unit-fahrenheit.html`: the 78-84°F/104°F compound sentence's extracted claim value doesn't match the number the new hot-tub-safety source supports -- a near-miss noted, not force-cited.
- ~40 lower-priority qualitative entity claims (LSI/corrosion, metal staining, chloramine/irritation mechanisms) carried forward from Phase 7K with no registry-level source -- untouched this phase, consistent with the stop-rule against disproportionate research effort on ordinary claims.

## Calculators still uncited

`calculators/pool-shock-calculator.html` remains `CALCULATOR_REVIEW_REQUIRED` -- the breakpoint-dosing rule of thumb it defaults to has no confirmed primary source (unchanged since Phase 7E).
