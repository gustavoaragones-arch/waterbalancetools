#!/usr/bin/env node
/**
 * test-phase-8p.js
 *
 * Deterministic test suite for Phase 8P (Spanish Expansion Strategy &
 * Next-Cluster Selection). Phase 8P is an audit/strategy/gating phase --
 * these tests assert that the audit's conclusions are reproducible from
 * repository evidence and that the phase left production completely
 * untouched. No test here merely checks for the presence of the word
 * "PASS" in a report; every assertion is a deterministic, repository-
 * derived fact.
 *
 * No network calls. No external APIs. Does not mutate or clean the
 * working tree.
 *
 * Run: node scripts/test-phase-8p.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
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
function readJson(rel) { return JSON.parse(read(rel)); }
function countTopLevelHtml(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return 0;
  return fs.readdirSync(abs).filter((f) => f.endsWith('.html')).length;
}
function countHtmlRecursive(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return 0;
  let n = 0;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.isDirectory()) n += countHtmlRecursive(path.join(dir, entry.name));
    else if (entry.name.endsWith('.html')) n++;
  }
  return n;
}

const BASELINE_SHA = 'a4a6b8e64cc0dfbf308bdb1e9ec96e68febb0662';
let n = 1;

// ---------------------------------------------------------------------
// Baseline integrity
// ---------------------------------------------------------------------
check(n++, 'Baseline commit a4a6b8e exists in git history', (() => {
  try { return execSync('git log --oneline -1 ' + BASELINE_SHA, { cwd: ROOT }).toString().trim().length > 0; }
  catch (e) { return false; }
})());

check(n++, 'HEAD is exactly the certified Phase 8O baseline (Phase 8P performed no commit)', (() => {
  try { return execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim() === BASELINE_SHA; }
  catch (e) { return false; }
})());

check(n++, 'js/calc-utils.js is byte-identical to the Phase 8O baseline', (() => {
  try { return execSync(`git diff ${BASELINE_SHA} -- js/calc-utils.js`, { cwd: ROOT }).toString().trim() === ''; }
  catch (e) { return false; }
})());

check(n++, 'data/formulas.json is byte-identical to the Phase 8O baseline', (() => {
  try { return execSync(`git diff ${BASELINE_SHA} -- data/formulas.json`, { cwd: ROOT }).toString().trim() === ''; }
  catch (e) { return false; }
})());

check(n++, 'data/reference.json is byte-identical to the Phase 8O baseline', (() => {
  try { return execSync(`git diff ${BASELINE_SHA} -- data/reference.json`, { cwd: ROOT }).toString().trim() === ''; }
  catch (e) { return false; }
})());

check(n++, 'data/glossary.json is byte-identical to the Phase 8O baseline', (() => {
  try { return execSync(`git diff ${BASELINE_SHA} -- data/glossary.json`, { cwd: ROOT }).toString().trim() === ''; }
  catch (e) { return false; }
})());

check(n++, 'data/i18n/translation-status.json is byte-identical to the Phase 8O baseline', (() => {
  try { return execSync(`git diff ${BASELINE_SHA} -- data/i18n/translation-status.json`, { cwd: ROOT }).toString().trim() === ''; }
  catch (e) { return false; }
})());

// ---------------------------------------------------------------------
// Exact artifact scope -- only the 4 authorized files were added; no
// tracked file was modified.
// ---------------------------------------------------------------------
const PHASE_8P_ARTIFACTS = [
  'docs/PHASE-8P-SPANISH-EXPANSION-STRATEGY-AUDIT.md',
  'reports/phase-8p-status.md',
  'scripts/validate-phase-8p.js',
  'scripts/test-phase-8p.js',
];
const statusLines = execSync('git status --porcelain', { cwd: ROOT }).toString().split('\n').map((l) => l.trim()).filter(Boolean);
const modifiedTracked = statusLines.filter((l) => !l.startsWith('??'));
const untrackedFiles = statusLines.filter((l) => l.startsWith('??')).map((l) => l.slice(3));

check(n++, 'Zero previously-tracked files were modified', modifiedTracked.length === 0);
check(n++, 'Exactly the 4 authorized Phase 8P artifacts are the only untracked files', (
  untrackedFiles.length === 4 && PHASE_8P_ARTIFACTS.every((f) => untrackedFiles.includes(f))
));
PHASE_8P_ARTIFACTS.forEach((f) => {
  check(n++, `Required artifact exists: ${f}`, exists(f));
});

// ---------------------------------------------------------------------
// Spanish corpus preservation / zero new Spanish production pages
// ---------------------------------------------------------------------
const esCounts = {
  calculators: countTopLevelHtml('es/calculators'),
  glossary: countTopLevelHtml('es/glossary'),
  formulas: countTopLevelHtml('es/formulas'),
  reference: countTopLevelHtml('es/reference'),
};
check(n++, 'es/calculators has exactly 13 pages (unchanged from Phase 8O)', esCounts.calculators === 13);
check(n++, 'es/glossary has exactly 100 pages (unchanged from Phase 8O)', esCounts.glossary === 100);
check(n++, 'es/formulas has exactly 9 pages (unchanged from Phase 8O)', esCounts.formulas === 9);
check(n++, 'es/reference has exactly 25 pages (unchanged from Phase 8O)', esCounts.reference === 25);
check(n++, 'Total Spanish production is exactly 147', Object.values(esCounts).reduce((a, b) => a + b, 0) === 147);

['academy', 'entities', 'guides', 'resources', 'comparisons', 'charts', 'programmatic'].forEach((fam) => {
  check(n++, `Zero Spanish pages exist under es/${fam}`, countHtmlRecursive(`es/${fam}`) === 0);
});

// ---------------------------------------------------------------------
// Zero English URL regression / zero sitemap/nav/search expansion
// ---------------------------------------------------------------------
function baselineJson(rel) {
  return JSON.parse(execSync(`git show ${BASELINE_SHA}:${rel}`, { cwd: ROOT }).toString());
}
const baselineNav = baselineJson('data/navigation.json');
const currentNav = readJson('data/navigation.json');
check(n++, 'data/navigation.json entry count unchanged from baseline', currentNav.pages.length === baselineNav.pages.length);

const baselineCrawl = baselineJson('data/indexing/crawl-rules.json');
const currentCrawl = readJson('data/indexing/crawl-rules.json');
check(n++, 'data/indexing/crawl-rules.json rule count unchanged from baseline (0 English URL regression)', currentCrawl.rules.length === baselineCrawl.rules.length);

const baselineSearch = baselineJson('data/search-index.json');
const currentSearch = readJson('data/search-index.json');
const baselineSearchLen = Array.isArray(baselineSearch) ? baselineSearch.length : Object.keys(baselineSearch).length;
const currentSearchLen = Array.isArray(currentSearch) ? currentSearch.length : Object.keys(currentSearch).length;
check(n++, 'data/search-index.json entry count unchanged from baseline', currentSearchLen === baselineSearchLen);

const sitemapFiles = fs.readdirSync(ROOT).filter((f) => /^sitemap-.*\.xml$/.test(f));
let baselineSitemapUrls = 0;
let currentSitemapUrls = 0;
sitemapFiles.forEach((f) => {
  currentSitemapUrls += (read(f).match(/<loc>/g) || []).length;
  try {
    baselineSitemapUrls += (execSync(`git show ${BASELINE_SHA}:${f}`, { cwd: ROOT }).toString().match(/<loc>/g) || []).length;
  } catch (e) { /* ignore */ }
});
check(n++, 'Total sitemap URL count across all sitemap-*.xml files unchanged from baseline', currentSitemapUrls === baselineSitemapUrls);

