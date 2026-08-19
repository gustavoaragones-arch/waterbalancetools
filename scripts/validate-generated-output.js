#!/usr/bin/env node
'use strict';
/**
 * validate-generated-output.js
 *
 * Build-time guard: scans the actual generated production HTML (not source
 * templates, not generator scripts) for unresolved template artifacts that
 * must never reach production:
 *
 *   - {{TOKEN}}                 unresolved mustache-style template token
 *   - <%= expr %>                unresolved EJS-style tag
 *   - [[TOKEN]]                  unresolved double-bracket placeholder
 *   - __PLACEHOLDER__            unresolved dunder placeholder (letter-bounded,
 *                                 so printable fill-in-the-blank lines of plain
 *                                 underscores are not flagged)
 *   - ${identifier}              unresolved JS template-literal interpolation
 *   - a JSON string value of literally "undefined" or "null" inside a
 *     <script type="application/ld+json"> block (Phase 7A found this pattern
 *     caused by a generator referencing a nonexistent data field)
 *
 * Exit code 1 (and a non-zero-exit-code report) if anything is found.
 * Exit code 0 if production output is clean.
 *
 * Run directly: node scripts/validate-generated-output.js
 * Or import { scanFile, scanAll } to reuse the detection logic in tests.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Directories that are NOT production output: template sources, includes,
// this tool's own reports, other tooling, and non-page assets.
const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', 'templates', 'partials', 'components',
  'scripts', 'data', 'js', 'public', 'lib', 'functions', 'docs',
  'reports', 'audit', '.claude',
]);

function walkHtmlFiles(dir, out) {
  out = out || [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full);
    if (entry.isDirectory()) {
      const topSeg = rel.split(path.sep)[0];
      if (EXCLUDE_DIRS.has(topSeg)) continue;
      walkHtmlFiles(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(rel);
    }
  }
  return out;
}

const PATTERNS = [
  { name: 'MUSTACHE_TOKEN', re: /\{\{[A-Za-z0-9_]+\}\}/g },
  { name: 'EJS_TAG', re: /<%=[\s\S]*?%>/g },
  { name: 'DOUBLE_BRACKET', re: /\[\[[A-Za-z0-9_]+\]\]/g },
  { name: 'DUNDER_PLACEHOLDER', re: /__[A-Z][A-Z0-9_]*[A-Z]__/g },
  { name: 'JS_TEMPLATE_LITERAL', re: /\$\{[A-Za-z_][A-Za-z0-9_.]*\}/g },
];

function lineAt(content, index) {
  const upTo = content.slice(0, index);
  const line = upTo.split('\n').length;
  const lineStart = upTo.lastIndexOf('\n') + 1;
  const lineEnd = content.indexOf('\n', index);
  const text = content.slice(lineStart, lineEnd === -1 ? content.length : lineEnd).trim();
  return { line, text: text.length > 160 ? text.slice(0, 160) + '…' : text };
}

function scanJsonLdForUndefinedNull(content) {
  const violations = [];
  const blocks = [...content.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const b of blocks) {
    const raw = b[1];
    // A value that is the literal *string* "undefined" or "null" only happens
    // when a JS value was string-concatenated/coerced before JSON encoding --
    // real JSON would encode an actual null as bare `null`, which is valid
    // JSON-LD and not flagged here.
    const stringLiteralRe = /"(?:[^"\\]|\\.)*"\s*:\s*"(undefined|null|NaN)"/g;
    let m;
    while ((m = stringLiteralRe.exec(raw))) {
      const idx = b.index + b[0].indexOf(raw) + m.index;
      const loc = lineAt(content, idx);
      violations.push({ token: `"${m[1]}"`, kind: 'JSON_LD_STRINGIFIED_' + m[1].toUpperCase(), ...loc });
    }
  }
  return violations;
}

function scanFile(relPath) {
  const content = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  const violations = [];

  for (const { name, re } of PATTERNS) {
    for (const m of content.matchAll(re)) {
      const loc = lineAt(content, m.index);
      violations.push({ token: m[0], kind: name, ...loc });
    }
  }
  violations.push(...scanJsonLdForUndefinedNull(content));

  return violations;
}

function scanAll() {
  const files = walkHtmlFiles(ROOT).sort();
  const results = [];
  for (const relPath of files) {
    const violations = scanFile(relPath);
    if (violations.length > 0) {
      results.push({ file: relPath, violations });
    }
  }
  return { files_scanned: files.length, files_with_violations: results.length, results };
}

function tokenCounts(scanResult) {
  const counts = {};
  for (const r of scanResult.results) {
    for (const v of r.violations) {
      counts[v.token] = (counts[v.token] || 0) + 1;
    }
  }
  return counts;
}

function printReport(scanResult) {
  const totalViolations = scanResult.results.reduce((s, r) => s + r.violations.length, 0);
  if (totalViolations === 0) {
    console.log(`validate-generated-output: PASS -- ${scanResult.files_scanned} production HTML files scanned, 0 unresolved template artifacts.`);
    return;
  }
  console.error(`validate-generated-output: FAIL -- ${totalViolations} unresolved template artifact(s) across ${scanResult.files_with_violations} file(s) (of ${scanResult.files_scanned} scanned).\n`);
  for (const r of scanResult.results) {
    for (const v of r.violations) {
      console.error('ERROR: Unresolved template artifact');
      console.error(`File: ${r.file}`);
      console.error(`Token: ${v.token} (${v.kind})`);
      console.error(`Line ${v.line}: ${v.text}`);
      console.error('');
    }
  }
  const counts = tokenCounts(scanResult);
  console.error('Token counts:', counts);
}

function main() {
  const scanResult = scanAll();
  printReport(scanResult);

  const outDir = path.join(ROOT, 'reports', 'phase-7b');
  fs.mkdirSync(outDir, { recursive: true });
  const totalViolations = scanResult.results.reduce((s, r) => s + r.violations.length, 0);
  fs.writeFileSync(
    path.join(outDir, 'generator-validation-results.json'),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      files_scanned: scanResult.files_scanned,
      files_with_violations: scanResult.files_with_violations,
      total_violations: totalViolations,
      token_counts: tokenCounts(scanResult),
      results: scanResult.results,
      status: totalViolations === 0 ? 'PASS' : 'FAIL',
    }, null, 2) + '\n'
  );

  if (totalViolations > 0) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = { scanFile, scanAll, walkHtmlFiles, tokenCounts, PATTERNS };
