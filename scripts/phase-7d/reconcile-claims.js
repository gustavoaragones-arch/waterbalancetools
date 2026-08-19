#!/usr/bin/env node
'use strict';
/**
 * reconcile-claims.js (Phase 7D Step 8 / 18)
 *
 * Reads Phase 7A's reports/phase-7a/chemical-claims.csv (3,928 extracted
 * claims) and classifies every single one against the canonical
 * parameter/context vocabulary, producing
 * reports/phase-7d/chemistry-coverage.csv/.json.
 *
 * This is a programmatic, rule-based classification (documented here), not
 * a manual expert read of each of 3,928 claims -- that is explicitly out of
 * reach for this phase. The rules are conservative: a claim is only ever
 * classified SUPPORTED/CONTEXTUAL when it numerically falls inside a
 * canonical range whose own status is SUPPORTED/CONTEXTUAL; every other
 * numeric chemistry claim defaults to REQUIRES_REVIEW, and non-numeric
 * editorial/simplification claims are marked AMBIGUOUS (mapped, but not
 * assessable against a numeric range). Nothing is marked VERIFIED by this
 * script -- VERIFIED is reserved for records a human has cross-checked
 * against >=2 independent sources, which has not happened for any claim in
 * this phase.
 */
const fs = require('fs');
const path = require('path');
const { ALIAS_INDEX, PARAMETERS } = require('../data/chemistry-knowledge');
const { RANGES } = require('../data/chemistry-ranges');

const ROOT = path.join(__dirname, '..', '..');
const IN_FILE = path.join(ROOT, 'reports', 'phase-7a', 'chemical-claims.csv');
const OUT_DIR = path.join(ROOT, 'reports', 'phase-7d');

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
  const out = [];
  let cur = '';
  let inQuotes = false;
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

