#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'data', 'indexing');
const CRAWL_RULES_PATH = path.join(OUT_DIR, 'crawl-rules.json');
const WEIGHTS_PATH = path.join(OUT_DIR, 'weights.json');
const FRESHNESS_PATH = path.join(OUT_DIR, 'freshness.json');
const OUT_PRIORITY = path.join(OUT_DIR, 'priority.json');

const PAGE_TYPE_MULTIPLIER = {
  homepage: 100,
  calculator: 95,
  chart: 90,
  hub: 85,
  academy: 80,
  reference: 75,
  formula: 70,
  glossary: 65,
  entity: 60,
  resource: 55,
  guide: 60,
  programmatic: 50,
  comparison: 50,
  qa: 10,
  release: 5,
  documentation: 15,
  other: 40,
};

function readJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function run() {
  const crawl = readJson(CRAWL_RULES_PATH, { rules: [] });
  const weights = readJson(WEIGHTS_PATH, { edges: [] });
  const freshness = readJson(FRESHNESS_PATH, { pages: [] });
  const freshMap = new Map((freshness.pages || []).map((p) => [p.url, p]));

  const inboundWeight = new Map();
  const outboundLinks = new Map();
  for (const e of (weights.edges || [])) {
    inboundWeight.set(e.to, (inboundWeight.get(e.to) || 0) + e.weight);
    outboundLinks.set(e.from, (outboundLinks.get(e.from) || 0) + 1);
  }

  const records = (crawl.rules || []).map((r) => {
    const mult = PAGE_TYPE_MULTIPLIER[r.pageType] || PAGE_TYPE_MULTIPLIER.other;
    const inW = inboundWeight.get(r.url) || 0;
    const outC = outboundLinks.get(r.url) || 0;
    const fresh = freshMap.get(r.url);
    const freshnessBonus = fresh && fresh.lastReviewed ? 10 : 0;
    const priority = Math.max(0, Math.min(100, Math.round(mult * 0.55 + inW * 0.25 + Math.min(outC, 30) * 0.5 + freshnessBonus)));
    const calculatorLinks = (weights.edges || []).filter((e) => e.to === r.url && e.fromType === 'calculator').length;
    const knowledgeLinks = (weights.edges || []).filter((e) => e.to === r.url && ['academy', 'reference', 'glossary', 'formula', 'guide'].includes(e.fromType)).length;
    return {
      url: r.url,
      pageType: r.pageType,
      priority,
      reason: `Multiplier=${mult}, inboundWeight=${inW}, outboundLinks=${outC}, freshnessBonus=${freshnessBonus}`,
      crawlTier: r.crawlTier,
      hub: r.hub,
      entityCount: r.pageType === 'entity' ? 1 : 0,
      calculatorLinks,
      knowledgeLinks,
      indexingScore: priority,
    };
  });

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_PRIORITY, JSON.stringify({
    generatedAt: new Date().toISOString(),
    pageTypeMultiplier: PAGE_TYPE_MULTIPLIER,
    records,
  }, null, 2) + '\n', 'utf8');

  console.log(`generate-priority: wrote data/indexing/priority.json (${records.length} pages)`);
}

run();
