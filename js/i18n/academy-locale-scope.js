'use strict';
/**
 * academy-locale-scope.js — Phase 8Q explicit scope boundary for the
 * future Spanish Academy production cluster selected in Phase 8P
 * (docs/PHASE-8P-SPANISH-EXPANSION-STRATEGY-AUDIT.md): Academy →
 * Fundamentals, native IDs fund-01 through fund-08.
 *
 * Mirrors the exact architectural pattern established by
 * js/i18n/reference-locale-scope.js (Phase 8M): an explicit, EXPLICIT
 * named set of in-scope native IDs (never "whatever the category filter
 * happens to return today"), cross-checked against the set the data file
 * itself derives via its own `category` field, with a non-empty
 * `unexpected` bucket as the drift signal if the two disagree. This
 * module does not itself produce Spanish output and is not wired into
 * any generator in Phase 8Q -- it exists purely so a future production
 * phase has one deterministic, auditable gate to call, exactly as
 * reference-locale-scope.js#isInLocalizationScope() is the single gate
 * for Reference.
 *
 * data/academy.json currently has 50 articles across 8 categories.
 * "Fundamentals" (8 articles) is the bounded first-wave cluster; the
 * other 42 articles across the remaining 7 categories are explicitly
 * OUT OF SCOPE for this module and for the Phase 8Q architecture -- a
 * future phase choosing to expand beyond Fundamentals must add a new,
 * equally explicit scope, not silently widen this one.
 */

const path = require('path');
const ROOT = path.join(__dirname, '..', '..');

// The 8 confirmed Fundamentals native IDs -- explicit and named (not
// "whatever data/academy.json's `category === 'fundamentals'` filter
// returns today") so a future addition of a new Fundamentals article
// can never silently expand this bounded first-wave scope, and so an
// accidental category reassignment cannot silently shrink or grow it
// without this list being deliberately updated.
const FUNDAMENTALS_SCOPE = new Set([
  'fund-01',
  'fund-02',
  'fund-03',
  'fund-04',
  'fund-05',
  'fund-06',
  'fund-07',
  'fund-08',
]);

const EXPECTED_FUNDAMENTALS_COUNT = 8;
const FUNDAMENTALS_CATEGORY_SLUG = 'fundamentals';

/**
 * getFundamentalsCategoryIds() — the deterministic, repository-derived
 * set of native Academy IDs currently carrying category "fundamentals",
 * taken directly from data/academy.json (never hardcoded/guessed). This
 * is the cross-check operand for FUNDAMENTALS_SCOPE, not a replacement
 * for it -- see classifyAcademyScope().
 */
function getFundamentalsCategoryIds() {
  const data = require(path.join(ROOT, 'data', 'academy.json'));
  return new Set(
    (data.articles || [])
      .filter((a) => a.category === FUNDAMENTALS_CATEGORY_SLUG)
      .map((a) => a.id)
  );
}

/**
 * classifyAcademyScope() — the single authoritative scope check.
 * Returns:
 *   {
 *     inScope:    string[]  -- native IDs in FUNDAMENTALS_SCOPE that
 *                               genuinely exist as category:"fundamentals"
 *                               records today (the safe, actionable set)
 *     missing:    string[]  -- IDs FUNDAMENTALS_SCOPE names that no
 *                               longer exist / no longer carry the
 *                               fundamentals category (a hard problem --
 *                               the bounded scope has drifted from the
 *                               data it was defined against)
 *     unexpected: string[]  -- IDs the data file classifies as
 *                               "fundamentals" that are NOT in
 *                               FUNDAMENTALS_SCOPE (signals the category
 *                               grew since this module was written; the
 *                               explicit list must be deliberately
 *                               reviewed and updated, never silently
 *                               absorbed)
 *   }
 * A non-empty `missing` or `unexpected` array means the repository
 * structure changed since this module's explicit list was written --
 * exactly the same fail-safe contract reference-locale-scope.js uses.
 */
function classifyAcademyScope() {
  const categoryIds = getFundamentalsCategoryIds();
  const inScope = [];
  const missing = [];
  const unexpected = [];

  for (const id of FUNDAMENTALS_SCOPE) {
    if (categoryIds.has(id)) inScope.push(id);
    else missing.push(id);
  }
  for (const id of categoryIds) {
    if (!FUNDAMENTALS_SCOPE.has(id)) unexpected.push(id);
  }

  return { inScope, missing, unexpected };
}

/**
 * isInFundamentalsScope(nativeId) — the single function any future
 * Spanish Academy generation code must call before treating an Academy
 * article as eligible for the Fundamentals production cluster. Requires
 * BOTH that the id is in the explicit named list AND that the data file
 * still classifies it as "fundamentals" today -- an id failing either
 * check is not eligible, rather than being optimistically included.
 */
function isInFundamentalsScope(nativeId) {
  if (!FUNDAMENTALS_SCOPE.has(nativeId)) return false;
  return getFundamentalsCategoryIds().has(nativeId);
}

module.exports = {
  FUNDAMENTALS_SCOPE,
  EXPECTED_FUNDAMENTALS_COUNT,
  FUNDAMENTALS_CATEGORY_SLUG,
  getFundamentalsCategoryIds,
  classifyAcademyScope,
  isInFundamentalsScope,
};
