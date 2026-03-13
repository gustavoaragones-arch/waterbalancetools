/**
 * Generate programmatic chlorine dosage pages for pool sizes.
 * Output: programmatic/chlorine/how-much-chlorine-for-{size}-gallon-pool.html
 * Run from project root: node scripts/generate-chlorine-pages.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'programmatic', 'chlorine');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'programmatic-template.html');

// Pool sizes: spec list + fill to ~50 pages (every 500 gal from 5000 to 30000)
const POOL_SIZES = [];
for (let g = 5000; g <= 30000; g += 500) POOL_SIZES.push(g);

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
  { q: 'How much chlorine should a pool have?', a: 'Maintain 1–3 ppm free chlorine for most pools. Test 2–3 times per week.' },
  { q: 'What happens if chlorine is too low?', a: 'Low chlorine allows bacteria and algae to grow. Raise it with liquid chlorine or granular shock.' },
  { q: 'How often should chlorine be added?', a: 'Add chlorine as needed to keep 1–3 ppm. After heavy use or rain, test and add more.' },
  { q: 'Can I use liquid or granular chlorine?', a: 'Yes. Liquid chlorine (10%) and granular shock both work. Use the amounts in the table above for your pool size.' }
];

function buildFaqSchema() {
  const mainEntity = FAQ_ITEMS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a }
  }));
  return '<script type="application/ld+json">\n' + JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity
  }) + '\n</script>';
}

function buildFaqHtml() {
  return '<div class="faq-list" itemscope itemtype="https://schema.org/FAQPage">' + FAQ_ITEMS.map(({ q, a }) =>
    '<div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">' +
    '<h3 itemprop="name">' + q + '</h3>' +
    '<div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">' +
    '<p itemprop="text">' + a + '</p></div></div>'
  ).join('') + '</div>';
}

function buildTable(gallons) {
  const rows = [1, 2, 3, 4, 5].map(ppm => ({
    ppm,
    liquid: liquidOz(gallons, ppm),
    granular: granularOz(gallons, ppm)
  }));
  let table = '<div class="output-panel"><h3>Recommended chlorine range</h3><p>For pools, keep free chlorine between <strong>1–3 ppm</strong>.</p>';
  table += '<h3>Dosage table (from 0 ppm)</h3><table class="dosage-table"><thead><tr><th>Chlorine increase</th><th>Liquid chlorine (10%)</th><th>Granular shock</th></tr></thead><tbody>';
  rows.forEach(r => {
    table += '<tr><td>' + r.ppm + ' ppm</td><td>' + r.liquid.toFixed(1) + ' oz</td><td>' + r.granular.toFixed(1) + ' oz</td></tr>';
  });
  table += '</tbody></table></div>';
  return table;
}

function generatePage(gallons) {
  const title = 'How Much Chlorine for a ' + formatNum(gallons) + ' Gallon Pool?';
  const slug = 'how-much-chlorine-for-' + gallons + '-gallon-pool.html';
  const meta = 'Chlorine dosage for a ' + formatNum(gallons) + ' gallon pool. Liquid and granular amounts for 1–5 ppm. Free calculator.';
  const content = buildTable(gallons);
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  let html = template
    .replace(/\{\{BASE\}\}/g, '../../')
    .replace(/\{\{META_DESCRIPTION\}\}/g, meta)
    .replace(/\{\{PAGE_TITLE\}\}/g, title)
    .replace(/\{\{H1\}\}/g, title)
    .replace(/\{\{HERO_SUB\}\}/g, 'Chlorine amounts for a ' + formatNum(gallons) + ' gallon pool. Use the table or calculator below.')
    .replace(/\{\{CONTENT_SECTIONS\}\}/g, content)
    .replace(/\{\{CALC_LINK\}\}/g, 'pool-chlorine-calculator.html')
    .replace(/\{\{CALC_NAME\}\}/g, 'Pool Chlorine Calculator')
    .replace(/\{\{FAQ_SCHEMA\}\}/g, buildFaqSchema())
    .replace(/\{\{FAQ_HTML\}\}/g, buildFaqHtml());
  return { slug, html };
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

let count = 0;
POOL_SIZES.forEach(gallons => {
  const { slug, html } = generatePage(gallons);
  fs.writeFileSync(path.join(OUT_DIR, slug), html, 'utf8');
  count++;
});
console.log('Chlorine: wrote ' + count + ' pages to programmatic/chlorine/');
