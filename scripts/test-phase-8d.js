#!/usr/bin/env node
/**
 * test-phase-8d.js
 *
 * Phase 8D test suite: multilingual architecture correctness. Uses
 * fixtures (the 8 representative content units in
 * data/i18n/translation-status.json) rather than requiring thousands of
 * generated pages.
 *
 * Run: node scripts/test-phase-8d.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let pass = 0;
let fail = 0;
function assert(cond, label) {
  if (cond) { console.log('PASS: ' + label); pass++; }
  else { console.log('FAIL: ' + label); fail++; }
}

const { getLanguage, getDefaultLanguage, getLanguageCodes } = require('../js/i18n/languages');
const { getLocalizedUrl, getLocalizedCanonical, stripLanguagePrefix } = require('../js/i18n/locale-url');
const { buildHreflangSet, validateHreflangSet, reciprocityCheck } = require('../js/i18n/hreflang');
const translationStatus = require('../js/i18n/translation-status');
const { resolveLanguageSwitcherLinks, availableSwitcherLinks } = require('../js/i18n/language-switcher');
const { htmlLangAttr } = require('../js/i18n/html-lang');
const urlEngine = require('../js/url/url-engine');

// 1. English language resolution
assert(getLocalizedUrl('/calculators/pool-volume', 'en') === '/calculators/pool-volume', '1. English language resolution returns the unprefixed path');

// 2. Spanish language resolution
assert(getLocalizedUrl('/calculators/pool-volume', 'es') === '/es/calculators/pool-volume', '2. Spanish language resolution returns the /es/-prefixed path');

// 3. Nested path localization
assert(getLocalizedUrl('/guides/ph/can-you-swim-in-high-ph-water', 'es') === '/es/guides/ph/can-you-swim-in-high-ph-water', '3. Nested path localization preserves the full path depth');

// 4. Already-localized path protection
assert(getLocalizedUrl('/es/calculators/pool-volume', 'es') === '/es/calculators/pool-volume', '4. Re-localizing an already-localized path is idempotent');

// 5. /es/es/ prevention
{
  const result = getLocalizedUrl('/es/es/calculators/pool-volume', 'es');
  assert(!/\/es\/es\//.test(result) && result === '/es/calculators/pool-volume', '5. /es/es/ is prevented and collapsed to a single prefix');
}

// 6. Canonical generation
{
  const en = getLocalizedCanonical('/calculators/pool-volume-calculator', 'en');
  const es = getLocalizedCanonical('/calculators/pool-volume-calculator', 'es');
  assert(
    en === 'https://waterbalancetools.com/calculators/pool-volume-calculator' &&
    es === 'https://waterbalancetools.com/es/calculators/pool-volume-calculator',
    '6. Canonical generation produces correct, distinct, self-referential absolute URLs per language'
  );
}

// 7. hreflang generation
{
  const set = buildHreflangSet('/calculators/pool-volume-calculator', ['en', 'es']);
  const hasEn = set.some((e) => e.hreflang === 'en' && e.href === 'https://waterbalancetools.com/calculators/pool-volume-calculator');
  const hasEs = set.some((e) => e.hreflang === 'es' && e.href === 'https://waterbalancetools.com/es/calculators/pool-volume-calculator');
  const hasXDefault = set.some((e) => e.hreflang === 'x-default' && e.href === 'https://waterbalancetools.com/calculators/pool-volume-calculator');
  assert(hasEn && hasEs && hasXDefault, '7. hreflang generation produces en, es, and x-default (pointing to English) entries');
}

// 8. Reciprocal hreflang validation
{
  const path1 = '/calculators/pool-volume-calculator';
  const enSet = buildHreflangSet(path1, ['en', 'es']);
  const esSet = buildHreflangSet(path1, ['en', 'es']);
  const map = new Map([
    ['https://waterbalancetools.com/calculators/pool-volume-calculator', enSet],
    ['https://waterbalancetools.com/es/calculators/pool-volume-calculator', esSet],
  ]);
  const result = reciprocityCheck(map);
  assert(result.valid, '8. Reciprocal hreflang validation passes for a correctly-linked en/es pair');
}

// 9. Missing-translation behavior (translation-status gate)
{
  const available = translationStatus.getAvailableLanguages('calculator:pool-volume');
  const set = buildHreflangSet('/calculators/pool-volume-calculator', available);
  assert(
    available.length === 1 && available[0] === 'en' && set.length === 0,
    '9. Missing translation: calculator:pool-volume (es="missing") produces zero hreflang entries, not a fabricated /es/ alternate'
  );
}

// 10. Language switcher resolution
{
  const links = resolveLanguageSwitcherLinks('calculator:pool-volume', '/calculators/pool-volume-calculator', 'en');
  const en = links.find((l) => l.code === 'en');
  const es = links.find((l) => l.code === 'es');
  assert(
    en && en.isCurrent && en.available &&
    es && !es.available && es.url === '/es/calculators/pool-volume-calculator',
    '10. Language switcher correctly marks English current/available and Spanish unavailable (not fabricated)'
  );
  const availableOnly = availableSwitcherLinks('calculator:pool-volume', '/calculators/pool-volume-calculator', 'en');
  assert(availableOnly.length === 1 && availableOnly[0].code === 'en', '10b. availableSwitcherLinks excludes the untranslated Spanish entry entirely');
}

// 11. English URL preservation (no production generator touched)
{
  const navSrc = fs.readFileSync(path.join(ROOT, 'scripts/generate-navigation.js'), 'utf8');
  const sitemapSrc = fs.readFileSync(path.join(ROOT, 'scripts/generate-sitemaps.js'), 'utf8');
  const hubsSrc = fs.readFileSync(path.join(ROOT, 'scripts/generate-hubs.js'), 'utf8');
  assert(
    !/js\/i18n|locale-url|getLocalizedUrl/.test(navSrc) &&
    !/js\/i18n|locale-url|getLocalizedUrl/.test(sitemapSrc) &&
    !/js\/i18n|locale-url|getLocalizedUrl/.test(hubsSrc),
    '11. English URL preservation: generate-navigation.js, generate-sitemaps.js, generate-hubs.js are unmodified (no i18n wiring added yet)'
  );
}

// 12. Sitemap localization logic (documented, not implemented -- verify
//     the resolver produces sitemap-correct absolute URLs for a future
//     Spanish sitemap without needing generate-sitemaps.js changed now).
{
  const url = getLocalizedUrl('/calculators/pool-volume-calculator', 'es');
  const absolute = urlEngine.sitemapUrl(url);
  assert(absolute === 'https://waterbalancetools.com/es/calculators/pool-volume-calculator', '12. Sitemap-ready absolute URL can be derived for a Spanish path via the existing urlEngine.sitemapUrl(), proving the future sitemap extension needs no new normalization logic');
}

// 13. HTML lang resolution
{
  assert(htmlLangAttr('en') === 'lang="en"' && htmlLangAttr('es') === 'lang="es"', '13. HTML lang resolution produces correct attribute strings for en and es');
}

// 14. Translation-status tracking
{
  const missing = translationStatus.listMissing('es');
  const ready = translationStatus.listReadyForTranslation('es');
  assert(
    missing.length === 8 && ready.length === 8 && missing.includes('entity:algae'),
    '14. Translation-status tracking correctly reports all 8 seeded fixtures as missing/ready for Spanish'
  );
}

// 15. Programmatic page identity separation (content ID != URL slug)
{
  const record = translationStatus.getRecord('programmatic:chlorine-10000-gallon');
  assert(
    !!record &&
    record.languages.en.url === '/programmatic/chlorine/how-much-chlorine-for-10000-gallon-pool' &&
    record.contentId !== record.languages.en.url,
    '15. Programmatic content identity (contentId) is a stable key distinct from the language-specific URL slug'
  );
}

// 16. Phase 7Z regression
{
  try {
    execSync('node scripts/validate-source-data-consistency.js', { cwd: ROOT, stdio: 'pipe' });
    assert(true, '16. Phase 7Z: validate-source-data-consistency.js passes');
  } catch (e) {
    assert(false, '16. Phase 7Z regression: validate-source-data-consistency.js FAILED');
  }
}

// 17. Phase 8A regression
{
  try {
    const out = execSync('node scripts/validate-phase-8a.js', { cwd: ROOT }).toString();
    assert(/: PASS/.test(out), '17. Phase 8A: validate-phase-8a.js passes');
  } catch (e) {
    assert(false, '17. Phase 8A regression: validate-phase-8a.js FAILED');
  }
}

// 18. Phase 8B regression
{
  try {
    const out = execSync('node scripts/validate-phase-8b.js', { cwd: ROOT }).toString();
    assert(/: PASS/.test(out), '18. Phase 8B: validate-phase-8b.js passes');
  } catch (e) {
    assert(false, '18. Phase 8B regression: validate-phase-8b.js FAILED');
  }
}

// 19. Phase 8C regression
{
  try {
    const out = execSync('node scripts/validate-phase-8c.js', { cwd: ROOT }).toString();
    assert(/: PASS/.test(out), '19. Phase 8C: validate-phase-8c.js passes');
  } catch (e) {
    assert(false, '19. Phase 8C regression: validate-phase-8c.js FAILED');
  }
}

// 20. Deterministic output
{
  const a = getLocalizedUrl('/calculators/pool-volume-calculator', 'es');
  const b = getLocalizedUrl('/calculators/pool-volume-calculator', 'es');
  const setA = JSON.stringify(buildHreflangSet('/calculators/pool-volume-calculator', ['en', 'es']));
  const setB = JSON.stringify(buildHreflangSet('/calculators/pool-volume-calculator', ['en', 'es']));
  assert(a === b && setA === setB, '20. Deterministic output: repeated resolution/hreflang generation is byte-identical');
}

console.log('');
console.log('test-phase-8d: ' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail === 0 ? 0 : 1);
