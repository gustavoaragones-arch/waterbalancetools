/**
 * Phase 5.2 — trust strip + Quick Answers on priority calculators (below hero / lead).
 * Idempotent. Run after inject-chart-answer-snippet.js.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CALC_DIR = path.join(ROOT, 'calculators');

/** file → { trustHtml, quickHtml } */
const PAGES = {
  'hot-tub-chlorine-calculator.html': {
    trust:
      '    <section class="trust-strip">\n' +
      '      <ul class="trust-strip-list">\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> <strong>Safe chlorine:</strong> 3–5 ppm</li>\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> <strong>Safe pH:</strong> 7.2–7.8</li>\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> Calculator updated monthly</li>\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> <strong>Reference:</strong> <a href="/hot-tub-chemical-levels-chart">Hot Tub Chemical Levels Guide</a></li>\n' +
      '      </ul>\n' +
      '    </section>\n',
    quick:
      '    <section class="quick-answers">\n' +
      '      <h2>Quick Answers</h2>\n' +
      '      <div class="faq-item"><h3>What should hot tub chlorine be?</h3><p>Keep hot tub chlorine between 3–5 ppm. Levels below may allow bacteria growth while high chlorine may irritate skin and eyes.</p></div>\n' +
      '      <div class="faq-item"><h3>How often should I test?</h3><p>Test before use and several times weekly. After heavy use or refills, test again before soaking.</p></div>\n' +
      '    </section>\n'
  },
  'chemical-calculator.html': {
    trust:
      '    <section class="trust-strip">\n' +
      '      <ul class="trust-strip-list">\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> <strong>Safe chlorine:</strong> 1–3 ppm (pools)</li>\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> <strong>Safe pH:</strong> 7.2–7.6</li>\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> <strong>Alkalinity:</strong> 80–120 ppm</li>\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> Calculator updated monthly</li>\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> <a href="/pool-chemical-levels-chart">Pool chemical levels chart</a> · <a href="/pool-chlorine-levels-chart">Chlorine chart</a> · <a href="/pool-ph-levels-chart">pH chart</a></li>\n' +
      '      </ul>\n' +
      '    </section>\n',
    quick:
      '    <section class="quick-answers">\n' +
      '      <h2>Quick Answers</h2>\n' +
      '      <div class="faq-item"><h3>What should pool chlorine be?</h3><p>Keep free chlorine between 1–3 ppm for most swimming pools. Below 1 ppm sanitizer may be too weak; above 3 ppm can irritate swimmers—test and dose in small steps.</p></div>\n' +
      '      <div class="faq-item"><h3>How often should I test pool water?</h3><p>Test chlorine and pH at least 2–3 times per week during swim season. Test alkalinity weekly and after heavy rain or large water changes.</p></div>\n' +
      '    </section>\n'
  },
  'pool-ph-calculator.html': {
    trust:
      '    <section class="trust-strip">\n' +
      '      <ul class="trust-strip-list">\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> <strong>Safe pH:</strong> 7.2–7.6</li>\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> <strong>Alkalinity:</strong> 80–120 ppm</li>\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> Calculator updated monthly</li>\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> <strong>Reference:</strong> <a href="/pool-ph-levels-chart">Pool pH Levels Chart</a></li>\n' +
      '      </ul>\n' +
      '    </section>\n',
    quick:
      '    <section class="quick-answers">\n' +
      '      <h2>Quick Answers</h2>\n' +
      '      <div class="faq-item"><h3>What is ideal pool pH?</h3><p>Most pools should stay between 7.2 and 7.6. In this range chlorine works better, water feels comfortable, and equipment is less likely to scale or corrode.</p></div>\n' +
      '      <div class="faq-item"><h3>How often should I test pool pH?</h3><p>Test pH 2–3 times per week when the pool is in use. Retest 30–60 minutes after any increaser or reducer dose before making another adjustment.</p></div>\n' +
      '    </section>\n'
  },
  'pool-shock-calculator.html': {
    trust:
      '    <section class="trust-strip">\n' +
      '      <ul class="trust-strip-list">\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> <strong>Shock raise:</strong> often 10–30 ppm (follow label)</li>\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> <strong>Swim-ready chlorine:</strong> 1–3 ppm</li>\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> Calculator updated monthly</li>\n' +
      '        <li><span class="trust-check" aria-hidden="true">✓</span> <a href="/pool-chlorine-levels-chart">Chlorine levels chart</a> · <a href="/pool-chemical-levels-chart">Full balance chart</a></li>\n' +
      '      </ul>\n' +
      '    </section>\n',
    quick:
      '    <section class="quick-answers">\n' +
      '      <h2>Quick Answers</h2>\n' +
      '      <div class="faq-item"><h3>How much shock does a pool need?</h3><p>Shock dose depends on gallons and how many ppm you want to raise—often 10–30 ppm for algae or heavy use. Enter volume and target ppm here for granular ounces.</p></div>\n' +
      '      <div class="faq-item"><h3>When should I shock my pool?</h3><p>Shock after heavy bather load, visible algae, cloudy water with low chlorine, or when combined chlorine is high. Run the pump and retest before swimming.</p></div>\n' +
      '    </section>\n'
  }
};

function strip(html) {
  let out = html.replace(
    new RegExp('\\s*<section class="trust-strip"[^>]*>[\\s\\S]*?</section>\\s*', 'gi'),
    ''
  );
  out = out.replace(
    new RegExp('\\s*<section class="quick-answers"[^>]*>[\\s\\S]*?</section>\\s*', 'gi'),
    ''
  );
  return out;
}

function blockFor(cfg) {
  return cfg.trust + cfg.quick;
}

function insertAfterAnchor(html, block) {
  const stripped = strip(html);
  const heroRe = /<section class="hero[^"]*"[^>]*>[\s\S]*?<\/section>/i;
  const hero = stripped.match(heroRe);
  if (hero) {
    const end = stripped.indexOf(hero[0]) + hero[0].length;
    return stripped.slice(0, end) + '\n' + block + stripped.slice(end);
  }
  const leadRe = /(<main[^>]*>\s*<h1>[^<]+<\/h1>\s*<p>[^<]*<\/p>)/i;
  const lead = stripped.match(leadRe);
  if (lead) {
    return stripped.replace(leadRe, '$1\n' + block);
  }
  return null;
}

let n = 0;
for (const [file, cfg] of Object.entries(PAGES)) {
  const full = path.join(CALC_DIR, file);
  if (!fs.existsSync(full)) continue;
  const html = fs.readFileSync(full, 'utf8');
  const next = insertAfterAnchor(html, blockFor(cfg));
  if (next != null && next !== html) {
    fs.writeFileSync(full, next, 'utf8');
    n++;
  }
}

console.log('inject-winner-amplification: updated ' + n + ' calculator pages');
