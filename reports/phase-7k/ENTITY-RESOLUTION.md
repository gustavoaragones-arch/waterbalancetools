# Phase 7K — Entity Claim Resolution & Systematic Review

## Resolved this phase (real research, real sources)

| Claim | Entity | Old status | New status | Evidence |
|---|---|---|---|---|
| `ec-trichlor-tablets-0313` | trichlor-tablets | REQUIRES_REVIEW | **SUPPORTED** | Two manufacturer SDS docs, both naming the opposing chemical and fire/explosion consequence explicitly |
| `ec-green-water-0204` | green-water | REQUIRES_REVIEW | **CONTEXTUAL** | Pool & Spa News/Taylor Technologies, 30 ppm breakpoint for green algae |
| `ec-shock-treatment-0140` | shock-treatment | REQUIRES_REVIEW | **REQUIRES_REVIEW** (unchanged) | Researched; genuine 2-5 ppm vs. 10-20 ppm source disagreement documented, not resolved |
| `ec-vinyl-pool-0282` | vinyl-pool | REQUIRES_REVIEW | **SUPPORTED** | CFFA vinyl-liner technical division tip sheet |
| `ec-fiberglass-pool-0286` | fiberglass-pool | REQUIRES_REVIEW | **CONTEXTUAL** | Orenda Technologies, mechanism confirmed, single-figure guidance called an oversimplification |
| `ec-temperature-0080` | temperature | NO_EXISTING_SOURCE | **SUPPORTED** | CMAHC 5th Edition §5.7.4.7.2, 104°F hot-tub maximum |

Full evidence trail: `SOURCE-RESEARCH.md`. Applied via `scripts/phase-7k/apply-resolutions.js` into `entity-claim-inventory-7k.csv` and `resolved-claims.csv`; the original Phase 7J `entity-claim-inventory.csv` is left untouched as the historical record.

## Extraction-precision audit verdict (Step 13)

`extraction-precision-audit.csv` ran 8 synthetic test sentences plus a check against the one known real-data occurrence (`ec-stabilizer-0338`). The misattribution failure mode — `nearestParameter()` picking an environment/sanitizer qualifier word ("salt," as in "salt pool[s]") over the true, more distant parameter mention when the qualifier sits between the mention and the number — reproduced on a second synthetic sentence (alkalinity, not just CYA), confirming it is real. It did **not** generalize to structurally similar sentences using other qualifiers (bromine, vinyl) or other parameter pairs (calcium hardness, dual-parameter sentences), and it was found in exactly 1 of 378 real production claims.

**Verdict: isolated and safely bounded, not systemic.** Per Step 13's explicit branching instruction, this is documented rather than triggering an architecture stop or a silent patch. The extractor's existing conservative behavior around bare "chlorine" (no alias, so it correctly declines to guess) was reconfirmed as a feature, not related to this bug. No change made to `extract-claims-v2.js` this phase — a redesign was explicitly cautioned against by the Phase 7J Director Assessment absent an independent evaluation set, and one misattributed claim out of 378 does not justify one.

`ec-stabilizer-0338` itself (the real affected claim) was not force-corrected this phase — its extracted value is wrong, but manually re-deriving the correct number from the sentence and writing it into the CSV would be hand-patching a symptom, not a evidence-based resolution the review-queue process is meant to produce. It remains flagged REQUIRES_REVIEW, now with the specific extraction defect noted rather than treated as an unexplained review item.

## Systematic 61-entity / P1-P2 review (Step 11)

Of 76 P1/P2 claims in the priority queue, 6 were resolved with real new sourcing (above). The remaining 70 were reviewed by category rather than individually re-researched line-by-line, consistent with the stop-rule against disproportionate effort on ordinary claims (Step 12):

- **LSI/corrosion/scaling mechanism claims** (`ec-ph-0068`, `ec-lsi-0089`, `ec-corrosion-0212/0213/0216`, `ec-scaling-0211`, `ec-low-ph-0249`, `ec-high-ph-0257`, `ec-calcium-hardness-0026/0027/0028`) — established textbook water-balance chemistry (Langelier Saturation Index mechanics). Checked `chemistry-sources.js`'s topic coverage directly: no source in the registry addresses LSI/corrosion mechanism specifically. Left REQUIRES_REVIEW; genuine verification debt, not a known error.
- **Metal-staining mechanism claims** (`ec-copper-0043/0045`, `ec-iron-0048/0049`, `ec-manganese-0050/0051/0052`) — same finding: no existing source coverage for copper/iron/manganese staining mechanisms. Left REQUIRES_REVIEW.
- **Chloramine/irritation mechanism claims** (`ec-combined-chlorine-0008`, `ec-strong-chlorine-smell-0223`, `ec-eye-irritation-0228/0229`, `ec-skin-irritation-0235`) — the underlying chloramine-formation chemistry is already well-sourced at the parameter level (`combined_chlorine` in `chemistry-knowledge.js` cites CDC/MAHC and NPIC), but these specific entity sentences make broader mechanism/remedy claims the existing parameter-level sources don't specifically verify sentence-for-sentence. Left REQUIRES_REVIEW rather than borrowing the parameter-level source for a claim it doesn't precisely support.
- **Equipment-handling safety claims** (`ec-de-filter-0118`, `ec-skimmer-0120/0122`, `ec-muriatic-acid-0315/0317`, `ec-calcium-hypochlorite-0302`) — plausible, industry-standard handling guidance; no dedicated source researched this phase. Left REQUIRES_REVIEW.
- **Dosing-math claims** (`ec-baking-soda-0329`, `ec-calcium-chloride-0334`, `ec-sodium-dichlor-0305`, `ec-unit-gallons-0362`) — these are calculator-adjacent dose-per-volume formulas, explicitly out of scope this phase ("no calculator formula changes"). Left REQUIRES_REVIEW/NO_EXISTING_SOURCE, unchanged.
- **Legal/regulatory claim** (`ec-cover-0139`, "safety covers required by law in many jurisdictions") — jurisdiction-dependent by its own wording, not a single verifiable chemistry fact. Left REQUIRES_REVIEW; not something a single citation can resolve.
- **Generic definitional/procedural/taxonomy claims** (the remaining ~35 rows: winterization/closing-checklist steps, vacation-rental-checklist purpose statements, pool/hot-tub/swim-spa size descriptions, biguanide/salt-chlorinator/skimmer mechanism descriptions, PHTA/NSF organizational-role statements, unit-conversion definitions, etc.) — reviewed and confirmed to be ordinary descriptive content rather than claims needing individual citation-grade verification. Left at their existing status.

No claim in this remaining set was upgraded to SUPPORTED/CONTEXTUAL without a real, checked source. This is disclosed as continued verification debt, matching the framing the Director endorsed after Phase 7J — not claimed as resolved, not hidden.
