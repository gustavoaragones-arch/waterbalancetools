#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INDEXING_DIR = path.join(ROOT, 'data', 'indexing');
const NAV_PATH = path.join(ROOT, 'data', 'navigation.json');

function readJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

const errors = [];
const warnings = [];
function fail(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

function run() {
  const requiredFiles = ['priority.json', 'weights.json', 'freshness.json', 'crawl-rules.json'];
  for (const f of requiredFiles) {
    const fp = path.join(INDEXING_DIR, f);
    if (!fs.existsSync(fp)) fail(`Missing indexing file: data/indexing/${f}`);
  }
  if (errors.length) return done();

  const nav = readJson(NAV_PATH, { pages: [] });
  const navUrls = new Set((nav.pages || []).map((p) => p.url));
  const priority = readJson(path.join(INDEXING_DIR, 'priority.json'), { records: [] });
  const rules = readJson(path.join(INDEXING_DIR, 'crawl-rules.json'), { rules: [] });
  const freshness = readJson(path.join(INDEXING_DIR, 'freshness.json'), { pages: [] });
  const weights = readJson(path.join(INDEXING_DIR, 'weights.json'), { edges: [] });

  const validTiers = new Set(['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4']);
  const validTypes = new Set(['homepage', 'calculator', 'chart', 'hub', 'academy', 'reference', 'formula', 'glossary', 'entity', 'resource', 'guide', 'programmatic', 'comparison', 'qa', 'release', 'documentation', 'other']);

  const byPriority = new Map((priority.records || []).map((r) => [r.url, r]));
  const byRule = new Map((rules.rules || []).map((r) => [r.url, r]));
  const byFresh = new Map((freshness.pages || []).map((r) => [r.url, r]));

  for (const url of navUrls) {
    if (!byPriority.has(url)) fail(`Page without priority: ${url}`);
    if (!byRule.has(url)) fail(`Page without crawl rule: ${url}`);
    if (!byFresh.has(url)) fail(`Page without freshness: ${url}`);
  }

  for (const rec of priority.records || []) {
    if (rec.priority == null) fail(`Missing priority score: ${rec.url}`);
    if (!validTiers.has(rec.crawlTier)) fail(`Missing crawl tier: ${rec.url}`);
    if (!validTypes.has(rec.pageType)) fail(`Unknown page type: ${rec.url} (${rec.pageType})`);
    if (!rec.hub) fail(`Page without hub assignment: ${rec.url}`);
  }

  for (const rule of rules.rules || []) {
    if (!validTiers.has(rule.crawlTier)) fail(`Missing crawl tier in rules: ${rule.url}`);
    if (!validTypes.has(rule.pageType)) fail(`Unknown page type in rules: ${rule.url} (${rule.pageType})`);
    if (!rule.hub) fail(`Page without hub assignment in rules: ${rule.url}`);
  }

  for (const page of freshness.pages || []) {
    if (!page.lastReviewed) fail(`Broken freshness (missing lastReviewed): ${page.url}`);
    if (!page.platformVersion) warn(`Freshness missing platformVersion: ${page.url}`);
  }

  if (!(weights.edges || []).length) fail('Broken authority graph: no weighted edges');
  for (const e of weights.edges || []) {
    if (typeof e.weight !== 'number') fail(`Missing weight on edge: ${e.from} -> ${e.to}`);
  }

  done();
}

function done() {
  if (errors.length) {
    console.error('validate-indexing: FAILED');
    errors.forEach((e) => console.error(`- ${e}`));
    warnings.forEach((w) => console.error(`- WARN: ${w}`));
    process.exit(1);
  }
  console.log(`validate-indexing: PASSED (${warnings.length} warnings)`);
}

run();
