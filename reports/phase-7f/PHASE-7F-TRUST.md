# Phase 7F — Trust, Editorial Authority & E-E-A-T Layer

**Status: PASS WITH REVIEW QUEUE**

## 1. Ownership & Editorial Identity

Audited before creating anything new (per the brief's explicit instruction). Found comprehensive, already-real infrastructure: `legal/ownership.html` (Albor Digital LLC, Wyoming, contact@waterbalancetools.com), `about/index.html`, `legal/legal.html`, and full `methodology/` (7 pages) and `editorial/` (6 pages) directories. **No duplicate pages created.** One correction made to `about/index.html`'s Methodology section (see Trust Language Audit). Full detail: `EDITORIAL-IDENTITY.md`.

## 2. Methodology

Already comprehensive and accurate — audited, no new page created, no changes needed beyond the About-page cross-reference already covered above.

## 3. Calculator Methodology

The existing Trust Panel (formula/dataset version, confidence badge, last-reviewed date, links to Assumptions/Known Limitations/Rounding Policy) already **is** the reusable calculator trust block the brief asks for. Rather than build a duplicate block, this phase corrected its **accuracy**: 6 of 11 formula records (chlorine dose, shock dose, alkalinity, salt, CYA, calcium hardness dosing) and 8 of 11 calculator-level records were downgraded from `high`/`industry-standards` to `limited`/`internal-dataset`, with an explicit note distinguishing the independently-supported *target range* from the *unverified dosing coefficient* — matching Phase 7E's independent calculator audit. No calculator formula was modified. Full detail: `CALCULATOR-METHODOLOGY.md`.

## 4. Editorial Review System

Already comprehensive (`editorial/editorial-policy`, `review-process`, `correction-policy`, `content-standards`, `update-policy`). **One factual correction made**: the Editorial Policy's claim "Claims without a traceable source are not published" was contradicted by Phase 7E's own findings and corrected to accurately describe an ongoing, incomplete process. OLD/NEW/SOURCE/REASON documented in `EDITORIAL-IDENTITY.md`.

## 5. Author / Reviewer Architecture

**Zero** author bylines, reviewer names, or Person schema exist anywhere on the site — confirmed by full-site scan, not assumed. **Decision: do not introduce an "Editorial Team" identity this phase** — that is a real business decision for the site operator, not something to assert unilaterally. The honest current state is disclosed rather than papered over.

## 6. Trust Signals

Tier 1 (calculators, authority charts, methodology, editorial policy, ownership) — Trust Panel present sitewide on calculators (pre-existing), corrected for accuracy; 4 pages carry real external-source citations (Phase 7E, confirmed still live). Tier 2/3 — audited, not mass-injected, per explicit instruction. Full detail: `TRUST-COVERAGE.md`.

## 7. Entity / Schema

Single canonical Organization entity (`index.html`), not duplicated. **One defect found and corrected**: the Organization schema's `logo` field referenced a non-existent file (`/logo.png`); corrected to the real, live logo (`/public/logo.svg`) in `index.html` and `components/global-schema.html`. No Person schema, no `sameAs`, no misleading Medical/Scholarly/Review/NewsArticle schema anywhere — confirmed by scan, not assumed.

## 8. Trust Language Audit

Full sitewide scan (550 files) for the dangerous-phrase list (expert reviewed, scientifically proven/verified, doctor/professional approved, CDC/PHTA approved, certified by, official source): **0 occurrences**. "certified" (484 occurrences) and "industry standard" (7 occurrences) sampled and classified SUPPORTED (benign usage) with one already-corrected exception. Full detail, including the two POTENTIALLY_MISLEADING findings corrected this phase (Trust Panel confidence claims, Editorial Policy evidence standard): `TRUST-LANGUAGE-AUDIT.md`.

## 9. Contact / Corrections

`contact@waterbalancetools.com` confirmed present and correctly formatted on `legal/ownership.html`. No response-time promise made (none exists to promise). Correction mechanism already described in `editorial/correction-policy`.

## 10. Validation

New `scripts/validate-trust-layer.js`: **PASS** — 550 files scanned, 0 violations, 0 warnings (dangerous language, malformed contact data, Person/medical schema misuse, broken Organization logo, contradictory dates, duplicate editorial/methodology slugs, un-vetted trust-citation blocks). Existing `scripts/validate-trust.js` (Scientific Authority System internal consistency): **PASS**, 0 errors, 0 warnings, and confirms all corrected confidence-level values are still valid enum members.

## 11. Regression

`npm run build`, Phase 7B/7C/7D validators, Phase 7D.2 golden-set-v2/status-integrity, Phase 7D.3 dataset validator, Phase 7E provenance validator, Phase 7E.1 provenance-resolution validator, broken-link validator, URL-engine tests, both trust validators — **all PASS**.

## 12. Scope Control

Confirmed: no Spanish/French, no URL/canonical/redirect/sitemap-architecture change (existing pre-documented build-regeneration churn only), no calculator-formula change (`js/calc-utils.js` untouched), no AdSense change, no broad content rewrite, no reports/audit/qa pages indexed. Page count unchanged (523).

## Remaining Review Queue (unchanged from Phase 7E.1, carried forward)

267 Tier-1 high-value evidence records, 185 source-search candidates, 133 unclassified conflicts, 5 genuine source conflicts requiring editorial decision (combined chlorine 0.5-vs-0.4 ppm; Hot Tub Chemical Levels Chart CYA guidance) — preserved, not resolved by this phase.

## Phase 7G Decision

**NO-GO — pending user review**, per this phase's own instruction not to proceed automatically.

DO NOT BEGIN PHASE 7G.

## Reports

- `reports/phase-7f/PHASE-7F-TRUST.md` / `.json` (this report)
- `reports/phase-7f/TRUST-LANGUAGE-AUDIT.md`
- `reports/phase-7f/TRUST-COVERAGE.md`
- `reports/phase-7f/EDITORIAL-IDENTITY.md`
- `reports/phase-7f/CALCULATOR-METHODOLOGY.md`
- `reports/phase-7f/trust-layer-validation-results.json`
- `scripts/validate-trust-layer.js`
- `scripts/data/trust-formulas.js`, `trust-calculator-metadata.js`, `trust-editorial.js` (corrected confidence levels + evidence-standard wording)
- `about/index.html`, `index.html`, `components/global-schema.html` (corrected wording + broken logo reference)
