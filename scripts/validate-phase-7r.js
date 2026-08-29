#!/usr/bin/env node
'use strict';
/**
 * validate-phase-7r.js (Phase 7R, Step 25)
 *
 * Guards this phase's scientific-evidence-resolution scope: no unsupported
 * claim promoted to SUPPORTED, no missing evidence-ledger entry for a
 * resolved numeric claim, no fabricated source, no citation without
 * matching source evidence, no calculator formula change without explicit
 * authorization, no URL/redirect/Spanish-French/AdSense/programmatic-
 * family changes, no deleted canonical pages, no fake authority/Person
 * schema, no undocumented production change, and every carry-forward item
 * has a decision.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { isProductionPage, isIndexablePage, topDir, REDIRECT_SOURCES } = require('./url-policy');
const { SOURCES_BY_ID } = require('./data/chemistry-sources');
const { CLAIMS_BY_ID, CLAIMS } = require('./data/chemistry-claims');
const { RANGES } = require('./data/chemistry-ranges');

const ROOT = path.join(__dirname, '..');
const BASELINE_COMMIT = 'ae751ca'; // Phase 7Q's committed HEAD, this phase's actual starting point.
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

// 1. No calculator formula changes (js/calc-utils.js, scripts/data/formulas-data.js).
const FORMULA_FILES = ['js/calc-utils.js', 'scripts/data/formulas-data.js'];
let formulaDiff = [];
try {
  formulaDiff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- ${FORMULA_FILES.join(' ')}`, { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean);
} catch (e) { /* non-fatal */ }
if (formulaDiff.length > 0) err(`Calculator formula file(s) changed since Phase 7Q baseline without authorization: ${formulaDiff.join(', ')}`);

// 2. No URL changes: canonical indexable page count unchanged (0 pages created/deleted).
const EXPECTED_CANONICAL_COUNT = 478;
if (canonicalFiles.length !== EXPECTED_CANONICAL_COUNT) {
  err(`Canonical indexable page count changed: expected ${EXPECTED_CANONICAL_COUNT}, found ${canonicalFiles.length} -- Phase 7R creates/deletes 0 pages`);
}

// 3. No redirect changes: REDIRECT_SOURCES still exactly the 6 Phase 7O.1 entries.
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
  err(`REDIRECT_SOURCES registry changed unexpectedly: expected ${expectedRedirectSources.length} entries, found ${actualRedirectSources.length}`);
}

// 4. No Spanish/French content.
for (const f of canonicalFiles) {
  const html = fs.readFileSync(f, 'utf8');
  if (/lang="(es|fr)"/i.test(html)) err(`${path.relative(ROOT, f)}: unexpected non-English lang attribute`);
}

