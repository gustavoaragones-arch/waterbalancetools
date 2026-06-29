/**
 * run-all-generators.js
 *
 * Mandatory build order (Phase 5A / 5A.5 / 5A.75):
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

// ── Phase 5B.8 Part 1 preflight: URL normalization engine gate ───────────────
console.log('Running validate-url-engine.js...');
execSync('node scripts/validate-url-engine.js', { cwd: root, stdio: 'inherit' });
console.log('Running test-url-engine.js...');
execSync('node scripts/test-url-engine.js', { cwd: root, stdio: 'inherit' });
console.log('Running audit-url-engine-usage.js...');
execSync('node scripts/audit-url-engine-usage.js', { cwd: root, stdio: 'inherit' });

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

// ── Phase 5A.75: Canonical Data Layer ────────────────────────────────────────
// Must run before entity compilation so datasets are available for range resolution.
// 5A.75-a: Compile all 15 canonical dataset JSON files
require(path.join(__dirname, 'generate-datasets.js'));
// 5A.75-b: Generate /reference/datasets/ documentation pages
require(path.join(__dirname, 'generate-data-docs.js'));

// ── Phase 5A.5: Entity layer ──────────────────────────────────────────────────
// 5A.5-a: Compile entity JSON from source modules (resolves idealRange from datasets)
require(path.join(__dirname, 'generate-entities.js'));
// 5A.5-b: Generate /entities/ HTML pages
require(path.join(__dirname, 'generate-entity-pages.js'));
// 5A.5-c: Inject entity panels into glossary/formula/academy/reference pages
require(path.join(__dirname, 'generate-entity-links.js'));

// ── Step 7: Canonical nav (6-pillar header + hamburger) ──────────────────────
require(path.join(__dirname, 'inject-nav.js'));

// ── Step 8: Restructure calculator pages to new UX hierarchy ─────────────────
require(path.join(__dirname, 'restructure-calculator-pages.js'));

// ── Step 9: Canonical footer ──────────────────────────────────────────────────
require(path.join(__dirname, 'inject-footer.js'));

// ── Phase 5B.8 Part 3: Hub architecture generation ───────────────────────────
require(path.join(__dirname, 'generate-hubs.js'));

// ── Step 10: Navigation index ─────────────────────────────────────────────────
require(path.join(__dirname, 'generate-navigation.js'));

// ── Step 11: Breadcrumbs ──────────────────────────────────────────────────────
require(path.join(__dirname, 'generate-breadcrumbs.js'));

console.log('Running validate-hubs.js...');
execSync('node scripts/validate-hubs.js', { cwd: root, stdio: 'inherit' });

// ── Phase 5B.9: Google indexing optimization & crawl intelligence ────────────
console.log('Running generate-indexing.js...');
execSync('node scripts/generate-indexing.js', { cwd: root, stdio: 'inherit' });
console.log('Running generate-link-weights.js...');
execSync('node scripts/generate-link-weights.js', { cwd: root, stdio: 'inherit' });
console.log('Running generate-freshness.js...');
execSync('node scripts/generate-freshness.js', { cwd: root, stdio: 'inherit' });
console.log('Running generate-priority.js...');
execSync('node scripts/generate-priority.js', { cwd: root, stdio: 'inherit' });
console.log('Running audit-authority.js...');
execSync('node scripts/audit-authority.js', { cwd: root, stdio: 'inherit' });
console.log('Running audit-crawl-depth.js...');
execSync('node scripts/audit-crawl-depth.js', { cwd: root, stdio: 'inherit' });
console.log('Running audit-indexing.js...');
execSync('node scripts/audit-indexing.js', { cwd: root, stdio: 'inherit' });
console.log('Running generate-google-dashboard.js...');
execSync('node scripts/generate-google-dashboard.js', { cwd: root, stdio: 'inherit' });
console.log('Running validate-indexing.js...');
execSync('node scripts/validate-indexing.js', { cwd: root, stdio: 'inherit' });

// ── Phase 5B: Scientific Authority System ────────────────────────────────────
// Must run after all content generators so it can inject panels into generated pages.
// 5B-a: Compile trust data, generate editorial/methodology/provenance/revision pages
require(path.join(__dirname, 'generate-trust.js'));
// 5B-b: Inject trust panels into calculators, version badges, formula/dataset panels
require(path.join(__dirname, 'inject-trust-panels.js'));
// 5B.6 remediation: normalize baseline metadata tags/headings across generated pages
require(path.join(__dirname, 'normalize-seo-metadata.js'));

// ── Step 13a: Validate canonical data layer ──────────────────────────────────
console.log('Running validate-datasets.js...');
execSync('node scripts/validate-datasets.js', { cwd: root, stdio: 'inherit' });

// ── Step 13b: Validate entity layer ──────────────────────────────────────────
console.log('Running validate-entities.js...');
execSync('node scripts/validate-entities.js', { cwd: root, stdio: 'inherit' });

// ── Step 13c: Validate Scientific Authority System ───────────────────────────
console.log('Running validate-trust.js...');
execSync('node scripts/validate-trust.js', { cwd: root, stdio: 'inherit' });

// ── Phase 5B.5: QA and launch readiness ───────────────────────────────────────
console.log('Running generate-qa-report.js...');
execSync('node scripts/generate-qa-report.js', { cwd: root, stdio: 'inherit' });

// ── Step 14: Validate internal links (fail-fast gate) ────────────────────────
console.log('Running check-broken-links.js...');
execSync('node scripts/check-broken-links.js', { cwd: root, stdio: 'inherit' });

// ── Step 15: Regenerate search index ──────────────────────────────────────────
console.log('Running generate-search-index.js...');
execSync('node scripts/generate-search-index.js', { cwd: root, stdio: 'inherit' });

// ── Step 16: Grouped sitemaps ─────────────────────────────────────────────────
console.log('Running generate-sitemaps.js...');
execSync('node scripts/generate-sitemaps.js', { cwd: root, stdio: 'inherit' });

// ── Phase 5B.7: Platform semantic versioning system / certification ──────────
console.log('Running generate-compatibility.js...');
execSync('node scripts/generate-compatibility.js', { cwd: root, stdio: 'inherit' });

console.log('Running generate-release.js...');
execSync('node scripts/generate-release.js', { cwd: root, stdio: 'inherit' });

console.log('Running generate-version-badges.js...');
execSync('node scripts/generate-version-badges.js', { cwd: root, stdio: 'inherit' });

console.log('Running validate-versioning.js...');
execSync('node scripts/validate-versioning.js', { cwd: root, stdio: 'inherit' });

// Legacy flat tools index (kept for backward compat)
console.log('Running generate-tools-index.js...');
execSync('node scripts/generate-tools-index.js', { cwd: root, stdio: 'inherit' });

console.log('Done. Regenerate with: node scripts/run-all-generators.js');
