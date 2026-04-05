/**
 * Behavior / frequency programmatic pages — SERP-ordered layout.
 */
const fs = require('fs');
const path = require('path');
const { OUTPUT_DIR, TOPICS, BASE_URL, BASE_HREF } = require('./behavior-cluster-config');
const { PROGRAMMATIC_TITLE_SUFFIX } = require('../programmatic-seo-constants');
const H = require('./serp-dominance-helpers');
const S = require('../../lib/schemaEngine.js');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function buildPage(t) {
  const plainSnippet = H.truncateWordsPlain(t.answer.replace(/<[^>]+>/g, ''), 40);

  const schemaHead = S.renderAllSchemas({
    webApplication: S.generateWebApplicationSchema({
      name: 'Pool Chemistry Calculators',
      description: 'Pool and hot tub chemical calculators.',
      url: BASE_URL + '/' + t.calc
    }),
    faq: [
      { question: t.h1, answer: t.answer },
      ...t.faq.map(x => ({ question: x.q, answer: x.a }))
    ]
  });

  const steps = [
    'Test sanitizer and pH on a steady schedule.',
    'Adjust dosing when conditions change (weather, usage, parties).',
    'Use the calculator with volume and readings for precise adds.'
  ];

  const bodyFinal =
    '<main class="container">\n' +
    '    <section class="hero hero-compact">\n' +
    '      <h1>' +
    escHtml(t.h1) +
    '</h1>\n' +
    '      ' +
    H.snippetBlock(escHtml(plainSnippet)) +
    '\n' +
    '      <p class="serp-direct">' +
    escHtml(t.answer) +
    ' <span class="badge">Test often</span></p>\n' +
    '    </section>\n' +
    '    <section class="card serp-cta">\n' +
    '      <h2>Open calculator</h2>\n' +
    '      <p><a href="' +
    BASE_HREF +
    t.calc +
    '" class="btn btn-primary">Open calculator</a></p>\n' +
    '      <p class="silo-hub-cta"><a href="' +
    t.hubGuide +
    '">See full guide →</a></p>\n' +
    '    </section>\n' +
    H.stepsSection(steps) +
    '\n' +
    H.whatThisMeansSection([
      '<strong>Typical frequency:</strong> ' +
        escHtml(t.frequency) +
        ' <span class="serp-sep-inline">·</span> <strong>When it changes:</strong> ' +
        escHtml(t.conditions),
      escHtml(t.frequencyExtra)
    ]) +
    '\n' +
    H.recommendedLevelsSection([
      { html: 'Free chlorine: <strong>1–3 ppm</strong> (pools)' },
      { html: 'pH balance: <strong>7.2–7.6</strong>' },
      { html: 'Test cadence: <strong>2–3× weekly</strong> (busy pools)' }
    ]) +
    '\n' +
    H.whatHappensIfIncorrectSection(t.riskParagraphs) +
    '\n' +
    H.quickTipsSection(t.quickTips) +
    '\n' +
    H.commonQuestionsSection(t.faq) +
    '\n</main>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeAttr(t.metaDesc)}">
  <title>${escapeAttr(t.ctrTitle)}${escapeAttr(PROGRAMMATIC_TITLE_SUFFIX)}</title>
  <meta property="og:title" content="${escapeAttr(t.ctrTitle)}${escapeAttr(PROGRAMMATIC_TITLE_SUFFIX)}">
  <meta property="og:description" content="${escapeAttr(t.metaDesc)}">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="${BASE_HREF}style.css">
  ${schemaHead}
</head>
<body class="calc-page">
  <header class="site-header">
    <a href="${BASE_HREF}index.html" class="logo-link"><img src="${BASE_HREF}assets/logo.svg" alt="WaterBalanceTools" class="logo" width="180" height="36"></a>
    <nav class="nav">
      <a href="${BASE_HREF}calculators/chemical-calculator.html">Chemical Calculator</a>
      <a href="${BASE_HREF}guides/pool-chemistry-basics.html">Chemistry Guide</a>
    </nav>
  </header>
  ${bodyFinal}
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

let count = 0;
TOPICS.forEach(t => {
  fs.writeFileSync(path.join(OUTPUT_DIR, t.slug + '.html'), buildPage(t), 'utf8');
  count++;
});
console.log('Behavior cluster: wrote ' + count + ' pages to programmatic/behavior/');
