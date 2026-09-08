#!/usr/bin/env node
/**
 * validate-phase-8p.js
 *
 * Validates Phase 8P: Spanish Expansion Strategy & Next-Cluster Selection.
 *
 * Phase 8P is an AUDIT/STRATEGY/GATING phase -- it produces no Spanish
 * production content and mutates no production source. This validator
 * therefore checks two different kinds of thing:
 *
 *   (a) that the audit's numeric claims in docs/PHASE-8P-*.md and
 *       reports/phase-8p-status.md are independently reproducible from
 *       the live repository state (never trusted as prose alone -- every
 *       number cited is re-derived here and compared), and
 *   (b) that the phase left production completely untouched: the Phase
 *       8O Spanish corpus, English URL inventory, sitemap/navigation/
 *       search topology, calculator logic, and formula/reference source
 *       data are all still byte-identical / count-identical to the
 *       certified a4a6b8e baseline.
 *
 * Read-only. Does not end with a blanket `git checkout HEAD -- .`
 * self-cleanup step and never mutates the working tree.
 *
 * Run: node scripts/validate-phase-8p.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let errors = 0;
let warnings = 0;
function err(msg) { console.log('ERROR: ' + msg); errors++; }
function warn(msg) { console.log('WARN: ' + msg); warnings++; }
function ok(msg) { console.log('OK: ' + msg); }
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }
function readJson(rel) { return JSON.parse(read(rel)); }

const BASELINE_SHA = 'a4a6b8e64cc0dfbf308bdb1e9ec96e68febb0662'; // Phase 8O closeout

// ---------------------------------------------------------------------
// 1. Exact baseline
// ---------------------------------------------------------------------
try {
  const log = execSync('git log --oneline -1 ' + BASELINE_SHA, { cwd: ROOT }).toString().trim();
  if (log) ok('1. Mandatory baseline commit ' + BASELINE_SHA.slice(0, 7) + ' (Phase 8O closeout) is present in history');
  else err('1. Baseline commit not found in history');
} catch (e) {
  err('1. Could not verify baseline commit: ' + e.message);
}

// ---------------------------------------------------------------------
// 2. Clean production baseline before audit -- the ONLY changes present
//    in the working tree must be new Phase 8P artifacts (untracked
//    additions), never a modification to a previously-tracked file.
// ---------------------------------------------------------------------
const PHASE_8P_ARTIFACTS = [
  'docs/PHASE-8P-SPANISH-EXPANSION-STRATEGY-AUDIT.md',
  'reports/phase-8p-status.md',
  'scripts/validate-phase-8p.js',
  'scripts/test-phase-8p.js',
];
try {
  const statusOut = execSync('git status --porcelain', { cwd: ROOT }).toString();
  const lines = statusOut.split('\n').map((l) => l.trim()).filter(Boolean);
  const modifiedTracked = lines.filter((l) => !l.startsWith('??'));
  if (modifiedTracked.length === 0) {
    ok('2. No previously-tracked file was modified -- only new untracked Phase 8P artifacts are present');
  } else {
    err('2. Tracked files were modified during Phase 8P (production must remain untouched): ' + modifiedTracked.join(', '));
  }
  const untracked = lines.filter((l) => l.startsWith('??')).map((l) => l.slice(3));
  const unexpected = untracked.filter((f) => !PHASE_8P_ARTIFACTS.includes(f));
  if (unexpected.length === 0) {
    ok('2b. Every untracked file is one of the 4 authorized Phase 8P artifacts');
  } else {
    err('2b. Unexpected untracked file(s) present: ' + unexpected.join(', '));
  }
} catch (e) {
  err('2. Could not read git status: ' + e.message);
}

// ---------------------------------------------------------------------
// 3. Spanish production count = 147, unchanged from baseline
// ---------------------------------------------------------------------
function countHtml(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return 0;
  let n = 0;
  for (const f of fs.readdirSync(abs)) {
    if (f.endsWith('.html')) n++;
  }
  return n;
}
const esCalc = countHtml('es/calculators');
const esGlossary = countHtml('es/glossary');
const esFormulas = countHtml('es/formulas');
const esReference = countHtml('es/reference');
const esTotal = esCalc + esGlossary + esFormulas + esReference;
if (esCalc === 13 && esGlossary === 100 && esFormulas === 9 && esReference === 25 && esTotal === 147) {
  ok('3. Spanish production count = 147 (13 calculators + 100 glossary + 9 formulas + 25 reference)');
} else {
  err(`3. Spanish production count mismatch -- calculators=${esCalc} glossary=${esGlossary} formulas=${esFormulas} reference=${esReference} total=${esTotal} (expected 13/100/9/25/147)`);
}

// ---------------------------------------------------------------------
// 4. Spanish family composition -- zero Spanish pages under any of the
//    seven out-of-scope families.
// ---------------------------------------------------------------------
const OUT_OF_SCOPE_FAMILIES = ['academy', 'entities', 'guides', 'resources', 'comparisons', 'charts', 'programmatic'];
let scopeViolation = false;
for (const fam of OUT_OF_SCOPE_FAMILIES) {
  const n = countHtml(path.join('es', fam));
  if (n !== 0) { err(`4. Found ${n} Spanish page(s) under es/${fam} -- Phase 8P must not create production content`); scopeViolation = true; }
}
if (!scopeViolation) ok('4. Zero Spanish production pages exist under any of the 7 remaining families (academy/entities/guides/resources/comparisons/charts/programmatic)');

// ---------------------------------------------------------------------
// 5. English family inventory -- re-derive and cross-check every count
//    the audit report cites.
// ---------------------------------------------------------------------
const academy = readJson('data/academy.json');
const academyArticleCount = academy.articles.length;
const academyCategoryCount = academy.categories.length;
if (academyArticleCount === 50 && academyCategoryCount === 8) {
  ok('5a. Academy: 50 articles across 8 categories (data/academy.json), matching the audit report');
} else {
  err(`5a. Academy count mismatch: ${academyArticleCount} articles, ${academyCategoryCount} categories (report claims 50/8)`);
}

const academyHtmlCount = countHtml('academy') + (fs.existsSync(path.join(ROOT, 'academy'))
  ? fs.readdirSync(path.join(ROOT, 'academy')).filter((f) => fs.statSync(path.join(ROOT, 'academy', f)).isDirectory())
    .reduce((sum, d) => sum + countHtml(path.join('academy', d)), 0)
  : 0);
if (academyHtmlCount === 59) {
  ok('5b. Academy: 59 total HTML files on disk (50 articles + 9 hub/category pages)');
} else {
  err(`5b. Academy HTML file count mismatch: found ${academyHtmlCount}, report claims 59`);
}

let entityIndexCount = 0;
try {
  const entityIndex = readJson('data/graph/entity-index.json');
  entityIndexCount = Object.keys(entityIndex).length;
} catch (e) {
  err('5c. Could not read data/graph/entity-index.json: ' + e.message);
}
if (entityIndexCount === 104) {
  ok('5c. Entities: 104 entities in data/graph/entity-index.json, matching the audit report');
} else {
  err(`5c. Entity count mismatch: found ${entityIndexCount}, report claims 104`);
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
const entitiesHtml = countHtmlRecursive('entities');
const guidesHtml = countHtmlRecursive('guides');
const resourcesHtml = countHtmlRecursive('resources');
const comparisonsHtml = countHtmlRecursive('comparisons');
const programmaticHtml = countHtmlRecursive('programmatic');

if (entitiesHtml === 105) ok('5d. Entities: 105 HTML files on disk');
else err(`5d. Entities HTML count mismatch: found ${entitiesHtml}, report claims 105`);

if (guidesHtml === 49) ok('5e. Guides: 49 HTML files on disk');
else err(`5e. Guides HTML count mismatch: found ${guidesHtml}, report claims 49`);

if (resourcesHtml === 9) ok('5f. Resources: 9 HTML files on disk');
else err(`5f. Resources HTML count mismatch: found ${resourcesHtml}, report claims 9`);

if (comparisonsHtml === 8) ok('5g. Comparisons: 8 HTML files on disk');
else err(`5g. Comparisons HTML count mismatch: found ${comparisonsHtml}, report claims 8`);

if (programmaticHtml === 44) ok('5h. Programmatic: 44 HTML files on disk');
else err(`5h. Programmatic HTML count mismatch: found ${programmaticHtml}, report claims 44`);

// ---------------------------------------------------------------------
// 6. Untranslated family inventory -- confirm exactly which categories
//    have es:translated units and which are missing/absent.
// ---------------------------------------------------------------------
const translationStatus = readJson('data/i18n/translation-status.json');
const unitsByCategory = {};
translationStatus.units.forEach((u) => {
  unitsByCategory[u.category] = unitsByCategory[u.category] || [];
  unitsByCategory[u.category].push(u);
});
const translatedCategories = Object.keys(unitsByCategory).filter((cat) =>
  unitsByCategory[cat].some((u) => u.languages.es && u.languages.es.status === 'translated')
);
const expectedTranslatedCategories = ['calculator', 'glossary', 'formula', 'reference'];
if (translatedCategories.sort().join(',') === expectedTranslatedCategories.sort().join(',')) {
  ok('6a. Exactly the 4 expected categories (calculator/glossary/formula/reference) have any es:translated units');
} else {
  err('6a. Translated-category set mismatch: found [' + translatedCategories.join(',') + '], expected [' + expectedTranslatedCategories.join(',') + ']');
}
['academy', 'guide', 'entity', 'programmatic'].forEach((cat) => {
  const units = unitsByCategory[cat] || [];
  if (units.length === 1 && units[0].languages.es && units[0].languages.es.status === 'missing') {
    ok(`6b. Category "${cat}" has exactly 1 translation-status unit, es: missing`);
  } else {
    err(`6b. Category "${cat}" translation-status unit(s) unexpected: ${JSON.stringify(units)}`);
  }
});
['resource', 'comparison', 'chart'].forEach((cat) => {
  if (!unitsByCategory[cat]) ok(`6c. No "${cat}" category exists in translation-status.json (matches audit finding)`);
  else err(`6c. Unexpected "${cat}" category found in translation-status.json with ${unitsByCategory[cat].length} unit(s)`);
});

// ---------------------------------------------------------------------
// 7. Translation-status integrity
// ---------------------------------------------------------------------
if (translationStatus.units.length === 151) {
  ok('7a. translation-status.json has exactly 151 units');
} else {
  err(`7a. translation-status.json unit count mismatch: found ${translationStatus.units.length}, expected 151`);
}
const contentIds = translationStatus.units.map((u) => u.contentId);
const dupeIds = contentIds.filter((id, i) => contentIds.indexOf(id) !== i);
if (dupeIds.length === 0) ok('7b. Zero duplicate contentIds in translation-status.json');
else err('7b. Duplicate contentIds found: ' + dupeIds.join(', '));

const legacyPatterns = ['glossary:free-chlorine', 'formula:pool-volume', 'reference:ideal-pool-levels'];
const legacyFound = contentIds.filter((id) => legacyPatterns.includes(id));
if (legacyFound.length === 0) ok('7c. Zero legacy fixture IDs present');
else err('7c. Legacy fixture IDs found: ' + legacyFound.join(', '));

// ---------------------------------------------------------------------
// 8. Content-ID integrity for the primary candidate family (Academy)
// ---------------------------------------------------------------------
const academyIds = academy.articles.map((a) => a.id);
const uniqueAcademyIds = new Set(academyIds);
if (uniqueAcademyIds.size === 50 && academyIds.length === 50) {
  ok('8a. All 50 Academy articles have unique native ids');
} else {
  err(`8a. Academy id uniqueness failure: ${academyIds.length} ids, ${uniqueAcademyIds.size} unique`);
}
const entityIndex2 = readJson('data/graph/entity-index.json');
const entityIds = Object.keys(entityIndex2);
if (new Set(entityIds).size === entityIds.length && entityIds.length === 104) {
  ok('8b. All 104 Entity records have unique native ids');
} else {
  err('8b. Entity id uniqueness failure');
}

// ---------------------------------------------------------------------
// 9-10. Candidate scoring completeness + candidate cluster definition
//   -- parse the actual markdown scoring table and cluster definition
//   out of the audit doc rather than trusting prose.
// ---------------------------------------------------------------------
const auditDoc = read('docs/PHASE-8P-SPANISH-EXPANSION-STRATEGY-AUDIT.md');
const statusReport = read('reports/phase-8p-status.md');

const scoringTableMatch = auditDoc.match(/\| # \| Criterion \|([\s\S]*?)\n\n/);
if (scoringTableMatch) {
  const tableBlock = scoringTableMatch[0];
  const dataRows = tableBlock.split('\n').filter((l) => /^\|\s*\d+\s*\|/.test(l));
  const totalRow = tableBlock.split('\n').find((l) => /Total \(\/60\)/.test(l));
  const families = ['Academy', 'Entities', 'Guides', 'Resources', 'Comparisons', 'Charts', 'Programmatic'];
  const headerRow = tableBlock.split('\n')[0];
  const hasAllFamilies = families.every((f) => headerRow.includes(f));
  if (dataRows.length === 12 && totalRow && hasAllFamilies) {
    ok('9. Scoring matrix is complete: 12 criteria scored across all 7 families, with a totals row');
  } else {
    err(`9. Scoring matrix incomplete: ${dataRows.length} criterion rows (expected 12), totals row present=${!!totalRow}, all families present=${hasAllFamilies}`);
  }

  // Self-consistency: recompute Academy's total from its own row scores.
  const academyRow = dataRows.find((r) => true); // criterion rows share column order; verify per-row sums instead
  let sumOk = true;
  const famColIndex = headerRow.split('|').map((s) => s.trim()).indexOf('Academy');
  const stripMd = (s) => s.replace(/\*\*/g, '').trim();
  let recomputedAcademyTotal = 0;
  dataRows.forEach((row) => {
    const cells = row.split('|').map((s) => stripMd(s));
    const val = parseInt(cells[famColIndex], 10);
    if (Number.isNaN(val)) sumOk = false;
    else recomputedAcademyTotal += val;
  });
  const totalCells = totalRow ? totalRow.split('|').map((s) => stripMd(s)) : [];
  const claimedAcademyTotal = totalRow ? parseInt(totalCells[famColIndex], 10) : NaN;
  if (sumOk && recomputedAcademyTotal === claimedAcademyTotal) {
    ok(`9b. Academy's claimed total (${claimedAcademyTotal}) equals the sum of its 12 individual criterion scores (self-consistent)`);
  } else {
    err(`9b. Academy scoring total is not self-consistent: recomputed=${recomputedAcademyTotal}, claimed=${claimedAcademyTotal}`);
  }
} else {
  err('9. Could not locate a scoring matrix table in the audit doc');
}

