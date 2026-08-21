# Phase 7K — Source Research Log

Full research trail for every new source added to `chemistry-sources.js` this phase, including blocked/rejected attempts (disclosed, not hidden).

## 1. Trichlor + calcium hypochlorite mixing hazard (`ec-trichlor-tablets-0313`)

**Claim under review:** trichlor tablets must never be mixed with calcium hypochlorite (fire/explosion risk).

**Blocked attempts (disclosed, not used):**
- Univar Solutions Induclor SDS — direct fetch returned HTTP 403.
- labelsds.com Accu-Tab SDS — HTTP 403.
- versachlor.com SDS — HTTP 403.

**Sources found and read in full:**
- `microphor-trichlor-sds-2016` — Allchem/Microphor trichlor ("Chlorinating Slugs") SDS, Created 2015-05-27, Revised 2016-09-06. WebFetch's own markdown extraction failed on this compressed PDF ("cannot reliably parse"); the tool had already saved the raw binary locally, and the Read tool successfully extracted the full document from that saved file. Section 10 (Stability and Reactivity) explicitly lists "calcium hypochlorite" by name as an incompatible material. Section 15/EPA-label language states that mixing with incompatible chemicals "may cause a violent reaction leading to fire or explosion."
- `asepsis-calhypo-msds-2005` — Asepsis/Chemtura calcium hypochlorite MSDS, Issued 2000-09-28, Revised 2005-10-28. Same WebFetch→Read fallback used. Section 7 (Handling and Storage) explicitly names trichlor as prohibited in the same feeder/storage system, in a paragraph describing fire/explosion risk.

**Disposition:** Two independent manufacturer safety documents, each naming the specific opposing chemical (not a generic "don't mix chemicals" warning) and each tying the mixture to fire/explosion consequence — the exact bar the evidence policy requires. → **SUPPORTED**.

## 2. Shock dosing (`ec-green-water-0204`, `ec-shock-treatment-0140`)

Treated as three distinct scenarios per the Director's explicit instruction, not one figure:

- **Routine maintenance:**
  - `poolspanews-algae-breakpoint-2016` (Pool & Spa News, content credited to Taylor Technologies, 2016-10-31): "usually 2-5 ppm" for general/routine shocking.
  - `aquamagazine-hasa-superchlorination-2020` (AQUA Magazine, Terry Arko/HASA, 2020-09-04): 10-20 ppm for "superchlorination," not scoped separately by routine vs. algae.
  - These two professional trade sources genuinely disagree on the routine figure. Per the evidence policy ("never create a numeric range merely because the site needs one"), no routine-maintenance range record was added. `ec-shock-treatment-0140` (10 ppm maintenance claim) stays **REQUIRES_REVIEW**, with the disagreement documented rather than papered over.
- **Green algae recovery:** `poolspanews-algae-breakpoint-2016` states breakpoint chlorination to 30 ppm free chlorine is needed to disrupt the algae cell nucleus for green algae specifically (does not address dark-green/black algae). New range record `range-shock-algae-recovery-green` added, status CONTEXTUAL (single trade-publication source, not a government/standards body). `ec-green-water-0204` → **CONTEXTUAL**.
- **Fecal/contamination incident response:** already covered pre-existing by `range-shock-cdc-fecal-incident-response` (CDC/MAHC, 20 ppm, SUPPORTED) — untouched this phase, confirmed still correctly scoped as incident response, not routine maintenance.

**Blocked attempt:** CPSC.gov 1980 press release on chlorine-mixing incidents — HTTP 403, not used.

## 3. Hot tub maximum temperature (`ec-temperature-0080`)

- `cmahc-mahc-5th-edition-2024` — Council for the Model Aquatic Health Code, 5th Edition, Section 5.7.4.7.2: "The maximum temperature for an AQUATIC VENUE is 104°F (40°C)." Read directly (public CMAHC document). `publication_date` recorded as `null`, not a guessed day/month — the source only identifies itself as "5th Edition (2024)" with no more specific date shown; inventing a day/month was caught and corrected before this was finalized. → **SUPPORTED**, new range record `range-temperature-hottub-max-safety`.

## 4. Material-science claims

- **Vinyl liner bleaching (`ec-vinyl-pool-0282`):** `cffa-vinyl-liner-bleaching` — Coated Fabrics and Film Association, Vinyl Pool Liners division technical tip sheet. WebFetch's extraction of this PDF was garbled; Read on the tool's saved binary succeeded. Directly confirms undissolved granular shock settling on a liner causes spot bleaching "in as few as 6 hours," explicitly naming "shock product hasn't been pre-dissolved" as a cause. A genuine material-industry source, not a chemistry source repurposed. → **SUPPORTED**.
- **Fiberglass gelcoat / calcium hardness (`ec-fiberglass-pool-0286`):** Orenda Technologies (pool-chemistry manufacturer/technical publisher) confirms the underlying mechanism — low calcium hardness produces aggressive water that can etch/chalk fiberglass gelcoat, and fiberglass "has no calcium for water to dissolve" the way plaster does. However, Orenda's own material explicitly challenges the common "keep calcium below 200 ppm" blanket rule as an oversimplification and recommends chelation-based management instead of a fixed ceiling. The site's existing 150-250 ppm figure is defensible but the topic has real nuance beyond one number. → **CONTEXTUAL**, no page rewrite (mechanism claim not contradicted, only the "clean number" framing is more nuanced than a single page paragraph can carry).

## Near-miss, deliberately not touched

`ec-unit-fahrenheit-0369` ("Pool temperature targets: 78–84°F (residential pools), 100–104°F maximum (hot tubs).") mentions the same 104°F hot-tub figure now verified above. The extractor recorded this claim's numeric value as **78-84** (the residential pool comfort range, the first number in the sentence), not the hot-tub maximum. Applying the new hot-tub-safety source to this claim row would mean citing a source for a number it doesn't actually verify — exactly the "discussed the same chemical/parameter, therefore assumed to support" error the evidence policy prohibits. Left untouched, still REQUIRES_REVIEW/NO_EXISTING_SOURCE.
