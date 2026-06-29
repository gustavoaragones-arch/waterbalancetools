#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'audit', 'indexing-audit');
const JSON_PATH = path.join(OUT_DIR, 'url-normalization.json');

const TEST_PATHS = [
  '/',
  '/index.html',
  '/pool-chemical-levels-chart',
  '/pool-chemical-levels-chart/',
  '/pool-chemical-levels-chart.html',
  '/Pool-chemical-levels-chart',
  '/pool-chemical-levels-chart?utm=test',
];

function curlInfo(base, testPath) {
  try {
    const cmd = `curl -Ls -o /dev/null -w "%{http_code}|||%{redirect_url}|||%{url_effective}" "${base}${testPath}"`;
    const out = execSync(cmd, { encoding: 'utf8' }).trim();
    const [statusCode, redirectUrl, finalUrl] = out.split('|||');
    return { statusCode: Number(statusCode), redirectUrl, finalUrl, error: null };
  } catch (err) {
    return { statusCode: null, redirectUrl: '', finalUrl: '', error: String(err.message || err) };
  }
}

function fetchCanonical(url) {
  try {
    const html = execSync(`curl -Ls "${url}"`, { encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 });
    return (html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) || [])[1] || null;
  } catch (_) {
    return null;
  }
}

function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const environments = [
    { name: 'localhost', base: 'http://localhost:8080' },
    { name: 'production', base: 'https://waterbalancetools.com' },
  ];

  const results = {};
  for (const env of environments) {
    results[env.name] = TEST_PATHS.map((p) => {
      const info = curlInfo(env.base, p);
      const canonical = info.finalUrl ? fetchCanonical(info.finalUrl) : null;
      return {
        input: p,
        statusCode: info.statusCode,
        redirectUrl: info.redirectUrl || null,
        finalUrl: info.finalUrl || null,
        canonical,
        error: info.error,
      };
    });
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    testPaths: TEST_PATHS,
    results,
  };

  fs.writeFileSync(JSON_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`audit-url-normalization: wrote ${JSON_PATH}`);
}

run();
