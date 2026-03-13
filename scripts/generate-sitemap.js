/**
 * Generate sitemap.xml from all static and programmatic pages.
 * Run from project root: node scripts/generate-sitemap.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://waterbalancetools.com/';

function listFiles(dir, baseDir, ext) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(baseDir, full).replace(/\\/g, '/');
    if (e.isDirectory()) {
      out.push(...listFiles(full, baseDir, ext));
    } else if (e.isFile() && (!ext || e.name.endsWith(ext))) {
      out.push(rel);
    }
  }
  return out;
}

const urls = [];

urls.push({ loc: '', priority: '1.0', changefreq: 'weekly' });

['calculators', 'guides', 'printable', 'printables', 'tools', 'charts', 'comparisons', 'maintenance', 'reference'].forEach(folder => {
  const dir = path.join(ROOT, folder);
  listFiles(dir, ROOT, '.html').forEach(rel => {
    const loc = rel.replace(/\/index\.html$/, '/') || folder + '/';
    const priority = folder === 'calculators' ? '0.9' : folder === 'tools' ? '0.85' : '0.7';
    urls.push({ loc, priority, changefreq: 'monthly' });
  });
});

['programmatic/chlorine', 'programmatic/shock', 'programmatic/ph', 'programmatic/hot-tubs'].forEach(subDir => {
  const dir = path.join(ROOT, subDir);
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).filter(f => f.endsWith('.html')).forEach(f => {
    urls.push({ loc: subDir + '/' + f, priority: '0.6', changefreq: 'monthly' });
  });
});

// Legacy programmatic root pages
const progRoot = path.join(ROOT, 'programmatic');
if (fs.existsSync(progRoot)) {
  fs.readdirSync(progRoot).filter(f => f.endsWith('.html')).forEach(f => {
    urls.push({ loc: 'programmatic/' + f, priority: '0.6', changefreq: 'monthly' });
  });
}

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
urls.forEach(({ loc, priority, changefreq }) => {
  const full = (loc === '' ? BASE : BASE + loc).replace(/\/$/, '') + (loc && !path.extname(loc) ? '/' : '');
  xml += '  <url>\n    <loc>' + full + '</loc>\n    <changefreq>' + changefreq + '</changefreq>\n    <priority>' + priority + '</priority>\n  </url>\n';
});
xml += '</urlset>';

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
console.log('Sitemap: wrote ' + urls.length + ' URLs to sitemap.xml');
