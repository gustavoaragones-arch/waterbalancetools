'use strict';
// Core supporting datasets: units, conversion-factors, temperature-guidelines,
// testing-frequency, water-balance, confidence-levels, version

const units = {
  datasetId: 'units',
  version: '2026.07',
  lastReviewed: '2026-07-01',
  description: 'Canonical unit definitions for all measurements used on WaterBalanceTools. Every conversion originates from conversion-factors.json.',
  maintainer: 'WaterBalanceTools',
  sourcePriority: ['scientific-literature', 'industry-standards'],
  records: [
    { id: 'ppm', name: 'Parts Per Million', symbol: 'ppm', quantity: 'concentration',
      baseUnit: true, siEquivalent: 'mg/L', numericalEquivalence: '1 ppm = 1 mg/L in dilute aqueous solution',
      usedFor: ['free-chlorine', 'combined-chlorine', 'total-alkalinity', 'calcium-hardness', 'cyanuric-acid', 'salt', 'tds', 'phosphate', 'copper', 'iron'] },

    { id: 'mg-per-l', name: 'Milligrams per Liter', symbol: 'mg/L', quantity: 'concentration',
      baseUnit: false, siEquivalent: 'mg/L',
      numericalEquivalence: '1 mg/L = 1 ppm in dilute aqueous solution',
      usedFor: ['all-chemical-parameters-metric'] },

    { id: 'ppb', name: 'Parts Per Billion', symbol: 'ppb', quantity: 'concentration',
      baseUnit: false, siEquivalent: 'µg/L',
      numericalEquivalence: '1 ppb = 0.001 ppm',
      usedFor: ['phosphate', 'trace-metals'] },

    { id: 'ph-unit', name: 'pH Unit', symbol: 'pH', quantity: 'acidity',
      baseUnit: true, siEquivalent: null,
      numericalEquivalence: 'Logarithmic scale 0–14. 7 = neutral.',
      usedFor: ['ph'] },

    { id: 'millivolts', name: 'Millivolts', symbol: 'mV', quantity: 'electrical-potential',
      baseUnit: false, siEquivalent: '0.001 V',
      numericalEquivalence: '1 V = 1000 mV',
      usedFor: ['orp'] },

    { id: 'us-gallons', name: 'US Liquid Gallon', symbol: 'gal', quantity: 'volume',
      baseUnit: true, siEquivalent: '3.785411784 L',
      numericalEquivalence: '1 gal = 3.785411784 L = 0.133680556 ft³',
      usedFor: ['pool-volume', 'product-dose'] },

    { id: 'liters', name: 'Liter', symbol: 'L', quantity: 'volume',
      baseUnit: false, siEquivalent: 'L',
      numericalEquivalence: '1 L = 0.264172052 gal = 0.001 m³',
      usedFor: ['pool-volume-metric', 'product-dose-metric'] },

    { id: 'cubic-feet', name: 'Cubic Foot', symbol: 'ft³', quantity: 'volume',
      baseUnit: false, siEquivalent: '28.316847 L',
      numericalEquivalence: '1 ft³ = 7.48051948 gal = 28.3168 L',
      usedFor: ['pool-volume-calculation'] },

    { id: 'us-fluid-oz', name: 'US Fluid Ounce', symbol: 'fl oz', quantity: 'volume',
      baseUnit: false, siEquivalent: '29.5735 mL',
      numericalEquivalence: '128 fl oz = 1 gal = 3.785 L',
      usedFor: ['liquid-chemical-dose'] },

    { id: 'oz-weight', name: 'Ounce (Weight)', symbol: 'oz', quantity: 'mass',
      baseUnit: false, siEquivalent: '28.3495 g',
      numericalEquivalence: '16 oz = 1 lb = 453.592 g',
      usedFor: ['dry-chemical-dose'] },

    { id: 'pounds', name: 'Pound', symbol: 'lb', quantity: 'mass',
      baseUnit: false, siEquivalent: '453.59237 g',
      numericalEquivalence: '1 lb = 16 oz = 453.592 g',
      usedFor: ['dry-chemical-dose', 'chemical-inventory'] },

    { id: 'grams', name: 'Gram', symbol: 'g', quantity: 'mass',
      baseUnit: false, siEquivalent: 'g',
      numericalEquivalence: '1 g = 0.03527 oz = 0.002205 lb',
      usedFor: ['scientific-calculations'] },

    { id: 'fahrenheit', name: 'Degrees Fahrenheit', symbol: '°F', quantity: 'temperature',
      baseUnit: true, siEquivalent: '(°F − 32) × 5/9 = °C',
      numericalEquivalence: '32°F = 0°C. 212°F = 100°C.',
      usedFor: ['water-temperature'] },

    { id: 'celsius', name: 'Degrees Celsius', symbol: '°C', quantity: 'temperature',
      baseUnit: false, siEquivalent: '°C',
      numericalEquivalence: '°C × 9/5 + 32 = °F',
      usedFor: ['water-temperature-metric'] },

    { id: 'hours', name: 'Hours', symbol: 'hr', quantity: 'time',
      baseUnit: false, siEquivalent: '3600 s',
      numericalEquivalence: '1 hr = 60 min',
      usedFor: ['pump-run-time', 'turnover-rate', 'wait-time'] },

    { id: 'minutes', name: 'Minutes', symbol: 'min', quantity: 'time',
      baseUnit: false, siEquivalent: '60 s',
      numericalEquivalence: '60 min = 1 hr',
      usedFor: ['wait-time', 'pump-turnover-calculation'] },

    { id: 'days', name: 'Days', symbol: 'd', quantity: 'time',
      baseUnit: false, siEquivalent: '86400 s',
      numericalEquivalence: '1 d = 24 hr',
      usedFor: ['maintenance-intervals', 'water-change-schedule'] },

    { id: 'weeks', name: 'Weeks', symbol: 'wk', quantity: 'time',
      baseUnit: false, siEquivalent: '604800 s',
      numericalEquivalence: '1 wk = 7 d',
      usedFor: ['maintenance-schedule'] },

    { id: 'months', name: 'Months', symbol: 'mo', quantity: 'time',
      baseUnit: false, siEquivalent: '~2628000 s',
      numericalEquivalence: '1 mo ≈ 30.437 d (calendar average)',
      usedFor: ['seasonal-maintenance', 'water-change-schedule'] },

    { id: 'gallons-per-minute', name: 'Gallons Per Minute', symbol: 'GPM', quantity: 'flow-rate',
      baseUnit: true, siEquivalent: '0.063 L/s',
      numericalEquivalence: '1 GPM = 0.0630902 L/s',
      usedFor: ['pump-flow-rate', 'turnover-calculation'] },

    { id: 'percent', name: 'Percent', symbol: '%', quantity: 'concentration',
      baseUnit: false, siEquivalent: 'dimensionless (ratio × 100)',
      numericalEquivalence: '1% = 10,000 ppm',
      usedFor: ['product-active-percentage'] },
  ],
};

