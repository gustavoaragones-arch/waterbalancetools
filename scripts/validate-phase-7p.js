#!/usr/bin/env node
'use strict';
/**
 * validate-phase-7p.js (Phase 7P, Step 21)
 *
 * Checks specific to this phase's search-demand-gap work: every newly
 * created page has a documented decision, distinct intent, correct URL
 * policy, correct discovery path, no redirect-source links, no
 * unsupported claims, correct schema, and no regression to prior-phase
 * invariants (duplicate titles/descriptions, redirect-source registry,
 * programmatic page count, calculator formulas).
 */
const fs = require('fs');
const path = require('path');
const { isRedirectSource, isIndexablePage, isProductionPage, REDIRECT_SOURCES, topDir } = require('./url-policy');

const ROOT = path.join(__dirname, '..');
let errors = 0;
let warnings = 0;
const err = (msg) => { console.error('ERROR: ' + msg); errors++; };
const warn = (msg) => { console.warn('WARN: ' + msg); warnings++; };

// Pages this phase actually created (must match CONTENT-BLUEPRINTS.md).
const CREATED_PAGES = [
  { rel: 'academy/fundamentals/new-pool-startup-chemistry.html', url: '/academy/fundamentals/new-pool-startup-chemistry' },
];

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

function toPageUrl(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  let clean = '/' + rel;
  clean = clean.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (clean.length > 1) clean = clean.replace(/\/$/, '');
  return clean || '/';
}

// 1/2. Every created page has a documented candidate decision + distinct intent.
const blueprintPath = path.join(ROOT, 'reports', 'phase-7p', 'CONTENT-BLUEPRINTS.md');
const revalidationPath = path.join(ROOT, 'reports', 'phase-7p', 'SEARCH-GAP-REVALIDATION.csv');
const blueprint = fs.existsSync(blueprintPath) ? fs.readFileSync(blueprintPath, 'utf8') : '';
const revalidation = fs.existsSync(revalidationPath) ? fs.readFileSync(revalidationPath, 'utf8') : '';
if (!blueprint) err('CONTENT-BLUEPRINTS.md missing');
if (!revalidation) err('SEARCH-GAP-REVALIDATION.csv missing');
for (const p of CREATED_PAGES) {
  if (!blueprint.includes(p.url)) err(`${p.rel}: no blueprint entry found for ${p.url}`);
  if (!/CREATE/.test(revalidation)) err('No CREATE classification found in SEARCH-GAP-REVALIDATION.csv for any created page');
  if (!blueprint.toLowerCase().includes('differentiation')) warn(`${p.rel}: blueprint should state an explicit differentiation statement`);
}

// 3/4. No candidate duplicates an existing canonical page (title/H1 uniqueness).
const canonicalFiles = allHtml.filter((f) => {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  return isProductionPage(rel) && isIndexablePage(rel);
});
function extract(re, html) { const m = html.match(re); return m ? m[1].trim() : ''; }
const titleMap = new Map();
const h1Map = new Map();
for (const f of canonicalFiles) {
  const html = fs.readFileSync(f, 'utf8');
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  const title = extract(/<title>([^<]*)<\/title>/i, html);
  const h1 = extract(/<h1[^>]*>([\s\S]*?)<\/h1>/i, html).replace(/<[^>]+>/g, '').trim();
  if (title) { if (!titleMap.has(title)) titleMap.set(title, []); titleMap.get(title).push(rel); }
  if (h1) { if (!h1Map.has(h1)) h1Map.set(h1, []); h1Map.get(h1).push(rel); }
}
let dupTitleGroups = 0, dupDescGroups = 0;
for (const [title, files] of titleMap) if (files.length > 1) { dupTitleGroups++; err(`Duplicate title "${title}": ${files.join(', ')}`); }
for (const p of CREATED_PAGES) {
  const full = path.join(ROOT, p.rel);
  const html = fs.readFileSync(full, 'utf8');
  const h1 = extract(/<h1[^>]*>([\s\S]*?)<\/h1>/i, html).replace(/<[^>]+>/g, '').trim();
  const dupes = (h1Map.get(h1) || []).filter((f) => f !== p.rel);
  if (dupes.length > 0) err(`${p.rel}: H1 "${h1}" duplicates ${dupes.join(', ')} -- possible cannibalization`);
}

// 19/20. No duplicate meta descriptions sitewide.
const descMap = new Map();
for (const f of canonicalFiles) {
  const html = fs.readFileSync(f, 'utf8');
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  const desc = extract(/<meta name="description" content="([^"]*)"/i, html);
  if (desc) { if (!descMap.has(desc)) descMap.set(desc, []); descMap.get(desc).push(rel); }
}
for (const [desc, files] of descMap) if (files.length > 1) { dupDescGroups++; err(`Duplicate description (${files.length}x): ${files.join(', ')}`); }

