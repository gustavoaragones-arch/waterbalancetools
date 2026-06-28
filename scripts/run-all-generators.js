/**
 * run-all-generators.js
 *
 * Mandatory build order (Phase 5A):
 *   1.  Generate calculators (programmatic clusters)
 *   2.  Generate resources (/resources/)
 *   3.  Generate academy   (/academy/)
 *   4.  Generate formulas  (/formulas/)
 *   5.  Generate glossary  (/glossary/)
 *   6.  Generate reference (/reference/)
 *   7.  Inject nav (6-pillar header + hamburger)
 *   8.  Restructure calculator pages (UX hierarchy)
 *   9.  Inject footer
 *   10. Generate navigation index (data/navigation.json)
 *   11. Generate breadcrumbs (injects into every page)
 *   12. Generate search index (data/search-index.json)
 *   13. Validate broken links
 *   14. Generate sitemaps (grouped XML)
 *
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

require(path.join(__dirname, 'generate-redirects.js'));

// ── Step 2: Resources ─────────────────────────────────────────────────────────
require(path.join(__dirname, 'generate-resource-pages.js'));

// ── Steps 3–6: Knowledge platform content generators ─────────────────────────
require(path.join(__dirname, 'generate-academy.js'));
require(path.join(__dirname, 'generate-formulas.js'));
require(path.join(__dirname, 'generate-glossary.js'));
require(path.join(__dirname, 'generate-reference.js'));

// ── Step 7: Canonical nav (6-pillar header + hamburger) ──────────────────────
require(path.join(__dirname, 'inject-nav.js'));

// ── Step 8: Restructure calculator pages to new UX hierarchy ─────────────────
require(path.join(__dirname, 'restructure-calculator-pages.js'));

// ── Step 9: Canonical footer ──────────────────────────────────────────────────
require(path.join(__dirname, 'inject-footer.js'));

// ── Step 10: Navigation index ─────────────────────────────────────────────────
require(path.join(__dirname, 'generate-navigation.js'));

// ── Step 11: Breadcrumbs ──────────────────────────────────────────────────────
require(path.join(__dirname, 'generate-breadcrumbs.js'));

// ── Step 12: Search index ─────────────────────────────────────────────────────
require(path.join(__dirname, 'generate-search-index.js'));

// ── Step 13: Validate internal links (fail-fast gate) ────────────────────────
console.log('Running check-broken-links.js...');
execSync('node scripts/check-broken-links.js', { cwd: root, stdio: 'inherit' });

// ── Step 14: Grouped sitemaps ─────────────────────────────────────────────────
console.log('Running generate-sitemaps.js...');
execSync('node scripts/generate-sitemaps.js', { cwd: root, stdio: 'inherit' });

// Legacy flat tools index (kept for backward compat)
console.log('Running generate-tools-index.js...');
execSync('node scripts/generate-tools-index.js', { cwd: root, stdio: 'inherit' });

console.log('Done. Regenerate with: node scripts/run-all-generators.js');
