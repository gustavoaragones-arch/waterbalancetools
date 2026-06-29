'use strict';
// trust-sources.js
// Source category framework for the Scientific Authority System.
// Phase 5B defines the framework only. Detailed citations populated in Phase 5C.

module.exports = {
  dataId: 'references',
  version: '2026.07',
  lastReviewed: '2026-07-01',
  description: 'Source category framework defining the six recognized evidence tiers used to classify all references on WaterBalanceTools. Detailed citations will be added in Phase 5C.',
  categories: [
    {
      id: 'government-guidance',
      label: 'Government Guidance',
      shortLabel: 'Gov',
      description: 'Guidance, regulations, and safety standards from government agencies with public health authority.',
      examples: ['U.S. Consumer Product Safety Commission (CPSC)', 'Centers for Disease Control and Prevention (CDC)', 'Environmental Protection Agency (EPA)', 'State health department pool codes'],
      authorityLevel: 1,
      citationPrefix: 'Gov.',
      color: '#003366',
    },
    {
      id: 'industry-standards',
      label: 'Industry Standards',
      shortLabel: 'Std',
      description: 'Formally adopted standards from recognized professional and trade organizations.',
      examples: ['Pool & Hot Tub Alliance (PHTA) / ANSI standards', 'NSF International', 'FINA (Fédération Internationale de Natation)', 'World Health Organization (WHO) guidelines'],
      authorityLevel: 2,
      citationPrefix: 'Std.',
      color: '#004488',
    },
    {
      id: 'manufacturer-documentation',
      label: 'Manufacturer Documentation',
      shortLabel: 'Mfr',
      description: 'Technical specifications, product data sheets, and usage guidelines from chemical and equipment manufacturers.',
      examples: ['Salt chlorinator system manuals', 'Chemical product safety data sheets (SDS)', 'Test kit manufacturer calibration data'],
      authorityLevel: 3,
      citationPrefix: 'Mfr.',
      color: '#445566',
    },
    {
      id: 'scientific-literature',
      label: 'Scientific Literature',
      shortLabel: 'Sci',
      description: 'Peer-reviewed research papers, textbooks, and academic publications on water chemistry and disinfection.',
      examples: ['Journal of Environmental Health', 'Water Research journal', 'Taylor Technologies Pool/Spa Water Chemistry reference', 'AWWA Water Quality and Treatment textbook'],
      authorityLevel: 2,
      citationPrefix: 'Sci.',
      color: '#2a4a2a',
    },
    {
      id: 'educational-resources',
      label: 'Educational Resources',
      shortLabel: 'Edu',
      description: 'Training materials, textbooks, and educational content from recognized pool industry training programs.',
      examples: ['NSPF (National Swimming Pool Foundation) CPO course materials', 'Pool operator training curricula', 'Certified pool technician educational texts'],
      authorityLevel: 4,
      citationPrefix: 'Edu.',
      color: '#4a3a00',
    },
    {
      id: 'internal-dataset',
      label: 'Internal WaterBalanceTools Dataset',
      shortLabel: 'Int',
      description: 'Values derived through editorial synthesis of the above sources, documented in the WaterBalanceTools Canonical Data Layer. Used when no single authoritative source exists for a specific value but multiple sources support a range.',
      examples: ['Composite dosage coefficients derived from multiple manufacturer specifications', 'Editorial interpretation of conflicting range guidance', 'Values in data/datasets/*.json marked as editorial-interpretation'],
      authorityLevel: 5,
      citationPrefix: 'Int.',
      color: '#5a5a5a',
    },
  ],
};
