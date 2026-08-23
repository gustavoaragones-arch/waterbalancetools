# Phase 7A -- WaterBalanceTools Forensic Content & Quality Audit

**Investigation only. No production content, schema, redirects, canonicals, sitemap generation, robots.txt, or AdSense configuration was modified by this audit.**

## 1. Executive Summary

This audit crawled and parsed the *actual generated HTML* of the WaterBalanceTools repository as it exists on disk at commit `b5fa47ccdd8e112abef5a788d88a26d6018ea4a6` -- not the source templates, and not prior phase reports. It found **524 HTML files**, of which **524** are indexable-candidate pages (the remainder are template sources and partial includes, which were excluded from the walk itself).

This is materially larger than the ~114-page estimate in the audit brief; the actual inventory includes large programmatic families (glossary: 101, entities: 105) and 22 previously-undiscovered internal QA/audit dashboard pages under `reports/`, `audit/`, and `qa/` that are live on the production filesystem and reachable by crawlers.

Three findings anchor this report:

1. **Template-token leakage in production schema/content.** 0 pages render an unreplaced `{{...}}` placeholder (most commonly `{{H1_TITLE}}` inside `DefinedTerm` JSON-LD on glossary pages) directly into shipped HTML and structured data. This is a mechanical generator defect, not a content-quality judgment call.
2. **Zero external sources sitewide.** Across 415 major factual pages, **415** cite zero external authoritative sources (0 `<a href>` tags anywhere in the crawled HTML point off waterbalancetools.com). The `.knowledge-sources` block present on 256 pages contains only a "Last reviewed: DATE" stamp, not a citation.
3. **Programmatic near-duplication is concentrated, not diffuse.** `programmatic/hot-tubs`, `programmatic/shock`, `programmatic/chlorine`, and `programmatic/ph` score HIGH-to-CRITICAL on cross-page Jaccard similarity (avg 0.71-0.80). By contrast, the two largest families -- `glossary` (101 pages) and `entities` (105 pages) -- score LOW on body-text similarity (avg 0.18-0.22), i.e. they are not the duplication risk their size might suggest.

## 2. Current Site Inventory

| Metric | Value |
|---|---|
| Total HTML files discovered (indexable-candidate walk) | 524 |
| Indexable-candidate pages | 524 |
| Template/partial/component source files (excluded from walk entirely) | 27 (`templates/`, `partials/`, `components/`) |
| Internal QA/audit dashboard pages found live in-repo | 22 (`reports/*.html`, `audit/**/*.html`, `qa/*.html`) |
| Pages with `lang="en"` | 524 / 524 |
| Sitemap URL count (8 sitemap files) | 480 |
| `_redirects` rules | 28 |

Page-type breakdown:

- entity: 105
- glossary-term: 101
- academy-article: 57
- guide: 41
- programmatic-longtail: 36
- reference-page: 36
- internal-dashboard: 20
- dataset-page: 16
- calculator: 14
- chart: 13
- formula-page: 9
- methodology: 8
- resource: 8
- comparison: 7
- question-page: 7
- programmatic-subhub: 7
- editorial-policy: 6
- printable: 4
- release-notes: 4
- legal: 3
- maintenance-guide: 3
- qa-internal: 2
- utility: 2
- error: 1
- trust: 1
- academy-hub: 1
- crawl-hub: 1
- calculator-hub: 1
- comparison-hub: 1
- formula-hub: 1
- guide-hub: 1
- homepage: 1
- maintenance-hub: 1
- programmatic-hub: 1
- provenance: 1
- reference-hub: 1
- resource-hub: 1
- revision-log: 1

Full inventory: `url-inventory.csv`, `url-inventory.json`.

## 3. Overall Quality Score

Average `overall_quality_score` (0-3 scale, 10-dimension rubric, see Deliverable 2 methodology) across all 524 pages: **1.93 / 3**.

Distribution: 0-1: 0, 1-2: 296, 2-3: 228

