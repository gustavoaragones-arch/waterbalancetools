/**
 * Global crawl hub: static HTML, clean URLs (no .html), no duplicates.
 * Sections: Calculators → Reference Charts → all programmatic clusters → Guides.
 * Run: node scripts/generate-all-pages.js
 */
const fs = require('fs');
const path = require('path');
const urlPolicy = require('./url-policy');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'all-pages.html');

function listSortedHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.html'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function walkGuides(dir, baseFromRoot) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel = (baseFromRoot ? baseFromRoot + '/' : '') + e.name;
    if (e.isDirectory()) {
      out.push(...walkGuides(full, rel));
    } else if (e.name.endsWith('.html')) {
      out.push(rel.replace(/\\/g, '/'));
    }
  }
  return out.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function toCleanHref(relFromRoot) {
  const noExt = relFromRoot.replace(/\.html$/i, '');
  return '/' + noExt;
}

const LABEL_OVERRIDES = {
  'pool-chemistry-reference.html': 'Pool Chemistry Reference Guide'
};

function titleFromFile(name) {
  if (LABEL_OVERRIDES[name]) return LABEL_OVERRIDES[name];
  return name
    .replace(/\.html$/i, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function ulLinks(paths) {
  const seen = new Set();
  const lines = [];
  for (const p of paths) {
    const href = toCleanHref(p);
    if (seen.has(href)) continue;
    seen.add(href);
    const label = titleFromFile(path.basename(p));
    lines.push('        <li><a href="' + href + '">' + label + '</a></li>');
  }
  return lines.join('\n');
}

function sectionBlock(h2, paths) {
  if (!paths.length) return '';
  return (
    '    <h2>' +
    h2 +
    '</h2>\n' +
    '    <ul class="ring-links all-pages-list">\n' +
    ulLinks(paths) +
    '\n    </ul>\n'
  );
}

const calculators   = listSortedHtml(path.join(ROOT, 'calculators'))
  .map(f => 'calculators/' + f)
  .filter(rel => !urlPolicy.isRedirectSource(rel));
const comparisons   = listSortedHtml(path.join(ROOT, 'comparisons')).map(f => 'comparisons/' + f);
const questions     = listSortedHtml(path.join(ROOT, 'guides/questions')).map(f => 'guides/questions/' + f);

function progPages(subdir) {
  return listSortedHtml(path.join(ROOT, 'programmatic', subdir)).map(
    f => 'programmatic/' + subdir + '/' + f
  );
}

const chlorine      = progPages('chlorine');
const shockPages    = progPages('shock');
const phPages       = progPages('ph');
const hotTubPages   = progPages('hot-tubs');
const problems      = progPages('problems');
const behavior      = progPages('behavior');
const explanations  = progPages('explanations');
const guides = walkGuides(path.join(ROOT, 'guides'), 'guides');

const referenceChartsBlock =
  '    <h2>Reference Charts</h2>\n' +
  '    <ul class="ring-links all-pages-list">\n' +
  '        <li><a href="/pool-chemical-levels-chart">Pool Chemical Levels Chart</a></li>\n' +
  '        <li><a href="/pool-chlorine-levels-chart">Chlorine Levels Chart</a></li>\n' +
  '        <li><a href="/pool-ph-levels-chart">pH Levels Chart</a></li>\n' +
  '        <li><a href="/pool-cya-levels-chart">Pool CYA Levels Chart</a></li>\n' +
  '        <li><a href="/pool-alkalinity-levels-chart">Pool Alkalinity Levels Chart</a></li>\n' +
  '        <li><a href="/hot-tub-chlorine-levels-chart">Hot Tub Chlorine Levels Chart</a></li>\n' +
  '        <li><a href="/hot-tub-chemical-levels-chart">Hot Tub Chemical Levels Chart</a></li>\n' +
  '        <li><a href="/salt-water-pool-chemical-levels-chart">Salt Water Pool Chemical Levels Chart</a></li>\n' +
  '    </ul>\n';

const referenceGuides = listSortedHtml(path.join(ROOT, 'reference')).map(f => 'reference/' + f);

// System Hub block (Phase 7)
const systemHubBlock =
  '    <h2>System Hub</h2>\n' +
  '    <ul class="ring-links all-pages-list">\n' +
  '        <li><a href="/pool-chemistry-system">Pool Chemistry System: How All Parameters Work Together</a></li>\n' +
  '    </ul>\n';

// Phase 7O (Step 20/21): releases/index.html and its 3 children had zero
// inbound links from anywhere outside their own small cluster -- a real
// crawl-discovery island with no bridge to the main site graph. all-pages
// is the crawl-support mechanism explicitly meant to guarantee every
// intended canonical page family is reachable, so it is the right place
// to add this one link (not a link-farm addition -- a single, real,
// missing family).
const releasesBlock =
  '    <h2>Releases</h2>\n' +
  '    <ul class="ring-links all-pages-list">\n' +
  '        <li><a href="/releases">Release History</a></li>\n' +
  '    </ul>\n';

const bodySections =
  systemHubBlock +
  sectionBlock('Calculators', calculators) +
  referenceChartsBlock +
  sectionBlock('Reference Library', referenceGuides) +
  sectionBlock('Comparisons', comparisons) +
  releasesBlock +
  [
    { h2: 'Chlorine',      paths: chlorine },
    { h2: 'Shock',         paths: shockPages },
    { h2: 'pH',            paths: phPages },
    { h2: 'Hot Tubs',      paths: hotTubPages },
    { h2: 'Problems',      paths: problems },
    { h2: 'Behavior',      paths: behavior },
    { h2: 'Explanations',  paths: explanations },
    { h2: 'Guides',        paths: guides },
    { h2: 'Water Chemistry Questions', paths: questions }
  ]
    .filter(s => s.paths.length)
    .map(s => sectionBlock(s.h2, s.paths))
    .join('');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Complete list of WaterBalanceTools pool chemistry calculators, guides, and topic pages—flat crawl hub.">
  <title>All Pool Chemistry Pages | WaterBalanceTools</title>
  <meta property="og:title" content="All Pool Chemistry Pages | WaterBalanceTools">
  <meta property="og:description" content="Every calculator, chlorine, shock, pH, hot tub, problem, behavior, explanation, and guide URL in one place.">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <a href="/" class="logo-link">
      <img src="assets/logo.svg" alt="WaterBalanceTools" class="logo" width="180" height="36">
    </a>
    <nav class="nav">
      <a href="/tools">All Tools</a>
      <a href="/calculators/chemical-calculator">Chemical Calculator</a>
      <a href="/guides/pool-chemistry-basics">Chemistry Guide</a>
    </nav>
  </header>
  <main class="container guide-content">
    <h1>All Pool Chemistry Pages</h1>
    <p class="muted">Flat index for crawlers and readers. Links use clean URLs (no <code>.html</code>).</p>
${bodySections}
    <p class="serp-sep"><a href="/">← Home</a></p>
  </main>
  <footer class="site-footer">
    <nav class="footer-nav">
      <a href="/calculators/pool-volume-calculator">Pool Volume Calculator</a>
      <a href="/calculators/pool-chlorine-calculator">Pool Chlorine Calculator</a>
      <a href="/guides/pool-chemistry-basics">Pool Chemistry Guide</a>
      <a href="/all-pages">All Pages</a>
      <a href="/legal/ownership">Ownership</a>
      <a href="/legal/legal">Legal</a>
    </nav>
    <p class="footer-copy">&copy; WaterBalanceTools.com</p>
  </footer>
</body>
</html>
`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('generate-all-pages: wrote all-pages.html');
