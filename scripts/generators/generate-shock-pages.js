/**
 * Shock treatment programmatic cluster — SERP-ordered layout.
 */
const fs = require('fs');
const path = require('path');
const { OUTPUT_DIR, VOLUMES, BASE_URL, BASE_HREF } = require('./shock-cluster-config');
const { PROGRAMMATIC_TITLE_SUFFIX } = require('../programmatic-seo-constants');
const H = require('./serp-dominance-helpers');
const S = require('../../lib/schemaEngine.js');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function estimateShock(volume) {
  return ((volume / 10000) * 1.5).toFixed(2);
}

function formatNum(n) {
  return Number(n).toLocaleString();
}

function shockOz(gallons, ppm) {
  return (gallons * ppm) / 10000;
}

function slugFor(volume) {
  return 'how-much-shock-for-' + volume + '-gallon-pool.html';
}

function cleanOldPages() {
  if (!fs.existsSync(OUTPUT_DIR)) return;
  fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('.html'))
    .filter(
      f =>
        f.startsWith('shock-for-') ||
        f.startsWith('how-much-shock-for-')
    )
    .forEach(f => fs.unlinkSync(path.join(OUTPUT_DIR, f)));
}

function buildTable(gallons) {
  const standard = shockOz(gallons, 10);
  const double = shockOz(gallons, 20);
  let table =
    '<div class="output-panel serp-explanation"><h3>Shock dosage reference</h3><p>Standard shock raises chlorine by about <strong>10 ppm</strong>. Use double for heavy contamination. Always verify with testing.</p>';
  table +=
    '<table class="dosage-table"><thead><tr><th>Level</th><th>Granular shock (oz)</th><th>Granular shock (lb)</th></tr></thead><tbody>';
  table +=
    '<tr><td>Standard (10 ppm)</td><td>' +
    standard.toFixed(1) +
    ' oz</td><td>' +
    (standard / 16).toFixed(2) +
    ' lb</td></tr>';
  table +=
    '<tr><td>Double (20 ppm)</td><td>' +
    double.toFixed(1) +
    ' oz</td><td>' +
    (double / 16).toFixed(2) +
    ' lb</td></tr>';
  table += '</tbody></table></div>';
  return table;
}

