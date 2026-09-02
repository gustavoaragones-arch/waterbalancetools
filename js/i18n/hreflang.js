'use strict';
/**
 * hreflang.js — centralized hreflang generation and validation (Phase 8D,
 * spec Sections 13-14).
 *
 * CRITICAL rule this module exists to enforce: hreflang alternates are
 * only ever emitted for language versions that ACTUALLY EXIST. A
 * translation-status record of anything other than "translated" must
 * never produce an hreflang <link>. This is what "no false hreflang"
 * means in practice, and it is what prevents thousands of invalid
 * hreflang relationships once programmatic Spanish generation begins.
 */

const { getLanguage, getDefaultLanguage, isValidLanguageCode } = require('./languages');
const { getLocalizedCanonical } = require('./locale-url');

/**
 * buildHreflangSet(path, availableLanguageCodes, options)
 *
 * `path` — the language-neutral (English-form) path for the content unit,
 *   e.g. "/calculators/pool-volume-calculator".
 * `availableLanguageCodes` — array of language codes for which a REAL,
 *   translated page actually exists (caller must derive this from the
 *   translation-status model -- see translation-status.js -- never pass a
 *   language code merely because the architecture supports it).
 * `options.emitXDefault` — whether to include an x-default entry. Per
 *   spec Section 13, x-default is only emitted when the project has
 *   actually established default-language x-default behavior; defaults to
 *   true here specifically because Section 13 states the intended
 *   relationship includes "x-default → English URL" for pages with
 *   multiple real language versions. Automatically suppressed whenever
 *   there is only one available language, since an x-default relationship
 *   is meaningless without at least one real alternate.
 *
 * Returns an array of { hreflang, href } entries, or [] if fewer than two
 * language versions are available (a single-language page has nothing to
 * cross-reference).
 */
function buildHreflangSet(path, availableLanguageCodes, options) {
  const opts = options || {};
  const emitXDefault = opts.emitXDefault !== false;

  const codes = Array.from(new Set((availableLanguageCodes || []).filter(isValidLanguageCode)));
  if (codes.length < 2) return [];

  const entries = codes.map((code) => ({
    hreflang: getLanguage(code).hreflang,
    href: getLocalizedCanonical(path, code),
  }));

  if (emitXDefault) {
    const def = getDefaultLanguage();
    if (codes.includes(def.code)) {
      entries.push({ hreflang: 'x-default', href: getLocalizedCanonical(path, def.code) });
    }
  }

  return entries;
}

/**
 * validateHreflangSet(entries, options) — reusable validation, intended
 * for use both by scripts/validate-hreflang.js (a standalone CLI, run
 * during the future Spanish rollout against real generated pages) and by
 * any generator that wants to self-check before writing output.
 *
 * `entries` — array of { hreflang, href } as produced by an actual page
 *   (or by buildHreflangSet()).
 * `options.knownUrls` — optional Set/Array of every real, currently-built
 *   URL (e.g. from data/navigation.json) -- when supplied, each href is
 *   checked against it to catch "hreflang pointing to a 404 page".
 * `options.pageLanguage` — the language code of the page this hreflang
 *   set was found on -- when supplied, checks self-reference (the page's
 *   own language must appear in its own hreflang set, per Google's
 *   documented requirement) and that the page's own href in the set
 *   equals the page's own canonical.
 * `options.pageCanonical` — the page's own canonical URL, required to
 *   check the self-reference href value when pageLanguage is supplied.
 *
 * Returns { valid: boolean, errors: string[] }.
 */
