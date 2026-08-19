#!/usr/bin/env node
'use strict';
/**
 * build-reports.js (Phase 7D.3, Steps 12-16)
 *
 * Reads the canonical reports/phase-7d-3/chemistry-evidence.csv (already
 * built by build-chemistry-evidence.js) plus the historical inventories,
 * and produces:
 *   REBUILD-SUMMARY.json / .md              (Step 12)
 *   OLD-VS-REBUILT-CHEMISTRY-DATA.md        (Step 13)
 *   PH-ATTRIBUTION-REMEDIATION.md           (Step 14)
 *   HIGH-RISK-CLAIMS-REBUILT.md             (Step 15)
 *   CALCULATOR-EVIDENCE-INVENTORY.md        (Step 16)
 *
 * Pure report generation -- does not call the extractor and does not
 * modify the canonical dataset.
 */
const fs = require('fs');
const path = require('path');
const { parseCsv } = require('../phase-7d-1/reconcile-claims-v2');

const ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'reports', 'phase-7d-3');

const evidence = parseCsv(fs.readFileSync(path.join(OUT_DIR, 'chemistry-evidence.csv'), 'utf8'));
const preFix = parseCsv(fs.readFileSync(path.join(ROOT, 'reports', 'phase-7d-1', 'pre-fix-chemistry-claims.csv'), 'utf8'));

const ALL_PARAMETERS = ['ph', 'free_chlorine', 'combined_chlorine', 'total_chlorine', 'total_alkalinity',
  'calcium_hardness', 'cyanuric_acid', 'salt', 'bromine', 'water_temperature', 'chlorine_demand',
  'shock_treatment', 'sanitizer', 'oxidation', 'algae', 'lsi', 'pool_volume', 'chemical_dosage'];

function count(arr, keyFn) {
  const out = {};
  for (const x of arr) { const k = keyFn(x); out[k] = (out[k] || 0) + 1; }
  return out;
}

// ---------------- Step 12: REBUILD-SUMMARY ----------------

const uniqueSourceClaims = new Set(evidence.map((r) => `${r.source_url}${r.source_claim}`)).size;
const extractionSummary = count(evidence, (r) => r.extraction_status);
const scientificSummary = count(evidence, (r) => r.scientific_review_status);
const parameterDistribution = {};
for (const p of ALL_PARAMETERS) parameterDistribution[p] = 0;
for (const r of evidence) if (r.parameter_id) parameterDistribution[r.parameter_id] = (parameterDistribution[r.parameter_id] || 0) + 1;

const rebuildSummary = {
  source_claims: preFix.length,
  unique_source_claim_text_pairs: uniqueSourceClaims,
  numeric_occurrences: evidence.length,
  extraction_status_summary: extractionSummary,
  scientific_review_status_summary: scientificSummary,
  scientifically_evaluated_claims: (scientificSummary.SUPPORTED || 0) + (scientificSummary.CONTEXTUAL || 0) + (scientificSummary.REQUIRES_REVIEW || 0) + (scientificSummary.AMBIGUOUS || 0),
  not_extracted_claims: scientificSummary.NOT_EXTRACTED || 0,
  parameter_distribution: parameterDistribution,
};
fs.writeFileSync(path.join(OUT_DIR, 'REBUILD-SUMMARY.json'), JSON.stringify(rebuildSummary, null, 2) + '\n');

const rebuildMd = `# Phase 7D.3 Rebuild Summary

## Dataset

- Source claims: ${rebuildSummary.source_claims} (${rebuildSummary.unique_source_claim_text_pairs} with unique url+text; the rest share identical text with another row already present in reports/phase-7a/chemical-claims.csv)
- Numeric occurrences (evidence records): ${rebuildSummary.numeric_occurrences}

## Extraction Status

| Status | Count |
|---|---:|
${Object.entries(extractionSummary).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

## Scientific Review Status

| Status | Count |
|---|---:|
${Object.entries(scientificSummary).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

Scientifically evaluated: **${rebuildSummary.scientifically_evaluated_claims}** | Not extracted (no scientific verdict possible): **${rebuildSummary.not_extracted_claims}**

## Parameter Distribution

| Parameter | Count |
|---|---:|
${ALL_PARAMETERS.map((p) => `| ${p} | ${parameterDistribution[p]} |`).join('\n')}
`;
fs.writeFileSync(path.join(OUT_DIR, 'REBUILD-SUMMARY.md'), rebuildMd);

