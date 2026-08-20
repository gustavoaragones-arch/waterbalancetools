#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const urlEngine = require('../js/url/url-engine');
const S = require('../lib/schemaEngine.js');

const ROOT = path.join(__dirname, '..');
const PLATFORM_DIR = path.join(ROOT, 'data', 'platform');
const RELEASES_DIR = path.join(ROOT, 'releases');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'release-template.html');

function readJson(p, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function fill(tpl, map) {
  return Object.entries(map).reduce((out, [k, v]) => out.replace(new RegExp(`{{${k}}}`, 'g'), String(v)), tpl);
}

function tagFor(version, codename) {
  const safeCode = String(codename || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return safeCode ? `v${version}-${safeCode}` : `v${version}`;
}

function tableRows(subsystems = {}) {
  return Object.entries(subsystems).map(([name, version]) => `<tr><td>${esc(name)}</td><td>${esc(version)}</td></tr>`).join('\n');
}

function list(items) {
  if (!items || !items.length) return '<p>None.</p>';
  return `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
}

function countHtmlRecursive(dir) {
  if (!fs.existsSync(dir)) return 0;
  let total = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) total += countHtmlRecursive(full);
    else if (e.isFile() && e.name.endsWith('.html')) total++;
  }
  return total;
}

function foundationStats() {
  const entities = Object.keys(readJson(path.join(ROOT, 'data', 'graph', 'entity-index.json'), {})).length;
  const datasets = fs.existsSync(path.join(ROOT, 'data', 'datasets'))
    ? fs.readdirSync(path.join(ROOT, 'data', 'datasets')).filter((f) => f.endsWith('.json') && f !== 'resolved-ranges.json').length
    : 0;
  return {
    totalPages: countHtmlRecursive(ROOT),
    totalEntities: entities,
    totalDatasets: datasets,
    totalFormulas: Math.max(0, countHtmlRecursive(path.join(ROOT, 'formulas')) - 1),
    totalGlossaryEntries: Math.max(0, countHtmlRecursive(path.join(ROOT, 'glossary')) - 1),
    totalAcademyArticles: Math.max(0, countHtmlRecursive(path.join(ROOT, 'academy')) - 9),
    totalReferencePages: Math.max(0, countHtmlRecursive(path.join(ROOT, 'reference')) - 1),
  };
}

function renderReleasePage(template, release, platform) {
  const title = `Release ${release.version}${release.codename ? ` — ${release.codename}` : ''}`;
  const stats = foundationStats();
  const content = `
  <section class="hero hero-compact">
    <h1>${esc(title)}</h1>
    <p>Status: ${esc(release.status || 'Unknown')} · Certification: ${esc(release.certificationStatus || 'Unknown')}</p>
    <div class="version-badge platform-version-badge">Platform v${esc(release.version)}${release.codename ? ` ${esc(release.codename)}` : ''}</div>
  </section>

  <section>
    <h2>Release Metadata</h2>
    <table class="qa-table">
      <tbody>
        <tr><td>Release Date</td><td>${esc(release.releaseDate || 'TBD')}</td></tr>
        <tr><td>Platform Version</td><td>${esc(release.version)}</td></tr>
        <tr><td>Codename</td><td>${esc(release.codename || 'N/A')}</td></tr>
        <tr><td>QA Score</td><td>${esc(release.qaScore == null ? 'N/A' : `${release.qaScore} / 100`)}</td></tr>
        <tr><td>Certification Status</td><td>${esc(release.certificationStatus || release.status || 'Unknown')}</td></tr>
        <tr><td>Recommended Git Tag</td><td><code>${esc(tagFor(release.version, release.codename || platform.platform?.codename || 'release'))}</code></td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>Subsystem Versions</h2>
    <table class="qa-table"><thead><tr><th>Subsystem</th><th>Version</th></tr></thead><tbody>${tableRows(release.subsystems)}</tbody></table>
  </section>

  <section><h2>Highlights</h2>${list(release.highlights)}</section>
  <section><h2>Breaking Changes</h2>${list(release.breakingChanges)}</section>
  <section><h2>Datasets Changed</h2>${list(release.datasetsChanged)}</section>
  <section><h2>Entities Changed</h2>${list(release.entitiesChanged)}</section>
  <section><h2>Formulas Changed</h2>${list(release.formulasChanged)}</section>
  <section><h2>Related Commits</h2>${list(release.relatedCommits)}</section>

  <section>
    <h2>Foundation Architecture Summary</h2>
    <table class="qa-table">
      <tbody>
        <tr><td>Platform overview</td><td>Canonical dataset, entity graph, trust, URL, QA, and crawl systems integrated.</td></tr>
        <tr><td>Foundation milestones</td><td>Certification, URL normalization, crawl topology, indexing intelligence.</td></tr>
        <tr><td>Architecture summary</td><td>Static generated platform with single source-of-truth data and deterministic generators.</td></tr>
        <tr><td>QA certification</td><td>${esc(String(release.qaScore ?? platform.platform?.qaScore ?? 'N/A'))}/100</td></tr>
        <tr><td>Crawl optimization summary</td><td>Priority/tier assignment, weighted authority flow, crawl-depth and weak-page audits.</td></tr>
        <tr><td>URL architecture summary</td><td>Unified URL engine with preflight validation and regression enforcement.</td></tr>
        <tr><td>Entity graph statistics</td><td>${stats.totalEntities} entities</td></tr>
        <tr><td>Dataset statistics</td><td>${stats.totalDatasets} datasets</td></tr>
        <tr><td>Knowledge platform statistics</td><td>${stats.totalAcademyArticles} academy · ${stats.totalFormulas} formulas · ${stats.totalGlossaryEntries} glossary · ${stats.totalReferencePages} reference</td></tr>
        <tr><td>Total generated pages</td><td>${stats.totalPages}</td></tr>
        <tr><td>Total entities</td><td>${stats.totalEntities}</td></tr>
        <tr><td>Total datasets</td><td>${stats.totalDatasets}</td></tr>
        <tr><td>Total formulas</td><td>${stats.totalFormulas}</td></tr>
        <tr><td>Total glossary entries</td><td>${stats.totalGlossaryEntries}</td></tr>
        <tr><td>Total academy articles</td><td>${stats.totalAcademyArticles}</td></tr>
        <tr><td>Total reference pages</td><td>${stats.totalReferencePages}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="link-matrix">
    <h2>Related</h2>
    <ul>
      <li><a href="${urlEngine.href('/releases')}">Release History</a></li>
      <li><a href="${urlEngine.href('/releases/compatibility')}">Compatibility Matrix</a></li>
      <li><a href="${urlEngine.href('/qa/certification')}">Certification</a></li>
    </ul>
  </section>`;

  const releaseDesc = `Release notes for WaterBalanceTools ${release.version}${release.codename ? ` (${release.codename})` : ''}.`;
  const releaseCanonical = urlEngine.canonicalUrl(`/releases/${release.version}`);
  return fill(template, {
    PAGE_TITLE: `${title} | WaterBalanceTools`,
    META_DESCRIPTION: releaseDesc,
    CANONICAL_URL: releaseCanonical,
    CONTENT: content,
    SCHEMA: S.renderAllSchemas({
      webPage: { name: title, description: releaseDesc, url: releaseCanonical },
      breadcrumb: [
        { name: 'Home', url: '/' },
        { name: 'Releases', url: urlEngine.canonicalUrl('/releases') },
        { name: title, url: releaseCanonical },
      ],
    }),
  });
}

function run() {
  fs.mkdirSync(RELEASES_DIR, { recursive: true });

  const platform = readJson(path.join(PLATFORM_DIR, 'platform.json'), {});
  const versions = readJson(path.join(PLATFORM_DIR, 'versions.json'), { releaseHistory: [] });
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  const history = versions.releaseHistory || [];
  const releaseLinks = history.map((r) => `<li><a href="${urlEngine.href(`/releases/${esc(r.version)}`)}">${esc(r.version)}${r.codename ? ` — ${esc(r.codename)}` : ''}</a> · ${esc(r.certificationStatus || r.status || 'Unknown')}</li>`).join('\n');

  const indexContent = `
  <section class="hero hero-compact">
    <h1>Release History</h1>
    <p>Canonical release record for WaterBalanceTools platform versions.</p>
    <div class="version-badge platform-version-badge">Current v${esc(platform.platform?.version || 'unknown')} ${esc(platform.platform?.codename || '')}</div>
  </section>
  <section>
    <h2>Published and Planned Releases</h2>
    <ul>${releaseLinks}</ul>
  </section>
  <section class="link-matrix">
    <h2>Related</h2>
    <ul>
      <li><a href="${urlEngine.href('/releases/compatibility')}">Compatibility Matrix</a></li>
      <li><a href="${urlEngine.href('/qa')}">QA Dashboard</a></li>
      <li><a href="${urlEngine.href('/revisions')}">Revision History</a></li>
    </ul>
  </section>`;

  const indexDesc = 'Canonical WaterBalanceTools release history with semantic versions and certification status.';
  const indexCanonical = urlEngine.canonicalUrl('/releases');
  fs.writeFileSync(path.join(RELEASES_DIR, 'index.html'), fill(template, {
    PAGE_TITLE: 'Releases | WaterBalanceTools',
    META_DESCRIPTION: indexDesc,
    CANONICAL_URL: indexCanonical,
    CONTENT: indexContent,
    SCHEMA: S.renderAllSchemas({
      webPage: { name: 'Release History', description: indexDesc, url: indexCanonical },
      breadcrumb: [
        { name: 'Home', url: '/' },
        { name: 'Releases', url: indexCanonical },
      ],
    }),
  }), 'utf8');

  history.forEach((release) => {
    const page = renderReleasePage(template, release, platform);
    fs.writeFileSync(path.join(RELEASES_DIR, `${release.version}.html`), page, 'utf8');
  });

  console.log(`generate-release: wrote releases/index.html + ${history.length} release page(s)`);
}

run();
