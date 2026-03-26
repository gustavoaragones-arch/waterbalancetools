const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUTPUT_DIR = path.join(ROOT, 'programmatic', 'ph');

/** pH adjustment scenarios (from → to) */
const LEVELS = [
  { from: 6.8, to: 7.2 },
  { from: 7.8, to: 7.4 },
  { from: 7.0, to: 7.4 },
  { from: 8.0, to: 7.5 }
];

function slugFile(lvl) {
  return (
    'how-to-adjust-ph-from-' +
    String(lvl.from).replace(/\./g, '-') +
    '-to-' +
    String(lvl.to).replace(/\./g, '-') +
    '.html'
  );
}

module.exports = {
  ROOT,
  OUTPUT_DIR,
  LEVELS,
  slugFile,
  BASE_URL: 'https://waterbalancetools.com',
  BASE_HREF: '../../'
};
