# Phase 7R -- Research Report

All research below was performed via live web search/fetch on 2026-08-28/29. No search-volume or GSC data is used anywhere. Every source cited in production was fetched and read in full (not a search-snippet paraphrase) before being registered in `scripts/data/chemistry-sources.js`.

## 1. Executive Findings

- Found a genuine government/public-health-authority primary source (Indiana Department of Health) that directly confirms the site's separately-modeled breakpoint-chlorination rule of thumb (10x combined chlorine), upgrading it from REQUIRES_REVIEW (zero sources since Phase 7E) to SUPPORTED, and used the same source to close 2 more items in the remaining entity-provenance queue.
- The same source, read in full, does **not** resolve the routine-maintenance shock-dosing disagreement (2-5ppm vs. 10-20ppm) -- it explicitly states no general absolute ppm target, only the breakpoint ratio. This is an important negative result, not a gap in this phase's search effort.
- **Discovered two previously-undetected, genuine calculator/formula-documentation defects** while auditing calculator provenance: `formulas/liquid-chlorine-formula.html`'s worked example is internally self-contradictory (its own text says "Wait -- that looks wrong. Let's recheck.") and its documented equation does not reconcile with the live calculator's actual constant (a ~1,000,000x discrepancy); `formulas/lsi-formula.html`'s worked example computes three different LSI values for identical inputs. A third, milder instance was found in `formulas/alkalinity-formula.html` (a numeric constant mismatch between the live calculator and the page's own explanation text: 1.4 vs. 1.5). None of these were corrected this phase -- see Section 4 and the Decision Matrix for why.
- Confirmed the LSI "calculator" has no actual implementation anywhere in the client-side JS layer -- the standing "no new standalone LSI calculator" decision is not merely conservative, it reflects a genuinely incomplete underlying implementation (no lookup-table data exists in the codebase at all).
- Caught and rejected a web-search-tool hallucination: an AI-generated search summary claimed a specific PHTA fact sheet states a "500ppm" calcium-hardness water-replacement threshold; that exact document had already been read in full in Phase 7Q and does not contain this figure. Recorded explicitly as a caught false claim, not adopted as evidence.
- Water-replacement's three specific numeric thresholds (CYA 80ppm, calcium 500ppm, pool TDS 3000ppm) remain unresolved after a further bounded search this phase; each was evaluated against the explicit REMOVE option and DEFER (keep, don't remove, don't invent a replacement) was chosen for all three, with reasoning recorded per-claim in `EVIDENCE-LEDGER.csv`.
- Material-science claims (vinyl, fiberglass, concrete) and the two architecturally-blocked authority-chart citations were re-verified unchanged from Phase 7K/7L/7Q -- no new evidence found or needed this phase.

## 2. Routine Shock Dosing

See `EVIDENCE-LEDGER.csv` rows `routine-maintenance-shock-2-5ppm`, `routine-maintenance-shock-10-20ppm`, `routine-shock-checked-against-phta-calhypo`, `routine-shock-checked-against-in-doh`.

The disagreement is between two professional trade sources already in the registry (Pool & Spa News/Taylor Technologies, 2016: "2-5 ppm"; AQUA Magazine/HASA, 2020: "10-20 ppm"). This phase re-examined whether the disagreement could be explained by different environments, sanitizers, scenarios, or measurement definitions, per the Anti-Hallucination Rule's explicit checklist:

- **Different environment?** No -- both describe general residential pool shock/superchlorination.
- **Different sanitizer?** No -- neither is sanitizer-specific.
- **Different scenario?** Partially suggestive but not confirmed: the 2016 source frames its figure as "general water cleanup" (implicitly light/frequent), while the 2020 source uses the more clinical term "superchlorination" and explicitly states it does NOT separately distinguish routine maintenance from algae-specific dosing. This is *suggestive* of an intensity-tier distinction (light routine oxidation vs. a stronger periodic superchlorination) but neither source states this framework itself -- encoding it as fact would be inference, not sourced evidence, so it was not adopted.
- **Different measurement definition?** No indication of this in either source.
- **Different regulatory context?** No -- both are residential-guidance-oriented, not public-facility code citations.

Two additional sources were checked this phase specifically to see if either resolves the gap:

