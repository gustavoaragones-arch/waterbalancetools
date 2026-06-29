#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SCRIPTS_DIR = path.join(ROOT, 'scripts');
const OUT_DIR = path.join(ROOT, 'audit', 'indexing-audit');
const JSON_PATH = path.join(OUT_DIR, 'generator-audit.json');
const REPORT_PATH = path.join(OUT_DIR, 'reports', 'generator-audit.md');

const TARGET_FILES = [
  'generate-academy.js',
  'generate-reference.js',
  'generate-navigation.js',
  'template-utils.js',
  'generate-entities.js',
  'generate-entity-pages.js',
  'generate-resource-pages.js',
  'generate-formulas.js',
  'generate-glossary.js',
  'generate-sitemaps.js',
];

function auditFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const checks = {
    relativeHrefPatterns: (src.match(/href\s*=\s*["']\.\.\//gi) || []).length + (src.match(/["']\.\.\//g) || []).length,
    duplicatedPathJoinHints: (src.match(/calculators\/calculators|legal\/guides|guides\/tools|tools\/charts/gi) || []).length,
    parentTraversal: (src.match(/\.\.\//g) || []).length,
    duplicateSlashes: (src.match(/\/{2,}/g) || []).filter((x) => x !== '//' && x !== '///').length,
    hardcodedHtmlLinks: (src.match(/href=["'][^"']*\.html/gi) || []).length + (src.match(/\.html["'`]/g) || []).length,
    hardcodedIndexHtml: (src.match(/index\.html/gi) || []).length,
  };
  return checks;
}

function gitHistoryProbe(pattern) {
  try {
    const cmd = `git log --all --oneline -S"${pattern}" -- scripts templates partials`;
    const out = execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
    const lines = out ? out.split('\n').slice(0, 20) : [];
    return lines;
  } catch (_) {
    return [];
  }
}

function run() {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const perFile = {};
  for (const rel of TARGET_FILES) {
    const full = path.join(SCRIPTS_DIR, rel);
    if (!fs.existsSync(full)) continue;
    perFile[rel] = auditFile(full);
  }

  const history = {
    'calculators/calculators/': gitHistoryProbe('calculators/calculators/'),
    'legal/guides/': gitHistoryProbe('legal/guides/'),
    'guides/tools/': gitHistoryProbe('guides/tools/'),
    'tools/charts/': gitHistoryProbe('tools/charts/'),
    'index.html links': gitHistoryProbe('index.html'),
  };

  const payload = {
    generatedAt: new Date().toISOString(),
    auditedGenerators: Object.keys(perFile).length,
    perFile,
    historyEvidence: history,
  };
  fs.writeFileSync(JSON_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  const lines = [];
  lines.push('# Generator URL Audit\n');
  lines.push(`- Generators audited: ${Object.keys(perFile).length}`);
  for (const [file, checks] of Object.entries(perFile)) {
    lines.push(`\n## ${file}`);
    lines.push(`- parent traversal ("../") occurrences: ${checks.parentTraversal}`);
    lines.push(`- relative href pattern hints: ${checks.relativeHrefPatterns}`);
    lines.push(`- duplicated path-join hints: ${checks.duplicatedPathJoinHints}`);
    lines.push(`- hardcoded .html link hints: ${checks.hardcodedHtmlLinks}`);
    lines.push(`- hardcoded index.html hints: ${checks.hardcodedIndexHtml}`);
  }
  lines.push('\n## Historical Pattern Probe');
  for (const [k, v] of Object.entries(history)) {
    lines.push(`\n### ${k}`);
    lines.push(v.length ? v.map((x) => `- ${x}`).join('\n') : '- No matching git history in probed scope');
  }
  fs.writeFileSync(REPORT_PATH, lines.join('\n') + '\n', 'utf8');
  console.log(`audit-generators: wrote ${JSON_PATH} and ${REPORT_PATH}`);
}

run();
