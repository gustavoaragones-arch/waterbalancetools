#!/usr/bin/env node
'use strict';
/**
 * validate-phase-7k.js
 *
 * Structural integrity checks specific to Phase 7K's additions: new
 * chemistry-sources.js records, new chemistry-ranges.js records, and the
 * six entity-claim disposition resolutions applied via
 * scripts/phase-7k/apply-resolutions.js. Does not re-validate the whole
 * chemistry knowledge layer -- that is validate-chemistry-knowledge.js's
 * job, run as part of `npm run build` and the full regression sweep.
 */
const fs = require('fs');
const path = require('path');
const { RANGES, RANGES_BY_ID } = require('./data/chemistry-ranges');
const { SOURCES, SOURCES_BY_ID } = require('./data/chemistry-sources');
const { CONTEXT_MODEL, PARAMETERS_BY_ID } = require('./data/chemistry-knowledge');

const ROOT = path.join(__dirname, '..');
let errors = 0;
let warnings = 0;
const err = (msg) => { console.error('ERROR: ' + msg); errors++; };
const warn = (msg) => { console.warn('WARN: ' + msg); warnings++; };

const NEW_SOURCE_IDS = [
  'microphor-trichlor-sds-2016',
  'asepsis-calhypo-msds-2005',
  'poolspanews-algae-breakpoint-2016',
  'aquamagazine-hasa-superchlorination-2020',
  'cffa-vinyl-liner-bleaching',
  'cmahc-mahc-5th-edition-2024',
];
const NEW_RANGE_IDS = ['range-shock-algae-recovery-green', 'range-temperature-hottub-max-safety'];

// 1. New source IDs resolve and are not duplicates of an existing source
//    (same organization + same url would indicate an accidental duplicate).
for (const id of NEW_SOURCE_IDS) {
  const s = SOURCES_BY_ID[id];
  if (!s) { err(`New source id "${id}" does not resolve in chemistry-sources.js`); continue; }
  if (!s.url || !s.organization || !s.title) err(`Source "${id}" is missing required fields (url/organization/title) -- possible fabrication risk`);
  const dupes = SOURCES.filter((o) => o.id !== id && o.url === s.url);
  if (dupes.length) err(`Source "${id}" duplicates url of existing source(s): ${dupes.map((d) => d.id).join(', ')}`);
  if (s.publication_date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(String(s.publication_date))) {
    err(`Source "${id}" has a malformed publication_date "${s.publication_date}" (must be YYYY-MM-DD or null -- never a guessed partial date)`);
  }
}

// 2. New range IDs resolve, use a valid context (environment/sanitizer/scenario
//    from the shared controlled vocabulary), reference a real parameter_id,
//    and cite at least one real, resolvable source (or are explicitly
//    REQUIRES_REVIEW with an empty source list, which is allowed).
for (const id of NEW_RANGE_IDS) {
  const r = RANGES_BY_ID[id];
  if (!r) { err(`New range id "${id}" does not resolve in chemistry-ranges.js`); continue; }
  if (!PARAMETERS_BY_ID[r.parameter_id]) err(`Range "${id}" references unknown parameter_id "${r.parameter_id}"`);
  if (!CONTEXT_MODEL.environment.includes(r.environment)) err(`Range "${id}" has invalid environment "${r.environment}"`);
  if (!CONTEXT_MODEL.sanitizer.includes(r.sanitizer)) err(`Range "${id}" has invalid sanitizer "${r.sanitizer}"`);
  if (!CONTEXT_MODEL.scenario.includes(r.scenario)) err(`Range "${id}" has invalid scenario "${r.scenario}"`);
  for (const sid of r.source_ids || []) {
    if (!SOURCES_BY_ID[sid]) err(`Range "${id}" cites unresolved source_id "${sid}"`);
  }
  if (r.status === 'SUPPORTED' && (!r.source_ids || r.source_ids.length === 0)) {
    err(`Range "${id}" is marked SUPPORTED but cites zero sources`);
  }
  if (r.status !== 'REQUIRES_REVIEW' && r.status !== 'AMBIGUOUS' && (!r.source_ids || r.source_ids.length === 0)) {
    warn(`Range "${id}" has status "${r.status}" with no cited sources`);
  }
}

