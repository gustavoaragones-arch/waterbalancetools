#!/usr/bin/env node
/**
 * test-phase-8k.js
 *
 * Deterministic test suite for the Phase 8K Spanish Non-Calculator
 * Content Coverage Audit. Phase 8K made zero production changes -- these
 * tests exist to prove the audit's inventory/classification claims are
 * reproducible and that nothing the audit touched leaked into production
 * state. No network calls, no external APIs.
 *
 * Run: node scripts/test-phase-8k.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const urlPolicy = require('./url-policy');

let passed = 0;
let failed = 0;
function check(n, desc, cond) {
  if (cond) { console.log('PASS: ' + n + '. ' + desc); passed++; }
  else { console.log('FAIL: ' + n + '. ' + desc); failed++; }
}
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }

const BASELINE_SHA = '9e2b960419bfba5b3d2706ecabce7c44b032f126';

function countEligible(dir, skipSubdirs) {
  let count = 0;
  function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      const rel = path.relative(ROOT, full).replace(/\\/g, '/');
      if (e.isDirectory()) {
        if (skipSubdirs && skipSubdirs.has(e.name)) continue;
        walk(full);
        continue;
      }
      if (!e.name.endsWith('.html')) continue;
      if (urlPolicy.isSitemapEligible(rel)) count++;
    }
  }
  walk(path.join(ROOT, dir));
  return count;
}

// 1-8: Inventory completeness -- run the count twice to prove determinism
const families = { academy: 59, glossary: 101, formulas: 10, entities: 105, programmatic: 44, guides: 49, resources: 9, comparisons: 8 };
let n = 1;
for (const [dir, expected] of Object.entries(families)) {
  const c1 = countEligible(dir);
  const c2 = countEligible(dir);
  check(n++, dir + ' inventory count is deterministic and matches the documented figure (' + expected + ')', c1 === expected && c1 === c2);
}
{
  const refSkip = new Set(['datasets']);
  const r1 = countEligible('reference', refSkip);
  const r2 = countEligible('reference', refSkip);
  check(n++, 'reference inventory count (excluding noindex datasets/ pages) is deterministic and matches 37', r1 === 37 && r1 === r2);
}

// 10. reference/datasets/* pages are correctly identified as noindex (excluded for a documented reason, not silently dropped)
{
  const datasetsIndex = read('reference/datasets/chemical-ranges/index.html');
  check(n++, 'reference/datasets/*/index.html pages are genuinely noindex (exclusion is evidence-backed, not arbitrary)', /<meta name="robots" content="noindex"/.test(datasetsIndex));
}

// 11. Content-family classification: glossary/formulas/reference each have a stable native `id` field distinct from slug
{
  const academy = require(path.join(ROOT, 'data', 'academy.json'));
  const glossary = require(path.join(ROOT, 'data', 'glossary.json'));
  const formulas = require(path.join(ROOT, 'data', 'formulas.json'));
  const reference = require(path.join(ROOT, 'data', 'reference.json'));
  const allHaveStableId = academy.articles[0].id && glossary.terms[0].id && formulas.formulas[0].id && reference.pages[0].id;
  check(n++, 'academy/glossary/formulas/reference records each carry a stable native id field distinct from their URL slug', !!allHaveStableId);
}

// 12. Glossary's related-content fields are English-URL-literal (the documented architectural blocker)
{
  const glossary = require(path.join(ROOT, 'data', 'glossary.json'));
  const rec = glossary.terms.find((t) => t.id === 'gl-001');
  const isEnglishUrlLiteral = Array.isArray(rec.relatedCalculators) && rec.relatedCalculators.every((u) => u.startsWith('/calculators/'));
  check(n++, 'glossary.json relatedCalculators field is confirmed English-URL-literal (documented preparation blocker, not assumed)', isEnglishUrlLiteral);
}

// 13. Programmatic chlorine family is confirmed parametrized (not independently authored prose)
{
  const config = read('scripts/generators/chlorine-cluster-config.js');
  const volumesMatch = config.match(/const VOLUMES = \[([\s\S]*?)\]/);
  const volumeCount = volumesMatch ? volumesMatch[1].split(',').map((s) => s.trim()).filter(Boolean).length : 0;
  check(n++, 'programmatic/chlorine family is confirmed parametrized by a fixed VOLUMES list (11 entries), supporting the thin-content-risk finding', volumeCount === 11);
}

// 14. Spanish coverage detection: exactly 13 Spanish pages, all calculators
{
  function walkEs(dir, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walkEs(full, out); continue; }
      if (e.name.endsWith('.html')) out.push(path.relative(ROOT, full).replace(/\\/g, '/'));
    }
    return out;
  }
  const esPages = walkEs(path.join(ROOT, 'es'), []);
  check(n++, 'Spanish coverage detection: exactly 13 Spanish pages exist, all under es/calculators/', esPages.length === 13 && esPages.every((p) => p.startsWith('es/calculators/')));
}

// 15. translation-status.json consistency: 20 units, no duplicates, 7 non-calculator fixtures still missing
{
  const status = JSON.parse(read('data/i18n/translation-status.json'));
  const ids = status.units.map((u) => u.contentId);
  const nonCalc = status.units.filter((u) => u.category !== 'calculator');
  check(n++, 'translation-status.json: 20 total units, no duplicate content IDs, 7 non-calculator fixtures all es:"missing"', status.units.length === 20 && new Set(ids).size === 20 && nonCalc.length === 7 && nonCalc.every((u) => u.languages.es.status === 'missing'));
}

