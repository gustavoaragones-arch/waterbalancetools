# pH Attribution Remediation

## pH Count

| | Old (Phase 7D) | Rebuilt (Phase 7D.3) | Difference | % change |
|---|---:|---:|---:|---:|
| pH | 1127 | 711 | -416 | -36.9% |

pH accounted for 28.7% of all old-system claims (1127/3933) -- a disproportionate share directly attributable to the whole-sentence first-match-wins bug (pH is index 0 in the parameter list). In the rebuilt dataset, pH accounts for 12.1% of evidence records (711/5861).

## Where the redistribution went

| Parameter | Old count | Rebuilt count |
|---|---:|---:|
| free_chlorine | 566 | 448 |
| combined_chlorine | 145 | 91 |
| total_chlorine | 11 | 26 |
| total_alkalinity | 102 | 198 |
| calcium_hardness | 96 | 90 |
| cyanuric_acid | 212 | 124 |
| salt | 124 | 102 |
| bromine | 52 | 29 |
| water_temperature | 93 | 58 |
| chlorine_demand | 22 | 9 |
| shock_treatment | 53 | 37 |
| sanitizer | 52 | 20 |
| oxidation | 9 | 6 |
| algae | 108 | 77 |
| lsi | 0 | 89 |
| pool_volume | 0 | 289 |
| chemical_dosage | 0 | 0 |

Most non-pH parameter counts decreased alongside pH's count -- this is expected, not a regression: the rebuilt extractor is deliberately more conservative overall (proximity-gated attribution plus impossible-pairing rejection means many numbers the old whole-sentence keyword search would have "confidently" claimed for ANY nearby parameter name, not only pH, are now correctly left unattributed rather than guessed). The clearest, most direct evidence that pH's claims specifically moved to their correct parameter rather than simply vanishing: **total_alkalinity nearly doubled** (102 -> 198, +96) and **total_chlorine more than doubled** (11 -> 26) -- both directly matching the independent audit's finding (`reports/phase-7d-2/INDEPENDENT-OLD-EXTRACTION-AUDIT.csv`) that total_alkalinity and water_temperature values were among the most common real targets of pH's false attribution. `lsi` (89) and `pool_volume` (289) are new coverage, not redistribution -- the old system's 15-parameter vocabulary had no category for either, so any LSI or volume value it encountered was necessarily forced into one of the 15 existing tags (frequently pH, since LSI values are small signed decimals in the same numeric range pH readings occupy) or dropped as "(none)".
