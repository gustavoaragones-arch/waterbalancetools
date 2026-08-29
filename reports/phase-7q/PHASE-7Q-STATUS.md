# Phase 7Q -- Production Quality, Review-Queue Closure & Final SEO Integrity

**Status: PASS WITH REVIEW QUEUE**

## Baseline

Phase 7P (commit `2a3a682`), re-verified fresh rather than trusted: 525 total HTML files, 478 canonical indexable pages, 478 sitemap URLs, 6 redirect sources, 18 citation blocks / 23 links, QA 99/100. All confirmed live via `npm run build` and the full validator suite before any Phase 7Q change was made.

## Every carry-forward queue item

26 items tracked in `DECISION-MATRIX.csv`, each given an explicit disposition: **4 RESOLVED, 9 CONFIRMED_SAFE, 8 DEFERRED, 4 REJECTED, 1 PARTIALLY_RESOLVED**. None silently dropped; none forced to RESOLVED to make the count look better. Full narrative in `REVIEW-QUEUE.md`.

## Priority A -- Water-replacement entity

RESOLVED (partial). A genuine primary source (PHTA "Water Conservation During Droughts," read in full) directly supports the site's existing 1,500 ppm TDS-increase-over-baseline figure and the general drain-for-high-CYA principle -- cited on `entities/water-replacement.html` with an explicit scoping note. The CYA(80ppm)/calcium(500ppm)/pool-TDS(3000ppm) figures are NOT stated by this source and correctly remain uncited (DEFERRED) rather than force-matched.

## Priority B -- Covered-pool chemistry

RESOLVED, reclassified from Phase 7P's DEFER. The same PHTA source's Section VII (Pool Cover) gives real, attributable chemical-consumption (up to 60%) and heating-cost (up to 70%) reduction figures plus an important DBP/combined-chlorine-buildup caution -- exactly the authority tier Phase 7P's marketing-blog-dominated search couldn't clear. Existing `entities/cover.html` expanded by 2 sentences; no new page created.

## Priority C -- Material-property claims

CONFIRMED_SAFE across the board. Vinyl-liner-bleaching (SUPPORTED), fiberglass-gelcoat (CONTEXTUAL), concrete/gunite (no dedicated claim) all re-verified live and unchanged from Phase 7K's documented dispositions.

## Priority D -- Remaining entity provenance

PARTIALLY_RESOLVED. Cross-referenced the 61-entity RESEARCH_REQUIRED queue against every source added since Phase 7J: 7 entities now carry at least one resolved/cited claim (5 from 7K/7L, 2 new this phase) but correctly remain RESEARCH REQUIRED overall since each has other still-unverified HIGH-priority claims. The remaining ~54 entities are unchanged -- not mechanically pushed toward a coverage percentage.

## Priority E -- Shock-dosing registry gap

CONFIRMED_SAFE, still correctly unresolved. Re-verified the routine-maintenance (2-5ppm vs. 10-20ppm), green-algae (30ppm), and incident-response (20ppm CDC/MAHC) tiers all match Phase 7K's documented state exactly. Checked the most-likely new authoritative candidate (a PHTA fact sheet) and confirmed, by reading it in full, that it explicitly defers shock dosage to product labels rather than resolving the disagreement -- a genuine negative finding, not a skipped check.

## Priority F -- Trichlor + calcium hypochlorite

CONFIRMED_SAFE. The Phase 7K SDS-based resolution is intact and unmodified. This phase added an independent corroborating citation (a different source type, an industry-standard fact sheet) on `entities/calcium-hypochlorite.html` -- strengthening, not reopening, the existing resolution.

## Priority G -- Citation coverage

