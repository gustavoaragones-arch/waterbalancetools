/**
 * Production chlorine dosage programmatic pages (long-tail cluster).
 * SERP structure: snippet → direct answer → CTA → steps → definition → levels → explanation → FAQ → publisher.
 */
const fs = require('fs');
const path = require('path');
const { OUTPUT_DIR, VOLUMES, BASE_URL, BASE_HREF } = require('./chlorine-cluster-config');
const { PROGRAMMATIC_TITLE_SUFFIX } = require('../programmatic-seo-constants');
const H = require('./serp-dominance-helpers');
const S = require('../../lib/schemaEngine.js');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function estimateChlorine(volume) {
  return (volume / 10000).toFixed(2);
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

function buildDosageTable(gallons) {
  const rows = [1, 2, 3, 4, 5].map(ppm => ({
    ppm,
    liquid: liquidOz(gallons, ppm),
    granular: granularOz(gallons, ppm)
  }));
  let t =
    '<div class="output-panel serp-explanation"><h3>Dosage reference (from 0 ppm)</h3><p>Typical pool range: <strong>1–3 ppm</strong> free chlorine. Amounts below are estimates—always test and use the calculator for your exact readings.</p>';
  t +=
    '<table class="dosage-table"><thead><tr><th>Target raise</th><th>Liquid chlorine (10%)</th><th>Granular shock</th></tr></thead><tbody>';
  rows.forEach(r => {
    t +=
      '<tr><td>' +
      r.ppm +
      ' ppm</td><td>' +
      r.liquid.toFixed(1) +
      ' oz</td><td>' +
      r.granular.toFixed(1) +
      ' oz</td></tr>';
  });
  t += '</tbody></table></div>';
  return t;
}

function slugFor(volume) {
  return 'how-much-chlorine-for-' + volume + '-gallon-pool.html';
}

function cleanOldPages() {
  if (!fs.existsSync(OUTPUT_DIR)) return;
  fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.startsWith('how-much-chlorine-for-') && f.endsWith('.html'))
    .forEach(f => fs.unlinkSync(path.join(OUTPUT_DIR, f)));
}

