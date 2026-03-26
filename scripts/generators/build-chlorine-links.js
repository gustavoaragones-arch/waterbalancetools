/**
 * Internal linking cluster for programmatic/chlorine pages.
 * Inserts <section class="related-chlorine"> before </main> (idempotent).
 * Run: node scripts/generators/build-chlorine-links.js
 */
const fs = require('fs');
const path = require('path');
const { OUTPUT_DIR, VOLUMES } = require('./chlorine-cluster-config');
const { insertBeforeCommonQuestions } = require('./serp-dominance-helpers');

const SLUG_RE = /^how-much-chlorine-for-(\d+)-gallon-pool\.html$/;
const SECTION_RE = /\s*<section class="related-chlorine">[\s\S]*?<\/section>\s*/i;

function formatVolume(vol) {
  return Number(vol).toLocaleString() + ' gal';
}

function pickRelated(current, all, minCount) {
  const others = all.filter(v => v !== current);
  if (others.length <= minCount) return others;
  const start = Math.floor((current % 997) % others.length);
  const out = [];
  for (let i = 0; i < others.length && out.length < minCount; i++) {
    out.push(others[(start + i) % others.length]);
  }
  return out;
}

function buildSectionHtml(currentVolume, related) {
  const items = related
    .map(v => {
      const file = 'how-much-chlorine-for-' + v + '-gallon-pool.html';
      return (
        '        <li><a href="' +
        file +
        '">' +
        formatVolume(v) +
        '</a></li>'
      );
    })
    .join('\n');
  return (
    '\n    <section class="related-chlorine">\n' +
    '      <h2>Chlorine by pool size</h2>\n' +
    '      <ul class="ring-links">\n' +
    items +
    '\n      </ul>\n' +
    '    </section>\n  '
  );
}

if (!fs.existsSync(OUTPUT_DIR)) {
  console.log('build-chlorine-links: skip (no OUTPUT_DIR)');
  process.exit(0);
}

const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.html') && SLUG_RE.test(f));

let updated = 0;
files.forEach(file => {
  const m = file.match(SLUG_RE);
  if (!m) return;
  const current = parseInt(m[1], 10);
  const related = pickRelated(current, VOLUMES, 5);
  const sectionHtml = buildSectionHtml(current, related);

  const filePath = path.join(OUTPUT_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');

  if (html.includes('class="related-chlorine"')) {
    html = html.replace(SECTION_RE, sectionHtml);
  } else {
    html = insertBeforeCommonQuestions(html, sectionHtml);
  }

  fs.writeFileSync(filePath, html, 'utf8');
  updated++;
});

console.log('build-chlorine-links: updated ' + updated + ' pages in programmatic/chlorine/');
