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
  const ctrTitle = 'How Much Chlorine for ' + volume + ' Gallon Pool (Exact Dose)';
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

  const faqList = [
    {
      q: 'How much chlorine for a ' + g + ' gallon pool?',
      a:
        'It depends on current free chlorine and target ppm. Use the dosage table on this page or the Pool Chlorine Calculator for exact ounces.'
    },
    {
      q: 'How much chlorine per 1,000 gallons?',
      a:
        'Roughly scale the per-10,000-gallon estimates by dividing by 10—but always use your test readings and the calculator for accuracy.'
    },
    {
      q: 'Can you add too much chlorine?',
      a:
        'Yes—overdosing can irritate skin and eyes and delay swimming. Always test and add in smaller increments when unsure.'
    },
    {
      q: 'How long after adding chlorine can you swim?',
      a:
        'Follow product label guidance and typical safe ranges (often when free chlorine is back in normal range and water is clear).'
    },
    {
      q: 'Liquid or granular chlorine—which is better?',
      a:
        'Both can work. Liquid is convenient for precise dosing; granular shock is common for larger raises—follow label instructions.'
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
      'Free chlorine exists mainly as hypochlorous acid and hypochlorite—those forms kill bacteria, viruses, and algae while oxidizing sweat, oils, and debris. For a <strong>' +
        g +
        '-gallon pool</strong>, label dosing and reference tables assume known volume, known product strength, and a clear starting point for ppm.',
      'Real pools rarely match every assumption: <strong>cyanuric acid (CYA)</strong> buffers UV loss but changes how much measured chlorine is immediately active; bather load, leaves, pollen, and warm water all raise sanitizer demand. Always measure current <strong>free chlorine</strong> before adding, then use the Pool Chlorine Calculator so ounces match your readings—not pool size alone.'
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
      'Running too little free chlorine leaves water vulnerable to bacteria, algae, and murky conditions. You may notice green or cloudy water, slippery walls, or a strong “chlorine smell” from chloramines when sanitizer cannot keep up with organic load.',
      'Adding too much chlorine can irritate skin and eyes, damage liners or covers, and keep swimmers out until levels drop. Repeated overdosing wastes chemicals and can throw off pH if you never retest between adds.',
      'Misjudging pool volume leads to systematic under- or overdosing all season. Combine an accurate gallon estimate (dimensions or a volume calculator) with testing after storms, parties, or when switching between liquid, granular, and tablet products.'
    ]) +
    '\n' +
    H.quickTipsSection([
      'Test free chlorine and pH at least twice weekly during swim season; test more often after storms or heavy use.',
      'Add chlorine with the pump running; brush walls and steps so chemicals mix evenly through the body of water.',
      'Wait 30–60 minutes after each adjustment, then retest before stacking another large dose.',
      'Log your pool volume once and reuse it—small errors in gallons compound every time you dose.',
      'Keep CYA in a managed range; very high stabilizer makes real sanitation harder even when tests look acceptable.',
      'Store chlorine in a cool, dry place and never mix incompatible chemicals in the same bucket or vessel.'
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
  const html = buildPage(volume);
  fs.writeFileSync(path.join(OUTPUT_DIR, slugFor(volume)), html, 'utf8');
  count++;
});

console.log('Chlorine cluster: wrote ' + count + ' pages to programmatic/chlorine/');
