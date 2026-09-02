# Phase 8B — Hub/Navigation Build Convergence Remediation

## Phase objective

Eliminate the known `generate-hubs.js`/`generate-navigation.js` build-order convergence defect while preserving every validated behavior established through Phase 8A.

## Phase 8A baseline

Phase 7Z immutable commit: `71b4221`. Phase 8A's completed, validated changes (five injector whitespace-idempotency fixes plus their validator/test/doc/report artifacts) were present in the working tree as an authorized prerequisite layer, per explicit Director instruction, rather than as a separate commit. This document and its accompanying validator/tests distinguish that prerequisite layer from Phase 8B's own new changes throughout.

## Original convergence behavior (as documented entering this phase)

```
Build 1 → hub pages reflect previous navigation state
Build 2 → hub pages converge
```

## Reproduction procedure

To reproduce cleanly, the repository was reset to the immutable Phase 7Z commit, then only the Phase 8A prerequisite files were reapplied (the five fixed injector scripts plus their own validator/test/doc/report) -- deliberately excluding all of Phase 8A's *build output* (the regenerated HTML), so the hub/navigation defect could be observed from a genuinely fresh starting point rather than from an already-converged tree.

1. `npm run build` (Build 1): exit 0, 524 files changed.
2. Snapshotted Build 1's output, ran `npm run build` again (Build 2) without reverting.
3. Diffed every file Build 1 touched against Build 2's output: **49 files differed** -- 21 hub/index pages (`calculators/index.html`, all 8 `guides/*/index.html`, all 8 `programmatic/*/index.html`, `charts/index.html`, `comparisons/index.html`, `legal/index.html`, `maintenance/index.html`) plus the 28 already-documented, legitimate timestamp-bearing files (Phase 8A's report).
4. This is **all 21** of the previously observed hub/index changes -- no additional hub/index family was found beyond the ones already named in the Director's instructions.
5. No other generator was found to participate: the 21 hub/index files are exactly, and only, the files `generate-hubs.js` itself writes (confirmed by reading its `HUBS[]` array, which enumerates exactly these 21 hub paths).
6. Timestamps were independently confirmed responsible for 0 of the 21 hub/index differences (see "Root cause" below for the exact content-level proof) and for all 28 of the remaining files (each carries an explicit `_generated`/`buildDate`/`timestamp`/`Generated:` field, unchanged in every other respect).

## Exact dependency graph

Traced by reading `scripts/run-all-generators.js`, `scripts/generate-hubs.js`, and `scripts/generate-navigation.js` in full, and grepping the repository for every reference to `data/navigation.json`, `generate-navigation.js`, `generate-hubs.js`, `navigation`, `hub`, and `index.html`.

- **`generate-hubs.js`** (line 40): `const nav = readJson(NAV_PATH, { pages: [] })`, where `NAV_PATH = path.join(ROOT, 'data', 'navigation.json')`. This is the *only* data source it reads for hub-to-leaf cross-links (calculator/guide/entity titles, descriptions, URLs) via `titleForUrl()`, `linksByPrefix()`, and `childCategories()`.
- **`generate-navigation.js`** (line 145): `fs.writeFileSync(path.join(ROOT, 'data', 'navigation.json'), ...)`. It builds this by `walk(ROOT)` over every generated `.html` file, extracting `<title>`/`<meta description>`/`<h1>` from each (`extractMeta()`).
- **`data/navigation.json` is a committed, persistent file** -- it is not deleted before a build, so on any given build it starts as whatever the *previous* build (or the last commit) left it as.
- **Pipeline order** (`run-all-generators.js`, original): `generate-hubs.js` (line 122) runs, then `generate-navigation.js` (line 125) runs. So on every single build, `generate-hubs.js` reads `data/navigation.json` **before** anything in that same build has refreshed it -- meaning it always reads a snapshot that is, at best, one full build behind.
- **No other generator writes `data/navigation.json`** (grepped: only `generate-navigation.js` contains a `writeFileSync` to that path). `generate-breadcrumbs.js` (which runs after `generate-navigation.js`) and the later indexing scripts *read* it but do not write it.
- **`generate-hubs.js` was already aware of a piece of this problem**: its own source contains an explicit comment (lines 45-50) noting "this generator runs before generate-navigation.js in the pipeline" and applying a narrow, defensive filter (`RETIRED_URL_PATHS`) to stop retired/redirected URLs from leaking into hub listings even when `navigation.json` is stale -- but this mitigated only one symptom (dead links), not the general staleness of every other field (titles, descriptions).

