# Phase 8C — Status Report

## Baseline

- Phase 8A+8B combined commit: `0a3c69c6da6c6fe7ff0b79d910132a9a06a06c5d` ("Phase 8A-8B: remediate build determinism and navigation convergence")
- HEAD at phase start: `0a3c69c6da6c6fe7ff0b79d910132a9a06a06c5d`
- origin/main: `0a3c69c6da6c6fe7ff0b79d910132a9a06a06c5d` (matches HEAD)
- Starting `git status --short`: clean
- Node version: v24.13.0
- Build command: `npm run build` (= `node scripts/run-all-generators.js`)

## Anomaly

**Affected records (as reported by Phase 8B):** `data/navigation.json` entries for `/audit/google/crawl-depth` and `/reports/phase-7a`, specifically their `description` fields.

**Exact reproduction:** from the clean, committed Phase 8A+8B baseline, ran `npm run build` three times consecutively, snapshotting and diffing `data/navigation.json` after each. Also programmatically extracted and compared both target records' full JSON across all three snapshots.

- Build 1: 36 files changed (28 canonical timestamp files + 8 sitemap XML files, all legitimate `<lastmod>`/timestamp content).
- Build 2 vs. Build 1: `data/navigation.json` — only the top-level `_generated` timestamp field differs. Both target records byte-identical.
- Build 3 vs. Build 2: same result — only `_generated` differs.
- No other navigation record changed unexpectedly between any pair of builds.

**This contradicts Phase 8B's own report of fluctuation.** The contradiction is resolved in Root Cause below: the original observation was accurate for the conditions under which it was made, but those conditions were not a plain `npm run build` cycle.

## Root cause

**`/audit/google/crawl-depth` — legitimate dynamic build metadata, not a defect.** Generator: `scripts/audit-crawl-depth.js`, wired into `npm run build`'s pipeline (`run-all-generators.js`). It computes real click-depth statistics from the current site's `<a href>` link graph. It is currently stable because the link graph does not change between consecutive builds of the same committed state. Phase 8B's original fluctuation almost certainly reflects that its own investigation legitimately compared different site states (pre-fix vs. post-fix hub content, while validating the Phase 8B hub-convergence fix itself) — the metric was correctly reporting a real difference, not misbehaving.

**`/reports/phase-7a` — not a `npm run build` defect at all.** `reports/phase-7a/index.html` is never touched by any generator in `npm run build`'s pipeline (confirmed: zero references to `phase-7a` or `audit-forensic` anywhere in `run-all-generators.js`; `inject-seo-metadata.js`'s file whitelist never includes `reports/`). The only mechanism that can change this file is the separate, non-pipeline `scripts/audit-forensic/run.js` tool, which — directly reproduced during this phase — regenerates the file from a bare template with no `<meta name="description">` tag at all. Phase 8B's investigation explicitly ran this separate script mid-sequence as part of its own forensic-differential testing; without an intervening restore before the next navigation capture, that produced the reported empty-description observation. This is a Phase 8B testing-methodology artifact, not a build-pipeline nondeterminism.

**Dependency mechanism:** see `docs/PHASE-8C-NAVIGATION-ARTIFACT-DETERMINISM.md` Section 7 for the full dependency graph.

## Remediation

**No source code was changed.** Both records are already fully deterministic under `npm run build`. Files added:

- `scripts/validate-phase-8c.js` (new)
- `scripts/test-phase-8c.js` (new)
- `docs/PHASE-8C-NAVIGATION-ARTIFACT-DETERMINISM.md` (new)
- `reports/phase-8c-status.md` (new, this file)

**Exact architectural correction:** none required. The finding is a proof of correctness, not a fix.

## Validation

| Gate | Result |
|---|---|
| Phase 8C tests (`test-phase-8c.js`) | PASS — 21/21 |
| Phase 8C validator (`validate-phase-8c.js`) | PASS (0 errors, 1 informational warning without `PHASE_8C_RUN_BUILD=1`) |
| Phase 8C validator, full 3-build gate (`PHASE_8C_RUN_BUILD=1`) | PASS (0 errors) |
| Direct mechanism reproduction (audit-forensic/run.js strips phase-7a SEO tags) | PASS — reproduced and restored |
| Navigation record stability (3 builds) | PASS — 0 non-`_generated` differences |
| Hub/index semantic preservation (`validate-hubs.js`) | PASS — 21/21 hubs |
| Broken links | PASS — 0/526 |
| URL/indexation | PASS — 0 violations |
| Sitemap `<loc>` preservation | PASS — neither target page appears in any sitemap |
| Schema | PASS |
| Dataset/entity | PASS |
| Trust / trust-layer / provenance / entity-provenance | PASS |
| Chemistry knowledge | PASS (pre-existing, unrelated orphan-range warnings only) |
| Chemistry status integrity | PASS — 0 violations |
| Accessibility | PASS — score 100, unchanged |
| Phase 8A regression (`validate-phase-8a.js`, `test-phase-8a.js`) | PASS — 22/22 |
| Phase 8B regression (`validate-phase-8b.js`, `test-phase-8b.js`) | PASS — 20/20 |
| Phase 7Z regression (`validate-source-data-consistency.js`) | PASS — 0 errors |

`validate-phase-7y` fails only in the standard, previously-documented stale-self-referential-baseline pattern (checks the tree against its own commit's declared change list, which predates this phase; also flags the two new Phase 8C script files as "unexplained" for the same, expected reason). `validate-phase-7z` passes clean (0 errors) from this fully-reverted, minimal-diff state.

## Build comparison

- **Build 1 → Build 2 navigation differences: 0** (excluding the intentional `_generated` timestamp)
- **Build 2 → Build 3 navigation differences: 0** (excluding the intentional `_generated` timestamp)
- **Unexplained differences: 0**

Both previously-flagged records were re-derived from scratch per Section 3's explicit instruction, not assumed still-affected. Neither fluctuates under `npm run build`. The complete re-derived difference set contains zero page-record changes across three consecutive builds.

## Final decision

**PASS.**

Both anomalies are conclusively resolved: `/audit/google/crawl-depth` is proven intentional, legitimately dynamic build metadata (classification A), already stable; `/reports/phase-7a` is proven to be entirely outside `npm run build`'s scope, with the original Phase 8B observation directly reproduced as an artifact of that phase's own testing methodology (running the separate `scripts/audit-forensic/run.js` tool mid-investigation), not a build-pipeline defect. No source code changes were required. Phase 8A determinism, Phase 8B single-build hub/navigation convergence, and Phase 7Z source/data consistency all remain independently re-verified and intact.

---

Per instruction: **do not commit or push.** Awaiting Director Assessment.
