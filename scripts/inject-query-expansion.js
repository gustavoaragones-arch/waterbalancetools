/**
 * Phase 5.3 — People Also Ask accordion (native <details>, no extra FAQPage schema).
 * Idempotent. Run after inject-winner-amplification.js.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CALC_DIR = path.join(ROOT, 'calculators');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function paaItem(q, a) {
  return (
    '      <details class="paa-item">\n' +
    '        <summary>' +
    esc(q) +
    '</summary>\n' +
    '        <p>' +
    esc(a) +
    '</p>\n' +
    '      </details>\n'
  );
}

function section(items) {
  const body = items.map(([q, a]) => paaItem(q, a)).join('');
  return (
    '    <section class="people-also-ask">\n' +
    '      <h2>People Also Ask</h2>\n' +
    '      <div class="paa-accordion">\n' +
    body +
    '      </div>\n' +
    '    </section>\n'
  );
}

const PAGES = {
  'hot-tub-chlorine-calculator.html': section([
    [
      'What chlorine is too high in a hot tub?',
      'Above about 5 ppm free chlorine often causes odor, skin or eye irritation, and can stress covers and plastics. If readings exceed 5 ppm, pause adding sanitizer, run jets with the cover open, and retest after circulation before soaking.'
    ],
    [
      'Can I use pool chlorine in a hot tub?',
      'Many pool chlorine products work in spas if label allows spa use, but dosing differs because volume is small. Use this calculator with your exact gallons—never pour a full pool-sized dose into a hot tub.'
    ],
    [
      'Should I shock a hot tub weekly?',
      'Weekly shock is common for heavy use, but test first. Shock when combined chlorine is high, water smells, or after a drain-and-refill party—not on a fixed calendar if sanitizer already reads high.'
    ],
    [
      'Why does hot tub chlorine disappear?',
      'Heat, aeration, and bather load burn sanitizer faster than a pool. Low pH, high cyanuric acid, or biofilm on filters can also make chlorine seem to vanish—test pH and clean filters when levels drop quickly.'
    ],
    [
      'How often should I test hot tub chlorine?',
      'Test before each soak when possible and at least several times per week. After refills, storms of use, or when water smells, test again the same day before adding more chemical.'
    ],
    [
      'What pH should a hot tub stay at?',
      'Most spas target 7.2–7.8 pH. In range, chlorine works better and equipment is less stressed. Pair pH checks with sanitizer tests—fixing only chlorine while pH drifts often wastes product.'
    ]
  ]),
  'chemical-calculator.html': section([
    [
      'What happens if pool chlorine is too low?',
      'Below about 1 ppm, bacteria and algae can grow and water may turn cloudy or green. Raise sanitizer in small steps, run the pump, and retest—avoid doubling doses without testing after circulation.'
    ],
    [
      'Can I use the same chemicals for pools and hot tubs?',
      'Many products overlap, but hot tubs need higher sanitizer (often 3–5 ppm) and smaller volumes mean tiny errors matter. Select hot tub in this calculator when dosing a spa.'
    ],
    [
      'Should I balance pH before adding chlorine?',
      'Often yes. High pH weakens chlorine effectiveness; very low pH can irritate skin and corrode equipment. Get pH near 7.2–7.6, then fine-tune free chlorine based on test readings.'
    ],
    [
      'Does rain lower pool chlorine?',
      'Rain can dilute sanitizer and introduce contaminants that consume chlorine. After heavy rain, test free chlorine and pH, run the filter, and adjust chemistry before heavy swimming.'
    ],
    [
      'What is the difference between shock and chlorine?',
      'Routine chlorine maintains daily sanitizer; shock is a larger dose to oxidize waste, algae, or chloramines. Use the shock calculator for big raises; use this tool for ongoing balance.'
    ],
    [
      'How much chlorine per 10,000 gallons?',
      'It depends on current ppm and product strength—not a single fixed ounce. Enter your gallons and test results here, or open the chlorine-by-size guides linked from your volume.'
    ]
  ]),
  'pool-ph-calculator.html': section([
    [
      'Why does pH rise after rain?',
      'Rain is often slightly acidic but can carry dust and alkalinity that push pH up over time, especially with aeration. Test after storms; adjust in small steps rather than guessing from rainfall alone.'
    ],
    [
      'Can swimmers affect pool pH?',
      'Yes—sweat, sunscreen, and oils can lower pH and consume alkalinity. Heavy bather loads often need more frequent testing and smaller chemical corrections after parties.'
    ],
    [
      'What lowers pH naturally?',
      'Carbon dioxide from aeration and organic acids can slowly lower pH. Do not rely on “natural” drift—test and use measured increaser or reducer amounts for your pool volume.'
    ],
    [
      'Does alkalinity affect pH?',
      'Total alkalinity buffers pH. Low alkalinity causes pH to bounce; high alkalinity can lock pH high. Stabilize alkalinity in the 80–120 ppm range before large pH moves when possible.'
    ],
    [
      'Why does pool pH keep drifting high?',
      'Salt cells, liquid chlorine, and aeration can raise pH over time. High alkalinity and plaster sources also push pH up—test weekly and correct both pH and alkalinity, not just acid doses.'
    ],
    [
      'Can I swim if pH is 8.0?',
      'pH 8.0 is above the usual 7.2–7.6 comfort band and can reduce chlorine performance. Many owners lower pH before swimming; follow your test kit and local health guidance.'
    ]
  ]),
  'pool-shock-calculator.html': section([
    [
      'Can you swim after shocking?',
      'Wait until free chlorine falls back to a safe swim range—often 1–3 ppm—and water is clear. Follow product label wait times; retest rather than guessing based on hours alone.'
    ],
    [
      'What happens if you over-shock a pool?',
      'Very high chlorine can delay swimming, bleach liners, and irritate skin and eyes. If you overdosed, stop adding product, run the pump with good circulation, and retest every few hours.'
    ],
    [
      'How long does pool shock take to work?',
      'Oxidation often shows results within hours, but filtration and brushing matter. Run the pump continuously during recovery; cloudy or green water may need 24–72 hours and retesting.'
    ],
    [
      'Is shock the same as chlorine?',
      'Shock products are high-strength chlorine or non-chlorine oxidizers. They raise sanitizer quickly to break down waste; daily chlorine keeps routine protection between shocks.'
    ],
    [
      'Should I shock after a party?',
      'Heavy use often warrants shock to clear chloramines and organic load—test combined chlorine first. Shock at dusk when possible so UV does not burn off the dose immediately.'
    ],
    [
      'Why is my pool cloudy after shock?',
      'Dead algae, fine particles, or high pH can cloud water after shock. Keep filtering, brush walls, confirm pH is in range, and retest chlorine—clarifier only helps once chemistry is balanced.'
    ]
  ])
};

function strip(html) {
  return html.replace(
    new RegExp(
      '\\s*<section class="people-also-ask"[^>]*>[\\s\\S]*?</section>\\s*',
      'gi'
    ),
    ''
  );
}

function insertBlock(html, block) {
  const stripped = strip(html);
  const quickRe = /<section class="quick-answers"[^>]*>[\s\S]*?<\/section>/i;
  const quick = stripped.match(quickRe);
  if (quick) {
    const end = stripped.indexOf(quick[0]) + quick[0].length;
    return stripped.slice(0, end) + '\n' + block + stripped.slice(end);
  }
  const trustRe = /<section class="trust-strip"[^>]*>[\s\S]*?<\/section>/i;
  const trust = stripped.match(trustRe);
  if (trust) {
    const end = stripped.indexOf(trust[0]) + trust[0].length;
    return stripped.slice(0, end) + '\n' + block + stripped.slice(end);
  }
  const heroRe = /<section class="hero[^"]*"[^>]*>[\s\S]*?<\/section>/i;
  const hero = stripped.match(heroRe);
  if (hero) {
    const end = stripped.indexOf(hero[0]) + hero[0].length;
    return stripped.slice(0, end) + '\n' + block + stripped.slice(end);
  }
  const leadRe = /(<main[^>]*>\s*<h1>[^<]+<\/h1>\s*<p>[^<]*<\/p>)/i;
  if (leadRe.test(stripped)) {
    return stripped.replace(leadRe, '$1\n' + block);
  }
  return null;
}

let n = 0;
for (const [file, block] of Object.entries(PAGES)) {
  const full = path.join(CALC_DIR, file);
  if (!fs.existsSync(full)) continue;
  const html = fs.readFileSync(full, 'utf8');
  const next = insertBlock(html, block);
  if (next != null && next !== html) {
    fs.writeFileSync(full, next, 'utf8');
    n++;
  }
}

console.log('inject-query-expansion: updated ' + n + ' calculator pages');
