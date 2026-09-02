'use strict';
// Academy – Sanitizers (6 articles)

const src = 'Pool & Hot Tub Alliance — Pool & Spa Operator Handbook, 2022';
const src2 = 'Taylor Technologies — Pool/Spa Water Chemistry Reference';
const src3 = 'CDC — Healthy Swimming Guidelines';

module.exports = [
  {
    id: 'san-01',
    slug: 'academy/sanitizers/understanding-free-chlorine',
    title: 'Understanding Free Chlorine',
    description: 'Learn what free chlorine is, how it kills pathogens, why pH controls its effectiveness, and how to maintain the right level in your pool.',
    summary: 'Free chlorine is the active disinfectant in your pool. Its effectiveness depends almost entirely on pH — understanding this relationship is the key to efficient chlorine management.',
    category: 'sanitizers',
    readingTime: '6 min read',
    lastReviewed: '2026-06-01',
    keywords: ['free chlorine', 'pool chlorine levels', 'hypochlorous acid', 'chlorine effectiveness pH'],
    overview: 'Free chlorine (FC) is the measure of active, available disinfectant in pool water. It kills bacteria, viruses, and algae on contact. However, its killing power is highly pH-dependent, which is why chlorine and pH must be managed together.',
    keyFacts: [
      'Target 1–3 ppm free chlorine for pools; 3–5 ppm for hot tubs.',
      'At pH 7.2, about 67% of free chlorine is in its most effective form (HOCl). At pH 8.0, this drops to 22%.',
      'Free chlorine is consumed continuously by sunlight, bathers, and organic matter.',
      'CYA (stabiliser) slows UV depletion but also reduces the active fraction of free chlorine.'
    ],
    sections: [
      {
        id: 'how-chlorine-works',
        h2: 'How Free Chlorine Sanitizes',
        body: 'When chlorine is added to pool water, it reacts with water to form hypochlorous acid (HOCl) and hypochlorite ion (OCl-). Hypochlorous acid is the active disinfectant — it penetrates the cell walls of bacteria and viruses and destroys them. Hypochlorite ion is much weaker. The ratio of HOCl to OCl- is determined by pH: lower pH produces more HOCl; higher pH shifts the balance toward less effective OCl-. This is why identical chlorine readings have very different sanitising power at different pH levels.'
      },
      {
        id: 'maintaining-free-chlorine',
        h2: 'Maintaining the Right Level',
        body: 'Pool free chlorine should stay between 1 and 3 ppm at all times. Below 1 ppm, sanitisation is inadequate and algae can begin to establish. Above 5 ppm, the water is uncomfortable for swimmers and may bleach swimwear or pool surfaces. In outdoor pools exposed to direct sunlight, without cyanuric acid, chlorine can deplete to zero within two to three hours. A target of 2–3 ppm provides a safety buffer against spikes in organic load or periods of higher-than-normal UV.'
      },
      {
        id: 'free-vs-combined',
        h2: 'Free Chlorine vs. Combined Chlorine',
        body: 'Total chlorine equals free chlorine plus combined chlorine. Combined chlorine (chloramines) forms when free chlorine reacts with nitrogen-containing compounds from bathers — sweat, urine, body oils. Chloramines are much weaker disinfectants than free chlorine and are responsible for the "pool smell" and eye irritation most people associate with chlorine. If your combined chlorine exceeds 0.5 ppm, shock treatment is needed to destroy it. Always test specifically for free chlorine (using a DPD kit) rather than total chlorine.'
      }
    ],
    examples: [
      {
        title: 'The pH-Chlorine Relationship in Practice',
        body: 'Two pools both read 2 ppm free chlorine. Pool A has pH 7.2; Pool B has pH 8.0. Pool A has approximately 1.34 ppm of active HOCl. Pool B has only 0.44 ppm of active HOCl — less than one-third of Pool A\'s effective sanitiser level, despite the same total reading. Lowering Pool B\'s pH to 7.4 increases effective chlorine without adding a single drop of chlorine product.'
      }
    ],
    commonMistakes: [
      'Keeping pH above 7.8 while wondering why chlorine keeps depleting quickly.',
      'Using an OTO test that measures total chlorine and treating that result as free chlorine.',
      'Adding chlorine during the day in an outdoor pool without CYA — most of it will be destroyed by UV before the pump can circulate it.'
    ],
    relatedCalculators: ['/calculators/pool-chlorine-calculator', '/calculators/hot-tub-chlorine-calculator', '/calculators/chemical-calculator'],
    relatedResources: ['/resources/pool-chemical-log-sheet'],
    relatedTopics: ['academy/sanitizers/combined-chlorine-explained', 'academy/sanitizers/breakpoint-chlorination', 'academy/water-balance/understanding-ph', 'academy/water-balance/understanding-cyanuric-acid'],
    relatedFormulas: ['formulas/liquid-chlorine-formula'],
    relatedGlossary: ['glossary/free-chlorine', 'glossary/hypochlorous-acid', 'glossary/combined-chlorine', 'glossary/ph'],
    sources: [src, src3]
  },
  {
    id: 'san-02',
    slug: 'academy/sanitizers/combined-chlorine-explained',
    title: 'Combined Chlorine Explained',
    description: 'Learn what combined chlorine is, why it forms in pools, how to measure it, and why it causes the irritating pool smell many people mistake for too much chlorine.',
    summary: 'Combined chlorine is spent, ineffective chlorine bound to nitrogen compounds. It causes the eye irritation and pool smell that most people mistakenly blame on too much free chlorine.',
    category: 'sanitizers',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['combined chlorine', 'chloramines pool', 'pool smell chlorine', 'combined chlorine removal'],
    overview: 'Combined chlorine (CC) forms when free chlorine reacts with nitrogen compounds from bather waste. Once formed, combined chlorine is a weak disinfectant and a strong irritant. Eliminating it requires breakpoint chlorination.',
    keyFacts: [
      'Combined chlorine above 0.5 ppm is the action threshold — shock treatment is needed.',
      'The "pool smell" is chloramines, not free chlorine — the problem is too little effective chlorine, not too much.',
      'Combined chlorine is calculated as: CC = Total Chlorine minus Free Chlorine.',
      'Shocking to breakpoint destroys combined chlorine by converting it back to inert compounds.'
    ],
    sections: [
      {
        id: 'how-combined-chlorine-forms',
        h2: 'How Combined Chlorine Forms',
        body: 'Every bather who enters a pool introduces nitrogen-containing compounds: ammonia in sweat and urine, amino acids from skin, and nitrogenous compounds in sunscreen and cosmetics. Free chlorine reacts with these compounds to form chloramines (combined chlorine). The most common pool chloramine is monochloramine (NH2Cl), followed by dichloramine (NHCl2) and nitrogen trichloride (NCl3). All are far less effective as disinfectants than free chlorine, and dichloramine and nitrogen trichloride are the primary sources of the irritating "pool smell."'
      },
      {
        id: 'measuring-combined-chlorine',
        h2: 'Measuring Combined Chlorine',
        body: 'Combined chlorine is not measured directly — it is calculated. A DPD-1 test measures free chlorine; a DPD-3 test (or using DPD-1 plus DPD-3 reagent) measures total chlorine. Combined chlorine equals total chlorine minus free chlorine. If your free chlorine reads 2.0 ppm and your total chlorine reads 2.7 ppm, combined chlorine is 0.7 ppm — above the 0.5 ppm threshold that indicates a shock is needed. Test both free and total chlorine at least once a week during peak swimming season.'
      },
      {
        id: 'eliminating-combined-chlorine',
        h2: 'Eliminating Combined Chlorine',
        body: 'The only way to destroy combined chlorine in a pool is breakpoint chlorination — adding enough free chlorine to drive the total to at least 10 times the combined chlorine level. At this concentration, chloramines are chemically destroyed. Once breakpoint is reached, combined chlorine drops to near zero and the pool smells clean again. Shock treatments are formulated to reach breakpoint. Always shock in the evening to prevent UV from destroying the concentrated chlorine before it can do its work.'
      }
    ],
    examples: [
      {
        title: 'Identifying a Combined Chlorine Problem',
        body: 'After a pool party, the water smells strongly and guests report eye irritation. A test shows FC 2.0 ppm and TC 3.2 ppm, giving CC of 1.2 ppm — well above the 0.5 ppm threshold. The shock dose needed is at least 10 x 1.2 = 12 ppm of free chlorine added to the pool. Using the pool shock calculator for a 15,000-gallon pool, that translates to approximately 6 lbs of calcium hypochlorite shock added after dark.'
      }
    ],
    commonMistakes: [
      'Reducing chlorine when the pool smells bad — the problem is combined chlorine (too little active chlorine), not too much.',
      'Only measuring free chlorine and never measuring total chlorine, so combined chlorine goes undetected.',
      'Shocking during the day, when sunlight destroys the high chlorine dose before it can reach breakpoint.'
    ],
    relatedCalculators: ['/calculators/pool-shock-calculator', '/calculators/chemical-calculator'],
    relatedResources: ['/resources/pool-shock-log'],
    relatedTopics: ['academy/sanitizers/understanding-free-chlorine', 'academy/sanitizers/breakpoint-chlorination', 'academy/sanitizers/shock-treatments-explained'],
    relatedFormulas: ['formulas/shock-formula'],
    relatedGlossary: ['glossary/combined-chlorine', 'glossary/free-chlorine', 'glossary/breakpoint-chlorination', 'glossary/chloramine'],
    sources: [src, src3]
  },
  {
    id: 'san-03',
    slug: 'academy/sanitizers/breakpoint-chlorination',
    title: 'Breakpoint Chlorination',
    description: 'Learn what breakpoint chlorination is, how to calculate the dose needed to destroy combined chlorine, and how to execute it correctly.',
    summary: 'Breakpoint chlorination destroys combined chlorine by adding free chlorine equal to 10 times the combined chlorine reading. This is the only reliable way to eliminate chloramines from a pool.',
    category: 'sanitizers',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['breakpoint chlorination', 'superchlorination pool', 'chloramine removal', 'breakpoint shock dose'],
    overview: 'Breakpoint chlorination is the process of adding enough free chlorine to chemically destroy all combined chlorine (chloramines) in pool water. The required dose is at least 10 times the measured combined chlorine level.',
    keyFacts: [
      'The breakpoint dose is 10 times the combined chlorine level, measured in ppm.',
      'Below breakpoint, adding chlorine actually increases combined chlorine before it starts decreasing it.',
      'Breakpoint must be reached in one dose — partial shock treatments leave more combined chlorine behind.',
      'Water should not be re-entered until free chlorine drops below 5 ppm after breakpoint treatment.'
    ],
    sections: [
      {
        id: 'the-chemistry',
        h2: 'The Chemistry Behind Breakpoint',
        body: 'When free chlorine reacts with ammonia in pool water, it forms chloramines in stages. At low chlorine-to-ammonia ratios, monochloramine forms and then dichloramine. As the ratio increases further, a "breakpoint" is reached where further chlorine addition converts chloramines into nitrogen gas, which escapes the pool. The breakpoint occurs at a molar ratio of about 7.6:1 (Cl:N), which approximately corresponds to 10x the combined chlorine level in ppm. Beyond the breakpoint, the pool is clear of chloramines and free chlorine rises sharply.'
      },
      {
        id: 'calculating-the-dose',
        h2: 'Calculating the Dose',
        body: 'Step 1: Test both free chlorine and total chlorine using a DPD test kit. Step 2: Calculate combined chlorine (CC = Total - Free). Step 3: Multiply CC by 10 to find the ppm of free chlorine you need to add. Step 4: Add the current free chlorine reading to get the target free chlorine level. Step 5: The pool shock calculator does not accept a combined-chlorine reading or compute this target automatically -- it offers flat FC-increase presets (5, 10, 15, or 20 ppm) for a chosen product. Select the closest preset, or apply the shock dose formula directly (target ppm increase x pool volume x 0.013344 / product\'s available-chlorine %) for an exact figure. Always use a non-stabilised shock (calcium hypochlorite or lithium hypochlorite) for breakpoint chlorination.'
      },
      {
        id: 'executing-breakpoint',
        h2: 'Executing Breakpoint Correctly',
        body: 'Add the full calculated shock dose after sunset — this prevents UV from destroying the high chlorine concentration before it reaches breakpoint. Pre-dissolve granular shock in a bucket of pool water before adding, or distribute liquid chlorine evenly around the pool. Run the pump and filter continuously for at least 8 hours. Test free chlorine the following morning. If it has dropped below 5 ppm, the pool is safe to enter. If it is still above 5 ppm, wait and test again before allowing swimming.'
      }
    ],
    examples: [
      {
        title: 'Breakpoint Calculation',
        body: 'Pool test results: FC 2.0 ppm, TC 2.8 ppm. CC = 2.8 - 2.0 = 0.8 ppm. Breakpoint target = 0.8 x 10 = 8 ppm of FC to add. Target FC level = existing 2.0 + 8.0 = 10.0 ppm. For a 15,000-gallon pool using 65% calcium hypochlorite, the shock dose formula (8 ppm x 15,000 gal x 0.013344 / 65) gives approximately 1.54 lbs to raise FC by 8 ppm. Add after dark, run the pump overnight, and test in the morning.'
      }
    ],
    commonMistakes: [
      'Using a stabilised chlorine shock (trichlor or dichlor) for breakpoint — these add CYA and will not reach the required concentration as efficiently.',
      'Adding shock in multiple small doses over several days, which drives combined chlorine through the intermediate peak without reaching the true breakpoint.',
      'Not testing total chlorine before shocking — without knowing the CC level, you cannot calculate the correct dose.'
    ],
    relatedCalculators: ['/calculators/pool-shock-calculator', '/calculators/chemical-calculator'],
    relatedResources: ['/resources/pool-shock-log'],
    relatedTopics: ['academy/sanitizers/combined-chlorine-explained', 'academy/sanitizers/shock-treatments-explained', 'academy/sanitizers/understanding-free-chlorine'],
    relatedFormulas: ['formulas/shock-formula'],
    relatedGlossary: ['glossary/breakpoint-chlorination', 'glossary/combined-chlorine', 'glossary/superchlorination', 'glossary/calcium-hypochlorite'],
    sources: [src, src2, 'Indiana Department of Health, Environmental Public Health Division — How To Shock The Pool (Chlorinate To Breakpoint), 2022']
  },
  {
    id: 'san-04',
    slug: 'academy/sanitizers/liquid-chlorine-vs-tablets',
    title: 'Liquid Chlorine vs. Tablets',
    description: 'Compare liquid chlorine (sodium hypochlorite) and chlorine tablets (trichlor/dichlor) to decide which is right for your pool.',
    summary: 'Liquid chlorine raises FC immediately with no side effects on CYA or pH. Tablets are convenient but add cyanuric acid with every dose. Understanding the tradeoff helps you choose the right product.',
    category: 'sanitizers',
    readingTime: '6 min read',
    lastReviewed: '2026-06-01',
    keywords: ['liquid chlorine vs tablets', 'pool chlorine type', 'trichlor tablets pool', 'sodium hypochlorite pool'],
    overview: 'Liquid chlorine (sodium hypochlorite) and chlorine tablets (trichlor) are the two most common pool sanitizer products. They have the same end goal but very different chemistry and side effects.',
    keyFacts: [
      'Liquid chlorine (sodium hypochlorite) is typically 10–12.5% strength and raises pH slightly.',
      'Trichlor tablets are 90% available chlorine but also add cyanuric acid with every dose.',
      'CYA buildup from tablets can reach 80–100 ppm in a single season without a partial drain.',
      'Liquid chlorine is the better choice when CYA is already at or above the target range.'
    ],
    sections: [
      {
        id: 'liquid-chlorine',
        h2: 'Liquid Chlorine (Sodium Hypochlorite)',
        body: 'Liquid chlorine is sold as a 10–12.5% sodium hypochlorite solution. When added to pool water, it dissociates into sodium and hypochlorite ions. It raises pH slightly (typically by 0.1–0.2 per dose for average pools) and does not add cyanuric acid. Liquid chlorine is the standard choice for regular sanitisation and for shock treatments because it takes effect immediately and has predictable, simple chemistry. Its main drawback is that it degrades over time in storage — use it within 60 days of purchase and store it away from heat and light.'
      },
      {
        id: 'chlorine-tablets',
        h2: 'Chlorine Tablets (Trichlor)',
        body: 'Trichlor (trichloroisocyanuric acid) tablets are a convenient, slow-dissolving form of chlorine. Each tablet contains approximately 90% available chlorine but also contains cyanuric acid as a stabiliser. Every pound of trichlor added to a pool raises CYA by approximately 0.6 ppm for every 10,000 gallons. Used as the primary sanitiser through a full season, tablets can drive CYA above 80–100 ppm — the level at which chlorine effectiveness is significantly reduced. Tablets also lower pH with each dose, so pH increases are typically needed when using tablets as the primary sanitiser.'
      },
      {
        id: 'which-to-choose',
        h2: 'Which to Choose',
        body: 'If your CYA is already at or above 50 ppm, switch to liquid chlorine for regular sanitisation. If your CYA is low or you are starting a new season, tablets are acceptable for daily maintenance dosing and are very convenient for slow-dissolving feeders and floaters. For shock treatments, always use liquid chlorine, calcium hypochlorite, or non-stabilised shock — never use trichlor or dichlor tablets as shock because they add unneeded CYA at the high doses required for shocking.'
      }
    ],
    examples: [
      {
        title: 'Preventing CYA Buildup with Tablets',
        body: 'A 15,000-gallon pool using two 3-inch trichlor tablets per week adds approximately 0.9 lbs of product per week. Over a 20-week season, that is 18 lbs of trichlor. Each pound adds 0.6 ppm CYA per 10,000 gallons, so 18 lbs adds approximately 10.8 x (15,000/10,000) = 16 ppm CYA per week — no, per season. Starting from 30 ppm in spring, CYA reaches roughly 48 ppm by end of season. That is within range, but in a second season it would reach 66 ppm. Testing CYA monthly and doing a partial drain when it exceeds 60 ppm prevents buildup.'
      }
    ],
    commonMistakes: [
      'Using trichlor tablets as shock and accumulating CYA to levels that make the pool unsanitisable.',
      'Not testing CYA monthly when tablets are the primary sanitiser — CYA accumulates invisibly.',
      'Storing liquid chlorine for more than 60 days, by which time its concentration has degraded significantly.'
    ],
    relatedCalculators: ['/calculators/pool-chlorine-calculator', '/calculators/pool-cyanuric-acid-calculator'],
    relatedResources: ['/resources/pool-chemical-log-sheet'],
    relatedTopics: ['academy/sanitizers/shock-treatments-explained', 'academy/water-balance/understanding-cyanuric-acid', 'academy/sanitizers/understanding-free-chlorine'],
    relatedFormulas: ['formulas/liquid-chlorine-formula', 'formulas/cya-formula'],
    relatedGlossary: ['glossary/sodium-hypochlorite', 'glossary/trichlor', 'glossary/dichlor', 'glossary/cyanuric-acid'],
    sources: [src, src2]
  },
  {
    id: 'san-05',
    slug: 'academy/sanitizers/shock-treatments-explained',
    title: 'Shock Treatments Explained',
    description: 'Learn what pool shock is, when to shock your pool, which shock product to use, and how to do it correctly.',
    summary: 'Shocking a pool means adding a large chlorine dose to destroy combined chlorine, kill algae, and reset water clarity. The type of shock and the timing of application matter significantly.',
    category: 'sanitizers',
    readingTime: '6 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool shock treatment', 'when to shock pool', 'pool shock types', 'calcium hypochlorite shock'],
    overview: 'Pool shock is a high-dose chlorine treatment used to destroy combined chlorine (chloramines), kill algae, and clear turbid water. Shocking is necessary regularly, not just in emergencies.',
    keyFacts: [
      'Shock weekly during peak swimming season and immediately after heavy bather load or storm.',
      'Always shock after dark — UV destroys high chlorine concentrations before they can work.',
      'Calcium hypochlorite (cal-hypo) is the most common and effective shock type.',
      'Stabilised shock (dichlor) adds CYA with every dose and should not be used repeatedly.'
    ],
    sections: [
      {
        id: 'why-shock',
        h2: 'Why Pools Need Shocking',
        body: 'Chlorine reacts with bather waste, algae, and organic contaminants in the water. Some of these reactions produce combined chlorine (chloramines), which are poor disinfectants and the source of eye irritation and pool odour. Regular free chlorine doses cannot destroy chloramines efficiently — reaching breakpoint concentration is required. Additionally, algae establish faster in pools with even brief periods of low chlorine, and shock levels of chlorine are needed to kill established algae cells.'
      },
      {
        id: 'types-of-shock',
        h2: 'Types of Shock',
        body: 'Calcium hypochlorite (cal-hypo) is the standard pool shock, sold as a granular powder in 1-lb bags at 65–73% available chlorine. It does not add CYA and is ideal for breakpoint chlorination. Lithium hypochlorite is similar but faster-dissolving and suitable for vinyl liners that could be bleached by undissolved granules. Sodium dichloro-isocyanurate (dichlor) is a stabilised shock — it works quickly but adds CYA with each dose, so it should not be used repeatedly through a season. Non-chlorine shock (potassium monopersulfate or MPS) oxidises organic contaminants but does not raise free chlorine — it is useful after each use of a hot tub.'
      },
      {
        id: 'how-to-shock',
        h2: 'How to Shock Correctly',
        body: 'Test and record current chemistry before shocking. Calculate the dose needed based on pool volume and target ppm increase using the shock calculator. Add the dose after sunset. For granular shock, pre-dissolve in a bucket of pool water first — never add granules directly to the skimmer or onto a vinyl liner. Broadcast the dissolved solution around the pool perimeter with the pump running. Run the filter overnight and test free chlorine in the morning. Do not allow swimming until FC drops to 5 ppm or below.'
      }
    ],
    examples: [
      {
        title: 'Weekly Shock Routine',
        body: 'Every Friday evening, a pool owner tests their 20,000-gallon pool (FC 2.5, TC 3.1, so CC 0.6 ppm). The CC is above 0.5 ppm. They calculate a dose to raise FC by 6 ppm (10 x 0.6 = 6): the shock dose formula (6 ppm x 20,000 gal x 0.013344 / 65) gives approximately 1.54 lbs of 65% cal-hypo. They pre-dissolve it in a bucket, broadcast after dark, and run the pump overnight. Saturday morning FC reads 3.0 ppm — normal. The pool is clean, clear, and ready for the weekend.'
      }
    ],
    commonMistakes: [
      'Shocking during daylight hours — most of the chlorine is destroyed by UV before it can work.',
      'Adding granular shock directly to the skimmer, which concentrates it and can damage equipment.',
      'Using dichlor shock every week and not testing CYA, allowing it to build to levels that make the pool unmanageable.'
    ],
    relatedCalculators: ['/calculators/pool-shock-calculator', '/calculators/hot-tub-shock-calculator'],
    relatedResources: ['/resources/pool-shock-log'],
    relatedTopics: ['academy/sanitizers/breakpoint-chlorination', 'academy/sanitizers/combined-chlorine-explained', 'academy/troubleshooting/green-water'],
    relatedFormulas: ['formulas/shock-formula'],
    relatedGlossary: ['glossary/shock', 'glossary/calcium-hypochlorite', 'glossary/superchlorination', 'glossary/breakpoint-chlorination'],
    sources: [src, src2]
  },
  {
    id: 'san-06',
    slug: 'academy/sanitizers/bromine-vs-chlorine',
    title: 'Bromine vs. Chlorine',
    description: 'Compare bromine and chlorine as pool and hot tub sanitizers, including effectiveness, cost, pH effects, and when each is the better choice.',
    summary: 'Bromine is more stable at high temperatures and more effective in hot tubs. Chlorine is the standard for outdoor pools. The choice depends on pool type, location, and management preferences.',
    category: 'sanitizers',
    readingTime: '6 min read',
    lastReviewed: '2026-06-01',
    keywords: ['bromine vs chlorine hot tub', 'pool bromine', 'chlorine alternatives', 'spa sanitizer comparison'],
    overview: 'Both bromine and chlorine effectively sanitise pool and spa water, but they have different chemistry, costs, and optimal use cases. Understanding the differences helps you choose the right product.',
    keyFacts: [
      'Bromine is more stable than chlorine at temperatures above 86°F, making it the preferred choice for hot tubs.',
      'Bromine cannot be stabilised against UV — outdoor pools in direct sunlight will have very high bromine consumption.',
      'Bromine works over a wider pH range (7.0–8.0) than chlorine (7.2–7.6 recommended).',
      'Once you switch a pool to bromine, switching back to chlorine requires a full drain because residual bromine reacts with chlorine.'
    ],
    sections: [
      {
        id: 'how-bromine-works',
        h2: 'How Bromine Works',
        body: 'Bromine sanitises water through the formation of hypobromous acid (HOBr), which works similarly to hypochlorous acid in chlorine-treated water. Unlike chlorine, when bromine reacts with nitrogen compounds from bather waste it forms bromamines, which are actually effective disinfectants — not irritants like chloramines. This means that bromine does not require breakpoint chlorination to restore its effectiveness. Bromine also remains more effective at higher pH (up to 8.0) compared to chlorine, giving more flexibility in pH management for spas.'
      },
      {
        id: 'chlorine-comparison',
        h2: 'Comparing to Chlorine',
        body: 'Chlorine is cheaper per dose, more widely available, and the standard for outdoor pools where UV stabilisation with CYA is practical. Bromine has no effective UV stabiliser, so outdoor bromine pools require very high product consumption in direct sunlight — often making them cost-prohibitive. Chlorine at pH 7.2–7.6 is highly effective; bromine is more forgiving of pH drift. Both achieve the same end result when used correctly. Bromine is available in slow-dissolving tablets, two-part systems (sodium bromide + oxidiser), and BCDMH tablets (the most common format for hot tubs).'
      },
      {
        id: 'when-to-choose-bromine',
        h2: 'When to Choose Bromine',
        body: 'Choose bromine for indoor pools, indoor spas, and hot tubs where UV is not a factor. It is also a good choice for people who are chlorine-sensitive (some people experience skin or respiratory reactions to chloramines more intensely than others) and for applications where pH fluctuates more than ideal. Avoid bromine for outdoor pools in direct sunlight, where the cost of the product to compensate for UV loss becomes significant. Also avoid mixing sanitisers — never add chlorine to a bromine pool without a full drain and refill, as the reaction produces unwanted by-products.'
      }
    ],
    examples: [
      {
        title: 'Setting Up a Hot Tub with Bromine',
        body: 'A homeowner installs a new hot tub and opts for bromine. They add sodium bromide (the bromide bank) to the freshly filled water, then add an oxidiser (potassium monopersulfate or chlorine) to activate the bromide bank and convert it to bromine. Testing shows 4.0 ppm bromine. They maintain levels by adding BCDMH tablets to a floater. After each soak session, they add a small MPS oxidiser dose to convert spent bromides back to active bromine. The system self-maintains with simple weekly water tests.'
      }
    ],
    commonMistakes: [
      'Adding chlorine shock to a bromine pool without understanding that this combination creates unwanted by-products.',
      'Using bromine in an outdoor pool without accounting for the significantly higher consumption rate due to UV.',
      'Confusing the different bromine target reading (3–6 ppm) with chlorine targets (1–3 ppm) — they use the same scale but have different ideal ranges.'
    ],
    relatedCalculators: ['/calculators/hot-tub-chlorine-calculator', '/calculators/chemical-calculator'],
    relatedResources: ['/resources/hot-tub-maintenance-log'],
    relatedTopics: ['academy/sanitizers/understanding-free-chlorine', 'academy/sanitizers/shock-treatments-explained', 'academy/hot-tubs/weekly-spa-maintenance'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/bromine', 'glossary/bcdmh', 'glossary/free-chlorine', 'glossary/oxidizer'],
    sources: [src, src2]
  }
];
