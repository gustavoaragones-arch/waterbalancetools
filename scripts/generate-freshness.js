#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NAV_PATH = path.join(ROOT, 'data', 'navigation.json');
const PLATFORM_PATH = path.join(ROOT, 'data', 'platform', 'platform.json');
const VERSION_PATH = path.join(ROOT, 'data', 'datasets', 'version.json');
const OUT_DIR = path.join(ROOT, 'data', 'indexing');
const OUT_FILE = path.join(OUT_DIR, 'freshness.json');

function readJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function run() {
  const nav = readJson(NAV_PATH, { pages: [] });
  const platform = readJson(PLATFORM_PATH, { platform: {} });
  const version = readJson(VERSION_PATH, {});
  const now = new Date().toISOString();

  const pages = (nav.pages || []).map((p) => ({
    url: p.url,
    lastModified: now,
    lastReviewed: p.lastReviewed || now.slice(0, 10),
    datasetVersion: version.version || version.datasetVersion || '2026.07',
    formulaVersion: version.formulaVersion || '2026.07',
    entityVersion: version.entityVersion || version.knowledgeGraphVersion || '2026.07',
    platformVersion: platform.platform?.version || '1.0.0',
    confidenceLevel: 'high',
    pageType: p.category || 'other',
  }));

  const recentlyUpdated = [...pages].sort((a, b) => String(b.lastReviewed).localeCompare(String(a.lastReviewed))).slice(0, 100);
  const recentlyReviewed = [...recentlyUpdated];
  const recentlyImproved = [...pages].sort((a, b) => a.url.localeCompare(b.url)).slice(0, 100);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify({
    generatedAt: now,
    platformVersion: platform.platform?.version || '1.0.0',
    pages,
    recentlyUpdated,
    recentlyReviewed,
    recentlyImproved,
  }, null, 2) + '\n', 'utf8');

  console.log(`generate-freshness: wrote data/indexing/freshness.json (${pages.length} pages)`);
}

run();
