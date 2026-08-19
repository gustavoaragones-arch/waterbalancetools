#!/usr/bin/env node
'use strict';
/**
 * validate-url-indexation.js
 *
 * Phase 7C build-time gate: enforces one unambiguous indexation model for
 * every production URL, on top of the centralized classification in
 * scripts/url-policy.js.
 *
 * Detects:
 *   - missing canonical on an indexable production page
 *   - canonical pointing to a URL that does not resolve to any known page
 *   - canonical pointing to a known redirect source
 *   - canonical pointing to a page that is itself noindex
 *   - sitemap URL that is noindex
 *   - sitemap URL with a missing canonical
 *   - sitemap URL that is a redirect source
 *   - sitemap URL whose canonical does not match the sitemap URL
 *   - internal tooling page that is indexable
 *   - internal tooling page present in any sitemap
 *   - duplicate tool/legacy URLs still indexable (both sides of a
 *     REDIRECT_SOURCES pair indexable at once)
 *   - internal links (from production pages) pointing at a retired/legacy
 *     redirect-source URL instead of its canonical destination
 *
 * Exit code 1 (non-zero) on any violation. Writes
 * reports/phase-7c/URL-VALIDATION-RESULTS.json.
 */

const fs = require('fs');
const path = require('path');
const urlPolicy = require('./url-policy');

const ROOT = urlPolicy.ROOT;

function walkHtmlFiles(dir, out) {
  out = out || [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full);
    if (entry.isDirectory()) {
      const top = rel.split(path.sep)[0];
      if (urlPolicy.NON_PAGE_DIRS.has(top)) continue;
      walkHtmlFiles(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(rel.replace(/\\/g, '/'));
    }
  }
  return out;
}

