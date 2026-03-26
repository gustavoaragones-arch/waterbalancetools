const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUTPUT_DIR = path.join(ROOT, 'programmatic', 'shock');

const VOLUMES = [5000, 10000, 15000, 20000, 25000, 30000];

module.exports = {
  ROOT,
  OUTPUT_DIR,
  VOLUMES,
  BASE_URL: 'https://waterbalancetools.com',
  BASE_HREF: '../../'
};
