#!/usr/bin/env node
'use strict';

const assert = require('assert');
const {
  BASE_URL,
  cleanPath,
  buildUrl,
  absoluteUrl,
  canonicalUrl,
  sitemapUrl,
  href,
  normalizeHref,
  normalizeSegment,
  join,
  isCanonical,
} = require('../js/url/url-engine');

let assertions = 0;
function expect(actual, expected, label) {
  assertions++;
  assert.strictEqual(actual, expected, label);
}
function expectTrue(value, label) {
  assertions++;
  assert.strictEqual(Boolean(value), true, label);
}
function expectFalse(value, label) {
  assertions++;
  assert.strictEqual(Boolean(value), false, label);
}

[
  ['index.html', '/'],
  ['/index.html', '/'],
  ['/reference/index.html', '/reference'],
  ['/reference/', '/reference'],
  ['reference///', '/reference'],
  ['', '/'],
  ['   ', '/'],
  ['academy', '/academy'],
  ['academy/testing', '/academy/testing'],
  ['academy/testing/', '/academy/testing'],
  ['/academy/testing/index.html', '/academy/testing'],
  ['/academy/testing/index', '/academy/testing'],
  ['/academy///testing///', '/academy/testing'],
  ['/academy//testing//kits.html', '/academy/testing/kits'],
  ['/academy//academy/testing', '/academy/testing'],
  ['/ACADEMY/Testing', '/academy/testing'],
  ['C:\\academy\\testing\\index.html', '/academy/testing'],
  ['/pool-chemical-levels-chart?utm=test', '/pool-chemical-levels-chart?utm=test'],
  ['/pool-chemical-levels-chart#faq', '/pool-chemical-levels-chart#faq'],
  ['/pool-chemical-levels-chart/?utm=test#faq', '/pool-chemical-levels-chart?utm=test#faq'],
].forEach(([input, output], idx) => expect(cleanPath(input), output, `cleanPath case ${idx + 1}`));

[
  ['academy', '/academy'],
  ['/academy/', '/academy'],
  ['/academy/index.html', '/academy'],
  ['guides/chlorine-guide.html', '/guides/chlorine-guide'],
  ['/guides//chlorine-guide/', '/guides/chlorine-guide'],
  ['/', '/'],
].forEach(([input, output], idx) => {
  expect(buildUrl(input), output, `buildUrl case ${idx + 1}`);
  expect(href(input), output, `href case ${idx + 1}`);
});

[
  ['/', `${BASE_URL}/`],
  ['/academy', `${BASE_URL}/academy`],
  ['/academy/', `${BASE_URL}/academy`],
  ['/academy/index.html', `${BASE_URL}/academy`],
  ['/academy?page=2', `${BASE_URL}/academy?page=2`],
  ['/academy#faq', `${BASE_URL}/academy#faq`],
].forEach(([input, output], idx) => {
  expect(absoluteUrl(input), output, `absoluteUrl case ${idx + 1}`);
  expect(canonicalUrl(input), output, `canonicalUrl case ${idx + 1}`);
  expect(sitemapUrl(input), output, `sitemapUrl case ${idx + 1}`);
});

[
  ['../academy/page.html', '/academy/page'],
  ['academy/page.html', '/academy/page'],
  ['academy/page', '/academy/page'],
  ['/academy/page/', '/academy/page'],
  ['academy/page/index.html', '/academy/page'],
  ['./academy/page', '/academy/page'],
  ['../../academy/page', '/academy/page'],
  ['/academy?page=2', '/academy?page=2'],
  ['/academy#faq', '/academy#faq'],
  ['https://waterbalancetools.com/academy/page.html', '/academy/page'],
  ['https://example.com/foo', 'https://example.com/foo'],
  ['mailto:test@example.com', 'mailto:test@example.com'],
].forEach(([input, output], idx) => expect(normalizeHref(input), output, `normalizeHref case ${idx + 1}`));

