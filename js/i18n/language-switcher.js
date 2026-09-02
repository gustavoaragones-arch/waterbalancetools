'use strict';
/**
 * language-switcher.js — reusable language-switcher resolution (Phase 8D,
 * spec Section 22).
 *
 * Produces the list of language links a switcher UI would render for a
 * given content unit. This module does NOT render any HTML and is NOT
 * wired into any shared header/template in Phase 8D -- per spec Section
 * 22, no visible sitewide switcher is added yet. It exists so a future
 * phase can build the UI on top of a single, already-correct resolution
 * function rather than re-deriving this logic.
 *
 * Guarantees:
 *   - never fabricates a link to a translation that does not exist
 *     (delegates entirely to translation-status.js's "translated" gate)
 *   - always includes the current language in its own result (so a
 *     switcher can render the current language as selected/disabled)
 *   - never produces /es/es/... (delegates to locale-url.js)
 */

const { getLanguage } = require('./languages');
const { getLocalizedUrl } = require('./locale-url');
const translationStatus = require('./translation-status');

/**
 * resolveLanguageSwitcherLinks(contentId, currentPath, currentLanguageCode)
 *
 * `contentId` — the stable, language-neutral content identifier (see
 *   translation-status.js / docs Section 25 "page identity ≠ URL").
 * `currentPath` — the language-neutral path form of the current page
 *   (e.g. "/calculators/pool-volume-calculator"), used to derive each
 *   language's URL via the centralized resolver.
 * `currentLanguageCode` — the language the visitor is currently viewing.
 *
 * Returns an array of:
 *   { code, hreflang, name, nativeName, url, isCurrent, available }
 * ordered to match js/i18n/languages.js's LANGUAGES order. `available` is
 * true only when translation-status.js reports "translated" for that
 * language; the caller (a future template) decides whether to render
 * unavailable entries as disabled or omit them entirely -- this function
 * never omits data, it only ever reports the truth.
 */
function resolveLanguageSwitcherLinks(contentId, currentPath, currentLanguageCode) {
  const record = translationStatus.getRecord(contentId);
  const languages = require('./languages').getLanguages();

  return languages.map((lang) => {
    const available = record ? translationStatus.isTranslated(contentId, lang.code) : lang.code === currentLanguageCode;
    return {
      code: lang.code,
      hreflang: lang.hreflang,
      name: lang.name,
      nativeName: lang.nativeName,
      url: getLocalizedUrl(currentPath, lang.code),
      isCurrent: lang.code === currentLanguageCode,
      available,
    };
  });
}

/**
 * availableSwitcherLinks(...) — convenience wrapper returning only the
 * languages that are actually available (translated), i.e. exactly what
 * a real switcher UI should render as clickable links. The current
 * language is always included regardless of its translation-status
 * record (a page is definitionally "available" in the language it is
 * currently being viewed in).
 */
function availableSwitcherLinks(contentId, currentPath, currentLanguageCode) {
  return resolveLanguageSwitcherLinks(contentId, currentPath, currentLanguageCode)
    .filter((l) => l.available || l.isCurrent);
}

module.exports = {
  resolveLanguageSwitcherLinks,
  availableSwitcherLinks,
};
