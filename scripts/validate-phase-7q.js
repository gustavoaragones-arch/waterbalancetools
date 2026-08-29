#!/usr/bin/env node
'use strict';
/**
 * validate-phase-7q.js (Phase 7Q, Step 19)
 *
 * Guards the scope boundaries this phase was explicitly bound to: no
 * calculator formula changes, no unexpected URL/redirect-registry
 * changes, no Spanish/French, no fabricated source records, no mass page
 * creation, no fake authors/reviewers, no programmatic-family
 * restructuring, no unsupported chemistry claims promoted, no citation
 * block without a resolvable registered source, no deleted canonical
 * pages, and every newly-touched production file documented.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { isProductionPage, isIndexablePage, topDir, REDIRECT_SOURCES } = require('./url-policy');
const { SOURCES_BY_ID } = require('./data/chemistry-sources');

const ROOT = path.join(__dirname, '..');
let errors = 0;
let warnings = 0;
const err = (msg) => { console.error('ERROR: ' + msg); errors++; };
const warn = (msg) => { console.warn('WARN: ' + msg); warnings++; };

const SKIP_DIRS = new Set(['node_modules', '.git', 'reports', 'templates', 'partials', 'components']);
function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
}
const allHtml = [];
walk(ROOT, allHtml);
const canonicalFiles = allHtml.filter((f) => {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  return isProductionPage(rel) && isIndexablePage(rel);
});

// 1. Calculator formula files must be byte-unchanged vs the Phase 7P baseline commit.
const FORMULA_FILES = ['scripts/data/formulas-data.js', 'scripts/chemistry/formulas.js'];
let formulaDiff = [];
try {
  formulaDiff = execSync('git diff --name-only 2a3a682 -- ' + FORMULA_FILES.filter((f) => fs.existsSync(path.join(ROOT, f))).join(' '), { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean);
} catch (e) { /* file may not exist; non-fatal */ }
if (formulaDiff.length > 0) err(`Calculator formula file(s) changed since Phase 7P baseline (out of scope): ${formulaDiff.join(', ')}`);

// 2. No mass page creation / no unexpected URL changes: canonical indexable
// page count must equal the Phase 7P baseline exactly (478) -- Phase 7Q
// creates 0 new pages.
const EXPECTED_CANONICAL_COUNT = 478;
if (canonicalFiles.length !== EXPECTED_CANONICAL_COUNT) {
  err(`Canonical indexable page count changed: expected ${EXPECTED_CANONICAL_COUNT} (Phase 7P baseline, 0 pages created this phase), found ${canonicalFiles.length}`);
}

// 3. Redirect-registry must be unchanged (still exactly the 6 Phase 7O.1 entries).
const expectedRedirectSources = [
  'calculators/volume-calculator.html',
  'charts/hot-tub-chemical-levels-chart.html',
  'charts/pool-chemical-levels-chart.html',
  'printables/pool-maintenance-checklist.html',
  'printables/hot-tub-maintenance-log.html',
  'printables/airbnb-pool-turnover-checklist.html',
];
const actualRedirectSources = Object.keys(REDIRECT_SOURCES);
if (actualRedirectSources.length !== expectedRedirectSources.length || !expectedRedirectSources.every((k) => actualRedirectSources.includes(k))) {
  err(`REDIRECT_SOURCES registry changed unexpectedly: expected exactly ${expectedRedirectSources.length} entries, found ${actualRedirectSources.length}`);
}

// 4. No Spanish/French content anywhere in production HTML.
for (const f of canonicalFiles) {
  const html = fs.readFileSync(f, 'utf8');
  if (/lang="(es|fr)"/i.test(html)) err(`${path.relative(ROOT, f)}: unexpected non-English lang attribute`);
}

// 5. No programmatic-family restructuring (page count unchanged from Phase 7O.1/7P baseline).
const programmaticCount = allHtml.filter((f) => topDir(path.relative(ROOT, f).replace(/\\/g, '/')) === 'programmatic').length;
if (programmaticCount !== 44) err(`programmatic/ page count changed: expected 44 (unchanged since Phase 7O.1), found ${programmaticCount}`);

