#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PLATFORM_DIR = path.join(ROOT, 'data', 'platform');
const RELEASES_DIR = path.join(ROOT, 'releases');

function readJson(p, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function shell(title, description, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} | WaterBalanceTools</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="https://waterbalancetools.com/releases/compatibility/">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="${esc(title)} | WaterBalanceTools">
  <meta property="og:description" content="${esc(description)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)} | WaterBalanceTools">
  <meta name="twitter:description" content="${esc(description)}">
  <link rel="stylesheet" href="/style.css">
</head>
<body class="knowledge-page release-page">
  <header class="site-header" data-canonical-nav="v2"><!-- nav --></header>
  <main class="container">${body}</main>
  <footer class="site-footer"><!-- footer --></footer>
  <script src="/js/nav.js" defer></script>
</body>
</html>`;
}

function run() {
  fs.mkdirSync(RELEASES_DIR, { recursive: true });

  const platform = readJson(path.join(PLATFORM_DIR, 'platform.json'), {});
  const versions = readJson(path.join(PLATFORM_DIR, 'versions.json'), { releaseHistory: [] });

  const matrix = (versions.releaseHistory || []).map((release) => ({
    platform: release.version,
    knowledgeGraph: release.subsystems?.knowledgeGraph || '',
    entityLayer: release.subsystems?.entityLayer || '',
    datasets: release.subsystems?.datasets || '',
    formulaEngine: release.subsystems?.formulaEngine || '',
    calculatorEngine: release.subsystems?.calculatorEngine || '',
    trustSystem: release.subsystems?.trustSystem || '',
    qaFramework: release.subsystems?.qaFramework || '',
    qaScore: release.qaScore ?? '',
    status: release.certificationStatus || release.status || 'Unknown',
  }));

  const currentVersion = platform.platform?.version;
  if (currentVersion && !matrix.some((r) => r.platform === currentVersion)) {
    matrix.unshift({
      platform: currentVersion,
      knowledgeGraph: platform.knowledgeGraph?.version || '',
      entityLayer: platform.entityLayer?.version || '',
      datasets: platform.datasets?.version || '',
      formulaEngine: platform.formulaEngine?.version || '',
      calculatorEngine: platform.calculatorEngine?.version || '',
      trustSystem: platform.trustSystem?.version || '',
      qaFramework: platform.qaFramework?.version || '',
      qaScore: platform.platform?.qaScore ?? '',
      status: platform.platform?.status || 'Unknown',
    });
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    matrix,
  };
  writeJson(path.join(PLATFORM_DIR, 'compatibility.json'), payload);

  const rows = matrix.map((row) => `<tr>
    <td>${esc(row.platform)}</td>
    <td>${esc(row.knowledgeGraph)}</td>
    <td>${esc(row.entityLayer)}</td>
    <td>${esc(row.datasets)}</td>
    <td>${esc(row.formulaEngine)}</td>
    <td>${esc(row.calculatorEngine)}</td>
    <td>${esc(row.trustSystem)}</td>
    <td>${esc(row.qaFramework)}</td>
    <td>${esc(String(row.qaScore))}</td>
    <td>${esc(row.status)}</td>
  </tr>`).join('\n');

  const body = `
  <section class="hero hero-compact">
    <h1>Platform Compatibility Matrix</h1>
    <p>Subsystem compatibility and certification status by platform version.</p>
  </section>
  <section>
    <table class="qa-table">
      <thead>
        <tr>
          <th>Platform</th>
          <th>Knowledge Graph</th>
          <th>Entity Layer</th>
          <th>Datasets</th>
          <th>Formula Engine</th>
          <th>Calculator Engine</th>
          <th>Trust System</th>
          <th>QA Framework</th>
          <th>QA Score</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </section>
  <section class="link-matrix">
    <h2>Related</h2>
    <ul>
      <li><a href="/releases/">Release History</a></li>
      <li><a href="/qa/">QA Dashboard</a></li>
      <li><a href="/qa/certification.html">Certification</a></li>
    </ul>
  </section>`;

  fs.writeFileSync(
    path.join(RELEASES_DIR, 'compatibility.html'),
    shell('Compatibility Matrix', 'Platform and subsystem compatibility matrix for WaterBalanceTools releases.', body),
    'utf8'
  );

  console.log(`generate-compatibility: wrote data/platform/compatibility.json and releases/compatibility.html (${matrix.length} row(s))`);
}

run();
