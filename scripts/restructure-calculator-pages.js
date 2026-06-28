/**
 * Restructure calculator pages to the new UX hierarchy:
 *
 *   1. Hero (compact)
 *   2. Calculator form
 *   3. Results (output-panel)
 *   4. Maintenance schedule (if present)
 *   5. Printable resources (injected)
 *   6. Recommended levels (trust-strip + calc-chart-crosslinks)
 *   7. Quick answers
 *   8. People Also Ask
 *   9. Related calculators  →  grouped responsive card grid
 *  10. Related guides       →  calc-related-tools + link-matrix
 *  11. Credibility / meta
 *  12. Last updated
 *
 * Idempotent — runs every pipeline cycle after all injectors.
 * Run: node scripts/restructure-calculator-pages.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const CALC_DIR = path.join(ROOT, 'calculators');

// ── Calculator catalogue ──────────────────────────────────────────────────────

const POOL_CALCS = [
  { file: 'chemical-calculator.html',         href: '/calculators/chemical-calculator',         label: 'Pool Chemical Calculator' },
  { file: 'pool-chlorine-calculator.html',    href: '/calculators/pool-chlorine-calculator',    label: 'Pool Chlorine Calculator' },
  { file: 'pool-ph-calculator.html',          href: '/calculators/pool-ph-calculator',          label: 'Pool pH Calculator' },
  { file: 'pool-shock-calculator.html',       href: '/calculators/pool-shock-calculator',       label: 'Pool Shock Calculator' },
  { file: 'pool-volume-calculator.html',      href: '/calculators/pool-volume-calculator',      label: 'Pool Volume Calculator' },
];
const HOT_TUB_CALCS = [
  { file: 'hot-tub-chlorine-calculator.html', href: '/calculators/hot-tub-chlorine-calculator', label: 'Hot Tub Chlorine Calculator' },
  { file: 'hot-tub-ph-calculator.html',       href: '/calculators/hot-tub-ph-calculator',       label: 'Hot Tub pH Calculator' },
  { file: 'hot-tub-shock-calculator.html',    href: '/calculators/hot-tub-shock-calculator',    label: 'Hot Tub Shock Calculator' },
];
const WATER_CHEM_CALCS = [
  { file: 'saltwater-pool-salt-calculator.html', href: '/calculators/saltwater-pool-salt-calculator', label: 'Salt Calculator' },
  { file: 'pool-alkalinity-calculator.html',     href: '/calculators/pool-alkalinity-calculator',     label: 'Alkalinity Calculator' },
  { file: 'pool-cyanuric-acid-calculator.html',  href: '/calculators/pool-cyanuric-acid-calculator',  label: 'CYA Calculator' },
  { file: 'pool-turnover-rate-calculator.html',  href: '/calculators/pool-turnover-rate-calculator',  label: 'Turnover Rate Calculator' },
  { file: 'spa-volume-calculator.html',          href: '/calculators/spa-volume-calculator',          label: 'Spa Volume Calculator' },
  { file: 'volume-calculator.html',              href: '/calculators/volume-calculator',              label: 'Volume Calculator' },
];
const ALL_GROUPS = [
  { title: 'Pool Calculators',    calcs: POOL_CALCS },
  { title: 'Hot Tub Calculators', calcs: HOT_TUB_CALCS },
  { title: 'Water Chemistry',     calcs: WATER_CHEM_CALCS },
];
const ALL_FILES = [
  ...POOL_CALCS,
  ...HOT_TUB_CALCS,
  ...WATER_CHEM_CALCS,
];

// ── Printable resources ───────────────────────────────────────────────────────

const PRINTABLE_BLOCK = `    <section class="printable-resources">
      <h2>Free Printable Resources</h2>
      <div class="printable-cards">
        <a href="/printable/maintenance-checklist" class="printable-card">
          <strong>Pool Maintenance Plan</strong>
          <span>Fillable checklist — download as PDF</span>
        </a>
        <a href="/printables/pool-maintenance-checklist" class="printable-card">
          <strong>Pool Maintenance Checklist</strong>
          <span>Weekly task tracker</span>
        </a>
        <a href="/printables/hot-tub-maintenance-log" class="printable-card">
          <strong>Hot Tub Maintenance Log</strong>
          <span>Chemical log sheet</span>
        </a>
        <a href="/printables/airbnb-pool-turnover-checklist" class="printable-card">
          <strong>Vacation Rental Turnover Checklist</strong>
          <span>Pool handoff reference</span>
        </a>
      </div>
    </section>`;

// ── Related calculators card grid ─────────────────────────────────────────────

function relatedCalcsBlock(currentFile) {
  const groups = ALL_GROUPS.map(({ title, calcs }) => {
    const cards = calcs.map(({ file, href, label }) => {
      const active = file === currentFile;
      const cls = active ? 'calc-card calc-card--active' : 'calc-card';
      return `          <a href="${href}" class="${cls}">${label}</a>`;
    }).join('\n');
    return `        <div class="related-calcs-group">
          <h3>${title}</h3>
          <div class="related-calcs-cards">
${cards}
          </div>
        </div>`;
  }).join('\n');

  return `    <section class="related-calculators">
      <h2>Related Calculators</h2>
      <div class="related-calcs-grid">
${groups}
      </div>
    </section>`;
}

// ── Block extraction ──────────────────────────────────────────────────────────

/**
 * Extract the first HTML block matching openRe from html.
 * Uses depth-counting against closeTag to find the matching end tag.
 * Returns { block, rest } — rest has the block removed.
 */
