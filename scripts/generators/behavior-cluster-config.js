const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUTPUT_DIR = path.join(ROOT, 'programmatic', 'behavior');

const TOPICS = [
  {
    slug: 'how-often-to-shock-pool',
    ctrTitle: 'How Often to Shock a Pool (Weekly Guide)',
    h1: 'How Often Should You Shock a Pool?',
    metaDesc:
      'Shock on a smart schedule—after parties, storms, or algae risk. Avoid guesswork with testing.',
    answer:
      'Most pools should be shocked about once per week during heavy use season, or after parties, storms, or visible problems.',
    frequency:
      'Weekly is a common baseline for outdoor pools in summer. In light-use periods, you may shock less often—test to decide.',
    conditions:
      'Shock more often after heavy bather load, rain, high heat, or if combined chlorine rises. Reduce frequency when the pool sits idle and tests stay stable.',
    calc: 'calculators/pool-shock-calculator.html',
    hubGuide: '../../guides/chlorine-guide.html',
    faq: [
      {
        q: 'Can I shock too often?',
        a: 'Yes—unnecessary shock can stress equipment and delay swimming. Test before shocking.'
      },
      {
        q: 'Should I shock after rain?',
        a: 'Often yes if contaminants or algae risk increased—test sanitizer and clarity first.'
      },
      {
        q: 'Do saltwater pools shock the same way?',
        a: 'Follow your system guidance—some use superchlorination differently than traditional shock.'
      },
      {
        q: 'How do I know shock worked?',
        a: 'Water clarity and sanitizer readings should improve—retest after circulation.'
      },
      {
        q: 'Is shock the same as daily chlorine?',
        a: 'No—shock is a larger temporary raise for remediation; daily dosing maintains range.'
      }
    ]
  },
  {
    slug: 'how-often-to-test-pool-water',
    ctrTitle: 'How Often to Test Pool Water (Simple Schedule)',
    h1: 'How Often Should You Test Pool Water?',
    metaDesc:
      'Test chlorine and pH several times weekly—catch drift before it becomes a costly fix.',
    answer:
      'Test chlorine and pH 2–3 times per week in most pools. Test alkalinity and stabilizer weekly or as your pool pro recommends.',
    frequency:
      'Busy pools and hot weather increase demand—testing twice weekly catches drift early.',
    conditions:
      'After storms, parties, or chemical adds, re-test sooner. For best results, keep strips or kits stored dry and in date.',
    calc: 'calculators/chemical-calculator.html',
    hubGuide: '../../guides/pool-chemistry-basics.html',
    faq: [
      {
        q: 'Is once a week enough testing?',
        a: 'For low-use pools it can be—most active pools benefit from 2–3× weekly chlorine/pH tests.'
      },
      {
        q: 'What should I test first?',
        a: 'Chlorine and pH most often; alkalinity and stabilizer on a weekly cadence or when problems appear.'
      },
      {
        q: 'Do digital testers replace strips?',
        a: 'Either works—consistency and proper storage matter more than brand.'
      },
      {
        q: 'Why test after adding chemicals?',
        a: 'Confirms the dose moved chemistry where you expected before making another change.'
      },
      {
        q: 'How long after rain should I test?',
        a: 'After circulation stabilizes—often within a few hours—to see real impact.'
      }
    ]
  },
  {
    slug: 'when-to-add-chlorine',
    ctrTitle: 'When to Add Chlorine to a Pool (Best Time)',
    h1: 'When Should You Add Chlorine to a Pool?',
    metaDesc:
      'Add chlorine when readings fall below target—often evening dosing reduces UV loss.',
    answer:
      'Add chlorine when free chlorine falls below your target—often in the evening to reduce UV loss. In most pools, dosing small amounts more often beats rare huge dumps.',
    frequency:
      'Check 2–3× weekly; add when below range. Hot tubs may need daily checks.',
    conditions:
      'Sun, heat, bather load, and rain all burn sanitizer faster. After shock events, wait until levels are safe before swimming.',
    calc: 'calculators/pool-chlorine-calculator.html',
    hubGuide: '../../guides/chlorine-guide.html',
    faq: [
      {
        q: 'Is evening the best time to add chlorine?',
        a: 'Often yes—less immediate UV loss compared to bright midday sun.'
      },
      {
        q: 'Can I add chlorine daily?',
        a: 'Small daily adds can work if tests show need—avoid overdosing.'
      },
      {
        q: 'What if my chlorine reads zero?',
        a: 'Shock or dose per label, then retest—verify volume and product strength.'
      },
      {
        q: 'Does CYA change dosing frequency?',
        a: 'CYA slows chlorine loss to sunlight—your test profile should include it for outdoor pools.'
      },
      {
        q: 'Should I add chlorine before or after swimming?',
        a: 'Follow safe swim ranges—typically dose when below target and wait until readings are safe.'
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
