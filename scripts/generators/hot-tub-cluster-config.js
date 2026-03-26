const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUTPUT_DIR = path.join(ROOT, 'programmatic', 'hot-tubs');

const SIZES = [200, 300, 400, 500, 600];

module.exports = {
  ROOT,
  OUTPUT_DIR,
  SIZES,
  BASE_URL: 'https://waterbalancetools.com',
  BASE_HREF: '../../'
};
