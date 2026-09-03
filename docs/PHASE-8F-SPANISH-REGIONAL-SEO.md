# Phase 8F — Spanish Regional SEO + Language-Awareness Foundation

## 1. Phase 8E commit SHA

`86fb27bd2c5127e770ba6a7d8519c4df2c627ad3` ("Phase 8E: launch first Spanish production cluster"). HEAD == origin/main, working tree clean at phase start.

## 2. Terminology research methodology

Targeted web research against authoritative and high-evidence sources: the Real Academia Española (RAE)'s `Diccionario de la lengua española` and `Diccionario panhispánico de dudas`, the Academia Mexicana de la Lengua's `Diccionario breve de mexicanismos`, regional-usage dictionaries (AsiHablamos.com), and commercial/industry usage evidence from sources that themselves localize by region (notably Jacuzzi®'s own `es-mx`, `es-es`, and Latin America sites, which independently confirm the regional split found in dictionary sources). No single SEO blog was treated as sole proof of a regional claim; every variant in the resulting data model cites at least one source (see `data/i18n/es/terminology.json`, checked by `validate-phase-8f.js` check E).

## 3. Pool terminology findings

Three-way regional split, well evidenced:

- **piscina** — neutral/broad default. Preferred in Spain, Chile, Colombia; recognized everywhere.
- **alberca** — Mexico-specific. The Academia Mexicana de la Lengua classifies it as a "synchronic Mexicanism," defined as "piscina deportiva," dominant across registers (including construction-industry usage) within Mexico only.
- **pileta** — Rioplatense (Argentina, Uruguay, and to a lesser extent Paraguay). Also colloquially means "sink" outside pool contexts — the data model notes this for disambiguation.

No evidence supported a distinct term for Chile or Colombia beyond the neutral "piscina" — per spec Section 3's explicit instruction, no distinction was forced there.

## 4. Hot-tub terminology findings

This is the most consequential finding of the phase, and it is a **content-accuracy correction, not merely a stylistic choice**:

- **"bañera de hidromasaje" / "tina de hidromasaje"** — the terms used as the primary label on Jacuzzi®'s own `es-es`/`es-mx` sites — name a *different, smaller product*: an indoor, 1–2 person bathroom fixture with no continuous filtration cycle, drained after every use (confirmed by multiple industry comparison sources: Leroy Merlin, Web del Hidromasaje, Kinedo). Such a fixture is never filled with chemically-treated, standing water and therefore has no genuine chlorine/pH maintenance need — the exact subject matter of WaterBalanceTools' hot-tub calculators.
- **"spa"** — the term for a continuously-filled, filtered, heated, multi-person vessel that *does* require ongoing water treatment — matches WaterBalanceTools' actual subject matter. Confirmed as the preferred term on Jacuzzi®'s own Spain and Chile sites (both use "spa" as their primary product-category label, not "jacuzzi" or "bañera de hidromasaje").
- **"jacuzzi" / "yacusi"** — RAE confirms "jacuzzi" derives from and remains a registered trademark (Jacuzzi®); the Diccionario panhispánico de dudas recommends "yacusi" as the Hispanicized spelling and "(bañera de) hidromasaje" as the neutral equivalent. Genericized in everyday Latin American usage (to the point of being applied to unrelated products), making it a high-value **search/lexical variant**, but per spec Section 9 it is never modeled as the canonical or primary term.

This site's existing Phase 8E Spanish copy already used "spa"/"Spa" consistently (e.g. "Spa / Jacuzzi" for the water-type selector, "Calculadora ... para Spa" for hot-tub calculator names) — this research confirms that choice was already correct; no change to the 5 existing pages was needed (Section 13 below).

## 5. Chemistry terminology findings

Substantially neutral/standardized across every region investigated: `cloro`, `cloro libre`, `cloro combinado`, `cloro total`, `pH`, `alcalinidad total`, `dureza cálcica`, `ácido cianúrico`/`estabilizador`, `desinfectante`, `volumen de la piscina`, `tratamiento del agua` all show no material regional split in the sources reviewed. "Shock treatment" has two near-equally-used neutral forms (`choque de cloro`, `cloración de choque`) with no clear regional preference — both are modeled, neither forced. No forced regional distinction was introduced anywhere in the chemistry domain, per spec Section 3/18's explicit instruction not to let pool-noun regionality bleed into chemistry vocabulary.

## 6. Regional terminology table

| Concept | Canonical | ES | MX | AR/UY | CL | CO |
|---|---|---|---|---|---|---|
| pool | piscina | piscina (preferred) | alberca (preferred) | pileta (preferred) | piscina (preferred) | piscina (preferred) |
| hot tub | spa | spa (preferred) | spa (common) | spa (common) | spa (preferred) | spa (common) |
| jacuzzi (trademark, search-lexical only) | — | recognized | common | common | common | (neutral: secondary) |
| chlorine / free chlorine / pH / alkalinity / CYA / etc. | (see Section 5) | neutral, no regional split evidenced | | | | |

Full machine-readable table with per-variant evidence citations, confidence ratings, and SEO/natural-language suitability: `data/i18n/es/terminology.json`.

## 7. Sources / evidence

Every terminology variant's `evidence` array cites its source. Headline sources: RAE DLE (`piscina`, `jacuzzi`, `pileta`), RAE Diccionario panhispánico de dudas (`yacusi`), Academia Mexicana de la Lengua (`alberca`), AsiHablamos.com Diccionario Latinoamericano (`pileta`), Jacuzzi®'s own regional sites (`es-es`, `es-mx`, Chile), and multiple independent Spanish-language pool/spa technical sources for the chemistry terms (iopool, PS Water, Fluidra, Orenda, Web del Hidromasaje, Leroy Merlin, Kinedo).

## 8. Terminology data model

`data/i18n/es/terminology.json` — a new, standalone lexical/SEO data source, explicitly *not* a second translation-content or translation-status system. Schema per concept: `concept` (stable snake_case ID), `domain`, `canonicalTerm`, `notes`, optional `relatedButDistinctConcept` (used to keep `hot_tub` and `hydromassage_bathtub` from ever being conflated), and `variants[]`, each with `term`, `regionStatus` (per-region `preferred`/`common`/`recognized`/`secondary`/`avoid-for-this-region`), `seoSuitability`, `naturalLanguageSuitability`, `confidence`, `evidence[]`, and optional `isTrademark`.

`js/i18n/es-terminology.js` — the query API: `getCanonicalTerm(concept)`, `getTermForRegion(concept, region)` (excludes trademark terms by default, matching spec Section 9), `getVariants(concept)`, `getSearchVariants(concept)` (SEO/FAQ-coverage use, includes trademark terms), `isTrademarkTerm(concept, term)`, `findConceptByTerm(term)`. Extends the Phase 8D/8E `js/i18n/` module family; does not duplicate `translation-status.js`.

## 9. Navigation/search-index architecture

Per spec Section 12's explicit instruction not to simply remove `es` from `SKIP_DIRS`, both `scripts/generate-navigation.js` and `scripts/generate-search-index.js` were given a real **eligibility gate**: a non-default-language URL is included only when `data/i18n/translation-status.json` reports it `"translated"`; every record (English included) now carries an explicit `lang` field. `generate-search-index.js`'s records additionally carry `contentId` (from the same Phase 8D/8E translation-status data) when known, so a future search UI can show "this page is also available in Spanish" without ever merging the two documents. Both English and Spanish pages' category classification strips the language prefix first (mirroring the Phase 8E fix already made to `generate-sitemaps.js`), so a Spanish calculator page files under "Calculators"/"calculators", not "other".

Both generators are re-run (via `execSync`, a genuinely separate process — the same Phase 8A/8B/8E finding that `require()`-ing the same script path twice in one process is a silent no-op) immediately after the Spanish cluster is generated, in dependency order (navigation before search-index, since the index reads `navigation.json`), so both reflect the current Spanish content within the same build rather than requiring a second one.

`scripts/generate-hubs.js` needed no change: its `linksByPrefix()`/`childCategories()` filtering is already prefix-based (`p.url.startsWith('/calculators/')`), which structurally never matches a `/es/calculators/...` URL — English hub pages are isolated automatically, verified directly (no `/es/` links found in any hub page after the rebuild).

## 10. Content-ID integration

No new identity system. The existing Phase 8D/8E `translation-status.json` content IDs (`calculator:chemical`, etc.) are the sole source both generators consult for eligibility and for the search index's `contentId` field.

## 11. URL strategy

The five existing Spanish URLs are **unchanged** in this phase, per spec Section 11:

    /es/calculators/chemical-calculator
    /es/calculators/pool-volume-calculator
    /es/calculators/pool-chlorine-calculator
    /es/calculators/pool-ph-calculator
    /es/calculators/pool-shock-calculator

**Director recommendation on future native Spanish slugs**: not advantageous for this cluster. The current slugs are already short, ASCII, and semantically transparent to Spanish readers ("calculators," "chemical," "volume" are widely understood loanwords/cognates in a technical context, and the actual regional pool-noun variation — piscina/alberca/pileta — lives in visible copy and metadata, not the URL path). Translating the URL slug would (a) require a redirect-source registry entry to protect the old slug per this project's established URL-consolidation discipline, (b) provide no measurable SEO benefit since Google indexes by rendered title/content, not URL-path words, once a page is properly localized with correct `hreflang`/canonical, and (c) risk a slug collision across regions if a future Mexico-specific page wanted `alberca` in its path while an Argentina-specific page wanted `pileta` for the *same* underlying content. Native-language slugs could become valuable later specifically for a genuinely **country-differentiated landing page** (e.g. a Mexico-specific page whose content, not just its terminology, differs enough to justify a distinct URL) — but that is a page-content decision for a future phase, not a blanket migration. **No URL migration is authorized or recommended for the existing cluster.**

## 12. hreflang strategy

Unchanged from Phase 8E: plain `es`, `en`, and `x-default` only. No `es-MX`/`es-AR`/`es-ES` country-specific hreflang codes were introduced (verified by `validate-phase-8f.js` check M) — per spec Section 20, those are reserved for real, separately-indexable country-specific pages, which do not exist yet.

## 13. What was implemented

- `data/i18n/es/terminology.json` + `js/i18n/es-terminology.js` (new data model + query API).
- Language-aware `generate-navigation.js` and `generate-search-index.js` (eligibility gate + `lang` field + category-prefix fix + `contentId` on search records).
- `run-all-generators.js` wiring: both generators re-run after the Spanish cluster, before the sitemap/indexation re-validation already established in Phase 8E.
- Full audit of the 5 existing Spanish pages against the terminology model (Section 17 below) — confirmed already correct, zero content changes made.
- `scripts/validate-phase-8f.js` (20 checks) and `scripts/test-phase-8f.js` (20 tests).

## 14. What was deliberately deferred

- No country-specific pages, URLs, or hreflang codes (Sections 20, 21, 11).
- No expansion of the Spanish production cluster beyond the existing 5 pages (spec Section 1/21).
- No regional-terminology substitution actually wired into any page generator yet — the data model and query API exist and are proven correct, but no generator currently *calls* `getTermForRegion()` to vary output by region, since doing so would require deciding how a visitor's region is even detected (cookie? Accept-Language? separate URL?), which is out of this phase's foundation-only scope.
- Schema region/language metadata fields: investigated (spec Section 19), no safe, non-invented extension point found that wouldn't require inventing unsupported JSON-LD properties, so none was added.

## 15. Validation results

`validate-phase-8f.js`: PASS, 0 errors (checks A–T). `test-phase-8f.js`: 20/20 PASS. Both re-run against the definitive build; see `reports/phase-8f-status.md`.

## 16. Determinism results

4 consecutive builds run. `data/navigation.json` and `data/search-index.json`: byte-identical (excluding `_generated`) across all 4. Hub pages: byte-identical across builds (Phase 8B guarantee re-verified). `terminology.json`: proven untouched by the build pipeline (static source, not generated output). No oscillation, no stale-intermediate-dependency effect observed — unlike Phase 8E's initial rollout, no new multi-build settling was found here, since the underlying link graph was already stable going into this phase.

## 17. English non-regression

Before/after English production-URL manifest: 494 URLs, **0 removed, 0 added**, matching the Phase 8E baseline exactly. English calculator pages, hub pages, and sitemap coverage independently re-verified unchanged. One notable, fully-explained, and *beneficial* side effect was found and is disclosed rather than hidden: re-running `generate-navigation.js` (required for the Spanish eligibility gate to see fresh content) also re-synced 106 English page records' `description` field, which were stale in the Phase 8E-committed `data/navigation.json` relative to their own already-committed HTML source at commit time (verified directly: the committed source HTML already carried the shorter, truncated description at Phase 8E's commit — `data/navigation.json` simply hadn't been regenerated after whatever earlier, unrelated build step last shortened those descriptions). No `title`, URL, or any other field changed on any of the 106 records — only `description` was resynced to match the page's own actual, already-committed meta tag. This is not new-content churn; it's a pre-existing data-freshness gap in a derived index, corrected as an unavoidable consequence of the ordering fix this phase actually needed.

## 18. Regional SEO recommendations

1. Do not add per-region body-copy variation to the existing 5-page cluster yet — the audit in Section 17 (below) found the current neutral wording ("piscina", "spa") is already correct and broadly understood; regional substitution should wait for genuine country-differentiated content (Section 11).
2. When a future phase does add regional variation, use `getTermForRegion()` for **one** default term per page/region — never concatenate multiple regional synonyms into visible copy (spec Section 6, enforced by `validate-phase-8f.js` check G).
3. Use `getSearchVariants()` (which includes "jacuzzi") for FAQ questions and meta-description variants specifically, where matching a user's actual literal search query has real value — never for the primary H1/product-name copy.
4. Chemistry vocabulary should remain neutral indefinitely unless new evidence surfaces a genuine regional split; do not manufacture one to look complete.

## 19. Next Spanish expansion recommendation

1. Decide a region-detection mechanism (before any generator consumes `getTermForRegion()` for real output) — likely `Accept-Language` plus a manual override, documented as its own architecture decision, not assumed here.
2. Expand the production cluster using the same `cluster-translations.js` + `generate-spanish-cluster.js` + `inject-i18n-cluster.js` pattern from Phase 8E, now informed by this phase's terminology model, for the next logical group (e.g. the hot-tub-specific calculators, reusing the now-confirmed-correct "spa" terminology).
3. Only after (1) and a real content differentiation need is identified should a country-specific landing page (e.g. Mexico-targeted, using "alberca") be considered — and only for that page's own URL, never a blanket slug migration of the existing cluster.