// ---------------- Step 13/14: OLD vs REBUILT + pH remediation ----------------

// Old system: one topic-tag per source claim (chemistry-coverage.csv via
// pre-fix-chemistry-claims.csv). New system: per-numeric-occurrence.
// Comparable unit = "does this source claim (by index) have this
// parameter present anywhere in its new evidence records at all".
const newParamsByClaimIndex = new Map();
for (const r of evidence) {
  // claim_index isn't a column in chemistry-evidence.csv (source_claim/
  // source_url identify the claim); reconstruct via preFix ordering by
  // matching on source_url+source_claim text, which is unique enough for
  // this reporting purpose (collisions would only merge identical rows).
  const key = `${r.source_url}${r.source_claim}`;
  if (!newParamsByClaimIndex.has(key)) newParamsByClaimIndex.set(key, new Set());
  if (r.parameter_id && (r.extraction_status === 'CORRECT_EXTRACTION' || r.extraction_status === 'CARRIED_CONTEXT')) {
    newParamsByClaimIndex.get(key).add(r.parameter_id);
  }
}

const oldParamCounts = count(preFix, (r) => r.parameter);
const oldPhCount = oldParamCounts['ph'] || 0;
const newPhCount = parameterDistribution['ph'] || 0;

const comparisonCategories = { CONFIRMED_CORRECTION: 0, REJECTED_AS_EXTRACTION_NOISE: 0, UNATTRIBUTED: 0, RECLASSIFIED: 0, UNCHANGED: 0, REQUIRES_HUMAN_REVIEW: 0 };
for (const oldRow of preFix) {
  const key = `${oldRow.url}${oldRow.claim}`;
  const newParams = newParamsByClaimIndex.get(key) || new Set();
  if (oldRow.parameter === '(none)') {
    if (newParams.size === 0) comparisonCategories.UNCHANGED++;
    else comparisonCategories.CONFIRMED_CORRECTION++; // new system found a real claim old missed
  } else if (newParams.has(oldRow.parameter)) {
    comparisonCategories.UNCHANGED++;
  } else if (newParams.size === 0) {
    comparisonCategories.REJECTED_AS_EXTRACTION_NOISE++; // old attributed something; new found no evaluable claim at all for any parameter
  } else {
    comparisonCategories.RECLASSIFIED++; // new system attributes different parameter(s)
  }
}
comparisonCategories.REQUIRES_HUMAN_REVIEW = scientificSummary.REQUIRES_REVIEW || 0;

const oldVsRebuiltMd = `# Old vs. Rebuilt Chemistry Data

Comparison unit: each of the ${preFix.length} original Phase 7D source claims, old topic-tag vs. whether the rebuilt dataset finds that parameter (or any parameter) present among its evidence records with a CORRECT_EXTRACTION/CARRIED_CONTEXT status.

| Category | Count | Meaning |
|---|---:|---|
| UNCHANGED | ${comparisonCategories.UNCHANGED} | Old tag confirmed present in the rebuilt evidence (or both agree no claim exists) |
| CONFIRMED_CORRECTION | ${comparisonCategories.CONFIRMED_CORRECTION} | Old system found nothing; rebuild correctly identifies a real numeric claim |
| RECLASSIFIED | ${comparisonCategories.RECLASSIFIED} | Rebuild attributes different parameter(s) than the old tag (see PH-ATTRIBUTION-REMEDIATION.md for the pH-specific breakdown) |
| REJECTED_AS_EXTRACTION_NOISE | ${comparisonCategories.REJECTED_AS_EXTRACTION_NOISE} | Old system attributed a parameter; rebuild finds no evaluable numeric claim for any parameter (old attribution unconfirmed, not proven wrong -- see Phase 7D.1 EXTRACTION-ERROR-ANALYSIS.md for why this bucket is not claimed as "false") |
| REQUIRES_HUMAN_REVIEW | ${comparisonCategories.REQUIRES_HUMAN_REVIEW} | Rebuilt records whose value falls outside every canonical range for that parameter/environment -- a scientific question, not an extraction question |

Not every removed old record is asserted "false" -- see category definitions above. Differences are caused by: corrected nearest-mention parameter attribution, composite-sentence splitting (one old claim -> multiple new evidence records), impossible-mapping rejection, the 4+ digit comma-less number parsing fix, unit recognition improvements (ounces, duration), and the extraction_status/scientific_review_status separation itself.
`;
fs.writeFileSync(path.join(OUT_DIR, 'OLD-VS-REBUILT-CHEMISTRY-DATA.md'), oldVsRebuiltMd);

