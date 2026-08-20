# Phase 7J — Entity Provenance Audit & Knowledge-Layer Certification

**Status: PASS WITH REVIEW QUEUE**

## Entity Inventory

All 104 entity `longDescription` fields inventoried (`entity-longdescriptions.csv`). 378 chemistry claims extracted (`entity-claim-inventory.csv`): 89 numeric chemistry claims, 150 qualitative chemistry claims, 66 operational claims, 38 safety claims, 28 material-property claims, 7 taxonomy/definition claims.

## Claim Extraction

Reused the validated Phase 7D.1 extractor (`extractFromSentence` from `scripts/phase-7d-1/extract-claims-v2.js`) for all numeric-claim extraction — no competing algorithm introduced. A separate, transparent sentence-level classifier (documented in `scripts/phase-7j/extract-entity-claims.js`) tags non-numeric claim types for triage only; it does not attempt numeric extraction.

## Provenance

Automated cross-reference against `chemistry-ranges.js` initially flagged 34 apparent conflicts. 13 were extractor-confidence artifacts (`IMPOSSIBLE_MAPPING`/`CARRIED_CONTEXT` — the extractor's own plausibility check already rejected the pairing) and correctly reclassified `AMBIGUOUS` rather than compared at all. The remaining 21 were individually read in full sentence context (`high-risk-manual-review.csv`): 2 matched an already-established site precedent (CONTEXTUAL — the CC 0.4/0.5 ppm distinction from Phase 7E/7F.1), 9 were product-composition/purity claims outside the target-range registry's scope (SUPPORTED, cross-checked for internal consistency), 3 were dose-response claims verified to match `scripts/data/formulas-data.js`'s own existing formula text verbatim (SUPPORTED), 4 were illustrative examples/comparison references inside mechanism explanations, not target claims (NON_CLAIM), and 3 were genuine registry-coverage gaps (REQUIRES_REVIEW, not contradictions). **0 genuine numeric contradictions found in the entity corpus.** Final distribution: 291 REQUIRES_REVIEW, 32 AMBIGUOUS, 20 DIRECTLY_SUPPORTED, 10 SUPPORTED, 8 SUPPORTED_BY_CONTEXT, 8 NO_EXISTING_SOURCE, 5 NON_CLAIM, 3 CONTEXTUAL, 1 NOT_APPLICABLE.

## High-Risk Review

All 38 safety claims scanned; one HIGH-risk chemical-handling claim (trichlor + calcium hypochlorite mixing hazard) individually researched against 4 real sources (2 fetched and read directly, 2 blocked). Could not independently pin the exact claim to one verified source today — dispositioned REQUIRES_REVIEW rather than fabricating support. Full detail in `SOURCE-RESEARCH.md`.

## Material-Specific Claims

Fiberglass/vinyl/concrete pool-type entities' material-property claims (gelcoat leaching, liner bleaching, refinishing limits) individually reviewed and confirmed to be a distinct evidence domain from `chemistry-ranges.js` (materials science vs. water chemistry) — not conflated, not fabricated a materials source for. **fiberglass-pool and vinyl-pool explicitly reviewed**: both entities' numeric calcium-hardness claims (150-250 ppm) are DIRECTLY_SUPPORTED by the existing ANSI/PHTA-11 registry range; their qualitative material claims are plausible, internally consistent with each other and with concrete-pool's parallel claims, and logged REQUIRES_REVIEW for future materials-source verification.

## Production Corrections

**None.** Zero entity pages had visible content modified this phase — no claim was found demonstrably incorrect, unsafe, or contradicted by evidence.

## Citations

No production citations rendered this phase. No claim met all four bars (important + verified + directly supporting + useful to the reader) required before rendering a citation.

## Entity Schema

Unchanged — no entity page HTML was modified, so `DefinedTerm`/canonical/visible-content alignment established in Phase 7H remains exactly as it was.

## AEO

Unchanged — no new answer blocks added, nothing repeated for AEO purposes.

## Duplication

Entities family: still LOW risk, avg_pairwise_similarity 0.201 (byte-identical to Phase 7I's report — confirms no shared boilerplate was introduced).

## Validators

`scripts/validate-entity-provenance.js` (new): **PASS — 104 entities, 378 claims, 0 critical, 7 warnings** (numeric claims with no unit, e.g. LSI index values — expected, not defects).

## Regression

All prior-phase validators (7B–7I) plus broken-links, URL-engine, and existing trust: **all PASS.** Forensic re-audit numbers identical to the Phase 7J baseline in every metric (pages, sitemap, schema, accessibility, content-quality, cannibalization) — zero drift.

## Reproducibility

Two-build comparison, scoped specifically to entities/glossary output: hashes differ, but the diff is **0 non-whitespace, non-footer-churn lines** — confirmed to be exactly the same inherited, previously-disclosed non-idempotent footer-injection artifact from Phase 7H/7I, not new instability and not affecting any entity content or provenance data.

## Scope Control

No Spanish/French, no AdSense, `js/calc-utils.js` untouched, no URL/redirect/sitemap architecture changes, `scripts/generators/*` (Phase 7G) untouched, sitemap stable at 479 URLs, no fake authors/reviewers/authority, no fabricated sources (verified — see `SOURCE-RESEARCH.md`), no mass entity rewrite (0 pages changed).

## Remaining Review Queue

- 61 of 104 entities classified `RESEARCH REQUIRED` (unresolved HIGH-priority claims) — none known-incorrect, all pending independent verification. Full list: `entity-provenance-decisions.csv`.
- Trichlor/calcium-hypochlorite mixing-hazard claim: verification attempted, not completed (4 sources checked, none conclusive).
- Routine/algae-recovery shock-dosing figures (10 ppm / 30 ppm): genuine `chemistry-ranges.js` coverage gap identified.
- Material-science claims for fiberglass/vinyl/concrete: plausible, not independently source-verified this phase.
- 1 extraction-attribution limitation discovered (`ec-stabilizer-0338`, proximity heuristic).
- 13 entities with cosmetic alias/synonym self-duplication (not changed, not incorrect).
- Inherited infrastructure nondeterminism (unchanged from Phase 7H/7I disclosure).
- 77 remaining sitewide TITLE_TOO_LONG findings, out of Phase 7I/7J's scope.

## Phase 7K Decision

**GO** — with the review queue above carried forward.

**DO NOT BEGIN PHASE 7K AUTOMATICALLY.**

END PHASE 7J
