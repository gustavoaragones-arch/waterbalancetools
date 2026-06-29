#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const TARGET_FILES = [
  'scripts/template-utils.js',
  'scripts/url-utils.js',
  'scripts/generate-academy.js',
  'scripts/generate-reference.js',
  'scripts/generate-formulas.js',
  'scripts/generate-glossary.js',
  'scripts/generate-entities.js',
  'scripts/generate-entity-pages.js',
  'scripts/generate-navigation.js',
  'scripts/generate-breadcrumbs.js',
  'scripts/generate-search-index.js',
  'scripts/generate-sitemaps.js',
  'scripts/generate-resource-pages.js',
  'scripts/generate-release.js',
  'scripts/generate-version-badges.js',
  'scripts/generate-compatibility.js',
  'scripts/generate-qa-report.js',
  'scripts/inject-nav.js',
  'scripts/inject-trust-panels.js',
  'scripts/inject-entity-schema.js',
  'scripts/generate-question-pages.js',
  'scripts/generate-comparison-pages.js',
  'scripts/generate-pool-system-hub.js',
  'scripts/generate-hub-pages.js',
  'scripts/generate-tools-index.js',
  'scripts/generate-hubs.js',
  'scripts/validate-hubs.js',
  'scripts/generate-indexing.js',
  'scripts/generate-link-weights.js',
  'scripts/generate-freshness.js',
  'scripts/generate-priority.js',
  'scripts/audit-crawl-depth.js',
  'scripts/audit-authority.js',
  'scripts/audit-indexing.js',
  'scripts/generate-google-dashboard.js',
  'scripts/validate-indexing.js',
];

const FORBIDDEN_PATTERNS = [
  { key: 'html-href', re: /<a[^>]+href=["'`][^"'`]*\.html(?:[?#][^"'`]*)?["'`]/i, msg: 'Contains .html href output' },
  { key: 'index-href', re: /<a[^>]+href=["'`][^"'`]*index\.html(?:[?#][^"'`]*)?["'`]/i, msg: 'Contains index.html href output' },
  { key: 'relative-href', re: /<a[^>]+href=["'`](?:\.\.\/|\.\/)/i, msg: 'Contains relative href output' },
  { key: 'manual-normalize-html', re: /replace\(\s*\/\\?\.html/i, msg: 'Contains manual .html normalization' },
  { key: 'manual-normalize-index', re: /replace\(\s*\/\\?\/index\.html/i, msg: 'Contains manual index.html normalization' },
  { key: 'manual-collapse-slash', re: /replace\(\s*\/\\?\/\{2,/i, msg: 'Contains manual duplicate slash normalization' },
];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function supportsUrlEngine(content) {
  return /url-engine/.test(content) ||
    /require\(['"]\.\/template-utils['"]\)/.test(content) && /\b(href|buildUrl|canonicalUrl|absoluteUrl|sitemapUrl|joinUrl)\b/.test(content);
}

function hasUrlConstruction(content) {
  return /<a[^>]+href=|link rel="canonical"|canonicalUrl\(|sitemapUrl\(|absoluteUrl\(/.test(content);
}

const errors = [];
const warnings = [];
let usingUrlEngine = 0;

for (const rel of TARGET_FILES) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    warnings.push(`${rel}: file not found (skipped)`);
    continue;
  }
  const content = read(rel);
  if (!hasUrlConstruction(content)) continue;
  if (supportsUrlEngine(content)) usingUrlEngine++;
  else errors.push(`${rel}: does not consume url-engine (directly or via template-utils helpers)`);

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.re.test(content)) {
      errors.push(`${rel}: ${pattern.msg}`);
    }
  }
}

if (errors.length) {
  console.error('URL engine usage audit failed:');
  errors.forEach((e) => console.error(`- ${e}`));
  if (warnings.length) warnings.forEach((w) => console.error(`- WARN: ${w}`));
  process.exit(1);
}

console.log(`PASS: URL engine usage audit (${TARGET_FILES.length} target files, ${usingUrlEngine} using URL engine).`);
if (warnings.length) warnings.forEach((w) => console.log(`WARN: ${w}`));
