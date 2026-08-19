# Calculator Editorial Decisions

## Distinction preserved

SUPPORTED CHEMISTRY TARGET (pH/FC/TA/CH ranges — CDC/PHTA-backed) vs. SUPPORTED FORMULA (pool-volume geometry, turnover rate, LSI equation — pure math, independently verifiable) vs. SUPPORTED DOSING COEFFICIENT (none currently meet this bar) vs. USER-PROVIDED INPUT (test-kit readings the calculator takes as given, never independently checked) vs. INTERNAL MODEL ASSUMPTION (the 6 dosing coefficients corrected to `limited`/`internal-dataset` in Phase 7F).

## This phase's review

The 3 Tier-1 calculator records that reached this phase's review queue (`afafa0a42ca5ecd7`, `95ff7debc53ce62f`, `dd0df4b5d44367b9` — see `REVIEW-QUEUE-FINAL.md`) were all found to be **already covered** by Phase 7F's Trust Panel corrections or Phase 7E.1's shock claim-family decision. No new calculator-specific finding emerged requiring a fresh production action.

## `js/calc-utils.js`

**Not modified.** No specific mathematical or scientific defect was independently demonstrated this phase (the 0.4-vs-0.5 combined-chlorine finding and the hot-tub CYA finding both concern target ranges and reference-page prose, not calculator math). Supported targets were not downgraded merely because their associated dosing formula remains unverified — this distinction, established in Phase 7F, is unchanged and reconfirmed here.
