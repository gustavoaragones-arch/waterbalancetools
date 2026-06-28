'use strict';
// Academy – Hot Tub Care (6 articles)

const src = 'Pool & Hot Tub Alliance — Pool & Spa Operator Handbook, 2022';
const src2 = 'Taylor Technologies — Pool/Spa Water Chemistry Reference';

module.exports = [
  {
    id: 'ht-01',
    slug: 'academy/hot-tubs/daily-spa-maintenance',
    title: 'Daily Spa Maintenance',
    description: 'Learn the five-minute daily hot tub maintenance routine that prevents chemistry problems and keeps the water safe for every soak.',
    summary: 'Five minutes of daily attention prevents most hot tub chemistry problems. The daily routine covers testing, adjusting, and rinsing to maintain safe water between soaks.',
    category: 'hot-tubs',
    readingTime: '4 min read',
    lastReviewed: '2026-06-01',
    keywords: ['daily hot tub maintenance', 'spa daily care', 'hot tub routine', 'spa water maintenance daily'],
    overview: 'A daily hot tub maintenance routine takes about five minutes and prevents the chemistry drift that leads to cloudy water, foam, and odour. It is far easier to maintain good chemistry than to recover from a problem.',
    keyFacts: [
      'Test free chlorine and pH before every soak to confirm the water is safe for use.',
      'Hot tub chemistry changes much faster than pool chemistry due to small volume and high temperature.',
      'Rinse the spa cover with fresh water weekly to prevent chemical off-gassing from returning to the water.',
      'Record every test result — patterns reveal maintenance issues before they become problems.'
    ],
    sections: [
      {
        id: 'before-each-soak',
        h2: 'Before Each Soak',
        body: 'Before entering the hot tub, spend 60 seconds testing free chlorine and pH. Free chlorine should be at least 3 ppm. pH should be between 7.2 and 7.8. If FC is below 2 ppm, add a dose of chlorine and wait 20 minutes before entering. If pH is above 7.8, add pH reducer before soaking. These two readings are the daily go or no-go indicators. If either is out of range, the water is not ready for safe use regardless of how clear it looks.'
      },
      {
        id: 'after-each-soak',
        h2: 'After Each Soak',
        body: 'After the soak session, add a small oxidiser dose (non-chlorine shock or a small chlorine dose) to restore the sanitiser that the bather load consumed. Wipe down the spa rim and cover gasket to remove moisture and chemical residue. Replace the cover and secure the latches. This post-soak oxidation step is the single most effective habit for maintaining clear, odour-free spa water between uses.'
      },
      {
        id: 'daily-log',
        h2: 'Keeping a Daily Log',
        body: 'Record the date, time, test results, and any chemical additions in a spa log. A simple notepad or the printable water test log sheet works well. This log serves two purposes: it helps you identify patterns (does FC always drop faster on weekends? Does pH spike after rain?), and it provides documentation for liability purposes in rental or commercial settings. A log that shows consistent maintenance history protects you if a guest ever claims they experienced a water-related health issue.'
      }
    ],
    examples: [
      {
        title: 'Quick Pre-Soak Routine',
        body: 'Thursday evening, 7pm: open the cover and lift the test strips. FC reads 3 ppm (good). pH reads 7.5 (good). No adjustment needed. Enter the spa for 30 minutes. After soaking: add one tablespoon of sodium dichloro granules (or a dose of non-chlorine oxidiser). Replace the cover. Total time: 3 minutes before, 2 minutes after. The spa is ready for the next use.'
      }
    ],
    commonMistakes: [
      'Skipping the pre-soak test when the water looks clear — appearance does not indicate safe chemistry levels.',
      'Not adding an oxidiser after heavy use, allowing organic contamination to accumulate over several days.',
      'Not securing the spa cover after each use — uncovered hot tub water loses chlorine to UV and airborne organic matter rapidly.'
    ],
    relatedCalculators: ['/calculators/hot-tub-chlorine-calculator', '/calculators/hot-tub-ph-calculator'],
    relatedResources: ['/resources/hot-tub-maintenance-log'],
    relatedTopics: ['academy/hot-tubs/weekly-spa-maintenance', 'academy/hot-tubs/shock-after-heavy-use', 'academy/fundamentals/pool-vs-hot-tub-chemistry'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/free-chlorine', 'glossary/oxidizer', 'glossary/bather-load'],
    sources: [src, src2]
  },
  {
    id: 'ht-02',
    slug: 'academy/hot-tubs/weekly-spa-maintenance',
    title: 'Weekly Spa Maintenance',
    description: 'Learn the complete weekly hot tub maintenance routine including full water testing, filter rinse, and chemical balancing.',
    summary: 'Weekly spa maintenance includes a full water test, filter rinse, surface cleaning, and chemistry adjustment. This routine takes 20–30 minutes and prevents the need for more intensive interventions.',
    category: 'hot-tubs',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['weekly hot tub maintenance', 'spa weekly care', 'hot tub weekly routine', 'spa water balance weekly'],
    overview: 'A consistent weekly hot tub maintenance routine maintains water quality between monthly deep cleans and prevents chemistry drift that accumulates into significant problems.',
    keyFacts: [
      'Test all four core parameters weekly: FC, pH, total alkalinity, and calcium hardness.',
      'Rinse (not clean) the filter cartridge weekly to remove surface debris accumulation.',
      'Check and clean the spa waterline weekly to prevent scale and scum buildup.',
      'Hot tub water needs a weekly shock dose even without heavy use, to oxidise accumulated organics.'
    ],
    sections: [
      {
        id: 'full-water-test',
        h2: 'Full Water Test',
        body: 'Once per week, test all four core parameters: free chlorine, pH, total alkalinity, and calcium hardness. In hot tubs, alkalinity tends to drift more than in pools due to aeration from jets, which off-gases CO2 and raises pH. Check each parameter against the hot tub target ranges (FC 3–5 ppm, pH 7.2–7.8, TA 80–120 ppm, CH 150–250 ppm) and adjust any that are outside range. Follow the correct adjustment order: alkalinity first, then pH, then chlorine.'
      },
      {
        id: 'filter-maintenance',
        h2: 'Filter Rinse',
        body: 'Hot tub cartridge filters collect oils and fine particles rapidly. A weekly rinse with a garden hose (not a pressure washer) removes surface accumulation and restores flow rate. Hold the cartridge at an angle and rinse between the pleats from top to bottom. Do not use soap or household cleaners on the cartridge — these leave residue that causes foaming. The cartridge should receive a full degreaser soak monthly and be replaced approximately every 12 months depending on use intensity.'
      },
      {
        id: 'shock-and-surface',
        h2: 'Weekly Shock and Surface Cleaning',
        body: 'Even with daily oxidiser additions, organic compounds build up in hot tub water over a week of use. A weekly shock dose — either non-chlorine oxidiser (MPS) or chlorine shock — burns off accumulated organics and resets the water. Add the shock dose after the last soak of the week, allow 15–20 minutes with the jets running, then cover and leave overnight. Wipe down the waterline with a spa-approved surface cleaner to remove the ring of body oils and calcium deposits that accumulate at the water surface.'
      }
    ],
    examples: [
      {
        title: 'Standard Saturday Morning Routine',
        body: 'Saturday 9am: open cover, collect water sample. Run full test: FC 2 ppm (slightly low), pH 7.6 (fine), TA 95 ppm (fine), CH 200 ppm (fine). Add chlorine granules to raise FC to 5 ppm. Rinse the filter cartridge with the hose. Wipe down the waterline. After 30 minutes, add a weekly dose of non-chlorine shock. Run jets for 15 minutes to mix. Replace cover. Saturday evening: test before entering — FC now 4 ppm, pH 7.5 — safe to soak. Total maintenance time: 25 minutes.'
      }
    ],
    commonMistakes: [
      'Skipping the weekly filter rinse and waiting until the filter is visibly dirty — a clogged filter allows turbidity to build faster than it can be treated.',
      'Not shocking weekly because the water looks clear — organic compounds are invisible but steadily degrade water quality.',
      'Using household spray cleaners or dish soap to wipe down the spa interior — these introduce surfactants that cause foaming.'
    ],
    relatedCalculators: ['/calculators/hot-tub-shock-calculator', '/calculators/hot-tub-chlorine-calculator'],
    relatedResources: ['/resources/hot-tub-maintenance-log'],
    relatedTopics: ['academy/hot-tubs/daily-spa-maintenance', 'academy/hot-tubs/monthly-spa-maintenance', 'academy/hot-tubs/shock-after-heavy-use'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/oxidizer', 'glossary/cartridge-filter', 'glossary/free-chlorine'],
    sources: [src, src2]
  },
  {
    id: 'ht-03',
    slug: 'academy/hot-tubs/monthly-spa-maintenance',
    title: 'Monthly Spa Maintenance',
    description: 'Learn the monthly hot tub maintenance tasks including deep filter cleaning, full water test, and what to check to keep the system running efficiently.',
    summary: 'Monthly spa maintenance goes deeper than weekly care: the filter gets a degreaser soak, jets are inspected, and a full chemistry audit ensures water quality is on track.',
    category: 'hot-tubs',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['monthly hot tub maintenance', 'spa monthly care', 'hot tub deep clean', 'filter degreaser spa'],
    overview: 'Monthly maintenance extends between the weekly quick checks and the quarterly water change. It catches slow-developing issues before they require expensive repairs.',
    keyFacts: [
      'Monthly filter degreaser soak removes oils and mineral deposits that rinse-only cleaning cannot clear.',
      'Test CYA monthly if using stabilised chlorine products — it accumulates in hot tub water.',
      'Inspect jets and air controls monthly for scale buildup and proper function.',
      'Check the cabinet and equipment compartment for moisture, leaks, or pest activity.'
    ],
    sections: [
      {
        id: 'deep-filter-clean',
        h2: 'Deep Filter Cleaning',
        body: 'A weekly rinse removes surface debris but does not penetrate the pleats to remove body oils and fine minerals that build up over time. Once per month, remove the filter cartridge and soak it overnight in a filter degreaser solution (sold specifically for spa filters). After soaking, rinse thoroughly with a garden hose. Inspect the cartridge for tears, collapsing pleats, or brown staining that does not wash out — these are signs the cartridge needs replacement. A clean filter is the most important piece of hot tub maintenance equipment; a fouled filter allows the water to degrade faster than any chemical adjustment can correct.'
      },
      {
        id: 'full-chemistry-audit',
        h2: 'Monthly Chemistry Audit',
        body: 'Run a complete water test including all four core parameters plus CYA. In hot tubs, TDS should also be checked monthly — TDS above 1,500 ppm over your fill water baseline indicates the water is ready for a change. Calculate the Langelier Saturation Index at the current water temperature. In heated spas, the LSI rises with the temperature and the same chemistry that is acceptable in spring can become scaling by summer. Adjust any out-of-range parameters, documenting both the reading and the correction in your maintenance log.'
      },
      {
        id: 'equipment-check',
        h2: 'Equipment and Cabinet Check',
        body: 'Open the equipment cabinet and inspect for moisture on electrical components (indicating a leak), scale deposits on the heater element (visible as white crust), and unusual odours from the pump area. Run the jets on each setting and verify they have consistent flow. Check the air controls (if present) to ensure they open and close freely — stuck air controls cause aeration problems that accelerate pH drift. Check the cover for deterioration: a waterlogged cover (more than 50 lbs when lifted) is a significant heat loss point and should be replaced.'
      }
    ],
    examples: [
      {
        title: 'Monthly Filter Degreaser Routine',
        body: 'First Saturday of each month: remove the spa filter cartridge. Fill a bucket with a filter degreaser solution and submerge the cartridge completely. Soak overnight (12–24 hours). Sunday morning: remove, rinse thoroughly with a hose, and inspect. Three-month-old cartridge looks clean but has one small tear in a pleat — time to order a replacement. Meanwhile, a backup cartridge (always keep one spare) is installed. Total time: 10 minutes active work, overnight soak.'
      }
    ],
    commonMistakes: [
      'Soaking the filter in chlorine solution instead of a dedicated filter degreaser — chlorine bleaches the cartridge but does not remove oil and mineral buildup.',
      'Not keeping a spare filter cartridge — monthly cleaning requires the filter to soak overnight, leaving the spa unfiltered if no backup is available.',
      'Ignoring TDS testing and running old water that needs replacement because it looks clear.'
    ],
    relatedCalculators: ['/calculators/hot-tub-chlorine-calculator'],
    relatedResources: ['/resources/hot-tub-maintenance-log'],
    relatedTopics: ['academy/hot-tubs/weekly-spa-maintenance', 'academy/hot-tubs/refilling-your-hot-tub'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/cartridge-filter', 'glossary/total-dissolved-solids', 'glossary/langelier-saturation-index'],
    sources: [src, src2]
  },
  {
    id: 'ht-04',
    slug: 'academy/hot-tubs/refilling-your-hot-tub',
    title: 'Refilling Your Hot Tub',
    description: 'Learn how to drain, clean, and refill a hot tub correctly, and how to set up the chemistry of fresh water before the first soak.',
    summary: 'A hot tub refill is not just adding water — it requires a systematic line flush, drain, clean, and 48-hour chemistry setup before the first safe soak.',
    category: 'hot-tubs',
    readingTime: '6 min read',
    lastReviewed: '2026-06-01',
    keywords: ['refilling hot tub', 'drain refill spa', 'hot tub water change', 'spa fresh water setup'],
    overview: 'Hot tub water should be completely changed every 3–4 months depending on use. A proper refill includes a line flush before draining, a thorough clean of the shell and filter bay, and careful chemistry setup before the first soak.',
    keyFacts: [
      'Most hot tubs need a complete water change every 3–4 months, or when TDS exceeds 1,500 ppm above fill baseline.',
      'Always run a pipe flush product 1–2 hours before draining to remove biofilm from plumbing lines.',
      'Fresh water chemistry must be tested and balanced before the first soak — do not enter immediately after refilling.',
      'The correct setup sequence for fresh water: TA first, then pH, then hardness, then sanitiser.'
    ],
    sections: [
      {
        id: 'before-draining',
        h2: 'Before the Drain',
        body: 'One to two hours before draining, add a spa line flush product to the existing water and run the jets at high speed for 30–60 minutes. Pipe flush removes biofilm — the protective coating that bacteria form on the interior surfaces of the plumbing lines. Without flushing, this biofilm survives the drain and re-establishes itself in the fresh water. The flush water will often turn brown or produce foam as it dislodges biofilm — this is expected. Drain the flush water away from lawn areas (it is highly treated), then rinse the spa shell.'
      },
      {
        id: 'cleaning-the-shell',
        h2: 'Clean While Empty',
        body: 'With the spa drained, clean the shell with a spa-surface cleaner (not a household cleaner — these leave residue). Pay particular attention to the waterline area, jet housings, and the filter housing. Remove the filter cartridge and clean or replace it. Wipe down the underside of the cover. Rinse all surfaces thoroughly before refilling — any cleaner residue will cause foaming. If the jets have hard mineral scale deposits, apply a diluted citric acid solution, wait 10 minutes, and rinse.'
      },
      {
        id: 'setting-up-fresh-water',
        h2: 'Setting Up Fresh Water',
        body: 'Fill the spa using the hose inserted through the filter housing (not over the shell) to minimise air entrainment in the plumbing. Heat to operating temperature (100–104°F). Test the fresh water before adding any chemicals to establish the baseline. Add chemicals in order: 1) Sodium bicarbonate to raise TA to 80–100 ppm. Wait 4 hours. 2) pH increaser or acid to bring pH to 7.4. Wait 2 hours. 3) Calcium chloride if hardness is below 150 ppm. 4) Add chlorine to reach 3–5 ppm. Wait 30 minutes. Test all parameters and confirm they are in range before the first soak.'
      }
    ],
    examples: [
      {
        title: 'Three-Month Refill Timeline',
        body: 'Thursday 6pm: add pipe flush to running spa. Thursday 8pm: drain spa. Thursday 9pm: clean shell and filter. Friday 7am: refill with hose through filter bay. Friday 9am: heat to 102°F, run full test on fresh water. Tap water: TA 60 ppm, pH 7.1, Ca 80 ppm, FC 0. Friday 10am: add sodium bicarb to raise TA to 90 ppm. Friday 2pm: pH reads 7.4 on its own after TA adjustment. Add calcium chloride to raise Ca hardness to 200 ppm. Friday 6pm: add chlorine granules to reach 5 ppm. Saturday morning: all levels in range. Safe to soak.'
      }
    ],
    commonMistakes: [
      'Skipping the line flush before draining — biofilm in the plumbing lines will immediately contaminate the fresh water and cause persistent foam and cloudiness.',
      'Filling the spa over the shell edge (not through the filter housing) — this traps air in the plumbing lines and can cause air locks in the pump.',
      'Soaking in the freshly filled water the same day without testing and balancing chemistry first.'
    ],
    relatedCalculators: ['/calculators/hot-tub-chlorine-calculator', '/calculators/hot-tub-ph-calculator', '/calculators/spa-volume-calculator'],
    relatedResources: ['/resources/hot-tub-maintenance-log'],
    relatedTopics: ['academy/hot-tubs/monthly-spa-maintenance', 'academy/hot-tubs/daily-spa-maintenance', 'academy/fundamentals/pool-vs-hot-tub-chemistry'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/biofilm', 'glossary/total-dissolved-solids', 'glossary/total-alkalinity'],
    sources: [src, src2]
  },
  {
    id: 'ht-05',
    slug: 'academy/hot-tubs/shock-after-heavy-use',
    title: 'Shocking a Hot Tub After Heavy Use',
    description: 'Learn when and how to shock a hot tub after parties, heavy bather load, or other events that rapidly deplete sanitiser and create combined chlorine.',
    summary: 'Heavy hot tub use creates combined chlorine (chloramines) that must be eliminated by shock treatment. The correct shock dose and timing depends on the bather load and the type of shock used.',
    category: 'hot-tubs',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['hot tub shock after use', 'spa shock treatment', 'hot tub heavy use chemistry', 'spa chlorine after party'],
    overview: 'After any session with multiple bathers or extended use, hot tub water needs an oxidation treatment to destroy combined chlorine and organic compounds. This restores clear, odour-free water for the next use.',
    keyFacts: [
      'Test combined chlorine after heavy use — if above 0.5 ppm, a shock treatment is required.',
      'Non-chlorine shock (MPS) is the fastest option: it works without raising FC and the spa can be used in 15–30 minutes.',
      'Chlorine shock provides deeper treatment but requires a minimum wait of 4–8 hours.',
      'Remove the spa cover during shocking to allow off-gassing of volatile chloramines.'
    ],
    sections: [
      {
        id: 'what-heavy-use-does',
        h2: 'What Heavy Use Does to Spa Chemistry',
        body: 'Every bather introduces nitrogen-containing organic compounds into the water: sweat, body oils, hair products, and sunscreen. In a small hot tub volume (300–500 gallons), even two or three bathers in an extended session can consume most of the free chlorine and leave behind significant combined chlorine. Combined chlorine is the source of eye irritation, skin irritation, and the "hot tub smell" that many users notice after a well-used spa. It also reduces the effective sanitation of the remaining free chlorine.'
      },
      {
        id: 'types-of-shock-for-spas',
        h2: 'Shock Types for Hot Tubs',
        body: 'Non-chlorine shock (potassium monopersulfate / MPS) is the standard choice for hot tubs after a soak session. It is an oxidiser that destroys organic contaminants and combined chlorine without raising free chlorine levels. Add MPS according to the product label, run jets for 15 minutes, and the spa is typically ready for use within 30 minutes. Chlorine shock (sodium dichloro granules or liquid chlorine) is used when the water needs a more thorough reset — it raises FC significantly and requires 4–8 hours with the cover removed before the spa is safe for re-entry. Use chlorine shock at least weekly regardless of use.'
      },
      {
        id: 'after-the-shock',
        h2: 'After the Shock',
        body: 'After adding any shock product, run the jets on high speed for 15–20 minutes to mix the chemical and accelerate off-gassing of chloramines. Leave the cover open or slightly ajar during this period — closing a cover over a freshly shocked spa concentrates volatiles under the cover and drives them back into the water on the next opening. For chlorine shock, wait until FC drops below 5 ppm before re-entry. Test and record the post-shock chemistry to establish the baseline for the next use cycle.'
      }
    ],
    examples: [
      {
        title: 'Post-Party Spa Recovery',
        body: 'Six people used the spa for 90 minutes for a birthday party. After they exit: FC tests at 0.5 ppm (almost depleted), CC at 1.8 ppm (high), strong chloramine odour present. Add two doses of MPS (non-chlorine oxidiser) and run jets for 20 minutes with cover off. Test 30 minutes later: FC still 0.5 ppm (MPS does not raise FC), CC now 0.3 ppm (below threshold), odour eliminated. Add chlorine granules to raise FC to 4 ppm. Cover off for 15 minutes. Ready for next use.'
      }
    ],
    commonMistakes: [
      'Closing the spa cover immediately after adding shock — this traps volatile chloramines under the cover instead of allowing them to escape.',
      'Using non-chlorine shock as a substitute for weekly chlorine shock — MPS oxidises organics but does not kill bacteria as effectively as free chlorine.',
      'Not testing combined chlorine after heavy use — FC can look fine while CC is elevated enough to cause significant irritation.'
    ],
    relatedCalculators: ['/calculators/hot-tub-shock-calculator'],
    relatedResources: ['/resources/hot-tub-maintenance-log'],
    relatedTopics: ['academy/hot-tubs/weekly-spa-maintenance', 'academy/sanitizers/breakpoint-chlorination', 'academy/troubleshooting/foaming-hot-tubs'],
    relatedFormulas: ['formulas/shock-formula'],
    relatedGlossary: ['glossary/oxidizer', 'glossary/combined-chlorine', 'glossary/shock', 'glossary/bather-load'],
    sources: [src, src2]
  },
  {
    id: 'ht-06',
    slug: 'academy/hot-tubs/winter-spa-care',
    title: 'Winter Spa Care',
    description: 'Learn how to care for a hot tub during winter, whether you keep it running or winterize it, including chemical adjustments and freeze protection.',
    summary: 'Hot tubs used year-round need adjusted chemistry for cold weather. Unused hot tubs need proper winterization to prevent freeze damage. This guide covers both situations.',
    category: 'hot-tubs',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['winter hot tub care', 'spa winterization', 'hot tub cold weather', 'spa freeze protection'],
    overview: 'Winter hot tub management means either maintaining an active spa through colder temperatures or properly winterizing one that will not be used. Both require specific steps to protect the equipment and maintain or preserve water quality.',
    keyFacts: [
      'An active hot tub in winter uses significantly more energy — a properly fitted insulated cover reduces heat loss by 70%.',
      'If winterizing, the spa must be fully drained including all plumbing lines to prevent freeze damage.',
      'In cold climates, a hot tub should never be left with water in it without either the heater running or full winterization.',
      'Chlorine degrades faster at high operating temperatures in winter use — test more frequently during cold snaps.'
    ],
    sections: [
      {
        id: 'year-round-spa-care',
        h2: 'Year-Round Spa Care in Cold Climates',
        body: 'Running a hot tub through winter requires the same routine as summer use — daily testing, weekly maintenance, monthly deep cleans — with a few adjustments. Water temperature can stay at the normal 100–104°F; the heater simply runs more frequently to maintain it. Ensure the spa cover is in good condition and seats properly — a damaged or waterlogged cover increases energy costs significantly. Check that the cover latches are secure; strong winter winds can lift an unsecured cover. In areas with regular freezing temperatures, avoid letting the spa go into economy mode below 80°F unless you are confident the insulation and freeze protection are adequate.'
      },
      {
        id: 'winterizing',
        h2: 'Winterizing a Spa',
        body: 'If the spa will be unused for weeks or months during winter, proper winterization prevents freeze damage. Step 1: Balance chemistry and shock the water. Step 2: Drain the spa completely. Step 3: Use a shop vacuum to blow out all plumbing lines, ensuring no standing water remains. Step 4: Remove and store the filter cartridge (clean and dry it first). Step 5: Add antifreeze rated for spa use (propylene glycol, not automotive antifreeze) to each jet and drain connection if any residual water concerns remain. Step 6: Protect the equipment compartment from moisture and pests. Step 7: Leave the cover secured to protect the shell from debris and UV.'
      },
      {
        id: 'reopening-in-spring',
        h2: 'Reopening in Spring',
        body: 'Spring reopening is essentially the same as a fresh fill. Inspect the shell and jets for any cracking or damage from freezing. Remove antifreeze residue by running water through all lines before the final fill. Follow the complete refill and chemistry setup procedure: flush lines, fill, heat, test, and balance all parameters before the first soak. Do not skip the line flush step even after a properly winterized spa — biofilm can establish in the short time any moisture remains in the lines.'
      }
    ],
    examples: [
      {
        title: 'Cold Snap Emergency Response',
        body: 'A spa owner in the mountains loses power for 36 hours in January. Outside temperature drops to 15°F. The spa water temperature has dropped to 52°F when power returns. Immediate concern: has the water in the plumbing frozen? Restart the heater on low and run the jets. Check for reduced flow from any jets — this indicates an ice blockage. If blockage is found, do not force the pump — allow the heater to gradually warm the lines. Check for visible cracking in the equipment area. Once water is circulating freely, run a full chemistry test and rebalance.'
      }
    ],
    commonMistakes: [
      'Leaving a spa with water in the plumbing during a freeze event — even one hard freeze with stagnant water can crack the plumbing fittings.',
      'Using automotive antifreeze instead of propylene glycol spa antifreeze — automotive antifreeze is toxic and should never contact pool or spa water.',
      'Not checking the spa cover condition before winter — a waterlogged or cracked cover loses significant heat and can allow water infiltration that accelerates freeze damage.'
    ],
    relatedCalculators: ['/calculators/hot-tub-chlorine-calculator'],
    relatedResources: ['/resources/hot-tub-maintenance-log'],
    relatedTopics: ['academy/hot-tubs/refilling-your-hot-tub', 'academy/hot-tubs/monthly-spa-maintenance'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/biofilm', 'glossary/winterization', 'glossary/free-chlorine'],
    sources: [src]
  }
];
