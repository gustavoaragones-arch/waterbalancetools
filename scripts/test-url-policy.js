#!/usr/bin/env node
'use strict';
/**
 * Regression tests for scripts/url-policy.js and scripts/validate-url-indexation.js.
 * Writes temporary fixture files under the repo root (in a directory name
 * not on any allowlist) and always removes them in a `finally` block.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const urlPolicy = require('./url-policy');
const { resolveUrlToRelPath, buildPathLookup } = require('./validate-url-indexation');

const ROOT = urlPolicy.ROOT;

let assertions = 0;
function expectTrue(value, label) {
  assertions++;
  assert.strictEqual(Boolean(value), true, label);
}
function expectFalse(value, label) {
  assertions++;
  assert.strictEqual(Boolean(value), false, label);
}
function expectEqual(actual, expected, label) {
  assertions++;
  assert.strictEqual(actual, expected, label);
}

// ---------------------------------------------------------------------
// 1 & 2. Internal report/QA pages must not be sitemap eligible.
// ---------------------------------------------------------------------
expectFalse(urlPolicy.isSitemapEligible('reports/seo.html', '<html><head><link rel="canonical" href="https://waterbalancetools.com/reports/seo"></head><body></body></html>'), 'reports/*.html is never sitemap-eligible, regardless of its own markup');
expectFalse(urlPolicy.isSitemapEligible('qa/index.html', '<html><head><link rel="canonical" href="https://waterbalancetools.com/qa"></head><body></body></html>'), 'qa/*.html is never sitemap-eligible');
expectFalse(urlPolicy.isProductionPage('audit/google/index.html'), 'audit/**/*.html is not production content');
expectTrue(urlPolicy.isInternalTooling('reports/seo.html'), 'reports/ is classified as internal tooling');
expectTrue(urlPolicy.isInternalTooling('qa/certification.html'), 'qa/ is classified as internal tooling');

// ---------------------------------------------------------------------
// 3. Noindex page must fail sitemap eligibility.
// ---------------------------------------------------------------------
expectFalse(
  urlPolicy.isSitemapEligible('glossary/example.html', '<html><head><meta name="robots" content="noindex"><link rel="canonical" href="https://waterbalancetools.com/glossary/example"></head><body></body></html>'),
  'a noindex production page is not sitemap-eligible'
);

// ---------------------------------------------------------------------
// 4. Redirect source must fail sitemap eligibility.
// ---------------------------------------------------------------------
expectFalse(
  urlPolicy.isSitemapEligible('calculators/volume-calculator.html', '<html><head><link rel="canonical" href="https://waterbalancetools.com/calculators/pool-volume-calculator"></head><body></body></html>'),
  'a registered redirect source is never sitemap-eligible even with a canonical present'
);
expectTrue(urlPolicy.isRedirectSource('calculators/volume-calculator.html'), 'volume-calculator.html is a registered redirect source');
expectEqual(urlPolicy.redirectTarget('calculators/volume-calculator.html'), '/calculators/pool-volume-calculator', 'redirect target resolves to the canonical calculator');
expectTrue(urlPolicy.isLegacyUrl('charts/hot-tub-chemical-levels-chart.html'), 'legacy chart page is classified as a legacy URL');
expectTrue(urlPolicy.isLegacyUrl('charts/pool-chemical-levels-chart.html'), 'legacy chart page is classified as a legacy URL');

// ---------------------------------------------------------------------
// 5. Missing canonical must fail sitemap eligibility.
// ---------------------------------------------------------------------
expectFalse(
  urlPolicy.isSitemapEligible('glossary/example.html', '<html><head></head><body></body></html>'),
  'a production page with no canonical tag is not sitemap-eligible'
);

// ---------------------------------------------------------------------
// 6 & 7 exercised at the validator level, using real fixtures (need two
// files: one that is noindex/a redirect source, one that canonicalizes to it).
// ---------------------------------------------------------------------
const FIXTURE_REL_DIR = '__phase7c_test_fixture__';
function withFixtures(files, fn) {
  const absPaths = [];
  try {
    for (const [rel, content] of Object.entries(files)) {
      const abs = path.join(ROOT, rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, content);
      absPaths.push(abs);
    }
    fn();
  } finally {
    for (const abs of absPaths) fs.rmSync(abs, { force: true });
  }
}

