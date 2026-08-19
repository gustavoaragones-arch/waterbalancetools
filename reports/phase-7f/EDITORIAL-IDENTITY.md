# Editorial Identity

## Ownership (7F.1) — audited, not duplicated

Real, complete ownership infrastructure already exists and required no fabrication:

- `legal/ownership.html`: operator (Albor Digital LLC), jurisdiction (Wyoming, US), operations (Canada & US), business model, contact (`contact@waterbalancetools.com`).
- `about/index.html`: site purpose, "Who Runs It," methodology summary, accuracy/disclaimer, contact pointer.
- `legal/legal.html`: terms, privacy, disclaimer (explicitly states "Nothing here is medical, legal, or professional pool or spa maintenance advice").

No duplicate ownership page was created. `about/index.html`'s Methodology section was corrected (see below); no other ownership content required a change.

## Methodology (7F.2) — already comprehensive, audited

`methodology/` already contains: `calculation-methodology`, `calculation-assumptions`, `formula-selection`, `rounding-policy`, `precision-policy`, `known-limitations`, `confidence-system` — covering source hierarchy (6-tier framework: Government Guidance, Industry Standards, Manufacturer Documentation, Scientific Literature, Educational Resources, Internal Dataset), confidence-level assignment rules, and calculator limitations. No new methodology page was created; this satisfies the brief's requirement to audit before creating.

## Editorial Review System (7F.4) — already comprehensive, one correction made

`editorial/` already contains: `editorial-policy`, `review-process`, `correction-policy`, `content-standards`, `update-policy`. **One factual correction made**: the Editorial Policy's "Evidence Standard" section previously stated "Claims without a traceable source are not published" — contradicted by Phase 7E's independent finding that most extracted chemistry claims have never been individually source-checked. Corrected in `scripts/data/trust-editorial.js` (the source data; the rendered page is generator-produced, not hand-edited) to honestly describe this as an active, ongoing goal, with the specific finding (4,686 of 5,861 unreviewed) referenced.

**OLD**: "All factual claims must be traceable to at least one of the recognized source categories... Claims without a traceable source are not published."
**NEW**: "Factual claims are checked against the recognized source categories... This is a goal the site is actively working toward, not a completed state: an internal claim-extraction and source-mapping review (2026-08-18) found that most numeric chemistry statements across the site have not yet been individually checked against a specific source, and a smaller number were found to conflict with a source once checked. Where a specific source has been confirmed, it is cited directly on the relevant page. This review is ongoing."
**SOURCE**: `reports/phase-7e/PROVENANCE-COVERAGE.md`, `reports/phase-7e-1/PHASE-7E-1-CONFLICT-RESOLUTION.md`.
**REASON**: the prior claim was factually false given our own audit evidence; leaving it unpublished would be exactly the "misleading trust claim" this phase exists to catch.

## Author / Reviewer Attribution (7F.5) — audited, correctly left empty

Full-site scan found:
- **Zero** author bylines, real or fake, anywhere on the site.
- **Zero** "Reviewed by [name]" labels.
- **Zero** Person schema.
- **Zero** placeholder names.

**Decision: do not introduce an editorial-team identity this phase.** The brief permits "Water Balance Tools Editorial Team" only if the project genuinely intends to establish that identity and it accurately describes how content is produced — that is a real product/business decision belonging to the site operator (Albor Digital LLC), not something to be asserted unilaterally by this audit phase. The correct, honest state right now is: content is programmatically generated from the canonical data layer plus editorially written articles, with no named individual or team publicly presented as author. This is disclosed here rather than filled in with an invented identity. The reviewer architecture (`author` / `reviewer` / `review_type` / `review_date` fields) already exists structurally in the trust data layer (`data/trust/formulas.json`, `datasets.json` carry `lastReviewed` dates) but has no populated `reviewer` name field anywhere — correctly so, since no individual review has occurred.

## Dates (7F.4)

Existing convention (confirmed accurate): `last-updated` meta tag = most recent structural/content update; "Last reviewed: [date]" on trust/editorial pages = most recent documented review of that page's factual/source content; dataset `version` + `lastReviewed` fields = per-dataset review tracking. No dates were changed sitewide merely for freshness — only the specific formula/calculator records and editorial-policy paragraph with a documented, evidence-based reason had their `lastReviewed` date updated (2026-08-18), matching the actual date of this phase's review.

## Organization Schema (7F.7)

Single canonical Organization entity (`index.html`, name "Water Balance Tools", `parentOrganization` → Albor Digital LLC) — confirmed not duplicated elsewhere. **One defect found and corrected**: the `logo` field referenced `https://waterbalancetools.com/logo.png`, a file that does not exist. Corrected to the real, live logo (`/public/logo.svg`) in both `index.html` and `components/global-schema.html`. No `sameAs` URLs exist (no invented social profiles). No Person schema exists.
