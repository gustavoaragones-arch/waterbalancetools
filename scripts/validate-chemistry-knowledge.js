#!/usr/bin/env node
'use strict';
/**
 * validate-chemistry-knowledge.js
 *
 * Structural validator for the Phase 7D chemistry knowledge dataset.
 * Exits 1 on structural errors (broken references, malformed data).
 * REQUIRES_REVIEW / AMBIGUOUS / UNSUPPORTED are legitimate content-review
 * states, not errors, and never fail the build on their own -- only a
 * genuinely broken reference or malformed record does.
 */

const fs = require('fs');
const path = require('path');

const { PARAMETERS } = require('./data/chemistry-knowledge');
const { RANGES } = require('./data/chemistry-ranges');
const { SOURCES } = require('./data/chemistry-sources');
const { CLAIMS, STATUS_VALUES } = require('./data/chemistry-claims');
const { CONTEXT_MODEL } = require('./data/chemistry-knowledge');

const ROOT = path.join(__dirname, '..');
const errors = [];
const warnings = [];

function err(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

const PARAM_REVIEW_STATUSES = new Set(['verified', 'supported', 'pending_review']);
const RANGE_CLAIM_STATUSES = new Set(STATUS_VALUES);

// ---- Parameters ------------------------------------------------------------
const paramIds = new Set();
const aliasSeen = new Map(); // alias -> parameter id that first claimed it
for (const p of PARAMETERS) {
  if (paramIds.has(p.id)) err(`Duplicate parameter id: "${p.id}"`);
  paramIds.add(p.id);

  if (!PARAM_REVIEW_STATUSES.has(p.review_status)) {
    err(`Parameter "${p.id}" has invalid review_status "${p.review_status}"`);
  }
  for (const ctx of p.contexts || []) {
    if (!CONTEXT_MODEL.environment.includes(ctx)) {
      err(`Parameter "${p.id}" references invalid environment context "${ctx}"`);
    }
  }
  const allAliases = [p.canonical_term.toLowerCase(), p.name.toLowerCase(), ...(p.aliases || []).map((a) => a.toLowerCase())];
  for (const a of allAliases) {
    if (aliasSeen.has(a) && aliasSeen.get(a) !== p.id) {
      err(`Duplicate alias "${a}" claimed by both "${aliasSeen.get(a)}" and "${p.id}"`);
    }
    aliasSeen.set(a, p.id);
  }
  for (const sid of p.source_ids || []) {
    if (!SOURCES.find((s) => s.id === sid)) err(`Parameter "${p.id}" references nonexistent source_id "${sid}"`);
  }
}

// ---- Sources -----------------------------------------------------------------
const sourceIds = new Set();
const REQUIRED_AUTHORITY_LEVELS = new Set(['primary', 'professional', 'academic', 'manufacturer', 'secondary']);
for (const s of SOURCES) {
  if (sourceIds.has(s.id)) err(`Duplicate source id: "${s.id}"`);
  sourceIds.add(s.id);
  if (!s.url || !/^https?:\/\//.test(s.url)) err(`Source "${s.id}" has missing/invalid url`);
  if (!s.organization) err(`Source "${s.id}" missing organization`);
  if (!s.title) err(`Source "${s.id}" missing title`);
  if (!REQUIRED_AUTHORITY_LEVELS.has(s.authority_level)) err(`Source "${s.id}" has invalid authority_level "${s.authority_level}"`);
  if (!s.accessed_date) err(`Source "${s.id}" missing accessed_date`);
}

// ---- Ranges -----------------------------------------------------------------
const rangeIds = new Set();
for (const r of RANGES) {
  if (rangeIds.has(r.id)) err(`Duplicate range id: "${r.id}"`);
  rangeIds.add(r.id);

  if (!paramIds.has(r.parameter_id)) err(`Range "${r.id}" references nonexistent parameter_id "${r.parameter_id}"`);
  if (!CONTEXT_MODEL.environment.includes(r.environment)) err(`Range "${r.id}" has invalid environment "${r.environment}"`);
  if (!CONTEXT_MODEL.sanitizer.includes(r.sanitizer)) err(`Range "${r.id}" has invalid sanitizer "${r.sanitizer}"`);
  if (!CONTEXT_MODEL.scenario.includes(r.scenario)) err(`Range "${r.id}" has invalid scenario "${r.scenario}"`);
  if (!CONTEXT_MODEL.temperature.includes(r.temperature_context)) err(`Range "${r.id}" has invalid temperature_context "${r.temperature_context}"`);
  if (!RANGE_CLAIM_STATUSES.has(r.status)) err(`Range "${r.id}" has invalid status "${r.status}"`);

  const hasMin = r.minimum !== null && r.minimum !== undefined;
  const hasMax = r.maximum !== null && r.maximum !== undefined;
  if (hasMin && hasMax && Number(r.minimum) > Number(r.maximum)) {
    err(`Range "${r.id}" has minimum (${r.minimum}) > maximum (${r.maximum})`);
  }
  if (r.target !== null && r.target !== undefined && hasMin && hasMax) {
    if (Number(r.target) < Number(r.minimum) || Number(r.target) > Number(r.maximum)) {
      err(`Range "${r.id}" has target (${r.target}) outside [${r.minimum}, ${r.maximum}]`);
    }
  }
  for (const sid of r.source_ids || []) {
    if (!sourceIds.has(sid)) err(`Range "${r.id}" references nonexistent source_id "${sid}"`);
  }
  if ((r.status === 'SUPPORTED' || r.status === 'VERIFIED') && (!r.source_ids || r.source_ids.length === 0)) {
    err(`Range "${r.id}" has status "${r.status}" but no source_ids -- a supported/verified claim must cite at least one source`);
  }
}

// ---- Claims -----------------------------------------------------------------
const claimIds = new Set();
for (const c of CLAIMS) {
  if (claimIds.has(c.claim_id)) err(`Duplicate claim id: "${c.claim_id}"`);
  claimIds.add(c.claim_id);

  if (!paramIds.has(c.parameter_id)) err(`Claim "${c.claim_id}" references nonexistent parameter_id "${c.parameter_id}"`);
  if (!RANGE_CLAIM_STATUSES.has(c.status)) err(`Claim "${c.claim_id}" has invalid status "${c.status}"`);
  if (c.range_id && !rangeIds.has(c.range_id)) err(`Claim "${c.claim_id}" references nonexistent range_id "${c.range_id}"`);
  for (const sid of c.source_ids || []) {
    if (!sourceIds.has(sid)) err(`Claim "${c.claim_id}" references nonexistent source_id "${sid}"`);
  }
  if ((c.status === 'SUPPORTED' || c.status === 'VERIFIED') && (!c.source_ids || c.source_ids.length === 0)) {
    err(`Claim "${c.claim_id}" has status "${c.status}" but no source_ids`);
  }
  if (c.context) {
    if (c.context.environment && !CONTEXT_MODEL.environment.includes(c.context.environment)) {
      err(`Claim "${c.claim_id}" has invalid context.environment "${c.context.environment}"`);
    }
    if (c.context.sanitizer && !CONTEXT_MODEL.sanitizer.includes(c.context.sanitizer)) {
      err(`Claim "${c.claim_id}" has invalid context.sanitizer "${c.context.sanitizer}"`);
    }
    if (c.context.scenario && !CONTEXT_MODEL.scenario.includes(c.context.scenario)) {
      err(`Claim "${c.claim_id}" has invalid context.scenario "${c.context.scenario}"`);
    }
  }
}

// ---- Orphans (warnings, not errors -- an unused source/range is a content
// gap, not a structural break) -------------------------------------------------
const referencedSourceIds = new Set([
  ...PARAMETERS.flatMap((p) => p.source_ids || []),
  ...RANGES.flatMap((r) => r.source_ids || []),
  ...CLAIMS.flatMap((c) => c.source_ids || []),
]);
for (const s of SOURCES) {
  if (!referencedSourceIds.has(s.id)) warn(`Source "${s.id}" is not referenced by any parameter, range, or claim (orphan source)`);
}
const referencedRangeIds = new Set(CLAIMS.map((c) => c.range_id).filter(Boolean));
for (const r of RANGES) {
  if (!referencedRangeIds.has(r.id)) warn(`Range "${r.id}" is not referenced by any canonical claim (orphan range)`);
}

// ---- Report -----------------------------------------------------------------
const outDir = path.join(ROOT, 'reports', 'phase-7d');
fs.mkdirSync(outDir, { recursive: true });
const result = {
  timestamp: new Date().toISOString(),
  parameters: PARAMETERS.length, ranges: RANGES.length, sources: SOURCES.length, claims: CLAIMS.length,
  errors, warnings,
  status: errors.length === 0 ? 'PASS' : 'FAIL',
};
fs.writeFileSync(path.join(outDir, 'chemistry-validation-results.json'), JSON.stringify(result, null, 2) + '\n');

if (errors.length === 0) {
  console.log(`validate-chemistry-knowledge: PASS -- ${PARAMETERS.length} parameters, ${RANGES.length} ranges, ${SOURCES.length} sources, ${CLAIMS.length} claims, 0 structural errors (${warnings.length} warning(s)).`);
  for (const w of warnings) console.log(`WARN: ${w}`);
} else {
  console.error(`validate-chemistry-knowledge: FAIL -- ${errors.length} structural error(s).`);
  for (const e of errors) console.error(`ERROR: ${e}`);
  process.exitCode = 1;
}

module.exports = { errors, warnings };
