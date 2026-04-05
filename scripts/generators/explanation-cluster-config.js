const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUTPUT_DIR = path.join(ROOT, 'programmatic', 'explanations');

const TOPICS = [
  {
    slug: 'why-shower-before-pool',
    ctrTitle: 'Why Shower Before Swimming (Pool Chemistry)',
    h1: 'Why Should You Shower Before Entering a Pool?',
    metaDesc:
      'Reduce chloramines and sanitizer load—quick facts on pool water chemistry and bather-introduced contaminants.',
    answer:
      'Showering removes oils, sweat, and contaminants that react with chlorine and reduce its effectiveness.',
    body:
      'Sunscreen, deodorant, and body oils consume sanitizer. That leaves less free chlorine available to kill germs. In most pools, a quick rinse helps water stay clearer and chemistry more stable.',
    bodyExtra:
      'Commercial and backyard pools both see measurable organic load from bathers. The effect scales with swimmer count and water temperature—hot tubs are even more sensitive. Rinsing does not replace sanitizer or filtration, but it reduces the baseline demand so daily chlorine stays in range with less yo-yo dosing.',
    riskParagraphs: [
      'Skipping showers repeatedly lets combined chlorine (chloramines) build, which irritates eyes and smells like “too much chlorine” even when free chlorine is marginal.',
      'Heavy organic load can overwhelm sanitizer during peak use, increasing the risk of cloudy water or algae taking hold between service visits.',
      'Public pools may post rinse rules for health-code reasons; ignoring them shifts burden onto operators and other swimmers.'
    ],
    quickTips: [
      'Rinse hair and skin for 30–60 seconds before entering—focus on areas with lotions and sprays.',
      'Pat dry with a clean towel if you reapply sunscreen between swims.',
      'Encourage kids to use the restroom before swimming to reduce accidental contamination.',
      'If you manage a pool, post simple “shower first” signage near the ladder.',
      'Pair bather hygiene with regular testing—chemistry tells you when load exceeded what rinsing alone could fix.',
      'After parties, shock or adjust per testing rather than assuming “the pool looks fine.”'
    ],
    impact:
      'Less combined chlorine smell, lower sanitizer demand, and better water for everyone.',
    hubGuide: '../../guides/chlorine-guide.html',
    faq: [
      {
        q: 'Does skipping a shower ruin the pool?',
        a: 'One skip will not—but repeated loads of oils and products add up fast in busy pools.'
      },
      {
        q: 'Does showering lower chlorine use?',
        a: 'It can reduce organic load, which means sanitizer lasts longer for actual disinfection.'
      },
      {
        q: 'What if the pool is outdoors?',
        a: 'Outdoor pools still benefit—sunscreen and sweat are major sanitizer consumers.'
      },
      {
        q: 'Is a quick rinse enough?',
        a: 'Even a short rinse removes a meaningful share of surface oils and products.'
      },
      {
        q: 'Do hot tubs need showering too?',
        a: 'Yes—small volume makes contaminants more concentrated in spas.'
      }
    ]
  },
  {
    slug: 'why-ph-affects-chlorine',
    ctrTitle: 'Why pH Affects Chlorine (Pool Science)',
    h1: 'Why Does pH Affect Chlorine Effectiveness?',
    metaDesc:
      'Understand pH balance and sanitizer—fix pH first, then fine-tune chlorine levels safely.',
    answer:
      'High pH reduces chlorine’s ability to sanitize effectively in many test methods because more chlorine exists in less active forms at higher pH.',
    body:
      'Chlorine exists in different forms depending on pH. When pH drifts high, a larger share may be less active for disinfection. That is why pH is kept in the common 7.2–7.6 range for pools.',
    bodyExtra:
      'Test kits usually report total or free chlorine, not “active disinfecting fraction” directly—so a normal-looking ppm at pH 8.0 can still underperform compared with the same ppm at 7.4. Cyanuric acid, temperature, and combined chlorine further change real-world performance, which is why pros treat pH and sanitizer as a pair, not isolated numbers.',
    riskParagraphs: [
      'High pH with “okay” chlorine on paper can still yield dull water, persistent algae, or complaints about water quality.',
      'Fixing only chlorine while pH stays high often leads to endless chemical spend without solving the root issue.',
      'Very low pH speeds up corrosion and discomfort even if chlorine seems effective—balance matters in both directions.'
    ],
    quickTips: [
      'Test pH whenever you test free chlorine during swim season.',
      'Adjust pH in small steps; large acid or base dumps overshoot easily.',
      'If you use a salt cell, note that aeration and cell operation can drift pH—monitor weekly.',
      'Keep alkalinity in range so pH does not bounce after each correction.',
      'Record readings after parties or storms—both can shift pH faster than routine evaporation.',
      'Use the pH calculator with accurate volume when moving more than a tenth of a unit.'
    ],
    impact:
      'You may add more chlorine yet still see poor sanitation if pH is wrong—fix pH first, then fine-tune sanitizer.',
    hubGuide: '../../guides/ph-guide.html',
    faq: [
      {
        q: 'Should I fix pH before raising chlorine?',
        a: 'Often yes—get pH near range, then adjust sanitizer based on testing.'
      },
      {
        q: 'What pH is best for chlorine?',
        a: 'Many pools target 7.2–7.6; follow your kit and equipment guidelines.'
      },
      {
        q: 'Does CYA change this relationship?',
        a: 'CYA changes how chlorine behaves in sunlight—use a full test profile, not pH alone.'
      },
      {
        q: 'Can low pH waste chlorine?',
        a: 'Low pH can increase corrosion risk and discomfort—balance matters in both directions.'
      },
      {
        q: 'How fast does pH change affect chlorine readings?',
        a: 'Chemistry shifts with dosing—retest after circulation and adjustment.'
      }
    ]
  },
  {
    slug: 'what-is-pool-alkalinity',
    ctrTitle: 'What Is Total Alkalinity (Pool Basics)',
    h1: 'What Is Total Alkalinity in a Pool?',
    metaDesc:
      'Total alkalinity buffers pH—learn what it means and how to keep water balance stable.',
    answer:
      'Total alkalinity measures the water’s ability to resist pH changes—it acts as a buffer.',
    body:
      'Think of alkalinity as shock absorption for pH. When alkalinity is in range, pH moves slowly. When it is too low or too high, pH swings or becomes hard to adjust.',
    bodyExtra:
      'Total alkalinity is not the same as pH—low TA can coexist with mid-range pH until the next rainstorm or acid dose, then pH crashes. High TA can lock pH upward until you lower alkalinity in a controlled sequence. Vinyl, plaster, and fiberglass pools sometimes have slightly different target bands; confirm with your builder or servicer.',
    riskParagraphs: [
      'Very low alkalinity accelerates metal corrosion and surface etching because pH becomes volatile.',
      'Very high alkalinity makes pH hard to lower and encourages scale in heaters and on tile lines.',
      'Ignoring TA while tuning sanitizer leads to “mystery” chemistry where chlorine and clarifiers never seem to work consistently.'
    ],
    quickTips: [
      'Test total alkalinity weekly in season alongside pH.',
      'Raise TA with baking soda or labeled increaser; lower TA with acid per label and often requires aeration technique.',
      'After large fills or acid washes, retest TA within 24 hours.',
      'Do not chase pH hourly—give alkalinity moves time to equilibrate with circulation.',
      'Salt pools still need alkalinity management; conversion does not remove the buffer requirement.',
      'Use the alkalinity calculator when planning multi-pound adjustments.'
    ],
    impact:
      'Stable alkalinity makes pH and sanitizer easier to manage. Typically test alkalinity weekly in season.',
    hubGuide: '../../guides/alkalinity-guide.html',
    faq: [
      {
        q: 'Is alkalinity the same as pH?',
        a: 'No—pH is acidity/basicity; alkalinity is buffering capacity. They are related but different.'
      },
      {
        q: 'What ppm should total alkalinity be?',
        a: 'Many pools use 80–120 ppm; follow your surface and sanitizer system.'
      },
      {
        q: 'Can I raise alkalinity without raising pH much?',
        a: 'Some products increase alkalinity with smaller pH shifts—follow label instructions.'
      },
      {
        q: 'Does high alkalinity lock pH high?',
        a: 'It can make pH harder to lower until alkalinity is adjusted in a controlled way.'
      },
      {
        q: 'How often should I test alkalinity?',
        a: 'Weekly in season is common; test more often after heavy rain or large fills.'
      }
    ]
  }
];

module.exports = {
  ROOT,
  OUTPUT_DIR,
  TOPICS,
  BASE_URL: 'https://waterbalancetools.com',
  BASE_HREF: '../../'
};
