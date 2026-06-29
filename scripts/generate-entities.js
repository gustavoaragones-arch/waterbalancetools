#!/usr/bin/env node
/**
 * generate-entities.js
 *
 * Compiles all entity source modules from scripts/data/ into:
 *   data/entities/chemicals.json
 *   data/entities/measurements.json
 *   data/entities/equipment.json
 *   data/entities/processes.json
 *   data/entities/resources.json
 *   data/entities/problems.json
 *   data/entities/pool-types.json
 *   data/entities/chemical-products.json
 *   data/entities/organizations.json
 *   data/entities/units.json
 *   data/graph/relationships.json
 *   data/graph/aliases.json
 *   data/graph/synonyms.json
 *   data/graph/entity-index.json
 *
 * Run: node scripts/generate-entities.js
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.join(__dirname, '..');
const DATA    = path.join(ROOT, 'data');
const ENT_DIR = path.join(DATA, 'entities');
const GRP_DIR = path.join(DATA, 'graph');

[ENT_DIR, GRP_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// ── Load source modules ────────────────────────────────────────────────────────

const D = path.join(__dirname, 'data');
const chemicals       = require(path.join(D, 'entities-chemicals'));
const measurements    = require(path.join(D, 'entities-measurements'));
const equipment       = require(path.join(D, 'entities-equipment'));
const processes       = require(path.join(D, 'entities-processes'));
const problems        = require(path.join(D, 'entities-problems'));
const { poolTypes, resources, chemicalProducts, organizations, units } = require(path.join(D, 'entities-remaining'));
const { aliases, synonyms } = require(path.join(D, 'entity-synonyms'));
const relationships   = require(path.join(D, 'entity-relationships'));

// ── Required entity fields per spec ───────────────────────────────────────────
const REQUIRED_FIELDS = [
  'id', 'type', 'name', 'shortDescription', 'longDescription',
  'aliases', 'synonyms', 'idealRange', 'units',
  'calculatorIds', 'formulaIds', 'academyIds', 'glossaryIds',
  'referenceIds', 'resourceIds', 'chartIds', 'problemIds',
  'relatedEntities', 'sourceOrganizations', 'keywords',
];

// ── Enforce strict entity schema ───────────────────────────────────────────────
function enforce(entities, typeName) {
  entities.forEach(e => {
    REQUIRED_FIELDS.forEach(f => {
      if (!Object.prototype.hasOwnProperty.call(e, f)) {
        throw new Error(`Entity [${e.id || '?'}] in ${typeName} missing required field: ${f}`);
      }
    });
    // Remove any extra fields not in spec
    Object.keys(e).forEach(k => {
      if (!REQUIRED_FIELDS.includes(k)) {
        delete e[k];
      }
    });
  });
  return entities;
}

// Apply schema enforcement
const entityGroups = {
  chemicals,
  measurements,
  equipment,
  processes,
  resources,
  problems,
  'pool-types':       poolTypes,
  'chemical-products': chemicalProducts,
  organizations,
  units,
};

Object.entries(entityGroups).forEach(([name, arr]) => enforce(arr, name));

// ── Write entity JSON files ────────────────────────────────────────────────────

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

Object.entries(entityGroups).forEach(([name, arr]) => {
  writeJson(path.join(ENT_DIR, name + '.json'), arr);
  console.log(`  ✓ data/entities/${name}.json  (${arr.length} entities)`);
});

// ── Build entity index ─────────────────────────────────────────────────────────

const allEntities = Object.values(entityGroups).flat();
const entityIndex = {};
allEntities.forEach(e => {
  entityIndex[e.id] = {
    id:               e.id,
    type:             e.type,
    name:             e.name,
    shortDescription: e.shortDescription,
    idealRange:       e.idealRange,
    units:            e.units,
    calculatorIds:    e.calculatorIds,
    formulaIds:       e.formulaIds,
    academyIds:       e.academyIds,
    glossaryIds:      e.glossaryIds,
    referenceIds:     e.referenceIds,
    resourceIds:      e.resourceIds,
    chartIds:         e.chartIds,
    problemIds:       e.problemIds,
    relatedEntities:  e.relatedEntities,
    keywords:         e.keywords,
  };
});

writeJson(path.join(GRP_DIR, 'entity-index.json'), entityIndex);
console.log(`  ✓ data/graph/entity-index.json  (${allEntities.length} entities)`);

// ── Write graph files ─────────────────────────────────────────────────────────

// Validate relationship types
const ALLOWED_RELATIONSHIPS = new Set([
  'affected_by', 'measured_by', 'requires', 'uses', 'solves', 'causes',
  'recommended_for', 'related_to', 'part_of', 'calculated_by',
  'explained_by', 'references', 'compared_with', 'stored_in', 'maintained_by',
  // 'maintains' is used in the data — normalise to 'maintained_by' inverse
]);

const entityIds = new Set(allEntities.map(e => e.id));

const validRelationships = relationships.map(r => {
  // normalise 'maintains' → 'maintained_by'
  const rel = r.relationship === 'maintains' ? 'maintained_by' : r.relationship;
  return { from: r.from, relationship: rel, to: r.to };
}).filter(r => {
  if (!ALLOWED_RELATIONSHIPS.has(r.relationship)) {
    console.warn(`  ⚠ Unknown relationship type skipped: ${r.relationship}`);
    return false;
  }
  return true;
});

writeJson(path.join(GRP_DIR, 'relationships.json'), validRelationships);
console.log(`  ✓ data/graph/relationships.json  (${validRelationships.length} relationships)`);

writeJson(path.join(GRP_DIR, 'aliases.json'), aliases);
console.log(`  ✓ data/graph/aliases.json  (${Object.keys(aliases).length} aliases)`);

writeJson(path.join(GRP_DIR, 'synonyms.json'), synonyms);
console.log(`  ✓ data/graph/synonyms.json  (${Object.keys(synonyms).length} synonym sets)`);

console.log(`\nTotal entities: ${allEntities.length}`);
console.log('Entity layer compiled. Run: node scripts/generate-entity-pages.js');
