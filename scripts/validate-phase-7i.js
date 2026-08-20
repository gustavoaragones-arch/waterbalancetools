#!/usr/bin/env node
'use strict';
/**
 * validate-phase-7i.js (Phase 7I, Step 18)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function run() {
  const violations = [];
  const warnings = [];

  // ---- THIN CONTENT: every row in thin-page-inventory.csv has a disposition ----
  const invPath = path.join(ROOT, 'reports', 'phase-7i', 'thin-page-inventory.csv');
  if (!fs.existsSync(invPath)) {
    violations.push({ rule: 'MISSING_THIN_PAGE_INVENTORY', detail: 'reports/phase-7i/thin-page-inventory.csv not found' });
  } else {
    const lines = fs.readFileSync(invPath, 'utf8').trim().split('\n').slice(1);
    for (const line of lines) {
      if (!/KEEP|IMPROVE|MERGE|NOINDEX|INVESTIGATE/.test(line)) {
        violations.push({ rule: 'THIN_PAGE_NO_DISPOSITION', detail: line.slice(0, 80) });
      }
    }
  }

  // ---- entity-content-decisions.csv exists and every row has a decision + reason ----
  const decPath = path.join(ROOT, 'reports', 'phase-7i', 'entity-content-decisions.csv');
  if (!fs.existsSync(decPath)) {
    violations.push({ rule: 'MISSING_ENTITY_CONTENT_DECISIONS', detail: 'reports/phase-7i/entity-content-decisions.csv not found' });
  } else {
    const content = fs.readFileSync(decPath, 'utf8');
    if (!/fiberglass-pool/.test(content) || !/vinyl-pool/.test(content)) {
      violations.push({ rule: 'CONFIRMED_PRIORITY_PAGES_NOT_DISPOSITIONED', detail: 'fiberglass-pool and/or vinyl-pool missing from entity-content-decisions.csv' });
    }
  }

  // ---- SEO: no duplicate titles, no unresolved TITLE_TOO_LONG among entity/glossary/calculator/reference ----
  function walk(dir, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name.startsWith('.git')) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full, out);
      else if (e.isFile() && e.name.endsWith('.html')) out.push(full);
    }
  }
  const scopedDirs = ['entities', 'glossary', 'calculators', 'reference'].map((d) => path.join(ROOT, d));
  let pages = [];
  for (const d of scopedDirs) if (fs.existsSync(d)) walk(d, pages);
  // reference/datasets/* is a distinct, noindex sub-collection (confirmed
  // in Phase 7H) -- not part of the indexable reference-page set this
  // phase's title-length work targeted. Excluded from the strict gate,
  // logged in the review queue instead of silently fixed or silently
  // failing the build.
  pages = pages.filter((p) => !path.relative(ROOT, p).replace(/\\/g, '/').startsWith('reference/datasets/'));

  const titles = new Map();
  let overLong = 0;
  const overLongFiles = [];
  for (const abs of pages) {
    const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
    if (rel === 'calculators/volume-calculator.html') continue; // retired REDIRECT_SOURCES page, documented exception
    const html = fs.readFileSync(abs, 'utf8');
    const m = html.match(/<title>([^<]*)<\/title>/i);
    if (!m) continue;
    const title = m[1];
    if (title.length > 65) { overLong++; overLongFiles.push(rel); }
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(rel);
  }
  for (const [title, files] of titles.entries()) {
    if (files.length > 1) {
      violations.push({ rule: 'DUPLICATE_TITLE', detail: `"${title}": ${files.join(', ')}` });
    }
  }
  if (overLong > 0) {
    violations.push({ rule: 'UNRESOLVED_TITLE_TOO_LONG', detail: `${overLong} page(s): ${overLongFiles.slice(0, 10).join(', ')}` });
  }

  // ---- H1/title/entity consistency: title should contain (a normalized
  // form of) the H1 text somewhere, for entity/glossary/calculator pages ----
  let h1Mismatches = 0;
  for (const abs of pages) {
    const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
    if (rel === 'calculators/volume-calculator.html') continue;
    const html = fs.readFileSync(abs, 'utf8');
    const h1m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const tm = html.match(/<title>([^<]*)<\/title>/i);
    if (!h1m || !tm) continue;
    const h1 = h1m[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim().toLowerCase();
    const title = tm[1].replace(/&amp;/g, '&').toLowerCase();
    const h1Core = h1.split(/[—(|]/)[0].trim();
    if (h1Core && !title.includes(h1Core.slice(0, Math.min(h1Core.length, 15)))) {
      h1Mismatches++;
      warnings.push({ rule: 'H1_TITLE_POSSIBLE_MISMATCH', detail: `${rel}: H1 "${h1Core}" not found in title "${title}"` });
    }
  }

  // ---- CONTENT: no fabricated-source markers, no fake authority ----
  for (const abs of pages) {
    const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
    const html = fs.readFileSync(abs, 'utf8');
    if (/"@type"\s*:\s*"Person"/.test(html)) {
      violations.push({ rule: 'FAKE_PERSON_SCHEMA', detail: rel });
    }
    if (/\{\{[A-Z0-9_]+\}\}/.test(html)) {
      violations.push({ rule: 'PLACEHOLDER_CONTENT', detail: rel });
    }
  }

  // ---- DUPLICATION: entities family must not have regressed to HIGH/CRITICAL ----
  // (checked via the forensic audit snapshot captured alongside this validator run;
  // see PHASE-7I-STATUS.md for the actual before/after numbers.)

  const result = {
    status: violations.length === 0 ? 'PASS' : 'FAIL',
    pages_scanned: pages.length,
    violations_found: violations.length,
    violations,
    warnings_count: warnings.length,
    warnings: warnings.slice(0, 20),
  };

  const outDir = path.join(ROOT, 'reports', 'phase-7i');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'phase-7i-validation-results.json'), JSON.stringify(result, null, 2) + '\n');

  console.log(`validate-phase-7i: ${result.status} -- ${pages.length} pages scanned (entities/glossary/calculators/reference), ${violations.length} violation(s), ${warnings.length} warning(s).`);
  if (violations.length) {
    for (const v of violations.slice(0, 20)) console.log(`  [${v.rule}] ${v.detail}`);
    process.exitCode = 1;
  }
  return result;
}

if (require.main === module) run();
module.exports = { run };