Full scores + per-dimension evidence: `content-quality.csv`, `content-quality.json`.

## 4. Programmatic Content Findings

- **programmatic/hot-tubs** (6 pages): risk **HIGH**, avg pairwise similarity 0.629, 10 high-similarity pairs, 15 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **programmatic/shock** (7 pages): risk **HIGH**, avg pairwise similarity 0.621, 15 high-similarity pairs, 15 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **programmatic/chlorine** (12 pages): risk **HIGH**, avg pairwise similarity 0.565, 55 high-similarity pairs, 17 repeated paragraph blocks, 1 repeated FAQ entries, 0 repeated tables.
- **programmatic/ph** (5 pages): risk **MEDIUM**, avg pairwise similarity 0.488, 2 high-similarity pairs, 23 repeated paragraph blocks, 2 repeated FAQ entries, 1 repeated tables.
- **releases** (4 pages): risk **MEDIUM**, avg pairwise similarity 0.436, 0 high-similarity pairs, 5 repeated paragraph blocks, 0 repeated FAQ entries, 1 repeated tables.
- **reports** (13 pages): risk **MEDIUM**, avg pairwise similarity 0.272, 0 high-similarity pairs, 1 repeated paragraph blocks, 0 repeated FAQ entries, 2 repeated tables.
- **calculators** (15 pages): risk **MEDIUM**, avg pairwise similarity 0.271, 0 high-similarity pairs, 5 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **guides** (7 pages): risk **LOW**, avg pairwise similarity 0.226, 0 high-similarity pairs, 4 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **entities** (105 pages): risk **LOW**, avg pairwise similarity 0.2, 0 high-similarity pairs, 45 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **glossary** (101 pages): risk **LOW**, avg pairwise similarity 0.18, 0 high-similarity pairs, 7 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **resources** (9 pages): risk **LOW**, avg pairwise similarity 0.158, 0 high-similarity pairs, 2 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **reference/datasets** (16 pages): risk **LOW**, avg pairwise similarity 0.157, 0 high-similarity pairs, 2 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **root** (12 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 0 repeated paragraph blocks, 1 repeated FAQ entries, 0 repeated tables.
- **academy/equipment** (7 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 5 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **academy/fundamentals** (8 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 5 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **academy/hot-tubs** (7 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 4 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **academy/sanitizers** (7 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 6 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **academy/testing** (7 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 5 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **academy/troubleshooting** (7 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 4 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **academy/vacation-rentals** (7 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 3 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **academy/water-balance** (7 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 4 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **audit/google** (7 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 0 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **charts** (4 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 0 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **comparisons** (8 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 2 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **formulas** (10 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 0 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **guides/advanced** (5 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 1 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **guides/chlorine** (6 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 1 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **guides/edge-cases** (7 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 2 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **guides/hot-tub** (6 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 1 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **guides/ph** (6 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 1 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **guides/questions** (7 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 2 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **guides/seasonal** (5 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 1 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **legal** (3 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 0 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **maintenance** (4 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 0 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **printables** (3 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 0 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **programmatic/behavior** (4 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 9 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **programmatic/explanations** (4 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 7 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **programmatic/problems** (5 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 10 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.
- **reference** (37 pages): risk **LOW**, avg pairwise similarity 0, 0 high-similarity pairs, 4 repeated paragraph blocks, 0 repeated FAQ entries, 0 repeated tables.

Full data: `programmatic-duplication.csv`, `programmatic-duplication.json`.

## 5. Chemical Accuracy Findings

4203 candidate chemistry claims (sentences containing a tracked chemistry term and/or a numeric range/unit) were extracted across 524 pages. This audit did **not** independently verify chemistry correctness against external literature -- per the audit brief, uncertain content is flagged `REQUIRES_EXPERT_REVIEW` rather than silently corrected or judged.

Cross-page range consistency by topic (topics where more than one distinct numeric range/unit string was found across the site -- this does not necessarily mean a contradiction, since e.g. pools and hot tubs legitimately have different target ranges, but every row here should be expert-reviewed to confirm the variance is intentional):

- **general**: 90 distinct range/unit strings found -- `1ppm | 3ppm | 85ppm | 100% | 65–80% | 70°f | 3–5ppm | 98–104°f | 80°f | 1–3ppm | 5ppm | 30–50ppm | 0.8ppm | 2.5ppm | 2ppm | 500ppm | 100–104°f | 80–100ppm | 150ppm | 70% | 10–12.5% | 0.6ppm | 0.5ppm | 100ppm | 90ppm | 3.5ppm | 1.5ppm | 8ppm | 4ppm | 400ppm | 10ppm | 80ppm | 90% | 90°f | 80–120ppm | 1to3ppm | 58% | 200–400ppm | 0–0ppm | 0.3ppm | 0ppm | 95% | 10% | 30–100ppm | 20–30% | 0.5–1ppm | 200ppm | 80% | 56–62% | 104°f | 78–84°f | 000ppm | 98-100% | 25–29°c | 1mg/l | 50% | 25–50% | 40ppm | 6ppm | 30-50ppm | 1-3ppm | 65% | 150–250ppm | 56% | 0.2ppm | 30ppm | 60–90% | 25% | 6.7ppm | 10–20% | 0.5–1.0ppm | 50–80% | 32°f | 20ppm | 15–20% | 2–3ppm | 4–5ppm | 120ppm | 80–90ppm | 77°f | 10–15% | 2.00ppm | 60–80ppm | 1500ppm | 78–82°f | 77–79°f | 82–84°f | 50°f | 1000ppm | 73%`
- **ph**: 55 distinct range/unit strings found -- `80–100ppm | 10°f | 68°f | 22% | 80–120ppm | 3ppm | 3–5ppm | 2ppm | 10–12.5% | 0.5ppm | 10ppm | 0.8ppm | 100ppm | 250ppm | 480ppm | 90ppm | 2.5ppm | 30ppm | 55% | 28% | 120ppm | 60ppm | 50ppm | 10% | 1–3ppm | 100–104°f | 10–12% | 60–80ppm | 30–50ppm | 10°c | 67% | 80°f | 100% | 31.5% | 150ppm | 20–30ppm | 31.45% | 93.2% | 200ppm | 20% | 31% | 80–90ppm | 10–20% | 5ppm | 1ppm | 60% | 0.2ppm | 0.05ppm | 500ppm | 77°f | 90% | 50% | 104°f | 85°f | 400ppm`
- **free chlorine**: 35 distinct range/unit strings found -- `1–3ppm | 3ppm | 5ppm | 67% | 1.0ppm | 0.5ppm | 0.9ppm | 2.0ppm | 1ppm | 22% | 10–30ppm | 1-3ppm | 3–5ppm | 3–6ppm | 65% | 0–0ppm | 30–50ppm | 30–100ppm | 0.5–1ppm | 400ppm | 10ppm | 78–84°f | 10% | 30ppm | 5–15ppm | 65–73% | 0ppm | 56% | 6.5ppm | 90% | 0.5–1.0ppm | 85–90°f | 60% | 80–120ppm | 75–90%`
- **shock**: 27 distinct range/unit strings found -- `0.5ppm | 65–73% | 10ppm | 30ppm | 10% | 5ppm | 10–30ppm | 1–3ppm | 65% | 56–62% | 6–7ppm | 20–30ppm | 5–15ppm | 0ppm | 0.2ppm | 6.5ppm | 10–12.5% | 60°f | 1ppm | 30–50ppm | 3–5ppm | 100ppm | 10–20ppm | 8–15ppm | 85°f | 50ppm | 10–15ppm`
- **salt**: 19 distinct range/unit strings found -- `400ppm | 60–80ppm | 300ppm | 750ppm | 99.8% | 200ppm | 000ppm | 800ppm | 12ppm | 1–3ppm | 500ppm | 30–50ppm | 100ppm | 30% | 10% | 73% | 31.45% | 100% | 3200ppm`
- **calcium hardness**: 13 distinct range/unit strings found -- `80–120ppm | 200–400ppm | 150ppm | 80–100ppm | 400ppm | 500ppm | 10ppm | 150–250ppm | 60–70% | 3–5ppm | 300ppm | 77% | 80ppm`
- **total alkalinity**: 13 distinct range/unit strings found -- `80–120ppm | 120ppm | 1–3ppm | 80-120ppm | 31.45% | 200–400ppm | 95% | 60ppm | 6.7ppm | 93.2% | 150ppm | 80–90ppm | 80–100ppm`
- **cyanuric acid**: 11 distinct range/unit strings found -- `80ppm | 3ppm | 90% | 1-3ppm | 30–50ppm | 30-50ppm | 10–30ppm | 1–3ppm | 20ppm | 25% | 30ppm`
- **algae**: 7 distinct range/unit strings found -- `1ppm | 10ppm | 0ppm | 20–30ppm | 0.5ppm | 30ppm | 80–100ppm`
- **bromine**: 5 distinct range/unit strings found -- `86°f | 3–5ppm | 54% | 3–6ppm | 1–3ppm`

Full claims dataset: `chemical-claims.csv`.

## 6. Cannibalization Findings

0 CRITICAL, 0 HIGH, 36 MEDIUM risk pairs identified among calculator/chart/guide/programmatic/reference pages sharing a core intent.

Headline finding: `calculators/pool-volume-calculator.html` and `calculators/volume-calculator.html` are two separate, both-indexable (`robots: index, follow`) live URLs for what appears to be the same "Pool Volume Calculator" tool, with 0.56 body-text similarity and near-identical (auto-generated, doubly-suffixed) titles: *"Pool Volume Calculator (calculators)"* and *"Pool Volume Calculator (calculators) (calculators)"*.

Full data: `content-cannibalization.csv`.

## 7. AEO Findings

91 / 524 pages score LIKELY on "AI-answerable using only this page" (answer-first block + FAQ/quick-answer + sufficient semantic completeness). Full data: `aeo-audit.csv`.

## 8. E-E-A-T Findings

Missing sitewide: named_author_or_reviewer. Zero pages sitewide (0/524) carry a named author or reviewer byline. Full detail: `trust-audit.md`, `trust-audit.json`.

## 9. Structured Data Findings

Schema status counts across all JSON-LD blocks found: VALID: 953, MISSING: 39, QUESTIONABLE: 3. The MISREPRESENTED count is driven almost entirely by the `{{H1_TITLE}}` template-leakage defect (see Executive Summary). Full data: `schema-audit.csv`.

## 10. Internal Linking Findings

Orphan pages (0 inbound internal links, excluding homepage): **4**. Inbound-link distribution: {"0":4,"1-2":137,"3-4":59,"5+":324}. Full graph: `internal-link-audit.csv`, `internal-link-graph.json`.

## 11. Crawl/Indexation Findings

- CANONICAL_POINTS_ELSEWHERE: 3 page(s)
- HAS_LEGACY_REDIRECT_SOURCE_COLLISION: 3 page(s)

Sitemap contains 480 URLs against 524 discovered pages -- the -44 difference should be reconciled (either stale sitemap entries for removed pages, or a URL-form mismatch this crawl's resolver did not catch; see Audit Limitations). Full data: `crawl-indexation-audit.csv`.

## 12. AdSense Readiness

- ADSENSE_READY: 362
- ADSENSE_REVIEW: 109
- ADSENSE_RISK: 53

Full data: `adsense-readiness.csv`.

## 13. UX/Accessibility

0 / 524 pages flagged at least one static accessibility issue (missing alt text, missing viewport meta, heading-level skip, unlabeled calculator form, or a table without `<th>` headers). Full data: `ux-accessibility-audit.csv`.

## 14. Internationalization Readiness

100% of crawled pages are `lang="en"`; no Spanish or French content exists yet. Before i18n:

- 0 pages carry unreplaced {{TEMPLATE}} tokens in production HTML/schema -- must be fixed in the English generators before they are copied into any translation pipeline.
- 415 of 415 factual pages cite zero external sources -- translating unverifiable claims multiplies the accuracy-review burden per locale.
- 3 programmatic page families show HIGH/CRITICAL near-duplicate content -- translating near-duplicates multiplies thin/duplicate-content risk per locale rather than fixing it once.
- Two live calculator URLs exist for the same tool (pool-volume-calculator vs volume-calculator) -- this ambiguity would be inherited by every locale copy.

## 15. Page-Level Action Matrix

Action counts: IMPROVE: 111, UNCHANGED: 303, KEEP: 84, MERGE: 26. Full matrix: `action-matrix.csv`, `action-matrix.json`.

## 16. P0 Findings (0)

Dominated by template-token leakage (0 pages) and the one CRITICAL duplicate-calculator-URL pair. Sample:





## 17. P1 Findings (26)

- `programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool.html`: originality_score=1 (near-duplicate of a sibling page's body text) -- see programmatic-duplication.csv for family "programmatic/chlorine".
- `programmatic/chlorine/how-much-chlorine-for-12000-gallon-pool.html`: originality_score=1 (near-duplicate of a sibling page's body text) -- see programmatic-duplication.csv for family "programmatic/chlorine".
- `programmatic/chlorine/how-much-chlorine-for-15000-gallon-pool.html`: originality_score=1 (near-duplicate of a sibling page's body text) -- see programmatic-duplication.csv for family "programmatic/chlorine".
- `programmatic/chlorine/how-much-chlorine-for-18000-gallon-pool.html`: originality_score=1 (near-duplicate of a sibling page's body text) -- see programmatic-duplication.csv for family "programmatic/chlorine".
- `programmatic/chlorine/how-much-chlorine-for-20000-gallon-pool.html`: originality_score=1 (near-duplicate of a sibling page's body text) -- see programmatic-duplication.csv for family "programmatic/chlorine".
- `programmatic/chlorine/how-much-chlorine-for-25000-gallon-pool.html`: originality_score=1 (near-duplicate of a sibling page's body text) -- see programmatic-duplication.csv for family "programmatic/chlorine".
- `programmatic/chlorine/how-much-chlorine-for-30000-gallon-pool.html`: originality_score=1 (near-duplicate of a sibling page's body text) -- see programmatic-duplication.csv for family "programmatic/chlorine".
- `programmatic/chlorine/how-much-chlorine-for-5000-gallon-pool.html`: originality_score=1 (near-duplicate of a sibling page's body text) -- see programmatic-duplication.csv for family "programmatic/chlorine".

...and 18 more; see `action-matrix.csv` filtered to priority=P1.

## 18. P2 Findings (66)

- `404.html`: word_count=25 -- thin content risk for AdSense/quality.
- `audit/google/index.html`: word_count=29 -- thin content risk for AdSense/quality.
- `audit/google/search-console-helper.html`: word_count=17 -- thin content risk for AdSense/quality.
- `charts/hot-tub-chemical-levels-chart.html`: word_count=132 -- thin content risk for AdSense/quality.
- `charts/pool-chemical-levels-chart.html`: Orphan page: 0 incoming internal links found in the generated HTML.
- `editorial/index.html`: word_count=129 -- thin content risk for AdSense/quality.

...and 60 more; see `action-matrix.csv` filtered to priority=P2.

## 19. P3 Findings (432)

Enhancement-tier only; see `action-matrix.csv` filtered to priority=P3 for the full list (432 rows).

## 20. Remediation Roadmap (sequencing only -- no remediation performed in Phase 7A)

1. Fix the `{{H1_TITLE}}` (and 20 other) template-token leakage at the generator level (`scripts/generate-glossary.js` and siblings), then regenerate affected pages. This is mechanical and low-risk to fix first.
2. Resolve the `pool-volume-calculator` vs `volume-calculator` duplicate-URL pair (pick a canonical URL, 301 the other, dedupe from `calculators/index.html` and `all-pages.html`).
3. Decide the fate of the 3 HIGH/CRITICAL-risk programmatic families (`hot-tubs`, `shock`, `chlorine`, `ph`) -- likely differentiation work (more unique per-page data/examples) rather than deletion, since page_count per family is modest (5-12).
4. Reconcile the root-level legacy chart pages (`hot-tub-chemical-levels-chart.html`, `pool-chemical-levels-chart.html`, etc.) against their `charts/` counterparts -- both are live and indexable with near-zero content overlap despite near-identical titles.
5. Add real external citations to at least the highest-traffic reference/entity/guide pages; the current 0-source baseline is the single largest E-E-A-T and AdSense-content-quality gap.
6. Add a named author/reviewer credit and expand `editorial/review-process` visibility on individual content pages, not just the policy hub.
7. Investigate the -44-URL gap between sitemap and crawled inventory, and the 0 sitemap/noindex contradictions.
8. Only after 1-7: proceed to internationalization, per Section 14.

## 21. Spanish Readiness Assessment

Not ready. 0 Spanish-language pages exist. Recommend completing Roadmap items 1-6 on the English source before forking a translation pipeline, since template-leakage and duplicate-URL defects would otherwise be replicated per locale.

## 22. French Readiness Assessment

Not ready, for the same reasons as Section 21. No French-language content exists.

## 23. Audit Limitations

- This is a **static, mechanical forensic pass**, not a manual editorial read of all 524 pages. Quality/AEO/trust scores are computed from a documented, reproducible rubric (see `scripts/audit-forensic/lib/scoring.js`) tied to measurable structural signals (word count, heading count, FAQ/schema presence, duplication similarity, external-link presence). This is evidence-based but is a proxy for, not a replacement of, human editorial judgment -- treat scores as triage signal, not final grades.
- **Chemistry claims were extracted, not fact-checked.** This audit has no authority to confirm or deny pool/spa chemistry correctness; every claim in `chemical-claims.csv` should be read as "candidate for expert review," not as verified-true or verified-false.
- Duplication analysis uses 6-word-shingle Jaccard similarity plus exact-match detection for paragraphs/FAQs/tables; it will under-count paraphrased duplication and over-count coincidental short-phrase overlap in very short pages.
- The internal link graph and crawl-depth BFS only follow `<a href>` tags found by regex in raw HTML; it does not execute JavaScript, so any client-side-rendered navigation would not be captured.
- The sitemap/inventory count gap (480 vs 524) was flagged but not root-caused in this pass -- see Roadmap item 7.
- Cannibalization analysis focused on calculator/chart/guide/programmatic/reference/comparison/academy page types and a fixed list of 16 core intent phrases; it is not an exhaustive pairwise comparison of all 524 pages (that would be ~137k comparisons) and may miss cannibalization on intents outside that list.

## 24. Files and Scripts Examined

- All 524 `*.html` files under the repository root (excluding `node_modules`, `.git`, and this audit's own `reports/phase-7a/` output).
- `sitemap*.xml` (9 files), `robots.txt`, `_redirects`.
- `scripts/generate-*.js`, `scripts/audit-*.js` (inspected for naming/generator-mapping purposes; not executed).
- `data/trust/*.json`, `data/graph/*.json`, `data/indexing/*.json` (inspected for cross-reference; full semantic audit of these is a follow-up item, not completed in this pass).
- Audit pipeline source: `scripts/audit-forensic/` (this Phase 7A deliverable itself).

## 25. Reproduction Commands

```bash
npm run audit:forensic
# or directly:
node scripts/audit-forensic/run.js
```

Outputs are deterministic against a fixed commit (all inputs are static files on disk; no network calls, no randomness). Re-running against the same commit reproduces materially identical findings -- see `audit-metadata.json` for the `git_commit` and `timestamp` of this run.
