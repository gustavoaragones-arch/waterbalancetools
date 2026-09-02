'use strict';
/**
 * html-lang.js — tiny, shared helper for the <html lang="…" dir="…">
 * attributes (Phase 8D, spec Section 15).
 *
 * Phase 8D deliberately does NOT modify the ~25 existing generators that
 * currently hard-code `<html lang="en">` in their own template strings --
 * doing so would mean touching (and risking a build-diff on) every one of
 * them for zero present benefit, since no non-English page exists yet.
 * See docs/PHASE-8D-MULTILINGUAL-ARCHITECTURE.md Section 15 for the exact
 * list and the documented migration path.
 *
 * This helper exists so that FUTURE language-aware generators (starting
 * with the Spanish rollout phase) have one correct, shared way to emit
 * this attribute instead of each hand-writing `lang="es"` independently.
 */

const { getLanguage } = require('./languages');

/**
 * htmlLangAttr(languageCode) -- returns a ready-to-splice attribute
 * string, e.g. htmlLangAttr('es') -> 'lang="es"'.
 */
function htmlLangAttr(languageCode) {
  const lang = getLanguage(languageCode);
  if (!lang) throw new Error('htmlLangAttr: unknown language code "' + languageCode + '"');
  return 'lang="' + lang.code + '"';
}

/**
 * htmlOpenTag(languageCode) -- returns a full <html> opening tag,
 * including dir="rtl" only when the language's direction requires it (all
 * currently-configured languages are ltr, but this keeps the helper
 * correct for a future rtl language without special-casing at call
 * sites).
 */
function htmlOpenTag(languageCode) {
  const lang = getLanguage(languageCode);
  if (!lang) throw new Error('htmlOpenTag: unknown language code "' + languageCode + '"');
  const dir = lang.direction && lang.direction !== 'ltr' ? ' dir="' + lang.direction + '"' : '';
  return '<html ' + htmlLangAttr(languageCode) + dir + '>';
}

module.exports = {
  htmlLangAttr,
  htmlOpenTag,
};
