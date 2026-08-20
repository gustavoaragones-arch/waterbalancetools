'use strict';
/**
 * entity-content-policy.js (Phase 7I, Step 5)
 *
 * Documents which content dimensions are legitimate for which entity
 * TYPE, so future entity records aren't padded with sections that don't
 * apply to them (e.g. a pool-construction material doesn't need a
 * "chemistry implications" section merely because a chemical parameter
 * entity has one). This is a policy reference, not a new render pipeline
 * -- scripts/generate-entity-pages.js remains the single entity-page
 * generator; this module only documents which of its existing,
 * conditionally-rendered sections are expected per entity type.
 *
 * Do not treat this as a checklist requiring every dimension on every
 * page. A dimension is used only when the entity's own data genuinely
 * supports it (an empty scripts/generate-entity-pages.js buildXSection()
 * call already renders nothing, per existing behavior -- this file just
 * states the intent explicitly).
 */

const DIMENSIONS = {
  CONCISE_DEFINITION: 'shortDescription -- one sentence, used in hero summary, cards, and as a meta-description fallback.',
  FULL_DEFINITION: 'longDescription -- the "Definition" section body. Required on every entity; may equal shortDescription only when there is genuinely nothing more to say (rare).',
  IDEAL_RANGE: 'idealRange/units -- only for entities with an actual numeric target range (chemical parameters, some equipment specs). Omit ("N/A") for entities with no target range (pool types, organizations, checklists).',
  CHEMISTRY_IMPLICATIONS: 'Chemistry-relevant facts embedded in longDescription (e.g. how a pool surface type changes calcium hardness targets). Only for entities where chemistry genuinely differs because of this entity -- not added to every entity for consistency.',
  CALCULATOR_RELATIONSHIP: 'calculatorIds -- only entities with a real, directly relevant calculator (a chemical parameter, a pool-type with a volume/dosing calculator). Not added to entities with no calculator relevance (e.g. a testing organization).',
  RELATED_ENTITIES: 'relatedEntities -- genuine conceptual relationships (a pool type relates to the parameters it affects), not an arbitrary "see also" list.',
  SOURCE_ORGANIZATIONS: 'sourceOrganizations -- only when a specific claim in longDescription is attributable to a named standards body (PHTA, CDC, NSF). Not fabricated when no real source backs the claim.',
  ACADEMY_GLOSSARY_REFERENCE: 'academyIds/glossaryIds/referenceIds -- link out to a fuller treatment elsewhere rather than duplicating that content on the entity page itself.',
};

// Which dimensions are LEGITIMATE per entity type (not "required" --
// "eligible if the underlying data supports it"). Types not listed use
// only CONCISE_DEFINITION + FULL_DEFINITION + RELATED_ENTITIES as a
// baseline.
const TYPE_PROFILES = {
  chemical: ['CONCISE_DEFINITION', 'FULL_DEFINITION', 'IDEAL_RANGE', 'CHEMISTRY_IMPLICATIONS', 'CALCULATOR_RELATIONSHIP', 'RELATED_ENTITIES', 'SOURCE_ORGANIZATIONS', 'ACADEMY_GLOSSARY_REFERENCE'],
  measurement: ['CONCISE_DEFINITION', 'FULL_DEFINITION', 'IDEAL_RANGE', 'CALCULATOR_RELATIONSHIP', 'RELATED_ENTITIES', 'ACADEMY_GLOSSARY_REFERENCE'],
  unit: ['CONCISE_DEFINITION', 'FULL_DEFINITION', 'CALCULATOR_RELATIONSHIP', 'RELATED_ENTITIES'],
  'pool-type': ['CONCISE_DEFINITION', 'FULL_DEFINITION', 'CHEMISTRY_IMPLICATIONS', 'CALCULATOR_RELATIONSHIP', 'RELATED_ENTITIES', 'SOURCE_ORGANIZATIONS'],
  equipment: ['CONCISE_DEFINITION', 'FULL_DEFINITION', 'CALCULATOR_RELATIONSHIP', 'RELATED_ENTITIES', 'ACADEMY_GLOSSARY_REFERENCE'],
  process: ['CONCISE_DEFINITION', 'FULL_DEFINITION', 'CHEMISTRY_IMPLICATIONS', 'RELATED_ENTITIES', 'ACADEMY_GLOSSARY_REFERENCE'],
  problem: ['CONCISE_DEFINITION', 'FULL_DEFINITION', 'CHEMISTRY_IMPLICATIONS', 'CALCULATOR_RELATIONSHIP', 'RELATED_ENTITIES'],
  organization: ['CONCISE_DEFINITION', 'FULL_DEFINITION', 'RELATED_ENTITIES'],
  resource: ['CONCISE_DEFINITION', 'FULL_DEFINITION', 'RELATED_ENTITIES'],
  'chemical-product': ['CONCISE_DEFINITION', 'FULL_DEFINITION', 'CALCULATOR_RELATIONSHIP', 'RELATED_ENTITIES', 'SOURCE_ORGANIZATIONS'],
};

module.exports = { DIMENSIONS, TYPE_PROFILES };
