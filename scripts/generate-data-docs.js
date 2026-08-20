#!/usr/bin/env node
/**
 * generate-data-docs.js
 *
 * Generates human-readable HTML documentation pages for every canonical dataset
 * at /reference/datasets/<name>/index.html.
 *
 * Also generates /reference/datasets/index.html as a directory listing.
 *
 * All pages are generated from data/datasets/*.json. No manual HTML.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT      = path.join(__dirname, '..');
const DATASETS  = path.join(ROOT, 'data', 'datasets');
const OUT_DIR   = path.join(ROOT, 'reference', 'datasets');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const DATASET_NAMES = [
  'chemical-ranges', 'hot-tub-ranges', 'water-balance', 'dosage-matrices',
  'chemical-properties', 'compatibility', 'units', 'conversion-factors',
  'temperature-guidelines', 'testing-frequency', 'pool-types', 'water-problems',
  'maintenance-schedules', 'confidence-levels', 'version',
];

// Friendly descriptions used in the index listing
const DATASET_META = {
  'chemical-ranges':       { title: 'Chemical Ranges',        icon: '⚗',  summary: 'Target, warning, and critical bounds for all chemical parameters by pool type.' },
  'hot-tub-ranges':        { title: 'Hot Tub Ranges',         icon: '♨',  summary: 'Chemical ranges specific to hot tubs and spas.' },
  'water-balance':         { title: 'Water Balance (LSI)',     icon: '⚖',  summary: 'Langelier Saturation Index factors and interpretation table.' },
  'dosage-matrices':       { title: 'Dosage Matrices',        icon: '🧪', summary: 'Product dosage coefficients for all supported pool chemicals.' },
  'chemical-properties':   { title: 'Chemical Properties',    icon: '🔬', summary: 'Formula, purpose, safety notes, and cross-references for each chemical compound.' },
  'compatibility':         { title: 'Compatibility',          icon: '⚠',  summary: 'Chemical safety matrix: safe, avoid, and never-mix pairings.' },
  'units':                 { title: 'Units',                  icon: '📏', summary: 'Canonical definitions for every unit of measurement used on the platform.' },
  'conversion-factors':    { title: 'Conversion Factors',     icon: '↔',  summary: 'All unit conversion factors. Single source of truth. Never duplicated.' },
  'temperature-guidelines':{ title: 'Temperature Guidelines', icon: '🌡', summary: 'Safe and recommended water temperature ranges by pool type.' },
  'testing-frequency':     { title: 'Testing Frequency',      icon: '📅', summary: 'Recommended testing intervals by pool type and scenario.' },
  'pool-types':            { title: 'Pool Types',             icon: '🏊', summary: 'Canonical pool type definitions with chemistry implications.' },
  'water-problems':        { title: 'Water Problems',         icon: '🚨', summary: 'Diagnostic entries for common water quality problems with resolution guidance.' },
  'maintenance-schedules': { title: 'Maintenance Schedules',  icon: '🗓', summary: 'Reusable structured maintenance schedules by pool type.' },
  'confidence-levels':     { title: 'Confidence Levels',      icon: '✅', summary: 'Reusable confidence definitions for calculators and reference pages.' },
  'version':               { title: 'Version Registry',       icon: '📦', summary: 'Version tracking for all canonical datasets and build metadata.' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderValue(val) {
  if (val === null || val === undefined) return '<span class="null">—</span>';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (Array.isArray(val)) {
    if (val.length === 0) return '<span class="null">—</span>';
    return val.map(v => typeof v === 'object' ? renderValue(v) : `<span class="tag">${esc(v)}</span>`).join(' ');
  }
  if (typeof val === 'object') {
    return '<span class="json">' + esc(JSON.stringify(val)) + '</span>';
  }
  return esc(String(val));
}

function renderRecordTable(records) {
  if (!records || records.length === 0) return '<p class="no-records">No records.</p>';
  // Collect all unique keys across records
  const keys = [];
  records.forEach(r => {
    Object.keys(r).forEach(k => {
      if (!keys.includes(k)) keys.push(k);
    });
  });

  const header = keys.map(k => `<th>${esc(k)}</th>`).join('');
  const rows   = records.map(r => {
    const cells = keys.map(k => `<td>${renderValue(r[k])}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('\n');

  return `
<div class="table-wrap">
<table>
  <thead><tr>${header}</tr></thead>
  <tbody>${rows}</tbody>
</table>
</div>`;
}

function page(title, meta, breadcrumb, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} | WaterBalanceTools Datasets</title>
  <meta name="description" content="${esc(meta)}">
  <meta name="robots" content="noindex">
  <link rel="stylesheet" href="/css/style.css">
  <style>
    .dataset-header { background: var(--color-bg-alt, #f5f5f5); border-left: 4px solid var(--color-brand, #0073aa); padding: 1.5rem 2rem; margin-bottom: 2rem; border-radius: 4px; }
    .dataset-badge { display: inline-block; background: #0073aa; color: #fff; font-size: 0.75rem; padding: 2px 8px; border-radius: 20px; margin-right: 8px; }
    .table-wrap { overflow-x: auto; margin: 1.5rem 0; }
    table { border-collapse: collapse; width: 100%; font-size: 0.85rem; }
    th { background: #f0f0f0; text-align: left; padding: 8px 10px; border: 1px solid #ddd; white-space: nowrap; }
    td { padding: 6px 10px; border: 1px solid #eee; vertical-align: top; max-width: 320px; word-break: break-word; }
    tr:hover td { background: #fafafa; }
    .null { color: #aaa; font-style: italic; }
    .tag { display: inline-block; background: #e8f0fe; color: #333; border-radius: 3px; padding: 1px 5px; font-size: 0.78em; margin: 1px; }
    .json { font-family: monospace; font-size: 0.78em; color: #555; }
    .no-records { color: #888; font-style: italic; }
    .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
    .meta-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 1rem; }
    .meta-label { font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .meta-value { font-size: 1rem; font-weight: 600; color: #222; }
    .source-list { list-style: none; padding: 0; margin: 0; }
    .source-list li::before { content: "↑ "; color: #0073aa; }
  </style>
</head>
<body>
  <nav class="breadcrumbs"><a href="/">Home</a> › <a href="/reference/">Reference</a> › <a href="/reference/datasets/">Datasets</a>${breadcrumb ? ' › ' + breadcrumb : ''}</nav>
  <main class="knowledge-content">
    ${body}
  </main>
  <footer><p>Auto-generated by generate-data-docs.js. Source: data/datasets/${breadcrumb ? breadcrumb.toLowerCase().replace(/ /g, '-') + '.json' : ''}. Do not edit manually.</p></footer>
  <script src="/js/main.js"></script>
</body>
</html>`;
}

// ── Generate individual dataset pages ─────────────────────────────────────────

let generated = 0;

DATASET_NAMES.forEach(name => {
  const fp = path.join(DATASETS, name + '.json');
  if (!fs.existsSync(fp)) { console.warn(`  SKIP: ${name}.json not found`); return; }

  let ds;
  try { ds = JSON.parse(fs.readFileSync(fp, 'utf8')); }
  catch(e) { console.error(`  FAIL: Cannot parse ${name}.json: ${e.message}`); return; }

  const meta = DATASET_META[name] || { title: name, icon: '📄', summary: ds.description || '' };
  const dir = path.join(OUT_DIR, name);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Metadata grid
  const metaItems = [
    { label: 'Dataset ID',     value: ds.datasetId || name },
    { label: 'Version',        value: ds.version || '—' },
    { label: 'Last Reviewed',  value: ds.lastReviewed || '—' },
    { label: 'Maintainer',     value: ds.maintainer || '—' },
    { label: 'Records',        value: ds.records ? ds.records.length : '—' },
  ];

  const metaGrid = metaItems.map(m =>
    `<div class="meta-card"><div class="meta-label">${esc(m.label)}</div><div class="meta-value">${esc(m.value)}</div></div>`
  ).join('\n');

  // Source priority
  let sourcePriority = '';
  if (ds.sourcePriority && ds.sourcePriority.length) {
    const items = ds.sourcePriority.map((s, i) => `<li>${i + 1}. ${esc(s)}</li>`).join('');
    sourcePriority = `<section><h2>Source Priority</h2><p>Values in this dataset are sourced in the following order (highest authority first):</p><ol class="source-list">${items}</ol></section>`;
  }

  // Records
  let recordsSection = '';
  if (ds.records && Array.isArray(ds.records)) {
    // Show first 100 records max with note if truncated
    const shown = ds.records.slice(0, 100);
    const note  = ds.records.length > 100
      ? `<p><em>Showing first 100 of ${ds.records.length} records.</em></p>`
      : '';
    recordsSection = `<section><h2>Records (${ds.records.length})</h2>${note}${renderRecordTable(shown)}</section>`;
  } else if (name === 'version') {
    // Special rendering for version.json
    const rows = Object.entries(ds.datasets || {}).map(([k, v]) =>
      `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('');
    recordsSection = `<section><h2>Dataset Versions</h2><table><thead><tr><th>Dataset</th><th>Version</th></tr></thead><tbody>${rows}</tbody></table>
    <h2>Build Metadata</h2><table><tbody>
      <tr><td>Entity Version</td><td>${esc(ds.entityVersion)}</td></tr>
      <tr><td>Knowledge Graph Version</td><td>${esc(ds.knowledgeGraphVersion)}</td></tr>
      <tr><td>Generator Version</td><td>${esc(ds.generatorVersion)}</td></tr>
      <tr><td>Website Version</td><td>${esc(ds.websiteVersion)}</td></tr>
      <tr><td>Schema Version</td><td>${esc(ds.schemaVersion)}</td></tr>
      <tr><td>Last Built</td><td>${esc(ds.lastBuilt)}</td></tr>
    </tbody></table></section>`;
  }

  const body = `
<div class="dataset-header">
  <span class="dataset-badge">Canonical Dataset</span>
  <h1>${meta.icon} ${esc(meta.title)}</h1>
  <p>${esc(ds.description || meta.summary)}</p>
</div>

<div class="meta-grid">
  ${metaGrid}
</div>

${sourcePriority}

${recordsSection}

<section>
  <h2>About This Dataset</h2>
  <p>This dataset is part of the <strong>WaterBalanceTools Canonical Data Layer</strong>. All factual values used across the website originate from canonical datasets like this one. No calculator, article, or tool embeds these values directly — they are always resolved through the data layer.</p>
  <p><a href="/reference/datasets/">← Back to all datasets</a></p>
</section>
`;

  fs.writeFileSync(path.join(dir, 'index.html'), page(meta.title, meta.summary, meta.title, body), 'utf8');
  console.log(`  ✓ /reference/datasets/${name}/`);
  generated++;
});

// ── Generate /reference/datasets/index.html ───────────────────────────────────

const cards = DATASET_NAMES.map(name => {
  const m = DATASET_META[name] || { title: name, icon: '📄', summary: '' };
  const ds = (() => {
    try { return JSON.parse(fs.readFileSync(path.join(DATASETS, name + '.json'), 'utf8')); }
    catch { return {}; }
  })();
  const count = ds.records ? `${ds.records.length} records` : '';
  return `<li class="dataset-card">
  <a href="/reference/datasets/${name}/">
    <span class="card-icon">${m.icon}</span>
    <div class="card-body">
      <h3>${esc(m.title)}</h3>
      <p>${esc(m.summary)}</p>
      ${count ? `<span class="card-count">${esc(count)}</span>` : ''}
    </div>
  </a>
</li>`;
}).join('\n');

const indexBody = `
<h1>Canonical Dataset Documentation</h1>
<p>Every factual value used on WaterBalanceTools originates from one of the canonical datasets below. No scientific constant, recommended range, dosage coefficient, conversion factor, or compatibility rule exists anywhere else in the codebase.</p>
<style>
  .datasets-grid { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; margin-top: 2rem; }
  .dataset-card a { display: flex; gap: 1rem; padding: 1.25rem; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; text-decoration: none; color: inherit; transition: box-shadow 0.2s; }
  .dataset-card a:hover { box-shadow: 0 2px 12px rgba(0,0,0,.1); }
  .card-icon { font-size: 2rem; flex-shrink: 0; }
  .card-body h3 { margin: 0 0 4px; font-size: 1rem; color: #0073aa; }
  .card-body p { margin: 0; font-size: 0.85rem; color: #555; }
  .card-count { display: inline-block; background: #e8f0fe; color: #333; font-size: 0.72rem; padding: 2px 6px; border-radius: 10px; margin-top: 6px; }
</style>
<h2>Datasets</h2>
<ul class="datasets-grid">
  ${cards}
</ul>
`;

fs.writeFileSync(path.join(OUT_DIR, 'index.html'), page('Canonical Datasets', 'All canonical datasets for WaterBalanceTools — chemical ranges, dosage matrices, units, conversion factors, and more.', null, indexBody), 'utf8');
console.log('  ✓ /reference/datasets/index.html');

console.log(`\ngenerate-data-docs: wrote ${generated + 1} files (${generated} dataset pages + index)`);