// 5/6/7. Correct URL policy / canonical / robots for each created page.
const sitemapFiles = fs.readdirSync(ROOT).filter((f) => /^sitemap.*\.xml$/.test(f));
const sitemapUrls = new Set();
for (const f of sitemapFiles) {
  const xml = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of xml.matchAll(/<loc>https:\/\/waterbalancetools\.com([^<]*)<\/loc>/g)) {
    let u = m[1] || '/';
    if (u.length > 1) u = u.replace(/\/$/, '');
    sitemapUrls.add(u || '/');
  }
}
for (const p of CREATED_PAGES) {
  const full = path.join(ROOT, p.rel);
  if (!fs.existsSync(full)) { err(`${p.rel}: created page does not exist on disk`); continue; }
  const html = fs.readFileSync(full, 'utf8');
  if (isRedirectSource(p.rel)) err(`${p.rel}: newly created page must not be a redirect source`);
  if (!isProductionPage(p.rel) || !isIndexablePage(p.rel)) err(`${p.rel}: not classified as a production+indexable page by url-policy.js`);
  const canonical = extract(/<link rel="canonical" href="([^"]*)"/i, html);
  const expectedCanonical = 'https://waterbalancetools.com' + p.url;
  if (canonical !== expectedCanonical) err(`${p.rel}: canonical "${canonical}" does not match expected "${expectedCanonical}"`);
  const robots = extract(/<meta name="robots" content="([^"]*)"/i, html);
  if (robots && /noindex/.test(robots)) err(`${p.rel}: robots is noindex, expected index,follow`);
  // 8. Sitemap representation.
  if (!sitemapUrls.has(p.url)) err(`${p.rel}: ${p.url} not found in sitemap`);
  // 13. No redirect-source internal links.
  const hrefs = [...html.matchAll(/<a[^>]+href="([^"]+)"/gi)].map((m) => m[1]);
  for (const href of hrefs) {
    if (/^(mailto:|tel:|https?:\/\/|#|javascript:)/.test(href)) continue;
    let clean = href.split(/[?#]/)[0].replace(/^\.\.?\//, '');
    for (const [srcRel] of Object.entries(REDIRECT_SOURCES)) {
      const srcUrl = '/' + srcRel.replace(/\.html$/, '');
      if (clean === srcRel || clean.endsWith('/' + srcRel) || href.includes(srcUrl)) {
        err(`${p.rel}: internal link "${href}" points at a known redirect source (${srcRel})`);
      }
    }
  }
  // 12. No broken internal links (relative hrefs must resolve to a real file).
  const dir = path.dirname(full);
  for (const href of hrefs) {
    if (/^(mailto:|tel:|https?:\/\/|#|javascript:)/.test(href)) continue;
    let clean = href.split(/[?#]/)[0];
    let targetPath;
    if (clean.startsWith('/')) targetPath = path.join(ROOT, clean);
    else targetPath = path.join(dir, clean);
    const candidates = [targetPath, targetPath + '.html', path.join(targetPath, 'index.html')];
    if (!candidates.some((c) => fs.existsSync(c))) err(`${p.rel}: broken link "${href}"`);
  }
  // 14. No unresolved template tokens.
  if (/\{\{[A-Z_]+\}\}/.test(html)) err(`${p.rel}: unresolved template token`);
  // 17/18. Appropriate schema, no inappropriate HowTo.
  const schemaTypes = [...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
  if (!schemaTypes.includes('Article') && !schemaTypes.includes('DefinedTerm') && !schemaTypes.includes('WebPage')) {
    warn(`${p.rel}: no Article/DefinedTerm/WebPage schema found`);
  }
  if (schemaTypes.includes('HowTo')) err(`${p.rel}: inappropriate HowTo schema on an explanatory academy article`);
  // 16. Citation/provenance: source referenced in chemistry-sources.js registry.
  const sourcesRegistry = fs.readFileSync(path.join(ROOT, 'scripts', 'data', 'chemistry-sources.js'), 'utf8');
  if (!/phta-fresh-fill-startup-fact-sheet/.test(sourcesRegistry)) {
    err(`Provenance registry missing the source backing ${p.rel} (phta-fresh-fill-startup-fact-sheet)`);
  }
  if (!/knowledge-sources/.test(html)) err(`${p.rel}: no citation block found on a page with substantive chemistry claims`);
  // 15. Basic accessibility regression proxy: h1 exists, no empty alt on img.
  if (!/<h1[^>]*>/.test(html)) err(`${p.rel}: missing H1`);
  const imgs = [...html.matchAll(/<img[^>]*>/gi)];
  for (const img of imgs) if (!/alt="/.test(img[0])) err(`${p.rel}: <img> missing alt attribute`);
}

// 9/10/11. Discovery path, hub membership, inbound links (reuse the phase-7p crawl simulation output).
const crawlPath = path.join(ROOT, 'reports', 'phase-7p', 'CRAWL-PATH-SIMULATION.json');
if (fs.existsSync(crawlPath)) {
  const crawl = JSON.parse(fs.readFileSync(crawlPath, 'utf8'));
  for (const p of CREATED_PAGES) {
    if ((crawl.undiscovered_pages || []).includes(p.url)) err(`${p.rel}: not discoverable via contextual crawl from homepage`);
  }
} else {
  warn('reports/phase-7p/CRAWL-PATH-SIMULATION.json not found -- run scripts/phase-7p/crawl-path-simulation.js first');
}
const fundamentalsIndex = fs.readFileSync(path.join(ROOT, 'academy', 'fundamentals', 'index.html'), 'utf8');
for (const p of CREATED_PAGES) {
  if (!fundamentalsIndex.includes(p.url)) err(`${p.rel}: not linked from its category hub (academy/fundamentals/index.html)`);
}

// 22. No programmatic-family duplication regression (page count unchanged from Phase 7O.1 baseline).
const programmaticCount = allHtml.filter((f) => topDir(path.relative(ROOT, f).replace(/\\/g, '/')) === 'programmatic').length;
if (programmaticCount !== 44) err(`programmatic/ page count changed: expected 44 (unchanged from baseline), found ${programmaticCount}`);

// 23. No URL architecture regression: REDIRECT_SOURCES has exactly the 6 known entries.
const expectedRedirectSources = [
  'calculators/volume-calculator.html',
  'charts/hot-tub-chemical-levels-chart.html',
  'charts/pool-chemical-levels-chart.html',
  'printables/pool-maintenance-checklist.html',
  'printables/hot-tub-maintenance-log.html',
  'printables/airbnb-pool-turnover-checklist.html',
];
const actualRedirectSources = Object.keys(REDIRECT_SOURCES);
if (actualRedirectSources.length !== expectedRedirectSources.length || !expectedRedirectSources.every((k) => actualRedirectSources.includes(k))) {
  err(`REDIRECT_SOURCES registry changed unexpectedly: expected ${expectedRedirectSources.length} entries, found ${actualRedirectSources.length}`);
}

// 24. No page created without an approval classification (every new .html file this phase must be in CREATED_PAGES).
const { execSync } = require('child_process');
let untracked = [];
try {
  untracked = execSync('git status --short', { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter((l) => l.startsWith('??') && l.trim().endsWith('.html'))
    .map((l) => l.replace(/^\?\?\s*/, '').trim());
} catch (e) { warn('Could not run git status to check for undocumented new pages: ' + e.message); }
for (const u of untracked) {
  if (!CREATED_PAGES.some((p) => p.rel === u)) err(`Untracked new HTML file not in CREATED_PAGES / not documented: ${u}`);
}

// 25/26. No fabricated search-volume or GSC data anywhere in this phase's own reports.
const phase7pDir = path.join(ROOT, 'reports', 'phase-7p');
if (fs.existsSync(phase7pDir)) {
  for (const f of fs.readdirSync(phase7pDir)) {
    if (!/\.(csv|md|json)$/.test(f)) continue;
    const content = fs.readFileSync(path.join(phase7pDir, f), 'utf8');
    if (/search[_ -]?volume\s*[:=,]\s*\d/i.test(content)) err(`${f}: appears to contain a fabricated numeric search-volume value`);
    if (/\bgsc\b.*\d{3,}/i.test(content) && !/no gsc|no verified|not present/i.test(content)) warn(`${f}: mentions GSC alongside a large number -- verify this is not fabricated data`);
  }
}

// 27. No Spanish/French content on the created page(s).
for (const p of CREATED_PAGES) {
  const html = fs.readFileSync(path.join(ROOT, p.rel), 'utf8');
  if (/lang="(es|fr)"/i.test(html)) err(`${p.rel}: unexpected non-English lang attribute`);
}

// 28. No calculator-formula changes (formula source files untouched this phase).
let formulaFilesChanged = [];
try {
  formulaFilesChanged = execSync('git diff --name-only HEAD -- scripts/data/formulas-data.js scripts/chemistry/*.js', { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean)
    .filter((f) => !f.includes('chemistry-sources.js')); // adding a citation source record is not a formula change
} catch (e) { /* non-fatal */ }
if (formulaFilesChanged.length > 0) err(`Calculator/formula source files changed (out of scope for Phase 7P): ${formulaFilesChanged.join(', ')}`);

console.log(`validate-phase-7p: ${canonicalFiles.length} canonical pages scanned, ${CREATED_PAGES.length} page(s) created and validated, ${dupTitleGroups} duplicate title group(s), ${dupDescGroups} duplicate description group(s).`);
if (errors > 0) {
  console.error(`validate-phase-7p: FAIL -- ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
} else {
  console.log(`validate-phase-7p: PASS -- 0 errors, ${warnings} warning(s).`);
}
