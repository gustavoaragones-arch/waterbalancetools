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
    frequencyExtra:
      'Think of shock as remediation, not a substitute for daily sanitizer. If you shock every few days yet free chlorine never holds, you likely need better baseline chlorination, filtration hours, or algae removal—not more shock alone. Testing combined chlorine helps you distinguish “needs oxidizer” from “needs everyday chlorine discipline.”',
    riskParagraphs: [
      'Shocking on a rigid calendar without testing can waste chemicals and stress swimmers when water was already balanced.',
      'Under-shocking after visible problems lets algae and chloramines linger, driving repeat cloudy episodes.',
      'Shocking and swimming too soon risks irritation; always verify sanitizer is back in a safe range.'
    ],
    quickTips: [
      'Test free and combined chlorine before deciding to shock.',
      'Prefer evening shock when UV would otherwise burn off your dose immediately.',
      'Brush and clean the filter path during recovery shocks.',
      'Log weather and party dates so you remember why a shock was needed.',
      'Match shock type to your pool (vinyl vs plaster) per label warnings.',
      'Use the shock calculator when bag count would otherwise be a guess.'
    ],
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
    frequencyExtra:
      'Testing is cheap compared to draining a green pool or replacing a heater scaled by bad pH. A two-minute strip read twice weekly catches drift while a single monthly check often means you only notice problems after they are expensive. Digital probes are fine if calibrated; expired reagents lie silently.',
    riskParagraphs: [
      'Rare testing lets pH or sanitizer leave safe ranges for days, increasing algae risk and surface damage.',
      'Guessing chemical adds without readings causes cumulative error—each wrong dose makes the next correction harder.',
      'Ignoring stabilizer or salt levels while watching only pH leads to “mystery” chlorine loss in sunlight.'
    ],
    quickTips: [
      'Pick consistent test times (e.g., before Saturday swim) so trends are comparable.',
      'Write results in a notebook or app; memory is unreliable across weeks.',
      'Replace strips yearly or by expiration; heat and humidity age them faster.',
      'Rinse sample cells with pool water, not tap, when using drop kits.',
      'After heavy rain, test once circulation has mixed for an hour.',
      'When in doubt, test before adding—never dose blind after a vacation.'
    ],
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
    frequencyExtra:
      'Evening dosing is a tactic, not a rule: if your chlorine is critically low midday and the pool is in use tonight, a measured morning add with circulation can be appropriate. The goal is matching dose size to measured demand. Automatic feeders and salt systems change rhythm but still need verification tests—electronics drift and storms still happen.',
    riskParagraphs: [
      'Adding large chlorine doses without retesting risks overshoot and extended no-swim periods.',
      'Waiting too long between checks in heat waves lets sanitizer hit zero, inviting algae in 24–48 hours.',
      'Dosing only by “how blue the water looks” misses early problems visible only on a test pad.'
    ],
    quickTips: [
      'When below target, dose in partial amounts; retest before doubling down.',
      'If using tablets, monitor stabilizer so you do not climb into a CYA trap.',
      'After parties, test the next morning even if water still looks clear.',
      'Liquid and granular strengths differ—always confirm percent on the label.',
      'Windy days increase debris load; skimmer performance affects chlorine demand indirectly.',
      'Pair chlorine checks with pH weekly minimum; unbalanced pH wastes sanitizer.'
    ],
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
