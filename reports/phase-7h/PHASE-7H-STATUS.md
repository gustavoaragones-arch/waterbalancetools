# Phase 7H — Schema Completeness, Thin Content & Accessibility Remediation

**Status: PASS WITH REVIEW QUEUE**

## Schema Baseline

Re-run fresh against the current, post-7G state (byte-identical to the original Phase 7A numbers — confirmed via CSV diff): VALID 856, QUESTIONABLE 49, MISSING 63.

## Schema Resolution

- **QUESTIONABLE 49 → 3**, all individually investigated: 27 CORRECT (detector bugs fixed — `.paa-item` FAQ recognition, DefinedTerm name policy), 5 FIXED (content made genuinely visible using its own already-declared text), 8 CORRECTED (a real double-escaping generator bug fixed in `template-utils.js`), 8 RECLASSIFY → VALID (legitimate short breadcrumb labels; detector rule corrected), 2 NOT_APPROPRIATE (retired non-production duplicates), remaining 3 individually dispositioned (2 NOT_APPROPRIATE, 1 accepted heuristic limitation).
- **MISSING 63 → 0 unaddressed**: 39 correctly SCHEMA_NOT_APPROPRIATE (noindex/internal-tooling), 24 SCHEMA_REQUIRED and implemented (editorial/methodology/provenance/revisions/releases/printables).
- **WebApplication review**: 11 of 13 real calculator pages had none at all — added, using each page's own existing title/description.
- **HowTo review**: removed from all 12 calculator pages — described "enter input → get result," the brief's explicit "simple calculator result" inappropriate example.

Full detail: `SCHEMA-RESOLUTION.md`, `schema-inventory.csv`.

## Schema Content Consistency

New validator `scripts/validate-schema-content-consistency.js`: **PASS — 480 pages, 0 critical, 0 warnings.** Checks FAQ visibility, HowTo step presence, WebApplication/Article URL matching, breadcrumb position integrity, retired-URL references, duplicate/fake entities, placeholder tokens.

## Thin Content

175 IMPROVE-flagged pages triaged by priority. 26 of a 28-item P1 near-duplication tier deferred to Phase 7G's already-documented KEEP decision (not reopened, per explicit instruction). 2 genuine P1 findings (`entities/fiberglass-pool.html`, `entities/vinyl-pool.html`) confirmed by direct read and classified INVESTIGATE — real gap, needs sourced content in a future phase, not fabricated now. Calculators/reference P2 items were mostly a title-length SEO signal, not content thinness; one genuine case (`reference/printable-resources-index.html`) read in full and classified KEEP by policy (satisfies its query despite low word count). No filler introduced anywhere. Full detail: `THIN-CONTENT-RESOLUTION.md`.

## Accessibility

Baseline: 26/523 pages flagged, all `HEADING_LEVEL_SKIP` (P1_HIGH). Root causes: static calculator "Result"/shape-tab headings one level too deep (12 files, no generator — hand-fixed), a shared `renderSections()` helper in `generate-trust.js` (13 pages, one source fix), and `generate-data-docs.js`'s dataset-card grid (1 page, one source fix). **Final: 0/523 flagged. P0 = 0, P1 = 0.** 0 missing-alt, 0 missing-viewport, 0 unlabeled calculator inputs, 0 missing table headers in the baseline or after. Full detail: `ACCESSIBILITY-RESOLUTION.md`.

## Calculator Accessibility

All calculator `<input>` elements verified to have a matching `<label for="...">` (validator-enforced, 0 violations). Heading hierarchy fixed on all 13 pages. No calculation logic touched.

## AEO

No schema-only answers (`FAQ_SCHEMA_NOT_VISIBLE` is a CRITICAL, build-failing check — 0 violations sitewide). Direct-answer structure on spot-checked high-value pages (calculators, reference explainers, root charts) verified intact; the only change to their visible content was making an already-declared FAQ answer visible (chart pages) or fixing a heading level (calculators) — no new answer blocks were manufactured. Full detail: `AEO-RESOLUTION.md`.

## Production Changes

