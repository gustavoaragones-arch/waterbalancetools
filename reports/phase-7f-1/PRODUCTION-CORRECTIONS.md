# Production Corrections (Phase 7F.1)

Every production HTML change made this phase, with OLD/NEW/SOURCE/DECISION/REASON. Total production pages affected: **2** (1 generator source affecting 1 rendered page + 1 static page directly).

## 1. `hot-tub-chemical-levels-chart.html` (via `scripts/generate-authority-charts.js`)

**Section**: Quick Answer
**OLD**: "Ideal hot tub chemical levels: free chlorine 3–5 ppm, pH 7.2–7.8, total alkalinity 80–120 ppm, calcium hardness 150–250 ppm, CYA 30–50 ppm (if using unstabilized chlorine). Hot tubs require closer monitoring than pools because small water volume means chemicals shift faster."
**NEW**: "Ideal hot tub chemical levels: free chlorine 3–5 ppm, pH 7.2–7.8, total alkalinity 80–120 ppm, calcium hardness 150–250 ppm. CDC recommends against using cyanuric acid or stabilized chlorine products in hot tubs. Hot tubs require closer monitoring than pools because small water volume means chemicals shift faster."
**SOURCE**: `cdc-healthy-swimming-home-treatment`; independently corroborated 2026-08-18.
**DECISION**: CORRECT_REQUIRED
**REASON**: see `HOT-TUB-CYA-DECISION.md`.

**Section**: Reference table, Cyanuric acid row
**OLD**: `Cyanuric acid | 30–50 ppm (outdoor) | FC lost to UV quickly | Chlorine lock; not needed for indoor`
**NEW**: `Cyanuric acid | Not recommended | N/A | CDC advises against CYA/stabilized chlorine in hot tubs — it slows pathogen kill time`
**SOURCE / DECISION / REASON**: same as above.

**Section**: `<meta name="description">` / OG description
**OLD**: "Hot tub chemical levels chart: chlorine, pH, alkalinity, calcium hardness, and CYA ideal ranges for spas. Quick reference table + FAQ." / "One-page hot tub chemistry reference. Ideal ranges for all spa parameters: chlorine, pH, TA, calcium hardness, CYA."
**NEW**: "Hot tub chemical levels chart: ideal chlorine, pH, alkalinity, and calcium hardness ranges for spas, plus CDC guidance on cyanuric acid. Quick reference table + FAQ." / "One-page hot tub chemistry reference. Ideal ranges for chlorine, pH, TA, and calcium hardness -- plus why CDC recommends against cyanuric acid in hot tubs."
**REASON**: metadata must not advertise a "CYA ideal range" that the corrected page body no longer states (Step 16: metadata changes only when the underlying factual claim necessarily requires it).

## 2. `reference/combined-chlorine-explained.html` (static file)

**Section**: Key Takeaways list, item 1
**OLD**: "Combined chlorine (CC) = Total chlorine − Free chlorine; target CC below 0.5 ppm"
**NEW**: "Combined chlorine (CC) = Total chlorine − Free chlorine; a commonly used residential target is CC below 0.5 ppm (the CDC Model Aquatic Health Code sets a stricter 0.4 ppm action level for regulated public facilities)"
**SOURCE**: `cdc-mahc-2023`
**DECISION**: SUPPORTED_WITH_CONTEXT
**REASON**: see `CONFLICT-02-DECISION.md`.

## Explicitly reviewed, deliberately NOT changed

3 pages sharing the same combined-chlorine 0.5 ppm figure (`academy/hot-tubs/shock-after-heavy-use.html`, `glossary/pool-shock-schedule.html`, `comparisons/free-chlorine-vs-total-chlorine.html`) — reviewed individually (`CONFLICT-03/04/05-DECISION.md`), left unchanged because the context correction is more appropriately placed once, at the technical reference page, per "prefer the smallest accurate correction."

## Not production content

Trust metadata corrections (`scripts/data/trust-formulas.js`, `trust-calculator-metadata.js`, `trust-editorial.js`) and the Organization schema logo fix were made in **Phase 7F**, not this phase — carried forward, not repeated here.

## No knowledge-layer (chemistry-ranges.js / chemistry-claims.js) changes this phase.
