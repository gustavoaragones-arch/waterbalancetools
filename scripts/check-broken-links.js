/**
 * Pre-sitemap broken-link validator.
 *
 * Detects:
 *   1. Duplicate folder segments  (/calculators/calculators/, /guides/guides/, etc.)
 *   2. Relative path over-escapes (../../../../)
 *   3. Double slashes mid-URL
 *   4. href/src targets that resolve to non-existent .html files on disk
 *
 * Exit 0 = clean.  Exit 1 = issues found (fails build when wired into pipeline).
 *
 * Usage: node scripts/check-broken-links.js [--warn-only]
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { detectUrlProblems } = require('./url-utils');

const ROOT      = path.join(__dirname, '..');
const WARN_ONLY = process.argv.includes('--warn-only');

/** Folders/files to skip entirely */
const SKIP_DIRS = new Set(['node_modules', '_site', '.git', 'assets', 'js', 'data', 'lib', 'partials', 'templates']);
const SKIP_FILES = new Set([
  'templates/programmatic-template.html',
  'components/ad.html',
  'components/global-schema.html'
]);

/** href/src patterns to ignore (external, anchor-only, mailto, javascript) */
function isExternal(href) {
  return /^(https?:|\/\/|mailto:|javascript:|#|data:)/.test(href.trim());
}

/** Collect all .html files */
function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel  = path.relative(ROOT, full).replace(/\\/g, '/');
    if (SKIP_DIRS.has(e.name) || SKIP_DIRS.has(rel.split('/')[0])) continue;
    if (e.isDirectory()) { walk(full, out); continue; }
    if (e.name.endsWith('.html') && !SKIP_FILES.has(rel)) out.push({ full, rel });
  }
}

/** Extract all href="…" and src="…" values from an HTML string */
function extractHrefs(html) {
  const re = /(?:href|src)="([^"]+)"/gi;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push(m[1]);
  }
  return out;
}

/**
 * Resolve a potentially-relative href against the page's directory.
 * Returns an absolute path string (no scheme) for checking on disk.
 */
function resolveHref(href, pageRel) {
  const h = href.trim().split(/[?#]/)[0]; // strip query/fragment
  if (!h) return null;
  if (h.startsWith('/')) return h; // already absolute path
  // Relative: resolve against page dir
  const pageDir = path.dirname(path.join(ROOT, pageRel));
  const resolved = path.resolve(pageDir, h);
  return '/' + path.relative(ROOT, resolved).replace(/\\/g, '/');
}

/**
 * Check whether an absolute-path href maps to an existing file.
 * Handles both /foo/bar and /foo/bar.html.
 */
function fileExists(absHref) {
  // Try exact path first (might already have .html)
  let candidate = path.join(ROOT, absHref.replace(/^\//, ''));
  if (fs.existsSync(candidate)) return true;
  // Try adding .html
  candidate = candidate + '.html';
  if (fs.existsSync(candidate)) return true;
  return false;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

const files = [];
walk(ROOT, files);

const issues = [];   // { file, href, problem }

for (const { full, rel } of files) {
  const html = fs.readFileSync(full, 'utf8');
  const hrefs = extractHrefs(html);

  for (const href of hrefs) {
    if (isExternal(href)) continue;

    // 1. Pattern problems (duplicate folders, deep escapes, double slashes)
    const problems = detectUrlProblems(href);
    for (const p of problems) {
      issues.push({ file: rel, href, problem: p });
    }

    // 2. Broken file reference (internal relative or absolute paths only)
    //    Skip bare anchors and non-HTML links (CSS, images, etc.)
    if (href.startsWith('#') || href.startsWith('?')) continue;
    if (/\.(css|js|svg|png|jpg|jpeg|gif|webp|ico|pdf|xml|json|txt)(\?|$)/i.test(href)) continue;

    const absHref = resolveHref(href, rel);
    if (!absHref) continue;

    // Only validate paths that look like HTML pages
    const endsHtml = absHref.endsWith('.html') || !absHref.includes('.');
    if (!endsHtml) continue;

    if (!fileExists(absHref)) {
      issues.push({ file: rel, href, problem: 'broken-href:' + absHref });
    }
  }
}

// ── REPORT ────────────────────────────────────────────────────────────────────

if (issues.length === 0) {
  console.log('check-broken-links: ✓ No issues found (' + files.length + ' pages checked)');
  process.exit(0);
}

// Group by file for readability
const byFile = {};
for (const { file, href, problem } of issues) {
  (byFile[file] = byFile[file] || []).push({ href, problem });
}

console.error('\ncheck-broken-links: ' + issues.length + ' issue(s) in ' + Object.keys(byFile).length + ' file(s)\n');

for (const [file, list] of Object.entries(byFile)) {
  console.error('  ' + file);
  for (const { href, problem } of list) {
    console.error('    [' + problem + '] ' + href);
  }
}

console.error('');

if (WARN_ONLY) {
  console.warn('check-broken-links: running in --warn-only mode, not failing build');
  process.exit(0);
} else {
  process.exit(1);
}