function readHtml(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function extractLinks(html) {
  return [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
}

// Build a lookup of every discovered page path (with/without .html, with/
// without index.html) -> relPath, for resolving hrefs and canonicals.
function buildPathLookup(allFiles) {
  const lookup = new Map();
  for (const rel of allFiles) {
    const isDirIndex = rel === 'index.html' || rel.endsWith('/index.html');
    const noExt = isDirIndex ? rel.slice(0, -'index.html'.length) : rel.replace(/\.html$/, '');
    lookup.set(noExt.replace(/\/$/, ''), rel);
    lookup.set(rel, rel);
    if (noExt === '') lookup.set('', rel);
  }
  return lookup;
}

function resolveUrlToRelPath(urlOrPath, lookup) {
  let p = String(urlOrPath || '').trim();
  if (/^https?:\/\//i.test(p)) {
    if (!/waterbalancetools\.com/i.test(p)) return null;
    p = p.replace(/^https?:\/\/[^/]+/i, '');
  }
  p = p.split('#')[0].split('?')[0];
  if (p.startsWith('/')) p = p.slice(1);
  p = p.replace(/\/$/, '');
  const candidates = [p, p + '.html', p + '/index.html', p === '' ? 'index.html' : null].filter(Boolean);
  for (const c of candidates) {
    if (lookup.has(c)) return lookup.get(c);
  }
  return null;
}

function sitemapFiles() {
  return fs.readdirSync(ROOT).filter((f) => /^sitemap.*\.xml$/.test(f) && f !== 'sitemap.xml');
}

function collectSitemapUrls() {
  const out = [];
  for (const f of sitemapFiles()) {
    const xml = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      out.push({ url: m[1].trim(), file: f });
    }
  }
  return out;
}

function run() {
  const violations = [];
  const allFiles = walkHtmlFiles(ROOT);
  const lookup = buildPathLookup(allFiles);
  const htmlCache = new Map();
  const getHtml = (rel) => {
    if (!htmlCache.has(rel)) htmlCache.set(rel, readHtml(rel));
    return htmlCache.get(rel);
  };

  // ---- Per-page canonical/indexability checks --------------------------
  for (const rel of allFiles) {
    if (!urlPolicy.isProductionPage(rel)) continue;
    const html = getHtml(rel);
    const robots = urlPolicy.robotsMetaOf(html);
    const isNoindex = !!(robots && /noindex/i.test(robots));
    const canonical = urlPolicy.canonicalOf(html);
    const indexable = urlPolicy.isIndexablePage(rel, html);

    if (indexable && !canonical) {
      violations.push({ rule: 'MISSING_CANONICAL', file: rel, detail: 'Indexable production page has no <link rel="canonical">.' });
      continue;
    }
    if (!canonical) continue;

    const canonicalRel = resolveUrlToRelPath(canonical, lookup);
    if (!canonicalRel) {
      violations.push({ rule: 'CANONICAL_TO_NONEXISTENT_PAGE', file: rel, detail: `Canonical "${canonical}" does not resolve to any known page.` });
      continue;
    }
    if (urlPolicy.isRedirectSource(canonicalRel) && canonicalRel !== rel) {
      violations.push({ rule: 'CANONICAL_TO_REDIRECT_SOURCE', file: rel, detail: `Canonical points to "${canonicalRel}", which is itself a retired redirect source.` });
    }
    if (canonicalRel !== rel) {
      const targetHtml = getHtml(canonicalRel);
      const targetRobots = urlPolicy.robotsMetaOf(targetHtml);
      if (targetRobots && /noindex/i.test(targetRobots)) {
        violations.push({ rule: 'CANONICAL_TO_NOINDEX_PAGE', file: rel, detail: `Canonical target "${canonicalRel}" is itself noindex.` });
      }
    }
    if (!isNoindex && !urlPolicy.isRedirectSource(rel) && canonicalRel === rel) {
      // Class A page: fine, self-canonical + indexable.
    }
  }

  // ---- Internal tooling indexability -------------------------------------
  for (const rel of allFiles) {
    if (!urlPolicy.isInternalTooling(rel)) continue;
    const html = getHtml(rel);
    if (urlPolicy.isIndexablePage(rel, html)) {
      violations.push({ rule: 'INTERNAL_TOOLING_INDEXABLE', file: rel, detail: 'Internal tooling page is indexable (missing or non-noindex robots meta).' });
    }
  }

  // ---- Duplicate/legacy URL pairs ----------------------------------------
  // isIndexablePage() always returns false for a registered redirect source
  // by definition (isProductionPage rejects it) -- that tells us nothing
  // about whether the physical file was actually left in a safe (noindex)
  // state. Check its raw robots meta directly instead.
  for (const [sourceRel] of Object.entries(urlPolicy.REDIRECT_SOURCES)) {
    if (!allFiles.includes(sourceRel)) continue;
    const html = getHtml(sourceRel);
    const robots = urlPolicy.robotsMetaOf(html);
    if (!robots || !/noindex/i.test(robots)) {
      violations.push({ rule: 'DUPLICATE_URL_STILL_INDEXABLE', file: sourceRel, detail: `Retired duplicate/legacy URL has robots="${robots || '(none)'}"; must be noindex (redirect handles removal from search, but the file itself must not silently become indexable again).` });
    }
  }

  // ---- Sitemap checks -----------------------------------------------------
  const sitemapEntries = collectSitemapUrls();
  for (const { url, file } of sitemapEntries) {
    const rel = resolveUrlToRelPath(url, lookup);
    if (!rel) {
      violations.push({ rule: 'SITEMAP_URL_NOT_FOUND', file, detail: `Sitemap URL "${url}" does not resolve to any known page.` });
      continue;
    }
    if (!urlPolicy.isProductionPage(rel)) {
      violations.push({ rule: 'SITEMAP_URL_NOT_PRODUCTION', file, detail: `Sitemap URL "${url}" (${rel}) is not classified as production content.` });
      continue;
    }
    if (urlPolicy.isInternalTooling(rel)) {
      violations.push({ rule: 'INTERNAL_TOOLING_IN_SITEMAP', file, detail: `Sitemap URL "${url}" is internal tooling.` });
    }
    if (urlPolicy.isRedirectSource(rel)) {
      violations.push({ rule: 'SITEMAP_URL_IS_REDIRECT', file, detail: `Sitemap URL "${url}" is a redirect source.` });
    }
    const html = getHtml(rel);
    const robots = urlPolicy.robotsMetaOf(html);
    if (robots && /noindex/i.test(robots)) {
      violations.push({ rule: 'SITEMAP_URL_NOINDEX', file, detail: `Sitemap URL "${url}" (${rel}) is noindex.` });
    }
    const canonical = urlPolicy.canonicalOf(html);
    if (!canonical) {
      violations.push({ rule: 'SITEMAP_URL_MISSING_CANONICAL', file, detail: `Sitemap URL "${url}" (${rel}) has no canonical tag.` });
    } else if (canonical.replace(/\/$/, '') !== url.replace(/\/$/, '')) {
      violations.push({ rule: 'SITEMAP_URL_CANONICAL_MISMATCH', file, detail: `Sitemap URL "${url}" canonical is "${canonical}", not self.` });
    }
  }

  // ---- Internal links to retired URLs ------------------------------------
  const retiredUrlPaths = new Set(
    Object.keys(urlPolicy.REDIRECT_SOURCES).map((rel) => {
      const isDirIndex = rel.endsWith('/index.html');
      const noExt = isDirIndex ? rel.slice(0, -'index.html'.length).replace(/\/$/, '') : rel.replace(/\.html$/, '');
      return '/' + noExt;
    })
  );
  for (const rel of allFiles) {
    if (!urlPolicy.isProductionPage(rel)) continue;
    if (urlPolicy.isRedirectSource(rel)) continue; // the retired page's own defense-in-depth canonical is checked above
    const html = getHtml(rel);
    for (const href of extractLinks(html)) {
      let p = href.split('#')[0].split('?')[0];
      if (/^https?:\/\//i.test(p)) {
        if (!/waterbalancetools\.com/i.test(p)) continue;
        p = p.replace(/^https?:\/\/[^/]+/i, '');
      }
      if (!p.startsWith('/')) continue;
      p = p.replace(/\.html$/, '').replace(/\/$/, '') || '/';
      if (retiredUrlPaths.has(p)) {
        violations.push({ rule: 'INTERNAL_LINK_TO_RETIRED_URL', file: rel, detail: `Links to retired URL "${p}" instead of its canonical destination.` });
      }
    }
  }

  return { violations, files_scanned: allFiles.length, sitemap_urls_checked: sitemapEntries.length };
}

function main() {
  const { violations, files_scanned, sitemap_urls_checked } = run();
  const outDir = path.join(ROOT, 'reports', 'phase-7c');
  fs.mkdirSync(outDir, { recursive: true });

  const byRule = {};
  for (const v of violations) byRule[v.rule] = (byRule[v.rule] || 0) + 1;

  const result = {
    timestamp: new Date().toISOString(),
    files_scanned,
    sitemap_urls_checked,
    total_violations: violations.length,
    violations_by_rule: byRule,
    violations,
    status: violations.length === 0 ? 'PASS' : 'FAIL',
  };
  fs.writeFileSync(path.join(outDir, 'URL-VALIDATION-RESULTS.json'), JSON.stringify(result, null, 2) + '\n');

  if (violations.length === 0) {
    console.log(`validate-url-indexation: PASS -- ${files_scanned} pages, ${sitemap_urls_checked} sitemap URLs, 0 violations.`);
    return;
  }
  console.error(`validate-url-indexation: FAIL -- ${violations.length} violation(s).\n`);
  for (const v of violations) {
    console.error(`ERROR [${v.rule}] ${v.file}: ${v.detail}`);
  }
  console.error('\nViolation counts by rule:', byRule);
  process.exitCode = 1;
}

if (require.main === module) {
  main();
}

module.exports = { run, resolveUrlToRelPath, buildPathLookup, walkHtmlFiles };