Reassessed all 5 named items. `pool-shock-calculator.html` and the two architecturally-blocked authority charts remain correctly uncited/DEFERRED (no new source found; the row-level citation gap needs a template restructure out of this phase's scope). The two intentionally-uncited entity claims (`shock-treatment`'s routine/breakpoint figures, `unit-fahrenheit`'s extraction near-miss) are unchanged. Net citation coverage grew from real, individually-scoped evidence found for Priorities A/B/F: 18 -> 21 blocks, 23 -> 26 links.

## Priority H -- Forensic audit tooling

RESOLVED. `AUTHORITY_RE` in `scripts/audit-forensic/lib/derive.js` expanded to recognize the specific, verified manufacturer/professional/material-association/CMAHC domains already present in `chemistry-sources.js`. Measured before/after on the identical current repository state: **416/416 -> 402/416** major factual pages with zero recognized external authority citations. A metric-definition change only, explicitly documented as non-retroactive -- earlier phases' own published numbers are untouched.

## Priority I -- Build nondeterminism

Root cause identified for the first time (a genuine finding beyond every prior phase's "same pattern, not expanded"): `generate-entity-pages.js` runs twice in `scripts/run-all-generators.js`, and the second full-template re-render's baseline whitespace differs from what the many injector scripts between the two calls left in place. Verified NOT a content-loss bug (entity schema survives both renders correctly). Fixing it safely requires reconciling why the generator runs twice at all -- genuine pipeline-architecture work, DEFERRED per the Director's explicit stop rule against template churn. The separate, deliberate QA/report build-timestamp variability is reconfirmed as by-design, not a defect.

## Priority J -- Legacy sitemap generator

RESOLVED. Confirmed dead code (not required/imported anywhere in the automated pipeline) but still reachable and regression-risky via the live `npm run sitemap` entry point. Added a guard that refuses to run (and does not write) without an explicit `FORCE_LEGACY_SITEMAP=1` override. Not deleted, per policy.

## Priority K -- Academy duplicate ID

RESOLVED, and this phase's clearest self-correction: Phase 7P classified `fund-06`'s duplication as inert. Tracing `generate-entity-pages.js`'s `articleById` lookup this phase found it was NOT inert -- `entities/maintenance-checklist.html` was silently cross-linking to the wrong academy article due to the id collision. Fixed at the data source (`data/academy.json`); verified the correct article now resolves.

## Priority L -- Remaining title findings

CONFIRMED_SAFE. Fresh measurement: 43 findings (vs. Phase 7N's 39; the +1 in academy is Phase 7P's own new page, consistent with the established KEEP pattern). Same category distribution as 7N's already-individually-reviewed findings. No mechanical shortening performed.

## Priority M -- Programmatic families

CONFIRMED_SAFE, not reopened. `validate-programmatic-quality.js`: 26 pages, 0 violations, unchanged since Phase 7N.1.

## Priority N -- Calculator formulas

CONFIRMED_SAFE, untouched. Verified via `git diff` against the Phase 7P baseline commit: zero changes to any formula-logic file. Bromine dosing calculator and standalone LSI calculator both remain REJECTED for this phase (scope-blocked), unchanged from Phase 7P's own reasoning.

## Priority O -- Final sitewide integrity sweep

26 validators run fresh (not relied on historically): chemistry knowledge/extraction/evidence-dataset, provenance, provenance-resolution, trust/trust-layer, editorial decisions, programmatic quality, schema-content consistency, entity provenance, citation coverage, Phase 7H/7I/7K/7M/7N/7O/7P/7Q, URL engine + indexation, broken links, url-policy regression, plus the new Phase 7Q validator and test suite. **All 26 pass with 0 errors.** `npm run build` passes end-to-end.

## Validator

`scripts/validate-phase-7q.js`: guards calculator-formula changes, URL/redirect-registry changes, Spanish/French content, fabricated source records, mass page creation, fake authors/reviewers, programmatic-family restructuring, dangling citation links, deleted canonical pages, and undocumented production changes. Result: **0 errors, 0 warnings**.

## Tests

`scripts/test-phase-7q.js`: 18 assertions covering the legacy-sitemap-generator guard, the AUTHORITY_RE domain fix, the academy.json duplicate-id fix, the 3 new entity citations, and the maintenance-checklist cross-link correction. **All pass.**

## Regression

26/26 validators pass. QA 99/100, **0 point change** from the Phase 7P baseline across every category.

## Forensic Re-Audit

525 total HTML files (unchanged -- 0 pages created, 0 deleted). Schema 952/39/6 (unchanged). Orphan flags 7, 0 true orphans (unchanged). Duplicate-title groups: 3 in the broad forensic scan (all pre-existing noindex/entity title-text collisions from Phase 7O.1, confirmed via `git show` on the pre-Phase-7Q commit -- not introduced this phase), 0 among canonical indexable pages. 0 duplicate descriptions. 0 HIGH-risk cannibalization. Source-audit KPI improved from the Priority H tooling fix: 416/416 -> 402/416 (a measurement-definition change, not new citations beyond the 3 real ones added).

## Reproducibility

Real two-build comparison performed on the final state. All 3 new citation blocks are semantically stable and byte-identical in their citation content across builds; the pre-existing, already-documented footer-whitespace pattern (now root-caused, see Priority I) persists unexpanded. No new nondeterminism introduced.

## Scope Control

No Spanish/French, no calculator-formula changes, no URL/redirect-registry changes, no programmatic-family restructuring, no fabricated sources/authors/reviewers, no mass page creation, no unsupported claim promoted to supported, no undocumented production change (all 6 real source-file edits named in `PRODUCTION-CHANGES.md` and verified by the validator).

## Remaining Review Queue

Genuinely unresolved (evidence insufficient): routine-maintenance shock dosing, water-replacement's 3 specific numeric drain triggers, `pool-shock-calculator.html`'s breakpoint default, `unit-fahrenheit`'s extraction near-miss. Architecturally blocked (would require template/pipeline restructuring): the 2 authority-chart row-level citations, the salt-water chart's FC/CYA scenario question, the footer-whitespace nondeterminism's actual fix. Incremental: the remaining ~54-entity provenance queue, ~40 lower-priority qualitative claims. Out of scope by standing policy: bromine calculator, standalone LSI calculator, programmatic-family architecture. Full detail in `REVIEW-QUEUE.md`.

## Phase 7R Recommendation

**GO**, with the review queue above carried forward explicitly. No item was hidden or force-resolved to present a cleaner number.

DO NOT BEGIN PHASE 7R AUTOMATICALLY.

END PHASE 7Q
