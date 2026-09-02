#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PLATFORM_PATH = path.join(ROOT, 'data', 'platform', 'platform.json');
const QA_SUMMARY_PATH = path.join(ROOT, 'qa-summary.json');
const STYLE_PATH = path.join(ROOT, 'style.css');

const SKIP_DIRS = new Set(['node_modules', '.git', 'assets', 'scripts', 'templates', 'partials', 'data', 'mcps', 'terminals', 'agent-transcripts']);
const TARGET_H1_FILES = [
  'about/index.html',
  'methodology/index.html',
  'revisions/index.html',
  'qa/index.html',
  'qa/certification.html',
  'releases/index.html',
  'releases/compatibility.html',
];

function readJson(p, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtml(full, out);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Both upsert* functions below strip their own marker-delimited block with
// a regex that also consumes any whitespace immediately preceding
// markerStart -- the insertion side always adds that block as "\n" +
// markerStart + ... + markerEnd, so without also consuming that same
// leading "\n" on removal, every strip+reinsert cycle left one dangling
// blank line behind, growing without bound across builds (one of several
// instances of this same anti-pattern found sitewide -- see
// docs/PHASE-8A-TEMPLATE-INJECTOR-REMEDIATION.md).

function upsertBadgeAfterH1(filePath, badgeHtml) {
  if (!fs.existsSync(filePath)) return false;
  const html = fs.readFileSync(filePath, 'utf8');
  const markerStart = '<!-- platform-version-badge:start -->';
  const markerEnd = '<!-- platform-version-badge:end -->';
  let next = html.replace(new RegExp(`\\s*${markerStart}[\\s\\S]*?${markerEnd}`, 'g'), '');
  const h1Match = next.match(/<h1[^>]*>[\s\S]*?<\/h1>/i);
  if (!h1Match) return false;
  next = next.replace(h1Match[0], `${h1Match[0]}\n${markerStart}${badgeHtml}${markerEnd}`);
  if (next !== html) {
    fs.writeFileSync(filePath, next, 'utf8');
    return true;
  }
  return false;
}

function upsertFooterBadge(filePath, footerBadge) {
  const html = fs.readFileSync(filePath, 'utf8');
  if (!/<footer\b[^>]*class="site-footer/i.test(html)) return false;

  const markerStart = '<!-- platform-footer-badge:start -->';
  const markerEnd = '<!-- platform-footer-badge:end -->';
  let next = html.replace(new RegExp(`\\s*${markerStart}[\\s\\S]*?${markerEnd}`, 'g'), '');
  if (/<p[^>]*class="footer-note"[^>]*>[\s\S]*?<\/p>/i.test(next)) {
    next = next.replace(/<p[^>]*class="footer-note"[^>]*>[\s\S]*?<\/p>/i, (m) => `${m}\n${markerStart}${footerBadge}${markerEnd}`);
  } else if (/<footer\b[^>]*class="site-footer[^"]*"[^>]*>/i.test(next)) {
    next = next.replace(/<footer\b[^>]*class="site-footer[^"]*"[^>]*>/i, (m) => `${m}\n${markerStart}${footerBadge}${markerEnd}`);
  }
  if (next !== html) {
    fs.writeFileSync(filePath, next, 'utf8');
    return true;
  }
  return false;
}

function ensureBadgeStyles() {
  if (!fs.existsSync(STYLE_PATH)) return;
  const css = fs.readFileSync(STYLE_PATH, 'utf8');
  if (css.includes('.platform-version-badge')) return;
  const append = `

/* ── Platform semantic versioning badges ───────────────────────── */
.platform-version-badge{
  display:inline-flex;
  align-items:center;
  gap:.4rem;
  margin-top:.5rem;
  margin-bottom:.5rem;
  padding:.3rem .65rem;
  border:1px solid #c9d8ea;
  border-radius:999px;
  background:#f1f6fc;
  color:#244a73;
  font-size:.78rem;
  font-weight:600;
}
.platform-footer-version{
  margin-top:.35rem;
  font-size:.78rem;
  color:#5b6d80;
}`;
  fs.writeFileSync(STYLE_PATH, css + append, 'utf8');
}

function run() {
  const platform = readJson(PLATFORM_PATH, {});
  const qa = readJson(QA_SUMMARY_PATH, {});
  const p = platform.platform || {};
  const qaScore = qa.overallScore ?? p.qaScore ?? 'N/A';

  const platformBadge = `\n<div class="platform-version-badge">Platform v${esc(p.version)} ${esc(p.codename || '')} · QA ${esc(String(qaScore))}/100</div>\n`;
  const footerBadge = `\n<p class="platform-footer-version">Platform version: v${esc(p.version)}${p.codename ? ` (${esc(p.codename)})` : ''} · ${esc(p.status || 'Status Unknown')}</p>\n`;

  ensureBadgeStyles();

  let h1Updated = 0;
  TARGET_H1_FILES.forEach((rel) => {
    if (upsertBadgeAfterH1(path.join(ROOT, rel), platformBadge)) h1Updated++;
  });

  const allHtml = walkHtml(ROOT);
  let footerUpdated = 0;
  allHtml.forEach((file) => {
    if (upsertFooterBadge(file, footerBadge)) footerUpdated++;
  });

  console.log(`generate-version-badges: updated ${h1Updated} page header badge(s), ${footerUpdated} footer badge(s)`);
}

run();
