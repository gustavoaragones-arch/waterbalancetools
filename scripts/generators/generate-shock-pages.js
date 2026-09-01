/**
 * Shock treatment programmatic cluster — SERP-ordered layout.
 */
const fs = require('fs');
const path = require('path');
const { OUTPUT_DIR, VOLUMES, BASE_URL, BASE_HREF } = require('./shock-cluster-config');
const { PROGRAMMATIC_TITLE_SUFFIX } = require('../programmatic-seo-constants');
const H = require('./serp-dominance-helpers');
const S = require('../../lib/schemaEngine.js');
const { renderSourceList } = require('../chemistry/renderSources');

// Phase 7L (Step 7): the 30 ppm green-algae-recovery figure specifically is
// source-supported (see claim-shock-algae-recovery-green); the 10 ppm
// standard figure is not. The citation note names the row it supports
// rather than implying the whole table is validated -- do not attach this
// to the standard-dose row.
const ALGAE_ROW_SOURCE_IDS = ['poolspanews-algae-breakpoint-2016'];

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
  const algae = shockOz(gallons, 30);
  let table =
    '<div class="output-panel serp-explanation"><h3>Shock dosage reference</h3><p>Standard shock raises chlorine by about <strong>10 ppm</strong>. Green algae recovery calls for a much stronger breakpoint dose. Always verify with testing.</p>';
  table +=
    '<table class="dosage-table"><thead><tr><th>Level</th><th>Granular shock (oz)</th><th>Granular shock (lb)</th></tr></thead><tbody>';
  table +=
    '<tr><td>Standard (10 ppm)</td><td>' +
    standard.toFixed(1) +
    ' oz</td><td>' +
    (standard / 16).toFixed(2) +
    ' lb</td></tr>';
  table +=
    '<tr><td>Green algae recovery (30 ppm)</td><td>' +
    algae.toFixed(1) +
    ' oz</td><td>' +
    (algae / 16).toFixed(2) +
    ' lb</td></tr>';
  table += '</tbody></table></div>';
  const sourcesHtml = renderSourceList(ALGAE_ROW_SOURCE_IDS);
  if (sourcesHtml) {
    table += '<p class="knowledge-sources-note">The green algae recovery (30 ppm) figure above is supported by the source below. The standard 10 ppm figure is common industry guidance without a single confirmed primary source.</p>' + sourcesHtml;
  }
  return table;
}

function buildPage(volume) {
  const g = formatNum(volume);
  const slug = slugFor(volume);
  const shock = estimateShock(volume);
  const ctrTitle = 'How Much Shock for ' + volume + ' Gallon Pool';
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

  const standardOz = shockOz(volume, 10).toFixed(1);
  const algaeOz = shockOz(volume, 30).toFixed(1);
  const sizeClass = volume < 10000 ? 'a smaller residential pool' : volume <= 20000 ? 'a typical mid-size residential pool' : 'a large residential pool';
  // Page-specific unit conversion (arithmetic, not a chemistry claim) so
  // the algae-recovery dose is stated in a second, container-relevant unit
  // that genuinely differs by volume rather than repeating a generic tips
  // list on every page.
  const algaeLb = (shockOz(volume, 30) / 16).toFixed(2);

  const faqList = [
    {
      q: 'How much shock for a ' + g + ' gallon pool?',
      a: 'A standard shock (about a 10 ppm chlorine raise) for a ' + g + '-gallon pool is roughly ' + standardOz + ' oz of granular shock -- select the 10 ppm preset on the Pool Shock Calculator for a dose specific to your product. Recovering from a green algae bloom calls for a much stronger breakpoint dose, about 30 ppm (roughly ' + algaeOz + ' oz, or ' + algaeLb + ' lb, for 65% calcium hypochlorite) -- that is above the calculator\'s highest preset (20 ppm), so treat this as a reference figure and confirm against your product\'s label.'
    },
    {
      q: 'Is a ' + g + ' gallon pool considered small, medium, or large?',
      a: 'At ' + g + ' gallons, this is ' + sizeClass + '. The shock dose scales with volume; the target ppm raise (10 ppm standard, 30 ppm for green algae recovery) stays the same regardless of pool size.'
    },
    {
      q: 'How many bags of shock is that for ' + g + ' gallons?',
      a: 'Granular shock is commonly sold in 1 lb bags, so a standard dose is roughly ' + (shockOz(volume, 10) / 16).toFixed(1) + ' bags and a green-algae-recovery dose is roughly ' + algaeLb + ' bags at ' + g + ' gallons -- check your specific product\'s label, since concentration varies by brand.'
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
        'Choose shock strength (standard, or a stronger breakpoint dose for algae recovery) for the situation',
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
    'academy/sanitizers/shock-treatments-explained">See full guide →</a></p>\n' +
    '    </section>\n' +
    H.stepsSection([
      'Test pool volume and current sanitizer level.',
      'Pick standard (about 10 ppm raise) or a stronger breakpoint dose (about 30 ppm) to recover from green algae—per label.',
      'Broadcast shock with pump running; brush and circulate.',
      'Retest before swimming—target safe free chlorine in range.'
    ]) +
    '\n' +
    H.whatThisMeansSection([
      'For a <strong>' + g + '-gallon pool</strong>, the ounces on this page scale standard shock math to your exact volume — your starting sanitizer level and how "dirty" the water is still determine whether you need a standard or algae-recovery dose. Full explanation: <a href="' + BASE_HREF + 'academy/sanitizers/shock-treatments-explained">shock treatment guide</a>.'
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
      'Under-shocking can leave the pool sliding back to cloudy or green water; over-shocking keeps swimmers out longer and can stress equipment finishes. See <a href="' + BASE_HREF + 'academy/sanitizers/shock-treatments-explained">the shock treatment guide</a> for troubleshooting.'
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
  fs.writeFileSync(path.join(OUTPUT_DIR, slugFor(volume)), buildPage(volume), 'utf8');
  count++;
});

console.log('Shock cluster: wrote ' + count + ' pages to programmatic/shock/');
