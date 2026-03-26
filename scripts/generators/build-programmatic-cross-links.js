/**
 * Injects AEO cross-links on all programmatic HTML pages:
 * primary calculator + 2 problem guides + 2 explanation guides.
 * Idempotent. Run after all programmatic generators.
 */
const fs = require('fs');
const path = require('path');
const { PROBLEMS } = require('./problem-cluster-config');
const { TOPICS: EXPL_TOPICS } = require('./explanation-cluster-config');

const ROOT = path.join(__dirname, '..', '..');
const PROG = path.join(ROOT, 'programmatic');
const SECTION_RE = /\s*<section class="aeo-cross-links">[\s\S]*?<\/section>\s*/i;

const PROBLEM_SLUGS = PROBLEMS.map(p => p.slug);
const EXPL_SLUGS = EXPL_TOPICS.map(t => t.slug);

function problemTitle(slug) {
  const p = PROBLEMS.find(x => x.slug === slug);
  return p ? p.title : slug;
}
function explTitle(slug) {
  const t = EXPL_TOPICS.find(x => x.slug === slug);
  return t ? t.title : slug;
}

function calcPrimaryFor(relPath) {
  const s = relPath.replace(/\\/g, '/');
  if (s.includes('/chlorine/')) return 'calculators/pool-chlorine-calculator.html';
  if (s.includes('/shock/')) return 'calculators/pool-shock-calculator.html';
  if (s.includes('/ph/')) return 'calculators/pool-ph-calculator.html';
  if (s.includes('/hot-tubs/')) return 'calculators/hot-tub-chlorine-calculator.html';
  if (s.includes('/problems/')) return 'calculators/chemical-calculator.html';
  if (s.includes('/explanations/')) return 'calculators/pool-ph-calculator.html';
  if (s.includes('/behavior/')) return 'calculators/pool-chlorine-calculator.html';
  return 'calculators/chemical-calculator.html';
}

function calcLabel(relPath) {
  const s = relPath.replace(/\\/g, '/');
  if (s.includes('/shock/')) return 'Pool Shock Calculator';
  if (s.includes('/ph/')) return 'Pool pH Calculator';
  if (s.includes('/hot-tubs/')) return 'Hot Tub Chlorine Calculator';
  if (s.includes('/chlorine/')) return 'Pool Chlorine Calculator';
  if (s.includes('/behavior/')) return 'Pool chemistry calculators';
  if (s.includes('/explanations/')) return 'Pool pH Calculator';
  if (s.includes('/problems/')) return 'Chemical Calculator';
  return 'Pool Chemical Calculator';
}

function hrefTo(fromFile, targetRelFromRoot) {
  const dir = path.dirname(fromFile);
  return path.relative(dir, path.join(ROOT, targetRelFromRoot)).replace(/\\/g, '/');
}

function pickTwo(slugs, excludeSlug) {
  const rest = excludeSlug ? slugs.filter(s => s !== excludeSlug) : slugs.slice();
  if (rest.length === 0) return [];
  const start = (excludeSlug ? excludeSlug.length : 0) % rest.length;
  const out = [];
  for (let i = 0; i < rest.length && out.length < 2; i++) {
    out.push(rest[(start + i) % rest.length]);
  }
  return out;
}

function buildSection(fromRel) {
  const currentSlug = path.basename(fromRel, '.html');
  const isProblem = fromRel.includes('/problems/');
  const isExpl = fromRel.includes('/explanations/');
  const calc = calcPrimaryFor(fromRel);
  const calcHref = hrefTo(fromRel, calc);
  const probPick = pickTwo(PROBLEM_SLUGS, isProblem ? currentSlug : null);
  const explPick = pickTwo(EXPL_SLUGS, isExpl ? currentSlug : null);

  const probItems = probPick
    .map(slug => {
      const href = hrefTo(fromRel, 'programmatic/problems/' + slug + '.html');
      return '        <li><a href="' + href + '">' + problemTitle(slug) + '</a></li>';
    })
    .join('\n');

  const explItems = explPick
    .map(slug => {
      const href = hrefTo(fromRel, 'programmatic/explanations/' + slug + '.html');
      return '        <li><a href="' + href + '">' + explTitle(slug) + '</a></li>';
    })
    .join('\n');

  return (
    '\n    <section class="aeo-cross-links card">\n' +
    '      <h2>Related tools &amp; answers</h2>\n' +
    '      <p><a href="' +
    calcHref +
    '" class="btn btn-primary">' +
    calcLabel(fromRel) +
    '</a></p>\n' +
    '      <h3>Problem guides</h3>\n' +
    '      <ul class="ring-links">\n' +
    probItems +
    '\n      </ul>\n' +
    '      <h3>Explanations</h3>\n' +
    '      <ul class="ring-links">\n' +
    explItems +
    '\n      </ul>\n' +
    '    </section>\n  '
  );
}

function walkHtmlFiles(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkHtmlFiles(full, out);
    else if (e.name.endsWith('.html')) out.push(path.relative(ROOT, full).replace(/\\/g, '/'));
  }
}

if (!fs.existsSync(PROG)) {
  console.log('build-programmatic-cross-links: no programmatic/');
  process.exit(0);
}

const files = [];
walkHtmlFiles(PROG, files);

let updated = 0;
files.forEach(rel => {
  const full = path.join(ROOT, rel);
  const sectionHtml = buildSection(rel);
  let html = fs.readFileSync(full, 'utf8');
  if (html.includes('class="aeo-cross-links"')) {
    html = html.replace(SECTION_RE, sectionHtml);
  } else {
    html = html.replace('</main>', sectionHtml + '</main>');
  }
  fs.writeFileSync(full, html, 'utf8');
  updated++;
});

console.log('build-programmatic-cross-links: updated ' + updated + ' programmatic pages');
