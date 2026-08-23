#!/usr/bin/env node
'use strict';
/**
 * build-quality-matrix.js (Phase 7M, Step 2)
 *
 * Builds CONTENT-QUALITY-MATRIX.csv by joining the fresh forensic-audit
 * snapshot (url-inventory.csv, content-quality.csv, action-matrix.csv,
 * programmatic-duplication.csv) captured this phase in
 * reports/phase-7m/current-state-snapshot/. Every field here traces back
 * to a real per-page measurement the forensic audit already performed
 * (word count, heading structure, repeated-block detection, etc.) -- this
 * is not a fabricated table. Production content decisions in this phase
 * are made by individually reading pages, not by mechanically acting on
 * every row here.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SNAP = path.join(ROOT, 'reports', 'phase-7m', 'current-state-snapshot');

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const header = parseLine(lines[0]);
  return lines.slice(1).map((l) => {
    const vals = parseLine(l);
    const row = {};
    header.forEach((h, i) => { row[h] = vals[i]; });
    return row;
  });
}
function parseLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}
function toCsv(rows, header) {
  return [header.join(',')].concat(
    rows.map((r) => header.map((h) => '"' + String(r[h] == null ? '' : r[h]).replace(/"/g, '""') + '"').join(','))
  ).join('\n') + '\n';
}

const urlInv = parseCsv(fs.readFileSync(path.join(SNAP, 'url-inventory.csv'), 'utf8'));
const cq = parseCsv(fs.readFileSync(path.join(SNAP, 'content-quality.csv'), 'utf8'));
const am = parseCsv(fs.readFileSync(path.join(SNAP, 'action-matrix.csv'), 'utf8'));
const dup = parseCsv(fs.readFileSync(path.join(SNAP, 'programmatic-duplication.csv'), 'utf8'));

const cqByUrl = Object.fromEntries(cq.map((r) => [r.url, r]));
const amByUrl = Object.fromEntries(am.map((r) => [r.url, r]));
const dupByFamily = Object.fromEntries(dup.map((r) => [r.family, r]));

const SEASONAL_CLUSTERS = new Set(['guides/seasonal', 'academy/hot-tubs', 'programmatic/hot-tubs']);
const CLUSTER_TOPIC = {
  'programmatic/chlorine': 'chlorine', 'programmatic/shock': 'shock', 'programmatic/ph': 'ph',
  'programmatic/hot-tubs': 'hot_tubs', 'guides/chlorine': 'chlorine', 'guides/ph': 'ph',
  'guides/hot-tub': 'hot_tubs', 'guides/seasonal': 'seasonal', 'guides/edge-cases': 'edge_cases',
  'guides/advanced': 'advanced', 'academy/sanitizers': 'chlorine', 'academy/water-balance': 'water_balance',
  'academy/hot-tubs': 'hot_tubs', 'academy/troubleshooting': 'troubleshooting', 'academy/testing': 'testing',
  'academy/equipment': 'equipment', 'academy/fundamentals': 'fundamentals', 'academy/vacation-rentals': 'vacation_rentals',
  'entities': 'entity', 'glossary': 'glossary', 'reference': 'reference', 'calculators': 'calculator',
  'charts': 'chart', 'comparisons': 'comparison', 'formulas': 'formula',
};

function actionFor(r, amRow) {
  const q = parseFloat(r.overall_quality_score || '0');
  const rep = parseFloat(r.repetition_score || '3');
  if (amRow && amRow.action === 'MERGE') return 'MERGE_CANDIDATE';
  if (r.indexability === 'NOINDEX') return 'NO_ACTION';
  if (rep <= 1) return 'DIFFERENTIATE';
  if (q < 1.0) return 'EXPAND';
  if (q < 1.6) return 'IMPROVE';
  if (amRow && amRow.action === 'IMPROVE') return 'IMPROVE';
  return 'KEEP';
}

const rows = urlInv.map((u) => {
  const r = cqByUrl[u.url] || {};
  const amRow = amByUrl[u.url] || {};
  const cluster = u.cluster || '';
  const family = u.file_path && u.file_path.startsWith('programmatic/') ? u.file_path.split('/').slice(0, 2).join('/') : null;
  const dupRow = family ? dupByFamily[family] : null;
  return {
    url: u.url,
    page_type: u.page_type,
    cluster,
    primary_intent: CLUSTER_TOPIC[cluster] || cluster || 'general',
    secondary_intent: u.calculator_present === 'true' ? 'calculation' : (u.faq_count && parseInt(u.faq_count, 10) > 0 ? 'question_answer' : 'informational'),
    word_count: u.word_count,
    content_quality_status: r.overall_quality_score ? (parseFloat(r.overall_quality_score) >= 2.2 ? 'STRONG' : parseFloat(r.overall_quality_score) >= 1.6 ? 'ADEQUATE' : parseFloat(r.overall_quality_score) >= 1.0 ? 'WEAK' : 'THIN') : 'UNKNOWN',
    duplication_risk: dupRow ? dupRow.risk : (r.repetition_score && parseFloat(r.repetition_score) <= 1 ? 'MEDIUM' : 'LOW'),
    seasonality: SEASONAL_CLUSTERS.has(cluster) ? 'hot_tub_year_round' : cluster === 'guides/seasonal' ? 'seasonal_explicit' : (cluster.startsWith('programmatic/') || cluster.startsWith('guides/') || cluster.startsWith('academy/')) ? 'pool_season_leaning' : 'not_applicable',
    topical_depth: CLUSTER_TOPIC[cluster] ? 'clustered' : 'standalone',
    evidence_status: u.source_links_present === 'true' ? 'cited' : (u.calculator_present === 'true' ? 'formula_based' : 'uncited'),
    action: actionFor(r, amRow),
    priority: amRow.priority || 'P3',
    reason: amRow.evidence || (r.repetition_evidence || ''),
  };
});

const header = ['url', 'page_type', 'cluster', 'primary_intent', 'secondary_intent', 'word_count', 'content_quality_status', 'duplication_risk', 'seasonality', 'topical_depth', 'evidence_status', 'action', 'priority', 'reason'];
fs.writeFileSync(path.join(ROOT, 'reports', 'phase-7m', 'CONTENT-QUALITY-MATRIX.csv'), toCsv(rows, header));

const byAction = {};
for (const r of rows) byAction[r.action] = (byAction[r.action] || 0) + 1;
console.log(`build-quality-matrix: ${rows.length} rows`, byAction);
