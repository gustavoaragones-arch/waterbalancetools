#!/usr/bin/env node
'use strict';
/**
 * build-independent-old-audit.js (Phase 7D.2, Steps 7-8)
 *
 * Produces reports/phase-7d-2/INDEPENDENT-OLD-EXTRACTION-AUDIT.csv.
 *
 * INDEPENDENCE GUARANTEE: this script does NOT call extractFromSentence()
 * or any part of the new extraction pipeline. The classification and
 * independently_expected_parameter for every row were determined by a
 * human/AI auditor reading the actual source `claim` sentence directly
 * (see the JUDGMENTS data file this script consumes) -- never by asking
 * the new extractor what it thinks the answer is. This is what makes the
 * comparison against the old (Phase 7D) classifier's output non-circular,
 * unlike Phase 7D.1's build-sample-audit.js, which derived its
 * classification from whether the NEW extractor agreed with the old one.
 *
 * Sample construction (see /tmp/old_audit_sample.json build step,
 * reproduced in the methodology section of PHASE-7D-2-INDEPENDENT
 * -VALIDATION.md): stratified across every old-parameter bucket named in
 * Step 8 (ph, free_chlorine, total_alkalinity, calcium_hardness,
 * cyanuric_acid, water_temperature, salt, bromine, none), plus suspicious
 * -unit buckets (ppm/°F/gallons/oz-lbs values on ph-tagged rows -- directly
 * testing whether pH was acting as a false attractor), composite
 * sentences, safety statements, troubleshooting, and calculator-example
 * text.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const PRE_FIX = path.join(ROOT, 'reports', 'phase-7d-1', 'pre-fix-chemistry-claims.csv');
const OUT_DIR = path.join(ROOT, 'reports', 'phase-7d-2');

function parseCsv(text) {
  const lines = text.split('\n').filter((l) => l.length > 0);
  const header = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row = {};
    header.forEach((h, i) => { row[h] = cells[i] || ''; });
    return row;
  });
}
function splitCsvLine(line) {
  const out = []; let cur = ''; let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}
function toCsv(rows, fields) {
  const esc = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [fields.join(','), ...rows.map((r) => fields.map((f) => esc(r[f])).join(','))].join('\n') + '\n';
}

// JUDGMENTS: { idx: [classification, independently_expected_parameter, reason] }
const JUDGMENTS = require('./old-audit-judgments.json');

const preFix = parseCsv(fs.readFileSync(PRE_FIX, 'utf8'));

const rows = [];
for (const idxStr of Object.keys(JUDGMENTS)) {
  const idx = Number(idxStr);
  const oldRow = preFix[idx];
  if (!oldRow) { console.error(`Missing pre-fix row for idx ${idx}`); continue; }
  const [classification, expectedParam, reason] = JUDGMENTS[idxStr];
  rows.push({
    record_id: `old-audit-${String(idx).padStart(4, '0')}`,
    source_file: oldRow.url,
    source_sentence: oldRow.claim,
    old_parameter: oldRow.parameter,
    independently_expected_parameter: expectedParam,
    old_value_if_available: '(old system has no value/unit columns -- topic-level tag only, see PHASE-7D-2 methodology)',
    independently_expected_value: '',
    old_unit_if_available: '',
    independently_expected_unit: '',
    classification,
    reason,
  });
}

rows.sort((a, b) => a.record_id.localeCompare(b.record_id));

const FIELDS = ['record_id', 'source_file', 'source_sentence', 'old_parameter', 'independently_expected_parameter',
  'old_value_if_available', 'independently_expected_value', 'old_unit_if_available', 'independently_expected_unit',
  'classification', 'reason'];

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'INDEPENDENT-OLD-EXTRACTION-AUDIT.csv'), toCsv(rows, FIELDS));

const summary = {};
for (const r of rows) summary[r.classification] = (summary[r.classification] || 0) + 1;
console.log(`build-independent-old-audit: ${rows.length} records written to INDEPENDENT-OLD-EXTRACTION-AUDIT.csv`);
console.log('Classification summary:', summary);
fs.writeFileSync(path.join(OUT_DIR, 'independent-old-audit-summary.json'), JSON.stringify({ total: rows.length, summary }, null, 2) + '\n');