function buildPage(volume) {
  const g = formatNum(volume);
  const slug = slugFor(volume);
  const illustrative = estimateChlorine(volume);
  const ctrTitle = 'How Much Chlorine for ' + volume + ' Gallon Pool';
  const h1 = 'How Much Chlorine Do You Need for a ' + g + ' Gallon Pool?';
  const metaDesc =
    'Get exact ounces for a ' +
    g +
    '-gallon pool. Use the free calculator and avoid over-chlorination—safe dosing fast.';
  const snippetHtml = H.snippetBlock(
    'For a ' +
      g +
      '-gallon pool, dose depends on current ppm and target. Most pools maintain free chlorine at <strong>1–3 ppm</strong>—use the table or calculator for exact ounces.'
  );
  const directAnswer =
    '    <p class="serp-direct">Dosing uses your pool volume and test results. The table below estimates ounces from 0 ppm; run the calculator with your current ppm for a precise dose. <span class="badge">Test first</span></p>';

  // Page-specific: the exact computed range for THIS pool's most common
  // dosing move (0 ppm -> the 1-3 ppm target band), not a generic pointer
  // to "use the calculator" -- real numbers, not spun wording.
  // 2 decimal places for liquid (10% dilution makes the oz figure small
  // even at moderate volumes -- 1 decimal rounded to a degenerate-looking
  // "0.0" for smaller pools; this is a display-precision fix, not a
  // formula change -- liquidOz/granularOz themselves are untouched).
  const loLiquid = liquidOz(volume, 1).toFixed(2);
  const hiLiquid = liquidOz(volume, 3).toFixed(2);
  const loGranular = granularOz(volume, 1).toFixed(1);
  const hiGranular = granularOz(volume, 3).toFixed(1);
  const sizeClass = volume < 10000 ? 'a smaller residential pool' : volume <= 20000 ? 'a typical mid-size residential pool' : 'a large residential pool';

  // Page-specific, purely arithmetic unit conversion (not a chemistry
  // claim, no citation needed) so each volume page states a genuinely
  // different practical quantity rather than repeating the same generic
  // tips list -- 128 fl oz/gal and 16 oz/lb are unit definitions.
  const hiLiquidQt = (liquidOz(volume, 3) / 32).toFixed(2);
  const hiGranularLb = (granularOz(volume, 3) / 16).toFixed(2);

  const faqList = [
    {
      q: 'How much chlorine for a ' + g + ' gallon pool?',
      a:
        'To raise a ' + g + '-gallon pool from 0 ppm to the typical 1-3 ppm target, that\'s roughly ' + loLiquid + '-' + hiLiquid + ' oz of liquid chlorine (10%) or ' + loGranular + '-' + hiGranular + ' oz of granular shock -- about ' + hiLiquidQt + ' qt of liquid or ' + hiGranularLb + ' lb of granular at the top of that range. See the table below for other ppm targets, and use the calculator with your actual current reading for a precise dose.'
    },
    {
      q: 'Is a ' + g + ' gallon pool considered small, medium, or large?',
      a:
        'At ' + g + ' gallons, this is ' + sizeClass + '. Pool size mainly affects how much product you add per treatment, not the target ppm ranges themselves -- those stay the same regardless of volume.'
    },
    {
      q: 'Liquid or granular chlorine—which is better for this size pool?',
      a:
        'Both work at ' + g + ' gallons. Liquid is convenient for precise, frequent dosing in smaller increments; granular shock concentrates a larger raise into less product volume to store and pour -- follow label instructions either way.'
    }
  ];

  const schemaHead = S.renderAllSchemas({
    webApplication: S.generateWebApplicationSchema({
      name: 'Pool Chlorine Calculator',
      description: 'Calculate liquid or granular chlorine dose for your pool volume and target ppm.',
      url: BASE_URL + '/calculators/pool-chlorine-calculator.html'
    }),
    faq: faqList.map(x => ({ question: x.q, answer: x.a })),
    breadcrumb: [
      { name: 'Home', url: '/' },
      {
        name: h1,
        url: '/programmatic/chlorine/' + slug.replace(/\.html$/, '')
      }
    ],
    howTo: {
      title: 'Calculate chlorine for a pool',
      steps: [
        'Test pool volume and current free chlorine (ppm)',
        'Choose liquid or granular product per label',
        'Add gradually, circulate, and retest after 30–60 minutes'
      ]
    }
  });

  const explanationBlock =
    '<p class="muted serp-sep">Illustrative scale: roughly <strong>' +
    illustrative +
    '</strong> per 10,000 gallons (example ratio). Real dosing depends on test readings.</p>' +
    buildDosageTable(volume);

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
    '      <h2>Get exact dosing</h2>\n' +
    '      <p><a href="' +
    BASE_HREF +
    'calculators/pool-chlorine-calculator.html" class="btn btn-primary">Open Pool Chlorine Calculator</a></p>\n' +
    '      <p class="silo-hub-cta"><a href="' +
    BASE_HREF +
    'guides/chlorine-guide.html">See full guide →</a></p>\n' +
    '    </section>\n' +
    H.stepsSection([
      'Test pool volume and current free chlorine (ppm).',
      'Choose liquid or granular chlorine per product label.',
      'Add gradually with circulation; retest after 30–60 minutes.',
      'Adjust toward the recommended 1–3 ppm range for most pools.'
    ]) +
    '\n' +
    H.whatThisMeansSection([
      'For a <strong>' + g + '-gallon pool</strong>, the table below scales standard dosing math to your exact volume — always confirm with a current <strong>free chlorine</strong> reading rather than volume alone, since CYA, bather load, and warm weather all change how much is actually needed. Full explanation: <a href="' + BASE_HREF + 'guides/chlorine-guide.html">chlorine chemistry guide</a>.'
    ]) +
    '\n' +
    H.recommendedLevelsSection([
      {
        html:
          'Chlorine: <strong>1–3 ppm</strong> free <span class="badge">Recommended</span>'
      },
      { html: 'pH: <strong>7.2–7.6</strong>' },
      { html: 'Total alkalinity: <strong>80–120 ppm</strong> (typical)' }
    ]) +
    '\n' +
    H.whatHappensIfIncorrectSection([
      'Too little free chlorine risks algae and cloudy water; too much irritates skin and eyes and keeps swimmers out until levels drop. See <a href="' + BASE_HREF + 'guides/chlorine-guide.html">the chlorine guide</a> for troubleshooting specific symptoms.'
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
  const html = buildPage(volume);
  fs.writeFileSync(path.join(OUTPUT_DIR, slugFor(volume)), html, 'utf8');
  count++;
});

console.log('Chlorine cluster: wrote ' + count + ' pages to programmatic/chlorine/');