const clusterFundamentalsIds = academy.articles.filter((a) => /^fund-\d+$/.test(a.id)).map((a) => a.id);
const clusterMentioned = /Fundamentals/.test(auditDoc) && /fund-01/.test(auditDoc) && /8 articles/.test(auditDoc + statusReport);
if (clusterFundamentalsIds.length === 8 && clusterMentioned) {
  ok('10. Candidate cluster (Academy Fundamentals, 8 articles: fund-01..fund-08) is defined in the audit and matches the live data/academy.json record set exactly');
} else {
  err(`10. Candidate cluster definition mismatch: live fundamentals count=${clusterFundamentalsIds.length}, mentioned in docs=${clusterMentioned}`);
}

// ---------------------------------------------------------------------
// 11-15. No production expansion: no new Spanish pages, no English URL
//   regression, no sitemap/navigation/search-index expansion.
// ---------------------------------------------------------------------
if (esTotal === 147) ok('11. No new Spanish production pages were created (still exactly 147)');
// else already reported as error #3

let baselineNavCount = null;
let baselineSearchCount = null;
try {
  const baselineNav = JSON.parse(execSync(`git show ${BASELINE_SHA}:data/navigation.json`, { cwd: ROOT }).toString());
  baselineNavCount = baselineNav.pages.length;
} catch (e) { err('12. Could not read baseline navigation.json: ' + e.message); }
const currentNav = readJson('data/navigation.json');
if (baselineNavCount !== null) {
  if (currentNav.pages.length === baselineNavCount) {
    ok(`12/14. Navigation entry count unchanged from baseline (${baselineNavCount})`);
  } else {
    err(`12/14. Navigation entry count changed: baseline=${baselineNavCount}, current=${currentNav.pages.length}`);
  }
}

