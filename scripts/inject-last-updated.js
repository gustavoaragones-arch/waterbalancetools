/**
 * Idempotent: single <p class="updated"> before </main>. Bump month in programmatic-seo-constants.js.
 * Same crawl set as inject-seo-metadata.js (skips components/, templates/).
 * Run: node scripts/inject-last-updated.js
 */
const fs = require('fs');
const path = require('path');
const { LAST_UPDATED_DISPLAY } = require('./programmatic-seo-constants');

const ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'components', 'templates']);

const UPDATED_BLOCK =
  '    <p class="updated">Last updated: ' +
  LAST_UPDATED_DISPLAY.replace(/</g, '&lt;') +
  '</p>\n';

function stripUpdated(html) {
  return html.replace(/<p\s+class=["']updated["'][^>]*>[\s\S]*?<\/p>\s*/gi, '');
}

function injectUpdated(html) {
  let h = stripUpdated(html);
  if (!/<\/main>/i.test(h)) return html;
  return h.replace(/(\s*)<\/main>/i, '\n' + UPDATED_BLOCK + '$1</main>');
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
  if (!html.includes('</main>')) continue;
  const next = injectUpdated(html);
  if (next !== html) {
    fs.writeFileSync(full, next, 'utf8');
    n++;
  }
}
console.log('inject-last-updated: updated ' + n + ' pages');
