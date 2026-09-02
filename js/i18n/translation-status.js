'use strict';
/**
 * translation-status.js — read/query API over data/i18n/translation-status.json
 * (Phase 8D, spec Section 24: translation completeness model).
 *
 * This is a NEW, explicitly separate store from the Phase 7Z content
 * pipeline (scripts/data/*.js -> populate-data.js -> data/*.json). It does
 * NOT hold translated content -- it holds STATUS records: which
 * language-neutral content unit has which localized status. See
 * docs/PHASE-8D-MULTILINGUAL-ARCHITECTURE.md Section 27
 * (Source-of-truth protection) for exactly how this relates to the
 * existing, protected data architecture.
 *
 * Status values (spec Section 24):
 *   "translated"                — a real, human-reviewed localized page exists
 *   "missing"                   — no localized version exists yet
 *   "review"                    — a localized draft exists but is not yet approved
 *   "intentionally_untranslated" — this content unit will not be localized
 *                                  (e.g. a US-unit-only calculator variant)
 *
 * Only "translated" content units may ever produce an hreflang alternate
 * (see js/i18n/hreflang.js) or a language-switcher link (see
 * js/i18n/language-switcher.js). This module is the single place that
 * distinction is decided.
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', '..', 'data', 'i18n', 'translation-status.json');
const VALID_STATUSES = new Set(['translated', 'missing', 'review', 'intentionally_untranslated']);

let cache = null;
function load() {
  if (cache) return cache;
  const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  cache = raw;
  return raw;
}

function reload() {
  cache = null;
  return load();
}

function getRecord(contentId) {
  const data = load();
  return data.units.find((u) => u.contentId === contentId) || null;
}

function getStatus(contentId, languageCode) {
  const record = getRecord(contentId);
  if (!record) return null;
  const entry = record.languages[languageCode];
  return entry ? entry.status : null;
}

function isTranslated(contentId, languageCode) {
  return getStatus(contentId, languageCode) === 'translated';
}

/**
 * getAvailableLanguages(contentId) — returns the language codes for which
 * this content unit has status "translated". This is the ONLY correct
 * input to js/i18n/hreflang.js's buildHreflangSet() -- never pass every
 * configured language, only the ones actually translated.
 */
function getAvailableLanguages(contentId) {
  const record = getRecord(contentId);
  if (!record) return [];
  return Object.keys(record.languages).filter((code) => record.languages[code].status === 'translated');
}

function listByStatus(languageCode, status) {
  if (!VALID_STATUSES.has(status)) {
    throw new Error('listByStatus: unknown status "' + status + '"');
  }
  const data = load();
  return data.units
    .filter((u) => u.languages[languageCode] && u.languages[languageCode].status === status)
    .map((u) => u.contentId);
}

function listMissing(languageCode) {
  return listByStatus(languageCode, 'missing');
}

function listReadyForTranslation(languageCode) {
  // "Ready" = has an English source AND is not yet translated or
  // intentionally excluded for the target language.
  const data = load();
  return data.units
    .filter((u) => {
      const en = u.languages.en;
      const target = u.languages[languageCode];
      return en && en.status === 'translated' && target && target.status === 'missing';
    })
    .map((u) => u.contentId);
}

function listNeedingReview(languageCode) {
  return listByStatus(languageCode, 'review');
}

function getAllUnits() {
  return load().units.slice();
}

module.exports = {
  VALID_STATUSES,
  DATA_PATH,
  load,
  reload,
  getRecord,
  getStatus,
  isTranslated,
  getAvailableLanguages,
  listByStatus,
  listMissing,
  listReadyForTranslation,
  listNeedingReview,
  getAllUnits,
};
