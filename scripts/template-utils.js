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
const urlEngine = require('../js/url/url-engine');

const ROOT = path.join(__dirname, '..');

function href(value) {
  return urlEngine.href(value);
}

function buildUrl(value) {
  return urlEngine.buildUrl(value);
}

function absoluteUrl(value) {
  return urlEngine.absoluteUrl(value);
}

function canonicalUrl(value) {
  return urlEngine.canonicalUrl(value);
}

function sitemapUrl(value) {
  return urlEngine.sitemapUrl(value);
}

function joinUrl(...parts) {
  return urlEngine.join(...parts);
}

// ── Token substitution ────────────────────────────────────────────────────────

/**
 * Replace every {{TOKEN}} in a template string with values from a map.
 * Tokens not present in the map are left unchanged (so generators can
 * do multi-pass substitution across inject-*.js stages).
 *
 * A token whose key IS present in the map but whose value is null/undefined
 * is always a generator bug (a real value was intended), never a legitimate
 * multi-pass placeholder -- so that case is a hard build error rather than
 * a silently stringified "undefined"/"null" in production output.
 */
function fill(template, tokens) {
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, key) => {
    if (!Object.prototype.hasOwnProperty.call(tokens, key)) return match;
    const value = tokens[key];
    if (value === undefined || value === null) {
      throw new Error(
        `fill(): template variable "${key}" was passed as ${value} instead of a real value or an explicit '' fallback. ` +
        `Refusing to render it as the literal string "${value}" into production output.`
      );
    }
    return value;
  });
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
    <a href="${href('/')}" class="logo-link">
      <img src="/public/logo.svg" alt="WaterBalanceTools" class="logo" width="185" height="56">
    </a>
    <nav class="nav" id="site-nav" aria-label="Primary navigation">
      <a href="${href('/calculators/chemical-calculator')}">Calculator</a>
      <a href="${href('/resources')}">Resources</a>
      <a href="${href('/pool-chemical-levels-chart')}">Charts</a>
      <a href="${href('/academy')}">Academy</a>
      <a href="${href('/guides/pool-chemistry-basics')}">Guides</a>
      <a href="${href('/about')}">About</a>
    </nav>
    <div class="nav-end">
      <a href="${href('/search')}" class="nav-search" aria-label="Search site">
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
      <a href="${href('/calculators/pool-volume-calculator')}">Pool Volume Calculator</a>
      <a href="${href('/calculators/pool-chlorine-calculator')}">Pool Chlorine Calculator</a>
      <a href="${href('/calculators/pool-shock-calculator')}">Pool Shock Calculator</a>
      <a href="${href('/calculators/pool-ph-calculator')}">Pool pH Calculator</a>
      <a href="${href('/pool-chemical-levels-chart')}">Pool Chemical Levels Chart</a>
      <a href="${href('/guides/pool-chemistry-basics')}">Pool Chemistry Guide</a>
      <a href="${href('/all-pages')}">All Pages</a>
      <a href="${href('/legal/ownership')}">Ownership</a>
      <a href="${href('/legal/legal')}">Legal</a>
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
  const normalizedPath = buildUrl(cleanPath || '/');
  const segments = normalizedPath.replace(/^\//, '').split('/').filter(Boolean);
  if (!segments.length) return '';

  const crumbs = [{ href: href('/'), label: 'Home' }];
  let cumulative = '';
  for (let i = 0; i < segments.length - 1; i++) {
    cumulative += (i === 0 ? '' : '/') + segments[i];
    const check = i > 0 ? cumulative : segments[i];
    const label = DIR_LABELS[check] || DIR_LABELS[segments[i]] || titleCase(segments[i]);
    crumbs.push({ href: href(cumulative), label });
  }
  // Leaf — current page
  crumbs.push({ href: null, label: pageTitle });

  // JSON-LD is not HTML: the "name" value must be JSON-string-escaped
  // (JSON.stringify), not HTML-entity-escaped (esc()). Using esc() here
  // previously left literal "&amp;" text inside the structured-data name
  // for any label containing "&", diverging from the visible H1/breadcrumb
  // text a browser renders from the same label (Phase 7H schema-content
  // consistency fix).
  const schemaItems = crumbs.map((c, idx) =>
    `      {"@type":"ListItem","position":${idx + 1},"name":${JSON.stringify(c.label)}` +
    (c.href ? `,"item":"${canonicalUrl(c.href)}"` : '') +
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
    return liHtml;
  }).join('\n');

  const nav = `<nav class="breadcrumb" aria-label="Breadcrumb">\n  <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList" style="list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;align-items:center;gap:.15rem">\n${items}\n  </ol>\n</nav>`;
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
    const normalizedHref = buildUrl(href);
    const entry = navPages.find(p => p.url === normalizedHref);
    const label = entry ? entry.title : titleCase(normalizedHref.split('/').pop().replace(/-/g, ' '));
    return `<li><a href="${normalizedHref}">${esc(label)}</a></li>`;
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

