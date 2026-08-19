# High-Risk Chemistry Claim Provenance Review

Population: 792 evaluated claims mechanically classified as SOURCE_CONFLICT / SOURCE_NOT_FOUND / REQUIRES_EXPERT_REVIEW / SOURCE_PARTIALLY_RELEVANT (from the 819-record review queue; 27 were reclassified to NOT_A_TRUE_CHEMISTRY_CLAIM by the finer `claim_type` filter — see `provenance-mapping.csv`). Full population written to `high-risk-provenance.csv`. **43 records were individually hand-reviewed** (real source text read, real reasoning), stratified across the 12 priority categories; the rest carry the mechanical classification described in `build-provenance.js`, disclosed as `source_support = MECHANICAL_CLASSIFICATION_ONLY`, not fabricated individual research.

This is not an attempt to scientifically resolve all 792 records — per the brief, that is explicitly out of scope for this phase. It is a **triage and pattern-finding pass**, prioritized by the 12 categories named in the brief.

## One live source verification, and one real correction

**Combined chlorine: 0.5 ppm vs. 0.4 ppm.** Many pages (`glossary/pool-shock-schedule.html`, `comparisons/free-chlorine-vs-total-chlorine.html`, `reference/combined-chlorine-explained.html`, `academy/hot-tubs/shock-after-heavy-use.html`, `reference/ideal-pool-levels.html`, and others) state "combined chlorine above 0.5 ppm" as the shock-treatment trigger. A live search against cdc.gov/model-aquatic-health-code (2026-08-18) confirms MAHC's actual public-pool action threshold is **0.4 ppm**. `chemistry-ranges.js`'s `range-cc-pool-hottub-max` was REQUIRES_REVIEW pending exactly this confirmation; it is now upgraded to **SUPPORTED** (and `claim-cc-minimize` in `chemistry-claims.js` accordingly). The site's "0.5 ppm" figure is a widely-repeated consumer/industry rule-of-thumb, not necessarily wrong for residential use, but it does not match the regulatory public-pool figure it's sometimes presented alongside. Per the Content Correction Rule, **production content was not rewritten** — this is flagged as `CONFLICTING` for editorial review, with the specific discrepancy documented for whoever makes that call.

## Pattern findings (not individual claim errors)

**1. Missing shock-treatment numeric range (affects ~9 of the sampled records).** Several free_chlorine and combined_chlorine "high-risk" values (10 ppm, 30 ppm shock targets; 5-15 ppm breakpoint-dose additions) are correctly, intentionally outside the *routine-maintenance* range they're being checked against — because `chemistry-ranges.js` has no numeric shock-treatment FC range at all (`range-shock-breakpoint-rule-of-thumb` has `minimum: null, maximum: null`). These are architecture gaps, not factual errors: the claim family being checked is wrong, not the claim. **Recommendation for a future phase:** research and add a numeric shock-treatment FC range (CDC/MAHC breakpoint chlorination guidance exists for this) so shock-scenario claims stop landing in the review queue by default.

**2. Product specifications mistaken for water targets.** Several claims state a *product's* concentration (10-12.5% sodium hypochlorite solution, ~54% BCDMH tablet content, ~58% trichlor CYA-by-weight, 31.45% muriatic acid) — these are manufacturer datasheet facts about the chemical *product*, not pool/spa *water* targets, and were never comparable to a water-chemistry range in the first place. No action needed; flagged so a future citation pass doesn't try to cite a water-quality source for a product spec.

**3. Threshold/troubleshooting values correctly outside the target range by design.** "TA reads above 150 ppm" (a too-high symptom), "CYA can reach 80-100 ppm" (a too-high troubleshooting scenario), "above 100 ppm: partial drain" (a remediation trigger) are all *intentionally* outside their target ranges — that's the premise of the sentence. Not conflicts.

**4. A residual extraction limitation, found here for the first time.** `reference/ideal-spa-levels.html`'s multi-column table ("Free Chlorine 2.0 3-5 10 ppm | Bromine 3.0 3-6 8 ppm") produced a bromine=10ppm record — but 10 is Free Chlorine's own maximum column, not Bromine's. Proximity-based extraction can cross-attribute values between adjacent table cells in tabular content; this is a new, real, disclosed finding from this review (not fixed here — out of Phase 7E's scope, flagged for a future extraction-phase pass on tabular content specifically).

**5. Water temperature and salt have no primary numeric-target source in the registry.** Every `water_temperature` and most `salt` high-risk records resolve to `SOURCE_NOT_FOUND` for the same honest reason already disclosed in Phase 7D: CDC guidance discusses temperature's *effect* on chemistry, not a temperature target to maintain; salt targets are equipment/manufacturer-specific and Phase 7D's source-selection policy declined to guess a generic figure. Confirmed unresolved, not corrected by inventing a source.

## Priority-category coverage in the hand-reviewed sample

| Category | Records reviewed |
|---|---:|
| Sanitizer target ranges (free_chlorine, combined_chlorine, sanitizer, bromine) | 15 |
| pH targets | 5 |
| Total alkalinity | 6 |
| Cyanuric acid | 4 |
| Calcium hardness | 0 (queue for this parameter is dominated by product/table-cell noise similar to patterns 2-3 above; not separately narrated) |
| Saltwater-pool targets | 2 |
| Hot-tub sanitizer ranges | included above (bromine, hot-tub FC) |
| Temperature-dependent chemistry | 5 |
| Shock-treatment guidance | included above (pattern 1) |
| Chlorine-loss explanations | covered via the CC 0.4/0.5 finding |
| Safety claims | none in this sample required review (safety claims mostly have no numeric value in dispute — see Phase 7D.2's `SAFE1`/`SAFE2` golden-set cases) |
| Calculator assumptions | see `CALCULATOR-PROVENANCE.md` |

Full detail for all 792 records (43 hand-reviewed + 749 mechanically classified with disclosed reasoning): `high-risk-provenance.csv`.
