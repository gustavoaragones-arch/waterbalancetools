/**
 * Sitemap: priorities and crawl-friendly ordering.
 * Order: homepage → calculators → problem pages → programmatic → guides → crawl hub → other.
 * Run from project root: node scripts/generate-sitemap.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE_URL = 'https://waterbalancetools.com';

function listHtmlFiles(dir, baseDir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(baseDir, full).replace(/\\/g, '/');
    if (e.isDirectory()) {
      out.push(...listHtmlFiles(full, baseDir));
    } else if (e.isFile() && e.name.endsWith('.html')) {
      out.push(rel);
    }
  }
  return out;
}

function toCleanPath(relPath) {
  return relPath.replace(/\.html$/i, '').replace(/\/index$/i, '') || '';
}

const urls = [];

// 1. Homepage
urls.push({
  loc: BASE_URL + '/',
  changefreq: 'daily',
  priority: '1.0'
});

// 2. Calculators — priority 1.0
const calcDir = path.join(ROOT, 'calculators');
listHtmlFiles(calcDir, ROOT)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .forEach(rel => {
    urls.push({
      loc: BASE_URL + '/' + toCleanPath(rel),
      changefreq: 'daily',
      priority: '1.0'
    });
  });

// 2b. Root authority chart pages (informational queries)
const rootCharts = [
  'pool-chemical-levels-chart.html',
  'pool-chlorine-levels-chart.html',
  'pool-ph-levels-chart.html'
];
rootCharts.forEach(f => {
  if (fs.existsSync(path.join(ROOT, f))) {
    urls.push({
      loc: BASE_URL + '/' + toCleanPath(f),
      changefreq: 'weekly',
      priority: '0.9'
    });
  }
});

// 3. Problem pages — priority 0.9
const progRoot = path.join(ROOT, 'programmatic');
const problemsDir = path.join(progRoot, 'problems');
const problemRels = fs.existsSync(problemsDir)
  ? listHtmlFiles(problemsDir, ROOT).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  : [];
const problemSet = new Set(problemRels);
problemRels.forEach(rel => {
  urls.push({
    loc: BASE_URL + '/' + toCleanPath(rel),
    changefreq: 'daily',
    priority: '0.9'
  });
});

// 4. Remaining programmatic — priority 0.7
if (fs.existsSync(progRoot)) {
  listHtmlFiles(progRoot, ROOT)
    .filter(rel => !problemSet.has(rel))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .forEach(rel => {
      urls.push({
        loc: BASE_URL + '/' + toCleanPath(rel),
        changefreq: 'monthly',
        priority: '0.7'
      });
    });
}

// 5. Guides — priority 0.8
const guidesDir = path.join(ROOT, 'guides');
if (fs.existsSync(guidesDir)) {
  listHtmlFiles(guidesDir, ROOT)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .forEach(rel => {
      urls.push({
        loc: BASE_URL + '/' + toCleanPath(rel),
        changefreq: 'monthly',
        priority: '0.8'
      });
    });
}

// 6. Crawl hub
const hubPage = path.join(ROOT, 'all-pages.html');
if (fs.existsSync(hubPage)) {
  urls.push({
    loc: BASE_URL + '/' + toCleanPath('all-pages.html'),
    changefreq: 'weekly',
    priority: '0.9'
  });
}

// 7. Everything else (no duplicates)
const emitted = new Set(urls.map(u => u.loc));
const otherFolders = [
  'legal',
  'printable',
  'printables',
  'tools',
  'charts',
  'comparisons',
  'maintenance',
  'reference'
];
otherFolders.forEach(folder => {
  const dir = path.join(ROOT, folder);
  listHtmlFiles(dir, ROOT)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .forEach(rel => {
      const pathNoExt = toCleanPath(rel);
      if (!pathNoExt) return;
      const loc = BASE_URL + '/' + pathNoExt;
      if (emitted.has(loc)) return;
      emitted.add(loc);
      urls.push({
        loc,
        changefreq: 'monthly',
        priority: folder === 'tools' ? '0.85' : '0.65'
      });
    });
});

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
urls.forEach(({ loc, changefreq, priority }) => {
  xml += '  <url>\n';
  xml += '    <loc>' + loc + '</loc>\n';
  xml += '    <changefreq>' + changefreq + '</changefreq>\n';
  xml += '    <priority>' + priority + '</priority>\n';
  xml += '  </url>\n';
});
xml += '</urlset>';

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
console.log('Sitemap: wrote ' + urls.length + ' URLs to sitemap.xml');