## Root cause

`generate-hubs.js` needs **current-build** page metadata (title, description, URL) for every non-hub, "leaf" page it cross-links (calculators, guide leaves, entities, academy articles, etc.) -- all of which are fully generated and stable well before `generate-hubs.js` runs in the pipeline. That data is produced by `generate-navigation.js`, but only *after* `generate-hubs.js` already ran, in the same build. `generate-hubs.js` therefore reads the copy of `data/navigation.json` left on disk from the *previous* build -- correct once caught up, but always one cycle behind any real change (a renamed calculator title, a new/removed page, etc.).

**Content-level proof, not just structural**: `data/navigation.json` as committed at the Phase 7Z baseline (`71b4221`) itself already contained stale titles predating this phase -- e.g. `calculators/hot-tub-shock-calculator.html`'s actual `<title>` is `"Hot Tub Shock Calculator (By Product)"` (a Phase 7W rename), but the committed `data/navigation.json` still had the pre-rename `"Hot Tub Shock Calculator"`. Reproduced Build 1 (old pipeline) rendered `calculators/index.html` with the stale, un-renamed title; Build 2 (old pipeline) picked up the correct one, because by then `generate-navigation.js` had finally caught `data/navigation.json` up.

**Is reordering `generate-navigation.js` before `generate-hubs.js` sufficient, or is there a hidden circular dependency?** Investigated directly: `generate-navigation.js` walks *every* generated `.html` file, including the 21 hub pages themselves -- so if it ran *only* before `generate-hubs.js`, the persisted `data/navigation.json` would permanently index the hub pages using their *previous* build's content (since they haven't been regenerated yet in that run), breaking downstream consumers of `data/navigation.json` that need current hub-page metadata (`generate-breadcrumbs.js`, search-index, related-content). This is a genuine, but **acyclic**, layered dependency, not a true cycle: hub pages depend on leaf pages' current metadata (their own `HUBS[]` array already supplies each hub's *own* canonical title/description directly, with no lookup needed), and `data/navigation.json`'s complete, persisted form depends on the hub pages' current content. A single reordering therefore cannot serve both needs at once -- `generate-navigation.js` must run **twice**: once before `generate-hubs.js` (to supply it current leaf-page data) and once after (to produce the complete, final index including the just-regenerated hub pages, exactly as it already did before this phase).

**Why the previous ordering was insufficient**: it ran `generate-navigation.js` exactly once, positioned to serve only the *second* need (a complete final index) and never the *first* (current data for hub generation itself).

## Architectural fix

The smallest change that correctly represents the proven, acyclic, two-consumer dependency: `generate-navigation.js` (already documented as idempotent -- "overwrites navigation.json on every run") is invoked **twice** in `run-all-generators.js`:

```
source inputs (all leaf pages, fully generated by this point in the pipeline)
     ↓
generate-navigation.js  (NEW: pre-hub refresh)
     ↓
data/navigation.json (current)
     ↓
generate-hubs.js  (unchanged)
     ↓
hub/index pages (current)
     ↓
generate-navigation.js  (EXISTING: final, authoritative write -- unchanged position)
     ↓
data/navigation.json (final, includes current hub pages too)
```