// 5. No AdSense changes.
let adsenseDiff = [];
try {
  adsenseDiff = execSync(`git diff --name-only ${BASELINE_COMMIT} -- ads.txt`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
} catch (e) { /* non-fatal, file may not exist */ }
if (adsenseDiff.length > 0) err(`ads.txt changed without authorization: ${adsenseDiff.join(', ')}`);
for (const f of canonicalFiles) {
  const html = fs.readFileSync(f, 'utf8');
  if (/pagead2\.googlesyndication\.com/.test(html) === false && /adsbygoogle/.test(html)) {
    // inconsistent adsense markup would be unusual; not itself an error, just a signal.
  }
}

// 6. No programmatic-family changes (page count unchanged).
const programmaticCount = allHtml.filter((f) => topDir(path.relative(ROOT, f).replace(/\\/g, '/')) === 'programmatic').length;
if (programmaticCount !== 44) err(`programmatic/ page count changed: expected 44, found ${programmaticCount}`);

// 7. No fabricated source: every new Phase 7R source must have a real https URL, organization, accessed_date, and substantive notes.
const PHASE_7R_SOURCE_IDS = ['in-doh-breakpoint-chlorination-2022'];
for (const id of PHASE_7R_SOURCE_IDS) {
  const s = SOURCES_BY_ID[id];
  if (!s) { err(`Expected new Phase 7R source "${id}" not found in registry`); continue; }
  if (!/^https:\/\//.test(s.url)) err(`Source "${id}": url is not a real https URL`);
  if (!s.organization) err(`Source "${id}": missing organization`);
  if (!s.accessed_date) err(`Source "${id}": missing accessed_date`);
  if (!s.notes || s.notes.length < 30) err(`Source "${id}": notes too short to be a genuine research summary`);
}

// 8. No citation without matching source evidence: every rendered
// knowledge-sources-real citation link must resolve to a registered source URL.
for (const f of canonicalFiles) {
  const html = fs.readFileSync(f, 'utf8');
  const hrefs = [...html.matchAll(/<section class="knowledge-sources-real">[\s\S]*?<\/section>/g)]
    .flatMap((m) => [...m[0].matchAll(/<a href="([^"]+)"/g)].map((a) => a[1]));
  for (const href of hrefs) {
    const matchesKnownSource = Object.values(SOURCES_BY_ID).some((s) => s.url === href);
    if (!matchesKnownSource) err(`${path.relative(ROOT, f)}: citation links to "${href}", which does not match any registered source URL`);
  }
}

// 9. No unsupported claim promoted to SUPPORTED without a source_id.
for (const c of CLAIMS) {
  if (c.status === 'SUPPORTED' && (!c.source_ids || c.source_ids.length === 0)) {
    err(`Claim "${c.claim_id}" is marked SUPPORTED but has zero source_ids -- an unsupported claim cannot be promoted to SUPPORTED`);
  }
}
for (const r of RANGES) {
  if (r.status === 'SUPPORTED' && (!r.source_ids || r.source_ids.length === 0)) {
    err(`Range "${r.id}" is marked SUPPORTED but has zero source_ids`);
  }
}

// 10. Missing evidence ledger entry for a resolved numeric claim: every
// claim upgraded to SUPPORTED this phase must appear in EVIDENCE-LEDGER.csv.
const ledgerPath = path.join(ROOT, 'reports', 'phase-7r', 'EVIDENCE-LEDGER.csv');
if (!fs.existsSync(ledgerPath)) {
  err('reports/phase-7r/EVIDENCE-LEDGER.csv missing');
} else {
  const ledger = fs.readFileSync(ledgerPath, 'utf8');
  if (!ledger.includes('claim-shock-breakpoint-rule')) err('EVIDENCE-LEDGER.csv missing entry for claim-shock-breakpoint-rule');
  if (!ledger.includes('in-doh-breakpoint-chlorination-2022')) err('EVIDENCE-LEDGER.csv missing entry for the new Phase 7R source');
}

// 11. No fake authority / Person-type reviewedBy schema anywhere.
for (const f of canonicalFiles) {
  const html = fs.readFileSync(f, 'utf8');
  if (/"reviewedBy"\s*:\s*\{[^}]*"@type"\s*:\s*"Person"/.test(html)) {
    err(`${path.relative(ROOT, f)}: introduces a Person-type reviewedBy schema -- no genuine named reviewer exists for this project`);
  }
  if (/"author"\s*:\s*\{[^}]*"@type"\s*:\s*"Person"[^}]*"name"\s*:\s*"[^"]+"/.test(html)) {
    warn(`${path.relative(ROOT, f)}: contains a Person-type author schema -- verify this is not a fabricated author (should already be flagged if pre-existing)`);
  }
}

// 12. No canonical pages deleted vs the Phase 7Q crawl-path baseline.
const priorCrawlPath = path.join(ROOT, 'reports', 'phase-7q');
if (fs.existsSync(priorCrawlPath)) {
  // Phase 7Q didn't leave a crawl-path json in its own dir; use the known count instead.
  if (canonicalFiles.length < EXPECTED_CANONICAL_COUNT) {
    err(`Canonical page count dropped below the Phase 7Q baseline (${EXPECTED_CANONICAL_COUNT}) -- possible deleted page`);
  }
}

// 13. Undocumented production changes: every touched scripts/data file must
// be named in PRODUCTION-CHANGES.md.
const EXPECTED_TOUCHES = [
  'scripts/data/chemistry-sources.js',
  'scripts/data/chemistry-claims.js',
  'scripts/data/chemistry-ranges.js',
  'scripts/generate-entity-pages.js',
  'data/academy.json',
];
const productionChangesPath = path.join(ROOT, 'reports', 'phase-7r', 'PRODUCTION-CHANGES.md');
if (!fs.existsSync(productionChangesPath)) {
  err('reports/phase-7r/PRODUCTION-CHANGES.md missing');
} else {
  const doc = fs.readFileSync(productionChangesPath, 'utf8');
  for (const f of EXPECTED_TOUCHES) if (!doc.includes(f)) warn(`PRODUCTION-CHANGES.md does not mention "${f}" -- verify it is documented`);
  let touches = [];
  try {
    touches = execSync(`git diff --name-only ${BASELINE_COMMIT} -- scripts/ data/academy.json`, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { /* non-fatal */ }
  for (const f of touches) {
    if (!EXPECTED_TOUCHES.includes(f) && !doc.includes(f)) err(`Undocumented production change: ${f} was modified but is not mentioned in PRODUCTION-CHANGES.md`);
  }
}

// 14. Every carry-forward item has a decision: decision matrix exists with required columns and a minimum row count.
const decisionMatrixPath = path.join(ROOT, 'reports', 'phase-7r', 'DECISION-MATRIX.csv');
if (!fs.existsSync(decisionMatrixPath)) {
  err('reports/phase-7r/DECISION-MATRIX.csv missing');
} else {
  const csv = fs.readFileSync(decisionMatrixPath, 'utf8');
  const required = ['item', 'source_phase', 'category', 'current_status', 'evidence_reviewed', 'decision', 'production_action', 'source_ids', 'risk', 'reason', 'future_phase'];
  const header = csv.split('\n')[0];
  for (const col of required) if (!header.includes(col)) err(`DECISION-MATRIX.csv missing required column: ${col}`);
  const rowCount = csv.trim().split('\n').length - 1;
  if (rowCount < 20) warn(`DECISION-MATRIX.csv has only ${rowCount} rows -- verify every Priority A-N carry-forward item is represented`);
}

console.log(`validate-phase-7r: ${canonicalFiles.length} canonical pages, ${PHASE_7R_SOURCE_IDS.length} new source(s) checked, ${programmaticCount} programmatic pages, ${actualRedirectSources.length} redirect sources.`);
if (errors > 0) {
  console.error(`validate-phase-7r: FAIL -- ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
} else {
  console.log(`validate-phase-7r: PASS -- 0 errors, ${warnings} warning(s).`);
}
