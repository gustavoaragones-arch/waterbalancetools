'use strict';
/**
 * languages.js — the single, authoritative language configuration for
 * WaterBalanceTools' multilingual architecture (Phase 8D).
 *
 * Every language-aware generator, resolver, and validator must read
 * language identity (code, hreflang value, URL prefix, default status,
 * text direction) from THIS module. Do not hard-code "es"/"/es" strings,
 * or scatter a second language list, anywhere else in the repository --
 * see docs/PHASE-8D-MULTILINGUAL-ARCHITECTURE.md Section 4 (Language
 * model) for why a single source of truth is required.
 *
 * Adding a future language (e.g. French) means adding one entry here --
 * consuming code (locale-url.js, hreflang.js, translation-status.js,
 * language-switcher.js) is written generically against this list, not
 * against "en"/"es" specifically, except where English is referenced as
 * THE default language (which is a property lookup, not a hard-coded
 * assumption -- see getDefaultLanguage()).
 */

const LANGUAGES = [
  {
    code: 'en',
    hreflang: 'en',
    name: 'English',
    nativeName: 'English',
    default: true,
    pathPrefix: '',
    direction: 'ltr',
  },
  {
    code: 'es',
    hreflang: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    default: false,
    pathPrefix: '/es',
    direction: 'ltr',
  },
];

const BY_CODE = new Map(LANGUAGES.map((l) => [l.code, l]));

function getLanguages() {
  return LANGUAGES.slice();
}

function getLanguage(code) {
  return BY_CODE.get(String(code || '').toLowerCase()) || null;
}

function isValidLanguageCode(code) {
  return BY_CODE.has(String(code || '').toLowerCase());
}

function getLanguageCodes() {
  return LANGUAGES.map((l) => l.code);
}

function getDefaultLanguage() {
  const def = LANGUAGES.find((l) => l.default);
  if (!def) {
    throw new Error('languages.js: no language is marked default -- exactly one LANGUAGES entry must have default: true');
  }
  return def;
}

function getNonDefaultLanguages() {
  return LANGUAGES.filter((l) => !l.default);
}

// Fail loudly at load time if the config is internally inconsistent --
// every consumer of this module depends on these invariants holding.
(function assertInvariants() {
  const defaults = LANGUAGES.filter((l) => l.default);
  if (defaults.length !== 1) {
    throw new Error('languages.js: exactly one LANGUAGES entry must have default: true, found ' + defaults.length);
  }
  if (defaults[0].pathPrefix !== '') {
    throw new Error('languages.js: the default language must have pathPrefix: "" (English URLs must remain unprefixed)');
  }
  const codes = new Set();
  const prefixes = new Set();
  for (const l of LANGUAGES) {
    if (codes.has(l.code)) throw new Error('languages.js: duplicate language code "' + l.code + '"');
    codes.add(l.code);
    if (!l.default) {
      if (!/^\/[a-z]{2}$/.test(l.pathPrefix)) {
        throw new Error('languages.js: non-default language "' + l.code + '" must have a pathPrefix like "/xx", got "' + l.pathPrefix + '"');
      }
      if (prefixes.has(l.pathPrefix)) throw new Error('languages.js: duplicate pathPrefix "' + l.pathPrefix + '"');
      prefixes.add(l.pathPrefix);
    }
  }
})();

module.exports = {
  LANGUAGES,
  getLanguages,
  getLanguage,
  isValidLanguageCode,
  getLanguageCodes,
  getDefaultLanguage,
  getNonDefaultLanguages,
};
