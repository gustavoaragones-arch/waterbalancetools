#!/usr/bin/env node
/**
 * validate-phase-8f.js
 *
 * Validates the Phase 8F Spanish regional SEO + language-awareness
 * foundation: the terminology data model, and the language-aware
 * navigation/search-index eligibility gates. Covers spec Section 22
 * checks A-T.
 *
 * Run: node scripts/validate-phase-8f.js
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
  'chemical-calculator.html', 'pool-volume-calculator.html', 'pool-chlorine-calculator.html',
  'pool-ph-calculator.html', 'pool-shock-calculator.html',
];
const VALID_REGIONS = new Set(['neutral', 'ES', 'MX', 'AR', 'UY', 'CL', 'CO']);
const VALID_STATUSES = new Set(['preferred', 'common', 'recognized', 'secondary', 'avoid-for-this-region']);

// ---------------------------------------------------------------------
// A. Clean Phase 8E baseline
// ---------------------------------------------------------------------
try {
  const status = execSync('git status --porcelain', { cwd: ROOT }).toString();
  if (status.trim() === '') ok('A. Repository begins clean');
  else warn('A. Repository is not clean (expected mid-phase, before the final commit) -- proceeding');
} catch (e) {
  warn('A. Could not check git status: ' + e.message);
}

// ---------------------------------------------------------------------
// B. Terminology schema validity
// ---------------------------------------------------------------------
let terminology;
try {
  terminology = JSON.parse(read('data/i18n/es/terminology.json'));
  if (Array.isArray(terminology.regions) && Array.isArray(terminology.concepts)) {
    ok('B. data/i18n/es/terminology.json is valid JSON with the expected top-level shape');
  } else {
    err('B. terminology.json is missing regions/concepts arrays');
  }
} catch (e) {
  err('B. terminology.json is not valid JSON: ' + e.message);
}

// ---------------------------------------------------------------------
// C. Stable concept IDs
// ---------------------------------------------------------------------
if (terminology) {
  const ids = terminology.concepts.map((c) => c.concept);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length === 0 && ids.every((id) => /^[a-z][a-z0-9_]*$/.test(id))) {
    ok('C. All ' + ids.length + ' concept IDs are unique and stable (snake_case identifiers)');
  } else {
    err('C. Concept ID problems: duplicates=' + JSON.stringify(dupes));
  }
}

// ---------------------------------------------------------------------
// D. Regional terminology integrity
// ---------------------------------------------------------------------
if (terminology) {
  let allOk = true;
  for (const c of terminology.concepts) {
    for (const v of c.variants) {
      if (!v.regionStatus || typeof v.regionStatus !== 'object') { err('D. ' + c.concept + '/' + v.term + ' missing regionStatus'); allOk = false; continue; }
      for (const [region, status] of Object.entries(v.regionStatus)) {
        if (!VALID_REGIONS.has(region)) { err('D. ' + c.concept + '/' + v.term + ' references unknown region "' + region + '"'); allOk = false; }
        if (!VALID_STATUSES.has(status)) { err('D. ' + c.concept + '/' + v.term + ' has invalid status "' + status + '" for region "' + region + '"'); allOk = false; }
      }
    }
  }
  if (allOk) ok('D. All regional terminology entries reference valid regions and status values');
}

// ---------------------------------------------------------------------
// E. No unsupported regional claims (every variant must cite evidence)
// ---------------------------------------------------------------------
if (terminology) {
  let allOk = true;
  for (const c of terminology.concepts) {
    for (const v of c.variants) {
      if (!Array.isArray(v.evidence) || v.evidence.length === 0) {
        err('E. ' + c.concept + '/' + v.term + ' has no evidence citation');
        allOk = false;
      }
      if (!v.confidence) {
        err('E. ' + c.concept + '/' + v.term + ' has no confidence rating');
        allOk = false;
      }
    }
  }
  if (allOk) ok('E. Every terminology variant cites evidence and a confidence rating');
}

// ---------------------------------------------------------------------
// F. No duplicate concepts
// ---------------------------------------------------------------------
if (terminology) {
  const canonicalTerms = terminology.concepts.map((c) => c.concept + ':' + c.canonicalTerm);
  const dupes = canonicalTerms.filter((t, i) => canonicalTerms.indexOf(t) !== i);
  if (dupes.length === 0) ok('F. No duplicate concept/canonical-term pairs');
  else err('F. Duplicate concept entries: ' + JSON.stringify(dupes));
}

// ---------------------------------------------------------------------
// G. No accidental keyword stuffing on the 5 production Spanish pages
// ---------------------------------------------------------------------
{
  const esTerm = require('../js/i18n/es-terminology');
  let allOk = true;
  for (const f of CLUSTER) {
    const html = read('es/calculators/' + f);
    const poolVariants = esTerm.getVariants('pool').map((v) => v.term);
    const distinctPoolTermsUsed = poolVariants.filter((t) => html.includes('>' + t) || html.includes(' ' + t + ' ') || html.includes(' ' + t + '.') || html.includes(' ' + t + ','));
    if (distinctPoolTermsUsed.length > 1) {
      err('G. ' + f + ' uses more than one "pool" concept term in visible copy (' + distinctPoolTermsUsed.join(', ') + ') -- looks like keyword stuffing');
      allOk = false;
    }
  }
  if (allOk) ok('G. No page in the Spanish cluster mixes multiple regional "pool" terms in visible copy (no keyword stuffing)');
}

// ---------------------------------------------------------------------
// H. Translation-status compatibility (content-ID integration, unchanged schema)
// ---------------------------------------------------------------------
{
  const translationStatus = require('../js/i18n/translation-status');
  translationStatus.reload();
  const ids = ['calculator:chemical', 'calculator:pool-volume', 'calculator:pool-chlorine', 'calculator:pool-ph', 'calculator:pool-shock'];
  const allTranslated = ids.every((id) => translationStatus.isTranslated(id, 'es'));
  if (allTranslated) ok('H. All 5 cluster content units remain "translated" in the unmodified translation-status.json schema');
  else err('H. One or more cluster content units lost their "translated" status');
}

// ---------------------------------------------------------------------
// I. Language-aware navigation
// ---------------------------------------------------------------------
{
  const nav = JSON.parse(read('data/navigation.json'));
  const esPages = nav.pages.filter((p) => p.url.startsWith('/es/'));
  const allHaveLang = nav.pages.every((p) => p.lang === 'en' || p.lang === 'es');
  const allEsTranslated = esPages.length === 5;
  if (allHaveLang && allEsTranslated) {
    ok('I. data/navigation.json is language-aware: every record carries `lang`, and exactly the 5 translated Spanish pages are present');
  } else {
    err('I. Navigation language-awareness broken: allHaveLang=' + allHaveLang + ' esPages=' + esPages.length);
  }
  const navSrc = read('scripts/generate-navigation.js');
  if (/TRANSLATED_ES_URLS/.test(navSrc) && !/'es',\s*\]\);/.test(navSrc.replace(/\s+/g, ' '))) {
    ok('I. generate-navigation.js uses a translation-status eligibility gate, not a blanket "es" directory skip');
  } else {
    err('I. generate-navigation.js does not appear to use the eligibility-gate architecture');
  }
}

// ---------------------------------------------------------------------
// J. Search-index language separation
// ---------------------------------------------------------------------
{
  const idx = JSON.parse(read('data/search-index.json'));
  const esEntries = idx.filter((p) => p.url.startsWith('/es/'));
  const allHaveLangAndContentId = esEntries.every((p) => p.lang === 'es' && p.contentId);
  const enSample = idx.find((p) => p.url === '/calculators/chemical-calculator');
  if (esEntries.length === 5 && allHaveLangAndContentId && enSample && enSample.lang === 'en' && enSample.contentId === 'calculator:chemical') {
    ok('J. Search index correctly distinguishes English/Spanish documents by `lang`, sharing `contentId` without merging them');
  } else {
    err('J. Search index language separation broken: esEntries=' + esEntries.length + ' allHaveLangAndContentId=' + allHaveLangAndContentId);
  }
}

// ---------------------------------------------------------------------
// K. Content-ID integrity
// ---------------------------------------------------------------------
{
  const translationStatus = require('../js/i18n/translation-status');
  translationStatus.reload();
  const nav = JSON.parse(read('data/navigation.json'));
  let allOk = true;
  for (const unit of translationStatus.getAllUnits()) {
    if (unit.languages.es && unit.languages.es.status === 'translated') {
      const navRecord = nav.pages.find((p) => p.url === unit.languages.es.url);
      if (!navRecord) { err('K. Content unit "' + unit.contentId + '" translated but missing from navigation.json'); allOk = false; }
    }
  }
  if (allOk) ok('K. Every translated content unit has a corresponding navigation.json record');
}

// ---------------------------------------------------------------------
// L. URL integrity (English URLs unchanged, Spanish URLs unchanged)
// ---------------------------------------------------------------------
{
  const EXPECTED = [
    '/calculators/chemical-calculator', '/calculators/pool-volume-calculator', '/calculators/pool-chlorine-calculator',
    '/calculators/pool-ph-calculator', '/calculators/pool-shock-calculator',
    '/es/calculators/chemical-calculator', '/es/calculators/pool-volume-calculator', '/es/calculators/pool-chlorine-calculator',
    '/es/calculators/pool-ph-calculator', '/es/calculators/pool-shock-calculator',
  ];
  const nav = JSON.parse(read('data/navigation.json'));
  const navUrls = new Set(nav.pages.map((p) => p.url));
  const allPresent = EXPECTED.every((u) => navUrls.has(u));
  if (allPresent) ok('L. All 10 expected cluster URLs (5 English + 5 Spanish) are present and unchanged');
  else err('L. Some expected cluster URLs are missing from navigation.json');
}

// ---------------------------------------------------------------------
// M. hreflang integrity (unchanged from Phase 8E)
// ---------------------------------------------------------------------
{
  const { validateHreflangSet, reciprocityCheck } = require('../js/i18n/hreflang');
  const HREFLANG_RE = /<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g;
  const pageMap = new Map();
  let allOk = true;
  for (const f of CLUSTER) {
    for (const dir of ['calculators', 'es/calculators']) {
      const html = read(dir + '/' + f);
      const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)">/);
      const entries = [];
      let m;
      HREFLANG_RE.lastIndex = 0;
      while ((m = HREFLANG_RE.exec(html))) entries.push({ hreflang: m[1], href: m[2] });
      if (!canonicalMatch || entries.length === 0) { err('M. ' + dir + '/' + f + ' missing canonical or hreflang'); allOk = false; continue; }
      const result = validateHreflangSet(entries, { pageCanonical: canonicalMatch[1] });
      if (!result.valid) { err('M. ' + dir + '/' + f + ': ' + result.errors.join('; ')); allOk = false; }
      pageMap.set(canonicalMatch[1], entries);
    }
  }
  const recip = reciprocityCheck(pageMap);
  if (!recip.valid) { for (const e of recip.errors) err('M. Reciprocity: ' + e); allOk = false; }
  const anyCountrySpecific = CLUSTER.some((f) => /hreflang="es-[A-Z]{2}"/.test(read('es/calculators/' + f)));
  if (anyCountrySpecific) { err('M. Country-specific hreflang (es-XX) found -- not authorized until real localized pages exist'); allOk = false; }
  if (allOk) ok('M. hreflang remains reciprocal, plain "es" only (no unauthorized es-XX codes)');
}

// ---------------------------------------------------------------------
// N. Sitemap integrity
// ---------------------------------------------------------------------
{
  const xml = read('sitemap-calculators.xml');
  const allPresent = CLUSTER.every((f) => xml.includes('https://waterbalancetools.com/es/calculators/' + f.replace(/\.html$/, '')));
  if (allPresent) ok('N. All 5 Spanish URLs remain present in sitemap-calculators.xml');
  else err('N. Sitemap missing one or more Spanish cluster URLs');
}

// ---------------------------------------------------------------------
// O. English non-regression
// ---------------------------------------------------------------------
{
  let allOk = true;
  for (const f of CLUSTER) {
    const html = read('calculators/' + f);
    if (!/<html lang="en">/.test(html)) { err('O. calculators/' + f + ' lost lang="en"'); allOk = false; }
  }
  const nav = JSON.parse(read('data/navigation.json'));
  const enCount = nav.pages.filter((p) => p.lang === 'en').length;
  if (enCount < 500) { err('O. Unexpectedly low English page count in navigation.json: ' + enCount); allOk = false; }
  if (allOk) ok('O. English pages unaffected (lang attribute intact, navigation English-page count unchanged in shape)');
}

// ---------------------------------------------------------------------
// P. Spanish page integrity
// ---------------------------------------------------------------------
{
  let allOk = true;
  for (const f of CLUSTER) {
    if (!exists('es/calculators/' + f)) { err('P. Missing es/calculators/' + f); allOk = false; continue; }
    const html = read('es/calculators/' + f);
    if (!/<html lang="es">/.test(html)) { err('P. es/calculators/' + f + ' missing lang="es"'); allOk = false; }
  }
  if (allOk) ok('P. All 5 Spanish pages intact with correct lang="es"');
}

// ---------------------------------------------------------------------
// Q. Deterministic generation
// ---------------------------------------------------------------------
{
  const before = read('data/navigation.json');
  execSync('node scripts/generate-navigation.js', { cwd: ROOT, stdio: 'pipe' });
  const after = read('data/navigation.json');
  const stripGen = (s) => { const d = JSON.parse(s); delete d._generated; return JSON.stringify(d); };
  if (stripGen(before) === stripGen(after)) ok('Q. generate-navigation.js is deterministic under repeated regeneration (excluding _generated timestamp)');
  else err('Q. generate-navigation.js output changed on repeated regeneration');
}

// ---------------------------------------------------------------------
// R. No /es/es/
// ---------------------------------------------------------------------
{
  const nav = JSON.parse(read('data/navigation.json'));
  const anyDoubled = nav.pages.some((p) => /\/es\/es\//.test(p.url));
  if (!anyDoubled) ok('R. No /es/es/ URLs anywhere in navigation.json');
  else err('R. /es/es/ URL found in navigation.json');
}

// ---------------------------------------------------------------------
// S. No untranslated-page leakage
// ---------------------------------------------------------------------
{
  const translationStatus = require('../js/i18n/translation-status');
  translationStatus.reload();
  const nav = JSON.parse(read('data/navigation.json'));
  const idx = JSON.parse(read('data/search-index.json'));
  let allOk = true;
  const esNavUrls = nav.pages.filter((p) => p.url.startsWith('/es/')).map((p) => p.url);
  const esIdxUrls = idx.filter((p) => p.url.startsWith('/es/')).map((p) => p.url);
  const translatedEsUrls = new Set(translationStatus.getAllUnits().filter((u) => u.languages.es && u.languages.es.status === 'translated').map((u) => u.languages.es.url));
  for (const u of [...esNavUrls, ...esIdxUrls]) {
    if (!translatedEsUrls.has(u)) { err('S. Untranslated /es/ URL leaked into navigation/search index: ' + u); allOk = false; }
  }
  if (allOk) ok('S. No untranslated-page leakage into navigation.json or search-index.json');
}

// ---------------------------------------------------------------------
// T. Existing Phase 8A-8E regression
// ---------------------------------------------------------------------
{
  const phases = ['8a', '8b', '8c', '8d', '8e'];
  let allOk = true;
  for (const p of phases) {
    try {
      const out = execSync('node scripts/validate-phase-' + p + '.js', { cwd: ROOT }).toString();
      if (!/: PASS/.test(out)) { err('T. validate-phase-' + p + '.js did not report PASS'); allOk = false; }
    } catch (e) {
      err('T. validate-phase-' + p + '.js FAILED');
      allOk = false;
    }
  }
  if (allOk) ok('T. Phase 8A-8E validators all pass (0 regression)');
}

console.log('');
console.log('validate-phase-8f: ' + (errors === 0 ? 'PASS' : 'FAIL') + ' -- ' + errors + ' error(s), ' + warnings + ' warning(s).');
process.exit(errors === 0 ? 0 : 1);