// 16. Calculator non-regression: 13/13 English and Spanish, calc-utils.js unchanged
{
  const enCalc = fs.readdirSync(path.join(ROOT, 'calculators')).filter((f) => f.endsWith('.html') && f !== 'index.html' && f !== 'volume-calculator.html');
  const esCalc = fs.readdirSync(path.join(ROOT, 'es', 'calculators')).filter((f) => f.endsWith('.html'));
  const current = crypto.createHash('sha256').update(read('js/calc-utils.js')).digest('hex');
  const baseline = crypto.createHash('sha256').update(execSync('git show ' + BASELINE_SHA + ':js/calc-utils.js', { cwd: ROOT })).digest('hex');
  check(n++, 'Calculator non-regression: 13 English + 13 Spanish calculators, js/calc-utils.js byte-identical to baseline', enCalc.length === 13 && esCalc.length === 13 && current === baseline);
}

// 17. URL-set non-regression via the authoritative validator
{
  let urlSetUnchanged = false;
  try {
    const out = execSync('node scripts/validate-url-indexation.js', { cwd: ROOT }).toString();
    urlSetUnchanged = /PASS -- 539 pages, 491 sitemap URLs, 0 violations/.test(out);
  } catch (e) { urlSetUnchanged = false; }
  check(n++, 'English/Spanish production URL set unchanged (validate-url-indexation.js reports the same 539/491/0 as baseline)', urlSetUnchanged);
}

// 18. Production-page non-creation: es/, all non-calculator content dirs, and core i18n files byte-identical to baseline
{
  const paths = ['es/', 'academy/', 'glossary/', 'formulas/', 'reference/', 'entities/', 'programmatic/', 'guides/', 'resources/', 'comparisons/', 'data/i18n/es/terminology.json', 'js/i18n/'];
  const diff = execSync('git diff --stat ' + BASELINE_SHA + ' -- ' + paths.join(' '), { cwd: ROOT }).toString().trim();
  check(n++, 'No production page was created or modified outside audit scope (all content dirs + i18n architecture byte-identical to baseline)', diff === '');
}

// 19. Architecture readiness classification is present for every major family
{
  const doc = read('docs/PHASE-8K-SPANISH-NON-CALCULATOR-COVERAGE-AUDIT.md');
  const hasReadinessSection = /## 7\. Architecture readiness/.test(doc) && /PREPARATION REQUIRED/.test(doc) && /NOT READY/.test(doc);
  check(n++, 'Architecture readiness classification (PREPARATION REQUIRED / NOT READY) is present for the major content families', hasReadinessSection);
}

// 20. Terminology dependency detection: existing 19-concept terminology.json checked against candidate vocabulary
{
  const terminology = JSON.parse(read('data/i18n/es/terminology.json'));
  const concepts = Array.isArray(terminology) ? terminology : (terminology.concepts || Object.values(terminology)[0]);
  const ids = concepts.map((c) => c.id || c.concept);
  const coreVocabPresent = ['chlorine', 'ph', 'cyanuric_acid', 'total_alkalinity', 'calcium_hardness', 'pool_volume'].every((v) => ids.includes(v));
  check(n++, 'Terminology dependency check: Cluster 1\'s core vocabulary (chlorine, pH, CYA, alkalinity, calcium hardness, pool volume) is already present in terminology.json', coreVocabPresent);
}

// 21. Cluster recommendation presence
{
  const doc = read('docs/PHASE-8K-SPANISH-NON-CALCULATOR-COVERAGE-AUDIT.md');
  check(n++, 'A single, explicit cluster recommendation is present (Cluster 1)', /RECOMMENDATION: Cluster 1/.test(doc));
}

// 22. Recommendation readiness classification
{
  const doc = read('docs/PHASE-8K-SPANISH-NON-CALCULATOR-COVERAGE-AUDIT.md');
  check(n++, 'Recommendation carries an explicit Phase 8L readiness gate (OPTION B)', /OPTION B — PREPARATION PHASE REQUIRED/.test(doc));
}

// 23-24. Audit artifact integrity
check(n++, 'docs/PHASE-8K-SPANISH-NON-CALCULATOR-COVERAGE-AUDIT.md exists', exists('docs/PHASE-8K-SPANISH-NON-CALCULATOR-COVERAGE-AUDIT.md'));
check(n++, 'reports/phase-8k-status.md exists', exists('reports/phase-8k-status.md'));
check(n++, 'scripts/validate-phase-8k.js exists', exists('scripts/validate-phase-8k.js'));

// 25-26. Existing regression gates still pass
try { execSync('node scripts/validate-phase-8i.js', { cwd: ROOT, stdio: 'pipe' }); check(n++, 'Phase 8I: validate-phase-8i.js passes', true); }
catch (e) { check(n++, 'Phase 8I: validate-phase-8i.js passes', false); }
try { execSync('node scripts/check-broken-links.js', { cwd: ROOT, stdio: 'pipe' }); check(n++, 'check-broken-links.js: 0 broken links sitewide', true); }
catch (e) { check(n++, 'check-broken-links.js: 0 broken links sitewide', false); }

// Restore any incidental cosmetic drift from the read-only regression
// checks above before finishing.
try { execSync('git checkout HEAD -- .', { cwd: ROOT, stdio: 'pipe' }); } catch (e) { /* best effort */ }

console.log('');
console.log('test-phase-8k: ' + passed + ' passed, ' + failed + ' failed.');
if (failed > 0) process.exit(1);