// ── Content rendering helpers ─────────────────────────────────────────────────

/**
 * Render plain-text body into HTML.
 * - Double newlines → paragraph breaks.
 * - Blocks where every non-empty line starts with "- " → <ul><li>.
 */
function renderBody(text) {
  if (!text) return '';
  return text.trim()
    .split(/\n\n+/)
    .map(block => {
      block = block.trim();
      if (!block) return '';
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.every(l => l.startsWith('- '))) {
        return '<ul>\n' + lines.map(l => `<li>${esc(l.slice(2))}</li>`).join('\n') + '\n</ul>';
      }
      return `<p>${esc(lines.join(' '))}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Build the main content HTML for an Academy article from structured fields.
 * Order: overview → key facts box → h2 sections → examples → common mistakes → sources.
 */
function buildArticleContent(article) {
  let html = '';

  // Overview paragraph
  if (article.overview) {
    html += `<div id="overview">\n${renderBody(article.overview)}\n</div>\n\n`;
  }

  // Key facts box
  if ((article.keyFacts || []).length > 0) {
    html += `<section class="knowledge-takeaways" id="key-facts">\n`;
    html += `  <h2>Key Facts</h2>\n  <ul>\n`;
    for (const f of article.keyFacts) html += `    <li>${esc(f)}</li>\n`;
    html += `  </ul>\n</section>\n\n`;
  }

  // Sections
  for (const sec of (article.sections || [])) {
    const id = sec.id || (sec.h2 || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    html += `<section id="${id}">\n<h2>${esc(sec.h2)}</h2>\n${renderBody(sec.body)}\n</section>\n\n`;
  }

  // Examples
  if ((article.examples || []).length > 0) {
    html += `<section id="examples">\n<h2>Examples</h2>\n`;
    for (const ex of article.examples) {
      html += `<div class="knowledge-example">\n<strong>${esc(ex.title)}</strong>\n${renderBody(ex.body)}\n</div>\n`;
    }
    html += `</section>\n\n`;
  }

  // Common mistakes
  if ((article.commonMistakes || []).length > 0) {
    html += `<section id="common-mistakes">\n<h2>Common Mistakes to Avoid</h2>\n`;
    html += `<div class="knowledge-warning"><span class="knowledge-warning-icon">&#9888;</span>\n<ul>\n`;
    for (const m of article.commonMistakes) html += `<li>${esc(m)}</li>\n`;
    html += `</ul></div>\n</section>\n\n`;
  }

  // Sources
  if ((article.sources || []).length > 0) {
    html += `<div class="knowledge-sources"><strong>Sources:</strong><ol>`;
    for (const s of article.sources) html += `<li>${esc(s)}</li>`;
    html += `</ol></div>\n`;
  }

  return html;
}

/**
 * Build formula explanation/limitations HTML.
 */
function buildFormulaContent(formula) {
  let html = '';
  if (formula.explanation) {
    html += `<section id="explanation">\n<h2>How This Formula Works</h2>\n${renderBody(formula.explanation)}\n</section>\n\n`;
  }
  if (formula.limitations) {
    html += `<section id="limitations">\n<h2>Limitations &amp; Notes</h2>\n${renderBody(formula.limitations)}\n</section>\n\n`;
  }
  if ((formula.sources || []).length > 0) {
    html += `<div class="knowledge-sources"><strong>Sources:</strong><ol>`;
    for (const s of formula.sources) html += `<li>${esc(s)}</li>`;
    html += `</ol></div>\n`;
  }
  return html;
}