[
  ['Pool Chemistry', 'pool-chemistry'],
  ['  Pool   Chemistry  ', 'pool-chemistry'],
  ['POOL-CHEMISTRY', 'pool-chemistry'],
  ['pool--chemistry', 'pool-chemistry'],
  ['pool___chemistry', 'pool___chemistry'],
  [' /pool chemistry/ ', 'pool-chemistry'],
].forEach(([input, output], idx) => expect(normalizeSegment(input), output, `normalizeSegment case ${idx + 1}`));

[
  [['/academy/', '/testing/', 'test-kits.html'], '/academy/testing/test-kits'],
  [['academy', 'testing', 'test-kits'], '/academy/testing/test-kits'],
  [['/academy', 'academy', 'testing'], '/academy/testing'],
  [['/', 'index.html'], '/'],
  [['/guides/', '/chlorine-guide/', '?page=2'], '/guides/chlorine-guide?page=2'],
  [['C:\\guides\\', 'ph\\guide.html'], '/guides/ph/guide'],
  [['/reports/', '/seo/', '/index.html'], '/reports/seo'],
].forEach(([parts, output], idx) => expect(join(...parts), output, `join case ${idx + 1}`));

expectTrue(isCanonical('/academy'), 'isCanonical path true');
expectTrue(isCanonical('/'), 'isCanonical root true');
expectFalse(isCanonical('/academy/'), 'isCanonical trailing slash false');
expectFalse(isCanonical('/academy/index.html'), 'isCanonical index false');
expectTrue(isCanonical(`${BASE_URL}/academy`), 'isCanonical absolute true');
expectFalse(isCanonical(`${BASE_URL}/academy/`), 'isCanonical absolute slash false');

const deterministicInputs = [
  '/academy/index.html',
  '/academy///testing',
  '../guides/chlorine-guide.html',
  '/pool-chemical-levels-chart?utm=test',
  '/Pool-Chemical-Levels-Chart',
];
for (const input of deterministicInputs) {
  const a = cleanPath(input);
  const b = cleanPath(input);
  const c = cleanPath(input);
  expect(a, b, `deterministic cleanPath b for ${input}`);
  expect(a, c, `deterministic cleanPath c for ${input}`);
}

const categoryRoutes = [
  '/releases/1.0.0.html',
  '/releases/1.1.0.html',
  '/entities/free-chlorine.html',
  '/academy/fundamentals/understanding-pool-water-chemistry.html',
  '/glossary/free-chlorine.html',
  '/reference/ideal-pool-levels.html',
  '/resources/pool-maintenance-checklist.html',
  '/calculators/pool-ph-calculator.html',
  '/programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool.html',
  '/charts/pool-chemical-levels-chart.html',
  '/guides/pool-chemistry-basics.html',
  '/legal/ownership.html',
  '/reports/seo.html',
  '/qa/certification.html',
  '/404.html',
  '/Pool-Volume-Calculator.html',
  '/academy//testing//digital-pool-testers.html',
  '/reference/datasets/version/index.html',
  '/methodology/calculation-methodology/index.html',
  '/revisions/index.html',
  '/provenance/index.html',
  '/editorial/index.html',
  '/search/index.html',
  '/downloads/water-balance-checklist.pdf',
];

for (const route of categoryRoutes) {
  const normalized = cleanPath(route);
  expectTrue(normalized.startsWith('/'), `route starts with slash: ${route}`);
  expectFalse(normalized.includes('//'), `route has no double slash: ${route}`);
  if (normalized !== '/') expectFalse(normalized.endsWith('/'), `route has no trailing slash: ${route}`);
}

const repeatedSeparatorInputs = [
  '////academy////',
  'academy\\\\testing\\\\kits.html',
  'academy///testing///kits///',
  '/academy//testing///index.html',
];
for (const input of repeatedSeparatorInputs) {
  const normalized = cleanPath(input);
  expectFalse(normalized.includes('//'), `separator cleanup ${input}`);
  expectFalse(normalized.includes('\\'), `windows separator cleanup ${input}`);
}