const conversionFactors = {
  datasetId: 'conversion-factors',
  version: '2026.07',
  lastReviewed: '2026-07-01',
  description: 'All unit conversion factors used in pool chemistry calculations. Single authoritative source. Never duplicate these values elsewhere.',
  maintainer: 'WaterBalanceTools',
  sourcePriority: ['scientific-literature', 'industry-standards'],
  records: [
    // Volume
    { id: 'gal-to-liters', fromUnit: 'us-gallons', toUnit: 'liters', factor: 3.785411784, formula: 'liters = gallons × 3.785411784' },
    { id: 'liters-to-gal', fromUnit: 'liters', toUnit: 'us-gallons', factor: 0.264172052, formula: 'gallons = liters × 0.264172052' },
    { id: 'gal-to-ft3', fromUnit: 'us-gallons', toUnit: 'cubic-feet', factor: 0.133680556, formula: 'ft³ = gallons × 0.133680556' },
    { id: 'ft3-to-gal', fromUnit: 'cubic-feet', toUnit: 'us-gallons', factor: 7.48051948, formula: 'gallons = ft³ × 7.48051948' },
    { id: 'fl-oz-to-gal', fromUnit: 'us-fluid-oz', toUnit: 'us-gallons', factor: 0.0078125, formula: 'gallons = fl_oz / 128' },
    { id: 'gal-to-fl-oz', fromUnit: 'us-gallons', toUnit: 'us-fluid-oz', factor: 128, formula: 'fl_oz = gallons × 128' },
    { id: 'liters-to-ml', fromUnit: 'liters', toUnit: 'milliliters', factor: 1000, formula: 'mL = L × 1000' },

    // Mass
    { id: 'lb-to-oz', fromUnit: 'pounds', toUnit: 'oz-weight', factor: 16, formula: 'oz = lb × 16' },
    { id: 'oz-to-lb', fromUnit: 'oz-weight', toUnit: 'pounds', factor: 0.0625, formula: 'lb = oz / 16' },
    { id: 'lb-to-grams', fromUnit: 'pounds', toUnit: 'grams', factor: 453.59237, formula: 'g = lb × 453.59237' },
    { id: 'grams-to-oz', fromUnit: 'grams', toUnit: 'oz-weight', factor: 0.035273962, formula: 'oz = g × 0.035273962' },
    { id: 'oz-to-grams', fromUnit: 'oz-weight', toUnit: 'grams', factor: 28.34952, formula: 'g = oz × 28.34952' },
    { id: 'kg-to-lb', fromUnit: 'kilograms', toUnit: 'pounds', factor: 2.20462262, formula: 'lb = kg × 2.20462262' },

    // Concentration
    { id: 'ppm-to-mgl', fromUnit: 'ppm', toUnit: 'mg-per-l', factor: 1, formula: 'mg/L = ppm (in dilute aqueous solution)' },
    { id: 'ppm-to-ppb', fromUnit: 'ppm', toUnit: 'ppb', factor: 1000, formula: 'ppb = ppm × 1000' },
    { id: 'percent-to-ppm', fromUnit: 'percent', toUnit: 'ppm', factor: 10000, formula: 'ppm = percent × 10000' },

    // Temperature
    { id: 'f-to-c', fromUnit: 'fahrenheit', toUnit: 'celsius', factor: null, formula: '°C = (°F − 32) × 5/9' },
    { id: 'c-to-f', fromUnit: 'celsius', toUnit: 'fahrenheit', factor: null, formula: '°F = °C × 9/5 + 32' },

    // Time
    { id: 'hours-to-minutes', fromUnit: 'hours', toUnit: 'minutes', factor: 60, formula: 'min = hr × 60' },
    { id: 'days-to-hours', fromUnit: 'days', toUnit: 'hours', factor: 24, formula: 'hr = days × 24' },

    // Dosage calculation constant
    { id: 'grams-per-ppm-per-gal', fromUnit: 'grams', toUnit: 'ppm-gallons',
      factor: 37.854,
      formula: 'grams_needed = ppm_change × volume_gallons × 3.785411784 / 1000',
      notes: '37.854 g of pure substance per 1 ppm change per 10,000 gallons of water' },

    // Water density
    { id: 'water-density-lbs-per-gal', fromUnit: 'gallons', toUnit: 'pounds',
      factor: 8.34,
      formula: 'lbs = gallons × 8.34 (at 77°F/25°C)',
      notes: 'Approximate. Density varies slightly with temperature.' },
  ],
};

