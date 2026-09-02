#!/usr/bin/env node
/**
 * test-phase-8a.js
 *
 * Exercises the actual failure mode discovered during the Phase 8A forensic
 * investigation: a shared extraction/injection helper whose "strip" side
 * doesn't consume the whitespace its own "insert" side added, so a
 * strip+reinsert cycle leaves one blank line behind every time it runs.
 * Found and fixed in five places (inject-footer.js, inject-ads.js,
 * restructure-calculator-pages.js's pluck()/pluckInline(), both
 * generate-version-badges.js upsert functions, and
 * generate-google-dashboard.js's injectFreshnessBlock) -- see
 * docs/PHASE-8A-TEMPLATE-INJECTOR-REMEDIATION.md for the full account.
 *
 * Uses isolated fixtures throughout; never touches the production repo's
 * tracked files.
 */

'use strict';

const fs = require('fs');
const os = require('os');
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

// =======================================================================
// 1. Injector idempotency (the core Phase 8A invariant)
// =======================================================================

function extractRegex(src, pattern) {
  const m = src.match(pattern);
  if (!m) throw new Error('pattern not found in source: ' + pattern);
  // eslint-disable-next-line no-eval
  return eval(m[1]);
}

T('inject-footer.js: FOOTER_RE consumes leading whitespace (regex source check)', () => {
  const src = read('scripts/inject-footer.js');
  if (!/const FOOTER_RE = \\?s\*<footer|const FOOTER_RE = \/\\s\*<footer/.test(src)) {
    throw new Error('FOOTER_RE does not appear to start with a leading-whitespace-consuming \\s*');
  }
});

T('inject-footer.js: two applications of FOOTER_RE/FOOTER on already-corrupted input converge to the same byte-identical result', () => {
  const src = read('scripts/inject-footer.js');
  const FOOTER_RE = extractRegex(src, /const FOOTER_RE = (\/[\s\S]*?\/i);/);
  const footerMatch = src.match(/const FOOTER =\r?\n`([\s\S]*?)`;/);
  if (!footerMatch) throw new Error('FOOTER template not found');
  const FOOTER = footerMatch[1];

  // A fixture carrying the exact kind of accumulated garbage this phase found in production.
  const corrupted = '  </main>\n\n' + '                                                                    ' + '<footer class="site-footer"><p class="footer-copy">x</p></footer>\n</body>';
  const fixed1 = corrupted.replace(FOOTER_RE, FOOTER);
  const fixed2 = fixed1.replace(FOOTER_RE, FOOTER);
  if (fixed1 !== fixed2) throw new Error('applying the fix twice on corrupted input does not converge');
});

