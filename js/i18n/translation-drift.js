'use strict';
/**
 * translation-drift.js — Phase 8M minimal, deterministic, repository-based
 * drift detector between data/i18n/translation-status.json and the actual
 * source content it describes (spec Task N / Task 17).
 *
 * Not a CMS, no network calls, no external services -- every check reads
 * only files already committed to this repository.
 */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');

const { getLanguageCodes } = require('./languages');

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}

/**
 * buildNativeIdIndex() — { category -> Set(nativeId) } for every family
 * this module knows how to cross-check against real source data.
 * Categories without a known external data source (guide, programmatic)
 * are intentionally omitted -- detectDrift() skips native-ID existence
 * checks for those, exactly as Phase 8L/8M scoped it.
 */
function buildNativeIdIndex() {
  const glossary = loadJson('data/glossary.json');
  const formulas = loadJson('data/formulas.json');
  const reference = loadJson('data/reference.json');
  const academy = loadJson('data/academy.json');
  return {
    glossary: new Set(glossary.terms.map((t) => t.id)),
    formula: new Set(formulas.formulas.map((t) => t.id)),
    reference: new Set(reference.pages.map((t) => t.id)),
    academy: new Set(academy.articles.map((t) => t.id)),
  };
}

/**
 * detectDrift() — runs every check the spec requires, returns
 * { errors: string[], warnings: string[] }. Never throws for a
 * data-quality issue -- issues are reported, not fatal to the function
 * itself (the caller, e.g. a validator script, decides severity).
 */
function detectDrift() {
  const errors = [];
  const warnings = [];
  const status = loadJson('data/i18n/translation-status.json');
  const nativeIds = buildNativeIdIndex();
  const validLocales = new Set(getLanguageCodes());

  const seenContentIds = new Set();

  for (const unit of status.units) {
    // 1. Malformed content ID (must be "<category>:<id>").
    const parts = unit.contentId.split(':');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      errors.push('Malformed content ID: "' + unit.contentId + '"');
      continue;
    }
    const [idCategory, idSuffix] = parts;

    // 2. Duplicate content ID.
    if (seenContentIds.has(unit.contentId)) {
      errors.push('Duplicate content ID: "' + unit.contentId + '"');
    }
    seenContentIds.add(unit.contentId);

    // 3. Family/ID mismatch: the contentId's category prefix must equal
    // the unit's own declared category.
    if (idCategory !== unit.category) {
      errors.push('Family/ID mismatch: contentId "' + unit.contentId + '" prefix "' + idCategory + '" does not match declared category "' + unit.category + '"');
    }

    // 4. Nonexistent source ID -- only checked for families with a known
    // external data source (glossary/formula/reference/academy).
    if (nativeIds[unit.category]) {
      if (!nativeIds[unit.category].has(idSuffix)) {
        errors.push('Nonexistent source ID: "' + unit.contentId + '" -- no record with id "' + idSuffix + '" exists in the ' + unit.category + ' source data');
      }
    }

    // 5. Unsupported locale values / inconsistent source-family mappings.
    for (const localeCode of Object.keys(unit.languages || {})) {
      if (!validLocales.has(localeCode)) {
        errors.push('Unsupported locale "' + localeCode + '" in unit "' + unit.contentId + '" -- not registered in js/i18n/languages.js');
      }
      const entry = unit.languages[localeCode];
      if (!entry || typeof entry.status !== 'string' || typeof entry.url !== 'string') {
        errors.push('Malformed language entry for "' + unit.contentId + '" locale "' + localeCode + '"');
        continue;
      }
      // 6. Spanish translation status inconsistent with Spanish data:
      // Phase 8M's embedded-`es`-object data model (docs Section 4) means
      // a "translated" status should correspond to real Spanish data
      // existing in the source record once that model is populated. Today
      // no family has any `es` object populated, so a "translated" status
      // for a non-calculator, non-default-language entry is flagged as
      // drift -- it would mean the status claims translated content that
      // the source data does not yet contain.
      if (localeCode !== 'en' && entry.status === 'translated' && unit.category !== 'calculator') {
        const sourceHasEs = sourceRecordHasEsObject(unit.category, idSuffix);
        if (!sourceHasEs) {
          errors.push('Translation marked complete while required localized fields are missing: "' + unit.contentId + '" locale "' + localeCode + '" is "translated" but its source record has no "es" data object');
        }
      }
      // 7. English slug pairing sanity: the recorded URL's final path
      // segment should match the native record's own slug for families
      // with a known source (guards against "English slug changed
      // without correct pairing").
      if (localeCode === 'en' && nativeIds[unit.category] && nativeIds[unit.category].has(idSuffix)) {
        const expectedSlug = findSlugFor(unit.category, idSuffix);
        if (expectedSlug && entry.url !== '/' + expectedSlug) {
          warnings.push('English URL for "' + unit.contentId + '" ("' + entry.url + '") does not match the source record\'s current slug ("/' + expectedSlug + '") -- possible unregistered slug change');
        }
      }
    }
  }

  return { errors, warnings };
}

function sourceRecordHasEsObject(category, nativeId) {
  const fileByCategory = { glossary: ['data/glossary.json', 'terms'], formula: ['data/formulas.json', 'formulas'], reference: ['data/reference.json', 'pages'], academy: ['data/academy.json', 'articles'] };
  const entry = fileByCategory[category];
  if (!entry) return false;
  const data = loadJson(entry[0]);
  const rec = data[entry[1]].find((r) => r.id === nativeId);
  return !!(rec && rec.es);
}

function findSlugFor(category, nativeId) {
  const fileByCategory = { glossary: ['data/glossary.json', 'terms'], formula: ['data/formulas.json', 'formulas'], reference: ['data/reference.json', 'pages'], academy: ['data/academy.json', 'articles'] };
  const entry = fileByCategory[category];
  if (!entry) return null;
  const data = loadJson(entry[0]);
  const rec = data[entry[1]].find((r) => r.id === nativeId);
  return rec ? rec.slug : null;
}

module.exports = {
  buildNativeIdIndex,
  detectDrift,
};
