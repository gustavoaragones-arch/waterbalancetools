#!/usr/bin/env node
'use strict';
/**
 * reconcile-claims-v2.js (Phase 7D.1, Steps 12-16)
 *
 * Re-runs the full 3,933-claim reconciliation using the corrected,
 * proximity-based extractor (extract-claims-v2.js), and keeps
 * extraction_status and scientific_review_status as two independent
 * dimensions (Step 15/16) instead of collapsing them:
 *
 *   extraction_status          -- did the extractor correctly identify
 *                                 WHAT was measured (parameter/value/unit)?
 *                                 CORRECT_EXTRACTION | CARRIED_CONTEXT |
 *                                 IMPOSSIBLE_MAPPING | NO_PARAMETER_IN_CLAUSE
 *   scientific_review_status   -- given a correct extraction, is the VALUE
 *                                 itself scientifically supported? Uses the
 *                                 same vocabulary as Phase 7D's original
 *                                 chemistry-coverage.csv: SUPPORTED |
 *                                 CONTEXTUAL | REQUIRES_REVIEW | AMBIGUOUS
 *                                 (never VERIFIED/UNSUPPORTED by this
 *                                 automated pass -- see chemistry-claims.js
 *                                 header). A claim whose extraction_status
 *                                 is not CORRECT_EXTRACTION or
 *                                 CARRIED_CONTEXT is never scientifically
 *                                 evaluated at all (scientific_review_status
 *                                 = "NOT_EXTRACTED") -- a bad extraction
 *                                 must never silently inherit a science
 *                                 verdict for a value it didn't actually
 *                                 identify correctly.
 */
const fs = require('fs');
const path = require('path');
const { extractFromSentence } = require('./extract-claims-v2');
const { RANGES } = require('../data/chemistry-ranges');

const ROOT = path.join(__dirname, '..', '..');
const IN_FILE = path.join(ROOT, 'reports', 'phase-7a', 'chemical-claims.csv');
// Phase 7D.2 Step 13: output goes to reports/phase-7d-2/ under -v2 filenames
// so the original Phase 7D.1 evidence (reports/phase-7d-1/post-fix-chemistry-claims.csv)
// is never overwritten.
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

function scientificReviewStatus(rec) {
  if (rec.parameter_id === null) return 'NOT_EXTRACTED';
  const candidates = RANGES.filter((r) => r.parameter_id === rec.parameter_id
    && (rec.environment === 'unspecified' || rec.environment === 'both' || r.environment === rec.environment));
  for (const r of candidates) {
    if (r.minimum === null || r.maximum === null) continue;
    const overlaps = rec.minimum <= r.maximum && rec.maximum >= r.minimum;
    if (overlaps) {
      if (r.status === 'SUPPORTED' || r.status === 'VERIFIED') return 'SUPPORTED';
      if (r.status === 'CONTEXTUAL') return 'CONTEXTUAL';
      return 'REQUIRES_REVIEW';
    }
  }
  if (candidates.length > 0) return 'REQUIRES_REVIEW'; // non-overlapping candidate exists -> potential contradiction, needs a human
  return 'AMBIGUOUS'; // no canonical range for this parameter/context yet
}

function run() {
const raw = fs.readFileSync(IN_FILE, 'utf8');
const claims = parseCsv(raw);

const rows = [];
for (let i = 0; i < claims.length; i++) {
  const claim = claims[i];
  const extracted = extractFromSentence(claim.claim);
  if (extracted.length === 0) {
    rows.push({
      claim_index: i, url: claim.url, claim: claim.claim,
      parameter: '(none)', minimum: '', maximum: '', unit: '', environment: '',
      extraction_status: 'NO_NUMERIC_CONTENT',
      // Phase 7D.2 Step 6 fix: a claim with no extractable numeric content
      // was never scientifically evaluated, so it must never receive a
      // scientific-review verdict such as AMBIGUOUS (which itself IS a
      // scientific-review outcome). NOT_EXTRACTED is the correct status --
      // matches the invariant enforced by validate-chemistry-status-integrity.js.
      scientific_review_status: 'NOT_EXTRACTED',
      notes: 'No numeric chemistry value found in this claim (editorial/non-numeric text).',
    });
    continue;
  }
  for (const rec of extracted) {
    const scientific = (rec.extraction_status === 'CORRECT_EXTRACTION' || rec.extraction_status === 'CARRIED_CONTEXT')
      ? scientificReviewStatus(rec)
      : 'NOT_EXTRACTED';
    rows.push({
      claim_index: i, url: claim.url, claim: claim.claim,
      parameter: rec.parameter_id || '(none)',
      minimum: rec.minimum, maximum: rec.maximum, unit: rec.unit, environment: rec.environment,
      extraction_status: rec.extraction_status,
      scientific_review_status: scientific,
      notes: rec.extraction_status === 'IMPOSSIBLE_MAPPING' ? `Rejected: ${rec.parameter_id || 'unknown'} does not accept a ${rec.value_type} value -- likely extraction noise, not a real claim about this parameter.` : '',
    });
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const FIELDS = ['claim_index', 'url', 'claim', 'parameter', 'minimum', 'maximum', 'unit', 'environment', 'extraction_status', 'scientific_review_status', 'notes'];
fs.writeFileSync(path.join(OUT_DIR, 'post-fix-chemistry-claims-v2.csv'), toCsv(rows, FIELDS));

const extractionSummary = {};
const scientificSummary = {};
for (const r of rows) {
  extractionSummary[r.extraction_status] = (extractionSummary[r.extraction_status] || 0) + 1;
  scientificSummary[r.scientific_review_status] = (scientificSummary[r.scientific_review_status] || 0) + 1;
}
fs.writeFileSync(path.join(OUT_DIR, 'post-fix-chemistry-claims-v2-summary.json'), JSON.stringify({
  source_claims: claims.length,
  extraction_records: rows.length,
  extraction_status_summary: extractionSummary,
  scientific_review_status_summary: scientificSummary,
}, null, 2) + '\n');

console.log(`reconcile-claims-v2: ${claims.length} source claims -> ${rows.length} extraction records.`);
console.log('extraction_status:', extractionSummary);
console.log('scientific_review_status:', scientificSummary);
}

if (require.main === module) run();

// Phase 7D.3: exported so the evidence-dataset rebuild reuses the exact
// same scientific-review classification logic and CSV parsing rather than
// re-implementing a second copy of it.
module.exports = { run, scientificReviewStatus, parseCsv, splitCsvLine, toCsv };
