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
