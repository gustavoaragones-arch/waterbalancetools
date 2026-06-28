/**
 * Run all programmatic page generators, then tools index and sitemap.
 * Order: … → hub pages → authority → ads → link matrix → calculator related tools → terminology → …
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

// Phase 6 authority content — run before link matrix so new pages enter the pool
require(path.join(__dirname, 'generate-authority-guides.js'));
require(path.join(__dirname, 'generate-authority-charts.js'));

// Phase 7 entity + question + comparison + hub pages
require(path.join(__dirname, 'generate-entity-pages.js'));
require(path.join(__dirname, 'inject-entity-schema.js'));
require(path.join(__dirname, 'generate-question-pages.js'));
require(path.join(__dirname, 'generate-comparison-pages.js'));
require(path.join(__dirname, 'generate-pool-system-hub.js'));

require(path.join(__dirname, 'generate-hub-pages.js'));
require(path.join(__dirname, 'inject-authority-layer.js'));
require(path.join(__dirname, 'inject-ads.js'));
require(path.join(__dirname, 'build-link-matrix.js'));
require(path.join(__dirname, 'inject-calculator-related-tools.js'));
require(path.join(__dirname, 'inject-secondary-canonical-context.js'));
require(path.join(__dirname, 'enforce-terminology.js'));
require(path.join(__dirname, 'inject-authority-chart-loop.js'));
require(path.join(__dirname, 'inject-chart-answer-snippet.js'));
require(path.join(__dirname, 'inject-winner-amplification.js'));
require(path.join(__dirname, 'inject-query-expansion.js'));
require(path.join(__dirname, 'generate-all-pages.js'));
require(path.join(__dirname, 'inject-seo-metadata.js'));
require(path.join(__dirname, 'inject-last-updated.js'));

const scripts = ['generate-tools-index.js', 'generate-sitemap.js'];

require(path.join(__dirname, 'generate-redirects.js'));

// Normalise footer across all pages — must run after all content generators
require(path.join(__dirname, 'inject-footer.js'));

// Validate all internal links before sitemap generation — fail fast on broken hrefs
console.log('Running check-broken-links.js...');
execSync('node scripts/check-broken-links.js', { cwd: root, stdio: 'inherit' });

scripts.forEach(script => {
  console.log('Running ' + script + '...');
  execSync('node scripts/' + script, { cwd: root, stdio: 'inherit' });
});
console.log('Done. Regenerate with: node scripts/run-all-generators.js');
