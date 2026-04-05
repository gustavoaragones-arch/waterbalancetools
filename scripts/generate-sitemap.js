/**
 * Sitemap with tiered priority/changefreq and crawl-friendly ordering.
 * Order: homepage → calculators → problem pages → other programmatic → rest.
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

// 1. Homepage (highest)
urls.push({
  loc: BASE_URL + '/',
  changefreq: 'daily',
  priority: '1.0'
});

// 2. All calculators — high value
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

// 3. Problem pages — high urgency / RPM
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
    priority: '1.0'
  });
});

// 4. Remaining programmatic (standard long-tail)
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

// 5. Crawl hub + other sections
const rootExtras = ['all-pages.html'].filter(f => fs.existsSync(path.join(ROOT, f)));
rootExtras.forEach(rel => {
  urls.push({
    loc: BASE_URL + '/' + toCleanPath(rel),
    changefreq: 'weekly',
    priority: '0.85'
  });
});

const otherFolders = [
  'guides',
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
      urls.push({
        loc,
        changefreq: 'monthly',
        priority: folder === 'tools' ? '0.85' : '0.65'
      });
    });
});

// Build XML (order preserved)
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
