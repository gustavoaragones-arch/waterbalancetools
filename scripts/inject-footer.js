/**
 * Canonical footer injector — normalises footer markup across the entire site.
 *
 * Uses root-relative clean URLs so the footer is byte-identical on every page
 * regardless of folder depth.  Idempotent: strips the existing footer block
 * and re-inserts the canonical version.
 *
 * Run: node scripts/inject-footer.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/** Files whose footer we deliberately leave untouched */
const SKIP = new Set([
  'components/ad.html',
  'components/global-schema.html',
  'templates/programmatic-template.html',
  '404.html'
]);

// ── Canonical footer ──────────────────────────────────────────────────────────
// Root-relative clean URLs work at every depth level.
const FOOTER =
`  <footer class="site-footer">
    <nav class="footer-nav">
      <a href="/calculators/pool-volume-calculator">Pool Volume Calculator</a>
      <a href="/calculators/pool-chlorine-calculator">Pool Chlorine Calculator</a>
      <a href="/calculators/pool-shock-calculator">Pool Shock Calculator</a>
      <a href="/calculators/pool-ph-calculator">Pool pH Calculator</a>
      <a href="/pool-chemical-levels-chart">Pool Chemical Levels Chart</a>
      <a href="/guides/pool-chemistry-basics">Pool Chemistry Guide</a>
      <a href="/all-pages">All Pages</a>
      <a href="/legal/ownership">Ownership</a>
      <a href="/legal/legal">Legal</a>
    </nav>
    <p class="footer-copy">&copy; 2026 Albor Digital LLC. All rights reserved.</p>
    <p class="footer-note">WaterBalanceTools.com is an independent educational website owned and operated by Albor Digital LLC.</p>
  </footer>`;

// Matches any <footer class="site-footer*"> … </footer> block
const FOOTER_RE = /<footer\b[^>]*class="site-footer[^"]*"[^>]*>[\s\S]*?<\/footer>/i;

// ── Walk ──────────────────────────────────────────────────────────────────────

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const full = path.join(dir, e.name);
    const rel  = path.relative(ROOT, full).replace(/\\/g, '/');
    if (e.isDirectory()) { walk(full, out); continue; }
    if (e.name.endsWith('.html') && !SKIP.has(rel)) out.push({ full, rel });
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const files = [];
walk(ROOT, files);

let updated = 0;
let skipped = 0;

for (const { full } of files) {
  const html = fs.readFileSync(full, 'utf8');
  if (!FOOTER_RE.test(html)) { skipped++; continue; }
  const next = html.replace(FOOTER_RE, FOOTER);
  if (next !== html) {
    fs.writeFileSync(full, next, 'utf8');
    updated++;
  }
}

console.log(
  'inject-footer: updated ' + updated + ' pages' +
  (skipped ? ' (' + skipped + ' had no site-footer to replace)' : '')
);
