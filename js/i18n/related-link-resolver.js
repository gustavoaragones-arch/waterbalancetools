'use strict';
/**
 * related-link-resolver.js — Phase 8M generic, language-aware relationship
 * resolver for JSON-driven content families (Glossary, Formulas,
 * Reference), extended to calculators for cross-family references.
 *
 * Phase 8L found that these families' relationship fields
 * (relatedCalculators/relatedArticles/relatedFormulas/relatedGlossary/
 * relatedTopics) store literal English URL paths or bare same-/cross-
 * family slug suffixes -- never a stable content ID -- and that
 * formulas.json's relatedGlossary field contains 14 reference occurrences
 * (13 unique glossary slugs) that do not correspond to any existing
 * glossary term. This module normalizes any of those raw reference shapes
 * to a (family, nativeId) pair, looks up translation status, and returns
 * the correct URL under Policy A (English fallback when untranslated) --
 * WITHOUT ever fabricating a target that does not exist and WITHOUT ever
 * making a network call or reading rendered HTML.
 *
 * This module does not itself produce Spanish output. Every generator
 * call site defaults to locale 'en', for which this resolver is proven
 * (via scripts/test-phase-8m.js) to return exactly the same URL the
 * generator already produces today.
 */

const path = require('path');
const ROOT = path.join(__dirname, '..', '..');

const { getLocalizedUrl } = require('./locale-url');
const { isTranslated } = require('./translation-status');

const CALCULATORS_FAMILY = 'calculator';
const GLOSSARY_FAMILY = 'glossary';
const FORMULA_FAMILY = 'formula';
const REFERENCE_FAMILY = 'reference';

let indexCache = null;

/**
 * buildContentIndex() — builds, once per process, a set of lookup maps
 * from the actual source data files. Never reads rendered HTML. Rebuilt
 * on demand via reloadContentIndex() (mirrors translation-status.js's
 * own load()/reload() convention) so tests can exercise a fresh index
 * against fixture data without restarting the process.
 */