// 6. Fabricated source records: every source added this phase must have a
// real-looking https URL, organization, and accessed_date -- structural
// completeness check (truthfulness itself is verified by the human research
// process documented in RESEARCH.md, not mechanically checkable).
const PHASE_7Q_SOURCE_IDS = [
  'phta-water-conservation-droughts-2021',
  'phta-calcium-hypochlorite-fact-sheet-2021',
];
for (const id of PHASE_7Q_SOURCE_IDS) {
  const s = SOURCES_BY_ID[id];
  if (!s) { err(`Expected new Phase 7Q source "${id}" not found in registry`); continue; }
  if (!/^https:\/\//.test(s.url)) err(`Source "${id}": url is not a real https URL`);
  if (!s.organization) err(`Source "${id}": missing organization`);
  if (!s.accessed_date) err(`Source "${id}": missing accessed_date`);
  if (!s.notes || s.notes.length < 30) err(`Source "${id}": notes too short to be a genuine research summary`);
}

// 7. Every rendered knowledge-sources-real citation block must cite only
// source IDs that actually resolve in the registry (no dangling/fabricated
// citation link).
for (const f of canonicalFiles) {
  const html = fs.readFileSync(f, 'utf8');
  const hrefs = [...html.matchAll(/<section class="knowledge-sources-real">[\s\S]*?<\/section>/g)]
    .flatMap((m) => [...m[0].matchAll(/<a href="([^"]+)"/g)].map((a) => a[1]));
  for (const href of hrefs) {
    const matchesKnownSource = Object.values(SOURCES_BY_ID).some((s) => s.url === href);
    if (!matchesKnownSource) err(`${path.relative(ROOT, f)}: citation links to "${href}", which does not match any registered source URL`);
  }
}

// 8. No fake authors/reviewers introduced (no new "reviewedBy" / "author"
// person-name schema fields added anywhere this phase).
for (const f of canonicalFiles) {
  const html = fs.readFileSync(f, 'utf8');
  if (/"reviewedBy"\s*:\s*\{[^}]*"@type"\s*:\s*"Person"/.test(html)) {
    err(`${path.relative(ROOT, f)}: introduces a Person-type reviewedBy schema -- no genuine named reviewer exists for this project`);
  }
}

// 9. No deleted canonical pages: every page present in the Phase 7P
// crawl-path-simulation's discovered set must still exist.
const priorCrawlPath = path.join(ROOT, 'reports', 'phase-7p', 'CRAWL-PATH-SIMULATION.json');
if (fs.existsSync(priorCrawlPath)) {
  const prior = JSON.parse(fs.readFileSync(priorCrawlPath, 'utf8'));
  if (prior.total_canonical_indexable_pages && prior.total_canonical_indexable_pages > canonicalFiles.length) {
    err(`Canonical page count dropped since Phase 7P (${prior.total_canonical_indexable_pages} -> ${canonicalFiles.length}) -- possible deleted page`);
  }
}

// 10. Undocumented production changes: every non-generated source/data file
// touched this phase must be named in PRODUCTION-CHANGES.md.
const productionChangesPath = path.join(ROOT, 'reports', 'phase-7q', 'PRODUCTION-CHANGES.md');
const EXPECTED_SOURCE_TOUCHES = [
  'scripts/data/chemistry-sources.js',
  'scripts/generate-entity-pages.js',
  'data/entities/equipment.json',
  'data/academy.json',
  'scripts/audit-forensic/lib/derive.js',
  'scripts/generate-sitemap.js',
];
if (fs.existsSync(productionChangesPath)) {
  const doc = fs.readFileSync(productionChangesPath, 'utf8');
  for (const f of EXPECTED_SOURCE_TOUCHES) {
    if (!doc.includes(f)) warn(`PRODUCTION-CHANGES.md does not mention "${f}" -- verify it is documented`);
  }
} else {
  err('reports/phase-7q/PRODUCTION-CHANGES.md missing');
}
// Only sweep scripts/ (hand-authored code, rarely touched by the build
// itself) for undocumented changes -- data/ is deliberately excluded here
// because dozens of data/*.json files are legitimately regenerated as
// ordinary output by generators during `npm run build` (navigation.json,
// compatibility.json, indexing/*.json, etc.); that is expected build
// churn, not an undocumented production change, and is the same class of
// non-issue as the already-documented QA-timestamp/footer-whitespace
// nondeterminism. Deliberate data/ edits are verified above instead, by
// name, against EXPECTED_SOURCE_TOUCHES.
let sourceTouches = [];
try {
  sourceTouches = execSync('git diff --name-only 2a3a682 -- scripts/', { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
} catch (e) { /* non-fatal */ }
for (const f of sourceTouches) {
  if (!EXPECTED_SOURCE_TOUCHES.includes(f) && fs.existsSync(productionChangesPath)) {
    const doc = fs.readFileSync(productionChangesPath, 'utf8');
    if (!doc.includes(f)) err(`Undocumented production change: ${f} was modified but is not mentioned in PRODUCTION-CHANGES.md`);
  }
}

// 11. Decision matrix and review queue must exist and cover every carried-forward item.
const decisionMatrixPath = path.join(ROOT, 'reports', 'phase-7q', 'DECISION-MATRIX.csv');
if (!fs.existsSync(decisionMatrixPath)) {
  err('reports/phase-7q/DECISION-MATRIX.csv missing');
} else {
  const csv = fs.readFileSync(decisionMatrixPath, 'utf8');
  const required = ['item', 'source_phase', 'category', 'current_status', 'evidence_reviewed', 'decision', 'action', 'production_change', 'source_ids', 'risk', 'reason', 'future_phase'];
  const header = csv.split('\n')[0];
  for (const col of required) if (!header.includes(col)) err(`DECISION-MATRIX.csv missing required column: ${col}`);
  const rowCount = csv.trim().split('\n').length - 1;
  if (rowCount < 14) warn(`DECISION-MATRIX.csv has only ${rowCount} rows -- verify every Priority A-N carry-forward item is represented`);
}

console.log(`validate-phase-7q: ${canonicalFiles.length} canonical pages, ${PHASE_7Q_SOURCE_IDS.length} new sources checked, ${programmaticCount} programmatic pages, ${actualRedirectSources.length} redirect sources.`);
if (errors > 0) {
  console.error(`validate-phase-7q: FAIL -- ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
} else {
  console.log(`validate-phase-7q: PASS -- 0 errors, ${warnings} warning(s).`);
}