function pluck(html, openRe, closeTag) {
  openRe.lastIndex = 0;
  const m = openRe.exec(html);
  if (!m) return { block: '', rest: html };

  const startIdx = m.index;
  const closeStr = '</' + closeTag + '>';
  const openLow  = '<' + closeTag.toLowerCase();

  let depth = 1;
  let pos   = startIdx + m[0].length;

  while (depth > 0 && pos < html.length) {
    const c = html.toLowerCase().indexOf(closeStr.toLowerCase(), pos);
    if (c === -1) break; // malformed, bail
    const o = html.toLowerCase().indexOf(openLow, pos);
    if (o !== -1 && o < c) {
      depth++;
      pos = o + openLow.length; // skip past the nested open-tag start
    } else {
      depth--;
      pos = c + closeStr.length;
    }
  }

  const block = html.slice(startIdx, pos);
  const rest  = html.slice(0, startIdx) + html.slice(pos);
  return { block, rest };
}

/** Pluck an inline element matched by a plain regex (no nesting). */
function pluckInline(html, re) {
  const m = re.exec(html);
  if (!m) return { block: '', rest: html };
  return { block: m[0], rest: html.slice(0, m.index) + html.slice(m.index + m[0].length) };
}

// ── Main restructure ──────────────────────────────────────────────────────────

