#!/usr/bin/env node
/**
 * generate-datasets.js
 *
 * Compiles all canonical dataset source modules from scripts/data/
 * into JSON files at data/datasets/*.json.
 *
 * Also resolves entity idealRange/units values from datasets
 * and writes a resolved-ranges.json index used by other generators.
 *
 * Run: node scripts/generate-datasets.js
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const DATA     = path.join(ROOT, 'data');
const DATASETS = path.join(DATA, 'datasets');
const D        = path.join(__dirname, 'data');

if (!fs.existsSync(DATASETS)) fs.mkdirSync(DATASETS, { recursive: true });

// ── Load source modules ────────────────────────────────────────────────────────

const chemicalRanges   = require(path.join(D, 'dataset-chemical-ranges'));
const dosageMatrices   = require(path.join(D, 'dataset-dosage-matrices'));
const chemicalProps    = require(path.join(D, 'dataset-chemical-properties'));
const compatibility    = require(path.join(D, 'dataset-compatibility'));
const { units, conversionFactors, temperatureGuidelines, testingFrequency, confidenceLevels, version } = require(path.join(D, 'dataset-core'));
const { waterBalance, hotTubRanges, poolTypes, waterProblems, maintenanceSchedules } = require(path.join(D, 'dataset-supplemental'));

// ── Dataset map ───────────────────────────────────────────────────────────────

const DATASETS_MAP = {
  'chemical-ranges':      chemicalRanges,
  'hot-tub-ranges':       hotTubRanges,
  'water-balance':        waterBalance,
  'dosage-matrices':      dosageMatrices,
  'chemical-properties':  chemicalProps,
  'compatibility':        compatibility,
  'units':                units,
  'conversion-factors':   conversionFactors,
  'temperature-guidelines': temperatureGuidelines,
  'testing-frequency':    testingFrequency,
  'pool-types':           poolTypes,
  'water-problems':       waterProblems,
  'maintenance-schedules': maintenanceSchedules,
  'confidence-levels':    confidenceLevels,
  'version':              version,
};

// ── Required schema fields ────────────────────────────────────────────────────

const REQUIRED = ['datasetId', 'version', 'lastReviewed', 'description', 'maintainer', 'sourcePriority'];
const VERSION_SKIP = new Set(['version']); // version.json has different structure

// ── Validate and write ────────────────────────────────────────────────────────

let errors = 0;
const counts = {};

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

Object.entries(DATASETS_MAP).forEach(([name, dataset]) => {
  // Schema enforcement (except version.json)
  if (!VERSION_SKIP.has(name)) {
    REQUIRED.forEach(f => {
      if (!Object.prototype.hasOwnProperty.call(dataset, f)) {
        console.error(`  FAIL: Dataset [${name}] missing required field: ${f}`);
        errors++;
      }
    });
    if (dataset.datasetId !== name) {
      console.error(`  FAIL: Dataset [${name}] datasetId "${dataset.datasetId}" does not match filename`);
      errors++;
    }
  }

  const count = dataset.records ? dataset.records.length : Object.keys(dataset).length;
  counts[name] = count;

  writeJson(path.join(DATASETS, name + '.json'), dataset);
  console.log(`  ✓ data/datasets/${name}.json  (${dataset.records ? dataset.records.length : '—'} records)`);
});

// ── Build resolved-ranges index ───────────────────────────────────────────────
// Provides a flat lookup: entityId → { idealRange, unit } resolved from datasets

const resolvedRanges = {};

if (chemicalRanges.records) {
  // Group by parameter, use residential-pool as default
  const byParam = {};
  chemicalRanges.records.forEach(r => {
    if (!byParam[r.parameter]) byParam[r.parameter] = {};
    byParam[r.parameter][r.poolType] = r;
  });

  // Map parameter → entity ID
  const PARAM_TO_ENTITY = {
    'free-chlorine':       'free-chlorine',
    'combined-chlorine':   'combined-chlorine',
    'ph':                  'ph',
    'total-alkalinity':    'alkalinity',
    'calcium-hardness':    'calcium-hardness',
    'cyanuric-acid':       'cyanuric-acid',
    'salt':                'salt',
    'temperature':         'temperature',
    'orp':                 'orp',
    'bromine':             'bromine',
    'tds':                 'total-dissolved-solids',
  };

  Object.entries(PARAM_TO_ENTITY).forEach(([param, entityId]) => {
    const group = byParam[param];
    if (!group) return;
    // Use residential-pool as default range, fallback to first available
    const rec = group['residential-pool'] || group['hot-tub'] || Object.values(group)[0];
    if (!rec || !rec.target) return;

    let rangeStr = '';
    const t = rec.target;
    if (t.min !== null && t.max !== null) {
      rangeStr = `${t.min}–${t.max} ${rec.unit}`;
    } else if (t.ideal !== null) {
      rangeStr = `${t.ideal} ${rec.unit} (ideal)`;
    }
    resolvedRanges[entityId] = {
      idealRange:     rangeStr,
      units:          rec.unit,
      rangeDataset:   'chemical-ranges',
      rangeRecord:    rec.id,
      target:         rec.target,
      warning:        rec.warning,
      critical:       rec.critical,
    };
  });
}

// Add LSI from water-balance
if (waterBalance.records) {
  const lsiRec = waterBalance.records.find(r => r.id === 'lsi-target-range');
  if (lsiRec) {
    resolvedRanges['lsi'] = {
      idealRange:   `${lsiRec.target.min} to +${lsiRec.target.max}`,
      units:        'dimensionless',
      rangeDataset: 'water-balance',
      rangeRecord:  'lsi-target-range',
      target:       lsiRec.target,
      warning:      lsiRec.warning,
      critical:     lsiRec.critical,
    };
  }
}

// Add turnover time from temperature-guidelines-like data
resolvedRanges['turnover-time'] = {
  idealRange: 'Maximum 8 hours (residential)',
  units: 'hours',
  rangeDataset: 'pool-types',
  rangeRecord: 'commercial-pool',
};

writeJson(path.join(DATASETS, 'resolved-ranges.json'), resolvedRanges);
console.log(`  ✓ data/datasets/resolved-ranges.json  (${Object.keys(resolvedRanges).length} entity ranges)`);

// ── Update version.json with current build timestamp ─────────────────────────

version.lastBuilt = new Date().toISOString().split('T')[0];
writeJson(path.join(DATASETS, 'version.json'), version);

// ── Summary ───────────────────────────────────────────────────────────────────

if (errors > 0) {
  console.error(`\ngenerate-datasets: FAILED — ${errors} error(s)`);
  process.exit(1);
}

const totalDatasets = Object.keys(DATASETS_MAP).length;
console.log(`\ngenerate-datasets: wrote ${totalDatasets + 1} files (${totalDatasets} datasets + resolved-ranges)`);
