/**
 * Problem-based programmatic pages — SERP-ordered layout.
 */
const fs = require('fs');
const path = require('path');
const { OUTPUT_DIR, PROBLEMS, BASE_URL, BASE_HREF } = require('./problem-cluster-config');
const { PROGRAMMATIC_TITLE_SUFFIX } = require('../programmatic-seo-constants');
const H = require('./serp-dominance-helpers');
const S = require('../../lib/schemaEngine.js');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildPage(p) {
  const plainSnippet = H.truncateWordsPlain(
    p.directAnswer.replace(/<[^>]+>/g, ''),
    40
  );

  const schemaHead = S.renderAllSchemas({
    webApplication: S.generateWebApplicationSchema({
      name: 'Pool Chemistry Calculators',
      description: 'Free calculators for chlorine, shock, pH, and alkalinity.',
      url: BASE_URL + '/' + p.calcPrimary
    }),
    faq: p.faq.map(x => ({ question: x.q, answer: x.a })),
    howTo: {
      title: 'Fix: ' + p.title.replace(/\?/, ''),
      steps: p.steps
    }
  });

  const ctaBlock =
    '    <section class="card serp-cta">\n' +
    '      <h2>Use the calculators</h2>\n' +
    '      <p><a href="' +
    BASE_HREF +
    p.calcPrimary +
    '" class="btn btn-primary">Open primary calculator</a></p>\n' +
    '      <p><a href="' +
    BASE_HREF +
    p.calcSecondary +
    '">Related calculator</a></p>\n' +
    '      <p class="silo-hub-cta"><a href="' +
    p.hubGuide +
    '">See full guide →</a></p>\n' +
    '    </section>\n';

  const bodyFinal =
    '<main class="container">\n' +
    '    <section class="hero hero-compact">\n' +
    '      <h1>' +
    escHtml(p.title) +
    '</h1>\n' +
    '      ' +
    H.snippetBlock(escHtml(plainSnippet)) +
    '\n' +
    '      <p class="serp-direct">' +
    escHtml(p.directAnswer) +
    ' <span class="badge">Test first</span></p>\n' +
    '    </section>\n' +
    ctaBlock +
    H.stepsSection(p.steps) +
    '\n' +
    H.whatThisMeansSection(escHtml(p.description)) +
    '\n' +
    H.recommendedLevelsSection([
      { html: 'Free chlorine (pools): <strong>1–3 ppm</strong>' },
      { html: 'pH balance: <strong>7.2–7.6</strong>' },
      { html: 'Total alkalinity: <strong>80–120 ppm</strong> (typical)' }
    ]) +
    '\n' +
    '    <section class="serp-block serp-explanation-text">\n' +
    '      <h2>What to do next</h2>\n' +
    '      <p>' +
    escHtml(p.solution) +
    '</p>\n' +
    '    </section>\n' +
    H.commonQuestionsSection(p.faq) +
    '\n</main>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeAttr(p.metaDesc)}">
  <title>${escapeAttr(p.ctrTitle)}${escapeAttr(PROGRAMMATIC_TITLE_SUFFIX)}</title>
  <meta property="og:title" content="${escapeAttr(p.ctrTitle)}${escapeAttr(PROGRAMMATIC_TITLE_SUFFIX)}">
  <meta property="og:description" content="${escapeAttr(p.metaDesc)}">
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
PROBLEMS.forEach(p => {
  fs.writeFileSync(path.join(OUTPUT_DIR, p.slug + '.html'), buildPage(p), 'utf8');
  count++;
});
console.log('Problems cluster: wrote ' + count + ' pages to programmatic/problems/');
