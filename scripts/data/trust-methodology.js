'use strict';
// trust-methodology.js
// Content for all methodology pages.

module.exports = {
  dataId: 'methodology',
  version: '2026.07',
  lastReviewed: '2026-07-01',
  maintainer: 'WaterBalanceTools Editorial Team',

  index: {
    slug: 'index',
    title: 'Calculation Methodology',
    metaDescription: 'How WaterBalanceTools calculates pool chemistry recommendations. Data flow, formula selection, rounding, precision, and known limitations.',
    h1: 'Calculation Methodology',
    intro: 'Every calculator on WaterBalanceTools follows a documented methodology that defines how inputs are processed, how formulas are selected, and how results are produced. This section provides the complete technical documentation.',
    pages: [
      'calculation-methodology', 'calculation-assumptions', 'formula-selection',
      'rounding-policy', 'precision-policy', 'known-limitations', 'confidence-system',
    ],
  },

  'calculation-methodology': {
    slug: 'calculation-methodology',
    title: 'Calculation Methodology',
    metaDescription: 'How WaterBalanceTools builds pool chemistry calculators: data flow from canonical datasets through entities to calculator outputs.',
    h1: 'Calculation Methodology',
    lastReviewed: '2026-07-01',
    confidenceLevel: 'high',
    sections: [
      {
        heading: 'Overview',
        body: 'WaterBalanceTools calculators use a layered data architecture. All factual values flow from canonical datasets, through entities, into calculators. No calculator embeds hardcoded scientific values. This design ensures that corrections to a single dataset record propagate automatically to every calculator, formula, and page that depends on it.',
      },
      {
        heading: 'Data Flow Architecture',
        body: 'The data flow follows a strict hierarchy: (1) Canonical Datasets (data/datasets/) define factual values; (2) The Entity Layer (data/entities/, data/graph/) organizes these values by chemical, parameter, and pool type; (3) Generators read entities and datasets to produce HTML; (4) Calculators embed the resolved values from the canonical data layer at build time.',
        diagram: 'Dataset → Entity → Generator → HTML Calculator',
      },
      {
        heading: 'How Datasets Flow Into Entities',
        body: 'Each entity in the knowledge graph (e.g., "Free Chlorine") references a canonical dataset record for its ideal range and units via the rangeDataset and rangeRecord fields. The entity generator (generate-entities.js) resolves these references at build time using dataset-loader.js, replacing hardcoded strings with dataset values. The result is written to data/entities/chemicals.json and propagated to all entity pages.',
      },
      {
        heading: 'How Entities Flow Into Calculators',
        body: 'Calculator generators read the entity index (data/graph/entity-index.json) to populate related topics, cross-references, and the trust panel. Calculator logic constants (ideal ranges, dosage coefficients, conversion factors) are loaded from data/datasets/ via the DatasetLoader utility module (js/data/dataset-loader.js).',
      },
      {
        heading: 'How Calculations Are Generated',
        body: 'Pool chemistry calculations follow documented mathematical formulas drawn from industry-standard references. Each formula is versioned in data/trust/formulas.json. Calculator generators apply these formulas to user inputs and produce results. The formula version and dataset versions used are embedded in the trust panel of each calculator page.',
      },
      {
        heading: 'Build Pipeline Order',
        body: 'The build pipeline runs in a fixed order: (1) generate-datasets.js compiles canonical datasets; (2) generate-entities.js resolves entity values from datasets; (3) Content generators (academy, formulas, glossary, reference) consume entities; (4) generate-trust.js compiles trust metadata and generates methodology/editorial/provenance pages; (5) inject-trust-panels.js embeds trust panels in calculators and version badges site-wide; (6) validate-trust.js validates trust completeness; (7) validate-datasets.js and validate-entities.js validate data integrity.',
      },
      {
        heading: 'Maintenance',
        body: 'The calculation methodology is maintained by updating the relevant dataset source modules in scripts/data/. All methodology documentation is regenerated from data on each build. No manual editing of generated HTML is required or permitted.',
      },
    ],
  },

  'calculation-assumptions': {
    slug: 'calculation-assumptions',
    title: 'Calculation Assumptions',
    metaDescription: 'The assumptions, ideal conditions, and limitations built into WaterBalanceTools pool chemistry calculations.',
    h1: 'Calculation Assumptions',
    lastReviewed: '2026-07-01',
    confidenceLevel: 'high',
    sections: [
      {
        heading: 'Purpose',
        body: 'Pool chemistry calculators produce estimates based on the inputs provided and a set of documented assumptions. This page explains those assumptions so users can understand when results may be less accurate for their specific pool.',
      },
      {
        heading: 'Ideal Conditions Assumed',
        body: 'All calculators assume: (1) well-mixed pool water — chemicals are uniformly distributed; (2) accurate test results — input values are correctly measured with calibrated equipment; (3) standard water density — 8.34 lbs/gal at approximately 77°F/25°C; (4) pure products at stated concentration — product labels are accurate and products have not degraded.',
      },
      {
        heading: 'Expected Inputs',
        body: 'Calculators accept current measured values (e.g., current FC, pH, TA) and target values. Inputs are assumed to reflect the pool water at time of testing. Results apply to the entire pool volume. Inputs should be from a recent test — results from tests taken more than 24 hours prior may not reflect current conditions.',
      },
      {
        heading: 'Common Limitations',
        body: 'Calculator results may be less accurate when: (1) pool water is not well-circulated before testing; (2) fill water chemistry differs significantly from neutral; (3) multiple chemicals are being adjusted simultaneously; (4) pool has recently been shocked and equilibration is incomplete; (5) bather load significantly changes chemistry between test and treatment.',
      },
      {
        heading: 'Approximations',
        body: 'Dosage calculations use average product concentrations (e.g., 10% for liquid chlorine). Actual product concentration varies by brand, batch, and age. pH adjustment calculations use simplified linear models that are most accurate within ±0.5 pH units of the target. LSI calculations use lookup table interpolation rather than full thermodynamic equations.',
      },
      {
        heading: 'Why Calculators Provide Estimates',
        body: 'Pool chemistry involves continuous dynamic processes: evaporation, bather load, temperature fluctuation, UV exposure, and chemical degradation all affect water chemistry between treatments. A calculator provides the best estimate for current conditions, but real-world results depend on factors that cannot be fully captured in any calculation. Always verify results with a follow-up water test 4–8 hours after treatment.',
      },
      {
        heading: 'What to Do If Results Seem Wrong',
        body: 'If calculator results appear inconsistent with your experience: (1) verify your input values are accurate; (2) check your test kit reagents are not expired; (3) consult the Known Limitations page; (4) consider that pool-specific factors (surface type, fill water, equipment) may require adjustment. For commercial pools, always consult a licensed pool operator.',
      },
    ],
  },

  'formula-selection': {
    slug: 'formula-selection',
    title: 'Formula Selection',
    metaDescription: 'How WaterBalanceTools selects the formulas and equations used in its pool chemistry calculators.',
    h1: 'Formula Selection',
    lastReviewed: '2026-07-01',
    confidenceLevel: 'high',
    sections: [
      {
        heading: 'Purpose',
        body: 'This page explains how WaterBalanceTools selects the mathematical formulas used in its calculators and why industry-standard equations are preferred.',
      },
      {
        heading: 'Preference for Industry-Standard Equations',
        body: 'WaterBalanceTools uses the same equations used by professional pool operators and certified pool technicians. These include the Langelier Saturation Index formula as defined by PHTA/ANSI standards, chlorine dosage calculations consistent with Taylor Technologies training materials, and volume formulas consistent with geometric standards.',
      },
      {
        heading: 'Why Standard Equations Are Preferred',
        body: 'Standard equations produce results consistent with professional testing, allow users to verify results against commercial test kits and operator guidance, and have a documented history of real-world application. Novel or experimental equations are not used unless they have been formally adopted by a recognized standards body.',
      },
      {
        heading: 'How Units Are Normalized',
        body: 'All calculations are performed in US customary units (gallons, °F, oz, fl oz) by default, with metric equivalents provided where specified. Unit conversions use the canonical factors in data/datasets/conversion-factors.json. All conversion factors have a single source of truth and are never duplicated in calculator logic.',
      },
      {
        heading: 'Formula Versioning',
        body: 'Every formula used on the platform is assigned a version number and tracked in data/trust/formulas.json. When an authoritative source updates an equation, a new formula version is created. Calculators reference formula versions in their trust panels, enabling users to identify which version produced a given result.',
      },
      {
        heading: 'Formula Review',
        body: 'Formulas are reviewed when: (1) a new edition of a reference standard is published, (2) new scientific literature provides evidence that a more accurate equation is available, or (3) the annual review date is reached. Changes are logged in the revision history.',
      },
    ],
  },

  'rounding-policy': {
    slug: 'rounding-policy',
    title: 'Rounding Policy',
    metaDescription: 'How WaterBalanceTools rounds calculator results and chemical dosages.',
    h1: 'Rounding Policy',
    lastReviewed: '2026-07-01',
    confidenceLevel: 'very-high',
    sections: [
      {
        heading: 'Purpose',
        body: 'This page specifies the rounding conventions applied to all calculator results. Every calculator links to this policy to ensure users understand the precision of displayed results.',
      },
      {
        heading: 'Displayed Precision',
        body: 'Chemical concentrations (ppm): displayed to 1 decimal place. pH: displayed to 2 decimal places. LSI: displayed to 2 decimal places. Temperatures (°F, °C): displayed to 1 decimal place. Volume (gallons, liters): displayed as whole numbers. Dosage (fl oz, oz, lbs): displayed to 1 decimal place for quantities under 10, whole numbers for 10 and above.',
      },
      {
        heading: 'Internal Precision',
        body: 'All intermediate calculations are performed in full JavaScript floating-point precision (IEEE 754 double, approximately 15–17 significant digits). Rounding is applied only at the final display step, not at intermediate calculation steps. This prevents compounding rounding errors in multi-step calculations.',
      },
      {
        heading: 'Unit Conversions',
        body: 'Unit conversions use the exact factors defined in data/datasets/conversion-factors.json. For example, gallons to liters uses exactly 3.785411784 (the NIST definition). No rounded approximations are used in intermediate calculations.',
      },
      {
        heading: 'Rounding Order',
        body: '(1) Perform all calculations in full floating-point precision; (2) Apply unit conversion if required; (3) Round only the final displayed value to the specified decimal places. Intermediate values passed between calculation steps are not rounded.',
      },
      {
        heading: 'Examples',
        body: 'FC change needed: calculated as 2.00 ppm → displayed as "2.0 ppm". Muriatic acid dose: calculated as 9.876 fl oz → displayed as "9.9 fl oz". Pool volume: 24,831.4 gallons → displayed as "24,831 gallons". LSI: −0.1234 → displayed as "−0.12". Note: displayed rounding does not affect calculation accuracy — all intermediate values retain full precision.',
      },
      {
        heading: 'Relationship to Confidence',
        body: 'The precision of displayed results does not imply that accuracy is equivalent to the displayed decimal places. A result of "9.9 fl oz" is precise to 0.1 fl oz but may have an accuracy uncertainty of ±10–15% due to product concentration variation, pool volume estimation, and measurement error. See the Precision Policy for full uncertainty discussion.',
      },
    ],
  },

  'precision-policy': {
    slug: 'precision-policy',
    title: 'Precision Policy',
    metaDescription: 'Floating-point handling, measurement uncertainty, and precision limitations of WaterBalanceTools calculators.',
    h1: 'Precision Policy',
    lastReviewed: '2026-07-01',
    confidenceLevel: 'high',
    sections: [
      {
        heading: 'Purpose',
        body: 'This page describes how WaterBalanceTools handles floating-point arithmetic, measurement uncertainty, and the relationship between calculated precision and real-world accuracy.',
      },
      {
        heading: 'Floating-Point Handling',
        body: 'All calculations use standard IEEE 754 double-precision floating-point arithmetic as provided by the JavaScript runtime. This provides approximately 15–17 significant digits of precision. Known floating-point edge cases (e.g., 0.1 + 0.2 ≠ 0.3 exactly) do not affect pool chemistry calculations at the precision levels required.',
      },
      {
        heading: 'Displayed Decimals',
        body: 'See the Rounding Policy for specific decimal place rules. Displayed precision is chosen to reflect meaningful measurement resolution — for example, showing pH to 2 decimal places matches the resolution of digital pH meters and high-quality DPD test kits.',
      },
      {
        heading: 'Measurement Uncertainty',
        body: 'Pool water test results have inherent uncertainty based on the test method used. Test strips: ±0.5 ppm FC, ±0.5 pH. Liquid DPD drop test (Taylor K-2006): ±0.2 ppm FC, ±0.2 pH. Digital photometer: ±0.05 ppm FC, ±0.05 pH. Calculator inputs are only as accurate as the test used to produce them.',
      },
      {
        heading: 'Recommended Retesting After Chemical Additions',
        body: 'After adding chemicals: wait at least 30 minutes with pump running before retesting pH or alkalinity; wait 4–8 hours (or overnight) for full equilibration of pH, alkalinity, and calcium adjustments; wait 24 hours for CYA additions (CYA dissolves slowly); retest chlorine as needed based on current demand.',
      },
      {
        heading: 'Relationship to Confidence Ratings',
        body: 'Confidence ratings reflect the strength of the underlying scientific or industry evidence for a value or recommendation. They do not directly reflect the mathematical precision of the calculation. A Very High confidence rating means the formula or value is strongly supported by evidence — it does not mean the calculated result will be precise to the displayed decimal place in real-world conditions.',
      },
    ],
  },

  'known-limitations': {
    slug: 'known-limitations',
    title: 'Known Limitations',
    metaDescription: 'Documented limitations of WaterBalanceTools pool chemistry calculators.',
    h1: 'Known Limitations',
    lastReviewed: '2026-07-01',
    confidenceLevel: 'high',
    sections: [
      {
        heading: 'Purpose',
        body: 'This page documents known limitations that may affect the accuracy or applicability of WaterBalanceTools calculators. No calculator is appropriate for all situations, and users should understand these limitations before relying on results.',
      },
      {
        heading: 'Water Testing Variability',
        body: 'Test results vary based on the testing method, reagent freshness, sample temperature, and operator technique. Two tests on the same water sample may produce slightly different results. Always use fresh reagents, follow the test kit instructions precisely, and take multiple readings if results seem unexpected.',
      },
      {
        heading: 'Environmental Effects',
        body: 'Environmental conditions affect pool chemistry in ways that calculators cannot predict: heavy rain dilutes and acidifies pool water; high UV index accelerates chlorine consumption; wind increases evaporation and affects chemical dosing; heavy bather load introduces ammonia compounds and other chlorine demand; fallen leaves and debris introduce phosphates and organic matter.',
      },
      {
        heading: 'Temperature Effects',
        body: 'Water temperature affects chemical reaction rates, chlorine demand, and LSI. Calculators use the input temperature to account for some temperature effects, but rapid temperature changes between testing and treatment will reduce accuracy. Hot tub chemistry is particularly sensitive to temperature — test immediately before treatment when possible.',
      },
      {
        heading: 'Product Concentration Differences',
        body: 'Dosage calculations assume products at their labeled concentration (e.g., 10% for liquid chlorine, 65% for calcium hypochlorite). Actual concentration may vary by brand, age, and storage conditions. Liquid chlorine degrades approximately 10–15% per month at room temperature and faster in heat. Always use fresh products and check labels.',
      },
      {
        heading: 'Manufacturer Variations',
        body: 'Salt chlorinators have manufacturer-specific salt ranges and operating parameters. The dosage calculator uses typical coefficients but your system may require adjustment. Always consult your equipment manual and verify with a follow-up test.',
      },
      {
        heading: 'Pool-Specific Conditions',
        body: 'Pool surface type, equipment design, hydraulic dead zones, and previous chemical history all affect real-world results. A plaster pool with high calcium history may need different treatment than a new vinyl pool. Calculators cannot account for these pool-specific factors.',
      },
      {
        heading: 'Calculator Limitations',
        body: 'Volume calculations for irregular shapes are approximations. pH adjustment calculations are most accurate within ±0.5 pH units of the target. Shock calculations assume the water will be tested again 24 hours later. CYA calculations assume slow, complete dissolution over 24–48 hours. Multi-step corrections (adjusting multiple parameters simultaneously) may produce less accurate results than sequential single-parameter corrections.',
      },
    ],
  },

  'confidence-system': {
    slug: 'confidence-system',
    title: 'Confidence System',
    metaDescription: 'How WaterBalanceTools uses confidence levels to communicate the strength of its pool chemistry recommendations.',
    h1: 'Confidence System',
    lastReviewed: '2026-07-01',
    confidenceLevel: 'high',
    sections: [
      {
        heading: 'Purpose',
        body: 'The confidence system communicates the strength of the evidence underlying each value, recommendation, and calculation on WaterBalanceTools. Every calculator, dataset record, formula, and reference page is assigned one of five confidence levels.',
      },
      {
        heading: 'Why Confidence Levels Matter',
        body: 'Pool chemistry guidance varies in its evidentiary basis. The 104°F hot tub maximum temperature has Very High confidence because it is mandated by government safety standards. A general suggestion to check phosphate levels once per month has Informational confidence because it is based on editorial synthesis rather than a specific standard. Displaying confidence levels helps users calibrate how much weight to place on a recommendation.',
      },
      {
        heading: 'Five Levels',
        body: 'The system uses exactly five levels: Very High, High, Moderate, Limited, and Informational. These are defined in the canonical confidence dataset (data/trust/confidence.json) and applied consistently across all content types. Confidence levels are assigned during content creation and validated at build time.',
      },
      {
        heading: 'Assignment Process',
        body: 'Confidence levels are assigned based on the source tier of the underlying evidence: Government standards → Very High; Well-established industry standards → High; Common practice with limited peer review → Moderate; Sparse or manufacturer-specific sources → Limited; Editorial synthesis or background information → Informational.',
      },
      {
        heading: 'Display',
        body: 'Confidence levels are displayed as color-coded badges in trust panels, dataset documentation, and formula pages. Colors: Very High = dark green, High = green, Moderate = amber, Limited = orange-brown, Informational = steel blue.',
      },
      {
        heading: 'Limitations of the Confidence System',
        body: 'Confidence levels reflect evidence quality, not calculation accuracy. A High confidence range does not mean the calculator will produce a result accurate to the displayed decimal places. See the Precision Policy for accuracy discussion. Confidence levels are reviewed annually and updated when source quality improves or degrades.',
      },
    ],
  },
};
