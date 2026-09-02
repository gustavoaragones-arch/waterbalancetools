# Phase 8B — Status Report

## Baseline

- Phase 7Z commit (immutable): `71b4221` ("Phase 7Z: source/data pipeline integrity & academy desync remediation")
- Phase 8A: completed and validated, present in the working tree as an authorized prerequisite layer per explicit Director instruction (not committed separately)
- HEAD at phase start: `71b4221`
- origin/main: `71b4221` (matches HEAD)
- Starting `git status --short`: the 525-file Phase 8A prerequisite changeset (not clean, by design -- see Director clarification)
- Node version: v24.13.0
- Build command: `npm run build` (= `node scripts/run-all-generators.js`)

## Defect

**Exact reproduction**: reset to the immutable Phase 7Z commit, reapplied only the Phase 8A *source* fixes (excluding all Phase 8A build output), then ran `npm run build` twice from that genuinely fresh state. Build 1: 524 files changed. Build 2 (no revert in between): 49 additional files differed from Build 1's output -- 21 hub/index pages plus the 28 already-documented, legitimate timestamp-bearing files. This is exactly, and only, the 21 previously-observed hub/index files; no other generator or family participates.

**Affected generators**: `scripts/generate-hubs.js` (reads stale data), `scripts/generate-navigation.js` (writes the data, but too late in the same build), `scripts/run-all-generators.js` (the ordering itself).

**Dependency graph**: `generate-hubs.js` reads `data/navigation.json` (only data source for hub-to-leaf cross-links). `generate-navigation.js` is the only script that writes `data/navigation.json`, built by walking every generated `.html` file. `data/navigation.json` is a committed, persistent file -- not deleted between builds. Original pipeline order: `generate-hubs.js` (line 122) before `generate-navigation.js` (line 125), so `generate-hubs.js` always read the *previous* build's navigation snapshot.

**Root cause**: proven via content-level evidence, not just structural inference -- the committed `data/navigation.json` at the Phase 7Z baseline still contained a pre-Phase-7W calculator title (`"Hot Tub Shock Calculator"` instead of the actual, current `"Hot Tub Shock Calculator (By Product)"`), and Build 1 (old pipeline) rendered `calculators/index.html` with that stale title. Investigated whether a simple reorder is sufficient: `generate-navigation.js` also indexes the hub pages *themselves* (for breadcrumbs/search/related-content), creating a genuine but acyclic, layered dependency -- a single reorder cannot serve both "hub generation needs current leaf data" and "the final index needs current hub data" at once. Full account in `docs/PHASE-8B-HUB-NAVIGATION-CONVERGENCE.md`.

## Remediation

**Exact files changed:**
- `scripts/run-all-generators.js` -- one new `execSync('node scripts/generate-navigation.js', ...)` call inserted immediately before the existing `generate-hubs.js` require, fully documented inline. No existing line removed, reordered, or altered.
- `scripts/validate-phase-8b.js` (new)
- `scripts/test-phase-8b.js` (new)
- `docs/PHASE-8B-HUB-NAVIGATION-CONVERGENCE.md` (new)
- `reports/phase-8b-status.md` (new, this file)

**Exact dependency correction**: `generate-navigation.js` (already self-documented as idempotent) now runs twice: once via `execSync` immediately before `generate-hubs.js` (supplying it current leaf-page data), and once via the pre-existing `require()` call after `generate-hubs.js` (producing the final, complete index including the just-regenerated hub pages). `execSync` was required for the new call specifically because `require()`-ing the same script path twice in one process is a silent no-op (Node's module cache) -- independently reproduced as part of this phase's own test suite, the same mechanism Phase 8A found had already made `generate-entity-pages.js`'s apparent double-execution inert.

**Why this eliminates the stale-data cycle**: `generate-hubs.js` now reads a `data/navigation.json` written moments earlier in the *same* build, from leaf pages that are already fully finalized by that point in the pipeline -- there is no longer any window in which it can read anything other than the current build's data.

## Validation

| Gate | Result |
|---|---|
| Phase 8B tests (`test-phase-8b.js`) | PASS -- 20/20 |
| Phase 8B validator (`validate-phase-8b.js`) | PASS (0 errors, 2 informational warnings) |
| First build | PASS -- exit 0 |
| Hub first-build freshness | PASS -- current calculator titles present immediately |
| Second build | PASS -- exit 0 |
| Hub second-build stability | PASS -- 0 hub/index content changes |
| Navigation semantic preservation | PASS -- same 21 hubs, same URLs/canonicals/child links |
| Broken links | PASS -- 0/526 |
| URL/indexation | PASS -- 0 violations |
| Schema | PASS |
| Dataset/entity | PASS |
| Trust/provenance | PASS |
| Chemistry | PASS (pre-existing, unrelated orphan-range warnings only) |
| Accessibility | PASS -- score 100, unchanged |
| Phase 8A regression | PASS -- 22/22 tests, validator clean |
| Phase 7Z regression | PASS -- `validate-source-data-consistency.js` 0 errors |

`validate-phase-7y`/`validate-phase-7z` fail only in the standard, previously-documented stale-self-referential-baseline pattern (each checks the tree against its own commit's declared change list, predating this phase); `validate-phase-7z`'s sole flag (`sitemap.xml`) independently re-verified to differ only in `<lastmod>` dates, never `<loc>`.

## Determinism

Hub/index changes after Build 1 (vs. clean baseline): the expected one-time normalization (part of the 524-file Phase 8A-driven regeneration; hub pages already correct on this build).

**Hub/index changes after Build 2 (vs. Build 1): 0**

**Unexpected hub/index changes after Build 2: 0**

A third build was additionally run for confidence: 0 further hub/index changes, sustained. Y = 0 and Z = 0 for hub/index content, exactly as required. (28 non-hub, already-documented timestamp files continue to differ every build, by design, unrelated to this phase's mandate.)

One pre-existing, non-hub anomaly was found and documented, not fixed: two entries *inside* `data/navigation.json` for non-hub audit/report pages (`audit/google/crawl-depth.html`, `reports/phase-7a/index.html`) fluctuate slightly between builds. Confirmed this does **not** propagate into any hub/index page's content across three consecutive builds, and is outside this phase's mandate (hub/navigation build-order convergence, not every field inside the navigation data file). Full detail in `docs/PHASE-8B-HUB-NAVIGATION-CONVERGENCE.md`.

## Final decision

**PASS.**

The exact `generate-hubs.js`/`generate-navigation.js` dependency defect is proven with content-level evidence (not assumed), the build pipeline is corrected at the dependency level with the smallest change that represents the proven, acyclic graph, a single clean `npm run build` now produces current hub/index navigation state, and a second (and third) identical build produces zero hub/index content changes. Navigation semantics -- URLs, canonicals, sitemap `<loc>` values, hub membership, labels, hierarchy -- are unchanged. All Phase 8A determinism guarantees and the Phase 7Z source/data consistency architecture remain independently re-verified and intact. The project no longer depends on the historical "run the build twice" workaround for hub/navigation convergence.

---

Per instruction: **do not commit or push.** Awaiting Director Assessment.
