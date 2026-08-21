#!/usr/bin/env node
'use strict';
/**
 * build-eligibility-queue.js (Phase 7L, Step 2)
 *
 * Hand-curated eligibility queue reflecting the actual audit performed
 * this phase: every canonical chemistry-claims.js record, cross-referenced
 * against the pages that state it, plus the entity/calculator/chart/
 * programmatic candidates individually reviewed. This is not a mechanical
 * page crawl -- each row reflects a real decision made in this phase
 * (cited, eligible-but-not-cited, or not-eligible-with-a-reason).
 */
const fs = require('fs');
const path = require('path');
const { CLAIMS } = require('../data/chemistry-claims');

const ROOT = path.join(__dirname, '..', '..');

const rows = [];
function add(r) { rows.push(r); }

// ── Canonical claims already rendered pre-Phase-7L (unchanged this phase) ──
add({ url: '/calculators/pool-chlorine-calculator.html', page_type: 'calculator', claim_id: 'claim-fc-pool-no-cya', claim_text: 'Pool free chlorine target range', claim_family: 'sanitizer_level', source_registry_id: 'cdc-healthy-swimming-home-treatment;cdc-mahc-2023', source_scope: 'target_range', source_verified: 'yes', citation_eligible: 'yes', citation_priority: 'TIER_1', reason: 'Already cited (Phase 7E), reconfirmed this phase' });
add({ url: '/calculators/hot-tub-chlorine-calculator.html', page_type: 'calculator', claim_id: 'claim-fc-hottub-routine', claim_text: 'Hot tub free chlorine target range', claim_family: 'sanitizer_level', source_registry_id: 'cdc-healthy-swimming-home-treatment', source_scope: 'target_range', source_verified: 'yes', citation_eligible: 'yes', citation_priority: 'TIER_1', reason: 'Already cited (Phase 7E), reconfirmed this phase' });
add({ url: '/pool-alkalinity-levels-chart.html', page_type: 'authority_chart', claim_id: 'claim-ta-target', claim_text: 'Total alkalinity 80-120 ppm row', claim_family: 'alkalinity_target', source_registry_id: 'phta-total-alkalinity-fact-sheet', source_scope: 'single_row', source_verified: 'yes', citation_eligible: 'yes', citation_priority: 'TIER_1', reason: 'Already cited (Phase 7E), reconfirmed this phase' });
add({ url: '/hot-tub-chlorine-levels-chart.html', page_type: 'authority_chart', claim_id: 'claim-fc-hottub-routine', claim_text: 'Hot tub free chlorine row', claim_family: 'sanitizer_level', source_registry_id: 'cdc-healthy-swimming-home-treatment', source_scope: 'single_row', source_verified: 'yes', citation_eligible: 'yes', citation_priority: 'TIER_1', reason: 'Already cited (Phase 7E), reconfirmed this phase' });

// ── New this phase: entity pages ──
add({ url: '/entities/trichlor-tablets.html', page_type: 'entity', claim_id: 'claim-trichlor-calhypo-mixing-hazard', claim_text: 'Should not be mixed with calcium hypochlorite -- fire and explosion risk.', claim_family: 'chemical_mixing_safety', source_registry_id: 'microphor-trichlor-sds-2016;asepsis-calhypo-msds-2005', source_scope: 'exact_claim', source_verified: 'yes', citation_eligible: 'yes', citation_priority: 'TIER_1', reason: 'RENDERED this phase -- two manufacturer SDS documents directly support the exact claim' });
add({ url: '/entities/green-water.html', page_type: 'entity', claim_id: 'claim-shock-algae-recovery-green', claim_text: 'shocking to 30 ppm FC', claim_family: 'algae_treatment', source_registry_id: 'poolspanews-algae-breakpoint-2016', source_scope: 'exact_claim', source_verified: 'yes', citation_eligible: 'yes', citation_priority: 'TIER_1', reason: 'RENDERED this phase' });
add({ url: '/entities/temperature.html', page_type: 'entity', claim_id: 'claim-temperature-hottub-safety-max', claim_text: 'temperatures above 104°F can cause hyperthermia', claim_family: 'water_temperature_safety', source_registry_id: 'cmahc-mahc-5th-edition-2024', source_scope: 'exact_claim', source_verified: 'yes', citation_eligible: 'yes', citation_priority: 'TIER_1', reason: 'RENDERED this phase' });
add({ url: '/entities/shock-treatment.html', page_type: 'entity', claim_id: 'claim-shock-algae-recovery-green', claim_text: '30 ppm for algae recovery', claim_family: 'algae_treatment', source_registry_id: 'poolspanews-algae-breakpoint-2016', source_scope: 'partial_paragraph', source_verified: 'yes', citation_eligible: 'yes', citation_priority: 'TIER_1', reason: 'RENDERED this phase with an explicit scoping note -- the 10ppm/breakpoint-rule figures in the same paragraph are NOT covered and remain uncited' });
add({ url: '/entities/vinyl-pool.html', page_type: 'entity', claim_id: '(material claim, no chemistry-claims.js parameter fit)', claim_text: 'Vinyl liners can be bleached by direct contact with undissolved granular chemicals', claim_family: 'material_property', source_registry_id: 'cffa-vinyl-liner-bleaching', source_scope: 'exact_claim', source_verified: 'yes', citation_eligible: 'yes', citation_priority: 'TIER_1', reason: 'RENDERED this phase -- direct source citation (material claim, bypasses parameter-based claim schema)' });

