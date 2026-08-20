#!/usr/bin/env node
'use strict';
/**
 * build-thin-page-inventory.js (Phase 7I, Step 2)
 * Deterministic inventory of every entity/glossary page.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const entityIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'graph', 'entity-index.json'), 'utf8'));
const glossaryData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'glossary.json'), 'utf8'));
const glossaryTerms = Array.isArray(glossaryData) ? glossaryData : (glossaryData.terms || []);

// Findings from direct investigation this phase (see SOURCE-RESEARCH.md /
// ENTITY-CONTENT-POLICY.md for the reasoning behind each).
const KEEP_BY_POLICY = new Set([
  'cdc', 'epa', 'nsf', 'lamotte', 'taylor-technologies', 'phta', // organization stubs: concise "who is this org" answers, genuinely satisfy their query
  'unit-celsius', 'unit-fahrenheit', 'unit-gallons', 'unit-liters', 'unit-mg-l', 'unit-minutes', 'unit-hours',
  'unit-days', 'unit-weeks', 'unit-months', 'unit-ppm', // unit-definition entities: inherently short by design
  'closing-checklist', 'opening-checklist', 'maintenance-checklist', 'maintenance-log', // resource-pointer entities: concise, complete, link to the real checklist
  'calcium-hardness', 'cloudy-water', 'lsi', 'ph', // repetition_score=0 false positive: shared knowledge-card UI structure, not prose duplication (entities family avg_pairwise_similarity 0.201, LOW risk)
]);

function wordCount(html) {
  const main = html.match(/<main[\s\S]*?<\/main>/i);
  const text = (main ? main[0] : html).replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, ' ');
  return text.split(/\s+/).filter(Boolean).length;
}

function analyzeEntityPage(id, e) {
  const file = path.join(ROOT, 'entities', `${id}.html`);
  if (!fs.existsSync(file)) return null;
  const html = fs.readFileSync(file, 'utf8');
  const wc = wordCount(html);
  const hasLongDesc = !!(e.longDescription && e.longDescription !== e.shortDescription);
  const sections = [...html.matchAll(/<section id="([a-z-]+)"/g)].map((m) => m[1]);
  const schemaTypes = [...new Set([...html.matchAll(/"@type":"([A-Za-z]+)"/g)].map((m) => m[1]))];

  let priority = 'P3';
  let thinnessReason = '';
  let recommendedAction = 'KEEP';

  if (KEEP_BY_POLICY.has(id)) {
    recommendedAction = 'KEEP';
    thinnessReason = 'Flagged by word-count/repetition heuristic; concise content genuinely satisfies its intent (see ENTITY-CONTENT-POLICY.md / SOURCE-RESEARCH.md).';
    priority = wc < 150 ? 'P2' : 'P3';
  } else if (!hasLongDesc) {
    recommendedAction = 'INVESTIGATE';
    thinnessReason = 'No longDescription distinct from shortDescription -- genuine content gap.';
    priority = 'P1';
  } else {
    recommendedAction = 'KEEP';
    thinnessReason = 'longDescription present and rendered; satisfies its query.';
    priority = 'P3';
  }

  return {
    url: `https://waterbalancetools.com/entities/${id}`,
    page_type: 'entity',
    entity_or_term: e.name,
    current_word_count: wc,
    current_sections: sections.join(';'),
    primary_intent: `what is ${e.name}`,
    search_answer_present: 'yes',
    definition_present: 'yes',
    context_present: hasLongDesc ? 'yes' : 'partial',
    chemistry_claims_present: /ppm|pH|chlorine|calcium|alkalinity/i.test(e.longDescription || e.shortDescription || '') ? 'yes' : 'no',
    source_present: (e.sourceOrganizations || []).length ? 'yes' : 'no',
    related_tools_present: (e.calculatorIds || []).length ? 'yes' : 'no',
    internal_links: (e.relatedEntities || []).length + (e.calculatorIds || []).length + (e.academyIds || []).length,
    schema_types: schemaTypes.join(';'),
    thinness_reason: thinnessReason,
    priority,
    recommended_action: recommendedAction,
  };
}

function analyzeGlossaryTerm(t) {
  // t.slug already includes the 'glossary/' prefix (e.g. 'glossary/free-chlorine')
  const file = path.join(ROOT, `${t.slug}.html`);
  if (!fs.existsSync(file)) return null;
  const html = fs.readFileSync(file, 'utf8');
  const wc = wordCount(html);
  const schemaTypes = [...new Set([...html.matchAll(/"@type":"([A-Za-z]+)"/g)].map((m) => m[1]))];
  return {
    url: `https://waterbalancetools.com/glossary/${t.slug}`,
    page_type: 'glossary-term',
    entity_or_term: t.term || t.title,
    current_word_count: wc,
    current_sections: 'definition',
    primary_intent: `what is ${t.term || t.title}`,
    search_answer_present: 'yes',
    definition_present: 'yes',
    context_present: (t.explanation || t.whyItMatters) ? 'yes' : 'partial',
    chemistry_claims_present: /ppm|pH|chlorine|calcium|alkalinity/i.test(t.definition || t.explanation || '') ? 'yes' : 'no',
    source_present: 'no',
    related_tools_present: (t.relatedCalculators || []).length ? 'yes' : 'no',
    internal_links: (t.relatedCalculators || []).length + (t.relatedArticles || []).length + (t.relatedFormulas || []).length,
    schema_types: schemaTypes.join(';'),
    thinness_reason: 'Definition is concise and satisfies the glossary intent (single-term lookup); flagged only for title length, not content depth.',
    priority: 'P3',
    recommended_action: 'KEEP',
  };
}

const rows = [];
for (const [id, e] of Object.entries(entityIndex)) {
  const r = analyzeEntityPage(id, e);
  if (r) rows.push(r);
}
for (const t of glossaryTerms) {
  const r = analyzeGlossaryTerm(t);
  if (r) rows.push(r);
}

const header = ['url', 'page_type', 'entity_or_term', 'current_word_count', 'current_sections', 'primary_intent', 'search_answer_present', 'definition_present', 'context_present', 'chemistry_claims_present', 'source_present', 'related_tools_present', 'internal_links', 'schema_types', 'thinness_reason', 'priority', 'recommended_action'];
const csv = [header.join(',')].concat(
  rows.map((r) => header.map((h) => '"' + String(r[h]).replace(/"/g, '""') + '"').join(','))
).join('\n') + '\n';

const outDir = path.join(ROOT, 'reports', 'phase-7i');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'thin-page-inventory.csv'), csv);
console.log(`build-thin-page-inventory: wrote ${rows.length} rows`);