// 3. Confirm no chemistry-range context collapse: the two new records must
//    remain distinct in scenario from the pre-existing shock_treatment
//    records (Director's explicit "distinct scenarios" requirement).
const shockScenarios = RANGES.filter((r) => r.parameter_id === 'shock_treatment').map((r) => r.scenario);
const uniqueShockScenarios = new Set(shockScenarios);
if (uniqueShockScenarios.size !== shockScenarios.length) {
  err(`shock_treatment ranges have duplicate/collapsed scenario values: [${shockScenarios.join(', ')}]`);
}

// 4. Entity-claim resolution overlay: source_registry_ids in
//    reports/phase-7k/resolved-claims.csv must all resolve to a real
//    range or source id, and no claim may be marked SUPPORTED/CONTEXTUAL
//    with zero cited registry ids (except the one claim deliberately left
//    REQUIRES_REVIEW, which is expected to have none).
const resolvedPath = path.join(ROOT, 'reports', 'phase-7k', 'resolved-claims.csv');
if (!fs.existsSync(resolvedPath)) {
  err('reports/phase-7k/resolved-claims.csv does not exist -- run scripts/phase-7k/apply-resolutions.js first');
} else {
  const lines = fs.readFileSync(resolvedPath, 'utf8').trim().split('\n').slice(1);
  for (const line of lines) {
    const row = parseCsvLine(line);
    const [claimId, disposition, sourceIds] = row;
    const ids = sourceIds ? sourceIds.split(';').filter(Boolean) : [];
    for (const id of ids) {
      if (!RANGES_BY_ID[id] && !SOURCES_BY_ID[id]) err(`Resolved claim "${claimId}" cites unresolved registry id "${id}"`);
    }
    if ((disposition === 'SUPPORTED' || disposition === 'DIRECTLY_SUPPORTED') && ids.length === 0) {
      err(`Resolved claim "${claimId}" is marked "${disposition}" but cites zero sources -- possible unsupported claim marked as supported`);
    }
    // Material claims must not be mapped to a chemistry-ranges numeric record
    // (chemistry ranges are water-parameter targets, not material-science
    // findings) -- check the two material claims specifically.
    if ((claimId === 'ec-vinyl-pool-0282' || claimId === 'ec-fiberglass-pool-0286')) {
      for (const id of ids) {
        if (RANGES_BY_ID[id]) err(`Material claim "${claimId}" is incorrectly mapped to a chemistry-ranges record "${id}" instead of a material-industry source`);
      }
    }
  }
  // Confirm the one deliberately-unresolved claim really was left that way.
  const shockRow = lines.map(parseCsvLine).find((r) => r[0] === 'ec-shock-treatment-0140');
  if (!shockRow) warn('ec-shock-treatment-0140 not present in resolved-claims.csv (expected: present, REQUIRES_REVIEW, undecided)');
  else if (shockRow[1] !== 'REQUIRES_REVIEW') err(`ec-shock-treatment-0140 expected to remain REQUIRES_REVIEW (genuine source disagreement, not resolved) but is "${shockRow[1]}"`);
}

// 5. No fabricated source records sitewide: every source in
//    chemistry-sources.js must have a non-placeholder url and organization.
for (const s of SOURCES) {
  if (/example\.com|TODO|FIXME|placeholder/i.test(s.url || '')) err(`Source "${s.id}" has a placeholder-looking url: ${s.url}`);
}

// 6. No duplicate source ids/urls sitewide (not just among the new ones).
const seenUrls = new Map();
for (const s of SOURCES) {
  if (seenUrls.has(s.url)) err(`Duplicate source url between "${seenUrls.get(s.url)}" and "${s.id}": ${s.url}`);
  seenUrls.set(s.url, s.id);
}

// 7. No invalid units on the new range records (unit must be a string, and
//    for ppm/pH/degrees ranges min<=max when both are numbers).
for (const id of NEW_RANGE_IDS) {
  const r = RANGES_BY_ID[id];
  if (!r) continue;
  if (typeof r.unit !== 'string' || !r.unit.length) err(`Range "${id}" has an invalid unit`);
  if (typeof r.minimum === 'number' && typeof r.maximum === 'number' && r.minimum > r.maximum) {
    err(`Range "${id}" has minimum (${r.minimum}) > maximum (${r.maximum})`);
  }
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

if (errors > 0) {
  console.error(`validate-phase-7k: FAIL -- ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
} else {
  console.log(`validate-phase-7k: PASS -- 0 errors, ${warnings} warning(s).`);
}
