/**
 * Insert or update "Related Pool Calculators" section on each calculator page.
 * Links to all other calculators (at least 3); excludes self. Uses root-relative paths.
 * Run from project root: node scripts/build-calculator-links.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CALC_DIR = path.join(ROOT, 'calculators');
const BASE_PATH = '/calculators';

function titleFromFilename(filename) {
  const base = filename.replace(/\.html$/i, '');
  return base
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function listCalculators() {
  if (!fs.existsSync(CALC_DIR)) return [];
  return fs
    .readdirSync(CALC_DIR)
    .filter(f => f.endsWith('.html'))
    .sort()
    .map(f => ({
      file: f,
      pathNoExt: f.replace(/\.html$/i, ''),
      href: BASE_PATH + '/' + f.replace(/\.html$/i, ''),
      title: titleFromFilename(f)
    }));
}

function buildSectionHtml(links) {
  if (links.length === 0) return '';
  const items = links
    .map(
      ({ href, title }) =>
        '<li><a href="' + href + '">' + title + '</a></li>'
    )
    .join('\n');
  return (
    '\n    <section class="related-calculators">\n' +
    '      <h2>Related Pool Calculators</h2>\n' +
    '      <ul>\n' +
    items
      .split('\n')
      .map(l => '        ' + l)
      .join('\n') +
    '\n      </ul>\n    </section>\n  '
  );
}

const calculators = listCalculators();
if (calculators.length < 4) {
  console.warn('Fewer than 4 calculators; some pages may have fewer than 3 related links.');
}

const SECTION_REGEX = /(\s*)<section\s+class="related-calculators">[\s\S]*?<\/section>\s*/i;

calculators.forEach(({ file, pathNoExt, title }) => {
  const filePath = path.join(CALC_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');

  const otherCalcs = calculators.filter(c => c.pathNoExt !== pathNoExt);
  const links = otherCalcs.slice(0, Math.max(3, otherCalcs.length));
  const sectionHtml = buildSectionHtml(links);

  const existing = html.match(SECTION_REGEX);
  if (existing) {
    html = html.replace(SECTION_REGEX, sectionHtml);
  } else {
    html = html.replace('</main>', sectionHtml + '</main>');
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(file + ' → ' + links.length + ' related links');
});

console.log('Done. Updated ' + calculators.length + ' calculator pages.');
