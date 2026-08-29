# Phase 7P -- Search-Demand Gap Validation & Topical Expansion

**Status: PASS**

## Baseline

525 total HTML files (524 before this phase + 1 new page), 478 canonical indexable pages (477 before), 6 redirect sources (unchanged from Phase 7O.1), 0 true orphans, 18 citation blocks / 23 links. Full detail: `CONTENT-INVENTORY.csv`.

## 7N Search-Gap Revalidation

All 8 gaps from Phase 7N independently re-tested against fresh repository evidence (and, where warranted, real external research), not assumed valid: **1 CREATE, 2 DEFER, 5 REJECT**. Notably, direct re-reading of `academy/equipment/salt-systems.html` found the "salt-pool chemistry management" gap already substantively closed -- 7N's characterization of that page as hardware-only was inaccurate. Full detail: `SEARCH-GAP-REVALIDATION.csv`.

## New Search-Intent Discovery

A repository-grounded pass against a fresh 19-cluster topical map (built from real inbound-link/depth/schema data, not estimates) surfaced no new candidate beyond the 8 already carried forward. Two thin clusters (indoor pools, bromine) were specifically reviewed and closed without action. Full detail: `SEARCH-INTENT-RESEARCH.md`.

## External Search Validation

3 real web searches + 2 real fetches performed for the 3 candidates that needed external validation (first-fill startup, covered-pool, water-replacement). One primary source -- a PHTA (Pool & Hot Tub Alliance) fact sheet -- was fetched and read in full, not paraphrased from a search snippet, and used to back the one created page. A second source (NPC) returned HTTP 403 and was not cited. No search-volume or GSC data was used or fabricated anywhere. Full detail: `SEARCH-INTENT-RESEARCH.md` / `SEARCH-INTENT-EVIDENCE.csv`.

## Candidate Matrix

All 8 candidates scored 0-5 across 10 editorial criteria (distinct intent, evidence, topical/architectural fit, differentiation, resilience, AEO value, link opportunity, maintenance feasibility, cannibalization risk). The score is an editorial aid, not a ranking metric -- every classification is separately justified in prose in `SEARCH-GAP-REVALIDATION.csv`. Full detail: `CONTENT-CANDIDATE-MATRIX.csv`.

## Cannibalization

The one CREATE candidate was tested against its nearest existing neighbor (`guides/seasonal/opening-pool-chemistry-checklist.html`). Distinct question confirmed by direct re-read (that guide is scoped to reopening an already-cured pool; the new page covers a one-time, curing-sensitive 28-day sequence for a pool that has never been balanced). 0 high-risk pairs found. A differentiation link was added to the existing guide so a reader who lands on the wrong page is redirected, closing the loop in both directions.

## Content-Type Decision

