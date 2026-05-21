/**
 * Legacy duplicate chlorine pages at programmatic/ root (superseded by programmatic/chlorine/).
 */
const LEGACY_CHLORINE_SLUGS = [
  'how-much-chlorine-for-5000-gallon-pool',
  'how-much-chlorine-for-10000-gallon-pool',
  'how-much-chlorine-for-15000-gallon-pool',
  'how-much-chlorine-for-20000-gallon-pool'
];

function isLegacyProgrammaticChlorine(relPath) {
  const norm = String(relPath).replace(/\\/g, '/');
  return LEGACY_CHLORINE_SLUGS.some(
    slug => norm === 'programmatic/' + slug + '.html'
  );
}

module.exports = { LEGACY_CHLORINE_SLUGS, isLegacyProgrammaticChlorine };
