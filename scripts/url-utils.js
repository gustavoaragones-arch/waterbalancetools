/**
 * URL normalisation helpers for internal link generation.
 * Import anywhere: const { normalizeInternalUrl } = require('./url-utils');
 */

'use strict';

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

  // Split off any query/fragment
  const qIdx = url.search(/[?#]/);
  const suffix = qIdx >= 0 ? url.slice(qIdx) : '';
  let path = qIdx >= 0 ? url.slice(0, qIdx) : url;

  // Collapse duplicate consecutive folder segments (folder/folder but not folder/folder.html)
  // e.g. /calculators/calculators/foo → /calculators/foo
  let prev = null;
  while (prev !== path) {
    prev = path;
    path = path.replace(
      /\/([\w-]+)\/\1\//g,
      (match, seg) => '/' + seg + '/'
    );
  }

  // Strip trailing slash (except bare '/')
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  return path + suffix;
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
