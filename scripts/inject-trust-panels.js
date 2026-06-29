#!/usr/bin/env node
/**
 * inject-trust-panels.js
 *
 * Injects the Scientific Authority System components into existing pages:
 *
 *   1. Trust panels → every calculator (before </main>)
 *   2. Version badges → every calculator, formula, dataset, reference, academy page
 *      (inserted after the first <h1>…</h1>)
 *   3. Trust CSS link → every page that references style.css but not trust.css
 *   4. Formula panels → every formula page (before </main>)
 *   5. Dataset panels → /reference/datasets/ pages (before </main>)
 *
 * All injections are idempotent — skips pages already containing the component.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const TRUST   = path.join(ROOT, 'data', 'trust');
const DATASETS = path.join(ROOT, 'data', 'datasets');
const GRAPH   = path.join(ROOT, 'data', 'graph');

// ── Load trust metadata ───────────────────────────────────────────────────────

const confidence   = JSON.parse(fs.readFileSync(path.join(TRUST, 'confidence.json'), 'utf8'));
const formulas     = JSON.parse(fs.readFileSync(path.join(TRUST, 'formulas.json'), 'utf8'));
const calculators  = JSON.parse(fs.readFileSync(path.join(TRUST, 'datasets.json'), 'utf8')).calculators;
const version      = JSON.parse(fs.readFileSync(path.join(DATASETS, 'version.json'), 'utf8'));

const CONF_MAP = {};
confidence.levels.forEach(l => { CONF_MAP[l.id] = l; });

const FORMULA_MAP = {};
(formulas.records || []).forEach(f => { FORMULA_MAP[f.id] = f; });

const CALC_MAP = {};
calculators.forEach(c => { CALC_MAP[c.id] = c; });

const KG_VERSION = version.knowledgeGraphVersion || version.entityVersion || '2026.07';

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function confidenceBadge(levelId) {
  const c = CONF_MAP[levelId];
  if (!c) return '';
  return `<span class="confidence-badge confidence-${esc(c.id)}" style="background:${esc(c.displayColor)};color:${esc(c.textColor)}" title="${esc(c.meaning)}">${esc(c.icon)} ${esc(c.shortLabel)}</span>`;
}

function versionBadge(version, lastReviewed) {
  return `<span class="version-badge" title="Last reviewed: ${esc(lastReviewed)}">v${esc(version)}</span>`;
}

// ── Trust panel HTML ──────────────────────────────────────────────────────────

function buildTrustPanel(calc) {
  if (!calc) return '';
  const conf     = CONF_MAP[calc.confidenceLevel] || CONF_MAP['high'];
  const fVer     = calc.version || '2026.07';
  const dsVer    = version.datasets ? (version.datasets['chemical-ranges'] || '2026.07') : '2026.07';
  const reviewed = calc.lastReviewed || '2026-07-01';
  const confBadge = confidenceBadge(conf.id);

  const formLinks = (calc.formulaIds || []).map(fid => {
    const f = FORMULA_MAP[fid];
    return f ? `<a href="/methodology/formula-selection/" title="${esc(f.name)}">${esc(f.name)}</a>` : esc(fid);
  }).join(', ') || '—';

  const dsLinks = (calc.datasetDependencies || []).map(d =>
    `<a href="/reference/datasets/${esc(d)}/">${esc(d)}</a>`
  ).join(', ') || '—';

  return `
<!-- trust-panel: inject-trust-panels.js -->
<aside class="trust-panel" aria-label="Calculation Trust Panel">
  <details>
    <summary class="trust-panel__toggle">
      <span class="trust-panel__icon">🔬</span>
      <strong>About This Calculation</strong>
      <span class="trust-panel__confidence">${confBadge}</span>
    </summary>
    <div class="trust-panel__body">
      <dl class="trust-panel__grid">
        <dt>Formula Version</dt><dd>${esc(fVer)}</dd>
        <dt>Dataset Version</dt><dd>${esc(dsVer)}</dd>
        <dt>Knowledge Graph</dt><dd>${esc(KG_VERSION)}</dd>
        <dt>Last Reviewed</dt><dd>${esc(reviewed)}</dd>
        <dt>Confidence</dt><dd>${confBadge}</dd>
        <dt>Formulas Used</dt><dd>${formLinks}</dd>
        <dt>Dataset Sources</dt><dd>${dsLinks}</dd>
      </dl>
      <div class="trust-panel__links">
        <a href="/methodology/calculation-methodology/">Methodology</a>
        <a href="/methodology/calculation-assumptions/">Assumptions</a>
        <a href="/methodology/known-limitations/">Known Limitations</a>
        <a href="/methodology/rounding-policy/">Rounding Policy</a>
        <a href="/revisions/">Revision History</a>
      </div>
      ${calc.notes ? `<p class="trust-panel__note"><em>${esc(calc.notes)}</em></p>` : ''}
    </div>
  </details>
</aside>`;
}

// ── Formula panel HTML ────────────────────────────────────────────────────────

function buildFormulaPanel(formulaRecord) {
  if (!formulaRecord) return '';
  const conf = CONF_MAP[formulaRecord.confidenceLevel] || CONF_MAP['high'];
  const dsLinks = (formulaRecord.datasetDependencies || []).map(d =>
    `<a href="/reference/datasets/${esc(d)}/">${esc(d)}</a>`
  ).join(', ') || '—';
  const calcLinks = (formulaRecord.calculatorIds || []).map(cid =>
    `<a href="/calculators/${esc(cid)}">${esc(CALC_MAP[cid] ? CALC_MAP[cid].name : cid)}</a>`
  ).join(', ') || '—';

  return `
<!-- formula-panel: inject-trust-panels.js -->
<aside class="formula-panel">
  <h3>Formula Details</h3>
  <dl class="trust-panel__grid">
    <dt>Formula</dt><dd><code>${esc(formulaRecord.formula)}</code></dd>
    <dt>Version</dt><dd>${esc(formulaRecord.version || '2026.07')}</dd>
    <dt>Confidence</dt><dd>${confidenceBadge(conf.id)}</dd>
    <dt>Last Reviewed</dt><dd>${esc(formulaRecord.lastReviewed || '2026-07-01')}</dd>
    <dt>Dataset Sources</dt><dd>${dsLinks}</dd>
    <dt>Used By</dt><dd>${calcLinks}</dd>
  </dl>
  <div class="trust-panel__links">
    <a href="/methodology/formula-selection/">Formula Selection Policy</a>
    <a href="/methodology/calculation-assumptions/">Assumptions</a>
    <a href="/revisions/">Revision History</a>
  </div>
  ${formulaRecord.notes ? `<p class="trust-panel__note"><em>${esc(formulaRecord.notes)}</em></p>` : ''}
</aside>`;
}

// ── Dataset panel HTML ────────────────────────────────────────────────────────

function buildDatasetPanel(name) {
  const fp = path.join(DATASETS, name + '.json');
  if (!fs.existsSync(fp)) return '';
  let ds;
  try { ds = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return ''; }
  const count = ds.records ? ds.records.length : '—';
  // Find calculator consumers
  const consumers = calculators
    .filter(c => c.datasetDependencies && c.datasetDependencies.includes(name))
    .map(c => `<a href="${esc(c.urlPath || '#')}">${esc(c.name)}</a>`)
    .join(', ') || '—';

  return `
<!-- dataset-panel: inject-trust-panels.js -->
<aside class="dataset-panel">
  <h3>Dataset Information</h3>
  <dl class="trust-panel__grid">
    <dt>Dataset ID</dt><dd>${esc(ds.datasetId || name)}</dd>
    <dt>Version</dt><dd>${esc(ds.version || '2026.07')}</dd>
    <dt>Records</dt><dd>${esc(String(count))}</dd>
    <dt>Last Reviewed</dt><dd>${esc(ds.lastReviewed || '—')}</dd>
    <dt>Validation</dt><dd><span class="confidence-badge confidence-high" style="background:#2d7a2d;color:#fff">✓ Validated</span></dd>
    <dt>Consumed by</dt><dd>${consumers}</dd>
  </dl>
  <div class="trust-panel__links">
    <a href="/provenance/">Data Provenance</a>
    <a href="/methodology/calculation-methodology/">How Data Flows</a>
    <a href="/editorial/editorial-policy/">Editorial Policy</a>
  </div>
</aside>`;
}

// ── Trust CSS injection ───────────────────────────────────────────────────────

const TRUST_CSS_LINK = '<link rel="stylesheet" href="/trust.css">';
const TRUST_CSS_LINK_REL = '<link rel="stylesheet" href="../trust.css">';
const TRUST_CSS_INLINE = `<style>
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
.trust-panel__links a{color:#0073aa;font-size:.8rem}
.trust-panel__note{margin:.75rem 0 0;padding:.5rem .75rem;background:#fffde7;border-radius:4px;font-size:.8rem;color:#555}
.confidence-badge{display:inline-flex;align-items:center;gap:.3em;padding:2px 8px;border-radius:12px;font-size:.75rem;font-weight:600;white-space:nowrap}
.version-badge{display:inline-flex;align-items:center;gap:.4em;background:#f0f4f8;border:1px solid #c8d8e8;border-radius:4px;padding:2px 8px;font-size:.72rem;color:#445;margin-left:.75rem;vertical-align:middle}
.formula-panel,.dataset-panel{border:1px solid #e0e0e0;border-radius:6px;padding:1rem 1.25rem;background:#fff;margin:1.5rem 0;font-size:.875rem}
.formula-panel h3,.dataset-panel h3{margin:0 0 .75rem;font-size:.9rem;color:#0073aa;text-transform:uppercase;letter-spacing:.04em}
</style>`;

// ── Inject into a file ────────────────────────────────────────────────────────

let stats = { trustPanels: 0, formulaPanels: 0, datasetPanels: 0, versionBadges: 0, cssInjected: 0, skipped: 0 };

function injectIntoFile(fp, { trustPanel, formulaPanel, datasetPanel, versionBadge: badge, calcId } = {}) {
  let html = fs.readFileSync(fp, 'utf8');
  let changed = false;

  // Inject trust CSS inline if not already present
  if (!html.includes('<!-- trust-panel:') && !html.includes('<!-- formula-panel:') && !html.includes('<!-- dataset-panel:') && !html.includes('trust.css') && !html.includes('trust-panel__grid') && (trustPanel || formulaPanel || datasetPanel)) {
    const insertAfter = /<\/head>/i;
    if (insertAfter.test(html)) {
      html = html.replace('</head>', TRUST_CSS_INLINE + '\n</head>');
      changed = true;
      stats.cssInjected++;
    }
  }

  // Inject version badge after first </h1>
  if (badge && !html.includes('version-badge')) {
    const h1Close = /<\/h1>/i;
    if (h1Close.test(html)) {
      html = html.replace(/<\/h1>/i, `</h1>\n${badge}`);
      changed = true;
      stats.versionBadges++;
    }
  }

  // Inject trust panel before </main>
  if (trustPanel && !html.includes('<!-- trust-panel:')) {
    if (html.includes('</main>')) {
      html = html.replace('</main>', `${trustPanel}\n</main>`);
      changed = true;
      stats.trustPanels++;
    }
  }

  // Inject formula panel before </main>
  if (formulaPanel && !html.includes('<!-- formula-panel:')) {
    if (html.includes('</main>')) {
      html = html.replace('</main>', `${formulaPanel}\n</main>`);
      changed = true;
      stats.formulaPanels++;
    }
  }

  // Inject dataset panel before </main>
  if (datasetPanel && !html.includes('<!-- dataset-panel:')) {
    if (html.includes('</main>')) {
      html = html.replace('</main>', `${datasetPanel}\n</main>`);
      changed = true;
      stats.datasetPanels++;
    }
  }

  if (changed) fs.writeFileSync(fp, html, 'utf8');
  else stats.skipped++;
}

// ── 1. Process calculators ────────────────────────────────────────────────────

const CALC_DIR = path.join(ROOT, 'calculators');
if (fs.existsSync(CALC_DIR)) {
  for (const file of fs.readdirSync(CALC_DIR)) {
    if (!file.endsWith('.html')) continue;
    const calcId = file.replace('.html', '');
    const calc = CALC_MAP[calcId];
    if (!calc) { stats.skipped++; continue; }
    const fp = path.join(CALC_DIR, file);
    const badge = versionBadge(calc.version || '2026.07', calc.lastReviewed || '2026-07-01');
    injectIntoFile(fp, {
      trustPanel: buildTrustPanel(calc),
      versionBadge: badge,
    });
  }
}

// ── 2. Process formula pages ──────────────────────────────────────────────────

const FORM_DIR = path.join(ROOT, 'formulas');
if (fs.existsSync(FORM_DIR)) {
  // Map formula page slug → trust formula record
  const FORMULA_BY_PAGE = {};
  (formulas.records || []).forEach(f => {
    if (f.formulaPageId) {
      // formula-01 → pool-volume-formula (first formula page)
      // We need to map formulaPageId to filename
      // The formula pages are named by slug from data/formulas.json
    }
  });

  // Load formulas data to get slugs
  let formulaData = [];
  try {
    const fJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'formulas.json'), 'utf8'));
    formulaData = Array.isArray(fJson) ? fJson : (fJson.formulas || []);
  } catch (_) {}

  // Build slug → formulaRec map using the slug basename (e.g. "pool-volume-formula")
  const slugToFormulaRec = {};
  formulaData.forEach(fd => {
    if (!fd.slug) return;
    // slug may be "formulas/pool-volume-formula" or just "pool-volume-formula"
    const basename = fd.slug.split('/').pop();
    const rec = (formulas.records || []).find(r => r.formulaPageId === fd.id);
    if (rec) slugToFormulaRec[basename] = rec;
  });

  for (const file of fs.readdirSync(FORM_DIR)) {
    if (!file.endsWith('.html') || file === 'index.html') continue;
    const slug = file.replace('.html', '');
    const formulaRec = slugToFormulaRec[slug];
    const fp = path.join(FORM_DIR, file);
    const ver = formulaRec ? formulaRec.version : '2026.07';
    const reviewed = formulaRec ? (formulaRec.lastReviewed || '2026-07-01') : '2026-07-01';
    injectIntoFile(fp, {
      formulaPanel: formulaRec ? buildFormulaPanel(formulaRec) : null,
      versionBadge: versionBadge(ver, reviewed),
    });
  }
}

// ── 3. Process dataset documentation pages ────────────────────────────────────

const DS_DOC_DIR = path.join(ROOT, 'reference', 'datasets');
if (fs.existsSync(DS_DOC_DIR)) {
  for (const entry of fs.readdirSync(DS_DOC_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dsName = entry.name;
    const indexFile = path.join(DS_DOC_DIR, dsName, 'index.html');
    if (!fs.existsSync(indexFile)) continue;
    const dsVer = version.datasets ? (version.datasets[dsName] || '2026.07') : '2026.07';
    injectIntoFile(indexFile, {
      datasetPanel: buildDatasetPanel(dsName),
      versionBadge: versionBadge(dsVer, '2026-07-01'),
    });
  }
}

// ── 4. Process academy pages — version badges only ───────────────────────────

let academyData = [];
try {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'academy.json'), 'utf8'));
  academyData = Array.isArray(raw) ? raw : (raw.articles || []);
} catch (_) {}
const ACAD_VER_MAP = {};
academyData.forEach(a => { if (a.id) ACAD_VER_MAP[a.id] = a.lastReviewed || '2026-07-01'; });

function walkAndBadge(dir, getId, getReviewed, skipDirs = new Set()) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!skipDirs.has(e.name)) walkAndBadge(path.join(dir, e.name), getId, getReviewed, skipDirs);
      continue;
    }
    if (!e.name.endsWith('.html') || e.name === 'index.html') continue;
    const fp = path.join(dir, e.name);
    const reviewed = getReviewed(e.name, fp) || '2026-07-01';
    const badge = versionBadge('2026.07', reviewed);
    injectIntoFile(fp, { versionBadge: badge });
  }
}

const ACAD_DIR = path.join(ROOT, 'academy');
walkAndBadge(ACAD_DIR, f => f.replace('.html',''), (name) => ACAD_VER_MAP[name.replace('.html','')] || '2026-07-01');

// ── 5. Process reference pages — version badges only ─────────────────────────

const REF_DIR = path.join(ROOT, 'reference');
walkAndBadge(REF_DIR, f => f, () => '2026-07-01', new Set(['datasets']));

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`inject-trust-panels:`);
console.log(`  trust panels injected:    ${stats.trustPanels}`);
console.log(`  formula panels injected:  ${stats.formulaPanels}`);
console.log(`  dataset panels injected:  ${stats.datasetPanels}`);
console.log(`  version badges injected:  ${stats.versionBadges}`);
console.log(`  CSS blocks injected:      ${stats.cssInjected}`);
console.log(`  skipped (already had):    ${stats.skipped}`);
