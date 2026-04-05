/**
 * Explanation / "why" programmatic pages — SERP-ordered layout.
 */
const fs = require('fs');
const path = require('path');
const { OUTPUT_DIR, TOPICS, BASE_HREF } = require('./explanation-cluster-config');
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

function rangeBarPh() {
  return `<div class="range-visual" aria-hidden="true">
  <p class="range-caption">Typical pool pH range (illustration)</p>
  <div class="range-bar range-bar--ph">
    <span class="range-bar__tick">7.0</span>
    <div class="range-bar__track">
      <div class="range-bar__optimal"></div>
    </div>
    <span class="range-bar__tick">8.0</span>
  </div>
  <p class="muted">Optimal band shown — always test your water.</p>
</div>`;
}

function rangeBarChlorine() {
  return `<div class="range-visual" aria-hidden="true">
  <p class="range-caption">Typical pool free chlorine (illustration)</p>
  <div class="range-bar range-bar--chlorine">
    <span class="range-bar__tick">0</span>
    <div class="range-bar__track">
      <div class="range-bar__optimal"></div>
    </div>
    <span class="range-bar__tick">5</span>
  </div>
  <p class="muted">Many pools target ~1–3 ppm — confirm with local guidance.</p>
</div>`;
}

function rangeBarAlk() {
  return `<div class="range-visual" aria-hidden="true">
  <p class="range-caption">Typical total alkalinity (illustration)</p>
  <div class="range-bar range-bar--alk">
    <span class="range-bar__tick">0</span>
    <div class="range-bar__track">
      <div class="range-bar__optimal"></div>
    </div>
    <span class="range-bar__tick">200</span>
  </div>
  <p class="muted">Many pools use ~80–120 ppm — test and adjust for your surface.</p>
</div>`;
}

function extraVisual(slug) {
  if (slug === 'why-ph-affects-chlorine') return rangeBarPh();
  if (slug === 'what-is-pool-alkalinity') return rangeBarAlk();
  if (slug === 'why-shower-before-pool') return rangeBarChlorine();
  return '';
}

function buildPage(t) {
  const faqForSchema = [
    { question: t.h1, answer: t.answer },
    ...t.faq.map(x => ({ question: x.q, answer: x.a }))
  ];
  const schemaHead = S.renderAllSchemas({
    faq: faqForSchema
  });

  const plainSnippet = H.truncateWordsPlain(t.answer.replace(/<[^>]+>/g, ''), 40);
  const visual = extraVisual(t.slug);

  const steps = [
    'Start with the short answer and how it applies to your pool.',
    'Read the simple explanation and practical impact below.',
    'Test water regularly and use calculators for your exact volume.'
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
    ' <span class="badge">Core fact</span></p>\n' +
    '    </section>\n' +
    '    <section class="card serp-cta">\n' +
    '      <h2>Use calculators</h2>\n' +
    '      <p><a href="' +
    BASE_HREF +
    'calculators/pool-ph-calculator.html" class="btn btn-primary">Pool pH Calculator</a></p>\n' +
    '      <p><a href="' +
    BASE_HREF +
    'calculators/pool-alkalinity-calculator.html" class="btn btn-secondary">Alkalinity Calculator</a></p>\n' +
    '      <p class="silo-hub-cta"><a href="' +
    t.hubGuide +
    '">See full guide →</a></p>\n' +
    '    </section>\n' +
    H.stepsSection(steps) +
    '\n' +
    H.whatThisMeansSection([escHtml(t.body), escHtml(t.bodyExtra)]) +
    '\n' +
    H.recommendedLevelsSection([
      { html: 'Free chlorine: <strong>1–3 ppm</strong> (pools)' },
      { html: 'pH balance: <strong>7.2–7.6</strong>' },
      { html: 'Total alkalinity: <strong>80–120 ppm</strong> (typical)' }
    ]) +
    '\n' +
    H.whatHappensIfIncorrectSection(t.riskParagraphs) +
    '\n' +
    H.quickTipsSection(t.quickTips) +
    '\n' +
    '    <section class="serp-block">\n' +
    '      <h2>Practical impact</h2>\n' +
    '      <p>' +
    escHtml(t.impact) +
    '</p>\n' +
    '    </section>\n' +
    visual +
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
console.log('Explanations cluster: wrote ' + count + ' pages to programmatic/explanations/');
