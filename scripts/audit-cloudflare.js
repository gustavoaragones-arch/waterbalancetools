#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'audit', 'indexing-audit');
const JSON_PATH = path.join(OUT_DIR, 'cloudflare-audit.json');
const REPORT_PATH = path.join(OUT_DIR, 'reports', 'cloudflare-audit.md');

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function run() {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });

  const redirectsPath = path.join(ROOT, '_redirects');
  const headersPath = path.join(ROOT, '_headers');
  const middlewarePath = path.join(ROOT, 'functions', '_middleware.js');

  const redirectRules = exists('_redirects')
    ? fs.readFileSync(redirectsPath, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean)
    : [];

  const hasAlwaysHttpsHint = redirectRules.some((r) => /http:\/\//i.test(r));

  const payload = {
    generatedAt: new Date().toISOString(),
    repositoryEvidence: {
      hasRedirectConfig: exists('_redirects'),
      hasHeadersConfig: exists('_headers'),
      hasMiddleware: exists('functions/_middleware.js'),
      redirectRuleCount: redirectRules.length,
      hasAlwaysHttpsHint,
    },
    dashboardOnlyChecks: [
      'Email Obfuscation',
      'Automatic HTTPS Rewrites',
      'Always Use HTTPS',
      'Trailing Slash setting',
      'Caching/Page Rules',
      'Custom 404 behavior in Cloudflare dashboard',
    ],
    limitations: [
      'Cloudflare dashboard settings are not available in repository-only audit.',
      'This audit confirms deploy artifacts and config files only.',
    ],
  };

  fs.writeFileSync(JSON_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  const md = `# Cloudflare Audit\n\n` +
    `## Repository-Visible Evidence\n\n` +
    `- _redirects present: ${payload.repositoryEvidence.hasRedirectConfig}\n` +
    `- _headers present: ${payload.repositoryEvidence.hasHeadersConfig}\n` +
    `- functions/_middleware.js present: ${payload.repositoryEvidence.hasMiddleware}\n` +
    `- Redirect rules counted: ${payload.repositoryEvidence.redirectRuleCount}\n` +
    `- Explicit HTTP->HTTPS rule hints in _redirects: ${payload.repositoryEvidence.hasAlwaysHttpsHint}\n\n` +
    `## Dashboard Settings Requiring Manual Verification\n\n` +
    payload.dashboardOnlyChecks.map((x) => `- ${x}`).join('\n') + '\n\n' +
    `## Confidence\n\n` +
    `- Repository findings: High\n` +
    `- Dashboard-only controls: Low (not available in repo)\n`;

  fs.writeFileSync(REPORT_PATH, md, 'utf8');
  console.log(`audit-cloudflare: wrote ${JSON_PATH} and ${REPORT_PATH}`);
}

run();
