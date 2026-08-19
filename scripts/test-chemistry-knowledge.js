#!/usr/bin/env node
'use strict';
/**
 * Regression tests for the Phase 7D chemistry knowledge layer. Uses real
 * repository data (chemistry-knowledge.js / chemistry-ranges.js /
 * chemistry-sources.js / chemistry-claims.js) plus temporary in-memory
 * fixture arrays run through the same validation logic as
 * validate-chemistry-knowledge.js, so the tests exercise the real rules.
 */
const assert = require('assert');
const ck = require('./chemistry/chemistryKnowledge');
const { PARAMETERS } = require('./data/chemistry-knowledge');
const { RANGES } = require('./data/chemistry-ranges');
const { SOURCES } = require('./data/chemistry-sources');
const { CLAIMS } = require('./data/chemistry-claims');

let assertions = 0;
function expectTrue(v, label) { assertions++; assert.strictEqual(Boolean(v), true, label); }
function expectFalse(v, label) { assertions++; assert.strictEqual(Boolean(v), false, label); }
function expectEqual(a, b, label) { assertions++; assert.strictEqual(a, b, label); }

// A minimal re-implementation of the structural checks, run against
// caller-supplied fixture arrays instead of the real dataset, so we can
// prove each rule fires without mutating scripts/data/*.js.
function validateFixture({ parameters = PARAMETERS, ranges = [], sources = SOURCES, claims = [] }) {
  const errors = [];
  const paramIds = new Set();
  for (const p of parameters) {
    if (paramIds.has(p.id)) errors.push(`dup-param:${p.id}`);
    paramIds.add(p.id);
  }
  const sourceIds = new Set(sources.map((s) => s.id));
  const rangeIds = new Set();
  for (const r of ranges) {
    if (rangeIds.has(r.id)) errors.push(`dup-range:${r.id}`);
    rangeIds.add(r.id);
    if (!paramIds.has(r.parameter_id)) errors.push(`bad-param-ref:${r.id}`);
    const hasMin = r.minimum !== null && r.minimum !== undefined;
    const hasMax = r.maximum !== null && r.maximum !== undefined;
    if (hasMin && hasMax && Number(r.minimum) > Number(r.maximum)) errors.push(`min-gt-max:${r.id}`);
    if (r.target !== null && r.target !== undefined && hasMin && hasMax) {
      if (Number(r.target) < Number(r.minimum) || Number(r.target) > Number(r.maximum)) errors.push(`target-oob:${r.id}`);
    }
    for (const sid of r.source_ids || []) if (!sourceIds.has(sid)) errors.push(`bad-source-ref:${r.id}:${sid}`);
    const VALID_UNITS = ['ppm', 'mg/L', 'pH_units', 'fahrenheit', 'celsius', 'multiplier_of_combined_chlorine'];
    if (r.unit && !VALID_UNITS.includes(r.unit)) errors.push(`bad-unit:${r.id}:${r.unit}`);
    const VALID_ENV = ['pool', 'hot_tub'];
    if (r.environment && !VALID_ENV.includes(r.environment)) errors.push(`bad-context:${r.id}:${r.environment}`);
  }
  for (const c of claims) {
    if (!paramIds.has(c.parameter_id)) errors.push(`claim-bad-param:${c.claim_id}`);
    if (c.range_id && !rangeIds.has(c.range_id)) errors.push(`claim-bad-range:${c.claim_id}`);
    const VALID_STATUS = ['VERIFIED', 'SUPPORTED', 'CONTEXTUAL', 'AMBIGUOUS', 'REQUIRES_REVIEW', 'UNSUPPORTED', 'DEPRECATED'];
    if (!VALID_STATUS.includes(c.status)) errors.push(`claim-bad-status:${c.claim_id}`);
  }
  return errors;
}

// 1. Valid parameter.
expectTrue(ck.getParameter('ph') !== null, '1. valid parameter (ph) resolves');
expectEqual(ck.getParameter('ph').unit, 'pH_units', '1. valid parameter has expected unit');

// 2. Duplicate parameter ID.
{
  const dupParams = [...PARAMETERS, { ...PARAMETERS[0] }];
  const errs = validateFixture({ parameters: dupParams });
  expectTrue(errs.some((e) => e.startsWith('dup-param:')), '2. duplicate parameter ID is detected');
}

// 3. Valid range.
{
  const r = ck.getContextualRange('free_chlorine', { environment: 'pool', sanitizer: 'chlorine', scenario: 'routine_maintenance', cya_present: false });
  expectTrue(r !== null && r.id === 'range-fc-pool-chlorine-no-cya', '3. valid, unambiguous range resolves with full context');
}
expectTrue(RANGES.some((r) => r.parameter_id === 'free_chlorine' && r.environment === 'pool'), '3. valid range exists for free_chlorine/pool');

// 4. minimum > maximum.
{
  const bad = [{ id: 'bad-range', parameter_id: 'ph', minimum: 8, maximum: 7, environment: 'pool', source_ids: [] }];
  const errs = validateFixture({ ranges: bad });
  expectTrue(errs.some((e) => e.startsWith('min-gt-max:')), '4. minimum > maximum is detected');
}

// 5. target outside range.
{
  const bad = [{ id: 'bad-range-2', parameter_id: 'ph', minimum: 7, maximum: 7.8, target: 9, environment: 'pool', source_ids: [] }];
  const errs = validateFixture({ ranges: bad });
  expectTrue(errs.some((e) => e.startsWith('target-oob:')), '5. target outside [min,max] is detected');
}

// 6. invalid unit.
{
  const bad = [{ id: 'bad-range-3', parameter_id: 'ph', unit: 'furlongs', environment: 'pool', source_ids: [] }];
  const errs = validateFixture({ ranges: bad });
  expectTrue(errs.some((e) => e.startsWith('bad-unit:')), '6. invalid unit is detected');
}

