/**
 * inject-nav.js
 *
 * Normalises the site-wide navigation bar to the canonical 4-pillar nav
 * using root-relative URLs.  Identical to inject-footer.js in approach —
 * finds any existing <nav class="nav">…</nav> block inside the site-header
 * and replaces it with the canonical markup.
 *
 * Idempotent — safe to run on every build cycle.
 * Run: node scripts/inject-nav.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// ── Canonical nav ─────────────────────────────────────────────────────────────

const NAV = `    <nav class="nav">
      <a href="/calculators/chemical-calculator">Calculator</a>
      <a href="/resources/">Resources</a>
      <a href="/pool-chemical-levels-chart">Charts</a>
      <a href="/guides/pool-chemistry-basics">Guide</a>
    </nav>`;

// ── File collection ───────────────────────────────────────────────────────────

function collectHtmlFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules, scripts, assets
      if (['node_modules', 'scripts', 'assets', 'js', 'functions'].includes(entry.name)) continue;
      collectHtmlFiles(full, results);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

// ── Injection ─────────────────────────────────────────────────────────────────

// Match the <nav class="nav">…</nav> block inside a site-header.
// We match lazily so we don't accidentally consume multiple navs.
const NAV_RE = /<nav\s+class="nav">[\s\S]*?<\/nav>/i;

let updated = 0;
let skipped = 0;

for (const filePath of collectHtmlFiles(ROOT)) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Only touch files that have a site-header
  if (!html.includes('class="site-header"') && !html.includes("class='site-header'")) {
    skipped++;
    continue;
  }

  if (!NAV_RE.test(html)) {
    skipped++;
    continue;
  }

  const newHtml = html.replace(NAV_RE, NAV);

  if (newHtml === html) {
    skipped++;
    continue;
  }

  fs.writeFileSync(filePath, newHtml, 'utf8');
  updated++;
}

console.log(
  `inject-nav: updated ${updated} pages` +
  (skipped ? ` (${skipped} unchanged / no-nav)` : '')
);
