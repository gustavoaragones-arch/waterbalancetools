/**
 * DEPRECATED (Phase 7Q) -- superseded by scripts/generate-sitemaps.js
 * (plural), which is the version actually wired into `npm run build` /
 * scripts/run-all-generators.js. This script is not required/imported by
 * anything and confirmed dead code as of Phase 7Q (see
 * reports/phase-7q/RESEARCH.md), but is kept rather than deleted per this
 * project's policy against removing code merely because it is unused.
 *
 * It writes a flat, non-partitioned sitemap.xml with no lastmod values,
 * which WOULD conflict with (overwrite) the partitioned, git-lastmod-based
 * sitemap.xml index that generate-sitemaps.js produces (see Phase 7O's
 * LASTMOD-AUDIT.md) if run after a real build. Guarded below so it refuses
 * to run without an explicit override, rather than silently regressing the
 * sitemap if someone runs the old `npm run sitemap` script from muscle
 * memory.
 *
 * Sitemap: priorities and crawl-friendly ordering.
 * Order: homepage → calculators → problem pages → programmatic → guides → crawl hub → other.
 * Run from project root: node scripts/generate-sitemap.js
 */
const fs = require('fs');
const path = require('path');
const { isLegacyProgrammaticChlorine } = require('./redirect-rules');

if (!process.env.FORCE_LEGACY_SITEMAP) {
  console.error(
    'generate-sitemap.js (singular) is deprecated and disabled -- it would overwrite the ' +
    'partitioned, git-lastmod-based sitemap.xml that generate-sitemaps.js (plural) produces ' +
    'as part of `npm run build`. Use `node scripts/generate-sitemaps.js` instead. ' +
    'If you specifically need this legacy flat sitemap for a one-off purpose, re-run with ' +
    'FORCE_LEGACY_SITEMAP=1 node scripts/generate-sitemap.js.'
  );
  process.exit(1);
}

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
      if (!isLegacyProgrammaticChlorine(rel)) out.push(rel);
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

// 1b. Pool Chemistry System hub — priority 1.0 (Phase 7)
const hubSystemPage = path.join(ROOT, 'pool-chemistry-system.html');
if (fs.existsSync(hubSystemPage)) {
  urls.push({
    loc: BASE_URL + '/pool-chemistry-system',
    changefreq: 'weekly',
    priority: '1.0'
  });
}

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

// 5. Guides — priority 0.8 (questions subfolder included automatically via recursive walk)
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

// Phase 7: reference/ pages — priority 0.9 weekly
const refDir = path.join(ROOT, 'reference');
listHtmlFiles(refDir, ROOT)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .forEach(rel => {
    const pathNoExt = toCleanPath(rel);
    if (!pathNoExt) return;
    const loc = BASE_URL + '/' + pathNoExt;
    if (emitted.has(loc)) return;
    emitted.add(loc);
    urls.push({ loc, changefreq: 'weekly', priority: '0.9' });
  });

// Phase 7: comparisons/ pages — priority 0.8 weekly
const compDir = path.join(ROOT, 'comparisons');
listHtmlFiles(compDir, ROOT)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .forEach(rel => {
    const pathNoExt = toCleanPath(rel);
    if (!pathNoExt) return;
    const loc = BASE_URL + '/' + pathNoExt;
    if (emitted.has(loc)) return;
    emitted.add(loc);
    urls.push({ loc, changefreq: 'weekly', priority: '0.8' });
  });

const otherFolders = [
  'legal',
  'printable',
  'printables',
  'tools',
  'charts',
  'maintenance'
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
