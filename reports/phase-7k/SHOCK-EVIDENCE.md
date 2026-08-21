# Phase 7K — Shock Dosing Evidence, By Scenario

Per the Director's explicit instruction, routine maintenance, algae recovery, and incident response are treated as three distinct scenarios, never conflated into one number.

| Scenario | Figure | Status | Source(s) |
|---|---|---|---|
| Routine maintenance shock | Disputed: 2-5 ppm vs. 10-20 ppm | **REQUIRES_REVIEW** — genuine disagreement, not resolved | Pool & Spa News/Taylor Technologies (2-5 ppm) vs. AQUA Magazine/HASA (10-20 ppm) |
| Green algae recovery | 30 ppm free chlorine (breakpoint) | **CONTEXTUAL** | `poolspanews-algae-breakpoint-2016` |
| Fecal/vomit incident response (public-facility protocol) | 20 ppm, held for a specified duration | **SUPPORTED** (pre-existing, unchanged this phase) | CDC/MAHC |

## Why the routine-maintenance gap was not filled

Two professional trade sources address "how much to shock a pool normally" and give materially different numbers for what appears to be the same general concept. Manufacturing a single number by picking one source, averaging them, or asserting the site's prior 10 ppm figure was "close enough" would have violated the non-negotiable evidence policy's explicit instruction not to create a range merely because the site needs one. This is logged as an open research item in the review queue rather than silently resolved.

## Production content change

`scripts/generators/generate-shock-pages.js` (the Phase 7G shock-cluster generator) previously conflated "double dose" as covering both "heavy algae" and "contamination" under one hardcoded 20 ppm figure — exactly the kind of scenario-conflation this phase's evidence policy warns against, and now demonstrably inconsistent with the newly-verified 30 ppm green-algae figure. Corrected to a distinct, sourced "green algae recovery: 30 ppm" tier; the general "double" language elsewhere on the page was updated for consistency with the new tier so the page doesn't contradict itself. See `PRODUCTION-CHANGES.md` for the full diff summary. The routine-maintenance 10 ppm "standard" tier was left unchanged since it falls within (if at the low end of) the disputed 2-20 ppm range and was not the subject of a specific, resolved factual error.
