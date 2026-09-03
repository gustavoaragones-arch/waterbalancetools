'use strict';
/**
 * es-terminology.js — read/query API over data/i18n/es/terminology.json
 * (Phase 8F: Spanish regional SEO + language-awareness foundation).
 *
 * This is a LEXICAL/SEO data source, not a second translation-status
 * system: it answers "which Spanish term should represent concept X, for
 * region Y, in context Z (title/body/FAQ/anchor)" -- it never decides
 * whether a page exists in Spanish (see js/i18n/translation-status.js for
 * that, unchanged and untouched by this module).
 *
 * Central rule this module exists to enforce (spec Section 6): a concept
 * has ONE canonical/default term for natural body copy, plus regional and
 * search-lexical variants for SEO -- callers must never concatenate every
 * variant into visible copy ("piscina, alberca o pileta") merely because
 * they all exist for the same concept.
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', '..', 'data', 'i18n', 'es', 'terminology.json');
const STATUS_RANK = { preferred: 4, common: 3, recognized: 2, secondary: 1, 'avoid-for-this-region': 0 };

let cache = null;
function load() {
  if (cache) return cache;
  cache = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  return cache;
}
function reload() {
  cache = null;
  return load();
}

function getRegions() {
  return load().regions.slice();
}
function isValidRegion(code) {
  return load().regions.some((r) => r.code === code);
}

function getConcept(conceptId) {
  return load().concepts.find((c) => c.concept === conceptId) || null;
}
function getAllConcepts() {
  return load().concepts.slice();
}
function getCanonicalTerm(conceptId) {
  const c = getConcept(conceptId);
  return c ? c.canonicalTerm : null;
}
function getVariants(conceptId) {
  const c = getConcept(conceptId);
  return c ? c.variants.slice() : [];
}

/**
 * getTermForRegion(conceptId, regionCode, opts) -- returns the single
 * best variant object for a region, ranked by regionStatus (falling back
 * to the region's status if present, else to "neutral", else to the
 * canonical term). opts.excludeTrademarks (default true) skips
 * isTrademark variants unless explicitly requested, matching spec
 * Section 9's "never as the canonical/primary term" rule.
 */
function getTermForRegion(conceptId, regionCode, opts) {
  const options = opts || {};
  const excludeTrademarks = options.excludeTrademarks !== false;
  const c = getConcept(conceptId);
  if (!c) return null;
  let best = null;
  let bestRank = -1;
  for (const v of c.variants) {
    if (excludeTrademarks && v.isTrademark) continue;
    const status = (v.regionStatus && (v.regionStatus[regionCode] || v.regionStatus.neutral)) || null;
    const rank = status ? STATUS_RANK[status] : -1;
    if (rank > bestRank) {
      best = v;
      bestRank = rank;
    }
  }
  return best;
}

/**
 * getSearchVariants(conceptId) -- every variant with seoSuitability
 * "high" or "medium", INCLUDING trademark terms (e.g. "jacuzzi") -- for
 * building search-intent coverage (FAQ wording, meta-description
 * variation, internal-link anchor diversity), never for stuffing visible
 * primary body copy.
 */
function getSearchVariants(conceptId) {
  return getVariants(conceptId).filter((v) => v.seoSuitability === 'high' || v.seoSuitability === 'medium');
}

function isTrademarkTerm(conceptId, term) {
  const c = getConcept(conceptId);
  if (!c) return false;
  const v = c.variants.find((x) => x.term === term);
  return !!(v && v.isTrademark);
}

/**
 * findConceptByTerm(term) -- reverse lookup, used by validators to check
 * whether a literal string found in generated copy maps to a known
 * concept/variant.
 */
function findConceptByTerm(term) {
  for (const c of load().concepts) {
    if (c.variants.some((v) => v.term.toLowerCase() === term.toLowerCase())) return c.concept;
  }
  return null;
}

module.exports = {
  DATA_PATH,
  load,
  reload,
  getRegions,
  isValidRegion,
  getConcept,
  getAllConcepts,
  getCanonicalTerm,
  getVariants,
  getTermForRegion,
  getSearchVariants,
  isTrademarkTerm,
  findConceptByTerm,
};
