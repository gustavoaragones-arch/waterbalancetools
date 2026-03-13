/**
 * Generate programmatic pH adjustment pages: raise-ph and lower-ph for pool sizes.
 * Output: programmatic/ph/raise-ph-in-{size}-gallon-pool.html, lower-ph-in-{size}-gallon-pool.html
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'programmatic', 'ph');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'programmatic-template.html');

const POOL_SIZES = [];
for (let g = 5000; g <= 30000; g += 1000) POOL_SIZES.push(g);

function phIncreaserOz(gallons, phDiff) {
  return (gallons / 10000) * phDiff * 6;
}
function phReducerOz(gallons, phDiff) {
  return (gallons / 10000) * phDiff * 5;
}
function formatNum(n) {
  return n.toLocaleString();
}

const FAQ_RAISE = [
  { q: 'What is the ideal pH for a pool?', a: 'Keep pH between 7.2 and 7.6. Low pH can damage equipment and irritate skin.' },
  { q: 'How do I raise pH in my pool?', a: 'Use pH increaser (soda ash) according to the table above. Add in the deep end with pump running.' }
];

const FAQ_LOWER = [
  { q: 'Why would I need to lower pool pH?', a: 'If pH is above 7.6, chlorine is less effective and scaling can occur. Use pH reducer (dry acid).' },
  { q: 'How do I lower pH in my pool?', a: 'Use pH reducer according to the table above. Add slowly and re-test after 30 minutes.' }
];

function buildFaqSchema(items) {
  const mainEntity = items.map(({ q, a }) => ({
    '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a }
  }));
  return '<script type="application/ld+json">\n' + JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity }) + '\n</script>';
}

function buildFaqHtml(items) {
  return '<div class="faq-list">' + items.map(({ q, a }) =>
    '<div class="faq-item"><h3>' + q + '</h3><p>' + a + '</p></div>'
  ).join('') + '</div>';
}

function buildRaiseTable(gallons) {
  const diffs = [0.2, 0.3, 0.4, 0.5, 0.6];
  let table = '<div class="output-panel"><h3>Raise pH</h3><p>Use <strong>pH increaser</strong> (soda ash). Target range: 7.2–7.6.</p>';
  table += '<h3>pH increaser dosage</h3><table class="dosage-table"><thead><tr><th>pH increase</th><th>pH increaser (oz)</th></tr></thead><tbody>';
  diffs.forEach(d => {
    table += '<tr><td>+' + d + '</td><td>' + phIncreaserOz(gallons, d).toFixed(1) + ' oz</td></tr>';
  });
  table += '</tbody></table></div>';
  return table;
}

function buildLowerTable(gallons) {
  const diffs = [0.2, 0.3, 0.4, 0.5, 0.6];
  let table = '<div class="output-panel"><h3>Lower pH</h3><p>Use <strong>pH reducer</strong> (dry acid). Target range: 7.2–7.6.</p>';
  table += '<h3>pH reducer dosage</h3><table class="dosage-table"><thead><tr><th>pH decrease</th><th>pH reducer (oz)</th></tr></thead><tbody>';
  diffs.forEach(d => {
    table += '<tr><td>-' + d + '</td><td>' + phReducerOz(gallons, d).toFixed(1) + ' oz</td></tr>';
  });
  table += '</tbody></table></div>';
  return table;
}

function generatePage(gallons, direction) {
  const isRaise = direction === 'raise';
  const title = (isRaise ? 'Raise pH in a ' : 'Lower pH in a ') + formatNum(gallons) + ' Gallon Pool';
  const slug = (isRaise ? 'raise-ph-in-' : 'lower-ph-in-') + gallons + '-gallon-pool.html';
  const meta = (isRaise ? 'How much pH increaser for a ' : 'How much pH reducer for a ') + formatNum(gallons) + ' gallon pool. Dosage table and calculator.';
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const content = isRaise ? buildRaiseTable(gallons) : buildLowerTable(gallons);
  const faqItems = isRaise ? FAQ_RAISE : FAQ_LOWER;
  let html = template
    .replace(/\{\{BASE\}\}/g, '../../')
    .replace(/\{\{META_DESCRIPTION\}\}/g, meta)
    .replace(/\{\{PAGE_TITLE\}\}/g, title)
    .replace(/\{\{H1\}\}/g, title)
    .replace(/\{\{HERO_SUB\}\}/g, (isRaise ? 'pH increaser' : 'pH reducer') + ' amounts for a ' + formatNum(gallons) + ' gallon pool.')
    .replace(/\{\{CONTENT_SECTIONS\}\}/g, content)
    .replace(/\{\{CALC_LINK\}\}/g, 'pool-ph-calculator.html')
    .replace(/\{\{CALC_NAME\}\}/g, 'Pool pH Calculator')
    .replace(/\{\{FAQ_SCHEMA\}\}/g, buildFaqSchema(faqItems))
    .replace(/\{\{FAQ_HTML\}\}/g, buildFaqHtml(faqItems));
  return { slug, html };
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
let count = 0;
['raise', 'lower'].forEach(direction => {
  POOL_SIZES.forEach(gallons => {
    const { slug, html } = generatePage(gallons, direction);
    fs.writeFileSync(path.join(OUT_DIR, slug), html, 'utf8');
    count++;
  });
});
console.log('pH: wrote ' + count + ' pages to programmatic/ph/');