const temperatureGuidelines = {
  datasetId: 'temperature-guidelines',
  version: '2026.07',
  lastReviewed: '2026-07-01',
  description: 'Recommended water temperature ranges for all pool and spa types, plus effects of temperature on pool chemistry.',
  maintainer: 'WaterBalanceTools',
  sourcePriority: ['government-guidance', 'industry-standards', 'manufacturer-documentation'],
  records: [
    { id: 'residential-pool-temp', poolType: 'residential-pool', unit: '°F',
      comfortable: { min: 78, max: 84 }, competitive: { min: 77, max: 82 }, therapeutic: { min: 86, max: 92 },
      notes: 'Most swimmers prefer 78–82°F. Higher temperatures increase chlorine demand.' },

    { id: 'hot-tub-temp', poolType: 'hot-tub', unit: '°F',
      maximum: 104, recommended: { min: 100, max: 104 }, children: { max: 95 },
      notes: 'Maximum 104°F per CPSC/PHTA safety standards. Hyperthermia risk above 104°F. Children and pregnant women: lower temperatures.' },

    { id: 'commercial-pool-temp', poolType: 'commercial-pool', unit: '°F',
      competitive: { min: 77, max: 82 }, recreational: { min: 80, max: 84 }, therapy: { min: 88, max: 96 },
      notes: 'Competition pools: 77–79°F per FINA guidelines. Public recreational pools: 82–84°F typical.' },

    { id: 'swim-spa-temp', poolType: 'swim-spa', unit: '°F',
      swim: { min: 78, max: 84 }, relax: { min: 100, max: 104 },
      notes: 'Dual-purpose swim spas may have separate temperature zones.' },

    { id: 'chemistry-effects', id: 'temp-chemistry-effects', poolType: 'all',
      effects: [
        { effect: 'chlorine-demand', description: 'Chlorine demand approximately doubles for every 10°C (18°F) temperature increase.' },
        { effect: 'lsi-scaling', description: 'Higher temperatures increase LSI, shifting toward scale-forming. Monitor calcium and alkalinity in heated pools.' },
        { effect: 'algae-growth', description: 'Algae growth rate increases significantly above 85°F (29°C).' },
        { effect: 'co2-offgassing', description: 'CO2 off-gasses more rapidly at higher temperatures, causing pH to rise.' },
        { effect: 'chlorine-degradation', description: 'Without CYA, UV + heat degrade chlorine faster in warm, sunny conditions.' },
        { effect: 'salt-cell-output', description: 'Salt cell output decreases significantly below 60°F (15°C). Below 50°F, most cells shut off automatically.' },
      ] },
  ],
};

