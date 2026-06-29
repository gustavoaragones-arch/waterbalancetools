#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const urlEngine = require('../js/url/url-engine');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'data', 'indexing');
const CRAWL_RULES_PATH = path.join(OUT_DIR, 'crawl-rules.json');
const OUT_WEIGHTS = path.join(OUT_DIR, 'weights.json');

const SKIP_DIRS = new Set(['node_modules', '.git', 'assets', 'scripts', 'data', 'js', 'functions', 'lib', 'mcps', 'terminals', 'agent-transcripts', 'templates', 'partials']);

function readJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function walkHtml(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(full, out);
    else if (e.isFile() && e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function pageUrlFromFile(fp) {
  const rel = path.relative(ROOT, fp).replace(/\\/g, '/');
  return urlEngine.buildUrl(rel);
}

function linkWeight(fromType, toType) {
  const key = `${fromType}->${toType}`;
  const map = {
    'homepage->calculator': 100,
    'homepage->academy': 80,
    'homepage->reference': 80,
    'calculator->formula': 70,
    'calculator->reference': 60,
    'calculator->glossary': 40,
    'entity->calculator': 90,
    'entity->academy': 80,
    'entity->reference': 60,
  };
  if (map[key]) return map[key];
  if (toType === 'hub') return 75;
  if (toType === 'calculator') return 65;
  if (toType === 'reference') return 55;
  if (toType === 'academy') return 50;
  if (toType === 'glossary') return 40;
  return 30;
}

function parseLinks(html) {
  const out = [];
  const re = /<a[^>]+href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1];
    if (/^(mailto:|tel:|javascript:|data:|https?:\/\/(?!waterbalancetools\.com))/i.test(raw)) continue;
    out.push(urlEngine.normalizeHref(raw));
  }
  return out;
}

function run() {
  const crawl = readJson(CRAWL_RULES_PATH, { rules: [] });
  const byUrl = new Map((crawl.rules || []).map((r) => [r.url, r]));
  const files = walkHtml(ROOT);
  const edges = [];

  for (const fp of files) {
    const from = pageUrlFromFile(fp);
    const fromMeta = byUrl.get(from);
    if (!fromMeta) continue;
    const links = parseLinks(fs.readFileSync(fp, 'utf8'));
    for (const to of links) {
      const toMeta = byUrl.get(to);
      if (!toMeta) continue;
      edges.push({
        from,
        to,
        fromType: fromMeta.pageType,
        toType: toMeta.pageType,
        weight: linkWeight(fromMeta.pageType, toMeta.pageType),
        reason: `${fromMeta.pageType} to ${toMeta.pageType} authority flow`,
      });
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_WEIGHTS, JSON.stringify({
    generatedAt: new Date().toISOString(),
    rationale: {
      homepage: 'Top-level discovery and authority distribution.',
      calculators: 'Primary transactional pages with highest SEO/business impact.',
      entity: 'Semantic bridge across calculators and knowledge assets.',
      knowledge: 'Supportive informational content and contextual reinforcement.',
    },
    edges,
  }, null, 2) + '\n', 'utf8');

  console.log(`generate-link-weights: wrote data/indexing/weights.json (${edges.length} weighted edges)`);
}

run();
