'use strict';
/**
 * reference-locale-scope.js — Phase 8M explicit scope boundary for the
 * initial Reference localization architecture (spec Task H / Task 11).
 *
 * Phase 8L found (and this module's own validator, scripts/validate-phase-8m.js,
 * re-derives from the actual repository structure on every run rather than
 * trusting a hardcoded count) that reference/ contains 37 real .html files,
 * of which:
 *   - 25 are generated from data/reference.json (the JSON-driven,
 *     knowledge-* templated architecture this Phase 8M plumbing targets)
 *   - 1 is the reference/index.html hub (not a content record)
 *   - 11 use an older, different template (chart-table/credibility/
 *     key-takeaways classes, introduced in Phase 7R) with no corresponding
 *     JSON data source -- OUT OF SCOPE for this localization architecture
 * Separately, reference/datasets/ contains 16 noindex machine-readable
 * dataset-documentation pages -- also OUT OF SCOPE (never reader content).
 *
 * CORRECTION TO PHASE 8L: Phase 8L's own document stated "12 legacy
 * pages," miscounting reference/calculator-directory.html as a legacy
 * page. Direct verification in Phase 8M confirms calculator-directory IS
 * one of the 25 data/reference.json-driven records (its slug
 * "reference/calculator-directory" is present in that file). The correct
 * legacy count is 11, not 12. See docs/PHASE-8M-CORE-REFERENCE-LOCALIZATION-IMPLEMENTATION.md
 * Section 9 for the full correction record.
 */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');

// The 11 confirmed legacy, older-template pages -- explicit and named
// (not "whatever isn't in reference.json today") so a future addition of
// a new reference.json record can never silently shrink this excluded
// set, and so a future accidental new legacy-style page cannot silently
// slip into scope without this list being deliberately updated.
const LEGACY_EXCLUDED = new Set([
  'calcium-hardness-explained.html',
  'chlorine-explained.html',
  'combined-chlorine-explained.html',
  'common-pool-chemistry-mistakes.html',
  'cyanuric-acid-explained.html',
  'free-chlorine-explained.html',
  'pool-chemicals-explained.html',
  'pool-chemistry-reference.html',
  'salt-water-generator-explained.html',
  'shock-treatment-explained.html',
  'total-alkalinity-explained.html',
]);

const HUB_EXCLUDED = new Set(['index.html']);

const EXPECTED_JSON_DRIVEN_COUNT = 25;
const EXPECTED_LEGACY_COUNT = 11;
const EXPECTED_NOINDEX_DATASET_COUNT = 16;

/**
 * getJsonDrivenScope() — the deterministic, repository-derived set of
 * in-scope reference filenames, taken directly from data/reference.json's
 * own `pages[].slug` list (never filename-guessed).
 */
function getJsonDrivenScope() {
  const data = require(path.join(ROOT, 'data', 'reference.json'));
  return new Set(data.pages.map((p) => p.slug.split('/').pop() + '.html'));
}

/**
 * getNoindexDatasetPages() — walks reference/datasets/ and returns every
 * .html file found there (all of which are expected to be noindex).
 */
function getNoindexDatasetPages() {
  const dir = path.join(ROOT, 'reference', 'datasets');
  const out = [];
  function walk(d, rel) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      const r = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) { walk(full, r); continue; }
      if (e.name.endsWith('.html')) out.push('reference/datasets/' + r);
    }
  }
  if (fs.existsSync(dir)) walk(dir, '');
  return out;
}

/**
 * classifyReferenceScope() — the single authoritative scope check.
 * Returns { jsonDriven: string[], legacy: string[], hub: string[],
 * noindexDatasets: string[], unexpected: string[] }. `unexpected` is any
 * reference/*.html file this module cannot place in one of the three
 * known top-level-reference-directory buckets -- a non-empty unexpected
 * array means the repository structure changed and this module (and the
 * accompanying LEGACY_EXCLUDED list) needs deliberate review, not silent
 * absorption into either scope.
 */
function classifyReferenceScope() {
  const jsonDrivenSet = getJsonDrivenScope();
  const allFiles = fs.readdirSync(path.join(ROOT, 'reference')).filter((f) => f.endsWith('.html'));

  const jsonDriven = [];
  const legacy = [];
  const hub = [];
  const unexpected = [];

  for (const f of allFiles) {
    if (jsonDrivenSet.has(f)) jsonDriven.push(f);
    else if (HUB_EXCLUDED.has(f)) hub.push(f);
    else if (LEGACY_EXCLUDED.has(f)) legacy.push(f);
    else unexpected.push(f);
  }

  return {
    jsonDriven,
    legacy,
    hub,
    noindexDatasets: getNoindexDatasetPages(),
    unexpected,
  };
}

/**
 * isInLocalizationScope(filename) — the single function any future
 * Spanish-generation code must call before treating a reference/ page as
 * eligible for this localization architecture.
 */
function isInLocalizationScope(filename) {
  return getJsonDrivenScope().has(filename);
}

module.exports = {
  LEGACY_EXCLUDED,
  HUB_EXCLUDED,
  EXPECTED_JSON_DRIVEN_COUNT,
  EXPECTED_LEGACY_COUNT,
  EXPECTED_NOINDEX_DATASET_COUNT,
  getJsonDrivenScope,
  getNoindexDatasetPages,
  classifyReferenceScope,
  isInLocalizationScope,
};
