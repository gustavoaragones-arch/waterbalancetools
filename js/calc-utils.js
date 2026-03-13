/**
 * WaterBalanceTools — shared calculator utilities
 * Used by all SEO calculator pages. Lightweight, no dependencies.
 */
(function () {
  'use strict';

  var GAL_PER_CUBIC_FT = 7.48052;
  var GAL_PER_CUBIC_M = 264.17;

  /** Chlorine: liquid 10% — ounces = (gallons × ppm) / 128000 */
  function calculateChlorine(gallons, currentPpm, targetPpm, type) {
    var g = parseFloat(gallons) || 0;
    var cur = parseFloat(currentPpm) || 0;
    var tgt = parseFloat(targetPpm) || 0;
    var ppm = tgt - cur;
    if (g <= 0 || ppm <= 0) return { ounces: 0, ppm: 0 };
    var ounces = 0;
    if (type === 'liquid') ounces = (g * ppm) / 128000;
    else if (type === 'granular' || type === 'shock') ounces = (g * ppm) / 10000;
    else if (type === 'tablets') ounces = (g * ppm) / 12000;
    else ounces = (g * ppm) / 128000;
    return { ounces: ounces, ppm: ppm };
  }

  /** pH: increaser or reducer in ounces (simplified estimation) */
  function calculatePHAdjustment(gallons, currentPh, targetPh) {
    var g = parseFloat(gallons) || 0;
    var cur = parseFloat(currentPh) || 0;
    var tgt = parseFloat(targetPh) || 0;
    if (g <= 0) return { ounces: 0, direction: null, diff: 0 };
    var diff = tgt - cur;
    if (Math.abs(diff) < 0.05) return { ounces: 0, direction: null, diff: 0 };
    var ounces = 0;
    var direction = null;
    if (diff > 0) {
      direction = 'increaser';
      ounces = (g / 10000) * diff * 6;
    } else {
      direction = 'reducer';
      ounces = (g / 10000) * Math.abs(diff) * 5;
    }
    return { ounces: ounces, direction: direction, diff: diff };
  }

  /** Shock: granular shock to reach target ppm (e.g. 10 ppm) */
  function calculateShock(gallons, targetPpm) {
    var g = parseFloat(gallons) || 0;
    var ppm = parseFloat(targetPpm) || 10;
    if (g <= 0) return { ounces: 0, pounds: 0 };
    var oz = (g * ppm) / 10000;
    return { ounces: oz, pounds: oz / 16 };
  }

  /** Pool volume by shape. Returns { gallons, liters }. */
  function calculatePoolVolume(shape, dimensions) {
    var gal = 0;
    if (shape === 'rectangular') {
      var l = parseFloat(dimensions.length) || 0;
      var w = parseFloat(dimensions.width) || 0;
      var s = parseFloat(dimensions.shallowDepth) || 0;
      var d = parseFloat(dimensions.deepDepth) || 0;
      var avg = (s + d) / 2;
      if (l > 0 && w > 0 && avg > 0) gal = l * w * avg * GAL_PER_CUBIC_FT;
    } else if (shape === 'circular') {
      var diam = parseFloat(dimensions.diameter) || 0;
      var s2 = parseFloat(dimensions.shallowDepth) || 0;
      var d2 = parseFloat(dimensions.deepDepth) || 0;
      var avg2 = (s2 + d2) / 2;
      if (diam > 0 && avg2 > 0) gal = Math.PI * Math.pow(diam / 2, 2) * avg2 * GAL_PER_CUBIC_FT;
    } else if (shape === 'oval') {
      var l2 = parseFloat(dimensions.length) || 0;
      var w2 = parseFloat(dimensions.width) || 0;
      var dep = parseFloat(dimensions.depth) || 0;
      if (l2 > 0 && w2 > 0 && dep > 0) gal = Math.PI * (l2 / 2) * (w2 / 2) * dep * GAL_PER_CUBIC_FT;
    }
    var liters = gal * 3.78541;
    return { gallons: gal, liters: liters };
  }

  /** Spa volume: circular, diameter + depth → gallons */
  function calculateSpaVolume(diameterFt, depthFt) {
    var d = parseFloat(diameterFt) || 0;
    var h = parseFloat(depthFt) || 0;
    if (d <= 0 || h <= 0) return 0;
    return Math.PI * Math.pow(d / 2, 2) * h * GAL_PER_CUBIC_FT;
  }

  /** Salt: pounds of salt to raise from current to target ppm. ~1 lb per 10,000 gal ≈ 12 ppm */
  function calculateSalt(gallons, currentPpm, targetPpm) {
    var g = parseFloat(gallons) || 0;
    var cur = parseFloat(currentPpm) || 0;
    var tgt = parseFloat(targetPpm) || 0;
    var ppm = tgt - cur;
    if (g <= 0 || ppm <= 0) return { pounds: 0, ppm: 0 };
    var lb = (g / 10000) * (ppm / 12);
    return { pounds: lb, ppm: ppm };
  }

  /** CYA: ounces of stabilizer to raise from current to target. ~13 oz per 10,000 gal per 10 ppm */
  function calculateCYA(gallons, currentCya, targetCya) {
    var g = parseFloat(gallons) || 0;
    var cur = parseFloat(currentCya) || 0;
    var tgt = parseFloat(targetCya) || 0;
    var ppm = tgt - cur;
    if (g <= 0 || ppm <= 0) return { ounces: 0, ppm: 0 };
    var oz = (g / 10000) * (ppm / 10) * 13;
    return { ounces: oz, ppm: ppm };
  }

  /** Alkalinity: sodium bicarbonate. ~1.4 lb per 10,000 gal raises 10 ppm → oz = (g/10000)*(ppm/10)*22.4 */
  function calculateAlkalinity(gallons, currentTa, targetTa) {
    var g = parseFloat(gallons) || 0;
    var cur = parseFloat(currentTa) || 0;
    var tgt = parseFloat(targetTa) || 0;
    var ppm = tgt - cur;
    if (g <= 0 || ppm <= 0) return { ounces: 0, pounds: 0, ppm: 0 };
    var lb = (g / 10000) * (ppm / 10) * 1.4;
    return { ounces: lb * 16, pounds: lb, ppm: ppm };
  }

  /** Turnover: hours = pool volume (gal) / flow rate (gph) */
  function calculateTurnover(gallons, flowGph) {
    var g = parseFloat(gallons) || 0;
    var f = parseFloat(flowGph) || 0;
    if (g <= 0 || f <= 0) return 0;
    return g / f;
  }

  function cubicMetersToGallons(m3) {
    return (parseFloat(m3) || 0) * GAL_PER_CUBIC_M;
  }

  window.WaterBalance = window.WaterBalance || {};
  window.WaterBalance.calcUtils = {
    GAL_PER_CUBIC_FT: GAL_PER_CUBIC_FT,
    GAL_PER_CUBIC_M: GAL_PER_CUBIC_M,
    calculateChlorine: calculateChlorine,
    calculatePHAdjustment: calculatePHAdjustment,
    calculateShock: calculateShock,
    calculatePoolVolume: calculatePoolVolume,
    calculateSpaVolume: calculateSpaVolume,
    calculateSalt: calculateSalt,
    calculateCYA: calculateCYA,
    calculateAlkalinity: calculateAlkalinity,
    calculateTurnover: calculateTurnover,
    cubicMetersToGallons: cubicMetersToGallons
  };
})();
