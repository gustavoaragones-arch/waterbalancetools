/**
 * generate-glossary.js
 *
 * Generates the Water Chemistry Glossary:
 *   glossary/index.html          — A–Z term listing hub
 *   glossary/<slug>.html         — individual term pages (from data/glossary.json)
 *
 * Idempotent — regenerates on every pipeline run.
 */

'use strict';

const path = require('path');
const {
  fill, template, partial, SITE_HEADER, SITE_FOOTER, esc,
  buildBreadcrumb, buildTermContent, writeFile, ROOT, href, canonicalUrl,
  localizeRecord, chrome,
} = require('./template-utils');
const { htmlLangAttr } = require('../js/i18n/html-lang');
const { getLocalizedCanonical } = require('../js/i18n/locale-url');

const data = require(path.join(ROOT, 'data', 'glossary.json'));
const GLOSSARY_DIR = path.join(ROOT, 'glossary');

// ── Hub page ──────────────────────────────────────────────────────────────────

function generateHub() {
  const terms = data.terms || [];

  let termListHtml;
  if (terms.length > 0) {
    // Group by first letter
    const byLetter = {};
    terms.forEach(t => {
      const letter = (t.term || t.title || 'A')[0].toUpperCase();
      (byLetter[letter] = byLetter[letter] || []).push(t);
    });
    termListHtml = Object.keys(byLetter).sort().map(letter => {
      const items = byLetter[letter].map(t =>
        `        <div class="glossary-term">
          <a href="${href(t.slug)}" class="knowledge-card-title">${esc(t.term || t.title)}</a>
          ${t.abbreviation ? `<span class="knowledge-badge" style="font-size:10px">${esc(t.abbreviation)}</span>` : ''}
          <p class="knowledge-card-desc">${esc((t.definition || '').split('.')[0])}.</p>
        </div>`
      ).join('\n');
      return `      <h3 id="letter-${letter}" style="margin-top:1.5rem;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-secondary)">${letter}</h3>${items}`;
    }).join('\n');
  } else {
    termListHtml = `      <div class="knowledge-callout">
        <span class="knowledge-callout-icon">&#128218;</span>
        <div><strong>Coming in Phase 5B</strong> — Glossary terms are being prepared. Use the <a href="${href('/academy')}">Chemistry Academy</a> or <a href="${href('/reference')}">Reference Tables</a> in the meantime.</div>
      </div>`;
  }

  const bc = buildBreadcrumb('glossary', 'Glossary');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="canonical" href="${canonicalUrl('/glossary')}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pool Chemistry Glossary | WaterBalanceTools</title>
  <meta name="description" content="Definitions for pool and hot tub water chemistry terms — free chlorine, pH, total alkalinity, CYA, calcium hardness, LSI, and more.">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/knowledge.css">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3974004697476579" crossorigin="anonymous"></script>
  ${bc.schema}
</head>
<body class="knowledge-page glossary-hub">
${SITE_HEADER}
${bc.nav}
  <main class="container">
    <section class="knowledge-hub-hero">
      <span class="knowledge-badge knowledge-badge--glossary">Glossary</span>
      <h1>Pool &amp; Hot Tub Water Chemistry Glossary</h1>
      <p>Plain-language definitions for every water chemistry term you will encounter when testing, balancing, and maintaining pool or hot tub water.</p>
    </section>
    <section>
      <h2>Terms A–Z</h2>
${termListHtml}
    </section>
    <section class="link-matrix">
      <h3>Related</h3>
      <ul>
        <li><a href="${href('/academy')}">Chemistry Academy</a></li>
        <li><a href="${href('/formulas')}">Formula Library</a></li>
        <li><a href="${href('/reference')}">Reference Tables</a></li>
        <li><a href="${href('/calculators/chemical-calculator')}">Pool Chemical Calculator</a></li>
      </ul>
    </section>
  </main>
${SITE_FOOTER}
  <script src="/js/nav.js" defer></script>
</body>
</html>`;
}

// ── Individual term page ──────────────────────────────────────────────────────

function generateTerm(term, locale) {
  const effectiveLocale = locale || 'en';
  const tpl = template('glossary-template.html');
  // Phase 8N: for locale 'es', localizeRecord() overlays the term's
  // embedded `es` object (term/definition/explanation/whyItMatters/
  // typicalValues/abbreviation) onto the English record; structural
  // fields absent from `es` (slug, relatedCalculators, etc.) pass through
  // unchanged. For locale 'en' this returns `term` untouched.
  const t = localizeRecord(term, effectiveLocale);
  const bc = buildBreadcrumb(term.slug, t.term || t.title, effectiveLocale);

  const targetRangeBlock = (t.typicalValues || t.targetRange)
    ? `<div class="knowledge-callout"><span class="knowledge-callout-icon">&#127919;</span><div><strong>${chrome('typicalValues', effectiveLocale)}:</strong> ${esc(t.typicalValues || t.targetRange)}</div></div>`
    : '';

  const defFirstSentence = (t.definition || '').split('.')[0];

  // Shorter title (Phase 7I): "Term: Definition | Glossary | WaterBalanceTools"
  // pushed 7 of 100 glossary titles past the 65-char SEO threshold with
  // redundant wording ("Definition" and "Glossary" both signal the same
  // thing). Must still end in the literal "| WaterBalanceTools" suffix --
  // scripts/normalize-seo-metadata.js appends it to any title that doesn't,
  // which would otherwise double it up.
  const termName = t.term || t.title;
  const categoryLabel = effectiveLocale === 'es' ? 'Glosario' : 'Glossary';
  const titleWithCategory = `${termName} | ${categoryLabel} | WaterBalanceTools`;
  const pageTitle = titleWithCategory.length <= 65 ? titleWithCategory : `${termName} | WaterBalanceTools`;
  const metaDescription = effectiveLocale === 'es'
    ? `${defFirstSentence}. Definición en español con valores objetivo y recursos relacionados sobre química de piscinas.`
    : `${defFirstSentence}. Plain-language definition with target values and related pool chemistry resources.`;

  return fill(tpl, {
    SLUG:              term.slug,
    HTML_LANG_ATTR:    htmlLangAttr(effectiveLocale),
    CANONICAL_URL:     getLocalizedCanonical('/' + term.slug, effectiveLocale),
    PAGE_TITLE:        pageTitle,
    H1_TITLE:          termName,
    META_DESCRIPTION:  metaDescription,
    LAST_REVIEWED:     term.lastReviewed || '2026-06-01',
    BREADCRUMB:        bc.nav,
    BREADCRUMB_SCHEMA: bc.schema,
    ARIA_PRIMARY_NAV:    chrome('ariaPrimaryNav', effectiveLocale),
    NAV_CALCULATOR_HREF: chrome('navCalculatorHref', effectiveLocale),
    NAV_CALCULATOR_LABEL: chrome('navCalculatorLabel', effectiveLocale),
    NAV_RESOURCES:       chrome('navResources', effectiveLocale),
    NAV_CHARTS:          chrome('navCharts', effectiveLocale),
    NAV_ACADEMY:         chrome('navAcademy', effectiveLocale),
    NAV_GUIDES:          chrome('navGuides', effectiveLocale),
    NAV_ABOUT:           chrome('navAbout', effectiveLocale),
    ARIA_SEARCH:         chrome('ariaSearch', effectiveLocale),
    ARIA_OPEN_MENU:      chrome('ariaOpenMenu', effectiveLocale),
    DEFINITION_LABEL:    chrome('definitionLabel', effectiveLocale),
    LAST_REVIEWED_LABEL: chrome('lastReviewedLabel', effectiveLocale),
    HERO: fill(partial('knowledge-hero.html'), {
      BADGE:         effectiveLocale === 'es' ? 'Glosario' : 'Glossary',
      BADGE_CLASS:   'knowledge-badge--glossary',
      READING_TIME:  effectiveLocale === 'es' ? '2 min de lectura' : '2 min read',
      LAST_REVIEWED: term.lastReviewed || '2026-06-01',
      TITLE:         esc(termName),
      SUMMARY:       esc(defFirstSentence + '.'),
      CHIPS:         effectiveLocale === 'es'
        ? '<a href="#definition" class="knowledge-chip">Definición</a><a href="#details" class="knowledge-chip">Detalles</a><a href="#typical-values" class="knowledge-chip">Valores</a>'
        : '<a href="#definition" class="knowledge-chip">Definition</a><a href="#details" class="knowledge-chip">Details</a><a href="#typical-values" class="knowledge-chip">Values</a>',
    }),
    DEFINITION:         esc(t.definition || ''),
    TARGET_RANGE_BLOCK: targetRangeBlock,
    CONTENT:            buildTermContent(t, locale),
    SIDEBAR:            '',
    RELATED_TOOLS:      '',
    RELATED_TOPICS:     '',
    KNOWLEDGE_FOOTER:   '',
    SITE_FOOTER:        SITE_FOOTER,
  });
}

// ── Run ───────────────────────────────────────────────────────────────────────

let written = 0;

writeFile(path.join(GLOSSARY_DIR, 'index.html'), generateHub());
written++;
console.log('  → glossary/index.html');

for (const term of (data.terms || [])) {
  const outPath = path.join(ROOT, `${term.slug}.html`);
  writeFile(outPath, generateTerm(term));
  written++;
  console.log(`  → ${term.slug}.html`);
}

console.log(`generate-glossary: wrote ${written} files (${(data.terms || []).length} terms)`);

// Phase 8N: exported so scripts/generate-spanish-knowledge-cluster.js can
// call generateTerm(term, 'es') for the approved Spanish-cluster terms
// without a second implementation of glossary-page rendering.
module.exports = { generateTerm, data };
