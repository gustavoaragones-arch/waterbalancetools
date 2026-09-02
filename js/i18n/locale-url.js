'use strict';
/**
 * locale-url.js — the centralized, language-aware URL resolver (Phase 8D,
 * spec Section 11).
 *
 * This module WRAPS js/url/url-engine.js (the existing, protected URL
 * normalization engine used by every generator/validator/schema builder)
 * rather than duplicating any of its path-cleaning logic. url-engine.js
 * itself is untouched -- Phase 8D adds a new layer on top of it instead of
 * modifying the 26 existing call sites that depend on its current,
 * language-agnostic behavior.
 *
 * All language-aware generators (once a future phase authorizes Spanish
 * production generation) must go through getLocalizedUrl()/
 * getLocalizedCanonical() rather than concatenating "/es" + path by hand
 * -- see spec Section 11 ("Do not scatter '/es' + path throughout the
 * repository").
 */

const urlEngine = require('../url/url-engine');
const { getLanguages, getLanguage, getDefaultLanguage, isValidLanguageCode } = require('./languages');

/**
 * stripLanguagePrefix(path) -- detects and removes a leading language
 * path-prefix, if present. Returns { code, path } where `code` is the
 * detected language's code (or the default language's code if no
 * recognized prefix is present) and `path` is the remaining, prefix-free
 * path. This is the single mechanism every other function in this module
 * uses to avoid double-prefixing (/es/es/...).
 */
function stripLanguagePrefix(rawPath) {
  const clean = urlEngine.buildUrl(rawPath == null ? '/' : rawPath);
  for (const lang of getLanguages()) {
    if (!lang.pathPrefix) continue; // skip the default language (empty prefix)
    if (clean === lang.pathPrefix || clean.startsWith(lang.pathPrefix + '/')) {
      const rest = clean.slice(lang.pathPrefix.length) || '/';
      return { code: lang.code, path: rest };
    }
  }
  return { code: getDefaultLanguage().code, path: clean };
}

/**
 * detectLanguageFromPath(path) -- returns the language code implied by a
 * path's prefix, defaulting to the default language when no recognized
 * prefix is present.
 */
function detectLanguageFromPath(rawPath) {
  return stripLanguagePrefix(rawPath).code;
}

/**
 * getLocalizedUrl(path, languageCode) -- the single authoritative
 * resolver. Always strips any existing language prefix first (so it is
 * safe to call on a path that may already be localized -- prevents
 * /es/es/... regardless of caller discipline), then re-applies the
 * requested language's prefix and normalizes through url-engine.
 */
function getLocalizedUrl(rawPath, languageCode) {
  if (!isValidLanguageCode(languageCode)) {
    throw new Error('getLocalizedUrl: unknown language code "' + languageCode + '" -- see js/i18n/languages.js');
  }
  const lang = getLanguage(languageCode);
  const { path: basePath } = stripLanguagePrefix(rawPath);
  if (!lang.pathPrefix) return urlEngine.buildUrl(basePath);
  return urlEngine.buildUrl(lang.pathPrefix + basePath);
}

/**
 * getLocalizedCanonical(path, languageCode) -- the absolute, canonical
 * URL for a page's localized equivalent. Per spec Section 12: a
 * translated page's canonical is ALWAYS self-referential to its own
 * language version, never back to English.
 */
function getLocalizedCanonical(rawPath, languageCode) {
  return urlEngine.canonicalUrl(getLocalizedUrl(rawPath, languageCode));
}

/**
 * withLanguage(path, languageCode) -- alias of getLocalizedUrl, provided
 * for readability at language-switcher call sites (spec Section 22).
 */
function withLanguage(rawPath, languageCode) {
  return getLocalizedUrl(rawPath, languageCode);
}

module.exports = {
  stripLanguagePrefix,
  detectLanguageFromPath,
  getLocalizedUrl,
  getLocalizedCanonical,
  withLanguage,
};
