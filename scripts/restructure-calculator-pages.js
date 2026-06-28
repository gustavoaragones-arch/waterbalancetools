/**
 * Restructure calculator pages to the new UX hierarchy:
 *
 *   1. Hero (compact + SVG icon)          [P4]
 *      ↓  flow arrow                      [P2]
 *   2. Calculator form
 *   3. Results (output-panel)
 *   4. Maintenance schedule (if present)
 *      ↓  flow arrow                      [P2]
 *   5. Printable resources (premium labels)[P7]
 *   6. Recommended levels (trust-strip + calc-chart-crosslinks)
 *   7. Quick answers
 *   8. People Also Ask
 *   9. Related calculators  →  grouped card grid with counts [P5]
 *  10. Related guides       →  calc-related-tools + link-matrix
 *  11. Credibility / meta
 *  12. Last updated
 *
 * Also injects result-renderer.js into <head>.              [P1]
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

// ── P4 — SVG icons per calculator type ───────────────────────────────────────

const SVG_BEAKER = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M22 10h20M26 10v18L14 52h36L38 28V10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 44q5-4 12 0t12 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const SVG_POOL   = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="8" y="24" width="48" height="24" rx="5" stroke="currentColor" stroke-width="3"/><path d="M8 36q8-5 16 0t16 0t16 0" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M16 24v-8M48 24v-8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`;
const SVG_PH     = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="6" y="26" width="52" height="12" rx="6" stroke="currentColor" stroke-width="3"/><circle cx="32" cy="32" r="5" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="2.5" fill="currentColor"/><path d="M14 22v-5M32 20v-7M50 22v-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const SVG_HOTTUB = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 46c0-11 8-20 20-20s20 9 20 20" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M8 46h48" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M20 24v-5M32 22v-7M44 24v-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="2 2"/></svg>`;
const SVG_SALT   = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="18" y="18" width="28" height="28" rx="8" stroke="currentColor" stroke-width="3" transform="rotate(12 32 32)"/><circle cx="32" cy="32" r="5" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2.5"/></svg>`;
const SVG_WAVE   = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 44L20 22l14 14 10-18 12 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="22" r="3.5" fill="currentColor"/><circle cx="34" cy="36" r="3.5" fill="currentColor"/></svg>`;
const SVG_SHIELD = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M32 8L10 18v16c0 12 10 20 22 24 12-4 22-12 22-24V18L32 8z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M24 32a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`;
const SVG_CLOCK  = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="32" cy="32" r="22" stroke="currentColor" stroke-width="3"/><path d="M32 18v14l9 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_SPA    = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="32" cy="40" rx="24" ry="12" stroke="currentColor" stroke-width="3"/><path d="M8 40V32c0-7 10-12 24-12s24 5 24 12v8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`;

const CALC_ICONS = {
  'chemical-calculator.html':          SVG_BEAKER,
  'pool-chlorine-calculator.html':     SVG_BEAKER,
  'pool-ph-calculator.html':           SVG_PH,
  'pool-shock-calculator.html':        SVG_BEAKER,
  'pool-volume-calculator.html':       SVG_POOL,
  'hot-tub-chlorine-calculator.html':  SVG_HOTTUB,
  'hot-tub-ph-calculator.html':        SVG_PH,
  'hot-tub-shock-calculator.html':     SVG_HOTTUB,
  'saltwater-pool-salt-calculator.html': SVG_SALT,
  'pool-alkalinity-calculator.html':   SVG_WAVE,
  'pool-cyanuric-acid-calculator.html': SVG_SHIELD,
  'pool-turnover-rate-calculator.html': SVG_CLOCK,
  'spa-volume-calculator.html':        SVG_SPA,
  'volume-calculator.html':            SVG_POOL,
};

// ── P7 — Printable resources (premium labels) ─────────────────────────────────

const PRINTABLE_BLOCK = `    <section class="printable-resources">
      <h2>Free Printable Resources</h2>
      <div class="printable-cards">
        <a href="/resources/pool-maintenance-checklist" class="printable-card">
          <strong>Pool Maintenance Checklist</strong>
          <span>&#10003;&nbsp;Printable &middot; &#10003;&nbsp;Free &middot; &#10003;&nbsp;One Page</span>
        </a>
        <a href="/resources/hot-tub-maintenance-log" class="printable-card">
          <strong>Hot Tub Maintenance Log</strong>
          <span>&#10003;&nbsp;Printable &middot; &#10003;&nbsp;Free &middot; &#10003;&nbsp;Letter &amp; A4</span>
        </a>
        <a href="/resources/pool-chemical-log-sheet" class="printable-card">
          <strong>Pool Chemical Log Sheet</strong>
          <span>&#10003;&nbsp;Printable &middot; &#10003;&nbsp;Free &middot; &#10003;&nbsp;One Page</span>
        </a>
        <a href="/resources/airbnb-pool-turnover-checklist" class="printable-card">
          <strong>Vacation Rental Turnover Checklist</strong>
          <span>&#10003;&nbsp;Printable &middot; &#10003;&nbsp;Free &middot; &#10003;&nbsp;One Page</span>
        </a>
      </div>
    </section>`;

// ── P2 — Flow arrow ───────────────────────────────────────────────────────────

const FLOW = '    <div class="calc-flow-arrow" aria-hidden="true">&#8595;</div>';

// ── P5 — Related calculators card grid (with counts) ─────────────────────────

function relatedCalcsBlock(currentFile) {
  const groups = ALL_GROUPS.map(({ title, calcs }) => {
    const count = calcs.length;
    const cards = calcs.map(({ file, href, label }) => {
      const active = file === currentFile;
      const cls = active ? 'calc-card calc-card--active' : 'calc-card';
      return `          <a href="${href}" class="${cls}">${label}</a>`;
    }).join('\n');
    return `        <div class="related-calcs-group">
          <h3>${title} (${count})</h3>
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
    if (c === -1) break;
    const o = html.toLowerCase().indexOf(openLow, pos);
    if (o !== -1 && o < c) {
      depth++;
      pos = o + openLow.length;
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
  const afterMain    = html.slice(mainEnd);

  // ── Extract each known block ──────────────────────────────────────────────
  const B = {};

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
  // Old flat related-calculators list (replaced by generated card grid)
  ex('_oldRelatedCalcs', /<section\s[^>]*class="related-calculators[^"]*"[^>]*>/i, 'section');
  // Ad divs
  ex('adResult', /<div\s[^>]*class="ad ad-result"[^>]*>/i, 'div');
  ex('adBottom', /<div\s[^>]*class="ad ad-bottom"[^>]*>/i, 'div');
  // Form
  ex('calcForm', /<form\s/i, 'form');
  // Output/results panel
  ex('outputPanel', /<div\s[^>]*id="(?:output-panel|result)"[^>]*>/i, 'div');

  // Inline elements
  exInline('updated', /<p\s+class="updated">[^<]*<\/p>/i);

  // Discard stray context / silo-hub paragraphs
  mainContent = mainContent
    .replace(/<p\s+class="context"[^>]*>[\s\S]*?<\/p>/gi, '')
    .replace(/<p\s+class="silo-hub-cta"[^>]*>[\s\S]*?<\/p>/gi, '');

  // ── Handle bare <h1> (no .hero section) ──────────────────────────────────
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

  // ── P4 — Inject SVG icon into hero (idempotent guard: calc-hero-icon) ────
  const svg = CALC_ICONS[fileName];
  if (svg && B.hero && !B.hero.includes('calc-hero-icon')) {
    B.hero = B.hero.replace(
      '</section>',
      `  <div class="calc-hero-icon">${svg}</div>\n    </section>`
    );
  }

  // ── Combine Related Guides ────────────────────────────────────────────────
  const relatedGuides = [B.calcRelatedTools, B.linkMatrix].filter(Boolean).join('\n\n    ');

  // ── Assemble in new order ─────────────────────────────────────────────────
  // P2: flow arrows between Hero→Calculator and Answer→Downloads
  const parts = [
    B.hero,
    B.hero ? FLOW : null,          // ↓ Hero → Calculator
    B.calcForm,
    B.outputPanel,
    B.adResult,
    B.maintenance,
    FLOW,                           // ↓ Answer/Maintenance → Downloads
    PRINTABLE_BLOCK,
    B.trustStrip,
    B.calcChartXlinks,
    B.quickAnswers,
    B.quickTips,
    B.paa,
    relatedCalcsBlock(fileName),
    relatedGuides,
    B.adBottom,
    B.credibility,
    B.updated,
  ].filter(Boolean);

  const newMainContent = '\n    ' + parts.join('\n\n    ') + '\n\n  ';
  let newHtml = beforeMain + newMainContent + afterMain;

  // ── P1 — Inject result-renderer.js into <head> (idempotent) ──────────────
  if (!newHtml.includes('result-renderer.js')) {
    newHtml = newHtml.replace(
      '</head>',
      '  <script src="/js/result-renderer.js" defer></script>\n</head>'
    );
  }

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
