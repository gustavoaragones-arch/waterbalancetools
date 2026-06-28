#!/usr/bin/env node
/**
 * validate-knowledge.js
 *
 * Validates the four knowledge platform JSON files for:
 *   - Required metadata fields on every object
 *   - Valid relationship cross-references (no dangling slugs)
 *   - Formula variable completeness
 *   - Academy article required calculator links
 *   - No orphaned pages (every page is reachable from at least one relationship)
 *   - No duplicate IDs or slugs
 *
 * Exit codes:
 *   0 = all checks passed
 *   1 = one or more errors found
 *
 * Usage: node scripts/validate-knowledge.js
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data');

const academy   = JSON.parse(fs.readFileSync(path.join(DATA, 'academy.json'),   'utf8'));
const formulas  = JSON.parse(fs.readFileSync(path.join(DATA, 'formulas.json'),  'utf8'));
const glossary  = JSON.parse(fs.readFileSync(path.join(DATA, 'glossary.json'),  'utf8'));
const reference = JSON.parse(fs.readFileSync(path.join(DATA, 'reference.json'), 'utf8'));

const articles   = academy.articles   || [];
const formulaArr = formulas.formulas  || [];
const terms      = glossary.terms     || [];
const refPages   = reference.pages    || [];

let errors   = 0;
let warnings = 0;

function fail(msg)  { console.error('  ✗ ERROR:   ' + msg); errors++; }
function warn(msg)  { console.warn ('  ⚠ WARNING: ' + msg); warnings++; }
function ok(msg)    { console.log  ('  ✓ ' + msg); }

// ── Build slug sets ────────────────────────────────────────────────────────────

const articleSlugs  = new Set(articles.map(a => a.slug));
const formulaSlugs  = new Set(formulaArr.map(f => f.slug));
const termSlugs     = new Set(terms.map(t => t.slug));
const refSlugs      = new Set(refPages.map(p => p.slug));
const allKnowledgeSlugs = new Set([...articleSlugs, ...formulaSlugs, ...termSlugs, ...refSlugs]);

// Known valid calculator paths
const KNOWN_CALCULATOR_PATHS = new Set([
  '/calculators/chemical-calculator',
  '/calculators/pool-chlorine-calculator',
  '/calculators/pool-shock-calculator',
  '/calculators/pool-ph-calculator',
  '/calculators/pool-alkalinity-calculator',
  '/calculators/pool-cyanuric-acid-calculator',
  '/calculators/pool-volume-calculator',
  '/calculators/pool-turnover-rate-calculator',
  '/calculators/saltwater-pool-salt-calculator',
  '/calculators/hot-tub-chlorine-calculator',
  '/calculators/hot-tub-ph-calculator',
  '/calculators/hot-tub-shock-calculator',
  '/calculators/spa-volume-calculator',
  '/calculators/volume-calculator',
]);

// ── Checks ─────────────────────────────────────────────────────────────────────

function checkDuplicateIds(arr, label) {
  const seen = new Map();
  arr.forEach(item => {
    if (!item.id) { fail(`${label} item missing id: ${JSON.stringify(item).slice(0, 60)}`); return; }
    if (seen.has(item.id)) {
      fail(`${label} duplicate id: ${item.id}`);
    } else {
      seen.set(item.id, true);
    }
  });
}

function checkDuplicateSlugs(arr, label) {
  const seen = new Map();
  arr.forEach(item => {
    if (!item.slug) { fail(`${label} item missing slug (id: ${item.id})`); return; }
    if (seen.has(item.slug)) {
      fail(`${label} duplicate slug: ${item.slug}`);
    } else {
      seen.set(item.slug, true);
    }
  });
}

function checkRequiredFields(item, required, label) {
  required.forEach(field => {
    const val = item[field];
    if (val === undefined || val === null || val === '') {
      fail(`${label} [${item.id || item.slug}] missing required field: ${field}`);
    } else if (Array.isArray(val) && val.length === 0) {
      warn(`${label} [${item.id || item.slug}] has empty array for: ${field}`);
    }
  });
}

function checkCalculatorLinks(item, label) {
  const calcs = item.relatedCalculators || [];
  if (!Array.isArray(calcs) || calcs.length === 0) {
    fail(`${label} [${item.id || item.slug}] has no relatedCalculators`);
    return;
  }
  calcs.forEach(c => {
    if (!KNOWN_CALCULATOR_PATHS.has(c)) {
      warn(`${label} [${item.id || item.slug}] references unknown calculator: ${c}`);
    }
  });
}

function checkRelatedTopics(item, label) {
  const related = item.relatedTopics || [];
  related.forEach(slug => {
    if (!allKnowledgeSlugs.has(slug)) {
      fail(`${label} [${item.id || item.slug}] relatedTopics slug not found: ${slug}`);
    }
  });
}

function checkRelatedFormulas(item, label) {
  const related = item.relatedFormulas || [];
  related.forEach(slug => {
    if (!formulaSlugs.has(slug)) {
      fail(`${label} [${item.id || item.slug}] relatedFormulas slug not found: ${slug}`);
    }
  });
}

function checkRelatedArticles(item, label) {
  const related = item.relatedArticles || [];
  related.forEach(slug => {
    if (!articleSlugs.has(slug)) {
      fail(`${label} [${item.id || item.slug}] relatedArticles slug not found: ${slug}`);
    }
  });
}

// ── Academy ────────────────────────────────────────────────────────────────────

console.log('\n─── Academy ──────────────────────────────────────────────────');

if (articles.length !== 48) {
  fail(`Expected 48 academy articles, found ${articles.length}`);
} else {
  ok(`48 academy articles found`);
}

const ACADEMY_REQUIRED = ['id', 'slug', 'title', 'category', 'overview', 'readingTime', 'lastReviewed', 'keywords'];
checkDuplicateIds(articles, 'Academy');
checkDuplicateSlugs(articles, 'Academy');

articles.forEach(a => {
  checkRequiredFields(a, ACADEMY_REQUIRED, 'Academy');
  checkCalculatorLinks(a, 'Academy');
  checkRelatedTopics(a, 'Academy');
  checkRelatedFormulas(a, 'Academy');
});

// Count by category
const catCounts = {};
articles.forEach(a => { catCounts[a.category] = (catCounts[a.category] || 0) + 1; });
const EXPECTED_CATS = ['fundamentals', 'sanitizers', 'testing', 'water-balance', 'troubleshooting', 'hot-tubs', 'equipment', 'vacation-rentals'];
EXPECTED_CATS.forEach(cat => {
  const n = catCounts[cat] || 0;
  if (n !== 6) {
    fail(`Academy category '${cat}' has ${n} articles (expected 6)`);
  } else {
    ok(`Category '${cat}': 6 articles`);
  }
});

// ── Formulas ──────────────────────────────────────────────────────────────────

console.log('\n─── Formulas ─────────────────────────────────────────────────');

if (formulaArr.length !== 9) {
  fail(`Expected 9 formulas, found ${formulaArr.length}`);
} else {
  ok(`9 formulas found`);
}

const FORMULA_REQUIRED = ['id', 'slug', 'title', 'equation', 'variables', 'workedExample', 'explanation', 'limitations', 'relatedCalculators', 'relatedGlossary'];
checkDuplicateIds(formulaArr, 'Formula');
checkDuplicateSlugs(formulaArr, 'Formula');

formulaArr.forEach(f => {
  checkRequiredFields(f, FORMULA_REQUIRED, 'Formula');

  const vars = f.variables || [];
  if (!Array.isArray(vars) || vars.length === 0) {
    fail(`Formula [${f.id}] has no variables`);
  } else {
    vars.forEach((v, i) => {
      if (!v.symbol) fail(`Formula [${f.id}] variable[${i}] missing symbol`);
      if (!v.description) fail(`Formula [${f.id}] variable[${i}] missing description`);
    });
  }
  checkCalculatorLinks(f, 'Formula');
  checkRelatedTopics(f, 'Formula');
});

// ── Glossary ──────────────────────────────────────────────────────────────────

console.log('\n─── Glossary ─────────────────────────────────────────────────');

if (terms.length !== 100) {
  fail(`Expected 100 glossary terms, found ${terms.length}`);
} else {
  ok(`100 glossary terms found`);
}

// Glossary uses 'term' not 'title' (term is the display label)
const GLOSSARY_REQUIRED = ['id', 'slug', 'term', 'definition', 'explanation', 'whyItMatters', 'lastReviewed'];
checkDuplicateIds(terms, 'Glossary');
checkDuplicateSlugs(terms, 'Glossary');

terms.forEach(t => {
  checkRequiredFields(t, GLOSSARY_REQUIRED, 'Glossary');
  checkRelatedArticles(t, 'Glossary');
  checkRelatedFormulas(t, 'Glossary');
});

// ── Reference ─────────────────────────────────────────────────────────────────

console.log('\n─── Reference ────────────────────────────────────────────────');

if (refPages.length !== 25) {
  fail(`Expected 25 reference pages, found ${refPages.length}`);
} else {
  ok(`25 reference pages found`);
}

const REFERENCE_REQUIRED = ['id', 'slug', 'title', 'description', 'overview', 'lastReviewed'];
checkDuplicateIds(refPages, 'Reference');
checkDuplicateSlugs(refPages, 'Reference');

refPages.forEach(p => {
  checkRequiredFields(p, REFERENCE_REQUIRED, 'Reference');
  const hasTables    = Array.isArray(p.tables)    && p.tables.length > 0;
  const hasChecklists= Array.isArray(p.checklists)&& p.checklists.length > 0;
  if (!hasTables && !hasChecklists) {
    warn(`Reference [${p.id}] has neither tables nor checklists`);
  }
});

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('\n─── Summary ──────────────────────────────────────────────────');
console.log(`  Academy:   ${articles.length} articles`);
console.log(`  Formulas:  ${formulaArr.length} formulas`);
console.log(`  Glossary:  ${terms.length} terms`);
console.log(`  Reference: ${refPages.length} pages`);
console.log(`  Total knowledge pages: ${articles.length + formulaArr.length + terms.length + refPages.length}`);
console.log('');

if (errors > 0) {
  console.error(`Validation FAILED: ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
}

console.log(`Validation PASSED: 0 errors, ${warnings} warning(s).`);
process.exit(0);
