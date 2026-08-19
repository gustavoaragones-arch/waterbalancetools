# Phase 7B — Generator Integrity Remediation

**Status: PASS** (with one disclosed out-of-scope side effect — see "Unexpected Changes")

Commit audited: `6df374b4b10e832503791d8f5286218806828a2c` (Phase 7A baseline).

## 1. Root Cause

Two defects, both traced to source, both fixed at the generator/substitution-engine level. Full trace: `generator-defect-inventory.md`.

**Defect A — `{{H1_TITLE}}` leakage (the confirmed Phase 7A defect, 157 pages).**
`scripts/template-utils.js:49`, the shared `fill()` token-substitution function used by every knowledge-platform generator, matched tokens with the regex `/\{\{([A-Z_]+)\}\}/g`. That character class excludes digits, so `{{H1_TITLE}}` (which contains the digit `1`) could never match — the substitution callback was never invoked for it, regardless of the generator correctly supplying a real value. `generate-glossary.js`, `generate-academy.js`, and `generate-formulas.js` were all passing `H1_TITLE` correctly; the bug was purely in the shared matching regex.

**Defect B — literal `"undefined"` in formula JSON-LD (9 pages, same generator family, discovered while tracing Defect A).**
`scripts/generate-formulas.js:105` read `formula.description`, a field that does not exist in `data/formulas.json` (the real field is `metaDescription`). The resulting JS `undefined` was stringified into production HTML as the literal text `"undefined"`, and a downstream normalization stage then backfilled the resulting broken meta description with scraped, garbled page text — a symptom of Defect B, not an independent third defect.

## 2. Affected Generators

- `scripts/generate-glossary.js` (100 pages)
- `scripts/generate-academy.js` (48 pages)
- `scripts/generate-formulas.js` (9 pages, plus the formula-library hub card renderer)

## 3. Affected Templates

- `templates/glossary-template.html` (`DefinedTerm.name`)
- `templates/academy-template.html` (`Article.headline`)
- `templates/formula-template.html` (`HowTo.name`, `HowTo.description`)

## 4. Pages Affected Before Remediation

157 pages with an unresolved `{{H1_TITLE}}` token; 9 of those also carried a literal `"undefined"` JSON-LD string and garbled meta/OG/Twitter descriptions.

## 5. Exact Implementation Changes

1. **`scripts/template-utils.js`** — `fill()`:
   - Fixed the token regex from `[A-Z_]+` to `[A-Z0-9_]+` so any digit-bearing token name (not just `H1_TITLE`) matches correctly.
   - Added a hard guard: if a token key is present in the `tokens` map but its value is `null`/`undefined`, `fill()` now **throws** instead of silently stringifying it into `"undefined"`/`"null"`. Tokens absent from the map entirely are still passed through unchanged, preserving the documented multi-pass substitution pattern used by later `inject-*.js` pipeline stages.
2. **`scripts/generate-formulas.js`**:
   - `META_DESCRIPTION: formula.description` → `META_DESCRIPTION: formula.metaDescription` (the real field name).
   - Hub card renderer: `f.summary || f.description` → `f.summary || f.metaDescription`.