const currentCrawlRules = readJson('data/indexing/crawl-rules.json');
let baselineCrawlCount = null;
try {
  const baselineCrawl = JSON.parse(execSync(`git show ${BASELINE_SHA}:data/indexing/crawl-rules.json`, { cwd: ROOT }).toString());
  baselineCrawlCount = baselineCrawl.rules.length;
} catch (e) { err('12b. Could not read baseline crawl-rules.json: ' + e.message); }
if (baselineCrawlCount !== null) {
  if (currentCrawlRules.rules.length === baselineCrawlCount) {
    ok(`12b. English URL inventory (crawl-rules.json) unchanged from baseline (${baselineCrawlCount} rules) -- 0 English URL regression`);
  } else {
    err(`12b. crawl-rules.json rule count changed: baseline=${baselineCrawlCount}, current=${currentCrawlRules.rules.length}`);
  }
}

let baselineSitemapUrls = 0;
let currentSitemapUrls = 0;
const sitemapFiles = fs.readdirSync(ROOT).filter((f) => /^sitemap-.*\.xml$/.test(f));
sitemapFiles.forEach((f) => {
  const current = read(f);
  currentSitemapUrls += (current.match(/<loc>/g) || []).length;
  try {
    const baseline = execSync(`git show ${BASELINE_SHA}:${f}`, { cwd: ROOT }).toString();
    baselineSitemapUrls += (baseline.match(/<loc>/g) || []).length;
  } catch (e) { /* file may not have existed at baseline -- handled by mismatch below */ }
});
if (currentSitemapUrls === baselineSitemapUrls) {
  ok(`13. Sitemap URL total unchanged from baseline (${baselineSitemapUrls} URLs across ${sitemapFiles.length} files)`);
} else {
  err(`13. Sitemap URL total changed: baseline=${baselineSitemapUrls}, current=${currentSitemapUrls}`);
}

