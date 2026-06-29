/**
 * inject-nav.js
 *
 * Replaces the entire <header class="site-header">…</header> block on every
 * HTML page with the canonical 6-pillar header:
 *   Calculator | Resources | Charts | Academy | Guides | About
 * Plus a search icon and mobile hamburger button.
 *
 * Also injects /js/nav.js (hamburger logic) into <head> if not present.
 *
 * Idempotent — detects already-canonical headers via a sentinel attribute.
 * Run: node scripts/inject-nav.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// ── Canonical header ──────────────────────────────────────────────────────────

const SEARCH_SVG = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.6"/><path d="M13 13l3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;

const HEADER = `  <header class="site-header" data-canonical-nav="v2">
    <a href="/" class="logo-link">
      <img src="/public/logo.svg" alt="WaterBalanceTools" class="logo" width="132" height="40">
    </a>
    <nav class="nav" id="site-nav" aria-label="Primary navigation">
      <a href="/calculators/chemical-calculator">Calculator</a>
      <a href="/resources/">Resources</a>
      <a href="/pool-chemical-levels-chart">Charts</a>
      <a href="/academy/">Academy</a>
      <a href="/guides/pool-chemistry-basics">Guides</a>
      <a href="/about/">About</a>
    </nav>
    <div class="nav-end">
      <a href="/search/" class="nav-search" aria-label="Search site">
        ${SEARCH_SVG}
      </a>
      <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>`;

// ── File collection ───────────────────────────────────────────────────────────

const SKIP_DIRS = new Set([
  'node_modules', 'scripts', 'assets', 'js', 'functions', 'data', 'lib',
  'templates', 'partials',
]);

function collectHtmlFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      collectHtmlFiles(full, results);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

// ── Replacement ───────────────────────────────────────────────────────────────

// Matches the entire <header class="site-header"> … </header> block.
const HEADER_RE = /<header\s[^>]*class="site-header"[^>]*>[\s\S]*?<\/header>/i;
const ALREADY_CANONICAL_RE = /data-canonical-nav="v2"/;

let updated = 0;
let skipped = 0;

for (const filePath of collectHtmlFiles(ROOT)) {
  let html = fs.readFileSync(filePath, 'utf8');

  if (!HEADER_RE.test(html)) { skipped++; continue; }
  if (ALREADY_CANONICAL_RE.test(html)) { skipped++; continue; }

  let newHtml = html.replace(HEADER_RE, HEADER);

  // Inject nav.js script into <head> if not already present
  if (!newHtml.includes('nav.js') && newHtml.includes('</body>')) {
    newHtml = newHtml.replace('</body>', '  <script src="/js/nav.js" defer></script>\n</body>');
  }

  if (newHtml === html) { skipped++; continue; }

  fs.writeFileSync(filePath, newHtml, 'utf8');
  updated++;
}

console.log(
  `inject-nav: updated ${updated} pages` +
  (skipped ? ` (${skipped} already canonical or no header)` : '')
);
