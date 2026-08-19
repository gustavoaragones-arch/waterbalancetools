/**
 * generate-navigation.js
 *
 * Assembles data/navigation.json by:
 *   1. Walking all generated HTML files to extract title + description
 *   2. Merging knowledge-platform metadata from academy/formulas/glossary/reference JSON
 *   3. Writing the unified page index (consumed by breadcrumbs, search, related-content)
 *
 * Runs AFTER all content generators, BEFORE breadcrumbs and search index.
 * Idempotent — overwrites navigation.json on every run.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { walkHtml, ROOT, buildUrl } = require('./template-utils');
const urlPolicy = require('./url-policy');

// Directories whose HTML we skip when building the nav index
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'assets', 'js', 'functions',
  'data', 'lib', 'scripts', 'partials', 'templates',
]);

// ── HTML metadata extractor ───────────────────────────────────────────────────

function extractMeta(html) {
  const titleM = html.match(/<title>([^<]+)<\/title>/i);
  const descM  = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i) ||
                 html.match(/<meta\s+content="([^"]+)"\s+name="description"/i);
  const h1M    = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return {
    title:       titleM ? titleM[1].replace(/ \| WaterBalanceTools$/, '').trim() : '',
    description: descM ? descM[1].trim() : '',
    h1:          h1M ? h1M[1].replace(/<[^>]+>/g, '').trim() : '',
  };
}

function toCleanUrl(relPath) {
  return buildUrl(relPath);
}

function urlToCategory(url) {
  const first = url.replace(/^\//, '').split('/')[0];
  const map = {
    calculators: 'calculators', guides: 'guides', charts: 'charts',
    resources: 'resources', academy: 'academy', formulas: 'formulas',
    glossary: 'glossary', reference: 'reference', comparisons: 'comparisons',
    methodology: 'methodology', about: 'about', search: 'search',
  };
  return map[first] || 'other';
}

// ── Knowledge-platform metadata overlay ──────────────────────────────────────

function loadKnowledgeMeta() {
  const metaMap = {};
  const dataFiles = ['academy', 'formulas', 'glossary', 'reference'];
  for (const name of dataFiles) {
    try {
      const d = require(path.join(ROOT, 'data', `${name}.json`));
      const lists = [d.articles, d.formulas, d.terms, d.pages].filter(Array.isArray);
      for (const list of lists) {
        for (const entry of list) {
          if (!entry.slug) continue;
          const url = buildUrl(entry.slug);
          metaMap[url] = {
            readingTime:        entry.readingTime || null,
            lastReviewed:       entry.lastReviewed || null,
            tags:               entry.tags || [],
            relatedCalculators: entry.relatedCalculators || [],
            relatedCharts:      entry.relatedCharts || [],
            relatedResources:   entry.relatedResources || [],
            relatedTopics:      entry.relatedTopics || [],
          };
        }
      }
    } catch (_) { /* data file may not exist yet */ }
  }
  return metaMap;
}

// ── Build navigation.json ─────────────────────────────────────────────────────

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { walk(full, out); continue; }
    if (e.isFile() && e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const knowledgeMeta = loadKnowledgeMeta();
const pages = [];
const seen  = new Set();

for (const fullPath of walk(ROOT)) {
  const relPath = path.relative(ROOT, fullPath).replace(/\\/g, '/');
  // Skip files that shouldn't be indexed
  if (relPath.startsWith('programmatic/') && relPath.includes('programmatic/') ) {
    // Only skip deeply nested programmatic pages for brevity, keep main ones
  }
  if (urlPolicy.isRedirectSource(relPath)) continue;
  const url = toCleanUrl(relPath);
  if (seen.has(url)) continue;
  seen.add(url);

  const html  = fs.readFileSync(fullPath, 'utf8');
  const meta  = extractMeta(html);
  const extra = knowledgeMeta[url] || {};
  const cat   = urlToCategory(url);

  pages.push({
    url,
    title:              meta.title || meta.h1 || url,
    description:        meta.description,
    category:           cat,
    readingTime:        extra.readingTime || null,
    lastReviewed:       extra.lastReviewed || null,
    tags:               extra.tags || [],
    relatedCalculators: extra.relatedCalculators || [],
    relatedCharts:      extra.relatedCharts || [],
    relatedResources:   extra.relatedResources || [],
    relatedTopics:      extra.relatedTopics || [],
  });
}

// Sort: calculators first, then knowledge, then other
const ORDER = ['calculators','charts','resources','academy','formulas','glossary','reference','guides','comparisons','methodology','about','other'];
pages.sort((a, b) => {
  const ai = ORDER.indexOf(a.category); const bi = ORDER.indexOf(b.category);
  if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  return a.url.localeCompare(b.url);
});

const output = {
  _comment:   'Auto-generated by generate-navigation.js. Do not edit manually.',
  _generated: new Date().toISOString(),
  pages,
};

fs.writeFileSync(path.join(ROOT, 'data', 'navigation.json'), JSON.stringify(output, null, 2), 'utf8');
console.log(`generate-navigation: indexed ${pages.length} pages → data/navigation.json`);
