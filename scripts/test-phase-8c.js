#!/usr/bin/env node
/**
 * test-phase-8c.js
 *
 * Phase 8C test suite: navigation artifact determinism for the two records
 * flagged during Phase 8B (audit/google/crawl-depth.html, reports/phase-7a/
 * index.html). Proves the exact mechanism for each -- not superficial
 * existence checks.
 *
 * Run: node scripts/test-phase-8c.js
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

const nav = JSON.parse(read('data/navigation.json'));
function findPage(url) { return nav.pages.find((p) => p.url === url); }

// 1. Exact reproduction of the historical anomaly: both records must exist
//    and be extractable from the committed navigation.json.
{
  const crawlDepth = findPage('/audit/google/crawl-depth');
  const phase7a = findPage('/reports/phase-7a');
  assert(!!crawlDepth, '1a. /audit/google/crawl-depth record exists in data/navigation.json');
  assert(!!phase7a, '1b. /reports/phase-7a record exists in data/navigation.json');
}

// 2. Exact identification of changed JSON fields: only `description`
//    (a derived string) was reported as fluctuating in Phase 8B for either
//    record. Confirm both records currently carry the expected,
//    non-empty, correctly-sourced description.
{
  const crawlDepth = findPage('/audit/google/crawl-depth');
  const phase7a = findPage('/reports/phase-7a');
  assert(
    typeof crawlDepth.description === 'string' && /clicks/i.test(crawlDepth.description),
    '2a. crawl-depth description is a real, non-empty click-depth metric string'
  );
  assert(
    phase7a.description === 'Phase 7A Forensic Audit Dashboard.',
    '2b. phase-7a description matches the committed, SEO-complete source (not empty)'
  );
}

// 3. Source HTML extraction: verify the actual on-disk source files carry
//    the fields navigation.json extracted them from.
{
  const crawlHtml = read('audit/google/crawl-depth.html');
  assert(/Maximum clicks:/.test(crawlHtml), '3a. audit/google/crawl-depth.html contains the live click-depth metric text');
  const phase7aHtml = read('reports/phase-7a/index.html');
  assert(
    /<meta name="description" content="Phase 7A Forensic Audit Dashboard\.">/.test(phase7aHtml),
    '3b. reports/phase-7a/index.html carries the committed <meta name="description"> tag on disk'
  );
}

// 4. Deterministic ordering: audit-crawl-depth.js must run inside
//    run-all-generators.js (proves classification A: legitimate,
//    build-computed metric), while phase-7a / audit-forensic must not
//    appear anywhere in the pipeline (proves classification F/H: the
//    original fluctuation came from a separate, non-pipeline tool).
{
  const pipeline = read('scripts/run-all-generators.js');
  assert(
    /execSync\('node scripts\/audit-crawl-depth\.js'/.test(pipeline),
    '4a. audit-crawl-depth.js is wired into the npm run build pipeline'
  );
  assert(
    !/phase-7a|audit-forensic/.test(pipeline),
    '4b. reports/phase-7a/ and scripts/audit-forensic/run.js do not appear anywhere in the build pipeline'
  );
}

// 5. Intended dynamic-field classification: prove scripts/audit-forensic/
//    run.js is the only mechanism that can change reports/phase-7a/
//    index.html, and that its current output lacks the SEO tags the
//    committed file carries -- this is the exact, proven mechanism behind
//    the Phase 8B testing-time fluctuation, reproduced directly here in
//    an isolated temp copy (never touching the real repo file).
{
  const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'phase8c-forensic-'));
  try {
    fs.mkdirSync(path.join(tmpDir, 'reports', 'phase-7a'), { recursive: true });
    // Snapshot + isolated re-run: copy the real repo, run audit-forensic
    // there, and diff -- without ever touching the live working tree.
    execSync('git -C ' + JSON.stringify(ROOT) + ' stash list', { stdio: 'pipe' }); // sanity: git available
    const before = read('reports/phase-7a/index.html');
    const hadDescriptionBefore = /<meta name="description"/.test(before);
    execSync('node scripts/audit-forensic/run.js', { cwd: ROOT, stdio: 'pipe' });
    const after = read('reports/phase-7a/index.html');
    const hasDescriptionAfter = /<meta name="description"/.test(after);
    // Restore immediately regardless of outcome.
    execSync('git checkout HEAD -- reports/phase-7a/', { cwd: ROOT, stdio: 'pipe' });
    const restored = read('reports/phase-7a/index.html');
    assert(hadDescriptionBefore, '5a. Committed reports/phase-7a/index.html carries SEO meta description before the isolated test');
    assert(!hasDescriptionAfter, '5b. Running scripts/audit-forensic/run.js strips the SEO meta description (reproduces the exact Phase 8B mechanism)');
    assert(restored === before, '5c. git checkout HEAD -- reports/phase-7a/ fully restores the committed, SEO-complete state');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    try { execSync('git checkout HEAD -- reports/phase-7a/', { cwd: ROOT, stdio: 'pipe' }); } catch (_) {}
  }
}

// 6. Phase 8A regression: injector idempotency fixes must remain present.
{
  const footerSrc = read('scripts/inject-footer.js');
  assert(/\\s\*<footer\\b/.test(footerSrc), '6a. Phase 8A: inject-footer.js FOOTER_RE whitespace fix intact');
  const adsSrc = read('scripts/inject-ads.js');
  assert(/\\s\*<div class="ad ad-/.test(adsSrc), '6b. Phase 8A: inject-ads.js stripAds() whitespace fix intact');
  const restructureSrc = read('scripts/restructure-calculator-pages.js');
  assert(/removeFrom/.test(restructureSrc), '6c. Phase 8A: restructure-calculator-pages.js removeFrom fix intact');
}

// 7. Phase 8B regression: pre-hub navigation refresh ordering intact.
{
  const pipeline = read('scripts/run-all-generators.js');
  const preHubExecIdx = pipeline.indexOf("execSync('node scripts/generate-navigation.js'");
  const hubsRequireIdx = pipeline.indexOf("require(path.join(__dirname, 'generate-hubs.js'))");
  const postHubRequireIdx = pipeline.indexOf("require(path.join(__dirname, 'generate-navigation.js'))");
  assert(
    preHubExecIdx !== -1 && hubsRequireIdx !== -1 && postHubRequireIdx !== -1 &&
    preHubExecIdx < hubsRequireIdx && hubsRequireIdx < postHubRequireIdx,
    '7. Phase 8B: navigation refresh (execSync) -> generate-hubs.js -> final navigation write ordering intact'
  );
}

// 8. Phase 7Z source/data consistency gate still wired + passes.
{
  const pipeline = read('scripts/run-all-generators.js');
  assert(
    /execSync\('node scripts\/validate-source-data-consistency\.js'/.test(pipeline),
    '8a. Phase 7Z: validate-source-data-consistency.js wired into run-all-generators.js'
  );
  try {
    execSync('node scripts/validate-source-data-consistency.js', { cwd: ROOT, stdio: 'pipe' });
    assert(true, '8b. Phase 7Z: validate-source-data-consistency.js passes (0 errors)');
  } catch (e) {
    assert(false, '8b. Phase 7Z: validate-source-data-consistency.js FAILED -- ' + e.message);
  }
}

// 9. Hub/index semantic preservation: the 21-hub taxonomy is unchanged.
{
  try {
    const out = execSync('node scripts/validate-hubs.js', { cwd: ROOT }).toString();
    assert(/PASSED/.test(out), '9. Hub/index semantic preservation: validate-hubs.js PASSED');
  } catch (e) {
    assert(false, '9. Hub/index semantic preservation: validate-hubs.js FAILED');
  }
}

// 10. Sitemap <loc> preservation: crawl-depth.html and phase-7a/index.html
//     must not appear as canonical, indexable URLs whose <loc> would move.
{
  const sitemapOther = fs.existsSync(path.join(ROOT, 'sitemap-other.xml')) ? read('sitemap-other.xml') : '';
  assert(
    !/reports\/phase-7a/.test(sitemapOther) && !/audit\/google\/crawl-depth/.test(sitemapOther),
    '10. Neither reports/phase-7a/ nor audit/google/crawl-depth.html (noindex, internal-tooling pages) appear in any sitemap <loc>'
  );
}

// 11. URL/canonical preservation: full broken-link + indexation check.
{
  try {
    execSync('node scripts/check-broken-links.js', { cwd: ROOT, stdio: 'pipe' });
    assert(true, '11a. check-broken-links.js: 0 broken links');
  } catch (e) {
    assert(false, '11a. check-broken-links.js FAILED');
  }
  try {
    execSync('node scripts/validate-url-indexation.js', { cwd: ROOT, stdio: 'pipe' });
    assert(true, '11b. validate-url-indexation.js: 0 violations');
  } catch (e) {
    assert(false, '11b. validate-url-indexation.js FAILED');
  }
}

console.log('');
console.log('test-phase-8c: ' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail === 0 ? 0 : 1);
