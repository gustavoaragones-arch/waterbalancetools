/**
 * Run all programmatic page generators, then tools index and sitemap.
 * Usage: node scripts/run-all-generators.js
 */
const { execSync } = require('child_process');
const path = require('path');
const root = path.join(__dirname, '..');

const scripts = [
  'generate-chlorine-pages.js',
  'generate-shock-pages.js',
  'generate-ph-pages.js',
  'generate-hot-tub-pages.js',
  'generate-tools-index.js',
  'generate-sitemap.js'
];

scripts.forEach(script => {
  console.log('Running ' + script + '...');
  execSync('node scripts/' + script, { cwd: root, stdio: 'inherit' });
});
console.log('Done. Regenerate with: node scripts/run-all-generators.js');