// ── New this phase: programmatic shock pages (generator-level) ──
for (const g of [5000, 10000, 15000, 20000, 25000, 30000]) {
  add({ url: `/programmatic/shock/how-much-shock-for-${g}-gallon-pool.html`, page_type: 'programmatic', claim_id: 'claim-shock-algae-recovery-green', claim_text: 'Green algae recovery (30 ppm) dosage row', claim_family: 'algae_treatment', source_registry_id: 'poolspanews-algae-breakpoint-2016', source_scope: 'single_row', source_verified: 'yes', citation_eligible: 'yes', citation_priority: 'TIER_1', reason: 'RENDERED this phase at generator level -- same claim family across all 6 volume pages, contextual per Step 7' });
}

// ── New this phase: calculators (gap closed) ──
add({ url: '/calculators/pool-ph-calculator.html', page_type: 'calculator', claim_id: 'claim-ph-pool-routine', claim_text: 'Pool pH target range 7.0-7.8', claim_family: 'ph_target', source_registry_id: 'cdc-healthy-swimming-home-treatment', source_scope: 'target_range', source_verified: 'yes', citation_eligible: 'yes', citation_priority: 'TIER_1', reason: 'RENDERED this phase -- Phase 7E found this citable but never implemented it; gap closed' });
add({ url: '/calculators/chemical-calculator.html', page_type: 'calculator', claim_id: 'claim-ph-pool-routine;claim-fc-pool-no-cya;claim-ta-target;claim-ch-target', claim_text: 'pH/FC/TA/CH target ranges', claim_family: 'multi_parameter_target', source_registry_id: 'cdc-healthy-swimming-home-treatment;cdc-mahc-2023;ansi-phta-11-2019;phta-total-alkalinity-fact-sheet', source_scope: 'target_range_subset', source_verified: 'yes', citation_eligible: 'yes', citation_priority: 'TIER_1', reason: 'RENDERED this phase, note explicitly excludes CYA/salt/dosing constants which remain unsupported' });

// ── New this phase: static chart correction + citation ──
add({ url: '/pool-chlorine-levels-chart.html', page_type: 'authority_chart', claim_id: 'claim-shock-algae-recovery-green', claim_text: 'Green algae recovery row (corrected from an unsourced 20ppm figure)', claim_family: 'algae_treatment', source_registry_id: 'poolspanews-algae-breakpoint-2016', source_scope: 'single_row', source_verified: 'yes', citation_eligible: 'yes', citation_priority: 'TIER_1', reason: 'RENDERED this phase; content corrected to sync with Phase 7K findings (Step 16)' });

