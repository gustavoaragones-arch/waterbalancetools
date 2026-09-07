#!/usr/bin/env node
/**
 * generate-spanish-knowledge-cluster.js
 *
 * Phase 8N launched the first Spanish production cluster for the
 * Glossary, Formula Library, and Reference families, mirroring exactly
 * how generate-spanish-cluster.js (Phase 8E) writes es/calculators/ --
 * a small, standalone generator script that writes translated output to
 * es/<family>/, run once per build, never a modification to the existing
 * English-mode generation loop in generate-glossary.js/generate-formulas.js/
 * generate-reference.js. Phase 8O completed the cluster: all 100 glossary
 * records (not just the 54-record first wave), full formula variable/
 * equation-label localization, and full reference table localization.
 *
 * Unlike the calculator cluster (which translates already-rendered English
 * HTML via string substitution), this cluster renders DIRECTLY from data:
 * generateTerm(term, 'es') / generateFormula(formula, 'es') /
 * generateRefPage(page, 'es') read each record's embedded `es` object
 * (Phase 8L/8M's data model) and were made locale-aware for chrome text
 * and content headings in Phase 8N (see js/i18n/../scripts/template-utils.js
 * localizeRecord()/chrome()). No second template or rendering path exists.
 *
 * Deterministic, data-driven scope (Phase 8O Section 2/12 -- no
 * hand-picked file list):
 *   - Glossary: every one of the 100 records in data/glossary.json --
 *     the Phase 8L 54-candidate manifest was the FIRST wave only; Phase
 *     8O completed the remaining 46, so full `es` coverage (not a
 *     manifest cross-check) is now the correctness invariant.
 *   - Formulas: all 9 records in data/formulas.json (every formula is
 *     in-scope per the Phase 8M contract).
 *   - Reference: exactly the pages carrying an `es` object, cross-checked
 *     1:1 against js/i18n/reference-locale-scope.js#getJsonDrivenScope()
 *     (the 25 JSON-driven pages; the 11 legacy + 16 noindex-dataset pages
 *     are structurally excluded because they have no data/reference.json
 *     record to carry an `es` object at all).
 *
 * A mismatch in any of these invariants throws rather than silently
 * generating a different-than-approved set -- this is a production
 * cluster, not a best-effort pass.
 *
 * Run: node scripts/generate-spanish-knowledge-cluster.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { writeFile } = require('./template-utils');
const { getJsonDrivenScope } = require('../js/i18n/reference-locale-scope');

const ROOT = path.join(__dirname, '..');

const { generateTerm, data: glossaryData } = require('./generate-glossary');
const { generateFormula, data: formulasData } = require('./generate-formulas');
const { generateRefPage, data: referenceData } = require('./generate-reference');

function run() {
  let written = 0;
  const writtenFiles = [];

  // ── Glossary: full 100-record coverage (Phase 8O) ───────────────────────
  const allGlossaryTerms = glossaryData.terms || [];
  const glossaryTerms = allGlossaryTerms.filter((t) => t.es);
  if (glossaryTerms.length !== 100 || allGlossaryTerms.length !== 100) {
    throw new Error(`generate-spanish-knowledge-cluster: expected all 100 glossary terms to carry es content, found ${glossaryTerms.length} of ${allGlossaryTerms.length}`);
  }
  for (const term of glossaryTerms) {
    const outPath = path.join(ROOT, 'es', `${term.slug}.html`);
    writeFile(outPath, generateTerm(term, 'es'));
    written++;
    writtenFiles.push(`es/${term.slug}.html`);
  }

  // ── Formulas: all 9 in scope ─────────────────────────────────────────────
  const formulas = (formulasData.formulas || []).filter((f) => f.es);
  if (formulas.length !== 9 || (formulasData.formulas || []).length !== 9) {
    throw new Error(`generate-spanish-knowledge-cluster: expected exactly 9 formulas with es content, found ${formulas.length} of ${(formulasData.formulas || []).length}`);
  }
  for (const formula of formulas) {
    const outPath = path.join(ROOT, 'es', `${formula.slug}.html`);
    writeFile(outPath, generateFormula(formula, 'es'));
    written++;
    writtenFiles.push(`es/${formula.slug}.html`);
  }

  // ── Reference: 25 JSON-driven records cross-check ───────────────────────
  const jsonDrivenScope = getJsonDrivenScope(); // Set of "<basename>.html"
  const refPages = (referenceData.pages || []).filter((p) => p.es);
  const refBasenames = refPages.map((p) => p.slug.split('/').pop() + '.html');
  const missingFromScope = refBasenames.filter((f) => !jsonDrivenScope.has(f));
  if (missingFromScope.length || refPages.length !== 25) {
    throw new Error(
      `generate-spanish-knowledge-cluster: reference scope mismatch -- expected exactly the 25 ` +
      `JSON-driven pages, found ${refPages.length} with es content; not in JSON-driven scope: ${JSON.stringify(missingFromScope)}`
    );
  }
  for (const page of refPages) {
    const outPath = path.join(ROOT, 'es', `${page.slug}.html`);
    writeFile(outPath, generateRefPage(page, 'es'));
    written++;
    writtenFiles.push(`es/${page.slug}.html`);
  }

  for (const f of writtenFiles) console.log('  -> ' + f);
  console.log(`generate-spanish-knowledge-cluster: wrote ${written} Spanish pages (${glossaryTerms.length} glossary, ${formulas.length} formulas, ${refPages.length} reference)`);
}

run();

module.exports = { run };
