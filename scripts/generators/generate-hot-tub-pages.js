/**
 * Hot tub chemicals programmatic cluster — SERP-ordered layout.
 */
const fs = require('fs');
const path = require('path');
const { OUTPUT_DIR, SIZES, BASE_URL, BASE_HREF } = require('./hot-tub-cluster-config');
const { PROGRAMMATIC_TITLE_SUFFIX } = require('../programmatic-seo-constants');
const H = require('./serp-dominance-helpers');
const S = require('../../lib/schemaEngine.js');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function formatNum(n) {
  return Number(n).toLocaleString();
}

function liquidOz(gallons, ppm) {
  return (gallons * ppm) / 128000;
}
function granularOz(gallons, ppm) {
  return (gallons * ppm) / 10000;
}

function slugFor(size) {
  return 'hot-tub-chemicals-for-' + size + '-gallons.html';
}

function cleanOldPages() {
  if (!fs.existsSync(OUTPUT_DIR)) return;
  fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('.html'))
    .filter(
      f =>
        f.startsWith('how-much-chlorine-for-') ||
        f.startsWith('hot-tub-chemicals-for-')
    )
    .forEach(f => fs.unlinkSync(path.join(OUTPUT_DIR, f)));
}

function buildTable(gallons) {
  const rows = [1, 2, 3, 4, 5].map(ppm => ({
    ppm,
    liquid: liquidOz(gallons, ppm),
    granular: granularOz(gallons, ppm)
  }));
  let table =
    '<div class="output-panel serp-explanation"><h3>Chlorine reference (hot tub)</h3><p>Spas often target <strong>3–5 ppm</strong> free chlorine. Amounts below are from 0 ppm—adjust for your test results.</p>';
  table +=
    '<table class="dosage-table"><thead><tr><th>Target raise</th><th>Liquid (10%)</th><th>Granular</th></tr></thead><tbody>';
  rows.forEach(r => {
    table +=
      '<tr><td>' +
      r.ppm +
      ' ppm</td><td>' +
      r.liquid.toFixed(1) +
      ' oz</td><td>' +
      r.granular.toFixed(1) +
      ' oz</td></tr>';
  });
  table += '</tbody></table></div>';
  return table;
}

function buildPage(size) {
  const g = formatNum(size);
  const slug = slugFor(size);
  const ctrTitle = 'Hot Tub Chemicals for ' + size + ' Gallons (Dosing Guide)';
  const h1 = 'What Chemicals Do You Need for a ' + g + ' Gallon Hot Tub?';
  const metaDesc =
    'Sanitizer dosing for a ' +
    g +
    '-gallon spa. Get exact chlorine reference and calculators—safe hot tub water chemistry.';

  const snippetHtml = H.snippetBlock(
    'For a ' +
      g +
      '-gallon hot tub, sanitizer dose depends on test results and target ppm. Many spas run <strong>3–5 ppm</strong> free chlorine—verify before every use.'
  );
  const directAnswer =
    '    <p class="serp-direct">Hot tub water chemistry changes fast in small volume. Use the table as a reference from 0 ppm, then plug real readings into the Hot Tub Chlorine Calculator. <span class="badge">Test often</span></p>';

  const faqList = [
    {
      q: 'What chemicals does a ' + g + ' gallon hot tub need?',
      a:
        'At minimum, sanitizer (chlorine or bromine), pH control, and regular testing. This page focuses on chlorine reference amounts; use the Hot Tub Chlorine Calculator for your exact readings.'
    },
    {
      q: 'How much chlorine per 100 gallons in a spa?',
      a: 'Scale estimates by volume—but always use test results and the calculator rather than rules of thumb alone.'
    },
    {
      q: 'Can you use pool chemicals in a hot tub?',
      a: 'Only products labeled for spas/hot tubs when recommended—concentrations differ from pools.'
    },
    {
      q: 'How often should I test hot tub water?',
      a: 'Test sanitizer and pH frequently—often daily when the spa is used.'
    },
    {
      q: 'Is bromine OK instead of chlorine?',
      a: 'Many spas use bromine. If you use bromine, follow bromine-specific charts and labels.'
    }
  ];

  const schemaHead = S.renderAllSchemas({
    webApplication: S.generateWebApplicationSchema({
      name: 'Hot Tub Chlorine Calculator',
      description: 'Calculate sanitizer dose for spa volume and target ppm.',
      url: BASE_URL + '/calculators/hot-tub-chlorine-calculator.html'
    }),
    faq: faqList.map(x => ({ question: x.q, answer: x.a })),
    breadcrumb: [
      { name: 'Home', url: '/' },
      {
        name: h1,
        url: '/programmatic/hot-tubs/' + slug.replace(/\.html$/, '')
      }
    ],
    howTo: {
      title: 'Balance hot tub water',
      steps: [
        'Know your spa volume in gallons',
        'Test sanitizer and pH',
        'Add chemicals in small steps and retest'
      ]
    }
  });

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
    '      <h2>Get exact spa dosing</h2>\n' +
    '      <p><a href="' +
    BASE_HREF +
    'calculators/hot-tub-chlorine-calculator.html" class="btn btn-primary">Open Hot Tub Chlorine Calculator</a></p>\n' +
    '      <p class="silo-hub-cta"><a href="' +
    BASE_HREF +
    'guides/hot-tub-chemistry.html">See full guide →</a></p>\n' +
    '    </section>\n' +
    H.stepsSection([
      'Confirm spa volume in gallons.',
      'Test sanitizer and pH balance.',
      'Add chlorine or other products in small increments.',
      'Circulate jets; retest before the next soak.'
    ]) +
    '\n' +
    H.whatThisMeansSection(
      'Hot tubs need tighter <strong>chlorine levels</strong> control than pools because heat and volume make chemistry swing faster. Always prioritize test results over tables.'
    ) +
    '\n' +
    H.recommendedLevelsSection([
      {
        html:
          'Free chlorine (spas): <strong>3–5 ppm</strong> <span class="badge">Common</span>'
      },
      { html: 'pH: <strong>7.2–7.8</strong> (check label/equipment)' },
      { html: 'Total alkalinity: follow spa manufacturer guidance' }
    ]) +
    '\n' +
    buildTable(size) +
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
      <a href="${BASE_HREF}calculators/spa-volume-calculator.html">Spa Volume</a>
      <a href="${BASE_HREF}guides/hot-tub-maintenance.html">Hot Tub Guide</a>
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
SIZES.forEach(size => {
  fs.writeFileSync(path.join(OUTPUT_DIR, slugFor(size)), buildPage(size), 'utf8');
  count++;
});

console.log('Hot tub cluster: wrote ' + count + ' pages to programmatic/hot-tubs/');
