'use strict';

// Best-effort static mapping from directory conventions to the generator
// script that (per scripts/run-all-generators.js and file naming) most
// plausibly produced the page. Verified against scripts/generate-*.js
// filenames present in the repo; not a runtime trace.
const GENERATOR_MAP = [
  [/^glossary\//, 'generate-glossary.js'],
  [/^entities\//, 'generate-entities.js / generate-entity-pages.js'],
  [/^academy\//, 'generate-academy.js'],
  [/^formulas\//, 'generate-formulas.js'],
  [/^reference\/datasets\//, 'generate-datasets.js'],
  [/^reference\//, 'generate-reference.js'],
  [/^comparisons\//, 'generate-comparison-pages.js'],
  [/^guides\/questions\//, 'generate-question-pages.js'],
  [/^charts\//, 'generate-authority-charts.js'],
  [/^guides\//, 'generate-authority-guides.js'],
  [/^programmatic\/chlorine\//, 'generate-chlorine-pages.js'],
  [/^programmatic\/ph\//, 'generate-ph-pages.js'],
  [/^programmatic\/hot-tubs\//, 'generate-hot-tub-pages.js'],
  [/^programmatic\/.*\/index\.html$/, 'generate-hub-pages.js'],
  [/^programmatic\//, 'generate-question-pages.js (misc programmatic)'],
  [/(^|\/)index\.html$/, 'generate-hub-pages.js / generate-hubs.js'],
  [/^methodology\//, 'manual / trust content'],
  [/^editorial\//, 'manual / trust content'],
  [/^legal\//, 'manual / legal content'],
  [/^releases\//, 'manual / release notes'],
  [/^printables?\//, 'manual / printable resource'],
  [/^resources\//, 'manual / resource'],
  [/^maintenance\//, 'manual / maintenance guide'],
  [/^calculators\//, 'manual / calculator template'],
];

function detectGenerator(relPath) {
  for (const [re, gen] of GENERATOR_MAP) {
    if (re.test(relPath)) return gen;
  }
  return 'unknown / manual';
}

// [pathPrefixRegex, pageType, silo]
const TYPE_RULES = [
  [/^index\.html$/, 'homepage', 'core'],
  [/^404\.html$/, 'error', 'core'],
  [/^all-pages\.html$/, 'crawl-hub', 'core'],
  [/^about\//, 'trust', 'trust'],
  [/^legal\//, 'legal', 'trust'],
  [/^methodology\//, 'methodology', 'trust'],
  [/^editorial\//, 'editorial-policy', 'trust'],
  [/^provenance\//, 'provenance', 'trust'],
  [/^revisions\//, 'revision-log', 'trust'],
  [/^releases\//, 'release-notes', 'trust'],
  [/^qa\//, 'qa-internal', 'trust'],
  [/^calculators\/index\.html$/, 'calculator-hub', 'calculators'],
  [/^calculators\//, 'calculator', 'calculators'],
  [/^charts\//, 'chart', 'charts'],
  [/^[a-z0-9-]+-chart\.html$/, 'chart', 'charts'],
  [/^pool-chemistry-system\.html$/, 'chart', 'charts'],
  [/^comparisons\/index\.html$/, 'comparison-hub', 'comparisons'],
  [/^comparisons\//, 'comparison', 'comparisons'],
  [/^entities\//, 'entity', 'entities'],
  [/^glossary\//, 'glossary-term', 'glossary'],
  [/^guides\/questions\//, 'question-page', 'guides'],
  [/^guides\/index\.html$/, 'guide-hub', 'guides'],
  [/^guides\//, 'guide', 'guides'],
  [/^academy\/index\.html$/, 'academy-hub', 'academy'],
  [/^academy\//, 'academy-article', 'academy'],
  [/^reference\/datasets\//, 'dataset-page', 'reference'],
  [/^reference\/index\.html$/, 'reference-hub', 'reference'],
  [/^reference\//, 'reference-page', 'reference'],
  [/^formulas\/index\.html$/, 'formula-hub', 'formulas'],
  [/^formulas\//, 'formula-page', 'formulas'],
  [/^programmatic\/index\.html$/, 'programmatic-hub', 'programmatic'],
  [/^programmatic\/[a-z-]+\/index\.html$/, 'programmatic-subhub', 'programmatic'],
  [/^programmatic\//, 'programmatic-longtail', 'programmatic'],
  [/^maintenance\/index\.html$/, 'maintenance-hub', 'maintenance'],
  [/^maintenance\//, 'maintenance-guide', 'maintenance'],
  [/^printable\//, 'printable', 'resources'],
  [/^printables\//, 'printable', 'resources'],
  [/^resources\/index\.html$/, 'resource-hub', 'resources'],
  [/^resources\//, 'resource', 'resources'],
  [/^tools\//, 'utility', 'core'],
  [/^search\//, 'utility', 'core'],
  [/^templates\//, 'template-source', 'non-page'],
  [/^partials\//, 'partial-include', 'non-page'],
  [/^components\//, 'component-include', 'non-page'],
  [/^reports\//, 'internal-dashboard', 'internal-tooling'],
  [/^audit\//, 'internal-dashboard', 'internal-tooling'],
];

function classify(relPath) {
  for (const [re, pageType, silo] of TYPE_RULES) {
    if (re.test(relPath)) {
      const parts = relPath.split('/');
      let cluster;
      if (parts.length >= 3) cluster = parts.slice(0, 2).join('/');
      else if (parts.length === 2) cluster = parts[0];
      else cluster = 'root';
      return { page_type: pageType, silo, cluster, generator: detectGenerator(relPath) };
    }
  }
  return { page_type: 'unknown', silo: 'unknown', cluster: relPath.split('/')[0], generator: detectGenerator(relPath) };
}

const NON_PAGE_TYPES = new Set(['template-source', 'partial-include', 'component-include']);

module.exports = { classify, NON_PAGE_TYPES };