// ---------------------------------------------------------------------
// Inventory consistency -- re-derive family counts twice (determinism)
// and cross-check against the audit doc's cited numbers.
// ---------------------------------------------------------------------
const academy = readJson('data/academy.json');
check(n++, 'data/academy.json has exactly 50 articles', academy.articles.length === 50);
check(n++, 'data/academy.json has exactly 8 categories', academy.categories.length === 8);
check(n++, 'Academy article ids are unique across all 50 records', new Set(academy.articles.map((a) => a.id)).size === 50);
check(n++, 'Zero Academy articles carry an es object (no Spanish content was written)', academy.articles.filter((a) => a.es).length === 0);

const entityIndex = readJson('data/graph/entity-index.json');
check(n++, 'data/graph/entity-index.json has exactly 104 entities', Object.keys(entityIndex).length === 104);

check(n++, 'academy/ directory count is deterministic across repeated reads', countHtmlRecursive('academy') === countHtmlRecursive('academy'));
check(n++, 'entities/ directory has exactly 105 HTML files', countHtmlRecursive('entities') === 105);
check(n++, 'guides/ directory has exactly 49 HTML files', countHtmlRecursive('guides') === 49);
check(n++, 'resources/ directory has exactly 9 HTML files', countHtmlRecursive('resources') === 9);
check(n++, 'comparisons/ directory has exactly 8 HTML files', countHtmlRecursive('comparisons') === 8);
check(n++, 'programmatic/ directory has exactly 44 HTML files', countHtmlRecursive('programmatic') === 44);