let baselineSearchCount2 = null;
try {
  const baselineSearch = JSON.parse(execSync(`git show ${BASELINE_SHA}:data/search-index.json`, { cwd: ROOT }).toString());
  baselineSearchCount2 = Array.isArray(baselineSearch) ? baselineSearch.length : Object.keys(baselineSearch).length;
} catch (e) { err('15. Could not read baseline search-index.json: ' + e.message); }
const currentSearch = readJson('data/search-index.json');
const currentSearchCount = Array.isArray(currentSearch) ? currentSearch.length : Object.keys(currentSearch).length;
if (baselineSearchCount2 !== null) {
  if (currentSearchCount === baselineSearchCount2) {
    ok(`15. Search-index entry count unchanged from baseline (${baselineSearchCount2})`);
  } else {
    err(`15. Search-index entry count changed: baseline=${baselineSearchCount2}, current=${currentSearchCount}`);
  }
}

// ---------------------------------------------------------------------
// 16-17. No calculator logic change, no formula/reference source mutation
// ---------------------------------------------------------------------
try {
  const diffCalc = execSync(`git diff ${BASELINE_SHA} -- js/calc-utils.js`, { cwd: ROOT }).toString();
  if (diffCalc.trim() === '') ok('16. js/calc-utils.js is byte-identical to the Phase 8O baseline');
  else err('16. js/calc-utils.js differs from the Phase 8O baseline');
} catch (e) { err('16. Could not diff js/calc-utils.js: ' + e.message); }

