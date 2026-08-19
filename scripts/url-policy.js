'use strict';
/**
 * url-policy.js
 *
 * Centralized production-URL classification for WaterBalanceTools.
 * Every generator/validator that needs to decide "is this a real,
 * indexable, sitemap-worthy page" must go through this module instead of
 * re-implementing its own filesystem-walk-and-guess logic.
 *
 * Classification fails closed: a new top-level directory that is not on
 * either the production-content or internal-tooling allowlist is NOT
 * treated as production, and is NOT sitemap-eligible, until someone
 * deliberately adds it to one of the lists below. This is intentional --
 * see Phase 7C Step 3 ("Do NOT make every unknown root-level HTML file
 * automatically indexable").
 */

const fs = require('fs');
const path = require('path');
const urlEngine = require('../js/url/url-engine');

const ROOT = path.join(__dirname, '..');

// Directories containing genuine reader-facing production content.
const PRODUCTION_CONTENT_DIRS = new Set([
  'calculators', 'programmatic', 'guides', 'charts', 'academy', 'formulas',
  'glossary', 'entities', 'reference', 'comparisons', 'resources',
  'legal', 'about', 'methodology', 'editorial', 'maintenance',
  'printable', 'printables', 'releases', 'revisions', 'provenance',
]);

// Directories that physically contain .html files but are internal
// tooling/dashboards, never reader-facing production content.
const INTERNAL_TOOLING_DIRS = new Set([
  'reports', 'audit', 'qa', 'tools', 'search',
]);

// Directories that are never pages at all: template sources, includes,
// generator source, data, static assets.
const NON_PAGE_DIRS = new Set([
  'templates', 'partials', 'components', 'scripts', 'data', 'js', 'public',
  'lib', 'functions', 'docs', 'node_modules', '.git', '.claude', 'assets',
]);

// Root-level files (no subdirectory) that are approved production pages.
const ROOT_PRODUCTION_FILES = new Set([
  'index.html',
  'all-pages.html',
  'pool-chemistry-system.html',
  'hot-tub-chemical-levels-chart.html',
  'hot-tub-chlorine-levels-chart.html',
  'pool-alkalinity-levels-chart.html',
  'pool-chemical-levels-chart.html',
  'pool-chlorine-levels-chart.html',
  'pool-cya-levels-chart.html',
  'pool-ph-levels-chart.html',
  'salt-water-pool-chemical-levels-chart.html',
]);

// Root-level files that exist but are explicitly non-indexable utility
// pages (not production content, not internal tooling either).
const ROOT_UTILITY_FILES = new Set(['404.html']);

// Phase 7C URL consolidation registry: retired duplicate/legacy URLs and
// their canonical replacement. A path in this map is a permanent redirect
// source -- it must never be production/indexable/sitemap-eligible again,
// regardless of whether the physical file still exists on disk.
const REDIRECT_SOURCES = {
  'calculators/volume-calculator.html': '/calculators/pool-volume-calculator',
  'charts/hot-tub-chemical-levels-chart.html': '/hot-tub-chemical-levels-chart',
  'charts/pool-chemical-levels-chart.html': '/pool-chemical-levels-chart',
};

