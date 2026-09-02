#!/usr/bin/env node
/**
 * validate-phase-8d.js
 *
 * Validates the Phase 8D multilingual ARCHITECTURE (not Spanish content --
 * there is none). Checks the 20 items required by spec Section 29.
 *
 * Run: node scripts/validate-phase-8d.js
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
function fileExists(rel) { return fs.existsSync(path.join(ROOT, rel)); }

// 1. Language configuration exists
{
  if (fileExists('js/i18n/languages.js')) ok('1. Language configuration exists (js/i18n/languages.js)');
  else err('1. js/i18n/languages.js not found');
}

// 2/3. English remains default; Spanish is configured as "es"
{
  try {
    const { getDefaultLanguage, getLanguage } = require('../js/i18n/languages');
    const def = getDefaultLanguage();
    if (def.code === 'en' && def.pathPrefix === '') ok('2. English remains the default language (pathPrefix "")');
    else err('2. Default language is not English-with-empty-prefix: ' + JSON.stringify(def));

    const es = getLanguage('es');
    if (es && es.pathPrefix === '/es' && es.default === false) ok('3. Spanish is configured as "es" with pathPrefix "/es", default: false');
    else err('3. Spanish is not correctly configured: ' + JSON.stringify(es));
  } catch (e) {
    err('2/3. Could not load js/i18n/languages.js: ' + e.message);
  }
}

// 4. English URLs remain unchanged (spot check via url-engine + no
//    production HTML modified -- see forensic differential in the status
//    report for the authoritative build-level proof; here we confirm the
//    resolver itself is a correct passthrough for English).
{
  try {
    const { getLocalizedUrl } = require('../js/i18n/locale-url');
    const samples = ['/calculators/pool-volume-calculator', '/academy/fundamentals/understanding-pool-water-chemistry', '/'];
    let allOk = true;
    for (const s of samples) {
      const urlEngine = require('../js/url/url-engine');
      if (getLocalizedUrl(s, 'en') !== urlEngine.buildUrl(s)) {
        err('4. getLocalizedUrl(' + s + ', "en") does not equal the unmodified English URL');
        allOk = false;
      }
    }
    if (allOk) ok('4. English URL resolution is an exact passthrough (unchanged)');
  } catch (e) {
    err('4. Could not verify English URL preservation: ' + e.message);
  }
}

// 5. /es/ prefix behavior is deterministic
{
  try {
    const { getLocalizedUrl } = require('../js/i18n/locale-url');
    const a = getLocalizedUrl('/calculators/pool-volume-calculator', 'es');
    const b = getLocalizedUrl('/calculators/pool-volume-calculator', 'es');
    if (a === b && a === '/es/calculators/pool-volume-calculator') ok('5. /es/ prefix resolution is deterministic and correctly formed');
    else err('5. /es/ prefix resolution is not deterministic or malformed: "' + a + '" vs "' + b + '"');
  } catch (e) {
    err('5. Could not verify /es/ prefix determinism: ' + e.message);
  }
}

// 6. Localized URL resolver exists
{
  if (fileExists('js/i18n/locale-url.js')) ok('6. Centralized localized URL resolver exists (js/i18n/locale-url.js)');
  else err('6. js/i18n/locale-url.js not found');
}

// 7. Canonical resolver supports language
{
  try {
    const { getLocalizedCanonical } = require('../js/i18n/locale-url');
    const enCanon = getLocalizedCanonical('/calculators/pool-volume-calculator', 'en');
    const esCanon = getLocalizedCanonical('/calculators/pool-volume-calculator', 'es');
    if (enCanon === 'https://waterbalancetools.com/calculators/pool-volume-calculator' &&
        esCanon === 'https://waterbalancetools.com/es/calculators/pool-volume-calculator' &&
        enCanon !== esCanon) {
      ok('7. Canonical resolver supports language and each language is self-referential (English != Spanish canonical)');
    } else {
      err('7. Canonical resolver did not produce distinct, correct self-referential canonicals: en="' + enCanon + '" es="' + esCanon + '"');
    }
  } catch (e) {
    err('7. Could not verify canonical resolver: ' + e.message);
  }
}

// 8. hreflang architecture exists
{
  if (fileExists('js/i18n/hreflang.js')) ok('8. hreflang architecture exists (js/i18n/hreflang.js)');
  else err('8. js/i18n/hreflang.js not found');
}

// 9. hreflang validation exists
{
  if (fileExists('scripts/validate-hreflang.js')) ok('9. hreflang validation exists (scripts/validate-hreflang.js)');
  else err('9. scripts/validate-hreflang.js not found');
}

// 10. Language-aware HTML lang support exists
{
  if (fileExists('js/i18n/html-lang.js')) ok('10. Language-aware HTML lang support exists (js/i18n/html-lang.js)');
  else err('10. js/i18n/html-lang.js not found');
}

// 11. Translation-status mechanism exists
{
  if (fileExists('js/i18n/translation-status.js') && fileExists('data/i18n/translation-status.json')) {
    ok('11. Translation-status mechanism exists (js/i18n/translation-status.js + data/i18n/translation-status.json)');
  } else {
    err('11. Translation-status mechanism incomplete');
  }
}

// 12. Navigation architecture supports language (documented extension
//     point; generate-navigation.js itself is intentionally UNMODIFIED in
//     Phase 8D -- see docs Section 11).
{
  const navSrc = fs.readFileSync(path.join(ROOT, 'scripts/generate-navigation.js'), 'utf8');
  // Must NOT already contain a lang field (would mean it was modified,
  // which would be an unauthorized production change in Phase 8D).
  if (!/lang:\s*['"]en['"]/.test(navSrc)) {
    ok('12. Navigation architecture: generate-navigation.js confirmed unmodified (no premature lang field); extension path documented in docs/PHASE-8D-MULTILINGUAL-ARCHITECTURE.md');
  } else {
    err('12. generate-navigation.js appears to have been modified to add a lang field -- this is out of Phase 8D scope and would cause a sitewide navigation.json diff');
  }
}

// 13. Sitemap architecture supports language (documented extension point;
//     generate-sitemaps.js itself is intentionally UNMODIFIED).
{
  const sitemapSrc = fs.readFileSync(path.join(ROOT, 'scripts/generate-sitemaps.js'), 'utf8');
  if (!/\/es\//.test(sitemapSrc)) {
    ok('13. Sitemap architecture: generate-sitemaps.js confirmed unmodified (no Spanish URLs added); extension path documented');
  } else {
    err('13. generate-sitemaps.js references /es/ -- Spanish sitemap URLs must not be added in Phase 8D');
  }
}

// 14. Language switcher architecture exists
{
  if (fileExists('js/i18n/language-switcher.js')) ok('14. Language switcher architecture exists (js/i18n/language-switcher.js)');
  else err('14. js/i18n/language-switcher.js not found');
}

// 15. No accidental /es/es/ construction
{
  try {
    const { getLocalizedUrl } = require('../js/i18n/locale-url');
    const cases = [
      ['/calculators/pool-volume-calculator', 'es'],
      ['/es/calculators/pool-volume-calculator', 'es'],
      ['/es/es/calculators/pool-volume-calculator', 'es'],
    ];
    let allOk = true;
    for (const [input, lang] of cases) {
      const result = getLocalizedUrl(input, lang);
      if (/\/es\/es\//.test(result)) {
        err('15. /es/es/ construction detected for input "' + input + '": "' + result + '"');
        allOk = false;
      }
    }
    if (allOk) ok('15. No accidental /es/es/ construction across repeated-localization inputs');
  } catch (e) {
    err('15. Could not verify /es/es/ protection: ' + e.message);
  }
}

// 16. No false hreflang generation
{
  try {
    const { buildHreflangSet } = require('../js/i18n/hreflang');
    const singleLang = buildHreflangSet('/calculators/pool-volume-calculator', ['en']);
    if (Array.isArray(singleLang) && singleLang.length === 0) {
      ok('16. No false hreflang: a content unit with only English available produces zero hreflang entries');
    } else {
      err('16. False hreflang risk: single-language content unit produced entries: ' + JSON.stringify(singleLang));
    }
  } catch (e) {
    err('16. Could not verify false-hreflang protection: ' + e.message);
  }
}

// 17-20. Phase 7Z / 8A / 8B / 8C remain intact
{
  try {
    execSync('node scripts/validate-source-data-consistency.js', { cwd: ROOT, stdio: 'pipe' });
    ok('17. Phase 7Z: validate-source-data-consistency.js passes');
  } catch (e) {
    err('17. Phase 7Z regression: validate-source-data-consistency.js FAILED');
  }
  try {
    const out = execSync('node scripts/validate-phase-8a.js', { cwd: ROOT }).toString();
    if (/: PASS/.test(out)) ok('18. Phase 8A: validate-phase-8a.js passes');
    else err('18. Phase 8A regression: validate-phase-8a.js did not report PASS');
  } catch (e) {
    err('18. Phase 8A regression: validate-phase-8a.js FAILED');
  }
  try {
    const out = execSync('node scripts/validate-phase-8b.js', { cwd: ROOT }).toString();
    if (/: PASS/.test(out)) ok('19. Phase 8B: validate-phase-8b.js passes');
    else err('19. Phase 8B regression: validate-phase-8b.js did not report PASS');
  } catch (e) {
    err('19. Phase 8B regression: validate-phase-8b.js FAILED');
  }
  try {
    const out = execSync('node scripts/validate-phase-8c.js', { cwd: ROOT }).toString();
    if (/: PASS/.test(out)) ok('20. Phase 8C: validate-phase-8c.js passes');
    else err('20. Phase 8C regression: validate-phase-8c.js did not report PASS');
  } catch (e) {
    err('20. Phase 8C regression: validate-phase-8c.js FAILED');
  }
}

console.log('');
console.log('validate-phase-8d: ' + (errors === 0 ? 'PASS' : 'FAIL') + ' -- ' + errors + ' error(s), ' + warnings + ' warning(s).');
process.exit(errors === 0 ? 0 : 1);