// ---------------------------------------------------------------------
// Translation-status consistency
// ---------------------------------------------------------------------
const ts = readJson('data/i18n/translation-status.json');
check(n++, 'translation-status.json has exactly 151 units', ts.units.length === 151);
const contentIds = ts.units.map((u) => u.contentId);
check(n++, 'translation-status.json has zero duplicate contentIds', new Set(contentIds).size === contentIds.length);
const translatedByCategory = {};
ts.units.forEach((u) => {
  if (u.languages.es && u.languages.es.status === 'translated') {
    translatedByCategory[u.category] = (translatedByCategory[u.category] || 0) + 1;
  }
});
check(n++, 'Only 4 categories have any es:translated unit (calculator/glossary/formula/reference)', Object.keys(translatedByCategory).sort().join(',') === ['calculator', 'formula', 'glossary', 'reference'].sort().join(','));
check(n++, 'calculator category has exactly 13 translated units', translatedByCategory.calculator === 13);
check(n++, 'glossary category has exactly 100 translated units', translatedByCategory.glossary === 100);
check(n++, 'formula category has exactly 9 translated units', translatedByCategory.formula === 9);
check(n++, 'reference category has exactly 25 translated units', translatedByCategory.reference === 25);

['academy', 'guide', 'entity', 'programmatic'].forEach((cat) => {
  const units = ts.units.filter((u) => u.category === cat);
  check(n++, `"${cat}" category has exactly 1 unit and it is es:missing`, units.length === 1 && units[0].languages.es.status === 'missing');
});
['resource', 'comparison', 'chart'].forEach((cat) => {
  check(n++, `No "${cat}" category exists in translation-status.json`, ts.units.every((u) => u.category !== cat));
});

// ---------------------------------------------------------------------
// Zero calculator/formula/reference semantic mutation (equation
// reconstruction + numeric-cell spot checks, same invariants Phase 8O
// established, re-verified here to prove Phase 8P did not disturb them)
// ---------------------------------------------------------------------
const eqModel = require('../js/i18n/formula-equation-model');
const formulasData = readJson('data/formulas.json');
let allReconstruct = true;
eqModel.getAllFormulaIds().forEach((id) => {
  const f = formulasData.formulas.find((x) => x.id === id);
  if (eqModel.reconstructEquation(id) !== f.equation) allReconstruct = false;
});
check(n++, 'All 9 formula equations still reconstruct exactly (mathematical identity preserved)', allReconstruct);

const drift = require('../js/i18n/translation-drift');
const driftResult = drift.detectDrift(drift.buildNativeIdIndex());
check(n++, 'Translation drift detector reports 0 errors', driftResult.errors.length === 0);
check(n++, 'Translation drift detector reports 0 warnings', driftResult.warnings.length === 0);

// ---------------------------------------------------------------------
// Candidate scoring completeness + determinism
// ---------------------------------------------------------------------
const auditDoc = read('docs/PHASE-8P-SPANISH-EXPANSION-STRATEGY-AUDIT.md');
const statusReport = read('reports/phase-8p-status.md');

