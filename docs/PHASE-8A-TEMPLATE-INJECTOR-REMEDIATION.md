# Phase 8A — Sitewide Template/Injector Drift & Build Determinism Remediation

## Phase objective

Eliminate the previously documented sitewide template/injector drift and build-convergence defect while preserving all validated chemistry, content, SEO, schema, provenance, source-of-truth, and calculator behavior established through Phase 7Z.

## Phase 7Z baseline

Starting commit: `71b4221` ("Phase 7Z: source/data pipeline integrity & academy desync remediation"), verified `HEAD == origin/main`, clean working tree. Verified present: the authoritative `scripts/data/*.js` source tier, `data/*.json` generated outputs, `scripts/validate-source-data-consistency.js`, the Phase 7Z validator/test pair, the Phase 7Z build-gate integration in `run-all-generators.js`, and all Phase 7Z production changes (`fund-07`/`fund-08` as real source records, the three academy record-integrity reconciliations).

## Original defect (as previously documented, and as independently reproduced)

Prior phases (7Q, 7Y) attributed the drift to `generate-entity-pages.js` running twice in the pipeline with imperfect injector idempotency across the two calls. **This phase independently reproduced the drift but disproved that specific mechanism**: `run-all-generators.js` calls `require(path.join(__dirname, 'generate-entity-pages.js'))` twice using the identical resolved path, and Node's module cache means the second call is a no-op — verified directly (`require()` the script twice in one process; the completion log line prints once, not twice).

## Reproduction procedure

1. Verified `git status --short` empty, `HEAD == origin/main == 71b4221`.
2. Ran `npm run build` once against the clean baseline: exit 0, 241 tracked files modified — reproducing the documented drift exactly.
3. Ran `npm run build` a second time without reverting: file *set* unchanged (241), but hashing representative files (`entities/algae.html`, `calculators/pool-shock-calculator.html`, `data/navigation.json`) showed **different content** between the two runs — proving genuine, unbounded, oscillating non-determinism, not a one-time "stale baseline catches up" effect.
4. Diffed the two runs' output directly: the differences were single blank lines accumulating immediately before `<footer class="site-footer">` in both `entities/*.html` and `calculators/*.html`, growing by a small, fixed amount on every build.

## Root cause

**Five independent instances of the same anti-pattern**, found by direct instrumentation and bisection (temporarily logging state after each pipeline step, run in exact `run-all-generators.js` order, on a git-HEAD-reset fixture, isolating the exact script and exact field responsible each time):

A shared "strip existing block, then reinsert a fresh copy" idiom, used throughout the injector layer for idempotent re-runs, where the **insertion** side supplies its own leading (or leading+trailing) separator whitespace as part of the inserted template, but the **strip/removal** regex does not consume that same whitespace when removing the block on a subsequent run. Each build cycle: strip removes the block itself but leaves its neighboring separator orphaned in place; insert adds a *new* copy of that same separator. The orphaned separator accumulates, unbounded, forever.

### The five instances

1. **`scripts/inject-footer.js`** — `FOOTER_RE` matched only `<footer ...>...</footer>`, not the whitespace before it. `FOOTER`'s own leading `  ` (2 spaces, no newline) was appended after whatever leftover whitespace a prior run had already left — +2 characters per build, on **488 pages** (every page with a footer, not just entities). This script's `walk()` also had no directory-level skip for `templates/`, so it directly corrupted `templates/entity-template.html` (and `templates/release-template.html`) on every run — the corrupted template's own baked-in whitespace was then stamped onto every freshly-generated entity page via `fill(TMPL, tokens)`, which is why `entities/*.html` dominated the visible drift (105 of 241 files) even though the underlying defect was sitewide.
2. **`scripts/inject-ads.js`** — `stripAds()`'s regex matched `<div class="ad ad-*">...</div>` plus trailing whitespace, but not the leading `\n    ` each `AD_*` constant supplies on insertion. Affected `programmatic/`, `calculators/`, and `guides/` pages specifically.
3. **`scripts/restructure-calculator-pages.js`** — the shared `pluck()`/`pluckInline()` helpers (used by all 16 `ex()`/`exInline()` calculator-section extractions) removed a matched block but left any whitespace immediately preceding it in `rest`. Since `mainContent`'s final leftover is discarded but each *subsequent* extraction keeps operating on the same string, the orphaned whitespace from one extraction (e.g. `adResult`, positioned inside the output-panel div) was silently absorbed into the *next* extraction that happened to run over that same region (`outputPanel`) — one extra blank line inside the extracted `outputPanel` block, every build, forever. This was the mechanism found isolated to calculator pages specifically (`calculators/chemical-calculator.html` traced from a 156-line historical blank-line scar, growing +1/build).
4. **`scripts/generate-version-badges.js`** — both `upsertBadgeAfterH1()` and `upsertFooterBadge()` stripped only `markerStart...markerEnd`, not the leading `\n` their own insertion (`` `${anchor}\n${markerStart}...${markerEnd}` ``) had added. Affected any page carrying a version badge, including `404.html`, `about/index.html`, and `index.html`.
5. **`scripts/generate-google-dashboard.js`** — `injectFreshnessBlock()` stripped only the marker pair, leaving the trailing `\n` its own insertion (`` `${block}\n</main>` ``) had added, outside the marker pair. Affected `index.html`'s "Recently Updated" section.