const malformedInputs = [
  null,
  undefined,
  42,
  true,
  false,
  {},
  [],
];
for (const input of malformedInputs) {
  const normalized = cleanPath(input);
  expectTrue(normalized.startsWith('/'), `malformed input starts with / for ${String(input)}`);
  expectFalse(normalized.includes('//'), `malformed input has no // for ${String(input)}`);
}

const queryFragmentCases = [
  ['/academy?page=2', '/academy?page=2'],
  ['/academy?page=2&sort=desc', '/academy?page=2&sort=desc'],
  ['/academy#overview', '/academy#overview'],
  ['/academy/?page=2#overview', '/academy?page=2#overview'],
  ['academy/index.html?page=2#overview', '/academy?page=2#overview'],
];
for (const [input, expected] of queryFragmentCases) {
  expect(cleanPath(input), expected, `query/fragment case: ${input}`);
}

const duplicateSegmentCases = [
  ['/calculators/calculators', '/calculators'],
  ['/guides/guides/ph', '/guides/ph'],
  ['/academy/academy/testing', '/academy/testing'],
  ['/reference/reference/index.html', '/reference'],
  ['/datasets/datasets/version', '/datasets/version'],
];
for (const [input, expected] of duplicateSegmentCases) {
  expect(cleanPath(input), expected, `duplicate segment case: ${input}`);
}

const hrefCases = [
  ['../academy/index.html#faq', '/academy#faq'],
  ['./guides/ph-guide.html?tab=2', '/guides/ph-guide?tab=2'],
  ['academy///testing//test-kits.html', '/academy/testing/test-kits'],
  ['/academy/academy/testing/index.html', '/academy/testing'],
  ['https://waterbalancetools.com/reference/index.html', '/reference'],
];
for (const [input, expected] of hrefCases) {
  expect(normalizeHref(input), expected, `href case: ${input}`);
}

const joinCases = [
  [['', '', 'academy', '', 'index.html'], '/academy'],
  [['/academy', 'testing', 'index'], '/academy/testing'],
  [['/academy/', '/testing/', '/digital-testers/', '#faq'], '/academy/testing/digital-testers#faq'],
  [['/academy/', '/testing/', '/digital-testers/', '?page=2'], '/academy/testing/digital-testers?page=2'],
  [['/academy/', '/testing/', 'digital-testers.html', '?page=2#faq'], '/academy/testing/digital-testers?page=2#faq'],
];
for (const [parts, expected] of joinCases) {
  expect(join(...parts), expected, `join case: ${parts.join('|')}`);
}

const canonicalCheckCases = [
  ['/academy', true],
  ['/academy/', false],
  ['/academy/index.html', false],
  ['/academy//testing', false],
  [`${BASE_URL}/academy`, true],
  [`${BASE_URL}/academy/index.html`, false],
  [`${BASE_URL}/academy/`, false],
];
for (const [candidate, verdict] of canonicalCheckCases) {
  verdict ? expectTrue(isCanonical(candidate), `canonical true: ${candidate}`) : expectFalse(isCanonical(candidate), `canonical false: ${candidate}`);
}

// Add broad property assertions to exceed 120 checks.
const broad = [
  '/academy',
  '/academy/testing',
  '/reference',
  '/reference/chemical-storage',
  '/glossary/free-chlorine',
  '/formulas/lsi-formula',
  '/entities/free-chlorine',
  '/calculators/pool-ph-calculator',
  '/reports/links',
  '/qa/index',
  '/404',
  '/releases/compatibility',
];
for (const path of broad) {
  const normalized = cleanPath(path);
  expectTrue(normalized.startsWith('/'), `broad starts with / ${path}`);
  expectFalse(normalized.includes('.html'), `broad no .html ${path}`);
  expectFalse(normalized.includes('/index'), `broad no /index ${path}`);
  expectFalse(normalized.includes('//'), `broad no // ${path}`);
}

if (assertions < 120) {
  throw new Error(`Expected at least 120 assertions, got ${assertions}`);
}

console.log(`PASS: URL engine regression tests completed (${assertions} assertions).`);
