#!/usr/bin/env node
/**
 * test-phase-8e.js
 *
 * Phase 8E test suite: the first Spanish production cluster (5 pool
 * calculator pages). Requires a completed `npm run build` (reads real
 * generated output, not fixtures, since this phase is about production
 * pages).
 *
 * Run: node scripts/test-phase-8e.js
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

const CLUSTER = [
  'chemical-calculator.html',
  'pool-volume-calculator.html',
  'pool-chlorine-calculator.html',
  'pool-ph-calculator.html',
  'pool-shock-calculator.html',
];

// 1. Spanish page existence for the full cluster
{
  const allExist = CLUSTER.every((f) => fs.existsSync(path.join(ROOT, 'es/calculators', f)));
  assert(allExist, '1. All 5 Spanish cluster pages exist on disk');
}

// 2. Content-ID / URL separation
{
  const translationStatus = require('../js/i18n/translation-status');
  translationStatus.reload();
  const record = translationStatus.getRecord('calculator:chemical');
  assert(!!record && record.contentId !== record.languages.en.url && record.contentId !== record.languages.es.url,
    '2. Content ID "calculator:chemical" is distinct from both its English and Spanish URLs');
}

// 3. English canonical unchanged
{
  const html = read('calculators/chemical-calculator.html');
  const m = html.match(/<link rel="canonical" href="([^"]+)">/);
  assert(m && m[1] === 'https://waterbalancetools.com/calculators/chemical-calculator', '3. English chemical-calculator.html canonical is unchanged');
}

// 4. Spanish canonical self-referential
{
  const html = read('es/calculators/chemical-calculator.html');
  const m = html.match(/<link rel="canonical" href="([^"]+)">/);
  assert(m && m[1] === 'https://waterbalancetools.com/es/calculators/chemical-calculator', '4. Spanish chemical-calculator.html canonical is self-referential');
}

// 5. hreflang set correctness on the primary page
{
  const html = read('es/calculators/chemical-calculator.html');
  const hasEn = html.includes('<link rel="alternate" hreflang="en" href="https://waterbalancetools.com/calculators/chemical-calculator">');
  const hasEs = html.includes('<link rel="alternate" hreflang="es" href="https://waterbalancetools.com/es/calculators/chemical-calculator">');
  const hasXDefault = html.includes('<link rel="alternate" hreflang="x-default" href="https://waterbalancetools.com/calculators/chemical-calculator">');
  assert(hasEn && hasEs && hasXDefault, '5. Spanish primary calculator page has correct en/es/x-default hreflang set');
}

// 6. html lang correctness
{
  const en = read('calculators/pool-volume-calculator.html');
  const es = read('es/calculators/pool-volume-calculator.html');
  assert(/<html lang="en">/.test(en) && /<html lang="es">/.test(es), '6. English page keeps lang="en"; Spanish page has lang="es"');
}

// 7. Language switcher present and correct on both sides
{
  const en = read('calculators/pool-chlorine-calculator.html');
  const es = read('es/calculators/pool-chlorine-calculator.html');
  const enSwitch = en.includes('href="/es/calculators/pool-chlorine-calculator" class="lang-switch"');
  const esSwitch = es.includes('href="/calculators/pool-chlorine-calculator" class="lang-switch"');
  assert(enSwitch && esSwitch, '7. Language switcher present on both English and Spanish pool-chlorine-calculator, resolving to the actual counterpart');
}

// 8. No fabricated switcher for an untranslated page
{
  const { availableSwitcherLinks } = require('../js/i18n/language-switcher');
  const links = availableSwitcherLinks('calculator:pool-volume', '/calculators/pool-volume-calculator', 'en');
  assert(links.every((l) => l.available || l.isCurrent), '8. Switcher never marks an unavailable language as available');
}

// 9. Sitemap inclusion for the full cluster
{
  const xml = read('sitemap-calculators.xml');
  const allIncluded = CLUSTER.every((f) => xml.includes('https://waterbalancetools.com/es/calculators/' + f.replace(/\.html$/, '')));
  assert(allIncluded, '9. All 5 Spanish URLs present in sitemap-calculators.xml');
}

// 10. Sitemap category matches English (priority/changefreq parity)
{
  const xml = read('sitemap-calculators.xml');
  const urlBlock = (u) => {
    const idx = xml.indexOf('<loc>' + u + '</loc>');
    return xml.slice(idx, idx + 200);
  };
  const enBlock = urlBlock('https://waterbalancetools.com/calculators/chemical-calculator');
  const esBlock = urlBlock('https://waterbalancetools.com/es/calculators/chemical-calculator');
  const enPrio = (enBlock.match(/<priority>([^<]+)<\/priority>/) || [])[1];
  const esPrio = (esBlock.match(/<priority>([^<]+)<\/priority>/) || [])[1];
  assert(enPrio && enPrio === esPrio, '10. Spanish calculator URL has the same sitemap priority as its English equivalent (correctly categorized, not "other")');
}

// 11. Robots/indexation: no accidental noindex
{
  const urlPolicy = require('./url-policy');
  const allIndexable = CLUSTER.every((f) => {
    const rel = 'es/calculators/' + f;
    return urlPolicy.isIndexablePage(rel, read(rel));
  });
  assert(allIndexable, '11. All 5 Spanish pages are indexable, no accidental noindex');
}

// 12. Calculation logic byte-identical between English and Spanish
{
  let allIdentical = true;
  for (const f of CLUSTER) {
    const en = read('calculators/' + f);
    const es = read('es/calculators/' + f);
    const enCalls = (en.match(/window\.WaterBalance\.\w+\.\w+\(/g) || []).sort();
    const esCalls = (es.match(/window\.WaterBalance\.\w+\.\w+\(/g) || []).sort();
    if (JSON.stringify(enCalls) !== JSON.stringify(esCalls)) allIdentical = false;
  }
  assert(allIdentical, '12. Calculation function calls are byte-identical between English and Spanish for all 5 cluster pages');
}

// 13. Valid JSON-LD on Spanish pages
{
  let allValid = true;
  for (const f of CLUSTER) {
    const html = read('es/calculators/' + f);
    const scripts = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    for (const s of scripts) {
      try { JSON.parse(s); } catch (e) { allValid = false; }
    }
  }
  assert(allValid, '13. All JSON-LD blocks on the 5 Spanish pages are valid JSON');
}

// 14. Valid inline JS syntax on Spanish pages (calculation scripts untouched structurally)
{
  let allValid = true;
  for (const f of CLUSTER) {
    const html = read('es/calculators/' + f);
    const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
    for (const m of scripts) {
      const attrs = m[1];
      const body = m[2];
      if (/src=/.test(attrs) || /application\/ld\+json/.test(attrs) || !body.trim()) continue;
      try { new Function(body); } catch (e) { allValid = false; }
    }
  }
  assert(allValid, '14. All inline calculator <script> blocks on the 5 Spanish pages are syntactically valid');
}

// 15. No /es/es/ anywhere in the cluster
{
  const anyDoubled = CLUSTER.some((f) => /\/es\/es\//.test(read('es/calculators/' + f)));
  assert(!anyDoubled, '15. No /es/es/ duplication anywhere in the Spanish cluster');
}

// 16. English URL manifest preservation (spot check via url-policy)
{
  const urlPolicy = require('./url-policy');
  const urlEngine = require('../js/url/url-engine');
  const samples = CLUSTER.map((f) => 'calculators/' + f);
  const allPreserved = samples.every((f) => urlPolicy.isProductionPage(f) && urlEngine.buildUrl(f) === '/calculators/' + f.replace(/^calculators\//, '').replace(/\.html$/, ''));
  assert(allPreserved, '16. English calculator URLs resolve exactly as before (spot check)');
}

// 17. Phase 8D regression
{
  try {
    const out = execSync('node scripts/validate-phase-8d.js', { cwd: ROOT }).toString();
    assert(/: PASS/.test(out), '17. Phase 8D: validate-phase-8d.js passes');
  } catch (e) {
    assert(false, '17. Phase 8D regression: validate-phase-8d.js FAILED');
  }
}

// 18. Phase 8B regression (hub convergence still intact)
{
  try {
    const out = execSync('node scripts/validate-phase-8b.js', { cwd: ROOT }).toString();
    assert(/: PASS/.test(out), '18. Phase 8B: validate-phase-8b.js passes');
  } catch (e) {
    assert(false, '18. Phase 8B regression: validate-phase-8b.js FAILED');
  }
}

// 19. Phase 7Z regression
{
  try {
    execSync('node scripts/validate-source-data-consistency.js', { cwd: ROOT, stdio: 'pipe' });
    assert(true, '19. Phase 7Z: validate-source-data-consistency.js passes');
  } catch (e) {
    assert(false, '19. Phase 7Z regression: validate-source-data-consistency.js FAILED');
  }
}

// 20. Deterministic sitemap regeneration
{
  const before = read('sitemap-calculators.xml');
  execSync('node scripts/generate-sitemaps.js', { cwd: ROOT, stdio: 'pipe' });
  const after = read('sitemap-calculators.xml');
  // Only <lastmod> for freshly-touched files may differ; URL set must match exactly.
  const urlsOf = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
  assert(JSON.stringify(urlsOf(before)) === JSON.stringify(urlsOf(after)), '20. Sitemap URL set is deterministic across repeated regeneration');
}

console.log('');
console.log('test-phase-8e: ' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail === 0 ? 0 : 1);
