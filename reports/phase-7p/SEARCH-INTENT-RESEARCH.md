# Phase 7P -- Search-Intent Research Log

All research below was performed via live web search/fetch on 2026-08-28. No search-volume or GSC data is claimed or implied anywhere in this document -- only observable search-result landscape (what ranks, what type of source dominates, whether a distinct intent exists).

## 1. New pool / newly plastered pool startup chemistry

**Query:** "new plaster pool startup water chemistry sequence first 30 days" (WebSearch, 2026-08-28)

Results were dominated by pool-industry trade and standards sources: PHTA (Pool & Hot Tub Alliance), NPC (National Plasterers Council), AQUA Magazine (trade publication), plus several pool-builder/retailer sites repeating the same staged procedure.

**Primary source read in full:** [Fresh Fill Water Start-Up for Plastered Pools](https://www.phta.org/pub/?id=33925d23-1866-daac-99fb-dbf23704fd63) -- PHTA Recreational Water Quality Committee fact sheet, March 2021, presenting the National Plasterers Council's 28-day fresh-fill start-up procedure. Fetched and read as a PDF in full (not a search-snippet paraphrase). Established: a precise, staged, day-by-day water-chemistry sequence (alkalinity -> pH -> calcium hardness -> chlorine -> CYA) distinct from routine seasonal reopening, with exact numeric targets and explicit restrictions (no chlorine for 48 hours, no shock for 30 days, no salt addition for 30 days on SWG pools, no heater until the plaster manufacturer's waiting period has passed).

**Attempted second source:** National Plasterers Council start-up procedure page (nptpool.com) -- returned HTTP 403, could not be read. Not cited; only the PHTA fact sheet I actually read is cited in the new page and in `scripts/data/chemistry-sources.js`.

**Intent assessment:** Distinct, repeated, well-documented user problem ("how do I start up a brand new / freshly plastered pool") that is genuinely different from "how do I reopen my pool for the season" (confirmed by direct re-read of `guides/seasonal/opening-pool-chemistry-checklist.html`, which addresses an already-cured pool only). Dominant intent is informational/procedural, and a genuinely authoritative primary source exists at the same tier this site already cites elsewhere (PHTA). **Result: CREATE** -- see `CONTENT-BLUEPRINTS.md`.

## 2. Pool cover effect on chemistry

**Query:** "pool cover effect on chlorine chemistry algae 2026" (WebSearch, 2026-08-28)

Results were dominated by pool-cover retailer/installer content marketing (system-covers.com, poolproswi.com, justcovers.com.au, cndinstallers.com) rather than government, manufacturer-technical, or industry-standards sources. Several pages cited specific percentages (e.g. "90% chlorine retention", "40% less chlorine needed at spring opening") without an identifiable independent primary source behind the number -- these read as vendor marketing claims, not verified technical data.

**Intent assessment:** A real, narrow, distinct question exists (pool covers reduce chemical consumption and UV/algae exposure) but this project's own source-priority policy (`scripts/data/chemistry-sources.js`: government-guidance > manufacturer-documentation > scientific-literature > industry-standards) does not have a corresponding authoritative tier represented in what actually ranks for this query. Writing responsibly here would mean either (a) omitting the specific numbers found in search results, leaving a thin qualitative page, or (b) finding a better-tier source not surfaced by this search pass. **Result: DEFER**, not rejected -- logged in `REVIEW-QUEUE.md` for a future phase with room for deeper sourcing.

## 3. Full water replacement / drain-and-refill chemistry

**Query:** "full drain refill pool water chemistry reset when necessary" (WebSearch, 2026-08-28)

Results dominated by pool-service-company blogs (lesliespool.com, premierpools.com, beatbot.com, minibuckettest.com, poolburg.com) -- consumer-facing, informational-intent, but consumer-blog tier rather than government/industry-standard tier. Recurring numeric thresholds across multiple independent results: CYA above ~100 ppm and/or TDS above ~2,500 ppm as triggers for a full drain; partial (25-50%) drains as the lower-risk default.

**Intent assessment:** Real, distinct intent (this is not "how do I reopen my pool" or "how do I do a new-fill startup" -- it's "when do I need to reset an existing pool's water entirely"), but the specific numeric thresholds surfacing here overlap heavily with thresholds this site's CYA/TDS-adjacent reference content is expected to already carry, meaning a new standalone page would mostly re-aggregate rather than add information. **Result: DEFER** -- logged as a light-EXPAND candidate for `entities/water-replacement.html` in a future phase, not created this phase.

## Topics reviewed via internal signals only (no external search needed)

Dichlor, calcium hypochlorite, and salt-pool week-to-week chemistry management were re-evaluated using only observable repository evidence (direct re-reading of the relevant existing pages), because the operative question for each was "does existing content already satisfy this intent," not "does external search demand exist." See `SEARCH-GAP-REVALIDATION.csv` for the evidence and reasoning on each. The bromine-dosing-calculator and standalone-LSI-calculator candidates were not researched externally this phase because both are blocked outright by Step 25's scope prohibition on calculator-formula/architecture changes, independent of any demand evidence.

## No new candidates surfaced beyond the 7N list

A repository-grounded discovery pass (Step 4) against the fresh topical map (see `CONTENT-INVENTORY.csv` cluster counts) did not surface a compelling new candidate beyond the 8 already-carried-forward gaps. Two thin clusters were specifically reviewed and closed without action:

- **Indoor pools** (2 pages: `academy/fundamentals/indoor-pool-chemistry.html` + 1 entity): a narrow, legitimately niche use case. Two pages judged plausibly sufficient for the actual scope of the topic; no evidence of an unmet sub-intent was found.
- **Bromine** (9 pages, no calculator, no dedicated chart): the calculator gap is already tracked (and blocked by scope, see above); no additional non-calculator bromine content gap was identified beyond what's already logged.