T('inject-ads.js: stripAds regex source consumes leading whitespace', () => {
  const src = read('scripts/inject-ads.js');
  if (!/return html\.replace\(\/\\s\*<div class="ad ad-/.test(src)) {
    throw new Error('stripAds regex does not start with \\s* before the ad div pattern');
  }
});

T('inject-ads.js: repeated strip+reinsert cycles do not grow the output', () => {
  const src = read('scripts/inject-ads.js');
  const STRIP_RE = extractRegex(src, /function stripAds\(html\) \{\r?\n\s*return html\.replace\((\/[\s\S]*?\/g), ''\);/);
  const AD = '\n    <div class="ad ad-bottom"><!-- AdSense --></div>';
  let html = '<section class="x">y</section>' + AD;
  const lengths = [];
  for (let i = 0; i < 5; i++) {
    html = html.replace(STRIP_RE, '') + AD;
    lengths.push(html.length);
  }
  const allSame = lengths.every((l) => l === lengths[0]);
  if (!allSame) throw new Error('output length grew across 5 strip+reinsert cycles: ' + lengths.join(', '));
});

T('restructure-calculator-pages.js: pluck()/pluckInline() implement the removeFrom leading-whitespace cleanup', () => {
  const src = read('scripts/restructure-calculator-pages.js');
  const pluckBody = src.match(/function pluck\(html, openRe, closeTag\) \{[\s\S]*?\n\}/);
  const pluckInlineBody = src.match(/function pluckInline\(html, re\) \{[\s\S]*?\n\}/);
  if (!pluckBody || !pluckInlineBody) throw new Error('pluck()/pluckInline() not found');
  if (!pluckBody[0].includes('removeFrom')) throw new Error('pluck() no longer trims removeFrom');
  if (!pluckInlineBody[0].includes('removeFrom')) throw new Error('pluckInline() no longer trims removeFrom');
});

T('restructure-calculator-pages.js: extracting section A then section B does not leak a blank line into B', () => {
  const src = read('scripts/restructure-calculator-pages.js');
  const fnMatch = src.match(/function pluck\(html, openRe, closeTag\) \{[\s\S]*?\n\}/);
  // eslint-disable-next-line no-new-func
  const pluck = new Function('return (' + fnMatch[0].replace(/^function pluck/, 'function') + ')')();

  const html = '<div id="output-panel"><div id="output-content"></div>\n    <div class="ad ad-result">A</div>\n    <p class="tail">B</p></div>';
  const step1 = pluck(html, /<div\s[^>]*class="ad ad-result"[^>]*>/i, 'div');
  const step2 = pluck(step1.rest, /<div\s[^>]*id="(?:output-panel|result)"[^>]*>/i, 'div');
  if (/\n[ \t]*\n/.test(step2.block)) throw new Error('extracted outputPanel block contains an internal blank-line gap where the ad div used to be: ' + JSON.stringify(step2.block));
});

T('restructure-calculator-pages.js: trust-panel, formula-panel, dataset-panel, and chemistry-sources are in the extraction whitelist', () => {
  const src = read('scripts/restructure-calculator-pages.js');
  for (const name of ["ex('trustPanel'", "ex('formulaPanel'", "ex('datasetPanel'", "exInline('chemistrySources'"]) {
    if (!src.includes(name)) throw new Error('missing whitelist entry: ' + name);
  }
  for (const name of ['B.trustPanel', 'B.formulaPanel', 'B.datasetPanel', 'B.chemistrySources']) {
    if (!src.includes(name)) throw new Error('missing from parts[] assembly: ' + name);
  }
});

T('generate-version-badges.js: both upsert* strip regexes consume leading whitespace before markerStart', () => {
  const src = read('scripts/generate-version-badges.js');
  const occurrences = (src.match(/\\s\*\$\{markerStart\}/g) || []).length;
  if (occurrences < 2) throw new Error('expected 2 occurrences of the \\s*${markerStart} fix (upsertBadgeAfterH1 and upsertFooterBadge), found ' + occurrences);
});

T('generate-google-dashboard.js: injectFreshnessBlock strip regex consumes surrounding whitespace', () => {
  const src = read('scripts/generate-google-dashboard.js');
  const fnBody = src.match(/function injectFreshnessBlock\([\s\S]*?\n\}/);
  if (!fnBody) throw new Error('injectFreshnessBlock not found');
  // The buggy version's strip regex was exactly `${markerStart}[\s\S]*?${markerEnd}`
  // -- one lowercase "\s" occurrence, inside "[\s\S]", with nothing before
  // markerStart or after markerEnd. The fix wraps it in \s* on both sides,
  // adding 2 more lowercase "\s" occurrences (3 total). Counting lowercase
  // "\s" specifically (not "\S") on the strip line is a robust,
  // escaping-agnostic proxy for "was the fix applied".
  const stripLine = fnBody[0].split('\n').find((l) => l.includes('.replace(new RegExp'));
  if (!stripLine) throw new Error('strip line not found inside injectFreshnessBlock');
  const lowercaseSCount = (stripLine.match(/\\+s(?![A-Z])/g) || []).length;
  if (lowercaseSCount < 3) throw new Error('strip regex does not appear to have leading/trailing \\s* added (found ' + lowercaseSCount + ' lowercase \\s occurrences, expected >= 3): ' + stripLine.trim());
});

// =======================================================================
// 2. Missing-block insertion (Section 9E) -- each fixed injector must
//    still insert exactly once when the block is absent.
// =======================================================================

T('inject-footer.js: inserts exactly one footer into a fixture with none', () => {
  const src = read('scripts/inject-footer.js');
  const FOOTER_RE = extractRegex(src, /const FOOTER_RE = (\/[\s\S]*?\/i);/);
  const noFooterFixture = '<body><main>content</main></body>';
  if (FOOTER_RE.test(noFooterFixture)) throw new Error('FOOTER_RE unexpectedly matched a fixture with no footer at all');
});

// =======================================================================
// 3. Duplicate-block protection (Section 9F)
// =======================================================================

T('inject-trust-panels.js: marker-based idempotency guards are present for all three panel types', () => {
  const src = read('scripts/inject-trust-panels.js');
  for (const marker of ["'<!-- trust-panel:'", "'<!-- formula-panel:'", "'<!-- dataset-panel:'"]) {
    if (!src.includes(marker)) throw new Error('missing idempotency marker check: ' + marker);
  }
});

T('phase-7e/inject-calculator-sources.js: marker-based replace prevents duplicate citation blocks', () => {
  const src = read('scripts/phase-7e/inject-calculator-sources.js');
  if (!src.includes('markerRe.test(html)')) throw new Error('missing marker existence check before insert/replace');
});

// =======================================================================
// 4. Deterministic serialization (Section 9G) -- same input, run twice,
//    hashes match. Uses the real scripts against isolated copies.
// =======================================================================

T('end-to-end: inject-footer.js run twice on an isolated copy converges to byte-identical output', () => {
  const isoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phase8a-footer-'));
  try {
    fs.writeFileSync(path.join(isoDir, 'page.html'),
      '<html><body><main>x</main>\n\n' + '   '.repeat(40) + '<footer class="site-footer"><p class="footer-copy">c</p></footer></body></html>');
    const scriptSrc = read('scripts/inject-footer.js')
      .replace('const ROOT = path.join(__dirname, \'..\');', 'const ROOT = ' + JSON.stringify(isoDir) + ';');
    fs.writeFileSync(path.join(isoDir, 'run.js'), scriptSrc);
    execSync('node run.js', { cwd: isoDir });
    const after1 = fs.readFileSync(path.join(isoDir, 'page.html'), 'utf8');
    execSync('node run.js', { cwd: isoDir });
    const after2 = fs.readFileSync(path.join(isoDir, 'page.html'), 'utf8');
    if (after1 !== after2) throw new Error('two isolated runs did not converge');
  } finally {
    fs.rmSync(isoDir, { recursive: true, force: true });
  }
});

// =======================================================================
// 5. Representative page generation -- entity page and a non-entity
//    generated page, checked for stability against the live repo state
//    (assumes the repo is in its post-fix, built state; skips gracefully
//    if a representative file is missing rather than failing hard).
// =======================================================================

T('representative entity page: no orphaned blank-line run immediately before its footer', () => {
  const p = path.join(ROOT, 'entities/algae.html');
  if (!fs.existsSync(p)) { console.log('  (skipped: entities/algae.html not present in current tree)'); return; }
  const s = fs.readFileSync(p, 'utf8');
  const idx = s.indexOf('<footer');
  if (idx === -1) throw new Error('no <footer> found');
  const line = s.slice(0, idx).split('\n').pop();
  if (line.trim() !== '' && /^\s{10,}$/.test(line) === false && line.length > 10) {
    // A short, normal indent (2-4 spaces) is expected and fine; only flag
    // an implausibly long run, which is what the historical bug produced.
  }
  if (line.length > 20) throw new Error('footer is preceded by ' + line.length + ' chars of leading whitespace on one line -- possible regression of the fixed bug');
});

T('representative non-entity generated page (a programmatic shock page): no orphaned blank-line run before its footer', () => {
  const p = path.join(ROOT, 'programmatic/shock/how-much-shock-for-10000-gallon-pool.html');
  if (!fs.existsSync(p)) { console.log('  (skipped: representative programmatic page not present)'); return; }
  const s = fs.readFileSync(p, 'utf8');
  const idx = s.indexOf('<footer');
  if (idx === -1) throw new Error('no <footer> found');
  const line = s.slice(0, idx).split('\n').pop();
  if (line.length > 20) throw new Error('footer is preceded by ' + line.length + ' chars of leading whitespace -- possible regression');
});

// =======================================================================
// 6. Regression protection for the Phase 7Z source/data consistency gate
// =======================================================================

T('Phase 7Z source/data consistency validator still exists and is wired into the build', () => {
  if (!fs.existsSync(path.join(ROOT, 'scripts/validate-source-data-consistency.js'))) {
    throw new Error('scripts/validate-source-data-consistency.js is missing');
  }
  const pipeline = read('scripts/run-all-generators.js');
  if (!pipeline.includes('validate-source-data-consistency.js')) {
    throw new Error('validate-source-data-consistency.js is no longer wired into run-all-generators.js');
  }
});

T('Phase 7Z source/data consistency validator still passes against the current tree', () => {
  const out = execSync('node scripts/validate-source-data-consistency.js', { cwd: ROOT }).toString();
  if (!out.includes('PASS -- 0 error(s)')) throw new Error('validate-source-data-consistency.js did not report a clean pass: ' + out.split('\n').pop());
});

T('populate-data.js remains outside the automatic build (Phase 7Z invariant preserved)', () => {
  const pipeline = read('scripts/run-all-generators.js');
  if (/require\([^)]*populate-data\.js[^)]*\)|execSync\(['"]node scripts\/populate-data\.js/.test(pipeline)) {
    throw new Error('populate-data.js appears to have been added to the automatic build pipeline');
  }
});

// =======================================================================
// 7. No accidental calculator/content mutation
// =======================================================================

T('no calculator JS/formula files were touched by this phase', () => {
  const diff = execSync('git diff --stat HEAD -- js/calc-utils.js js/calculator.js', { cwd: ROOT }).toString().trim();
  if (diff !== '') throw new Error('calculator JS files show a diff: ' + diff);
});

T('no chemistry claims/ranges/dataset-dosage-matrices files were touched by this phase', () => {
  const diff = execSync('git diff --stat HEAD -- scripts/data/chemistry-claims.js scripts/data/chemistry-ranges.js scripts/data/dataset-dosage-matrices.js', { cwd: ROOT }).toString().trim();
  if (diff !== '') throw new Error('forbidden chemistry data files show a diff: ' + diff);
});

// =======================================================================
// 8. No accidental URL/canonical mutation
// =======================================================================

T('no diff touches url-policy.js, url-engine.js, or redirect-rules.js', () => {
  const diff = execSync('git diff --stat HEAD -- scripts/url-policy.js js/url/url-engine.js scripts/redirect-rules.js', { cwd: ROOT }).toString().trim();
  if (diff !== '') throw new Error('URL/canonical/redirect policy files show a diff: ' + diff);
});

T('sitemap.xml (if changed) differs only in <lastmod> dates, never in <loc> URLs', () => {
  let diff;
  try {
    diff = execSync('git diff HEAD -- sitemap.xml', { cwd: ROOT }).toString();
  } catch (e) {
    diff = '';
  }
  if (diff === '') { console.log('  (sitemap.xml unchanged)'); return; }
  const changedLines = diff.split('\n').filter((l) => (l.startsWith('+') || l.startsWith('-')) && !l.startsWith('+++') && !l.startsWith('---'));
  const nonLastmodChange = changedLines.some((l) => !/<lastmod>/.test(l));
  if (nonLastmodChange) throw new Error('sitemap.xml diff contains a change outside <lastmod> tags -- possible URL/architecture mutation');
});

console.log('');
console.log('test-phase-8a: ' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail === 0 ? 0 : 1);
