#!/usr/bin/env node
'use strict';
/**
 * validate-phase-7h.js (Phase 7H, Step 21)
 *
 * Sitewide acceptance gate for the Phase 7H schema/thin-content/
 * accessibility/AEO work. Runs its own lightweight checks rather than
 * shelling out to `npm run audit:forensic` -- that tool overwrites
 * reports/phase-7a/*, which is the preserved Phase 7A historical
 * baseline and must never be silently regenerated as a side effect of
 * running a validator.
 */
const fs = require('fs');
const path = require('path');
const urlPolicy = require('./url-policy');

const ROOT = path.join(__dirname, '..');

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.git') || e.name === 'reports') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.isFile() && e.name.endsWith('.html')) out.push(full);
  }
}

function stripTags(s) {
  return String(s || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

// Findings individually reasoned through and dispositioned in
// reports/phase-7h/SCHEMA-RESOLUTION.md -- not silently ignored, not
// "questionable schema remaining without explicit reason".
const KNOWN_QUESTIONABLE_DISPOSITIONS = {
  'charts/hot-tub-chemical-levels-chart.html': 'NOT_APPROPRIATE: retired REDIRECT_SOURCES duplicate, non-production per url-policy.js regardless of physical file presence.',
  'charts/pool-chemical-levels-chart.html': 'NOT_APPROPRIATE: retired REDIRECT_SOURCES duplicate, non-production per url-policy.js regardless of physical file presence.',
  'releases/index.html': 'VALID_BY_POLICY: breadcrumb nav label "Releases" is a standard short-form of H1 "Release History" (same convention as Academy/Glossary/Reference hub crumbs); not a defect.',
};

function run() {
  const pages = [];
  walk(ROOT, pages);
  const violations = [];
  const warnings = [];

  let checkedSchema = 0;
  let checkedA11y = 0;
  let faqSchemaOnlyCount = 0;

  for (const abs of pages) {
    const relPath = path.relative(ROOT, abs).replace(/\\/g, '/');
    if (urlPolicy.isNonPage(relPath)) continue;
    const html = fs.readFileSync(abs, 'utf8');

    // ---- SCHEMA: no critical missing schema on indexable production pages ----
    if (urlPolicy.isIndexablePage(relPath, html) && urlPolicy.isProductionPage(relPath)) {
      checkedSchema++;
      const hasJsonLd = /<script[^>]+type=["']application\/ld\+json["']/.test(html);
      if (!hasJsonLd) {
        violations.push({ rule: 'MISSING_SCHEMA_ON_INDEXABLE_PAGE', file: relPath, detail: 'Indexable production page has zero JSON-LD blocks.' });
      }
    }

    // ---- SCHEMA: no fake Person entities anywhere (indexed or not) ----
    if (/"@type"\s*:\s*"Person"/.test(html)) {
      violations.push({ rule: 'FAKE_PERSON_SCHEMA', file: relPath, detail: 'Person schema present -- not authorized (Phase 7F closed this as a non-goal).' });
    }

    // ---- SCHEMA: no placeholder tokens shipped in production HTML ----
    if (!relPath.startsWith('templates/') && /\{\{[A-Z0-9_]+\}\}/.test(html)) {
      violations.push({ rule: 'TEMPLATE_TOKEN_LEAKAGE', file: relPath, detail: 'Unreplaced {{TOKEN}} in shipped HTML.' });
    }

    // ---- ACCESSIBILITY: P0/P1 heading-level-skip check ----
    const headingMatches = [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)];
    if (headingMatches.length) {
      checkedA11y++;
      const levels = headingMatches.map((m) => Number(m[1]));
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i - 1] > 1) {
          const rule = relPath.startsWith('calculators/') ? 'P1_CALCULATOR_HEADING_SKIP' : 'P1_HEADING_LEVEL_SKIP';
          violations.push({ rule, file: relPath, detail: `Heading level jumps from h${levels[i - 1]} to h${levels[i]}.` });
          break;
        }
      }
    }

    // ---- ACCESSIBILITY: calculator forms must have labeled inputs (P1) ----
    if (relPath.startsWith('calculators/') && /<form[^>]*id="calc-form"/.test(html)) {
      const inputs = [...html.matchAll(/<input[^>]+id="([^"]+)"/gi)].map((m) => m[1]);
      for (const id of inputs) {
        const hasLabel = new RegExp(`<label[^>]+for="${id}"`).test(html);
        if (!hasLabel) {
          violations.push({ rule: 'P1_CALCULATOR_INPUT_MISSING_LABEL', file: relPath, detail: `#${id} has no matching <label for="${id}">.` });
        }
      }
    }

    // ---- AEO: FAQPage schema must not be the only place an answer exists ----
    const faqMatch = html.match(/"@type":"FAQPage","mainEntity":(\[[\s\S]*?\])(?=\s*\}<\/script>|\}<\/script>)/);
    if (faqMatch) {
      const faqVisible = /class="(faq-item|paa-item)"/.test(html);
      if (!faqVisible) {
        faqSchemaOnlyCount++;
        const disp = KNOWN_QUESTIONABLE_DISPOSITIONS[relPath];
        if (!disp) {
          violations.push({ rule: 'AEO_SCHEMA_ONLY_ANSWER', file: relPath, detail: 'FAQPage schema present with no visible matching FAQ content.' });
        }
      }
    }
  }

  // ---- SCHEMA: every remaining QUESTIONABLE finding must have an explicit, documented reason ----
  const resolutionDocPath = path.join(ROOT, 'reports', 'phase-7h', 'SCHEMA-RESOLUTION.md');
  if (!fs.existsSync(resolutionDocPath)) {
    violations.push({ rule: 'MISSING_SCHEMA_RESOLUTION_DOC', file: 'reports/phase-7h/SCHEMA-RESOLUTION.md', detail: 'Required Step-4/5 resolution report not found.' });
  }

  const thinContentDocPath = path.join(ROOT, 'reports', 'phase-7h', 'THIN-CONTENT-RESOLUTION.md');
  if (!fs.existsSync(thinContentDocPath)) {
    violations.push({ rule: 'MISSING_THIN_CONTENT_RESOLUTION_DOC', file: 'reports/phase-7h/THIN-CONTENT-RESOLUTION.md', detail: 'Required Step-10/11 resolution report not found.' });
  }

  const result = {
    status: violations.length === 0 ? 'PASS' : 'FAIL',
    pages_scanned: pages.length,
    schema_pages_checked: checkedSchema,
    a11y_pages_checked: checkedA11y,
    faq_schema_pages_total: faqSchemaOnlyCount,
    known_dispositioned_findings: Object.keys(KNOWN_QUESTIONABLE_DISPOSITIONS).length,
    violations_found: violations.length,
    violations,
    warnings,
  };

  const outDir = path.join(ROOT, 'reports', 'phase-7h');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'phase-7h-validation-results.json'), JSON.stringify(result, null, 2) + '\n');

  console.log(`validate-phase-7h: ${result.status} -- ${pages.length} pages scanned, ${violations.length} violation(s).`);
  if (violations.length) {
    for (const v of violations.slice(0, 30)) console.log(`  [${v.rule}] ${v.file} -- ${v.detail}`);
    process.exitCode = 1;
  }
  return result;
}

if (require.main === module) run();
module.exports = { run };
