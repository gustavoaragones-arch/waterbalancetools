#!/usr/bin/env node
'use strict';
/**
 * test-extraction-regression.js (Phase 7D.2, Steps 9-12)
 *
 * Direct, standalone assertions against extractFromSentence() for the
 * specific test list named in the Phase 7D.2 brief (composite/impossible
 * -mapping/context-carry-forward/claim-type separation), independent of
 * the golden-set-v2.json file (belt-and-suspenders: a second verification
 * layer with its own hardcoded expectations, not sourced from the golden
 * set or from running the extractor first).
 */
const assert = require('assert');
const { extractFromSentence } = require('../phase-7d-1/extract-claims-v2');

let n = 0;
function check(label, actual, expected) {
  n++;
  assert.deepStrictEqual(actual, expected, `${label}\n  actual:   ${JSON.stringify(actual)}\n  expected: ${JSON.stringify(expected)}`);
}
function pick(records) {
  return records.map((r) => ({ parameter_id: r.parameter_id, minimum: r.minimum, maximum: r.maximum, unit: r.unit, value_type: r.value_type, extraction_status: r.extraction_status }));
}

// ---- Step 9: named extractor regression tests A-J ----

// A. "Total alkalinity 80-120 ppm" must map only to total_alkalinity.
check('A: total alkalinity 80-120 ppm',
  pick(extractFromSentence('Total alkalinity 80-120 ppm.')),
  [{ parameter_id: 'total_alkalinity', minimum: 80, maximum: 120, unit: 'ppm', value_type: 'concentration', extraction_status: 'CORRECT_EXTRACTION' }]);

// B. "Calcium hardness 200-400 ppm" must map only to calcium_hardness.
check('B: calcium hardness 200-400 ppm',
  pick(extractFromSentence('Calcium hardness 200-400 ppm.')),
  [{ parameter_id: 'calcium_hardness', minimum: 200, maximum: 400, unit: 'ppm', value_type: 'concentration', extraction_status: 'CORRECT_EXTRACTION' }]);

// C. "Water temperature 98-104°F" must map only to water_temperature.
check('C: water temperature 98-104F',
  pick(extractFromSentence('Water temperature 98-104°F.')),
  [{ parameter_id: 'water_temperature', minimum: 98, maximum: 104, unit: '°f', value_type: 'temperature', extraction_status: 'CORRECT_EXTRACTION' }]);

// D. "Pool volume 10,000-25,000 gallons" must map only to pool_volume.
check('D: pool volume 10,000-25,000 gallons',
  pick(extractFromSentence('Pool volume 10,000-25,000 gallons.')),
  [{ parameter_id: 'pool_volume', minimum: 10000, maximum: 25000, unit: 'gallons', value_type: 'volume', extraction_status: 'CORRECT_EXTRACTION' }]);

// E. "Add 10 oz of chlorine" must not become free_chlorine concentration.
{
  const recs = pick(extractFromSentence('Add 10 oz of chlorine.'));
  assert.ok(!recs.some((r) => r.parameter_id === 'free_chlorine' && r.value_type === 'concentration'),
    `E: "Add 10 oz of chlorine" must never produce a free_chlorine concentration record, got ${JSON.stringify(recs)}`);
  n++;
}

// F. "pH 7.2-7.6" must map to pH.
check('F: pH 7.2-7.6',
  pick(extractFromSentence('pH 7.2-7.6.')),
  [{ parameter_id: 'ph', minimum: 7.2, maximum: 7.6, unit: 'ph_units', value_type: 'ph_value', extraction_status: 'CORRECT_EXTRACTION' }]);

// G. "FC 1.0 ppm, pH 7.7, TA 90 ppm, hardness 280 ppm, CYA 45 ppm." must
// produce five independently expected parameter records.
check('G: FC/pH/TA/hardness/CYA composite',
  pick(extractFromSentence('FC 1.0 ppm, pH 7.7, TA 90 ppm, hardness 280 ppm, CYA 45 ppm.')),
  [
    { parameter_id: 'free_chlorine', minimum: 1, maximum: 1, unit: 'ppm', value_type: 'concentration', extraction_status: 'CORRECT_EXTRACTION' },
    { parameter_id: 'ph', minimum: 7.7, maximum: 7.7, unit: 'ph_units', value_type: 'ph_value', extraction_status: 'CORRECT_EXTRACTION' },
    { parameter_id: 'total_alkalinity', minimum: 90, maximum: 90, unit: 'ppm', value_type: 'concentration', extraction_status: 'CORRECT_EXTRACTION' },
    { parameter_id: 'calcium_hardness', minimum: 280, maximum: 280, unit: 'ppm', value_type: 'concentration', extraction_status: 'CORRECT_EXTRACTION' },
    { parameter_id: 'cyanuric_acid', minimum: 45, maximum: 45, unit: 'ppm', value_type: 'concentration', extraction_status: 'CORRECT_EXTRACTION' },
  ]);

