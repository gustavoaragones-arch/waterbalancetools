/**
 * chemistryKnowledge.js
 *
 * Deterministic, offline read API over the Phase 7D chemistry knowledge
 * layer (scripts/data/chemistry-knowledge.js, chemistry-ranges.js,
 * chemistry-sources.js, chemistry-claims.js). No network access. Future
 * generators should read chemistry values through this module rather than
 * hard-coding numbers, so a value only needs to be corrected in one place
 * and every consuming page picks it up on the next build.
 */
'use strict';

const { PARAMETERS, PARAMETERS_BY_ID, ALIAS_INDEX, CONTEXT_MODEL } = require('../data/chemistry-knowledge');
const { RANGES, RANGES_BY_ID, rangesForParameter } = require('../data/chemistry-ranges');
const { SOURCES, SOURCES_BY_ID } = require('../data/chemistry-sources');
const { CLAIMS, CLAIMS_BY_ID, claimsForParameter, STATUS_VALUES } = require('../data/chemistry-claims');

function getParameter(id) {
  return PARAMETERS_BY_ID[id] || null;
}

function resolveParameterId(nameOrAlias) {
  if (!nameOrAlias) return null;
  const key = String(nameOrAlias).toLowerCase().trim();
  if (PARAMETERS_BY_ID[key]) return key;
  return ALIAS_INDEX[key] || null;
}

/**
 * getRange(parameterId, context) -- context is a partial match object, e.g.
 * { environment: 'hot_tub', sanitizer: 'chlorine' }. Returns every range
 * record whose fields match every key supplied in context (fields not
 * supplied are not filtered on). This can legitimately return more than
 * one record -- see chemistry-ranges.js for why that's by design.
 */
function getRange(parameterId, context) {
  const candidates = rangesForParameter(parameterId);
  if (!context) return candidates;
  return candidates.filter((r) => Object.entries(context).every(([k, v]) => r[k] === v));
}

/**
 * getContextualRange -- same as getRange but returns the single best match
 * (most context keys matched), or null if nothing matches. Throws if the
 * match is ambiguous (multiple ranges tie on specificity) so a caller can't
 * silently pick the wrong one.
 */
function getContextualRange(parameterId, context) {
  const matches = getRange(parameterId, context);
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];
  throw new Error(
    `getContextualRange('${parameterId}', ${JSON.stringify(context)}) matched ${matches.length} range records ` +
    `(${matches.map((r) => r.id).join(', ')}) -- supply more context fields to disambiguate.`
  );
}

function getSource(id) {
  return SOURCES_BY_ID[id] || null;
}

function getSources(ids) {
  return (ids || []).map(getSource).filter(Boolean);
}

function getClaim(id) {
  return CLAIMS_BY_ID[id] || null;
}

/**
 * validateChemistryReference({ parameterId, rangeId, sourceIds }) --
 * returns { valid: boolean, errors: string[] }. Intended for a future
 * generator to self-check before it renders a chemistry value, e.g. to
 * catch a typo'd parameter or range id at generation time instead of
 * shipping a broken reference.
 */
function validateChemistryReference({ parameterId, rangeId, sourceIds } = {}) {
  const errors = [];
  if (parameterId && !getParameter(parameterId)) errors.push(`Unknown parameter_id "${parameterId}"`);
  if (rangeId) {
    const range = RANGES_BY_ID[rangeId];
    if (!range) errors.push(`Unknown range_id "${rangeId}"`);
    else if (parameterId && range.parameter_id !== parameterId) {
      errors.push(`range_id "${rangeId}" belongs to parameter "${range.parameter_id}", not "${parameterId}"`);
    }
  }
  for (const sid of sourceIds || []) {
    if (!getSource(sid)) errors.push(`Unknown source_id "${sid}"`);
  }
  return { valid: errors.length === 0, errors };
}

module.exports = {
  PARAMETERS, RANGES, SOURCES, CLAIMS, CONTEXT_MODEL, STATUS_VALUES,
  getParameter, resolveParameterId, getRange, getContextualRange,
  getSource, getSources, getClaim, claimsForParameter,
  validateChemistryReference,
};
