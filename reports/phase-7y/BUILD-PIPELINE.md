# Phase 7Y -- Build Pipeline Map

`npm run build` = `node scripts/run-all-generators.js` (from `package.json`; confirmed the only build script defined). Full file read; exact execution order below, condensed from its 232 lines and inline comments (which already document a "Mandatory build order" header).

## Execution order (condensed dependency graph)

```
0.  Preflight gate: validate-url-engine.js, test-url-engine.js, audit-url-engine-usage.js
1.  Programmatic clusters (self-contained, no shared data/*.js dependency):
    generate-chlorine-pages.js -> build-chlorine-links.js
    generate-shock-pages.js    -> build-shock-links.js
    generate-ph-pages.js       -> build-ph-links.js
    generate-hot-tub-pages.js  -> build-hot-tub-links.js
    generate-problem-pages.js
    generate-explanation-pages.js
    generate-behavior-pages.js
2.  generate-authority-guides.js, generate-authority-charts.js  (inline-sourced, run before the link matrix "so new pages enter the pool")
3.  generate-entity-pages.js (1st call) -> inject-entity-schema.js -> generate-question-pages.js -> generate-comparison-pages.js -> generate-pool-system-hub.js
4.  generate-hub-pages.js -> inject-authority-layer.js -> inject-ads.js -> build-link-matrix.js -> inject-calculator-related-tools.js -> inject-secondary-canonical-context.js -> enforce-terminology.js -> inject-authority-chart-loop.js -> inject-chart-answer-snippet.js -> inject-winner-amplification.js -> inject-query-expansion.js -> generate-all-pages.js -> inject-seo-metadata.js -> inject-last-updated.js
5.  generate-redirects.js
6.  generate-resource-pages.js
7.  generate-academy.js, generate-formulas.js, generate-glossary.js, generate-reference.js  (all read the CURRENT data/*.json -- do NOT regenerate it from scripts/data/*.js; see POPULATE-DATA-AUDIT.md)
8.  generate-datasets.js (compiles 15 canonical dataset JSON files from dataset-*.js)
9.  generate-data-docs.js (/reference/datasets/ pages, depends on step 8)
10. generate-entities.js (compiles entity JSON from entities-*.js, resolves idealRange from step-8 datasets)
11. generate-entity-pages.js (2nd call -- same script as step 3, run again to pick up step 10's freshly compiled entity JSON)
12. generate-entity-links.js (injects entity panels into glossary/formula/academy/reference pages)
13. inject-nav.js (6-pillar canonical header)
14. restructure-calculator-pages.js
15. inject-footer.js
16. generate-hubs.js  <-- reads data/navigation.json
17. generate-navigation.js  <-- WRITES data/navigation.json
18. generate-breadcrumbs.js
19. Gate: validate-hubs.js
20. generate-indexing.js, generate-link-weights.js, generate-freshness.js, generate-priority.js, audit-authority.js, audit-crawl-depth.js, audit-indexing.js, generate-google-dashboard.js, validate-indexing.js
21. generate-trust.js -> inject-trust-panels.js -> normalize-seo-metadata.js
22. phase-7e/inject-calculator-sources.js  (must run after restructure-calculator-pages.js, step 14, per its own inline comment -- restructure rebuilds each calculator's <main> from a fixed section whitelist and discards anything else, same reason inject-trust-panels.js re-injects every run rather than being written once)
23. Gate: validate-generated-output.js
24. Gates: validate-datasets.js, validate-entities.js, validate-trust.js
25. generate-qa-report.js
26. Gate: check-broken-links.js
27. generate-search-index.js
28. generate-sitemaps.js
29. Gate: validate-url-indexation.js
30. Gate: validate-chemistry-knowledge.js
31. generate-compatibility.js, generate-release.js, generate-version-badges.js, validate-versioning.js
32. generate-tools-index.js (legacy, kept for backward compat)
```

`scripts/populate-data.js` appears **nowhere** in this sequence.

## Direct answers to the required questions

**What runs first?** The URL-engine preflight gate (steps that validate/test the URL normalization engine itself), then the 7 self-contained programmatic-cluster generators.

**What generates JSON?** `generate-datasets.js` (15 canonical dataset files), `generate-entities.js` (entity graph), `generate-trust.js` (trust/provenance JSON), `generate-navigation.js` (navigation index), `generate-search-index.js` (search index), `generate-sitemaps.js` (sitemap XML, not JSON but structurally equivalent), `generate-indexing.js`/`generate-freshness.js`/`generate-priority.js`/`generate-link-weights.js` (indexing-intelligence JSON). Notably, `generate-academy.js`/`generate-formulas.js`/`generate-glossary.js`/`generate-reference.js` (step 7) do **not** generate JSON -- they only read the already-existing `data/*.json` and render HTML from it.

**What generates HTML?** Every `generate-*-pages.js` script, `generate-academy.js`/`generate-formulas.js`/`generate-glossary.js`/`generate-reference.js`, `generate-entity-pages.js`, `generate-hub-pages.js`/`generate-hubs.js`, `generate-authority-guides.js`/`generate-authority-charts.js`, `generate-resource-pages.js`, `generate-all-pages.js`.

