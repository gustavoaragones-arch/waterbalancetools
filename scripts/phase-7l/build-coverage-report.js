#!/usr/bin/env node
'use strict';
/**
 * build-coverage-report.js (Phase 7L, Step 20)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

function countCitations(file) {
  if (!fs.existsSync(path.join(ROOT, file))) return { blocks: 0, links: 0 };
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const blocks = [...html.matchAll(/<section class="knowledge-sources-real">[\s\S]*?<\/section>/g)];
  const links = blocks.reduce((n, b) => n + (b[0].match(/knowledge-source-item/g) || []).length, 0);
  return { blocks: blocks.length, links };
}

const rows = [
  { url: '/entities/trichlor-tablets.html', page_type: 'entity', tier: 'TIER_1', eligible_claims: 1, supported_claims: 1, cited_claims: 1, uncited_supported_claims: 0, reason: 'Trichlor + calcium hypochlorite mixing hazard, fully cited' },
  { url: '/entities/green-water.html', page_type: 'entity', tier: 'TIER_1', eligible_claims: 1, supported_claims: 1, cited_claims: 1, uncited_supported_claims: 0, reason: 'Green algae 30ppm shock figure, fully cited' },
  { url: '/entities/temperature.html', page_type: 'entity', tier: 'TIER_1', eligible_claims: 1, supported_claims: 1, cited_claims: 1, uncited_supported_claims: 0, reason: 'Hot tub 104F max safety figure, fully cited' },
  { url: '/entities/shock-treatment.html', page_type: 'entity', tier: 'TIER_1', eligible_claims: 1, supported_claims: 1, cited_claims: 1, uncited_supported_claims: 2, reason: 'Algae-recovery figure cited with scoping note; routine-maintenance (10ppm) and breakpoint-rule (10x CC) figures in same paragraph remain uncited -- REQUIRES_REVIEW' },
  { url: '/entities/vinyl-pool.html', page_type: 'entity', tier: 'TIER_1', eligible_claims: 1, supported_claims: 1, cited_claims: 1, uncited_supported_claims: 0, reason: 'Material claim (liner bleaching), fully cited' },
  { url: '/calculators/pool-chlorine-calculator.html', page_type: 'calculator', tier: 'TIER_1', eligible_claims: 1, supported_claims: 1, cited_claims: 1, uncited_supported_claims: 0, reason: 'Pre-existing (Phase 7E), reconfirmed' },
  { url: '/calculators/hot-tub-chlorine-calculator.html', page_type: 'calculator', tier: 'TIER_1', eligible_claims: 1, supported_claims: 1, cited_claims: 1, uncited_supported_claims: 0, reason: 'Pre-existing (Phase 7E), reconfirmed' },
  { url: '/calculators/pool-ph-calculator.html', page_type: 'calculator', tier: 'TIER_1', eligible_claims: 1, supported_claims: 1, cited_claims: 1, uncited_supported_claims: 0, reason: 'Gap closed this phase (found citable in 7E, never rendered)' },
  { url: '/calculators/chemical-calculator.html', page_type: 'calculator', tier: 'TIER_1', eligible_claims: 6, supported_claims: 4, cited_claims: 4, uncited_supported_claims: 0, reason: 'pH/FC/TA/CH cited; CYA/salt target ranges and all dosing constants remain unsupported, explicitly disclosed in the rendered note' },
  { url: '/calculators/pool-shock-calculator.html', page_type: 'calculator', tier: 'NOT_ELIGIBLE', eligible_claims: 0, supported_claims: 0, cited_claims: 0, uncited_supported_claims: 0, reason: 'CALCULATOR_REVIEW_REQUIRED, no confirmed source for breakpoint rule-of-thumb' },
  { url: '/pool-alkalinity-levels-chart.html', page_type: 'authority_chart', tier: 'TIER_1', eligible_claims: 1, supported_claims: 1, cited_claims: 1, uncited_supported_claims: 0, reason: 'Pre-existing (Phase 7E), reconfirmed' },
  { url: '/hot-tub-chlorine-levels-chart.html', page_type: 'authority_chart', tier: 'TIER_1', eligible_claims: 1, supported_claims: 1, cited_claims: 1, uncited_supported_claims: 0, reason: 'Pre-existing (Phase 7E), reconfirmed' },
  { url: '/pool-chlorine-levels-chart.html', page_type: 'authority_chart', tier: 'TIER_1', eligible_claims: 1, supported_claims: 1, cited_claims: 1, uncited_supported_claims: 0, reason: 'Row corrected (20ppm->30ppm, Step 16 sync) and cited this phase' },
  { url: '/pool-cya-levels-chart.html', page_type: 'authority_chart', tier: 'NOT_ELIGIBLE', eligible_claims: 0, supported_claims: 0, cited_claims: 0, uncited_supported_claims: 0, reason: 'Ideal-range row has no confirmed source (REQUIRES_REVIEW)' },
  { url: '/hot-tub-chemical-levels-chart.html', page_type: 'authority_chart', tier: 'TIER_2', eligible_claims: 6, supported_claims: 2, cited_claims: 0, uncited_supported_claims: 2, reason: 'FC and CYA rows are supported but the single-citation-block-per-page architecture cannot express row-level support without a content restructure -- not cited this phase, flagged to review queue' },
  { url: '/salt-water-pool-chemical-levels-chart.html', page_type: 'authority_chart', tier: 'TIER_2', eligible_claims: 7, supported_claims: 2, cited_claims: 0, uncited_supported_claims: 2, reason: 'TA and CH rows are supported but mixed with unsupported/mismatched rows on the same page -- not cited this phase, flagged to review queue' },
];
for (const g of [5000, 10000, 15000, 20000, 25000, 30000]) {
  rows.push({ url: `/programmatic/shock/how-much-shock-for-${g}-gallon-pool.html`, page_type: 'programmatic', tier: 'TIER_1', eligible_claims: 1, supported_claims: 1, cited_claims: 1, uncited_supported_claims: 0, reason: 'Green-algae-recovery row cited at generator level' });
}

for (const r of rows) {
  const c = countCitations(r.url.replace(/^\//, ''));
  r.citation_count = c.links;
  r.source_count = c.links; // 1:1 in this implementation, no page reuses a source more than once within its own block
}

const header = ['url', 'page_type', 'tier', 'eligible_claims', 'supported_claims', 'cited_claims', 'citation_count', 'source_count', 'uncited_supported_claims', 'reason'];
const csv = [header.join(',')].concat(
  rows.map((r) => header.map((h) => '"' + String(r[h]).replace(/"/g, '""') + '"').join(','))
).join('\n') + '\n';

fs.writeFileSync(path.join(ROOT, 'reports', 'phase-7l', 'CITATION-COVERAGE.csv'), csv);
console.log(`build-coverage-report: ${rows.length} rows written`);
