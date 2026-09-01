# Phase 7Y -- Git History Findings

Covers the one confirmed DRIFT_FOUND family (Academy). No history was rewritten; all commands were read-only (`git log`, `git show`, `git log -S`).

## `scripts/data/academy-fundamentals.js`

Exactly **one** commit in its entire history: `4fb65ce` ("Phase 5A Part 2 — Populate Water Chemistry Knowledge Platform"). It has never been touched since the platform's original population. `fund-07` and `fund-08` have **never** existed in this file at any point in git history -- confirmed via `git log -p --follow -- scripts/data/academy-fundamentals.js | grep "fund-07\|fund-08"`, zero matches.

## `data/academy.json` -- full commit timeline

```
f4c4758  Phase 5A Part 1 — Knowledge Platform Architecture
4fb65ce  Phase 5A Part 2 — Populate Water Chemistry Knowledge Platform   (created; fund-01..fund-06 present)
a6e7881  Phase 7M: content quality, topical depth, and seasonal resilience   <- introduces "indoor-pool-chemistry" with id "fund-06" (COLLISION)
1bab1c9  Phase 7N: forensic SEO, indexation, and search-demand optimization
2a3a682  Phase 7P: search-demand gap validation & topical expansion   <- introduces "new-pool-startup-chemistry" with id "fund-07"
ae751ca  Phase 7Q: production quality, review-queue closure & final SEO integrity   <- renames the colliding "fund-06" (indoor-pool-chemistry) to "fund-08"
219a57d  Phase 7R: scientific evidence resolution & calculator provenance
e959f8d  Phase 7X: content alignment & breakpoint-claim reconciliation   <- surgical preservation of fund-07/fund-08 during regeneration
```

### Commit `a6e7881` (Phase 7M) -- root cause, event 1

Added a new academy article directly to `data/academy.json`: `"id": "fund-06"`, `"slug": "academy/fundamentals/indoor-pool-chemistry"`. This **collided** with the pre-existing, source-backed `fund-06` (`why-water-testing-matters`, present in `academy-fundamentals.js` since Phase 5A). `scripts/data/academy-fundamentals.js` was **not** modified in this commit. The new article was never registered in any source file.

### Commit `2a3a682` (Phase 7P) -- root cause, event 2

Added a second new academy article directly to `data/academy.json`: `"id": "fund-07"`, `"slug": "academy/fundamentals/new-pool-startup-chemistry"`. `scripts/data/academy-fundamentals.js` was again **not** modified. The commit message states explicitly: *"Implemented through the existing academy generator (data/academy.json + generate-academy.js), not a parallel architecture."* This is not evidence of a mistake or a shortcut -- it is evidence that the author correctly identified `populate-data.js`'s own documented instruction (*"All future content edits must occur in the JSON files — not here"*, present since Phase 5A, see `POPULATE-DATA-AUDIT.md`) and followed it as designed. The chemistry evidence backing the new article **was** properly registered (`scripts/data/chemistry-sources.js`), per the commit message -- only the article's own record was added to the wrong tier of the architecture (JSON instead of source), because the architecture's own documentation names the JSON tier as correct.

### Commit `ae751ca` (Phase 7Q) -- partial fix

Phase 7Q's own investigation ("closes 26 carry-forward items") discovered the `fund-06` id collision independently, described in its commit message as: *"data/academy.json's duplicate 'fund-06' id fixed at the source: Phase 7P had called it inert, but it was silently mis-linking entities/maintenance-checklist.html to the wrong academy article."* The fix applied was a **1-line id rename** (`"fund-06"` -> `"fund-08"`) directly in `data/academy.json` -- again, `academy-fundamentals.js` was not touched. This resolved the immediate symptom (the collision, and the mis-linking it caused) but did not resolve the underlying architectural cause (the record still has no source-file registration), leaving exactly the state Phase 7X discovered and this phase has now fully traced.

### Did divergence happen together with source changes?

No. In every one of the 3 relevant commits (`a6e7881`, `2a3a682`, `ae751ca`), `scripts/data/academy-fundamentals.js` was untouched (confirmed: it has exactly 1 commit total, from Phase 5A, and none of these 3 SHAs appear in its history). The divergence was introduced, and then partially patched, entirely on the `data/academy.json` side.

### Was the divergence introduced by a particular commit?

Yes, precisely: `a6e7881` (Phase 7M) for the `indoor-pool-chemistry`/`fund-08` record, `2a3a682` (Phase 7P) for the `new-pool-startup-chemistry`/`fund-07` record.

### Would a later regeneration destroy content?

Yes -- confirmed both by static analysis (the records have no source backing) and by the isolated-copy dynamic experiment in `POPULATE-DATA-AUDIT.md` (an isolated `populate-data.js` run reproduces exactly 48 academy records, down from the current 50).

### Does the current generated output predate the source?

No -- inverted from the usual case. Here the *generated output is ahead of* (contains more than) the source, because content was added to the output tier directly and never backported. In the normal failure mode for this class of bug, a source is updated and the generator simply hasn't been re-run yet (recoverable by re-running it); here, re-running the generator is exactly what would cause data loss, because the source was never updated in the first place.

### Was the source removed intentionally?

No evidence of intentional removal exists, because the content was **never in the source to begin with** -- there is nothing to have been removed. This rules out an accidental-deletion narrative entirely and confirms the root cause is purely the dual-entry-point architecture (JSON writable both by the generator and, per its own documentation, by hand) described in `POPULATE-DATA-AUDIT.md` and `SOURCE-OF-TRUTH-MATRIX.csv`.

## Other families

No other family in `GLOBAL-DRIFT-AUDIT.csv` received a `DRIFT_FOUND` disposition, so no further git-history analysis was performed per Section 12's scope ("For every DRIFT_FOUND family..."). The navigation-index ordering bug (`AMBIGUOUS` disposition) was already documented with its own history in Phase 7V's `CONTENT-AUDIT.md`, cited rather than re-traced here, consistent with Section 14's instruction not to re-investigate that item beyond confirming it is unrelated to the academy desync (done -- see `BUILD-PIPELINE.md`).
