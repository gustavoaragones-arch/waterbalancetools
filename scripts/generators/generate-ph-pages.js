/**
 * pH adjustment programmatic cluster — SERP-ordered layout.
 */
const fs = require('fs');
const path = require('path');
const { OUTPUT_DIR, LEVELS, slugFile, BASE_URL, BASE_HREF } = require('./ph-cluster-config');
const { PROGRAMMATIC_TITLE_SUFFIX } = require('../programmatic-seo-constants');
const H = require('./serp-dominance-helpers');
const S = require('../../lib/schemaEngine.js');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function phIncreaserOz(gallons, phDiff) {
  return (gallons / 10000) * phDiff * 6;
}
function phReducerOz(gallons, phDiff) {
  return (gallons / 10000) * phDiff * 5;
}

function cleanOldPages() {
  if (!fs.existsSync(OUTPUT_DIR)) return;
  fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('.html'))
    .filter(
      f =>
        f.startsWith('raise-ph-in-') ||
        f.startsWith('lower-ph-in-') ||
        f.startsWith('how-to-adjust-ph-from-')
    )
    .forEach(f => fs.unlinkSync(path.join(OUTPUT_DIR, f)));
}

function buildTable(lvl) {
  const gallons = 10000;
  const raise = lvl.to > lvl.from;
  const diff = Math.round(Math.abs(lvl.to - lvl.from) * 100) / 100;
  const product = raise ? 'pH increaser (soda ash)' : 'pH reducer (dry acid)';
  const oz = raise ? phIncreaserOz(gallons, diff) : phReducerOz(gallons, diff);
  let t =
    '<div class="output-panel serp-explanation"><h3>Reference dose (10,000 gal pool)</h3><p>Moving from <strong>' +
    lvl.from +
    '</strong> to <strong>' +
    lvl.to +
    '</strong> is a change of <strong>' +
    diff +
    '</strong> pH units. Use <strong>' +
    product +
    '</strong>. Add gradually, circulate, and re-test.</p>';
  t += '<table class="dosage-table"><thead><tr><th>Pool volume</th><th>Approx. product</th></tr></thead><tbody>';
  t +=
    '<tr><td>10,000 gal (example)</td><td>' +
    oz.toFixed(1) +
    ' oz</td></tr>';
  t +=
    '</tbody></table><p class="muted">Your pool volume may differ—use the calculator for an exact dose.</p></div>';
  return t;
}

