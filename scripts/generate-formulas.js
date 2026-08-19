/**
 * generate-formulas.js
 *
 * Generates the Formula Library section:
 *   formulas/index.html          — hub listing all formulas
 *   formulas/<slug>.html         — individual formula pages (from data/formulas.json)
 *
 * Idempotent — regenerates on every pipeline run.
 */

'use strict';

const path = require('path');
const {
  fill, template, partial, SITE_HEADER, SITE_FOOTER, esc,
  buildBreadcrumb, buildFormulaContent, buildRelatedTools,
  buildRelatedTopics, renderBody, writeFile, ROOT, href, canonicalUrl,
} = require('./template-utils');

const data = require(path.join(ROOT, 'data', 'formulas.json'));
const FORMULAS_DIR = path.join(ROOT, 'formulas');

// ── Hub page ──────────────────────────────────────────────────────────────────

function generateHub() {
  const formulas = data.formulas || [];

  const formulaCards = formulas.length > 0
    ? formulas.map(f =>
        `      <a href="${href(f.slug)}" class="knowledge-card">
        <div class="knowledge-card-title">${esc(f.title)}</div>
        <p class="knowledge-card-desc">${esc(f.summary || f.metaDescription)}</p>
      </a>`).join('\n')
    : `      <div class="knowledge-callout">
        <span class="knowledge-callout-icon">&#128221;</span>
        <div><strong>Coming in Phase 5B</strong> — Pool chemistry formulas are being prepared. In the meantime, use the <a href="${href('/calculators/chemical-calculator')}">Chemical Calculator</a> for instant dose calculations.</div>
      </div>`;

  const bc = buildBreadcrumb('formulas', 'Formula Library');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="canonical" href="${canonicalUrl('/formulas')}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pool Chemistry Formula Library | WaterBalanceTools</title>
  <meta name="description" content="The complete pool chemistry formula library — chlorine dosing, pH adjustment, alkalinity, CYA, calcium hardness, and more. Every formula explained with worked examples.">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/knowledge.css">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3974004697476579" crossorigin="anonymous"></script>
  ${bc.schema}
</head>
<body class="knowledge-page formulas-hub">
${SITE_HEADER}
${bc.nav}
  <main class="container">
    <section class="knowledge-hub-hero">
      <span class="knowledge-badge knowledge-badge--formula">Formula Library</span>
      <h1>Pool Chemistry Formula Library</h1>
      <p>Every calculation behind the calculators — explained with symbols, worked examples, and plain-English notes. Reference these formulas to understand exactly how chemical doses are derived.</p>
    </section>
    <section>
      <h2>All Formulas</h2>
      <div class="knowledge-grid knowledge-grid--2col">
${formulaCards}
      </div>
    </section>
    <section class="link-matrix">
      <h3>Related Tools</h3>
      <ul>
        <li><a href="${href('/calculators/chemical-calculator')}">Pool Chemical Calculator</a></li>
        <li><a href="${href('/academy')}">Chemistry Academy</a></li>
        <li><a href="${href('/glossary')}">Glossary</a></li>
        <li><a href="${href('/reference')}">Reference Tables</a></li>
      </ul>
    </section>
  </main>
${SITE_FOOTER}
  <script src="/js/nav.js" defer></script>
</body>
</html>`;
}

// ── Individual formula page ───────────────────────────────────────────────────

function generateFormula(formula) {
  const tpl = template('formula-template.html');
  const bc = buildBreadcrumb(formula.slug, formula.title);

  const variableRows = (formula.variables || [])
    .map(v =>
      `<tr><td><code>${esc(v.symbol)}</code></td>` +
      `<td>${esc(v.description)}</td>` +
      `<td>${esc(v.unit || '')}</td></tr>`
    )
    .join('\n              ');

  const relatedFormulas = (data.formulas || []).filter(f => f.slug !== formula.slug);

  return fill(tpl, {
    SLUG:              formula.slug,
    PAGE_TITLE:        `${formula.title} | Formula Library | WaterBalanceTools`,
    H1_TITLE:          formula.title,
    META_DESCRIPTION:  formula.metaDescription,
    LAST_REVIEWED:     formula.lastReviewed || '2026-01-01',
    BREADCRUMB:        bc.nav,
    BREADCRUMB_SCHEMA: bc.schema,
    HERO: fill(partial('knowledge-hero.html'), {
      BADGE:         'Formula Library',
      BADGE_CLASS:   'knowledge-badge--formula',
      READING_TIME:  formula.readingTime || '3 min read',
      LAST_REVIEWED: formula.lastReviewed || '2026-01-01',
      TITLE:         esc(formula.title),
      SUMMARY:       esc(formula.summary || ''),
      CHIPS:         '<a href="#formula" class="knowledge-chip">Formula</a><a href="#example" class="knowledge-chip">Example</a><a href="#explanation" class="knowledge-chip">Explanation</a>',
    }),
    EQUATION:          esc(formula.equation || ''),
    VARIABLE_ROWS:     variableRows,
    EXAMPLE:           formula.workedExample ? renderBody(formula.workedExample) : (formula.example || ''),
    CONTENT:           buildFormulaContent(formula),
    SIDEBAR:           '',
    RELATED_TOOLS:     buildRelatedTools(formula),
    RELATED_TOPICS:    buildRelatedTopics(
      (formula.relatedFormulas || []),
      relatedFormulas.map(f => ({ slug: f.slug, title: f.title, summary: f.summary }))
    ),
    KNOWLEDGE_FOOTER:  '',
    SITE_FOOTER:       SITE_FOOTER,
  });
}

// ── Run ───────────────────────────────────────────────────────────────────────

let written = 0;

writeFile(path.join(FORMULAS_DIR, 'index.html'), generateHub());
written++;
console.log('  → formulas/index.html');

for (const formula of (data.formulas || [])) {
  const outPath = path.join(ROOT, `${formula.slug}.html`);
  writeFile(outPath, generateFormula(formula));
  written++;
  console.log(`  → ${formula.slug}.html`);
}

console.log(`generate-formulas: wrote ${written} files (${(data.formulas || []).length} formulas)`);
