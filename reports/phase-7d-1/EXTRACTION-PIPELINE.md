# Phase 7D.1 — Extraction Pipeline Trace

## Full pipeline as it existed going into this phase

```
source HTML (production pages)
    |
    v
scripts/audit-forensic/lib/util.js  (stripTags/extractMain -> plain body text per page)
    |
    v
scripts/audit-forensic/lib/chemistry.js  extractClaims()
    - splits page text into sentences
    - keeps a sentence if it contains a chemistry TERM or a UNIT_RE match
    - UNIT_RE grabs the FIRST number(-range)+unit match anywhere in the sentence
    - classifies claim_type (CALCULATED_VALUE / SAFETY_GUIDANCE / RULE_OF_THUMB / RANGE / EDITORIAL_SIMPLIFICATION)
    - NO parameter field is produced here at all
    |
    v
scripts/audit-forensic/run.js  topicOf()
    - whole-SENTENCE substring search against a fixed 9-topic list,
      first match in list order wins: ['free chlorine','total alkalinity',
      'cyanuric acid','calcium hardness','ph','shock','salt','bromine','algae']
    - writes result to claim.section
    - NOT proximity-based; a sentence mentioning two topics is attributed
      to whichever is earlier in this fixed list, regardless of which one
      the actual number belongs to
    |
    v
reports/phase-7a/chemical-claims.csv  (3,933 rows: url, section, claim,
    claim_type, units, confidence, source_present, source_quality,
    cross_page_consistency, risk_level, review_required)
    |
    v
scripts/phase-7d/reconcile-claims.js  classify()      <-- PRIMARY BUG LOCATION
    - findParameter(claim.claim) re-derives a parameter independently,
      IGNORING claim.section entirely
    - iterates Object.entries(ALIAS_INDEX) and returns the FIRST alias
      whose \b-bounded regex matches ANYWHERE in the full claim text
    - ALIAS_INDEX insertion order == PARAMETERS array order in
      chemistry-knowledge.js, and "ph" is the FIRST parameter in that
      array -> "ph" systematically wins as a false attractor for any
      sentence that merely contains the word "pH" anywhere, even when
      the sentence's actual numeric value belongs to a different,
      earlier-or-later-mentioned parameter (e.g. total alkalinity,
      calcium hardness, water temperature)
    - lo/hi are parsed from claim.units (Phase 7A's single first-match
      unit string) or, failing that, from the raw claim text -- with NO
      check that the matched number is actually adjacent to the winning
      parameter keyword
    |
    v
reports/phase-7d/chemistry-coverage.csv/.json  (3,933 rows, "parameter"
    column contaminated by the bug above)
```

## Root cause (confirmed by direct reproduction)

`findParameter()` in `scripts/phase-7d/reconcile-claims.js` performs **whole-text keyword search with first-match-wins**, not proximity-based number-to-parameter attribution. Because `pH`'s aliases are inserted first into `ALIAS_INDEX` (pH is index 0 in `PARAMETERS`), any sentence that mentions the word "pH" *anywhere* -- even in a clause with no number at all, while a completely different clause in the same sentence states an actual numeric total-alkalinity or temperature value -- is misclassified as a pH claim, and the numeric value nearest to whichever OTHER unit-bearing substring `claim.units` happened to capture gets attached to "ph" regardless of what it actually measures.

Confirmed real examples (see `SAMPLE-EXTRACTION-AUDIT.csv` for the full audited set):

- *"Balancing in Practice Start by adjusting total alkalinity to 80-120 ppm, which supports stable pH."* -> classified `parameter: ph`. The 80-120 ppm value belongs to total alkalinity; "pH" appears later in the sentence with no adjacent number at all.
- *"In a pool managed exclusively with a tablet feeder, CYA can reach problem levels (80-100 ppm) within one season and pH w[ill drift down]."* -> classified `parameter: ph`. The 80-100 ppm value belongs to cyanuric acid.
- *"Key Facts Chlorine demand roughly doubles for every 10°F rise in water temperature above 80°F. pH tends to rise in warm [water]."* -> classified `parameter: ph`, `units: 80°F`. The temperature values belong to water_temperature; "pH" is a separate clause with no number.

## Secondary finding (lower severity, same architectural class)

`topicOf()` in `scripts/audit-forensic/run.js` (Phase 7A) has the same whole-text/first-match-wins design, just with a different, longer topic list checked before "ph" (`free chlorine`, `total alkalinity`, `cyanuric acid`, `calcium hardness` are all checked before `ph`), which happens to make it less pH-biased in practice but does not make it correct -- e.g. a sentence about salt with a passing "free chlorine" mention would still be misattributed to `free chlorine`. **`claim.section` from this stage is not actually consumed by `reconcile-claims.js`** (it re-derives its own parameter independently), so this flaw did not directly cause the contamination the user observed, but it is the same class of defect and is corrected in this phase for consistency (see Step 16 / the new extractor).

## What was NOT contaminated

`scripts/data/chemistry-knowledge.js`, `chemistry-ranges.js`, `chemistry-sources.js`, and `chemistry-claims.js` (the canonical Phase 7D knowledge-layer files) were hand-authored directly from live external research (CDC/PHTA/NPIC), **not** derived programmatically from the buggy extraction pipeline. Only `reports/phase-7d/chemistry-coverage.csv/.json` (the reconciliation of the 3,933 extracted claims against that canonical data) is downstream of the bug and requires rebuild -- see `PHASE-7D-KNOWLEDGE-IMPACT.md`.
