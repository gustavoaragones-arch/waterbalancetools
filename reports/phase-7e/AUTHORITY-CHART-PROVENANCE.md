# Authority Chart Provenance

8 chart pages exist. 5 are template-generated (`scripts/generate-authority-charts.js`, idempotent, safe to extend); 3 are older, hand-authored static HTML files with no dedicated generator (only injector scripts like `inject-last-updated.js` touch them). This distinction matters for production implementation: adding a citation block to a *generated* page is a safe, repeatable, idempotent change; adding one to a *static* page requires either hand-editing production HTML (which this project's own convention discourages — see Phase 7D.3 Step 20) or writing a new small idempotent injector. This phase implements rendering only on the generator-driven pages (see Production Citation Coverage in the final report); the 3 static pages are audited here at the data level only.

## Template-generated charts (`scripts/generate-authority-charts.js`)

| Chart | Claim | Parameter | Environment | Range | Source | Support |
|---|---|---|---|---|---|---|
| Pool CYA Levels Chart | CYA 30-50 ppm ideal | cyanuric_acid | pool | `range-cya-residential-routine-outdoor` | none (empty `source_ids`) | REQUIRES_REVIEW — matches the site's own canonical range but no confirmed primary source |
| Pool CYA Levels Chart | Salt pools 60-80 ppm CYA | cyanuric_acid | pool (SWG) | `range-cya-saltwater-outdoor` | none | REQUIRES_REVIEW |
| Pool CYA Levels Chart | >100 ppm chlorine lock | cyanuric_acid | pool | (threshold, not a target range) | — | Descriptive claim, not independently source-checked this phase |
| Pool Alkalinity Levels Chart | TA 80-120 ppm ideal | total_alkalinity | pool | `range-ta-residential-practical` | `phta-total-alkalinity-fact-sheet` | **SUPPORTED** (CONTEXTUAL status) — citable |
| Hot Tub Chlorine Levels Chart | FC 3-5 ppm | free_chlorine | hot_tub | `range-fc-hottub-chlorine-routine` | `cdc-healthy-swimming-home-treatment` | **SUPPORTED** — citable |
| Hot Tub Chemical Levels Chart | FC 3-5, pH 7.2-7.8, TA 80-120, CH 150-250, CYA 30-50 (5 parameters) | multiple | hot_tub | mixed | FC/pH: CDC (supported); TA: no confirmed hot-tub-specific source (see `range-ta-hottub`, empty `source_ids`); CH/CYA: no hot-tub-specific canonical range at all | Partially citable — FC and pH rows only |
| Salt Water Pool Chemical Levels Chart | Salt 2,700-3,400 ppm | salt | pool | `range-salt-generic-operating` | none | REQUIRES_REVIEW — equipment-dependent, no generic primary source (consistent with Phase 7D's disclosed limitation) |

## Static (non-generated) charts — data-level audit only

| Chart | Headline claim (as found) | Assessment |
|---|---|---|
| `pool-chemical-levels-chart.html` | "Total alkalinity buffers pH — common pool targets are roughly 80-120 ppm" | Same range as the generated Alkalinity chart; citable to the same source (`phta-total-alkalinity-fact-sheet`) if this page is brought into the generator pipeline in a future phase. |
| `pool-chlorine-levels-chart.html` | Chlorine level guidance (page exists; specific figures not independently re-extracted at the same granularity in this pass) | Not rendered this phase — static file, no generator to safely extend. |
| `pool-ph-levels-chart.html` | pH level guidance (same caveat) | Not rendered this phase — static file. |

## Recommendation

Do not add citations to a chart simply because another chart states the same number (per the brief's explicit instruction) — each row above was checked against its own chart's actual stated range and environment, not copied from a sibling chart. The Hot Tub Chemical Levels Chart is a good illustration of why: it correctly gets *partial* citation (FC and pH rows only), not a blanket "Sources" block implying every row is equally supported.
