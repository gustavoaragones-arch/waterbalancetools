/**
 * generate-academy.js
 *
 * Generates the Academy section of the knowledge platform:
 *   academy/index.html                    — main hub
 *   academy/<category>/index.html         — category landing pages (8 categories)
 *   academy/<category>/<slug>.html        — individual articles (from data/academy.json)
 *
 * With an empty data/academy.json, only the hub and category indexes are created.
 * Idempotent — regenerates on every pipeline run.
 */

'use strict';

const path = require('path');
const {
  fill, SITE_HEADER, SITE_FOOTER, esc, titleCase,
  buildBreadcrumb, buildArticleContent, buildRelatedTools,
  buildRelatedTopics, buildAcademySidebar, writeFile, ROOT,
} = require('./template-utils');

const data = require(path.join(ROOT, 'data', 'academy.json'));
const ACADEMY_DIR = path.join(ROOT, 'academy');

// ── SVG icon map (inline) ─────────────────────────────────────────────────────

const ICONS = {
  book:      `<svg viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="1.6"/></svg>`,
  flask:     `<svg viewBox="0 0 24 24" fill="none"><path d="M9 3h6M10 3v7L6 19h12l-4-9V3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chart:     `<svg viewBox="0 0 24 24" fill="none"><path d="M3 20h18M3 20l5-6 4 4 5-8 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  pool:      `<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="8" width="20" height="10" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M2 13c3-3 6-3 9 0s6 3 9 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M6 8V5M18 8V5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  warning:   `<svg viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="1.6"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor"/></svg>`,
  hottub:    `<svg viewBox="0 0 24 24" fill="none"><path d="M4 18c0-4 3-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="2" y1="18" x2="22" y2="18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8 9V6M12 8V4M16 9V6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="2 1.5"/></svg>`,
  shield:    `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v6c0 5 4 9 9 11 5-2 9-6 9-11V7l-9-5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  checklist: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M7 9h10M7 13h7M7 17h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
};

// ── Page chrome shared by hub and category pages ──────────────────────────────

function pageWrap({ title, metaDesc, canonical, breadcrumbNav, breadcrumbSchema, bodyClass, main }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="canonical" href="${canonical}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(metaDesc)}">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/knowledge.css">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3974004697476579" crossorigin="anonymous"></script>
  ${breadcrumbSchema || ''}
</head>
<body class="knowledge-page ${bodyClass || ''}">
${SITE_HEADER}
${breadcrumbNav || ''}
  <main class="container">
${main}
  </main>
${SITE_FOOTER}
  <script src="/js/nav.js" defer></script>
</body>
</html>`;
}

// ── Academy hub (index.html) ──────────────────────────────────────────────────

function generateHub() {
  const articles = data.articles || [];
  const categories = data.categories || [];

  const categoryCards = categories.map(cat => {
    const count = articles.filter(a => a.category === cat.slug).length;
    const icon = ICONS[cat.icon] || ICONS.book;
    return `      <a href="/academy/${cat.slug}/" class="knowledge-card">
        <div class="knowledge-card-icon">${icon}</div>
        <div class="knowledge-card-title">${esc(cat.label)}</div>
        <p class="knowledge-card-desc">${esc(cat.description)}</p>
        <span class="knowledge-card-meta">${count > 0 ? count + ' article' + (count !== 1 ? 's' : '') : 'Coming soon'}</span>
      </a>`;
  }).join('\n');

  const bc = buildBreadcrumb('academy', 'Academy');

  const main = `
    <section class="knowledge-hub-hero">
      <span class="knowledge-badge">Academy</span>
      <h1>Pool &amp; Hot Tub Chemistry Academy</h1>
      <p>Structured guides that explain the science behind water balance — from fundamentals to advanced troubleshooting. Written for pool owners, not chemists.</p>
    </section>

    <section>
      <h2>Browse by Category</h2>
      <div class="knowledge-hub-categories">
${categoryCards}
      </div>
    </section>

    <section class="link-matrix">
      <h3>Related Tools &amp; Resources</h3>
      <ul>
        <li><a href="/calculators/chemical-calculator">Pool Chemical Calculator</a></li>
        <li><a href="/formulas/">Formula Library</a></li>
        <li><a href="/glossary/">Water Chemistry Glossary</a></li>
        <li><a href="/reference/">Reference Tables</a></li>
        <li><a href="/resources/">Free Printable Resources</a></li>
      </ul>
    </section>`;

  return pageWrap({
    title: 'Pool & Hot Tub Chemistry Academy | WaterBalanceTools',
    metaDesc: 'Learn pool and hot tub water chemistry with structured guides covering pH, chlorine, alkalinity, troubleshooting, and more.',
    canonical: 'https://waterbalancetools.com/academy/',
    breadcrumbNav: bc.nav,
    breadcrumbSchema: bc.schema,
    bodyClass: 'academy-hub',
    main,
  });
}

// ── Category index page ───────────────────────────────────────────────────────

function generateCategory(cat) {
  const articles = (data.articles || []).filter(a => a.category === cat.slug);
  const icon = ICONS[cat.icon] || ICONS.book;

  const articleCards = articles.length > 0
    ? articles.map(a =>
        `      <a href="/${a.slug}" class="knowledge-card">
        <div class="knowledge-card-title">${esc(a.title)}</div>
        <p class="knowledge-card-desc">${esc(a.summary || a.description)}</p>
        <span class="knowledge-card-meta">${esc(a.readingTime || '')}</span>
      </a>`).join('\n')
    : `      <div class="knowledge-callout">
        <span class="knowledge-callout-icon">&#128218;</span>
        <div><strong>Coming in Phase 5B</strong> — Articles for this category are being prepared. Check back soon, or explore other categories in the <a href="/academy/">Academy hub</a>.</div>
      </div>`;

  const bc = buildBreadcrumb(`academy/${cat.slug}`, cat.label);

  const main = `
    <section class="knowledge-hub-hero">
      <div class="knowledge-card-icon" style="width:48px;height:48px;margin-bottom:0.75rem;color:var(--blue)">${icon}</div>
      <span class="knowledge-badge knowledge-badge--${cat.slug}">${esc(cat.label)}</span>
      <h1>${esc(cat.label)}</h1>
      <p>${esc(cat.description)}</p>
    </section>

    <section>
      <h2>Articles</h2>
      <div class="knowledge-grid knowledge-grid--2col">
${articleCards}
      </div>
    </section>

    <section class="link-matrix">
      <h3>Related</h3>
      <ul>
        <li><a href="/academy/">Back to Academy</a></li>
        <li><a href="/calculators/chemical-calculator">Pool Chemical Calculator</a></li>
        <li><a href="/glossary/">Glossary</a></li>
      </ul>
    </section>`;

  return pageWrap({
    title: `${cat.label} | Academy | WaterBalanceTools`,
    metaDesc: cat.description,
    canonical: `https://waterbalancetools.com/academy/${cat.slug}/`,
    breadcrumbNav: bc.nav,
    breadcrumbSchema: bc.schema,
    bodyClass: `academy-category academy-${cat.slug}`,
    main,
  });
}

