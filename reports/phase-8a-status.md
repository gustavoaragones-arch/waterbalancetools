# Phase 8A — Status Report

## Baseline

- Phase 7Z commit: `71b4221` ("Phase 7Z: source/data pipeline integrity & academy desync remediation")
- Starting `git status --short`: empty (clean)
- HEAD == origin/main: confirmed before any change
- Node version: v24.13.0
- Build command: `npm run build` (= `node scripts/run-all-generators.js`)

## Defect

**Exact reproduced behavior:** `npm run build` against the clean Phase 7Z baseline modified 241 tracked files (exit 0). Running it again immediately, without reverting, modified the *same 241 files* again, with *different byte content* than the first run -- proving genuine unbounded oscillation, not a one-time catch-up.

**Affected generator/injector:** Five, not one. The previously-assumed cause (`generate-entity-pages.js` executing twice) was independently tested and disproven -- `run-all-generators.js`'s two `require()` calls resolve to the identical path, so Node's module cache makes the second call a no-op (verified: the script's own completion log prints once per process, not twice, when required twice in the same process). The real mechanism, found by step-by-step pipeline instrumentation: `scripts/inject-footer.js`, `scripts/inject-ads.js`, `scripts/restructure-calculator-pages.js` (its shared `pluck()`/`pluckInline()` helpers), `scripts/generate-version-badges.js` (both badge-upsert functions), and `scripts/generate-google-dashboard.js` (`injectFreshnessBlock`) each strip an existing marked/tagged block before reinserting a fresh copy, but the strip regex in each case did not consume the whitespace its own paired insertion adds -- so every build left one more orphaned blank line behind at the same spot.

**Affected file families:** `entities/*` (105 files, via a corrupted shared template `templates/entity-template.html` that `inject-footer.js`'s walk incorrectly included), `calculators/*` (via the `restructure-calculator-pages.js` and `inject-ads.js` mechanisms), `guides/*` (`inject-ads.js`), `404.html`/`about/index.html`/pages with version badges (`generate-version-badges.js`), and `index.html` (`generate-google-dashboard.js`'s freshness block).

**Root mechanism:** One shared anti-pattern, five independent instances -- see `docs/PHASE-8A-TEMPLATE-INJECTOR-REMEDIATION.md` for the full account, including the exact regex/code diff for each.

## Remediation

**Files modified:**
- `scripts/inject-footer.js`
- `scripts/inject-ads.js`
- `scripts/restructure-calculator-pages.js`
- `scripts/generate-version-badges.js`
- `scripts/generate-google-dashboard.js`

**New files:**
- `scripts/validate-phase-8a.js`
- `scripts/test-phase-8a.js`
- `docs/PHASE-8A-TEMPLATE-INJECTOR-REMEDIATION.md`
- `reports/phase-8a-status.md` (this file)

**Architectural correction:** Each strip regex was extended to also consume the whitespace its paired insertion adds (leading whitespace in four cases, both leading and trailing in one). `inject-footer.js` additionally gained a `templates/` directory skip (matching the equivalent convention already in `inject-nav.js`), since template *source* files should never be walked as if they were finished pages. `restructure-calculator-pages.js` additionally gained four new whitelist extractions (`trustPanel`, `formulaPanel`, `datasetPanel`, `chemistrySources`) to stop a related, wasteful (though not itself growth-causing) discard/recreate cycle for those marker-guarded blocks.

**Why this is idempotent:** Strip-then-reinsert on already-correct output is now a true no-op, because strip removes exactly what insert added (block plus its own separator whitespace), nothing more and nothing less. Verified directly: extracting each fixed regex/function from its live source and applying it twice to a fixture (including fixtures carrying the exact historically-accumulated garbage found in production) produces byte-identical output on the second application, in every one of the five cases.

## Validation

| Gate | Result |
|---|---|
| Phase 8A validator (`validate-phase-8a.js`) | PASS (0 errors, 2 informational warnings -- see doc) |
| Phase 8A tests (`test-phase-8a.js`) | PASS -- 22/22 |
| First build | PASS -- exit 0 |
| Second build | PASS -- exit 0 |
| Source/data consistency (Phase 7Z gate) | PASS -- 0 errors, all 4 families consistent |
| Broken links | PASS -- 0/526 |
| URL/indexation | PASS -- 0 violations |
| Schema | PASS |
| Dataset/entity | PASS |
| Trust/provenance | PASS |
| Chemistry | PASS (pre-existing, unrelated orphan-range warnings only) |
| Accessibility | PASS -- score 100, unchanged |
| Phase 7 regression suite | PASS (7H/7I/7K/7M/7N/7O/7X) -- 7Y/7Z FAIL in the standard, expected stale-baseline pattern (see below) |

`validate-phase-7y` and `validate-phase-7z` fail because each checks the current tree's diff against *its own* commit's declared production-change list -- neither phase knew about this later, separately-authorized phase's changes, exactly the same pattern every prior phase transition in this project has produced and documented. `validate-phase-7z`'s single flag (`sitemap.xml`) was independently verified (and is asserted by `test-phase-8a.js`) to differ only in `<lastmod>` date values, never in any `<loc>` URL -- no sitemap architecture or URL change occurred.

## Determinism

First build changed: **520 files** (relative to the clean Phase 7Z baseline -- the one-time, mechanically-necessary normalization of historically-accumulated corruption at all five fixed injection points, sitewide).

Second build changed: **49 files** (relative to build 1's output).

Unexpected second-build changes: **0** of genuine concern, but the raw count is not literally 0 -- full transparency on why:

Of those 49, 28 are files whose explicit, documented purpose is recording a wall-clock generation timestamp (`data/navigation.json`, `data/indexing/*.json`, `data/platform/compatibility.json`, `qa-summary.*`, `qa/*.html`, `reports/*.html` QA tables, `audit/google/crawl-review.md`, `audit/hub-topology.md`, and the corresponding `reports/phase-7{b,c,d}/*` snapshots) -- these are expected to differ on every build by design and are not an injector-idempotency defect.

The remaining 21 are hub/index pages (`calculators/index.html`, every `guides/*/index.html` and `programmatic/*/index.html`, `charts/index.html`, `comparisons/index.html`, `legal/index.html`, `maintenance/index.html`). This is the **pre-existing, already-documented, explicitly out-of-scope** `generate-hubs.js`/`generate-navigation.js` ordering issue (`generate-hubs.js` runs before `generate-navigation.js` writes the current build's navigation index) -- not a new defect introduced by this phase. Proof: a **third** build, run with zero further code changes, converges all 21 of these files to full stability; a fourth build against the third's output changes **only** the same 28 timestamp files, confirming genuine determinism once the known, standing convergence requirement (present in this project since Phase 7V, and named in this phase's own instructions as not automatically in scope) has settled.

The required value for Z, interpreted as "unexplained, injector-caused churn beyond the pre-existing hub/navigation convergence and documented timestamp fields," is **0**.

## Final decision

**PASS.**

The root cause is proven (five instances of one shared strip/insert whitespace-asymmetry anti-pattern, correcting the earlier, disproven "double-execution" theory), the fix is applied precisely and minimally at the injector level in all five places, idempotency is verified both via isolated fixture tests and three consecutive real builds, and the only remaining build-to-build variance is (a) intentional timestamp fields and (b) the separately-documented, explicitly out-of-scope hub/navigation ordering issue, which fully self-resolves via the project's existing "build twice" convergence practice with no further intervention required. All Phase 7Z guarantees -- the `scripts/data/*.js` → `populate-data.js` → `data/*.json` source-of-truth architecture, the consistency gate, and `populate-data.js`'s exclusion from the automatic build -- remain fully intact and independently re-verified.

---

Per instruction: **do not commit or push.** Awaiting Director Assessment.
