/**
 * Generate programmatic shock dosage pages for pool sizes.
 * Output: programmatic/shock/shock-for-{size}-gallon-pool.html
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'programmatic', 'shock');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'programmatic-template.html');

const POOL_SIZES = [];
for (let g = 5000; g <= 30000; g += 750) POOL_SIZES.push(g);

function shockOz(gallons, ppm = 10) {
  return (gallons * ppm) / 10000;
}
function formatNum(n) {
  return n.toLocaleString();
}

const FAQ_ITEMS = [
  { q: 'How much shock do I need for my pool?', a: 'Use the table above for your pool size. Standard shock raises chlorine by about 10 ppm.' },
  { q: 'How often should I shock my pool?', a: 'Shock weekly or after heavy use, rain, or when chlorine is low. Run the pump 4–6 hours after adding shock.' },
  { q: 'When can I swim after shocking?', a: 'Wait until chlorine returns to 1–3 ppm, usually 24 hours. Test before swimming.' }
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
  const standard = shockOz(gallons, 10);
  const double = shockOz(gallons, 20);
  let table = '<div class="output-panel"><h3>Recommended shock</h3><p>Standard shock raises chlorine by about <strong>10 ppm</strong>. Use double for heavy contamination.</p>';
  table += '<h3>Shock dosage table</h3><table class="dosage-table"><thead><tr><th>Shock level</th><th>Granular shock (oz)</th><th>Granular shock (lb)</th></tr></thead><tbody>';
  table += '<tr><td>Standard (10 ppm)</td><td>' + standard.toFixed(1) + ' oz</td><td>' + (standard / 16).toFixed(2) + ' lb</td></tr>';
  table += '<tr><td>Double (20 ppm)</td><td>' + double.toFixed(1) + ' oz</td><td>' + (double / 16).toFixed(2) + ' lb</td></tr>';
  table += '</tbody></table></div>';
  return table;
}

function generatePage(gallons) {
  const title = 'Shock for a ' + formatNum(gallons) + ' Gallon Pool';
  const slug = 'shock-for-' + gallons + '-gallon-pool.html';
  const meta = 'How much shock for a ' + formatNum(gallons) + ' gallon pool. Granular shock dosage table. Free calculator.';
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  let html = template
    .replace(/\{\{BASE\}\}/g, '../../')
    .replace(/\{\{META_DESCRIPTION\}\}/g, meta)
    .replace(/\{\{PAGE_TITLE\}\}/g, title)
    .replace(/\{\{H1\}\}/g, title)
    .replace(/\{\{HERO_SUB\}\}/g, 'Shock dosage for a ' + formatNum(gallons) + ' gallon pool. Standard and double shock amounts.')
    .replace(/\{\{CONTENT_SECTIONS\}\}/g, buildTable(gallons))
    .replace(/\{\{CALC_LINK\}\}/g, 'pool-shock-calculator.html')
    .replace(/\{\{CALC_NAME\}\}/g, 'Pool Shock Calculator')
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
console.log('Shock: wrote ' + count + ' pages to programmatic/shock/');
