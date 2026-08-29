# Phase 7Q -- Research Log

All research below was performed via live web search/fetch on 2026-08-28. No search-volume or GSC data is claimed or implied anywhere. Every source that ended up cited in production was fetched and read in full (not a search-snippet paraphrase) before being registered.

## 1. Water-replacement entity (Priority A)

**Query:** `PHTA fact sheet total dissolved solids pool water replacement drain` (WebSearch)

**Source read in full (6 pages):** [Water Conservation During Droughts](https://www.phta.org/pub/?id=50ffe77d-1866-daac-99fb-9719108d1367) -- PHTA Recreational Water Quality Committee fact sheet, December 2021. Fetched as a PDF and read completely via the PDF reader (WebFetch could not parse the binary PDF as text).

**What it establishes:** States "the 1,500 ppm TDS increase limit" as the recognized water-replacement trigger -- an exact match for this site's existing hot-tub TDS-over-baseline figure. States high CYA should be reduced by draining and replacing water, and cites ANSI/APSP-11's 100 ppm CYA maximum (30-50 ppm ideal). Also documents, in Section VI, that calcium hypochlorite adds "0.8 ppm of calcium hardness... for each ppm of available chlorine added" -- independently useful for the calcium-hypochlorite entity (see below) -- and, in Section VII.E, states pool covers reduce chemical consumption "by up to 60%" and heating costs "by up to 70%," while cautioning that solid covers increase combined-chlorine/disinfection-byproduct buildup by limiting air exchange, an effect "more severe and noticeable at indoor pools and spas."

**What it does NOT establish:** No specific pool (non-drought) absolute TDS ppm trigger, no specific calcium-hardness ppm drain trigger, no confirmation of this site's existing "CYA above 80 ppm" or "calcium above 500 ppm" figures. These were NOT treated as confirmed by this citation -- see the explicit scoping note rendered on `entities/water-replacement.html`.

## 2. Covered-pool chemistry (Priority B)

Serendipitously resolved by the same source above (Section VII.E). This is a genuine primary industry-standard source -- the evidence-tier bar Phase 7P's research could not clear (that pass found only pool-cover retailer/installer marketing content with unattributable percentage claims). The new source gives real, attributable, if rounded ("up to X%"), figures alongside an important tradeoff (DBP/combined-chlorine buildup) that the marketing-tier sources omitted entirely. Reclassified from DEFER to RESOLVED (EXPAND existing entity, no new page) on this basis.

## 3. Calcium hypochlorite entity (Priority F / citation coverage)

**Query:** `PHTA fact sheet shock treatment superchlorination routine pool ppm` (WebSearch), then fetched the top PHTA result in full.

**Source read in full (3 pages):** [Calcium Hypochlorite](https://www.phta.org/pub/?id=07FD3498-1866-DAAC-99FB-8824A8F3147B) -- PHTA Recreational Water Quality Committee fact sheet, revised August 2021.

**What it establishes:** Quantifies calcium addition (0.8 ppm hardness per ppm FAC), states routine FAC targets of 1.0-4.0 ppm (pools) / 2.0-5.0 ppm (spas) specifically for this product, and states calcium hypochlorite "shall not be mixed with other pool chemicals including other chlorinating agents" -- independently corroborating, from a second and different source type (industry-standard fact sheet vs. the manufacturer SDS documents already cited on `entities/trichlor-tablets.html`), the trichlor/cal-hypo mixing hazard Phase 7K resolved.

**What it does NOT establish -- and the important negative finding this phase's due diligence produced:** The WebSearch tool's own synthesized summary claimed this class of PHTA source states shock/superchlorination dosage as "approximately 10-20 ppm." Reading the actual fact sheet in full showed this is **false as applied to this document** -- it explicitly states "Label use instructions will similarly define dosage requirements for other product applications such as oxidation, shock treatment, or superchlorination," deferring to individual product labels rather than stating a number. The routine-maintenance shock-dosing disagreement (2-5 ppm vs. 10-20 ppm, per Phase 7K's `SHOCK-EVIDENCE.md`) is confirmed still unresolved by this specific, most-likely candidate. This is exactly the kind of misattribution the project's "read the source, don't trust the summary" discipline exists to catch, and it did.

## 4. Forensic-audit AUTHORITY_RE domain fix (Priority H)

No external research needed -- the fix consisted of enumerating the domains already present and verified in `scripts/data/chemistry-sources.js` (`node -e` domain extraction) and cross-checking each against its registered `source_type`/`authority_level` before adding it to the regex. Before/after measured on the identical current repository state (same 416 major-factual-page denominator):

| | Pages with zero recognized external authority citations | Denominator |
|---|---|---|
| Before (original regex) | 416 | 416 |
| After (Phase 7Q regex) | 402 | 416 |

14 pages newly recognized: the 5 entity citations from Phase 7K/7L (trichlor-tablets, green-water, shock-treatment, temperature, vinyl-pool) plus this phase's 3 new entity citations (water-replacement, cover, calcium-hypochlorite), plus calculator/chart/programmatic pages that share the now-recognized `poolspanews.com` source across the 6-page shock cluster and `phta.org`-sourced calculator/chart citations from Phase 7E/7L.

This is a metric-definition change effective for this and future runs only. It does not retroactively alter what any earlier phase's own published report said at the time -- Phase 7L's report correctly said 413/413 (its own denominator) under the regex that existed then, and that historical record is left untouched.

## 5. Build nondeterminism root-cause investigation (Priority I)

No external research -- an internal empirical bisection of the generator pipeline (`scripts/run-all-generators.js`), run script-by-script against a git-clean checkout of `entities/algae.html`, comparing footer-line leading-whitespace character count and total line count after each step.

**Method:** Ran every individual generator script between `inject-footer.js` and the end of the pipeline in isolation; all were stable (no change). Traced the actual drift to the combination of `scripts/generate-entities.js` (a data-regeneration step) followed by the **second** of `generate-entity-pages.js`'s two invocations in `run-all-generators.js` (it runs once early, before `inject-entity-schema.js`, and again later, after `generate-entities.js`). The second invocation fully re-renders each entity page from its own template, and that render's own baseline whitespace differs slightly from what the many injector scripts that ran between the two invocations had left in place -- producing the observed drift.

**Verified NOT a defect:** confirmed entity schema (`DefinedTerm` JSON-LD) survives both invocations correctly (present before and after), so this is cosmetic (whitespace/line-count only), not a content-loss bug.

**Why not fixed:** fixing safely requires reconciling why `generate-entity-pages.js` runs twice at all (removing either call risks silently discarding whatever the other pipeline stage between the two calls was relying on regenerating entity pages to pick up) -- genuine template/pipeline-architecture work, not a "small, deterministic source-level fix." Per the Director's explicit stop rule, this is documented and DEFERRED rather than patched under time pressure.

## 6. Legacy sitemap generator and academy duplicate-id (Priorities J/K)

No external research -- internal code-reference tracing only (`grep`/`git log`, and following `generate-entity-pages.js`'s `articleById` lookup usage). See `PRODUCTION-CHANGES.md` for what was found and fixed.

## Web sources fetched but NOT cited in production (for full transparency)

- `https://www.nptpool.com/pool-finishes/start-up-procedure/` -- HTTP 403 during a Phase 7P search resurfaced this phase; not accessed, not cited (unchanged from 7P).
