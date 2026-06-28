#!/usr/bin/env node
/**
 * populate-data.js
 *
 * One-time (or repeatable) script that assembles structured content from the
 * per-category JS modules in scripts/data/ and writes the four canonical JSON
 * source-of-truth files:
 *
 *   data/academy.json
 *   data/formulas.json
 *   data/glossary.json
 *   data/reference.json
 *
 * Run:  node scripts/populate-data.js
 *
 * The JSON files this script produces are the permanent source of truth.
 * All future content edits must occur in the JSON files — not here.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');

// ── Academy ───────────────────────────────────────────────────────────────────

const academyCategories = [
  { slug: 'fundamentals',     label: 'Fundamentals',       description: 'Core water chemistry concepts every pool owner needs to understand.', icon: 'book' },
  { slug: 'sanitizers',       label: 'Sanitizers',         description: 'Chlorine, bromine, salt, and alternative sanitization methods.', icon: 'flask' },
  { slug: 'testing',          label: 'Testing',            description: 'How to test pool water accurately and interpret results.', icon: 'chart' },
  { slug: 'water-balance',    label: 'Water Balance',      description: 'Balancing pH, alkalinity, hardness, and stabilizer for clear water.', icon: 'pool' },
  { slug: 'troubleshooting',  label: 'Troubleshooting',    description: 'Diagnosing and fixing cloudy water, algae, staining, and more.', icon: 'warning' },
  { slug: 'hot-tubs',         label: 'Hot Tubs & Spas',    description: 'Hot tub chemistry, maintenance schedules, and water care.', icon: 'hottub' },
  { slug: 'equipment',        label: 'Equipment',          description: 'Pumps, filters, heaters, automation, and maintenance tips.', icon: 'shield' },
  { slug: 'vacation-rentals', label: 'Vacation Rentals',   description: 'Pool and hot tub management for Airbnb and short-term rentals.', icon: 'checklist' },
];

const academyArticles = [
  ...require('./data/academy-fundamentals'),
  ...require('./data/academy-sanitizers'),
  ...require('./data/academy-testing'),
  ...require('./data/academy-water-balance'),
  ...require('./data/academy-troubleshooting'),
  ...require('./data/academy-hot-tubs'),
  ...require('./data/academy-equipment'),
  ...require('./data/academy-vacation-rentals'),
];

const academyData = {
  _comment: 'Academy article definitions. Edit this file to update content. Do NOT edit generated HTML files.',
  categories: academyCategories,
  articles: academyArticles,
};

// ── Formulas ──────────────────────────────────────────────────────────────────

const formulasData = {
  _comment: 'Formula library. Edit this file to update formulas. Do NOT edit generated HTML files.',
  formulas: require('./data/formulas-data'),
};

const _formulasDataLegacy = {
  formulas: [
    {
      id: 'form-01-UNUSED',
      slug: 'formulas/pool-volume-formula',
      title: 'Pool Volume Formula',
      description: 'Calculate the gallons in a rectangular, circular, oval, or L-shaped pool using length, width, depth, and a shape factor.',
      summary: 'Pool volume is the foundation of every chemical dose calculation. This formula explains how to calculate gallons for different pool shapes.',
      readingTime: '4 min read',
      lastReviewed: '2026-06-01',
      keywords: ['pool volume formula', 'how to calculate pool volume', 'gallons in pool', 'pool size calculator'],
      equation: 'V = L × W × D × 7.48  (rectangular)\nV = π × r² × D × 7.48  (circular)\nV = L × W × D × 7.48 × 0.89  (oval)',
      variables: [
        { symbol: 'V', description: 'Volume', unit: 'gallons' },
        { symbol: 'L', description: 'Length', unit: 'feet' },
        { symbol: 'W', description: 'Width', unit: 'feet' },
        { symbol: 'D', description: 'Average depth', unit: 'feet' },
        { symbol: 'r', description: 'Radius (diameter / 2)', unit: 'feet' },
        { symbol: '7.48', description: 'Gallons per cubic foot', unit: 'constant' },
        { symbol: '0.89', description: 'Oval shape correction factor', unit: 'constant' },
      ],
      workedExample: 'Rectangular pool: 30 ft long, 15 ft wide, average depth 4.5 ft.\nV = 30 × 15 × 4.5 × 7.48 = 15,147 gallons.\n\nCircular pool: 20 ft diameter (r = 10 ft), average depth 4 ft.\nV = π × 10² × 4 × 7.48 = 3.14159 × 100 × 4 × 7.48 = 9,399 gallons.',
      explanation: 'The conversion factor 7.48 converts cubic feet to US gallons (there are 7.48052 gallons per cubic foot). For pools with variable depth (a shallow end and a deep end), use the average depth: (shallow end depth + deep end depth) / 2. For pools with a gradual slope, this average is accurate. For pools with a distinct break between shallow and deep sections, calculate each section separately and add the volumes.',
      limitations: 'This formula assumes a uniform average depth. Irregularly shaped pools (L-shaped, free-form, beach entry) require dividing the pool into regular sections, calculating each section\'s volume, and summing them. An error of even 10% in the volume estimate causes the same percentage error in every chemical dose calculated for that pool.',
      relatedCalculators: ['/calculators/pool-volume-calculator', '/calculators/volume-calculator', '/calculators/spa-volume-calculator'],
      relatedGlossary: ['glossary/pump-turnover', 'glossary/pool-volume'],
      relatedFormulas: ['formulas/turnover-formula'],
      sources: ['Pool & Hot Tub Alliance — Pool & Spa Operator Handbook, 2022'],
    },
    {
      id: 'form-02',
      slug: 'formulas/liquid-chlorine-formula',
      title: 'Liquid Chlorine Dosing Formula',
      description: 'Calculate the ounces or fluid ounces of liquid chlorine (sodium hypochlorite) needed to raise free chlorine by a target amount in any pool size.',
      summary: 'This formula calculates how much liquid chlorine to add based on pool volume, target FC increase, and the concentration of the product.',
      readingTime: '4 min read',
      lastReviewed: '2026-06-01',
      keywords: ['liquid chlorine dose formula', 'sodium hypochlorite pool', 'how much liquid chlorine', 'pool chlorine calculation'],
      equation: 'Dose (fl oz) = (V × T) / (C × 75,460)\n\nDose (oz weight) = (V × T) / (C × 640)',
      variables: [
        { symbol: 'V', description: 'Pool volume', unit: 'gallons' },
        { symbol: 'T', description: 'Target FC increase', unit: 'ppm' },
        { symbol: 'C', description: 'Product concentration (decimal — e.g., 10% = 0.10)', unit: 'fraction' },
        { symbol: '75,460', description: 'Conversion constant (gallons × ppm → fl oz for 100% chlorine)', unit: 'constant' },
        { symbol: '640', description: 'Conversion constant for weight dose (oz)', unit: 'constant' },
      ],
      workedExample: 'Pool: 15,000 gallons. Current FC: 1.0 ppm. Target FC: 3.0 ppm. Target increase: 2.0 ppm. Product: 10% sodium hypochlorite.\n\nDose (fl oz) = (15,000 × 2.0) / (0.10 × 75,460) = 30,000 / 7,546 = 3.98 fl oz per gallon factor → approximately 40 fl oz (about 1.25 quarts).\n\nPractical check: most pool chlorination references quote approximately 10 fl oz of 10% liquid chlorine raises 10,000 gallons by 1 ppm. For 15,000 gallons and 2 ppm increase: 10 × 1.5 × 2 = 30 fl oz. These approximations align closely.',
      explanation: 'Liquid chlorine (sodium hypochlorite) is sold at various concentrations. Pool-grade liquid chlorine is typically 10–12.5%. Commercial-grade (used by pool professionals) is up to 15%. Household bleach is typically 5–8.25%. Always use the actual concentration on the label when calculating doses. Liquid chlorine degrades over time — a bottle stored for 60 days at room temperature may be 15–20% weaker than fresh product.',
      limitations: 'This formula assumes the chlorine product concentration is accurate and current. Degraded product produces lower FC increases than calculated. The formula also assumes the water is at normal pool temperature — very cold water slows chlorine dispersion but does not affect the final concentration once fully mixed. pH adjustment is not calculated here — always bring pH into the 7.2–7.6 range before adding chlorine.',
      relatedCalculators: ['/calculators/pool-chlorine-calculator', '/calculators/hot-tub-chlorine-calculator'],
      relatedGlossary: ['glossary/free-chlorine', 'glossary/sodium-hypochlorite', 'glossary/parts-per-million'],
      relatedFormulas: ['formulas/shock-formula'],
      sources: ['Taylor Technologies — Pool/Spa Water Chemistry Reference', 'Pool & Hot Tub Alliance — Pool & Spa Operator Handbook, 2022'],
    },
    {
      id: 'form-03',
      slug: 'formulas/shock-formula',
      title: 'Pool Shock Dosing Formula',
      description: 'Calculate the pounds of calcium hypochlorite or other granular shock needed to reach a target free chlorine level for breakpoint chlorination.',
      summary: 'The shock dose formula calculates how many pounds of shock product to add based on pool volume, target FC level, and product concentration.',
      readingTime: '4 min read',
      lastReviewed: '2026-06-01',
      keywords: ['pool shock formula', 'how much shock pool', 'calcium hypochlorite dose', 'breakpoint chlorination calculation'],
      equation: 'Dose (lbs) = (V × T) / (C × 1,000,000) × 8.34\n\nSimplified: Dose (lbs) ≈ (V × T) / (C% × 10,000)',
      variables: [
        { symbol: 'V', description: 'Pool volume', unit: 'gallons' },
        { symbol: 'T', description: 'Target FC increase', unit: 'ppm' },
        { symbol: 'C', description: 'Product available chlorine (decimal — e.g., 65% = 0.65)', unit: 'fraction' },
        { symbol: '8.34', description: 'Weight of one gallon of water in pounds', unit: 'lb/gal' },
        { symbol: '1,000,000', description: 'ppm conversion (1 ppm = 1 part per million)', unit: 'constant' },
      ],
      workedExample: 'Pool: 20,000 gallons. Target FC increase: 8 ppm (for breakpoint chlorination). Product: 65% calcium hypochlorite.\n\nDose = (20,000 × 8) / (0.65 × 10,000) = 160,000 / 6,500 = 24.6 lbs.\n\nNote: most 65% cal-hypo shock is sold in 1-lb bags, so this would be approximately 24–25 bags. Always pre-dissolve granular shock in a bucket of pool water and broadcast around the perimeter — never add directly to the skimmer or concentrated in one spot.',
      explanation: 'Calcium hypochlorite (cal-hypo) is the most common granular pool shock. It is available at 65% and 73% available chlorine. The 73% product requires slightly less product for the same FC increase. Cal-hypo does not add CYA to the water, making it ideal for breakpoint chlorination and regular shocking. It does add calcium — relevant in areas with already-high calcium hardness.',
      limitations: 'This formula calculates the dose for the full target FC increase from current to target level. For breakpoint chlorination, the target increase is 10 times the current combined chlorine level. Do not use this formula with stabilised shock products (dichlor, trichlor) for large shock doses — stabilised products add significant CYA with each pound and are not intended for breakpoint treatment.',
      relatedCalculators: ['/calculators/pool-shock-calculator', '/calculators/hot-tub-shock-calculator'],
      relatedGlossary: ['glossary/shock', 'glossary/calcium-hypochlorite', 'glossary/breakpoint-chlorination', 'glossary/superchlorination'],
      relatedFormulas: ['formulas/liquid-chlorine-formula'],
      sources: ['Taylor Technologies — Pool/Spa Water Chemistry Reference', 'Pool & Hot Tub Alliance — Pool & Spa Operator Handbook, 2022'],
    },
    {
      id: 'form-04',
      slug: 'formulas/ph-adjustment-formula',
      title: 'pH Adjustment Formula',
      description: 'Calculate the amount of pH increaser (soda ash) or pH reducer (muriatic acid) needed to adjust pool pH to the target range.',
      summary: 'pH adjustment requires knowing pool volume, the current and target pH, and the product type. This formula provides approximate doses that should be verified with retesting.',
      readingTime: '4 min read',
      lastReviewed: '2026-06-01',
      keywords: ['pool pH adjustment formula', 'how much acid pool', 'soda ash dose pool', 'muriatic acid pool dose'],
      equation: 'For sodium carbonate (raise pH):\nDose (oz) ≈ V × ΔpH × 1.8 / 10,000\n\nFor muriatic acid 31.45% (lower pH):\nDose (fl oz) ≈ V × ΔpH × 2.0 / 10,000',
      variables: [
        { symbol: 'V', description: 'Pool volume', unit: 'gallons' },
        { symbol: 'ΔpH', description: 'Required pH change (absolute value)', unit: 'pH units' },
        { symbol: '1.8', description: 'Empirical dose factor for soda ash', unit: 'oz per 10,000 gal per pH unit' },
        { symbol: '2.0', description: 'Empirical dose factor for muriatic acid (31.45%)', unit: 'fl oz per 10,000 gal per pH unit' },
      ],
      workedExample: 'Pool: 15,000 gallons. Current pH: 8.1. Target pH: 7.4. ΔpH = 0.7.\n\nUsing muriatic acid: Dose = 15,000 × 0.7 × 2.0 / 10,000 = 2.1 fl oz per 10,000 gal × 1.5 = 3.15 fl oz ≈ 3 fl oz.\n\nNote: these are approximate values. Total alkalinity significantly affects how much pH moves for a given acid dose. High alkalinity resists pH change. Always start with less than the calculated dose and retest.',
      explanation: 'pH adjustment doses are highly dependent on total alkalinity. Water with high alkalinity (above 120 ppm) resists pH change and requires more product than the formula suggests. Water with low alkalinity (below 60 ppm) changes pH dramatically with small additions. Always adjust alkalinity to 80–120 ppm before attempting to adjust pH — this makes pH adjustments more predictable and longer-lasting. Add acid to a large bucket of water (not water to acid) for safe dilution before adding to the pool.',
      limitations: 'This formula provides an approximation. The actual dose required depends on current total alkalinity, pool surface material (plaster, vinyl, fibreglass each have slightly different buffering capacities), temperature, and current TDS. Make incremental additions, test after each, and adjust as needed. Never add the entire calculated dose if the required change is more than 0.5 pH units — overshoot is common with large corrections.',
      relatedCalculators: ['/calculators/pool-ph-calculator', '/calculators/hot-tub-ph-calculator'],
      relatedGlossary: ['glossary/ph', 'glossary/muriatic-acid', 'glossary/sodium-carbonate', 'glossary/total-alkalinity'],
      relatedFormulas: ['formulas/alkalinity-formula'],
      sources: ['Taylor Technologies — Pool/Spa Water Chemistry Reference'],
    },
    {
      id: 'form-05',
      slug: 'formulas/alkalinity-formula',
      title: 'Alkalinity Adjustment Formula',
      description: 'Calculate the pounds of sodium bicarbonate needed to raise total alkalinity in a pool, or the amount of acid needed to lower it.',
      summary: 'Total alkalinity adjustment is the first step in water balancing. This formula calculates the correct dose of sodium bicarbonate or acid to reach the 80–120 ppm target range.',
      readingTime: '4 min read',
      lastReviewed: '2026-06-01',
      keywords: ['pool alkalinity formula', 'sodium bicarbonate dose pool', 'raise pool alkalinity', 'alkalinity calculation'],
      equation: 'To raise TA with sodium bicarbonate:\nDose (lbs) = V × ΔTA / 7,500\n\nTo lower TA with muriatic acid 31.45%:\nDose (fl oz) = V × ΔTA / 3,500',
      variables: [
        { symbol: 'V', description: 'Pool volume', unit: 'gallons' },
        { symbol: 'ΔTA', description: 'Required TA increase (for bicarb) or decrease (for acid)', unit: 'ppm' },
        { symbol: '7,500', description: 'Pounds of bicarb per gallon per ppm (reciprocal = ppm per lb per 10,000 gal)', unit: 'constant' },
        { symbol: '3,500', description: 'Volume factor for muriatic acid (31.45%) to reduce TA', unit: 'constant' },
      ],
      workedExample: 'Pool: 15,000 gallons. Current TA: 55 ppm. Target TA: 90 ppm. ΔTA = 35 ppm.\n\nDose (lbs) = 15,000 × 35 / 7,500 = 525,000 / 7,500 = 70 lbs → Wait — re-check: rule of thumb is 1.5 lbs per 10,000 gallons raises TA by 10 ppm.\nFor 15,000 gallons and 35 ppm increase: 1.5 × 1.5 × 3.5 = 7.9 lbs of sodium bicarbonate. Add in two doses of 4 lbs each, testing between additions.',
      explanation: 'Sodium bicarbonate (baking soda) raises total alkalinity with a minimal effect on pH. It is the safest and most practical product for raising TA in pools. One pound of sodium bicarbonate raises TA by approximately 6.7 ppm per 10,000 gallons. To lower TA, muriatic acid is added slowly with the pump running. Note that lowering TA also lowers pH — aeration after acid addition helps pH recover to a desirable level while allowing TA to settle at the lower value.',
      limitations: 'The relationship between bicarbonate addition and TA increase is reasonably linear but varies with current water chemistry. Very high alkalinity (above 200 ppm) may require multiple partial additions over several days. After adding sodium bicarbonate, wait at least 4–6 hours before retesting to allow full dissolution. Note that sodium carbonate (soda ash) raises both pH and alkalinity — use it if you need to raise both. Sodium bicarbonate primarily raises TA with a modest pH increase.',
      relatedCalculators: ['/calculators/pool-alkalinity-calculator', '/calculators/chemical-calculator'],
      relatedGlossary: ['glossary/total-alkalinity', 'glossary/sodium-bicarbonate', 'glossary/ph'],
      relatedFormulas: ['formulas/ph-adjustment-formula'],
      sources: ['Taylor Technologies — Pool/Spa Water Chemistry Reference', 'Pool & Hot Tub Alliance — Pool & Spa Operator Handbook, 2022'],
    },
    {
      id: 'form-06',
      slug: 'formulas/salt-formula',
      title: 'Salt Level Formula',
      description: 'Calculate the pounds of pool salt needed to raise the salt level in a saltwater pool to the target range for a salt chlorinator.',
      summary: 'Salt chlorinators require 2,700–3,400 ppm dissolved sodium chloride. This formula calculates the exact amount of salt to add for any pool volume and starting salt level.',
      readingTime: '3 min read',
      lastReviewed: '2026-06-01',
      keywords: ['salt pool formula', 'how much salt for pool', 'saltwater pool calculation', 'pool salt dose'],
      equation: 'Dose (lbs) = V × ΔS / 120,000\n\nWhere: 1 lb of salt raises 10,000 gallons by approximately 12 ppm',
      variables: [
        { symbol: 'V', description: 'Pool volume', unit: 'gallons' },
        { symbol: 'ΔS', description: 'Required salt increase (target minus current)', unit: 'ppm' },
        { symbol: '120,000', description: 'Constant: ppm per pound per gallon scaling factor', unit: 'constant' },
      ],
      workedExample: 'Pool: 18,000 gallons. Current salt: 2,200 ppm. Target: 3,200 ppm. ΔS = 1,000 ppm.\n\nDose = 18,000 × 1,000 / 120,000 = 18,000,000 / 120,000 = 150 lbs of pool salt.\n\nPoolgrade sodium chloride is sold in 40-lb bags, so approximately four bags are needed. Spread evenly across the pool surface with the pump running, allow 24 hours for full dissolution, then retest.',
      explanation: 'Pool salt (sodium chloride) for salt chlorinators must be pure pool-grade or food-grade sodium chloride. Avoid salt with additives like anti-caking agents, iodide, or ferrocyanide (yellow prussiate of soda) — these can stain the pool and damage the salt cell. Salt dissolves slowly in cold water — run the pump for 24 hours after adding and test the salt level before relying on the cell reading, which may still show the old level until the salt fully disperses.',
      limitations: 'This formula provides an approximation. Actual salt requirements vary slightly based on water temperature, TDS, and how recently the salt was added. Salt does not evaporate from pool water — the only way salt level decreases is through water replacement (rain overflow, splash-out, backwashing). In areas with significant rainfall, salt may need to be added several times per season. Test salt level monthly, not just at opening.',
      relatedCalculators: ['/calculators/saltwater-pool-salt-calculator'],
      relatedGlossary: ['glossary/salt-chlorination', 'glossary/total-dissolved-solids'],
      relatedFormulas: ['formulas/pool-volume-formula'],
      sources: ['Pool & Hot Tub Alliance — Pool & Spa Operator Handbook, 2022'],
    },
    {
      id: 'form-07',
      slug: 'formulas/cya-formula',
      title: 'Cyanuric Acid (CYA) Formula',
      description: 'Calculate the amount of cyanuric acid (stabilizer) needed to raise CYA to the target range, and understand how much CYA each trichlor tablet adds.',
      summary: 'Cyanuric acid must be raised carefully — overshoot cannot be corrected without a partial drain. This formula helps calculate exact doses and predict CYA accumulation from stabilised tablets.',
      readingTime: '4 min read',
      lastReviewed: '2026-06-01',
      keywords: ['CYA formula pool', 'cyanuric acid dose', 'pool stabilizer calculation', 'trichlor CYA buildup'],
      equation: 'To raise CYA with stabilizer granules:\nDose (oz) = V × ΔCYA / 7,700\n\nCYA added per lb of trichlor:\nΔCYA (ppm) = 580 / V × 10,000  (where V is in 10,000s of gallons)',
      variables: [
        { symbol: 'V', description: 'Pool volume', unit: 'gallons' },
        { symbol: 'ΔCYA', description: 'Required CYA increase', unit: 'ppm' },
        { symbol: '7,700', description: 'Dose constant for cyanuric acid granules', unit: 'constant' },
        { symbol: '580', description: 'CYA content per lb of trichlor (approximately 58% by weight)', unit: 'g per lb' },
      ],
      workedExample: 'Pool: 15,000 gallons. Current CYA: 10 ppm (new fill). Target CYA: 40 ppm. ΔCYA = 30 ppm.\n\nDose = 15,000 × 30 / 7,700 = 450,000 / 7,700 ≈ 58 oz of cyanuric acid granules. Add pre-dissolved in a bucket, distribute around pool, run filter 24 hours before retesting.\n\nFor trichlor accumulation: each 1-lb tablet in a 15,000-gallon pool adds approximately 0.6 × (10,000/15,000) × 6 = roughly 4–5 ppm CYA per pound of trichlor dissolved.',
      explanation: 'Cyanuric acid (CYA) stabiliser is sold as a slow-dissolving granular product. It dissolves slowly even in warm water — allow 24–48 hours for full dissolution before testing. Add it by placing it in a skimmer sock and hanging in the skimmer basket, or pre-dissolving in a bucket of warm water. CYA is added at the start of the season and typically does not need supplemental addition unless a large partial drain is done. However, trichlor tablets and dichlor shock add CYA with every dose — this is the most common source of CYA accumulation.',
      limitations: 'CYA cannot be reduced without dilution. Once CYA exceeds 80–100 ppm, the only remedy is to drain a portion of the pool and refill. Do not add CYA to a hot tub or indoor pool where UV protection is not needed — it serves no purpose and only reduces chlorine effectiveness. Always add stabiliser before the season begins, not mid-season when you cannot easily reduce it if you overshoot.',
      relatedCalculators: ['/calculators/pool-cyanuric-acid-calculator'],
      relatedGlossary: ['glossary/cyanuric-acid', 'glossary/trichlor', 'glossary/chlorine-stabilizer'],
      relatedFormulas: ['formulas/liquid-chlorine-formula'],
      sources: ['Taylor Technologies — Pool/Spa Water Chemistry Reference'],
    },
    {
      id: 'form-08',
      slug: 'formulas/turnover-formula',
      title: 'Pool Turnover Rate Formula',
      description: 'Calculate how long it takes your pool pump to filter the entire pool volume once, and how many turnovers per day your current setup achieves.',
      summary: 'The turnover rate tells you how effectively your pump and filter are processing pool water. One complete turnover per 8 hours is the minimum recommendation.',
      readingTime: '3 min read',
      lastReviewed: '2026-06-01',
      keywords: ['pool turnover rate formula', 'pump turnover calculation', 'GPM pool calculator', 'pool circulation calculation'],
      equation: 'Turnover time (min) = Pool volume (gal) / Flow rate (GPM)\n\nTurnovers per day = (Flow rate (GPM) × 60 × Run hours) / Pool volume',
      variables: [
        { symbol: 'Pool volume', description: 'Total pool capacity', unit: 'gallons' },
        { symbol: 'Flow rate', description: 'Pump output at system head pressure', unit: 'GPM (gallons per minute)' },
        { symbol: 'Run hours', description: 'Hours per day the pump operates', unit: 'hours' },
        { symbol: '60', description: 'Minutes per hour', unit: 'constant' },
      ],
      workedExample: 'Pool: 20,000 gallons. Pump flow: 50 GPM. Pump run time: 10 hours per day.\n\nTurnover time = 20,000 / 50 = 400 minutes = 6.67 hours.\n\nTurnovers per day = (50 × 60 × 10) / 20,000 = 30,000 / 20,000 = 1.5 turnovers per day.\n\nAt 1.5 turnovers, this pool meets the minimum standard. For summer peak season, extending the run to 12 hours would achieve 1.8 turnovers — a meaningful improvement in water quality.',
      explanation: 'Turnover rate is the single most important factor in maintaining clear, healthy pool water. Every turnover filters out suspended particles and circulates sanitiser throughout the pool. The industry standard minimum is one turnover per 8 hours (3 turnovers per day). Public pools are typically required to achieve 6–8 hours or less per turnover by regulation. Residential pools should target 1–2 turnovers per day for adequate water quality. Note that pump performance charts show flow rate vs. head pressure — use the flow rate at the actual system head pressure, not the maximum pump rating.',
      limitations: 'The flow rate used in this formula must be measured at the actual system head pressure, not at zero head (which is the maximum rating on pump packaging). A pump rated at 60 GPM maximum may only deliver 40 GPM in a real pool plumbing system with significant resistance. If you do not know your system head pressure, use a conservative estimate of 60–70% of the pump\'s maximum rated flow.',
      relatedCalculators: ['/calculators/pool-turnover-rate-calculator', '/calculators/pool-volume-calculator'],
      relatedGlossary: ['glossary/pump-turnover', 'glossary/gpm', 'glossary/pool-pump'],
      relatedFormulas: ['formulas/pool-volume-formula'],
      sources: ['Pool & Hot Tub Alliance — Pool & Spa Operator Handbook, 2022'],
    },
    {
      id: 'form-09',
      slug: 'formulas/lsi-formula',
      title: 'Langelier Saturation Index Formula',
      description: 'Calculate the Langelier Saturation Index (LSI) for pool water to determine whether it is balanced, corrosive, or scaling.',
      summary: 'The LSI combines five water chemistry variables into a single balance score. A score between -0.3 and +0.3 indicates balanced water.',
      readingTime: '5 min read',
      lastReviewed: '2026-06-01',
      keywords: ['LSI formula', 'Langelier Saturation Index calculation', 'pool water balance formula', 'LSI pool water'],
      equation: 'LSI = pH + TF + CF + AF - 12.1\n\nWhere:\n  TF = Temperature Factor (from lookup table)\n  CF = Calcium Factor (from lookup table)\n  AF = Alkalinity Factor (from lookup table)\n  12.1 = Saturation constant for CaCO3 at pool conditions',
      variables: [
        { symbol: 'pH', description: 'Measured pH of pool water', unit: 'pH units' },
        { symbol: 'TF', description: 'Temperature Factor from PHTA lookup table', unit: 'dimensionless' },
        { symbol: 'CF', description: 'Calcium Hardness Factor from lookup table', unit: 'dimensionless' },
        { symbol: 'AF', description: 'Total Alkalinity Factor from lookup table', unit: 'dimensionless' },
        { symbol: '12.1', description: 'pCaCO3 saturation constant', unit: 'constant' },
      ],
      workedExample: 'Pool data: pH 7.4, temperature 82°F, calcium hardness 280 ppm, total alkalinity 100 ppm.\n\nLookup values (from PHTA tables):\n  TF at 82°F ≈ 0.62\n  CF at 280 ppm ≈ 1.92\n  AF at 100 ppm ≈ 2.00\n\nLSI = 7.4 + 0.62 + 1.92 + 2.00 - 12.1 = 11.94 - 12.1 = -0.16\n\nLSI = -0.16 — slightly negative but well within the acceptable range of -0.3 to +0.3. Water is balanced.',
      explanation: 'The Langelier Saturation Index was developed by Dr. Wilfred Langelier in 1936 to predict whether municipal water systems would corrode or scale their pipes. It was later adopted by the pool and spa industry. The index is based on the concept that water seeks equilibrium with calcium carbonate — negative values indicate under-saturation (corrosive tendency), positive values indicate over-saturation (scaling tendency). Temperature is included because calcium carbonate solubility decreases with rising temperature, meaning warmer water has a higher scaling tendency for the same chemistry.',
      limitations: 'The LSI was originally developed for large water distribution systems and is an approximation for pool conditions. It does not account for cyanuric acid, which also affects saturation. The PHTA and Orenda Technologies have developed modified versions of the LSI (called the LSI or LSIP) that include a CYA correction factor. For pools with CYA above 30 ppm, a CYA-adjusted LSI provides a more accurate picture. The basic LSI is still widely used and provides a useful directional indicator even without the CYA correction.',
      relatedCalculators: ['/calculators/chemical-calculator'],
      relatedGlossary: ['glossary/langelier-saturation-index', 'glossary/calcium-hardness', 'glossary/total-alkalinity', 'glossary/ph'],
      relatedFormulas: ['formulas/alkalinity-formula', 'formulas/ph-adjustment-formula'],
      sources: ['Langelier, W.F. — The Analytical Control of Anti-Corrosion Water Treatment, AWWA, 1936', 'Taylor Technologies — Pool/Spa Water Chemistry Reference'],
    },
  ],
}; // end _formulasDataLegacy (unused)

// ── Glossary ──────────────────────────────────────────────────────────────────

const glossaryData = {
  _comment: 'Glossary terms. Edit this file to update definitions. Do NOT edit generated HTML files.',
  terms: require('./data/glossary-terms'),
};

// ── Reference ──────────────────────────────────────────────────────────────────

const referenceData = {
  _comment: 'Reference page definitions. Edit this file to update content. Do NOT edit generated HTML files.',
  pages: require('./data/reference-pages'),
};

// ── Write files ───────────────────────────────────────────────────────────────

function writeData(filename, data) {
  const outPath = path.join(DATA, filename);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  const count = Array.isArray(data.articles) ? data.articles.length
    : Array.isArray(data.formulas) ? data.formulas.length
    : Array.isArray(data.terms) ? data.terms.length
    : Array.isArray(data.pages) ? data.pages.length : '?';
  console.log(`  ✓ data/${filename}  (${count} items)`);
}

writeData('academy.json',   academyData);
writeData('formulas.json',  formulasData);
writeData('glossary.json',  glossaryData);
writeData('reference.json', referenceData);

console.log('\nAll data files populated. Run: node scripts/run-all-generators.js');
