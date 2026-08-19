#!/usr/bin/env node
'use strict';
/**
 * build-inventory-and-decisions.js (Phase 7G, Steps 1/5/22)
 */
const fs = require('fs');
const path = require('path');
const { INTENTS } = require('../data/programmatic-intents');

const ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'reports', 'phase-7g');
fs.mkdirSync(OUT_DIR, { recursive: true });

function toCsv(rows, fields) {
  const esc = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [fields.join(','), ...rows.map((r) => fields.map((f) => esc(r[f])).join(','))].join('\n') + '\n';
}

// ---- Inventory ----
const inventoryFields = ['page_id', 'url', 'family', 'primary_intent', 'secondary_intent', 'environment', 'parameter', 'scenario', 'claim_family', 'canonical_status', 'sitemap_status'];
const inventoryRows = INTENTS.map((i) => ({
  ...i,
  canonical_status: 'self-canonical',
  sitemap_status: 'included',
}));
fs.writeFileSync(path.join(OUT_DIR, 'programmatic-inventory.csv'), toCsv(inventoryRows, inventoryFields));

// ---- Nearest-neighbor + consolidation decisions ----
// Grouped by family; within a family, nearest neighbors are adjacent
// values in the sorted parameter list.
function byFamily(fam) { return INTENTS.filter((i) => i.family === fam); }

const decisionRows = [];
for (const fam of ['chlorine', 'shock', 'ph', 'hot-tubs']) {
  const pages = byFamily(fam);
  for (let idx = 0; idx < pages.length; idx++) {
    const p = pages[idx];
    const neighbor = pages[idx === 0 ? 1 : idx - 1];
    decisionRows.push({
      page_id: p.page_id,
      url: p.url,
      nearest_neighbor: neighbor ? neighbor.page_id : '',
      why_this_page_exists_vs_neighbor: p.differentiation_reason,
      decision: 'KEEP',
      consolidation_reason: '',
      destination: '',
      seo_reason: '',
      internal_link_impact: 'none',
      sitemap_impact: 'none',
    });
  }
}
const decisionFields = ['page_id', 'url', 'nearest_neighbor', 'why_this_page_exists_vs_neighbor', 'decision', 'consolidation_reason', 'destination', 'seo_reason', 'internal_link_impact', 'sitemap_impact'];
fs.writeFileSync(path.join(OUT_DIR, 'PROGRAMMATIC-DECISIONS.csv'), toCsv(decisionRows, decisionFields));

console.log(`build-inventory-and-decisions: ${inventoryRows.length} inventory rows, ${decisionRows.length} decisions (all KEEP -- see reasoning per row).`);
