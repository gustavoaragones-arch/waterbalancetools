#!/usr/bin/env node
'use strict';
/**
 * extract-entity-claims.js (Phase 7J, Steps 2-4)
 *
 * Inventories the 104 entity longDescription fields and extracts chemistry
 * claims from them, reusing the validated Phase 7D.1 extractor
 * (extractFromSentence) rather than building a competing algorithm. The
 * extractor is numeric-claim-focused by design (it only emits a record
 * when a clause contains a number); qualitative/material/safety/
 * operational/taxonomy sentences that don't carry a number are separately
 * tagged with a coarse, transparent sentence-level classifier so they are
 * not silently dropped from the audit, but this classifier does not
 * attempt numeric extraction itself -- it only labels claim TYPE for
 * triage.
 */
const fs = require('fs');
const path = require('path');
const { extractFromSentence } = require('../phase-7d-1/extract-claims-v2');
const { RANGES } = require('../data/chemistry-ranges');
const { PARAMETERS, ALIAS_INDEX } = require('../data/chemistry-knowledge');

const ROOT = path.join(__dirname, '..', '..');
const entityIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'graph', 'entity-index.json'), 'utf8'));

function splitSentences(text) {
  // Same sentence-boundary heuristic used elsewhere in this codebase
  // (period + space, guarding common abbreviations/decimals is unnecessary
  // here since entity longDescriptions don't use "e.g."/"Dr." patterns).
  return (text || '').split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

const SAFETY_TERMS = /\b(safe|safety|hazard|danger|irritat|corros|toxic|caution|risk|damage|harm|injur)\w*\b/i;
const OPERATIONAL_TERMS = /\b(add|dose|test|clean|drain|refill|maintain|replace|adjust|balance|monitor|check|apply|use|run|circulat)\w*\b/i;
const TAXONOMY_TERMS = /\b(is a|is an|are a|refers to|means|is the|is defined as|is called|also called|also known as)\b/i;
const MATERIAL_TERMS = /\b(surface|liner|gelcoat|plaster|concrete|fiberglass|vinyl|metal|tile|grout|coping|finish|substrate)\w*\b/i;
const CHEMISTRY_PARAM_TERMS = /\b(ph|chlorine|bromine|alkalinity|calcium|hardness|cyanuric|cya|salt|ppm|lsi|saturation|oxidat|sanitiz|disinfect|hocl|ocl)\w*\b/i;

function classifySentence(sentence, hasNumericChemistryClaim) {
  if (hasNumericChemistryClaim) return 'numeric_chemistry_claim';
  if (SAFETY_TERMS.test(sentence)) return 'safety_claim';
  if (MATERIAL_TERMS.test(sentence) && CHEMISTRY_PARAM_TERMS.test(sentence)) return 'material_property_claim';
  if (MATERIAL_TERMS.test(sentence)) return 'material_property_claim';
  if (CHEMISTRY_PARAM_TERMS.test(sentence)) return 'qualitative_chemistry_claim';
  if (OPERATIONAL_TERMS.test(sentence)) return 'operational_claim';
  if (TAXONOMY_TERMS.test(sentence)) return 'taxonomy_definition_claim';
  return 'non_claim';
}

// Cross-reference a numeric claim record against the existing chemistry-
// ranges.js registry (Step 5). Overlap = the claim's [min,max] intersects
// a registry range's [min,max] for the same parameter_id.
function crossReferenceRange(rec) {
  if (!rec.parameter_id) return { status: 'NO_EXISTING_SOURCE', matched_range_ids: [] };
  const candidates = RANGES.filter((r) => r.parameter_id === rec.parameter_id);
  if (candidates.length === 0) return { status: 'NO_EXISTING_SOURCE', matched_range_ids: [] };
  const overlapping = candidates.filter((r) => {
    if (rec.minimum === null || rec.maximum === null) return false;
    return rec.minimum <= r.maximum && rec.maximum >= r.minimum;
  });
  if (overlapping.length > 0) {
    const supported = overlapping.filter((r) => r.status === 'SUPPORTED' || r.status === 'VERIFIED');
    return {
      status: supported.length > 0 ? 'DIRECTLY_SUPPORTED' : 'SUPPORTED_BY_CONTEXT',
      matched_range_ids: overlapping.map((r) => r.id),
    };
  }
  // Same parameter exists in the registry but no range overlaps this claim's
  // numbers -- flag as a potential conflict rather than silently NO_SOURCE.
  return { status: 'CONFLICTING', matched_range_ids: candidates.map((r) => r.id) };
}

const longdescRows = [];
const claimRows = [];
let claimIdCounter = 0;

for (const [id, e] of Object.entries(entityIndex)) {
  const longDesc = e.longDescription || '';
  const sentences = splitSentences(longDesc);
  let chemClaimCount = 0;
  let nonChemCount = 0;
  const existingClaimFamilyMatches = new Set();

  for (const sentence of sentences) {
    const numericRecords = extractFromSentence(sentence).filter((r) => r.parameter_id !== null);
    const hasNumeric = numericRecords.length > 0;
    const claimType = classifySentence(sentence, hasNumeric);
    if (claimType !== 'non_claim' && claimType !== 'taxonomy_definition_claim') chemClaimCount++;
    else nonChemCount++;

    if (hasNumeric) {
      for (const rec of numericRecords) {
        claimIdCounter++;
        const claimId = `ec-${id}-${String(claimIdCounter).padStart(4, '0')}`;
        // Only cross-reference a claim the extractor itself is confident
        // about (CORRECT_EXTRACTION). IMPOSSIBLE_MAPPING means the
        // extractor's own plausibility check already rejected this
        // parameter/unit pairing (e.g. a percentage or a duration
        // attributed to "pH"/"salt" because it was the nearest mention) --
        // reporting that as a scientific CONFLICT would misrepresent an
        // extraction-attribution problem as a chemistry-accuracy problem.
        // Per Step 4: "If a claim cannot be reliably extracted, mark it
        // accordingly. Do not guess parameter attribution."
        const reliable = rec.extraction_status === 'CORRECT_EXTRACTION';
        const xref = reliable ? crossReferenceRange(rec) : { status: 'AMBIGUOUS', matched_range_ids: [] };
        for (const rid of xref.matched_range_ids) existingClaimFamilyMatches.add(rid);
        claimRows.push({
          claim_id: claimId,
          entity_id: id,
          source_text: sentence,
          claim_type: 'numeric_chemistry_claim',
          parameter: rec.parameter_id,
          value: rec.minimum === rec.maximum ? rec.minimum : `${rec.minimum}-${rec.maximum}`,
          unit: rec.unit,
          environment: rec.environment,
          scenario: 'unspecified',
          extraction_status: rec.extraction_status,
          scientific_review_status: xref.status,
          source_registry_ids: xref.matched_range_ids.join(';'),
          review_required: xref.status === 'CONFLICTING' || xref.status === 'NO_EXISTING_SOURCE' || xref.status === 'AMBIGUOUS' ? 'yes' : 'no',
        });
      }
    } else if (claimType !== 'non_claim') {
      claimIdCounter++;
      const claimId = `ec-${id}-${String(claimIdCounter).padStart(4, '0')}`;
      claimRows.push({
        claim_id: claimId,
        entity_id: id,
        source_text: sentence,
        claim_type: claimType,
        parameter: '',
        value: '',
        unit: '',
        environment: '',
        scenario: '',
        extraction_status: 'NO_NUMERIC_CONTENT',
        scientific_review_status: 'REQUIRES_REVIEW',
        source_registry_ids: '',
        review_required: 'yes',
      });
    }
  }

  longdescRows.push({
    entity_id: id,
    slug: id,
    page_url: `https://waterbalancetools.com/entities/${id}`,
    longDescription: longDesc,
    description_length: longDesc.length,
    claim_count: sentences.length,
    chemistry_claim_count: chemClaimCount,
    non_chemistry_claim_count: nonChemCount,
    sourceOrganizations: (e.sourceOrganizations || []).join(';'),
    existing_claim_family: [...existingClaimFamilyMatches].join(';'),
    existing_source_registry_ids: [...existingClaimFamilyMatches].join(';'),
    review_status: 'PHASE_7J_AUDITED',
  });
}

function toCsv(rows, header) {
  return [header.join(',')].concat(
    rows.map((r) => header.map((h) => '"' + String(r[h]).replace(/"/g, '""') + '"').join(','))
  ).join('\n') + '\n';
}

const outDir = path.join(ROOT, 'reports', 'phase-7j');
fs.mkdirSync(outDir, { recursive: true });

const ldHeader = ['entity_id', 'slug', 'page_url', 'longDescription', 'description_length', 'claim_count', 'chemistry_claim_count', 'non_chemistry_claim_count', 'sourceOrganizations', 'existing_claim_family', 'existing_source_registry_ids', 'review_status'];
fs.writeFileSync(path.join(outDir, 'entity-longdescriptions.csv'), toCsv(longdescRows, ldHeader));

const claimHeader = ['claim_id', 'entity_id', 'source_text', 'claim_type', 'parameter', 'value', 'unit', 'environment', 'scenario', 'extraction_status', 'scientific_review_status', 'source_registry_ids', 'review_required'];
fs.writeFileSync(path.join(outDir, 'entity-claim-inventory.csv'), toCsv(claimRows, claimHeader));

console.log(`extract-entity-claims: ${longdescRows.length} entities, ${claimRows.length} claims extracted`);
const byType = {};
for (const c of claimRows) byType[c.claim_type] = (byType[c.claim_type] || 0) + 1;
console.log('by claim_type:', byType);
const byStatus = {};
for (const c of claimRows) byStatus[c.scientific_review_status] = (byStatus[c.scientific_review_status] || 0) + 1;
console.log('by scientific_review_status:', byStatus);
