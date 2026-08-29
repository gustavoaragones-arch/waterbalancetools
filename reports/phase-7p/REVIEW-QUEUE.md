# Phase 7P -- Review Queue (Carry-Forward)

## Covered-pool chemistry (DEFER, not REJECT)

Real, narrow, distinct intent confirmed (see `SEARCH-INTENT-RESEARCH.md`), but external search is dominated by pool-cover retailer/installer marketing content with numeric claims (e.g. "90% chlorine retention") that have no identifiable independent primary source behind them. Deferred pending either a better-tier source or a decision that qualitative-only content (no specific retained-chlorine percentage) is an acceptable bar for this topic. Candidate for a future phase with room for deeper sourcing than this phase's bounded research pass allowed.

## Water-replacement / full-drain-and-refill chemistry (DEFER, not REJECT)

Real, distinct intent (resetting an existing pool's water entirely, as opposed to new-fill startup or seasonal reopening), but the specific numeric thresholds surfacing in search (CYA >100 ppm, TDS >2,500 ppm) likely already overlap with thresholds this site's own CYA/TDS-adjacent reference content carries. Recommended future action: a light EXPAND of the existing `entities/water-replacement.html` stub (currently thin/definitional) rather than a new standalone page -- not implemented this phase to keep this phase's shipped scope to the one clearly-justified CREATE decision.

## Dichlor and calcium hypochlorite dedicated articles (REJECT, re-confirmed)

Both re-tested this phase against the Step 7 cannibalization standard and found to still fail it: no new distinct claims beyond what each entity page already carries were identified without dedicated external chemistry research this phase did not undertake for these two topics. Not logged as a live candidate going forward unless new evidence (e.g. a genuine distinct-intent angle, not just "more detail on the same facts") surfaces.

## Salt-pool week-to-week chemistry management (REJECT -- gap closed, correcting a prior-phase inaccuracy)

Direct re-read this phase found `academy/equipment/salt-systems.html` already contains a substantive, cited "Water Chemistry for Salt Pools" section (pH drift, alkalinity, calcium hardness, CYA targets specific to SWG pools) plus cell-maintenance and common-mistakes sections. Phase 7N's characterization of this page as hardware-only was inaccurate. No further action needed; noted here so a future phase does not re-open this without first re-reading the page, as this phase did.

## Bromine dosing calculator and standalone LSI calculator (REJECT this phase, unchanged reasoning from 7N)

Both remain blocked by this phase's explicit Step 25 scope prohibition on calculator-formula/architecture changes, independent of demand evidence. The bromine calculator additionally needs an independently-verified dosing constant researched and cited before any formula work can begin. The LSI calculator is an architecture/routing decision (new page vs. restructuring `calculators/chemical-calculator.html`), not a content decision. Both require a dedicated future calculator-architecture phase.

## Pre-existing duplicate `id` in data/academy.json (incidental finding, not fixed)

`fund-06` is used by two different articles (`why-water-testing-matters` and `indoor-pool-chemistry`) -- a pre-existing data-entry bug unrelated to this phase's work. Confirmed `id` is purely descriptive metadata not consumed by `scripts/generate-academy.js` or any validator, so it has no functional effect. Not fixed this phase (out of scope, would be an unrelated content-data cleanup); the new article added this phase correctly uses the actually-unused `fund-07`.

## Footer-whitespace / build-timestamp nondeterminism (reconfirmed present, not expanded)

Reconfirmed via a real two-build hash comparison (see Reproducibility section of `PHASE-7P-STATUS.md`). The production-content-page footer-whitespace footprint remains the same category composition documented since Phase 7M (entities/guides/calculators/reference-dominated, ~168-171 files depending on exact phase-to-phase content-length variance). Separately, QA-dashboard pages (`reports/*.html`, `qa-summary.*`) embed a live build timestamp by design and differ on every build -- this is deliberate, pre-existing behavior, not a bug, and was not previously called out as its own category in prior phases' reproducibility sections. Neither pattern was expanded or newly introduced by this phase. Still not fixed at its source (pre-existing, cross-phase, its own dedicated-phase scope).

## Legacy `scripts/generate-sitemap.js` (singular) -- unchanged awareness note, carried forward

Still not part of the automated build pipeline; still not touched this phase.
