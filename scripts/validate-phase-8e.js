#!/usr/bin/env node
/**
 * validate-phase-8e.js
 *
 * Validates the Phase 8E Spanish production cluster (5 pool calculator
 * pages: chemical, pool-volume, pool-chlorine, pool-ph, pool-shock).
 * Covers spec Section 21 checks A-T.
 *
 * Run: node scripts/validate-phase-8e.js
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

const CLUSTER = [
  'chemical-calculator.html',
  'pool-volume-calculator.html',
  'pool-chlorine-calculator.html',
  'pool-ph-calculator.html',
  'pool-shock-calculator.html',
];

// ---------------------------------------------------------------------
// A. Baseline integrity
// ---------------------------------------------------------------------
try {
  const status = execSync('git status --porcelain', { cwd: ROOT }).toString();
  if (status.trim() === '') ok('A. Repository begins clean');
  else warn('A. Repository is not clean (expected mid-phase, before the final commit) -- proceeding');
} catch (e) {
  warn('A. Could not check git status: ' + e.message);
}

// ---------------------------------------------------------------------
// B. Spanish language configuration
// ---------------------------------------------------------------------
{
  const { getLanguage } = require('../js/i18n/languages');
  const es = getLanguage('es');
  if (es && es.pathPrefix === '/es' && es.default === false) ok('B. Spanish language configuration correct (js/i18n/languages.js)');
  else err('B. Spanish language configuration incorrect: ' + JSON.stringify(es));
}

// ---------------------------------------------------------------------
// C. Spanish URL policy
// ---------------------------------------------------------------------
{
  const urlPolicy = require('./url-policy');
  const isProd = urlPolicy.isProductionPage('es/calculators/chemical-calculator.html');
  const dir = urlPolicy.contentTopDir('es/calculators/chemical-calculator.html');
  if (isProd && dir === 'calculators') ok('C. /es/ URLs correctly recognized as production content by url-policy.js');
  else err('C. /es/ URL policy classification incorrect: isProductionPage=' + isProd + ' contentTopDir=' + dir);
}

// ---------------------------------------------------------------------
// D. Stable content IDs
// ---------------------------------------------------------------------
{
  const translationStatus = require('../js/i18n/translation-status');
  translationStatus.reload();
  const expectedIds = ['calculator:chemical', 'calculator:pool-volume', 'calculator:pool-chlorine', 'calculator:pool-ph', 'calculator:pool-shock'];
  let allOk = true;
  for (const id of expectedIds) {
    const record = translationStatus.getRecord(id);
    if (!record) { err('D. Missing content-ID record: ' + id); allOk = false; continue; }
    if (record.languages.en.url.includes(id) || record.contentId === record.languages.en.url) {
      err('D. Content ID "' + id + '" is not distinct from its URL');
      allOk = false;
    }
  }
  if (allOk) ok('D. All 5 cluster content IDs exist and are distinct from their language-specific URLs');
}

// ---------------------------------------------------------------------
// E. Spanish page existence
// ---------------------------------------------------------------------
{
  let allExist = true;
  for (const f of CLUSTER) {
    if (!exists('es/calculators/' + f)) { err('E. Missing Spanish page: es/calculators/' + f); allExist = false; }
  }
  if (allExist) ok('E. All 5 Spanish production pages exist on disk');
}

// ---------------------------------------------------------------------
// F. English page preservation
// ---------------------------------------------------------------------
{
  let allOk = true;
  for (const f of CLUSTER) {
    const html = read('calculators/' + f);
    if (!/<html lang="en">/.test(html)) { err('F. English page calculators/' + f + ' no longer has <html lang="en">'); allOk = false; }
    const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)">/);
    if (!canonicalMatch || canonicalMatch[1].includes('/es/')) { err('F. English page calculators/' + f + ' canonical is not English: ' + (canonicalMatch && canonicalMatch[1])); allOk = false; }
  }
  if (allOk) ok('F. English pages preserved: lang="en" and English canonical intact on all 5 cluster pages');
}

// ---------------------------------------------------------------------
// G. html lang
// ---------------------------------------------------------------------
{
  let allOk = true;
  for (const f of CLUSTER) {
    const html = read('es/calculators/' + f);
    if (!/<html lang="es">/.test(html)) { err('G. Spanish page es/calculators/' + f + ' does not have <html lang="es">'); allOk = false; }
  }
  if (allOk) ok('G. All 5 Spanish pages emit <html lang="es">');
}

// ---------------------------------------------------------------------
// H. Canonical correctness
// ---------------------------------------------------------------------
{
  let allOk = true;
  for (const f of CLUSTER) {
    const html = read('es/calculators/' + f);
    const m = html.match(/<link rel="canonical" href="([^"]+)">/);
    const expected = 'https://waterbalancetools.com/es/calculators/' + f.replace(/\.html$/, '');
    if (!m || m[1] !== expected) { err('H. Spanish page es/calculators/' + f + ' canonical incorrect: ' + (m && m[1]) + ' (expected ' + expected + ')'); allOk = false; }
  }
  if (allOk) ok('H. All 5 Spanish pages have correct, self-referential canonical URLs');
}

// ---------------------------------------------------------------------
// I. hreflang reciprocity
// ---------------------------------------------------------------------
{
  const { validateHreflangSet, reciprocityCheck } = require('../js/i18n/hreflang');
  const HREFLANG_RE = /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g;
  const pageMap = new Map();
  let allOk = true;
  for (const f of CLUSTER) {
    for (const dir of ['calculators', 'es/calculators']) {
      const rel = dir + '/' + f;
      const html = read(rel);
      const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)">/);
      const entries = [];
      let m;
      HREFLANG_RE.lastIndex = 0;
      while ((m = HREFLANG_RE.exec(html))) entries.push({ hreflang: m[1], href: m[2] });
      if (!canonicalMatch || entries.length === 0) { err('I. ' + rel + ' missing canonical or hreflang entries'); allOk = false; continue; }
      const result = validateHreflangSet(entries, { pageCanonical: canonicalMatch[1] });
      if (!result.valid) { err('I. ' + rel + ' hreflang validation failed: ' + result.errors.join('; ')); allOk = false; }
      pageMap.set(canonicalMatch[1], entries);
    }
  }
  const recip = reciprocityCheck(pageMap);
  if (!recip.valid) { for (const e of recip.errors) err('I. Reciprocity: ' + e); allOk = false; }
  if (allOk) ok('I. hreflang reciprocity confirmed across all 10 cluster files (5 English + 5 Spanish)');
}

// ---------------------------------------------------------------------
// J. Translation-status consistency
// ---------------------------------------------------------------------
{
  const translationStatus = require('../js/i18n/translation-status');
  translationStatus.reload();
  let allOk = true;
  const ids = ['calculator:chemical', 'calculator:pool-volume', 'calculator:pool-chlorine', 'calculator:pool-ph', 'calculator:pool-shock'];
  for (const id of ids) {
    if (!translationStatus.isTranslated(id, 'es')) { err('J. Content unit "' + id + '" is not marked translated for es'); allOk = false; }
    const record = translationStatus.getRecord(id);
    const esFile = record.languages.es.url.replace(/^\//, '') + '.html';
    if (!exists(esFile)) { err('J. Content unit "' + id + '" marked translated but file missing: ' + esFile); allOk = false; }
  }
  if (allOk) ok('J. Translation-status records for all 5 cluster units are consistent with actual files on disk');
}

// ---------------------------------------------------------------------
// K. Navigation integrity
// ---------------------------------------------------------------------
{
  const nav = JSON.parse(read('data/navigation.json'));
  const esPages = nav.pages.filter((p) => p.url.startsWith('/es/'));
  if (esPages.length === 0) ok('K. data/navigation.json correctly excludes the Spanish cluster (documented limitation, not yet wired)');
  else warn('K. data/navigation.json contains ' + esPages.length + ' /es/ page(s) -- if intentional, update this check');
  const navSrc = read('scripts/generate-navigation.js');
  if (/'es'/.test(navSrc) && /SKIP_DIRS/.test(navSrc)) ok('K. generate-navigation.js explicitly skips es/ (documented, not accidental)');
  else err('K. generate-navigation.js does not explicitly document skipping es/');
}

// ---------------------------------------------------------------------
// L. Internal-link integrity
// ---------------------------------------------------------------------
{
  let allOk = true;
  for (const f of CLUSTER) {
    const html = read('es/calculators/' + f);
    if (/href="\.\.\//.test(html)) { err('L. es/calculators/' + f + ' still contains an unresolved "../" relative link'); allOk = false; }
    if (/\/es\/es\//.test(html)) { err('L. es/calculators/' + f + ' contains /es/es/ duplication'); allOk = false; }
  }
  if (allOk) ok('L. No unresolved relative links or /es/es/ duplication in any Spanish cluster page');
}

// ---------------------------------------------------------------------
// M. Sitemap inclusion
// ---------------------------------------------------------------------
{
  if (!exists('sitemap-calculators.xml')) {
    err('M. sitemap-calculators.xml not found');
  } else {
    const xml = read('sitemap-calculators.xml');
    let allOk = true;
    for (const f of CLUSTER) {
      const url = 'https://waterbalancetools.com/es/calculators/' + f.replace(/\.html$/, '');
      if (!xml.includes('<loc>' + url + '</loc>')) { err('M. Sitemap missing Spanish URL: ' + url); allOk = false; }
    }
    if (allOk) ok('M. All 5 Spanish production URLs present in sitemap-calculators.xml');
  }
}

// ---------------------------------------------------------------------
// N. Robots/indexation status
// ---------------------------------------------------------------------
{
  const urlPolicy = require('./url-policy');
  let allOk = true;
  for (const f of CLUSTER) {
    const rel = 'es/calculators/' + f;
    const html = read(rel);
    const robots = urlPolicy.robotsMetaOf(html);
    if (robots && /noindex/i.test(robots)) { err('N. ' + rel + ' has noindex robots meta -- Spanish pages must be indexable'); allOk = false; }
    if (!urlPolicy.isIndexablePage(rel, html)) { err('N. ' + rel + ' is not indexable per url-policy'); allOk = false; }
  }
  if (allOk) ok('N. All 5 Spanish pages are indexable (no accidental noindex)');
}

// ---------------------------------------------------------------------
// O. Metadata presence
// ---------------------------------------------------------------------
{
  let allOk = true;
  for (const f of CLUSTER) {
    const html = read('es/calculators/' + f);
    if (!/<title>[^<]+<\/title>/.test(html)) { err('O. es/calculators/' + f + ' missing <title>'); allOk = false; }
    if (!/<meta name="description" content="[^"]+">/.test(html)) { err('O. es/calculators/' + f + ' missing meta description'); allOk = false; }
    if (!/<h1>[^<]+<\/h1>/.test(html)) { err('O. es/calculators/' + f + ' missing <h1>'); allOk = false; }
  }
  if (allOk) ok('O. All 5 Spanish pages have title, meta description, and h1');
}

// ---------------------------------------------------------------------
// P. Schema validity/integrity
// ---------------------------------------------------------------------
{
  let allOk = true;
  for (const f of CLUSTER) {
    const html = read('es/calculators/' + f);
    const scripts = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    if (scripts.length === 0) { err('P. es/calculators/' + f + ' has no JSON-LD schema'); allOk = false; continue; }
    for (const s of scripts) {
      try { JSON.parse(s); } catch (e) { err('P. es/calculators/' + f + ' has invalid JSON-LD: ' + e.message); allOk = false; }
    }
  }
  if (allOk) ok('P. All 5 Spanish pages have valid, parseable JSON-LD schema');
}

// ---------------------------------------------------------------------
// Q. Duplicate URL detection
// ---------------------------------------------------------------------
{
  const seen = new Set();
  let dupes = 0;
  for (const f of CLUSTER) {
    for (const dir of ['calculators', 'es/calculators']) {
      const html = read(dir + '/' + f);
      const m = html.match(/<link rel="canonical" href="([^"]+)">/);
      if (m) {
        if (seen.has(m[1])) { err('Q. Duplicate canonical URL: ' + m[1]); dupes++; }
        seen.add(m[1]);
      }
    }
  }
  if (dupes === 0) ok('Q. No duplicate canonical URLs across the 10 cluster files');
}

// ---------------------------------------------------------------------
// R. /es/es/ prevention
// ---------------------------------------------------------------------
{
  const { getLocalizedUrl } = require('../js/i18n/locale-url');
  const cases = ['/calculators/chemical-calculator', '/es/calculators/chemical-calculator', '/es/es/calculators/chemical-calculator'];
  let allOk = true;
  for (const c of cases) {
    const result = getLocalizedUrl(c, 'es');
    if (/\/es\/es\//.test(result)) { err('R. /es/es/ construction for input "' + c + '": ' + result); allOk = false; }
  }
  if (allOk) ok('R. No /es/es/ construction possible via the resolver');
}

// ---------------------------------------------------------------------
// S. Broken-link detection
// ---------------------------------------------------------------------
try {
  execSync('node scripts/check-broken-links.js', { cwd: ROOT, stdio: 'pipe' });
  ok('S. check-broken-links.js: 0 broken links sitewide (including the Spanish cluster)');
} catch (e) {
  err('S. check-broken-links.js FAILED: ' + (e.stdout || e.message).toString().split('\n').slice(0, 5).join(' | '));
}

// ---------------------------------------------------------------------
// T. Deterministic rebuild behavior -- runs each script as a genuinely
// separate process (execSync), matching how run-all-generators.js
// actually invokes them, rather than require()-ing them in-process
// (which would trigger their require()-time side effect at import,
// ambiguous with an explicit re-call).
// ---------------------------------------------------------------------
{
  const before = CLUSTER.map((f) => fs.readFileSync(path.join(ROOT, 'es/calculators', f), 'utf8'));
  execSync('node scripts/generate-spanish-cluster.js', { cwd: ROOT, stdio: 'pipe' });
  execSync('node scripts/inject-i18n-cluster.js', { cwd: ROOT, stdio: 'pipe' });
  const after = CLUSTER.map((f) => fs.readFileSync(path.join(ROOT, 'es/calculators', f), 'utf8'));
  let allOk = true;
  for (let i = 0; i < CLUSTER.length; i++) {
    if (before[i] !== after[i]) { err('T. es/calculators/' + CLUSTER[i] + ' is not stable under repeated generation'); allOk = false; }
  }
  if (allOk) ok('T. Spanish cluster generation is deterministic under repeated regeneration');
}

console.log('');
console.log('validate-phase-8e: ' + (errors === 0 ? 'PASS' : 'FAIL') + ' -- ' + errors + ' error(s), ' + warnings + ' warning(s).');
process.exit(errors === 0 ? 0 : 1);
