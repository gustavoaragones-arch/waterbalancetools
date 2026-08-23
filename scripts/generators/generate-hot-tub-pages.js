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
  const ctrTitle = 'Hot Tub Chemicals for ' + size + ' Gallons';
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

  // 2 decimal places for liquid -- see generate-chlorine-pages.js for why
  // (display-precision fix only, liquidOz/granularOz unchanged).
  const loLiquid = liquidOz(size, 3).toFixed(2);
  const hiLiquid = liquidOz(size, 5).toFixed(2);
  const loGranular = granularOz(size, 3).toFixed(1);
  const hiGranular = granularOz(size, 5).toFixed(1);
  const sizeClass = size <= 300 ? 'a compact 2-4 person spa' : size <= 450 ? 'a mid-size 4-6 person spa' : 'a larger 6+ person spa';
  // Page-specific unit conversion (arithmetic, not a chemistry claim).
  const hiGranularOzOnly = granularOz(size, 5).toFixed(1);

  const faqList = [
    {
      q: 'What chemicals does a ' + g + ' gallon hot tub need?',
      a:
        'To reach the typical 3-5 ppm free chlorine target from 0 ppm, a ' + g + '-gallon spa takes roughly ' + loLiquid + '-' + hiLiquid + ' oz of liquid chlorine (10%) or ' + loGranular + '-' + hiGranular + ' oz of granular product, plus pH control and regular testing. Use the calculator for your exact reading.'
    },
    {
      q: 'Is a ' + g + ' gallon hot tub small, medium, or large?',
      a: 'At ' + g + ' gallons, this is ' + sizeClass + '. Smaller spas shift chemistry faster per bather since there is less water to dilute sanitizer demand -- at ' + g + ' gallons, a full 5 ppm granular dose is only ' + hiGranularOzOnly + ' oz, small enough that even minor measuring errors matter more than in a pool.'
    },
    {
      q: 'Is bromine OK instead of chlorine for a ' + g + ' gallon spa?',
      a: 'Yes -- many spas this size use bromine instead. Bromine tablets in a floating dispenser feed gradually and are common in smaller spas; if you switch, follow bromine-specific target ranges (typically 4-8 ppm) rather than the chlorine figures on this page.'
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
    H.whatThisMeansSection([
      'A <strong>' + g + '-gallon hot tub</strong> holds far less water than a pool, so each bather, product, and top-off changes sanitizer and pH much faster than the reference table alone shows. Real dosing must follow your latest test strip or meter reading. Full explanation: <a href="' + BASE_HREF + 'guides/hot-tub-chemistry.html">hot tub chemistry guide</a>.'
    ]) +
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
    H.whatHappensIfIncorrectSection([
      'Too little sanitizer risks bacteria/biofilm in pipes, often before water looks bad; too much can irritate skin and damage covers. Small volumes make overdosing easy if you confuse pool and spa strengths. See <a href="' + BASE_HREF + 'guides/hot-tub-chemistry.html">the hot tub guide</a> for troubleshooting.'
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
  <title>${H.escapeAttr(ctrTitle)}</title>
  <meta property="og:title" content="${H.escapeAttr(ctrTitle)} | Pool Water Chemistry Guide">
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
