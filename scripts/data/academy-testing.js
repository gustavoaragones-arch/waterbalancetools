'use strict';
// Academy – Testing & Measurement (6 articles)

const src = 'Pool & Hot Tub Alliance — Pool & Spa Operator Handbook, 2022';
const src2 = 'Taylor Technologies — Pool/Spa Water Chemistry Reference';

module.exports = [
  {
    id: 'test-01',
    slug: 'academy/testing/using-test-strips',
    title: 'Using Test Strips',
    description: 'Learn how to use pool test strips correctly, what each pad measures, and how to read results accurately to avoid common errors.',
    summary: 'Test strips are fast and convenient, but accuracy depends on technique. Proper use, storage, and result reading makes the difference between helpful data and misleading readings.',
    category: 'testing',
    readingTime: '4 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool test strips', 'how to use test strips', 'test strip accuracy', 'pool water test strips'],
    overview: 'Test strips are the most widely used pool testing method. Used correctly, they provide fast, reasonably accurate readings for most parameters. Used incorrectly, they give readings that lead to unnecessary chemical additions.',
    keyFacts: [
      'Dip the strip into pool water for exactly 1–2 seconds — longer soaking washes off the reagents.',
      'Read results within 30–60 seconds of removing the strip — colours continue to change after that.',
      'Store strips away from heat, humidity, and direct sunlight to prevent reagent degradation.',
      'Premium 7-in-1 strips test: FC, TC, pH, TA, hardness, CYA, and bromine.'
    ],
    sections: [
      {
        id: 'how-test-strips-work',
        h2: 'How Test Strips Work',
        body: 'Test strips have separate reagent pads for each parameter being tested. Each pad contains a dry chemical reagent that reacts with the parameter it is designed to detect, producing a colour change. The intensity or shade of the colour is compared to a reference chart on the bottle to determine the measured value. The chemistry is similar to liquid test kits but pre-dosed and dried onto the pad, which makes them faster but slightly less precise — especially for measurements near the boundaries of acceptable ranges.'
      },
      {
        id: 'correct-technique',
        h2: 'Correct Technique',
        body: 'Collect the sample from mid-pool, about 18 inches below the surface, away from any return jets. Do not dip directly from the surface. Hold the strip by the end that has no pads and dip it into the water for the time specified on the bottle (typically 1–2 seconds). Remove it and hold it horizontally (do not shake it). Compare each pad to the colour chart within 30–60 seconds in natural light. Squinting at the strip under indoor lighting is a common source of misinterpretation — compare in outdoor light or under bright white light if possible.'
      },
      {
        id: 'storage-and-accuracy',
        h2: 'Storage and Accuracy',
        body: 'Test strips degrade over time when exposed to humidity, heat, and UV. Store them in the original sealed container with the desiccant, away from pool chemicals, sunscreens, and steam. Never store strips in the pool house or bathroom where humidity is high. Check the expiry date on the bottle — expired strips give unreliable results. For parameters where precision matters most (free chlorine, CYA), verify strip readings with a liquid DPD test kit at least once per month.'
      }
    ],
    examples: [
      {
        title: 'Common Strip Reading Error',
        body: 'A pool owner dips a strip for 10 seconds, then shakes off the water and reads it 2 minutes later under artificial light. The chlorine pad reads zero. They add a full shock dose. Re-testing with a liquid kit the next morning shows FC at 8 ppm — dangerous for swimming. The strip reading was wrong because of over-soaking, delayed reading, and poor lighting. The correct procedure: 1-second dip, read within 45 seconds in natural light.'
      }
    ],
    commonMistakes: [
      'Soaking the strip for more than 2 seconds, which washes reagents off the pads and gives artificially low readings.',
      'Reading results after more than 60 seconds, when colour changes no longer correspond to the reference chart.',
      'Storing strips in a humid area (poolside, bathroom) where the desiccant cannot protect them.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator'],
    relatedResources: ['/resources/water-test-log'],
    relatedTopics: ['academy/testing/using-liquid-test-kits', 'academy/testing/how-often-to-test-water', 'academy/testing/understanding-test-results'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/dpd-test', 'glossary/reagent', 'glossary/free-chlorine', 'glossary/test-strip'],
    sources: [src, src2]
  },
  {
    id: 'test-02',
    slug: 'academy/testing/using-liquid-test-kits',
    title: 'Using Liquid Test Kits',
    description: 'Learn how to use a liquid drop test kit for pool water, the difference between DPD and OTO tests, and how to get accurate results.',
    summary: 'Liquid test kits are more accurate than test strips. The DPD method measures free chlorine directly; the OTO method measures total chlorine. Understanding the difference matters.',
    category: 'testing',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['liquid test kit pool', 'DPD test pool', 'OTO test pool', 'how to use pool test kit'],
    overview: 'Liquid test kits use precise chemical reagents to measure pool water parameters. They are more accurate than test strips and are the professional standard for regular pool chemistry monitoring.',
    keyFacts: [
      'DPD reagents measure free chlorine directly — use these for accurate chlorine testing.',
      'OTO (orthotolidine) measures total chlorine, not free chlorine — it cannot distinguish between active and combined chlorine.',
      'Taylor Technologies K-2006 is the most commonly recommended complete test kit for pool owners.',
      'Always compare colours in natural light using the white background on the comparator block.'
    ],
    sections: [
      {
        id: 'dpd-vs-oto',
        h2: 'DPD vs. OTO Tests',
        body: 'OTO (orthotolidine) produces a yellow colour in the presence of chlorine and was historically common in basic 2-way test kits. It measures total chlorine — the combined value of free and combined chlorine. OTO cannot tell you how much of that chlorine is actually active and available for sanitisation. DPD (N,N-diethyl-p-phenylenediamine) produces a red/pink colour specifically with free chlorine (DPD-1) and can be extended with a second reagent to measure total chlorine (DPD-3), allowing calculation of combined chlorine. Always use DPD reagents for meaningful free chlorine measurements.'
      },
      {
        id: 'using-the-kit',
        h2: 'Step-by-Step: Using a Liquid Kit',
        body: 'Fill the sample tubes with pool water collected 18 inches below the surface, away from jets and skimmers. For the chlorine test, add the number of drops of DPD-1 reagent specified (typically 5 drops per tube), cap the tube, invert once to mix, and immediately compare the colour to the reference comparator. Repeat with DPD-3 for total chlorine if needed. For pH, use the phenol red reagent in the same way. Always rinse tubes with pool water (not tap water) before each test and after use.'
      },
      {
        id: 'kit-care',
        h2: 'Maintaining Your Test Kit',
        body: 'Liquid reagents degrade with age and exposure. Replace reagents annually, or more often if you test frequently. Store in a cool, dark place away from pool chemicals, chlorine vapour, and extreme temperatures. The Taylor Technologies K-2006 includes reagents for FC, TC, CC, pH, TA, calcium hardness, and CYA — a complete set for comprehensive water testing. Reagent bottles typically have a 2-year shelf life when stored correctly. Using old or degraded reagents produces systematically incorrect readings that lead to incorrect chemical additions.'
      }
    ],
    examples: [
      {
        title: 'Reading Free vs. Combined Chlorine',
        body: 'The pool smells like a public pool after a weekend of heavy use. Test: DPD-1 (free chlorine) shows 2.0 ppm (pink). DPD-3 (total chlorine) shows 3.5 ppm (deeper pink). Combined chlorine = 3.5 - 2.0 = 1.5 ppm. That is three times the 0.5 ppm action threshold. The smell is chloramines, not free chlorine. The fix is shock, not reducing chlorine. Without using both DPD-1 and DPD-3, you would have no way to make this diagnosis.'
      }
    ],
    commonMistakes: [
      'Using an OTO kit and treating total chlorine as if it were free chlorine — you will chronically under-chlorinate the pool.',
      'Comparing the colour tube to the reference under dim indoor or orange-tinted artificial light — accurate colour comparison requires natural or bright white light.',
      'Not rinsing sample tubes between tests, which cross-contaminates reagents and invalidates subsequent readings.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator'],
    relatedResources: ['/resources/water-test-log'],
    relatedTopics: ['academy/testing/using-test-strips', 'academy/testing/understanding-test-results', 'academy/sanitizers/understanding-free-chlorine'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/dpd-test', 'glossary/oto-test', 'glossary/free-chlorine', 'glossary/combined-chlorine', 'glossary/reagent'],
    sources: [src, src2]
  },
  {
    id: 'test-03',
    slug: 'academy/testing/digital-pool-testers',
    title: 'Digital Pool Testers',
    description: 'Learn about digital pool testing devices, including photometers and ORP/pH probes, their accuracy, maintenance requirements, and which are worth buying.',
    summary: 'Digital testers offer lab-quality accuracy for frequent testers. Photometers read chemical concentrations; ORP probes measure sanitiser activity directly. Both require regular calibration.',
    category: 'testing',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['digital pool tester', 'pool photometer', 'ORP meter pool', 'electronic pool water tester'],
    overview: 'Digital pool testers range from simple pH meters to multi-parameter photometers. They eliminate subjective colour comparison and provide objective numeric readings, but require calibration and maintenance.',
    keyFacts: [
      'Photometers use optical sensors to read reagent colour intensity — more accurate than human colour comparison.',
      'ORP (oxidation-reduction potential) meters measure the oxidising power of the water, not chlorine concentration.',
      'pH probes must be calibrated with buffer solution before each use to maintain accuracy.',
      'Even digital testers require periodic liquid reagent calibration checks against known standards.'
    ],
    sections: [
      {
        id: 'photometers',
        h2: 'Photometers',
        body: 'A photometer (colorimeter) uses an LED light and sensor to measure the absorbance of light through a water sample treated with a reagent. This removes the subjectivity of human colour comparison, making readings more consistent and accurate. Popular models like the Hanna Instruments HI83303 test free chlorine, combined chlorine, total chlorine, pH, TA, and hardness using pre-filled reagent sachets or liquid reagents. Results are displayed as numeric ppm values. Photometers are ideal for pool professionals and homeowners who test frequently and want reliable consistency.'
      },
      {
        id: 'orp-probes',
        h2: 'ORP Probes and pH Meters',
        body: 'ORP (oxidation-reduction potential) is a millivolt reading that indicates the overall oxidising power of the water. A reading above 650 mV generally indicates effective sanitisation. ORP is not a direct measure of chlorine concentration — the same free chlorine level produces different ORP readings at different pH values. pH combination meters (measuring both pH and ORP simultaneously) are widely used by pool professionals for quick in-water diagnostics. Probe-based meters require regular calibration with buffer solutions and regular cleaning to prevent fouling from mineral deposits.'
      },
      {
        id: 'maintenance',
        h2: 'Maintenance and Calibration',
        body: 'All digital testers require maintenance. pH probes must be stored in storage solution (not water or dry) and calibrated with two-point buffer solution before use. ORP probes require soaking in ORP standard solution periodically. Photometer cuvettes must be kept scrupulously clean — a single fingerprint on the optical path will corrupt readings. Replace reagent packs according to the manufacturer schedule. Even with digital testers, it is good practice to cross-check periodically with a calibrated liquid test kit.'
      }
    ],
    examples: [
      {
        title: 'When to Use a Photometer vs. Test Strips',
        body: 'A vacation rental property with a pool tested twice weekly benefits from a photometer. The consistent, objective readings make it easier to trend chemistry over time and catch gradual drift before it becomes a problem. For a residential pool tested informally once or twice a week by the homeowner, quality 7-in-1 test strips plus a monthly liquid kit check-in is a cost-effective combination. The photometer becomes valuable when consistency and auditability matter more than convenience.'
      }
    ],
    commonMistakes: [
      'Storing a pH probe dry or in plain water — the membrane dries out or dilutes, producing inaccurate readings for weeks.',
      'Skipping photometer cuvette cleaning and getting readings that drift by 0.3–0.5 ppm from contamination on the optical surfaces.',
      'Treating ORP readings as a direct substitute for chlorine testing — 650 mV does not always equal 1 ppm FC at every pH.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator'],
    relatedResources: ['/resources/water-test-log'],
    relatedTopics: ['academy/testing/using-liquid-test-kits', 'academy/testing/understanding-test-results'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/orp', 'glossary/dpd-test', 'glossary/free-chlorine', 'glossary/ph'],
    sources: [src, src2]
  },
  {
    id: 'test-04',
    slug: 'academy/testing/how-often-to-test-water',
    title: 'How Often to Test Pool Water',
    description: 'Learn the recommended pool water testing frequency for pools and hot tubs, and which parameters need to be tested daily, weekly, or monthly.',
    summary: 'Test frequency should match your pool type, usage, and season. Free chlorine and pH need the most frequent attention; hardness and CYA can be tested monthly.',
    category: 'testing',
    readingTime: '4 min read',
    lastReviewed: '2026-06-01',
    keywords: ['how often test pool water', 'pool testing frequency', 'pool water test schedule', 'spa testing frequency'],
    overview: 'Not all pool parameters change at the same rate, so not all need the same testing frequency. A practical testing schedule matches the rate of change for each parameter with the frequency of measurement.',
    keyFacts: [
      'Free chlorine: test twice per week in summer, once per week in cooler months.',
      'pH: test every time you test chlorine — they are managed together.',
      'Total alkalinity: test weekly when new, then monthly once stable.',
      'Hot tubs: test before every soak and again the following morning.'
    ],
    sections: [
      {
        id: 'pool-testing-schedule',
        h2: 'Pool Testing Schedule',
        body: 'For a residential pool during the summer swimming season, the minimum recommended schedule is: free chlorine and pH twice per week; total alkalinity and calcium hardness once per month; cyanuric acid at the start of the season and then monthly if using stabilised tablets. After every heavy rain, increase the frequency for chlorine and pH to daily until readings stabilise. After a large bather load (pool party), test the following morning and add shock if combined chlorine is above 0.5 ppm.'
      },
      {
        id: 'hot-tub-testing',
        h2: 'Hot Tub Testing',
        body: 'Hot tub water chemistry changes far faster than pool chemistry due to smaller volume, higher temperature, and concentrated bather load. Test free chlorine and pH before every soak session and again 30 minutes after the session to see how much the chemistry changed. Test total alkalinity weekly. For hot tubs used by multiple people daily (vacation rentals, short-term rental properties), test morning and evening. Log every test result so you can identify patterns and adjust your chemical routine accordingly.'
      },
      {
        id: 'triggers-for-extra-testing',
        h2: 'Triggers for Extra Testing',
        body: 'Test immediately after: a large storm or heavy rainfall (which dilutes and unbalances chemistry); a pool party or unusually high bather load; addition of any chemical (to verify the adjustment worked); visible water clarity changes (cloudiness, colour changes); green or black algae visible on surfaces; strong chlorine odour (sign of combined chlorine buildup). These events can shift chemistry rapidly enough that scheduled weekly testing is not sufficient to catch the problem before it worsens.'
      }
    ],
    examples: [
      {
        title: 'Building a Simple Weekly Schedule',
        body: 'Monday and Thursday evening: test FC and pH, adjust if needed. First Monday of each month: full test (FC, TC, CC, pH, TA, hardness, CYA). After any heavy rain: test FC and pH within 24 hours. Before any pool party: test all parameters the day before and pre-balance. After a pool party: test the next morning and shock if CC exceeds 0.5 ppm. This schedule catches 95% of problems before they require expensive treatment.'
      }
    ],
    commonMistakes: [
      'Testing only once a week during peak summer heat — chlorine can drop below safe levels within 2–3 days during a heat wave.',
      'Not testing after a heavy rainstorm, which can drop TA and hardness significantly through dilution.',
      'Not testing a hot tub before each use — a single bather session can consume significant free chlorine.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator'],
    relatedResources: ['/resources/water-test-log', '/resources/pool-maintenance-checklist'],
    relatedTopics: ['academy/testing/using-test-strips', 'academy/fundamentals/why-water-testing-matters', 'academy/testing/understanding-test-results'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/free-chlorine', 'glossary/combined-chlorine', 'glossary/bather-load'],
    sources: [src, src2]
  },
  {
    id: 'test-05',
    slug: 'academy/testing/understanding-test-results',
    title: 'Understanding Test Results',
    description: 'Learn how to interpret pool water test results, prioritise which parameters to address first, and decide when results require immediate action.',
    summary: 'Test numbers only help if you know what action they require. This guide explains how to read, prioritise, and act on pool water test results.',
    category: 'testing',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool test results guide', 'interpret pool chemistry', 'pool water reading', 'what to do pool test'],
    overview: 'Getting accurate test results is only half the challenge. Knowing what to do with those numbers — and in what order to act — is what actually keeps pool water safe and clear.',
    keyFacts: [
      'Always prioritise alkalinity first, then pH, then chlorine — the order of adjustment matters.',
      'A single out-of-range parameter does not always require immediate action — the rate of change matters.',
      'Free chlorine below 1.0 ppm is an immediate action item regardless of other readings.',
      'Test results that show all parameters at the high end of range are generally less urgent than those at the low end.'
    ],
    sections: [
      {
        id: 'reading-the-numbers',
        h2: 'Reading the Numbers',
        body: 'Each test result should be compared to its target range. Note which parameters are in range, which are low, and which are high. A result at 7.5 on a pH scale that targets 7.2–7.6 is fine. A result of 0.5 ppm for free chlorine that targets 1.0–3.0 ppm requires action. The magnitude of deviation matters — free chlorine at 0.9 ppm is borderline; free chlorine at 0 ppm requires immediate treatment. For parameters like CYA and calcium hardness, a reading slightly outside the ideal range is not an emergency — they change slowly and can be addressed at the next scheduled maintenance.'
      },
      {
        id: 'priority-order',
        h2: 'Prioritising Adjustments',
        body: 'When multiple parameters are out of range, follow the adjustment order: 1) Total alkalinity (it stabilises everything else). 2) pH (wait 4 hours after adjusting TA before testing and adjusting pH). 3) Free chlorine (ineffective until pH is in range). 4) Calcium hardness. 5) CYA. Never add all chemicals at once — spread adjustments over 24–48 hours, testing between additions. This order is important because adjusting alkalinity changes pH, and adjusting pH changes how effective your chlorine additions will be.'
      },
      {
        id: 'unusual-results',
        h2: 'When Results Look Strange',
        body: 'If a test result seems impossible — such as zero free chlorine the day after a full shock dose — consider a sampling or testing error first. Re-test with a fresh sample collected from mid-pool. If the result is confirmed, look for contributing factors: Was the shock added during the day? Is pH very high (above 8.0), making chlorine nearly inactive? Is CYA above 100 ppm, causing a "chlorine lock"? Unusual results that cannot be explained by a known event warrant a professional water test at a pool store.'
      }
    ],
    examples: [
      {
        title: 'Prioritising a Multi-Parameter Problem',
        body: 'Test shows: FC 0.5 ppm, pH 7.9, TA 60 ppm, hardness 120 ppm. Multiple issues are present. Start with alkalinity: raise TA to 90 ppm using sodium bicarbonate. Wait 4 hours and re-test. pH will likely have shifted toward the ideal range on its own once TA is corrected. If pH is still above 7.8, add pH reducer. Then add chlorine to bring FC to 2 ppm. Test again in 6 hours. Address low hardness (120 ppm) over the following week — it is not an emergency.'
      }
    ],
    commonMistakes: [
      'Making all adjustments at once without allowing time for each chemical to fully disperse and take effect.',
      'Treating a reading slightly outside the ideal range with a heavy-handed adjustment that overshoots the target.',
      'Not retesting after an adjustment to verify the result before adding the next chemical.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator', '/calculators/pool-ph-calculator', '/calculators/pool-alkalinity-calculator'],
    relatedResources: ['/resources/water-test-log'],
    relatedTopics: ['academy/testing/using-liquid-test-kits', 'academy/water-balance/water-balance-order', 'academy/fundamentals/the-four-core-water-tests'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/free-chlorine', 'glossary/ph', 'glossary/total-alkalinity', 'glossary/calcium-hardness'],
    sources: [src, src2]
  },
  {
    id: 'test-06',
    slug: 'academy/testing/common-testing-mistakes',
    title: 'Common Pool Water Testing Mistakes',
    description: 'Avoid the most common pool water testing errors that lead to incorrect results, unnecessary chemical additions, and ongoing chemistry problems.',
    summary: 'Inaccurate test results are more dangerous than no results — they lead to wrong chemical additions. These are the most common pool testing mistakes and how to avoid them.',
    category: 'testing',
    readingTime: '5 min read',
    lastReviewed: '2026-06-01',
    keywords: ['pool testing mistakes', 'inaccurate pool test', 'pool water test errors', 'common pool chemistry errors'],
    overview: 'Most chronic pool chemistry problems are caused not by the chemistry itself, but by testing errors that produce incorrect readings, leading to wrong treatments. Fixing testing technique solves many long-standing problems.',
    keyFacts: [
      'Collecting a sample near a return jet or the surface gives falsely favourable chlorine readings.',
      'Testing immediately after adding chemicals gives readings before the chemical has dispersed.',
      'Degraded reagents consistently underestimate chlorine and give inaccurate pH readings.',
      'Cross-contaminated test tubes from previous reagents can invalidate all subsequent tests.'
    ],
    sections: [
      {
        id: 'sampling-errors',
        h2: 'Sampling Errors',
        body: 'The most common testing error is collecting a bad sample. The water near a return jet is concentrated with fresh chlorine, giving a reading higher than the actual pool average. The water at the very surface has been exposed to more UV and may show lower chlorine than the bulk water. The correct sampling location is mid-pool, at elbow depth (approximately 18 inches below the surface), with the forearm dipped in and the sample tube filled pointing downward. Always sample away from skimmers, return jets, and any recent chemical addition points.'
      },
      {
        id: 'timing-errors',
        h2: 'Testing Too Soon',
        body: 'Adding chlorine and testing 10 minutes later will show elevated readings near where the chemical was added, while the rest of the pool is unchanged. Chemical additions need time to fully disperse. For liquid chlorine with the pump running, allow at least 30 minutes before testing. For granular products, allow 1–2 hours and run the pump continuously. For any adjustment to alkalinity or pH, allow 4–6 hours before retesting. Testing too soon after any chemical addition almost always leads to an incorrect reading and unnecessary follow-up treatment.'
      },
      {
        id: 'reagent-errors',
        h2: 'Reagent and Kit Errors',
        body: 'Liquid reagents degrade over time, especially when exposed to heat, light, and humidity. A reagent that looks normal may produce systematically incorrect colour responses. Replace liquid reagents annually or whenever results seem inconsistent with what you are observing in the pool. Cross-contamination between test tubes or reagent bottles is another common error — always use separate pipettes or caps for each reagent, and rinse test tubes with pool water between tests. Do not rinse with tap water, which may contain chlorine that will alter test results.'
      }
    ],
    examples: [
      {
        title: 'Solving Chronic Low Chlorine Readings',
        body: 'A pool owner has been adding extra chlorine every week because readings consistently show FC near 0.5 ppm — yet the pool stays clear. Suspicion falls on the test strips, which have been stored by the pool (hot and humid). Fresh strips from a newly opened bottle show FC at 2.5 ppm. The pool was fine all along — the degraded strips were giving systematically low chlorine readings. Switching to a liquid DPD kit confirms accurate readings going forward.'
      }
    ],
    commonMistakes: [
      'Sampling from the skimmer basket area, which has concentrated organic debris and inconsistent chlorine readings.',
      'Testing immediately after adding chemicals, before dispersion has occurred, and treating the localised high reading as the pool average.',
      'Keeping the same bottle of test strips open for more than 6 months — reagent degradation typically starts well before the printed expiry date when stored in humid or hot conditions.'
    ],
    relatedCalculators: ['/calculators/chemical-calculator'],
    relatedResources: ['/resources/water-test-log'],
    relatedTopics: ['academy/testing/using-test-strips', 'academy/testing/using-liquid-test-kits', 'academy/testing/understanding-test-results'],
    relatedFormulas: [],
    relatedGlossary: ['glossary/free-chlorine', 'glossary/dpd-test', 'glossary/reagent', 'glossary/test-strip'],
    sources: [src, src2]
  }
];
