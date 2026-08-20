# Source Research (Phase 7J, Step 6)

External research was performed only for the claim that genuinely warranted it per Step 6's priority order: a HIGH-risk chemical-handling safety claim. No other claim required new research this phase — the remaining 20 individually-reviewed claims were resolved by (a) recognizing an already-established site precedent (the CC 0.4/0.5 ppm distinction from Phase 7E/7F.1), (b) recognizing a different claim category than the existing registry covers (product composition/purity, dose-response deltas — cross-checked directly against the site's own `scripts/data/formulas-data.js`, which is itself part of the existing, already-reviewed chemistry knowledge architecture, not a new source), or (c) recognizing an illustrative/comparison example inside a mechanism explanation rather than a genuine claim.

## Research attempt: trichlor + calcium hypochlorite mixing hazard

**Claim** (`ec-trichlor-tablets-0313`, `entities/trichlor-tablets.html`): "Should not be mixed with calcium hypochlorite — fire and explosion risk."

**Why it needed research**: HIGH-risk chemical-handling safety claim (Step 9's top priority category), no existing `chemistry-ranges.js` or `chemistry-sources.js` record covers chemical-incompatibility/mixing hazards.

**Sources checked** (in the Step 6 hierarchy order: primary government → professional standard → academic → secondary):

| Source | Type | Result |
|---|---|---|
| [OSHA Hazard Information Bulletin — Calcium Hypochlorite](https://www.osha.gov/publications/hib19911114) | Primary government | Fetched directly. Dated 1991-11-14. Covers only general storage/combustible-material hazards ("A self perpetuating fire/explosion could result if CaCl2O2 is not kept dry and stored with other organic and/or flammable material(s)"). Does **not** mention trichlor or chlorinating-agent mixing specifically. |
| [CAMEO Chemicals / NOAA — Calcium Hypochlorite datasheet](https://cameochemicals.noaa.gov/chemical/10826) | Primary government (NOAA) | Fetched directly. Reactivity/incompatibility list covers carbon, acetylene, organic matter, alcohols, sulfur compounds, urea, ammonia. Does **not** list trichlor or trichloroisocyanuric acid specifically. |
| PubMed study on swimming-pool-chlorinator explosion risk | Academic/peer-reviewed | Fetch blocked by a cookie-consent wall; abstract content could not be retrieved. |
| Water Conditioning & Purification trade-publication article | Secondary/industry trade press | Fetch blocked, HTTP 403. |

**Outcome**: Could not independently pin down one specific, directly-verified primary source stating this exact claim, despite checking 4 real sources across the established hierarchy. The claim is consistent with broadly-known pool-industry safety consensus (product labels for both trichlor and calcium hypochlorite routinely warn against mixing with other pool chemicals, and mixing different chlorinating-agent chemistries is a well-known general hazard class), and nothing found **contradicts** it. Per this phase's explicit rule against fabricating provenance, this claim is dispositioned **REQUIRES_REVIEW**, not SUPPORTED — an honest unresolved claim, not a fabricated citation. Recommended for a future phase: check a manufacturer SDS or product label directly (typically the most explicit, most accessible source for exact chemical-incompatibility warnings), or retry the PubMed/trade-press sources with a different access method.

## No fabricated sources

No new record was added to `scripts/data/chemistry-sources.js` this phase. No publication date was invented (the OSHA bulletin's date, 1991-11-14, was read directly from the fetched page, not guessed). No claim was marked SUPPORTED on the basis of a source that was not actually and directly verified to say what the claim says.
