const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUTPUT_DIR = path.join(ROOT, 'programmatic', 'problems');

/**
 * Problem-resolution pages — ctrTitle = SERP title; title = natural H1.
 * hubGuide: path from programmatic/problems/*.html
 */
const PROBLEMS = [
  {
    slug: 'green-pool-how-much-chlorine',
    ctrTitle: 'Fix a Green Pool Fast (Chlorine Guide)',
    title: 'How Much Chlorine Do You Need to Fix a Green Pool?',
    metaDesc:
      'Shock algae with the right chlorine dose and filtration. Step-by-step guide plus calculators—clear water faster.',
    directAnswer:
      'To fix a green pool, you typically need shock treatment with about 2–3× normal chlorine levels. In most pools, you temporarily hold free chlorine above 5 ppm while running filtration until the water clears.',
    description:
      'Green water usually means algae. Chlorine and filtration work together—you need enough sanitizer and enough circulation time.',
    whatThisMeansExtra:
      'Algae often clings to walls and hides in corners, so brushing is not optional. Cyanuric acid, phosphate levels, and how long the pump runs all change how much chlorine you need and how fast the water clears. Expect the process to take at least one full filter turnover cycle and often longer for severe blooms.',
    riskParagraphs: [
      'Stopping treatment too soon leaves live algae that regrow overnight—water can turn green again after looking briefly better.',
      'Shocking without cleaning filtration leaves dead algae recirculating; pressure rises, flow drops, and clarity stalls.',
      'Guessing gallons or shock strength risks under-dosing (no kill) or over-dosing (long no-swim windows and equipment stress).'
    ],
    quickTips: [
      'Run the pump continuously until water is clear and chemistry is stable.',
      'Brush daily during recovery; vacuum to waste only if your setup and regulations allow.',
      'Clean or backwash the filter whenever pressure climbs into the manufacturer’s caution range.',
      'Test morning and evening while recovering; log readings so you see trends, not single points.',
      'Balance pH into a normal range before relying on shock alone—extremes blunt effectiveness.',
      'Use the shock calculator with your volume instead of copying a neighbor’s bag count.'
    ],
    solution:
      'Shock the pool, brush walls, run the pump continuously, clean or backwash the filter, and re-test daily until water is clear and chlorine is back in a safe swim range.',
    steps: [
      'Brush pool surfaces and skim debris.',
      'Add shock per label (often multiple bags for severe algae).',
      'Run the pump 24/7 until water improves.',
      'Backwash or clean the filter as pressure rises.',
      'Re-test chlorine and pH; repeat shock only if needed per product guidance.'
    ],
    calcPrimary: 'calculators/pool-shock-calculator.html',
    calcSecondary: 'calculators/pool-chlorine-calculator.html',
    hubGuide: '../../guides/chlorine-guide.html',
    faq: [
      {
        q: 'How much chlorine to fix a green pool?',
        a: 'Severe algae often needs shock-level chlorine and continuous filtration—use the shock calculator and follow label limits.'
      },
      {
        q: 'Can I swim in a green pool?',
        a: 'No—treat and clear the water first. Follow label wait times after shocking.'
      },
      {
        q: 'How long until a green pool clears?',
        a: 'Often 24–72 hours with proper shock, filtration, and cleaning. Severe cases may take longer.'
      },
      {
        q: 'Do I need algaecide every time?',
        a: 'Not always—many cases resolve with shock, brushing, and filtration. Follow product guidance for your situation.'
      },
      {
        q: 'Why did my pool turn green after rain?',
        a: 'Rain can introduce nutrients and dilute chemistry—test and adjust sanitizer and filtration after storms.'
      }
    ]
  },
  {
    slug: 'cloudy-pool-fix',
    ctrTitle: 'Cloudy Pool Fix (Clear Water Fast)',
    title: 'How Do You Fix a Cloudy Pool?',
    metaDesc:
      'Clear cloudy water with filtration, pH balance, and targeted chemistry. Practical steps—test before you dump chemicals.',
    directAnswer:
      'Cloudy pool water is usually fixed by fixing filtration and balance: run the filter longer, verify pH and alkalinity, and rule out algae or fine debris. For best results, test before adding large chemical doses.',
    description:
      'Cloudiness comes from particles, poor circulation, or chemistry drift—not always “more chlorine.”',
    whatThisMeansExtra:
      'Fine particles stay suspended when the filter cannot catch them or when sanitizer and pH are fighting your equipment. Sometimes the first sign of early algae is dull or hazy water before it turns green. Addressing filtration hours, skimmer flow, and chemical balance together clears water faster than random chemical dumps.',
    riskParagraphs: [
      'Dumping shock or clarifier without fixing circulation often wastes money—the cloud returns when the pump slows or the filter loads up.',
      'Swimming in cloudy water is risky because you cannot see the bottom and sanitizer may be out of range for actual disinfection.',
      'Ignoring rising filter pressure can burn a pump or rupture a cartridge when flow is restricted for too long.'
    ],
    quickTips: [
      'Run the filter longer (often 24 hours) during recovery while monitoring pressure.',
      'Empty skimmer and pump baskets; verify return eyeballs are aimed for good surface turnover.',
      'Test pH, alkalinity, and sanitizer together before choosing the next chemical.',
      'Brush and vacuum if debris is visible—physical removal supports chemistry.',
      'If you use clarifier, follow the label for your filter type (sand vs cartridge vs DE).',
      'Re-test after each change; cloudy water fixes are iterative, not one-shot.'
    ],
    solution:
      'Balance pH (typically 7.2–7.6), keep alkalinity in range, run the pump continuously, clean/backwash the filter, and use clarifier only if appropriate for your situation.',
    steps: [
      'Test pH, alkalinity, and sanitizer.',
      'Run the pump and filter continuously for a day when safe to do so.',
      'Clean skimmer baskets; backwash or clean cartridge as needed.',
      'Brush the pool and vacuum if debris is present.',
      'Re-test; adjust chemistry in small steps.'
    ],
    calcPrimary: 'calculators/pool-ph-calculator.html',
    calcSecondary: 'calculators/pool-alkalinity-calculator.html',
    hubGuide: '../../guides/ph-guide.html',
    faq: [
      {
        q: 'Does shock fix cloudy water?',
        a: 'Sometimes, if sanitizer is low or algae is starting—but fix filtration and balance first when cloudiness is from particles or poor circulation.'
      },
      {
        q: 'Will a clarifier fix cloudy water?',
        a: 'It can help with fine particles when filtration and chemistry are already reasonable—follow label and filter type.'
      },
      {
        q: 'How long should I run the filter?',
        a: 'Often 24 hours continuously during recovery, unless equipment guidance says otherwise.'
      },
      {
        q: 'Is cloudy water safe to swim?',
        a: 'Avoid swimming until you identify the cause and water looks clear with safe sanitizer readings.'
      },
      {
        q: 'Can low pH cause cloudiness?',
        a: 'Imbalance can contribute—test pH and alkalinity together rather than guessing.'
      }
    ]
  },
  {
    slug: 'high-chlorine-how-to-lower',
    ctrTitle: 'How to Lower High Chlorine Fast (Safe Method)',
    title: 'How Do You Lower High Chlorine in a Pool?',
    metaDesc:
      'Bring high chlorine down safely with dilution, time, and circulation. Know when you can swim again.',
    directAnswer:
      'To lower high chlorine, you typically wait for natural decay, dilute with fresh water, or (in some cases) use a reducer labeled for pools. In most pools, sunlight and time bring high chlorine down—avoid swimming until levels are safe.',
    description:
      'Very high chlorine can irritate skin and eyes and stress equipment.',
    whatThisMeansExtra:
      'Test strips and drops can read differently at the top of the range—confirm extreme readings before acting. Sunlight, CYA, and temperature all change how quickly chlorine falls. Partial drain-and-refill is sometimes the fastest path when local rules allow and water balance supports it.',
    riskParagraphs: [
      'Swimming while chlorine is very high can cause respiratory irritation, red eyes, and damaged swimwear.',
      'Sustained high sanitizer can fade liners, weaken automatic cover fabric, and accelerate metal corrosion.',
      'Adding “chlorine reducer” without testing can crash sanitizer to zero and leave the pool unprotected.'
    ],
    quickTips: [
      'Stop all automatic chlorination until levels are confirmed back in range.',
      'Run circulation to mix water evenly before trusting a spot sample.',
      'If dilution is an option, replace water gradually and retest total dissolved solids if you maintain them.',
      'Do not add pH chemicals blindly—extreme sanitizer can interact badly with large acid or base doses.',
      'Log time-of-day and weather; UV often accelerates drop-off in outdoor pools.',
      'Use the chlorine calculator to understand volume so future doses stay proportional.'
    ],
    solution:
      'Stop adding chlorine, run circulation, test daily, and partially drain/refill if levels are extreme and dilution is appropriate for your water balance.',
    steps: [
      'Confirm the reading with a fresh test.',
      'Remove chlorine tablets or feeders if still dosing.',
      'Run the pump to circulate.',
      'If levels are extreme, consider partial drain/refill per local rules.',
      'Re-test before swimming—typically wait until free chlorine is in range.'
    ],
    calcPrimary: 'calculators/pool-chlorine-calculator.html',
    calcSecondary: 'calculators/chemical-calculator.html',
    hubGuide: '../../guides/chlorine-guide.html',
    faq: [
      {
        q: 'How long does chlorine take to drop?',
        a: 'Often hours to a day depending on UV, cyanuric acid, and starting level—test to know.'
      },
      {
        q: 'Can you swim with high chlorine?',
        a: 'Avoid swimming until free chlorine returns to a safe range per health guidance and comfort.'
      },
      {
        q: 'Does sunlight lower chlorine?',
        a: 'UV can break down chlorine over time—CYA changes how fast that happens.'
      },
      {
        q: 'Should I add chemicals to lower chlorine?',
        a: 'Only use products labeled for reducing chlorine—many cases resolve with time and dilution.'
      },
      {
        q: 'Will a partial drain help?',
        a: 'Dilution can help when levels are extreme and local rules allow draining.'
      }
    ]
  },
  {
    slug: 'low-alkalinity-symptoms',
    ctrTitle: 'Low Alkalinity Symptoms (Fix TA Safely)',
    title: 'What Are the Symptoms of Low Alkalinity in a Pool?',
    metaDesc:
      'Spot low total alkalinity early—stop pH bounce and protect surfaces. Dosing steps plus alkalinity calculator.',
    directAnswer:
      'Low total alkalinity usually causes pH to swing quickly, etching or corrosion risk, and sometimes eye or skin irritation. Typically, total alkalinity should stay roughly 80–120 ppm in many pools—confirm with your test kit and surface type.',
    description:
      'Alkalinity buffers pH. When it is too low, pH becomes unstable.',
    whatThisMeansExtra:
      'Raising alkalinity usually moves pH slightly as well, so pool owners should plan adjustments in order: stabilize alkalinity first, then fine-tune pH. Salt systems, waterfalls, and frequent acid additions can pull alkalinity down over time. Tracking trends weekly prevents emergency corrections.',
    riskParagraphs: [
      'Low alkalinity lets pH crash or spike within hours, which can etch plaster, corrode heaters, and irritate swimmers.',
      'Chasing pH with acid or base while alkalinity is very low often creates a yo-yo that never stabilizes.',
      'Some sanitizers and fill water pull alkalinity down faster—ignoring TA makes chlorine and pH both harder to manage.'
    ],
    quickTips: [
      'Dose alkalinity increaser in thirds or quarters of the label’s total suggestion, circulating between adds.',
      'Retest alkalinity and pH after each waiting period—usually several hours with good flow.',
      'Record starting ppm and dose so you learn how your pool responds over the season.',
      'If you use muriatic acid for pH, expect alkalinity to drift down over time; test TA regularly.',
      'Do not dump large soda ash and bicarb on the same day without a plan—overshoot is common.',
      'Use the alkalinity calculator with accurate gallons for predictable movement toward 80–120 ppm.'
    ],
    solution:
      'Raise alkalinity with an alkalinity increaser (often sodium bicarbonate) in smaller doses, circulate, and re-test before large pH moves.',
    steps: [
      'Test total alkalinity and pH.',
      'Add alkalinity increaser per product label in divided doses.',
      'Circulate 4–8 hours; re-test.',
      'Adjust pH only after alkalinity is closer to range.'
    ],
    calcPrimary: 'calculators/pool-alkalinity-calculator.html',
    calcSecondary: 'calculators/pool-ph-calculator.html',
    hubGuide: '../../guides/alkalinity-guide.html',
    faq: [
      {
        q: 'Is low alkalinity an emergency?',
        a: 'It can damage surfaces and equipment over time—fix it soon and avoid wild pH swings.'
      },
      {
        q: 'Can I raise alkalinity and pH at the same time?',
        a: 'Some products affect both—move in steps and retest so you do not overshoot.'
      },
      {
        q: 'How fast does alkalinity change after dosing?',
        a: 'Often within hours with good circulation—always re-test before the next large adjustment.'
      },
      {
        q: 'Does low alkalinity cause cloudy water?',
        a: 'It can contribute to instability that makes other issues worse—test TA alongside pH and sanitizer.'
      },
      {
        q: 'What ppm should total alkalinity be?',
        a: 'Many pools use 80–120 ppm; follow your surface and sanitizer system for specifics.'
      }
    ]
  }
];

module.exports = {
  ROOT,
  OUTPUT_DIR,
  PROBLEMS,
  BASE_URL: 'https://waterbalancetools.com',
  BASE_HREF: '../../'
};
