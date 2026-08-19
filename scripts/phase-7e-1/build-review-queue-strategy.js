#!/usr/bin/env node
'use strict';
/**
 * build-review-queue-strategy.js (Phase 7E.1, Step 10)
 * Segments the 4,686 UNREVIEWED evidence records into priority buckets
 * A-F using a fixed precedence order (each record lands in exactly one
 * bucket): A (Tier 1 page) > B (source-search candidate) > D (programmatic
 * page) > E (example/calculation) > C (contextual/low-risk, safely
 * unattributed) > F (no numeric content at all).
 */
const fs = require('fs');
const path = require('path');
const { parseCsv } = require('../phase-7d-1/reconcile-claims-v2');

const ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'reports', 'phase-7e-1');

const prov = parseCsv(fs.readFileSync(path.join(ROOT, 'reports', 'phase-7e', 'provenance-mapping.csv'), 'utf8'));
const evidence = parseCsv(fs.readFileSync(path.join(ROOT, 'reports', 'phase-7d-3', 'chemistry-evidence.csv'), 'utf8'));
const evByClaim = new Map(evidence.map((r) => [r.claim_id, r]));

const TIER1 = [/^calculators\//, /levels-chart\.html$/, /^charts\//];
const TIER3 = [/^programmatic\//];

function bucketFor(r, ev) {
  const url = ev.source_url;
  if (TIER1.some((p) => p.test(url))) return 'A';
  if (r.classification === 'SOURCE_NOT_FOUND') return 'B';
  if (TIER3.some((p) => p.test(url))) return 'D';
  if (ev.claim_type === 'EXAMPLE_INPUT' || ev.claim_type === 'CALCULATED_VALUE') return 'E';
  if (r.extraction_status === 'IMPOSSIBLE_MAPPING' || r.extraction_status === 'NO_PARAMETER_IN_CLAUSE') return 'C';
  return 'F'; // NO_NUMERIC_CONTENT and anything else with nothing to review
}

const unreviewed = prov.filter((r) => r.provenance_status === 'UNREVIEWED');
const buckets = { A: [], B: [], C: [], D: [], E: [], F: [] };
for (const r of unreviewed) {
  const ev = evByClaim.get(r.claim_id);
  buckets[bucketFor(r, ev)].push({ claim_id: r.claim_id, parameter_id: r.parameter_id, source_url: ev.source_url, extraction_status: r.extraction_status, classification: r.classification });
}

const summary = Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length]));
console.log('Review queue segmentation:', summary, 'total:', unreviewed.length);
fs.writeFileSync(path.join(OUT_DIR, 'review-queue-segmentation.json'), JSON.stringify({ total: unreviewed.length, buckets: summary }, null, 2) + '\n');
module.exports = { buckets, summary };
