/**
 * chemistry-knowledge.js
 *
 * Canonical chemistry vocabulary for WaterBalanceTools (Phase 7D).
 * This is the single controlled vocabulary of chemistry concepts the site
 * discusses. It does NOT contain target ranges (see chemistry-ranges.js) --
 * a concept can be referenced across many contexts, so ranges are kept as
 * separate, context-specific records rather than fields on the concept
 * itself (see reports/phase-7d/PHASE-7D-CHEMISTRY-KNOWLEDGE.md, Section on
 * the context model).
 *
 * review_status is one of: verified | supported | pending_review.
 * "verified" is reserved for definitions cross-checked against at least
 * two independent primary/professional sources with no unresolved
 * disagreement. Nothing in this file was marked verified purely because a
 * source was found for it -- see reports/phase-7d/SOURCE-SELECTION-POLICY.md.
 */
'use strict';

const PARAMETERS = [
  {
    id: 'ph',
    name: 'pH',
    canonical_term: 'pH',
    aliases: ['ph level', 'ph balance'],
    definition: 'A measure of how acidic or basic pool/spa water is, on a logarithmic 0-14 scale, where 7 is neutral. pH affects sanitizer effectiveness, swimmer comfort, and equipment/surface corrosion or scaling.',
    unit: 'pH_units',
    allowed_units: ['pH_units'],
    contexts: ['pool', 'hot_tub'],
    notes: 'Not a concentration; unitless logarithmic scale.',
    source_ids: ['cdc-healthy-swimming-home-treatment'],
    review_status: 'supported',
    last_reviewed: '2026-08-18',
  },
  {
    id: 'free_chlorine',
    name: 'Free Chlorine',
    canonical_term: 'Free Chlorine',
    aliases: ['fc', 'free available chlorine', 'fac'],
    definition: 'The portion of chlorine in water that is still available to sanitize (kill pathogens) and has not yet reacted with contaminants. Present primarily as hypochlorous acid (HOCl) and hypochlorite ion (OCl-).',
    unit: 'ppm',
    allowed_units: ['ppm', 'mg/L'],
    contexts: ['pool', 'hot_tub'],
    notes: 'ppm and mg/L are numerically equivalent for dilute aqueous solutions.',
    source_ids: ['cdc-healthy-swimming-home-treatment', 'cdc-mahc-2023'],
    review_status: 'supported',
    last_reviewed: '2026-08-18',
  },
  {
    id: 'combined_chlorine',
    name: 'Combined Chlorine',
    canonical_term: 'Combined Chlorine',
    aliases: ['cc', 'chloramines'],
    definition: 'Chlorine that has already reacted with ammonia or organic nitrogen compounds (sweat, urine, etc.) to form chloramines. Combined chlorine is a much weaker sanitizer/oxidizer than free chlorine and is associated with chemical odor and eye/respiratory irritation.',
    unit: 'ppm',
    allowed_units: ['ppm', 'mg/L'],
    contexts: ['pool', 'hot_tub'],
    notes: 'Total chlorine minus free chlorine equals combined chlorine.',
    source_ids: ['cdc-mahc-2023', 'npic-pool-spa-chemicals-fact-sheet'],
    review_status: 'supported',
    last_reviewed: '2026-08-18',
  },
  {
    id: 'total_chlorine',
    name: 'Total Chlorine',
    canonical_term: 'Total Chlorine',
    aliases: ['tc'],
    definition: 'The sum of free chlorine and combined chlorine present in the water.',
    unit: 'ppm',
    allowed_units: ['ppm', 'mg/L'],
    contexts: ['pool', 'hot_tub'],
    notes: 'Derived quantity: total chlorine = free chlorine + combined chlorine.',
    source_ids: ['cdc-mahc-2023'],
    review_status: 'supported',
    last_reviewed: '2026-08-18',
  },
  {
    id: 'total_alkalinity',
    name: 'Total Alkalinity',
    canonical_term: 'Total Alkalinity',
    aliases: ['ta', 'alkalinity'],
    definition: 'A measure of water\'s ability to resist changes in pH (its buffering capacity), expressed as an equivalent concentration of calcium carbonate (CaCO3).',
    unit: 'ppm',
    allowed_units: ['ppm', 'mg/L'],
    contexts: ['pool', 'hot_tub'],
    notes: 'Low TA causes pH to swing/"bounce"; high TA makes pH difficult to lower.',
    source_ids: ['ansi-phta-11-2019', 'phta-total-alkalinity-fact-sheet'],
    review_status: 'supported',
    last_reviewed: '2026-08-18',
  },
  {
    id: 'calcium_hardness',
    name: 'Calcium Hardness',
    canonical_term: 'Calcium Hardness',
    aliases: ['ch', 'hardness', 'water hardness'],
    definition: 'The concentration of dissolved calcium in the water, expressed as ppm CaCO3 equivalent. Affects the Langelier Saturation Index and whether water tends to scale (deposit calcium) or is corrosive (aggressive) toward pool surfaces/equipment.',
    unit: 'ppm',
    allowed_units: ['ppm', 'mg/L'],
    contexts: ['pool', 'hot_tub'],
    notes: null,
    source_ids: ['ansi-phta-11-2019'],
    review_status: 'supported',
    last_reviewed: '2026-08-18',
  },
  {
    id: 'cyanuric_acid',
    name: 'Cyanuric Acid',
    canonical_term: 'Cyanuric Acid',
    aliases: ['cya', 'stabilizer', 'conditioner'],
    definition: 'A chlorine stabilizer that protects free chlorine from rapid breakdown by UV sunlight by forming a reversible, weaker bond with it. At high concentrations this same buffering effect reduces the instantaneous concentration of active hypochlorous acid, slowing chlorine\'s disinfection speed (sometimes called "chlorine lock" or over-stabilization).',
    unit: 'ppm',
    allowed_units: ['ppm', 'mg/L'],
    contexts: ['pool'],
    notes: 'CDC guidance advises against using CYA/stabilized chlorine products in hot tubs at all -- see chemistry-ranges.js hot_tub records.',
    source_ids: ['cdc-mahc-2023', 'cdc-healthy-swimming-home-treatment'],
    review_status: 'supported',
    last_reviewed: '2026-08-18',
  },
  {
    id: 'salt',
    name: 'Salt',
    canonical_term: 'Salt',
    aliases: ['salinity', 'sodium chloride', 'nacl'],
    definition: 'Dissolved sodium chloride concentration in a saltwater pool, consumed by a salt chlorine generator (SWG) to electrolytically produce chlorine in place of manually added chlorine products.',
    unit: 'ppm',
    allowed_units: ['ppm', 'mg/L'],
    contexts: ['pool'],
    notes: 'Target salt level is manufacturer/equipment-specific -- see chemistry-ranges.js for per-manufacturer records rather than one universal figure.',
    source_ids: ['ansi-phta-11-2019'],
    review_status: 'pending_review',
    last_reviewed: '2026-08-18',
  },
  {
    id: 'bromine',
    name: 'Bromine',
    canonical_term: 'Bromine',
    aliases: ['br', 'total bromine'],
    definition: 'An alternative halogen sanitizer to chlorine, commonly used in hot tubs/spas because it remains more effective at higher water temperatures and produces less irritating byproducts (bromamines vs. chloramines).',
    unit: 'ppm',
    allowed_units: ['ppm', 'mg/L'],
    contexts: ['hot_tub', 'pool'],
    notes: 'Less commonly used in pools than hot tubs; not UV-stabilized the way chlorine can be with CYA.',
    source_ids: ['cdc-healthy-swimming-what-you-can-do-hot-tubs', 'cdc-healthy-swimming-home-treatment'],
    review_status: 'supported',
    last_reviewed: '2026-08-18',
  },
  {
    id: 'water_temperature',
    name: 'Water Temperature',
    canonical_term: 'Water Temperature',
    aliases: ['temp', 'temperature'],
    definition: 'The temperature of pool or spa water. Higher temperatures accelerate chlorine consumption/off-gassing and microbial growth, and increase the risk of scale formation; hot tubs operate at substantially higher temperatures than pools, which is why they require higher sanitizer minimums.',
    unit: 'fahrenheit',
    allowed_units: ['fahrenheit', 'celsius'],
    contexts: ['pool', 'hot_tub'],
    notes: null,
    source_ids: ['cdc-healthy-swimming-home-treatment'],
    review_status: 'pending_review',
    last_reviewed: '2026-08-18',
  },
  {
    id: 'chlorine_demand',
    name: 'Chlorine Demand',
    canonical_term: 'Chlorine Demand',
    aliases: ['demand'],
    definition: 'The amount of chlorine consumed by reacting with contaminants (organic material, ammonia, algae, sunlight/UV) before any residual free chlorine remains available to sanitize.',
    unit: null,
    allowed_units: [],
    contexts: ['pool', 'hot_tub'],
    notes: 'A qualitative/process concept, not itself a single measurable range.',
    source_ids: ['cdc-mahc-2023'],
    review_status: 'pending_review',
    last_reviewed: '2026-08-18',
  },
  {
    id: 'shock_treatment',
    name: 'Shock Treatment',
    canonical_term: 'Shock Treatment',
    aliases: ['shocking', 'superchlorination', 'hyperchlorination', 'breakpoint chlorination'],
    definition: 'Adding a large dose of oxidizer (usually chlorine) to rapidly raise free chlorine well above normal maintenance levels, to destroy chloramines (breakpoint chlorination), kill algae, or respond to contamination.',
    unit: null,
    allowed_units: [],
    contexts: ['pool', 'hot_tub'],
    notes: 'The commonly-cited "10x combined chlorine" breakpoint rule of thumb is an industry heuristic, not a CDC/MAHC numeric standard -- see chemistry-ranges.js and CHEMISTRY-CONFLICT-POLICY.md.',
    source_ids: ['cdc-mahc-2023'],
    review_status: 'pending_review',
    last_reviewed: '2026-08-18',
  },
  {
    id: 'sanitizer',
    name: 'Sanitizer',
    canonical_term: 'Sanitizer',
    aliases: ['disinfectant'],
    definition: 'Any chemical (chlorine, bromine, or other EPA-registered product) used to kill or inactivate pathogens in pool/spa water.',
    unit: null,
    allowed_units: [],
    contexts: ['pool', 'hot_tub'],
    notes: 'Umbrella concept; chlorine and bromine are the two sanitizers this knowledge layer currently models numerically.',
    source_ids: ['cdc-healthy-swimming-home-treatment'],
    review_status: 'pending_review',
    last_reviewed: '2026-08-18',
  },
  {
    id: 'oxidation',
    name: 'Oxidation',
    canonical_term: 'Oxidation',
    aliases: ['oxidizer', 'oxidizing'],
    definition: 'The chemical process by which sanitizers/oxidizers break down organic contaminants and microorganisms; the mechanism by which both routine sanitization and shock treatment work.',
    unit: null,
    allowed_units: [],
    contexts: ['pool', 'hot_tub'],
    notes: null,
    source_ids: [],
    review_status: 'pending_review',
    last_reviewed: '2026-08-18',
  },
  {
    id: 'algae',
    name: 'Algae',
    canonical_term: 'Algae',
    aliases: ['algae bloom', 'green pool'],
    definition: 'Photosynthetic organisms that can grow in inadequately sanitized pool water, causing green/cloudy discoloration and surfaces to become slippery; controlled primarily through adequate free chlorine, good filtration/circulation, and algaecide products where appropriate.',
    unit: null,
    allowed_units: [],
    contexts: ['pool'],
    notes: 'No numeric "target range" applies to algae itself; it is a contamination/failure state, not a chemistry parameter with a target.',
    source_ids: [],
    review_status: 'pending_review',
    last_reviewed: '2026-08-18',
  },
];

const PARAMETERS_BY_ID = Object.fromEntries(PARAMETERS.map((p) => [p.id, p]));

// alias (lowercased) -> parameter id, for claim-classification lookups.
const ALIAS_INDEX = {};
for (const p of PARAMETERS) {
  ALIAS_INDEX[p.canonical_term.toLowerCase()] = p.id;
  ALIAS_INDEX[p.name.toLowerCase()] = p.id;
  for (const a of p.aliases) ALIAS_INDEX[a.toLowerCase()] = p.id;
}

const CONTEXT_MODEL = {
  environment: ['pool', 'hot_tub'],
  sanitizer: ['chlorine', 'bromine', 'saltwater_chlorine_generator', 'unspecified'],
  scenario: ['routine_maintenance', 'target_range', 'treatment', 'shock', 'troubleshooting', 'calculator_input', 'calculator_output', 'safety_guidance'],
  temperature: ['general', 'cold', 'normal', 'elevated'],
};

module.exports = { PARAMETERS, PARAMETERS_BY_ID, ALIAS_INDEX, CONTEXT_MODEL };