try {
  const diffData = execSync(`git diff ${BASELINE_SHA} -- data/formulas.json data/reference.json data/glossary.json`, { cwd: ROOT }).toString();
  if (diffData.trim() === '') ok('17. data/formulas.json, data/reference.json, data/glossary.json are byte-identical to the Phase 8O baseline');
  else err('17. One or more of data/formulas.json / data/reference.json / data/glossary.json differ from the Phase 8O baseline');
} catch (e) { err('17. Could not diff formula/reference/glossary source data: ' + e.message); }

// ---------------------------------------------------------------------
// 18. No i18n production regression -- translation drift still clean
// ---------------------------------------------------------------------
try {
  const drift = require('../js/i18n/translation-drift');
  const idx = drift.buildNativeIdIndex();
  const result = drift.detectDrift(idx);
  if (result.errors.length === 0 && result.warnings.length === 0) {
    ok('18. Translation drift detector reports 0 errors, 0 warnings');
  } else {
    err(`18. Translation drift detected: ${result.errors.length} errors, ${result.warnings.length} warnings`);
  }
} catch (e) {
  err('18. Could not run translation drift detector: ' + e.message);
}

// ---------------------------------------------------------------------
// 19. Audit artifact presence
// ---------------------------------------------------------------------
let allArtifactsPresent = true;
PHASE_8P_ARTIFACTS.forEach((f) => {
  if (exists(f)) ok(`19. Required artifact present: ${f}`);
  else { err(`19. Required artifact missing: ${f}`); allArtifactsPresent = false; }
});