function normalize(relPath) {
  return relPath.replace(/\\/g, '/').replace(/^\.\//, '');
}

function topDir(relPath) {
  const parts = normalize(relPath).split('/');
  return parts.length > 1 ? parts[0] : null;
}

function isRedirectSource(relPath) {
  return Object.prototype.hasOwnProperty.call(REDIRECT_SOURCES, normalize(relPath));
}

function redirectTarget(relPath) {
  return REDIRECT_SOURCES[normalize(relPath)] || null;
}

// Alias: in this codebase "legacy URL" and "redirect source" are the same
// registry -- a URL enters REDIRECT_SOURCES precisely because it was
// identified as a legacy/duplicate URL that must resolve to one
// authoritative destination (Phase 7C Steps 6-7).
function isLegacyUrl(relPath) {
  return isRedirectSource(relPath);
}

function isNonPage(relPath) {
  const dir = topDir(relPath);
  if (dir && NON_PAGE_DIRS.has(dir)) return true;
  return false;
}

function isInternalTooling(relPath) {
  const dir = topDir(relPath);
  return !!(dir && INTERNAL_TOOLING_DIRS.has(dir));
}

/**
 * Path-only decision: is this the kind of file that is allowed to be a
 * production reader-facing page, independent of its current robots meta or
 * canonical tag? Fails closed for any directory not on an explicit list.
 */
function isProductionPage(relPath) {
  const clean = normalize(relPath);
  if (isNonPage(clean)) return false;
  if (isRedirectSource(clean)) return false;

  const dir = topDir(clean);
  if (dir === null) {
    // root-level file
    if (ROOT_UTILITY_FILES.has(clean)) return false;
    return ROOT_PRODUCTION_FILES.has(clean);
  }
  if (INTERNAL_TOOLING_DIRS.has(dir)) return false;
  if (PRODUCTION_CONTENT_DIRS.has(dir)) return true;
  // Unknown directory: fail closed, not production.
  return false;
}

function readHtml(relPath) {
  try {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  } catch (e) {
    return null;
  }
}

function robotsMetaOf(html) {
  const m = html && html.match(/<meta[^>]+name=["']robots["'][^>]*>/i);
  if (!m) return null;
  const c = m[0].match(/content=["']([^"']*)["']/i);
  return c ? c[1] : null;
}

function canonicalOf(html) {
  const m = html && html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
  if (!m) return null;
  const h = m[0].match(/href=["']([^"']*)["']/i);
  return h ? h[1] : null;
}

/**
 * isIndexablePage(relPath, html?) -- pass html to avoid a re-read when the
 * caller already has the file content in memory (generators/validators
 * processing hundreds of files should always pass it).
 */
function isIndexablePage(relPath, html) {
  const clean = normalize(relPath);
  if (!isProductionPage(clean)) return false;
  const content = html !== undefined ? html : readHtml(clean);
  if (content === null) return false;
  const robots = robotsMetaOf(content);
  if (robots && /noindex/i.test(robots)) return false;
  return true;
}

/**
 * isSitemapEligible(relPath, html?) -- the single source of truth
 * generate-sitemaps.js must call for every candidate URL.
 */
function expectedCanonicalFor(relPath) {
  return urlEngine.canonicalUrl(urlEngine.buildUrl(relPath));
}

function isSitemapEligible(relPath, html) {
  const clean = normalize(relPath);
  if (isRedirectSource(clean)) return false;
  if (!isIndexablePage(clean, html)) return false;
  const content = html !== undefined ? html : readHtml(clean);
  if (content === null) return false;
  const canonical = canonicalOf(content);
  if (!canonical) return false;
  // Self-canonical only: a sitemap URL whose canonical points elsewhere
  // (a CANONICAL_POINTS_ELSEWHERE contradiction) must never enter the
  // sitemap -- the canonical target is the one true sitemap-worthy URL.
  const expected = expectedCanonicalFor(clean);
  if (canonical.replace(/\/$/, '') !== expected.replace(/\/$/, '')) return false;
  return true;
}

module.exports = {
  ROOT,
  PRODUCTION_CONTENT_DIRS,
  INTERNAL_TOOLING_DIRS,
  NON_PAGE_DIRS,
  ROOT_PRODUCTION_FILES,
  REDIRECT_SOURCES,
  isProductionPage,
  isIndexablePage,
  isSitemapEligible,
  isInternalTooling,
  isNonPage,
  isLegacyUrl,
  isRedirectSource,
  redirectTarget,
  robotsMetaOf,
  canonicalOf,
  expectedCanonicalFor,
  topDir,
  normalize,
};
