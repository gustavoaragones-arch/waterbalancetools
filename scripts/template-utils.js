/**
 * template-utils.js
 *
 * Shared utilities for all knowledge platform generators.
 * Provides token substitution, partial loading, file walking,
 * canonical site-footer, and the standard <head> / page-chrome helpers.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// ── Token substitution ────────────────────────────────────────────────────────

/**
 * Replace every {{TOKEN}} in a template string with values from a map.
 * Tokens not present in the map are left unchanged (so generators can
 * do multi-pass substitution).
 */
function fill(template, tokens) {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(tokens, key) ? tokens[key] : match
  );
}

// ── Partial loader ────────────────────────────────────────────────────────────

const _partialCache = {};

function partial(name) {
  if (!_partialCache[name]) {
    const p = path.join(ROOT, 'partials', name);
    _partialCache[name] = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  }
  return _partialCache[name];
}

// ── Template loader ───────────────────────────────────────────────────────────

function template(name) {
  return fs.readFileSync(path.join(ROOT, 'templates', name), 'utf8');
}

// ── Canonical site-header HTML ────────────────────────────────────────────────

const SITE_HEADER = `  <header class="site-header">
    <a href="/" class="logo-link">
      <img src="/assets/logo.svg" alt="WaterBalanceTools" class="logo" width="180" height="36">
    </a>
    <nav class="nav" id="site-nav" aria-label="Primary navigation">
      <a href="/calculators/chemical-calculator">Calculator</a>
      <a href="/resources/">Resources</a>
      <a href="/pool-chemical-levels-chart">Charts</a>
      <a href="/academy/">Academy</a>
      <a href="/guides/pool-chemistry-basics">Guides</a>
      <a href="/about/">About</a>
    </nav>
    <div class="nav-end">
      <a href="/search/" class="nav-search" aria-label="Search site">
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.6"/><path d="M13 13l3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </a>
      <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>`;

// ── Canonical site-footer HTML ────────────────────────────────────────────────

const SITE_FOOTER = `  <footer class="site-footer">
    <nav class="footer-nav">
      <a href="/calculators/pool-volume-calculator">Pool Volume Calculator</a>
      <a href="/calculators/pool-chlorine-calculator">Pool Chlorine Calculator</a>
      <a href="/calculators/pool-shock-calculator">Pool Shock Calculator</a>
      <a href="/calculators/pool-ph-calculator">Pool pH Calculator</a>
      <a href="/pool-chemical-levels-chart">Pool Chemical Levels Chart</a>
      <a href="/guides/pool-chemistry-basics">Pool Chemistry Guide</a>
      <a href="/all-pages">All Pages</a>
      <a href="/legal/ownership">Ownership</a>
      <a href="/legal/legal">Legal</a>
    </nav>
    <p class="footer-copy">&copy; 2026 Albor Digital LLC. All rights reserved.</p>
    <p class="footer-note">WaterBalanceTools.com is an independent educational website owned and operated by Albor Digital LLC.</p>
  </footer>`;

// ── Breadcrumb builder ────────────────────────────────────────────────────────

const DIR_LABELS = {
  calculators:       'Calculators',
  resources:         'Resources',
  guides:            'Guides',
  charts:            'Charts',
  academy:           'Academy',
  formulas:          'Formula Library',
  glossary:          'Glossary',
  reference:         'Reference',
  comparisons:       'Comparisons',
  methodology:       'Methodology',
  about:             'About',
  search:            'Search',
  'academy/fundamentals':       'Fundamentals',
  'academy/sanitizers':         'Sanitizers',
  'academy/testing':            'Testing',
  'academy/water-balance':      'Water Balance',
  'academy/troubleshooting':    'Troubleshooting',
  'academy/hot-tubs':           'Hot Tubs & Spas',
  'academy/equipment':          'Equipment',
  'academy/vacation-rentals':   'Vacation Rentals',
};

/**
 * Build the breadcrumb <nav> for a clean URL path like
 * "academy/fundamentals/understanding-ph".
 *
 * @param {string} cleanPath  - root-relative path without leading slash or .html
 * @param {string} pageTitle  - human-readable title of the leaf page
 */
