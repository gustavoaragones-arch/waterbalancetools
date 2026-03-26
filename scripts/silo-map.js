const path = require('path');

/**
 * Silo classification for pool chemistry content (internal linking / hubs).
 * Order matters for slug-only matching: ph before chlorine so "why-ph-affects-chlorine" maps to pH, not chlorine.
 */
const SILOS = {
  ph: ['ph', 'acid', 'base', 'lower ph', 'raise ph'],
  alkalinity: ['alkalinity', 'buffer', 'bicarbonate'],
  hotTubs: ['hot tub', 'spa', 'hot-tub'],
  chlorine: ['chlorine', 'shock', 'green pool', 'chlorinate']
};

const SILO_KEYS = Object.keys(SILOS);

/** Hub page path from site root (no leading slash) */
const SILO_HUBS = {
  chlorine: 'guides/chlorine-guide.html',
  ph: 'guides/ph-guide.html',
  alkalinity: 'guides/alkalinity-guide.html',
  hotTubs: 'guides/hot-tub-chemistry.html',
  general: 'guides/pool-chemistry-basics.html'
};

/** Primary calculator per silo (site uses hot-tub-chlorine-calculator, not hot-tub-calculator) */
const SILO_CALCULATORS = {
  chlorine: 'calculators/pool-chlorine-calculator.html',
  ph: 'calculators/pool-ph-calculator.html',
  alkalinity: 'calculators/pool-alkalinity-calculator.html',
  hotTubs: 'calculators/hot-tub-chlorine-calculator.html',
  general: 'calculators/chemical-calculator.html'
};

/**
 * @param {string} slug - filename or path fragment (e.g. "pool-ph-calculator.html")
 * @returns {'chlorine'|'ph'|'alkalinity'|'hotTubs'|'general'}
 */
function getSilo(slug) {
  const s = String(slug)
    .replace(/\.html$/i, '')
    .replace(/\\/g, '/')
    .replace(/-/g, ' ')
    .toLowerCase();

  for (const silo of SILO_KEYS) {
    for (const keyword of SILOS[silo]) {
      if (s.includes(keyword.toLowerCase())) {
        return silo;
      }
    }
  }
  return 'general';
}

/**
 * Folder-aware silo (programmatic subfolders override ambiguous filenames).
 * @param {string} relPath path from repo root e.g. programmatic/chlorine/foo.html
 */
function getSiloForPath(relPath) {
  const p = String(relPath).replace(/\\/g, '/').toLowerCase();
  if (p.includes('/programmatic/chlorine/') || p.includes('/programmatic/shock/')) return 'chlorine';
  if (p.includes('/programmatic/ph/')) return 'ph';
  if (p.includes('/programmatic/alkalinity/')) return 'alkalinity';
  if (p.includes('/programmatic/hot-tubs/')) return 'hotTubs';
  return getSilo(path.basename(relPath));
}

function getHubRel(silo) {
  return SILO_HUBS[silo] || SILO_HUBS.general;
}

function getCalculatorRel(silo) {
  return SILO_CALCULATORS[silo] || SILO_CALCULATORS.general;
}

module.exports = {
  SILOS,
  SILO_KEYS,
  SILO_HUBS,
  SILO_CALCULATORS,
  getSilo,
  getSiloForPath,
  getHubRel,
  getCalculatorRel
};