const testingFrequency = {
  datasetId: 'testing-frequency',
  version: '2026.07',
  lastReviewed: '2026-07-01',
  description: 'Recommended testing intervals for pool and spa water chemistry parameters by pool type and usage scenario.',
  maintainer: 'WaterBalanceTools',
  sourcePriority: ['industry-standards', 'government-guidance'],
  records: [
    { id: 'residential-pool-standard', scenarioId: 'residential-pool-standard', poolType: 'residential-pool',
      parameters: [
        { parameter: 'free-chlorine', frequency: 'twice-weekly', notes: 'Test before adding chlorine. Test in morning before peak UV hours.' },
        { parameter: 'ph', frequency: 'twice-weekly', notes: 'Test whenever FC is tested.' },
        { parameter: 'combined-chlorine', frequency: 'weekly', notes: 'If CC > 0.5 ppm, shock immediately.' },
        { parameter: 'total-alkalinity', frequency: 'monthly', notes: 'More frequent if pH is unstable.' },
        { parameter: 'calcium-hardness', frequency: 'monthly', notes: 'More frequent for new plaster pools (first year).' },
        { parameter: 'cyanuric-acid', frequency: 'monthly', notes: 'Test after heavy rain. More frequent if using trichlor tablets.' },
        { parameter: 'salt', frequency: 'monthly', notes: 'Salt pools only. Check after heavy rain or partial draining.' },
        { parameter: 'temperature', frequency: 'as-needed', notes: 'Check before swimming season and in heat waves.' },
      ] },

    { id: 'hot-tub-standard', scenarioId: 'hot-tub-standard', poolType: 'hot-tub',
      parameters: [
        { parameter: 'free-chlorine', frequency: 'before-each-use', notes: 'Minimum. Daily if used daily.' },
        { parameter: 'bromine', frequency: 'before-each-use', notes: 'If bromine system. Same frequency as chlorine.' },
        { parameter: 'ph', frequency: 'before-each-use', notes: 'Hot tubs have rapid pH change due to aeration.' },
        { parameter: 'combined-chlorine', frequency: 'weekly', notes: '' },
        { parameter: 'total-alkalinity', frequency: 'weekly', notes: '' },
        { parameter: 'calcium-hardness', frequency: 'monthly', notes: '' },
        { parameter: 'tds', frequency: 'monthly', notes: 'High TDS (>1,500 ppm above baseline) triggers water change.' },
        { parameter: 'temperature', frequency: 'before-each-use', notes: 'Safety requirement. Maximum 104°F.' },
      ] },

    { id: 'commercial-pool-standard', scenarioId: 'commercial-pool-standard', poolType: 'commercial-pool',
      parameters: [
        { parameter: 'free-chlorine', frequency: 'every-2-hours', notes: 'Required by most health codes during operating hours.' },
        { parameter: 'ph', frequency: 'every-2-hours', notes: 'Required during operating hours.' },
        { parameter: 'orp', frequency: 'continuous-monitoring', notes: 'Automated ORP monitoring required in many jurisdictions.' },
        { parameter: 'combined-chlorine', frequency: 'daily', notes: '' },
        { parameter: 'total-alkalinity', frequency: 'weekly', notes: '' },
        { parameter: 'calcium-hardness', frequency: 'weekly', notes: '' },
        { parameter: 'cyanuric-acid', frequency: 'monthly', notes: '' },
        { parameter: 'temperature', frequency: 'every-2-hours', notes: '' },
      ] },

    { id: 'after-heavy-use', scenarioId: 'after-heavy-use', poolType: 'all',
      trigger: 'After pool party, rental, or heavy bather load',
      parameters: [
        { parameter: 'free-chlorine', frequency: 'immediately-after', notes: 'FC may drop significantly after heavy bather load.' },
        { parameter: 'ph', frequency: 'immediately-after', notes: '' },
        { parameter: 'combined-chlorine', frequency: 'immediately-after', notes: 'Shock if CC > 0.5 ppm.' },
      ] },

    { id: 'after-storm', scenarioId: 'after-storm', poolType: 'all',
      trigger: 'After rain, storm, or flooding',
      parameters: [
        { parameter: 'free-chlorine', frequency: 'immediately-after', notes: 'Rain dilutes chlorine and introduces contaminants.' },
        { parameter: 'ph', frequency: 'immediately-after', notes: 'Rain (naturally acidic pH ~5.6) lowers pool pH.' },
        { parameter: 'cyanuric-acid', frequency: 'after-major-rain', notes: 'Heavy rainfall dilutes CYA.' },
        { parameter: 'total-alkalinity', frequency: 'after-major-rain', notes: '' },
      ] },

    { id: 'vacation-rental-turnover', scenarioId: 'vacation-rental-turnover', poolType: 'residential-pool',
      trigger: 'Between each guest stay',
      parameters: [
        { parameter: 'free-chlorine', frequency: 'at-each-turnover', notes: 'Document result.' },
        { parameter: 'ph', frequency: 'at-each-turnover', notes: 'Document result.' },
        { parameter: 'combined-chlorine', frequency: 'at-each-turnover', notes: 'Shock if elevated.' },
        { parameter: 'total-alkalinity', frequency: 'weekly', notes: '' },
        { parameter: 'calcium-hardness', frequency: 'monthly', notes: '' },
        { parameter: 'cyanuric-acid', frequency: 'monthly', notes: '' },
      ] },
  ],
};

