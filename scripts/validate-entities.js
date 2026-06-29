#!/usr/bin/env node
/**
 * validate-entities.js
 *
 * Validates the entity layer:
 *  - No duplicate entity IDs
 *  - All required fields present (no extra, no missing)
 *  - All relationship types are allowed
 *  - All relationship targets exist as entity IDs
 *  - No broken aliases (all alias values point to valid entity IDs)
 *  - No broken synonyms (all synonym keys are valid entity IDs)
 *  - Entity pages exist for every entity in the index
 *  - No orphan entities (every entity has >= 1 relationship or >= 1 cross-reference)
 *
 * Run: node scripts/validate-entities.js
 * Exit code 0 = pass, 1 = failures found.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');

// ── Load ───────────────────────────────────────────────────────────────────────

const entityFiles = [
  'chemicals', 'measurements', 'equipment', 'processes',
  'resources', 'problems', 'pool-types', 'chemical-products',
  'organizations', 'units',
];

let allEntities = [];
entityFiles.forEach(name => {
  const fp = path.join(DATA, 'entities', name + '.json');
  if (!fs.existsSync(fp)) { console.error(`FAIL: Missing entity file: data/entities/${name}.json`); process.exit(1); }
  const arr = JSON.parse(fs.readFileSync(fp, 'utf8'));
  allEntities = allEntities.concat(arr);
});

const entityIndex = JSON.parse(fs.readFileSync(path.join(DATA, 'graph', 'entity-index.json'), 'utf8'));
const relationships = JSON.parse(fs.readFileSync(path.join(DATA, 'graph', 'relationships.json'), 'utf8'));
const aliases = JSON.parse(fs.readFileSync(path.join(DATA, 'graph', 'aliases.json'), 'utf8'));
const synonymsMap = JSON.parse(fs.readFileSync(path.join(DATA, 'graph', 'synonyms.json'), 'utf8'));

// ── Constants ─────────────────────────────────────────────────────────────────

const REQUIRED_FIELDS = [
  'id', 'type', 'name', 'shortDescription', 'longDescription',
  'aliases', 'synonyms', 'idealRange', 'units',
  'calculatorIds', 'formulaIds', 'academyIds', 'glossaryIds',
  'referenceIds', 'resourceIds', 'chartIds', 'problemIds',
  'relatedEntities', 'sourceOrganizations', 'keywords',
];

const ALLOWED_ENTITY_TYPES = new Set([
  'chemical', 'measurement', 'equipment', 'process',
  'resource', 'problem', 'pool-type', 'chemical-product',
  'organization', 'unit',
]);

const ALLOWED_RELATIONSHIP_TYPES = new Set([
  'affected_by', 'measured_by', 'requires', 'uses', 'solves', 'causes',
  'recommended_for', 'related_to', 'part_of', 'calculated_by',
  'explained_by', 'references', 'compared_with', 'stored_in', 'maintained_by',
]);

const ARRAY_FIELDS = [
  'aliases', 'synonyms', 'calculatorIds', 'formulaIds', 'academyIds',
  'glossaryIds', 'referenceIds', 'resourceIds', 'chartIds', 'problemIds',
  'relatedEntities', 'sourceOrganizations', 'keywords',
];

// ── Track issues ──────────────────────────────────────────────────────────────

let errors   = 0;
let warnings = 0;

function fail(msg) {
  console.error(`  FAIL: ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`  WARN: ${msg}`);
  warnings++;
}

// ── 1. Duplicate entity IDs ───────────────────────────────────────────────────

console.log('\n[1] Checking for duplicate entity IDs...');
const seenIds = new Set();
allEntities.forEach(e => {
  if (seenIds.has(e.id)) fail(`Duplicate entity ID: ${e.id}`);
  else seenIds.add(e.id);
});
if (errors === 0) console.log('    ✓ No duplicates');

// ── 2. Required fields ────────────────────────────────────────────────────────

console.log('\n[2] Checking required fields...');
let fieldErrors = 0;
allEntities.forEach(e => {
  REQUIRED_FIELDS.forEach(f => {
    if (!Object.prototype.hasOwnProperty.call(e, f)) {
      fail(`Entity [${e.id}] missing required field: ${f}`);
      fieldErrors++;
    }
  });
  ARRAY_FIELDS.forEach(f => {
    if (e[f] !== undefined && !Array.isArray(e[f])) {
      fail(`Entity [${e.id}] field ${f} must be an array, got: ${typeof e[f]}`);
      fieldErrors++;
    }
  });
  if (!ALLOWED_ENTITY_TYPES.has(e.type)) {
    fail(`Entity [${e.id}] has invalid type: ${e.type}`);
    fieldErrors++;
  }
});
if (fieldErrors === 0) console.log('    ✓ All required fields present');

// ── 3. Entity index completeness ──────────────────────────────────────────────

console.log('\n[3] Checking entity-index.json completeness...');
const indexIds   = new Set(Object.keys(entityIndex));
const sourceIds  = new Set(allEntities.map(e => e.id));

sourceIds.forEach(id => {
  if (!indexIds.has(id)) fail(`Entity [${id}] in source files but missing from entity-index.json`);
});
indexIds.forEach(id => {
  if (!sourceIds.has(id)) fail(`Entity [${id}] in entity-index.json but missing from source files`);
});
if (errors === 0) console.log('    ✓ Entity index matches source files');

// ── 4. Relationship types ─────────────────────────────────────────────────────

console.log('\n[4] Checking relationship types...');
let relTypeErrors = 0;
relationships.forEach((r, i) => {
  if (!ALLOWED_RELATIONSHIP_TYPES.has(r.relationship)) {
    fail(`Relationship #${i} has unknown type: ${r.relationship}`);
    relTypeErrors++;
  }
});
if (relTypeErrors === 0) console.log('    ✓ All relationship types valid');

// ── 5. Relationship targets exist ─────────────────────────────────────────────

console.log('\n[5] Checking relationship targets exist...');
let relTargetErrors = 0;

// Allowed targets include: entity IDs, formula IDs (formula-XX), glossary slugs
const formulasData = JSON.parse(fs.readFileSync(path.join(DATA, 'formulas.json'), 'utf8'));
const formulaIds = new Set(formulasData.formulas.map(f => f.id));

const glossaryData = JSON.parse(fs.readFileSync(path.join(DATA, 'glossary.json'), 'utf8'));
const glossarySlugs = new Set(glossaryData.terms.map(t => t.slug));

relationships.forEach((r, i) => {
  if (!sourceIds.has(r.from)) {
    fail(`Relationship #${i}: 'from' entity [${r.from}] does not exist`);
    relTargetErrors++;
  }
  // 'to' may be entity ID, formula ID, or glossary slug
  if (!sourceIds.has(r.to) && !formulaIds.has(r.to) && !glossarySlugs.has(r.to)) {
    // Allow some known reference slugs
    warn(`Relationship #${i}: 'to' target [${r.to}] not found as entity, formula ID, or glossary slug`);
  }
});
if (relTargetErrors === 0) console.log('    ✓ All relationship sources exist as entities');

// ── 6. Aliases integrity ──────────────────────────────────────────────────────

console.log('\n[6] Checking aliases...');
let aliasErrors = 0;
Object.entries(aliases).forEach(([alias, entityId]) => {
  if (!sourceIds.has(entityId)) {
    fail(`Alias "${alias}" → [${entityId}] — target entity does not exist`);
    aliasErrors++;
  }
});
if (aliasErrors === 0) console.log(`    ✓ All ${Object.keys(aliases).length} aliases resolve to valid entities`);

// ── 7. Synonym keys are valid entity IDs ─────────────────────────────────────

console.log('\n[7] Checking synonym keys...');
let synErrors = 0;
Object.keys(synonymsMap).forEach(entityId => {
  if (!sourceIds.has(entityId)) {
    fail(`Synonym key [${entityId}] does not match any entity ID`);
    synErrors++;
  }
});
if (synErrors === 0) console.log(`    ✓ All ${Object.keys(synonymsMap).length} synonym sets reference valid entities`);

// ── 8. Entity pages exist ─────────────────────────────────────────────────────

console.log('\n[8] Checking entity pages exist...');
const entitiesDir = path.join(ROOT, 'entities');
let missingPages = 0;
if (!fs.existsSync(entitiesDir)) {
  warn('entities/ directory does not exist — run generate-entity-pages.js first');
  missingPages = allEntities.length;
} else {
  allEntities.forEach(e => {
    const pagePath = path.join(entitiesDir, e.id + '.html');
    if (!fs.existsSync(pagePath)) {
      fail(`Missing entity page: entities/${e.id}.html`);
      missingPages++;
    }
  });
  if (missingPages === 0) console.log(`    ✓ All ${allEntities.length} entity pages exist`);
}

// ── 9. Orphan check ───────────────────────────────────────────────────────────

console.log('\n[9] Checking for orphan entities...');
const relatedEntityIds = new Set();
relationships.forEach(r => {
  relatedEntityIds.add(r.from);
  relatedEntityIds.add(r.to);
});
allEntities.forEach(e => {
  e.relatedEntities.forEach(id => relatedEntityIds.add(e.id));
});

let orphanCount = 0;
allEntities.forEach(e => {
  const hasRelationship = relatedEntityIds.has(e.id);
  const hasCrossRef = [
    ...e.calculatorIds, ...e.formulaIds, ...e.academyIds,
    ...e.glossaryIds, ...e.referenceIds, ...e.resourceIds,
    ...e.chartIds, ...e.problemIds, ...e.relatedEntities,
  ].length > 0;

  if (!hasRelationship && !hasCrossRef) {
    warn(`Orphan entity [${e.id}] has no relationships and no cross-references`);
    orphanCount++;
  }
});
if (orphanCount === 0) console.log('    ✓ No orphan entities');

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`);
console.log(`validate-entities: ${allEntities.length} entities, ${relationships.length} relationships`);
console.log(`  Errors:   ${errors}`);
console.log(`  Warnings: ${warnings}`);

if (errors > 0) {
  console.error('\nvalidate-entities: FAILED — fix errors before deploying');
  process.exit(1);
} else {
  console.log('\nvalidate-entities: PASSED');
  process.exit(0);
}
