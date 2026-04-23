/**
 * AEO / answer-box: direct "ideal levels" snippet on chart pages (after h1, before calc crosslinks).
 * Idempotent. Run after inject-authority-chart-loop.js.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CHARTS_DIR = path.join(ROOT, 'charts');

const ROOT_CHARTS = [
  'pool-chemical-levels-chart.html',
  'pool-chlorine-levels-chart.html',
  'pool-ph-levels-chart.html'
];

function strip(html) {
  return html.replace(
    new RegExp(
      '\\s*<section class="chart-answer-snippet"[^>]*>[\\s\\S]*?</section>\\s*',
      'gi'
    ),
    ''
  );
}

const POOL_SNIP =
  '    <section class="chart-answer-snippet">\n' +
  '      <h2>What are ideal pool levels?</h2>\n' +
  '      <p>Ideal pool levels are:<br>\n' +
  'Chlorine: 1–3 ppm<br>\n' +
  'pH: 7.2–7.6<br>\n' +
  'Alkalinity: 80–120 ppm</p>\n' +
  '    </section>\n';

const SPA_SNIP =
  '    <section class="chart-answer-snippet">\n' +
  '      <h2>What are ideal spa levels?</h2>\n' +
  '      <p>Ideal spa levels are:<br>\n' +
  'Chlorine: 3–5 ppm<br>\n' +
  'pH: 7.2–7.8<br>\n' +
  'Alkalinity: 80–120 ppm</p>\n' +
  '    </section>\n';

function insertAfterH1(html, block) {
  const stripped = strip(html);
  const reCross = /(<main[^>]*>\s*<h1>[^<]+<\/h1>)(\s*<section class="chart-calc-crosslinks)/i;
  if (reCross.test(stripped)) {
    return stripped.replace(reCross, '$1\n' + block + '$2');
  }
  const reH1 = /(<main[^>]*>\s*<h1>[^<]+<\/h1>)/i;
  if (!reH1.test(stripped)) return null;
  return stripped.replace(reH1, '$1\n' + block);
}

function processFile(full, isSpa) {
  if (!fs.existsSync(full)) return false;
  const html = fs.readFileSync(full, 'utf8');
  if (!html.includes('<main') || !html.includes('<h1>')) return false;
  const block = isSpa ? SPA_SNIP : POOL_SNIP;
  const next = insertAfterH1(html, block);
  if (next == null || next === html) return false;
  fs.writeFileSync(full, next, 'utf8');
  return true;
}

let n = 0;
for (const f of ROOT_CHARTS) {
  if (processFile(path.join(ROOT, f), false)) n++;
}

if (fs.existsSync(CHARTS_DIR)) {
  for (const name of fs.readdirSync(CHARTS_DIR)) {
    if (!name.endsWith('.html')) continue;
    const isSpa = name.includes('hot-tub');
    if (processFile(path.join(CHARTS_DIR, name), isSpa)) n++;
  }
}

console.log('inject-chart-answer-snippet: updated ' + n + ' chart pages');