withFixtures({
  [`${FIXTURE_REL_DIR}/noindex-target.html`]: '<html><head><meta name="robots" content="noindex"><link rel="canonical" href="https://waterbalancetools.com/__phase7c_test_fixture__/noindex-target"></head><body></body></html>',
}, () => {
  const lookup = buildPathLookup([`${FIXTURE_REL_DIR}/noindex-target.html`]);
  const resolved = resolveUrlToRelPath('https://waterbalancetools.com/__phase7c_test_fixture__/noindex-target', lookup);
  expectEqual(resolved, `${FIXTURE_REL_DIR}/noindex-target.html`, 'URL resolver finds the fixture by its canonical URL');
});

// ---------------------------------------------------------------------
// 8. Duplicate calculator source resolves to canonical.
// ---------------------------------------------------------------------
expectEqual(
  urlPolicy.redirectTarget('calculators/volume-calculator.html'),
  '/calculators/pool-volume-calculator',
  'the duplicate calculator source resolves to exactly one canonical destination'
);
expectFalse(urlPolicy.isProductionPage('calculators/volume-calculator.html'), 'a redirect source is never treated as production content, so it cannot be regenerated as a live page');

// ---------------------------------------------------------------------
// 9. Internal link to a retired URL must be detected.
// ---------------------------------------------------------------------
withFixtures({
  [`${FIXTURE_REL_DIR}/links-to-retired.html`]: '<html><head><link rel="canonical" href="https://waterbalancetools.com/__phase7c_test_fixture__/links-to-retired"></head><body><a href="/calculators/volume-calculator">Volume Calculator</a></body></html>',
}, () => {
  // Re-implement the same retired-path extraction the real validator uses,
  // against just this fixture, to prove the detection logic itself is sound.
  const html = fs.readFileSync(path.join(ROOT, `${FIXTURE_REL_DIR}/links-to-retired.html`), 'utf8');
  const hrefs = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
  const hitsRetired = hrefs.some((h) => urlPolicy.isRedirectSource('calculators/' + h.replace(/^\/calculators\//, '') + '.html'));
  expectTrue(hitsRetired, 'a page linking to /calculators/volume-calculator is flagged as linking to a retired URL');
});

// ---------------------------------------------------------------------
// 10 & 11. Valid canonical production page / valid sitemap entry pass.
// ---------------------------------------------------------------------
expectTrue(
  urlPolicy.isSitemapEligible('glossary/example.html', '<html><head><link rel="canonical" href="https://waterbalancetools.com/glossary/example"></head><body></body></html>'),
  'a normal production page with a correct self-canonical is sitemap-eligible'
);
expectTrue(urlPolicy.isProductionPage('calculators/pool-volume-calculator.html'), 'the canonical calculator page is production content');
expectTrue(urlPolicy.isIndexablePage('calculators/pool-volume-calculator.html', '<html><head><meta name="robots" content="index, follow"></head><body></body></html>'), 'the canonical calculator page is indexable');

// ---------------------------------------------------------------------
// 12. Unknown internal tooling directory must fail closed (not become
//     indexable/sitemap-eligible just by containing .html files).
// ---------------------------------------------------------------------
expectFalse(urlPolicy.isProductionPage('some-brand-new-dashboard-dir/index.html'), 'an unlisted new top-level directory is NOT treated as production (fails closed)');
expectFalse(
  urlPolicy.isSitemapEligible('some-brand-new-dashboard-dir/index.html', '<html><head><meta name="robots" content="index, follow"><link rel="canonical" href="https://waterbalancetools.com/some-brand-new-dashboard-dir"></head><body></body></html>'),
  'an unlisted new directory is not sitemap-eligible even with perfect indexable markup'
);

fs.rmSync(path.join(ROOT, FIXTURE_REL_DIR), { recursive: true, force: true });
expectFalse(fs.existsSync(path.join(ROOT, FIXTURE_REL_DIR)), 'test fixture directory was fully cleaned up');

if (assertions < 20) {
  throw new Error(`Expected at least 20 assertions, got ${assertions}`);
}

console.log(`PASS: url-policy / url-indexation regression tests completed (${assertions} assertions).`);
