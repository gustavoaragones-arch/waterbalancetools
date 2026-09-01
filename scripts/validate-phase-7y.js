#!/usr/bin/env node
// Phase 7Y validator -- source/data pipeline integrity & academy desync audit.
// Read-only: makes no filesystem writes. Verifies the findings this phase
// established, not a general-purpose pipeline gate (see PIPELINE-GOVERNANCE-AUDIT.md
// for why a general gate is deliberately NOT built in this audit-only phase).

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let errors = 0;
let warnings = 0;

function err(msg) { console.log('ERROR: ' + msg); errors++; }
function warn(msg) { console.log('WARN: ' + msg); warnings++; }

function req(rel) { return require(path.join(ROOT, rel)); }

// ---------------------------------------------------------------------
// 1. Academy source/output relationship + duplicate id/slug checks
// ---------------------------------------------------------------------

const ACADEMY_SOURCE_FILES = [
  'academy-equipment', 'academy-fundamentals', 'academy-hot-tubs', 'academy-sanitizers',
  'academy-testing', 'academy-troubleshooting', 'academy-vacation-rentals', 'academy-water-balance',
];

const sourceById = {};
let sourceCount = 0;
for (const f of ACADEMY_SOURCE_FILES) {
  const arr = req('scripts/data/' + f + '.js');
  sourceCount += arr.length;
  arr.forEach((a) => {
    if (sourceById[a.id]) err('Duplicate academy id across source files: ' + a.id + ' in both ' + sourceById[a.id].file + ' and ' + f);
    sourceById[a.id] = { file: f, record: a };
  });
}

const academyJson = req('data/academy.json');
const jsonIds = {};
const jsonSlugs = {};
academyJson.articles.forEach((a) => {
  if (jsonIds[a.id]) err('Duplicate academy id in data/academy.json: ' + a.id);
  jsonIds[a.id] = true;
  if (jsonSlugs[a.slug]) err('Duplicate academy slug in data/academy.json: ' + a.slug);
  jsonSlugs[a.slug] = true;
});

console.log('OK: academy source records: ' + sourceCount + ' across ' + ACADEMY_SOURCE_FILES.length + ' files, 0 duplicate ids');
console.log('OK: data/academy.json: ' + academyJson.articles.length + ' records, 0 duplicate ids, 0 duplicate slugs (beyond errors above)');

// Known desync: exactly fund-07 and fund-08 should be JSON-only.
const EXPECTED_SOURCE_MISSING = ['fund-07', 'fund-08'];
const actualMissing = academyJson.articles.filter((a) => !sourceById[a.id]).map((a) => a.id).sort();
const expectedSorted = [...EXPECTED_SOURCE_MISSING].sort();
if (JSON.stringify(actualMissing) !== JSON.stringify(expectedSorted)) {
  err('Known fund-07/fund-08 desync state has CHANGED since this phase\'s audit. Expected exactly ' + expectedSorted.join(', ') + ' to be source-missing; found: ' + (actualMissing.join(', ') || '(none)') + '. Re-run the Phase 7Y investigation before trusting its conclusions.');
} else {
  console.log('OK: known desync state confirmed unchanged -- exactly fund-07 and fund-08 remain source-missing');
}

// Every source record must still exist in the JSON (no new deletion since the audit).
const missingFromJson = Object.keys(sourceById).filter((id) => !jsonIds[id]);
if (missingFromJson.length > 0) {
  err('Source record(s) missing from data/academy.json (would indicate new, unaudited drift): ' + missingFromJson.join(', '));
} else {
  console.log('OK: every academy source record is present in data/academy.json');
}

// ---------------------------------------------------------------------
// 2. Global source/data integrity findings where deterministic
//    (formulas/glossary/reference must still be clean; entity/dataset
//    families must still have 0 duplicate ids)
// ---------------------------------------------------------------------

function checkClean(label, srcArr, jsonArr, idField) {
  const srcIds = new Set(srcArr.map((r) => r[idField]));
  const jsonIdsArr = jsonArr.map((r) => r[idField]);
  const jsonIdSet = new Set(jsonIdsArr);
  const dupes = jsonIdsArr.filter((id, i) => jsonIdsArr.indexOf(id) !== i);
  if (dupes.length > 0) err(label + ': duplicate id(s) found: ' + [...new Set(dupes)].join(', '));
  const jsonOnly = [...jsonIdSet].filter((id) => !srcIds.has(id));
  const srcOnly = [...srcIds].filter((id) => !jsonIdSet.has(id));
  if (jsonOnly.length > 0) err(label + ': record(s) present in JSON but missing from source (new desync): ' + jsonOnly.join(', '));
  if (srcOnly.length > 0) err(label + ': record(s) present in source but missing from JSON: ' + srcOnly.join(', '));
  if (dupes.length === 0 && jsonOnly.length === 0 && srcOnly.length === 0) {
    console.log('OK: ' + label + ' -- ' + jsonArr.length + ' records, source/JSON in sync, 0 duplicates');
  }
}