function buildPage(lvl) {
  const slug = slugFile(lvl);
  const fromS = String(lvl.from);
  const toS = String(lvl.to);
  const raise = lvl.to > lvl.from;
  const ctrTitle = 'How to Adjust Pool pH from ' + fromS + ' to ' + toS + ' (Safe Steps)';
  const h1 = 'How Do You Adjust Pool pH from ' + fromS + ' to ' + toS + '?';
  const metaDesc =
    'Adjust pool pH from ' +
    fromS +
    ' to ' +
    toS +
    '. Use the calculator for exact ounces and stable pH balance.';

  const snippetLine = raise
    ? 'To raise pool pH from ' +
      fromS +
      ' toward ' +
      toS +
      ', add pH increaser in small doses with the pump running—test frequently to avoid overshoot.'
    : 'To lower pool pH from ' +
      fromS +
      ' toward ' +
      toS +
      ', add pH reducer gradually while circulating water and testing frequently.';

  const snippetHtml = H.snippetBlock(snippetLine);
  const directAnswer =
    '    <p class="serp-direct">pH moves best in small steps. The 10,000-gallon reference below is a starting point—use the Pool pH Calculator with your gallons for a precise dose. <span class="badge">Go slow</span></p>';

  const diffForFaq = Math.round(Math.abs(lvl.to - lvl.from) * 100) / 100;
  const refOz = (raise ? phIncreaserOz(10000, diffForFaq) : phReducerOz(10000, diffForFaq)).toFixed(1);
  const faqList = [
    {
      q: 'How to adjust pool pH from ' + fromS + ' to ' + toS + '?',
      a:
        'That\'s a ' + diffForFaq + '-unit change, using ' + (raise ? 'pH increaser (soda ash)' : 'pH reducer (dry acid)') + ' — roughly ' + refOz + ' oz for a 10,000-gallon pool as a reference point. Add in small increments with the pump running and test after each addition; use the calculator for your exact volume.'
    },
    {
      q: 'Why is pool pH ' + (raise ? 'so low' : 'so high') + ' in the first place?',
      a: raise
        ? 'Low pH is often caused by heavy rain, certain sanitizers (like trichlor tablets), or high bather load. Check total alkalinity too — very low alkalinity lets pH swing further than expected.'
        : 'High pH commonly comes from aeration (waterfalls, fountains, spa jets), certain sanitizers, or naturally alkaline fill water. High total alkalinity can also hold pH elevated even after you add acid.'
    },
    {
      q: 'How fast can I change pH?',
      a: 'Make partial adjustments and retest after 30–60 minutes to avoid overshooting.'
    },
    {
      q: 'Do I fix alkalinity first?',
      a: 'If total alkalinity is far off, address it before large pH moves for more stable results.'
    },
    {
      q: 'Can I use muriatic acid or dry acid?',
      a: 'Both can lower pH; follow label safety and product-specific dosing for your pool volume.'
    }
  ];

  const schemaHead = S.renderAllSchemas({
    webApplication: S.generateWebApplicationSchema({
      name: 'Pool pH Calculator',
      description: 'Calculate pH increaser or reducer dose for your pool volume.',
      url: BASE_URL + '/calculators/pool-ph-calculator.html'
    }),
    faq: faqList.map(x => ({ question: x.q, answer: x.a })),
    breadcrumb: [
      { name: 'Home', url: '/' },
      {
        name: h1,
        url: '/programmatic/ph/' + slug.replace(/\.html$/, '')
      }
    ],
    howTo: {
      title: 'Adjust swimming pool pH',
      steps: [
        'Test current pH and total alkalinity',
        'Choose increaser or reducer based on direction of change',
        'Add gradually, circulate, and retest'
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
    '      <h2>Get exact pH dosing</h2>\n' +
    '      <p><a href="' +
    BASE_HREF +
    'calculators/pool-ph-calculator.html" class="btn btn-primary">Open Pool pH Calculator</a></p>\n' +
    '      <p class="silo-hub-cta"><a href="' +
    BASE_HREF +
    'guides/ph-guide.html">See full guide →</a></p>\n' +
    '    </section>\n' +
    H.stepsSection([
      'Test current pH and total alkalinity.',
      raise ? 'Add pH increaser in small doses with circulation.' : 'Add pH reducer in small doses with circulation.',
      'Wait 30–60 minutes; retest pH and adjust again if needed.',
      'Target stable pH balance in the recommended range.'
    ]) +
    '\n' +
    H.whatThisMeansSection([
      'Moving from <strong>' + fromS + '</strong> to <strong>' + toS + '</strong> is a ' + diffForFaq + '-unit change — large single-dose corrections often overshoot, since total alkalinity buffers pH and water needs time to mix. That is why this page emphasizes small steps and retesting. Full explanation: <a href="' + BASE_HREF + 'guides/ph-guide.html">pH guide</a>.'
    ]) +
    '\n' +
    H.recommendedLevelsSection([
      { html: 'pH: <strong>7.2–7.6</strong> <span class="badge">Recommended</span>' },
      { html: 'Total alkalinity: <strong>80–120 ppm</strong> (typical)' },
      { html: 'Free chlorine: <strong>1–3 ppm</strong> (pools)' }
    ]) +
    '\n' +
    H.whatHappensIfIncorrectSection([
      (raise
        ? 'Low pH increases corrosion risk for metal fixtures and surfaces and can irritate skin/eyes even when sanitizer looks fine.'
        : 'High pH reduces chlorine effectiveness and contributes to scale on surfaces and heaters.') + ' See <a href="' + BASE_HREF + 'guides/ph-guide.html">the pH guide</a> for the full picture.'
    ]) +
    '\n' +
    H.quickTipsSection([
      'Always add pH increaser or reducer in portions, with the pump running, across the deep end or per label.',
      'Wait 30–60 minutes, then retest before the next adjustment—especially on large pools.',
      'If alkalinity is very low or very high, address it alongside pH using your kit and manufacturer guidance.',
      'Record your pool volume; the Pool pH Calculator scales doses beyond the 10,000-gallon reference on this page.',
      'Wear appropriate protection when handling strong acids or bases and rinse spills per label.',
      'After heavy rain or top-offs, retest pH—source water can shift chemistry more than you expect.'
    ]) +
    '\n' +
    buildTable(lvl) +
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
LEVELS.forEach(lvl => {
  fs.writeFileSync(path.join(OUTPUT_DIR, slugFile(lvl)), buildPage(lvl), 'utf8');
  count++;
});

console.log('pH cluster: wrote ' + count + ' pages to programmatic/ph/');
