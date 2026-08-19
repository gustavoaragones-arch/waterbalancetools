#!/usr/bin/env node
'use strict';
/**
 * classify-unclassified.js (Phase 7F.1, Step 12)
 *
 * Classifies the 133 "UNREVIEWED" (Phase 7E.1 default-bucket) conflict
 * records into the Step 12 vocabulary: REAL_CHEMISTRY_CLAIM,
 * NON_CHEMISTRY_ARTIFACT, CONTEXTUAL_DIFFERENCE, EXAMPLE_CALCULATION,
 * SOURCE_SCOPE_ISSUE, EXTRACTION_LIMITATION, DEFERRED.
 */
const fs = require('fs');
const path = require('path');
const { parseCsv } = require('../phase-7d-1/reconcile-claims-v2');

const ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'reports', 'phase-7f-1');

const conflicts = parseCsv(fs.readFileSync(path.join(ROOT, 'reports', 'phase-7e-1', 'conflicting-claims.csv'), 'utf8'));
const unclassified = conflicts.filter((r) => r.resolution_status === 'UNREVIEWED');

// New pattern found this phase: "Examples <Heading> A pool owner..." /
// "Test(s) shows: FC X ppm, pH Y, TA Z ppm" -- troubleshooting worked
// examples whose section heading ("Examples") wasn't caught by the
// original claim_type detector (which looks for "for example"/"suppose",
// not a bare section heading).
const EXAMPLE_SECTION_RE = /\bExamples? [A-Z][a-z]+ing\b|\bExamples? [A-Z][a-z]+ [A-Z]|Test(?:ing|s)? shows:|tests?:\s*FC|Pool tests:|A pool owner\b/;
const PROPORTION_RE = /\b(remains as|is active|only \d+[-–]?\d*%|deplete by \d+%|active form)\b/i;
const COMPARISON_RE = /\b(roughly the same|compared to|same as|equivalent to)\b/i;
const DOSAGE_COEFFICIENT_RE = /\btypical dose for raising\b|\bcoefficient\b|\bper (10|10,000|10000) (ppm|gal)/i;

function classify(r) {
  const text = r.source_claim;
  if (EXAMPLE_SECTION_RE.test(text)) {
    return { category: 'EXAMPLE_CALCULATION', reason: 'Troubleshooting worked-example section ("Examples..."/"Test(s) shows:...") -- describes a specific scenario\'s readings, not a general recommendation. The original claim_type detector only recognizes "for example"/"suppose"-style phrasing, missing this section-heading pattern -- a real, newly-found detection gap, not corrected in the extractor this phase (out of scope; documented for a future extraction pass).' };
  }
  if (PROPORTION_RE.test(text)) {
    return { category: 'NON_CHEMISTRY_ARTIFACT', reason: 'Describes what fraction/percentage of the parameter is in an active chemical form (e.g. "22% remains as HOCl"), a chemistry-equilibrium fact, not a concentration target -- not comparable to a canonical range.' };
  }
  if (COMPARISON_RE.test(text)) {
    return { category: 'CONTEXTUAL_DIFFERENCE', reason: 'Comparison/equivalence statement between two different readings or scenarios, not an assertion that either value is itself a target.' };
  }
  if (DOSAGE_COEFFICIENT_RE.test(text)) {
    return { category: 'NON_CHEMISTRY_ARTIFACT', reason: 'Dosage coefficient / formula constant, not a target range -- same category as the already-disclosed calculator dosing-constant findings (Phase 7F Trust Language Audit).' };
  }
  return { category: 'DEFERRED', reason: 'No confident automated classification and not individually reviewed this phase -- genuinely lower priority per Step 11/12 (not safety-critical, not Tier-1, not a confirmed source conflict). Deferred, not resolved.' };
}

const results = unclassified.map((r) => {
  const c = classify(r);
  return { claim_id: r.claim_id, source_file: r.source_file, parameter_id: r.parameter_id, production_value: r.production_value, production_unit: r.production_unit, category: c.category, reason: c.reason, source_claim: r.source_claim };
});

const summary = {};
for (const r of results) summary[r.category] = (summary[r.category] || 0) + 1;
console.log('Unclassified (133) categorization:', summary);

fs.mkdirSync(OUT_DIR, { recursive: true });
function toCsv(rows, fields) {
  const esc = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [fields.join(','), ...rows.map((r) => fields.map((f) => esc(r[f])).join(','))].join('\n') + '\n';
}
fs.writeFileSync(path.join(OUT_DIR, 'unclassified-categorization.csv'), toCsv(results, ['claim_id', 'source_file', 'parameter_id', 'production_value', 'production_unit', 'category', 'reason', 'source_claim']));
fs.writeFileSync(path.join(OUT_DIR, 'unclassified-categorization-summary.json'), JSON.stringify({ total: results.length, summary }, null, 2) + '\n');
module.exports = { results, summary };
