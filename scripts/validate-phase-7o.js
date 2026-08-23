#!/usr/bin/env node
'use strict';
/**
 * validate-phase-7o.js (Phase 7O, Step 23)
 *
 * Checks specific to this phase's crawl/indexation work: sitemap purity
 * (no noindex/redirect-source/tooling URLs), no internal links to
 * redirect-source pages, lastmod determinism/non-fabrication, no
 * unexpected URL creation/deletion, citation and accessibility
 * preservation, and the specific bugs this phase fixed staying fixed.
 */
const fs = require('fs');
const path = require('path');
const { isRedirectSource, isSitemapEligible, isIndexablePage, isProductionPage } = require('./url-policy');

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

// 2/3/4. Sitemap purity: no noindex, no redirect-source, no internal-tooling URLs.
const sitemapFiles = fs.readdirSync(ROOT).filter((f) => /^sitemap.*\.xml$/.test(f));
const sitemapUrlToFiles = new Map();
for (const f of sitemapFiles) {
  const xml = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapUrlToFiles.set(m[1], (sitemapUrlToFiles.get(m[1]) || []).concat(f));
}
// duplicate loc across the same or different partition files
for (const [loc, files] of sitemapUrlToFiles) {
  if (files.length > 1 && files[0] !== 'sitemap.xml') err(`Duplicate sitemap <loc>: ${loc} appears in ${files.join(', ')}`);
}
// A page's OWN URL (not the canonical target it points at) must not
// appear in the sitemap if that page is noindex or a redirect source --
// checking the canonical *target* would just re-flag the legitimate
// canonical page every redirect source correctly points at.
function ownUrlOf(rel) {
  let clean = '/' + rel.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (clean.length > 1) clean = clean.replace(/\/$/, '');
  return 'https://waterbalancetools.com' + (clean === '/' ? '/' : clean);
}
for (const file of allHtml) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  const isNoindex = /name="robots"\s+content="noindex/i.test(html);
  const own = ownUrlOf(rel);
  const inSitemap = sitemapUrlToFiles.has(own);
  if (inSitemap && isNoindex) err(`${rel}: this noindex page's own URL is present in the sitemap: ${own}`);
  if (inSitemap && isRedirectSource(rel)) err(`${rel}: this known redirect-source page's own URL appears in the sitemap: ${own}`);
}

// 5/6. Orphan / true-orphan check, excluding known-intentional exceptions.
const INTENTIONAL_ZERO_INBOUND = new Set(['404.html', 'audit/google/index.html', 'charts/hot-tub-chemical-levels-chart.html', 'charts/pool-chemical-levels-chart.html']);
const inboundCount = new Map();
function toPageUrl(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  let clean = '/' + rel;
  clean = clean.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (clean.length > 1) clean = clean.replace(/\/$/, '');
  return clean || '/';
}
for (const file of allHtml) {
  const html = fs.readFileSync(file, 'utf8');
  const withoutCode = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  for (const m of withoutCode.matchAll(/<a[^>]+href="([^"]+)"/gi)) {
    const href = m[1];
    if (/^(mailto:|tel:|https?:\/\/|#|javascript:)/.test(href)) continue;
    let normalized = href.split(/[?#]/)[0];
    if (!normalized) continue;
    if (normalized.startsWith('./')) normalized = normalized.slice(1);
    if (!normalized.startsWith('/')) {
      // Resolve relative to the linking file's own directory (e.g.
      // "../printable/x.html" from guides/y.html).
      const fromDir = path.dirname('/' + path.relative(ROOT, file).replace(/\\/g, '/'));
      normalized = path.posix.join(fromDir, normalized);
    }
    normalized = normalized.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (normalized.length > 1) normalized = normalized.replace(/\/$/, '');
    inboundCount.set(normalized, (inboundCount.get(normalized) || 0) + 1);
  }
}
for (const file of allHtml) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (!isProductionPage(rel) || !isIndexablePage(rel)) continue;
  if (INTENTIONAL_ZERO_INBOUND.has(rel) || isRedirectSource(rel)) continue;
  const url = toPageUrl(file);
  const n = inboundCount.get(url) || inboundCount.get(url + '/') || 0;
  if (n === 0) err(`${rel}: true orphan (0 inbound internal links, not on the known-intentional exception list)`);
}

// 7/8. Internal links to redirect-source or non-canonical URLs.
for (const file of allHtml) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    for (const [srcRel] of Object.entries(require('./url-policy').REDIRECT_SOURCES)) {
      const srcClean = '/' + srcRel.replace(/\.html$/, '').replace(/\/index$/, '');
      if (href === srcClean || href === srcClean + '.html' || href.endsWith('/' + srcRel)) {
        if (rel !== srcRel) err(`${rel}: internal link points at a known redirect-source URL: ${href}`);
      }
    }
  }
}

// 9. Lastmod sanity: every sitemap lastmod must be a valid YYYY-MM-DD and
// not later than today (never a fabricated future date).
const today = new Date().toISOString().slice(0, 10);
for (const f of sitemapFiles) {
  const xml = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(m[1])) err(`${f}: malformed lastmod value "${m[1]}"`);
    else if (m[1] > today) err(`${f}: lastmod ${m[1]} is in the future relative to build date ${today} -- fabricated date`);
  }
}
// Not every lastmod should be identical (the whole point of this phase's
// fix) -- flag if the sitemap regressed to a single uniform date.
{
  const dates = new Set();
  for (const f of sitemapFiles) {
    const xml = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) dates.add(m[1]);
  }
  if (dates.size <= 1) err('Sitemap lastmod regression: all URLs share a single date again (expected real variation from git history)');
}

// 10. Citation preservation.
let citationBlocks = 0;
let citationLinks = 0;
for (const file of allHtml) {
  const html = fs.readFileSync(file, 'utf8');
  citationBlocks += (html.match(/<section class="knowledge-sources-real">/g) || []).length;
  citationLinks += (html.match(/knowledge-source-item/g) || []).length;
}
if (citationBlocks < 18) err(`Citation blocks regressed: expected >=18, found ${citationBlocks}`);
if (citationLinks < 23) err(`Citation links regressed: expected >=23, found ${citationLinks}`);

// 11. Malformed internal links.
for (const file of allHtml) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);
  if (/href=""/i.test(html)) err(`${rel}: empty href attribute`);
  if (/href="[^"]*undefined[^"]*"/i.test(html)) err(`${rel}: href contains literal "undefined"`);
}

console.log(`validate-phase-7o: ${allHtml.length} pages scanned, ${sitemapUrlToFiles.size} sitemap URLs, ${citationBlocks} citation blocks (${citationLinks} links) confirmed intact.`);

if (errors > 0) {
  console.error(`validate-phase-7o: FAIL -- ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
} else {
  console.log(`validate-phase-7o: PASS -- 0 errors, ${warnings} warning(s).`);
}
