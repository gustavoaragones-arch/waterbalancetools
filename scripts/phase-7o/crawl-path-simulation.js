#!/usr/bin/env node
'use strict';
/**
 * crawl-path-simulation.js (Phase 7O, Step 20)
 * Real BFS simulation of crawl discovery starting from the homepage,
 * following only <a href> links found in production HTML (matching what
 * a search engine crawler would actually traverse). Cross-references
 * against the sitemap and all-pages.html to classify each canonical page
 * by how it's discoverable.
 */
const fs = require('fs');
const path = require('path');
const urlPolicy = require('../url-policy');

const ROOT = path.join(__dirname, '..', '..');
const SKIP_DIRS = new Set([...urlPolicy.NON_PAGE_DIRS, ...urlPolicy.INTERNAL_TOOLING_DIRS, 'components', 'templates', 'partials']);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
}
const allFiles = [];
walk(ROOT, allFiles);

function toPageUrl(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  let clean = '/' + rel;
  clean = clean.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (clean.length > 1) clean = clean.replace(/\/$/, '');
  return clean || '/';
}

const fileByUrl = new Map();
for (const f of allFiles) fileByUrl.set(toPageUrl(f), f);

function extractLinks(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const withoutCode = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const hrefs = [...withoutCode.matchAll(/<a[^>]+href="([^"]+)"/gi)].map((m) => m[1]);
  const out = new Set();
  for (const href of hrefs) {
    if (/^(mailto:|tel:|https?:\/\/|#|javascript:)/.test(href)) continue;
    let normalized = href.split(/[?#]/)[0];
    if (!normalized) continue;
    if (normalized.startsWith('./')) normalized = normalized.slice(1);
    if (!normalized.startsWith('/')) {
      const dir = path.dirname(toPageUrl(filePath) === '/' ? '/index' : '/' + path.relative(ROOT, filePath).replace(/\\/g, '/'));
      normalized = path.join(dir, normalized).replace(/\\/g, '/');
    }
    normalized = normalized.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (normalized.length > 1) normalized = normalized.replace(/\/$/, '');
    out.add(normalized || '/');
  }
  return out;
}

// BFS from homepage.
const visited = new Map(); // url -> depth
const queue = [['/', 0]];
visited.set('/', 0);
while (queue.length) {
  const [url, depth] = queue.shift();
  const file = fileByUrl.get(url) || fileByUrl.get(url + '/');
  if (!file) continue;
  const links = extractLinks(file);
  for (const l of links) {
    if (!fileByUrl.has(l) && !fileByUrl.has(l + '/')) continue; // external/nonexistent
    if (!visited.has(l)) {
      visited.set(l, depth + 1);
      queue.push([l, depth + 1]);
    }
  }
}

// Canonical indexable pages (per url-policy) that SHOULD be discoverable.
const canonicalFiles = allFiles.filter((f) => {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  return urlPolicy.isProductionPage(rel) && urlPolicy.isIndexablePage(rel);
});
const canonicalUrls = new Set(canonicalFiles.map(toPageUrl));

const discovered = [...canonicalUrls].filter((u) => visited.has(u));
const undiscovered = [...canonicalUrls].filter((u) => !visited.has(u));

// Sitemap membership.
const sitemapFiles = fs.readdirSync(ROOT).filter((f) => /^sitemap.*\.xml$/.test(f));
let sitemapUrls = new Set();
for (const f of sitemapFiles) {
  const xml = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of xml.matchAll(/<loc>https:\/\/waterbalancetools\.com([^<]*)<\/loc>/g)) {
    let u = m[1] || '/';
    if (u.length > 1) u = u.replace(/\/$/, '');
    sitemapUrls.add(u || '/');
  }
}

// all-pages.html membership.
const allPagesPath = path.join(ROOT, 'all-pages.html');
let allPagesUrls = new Set();
if (fs.existsSync(allPagesPath)) {
  const html = fs.readFileSync(allPagesPath, 'utf8');
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    let u = m[1].split(/[?#]/)[0];
    if (!u.startsWith('/')) continue;
    u = u.replace(/\.html$/, '').replace(/\/index$/, '/');
    if (u.length > 1) u = u.replace(/\/$/, '');
    allPagesUrls.add(u || '/');
  }
}

const onlyViaSitemap = discovered.filter((u) => sitemapUrls.has(u) && !allPagesUrls.has(u) && (visited.get(u) || 0) > 6);
const onlyViaAllPages = [...canonicalUrls].filter((u) => allPagesUrls.has(u) && !discoveredViaContextual(u));
function discoveredViaContextual(u) {
  // "contextual" = reachable via BFS without needing all-pages.html at all;
  // approximate by checking if depth is reasonable through the main graph.
  return visited.has(u);
}
const multiPath = discovered.filter((u) => sitemapUrls.has(u) && allPagesUrls.has(u));

const depthDist = {};
for (const [, d] of visited) depthDist[d] = (depthDist[d] || 0) + 1;

const summary = {
  generated: new Date().toISOString().slice(0, 10),
  total_canonical_indexable_pages: canonicalUrls.size,
  total_discovered_via_contextual_crawl: discovered.length,
  total_undiscovered_canonical_pages: undiscovered.length,
  undiscovered_pages: undiscovered.slice(0, 50),
  depth_distribution: depthDist,
  pages_discovered_via_both_sitemap_and_allpages: multiPath.length,
  sitemap_url_count: sitemapUrls.size,
  all_pages_url_count: allPagesUrls.size,
};

fs.mkdirSync(path.join(ROOT, 'reports', 'phase-7o'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'reports', 'phase-7o', 'CRAWL-PATH-SIMULATION.json'), JSON.stringify(summary, null, 2));

const md = `# Phase 7O — Crawl Path Simulation

Generated: ${summary.generated}

Real breadth-first simulation of crawl discovery starting from \`/\`, following only actual \`<a href>\` links found in the production HTML (contextual navigation + in-content links), matching how a search engine crawler would traverse the site.

## Results

- Canonical indexable pages (per url-policy.js): **${summary.total_canonical_indexable_pages}**
- Discovered via contextual crawl from homepage: **${summary.total_discovered_via_contextual_crawl}**
- Undiscovered canonical pages (no contextual path from homepage at all): **${summary.total_undiscovered_canonical_pages}**
- Sitemap URL count: ${summary.sitemap_url_count}
- all-pages.html URL count: ${summary.all_pages_url_count}
- Pages present in both sitemap and all-pages.html (multiple independent discovery paths): ${summary.pages_discovered_via_both_sitemap_and_allpages}

## Depth distribution (BFS from homepage)

${Object.entries(summary.depth_distribution).sort((a, b) => Number(a[0]) - Number(b[0])).map(([d, n]) => `- Depth ${d}: ${n} pages`).join('\n')}

## Undiscovered canonical pages

${summary.undiscovered_pages.length ? summary.undiscovered_pages.map((u) => `- ${u}`).join('\n') : '(none -- every canonical indexable page is reachable via contextual links from the homepage)'}
`;
fs.writeFileSync(path.join(ROOT, 'reports', 'phase-7o', 'CRAWL-PATH-SIMULATION.md'), md);
console.log(`crawl-path-simulation: ${summary.total_discovered_via_contextual_crawl}/${summary.total_canonical_indexable_pages} canonical pages discovered via contextual crawl; ${summary.total_undiscovered_canonical_pages} undiscovered.`);
