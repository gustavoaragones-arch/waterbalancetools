'use strict';
// Academy – Troubleshooting (6 articles)

const src = 'Pool & Hot Tub Alliance — Pool & Spa Operator Handbook, 2022';
const src2 = 'Taylor Technologies — Pool/Spa Water Chemistry Reference';

module.exports = [
  {
    id: 'ts-01',
    slug: 'academy/troubleshooting/cloudy-water',
    title: 'Cloudy Pool Water: Causes and Solutions',
    description: 'Learn the four main causes of cloudy pool water and the step-by-step process to diagnose and clear it correctly.',
    summary: 'Cloudy water has four distinct causes — each with a different solution. Treating the wrong cause wastes money and time. This guide shows you how to diagnose first.',
    category: 'troubleshooting',
    readingTime: '6 min read',
    lastReviewed: '2026-06-01',
    keywords: ['cloudy pool water', 'milky pool water', 'how to clear cloudy pool', 'pool water turbidity'],
    overview: 'Cloudy pool water is one of the most common pool problems. It is almost never a single cause — run-down chemistry, filtration issues, and environmental factors often combine. Correct diagnosis before treatment saves significant time and money.',
    keyFacts: [
      'The four causes of cloudy water: low sanitiser, high pH, filtration failure, and algae bloom in early stages.',
      'Test free chlorine, pH, and combined chlorine first — chemistry problems account for most cloudiness.',
      'Flocculant sinks particles for vacuuming; clarifier coagulates particles for filter capture.',
      'Never add clarifier during or immediately after a shock treatment — it interferes with the chlorine dose.'
    ],
    sections: [
      {
        id: 'diagnosing-cloudy-water',
        h2: 'Diagnosing Cloudy Water',
        body: 'Step 1: Run a complete water test. Cloudy water from chemistry problems shows low free chlorine (below 1 ppm), high pH (above 7.8), or both. Step 2: Check your filter pressure. A clogged or channelled filter passes particles back into the pool. Step 3: Look at the colour. Dull white-grey cloudiness is typically fine particle suspension. A greenish tint indicates early algae. A chalky white indicates possible calcium precipitation from over-balanced water. Each colour tells a different story and points toward a different solution.'
      },
      {
        id: 'chemical-treatment',
        h2: 'Chemical Treatment for Cloudiness',
        body: 'If cloudiness is from chemistry: first bring pH into the 7.2–7.6 range, then shock the pool to 10 ppm FC or higher. Run the filter 24 hours continuously. Most chemistry-based cloudiness clears within 12–24 hours with correct chemistry and good filtration. If cloudiness persists after chemistry is balanced, add a pool clarifier (a coagulant) to cause particles to clump and be captured by the filter. Follow label dosing directions — more is not better with clarifiers and can cause the filter to overload.'
      },
      {
        id: 'filtration-check',
        h2: 'Checking the Filter',
        body: 'A filter that is clogged, channelled, or overdue for service will pass fine particles back into the pool. Check filter pressure — if it is 8–10 psi above the clean baseline, backwash or clean the filter. For sand filters, channelling (where water bypasses the sand media through channels rather than flowing through it) produces consistent cloudiness that does not respond to chemistry corrections. If backwashing does not improve the filter pressure and cloudiness, replacing the sand may be necessary. Run the filter continuously (24 hours) during a cloudiness correction — do not rely on the standard run schedule.'
      }
    ],
    examples: [
      {
        title: 'Clearing Cloudy Water in 48 Hours',
        body: 'Pool tests: FC 0.8 ppm, pH 7.9, TA 110 ppm. Cloudiness is chemistry-based. Day 1 morning: add muriatic acid to lower pH to 7.4. Afternoon: shock pool to 10 ppm FC using liquid chlorine. Run filter 24 hours. Day 2 morning: water is noticeably clearer. FC reads 4 ppm (chlorine still active). Add clarifier at sunset. Day 2 evening: water is mostly clear. Day 3: run one more filter cycle and backwash. Pool is clear. No flocculant was needed because chemistry was corrected quickly.'
      }
    ],
    commonMistakes: [
      'Adding clarifier without correcting chemistry first — clarifier cannot clear water that has inadequate chlorine.',
      'Not running the filter continuously during a cloudiness episode — the 8-hour standard schedule is insufficient for clearing suspended particles.',
      'Using flocculant without planning to vacuum to waste — flocculant sinks particles to the bottom where they will cloud up again if disturbed.'
    ],
    relatedCalculators: ['/calculators/pool-chlorine-calculator', '/calculators/pool-shock-calculator'],
    relatedResources: ['/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/troubleshooting/green-water', 'academy/sanitizers/shock-treatments-explained', 'academy/water-balance/understanding-ph'],
    relatedFormulas: ['formulas/shock-formula'],
    relatedGlossary: ['glossary/turbidity', 'glossary/clarifier', 'glossary/flocculant', 'glossary/free-chlorine'],
    sources: [src, src2]
  },
  {
    id: 'ts-02',
    slug: 'academy/troubleshooting/green-water',
    title: 'Green Pool Water: How to Fix It',
    description: 'Learn what causes green pool water, how to tell different types of algae apart, and the step-by-step protocol to restore clear, safe water.',
    summary: 'Green water means algae is established. The fix requires shock chlorination, physical brushing, continuous filtration, and a systematic rebalancing process over 24–72 hours.',
    category: 'troubleshooting',
    readingTime: '7 min read',
    lastReviewed: '2026-06-01',
    keywords: ['green pool water', 'pool algae treatment', 'how to fix green pool', 'pool algae removal'],
    overview: 'Green pool water is an algae bloom. Once algae is established, standard chlorine dosing is insufficient — a shock chlorination at 30 ppm or higher is required, combined with brushing, continuous filtration, and follow-up chemistry.',
    keyFacts: [
      'Green algae blooms typically start when FC drops below 1 ppm for 24 hours or more.',
      'The shock dose for an active green pool is 30 ppm FC — ten times the normal level.',
      'Brushing algae off surfaces is essential — dead algae becomes filter media that reduces filter efficiency.',
      'Do not add algaecide before shock — algaecide is a maintenance supplement, not a treatment for established algae.'
    ],
    sections: [
      {
        id: 'why-water-turns-green',
        h2: 'Why Pool Water Turns Green',
        body: 'Algae spores are present in virtually all outdoor pool water. They are kept from blooming by adequate free chlorine. When FC drops below the effective minimum — often due to high CYA, high pH, extended sun exposure without adequate stabiliser, or missed maintenance — algae begins to multiply rapidly. A single warm day with zero free chlorine can start a visible bloom within 24 hours. Once visible, the algae has already established a biofilm on pool surfaces that must be physically disrupted to allow chemicals to reach all the cells.'
      },
      {
        id: 'treatment-protocol',
        h2: 'The Green Pool Treatment Protocol',
        body: 'Step 1: Test pH, alkalinity, and CYA. Adjust pH to 7.2 (lower end — maximises chlorine activity). Step 2: Brush all surfaces vigorously to break up biofilm. Step 3: Calculate and add enough shock to raise FC to 30 ppm for a green pool (use the shock calculator). Use liquid chlorine or cal-hypo. Step 4: Run the filter 24 hours continuously. Step 5: Test FC every 8 hours. If FC drops below 10 ppm overnight, add more chlorine to maintain the high level. Step 6: Once the water turns from green to cloudy grey-white (dead algae), vacuum to waste or backwash frequently to remove dead cells. Step 7: Allow FC to return to normal range before re-entry.'
      },
      {
        id: 'after-treatment',
        h2: 'After the Bloom',
        body: 'Once water is clear, run a full water test and correct any out-of-range parameters. Dead algae that was not removed by filtration or vacuuming may leave a dull grey haze — a clarifier dose and one more backwash cycle will address this. After any algae event, check whether CYA is above 80 ppm (a major contributing factor) and plan a partial drain if necessary. Identify the root cause of the FC drop that allowed the algae to establish — typically a missed maintenance day, equipment failure, or a storm — and adjust your routine to prevent recurrence.'
      }
    ],
    examples: [
      {
        title: 'Weekend Algae Recovery',
        body: 'A homeowner returns from a week away to find a 15,000-gallon pool turned bright green. FC is zero, pH 8.2, CYA 60 ppm. Friday evening: lower pH to 7.2 with acid. Brush all surfaces. Add 6 gallons of liquid chlorine (10% sodium hypochlorite) to reach approximately 30 ppm FC. Run filter continuously. Saturday morning: water is a murky teal-grey — algae is dying. FC reads 12 ppm — add more chlorine to maintain above 10 ppm. Saturday evening: water is hazy grey. Vacuum dead algae to waste. Sunday: water is clear. Run full test and balance chemistry.'
      }
    ],
    commonMistakes: [
      'Adding algaecide to a green pool without shocking first — algaecide assists healthy chemistry but cannot overcome an active bloom.',
      'Turning off the filter after shocking because the water looks clear — the dead algae is still in suspension and will cloud the pool again within hours without filtration.',
      'Not addressing the root cause (typically high CYA or missed maintenance) that allowed the algae to bloom, leading to a recurring problem every few weeks.'
    ],
    relatedCalculators: ['/calculators/pool-shock-calculator', '/calculators/pool-chlorine-calculator'],
    relatedResources: ['/resources/pool-shock-log'],
    relatedTopics: ['academy/troubleshooting/cloudy-water', 'academy/sanitizers/shock-treatments-explained', 'academy/water-balance/understanding-cyanuric-acid'],
    relatedFormulas: ['formulas/shock-formula'],
    relatedGlossary: ['glossary/green-algae', 'glossary/algae-bloom', 'glossary/superchlorination', 'glossary/chlorine-demand'],
    sources: [src, src2]
  },
  {
    id: 'ts-03',
    slug: 'academy/troubleshooting/foaming-hot-tubs',
    title: 'Foaming Hot Tubs: Causes and Solutions',
    description: 'Learn what causes hot tub foam, how to identify whether it is from chemistry or organics, and how to eliminate it permanently.',
    summary: 'Hot tub foam almost always indicates organic contamination from bathers or soap residue. A water change is the fastest long-term fix, but several short-term measures can reduce it.',
    category: 'troubleshooting',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['hot tub foam', 'foamy spa water', 'how to stop hot tub foaming', 'spa water foam causes'],
    overview: 'Foam in a hot tub is a surface tension problem caused by organic compounds that lower water\'s surface tension. Body oils, cosmetics, soap residue, and high TDS are the main causes.',
    keyFacts: [
      'Foam in a hot tub almost always indicates organic contamination — body oils, lotions, detergent residue in swimwear.',
      'Anti-foam products mask the symptom but do not address the cause.',
      'Heavy foaming in water over 3 months old is a strong sign the water needs to be replaced.',
      'High TDS (total dissolved solids) above 1,500 ppm over baseline lowers surface tension and promotes foaming.'
    ],
    sections: [
      {
        id: 'what-causes-foam',
        h2: 'What Causes Hot Tub Foam',
        body: 'Foam forms when water surface tension is reduced by surfactants — compounds that reduce the attraction between water molecules. In a hot tub, the main sources of surfactants are body oils and sweat, cosmetics and lotions, soap or detergent residue in swimwear (from home laundry), and chemical by-products that accumulate over time (TDS). The jets, which inject air into the water, make the foam worse by mechanically incorporating air into the surfactant-laden water. A fresh, well-maintained hot tub with balanced chemistry should produce minimal foam.'
      },
      {
        id: 'testing-for-cause',
        h2: 'Identifying the Source',
        body: 'To determine whether foam is from chemistry or organics: take a handful of water and try to create foam by rubbing your hands together. If the water foams easily, it has significant surfactant contamination. Also test TDS (total dissolved solids) — a TDS more than 1,500 ppm above your fill water baseline indicates the water has accumulated enough dissolved material that a water change is needed. Test free chlorine — very low FC allows organic build-up to accumulate faster because there is no oxidation of organic compounds.'
      },
      {
        id: 'eliminating-foam',
        h2: 'Eliminating Foam',
        body: 'Short-term: a dose of liquid defoamer (anti-foam) will immediately collapse existing foam but will not address the cause. Shock the water with non-chlorine oxidiser (MPS/potassium monopersulfate) or chlorine shock to oxidise organic contaminants. Rinse swimwear in plain water (no detergent) before use. Long-term: if the water is more than 3 months old or if TDS is elevated, drain and refill. Set up a regular hot tub maintenance schedule with weekly oxidiser doses to prevent organic accumulation. Shower before entering the hot tub.'
      }
    ],
    examples: [
      {
        title: 'Tracing Foam to Swimwear Detergent',
        body: 'A hot tub foams excessively every time a particular bather uses it. The water tests balanced and TDS is normal. The problem is traced to synthetic swimwear washed with fabric softener — softener leaves a silicone-based residue that causes intense foaming. Washing the swimwear in plain water multiple times removes the residue. The foam problem disappears completely without any water change or chemical treatment.'
      }
    ],
    commonMistakes: [
      'Adding anti-foam products repeatedly without investigating the cause — the underlying contamination continues to build.',
      'Not showering before using the hot tub — a single bather with lotion, sunscreen, or deodorant adds significant organic load.',
      'Assuming foaming means poor chemistry — foam is primarily an organic contamination issue, not a pH or chlorine problem.'
    ],
    relatedCalculators: ['/calculators/hot-tub-shock-calculator'],
    relatedResources: ['/resources/hot-tub-maintenance-log'],
    relatedTopics: ['academy/hot-tubs/refilling-your-hot-tub', 'academy/hot-tubs/weekly-spa-maintenance', 'academy/troubleshooting/strong-chlorine-smell'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/total-dissolved-solids', 'glossary/oxidizer', 'glossary/bather-load'],
    sources: [src, src2]
  },
  {
    id: 'ts-04',
    slug: 'academy/troubleshooting/strong-chlorine-smell',
    title: 'Strong Chlorine Smell: What It Really Means',
    description: 'Understand why a strong chlorine smell in a pool or hot tub indicates combined chlorine (chloramines), not excess free chlorine, and how to fix it.',
    summary: 'The classic pool smell is chloramines, not free chlorine. A strong smell is a sign you need more chlorine — specifically a breakpoint chlorination — not less.',
    category: 'troubleshooting',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool chlorine smell', 'hot tub chlorine odor', 'chloramine smell pool', 'why does pool smell like chlorine'],
    overview: 'Most people associate a strong chlorine smell with "too much chlorine." The opposite is true. The smell comes from chloramines (combined chlorine) — the by-products of chlorine reacting with nitrogen compounds. The fix is more chlorine, not less.',
    keyFacts: [
      'The irritating pool smell comes from chloramines (dichloramine and nitrogen trichloride), not free chlorine.',
      'A well-maintained pool with adequate free chlorine has very little odour.',
      'Combined chlorine above 0.5 ppm is the action threshold — breakpoint shock is needed.',
      'Eye irritation from pool water is caused by chloramines, not free chlorine.'
    ],
    sections: [
      {
        id: 'the-chemistry-of-smell',
        h2: 'The Chemistry of the Smell',
        body: 'When free chlorine reacts with nitrogen compounds in pool water (from sweat, urine, body waste, and sunscreen), it forms compounds called chloramines. The three types are monochloramine (NH2Cl), dichloramine (NHCl2), and nitrogen trichloride (NCl3). Monochloramine has a mild odour. Dichloramine and nitrogen trichloride are volatile and responsible for the strong, eye-irritating pool smell. These compounds are also much weaker disinfectants than free chlorine. The pool smells worst when free chlorine is too low to convert all nitrogen compounds, and chloramines accumulate instead.'
      },
      {
        id: 'measuring-combined-chlorine',
        h2: 'Measuring Combined Chlorine',
        body: 'To confirm a chloramine problem, test both free chlorine (DPD-1) and total chlorine (DPD-3). Combined chlorine = Total - Free. If the result is above 0.5 ppm, chloramines are present at an action level. A reading of 1.0 ppm or above combined chlorine corresponds to a strongly smelling pool. A result of 0.0 ppm combined chlorine in a pool that still has an odour suggests the smell may be from other sources — check that chemicals are stored away from the pool area, as chlorine storage odour can be mistaken for pool smell.'
      },
      {
        id: 'the-fix',
        h2: 'Eliminating the Smell',
        body: 'The only effective treatment for chloramine odour is breakpoint chlorination — adding enough free chlorine to reach 10 times the combined chlorine level. At breakpoint, chloramines are chemically destroyed. Calculate the dose using the shock calculator (combined chlorine x 10 x pool volume factor), add the full dose after dark, run the pump continuously overnight, and test free chlorine the following morning. The smell will be gone once breakpoint has been reached and FC returns to normal range. Adding algaecides, fragrance products, or pH adjustments will not address the odour.'
      }
    ],
    examples: [
      {
        title: 'Fixing Pool Party Aftermath',
        body: 'After a pool party, the water smells strongly and guests are complaining of red eyes. Test: FC 1.5 ppm, TC 2.8 ppm, CC 1.3 ppm — well above threshold. Breakpoint requires adding 13 ppm of FC (10 x 1.3). The pool volume is 20,000 gallons. The shock calculator shows approximately 8 lbs of cal-hypo is needed. Added after sunset, pump running overnight. Next morning: no smell, no eye complaints, FC 4.5 ppm (still slightly elevated), CC 0.0 ppm. Water is clear and fresh.'
      }
    ],
    commonMistakes: [
      'Reducing chlorine when the pool smells — this makes the combined chlorine problem worse by providing less free chlorine to compete with the chloramines.',
      'Adding fragrance or deodorising products to a smelling pool — these mask the odour temporarily but do not address the chloramine chemistry.',
      'Testing only free chlorine and concluding the pool is "over-chlorinated" because it smells — without measuring total chlorine and calculating CC, the diagnosis is incomplete.'
    ],
    relatedCalculators: ['/calculators/pool-shock-calculator'],
    relatedResources: ['/resources/pool-shock-log'],
    relatedTopics: ['academy/sanitizers/combined-chlorine-explained', 'academy/sanitizers/breakpoint-chlorination', 'academy/testing/using-liquid-test-kits'],
    relatedFormulas: ['formulas/shock-formula'],
    relatedGlossary: ['glossary/chloramine', 'glossary/combined-chlorine', 'glossary/breakpoint-chlorination'],
    sources: [src, src2]
  },
  {
    id: 'ts-05',
    slug: 'academy/troubleshooting/scaling',
    title: 'Pool Scaling: Causes and Prevention',
    description: 'Learn what causes calcium scale deposits in pools and hot tubs, where scaling typically appears, and how to prevent and remove it.',
    summary: 'Pool scaling is calcium carbonate depositing on surfaces when water is over-saturated. The Langelier Saturation Index predicts when scaling will occur, and addressing pH and hardness prevents it.',
    category: 'troubleshooting',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool scaling', 'calcium scale pool', 'pool tile scale', 'how to remove pool scale'],
    overview: 'Scaling occurs when dissolved calcium carbonate precipitates out of solution and deposits on pool surfaces, tile, and equipment. It is caused by over-saturated water — most often high pH, high hardness, or both.',
    keyFacts: [
      'Scale deposits are calcium carbonate — the same mineral in limestone.',
      'High pH, high calcium hardness, and high temperature are the main contributing factors.',
      'An LSI above +0.3 indicates scaling tendency.',
      'Preventing scale is far easier than removing established deposits — address chemistry before you see buildup.'
    ],
    sections: [
      {
        id: 'what-causes-scale',
        h2: 'What Causes Scale',
        body: 'Pool water holds dissolved calcium in equilibrium. When water becomes over-saturated with calcium carbonate — due to rising pH, rising temperature, evaporation, or elevated calcium hardness — the excess calcium precipitates as a white or grey crystalline deposit. This process is accelerated at pool heater elements (where temperature is highest), on tile at the waterline (where water evaporates and concentrates minerals), and inside filter housings and pipes. The Langelier Saturation Index predicts this tendency — an LSI above +0.3 means scaling is likely to begin.'
      },
      {
        id: 'where-scale-appears',
        h2: 'Where Scale Appears',
        body: 'The most visible scaling is at the waterline — calcium deposits form as water repeatedly evaporates at the tile-water interface, leaving behind concentrated minerals. Heater elements are especially vulnerable because the metal surface reaches much higher temperatures than the surrounding water, causing local calcium supersaturation. Filter media (sand, DE, cartridge) can become clogged with calcium scale over time, reducing filtration efficiency. Pool plaster surfaces develop a rough, sandpaper-like texture from scale in severe cases. Salt cell plates in salt water systems accumulate scale deposits that reduce chlorine generation efficiency.'
      },
      {
        id: 'prevention-and-removal',
        h2: 'Preventing and Removing Scale',
        body: 'Prevention: keep LSI between -0.3 and +0.3 by maintaining pH below 7.6, calcium hardness at or below 400 ppm, and alkalinity at 80–120 ppm. In areas with hard tap water, partial drains may be needed periodically to dilute calcium. Scale inhibitor products (sequestering agents) can help in borderline situations. Removal: light waterline scale is removed with a pumice stone, tile cleaning products, or diluted muriatic acid applied carefully with protective gear. Severe scale on plaster or equipment requires professional acid washing. Never use metal tools to chip off scale — this damages the underlying surface.'
      }
    ],
    examples: [
      {
        title: 'Managing Scale in a Hard-Water Area',
        body: 'A pool owner in an area with naturally hard tap water (400 ppm Ca hardness) fills a new pool. Within two months, heavy scale appears on the tile. Testing shows Ca hardness 480 ppm, pH 7.8, TA 140 ppm — LSI is +0.8 or higher. The fix: lower pH to 7.4 immediately (largest LSI impact), lower TA to 90 ppm, and plan a 30% partial drain to reduce hardness to ~340 ppm. Add a scale inhibitor weekly going forward. Monitor the LSI with every monthly test.'
      }
    ],
    commonMistakes: [
      'Treating scale visually by scrubbing without first addressing the underlying chemistry causing it.',
      'Not checking calcium hardness in refill water from a hard-water supply — the pool can begin scaling from day one.',
      'Using metal scrapers or sharp tools to remove scale, which scars the tile surface and creates rough areas where future scale builds faster.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator'],
    relatedResources: ['/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/troubleshooting/corrosion', 'academy/water-balance/understanding-lsi', 'academy/water-balance/understanding-calcium-hardness'],
    relatedFormulas: ['formulas/lsi-formula'],
    relatedGlossary: ['glossary/scale-inhibitor', 'glossary/langelier-saturation-index', 'glossary/calcium-hardness', 'glossary/scaling-water'],
    sources: [src, src2]
  },
  {
    id: 'ts-06',
    slug: 'academy/troubleshooting/corrosion',
    title: 'Pool Corrosion: Causes and Prevention',
    description: 'Learn what causes corrosion in pools and hot tubs, how to identify it, and how to stop it by correcting water chemistry.',
    summary: 'Pool corrosion is caused by aggressive water — typically low pH, low alkalinity, or low calcium hardness. It attacks metal fittings, plaster surfaces, and equipment over time.',
    category: 'troubleshooting',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool corrosion', 'pool metal staining', 'aggressive water pool', 'pool equipment corrosion'],
    overview: 'Pool corrosion occurs when water is under-saturated with calcium carbonate and seeks to dissolve minerals from any available source — pool surfaces, metal fittings, and equipment. Low pH is the most common cause.',
    keyFacts: [
      'An LSI below -0.3 indicates aggressive (corrosive) water.',
      'Low pH (below 7.2) is the most common cause of pool corrosion.',
      'Soft water (low calcium hardness, below 150 ppm) is inherently corrosive to pool surfaces.',
      'Metal staining — green, blue-grey, brown — is often the first visible sign of corrosion.'
    ],
    sections: [
      {
        id: 'what-causes-corrosion',
        h2: 'What Causes Corrosion',
        body: 'Water naturally tries to reach equilibrium with calcium carbonate. When pool water is under-saturated (LSI negative), it dissolves minerals from the nearest available source. Plaster pools lose surface calcium to the water, resulting in etched, rough, pitted surfaces. Metal equipment — pump housings, heat exchangers, ladder rails, handrails — releases metal ions into the water when the water is corrosive. These dissolved metals then deposit elsewhere in the pool or on equipment as stains. The primary causes are low pH, low alkalinity, and low calcium hardness.'
      },
      {
        id: 'signs-to-look-for',
        h2: 'Signs of Corrosion',
        body: 'Early signs of corrosion: rough plaster texture that feels like sandpaper (in plaster pools), green or blue-green staining on pool surfaces near metal fixtures (copper corrosion from heat exchangers or fittings), light brown or rust-coloured staining near ladder anchors (iron corrosion), pitting on concrete deck or coping, and discolouration or roughening of vinyl liner seams. Advanced corrosion: visibly etched plaster surfaces with pit marks, leaking heat exchangers due to metal loss, cracks in grout lines, and metal staining spread broadly across the pool floor.'
      },
      {
        id: 'stopping-corrosion',
        h2: 'Stopping Corrosion',
        body: 'The treatment for active corrosion is raising the LSI into the acceptable range: raise pH to 7.4–7.6 (largest single impact), raise calcium hardness to 200+ ppm for plaster pools, and raise alkalinity to 80–100 ppm. Corrosive water damage to surfaces is typically permanent — etching and pitting already present cannot be reversed chemically. However, stopping the process preserves the remaining surface life. For staining from dissolved metals, use a metal sequestrant product after balancing chemistry. Shocking a pool with active metal staining can worsen it — hold off on shock until metals are sequestered.'
      }
    ],
    examples: [
      {
        title: 'Addressing Copper Staining',
        body: 'A pool owner notices blue-green staining appearing along the waterline and on the pool floor after using a copper-based algaecide. Testing shows pH 7.1 and Ca hardness 100 ppm — an LSI of approximately -1.0. The corrosive water is dissolving copper from the algaecide and it is plating out on pool surfaces. Step 1: Add a metal sequestrant product immediately to bind free copper in solution. Step 2: Do not shock until metals are under control. Step 3: Raise pH to 7.4 and hardness to 250 ppm over 48 hours. Step 4: Run the filter 24 hours. The staining fades over several days.'
      }
    ],
    commonMistakes: [
      'Using a copper-based algaecide in soft water (low hardness) — the aggressive water dissolves the copper rapidly, causing widespread staining.',
      'Shocking a pool with active metal staining — the sudden high chlorine oxidises dissolved metals and causes them to precipitate out as permanent stains.',
      'Filling a plaster pool with soft municipal water without immediately raising calcium hardness to at least 200 ppm.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator'],
    relatedResources: ['/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/troubleshooting/scaling', 'academy/water-balance/understanding-lsi', 'academy/water-balance/understanding-calcium-hardness'],
    relatedFormulas: ['formulas/lsi-formula'],
    relatedGlossary: ['glossary/aggressive-water', 'glossary/langelier-saturation-index', 'glossary/metal-sequestrant', 'glossary/calcium-hardness'],
    sources: [src, src2]
  }
];
