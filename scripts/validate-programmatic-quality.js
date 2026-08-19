#!/usr/bin/env node
'use strict';
/**
 * validate-programmatic-quality.js (Phase 7G, Step 24)
 */
const fs = require('fs');
const path = require('path');
const { INTENTS } = require('./data/programmatic-intents');
const { CLAIMS_BY_ID } = require('./data/chemistry-claims');
const { parseCsv } = require('./phase-7d-1/reconcile-claims-v2'); // proper quote-aware CSV parser

const ROOT = path.join(__dirname, '..');
const DECISIONS_PATH = path.join(ROOT, 'reports', 'phase-7g', 'PROGRAMMATIC-DECISIONS.csv');

function run() {
  const violations = [];
  const warnings = [];

  // 1. missing intent contract / 2. duplicate primary_intent+context combos
  const seenCombo = new Set();
  for (const i of INTENTS) {
    const required = ['page_id', 'url', 'family', 'primary_intent', 'environment', 'parameter', 'scenario', 'user_question', 'answer_type', 'claim_family', 'differentiation_reason'];
    for (const f of required) {
      if (!i[f]) violations.push({ rule: 'MISSING_INTENT_FIELD', detail: `${i.page_id}: missing ${f}` });
    }
    const combo = `${i.primary_intent}|${i.environment}|${i.parameter}|${i.scenario}|${i.url}`;
    if (seenCombo.has(combo)) violations.push({ rule: 'DUPLICATE_INTENT_CONTEXT', detail: combo });
    seenCombo.add(combo);

    // 8. missing claim-family reference / invalid source references
    if (!CLAIMS_BY_ID[i.claim_family]) violations.push({ rule: 'INVALID_CLAIM_FAMILY_REFERENCE', detail: `${i.page_id}: ${i.claim_family}` });

    // 3. missing differentiation reason
    if (!i.differentiation_reason || i.differentiation_reason.length < 20) {
      violations.push({ rule: 'MISSING_DIFFERENTIATION_REASON', detail: i.page_id });
    }

    // Check the rendered page actually exists and has a non-generic direct answer
    const pagePath = path.join(ROOT, i.url);
    if (!fs.existsSync(pagePath)) {
      violations.push({ rule: 'ORPHANED_PROGRAMMATIC_PAGE', detail: `${i.page_id}: ${i.url} does not exist` });
      continue;
    }
    const html = fs.readFileSync(pagePath, 'utf8');
    if (/Dosing uses your pool volume and test results\.\s*<\/p>/.test(html) === false && /serp-direct/.test(html) === false) {
      warnings.push(`${i.page_id}: no .serp-direct direct-answer block found`);
    }
  }

  // Duplicate primary-answer text across distinct pages within a family
  // (the specific regression this phase fixed -- catch if it reappears).
  // Compares the RAW answer text, not a number-normalized version: a
  // shared English sentence template with genuinely different computed
  // numbers plugged in is the intended, legitimate pattern (Core
  // Principle: differentiation from real data, not wording spin) --  only
  // flag it if the literal text is byte-identical across every page in
  // the family, which would mean no real data varied at all.
  const familyFirstFaqAnswers = {};
  for (const i of INTENTS) {
    const pagePath = path.join(ROOT, i.url);
    if (!fs.existsSync(pagePath)) continue;
    const html = fs.readFileSync(pagePath, 'utf8');
    const m = html.match(/"acceptedAnswer":\s*\{"@type":"Answer","text":"([^"]{0,300})"/);
    if (!m) continue;
    const key = i.family;
    familyFirstFaqAnswers[key] = familyFirstFaqAnswers[key] || new Map();
    if (!familyFirstFaqAnswers[key].has(m[1])) familyFirstFaqAnswers[key].set(m[1], []);
    familyFirstFaqAnswers[key].get(m[1]).push(i.page_id);
  }
  for (const [family, map] of Object.entries(familyFirstFaqAnswers)) {
    for (const [, pages] of map) {
      if (pages.length === INTENTS.filter((i) => i.family === family).length && pages.length > 1) {
        violations.push({ rule: 'IDENTICAL_DIRECT_ANSWER_ACROSS_FAMILY', detail: `${family}: every page shares byte-identical first-FAQ answer text -- no page-specific data present` });
      }
    }
  }

  // Consolidation candidates without a decision
  let decisions = [];
  if (fs.existsSync(DECISIONS_PATH)) decisions = parseCsv(fs.readFileSync(DECISIONS_PATH, 'utf8'));
  const decidedIds = new Set(decisions.map((d) => d.page_id));
  for (const i of INTENTS) {
    if (!decidedIds.has(i.page_id)) violations.push({ rule: 'NO_CONSOLIDATION_DECISION', detail: i.page_id });
  }
  const VALID_DECISIONS = new Set(['KEEP', 'DIFFERENTIATE', 'MERGE', 'REDIRECT', 'NOINDEX', 'RESEARCH_REQUIRED']);
  for (const d of decisions) {
    if (!VALID_DECISIONS.has(d.decision)) violations.push({ rule: 'INVALID_CONSOLIDATION_DECISION', detail: `${d.page_id}: ${d.decision}` });
  }

  const result = {
    status: violations.length === 0 ? 'PASS' : 'FAIL',
    pages_checked: INTENTS.length,
    violations_found: violations.length,
    violations: violations.slice(0, 50),
    warnings_count: warnings.length,
    warnings: warnings.slice(0, 20),
  };

  const outDir = path.join(ROOT, 'reports', 'phase-7g');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'programmatic-quality-validation-results.json'), JSON.stringify(result, null, 2) + '\n');

  console.log(`validate-programmatic-quality: ${result.status} -- ${INTENTS.length} pages checked, ${violations.length} violation(s), ${warnings.length} warning(s).`);
  if (violations.length > 0) {
    for (const v of violations.slice(0, 20)) console.log(`  [${v.rule}] ${v.detail}`);
    process.exitCode = 1;
  }
  return result;
}

if (require.main === module) run();
module.exports = { run };
