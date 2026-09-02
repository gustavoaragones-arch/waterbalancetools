#!/usr/bin/env node
/**
 * validate-hreflang.js
 *
 * Reusable hreflang validator (Phase 8D, spec Section 14). Designed to
 * remain useful, unmodified, during the future Spanish rollout: once real
 * /es/ pages exist and emit hreflang <link> tags, this script will find
 * and validate them exactly as written. Today, with zero non-English
 * pages in production, its job is to prove two things:
 *
 *   1. No page in the current, committed site emits any hreflang tag
 *      that is not a real, reciprocal, self-consistent relationship
 *      (trivially true right now: it must find ZERO hreflang tags at
 *      all, since Phase 8D generates no localized pages).
 *   2. The reusable validation logic in js/i18n/hreflang.js is itself
 *      correct, via a self-test against synthetic fixtures.
 *
 * Run: node scripts/validate-hreflang.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { validateHreflangSet, reciprocityCheck, buildHreflangSet } = require('../js/i18n/hreflang');
const urlPolicy = require('./url-policy');

const ROOT = path.join(__dirname, '..');

let errors = 0;
function err(msg) { console.log('ERROR: ' + msg); errors++; }
function ok(msg) { console.log('OK: ' + msg); }

// ---------------------------------------------------------------------
// A. Scan every current production page for hreflang <link> tags. Build
//    a { canonicalUrl -> entries[] } map and run full validation +
//    reciprocity across whatever is actually found.
// ---------------------------------------------------------------------
function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (urlPolicy.NON_PAGE_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { walk(full, out); continue; }
    if (e.isFile() && e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const HREFLANG_RE = /<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["'][^>]+href=["']([^"']+)["'][^>]*>|<link[^>]+hreflang=["']([^"']+)["'][^>]+rel=["']alternate["'][^>]+href=["']([^"']+)["'][^>]*>/gi;
const CANONICAL_RE = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i;

const files = walk(ROOT, []);
const pageMap = new Map();
let totalTagsFound = 0;

for (const full of files) {
  const rel = path.relative(ROOT, full).replace(/\\/g, '/');
  if (!urlPolicy.isProductionPage(rel)) continue;
  const html = fs.readFileSync(full, 'utf8');
  const canonicalMatch = html.match(CANONICAL_RE);
  const canonical = canonicalMatch ? canonicalMatch[1] : null;

  const entries = [];
  let m;
  HREFLANG_RE.lastIndex = 0;
  while ((m = HREFLANG_RE.exec(html))) {
    const hreflang = m[1] || m[3];
    const href = m[2] || m[4];
    entries.push({ hreflang, href });
  }
  totalTagsFound += entries.length;
  if (entries.length > 0 && canonical) {
    pageMap.set(canonical, entries);
  } else if (entries.length > 0) {
    err('Page ' + rel + ' emits hreflang tags but has no <link rel="canonical">, cannot self-validate');
  }
}

if (totalTagsFound === 0) {
  ok('A. Scanned ' + files.length + ' files: 0 hreflang tags found sitewide -- correct, since Phase 8D generates no localized pages (no false hreflang is possible)');
} else {
  ok('A. Scanned ' + files.length + ' files: ' + totalTagsFound + ' hreflang tag(s) found across ' + pageMap.size + ' page(s) -- validating');
  const knownUrls = new Set();
  for (const [canonical, entries] of pageMap) {
    knownUrls.add(canonical);
    for (const e of entries) knownUrls.add(e.href);
  }
  for (const [canonical, entries] of pageMap) {
    const result = validateHreflangSet(entries, { pageCanonical: canonical, knownUrls });
    if (!result.valid) {
      for (const e of result.errors) err('Page with canonical ' + canonical + ': ' + e);
    }
  }
  const recip = reciprocityCheck(pageMap);
  if (!recip.valid) {
    for (const e of recip.errors) err('Reciprocity: ' + e);
  }
}

// ---------------------------------------------------------------------
// B. Self-test the reusable validation logic against synthetic fixtures
//    representative of the future Spanish rollout, so this validator's
//    own correctness is proven independent of current site content.
// ---------------------------------------------------------------------
{
  const good = buildHreflangSet('/calculators/pool-volume-calculator', ['en', 'es']);
  const goodResult = validateHreflangSet(good, {
    pageLanguage: 'en',
    pageCanonical: 'https://waterbalancetools.com/calculators/pool-volume-calculator',
    knownUrls: good.map((e) => e.href),
  });
  if (goodResult.valid) ok('B1. Self-test: a correctly-formed en+es hreflang set validates clean');
  else err('B1. Self-test FAILED on a correctly-formed hreflang set: ' + goodResult.errors.join('; '));

  const duplicated = [...good, good[0]];
  const dupResult = validateHreflangSet(duplicated);
  if (!dupResult.valid && dupResult.errors.some((e) => /Duplicate/.test(e))) {
    ok('B2. Self-test: a duplicate hreflang entry is correctly rejected');
  } else {
    err('B2. Self-test FAILED: duplicate hreflang entry was not detected');
  }

  const brokenLink = good.map((e) => (e.hreflang === 'es' ? { ...e, href: 'https://waterbalancetools.com/es/does-not-exist' } : e));
  const brokenResult = validateHreflangSet(brokenLink, { knownUrls: good.map((e) => e.href) });
  if (!brokenResult.valid && brokenResult.errors.some((e) => /404/.test(e))) {
    ok('B3. Self-test: an hreflang href pointing outside the known-URL set is correctly flagged');
  } else {
    err('B3. Self-test FAILED: a broken hreflang target was not detected');
  }

  const singleLang = buildHreflangSet('/calculators/pool-volume-calculator', ['en']);
  if (Array.isArray(singleLang) && singleLang.length === 0) {
    ok('B4. Self-test: a content unit with only one available language produces zero hreflang entries (no false hreflang)');
  } else {
    err('B4. Self-test FAILED: a single-language content unit produced hreflang entries: ' + JSON.stringify(singleLang));
  }
}

console.log('');
console.log('validate-hreflang: ' + (errors === 0 ? 'PASS' : 'FAIL') + ' -- ' + errors + ' error(s).');
process.exit(errors === 0 ? 0 : 1);