function buildBreadcrumb(cleanPath, pageTitle) {
  const segments = cleanPath.replace(/\/$/, '').split('/').filter(Boolean);
  if (!segments.length) return '';

  const crumbs = [{ href: '/', label: 'Home' }];
  let cumulative = '';
  for (let i = 0; i < segments.length - 1; i++) {
    cumulative += (i === 0 ? '' : '/') + segments[i];
    const check = i > 0 ? cumulative : segments[i];
    const label = DIR_LABELS[check] || DIR_LABELS[segments[i]] || titleCase(segments[i]);
    crumbs.push({ href: '/' + cumulative + '/', label });
  }
  // Leaf — current page
  crumbs.push({ href: null, label: pageTitle });

  const schemaItems = crumbs.map((c, idx) =>
    `      {"@type":"ListItem","position":${idx + 1},"name":"${esc(c.label)}"` +
    (c.href ? `,"item":"https://waterbalancetools.com${c.href === '/' ? '' : c.href}"` : '') +
    '}'
  ).join(',\n');

  const schema = `<script type="application/ld+json">\n  {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[\n${schemaItems}]}\n</script>`;

  const items = crumbs.map((c, idx) => {
    const isCurrent = !c.href;
    if (isCurrent) {
      return `    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" aria-current="page">` +
        `<span itemprop="name">${esc(c.label)}</span><meta itemprop="position" content="${idx + 1}"></li>`;
    }
    const liHtml =
      `    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">` +
      `<a href="${c.href}" itemprop="item"><span itemprop="name">${esc(c.label)}</span></a>` +
      `<meta itemprop="position" content="${idx + 1}"></li>`;
    if (idx < crumbs.length - 2) {
      return liHtml + '\n    <li class="breadcrumb-sep" aria-hidden="true">&#8250;</li>';
    }
    return liHtml + '\n    <li class="breadcrumb-sep" aria-hidden="true">&#8250;</li>';
  }).join('\n');

  const nav = `<nav class="breadcrumb" aria-label="Breadcrumb">\n  <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">\n${items}\n  </ol>\n</nav>`;
  return { nav, schema };
}

// ── Related-content block builders ───────────────────────────────────────────

/**
 * Render an array of { href, label, description? } as knowledge-card elements.
 */
function renderCards(items, maxItems = 6) {
  return (items || []).slice(0, maxItems).map(item =>
    `<a href="${item.href}" class="knowledge-card">` +
    `<div class="knowledge-card-title">${esc(item.label)}</div>` +
    (item.description ? `<p class="knowledge-card-desc">${esc(item.description)}</p>` : '') +
    `</a>`
  ).join('\n');
}

/**
 * Render an array of hrefs as sidebar list items.
 * Uses the nav pages index to resolve labels.
 */
function renderSidebarLinks(hrefs, navPages) {
  return (hrefs || []).map(href => {
    const entry = navPages.find(p => p.url === href || '/' + p.url === href);
    const label = entry ? entry.title : titleCase(href.split('/').pop().replace(/-/g, ' '));
    return `<li><a href="${href}">${esc(label)}</a></li>`;
  }).join('\n');
}

// ── String helpers ────────────────────────────────────────────────────────────

function titleCase(str) {
  return String(str || '')
    .replace(/-/g, ' ')
    .replace(/\b([a-z])/g, (_, c) => c.toUpperCase());
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugToTitle(slug) {
  return titleCase(path.basename(slug));
}

// ── File walk ─────────────────────────────────────────────────────────────────

const SKIP_WALK = new Set(['node_modules', '.git', 'assets', 'js', 'functions', 'data', 'lib']);

function walkHtml(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_WALK.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { walkHtml(full, out); continue; }
    if (e.isFile() && e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

// ── Write with directory creation ────────────────────────────────────────────

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  fill,
  partial,
  template,
  SITE_HEADER,
  SITE_FOOTER,
  DIR_LABELS,
  buildBreadcrumb,
  renderCards,
  renderSidebarLinks,
  titleCase,
  esc,
  slugToTitle,
  walkHtml,
  writeFile,
  ROOT,
};
