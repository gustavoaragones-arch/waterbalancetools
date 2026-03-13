/**
 * Generate programmatic hot tub chlorine pages for spa sizes.
 * Output: programmatic/hot-tubs/how-much-chlorine-for-{size}-gallon-hot-tub.html
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'programmatic', 'hot-tubs');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'programmatic-template.html');

const HOT_TUB_SIZES = [];
for (let g = 200; g <= 500; g += 25) HOT_TUB_SIZES.push(g);

function liquidOz(gallons, ppm) {
  return (gallons * ppm) / 128000;
}
function granularOz(gallons, ppm) {
  return (gallons * ppm) / 10000;
}
function formatNum(n) {
  return n.toLocaleString();
}

const FAQ_ITEMS = [
  { q: 'How much chlorine should a hot tub have?', a: 'Keep 3–5 ppm for hot tubs. Test daily and add chlorine as needed.' },
  { q: 'How often do I add chlorine to a hot tub?', a: 'Add chlorine after each use and at least every few days. Run jets 15–20 minutes after adding.' }
];

function buildFaqSchema() {
  const mainEntity = FAQ_ITEMS.map(({ q, a }) => ({
    '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a }
  }));
  return '<script type="application/ld+json">\n' + JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity }) + '\n</script>';
}

function buildFaqHtml() {
  return '<div class="faq-list">' + FAQ_ITEMS.map(({ q, a }) =>
    '<div class="faq-item"><h3>' + q + '</h3><p>' + a + '</p></div>'
  ).join('') + '</div>';
}

function buildTable(gallons) {
  const rows = [1, 2, 3, 4, 5].map(ppm => ({
    ppm,
    liquid: liquidOz(gallons, ppm),
    granular: granularOz(gallons, ppm)
  }));
  let table = '<div class="output-panel"><h3>Recommended chlorine for hot tubs</h3><p>Keep <strong>3–5 ppm</strong> free chlorine. Run jets 15–20 min after adding.</p>';
  table += '<h3>Chlorine dosage (from 0 ppm)</h3><table class="dosage-table"><thead><tr><th>Chlorine increase</th><th>Liquid (10%)</th><th>Granular</th></tr></thead><tbody>';
  rows.forEach(r => {
    table += '<tr><td>' + r.ppm + ' ppm</td><td>' + r.liquid.toFixed(1) + ' oz</td><td>' + r.granular.toFixed(1) + ' oz</td></tr>';
  });
  table += '</tbody></table></div>';
  return table;
}

function generatePage(gallons) {
  const title = 'How Much Chlorine for a ' + formatNum(gallons) + ' Gallon Hot Tub?';
  const slug = 'how-much-chlorine-for-' + gallons + '-gallon-hot-tub.html';
  const meta = 'Chlorine dosage for a ' + formatNum(gallons) + ' gallon hot tub. Liquid and granular amounts. Free calculator.';
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  let html = template
    .replace(/\{\{BASE\}\}/g, '../../')
    .replace(/\{\{META_DESCRIPTION\}\}/g, meta)
    .replace(/\{\{PAGE_TITLE\}\}/g, title)
    .replace(/\{\{H1\}\}/g, title)
    .replace(/\{\{HERO_SUB\}\}/g, 'Chlorine amounts for a ' + formatNum(gallons) + ' gallon hot tub or spa.')
    .replace(/\{\{CONTENT_SECTIONS\}\}/g, buildTable(gallons))
    .replace(/\{\{CALC_LINK\}\}/g, 'hot-tub-chlorine-calculator.html')
    .replace(/\{\{CALC_NAME\}\}/g, 'Hot Tub Chlorine Calculator')
    .replace(/\{\{FAQ_SCHEMA\}\}/g, buildFaqSchema())
    .replace(/\{\{FAQ_HTML\}\}/g, buildFaqHtml());
  return { slug, html };
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
let count = 0;
HOT_TUB_SIZES.forEach(gallons => {
  const { slug, html } = generatePage(gallons);
  fs.writeFileSync(path.join(OUT_DIR, slug), html, 'utf8');
  count++;
});
console.log('Hot tubs: wrote ' + count + ' pages to programmatic/hot-tubs/');