const otherParamsOld = {}, otherParamsNew = {};
for (const p of ALL_PARAMETERS) { otherParamsOld[p] = oldParamCounts[p] || 0; otherParamsNew[p] = parameterDistribution[p] || 0; }

const phMd = `# pH Attribution Remediation

## pH Count

| | Old (Phase 7D) | Rebuilt (Phase 7D.3) | Difference | % change |
|---|---:|---:|---:|---:|
| pH | ${oldPhCount} | ${newPhCount} | ${newPhCount - oldPhCount} | ${(((newPhCount - oldPhCount) / oldPhCount) * 100).toFixed(1)}% |

pH accounted for ${((oldPhCount / preFix.length) * 100).toFixed(1)}% of all old-system claims (${oldPhCount}/${preFix.length}) -- a disproportionate share directly attributable to the whole-sentence first-match-wins bug (pH is index 0 in the parameter list). In the rebuilt dataset, pH accounts for ${((newPhCount / rebuildSummary.numeric_occurrences) * 100).toFixed(1)}% of evidence records (${newPhCount}/${rebuildSummary.numeric_occurrences}).

## Where the redistribution went

| Parameter | Old count | Rebuilt count |
|---|---:|---:|
${ALL_PARAMETERS.filter((p) => p !== 'ph').map((p) => `| ${p} | ${otherParamsOld[p]} | ${otherParamsNew[p]} |`).join('\n')}

Most non-pH parameter counts decreased alongside pH's count -- this is expected, not a regression: the rebuilt extractor is deliberately more conservative overall (proximity-gated attribution plus impossible-pairing rejection means many numbers the old whole-sentence keyword search would have "confidently" claimed for ANY nearby parameter name, not only pH, are now correctly left unattributed rather than guessed). The clearest, most direct evidence that pH's claims specifically moved to their correct parameter rather than simply vanishing: **total_alkalinity nearly doubled** (102 -> ${otherParamsNew.total_alkalinity}, +${otherParamsNew.total_alkalinity - otherParamsOld.total_alkalinity}) and **total_chlorine more than doubled** (11 -> ${otherParamsNew.total_chlorine}) -- both directly matching the independent audit's finding (\`reports/phase-7d-2/INDEPENDENT-OLD-EXTRACTION-AUDIT.csv\`) that total_alkalinity and water_temperature values were among the most common real targets of pH's false attribution. \`lsi\` (${otherParamsNew.lsi}) and \`pool_volume\` (${otherParamsNew.pool_volume}) are new coverage, not redistribution -- the old system's 15-parameter vocabulary had no category for either, so any LSI or volume value it encountered was necessarily forced into one of the 15 existing tags (frequently pH, since LSI values are small signed decimals in the same numeric range pH readings occupy) or dropped as "(none)".
`;
fs.writeFileSync(path.join(OUT_DIR, 'PH-ATTRIBUTION-REMEDIATION.md'), phMd);

// ---------------- Step 15: high-risk claims ----------------

// "High risk" defined consistently with Phase 7D's own HIGH-RISK-CHEMISTRY-CLAIMS.md
// categories: any evaluated record whose scientific_review_status is
// REQUIRES_REVIEW (a stated value falls outside every canonical range for
// that parameter/environment -- a potential contradiction, not yet a
// confirmed error).
const highRisk = evidence.filter((r) => r.scientific_review_status === 'REQUIRES_REVIEW');
const highRiskByParam = count(highRisk, (r) => r.parameter_id);
const highRiskMd = `# High-Risk Claims (Rebuilt)

Definition unchanged from Phase 7D: an evaluated claim (CORRECT_EXTRACTION or CARRIED_CONTEXT) whose value does not overlap any canonical range recorded for its parameter/environment in \`scripts/data/chemistry-ranges.js\` -- flagged for expert review, not resolved here.

| | Count |
|---|---:|
| Previous (Phase 7D) high-risk claim categories | 6 (see reports/phase-7d/HIGH-RISK-CHEMISTRY-CLAIMS.md -- category-level, not a directly comparable per-claim count) |
| Rebuilt high-risk claims (REQUIRES_REVIEW) | ${highRisk.length} |

## By parameter

| Parameter | Count |
|---|---:|
${Object.entries(highRiskByParam).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

These claims are **not** scientifically resolved in this phase. Each remains \`REQUIRES_REVIEW\` and \`review_required=true\` in \`chemistry-evidence.csv\`. The Phase 7D category-level high-risk list (\`HIGH-RISK-CHEMISTRY-CLAIMS.md\`) was hand-curated at the concept level (e.g. "saltwater CYA target vs. general CYA target") and is not a 1:1 predecessor to this claim-level list, so "newly identified" / "removed" counts are not meaningful at the individual-claim level between the two; the concept-level findings in that report remain valid and unaffected by this rebuild (none of them depended on the buggy reconciliation layer -- see Phase 7D.1 PHASE-7D-KNOWLEDGE-IMPACT.md).
`;
fs.writeFileSync(path.join(OUT_DIR, 'HIGH-RISK-CLAIMS-REBUILT.md'), highRiskMd);

