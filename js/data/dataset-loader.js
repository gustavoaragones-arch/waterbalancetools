/**
 * dataset-loader.js
 *
 * Internal utility module for the canonical data layer.
 *
 * Every generator, calculator template, and build script loads datasets
 * through this module. Never load data/datasets/*.json directly.
 *
 * Usage (Node.js — generators):
 *   const DatasetLoader = require('./js/data/dataset-loader');
 *   const loader = new DatasetLoader(path.join(__dirname, '../data/datasets'));
 *   const range = loader.getRange('residential-pool', 'free-chlorine');
 *
 * Usage (browser — calculators):
 *   The loader exposes window.DatasetLoader when loaded as a script.
 *   Initialize it with the base URL for dataset JSON files.
 */
(function (root, factory) {
  /* UMD wrapper: works as CommonJS (Node) and browser global */
  if (typeof module === 'object' && module.exports) {
    const fs   = require('fs');
    const path = require('path');
    module.exports = factory(fs, path);
  } else {
    root.DatasetLoader = factory(null, null);
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (fs, path) {
  'use strict';

  // ── Constructor ──────────────────────────────────────────────────────────────

  /**
   * @param {string} datasetsDir  Absolute path to data/datasets/ (Node) or base URL prefix (browser).
   */
  function DatasetLoader(datasetsDir) {
    this._dir    = datasetsDir || '';
    this._cache  = {};
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  DatasetLoader.prototype._load = function (name) {
    if (this._cache[name]) return this._cache[name];

    if (fs && path) {
      // Node.js: synchronous file read
      const fp = path.join(this._dir, name + '.json');
      if (!fs.existsSync(fp)) throw new Error(`DatasetLoader: dataset not found: ${fp}`);
      const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
      this._cache[name] = data;
      return data;
    }

    // Browser: return a Promise (async loading)
    throw new Error('DatasetLoader: in browser context, use loadAsync() instead of _load()');
  };

  DatasetLoader.prototype._loadAsync = function (name) {
    if (this._cache[name]) return Promise.resolve(this._cache[name]);
    const url = this._dir.replace(/\/$/, '') + '/' + name + '.json';
    return fetch(url)
      .then(r => { if (!r.ok) throw new Error(`Failed to load dataset: ${url}`); return r.json(); })
      .then(data => { this._cache[name] = data; return data; });
  };

  // ── Public API ───────────────────────────────────────────────────────────────

  /**
   * Get a single record by ID from a dataset.
   * @param {string} datasetName  e.g. 'chemical-ranges'
   * @param {string} recordId     e.g. 'residential-pool-free-chlorine'
   */
  DatasetLoader.prototype.getRecord = function (datasetName, recordId) {
    const ds = this._load(datasetName);
    if (!ds.records) return null;
    return ds.records.find(r => r.id === recordId) || null;
  };

  /**
   * Get all records from a dataset.
   */
  DatasetLoader.prototype.getRecords = function (datasetName) {
    const ds = this._load(datasetName);
    return ds.records || [];
  };

  /**
   * Get the full dataset object.
   */
  DatasetLoader.prototype.getDataset = function (datasetName) {
    return this._load(datasetName);
  };

  /**
   * Get the chemical range for a given pool type and parameter.
   * @param {string} poolType   e.g. 'residential-pool'
   * @param {string} parameter  e.g. 'free-chlorine'
   * @returns {object|null}
   */
  DatasetLoader.prototype.getRange = function (poolType, parameter) {
    const ds = this._load('chemical-ranges');
    if (!ds.records) return null;
    return ds.records.find(r => r.poolType === poolType && r.parameter === parameter) || null;
  };

  /**
   * Get all ranges for a pool type.
   */
  DatasetLoader.prototype.getRangesForPoolType = function (poolType) {
    const ds = this._load('chemical-ranges');
    if (!ds.records) return [];
    return ds.records.filter(r => r.poolType === poolType);
  };

  /**
   * Get the resolved entity range (target, warning, critical) from resolved-ranges.json.
   * @param {string} entityId  e.g. 'free-chlorine'
   */
  DatasetLoader.prototype.getEntityRange = function (entityId) {
    const resolved = this._load('resolved-ranges');
    return resolved[entityId] || null;
  };

  /**
   * Get idealRange string for display (resolved from datasets).
   * @param {string} entityId
   */
  DatasetLoader.prototype.getIdealRangeStr = function (entityId) {
    const r = this.getEntityRange(entityId);
    return r ? r.idealRange : null;
  };

  /**
   * Get the dosage coefficient for a product and parameter.
   * @param {string} productId   e.g. 'liquid-chlorine-10pct'
   */
  DatasetLoader.prototype.getDosage = function (productId) {
    const ds = this._load('dosage-matrices');
    if (!ds.records) return null;
    return ds.records.find(r => r.id === productId) || null;
  };

  /**
   * Get all dosage records for a specific parameter.
   * @param {string} parameter  e.g. 'free-chlorine'
   */
  DatasetLoader.prototype.getDosagesForParameter = function (parameter) {
    const ds = this._load('dosage-matrices');
    if (!ds.records) return [];
    return ds.records.filter(r => r.parameter === parameter);
  };

  /**
   * Get compatibility record for two products.
   * @param {string} productA
   * @param {string} productB
   */
  DatasetLoader.prototype.getCompatibility = function (productA, productB) {
    const ds = this._load('compatibility');
    if (!ds.records) return null;
    return ds.records.find(r =>
      (r.productA === productA && r.productB === productB) ||
      (r.productA === productB && r.productB === productA)
    ) || null;
  };

  /**
   * Get all compatibility records with 'never_mix' status.
   */
  DatasetLoader.prototype.getNeverMixPairs = function () {
    const ds = this._load('compatibility');
    if (!ds.records) return [];
    return ds.records.filter(r => r.status === 'never_mix');
  };

  /**
   * Get unit definition.
   * @param {string} unitId  e.g. 'ppm'
   */
  DatasetLoader.prototype.getUnit = function (unitId) {
    const ds = this._load('units');
    if (!ds.records) return null;
    return ds.records.find(r => r.id === unitId) || null;
  };

  /**
   * Get conversion factor from one unit to another.
   * @param {string} fromUnit  e.g. 'us-gallons'
   * @param {string} toUnit    e.g. 'liters'
   * @returns {object|null}  The record with factor and formula.
   */
  DatasetLoader.prototype.getConversion = function (fromUnit, toUnit) {
    const ds = this._load('conversion-factors');
    if (!ds.records) return null;
    return ds.records.find(r => r.fromUnit === fromUnit && r.toUnit === toUnit) || null;
  };

  /**
   * Convert a value between units.
   * Returns null if conversion requires a formula (e.g. temperature).
   * @param {number} value
   * @param {string} fromUnit
   * @param {string} toUnit
   */
  DatasetLoader.prototype.convert = function (value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    const conv = this.getConversion(fromUnit, toUnit);
    if (!conv) return null;
    if (conv.factor === null) {
      // Temperature conversions need formula application
      if (fromUnit === 'fahrenheit' && toUnit === 'celsius')  return (value - 32) * 5 / 9;
      if (fromUnit === 'celsius'    && toUnit === 'fahrenheit') return value * 9 / 5 + 32;
      return null;
    }
    return value * conv.factor;
  };

  /**
   * Get water problem record.
   * @param {string} problemId  e.g. 'cloudy-water'
   */
  DatasetLoader.prototype.getWaterProblem = function (problemId) {
    const ds = this._load('water-problems');
    if (!ds.records) return null;
    return ds.records.find(r => r.id === problemId) || null;
  };

  /**
   * Get testing frequency for a scenario.
   * @param {string} scenarioId  e.g. 'residential-pool-standard'
   */
  DatasetLoader.prototype.getTestingFrequency = function (scenarioId) {
    const ds = this._load('testing-frequency');
    if (!ds.records) return null;
    return ds.records.find(r => r.id === scenarioId) || null;
  };

  /**
   * Get maintenance schedule for a pool type.
   * @param {string} scheduleId  e.g. 'residential-pool-schedule'
   */
  DatasetLoader.prototype.getMaintenanceSchedule = function (scheduleId) {
    const ds = this._load('maintenance-schedules');
    if (!ds.records) return null;
    return ds.records.find(r => r.id === scheduleId) || null;
  };

  /**
   * Get LSI calculation factors from water-balance dataset.
   */
  DatasetLoader.prototype.getLSIFactors = function () {
    const ds = this._load('water-balance');
    if (!ds.records) return null;
    return {
      lsiTarget:            ds.records.find(r => r.id === 'lsi-target-range') || null,
      temperatureFactors:   ds.records.find(r => r.id === 'temperature-factors') || null,
      calciumHardnessFactors: ds.records.find(r => r.id === 'calcium-hardness-factors') || null,
      totalAlkalinityFactors: ds.records.find(r => r.id === 'total-alkalinity-factors') || null,
      tdsConstant:          ds.records.find(r => r.id === 'tds-constant') || null,
    };
  };

  /**
   * Calculate LSI given pool chemistry parameters.
   * Returns the LSI value and interpretation.
   * @param {object} params  { ph, tempF, calciumHardness, totalAlkalinity, cya, tds }
   */
  DatasetLoader.prototype.calculateLSI = function (params) {
    const factors = this.getLSIFactors();
    if (!factors || !factors.temperatureFactors || !factors.calciumHardnessFactors || !factors.totalAlkalinityFactors) {
      return null;
    }

    const { ph, tempF, calciumHardness, totalAlkalinity, cya = 0, tds = 1000 } = params;

    // Interpolate temperature factor
    const tf = interpolateFactor(factors.temperatureFactors.values, 'tempF', 'tf', tempF);
    const chf = interpolateFactor(factors.calciumHardnessFactors.values, 'chPpm', 'chf', calciumHardness);

    // Corrected TA for CYA
    const cyaCorrection = (cya || 0) * (factors.totalAlkalinityFactors.cyaCorrectionFactor || 0.33);
    const correctedTA = Math.max(0, totalAlkalinity - cyaCorrection);
    const taf = interpolateFactor(factors.totalAlkalinityFactors.values, 'taPpm', 'taf', correctedTA);

    // TDS constant
    const tdsConstant = (factors.tdsConstant && tds >= 3000) ? 12.2 : 12.1;

    const lsi = ph + tf + chf + taf - tdsConstant;
    const rounded = Math.round(lsi * 100) / 100;

    let status = 'balanced';
    if (rounded < -0.3) status = 'corrosive';
    else if (rounded > 0.5) status = 'scale-forming';

    return { lsi: rounded, status, tf, chf, taf, tdsConstant, correctedTA };
  };

  /**
   * Get pool type definition.
   */
  DatasetLoader.prototype.getPoolType = function (poolTypeId) {
    const ds = this._load('pool-types');
    if (!ds.records) return null;
    return ds.records.find(r => r.id === poolTypeId) || null;
  };

  /**
   * Get confidence level definition.
   */
  DatasetLoader.prototype.getConfidenceLevel = function (levelId) {
    const ds = this._load('confidence-levels');
    if (!ds.records) return null;
    return ds.records.find(r => r.id === levelId) || null;
  };

  /**
   * Get chemical properties record.
   */
  DatasetLoader.prototype.getChemicalProperties = function (chemId) {
    const ds = this._load('chemical-properties');
    if (!ds.records) return null;
    return ds.records.find(r => r.id === chemId || r.entityId === chemId) || null;
  };

  /**
   * Get current dataset versions.
   */
  DatasetLoader.prototype.getVersions = function () {
    return this._load('version');
  };

  // ── Async API (browser) ───────────────────────────────────────────────────────

  DatasetLoader.prototype.loadAsync = function (name) {
    return this._loadAsync(name);
  };

  DatasetLoader.prototype.getRangeAsync = function (poolType, parameter) {
    return this._loadAsync('chemical-ranges').then(ds => {
      if (!ds.records) return null;
      return ds.records.find(r => r.poolType === poolType && r.parameter === parameter) || null;
    });
  };

  DatasetLoader.prototype.getEntityRangeAsync = function (entityId) {
    return this._loadAsync('resolved-ranges').then(resolved => resolved[entityId] || null);
  };

  DatasetLoader.prototype.getDosageAsync = function (productId) {
    return this._loadAsync('dosage-matrices').then(ds => {
      if (!ds.records) return null;
      return ds.records.find(r => r.id === productId) || null;
    });
  };

  DatasetLoader.prototype.convertAsync = function (value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return Promise.resolve(value);
    return this._loadAsync('conversion-factors').then(ds => {
      if (!ds.records) return null;
      const conv = ds.records.find(r => r.fromUnit === fromUnit && r.toUnit === toUnit);
      if (!conv) return null;
      if (conv.factor === null) {
        if (fromUnit === 'fahrenheit' && toUnit === 'celsius')  return (value - 32) * 5 / 9;
        if (fromUnit === 'celsius'    && toUnit === 'fahrenheit') return value * 9 / 5 + 32;
        return null;
      }
      return value * conv.factor;
    });
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────

  /**
   * Linear interpolation in a lookup table.
   * @param {Array}  table  Array of {xKey: number, yKey: number}
   * @param {string} xKey   Property name for X axis
   * @param {string} yKey   Property name for Y axis
   * @param {number} x      Value to look up
   */
  function interpolateFactor(table, xKey, yKey, x) {
    if (!table || table.length === 0) return 0;
    // Sort ascending
    const sorted = [...table].sort((a, b) => a[xKey] - b[xKey]);
    if (x <= sorted[0][xKey]) return sorted[0][yKey];
    if (x >= sorted[sorted.length - 1][xKey]) return sorted[sorted.length - 1][yKey];
    for (let i = 0; i < sorted.length - 1; i++) {
      const lo = sorted[i], hi = sorted[i + 1];
      if (x >= lo[xKey] && x <= hi[xKey]) {
        const t = (x - lo[xKey]) / (hi[xKey] - lo[xKey]);
        return lo[yKey] + t * (hi[yKey] - lo[yKey]);
      }
    }
    return sorted[sorted.length - 1][yKey];
  }

  return DatasetLoader;
}));
