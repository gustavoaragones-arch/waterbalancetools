# Phase 7U -- Production Changes

Per Section 16's default expectation ("NO PRODUCTION CALCULATOR CHANGES"), this phase made **no calculator, formula-page, or trust-panel behavior changes**. The only changes are documentation/provenance annotations to an existing reference dataset, made because this phase's own research materially strengthened (in 4 cases) or explicitly weakened (in 1 case) the evidentiary basis already implicit in that dataset's numbers.

## 1. `scripts/data/dataset-dosage-matrices.js`

**Change:** annotated 5 of 13 records' `notes` fields (no `coefficient`, `activePercent`, or any numeric field changed):
- `calcium-hypochlorite-65pct`, `calcium-hypochlorite-73pct`, `sodium-dichlor-56pct`, `trichlor-tablets-90pct`: added a note recording that Phase 7T's `FORMULA-03-AUDIT.md`/`SHOCK-DIVISOR-AUDIT.md` cross-validated these exact coefficients against PHTA's Water Chemistry Adjustment Guide and/or the Indiana DOH table (both fetched and read in full in Phase 7T).
- `muriatic-acid-31pct-ph`: added a note explicitly flagging this coefficient as unsourced (editorial-interpretation tier, per this dataset's own `sourcePriority` list) and not independently verified -- discovered this phase while researching the pH architecture question.

**Reason:** This dataset is the evidentiary backbone of the `IMPLEMENT`-classified shock Option B recommendation (`SHOCK-ARCHITECTURE-DECISION.md`) and was found, on full read, to already contain defensible coefficients that its own inline comments did not yet credit -- and one coefficient (pH-relevant) that genuinely lacks any support and should not be mistaken for validated. Both corrections are purely evidentiary record-keeping, matching the "narrowly-scoped explanatory correction" class of change already used repeatedly in Phase 7S/7T (e.g., the trust-panel LSI/alkalinity/calcium-hardness capability corrections).

**Risk:** None -- no calculator or generator behavior depends on the `notes` field's content; confirmed via `validate-datasets.js` (structural checks only) and a full-text search confirming no calculator JS reads this dataset at all (Phase 7T's `SHOCK-DIVISOR-AUDIT.md` already established this; reconfirmed this phase).

**Validation:** `node scripts/validate-datasets.js` -- PASS, 0 errors, 0 warnings, 16 datasets checked (unchanged from baseline). `node -e` record-count and coefficient-value checks confirm all 13 records and every numeric field are byte-identical to the Phase 7T baseline except the 5 `notes` fields listed above.

## 2. `scripts/data/chemistry-sources.js`

**Change:** added 2 new source records: `lamotte-acid-demand-index-2022` (LaMotte Company, "Acid Demand Index for Total Alkalinity Adjustment," fetched and read in full) and `taylor-k1005-instruction-manual-2012` (Taylor Technologies, K-1005 instruction card, fetched and read in full). 24 total sources (was 22 after Phase 7T).

**Reason:** these are the two new manufacturer-tier sources this phase's pH-architecture research fetched and read in full; registered per the established chemistry-evidence architecture rather than cited informally.

**Risk:** None -- additive only, no existing record modified or removed. Confirmed via `validate-provenance.js` (0 violations, no duplicate-ID conflict, unlike the near-miss caught in Phase 7T).

## 3. Regenerated outputs (no source-of-truth beyond item 1)

`data/datasets/dosage-matrices.json` (regenerated via `node scripts/generate-datasets.js`) and `reference/datasets/dosage-matrices/index.html` (regenerated via a full `npm run build`, with every unrelated file the build also touched -- the same pre-existing sitewide template drift documented in Phase 7S/7T -- reverted before commit). Content verified to contain the 5 new `notes` annotations and nothing else changed relative to the Phase 7T baseline (`git diff -w` on both files shows only the intended text).

## Not changed

- `js/calc-utils.js`, `js/calculator.js`: no function, constant, or signature touched. pH constants (6, 5) and the generic shock divisor (10000) remain exactly as Phase 7T left them, per the explicit `REQUIRES_EXPERT_REVIEW`/`ARCHITECTURAL_GAP` classification this phase reconfirms rather than resolves.
- `calculators/pool-ph-calculator.html`, `hot-tub-ph-calculator.html`, `pool-shock-calculator.html`, `hot-tub-shock-calculator.html` and their trust panels: no input, output, or disclosure text touched. The recommended architectures (`NARROW EXISTING TOOL` for pH, `IMPLEMENT` for shock's product selector) are both real UI/UX changes explicitly reserved for a dedicated future phase, per Section 16's default and this phase's own framing as an architecture-decision (not implementation) phase.
- `formulas-data.js` `formula-03` and `formula-02`: confirmed unchanged, matching `FORMULA-GOVERNANCE.md`'s explicit instruction not to reopen without direct contradictory evidence -- none was found.
- `chemistry-claims.js`, `chemistry-ranges.js`: untouched.
- No LSI calculator, no bromine calculator, no breakpoint calculator built.
