/**
 * Idempotent: <meta name="robots" content="index, follow"> + single <link rel="canonical">.
 * Canonical URLs match sitemap (no .html). Skips components/ and templates/.
 * Run: node scripts/inject-seo-metadata.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE_URL = 'https://waterbalancetools.com';

const SKIP_DIRS = new Set(['node_modules', '.git', 'components', 'templates']);

function canonicalHref(relPath) {
  const p = relPath.replace(/\\/g, '/');
  if (p === 'index.html') return BASE_URL + '/';
  const noExt = p.replace(/\.html$/i, '');
  return BASE_URL + '/' + noExt;
}

function stripSeoTags(html) {
  return html
    .replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '');
}

function injectSeo(html, canonical) {
  let h = stripSeoTags(html);
  const block =
    '  <meta name="robots" content="index, follow">\n' +
    '  <link rel="canonical" href="' +
    canonical.replace(/"/g, '&quot;') +
    '">\n';
  if (/<meta\s+charset=/i.test(h)) {
    return h.replace(/(<meta\s+charset=["'][^"']+["']\s*\/?>)/i, '$1\n' + block);
  }
  if (/<head[^>]*>/i.test(h)) {
    return h.replace(/<head[^>]*>/i, m => m + '\n' + block);
  }
  return h;
}

function walkHtml(dir, baseRel, out) {
  if (!fs.existsSync(dir)) return;
  const base = path.basename(dir);
  if (SKIP_DIRS.has(base)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel = path.join(baseRel, e.name).replace(/\\/g, '/');
    if (e.isDirectory()) {
      walkHtml(full, rel, out);
    } else if (e.name.endsWith('.html')) {
      out.push(rel);
    }
  }
}

function collectFiles() {
  const out = [];
  const rootIndex = path.join(ROOT, 'index.html');
  if (fs.existsSync(rootIndex)) out.push('index.html');
  const allPages = path.join(ROOT, 'all-pages.html');
  if (fs.existsSync(allPages)) out.push('all-pages.html');
  for (const f of [
    'pool-chemical-levels-chart.html',
    'pool-chlorine-levels-chart.html',
    'pool-ph-levels-chart.html'
  ]) {
    if (fs.existsSync(path.join(ROOT, f))) out.push(f);
  }

  const topDirs = [
    'calculators',
    'programmatic',
    'guides',
    'legal',
    'tools',
    'charts',
    'comparisons',
    'maintenance',
    'printables',
    'printable',
    'reference'
  ];
  for (const d of topDirs) {
    walkHtml(path.join(ROOT, d), d, out);
  }
  return [...new Set(out)].sort();
}

let n = 0;
for (const rel of collectFiles()) {
  const full = path.join(ROOT, rel);
  let html = fs.readFileSync(full, 'utf8');
  if (!html.includes('<head')) continue;
  const next = injectSeo(html, canonicalHref(rel));
  if (next !== html) {
    fs.writeFileSync(full, next, 'utf8');
    n++;
  }
}
console.log('inject-seo-metadata: updated ' + n + ' pages');
