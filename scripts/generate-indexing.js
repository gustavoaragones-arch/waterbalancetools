#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NAV_PATH = path.join(ROOT, 'data', 'navigation.json');
const OUT_DIR = path.join(ROOT, 'data', 'indexing');
const OUT_CRAWL_RULES = path.join(OUT_DIR, 'crawl-rules.json');

function readJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function pageTypeFromUrl(url) {
  if (url === '/') return 'homepage';
  if (url === '/qa' || url.startsWith('/qa/') || url.startsWith('/reports/')) return 'qa';
  if (url.startsWith('/audit/')) return 'documentation';
  if (url === '/releases' || url.startsWith('/releases/')) return 'release';
  if (url.startsWith('/calculators/')) return 'calculator';
  if (url.startsWith('/charts/') || /-levels-chart$/.test(url)) return 'chart';
  if (url.startsWith('/academy/')) return 'academy';
  if (url.startsWith('/reference/')) return 'reference';
  if (url.startsWith('/formulas/')) return 'formula';
  if (url.startsWith('/glossary/')) return 'glossary';
  if (url.startsWith('/entities/')) return 'entity';
  if (url.startsWith('/resources/')) return 'resource';
  if (url.startsWith('/guides/')) return 'guide';
  if (url.startsWith('/comparisons/')) return 'comparison';
  if (url.startsWith('/programmatic/')) return 'programmatic';
  if (url.startsWith('/methodology/') || url.startsWith('/editorial/') || url.startsWith('/provenance/') || url.startsWith('/revisions/')) return 'documentation';
  if (url.startsWith('/tools/')) return 'documentation';
  if (url.endsWith('/index') || url.endsWith('/')) return 'hub';
  return 'other';
}

function crawlTier(url, pageType) {
  if (url === '/' || pageType === 'calculator' || pageType === 'chart' || pageType === 'hub') return 'Tier 1';
  if (['academy', 'reference', 'formula', 'resource'].includes(pageType) || url.startsWith('/entities/')) return 'Tier 2';
  if (['glossary', 'programmatic', 'guide', 'comparison', 'entity'].includes(pageType)) return 'Tier 3';
  if (['qa', 'release', 'documentation'].includes(pageType)) return 'Tier 4';
  return 'Tier 3';
}

function hubForUrl(url) {
  const segs = url.split('/').filter(Boolean);
  if (!segs.length) return '/';
  if (segs.length === 1) return '/' + segs[0];
  return '/' + segs[0] + '/' + segs[1];
}

function run() {
  const nav = readJson(NAV_PATH, { pages: [] });
  const pages = nav.pages || [];
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const crawlRules = pages.map((p) => {
    const pageType = pageTypeFromUrl(p.url);
    const tier = crawlTier(p.url, pageType);
    return {
      url: p.url,
      pageType,
      crawlTier: tier,
      hub: hubForUrl(p.url),
      indexable: !(p.url.startsWith('/reports/') || p.url.startsWith('/qa/')),
      reason: `Assigned from URL taxonomy (${pageType}).`,
    };
  });

  writeJson(OUT_CRAWL_RULES, {
    generatedAt: new Date().toISOString(),
    rulesVersion: '1.0',
    rules: crawlRules,
  });

  console.log(`generate-indexing: wrote data/indexing/crawl-rules.json (${crawlRules.length} pages)`);
}

run();
