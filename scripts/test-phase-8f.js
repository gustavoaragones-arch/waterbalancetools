#!/usr/bin/env node
/**
 * test-phase-8f.js
 *
 * Phase 8F test suite: Spanish regional terminology model + language-aware
 * navigation/search-index. Requires a completed `npm run build`.
 *
 * Run: node scripts/test-phase-8f.js
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
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

const esTerm = require('../js/i18n/es-terminology');
const translationStatus = require('../js/i18n/translation-status');

// 1. Pool concept regional resolution
assert(
  esTerm.getTermForRegion('pool', 'MX').term === 'alberca' &&
  esTerm.getTermForRegion('pool', 'AR').term === 'pileta' &&
  esTerm.getTermForRegion('pool', 'ES').term === 'piscina' &&
  esTerm.getCanonicalTerm('pool') === 'piscina',
  '1. Pool concept resolves correctly per region (MX=alberca, AR=pileta, ES=piscina, canonical=piscina)'
);

// 2. Hot-tub concept resolution excludes trademark by default
{
  const term = esTerm.getTermForRegion('hot_tub', 'MX');
  assert(term.term === 'spa' && !term.isTrademark, '2. Hot-tub concept resolves to "spa" (non-trademark) by default, not "jacuzzi"');
}

// 3. Trademark flag correctness
assert(esTerm.isTrademarkTerm('hot_tub', 'jacuzzi') === true && esTerm.isTrademarkTerm('hot_tub', 'spa') === false,
  '3. "jacuzzi" is flagged as a trademark; "spa" is not');

// 4. hydromassage_bathtub kept distinct from hot_tub
{
  const hotTub = esTerm.getConcept('hot_tub');
  const bathtub = esTerm.getConcept('hydromassage_bathtub');
  assert(hotTub.canonicalTerm !== bathtub.canonicalTerm && hotTub.relatedButDistinctConcept === 'hydromassage_bathtub',
    '4. "hot_tub" (spa) and "hydromassage_bathtub" (bañera/tina de hidromasaje) are modeled as distinct concepts, not merged');
}

// 5. Every region has terminology coverage for the pool concept
{
  const regions = esTerm.getRegions().map((r) => r.code);
  const covered = regions.every((r) => esTerm.getTermForRegion('pool', r) !== null);
  assert(covered, '5. Every configured region resolves to a pool term (no gaps)');
}

// 6. Chemistry terms are region-neutral (no forced distinction)
{
  const chlorine = esTerm.getConcept('free_chlorine');
  const onlyNeutral = chlorine.variants.every((v) => Object.keys(v.regionStatus).length === 1 && v.regionStatus.neutral);
  assert(onlyNeutral, '6. "free_chlorine" has no forced regional distinction (evidence showed none)');
}

// 7. Search variants include the trademark term for SEO coverage
{
  const search = esTerm.getSearchVariants('hot_tub').map((v) => v.term);
  assert(search.includes('jacuzzi') && search.includes('spa'), '7. Search-variant coverage for hot_tub includes both "spa" and "jacuzzi" (for FAQ/query matching, not primary copy)');
}

// 8. No keyword stuffing on production pages
{
  const CLUSTER = ['chemical-calculator.html', 'pool-volume-calculator.html', 'pool-chlorine-calculator.html', 'pool-ph-calculator.html', 'pool-shock-calculator.html'];
  const poolTerms = esTerm.getVariants('pool').map((v) => v.term);
  let noStuffing = true;
  for (const f of CLUSTER) {
    const html = read('es/calculators/' + f);
    const used = poolTerms.filter((t) => new RegExp('(^|[\\s>])' + t + '([\\s<.,]|$)').test(html));
    if (used.length > 1) noStuffing = false;
  }
  assert(noStuffing, '8. No production Spanish page mixes multiple pool-concept terms in visible copy');
}

// 9. Navigation eligibility gate excludes a hypothetical untranslated unit
{
  translationStatus.reload();
  const missingIds = translationStatus.listMissing('es');
  assert(missingIds.length > 0, '9. translation-status.json still has genuinely "missing" es units (the 7 non-cluster Phase 8D fixtures), proving the gate has something real to exclude');
}

// 10. Navigation records carry `lang`
{
  const nav = JSON.parse(read('data/navigation.json'));
  const allTagged = nav.pages.every((p) => p.lang === 'en' || p.lang === 'es');
  assert(allTagged, '10. Every data/navigation.json record carries a valid `lang` field');
}

// 11. Search index shares contentId across languages without merging documents
{
  const idx = JSON.parse(read('data/search-index.json'));
  const en = idx.find((p) => p.url === '/calculators/chemical-calculator');
  const es = idx.find((p) => p.url === '/es/calculators/chemical-calculator');
  assert(en && es && en.contentId === es.contentId && en.lang !== es.lang && en.url !== es.url,
    '11. English and Spanish search documents share contentId "calculator:chemical" but remain separate documents (different lang, different url)');
}

// 12. English hub pages contain no Spanish links
{
  const hub = read('calculators/index.html');
  assert(!hub.includes('/es/calculators/'), '12. calculators/index.html (English hub) contains no /es/ links');
}

// 13. hreflang still plain "es" (no premature country codes)
{
  const html = read('es/calculators/chemical-calculator.html');
  assert(!/hreflang="es-[A-Z]{2}"/.test(html) && html.includes('hreflang="es"'), '13. hreflang remains plain "es", no unauthorized es-XX country codes');
}

// 14. Spanish URLs unchanged from Phase 8E
{
  const EXPECTED = [
    '/es/calculators/chemical-calculator', '/es/calculators/pool-volume-calculator',
    '/es/calculators/pool-chlorine-calculator', '/es/calculators/pool-ph-calculator', '/es/calculators/pool-shock-calculator',
  ];
  const nav = JSON.parse(read('data/navigation.json'));
  const urls = nav.pages.filter((p) => p.lang === 'es').map((p) => p.url).sort();
  assert(JSON.stringify(urls) === JSON.stringify(EXPECTED.sort()), '14. Spanish URL slugs are unchanged from Phase 8E (no migration performed)');
}

// 15. English URL count unaffected in shape
{
  const nav = JSON.parse(read('data/navigation.json'));
  const enCount = nav.pages.filter((p) => p.lang === 'en').length;
  assert(enCount === nav.pages.length - 5, '15. English page count equals total minus exactly the 5 Spanish pages');
}

// 16. Deterministic terminology data (no build-time mutation)
{
  const before = read('data/i18n/es/terminology.json');
  execSync('npm run build', { cwd: ROOT, stdio: 'pipe' });
  const after = read('data/i18n/es/terminology.json');
  assert(before === after, '16. terminology.json is untouched by the build pipeline (static source data, not generated output)');
}

// 17. Broken links sitewide
{
  try {
    execSync('node scripts/check-broken-links.js', { cwd: ROOT, stdio: 'pipe' });
    assert(true, '17. check-broken-links.js: 0 broken links sitewide');
  } catch (e) {
    assert(false, '17. check-broken-links.js FAILED');
  }
}

// 18. Phase 8E regression
{
  try {
    const out = execSync('node scripts/validate-phase-8e.js', { cwd: ROOT }).toString();
    assert(/: PASS/.test(out), '18. Phase 8E: validate-phase-8e.js passes');
  } catch (e) {
    assert(false, '18. Phase 8E regression: validate-phase-8e.js FAILED');
  }
}

// 19. Phase 8B regression (hub convergence)
{
  try {
    const out = execSync('node scripts/validate-phase-8b.js', { cwd: ROOT }).toString();
    assert(/: PASS/.test(out), '19. Phase 8B: validate-phase-8b.js passes');
  } catch (e) {
    assert(false, '19. Phase 8B regression: validate-phase-8b.js FAILED');
  }
}

// 20. Phase 7Z regression
{
  try {
    execSync('node scripts/validate-source-data-consistency.js', { cwd: ROOT, stdio: 'pipe' });
    assert(true, '20. Phase 7Z: validate-source-data-consistency.js passes');
  } catch (e) {
    assert(false, '20. Phase 7Z regression: validate-source-data-consistency.js FAILED');
  }
}

console.log('');
console.log('test-phase-8f: ' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail === 0 ? 0 : 1);
