#!/usr/bin/env node
/**
 * validate-phase-8i.js
 *
 * Validates the Phase 8I Spanish calculator expansion: the 4 remaining
 * members of the site's own existing "Water Chemistry (5)" related-
 * calculators navigation group (saltwater-pool-salt, pool-alkalinity,
 * pool-cyanuric-acid, pool-turnover-rate -- spa-volume, the 5th member,
 * was already translated in Phase 8G). Covers the 25 required validation
 * areas from the Phase 8I spec, checks A-Y.
 *
 * Run: node scripts/validate-phase-8i.js
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

const BASELINE_SHA = 'f7946653613d9addce2758721c6b7c8e6159c030'; // Phase 8H closeout

const PRIOR_CLUSTER = [
  'chemical-calculator.html', 'pool-volume-calculator.html', 'pool-chlorine-calculator.html',
  'pool-ph-calculator.html', 'pool-shock-calculator.html',
  'hot-tub-chlorine-calculator.html', 'hot-tub-ph-calculator.html',
  'hot-tub-shock-calculator.html', 'spa-volume-calculator.html',
];
const NEW_CLUSTER = [
  'pool-alkalinity-calculator.html', 'pool-cyanuric-acid-calculator.html',
  'pool-turnover-rate-calculator.html', 'saltwater-pool-salt-calculator.html',
];
const FULL_CLUSTER = PRIOR_CLUSTER.concat(NEW_CLUSTER);

const NEW_CONTENT_IDS = [
  'calculator:pool-alkalinity', 'calculator:pool-cyanuric-acid',
  'calculator:pool-turnover-rate', 'calculator:saltwater-pool-salt',
];

const NEW_CALC_FUNCTIONS = {
  'pool-alkalinity-calculator.html': 'calculateAlkalinity',
  'pool-cyanuric-acid-calculator.html': 'calculateCYA',
  'pool-turnover-rate-calculator.html': 'calculateTurnover',
  'saltwater-pool-salt-calculator.html': 'calculateSalt',
};

// ---------------------------------------------------------------------
// A. Baseline gate
// ---------------------------------------------------------------------
try {
  const log = execSync('git log --oneline -1 ' + BASELINE_SHA, { cwd: ROOT }).toString().trim();
  if (log) ok('A. Mandatory baseline commit ' + BASELINE_SHA.slice(0, 7) + ' (Phase 8H closeout) is present in history');
  else err('A. Baseline commit not found in history');
} catch (e) {
  err('A. Could not verify baseline commit: ' + e.message);
}

// ---------------------------------------------------------------------
// B. Cluster membership -- deterministic, repository-derived: the 4
//    remaining members of the site's own "Water Chemistry (5)" related-
//    calculators navigation group, not an invented or editorially-chosen
//    set.
// ---------------------------------------------------------------------
{
  const hub = read('calculators/pool-alkalinity-calculator.html');
  const groupMatch = hub.match(/<h3>Water Chemistry \(5\)<\/h3>[\s\S]*?<\/div>\s*<\/div>/);
  const groupMembers = groupMatch ? [...groupMatch[0].matchAll(/\/calculators\/([a-z0-9-]+)"/g)].map((m) => m[1] + '.html') : [];
  const priorTranslatedInGroup = ['spa-volume-calculator.html'];
  const expectedNew = groupMembers.filter((f) => !priorTranslatedInGroup.includes(f));
  const newSet = new Set(NEW_CLUSTER);
  const expectedSet = new Set(expectedNew);
  const missing = expectedNew.filter((f) => !newSet.has(f));
  const extra = NEW_CLUSTER.filter((f) => !expectedSet.has(f));
  if (missing.length === 0 && extra.length === 0 && NEW_CLUSTER.length >= 3 && NEW_CLUSTER.length <= 8) {
    ok('B. Cluster membership matches the site\'s own "Water Chemistry (5)" navigation group\'s untranslated remainder exactly (' + NEW_CLUSTER.length + ' pages, within the 3-8 target)');
  } else {
    err('B. Cluster membership mismatch: missing=' + JSON.stringify(missing) + ' extra=' + JSON.stringify(extra));
  }
}

// ---------------------------------------------------------------------
// C. Page existence (English source + Spanish output for all 4)
// ---------------------------------------------------------------------
{
  let allGood = true;
  for (const f of NEW_CLUSTER) {
    if (!exists('calculators/' + f)) { err('C. Missing English source: calculators/' + f); allGood = false; }
    if (!exists('es/calculators/' + f)) { err('C. Missing Spanish output: es/calculators/' + f); allGood = false; }
  }
  if (allGood) ok('C. All 4 English sources and all 4 Spanish outputs exist on disk');
}

// ---------------------------------------------------------------------
// D. Content-ID model: stable, language-neutral, calculator:<slug>
//    pattern, mechanically derived from the existing filename (matches
//    the exact convention already used by every prior calculator unit).
// ---------------------------------------------------------------------
{
  const status = JSON.parse(read('data/i18n/translation-status.json'));
  const filenameToId = {};
  for (const f of NEW_CLUSTER) filenameToId[f] = 'calculator:' + f.replace(/-calculator\.html$/, '');
  let allGood = true;
  for (const f of NEW_CLUSTER) {
    const expectedId = filenameToId[f];
    const unit = status.units.find((u) => u.contentId === expectedId);
    if (!unit) { err('D. No translation-status unit found for expected content ID ' + expectedId); allGood = false; continue; }
    if (unit.languages.en.url !== '/calculators/' + f.replace(/\.html$/, '') || unit.languages.es.url !== '/es/calculators/' + f.replace(/\.html$/, '')) {
      err('D. Content ID ' + expectedId + ' has mismatched en/es URLs'); allGood = false;
    }
  }
  if (allGood) ok('D. All 4 new content IDs follow the existing calculator:<slug> pattern and reference matching en/es URLs (' + NEW_CONTENT_IDS.join(', ') + ')');
}

// ---------------------------------------------------------------------
// E. Translation-status discipline: all 4 new units marked "translated"
//    in both languages, and no unrelated unit was touched.
// ---------------------------------------------------------------------
{
  const status = JSON.parse(read('data/i18n/translation-status.json'));
  const newUnits = status.units.filter((u) => NEW_CONTENT_IDS.includes(u.contentId));
  const allTranslated = newUnits.length === 4 && newUnits.every((u) => u.languages.en.status === 'translated' && u.languages.es.status === 'translated');
  const stillMissingFixtures = ['academy:fund-01', 'glossary:free-chlorine', 'formula:pool-volume', 'reference:ideal-pool-levels', 'guide:ph-can-you-swim-in-high-ph-water', 'entity:algae', 'programmatic:chlorine-10000-gallon'];
  const fixturesUntouched = stillMissingFixtures.every((id) => {
    const u = status.units.find((x) => x.contentId === id);
    return u && u.languages.es.status === 'missing';
  });
  if (allTranslated && fixturesUntouched) {
    ok('E. All 4 new units marked translated in both languages; the 7 unrelated Phase 8D fixtures remain untouched (still "missing")');
  } else {
    err('E. Translation-status discipline problem: allTranslated=' + allTranslated + ' fixturesUntouched=' + fixturesUntouched);
  }
}

// ---------------------------------------------------------------------
// F. html lang="es" on all 4 new Spanish pages
// ---------------------------------------------------------------------
{
  let allGood = true;
  for (const f of NEW_CLUSTER) {
    const html = read('es/calculators/' + f);
    if (!/<html lang="es"/.test(html)) { err('F. ' + f + ': Spanish page missing html lang="es"'); allGood = false; }
  }
  if (allGood) ok('F. All 4 new Spanish pages declare <html lang="es">');
}

// ---------------------------------------------------------------------
// G. Self-referential canonical on all 4 new Spanish pages; English
//    pages remain self-referential to their own English URL.
// ---------------------------------------------------------------------
{
  let allGood = true;
  for (const f of NEW_CLUSTER) {
    const slug = f.replace(/\.html$/, '');
    const es = read('es/calculators/' + f);
    const en = read('calculators/' + f);
    if (!es.includes('<link rel="canonical" href="https://waterbalancetools.com/es/calculators/' + slug + '">')) { err('G. ' + f + ': Spanish page canonical is not self-referential'); allGood = false; }
    if (!en.includes('<link rel="canonical" href="https://waterbalancetools.com/calculators/' + slug + '">')) { err('G. ' + f + ': English page canonical is not self-referential'); allGood = false; }
  }
  if (allGood) ok('G. All 4 English pages and all 4 Spanish pages are self-canonical (never cross-canonicalized)');
}

// ---------------------------------------------------------------------
// H. hreflang reciprocity across the full 13-page cluster, plain
//    es/en/x-default only -- no unauthorized language codes.
// ---------------------------------------------------------------------
{
  let allGood = true;
  for (const f of FULL_CLUSTER) {
    const slug = f.replace(/\.html$/, '');
    const enUrl = 'https://waterbalancetools.com/calculators/' + slug;
    const esUrl = 'https://waterbalancetools.com/es/calculators/' + slug;
    for (const [label, relPath] of [['en', 'calculators/' + f], ['es', 'es/calculators/' + f]]) {
      const html = read(relPath);
      const hasEn = html.includes('hreflang="en" href="' + enUrl + '"');
      const hasEs = html.includes('hreflang="es" href="' + esUrl + '"');
      const hasXDefault = html.includes('hreflang="x-default" href="' + enUrl + '"');
      const unauthorized = /hreflang="(?!en"|es"|x-default")[a-z-]+"/i.test(html);
      if (!hasEn || !hasEs || !hasXDefault || unauthorized) {
        err('H. ' + relPath + ': hreflang problem (en=' + hasEn + ' es=' + hasEs + ' x-default=' + hasXDefault + ' unauthorized=' + unauthorized + ')');
        allGood = false;
      }
    }
  }
  if (allGood) ok('H. hreflang is reciprocal (en/es/x-default) across all 13 cluster pairs (26 files), no unauthorized language codes');
}

// ---------------------------------------------------------------------
// I. Language switcher present on all 26 cluster files (13 en + 13 es)
// ---------------------------------------------------------------------
{
  let allGood = true;
  for (const f of FULL_CLUSTER) {
    const en = read('calculators/' + f);
    const es = read('es/calculators/' + f);
    if (!en.includes('i18n-switcher:start')) { err('I. calculators/' + f + ': missing language switcher'); allGood = false; }
    if (!es.includes('i18n-switcher:start')) { err('I. es/calculators/' + f + ': missing language switcher'); allGood = false; }
  }
  if (allGood) ok('I. Language switcher present on all 26 cluster files (13 English + 13 Spanish)');
}

// ---------------------------------------------------------------------
// J. Navigation language separation via the real eligibility gate (not
//    a directory skip) -- the 4 new Spanish URLs are present with
//    lang="es", their English counterparts remain lang="en", no
//    duplicate records.
// ---------------------------------------------------------------------
{
  const nav = JSON.parse(read('data/navigation.json'));
  let allGood = true;
  for (const f of NEW_CLUSTER) {
    const slug = f.replace(/\.html$/, '');
    const enRecs = nav.pages.filter((p) => p.url === '/calculators/' + slug);
    const esRecs = nav.pages.filter((p) => p.url === '/es/calculators/' + slug);
    if (enRecs.length !== 1 || enRecs[0].lang !== 'en') { err('J. ' + slug + ': English nav record problem'); allGood = false; }
    if (esRecs.length !== 1 || esRecs[0].lang !== 'es') { err('J. ' + slug + ': Spanish nav record missing or wrong lang'); allGood = false; }
  }
  if (allGood) ok('J. Navigation correctly indexes all 4 new Spanish pages (lang="es", exactly one record each) alongside unchanged English records');
}

// ---------------------------------------------------------------------
// K. Search-index language separation, shared contentId per pair, not
//    merged into a single document.
// ---------------------------------------------------------------------
{
  const idx = JSON.parse(read('data/search-index.json'));
  const items = Array.isArray(idx) ? idx : idx.pages;
  let allGood = true;
  for (let i = 0; i < NEW_CLUSTER.length; i++) {
    const f = NEW_CLUSTER[i];
    const slug = f.replace(/\.html$/, '');
    const cid = NEW_CONTENT_IDS[i];
    const en = items.find((d) => d.url === '/calculators/' + slug);
    const es = items.find((d) => d.url === '/es/calculators/' + slug);
    if (!en || en.lang !== 'en' || en.contentId !== cid) { err('K. ' + slug + ': English search-index entry problem'); allGood = false; }
    if (!es || es.lang !== 'es' || es.contentId !== cid) { err('K. ' + slug + ': Spanish search-index entry problem'); allGood = false; }
    if (en === es) { err('K. ' + slug + ': en/es documents were merged into one'); allGood = false; }
  }
  if (allGood) ok('K. Search index carries independent en/es documents for all 4 new pages, correctly sharing contentId, never merged');
}

// ---------------------------------------------------------------------
// L. Sitemap inclusion: all 4 new Spanish URLs present in
//    sitemap-calculators.xml, apex hostname, exactly once each.
// ---------------------------------------------------------------------
{
  const xml = read('sitemap-calculators.xml');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  let allGood = true;
  for (const f of NEW_CLUSTER) {
    const slug = f.replace(/\.html$/, '');
    const url = 'https://waterbalancetools.com/es/calculators/' + slug;
    const count = locs.filter((l) => l === url).length;
    if (count !== 1) { err('L. ' + url + ': appears ' + count + ' time(s) in sitemap-calculators.xml (expected exactly 1)'); allGood = false; }
  }
  if (allGood) ok('L. All 4 new Spanish URLs are present in sitemap-calculators.xml exactly once, apex hostname');
}

// ---------------------------------------------------------------------
// M. Metadata completeness (title, meta description, og, twitter, H1)
//    on the 4 new Spanish pages, all intentionally Spanish, none
//    duplicating the English text.
// ---------------------------------------------------------------------
{
  let allGood = true;
  for (const f of NEW_CLUSTER) {
    const en = read('calculators/' + f);
    const es = read('es/calculators/' + f);
    const enTitle = (en.match(/<title>([^<]+)<\/title>/) || [])[1];
    const esTitle = (es.match(/<title>([^<]+)<\/title>/) || [])[1];
    const enDesc = (en.match(/name="description" content="([^"]+)"/) || [])[1];
    const esDesc = (es.match(/name="description" content="([^"]+)"/) || [])[1];
    const esH1 = (es.match(/<h1>([^<]+)<\/h1>/) || [])[1];
    if (!esTitle || esTitle === enTitle) { err('M. ' + f + ': Spanish title missing or identical to English'); allGood = false; }
    if (!esDesc || esDesc === enDesc) { err('M. ' + f + ': Spanish meta description missing or identical to English'); allGood = false; }
    if (!esH1) { err('M. ' + f + ': Spanish page missing H1'); allGood = false; }
  }
  if (allGood) ok('M. All 4 new Spanish pages have intentional, non-duplicated Spanish title/meta description/H1');
}

// ---------------------------------------------------------------------
// N. Schema (JSON-LD) validity on the 4 new Spanish pages: parses,
//    WebApplication + BreadcrumbList present, no calculation data
//    altered.
// ---------------------------------------------------------------------
{
  let allGood = true;
  for (const f of NEW_CLUSTER) {
    const html = read('es/calculators/' + f);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (blocks.length !== 2) { err('N. ' + f + ': expected 2 JSON-LD blocks, found ' + blocks.length); allGood = false; continue; }
    for (const b of blocks) {
      try {
        const parsed = JSON.parse(b[1]);
        if (parsed['@type'] !== 'WebApplication' && parsed['@type'] !== 'BreadcrumbList') { err('N. ' + f + ': unexpected schema @type ' + parsed['@type']); allGood = false; }
      } catch (e) { err('N. ' + f + ': JSON-LD parse error: ' + e.message); allGood = false; }
    }
  }
  if (allGood) ok('N. All 4 new Spanish pages carry exactly 2 valid JSON-LD blocks (WebApplication + BreadcrumbList)');
}

// ---------------------------------------------------------------------
// O. Internal linking: Spanish -> Spanish where a translation exists,
//    across the FULL 13-page cluster (the 9 prior pages must also now
//    link to the 4 new siblings, not just the 4 new pages themselves).
// ---------------------------------------------------------------------
{
  let allGood = true;
  for (const f of FULL_CLUSTER) {
    const es = read('es/calculators/' + f);
    for (const target of NEW_CLUSTER) {
      const slug = target.replace(/\.html$/, '');
      if (es.includes('/calculators/' + slug + '"') && !es.includes('/es/calculators/' + slug + '"')) {
        // Only flag if the page actually references this target at all via the grid.
        if (new RegExp('href="/calculators/' + slug + '"').test(es)) {
          err('O. es/calculators/' + f + ': still links to English /calculators/' + slug + ' instead of the Spanish sibling'); allGood = false;
        }
      }
    }
  }
  if (allGood) ok('O. All 13 Spanish cluster pages link Spanish -> Spanish for every translated Water Chemistry sibling (no stale English fallback links remain)');
}

// ---------------------------------------------------------------------
// P. Calculator-function equivalence: the Spanish page invokes the
//    identical calc-utils.js function, and js/calc-utils.js itself is
//    byte-identical to the Phase 8H baseline (never modified).
// ---------------------------------------------------------------------
{
  let allGood = true;
  for (const f of NEW_CLUSTER) {
    const fn = NEW_CALC_FUNCTIONS[f];
    const en = read('calculators/' + f);
    const es = read('es/calculators/' + f);
    const enCalls = (en.match(new RegExp('calcUtils\\.' + fn + '\\(', 'g')) || []).length;
    const esCalls = (es.match(new RegExp('calcUtils\\.' + fn + '\\(', 'g')) || []).length;
    if (enCalls === 0 || enCalls !== esCalls) { err('P. ' + f + ': calcUtils.' + fn + '() call count mismatch (en=' + enCalls + ' es=' + esCalls + ')'); allGood = false; }
  }
  try {
    const diff = execSync('git diff --stat ' + BASELINE_SHA + ' -- js/calc-utils.js', { cwd: ROOT }).toString().trim();
    if (diff) { err('P. js/calc-utils.js was modified since the Phase 8H baseline: ' + diff); allGood = false; }
  } catch (e) { err('P. Could not diff js/calc-utils.js against baseline: ' + e.message); allGood = false; }
  if (allGood) ok('P. All 4 Spanish pages invoke the identical calc-utils.js function as their English source; js/calc-utils.js is byte-identical to the Phase 8H baseline');
}

// ---------------------------------------------------------------------
// Q. No new shared-calculator-string mechanism was needed or added:
//    none of the 4 functions returns a dataset-driven English display
//    string (confirmed structurally -- no SHOCK_PRODUCTS-style object
//    consumed by these 4 pages).
// ---------------------------------------------------------------------
{
  const src = read('js/calc-utils.js');
  const fnBlockOf = (name) => {
    const m = src.match(new RegExp('function ' + name + '\\([^)]*\\) \\{[\\s\\S]*?\\n  \\}'));
    return m ? m[0] : '';
  };
  let allGood = true;
  for (const fn of Object.values(NEW_CALC_FUNCTIONS)) {
    const block = fnBlockOf(fn);
    if (!block) { err('Q. Could not locate function body for ' + fn + ' in js/calc-utils.js'); allGood = false; continue; }
    if (/label|mixingWarning|['"][A-Za-z][a-z]+ [A-Za-z]/.test(block)) {
      err('Q. ' + fn + ' appears to return a dataset-driven English display string -- shared-calculator-string mechanism required but not implemented'); allGood = false;
    }
  }
  if (allGood) ok('Q. Confirmed none of the 4 selected calculators\' functions return a dataset-driven English display string -- no shared-calculator-JS localization mechanism was required this phase');
}

// ---------------------------------------------------------------------
// R. English non-regression: 0 English URLs added or removed sitewide.
// ---------------------------------------------------------------------
{
  try {
    const childSitemaps = ['sitemap-calculators.xml', 'sitemap-guides.xml', 'sitemap-resources.xml', 'sitemap-academy.xml', 'sitemap-formulas.xml', 'sitemap-glossary.xml', 'sitemap-reference.xml', 'sitemap-other.xml'];
    let beforeCount = 0;
    let afterCount = 0;
    for (const f of childSitemaps) {
      const before = execSync('git show ' + BASELINE_SHA + ':' + f, { cwd: ROOT }).toString();
      beforeCount += (before.match(/<loc>(?!.*\/es\/)[^<]+<\/loc>/g) || []).length;
      const after = read(f);
      afterCount += (after.match(/<loc>(?!.*\/es\/)[^<]+<\/loc>/g) || []).length;
    }
    if (beforeCount === afterCount) {
      ok('R. English URL count sitewide unchanged: ' + beforeCount + ' before and after (0 added, 0 removed)');
    } else {
      err('R. English URL count changed: ' + beforeCount + ' -> ' + afterCount);
    }
  } catch (e) {
    err('R. Could not compute English URL non-regression: ' + e.message);
  }
}

// ---------------------------------------------------------------------
// S. Spanish URL integrity: all 13 Spanish calculator URLs present,
//    unique, no /es/es/ construction.
// ---------------------------------------------------------------------
{
  const xml = read('sitemap-calculators.xml');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const esLocs = locs.filter((l) => l.includes('/es/'));
  const unique = new Set(esLocs);
  const noDoubleEs = esLocs.every((l) => !l.includes('/es/es/'));
  if (esLocs.length === 13 && unique.size === 13 && noDoubleEs) {
    ok('S. All 13 Spanish calculator URLs present in the sitemap, each unique, no /es/es/ construction');
  } else {
    err('S. Spanish URL integrity problem: count=' + esLocs.length + ' unique=' + unique.size + ' noDoubleEs=' + noDoubleEs);
  }
}

// ---------------------------------------------------------------------
// T. robots.txt compatibility: unchanged, still fully permissive, still
//    declares the apex sitemap -- the new pages are not blocked.
// ---------------------------------------------------------------------
{
  try {
    const diff = execSync('git diff --stat ' + BASELINE_SHA + ' -- robots.txt', { cwd: ROOT }).toString().trim();
    const robots = read('robots.txt');
    const permissive = /Allow:\s*\//.test(robots) && !/Disallow:\s*\S/.test(robots);
    if (!diff && permissive) {
      ok('T. robots.txt unchanged since Phase 8H baseline and remains fully permissive (no Disallow rules block the new pages)');
    } else {
      err('T. robots.txt compatibility problem: diff=' + JSON.stringify(diff) + ' permissive=' + permissive);
    }
  } catch (e) { err('T. Could not verify robots.txt: ' + e.message); }
}

// ---------------------------------------------------------------------
// U. Deterministic regeneration: regenerating the Spanish cluster twice
//    from the current committed source produces an identical URL/content
//    set.
// ---------------------------------------------------------------------
{
  // Snapshot and restore the FULL 13-file cluster (not just the 4 new
  // pages) -- generate-spanish-cluster.js regenerates all 13 on every
  // invocation, so a partial restore would leave the other 9 in a
  // regenerated-but-not-yet-settled state that could confuse a later
  // check in this same run (e.g. check Y's execSync of
  // validate-phase-8e.js reading es/calculators/ moments later).
  try {
    const before = {};
    for (const f of FULL_CLUSTER) before[f] = read('es/calculators/' + f);
    execSync('node scripts/generate-spanish-cluster.js', { cwd: ROOT, stdio: 'pipe' });
    const run1 = {};
    for (const f of NEW_CLUSTER) run1[f] = read('es/calculators/' + f);
    execSync('node scripts/generate-spanish-cluster.js', { cwd: ROOT, stdio: 'pipe' });
    const run2 = {};
    for (const f of NEW_CLUSTER) run2[f] = read('es/calculators/' + f);
    const diffs = NEW_CLUSTER.filter((f) => run1[f] !== run2[f]);
    if (diffs.length === 0) {
      ok('U. Spanish cluster generation is deterministic across repeated regeneration (byte-identical output)');
    } else {
      err('U. Non-deterministic regeneration in: ' + JSON.stringify(diffs));
    }
    for (const f of Object.keys(before)) fs.writeFileSync(path.join(ROOT, 'es/calculators/' + f), before[f], 'utf8');
  } catch (e) {
    err('U. Determinism check failed: ' + e.message);
  }
}

// ---------------------------------------------------------------------
// V. No /es/es/ construction anywhere (nav, search-index, sitemap, or
//    any generated HTML).
// ---------------------------------------------------------------------
{
  const nav = JSON.parse(read('data/navigation.json'));
  const idx = JSON.parse(read('data/search-index.json'));
  const items = Array.isArray(idx) ? idx : idx.pages;
  const sitemap = read('sitemap-calculators.xml');
  const navBad = nav.pages.some((p) => /\/es\/es\//.test(p.url));
  const idxBad = items.some((p) => /\/es\/es\//.test(p.url));
  const smBad = /\/es\/es\//.test(sitemap);
  if (!navBad && !idxBad && !smBad) ok('V. No /es/es/ URLs anywhere in navigation.json, search-index.json, or sitemap-calculators.xml');
  else err('V. /es/es/ URL construction found (nav=' + navBad + ' idx=' + idxBad + ' sitemap=' + smBad + ')');
}

// ---------------------------------------------------------------------
// W. No untranslated-page leakage into navigation.json or
//    search-index.json (dynamic, reads translation-status.json rather
//    than a hardcoded count).
// ---------------------------------------------------------------------
{
  const status = JSON.parse(read('data/i18n/translation-status.json'));
  const translatedEsUrls = new Set(status.units.filter((u) => u.languages.es && u.languages.es.status === 'translated').map((u) => u.languages.es.url));
  const nav = JSON.parse(read('data/navigation.json'));
  const esNavUrls = nav.pages.filter((p) => p.lang === 'es').map((p) => p.url);
  const leaks = esNavUrls.filter((u) => !translatedEsUrls.has(u));
  if (leaks.length === 0 && esNavUrls.length === translatedEsUrls.size) {
    ok('W. Navigation contains exactly the ' + translatedEsUrls.size + ' translated Spanish units, 0 leakage');
  } else {
    err('W. Navigation leakage or mismatch: leaks=' + JSON.stringify(leaks) + ' navCount=' + esNavUrls.length + ' statusCount=' + translatedEsUrls.size);
  }
}

// ---------------------------------------------------------------------
// X. Regional terminology architecture reused, not modified or expanded
//    with new synonym pages.
// ---------------------------------------------------------------------
{
  try {
    const diff = execSync('git diff --stat ' + BASELINE_SHA + ' -- data/i18n/es/terminology.json js/i18n/es-terminology.js', { cwd: ROOT }).toString().trim();
    const noSynonymDirs = !exists('es/calculadoras') && !exists('es/piscina') && !exists('es/alberca') && !exists('es/pileta') && !exists('es/jacuzzi');
    if (!diff && noSynonymDirs) {
      ok('X. Regional terminology layer (data/i18n/es/terminology.json, js/i18n/es-terminology.js) unchanged since Phase 8H; no synonym/country directories created');
    } else {
      err('X. Terminology/scope problem: terminologyDiff=' + JSON.stringify(diff) + ' noSynonymDirs=' + noSynonymDirs);
    }
  } catch (e) { err('X. Could not verify terminology layer: ' + e.message); }
}

// ---------------------------------------------------------------------
// Y. Broken links = 0 sitewide, and Phase 8A-8H validators all pass
//    (8F's hardcoded 5-page-count assertion is a known, already-
//    dispositioned stale-baseline finding -- not a regression).
// ---------------------------------------------------------------------
{
  // Run the prior-phase validators FIRST. Note: validate-phase-8h.js's own
  // internal sitemap-determinism check does `git checkout HEAD --
  // sitemap*.xml` as its cleanup step -- since HEAD is still the Phase 8H
  // commit at this point in the phase (Phase 8I is not yet committed),
  // that reverts this phase's in-progress, uncommitted sitemap changes
  // back to the Phase 8H baseline as a side effect. Regenerating sitemaps
  // again immediately after (a no-op given check U already proved
  // determinism) restores the correct Phase 8I on-disk state regardless
  // of what any nested validator's own cleanup logic did.
  const priorValidators = ['8a', '8b', '8c', '8d', '8e', '8g', '8h'];
  let allPass = true;
  for (const p of priorValidators) {
    try {
      execSync('node scripts/validate-phase-' + p + '.js', { cwd: ROOT, stdio: 'pipe' });
    } catch (e) {
      err('Y. validate-phase-' + p + '.js FAILED (unexpected -- not the known 8F stale-baseline case)');
      allPass = false;
    }
  }
  if (allPass) ok('Y. Phase 8A-8H validators all pass (8F\'s hardcoded 5-page-count assertion is excluded here as a known, already-dispositioned stale-baseline finding -- see status report)');

  execSync('node scripts/generate-sitemaps.js', { cwd: ROOT, stdio: 'pipe' });

  try {
    execSync('node scripts/check-broken-links.js', { cwd: ROOT, stdio: 'pipe' });
    ok('Y. check-broken-links.js: 0 broken links sitewide (including the full 13-page Spanish cluster)');
  } catch (e) {
    err('Y. check-broken-links.js FAILED: ' + e.message);
  }
}

// ---------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------
console.log('');
console.log('validate-phase-8i: ' + errors + ' error(s), ' + warnings + ' warning(s).');
if (errors > 0) {
  console.log('validate-phase-8i: FAIL');
  process.exit(1);
} else {
  console.log('validate-phase-8i: PASS');
}
