# Phase 7 Commit/Push Recovery

**Status: PASS**

## Original repository state

- branch: `main`, upstream `origin/main`
- local HEAD: `6df374b` ("Add hero background artwork and full-bleed layout.")
- `origin/main`: `6df374b` (identical to local HEAD — zero divergence)
- working tree: 611 changed/untracked paths (47 untracked, 564 modified), all Phase 7B–7G implementation, with zero commits anywhere in history for any of it

## 611-path working-tree inventory

Full raw output of `git status --short`, `git diff --stat`, `git diff --name-only`, and `git ls-files --others --exclude-standard` (captured before any commit was made): `WORKING-TREE-INVENTORY.txt`.

## Classification methodology

For each modified/untracked path, determined origin by: (1) checking whether the path is untracked (new file, unambiguously created by one phase's work) vs. tracked-modified (requires diff inspection); (2) for tracked files, reading the full `git diff` to look for explicit phase-marker comments (several files carry inline "Phase 7X:" comments) or content matching a specific phase's documented deliverable; (3) cross-referencing each phase's own `reports/phase-7*/` narrative to confirm which production files that phase claimed to touch; (4) for files with no phase marker, tracing the change to its generator/source script and determining which phase owns that script.

This surfaced an important correction to the prior Phase 7G report: that report described a sitewide "`/charts/X` → `/X`" footer-link change and sitemap/`_redirects` churn as **pre-existing, unrelated baseline noise**. Direct inspection this task found that characterization was **wrong** — `scripts/redirect-rules.js` and `scripts/restructure-calculator-pages.js` contain explicit inline comments ("Phase 7C URL consolidation", "'volume-calculator.html' retired in Phase 7C") tying this directly to Phase 7C's new `scripts/url-policy.js` (`REDIRECT_SOURCES`). It is genuine Phase 7C work, not unrelated churn — corrected here.

## Classification results

**A. Phase 7B–7G work (committed):** All `scripts/phase-7*/`, `scripts/data/chemistry-*`, `scripts/data/programmatic-intents.js`, `scripts/chemistry/*`, all `scripts/validate-*.js`/`test-*.js` added this session, `scripts/url-policy.js`, `scripts/redirect-rules.js`, `scripts/restructure-calculator-pages.js`, `js/url/url-engine.js`, `scripts/data/entities-measurements.js` (removes the Phase 7C-retired `volume-calculator` from calculator cross-references), `scripts/data/trust-*.js`, `data/trust/*.json`, `components/global-schema.html`, the four `scripts/generators/generate-*-pages.js` files, all `programmatic/{chlorine,ph,shock,hot-tubs}/*.html`, `editorial/editorial-policy/index.html`, and every `reports/phase-7*/*` directory. Also `scripts/phase-7d/` (three files omitted from the original 7D commit by staging oversight, corrected in a follow-up commit) and `reports/phase-7a/` + `scripts/audit-forensic/` (Phase 7A forensic-audit infrastructure — technically outside this audit's requested 7B–7G phase list, but foundational, reused infrastructure with no prior commit either; preserved and committed for the same reason as the rest of this track).

**B. Pre-existing, unrelated work (left uncommitted, not discarded):** `graphs.ai` — a 1MB PDF (despite its `.ai` extension), file-dated 2026-06-29, matching the already-committed `6df374b` "Add hero background artwork" commit. Untouched by this session's work. Deliberately left uncommitted and undiscarded, per this task's explicit instruction to preserve ambiguous/unrelated files rather than guess.

**C. Ambiguous at the whole-file level, resolved as cumulative/inseparable (committed in the final bundle, not attributed to a single phase):** A set of tracked files whose diffs genuinely interleave two or three phases' changes in the same or adjacent hunks:
- `scripts/generate-authority-charts.js` and its rendered output (`charts/*.html`, the 8 root `*-chart.html` pages) — mixes Phase 7E's citation-block work, Phase 7F.1's CYA correction, and Phase 7C's `/charts/` URL-prefix cascade.
- `index.html`, `about/index.html` — mix a genuine Phase 7F content correction (Organization-schema logo; methodology-text honesty correction) with the Phase 7C footer-link cascade and an unrelated, non-idempotent whitespace artifact from `inject-footer.js` (see below).
- `reference/combined-chlorine-explained.html` — mixes the Phase 7F.1 CC/CYA context correction with the Phase 7C footer-link cascade.
- `calculators/*.html` (14 pages) — mix Phase 7C (retired-calculator link removal, footer link, whitespace artifact), Phase 7E (calculator citation blocks), and Phase 7F (trust-panel confidence downgrades) in a single file.
- The ~450 remaining `academy/`, `glossary/`, `entities/`, `guides/`, `reference/`, and similar pages — dominated entirely by the Phase 7C footer-link cascade plus routine build timestamps.
- `sitemap.xml`, `sitemap-*.xml`, `_redirects`, `data/navigation.json`, `data/search-index.json`, `data/entities/measurements.json`, `data/graph/entity-index.json`, `data/indexing/*.json`, `data/platform/compatibility.json`, `data/reference.json`, `audit/google/*`, `qa-summary.json`/`.md`, `style.css`, `templates/*`, `package.json` (mixes a Phase 7D chemistry-validator npm-script addition with a pre-existing `audit:forensic` entry), `all-pages.html`, `provenance/index.html`, `search/index.html`, `releases/*.html`, `functions/_middleware.js`, `tools/index.html`, `legal/*`, `resources/*`, `printable*/*`, `formulas/*`, `comparisons/*`, `404.html` — all routine regenerated output of the same `npm run build` pipeline run.

Per this task's explicit instruction, none of these were split via speculative or destructive techniques (no `git add -p` hunk-guessing across ambiguous boundaries). They were consolidated into one final, honestly-labeled commit dependency-ordered after all 11 phase commits: `a3cfd17`.

**Anomaly noted, not fixed (out of scope for this task):** `index.html` and `about/index.html` each carry a block of ~50 blank lines inserted by a non-idempotent `inject-footer.js` run on top of the deliberate content edit. Cosmetic only (no visible/functional effect), left as-is per this task's "do not modify implementation" instruction — flagged here for a future cleanup pass.

## Phase 7B–7G file-group verification

Every listed group in the task brief was confirmed present via direct filesystem/`git diff` inspection before staging (see Problem Solving trace above); no group was assumed. All groups existed and matched their phase's documented scope, with two corrections: `scripts/phase-7d/` was initially missed and required a follow-up commit, and `package.json`/`generate-authority-charts.js` required explicit mixed-content documentation rather than clean single-phase attribution.

## Commits created

| Phase | Commit | Message |
|---|---|---|
| 7B | `5676901` | Phase 7B: remediate generator integrity |
| 7C | `04a0ff6` | Phase 7C: centralize URL indexation policy |
| 7D | `b296edc` | Phase 7D: establish chemistry knowledge provenance |
| 7D.1 | `457b688` | Phase 7D.1: correct chemistry extraction attribution |
| 7D.2 | `0da45a6` | Phase 7D.2: independently validate chemistry extraction |
| 7D.3 | `c295661` | Phase 7D.3: rebuild chemistry evidence dataset |
| 7E | `d430386` | Phase 7E: implement chemistry provenance citations |
| 7E.1 | `5739377` | Phase 7E.1: resolve provenance conflicts |
| 7F | `bf4fe64` | Phase 7F: strengthen editorial trust layer |
| 7F.1 | `9e8857e` | Phase 7F.1: resolve priority chemistry claims |
| 7G | `c961e7a` | Phase 7G: differentiate programmatic content |
| 7D (supplement) | `5d92a77` | Phase 7D: establish chemistry knowledge provenance (additional build scripts) |
| 7A (infra) | `23ab40c` | Phase 7A: forensic audit baseline (supporting infrastructure) |
| Bundle | `a3cfd17` | Phase 7B-7G: regenerate production build output (cumulative) |

All 14 commits pushed to `origin main` immediately after creation; each push was verified by `git fetch origin` followed by `git rev-parse HEAD` / `git rev-parse origin/main` matching exactly, before proceeding to the next commit.

## Push verification (final)

- Final local HEAD: `a3cfd1787955af872734e58c1175f0c41b8a7683`
- Final `origin/main`: `a3cfd1787955af872734e58c1175f0c41b8a7683`
- Match: **YES**
- `git rev-list --left-right --count main...origin/main`: `0 0`

## Remaining uncommitted files

- `graphs.ai` — pre-existing, unrelated, intentionally left uncommitted (see Classification B above).
- `reports/phase-7-commit-recovery/` — this recovery task's own output; committed separately as the final step of this task (see below).

## Confirmation: no data discarded

No `git reset`, `git checkout --`, `git restore`, `git clean`, `git stash`, `--amend`, or force-push was used at any point. Every one of the 611 originally-inventoried paths was either committed (in one of the 14 commits above) or deliberately left uncommitted and explicitly documented (`graphs.ai`). Nothing was deleted, discarded, or silently dropped.