// ── Reviewed and deliberately NOT cited ──
add({ url: '/pool-cya-levels-chart.html', page_type: 'authority_chart', claim_id: 'claim-cya-routine-outdoor', claim_text: 'Ideal CYA 30-50 ppm row', claim_family: 'cya_target', source_registry_id: '', source_scope: 'single_row', source_verified: 'no', citation_eligible: 'no', citation_priority: 'NOT_ELIGIBLE', reason: 'range-cya-residential-routine-outdoor has zero source_ids -- REQUIRES_REVIEW, no primary source confirmed' });
add({ url: '/hot-tub-chemical-levels-chart.html', page_type: 'authority_chart', claim_id: '(multiple, mixed status)', claim_text: 'Multi-parameter table: FC/pH/TA/CH/CYA/TDS rows', claim_family: 'multi_parameter', source_registry_id: '', source_scope: 'whole_page', source_verified: 'mixed', citation_eligible: 'no', citation_priority: 'NOT_ELIGIBLE', reason: 'Mixed row support (FC and CYA rows are supported; pH row states a narrower range than the CDC source; CH/TDS rows have no source) -- current single-citation-block-per-page architecture cannot express row-level support without a content restructure, so no chart-level citation added per Step 8 (no blanket "same source supports everything")' });
add({ url: '/salt-water-pool-chemical-levels-chart.html', page_type: 'authority_chart', claim_id: '(multiple, mixed status)', claim_text: 'Multi-parameter table: salt/FC/pH/TA/CYA/CH/TDS rows', claim_family: 'multi_parameter', source_registry_id: '', source_scope: 'whole_page', source_verified: 'mixed', citation_eligible: 'no', citation_priority: 'NOT_ELIGIBLE', reason: 'Mixed row support (TA and CH rows exactly match supported claims; salt row is REQUIRES_REVIEW; pH row narrower than source; possible FC/CYA scenario mismatch not resolved this phase) -- flagged to REVIEW-QUEUE.md rather than cited' });
add({ url: '/calculators/pool-shock-calculator.html', page_type: 'calculator', claim_id: 'claim-shock-breakpoint-rule', claim_text: 'Shock dosing formula/default', claim_family: 'shock_dosing', source_registry_id: '', source_scope: 'formula', source_verified: 'no', citation_eligible: 'no', citation_priority: 'NOT_ELIGIBLE', reason: 'CALCULATOR_REVIEW_REQUIRED (Phase 7E finding, unchanged) -- breakpoint rule-of-thumb has no confirmed source' });
add({ url: '/entities/shock-treatment.html', page_type: 'entity', claim_id: 'claim-shock-breakpoint-rule', claim_text: '10 ppm for maintenance, 10x combined chlorine for breakpoint', claim_family: 'shock_dosing', source_registry_id: '', source_scope: 'exact_claim', source_verified: 'no', citation_eligible: 'no', citation_priority: 'NOT_ELIGIBLE', reason: 'REQUIRES_REVIEW -- genuine 2-5ppm vs 10-20ppm source disagreement documented in Phase 7K, not resolved' });
add({ url: '/entities/unit-fahrenheit.html', page_type: 'entity', claim_id: 'ec-unit-fahrenheit-0369', claim_text: '78-84°F residential / 100-104°F hot tub max', claim_family: 'water_temperature_safety', source_registry_id: '', source_scope: 'category_mismatch', source_verified: 'n/a', citation_eligible: 'no', citation_priority: 'NOT_ELIGIBLE', reason: 'Extracted claim value (78-84) is the pool comfort figure, not the hot-tub 104F max the new source supports -- citing here would misattribute the source to a number it does not verify (Phase 7K near-miss, reconfirmed)' });

// ── Tier 2/3 candidates reviewed, not cited (ordinary/no direct source) ──
add({ url: '/entities/lsi.html', page_type: 'entity', claim_id: 'ec-lsi-0089', claim_text: 'Negative values (below -0.3) indicate corrosive water', claim_family: 'corrosion_mechanism', source_registry_id: '', source_scope: 'n/a', source_verified: 'no', citation_eligible: 'no', citation_priority: 'TIER_3', reason: 'No LSI/corrosion source in registry -- verification debt, not reviewed further this phase per stop-rule' });
add({ url: '/entities/copper.html', page_type: 'entity', claim_id: 'ec-copper-0043', claim_text: 'Copper causes green staining above 0.3 ppm', claim_family: 'metal_staining', source_registry_id: '', source_scope: 'n/a', source_verified: 'no', citation_eligible: 'no', citation_priority: 'TIER_3', reason: 'No metal-staining source in registry' });
add({ url: '/legal/ownership.html', page_type: 'legal', claim_id: '(none)', claim_text: '(non-factual page)', claim_family: 'n/a', source_registry_id: '', source_scope: 'n/a', source_verified: 'n/a', citation_eligible: 'no', citation_priority: 'NOT_ELIGIBLE', reason: 'Legal/navigation page, not a factual chemistry claim page' });

const header = ['url', 'page_type', 'claim_id', 'claim_text', 'claim_family', 'source_registry_id', 'source_scope', 'source_verified', 'citation_eligible', 'citation_priority', 'reason'];
const csv = [header.join(',')].concat(
  rows.map((r) => header.map((h) => '"' + String(r[h] || '').replace(/"/g, '""') + '"').join(','))
).join('\n') + '\n';

fs.mkdirSync(path.join(ROOT, 'reports', 'phase-7l'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'reports', 'phase-7l', 'CITATION-ELIGIBILITY.csv'), csv);
console.log(`build-eligibility-queue: ${rows.length} rows written`);
