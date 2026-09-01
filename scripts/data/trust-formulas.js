'use strict';
// trust-formulas.js
// Formula version registry for the Scientific Authority System.
// One record per formula used in a calculator on the platform.

module.exports = {
  dataId: 'formulas',
  version: '2026.07',
  lastReviewed: '2026-07-01',
  description: 'Version registry for all mathematical formulas used by WaterBalanceTools calculators. Each record defines the formula, its variables, dataset dependencies, entity dependencies, and calculators that use it.',
  records: [
    {
      id: 'formula-pool-volume-rectangular',
      name: 'Pool Volume — Rectangular',
      version: '2026.07',
      formula: 'V = L × W × AverageDepth × 7.48052',
      variables: { L: 'Length (feet)', W: 'Width (feet)', AverageDepth: '(Deep end depth + Shallow end depth) / 2 (feet)', '7.48052': 'Cubic feet to US gallons conversion factor' },
      datasetDependencies: ['conversion-factors'],
      entityDependencies: ['gallons'],
      calculatorIds: ['pool-volume-calculator'],
      formulaPageId: 'formula-01',
      confidenceLevel: 'very-high',
      sourceCategory: 'scientific-literature',
      lastReviewed: '2026-07-01',
    },
    {
      id: 'formula-chlorine-dose',
      name: 'Free Chlorine Dosage',
      version: '2026.07',
      formula: 'dose_floz = (targetFC − currentFC) × volume_gal × coefficient / 10000',
      variables: { targetFC: 'Target free chlorine (ppm)', currentFC: 'Current free chlorine (ppm)', volume_gal: 'Pool volume (gallons)', coefficient: 'Product-specific dosage coefficient from dosage-matrices.json' },
      datasetDependencies: ['chemical-ranges', 'dosage-matrices', 'conversion-factors'],
      entityDependencies: ['free-chlorine', 'liquid-chlorine', 'calcium-hypochlorite'],
      calculatorIds: ['pool-chlorine-calculator', 'hot-tub-chlorine-calculator', 'chemical-calculator'],
      formulaPageId: 'formula-02',
      // Corrected Phase 7F.3 (from 'high'/'industry-standards'): the
      // Phase 7E calculator audit (reports/phase-7e/CALCULATOR-PROVENANCE.md)
      // found this formula's product-concentration coefficient was never
      // independently verified against a specific manufacturer or
      // regulatory reference. The target range it doses toward IS
      // CDC-supported; the dosing coefficient itself is not, per the
      // confidence system's own rule ("sparse or manufacturer-specific
      // sources -> Limited").
      confidenceLevel: 'limited',
      sourceCategory: 'internal-dataset',
      notes: 'Dosing coefficient not independently verified against a specific manufacturer/regulatory reference -- see reports/phase-7e/CALCULATOR-PROVENANCE.md. The 1-3 ppm / 2-4 ppm target range this formula doses toward is independently CDC-supported.',
      lastReviewed: '2026-08-18',
    },
    {
      id: 'formula-shock-dose',
      name: 'Shock Treatment Dosage',
      version: '2026.09',
      // Phase 7W: this record previously described a breakpoint-style
      // formula (shockTarget = max(10 x combinedChlorine, shockMinFC))
      // that the live calculator never implemented -- it was a stale,
      // aspirational description, not a reflection of actual behavior
      // (the calculator has always used a flat preset ppm increase, never
      // read combinedChlorine). Corrected to describe what is now
      // actually implemented: a product-specific mass-balance dose. See
      // reports/phase-7w/SHOCK-IMPLEMENTATION.md.
      formula: 'dose (oz) = targetPpmIncrease × volume_gal × 0.013344 / product.activePercent',
      variables: { targetPpmIncrease: 'Selected preset FC increase (5/10/15/20 ppm) -- NOT a breakpoint/combined-chlorine-derived target', volume_gal: 'Pool or hot tub volume (gallons)', 'product.activePercent': 'Available-chlorine % of the selected product, from dataset-dosage-matrices.js' },
      datasetDependencies: ['chemical-ranges', 'dosage-matrices'],
      entityDependencies: ['free-chlorine', 'shock-treatment'],
      calculatorIds: ['pool-shock-calculator', 'hot-tub-shock-calculator'],
      formulaPageId: 'formula-03',
      // Corrected Phase 7F.3: Phase 7E found no confirmed general
      // residential shock-target source (see
      // reports/phase-7e-1/SHOCK-CLAIM-FAMILY-DECISION.md). Phase 7W:
      // implements the Option B product-selector architecture, resolving
      // the product-coefficient half of this record's prior limitation
      // for the 6 supported products; the "no confirmed general
      // residential shock-FC target" limitation for the preset ppm values
      // themselves is unchanged and remains disclosed.
      confidenceLevel: 'limited',
      sourceCategory: 'internal-dataset',
      notes: 'The product-specific dosing coefficient is now derived from the approved mass-balance formula and cross-validated against PHTA\'s Water Chemistry Adjustment Guide (see reports/phase-7t/SHOCK-DIVISOR-AUDIT.md, reports/phase-7u/SHOCK-ARCHITECTURE-DECISION.md). The preset ppm targets (5/10/15/20) remain a flat FC-increase UX choice, not a breakpoint (10x combined chlorine) calculation -- no confirmed primary source establishes a general residential shock-FC target, and this calculator does not read the user\'s actual combined-chlorine reading. See reports/phase-7e-1/SHOCK-CLAIM-FAMILY-DECISION.md.',
      lastReviewed: '2026-08-29',
    },
    {
      id: 'formula-ph-adjustment',
      name: 'pH Adjustment Dosage',
      version: '2026.07',
      formula: 'dose = abs(targetPH − currentPH) × volume_gal × coefficient / 10000',
      variables: { targetPH: 'Target pH', currentPH: 'Current pH', volume_gal: 'Pool volume (gallons)', coefficient: 'Product coefficient from dosage-matrices (per 0.1 pH unit)' },
      notes: 'Linear approximation. Accuracy decreases for adjustments > ±0.5 pH units. Actual dose depends on total alkalinity. Always retest and adjust in multiple steps.',
      datasetDependencies: ['chemical-ranges', 'dosage-matrices'],
      entityDependencies: ['ph', 'muriatic-acid', 'soda-ash'],
      calculatorIds: ['pool-ph-calculator', 'hot-tub-ph-calculator', 'chemical-calculator'],
      formulaPageId: 'formula-04',
      confidenceLevel: 'moderate',
      sourceCategory: 'industry-standards',
      lastReviewed: '2026-07-01',
    },
    {
      id: 'formula-alkalinity-adjustment',
      name: 'Total Alkalinity Adjustment',
      version: '2026.07',
      formula: 'dose_oz = abs(targetTA − currentTA) / 10 × volume_gal / 10000 × coefficient',
      variables: { targetTA: 'Target total alkalinity (ppm)', currentTA: 'Current total alkalinity (ppm)', volume_gal: 'Pool volume (gallons)', coefficient: 'Product coefficient from dosage-matrices (per 10 ppm per 10,000 gal)' },
      datasetDependencies: ['chemical-ranges', 'dosage-matrices'],
      entityDependencies: ['alkalinity', 'baking-soda', 'muriatic-acid'],
      calculatorIds: ['pool-alkalinity-calculator', 'chemical-calculator'],
      formulaPageId: 'formula-05',
      // Corrected Phase 7F.3 -- see formula-chlorine-dose note; same
      // dosing-coefficient-not-independently-verified finding applies.
      confidenceLevel: 'limited',
      sourceCategory: 'internal-dataset',
      notes: 'Dosing coefficient not independently verified against a specific manufacturer/regulatory reference. The 80-120 ppm target range this formula doses toward is independently supported (PHTA fact sheet).',
      lastReviewed: '2026-08-18',
    },
    {
      id: 'formula-salt-adjustment',
      name: 'Salt Level Adjustment',
      version: '2026.07',
      formula: 'dose_lbs = (targetSalt − currentSalt) / 10 × volume_gal / 10000 × coefficient_lbs',
      variables: { targetSalt: 'Target salt (ppm)', currentSalt: 'Current salt (ppm)', volume_gal: 'Pool volume (gallons)', coefficient_lbs: 'Lbs per 10 ppm per 10,000 gal from dosage-matrices' },
      datasetDependencies: ['chemical-ranges', 'dosage-matrices'],
      entityDependencies: ['salt', 'salt-chlorinator', 'pool-salt'],
      calculatorIds: ['saltwater-pool-salt-calculator'],
      formulaPageId: 'formula-06',
      // Corrected Phase 7F.3: no specific manufacturer documentation was
      // actually confirmed (chemistry-ranges.js's salt range has empty
      // source_ids; Phase 7D noted salt targets are equipment-specific and
      // no generic manufacturer-independent source was found).
      confidenceLevel: 'limited',
      sourceCategory: 'internal-dataset',
      notes: 'No manufacturer documentation was independently confirmed for this coefficient; salt dosing is equipment-specific and target/dosing figures here are an internal composite, not sourced to a specific manufacturer.',
      lastReviewed: '2026-08-18',
    },
    {
      id: 'formula-cya-adjustment',
      name: 'Cyanuric Acid Adjustment',
      version: '2026.07',
      formula: 'dose_oz = (targetCYA − currentCYA) / 10 × volume_gal / 10000 × coefficient',
      variables: { targetCYA: 'Target CYA (ppm)', currentCYA: 'Current CYA (ppm)', volume_gal: 'Pool volume (gallons)', coefficient: 'Oz per 10 ppm per 10,000 gal from dosage-matrices' },
      notes: 'CYA cannot be reduced chemically. Reduction requires partial drain and refill. Dissolves slowly — 24–48 hours.',
      datasetDependencies: ['chemical-ranges', 'dosage-matrices'],
      entityDependencies: ['cyanuric-acid', 'stabilizer'],
      calculatorIds: ['pool-cyanuric-acid-calculator', 'chemical-calculator'],
      formulaPageId: 'formula-07',
      // Corrected Phase 7F.3 -- see formula-chlorine-dose note; same
      // dosing-coefficient-not-independently-verified finding. The CYA
      // target range itself is also REQUIRES_REVIEW (claim-cya-routine-outdoor,
      // no confirmed primary source) -- neither the target nor the dose is
      // independently confirmed for this parameter.
      confidenceLevel: 'limited',
      sourceCategory: 'internal-dataset',
      notes: 'Dosing coefficient not independently verified. The 30-50 ppm target range this formula doses toward also has no confirmed primary source (see chemistry-claims.js claim-cya-routine-outdoor).',
      lastReviewed: '2026-08-18',
    },
    {
      id: 'formula-turnover-rate',
      name: 'Pool Turnover Rate',
      version: '2026.07',
      formula: 'turnovers_per_day = (pump_gpm × 60 × operating_hours) / pool_volume_gallons',
      variables: { pump_gpm: 'Pump flow rate (gallons per minute)', operating_hours: 'Daily pump operating hours', pool_volume_gallons: 'Pool volume (gallons)' },
      datasetDependencies: ['units', 'conversion-factors'],
      entityDependencies: ['pump', 'turnover-time', 'gallons'],
      calculatorIds: ['pool-turnover-rate-calculator'],
      formulaPageId: 'formula-08',
      confidenceLevel: 'very-high',
      sourceCategory: 'scientific-literature',
      lastReviewed: '2026-07-01',
    },
    {
      id: 'formula-lsi',
      name: 'Langelier Saturation Index (LSI)',
      version: '2026.07',
      formula: 'LSI = pH + TF + CHF + TAF − 12.1',
      variables: { pH: 'Measured pool pH', TF: 'Temperature Factor (from water-balance lookup table)', CHF: 'Calcium Hardness Factor (from water-balance lookup table)', TAF: 'Total Alkalinity Factor (from water-balance lookup table, using CYA-corrected TA)', '12.1': 'TDS constant (12.1 for standard pools; 12.2 for salt pools)' },
      datasetDependencies: ['water-balance', 'chemical-ranges'],
      entityDependencies: ['lsi', 'ph', 'calcium-hardness', 'alkalinity', 'temperature'],
      calculatorIds: ['chemical-calculator'],
      formulaPageId: 'formula-09',
      confidenceLevel: 'very-high',
      sourceCategory: 'scientific-literature',
      notes: 'Factor tables from Taylor Technologies Pool/Spa Water Chemistry reference. CYA correction factor: TA_corrected = TA − (CYA × 0.33).',
      lastReviewed: '2026-07-01',
    },
    {
      id: 'formula-pool-volume-oval',
      name: 'Pool Volume — Oval',
      version: '2026.07',
      formula: 'V = L × W × 0.89 × AverageDepth × 7.48052',
      variables: { L: 'Length (feet)', W: 'Width (feet)', '0.89': 'Oval shape factor', AverageDepth: 'Average depth (feet)', '7.48052': 'ft³ to gallons conversion factor' },
      datasetDependencies: ['conversion-factors'],
      entityDependencies: ['gallons'],
      calculatorIds: ['pool-volume-calculator'],
      formulaPageId: null,
      confidenceLevel: 'very-high',
      sourceCategory: 'scientific-literature',
      lastReviewed: '2026-07-01',
    },
    {
      id: 'formula-calcium-hardness-dose',
      name: 'Calcium Hardness Dosage',
      version: '2026.07',
      formula: 'dose_oz = (targetCH − currentCH) / 10 × volume_gal / 10000 × coefficient',
      variables: { targetCH: 'Target calcium hardness (ppm)', currentCH: 'Current calcium hardness (ppm)', volume_gal: 'Pool volume (gallons)', coefficient: 'Oz per 10 ppm per 10,000 gal from dosage-matrices' },
      notes: 'CH can only be raised with calcium chloride. It can only be lowered by water dilution. Exothermic reaction — pre-dissolve before adding.',
      datasetDependencies: ['chemical-ranges', 'dosage-matrices'],
      entityDependencies: ['calcium-hardness', 'calcium-chloride'],
      calculatorIds: ['chemical-calculator'],
      formulaPageId: null,
      // Corrected Phase 7F.3 -- see formula-chlorine-dose note.
      confidenceLevel: 'limited',
      sourceCategory: 'internal-dataset',
      notes: 'Dosing coefficient not independently verified against a specific manufacturer/regulatory reference. The 200-400 ppm target range this formula doses toward is independently supported (ANSI/PHTA-11).',
      lastReviewed: '2026-08-18',
    },
  ],
};
