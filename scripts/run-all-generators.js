/**
 * Run all programmatic page generators, then tools index and sitemap.
 * Order: … → hub pages → authority layer → ads → link matrix → terminology → …
 * Usage: node scripts/run-all-generators.js
 */
const { execSync } = require('child_process');
const path = require('path');
const root = path.join(__dirname, '..');

const g = path.join(__dirname, 'generators');

require(path.join(g, 'generate-chlorine-pages.js'));
require(path.join(g, 'build-chlorine-links.js'));
require(path.join(g, 'generate-shock-pages.js'));
require(path.join(g, 'build-shock-links.js'));
require(path.join(g, 'generate-ph-pages.js'));
require(path.join(g, 'build-ph-links.js'));
require(path.join(g, 'generate-hot-tub-pages.js'));
require(path.join(g, 'build-hot-tub-links.js'));
require(path.join(g, 'generate-problem-pages.js'));
require(path.join(g, 'generate-explanation-pages.js'));
require(path.join(g, 'generate-behavior-pages.js'));

require(path.join(__dirname, 'generate-hub-pages.js'));
require(path.join(__dirname, 'inject-authority-layer.js'));
require(path.join(__dirname, 'inject-ads.js'));
require(path.join(__dirname, 'build-link-matrix.js'));
require(path.join(__dirname, 'enforce-terminology.js'));
require(path.join(__dirname, 'generate-all-pages.js'));
require(path.join(__dirname, 'inject-seo-metadata.js'));
require(path.join(__dirname, 'inject-last-updated.js'));

const scripts = ['generate-tools-index.js', 'generate-sitemap.js'];

scripts.forEach(script => {
  console.log('Running ' + script + '...');
  execSync('node scripts/' + script, { cwd: root, stdio: 'inherit' });
});
console.log('Done. Regenerate with: node scripts/run-all-generators.js');
