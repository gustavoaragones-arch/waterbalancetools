#!/usr/bin/env node
/**
 * generate-spanish-cluster.js
 *
 * Phase 8E: generates the first Spanish production cluster (5 pool
 * calculator pages) from the current, committed English source files plus
 * the explicit translation data in scripts/data/i18n-es/cluster-translations.js.
 *
 * Deterministic and reusable: reads the FINAL English calculator HTML
 * (after all upstream generators/injectors have run -- trust panels,
 * footer, etc. -- see run-all-generators.js wiring), applies an ordered,
 * asserted set of exact-substring replacements (throws if a expected
 * English string is missing, catching drift immediately), rewrites
 * relative links so nothing points at a nonexistent /es/ page, and writes
 * the result to es/calculators/. No calculation logic, variable name,
 * function call, or dataset-driven value is ever touched -- only
 * human-readable display text and the small number of display-string-
 * building lines explicitly listed in the translation data.
 *
 * Run: node scripts/generate-spanish-cluster.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { getLocalizedCanonical } = require('../js/i18n/locale-url');
const { htmlOpenTag } = require('../js/i18n/html-lang');
const translations = require('./data/i18n-es/cluster-translations');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'calculators');
const OUT_DIR = path.join(ROOT, 'es', 'calculators');

const CLUSTER_FILES = [
  'chemical-calculator.html',
  'pool-volume-calculator.html',
  'pool-chlorine-calculator.html',
  'pool-ph-calculator.html',
  'pool-shock-calculator.html',
  // Phase 8G: hot-tub/spa cluster.
  'hot-tub-chlorine-calculator.html',
  'hot-tub-ph-calculator.html',
  'hot-tub-shock-calculator.html',
  'spa-volume-calculator.html',
  // Phase 8I: remaining Water Chemistry cluster members.
  'pool-alkalinity-calculator.html',
  'pool-cyanuric-acid-calculator.html',
  'pool-turnover-rate-calculator.html',
  'saltwater-pool-salt-calculator.html',
];
const CLUSTER_SET = new Set(CLUSTER_FILES);

function applyReplacements(html, pairs, fileLabel, optionalPairs) {
  let out = html;
  // Apply longer, more specific strings before shorter ones they may
  // contain (e.g. a JS-block sentence vs. the same sentence used
  // standalone elsewhere on the page) -- sorting by descending find-
  // length makes this correct automatically regardless of the order the
  // pairs happen to be declared in cluster-translations.js.
  const sorted = pairs.slice().sort((a, b) => b[0].length - a[0].length);
  for (const [find, replace] of sorted) {
    if (!out.includes(find)) {
      throw new Error(
        'generate-spanish-cluster: expected English string not found in ' + fileLabel + ' (source may have drifted -- update cluster-translations.js): ' +
        JSON.stringify(find.slice(0, 100))
      );
    }
    out = out.split(find).join(replace);
  }
  // Optional pairs (e.g. the related-calculators grid's cross-link to
  // ANOTHER cluster member, class="calc-card" non-active form): applied
  // only when present. A page never contains the non-active card for
  // ITSELF (its own card is always the "--active" variant, handled by a
  // separate, per-file, strictly-required rule), so these cannot use the
  // strict "must be found" assertion across all 9 cluster files -- each
  // is legitimately absent on exactly the one file that IS that
  // calculator. Still applied longest-first for the same reason as above.
  if (optionalPairs) {
    const sortedOptional = optionalPairs.slice().sort((a, b) => b[0].length - a[0].length);
    for (const [find, replace] of sortedOptional) {
      if (out.includes(find)) out = out.split(find).join(replace);
    }
  }
  return out;
}

/**
 * Rewrites href/src attributes so the page is correct once physically
 * relocated from calculators/X.html to es/calculators/X.html:
 *  - "../..." (parent-relative: style.css, js/*.js, or any sibling
 *    top-level dir like reference/, guides/, programmatic/, comparisons/)
 *    becomes root-absolute "/...", since these are all one level up from
 *    calculators/ regardless of the language prefix.
 *  - a bare relative "X.html" href that names one of the 5 cluster files
 *    is left untouched (correctly resolves to the Spanish sibling).
 *  - a bare relative "X.html" href naming any OTHER calculator page (no
 *    Spanish equivalent in this phase) is rewritten to the absolute
 *    English URL "/calculators/X" -- the explicit, policy-permitted
 *    fallback, never a link to a nonexistent /es/ page.
 *  - absolute (/, http, mailto, tel, javascript) and fragment (#) links
 *    are left untouched.
 */
