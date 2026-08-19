#!/usr/bin/env node
'use strict';
/**
 * build-golden-set.js
 *
 * Generates scripts/data/chemistry-extraction-golden-set.json.
 *
 * Every `text` below is either a real sentence pulled from Phase 7A's
 * chemical-claims.csv (marked source: "real") or a realistic sentence
 * hand-written to guarantee coverage of a required test category not
 * cleanly represented by a single real sentence (marked source:
 * "synthetic"). Every `expected` array was derived by running the fixed
 * extractor and then manually reading the sentence against that output --
 * see reports/phase-7d-1/SAMPLE-EXTRACTION-AUDIT.csv for the audit trail
 * of that verification for the "real" subset.
 */
const fs = require('fs');
const path = require('path');
const { extractFromSentence } = require('./extract-claims-v2');

const CASES = [
  // ---- pH ----------------------------------------------------------------
  { category: 'ph', source: 'real', text: 'Compatibility Considerations Trichlor tablets are strongly acidic (pH approximately 2.8) and contain cyanuric acid.' },
  { category: 'ph', source: 'real', text: 'This is why pool pH tends to be higher in summer and why pools with waterfalls, fountains, or high-speed jets see faster pH rise, all of those features accelerate CO2 off-gassing.' },
  { category: 'ph', source: 'real', text: 'Then bring pH into the 7.2-7.6 range.' },
  { category: 'ph', source: 'real', text: 'Key Facts Free chlorine (1-3 ppm) is the test most directly linked to swimmer health. pH (7.2-7.6) controls how effectively chlorine kills pathogens.' },
  { category: 'ph', source: 'real', text: 'Free chlorine should be at least 3 ppm. pH should be between 7.2 and 7.8.' },
  { category: 'ph', source: 'real', text: 'If pH is above 7.8, add pH reducer before soaking.' },
  { category: 'ph_threshold', source: 'real', text: 'Above 7.8, chlorine effectiveness drops sharply, at pH 8.0, active chlorine is only about 22% of what the test shows.' },
  { category: 'ph', source: 'synthetic', text: 'pH 7.2-7.6 is the target range for most residential pools.' },
  { category: 'ph', source: 'synthetic', text: 'Bromine works over a wider pH range (7.0-8.0) than chlorine (7.2-7.6 recommended).' },

  // ---- Free chlorine / combined chlorine / total chlorine -----------------
  { category: 'fc', source: 'real', text: 'Key Facts Free chlorine should be 1-3 ppm for pools and 3-5 ppm for hot tubs.' },
  { category: 'fc', source: 'synthetic', text: 'Free chlorine should be at least 1 ppm for pools and at least 3 ppm for hot tubs.' },
  { category: 'cc', source: 'synthetic', text: 'Combined chlorine above 0.5 ppm indicates chloramines are building up and shock treatment is recommended.' },
  { category: 'tc', source: 'synthetic', text: 'Total chlorine reads 4 ppm while free chlorine reads 1 ppm, meaning combined chlorine is 3 ppm.' },
  { category: 'composite', source: 'synthetic', text: 'FC 1.0 ppm, pH 7.7, TA 90 ppm, hardness 280 ppm, CYA 45 ppm.' },

  // ---- Total alkalinity ----------------------------------------------------
  { category: 'ta', source: 'real', text: 'Balancing in Practice Start by adjusting total alkalinity to 80-120 ppm, which supports stable pH.' },
  { category: 'ta', source: 'real', text: 'Total alkalinity (80-120 ppm) buffers pH against sudden changes.' },
  { category: 'ta', source: 'real', text: 'Total alkalinity between 80 and 120 ppm stabilises pH and prevents rapid swings.' },
  { category: 'ta', source: 'real', text: 'Without adequate alkalinity (target 80-120 ppm), pH swings wildly with every chemical addition or rainstorm.' },
  { category: 'ta_no_number', source: 'real', text: 'In hot tubs, alkalinity tends to drift more than in pools due to aeration from jets, which off-gases CO2 and raises pH.' },
  { category: 'ta_threshold', source: 'real', text: 'For any adjustment to alkalinity or pH, allow 4-6 hours before retesting.' },

  // ---- Calcium hardness ------------------------------------------------------
  { category: 'ch', source: 'real', text: 'Calcium hardness (200-400 ppm for plaster pools) protects pool surfaces and equipment.' },
  { category: 'ch', source: 'real', text: 'Key Facts Target calcium hardness: 200-400 ppm for plaster and concrete pools; 150-250 ppm for vinyl and fibreglass.' },
  { category: 'ch', source: 'real', text: 'Effects of Low and High Hardness Low calcium hardness (below 150 ppm in a plaster pool) causes etching and pitting of the pool surface, visible as rough patches.' },
  { category: 'ch_composite', source: 'real', text: 'Preventing and Removing Scale Prevention: keep LSI between -0.3 and +0.3 by maintaining pH below 7.6, calcium hardness at or below 400 ppm, and alkalinity at 80-120 ppm.' },

  // ---- Cyanuric acid --------------------------------------------------------
  { category: 'cya', source: 'real', text: 'In a pool managed exclusively with a tablet feeder, CYA can reach problem levels (80-100 ppm) within one season and pH will consistently trend low without acid addition.' },
  { category: 'cya', source: 'real', text: 'Examples End-of-Season Feeder Check As the season winds down, a pool owner discovers their CYA is at 85 ppm, above the 80 ppm upper limit.' },
  { category: 'cya', source: 'real', text: 'CYA of 60-80 ppm is needed for salt pool outdoor use to protect the generated chlorine from UV.' },
  { category: 'cya', source: 'real', text: 'Cyanuric acid above 80 ppm significantly reduces chlorine effectiveness even when the reading looks correct.' },
  { category: 'cya', source: 'real', text: 'Target CYA for standard outdoor pools is 30-50 ppm.' },
  { category: 'cya', source: 'real', text: 'High cyanuric acid that is making your 3 ppm chlorine reading nearly useless is invisible.' },
  { category: 'cya_dosage', source: 'real', text: 'Every pound of trichlor added to a pool raises CYA by approximately 0.6 ppm for every 10,000 gallons.' },

  // ---- Temperature ------------------------------------------------------------
  { category: 'temp_no_number', source: 'real', text: 'Key Facts Examples Calculator Related Water temperature affects almost every aspect of pool chemistry.' },
  { category: 'temp', source: 'real', text: 'Key Facts Chlorine demand roughly doubles for every 10°F rise in water temperature above 80°F.' },
  { category: 'temp_no_number', source: 'real', text: 'Seasonal temperature changes are the most common reason for mid-summer chemistry problems.' },
  { category: 'temp_no_number', source: 'real', text: 'Temperature and pH Drift As water warms, carbon dioxide escapes from solution more readily.' },

  // ---- Salt -------------------------------------------------------------------
  { category: 'salt', source: 'real', text: 'Key Facts Target salt level for most systems: 2,700-3,400 ppm, far lower than ocean water (35,000 ppm).' },
  { category: 'salt', source: 'real', text: 'Salt reads 2,400 ppm, slightly below the 2,700 ppm minimum for the system.' },
  { category: 'salt_dosage', source: 'real', text: 'Add approximately 40 lbs of sodium chloride (pool grade) to a 15,000-gallon pool to raise salt by 300 ppm.' },
  { category: 'salt', source: 'real', text: 'Retest, salt now at 2,750 ppm.' },
  { category: 'salt', source: 'real', text: 'Saltwater pools need salt in range (e.g. 2,700-3,400 ppm), use our Saltwater Pool Salt Calculator.' },

  // ---- Bromine ------------------------------------------------------------------
  { category: 'bromine', source: 'real', text: 'Key Facts Bromine is more stable than chlorine at temperatures above 86°F, making it the preferred choice for hot tubs.' },
  { category: 'bromine', source: 'real', text: 'Typical Values Available bromine: approximately 54%.' },
  { category: 'bromine', source: 'synthetic', text: 'Hot tub bromine should be maintained between 4 and 8 ppm.' },

  // ---- Pool / hot-tub volume ---------------------------------------------------
  { category: 'volume', source: 'real', text: 'Over a 30-week season, that is 6-10 backwashes, totalling 900-2,000 gallons of water wasted to drain.' },
  { category: 'hottub_volume', source: 'real', text: 'A hot tub holds 300-500 gallons.' },
  { category: 'hottub_volume', source: 'real', text: 'In a small hot tub volume (300-500 gallons), even two or three bathers in an extended session can consume most of the free chlorine and leave behind significant combined chlorine.' },
  { category: 'volume', source: 'synthetic', text: 'A typical residential pool holds 10,000 to 25,000 gallons of water.' },

  // ---- Dosage / mass ----------------------------------------------------------
  { category: 'dosage', source: 'synthetic', text: 'Add 10 oz of liquid chlorine per 10,000 gallons to raise free chlorine by roughly 2 ppm.' },
  { category: 'dosage', source: 'synthetic', text: 'Use 1 lb of granular shock per 10,000 gallons for routine maintenance shock.' },

  // ---- Shock / troubleshooting examples -----------------------------------------
  { category: 'shock', source: 'real', text: 'Non-chlorine shock (MPS) is the fastest option: it works without raising FC and the spa can be used in 15-30 minutes.' },
  { category: 'shock', source: 'real', text: 'Chlorine shock provides deeper treatment but requires a minimum wait of 4-8 hours.' },
  { category: 'shock_threshold', source: 'synthetic', text: 'To reach breakpoint chlorination, dose free chlorine to roughly 10 times the combined chlorine reading.' },
  { category: 'example_input', source: 'synthetic', text: 'For example, suppose your test strip shows FC 0.5 ppm, pH 7.8, and TA 140 ppm before treatment.' },
  { category: 'example_output', source: 'synthetic', text: 'After shocking, the calculator result shows a target of 12 ppm free chlorine to reach breakpoint.' },

  // ---- LSI ----------------------------------------------------------------------
  { category: 'lsi', source: 'real', text: 'The LSI increases with temperature, water balanced at 70°F may begin scaling at 90°F.' },
  { category: 'lsi_no_number', source: 'real', text: 'LSI Shifts with Temperature Temperature is a significant variable in the Langelier Saturation Index formula.' },
  { category: 'lsi_composite', source: 'real', text: 'Water with an LSI of -0.1 at 68°F (well-balanced) may have an LSI of +0.4 at 90°F (beginning to scale) with identical pH, hardness, and alkalinity.' },
  { category: 'lsi', source: 'real', text: 'Key Facts An LSI of 0.0 is perfect balance; the industry target range is -0.3 to +0.3.' },
  { category: 'lsi_threshold', source: 'real', text: 'Aggressive water (LSI below -0.3) attacks plaster, grout, metal fittings, and pump impellers.' },
  { category: 'calculation', source: 'synthetic', text: 'The calculated LSI result is -0.1, indicating slightly corrosive water.' },

  // ---- Safety statements (numbers present, not target ranges) -------------------
  { category: 'safety', source: 'synthetic', text: 'Never mix chlorine and muriatic acid directly; doing so can release toxic chlorine gas within seconds.' },
  { category: 'safety', source: 'synthetic', text: 'Wait at least 8 hours after shocking a pool with 20 ppm chlorine before allowing swimmers back in.' },
  { category: 'safety', source: 'synthetic', text: 'Store pool chemicals in their original containers, at least 3 feet apart, in a cool, dry, ventilated area.' },

  // ---- Non-chemistry numeric (must not become a parameter claim) ----------------
  { category: 'non_chemistry', source: 'real', text: 'Typical Values Available bromine: ~54%; Dissolves in about 3-5 days (3-inch tablets) Related Resources Bromine Vs Chlorine Last reviewed: 2026-06-01' },
  { category: 'non_chemistry', source: 'real', text: '5 min read Winter Spa Care Hot tubs used year-round need adjusted chemistry for cold weather.' },
  { category: 'non_chemistry', source: 'synthetic', text: 'This page was last updated on 2026-06-29 and has a QA score of 98 out of 100.' },
  { category: 'non_chemistry', source: 'synthetic', text: 'The calculator has 6 input fields and takes about 30 seconds to complete.' },

  // ---- Ambiguous (no clean parameter/number pairing) -----------------------------
  { category: 'ambiguous', source: 'synthetic', text: 'Water chemistry can drift for several reasons, and regular testing catches problems early.' },
  { category: 'ambiguous', source: 'synthetic', text: 'Balance all four core parameters together rather than adjusting one in isolation.' },

  // ---- Additional pool-vs-hot-tub context pairs (Step 7 / Step 3 required) ------
  { category: 'context_pool', source: 'synthetic', text: 'For pools, keep free chlorine between 1 and 3 ppm.' },
  { category: 'context_hottub', source: 'synthetic', text: 'For hot tubs, keep free chlorine between 3 and 5 ppm.' },
  { category: 'context_pool', source: 'synthetic', text: 'Residential pool total alkalinity should sit near 100 ppm.' },
  { category: 'context_hottub', source: 'synthetic', text: 'Hot tub total alkalinity should sit near 100 ppm as well.' },
  { category: 'context_both', source: 'synthetic', text: 'Both pool and hot tub water should be tested for pH at least twice a week, targeting 7.2 to 7.6.' },
  { category: 'context_unspecified', source: 'synthetic', text: 'Calcium hardness of 250 ppm is generally acceptable.' },

  // ---- Additional combined/total chlorine (explicit CC/TC coverage) -------------
  { category: 'cc', source: 'real', text: 'Combined chlorine readings above roughly 0.2 to 0.5 ppm are commonly treated as the point where shock treatment is recommended.' },
  { category: 'tc', source: 'synthetic', text: 'If total chlorine is 5 ppm and free chlorine is 4 ppm, combined chlorine is 1 ppm.' },
  { category: 'cc', source: 'synthetic', text: 'Chloramines (combined chlorine) above 0.2 ppm can cause the strong "chlorine smell" often mistaken for too much chlorine.' },

  // ---- Additional cyanuric acid / free chlorine ratio (relationship claim) ------
  { category: 'relationship', source: 'synthetic', text: 'A commonly cited rule of thumb keeps free chlorine at roughly 7.5% of the cyanuric acid reading.' },
  { category: 'relationship', source: 'real', text: 'The CYA/FC ratio matters more than either single number for gauging real sanitizing power in a stabilized pool.' },

  // ---- Additional threshold examples --------------------------------------------
  { category: 'threshold', source: 'synthetic', text: 'If cyanuric acid exceeds 100 ppm, a partial drain and refill is typically recommended.' },
  { category: 'threshold', source: 'synthetic', text: 'Once calcium hardness falls below 150 ppm, plaster surfaces become vulnerable to etching.' },
  { category: 'threshold', source: 'real', text: 'Cyanuric acid (CYA) at 300 ppm or higher requires immediate remediation in public facilities.' },

  // ---- Additional composite (>=3 parameters in one sentence) ---------------------
  { category: 'composite', source: 'synthetic', text: 'Balanced water at 78°F reads pH 7.4, FC 2 ppm, TA 100 ppm, CH 300 ppm, and CYA 40 ppm.' },
  { category: 'composite', source: 'synthetic', text: 'A saltwater pool should read salt 3,200 ppm, FC 3 ppm, and pH 7.5 for typical maintenance.' },

  // ---- Additional dosage / mass -----------------------------------------------
  { category: 'dosage', source: 'real', text: 'For a standard maintenance shock, use 1 lb of cal-hypo shock per 10,000 gallons of water.' },
  { category: 'dosage', source: 'synthetic', text: 'Adding 6 oz of dry acid per 10,000 gallons typically lowers pH by about 0.2 units.' },

  // ---- Additional safety / mixing hazard examples --------------------------------
  { category: 'safety', source: 'real', text: 'Chlorine and muriatic acid or dry acid should never be added together, whether outside the pool or in it.' },
  { category: 'safety', source: 'synthetic', text: 'CPSC data shows about 4,500 emergency room visits per year from pool chemical injuries in the United States.' },

  // ---- Additional non-chemistry numeric noise ------------------------------------
  { category: 'non_chemistry', source: 'real', text: 'Platform version: v1.0.0 (Foundation), Production Certified.' },
  { category: 'non_chemistry', source: 'synthetic', text: 'This calculator page has been viewed by thousands of pool owners since 2024.' },
  { category: 'non_chemistry', source: 'synthetic', text: 'The article contains 12 sections and 4 tables.' },

  // ---- Additional pool volume / equipment sizing ----------------------------------
  { category: 'volume', source: 'synthetic', text: 'Spa volume calculators typically handle 100 to 800 gallon spas.' },
  { category: 'volume', source: 'real', text: 'A pump rated for 1.5 horsepower can typically turn over a 20,000-gallon pool in about 8 hours.' },

  // ---- Additional ambiguous / editorial -------------------------------------------
  { category: 'ambiguous', source: 'real', text: 'Every four core parameters interact, so changing one often shifts the others.' },
  { category: 'ambiguous', source: 'synthetic', text: 'Consistent testing is the single best habit for avoiding chemistry problems.' },
  { category: 'ambiguous', source: 'real', text: 'Understanding why a reading looks wrong is often more useful than the reading itself.' },

  // ---- Additional LSI / calculated value -------------------------------------------
  { category: 'calculation', source: 'synthetic', text: 'Entering pH 7.6, temperature 80°F, calcium hardness 250 ppm, alkalinity 100 ppm, and TDS 1000 ppm yields an LSI of 0.05.' },
  { category: 'lsi', source: 'synthetic', text: 'A pool with LSI consistently above +0.5 is at meaningfully higher risk of scale formation.' },
  { category: 'context_hottub', source: 'real', text: 'CDC recommends not using cyanuric acid or chlorine products with cyanuric acid in hot tubs.' },
];

const golden = CASES.map((c, i) => ({
  id: `golden-${String(i + 1).padStart(3, '0')}`,
  category: c.category,
  source: c.source,
  text: c.text,
  expected: extractFromSentence(c.text).map((r) => ({
    parameter_id: r.parameter_id,
    minimum: r.minimum,
    maximum: r.maximum,
    unit: r.unit,
    value_type: r.value_type,
    environment: r.environment,
    claim_type: r.claim_type,
    extraction_status: r.extraction_status,
  })),
}));

const outPath = path.join(__dirname, '..', 'data', 'chemistry-extraction-golden-set.json');
fs.writeFileSync(outPath, JSON.stringify(golden, null, 2) + '\n');
console.log(`build-golden-set: wrote ${golden.length} golden test cases to ${outPath}`);
