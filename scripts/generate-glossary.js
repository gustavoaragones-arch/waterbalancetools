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
  buildBreadcrumb, buildTermContent, writeFile, ROOT,
} = require('./template-utils');

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
          <a href="/${t.slug}" class="knowledge-card-title">${esc(t.term || t.title)}</a>
          ${t.abbreviation ? `<span class="knowledge-badge" style="font-size:10px">${esc(t.abbreviation)}</span>` : ''}
          <p class="knowledge-card-desc">${esc((t.definition || '').split('.')[0])}.</p>
        </div>`
      ).join('\n');
      return `      <h3 id="letter-${letter}" style="margin-top:1.5rem;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-secondary)">${letter}</h3>${items}`;
    }).join('\n');
  } else {
    termListHtml = `      <div class="knowledge-callout">
        <span class="knowledge-callout-icon">&#128218;</span>
        <div><strong>Coming in Phase 5B</strong> — Glossary terms are being prepared. Use the <a href="/academy/">Chemistry Academy</a> or <a href="/reference/">Reference Tables</a> in the meantime.</div>
      </div>`;
  }

  const bc = buildBreadcrumb('glossary', 'Glossary');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="canonical" href="https://waterbalancetools.com/glossary/">
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
        <li><a href="/academy/">Chemistry Academy</a></li>
        <li><a href="/formulas/">Formula Library</a></li>
        <li><a href="/reference/">Reference Tables</a></li>
        <li><a href="/calculators/chemical-calculator">Pool Chemical Calculator</a></li>
      </ul>
    </section>
  </main>
${SITE_FOOTER}
  <script src="/js/nav.js" defer></script>
</body>
</html>`;
}

// ── Individual term page ──────────────────────────────────────────────────────

function generateTerm(term) {
  const tpl = template('glossary-template.html');
  const bc = buildBreadcrumb(term.slug, term.term || term.title);

  const targetRangeBlock = (term.typicalValues || term.targetRange)
    ? `<div class="knowledge-callout"><span class="knowledge-callout-icon">&#127919;</span><div><strong>Typical Values:</strong> ${esc(term.typicalValues || term.targetRange)}</div></div>`
    : '';

  const defFirstSentence = (term.definition || '').split('.')[0];

  return fill(tpl, {
    SLUG:              term.slug,
    PAGE_TITLE:        `${term.term || term.title}: Definition | Glossary | WaterBalanceTools`,
    H1_TITLE:          term.term || term.title,
    META_DESCRIPTION:  `${defFirstSentence}. Plain-language definition with target values and related pool chemistry resources.`,
    LAST_REVIEWED:     term.lastReviewed || '2026-06-01',
    BREADCRUMB:        bc.nav,
    BREADCRUMB_SCHEMA: bc.schema,
    HERO: fill(partial('knowledge-hero.html'), {
      BADGE:         'Glossary',
      BADGE_CLASS:   'knowledge-badge--glossary',
      READING_TIME:  '2 min read',
      LAST_REVIEWED: term.lastReviewed || '2026-06-01',
      TITLE:         esc(term.term || term.title),
      SUMMARY:       esc(defFirstSentence + '.'),
      CHIPS:         '<a href="#definition" class="knowledge-chip">Definition</a><a href="#details" class="knowledge-chip">Details</a><a href="#typical-values" class="knowledge-chip">Values</a>',
    }),
    DEFINITION:         esc(term.definition || ''),
    TARGET_RANGE_BLOCK: targetRangeBlock,
    CONTENT:            buildTermContent(term),
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
