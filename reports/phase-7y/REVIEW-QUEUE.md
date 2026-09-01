# Phase 7Y -- Review Queue

No item below is marked RESOLVED merely because it was investigated. Investigation this phase was audit-only; every item requires a future decision or action.

## A. Confirmed architectural defects

1. **`populate-data.js`'s self-contradictory source-of-truth documentation** (HIGH). Its own header comment (present since Phase 5A, `4fb65ce`, never revised) states the JSON outputs "are the permanent source of truth" and instructs future editors to edit them directly -- while the script's actual mechanical behavior is to unconditionally overwrite those same JSON files from `scripts/data/*.js` on every run, deleting anything not present in the source files. This is the root cause of the academy desync. Evidence: `POPULATE-DATA-AUDIT.md`.
2. **Academy family source/output desync** (HIGH, the phase's central finding). `data/academy.json` contains 2 records (`fund-07`, `fund-08`) with no backing in `scripts/data/academy-fundamentals.js`. A production run of `populate-data.js` today would delete both, orphaning their live, indexed, linked HTML pages. Evidence: `ACADEMY-RECONCILIATION.csv`, `GIT-HISTORY-FINDINGS.md`.
3. **Same architectural exposure, not yet manifested, in formulas/glossary/reference** (MEDIUM). These 3 families share the identical `populate-data.js` dual-entry-point architecture as academy. They are currently clean (verified 9/9, 100/100, 25/25 records match exactly) only because no phase has yet hand-edited their JSON directly -- this is observed practice, not an enforced guarantee. Evidence: `DATA-PIPELINE-INVENTORY.csv`, `SOURCE-OF-TRUTH-MATRIX.csv`.
4. **No automated source-vs-JSON consistency gate exists** for any of the 4 `populate-data.js` families (HIGH, enabling defect). This is why the academy desync persisted undetected across 5 phases (7M through 7X). Evidence: `PIPELINE-GOVERNANCE-AUDIT.md`.
5. **No general duplicate-id/duplicate-slug guard** exists across academy/glossary/reference/formulas (MEDIUM, enabling defect). The historical `fund-06` collision (Phase 7M-7Q) was found only by symptom (a mis-linked entity page), not by a systematic check. Evidence: `PIPELINE-GOVERNANCE-AUDIT.md`, `RECORD-INTEGRITY-AUDIT.csv`.

## B. Confirmed clean families

- **Entities** (`entities-*.js` -> `generate-entities.js`, automatic, single-source). 104/104 records, 0 duplicate ids.
- **Datasets** (`dataset-*.js` -> `generate-datasets.js`, automatic, single-source). 0 duplicate ids in the highest-stakes dataset (dosage-matrices, 13 records).
- **Trust** (`trust-*.js` -> `generate-trust.js`, automatic, single-source).
- **Chemistry evidence** (`chemistry-*.js`, no compiled JSON intermediate at all -- structurally immune to this class of drift).
- **7 programmatic clusters** (chlorine/shock/ph/hot-tub/problem/explanation/behavior -- each self-contained, own inline config, no shared data dependency).
- **Authority guides** (`generate-authority-guides.js` -- source is the generator file itself).
- **Formulas/Glossary/Reference content** -- currently clean in fact (see A.3 for the architectural caveat).

## C. Academy restore/retire decisions (evidence gathered, no decision made)

Per Section 10's explicit instruction, no restore/retire/rewrite action was taken. Evidence gathered for each record:

### `fund-07` (`academy/fundamentals/new-pool-startup-chemistry`)

- Live HTML page: **yes**. Indexable: **yes** (no noindex found; present in sitemap-academy.xml, 2 occurrences). Linked: **yes** (`data/navigation.json`, `academy/fundamentals/index.html` hub page, `data/search-index.json`). Represented in `data/academy.json`: **yes** (as `fund-07`). Represented in any other source file: **no**.
- Content materially distinct: content describes PHTA fresh-fill start-up chemistry guidance, per the Phase 7P commit message backed by a fetched-and-read PHTA fact sheet -- a genuinely distinct topic from the existing seasonal-reopening content (the Phase 7P commit notes a differentiation link was added both ways specifically to prevent cannibalization).
- Another current source containing the same content: not found -- no other academy article in the current `academy-*.js` files covers new-pool-startup chemistry specifically.
- When its source-file registration would have needed to happen: at creation, Phase 7P (commit `2a3a682`). It never happened.
- Intentional or accidental: **neither** in the usual sense -- the author explicitly and correctly followed `populate-data.js`'s own documented instruction to edit the JSON directly (see `GIT-HISTORY-FINDINGS.md`). Not an oversight; a consequence of the architecture's own contradictory documentation.
- Citations: the underlying chemistry source (PHTA fresh-fill fact sheet) was properly registered in `scripts/data/chemistry-sources.js` per the commit message -- not independently re-verified this phase (out of scope; would require re-fetching the source, which this audit-only phase did not do).
- What `populate-data.js` would do if run today: **delete this record**, confirmed via the isolated-copy experiment (`REPRODUCIBILITY.md`).
- **Classification: PRESERVE_PENDING_DECISION.**

### `fund-08` (`academy/fundamentals/indoor-pool-chemistry`)

- Live HTML page: **yes**, and older than fund-07 -- first created in Phase 7M (`a6e7881`), predating even the id-collision fix. Indexable: **yes**. Linked: **yes** (same 3 locations as fund-07). Represented in `data/academy.json`: **yes** (as `fund-08`, after the Phase 7Q id rename from a colliding `fund-06`). Represented in any other source file: **no**.
- Content materially distinct: describes indoor-pool-specific chemistry management (no CYA, chloramine control, ventilation-driven pH drift) -- a genuinely distinct scenario from the general fundamentals articles.
- Another current source containing the same content: not found.
- When its source-file registration would have needed to happen: at creation, Phase 7M (commit `a6e7881`). It never happened, and the subsequent Phase 7Q fix (`ae751ca`) addressed only the id collision, not the missing source registration.
- Intentional or accidental: same as fund-07 -- a consequence of following the architecture's contradictory documentation, not an isolated mistake.
- Citations: not independently re-verified this phase (out of scope).
- What `populate-data.js` would do if run today: **delete this record**.
- **Classification: PRESERVE_PENDING_DECISION.**

Both records are functionally identical in disposition and should likely be decided together, alongside item A.1 (fixing `populate-data.js`'s documentation) and A.4 (adding a consistency gate) -- resolving the architecture first, then formally registering (or deliberately retiring) both records, is the evidence-supported path, though this phase does not decide it.

## D. Build pipeline decisions

1. **Whether `populate-data.js` should run automatically as part of `npm run build`.** Current answer: **not as currently written** (would delete fund-07/fund-08 immediately). Becomes viable only after A.1 (documentation fix) and preferably A.4 (consistency gate) are addressed, and after fund-07/fund-08's disposition (C, above) is resolved one way or the other.
2. **The `generate-hubs.js`/`generate-navigation.js` ordering bug** (documented since Phase 7V) -- confirmed this phase to be independent of the academy desync (see Section E). Still unresolved; every phase since 7V has worked around it by running `npm run build` twice.

## E. Template/injector drift

Confirmed **independent** of the academy/data-source defect (Classification C, per Section 14's framework). Root mechanism: `generate-entity-pages.js` runs twice in `run-all-generators.js` (once early, once after the entity-graph compiler), and the injectors that run in the gap between the two calls are not perfectly idempotent against the second pass's fresh re-render -- confirmed by a direct clean-build experiment this phase (241 files touched, dominated by `entities/*.html`, unrelated to academy content). Phase 7Q had already root-caused part of this (a footer-whitespace nondeterminism) without fixing it. **Not fixed this phase**, per Section 14's explicit instruction and this item's independence from the phase's mandate.

## F. Record-integrity issues

1. **`san-03` (`breakpoint-chlorination`)**: JSON `sources[]` has one extra citation not present in `academy-sanitizers.js` (pre-existing; first flagged, not fixed, by Phase 7X).
2. **`ts-01` (`cloudy-water`)**: JSON `relatedResources[]` has one extra link not present in `academy-troubleshooting.js` (pre-existing; Phase 7X's own `REVIEW-QUEUE.md` misattributed this to `ts-04` instead of `ts-01` -- corrected in this phase's `ACADEMY-RECONCILIATION.csv`).
3. **`ts-04` (`strong-chlorine-smell`)**: JSON and source differ by a single punctuation character (em-dash vs. double-hyphen) in the `examples[0].body` field -- **newly discovered this phase**, introduced by Phase 7X itself (two different edit mechanisms -- the Edit tool on the source file, a Node string-replacement script on the JSON -- were used for the same logical text change and diverged on one character). Trivial to fix (normalize the JSON to match the source, which has the correct em-dash), not executed this phase per the zero-production-changes preference.
4. No duplicate ids/slugs found in any currently-compiled dataset (academy, glossary, reference, formulas, entity-index) or in any source-level family checked (academy-*.js, entities-*.js, dataset-dosage-matrices.js).

## G. Future governance controls (not implemented this phase)

1. Fix `populate-data.js`'s header comment to state a single, non-contradictory source-of-truth tier.
2. Build an automated source-vs-JSON consistency check for the 4 `populate-data.js` families, ideally gating `npm run build` or at minimum a dedicated, always-run validator.
3. Build a general-purpose duplicate-id/duplicate-slug guard across all id/slug-keyed families.
4. Decide fund-07/fund-08's disposition (restore to source / retire the output / reconstruct differently) using the evidence in Section C.
5. Consider a CI workflow (currently none exists) to enforce that `npm run build` and relevant validators run before changes are merged.
6. Fix the 3 minor record-integrity issues in Section F once the broader architecture question (item 1) is resolved, so the fix is applied at the correct tier.
7. Decide the disposition of the 3 orphaned legacy dosage JSON files (`chlorine-dosage.json`, `ph-adjustment.json`, `shock-dosage.json`) -- delete or explicitly archive; zero live risk but a hygiene concern (stale, contradicted-by-current-architecture content).
8. Separately (already known, not part of this phase's core mandate): resolve the `generate-hubs.js`/`generate-navigation.js` ordering bug and the `generate-entity-pages.js` double-render injector-idempotency issue behind the sitewide template drift.
