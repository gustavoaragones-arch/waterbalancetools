'use strict';
// trust-editorial.js
// Content for all editorial framework pages.
// Generated into /editorial/*.html by generate-trust.js

module.exports = {
  dataId: 'editorial',
  version: '2026.07',
  lastReviewed: '2026-07-01',
  maintainer: 'WaterBalanceTools Editorial Team',

  index: {
    slug: 'index',
    title: 'Editorial Framework',
    metaDescription: 'How WaterBalanceTools creates, reviews, and maintains pool chemistry content. Editorial standards, review processes, and correction policies.',
    h1: 'Editorial Framework',
    intro: 'WaterBalanceTools produces calculators, reference content, and educational guides for homeowners and pool operators. This section documents the standards and processes that govern how all content on this platform is created, reviewed, and maintained.',
    sections: [
      { heading: 'Our Commitment', body: 'Every calculator, dataset, formula, and article on WaterBalanceTools is produced with the goal of accuracy over simplicity. Where scientific consensus is clear, we follow it. Where guidance varies, we document the variation and disclose the basis for our recommendations.' },
      { heading: 'Who This Is For', body: 'This editorial framework is intended for users who want to understand the basis for our recommendations, researchers who need to evaluate our methodology, and contributors who want to understand our standards before submitting corrections.' },
    ],
    pages: ['editorial-policy', 'content-standards', 'review-process', 'correction-policy', 'update-policy'],
  },

  'editorial-policy': {
    slug: 'editorial-policy',
    title: 'Editorial Policy',
    metaDescription: 'The editorial policy governing how WaterBalanceTools selects, produces, and publishes pool chemistry content.',
    h1: 'Editorial Policy',
    lastReviewed: '2026-07-01',
    sections: [
      {
        heading: 'Purpose',
        body: 'This policy defines the principles that govern content selection, production, and publication on WaterBalanceTools. It applies to all calculators, datasets, reference pages, academy articles, glossary entries, and formulas published on this site.',
      },
      {
        heading: 'Scope',
        body: 'This policy covers all content produced by or on behalf of WaterBalanceTools, including programmatically generated content (calculator outputs, entity pages, dataset documentation) and editorially produced content (academy articles, reference pages, methodology documentation).',
      },
      {
        heading: 'Independence',
        body: 'Editorial decisions are made independently of commercial considerations. Product recommendations, if any, are based on documented characteristics rather than commercial relationships. No advertiser or sponsor may direct or influence the factual content of any page.',
      },
      {
        heading: 'Evidence Standard',
        body: 'All factual claims must be traceable to at least one of the recognized source categories defined in the WaterBalanceTools Source Framework: Government Guidance, Industry Standards, Manufacturer Documentation, Scientific Literature, Educational Resources, or Internal Dataset (clearly marked as such). Claims without a traceable source are not published.',
      },
      {
        heading: 'Transparency',
        body: 'Every calculator displays a Trust Panel identifying its formula version, dataset version, confidence level, and last review date. Every dataset and formula page displays version and provenance information. This transparency is non-negotiable and cannot be suppressed for any page.',
      },
      {
        heading: 'Relationship to Calculators',
        body: 'Calculator logic is defined by the formula datasets and the canonical data layer. No calculator may embed scientific values that are not traceable to data/datasets/*.json. Calculator outputs are estimates — they are produced from the inputs provided and should be confirmed by independent water testing.',
      },
      {
        heading: 'Relationship to Datasets',
        body: 'The canonical datasets in data/datasets/ are the single source of truth for all factual values. Updates to datasets propagate automatically to calculators, entities, and reference pages via the build pipeline. Manual overrides of canonical values are not permitted.',
      },
      {
        heading: 'Review Frequency',
        body: 'The editorial policy is reviewed annually or when significant changes to the underlying science, regulations, or platform architecture require an update.',
      },
    ],
  },

  'content-standards': {
    slug: 'content-standards',
    title: 'Content Standards',
    metaDescription: 'Standards for accuracy, clarity, and completeness applied to all WaterBalanceTools content.',
    h1: 'Content Standards',
    lastReviewed: '2026-07-01',
    sections: [
      {
        heading: 'Purpose',
        body: 'These standards define the quality requirements for all content on WaterBalanceTools. They apply to both editorially written content and programmatically generated content.',
      },
      {
        heading: 'Accuracy',
        body: 'All numerical values, ranges, and recommendations must be traceable to the canonical data layer (data/datasets/). No page may contain hardcoded scientific values that bypass dataset validation. Accuracy is verified at build time by validate-datasets.js and validate-trust.js.',
      },
      {
        heading: 'Clarity',
        body: 'Content is written for pool and spa owners who are not chemists. Technical terminology is defined on first use. Jargon is avoided unless it is the established industry term. Every technical article must link to the relevant glossary entry.',
      },
      {
        heading: 'Completeness',
        body: 'Every calculator must document what it calculates, what it does not calculate, and what external factors may affect results. Every dataset must document its source priority, version, and last review date. Every formula must document its variables and assumptions.',
      },
      {
        heading: 'Consistency',
        body: 'Units are consistent within each page and consistent with the canonical unit definitions in data/datasets/units.json. Terminology follows the canonical entity names in data/graph/entity-index.json. Contradictions between pages are treated as errors and resolved at build time.',
      },
      {
        heading: 'Disclosure of Limitations',
        body: 'Calculator results are clearly identified as estimates. Known limitations of each calculator are disclosed in the trust panel. Environmental factors (temperature, sunlight, bather load) that affect real-world results are documented.',
      },
      {
        heading: 'Maintenance',
        body: 'Content standards are enforced at build time. The validate-trust.js script rejects builds that fail to meet minimum standards for trust metadata, version information, and confidence level assignment.',
      },
      {
        heading: 'Review Frequency',
        body: 'Content standards are reviewed annually and updated when significant changes to platform architecture or data layer require new requirements.',
      },
    ],
  },

  'review-process': {
    slug: 'review-process',
    title: 'Review Process',
    metaDescription: 'How WaterBalanceTools reviews and maintains the accuracy of its pool chemistry calculators and content.',
    h1: 'Review Process',
    lastReviewed: '2026-07-01',
    sections: [
      {
        heading: 'Purpose',
        body: 'This document describes how WaterBalanceTools reviews and validates its calculators, datasets, and knowledge content.',
      },
      {
        heading: 'Automated Review',
        body: 'The primary review mechanism is automated. The build pipeline executes validate-datasets.js, validate-entities.js, and validate-trust.js on every build. These scripts reject the build if any required metadata is missing, any value lacks a source, or any trust component is broken. No page reaches production without passing automated validation.',
      },
      {
        heading: 'Dataset Review',
        body: 'Canonical datasets are reviewed when: (1) a new authoritative source is published that contradicts existing values, (2) a user submits a correction with supporting evidence, or (3) the scheduled annual review date is reached. Review dates are stored in each dataset\'s lastReviewed field.',
      },
      {
        heading: 'Calculator Review',
        body: 'Calculators are reviewed when: (1) an upstream dataset they depend on is updated, (2) a formula change is made, or (3) a correction is submitted. Calculator trust panels display the last reviewed date. Any calculator with a last reviewed date more than 12 months in the past triggers a review flag.',
      },
      {
        heading: 'Formula Review',
        body: 'Formulas are reviewed when new scientific literature modifies the accepted equation for a calculation. Formula versions are tracked in data/trust/formulas.json. Changes are logged in the revision history.',
      },
      {
        heading: 'Knowledge Content Review',
        body: 'Academy articles and reference pages are reviewed annually. Review dates are embedded in the data source (data/academy.json, data/reference.json) and displayed on each page.',
      },
      {
        heading: 'Scope',
        body: 'The review process applies to all calculators, canonical datasets, formulas, academy articles, glossary entries, and reference pages. It does not apply to programmatically generated navigation, sitemaps, or schema markup, which are derived automatically from the reviewed content.',
      },
      {
        heading: 'Review Frequency',
        body: 'Annual scheduled review for all content. Immediate review triggered by external standard changes or correction submissions.',
      },
    ],
  },

  'correction-policy': {
    slug: 'correction-policy',
    title: 'Correction Policy',
    metaDescription: 'How WaterBalanceTools handles corrections and updates to pool chemistry content.',
    h1: 'Correction Policy',
    lastReviewed: '2026-07-01',
    sections: [
      {
        heading: 'Purpose',
        body: 'This policy describes how WaterBalanceTools identifies, evaluates, and processes corrections to its calculators, datasets, and knowledge content.',
      },
      {
        heading: 'Scope',
        body: 'This policy applies to corrections to factual values, calculation logic, dataset records, and textual content on WaterBalanceTools. It does not apply to matters of style, layout, or navigational structure.',
      },
      {
        heading: 'How Errors Are Identified',
        body: 'Errors may be identified through: (1) automated build-time validation (the most common source), (2) user-submitted corrections, (3) periodic review by the editorial team, or (4) changes to external authoritative sources that invalidate existing values.',
      },
      {
        heading: 'Evaluation Criteria',
        body: 'A correction is accepted when the proposed value is supported by a higher-authority source than the current value, or when the current value is demonstrably incorrect relative to the existing source. Editorial judgment is used when sources conflict.',
      },
      {
        heading: 'Correction Process',
        body: 'Accepted corrections are applied to the canonical data source (the appropriate dataset in data/datasets/ or the content source in data/academy.json, data/formulas.json, etc.). The change is then propagated to all affected pages by re-running the build pipeline. A revision entry is added to data/trust/revisions.json.',
      },
      {
        heading: 'Disclosure',
        body: 'Significant factual corrections are recorded in the revision history and the affected pages\' version numbers are incremented. For minor corrections (e.g., typographical errors that do not affect values), revision entries are optional.',
      },
      {
        heading: 'Relationship to Calculators',
        body: 'Calculator corrections that change output values always increment the formula or dataset version, which is reflected in the calculator\'s trust panel. Users can verify which version was used for any calculation by checking the trust panel.',
      },
      {
        heading: 'Review Frequency',
        body: 'Correction policy reviewed annually.',
      },
    ],
  },

  'update-policy': {
    slug: 'update-policy',
    title: 'Update Policy',
    metaDescription: 'How WaterBalanceTools updates its content, datasets, and calculators over time.',
    h1: 'Update Policy',
    lastReviewed: '2026-07-01',
    sections: [
      {
        heading: 'Purpose',
        body: 'This policy describes how WaterBalanceTools manages updates to its content, datasets, formulas, and calculators.',
      },
      {
        heading: 'Scope',
        body: 'This policy applies to all content updates, including dataset record changes, formula revisions, calculator logic changes, and textual content updates.',
      },
      {
        heading: 'Version-Based Updates',
        body: 'Every dataset, formula, and calculator is versioned. Version numbers follow the YYYY.MM format for major versions. Minor revisions are tracked as YYYY.MM.revision_count. Version numbers are stored in data/trust/versions.json and displayed in trust panels and dataset documentation.',
      },
      {
        heading: 'Update Triggers',
        body: 'Updates are triggered by: (1) annual review schedule, (2) new authoritative standards or guidelines, (3) accepted user corrections, (4) architecture changes requiring content updates, or (5) new data becoming available that improves confidence level.',
      },
      {
        heading: 'Update Propagation',
        body: 'All updates are made to the canonical source (dataset JSON, content JSON, or formula JSON). The build pipeline propagates changes automatically to all affected HTML pages. Manual updates to generated HTML are not permitted and will be overwritten on the next build.',
      },
      {
        heading: 'Backward Compatibility',
        body: 'Dataset record IDs are stable and are not changed once assigned. Formula IDs are stable. If a formula is fundamentally revised, a new formula ID is created rather than changing the existing one. Legacy formula versions are retained in revision history.',
      },
      {
        heading: 'Relationship to Calculators',
        body: 'Calculator pages always reflect the current version of the formulas and datasets they depend on. When a user accesses a calculator, the trust panel shows the current versions. Historical version details are available in the revision history.',
      },
      {
        heading: 'Review Frequency',
        body: 'Update policy reviewed annually.',
      },
    ],
  },
};
