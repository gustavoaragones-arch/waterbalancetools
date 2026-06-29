#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PRIORITY_PATH = path.join(ROOT, 'data', 'indexing', 'priority.json');
const WEIGHTS_PATH = path.join(ROOT, 'data', 'indexing', 'weights.json');
const OUT_DIR = path.join(ROOT, 'audit', 'google');
const OUT_FILE = path.join(OUT_DIR, 'priority-report.html');

function readJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function run() {
  const priority = readJson(PRIORITY_PATH, { records: [] });
  const weights = readJson(WEIGHTS_PATH, { edges: [] });
  const records = [...(priority.records || [])].sort((a, b) => b.priority - a.priority);
  const top = records.slice(0, 100);
  const bottom = [...records].reverse().slice(0, 100);

  const inboundCount = new Map();
  for (const e of (weights.edges || [])) {
    inboundCount.set(e.to, (inboundCount.get(e.to) || 0) + 1);
  }

  const topRows = top.map((r) => `<tr><td>${r.url}</td><td>${r.pageType}</td><td>${r.crawlTier}</td><td>${r.priority}</td><td>${inboundCount.get(r.url) || 0}</td><td>${r.reason}</td></tr>`).join('\n');
  const bottomRows = bottom.map((r) => `<tr><td>${r.url}</td><td>${r.pageType}</td><td>${r.crawlTier}</td><td>${r.priority}</td><td>${inboundCount.get(r.url) || 0}</td><td>Add contextual links from high-authority hubs/entities.</td></tr>`).join('\n');

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Priority Report</title><link rel="stylesheet" href="/style.css"></head><body><main class="container"><h1>Index Priority Report</h1><p>Top and bottom 100 pages by indexing priority score (0–100).</p><h2>Top 100 Pages</h2><table class="qa-table"><thead><tr><th>URL</th><th>Type</th><th>Tier</th><th>Priority</th><th>Inbound Links</th><th>Reason</th></tr></thead><tbody>${topRows}</tbody></table><h2>Bottom 100 Pages</h2><table class="qa-table"><thead><tr><th>URL</th><th>Type</th><th>Tier</th><th>Priority</th><th>Inbound Links</th><th>Improvement Suggestion</th></tr></thead><tbody>${bottomRows}</tbody></table></main></body></html>`, 'utf8');

  console.log(`audit-indexing: wrote audit/google/priority-report.html (${records.length} records)`);
}

run();
