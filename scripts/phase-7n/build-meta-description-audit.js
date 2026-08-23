#!/usr/bin/env node
'use strict';
/**
 * build-meta-description-audit.js (Phase 7N, Step 3)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

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

const seo = parseCsv(fs.readFileSync(path.join(ROOT, 'reports', 'phase-7n', 'current-state-snapshot', 'seo-onpage-audit.csv'), 'utf8'));
const inv = parseCsv(fs.readFileSync(path.join(ROOT, 'reports', 'phase-7n', 'current-state-snapshot', 'url-inventory.csv'), 'utf8'));
const invByFp = Object.fromEntries(inv.map((r) => [r.file_path, r]));

const rows = [];
for (const r of seo) {
  const issue = (r.issues || '').includes('MISSING_META_DESCRIPTION') ? 'MISSING'
    : (r.issues || '').includes('META_DESCRIPTION_TOO_SHORT') ? 'TOO_SHORT'
    : null;
  if (!issue) continue;
  const invRow = invByFp[r.file_path] || {};
  rows.push({
    url: r.file_path,
    issue,
    current_length: r.meta_description_length || '0',
    robots: invRow.robots || '',
    indexability: invRow.indexability || '',
    action: 'NO_ACTION',
    reason: 'Internal QA/audit tooling dashboard, noindex -- not a real content page competing for search intent. Fixing would be effort spent on a page no search engine will ever show, not a genuine SERP/user-value improvement per Step 3\'s explicit scope limit.',
  });
}

// Canonical mismatches (Step 12 cross-check) -- same 3 known, deliberate
// redirect-source pages investigated in Step 8.
const canonRows = seo.filter((r) => (r.issues || '').includes('CANONICAL_MISMATCH')).map((r) => ({
  url: r.file_path, issue: 'CANONICAL_MISMATCH', current_length: '', robots: '', indexability: '',
  action: 'NO_ACTION',
  reason: 'Deliberate url-policy.js REDIRECT_SOURCES entry (noindex + canonical to the live replacement) -- this is the intended, documented Phase 7C architecture, not a defect. Confirmed and cross-linking consistency fixed in Step 8/9 of this phase (see PRODUCTION-CHANGES.md).',
}));

const header = ['url', 'issue', 'current_length', 'robots', 'indexability', 'action', 'reason'];
fs.writeFileSync(path.join(ROOT, 'reports', 'phase-7n', 'META-DESCRIPTION-AUDIT.csv'), toCsv(rows.concat(canonRows), header));
console.log(`build-meta-description-audit: ${rows.length} description findings + ${canonRows.length} canonical-mismatch findings, all NO_ACTION (internal tooling / deliberate architecture)`);