function validateHreflangSet(entries, options) {
  const opts = options || {};
  const errors = [];
  const list = Array.isArray(entries) ? entries : [];

  const seenHreflang = new Set();
  const byHreflang = new Map();
  for (const e of list) {
    if (!e || typeof e.hreflang !== 'string' || typeof e.href !== 'string') {
      errors.push('Malformed hreflang entry: ' + JSON.stringify(e));
      continue;
    }
    if (e.hreflang !== 'x-default' && !isValidLanguageCodeOrRegion(e.hreflang)) {
      errors.push('Invalid hreflang language code: "' + e.hreflang + '"');
    }
    if (seenHreflang.has(e.hreflang)) {
      errors.push('Duplicate hreflang entry: "' + e.hreflang + '"');
    }
    seenHreflang.add(e.hreflang);
    byHreflang.set(e.hreflang, e.href);

    if (!/^https:\/\/waterbalancetools\.com(\/|$)/.test(e.href)) {
      errors.push('hreflang "' + e.hreflang + '" href is not an absolute waterbalancetools.com URL: "' + e.href + '"');
    }
  }

  if (opts.knownUrls) {
    const known = opts.knownUrls instanceof Set ? opts.knownUrls : new Set(opts.knownUrls);
    for (const e of list) {
      if (e && e.href && !known.has(e.href) && !known.has(e.href.replace(/^https:\/\/waterbalancetools\.com/, ''))) {
        errors.push('hreflang "' + e.hreflang + '" points to a URL not present in the known-URL set (possible 404): "' + e.href + '"');
      }
    }
  }

  if (opts.pageLanguage) {
    const lang = getLanguage(opts.pageLanguage);
    if (!lang) {
      errors.push('Unknown pageLanguage supplied to validator: "' + opts.pageLanguage + '"');
    } else if (list.length > 0) {
      if (!byHreflang.has(lang.hreflang)) {
        errors.push('Missing self-reference: page language "' + lang.hreflang + '" does not appear in its own hreflang set');
      } else if (opts.pageCanonical && byHreflang.get(lang.hreflang) !== opts.pageCanonical) {
        errors.push('Self-reference mismatch: hreflang "' + lang.hreflang + '" href ("' + byHreflang.get(lang.hreflang) + '") does not equal the page\'s own canonical ("' + opts.pageCanonical + '")');
      }
    }
  }

  if (opts.pageCanonical && byHreflang.size > 0) {
    for (const [hreflang, href] of byHreflang) {
      if (hreflang !== 'x-default' && href === opts.pageCanonical && opts.pageLanguage) {
        const lang = getLanguage(opts.pageLanguage);
        if (lang && hreflang !== lang.hreflang) {
          errors.push('Canonical/hreflang conflict: hreflang "' + hreflang + '" points at this page\'s own canonical but is not this page\'s own language ("' + opts.pageLanguage + '")');
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function isValidLanguageCodeOrRegion(code) {
  // Accepts bare language codes ("es") and language-region codes
  // ("es-MX") for forward compatibility, without requiring every region
  // variant to be registered in languages.js up front.
  return /^[a-z]{2}(-[A-Z]{2})?$/.test(code);
}

/**
 * reciprocityCheck(pageHreflangSets) — given a map of
 * { canonicalUrl -> hreflang entries } for a whole site (or a batch of
 * pages), verifies that every alternate relationship is reciprocal: if
 * page A lists page B as an alternate, page B must list page A back.
 * Returns { valid, errors }.
 */
function reciprocityCheck(pageHreflangSets) {
  const errors = [];
  const pages = pageHreflangSets instanceof Map ? pageHreflangSets : new Map(Object.entries(pageHreflangSets || {}));

  for (const [pageUrl, entries] of pages) {
    for (const e of entries || []) {
      if (e.hreflang === 'x-default') continue;
      if (e.href === pageUrl) continue; // self-reference, not a cross-link
      const target = pages.get(e.href);
      if (!target) {
        errors.push('Page "' + pageUrl + '" links to "' + e.href + '" but that target page has no hreflang set of its own to check reciprocity against');
        continue;
      }
      const back = target.find((t) => t.href === pageUrl);
      if (!back) {
        errors.push('Non-reciprocal hreflang: "' + pageUrl + '" -> "' + e.href + '" ("' + e.hreflang + '") has no return link back');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  buildHreflangSet,
  validateHreflangSet,
  reciprocityCheck,
};