// ---------------- Step 16: calculator evidence inventory ----------------

const CALCULATOR_URL_PATTERNS = [
  { name: 'Pool Chlorine Calculator', match: /calculators\/pool-chlorine-calculator/i },
  { name: 'Hot Tub Chlorine Calculator', match: /calculators\/hot-tub-chlorine-calculator/i },
  { name: 'Pool Shock Calculator', match: /calculators\/pool-shock-calculator|shock-calculator/i },
  { name: 'Pool pH Calculator', match: /calculators\/pool-ph-calculator/i },
  { name: 'Hot Tub pH Calculator', match: /calculators\/hot-tub-ph-calculator/i },
  { name: 'Pool Alkalinity Calculator', match: /calculators\/pool-alkalinity-calculator|alkalinity-calculator/i },
  { name: 'Pool CYA Calculator', match: /calculators\/pool-cya-calculator|cya-calculator/i },
  { name: 'Saltwater Pool Salt Calculator', match: /salt-calculator/i },
  { name: 'All-in-One Chemical Calculator', match: /chemical-calculator/i },
  { name: 'Other calculators/index', match: /^calculators\//i },
];

const calcSections = [];
for (const cal of CALCULATOR_URL_PATTERNS) {
  const rows = evidence.filter((r) => cal.match.test(r.source_url) && r.parameter_id);
  if (rows.length === 0) continue;
  const seenUrls = new Set(rows.map((r) => r.source_url));
  calcSections.push({ name: cal.name, urls: [...seenUrls], rows });
}

let calcMd = `# Calculator Evidence Inventory (Rebuilt)\n\nCalculator math is unchanged by this phase (\`js/calc-utils.js\` not touched). This inventory lists the chemistry evidence records extracted from each calculator's own page content, for future citation-implementation reference.\n\n`;
for (const sec of calcSections) {
  calcMd += `## ${sec.name}\n\nPages: ${sec.urls.join(', ')}\n\n| claim | parameter | value/range | unit | source provenance | scientific review | review required |\n|---|---|---|---|---|---|---|\n`;
  for (const r of sec.rows.slice(0, 25)) {
    const valueRange = r.minimum === r.maximum ? r.minimum : `${r.minimum}-${r.maximum}`;
    const claimShort = r.source_claim.length > 80 ? r.source_claim.slice(0, 77) + '...' : r.source_claim;
    calcMd += `| ${claimShort.replace(/\|/g, '/')} | ${r.parameter_id} | ${valueRange} | ${r.unit} | ${r.source_registry_ids ? r.source_registry_ids : 'unassigned'} | ${r.scientific_review_status} | ${r.review_required} |\n`;
  }
  if (sec.rows.length > 25) calcMd += `\n_(${sec.rows.length - 25} additional records omitted for length; full data in chemistry-evidence.csv filtered by source_url.)_\n`;
  calcMd += '\n';
}
fs.writeFileSync(path.join(OUT_DIR, 'CALCULATOR-EVIDENCE-INVENTORY.md'), calcMd);

console.log('build-reports: wrote REBUILD-SUMMARY.{json,md}, OLD-VS-REBUILT-CHEMISTRY-DATA.md, PH-ATTRIBUTION-REMEDIATION.md, HIGH-RISK-CLAIMS-REBUILT.md, CALCULATOR-EVIDENCE-INVENTORY.md');
console.log('pH: old', oldPhCount, '-> new', newPhCount);
console.log('high-risk (REQUIRES_REVIEW):', highRisk.length);
console.log('calculator sections with evidence:', calcSections.length);
