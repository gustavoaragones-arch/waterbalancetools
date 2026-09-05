# PHASE 8L — SPANISH CORE REFERENCE LOCALIZATION ARCHITECTURE PREPARATION

## 1. Status
PASS

## 2. Baseline
- Expected: `7e71120bec3d5337d18013697110685e892219ec`
- Actual: `7e71120bec3d5337d18013697110685e892219ec`
- HEAD == origin/main: YES
- Working tree: clean (only the 5 new preparation artifacts added)

## 3. Content-ID Decision

Final convention: **reuse the source record's native `id` field**,
prefixed by category (`glossary:gl-001`, `formula:formula-01`,
`reference:ref-01`), matching the pattern `academy:fund-01` and
`entity:algae` already follow. Old → new mappings for the 3 affected
seed fixtures:

- `glossary:free-chlorine` → `glossary:gl-001` (`es: missing` preserved)
- `formula:pool-volume` → `formula:formula-01` (`es: missing` preserved)
- `reference:ideal-pool-levels` → `reference:ref-01` (`es: missing` preserved)

Not executed in this phase — specification only. `data/i18n/translation-status.json` is byte-identical to baseline.

## 4. Spanish Data Model

**Option 1 selected**: Spanish fields embedded beside English fields, as
a nested `es` object per record, in the same source JSON file
(`data/glossary.json`, `data/formulas.json`, `data/reference.json`).
Rejected Option 2 (sibling `-es.json` files, higher drift risk) and
Option 3 (dictionary keyed by content ID, only fits hand-authored-HTML
string-replacement, not JSON-driven generation). Full rationale in the
architecture doc Section 4. Not implemented — all three source files
confirmed byte-identical to baseline.

## 5. Field Localization Matrix

Full field-by-field matrix for Glossary (12 fields), Formulas (19
fields), and Reference (14 fields) in the architecture doc Section 5.
Key findings: `relatedCalculators`/`relatedArticles`/`relatedFormulas`/
`relatedGlossary`/`relatedTopics` are all DERIVED (resolved at render
time, never hand-translated); formula `equation` is CONDITIONAL with its
own dedicated safety contract (Section 8 below); `references`/`sources`
citation fields are DO NOT TRANSLATE (they name English-language source
documents).

## 6. Relationship Architecture

Full inventory in the architecture doc Section 6. Headline finding: all
three families share the English-URL-literal `relatedCalculators`
problem; Formulas additionally has two more relationship shapes
(`relatedGlossary` uses a bare same-family slug-suffix string —
**14 reference occurrences (13 unique missing glossary terms) across 7 of the 9 formulas point at glossary
entries that do not exist**, a genuine pre-existing English-content data
gap — and `relatedTopics` is cross-family, referencing both `formulas/`
and `reference/` slugs). A single generic resolver
(`resolveRelatedLink()`, spec only, not implemented) is designed to
normalize all these shapes, look up translation status, and apply an
explicit fallback policy: **Policy A — retain the English target when no
Spanish translation exists**, matching the already-accepted Phase 8E–8I
precedent exactly.

## 7. Glossary First-Wave

- Qualifying count: **54** of 100 glossary terms (rule: `relatedCalculators`
  references ≥1 of the 13 Phase 8I Spanish calculators)
- Exact candidate list: `data/i18n/es/glossary-first-wave.json` (54
  records, each with native ID, English URL, title, qualifying-calculator
  cross-references, and inclusion reason)
- Non-qualifying: 46
- Malformed relationship references: 0
- References to nonexistent calculator files: 0
- Determinism: verified — regenerating the selection logic twice from
  the same source produced a byte-identical manifest

## 8. Formula Safety

- Formulas audited: **9/9** (data records) + confirmed the "10th" Phase
  8K page count is `formulas/index.html`, a hub with no equation
- Equation risks: **8 of 9** formulas contain natural-language English
  words embedded directly inside the equation string (not just
  formula-01 — this generalizes across nearly the whole family); **1 of
  9 (formula-04)** is not a mathematical equation at all — a full prose
  explanation of why no formula is published; **1 of 9 (formula-09,
  LSI)** is nearly pure symbolic/acronym notation, the lowest-risk case
- Safety contract: preserve all numeric constants
  (7.48, 0.013344, 0.000224, 0.0000834, 0.000133, 12.1), all operators,
  all symbolic variable identities, and unit-abbreviation semantics;
  original English equations remain canonical source of truth
- Result: a structured equation representation (separating
  natural-language labels from operators/constants/symbols) should be
  built before any formula is translated — not implemented in Phase 8L

## 9. URL Architecture

Confirmed identical to the Phase 8E–8I precedent: English slug retained
under `/es/` prefix (`/es/glossary/free-chlorine`, etc.), self-canonical
per language, no localized slugs, no redirect-interaction edge cases in
the recommended scope. **Important scope-narrowing finding**: `reference/`
contains 37 real pages but only **25** are generated from
`data/reference.json`'s clean JSON-driven architecture — the other 12
use a structurally different, older template with no JSON data source
and remain out of scope (architecturally equivalent to the already-
excluded Guides/Resources/Comparisons family).

## 10. Schema / Metadata / hreflang