3. **`scripts/validate-generated-output.js`** (new) — build-time guard. Scans all actual generated production HTML (calculators, programmatic, entities, glossary, academy, guides, charts, reference, comparisons, question pages, legal/trust, generated hubs — 502 files in this run) for: unresolved `{{TOKEN}}`, `<%= %>`, `[[TOKEN]]`, letter-bounded `__PLACEHOLDER__`, `${identifier}`, and a JSON-LD string value literally equal to `"undefined"`/`"null"`/`"NaN"`. Writes `reports/phase-7b/generator-validation-results.json` and exits 1 on any violation.
4. **`scripts/test-validate-generated-output.js`** (new) — regression suite (19 assertions) covering `fill()`'s new guard and every detection scenario required by Phase 7B Step 8, using temporary fixtures that are always removed (verified via `fs.existsSync` at the end of the run).
5. **`scripts/run-all-generators.js`** — added `validate-generated-output.js` to the pipeline immediately after the last HTML-mutating stage (`normalize-seo-metadata.js`) and before dataset/entity/trust validation, QA reporting, broken-link checking, search-index generation, sitemap generation, and the version/release/certification steps -- matching the mandated sequence: generate content → inject metadata/links → validate generated output → sitemap → build PASS.
6. **Regenerated output** — `npm run build` (the project's existing full pipeline) was run to regenerate all production HTML from the corrected generators. No generated HTML file was hand-edited.

## 6. Unresolved Tokens: Before / After

| Pattern | Before | After |
|---|---|---|
| `{{H1_TITLE}}` in production output | 157 | **0** |
| Literal `"undefined"` in production JSON-LD | 9 | **0** |
| Any other `{{...}}` / `<%= %>` / `[[...]]` / `__X__` / `${...}` pattern in production output | 0 | 0 |

Verified two ways: (1) raw `grep` across every production HTML file, (2) `node scripts/validate-generated-output.js` → `PASS -- 502 production HTML files scanned, 0 unresolved template artifacts.`

## 7. DefinedTerm / Article / HowTo Schema Result

All three affected schema fields now carry the real, page-specific value from source data (no invented names, no generic fallback):

- `glossary/algaecide.html`: `"name": "Algaecide"` (was `"{{H1_TITLE}}"`)
- `academy/equipment/salt-systems.html`: `"headline": "Salt Chlorinator Systems"` (was `"{{H1_TITLE}}"`)
- `formulas/alkalinity-formula.html`: `"name": "Total Alkalinity Adjustment Formula"`, `"description": "Calculate the exact amount of sodium bicarbonate needed to raise your pool's total alkalinity with the alkalinity formula."` (was `"{{H1_TITLE}}"` / `"undefined"`)

Phase 7A's schema forensic re-run (see §12) confirms `MISREPRESENTED` schema instances: 157 → **0**, with `VALID` rising by exactly 157 (699 → 856) and every other schema status (`QUESTIONABLE: 49`, `MISSING: 63`) unchanged — the fix touched only the defect class it targeted.

## 8. Validator Behavior

- Pre-fix run: `FAIL -- 166 unresolved template artifact(s) across 157 file(s)` (157 `{{H1_TITLE}}` + 9 `"undefined"`), exit code 1.
- Post-fix run: `PASS -- 502 production HTML files scanned, 0 unresolved template artifacts.`, exit code 0.
- Integrated into `npm run build`; confirmed the validator executed mid-pipeline and reported PASS in the full-build log.

## 9. Regression Test Result

- `node scripts/test-validate-generated-output.js` → `PASS: validate-generated-output regression tests completed (19 assertions).`, covering: valid substitution, missing/undefined/null required variable (throws), optional variable with explicit `''` fallback (does not throw), unset token left for a later pass, digit-bearing token names, single and multiple unresolved tokens, token inside JSON-LD, stringified `"undefined"` inside JSON-LD, token inside visible HTML, token inside `<meta>` content, token inside an attribute value, token on a page outside the three originally-affected families, a fully clean page (0 violations), and a false-positive guard (printable fill-in-the-blank underscores are not flagged).
- Additional manual demonstration performed exactly as specified: a temporary `{{H1_TITLE}}` fixture file was created, the validator was run (**failed**, exit 1, fixture correctly named in the report), the fixture was removed, and the validator was re-run (fixture no longer reported; the still-nonzero exit at that point was the real, then-unfixed 157-token defect, not the fixture). No fixture remains in the repository.

## 10. Full Build Result

`npm run build` → **exit code 0**. All existing validators in the pipeline (`validate-datasets`, `validate-entities`, `validate-trust`, `validate-versioning`, `check-broken-links`) passed with 0 errors, plus the new `validate-generated-output` gate. `test-url-engine.js` (pre-existing, 260 assertions, unrelated module) still passes, confirming the `fill()` change did not regress the URL engine it imports from.

## 11. Forensic Re-Audit Result

`npm run audit:forensic` re-run and compared against the saved Phase 7A baseline:

| Metric | Before | After |
|---|---|---|
| Total HTML files / indexable pages | 522 / 522 | 522 / 522 (unchanged) |
| Schema `MISREPRESENTED` | 157 | **0** |
| Schema `VALID` | 699 | 856 (+157, exact) |
| Schema `QUESTIONABLE` / `MISSING` | 49 / 63 | 49 / 63 (unchanged) |
| P0 findings | 159 | **2** (both are the pre-existing `pool-volume-calculator` vs `volume-calculator` duplicate-URL finding — explicitly out of scope for Phase 7B, unrelated to template leakage) |
| Orphan pages / inbound-link buckets / broken internal links | 2 / `{0:2,1-2:137,3-4:57,5+:326}` / 0 | identical |
| Crawl/indexation flag counts | identical set | identical set |
| AdSense `READY` / `RISK` | 192 / 237 | 342 / 79 (improvement, a direct consequence of the fix — no longer thin/broken content) |
| `_redirects`, `robots.txt` | — | byte-identical (0 diff) |
| `rel="canonical"` value, every page | — | byte-identical (0 diff across the whole tree) |

## 12. Unexpected Changes

One out-of-scope side effect was discovered and is disclosed rather than silently fixed, per the Phase 7B instruction to report rather than remediate unrelated issues:

- **`reports/phase-7a/index.html` (this audit's own Phase 7A dashboard) was swept into `sitemap-other.xml` / `sitemap.xml` by `npm run build`.** Root cause: the pre-existing `generate-sitemaps.js` has no exclusion list for `reports/`, `audit/`, or `qa/` directories — it already included the 13 pre-existing `reports/*.html` dashboards and 7 `audit/google/*.html` pages before this session (this is the same behavior Phase 7A itself flagged as finding `INTERNAL_TOOLING_PAGE_IS_INDEXABLE`, P1). Creating `reports/phase-7a/index.html` in the location the Phase 7A brief specified caused the same pre-existing, already-flagged generator behavior to pick it up too. **Not fixed in Phase 7B** — fixing it would mean changing sitemap generation logic, which is explicitly out of scope ("DO NOT change sitemap strategy"). Recommend addressing together with the existing `INTERNAL_TOOLING_PAGE_IS_INDEXABLE` finding in a later phase.
- **Cosmetic whitespace-only diffs** (1-2 lines, indentation only) appeared in ~230 pages outside the three affected families, caused by a pre-existing, harmless non-determinism in `inject-footer.js`'s indentation across regeneration runs. No content, link, canonical, or schema change accompanies any of these diffs.
- **`last-updated` meta tags and `data/indexing/freshness.json`** were refreshed to the current regeneration date (2026-08-18) sitewide, and the internal `audit/google/*.html` freshness/priority dashboards regenerated accordingly. This is the pipeline's existing, intended freshness-stamping behavior triggered simply by running a full build, not a change Phase 7B introduced.

No page was added, removed, or renamed; no redirect, canonical, or internal link changed in content (only the one sitemap addition above); no unrelated production architecture was modified.

## 13. Git Status (final)

```
 M package.json                            (Phase 7A: added `audit:forensic` script)
 M scripts/generate-formulas.js             (source fix)
 M scripts/template-utils.js                (source fix)
 M scripts/run-all-generators.js            (pipeline integration)
 M <397 regenerated production files>       (natural output of `npm run build`; see §12)
?? reports/phase-7a/                        (Phase 7A deliverable)
?? reports/phase-7b/                        (this phase's deliverables)
?? scripts/audit-forensic/                  (Phase 7A tooling)
?? scripts/validate-generated-output.js     (new validator)
?? scripts/test-validate-generated-output.js (new regression test)
?? graphs.ai                                (pre-existing untracked file, unrelated to this work)
```

399 files modified, 6 new untracked paths — all accounted for above. No unrelated modifications were found.

## 14. Acceptance Gate Result

| # | Gate | Result |
|---|---|---|
| 1 | Production HTML contains ZERO unresolved template tokens | **PASS** |
| 2 | `{{H1_TITLE}}` occurrences in production output = 0 | **PASS** |
| 3 | All other unresolved template patterns identified during the audit = 0 | **PASS** |
| 4 | Original 157 affected pages regenerated from corrected source | **PASS** |
| 5 | No manual HTML patching used | **PASS** |
| 6 | `DefinedTerm` names are page-specific and valid | **PASS** |
| 7 | No schema placeholder remains | **PASS** |
| 8 | New build-time validator exists | **PASS** (`scripts/validate-generated-output.js`) |
| 9 | Validator integrated into the production generation pipeline | **PASS** (`scripts/run-all-generators.js`) |
| 10 | Validator exits non-zero when an unresolved token is deliberately introduced | **PASS** (demonstrated live + in regression suite) |
| 11 | Full build passes with zero generator-integrity errors | **PASS** (`npm run build` exit 0) |
| 12 | `npm run audit:forensic` completes successfully | **PASS** |
| 13 | No unrelated production architecture changed | **PASS with one disclosed exception** — see §12 (sitemap picked up this audit's own dashboard page; pre-existing generator behavior, not a Phase 7B change, not remediated per scope) |
| 14 | Page count does not unexpectedly decrease | **PASS** (522 → 522) |
| 15 | No unexpected sitemap URL changes as a side effect | **PARTIAL** — one unexpected addition, disclosed in §12; root-caused to pre-existing behavior, not a sitemap-strategy change made in this phase |
| 16 | No unexpected canonical changes as a side effect | **PASS** (0 diff, verified across every page) |
| 17 | No unexpected redirect changes as a side effect | **PASS** (`_redirects` byte-identical) |
| 18 | No unexpected internal-link changes as a side effect | **PASS** (orphan count, inbound-link buckets, broken-link count all identical) |

17 of 18 gates fully pass; gate 15 passes for everything caused by this phase's own fix and is flagged partial only because of the one disclosed, pre-existing-generator-behavior side effect described in §12.
