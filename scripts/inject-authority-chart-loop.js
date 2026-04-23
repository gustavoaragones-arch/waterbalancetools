/**
 * Closed authority loop: calculators ↔ chart pages (clean URL paths).
 * Idempotent. Run after enforce-terminology.js so link text is not rewritten.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CALC_DIR = path.join(ROOT, 'calculators');
const CHARTS_DIR = path.join(ROOT, 'charts');

function stripCalc(html) {
  return html.replace(/\s*<section class="calc-chart-crosslinks[^"]*"[^>]*>[\s\S]*?<\/section>\s*/gi, '');
}
function stripChart(html) {
  return html.replace(/\s*<section class="chart-calc-crosslinks[^"]*"[^>]*>[\s\S]*?<\/section>\s*/gi, '');
}

const CALC_BLOCK =
  '\n    <section class="calc-chart-crosslinks card">\n' +
  '      <h2>Recommended Levels</h2>\n' +
  '      <p>See the full reference chart:</p>\n' +
  '      <ul class="ring-links">\n' +
  '        <li><a href="/pool-chemical-levels-chart">Pool Chemical Levels Chart</a></li>\n' +
  '        <li><a href="/pool-chlorine-levels-chart">Chlorine Levels Chart</a></li>\n' +
  '        <li><a href="/pool-ph-levels-chart">pH Levels Chart</a></li>\n' +
  '      </ul>\n' +
  '    </section>\n';

const CHART_BLOCK =
  '\n    <section class="chart-calc-crosslinks card">\n' +
  '      <h2>Calculate Your Levels</h2>\n' +
  '      <ul class="ring-links">\n' +
  '        <li><a href="/calculators/chemical-calculator">Pool Chemical Calculator</a></li>\n' +
  '        <li><a href="/calculators/pool-ph-calculator">pH Calculator</a></li>\n' +
  '        <li><a href="/calculators/pool-shock-calculator">Shock Calculator</a></li>\n' +
  '      </ul>\n' +
  '    </section>\n';

function insertAfterFirstFormInMain(html, block) {
  const mStart = html.search(/<main\b/i);
  if (mStart === -1) return null;
  const mEnd = html.indexOf('</main>', mStart);
  if (mEnd === -1) return null;
  const slice = html.slice(mStart, mEnd);
  if (slice.indexOf('</form>') === -1) return null;

  const stripped = stripCalc(html);
  const mStart2 = stripped.search(/<main\b/i);
  const mEnd2 = stripped.indexOf('</main>', mStart2);
  const slice2 = stripped.slice(mStart2, mEnd2);
  const fc2 = slice2.indexOf('</form>');
  if (fc2 === -1) return null;
  const abs = mStart2 + fc2 + '</form>'.length;
  return stripped.slice(0, abs) + block + stripped.slice(abs);
}

function insertAfterMainH1(html, block) {
  if (!/<main[^>]*>\s*<h1>[^<]+<\/h1>/i.test(html)) return null;
  const stripped = stripChart(html);
  const replaced = stripped.replace(/(<main[^>]*>\s*<h1>[^<]+<\/h1>)/i, '$1' + block);
  if (replaced === stripped) return null;
  return replaced;
}

const ROOT_CHARTS = [
  'pool-chemical-levels-chart.html',
  'pool-chlorine-levels-chart.html',
  'pool-ph-levels-chart.html'
];

let nCalc = 0;
let nChart = 0;

if (fs.existsSync(CALC_DIR)) {
  for (const name of fs.readdirSync(CALC_DIR)) {
    if (!name.endsWith('.html')) continue;
    const full = path.join(CALC_DIR, name);
    const html = fs.readFileSync(full, 'utf8');
    const next = insertAfterFirstFormInMain(html, CALC_BLOCK);
    if (next != null && next !== html) {
      fs.writeFileSync(full, next, 'utf8');
      nCalc++;
    }
  }
}

function processChartFile(full) {
  if (!fs.existsSync(full)) return;
  const html = fs.readFileSync(full, 'utf8');
  const next = insertAfterMainH1(html, CHART_BLOCK);
  if (next != null && next !== html) {
    fs.writeFileSync(full, next, 'utf8');
    nChart++;
  }
}

for (const f of ROOT_CHARTS) {
  processChartFile(path.join(ROOT, f));
}

if (fs.existsSync(CHARTS_DIR)) {
  for (const name of fs.readdirSync(CHARTS_DIR)) {
    if (!name.endsWith('.html')) continue;
    processChartFile(path.join(CHARTS_DIR, name));
  }
}

console.log(
  'inject-authority-chart-loop: calculators ' +
    nCalc +
    ', chart pages ' +
    nChart
);
