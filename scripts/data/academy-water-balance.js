'use strict';
// Academy – Water Balance (6 articles)

const src = 'Pool & Hot Tub Alliance — Pool & Spa Operator Handbook, 2022';
const src2 = 'Taylor Technologies — Pool/Spa Water Chemistry Reference';

module.exports = [
  {
    id: 'wb-01',
    slug: 'academy/water-balance/understanding-ph',
    title: 'Understanding pH in Pool Water',
    description: 'Learn what pH measures, why pool water pH must be between 7.2 and 7.6, and how to raise or lower it correctly.',
    summary: 'pH is the most critical control parameter in pool chemistry. It determines how effective your chlorine is and whether the water is comfortable for swimmers.',
    category: 'water-balance',
    readingTime: '6 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool pH', 'pool pH levels', 'raise lower pool pH', 'pH and chlorine effectiveness'],
    overview: 'pH is a logarithmic scale measuring water acidity or alkalinity. Pool water must be maintained between 7.2 and 7.6 to ensure effective chlorine sanitation, swimmer comfort, and protection of pool surfaces and equipment.',
    keyFacts: [
      'At pH 7.2, approximately 67% of free chlorine is in its most active form (hypochlorous acid).',
      'At pH 8.0, only 22% of free chlorine is active — three times more chlorine is needed for the same effect.',
      'pH naturally drifts upward in pools as CO2 escapes the water surface.',
      'Total alkalinity must be balanced first — it directly affects how stable pH will be.'
    ],
    sections: [
      {
        id: 'what-ph-means',
        h2: 'What pH Measures',
        body: 'pH measures the concentration of hydrogen ions in water on a logarithmic scale from 0 (most acidic) to 14 (most alkaline). Pure water at 7.0 is neutral. Pool water at 7.2–7.6 is slightly alkaline — the range where chlorine is highly active, swimmer eyes are comfortable (human tears are pH 7.4), and pool surfaces are neither being corroded nor scaled. Each full pH unit represents a 10-fold change in acidity, which is why even small changes (0.2–0.3 units) have measurable effects on chlorine effectiveness.'
      },
      {
        id: 'ph-and-chlorine',
        h2: 'Why pH Controls Chlorine',
        body: 'Free chlorine exists in two forms in water: hypochlorous acid (HOCl) and hypochlorite ion (OCl-). HOCl is roughly 80 times more effective as a disinfectant. At pH 7.2, about 67% of free chlorine is HOCl. At pH 7.4, it drops to about 55%. At pH 7.8, it drops to 28%. At pH 8.0, only 22% remains as HOCl. This means a pool with 2 ppm FC at pH 7.2 has roughly the same effective sanitation as a pool with 6 ppm FC at pH 8.0. High pH is one of the most common causes of chronic chlorine problems.'
      },
      {
        id: 'adjusting-ph',
        h2: 'Adjusting pH',
        body: 'To lower pH: add muriatic acid (hydrochloric acid) or dry acid (sodium bisulfate). Muriatic acid is more economical and faster; dry acid is safer to handle. To raise pH: add sodium carbonate (soda ash) or sodium bicarbonate (baking soda). Soda ash raises pH quickly with minimal alkalinity change. Sodium bicarbonate primarily raises alkalinity but also raises pH modestly. Always add pH adjustment chemicals to the deep end with the pump running, never near the skimmer, and allow 30–60 minutes for full dispersion before retesting. Make incremental adjustments — overshoot is common with large doses.'
      }
    ],
    examples: [
      {
        title: 'Diagnosing High-pH Chlorine Problems',
        body: 'A pool maintains 3 ppm FC but keeps developing algae spots. pH testing shows 8.0. At pH 8.0, only 22% of FC is active HOCl — effectively 0.66 ppm active chlorine despite the 3 ppm reading. Lowering pH to 7.4 immediately increases active chlorine to approximately 1.65 ppm without adding any chlorine product. The algae spots resolve within days. The fix cost a few dollars of acid instead of more chlorine that would not have helped at the high pH.'
      }
    ],
    commonMistakes: [
      'Adjusting pH without first correcting alkalinity — alkalinity controls how stable pH will be after adjustment.',
      'Adding pH increaser or decreaser in one large dose — overshoot is common and requires a corrective addition in the opposite direction.',
      'Not accounting for carbon dioxide in aerated pools — waterfalls and fountains off-gas CO2 rapidly, driving pH up regardless of how much acid you add.'
    ],
    relatedCalculators: ['/calculators/pool-ph-calculator', '/calculators/hot-tub-ph-calculator', '/calculators/chemical-calculator'],
    relatedCharts: ['/pool-chemical-levels-chart'],
    relatedResources: ['/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/water-balance/understanding-total-alkalinity', 'academy/water-balance/water-balance-order', 'academy/sanitizers/understanding-free-chlorine'],
    relatedFormulas: ['formulas/ph-adjustment-formula', 'formulas/lsi-formula'],
    relatedGlossary: ['glossary/ph', 'glossary/muriatic-acid', 'glossary/sodium-carbonate', 'glossary/hypochlorous-acid'],
    sources: [src, src2]
  },
  {
    id: 'wb-02',
    slug: 'academy/water-balance/understanding-total-alkalinity',
    title: 'Understanding Total Alkalinity',
    description: 'Learn what total alkalinity is, why it acts as a pH buffer, and how to raise or lower alkalinity in your pool.',
    summary: 'Total alkalinity is the pH buffer. When it is in range, pH stays stable. When it is out of range, pH swings wildly with every chemical addition or rainfall.',
    category: 'water-balance',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['total alkalinity pool', 'pool alkalinity levels', 'raise lower pool alkalinity', 'pH buffer pool'],
    overview: 'Total alkalinity (TA) measures the water\'s ability to resist changes in pH. Think of it as the shock absorber for pH. Without adequate alkalinity, pH swings dramatically with every chemical addition.',
    keyFacts: [
      'Target total alkalinity for pools is 80–120 ppm; for hot tubs, 80–120 ppm.',
      'Low alkalinity causes pH to swing unpredictably; high alkalinity locks pH at the high end and causes scaling.',
      'Always adjust alkalinity before adjusting pH — getting TA in range often brings pH close to target automatically.',
      'Sodium bicarbonate (baking soda) raises alkalinity; muriatic acid or sodium bisulfate lowers it.'
    ],
    sections: [
      {
        id: 'what-alkalinity-does',
        h2: 'What Alkalinity Does',
        body: 'Total alkalinity measures the concentration of bicarbonate, carbonate, and hydroxide ions in pool water. These ions act as a chemical buffer — they absorb acid or base additions before those additions can change pH. When TA is between 80 and 120 ppm, pH is stable and easy to manage. When TA drops below 60 ppm, even small amounts of acid (from rain, swimmer waste, or chemical additions) cause dramatic pH swings. This condition is called "pH bounce" and is the most common cause of chronic pH management problems.'
      },
      {
        id: 'high-and-low-alkalinity',
        h2: 'Effects of High and Low Alkalinity',
        body: 'Low alkalinity (below 80 ppm) causes pH to swing unpredictably and makes the water mildly aggressive. Even after adding pH increaser, the effect may only last a few hours before pH drops again. High alkalinity (above 120 ppm) locks pH at the high end of the scale, typically 7.8–8.2, making it very difficult to lower with normal acid doses. High alkalinity also increases the risk of scaling and cloudy water. Very high TA (above 200 ppm) can cause cloudiness on its own by promoting calcium carbonate precipitation.'
      },
      {
        id: 'adjusting-alkalinity',
        h2: 'Adjusting Total Alkalinity',
        body: 'To raise total alkalinity: add sodium bicarbonate (sold as "alkalinity increaser" or baking soda). Add in doses of 1–1.5 lbs per 10,000 gallons, broadcast around the pool, and test after 4 hours. To lower total alkalinity: add muriatic acid in measured doses. Lower alkalinity in increments — the relationship between acid dose and TA reduction is not perfectly linear. After lowering TA, allow 4–6 hours with the pump running and test again. Aeration (running waterfalls, fountains, or return jets near the surface) helps pH recover after acid additions lower both TA and pH.'
      }
    ],
    examples: [
      {
        title: 'Fixing pH Bounce',
        body: 'A pool owner adds soda ash Monday and pH jumps to 7.8. By Wednesday it is back to 7.0. They add more soda ash. By Friday it is 7.7. This cycle repeats weekly — classic pH bounce from low alkalinity. Testing TA shows 45 ppm. They add sodium bicarbonate to raise TA to 90 ppm (approximately 2.7 lbs for a 10,000-gallon pool). After this single treatment, pH stabilises at 7.4 without further adjustment for the next two weeks.'
      }
    ],
    commonMistakes: [
      'Repeatedly adjusting pH while ignoring alkalinity — pH will never stay in range until alkalinity is correct.',
      'Confusing total alkalinity with water hardness — they are completely separate parameters with separate chemical treatments.',
      'Adding large alkalinity adjustment doses all at once, which can overshoot the target and require a lengthy correction process.'
    ],
    relatedCalculators: ['/calculators/pool-alkalinity-calculator', '/calculators/chemical-calculator'],
    relatedResources: ['/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/water-balance/understanding-ph', 'academy/water-balance/water-balance-order', 'academy/water-balance/understanding-lsi'],
    relatedFormulas: ['formulas/alkalinity-formula'],
    relatedGlossary: ['glossary/total-alkalinity', 'glossary/ph', 'glossary/sodium-bicarbonate', 'glossary/ph-bounce'],
    sources: [src, src2]
  },
  {
    id: 'wb-03',
    slug: 'academy/water-balance/understanding-calcium-hardness',
    title: 'Understanding Calcium Hardness',
    description: 'Learn what calcium hardness is, why it matters for pool surfaces and equipment, and how to adjust it correctly.',
    summary: 'Calcium hardness determines whether pool water is aggressive (low hardness) or scaling (high hardness). It is especially important for plaster pools and heaters.',
    category: 'water-balance',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['calcium hardness pool', 'pool water hardness', 'raise calcium hardness', 'pool hardness levels'],
    overview: 'Calcium hardness (CH) measures the amount of dissolved calcium in pool water. It plays a key role in the Langelier Saturation Index and directly affects the condition of pool surfaces and equipment.',
    keyFacts: [
      'Target calcium hardness: 200–400 ppm for plaster and concrete pools; 150–250 ppm for vinyl and fibreglass.',
      'Low hardness makes water aggressive — it dissolves calcium from plaster and corrodes metal equipment.',
      'High hardness promotes calcium carbonate scaling on heater elements, pipes, and tile lines.',
      'Calcium hardness can only be lowered by partially draining and refilling with fresh water.'
    ],
    sections: [
      {
        id: 'what-hardness-does',
        h2: 'What Hardness Does',
        body: 'Water has a natural tendency to be in equilibrium with calcium carbonate. Water that contains less calcium than its equilibrium level is under-saturated — it will dissolve calcium from wherever it can find it, including pool plaster, grout, and metal equipment. This is called aggressive or corrosive water. Water that contains more calcium than its equilibrium level is over-saturated — it will deposit that excess calcium as scale. Calcium hardness, along with pH, alkalinity, and temperature, determines where on this aggressive-to-scaling spectrum your water sits.'
      },
      {
        id: 'effects-of-low-and-high',
        h2: 'Effects of Low and High Hardness',
        body: 'Low calcium hardness (below 150 ppm in a plaster pool) causes etching and pitting of the pool surface, visible as rough patches. Metal equipment — ladder rails, heat exchangers, filter housings — corrodes faster. The Langelier Saturation Index drops sharply at low hardness, indicating aggressive water. High calcium hardness (above 500 ppm) leads to visible scaling on tile, fixtures, and the waterline. Heater elements are especially vulnerable to calcium scale, which acts as insulation and causes elements to overheat and fail.'
      },
      {
        id: 'adjusting-hardness',
        h2: 'Adjusting Calcium Hardness',
        body: 'To raise calcium hardness: add calcium chloride (sold as "hardness increaser"). It dissolves quickly and raises hardness without significantly affecting pH. Typical dose for raising hardness by 10 ppm in a 10,000-gallon pool is approximately 1.25 lbs. Add in small increments. To lower calcium hardness: there is no chemical treatment. The only option is to partially drain the pool and refill with water that has lower hardness. In areas with very hard tap water, this becomes a longer-term management challenge requiring periodic dilution.'
      }
    ],
    examples: [
      {
        title: 'Identifying a Hardness Problem',
        body: 'A plaster pool shows rough patches on the bottom near the main drain, visible as dull, pitted areas about 6 months after resurfacing. Water test shows calcium hardness at 80 ppm — well below the 200 ppm minimum for plaster. The low hardness water is etching the new plaster surface. Adding calcium chloride over three days to raise hardness to 250 ppm, and adjusting pH to 7.4, brings the LSI into range and stops further etching. The existing pitting is permanent but will not worsen with correct chemistry.'
      }
    ],
    commonMistakes: [
      'Confusing calcium hardness with total hardness — total hardness includes magnesium; pool chemistry uses only calcium hardness.',
      'Adding large calcium chloride doses at once — the dissolution is exothermic (produces heat) and can damage vinyl liners if undissolved granules settle on them.',
      'Not monitoring hardness in refill water — in some regions, tap water is naturally very hard (400+ ppm) and can cause scaling problems from day one.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator'],
    relatedResources: ['/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/water-balance/understanding-lsi', 'academy/water-balance/understanding-ph', 'academy/troubleshooting/scaling'],
    relatedFormulas: ['formulas/lsi-formula'],
    relatedGlossary: ['glossary/calcium-hardness', 'glossary/langelier-saturation-index', 'glossary/total-hardness', 'glossary/scaling-water'],
    sources: [src, src2]
  },
  {
    id: 'wb-04',
    slug: 'academy/water-balance/understanding-cyanuric-acid',
    title: 'Understanding Cyanuric Acid',
    description: 'Learn what cyanuric acid (CYA) does in pool water, the ideal CYA range, and how to manage buildup over time.',
    summary: 'Cyanuric acid stabilises chlorine against UV destruction, but too much CYA reduces chlorine effectiveness. Managing CYA level is critical for outdoor pools using stabilised chlorine products.',
    category: 'water-balance',
    readingTime: '6 min read',
    lastReviewed: '2026-06-01',
    keywords: ['cyanuric acid pool', 'CYA pool water', 'pool stabilizer', 'chlorine lock CYA'],
    overview: 'Cyanuric acid (CYA), also called stabiliser or conditioner, protects outdoor pool chlorine from UV degradation by the sun. Without it, chlorine in an outdoor pool depletes within a few hours. With too much, chlorine effectiveness is severely compromised.',
    keyFacts: [
      'Target CYA for unstabilised pools: 30–50 ppm. Salt pools: 60–80 ppm.',
      'Above 80 ppm, CYA significantly reduces chlorine effectiveness — more chlorine is needed for the same sanitation.',
      'Trichlor tablets add CYA with every dose; this is the most common source of CYA accumulation.',
      'CYA can only be reduced by dilution — partial drain and refill with fresh water.'
    ],
    sections: [
      {
        id: 'what-cya-does',
        h2: 'What Cyanuric Acid Does',
        body: 'Cyanuric acid forms a weak chemical bond with free chlorine in pool water. This bond protects chlorine molecules from being broken down by UV radiation from the sun. Without CYA in an outdoor pool, chlorine exposed to direct sunlight at midday will deplete by 90% within two to three hours. With 30–50 ppm CYA, chlorine is much more stable and persists throughout the day. CYA does not permanently consume chlorine — it releases it back when chlorine is needed for sanitation, then recaptures it. However, the bond also moderately reduces the sanitising speed of the released chlorine.'
      },
      {
        id: 'cya-chlorine-relationship',
        h2: 'The CYA-Chlorine Relationship',
        body: 'The percentage of free chlorine that is in its most active form (HOCl) decreases as CYA increases. At CYA 30 ppm and pH 7.4, approximately 20% of FC is active. At CYA 100 ppm and the same pH, only 6–7% is active. This is why pools with very high CYA require much higher FC targets to maintain equivalent sanitation. Some industry guidelines recommend a minimum FC that is 7.5–15% of the CYA level. At CYA 80 ppm, minimum FC would be 6–12 ppm — far above the standard 1–3 ppm range. This situation is sometimes called "chlorine lock."'
      },
      {
        id: 'managing-cya-buildup',
        h2: 'Managing CYA Buildup',
        body: 'CYA accumulates over time when stabilised chlorine products (trichlor tablets or dichlor shock) are used. Unlike pH, alkalinity, and hardness, CYA cannot be reduced with a chemical treatment — the only option is dilution by draining a portion of the pool and refilling with fresh water. Test CYA at the start of the season and monthly if using stabilised products. When CYA exceeds 80 ppm, plan a partial drain of 25–50% and refill. If CYA exceeds 100 ppm, a larger drain may be necessary. Switching to unstabilised liquid chlorine or cal-hypo will stop CYA accumulation and allow natural dilution from rain and splash-out to slowly reduce it.'
      }
    ],
    examples: [
      {
        title: 'Diagnosing Chlorine Lock',
        body: 'A pool owner adds shock every week but algae keeps returning. FC tests fine at 3 ppm. A CYA test shows 120 ppm. At CYA 120 ppm, minimum recommended FC for adequate sanitation is approximately 9–18 ppm. The 3 ppm FC reading is inadequate, but standard dosing tables do not account for this extreme CYA level. The fix: drain 50% of the pool and refill with fresh water, which reduces CYA to 60 ppm. Switch to liquid chlorine. The pool stays clear with normal 2–3 ppm FC from that point forward.'
      }
    ],
    commonMistakes: [
      'Using trichlor shock repeatedly through a season without testing CYA — each shock dose adds CYA to an already elevated level.',
      'Not testing CYA at the start of the season, starting from an unknown and potentially very high CYA baseline.',
      'Trying to lower CYA with chemical products — no effective chemical treatment exists for reducing CYA; only dilution works.'
    ],
    relatedCalculators: ['/calculators/pool-cyanuric-acid-calculator', '/calculators/chemical-calculator'],
    relatedResources: ['/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/water-balance/understanding-ph', 'academy/sanitizers/liquid-chlorine-vs-tablets', 'academy/sanitizers/understanding-free-chlorine'],
    relatedFormulas: ['formulas/cya-formula'],
    relatedGlossary: ['glossary/cyanuric-acid', 'glossary/chlorine-stabilizer', 'glossary/trichlor', 'glossary/chlorine-demand'],
    sources: [src, src2]
  },
  {
    id: 'wb-05',
    slug: 'academy/water-balance/understanding-lsi',
    title: 'Understanding the Langelier Saturation Index',
    description: 'Learn how the Langelier Saturation Index (LSI) measures water balance and why it is the most complete indicator of whether pool water is corrosive or scaling.',
    summary: 'The Langelier Saturation Index combines pH, temperature, alkalinity, hardness, and TDS into a single balance score. It is the most reliable predictor of surface damage and equipment corrosion.',
    category: 'water-balance',
    readingTime: '6 min read',
    lastReviewed: '2026-06-01',
    keywords: ['Langelier Saturation Index', 'LSI pool', 'pool water balance index', 'pool corrosion scale'],
    overview: 'The Langelier Saturation Index (LSI) is a calculated number that predicts whether pool water is in equilibrium, tending to corrode, or tending to deposit scale. It combines five variables into a single actionable score.',
    keyFacts: [
      'LSI target range: -0.3 to +0.3. Zero is perfect balance.',
      'Negative LSI (below -0.3): water is aggressive and will corrode pool surfaces and equipment.',
      'Positive LSI (above +0.3): water is over-saturated and will deposit calcium carbonate scale.',
      'Temperature has a large effect on LSI — the same chemistry at 90°F scores higher than at 70°F.'
    ],
    sections: [
      {
        id: 'how-lsi-is-calculated',
        h2: 'How the LSI Is Calculated',
        body: 'LSI = pH + Temperature Factor (TF) + Calcium Factor (CF) + Alkalinity Factor (AF) - 12.1. Each factor is a number derived from a lookup table based on the actual measurement. Temperature factor increases with rising temperature (hotter water has a higher scaling tendency). Calcium factor increases with higher calcium hardness. Alkalinity factor increases with higher total alkalinity. The constant 12.1 is the saturation constant for calcium carbonate at typical pool chemistry conditions. The result is a dimensionless index that tells you the balance state of the water.'
      },
      {
        id: 'using-the-lsi',
        h2: 'Using the LSI Practically',
        body: 'Calculate the LSI every time you do a full water test, using the current water temperature. If the LSI is below -0.3, the most common corrections are raising pH, raising calcium hardness, or raising alkalinity. If the LSI is above +0.3, lower pH (largest effect), lower calcium hardness (requires partial drain), or lower alkalinity slightly. Of the adjustable variables, pH has the largest impact on LSI because the pH factor in the formula is the raw pH value, not a lookup number — a 0.1 pH change shifts LSI by 0.1 directly.'
      },
      {
        id: 'lsi-for-spas',
        h2: 'LSI for Heated Spas',
        body: 'Hot tub water is typically maintained at 98–104°F. At these temperatures, the temperature factor in the LSI formula is significantly higher than for a pool at 78°F. This means that spa water requires lower pH, lower alkalinity, and lower hardness than pool water to achieve the same LSI target. A spa with pH 7.6, TA 100 ppm, and hardness 250 ppm at 102°F may have an LSI of +0.6 — actively scaling. The same water at 78°F in a pool would have an LSI of about +0.2 — well within range. Always calculate LSI at actual water temperature, not a standard assumption.'
      }
    ],
    examples: [
      {
        title: 'Using the LSI Calculator',
        body: 'Pool test data: pH 7.4, temperature 82°F, calcium hardness 250 ppm, total alkalinity 100 ppm, TDS 1,500 ppm. Using the LSI calculator: TF = 0.6 (at 82°F), CF = 1.9 (at 250 ppm), AF = 1.9 (at 100 ppm). LSI = 7.4 + 0.6 + 1.9 + 1.9 - 12.1 = 1.7 - nope, let me recalculate. pH 7.4, TF for 82°F is approximately 0.6, CF for 250 ppm is 1.9, AF for 100 ppm is 2.0. LSI = 7.4 + 0.6 + 1.9 + 2.0 - 12.1 = -0.2. Slightly negative but within the acceptable range. No adjustment needed.'
      }
    ],
    commonMistakes: [
      'Calculating the LSI without entering the actual current water temperature, which is the most commonly overlooked variable.',
      'Ignoring calcium hardness in the LSI calculation because it changes slowly — it still has a large effect on the index.',
      'Treating any negative LSI as dangerous — LSI between -0.3 and 0 is normal for many well-managed pools, especially those using salt systems.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator'],
    relatedResources: ['/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/fundamentals/how-water-balance-works', 'academy/water-balance/understanding-calcium-hardness', 'academy/water-balance/understanding-total-alkalinity'],
    relatedFormulas: ['formulas/lsi-formula'],
    relatedGlossary: ['glossary/langelier-saturation-index', 'glossary/ph', 'glossary/calcium-hardness', 'glossary/total-dissolved-solids'],
    sources: [src, src2]
  },
  {
    id: 'wb-06',
    slug: 'academy/water-balance/water-balance-order',
    title: 'Water Balance Order: The Correct Sequence',
    description: 'Learn the correct order for adjusting pool water chemistry parameters, and why adding chemicals in the wrong sequence creates more problems than it solves.',
    summary: 'Adjust pool chemicals in the correct order: alkalinity first, then pH, then calcium hardness, then chlorine. The sequence matters because each adjustment affects the others.',
    category: 'water-balance',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool chemical order', 'pool adjustment sequence', 'order to add pool chemicals', 'water balance steps'],
    overview: 'Chemical adjustments in a pool interact with each other. Correcting them in the wrong order can require additional corrections that would not have been needed, wastes chemicals, and extends the time to stable chemistry.',
    keyFacts: [
      'Always adjust total alkalinity before pH — alkalinity stabilises pH and makes pH adjustments hold.',
      'Never add multiple chemicals simultaneously — allow each adjustment to disperse fully before adding the next.',
      'Wait at least 4–6 hours after any alkalinity adjustment before testing and adjusting pH.',
      'Add chlorine last, after pH is in range — chlorine is most effective at the correct pH.'
    ],
    sections: [
      {
        id: 'why-order-matters',
        h2: 'Why Order Matters',
        body: 'Pool water chemistry parameters are interdependent. When you add sodium bicarbonate (baking soda) to raise alkalinity, pH also shifts. If you adjust pH before alkalinity is correct, the pH will continue to drift once alkalinity is adjusted. Similarly, chlorine is far less effective at high pH — adding chlorine while pH is above 7.8 is wasteful. Calcium hardness adjustments (calcium chloride) generate heat and can affect pH temporarily. The correct sequence minimises the number of total adjustments needed and produces stable results in less time.'
      },
      {
        id: 'the-correct-sequence',
        h2: 'The Correct Sequence',
        body: 'Step 1: Adjust total alkalinity to 80–120 ppm using sodium bicarbonate (to raise) or muriatic acid (to lower). Wait 4–6 hours and retest. Step 2: Adjust pH to 7.2–7.6 using sodium carbonate or soda ash (to raise) or muriatic acid / sodium bisulfate (to lower). Wait 2 hours and retest. Step 3: Adjust calcium hardness to the appropriate range for your pool type. This adjustment is slow and does not need immediate retest. Step 4: Adjust chlorine and CYA. With pH and alkalinity in range, your chlorine addition will be maximally effective and will hold at the target level far more stably.'
      },
      {
        id: 'timing-between-additions',
        h2: 'Timing Between Additions',
        body: 'Never add two chemicals at the same time. Some combinations can react violently — for example, mixing acid with chlorine can produce chlorine gas. Even non-reactive combinations should be spread out to allow proper dispersion before the next test. As a practical rule: wait at least 30 minutes with the pump running between any two chemical additions, and test before each addition to verify the current state. For large adjustments, wait 4–6 hours between each test and correction cycle. Rushing the process leads to over-correction, which requires a counter-correction, starting a cycle of chasing numbers.'
      }
    ],
    examples: [
      {
        title: 'Full Rebalancing Sequence',
        body: 'An opening test shows: TA 50 ppm, pH 7.0, CH 100 ppm, FC 0. Day 1 morning: add sodium bicarbonate to raise TA toward 90 ppm. Day 1 evening: retest TA (now 85 ppm, pH drifted to 7.3 on its own). No pH adjustment needed. Day 2: add calcium chloride to raise hardness toward 200 ppm. Day 2 evening: add liquid chlorine to bring FC to 3 ppm. Day 3: verify all parameters are stable. Four days to full balance without any over-correction.'
      }
    ],
    commonMistakes: [
      'Adding all corrections in one session and ending up with water that is worse than when you started.',
      'Adjusting pH before alkalinity, then needing to re-adjust pH again after the alkalinity correction shifts it.',
      'Testing immediately after an adjustment before the chemical has fully dispersed, and adding a second unnecessary dose based on the localised high or low reading.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator', '/calculators/pool-alkalinity-calculator', '/calculators/pool-ph-calculator'],
    relatedResources: ['/resources/pool-maintenance-checklist', '/resources/water-test-log'],
    relatedTopics: ['academy/water-balance/understanding-ph', 'academy/water-balance/understanding-total-alkalinity', 'academy/testing/understanding-test-results'],
    relatedFormulas: ['formulas/alkalinity-formula', 'formulas/ph-adjustment-formula'],
    relatedGlossary: ['glossary/total-alkalinity', 'glossary/ph', 'glossary/calcium-hardness'],
    sources: [src, src2]
  }
];
