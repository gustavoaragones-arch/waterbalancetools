#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WEIGHTS_PATH = path.join(ROOT, 'data', 'indexing', 'weights.json');
const PRIORITY_PATH = path.join(ROOT, 'data', 'indexing', 'priority.json');
const OUT_DIR = path.join(ROOT, 'audit', 'google');
const FLOW_FILE = path.join(OUT_DIR, 'authority-flow.html');
const WEAK_FILE = path.join(OUT_DIR, 'weak-pages.html');

function readJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function run() {
  const weights = readJson(WEIGHTS_PATH, { edges: [] });
  const priority = readJson(PRIORITY_PATH, { records: [] });
  const priMap = new Map((priority.records || []).map((r) => [r.url, r]));

  const inbound = new Map();
  const outbound = new Map();
  for (const e of (weights.edges || [])) {
    inbound.set(e.to, (inbound.get(e.to) || 0) + e.weight);
    outbound.set(e.from, (outbound.get(e.from) || 0) + e.weight);
  }

  const rows = [...priMap.keys()].map((url) => ({
    url,
    authority: inbound.get(url) || 0,
    out: outbound.get(url) || 0,
    priority: priMap.get(url).priority || 0,
    pageType: priMap.get(url).pageType || 'other',
  })).sort((a, b) => b.authority - a.authority);

  const top = rows.slice(0, 100);
  const weak = rows.filter((r) => r.authority < 60 || r.priority < 40).slice(0, 200);
  const orphanRisk = rows.filter((r) => r.authority === 0).length;
  const inboundAvg = rows.length ? rows.reduce((s, r) => s + r.authority, 0) / rows.length : 0;
  const outboundAvg = rows.length ? rows.reduce((s, r) => s + r.out, 0) / rows.length : 0;

  const topRows = top.map((r) => `<tr><td>${r.url}</td><td>${r.pageType}</td><td>${r.authority}</td><td>${r.out}</td><td>${r.priority}</td></tr>`).join('\n');
  const weakRows = weak.map((r) => `<tr><td>${r.url}</td><td>${r.pageType}</td><td>${r.authority}</td><td>${r.out}</td><td>Increase contextual links from related hubs/entities/calculators</td></tr>`).join('\n');

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(FLOW_FILE, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Authority Flow</title><link rel="stylesheet" href="/style.css"></head><body><main class="container"><h1>Authority Flow</h1><p>Top authority pages, weak pages, orphan risk, and distribution metrics.</p><ul><li>Orphan risk pages: ${orphanRisk}</li><li>Inbound average: ${inboundAvg.toFixed(2)}</li><li>Outbound average: ${outboundAvg.toFixed(2)}</li><li>Hub contribution: weighted via hub links in edge graph</li><li>Entity contribution: weighted via entity links in edge graph</li></ul><table class="qa-table"><thead><tr><th>URL</th><th>Type</th><th>Inbound</th><th>Outbound</th><th>Priority</th></tr></thead><tbody>${topRows}</tbody></table></main></body></html>`, 'utf8');
  fs.writeFileSync(WEAK_FILE, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Weak Pages</title><link rel="stylesheet" href="/style.css"></head><body><main class="container"><h1>Weak Pages</h1><p>Recommendation report for low-authority and low-priority URLs.</p><table class="qa-table"><thead><tr><th>URL</th><th>Type</th><th>Inbound</th><th>Outbound</th><th>Recommendation</th></tr></thead><tbody>${weakRows}</tbody></table></main></body></html>`, 'utf8');
  console.log(`audit-authority: wrote audit/google/authority-flow.html and weak-pages.html (${rows.length} pages analyzed)`);
}

run();