function buildContentIndex() {
  const glossary = require(path.join(ROOT, 'data', 'glossary.json'));
  const formulas = require(path.join(ROOT, 'data', 'formulas.json'));
  const reference = require(path.join(ROOT, 'data', 'reference.json'));
  const status = require(path.join(ROOT, 'data', 'i18n', 'translation-status.json'));

  // englishUrlPath -> { family, nativeId, slug }
  const byEnglishUrl = new Map();
  // "<family>:<slugSuffix>" -> nativeId  (slug suffix = last path segment)
  const bySlugSuffix = new Map();
  // "<family>/<fullSlugAfterFamily>" -> nativeId  (e.g. "formulas/turnover-formula")
  const byFullSlug = new Map();
  // "<family>:<nativeId>" -> contentId (from translation-status.json, if registered)
  const contentIdByNative = new Map();

  for (const u of status.units) {
    const parts = u.contentId.split(':');
    if (parts.length !== 2) continue;
    contentIdByNative.set(parts[0] + ':' + parts[1], u.contentId);
  }

  function index(family, records, idOf, slugOf) {
    for (const r of records) {
      const nativeId = idOf(r);
      const slug = slugOf(r);
      const englishUrl = '/' + slug;
      byEnglishUrl.set(englishUrl, { family, nativeId, slug });
      const suffix = slug.split('/').pop();
      bySlugSuffix.set(family + ':' + suffix, nativeId);
      // Full slug without the family's own leading directory segment,
      // e.g. "formulas/turnover-formula" -> byFullSlug key "formulas/turnover-formula"
      byFullSlug.set(slug, { family, nativeId });
    }
  }

  index(GLOSSARY_FAMILY, glossary.terms, (t) => t.id, (t) => t.slug);
  index(FORMULA_FAMILY, formulas.formulas, (t) => t.id, (t) => t.slug);
  index(REFERENCE_FAMILY, reference.pages, (t) => t.id, (t) => t.slug);

  // Calculators: derived from translation-status.json, the existing
  // authority for calculator identity (Phase 8D-8I), not from a
  // calculators.json data file (none exists -- calculator pages are
  // hand-authored HTML).
  for (const u of status.units) {
    if (u.category !== CALCULATORS_FAMILY) continue;
    const nativeId = u.contentId.split(':')[1];
    byEnglishUrl.set(u.languages.en.url, { family: CALCULATORS_FAMILY, nativeId, slug: u.languages.en.url.replace(/^\//, '') });
  }

  return { byEnglishUrl, bySlugSuffix, byFullSlug, contentIdByNative };
}

function getIndex() {
  if (!indexCache) indexCache = buildContentIndex();
  return indexCache;
}

/** reloadContentIndex() — forces a fresh rebuild from current source data. */
function reloadContentIndex() {
  indexCache = null;
  return getIndex();
}

/**
 * normalizeReference(raw, sourceFamilyHint) — converts any of the three
 * raw relationship shapes Phase 8L identified into a { family, nativeId }
 * pair, or null if the reference cannot be resolved against any known
 * family's data (this is the safe, non-throwing "unknown target" case --
 * e.g. one of formulas.json's 13 dangling relatedGlossary slugs).
 *
 * Shapes handled:
 *   1. English URL path literal:      "/calculators/pool-chlorine-calculator"
 *   2. Cross-family bare slug:        "reference/cya-matrix"
 *   3. Same-family bare slug suffix:  "pool-volume" (requires sourceFamilyHint,
 *      e.g. formulas.json's relatedGlossary entries, which reference
 *      glossary by slug suffix, not by the formula's own family)
 */
function normalizeReference(raw, sourceFamilyHint) {
  if (typeof raw !== 'string' || !raw) return null;
  const idx = getIndex();

  // Shape 1: English URL path literal.
  if (raw.startsWith('/')) {
    const hit = idx.byEnglishUrl.get(raw);
    return hit ? { family: hit.family, nativeId: hit.nativeId } : null;
  }

  // Shape 2: cross-family bare slug, e.g. "reference/cya-matrix" or
  // "formulas/turnover-formula".
  if (raw.includes('/')) {
    const hit = idx.byFullSlug.get(raw);
    return hit ? { family: hit.family, nativeId: hit.nativeId } : null;
  }

  // Shape 3: same-family bare slug suffix -- the shape formulas.json's
  // relatedGlossary field uses (e.g. "pool-volume" meaning the glossary
  // term whose slug ends in "/pool-volume"). Requires an explicit target
  // family hint because the raw string alone doesn't say which family's
  // slug space to search; the caller (e.g. generate-formulas.js resolving
  // its own relatedGlossary field) always knows this statically.
  if (sourceFamilyHint) {
    const nativeId = idx.bySlugSuffix.get(sourceFamilyHint + ':' + raw);
    return nativeId ? { family: sourceFamilyHint, nativeId } : null;
  }

  return null;
}

/**
 * resolveRelatedLink({ raw, targetFamilyHint, locale })
 *
 * The single generic entry point every generator should use in place of
 * emitting a relationship field's raw value directly.
 *
 * Returns one of:
 *   { resolved: true,  url, family, nativeId, translatedForLocale }
 *   { resolved: false, reason: 'unknown-target', raw }
 *
 * Policy A (Phase 8L, locked): if locale === 'en', ALWAYS returns the
 * English URL for a resolved target (English pages never change their
 * existing linking behavior, regardless of any Spanish translation
 * state). If locale is a non-default language and the target has a
 * "translated" status for that language, returns the localized URL;
 * otherwise falls back to the English URL. Never fabricates a URL for a
 * target this function cannot find in the actual source data --
 * unresolved references (e.g. formulas.json's 13 dangling relatedGlossary
 * slugs) are reported via `resolved: false` so the caller can skip
 * rendering that one related-link entry, exactly as Phase 8L specified
 * ("preserve a safe non-breaking behavior and emit a deterministic
 * diagnostic" -- never crash, never invent the missing record).
 */
function resolveRelatedLink(options) {
  const { raw, targetFamilyHint, locale } = options || {};
  const target = normalizeReference(raw, targetFamilyHint);
  if (!target) {
    return { resolved: false, reason: 'unknown-target', raw: raw };
  }

  const idx = getIndex();
  const contentId = idx.contentIdByNative.get(target.family + ':' + target.nativeId);
  const englishUrl = findEnglishUrlFor(target.family, target.nativeId, idx);
  if (!englishUrl) {
    // The target exists in its own family's source data but has no
    // registered translation-status content ID and (for the calculator
    // family, which is looked up FROM translation-status.json) no known
    // English URL -- treat as unresolved rather than guessing a URL.
    return { resolved: false, reason: 'no-known-url', raw: raw };
  }

  const effectiveLocale = locale || 'en';
  if (effectiveLocale === 'en') {
    return { resolved: true, url: englishUrl, family: target.family, nativeId: target.nativeId, translatedForLocale: true };
  }

  const translated = contentId ? isTranslated(contentId, effectiveLocale) : false;
  if (translated) {
    return { resolved: true, url: getLocalizedUrl(englishUrl, effectiveLocale), family: target.family, nativeId: target.nativeId, translatedForLocale: true };
  }
  // Policy A: fall back to the English target rather than suppressing
  // the link or fabricating an unavailable Spanish URL.
  return { resolved: true, url: englishUrl, family: target.family, nativeId: target.nativeId, translatedForLocale: false };
}

function findEnglishUrlFor(family, nativeId, idx) {
  for (const [url, hit] of idx.byEnglishUrl) {
    if (hit.family === family && hit.nativeId === nativeId) return url;
  }
  return null;
}

module.exports = {
  buildContentIndex,
  reloadContentIndex,
  normalizeReference,
  resolveRelatedLink,
  CALCULATORS_FAMILY,
  GLOSSARY_FAMILY,
  FORMULA_FAMILY,
  REFERENCE_FAMILY,
};
