# Phase 7R -- Production Changes

Every change was made at the smallest authoritative source (chemistry-sources.js / chemistry-claims.js / chemistry-ranges.js / data files / the existing entity-citation generator), never by hand-patching generated HTML. Zero calculator formulas (`js/calc-utils.js`), zero URLs, zero redirects, zero programmatic-family generators were touched.

## FILE: scripts/data/chemistry-sources.js

**OLD:** 18 registered sources.
**NEW:** 19 registered sources -- added `in-doh-breakpoint-chlorination-2022` (Indiana Department of Health, "How To Shock The Pool (Chlorinate To Breakpoint)," 2022).
**SOURCE:** https://www.in.gov/health/eph/files/How-To-Shock-The-Pool-2022.pdf -- fetched as PDF and read in full (12 pages) on 2026-08-28.
**REASON:** Government/public-health-authority primary source directly confirming the site's existing breakpoint-rule and combined-chlorine claims, which had zero source_ids since Phase 7E.
**RISK:** Low -- additive registry entry, matches established schema exactly, does not alter any existing record.
**VALIDATION:** `validate-chemistry-knowledge.js` PASS (19 sources, 0 structural errors); no new orphan-source warning.

## FILE: scripts/data/chemistry-claims.js

**OLD:** `claim-shock-breakpoint-rule`: `source_ids: [], status: 'REQUIRES_REVIEW'`.
**NEW:** `source_ids: ['in-doh-breakpoint-chlorination-2022'], status: 'SUPPORTED'`.
**SOURCE:** Same Indiana DOH document -- states "The breakpoint chlorination value is 10 times the combined chlorine (CC) level," an almost verbatim match to the claim text.
**REASON:** Genuine, direct, government-tier primary-source support found this phase; no other field of the claim record altered.
**RISK:** Low -- this is exactly the intended mechanism for a claim to move from REQUIRES_REVIEW to SUPPORTED once real evidence is found.
**VALIDATION:** `validate-chemistry-knowledge.js` PASS.

## FILE: scripts/data/chemistry-ranges.js

**OLD:** `range-shock-breakpoint-rule-of-thumb`: `source_ids: [], status: 'REQUIRES_REVIEW', reviewed_date: '2026-08-18'`.
**NEW:** `source_ids: ['in-doh-breakpoint-chlorination-2022'], status: 'SUPPORTED', reviewed_date: '2026-08-29'`, rationale text extended with the source's exact wording.
**SOURCE:** Same as above.
**REASON:** Companion record to the claim update above; the range's `minimum/maximum/target: null, unit: 'multiplier_of_combined_chlorine'` structure was NOT changed -- the source confirms this is correctly modeled as a ratio, not an absolute ppm range, so the architecture itself required no change.
**RISK:** Low.
**VALIDATION:** `validate-chemistry-knowledge.js` PASS; no orphan-range warning for this record.

## FILE: scripts/generate-entity-pages.js (ENTITY_CITATIONS map)

**OLD:** No entry for `combined-chlorine` or `breakpoint-chlorination`; `shock-treatment` cited only `poolspanews-algae-breakpoint-2016`.
**NEW:** Added `combined-chlorine` (cites `in-doh-breakpoint-chlorination-2022`) and `breakpoint-chlorination` (cites the same source); extended `shock-treatment`'s `sourceIds` to include the new source alongside its existing `claimIds`-derived source, with an updated scoping note.
**SOURCE:** Same Indiana DOH document, applied to 3 distinct pages where it directly and exactly supports what each page already states.
**REASON:** Closes 2 items in the remaining entity-provenance queue and extends `shock-treatment`'s citation to cover a claim that just became SUPPORTED, without touching the still-genuinely-uncited routine-10ppm figure on that same page.
**RISK:** Low -- purely additive citation rendering, no prose claim text changed on any of the 3 pages.
**VALIDATION:** `validate-citation-coverage.js` PASS (23 blocks / 29 links, up from 21/26); regenerated via `node scripts/generate-entity-pages.js` and spot-checked live HTML output on all 3 pages.

## FILE: data/academy.json (breakpoint-chlorination article)

**OLD:** `sources: ["Pool & Hot Tub Alliance — Pool & Spa Operator Handbook, 2022", "Taylor Technologies — Pool/Spa Water Chemistry Reference"]`.
**NEW:** Added a third entry: `"Indiana Department of Health, Environmental Public Health Division — How To Shock The Pool (Chlorinate To Breakpoint), 2022"`.
**SOURCE:** Same document.
**REASON:** This academy article states the identical breakpoint-rule claim in its own prose; matches the plain-text citation convention this generator already uses for every other academy article (not the newer linked `knowledge-sources-real` mechanism, which this generator's schema does not support).
**RISK:** Low -- additive string in an existing array field.
**VALIDATION:** Regenerated via `node scripts/generate-academy.js`; spot-checked rendered output.

## Not changed

- `js/calc-utils.js` -- no calculator formula or constant modified, despite discovering 3 internal-consistency defects (see `RESEARCH.md` Section 4). Explicitly reported, not corrected, per Section 8's stop-rule.
- `scripts/data/formulas-data.js` -- same reasoning; the self-contradictory worked-example text on formula-02 and formula-09 was left as-is rather than risk an uninformed rewrite.
- `entities/water-replacement.html`'s 3 specific numeric thresholds (80/500/3000ppm) -- evaluated for REMOVE per Section 6, kept unchanged (DEFER) with reasoning recorded in `EVIDENCE-LEDGER.csv`.
- No URL, redirect, programmatic-family, AdSense, or language-expansion change of any kind.
