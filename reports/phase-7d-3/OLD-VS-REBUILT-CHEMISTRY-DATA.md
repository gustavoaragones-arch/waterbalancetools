# Old vs. Rebuilt Chemistry Data

Comparison unit: each of the 3933 original Phase 7D source claims, old topic-tag vs. whether the rebuilt dataset finds that parameter (or any parameter) present among its evidence records with a CORRECT_EXTRACTION/CARRIED_CONTEXT status.

| Category | Count | Meaning |
|---|---:|---|
| UNCHANGED | 1767 | Old tag confirmed present in the rebuilt evidence (or both agree no claim exists) |
| CONFIRMED_CORRECTION | 54 | Old system found nothing; rebuild correctly identifies a real numeric claim |
| RECLASSIFIED | 103 | Rebuild attributes different parameter(s) than the old tag (see PH-ATTRIBUTION-REMEDIATION.md for the pH-specific breakdown) |
| REJECTED_AS_EXTRACTION_NOISE | 2009 | Old system attributed a parameter; rebuild finds no evaluable numeric claim for any parameter (old attribution unconfirmed, not proven wrong -- see Phase 7D.1 EXTRACTION-ERROR-ANALYSIS.md for why this bucket is not claimed as "false") |
| REQUIRES_HUMAN_REVIEW | 589 | Rebuilt records whose value falls outside every canonical range for that parameter/environment -- a scientific question, not an extraction question |

Not every removed old record is asserted "false" -- see category definitions above. Differences are caused by: corrected nearest-mention parameter attribution, composite-sentence splitting (one old claim -> multiple new evidence records), impossible-mapping rejection, the 4+ digit comma-less number parsing fix, unit recognition improvements (ounces, duration), and the extraction_status/scientific_review_status separation itself.