/**
 * Build glossary term detail HTML.
 */
function buildTermContent(term) {
  let html = '';
  if (term.explanation) {
    html += `<section id="details">\n<h2>In Plain Language</h2>\n${renderBody(term.explanation)}\n</section>\n\n`;
  }
  if (term.whyItMatters) {
    html += `<section id="why-it-matters">\n<h2>Why It Matters</h2>\n${renderBody(term.whyItMatters)}\n</section>\n\n`;
  }
  if (term.typicalValues) {
    html += `<section id="typical-values">\n<h2>Typical Values</h2>\n<div class="knowledge-callout"><span class="knowledge-callout-icon">&#127919;</span><div>${esc(term.typicalValues)}</div></div>\n</section>\n\n`;
  }

  // Related article links
  const relatedItems = [
    ...(term.relatedCalculators || []).map(link => ({ href: href(link), label: titleCase(href(link).split('/').pop()) })),
    ...(term.relatedArticles || []).map(slug => ({ href: href(slug), label: titleCase(href(slug).split('/').pop()) })),
    ...(term.relatedFormulas || []).map(slug => ({ href: href(slug), label: titleCase(href(slug).split('/').pop()) })),
  ];
  if (relatedItems.length > 0) {
    const cards = relatedItems.slice(0, 6).map(item =>
      `<a href="${item.href}" class="knowledge-card"><div class="knowledge-card-title">${esc(item.label)}</div></a>`
    ).join('\n');
    html += `<section class="related-topics">\n<h2>Related Resources</h2>\n<div class="knowledge-grid knowledge-grid--2col">\n${cards}\n</div>\n</section>\n\n`;
  }
  return html;
}

/**
 * Build reference page content from tables / checklists / notes.
 */
