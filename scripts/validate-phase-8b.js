#!/usr/bin/env node
/**
 * validate-phase-8b.js
 *
 * Validates the actual Phase 8B architectural invariant: a single clean
 * `npm run build` produces hub/index pages that already reflect the
 * current navigation state -- not the previous build's. This is NOT a
 * "build exits 0" check; it directly tests the proven dependency
 * (generate-hubs.js reads data/navigation.json, which must be current
 * before it reads it) and, optionally, drives real builds to prove it.
 *
 * Run: node scripts/validate-phase-8b.js
 * Full two-build proof: PHASE_8B_RUN_BUILD=1 node scripts/validate-phase-8b.js
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let errors = 0;
let warnings = 0;
function err(msg) { console.log('ERROR: ' + msg); errors++; }
function warn(msg) { console.log('WARN: ' + msg); warnings++; }
function ok(msg) { console.log('OK: ' + msg); }
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

// ---------------------------------------------------------------------
// A. Repository baseline
// ---------------------------------------------------------------------
try {
  const status = execSync('git status --porcelain', { cwd: ROOT }).toString();
  if (status.trim() === '') ok('A. Repository begins clean');
  else warn('A. Repository is not clean (expected mid-phase, before the final commit) -- proceeding');
} catch (e) {
  warn('A. Could not check git status: ' + e.message);
}

// ---------------------------------------------------------------------
// B. Navigation dependency: the pre-hub refresh call must exist, must run
//    via execSync (a real, separate process -- require() would be a
//    silent no-op the second time the same path is required, see Phase
//    8A's identical finding for generate-entity-pages.js), and must be
//    positioned before generate-hubs.js. The original, final,
//    authoritative require() call after generate-hubs.js must still exist
//    too, so navigation.json ends up including the finalized hub pages.
// ---------------------------------------------------------------------
{
  const pipeline = read('scripts/run-all-generators.js');
  const preHubExecIdx = pipeline.indexOf("execSync('node scripts/generate-navigation.js'");
  const hubsRequireIdx = pipeline.indexOf("require(path.join(__dirname, 'generate-hubs.js'))");
  const postHubRequireIdx = pipeline.indexOf("require(path.join(__dirname, 'generate-navigation.js'))");

  if (preHubExecIdx === -1) {
    err('B. No execSync-based pre-hub call to generate-navigation.js found in run-all-generators.js');
  } else if (hubsRequireIdx === -1) {
    err('B. generate-hubs.js require() call not found');
  } else if (postHubRequireIdx === -1) {
    err('B. Final, post-hub require() call to generate-navigation.js not found -- navigation.json would no longer include finalized hub pages');
  } else if (!(preHubExecIdx < hubsRequireIdx && hubsRequireIdx < postHubRequireIdx)) {
    err('B. Ordering is wrong: expected pre-hub navigation refresh (execSync) < generate-hubs.js < final navigation write (require), found a different order');
  } else {
    ok('B. Dependency ordering confirmed: navigation refresh (execSync) -> generate-hubs.js -> final navigation write (require)');
  }

  // The refresh call must use execSync (a genuinely separate process), not
  // require() -- require()-ing the same script path twice in one process
  // makes the second call a silent no-op (Node's module cache), which
  // would make this "fix" inert without ever failing loudly.
  if (preHubExecIdx !== -1 && !/execSync\('node scripts\/generate-navigation\.js'/.test(pipeline)) {
    err('B. Pre-hub refresh does not use execSync -- a require()-based second call would be a silent no-op');
  }
}

// ---------------------------------------------------------------------
// C. Hub freshness: generate-hubs.js must read data/navigation.json (the
//    proven dependency), confirming the fix targets the actual mechanism.
// ---------------------------------------------------------------------
{
  const hubsSrc = read('scripts/generate-hubs.js');
  if (!/readJson\(NAV_PATH/.test(hubsSrc)) {
    err('C. generate-hubs.js no longer reads NAV_PATH (data/navigation.json) -- the proven dependency this fix targets is gone; re-investigate before trusting this validator');
  } else {
    ok('C. generate-hubs.js confirmed to read data/navigation.json (the proven dependency)');
  }
}

// ---------------------------------------------------------------------
// D/E. Single-build convergence + second-build stability -- the real,
// decisive test. Opt-in via env var since it runs two full builds.
// ---------------------------------------------------------------------
const KNOWN_TIMESTAMP_FILES = new Set([
  'audit/google/crawl-review.md', 'audit/hub-topology.md',
  'data/indexing/crawl-rules.json', 'data/indexing/freshness.json', 'data/indexing/priority.json', 'data/indexing/weights.json',
  'data/navigation.json', 'data/platform/compatibility.json',
  'qa-summary.json', 'qa-summary.md', 'qa/certification.html', 'qa/index.html',
  'reports/accessibility.html', 'reports/ai-readiness.html', 'reports/architecture.html', 'reports/calculators.html',
  'reports/content.html', 'reports/datasets.html', 'reports/entities.html', 'reports/indexing-intelligence.html',
  'reports/links.html', 'reports/mobile.html', 'reports/performance.html',
  'reports/phase-7b/generator-validation-results.json', 'reports/phase-7c/URL-VALIDATION-RESULTS.json',
  'reports/phase-7d/chemistry-validation-results.json', 'reports/schema.html', 'reports/seo.html',
]);

const HUB_INDEX_PAGES = [
  'calculators/index.html', 'charts/index.html', 'comparisons/index.html', 'legal/index.html', 'maintenance/index.html',
  'guides/index.html', 'guides/advanced/index.html', 'guides/chlorine/index.html', 'guides/edge-cases/index.html',
  'guides/hot-tub/index.html', 'guides/ph/index.html', 'guides/questions/index.html', 'guides/seasonal/index.html',
  'programmatic/index.html', 'programmatic/behavior/index.html', 'programmatic/chlorine/index.html',
  'programmatic/explanations/index.html', 'programmatic/hot-tubs/index.html', 'programmatic/ph/index.html',
  'programmatic/problems/index.html', 'programmatic/shock/index.html',
];

if (process.env.PHASE_8B_RUN_BUILD === '1') {
  console.log('\n--- D/E: running two full builds (PHASE_8B_RUN_BUILD=1) ---');
  try {
    execSync('npm run build', { cwd: ROOT, stdio: 'pipe' });
  } catch (e) {
    err('D. First build failed: ' + e.message);
  }

  // D. Check hub pages already reflect current calculator titles on this
  // first build (a concrete, known-correct proxy for "current navigation
  // state", independent of any particular content phase's specific titles).
  let freshnessOk = true;
  for (const hub of ['calculators/index.html']) {
    const hubPath = path.join(ROOT, hub);
    if (!fs.existsSync(hubPath)) continue;
    const html = fs.readFileSync(hubPath, 'utf8');
    for (const calcFile of ['pool-shock-calculator.html', 'hot-tub-shock-calculator.html']) {
      const calcPath = path.join(ROOT, 'calculators', calcFile);
      if (!fs.existsSync(calcPath)) continue;
      const calcTitle = (fs.readFileSync(calcPath, 'utf8').match(/<title>([^<]+)<\/title>/i) || [])[1];
      if (!calcTitle) continue;
      const calcNameOnly = calcTitle.replace(/ \| WaterBalanceTools$/, '').trim();
      if (!html.includes(calcNameOnly)) {
        err('D. Hub freshness: calculators/index.html does not contain the CURRENT title for ' + calcFile + ' ("' + calcNameOnly + '") on the first build -- hub page is stale');
        freshnessOk = false;
      }
    }
  }
  if (freshnessOk) ok('D. Hub first-build freshness confirmed: calculators/index.html reflects current calculator titles immediately');

  const filesAfter1 = execSync('git status --porcelain', { cwd: ROOT }).toString().split('\n').map((l) => l.slice(3)).filter(Boolean);
  const snapDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phase8b-snap-'));
  for (const f of filesAfter1) {
    const src = path.join(ROOT, f);
    if (!fs.existsSync(src)) continue;
    const dst = path.join(snapDir, f);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }

  try {
    execSync('npm run build', { cwd: ROOT, stdio: 'pipe' });
  } catch (e) {
    err('E. Second build failed: ' + e.message);
  }

  let hubChanges = 0;
  let unexpectedNonHubChanges = 0;
  for (const f of filesAfter1) {
    const snapPath = path.join(snapDir, f);
    const livePath = path.join(ROOT, f);
    if (!fs.existsSync(snapPath) || !fs.existsSync(livePath)) continue;
    const same = fs.readFileSync(snapPath).equals(fs.readFileSync(livePath));
    if (same) continue;
    if (HUB_INDEX_PAGES.includes(f)) {
      err('E. Hub/index content changed between build 1 and build 2: ' + f);
      hubChanges++;
    } else if (!KNOWN_TIMESTAMP_FILES.has(f)) {
      warn('E. Non-hub, non-timestamp file changed between build 1 and build 2: ' + f + ' (not a Phase 8B FAIL by itself, but verify manually -- see docs/PHASE-8B-HUB-NAVIGATION-CONVERGENCE.md for known, separate anomalies)');
      unexpectedNonHubChanges++;
    }
  }
  fs.rmSync(snapDir, { recursive: true, force: true });
  if (hubChanges === 0) ok('E. Second-build stability confirmed: 0 hub/index content changes');
} else {
  warn('D/E. Skipped the two-full-build gate (set PHASE_8B_RUN_BUILD=1 to run it -- see reports/phase-8b-status.md for the real, already-captured build results)');
}

// ---------------------------------------------------------------------
// F. Navigation URL integrity
// ---------------------------------------------------------------------
try {
  execSync('node scripts/check-broken-links.js', { cwd: ROOT, stdio: 'pipe' });
  ok('F. check-broken-links.js: PASS, no broken links');
} catch (e) {
  err('F. check-broken-links.js FAILED: ' + (e.stdout || e.message).toString().split('\n').slice(0, 3).join(' | '));
}
try {
  execSync('node scripts/validate-url-indexation.js', { cwd: ROOT, stdio: 'pipe' });
  ok('F. validate-url-indexation.js: PASS, no violations');
} catch (e) {
  err('F. validate-url-indexation.js FAILED: ' + (e.stdout || e.message).toString().split('\n').slice(0, 3).join(' | '));
}
try {
  const out = execSync('node scripts/validate-hubs.js', { cwd: ROOT }).toString();
  if (out.includes('PASSED')) ok('F. validate-hubs.js: PASS');
  else err('F. validate-hubs.js did not report PASSED: ' + out.split('\n').pop());
} catch (e) {
  err('F. validate-hubs.js FAILED: ' + e.message);
}

console.log('');
console.log('validate-phase-8b: ' + (errors === 0 ? 'PASS' : 'FAIL') + ' -- ' + errors + ' error(s), ' + warnings + ' warning(s).');
process.exit(errors === 0 ? 0 : 1);
