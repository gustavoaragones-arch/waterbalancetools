'use strict';
// chemical-ranges.js
// Canonical recommended chemical ranges for all supported pool types.
// Ranges: target (optimal), warning (action recommended), critical (pool closed/immediate action).
// All units in ppm except temperature (°F) and ORP (mV).

module.exports = {
  datasetId: 'chemical-ranges',
  version: '2026.07',
  lastReviewed: '2026-07-01',
  description: 'Canonical recommended chemical ranges for residential pools, saltwater pools, hot tubs, commercial pools, indoor pools, and outdoor pools. One record per parameter per pool type.',
  maintainer: 'WaterBalanceTools',
  sourcePriority: ['industry-standards', 'government-guidance', 'manufacturer-documentation', 'scientific-literature', 'editorial-interpretation'],
  records: [
    // ── Residential Pool ──────────────────────────────────────────────────────
    { id: 'residential-pool-free-chlorine', poolType: 'residential-pool', parameter: 'free-chlorine', unit: 'ppm',
      target: { min: 1, max: 3, ideal: 2 },
      warning: { low: 0.5, high: 5 },
      critical: { low: 0, high: 10 },
      notes: 'Minimum effective level depends on CYA. At CYA 50 ppm, minimum FC is 4 ppm per TFPC guidelines.' },

    { id: 'residential-pool-combined-chlorine', poolType: 'residential-pool', parameter: 'combined-chlorine', unit: 'ppm',
      target: { min: 0, max: 0, ideal: 0 },
      warning: { low: null, high: 0.5 },
      critical: { low: null, high: 1 },
      notes: 'Any detectable CC above 0.5 ppm requires breakpoint chlorination (shock at 10x CC level).' },

    { id: 'residential-pool-ph', poolType: 'residential-pool', parameter: 'ph', unit: 'pH',
      target: { min: 7.2, max: 7.6, ideal: 7.4 },
      warning: { low: 7.0, high: 7.8 },
      critical: { low: 6.8, high: 8.2 },
      notes: 'At pH 7.2, 67% of FC is active HOCl. At pH 7.6, 50% is active. At pH 8.0, only 22% is active.' },

    { id: 'residential-pool-total-alkalinity', poolType: 'residential-pool', parameter: 'total-alkalinity', unit: 'ppm',
      target: { min: 80, max: 120, ideal: 100 },
      warning: { low: 60, high: 180 },
      critical: { low: 40, high: 240 },
      notes: 'Adjust TA before pH. TA acts as a pH buffer. Low TA causes pH bounce. High TA makes pH hard to lower.' },

    { id: 'residential-pool-calcium-hardness', poolType: 'residential-pool', parameter: 'calcium-hardness', unit: 'ppm',
      target: { min: 200, max: 400, ideal: 300 },
      warning: { low: 150, high: 500 },
      critical: { low: 100, high: 800 },
      notes: 'Target depends on surface type. Plaster pools: 200–400 ppm. Vinyl/fiberglass: 150–250 ppm. Only reduced by dilution.' },

    { id: 'residential-pool-cyanuric-acid', poolType: 'residential-pool', parameter: 'cyanuric-acid', unit: 'ppm',
      target: { min: 30, max: 50, ideal: 40 },
      warning: { low: 0, high: 80 },
      critical: { low: null, high: 100 },
      notes: 'Above 80 ppm, increase FC target proportionally. Above 100 ppm, partial drain required. Only reduced by water dilution.' },

    { id: 'residential-pool-salt', poolType: 'residential-pool', parameter: 'salt', unit: 'ppm',
      target: { min: null, max: null, ideal: null },
      warning: { low: null, high: null },
      critical: { low: null, high: null },
      notes: 'Not applicable for non-salt pools. See saltwater-pool records.' },

    { id: 'residential-pool-temperature', poolType: 'residential-pool', parameter: 'temperature', unit: '°F',
      target: { min: 78, max: 84, ideal: 80 },
      warning: { low: 60, high: 90 },
      critical: { low: null, high: 95 },
      notes: 'Higher temperatures increase chlorine demand, scale tendency, and algae growth risk.' },

    { id: 'residential-pool-orp', poolType: 'residential-pool', parameter: 'orp', unit: 'mV',
      target: { min: 650, max: 750, ideal: 700 },
      warning: { low: 600, high: 800 },
      critical: { low: 400, high: null },
      notes: 'ORP directly measures sanitizing capacity. Below 650 mV, pathogen kill time increases significantly.' },

    // ── Saltwater Pool ────────────────────────────────────────────────────────
    { id: 'saltwater-pool-free-chlorine', poolType: 'saltwater-pool', parameter: 'free-chlorine', unit: 'ppm',
      target: { min: 1, max: 3, ideal: 2 },
      warning: { low: 0.5, high: 5 },
      critical: { low: 0, high: 10 },
      notes: 'Same as residential pool. Salt chlorinator output may need adjustment seasonally.' },

    { id: 'saltwater-pool-ph', poolType: 'saltwater-pool', parameter: 'ph', unit: 'pH',
      target: { min: 7.2, max: 7.6, ideal: 7.4 },
      warning: { low: 7.0, high: 7.8 },
      critical: { low: 6.8, high: 8.2 },
      notes: 'Salt pools tend to drift high pH due to electrolysis byproducts. Monitor frequently.' },

    { id: 'saltwater-pool-total-alkalinity', poolType: 'saltwater-pool', parameter: 'total-alkalinity', unit: 'ppm',
      target: { min: 80, max: 120, ideal: 100 },
      warning: { low: 60, high: 180 },
      critical: { low: 40, high: 240 },
      notes: 'Same as residential pool.' },

    { id: 'saltwater-pool-calcium-hardness', poolType: 'saltwater-pool', parameter: 'calcium-hardness', unit: 'ppm',
      target: { min: 200, max: 400, ideal: 300 },
      warning: { low: 150, high: 500 },
      critical: { low: 100, high: 800 },
      notes: 'Critical to maintain for salt cell longevity. Low calcium accelerates cell plate scaling.' },

    { id: 'saltwater-pool-cyanuric-acid', poolType: 'saltwater-pool', parameter: 'cyanuric-acid', unit: 'ppm',
      target: { min: 60, max: 80, ideal: 70 },
      warning: { low: 40, high: 100 },
      critical: { low: 0, high: 120 },
      notes: 'Higher CYA required for salt pools to protect chlorine generated by cell. Do not exceed 80 ppm if possible.' },

    { id: 'saltwater-pool-salt', poolType: 'saltwater-pool', parameter: 'salt', unit: 'ppm',
      target: { min: 2700, max: 3400, ideal: 3200 },
      warning: { low: 2500, high: 3600 },
      critical: { low: 2000, high: 4000 },
      notes: 'Optimal range is system-dependent. Consult manufacturer specification. Salt level below minimum disables the cell.' },

    { id: 'saltwater-pool-temperature', poolType: 'saltwater-pool', parameter: 'temperature', unit: '°F',
      target: { min: 78, max: 84, ideal: 80 },
      warning: { low: 60, high: 90 },
      critical: { low: null, high: 95 },
      notes: 'Salt cell output decreases significantly below 60°F. Manual chlorination may be needed in cold weather.' },

    // ── Hot Tub / Spa ────────────────────────────────────────────────────────
    { id: 'hot-tub-free-chlorine', poolType: 'hot-tub', parameter: 'free-chlorine', unit: 'ppm',
      target: { min: 3, max: 5, ideal: 4 },
      warning: { low: 1, high: 8 },
      critical: { low: 0, high: 10 },
      notes: 'Higher target than pools due to temperature-accelerated chlorine demand and high bather load relative to volume.' },

    { id: 'hot-tub-bromine', poolType: 'hot-tub', parameter: 'bromine', unit: 'ppm',
      target: { min: 3, max: 6, ideal: 4 },
      warning: { low: 1, high: 8 },
      critical: { low: 0, high: 10 },
      notes: 'Bromine alternative to chlorine. More stable at high temperatures. Bromamines remain sanitizing (unlike chloramines).' },

    { id: 'hot-tub-combined-chlorine', poolType: 'hot-tub', parameter: 'combined-chlorine', unit: 'ppm',
      target: { min: 0, max: 0, ideal: 0 },
      warning: { low: null, high: 0.5 },
      critical: { low: null, high: 1 },
      notes: 'Same as pool. High CC causes skin and respiratory irritation, amplified in enclosed hot tub environments.' },

    { id: 'hot-tub-ph', poolType: 'hot-tub', parameter: 'ph', unit: 'pH',
      target: { min: 7.2, max: 7.6, ideal: 7.4 },
      warning: { low: 7.0, high: 7.8 },
      critical: { low: 6.8, high: 8.0 },
      notes: 'pH tends to rise faster in hot tubs due to CO2 off-gassing at high temperatures.' },

    { id: 'hot-tub-total-alkalinity', poolType: 'hot-tub', parameter: 'total-alkalinity', unit: 'ppm',
      target: { min: 80, max: 120, ideal: 100 },
      warning: { low: 60, high: 150 },
      critical: { low: 40, high: 200 },
      notes: 'Same range as pool. Critical as a pH buffer.' },

    { id: 'hot-tub-calcium-hardness', poolType: 'hot-tub', parameter: 'calcium-hardness', unit: 'ppm',
      target: { min: 150, max: 250, ideal: 200 },
      warning: { low: 100, high: 350 },
      critical: { low: 75, high: 500 },
      notes: 'Lower target than plaster pools. Hot tub surfaces are typically acrylic or composite. High CH at high temp accelerates scaling.' },

    { id: 'hot-tub-cyanuric-acid', poolType: 'hot-tub', parameter: 'cyanuric-acid', unit: 'ppm',
      target: { min: 0, max: 0, ideal: 0 },
      warning: { low: null, high: 10 },
      critical: { low: null, high: 30 },
      notes: 'CYA should NOT be used in hot tubs. Hot tubs are typically covered and not exposed to UV light.' },

    { id: 'hot-tub-temperature', poolType: 'hot-tub', parameter: 'temperature', unit: '°F',
      target: { min: 100, max: 104, ideal: 102 },
      warning: { low: 95, high: 104 },
      critical: { low: null, high: 104 },
      notes: 'CPSC and PHTA set maximum at 104°F for safety. Temperatures above 104°F risk hyperthermia. Children: max 95°F.' },

    // ── Commercial Pool ──────────────────────────────────────────────────────
    { id: 'commercial-pool-free-chlorine', poolType: 'commercial-pool', parameter: 'free-chlorine', unit: 'ppm',
      target: { min: 1, max: 3, ideal: 2 },
      warning: { low: 0.5, high: 5 },
      critical: { low: 0, high: 10 },
      notes: 'Many jurisdictions require minimum 1 ppm FC by law. ORP must also be maintained above 650 mV.' },

    { id: 'commercial-pool-ph', poolType: 'commercial-pool', parameter: 'ph', unit: 'pH',
      target: { min: 7.2, max: 7.6, ideal: 7.4 },
      warning: { low: 7.0, high: 7.8 },
      critical: { low: 6.8, high: 8.0 },
      notes: 'Many health codes require pH between 7.2 and 7.8 for public pools.' },

    { id: 'commercial-pool-total-alkalinity', poolType: 'commercial-pool', parameter: 'total-alkalinity', unit: 'ppm',
      target: { min: 80, max: 120, ideal: 100 },
      warning: { low: 60, high: 180 },
      critical: { low: 40, high: 240 },
      notes: 'Same as residential.' },

    { id: 'commercial-pool-calcium-hardness', poolType: 'commercial-pool', parameter: 'calcium-hardness', unit: 'ppm',
      target: { min: 200, max: 400, ideal: 300 },
      warning: { low: 150, high: 500 },
      critical: { low: 100, high: 800 },
      notes: 'Same as residential.' },

    { id: 'commercial-pool-cyanuric-acid', poolType: 'commercial-pool', parameter: 'cyanuric-acid', unit: 'ppm',
      target: { min: 0, max: 40, ideal: 30 },
      warning: { low: null, high: 60 },
      critical: { low: null, high: 90 },
      notes: 'Many health codes prohibit CYA above 40 ppm in commercial pools or prohibit CYA entirely.' },

    { id: 'commercial-pool-orp', poolType: 'commercial-pool', parameter: 'orp', unit: 'mV',
      target: { min: 650, max: 800, ideal: 700 },
      warning: { low: 600, high: 850 },
      critical: { low: 500, high: null },
      notes: 'WHO recommends minimum 650 mV for public pools. Required in many commercial facility health codes.' },

    // ── Indoor Pool ──────────────────────────────────────────────────────────
    { id: 'indoor-pool-free-chlorine', poolType: 'indoor-pool', parameter: 'free-chlorine', unit: 'ppm',
      target: { min: 1, max: 3, ideal: 2 },
      warning: { low: 0.5, high: 5 },
      critical: { low: 0, high: 10 },
      notes: 'Same as residential pool. No UV degradation indoors so lower FC maintenance dose needed.' },

    { id: 'indoor-pool-cyanuric-acid', poolType: 'indoor-pool', parameter: 'cyanuric-acid', unit: 'ppm',
      target: { min: 0, max: 0, ideal: 0 },
      warning: { low: null, high: 10 },
      critical: { low: null, high: 30 },
      notes: 'CYA should NOT be used in indoor pools. No UV exposure so no need for UV protection, and CYA reduces chlorine efficiency.' },

    { id: 'indoor-pool-ph', poolType: 'indoor-pool', parameter: 'ph', unit: 'pH',
      target: { min: 7.2, max: 7.6, ideal: 7.4 },
      warning: { low: 7.0, high: 7.8 },
      critical: { low: 6.8, high: 8.0 },
      notes: 'pH tends to rise in indoor pools due to CO2 off-gassing into enclosed air space. Ventilation management is critical.' },

    // ── Outdoor Pool ─────────────────────────────────────────────────────────
    { id: 'outdoor-pool-free-chlorine', poolType: 'outdoor-pool', parameter: 'free-chlorine', unit: 'ppm',
      target: { min: 1, max: 3, ideal: 2 },
      warning: { low: 0.5, high: 5 },
      critical: { low: 0, high: 10 },
      notes: 'Outdoor pools require CYA to prevent UV degradation of chlorine.' },

    { id: 'outdoor-pool-cyanuric-acid', poolType: 'outdoor-pool', parameter: 'cyanuric-acid', unit: 'ppm',
      target: { min: 30, max: 50, ideal: 40 },
      warning: { low: 10, high: 80 },
      critical: { low: 0, high: 100 },
      notes: 'CYA is essential for outdoor pools. Without CYA, chlorine degrades within 30–60 minutes of direct sunlight.' },

    { id: 'outdoor-pool-temperature', poolType: 'outdoor-pool', parameter: 'temperature', unit: '°F',
      target: { min: 78, max: 84, ideal: 80 },
      warning: { low: 60, high: 90 },
      critical: { low: null, high: 95 },
      notes: 'Temperature above 85°F increases chlorine demand significantly and promotes algae growth.' },
  ],
};