| Mechanism | Status |
|---|---|
| `<html lang>` | ADDITIVE REQUIRED (hardcoded `lang="en"` in all 3 generators) |
| Canonical | ADDITIVE REQUIRED (generators use apex-only `canonicalUrl()`, not the already-existing language-aware `getLocalizedCanonical()`) |
| hreflang | ADDITIVE REQUIRED (not generated at all today by any of the 3 generators) |
| Language switcher | ADDITIVE REQUIRED (not wired in) |
| JSON-LD schema | ADDITIVE REQUIRED, exact per-family shape not yet audited field-by-field (open item for Phase 8M) |
| Sitemap eligibility | SUPPORTED (already language-prefix-aware via `stripLanguageSegment()`) |
| Navigation/search-index gating | SUPPORTED (already category-agnostic `TRANSLATED_ES_URLS` filter) |

Nothing is BLOCKED — every additive item reuses already-proven `js/i18n/*` primitives; none requires architectural redesign.

## 11. Drift / Synchronization Model

Embedding Spanish content inside the same English record (Task C's
Option 1) structurally prevents orphaned Spanish content (deleting the
English record deletes its Spanish content automatically) and is immune
to English-slug renames (native ID, not slug, anchors the pairing). A new
`esLastReviewed` field (mirroring the existing `lastReviewed` field) is
proposed to detect stale Spanish copy. Relationships are resolved from
live current data at render time, never cached, so relationship changes
can't leave stale Spanish links. Full detail in architecture doc Section
10. Not implemented.

## 12. Phase 8M Architecture

A 16-component implementation table (content identity through
deterministic build behavior) is provided in the architecture doc
Section 11, each row specifying the existing module, required change, any
new module, inputs/outputs, and validation approach — intended to let a
future implementation begin directly without re-deriving the design.

## 13. Readiness

| Family | Status | Reason |
|---|---|---|
| Glossary | NOT READY | Lightest blocker of the three (clean relationships, 0 broken refs, deterministic 54-record first-wave manifest now exists) but still depends on shared not-yet-built plumbing (`es`-object data model, link resolver, generator hreflang/canonical/lang wiring) |
| Formulas | NOT READY | Requires the structured equation-safety representation to be designed and built (not just specified) plus resolver tolerance for its 14 broken `relatedGlossary` reference occurrences to be proven, not just documented |
| Reference | NOT READY | Family is not internally uniform (25 of 37 pages are JSON-driven; 12 are a different, older template) — the 25-page scope boundary must be explicitly re-confirmed at Phase 8M's start, plus the same shared plumbing dependency as the other two |

No family is READY today. All three share the same root blocker: the
`es`-object data model, the related-link resolver, and the three
generators' additive hreflang/canonical/lang wiring do not exist yet for
any family — this is "additive work not yet done," correctly classified
as NOT READY rather than READY-because-the-design-looks-reasonable.

## 14. Validation

- Phase 8L validator: PASS (see below)
- Phase 8L tests: PASS (see below)
- Broken links: 0 (539 pages)
- URL/indexation: 0 violations (539 pages, 491 sitemap URLs — unchanged from baseline)
- Sitemap: byte-identical to baseline
- Navigation: 535 records, byte-identical to baseline
- Search: 492 records, byte-identical to baseline
- Schema/data/entities/trust/chemistry: all PASS (chemistry-knowledge: 19 pre-existing unrelated warnings, unchanged)
- Accessibility: score 100
- Calculator regression: 13/13 intact, `js/calc-utils.js` byte-identical to baseline
- Determinism: glossary-first-wave manifest, relationship inventory, and formula audit all reproduced byte-identically across 2 independent runs

## 15. Production Change Certification

- Spanish production pages created: 0
- English production pages changed: 0
- Spanish production URLs added: 0
- Spanish sitemap URLs added: 0
- Spanish navigation records added: 0
- Spanish search records added: 0
- Production calculator pages changed: 0
- Calculator logic changed: 0
- Production schema changed: 0
- Production hreflang pairs added: 0
- Production canonical URLs changed: 0

## 16. Phase Gate

**OPTION B — ADDITIONAL PREPARATION REQUIRED.**

Exact blocker for all three families: the shared plumbing this phase
specified (the `es`-object Spanish data model, the `resolveRelatedLink()`
resolver module, and the additive hreflang/canonical/`html lang`/language-
switcher wiring into `generate-glossary.js`/`generate-formulas.js`/
`generate-reference.js`) does not exist yet — it was designed in this
phase but deliberately not built, per the phase's explicit
preparation-only boundary. Formulas additionally needs a structured
equation representation built before translation; Reference additionally
needs its 25-vs-37-page scope boundary re-confirmed at the start of
whichever phase implements it.

---

## Production changes (informational)

**NONE to any existing production file.** New files added by this phase:
`docs/PHASE-8L-SPANISH-REFERENCE-LOCALIZATION-ARCHITECTURE.md`,
`reports/phase-8l-status.md`, `scripts/validate-phase-8l.js`,
`scripts/test-phase-8l.js`, `data/i18n/es/glossary-first-wave.json` (a
deterministic candidate manifest containing no translated prose — native
IDs, English URLs, and calculator cross-references only). Read-only
regression-validator runs performed during this phase incidentally
regenerated cosmetic build-artifact timestamps (the same well-established
pattern documented in every prior phase's status report); these were
reverted via `git checkout HEAD -- .` before finalizing this report.
