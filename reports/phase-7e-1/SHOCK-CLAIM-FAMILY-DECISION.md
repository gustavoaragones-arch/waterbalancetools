# Shock Claim-Family Decision

## Question

Is the absence of a numeric free-chlorine range for `shock_treatment` a genuine knowledge gap (fix it) or a modeling gap (the concept doesn't need one)?

## Investigation

Four distinct concepts were being collapsed into one `shock_treatment` parameter and one set of candidate ranges:

1. **Routine free-chlorine target** — already modeled correctly and separately (`claim-fc-pool-no-cya`, `claim-fc-pool-with-cya`, `claim-fc-hottub-routine`), unaffected by this decision.
2. **Breakpoint/shock dosing rule** — a *relative*, not absolute, quantity: "dose FC to ~10x the combined chlorine reading." Already modeled (`claim-shock-breakpoint-rule` → `range-shock-breakpoint-rule-of-thumb`), correctly with `minimum: null, maximum: null` — a ratio has no fixed ppm bounds to check a value against. This is not a gap; forcing a numeric range onto a relative rule would be wrong.
3. **Public-pool fecal/contamination incident response** — a real, specific, already-sourced CDC/MAHC protocol: raise FC to 20 ppm for ~13 hours (general incident) or ~28 hours at pH ≤7.5 with CYA ≤15 ppm (Cryptosporidium). Already existed as `range-shock-cdc-fecal-incident-response` (SUPPORTED, `cdc-mahc-2023`) but had **no canonical claim referencing it** — an orphan range, invisible to the claim-family layer. **Fixed this phase**: added `claim-shock-fecal-incident-response` in `chemistry-claims.js`.
4. **General residential "shock raises FC to N ppm temporarily"** — the pattern actually driving most of the 82 `CLAIM_FAMILY_GAP` conflicts (site content stating things like "shock to 10+ ppm," "green pool: 30 ppm," "temporarily 10-30 ppm"). This is genuinely, materially different from #3: it's a general residential practice claim, not the specific public-facility incident-response protocol, and no primary source in the current 9-source registry states a general residential shock-FC target as an absolute number (CDC/MAHC's only confirmed absolute figure is the incident-response one, which is facility-specific and much narrower in applicability).

## Decision

**Do not invent a general numeric shock-treatment FC range.** No authoritative source confirms one. Adding a fabricated "10-30 ppm" range to make the 82 conflicting claims resolve as SUPPORTED would be exactly the "mark unsupported claims as supported" the brief prohibits, done to make a metric look better.

**Add the incident-response claim family** (done — `claim-shock-fecal-incident-response`), since real evidence exists for it and it was sitting unreferenced.

**Model the general case as contextual treatment guidance, not a range** — which is what it already was; the fix is at the provenance layer, not the knowledge layer: the 82 `CLAIM_FAMILY_GAP` conflicts are now correctly classified as "this claim describes a shock/breakpoint scenario and was incorrectly checked against the *routine* FC/CC range" (see `conflicting-claims.csv`), resolution `REQUIRES_EXPERT_REVIEW` — not `FALSE_CONFLICT` (that would overclaim these are resolved) and not `SOURCE_CONFLICT_REMAINS` (that would overclaim they're a confirmed factual dispute). They are neither: they are a category-of-claim the current knowledge architecture has no sourced ground truth for. That is now accurately disclosed rather than mechanically miscompared.

## Effect on the 499-conflict inventory

This decision does not, by itself, reduce the *count* of CLAIM_FAMILY_GAP records — it correctly re-labels what they mean (a modeling scope question, not a factual error) and stops treating shock-scenario claims as "conflicting with the routine range," which was the actual bug reported by the Project Director. Future work (out of scope here): if a primary source for general residential shock-FC guidance is found, add it as its own claim family, distinct from both the routine target and the incident-response protocol, per this same non-collapsing principle.
