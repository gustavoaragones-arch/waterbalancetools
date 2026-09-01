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
    // Phase 7W: 'combined-chlorine' removed -- the product-selector
    // implementation still does not collect or use a combined-chlorine
    // reading (breakpoint dosing remains explicitly out of scope, per
    // reports/phase-7u/SHOCK-ARCHITECTURE-DECISION.md Option E, rejected).
    entityDependencies: ['free-chlorine', 'shock-treatment'],
    // Corrected Phase 7F.3 -- no confirmed primary source for a general
    // residential shock-FC target; see
    // reports/phase-7e-1/SHOCK-CLAIM-FAMILY-DECISION.md. Phase 7W:
    // implements the Option B product-selector architecture approved in
    // reports/phase-7u/SHOCK-ARCHITECTURE-DECISION.md -- the generic,
    // unsupported divisor is no longer the live calculation basis for the
    // 6 selectable products; see reports/phase-7w/SHOCK-IMPLEMENTATION.md.
    confidenceLevel: 'limited',
    version: '2026.09',
    lastReviewed: '2026-08-29',
    notes: 'Dose is now product-specific: select a shock product (liquid chlorine, calcium hypochlorite, sodium dichlor, or trichlor) and the calculator applies the approved mass-balance formula (0.013344 x ppm x gallons / available-chlorine%) using that product\'s dataset-verified available-chlorine percentage, plus that product\'s safety notes (mixing hazards, CYA/calcium contribution). This calculator still does not read the user\'s actual combined-chlorine reading and does not compute a breakpoint-chlorination (10x CC) dose -- the preset ppm values (5/10/15/20) are flat target-FC-increase amounts, not breakpoint targets. The "I don\'t know my product" option gives qualitative guidance only, with no numeric dose.',
  },
  {
    id: 'pool-ph-calculator',
    name: 'Pool pH Calculator',
    urlPath: '/calculators/pool-ph-calculator',
    // Phase 7V: implements the Option A architecture approved in
    // reports/phase-7u/PH-ARCHITECTURE-DECISION.md. Previously listed
    // 'dosage-matrices' as a dependency and named specific products
    // (muriatic-acid, soda-ash) despite never actually reading that
    // dataset or asking the user to identify a product -- both corrected
    // to reflect what this calculator actually does.
    formulaIds: ['formula-ph-adjustment'],
    datasetDependencies: ['chemical-ranges'],
    entityDependencies: ['ph'],
    confidenceLevel: 'moderate',
    version: '2026.07',
    lastReviewed: '2026-08-29',
    notes: 'Provides pH direction and a qualitative adjustment-size (small/moderate/substantial) based on how far current pH is from target -- it does NOT calculate a chemical dose. A precise dose depends on total alkalinity, cyanuric acid, and product concentration, none of which this tool collects (see reports/phase-7t/PH-AUDIT.md and reports/phase-7u/PH-ARCHITECTURE-DECISION.md). Use the recommended product\'s label instructions, add incrementally, and retest 30-60 minutes after each addition before adding more.',
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
    // Phase 7V: the pH portion no longer computes a dose -- it now returns
    // the same qualitative direction/magnitude guidance as
    // pool-ph-calculator/hot-tub-ph-calculator (js/calculator.js's
    // evaluatePHGuidance). Notes corrected accordingly.
    // Phase 7W: the "Granular" chlorine-type options were converted from
    // a single generic (unsupported-divisor) choice into 3 specific
    // products (calcium hypochlorite 65%/73%, sodium dichlor 56%), using
    // the same approved mass-balance formula as formula-03 -- see
    // reports/phase-7w/SHOCK-IMPLEMENTATION.md. formula-shock-dose added.
    formulaIds: ['formula-chlorine-dose', 'formula-shock-dose', 'formula-ph-adjustment'],
    datasetDependencies: ['chemical-ranges', 'dosage-matrices', 'conversion-factors'],
    entityDependencies: ['free-chlorine', 'ph'],
    confidenceLevel: 'limited',
    version: '2026.09',
    lastReviewed: '2026-08-29',
    notes: 'Computes a chlorine dose (numeric) and pH direction/adjustment-size guidance (qualitative, not a dose) -- see pool-ph-calculator\'s trust panel for why pH does not get a numeric dose. The free-chlorine and pH target ranges are CDC-supported. "Liquid" and "Chlorine tablets" use the Phase 7S-approved product-specific constants; the 3 "Granular" options (calcium hypochlorite 65%/73%, sodium dichlor 56%) use the same approved mass-balance formula as the shock calculators (Phase 7W), each with its own dataset-verified available-chlorine percentage. This calculator reads total alkalinity as optional context only -- it does NOT compute an alkalinity dose, a calcium-hardness dose, or the Langelier Saturation Index (LSI), despite earlier trust-panel text claiming otherwise; Phase 7S corrected this. See /formulas/lsi-formula for the LSI formula and its lookup tables, which currently require manual calculation.',
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
    // Phase 7V: same Option A architecture and correction as
    // pool-ph-calculator (see that entry's comment).
    formulaIds: ['formula-ph-adjustment'],
    datasetDependencies: ['chemical-ranges'],
    entityDependencies: ['ph', 'hot-tub'],
    confidenceLevel: 'moderate',
    version: '2026.07',
    lastReviewed: '2026-08-29',
    notes: 'Provides pH direction and a qualitative adjustment-size (small/moderate/substantial) based on how far current pH is from target -- it does NOT calculate a chemical dose. A precise dose depends on total alkalinity, cyanuric acid, and product concentration, none of which this tool collects (see reports/phase-7t/PH-AUDIT.md and reports/phase-7u/PH-ARCHITECTURE-DECISION.md). Use the recommended product\'s label instructions, add incrementally, and retest 30-60 minutes after each addition before adding more.',
  },
  {
    id: 'hot-tub-shock-calculator',
    name: 'Hot Tub Shock Calculator',
    urlPath: '/calculators/hot-tub-shock-calculator',
    formulaIds: ['formula-shock-dose'],
    datasetDependencies: ['chemical-ranges', 'dosage-matrices'],
    // Phase 7W: 'combined-chlorine' removed, same reason as
    // pool-shock-calculator (see that entry's comment).
    entityDependencies: ['free-chlorine', 'hot-tub', 'shock-treatment'],
    // Corrected Phase 7F.3 -- see trust-formulas.js formula-shock-dose.
    // Phase 7W: implements the Option B product-selector architecture
    // (4 products supported for hot tubs, per dataset-dosage-matrices.js's
    // own supportedPoolTypes -- dichlor/trichlor are outdoor/residential-
    // pool only in that dataset) -- see
    // reports/phase-7w/SHOCK-IMPLEMENTATION.md.
    confidenceLevel: 'limited',
    version: '2026.09',
    lastReviewed: '2026-08-29',
    notes: 'Dose is now product-specific: select a shock product (liquid chlorine or calcium hypochlorite -- the 4 products this site\'s dataset lists as hot-tub-appropriate) and the calculator applies the approved mass-balance formula using that product\'s dataset-verified available-chlorine percentage, plus safety notes. Does not read combined chlorine and does not compute a breakpoint-chlorination dose. The "I don\'t know my product" option gives qualitative guidance only, with no numeric dose.',
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
