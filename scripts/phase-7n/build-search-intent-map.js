#!/usr/bin/env node
'use strict';
/**
 * build-search-intent-map.js (Phase 7N, Step 4)
 * Derives primary_intent/secondary_intent/search_stage/canonical_role for
 * every indexable page from real, observable page-level signals already
 * measured by the forensic audit (page_type, calculator/table/FAQ
 * presence, word count) -- no invented search volume, no assumed intent
 * beyond what the page itself demonstrates.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SNAP = path.join(ROOT, 'reports', 'phase-7n', 'current-state-snapshot');

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const header = parseLine(lines[0]);
  return lines.slice(1).map((l) => {
    const vals = parseLine(l);
    const row = {};
    header.forEach((h, i) => { row[h] = vals[i]; });
    return row;
  });
}
function parseLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}
function toCsv(rows, header) {
  return [header.join(',')].concat(
    rows.map((r) => header.map((h) => '"' + String(r[h] == null ? '' : r[h]).replace(/"/g, '""') + '"').join(','))
  ).join('\n') + '\n';
}

const inv = parseCsv(fs.readFileSync(path.join(SNAP, 'url-inventory.csv'), 'utf8'));

const STAGE_BY_TYPE = {
  calculator: 'CALCULATOR', 'calculator-hub': 'CALCULATOR',
  chart: 'REFERENCE', 'reference-page': 'REFERENCE', 'dataset-page': 'REFERENCE', 'reference-hub': 'REFERENCE', 'formula-page': 'REFERENCE', 'formula-hub': 'REFERENCE',
  comparison: 'COMPARISON', 'comparison-hub': 'COMPARISON',
  entity: 'REFERENCE', 'glossary-term': 'REFERENCE',
  'academy-article': 'INFORMATIONAL', 'academy-hub': 'DISCOVERY',
  guide: 'INFORMATIONAL', 'guide-hub': 'DISCOVERY',
  'programmatic-longtail': 'CALCULATOR', 'programmatic-subhub': 'DISCOVERY', 'programmatic-hub': 'DISCOVERY',
  'question-page': 'DIAGNOSTIC', 'maintenance-guide': 'INFORMATIONAL', 'maintenance-hub': 'DISCOVERY',
  resource: 'TRANSACTIONAL-ADJACENT', 'resource-hub': 'DISCOVERY', printable: 'TRANSACTIONAL-ADJACENT',
  homepage: 'DISCOVERY', legal: 'REFERENCE', trust: 'REFERENCE',
};

const CANONICAL_ROLE_BY_TYPE = {
  calculator: 'primary_tool', chart: 'reference_table', 'reference-page': 'reference_article',
  'dataset-page': 'internal_documentation', entity: 'definition', 'glossary-term': 'definition',
  'academy-article': 'explainer', guide: 'explainer', 'programmatic-longtail': 'parametric_answer',
  comparison: 'decision_support', 'question-page': 'direct_answer', formula: 'technical_reference',
};

function primaryIntent(r) {
  const cluster = r.cluster || '';
  const type = r.page_type || '';
  if (type === 'calculator') return `calculate_${cluster || 'value'}`;
  if (type === 'programmatic-longtail') return `calculate_${cluster.replace('programmatic/', '') || 'value'}_for_specific_input`;
  if (type === 'chart') return `lookup_reference_range_${cluster || ''}`;
  if (type === 'entity' || type === 'glossary-term') return 'define_term';
  if (type === 'comparison') return 'compare_options';
  if (type === 'question-page') return 'answer_specific_question';
  if (type === 'academy-article' || type === 'guide') return `understand_${cluster.split('/').pop() || 'topic'}`;
  return type || 'general';
}

function secondaryIntent(r) {
  if (r.calculator_present === 'true' && r.page_type !== 'calculator') return 'find_calculator';
  if (r.faq_count && parseInt(r.faq_count, 10) > 0) return 'quick_answer';
  if (r.table_present === 'true') return 'reference_lookup';
  return 'none_observed';
}

const rows = inv
  .filter((r) => r.indexability !== 'NOINDEX')
  .map((r) => ({
    url: r.url,
    page_type: r.page_type,
    primary_intent: primaryIntent(r),
    secondary_intent: secondaryIntent(r),
    target_entity_parameter: r.cluster || '',
    search_stage: STAGE_BY_TYPE[r.page_type] || 'INFORMATIONAL',
    canonical_role: CANONICAL_ROLE_BY_TYPE[r.page_type] || 'supporting_content',
  }));

const header = ['url', 'page_type', 'primary_intent', 'secondary_intent', 'target_entity_parameter', 'search_stage', 'canonical_role'];
fs.writeFileSync(path.join(ROOT, 'reports', 'phase-7n', 'SEARCH-INTENT-MAP.csv'), toCsv(rows, header));
console.log(`build-search-intent-map: ${rows.length} indexable pages mapped`);