No new shared abstraction was introduced -- the existing, already-safe-to-rerun script is simply called at the point in the pipeline where its output is actually needed, in addition to the point where its output needs to be finalized.

**Critical implementation detail, itself informed by a Phase 8A finding**: the *new* early call uses `execSync('node scripts/generate-navigation.js', ...)`, a genuinely separate process, **not** a second `require()` of the same script path. Verified directly (reproduced empirically as part of this phase's own test suite): `require()`-ing the same script twice in one Node process executes it only once, because Node caches loaded modules -- this is the exact same mechanism Phase 8A found had silently made `generate-entity-pages.js`'s apparent "second execution" a no-op. Using `execSync` for the new, additional call sidesteps this entirely and guarantees genuine re-execution; the pre-existing `require()` call (now the second, final invocation) is left exactly as it was.

## Files changed

- `scripts/run-all-generators.js` -- one 10-line addition (a comment-documented `execSync` call to `generate-navigation.js`, positioned immediately before the existing `generate-hubs.js` require). No line was deleted, reordered, or removed; the pre-existing `generate-hubs.js` and `generate-navigation.js` calls are untouched in position and content.
- `scripts/validate-phase-8b.js` (new)
- `scripts/test-phase-8b.js` (new)
- `docs/PHASE-8B-HUB-NAVIGATION-CONVERGENCE.md` (this file, new)
- `reports/phase-8b-status.md` (new)

## Why navigation semantics are preserved

No hub's title, description, badge, membership, URL, canonical tag, or child-link set was redefined -- `HUBS[]`, `linksByPrefix()`, `buildCards()`, `buildList()`, and every other piece of `generate-hubs.js`'s own rendering logic is byte-identical to before this phase. The fix changes only *when* the data those functions read is current, not *what* they do with it. Verified: `validate-hubs.js` reports the same 21 hubs, `check-broken-links.js` reports 0/526, `validate-url-indexation.js` reports 0 violations against the same 478 sitemap URLs, and `sitemap.xml`'s only diff anywhere in this phase is `<lastmod>` date values -- never a `<loc>`. The content Build 1 now produces is the same content the *old* pipeline's Build 2 (its converged state) used to produce -- confirmed directly: the exact calculator titles (`"Hot Tub Shock Calculator (By Product)"`, `"Pool Shock Calculator (Product-Specific Dose)"`) that only appeared after a second build under the old pipeline now appear immediately on the first build under the fixed one.

## First-build results

From the Phase 7Z baseline plus the Phase 8A prerequisite layer, with the Phase 8B fix applied: `npm run build` (Build 1) exit 0, 524 files changed (the expected, Phase-8A-driven one-time normalization -- see `docs/PHASE-8A-TEMPLATE-INJECTOR-REMEDIATION.md`). Directly inspected: `calculators/index.html` already contains `"Hot Tub Shock Calculator (By Product)"` and `"Pool Shock Calculator (Product-Specific Dose)"` -- the current, correct titles -- on this very first build. No second build was required to see correct hub content.

## Second-build results

Running `npm run build` again immediately: exit 0, **28 files differed**, and every one is a file whose explicit, documented purpose is recording a wall-clock generation timestamp (the same 28-file list Phase 8A's report already establishes as legitimate: `data/navigation.json`'s own `_generated` field, `data/indexing/*.json`, `data/platform/compatibility.json`, `qa-summary.*`, `qa/*.html`, `reports/*.html` QA-metric tables, `audit/google/crawl-review.md`, `audit/hub-topology.md`, and the corresponding `reports/phase-7{b,c,d}/*` snapshots). **Zero hub/index pages differed.** A third build, run for additional confidence, showed the identical 28-file, all-timestamp pattern relative to the second build's output -- fully converged, sustained across multiple consecutive builds.

**One further, pre-existing, non-hub anomaly found and investigated**: `data/navigation.json`'s own internal entries for two *non-hub* audit/report pages (`audit/google/crawl-depth.html`'s click-depth statistics, and `reports/phase-7a/index.html`'s extracted `<meta description>`) were observed to fluctuate slightly between builds, even though neither underlying source file changes during `npm run build` (`reports/phase-7a/index.html` is regenerated only by `scripts/audit-forensic/run.js`, a separate, non-pipeline script; `audit/google/crawl-depth.html`'s click-depth metric is a link-graph computation whose own stability was not part of this phase's mandate to investigate). Neither anomaly is a hub/index page, neither is among the 21 files this phase's mandate names, and neither was found to propagate into any hub/index page's rendered content (confirmed: 0 hub/index differences across three consecutive builds). Documented here rather than silently ignored, per the explicit instruction not to declare arbitrary differences acceptable without investigation -- but resolving it is outside this phase's scope (Section 20's prohibition list: this phase fixes hub/navigation build-order convergence, not every field inside `data/navigation.json`).

## Hub/index hash comparison

For all 21 representative hub/index files, Build 1's content was compared against the *old* (unfixed) pipeline's converged (Build 2) output: identical in every case that was directly inspected (titles, URLs, child-link sets). Build 1 → Build 2 → Build 3 under the *fixed* pipeline: byte-identical for all 21 hub/index files across all three builds (confirmed via full-file diff, not just hash, for every file in the representative set named in the Director's instructions). No timestamp fields exist inside any hub/index HTML file itself (confirmed: none of the 21 appear in the 28-file timestamp list).

## Regression results

Phase 7 validator suite: `validate-phase-7h`, `-7i`, `-7k`, `-7m`, `-7n`, `-7o`, `-7x` all PASS clean. `validate-phase-7y` and `validate-phase-7z` FAIL in the same standard, previously-documented "stale self-referential baseline" pattern (each checks the tree against its own commit's declared production-change list, predating this phase). `validate-phase-7z`'s sole flag, `sitemap.xml`, independently re-verified to differ only in `<lastmod>` dates. Phase 8A's own validator/tests: PASS / 22-22. `check-broken-links`: 0/526. `validate-url-indexation`: 0 violations. `validate-hubs`: PASS, 21 hubs. `validate-schema`/`validate-schema-content-consistency`: PASS. `validate-datasets`/`validate-entities`: PASS. `validate-trust`/`validate-trust-layer`/`validate-provenance`/`validate-provenance-resolution`: PASS. `validate-chemistry-knowledge`: PASS (pre-existing, unrelated orphan-range warnings only). `audit-accessibility`: score 100, unchanged. `validate-source-data-consistency` (Phase 7Z gate): PASS, 0 errors. Forensic differential against the Phase 7A baseline: unchanged from Phase 8A's own forensic result (same P0/schema/action-count figures) -- no new drift introduced by this phase specifically.

## Deferred items

- The two non-hub `data/navigation.json` entry anomalies noted above (`audit/google/crawl-depth.html`, `reports/phase-7a/index.html`) -- documented, not fixed; outside this phase's hub/navigation mandate.
- All chemistry, calculator, localization, AdSense, new SEO content, new schema types, and navigation redesign -- none were touched, per explicit instruction.

## Final PASS/FAIL determination

**PASS.** The dependency defect is proven precisely (not assumed): `generate-hubs.js` reads `data/navigation.json` before that build's `generate-navigation.js` call has refreshed it. The fix is applied at exactly that dependency point -- an additional, `execSync`-driven, early run of the same already-idempotent script -- with no navigation semantics, hub membership, URL, canonical, or sitemap change. A single clean `npm run build` now produces current hub/index navigation state (verified directly against known-current calculator titles), and a second identical build produces zero hub/index content changes, sustained through a third build. The project no longer depends on the historical "run the build twice" workaround for hub/navigation convergence. All Phase 8A and Phase 7Z integrity guarantees remain independently re-verified and intact.
