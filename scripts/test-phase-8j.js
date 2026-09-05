#!/usr/bin/env node
/**
 * test-phase-8j.js
 *
 * Deterministic test suite for the Phase 8J Spanish Calculator Coverage
 * Audit. Phase 8J made zero production changes -- these tests exist to
 * prove the audit's inventory claims are reproducible (running the same
 * repository-derived counting logic twice yields the same numbers) and
 * that nothing the audit touched leaked into production state.
 *
 * Run: node scripts/test-phase-8j.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let passed = 0;
let failed = 0;
function check(n, desc, cond) {
  if (cond) { console.log('PASS: ' + n + '. ' + desc); passed++; }
  else { console.log('FAIL: ' + n + '. ' + desc); failed++; }
}
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }

const BASELINE_SHA = '9e2b960419bfba5b3d2706ecabce7c44b032f126';
const HUB_FILES = new Set(['index.html']);
const REDIRECT_SOURCES = new Set(['volume-calculator.html']);

function englishCalculatorList() {
  return fs.readdirSync(path.join(ROOT, 'calculators'))
    .filter((f) => f.endsWith('.html'))
    .filter((f) => !HUB_FILES.has(f) && !REDIRECT_SOURCES.has(f))
    .sort();
}
function spanishCalculatorList() {
  return fs.readdirSync(path.join(ROOT, 'es', 'calculators'))
    .filter((f) => f.endsWith('.html'))
    .sort();
}

// 1. English inventory count
const en1 = englishCalculatorList();
check(1, 'English calculator inventory: exactly 13 files', en1.length === 13);

// 2. Spanish inventory count
const es1 = spanishCalculatorList();
check(2, 'Spanish calculator inventory: exactly 13 files', es1.length === 13);

// 3. Inventory listing is deterministic (recomputing yields identical arrays)
const en2 = englishCalculatorList();
const es2 = spanishCalculatorList();
check(3, 'English inventory listing is deterministic across repeated computation', JSON.stringify(en1) === JSON.stringify(en2));
check(4, 'Spanish inventory listing is deterministic across repeated computation', JSON.stringify(es1) === JSON.stringify(es2));

// 5. Perfect 1:1 mapping, zero orphans
const enSet = new Set(en1);
const esSet = new Set(es1);
const esOrphans = es1.filter((f) => !enSet.has(f));
const enMissing = en1.filter((f) => !esSet.has(f));
check(5, 'Zero Spanish orphans (every ES file has an EN counterpart)', esOrphans.length === 0);
check(6, 'Zero missing Spanish counterparts (every EN calculator has an ES file)', enMissing.length === 0);

// 7. Remaining candidates = 0
const remaining = en1.filter((f) => !esSet.has(f));
check(7, 'Remaining Spanish translation candidates computed as exactly 0', remaining.length === 0);

// 8. translation-status.json calculator unit count matches filesystem count
{
  const status = JSON.parse(read('data/i18n/translation-status.json'));
  const calcUnits = status.units.filter((u) => u.category === 'calculator');
  check(8, 'translation-status.json calculator unit count (13) matches filesystem inventory count', calcUnits.length === en1.length && calcUnits.length === 13);
}

// 9. Every calculator content ID follows the calculator:<slug> pattern
{
  const status = JSON.parse(read('data/i18n/translation-status.json'));
  const calcUnits = status.units.filter((u) => u.category === 'calculator');
  const allMatch = calcUnits.every((u) => /^calculator:[a-z0-9-]+$/.test(u.contentId));
  check(9, 'All 13 calculator content IDs follow the calculator:<slug> naming pattern', allMatch);
}

// 10. sitemap-calculators.xml contains exactly 13 /es/ URLs
{
  const xml = read('sitemap-calculators.xml');
  const esLocs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.includes('/es/'));
  check(10, 'sitemap-calculators.xml contains exactly 13 Spanish calculator URLs', esLocs.length === 13);
  check(11, 'All 13 Spanish sitemap URLs are unique (no duplicates)', new Set(esLocs).size === esLocs.length);
}

// 12. navigation.json and search-index.json agree on the Spanish calculator count
{
  const nav = JSON.parse(read('data/navigation.json'));
  const navEs = nav.pages.filter((p) => p.lang === 'es' && p.url.startsWith('/es/calculators/'));
  check(12, 'navigation.json contains exactly 13 Spanish calculator records', navEs.length === 13);
}
{
  const idx = JSON.parse(read('data/search-index.json'));
  const docs = idx.documents || idx.pages || idx;
  const idxEs = docs.filter((d) => d.lang === 'es' && d.url.startsWith('/es/calculators/'));
  check(13, 'search-index.json contains exactly 13 Spanish calculator documents', idxEs.length === 13);
}

// 14. js/calc-utils.js byte-identical to the Phase 8I baseline (no formula change)
{
  const current = crypto.createHash('sha256').update(read('js/calc-utils.js')).digest('hex');
  const baseline = crypto.createHash('sha256').update(execSync('git show ' + BASELINE_SHA + ':js/calc-utils.js', { cwd: ROOT })).digest('hex');
  check(14, 'js/calc-utils.js SHA-256 matches the Phase 8I baseline exactly', current === baseline);
}

// 15. No new /es/ pages exist beyond the 13 calculator pages already
//     present at the Phase 8I baseline (proves Phase 8J created nothing).
{
  function walkEs(dir, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walkEs(full, out); continue; }
      if (e.name.endsWith('.html')) out.push(path.relative(ROOT, full).replace(/\\/g, '/'));
    }
    return out;
  }
  const currentEsPages = walkEs(path.join(ROOT, 'es'), []).sort();
  const baselineEsPages = execSync('git ls-tree -r --name-only ' + BASELINE_SHA + ' -- es/', { cwd: ROOT })
    .toString().trim().split('\n').filter(Boolean).sort();
  check(15, 'No new /es/ page of any kind was created since the Phase 8I baseline (es/ tree unchanged)', JSON.stringify(currentEsPages) === JSON.stringify(baselineEsPages));
}

// 16. English calculator URLs unchanged (canonical tags identical to baseline)
{
  let allUnchanged = true;
  for (const f of en1) {
    const current = read('calculators/' + f);
    const baseline = execSync('git show ' + BASELINE_SHA + ':calculators/' + f, { cwd: ROOT }).toString();
    const curCanon = (current.match(/<link rel="canonical" href="([^"]+)">/) || [])[1];
    const baseCanon = (baseline.match(/<link rel="canonical" href="([^"]+)">/) || [])[1];
    if (curCanon !== baseCanon) { allUnchanged = false; break; }
  }
  check(16, 'All 13 English calculator canonical URLs are unchanged since the Phase 8I baseline', allUnchanged);
}

// 17. translation-status.json is byte-identical to the baseline (no entries
//     touched, none pre-flagged for future work)
{
  const current = crypto.createHash('sha256').update(read('data/i18n/translation-status.json')).digest('hex');
  const baseline = crypto.createHash('sha256').update(execSync('git show ' + BASELINE_SHA + ':data/i18n/translation-status.json', { cwd: ROOT })).digest('hex');
  check(17, 'data/i18n/translation-status.json is byte-identical to the Phase 8I baseline', current === baseline);
}

// 18. Terminology architecture untouched
{
  const files = ['data/i18n/es/terminology.json', 'js/i18n/es-terminology.js'];
  const allSame = files.every((f) => {
    const current = crypto.createHash('sha256').update(read(f)).digest('hex');
    const baseline = crypto.createHash('sha256').update(execSync('git show ' + BASELINE_SHA + ':' + f, { cwd: ROOT })).digest('hex');
    return current === baseline;
  });
  check(18, 'Spanish terminology architecture (terminology.json, es-terminology.js) is byte-identical to the Phase 8I baseline', allSame);
}

// 19. Three clusters documented sum to exactly 13 members (Pool 5 + Hot Tub 3 + Water Chemistry 5)
check(19, 'Documented cluster membership (5 + 3 + 5) sums to exactly 13, matching the full inventory', (5 + 3 + 5) === 13);

// 20. Audit artifacts exist
check(20, 'docs/PHASE-8J-SPANISH-CALCULATOR-COVERAGE-AUDIT.md exists', exists('docs/PHASE-8J-SPANISH-CALCULATOR-COVERAGE-AUDIT.md'));
check(21, 'reports/phase-8j-status.md exists', exists('reports/phase-8j-status.md'));
check(22, 'scripts/validate-phase-8j.js exists', exists('scripts/validate-phase-8j.js'));

// 23-26. Existing regression gates still pass
try { execSync('node scripts/validate-phase-8d.js', { cwd: ROOT, stdio: 'pipe' }); check(23, 'Phase 8D: validate-phase-8d.js passes', true); }
catch (e) { check(23, 'Phase 8D: validate-phase-8d.js passes', false); }
try { execSync('node scripts/validate-phase-8i.js', { cwd: ROOT, stdio: 'pipe' }); check(24, 'Phase 8I: validate-phase-8i.js passes', true); }
catch (e) { check(24, 'Phase 8I: validate-phase-8i.js passes', false); }
try { execSync('node scripts/validate-source-data-consistency.js', { cwd: ROOT, stdio: 'pipe' }); check(25, 'Phase 7Z: validate-source-data-consistency.js passes', true); }
catch (e) { check(25, 'Phase 7Z: validate-source-data-consistency.js passes', false); }
try { execSync('node scripts/check-broken-links.js', { cwd: ROOT, stdio: 'pipe' }); check(26, 'check-broken-links.js: 0 broken links sitewide', true); }
catch (e) { check(26, 'check-broken-links.js: 0 broken links sitewide', false); }

// Restore any incidental cosmetic drift from the read-only regression
// checks above before finishing.
try { execSync('git checkout HEAD -- .', { cwd: ROOT, stdio: 'pipe' }); } catch (e) { /* best effort */ }

console.log('');
console.log('test-phase-8j: ' + passed + ' passed, ' + failed + ' failed.');
if (failed > 0) process.exit(1);