function rewriteRelativeLinks(html) {
  return html.replace(/(href|src)="([^"]+)"/g, (match, attr, val) => {
    if (/^(https?:|mailto:|tel:|javascript:|#|\/)/.test(val)) return match;
    if (val.startsWith('../')) {
      return attr + '="/' + val.slice(3) + '"';
    }
    if (attr === 'href') {
      const bareName = val.split('?')[0].split('#')[0];
      if (CLUSTER_SET.has(bareName)) return match;
      if (bareName.endsWith('.html')) {
        const clean = bareName.replace(/\.html$/, '');
        const suffix = val.includes('?') ? val.slice(val.indexOf('?')) : '';
        return attr + '="/calculators/' + clean + suffix + '"';
      }
    }
    return match;
  });
}

function localizeSelfReferences(html, enUrlPath) {
  const enAbsolute = 'https://waterbalancetools.com' + enUrlPath;
  const esCanonical = getLocalizedCanonical(enUrlPath, 'es');
  // Covers every place the page's own absolute English URL appears
  // (WebApplication schema "url", BreadcrumbList "item" for the current
  // page, with or without a trailing .html -- both forms are present
  // across the 5 source files) with a single, exact-boundary substring
  // match (always followed by a literal quote, so it cannot partially
  // match a different, longer URL).
  let out = html.split(enAbsolute + '.html"').join(esCanonical + '"');
  out = out.split(enAbsolute + '"').join(esCanonical + '"');
  return { html: out, esCanonical };
}

function generate() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let count = 0;
  const written = [];

  for (const file of CLUSTER_FILES) {
    const srcPath = path.join(SRC_DIR, file);
    const html0 = fs.readFileSync(srcPath, 'utf8');

    // SHARED and per-file rules are combined into one pool and sorted
    // together by length (see applyReplacements) so a shared rule can
    // never partially clobber a longer per-file match, or vice versa.
    // SHARED_OPTIONAL (Phase 8G) holds rules that are legitimately absent
    // on some cluster files -- see applyReplacements' optionalPairs.
    const allPairs = translations[file].concat(translations.SHARED);
    let html = applyReplacements(html0, allPairs, file, translations.SHARED_OPTIONAL || []);
    html = rewriteRelativeLinks(html);

    if (!html.includes('<html lang="en">')) {
      throw new Error('generate-spanish-cluster: expected <html lang="en"> not found in ' + file);
    }
    html = html.replace('<html lang="en">', htmlOpenTag('es'));

    const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)">/);
    if (!canonicalMatch) throw new Error('generate-spanish-cluster: no canonical tag found in ' + file);
    const enUrlPath = canonicalMatch[1].replace('https://waterbalancetools.com', '');
    const { html: localizedHtml, esCanonical } = localizeSelfReferences(html, enUrlPath);
    html = localizedHtml.replace(canonicalMatch[0], '<link rel="canonical" href="' + esCanonical + '">');

    const outPath = path.join(OUT_DIR, file);
    fs.writeFileSync(outPath, html, 'utf8');
    written.push('es/calculators/' + file);
    count++;
  }

  for (const w of written) console.log('  -> ' + w);
  console.log('generate-spanish-cluster: wrote ' + count + ' Spanish pages');
}

// Runs at require() time, matching this codebase's established generator
// convention (see e.g. inject-footer.js, restructure-calculator-pages.js)
// -- run-all-generators.js wires generators in via a bare require(), not
// execSync, so top-level execution is what makes this script actually run
// as part of `npm run build`.
generate();

module.exports = { generate, rewriteRelativeLinks, applyReplacements, localizeSelfReferences, CLUSTER_FILES };
