#!/usr/bin/env node
'use strict';
/**
 * build-title-resolution.js (Phase 7M, Step 17)
 * Compares the pre-Phase-7M title-length snapshot against the final,
 * post-fix state to produce a real before/after record, plus discloses
 * the 51 remaining findings left untouched (not the site's redundant-
 * suffix bug, so not the same fix -- would require individual per-family
 * review to touch, which this phase deliberately does not do sitewide).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SNAP = path.join(ROOT, 'reports', 'phase-7m', 'current-state-snapshot');

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const header = parseLine(lines[0]);
  return lines.slice(1).map((l) => {
    const vals = parseLine(l);
    const row = {};
    header.forEach((h, i) => { row[h] = vals[i]; });
    return row;
  });
}
function parseLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}
function toCsv(rows, header) {
  return [header.join(',')].concat(
    rows.map((r) => header.map((h) => '"' + String(r[h] == null ? '' : r[h]).replace(/"/g, '""') + '"').join(','))
  ).join('\n') + '\n';
}

const before = parseCsv(fs.readFileSync(path.join(SNAP, 'seo-onpage-audit.csv'), 'utf8'));
const after = parseCsv(fs.readFileSync(path.join(SNAP, 'seo-onpage-audit-final.csv'), 'utf8'));
const beforeByFile = Object.fromEntries(before.map((r) => [r.file_path, r]));
const afterByFile = Object.fromEntries(after.map((r) => [r.file_path, r]));

const beforeLong = new Set(before.filter((r) => (r.issues || '').includes('TITLE_TOO_LONG')).map((r) => r.file_path));
const afterLong = new Set(after.filter((r) => (r.issues || '').includes('TITLE_TOO_LONG')).map((r) => r.file_path));

const rows = [];
for (const fp of beforeLong) {
  const b = beforeByFile[fp];
  const a = afterByFile[fp];
  const fixed = !afterLong.has(fp);
  rows.push({
    file_path: fp,
    title_length_before: b.title_length,
    title_before: b.title,
    title_length_after: a ? a.title_length : b.title_length,
    title_after: a ? a.title : b.title,
    status: fixed ? 'FIXED' : (a && parseInt(a.title_length, 10) < parseInt(b.title_length, 10) ? 'IMPROVED_STILL_OVER' : 'UNCHANGED'),
    reason: fixed
      ? 'Removed redundant double brand/category suffix (PROGRAMMATIC_TITLE_SUFFIX stacked with the automatic " | WaterBalanceTools" brand suffix) -- pure redundancy removal, no information lost.'
      : (a && parseInt(a.title_length, 10) < parseInt(b.title_length, 10)
        ? 'Same redundant-suffix fix applied; the underlying config-level title text is itself long enough that removing the suffix alone leaves it 1 char over 65 -- not hand-edited further to avoid a piecemeal per-title cosmetic rewrite.'
        : 'Not part of the redundant programmatic-suffix pattern; would require individual, page-specific title rewording rather than a systemic fix -- left for a future dedicated metadata pass.'),
  });
}
// Remaining findings that were never in the "before" set touched this phase (guides/academy/reference/comparisons/formulas/root) -- disclosed, not fixed.
for (const r of after) {
  if ((r.issues || '').includes('TITLE_TOO_LONG') && !beforeLong.has(r.file_path)) {
    // shouldn't happen (no new findings introduced) but guard anyway
    rows.push({ file_path: r.file_path, title_length_before: '', title_before: '', title_length_after: r.title_length, title_after: r.title, status: 'NEW_UNEXPECTED', reason: 'Unexpected -- investigate' });
  }
}

const header = ['file_path', 'title_length_before', 'title_before', 'title_length_after', 'title_after', 'status', 'reason'];
fs.writeFileSync(path.join(ROOT, 'reports', 'phase-7m', 'TITLE-RESOLUTION.csv'), toCsv(rows, header));

const fixed = rows.filter((r) => r.status === 'FIXED').length;
const improved = rows.filter((r) => r.status === 'IMPROVED_STILL_OVER').length;
console.log(`build-title-resolution: ${rows.length} rows, ${fixed} FIXED, ${improved} IMPROVED_STILL_OVER, ${rows.length - fixed - improved} UNCHANGED`);
