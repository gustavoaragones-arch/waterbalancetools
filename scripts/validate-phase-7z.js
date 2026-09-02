#!/usr/bin/env node
// Phase 7Z validator -- source/data pipeline integrity & academy desync
// remediation. Confirms every acceptance gate from the Director's Phase 7Z
// spec (Section 15). Read-only.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let errors = 0;
let warnings = 0;
function err(msg) { console.log('ERROR: ' + msg); errors++; }
function warn(msg) { console.log('WARN: ' + msg); warnings++; }
function ok(msg) { console.log('OK: ' + msg); }
function req(rel) { return require(path.join(ROOT, rel)); }
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

// ---------------------------------------------------------------------
// fund-07 / fund-08 exist in authoritative source
// ---------------------------------------------------------------------
const fundamentals = req('scripts/data/academy-fundamentals.js');
const fund07Src = fundamentals.find((a) => a.id === 'fund-07');
const fund08Src = fundamentals.find((a) => a.id === 'fund-08');
if (!fund07Src) err('fund-07 not found in scripts/data/academy-fundamentals.js');
else if (fund07Src.slug !== 'academy/fundamentals/new-pool-startup-chemistry') err('fund-07 has unexpected slug: ' + fund07Src.slug);
else ok('fund-07 exists in authoritative source with the expected slug');

if (!fund08Src) err('fund-08 not found in scripts/data/academy-fundamentals.js');
else if (fund08Src.slug !== 'academy/fundamentals/indoor-pool-chemistry') err('fund-08 has unexpected slug: ' + fund08Src.slug);
else ok('fund-08 exists in authoritative source with the expected slug');

// ---------------------------------------------------------------------
// both exist in compiled JSON
// ---------------------------------------------------------------------
const academyJson = req('data/academy.json').articles;
const fund07Json = academyJson.find((a) => a.id === 'fund-07');
const fund08Json = academyJson.find((a) => a.id === 'fund-08');
if (!fund07Json) err('fund-07 not found in data/academy.json');
if (!fund08Json) err('fund-08 not found in data/academy.json');
if (fund07Json && fund08Json) ok('fund-07 and fund-08 both present in compiled data/academy.json');

// fund-07/fund-08 must be content-identical between source and JSON.
if (fund07Src && fund07Json && JSON.stringify(fund07Src) !== JSON.stringify(fund07Json)) {
  err('fund-07 differs between source and data/academy.json -- run node scripts/populate-data.js');
}
if (fund08Src && fund08Json && JSON.stringify(fund08Src) !== JSON.stringify(fund08Json)) {
  err('fund-08 differs between source and data/academy.json -- run node scripts/populate-data.js');
}

// ---------------------------------------------------------------------
// source/JSON counts match, no duplicate ids, no duplicate slugs
// (delegated to the permanent validator -- this phase's validator confirms
// it exists, runs, and passes, rather than re-implementing its checks)
// ---------------------------------------------------------------------
const consistencyScriptPath = path.join(ROOT, 'scripts', 'validate-source-data-consistency.js');
if (!fs.existsSync(consistencyScriptPath)) {
  err('scripts/validate-source-data-consistency.js does not exist');
} else {
  try {
    const out = execSync('node scripts/validate-source-data-consistency.js', { cwd: ROOT }).toString();
    if (!out.includes('PASS')) err('validate-source-data-consistency.js did not report PASS');
    else ok('validate-source-data-consistency.js: PASS (all 4 families consistent, 0 duplicate ids/slugs)');
  } catch (e) {
    err('validate-source-data-consistency.js failed: ' + e.stdout.toString().split('\n').slice(-3).join(' | '));
  }
}

// ---------------------------------------------------------------------
// the three academy integrity discrepancies are resolved
// ---------------------------------------------------------------------

// san-03: citation now present in source.
const sanitizers = req('scripts/data/academy-sanitizers.js');
const san03 = sanitizers.find((a) => a.id === 'san-03');
if (!san03) err('san-03 not found in academy-sanitizers.js');
else if (!san03.sources.some((s) => s.includes('Indiana Department of Health'))) {
  err('san-03: Indiana DOH citation still missing from source (not reconciled)');
} else {
  ok('san-03: Indiana DOH citation present in source, matching data/academy.json');
}

// ts-01: relatedResources link now present in source.
const troubleshooting = req('scripts/data/academy-troubleshooting.js');
const ts01 = troubleshooting.find((a) => a.id === 'ts-01');
if (!ts01) err('ts-01 not found in academy-troubleshooting.js');
else if (!ts01.relatedResources.includes('/maintenance/how-to-fix-cloudy-hot-tub')) {
  err('ts-01: /maintenance/how-to-fix-cloudy-hot-tub link still missing from source (not reconciled)');
} else {
  ok('ts-01: relatedResources link present in source, matching data/academy.json');
}

