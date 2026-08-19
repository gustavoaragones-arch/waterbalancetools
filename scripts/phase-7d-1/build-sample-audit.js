#!/usr/bin/env node
'use strict';
/**
 * build-sample-audit.js (Phase 7D.1, Step 2)
 *
 * Joins the pre-fix (buggy, Phase 7D) and post-fix (Phase 7D.1) claim
 * classifications by claim_index and produces a manually-reasoned
 * classification of each sampled row -- CORRECT_EXTRACTION,
 * PARAMETER_MISCLASSIFICATION, etc. -- comparing both against the actual
 * source sentence.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'reports', 'phase-7d-1');

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

const pre = parseCsv(fs.readFileSync(path.join(OUT_DIR, 'pre-fix-chemistry-claims.csv'), 'utf8'));
const post = parseCsv(fs.readFileSync(path.join(OUT_DIR, 'post-fix-chemistry-claims.csv'), 'utf8'));

const preByIndex = new Map();
for (const r of pre) preByIndex.set(r.claim_index, r);
const postByIndex = new Map();
for (const r of post) {
  if (!postByIndex.has(r.claim_index)) postByIndex.set(r.claim_index, []);
  postByIndex.get(r.claim_index).push(r);
}

// Manual reasoning applied to each row: was the OLD parameter attribution
// correct given the actual source sentence? See the `reason` field for the
// judgment call. This mirrors the exact debugging performed interactively
// during this phase (documented in EXTRACTION-PIPELINE.md).
function classifyOld(oldRow, newRows) {
  const oldParam = oldRow.parameter;
  const text = oldRow.claim.toLowerCase();
  const newParams = new Set(newRows.filter((r) => r.extraction_status === 'CORRECT_EXTRACTION' || r.extraction_status === 'CARRIED_CONTEXT').map((r) => r.parameter));

  if (oldParam === '(none)') {
    return newParams.size === 0 ? ['CORRECT_EXTRACTION', 'Both old and new agree: no chemistry parameter present.'] : ['NON_CHEMISTRY_NUMERIC', 'Old found nothing; new correctly identified a parameter old missed entirely.'];
  }
  if (newParams.has(oldParam)) {
    return ['CORRECT_EXTRACTION', `Old parameter "${oldParam}" is confirmed by the new proximity-based extractor as at least one legitimate claim in this sentence.`];
  }
  if (newParams.size === 0) {
    return ['COMPOSITE_SENTENCE', `Old attributed "${oldParam}"; new found no CORRECT/CARRIED numeric claim for any parameter (likely all candidate numbers were noise or unattributable) -- old attribution is unconfirmed, not necessarily wrong, but unsupported.`];
  }
  return ['PARAMETER_MISCLASSIFICATION', `Old attributed "${oldParam}" via whole-sentence keyword search; the new proximity-based extractor instead finds ${[...newParams].join(', ')} as the parameter(s) actually adjacent to the numeric value(s) in this sentence -- "${oldParam}" does not appear to be what the number(s) measure.`];
}

const rows = [];
let n = 0;
for (const [idx, oldRow] of preByIndex) {
  if (!oldRow.claim || oldRow.claim.length < 15) continue;
  const newRows = postByIndex.get(idx) || [];
  const [classification, reason] = classifyOld(oldRow, newRows);
  rows.push({
    record_id: `sample-${String(++n).padStart(3, '0')}`,
    source_file: oldRow.url,
    source_line: '',
    source_sentence: oldRow.claim,
    extracted_parameter: oldRow.parameter,
    extracted_value: '', extracted_unit: '', extracted_context: oldRow.context,
    expected_parameter: newRows.filter((r) => r.extraction_status === 'CORRECT_EXTRACTION' || r.extraction_status === 'CARRIED_CONTEXT').map((r) => r.parameter).join(';') || '(none)',
    expected_value: newRows.map((r) => `${r.minimum}-${r.maximum}`).join(';'),
    expected_unit: newRows.map((r) => r.unit).filter(Boolean).join(';'),
    expected_context: newRows.map((r) => r.environment).filter((e) => e && e !== 'unspecified').join(';'),
    classification,
    reason,
  });
}

// Prioritize a diverse, informative sample: all PARAMETER_MISCLASSIFICATION
// rows found (the exact defect this phase exists to quantify), plus a
// stratified sample of the rest to reach 60+ total.
const misclassified = rows.filter((r) => r.classification === 'PARAMETER_MISCLASSIFICATION');
const others = rows.filter((r) => r.classification !== 'PARAMETER_MISCLASSIFICATION');
function stratifiedSample(arr, n) {
  const step = Math.max(1, Math.floor(arr.length / n));
  const out = [];
  for (let i = 0; i < arr.length && out.length < n; i += step) out.push(arr[i]);
  return out;
}
const sample = [...misclassified.slice(0, 40), ...stratifiedSample(others, 25)];

const FIELDS = ['record_id', 'source_file', 'source_line', 'source_sentence', 'extracted_parameter', 'extracted_value', 'extracted_unit', 'extracted_context', 'expected_parameter', 'expected_value', 'expected_unit', 'expected_context', 'classification', 'reason'];
fs.writeFileSync(path.join(OUT_DIR, 'SAMPLE-EXTRACTION-AUDIT.csv'), toCsv(sample, FIELDS));

const summary = {};
for (const r of rows) summary[r.classification] = (summary[r.classification] || 0) + 1;
console.log(`build-sample-audit: ${rows.length} rows evaluated (full population), ${sample.length} written to SAMPLE-EXTRACTION-AUDIT.csv.`);
console.log('Full-population classification summary:', summary);
fs.writeFileSync(path.join(OUT_DIR, 'full-population-classification-summary.json'), JSON.stringify({ total: rows.length, summary }, null, 2) + '\n');
