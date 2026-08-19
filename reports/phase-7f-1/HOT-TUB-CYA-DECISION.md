# Hot Tub CYA Decision (Mandatory Review #1)

**claim_id**: `3c256b70dc1e3ce2` | **page**: `hot-tub-chemical-levels-chart.html` | **parameter**: cyanuric_acid, hot_tub, 30-50 ppm

## Production statement (before correction)

Quick Answer: "...calcium hardness 150–250 ppm, CYA 30–50 ppm (if using unstabilized chlorine)."
Table row: `Cyanuric acid | 30–50 ppm (outdoor) | FC lost to UV quickly | Chlorine lock; not needed for indoor`

## Source statement

`chemistry-ranges.js` `range-cya-hottub` (SUPPORTED, `cdc-healthy-swimming-home-treatment`): CYA target 0 ppm for hot tubs. Live-verified 2026-08-18 via independent research: CDC recommends against cyanuric acid / stabilized chlorine in hot tubs, based on documented health-relevant findings — cyanuric acid substantially slows pathogen kill time (up to ~100x longer for *Pseudomonas aeruginosa*, the "hot tub itch" organism) and is associated with increased gastrointestinal illness risk at higher concentrations.

## Context analysis

- Not a pool-vs-hot-tub mislabeling: the claim is genuinely about hot tubs, and CDC's guidance is genuinely hot-tub-specific.
- Not a routine-vs-treatment distinction: CDC's recommendation is a general operating guideline, not a treatment-scenario exception.
- The "(if using unstabilized chlorine)" qualifier in the original text is itself internally confused: cyanuric acid is, by definition, the stabilizing agent — a hot tub genuinely using unstabilized chlorine would have no CYA to target in the first place. The "30-50 ppm (outdoor)" / "not needed for indoor" table framing was evidently copied from pool-context CYA guidance without adapting it to hot-tub-specific guidance — an editorial content-reuse error, not a deliberate claim.
- This is safety-adjacent (Step 8 applies): CDC's stated reason is a documented pathogen-kill-time and illness-risk finding, not a cosmetic preference.

## Outcome

**D — production claim is incorrect** for the specific numeric target; the surrounding "if using unstabilized chlorine" framing is also internally inconsistent. Not a source conflict requiring escalation, not a context difference that explains the number away — CDC's guidance directly addresses hot tubs and directly contradicts giving a positive ppm target for CYA in that environment.

## Decision

`CORRECT_REQUIRED` → `production_action: CORRECT_VALUE`

**OLD** (quickAnswer): "...calcium hardness 150–250 ppm, CYA 30–50 ppm (if using unstabilized chlorine). Hot tubs require closer monitoring..."
**NEW**: "...calcium hardness 150–250 ppm. CDC recommends against using cyanuric acid or stabilized chlorine products in hot tubs. Hot tubs require closer monitoring..."

**OLD** (table row): `Cyanuric acid | 30–50 ppm (outdoor) | FC lost to UV quickly | Chlorine lock; not needed for indoor`
**NEW**: `Cyanuric acid | Not recommended | N/A | CDC advises against CYA/stabilized chlorine in hot tubs — it slows pathogen kill time`

**SOURCE**: `cdc-healthy-swimming-home-treatment` (chemistry-sources.js); independently corroborated 2026-08-18.
**REASON**: the prior number was both internally inconsistent and contradicted a documented, health-relevant CDC recommendation specific to hot tubs.

Meta description/OG description on the same page were also lightly adjusted to stop advertising "CYA ideal ranges for spas" (no such range exists) and instead reference the CDC guidance, since the original wording would mislead a search snippet reader before they reach the corrected table.

**Implemented in**: `scripts/generate-authority-charts.js` (source data — this chart is generator-produced, not static, so the fix is in the generator, not a one-off HTML patch). Verified live in rendered `hot-tub-chemical-levels-chart.html` after rebuild.