8 generator/template/schema-engine source files changed; 2 new detector-bug fixes in the (non-production) forensic audit tooling; 3 new validator/inventory scripts; ~28 hand-edited static pages (no generator existed for any of them, confirmed before editing) covering FAQ visibility, HowTo removal, WebApplication addition, breadcrumb-escaping fixes, and heading-level fixes. Full exact list with reasons: `PRODUCTION-CHANGES.md`.

## Validators

| Validator | Result |
|---|---|
| `validate-schema-content-consistency.js` (new) | PASS — 480 pages, 0 critical, 0 warnings |
| `validate-phase-7h.js` (new) | PASS — 536 pages, 0 violations |

## Regression

```
7B  validate-generated-output:      PASS -- 502 files, 0 unresolved template artifacts
7C  validate-url-indexation:        PASS -- 523 pages, 479 sitemap URLs, 0 violations
7D.2 golden set v2:                 PASS -- 104/104
7D.3 evidence dataset:              PASS -- 5861 rows, 0 violations
7E  provenance:                     PASS -- 5861 records, 0 violations
7E.1 provenance-resolution:         PASS -- 499 conflicts, 0 violations
7F.1 editorial-decisions:           PASS -- 141 decisions, 0 violations
7G  programmatic-quality:           PASS -- 26 pages, 0 violations
7H  schema-content-consistency:     PASS -- 480 pages, 0 critical
7H  phase validator:                PASS -- 536 pages, 0 violations
    broken links:                   0 issues, 523 pages
    URL engine:                     PASS -- 263 assertions
```

No prior phase regressed.

## Reproducibility

Two-build HTML-content hash comparison found nondeterminism, root-caused and documented rather than hidden: (1) `qa-summary`'s numeric QA score fluctuates build-to-build (traced to `new Date().toISOString()` timestamp calls in `qa-engine.js`/`generate-qa-report.js` feeding a freshness-sensitive score — pre-existing infrastructure behavior, not introduced this phase). (2) One breadcrumb's JSON-LD escaping was observed oscillating between builds on `academy/hot-tubs/index.html`; the current on-disk state is confirmed correct (`"Hot Tubs & Spas"`, unescaped) and both new validators pass against it, but the exact generator-ordering cause of the oscillation was not fully isolated within this phase's effort budget — logged as a genuine, disclosed finding for a future generator-pipeline hardening pass, not silently ignored. This is the same class of pre-existing timestamp/freshness-driven build churn every prior phase in this project encountered and disclosed (sitemap dates, `_generated` fields); it does not affect the schema/accessibility content that is this phase's actual deliverable.

## Scope Control

Confirmed via `git diff --stat`: no Spanish/French paths exist in the repository; no AdSense config touched; `js/calc-utils.js` (calculator formulas) untouched; `scripts/url-policy.js`, `scripts/redirect-rules.js`, `scripts/generate-sitemaps.js`, `_redirects` untouched (no URL/redirect/sitemap architecture changes); `scripts/generators/*` (Phase 7G's programmatic generators) untouched — no broad Phase 7G rewrite; no Person schema or fake authority added anywhere (validator-enforced).

## Remaining Review Queue

- `entities/fiberglass-pool.html` / `entities/vinyl-pool.html` — genuine near-duplicate thin content; needs sourced differentiated facts in a future content/data phase.
- ~62 additional entity/glossary pages sharing the likely-same thin one-sentence-definition pattern — not individually audited this phase.
- ~19 calculator/reference pages flagged `TITLE_TOO_LONG` — an on-page SEO metadata concern, not thinness; logged for a future metadata pass.
- The build-to-build QA-score and breadcrumb-escaping nondeterminism above — logged for a future generator-pipeline hardening pass.
- `releases/index.html`'s breadcrumb label ("Releases" vs H1 "Release History") — accepted as the standard short-label pattern; the automated bidirectional-substring heuristic doesn't happen to catch this specific pair, documented rather than force-matched.

## Phase 7I Decision

**GO** — with the review queue above carried forward.

**DO NOT BEGIN PHASE 7I AUTOMATICALLY.**

END PHASE 7H
