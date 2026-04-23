/**
 * Above-the-fold authority: Related Pool Chemistry Tools (3 programmatic + 2 problem).
 * Idempotent. Run after build-link-matrix.js.
 * Usage: node scripts/inject-calculator-related-tools.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CALC_DIR = path.join(ROOT, 'calculators');

const STRIP_RE =
  /\s*<section class="calc-related-tools[^"]*"[^>]*>[\s\S]*?<\/section>\s*/gi;

const P = {
  ch10: ['../programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool.html', 'Chlorine dose for 10,000 gal'],
  ch15: ['../programmatic/chlorine/how-much-chlorine-for-15000-gallon-pool.html', 'Chlorine dose for 15,000 gal'],
  sh10: ['../programmatic/shock/how-much-shock-for-10000-gallon-pool.html', 'Shock ounces for 10,000 gal'],
  ph78: ['../programmatic/ph/how-to-adjust-ph-from-7-8-to-7-4.html', 'Adjust pool pH 7.8 → 7.4'],
  ph80: ['../programmatic/ph/how-to-adjust-ph-from-8-to-7-5.html', 'Lower pool pH 8.0 → 7.5'],
  when: ['../programmatic/behavior/when-to-add-chlorine.html', 'When to add chlorine'],
  test: ['../programmatic/behavior/how-often-to-test-pool-water.html', 'How often to test pool water'],
  ht400: ['../programmatic/hot-tubs/hot-tub-chemicals-for-400-gallons.html', 'Hot tub chemicals for 400 gal'],
  whyPh: ['../programmatic/explanations/why-ph-affects-chlorine.html', 'Why pH affects chlorine'],
  alkExp: ['../programmatic/explanations/what-is-pool-alkalinity.html', 'What is pool alkalinity']
};

const PROB = {
  green: ['../programmatic/problems/green-pool-how-much-chlorine.html', 'Green pool: chlorine & shock'],
  cloudy: ['../programmatic/problems/cloudy-pool-fix.html', 'Cloudy pool fix'],
  highCl: ['../programmatic/problems/high-chlorine-how-to-lower.html', 'High chlorine: lower safely'],
  lowAlk: ['../programmatic/problems/low-alkalinity-symptoms.html', 'Low alkalinity symptoms']
};

/** Per priority calculator + sensible defaults for other calc pages */
const BY_FILE = {
  'chemical-calculator.html': { prog: [P.ch10, P.sh10, P.ph80], prob: [PROB.green, PROB.cloudy] },
  'hot-tub-chlorine-calculator.html': {
    prog: [P.ht400, P.ch10, P.test],
    prob: [PROB.highCl, PROB.cloudy]
  },
  'pool-ph-calculator.html': { prog: [P.ph78, P.ch10, P.whyPh], prob: [PROB.cloudy, PROB.lowAlk] },
  'pool-shock-calculator.html': { prog: [P.sh10, P.ch10, P.when], prob: [PROB.green, PROB.cloudy] },
  'pool-chlorine-calculator.html': { prog: [P.ch15, P.sh10, P.ph78], prob: [PROB.green, PROB.highCl] },
  'pool-alkalinity-calculator.html': { prog: [P.alkExp, P.ph80, P.ch10], prob: [PROB.lowAlk, PROB.cloudy] },
  'hot-tub-shock-calculator.html': { prog: [P.sh10, P.ht400, P.when], prob: [PROB.green, PROB.cloudy] },
  'hot-tub-ph-calculator.html': { prog: [P.ph78, P.ht400, P.whyPh], prob: [PROB.cloudy, PROB.lowAlk] },
  'pool-cyanuric-acid-calculator.html': { prog: [P.ch10, P.sh10, P.whyPh], prob: [PROB.green, PROB.highCl] },
  'pool-volume-calculator.html': { prog: [P.ch10, P.sh10, P.ph80], prob: [PROB.cloudy, PROB.green] },
  'spa-volume-calculator.html': { prog: [P.ht400, P.ch10, P.test], prob: [PROB.cloudy, PROB.highCl] },
  'volume-calculator.html': { prog: [P.ch10, P.ph80, P.when], prob: [PROB.cloudy, PROB.green] },
  'saltwater-pool-salt-calculator.html': { prog: [P.ch10, P.when, P.test], prob: [PROB.green, PROB.highCl] },
  'pool-turnover-rate-calculator.html': { prog: [P.test, P.ch10, P.sh10], prob: [PROB.cloudy, PROB.green] }
};

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function buildSection(cfg) {
  const prog = cfg.prog;
  const prob = cfg.prob;
  const lis = [...prog, ...prob]
    .map(
      ([href, label]) =>
        '        <li><a href="' + esc(href) + '">' + esc(label) + '</a></li>'
    )
    .join('\n');
  return (
    '\n    <section class="calc-related-tools card">\n' +
    '      <h2>Related Pool Chemistry Tools</h2>\n' +
    '      <ul class="ring-links">\n' +
    lis +
    '\n      </ul>\n' +
    '    </section>\n'
  );
}

function insertBlock(html, block) {
  const h = html.replace(STRIP_RE, '');
  const hero = h.match(/<section class="hero[^"]*"[^>]*>[\s\S]*?<\/section>/i);
  if (hero) {
    const end = h.indexOf(hero[0]) + hero[0].length;
    return h.slice(0, end) + block + h.slice(end);
  }
  const intro = h.match(
    /<main class="container">\s*<h1>[^<]+<\/h1>\s*<p>[\s\S]*?<\/p>/i
  );
  if (intro) {
    const end = h.indexOf(intro[0]) + intro[0].length;
    return h.slice(0, end) + block + h.slice(end);
  }
  if (/<\/main>/i.test(h)) {
    return h.replace(/(\s*)<\/main>/i, block + '$1</main>');
  }
  return html;
}

function processFile(name) {
  const full = path.join(CALC_DIR, name);
  if (!name.endsWith('.html')) return false;
  let html = fs.readFileSync(full, 'utf8');
  if (!html.includes('</main>')) return false;
  const cfg = BY_FILE[name] || {
    prog: [P.ch10, P.sh10, P.ph80],
    prob: [PROB.green, PROB.cloudy]
  };
  const block = buildSection(cfg);
  const next = insertBlock(html, block);
  if (next === html) return false;
  fs.writeFileSync(full, next, 'utf8');
  return true;
}

let n = 0;
for (const name of fs.readdirSync(CALC_DIR)) {
  if (processFile(name)) n++;
}
console.log('inject-calculator-related-tools: updated ' + n + ' calculator pages');