### Contributing factors checked and ruled out

- **Not** timestamp/metadata nondeterminism (checked separately, see below).
- **Not** whitespace/serialization/attribute-order from a JSON- or DOM-based renderer — every affected script does plain string `.replace()` on raw HTML text.
- **Not** duplicate-marker behavior — no script was found inserting a *second* copy of a block; the defect is a single accumulating remnant, not duplication.
- **Not** generator-ordering between `generate-entity-pages.js`'s two calls — disproven directly (see above).
- **Is** partially entangled with `inject-trust-panels.js`/`phase-7e/inject-calculator-sources.js`: neither `trust-panel`, `formula-panel`, `dataset-panel`, nor `chemistry-sources` marker blocks were in `restructure-calculator-pages.js`'s extraction whitelist, so every build silently discarded them there and relied on those two later, marker-guarded scripts to notice the marker was gone and recreate the block from scratch on every single run. This wasteful discard/recreate cycle was fixed alongside the `pluck()` root cause (see below) even though, once isolated, it was **not itself** the source of the growing-blank-line symptom (verified: adding the whitelist entries alone did not stop the growth; the `pluck()` fix was the one that did).

## Exact architectural fix

Each of the five strip regexes was changed to also consume the whitespace its own paired insertion adds, so strip+reinsert on already-correct output is a true no-op:

- `inject-footer.js`: `FOOTER_RE` extended to `/\s*<footer\b.../i` (consumes leading whitespace); `FOOTER` itself changed to start with its own leading `\n` so the replacement fully owns its separation regardless of what preceded it. Also added a `SKIP_DIRS` entry for `templates/` (matching the equivalent, already-correct convention in `inject-nav.js`), so template *source* files are never walked/mutated by this script — only the pages generated from them are.
- `inject-ads.js`: `stripAds()`'s regex extended to `/\s*<div class="ad ad-.../g`.
- `restructure-calculator-pages.js`: `pluck()`/`pluckInline()` changed to compute a separate `removeFrom` boundary (walking backward over trailing spaces/tabs, then over blank lines) used only for what gets deleted from `rest` — the extracted `block` itself is unaffected, so no section's own content changes, only the leftover-whitespace bookkeeping. Also extended the extraction whitelist with `trustPanel`, `formulaPanel`, `datasetPanel` (bracket-matched via `pluck()` against `<aside class="...">`, including their marker comment in the match so the comment survives too, since `inject-trust-panels.js`'s own idempotency check depends on it) and `chemistrySources` (marker-to-marker via `pluckInline()`), eliminating the wasteful discard/recreate cycle described above.
- `generate-version-badges.js`: both `upsertBadgeAfterH1()`'s and `upsertFooterBadge()`'s strip regexes extended to `` new RegExp(`\\s*${markerStart}...`) ``.
- `generate-google-dashboard.js`: `injectFreshnessBlock()`'s strip regex extended to consume whitespace on *both* sides (`` `\\s*${markerStart}[\\s\\S]*?${markerEnd}\\s*` ``, replaced with a single `\n`), since in this script the accumulating remnant was the insertion's *trailing* separator, not a leading one.

No injector was disabled, no generator invocation was removed, and no unrelated architecture was rewritten. Every fix is a one- or two-line regex extension to an existing, already-idempotent-by-design strip/insert pair.

## Injector idempotency model

For every fixed injector, the established invariant now holds:

```
correct input → injector → correct output → same injector again → byte-identical output
```

Verified directly: extracting each fixed regex/function from its live source file and applying it twice in sequence to a fixture (including fixtures carrying the exact kind of pre-existing accumulated garbage found in production) produces byte-identical results on the second application. See `scripts/validate-phase-8a.js` and `scripts/test-phase-8a.js`.

## Files changed

