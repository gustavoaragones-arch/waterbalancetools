/**
 * generate-breadcrumbs.js
 *
 * Injects a <nav class="breadcrumb"> + BreadcrumbList JSON-LD schema into
 * every HTML page that:
 *   - has a <header class="site-header"> (is a site page, not a raw template)
 *   - does not already have a breadcrumb nav
 *   - has a URL depth ≥ 2 (skip homepage which has no useful breadcrumb)
 *
 * Runs after all content generators and the nav injector.
 * Idempotent — detects and skips pages that already have breadcrumbs.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const {
  buildBreadcrumb, walkHtml, ROOT, titleCase,
} = require('./template-utils');

// ── Page title extractor ──────────────────────────────────────────────────────

function getPageTitle(html) {
  // Try H1 first (most accurate for leaf pages)
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return h1[1].replace(/<[^>]+>/g, '').replace(/&amp;/g,'&').trim();
  // Fall back to <title>
  const t = html.match(/<title>([^<]+)<\/title>/i);
  if (t) return t[1].replace(/ \| WaterBalanceTools$/, '').replace(/ \| .*$/, '').trim();
  return '';
}

// ── Skip rules ────────────────────────────────────────────────────────────────

const SKIP_PATTERNS = [
  /^programmatic\/templates/,
  /^templates\//,
  /^partials\//,
  /^node_modules\//,
  /^\.git\//,
];

function shouldSkip(relPath) {
  return SKIP_PATTERNS.some(re => re.test(relPath));
}

// ── Run ───────────────────────────────────────────────────────────────────────

let updated = 0;
let skipped = 0;

for (const fullPath of walkHtml(ROOT)) {
  const relPath = path.relative(ROOT, fullPath).replace(/\\/g, '/');
  if (shouldSkip(relPath)) { skipped++; continue; }

  let html = fs.readFileSync(fullPath, 'utf8');

  // Only process pages with a site-header
  if (!html.includes('class="site-header"')) { skipped++; continue; }

  // Already has breadcrumb — skip (idempotent)
  if (html.includes('class="breadcrumb"')) { skipped++; continue; }

  // Determine URL path from file path
  const cleanPath = relPath.replace(/\.html$/, '').replace(/\/index$/, '');
  const segments = cleanPath.split('/').filter(Boolean);

  // Skip single-segment or homepage (no meaningful breadcrumb trail)
  if (segments.length < 1) { skipped++; continue; }

  // Get best available page title
  const pageTitle = getPageTitle(html) || titleCase(segments[segments.length - 1].replace(/-/g, ' '));

  const bc = buildBreadcrumb(cleanPath, pageTitle);
  if (!bc || !bc.nav) { skipped++; continue; }

  // Inject breadcrumb + schema:
  //   - Schema goes in <head> just before </head>
  //   - Nav goes between </header> and <main (or immediately after </header>)
  let newHtml = html;

  // 1. Inject schema into <head>
  if (!newHtml.includes('BreadcrumbList') && bc.schema) {
    newHtml = newHtml.replace('</head>', `  ${bc.schema}\n</head>`);
  }

  // 2. Inject nav element after </header>
  const headerEnd = newHtml.indexOf('</header>');
  if (headerEnd !== -1) {
    const insertPos = headerEnd + '</header>'.length;
    newHtml = newHtml.slice(0, insertPos) + '\n\n  ' + bc.nav + '\n' + newHtml.slice(insertPos);
  }

  if (newHtml !== html) {
    fs.writeFileSync(fullPath, newHtml, 'utf8');
    updated++;
  } else {
    skipped++;
  }
}

console.log(
  `generate-breadcrumbs: updated ${updated} pages` +
  (skipped ? ` (${skipped} skipped)` : '')
);
