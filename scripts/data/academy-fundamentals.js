'use strict';
// Academy – Water Chemistry Fundamentals (6 articles)

const src = 'Pool & Hot Tub Alliance — Pool & Spa Operator Handbook, 2022';
const src2 = 'Taylor Technologies — Pool/Spa Water Chemistry Reference';
const src3 = 'CDC — Healthy Swimming Guidelines';

module.exports = [
  {
    id: 'fund-01',
    slug: 'academy/fundamentals/understanding-pool-water-chemistry',
    title: 'Understanding Pool Water Chemistry',
    description: 'Learn the four core water chemistry parameters that every pool owner needs to maintain safe, clear water.',
    summary: 'Pool safety and clarity depend on four core measurements working together. This guide explains what each one does and why they must all be in range.',
    category: 'fundamentals',
    readingTime: '7 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool water chemistry', 'chlorine pH alkalinity', 'water balance', 'pool maintenance basics'],
    overview: 'Maintaining a pool reduces to four core measurements: free chlorine, pH, total alkalinity, and cyanuric acid. Each has a target range, and each affects the others. This guide walks through what each one does and why it matters.',
    keyFacts: [
      'Free chlorine should be 1–3 ppm for pools and 3–5 ppm for hot tubs.',
      'pH between 7.2 and 7.6 is essential for both swimmer comfort and chlorine effectiveness.',
      'Total alkalinity between 80 and 120 ppm stabilises pH and prevents rapid swings.',
      'Cyanuric acid above 80 ppm significantly reduces chlorine effectiveness even when the reading looks correct.'
    ],
    sections: [
      {
        id: 'free-chlorine',
        h2: 'Free Chlorine: The Active Sanitizer',
        body: 'Free chlorine (FC) is the active disinfectant in pool water. It kills bacteria, viruses, and algae by oxidising their cell walls on contact. The CDC recommends a minimum of 1 ppm for pools, but most operators target 2–3 ppm as a safety buffer against rain dilution, bather load, and UV degradation. Free chlorine exists in two forms: hypochlorous acid (HOCl) and hypochlorite ion (OCl-). Hypochlorous acid is 40–80 times more effective, and its proportion is determined almost entirely by pH — which is why chlorine and pH management cannot be separated.'
      },
      {
        id: 'ph',
        h2: 'pH: The Master Control',
        body: 'pH measures whether water is acidic or alkaline on a scale of 0–14, with 7.0 being neutral. Pool water should sit between 7.2 and 7.6. At this range, chlorine is highly effective, swimmer eyes are comfortable, and equipment corrosion is minimised. Below 7.2, water becomes aggressive and corrodes plaster, grout, and metal. Above 7.8, chlorine effectiveness drops sharply — at pH 8.0, active chlorine is only about 22% of what the test shows.'
      },
      {
        id: 'alkalinity-and-cya',
        h2: 'Alkalinity and Stabilizer',
        body: 'Total alkalinity (TA) acts as a pH buffer. Without adequate alkalinity (target 80–120 ppm), pH swings wildly with every chemical addition or rainstorm. Cyanuric acid (CYA) protects outdoor chlorine from UV degradation — without it, direct sunlight can deplete chlorine in as little as two hours. Target CYA for standard outdoor pools is 30–50 ppm. Above 80 ppm, CYA suppresses chlorine activity enough that even a 3 ppm reading may provide inadequate sanitation.'
      }
    ],
    examples: [
      {
        title: 'Reading Your First Test Results',
        body: 'Test shows FC 0.5 ppm, pH 7.8, TA 140 ppm, CYA 60 ppm. Low FC is the immediate problem, but the high pH explains why it depleted so quickly — chlorine is only about 30% effective at pH 7.8. Bring pH down first (which also lowers TA slightly), then add chlorine. This order means your chlorine dose works at full strength immediately rather than fighting an uphill battle.'
      }
    ],
    commonMistakes: [
      'Adding chlorine without checking pH first — at pH 8.0, you may need triple the dose to achieve the same effect.',
      'Treating only one parameter without checking how it affects the others.',
      'Ignoring CYA buildup until algae appears, by which point normal chlorine doses have become ineffective.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator', '/calculators/pool-chlorine-calculator', '/calculators/pool-ph-calculator'],
    relatedCharts: ['/pool-chemical-levels-chart'],
    relatedResources: ['/resources/pool-maintenance-checklist', '/resources/water-test-log'],
    relatedTopics: ['academy/fundamentals/how-water-balance-works', 'academy/fundamentals/the-four-core-water-tests', 'academy/water-balance/understanding-ph', 'academy/sanitizers/understanding-free-chlorine'],
    relatedFormulas: ['formulas/liquid-chlorine-formula', 'formulas/ph-adjustment-formula'],
    relatedGlossary: ['glossary/free-chlorine', 'glossary/ph', 'glossary/total-alkalinity', 'glossary/cyanuric-acid'],
    sources: [src, src3]
  },
  {
    id: 'fund-02',
    slug: 'academy/fundamentals/how-water-balance-works',
    title: 'How Water Balance Works',
    description: 'Understand what balanced pool water means, how the Langelier Saturation Index works, and why balance protects your pool surfaces and equipment.',
    summary: 'Balanced water neither corrodes surfaces nor deposits scale. This guide explains the Langelier Saturation Index and how to adjust your chemistry to stay in range.',
    category: 'fundamentals',
    readingTime: '6 min read',
    lastReviewed: '2026-06-01',
    keywords: ['water balance', 'Langelier Saturation Index', 'LSI pool', 'pool scaling corrosion'],
    overview: 'Pool water balance describes whether the water is chemically stable. Unbalanced water is either too aggressive (corroding equipment and surfaces) or too scaling (depositing calcium carbonate). The Langelier Saturation Index measures this on a single scale.',
    keyFacts: [
      'An LSI of 0.0 is perfect balance; the industry target range is -0.3 to +0.3.',
      'Aggressive water (LSI below -0.3) attacks plaster, grout, metal fittings, and pump impellers.',
      'Scaling water (LSI above +0.3) deposits calcium on heater elements, pipes, and pool surfaces.',
      'Temperature is a major LSI factor — the same water chemistry at 70°F is less likely to scale than at 100°F.'
    ],
    sections: [
      {
        id: 'aggressive-vs-scaling',
        h2: 'Aggressive vs. Scaling Water',
        body: 'Water that is too aggressive wants to dissolve minerals, so it attacks the minerals in pool plaster, concrete, and metal fittings. You may see etching on plaster surfaces, pitting on ladder rails, or rapid wear on pool equipment. Water that is too scaling deposits calcium carbonate as hard white buildup on tile lines, inside pipes, on heater elements, and on pool surfaces. Both conditions are preventable with proper chemistry management.'
      },
      {
        id: 'the-lsi',
        h2: 'The Langelier Saturation Index',
        body: 'The LSI is a calculated value that accounts for pH, temperature, calcium hardness, total alkalinity, and total dissolved solids. A negative LSI means the water is under-saturated with calcium carbonate and will act aggressively. A positive LSI means the water is over-saturated and will deposit scale. Most pool chemistry references target an LSI between -0.3 and +0.3. Use the LSI Calculator on this site to calculate your current index and see which parameters to adjust.'
      },
      {
        id: 'balancing-in-practice',
        h2: 'Balancing in Practice',
        body: 'Start by adjusting total alkalinity to 80–120 ppm, which supports stable pH. Then bring pH into the 7.2–7.6 range. Finally, verify calcium hardness is appropriate for your pool type (200–400 ppm for plaster, 150–250 ppm for vinyl and fibreglass). Once all three are in range, calculate the LSI with the current water temperature and make fine adjustments. Small changes to pH have the largest effect on LSI.'
      }
    ],
    examples: [
      {
        title: 'Diagnosing Aggressive Water',
        body: 'A new plaster pool filled with soft municipal water shows calcium hardness 80 ppm, pH 7.0, TA 60 ppm at 75°F — an LSI of approximately -1.2. This water is aggressively attacking the new plaster surface. The fix: raise TA to 90 ppm first, then adjust pH to 7.4, then add calcium chloride to bring hardness to 250 ppm. This brings LSI close to 0.0 and stops the etching.'
      }
    ],
    commonMistakes: [
      'Balancing pH alone without verifying alkalinity and hardness are also in range.',
      'Ignoring water temperature when using the LSI — a heated spa at 100°F has a significantly higher scaling risk than a pool at 70°F with identical chemistry.',
      'Assuming tap water is already balanced — municipal water chemistry varies widely by region and season.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator', '/calculators/pool-alkalinity-calculator'],
    relatedCharts: ['/pool-chemical-levels-chart'],
    relatedResources: ['/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/fundamentals/understanding-pool-water-chemistry', 'academy/water-balance/understanding-lsi', 'academy/water-balance/understanding-calcium-hardness', 'academy/water-balance/understanding-total-alkalinity'],
    relatedFormulas: ['formulas/lsi-formula'],
    relatedGlossary: ['glossary/langelier-saturation-index', 'glossary/calcium-hardness', 'glossary/total-alkalinity', 'glossary/ph'],
    sources: [src, src2]
  },
  {
    id: 'fund-03',
    slug: 'academy/fundamentals/the-four-core-water-tests',
    title: 'The Four Core Water Tests',
    description: 'Learn which four water tests every pool owner must run, what each measures, and the target ranges for pools and hot tubs.',
    summary: 'Free chlorine, pH, total alkalinity, and calcium hardness are the four tests that tell you everything you need to know about your pool water safety.',
    category: 'fundamentals',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool water tests', 'what to test in pool', 'free chlorine pH alkalinity hardness', 'pool testing guide'],
    overview: 'Every pool management decision starts with accurate test results. The four core tests — free chlorine, pH, total alkalinity, and calcium hardness — each reveal a different dimension of water safety and stability.',
    keyFacts: [
      'Free chlorine (1–3 ppm) is the test most directly linked to swimmer health.',
      'pH (7.2–7.6) controls how effectively chlorine kills pathogens.',
      'Total alkalinity (80–120 ppm) buffers pH against sudden changes.',
      'Calcium hardness (200–400 ppm for plaster pools) protects pool surfaces and equipment.'
    ],
    sections: [
      {
        id: 'free-chlorine-test',
        h2: 'Test 1: Free Chlorine',
        body: 'Free chlorine (FC) is the most critical safety test. It measures the chlorine that is actively available to sanitise water. Target range is 1–3 ppm for pools and 3–5 ppm for hot tubs. Below 1 ppm, sanitation is inadequate. Above 5 ppm, swimming is uncomfortable and surfaces may bleach. FC should be tested at least twice per week in summer and after every heavy rain or large bather load. Use a DPD-based test kit or test strips rated for free chlorine specifically — OTO-based kits measure total chlorine, which is less useful.'
      },
      {
        id: 'ph-test',
        h2: 'Test 2: pH',
        body: 'pH is the most important factor in chlorine effectiveness. The target is 7.2–7.6 for pools. Test pH every time you test chlorine. pH tends to drift upward in pools as carbon dioxide escapes from the water surface. Aeration from waterfalls, jets, and high temperatures accelerates this. Sodium carbonate (soda ash) raises pH; muriatic acid or sodium bisulfate lowers it. Always adjust alkalinity before pH — an alkalinity adjustment will often bring pH close to target on its own.'
      },
      {
        id: 'alkalinity-hardness-test',
        h2: 'Tests 3 & 4: Alkalinity and Hardness',
        body: 'Total alkalinity (80–120 ppm) is tested weekly in new pools or monthly once stable. Alkalinity adjustment is the foundation of pH stability — fix it first and pH becomes much easier to manage. Calcium hardness (200–400 ppm for plaster, 150–250 ppm for fibreglass and vinyl) protects pool surfaces. Low hardness makes water aggressive; high hardness leads to scaling. Test hardness monthly. Adjust with calcium chloride to raise; partial drain and refill to lower.'
      }
    ],
    examples: [
      {
        title: 'Monthly Full Test Reading',
        body: 'A pool owner runs a full test in July: FC 1.0 ppm, pH 7.7, TA 90 ppm, hardness 280 ppm, CYA 45 ppm. The pH at 7.7 is borderline high but not an emergency. FC at 1.0 is acceptable but trending low for mid-summer — adding chlorine tonight and increasing the pump run time will help. Everything else is in range. No urgent adjustments needed except monitoring FC more closely over the next week.'
      }
    ],
    commonMistakes: [
      'Only testing chlorine and pH and ignoring alkalinity until pH becomes impossible to stabilise.',
      'Using an OTO test kit (which measures total chlorine) and treating the result as if it were free chlorine.',
      'Collecting the water sample from the surface near a return jet, which gives a falsely favourable reading.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator', '/calculators/pool-alkalinity-calculator', '/calculators/pool-cyanuric-acid-calculator'],
    relatedResources: ['/resources/water-test-log', '/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/fundamentals/understanding-pool-water-chemistry', 'academy/testing/using-liquid-test-kits', 'academy/water-balance/understanding-total-alkalinity', 'academy/water-balance/understanding-calcium-hardness'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/free-chlorine', 'glossary/ph', 'glossary/total-alkalinity', 'glossary/calcium-hardness', 'glossary/dpd-test'],
    sources: [src, src2]
  },
  {
    id: 'fund-04',
    slug: 'academy/fundamentals/pool-vs-hot-tub-chemistry',
    title: 'Pool vs. Hot Tub Chemistry',
    description: 'Understand how hot tub water chemistry differs from pool chemistry, including tighter target ranges, faster depletion, and more frequent testing.',
    summary: 'Hot tubs use the same chemistry as pools but with tighter ranges, smaller margins, and much faster chemical depletion due to heat, jets, and small volume.',
    category: 'fundamentals',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['hot tub chemistry vs pool', 'spa water chemistry', 'hot tub chlorine levels', 'pool vs spa water balance'],
    overview: 'Pool and hot tub water chemistry follow identical principles but very different numbers. Smaller volume, higher temperature, and jet aeration create a much more demanding chemical environment in a spa.',
    keyFacts: [
      'A typical hot tub holds 300–500 gallons — roughly 1/30th the volume of a small pool.',
      'Hot tub chlorine target is 3–5 ppm vs 1–3 ppm for pools, because heat and bather concentration are higher.',
      'Hot tub pH should be tested at every soak session — it shifts faster than pool water.',
      'High jets and aeration in hot tubs rapidly off-gas carbon dioxide, driving pH upward.'
    ],
    sections: [
      {
        id: 'volume-and-concentration',
        h2: 'Volume, Dilution, and Concentration',
        body: 'A small pool holds 10,000–25,000 gallons. A hot tub holds 300–500 gallons. When a single bather enters a hot tub, the effective bather load per gallon is 30–50 times higher than the same person entering a pool. Sweat, body oils, lotions, and other organics introduced by bathers consume chlorine rapidly. This is why hot tub chlorine targets are higher and why water can drop below safe levels within a single soak session.'
      },
      {
        id: 'temperature-effects',
        h2: 'Temperature and Chemical Reactions',
        body: 'Hot tub water typically operates at 98–104°F. Higher temperatures speed up all chemical reactions, including chlorine consumption, scaling, and pH drift. Chlorine depletes two to three times faster at hot tub temperatures than at pool temperatures. The Langelier Saturation Index also shifts significantly with temperature — water that is balanced at 80°F can be aggressively scaling at 100°F with the same hardness and alkalinity values.'
      },
      {
        id: 'different-targets',
        h2: 'Different Target Ranges',
        body: 'Hot tub target ranges are narrower than pool ranges because less margin for error exists in a small volume. Free chlorine: 3–5 ppm (vs. 1–3 for pools). pH: 7.2–7.8 (same range but must be checked more often). Total alkalinity: 80–120 ppm (same). Calcium hardness: 150–250 ppm (lower than pools because high heat with high hardness accelerates scaling). CYA is not used in indoor spas or covered hot tubs — UV protection is not needed and CYA would interfere with the higher chlorine targets.'
      }
    ],
    examples: [
      {
        title: 'Converting a Pool Dose to a Hot Tub',
        body: 'If a calculator says to add 10 oz of liquid chlorine to a 10,000-gallon pool to raise FC by 1 ppm, how much does a 400-gallon hot tub need? Scale linearly: 10 oz x (400/10,000) = 0.4 oz. That is less than one tablespoon. Hot tub doses are tiny compared to pool doses, which is why it is easy to accidentally over-dose a spa. Always weigh or measure hot tub chemical additions carefully.'
      }
    ],
    commonMistakes: [
      'Adding pool-sized chemical doses to a hot tub and massively over-treating the water.',
      'Not testing hot tub chemistry before every soak session, especially after heavy use.',
      'Using CYA in a covered indoor hot tub where UV protection is not needed and where it will reduce sanitizer effectiveness.'
    ],
    relatedCalculators: ['/calculators/hot-tub-chlorine-calculator', '/calculators/hot-tub-ph-calculator', '/calculators/spa-volume-calculator'],
    relatedResources: ['/resources/hot-tub-maintenance-log'],
    relatedTopics: ['academy/fundamentals/how-temperature-changes-water-chemistry', 'academy/hot-tubs/daily-spa-maintenance', 'academy/hot-tubs/refilling-your-hot-tub'],
    relatedFormulas: ['formulas/liquid-chlorine-formula'],
    relatedGlossary: ['glossary/free-chlorine', 'glossary/bather-load', 'glossary/langelier-saturation-index'],
    sources: [src, src2]
  },
  {
    id: 'fund-05',
    slug: 'academy/fundamentals/how-temperature-changes-water-chemistry',
    title: 'How Temperature Changes Water Chemistry',
    description: 'Learn how rising water temperature affects chlorine demand, pH stability, calcium solubility, and the Langelier Saturation Index.',
    summary: 'Higher water temperature speeds up chlorine consumption, shifts pH upward, and increases the risk of calcium scaling — all at the same time.',
    category: 'fundamentals',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['water temperature chemistry', 'summer pool chemistry', 'chlorine demand heat', 'LSI temperature'],
    overview: 'Water temperature affects almost every aspect of pool chemistry. As temperature rises, chemical reactions accelerate, scaling risk increases, and the same chemical dose that worked in spring may not be enough in midsummer.',
    keyFacts: [
      'Chlorine demand roughly doubles for every 10°F rise in water temperature above 80°F.',
      'pH tends to rise in warm water as carbon dioxide escapes more easily from the surface.',
      'The LSI increases with temperature — water balanced at 70°F may begin scaling at 90°F.',
      'Seasonal temperature changes are the most common reason for mid-summer chemistry problems.'
    ],
    sections: [
      {
        id: 'chlorine-and-heat',
        h2: 'Chlorine Depletion in Warm Water',
        body: 'Chlorine breaks down faster at higher temperatures. The rate of UV degradation increases, and the rate of reaction with organic contaminants speeds up as well. A pool that maintains 3 ppm FC comfortably at 72°F in April may struggle to hold 1.5 ppm at 85°F in July with the same dosing routine. Increase your chlorination frequency or dosage during heat waves and peak summer months. Consider switching to a higher-concentration chlorine product if depletion becomes difficult to manage.'
      },
      {
        id: 'ph-and-temperature',
        h2: 'Temperature and pH Drift',
        body: 'As water warms, carbon dioxide escapes from solution more readily. CO2 is naturally acidic, so when it leaves, pH rises. This is why pool pH tends to be higher in summer and why pools with waterfalls, fountains, or high-speed jets see faster pH rise — all of those features accelerate CO2 off-gassing. Increase the frequency of pH testing from weekly to every two to three days during summer.'
      },
      {
        id: 'lsi-and-temperature',
        h2: 'LSI Shifts with Temperature',
        body: 'Temperature is a significant variable in the Langelier Saturation Index formula. Water with an LSI of -0.1 at 68°F (well-balanced) may have an LSI of +0.4 at 90°F (beginning to scale) with identical pH, hardness, and alkalinity. This is especially important for hot tubs and heated pools. When adjusting chemistry for a season change or after filling with warm water, recalculate the LSI at the actual water temperature rather than assuming summer chemistry will match spring chemistry.'
      }
    ],
    examples: [
      {
        title: 'Opening a Pool After a Hot Spell',
        body: 'A pool is opened in April at 65°F water temperature with balanced chemistry (LSI -0.1). By July, the water is 88°F. Without any other change, the LSI is now approximately +0.3, right at the scaling threshold. Additionally, chlorine has been depleting faster than the April schedule accounts for. The pool owner needs to reduce pH slightly (from 7.4 to 7.2), increase chlorination frequency, and test more often.'
      }
    ],
    commonMistakes: [
      'Keeping the same chlorination schedule year-round without adjusting for warmer summer water.',
      'Not recalculating the LSI when water temperature rises significantly between seasons.',
      'Assuming that because chemistry was fine last week, it is still fine this week during a heat wave.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator', '/calculators/pool-chlorine-calculator'],
    relatedCharts: ['/pool-chemical-levels-chart'],
    relatedTopics: ['academy/fundamentals/how-water-balance-works', 'academy/water-balance/understanding-lsi', 'academy/fundamentals/pool-vs-hot-tub-chemistry'],
    relatedFormulas: ['formulas/lsi-formula'],
    relatedGlossary: ['glossary/langelier-saturation-index', 'glossary/chlorine-demand', 'glossary/ph'],
    sources: [src, src2]
  },
  {
    id: 'fund-06',
    slug: 'academy/fundamentals/why-water-testing-matters',
    title: 'Why Water Testing Matters',
    description: 'Understand why regular water testing is the most cost-effective pool maintenance habit and what happens when testing is skipped.',
    summary: 'Regular testing catches problems when they are cheap to fix. Skipping tests allows chemistry to drift into territory that damages equipment, harms swimmers, and costs far more to correct.',
    category: 'fundamentals',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['why test pool water', 'pool testing frequency', 'pool water testing importance', 'pool maintenance testing'],
    overview: 'Pool water testing is the single most cost-effective maintenance action a pool owner can take. A $2 test identifies problems that would cost hundreds or thousands of dollars to fix if left undetected.',
    keyFacts: [
      'Correcting an algae bloom costs 10–50x more than the chlorine that would have prevented it.',
      'Undetected low pH for weeks can permanently etch plaster surfaces.',
      'Most pool problems are invisible to the eye until they are already severe.',
      'Weekly testing is the minimum for any active pool; twice-weekly during peak summer.'
    ],
    sections: [
      {
        id: 'prevention-vs-cure',
        h2: 'Prevention vs. Cure',
        body: 'A full water test takes three minutes and costs under one dollar with a liquid test kit. Treating a serious algae bloom requires 10–20x the normal chlorine dose, possible filter cleaning, scrubbing, and up to a week of recovery time. Treating an acid-etched plaster surface requires draining, professional resurfacing, and significant expense. Every test you run is a low-cost check that keeps small deviations from becoming expensive problems.'
      },
      {
        id: 'invisible-problems',
        h2: 'Problems You Cannot See',
        body: 'Crystal-clear water can still be unsafe. Bacterial contamination sufficient to cause illness is invisible. Combined chlorine (chloramines) that irritate eyes and respiratory systems is invisible. Low pH that is slowly etching your plaster surface is invisible. High cyanuric acid that is making your 3 ppm chlorine reading nearly useless is invisible. Only testing reveals these conditions. Clear water is not necessarily safe or balanced water — testing is the only way to know.'
      },
      {
        id: 'testing-schedule',
        h2: 'How Often to Test',
        body: 'For pools: test free chlorine and pH twice per week during the summer swimming season and once per week in spring and autumn. Test total alkalinity and calcium hardness monthly. Test cyanuric acid at the start of the season and then monthly if you use stabiliser-containing tablets. For hot tubs: test before every soak session and again the following morning. Hot tub chemistry changes much faster than pool chemistry due to smaller volume and higher temperature.'
      }
    ],
    examples: [
      {
        title: 'Catching a Problem Early',
        body: 'A pool owner tests on Monday and finds FC at 0.8 ppm — below the 1.0 ppm minimum. They add chlorine that evening. On Thursday, the test reads 2.5 ppm — normal. The brief dip to 0.8 ppm is corrected before any bacterial proliferation can occur. Without Monday\'s test, FC might have reached zero by Wednesday, and by the weekend a cloudy, potentially contaminated pool would need emergency treatment.'
      }
    ],
    commonMistakes: [
      'Testing only when the water looks or smells wrong — by then, the problem is already advanced.',
      'Testing at the same spot every time (near the return jet) instead of mid-pool at elbow depth.',
      'Storing test strips or reagents in a hot or humid location, which degrades their accuracy over time.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator'],
    relatedResources: ['/resources/water-test-log', '/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/fundamentals/the-four-core-water-tests', 'academy/testing/how-often-to-test-water', 'academy/testing/common-testing-mistakes'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/free-chlorine', 'glossary/combined-chlorine', 'glossary/chlorine-demand'],
    sources: [src, src3]
  }
];
