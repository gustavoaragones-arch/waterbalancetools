/**
 * Cannibalization guard: secondary calculators point to primary pool chemical calculator.
 * Targets: pool-chlorine-calculator, pool-shock-calculator only.
 * Idempotent. Run after inject-calculator-related-tools.js.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CALC_DIR = path.join(ROOT, 'calculators');

const FILES = new Set(['pool-chlorine-calculator.html', 'pool-shock-calculator.html']);

const BLOCK =
  '\n    <p class="context">For full water balance, use the main <a href="/calculators/chemical-calculator">Pool Chemical Calculator</a>.</p>\n';

function strip(html) {
  return html.replace(
    new RegExp(
      '\\s*<p class="context[^"]*"[^>]*>\\s*For full water balance, use the main <a href="/calculators/chemical-calculator">Pool Chemical Calculator</a>\\.\\s*</p>\\s*',
      'gi'
    ),
    ''
  );
}

function insertAfterHero(html) {
  const m = html.match(/<section class="hero[^"]*"[^>]*>[\s\S]*?<\/section>/i);
  if (!m) return null;
  const stripped = strip(html);
  const m2 = stripped.match(/<section class="hero[^"]*"[^>]*>[\s\S]*?<\/section>/i);
  if (!m2) return null;
  const end = stripped.indexOf(m2[0]) + m2[0].length;
  return stripped.slice(0, end) + BLOCK + stripped.slice(end);
}

let n = 0;
if (fs.existsSync(CALC_DIR)) {
  for (const name of fs.readdirSync(CALC_DIR)) {
    if (!FILES.has(name)) continue;
    const full = path.join(CALC_DIR, name);
    const html = fs.readFileSync(full, 'utf8');
    const next = insertAfterHero(html);
    if (next != null && next !== html) {
      fs.writeFileSync(full, next, 'utf8');
      n++;
    }
  }
}
console.log('inject-secondary-canonical-context: updated ' + n + ' pages');
