(function () {
  'use strict';

  var GALLONS_PER_CUBIC_FOOT = 7.48052;
  var GALLONS_PER_CUBIC_METER = 264.17;

  /**
   * Rectangular pool: volume (gal) = length × width × average depth × 7.48052
   * Dimensions in feet.
   */
  function rectangularGallons(lengthFt, widthFt, shallowDepthFt, deepDepthFt) {
    var l = parseFloat(lengthFt) || 0;
    var w = parseFloat(widthFt) || 0;
    var s = parseFloat(shallowDepthFt) || 0;
    var d = parseFloat(deepDepthFt) || 0;
    var avg = (s + d) / 2;
    if (l <= 0 || w <= 0 || avg <= 0) return 0;
    return l * w * avg * GALLONS_PER_CUBIC_FOOT;
  }

  /**
   * Circular pool: volume (gal) = π × radius² × average depth × 7.48052
   * Diameter and depths in feet.
   */
  function circularGallons(diameterFt, shallowDepthFt, deepDepthFt) {
    var diam = parseFloat(diameterFt) || 0;
    var s = parseFloat(shallowDepthFt) || 0;
    var d = parseFloat(deepDepthFt) || 0;
    var avg = (s + d) / 2;
    if (diam <= 0 || avg <= 0) return 0;
    var r = diam / 2;
    return Math.PI * r * r * avg * GALLONS_PER_CUBIC_FOOT;
  }

  /**
   * Cubic meters to US gallons
   */
  function cubicMetersToGallons(cubicMeters) {
    return (parseFloat(cubicMeters) || 0) * GALLONS_PER_CUBIC_METER;
  }

  window.WaterBalance = window.WaterBalance || {};
  window.WaterBalance.volume = {
    GALLONS_PER_CUBIC_FOOT: GALLONS_PER_CUBIC_FOOT,
    GALLONS_PER_CUBIC_METER: GALLONS_PER_CUBIC_METER,
    rectangularGallons: rectangularGallons,
    circularGallons: circularGallons,
    cubicMetersToGallons: cubicMetersToGallons
  };
})();
