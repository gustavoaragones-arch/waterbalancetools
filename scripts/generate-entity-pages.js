#!/usr/bin/env node
/**
 * generate-entity-pages.js
 *
 * Generates /entities/<id>.html for every entity in data/graph/entity-index.json.
 * Also writes /entities/index.html as a directory page.
 *
 * Run: node scripts/generate-entity-pages.js
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const urlEngine = require('../js/url/url-engine');
const { CLAIMS_BY_ID } = require('./data/chemistry-claims');
const { renderSourceList } = require('./chemistry/renderSources');

const ROOT   = path.join(__dirname, '..');
const DATA   = path.join(ROOT, 'data');
const OUT    = path.join(ROOT, 'entities');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// ── Load data ──────────────────────────────────────────────────────────────────

const entityIndex   = JSON.parse(fs.readFileSync(path.join(DATA, 'graph', 'entity-index.json'), 'utf8'));
const relationships = JSON.parse(fs.readFileSync(path.join(DATA, 'graph', 'relationships.json'), 'utf8'));
const aliases       = JSON.parse(fs.readFileSync(path.join(DATA, 'graph', 'aliases.json'), 'utf8'));
const synonymsMap   = JSON.parse(fs.readFileSync(path.join(DATA, 'graph', 'synonyms.json'), 'utf8'));
const academyData   = JSON.parse(fs.readFileSync(path.join(DATA, 'academy.json'), 'utf8'));
const formulasData  = JSON.parse(fs.readFileSync(path.join(DATA, 'formulas.json'), 'utf8'));
const glossaryData  = JSON.parse(fs.readFileSync(path.join(DATA, 'glossary.json'), 'utf8'));
const referenceData = JSON.parse(fs.readFileSync(path.join(DATA, 'reference.json'), 'utf8'));

// Build quick-lookup maps
const articleById  = {};
academyData.articles.forEach(a => { articleById[a.id] = a; });
const formulaById  = {};
formulasData.formulas.forEach(f => { formulaById[f.id] = f; });
const termById     = {};
glossaryData.terms.forEach(t => { termById[t.id] = t; });
const refById      = {};
referenceData.pages.forEach(p => { refById[p.id] = p; });

const SITE = urlEngine.absoluteUrl('/');

// ── Helpers ────────────────────────────────────────────────────────────────────

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const TYPE_LABELS = {
  chemical:         'Chemical',
  measurement:      'Measurement',
  equipment:        'Equipment',
  process:          'Process',
  resource:         'Resource',
  problem:          'Problem',
  'pool-type':      'Pool Type',
  'chemical-product': 'Chemical Product',
  organization:     'Organization',
  unit:             'Unit',
};

const CALC_TITLES = {
  'chemical-calculator':          'Chemical Calculator',
  'pool-chlorine-calculator':     'Pool Chlorine Calculator',
  'pool-shock-calculator':        'Pool Shock Calculator',
  'pool-ph-calculator':           'Pool pH Calculator',
  'pool-alkalinity-calculator':   'Pool Alkalinity Calculator',
  'pool-cyanuric-acid-calculator':'Pool CYA Calculator',
  'pool-volume-calculator':       'Pool Volume Calculator',
  'pool-turnover-rate-calculator':'Pool Turnover Rate Calculator',
  'saltwater-pool-salt-calculator':'Salt Pool Calculator',
  'hot-tub-chlorine-calculator':  'Hot Tub Chlorine Calculator',
  'hot-tub-ph-calculator':        'Hot Tub pH Calculator',
  'hot-tub-shock-calculator':     'Hot Tub Shock Calculator',
  'spa-volume-calculator':        'Spa Volume Calculator',
  'volume-calculator':            'Volume Calculator',
};

const RESOURCE_TITLES = {
  'pool-maintenance-checklist':   'Pool Maintenance Checklist',
  'hot-tub-maintenance-log':      'Hot Tub Maintenance Log',
  'pool-chemical-log-sheet':      'Pool Chemical Log Sheet',
  'pool-closing-checklist':       'Pool Closing Checklist',
  'pool-opening-checklist':       'Pool Opening Checklist',
  'pool-shock-log':               'Pool Shock Log',
  'water-test-log':               'Water Test Log',
  'airbnb-pool-turnover-checklist':'Vacation Rental Turnover Checklist',
};

const CHART_TITLES = {
  'pool-chemical-levels-chart':     'Pool Chemical Levels Chart',
  'hot-tub-chemical-levels-chart':  'Hot Tub Chemical Levels Chart',
  'pool-water-balance-chart':       'Pool Water Balance Chart',
};

function linkList(items, title, prefix, titleMap) {
  if (!items || items.length === 0) return '';
  const links = items.map(id => {
    const label = esc(titleMap[id] || id);
    const url   = prefix + id;
    return `      <li><a href="${url}" class="entity-link">${label}</a></li>`;
  }).join('\n');
  return `    <div class="entity-link-group">
      <h3>${esc(title)}</h3>
      <ul>\n${links}\n      </ul>
    </div>`;
}

function buildCalcSection(ids) {
  if (!ids || ids.length === 0) return '';
  const cards = ids.map(id => {
    const title = esc(CALC_TITLES[id] || id);
    return `      <div class="knowledge-card">
        <a href="${urlEngine.href(`/calculators/${id}`)}">
          <div class="knowledge-card-icon"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M8 12h8M8 16h5M8 8h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></div>
          <h3>${title}</h3>
        </a>
      </div>`;
  }).join('\n');
  return `<section id="calculators">
  <h2>Related Calculators</h2>
  <div class="knowledge-cards">\n${cards}\n  </div>
</section>`;
}

function buildItemSection(ids, id2obj, titleFn, slugFn, sectionId, sectionTitle) {
  const valid = (ids || []).filter(id => id2obj[id]);
  if (valid.length === 0) return '';
  const cards = valid.map(id => {
    const obj = id2obj[id];
    const title = esc(titleFn(obj));
    const url   = '/' + slugFn(obj);
    return `      <div class="knowledge-card">
        <a href="${url}">
          <h3>${title}</h3>
        </a>
      </div>`;
  }).join('\n');
  return `<section id="${sectionId}">
  <h2>${esc(sectionTitle)}</h2>
  <div class="knowledge-cards">\n${cards}\n  </div>
</section>`;
}

function buildRelationshipsSection(entityId) {
  const outgoing = relationships.filter(r => r.from === entityId);
  const incoming = relationships.filter(r => r.to === entityId);
  if (outgoing.length === 0 && incoming.length === 0) return '';

  const relLabel = rel => rel.replace(/_/g, ' ');

  let html = '';
  if (outgoing.length > 0) {
    html += `  <h3>Outgoing Relationships</h3>
  <ul class="entity-rel-list">`;
    outgoing.forEach(r => {
      const target = entityIndex[r.to];
      const targetName = target ? esc(target.name) : esc(r.to);
      const targetUrl  = target ? `/entities/${r.to}` : null;
      const link = targetUrl ? `<a href="${targetUrl}">${targetName}</a>` : targetName;
      html += `\n    <li><span class="entity-rel-type">${esc(relLabel(r.relationship))}</span> → ${link}</li>`;
    });
    html += '\n  </ul>';
  }
  if (incoming.length > 0) {
    html += `\n  <h3>Incoming Relationships</h3>
  <ul class="entity-rel-list">`;
    incoming.forEach(r => {
      const source = entityIndex[r.from];
      const sourceName = source ? esc(source.name) : esc(r.from);
      const sourceUrl  = source ? `/entities/${r.from}` : null;
      const link = sourceUrl ? `<a href="${sourceUrl}">${sourceName}</a>` : sourceName;
      html += `\n    <li><span class="entity-rel-type">${esc(relLabel(r.relationship))}</span> ← ${link}</li>`;
    });
    html += '\n  </ul>';
  }
  return html;
}

function buildRelatedEntitiesSection(relatedIds) {
  const valid = (relatedIds || []).filter(id => entityIndex[id]);
  if (valid.length === 0) return '';
  const cards = valid.map(id => {
    const e = entityIndex[id];
    return `      <div class="knowledge-card">
        <a href="${urlEngine.href(`/entities/${id}`)}">
          <span class="knowledge-badge knowledge-badge--${esc(e.type)}">${esc(TYPE_LABELS[e.type] || e.type)}</span>
          <h3>${esc(e.name)}</h3>
          <p>${esc(e.shortDescription)}</p>
        </a>
      </div>`;
  }).join('\n');
  return `<section id="related-entities">
  <h2>Related Entities</h2>
  <div class="knowledge-cards related-entities-grid">\n${cards}\n  </div>
</section>`;
}

function buildSidebarRelated(relatedIds) {
  const valid = (relatedIds || []).filter(id => entityIndex[id]);
  if (valid.length === 0) return '';
  const items = valid.slice(0, 8).map(id => {
    const e = entityIndex[id];
    return `<li><a href="${urlEngine.href(`/entities/${id}`)}">${esc(e.name)}</a></li>`;
  }).join('\n');
  return `<div class="knowledge-sidebar-section"><h3>Related Entities</h3><ul>${items}</ul></div>`;
}

function buildSidebarCalcs(ids) {
  if (!ids || ids.length === 0) return '';
  const items = ids.map(id => {
    const title = esc(CALC_TITLES[id] || id);
    return `<li><a href="${urlEngine.href(`/calculators/${id}`)}">${title}</a></li>`;
  }).join('\n');
  return `<div class="knowledge-sidebar-section"><h3>Calculators</h3><ul>${items}</ul></div>`;
}

function buildEntityFacts(entity) {
  let rows = '';
  if (entity.idealRange && entity.idealRange !== 'N/A') {
    rows += `    <div class="entity-fact-row"><dt>Ideal Range</dt><dd>${esc(entity.idealRange)}</dd></div>\n`;
  }
  if (entity.units && entity.units !== 'N/A') {
    rows += `    <div class="entity-fact-row"><dt>Units</dt><dd>${esc(entity.units)}</dd></div>\n`;
  }
  const syns = synonymsMap[entity.id];
  if (syns && syns.length > 0) {
    rows += `    <div class="entity-fact-row"><dt>Also Known As</dt><dd>${esc(syns.join(', '))}</dd></div>\n`;
  }
  if (!rows) return '';
  return `<section class="entity-facts" id="quick-facts" aria-label="Quick Facts">
  <h2>Quick Facts</h2>
  <dl class="entity-facts-table">
${rows}  </dl>
</section>`;
}

// Phase 7L (Step 10): entity-level citations. Only entities with an
// individually reviewed, directly-supporting claim get an entry here --
// this is not a lookup applied to every entity, it is a short, explicit
// allowlist. `claimIds` render via the canonical chemistry-claims.js layer;
// `sourceIds` render a source directly for a claim that doesn't fit the
// parameter-based claims schema (e.g. a material-science claim). `note`
// is used when the entity's prose contains more than one claim of
// differing status, so the citation isn't misread as supporting the whole
// paragraph.
const ENTITY_CITATIONS = {
  'trichlor-tablets': {
    claimIds: ['claim-trichlor-calhypo-mixing-hazard'],
  },
  'green-water': {
    claimIds: ['claim-shock-algae-recovery-green'],
  },
  'temperature': {
    claimIds: ['claim-temperature-hottub-safety-max'],
  },
  'shock-treatment': {
    claimIds: ['claim-shock-algae-recovery-green'],
    note: 'The source below supports the 30 ppm green-algae-recovery figure specifically. The routine-maintenance (10 ppm) and breakpoint-rule (10x combined chlorine) figures above are common industry guidance without a confirmed primary source and remain under review.',
  },
  'vinyl-pool': {
    sourceIds: ['cffa-vinyl-liner-bleaching'],
  },
};

function buildSourcesSection(entityId) {
  const cfg = ENTITY_CITATIONS[entityId];
  if (!cfg) return '';
  let sourceIds = [];
  if (cfg.claimIds) {
    for (const cid of cfg.claimIds) {
      const claim = CLAIMS_BY_ID[cid];
      if (claim && claim.source_ids) sourceIds.push(...claim.source_ids);
    }
  }
  if (cfg.sourceIds) sourceIds.push(...cfg.sourceIds);
  sourceIds = [...new Set(sourceIds)];
  const listHtml = renderSourceList(sourceIds);
  if (!listHtml) return '';
  const note = cfg.note ? `<p class="knowledge-sources-note">${esc(cfg.note)}</p>\n` : '';
  return note + listHtml;
}

function buildResourceSection(ids) {
  if (!ids || ids.length === 0) return '';
  const cards = ids.map(id => {
    const title = esc(RESOURCE_TITLES[id] || id);
    return `      <div class="knowledge-card">
        <a href="${urlEngine.href(`/resources/${id}`)}">
          <h3>${title}</h3>
          <p>Free printable</p>
        </a>
      </div>`;
  }).join('\n');
  return `<section id="resources">
  <h2>Free Resources</h2>
  <div class="knowledge-cards">\n${cards}\n  </div>
</section>`;
}

const CHART_URLS = {
  'pool-chemical-levels-chart':    '/pool-chemical-levels-chart',
  'hot-tub-chemical-levels-chart': '/hot-tub-chemical-levels-chart',
  'pool-water-balance-chart':      '/charts/pool-water-balance-chart',
};

function buildChartSection(ids) {
  if (!ids || ids.length === 0) return '';
  const cards = ids.map(id => {
    const title = esc(CHART_TITLES[id] || id);
    const url   = CHART_URLS[id] || ('/' + id);
    return `      <div class="knowledge-card">
        <a href="${url}">
          <h3>${title}</h3>
        </a>
      </div>`;
  }).join('\n');
  return `<section id="charts">
  <h2>Related Charts</h2>
  <div class="knowledge-cards">\n${cards}\n  </div>
</section>`;
}

// ── Read template ──────────────────────────────────────────────────────────────

const TMPL = fs.readFileSync(path.join(ROOT, 'templates', 'entity-template.html'), 'utf8');

function fill(tmpl, tokens) {
  return tmpl.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) =>
    Object.prototype.hasOwnProperty.call(tokens, k) ? tokens[k] : m);
}

// ── Generate entity pages ──────────────────────────────────────────────────────

let count = 0;

Object.values(entityIndex).forEach(entity => {
  const id       = entity.id;
  const typeLabel = esc(TYPE_LABELS[entity.type] || entity.type);
  // A couple of entities have a one-sentence shortDescription under the
  // 50-char SEO minimum; fall back to the (now-rendered) longDescription,
  // truncated at a sentence boundary, so the meta description still
  // accurately summarizes real page content rather than padding with
  // boilerplate (Phase 7I fix).
  let metaDesc = entity.shortDescription;
  if (metaDesc.length < 50 && entity.longDescription) {
    const firstSentence = entity.longDescription.split(/(?<=\.)\s/)[0];
    metaDesc = firstSentence.length >= 50 ? firstSentence : entity.longDescription;
  }
  metaDesc = metaDesc.slice(0, 160);
  const relContent = buildRelationshipsSection(id);

  const tokens = {
    ENTITY_ID:         esc(id),
    ENTITY_NAME:       esc(entity.name),
    ENTITY_TYPE:       esc(entity.type),
    ENTITY_TYPE_LABEL: typeLabel,
    ENTITY_SHORT_DESC: esc(entity.shortDescription),
    ENTITY_LONG_DESC:  esc(entity.longDescription || entity.shortDescription),
    // Shorter title (Phase 7I): "Name — Pool Chemistry Entity | WaterBalanceTools"
    // pushed 11 of 104 entity titles past the 65-char SEO threshold; "Pool
    // Chemistry Entity" was redundant generic jargon nobody searches for --
    // the entity name itself already signals the topic (e.g. "Alkalinity",
    // "Free Chlorine"), so the badge/type context stays visible on-page
    // (knowledge-badge) without needing to repeat it in the <title>.
    PAGE_TITLE:        esc(entity.name) + ' | WaterBalanceTools',
    META_DESCRIPTION:  esc(metaDesc),
    OG_TITLE:          esc(entity.name),
    ENTITY_FACTS:      buildEntityFacts(entity),
    SOURCES_SECTION:   buildSourcesSection(id),
    RELATIONSHIPS_CONTENT: relContent || '<p>No relationships defined for this entity.</p>',
    CALC_SECTION:      buildCalcSection(entity.calculatorIds),
    ACADEMY_SECTION:   buildItemSection(entity.academyIds, articleById, a => a.title, a => a.slug, 'academy', 'Academy Articles'),
    FORMULA_SECTION:   buildItemSection(entity.formulaIds, formulaById, f => f.title, f => f.slug, 'formulas', 'Formulas'),
    GLOSSARY_SECTION:  buildItemSection(entity.glossaryIds, termById, t => t.term, t => t.slug, 'glossary', 'Glossary Terms'),
    REFERENCE_SECTION: buildItemSection(entity.referenceIds, refById, p => p.title, p => p.slug, 'reference', 'Reference Pages'),
    RESOURCE_SECTION:  buildResourceSection(entity.resourceIds),
    CHART_SECTION:     buildChartSection(entity.chartIds),
    RELATED_ENTITIES_SECTION: buildRelatedEntitiesSection(entity.relatedEntities),
    SIDEBAR_RANGE:     entity.idealRange && entity.idealRange !== 'N/A'
      ? `<div class="knowledge-sidebar-section"><h3>Ideal Range</h3><ul><li>${esc(entity.idealRange)}</li></ul></div>`
      : '',
    SIDEBAR_ALIASES:   (synonymsMap[id] || []).slice(0, 5).map(a => `<li>${esc(a)}</li>`).join('') || '<li>—</li>',
    SIDEBAR_CALCS:     buildSidebarCalcs(entity.calculatorIds),
    SIDEBAR_RELATED:   buildSidebarRelated(entity.relatedEntities),
  };

  const html = fill(TMPL, tokens);
  const outFile = path.join(OUT, id + '.html');
  fs.writeFileSync(outFile, html, 'utf8');
  console.log(`  → entities/${id}.html`);
  count++;
});

// ── Generate entities/index.html ──────────────────────────────────────────────

const typeGroups = {};
Object.values(entityIndex).forEach(e => {
  if (!typeGroups[e.type]) typeGroups[e.type] = [];
  typeGroups[e.type].push(e);
});

let indexBody = `<section class="entity-index">
  <h2>All Entities by Type</h2>
`;

Object.entries(typeGroups).forEach(([type, entities]) => {
  const label = TYPE_LABELS[type] || type;
  indexBody += `  <div class="entity-type-group">
    <h3>${esc(label)} (${entities.length})</h3>
    <ul class="entity-index-list">
`;
  entities.forEach(e => {
    indexBody += `      <li><a href="${urlEngine.href(`/entities/${e.id}`)}">${esc(e.name)}</a> — <span>${esc(e.shortDescription)}</span></li>\n`;
  });
  indexBody += `    </ul>
  </div>
`;
});
indexBody += '</section>';

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="canonical" href="${urlEngine.canonicalUrl('/entities')}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Entity Graph — Pool Chemistry Knowledge Base | WaterBalanceTools</title>
  <meta name="description" content="The canonical pool chemistry entity graph: 104 entities covering chemicals, measurements, equipment, processes, problems, and pool types. The semantic backbone of WaterBalanceTools.">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/knowledge.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Pool Chemistry Entity Graph",
    "description": "104 canonical pool and spa chemistry entities with typed relationships.",
    "url": "${urlEngine.absoluteUrl('/entities')}",
    "hasPart": ${JSON.stringify(Object.values(entityIndex).slice(0, 20).map(e => ({ '@type': 'DefinedTerm', 'name': e.name, 'url': urlEngine.absoluteUrl(`/entities/${e.id}`) })))}
  }
  </script>
</head>
<body class="knowledge-page entity-page">
  <header class="site-header">
    <a href="${urlEngine.href('/')}" class="logo-link"><img src="/assets/logo.svg" alt="WaterBalanceTools" class="logo" width="180" height="36"></a>
    <nav class="nav" id="site-nav" aria-label="Primary navigation">
      <a href="${urlEngine.href('/calculators/chemical-calculator')}">Calculator</a>
      <a href="${urlEngine.href('/resources')}">Resources</a>
      <a href="${urlEngine.href('/pool-chemical-levels-chart')}">Charts</a>
      <a href="${urlEngine.href('/academy')}">Academy</a>
      <a href="${urlEngine.href('/guides/pool-chemistry-basics')}">Guides</a>
      <a href="${urlEngine.href('/about')}">About</a>
    </nav>
  </header>
  <main>
    <section class="knowledge-hero">
      <h1>Pool Chemistry Entity Graph</h1>
      <p class="knowledge-hero-summary">The canonical semantic layer for WaterBalanceTools. ${Object.keys(entityIndex).length} entities across ${Object.keys(typeGroups).length} types, with ${Object.keys(aliases).length} aliases and ${Object.values(entityIndex).reduce((n, e) => n + (e.relatedEntities || []).length, 0)} explicit relationships.</p>
    </section>
    ${indexBody}
  </main>
  <footer class="site-footer"><div class="footer-inner"><p>&copy; 2026 WaterBalanceTools.com</p></div></footer>
</body>
</html>`;

fs.writeFileSync(path.join(OUT, 'index.html'), indexHtml, 'utf8');
console.log(`  → entities/index.html`);

console.log(`\ngenerate-entity-pages: wrote ${count + 1} files (${count} entity pages)`);
