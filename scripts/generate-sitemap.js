/**
 * Generate sitemap.xml from homepage, calculators, and programmatic (and other) HTML pages.
 * URLs are built without .html (e.g. /calculators/pool-chlorine-calculator).
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

/** path/to/page.html -> path/to/page (no .html) */
function toCleanPath(relPath) {
  return relPath.replace(/\.html$/i, '').replace(/\/index$/i, '') || '';
}

const urls = [];

// 1. Homepage
urls.push({
  loc: BASE_URL + '/',
  changefreq: 'weekly',
  priority: '1.0'
});

// 2. All calculators
const calcDir = path.join(ROOT, 'calculators');
listHtmlFiles(calcDir, ROOT).forEach(rel => {
  const pathNoExt = toCleanPath(rel);
  urls.push({
    loc: BASE_URL + '/' + pathNoExt,
    changefreq: 'monthly',
    priority: '0.8'
  });
});

// 3. Future programmatic pages (and existing programmatic dirs)
const programmaticDirs = [
  'programmatic',
  'programmatic/chlorine',
  'programmatic/shock',
  'programmatic/ph',
  'programmatic/hot-tubs',
  'programmatic/pool-sizes'
];
const seen = new Set();
programmaticDirs.forEach(subDir => {
  const dir = path.join(ROOT, subDir);
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).filter(f => f.endsWith('.html')).forEach(f => {
    const rel = subDir + '/' + f;
    if (seen.has(rel)) return;
    seen.add(rel);
    const pathNoExt = toCleanPath(rel);
    urls.push({
      loc: BASE_URL + '/' + pathNoExt,
      changefreq: 'monthly',
      priority: '0.8'
    });
  });
});

// Other key sections (guides, tools, charts, etc.) so sitemap stays complete
['guides', 'printable', 'printables', 'tools', 'charts', 'comparisons', 'maintenance', 'reference'].forEach(folder => {
  const dir = path.join(ROOT, folder);
  listHtmlFiles(dir, ROOT).forEach(rel => {
    const pathNoExt = toCleanPath(rel);
    if (!pathNoExt) return;
    const loc = pathNoExt ? BASE_URL + '/' + pathNoExt : BASE_URL + '/' + folder + '/';
    urls.push({
      loc,
      changefreq: 'monthly',
      priority: folder === 'tools' ? '0.85' : '0.7'
    });
  });
});

// Build XML
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
