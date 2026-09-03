#!/usr/bin/env node
/**
 * test-phase-8g.js
 *
 * Phase 8G test suite: the Spanish hot-tub/spa calculator cluster (4 new
 * pages added to the Phase 8E/8F Spanish rollout). Requires a completed
 * `npm run build` (reads real generated output, not fixtures).
 *
 * Run: node scripts/test-phase-8g.js
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

const NEW_CLUSTER = [
  'hot-tub-chlorine-calculator.html',
  'hot-tub-ph-calculator.html',
  'hot-tub-shock-calculator.html',
  'spa-volume-calculator.html',
];
const FULL_CLUSTER = [
  'chemical-calculator.html', 'pool-volume-calculator.html', 'pool-chlorine-calculator.html',
  'pool-ph-calculator.html', 'pool-shock-calculator.html',
].concat(NEW_CLUSTER);

// 1. Spanish page existence for the 4 new pages
{
  const allExist = NEW_CLUSTER.every((f) => fs.existsSync(path.join(ROOT, 'es/calculators', f)));
  assert(allExist, '1. All 4 new Spanish hot-tub/spa pages exist on disk');
}

// 2. Content-ID / URL separation for the 4 new units
{
  const translationStatus = require('../js/i18n/translation-status');
  translationStatus.reload();
  const ids = ['calculator:hot-tub-chlorine', 'calculator:hot-tub-ph', 'calculator:hot-tub-shock', 'calculator:spa-volume'];
  const allDistinct = ids.every((id) => {
    const r = translationStatus.getRecord(id);
    return !!r && r.contentId !== r.languages.en.url && r.contentId !== r.languages.es.url;
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

// 5. hreflang set correctness on hot-tub-shock-calculator (the page using the shared product-label mechanism)
{
  const html = read('es/calculators/hot-tub-shock-calculator.html');
  const hasEn = html.includes('<link rel="alternate" hreflang="en" href="https://waterbalancetools.com/calculators/hot-tub-shock-calculator">');
  const hasEs = html.includes('<link rel="alternate" hreflang="es" href="https://waterbalancetools.com/es/calculators/hot-tub-shock-calculator">');
  const hasXDefault = html.includes('<link rel="alternate" hreflang="x-default" href="https://waterbalancetools.com/calculators/hot-tub-shock-calculator">');
  assert(hasEn && hasEs && hasXDefault, '5. hot-tub-shock-calculator has correct en/es/x-default hreflang set');
}

// 6. html lang correctness for the 4 new pages
{
  const allCorrect = NEW_CLUSTER.every((f) => /<html lang="en">/.test(read('calculators/' + f)) && /<html lang="es"/.test(read('es/calculators/' + f)));
  assert(allCorrect, '6. English pages keep lang="en"; Spanish pages have lang="es" for all 4 new pages');
}

// 7. Language switcher present and correct on both sides for spa-volume-calculator
{
  const en = read('calculators/spa-volume-calculator.html');
  const es = read('es/calculators/spa-volume-calculator.html');
  const enSwitch = en.includes('href="/es/calculators/spa-volume-calculator" class="lang-switch"');
  const esSwitch = es.includes('href="/calculators/spa-volume-calculator" class="lang-switch"');
  assert(enSwitch && esSwitch, '7. Language switcher present on both English and Spanish spa-volume-calculator, resolving to the actual counterpart');
}

// 8. No fabricated switcher for an untranslated page
{
  const { availableSwitcherLinks } = require('../js/i18n/language-switcher');
  const links = availableSwitcherLinks('calculator:hot-tub-shock', '/calculators/hot-tub-shock-calculator', 'en');
  assert(links.every((l) => l.available || l.isCurrent), '8. Switcher never marks an unavailable language as available for a Phase 8G unit');
}

// 9. Sitemap inclusion for the 4 new pages
{
  const xml = read('sitemap-calculators.xml');
  const allIncluded = NEW_CLUSTER.every((f) => xml.includes('https://waterbalancetools.com/es/calculators/' + f.replace(/\.html$/, '')));
  assert(allIncluded, '9. All 4 new Spanish URLs present in sitemap-calculators.xml');
}

// 10. Sitemap category matches English (priority/changefreq parity)
{
  const xml = read('sitemap-calculators.xml');
  const urlBlock = (u) => {
    const idx = xml.indexOf('<loc>' + u + '</loc>');
    return xml.slice(idx, idx + 200);
  };
  const enBlock = urlBlock('https://waterbalancetools.com/calculators/hot-tub-ph-calculator');
  const esBlock = urlBlock('https://waterbalancetools.com/es/calculators/hot-tub-ph-calculator');
  const enPrio = (enBlock.match(/<priority>([^<]+)<\/priority>/) || [])[1];
  const esPrio = (esBlock.match(/<priority>([^<]+)<\/priority>/) || [])[1];
  assert(enPrio && enPrio === esPrio, '10. Spanish hot-tub-ph-calculator URL has the same sitemap priority as its English equivalent');
}

// 11. Robots/indexation: no accidental noindex
{
  const urlPolicy = require('./url-policy');
  const allIndexable = NEW_CLUSTER.every((f) => {
    const rel = 'es/calculators/' + f;
    return urlPolicy.isIndexablePage(rel, read(rel));
  });
  assert(allIndexable, '11. All 4 new Spanish pages are indexable, no accidental noindex');
}

// 12. Calculation logic (calcUtils call site) byte-identical between English and Spanish
{
  let allIdentical = true;
  for (const f of NEW_CLUSTER) {
    const en = read('calculators/' + f);
    const es = read('es/calculators/' + f);
    const enCalls = [...en.matchAll(/window\.WaterBalance\.calcUtils\.(calculate\w*)\(([\s\S]*?)\);/g)].map((m) => m[1] + '|' + m[2]);
    const esCalls = [...es.matchAll(/window\.WaterBalance\.calcUtils\.(calculate\w*)\(([\s\S]*?)\);/g)].map((m) => m[1] + '|' + m[2]);
    if (JSON.stringify(enCalls) !== JSON.stringify(esCalls)) allIdentical = false;
  }
  assert(allIdentical, '12. calcUtils calculation calls (function name + arguments) are byte-identical between English and Spanish for all 4 new pages');
}

// 13. Valid JSON-LD on the 4 new Spanish pages
{
  let allValid = true;
  for (const f of NEW_CLUSTER) {
    const html = read('es/calculators/' + f);
    const scripts = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    for (const s of scripts) {
      try { JSON.parse(s); } catch (e) { allValid = false; }
    }
  }
  assert(allValid, '13. All JSON-LD blocks on the 4 new Spanish pages are valid JSON');
}

// 14. Valid inline JS syntax on the 4 new Spanish pages
{
  let allValid = true;
  for (const f of NEW_CLUSTER) {
    const html = read('es/calculators/' + f);
    const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
    for (const m of scripts) {
      const attrs = m[1];
      const body = m[2];
      if (/src=/.test(attrs) || /application\/ld\+json/.test(attrs) || !body.trim()) continue;
      try { new Function(body); } catch (e) { allValid = false; }
    }
  }
  assert(allValid, '14. All inline calculator <script> blocks on the 4 new Spanish pages are syntactically valid');
}

// 15. No /es/es/ anywhere in the new pages
{
  const anyDoubled = NEW_CLUSTER.some((f) => /\/es\/es\//.test(read('es/calculators/' + f)));
  assert(!anyDoubled, '15. No /es/es/ duplication anywhere in the 4 new Spanish pages');
}

// 16. es-product-labels.js: correct lookups and safe English fallback
// (a browser IIFE, like js/calc-utils.js -- stub `window` the same way
// established test-phase-7s/7v/7w.js already do for that shared file)
{
  global.window = global.window || {};
  delete require.cache[require.resolve('../js/i18n/es-product-labels')];
  require('../js/i18n/es-product-labels');
  const esLabels = global.window.WaterBalance.esProductLabels;
  const known = esLabels.label('Calcium Hypochlorite (65%)') === 'Hipoclorito de Calcio (65%)';
  const knownWarning = esLabels.warning('Do not mix with trichlor or other chlorinating agents.') === 'No mezclar con tricloro u otros agentes clorantes.';
  const fallback = esLabels.label('Some Unmapped Product (99%)') === 'Some Unmapped Product (99%)';
  assert(known && knownWarning && fallback, '16. es-product-labels.js resolves known labels/warnings and safely falls back to English for unmapped ones');
}

// 17. js/calc-utils.js is untouched (shared engine never modified)
{
  try {
    const diff = execSync('git diff HEAD -- js/calc-utils.js', { cwd: ROOT }).toString();
    assert(diff.trim() === '', '17. js/calc-utils.js is byte-identical to the committed baseline (shared engine untouched)');
  } catch (e) {
    assert(false, '17. Could not diff js/calc-utils.js: ' + e.message);
  }
}

// 18. "spa" used as canonical term, jacuzzi/yacusi never in title/h1, on all 4 new pages
{
  let allOk = true;
  for (const f of NEW_CLUSTER) {
    const html = read('es/calculators/' + f);
    const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '';
    if (!/\bspa\b/i.test(title + h1)) allOk = false;
    if (/\bjacuzzi\b|\byacusi\b/i.test(title + h1)) allOk = false;
  }
  assert(allOk, '18. "spa" is the canonical term and jacuzzi/yacusi never appear in title/h1 across the 4 new pages');
}

// 19. Related-calculators grid on a new page links to the Spanish sibling, not English
{
  const html = read('es/calculators/hot-tub-chlorine-calculator.html');
  const linksEnglishSibling = /href="\/calculators\/pool-chlorine-calculator"[^>]*class="calc-card/.test(html);
  const linksSpanishSibling = /href="\/es\/calculators\/pool-chlorine-calculator"[^>]*class="calc-card/.test(html);
  assert(!linksEnglishSibling && linksSpanishSibling, '19. es/calculators/hot-tub-chlorine-calculator.html links to the Spanish pool-chlorine-calculator sibling, not the English one');
}

// 20. English URL manifest preservation (spot check via url-policy) for the 4 new pages
{
  const urlPolicy = require('./url-policy');
  const urlEngine = require('../js/url/url-engine');
  const samples = NEW_CLUSTER.map((f) => 'calculators/' + f);
  const allPreserved = samples.every((f) => urlPolicy.isProductionPage(f) && urlEngine.buildUrl(f) === '/calculators/' + f.replace(/^calculators\//, '').replace(/\.html$/, ''));
  assert(allPreserved, '20. English URLs for the 4 new pages resolve exactly as before (spot check)');
}

// 21. Navigation/search-index carry all 9 translated units, no more, no fewer
{
  const nav = JSON.parse(read('data/navigation.json'));
  const idx = JSON.parse(read('data/search-index.json'));
  const items = Array.isArray(idx) ? idx : idx.pages;
  const navEs = nav.pages.filter((p) => p.url.startsWith('/es/calculators/')).length;
  const idxEs = items.filter((p) => p.url.startsWith('/es/calculators/')).length;
  assert(navEs === 9 && idxEs === 9, '21. navigation.json and search-index.json each carry exactly 9 Spanish calculator entries');
}

// 22. Phase 8D regression
{
  try {
    const out = execSync('node scripts/validate-phase-8d.js', { cwd: ROOT }).toString();
    assert(/: PASS/.test(out), '22. Phase 8D: validate-phase-8d.js passes');
  } catch (e) {
    assert(false, '22. Phase 8D regression: validate-phase-8d.js FAILED');
  }
}

// 23. Phase 8E regression
{
  try {
    const out = execSync('node scripts/validate-phase-8e.js', { cwd: ROOT }).toString();
    assert(/: PASS/.test(out), '23. Phase 8E: validate-phase-8e.js passes');
  } catch (e) {
    assert(false, '23. Phase 8E regression: validate-phase-8e.js FAILED');
  }
}

// 24. Phase 7Z regression (source-data consistency)
{
  try {
    execSync('node scripts/validate-source-data-consistency.js', { cwd: ROOT, stdio: 'pipe' });
    assert(true, '24. Phase 7Z: validate-source-data-consistency.js passes');
  } catch (e) {
    assert(false, '24. Phase 7Z regression: validate-source-data-consistency.js FAILED');
  }
}

// 25. Deterministic sitemap regeneration (URL set)
{
  const before = read('sitemap-calculators.xml');
  execSync('node scripts/generate-sitemaps.js', { cwd: ROOT, stdio: 'pipe' });
  const after = read('sitemap-calculators.xml');
  const urlsOf = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
  assert(JSON.stringify(urlsOf(before)) === JSON.stringify(urlsOf(after)), '25. Sitemap URL set is deterministic across repeated regeneration');
}

// 26. 0 broken links sitewide
{
  try {
    execSync('node scripts/check-broken-links.js', { cwd: ROOT, stdio: 'pipe' });
    assert(true, '26. check-broken-links.js: 0 broken links sitewide (including the full 9-page Spanish cluster)');
  } catch (e) {
    assert(false, '26. check-broken-links.js FAILED');
  }
}

console.log('');
console.log('test-phase-8g: ' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail === 0 ? 0 : 1);
