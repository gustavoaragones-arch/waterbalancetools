#!/usr/bin/env node
/**
 * generate-trust.js
 *
 * Compiles all trust data source modules from scripts/data/trust-*.js
 * into JSON files at data/trust/*.json and generates:
 *
 *   /editorial/index.html + 5 policy pages
 *   /methodology/index.html + 7 methodology pages
 *   /provenance/index.html (links to dataset doc pages)
 *   /revisions/index.html
 *
 * Also creates the partial templates used by inject-trust-panels.js.
 *
 * Run: node scripts/generate-trust.js
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT   = path.join(__dirname, '..');
const D      = path.join(__dirname, 'data');
const TRUST  = path.join(ROOT, 'data', 'trust');
const PART   = path.join(ROOT, 'partials');
const DATASETS = path.join(ROOT, 'data', 'datasets');

if (!fs.existsSync(TRUST)) fs.mkdirSync(TRUST, { recursive: true });

// ── Load source modules ────────────────────────────────────────────────────────

const confidence   = require(path.join(D, 'trust-confidence'));
const sources      = require(path.join(D, 'trust-sources'));
const editorial    = require(path.join(D, 'trust-editorial'));
const methodology  = require(path.join(D, 'trust-methodology'));
const formulas     = require(path.join(D, 'trust-formulas'));
const revisions    = require(path.join(D, 'trust-revisions'));
const calculators  = require(path.join(D, 'trust-calculator-metadata'));

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function writeJson(fp, d) { fs.writeFileSync(fp, JSON.stringify(d, null, 2) + '\n', 'utf8'); }
function writeHtml(fp, html) { fs.writeFileSync(fp, html, 'utf8'); }

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

// ── Confidence badge HTML ─────────────────────────────────────────────────────

function confidenceBadge(levelId) {
  const CONF = confidence.levels.find(l => l.id === levelId);
  if (!CONF) return '';
  return `<span class="confidence-badge confidence-${esc(CONF.id)}" title="${esc(CONF.meaning)}" style="background:${esc(CONF.displayColor)};color:${esc(CONF.textColor)}">${esc(CONF.icon)} ${esc(CONF.shortLabel)}</span>`;
}

// ── Page template ─────────────────────────────────────────────────────────────

function sitePage(opts) {
  const { title, metaDesc, canonical, breadcrumbs, body, section } = opts;
  const bcHtml = breadcrumbs.map(b => b.url ? `<a href="${esc(b.url)}">${esc(b.label)}</a>` : esc(b.label)).join(' › ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} | WaterBalanceTools</title>
  <meta name="description" content="${esc(metaDesc || '')}">
  ${canonical ? `<link rel="canonical" href="https://waterbalancetools.com${esc(canonical)}">` : ''}
  <link rel="stylesheet" href="/css/style.css">
  <style>
    .trust-page h1{margin-bottom:.5rem}.trust-page .page-meta{color:#666;font-size:.875rem;margin-bottom:2rem;display:flex;gap:1rem;flex-wrap:wrap;align-items:center}
    .trust-page section{margin-bottom:2rem}.trust-page section h2{border-bottom:2px solid #e0e0e0;padding-bottom:.5rem;margin-bottom:1rem}
    .policy-section{background:#fff;border:1px solid #e8e8e8;border-radius:6px;padding:1.25rem 1.5rem;margin-bottom:1.25rem}
    .policy-section h3{margin:0 0 .5rem;font-size:1rem;color:#0073aa}
    .trust-nav{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;margin:1.5rem 0}
    .trust-nav a{display:block;padding:1rem 1.25rem;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:6px;text-decoration:none;color:#0073aa;font-weight:500}
    .trust-nav a:hover{background:#e8f0fe;border-color:#0073aa}
    .diagram-box{background:#f0f4f8;border:1px solid #ccd;border-radius:6px;padding:1rem;font-family:monospace;font-size:.875rem;white-space:pre;margin:1rem 0}
  </style>
</head>
<body>
  <header class="site-header"><!-- nav injected --></header>
  <nav class="breadcrumbs"><a href="/">Home</a> › ${bcHtml}</nav>
  <main class="knowledge-content trust-page">
    ${body}
  </main>
  <footer class="site-footer"><!-- footer injected --></footer>
  <script src="/js/main.js"></script>
</body>
</html>`;
}

// ── Render content sections ───────────────────────────────────────────────────

function renderSections(sections) {
  return sections.map(s => `
<div class="policy-section">
  <h3>${esc(s.heading)}</h3>
  <p>${esc(s.body)}</p>
  ${s.diagram ? `<div class="diagram-box">${esc(s.diagram)}</div>` : ''}
</div>`).join('\n');
}

// ── 1. Write data/trust JSON files ────────────────────────────────────────────

writeJson(path.join(TRUST, 'confidence.json'),  confidence);
writeJson(path.join(TRUST, 'references.json'),  sources);
writeJson(path.join(TRUST, 'editorial.json'),   editorial);
writeJson(path.join(TRUST, 'methodology.json'), methodology);
writeJson(path.join(TRUST, 'formulas.json'),    formulas);
writeJson(path.join(TRUST, 'revisions.json'),   revisions);
writeJson(path.join(TRUST, 'datasets.json'),    { dataId: 'datasets', version: '2026.07', calculators });

// Build a quick-lookup confidence map
const CONF_MAP = {};
confidence.levels.forEach(l => { CONF_MAP[l.id] = l; });

console.log('  ✓ data/trust/*.json (7 files)');

// ── 2. Generate /editorial/ pages ─────────────────────────────────────────────

const EDITORIAL_DIR = path.join(ROOT, 'editorial');
ensureDir(EDITORIAL_DIR);

const editorialNavLinks = editorial.index.pages.map(slug => {
  const p = editorial[slug];
  return `<a href="/editorial/${slug}/">${esc(p.title)}</a>`;
}).join('\n');

// index.html
const editorialIndexBody = `
<h1>${esc(editorial.index.h1)}</h1>
<div class="page-meta">
  <span>WaterBalanceTools Editorial Team</span>
  <span>Version ${esc(confidence.version)}</span>
</div>
<p>${esc(editorial.index.intro)}</p>
<nav class="trust-nav">
  ${editorialNavLinks}
</nav>
<section>
  ${renderSections(editorial.index.sections || [])}
</section>`;

writeHtml(path.join(EDITORIAL_DIR, 'index.html'),
  sitePage({ title: editorial.index.title, metaDesc: editorial.index.metaDescription, canonical: '/editorial/', breadcrumbs: [{ label: 'Editorial', url: '/editorial/' }], body: editorialIndexBody }));

editorial.index.pages.forEach(slug => {
  const pg = editorial[slug];
  if (!pg) return;
  const dir = path.join(EDITORIAL_DIR, slug);
  ensureDir(dir);
  const body = `
<h1>${esc(pg.h1)}</h1>
<div class="page-meta">
  <span>Last reviewed: ${esc(pg.lastReviewed)}</span>
  <a href="/editorial/">← Editorial Framework</a>
</div>
${renderSections(pg.sections || [])}
<p style="margin-top:2rem"><a href="/editorial/">← Back to Editorial Framework</a></p>`;

  writeHtml(path.join(dir, 'index.html'),
    sitePage({ title: pg.title, metaDesc: pg.metaDescription, canonical: `/editorial/${slug}/`,
      breadcrumbs: [{ label: 'Editorial', url: '/editorial/' }, { label: pg.title }], body }));
});

console.log(`  ✓ /editorial/ (${1 + editorial.index.pages.length} pages)`);

// ── 3. Generate /methodology/ pages ──────────────────────────────────────────

const METH_DIR = path.join(ROOT, 'methodology');
ensureDir(METH_DIR);

const methNavLinks = methodology.index.pages.map(slug => {
  const p = methodology[slug];
  return `<a href="/methodology/${slug}/">${esc(p.title)}</a>`;
}).join('\n');

const methIndexBody = `
<h1>${esc(methodology.index.h1)}</h1>
<div class="page-meta">
  <span>Version ${esc(formulas.version)}</span>
</div>
<p>${esc(methodology.index.intro)}</p>
<nav class="trust-nav">
  ${methNavLinks}
</nav>`;

writeHtml(path.join(METH_DIR, 'index.html'),
  sitePage({ title: methodology.index.title, metaDesc: methodology.index.metaDescription, canonical: '/methodology/',
    breadcrumbs: [{ label: 'Methodology', url: '/methodology/' }], body: methIndexBody }));

methodology.index.pages.forEach(slug => {
  const pg = methodology[slug];
  if (!pg) return;
  const dir = path.join(METH_DIR, slug);
  ensureDir(dir);
  const confBadge = pg.confidenceLevel ? confidenceBadge(pg.confidenceLevel) : '';
  const body = `
<h1>${esc(pg.h1)}</h1>
<div class="page-meta">
  <span>Last reviewed: ${esc(pg.lastReviewed)}</span>
  ${confBadge}
  <a href="/methodology/">← Methodology</a>
</div>
${renderSections(pg.sections || [])}
<section style="margin-top:2rem">
  <h2>Related Resources</h2>
  <ul>
    <li><a href="/methodology/">Calculation Methodology Index</a></li>
    <li><a href="/editorial/editorial-policy/">Editorial Policy</a></li>
    <li><a href="/reference/datasets/">Canonical Datasets</a></li>
  </ul>
</section>`;

  writeHtml(path.join(dir, 'index.html'),
    sitePage({ title: pg.title, metaDesc: pg.metaDescription, canonical: `/methodology/${slug}/`,
      breadcrumbs: [{ label: 'Methodology', url: '/methodology/' }, { label: pg.title }], body }));
});

console.log(`  ✓ /methodology/ (${1 + methodology.index.pages.length} pages)`);

// ── 4. Generate /provenance/index.html ────────────────────────────────────────

const PROV_DIR = path.join(ROOT, 'provenance');
ensureDir(PROV_DIR);

const DATASET_NAMES = [
  'chemical-ranges', 'hot-tub-ranges', 'water-balance', 'dosage-matrices',
  'chemical-properties', 'compatibility', 'units', 'conversion-factors',
  'temperature-guidelines', 'testing-frequency', 'pool-types', 'water-problems',
  'maintenance-schedules', 'confidence-levels', 'version',
];

function getDataset(name) {
  const fp = path.join(DATASETS, name + '.json');
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return null; }
}

const provCards = DATASET_NAMES.map(name => {
  const ds = getDataset(name);
  if (!ds) return '';
  const count = ds.records ? ds.records.length : '—';
  const title = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  // Find which calculators depend on this dataset
  const consumers = calculators.filter(c => c.datasetDependencies && c.datasetDependencies.includes(name)).map(c => c.name);
  return `<tr>
    <td><a href="/reference/datasets/${esc(name)}/">${esc(title)}</a></td>
    <td>${esc(ds.version || '—')}</td>
    <td>${esc(String(count))}</td>
    <td>${esc(ds.lastReviewed || '—')}</td>
    <td>${consumers.length ? consumers.map(c => esc(c)).join(', ') : '—'}</td>
  </tr>`;
}).join('\n');

const provBody = `
<h1>Data Provenance</h1>
<div class="page-meta"><span>Generated automatically from data/datasets/*.json</span></div>
<p>Every factual value on WaterBalanceTools originates from one of the canonical datasets below. This index provides a snapshot of each dataset's version, record count, last review date, and which calculators consume it.</p>
<div class="table-wrap">
<table>
  <thead><tr><th>Dataset</th><th>Version</th><th>Records</th><th>Last Reviewed</th><th>Consumers</th></tr></thead>
  <tbody>${provCards}</tbody>
</table>
</div>
<p>Full documentation for each dataset is available at <a href="/reference/datasets/">reference/datasets/</a>.</p>`;

writeHtml(path.join(PROV_DIR, 'index.html'),
  sitePage({ title: 'Data Provenance', metaDesc: 'Provenance for all canonical datasets used on WaterBalanceTools.', canonical: '/provenance/',
    breadcrumbs: [{ label: 'Provenance' }], body: provBody }));

console.log('  ✓ /provenance/index.html');

// ── 5. Generate /revisions/index.html ────────────────────────────────────────

const REV_DIR = path.join(ROOT, 'revisions');
ensureDir(REV_DIR);

const revRows = revisions.records.slice().reverse().map(r => `<tr>
  <td>${esc(r.id)}</td>
  <td>${esc(r.version)}</td>
  <td>${esc(r.date)}</td>
  <td>${esc(r.component)}</td>
  <td>${esc(r.summary)}</td>
</tr>`).join('\n');

const revBody = `
<h1>Revision History</h1>
<div class="page-meta"><span>Auto-generated from data/trust/revisions.json</span></div>
<p>All significant changes to datasets, formulas, entities, and calculators are logged here. The most recent revisions appear first.</p>
<div class="table-wrap">
<style>.table-wrap{overflow-x:auto}.table-wrap table{border-collapse:collapse;width:100%;font-size:.875rem}.table-wrap th{background:#f0f0f0;padding:8px 12px;text-align:left;border:1px solid #ddd}.table-wrap td{padding:7px 12px;border:1px solid #eee;vertical-align:top}</style>
<table>
  <thead><tr><th>ID</th><th>Version</th><th>Date</th><th>Component</th><th>Summary</th></tr></thead>
  <tbody>${revRows}</tbody>
</table>
</div>
<p><a href="/editorial/correction-policy/">Correction Policy</a> · <a href="/editorial/update-policy/">Update Policy</a></p>`;

writeHtml(path.join(REV_DIR, 'index.html'),
  sitePage({ title: 'Revision History', metaDesc: 'Complete revision history for WaterBalanceTools datasets, formulas, and calculators.', canonical: '/revisions/',
    breadcrumbs: [{ label: 'Revision History' }], body: revBody }));

console.log('  ✓ /revisions/index.html');

// ── 6. Write/overwrite partials ────────────────────────────────────────────────

// trust-panel.html — injected into calculator pages
const trustPanelHtml = `<!-- trust-panel: generated by generate-trust.js. Populated by inject-trust-panels.js -->
<aside class="trust-panel" aria-label="Calculation Trust Panel">
  <details>
    <summary class="trust-panel__toggle">
      <span class="trust-panel__icon">🔬</span>
      <strong>About This Calculation</strong>
      <span class="trust-panel__confidence">{{CONFIDENCE_BADGE}}</span>
    </summary>
    <div class="trust-panel__body">
      <dl class="trust-panel__grid">
        <dt>Formula Version</dt><dd>{{FORMULA_VERSION}}</dd>
        <dt>Dataset Version</dt><dd>{{DATASET_VERSION}}</dd>
        <dt>Knowledge Graph</dt><dd>{{KG_VERSION}}</dd>
        <dt>Last Reviewed</dt><dd>{{LAST_REVIEWED}}</dd>
        <dt>Confidence Level</dt><dd>{{CONFIDENCE_LABEL}}</dd>
      </dl>
      <div class="trust-panel__links">
        <a href="/methodology/calculation-methodology/">Methodology</a>
        <a href="/methodology/known-limitations/">Known Limitations</a>
        <a href="/methodology/rounding-policy/">Rounding Policy</a>
        <a href="/revisions/">Revision History</a>
      </div>
    </div>
  </details>
</aside>`;

// dataset-panel.html — injected into dataset documentation pages
const datasetPanelHtml = `<!-- dataset-panel: generated by generate-trust.js -->
<aside class="dataset-panel">
  <h3>Dataset Information</h3>
  <dl class="trust-panel__grid">
    <dt>Dataset ID</dt><dd>{{DATASET_ID}}</dd>
    <dt>Version</dt><dd>{{DATASET_VERSION}}</dd>
    <dt>Records</dt><dd>{{RECORD_COUNT}}</dd>
    <dt>Last Reviewed</dt><dd>{{LAST_REVIEWED}}</dd>
    <dt>Validation</dt><dd>{{VALIDATION_STATUS}}</dd>
  </dl>
  <div class="trust-panel__links">
    <a href="/provenance/">Data Provenance</a>
    <a href="/methodology/calculation-methodology/">How Data Flows</a>
  </div>
</aside>`;

// formula-panel.html — injected into formula pages
const formulaPanelHtml = `<!-- formula-panel: generated by generate-trust.js -->
<aside class="formula-panel">
  <h3>Formula Details</h3>
  <dl class="trust-panel__grid">
    <dt>Formula Version</dt><dd>{{FORMULA_VERSION}}</dd>
    <dt>Confidence</dt><dd>{{CONFIDENCE_BADGE}}</dd>
    <dt>Last Reviewed</dt><dd>{{LAST_REVIEWED}}</dd>
    <dt>Dataset Dependencies</dt><dd>{{DATASET_DEPS}}</dd>
    <dt>Calculators</dt><dd>{{CALCULATOR_LIST}}</dd>
  </dl>
  <div class="trust-panel__links">
    <a href="/methodology/formula-selection/">Formula Selection Policy</a>
    <a href="/revisions/">Revision History</a>
  </div>
</aside>`;

// methodology-panel.html — reusable link block to methodology from any page
const methodologyPanelHtml = `<!-- methodology-panel -->
<aside class="methodology-panel">
  <h3>Methodology</h3>
  <ul>
    <li><a href="/methodology/calculation-methodology/">How calculations work</a></li>
    <li><a href="/methodology/calculation-assumptions/">Assumptions</a></li>
    <li><a href="/methodology/known-limitations/">Known limitations</a></li>
    <li><a href="/methodology/rounding-policy/">Rounding policy</a></li>
    <li><a href="/methodology/confidence-system/">Confidence system</a></li>
  </ul>
</aside>`;

// confidence-panel.html — display all 5 confidence levels
const confRows = confidence.levels.map(l =>
  `<tr><td><span class="confidence-badge confidence-${esc(l.id)}" style="background:${esc(l.displayColor)};color:${esc(l.textColor)}">${esc(l.icon)} ${esc(l.shortLabel)}</span></td><td>${esc(l.meaning.slice(0, 120))}…</td></tr>`
).join('\n');
const confidencePanelHtml = `<!-- confidence-panel -->
<aside class="confidence-panel">
  <h3>Confidence Levels</h3>
  <table><tbody>${confRows}</tbody></table>
  <p><a href="/methodology/confidence-system/">About the confidence system →</a></p>
</aside>`;

// sources-panel.html — source categories reference
const srcRows = sources.categories.map(c =>
  `<li><strong>${esc(c.label)}</strong> — ${esc(c.description.slice(0, 100))}…</li>`
).join('\n');
const sourcesPanelHtml = `<!-- sources-panel -->
<aside class="sources-panel">
  <h3>Source Categories</h3>
  <ul>${srcRows}</ul>
  <p><a href="/editorial/editorial-policy/">Editorial Policy →</a></p>
</aside>`;

// revision-panel.html — latest revisions summary
const latestRevs = revisions.records.slice(-3).reverse().map(r =>
  `<li><strong>${esc(r.version)}</strong> (${esc(r.date)}) — ${esc(r.summary.slice(0, 80))}…</li>`
).join('\n');
const revisionPanelHtml = `<!-- revision-panel -->
<aside class="revision-panel">
  <h3>Recent Revisions</h3>
  <ul>${latestRevs}</ul>
  <p><a href="/revisions/">Full revision history →</a></p>
</aside>`;

const PANELS = {
  'trust-panel.html':       trustPanelHtml,
  'dataset-panel.html':     datasetPanelHtml,
  'formula-panel.html':     formulaPanelHtml,
  'methodology-panel.html': methodologyPanelHtml,
  'confidence-panel.html':  confidencePanelHtml,
  'sources-panel.html':     sourcesPanelHtml,
  'revision-panel.html':    revisionPanelHtml,
};

Object.entries(PANELS).forEach(([name, html]) => {
  writeHtml(path.join(PART, name), html);
});

console.log(`  ✓ /partials/ (${Object.keys(PANELS).length} trust partials)`);

// ── 7. Write trust CSS (appended to existing styles if not present) ────────────

const TRUST_CSS = `
/* ── Trust / Scientific Authority System ──────────────────────── */
.trust-panel{margin:2rem 0;border:1px solid #d0dde8;border-radius:8px;background:#f8fbff;font-size:.875rem}
.trust-panel details summary{list-style:none;cursor:pointer;padding:.875rem 1.25rem;display:flex;align-items:center;gap:.75rem;user-select:none}
.trust-panel details summary::-webkit-details-marker{display:none}
.trust-panel details[open] summary{border-bottom:1px solid #d0dde8}
.trust-panel__icon{font-size:1.1rem;flex-shrink:0}
.trust-panel__confidence{margin-left:auto}
.trust-panel__body{padding:1.25rem}
.trust-panel__grid{display:grid;grid-template-columns:max-content 1fr;gap:.35rem 1rem;margin:0 0 1rem}
.trust-panel__grid dt{color:#666;font-weight:500}
.trust-panel__grid dd{margin:0;color:#222}
.trust-panel__links{display:flex;gap:1rem;flex-wrap:wrap}
.trust-panel__links a{color:#0073aa;font-size:.8rem;text-decoration:underline}
.confidence-badge{display:inline-flex;align-items:center;gap:.3em;padding:2px 8px;border-radius:12px;font-size:.75rem;font-weight:600;white-space:nowrap}
.confidence-very-high{background:#1a7a1a;color:#fff}
.confidence-high{background:#2d7a2d;color:#fff}
.confidence-moderate{background:#b06000;color:#fff}
.confidence-limited{background:#8a3a00;color:#fff}
.confidence-informational{background:#4a6080;color:#fff}
.version-badge{display:inline-flex;align-items:center;gap:.4em;background:#f0f4f8;border:1px solid #c8d8e8;border-radius:4px;padding:2px 8px;font-size:.72rem;color:#445;margin-left:.75rem;vertical-align:middle}
.dataset-panel,.formula-panel,.methodology-panel,.confidence-panel,.sources-panel,.revision-panel{border:1px solid #e0e0e0;border-radius:6px;padding:1rem 1.25rem;background:#fff;margin:1.5rem 0;font-size:.875rem}
.dataset-panel h3,.formula-panel h3,.methodology-panel h3,.confidence-panel h3,.sources-panel h3,.revision-panel h3{margin:0 0 .75rem;font-size:.9rem;color:#0073aa;text-transform:uppercase;letter-spacing:.04em}
`;

const CSS_DIR = path.join(ROOT, 'css');
if (fs.existsSync(CSS_DIR)) {
  const trustCssPath = path.join(CSS_DIR, 'trust.css');
  fs.writeFileSync(trustCssPath, TRUST_CSS, 'utf8');
  console.log('  ✓ css/trust.css');
}

// ── Summary ───────────────────────────────────────────────────────────────────

const totalPages = 2 + editorial.index.pages.length + methodology.index.pages.length + 2;
console.log(`\ngenerate-trust: wrote ${totalPages} HTML pages + 7 JSON files + ${Object.keys(PANELS).length} partials`);