// ── Individual article page ───────────────────────────────────────────────────

function generateArticle(article) {
  const tpl = require('./template-utils').template('academy-template.html');
  const bc = buildBreadcrumb(article.slug, article.title);
  const allArticles = data.articles || [];
  const catArticles = allArticles.filter(a => a.category === article.category);

  const heroChips = [
    '<a href="#key-facts" class="knowledge-chip">Key Facts</a>',
    '<a href="#examples" class="knowledge-chip">Examples</a>',
    article.relatedCalculators?.length ? '<a href="#related-tools" class="knowledge-chip">Calculator</a>' : '',
    article.relatedTopics?.length ? '<a href=".knowledge-related-topics" class="knowledge-chip">Related</a>' : '',
  ].filter(Boolean).join('\n    ');

  return fill(tpl, {
    SLUG:              article.slug,
    PAGE_TITLE:        `${article.title} | Academy | WaterBalanceTools`,
    H1_TITLE:          article.title,
    META_DESCRIPTION:  article.description,
    LAST_REVIEWED:     article.lastReviewed || '2026-01-01',
    BREADCRUMB:        bc.nav,
    BREADCRUMB_SCHEMA: bc.schema,
    HERO: fill(require('./template-utils').partial('knowledge-hero.html'), {
      BADGE:         titleCase(article.category.replace(/-/g, ' ')),
      BADGE_CLASS:   `knowledge-badge--${article.category}`,
      READING_TIME:  article.readingTime || '5 min read',
      LAST_REVIEWED: article.lastReviewed || '2026-01-01',
      TITLE:         esc(article.title),
      SUMMARY:       esc(article.summary || ''),
      CHIPS:         heroChips,
    }),
    CONTENT:           buildArticleContent(article),
    TAKEAWAYS:         '',
    SIDEBAR:           buildAcademySidebar(article, catArticles),
    RELATED_TOOLS:     buildRelatedTools(article),
    RELATED_TOPICS:    buildRelatedTopics(article.relatedTopics || [], allArticles),
    KNOWLEDGE_FOOTER:  '',
    SITE_FOOTER:       SITE_FOOTER,
  });
}

// ── Run ───────────────────────────────────────────────────────────────────────

let written = 0;

// Hub
writeFile(path.join(ACADEMY_DIR, 'index.html'), generateHub());
written++;
console.log('  → academy/index.html');

// Category indexes
for (const cat of (data.categories || [])) {
  const outPath = path.join(ACADEMY_DIR, cat.slug, 'index.html');
  writeFile(outPath, generateCategory(cat));
  written++;
  console.log(`  → academy/${cat.slug}/index.html`);
}

// Individual articles
for (const article of (data.articles || [])) {
  const outPath = path.join(ROOT, `${article.slug}.html`);
  writeFile(outPath, generateArticle(article));
  written++;
  console.log(`  → ${article.slug}.html`);
}

console.log(`generate-academy: wrote ${written} files (${(data.articles || []).length} articles)`);
