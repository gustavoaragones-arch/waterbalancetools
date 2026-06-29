/**
 * URL normalisation helpers for internal link generation.
 * Import anywhere: const { normalizeInternalUrl } = require('./url-utils');
 */

'use strict';
const urlEngine = require('../js/url/url-engine');

const SITE_FOLDERS = [
  'calculators', 'guides', 'charts', 'programmatic', 'reference',
  'maintenance', 'comparisons', 'printables', 'printable', 'legal',
  'tools', 'templates', 'components', 'assets', 'js', 'data', 'lib'
];

/**
 * Collapse accidental duplicate path segments.
 *   /calculators/calculators/pool-ph-calculator  →  /calculators/pool-ph-calculator
 *   /legal/legal.html                             →  /legal/legal.html   (KEPT — valid filename)
 *   /guides/guides/pool-chemistry-basics          →  /guides/pool-chemistry-basics
 *
 * Rules
 * ─────
 * • Only collapse when the SAME segment appears as consecutive folder/folder
 *   (not folder/filename, e.g. /legal/legal.html is intentional).
 * • Works on both absolute (/foo) and relative (../foo) URLs.
 * • Strips trailing slashes.
 * • Leaves protocol-relative and external URLs untouched.
 *
 * @param {string} url
 * @returns {string}
 */
function normalizeInternalUrl(url) {
  if (typeof url !== 'string') return url;
  // Don't touch external or protocol-relative URLs
  if (/^(https?:)?\/\//.test(url)) return url;
  return urlEngine.normalizeHref(url);
}

/**
 * Known bad patterns that should never appear in generated URLs.
 * Returns an array of pattern descriptions that match, or [].
 * @param {string} url
 * @returns {string[]}
 */
function detectUrlProblems(url) {
  if (typeof url !== 'string' || /^(https?:)?\/\//.test(url)) return [];
  const issues = [];
  // Duplicate folder segments
  if (/([\w-]+)\/([\w-]+)(?=\/)/.test(url)) {
    const m = url.match(/([\w-]+)\/([\w-]+)(?=\/)/g) || [];
    for (const pair of m) {
      const parts = pair.split('/');
      if (parts[0] === parts[1] && SITE_FOLDERS.includes(parts[0])) {
        issues.push('duplicate-folder:' + parts[0]);
      }
    }
  }
  // Four or more relative escapes (../../../..)
  if (/(\.\.\/).*(\.\.\/).*(\.\.\/).*(\.\.\/)/.test(url)) {
    issues.push('deep-relative-escape');
  }
  // Double slash mid-URL
  if (/(?<!:)\/\//.test(url)) {
    issues.push('double-slash');
  }
  return issues;
}

module.exports = { normalizeInternalUrl, detectUrlProblems, SITE_FOLDERS };
