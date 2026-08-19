#!/usr/bin/env node
'use strict';
/**
 * validate-chemistry-extraction-v2.js (Phase 7D.2, Step 5)
 *
 * Compares extractFromSentence() output against the independently authored
 * golden set (scripts/data/chemistry-extraction-golden-set-v2.json). This
 * runner never generates or modifies the expected dataset -- it only loads
 * it, runs the extractor, and reports exact mismatches. Per Step 17 (golden
 * set failure policy), any mismatch found during this phase's authoring
 * process was individually triaged (extractor fixed, or expected value
 * corrected after re-reading the source sentence) and documented in
 * PHASE-7D-2-INDEPENDENT-VALIDATION.md -- this script does not
 * auto-correct anything.
 */
const fs = require('fs');
const path = require('path');
const { extractFromSentence } = require('./phase-7d-1/extract-claims-v2');

const GOLDEN_PATH = path.join(__dirname, 'data', 'chemistry-extraction-golden-set-v2.json');
const OUT_PATH = path.join(__dirname, '..', 'reports', 'phase-7d-2', 'extraction-validation-v2-results.json');

const FIELDS = ['parameter_id', 'minimum', 'maximum', 'unit', 'value_type', 'environment', 'claim_type', 'extraction_status'];

function recordsEqual(actual, expected) {
  if (actual.length !== expected.length) return false;
  for (let i = 0; i < actual.length; i++) {
    for (const f of FIELDS) {
      const a = actual[i][f];
      const e = expected[i][f];
      if (typeof a === 'number' && typeof e === 'number') {
        if (Math.abs(a - e) > 1e-9) return false;
      } else if (a !== e) {
        return false;
      }
    }
  }
  return true;
}

function runGoldenSetV2() {
  const golden = JSON.parse(fs.readFileSync(GOLDEN_PATH, 'utf8'));
  const results = [];
  for (const c of golden) {
    const actual = extractFromSentence(c.text).map((r) => ({
      parameter_id: r.parameter_id, minimum: r.minimum, maximum: r.maximum, unit: r.unit,
      value_type: r.value_type, environment: r.environment, claim_type: r.claim_type,
      extraction_status: r.extraction_status,
    }));
    const pass = recordsEqual(actual, c.expected);
    results.push({ id: c.id, category: c.category, source: c.source, text: c.text, pass, expected: c.expected, actual });
  }
  const passCount = results.filter((r) => r.pass).length;
  const realCount = golden.filter((c) => c.source === 'real').length;
  return { total: results.length, pass: passCount, fail: results.length - passCount, real_cases: realCount, synthetic_cases: golden.length - realCount, results };
}

function run() {
  const gs = runGoldenSetV2();
  const status = gs.fail === 0 ? 'PASS' : 'FAIL';
  const output = {
    status,
    golden_set_v2: { total: gs.total, pass: gs.pass, fail: gs.fail, real_cases: gs.real_cases, synthetic_cases: gs.synthetic_cases },
    failures: gs.results.filter((r) => !r.pass),
  };
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2) + '\n');

  console.log(`validate-chemistry-extraction-v2: ${status} -- golden set v2 ${gs.pass}/${gs.total} match (${gs.real_cases} real, ${gs.synthetic_cases} synthetic).`);
  if (gs.fail > 0) {
    for (const f of output.failures) {
      console.log(`  FAIL [${f.id}] (${f.category}/${f.source}): ${f.text}`);
      console.log(`    expected: ${JSON.stringify(f.expected)}`);
      console.log(`    actual:   ${JSON.stringify(f.actual)}`);
    }
    process.exitCode = 1;
  }
  return output;
}

if (require.main === module) run();
module.exports = { run, runGoldenSetV2, recordsEqual };