function buildPage(volume) {
  const g = formatNum(volume);
  const slug = slugFor(volume);
  const shock = estimateShock(volume);
  const ctrTitle = 'How Much Shock for ' + volume + ' Gallon Pool (Exact Ounces)';
  const h1 = 'How Much Shock Do You Need for a ' + g + ' Gallon Pool?';
  const metaDesc =
    'Get granular shock ounces for a ' +
    g +
    '-gallon pool. Fast dosing table plus calculator—avoid guesswork.';
  const snippetHtml = H.snippetBlock(
    'For a ' +
      g +
      '-gallon pool, shock dose depends on chlorine raise and water quality. Granular shock is sized to raise sanitizer quickly—always verify with testing.'
  );
  const directAnswer =
    '    <p class="serp-direct">Shock raises free chlorine fast. Use the table below for rough ounces at your volume, then fine-tune with the calculator for your target ppm. <span class="badge">Run pump</span></p>';

  const faqList = [
    {
      q: 'How much shock for a ' + g + ' gallon pool?',
      a: 'It depends on current water condition and target chlorine raise. Use the table on this page or the Pool Shock Calculator for exact ounces.'
    },
    {
      q: 'How much shock per 1,000 gallons?',
      a: 'Scale the per-pool estimates by volume—your calculator is the safest way to avoid overdosing.'
    },
    {
      q: 'Can you add too much shock?',
      a: 'Yes—very high chlorine can delay swimming and irritate skin. Always test and follow label safety.'
    },
    {
      q: 'How long after shocking can you swim?',
      a: 'Wait until free chlorine returns to a safe range per label and local guidance—often when water is clear and tests read normal.'
    },
    {
      q: 'Is liquid or granular shock better?',
      a: 'This page focuses on granular ounces; liquid products differ. Use the calculator and match product type to your situation.'
    }
  ];

  const schemaHead = S.renderAllSchemas({
    webApplication: S.generateWebApplicationSchema({
      name: 'Pool Shock Calculator',
      description: 'Calculate granular shock dose for your pool volume and target chlorine raise.',
      url: BASE_URL + '/calculators/pool-shock-calculator.html'
    }),
    faq: faqList.map(x => ({ question: x.q, answer: x.a })),
    breadcrumb: [
      { name: 'Home', url: '/' },
      {
        name: h1,
        url: '/programmatic/shock/' + slug.replace(/\.html$/, '')
      }
    ],
    howTo: {
      title: 'Shock a swimming pool',
      steps: [
        'Test water and confirm pool volume',
        'Choose shock strength (standard vs double) for the situation',
        'Add granular shock with circulation; retest after several hours'
      ]
    }
  });

  const explanationBlock =
    '<p class="muted serp-sep">Illustrative scale: about <strong>' +
    shock +
    '</strong> units of shock product per 10,000 gallons (example). Real dosing depends on current chlorine and water quality.</p>' +
    buildTable(volume);

  const body =
    '<main class="container">\n' +
    '    <section class="hero hero-compact">\n' +
    '      <h1>' +
    H.escapeAttr(h1) +
    '</h1>\n' +
    '      ' +
    snippetHtml +
    '\n' +
    directAnswer +
    '\n' +
    '    </section>\n' +
    '    <section class="card serp-cta">\n' +
    '      <h2>Get exact shock dosing</h2>\n' +
    '      <p><a href="' +
    BASE_HREF +
    'calculators/pool-shock-calculator.html" class="btn btn-primary">Open Pool Shock Calculator</a></p>\n' +
    '      <p class="silo-hub-cta"><a href="' +
    BASE_HREF +
    'guides/chlorine-guide.html">See full guide →</a></p>\n' +
    '    </section>\n' +
    H.stepsSection([
      'Test pool volume and current sanitizer level.',
      'Pick standard (about 10 ppm raise) or double for heavy algae—per label.',
      'Broadcast shock with pump running; brush and circulate.',
      'Retest before swimming—target safe free chlorine in range.'
    ]) +
    '\n' +
    H.whatThisMeansSection([
      'Shock treatment temporarily raises free chlorine well above daily maintenance so the water can oxidize sweat, oils, algae, and other organic load. For a <strong>' +
        g +
        '-gallon pool</strong>, the ounces on this page scale with volume; your starting sanitizer level and how “dirty” the water is still determine whether you need a standard or stronger dose.',
      'Granular shock products vary in strength and required handling—always read the label, pre-dissolve when instructed, and broadcast with the pump running. Afterward, filtration time matters as much as the initial dose: dead algae and debris must be captured by the filter or vacuumed out.'
    ]) +
    '\n' +
    H.recommendedLevelsSection([
      {
        html:
          'After shock: return to <strong>1–3 ppm</strong> free chlorine for swimming <span class="badge">Typical</span>'
      },
      { html: 'pH: <strong>7.2–7.6</strong> before/after treatment' },
      { html: 'Total alkalinity: <strong>80–120 ppm</strong> (typical)' }
    ]) +
    '\n' +
    H.whatHappensIfIncorrectSection([
      'Under-shocking during an algae bloom or after heavy contamination often wastes time: chlorine may rise briefly but not long enough to oxidize everything, and the pool can slide back to cloudy or green water.',
      'Over-shocking can keep swimmers out for an extended period, stress vinyl or equipment finishes, and mask other problems if you never verify pH, alkalinity, and filtration.',
      'Shocking without circulation or with a clogged filter leaves dead organics suspended—water can look worse before it looks better. Clean baskets, watch filter pressure, and run the pump as recommended during recovery.'
    ]) +
    '\n' +
    H.quickTipsSection([
      'Shock in the evening when practical—less immediate UV loss than midday, and you can run the pump overnight.',
      'Brush walls and floor after dosing to expose algae to treated water.',
      'Backwash or clean the filter when pressure rises; a loaded filter slows recovery.',
      'Retest before swimming; follow label wait times and local health guidance.',
      'Do not mix different shock types or add through the skimmer unless the label allows it.',
      'Pair shock with good pH—extreme pH reduces how effective the sanitizer is during the treatment window.'
    ]) +
    '\n' +
    explanationBlock +
    '\n' +
    H.commonQuestionsSection(faqList) +
    '\n</main>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${H.escapeAttr(metaDesc)}">
  <title>${H.escapeAttr(ctrTitle)}${H.escapeAttr(PROGRAMMATIC_TITLE_SUFFIX)}</title>
  <meta property="og:title" content="${H.escapeAttr(ctrTitle)}${H.escapeAttr(PROGRAMMATIC_TITLE_SUFFIX)}">
  <meta property="og:description" content="${H.escapeAttr(metaDesc)}">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="${BASE_HREF}style.css">
  ${schemaHead}
</head>
<body class="calc-page">
  <header class="site-header">
    <a href="${BASE_HREF}index.html" class="logo-link"><img src="${BASE_HREF}assets/logo.svg" alt="WaterBalanceTools" class="logo" width="180" height="36"></a>
    <nav class="nav">
      <a href="${BASE_HREF}calculators/chemical-calculator.html">Chemical Calculator</a>
      <a href="${BASE_HREF}calculators/pool-volume-calculator.html">Volume Calculator</a>
      <a href="${BASE_HREF}guides/pool-chemistry-basics.html">Chemistry Guide</a>
    </nav>
  </header>
  ${body}
  <footer class="site-footer">
    <nav class="footer-nav">
      <a href="${BASE_HREF}calculators/pool-volume-calculator.html">Pool Volume Calculator</a>
      <a href="${BASE_HREF}calculators/pool-chlorine-calculator.html">Pool Chlorine Calculator</a>
      <a href="${BASE_HREF}calculators/pool-shock-calculator.html">Pool Shock Calculator</a>
      <a href="${BASE_HREF}calculators/pool-ph-calculator.html">Pool pH Calculator</a>
      <a href="${BASE_HREF}guides/pool-chemistry-basics.html">Pool Chemistry Guide</a>
      <a href="${BASE_HREF}legal/ownership.html">Ownership</a>
      <a href="${BASE_HREF}legal/legal.html">Legal</a>
    </nav>
    <p class="footer-copy">&copy; WaterBalanceTools.com</p>
  </footer>
</body>
</html>`;
}

cleanOldPages();

let count = 0;
VOLUMES.forEach(volume => {
  fs.writeFileSync(path.join(OUTPUT_DIR, slugFor(volume)), buildPage(volume), 'utf8');
  count++;
});

console.log('Shock cluster: wrote ' + count + ' pages to programmatic/shock/');
