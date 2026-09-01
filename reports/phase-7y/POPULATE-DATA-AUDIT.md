# Phase 7Y -- `scripts/populate-data.js` Audit

`populate-data.js` was **not modified** during this phase. Everything below is observation only. The isolated-copy experiment described at the end never touched the production repository (verified: `git status --porcelain` was empty immediately before and after).

## What it does, exactly

Reads 8 academy source files, 1 formulas source file, 1 glossary source file, and 1 reference-pages source file (all under `scripts/data/`), concatenates/wraps each into a top-level object (`{_comment, categories, articles}` for academy; `{_comment, formulas}`, `{_comment, terms}`, `{_comment, pages}` for the other three), and writes 4 JSON files to `data/`: `academy.json`, `formulas.json`, `glossary.json`, `reference.json`.

## Every input family

`scripts/data/academy-fundamentals.js`, `academy-sanitizers.js`, `academy-testing.js`, `academy-water-balance.js`, `academy-troubleshooting.js`, `academy-hot-tubs.js`, `academy-equipment.js`, `academy-vacation-rentals.js` (academy, 8 files, concatenated via array spread, in that fixed order); `scripts/data/formulas-data.js` (single file); `scripts/data/glossary-terms.js` (single file); `scripts/data/reference-pages.js` (single file).

## Every output family

`data/academy.json`, `data/formulas.json`, `data/glossary.json`, `data/reference.json`. Nothing else.

## Transformation type

Copy + wrap, not a true merge for the single-file families (formulas/glossary/reference: the source array is wrapped in an object with a `_comment` and one named key, unchanged otherwise). For academy, it is a **concatenation** of 8 independent arrays into one -- deterministic order (fixed by the `require()` sequence in the file), no field-level merging, no conflict resolution logic of any kind. If two source files defined the same `id`, `populate-data.js` would silently produce a JSON array containing both duplicate entries; it performs no uniqueness check.

## Can it delete records from generated JSON?

**Yes, unconditionally.** It does not read the existing `data/academy.json` before writing -- it constructs the entire object fresh from the 8 source files and calls `fs.writeFileSync`, fully overwriting whatever was there. Any record present in the JSON but absent from the source files is deleted with no warning, no diff shown, no confirmation prompt. This is exactly the mechanism that would delete `fund-07`/`fund-08` if run against the production repository today (confirmed by this phase's isolated-copy experiment below).

## Can it overwrite manually preserved content?

Yes -- see above. There is no distinction in the script between "content that originated from the source files" and "content that was hand-added directly to the JSON." Both are replaced identically by the next run.

## Is it deterministic?

**Yes.** Verified this phase: copied `scripts/populate-data.js` and `scripts/data/` into an isolated temporary directory (outside the production repository), ran it twice, and diffed all 4 output files -- byte-identical both times. The script has no randomness, no timestamps, no environment-dependent behavior.

## Is it safe to run repeatedly?

Safe in the sense that repeated runs produce identical output (idempotent given unchanged inputs). **Not safe** in the sense that any prior direct edit to the JSON outputs that was never mirrored back into the corresponding `scripts/data/*.js` source file is destroyed on the next run, silently.

## Is it safe to run automatically in `npm run build`?

**Not as currently written**, for two independent reasons:
1. It would immediately delete `fund-07`/`fund-08` from `data/academy.json` (and, by extension, orphan their live HTML pages, since nothing else would regenerate or remove `academy/fundamentals/new-pool-startup-chemistry.html` / `indoor-pool-chemistry.html`).
2. Its own header comment instructs future editors to treat the JSON files as the "permanent source of truth" and edit them directly -- directly contradicting the mechanical behavior of overwriting them from a different set of files. Making it automatic would turn a currently-avoidable, occasional risk (only realized when someone manually runs the script) into a certainty on every single build.

## Is it currently invoked by the build?

**No.** `npm run build` = `node scripts/run-all-generators.js` (from `package.json`). `run-all-generators.js` was read in full for this phase (see `BUILD-PIPELINE.md`) and contains no `require` or `execSync` reference to `populate-data.js` anywhere. It is a standalone, manually-invoked script, run only when a phase's own instructions (or an agent's own judgment) call for it -- as Phase 7X did, to propagate its academy/glossary/reference content edits into the compiled JSON.

## Why Phase 7X had to surgically preserve `academy.json` after regeneration

Phase 7X needed 5 specific body-text sentences (across 3 academy articles) to reach the live, rendered HTML pages. The only mechanism the repository provides to regenerate `data/academy.json` from an edited `scripts/data/academy-*.js` file is `populate-data.js` -- there is no more surgical "regenerate just this one article" tool. Running it in full exposed the fund-07/fund-08 desync as an unavoidable side effect: any regeneration necessarily reconstructs the entire file from the 8 source files, with no way to preserve JSON-only content short of manually re-inserting it afterward (which is exactly what Phase 7X did).

## Is this behavior expected or architectural debt?

**Architectural debt**, not expected/intentional design. The evidence: `populate-data.js`'s own header comment (present since the file's creation in Phase 5A, commit `4fb65ce`, never revised) says *"The JSON files this script produces are the permanent source of truth... All future content edits must occur in the JSON files — not here [the `scripts/data/*.js` files]."* This directly instructs future editors to do the exact thing (hand-edit the JSON) that the script itself will later silently undo. Phase 7M and Phase 7P's authors, editing `data/academy.json` directly to add new articles, were following this documented instruction, not violating an unwritten convention -- see `GIT-HISTORY-FINDINGS.md`. The defect is in the documentation/architecture, not in any single phase's judgment.

## Isolated-copy experiment (Section 9 compliance)

Performed entirely outside the production repository, in the session scratchpad directory:
1. Copied `scripts/populate-data.js` and `scripts/data/` (the 41 source files) to an isolated temp directory.
2. Ran `node scripts/populate-data.js` there. Output: `academy.json (48 items)`, `formulas.json (9 items)`, `glossary.json (100 items)`, `reference.json (25 items)`.
3. This independently confirms: if `populate-data.js` were run against the production repository today, `data/academy.json` would drop from its current 50 articles to 48 -- deleting `fund-07` and `fund-08`.
4. Ran it a second time in the same isolated location; diffed both runs' outputs -- byte-identical, confirming determinism.
5. The production repository's `data/` and `academy/*.html` files were never touched by this experiment. `git status --porcelain` in the production repo was empty before and after.
