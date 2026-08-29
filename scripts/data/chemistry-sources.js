/**
 * chemistry-sources.js
 *
 * Centralized source registry for the Phase 7D chemistry knowledge layer.
 * Every source was located via live web research on 2026-08-18 and is
 * recorded with the metadata actually observed (title, organization, URL,
 * source type). Where a publication or last-updated date could not be
 * independently confirmed, publication_date is left null rather than
 * guessed -- see reports/phase-7d/SOURCE-SELECTION-POLICY.md.
 *
 * authority_level is a controlled vocabulary, not a numeric score:
 *   primary       -- government / public health authority
 *   professional  -- recognized industry standards body (ANSI-accredited)
 *   academic      -- university / extension program
 *   manufacturer  -- equipment/product manufacturer technical guidance
 *   secondary     -- other credible technical source, used only to fill
 *                    a gap no primary/professional source covers
 */
'use strict';

const ACCESSED_DATE = '2026-08-18';

const SOURCES = [
  {
    id: 'cdc-healthy-swimming-home-treatment',
    organization: 'Centers for Disease Control and Prevention (CDC)',
    title: 'Home Pool and Hot Tub Water Treatment and Testing',
    url: 'https://www.cdc.gov/healthy-swimming/about/home-pool-and-hot-tub-water-treatment-and-testing.html',
    source_type: 'government_public_health',
    authority_level: 'primary',
    publication_date: null,
    last_updated: null,
    accessed_date: ACCESSED_DATE,
    topics: ['free_chlorine', 'ph', 'residential_pools', 'hot_tubs'],
    notes: 'States CDC recommends free chlorine of at least 1 ppm in pools and at least 3 ppm in hot tubs (at least 2 ppm in pools if using cyanuric acid / stabilized chlorine products; CDC recommends not using cyanuric acid in hot tubs). States recommended pH range 7.0-7.8 for both pools and hot tubs.',
  },
  {
    id: 'cdc-healthy-swimming-what-you-can-do-hot-tubs',
    organization: 'Centers for Disease Control and Prevention (CDC)',
    title: 'What You Can Do to Stay Healthy in Hot Tubs',
    url: 'https://www.cdc.gov/healthy-swimming/safety/what-you-can-do-to-stay-healthy-in-hot-tubs.html',
    source_type: 'government_public_health',
    authority_level: 'primary',
    publication_date: null,
    last_updated: null,
    accessed_date: ACCESSED_DATE,
    topics: ['hot_tubs', 'bromine', 'free_chlorine', 'ph'],
    notes: 'CDC hot tub safety guidance; referenced for bromine and sanitizer guidance in hot tubs.',
  },
  {
    id: 'cdc-mahc-2023',
    organization: 'Centers for Disease Control and Prevention (CDC) / Council for the Model Aquatic Health Code',
    title: 'Model Aquatic Health Code (MAHC), 4th Edition',
    url: 'https://www.cdc.gov/model-aquatic-health-code/media/pdfs/2023-MAHC-508.pdf',
    source_type: 'government_public_health',
    authority_level: 'primary',
    publication_date: '2023-02',
    last_updated: null,
    accessed_date: ACCESSED_DATE,
    topics: ['free_chlorine', 'combined_chlorine', 'cyanuric_acid', 'shock_treatment', 'crypto_response'],
    notes: 'National voluntary guidance for public aquatic facilities. States FAC (free available chlorine) 1.0-3.0 ppm for traditional chlorinated pools, 2.0-4.0 ppm for pools using cyanuric acid; minimum 1.0 ppm FAC without CYA, minimum 2.0 ppm FAC with CYA. States a public-pool maximum CYA guidance of 15 ppm specifically in the context of contamination/outbreak response (not a general residential-pool operating ceiling). Fecal/diarrheal-incident response: raise free chlorine to 20 ppm for approximately 13 hours (general fecal incident) or, when CYA has been reduced to <=15 ppm, maintain 20 ppm FC for ~28 hours at pH <=7.5 for Cryptosporidium inactivation.',
  },
  {
    id: 'cdc-mmwr-pool-chemical-injuries',
    organization: 'Centers for Disease Control and Prevention (CDC) — Morbidity and Mortality Weekly Report (MMWR)',
    title: 'Pool Chemical–Associated Health Events in Public and Residential Settings',
    url: 'https://www.cdc.gov/mmwr/volumes/68/wr/mm6819a2.htm',
    source_type: 'government_public_health',
    authority_level: 'primary',
    publication_date: null,
    last_updated: null,
    accessed_date: ACCESSED_DATE,
    topics: ['chemical_safety', 'mixing_hazards'],
    notes: 'CDC surveillance report on pool-chemical-related injuries; supports safety guidance on chemical mixing/handling hazards.',
  },
  {
    id: 'cdc-pool-chemical-safety-toolkit',
    organization: 'Centers for Disease Control and Prevention (CDC)',
    title: 'Pool Chemical Safety',
    url: 'https://www.cdc.gov/healthy-swimming/toolkit/pool-chemical-safety.html',
    source_type: 'government_public_health',
    authority_level: 'primary',
    publication_date: null,
    last_updated: null,
    accessed_date: ACCESSED_DATE,
    topics: ['chemical_safety', 'mixing_hazards', 'storage'],
    notes: 'CDC toolkit resource on safe handling and storage of pool chemicals, including never mixing chlorine with acid.',
  },
  {
    id: 'npic-pool-spa-chemicals-fact-sheet',
    organization: 'National Pesticide Information Center (NPIC), Oregon State University Extension Services / U.S. EPA cooperative agreement',
    title: 'Pool and Spa Chemicals Fact Sheet',
    url: 'https://npic.orst.edu/factsheets/pool-chemicals.html',
    source_type: 'academic_extension',
    authority_level: 'academic',
    publication_date: '2024-01',
    last_updated: null,
    accessed_date: ACCESSED_DATE,
    topics: ['chemical_safety', 'mixing_hazards', 'chlorine_gas', 'chloramines', 'storage'],
    notes: 'University-extension fact sheet (co-sponsored by EPA) on pool/spa chemical hazards: never mix products with acids or other pool chemicals unless the label directs it; chlorine gas and chloramine inhalation hazards; storage guidance to keep products sealed, separated, and in original containers.',
  },
  {
    id: 'ansi-phta-11-2019',
    organization: 'Pool & Hot Tub Alliance (PHTA), ANSI-Accredited Standards Developer',
    title: 'ANSI/APSP/ICC-11 2019: American National Standard for Water Quality in Public Pools and Spas',
    url: 'https://blog.ansi.org/ansi/ansi-apsp-11-water-quality-in-public-pools-and-spas/',
    source_type: 'industry_standard',
    authority_level: 'professional',
    publication_date: '2019',
    last_updated: null,
    accessed_date: ACCESSED_DATE,
    topics: ['total_alkalinity', 'calcium_hardness'],
    notes: 'ANSI-accredited national standard for public pool/spa water quality. States total alkalinity shall be maintained between 60-180 ppm as CaCO3, and calcium hardness between 150-1,000 ppm, for public pools. A newer edition (ANSI/PHTA/ICC-11 2026) is referenced in PHTA materials as in progress/public review; this record cites the 2019 edition actually retrieved. Public-pool standard ranges are wider than commonly-cited residential practical targets -- see chemistry-ranges.js for the distinction.',
  },
  {
    id: 'phta-total-alkalinity-fact-sheet',
    organization: 'Pool & Hot Tub Alliance (PHTA)',
    title: 'Total Alkalinity in Pool and Spa Water (PHTA Fact Sheet)',
    url: 'https://www.phta.org/pub/?id=25a114b4-1866-daac-99fb-277001b3c020',
    source_type: 'industry_standard',
    authority_level: 'professional',
    publication_date: null,
    last_updated: null,
    accessed_date: ACCESSED_DATE,
    topics: ['total_alkalinity', 'ph_buffering'],
    notes: 'PHTA technical fact sheet explaining total alkalinity as a pH buffer; below ~60 ppm pH can "bounce" (swing rapidly), above ~180 ppm pH becomes difficult to lower.',
  },
  {
    id: 'clevelandclinic-pool-chemical-safety',
    organization: 'Cleveland Clinic',
    title: 'Pool Chemical Safety Tips',
    url: 'https://health.clevelandclinic.org/swimming-pool-chemical-safety',
    source_type: 'medical_institution',
    authority_level: 'secondary',
    publication_date: null,
    last_updated: null,
    accessed_date: ACCESSED_DATE,
    topics: ['chemical_safety', 'mixing_hazards'],
    notes: 'Secondary source (non-governmental medical institution) used only to corroborate CPSC/CDC/NPIC chemical-mixing safety guidance, not as a standalone basis for any numeric range.',
  },
  {
    // Phase 7K: resolves the trichlor/calcium-hypochlorite mixing-hazard
    // claim left REQUIRES_REVIEW in Phase 7J. Fetched and read directly
    // (not summarized) -- Section 10 "Incompatible Materials" explicitly
    // names "calcium hypochlorite" (not a generic "other pool chemicals"
    // statement); the same document's EPA pesticide-label section (Sec.
    // 15) explicitly states contamination/mixing with incompatible
    // chemicals "may cause a violent reaction leading to fire or
    // explosion." Both the specific incompatible-material naming and the
    // fire/explosion consequence come from this one document.
    id: 'microphor-trichlor-sds-2016',
    organization: 'Allchem Performance Products, Inc. (manufacturer); distributed by Microphor, A Wabtec Company',
    title: 'Safety Data Sheet — Chlorinating Slugs (Trichloro-s-triazinetrione / TCCA / Trichlor, 98-100%)',
    url: 'https://www.msdsdigital.com/system/files/Material-Safety-Data-Sheet-Trichloroisocyanuric-Acid.pdf',
    source_type: 'manufacturer_sds',
    authority_level: 'manufacturer',
    publication_date: '2015-05-27',
    last_updated: '2016-09-06',
    accessed_date: ACCESSED_DATE,
    topics: ['trichlor', 'calcium_hypochlorite', 'chemical_mixing_hazard', 'fire_explosion_risk'],
    notes: 'Section 10 (Stability and Reactivity), "Incompatible Materials": "Acids, ammonia, bases, floor sweeping compounds, calcium hypochlorite, reducing agents, organic solvents and compounds." Section 15 (EPA pesticide label / Physical and Chemical Hazards): "DO NOT mix with other chemicals... Do not add this product to any dispensing device containing remnants of any other product. Such use may cause a violent reaction leading to fire or explosion. Contamination with moisture, organic matter or other chemicals will start a chemical reaction and generate heat, hazardous gas, possible fire and explosion." Directly supports the site claim (trichlor should not be mixed with calcium hypochlorite -- fire and explosion risk); does not itself establish a numeric range.',
  },
  {
    // Corroborating, reverse-direction source for the same finding: a
    // calcium hypochlorite product's own SDS explicitly names trichlor.
    id: 'asepsis-calhypo-msds-2005',
    organization: 'Asepsis, Inc. (A Chemtura Company)',
    title: 'Material Safety Data Sheet — Calcium Hypochlorite Tablets (67%)',
    url: 'https://www.puraquapools.com/MSDS_Sheets/SANITIZERS/Calcium_hypochlorite.pdf',
    source_type: 'manufacturer_sds',
    authority_level: 'manufacturer',
    publication_date: '2000-09-28',
    last_updated: '2005-10-28',
    accessed_date: ACCESSED_DATE,
    topics: ['calcium_hypochlorite', 'trichlor', 'chemical_mixing_hazard', 'fire_explosion_risk'],
    notes: 'Section 7 (Handling): "Do not use Trichlor-s-triazinetrione (Stabilized Chlorine) tablets or any other chlorinating compound in systems that use this product," in the same handling-precautions paragraph as "Such improper use may cause fire or explosion." Section 10 (Stability and Reactivity): "Keep away from... other swimming pool/spa chemicals in their concentrated forms. Mixing with any of the above materials can initiate a hazardous decomposition." Corroborates microphor-trichlor-sds-2016 from the calcium-hypochlorite side; the fire/explosion statement in this document is attached to the surrounding paragraph rather than the trichlor sentence specifically, so this is used as corroboration, not the primary basis for the claim.',
  },
  {
    // Phase 7K: shock-dosing evidence gap identified in Phase 7J.
    // Professional pool-industry trade publication, sponsored/reviewed
    // content from Taylor Technologies (a real, established water-testing
    // reagent manufacturer, already a named organization entity on this
    // site). Fetched and read directly.
    id: 'poolspanews-algae-breakpoint-2016',
    organization: 'Pool & Spa News (trade publication); content from Taylor Technologies',
    title: 'Have Algae? Confused about How Much Liquid Shock to Use?',
    url: 'https://www.poolspanews.com/how-to/maintenance/have-algae-confused-about-how-much-liquid-shock-to-use',
    source_type: 'professional_trade_publication',
    authority_level: 'professional',
    publication_date: '2016-10-31',
    last_updated: null,
    accessed_date: ACCESSED_DATE,
    topics: ['shock_treatment', 'algae', 'breakpoint_chlorination'],
    notes: 'States: "To eliminate a green algae bloom, the recommendation is to breakpoint chlorinate to 30 ppm... that is the minimum amount needed to break into the nucleus of the algae cell and disrupt its DNA structure." Also states routine "shocking is the simple addition of a few parts per million (usually 2-5 ppm)" for general water cleanup -- a materially different, lower figure than the site prior 10 ppm routine-maintenance claim. Does not differentiate dosing by algae severity (light/dark green/black) despite discussing green algae specifically. Single professional-trade-publication source, not a government/professional-standards-body source -- used at CONTEXTUAL confidence, not SUPPORTED.',
  },
  {
    id: 'aquamagazine-hasa-superchlorination-2020',
    organization: 'AQUA Magazine (trade publication); author Terry Arko, syndicated by HASA (manufacturer)',
    title: 'Shock: Oxidation, Superchlorination, Hyperchlorination and Breakpoint Chlorination',
    url: 'https://hasa.com/blog/shock-oxidation-superchlorination-hyperchlorination-and-breakpoint-chlorination',
    source_type: 'professional_trade_publication',
    authority_level: 'professional',
    publication_date: '2020-09-04',
    last_updated: null,
    accessed_date: ACCESSED_DATE,
    topics: ['shock_treatment', 'superchlorination', 'hyperchlorination', 'algae'],
    notes: 'States superchlorination (routine maintenance / after heavy swim load, storms, early algae) raises free chlorine to 10-20 ppm -- does not separately distinguish a routine-maintenance figure from an algae-specific figure the way the site prior content did (10 ppm vs 30 ppm); treats both under one 10-20 ppm superchlorination range. Also describes CDC-aligned hyperchlorination for contamination (20 ppm/28hr, 30 ppm/18hr, or 40 ppm/8.5hr), corroborating the existing range-shock-cdc-fecal-incident-response record general shape without being identical in figures -- used only as corroboration for the incident-response scenario, not as the basis for a new range there. Single professional-trade-publication source -- used at CONTEXTUAL confidence.',
  },
  {
    // Phase 7K, Step 9: material-specific source hierarchy -- a vinyl-
    // liner-industry technical association, not a generic pool-chemistry
    // article, used to evaluate the vinyl-pool entity's liner-bleaching
    // material claim. Fetched and read directly.
    id: 'cffa-vinyl-liner-bleaching',
    organization: 'Coated Fabrics and Film Association (CFFA), Vinyl Pool Liners division',
    title: 'Tips on Avoiding Vinyl Liner Bleaching by Chlorine',
    url: 'https://www.cffaperformanceproducts.org/content/pdfs/TipsOnAvoidingVinylLinerBleachingByChlorine.pdf',
    source_type: 'material_industry_association',
    authority_level: 'professional',
    publication_date: null,
    last_updated: null,
    accessed_date: ACCESSED_DATE,
    topics: ['vinyl_liner', 'material_property', 'bleaching', 'trichlor'],
    notes: 'Directly and specifically supports the vinyl-pool entity\'s liner-bleaching claim: "Tri-chlor is highly acidic and slow to dissolve, and if it sits directly on a pool liner, it may cause spot bleaching in as few as 6 hours," and lists "Shock product hasn\'t been pre dissolved prior to introduction to the pool" as a specific named cause. A genuine material-science/vinyl-liner-industry source (CFFA\'s own vinyl-pool-liner technical division), not a generic pool-chemistry article misapplied to a material claim, per Step 9.',
  },
  {
    // Phase 7K: resolves the entities/temperature.html HIGH-priority safety
    // claim (104 F hot-tub maximum) -- a genuine chemistry-ranges.js gap
    // (no water_temperature record existed at all before this phase).
    // Distinct edition/document from the existing cdc-mahc-2023 (4th
    // Edition, CDC.gov PDF) -- this is the 5th Edition, fetched directly
    // from the Council for the Model Aquatic Health Code's own site.
    id: 'cmahc-mahc-5th-edition-2024',
    organization: 'Council for the Model Aquatic Health Code (CMAHC)',
    title: 'Model Aquatic Health Code (MAHC), 5th Edition, Section 5.7.4.7.2 (Maximum Temperature)',
    url: 'https://cmahc.org/mahc_sections/1837',
    source_type: 'government_public_health',
    authority_level: 'primary',
    publication_date: null,
    last_updated: null,
    accessed_date: ACCESSED_DATE,
    topics: ['water_temperature', 'hot_tub', 'safety'],
    notes: 'Section 5.7.4.7.2: "The maximum temperature for an AQUATIC VENUE is 104 F (40C)." Document identifies itself as the 5th Edition (year 2024 per the page), but no exact publication day/month was shown -- publication_date left null rather than guessed, per this project\'s established policy of not inventing dates.',
  },
  {
    // Phase 7P: supports the new academy/fundamentals/new-pool-startup-chemistry
    // page (fresh-fill / newly-plastered pool startup sequence) -- fetched
    // and read in full (not a search-snippet paraphrase) on 2026-08-28.
    id: 'phta-fresh-fill-startup-fact-sheet',
    organization: 'Pool & Hot Tub Alliance (PHTA), Recreational Water Quality Committee',
    title: 'Fresh Fill Water Start-Up for Plastered Pools (PHTA Fact Sheet)',
    url: 'https://www.phta.org/pub/?id=33925d23-1866-daac-99fb-dbf23704fd63',
    source_type: 'industry_standard',
    authority_level: 'professional',
    publication_date: '2021-03',
    last_updated: null,
    accessed_date: '2026-08-28',
    topics: ['ph', 'total_alkalinity', 'calcium_hardness', 'cyanuric_acid', 'chlorine', 'new_plaster_startup'],
    notes: 'PHTA fact sheet presenting the National Plasterers Council (NPC) 28-day fresh-fill start-up procedure for plaster (marble/quartz/pebble/glassbead) pools: staged alkalinity (80-100 ppm) then pH (7.2-7.6) then calcium hardness (80-100 ppm Day 1, 100-150 ppm Day 2, minimum 200 ppm Day 4); no chlorine for 48 hours, then Free Chlorine to 1.5-3 ppm on Day 3; CYA introduced 30-50 ppm beginning Day 4 via skimmer over a minimum of 3 days; no salt addition within 30 days for SWG pools; no heater until manufacturer-specified (normally 2-4 weeks); brushing at least twice daily until plaster dust is removed. Explicitly distinct from routine seasonal reopening of an already-cured pool.',
  },
  {
    // Phase 7Q: supports entities/water-replacement.html (Priority A light
    // expansion). Fetched and read in full (all 6 pages) on 2026-08-28 --
    // not a search-snippet paraphrase. Only cited for what it specifically
    // states -- see the entities/water-replacement ENTITY_CITATIONS note in
    // generate-entity-pages.js for exactly which figures this does and does
    // not cover.
    id: 'phta-water-conservation-droughts-2021',
    organization: 'Pool & Hot Tub Alliance (PHTA), Recreational Water Quality Committee',
    title: 'Water Conservation During Droughts (PHTA Fact Sheet)',
    url: 'https://www.phta.org/pub/?id=50ffe77d-1866-daac-99fb-9719108d1367',
    source_type: 'industry_standard',
    authority_level: 'professional',
    publication_date: '2021-12',
    last_updated: null,
    accessed_date: '2026-08-28',
    topics: ['total_dissolved_solids', 'cyanuric_acid', 'calcium_hardness', 'water_replacement'],
    notes: 'States "the 1,500 ppm TDS increase limit" as the recognized water-replacement trigger (matches this site\'s existing hot-tub TDS-over-baseline figure exactly). States high cyanuric acid concentrations should be reduced by draining and replacing water, and cites the ANSI/APSP-11 standard\'s 100 ppm CYA maximum (30-50 ppm ideal) -- narrower than but not contradicting the site\'s existing "CYA above 80 ppm" residential drain-trigger figure, which this source does not itself state and is NOT treated as confirmed by this citation. Does not address a specific pool (non-drought) absolute TDS ppm trigger or a specific calcium-hardness ppm drain trigger -- those figures remain uncited.',
  },
  {
    // Phase 7Q Priority E/F: fetched while checking whether new evidence
    // resolves the routine-maintenance shock dosing disagreement. It does
    // NOT -- this fact sheet explicitly defers shock/superchlorination
    // dosage to individual product labels rather than giving a number, so
    // the routine-shock REQUIRES_REVIEW status is correctly preserved (see
    // RESEARCH.md). It DOES support a genuine, previously-uncited claim on
    // entities/calcium-hypochlorite.html -- read in full on 2026-08-28.
    id: 'phta-calcium-hypochlorite-fact-sheet-2021',
    organization: 'Pool & Hot Tub Alliance (PHTA), Recreational Water Quality Committee',
    title: 'Calcium Hypochlorite (PHTA Fact Sheet)',
    url: 'https://www.phta.org/pub/?id=07FD3498-1866-DAAC-99FB-8824A8F3147B',
    source_type: 'industry_standard',
    authority_level: 'professional',
    publication_date: '2021-08',
    last_updated: null,
    accessed_date: '2026-08-28',
    topics: ['chlorine', 'calcium_hardness', 'chemical_mixing_safety'],
    notes: 'States "0.8 ppm of calcium hardness is added to the water for each ppm of available chlorine added" when using calcium hypochlorite -- directly supports and quantifies this site\'s existing "it does add calcium" claim. Also states routine sanitizing FAC target of 1.0-4.0 ppm (pools) / 2.0-5.0 ppm (spas) when using this product specifically, and that calcium hypochlorite "shall not be mixed with other pool chemicals including other chlorinating agents" (corroborates, from an independent industry-standard source, the trichlor/cal-hypo mixing hazard already cited via manufacturer SDS documents). Explicitly defers shock-treatment/superchlorination dosage to product labels rather than stating a ppm figure -- does NOT resolve the routine-maintenance shock disagreement.',
  },
  {
    // Phase 7R Priority A: a genuine government/public-health-authority
    // source (state health department), the highest tier in this
    // project's evidence hierarchy, found while re-investigating the
    // routine-shock disagreement. Fetched as a PDF and read in full (all
    // 12 pages) on 2026-08-28. Does NOT resolve the 2-5ppm-vs-10-20ppm
    // general residential shock disagreement (it states no general
    // absolute ppm target at all) -- but it DOES directly and almost
    // verbatim confirm the site's separately-modeled breakpoint-rule-of-
    // thumb claim (10x combined chlorine), which had been REQUIRES_REVIEW
    // with zero source_ids since Phase 7E.
    id: 'in-doh-breakpoint-chlorination-2022',
    organization: 'Indiana Department of Health, Environmental Public Health Division',
    title: 'How To Shock The Pool (Chlorinate To Breakpoint)',
    url: 'https://www.in.gov/health/eph/files/How-To-Shock-The-Pool-2022.pdf',
    source_type: 'government_public_health',
    authority_level: 'primary',
    publication_date: '2022',
    last_updated: null,
    accessed_date: '2026-08-28',
    topics: ['shock_treatment', 'breakpoint_chlorination', 'combined_chlorine'],
    notes: 'States: "The breakpoint chlorination value is 10 times the combined chlorine (CC) level." Gives full worked calculations (liquid and granular chlorine) all built on this same 10x ratio, consistent throughout the document. Explicitly a ratio/rule, not an absolute ppm target -- confirms the site\'s existing range-shock-breakpoint-rule-of-thumb architecture (minimum/maximum/target all null, unit "multiplier_of_combined_chlorine") was modeled correctly. Document is written for regulated/public pool operations (cites Indiana pool code 410 IAC 6-2.1 throughout) but the underlying chemistry (chlorine-to-ammonia reaction stoichiometry) is general, not facility-type-specific. Does NOT state a general residential "shock to N ppm" absolute target -- the routine-maintenance 2-5ppm-vs-10-20ppm disagreement remains unresolved by this source.',
  },
];

const SOURCES_BY_ID = Object.fromEntries(SOURCES.map((s) => [s.id, s]));

module.exports = { SOURCES, SOURCES_BY_ID, ACCESSED_DATE };
