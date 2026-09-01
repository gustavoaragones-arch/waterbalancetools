/**
 * WaterBalanceTools — shared calculator utilities
 * Used by all SEO calculator pages. Lightweight, no dependencies.
 */
(function () {
  'use strict';

  var GAL_PER_CUBIC_FT = 7.48052;
  var GAL_PER_CUBIC_M = 264.17;

  /**
   * Chlorine: liquid 10% — ounces = (gallons x ppm) / 749.4
   * Phase 7S correction (was /128000, ~166x too low — see
   * reports/phase-7s/LIQUID-CHLORINE-AUDIT.md). Derived from the standard
   * pool-industry mass-balance relationship (1 ppm x 10,000 gal requires
   * ~1.334 oz of 100%-available-chlorine product, using 8.34 lb/gal water
   * density), divided by 10% product strength: divisor = 1,000,000 x 0.10
   * / (8.34 x 16) = 749.4. Independently confirmed against the Indiana
   * Department of Health "Water Chemistry Adjustment Guide" (adapted from
   * the National Swimming Pool Foundation Pool & Spa Operator Handbook),
   * source in-doh-chemical-adjustment-2021.
   *
   * Tablets (trichlor, ~90% available chlorine) — ounces = (gallons x
   * ppm) / 6666.7. Phase 7S correction (was /12000). Derived the same way:
   * divisor = 1,000,000 x 0.06666 (per the government table's own stated
   * 1.5 oz/10,000gal/1ppm trichlor figure, i.e. 10000/1.5=6666.7 directly)
   * — matches this site's own dosage-matrices.json trichlor-tablets-90pct
   * record (1.5 oz), which was already correct and simply not wired into
   * this function.
   *
   * Granular/generic shock divisor (10000) is UNCHANGED — the underlying
   * product/strength assumption is unspecified/ambiguous (no single
   * product this generically maps to was found in the government table),
   * so it remains REQUIRES_EXPERT_REVIEW rather than corrected.
   */
  function calculateChlorine(gallons, currentPpm, targetPpm, type) {
    var g = parseFloat(gallons) || 0;
    var cur = parseFloat(currentPpm) || 0;
    var tgt = parseFloat(targetPpm) || 0;
    var ppm = tgt - cur;
    if (g <= 0 || ppm <= 0) return { ounces: 0, ppm: 0 };
    var ounces = 0;
    if (type === 'liquid') ounces = (g * ppm) / 749.4;
    else if (type === 'granular' || type === 'shock') ounces = (g * ppm) / 10000;
    else if (type === 'tablets') ounces = (g * ppm) / 6666.7;
    else ounces = (g * ppm) / 749.4;
    return { ounces: ounces, ppm: ppm };
  }

  /**
   * pH: qualitative direction/magnitude guidance only -- NOT a chemical
   * dose. Phase 7V replaces the prior numeric estimate (diff * 6 or * 5
   * ounces), which Phase 7T/7U established has no traceable derivation or
   * authoritative source: pH adjustment is a carbonate-buffered titration
   * problem, not a linear ppm-mass-balance relationship, and a defensible
   * numeric dose requires total alkalinity (and likely cyanuric acid) as
   * inputs this calculator does not collect -- see
   * reports/phase-7u/PH-ARCHITECTURE-DECISION.md (Option A, approved) and
   * reports/phase-7v/PH-IMPLEMENTATION.md for the full rationale.
   *
   * Returns direction ('balanced' | 'raise' | 'lower') and, when not
   * balanced, a magnitude tier ('small' | 'moderate' | 'substantial')
   * based purely on how far current pH is from target on the pH scale.
   * The magnitude tiers are a readability aid over the input distance,
   * not a validated dosing threshold -- no source establishes (or is
   * claimed to establish) that these bands correspond to a specific
   * chemical quantity.
   */
  function calculatePHAdjustment(gallons, currentPh, targetPh) {
    var g = parseFloat(gallons) || 0;
    var cur = parseFloat(currentPh) || 0;
    var tgt = parseFloat(targetPh) || 0;
    if (g <= 0) return { valid: false, direction: null, magnitude: null, diff: 0 };
    var diff = tgt - cur;
    var absDiff = Math.abs(diff);
    if (absDiff < 0.05) return { valid: true, direction: 'balanced', magnitude: null, diff: diff };
    var direction = diff > 0 ? 'raise' : 'lower';
    var magnitude;
    if (absDiff < 0.2) magnitude = 'small';
    else if (absDiff < 0.5) magnitude = 'moderate';
    else magnitude = 'substantial';
    return { valid: true, direction: direction, magnitude: magnitude, diff: diff };
  }

  /**
   * Shock: product-specific dose via the approved mass-balance formula.
   * Phase 7W implements the Option B architecture approved in
   * reports/phase-7u/SHOCK-ARCHITECTURE-DECISION.md, replacing the prior
   * calculateShock(gallons, targetPpm) generic divisor (oz =
   * gallons*ppm/10000), which Phase 7T/7U established corresponds to no
   * real chlorine product (implies a physically impossible 133.44%-
   * available product) -- see reports/phase-7t/SHOCK-DIVISOR-AUDIT.md.
   *
   * SHOCK_PRODUCTS mirrors the chlorine-relevant records in
   * scripts/data/dataset-dosage-matrices.js (activePercent,
   * cyaContribution, calciumContributionPpmPerOz, and notes copied
   * verbatim from that file -- keep in sync if that file changes). Dose
   * is computed directly from activePercent using the same 0.013344
   * mass-balance constant already approved for liquid chlorine
   * (formula-02, Phase 7S) and calcium hypochlorite (formula-03, Phase
   * 7T), rather than a pre-rounded coefficient, so the two stay
   * traceably consistent.
   */
  var SHOCK_PRODUCTS = {
    'liquid-chlorine-10pct': {
      label: 'Liquid Chlorine (10%)',
      activePercent: 10,
      outputUnit: 'oz',
      cyaContribution: 0,
      notes: 'No CYA accumulation. Degrades ~30% per 60 days at room temperature.',
    },
    'liquid-chlorine-12pct': {
      label: 'Liquid Chlorine (12.5%)',
      activePercent: 12.5,
      outputUnit: 'oz',
      cyaContribution: 0,
      notes: 'Higher concentration. More economical. Same active ingredient as 10%.',
    },
    'calcium-hypochlorite-65pct': {
      label: 'Calcium Hypochlorite (65%)',
      activePercent: 65,
      outputUnit: 'oz',
      cyaContribution: 0,
      calciumContributionPpmPerOz: 0.39,
      mixingWarning: 'Do not mix with trichlor or other chlorinating agents.',
      notes: 'Pre-dissolve in water before adding. Do not add to skimmer. Adds calcium hardness -- relevant at high CH.',
    },
    'calcium-hypochlorite-73pct': {
      label: 'Calcium Hypochlorite (73%)',
      activePercent: 73,
      outputUnit: 'oz',
      cyaContribution: 0,
      mixingWarning: 'Do not mix with trichlor or other chlorinating agents.',
      notes: 'Higher concentration calcium hypochlorite. Same handling precautions as 65%.',
    },
    'sodium-dichlor-56pct': {
      label: 'Sodium Dichlor (56%)',
      activePercent: 56,
      outputUnit: 'oz',
      cyaContribution: 0.9,
      cyaContributionUnit: 'ppm CYA per oz per 10k gal',
      notes: 'Adds ~0.9 ppm CYA per oz per 10,000 gal. Use sparingly to avoid CYA accumulation. Dissolves rapidly.',
    },
    'trichlor-tablets-90pct': {
      label: 'Trichlor Tablets (90%)',
      activePercent: 90,
      outputUnit: 'oz',
      cyaContribution: 0.6,
      cyaContributionUnit: 'ppm CYA per oz per 10k gal',
      mixingWarning: 'Do not mix with calcium hypochlorite or other chlorinating agents.',
      notes: 'Slow-dissolving. pH ~2.9, adds acidity over time. CYA accumulates with routine use.',
    },
  };

  /**
   * Hot tubs: only products the dataset's supportedPoolTypes lists as
   * hot-tub-appropriate (dichlor and trichlor are outdoor/residential-pool
   * only in dataset-dosage-matrices.js).
   */
  var SHOCK_PRODUCTS_HOT_TUB = ['liquid-chlorine-10pct', 'liquid-chlorine-12pct', 'calcium-hypochlorite-65pct', 'calcium-hypochlorite-73pct'];

  function calculateShockByProduct(gallons, targetPpm, productId) {
    var g = parseFloat(gallons) || 0;
    var ppm = parseFloat(targetPpm) || 0;
    if (g <= 0 || ppm <= 0) return { valid: false };
    var product = SHOCK_PRODUCTS[productId];
    if (!product) return { valid: false };
    var oz = (ppm * g * 0.013344) / product.activePercent;
    return { valid: true, ounces: oz, pounds: oz / 16, product: product, productId: productId };
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
    calculateShockByProduct: calculateShockByProduct,
    SHOCK_PRODUCTS: SHOCK_PRODUCTS,
    SHOCK_PRODUCTS_HOT_TUB: SHOCK_PRODUCTS_HOT_TUB,
    calculatePoolVolume: calculatePoolVolume,
    calculateSpaVolume: calculateSpaVolume,
    calculateSalt: calculateSalt,
    calculateCYA: calculateCYA,
    calculateAlkalinity: calculateAlkalinity,
    calculateTurnover: calculateTurnover,
    cubicMetersToGallons: cubicMetersToGallons
  };
})();