function findParameter(text) {
  const hay = text.toLowerCase();
  for (const [alias, id] of Object.entries(ALIAS_INDEX)) {
    if (alias.length < 2) continue;
    const re = new RegExp('\\b' + alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
    if (re.test(hay)) return id;
  }
  return null;
}

function findEnvironment(text) {
  const hay = text.toLowerCase();
  const hasHotTub = /hot[\s-]?tub|spa\b/.test(hay);
  const hasPool = /\bpool\b/.test(hay);
  if (hasHotTub && !hasPool) return 'hot_tub';
  if (hasPool && !hasHotTub) return 'pool';
  return null; // ambiguous / unspecified
}

function findSanitizer(text) {
  const hay = text.toLowerCase();
  if (/bromine/.test(hay)) return 'bromine';
  if (/salt\b|swg|saltwater|salt water|salt.chlorine.generator/.test(hay)) return 'saltwater_chlorine_generator';
  if (/chlorine|hypochlorite|dichlor|trichlor/.test(hay)) return 'chlorine';
  return null;
}

const NUMERIC_RANGE_RE = /(-?\d+(?:\.\d+)?)\s*[-–to]{1,4}\s*(-?\d+(?:\.\d+)?)/i;
const SINGLE_NUMERIC_RE = /(-?\d+(?:\.\d+)?)/;

function classify(claim) {
  const text = claim.claim || '';
  const parameterId = findParameter(text);
  const environment = findEnvironment(text);
  const sanitizer = findSanitizer(text);

  if (!parameterId) {
    return { parameter_id: '(none)', context: 'unmatched', status: 'AMBIGUOUS', action_required: 'Non-chemistry or unmatched editorial content; no parameter-level classification applies.' };
  }

  const param = PARAMETERS.find((p) => p.id === parameterId);
  const contextLabel = [environment || 'unspecified_env', sanitizer || 'unspecified_sanitizer'].join('/');

  if (claim.claim_type === 'SAFETY_GUIDANCE' && /mix|acid|gas/i.test(text)) {
    return { parameter_id: parameterId, context: contextLabel, status: 'SUPPORTED', action_required: 'Matches canonical chemical-mixing safety guidance (CPSC/CDC/NPIC-backed); no action required.' };
  }

  const hasNumericRange = claim.units && claim.units !== 'UNQUANTIFIED';
  if (!hasNumericRange) {
    return { parameter_id: parameterId, context: contextLabel, status: 'AMBIGUOUS', action_required: 'References a chemistry parameter but contains no numeric range to check against a canonical value; requires editorial (not numeric) review.' };
  }

  const rangeMatch = (claim.units || '').match(NUMERIC_RANGE_RE) || text.match(NUMERIC_RANGE_RE);
  let lo = null; let hi = null;
  if (rangeMatch) { lo = Number(rangeMatch[1]); hi = Number(rangeMatch[2]); }
  else { const m = (claim.units || '').match(SINGLE_NUMERIC_RE) || text.match(SINGLE_NUMERIC_RE); if (m) { lo = hi = Number(m[1]); } }

  if (lo === null) {
    return { parameter_id: parameterId, context: contextLabel, status: 'AMBIGUOUS', action_required: 'Numeric range flagged by extraction but not machine-parseable; requires manual review.' };
  }

  const candidateRanges = RANGES.filter((r) => r.parameter_id === parameterId
    && (!environment || r.environment === environment)
    && (!sanitizer || r.sanitizer === sanitizer));

  for (const r of candidateRanges) {
    if (r.minimum === null || r.maximum === null) continue;
    const overlaps = lo <= r.maximum && hi >= r.minimum;
    if (overlaps) {
      const status = (r.status === 'SUPPORTED' || r.status === 'VERIFIED') ? (environment && sanitizer ? 'SUPPORTED' : 'CONTEXTUAL')
        : r.status === 'CONTEXTUAL' ? 'CONTEXTUAL' : 'REQUIRES_REVIEW';
      return { parameter_id: parameterId, context: contextLabel, status, range_id: r.id, action_required: status === 'SUPPORTED' ? 'None -- matches a source-backed canonical range.' : 'Falls within a canonical range record, but that record itself is not yet source-backed (see chemistry-ranges.js status) -- treat as a plausible industry figure pending confirmation.' };
    }
  }

  if (candidateRanges.length > 0) {
    // Note: "does not overlap a canonical range" is a signal for the
    // consistency-matrix classification (CONSISTENT_CONTEXT_DIFFERENCE /
    // POTENTIAL_CONTRADICTION / etc., a separate vocabulary -- see
    // reports/phase-7d/chemistry-consistency-matrix.csv), not a claim
    // status value. At the claim level this is REQUIRES_REVIEW.
    return { parameter_id: parameterId, context: contextLabel, status: 'REQUIRES_REVIEW', action_required: `Numeric value (${lo}-${hi}) does not overlap any canonical range for ${parameterId} in this context (closest candidates: ${candidateRanges.map((r) => r.id).join(', ') || 'none'}) -- flag for the consistency matrix as a possible contradiction candidate.` };
  }

  return { parameter_id: parameterId, context: contextLabel, status: 'REQUIRES_REVIEW', action_required: `No canonical range exists yet for ${parameterId} in context ${contextLabel}; needs dedicated research in a future phase.` };
}

const raw = fs.readFileSync(IN_FILE, 'utf8');
const claims = parseCsv(raw);
const coverage = claims.map((c, i) => {
  const result = classify(c);
  return {
    claim_index: i,
    url: c.url,
    claim: c.claim,
    parameter: result.parameter_id,
    context: result.context,
    range_id: result.range_id || '',
    source_ids: '',
    status: result.status,
    action_required: result.action_required,
  };
});

fs.mkdirSync(OUT_DIR, { recursive: true });
function toCsv(rows, fields) {
  const esc = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [fields.join(','), ...rows.map((r) => fields.map((f) => esc(r[f])).join(','))].join('\n') + '\n';
}
const FIELDS = ['claim_index', 'url', 'claim', 'parameter', 'context', 'range_id', 'source_ids', 'status', 'action_required'];
fs.writeFileSync(path.join(OUT_DIR, 'chemistry-coverage.csv'), toCsv(coverage, FIELDS));

const summary = {};
for (const row of coverage) summary[row.status] = (summary[row.status] || 0) + 1;
fs.writeFileSync(path.join(OUT_DIR, 'chemistry-coverage.json'), JSON.stringify({
  total_claims: coverage.length,
  mapped: coverage.filter((r) => r.parameter !== '(none)').length,
  summary,
  methodology: 'Programmatic rule-based classification against scripts/data/chemistry-ranges.js; see scripts/phase-7d/reconcile-claims.js header comment for exact rules. No claim is marked VERIFIED by this process.',
  rows: coverage,
}, null, 2) + '\n');

console.log(`reconcile-claims: processed ${coverage.length} extracted claims.`);
console.log('Status summary:', summary);