- `scripts/inject-footer.js`
- `scripts/inject-ads.js`
- `scripts/restructure-calculator-pages.js`
- `scripts/generate-version-badges.js`
- `scripts/generate-google-dashboard.js`
- `scripts/validate-phase-8a.js` (new)
- `scripts/test-phase-8a.js` (new)
- `docs/PHASE-8A-TEMPLATE-INJECTOR-REMEDIATION.md` (this file, new)
- `reports/phase-8a-status.md` (new)

Plus the necessary, one-time regeneration of every page these five generators touch (see "Before/after file-change counts" below) -- proven mechanically caused by the corrected injectors, not a separate content edit, by direct byte-level diffing against the pre-fix committed baseline (every difference traced to exactly one of the five patches above, or to a downstream cascade of them -- e.g. `templates/entity-template.html`'s own long-accumulated corruption, now excluded from `inject-footer.js`'s walk entirely, meant every entity page regenerated from it picked up a clean footer for the first time).

## Build order

`scripts/run-all-generators.js` was inspected in full before any change. The Phase 7Z source/data consistency gate (`validate-source-data-consistency.js`, wired in immediately before the four `populate-data.js`-family generators) is unchanged in position and behavior. No generator was reordered, added to, or removed from the pipeline. The pre-existing, separately-documented `generate-hubs.js`/`generate-navigation.js` ordering issue was investigated only to the extent needed to determine it is **not** part of this defect (see "Deferred items" below) and was not touched.

## Test coverage

`scripts/test-phase-8a.js` (22 assertions): idempotency of all five fixed regexes/functions against fixtures reproducing the exact production failure mode; missing-block insertion; duplicate-block protection (marker-existence guards in `inject-trust-panels.js` and `phase-7e/inject-calculator-sources.js`); deterministic serialization via an isolated, two-run, byte-compared end-to-end test of `inject-footer.js`; representative entity-page and non-entity (`programmatic/shock/*`) page checks; Phase 7Z source/data consistency gate regression protection (existence, wiring, and a live pass); confirmation `populate-data.js` remains outside the automatic build; and confirmation no calculator JS, chemistry data, or URL/canonical/redirect files were touched, with `sitemap.xml`'s only permitted difference being `<lastmod>` dates.

`scripts/validate-phase-8a.js`: the same idempotency checks extracted and re-verified directly against the live source files (not a fixture reimplementation), plus an opt-in (`PHASE_8A_RUN_BUILD=1`) full two-build gate for CI or manual re-verification.

## First-build results

From the clean Phase 7Z baseline (`71b4221`), with all five fixes applied: `npm run build` exit 0, **520 tracked files** changed. This is the expected, one-time, mechanically-necessary regeneration: every page whose footer, ad placeholder, calculator-section assembly, version badge, or freshness block had accumulated the historical corruption this phase fixes gets normalized to its correct, minimal form on this first pass. Every one of these 520 files was checked family-by-family against the pre-fix baseline; every difference is either (a) whitespace-only normalization around exactly the five fixed injection points, (b) the expected, unrelated, pre-existing wall-clock timestamp fields (see below), or (c) the pre-existing, separately-documented hub/navigation convergence (see below) -- no chemistry value, calculator formula, Academy/glossary/reference prose, citation, URL, canonical tag, or schema semantic changed anywhere in this set.

## Second-build results

