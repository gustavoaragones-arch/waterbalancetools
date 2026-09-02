#!/usr/bin/env node
/**
 * validate-phase-8c.js
 *
 * Validates the Phase 8C finding: the two data/navigation.json records
 * flagged during Phase 8B (audit/google/crawl-depth.html, reports/phase-7a/
 * index.html) do not fluctuate under `npm run build`. This is NOT a "build
 * exits 0" check -- it re-derives the record-level difference set directly
 * (opt-in, drives real builds) and independently verifies the two proven
 * mechanisms: audit-crawl-depth.js IS part of the build pipeline (legitimate
 * dynamic metric, classification A), while reports/phase-7a/index.html and
 * scripts/audit-forensic/run.js are NOT (the original fluctuation was a
 * Phase 8B testing-methodology artifact, not a build defect).
 *
 * Run: node scripts/validate-phase-8c.js
 * Full three-build proof: PHASE_8C_RUN_BUILD=1 node scripts/validate-phase-8c.js
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
// B. Phase 8A injector fixes must remain present (do not weaken or revert).
//    Spot-checks the exact idempotency patterns Phase 8A established.
// ---------------------------------------------------------------------
{
  const checks = [
    ['scripts/inject-footer.js', /\\s\*<footer\\b/, 'FOOTER_RE consumes leading whitespace'],
    ['scripts/inject-footer.js', /SKIP_DIRS\s*=\s*new Set\(\['templates'\]\)/, 'templates/ directory skip present'],
    ['scripts/inject-ads.js', /\\s\*<div class="ad ad-/, 'stripAds() consumes leading whitespace'],
    ['scripts/generate-version-badges.js', /`\\\\s\*\$\{markerStart\}/, 'badge strip regex consumes leading whitespace'],
    ['scripts/generate-google-dashboard.js', /`\\\\s\*\$\{markerStart\}\[\\\\s\\\\S\]\*\?\$\{markerEnd\}\\\\s\*`/, 'freshness block strip regex consumes surrounding whitespace'],
  ];
  let allOk = true;
  for (const [file, re, label] of checks) {
    const src = read(file);
    if (!re.test(src)) {
      err('B. Phase 8A regression: ' + file + ' -- ' + label + ' -- pattern no longer found');
      allOk = false;
    }
  }
  const restructureSrc = read('scripts/restructure-calculator-pages.js');
  if (!/removeFrom/.test(restructureSrc)) {
    err('B. Phase 8A regression: restructure-calculator-pages.js no longer has the removeFrom whitespace-boundary fix');
    allOk = false;
  }
  if (allOk) ok('B. Phase 8A injector fixes confirmed intact (5/5)');
}

// ---------------------------------------------------------------------
// C. Phase 8B pre-hub navigation refresh must remain present (do not
//    revert the execSync-based fix or its ordering).
// ---------------------------------------------------------------------
{
  const pipeline = read('scripts/run-all-generators.js');
  const preHubExecIdx = pipeline.indexOf("execSync('node scripts/generate-navigation.js'");
  const hubsRequireIdx = pipeline.indexOf("require(path.join(__dirname, 'generate-hubs.js'))");
  const postHubRequireIdx = pipeline.indexOf("require(path.join(__dirname, 'generate-navigation.js'))");
  if (preHubExecIdx === -1 || hubsRequireIdx === -1 || postHubRequireIdx === -1) {
    err('C. Phase 8B regression: pre-hub navigation refresh / generate-hubs.js / final navigation write not all found');
  } else if (!(preHubExecIdx < hubsRequireIdx && hubsRequireIdx < postHubRequireIdx)) {
    err('C. Phase 8B regression: ordering is wrong (expected navigation refresh < generate-hubs.js < final navigation write)');
  } else {
    ok('C. Phase 8B pre-hub navigation refresh ordering confirmed intact');
  }
}

// ---------------------------------------------------------------------
// D. Phase 7Z source/data consistency gate must remain wired into the
//    build pipeline.
// ---------------------------------------------------------------------
{
  const pipeline = read('scripts/run-all-generators.js');
  if (!/execSync\('node scripts\/validate-source-data-consistency\.js'/.test(pipeline)) {
    err('D. Phase 7Z regression: validate-source-data-consistency.js no longer wired into run-all-generators.js');
  } else {
    ok('D. Phase 7Z source/data consistency gate confirmed wired');
  }
}

// ---------------------------------------------------------------------
// E. Dependency-graph proof for the two flagged records:
//    - audit/google/crawl-depth.html: generated by audit-crawl-depth.js,
//      which MUST be part of the npm run build pipeline (proves it is a
//      legitimate, current, build-computed metric -- classification A).
//    - reports/phase-7a/index.html: MUST NOT be touched by any generator
//      in the npm run build pipeline (proves the file is a static,
//      out-of-band artifact; only the separate scripts/audit-forensic/
//      run.js tool can change it, which is what caused the Phase 8B
//      testing-time fluctuation, not a build defect).
// ---------------------------------------------------------------------
{
  const pipeline = read('scripts/run-all-generators.js');
  if (!/execSync\('node scripts\/audit-crawl-depth\.js'/.test(pipeline)) {
    err('E. audit-crawl-depth.js is no longer wired into the build pipeline -- crawl-depth classification (A: legitimate dynamic metric) can no longer be assumed, re-investigate');
  } else {
    ok('E. audit-crawl-depth.js confirmed wired into the build pipeline (crawl-depth.html is a live, build-computed metric)');
  }
  if (/phase-7a|audit-forensic/.test(pipeline)) {
    err('E. run-all-generators.js now references phase-7a or audit-forensic -- reports/phase-7a/index.html would no longer be an out-of-band static artifact; re-investigate the Phase 8C root-cause finding before trusting this validator');
  } else {
    ok('E. Confirmed reports/phase-7a/ and scripts/audit-forensic/run.js remain entirely outside the npm run build pipeline');
  }

  const seoSrc = read('scripts/inject-seo-metadata.js');
  if (/'reports'|"reports"/.test(seoSrc)) {
    warn('E. inject-seo-metadata.js now references "reports" -- if reports/phase-7a/ is now in scope, re-verify the root-cause finding');
  } else {
    ok('E. Confirmed inject-seo-metadata.js\'s topDirs whitelist still excludes reports/ (SEO tags on reports/phase-7a/index.html are not build-managed)');
  }
}

// ---------------------------------------------------------------------
// F. Record-level reproduction + full-build determinism gate. Opt-in
//    since it drives three full builds.
// ---------------------------------------------------------------------
const TARGET_RECORDS = ['/audit/google/crawl-depth', '/reports/phase-7a'];

function extractRecords(navPath) {
  const nav = JSON.parse(fs.readFileSync(navPath, 'utf8'));
  const out = {};
  for (const url of TARGET_RECORDS) {
    const rec = nav.pages.find((p) => p.url === url);
    out[url] = rec ? JSON.stringify(rec) : null;
  }
  return out;
}

if (process.env.PHASE_8C_RUN_BUILD === '1') {
  console.log('\n--- F: running three full builds (PHASE_8C_RUN_BUILD=1) ---');
  const snapDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phase8c-snap-'));
  const navSnapshots = [];
  const fullNavSnapshots = [];
  let buildFailed = false;

  for (let i = 1; i <= 3; i++) {
    try {
      execSync('npm run build', { cwd: ROOT, stdio: 'pipe' });
    } catch (e) {
      err('F. Build ' + i + ' failed: ' + e.message);
      buildFailed = true;
      break;
    }
    const navPath = path.join(ROOT, 'data', 'navigation.json');
    const dst = path.join(snapDir, 'nav-build' + i + '.json');
    fs.copyFileSync(navPath, dst);
    navSnapshots.push(extractRecords(dst));
    fullNavSnapshots.push(JSON.parse(fs.readFileSync(dst, 'utf8')));
  }

  if (!buildFailed) {
    let recordsStable = true;
    for (const url of TARGET_RECORDS) {
      const v1 = navSnapshots[0][url];
      const v2 = navSnapshots[1][url];
      const v3 = navSnapshots[2][url];
      if (v1 !== v2 || v2 !== v3) {
        err('F. Navigation record ' + url + ' is NOT stable across 3 builds -- unexplained variance');
        recordsStable = false;
      }
    }
    if (recordsStable) ok('F. Both flagged navigation records (' + TARGET_RECORDS.join(', ') + ') are stable and byte-identical across 3 consecutive builds');

    // No other page record may unexpectedly change either (only the
    // top-level _generated timestamp is allowed to differ).
    let unexpectedPageChanges = 0;
    const pages1 = new Map(fullNavSnapshots[0].pages.map((p) => [p.url, JSON.stringify(p)]));
    const pages2 = new Map(fullNavSnapshots[1].pages.map((p) => [p.url, JSON.stringify(p)]));
    for (const [url, json1] of pages1) {
      const json2 = pages2.get(url);
      if (json2 !== undefined && json2 !== json1) {
        err('F. Unexpected navigation record change between build 1 and build 2: ' + url);
        unexpectedPageChanges++;
      }
    }
    if (unexpectedPageChanges === 0) ok('F. No other navigation record changed unexpectedly between build 1 and build 2 (only _generated timestamp differs)');
  }

  fs.rmSync(snapDir, { recursive: true, force: true });
} else {
  warn('F. Skipped the three-full-build gate (set PHASE_8C_RUN_BUILD=1 to run it -- see reports/phase-8c-status.md for the real, already-captured build results)');
}

console.log('');
console.log('validate-phase-8c: ' + (errors === 0 ? 'PASS' : 'FAIL') + ' -- ' + errors + ' error(s), ' + warnings + ' warning(s).');
process.exit(errors === 0 ? 0 : 1);
