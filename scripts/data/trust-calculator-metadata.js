'use strict';
// trust-calculator-metadata.js
// Per-calculator trust configuration.
// Maps calculator ID → formula IDs, dataset dependencies, confidence level.

module.exports = [
  {
    id: 'pool-chlorine-calculator',
    name: 'Pool Chlorine Calculator',
    urlPath: '/calculators/pool-chlorine-calculator',
    formulaIds: ['formula-chlorine-dose'],
    datasetDependencies: ['chemical-ranges', 'dosage-matrices', 'conversion-factors'],
    entityDependencies: ['free-chlorine', 'liquid-chlorine', 'calcium-hypochlorite'],
    // Corrected Phase 7F.3 -- see scripts/data/trust-formulas.js
    // formula-chlorine-dose for the underlying finding.
    confidenceLevel: 'limited',
    version: '2026.07',
    lastReviewed: '2026-08-18',
    notes: 'Target range (1-3 ppm / 2-4 ppm with CYA) is CDC-supported. Dosage coefficient from dosage-matrices.json is not independently verified against a manufacturer/regulatory reference.',
  },
  {
    id: 'pool-shock-calculator',
    name: 'Pool Shock Calculator',
    urlPath: '/calculators/pool-shock-calculator',
    formulaIds: ['formula-shock-dose'],
    datasetDependencies: ['chemical-ranges', 'dosage-matrices'],
    entityDependencies: ['free-chlorine', 'combined-chlorine', 'shock-treatment'],
    // Corrected Phase 7F.3 -- no confirmed primary source for a general
    // residential shock-FC target; see
    // reports/phase-7e-1/SHOCK-CLAIM-FAMILY-DECISION.md.
    confidenceLevel: 'limited',
    version: '2026.07',
    lastReviewed: '2026-08-18',
    notes: 'Breakpoint chlorination target (10x combined chlorine) is an industry rule of thumb, not independently confirmed by a primary source. This calculator also does not read the user\'s actual combined-chlorine reading.',
  },
  {
    id: 'pool-ph-calculator',
    name: 'Pool pH Calculator',
    urlPath: '/calculators/pool-ph-calculator',
    formulaIds: ['formula-ph-adjustment'],
    datasetDependencies: ['chemical-ranges', 'dosage-matrices'],
    entityDependencies: ['ph', 'muriatic-acid', 'soda-ash'],
    confidenceLevel: 'moderate',
    version: '2026.07',
    lastReviewed: '2026-07-01',
    notes: 'Linear pH adjustment approximation. Most accurate within ±0.5 pH units of target.',
  },
  {
    id: 'pool-alkalinity-calculator',
    name: 'Pool Alkalinity Calculator',
    urlPath: '/calculators/pool-alkalinity-calculator',
    formulaIds: ['formula-alkalinity-adjustment'],
    datasetDependencies: ['chemical-ranges', 'dosage-matrices'],
    entityDependencies: ['alkalinity', 'baking-soda', 'muriatic-acid'],
    // Corrected Phase 7F.3 -- see trust-formulas.js formula-alkalinity-adjustment.
    confidenceLevel: 'limited',
    version: '2026.07',
    lastReviewed: '2026-08-18',
    notes: 'Target range (80-120 ppm) is independently supported (PHTA fact sheet). Baking soda coefficient (24 oz per 10 ppm per 10,000 gal) is not independently verified.',
  },
  {
    id: 'pool-cyanuric-acid-calculator',
    name: 'Pool CYA Calculator',
    urlPath: '/calculators/pool-cyanuric-acid-calculator',
    formulaIds: ['formula-cya-adjustment'],
    datasetDependencies: ['chemical-ranges', 'dosage-matrices'],
    entityDependencies: ['cyanuric-acid', 'stabilizer'],
    // Corrected Phase 7F.3 -- see trust-formulas.js formula-cya-adjustment.
    confidenceLevel: 'limited',
    version: '2026.07',
    lastReviewed: '2026-08-18',
    notes: 'Neither the 30-50 ppm target range nor the dosing coefficient has a confirmed primary source (see chemistry-claims.js claim-cya-routine-outdoor). CYA dissolves slowly -- allow 24-48 hours for equilibration before retesting.',
  },
  {
    id: 'saltwater-pool-salt-calculator',
    name: 'Saltwater Pool Salt Calculator',
    urlPath: '/calculators/saltwater-pool-salt-calculator',
    formulaIds: ['formula-salt-adjustment'],
    datasetDependencies: ['chemical-ranges', 'dosage-matrices'],
    entityDependencies: ['salt', 'salt-chlorinator', 'pool-salt'],
    // Corrected Phase 7F.3 -- see trust-formulas.js formula-salt-adjustment.
    confidenceLevel: 'limited',
    version: '2026.07',
    lastReviewed: '2026-08-18',
    notes: 'Salt targets are equipment/manufacturer-specific; no manufacturer-independent primary source was confirmed for the target range or dosing coefficient. Verify against your system\'s manufacturer spec.',
  },
  {
    id: 'pool-volume-calculator',
    name: 'Pool Volume Calculator',
    urlPath: '/calculators/pool-volume-calculator',
    formulaIds: ['formula-pool-volume-rectangular', 'formula-pool-volume-oval'],
    datasetDependencies: ['conversion-factors'],
    entityDependencies: ['gallons'],
    confidenceLevel: 'very-high',
    version: '2026.07',
    lastReviewed: '2026-07-01',
    notes: 'Volume formulas use exact ft³-to-gallon conversion factor (7.48051948) from conversion-factors.json.',
  },
  {
    id: 'pool-turnover-rate-calculator',
    name: 'Pool Turnover Rate Calculator',
    urlPath: '/calculators/pool-turnover-rate-calculator',
    formulaIds: ['formula-turnover-rate'],
    datasetDependencies: ['units', 'conversion-factors'],
    entityDependencies: ['pump', 'turnover-time'],
    confidenceLevel: 'very-high',
    version: '2026.07',
    lastReviewed: '2026-07-01',
  },
  {
    id: 'chemical-calculator',
    name: 'All-in-One Chemical Calculator',
    urlPath: '/calculators/chemical-calculator',
    // Phase 7S: corrected to match what this page's actual JS
    // (js/calculator.js, invoked from this page's inline <script>) computes
    // and displays -- verified by reading the full submit handler. It
    // computes and outputs ONLY a chlorine dose and a pH dose. It reads
    // total alkalinity as an optional informational input but never uses it
    // in a calculation or output; it does not compute or display an
    // alkalinity dose, a calcium-hardness dose, or an LSI value at all.
    // Previously listed 'formula-alkalinity-adjustment',
    // 'formula-calcium-hardness-dose', and 'formula-lsi' -- all three were
    // false capability claims. See reports/phase-7s/LSI-AUDIT.md.
    formulaIds: ['formula-chlorine-dose', 'formula-ph-adjustment'],
    datasetDependencies: ['chemical-ranges', 'dosage-matrices', 'conversion-factors'],
    entityDependencies: ['free-chlorine', 'ph'],
    confidenceLevel: 'limited',
    version: '2026.07',
    lastReviewed: '2026-08-28',
    notes: 'Computes a chlorine dose and a pH dose only. The free-chlorine and pH target ranges are CDC-supported; the chlorine dosing coefficient is not independently verified (pH uses a linear approximation, already self-disclosed as a simplification). This calculator reads total alkalinity as optional context only -- it does NOT compute an alkalinity dose, a calcium-hardness dose, or the Langelier Saturation Index (LSI), despite earlier trust-panel text claiming otherwise; Phase 7S corrected this. See /formulas/lsi-formula for the LSI formula and its lookup tables, which currently require manual calculation.',
  },
  {
    id: 'hot-tub-chlorine-calculator',
    name: 'Hot Tub Chlorine Calculator',
    urlPath: '/calculators/hot-tub-chlorine-calculator',
    formulaIds: ['formula-chlorine-dose'],
    datasetDependencies: ['chemical-ranges', 'dosage-matrices'],
    entityDependencies: ['free-chlorine', 'bromine', 'hot-tub'],
    // Corrected Phase 7F.3 -- see trust-formulas.js formula-chlorine-dose.
    confidenceLevel: 'limited',
    version: '2026.07',
    lastReviewed: '2026-08-18',
    notes: 'Target range (3-5 ppm) is CDC-supported. Dosage coefficient from dosage-matrices.json is not independently verified against a manufacturer/regulatory reference.',
  },
  {
    id: 'hot-tub-ph-calculator',
    name: 'Hot Tub pH Calculator',
    urlPath: '/calculators/hot-tub-ph-calculator',
    formulaIds: ['formula-ph-adjustment'],
    datasetDependencies: ['chemical-ranges', 'dosage-matrices'],
    entityDependencies: ['ph', 'hot-tub'],
    confidenceLevel: 'moderate',
    version: '2026.07',
    lastReviewed: '2026-07-01',
  },
  {
    id: 'hot-tub-shock-calculator',
    name: 'Hot Tub Shock Calculator',
    urlPath: '/calculators/hot-tub-shock-calculator',
    formulaIds: ['formula-shock-dose'],
    datasetDependencies: ['chemical-ranges', 'dosage-matrices'],
    entityDependencies: ['free-chlorine', 'combined-chlorine', 'hot-tub', 'shock-treatment'],
    // Corrected Phase 7F.3 -- see trust-formulas.js formula-shock-dose.
    confidenceLevel: 'limited',
    version: '2026.07',
    lastReviewed: '2026-08-18',
    notes: 'No confirmed primary source for a general shock-FC target; see reports/phase-7e-1/SHOCK-CLAIM-FAMILY-DECISION.md.',
  },
  {
    id: 'spa-volume-calculator',
    name: 'Spa Volume Calculator',
    urlPath: '/calculators/spa-volume-calculator',
    formulaIds: ['formula-pool-volume-rectangular'],
    datasetDependencies: ['conversion-factors'],
    entityDependencies: ['gallons', 'hot-tub'],
    confidenceLevel: 'very-high',
    version: '2026.07',
    lastReviewed: '2026-07-01',
  },
];
