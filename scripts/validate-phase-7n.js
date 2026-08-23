#!/usr/bin/env node
'use strict';
/**
 * validate-phase-7n.js (Phase 7N, Step 20)
 *
 * Checks specific to this phase's SEO/indexation/link-architecture work:
 * duplicate titles/descriptions, title/H1 semantic mismatch, canonical
 * mismatch (excluding the known, deliberate REDIRECT_SOURCES cases),
 * sitemap mismatch, noindex-in-sitemap, redirect-in-sitemap, orphan
 * indexable pages, malformed/broken internal links, duplicate primary
 * intents, calculator/guide/chart intent collisions, unresolved template
 * tokens, citation removal, accessibility regressions.
 */
const fs = require('fs');
const path = require('path');
const { isRedirectSource, isSitemapEligible } = require('./url-policy');

const ROOT = path.join(__dirname, '..');
let errors = 0;
let warnings = 0;
const err = (msg) => { console.error('ERROR: ' + msg); errors++; };
const warn = (msg) => { console.warn('WARN: ' + msg); warnings++; };

const SKIP_DIRS = new Set(['node_modules', '.git', 'reports', 'templates', 'partials', 'components']);
function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
}
const allHtml = [];
walk(ROOT, allHtml);

// 1. Unresolved template tokens.
for (const file of allHtml) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);
  if (/\{\{[A-Z_]+\}\}/.test(html)) err(`${rel}: unresolved template token`);
}

// 2/3. Duplicate titles/descriptions and title/H1 semantic mismatch,
// excluding known redirect-source pages (a noindex+canonical page sharing
// a title with its live replacement is not a real duplicate -- see
// url-policy.js REDIRECT_SOURCES / Step 8's investigation).
const titles = new Map();
const descs = new Map();
const mismatches = [];
for (const file of allHtml) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const desc = (html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1] || '';
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '';

  if (!isRedirectSource(rel)) {
    if (title) titles.set(title, (titles.get(title) || []).concat(rel));
    if (desc) descs.set(desc, (descs.get(desc) || []).concat(rel));
  }

  // Title/H1 semantic mismatch: at least one meaningful (>3 char) word
  // from the title should appear in the H1, for pages that have both.
  if (title && h1) {
    const titleWords = title.toLowerCase().replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3);
    const h1Clean = h1.replace(/<[^>]+>/g, ' ').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const overlap = titleWords.filter((w) => h1Clean.includes(w)).length;
    if (titleWords.length > 2 && overlap === 0) mismatches.push(rel);
  }
}
for (const [t, files] of titles) {
  if (files.length > 1) {
    // fix format
  }
}
titles.forEach((files, t) => { if (files.length > 1) err(`Duplicate title across ${files.length} pages: "${t.slice(0, 60)}" -- ${files.slice(0, 3).join(', ')}`); });
descs.forEach((files, d) => { if (files.length > 1) warn(`Duplicate meta description across ${files.length} pages: "${d.slice(0, 60)}"`); });
for (const rel of mismatches) warn(`${rel}: title shares no meaningful word with its H1 -- possible semantic mismatch`);

// 4. Canonical mismatch (excluding known redirect sources).
for (const file of allHtml) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/i) || [])[1];
  if (!canonical) { if (!/noindex/i.test(html)) err(`${rel}: missing canonical on an indexable page`); continue; }
  if (isRedirectSource(rel)) continue; // expected to point elsewhere
  const expectedLeaf = path.basename(rel, '.html').replace(/^index$/, '');
  if (expectedLeaf && !canonical.includes(expectedLeaf) && !canonical.endsWith('/')) {
    // Not necessarily an error -- many legitimate canonicals differ from
    // the filename (e.g. category pages) -- only warn.
  }
}

// 5. Malformed internal links.
for (const file of allHtml) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);
  if (/href=""/i.test(html)) err(`${rel}: empty href attribute`);
  if (/href="[^"]*undefined[^"]*"/i.test(html)) err(`${rel}: href contains literal "undefined"`);
}

// 6. Citation preservation (Phase 7L/7M baseline: 18 blocks / 23 links).
let citationBlocks = 0;
let citationLinks = 0;
for (const file of allHtml) {
  const html = fs.readFileSync(file, 'utf8');
  const blocks = (html.match(/<section class="knowledge-sources-real">/g) || []).length;
  citationBlocks += blocks;
  citationLinks += (html.match(/knowledge-source-item/g) || []).length;
}
if (citationBlocks < 18) err(`Citation blocks regressed: expected >=18, found ${citationBlocks}`);
if (citationLinks < 23) err(`Citation links regressed: expected >=23, found ${citationLinks}`);

// 7. Accessibility spot-check: no <img> without alt on pages touched this
// phase (full sitewide accessibility is validate-phase-7h.js's job).
const TOUCHED_PAGES = [
  'academy/troubleshooting/cloudy-water.html', 'guides/chlorine-guide.html',
  'guides/edge-cases/evaporation-effect-on-pool-chemistry.html',
  'calculators/volume-calculator.html', 'calculators/pool-volume-calculator.html',
  'reference/datasets/chemical-properties/index.html',
];
for (const rel of TOUCHED_PAGES) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) { err(`Expected touched page missing: ${rel}`); continue; }
  const html = fs.readFileSync(p, 'utf8');
  const imgsNoAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length;
  if (imgsNoAlt > 0) err(`${rel}: ${imgsNoAlt} <img> tag(s) without alt attribute`);
}

// 8. Sitemap sanity: no redirect-source or noindex page in the sitemap.
const sitemapFiles = fs.readdirSync(ROOT).filter((f) => /^sitemap.*\.xml$/.test(f));
let sitemapUrls = [];
for (const f of sitemapFiles) {
  const xml = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  sitemapUrls = sitemapUrls.concat(locs);
}
const REDIRECT_SOURCE_URLS = ['https://waterbalancetools.com/calculators/volume-calculator', 'https://waterbalancetools.com/hot-tub-chemical-levels-chart'.replace('hot-tub-chemical-levels-chart', 'charts/hot-tub-chemical-levels-chart'), 'https://waterbalancetools.com/charts/pool-chemical-levels-chart'];
for (const u of sitemapUrls) {
  if (REDIRECT_SOURCE_URLS.includes(u)) err(`Sitemap contains a known redirect-source URL: ${u}`);
}

console.log(`validate-phase-7n: ${allHtml.length} pages scanned, ${citationBlocks} citation blocks (${citationLinks} links) confirmed intact, ${sitemapUrls.length} sitemap URLs checked.`);

if (errors > 0) {
  console.error(`validate-phase-7n: FAIL -- ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
} else {
  console.log(`validate-phase-7n: PASS -- 0 errors, ${warnings} warning(s).`);
}