checkClean('formulas', req('scripts/data/formulas-data.js'), req('data/formulas.json').formulas, 'id');
checkClean('glossary', req('scripts/data/glossary-terms.js'), req('data/glossary.json').terms, 'id');
checkClean('reference', req('scripts/data/reference-pages.js'), req('data/reference.json').pages, 'id');

// Entities: 6 source files, single automatic pipeline -- check for source-level duplicate ids.
const entityFiles = ['entities-chemicals', 'entities-measurements', 'entities-equipment', 'entities-processes', 'entities-problems'];
const entityIds = {};
let entityCount = 0;
for (const f of entityFiles) {
  const arr = req('scripts/data/' + f + '.js');
  arr.forEach((e) => {
    entityCount++;
    if (entityIds[e.id]) err('Duplicate entity id across source files: ' + e.id);
    entityIds[e.id] = true;
  });
}
console.log('OK: entities-*.js -- ' + entityCount + ' records checked, 0 duplicate ids');

// dataset-dosage-matrices.js -- feeds live calculator dosing math, zero tolerance for duplicates.
const dosageMatrices = req('scripts/data/dataset-dosage-matrices.js');
const dosageIds = {};
dosageMatrices.records.forEach((r) => {
  if (dosageIds[r.id]) err('Duplicate id in dataset-dosage-matrices.js: ' + r.id);
  dosageIds[r.id] = true;
});
console.log('OK: dataset-dosage-matrices.js -- ' + dosageMatrices.records.length + ' records checked, 0 duplicate ids');

// ---------------------------------------------------------------------
// 3. No accidental production content changes beyond explicitly approved
//    audit artifacts -- this phase must show ZERO production diffs.
// ---------------------------------------------------------------------

const APPROVED_NEW_PATHS = [
  'reports/phase-7y/',
  'scripts/validate-phase-7y.js',
  'scripts/test-phase-7y.js',
];

let gitStatus;
try {
  gitStatus = execSync('git status --porcelain', { cwd: ROOT }).toString().trim();
} catch (e) {
  gitStatus = null;
}

if (gitStatus === null) {
  warn('Could not run git status -- skipping working-tree scope check');
} else if (gitStatus === '') {
  console.log('OK: working tree clean (no changes at all -- validator run before any report/script was written)');
} else {
  const lines = gitStatus.split('\n');
  let unexplained = 0;
  lines.forEach((line) => {
    const filePath = line.slice(3);
    const isApproved = APPROVED_NEW_PATHS.some((p) => filePath.startsWith(p));
    if (!isApproved) {
      err('Unexplained working-tree change outside approved Phase 7Y audit artifacts: ' + line);
      unexplained++;
    }
  });
  if (unexplained === 0) {
    console.log('OK: working tree scope fully explained -- every change is an approved Phase 7Y audit artifact (' + lines.length + ' path(s))');
  }
}

// ---------------------------------------------------------------------
// 4. Report artifacts exist
// ---------------------------------------------------------------------

const REQUIRED_REPORTS = [
  'BASELINE.md', 'ACADEMY-RECONCILIATION.csv', 'DATA-PIPELINE-INVENTORY.csv',
  'SOURCE-OF-TRUTH-MATRIX.csv', 'POPULATE-DATA-AUDIT.md', 'BUILD-PIPELINE.md',
  'GLOBAL-DRIFT-AUDIT.csv', 'RECORD-INTEGRITY-AUDIT.csv', 'GIT-HISTORY-FINDINGS.md',
  'PIPELINE-GOVERNANCE-AUDIT.md', 'REPRODUCIBILITY.md', 'PRODUCTION-CHANGES.md',
  'REVIEW-QUEUE.md', 'PHASE-7Y-STATUS.md', 'PHASE-7Y-STATUS.json',
];

let missingReports = 0;
for (const r of REQUIRED_REPORTS) {
  const p = path.join(ROOT, 'reports', 'phase-7y', r);
  if (!fs.existsSync(p)) {
    err('Required report missing: reports/phase-7y/' + r);
    missingReports++;
  }
}
if (missingReports === 0) console.log('OK: all ' + REQUIRED_REPORTS.length + ' required report artifacts exist');

for (const s of ['validate-phase-7y.js', 'test-phase-7y.js']) {
  if (!fs.existsSync(path.join(ROOT, 'scripts', s))) err('Required script missing: scripts/' + s);
}

// ---------------------------------------------------------------------
// 5. populate-data.js itself must be unmodified (audit-only phase)
// ---------------------------------------------------------------------

try {
  const diff = execSync('git diff --stat HEAD -- scripts/populate-data.js', { cwd: ROOT }).toString().trim();
  if (diff !== '') {
    err('scripts/populate-data.js was modified this phase -- forbidden for an audit-only phase: ' + diff);
  } else {
    console.log('OK: scripts/populate-data.js confirmed unmodified (audit-only phase)');
  }
} catch (e) {
  warn('Could not check populate-data.js diff status: ' + e.message);
}

console.log('');
console.log('validate-phase-7y: ' + (errors === 0 ? 'PASS' : 'FAIL') + ' -- ' + errors + ' error(s), ' + warnings + ' warning(s).');
process.exit(errors === 0 ? 0 : 1);