function restructureFile(fileName) {
  const filePath = path.join(CALC_DIR, fileName);
  if (!fs.existsSync(filePath)) return false;

  let html = fs.readFileSync(filePath, 'utf8');

  // ── Locate <main class="container"> boundaries ────────────────────────────
  const MAIN_OPEN  = '<main class="container">';
  const mainStart  = html.indexOf(MAIN_OPEN);
  if (mainStart === -1) return false;
  const contentStart = mainStart + MAIN_OPEN.length;
  const mainEnd      = html.lastIndexOf('</main>');
  if (mainEnd === -1) return false;

  const beforeMain   = html.slice(0, contentStart);
  let   mainContent  = html.slice(contentStart, mainEnd);
  const afterMain    = html.slice(mainEnd); // includes </main> onward

  // ── Extract each known block (order of extraction is irrelevant) ──────────
  const B = {}; // named blocks

  function ex(name, openRe, closeTag) {
    const { block, rest } = pluck(mainContent, openRe, closeTag);
    B[name] = block;
    mainContent = rest;
  }
  function exInline(name, re) {
    const { block, rest } = pluckInline(mainContent, re);
    B[name] = block;
    mainContent = rest;
  }

  ex('hero',             /<section\s[^>]*class="hero[^"]*"[^>]*>/i,               'section');
  ex('trustStrip',       /<section\s[^>]*class="trust-strip[^"]*"[^>]*>/i,        'section');
  ex('quickAnswers',     /<section\s[^>]*class="quick-answers[^"]*"[^>]*>/i,      'section');
  ex('paa',              /<section\s[^>]*class="people-also-ask[^"]*"[^>]*>/i,    'section');
  ex('calcRelatedTools', /<section\s[^>]*class="calc-related-tools[^"]*"[^>]*>/i, 'section');
  ex('linkMatrix',       /<section\s[^>]*class="link-matrix[^"]*"[^>]*>/i,        'section');
  ex('calcChartXlinks',  /<section\s[^>]*class="calc-chart-crosslinks[^"]*"[^>]*>/i, 'section');
  ex('maintenance',      /<section\s[^>]*class="maintenance-section[^"]*"[^>]*>/i,   'section');
  ex('quickTips',        /<section\s[^>]*class="quick-tips[^"]*"[^>]*>/i,         'section');
  ex('relatedTools',     /<section\s[^>]*class="related-tools[^"]*"[^>]*>/i,      'section');
  ex('credibility',      /<section\s[^>]*class="credibility[^"]*"[^>]*>/i,        'section');
  // The old flat related-calculators list (replaced by generated card grid)
  ex('_oldRelatedCalcs', /<section\s[^>]*class="related-calculators[^"]*"[^>]*>/i, 'section');
  // Ad divs
  ex('adResult', /<div\s[^>]*class="ad ad-result"[^>]*>/i, 'div');
  ex('adBottom', /<div\s[^>]*class="ad ad-bottom"[^>]*>/i, 'div');
  // Form
  ex('calcForm', /<form\s/i, 'form');
  // Output/results panel
  ex('outputPanel', /<div\s[^>]*id="(?:output-panel|result)"[^>]*>/i, 'div');

  // Inline elements (single-line)
  exInline('updated',    /<p\s+class="updated">[^<]*<\/p>/i);

  // Discard: context paragraph, silo-hub-cta, old quick-tips/related-tools
  // (quick-tips content is superseded by quick-answers; related-tools by card grid)
  mainContent = mainContent
    .replace(/<p\s+class="context"[^>]*>[\s\S]*?<\/p>/gi, '')
    .replace(/<p\s+class="silo-hub-cta"[^>]*>[\s\S]*?<\/p>/gi, '');

  // ── Handle volume-calculator.html: bare <h1> (no .hero section) ──────────
  if (!B.hero) {
    const bareHero = mainContent.match(
      /<h1[^>]*>([\s\S]*?)<\/h1>(\s*<p[^>]*>[\s\S]*?<\/p>)?/i
    );
    if (bareHero) {
      const h1part = bareHero[0];
      B.hero = `    <section class="hero hero-compact">\n      ${h1part.trim()}\n    </section>`;
      mainContent = mainContent.replace(h1part, '');
    }
  }

  // ── Combine Related Guides (calc-related-tools + link-matrix) ────────────
  const relatedGuides = [B.calcRelatedTools, B.linkMatrix].filter(Boolean).join('\n\n    ');

  // ── Assemble in new order ─────────────────────────────────────────────────
  const parts = [
    B.hero,
    B.calcForm,
    B.outputPanel,
    B.adResult,       // ad immediately after results
    B.maintenance,
    PRINTABLE_BLOCK,
    B.trustStrip,
    B.calcChartXlinks,
    B.quickAnswers,
    B.quickTips,      // kept if present (quick tips on older calculators)
    B.paa,
    relatedCalcsBlock(fileName),
    relatedGuides,
    B.adBottom,
    B.credibility,
    B.updated,
  ].filter(Boolean);

  // Whitespace remaining in mainContent (e.g. stray whitespace/newlines) is ignored.

  const newMainContent = '\n    ' + parts.join('\n\n    ') + '\n\n  ';
  const newHtml = beforeMain + newMainContent + afterMain;
  fs.writeFileSync(filePath, newHtml, 'utf8');
  return true;
}

// ── Run ───────────────────────────────────────────────────────────────────────

let updated = 0;
let skipped = 0;
for (const { file } of ALL_FILES) {
  if (restructureFile(file)) {
    updated++;
  } else {
    skipped++;
  }
}

console.log(
  `restructure-calculator-pages: updated ${updated} calculators` +
  (skipped ? ` (${skipped} not found / skipped)` : '')
);
