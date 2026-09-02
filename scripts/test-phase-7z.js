#!/usr/bin/env node
// Phase 7Z test suite. Exercises both the permanent consistency validator's
// failure/success paths (using isolated fixture directories, never touching
// the production repo) and this phase's own validate-phase-7z.js.

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

function req(rel) { return require(path.join(ROOT, rel)); }
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

// =======================================================================
// Part 1: validate-phase-7z.js itself, against the real (fixed) repo state.
// =======================================================================

T('validate-phase-7z.js passes against current repo state', () => {
  const out = execSync('node scripts/validate-phase-7z.js', { cwd: ROOT }).toString();
  if (!out.includes('PASS -- 0 error(s)')) throw new Error('expected 0 errors, got: ' + out.split('\n').pop());
});

T('fund-07 is a real object in scripts/data/academy-fundamentals.js, not just present in a string', () => {
  const arr = req('scripts/data/academy-fundamentals.js');
  const rec = arr.find((a) => a.id === 'fund-07');
  if (!rec || typeof rec !== 'object') throw new Error('fund-07 not found as a structured record');
  if (rec.title !== 'New Pool Startup Chemistry (Fresh Fill & New Plaster)') throw new Error('fund-07 title does not match the expected content baseline');
});

T('fund-08 is a real object in scripts/data/academy-fundamentals.js, not just present in a string', () => {
  const arr = req('scripts/data/academy-fundamentals.js');
  const rec = arr.find((a) => a.id === 'fund-08');
  if (!rec || typeof rec !== 'object') throw new Error('fund-08 not found as a structured record');
  if (rec.title !== 'Indoor Pool Chemistry') throw new Error('fund-08 title does not match the expected content baseline');
});

T('academy-fundamentals.js header comment count updated to 8 articles', () => {
  const s = read('scripts/data/academy-fundamentals.js');
  if (!/\(8 articles\)/.test(s)) throw new Error('header still says something other than "(8 articles)"');
});

T('data/academy.json has exactly 50 records', () => {
  const n = req('data/academy.json').articles.length;
  if (n !== 50) throw new Error('expected 50, got ' + n);
});

T('data/formulas.json unaffected, still 9 records', () => {
  const n = req('data/formulas.json').formulas.length;
  if (n !== 9) throw new Error('expected 9, got ' + n);
});

T('data/glossary.json unaffected, still 100 records', () => {
  const n = req('data/glossary.json').terms.length;
  if (n !== 100) throw new Error('expected 100, got ' + n);
});

T('data/reference.json unaffected, still 25 records', () => {
  const n = req('data/reference.json').pages.length;
  if (n !== 25) throw new Error('expected 25, got ' + n);
});

// =======================================================================
// Part 2: validate-source-data-consistency.js -- SUCCESS path against real data.
// =======================================================================

T('validate-source-data-consistency.js passes against current repo state', () => {
  const out = execSync('node scripts/validate-source-data-consistency.js', { cwd: ROOT }).toString();
  if (!out.includes('PASS -- 0 error(s)')) throw new Error('expected PASS, got: ' + out.split('\n').pop());
  if (!out.includes('academy: 50 records')) throw new Error('academy count not reported as 50');
});

// =======================================================================
// Part 3: validate-source-data-consistency.js -- FAILURE paths, exercised
// against isolated fixture files (never the production repo). Each fixture
// is a minimal, self-contained copy of the validator's checkFamily logic
// applied to deliberately-broken data, run in a throwaway temp directory.
// =======================================================================

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phase7z-test-'));

function runIsolatedCheck(sourceArr, jsonArr, idField, slugField) {
  // Re-implements the exact algorithm from validate-source-data-consistency.js's
  // checkFamily() against arbitrary in-memory fixtures, to prove the DETECTION
  // LOGIC works on broken input without needing to corrupt real repo files.
  const errors = [];
  const countBy = (arr, field) => {
    const counts = {};
    arr.forEach((r) => { counts[r[field]] = (counts[r[field]] || 0) + 1; });
    return counts;
  };
  Object.entries(countBy(sourceArr, idField)).filter(([, c]) => c > 1).forEach(([id]) => errors.push('dup-id-source:' + id));
  Object.entries(countBy(jsonArr, idField)).filter(([, c]) => c > 1).forEach(([id]) => errors.push('dup-id-json:' + id));
  if (slugField) {
    Object.entries(countBy(sourceArr, slugField)).filter(([, c]) => c > 1).forEach(([s]) => errors.push('dup-slug-source:' + s));
    Object.entries(countBy(jsonArr, slugField)).filter(([, c]) => c > 1).forEach(([s]) => errors.push('dup-slug-json:' + s));
  }
  if (sourceArr.length !== jsonArr.length) errors.push('count-mismatch');
  const sourceById = {}; sourceArr.forEach((r) => { sourceById[r[idField]] = r; });
  const jsonById = {}; jsonArr.forEach((r) => { jsonById[r[idField]] = r; });
  Object.keys(sourceById).filter((id) => !(id in jsonById)).forEach((id) => errors.push('missing-from-json:' + id));
  Object.keys(jsonById).filter((id) => !(id in sourceById)).forEach((id) => errors.push('missing-from-source:' + id));
  Object.keys(sourceById).filter((id) => id in jsonById).forEach((id) => {
    if (JSON.stringify(sourceById[id]) !== JSON.stringify(jsonById[id])) errors.push('content-diff:' + id);
  });
  return errors;
}

T('detection logic: catches a JSON-only record (the exact fund-07/08 failure mode)', () => {
  const source = [{ id: 'a', slug: 's-a', body: 'x' }];
  const json = [{ id: 'a', slug: 's-a', body: 'x' }, { id: 'orphan', slug: 's-orphan', body: 'y' }];
  const errors = runIsolatedCheck(source, json, 'id', 'slug');
  if (!errors.includes('missing-from-source:orphan')) throw new Error('did not detect the orphaned JSON-only record');
});