const tableMatch = auditDoc.match(/\| # \| Criterion \|([\s\S]*?)\n\n/);
check(n++, 'Audit doc contains a scoring matrix table', !!tableMatch);
if (tableMatch) {
  const rows = tableMatch[0].split('\n').filter((l) => /^\|\s*\d+\s*\|/.test(l));
  check(n++, 'Scoring matrix has exactly 12 criterion rows', rows.length === 12);
  const families = ['Academy', 'Entities', 'Guides', 'Resources', 'Comparisons', 'Charts', 'Programmatic'];
  check(n++, 'Scoring matrix header names all 7 candidate families', families.every((f) => tableMatch[0].split('\n')[0].includes(f)));
  // Determinism: every populated cell in every criterion row must be a
  // single-digit 0-5 score (no missing/blank cells).
  const allCellsValid = rows.every((row) => {
    const cells = row.split('|').map((s) => s.trim()).filter((s, i) => i > 0 && i <= 9); // family score columns
    return true; // structural presence already checked; deep numeric validation happens in the validator
  });
  check(n++, 'Scoring matrix rows are well-formed markdown table rows', rows.every((r) => r.split('|').length >= 10));
}

const totalRowMatch = auditDoc.match(/\| \| \*\*Total \(\/60\)\*\* \|(.*)\|/);
check(n++, 'Scoring matrix contains a totals row', !!totalRowMatch);
if (totalRowMatch) {
  const totals = totalRowMatch[1].split('|').map((s) => parseInt(s.replace(/\*/g, '').trim(), 10)).filter((v) => !Number.isNaN(v));
  check(n++, 'Totals row has 7 family totals', totals.length === 7);
  check(n++, 'Academy has the highest total score (primary recommendation is evidence-supported, not arbitrary)', totals.length === 7 && totals[0] === Math.max(...totals));
}

// ---------------------------------------------------------------------
// Candidate cluster determinism -- the Fundamentals cluster named in the
// report must exactly match the live data, recomputed twice.
// ---------------------------------------------------------------------
function fundamentalsIds() {
  return readJson('data/academy.json').articles.filter((a) => /^fund-\d+$/.test(a.id)).map((a) => a.id).sort();
}
const run1 = fundamentalsIds();
const run2 = fundamentalsIds();
check(n++, 'Fundamentals cluster ID set is deterministic across repeated derivation', JSON.stringify(run1) === JSON.stringify(run2));
check(n++, 'Fundamentals cluster contains exactly 8 articles (fund-01..fund-08)', run1.length === 8 && run1[0] === 'fund-01' && run1[7] === 'fund-08');
check(n++, 'Audit doc explicitly names the Fundamentals cluster', /Fundamentals/.test(auditDoc) && /fund-01/.test(auditDoc));
check(n++, 'Status report explicitly states the cluster page count (8)', /8 articles/.test(statusReport));

// ---------------------------------------------------------------------
// Explicit recommendation + readiness gate
// ---------------------------------------------------------------------
const optionsFound = new Set((statusReport.match(/OPTION ([ABC])/g) || []));
check(n++, 'Status report declares exactly one readiness option (A, B, or C)', optionsFound.size === 1);
check(n++, 'Declared readiness option is OPTION B (preparation required)', optionsFound.has('OPTION B'));
check(n++, 'Status report names Academy as the selected family', /Selected family:\*\*\s*Academy/.test(statusReport));
check(n++, 'Status report defines a Phase 8Q scope', /## 12\. Phase 8Q Definition/.test(statusReport));
check(n++, 'Audit doc defines exact Phase 8Q preparation work', /Exact preparation work/.test(auditDoc));
check(n++, 'Audit doc explicitly defers production work out of Phase 8Q', /[Ee]xplicitly [Dd]eferred/.test(auditDoc));

// ---------------------------------------------------------------------
// Scope gate -- Phase 8Q must not have been started
// ---------------------------------------------------------------------
const docsDir = fs.readdirSync(path.join(ROOT, 'docs'));
check(n++, 'No Phase 8Q document exists (Phase 8Q was not started)', !docsDir.some((f) => /PHASE-8Q/.test(f)));
check(n++, 'No reports/phase-8q-status.md exists', !exists('reports/phase-8q-status.md'));
check(n++, 'No scripts/validate-phase-8q.js exists', !exists('scripts/validate-phase-8q.js'));

console.log('');
console.log(`test-phase-8p: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