1. PHTA "Calcium Hypochlorite" fact sheet (2021, read in full): explicitly states routine sanitizing FAC targets (1.0-4.0ppm pools / 2.0-5.0ppm spas) but for shock/superchlorination/oxidation applications explicitly says "Label use instructions will similarly define dosage requirements" -- deferring to individual product labels rather than stating a number.
2. Indiana Department of Health "How To Shock The Pool" (2022, read in full, 12 pages): a genuine government/public-health-authority document. States only the breakpoint chlorination RATIO (10x measured combined chlorine) and a regulatory combined-chlorine trigger (0.5ppm, from Indiana's own pool code) -- never a general residential absolute shock-ppm target independent of a measured CC reading.

**Conclusion: the disagreement remains genuine and unresolved.** REQUIRES_REVIEW is preserved for both figures. This is treated as a successful, scientifically honest outcome per this phase's explicit acceptance criteria, not a research shortfall -- the highest-tier source category (government) was checked and confirmed unhelpful for this specific question.

## 3. Water Replacement

See `EVIDENCE-LEDGER.csv` rows for `water-replacement-tds-hottub-1500ppm` (already resolved, re-verified unchanged) and the three still-open thresholds.

The 1,500ppm hot-tub TDS-increase trigger remains SUPPORTED (Phase 7Q, PHTA Water Conservation fact sheet) and was re-verified live this phase with no drift.

For the three specific thresholds still open (CYA 80ppm, calcium 500ppm, pool TDS 3000ppm):

- Two fresh, targeted searches were run this phase ("PHTA fact sheet total dissolved solids pool water replacement drain" and "PHTA fact sheet calcium hardness pool drain threshold ppm").
- Neither surfaced a primary source stating these exact figures. The closest authoritative figures found are different numbers for different purposes: ANSI/APSP-11's 100ppm CYA regulatory maximum (30-50ppm ideal) and 150-1,000ppm calcium acceptable range for public pools -- both wider-scope standards-body ceilings, not the site's narrower residential drain-trigger heuristics.
- One search result's AI-generated summary claimed the calcium threshold was "500ppm" and attributed it to the PHTA drought fact sheet. That exact document was already read in full during Phase 7Q; it does not contain this figure. This is recorded as a caught hallucination per Section 29's explicit instruction not to convert an unverifiable AI summary into evidence.

**Production action: DEFER for all three, KEEP the existing numbers (not REMOVE, not REPLACE).** Section 6 of the brief explicitly raises removal as an option when no source supports a number; this was seriously considered for all three. The decision to keep rather than remove: each figure is plausible and non-contradicted by any authoritative source found (all sit comfortably inside the wider standards-body ranges that do exist), and removing actionable, non-contradicted guidance to make an audit metric cleaner would itself be a content regression without a corresponding accuracy benefit -- inconsistent with this project's established minimum-necessary-change principle (see the Phase 7K fiberglass-gelcoat precedent, applied the same way here).

## 4. Calculator Provenance

Full detail in `CALCULATOR-PROVENANCE.csv`. The audit covered every function in `js/calc-utils.js` (the actual client-side calculator engine) and cross-referenced each against its corresponding `formulas-data.js` documentation page where one exists.

**Two calculator components are VERIFIED_MATH**, meaning they follow directly from a real physical/mathematical constant with no unverified domain assumption: pool/spa volume (geometry x 7.48052 gal/ft3, an exact conversion constant) and turnover rate (pure rate-time math). The salt-dosing constant (12 ppm per lb per 10,000 gal) was independently re-derived this phase from water-density math (10,000 gal x 8.34 lb/gal = 83,400 lb water; 1 lb NaCl / 83,400 lb = ~12 ppm) and confirmed to match the coded constant within rounding -- also promoted to VERIFIED_MATH.

**Everything else involving a product dose-response constant (chlorine, pH, CYA, alkalinity, shock) is a DOMAIN ASSUMPTION**, not pure math, because the relationship depends on an assumed product concentration/formulation that the site does not independently verify against a manufacturer reference. This distinction (explicitly required by Section 7) is now documented per-calculator for the first time.

**Two critical, previously-undetected internal-consistency defects were found:**

1. **Liquid chlorine formula (formula-02) vs. `calc-utils.js`'s `calculateChlorine`:** the documented equation on `formulas/liquid-chlorine-formula.html` (`fluid ounces = (Target FC - Current FC) x Volume / (Strength% x 0.0128)`) and the live calculator's actual constant (divide by 128,000 for 10% liquid) do not reconcile -- applying the documented equation as written to the page's own worked example produces ~390,625 fl oz for a 20,000-gallon pool needing a 2.5ppm increase, an obviously absurd result. The page's own text acknowledges this ("Wait -- that looks wrong. Let's recheck.") and then switches to an entirely different, undocumented "simpler form" derivation to reach a plausible final answer (13 fl oz), without ever reconciling why the stated equation doesn't work.
2. **LSI formula (formula-09):** the worked example computes LSI = 1.6 using the stated additive formula, then computes -2.2 using a different, unexplained method ("Actually: let's use typical table values... LSI = 7.4 - 9.6 = -2.2?" -- note the question mark, itself a sign of uncertainty left in published content), then finally settles on -0.2 using the original formula with different table values than the first attempt. Three different answers for one set of inputs, all published live.
3. **Alkalinity formula (formula-05), milder:** `calc-utils.js` uses 1.4 lb sodium bicarbonate per 10,000 gal per 10ppm; the page's own explanation text states 1.5 lb for the identical relationship. A ~7% discrepancy.
4. **pH adjustment formula (formula-04), milder still:** the worked example states the documented equation, computes it partway, then abandons it mid-calculation in favor of an unreferenced "commonly used rule-of-thumb" to reach its final answer, without flagging why the documented equation was set aside.

**None of these were corrected this phase.** Section 8 of the brief is explicit: "If a formula is demonstrably mathematically wrong, stop and report it before changing it unless the correction is trivial and directly supported by the existing architecture." Determining which of two internally-inconsistent numeric approaches is actually correct requires domain-expert chemistry/dosing validation this phase is not positioned to perform unilaterally -- picking one would risk exactly the kind of unauthorized, unsupported "resolution" the brief prohibits. These are reported as the single most consequential finding of this phase and flagged `REQUIRES_EXPERT_REVIEW` / high risk in the Decision Matrix, recommended for a dedicated future calculator-formula-audit phase.

The pool/hot-tub shock calculators' fixed preset tiers (Light/Standard/Heavy/Double = 5/10/15/20ppm) were also newly identified this phase as structurally unable to apply the now-SUPPORTED breakpoint-rule citation, because the calculator UI never asks for a combined-chlorine reading at all -- a genuine domain-assumption/architecture mismatch, not merely a missing citation.

## 5. Bromine

Re-confirmed via `grep` across `calculators/`, `js/calc-utils.js`, and `formulas-data.js`: no bromine calculator, dosing formula, or dosing constant exists anywhere in the codebase. Disposition: **OUT_OF_SCOPE**, unchanged from Phase 7N/7P/7Q. No coefficient was invented.

## 6. LSI

Audited (not built). `js/calc-utils.js` contains zero LSI-related code (confirmed via `grep -rl "LSI\|langelier" js/*.js` returning no results). The only LSI content on the site is the prose explainer page `formulas/lsi-formula.html`, whose worked example is internally self-contradictory (Section 4). No lookup-table data (temperature/calcium/alkalinity factor tables) exists anywhere in the codebase to power a real calculator. **The standing "no new standalone LSI calculator" decision is confirmed correct and, if anything, understated the actual gap** -- this is not "an existing calculator that could be split out," it is genuinely incomplete at the data layer. Disposition: **OUT_OF_SCOPE** for new calculator construction, unchanged; the worked-example defect is a separate REQUIRES_EXPERT_REVIEW item (Section 4).

## 7. Entity Claims

The ~54-item remaining provenance queue (Phase 7J's original 61, minus 7 closed across Phases 7K/7L/7Q) was not re-researched wholesale this phase -- that would be disproportionate, mechanical-coverage-chasing effort the brief explicitly warns against. Instead, the new Indiana DOH source (found for Priority A) was cross-referenced against the queue for genuine exact matches, surfacing 2 more: `entities/combined-chlorine.html`'s CC=TC-FC definition and 0.5ppm breakpoint trigger, and `entities/breakpoint-chlorination.html`'s 10x-combined-chlorine claim. Both closed with real citations. `entities/shock-treatment.html`'s existing citation was also extended to cover the now-SUPPORTED breakpoint-rule figure specifically, while its still-uncited routine-10ppm figure was left correctly uncited. Queue is now at approximately 52 items, continuing the incremental, evidence-driven closure pattern established in Phase 7Q.

## 8. Material Science

Re-verified live (not re-researched): vinyl-liner bleaching (SUPPORTED, CFFA source, Phase 7K), fiberglass gelcoat/calcium (CONTEXTUAL, Orenda source, Phase 7K), concrete/gunite (no dedicated claim, Phase 7K). No drift found on any of the three. No new material-science research was performed this phase -- none of this phase's new chemistry sources (all shock/combined-chlorine/breakpoint focused) apply to a material-property claim, so there was nothing new to evaluate.

## 9. Citation Architecture

The two architecturally-blocked authority charts (`hot-tub-chemical-levels-chart.html`, `salt-water-pool-chemical-levels-chart.html`) were re-reviewed against the current citation-rendering mechanism (`scripts/phase-7e/inject-calculator-sources.js`'s marker-comment injection, one block per page). It still cannot express row-A-supported/row-B-unsupported distinctions without a template change. Per Section 13's explicit guidance ("do not build a one-off chart hack... if a minimal row-level citation mechanism can be introduced safely and generically, document the architecture before implementing it"), and because designing a generic per-row citation mechanism is itself non-trivial template-architecture work outside a provenance-focused phase's scope, the outcome is **ARCHITECTURALLY_BLOCKED** -- explicitly sanctioned as acceptable by the brief. No mechanism was designed or implemented this phase.

## 10. Source-Quality Observations

- The Indiana DOH document is a strong, clean example of a government/public-health-authority primary source: it names its issuing division, cites its own enabling regulation by section number, and provides fully worked numeric examples consistent throughout.
- The PHTA Calcium Hypochlorite fact sheet's explicit deferral to product labels for shock dosage is itself a useful negative data point -- it demonstrates that even a high-tier industry-standards body does not consider a general residential shock ppm target to be settled science, reinforcing (not merely failing to resolve) the case for REQUIRES_REVIEW.
- **A WebSearch-tool AI summary was caught misattributing a specific numeric figure ("500ppm calcium threshold") to a document that does not contain it.** This is recorded explicitly per Section 29's instruction, as direct evidence the project's "read primary sources in full, never trust a search-engine summary as evidence" discipline is catching real errors, not merely a procedural formality.
- The three formula-page worked-example defects (Section 4) suggest the `formulas-data.js` content was originally authored with AI assistance and never fully proofread for internal numeric consistency -- an observation about content-production process, not a claim about which of the conflicting numbers is correct.

## 11. Unresolved Scientific Questions (carried forward)

- Routine-maintenance shock dosing (2-5ppm vs. 10-20ppm) -- genuine professional disagreement, no authoritative resolution found across 4 sources checked this phase.
- Water-replacement's 3 specific numeric thresholds (CYA 80ppm, calcium 500ppm, pool TDS 3000ppm) -- plausible, non-contradicted, but independently unconfirmed.
- The liquid-chlorine, LSI, and (milder) alkalinity/pH formula-documentation internal inconsistencies -- require domain-expert reconciliation, not resolvable by further web research alone.
- The ~52 remaining lower-priority entity-provenance claims.

## 12. Final Recommendations

1. **Highest priority for a future phase: a dedicated calculator-formula-audit phase** to reconcile the liquid-chlorine and LSI internal inconsistencies discovered this phase (and the milder alkalinity/pH ones), with actual chemistry/dosing domain-expert input -- not another automated research pass. This is now the single most concrete, actionable, well-evidenced item in the entire carry-forward queue.
2. A future, narrowly-scoped chemistry-evidence phase could specifically target manufacturer product labels (not general fact sheets) for the routine-shock and water-replacement-threshold questions, since multiple higher-tier sources have now been checked and explicitly do not address these questions themselves.
3. The citation-template architecture question (row-level chart citations) and the generator-pipeline double-execution question (entity-page whitespace) remain valid future-phase candidates but are correctly not this phase's focus.
