/**
 * Single source of truth for legacy URL → canonical redirects.
 */
const LEGACY_CHLORINE_SLUGS = [
  'how-much-chlorine-for-5000-gallon-pool',
  'how-much-chlorine-for-10000-gallon-pool',
  'how-much-chlorine-for-15000-gallon-pool',
  'how-much-chlorine-for-20000-gallon-pool'
];

const EXPLANATION_SLUGS = [
  'why-ph-affects-chlorine',
  'what-is-pool-alkalinity',
  'why-shower-before-pool'
];

/** @returns {Map<string, string>} pathname (no .html) → destination pathname */
function buildExactRedirectMap() {
  const map = new Map();
  for (const slug of LEGACY_CHLORINE_SLUGS) {
    map.set('/programmatic/' + slug, '/programmatic/chlorine/' + slug);
  }
  for (const slug of EXPLANATION_SLUGS) {
    map.set('/programmatic/explanation/' + slug, '/programmatic/explanations/' + slug);
    map.set('/explanations/' + slug, '/programmatic/explanations/' + slug);
  }
  return map;
}

function isLegacyProgrammaticChlorine(relPath) {
  const norm = String(relPath).replace(/\\/g, '/');
  return LEGACY_CHLORINE_SLUGS.some(
    slug => norm === 'programmatic/' + slug + '.html'
  );
}

module.exports = {
  LEGACY_CHLORINE_SLUGS,
  EXPLANATION_SLUGS,
  buildExactRedirectMap,
  isLegacyProgrammaticChlorine
};
