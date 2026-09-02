#!/usr/bin/env node
/**
 * test-phase-8b.js
 *
 * Exercises the proven Phase 8B failure mode: generate-hubs.js reads
 * data/navigation.json (a committed, persistent file) to build hub-to-leaf
 * cross-links, but data/navigation.json was only refreshed AFTER
 * generate-hubs.js ran, in the same build -- so hub pages always reflected
 * the PREVIOUS build's page metadata. Fixed by running
 * generate-navigation.js a second, earlier time (via execSync, since
 * require() caching would make a second require() of the same path a
 * silent no-op) immediately before generate-hubs.js. See
 * docs/PHASE-8B-HUB-NAVIGATION-CONVERGENCE.md.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let pass = 0;
let fail = 0;
function T(label, fn) {
  try {
    const r = fn();
    if (r === false) throw new Error('assertion returned false');
    console.log('PASS: ' + label);
    pass++;
  } catch (e) {
    console.log('FAIL: ' + label + ' -- ' + e.message);
    fail++;
  }
}

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }

// =======================================================================
// 1. Generator dependency ordering
// =======================================================================

T('run-all-generators.js: pre-hub navigation refresh precedes generate-hubs.js, which precedes the final navigation write', () => {
  const pipeline = read('scripts/run-all-generators.js');
  const preHub = pipeline.indexOf("execSync('node scripts/generate-navigation.js'");
  const hubs = pipeline.indexOf("require(path.join(__dirname, 'generate-hubs.js'))");
  const postHub = pipeline.indexOf("require(path.join(__dirname, 'generate-navigation.js'))");
  if (preHub === -1) throw new Error('pre-hub execSync call not found');
  if (hubs === -1) throw new Error('generate-hubs.js require() not found');
  if (postHub === -1) throw new Error('final navigation require() not found');
  if (!(preHub < hubs && hubs < postHub)) throw new Error('ordering incorrect: preHub=' + preHub + ' hubs=' + hubs + ' postHub=' + postHub);
});

T('the pre-hub refresh uses execSync, not require() (require() caching would make a second call a silent no-op)', () => {
  const pipeline = read('scripts/run-all-generators.js');
  // Confirm there are exactly 2 distinct invocation mechanisms for
  // generate-navigation.js: one execSync, one require() -- not two
  // require()s (which Node's module cache would collapse into one
  // effective execution).
  const execCount = (pipeline.match(/execSync\('node scripts\/generate-navigation\.js'/g) || []).length;
  const requireCount = (pipeline.match(/require\(path\.join\(__dirname, 'generate-navigation\.js'\)\)/g) || []).length;
  if (execCount !== 1) throw new Error('expected exactly 1 execSync call, found ' + execCount);
  if (requireCount !== 1) throw new Error('expected exactly 1 require() call, found ' + requireCount + ' (2 would silently collapse to 1 execution)');
});

T('empirical: requiring generate-navigation.js twice in one process only executes it once (proves why execSync was necessary)', () => {
  const out = execSync(
    `node -e "require('./scripts/generate-navigation.js'); require('./scripts/generate-navigation.js');"`,
    { cwd: ROOT }
  ).toString();
  const count = (out.match(/generate-navigation: indexed/g) || []).length;
  if (count !== 1) throw new Error('expected the double-require reproduction to print the completion line exactly once, got ' + count);
});

// =======================================================================
// 2. Navigation data availability before hub generation
// =======================================================================

T('generate-hubs.js reads data/navigation.json (the confirmed dependency this fix targets)', () => {
  const src = read('scripts/generate-hubs.js');
  if (!src.includes("NAV_PATH = path.join(ROOT, 'data', 'navigation.json')")) throw new Error('NAV_PATH definition not found or changed');
  if (!/readJson\(NAV_PATH/.test(src)) throw new Error('generate-hubs.js no longer reads NAV_PATH');
});

T('generate-navigation.js walks the full repository (so it can see all leaf pages, including any regenerated this build)', () => {
  const src = read('scripts/generate-navigation.js');
  if (!/walk\(ROOT\)/.test(src)) throw new Error('generate-navigation.js no longer walks from ROOT');
});

// =======================================================================
// 3/4. Representative hub/index generation + first-build freshness.
// Requires the repo to already be in its built (post-npm-run-build) state;
// skips gracefully with a clear note if a representative file is absent.
// =======================================================================

const REPRESENTATIVE_HUBS = [
  'calculators/index.html', 'charts/index.html', 'comparisons/index.html', 'legal/index.html', 'maintenance/index.html',
  'guides/index.html', 'guides/chlorine/index.html', 'guides/ph/index.html', 'guides/seasonal/index.html',
  'programmatic/index.html', 'programmatic/chlorine/index.html', 'programmatic/shock/index.html',
];

T('representative hub/index files exist at the expected repository paths', () => {
  const missing = REPRESENTATIVE_HUBS.filter((h) => !exists(h));
  if (missing.length > 0) throw new Error('missing representative hub files: ' + missing.join(', '));
});

T('first-build freshness: calculators/index.html reflects the CURRENT pool-shock-calculator.html title, not a stale cached one', () => {
  if (!exists('calculators/index.html') || !exists('calculators/pool-shock-calculator.html')) {
    console.log('  (skipped: representative files not present in current tree)');
    return;
  }
  const hub = read('calculators/index.html');
  const calc = read('calculators/pool-shock-calculator.html');
  const titleMatch = calc.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch) throw new Error('pool-shock-calculator.html has no <title>');
  const currentTitle = titleMatch[1].replace(/ \| WaterBalanceTools$/, '').trim();
  if (!hub.includes(currentTitle)) {
    throw new Error('calculators/index.html does not contain the current calculator title "' + currentTitle + '" -- hub page is stale (the exact Phase 8B defect)');
  }
});

T('first-build freshness: hot-tub-shock-calculator.html title is current in calculators/index.html too', () => {
  if (!exists('calculators/index.html') || !exists('calculators/hot-tub-shock-calculator.html')) {
    console.log('  (skipped: representative files not present in current tree)');
    return;
  }
  const hub = read('calculators/index.html');
  const calc = read('calculators/hot-tub-shock-calculator.html');
  const titleMatch = calc.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch) throw new Error('hot-tub-shock-calculator.html has no <title>');
  const currentTitle = titleMatch[1].replace(/ \| WaterBalanceTools$/, '').trim();
  if (!hub.includes(currentTitle)) {
    throw new Error('calculators/index.html does not contain the current title "' + currentTitle + '"');
  }
});

// =======================================================================
// 5. Second-build hub stability (uses the repository's current build state
//    as "build N"; runs one more build and diffs every representative hub)
// =======================================================================

T('second-build stability: representative hub/index files are byte-identical across one more build', () => {
  const before = {};
  for (const h of REPRESENTATIVE_HUBS) {
    if (exists(h)) before[h] = read(h);
  }
  if (Object.keys(before).length === 0) {
    console.log('  (skipped: no representative hub files present -- run npm run build first)');
    return;
  }
  execSync('npm run build', { cwd: ROOT, stdio: 'pipe' });
  const changed = [];
  for (const [h, prevContent] of Object.entries(before)) {
    const nowContent = read(h);
    if (nowContent !== prevContent) changed.push(h);
  }
  if (changed.length > 0) throw new Error('hub content changed after an additional build: ' + changed.join(', '));
});

// =======================================================================
// 6. Representative navigation-link, URL, canonical, sitemap preservation
// =======================================================================

T('navigation links: calculators/index.html links to every pool calculator via a clean, non-.html URL', () => {
  if (!exists('calculators/index.html')) { console.log('  (skipped)'); return; }
  const hub = read('calculators/index.html');
  for (const url of ['/calculators/pool-shock-calculator', '/calculators/pool-ph-calculator', '/calculators/chemical-calculator']) {
    if (!hub.includes('href="' + url + '"')) throw new Error('missing expected link: ' + url);
  }
});

T('canonical preservation: calculators/index.html still declares its own canonical URL', () => {
  if (!exists('calculators/index.html')) { console.log('  (skipped)'); return; }
  const hub = read('calculators/index.html');
  if (!/<link rel="canonical" href="https:\/\/waterbalancetools\.com\/calculators">/.test(hub)) {
    throw new Error('canonical tag missing or changed for calculators/index.html');
  }
});

T('sitemap <loc> preservation: sitemap.xml (if changed) differs only in <lastmod>, never in <loc>', () => {
  let diff;
  try {
    diff = execSync('git diff HEAD -- sitemap.xml', { cwd: ROOT }).toString();
  } catch (e) {
    diff = '';
  }
  if (diff === '') { console.log('  (sitemap.xml unchanged)'); return; }
  const changedLines = diff.split('\n').filter((l) => (l.startsWith('+') || l.startsWith('-')) && !l.startsWith('+++') && !l.startsWith('---'));
  const badLine = changedLines.find((l) => !/<lastmod>/.test(l));
  if (badLine) throw new Error('sitemap.xml diff contains a non-<lastmod> change: ' + badLine.trim());
});

T('hub membership count is stable: exactly 21 hubs validated by validate-hubs.js', () => {
  const out = execSync('node scripts/validate-hubs.js', { cwd: ROOT }).toString();
  if (!/PASSED \(21 hubs validated\)/.test(out)) throw new Error('unexpected hub count or failure: ' + out.trim().split('\n').pop());
});

// =======================================================================
// 7. Phase 8A injector regression protection
// =======================================================================

T('Phase 8A: the five injector whitespace fixes are still present in source', () => {
  if (!read('scripts/inject-footer.js').includes('SKIP_DIRS')) throw new Error('inject-footer.js SKIP_DIRS fix missing');
  if (!/\\s\*<div class="ad ad-/.test(read('scripts/inject-ads.js'))) throw new Error('inject-ads.js stripAds fix missing');
  if (!read('scripts/restructure-calculator-pages.js').includes('removeFrom')) throw new Error('restructure-calculator-pages.js pluck() fix missing');
  const badgeOccurrences = (read('scripts/generate-version-badges.js').match(/\\s\*\$\{markerStart\}/g) || []).length;
  if (badgeOccurrences < 2) throw new Error('generate-version-badges.js fix missing or incomplete');
});

T('Phase 8A: no injector whitespace regression on a representative entity page footer', () => {
  if (!exists('entities/algae.html')) { console.log('  (skipped: entities/algae.html not present)'); return; }
  const s = read('entities/algae.html');
  const idx = s.indexOf('<footer');
  if (idx === -1) throw new Error('no <footer> found');
  const line = s.slice(0, idx).split('\n').pop();
  if (line.length > 20) throw new Error('footer preceded by ' + line.length + ' chars of whitespace -- Phase 8A regression');
});

T('Phase 8A: representative calculator page\'s blank-line run does not GROW across an additional build', () => {
  // chemical-calculator.html carries a known, pre-existing, historical
  // blank-line scar inside its output-panel div (documented in
  // docs/PHASE-8A-TEMPLATE-INJECTOR-REMEDIATION.md) that Phase 8A's fix
  // stops from growing further but does not retroactively clean up -- so
  // an absolute threshold is the wrong test here. What matters is that it
  // does not grow between builds, which is exactly what Phase 8A fixed.
  if (!exists('calculators/chemical-calculator.html')) { console.log('  (skipped)'); return; }
  function maxBlankRun(text) {
    let maxRun = 0, run = 0;
    for (const l of text.split('\n')) {
      if (l.trim() === '') run++; else { if (run > maxRun) maxRun = run; run = 0; }
    }
    return maxRun;
  }
  const before = maxBlankRun(read('calculators/chemical-calculator.html'));
  execSync('node scripts/restructure-calculator-pages.js', { cwd: ROOT, stdio: 'pipe' });
  const after = maxBlankRun(read('calculators/chemical-calculator.html'));
  if (after > before) throw new Error('blank-line run grew from ' + before + ' to ' + after + ' lines after re-running restructure-calculator-pages.js -- Phase 8A pluck() regression');
});

// =======================================================================
// 8. Phase 7Z source/data consistency regression protection
// =======================================================================

T('Phase 7Z: validate-source-data-consistency.js still exists and is wired into the build', () => {
  if (!exists('scripts/validate-source-data-consistency.js')) throw new Error('missing');
  if (!read('scripts/run-all-generators.js').includes('validate-source-data-consistency.js')) throw new Error('not wired into run-all-generators.js');
});

T('Phase 7Z: validate-source-data-consistency.js still passes', () => {
  const out = execSync('node scripts/validate-source-data-consistency.js', { cwd: ROOT }).toString();
  if (!out.includes('PASS -- 0 error(s)')) throw new Error('did not report a clean pass: ' + out.split('\n').pop());
});

T('Phase 7Z: populate-data.js remains outside the automatic build', () => {
  const pipeline = read('scripts/run-all-generators.js');
  if (/require\([^)]*populate-data\.js[^)]*\)|execSync\(['"]node scripts\/populate-data\.js/.test(pipeline)) {
    throw new Error('populate-data.js appears to have been added to the automatic build');
  }
});

// =======================================================================
// 9. No prohibited scope changes
// =======================================================================

T('no chemistry/calculator/URL-policy files were touched by this phase', () => {
  const diff = execSync(
    'git diff --stat HEAD -- js/calc-utils.js js/calculator.js scripts/data/chemistry-claims.js scripts/data/chemistry-ranges.js scripts/data/dataset-dosage-matrices.js scripts/url-policy.js js/url/url-engine.js',
    { cwd: ROOT }
  ).toString().trim();
  if (diff !== '') throw new Error('prohibited file(s) show a diff: ' + diff);
});

console.log('');
console.log('test-phase-8b: ' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail === 0 ? 0 : 1);