// ts-04: source and JSON must both use the em-dash (source already did; JSON
// is fixed by regeneration, not by editing the source).
const ts04 = troubleshooting.find((a) => a.id === 'ts-04');
const ts04Json = academyJson.find((a) => a.id === 'ts-04');
if (!ts04 || !ts04Json) {
  err('ts-04 not found in source or JSON');
} else {
  const srcBody = ts04.examples[0].body;
  const jsonBody = ts04Json.examples[0].body;
  if (srcBody !== jsonBody) {
    err('ts-04: source and JSON examples[0].body still differ (punctuation normalization not complete)');
  } else if (!srcBody.includes('needed — above')) {
    warn('ts-04: source/JSON agree but do not contain the expected em-dash phrase -- verify manually');
  } else {
    ok('ts-04: source and JSON normalized (em-dash), examples[0].body identical');
  }
}

// ---------------------------------------------------------------------
// populate-data.js documentation contains the new source-of-truth wording
// ---------------------------------------------------------------------
const populateData = read('scripts/populate-data.js');
// Normalize whitespace (block comments legitimately wrap across lines) before matching.
const populateDataNormalized = populateData.replace(/\s*\*\s*/g, ' ').replace(/\s+/g, ' ');
const REQUIRED_PHRASES = [
  'authoritative editable sources',
  'MUST NOT be edited directly',
  'not part of `npm run build`',
];
let missingPhrase = false;
REQUIRED_PHRASES.forEach((phrase) => {
  if (!populateDataNormalized.includes(phrase)) {
    err('scripts/populate-data.js header is missing required phrase: "' + phrase + '"');
    missingPhrase = true;
  }
});
if (!missingPhrase) ok('scripts/populate-data.js header contains all required source-of-truth wording');

if (populateData.includes('permanent source of truth')) {
  err('scripts/populate-data.js still contains the old, contradictory "permanent source of truth" claim about the JSON files');
}

// ---------------------------------------------------------------------
// populate-data.js is not added to the automatic build
// ---------------------------------------------------------------------
const runAllGenerators = read('scripts/run-all-generators.js');
if (/require\([^)]*populate-data\.js[^)]*\)|execSync\(['"]node scripts\/populate-data\.js/.test(runAllGenerators)) {
  err('scripts/populate-data.js appears to have been added to run-all-generators.js -- forbidden this phase');
} else {
  ok('scripts/populate-data.js confirmed NOT added to the automatic build');
}

// The new consistency validator, by contrast, MUST be wired into the build.
if (!/validate-source-data-consistency\.js/.test(runAllGenerators)) {
  err('scripts/validate-source-data-consistency.js is not integrated into run-all-generators.js');
} else {
  ok('scripts/validate-source-data-consistency.js is integrated into the build pipeline');
}

// ---------------------------------------------------------------------
// no forbidden scope areas were modified
// ---------------------------------------------------------------------
const FORBIDDEN_PATHS = [
  'js/calc-utils.js', 'js/calculator.js',
  'scripts/data/chemistry-claims.js', 'scripts/data/chemistry-ranges.js', 'scripts/data/dataset-dosage-matrices.js',
  'scripts/generate-entity-pages.js', 'scripts/generate-hubs.js', 'scripts/generate-navigation.js',
  'sitemap.xml', 'es/', 'fr/', 'ads.txt',
  'data/chlorine-dosage.json', 'data/ph-adjustment.json', 'data/shock-dosage.json',
];
try {
  const diffStat = execSync('git diff --stat HEAD -- ' + FORBIDDEN_PATHS.map((p) => "'" + p + "'").join(' '), { cwd: ROOT }).toString().trim();
  if (diffStat !== '') {
    err('Forbidden scope area(s) modified this phase: ' + diffStat.split('\n')[0]);
  } else {
    ok('No forbidden scope areas modified (calculator JS, chemistry-claims/ranges/dosage-matrices, template-drift-related generators, legacy dosage JSON, i18n/URLs/AdSense)');
  }
} catch (e) {
  warn('Could not check forbidden-scope diff: ' + e.message);
}

console.log('');
console.log('validate-phase-7z: ' + (errors === 0 ? 'PASS' : 'FAIL') + ' -- ' + errors + ' error(s), ' + warnings + ' warning(s).');
process.exit(errors === 0 ? 0 : 1);