**What injects templates?** `inject-nav.js`, `inject-footer.js`, `inject-authority-layer.js`, `inject-ads.js`, `inject-trust-panels.js`, `inject-entity-schema.js`, `inject-calculator-related-tools.js`, `inject-secondary-canonical-context.js`, `inject-authority-chart-loop.js`, `inject-chart-answer-snippet.js`, `inject-winner-amplification.js`, `inject-query-expansion.js`, `inject-seo-metadata.js`, `inject-last-updated.js`, `phase-7e/inject-calculator-sources.js`.

**What regenerates indexes?** `generate-navigation.js` (`data/navigation.json`), `generate-search-index.js` (`data/search-index.json`), `generate-indexing.js`/`generate-freshness.js`/`generate-priority.js` (`data/indexing/*.json`), `generate-sitemaps.js` (sitemap XML).

**What can overwrite previous outputs?** Every `generate-*` script overwrites its own output files unconditionally (all use `fs.writeFileSync`, none check for or preserve pre-existing manual edits). `generate-entity-pages.js` runs **twice** (steps 3 and 11) and fully re-renders every entity page both times, discarding whatever the first pass (and any injectors that ran on it in between) produced, then requiring every downstream injector that touches entity pages to run again after step 11 -- this is the confirmed mechanism behind the sitewide template/injector drift (see below).

**What can create stale intermediate state?** `data/navigation.json`: `generate-hubs.js` (step 16) reads it **before** `generate-navigation.js` (step 17) writes the current build's version -- a documented ordering bug (since Phase 7V) that leaves hub pages built from the *previous* build's navigation data on a single pass. A second full build pass is required to converge, which is why the established methodology across Phases 7T-7X always runs `npm run build` twice.

**What can delete records/pages?** Nothing in `run-all-generators.js` itself deletes pages. The only deletion risk identified this phase is `populate-data.js`, which is **not** part of this pipeline (see above) -- it is a separate, manually-invoked script.

**Which operations are idempotent?** The 7 programmatic-cluster generators, `generate-entities.js`, `generate-datasets.js`, `generate-trust.js`, `generate-authority-guides.js`/`generate-authority-charts.js` -- each reads only its own fixed, version-controlled inputs and produces the same output every time (verified deterministic for the academy/glossary/reference JSON family in `REPRODUCIBILITY.md`; not independently re-verified for every one of the ~80 scripts in this pipeline this phase, which would exceed this phase's scope).

**Which operations are order-dependent?** `generate-hubs.js` before `generate-navigation.js` (documented bug, requires 2 passes). `generate-entity-pages.js` (1st call, step 3) before `generate-entities.js` (step 10) before `generate-entity-pages.js` (2nd call, step 11) -- this second call is *intentional* per the pipeline's own comments (to pick up freshly-compiled entity data), but its side effect of discarding the first pass's injected content is what makes every downstream injector (`inject-nav.js`, `inject-footer.js`, etc., steps 13-15) necessary to re-run afterward, which they do -- **in a single correctly-ordered build pass, this is not a bug**; the actual drift arises from generator-specific template regressions layered on top of this (Phase 7Q's own root-cause note: "generate-entity-pages.js runs twice... the second full-template re-render's whitespace baseline differs from what the injectors between the two calls left in place" -- an inherited, documented, not-yet-fixed nondeterminism, distinct from the hub/navigation ordering bug).

**Which operations operate on already-generated files?** `restructure-calculator-pages.js` (step 14) and `phase-7e/inject-calculator-sources.js` (step 22) both operate on calculator HTML already produced by step 1's programmatic-cluster generators; `phase-7e/inject-calculator-sources.js` must run after `restructure-calculator-pages.js` specifically because the latter rebuilds `<main>` from a fixed section whitelist and silently discards anything else -- confirmed via the script's own inline comment.

**Where does the known ~170-225(-263, this phase) file template/injector drift arise?** Primarily from `generate-entity-pages.js` running twice (steps 3 and 11) combined with `inject-seo-metadata.js` (step 4, before the second entity-pages call) and `inject-nav.js`/`inject-footer.js` (steps 13/15, after it) not being perfectly idempotent across that gap -- this phase's clean-build experiment (see `GLOBAL-DRIFT-AUDIT.csv`) showed 105 of 241 touched files were `entities/*.html`, consistent with this mechanism. `restructure-calculator-pages.js` similarly explains the 15 `calculators/*.html` files touched.

**Is that drift related to the academy desync or independent?** **Independent (Classification C).** Confirmed by direct experiment this phase: a single clean `npm run build`, with `populate-data.js` never invoked, touched 241 files spanning `entities/` (105), `calculators/` (15), `reports/` (13), `reference/` (11), various `guides/` subdirectories (15 combined), `audit/google/` (6), `maintenance/` (4), `charts/` (4), and others -- none of which is the academy family specifically, and the mechanism (repeated template re-rendering losing injector output) has nothing to do with a source-file/JSON-output ambiguity. The repository was restored to its exact committed state (`git checkout HEAD -- .`) immediately after this experiment; `git status --porcelain` and `git rev-parse HEAD` both confirmed a clean return to `e959f8d`.
