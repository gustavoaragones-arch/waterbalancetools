/**
 * Internal linking for programmatic/ph cluster (how-to-adjust-ph-from-*).
 */
const fs = require('fs');
const path = require('path');
const { OUTPUT_DIR, LEVELS, slugFile } = require('./ph-cluster-config');
const { insertBeforeCommonQuestions } = require('./serp-dominance-helpers');

const SECTION_RE = /\s*<section class="related-ph">[\s\S]*?<\/section>\s*/i;

function sameLevel(a, b) {
  return a.from === b.from && a.to === b.to;
}

function label(lvl) {
  return 'pH ' + lvl.from + ' → ' + lvl.to;
}

function pickRelated(current, all, minCount) {
  const others = all.filter(l => !sameLevel(l, current));
  if (others.length <= minCount) return others;
  const seed = Math.floor(current.from * 100 + current.to * 10);
  const start = seed % others.length;
  const out = [];
  for (let i = 0; i < others.length && out.length < minCount; i++) {
    out.push(others[(start + i) % others.length]);
  }
  return out;
}

function buildSectionHtml(current, related) {
  const items = related
    .map(l => {
      const file = slugFile(l);
      return (
        '        <li><a href="' +
        file +
        '">' +
        label(l) +
        '</a></li>'
      );
    })
    .join('\n');
  return (
    '\n    <section class="related-ph">\n' +
    '      <h2>More pH adjustment guides</h2>\n' +
    '      <ul class="ring-links">\n' +
    items +
    '\n      </ul>\n' +
    '    </section>\n  '
  );
}

if (!fs.existsSync(OUTPUT_DIR)) {
  console.log('build-ph-links: skip (no OUTPUT_DIR)');
  process.exit(0);
}

const byFile = new Map();
LEVELS.forEach(l => byFile.set(slugFile(l), l));

const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.startsWith('how-to-adjust-ph-from-') && f.endsWith('.html'));

let updated = 0;
files.forEach(file => {
  const current = byFile.get(file);
  if (!current) return;
  const related = pickRelated(current, LEVELS, 3);
  const sectionHtml = buildSectionHtml(current, related);
  const filePath = path.join(OUTPUT_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('class="related-ph"')) {
    html = html.replace(SECTION_RE, sectionHtml);
  } else {
    html = insertBeforeCommonQuestions(html, sectionHtml);
  }
  fs.writeFileSync(filePath, html, 'utf8');
  updated++;
});

console.log('build-ph-links: updated ' + updated + ' pages in programmatic/ph/');
