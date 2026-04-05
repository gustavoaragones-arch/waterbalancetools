/**
 * HTML crawl hub: lists internal URLs by section for discovery.
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

function walkRelHtml(dir, baseFromRoot) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel = (baseFromRoot ? baseFromRoot + '/' : '') + e.name;
    if (e.isDirectory()) {
      out.push(...walkRelHtml(full, rel));
    } else if (e.name.endsWith('.html')) {
      out.push(rel.replace(/\\/g, '/'));
    }
  }
  return out.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function titleFromFile(name) {
  return name
    .replace(/\.html$/i, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function ulLinks(paths, hrefPrefix) {
  return paths
    .map(p => {
      const href = hrefPrefix + p;
      const label = titleFromFile(path.basename(p));
      return '        <li><a href="' + href + '">' + label + '</a></li>';
    })
    .join('\n');
}

const sections = [
  {
    h2: 'Calculators',
    paths: listSortedHtml(path.join(ROOT, 'calculators')).map(f => 'calculators/' + f)
  },
  {
    h2: 'Chlorine (by pool size)',
    paths: listSortedHtml(path.join(ROOT, 'programmatic/chlorine')).map(
      f => 'programmatic/chlorine/' + f
    )
  },
  {
    h2: 'Shock (by pool size)',
    paths: listSortedHtml(path.join(ROOT, 'programmatic/shock')).map(
      f => 'programmatic/shock/' + f
    )
  },
  {
    h2: 'pH adjustment',
    paths: listSortedHtml(path.join(ROOT, 'programmatic/ph')).map(f => 'programmatic/ph/' + f)
  },
  {
    h2: 'Hot tubs',
    paths: listSortedHtml(path.join(ROOT, 'programmatic/hot-tubs')).map(
      f => 'programmatic/hot-tubs/' + f
    )
  },
  {
    h2: 'Problems',
    paths: listSortedHtml(path.join(ROOT, 'programmatic/problems')).map(
      f => 'programmatic/problems/' + f
    )
  },
  {
    h2: 'Explanations',
    paths: listSortedHtml(path.join(ROOT, 'programmatic/explanations')).map(
      f => 'programmatic/explanations/' + f
    )
  },
  {
    h2: 'Behavior & timing',
    paths: listSortedHtml(path.join(ROOT, 'programmatic/behavior')).map(
      f => 'programmatic/behavior/' + f
    )
  },
  {
    h2: 'Programmatic (legacy paths)',
    paths: listSortedHtml(path.join(ROOT, 'programmatic')).filter(
      f => f.endsWith('.html')
    )
  },
  {
    h2: 'Guides',
    paths: walkRelHtml(path.join(ROOT, 'guides'), 'guides')
  },
  {
    h2: 'Tools',
    paths: listSortedHtml(path.join(ROOT, 'tools')).map(f => 'tools/' + f)
  },
  {
    h2: 'Charts',
    paths: listSortedHtml(path.join(ROOT, 'charts')).map(f => 'charts/' + f)
  },
  {
    h2: 'Comparisons',
    paths: listSortedHtml(path.join(ROOT, 'comparisons')).map(f => 'comparisons/' + f)
  },
  {
    h2: 'Maintenance',
    paths: listSortedHtml(path.join(ROOT, 'maintenance')).map(f => 'maintenance/' + f)
  },
  {
    h2: 'Printables',
    paths: [
      ...listSortedHtml(path.join(ROOT, 'printables')).map(f => 'printables/' + f),
      ...listSortedHtml(path.join(ROOT, 'printable')).map(f => 'printable/' + f)
    ]
  },
  {
    h2: 'Reference',
    paths: listSortedHtml(path.join(ROOT, 'reference')).map(f => 'reference/' + f)
  },
  {
    h2: 'Legal',
    paths: listSortedHtml(path.join(ROOT, 'legal')).map(f => 'legal/' + f)
  }
];

const bodySections = sections
  .filter(s => s.paths.length)
  .map(
    s =>
      '    <h2>' +
      s.h2 +
      '</h2>\n' +
      '    <ul class="ring-links all-pages-list">\n' +
      ulLinks(s.paths, '') +
      '\n    </ul>\n'
  )
  .join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Complete list of WaterBalanceTools pool and hot tub chemistry pages for easy navigation.">
  <title>All Pages | WaterBalanceTools</title>
  <meta property="og:title" content="All Pages | WaterBalanceTools">
  <meta property="og:description" content="Flat index of every calculator, guide, and programmatic page.">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <a href="index.html" class="logo-link">
      <img src="assets/logo.svg" alt="WaterBalanceTools" class="logo" width="180" height="36">
    </a>
    <nav class="nav">
      <a href="tools/index.html">All Tools</a>
      <a href="calculators/chemical-calculator.html">Chemical Calculator</a>
      <a href="guides/pool-chemistry-basics.html">Chemistry Guide</a>
    </nav>
  </header>
  <main class="container guide-content">
    <h1>All pages</h1>
    <p class="muted">Flat index for navigation and discovery. Every internal HTML URL is listed by topic.</p>
${bodySections}
    <p class="serp-sep"><a href="index.html">← Home</a></p>
  </main>
  <footer class="site-footer">
    <nav class="footer-nav">
      <a href="calculators/pool-volume-calculator.html">Pool Volume Calculator</a>
      <a href="calculators/pool-chlorine-calculator.html">Pool Chlorine Calculator</a>
      <a href="guides/pool-chemistry-basics.html">Pool Chemistry Guide</a>
      <a href="legal/ownership.html">Ownership</a>
      <a href="legal/legal.html">Legal</a>
    </nav>
    <p class="footer-copy">&copy; WaterBalanceTools.com</p>
  </footer>
</body>
</html>
`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('generate-all-pages: wrote all-pages.html');
