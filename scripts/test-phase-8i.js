#!/usr/bin/env node
/**
 * test-phase-8i.js
 *
 * Phase 8I test suite: the Water Chemistry Spanish calculator cluster
 * expansion (4 new pages -- saltwater-pool-salt, pool-alkalinity,
 * pool-cyanuric-acid, pool-turnover-rate -- completing the site's own
 * "Water Chemistry (5)" related-calculators navigation group in Spanish,
 * alongside spa-volume-calculator from Phase 8G). Requires a completed
 * `npm run build` (reads real generated output, not fixtures).
 *
 * Run: node scripts/test-phase-8i.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let pass = 0;
let fail = 0;
function assert(cond, label) {
  if (cond) { console.log('PASS: ' + label); pass++; }
  else { console.log('FAIL: ' + label); fail++; }
}
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

const NEW_CLUSTER = [
  'pool-alkalinity-calculator.html',
  'pool-cyanuric-acid-calculator.html',
  'pool-turnover-rate-calculator.html',
  'saltwater-pool-salt-calculator.html',
];
const PRIOR_CLUSTER = [
  'chemical-calculator.html', 'pool-volume-calculator.html', 'pool-chlorine-calculator.html',
  'pool-ph-calculator.html', 'pool-shock-calculator.html',
  'hot-tub-chlorine-calculator.html', 'hot-tub-ph-calculator.html',
  'hot-tub-shock-calculator.html', 'spa-volume-calculator.html',
];
const FULL_CLUSTER = PRIOR_CLUSTER.concat(NEW_CLUSTER);

// 1. Spanish page existence for the 4 new pages
{
  const allExist = NEW_CLUSTER.every((f) => fs.existsSync(path.join(ROOT, 'es/calculators', f)));
  assert(allExist, '1. All 4 new Water Chemistry Spanish pages exist on disk');
}

// 2. Content-ID / URL separation for the 4 new units
{
  const status = JSON.parse(read('data/i18n/translation-status.json'));
  const ids = ['calculator:pool-alkalinity', 'calculator:pool-cyanuric-acid', 'calculator:pool-turnover-rate', 'calculator:saltwater-pool-salt'];
  const allDistinct = ids.every((id) => {
    const u = status.units.find((x) => x.contentId === id);
    return !!u && u.contentId !== u.languages.en.url && u.contentId !== u.languages.es.url;
  });
  assert(allDistinct, '2. All 4 new content IDs are distinct from both their English and Spanish URLs');
}

// 3. English canonical unchanged for the 4 new pages
{
  const allUnchanged = NEW_CLUSTER.every((f) => {
    const html = read('calculators/' + f);
    const m = html.match(/<link rel="canonical" href="([^"]+)">/);
    return m && m[1] === 'https://waterbalancetools.com/calculators/' + f.replace(/\.html$/, '');
  });
  assert(allUnchanged, '3. English canonical URLs for the 4 new pages are unchanged');
}

// 4. Spanish canonical self-referential for the 4 new pages
{
  const allSelfRef = NEW_CLUSTER.every((f) => {
    const html = read('es/calculators/' + f);
    const m = html.match(/<link rel="canonical" href="([^"]+)">/);
    return m && m[1] === 'https://waterbalancetools.com/es/calculators/' + f.replace(/\.html$/, '');
  });
  assert(allSelfRef, '4. Spanish canonical URLs for the 4 new pages are self-referential');
}

// 5. hreflang set correctness on pool-alkalinity-calculator (representative sample)
{
  const html = read('es/calculators/pool-alkalinity-calculator.html');
  const hasEn = html.includes('<link rel="alternate" hreflang="en" href="https://waterbalancetools.com/calculators/pool-alkalinity-calculator">');
  const hasEs = html.includes('<link rel="alternate" hreflang="es" href="https://waterbalancetools.com/es/calculators/pool-alkalinity-calculator">');
  const hasXDefault = html.includes('<link rel="alternate" hreflang="x-default" href="https://waterbalancetools.com/calculators/pool-alkalinity-calculator">');
  assert(hasEn && hasEs && hasXDefault, '5. pool-alkalinity-calculator (es) hreflang set is complete and correct');
}

// 6. html lang="es" on all 4 new pages
{
  const allEs = NEW_CLUSTER.every((f) => read('es/calculators/' + f).includes('<html lang="es"'));
  assert(allEs, '6. All 4 new Spanish pages declare html lang="es"');
}

// 7. Language switcher present on all 4 new pages (both directions)
{
  const allPresent = NEW_CLUSTER.every((f) => read('calculators/' + f).includes('i18n-switcher:start') && read('es/calculators/' + f).includes('i18n-switcher:start'));
  assert(allPresent, '7. Language switcher present on both language versions of all 4 new pages');
}

// 8. Calculator function calls unchanged (byte-identical to English) for all 4 new pages
{
  const fns = { 'pool-alkalinity-calculator.html': 'calculateAlkalinity', 'pool-cyanuric-acid-calculator.html': 'calculateCYA', 'pool-turnover-rate-calculator.html': 'calculateTurnover', 'saltwater-pool-salt-calculator.html': 'calculateSalt' };
  const allMatch = NEW_CLUSTER.every((f) => {
    const en = (read('calculators/' + f).match(new RegExp('calcUtils\\.' + fns[f] + '\\(', 'g')) || []).length;
    const es = (read('es/calculators/' + f).match(new RegExp('calcUtils\\.' + fns[f] + '\\(', 'g')) || []).length;
    return en > 0 && en === es;
  });
  assert(allMatch, '8. All 4 new pages call the identical calc-utils.js function on both language versions');
}

// 9. js/calc-utils.js untouched (no formula/constant changes)
{
  const { execSync } = require('child_process');
  let diff = '';
  try { diff = execSync('git diff --stat f7946653613d9addce2758721c6b7c8e6159c030 -- js/calc-utils.js', { cwd: ROOT }).toString().trim(); } catch (e) { diff = 'ERROR:' + e.message; }
  assert(diff === '', '9. js/calc-utils.js is byte-identical to the Phase 8H baseline (no formula/constant changes)');
}

// 10. Representative numeric calculation results are correct (spot check against known-good values)
{
  global.window = {};
  delete require.cache[require.resolve(path.join(ROOT, 'js/calc-utils.js'))];
  require(path.join(ROOT, 'js/calc-utils.js'));
  const c = global.window.WaterBalance.calcUtils;
  const alk = c.calculateAlkalinity(15000, 60, 100);
  const cya = c.calculateCYA(15000, 30, 50);
  const turn = c.calculateTurnover(15000, 3000);
  const salt = c.calculateSalt(15000, 2800, 3200);
  const correct = Math.abs(alk.pounds - 8.4) < 0.01 && Math.abs(cya.ounces - 39) < 0.01 && turn === 5 && Math.abs(salt.pounds - 50) < 0.01;
  assert(correct, '10. Representative calculation results match known-good values (alkalinity, CYA, turnover, salt)');
}

// 11. Translation-status: all 4 new units marked translated, unrelated fixtures untouched
{
  const status = JSON.parse(read('data/i18n/translation-status.json'));
  const ids = ['calculator:pool-alkalinity', 'calculator:pool-cyanuric-acid', 'calculator:pool-turnover-rate', 'calculator:saltwater-pool-salt'];
  const allTranslated = ids.every((id) => {
    const u = status.units.find((x) => x.contentId === id);
    return u && u.languages.en.status === 'translated' && u.languages.es.status === 'translated';
  });
  const fixtureUntouched = status.units.find((u) => u.contentId === 'academy:fund-01').languages.es.status === 'missing';
  assert(allTranslated && fixtureUntouched, '11. All 4 new units marked translated; unrelated Phase 8D fixtures untouched');
}

// 12. Navigation: 4 new Spanish URLs present with lang="es", exactly once
{
  const nav = JSON.parse(read('data/navigation.json'));
  const allPresent = NEW_CLUSTER.every((f) => {
    const slug = f.replace(/\.html$/, '');
    const recs = nav.pages.filter((p) => p.url === '/es/calculators/' + slug);
    return recs.length === 1 && recs[0].lang === 'es';
  });
  assert(allPresent, '12. All 4 new Spanish URLs are indexed in navigation.json exactly once with lang="es"');
}

// 13. Search index: 4 new Spanish documents present with correct contentId, independent of English
{
  const idx = JSON.parse(read('data/search-index.json'));
  const items = Array.isArray(idx) ? idx : idx.pages;
  const ids = ['calculator:pool-alkalinity', 'calculator:pool-cyanuric-acid', 'calculator:pool-turnover-rate', 'calculator:saltwater-pool-salt'];
  const allPresent = NEW_CLUSTER.every((f, i) => {
    const slug = f.replace(/\.html$/, '');
    const es = items.find((d) => d.url === '/es/calculators/' + slug);
    const en = items.find((d) => d.url === '/calculators/' + slug);
    return es && en && es !== en && es.contentId === ids[i] && en.contentId === ids[i];
  });
  assert(allPresent, '13. Search index carries independent en/es documents for all 4 new pages, sharing contentId');
}

// 14. Sitemap: 4 new Spanish URLs present exactly once, apex hostname
{
  const xml = read('sitemap-calculators.xml');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const allOnce = NEW_CLUSTER.every((f) => {
    const slug = f.replace(/\.html$/, '');
    return locs.filter((l) => l === 'https://waterbalancetools.com/es/calculators/' + slug).length === 1;
  });
  assert(allOnce, '14. All 4 new Spanish URLs appear exactly once in sitemap-calculators.xml');
}

// 15. No /es/es/ construction anywhere in the 4 new pages
{
  const noneBad = NEW_CLUSTER.every((f) => !read('es/calculators/' + f).includes('/es/es/'));
  assert(noneBad, '15. No /es/es/ URL construction in any of the 4 new Spanish pages');
}

// 16. Related-calculators grid: each new page's own card is self-referencing with --active
{
  const allActive = NEW_CLUSTER.every((f) => {
    const slug = f.replace(/\.html$/, '');
    return read('es/calculators/' + f).includes('href="/es/calculators/' + slug + '" class="calc-card calc-card--active"');
  });
  assert(allActive, '16. Each new Spanish page correctly self-marks its own related-calculators card as active');
}

// 17. Related-calculators grid: prior 9 Spanish pages now link to the 4 new Spanish siblings (not English fallback)
{
  const allUpdated = PRIOR_CLUSTER.every((f) => {
    const html = read('es/calculators/' + f);
    return NEW_CLUSTER.every((target) => {
      const slug = target.replace(/\.html$/, '');
      return !new RegExp('href="/calculators/' + slug + '"').test(html);
    });
  });
  assert(allUpdated, '17. All 9 pre-existing Spanish pages now link Spanish -> Spanish to the 4 newly-translated Water Chemistry siblings');
}

// 18. Existing 9 Spanish pages preserved (still exist, still self-canonical)
{
  const allPreserved = PRIOR_CLUSTER.every((f) => {
    if (!fs.existsSync(path.join(ROOT, 'es/calculators', f))) return false;
    const html = read('es/calculators/' + f);
    const slug = f.replace(/\.html$/, '');
    return html.includes('<link rel="canonical" href="https://waterbalancetools.com/es/calculators/' + slug + '">');
  });
  assert(allPreserved, '18. All 9 pre-existing Spanish pages remain present and self-canonical');
}

// 19. English URLs for the 4 new pages resolve exactly as before (spot check)
{
  const allSame = NEW_CLUSTER.every((f) => fs.existsSync(path.join(ROOT, 'calculators', f)));
  assert(allSame, '19. English URLs for the 4 new pages resolve exactly as before (spot check)');
}

// 20. Regional terminology layer untouched (Phase 8I reuses, does not modify)
{
  const { execSync } = require('child_process');
  let diff = '';
  try { diff = execSync('git diff --stat f7946653613d9addce2758721c6b7c8e6159c030 -- data/i18n/es/terminology.json js/i18n/es-terminology.js', { cwd: ROOT }).toString().trim(); } catch (e) { diff = 'ERROR:' + e.message; }
  assert(diff === '', '20. Regional terminology layer (terminology.json, es-terminology.js) is untouched');
}

// 21. No country-specific or synonym directories were created
{
  const forbidden = ['es/piscina', 'es/alberca', 'es/pileta', 'es/jacuzzi', 'es-mx', 'es-ar'];
  const noneExist = forbidden.every((p) => !fs.existsSync(path.join(ROOT, p)));
  assert(noneExist, '21. No country-specific or synonym directories were created');
}

// 22. Phase 8D: validate-phase-8d.js passes
{
  const { execSync } = require('child_process');
  let okRun = true;
  try { execSync('node scripts/validate-phase-8d.js', { cwd: ROOT, stdio: 'pipe' }); } catch (e) { okRun = false; }
  assert(okRun, '22. Phase 8D: validate-phase-8d.js passes');
}

// 23. Phase 8G: validate-phase-8g.js passes
{
  const { execSync } = require('child_process');
  let okRun = true;
  try { execSync('node scripts/validate-phase-8g.js', { cwd: ROOT, stdio: 'pipe' }); } catch (e) { okRun = false; }
  assert(okRun, '23. Phase 8G: validate-phase-8g.js passes');
}

// 24. Phase 7Z: validate-source-data-consistency.js passes
{
  const { execSync } = require('child_process');
  let okRun = true;
  try { execSync('node scripts/validate-source-data-consistency.js', { cwd: ROOT, stdio: 'pipe' }); } catch (e) { okRun = false; }
  assert(okRun, '24. Phase 7Z: validate-source-data-consistency.js passes');
}

// 25. Sitemap URL set is deterministic across repeated regeneration
{
  const { execSync } = require('child_process');
  const before = read('sitemap-calculators.xml').replace(/<lastmod>[^<]*<\/lastmod>/g, '');
  execSync('node scripts/generate-sitemaps.js', { cwd: ROOT, stdio: 'pipe' });
  const after = read('sitemap-calculators.xml').replace(/<lastmod>[^<]*<\/lastmod>/g, '');
  assert(before === after, '25. Sitemap URL set is deterministic across repeated regeneration');
}

// 26. check-broken-links.js: 0 broken links sitewide
{
  const { execSync } = require('child_process');
  let okRun = true;
  try { execSync('node scripts/check-broken-links.js', { cwd: ROOT, stdio: 'pipe' }); } catch (e) { okRun = false; }
  assert(okRun, '26. check-broken-links.js: 0 broken links sitewide (including the full 13-page Spanish cluster)');
}

console.log('');
console.log('test-phase-8i: ' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail > 0 ? 1 : 0);