Immediately re-running `npm run build` against the first build's output: exit 0, **49 files** differed from the first build's output. Investigation (see "Before/after file-change counts") showed this set is dominated by hub/index pages (`calculators/index.html`, every `guides/*/index.html` and `programmatic/*/index.html`, `charts/index.html`, `comparisons/index.html`, `legal/index.html`, `maintenance/index.html`) plus the same timestamp-bearing files from build 1. This is **not a Phase 8A regression**: it is the pre-existing, already-documented `generate-hubs.js`/`generate-navigation.js` ordering defect (`generate-hubs.js` runs before `generate-navigation.js` writes the current build's navigation index, so hub pages render from the *previous* build's cross-link state on any single pass -- documented since Phase 7V, and explicitly named in this phase's own instructions as "not automatically part of this phase"). Proof this is the known, separate issue and not a new one introduced by this phase's fixes: running `npm run build` a **third** time converges these hub pages to full stability (see below), with zero further intervention -- exactly the established, standing "run the build twice" convergence behavior this project has relied on since Phase 7V, now happening for the first time from a from-scratch (rather than already-converged) starting state because this is the first time a truly clean, from-HEAD double-build was run against the fixed injectors.

## Third-build results (confirming true convergence)

Running `npm run build` a third time against the second build's output: exit 0, **28 files** differed -- and every one of them is a file whose explicit, documented purpose is to record a wall-clock generation timestamp (`data/navigation.json`'s `_generated` field, `data/indexing/*.json`, `data/platform/compatibility.json`, `qa-summary.{json,md}` and `qa/*.html`'s `buildDate`/`certificationTimestamp`, every `reports/*.html` QA-metric table's `timestamp` cell, `audit/google/crawl-review.md` and `audit/hub-topology.md`'s `Generated:` lines, and the corresponding `reports/phase-7{b,c,d}/*` snapshot files). No hub page, no entity page, no calculator page, no guide, no academy/glossary/reference page, and no programmatic page differed. This is the genuine, decisive determinism result Section 14 requires, once the pre-existing (and explicitly out-of-scope) hub/navigation convergence has settled.

## Before/after file-change counts

| Build | Files changed vs. previous state | Composition |
|---|---|---|
| 1 (vs. clean `71b4221`) | 520 | One-time normalization of historically-accumulated corruption across all five injection points, sitewide |
| 2 (vs. build 1) | 49 | Pre-existing, out-of-scope hub/navigation ordering convergence (21 hub/index pages) + 28 timestamp-bearing files |
| 3 (vs. build 2) | 28 | **Only** timestamp-bearing files -- confirmed true, full determinism |

## Regression results

Phase 7 validator suite: `validate-phase-7h`, `-7i`, `-7k`, `-7m`, `-7n`, `-7o`, `-7x` all PASS clean. `validate-phase-7y` and `validate-phase-7z` FAIL in the standard, well-established "stale self-referential baseline" pattern documented throughout this project (each checks its own scope against its own commit's `PRODUCTION-CHANGES.md`/file list, and has no knowledge of this later, authorized phase's changes) -- `validate-phase-7z`'s one flagged file, `sitemap.xml`, was independently verified to differ only in `<lastmod>` dates, never in `<loc>` URLs. `check-broken-links`: 0/526. `validate-url-indexation`: 0 violations. `validate-schema` / `validate-schema-content-consistency`: PASS. `validate-datasets` / `validate-entities`: PASS. `validate-trust` / `validate-trust-layer` / `validate-provenance` / `validate-provenance-resolution`: PASS. `validate-chemistry-knowledge`: PASS (only pre-existing, unrelated orphan-range warnings). `audit-accessibility`: score 100, unchanged. `validate-source-data-consistency` (the Phase 7Z gate): PASS, 0 errors -- all four families still fully consistent. Forensic differential against the Phase 7A baseline: P0/broken-links/duplicate-titles/orphan-pages/cannibalization all unchanged; small, explained shifts in auto-scored quality-heuristic counts (schema-valid +1, a handful of pages moving from IMPROVE to UNCHANGED in the priority scorer) consistent with cleaner markup very slightly improving a few pages' automated quality scores -- no P0/critical change, report restored to its committed state afterward.

## Deferred items

Per the Director's explicit instructions, the following remain deferred and were not touched, beyond the investigation needed to confirm they are independent of this phase's defect:

- Three orphaned legacy dosage JSON files (`chlorine-dosage.json`, `ph-adjustment.json`, `shock-dosage.json`).
- The `generate-hubs.js`/`generate-navigation.js` ordering defect itself (confirmed independent of and unrelated to the five fixes in this phase; still requires the established "build twice" workaround).
- Footer-whitespace nondeterminism as a category was the subject of this phase, but the specific, previously-documented `generate-entity-pages.js` double-render whitespace-baseline note from Phase 7Q is superseded by this phase's actual finding (the double `require()` is a no-op; the real mechanism was the five strip/insert asymmetries documented above).
- All chemistry review-queue items, calculator formula review items, new calculator development, localization, AdSense, new programmatic expansion, new SEO content, and new schema types -- none were touched.

## Final PASS/FAIL determination

**PASS.** The documented sitewide template/injector drift has a proven root cause (five instances of one shared anti-pattern, none of them the previously-assumed `generate-entity-pages.js` double-execution), the root mechanism is corrected at the injector/generator level in all five places, repeated generation is byte-stable (verified via isolated fixture idempotency tests and three consecutive full builds), and a clean build -- once the pre-existing, explicitly out-of-scope hub/navigation convergence has settled, exactly as it always has in this project -- produces zero unexpected repository churn beyond documented, intentional timestamp fields. All Phase 7Z integrity guarantees (source-of-truth architecture, the consistency gate, `populate-data.js`'s exclusion from the automatic build) remain fully intact.
