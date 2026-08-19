# Phase 7D.1 — Extraction Error Analysis

This is a **full-population** analysis (all 3,933 Phase 7A claims re-classified and compared), not a sample extrapolation, made possible because the reconciliation is deterministic and cheap to re-run over the whole corpus. A 65-row curated sample for manual/qualitative review is separately provided in `SAMPLE-EXTRACTION-AUDIT.csv`.

## Headline numbers (old classifier vs. new classifier, full population)

| Metric | Count | % of 3,933 |
|---|---|---|
| Total claims | 3,933 | 100% |
| Old attribution confirmed correct by new extractor | 1,781 | 45.3% |
| Old attribution confirmed **misclassified** | 103 | 2.6% |
| Old found nothing; new correctly found a real chemistry claim | 54 | 1.4% |
| Old attributed a parameter; new abstains (no confident CORRECT/CARRIED match for any parameter in that sentence) | 1,995 | 50.7% |

**Confirmed parameter misclassification rate: 2.6% of all claims (5.5% of the 1,884 claims where the old classifier had attributed *something*).** This is a lower-bound, deterministic figure, not a sample estimate.

## Why "old attributed something, new abstains" is 50.7% and what it means

This is the largest bucket and needs honest interpretation: it does **not** mean 51% of the old classifications were wrong. It means the new, deliberately conservative extractor could not confirm a CORRECT_EXTRACTION or CARRIED_CONTEXT match for *any* parameter in that sentence -- most commonly because:

1. The sentence's only numeric content is non-chemistry noise (page metadata, reading times, dates, unrelated counts) that the old classifier's less careful matching happened to still associate with a chemistry keyword present elsewhere in the sentence.
2. The sentence genuinely contains a chemistry claim, but in a phrasing the new extractor's clause-splitting/proximity logic does not yet resolve confidently (documented residual limitations below) -- these fall to `NO_PARAMETER_IN_CLAUSE` or `IMPOSSIBLE_MAPPING` rather than being forced into a possibly-wrong parameter.

The new system's design deliberately prefers "flag as unattributed" over "guess and risk being wrong" (Step 3/17 of this phase's brief). This trades recall for precision: fewer confident claims, but a much lower confirmed error rate among the ones it does make.

## Extraction-status breakdown (new system, at the individual-numeric-occurrence level)

3,933 source claims decompose into 6,060 individual numeric occurrences (composite sentences correctly yield multiple records instead of one merged/collapsed record -- Step 6):

| extraction_status | Count |
|---|---|
| NO_NUMERIC_CONTENT (no digit at all in the claim) | 2,410 |
| CORRECT_EXTRACTION | 1,344 |
| IMPOSSIBLE_MAPPING (parameter found, but unit/value_type is physically incompatible -- correctly rejected, not silently accepted) | 1,042 |
| NO_PARAMETER_IN_CLAUSE (a number with no confident nearby parameter) | 1,164 |
| CARRIED_CONTEXT (attributed via same-sentence carry-forward from an explicit prior clause) | 100 |

## Error-class breakdown (from the 65-row curated sample, `SAMPLE-EXTRACTION-AUDIT.csv`)

The classifications used were: `CORRECT_EXTRACTION`, `PARAMETER_MISCLASSIFICATION`, `COMPOSITE_SENTENCE` (old attribution unconfirmed on a multi-parameter sentence), `NON_CHEMISTRY_NUMERIC`. No sample row required `UNIT_MISCLASSIFICATION`, `VALUE_MISCLASSIFICATION`, or `CONTEXT_MISCLASSIFICATION` as a *primary* classification, because the old system (Phase 7D's `reconcile-claims.js`) did not attempt fine-grained unit/value typing at all -- it only mis-attributed the *parameter*. Unit- and value-type correctness are new capabilities introduced by this phase's extractor (`extract-claims-v2.js`), verified instead via the golden set and the impossible-mapping validator (see below), not against the old system's (nonexistent) unit predictions.

## Non-chemistry contamination rate

Sitewide, 2,410 / 3,933 (61.3%) of Phase 7A's extracted "claims" contain no numeric content at all -- these were never contaminated (nothing to misattribute), they are prose sentences that merely contain a chemistry keyword. Within the 3,650 claims (composite-decomposed to 6,060 records) that *do* contain numbers, the false-positive noise sources specifically identified and now filtered: HTML entity codes (`&#127919;`), ISO dates (`2026-06-01` tokenizing into 2026/06/01), and "N min read" UI chrome. These accounted for several of the pre-fix system's spurious extractions in the sample audit and are now excluded at the text-cleaning stage (`stripNonChemistryNoise()`).

## Golden-set accuracy

100/100 golden-set cases match expected extraction exactly (`npm run validate-chemistry-extraction`). 15/15 independently-declared impossible parameter/unit pairings (pH+ppm, pH+°F, water_temperature+ppm, pool_volume+ppm, etc.) are correctly rejected rather than silently accepted.

## Documented residual limitations (not fixed in this phase, disclosed rather than hidden)

1. **Single-clause multi-number attribution**: when one clause contains two or more numbers and only one nearby parameter mention (e.g. "Add 10 oz of chlorine per 10,000 gallons"), the nearer number gets attributed and the farther one may attach to the wrong nearest mention -- always still safety-checked by `isPlausiblePairing()`, so it fails safe (`IMPOSSIBLE_MAPPING`) rather than producing a wrong confident claim, but does not achieve full per-number semantic separation within a single clause.
2. **"N times" multiplier phrasing** (e.g. "10x the combined chlorine reading") is not yet recognized as `value_type: 'multiplier'`; it currently resolves to `unknown` and is safely flagged `IMPOSSIBLE_MAPPING` rather than mis-typed as a concentration.
3. **Environment carry-forward** is sentence-scoped only (resets between sentences) and uses the last-detected environment within a sentence, which can occasionally over-apply to an unrelated later clause within a very long sentence.

None of these limitations produce a *silent* misclassification in the golden set or impossible-mapping checks performed for this phase -- they produce either a correct result or an explicitly-flagged review state.
