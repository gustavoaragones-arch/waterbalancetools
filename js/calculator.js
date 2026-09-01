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
   * Liquid chlorine (10%): ounces = (gallons x ppm) / 749.4
   * Phase 7S correction (was /128000) -- see js/calc-utils.js's
   * calculateChlorine for the full derivation and
   * reports/phase-7s/LIQUID-CHLORINE-AUDIT.md. This function duplicated
   * calc-utils.js's (also-corrected) constant; kept in sync rather than
   * consolidated, since de-duplicating the two calculator implementations
   * is a separate architecture question outside this phase's scope.
   */
  function liquidChlorineOunces(gallons, ppm) {
    return (gallons * ppm) / 749.4;
  }

  /**
   * Dry/granular chlorine products: dose via the approved mass-balance
   * formula, keyed by product. Phase 7W replaces the prior
   * granularShockOunces(gallons, ppm) generic divisor (oz =
   * gallons*ppm/10000), which corresponded to no real chlorine product
   * (Phase 7T/7U) -- see js/calc-utils.js's SHOCK_PRODUCTS /
   * calculateShockByProduct (identical data and logic, kept in sync per
   * the established duplicate-implementation pattern) and
   * reports/phase-7w/SHOCK-IMPLEMENTATION.md. Mirrors the dry-product
   * subset of scripts/data/dataset-dosage-matrices.js not already covered
   * by liquidChlorineOunces (liquid-chlorine-10pct) or
   * tabletChlorineOunces (trichlor-tablets-90pct).
   */
  var GRANULAR_PRODUCTS = {
    'calcium-hypochlorite-65pct': {
      label: 'Calcium Hypochlorite (65%)',
      activePercent: 65,
      cyaContribution: 0,
      calciumContributionPpmPerOz: 0.39,
      mixingWarning: 'Do not mix with trichlor or other chlorinating agents.',
      notes: 'Pre-dissolve in water before adding. Do not add to skimmer. Adds calcium hardness -- relevant at high CH.',
    },
    'calcium-hypochlorite-73pct': {
      label: 'Calcium Hypochlorite (73%)',
      activePercent: 73,
      cyaContribution: 0,
      mixingWarning: 'Do not mix with trichlor or other chlorinating agents.',
      notes: 'Higher concentration calcium hypochlorite. Same handling precautions as 65%.',
    },
    'sodium-dichlor-56pct': {
      label: 'Sodium Dichlor (56%)',
      activePercent: 56,
      cyaContribution: 0.9,
      cyaContributionUnit: 'ppm CYA per oz per 10k gal',
      notes: 'Adds ~0.9 ppm CYA per oz per 10,000 gal. Use sparingly to avoid CYA accumulation. Dissolves rapidly.',
    },
  };

  function granularChlorineOuncesForProduct(gallons, ppm, productId) {
    var g = parseFloat(gallons) || 0;
    var p = parseFloat(ppm) || 0;
    if (g <= 0 || p <= 0) return { valid: false };
    var product = GRANULAR_PRODUCTS[productId];
    if (!product) return { valid: false };
    var oz = (p * g * 0.013344) / product.activePercent;
    return { valid: true, ounces: oz, product: product, productId: productId };
  }

  /**
   * Chlorine tablets (trichlor, ~90% available chlorine): ounces =
   * (gallons x ppm) / 6666.7. Phase 7S correction (was /12000) -- matches
   * this site's own dosage-matrices.json trichlor-tablets-90pct record
   * (1.5 oz per 10,000 gal per 1 ppm) and the Indiana DOH government table.
   */
  function tabletChlorineOunces(gallons, ppm) {
    return (gallons * ppm) / 6666.7;
  }

  /**
   * Returns ounces of chlorine for the selected type. 'granular' is not
   * handled here as of Phase 7W -- it requires a specific product (see
   * granularChlorineOuncesForProduct), since no single generic granular
   * coefficient is defensible (Phase 7T/7U).
   */
  function chlorineOuncesForType(gallons, ppm, type) {
    var g = parseFloat(gallons) || 0;
    var p = parseFloat(ppm) || 0;
    if (g <= 0 || p <= 0) return 0;
    switch (type) {
      case 'liquid':
        return liquidChlorineOunces(g, p);
      case 'tablets':
        return tabletChlorineOunces(g, p);
      default:
        return liquidChlorineOunces(g, p);
    }
  }

  /**
   * pH: qualitative direction/magnitude guidance only -- NOT a chemical
   * dose. Phase 7V replaces the prior phIncreaserOunces/phReducerOunces
   * numeric estimates (diff * 6 / diff * 5 ounces), which had no
   * traceable derivation -- see js/calc-utils.js's calculatePHAdjustment
   * (identical logic, kept in sync per the established duplicate-
   * implementation pattern) and reports/phase-7v/PH-IMPLEMENTATION.md.
   *
   * Returns { direction: 'balanced'|'raise'|'lower', magnitude:
   * null|'small'|'moderate'|'substantial', diff }. phDifference here is
   * the signed (target - current) delta, matching calc-utils.js.
   */
  function evaluatePHGuidance(gallons, phDifference) {
    var g = parseFloat(gallons) || 0;
    var diff = parseFloat(phDifference) || 0;
    if (g <= 0) return { direction: null, magnitude: null, diff: 0 };
    var absDiff = Math.abs(diff);
    if (absDiff < 0.05) return { direction: 'balanced', magnitude: null, diff: diff };
    var direction = diff > 0 ? 'raise' : 'lower';
    var magnitude;
    if (absDiff < 0.2) magnitude = 'small';
    else if (absDiff < 0.5) magnitude = 'moderate';
    else magnitude = 'substantial';
    return { direction: direction, magnitude: magnitude, diff: diff };
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
    granularChlorineOuncesForProduct: granularChlorineOuncesForProduct,
    GRANULAR_PRODUCTS: GRANULAR_PRODUCTS,
    evaluatePHGuidance: evaluatePHGuidance,
    getDefaults: getDefaults,
    getTargetChlorine: getTargetChlorine,
    getTargetPh: getTargetPh
  };
})();
