'use strict';
// All allowed relationship types:
// affected_by, measured_by, requires, uses, solves, causes,
// recommended_for, related_to, part_of, calculated_by,
// explained_by, references, compared_with, stored_in, maintained_by

module.exports = [
  // ── Free Chlorine relationships ──────────────────────────────────────────────
  { from: 'free-chlorine', relationship: 'affected_by', to: 'ph' },
  { from: 'free-chlorine', relationship: 'affected_by', to: 'cyanuric-acid' },
  { from: 'free-chlorine', relationship: 'affected_by', to: 'temperature' },
  { from: 'free-chlorine', relationship: 'measured_by', to: 'testing' },
  { from: 'free-chlorine', relationship: 'calculated_by', to: 'formula-02' },
  { from: 'free-chlorine', relationship: 'explained_by', to: 'glossary/free-chlorine' },
  { from: 'free-chlorine', relationship: 'solves', to: 'low-chlorine' },
  { from: 'free-chlorine', relationship: 'solves', to: 'algae' },
  { from: 'free-chlorine', relationship: 'solves', to: 'green-water' },
  { from: 'free-chlorine', relationship: 'recommended_for', to: 'swimming-pool' },
  { from: 'free-chlorine', relationship: 'recommended_for', to: 'hot-tub' },
  { from: 'free-chlorine', relationship: 'compared_with', to: 'bromine' },
  { from: 'free-chlorine', relationship: 'compared_with', to: 'combined-chlorine' },
  { from: 'free-chlorine', relationship: 'part_of', to: 'total-chlorine' },
  { from: 'free-chlorine', relationship: 'related_to', to: 'orp' },
  { from: 'free-chlorine', relationship: 'uses', to: 'liquid-chlorine' },
  { from: 'free-chlorine', relationship: 'uses', to: 'calcium-hypochlorite' },
  { from: 'free-chlorine', relationship: 'uses', to: 'trichlor-tablets' },

  // ── Combined Chlorine relationships ──────────────────────────────────────────
  { from: 'combined-chlorine', relationship: 'causes', to: 'strong-chlorine-smell' },
  { from: 'combined-chlorine', relationship: 'causes', to: 'eye-irritation' },
  { from: 'combined-chlorine', relationship: 'causes', to: 'skin-irritation' },
  { from: 'combined-chlorine', relationship: 'measured_by', to: 'testing' },
  { from: 'combined-chlorine', relationship: 'part_of', to: 'total-chlorine' },
  { from: 'combined-chlorine', relationship: 'explained_by', to: 'glossary/combined-chlorine' },
  { from: 'combined-chlorine', relationship: 'related_to', to: 'breakpoint-chlorination' },

  // ── pH relationships ─────────────────────────────────────────────────────────
  { from: 'ph', relationship: 'affected_by', to: 'alkalinity' },
  { from: 'ph', relationship: 'affected_by', to: 'temperature' },
  { from: 'ph', relationship: 'affected_by', to: 'muriatic-acid' },
  { from: 'ph', relationship: 'affected_by', to: 'soda-ash' },
  { from: 'ph', relationship: 'measured_by', to: 'testing' },
  { from: 'ph', relationship: 'calculated_by', to: 'formula-04' },
  { from: 'ph', relationship: 'part_of', to: 'lsi' },
  { from: 'ph', relationship: 'explained_by', to: 'glossary/ph' },
  { from: 'ph', relationship: 'causes', to: 'low-ph' },
  { from: 'ph', relationship: 'causes', to: 'high-ph' },
  { from: 'ph', relationship: 'related_to', to: 'free-chlorine' },
  { from: 'ph', relationship: 'recommended_for', to: 'swimming-pool' },
  { from: 'ph', relationship: 'recommended_for', to: 'hot-tub' },

  // ── Alkalinity relationships ─────────────────────────────────────────────────
  { from: 'alkalinity', relationship: 'affected_by', to: 'muriatic-acid' },
  { from: 'alkalinity', relationship: 'affected_by', to: 'baking-soda' },
  { from: 'alkalinity', relationship: 'measured_by', to: 'testing' },
  { from: 'alkalinity', relationship: 'calculated_by', to: 'formula-05' },
  { from: 'alkalinity', relationship: 'part_of', to: 'lsi' },
  { from: 'alkalinity', relationship: 'explained_by', to: 'glossary/total-alkalinity' },
  { from: 'alkalinity', relationship: 'related_to', to: 'ph' },
  { from: 'alkalinity', relationship: 'requires', to: 'baking-soda' },

  // ── Calcium Hardness relationships ───────────────────────────────────────────
  { from: 'calcium-hardness', relationship: 'measured_by', to: 'testing' },
  { from: 'calcium-hardness', relationship: 'part_of', to: 'lsi' },
  { from: 'calcium-hardness', relationship: 'explained_by', to: 'glossary/calcium-hardness' },
  { from: 'calcium-hardness', relationship: 'causes', to: 'scaling' },
  { from: 'calcium-hardness', relationship: 'causes', to: 'corrosion' },
  { from: 'calcium-hardness', relationship: 'requires', to: 'calcium-chloride' },
  { from: 'calcium-hardness', relationship: 'recommended_for', to: 'concrete-pool' },

  // ── CYA relationships ────────────────────────────────────────────────────────
  { from: 'cyanuric-acid', relationship: 'affected_by', to: 'water-replacement' },
  { from: 'cyanuric-acid', relationship: 'measured_by', to: 'testing' },
  { from: 'cyanuric-acid', relationship: 'calculated_by', to: 'formula-07' },
  { from: 'cyanuric-acid', relationship: 'explained_by', to: 'glossary/cyanuric-acid' },
  { from: 'cyanuric-acid', relationship: 'recommended_for', to: 'outdoor-pool' },
  { from: 'cyanuric-acid', relationship: 'related_to', to: 'free-chlorine' },
  { from: 'cyanuric-acid', relationship: 'uses', to: 'stabilizer' },
  { from: 'cyanuric-acid', relationship: 'uses', to: 'trichlor-tablets' },

  // ── LSI relationships ────────────────────────────────────────────────────────
  { from: 'lsi', relationship: 'calculated_by', to: 'formula-09' },
  { from: 'lsi', relationship: 'explained_by', to: 'glossary/langelier-saturation-index' },
  { from: 'lsi', relationship: 'causes', to: 'scaling' },
  { from: 'lsi', relationship: 'causes', to: 'corrosion' },
  { from: 'lsi', relationship: 'measured_by', to: 'ph' },
  { from: 'lsi', relationship: 'measured_by', to: 'alkalinity' },
  { from: 'lsi', relationship: 'measured_by', to: 'calcium-hardness' },
  { from: 'lsi', relationship: 'measured_by', to: 'temperature' },

  // ── Salt relationships ───────────────────────────────────────────────────────
  { from: 'salt', relationship: 'requires', to: 'salt-chlorinator' },
  { from: 'salt', relationship: 'calculated_by', to: 'formula-06' },
  { from: 'salt', relationship: 'measured_by', to: 'testing' },
  { from: 'salt', relationship: 'recommended_for', to: 'saltwater-pool' },
  { from: 'salt', relationship: 'uses', to: 'pool-salt' },

  // ── Process relationships ────────────────────────────────────────────────────
  { from: 'shock-treatment', relationship: 'solves', to: 'algae' },
  { from: 'shock-treatment', relationship: 'solves', to: 'green-water' },
  { from: 'shock-treatment', relationship: 'solves', to: 'strong-chlorine-smell' },
  { from: 'shock-treatment', relationship: 'solves', to: 'cloudy-water' },
  { from: 'shock-treatment', relationship: 'uses', to: 'calcium-hypochlorite' },
  { from: 'shock-treatment', relationship: 'uses', to: 'liquid-chlorine' },
  { from: 'shock-treatment', relationship: 'calculated_by', to: 'formula-03' },
  { from: 'shock-treatment', relationship: 'related_to', to: 'breakpoint-chlorination' },

  { from: 'breakpoint-chlorination', relationship: 'solves', to: 'strong-chlorine-smell' },
  { from: 'breakpoint-chlorination', relationship: 'solves', to: 'eye-irritation' },
  { from: 'breakpoint-chlorination', relationship: 'solves', to: 'skin-irritation' },
  { from: 'breakpoint-chlorination', relationship: 'requires', to: 'free-chlorine' },
  { from: 'breakpoint-chlorination', relationship: 'related_to', to: 'combined-chlorine' },

  { from: 'balancing', relationship: 'requires', to: 'testing' },
  { from: 'balancing', relationship: 'requires', to: 'ph' },
  { from: 'balancing', relationship: 'requires', to: 'alkalinity' },
  { from: 'balancing', relationship: 'requires', to: 'calcium-hardness' },
  { from: 'balancing', relationship: 'requires', to: 'free-chlorine' },
  { from: 'balancing', relationship: 'calculated_by', to: 'formula-09' },
  { from: 'balancing', relationship: 'solves', to: 'scaling' },
  { from: 'balancing', relationship: 'solves', to: 'corrosion' },
  { from: 'balancing', relationship: 'solves', to: 'cloudy-water' },

  { from: 'filtration', relationship: 'requires', to: 'pump' },
  { from: 'filtration', relationship: 'uses', to: 'sand-filter' },
  { from: 'filtration', relationship: 'uses', to: 'cartridge-filter' },
  { from: 'filtration', relationship: 'uses', to: 'de-filter' },
  { from: 'filtration', relationship: 'solves', to: 'cloudy-water' },
  { from: 'filtration', relationship: 'calculated_by', to: 'formula-08' },

  { from: 'backwashing', relationship: 'maintains', to: 'sand-filter' },
  { from: 'backwashing', relationship: 'maintains', to: 'de-filter' },
  { from: 'backwashing', relationship: 'related_to', to: 'filtration' },

  { from: 'testing', relationship: 'uses', to: 'taylor-technologies' },
  { from: 'testing', relationship: 'uses', to: 'lamotte' },
  { from: 'testing', relationship: 'related_to', to: 'balancing' },
  { from: 'testing', relationship: 'recommended_for', to: 'swimming-pool' },
  { from: 'testing', relationship: 'recommended_for', to: 'hot-tub' },

  { from: 'sanitizing', relationship: 'uses', to: 'free-chlorine' },
  { from: 'sanitizing', relationship: 'uses', to: 'bromine' },
  { from: 'sanitizing', relationship: 'solves', to: 'low-chlorine' },
  { from: 'sanitizing', relationship: 'references', to: 'cdc' },
  { from: 'sanitizing', relationship: 'references', to: 'phta' },

  { from: 'winterization', relationship: 'requires', to: 'balancing' },
  { from: 'winterization', relationship: 'recommended_for', to: 'swimming-pool' },
  { from: 'winterization', relationship: 'related_to', to: 'pool-opening' },
  { from: 'winterization', relationship: 'uses', to: 'cover' },

  { from: 'water-replacement', relationship: 'solves', to: 'low-chlorine' },
  { from: 'water-replacement', relationship: 'related_to', to: 'cyanuric-acid' },
  { from: 'water-replacement', relationship: 'related_to', to: 'total-dissolved-solids' },

  // ── Equipment relationships ──────────────────────────────────────────────────
  { from: 'pump', relationship: 'part_of', to: 'filtration' },
  { from: 'pump', relationship: 'calculated_by', to: 'formula-08' },
  { from: 'pump', relationship: 'maintained_by', to: 'backwashing' },
  { from: 'pump', relationship: 'related_to', to: 'flow-rate' },
  { from: 'pump', relationship: 'related_to', to: 'turnover-time' },

  { from: 'sand-filter', relationship: 'part_of', to: 'filtration' },
  { from: 'sand-filter', relationship: 'compared_with', to: 'cartridge-filter' },
  { from: 'sand-filter', relationship: 'compared_with', to: 'de-filter' },
  { from: 'sand-filter', relationship: 'requires', to: 'backwashing' },
  { from: 'cartridge-filter', relationship: 'compared_with', to: 'sand-filter' },
  { from: 'cartridge-filter', relationship: 'compared_with', to: 'de-filter' },
  { from: 'de-filter', relationship: 'requires', to: 'backwashing' },
  { from: 'de-filter', relationship: 'compared_with', to: 'sand-filter' },

  { from: 'salt-chlorinator', relationship: 'requires', to: 'salt' },
  { from: 'salt-chlorinator', relationship: 'uses', to: 'pool-salt' },
  { from: 'salt-chlorinator', relationship: 'part_of', to: 'saltwater-pool' },

  { from: 'automatic-chlorinator', relationship: 'uses', to: 'trichlor-tablets' },
  { from: 'automatic-chlorinator', relationship: 'related_to', to: 'cyanuric-acid' },

  // ── Pool type relationships ──────────────────────────────────────────────────
  { from: 'swimming-pool', relationship: 'compared_with', to: 'hot-tub' },
  { from: 'swimming-pool', relationship: 'compared_with', to: 'saltwater-pool' },
  { from: 'saltwater-pool', relationship: 'requires', to: 'salt-chlorinator' },
  { from: 'saltwater-pool', relationship: 'requires', to: 'salt' },
  { from: 'hot-tub', relationship: 'compared_with', to: 'swimming-pool' },
  { from: 'hot-tub', relationship: 'requires', to: 'balancing' },
  { from: 'hot-tub', relationship: 'requires', to: 'testing' },
  { from: 'outdoor-pool', relationship: 'requires', to: 'cyanuric-acid' },
  { from: 'indoor-pool', relationship: 'related_to', to: 'combined-chlorine' },
  { from: 'concrete-pool', relationship: 'requires', to: 'calcium-hardness' },
  { from: 'vinyl-pool', relationship: 'related_to', to: 'calcium-hardness' },
  { from: 'fiberglass-pool', relationship: 'related_to', to: 'calcium-hardness' },

  // ── Problem relationships ────────────────────────────────────────────────────
  { from: 'cloudy-water', relationship: 'causes', to: 'low-chlorine' },
  { from: 'green-water', relationship: 'causes', to: 'low-chlorine' },
  { from: 'scaling', relationship: 'causes', to: 'high-ph' },
  { from: 'corrosion', relationship: 'causes', to: 'low-ph' },
  { from: 'algae', relationship: 'causes', to: 'green-water' },
  { from: 'algae', relationship: 'affected_by', to: 'phosphate' },
  { from: 'strong-chlorine-smell', relationship: 'causes', to: 'combined-chlorine' },
  { from: 'eye-irritation', relationship: 'related_to', to: 'combined-chlorine' },
  { from: 'skin-irritation', relationship: 'related_to', to: 'combined-chlorine' },
  { from: 'low-chlorine', relationship: 'solves', to: 'sanitizing' },
  { from: 'high-ph', relationship: 'related_to', to: 'scaling' },
  { from: 'low-ph', relationship: 'related_to', to: 'corrosion' },

  // ── Chemical product relationships ───────────────────────────────────────────
  { from: 'liquid-chlorine', relationship: 'solves', to: 'low-chlorine' },
  { from: 'calcium-hypochlorite', relationship: 'solves', to: 'algae' },
  { from: 'calcium-hypochlorite', relationship: 'solves', to: 'green-water' },
  { from: 'muriatic-acid', relationship: 'solves', to: 'high-ph' },
  { from: 'muriatic-acid', relationship: 'solves', to: 'scaling' },
  { from: 'soda-ash', relationship: 'solves', to: 'low-ph' },
  { from: 'baking-soda', relationship: 'solves', to: 'corrosion' },
  { from: 'stabilizer', relationship: 'solves', to: 'low-chlorine' },
  { from: 'calcium-chloride', relationship: 'solves', to: 'corrosion' },

  // ── Organization references ──────────────────────────────────────────────────
  { from: 'phta', relationship: 'references', to: 'free-chlorine' },
  { from: 'phta', relationship: 'references', to: 'ph' },
  { from: 'phta', relationship: 'references', to: 'alkalinity' },
  { from: 'phta', relationship: 'references', to: 'calcium-hardness' },
  { from: 'cdc', relationship: 'references', to: 'sanitizing' },
  { from: 'taylor-technologies', relationship: 'references', to: 'lsi' },
  { from: 'taylor-technologies', relationship: 'references', to: 'testing' },

  // ── Resource relationships ───────────────────────────────────────────────────
  { from: 'maintenance-checklist', relationship: 'recommended_for', to: 'swimming-pool' },
  { from: 'vacation-rental-checklist', relationship: 'recommended_for', to: 'swimming-pool' },
  { from: 'vacation-rental-checklist', relationship: 'recommended_for', to: 'hot-tub' },
  { from: 'water-test-sheet', relationship: 'related_to', to: 'testing' },
  { from: 'chemical-log', relationship: 'related_to', to: 'testing' },
  { from: 'opening-checklist', relationship: 'related_to', to: 'pool-opening' },
  { from: 'closing-checklist', relationship: 'related_to', to: 'winterization' },
  { from: 'emergency-reference', relationship: 'related_to', to: 'green-water' },
  { from: 'emergency-reference', relationship: 'related_to', to: 'algae' },

  // ── Turnover / flow ──────────────────────────────────────────────────────────
  { from: 'turnover-time', relationship: 'calculated_by', to: 'formula-08' },
  { from: 'turnover-time', relationship: 'requires', to: 'pump' },
  { from: 'flow-rate', relationship: 'related_to', to: 'pump' },
  { from: 'flow-rate', relationship: 'related_to', to: 'turnover-time' },
];
