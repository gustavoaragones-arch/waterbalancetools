#!/usr/bin/env node
// Phase 7Y test suite -- covers the validator and the critical academy
// reconciliation logic independently (re-deriving facts rather than trusting
// the validator's own arithmetic).

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let pass = 0;
let fail = 0;

function req(rel) { return require(path.join(ROOT, rel)); }
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

// 1. The validator itself passes.
T('validate-phase-7y.js exits 0 (PASS)', () => {
  execSync('node scripts/validate-phase-7y.js', { cwd: ROOT });
});

// 2. Independent re-derivation: exactly 48 academy source records exist.
T('academy source files independently sum to 48 records', () => {
  const files = ['academy-equipment', 'academy-fundamentals', 'academy-hot-tubs', 'academy-sanitizers',
    'academy-testing', 'academy-troubleshooting', 'academy-vacation-rentals', 'academy-water-balance'];
  let total = 0;
  files.forEach((f) => { total += req('scripts/data/' + f + '.js').length; });
  if (total !== 48) throw new Error('expected 48, got ' + total);
});

// 3. Independent re-derivation: data/academy.json has exactly 50 records.
T('data/academy.json independently confirmed at 50 records', () => {
  const n = req('data/academy.json').articles.length;
  if (n !== 50) throw new Error('expected 50, got ' + n);
});

// 4. The exact 2-record gap is fund-07 and fund-08, nothing else.
T('exactly fund-07 and fund-08 are source-missing, independently re-derived', () => {
  const files = ['academy-equipment', 'academy-fundamentals', 'academy-hot-tubs', 'academy-sanitizers',
    'academy-testing', 'academy-troubleshooting', 'academy-vacation-rentals', 'academy-water-balance'];
  const sourceIds = new Set();
  files.forEach((f) => req('scripts/data/' + f + '.js').forEach((a) => sourceIds.add(a.id)));
  const jsonOnly = req('data/academy.json').articles.filter((a) => !sourceIds.has(a.id)).map((a) => a.id).sort();
  const expected = ['fund-07', 'fund-08'];
  if (JSON.stringify(jsonOnly) !== JSON.stringify(expected)) {
    throw new Error('expected exactly ' + expected.join(',') + ', got ' + jsonOnly.join(','));
  }
});

// 5. fund-07 and fund-08 both have live HTML pages.
T('fund-07 and fund-08 both have live rendered HTML pages', () => {
  const json = req('data/academy.json');
  const fund07 = json.articles.find((a) => a.id === 'fund-07');
  const fund08 = json.articles.find((a) => a.id === 'fund-08');
  const p07 = path.join(ROOT, fund07.slug + '.html');
  const p08 = path.join(ROOT, fund08.slug + '.html');
  if (!fs.existsSync(p07)) throw new Error('fund-07 HTML page missing: ' + p07);
  if (!fs.existsSync(p08)) throw new Error('fund-08 HTML page missing: ' + p08);
});

// 6. academy-fundamentals.js has exactly one commit in its history (root-cause evidence).
T('scripts/data/academy-fundamentals.js has exactly 1 commit in git history', () => {
  const out = execSync('git log --oneline -- scripts/data/academy-fundamentals.js', { cwd: ROOT }).toString().trim();
  const lines = out.split('\n').filter(Boolean);
  if (lines.length !== 1) throw new Error('expected exactly 1 commit, found ' + lines.length + ': ' + out);
});

// 7. fund-07 was introduced in the Phase 7P commit, fund-08 in the Phase 7Q commit.
T('git history confirms fund-07 introduced in 2a3a682, fund-08 in ae751ca', () => {
  const out07 = execSync('git log --all -S"fund-07" --format=%H -- data/academy.json', { cwd: ROOT }).toString().trim();
  const out08 = execSync('git log --all -S"fund-08" --format=%H -- data/academy.json', { cwd: ROOT }).toString().trim();
  if (!out07.includes('2a3a682')) throw new Error('fund-07 not found introduced in expected commit 2a3a682; got: ' + out07);
  if (!out08.includes('ae751ca')) throw new Error('fund-08 not found introduced in expected commit ae751ca; got: ' + out08);
});

// 8. populate-data.js is confirmed NOT part of run-all-generators.js (npm run build).
T('populate-data.js is not referenced by run-all-generators.js', () => {
  const s = fs.readFileSync(path.join(ROOT, 'scripts/run-all-generators.js'), 'utf8');
  if (s.includes('populate-data')) throw new Error('run-all-generators.js unexpectedly references populate-data.js');
});