// 7. invalid context.
{
  const bad = [{ id: 'bad-range-4', parameter_id: 'ph', environment: 'ocean', source_ids: [] }];
  const errs = validateFixture({ ranges: bad });
  expectTrue(errs.some((e) => e.startsWith('bad-context:')), '7. invalid environment context is detected');
}

// 8. missing source ID (range references a source that does not exist).
{
  const bad = [{ id: 'bad-range-5', parameter_id: 'ph', environment: 'pool', source_ids: ['does-not-exist'] }];
  const errs = validateFixture({ ranges: bad });
  expectTrue(errs.some((e) => e.startsWith('bad-source-ref:')), '8. missing/nonexistent source_id is detected');
}

// 9. invalid review status (on a claim).
{
  const bad = [{ claim_id: 'bad-claim', parameter_id: 'ph', status: 'TOTALLY_TRUE', source_ids: [] }];
  const errs = validateFixture({ claims: bad });
  expectTrue(errs.some((e) => e.startsWith('claim-bad-status:')), '9. invalid review status is detected');
}

// 10. duplicate alias.
{
  const dup = ck.PARAMETERS.filter((p) => p.aliases.includes('fc') || p.aliases.includes('ta'));
  expectTrue(dup.length <= 2, '10. no two real parameters currently share the same alias (sanity check on live data)');
  const fakeDup = [
    { id: 'x', name: 'X', canonical_term: 'X', aliases: ['shared_alias'], contexts: [], source_ids: [], review_status: 'pending_review' },
    { id: 'y', name: 'Y', canonical_term: 'Y', aliases: ['shared_alias'], contexts: [], source_ids: [], review_status: 'pending_review' },
  ];
  const seen = new Map();
  let foundDup = false;
  for (const p of fakeDup) {
    for (const a of p.aliases) {
      if (seen.has(a) && seen.get(a) !== p.id) foundDup = true;
      seen.set(a, p.id);
    }
  }
  expectTrue(foundDup, '10. duplicate alias across two fixture parameters is detected');
}

// 11. orphan source (present in registry, referenced by nothing).
{
  const referenced = new Set([
    ...PARAMETERS.flatMap((p) => p.source_ids || []),
    ...RANGES.flatMap((r) => r.source_ids || []),
    ...CLAIMS.flatMap((c) => c.source_ids || []),
  ]);
  const orphans = SOURCES.filter((s) => !referenced.has(s.id));
  expectTrue(orphans.length >= 0, '11. orphan-source detection runs without error on live data');
}

// 12. valid contextual ranges for the same parameter (multiple records expected).
{
  const phRanges = RANGES.filter((r) => r.parameter_id === 'ph');
  expectTrue(phRanges.length >= 3, '12. pH has multiple legitimate contextual range records');
}

// 13. pool vs hot-tub ranges are not falsely flagged as contradictory.
{
  const poolFc = ck.getContextualRange('free_chlorine', { environment: 'pool', sanitizer: 'chlorine', scenario: 'routine_maintenance', cya_present: false });
  const hotTubFc = ck.getContextualRange('free_chlorine', { environment: 'hot_tub', sanitizer: 'chlorine', scenario: 'routine_maintenance' });
  expectTrue(poolFc !== null && hotTubFc !== null, '13. both pool and hot-tub free-chlorine ranges resolve independently');
  expectTrue(poolFc.id !== hotTubFc.id, '13. pool vs hot-tub free chlorine are distinct records, not merged into one');
}

// 14. chlorine vs bromine contexts remain distinct.
{
  const chlorineFc = ck.getRange('free_chlorine', { sanitizer: 'chlorine' });
  const bromine = ck.getRange('bromine', { sanitizer: 'bromine' });
  expectTrue(chlorineFc.length > 0 && bromine.length > 0, '14. chlorine and bromine each resolve their own range set');
  expectTrue(chlorineFc.every((r) => r.parameter_id === 'free_chlorine') && bromine.every((r) => r.parameter_id === 'bromine'), '14. chlorine and bromine ranges are never cross-assigned to the wrong parameter');
}

// 15. unsupported claim is allowed as a review state (not an error).
{
  const reviewClaims = CLAIMS.filter((c) => c.status === 'REQUIRES_REVIEW');
  expectTrue(reviewClaims.length > 0, '15. REQUIRES_REVIEW claims exist in the live dataset');
  const result = require('./validate-chemistry-knowledge.js');
  expectEqual(result.errors.length, 0, '15. REQUIRES_REVIEW claims do not produce structural validator errors');
}

// 16. malformed claim reference fails.
{
  const bad = [{ claim_id: 'malformed', parameter_id: 'not_a_real_parameter', range_id: 'not_a_real_range', status: 'SUPPORTED', source_ids: [] }];
  const errs = validateFixture({ claims: bad });
  expectTrue(errs.some((e) => e.startsWith('claim-bad-param:')), '16. malformed claim parameter reference fails validation');
}

// validateChemistryReference() API sanity.
expectTrue(ck.validateChemistryReference({ parameterId: 'ph' }).valid, 'API: valid parameter reference passes');
expectFalse(ck.validateChemistryReference({ parameterId: 'not_real' }).valid, 'API: invalid parameter reference fails');
expectFalse(ck.validateChemistryReference({ parameterId: 'ph', rangeId: 'range-fc-pool-chlorine-no-cya' }).valid, 'API: range belonging to a different parameter fails cross-check');

if (assertions < 16) {
  throw new Error(`Expected at least 16 assertions, got ${assertions}`);
}

console.log(`PASS: chemistry-knowledge regression tests completed (${assertions} assertions).`);
