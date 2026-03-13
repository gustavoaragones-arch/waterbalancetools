(function () {
  'use strict';

  var GALLONS_PER_CUBIC_METER = 264.17;

  var DEFAULTS = {
    pool: { chlorine: { min: 1, max: 3 }, ph: { min: 7.2, max: 7.6 } },
    hotTub: { chlorine: { min: 3, max: 5 }, ph: { min: 7.2, max: 7.8 } }
  };

  /**
   * Chlorine needed in ppm (target - current), clamped to non-negative.
   */
  function chlorineNeededPpm(current, target) {
    var need = (parseFloat(target) || 0) - (parseFloat(current) || 0);
    return need > 0 ? need : 0;
  }

  /**
   * Liquid chlorine (10%): ounces = (gallons × ppm) / 128000
   */
  function liquidChlorineOunces(gallons, ppm) {
    return (gallons * ppm) / 128000;
  }

  /**
   * Granular shock: ~1 oz per 10,000 gal per 1 ppm
   */
  function granularShockOunces(gallons, ppm) {
    return (gallons * ppm) / 10000;
  }

  /**
   * Chlorine tablets (trichlor): ~1 oz per 12,000 gal per 1 ppm (approx)
   */
  function tabletChlorineOunces(gallons, ppm) {
    return (gallons * ppm) / 12000;
  }

  /**
   * Returns ounces of chlorine for the selected type.
   */
  function chlorineOuncesForType(gallons, ppm, type) {
    var g = parseFloat(gallons) || 0;
    var p = parseFloat(ppm) || 0;
    if (g <= 0 || p <= 0) return 0;
    switch (type) {
      case 'liquid':
        return liquidChlorineOunces(g, p);
      case 'granular':
        return granularShockOunces(g, p);
      case 'tablets':
        return tabletChlorineOunces(g, p);
      default:
        return liquidChlorineOunces(g, p);
    }
  }

  /**
   * pH increaser: ounces = (gallons / 10000) * phDifference * 6
   * (simplified estimation when current_ph < target_ph)
   */
  function phIncreaserOunces(gallons, phDifference) {
    var g = parseFloat(gallons) || 0;
    var d = parseFloat(phDifference) || 0;
    if (g <= 0 || d <= 0) return 0;
    return (g / 10000) * d * 6;
  }

  /**
   * pH reducer: similar scaling (sodium bisulfate / dry acid)
   */
  function phReducerOunces(gallons, phDifference) {
    var g = parseFloat(gallons) || 0;
    var d = parseFloat(phDifference) || 0;
    if (g <= 0 || d <= 0) return 0;
    return (g / 10000) * d * 5;
  }

  function getDefaults(waterType) {
    return waterType === 'hotTub' ? DEFAULTS.hotTub : DEFAULTS.pool;
  }

  function getTargetChlorine(waterType, override) {
    var def = getDefaults(waterType);
    if (override && override.min != null && override.max != null)
      return { min: override.min, max: override.max };
    return def.chlorine;
  }

  function getTargetPh(waterType, override) {
    var def = getDefaults(waterType);
    if (override && override.min != null && override.max != null)
      return { min: override.min, max: override.max };
    return def.ph;
  }

  window.WaterBalance = window.WaterBalance || {};
  window.WaterBalance.calculator = {
    GALLONS_PER_CUBIC_METER: GALLONS_PER_CUBIC_METER,
    DEFAULTS: DEFAULTS,
    chlorineNeededPpm: chlorineNeededPpm,
    chlorineOuncesForType: chlorineOuncesForType,
    phIncreaserOunces: phIncreaserOunces,
    phReducerOunces: phReducerOunces,
    getDefaults: getDefaults,
    getTargetChlorine: getTargetChlorine,
    getTargetPh: getTargetPh
  };
})();
