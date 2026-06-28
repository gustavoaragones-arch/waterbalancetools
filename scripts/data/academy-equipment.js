'use strict';
// Academy – Pool Equipment (6 articles)

const src = 'Pool & Hot Tub Alliance — Pool & Spa Operator Handbook, 2022';
const src2 = 'Taylor Technologies — Pool/Spa Water Chemistry Reference';

module.exports = [
  {
    id: 'eq-01',
    slug: 'academy/equipment/pool-filters',
    title: 'Pool Filters: How They Work',
    description: 'Learn how pool filters work, the three main filter types, what they remove from water, and how to maintain them correctly.',
    summary: 'The pool filter is the primary mechanical barrier against particles, debris, and dead algae. Correct sizing, run time, and maintenance determine whether it keeps pace with contamination.',
    category: 'equipment',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool filter types', 'how pool filter works', 'sand cartridge DE filter', 'pool filter maintenance'],
    overview: 'Pool filtration removes suspended particles from water — fine particles that cause cloudiness, dead algae cells, and small debris. All three main filter types (sand, cartridge, DE) work on the same principle: passing water through a medium that captures particles.',
    keyFacts: [
      'Sand filters capture particles down to 20–40 microns; cartridge filters to 10–15 microns; DE filters to 3–5 microns.',
      'Filter pressure above 8–10 psi over baseline indicates a dirty filter that needs cleaning.',
      'Pool water should turn over (pass through the filter) at least once every 8 hours.',
      'Running the filter is the most important single factor in maintaining clear water — chemistry alone cannot compensate for insufficient filtration.'
    ],
    sections: [
      {
        id: 'how-filters-work',
        h2: 'How Filtration Works',
        body: 'Pool filters remove particles by forcing water through a filter medium that physically captures and holds particles as the water passes through. Larger particles are captured easily; finer particles require a finer filter medium or coagulation (via clarifier) to form larger clumps that the filter can capture. All filters have a maximum particle size they can capture and a maximum flow rate beyond which particles pass through without being captured. The filter must be sized correctly for the pump flow rate and the pool volume to function effectively.'
      },
      {
        id: 'filter-pressure-and-run-time',
        h2: 'Pressure and Run Time',
        body: 'Every filter has a pressure gauge. When the filter is clean, note the baseline pressure. As the filter captures particles, the pressure rises. An increase of 8–10 psi above baseline is the standard backwash or cleaning threshold — beyond this, the filter resistance is reducing flow rate and filtration efficiency. Run the pool pump long enough each day to achieve at least one complete turnover of the pool volume. For a 15,000-gallon pool with a pump delivering 50 GPM, one turnover takes 300 minutes (5 hours). Running 8 hours per day provides 1.6 turnovers, which is adequate for most pools.'
      },
      {
        id: 'filter-maintenance',
        h2: 'Filter Maintenance',
        body: 'Sand filters: backwash when pressure rises 8–10 psi above clean baseline. Backwash by reversing water flow through the sand bed to flush captured debris to waste. Replace sand every 5–7 years. Cartridge filters: remove and rinse with a hose when pressure rises, and soak in degreaser monthly. Replace cartridge elements annually or when they no longer return to baseline pressure after cleaning. DE (diatomaceous earth) filters: backwash when pressure rises and recharge with fresh DE powder. Bump or backwash after major events. Annual disassembly and cleaning of the internal grids is recommended.'
      }
    ],
    examples: [
      {
        title: 'Sizing a Replacement Filter',
        body: 'A 20,000-gallon pool with a 1.5 HP pump that delivers approximately 60 GPM needs a filter that can handle 60 GPM flow without channelling. A sand filter with a 24-inch tank is rated for approximately 60–80 GPM — appropriate for this pool. A 20-inch tank (rated 40–60 GPM) would be borderline — water would pass through faster than it can filter effectively during high-flow periods. When in doubt, choose the next size up — a slightly oversized filter is far less problematic than an undersized one.'
      }
    ],
    commonMistakes: [
      'Backwashing a sand filter without looking at the pressure gauge — visual inspection of the pool is not a reliable indicator of filter status.',
      'Running the pump for only 4–6 hours in summer when turnover calculation shows 8 hours is needed.',
      'Not noting the clean baseline pressure when a new filter is installed — without a baseline, there is no way to know when the 8–10 psi rise has been reached.'
    ],
    relatedCalculators: ['/calculators/pool-turnover-rate-calculator', '/calculators/pool-volume-calculator'],
    relatedResources: ['/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/equipment/sand-vs-cartridge-filters', 'academy/equipment/pool-pumps', 'academy/troubleshooting/cloudy-water'],
    relatedFormulas: ['formulas/turnover-formula'],
    relatedGlossary: ['glossary/filter-pressure', 'glossary/backwashing', 'glossary/pump-turnover', 'glossary/cartridge-filter'],
    sources: [src]
  },
  {
    id: 'eq-02',
    slug: 'academy/equipment/sand-vs-cartridge-filters',
    title: 'Sand Filters vs. Cartridge Filters',
    description: 'Compare sand and cartridge pool filters on filtration quality, water usage, maintenance requirements, and which is the better choice for your pool.',
    summary: 'Sand and cartridge filters both work well but suit different pools and maintenance styles. Cartridge filters capture finer particles and use no backwash water; sand filters are more durable and lower maintenance long-term.',
    category: 'equipment',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['sand filter vs cartridge', 'pool filter comparison', 'which pool filter to buy', 'cartridge vs sand pool filter'],
    overview: 'The choice between sand and cartridge filters comes down to water quality, water conservation, and maintenance preference. Both types are widely used and effective when properly maintained.',
    keyFacts: [
      'Cartridge filters capture particles down to 10–15 microns vs. 20–40 microns for sand — noticeably clearer water.',
      'Sand filters use water to backwash; cartridge filters use zero water (rinse only).',
      'Cartridge elements need replacement every 12–18 months; filter sand lasts 5–7 years.',
      'DE (diatomaceous earth) filters offer the finest filtration (3–5 microns) at the cost of highest maintenance.'
    ],
    sections: [
      {
        id: 'sand-filters',
        h2: 'Sand Filters',
        body: 'Sand filters use a bed of specially graded silica sand to filter pool water. Water enters at the top, passes down through the sand, and exits at the bottom. Particles are captured in the sand bed as water passes through. When pressure rises, backwashing (reversing flow) flushes debris to waste. Sand filters are durable, relatively low-maintenance, and the sand lasts 5–7 years before replacement. Their main limitation is filtration fineness — they capture particles 20–40 microns and above, which means fine particles (including some dead algae and fine dust) pass through. In areas with hard water, calcium can cement sand particles together, reducing efficiency.'
      },
      {
        id: 'cartridge-filters',
        h2: 'Cartridge Filters',
        body: 'Cartridge filters use a pleated polyester element, similar to an automotive oil filter, to capture particles down to 10–15 microns. Water passes from the outside of the element to the inside, trapping particles in the pleated media. Cleaning requires removing the element and rinsing with a hose — no water is wasted, which matters in drought-prone areas or where water costs are high. The tradeoff is more hands-on maintenance: cartridges need rinsing approximately monthly, degreaser soaking monthly, and replacement every 12–18 months depending on use. A well-maintained cartridge filter produces noticeably clearer water than a sand filter.'
      },
      {
        id: 'choosing-the-right-one',
        h2: 'Which to Choose',
        body: 'Choose a sand filter if: your pool is large (over 20,000 gallons), you prefer less frequent maintenance, and water usage for backwashing is not a concern. Choose a cartridge filter if: water clarity is a priority, you are in a water-restricted area, or your pool is prone to fine particle contamination (pollen, dust). Choose a DE filter if: you want the finest possible filtration and are willing to do more maintenance work. For most residential pools, a correctly sized cartridge filter provides excellent value and water quality with manageable maintenance.'
      }
    ],
    examples: [
      {
        title: 'Comparing Running Costs',
        body: 'A 15,000-gallon pool with a sand filter backwashes every 2–3 weeks, using approximately 150–200 gallons of water per backwash. Over a 30-week season, that is 6–10 backwashes, totalling 900–2,000 gallons of water wasted to drain. In an area with water rates of $0.005 per gallon, that is $5–$10 in water per season. A cartridge filter for the same pool uses zero water for cleaning but requires a $40–$80 cartridge replacement annually. The costs are roughly comparable, making the choice a matter of preference rather than significant cost difference.'
      }
    ],
    commonMistakes: [
      'Installing an undersized cartridge filter that is constantly at maximum pressure — the cartridge degrades faster and the water is poorly filtered.',
      'Using a pressure washer to clean cartridge elements — high pressure damages the pleated media and reduces filtration efficiency.',
      'Not replacing filter sand after 7+ years, by which time the grains have worn smooth and no longer effectively capture fine particles.'
    ],
    relatedCalculators: ['/calculators/pool-volume-calculator'],
    relatedResources: ['/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/equipment/pool-filters', 'academy/equipment/pool-pumps'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/sand-filter', 'glossary/cartridge-filter', 'glossary/de-filter', 'glossary/backwashing'],
    sources: [src]
  },
  {
    id: 'eq-03',
    slug: 'academy/equipment/pool-pumps',
    title: 'Pool Pumps: Sizing and Turnover',
    description: 'Learn how to size a pool pump correctly, calculate turnover rate, and understand why variable speed pumps save energy while improving water quality.',
    summary: 'The pool pump determines how much water passes through the filter each day. Correct sizing ensures adequate turnover rate without wasting energy on oversized flow.',
    category: 'equipment',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool pump sizing', 'pool pump turnover rate', 'variable speed pump pool', 'pool pump flow rate'],
    overview: 'The pool pump drives all water circulation — through the filter, heater, and sanitiser system. Correct pump sizing means achieving adequate turnover rate while minimising energy consumption.',
    keyFacts: [
      'One complete pool turnover (entire pool volume passes through filter) should occur at least every 8 hours.',
      'Variable speed pumps reduce energy consumption by 65–80% compared to single-speed pumps.',
      'An oversized pump wastes energy and can cause short-circuit flows that reduce filtration effectiveness.',
      'GPM (gallons per minute) is the key specification: pool volume / turnover time in minutes = required GPM.'
    ],
    sections: [
      {
        id: 'sizing-basics',
        h2: 'Pump Sizing Basics',
        body: 'To size a pool pump: calculate pool volume (in gallons), set a target turnover time (typically 8 hours = 480 minutes), then divide volume by time to get required flow rate in GPM. Example: 20,000-gallon pool divided by 480 minutes = approximately 42 GPM. A pump that delivers 40–50 GPM at the system head pressure (resistance from the plumbing and filter) is correctly sized. Do not size the pump based on horsepower alone — a pump\'s flow rate depends on both horsepower and the resistance of the specific plumbing system.'
      },
      {
        id: 'variable-speed-pumps',
        h2: 'Variable Speed Pumps',
        body: 'Variable speed pumps allow the operator to set different RPM levels for different functions: a low speed for continuous filtration (which moves water slowly but quietly and very efficiently), a medium speed for normal filtration, and a high speed for features like waterfalls and vacuuming. Pool energy experts typically recommend running a variable speed pump at 1,500–2,000 RPM for continuous filtration — much more slowly than a single-speed pump. This lower speed actually produces better water quality because it runs longer, achieving more turnovers per day while consuming a fraction of the electricity.'
      },
      {
        id: 'flow-rate-and-turnover',
        h2: 'Flow Rate and Turnover Rate',
        body: 'The Turnover Rate formula is: Turnovers per day = (GPM x 60 minutes x run hours per day) / Pool volume. A pool that achieves only one turnover per day in hot summer weather may not maintain adequate water quality — dead algae, fine particles, and chlorine by-products accumulate faster than the filter can clear them. Increasing to two turnovers per day (by extending pump run time or increasing speed) is a common recommendation during peak swimming season or after an algae event.'
      }
    ],
    examples: [
      {
        title: 'Variable Speed Pump Scheduling',
        body: 'A 15,000-gallon pool with a variable speed pump running at 1,750 RPM delivers approximately 45 GPM. One turnover takes 15,000 / 45 = 333 minutes = 5.6 hours. Running the pump 16 hours per day achieves approximately 2.9 turnovers — excellent filtration. At 1,750 RPM, the pump draws approximately 400–500 watts — compared to 1,500–2,500 watts for a typical single-speed pump. Annual energy savings: approximately $400–$700 depending on local electricity rates.'
      }
    ],
    commonMistakes: [
      'Replacing a failing pump with the largest available without calculating the required GPM — an oversized pump may exceed filter flow ratings and reduce filtration quality.',
      'Running a variable speed pump at maximum speed continuously instead of using the low-speed setting for routine filtration.',
      'Not adjusting pump run time seasonally — a 6-hour run in April may be insufficient when pool chemistry changes rapidly in August.'
    ],
    relatedCalculators: ['/calculators/pool-turnover-rate-calculator', '/calculators/pool-volume-calculator'],
    relatedResources: ['/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/equipment/pool-filters', 'academy/equipment/salt-systems'],
    relatedFormulas: ['formulas/turnover-formula', 'formulas/pool-volume-formula'],
    relatedGlossary: ['glossary/pump-turnover', 'glossary/gpm', 'glossary/pool-pump', 'glossary/filter-pressure'],
    sources: [src]
  },
  {
    id: 'eq-04',
    slug: 'academy/equipment/salt-systems',
    title: 'Salt Chlorinator Systems',
    description: 'Learn how salt chlorinator systems generate chlorine from dissolved salt, what they require in terms of water chemistry, and how to maintain the salt cell.',
    summary: 'Salt chlorinators generate chlorine automatically from dissolved salt, reducing the need for regular chlorine additions. They require specific water chemistry and regular cell cleaning to function correctly.',
    category: 'equipment',
    readingTime: '6 min read',
    lastReviewed: '2026-06-01',
    keywords: ['salt pool system', 'salt chlorinator', 'saltwater pool chemistry', 'salt cell maintenance'],
    overview: 'Salt water pool systems (also called salt chlorinator or salt generator systems) produce chlorine continuously by electrolyzing dissolved salt in the pool water. They do not eliminate the need for water chemistry management.',
    keyFacts: [
      'Target salt level for most systems: 2,700–3,400 ppm — far lower than ocean water (35,000 ppm).',
      'Salt pools still require pH, alkalinity, and hardness management — the system only manages chlorine.',
      'Salt cells accumulate calcium scale and require cleaning every 3 months on average.',
      'CYA of 60–80 ppm is needed for salt pool outdoor use to protect the generated chlorine from UV.'
    ],
    sections: [
      {
        id: 'how-salt-systems-work',
        h2: 'How Salt Systems Work',
        body: 'A salt chlorinator passes pool water across a titanium cell coated with precious metal oxides (the salt cell). A low-voltage electrical current causes the dissolved sodium chloride in the water to split: chloride ions are oxidised to chlorine at the anode, and sodium ions combine with hydroxide to form sodium hydroxide at the cathode. The net result is that hypochlorous acid is generated continuously at the cell surface and released into the pool water. The process is reversible — the chlorine that is consumed in sanitising the pool water eventually regenerates as chloride, which can be chlorinated again. The salt is not consumed at a significant rate.'
      },
      {
        id: 'chemistry-requirements',
        h2: 'Water Chemistry for Salt Pools',
        body: 'Salt pools require the same core chemistry management as chlorine pools with one difference: the salt chlorinator generates chlorine continuously at a set rate, so you do not add liquid chlorine or tablets (in most cases). What you must still manage: pH (6.8–7.6; salt generators raise pH as a by-product of the electrolysis process, so pH tends to drift up and requires more acid additions than a traditional chlorine pool), alkalinity (80–120 ppm), calcium hardness (200–400 ppm for plaster — very important because low hardness accelerates cell scaling), and CYA (60–80 ppm for outdoor pools to protect the generated chlorine).'
      },
      {
        id: 'cell-maintenance',
        h2: 'Salt Cell Maintenance',
        body: 'The salt cell deposits calcium scale on its titanium plates over time, reducing chlorine generation efficiency. Inspect the cell every 3 months and clean it when white or grey calcium deposits are visible on the plates. Cleaning method: remove the cell, hold it over a bucket, and pour a 4:1 water-to-muriatic acid solution through the cell (carefully — use acid-appropriate safety gear). Wait 5–10 minutes for the scale to dissolve, then rinse with clean water. Do not use metal tools to scrape the plates — this damages the precious metal oxide coating. Replace the cell when it no longer generates adequate chlorine after cleaning, typically every 3–7 years.'
      }
    ],
    examples: [
      {
        title: 'Seasonal Salt Level Check',
        body: 'Opening a salt pool in spring: test salt level using the handheld salt test strip or the controller reading. Salt reads 2,400 ppm — slightly below the 2,700 ppm minimum for the system. Add approximately 40 lbs of sodium chloride (pool grade) to a 15,000-gallon pool to raise salt by 300 ppm. Run the pump for 24 hours to dissolve and circulate. Retest — salt now at 2,750 ppm. Also test pH (7.8, needs acid), TA (90 ppm, fine), and hardness (200 ppm, fine). Balance pH before starting the generator for the season.'
      }
    ],
    commonMistakes: [
      'Assuming a salt pool requires no water chemistry management beyond the generator setting — pH drift, scaling, and low hardness are common in salt pools.',
      'Not cleaning the salt cell for more than 6 months — heavy scale reduces output efficiency to the point where algae can establish despite the generator running.',
      'Using non-pool grade salt (road salt, water softener salt with additives) — these can introduce iron and other contaminants that stain the pool.'
    ],
    relatedCalculators: ['/calculators/saltwater-pool-salt-calculator'],
    relatedResources: ['/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/equipment/pool-pumps', 'academy/water-balance/understanding-cyanuric-acid', 'academy/water-balance/understanding-ph'],
    relatedFormulas: ['formulas/salt-formula'],
    relatedGlossary: ['glossary/salt-chlorination', 'glossary/cyanuric-acid', 'glossary/ph', 'glossary/calcium-hardness'],
    sources: [src]
  },
  {
    id: 'eq-05',
    slug: 'academy/equipment/automatic-chlorinators',
    title: 'Automatic Chlorinators',
    description: 'Learn how automatic chlorine feeders work, the difference between inline and offline feeders, how to set the feed rate, and compatibility considerations.',
    summary: 'Automatic chlorinators deliver steady chlorine doses without daily attention. They work with trichlor tablets and require correct feed rate settings to avoid over- or under-chlorination.',
    category: 'equipment',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['automatic pool chlorinator', 'pool chlorine feeder', 'inline chlorinator', 'trichlor feeder pool'],
    overview: 'Automatic chlorinators hold a supply of slow-dissolving chlorine tablets and meter chlorine into the pool water at a controlled rate. They provide consistent dosing between maintenance visits.',
    keyFacts: [
      'Inline feeders are plumbed into the return line after the pump and filter; offline feeders bypass a small amount of flow.',
      'Trichlor tablets (3-inch or 1-inch) are the standard product for automatic feeders.',
      'Feed rate setting affects how much chlorine dissolves per day — adjust based on pool volume and actual FC readings.',
      'Never put chlorine tablets directly into the skimmer — the concentrated acid from dissolving tablets can corrode equipment.'
    ],
    sections: [
      {
        id: 'how-feeders-work',
        h2: 'How Automatic Feeders Work',
        body: 'Inline feeders are installed in the pool plumbing between the filter and the pool return. Pool water flows through the feeder housing, over the slow-dissolving tablets, picking up chlorine as it passes. The feed rate is typically adjusted by a dial that controls water flow through the feeder — more flow equals faster tablet dissolution and more chlorine released. Offline (bypass) feeders connect to the plumbing with a small bypass valve that diverts a fraction of the return flow through the feeder. They are easier to install in existing systems. Both types achieve the same result: continuous low-level chlorine dosing between maintenance visits.'
      },
      {
        id: 'setting-feed-rate',
        h2: 'Setting the Feed Rate',
        body: 'The correct feed rate depends on pool volume, sun exposure, bather load, and current CYA level. Start at the mid-range setting, run the system for 24–48 hours, and test free chlorine. If FC is below target (1 ppm), increase the feed rate. If FC is above 3 ppm consistently, decrease it. Never set and forget — seasonal changes require adjustments. In summer with heavy UV and bather load, the feeder setting for early spring will likely under-dose. In autumn with low use, the same setting will likely over-dose.'
      },
      {
        id: 'compatibility-notes',
        h2: 'Compatibility Considerations',
        body: 'Trichlor tablets are strongly acidic (pH approximately 2.8) and contain cyanuric acid. Every time a tablet dissolves, it lowers pH and adds CYA. In a pool managed exclusively with a tablet feeder, CYA can reach problem levels (80–100 ppm) within one season and pH will consistently trend low without acid addition. Test pH and CYA monthly when using an automatic feeder. Never mix different types of chlorine products inside the feeder — trichlor and cal-hypo in contact can react violently. Empty and rinse the feeder before switching products.'
      }
    ],
    examples: [
      {
        title: 'End-of-Season Feeder Check',
        body: 'As the season winds down, a pool owner discovers their CYA is at 85 ppm — above the 80 ppm upper limit. Review of maintenance records shows the feeder has been running at the same setting since spring. The summer bather load has been high (kids off school), and the feeder has been running at 100% feed rate, dissolving tablets quickly. The fix for next season: test CYA monthly and plan a 25% partial drain at mid-season to dilute CYA before it reaches problem levels. Switch to liquid chlorine for supplemental dosing in high-use periods to avoid adding more CYA.'
      }
    ],
    commonMistakes: [
      'Putting chlorine tablets directly in the skimmer — this creates a concentrated acid bath that corrodes equipment downstream.',
      'Not adjusting the feed rate seasonally — the same setting will over-dose in spring and under-dose in midsummer.',
      'Letting the feeder run empty for extended periods — the pool receives no chlorine and can develop algae in the time between feeder refills.'
    ],
    relatedCalculators: ['/calculators/pool-chlorine-calculator'],
    relatedResources: ['/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/equipment/salt-systems', 'academy/sanitizers/liquid-chlorine-vs-tablets', 'academy/water-balance/understanding-cyanuric-acid'],
    relatedFormulas: ['formulas/liquid-chlorine-formula'],
    relatedGlossary: ['glossary/trichlor', 'glossary/cyanuric-acid', 'glossary/free-chlorine'],
    sources: [src]
  },
  {
    id: 'eq-06',
    slug: 'academy/equipment/pool-skimmers',
    title: 'Pool Skimmers',
    description: 'Learn how pool skimmers work, why correct water level is essential for skimmer performance, and how to maintain them.',
    summary: 'Skimmers capture surface debris before it sinks and decomposes. Maintaining the correct water level and clean skimmer baskets is essential for effective skimmer operation.',
    category: 'equipment',
    readingTime: '4 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool skimmer', 'skimmer basket pool', 'pool water level skimmer', 'pool skimmer maintenance'],
    overview: 'Pool skimmers are built into the pool wall at the water surface. They continuously draw water from the surface where leaves, insects, sunscreen residue, and other debris collect before they can sink and decompose in the pool.',
    keyFacts: [
      'Skimmer efficiency depends on correct water level: mid-skimmer opening, typically halfway up the face plate.',
      'A clogged skimmer basket reduces pump suction and can cause cavitation damage to the pump.',
      'Check and empty the skimmer basket every 2–3 days or after any significant debris event.',
      'A weir door (the flap inside the skimmer) prevents debris from returning to the pool when the pump stops.'
    ],
    sections: [
      {
        id: 'how-skimmers-work',
        h2: 'How Skimmers Work',
        body: 'Pool skimmers are built into the pool wall with an opening at the water surface. The pump draws water through the skimmer inlet, pulling surface water (and the debris floating on it) into the skimmer housing. A weir door at the skimmer opening creates a small waterfall effect that increases the velocity of surface water entering the skimmer, improving debris capture. Inside the housing, a basket catches debris before the water continues to the pump and filter. The captured debris is removed when you empty the basket. Skimmers work best when the pump is running — during pump-off periods, the weir door closes and prevents debris from floating back out.'
      },
      {
        id: 'water-level',
        h2: 'Correct Water Level',
        body: 'Water level is critical for skimmer performance. The pool water surface should be at the midpoint of the skimmer opening — approximately halfway up the skimmer face plate. If the water level is too low, the skimmer draws air instead of water, starving the pump and potentially causing cavitation damage. If the water level is too high, surface water flows over the pool edge rather than through the skimmer, and the skimmer captures debris poorly. During summer when evaporation is high, check the water level weekly and add water as needed to maintain the correct level.'
      },
      {
        id: 'maintenance-tips',
        h2: 'Skimmer Maintenance',
        body: 'Empty the skimmer basket every 2–3 days or whenever it is more than half full. A full basket reduces pump suction and increases pump wear. After a wind event or storm, empty the basket immediately — wet leaves compact quickly into a solid plug that can block pump suction entirely. Inspect the basket for cracks or holes periodically — a cracked basket allows debris to pass into the pump. Annually, inspect the skimmer housing for cracks and the weir door for proper function. In areas with freezing winters, the skimmer body is a common freeze-damage point — ensure the water level drops below the skimmer intake when winterising.'
      }
    ],
    examples: [
      {
        title: 'Diagnosing Poor Skimming',
        body: 'A pool owner notices that leaves are collecting in the pool bottom instead of being caught by the skimmer. Inspection shows: the water level is 4 inches below the skimmer opening — too low for effective skimming. The pump is drawing air at the skimmer, causing it to gurgle intermittently. Topping up the pool water to mid-skimmer level immediately improves surface flow. Within 24 hours, the skimmer is capturing debris efficiently and the pump runs silently.'
      }
    ],
    commonMistakes: [
      'Allowing the water level to drop below the skimmer opening during summer evaporation — this causes the pump to pull air and can damage it.',
      'Not emptying the skimmer basket before a storm, which can fill it to capacity and block all suction within hours.',
      'Placing chemical tablets directly in the skimmer basket — the concentrated acid from dissolving tablets passes directly through the pump and can damage pump seals and heat exchanger components.'
    ],
    relatedCalculators: ['/calculators/pool-volume-calculator'],
    relatedResources: ['/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/equipment/pool-pumps', 'academy/equipment/pool-filters', 'academy/troubleshooting/cloudy-water'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/skimmer', 'glossary/pump-turnover'],
    sources: [src]
  }
];
