/**
 * Canonical footer injector — normalises footer markup across the entire site.
 *
 * Uses root-relative clean URLs so the footer is byte-identical on every page
 * regardless of folder depth.  Idempotent: strips the existing footer block
 * (and any whitespace immediately preceding it) and re-inserts the exact
 * canonical version, so a second run on already-correct output is a no-op.
 *
 * Run: node scripts/inject-footer.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/**
 * Directories skipped entirely. `templates/` holds source templates (e.g.
 * templates/entity-template.html) that generators fill per-page via token
 * substitution -- their footer placeholder is not a finished page and must
 * not be walked/rewritten here. Every *generated* page (including ones
 * filled from these templates) is still normalized on its own, later in
 * this same walk. Matches the equivalent SKIP_DIRS convention already used
 * by inject-nav.js.
 */
const SKIP_DIRS = new Set(['templates']);

/** Individual files whose footer we deliberately leave untouched */
const SKIP = new Set([
  'components/ad.html',
  'components/global-schema.html',
  '404.html'
]);

// ── Canonical footer ──────────────────────────────────────────────────────────
// Root-relative clean URLs work at every depth level. Leads with its own
// newline + indent so the replacement fully owns its separation from the
// preceding element -- see FOOTER_RE below.
const FOOTER =
`
  <footer class="site-footer">
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

// Matches any whitespace immediately preceding a <footer class="site-footer*">
// block, plus the block itself. Consuming the preceding whitespace is what
// makes this idempotent: without it, FOOTER's own leading newline+indent was
// being appended after whatever whitespace a previous run already left in
// place, growing by 2 characters on every single build (root cause of the
// sitewide template/injector drift -- see docs/PHASE-8A-TEMPLATE-INJECTOR-REMEDIATION.md).
const FOOTER_RE = /\s*<footer\b[^>]*class="site-footer[^"]*"[^>]*>[\s\S]*?<\/footer>/i;

// ── Walk ──────────────────────────────────────────────────────────────────────

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    if (e.isDirectory() && SKIP_DIRS.has(e.name)) continue;
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