ACADEMY ARTICLE -- explanatory/procedural narrative content, not a task-tracked HowTo, not a calculator (no new formula), not a chart (the staged day-by-day sequence doesn't compress into a lookup table), not a new programmatic family (a single, non-repeated intent).

## Evidence / Provenance

Every numeric claim on the new page traces to the PHTA fact sheet read in full on 2026-08-28. The CYA target (30-50 ppm during startup) is explicitly flagged in the page body as a startup-specific transitional value, distinct from the site's steady-state CYA range, to avoid a silent contradiction with the CYA chart. No claim was inherited from a neighboring page without verifying the context matched. New source registered in `scripts/data/chemistry-sources.js` (`phta-fresh-fill-startup-fact-sheet`), matching the existing Phase 7D provenance schema.

## Safety

The topic involves chlorine timing, shock restrictions, and chemical-addition order -- explicit safety review performed (Step 10). All safety-relevant restrictions (no chlorine 48h, no shock 30 days, no simultaneous calcium/alkalinity increaser addition, no heater until manufacturer waiting period) are stated directly from the primary source, not softened or inferred.

## Seasonal Resilience

Year-round topic (new pools and replastering happen in every season, both hemispheres); not a calendar-driven page. No Spanish/French content added.

## AEO

Direct-answer Key Facts box (4 scannable facts) plus a clear staged decision framework (Days 1-3 / Days 4-28), a worked example, and a citation-worthy primary source -- the topology this project's other high-performing academy articles already use.

## Internal Linking

Auto-integrated into its hub (`academy/fundamentals` index) and all 7 sibling sidebars by the existing generator; 15 outbound contextual links (calculators, chart, glossary, formulas, related academy/guide topics); 1 hand-added inbound differentiation link from the seasonal-reopening guide. Crawl simulation confirms 478/478 canonical pages discovered (0 undiscovered) after the change.

## Approved Content Blueprints

- `/academy/fundamentals/new-pool-startup-chemistry` -- New Pool Startup Chemistry (Fresh Fill & New Plaster). Full blueprint: `CONTENT-BLUEPRINTS.md`.

## Production Changes

3 changes: (1) one new academy article via the existing `data/academy.json` + `generate-academy.js` generator; (2) one new source record in `scripts/data/chemistry-sources.js`; (3) one differentiation sentence/link added to `guides/seasonal/opening-pool-chemistry-checklist.html`. Everything else that changed on disk is the ordinary, expected output of re-running the existing build pipeline (sitemaps, search index, QA report, footer version badges). Full detail: `PRODUCTION-CHANGES.md`.

## Validator

`scripts/validate-phase-7p.js`: 478 canonical pages scanned, 1 created page validated against 28 checks (candidate-decision documentation, distinct intent, URL policy, canonical, robots, sitemap membership, discovery path, hub membership, internal links, broken links, redirect-source links, template tokens, schema appropriateness, no HowTo misuse, citation/provenance presence, duplicate titles/descriptions, accessibility proxy, programmatic-count regression, redirect-registry regression, undocumented-page detection, fabricated-data scan, language scan, formula-file-change scan). Result: 0 errors, 0 warnings.

## Regression

All 25 applicable prior-phase validators and test suites pass with 0 errors/violations (chemistry knowledge/extraction/evidence, provenance, provenance-resolution, trust/trust-layer, editorial decisions, programmatic quality, schema-content consistency, entity provenance, citation coverage, Phase 7H/7I/7K/7M/7N/7O/7P, URL engine + indexation, broken links). `npm run build` passes end-to-end with QA score 99/100, **0 point change** from the pre-Phase-7P baseline across every one of the 13 QA audit categories.

## Forensic Re-Audit

525 total HTML files (+1, the new page). Schema: 952 valid / 39 missing / 6 questionable (up from 3 questionable -- fully explained: the 3 new flags are the Phase-7O.1 printables redirect sources, not this phase's page). Orphan flags: 7 (up from 4 -- exactly the same 3 printables redirect sources, 0 true orphans either way). Duplicate-title groups in the broad forensic scan: 3, all pre-existing since commit 67fb770 (a noindex printables page sharing title text with its indexable entity counterpart) and confirmed 0 among canonical indexable pages, which is the set that actually matters for search. 0 duplicate descriptions, 0 HIGH-risk cannibalization, 0 accessibility flags, no legitimate page deleted or hidden.

## Reproducibility

Real two-build hash comparison performed. The new page is byte-identical across both builds. The pre-existing footer-whitespace nondeterminism (same category composition as Phase 7M/7N/7O: entities/guides/calculators/reference-dominated) is present and not expanded. QA-dashboard pages carry a deliberate live build timestamp, identified separately in this phase's reporting (not previously broken out), and are not a regression.

## Scope Control

No Spanish/French, no calculator-formula changes, no programmatic-architecture changes, printables/resources decision not reopened, no fabricated search-volume/GSC/citations/authors, no mass page creation, no doorway or keyword-variant pages, no sitemap-priority manipulation, no page created for word count alone, no broad chemistry rewrites. Exactly one page created, and it survived every gate on its own evidence.

## Remaining Review Queue

- Covered-pool chemistry (DEFER -- real gap, insufficient authoritative source tier found this phase)
- Water-replacement / full-drain chemistry (DEFER -- real gap, recommend a light EXPAND of `entities/water-replacement.html` in a future phase rather than a new page)
- Bromine dosing calculator and standalone LSI calculator (REJECT this phase -- both blocked by the Step 25 scope prohibition on calculator/formula/architecture changes, unchanged from 7N)
- Pre-existing duplicate `id: "fund-06"` in `data/academy.json` (incidental finding, no functional effect, not fixed -- out of scope)

Full detail: `REVIEW-QUEUE.md`.

## Phase 7Q Decision

**GO** -- one real, evidence-backed page created (primary source read in full, not paraphrased), 7 other candidates honestly declined or deferred with real reasoning rather than forced into creation, zero regressions across 25 validators and a real two-build reproducibility check, and the Director's explicit "zero pages is an acceptable outcome" standard was respected -- this phase shipped exactly one page because exactly one page cleared every gate, not more and not fewer.

DO NOT BEGIN PHASE 7Q AUTOMATICALLY.

END PHASE 7P
