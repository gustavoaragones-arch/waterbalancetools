#!/usr/bin/env node
'use strict';
/**
 * validate-chemistry-extraction.js (Phase 7D.1, Step 17)
 *
 * Two things:
 *  1. Runs the extractor (scripts/phase-7d-1/extract-claims-v2.js) against
 *     the 100-case golden set (scripts/data/chemistry-extraction-golden-set.json)
 *     and fails if the extractor's live output no longer matches the
 *     recorded expected output -- this is what catches a future regression
 *     in the extraction logic itself.
 *  2. Independently re-derives "impossible mapping" detection (pH+ppm,
 *     pH+F, water_temperature+ppm, pool_volume+ppm, etc.) as a standalone
 *     check, so this validator does not merely trust the extractor's own
 *     self-reported extraction_status -- see isPlausiblePairing() cross-
 *     checked here against a second, independently-declared table.
 *
 * This is NOT wired into scripts/run-all-generators.js (the production
 * build) -- it validates a forensic-audit-data-quality concern, not
 * production HTML, matching how Phase 7A's own audit tooling is not a
 * build gate either. It IS wired into the Phase 7D.1 regression run
 * (npm run validate-chemistry-extraction) and should be run whenever
 * extract-claims-v2.js changes.
 */
const fs = require('fs');
const path = require('path');
const { extractFromSentence } = require('./phase-7d-1/extract-claims-v2');

const ROOT = path.join(__dirname, '..');
const GOLDEN_PATH = path.join(ROOT, 'scripts', 'data', 'chemistry-extraction-golden-set.json');

// Independently declared (not reused from extract-claims-v2.js) impossible
// pairings, so this validator doesn't just check the extractor agrees with
// itself.
const KNOWN_IMPOSSIBLE = [
  { parameter: 'ph', unit: 'ppm' },
  { parameter: 'ph', unit: 'mg/l' },
  { parameter: 'ph', unit: '°f' }, { parameter: 'ph', unit: 'f' },
  { parameter: 'ph', unit: 'gal' }, { parameter: 'ph', unit: 'gallons' },
  { parameter: 'ph', unit: 'lbs' }, { parameter: 'ph', unit: 'oz' },
  { parameter: 'water_temperature', unit: 'ppm' },
  { parameter: 'water_temperature', unit: 'mg/l' },
  { parameter: 'pool_volume', unit: 'ppm' },
  { parameter: 'pool_volume', unit: 'ph_units' },
  { parameter: 'free_chlorine', unit: '°f' },
  { parameter: 'total_alkalinity', unit: '°f' },
  { parameter: 'calcium_hardness', unit: 'gal' },
];

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function runGoldenSet() {
  const cases = JSON.parse(fs.readFileSync(GOLDEN_PATH, 'utf8'));
  const failures = [];
  for (const c of cases) {
    const actual = extractFromSentence(c.text).map((r) => ({
      parameter_id: r.parameter_id, minimum: r.minimum, maximum: r.maximum,
      unit: r.unit, value_type: r.value_type, environment: r.environment,
      claim_type: r.claim_type, extraction_status: r.extraction_status,
    }));
    if (!deepEqual(actual, c.expected)) {
      failures.push({ id: c.id, text: c.text, expected: c.expected, actual });
    }
  }
  return { total: cases.length, failures };
}

function checkKnownImpossiblePairingsRejected() {
  const failures = [];
  for (const { parameter, unit } of KNOWN_IMPOSSIBLE) {
    // Build a synthetic sentence that would previously have produced this
    // exact impossible pairing under the OLD whole-text-search classifier,
    // and confirm the extractor never emits it as CORRECT_EXTRACTION.
    const sentenceByUnit = {
      ppm: `${parameter.replace(/_/g, ' ')} reading of 120 ppm was recorded.`,
      'mg/l': `${parameter.replace(/_/g, ' ')} reading of 120 mg/L was recorded.`,
      '°f': `${parameter.replace(/_/g, ' ')} at 104°F was recorded.`,
      f: `${parameter.replace(/_/g, ' ')} at 104 F was recorded.`,
      gal: `${parameter.replace(/_/g, ' ')} for a 10000 gal pool.`,
      gallons: `${parameter.replace(/_/g, ' ')} for a 10000 gallons pool.`,
      lbs: `${parameter.replace(/_/g, ' ')} dose of 10 lbs.`,
      oz: `${parameter.replace(/_/g, ' ')} dose of 10 oz.`,
      ph_units: `${parameter.replace(/_/g, ' ')} of 7.4 was recorded.`,
    };
    const sentence = sentenceByUnit[unit];
    if (!sentence) continue;
    const records = extractFromSentence(sentence);
    const bad = records.find((r) => r.parameter_id === parameter && r.extraction_status === 'CORRECT_EXTRACTION'
      && (r.unit === unit || (unit === 'ph_units' && r.value_type === 'ph_value' && parameter !== 'ph')));
    if (bad) failures.push({ parameter, unit, sentence, record: bad });
  }
  return failures;
}

function main() {
  const golden = runGoldenSet();
  const impossible = checkKnownImpossiblePairingsRejected();

  const outDir = path.join(ROOT, 'reports', 'phase-7d-1');
  fs.mkdirSync(outDir, { recursive: true });
  const result = {
    timestamp: new Date().toISOString(),
    golden_set: { total: golden.total, failures: golden.failures.length },
    impossible_mapping_check: { checked: KNOWN_IMPOSSIBLE.length, failures: impossible.length },
    status: (golden.failures.length === 0 && impossible.length === 0) ? 'PASS' : 'FAIL',
    golden_failures: golden.failures,
    impossible_mapping_failures: impossible,
  };
  fs.writeFileSync(path.join(outDir, 'extraction-validation-results.json'), JSON.stringify(result, null, 2) + '\n');

  if (result.status === 'PASS') {
    console.log(`validate-chemistry-extraction: PASS -- golden set ${golden.total}/${golden.total} match, ${KNOWN_IMPOSSIBLE.length}/${KNOWN_IMPOSSIBLE.length} impossible-mapping checks rejected as expected.`);
  } else {
    console.error(`validate-chemistry-extraction: FAIL -- ${golden.failures.length} golden-set mismatch(es), ${impossible.length} impossible-mapping leak(s).`);
    for (const f of golden.failures) {
      console.error(`  GOLDEN MISMATCH [${f.id}]: "${f.text}"`);
      console.error(`    expected: ${JSON.stringify(f.expected)}`);
      console.error(`    actual:   ${JSON.stringify(f.actual)}`);
    }
    for (const f of impossible) {
      console.error(`  IMPOSSIBLE MAPPING LEAKED: ${f.parameter} + ${f.unit} in "${f.sentence}"`);
    }
    process.exitCode = 1;
  }
}

if (require.main === module) main();
module.exports = { runGoldenSet, checkKnownImpossiblePairingsRejected };
