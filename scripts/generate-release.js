#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

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

function renderReleasePage(template, release, platform) {
  const title = `Release ${release.version}${release.codename ? ` — ${release.codename}` : ''}`;
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

  <section class="link-matrix">
    <h2>Related</h2>
    <ul>
      <li><a href="/releases/">Release History</a></li>
      <li><a href="/releases/compatibility.html">Compatibility Matrix</a></li>
      <li><a href="/qa/certification.html">Certification</a></li>
    </ul>
  </section>`;

  return fill(template, {
    PAGE_TITLE: `${title} | WaterBalanceTools`,
    META_DESCRIPTION: `Release notes for WaterBalanceTools ${release.version}${release.codename ? ` (${release.codename})` : ''}.`,
    CANONICAL_URL: `https://waterbalancetools.com/releases/${release.version}.html`,
    CONTENT: content,
  });
}

function run() {
  fs.mkdirSync(RELEASES_DIR, { recursive: true });

  const platform = readJson(path.join(PLATFORM_DIR, 'platform.json'), {});
  const versions = readJson(path.join(PLATFORM_DIR, 'versions.json'), { releaseHistory: [] });
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  const history = versions.releaseHistory || [];
  const releaseLinks = history.map((r) => `<li><a href="/releases/${esc(r.version)}.html">${esc(r.version)}${r.codename ? ` — ${esc(r.codename)}` : ''}</a> · ${esc(r.certificationStatus || r.status || 'Unknown')}</li>`).join('\n');

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
      <li><a href="/releases/compatibility.html">Compatibility Matrix</a></li>
      <li><a href="/qa/">QA Dashboard</a></li>
      <li><a href="/revisions/">Revision History</a></li>
    </ul>
  </section>`;

  fs.writeFileSync(path.join(RELEASES_DIR, 'index.html'), fill(template, {
    PAGE_TITLE: 'Releases | WaterBalanceTools',
    META_DESCRIPTION: 'Canonical WaterBalanceTools release history with semantic versions and certification status.',
    CANONICAL_URL: 'https://waterbalancetools.com/releases/',
    CONTENT: indexContent,
  }), 'utf8');

  history.forEach((release) => {
    const page = renderReleasePage(template, release, platform);
    fs.writeFileSync(path.join(RELEASES_DIR, `${release.version}.html`), page, 'utf8');
  });

  console.log(`generate-release: wrote releases/index.html + ${history.length} release page(s)`);
}

run();
