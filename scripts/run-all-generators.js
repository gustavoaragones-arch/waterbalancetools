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

// ── Phase 7Z: source/data consistency gate ────────────────────────────────────
// Validates that data/{academy,formulas,glossary,reference}.json agree with
// their authoritative scripts/data/*.js sources BEFORE the generators below
// render HTML from them. This does NOT regenerate the JSON (populate-data.js
// is intentionally not part of this pipeline -- see its own header comment
// and reports/phase-7y/POPULATE-DATA-AUDIT.md); it only fails the build if
// they have drifted apart, so a stray hand-edit to the JSON (or a source
// edit that was never propagated via `node scripts/populate-data.js`) is
// caught here instead of silently reaching production.
console.log('Running validate-source-data-consistency.js...');
execSync('node scripts/validate-source-data-consistency.js', { cwd: root, stdio: 'inherit' });

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

// ── Phase 8B: pre-hub navigation refresh ──────────────────────────────────────
// generate-hubs.js (below) reads data/navigation.json to build hub-to-leaf
// cross-links (titles/descriptions/URLs of calculators, guides, entities,
// etc.). Every leaf page above this line is already in its final,
// current-build form, so navigation.json can be safely and correctly
// rebuilt from them right now. Without this, generate-hubs.js read
// whatever navigation.json happened to be left on disk from a PAST build
// (data/navigation.json is a committed, persistent file, not deleted
// between builds) -- stale by definition, and in practice stale by
// multiple phases' worth of renamed titles, requiring a second full
// `npm run build` to converge. Run via execSync (a genuinely separate
// process), not require(), because require() caches module execution --
// requiring the same script path a second time later in this file (the
// pre-existing call below) would otherwise be a silent no-op. See
// docs/PHASE-8B-HUB-NAVIGATION-CONVERGENCE.md.
console.log('Running generate-navigation.js (pre-hub refresh)...');
execSync('node scripts/generate-navigation.js', { cwd: root, stdio: 'inherit' });

// ── Phase 5B.8 Part 3: Hub architecture generation ───────────────────────────
require(path.join(__dirname, 'generate-hubs.js'));

// ── Step 10: Navigation index ─────────────────────────────────────────────────
// Final, authoritative write: re-walks every page INCLUDING the hub pages
// just generated above, so the persisted data/navigation.json (consumed by
// breadcrumbs, search, and related-content) reflects the fully-finalized
// site, hub pages included -- not just the leaf pages the pre-hub refresh
// above needed.
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

// ── Phase 7E.6: chemistry source citations ───────────────────────────────────
// Must run after restructure-calculator-pages.js, which rebuilds each
// calculator's <main> content from a fixed whitelist of named sections and
// silently discards anything else inside <main> on every run (same reason
// inject-trust-panels.js, above, re-injects on every build instead of being
// written once).
require(path.join(__dirname, 'phase-7e', 'inject-calculator-sources.js')).run();

// ── Phase 7B: Generator-integrity gate ────────────────────────────────────────
// Runs after every generator/inject/normalize step that can produce or mutate
// HTML, and before sitemap generation or any production-certification step.
// A build with unresolved {{TOKEN}}-style artifacts in production output must
// never reach the sitemap or certification stages -- see
// reports/phase-7b/PHASE-7B-GENERATOR-INTEGRITY.md.
console.log('Running validate-generated-output.js...');
execSync('node scripts/validate-generated-output.js', { cwd: root, stdio: 'inherit' });

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

// ── Phase 7C: URL & indexation-integrity gate ─────────────────────────────────
// Runs after sitemaps are finalized (it validates sitemap content itself) and
// before any production-certification step, so a build with a URL/indexation
// contradiction (duplicate indexable URL, noindex-in-sitemap, internal
// tooling exposed, canonical/sitemap mismatch, stale link to a retired URL)
// never reaches certification. See reports/phase-7c/PHASE-7C-URL-INDEXATION.md.
console.log('Running validate-url-indexation.js...');
execSync('node scripts/validate-url-indexation.js', { cwd: root, stdio: 'inherit' });

// ── Phase 7D: chemistry knowledge structural-integrity gate ──────────────────
// Pure data-structure validation of scripts/data/chemistry-*.js (no network,
// no dependency on generated HTML). Fails the build only on a genuinely
// broken reference or malformed record (bad unit/context, dangling source
// id, minimum > maximum, etc.) -- REQUIRES_REVIEW / AMBIGUOUS / UNSUPPORTED
// content-review states never fail the build. See
// reports/phase-7d/PHASE-7D-CHEMISTRY-KNOWLEDGE.md.
console.log('Running validate-chemistry-knowledge.js...');
execSync('node scripts/validate-chemistry-knowledge.js', { cwd: root, stdio: 'inherit' });

// ── Phase 5B.7: Platform semantic versioning system / certification ──────────
console.log('Running generate-compatibility.js...');
execSync('node scripts/generate-compatibility.js', { cwd: root, stdio: 'inherit' });

console.log('Running generate-release.js...');
execSync('node scripts/generate-release.js', { cwd: root, stdio: 'inherit' });

console.log('Running generate-version-badges.js...');
execSync('node scripts/generate-version-badges.js', { cwd: root, stdio: 'inherit' });

console.log('Running validate-versioning.js...');
execSync('node scripts/validate-versioning.js', { cwd: root, stdio: 'inherit' });

// ── Phase 8E: Spanish production cluster (first-language rollout) ────────────
// Reads the now-fully-finalized English calculator pages above (trust
// panels, chemistry-sources block, footer, version badge -- every
// upstream injector has now run) as its structural/functional source, and
// writes the translated es/calculators/ cluster. Positioned this late
// deliberately: the translation data in
// scripts/data/i18n-es/cluster-translations.js targets the FINAL injected
// text (e.g. the footer's "Platform version: ..." badge, only written by
// generate-version-badges.js just above), so running any earlier throws
// (the generator asserts every expected English string is actually
// present -- see generate-spanish-cluster.js). inject-i18n-cluster.js then
// adds reciprocal hreflang + a language-switcher link to both the English
// and Spanish files, data-driven from data/i18n/translation-status.json.
//
// Because this runs after the Step 16 sitemap generation and Phase 7C
// indexation gate above, both are re-run here (execSync -- a genuinely
// separate process, since require()-ing the same script path twice in one
// process is a silent no-op, per the identical Phase 8B finding for
// generate-navigation.js) so the new /es/ pages are correctly included in
// THIS build's sitemap and validated for indexation, not deferred to a
// second build. The earlier calls above are left in place unchanged --
// they still serve the English-only site correctly on their own.
//
// The Spanish cluster is NOT added to data/navigation.json / the search
// index / hub navigation in this phase -- see
// docs/PHASE-8E-SPANISH-ROLLOUT.md (known limitations). Only the sitemap
// and hreflang/canonical relationships are wired end-to-end.
require(path.join(__dirname, 'generate-spanish-cluster.js'));
require(path.join(__dirname, 'inject-i18n-cluster.js'));

console.log('Running generate-sitemaps.js (post-i18n refresh)...');
execSync('node scripts/generate-sitemaps.js', { cwd: root, stdio: 'inherit' });

console.log('Running validate-url-indexation.js (post-i18n refresh)...');
execSync('node scripts/validate-url-indexation.js', { cwd: root, stdio: 'inherit' });

// Legacy flat tools index (kept for backward compat)
console.log('Running generate-tools-index.js...');
execSync('node scripts/generate-tools-index.js', { cwd: root, stdio: 'inherit' });

console.log('Done. Regenerate with: node scripts/run-all-generators.js');
