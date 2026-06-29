#!/usr/bin/env node
'use strict';

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

const requiredFunctions = [
  ['cleanPath', cleanPath],
  ['buildUrl', buildUrl],
  ['absoluteUrl', absoluteUrl],
  ['canonicalUrl', canonicalUrl],
  ['sitemapUrl', sitemapUrl],
  ['href', href],
  ['normalizeHref', normalizeHref],
  ['normalizeSegment', normalizeSegment],
  ['join', join],
  ['isCanonical', isCanonical],
];

const failures = [];
function check(condition, message) {
  if (!condition) failures.push(message);
}

for (const [name, fn] of requiredFunctions) {
  check(typeof fn === 'function', `Missing exported function: ${name}`);
}

const deterministicSamples = [
  '/academy/index.html',
  '/academy//testing///kits.html',
  '../academy/page.html',
  'Pool Chemistry',
  '/reports/seo.html',
];

for (const sample of deterministicSamples) {
  const a = cleanPath(sample);
  const b = cleanPath(sample);
  const c = cleanPath(sample);
  check(a === b && a === c, `Non-deterministic cleanPath output for: ${sample}`);
}

const normalizationCases = [
  ['index.html', '/'],
  ['/index', '/'],
  ['/academy/index.html', '/academy'],
  ['/academy/', '/academy'],
  ['academy', '/academy'],
  ['////academy///', '/academy'],
  ['/academy/academy/testing', '/academy/testing'],
  ['/academy//testing', '/academy/testing'],
  ['C:\\academy\\testing\\index.html', '/academy/testing'],
  ['/ACADEMY/TESTING', '/academy/testing'],
];

for (const [input, expected] of normalizationCases) {
  check(cleanPath(input) === expected, `Unexpected cleanPath result for ${input}: ${cleanPath(input)} (expected ${expected})`);
}

const noLeakSamples = [
  '/academy/index.html',
  '/reference/ideal-pool-levels.html',
  '/reports/seo.html',
  '/qa/index.html',
  '/releases/1.0.0.html',
  '/entities/free-chlorine.html',
];
for (const sample of noLeakSamples) {
  const output = cleanPath(sample);
  check(!output.includes('.html'), `Found .html leakage in cleanPath output: ${output}`);
  check(!output.includes('/index'), `Found /index leakage in cleanPath output: ${output}`);
  check(!output.includes('//'), `Found duplicate slash in cleanPath output: ${output}`);
}

check(cleanPath('/') === '/', 'Root normalization failed for "/"');
check(cleanPath('/index.html') === '/', 'Root normalization failed for "/index.html"');
check(cleanPath('/index') === '/', 'Root normalization failed for "/index"');

const pathSamples = [
  '/',
  '/academy',
  '/academy/testing',
  '/reference',
  '/calculators/pool-ph-calculator',
  '/entities/free-chlorine',
  '/releases/1.0.0',
  '/reports/seo',
  '/qa/certification',
  '/404',
];

const uniqueNormalized = new Set();
for (const path of pathSamples) {
  const p = buildUrl(path);
  uniqueNormalized.add(p);
  check(p === href(path), `href/buildUrl mismatch for ${path}`);
  check(!p.includes('.html'), `buildUrl includes .html for ${path}`);
  check(!p.includes('/index'), `buildUrl includes /index for ${path}`);
  check(!p.includes('//'), `buildUrl includes duplicate slash for ${path}`);
  check(p === p.toLowerCase(), `buildUrl is not lowercase for ${path}`);
}
check(uniqueNormalized.size === pathSamples.length, 'Duplicate normalized paths detected in validation sample set');

for (const path of pathSamples) {
  const abs = absoluteUrl(path);
  const can = canonicalUrl(path);
  const site = sitemapUrl(path);
  check(abs.startsWith(BASE_URL), `absoluteUrl missing BASE_URL for ${path}`);
  check(can === abs, `canonicalUrl mismatch for ${path}`);
  check(site === abs, `sitemapUrl mismatch for ${path}`);
  check(!can.includes('.html'), `canonicalUrl includes .html for ${path}`);
  check(!site.includes('/index'), `sitemapUrl includes /index for ${path}`);
}

const normalizeHrefCases = [
  ['../academy/page.html', '/academy/page'],
  ['academy/page.html', '/academy/page'],
  ['academy/page/index.html', '/academy/page'],
  ['/academy/page/', '/academy/page'],
  ['/academy?page=2', '/academy?page=2'],
  ['/academy#faq', '/academy#faq'],
];
for (const [input, expected] of normalizeHrefCases) {
  const output = normalizeHref(input);
  check(output === expected, `normalizeHref mismatch for ${input}: ${output} (expected ${expected})`);
  check(!output.includes('.html'), `normalizeHref contains .html for ${input}`);
}

const joined = join('/academy/', '/testing/', 'test-kits.html');
check(joined === '/academy/testing/test-kits', `join() unexpected output: ${joined}`);
check(!joined.includes('//'), 'join() produced duplicate slashes');
check(!joined.endsWith('/'), 'join() produced trailing slash');
check(!joined.includes('/index'), 'join() produced /index segment');

check(normalizeSegment('Pool Chemistry') === 'pool-chemistry', 'normalizeSegment basic conversion failed');
check(normalizeSegment('  POOL   CHEMISTRY  ') === 'pool-chemistry', 'normalizeSegment whitespace conversion failed');

check(isCanonical('/academy') === true, 'isCanonical should accept /academy');
check(isCanonical('/academy/') === false, 'isCanonical should reject trailing slash');
check(isCanonical('/academy/index.html') === false, 'isCanonical should reject index.html');
check(isCanonical(`${BASE_URL}/academy`) === true, 'isCanonical should accept absolute canonical URL');
check(isCanonical(`${BASE_URL}/academy/`) === false, 'isCanonical should reject absolute trailing slash URL');

if (failures.length) {
  console.error('URL engine validation failed:');
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log('PASS: URL engine validation completed with zero errors.');
