#!/usr/bin/env node
/**
 * validate-datasets.js
 *
 * Validates the canonical data layer at data/datasets/*.json.
 * Rejects build if any rule is violated.
 *
 * Checks:
 *  1. All 15 required dataset files exist.
 *  2. Every dataset follows the required schema wrapper.
 *  3. No duplicate record IDs within any dataset.
 *  4. Every dataset has sourcePriority array.
 *  5. version.json tracks all expected datasets.
 *  6. dosage-matrices: all coefficients are positive numbers.
 *  7. chemical-ranges: no poolType/parameter pair is duplicated.
 *  8. conversion-factors: no duplicate fromUnit/toUnit pairs.
 *  9. compatibility: no duplicate productA/productB pairs.
 * 10. confidence-levels: all required levels present.
 * 11. resolved-ranges.json exists and is non-empty.
 * 12. units: no duplicate unit IDs.
 * 13. chemical-properties: entityId references valid pattern.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const DATASETS_DIR = path.join(__dirname, '..', 'data', 'datasets');

let errors   = 0;
let warnings = 0;

function fail(msg)  { console.error(`  FAIL: ${msg}`); errors++;   }
function warn(msg)  { console.warn(`  WARN: ${msg}`); warnings++; }
function ok(msg)    { console.log(`  ✓ ${msg}`); }

// ── 1. Required files ─────────────────────────────────────────────────────────

const REQUIRED_FILES = [
  'chemical-ranges', 'hot-tub-ranges', 'water-balance', 'dosage-matrices',
  'chemical-properties', 'compatibility', 'units', 'conversion-factors',
  'temperature-guidelines', 'testing-frequency', 'pool-types', 'water-problems',
  'maintenance-schedules', 'confidence-levels', 'version', 'resolved-ranges',
];

const datasets = {};

REQUIRED_FILES.forEach(name => {
  const fp = path.join(DATASETS_DIR, name + '.json');
  if (!fs.existsSync(fp)) {
    fail(`Required dataset file missing: data/datasets/${name}.json`);
  } else {
    try {
      datasets[name] = JSON.parse(fs.readFileSync(fp, 'utf8'));
      ok(`${name}.json exists`);
    } catch (e) {
      fail(`Cannot parse data/datasets/${name}.json: ${e.message}`);
    }
  }
});

// ── 2. Schema wrapper validation ──────────────────────────────────────────────

const SCHEMA_SKIP = new Set(['version', 'resolved-ranges']);
const REQUIRED_FIELDS = ['datasetId', 'version', 'lastReviewed', 'description', 'maintainer', 'sourcePriority'];

Object.entries(datasets).forEach(([name, ds]) => {
  if (SCHEMA_SKIP.has(name)) return;
  REQUIRED_FIELDS.forEach(f => {
    if (!Object.prototype.hasOwnProperty.call(ds, f)) {
      fail(`Dataset [${name}] missing required schema field: ${f}`);
    }
  });
  if (ds.datasetId && ds.datasetId !== name) {
    fail(`Dataset [${name}] datasetId "${ds.datasetId}" does not match filename "${name}"`);
  }
  if (ds.sourcePriority && !Array.isArray(ds.sourcePriority)) {
    fail(`Dataset [${name}] sourcePriority must be an array`);
  }
  if (!ds.records) {
    warn(`Dataset [${name}] has no records array — intentional?`);
  }
});

ok('Schema wrapper validation complete');

// ── 3. Duplicate record IDs ───────────────────────────────────────────────────

Object.entries(datasets).forEach(([name, ds]) => {
  if (!ds.records || !Array.isArray(ds.records)) return;
  const seen = new Set();
  ds.records.forEach(r => {
    if (!r.id) {
      warn(`Dataset [${name}] record missing id field: ${JSON.stringify(r).slice(0, 60)}`);
      return;
    }
    if (seen.has(r.id)) {
      fail(`Dataset [${name}] duplicate record id: "${r.id}"`);
    }
    seen.add(r.id);
  });
});

ok('Duplicate record ID check complete');

// ── 4. sourcePriority values ──────────────────────────────────────────────────

const VALID_SOURCES = new Set([
  'industry-standards', 'government-guidance', 'manufacturer-documentation',
  'scientific-literature', 'editorial-interpretation',
]);

Object.entries(datasets).forEach(([name, ds]) => {
  if (!ds.sourcePriority) return;
  ds.sourcePriority.forEach(s => {
    if (!VALID_SOURCES.has(s)) {
      fail(`Dataset [${name}] unknown sourcePriority value: "${s}"`);
    }
  });
});

ok('sourcePriority validation complete');

// ── 5. version.json tracks all datasets ──────────────────────────────────────

const EXPECTED_VERSION_DATASETS = [
  'chemical-ranges', 'hot-tub-ranges', 'water-balance', 'dosage-matrices',
  'chemical-properties', 'compatibility', 'units', 'conversion-factors',
  'temperature-guidelines', 'testing-frequency', 'pool-types', 'water-problems',
  'maintenance-schedules', 'confidence-levels',
];

const ver = datasets['version'];
if (ver && ver.datasets) {
  EXPECTED_VERSION_DATASETS.forEach(name => {
    if (!ver.datasets[name]) {
      fail(`version.json does not track dataset: "${name}"`);
    }
  });
  ok('version.json dataset tracking complete');
} else {
  fail('version.json missing or has no datasets object');
}

// ── 6. dosage-matrices: positive coefficients ─────────────────────────────────

const dosage = datasets['dosage-matrices'];
if (dosage && dosage.records) {
  dosage.records.forEach(r => {
    if (typeof r.coefficient !== 'number' || r.coefficient <= 0) {
      fail(`dosage-matrices record [${r.id}] has invalid coefficient: ${r.coefficient}`);
    }
    if (!r.coefficientUnit) {
      fail(`dosage-matrices record [${r.id}] missing coefficientUnit`);
    }
    if (!r.parameter) {
      fail(`dosage-matrices record [${r.id}] missing parameter`);
    }
  });
  ok('dosage-matrices coefficients valid');
}

// ── 7. chemical-ranges: no duplicate poolType/parameter ───────────────────────

const chemRanges = datasets['chemical-ranges'];
if (chemRanges && chemRanges.records) {
  const seen = new Set();
  chemRanges.records.forEach(r => {
    const key = `${r.poolType}::${r.parameter}`;
    if (seen.has(key)) {
      fail(`chemical-ranges duplicate poolType/parameter combo: "${key}"`);
    }
    seen.add(key);
    // Validate target range
    if (!r.target) {
      warn(`chemical-ranges record [${r.id}] missing target object`);
    }
  });
  ok('chemical-ranges poolType/parameter uniqueness valid');
}

// ── 8. conversion-factors: no duplicate fromUnit/toUnit ──────────────────────

const convFactors = datasets['conversion-factors'];
if (convFactors && convFactors.records) {
  const seen = new Set();
  convFactors.records.forEach(r => {
    const key = `${r.fromUnit}::${r.toUnit}`;
    if (seen.has(key)) {
      fail(`conversion-factors duplicate fromUnit/toUnit: "${key}"`);
    }
    seen.add(key);
    if (!r.formula) {
      warn(`conversion-factors record [${r.id}] missing formula`);
    }
  });
  ok('conversion-factors uniqueness valid');
}

// ── 9. compatibility: no duplicate productA/productB pairs ───────────────────

const compat = datasets['compatibility'];
if (compat && compat.records) {
  const seen = new Set();
  compat.records.forEach(r => {
    const key = [r.productA, r.productB].sort().join('::');
    if (seen.has(key)) {
      fail(`compatibility duplicate pair: "${key}"`);
    }
    seen.add(key);
    const VALID_STATUS = new Set(['safe', 'avoid', 'never_mix', 'unknown']);
    if (!VALID_STATUS.has(r.status)) {
      fail(`compatibility record [${r.id}] invalid status: "${r.status}"`);
    }
    if (r.status === 'never_mix') {
      const VALID_SEVERITY = new Set(['critical', 'high', 'medium']);
      if (!VALID_SEVERITY.has(r.severity)) {
        fail(`compatibility record [${r.id}] never_mix requires severity (critical|high|medium)`);
      }
    }
  });
  ok('compatibility pairs valid');
}

// ── 10. confidence-levels: required levels ────────────────────────────────────

const REQUIRED_CONFIDENCE = ['high', 'medium', 'low', 'estimated', 'manufacturer-specified'];
const confLevels = datasets['confidence-levels'];
if (confLevels && confLevels.records) {
  const ids = new Set(confLevels.records.map(r => r.id));
  REQUIRED_CONFIDENCE.forEach(lvl => {
    if (!ids.has(lvl)) {
      fail(`confidence-levels missing required level: "${lvl}"`);
    }
  });
  ok('confidence-levels required levels present');
}

// ── 11. resolved-ranges.json non-empty ────────────────────────────────────────

const resolved = datasets['resolved-ranges'];
if (resolved && typeof resolved === 'object') {
  const count = Object.keys(resolved).length;
  if (count === 0) {
    fail('resolved-ranges.json is empty');
  } else {
    ok(`resolved-ranges.json has ${count} entity ranges`);
  }
} else {
  fail('resolved-ranges.json missing or invalid');
}

// ── 12. units: no duplicate IDs ──────────────────────────────────────────────

const unitsDs = datasets['units'];
if (unitsDs && unitsDs.records) {
  const ids = unitsDs.records.map(r => r.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length > 0) {
    fail(`units dataset has duplicate IDs: ${dupes.join(', ')}`);
  } else {
    ok(`units dataset has ${ids.length} unique unit definitions`);
  }
}

// ── 13. chemical-properties: entityId present ────────────────────────────────

const chemProps = datasets['chemical-properties'];
if (chemProps && chemProps.records) {
  chemProps.records.forEach(r => {
    if (!r.entityId) {
      warn(`chemical-properties record [${r.id}] missing entityId cross-reference`);
    }
    if (!r.purpose) {
      warn(`chemical-properties record [${r.id}] missing purpose`);
    }
  });
  ok('chemical-properties structure valid');
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\nvalidate-datasets: ${Object.keys(datasets).length} datasets checked`);
if (errors > 0 || warnings > 0) {
  console.log(`  ${errors} error(s), ${warnings} warning(s)`);
}

if (errors > 0) {
  console.error(`\nvalidate-datasets: FAILED — ${errors} error(s) found`);
  process.exit(1);
}

if (warnings > 0) {
  console.warn(`\nvalidate-datasets: PASSED with ${warnings} warning(s)`);
} else {
  console.log('\nvalidate-datasets: PASSED — 0 errors, 0 warnings');
}