// 9. populate-data.js's header still contains the documented contradiction (confirms the finding is current, not stale).
T("populate-data.js's header comment still contains the source-of-truth contradiction", () => {
  const s = fs.readFileSync(path.join(ROOT, 'scripts/populate-data.js'), 'utf8');
  if (!s.includes('permanent source of truth')) throw new Error('expected contradictory header comment not found -- has populate-data.js been modified?');
});

// 10. formulas/glossary/reference remain clean (0 orphans either direction).
T('formulas/glossary/reference remain source/JSON clean', () => {
  function clean(srcArr, jsonArr, idField) {
    const srcIds = new Set(srcArr.map((r) => r[idField]));
    const jsonIds = new Set(jsonArr.map((r) => r[idField]));
    const jsonOnly = [...jsonIds].filter((id) => !srcIds.has(id));
    const srcOnly = [...srcIds].filter((id) => !jsonIds.has(id));
    return jsonOnly.length === 0 && srcOnly.length === 0;
  }
  if (!clean(req('scripts/data/formulas-data.js'), req('data/formulas.json').formulas, 'id')) throw new Error('formulas drift detected');
  if (!clean(req('scripts/data/glossary-terms.js'), req('data/glossary.json').terms, 'id')) throw new Error('glossary drift detected');
  if (!clean(req('scripts/data/reference-pages.js'), req('data/reference.json').pages, 'id')) throw new Error('reference drift detected');
});

// 11. No production content file was modified this phase.
T('zero production content changes this phase (only reports/phase-7y and the 2 new scripts)', () => {
  const out = execSync('git status --porcelain', { cwd: ROOT }).toString().trim();
  if (out === '') return; // nothing changed yet (scripts not yet written to disk in this exact moment) -- also valid
  const lines = out.split('\n');
  const approved = ['reports/phase-7y/', 'scripts/validate-phase-7y.js', 'scripts/test-phase-7y.js'];
  const bad = lines.filter((l) => !approved.some((p) => l.slice(3).startsWith(p)));
  if (bad.length > 0) throw new Error('unexpected changes: ' + bad.join('; '));
});

// 12. All 15 required report artifacts exist.
T('all 15 required reports/phase-7y/* artifacts exist', () => {
  const required = ['BASELINE.md', 'ACADEMY-RECONCILIATION.csv', 'DATA-PIPELINE-INVENTORY.csv',
    'SOURCE-OF-TRUTH-MATRIX.csv', 'POPULATE-DATA-AUDIT.md', 'BUILD-PIPELINE.md',
    'GLOBAL-DRIFT-AUDIT.csv', 'RECORD-INTEGRITY-AUDIT.csv', 'GIT-HISTORY-FINDINGS.md',
    'PIPELINE-GOVERNANCE-AUDIT.md', 'REPRODUCIBILITY.md', 'PRODUCTION-CHANGES.md',
    'REVIEW-QUEUE.md', 'PHASE-7Y-STATUS.md', 'PHASE-7Y-STATUS.json'];
  const missing = required.filter((r) => !fs.existsSync(path.join(ROOT, 'reports/phase-7y', r)));
  if (missing.length > 0) throw new Error('missing: ' + missing.join(', '));
});

// 13. ACADEMY-RECONCILIATION.csv has exactly 50 data rows (one per academy record) plus a header.
T('ACADEMY-RECONCILIATION.csv has 51 lines (1 header + 50 records)', () => {
  const content = fs.readFileSync(path.join(ROOT, 'reports/phase-7y/ACADEMY-RECONCILIATION.csv'), 'utf8');
  const lines = content.trim().split('\n');
  if (lines.length !== 51) throw new Error('expected 51 lines, found ' + lines.length);
});

// 14. Chemistry evidence files (chemistry-claims.js/chemistry-ranges.js/dataset-dosage-matrices.js) untouched -- no production math ever touched this phase.
T('chemistry-claims.js, chemistry-ranges.js, dataset-dosage-matrices.js, all calculator JS unchanged', () => {
  const diff = execSync('git diff --stat HEAD -- scripts/data/chemistry-claims.js scripts/data/chemistry-ranges.js scripts/data/dataset-dosage-matrices.js js/calc-utils.js js/calculator.js', { cwd: ROOT }).toString().trim();
  if (diff !== '') throw new Error('forbidden file(s) modified: ' + diff);
});

console.log('');
console.log('test-phase-7y: ' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail === 0 ? 0 : 1);
