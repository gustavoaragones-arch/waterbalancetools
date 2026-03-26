/**
 * Shared config for chlorine programmatic cluster (generators + link builder).
 */
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUTPUT_DIR = path.join(ROOT, 'programmatic', 'chlorine');

/** Target pool sizes for long-tail chlorine pages (~11 URLs) */
const VOLUMES = [
  5000, 7000, 8000, 9000,
  10000, 12000, 15000,
  18000, 20000, 25000,
  30000
];

module.exports = {
  ROOT,
  OUTPUT_DIR,
  VOLUMES,
  BASE_URL: 'https://waterbalancetools.com',
  /** Relative path from programmatic/chlorine/*.html to site root */
  BASE_HREF: '../../'
};