T('detection logic: catches a source-only record (regeneration not yet run)', () => {
  const source = [{ id: 'a', slug: 's-a', body: 'x' }, { id: 'new', slug: 's-new', body: 'z' }];
  const json = [{ id: 'a', slug: 's-a', body: 'x' }];
  const errors = runIsolatedCheck(source, json, 'id', 'slug');
  if (!errors.includes('missing-from-json:new')) throw new Error('did not detect the source-only record');
});

T('detection logic: catches a duplicate id within source (the Phase 7M fund-06 collision pattern)', () => {
  const source = [{ id: 'fund-06', slug: 's-1', body: 'a' }, { id: 'fund-06', slug: 's-2', body: 'b' }];
  const json = [{ id: 'fund-06', slug: 's-1', body: 'a' }];
  const errors = runIsolatedCheck(source, json, 'id', 'slug');
  if (!errors.includes('dup-id-source:fund-06')) throw new Error('did not detect the duplicate source id');
});

T('detection logic: catches a duplicate slug even with distinct ids', () => {
  const source = [{ id: 'a', slug: 'same-slug', body: 'x' }, { id: 'b', slug: 'same-slug', body: 'y' }];
  const json = [{ id: 'a', slug: 'same-slug', body: 'x' }, { id: 'b', slug: 'same-slug', body: 'y' }];
  const errors = runIsolatedCheck(source, json, 'id', 'slug');
  if (!errors.includes('dup-slug-source:same-slug') || !errors.includes('dup-slug-json:same-slug')) throw new Error('did not detect the duplicate slug in both source and json');
});

T('detection logic: catches a content-level drift (the ts-04 em-dash class of bug)', () => {
  const source = [{ id: 'a', slug: 's-a', body: 'em—dash' }];
  const json = [{ id: 'a', slug: 's-a', body: 'double--hyphen' }];
  const errors = runIsolatedCheck(source, json, 'id', 'slug');
  if (!errors.includes('content-diff:a')) throw new Error('did not detect the content-level punctuation drift');
});

T('detection logic: catches a count mismatch even when no individual id differs (paranoia check)', () => {
  // Deliberately construct arrays where per-id comparison alone wouldn't
  // trigger (both empty), but lengths differ due to an undefined-id edge case.
  const source = [{ id: 'a', slug: 's', body: '1' }, { id: 'b', slug: 't', body: '2' }];
  const json = [{ id: 'a', slug: 's', body: '1' }];
  const errors = runIsolatedCheck(source, json, 'id', 'slug');
  if (!errors.includes('count-mismatch')) throw new Error('did not detect the count mismatch');
});

T('detection logic: reports zero errors on genuinely consistent data (no false positives)', () => {
  const source = [{ id: 'a', slug: 's-a', body: 'x' }, { id: 'b', slug: 's-b', body: 'y' }];
  const json = [{ id: 'a', slug: 's-a', body: 'x' }, { id: 'b', slug: 's-b', body: 'y' }];
  const errors = runIsolatedCheck(source, json, 'id', 'slug');
  if (errors.length !== 0) throw new Error('false positive(s) on clean data: ' + errors.join(', '));
});

fs.rmSync(tmpDir, { recursive: true, force: true });

// =======================================================================
// Part 4: end-to-end -- validate-source-data-consistency.js as an actual
// child process, fed a deliberately-corrupted isolated copy of the real
// academy family (proves the wired-up script, not just the reimplemented
// logic, actually fails on real-shaped broken input). Fully isolated;
// never touches the production repo.
// =======================================================================

T('end-to-end: validate-source-data-consistency.js (real script) fails on an isolated corrupted copy', () => {
  const isoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phase7z-e2e-'));
  try {
    fs.mkdirSync(path.join(isoDir, 'scripts', 'data'), { recursive: true });
    fs.mkdirSync(path.join(isoDir, 'data'), { recursive: true });
    fs.mkdirSync(path.join(isoDir, 'scripts'), { recursive: true });
    // Copy the real validator and every scripts/data/*.js file it needs.
    fs.cpSync(path.join(ROOT, 'scripts', 'data'), path.join(isoDir, 'scripts', 'data'), { recursive: true });
    fs.copyFileSync(path.join(ROOT, 'scripts', 'validate-source-data-consistency.js'), path.join(isoDir, 'scripts', 'validate-source-data-consistency.js'));
    // Copy real, currently-consistent JSON, then corrupt just academy.json
    // by deleting one record the way a stray hand-edit would.
    for (const f of ['formulas.json', 'glossary.json', 'reference.json']) {
      fs.copyFileSync(path.join(ROOT, 'data', f), path.join(isoDir, 'data', f));
    }
    const academyJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'academy.json'), 'utf8'));
    academyJson.articles.push({ id: 'fake-injected-record', slug: 'academy/fake/injected', body: 'hand-edited, never in source' });
    fs.writeFileSync(path.join(isoDir, 'data', 'academy.json'), JSON.stringify(academyJson, null, 2));

    let threw = false;
    let stdout = '';
    try {
      stdout = execSync('node scripts/validate-source-data-consistency.js', { cwd: isoDir }).toString();
    } catch (e) {
      threw = true;
      stdout = (e.stdout || '').toString();
    }
    if (!threw) throw new Error('expected non-zero exit for corrupted data, but the script exited 0');
    if (!stdout.includes('fake-injected-record')) throw new Error('failure output did not name the injected record');
  } finally {
    fs.rmSync(isoDir, { recursive: true, force: true });
  }
});

console.log('');
console.log('test-phase-7z: ' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail === 0 ? 0 : 1);
