#!/usr/bin/env node
'use strict';
/**
 * build-serp-consistency.js (Phase 7N, Step 15)
 * For every calculator, chart, and cornerstone guide/academy page, compare
 * title / H1 / meta description / canonical / schema name for semantic
 * contradictions.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

function toCsv(rows, header) {
  return [header.join(',')].concat(
    rows.map((r) => header.map((h) => '"' + String(r[h] == null ? '' : r[h]).replace(/"/g, '""') + '"').join(','))
  ).join('\n') + '\n';
}

const TARGETS = [
  'calculators/pool-chlorine-calculator.html', 'calculators/hot-tub-chlorine-calculator.html',
  'calculators/pool-ph-calculator.html', 'calculators/hot-tub-ph-calculator.html',
  'calculators/pool-shock-calculator.html', 'calculators/hot-tub-shock-calculator.html',
  'calculators/chemical-calculator.html', 'calculators/pool-volume-calculator.html',
  'calculators/pool-alkalinity-calculator.html', 'calculators/pool-cyanuric-acid-calculator.html',
  'calculators/saltwater-pool-salt-calculator.html', 'calculators/pool-turnover-rate-calculator.html',
  'calculators/spa-volume-calculator.html',
  'pool-chemical-levels-chart.html', 'pool-chlorine-levels-chart.html', 'pool-ph-levels-chart.html',
  'hot-tub-chemical-levels-chart.html', 'pool-cya-levels-chart.html', 'pool-alkalinity-levels-chart.html',
  'hot-tub-chlorine-levels-chart.html', 'salt-water-pool-chemical-levels-chart.html',
  'academy/fundamentals/indoor-pool-chemistry.html', 'academy/hot-tubs/winter-spa-care.html',
  'academy/water-balance/understanding-lsi.html', 'academy/fundamentals/how-temperature-changes-water-chemistry.html',
  'guides/edge-cases/evaporation-effect-on-pool-chemistry.html', 'guides/edge-cases/rain-effect-on-pool-chemistry.html',
  'guides/chlorine-guide.html', 'guides/ph-guide.html',
];

const rows = [];
for (const rel of TARGETS) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) { rows.push({ url: rel, title: 'MISSING FILE', h1: '', meta_description: '', canonical: '', schema_name: '', consistent: 'FILE_NOT_FOUND', notes: '' }); continue; }
  const html = fs.readFileSync(p, 'utf8');
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '';
  const desc = (html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1] || '';
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/i) || [])[1] || '';
  const schemaNameMatch = html.match(/"name"\s*:\s*"([^"]+)"/);
  const schemaName = schemaNameMatch ? schemaNameMatch[1] : '';

  const titleWords = title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3);
  const h1Clean = h1.replace(/<[^>]+>/g, '').toLowerCase();
  const h1Words = h1Clean.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3);
  const overlap = titleWords.filter((w) => h1Words.includes(w)).length;
  const overlapRatio = titleWords.length ? overlap / titleWords.length : 0;

  let consistent = 'CONSISTENT';
  const notes = [];
  if (overlapRatio < 0.3) { consistent = 'REVIEW'; notes.push(`low title/H1 word overlap (${(overlapRatio * 100).toFixed(0)}%)`); }
  if (!canonical) { consistent = 'REVIEW'; notes.push('missing canonical'); }
  else if (!canonical.endsWith(rel.replace(/index\.html$/, '').replace(/\.html$/, '')) && !canonical.includes(path.basename(rel, '.html'))) {
    notes.push('canonical basename does not obviously match file (manual check advised)');
  }
  if (!desc) { consistent = 'REVIEW'; notes.push('missing meta description'); }

  rows.push({
    url: rel, title: title.slice(0, 80), h1: h1Clean.slice(0, 80), meta_description: desc.slice(0, 80),
    canonical, schema_name: schemaName, consistent, notes: notes.join('; ') || 'none',
  });
}

const header = ['url', 'title', 'h1', 'meta_description', 'canonical', 'schema_name', 'consistent', 'notes'];
fs.writeFileSync(path.join(ROOT, 'reports', 'phase-7n', 'SERP-SEMANTIC-CONSISTENCY.csv'), toCsv(rows, header));
const reviewCount = rows.filter((r) => r.consistent === 'REVIEW').length;
console.log(`build-serp-consistency: ${rows.length} pages checked, ${reviewCount} flagged for review`);
