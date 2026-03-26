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
