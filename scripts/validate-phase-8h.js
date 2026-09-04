#!/usr/bin/env node
/**
 * validate-phase-8h.js
 *
 * Validates the Phase 8H GSC sitemap processing / indexation readiness
 * audit. Phase 8H is an audit phase, not a content-expansion phase -- these
 * checks assert that the currently deployed sitemap/robots architecture is
 * structurally sound (apex-only hostnames, valid XML, no duplicates, the
 * Phase 8G Spanish URLs present exactly once) using the repository's own
 * generated output as the source of truth. Live production HTTP evidence
 * was gathered separately during the audit and is recorded in
 * docs/PHASE-8H-GSC-SITEMAP-AUDIT.md and reports/phase-8h-status.md -- this
 * script deliberately does not make network calls, matching every other
 * validate-phase-*.js script in this repository.
 *
 * Run: node scripts/validate-phase-8h.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let errors = 0;
let warnings = 0;
function err(msg) { console.log('ERROR: ' + msg); errors++; }
function warn(msg) { console.log('WARN: ' + msg); warnings++; }
function ok(msg) { console.log('OK: ' + msg); }
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }

const BASELINE_SHA = '8a042c1d02318b6bf7bbe7cc88dc0d70066465ee'; // Phase 8G closeout commit

const CHILD_SITEMAPS = [
  'sitemap-calculators.xml', 'sitemap-guides.xml', 'sitemap-resources.xml',
  'sitemap-academy.xml', 'sitemap-formulas.xml', 'sitemap-glossary.xml',
  'sitemap-reference.xml', 'sitemap-other.xml',
];

const SPANISH_CALCULATOR_URLS = [
  'https://waterbalancetools.com/es/calculators/chemical-calculator',
  'https://waterbalancetools.com/es/calculators/pool-volume-calculator',
  'https://waterbalancetools.com/es/calculators/pool-chlorine-calculator',
  'https://waterbalancetools.com/es/calculators/pool-ph-calculator',
  'https://waterbalancetools.com/es/calculators/pool-shock-calculator',
  'https://waterbalancetools.com/es/calculators/hot-tub-chlorine-calculator',
  'https://waterbalancetools.com/es/calculators/hot-tub-ph-calculator',
  'https://waterbalancetools.com/es/calculators/hot-tub-shock-calculator',
  'https://waterbalancetools.com/es/calculators/spa-volume-calculator',
];

// ---------------------------------------------------------------------
// A. Baseline gate
// ---------------------------------------------------------------------
try {
  const log = execSync('git log --oneline -1 ' + BASELINE_SHA, { cwd: ROOT }).toString().trim();
  if (log) ok('A. Mandatory baseline commit ' + BASELINE_SHA.slice(0, 7) + ' (Phase 8G closeout) is present in history');
  else err('A. Baseline commit not found in history');
} catch (e) {
  err('A. Could not verify baseline commit: ' + e.message);
}

// ---------------------------------------------------------------------
// B. robots.txt -- exists, declares the apex sitemap, no www, no
//    Disallow rules that would block real content
// ---------------------------------------------------------------------
{
  if (!exists('robots.txt')) {
    err('B. robots.txt does not exist');
  } else {
    const robots = read('robots.txt');
    const hasSitemapLine = /Sitemap:\s*https:\/\/waterbalancetools\.com\/sitemap\.xml/.test(robots);
    const hasWww = /www\.waterbalancetools\.com/.test(robots);
    const hasDisallow = /Disallow:\s*\S/.test(robots);
    if (hasSitemapLine && !hasWww && !hasDisallow) {
      ok('B. robots.txt declares the apex sitemap, references no www hostname, and contains no Disallow rules');
    } else {
      err('B. robots.txt problem: hasSitemapLine=' + hasSitemapLine + ' hasWww=' + hasWww + ' hasDisallow=' + hasDisallow);
    }
  }
}

// ---------------------------------------------------------------------
// C. url-engine.js BASE_URL is a hardcoded apex constant -- no www, no
//    trailing slash, no environment-variable dependency
// ---------------------------------------------------------------------
{
  const src = read('js/url/url-engine.js');
  const m = src.match(/const BASE_URL = '([^']+)'/);
  const envDependent = /process\.env/.test(src);
  if (m && m[1] === 'https://waterbalancetools.com' && !envDependent) {
    ok('C. url-engine.js BASE_URL is the hardcoded apex constant "https://waterbalancetools.com" with no process.env dependency');
  } else {
    err('C. url-engine.js BASE_URL problem: found=' + JSON.stringify(m && m[1]) + ' envDependent=' + envDependent);
  }
}

// ---------------------------------------------------------------------
// D. sitemap.xml is a valid sitemap index referencing exactly the 8
//    expected child sitemaps, each an absolute apex URL
// ---------------------------------------------------------------------
{
  if (!exists('sitemap.xml')) {
    err('D. sitemap.xml does not exist');
  } else {
    const xml = read('sitemap.xml');
    const isIndex = /<sitemapindex[^>]+xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/.test(xml);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((mm) => mm[1]);
    const expectedLocs = CHILD_SITEMAPS.map((f) => 'https://waterbalancetools.com/' + f);
    const setMatches = locs.length === expectedLocs.length && expectedLocs.every((u) => locs.includes(u));
    if (isIndex && setMatches) {
      ok('D. sitemap.xml is a valid sitemap index referencing exactly the 8 expected child sitemaps');
    } else {
      err('D. sitemap.xml structure problem: isIndex=' + isIndex + ' locs=' + JSON.stringify(locs));
    }
  }
}

// ---------------------------------------------------------------------
// E. No child sitemap <loc> or the index itself ever references www --
//    apex-only hostname enforced across the generated sitemap tree
// ---------------------------------------------------------------------
{
  const allFiles = ['sitemap.xml', ...CHILD_SITEMAPS].filter(exists);
  const offenders = [];
  for (const f of allFiles) {
    const xml = read(f);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((mm) => mm[1]);
    for (const loc of locs) {
      if (!loc.startsWith('https://waterbalancetools.com/')) offenders.push(f + ' -> ' + loc);
    }
  }
  if (offenders.length === 0) {
    ok('E. Every <loc> across sitemap.xml and all 8 child sitemaps is an absolute https://waterbalancetools.com/ URL (no www, no other hostname)');
  } else {
    err('E. Non-apex <loc> URLs found: ' + JSON.stringify(offenders.slice(0, 10)));
  }
}

// ---------------------------------------------------------------------
// F. Every child sitemap referenced by the index exists on disk and is
//    well-formed XML with at least one <url> entry
// ---------------------------------------------------------------------
{
  let allGood = true;
  for (const f of CHILD_SITEMAPS) {
    if (!exists(f)) { err('F. Missing expected child sitemap file: ' + f); allGood = false; continue; }
    const xml = read(f);
    const isUrlset = /<urlset[^>]+xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/.test(xml);
    const urlCount = (xml.match(/<url>/g) || []).length;
    if (!isUrlset || urlCount === 0) {
      err('F. ' + f + ' is not a valid non-empty urlset (isUrlset=' + isUrlset + ' urlCount=' + urlCount + ')');
      allGood = false;
    }
  }
  if (allGood) ok('F. All 8 child sitemap files exist, are valid urlset XML, and contain at least one URL');
}

// ---------------------------------------------------------------------
// G. No duplicate <loc> URLs within any single child sitemap, and none
//    duplicated across child sitemaps
// ---------------------------------------------------------------------
{
  const seen = new Map(); // url -> file it first appeared in
  const crossDupes = [];
  let withinDupes = 0;
  for (const f of CHILD_SITEMAPS) {
    if (!exists(f)) continue;
    const xml = read(f);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((mm) => mm[1]);
    const local = new Set();
    for (const loc of locs) {
      if (local.has(loc)) withinDupes++;
      local.add(loc);
      if (seen.has(loc)) crossDupes.push(loc + ' (' + seen.get(loc) + ' & ' + f + ')');
      else seen.set(loc, f);
    }
  }
  if (withinDupes === 0 && crossDupes.length === 0) {
    ok('G. No duplicate URLs within any child sitemap and none duplicated across child sitemaps (' + seen.size + ' unique URLs total)');
  } else {
    err('G. Duplicate URLs found: withinDupes=' + withinDupes + ' crossDupes=' + JSON.stringify(crossDupes.slice(0, 10)));
  }
}

// ---------------------------------------------------------------------
// H. All 9 Phase 8G/8E Spanish calculator URLs are present in
//    sitemap-calculators.xml, each exactly once, apex hostname
// ---------------------------------------------------------------------
{
  const xml = exists('sitemap-calculators.xml') ? read('sitemap-calculators.xml') : '';
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((mm) => mm[1]);
  const missing = SPANISH_CALCULATOR_URLS.filter((u) => !locs.includes(u));
  const counts = SPANISH_CALCULATOR_URLS.map((u) => locs.filter((l) => l === u).length);
  const notExactlyOnce = SPANISH_CALCULATOR_URLS.filter((u, i) => counts[i] !== 1);
  if (missing.length === 0 && notExactlyOnce.length === 0) {
    ok('H. All 9 Spanish calculator URLs (5 Phase 8E pool + 4 Phase 8G hot-tub/spa) are present in sitemap-calculators.xml exactly once each');
  } else {
    err('H. Spanish calculator URL problem: missing=' + JSON.stringify(missing) + ' notExactlyOnce=' + JSON.stringify(notExactlyOnce));
  }
}

// ---------------------------------------------------------------------
// I. Structural determinism: regenerating the sitemap tree twice from
//    the current committed source produces an identical URL set (loc +
//    changefreq + priority) in every file -- <lastmod> is intentionally
//    excluded from this comparison because it is real git-commit-date
//    driven (see scripts/generate-sitemaps.js buildGitLastmodMap) and a
//    file committed in the SAME commit as this validator run has not
//    yet been observed by `git log` at generation time, producing a
//    harmless one-run lag that self-corrects on the next build. The
//    committed working tree is restored afterward so this check leaves
//    no residue.
// ---------------------------------------------------------------------
{
  function stripLastmod(xml) { return xml.replace(/<lastmod>[^<]*<\/lastmod>\n?/g, ''); }
  const before = {};
  for (const f of ['sitemap.xml', ...CHILD_SITEMAPS]) before[f] = exists(f) ? read(f) : null;

  try {
    execSync('node scripts/generate-sitemaps.js', { cwd: ROOT, stdio: 'pipe' });
    const run1 = {};
    for (const f of CHILD_SITEMAPS) run1[f] = stripLastmod(read(f));

    execSync('node scripts/generate-sitemaps.js', { cwd: ROOT, stdio: 'pipe' });
    const run2 = {};
    for (const f of CHILD_SITEMAPS) run2[f] = stripLastmod(read(f));

    const diffs = CHILD_SITEMAPS.filter((f) => run1[f] !== run2[f]);
    if (diffs.length === 0) {
      ok('I. Sitemap generation is structurally deterministic across repeated regeneration (URL set, changefreq, priority identical; lastmod excluded as git-history-driven)');
    } else {
      err('I. Non-deterministic sitemap regeneration in: ' + JSON.stringify(diffs));
    }
  } finally {
    // Restore the exact committed content regardless of outcome above.
    for (const f of ['sitemap.xml', ...CHILD_SITEMAPS]) {
      if (before[f] !== null) fs.writeFileSync(path.join(ROOT, f), before[f], 'utf8');
    }
    try {
      execSync('git checkout HEAD -- sitemap.xml ' + CHILD_SITEMAPS.join(' '), { cwd: ROOT, stdio: 'pipe' });
    } catch (e) { /* best-effort restore; explicit writeFileSync above already restored content */ }
  }
}

// ---------------------------------------------------------------------
// J. Downstream gates still pass: URL/indexation integrity and broken
//    links, both of which walk the live generated sitemap/page set
// ---------------------------------------------------------------------
try {
  execSync('node scripts/validate-url-indexation.js', { cwd: ROOT, stdio: 'pipe' });
  ok('J. validate-url-indexation.js: PASS');
} catch (e) {
  err('J. validate-url-indexation.js FAILED: ' + e.message);
}
try {
  execSync('node scripts/check-broken-links.js', { cwd: ROOT, stdio: 'pipe' });
  ok('J. check-broken-links.js: PASS');
} catch (e) {
  err('J. check-broken-links.js FAILED: ' + e.message);
}

// ---------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------
console.log('');
console.log('validate-phase-8h: ' + errors + ' error(s), ' + warnings + ' warning(s).');
if (errors > 0) {
  console.log('validate-phase-8h: FAIL');
  process.exit(1);
} else {
  console.log('validate-phase-8h: PASS');
}