function buildRefContent(page) {
  let html = '';
  if (page.overview) {
    html += `<section id="overview">\n${renderBody(page.overview)}\n</section>\n\n`;
  }
  for (const tbl of (page.tables || [])) {
    const tblId = (tbl.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    html += `<section id="${tblId}">\n`;
    if (tbl.title) html += `<h2>${esc(tbl.title)}</h2>\n`;
    html += `<div class="knowledge-table-wrap"><table class="knowledge-table"><thead><tr>`;
    for (const h of (tbl.headers || [])) html += `<th>${esc(h)}</th>`;
    html += `</tr></thead><tbody>`;
    for (const row of (tbl.rows || [])) {
      html += `<tr>`;
      for (const cell of row) html += `<td>${esc(String(cell))}</td>`;
      html += `</tr>`;
    }
    html += `</tbody></table></div>\n</section>\n\n`;
  }
  for (const cl of (page.checklists || [])) {
    const clId = (cl.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    html += `<section id="${clId}">\n<h2>${esc(cl.title)}</h2>\n<ul class="knowledge-checklist">\n`;
    for (const item of (cl.items || [])) html += `<li>${esc(item)}</li>\n`;
    html += `</ul>\n</section>\n\n`;
  }
  if ((page.notes || []).length > 0) {
    html += `<section id="notes">\n<h2>Notes</h2>\n<ul>\n`;
    for (const n of page.notes) html += `<li>${esc(n)}</li>\n`;
    html += `</ul>\n</section>\n\n`;
  }
  // Related
  const relCalcs = (page.relatedCalculators || []);
  if (relCalcs.length > 0) {
    const cards = relCalcs.map(link => {
      const normalizedHref = href(link);
      return `<a href="${normalizedHref}" class="knowledge-card"><div class="knowledge-card-title">${esc(titleCase(normalizedHref.split('/').pop()))}</div></a>`;
    }
    ).join('\n');
    html += `<section class="related-calculators">\n<h2>Related Calculators</h2>\n<div class="related-calcs-cards">\n${cards}\n</div>\n</section>\n\n`;
  }
  if ((page.sources || []).length > 0) {
    html += `<div class="knowledge-sources"><strong>Sources:</strong><ol>`;
    for (const s of page.sources) html += `<li>${esc(s)}</li>`;
    html += `</ol></div>\n`;
  }
  return html;
}

/**
 * Build a Related Calculators / Resources section from an article's relationship arrays.
 */
function buildRelatedTools(article) {
  const all = [
    ...(article.relatedCalculators || []).map(link => ({ href: href(link), label: titleCase(href(link).split('/').pop()) })),
    ...(article.relatedCharts || []).map(link => ({ href: href(link), label: titleCase(href(link).split('/').pop()) })),
    ...(article.relatedResources || []).map(link => ({ href: href(link), label: titleCase(href(link).split('/').pop()) })),
  ];
  if (all.length === 0) return '';
  const cards = all.slice(0, 6).map(item =>
    `<a href="${item.href}" class="knowledge-card"><div class="knowledge-card-title">${esc(item.label)}</div></a>`
  ).join('\n');
  return `<section id="related-tools" class="related-calculators">\n<h2>Related Calculators &amp; Resources</h2>\n<div class="related-calcs-cards">\n${cards}\n</div>\n</section>\n`;
}

/**
 * Build a Related Topics section from an array of article slugs.
 * @param {string[]} slugs
 * @param {object[]} allArticles  — full articles array for label/summary lookup
 */
function buildRelatedTopics(slugs, allArticles) {
  if (!slugs || slugs.length === 0) return '';
  const cards = slugs.slice(0, 6).map(slug => {
    const topicHref = href(slug);
    const art = (allArticles || []).find(a => a.slug === slug);
    const label = art ? art.title : titleCase(slug.split('/').pop());
    const desc = art ? ((art.summary || '').split('.')[0] + '.') : '';
    return `<a href="${topicHref}" class="knowledge-card">` +
      `<div class="knowledge-card-title">${esc(label)}</div>` +
      (desc ? `<p class="knowledge-card-desc">${esc(desc)}</p>` : '') +
      `</a>`;
  }).join('\n');
  return `<section id="related-topics" class="related-topics">\n<h2>Related Topics</h2>\n<div class="knowledge-grid knowledge-grid--2col">\n${cards}\n</div>\n</section>\n`;
}

/**
 * Build the sidebar for an Academy article page.
 */
function buildAcademySidebar(article, categoryArticles) {
  const tocItems = (article.sections || []).map(sec => {
    const id = sec.id || (sec.h2 || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `<li><a href="#${id}">${esc(sec.h2)}</a></li>`;
  }).join('\n');

  const catLinks = (categoryArticles || []).slice(0, 8).map(a => {
    const active = a.slug === article.slug;
    return `<li><a href="${href(a.slug)}"${active ? ' class="active"' : ''}>${esc(a.title)}</a></li>`;
  }).join('\n');

  const calcLinks = (article.relatedCalculators || []).slice(0, 4).map(link => {
    const normalizedHref = href(link);
    return `<li><a href="${normalizedHref}">${esc(titleCase(normalizedHref.split('/').pop()))}</a></li>`;
  }
  ).join('\n');

  return `<aside class="knowledge-sidebar">` +
    (catLinks ? `<div class="knowledge-sidebar-section"><h3>In This Category</h3><ul>${catLinks}</ul></div>` : '') +
    `<div class="knowledge-sidebar-section"><h3>On This Page</h3><ul>` +
    `<li><a href="#key-facts">Key Facts</a></li>` + tocItems +
    ((article.examples || []).length ? '<li><a href="#examples">Examples</a></li>' : '') +
    ((article.commonMistakes || []).length ? '<li><a href="#common-mistakes">Common Mistakes</a></li>' : '') +
    `</ul></div>` +
    (calcLinks ? `<div class="knowledge-sidebar-section"><h3>Calculators</h3><ul>${calcLinks}</ul></div>` : '') +
    `</aside>`;
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
  renderBody,
  buildArticleContent,
  buildFormulaContent,
  buildTermContent,
  buildRefContent,
  buildRelatedTools,
  buildRelatedTopics,
  buildAcademySidebar,
  titleCase,
  esc,
  slugToTitle,
  walkHtml,
  writeFile,
  ROOT,
  href,
  buildUrl,
  absoluteUrl,
  canonicalUrl,
  sitemapUrl,
  joinUrl,
};
