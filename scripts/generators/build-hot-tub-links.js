/**
 * Internal linking for programmatic/hot-tubs cluster.
 */
const fs = require('fs');
const path = require('path');
const { OUTPUT_DIR, SIZES } = require('./hot-tub-cluster-config');
const { insertBeforeCommonQuestions } = require('./serp-dominance-helpers');

const SLUG_RE = /^hot-tub-chemicals-for-(\d+)-gallons\.html$/;
const SECTION_RE = /\s*<section class="related-hot-tubs">[\s\S]*?<\/section>\s*/i;

function formatSize(n) {
  return Number(n).toLocaleString() + ' gal';
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

function buildSectionHtml(currentSize, related) {
  const items = related
    .map(s => {
      const file = 'hot-tub-chemicals-for-' + s + '-gallons.html';
      return (
        '        <li><a href="' +
        file +
        '">' +
        formatSize(s) +
        '</a></li>'
      );
    })
    .join('\n');
  return (
    '\n    <section class="related-hot-tubs">\n' +
    '      <h2>Hot tub chemicals by size</h2>\n' +
    '      <ul class="ring-links">\n' +
    items +
    '\n      </ul>\n' +
    '    </section>\n  '
  );
}

if (!fs.existsSync(OUTPUT_DIR)) {
  console.log('build-hot-tub-links: skip (no OUTPUT_DIR)');
  process.exit(0);
}

const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.html') && SLUG_RE.test(f));
let updated = 0;
files.forEach(file => {
  const m = file.match(SLUG_RE);
  if (!m) return;
  const current = parseInt(m[1], 10);
  const related = pickRelated(current, SIZES, 4);
  const sectionHtml = buildSectionHtml(current, related);
  const filePath = path.join(OUTPUT_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('class="related-hot-tubs"')) {
    html = html.replace(SECTION_RE, sectionHtml);
  } else {
    html = insertBeforeCommonQuestions(html, sectionHtml);
  }
  fs.writeFileSync(filePath, html, 'utf8');
  updated++;
});

console.log('build-hot-tub-links: updated ' + updated + ' pages in programmatic/hot-tubs/');