const confidenceLevels = {
  datasetId: 'confidence-levels',
  version: '2026.07',
  lastReviewed: '2026-07-01',
  description: 'Reusable confidence level definitions used by calculators, reference pages, datasets, and methodology documentation.',
  maintainer: 'WaterBalanceTools',
  sourcePriority: ['editorial-interpretation'],
  records: [
    { id: 'high', label: 'High Confidence', description: 'Value derived from peer-reviewed scientific literature or consensus industry standards (PHTA, ANSI, WHO).',
      color: 'green', badge: 'high-confidence', applicableWhen: 'Strong scientific consensus. Widely adopted by industry.' },
    { id: 'medium', label: 'Medium Confidence', description: 'Value based on widely accepted industry practice or manufacturer documentation with broad adoption.',
      color: 'yellow', badge: 'medium-confidence', applicableWhen: 'Industry consensus but limited peer-reviewed support, or values vary by source.' },
    { id: 'low', label: 'Low Confidence', description: 'Value derived from limited sources, editorial judgment, or emerging guidance not yet widely adopted.',
      color: 'orange', badge: 'low-confidence', applicableWhen: 'Sparse or conflicting sources. Editorial interpretation required.' },
    { id: 'estimated', label: 'Estimated', description: 'Value calculated or interpolated from related data. Not directly measured or specified.',
      color: 'gray', badge: 'estimated', applicableWhen: 'No direct measurement available. Derived from first principles or related data.' },
    { id: 'manufacturer-specified', label: 'Manufacturer Specified', description: 'Value from manufacturer documentation. May vary by product. Consult your specific product label.',
      color: 'blue', badge: 'manufacturer-specified', applicableWhen: 'Product-specific values (e.g., salt cell salt range, chlorinator dose rate).' },
  ],
};

const version = {
  datasetId: 'version',
  version: '2026.07',
  description: 'Version tracking for the canonical data layer. Updated automatically by generate-datasets.js on each build.',
  schemaVersion: '1.0',
  datasets: {
    'chemical-ranges': '2026.07',
    'hot-tub-ranges': '2026.07',
    'water-balance': '2026.07',
    'dosage-matrices': '2026.07',
    'chemical-properties': '2026.07',
    'compatibility': '2026.07',
    'units': '2026.07',
    'conversion-factors': '2026.07',
    'temperature-guidelines': '2026.07',
    'testing-frequency': '2026.07',
    'pool-types': '2026.07',
    'water-problems': '2026.07',
    'maintenance-schedules': '2026.07',
    'confidence-levels': '2026.07',
  },
  entityVersion: '2026.07',
  knowledgeGraphVersion: '2026.07',
  generatorVersion: '5A.75',
  websiteVersion: '5A.75',
  lastBuilt: new Date().toISOString().split('T')[0],
};

module.exports = { units, conversionFactors, temperatureGuidelines, testingFrequency, confidenceLevels, version };