// H. "Salt 3,200 ppm, FC 3 ppm, pH 7.5." must produce three independently
// expected records.
check('H: Salt/FC/pH composite',
  pick(extractFromSentence('Salt 3,200 ppm, FC 3 ppm, pH 7.5.')),
  [
    { parameter_id: 'salt', minimum: 3200, maximum: 3200, unit: 'ppm', value_type: 'concentration', extraction_status: 'CORRECT_EXTRACTION' },
    { parameter_id: 'free_chlorine', minimum: 3, maximum: 3, unit: 'ppm', value_type: 'concentration', extraction_status: 'CORRECT_EXTRACTION' },
    { parameter_id: 'ph', minimum: 7.5, maximum: 7.5, unit: 'ph_units', value_type: 'ph_value', extraction_status: 'CORRECT_EXTRACTION' },
  ]);

// I. "Water with an LSI of -0.1 at 68°F..." must distinguish LSI from
// temperature (both correctly extracted/rejected, never merged into one).
{
  const recs = pick(extractFromSentence('Water with an LSI of -0.1 at 68°F is well balanced.'));
  const lsiRec = recs.find((r) => r.value_type === 'index_value');
  const tempRec = recs.find((r) => r.unit === '°f');
  assert.ok(lsiRec && lsiRec.minimum === -0.1 && lsiRec.extraction_status === 'CORRECT_EXTRACTION', `I: LSI value not correctly extracted: ${JSON.stringify(recs)}`);
  assert.ok(tempRec && tempRec.value_type === 'temperature' && tempRec.parameter_id !== null && tempRec.extraction_status !== 'CORRECT_EXTRACTION',
    `I: 68F must never be silently accepted as a valid value for whatever parameter it lands nearest to (LSI does not accept temperature): ${JSON.stringify(recs)}`);
  n++;
}

// J. A sentence containing pH elsewhere but a numeric value belonging to
// another parameter must not attribute that number to pH.
check('J: pH elsewhere, number belongs to total_alkalinity',
  pick(extractFromSentence('pH is tested weekly. Total alkalinity should be 100 ppm.')),
  [{ parameter_id: 'total_alkalinity', minimum: 100, maximum: 100, unit: 'ppm', value_type: 'concentration', extraction_status: 'CORRECT_EXTRACTION' }]);

// ---- Step 10: context carry-forward ----

check('context: pools -> free_chlorine 1-3 ppm environment=pool',
  extractFromSentence('For pools, keep free chlorine between 1 and 3 ppm.').map((r) => r.environment),
  ['pool']);

check('context: hot tubs -> free_chlorine 3-5 ppm environment=hot_tub',
  extractFromSentence('For hot tubs, keep free chlorine between 3 and 5 ppm.').map((r) => r.environment),
  ['hot_tub']);

// Parameter introduced in one clause, number in a later clause with no
// number of its own in between -> CARRIED_CONTEXT only, never silently
// promoted to CORRECT_EXTRACTION.
{
  const recs = extractFromSentence('Test for pH regularly, targeting 7.2 to 7.6.');
  assert.strictEqual(recs.length, 1, `context carry-forward: expected exactly 1 record, got ${JSON.stringify(recs)}`);
  assert.strictEqual(recs[0].parameter_id, 'ph');
  assert.strictEqual(recs[0].extraction_status, 'CARRIED_CONTEXT');
  n++;
}

// ---- Step 11: impossible mappings must never leak as CORRECT_EXTRACTION ----

const IMPOSSIBLE_CASES = [
  ['pH of 150 ppm.', 'ph'],
  ['pH reading of 98°F.', 'ph'],
  ['pH held steady after adding 2 lbs of shock.', 'ph'],
  ['pH remained unaffected by 3 oz of algaecide.', 'ph'],
  ['Water temperature reached 150 ppm.', 'water_temperature'],
  ['Pool volume measured 500 ppm.', 'pool_volume'],
];
for (const [text, param] of IMPOSSIBLE_CASES) {
  const recs = extractFromSentence(text);
  const leaked = recs.some((r) => r.parameter_id === param && r.extraction_status === 'CORRECT_EXTRACTION');
  assert.ok(!leaked, `impossible mapping leaked as CORRECT_EXTRACTION: "${text}" -> ${JSON.stringify(recs)}`);
  n++;
}

// ---- Step 12: claim-type separation ----

check('claim_type: example input',
  extractFromSentence('For example, suppose FC reads 1 ppm.').map((r) => r.claim_type),
  ['EXAMPLE_INPUT']);
check('claim_type: calculated value',
  extractFromSentence('Based on your entries, the calculator result is 12 ppm free chlorine.').map((r) => r.claim_type),
  ['CALCULATED_VALUE']);
check('claim_type: safety guidance (no number, still tagged correctly on any record found)',
  extractFromSentence('Wait 8 hours before swimming after shocking with 20 ppm chlorine.').map((r) => r.claim_type),
  ['SAFETY_GUIDANCE', 'SAFETY_GUIDANCE']);
check('claim_type: rule of thumb',
  extractFromSentence('Cyanuric acid typically runs 30 ppm outdoors.').map((r) => r.claim_type),
  ['RULE_OF_THUMB']);
check('claim_type: default range (no trigger keywords)',
  extractFromSentence('Free chlorine should be 2 ppm.').map((r) => r.claim_type),
  ['RANGE']);

console.log(`PASS: extraction regression suite completed (${n} assertions).`);