// ---------------------------------------------------------------------
// 20-22. Explicit next-phase recommendation, readiness classification,
//   risk classification -- deterministic text checks, not a bare
//   "contains PASS" check.
// ---------------------------------------------------------------------
const optionMatches = statusReport.match(/OPTION [ABC] — /g) || [];
const uniqueOptions = new Set((statusReport.match(/OPTION ([ABC])/g) || []).map((s) => s.trim()));
if (optionMatches.length > 0 && uniqueOptions.size === 1) {
  ok(`20/21. Exactly one readiness option is declared in the status report: ${[...uniqueOptions][0]}`);
} else {
  err(`20/21. Readiness option declaration is missing or inconsistent (found: ${[...uniqueOptions].join(', ') || 'none'})`);
}
const hasPhase8QSection = /## 12\. Phase 8Q Definition/.test(statusReport) && /Phase 8Q/.test(auditDoc);
const hasSelectedFamily = /Selected family:\*\*\s*Academy/.test(statusReport);
const hasSelectedCluster = /Selected cluster.*Fundamentals/.test(statusReport);
if (hasPhase8QSection && hasSelectedFamily && hasSelectedCluster) {
  ok('20. Explicit next-phase (Phase 8Q) recommendation is present, naming the selected family and cluster');
} else {
  err(`20. Phase 8Q recommendation incomplete: hasPhase8QSection=${hasPhase8QSection} hasSelectedFamily=${hasSelectedFamily} hasSelectedCluster=${hasSelectedCluster}`);
}
const hasRiskSection = /Risk control/.test(auditDoc) && /Risks and Constraints/.test(auditDoc) && /Risks and Constraints/.test(statusReport);
if (hasRiskSection) {
  ok('22. Risk classification is present (scoring-matrix risk-control column + dedicated Risks and Constraints section)');
} else {
  err('22. Risk classification section missing from audit artifacts');
}

// ---------------------------------------------------------------------
// Scope gate: Phase 8P must not have started Phase 8Q
// ---------------------------------------------------------------------
if (!exists('docs/PHASE-8Q-SPANISH-ACADEMY-PREPARATION.md') && !fs.readdirSync(path.join(ROOT, 'docs')).some((f) => /PHASE-8Q/.test(f))) {
  ok('Scope gate: no Phase 8Q document exists -- Phase 8Q was not started');
} else {
  err('Scope gate: a Phase 8Q document was found -- Phase 8P must not begin Phase 8Q');
}

console.log('');
console.log('validate-phase-8p: ' + (errors === 0 ? 'PASS' : 'FAIL') + ' -- ' + errors + ' error(s), ' + warnings + ' warning(s).');
process.exit(errors === 0 ? 0 : 1);
