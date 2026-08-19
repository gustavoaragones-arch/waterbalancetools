# Conflict #2 Decision — Combined Chlorine 0.5 vs 0.4 ppm

**claim_id**: `317e0ea96af98f4f` | **page**: `reference/combined-chlorine-explained.html` | **parameter**: combined_chlorine, pool, 0.5 ppm

## Production statement

"Combined chlorine (CC) = Total chlorine − Free chlorine; target CC below 0.5 ppm... CC above 0.5 ppm requires breakpoint chlorination: FC raised to 10× the CC reading."

## Source statement

CDC Model Aquatic Health Code (`cdc-mahc-2023`), live-verified 2026-08-18: "The owner shall ensure the aquatic facility takes action to reduce the level of combined chlorine (chloramines) in the water when the level exceeds 0.4 PPM(mg/L)." This is a **regulated public-facility action level**, not a general consumer guideline.

Independent research (live search + fetch, 2026-08-18) on the 0.5 ppm figure: widely repeated across residential pool-care sources as a general maintenance guideline; one directly-fetched secondary source (greysharkpools.com) explicitly states it does **not** attribute 0.5 ppm to any specific regulatory or standards body, describing it as "general pool maintenance best practice." A search summary claimed a PHTA attribution and state-code usage, but I could not independently verify a specific PHTA citation or read the Minnesota health-department PDF directly (fetch failed) within this phase's scope — that attribution is not treated as confirmed.

## Context analysis

WaterBalanceTools targets residential consumers, not regulated public/commercial facility operators. This page does not claim to be quoting MAHC or any specific regulatory body for the 0.5 ppm figure — it presents it as a general target. That is a defensible, honestly-scoped claim on its own terms. It becomes a real problem only if a *different* WaterBalanceTools page cites CDC/MAHC's stricter 0.4 ppm figure without acknowledging the residential 0.5 ppm convention used elsewhere on the site — which would make the site look internally inconsistent to a careful reader (or an AI system cross-referencing multiple pages).

## Outcome

**B — production claim is correct only with context.** Not a factual error (0.5 ppm is a real, widely-used residential convention); not a resolved non-issue either, since the site's own knowledge layer now separately records the stricter 0.4 ppm MAHC figure (`range-cc-pool-hottub-max`, upgraded to SUPPORTED in Phase 7F).

## Decision

`SUPPORTED_WITH_CONTEXT` → `production_action: ADD_CONTEXT`

**OLD**: "Combined chlorine (CC) = Total chlorine − Free chlorine; target CC below 0.5 ppm"
**NEW**: "Combined chlorine (CC) = Total chlorine − Free chlorine; a commonly used residential target is CC below 0.5 ppm (the CDC Model Aquatic Health Code sets a stricter 0.4 ppm action level for regulated public facilities)"

**SOURCE**: `cdc-mahc-2023` (for the 0.4 ppm figure); 0.5 ppm figure remains an internal/general-consensus figure, not attributed to a specific confirmed source.
**REASON**: this is the site's deepest technical reference page on the topic (its FAQPage schema already independently states the 0.4 ppm public-facility figure, confirming the page's own prior authors were aware of the distinction but hadn't surfaced it in the visible key-takeaways). Adding the context here, rather than on the 3 more casual pages sharing the same underlying number, is the smallest correction that resolves the internal-consistency concern where a careful reader would actually land.

**Numeric value NOT changed** — 0.5 ppm remains accurate for its stated (general/residential) context.
