/**
 * Global crawl hub: static HTML, clean URLs (no .html), no duplicates.
 * Sections: Calculators, Chlorine, pH, Problems, Guides only.
 * Run: node scripts/generate-all-pages.js
 */
const fs = require('fs');
const path = require('path');

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

function titleFromFile(name) {
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

const calculators = listSortedHtml(path.join(ROOT, 'calculators')).map(f => 'calculators/' + f);
const chlorine = listSortedHtml(path.join(ROOT, 'programmatic/chlorine')).map(
  f => 'programmatic/chlorine/' + f
);
const phPages = listSortedHtml(path.join(ROOT, 'programmatic/ph')).map(
  f => 'programmatic/ph/' + f
);
const problems = listSortedHtml(path.join(ROOT, 'programmatic/problems')).map(
  f => 'programmatic/problems/' + f
);
const guides = walkGuides(path.join(ROOT, 'guides'), 'guides');

const bodySections = [
  { h2: 'Calculators', paths: calculators },
  { h2: 'Chlorine', paths: chlorine },
  { h2: 'pH', paths: phPages },
  { h2: 'Problems', paths: problems },
  { h2: 'Guides', paths: guides }
]
  .filter(s => s.paths.length)
  .map(
    s =>
      '    <h2>' +
      s.h2 +
      '</h2>\n' +
      '    <ul class="ring-links all-pages-list">\n' +
      ulLinks(s.paths) +
      '\n    </ul>\n'
  )
  .join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Complete list of WaterBalanceTools pool chemistry calculators, guides, and topic pages—flat crawl hub.">
  <title>All Pool Chemistry Pages | WaterBalanceTools</title>
  <meta property="og:title" content="All Pool Chemistry Pages | WaterBalanceTools">
  <meta property="og:description" content="Every calculator, chlorine, pH, problem, and guide URL in one place.">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <a href="/" class="logo-link">
      <img src="assets/logo.svg" alt="WaterBalanceTools" class="logo" width="180" height="36">
    </a>
    <nav class="nav">
      <a href="/tools/index">All Tools</a>
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
