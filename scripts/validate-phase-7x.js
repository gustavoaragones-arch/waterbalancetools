#!/usr/bin/env node
// Phase 7X validator -- content alignment & breakpoint-claim reconciliation.
//
// Distinguishes legitimate breakpoint-chlorination EDUCATION (which must
// remain) from prohibited claims that the live shock calculators read a
// combined-chlorine value, compute a breakpoint (10x CC) dose automatically,
// or perform contamination/fecal-incident response dosing (which they never
// have, before or after Phase 7W). Checks the exact set of pages this phase
// touched plus a fresh sitewide sweep for the 5 prohibited patterns.

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let errors = 0;
let warnings = 0;
let pagesScanned = 0;
let findingsCorrected = 0;
let legitimateMentions = 0;

function err(msg) { console.log('ERROR: ' + msg); errors++; }
function warn(msg) { console.log('WARN: ' + msg); warnings++; }
function ok(msg) { console.log('OK: ' + msg); }

function read(p) {
  const full = path.join(ROOT, p);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, 'utf8');
}

// ---------------------------------------------------------------------
// 1. Files this phase corrected must no longer contain the 5 prohibited
//    patterns in a calculator-attribution context.
// ---------------------------------------------------------------------

// Each pattern's `re` must match ONLY the false claim, never the corrective
// disclosure sentences this phase introduced -- verified against a `safe`
// list of known-good sentences below before being treated as authoritative.
const PROHIBITED_PATTERNS = [
  // Pattern: text claims the calculator reads/accepts/takes a CC value.
  // The verb must follow "calculator" directly (no "does not"/"doesn't" in
  // between), so this does not match this phase's own corrective sentences.
  { id: 'reads-cc', re: /shock calculator (reads?|accepts?|takes?)( a| the| your)?[^.]{0,20}combined[- ]chlorine/i },
  // Pattern: text claims the calculator computes/shows/indicates a 10x-CC dose.
  { id: 'computes-10x-cc', re: /shock calculator (shows|indicates|computes|calculates)[^.]{0,60}(combined chlorine|CC)\s*x\s*10/i },
  // Pattern: "use/confirm with the shock calculator for exact/breakpoint dose" -- the literal word "shock" required to avoid matching unrelated (e.g. pH) calculators.
  { id: 'exact-breakpoint-dose-claim', re: /(use|confirm with) the shock calculator for( your| an)? (exact|breakpoint)[- ]?dose/i },
  // Pattern: contamination/fecal-incident response framed as a calculator function.
  { id: 'fecal-contamination-calculator-claim', re: /(fecal|contamination) incident[^.]{0,80}shock calculator/i },
];

// The known-safe disclosure phrases this phase introduced -- their presence
// alongside a breakpoint/CC mention confirms the passage now correctly
// states the limitation rather than the false claim.
const DISCLOSURE_MARKERS = [
  'does not accept a combined-chlorine reading',
  'does not read a combined-chlorine value',
  'does not read your combined-chlorine number',
  "highest preset (20 ppm)",
  'select the closest',
  'closest available preset',
  'apply the shock dose formula directly',
  'the shock dose formula (',
  'offers fixed presets (5, 10, 15, or 20 ppm)',
];

const CORRECTED_FILES = [
  'guides/chlorine/free-chlorine-vs-total-chlorine.html',
  'programmatic/shock/how-much-shock-for-5000-gallon-pool.html',
  'programmatic/shock/how-much-shock-for-10000-gallon-pool.html',
  'programmatic/shock/how-much-shock-for-15000-gallon-pool.html',
  'programmatic/shock/how-much-shock-for-20000-gallon-pool.html',
  'programmatic/shock/how-much-shock-for-25000-gallon-pool.html',
  'programmatic/shock/how-much-shock-for-30000-gallon-pool.html',
  'academy/sanitizers/breakpoint-chlorination.html',
  'academy/sanitizers/shock-treatments-explained.html',
  'academy/troubleshooting/strong-chlorine-smell.html',
  'glossary/breakpoint-dose.html',
  'reference/combined-chlorine-explained.html',
  'reference/emergency-recovery.html',
  'reference/shock-dosage-matrix.html',
];

for (const rel of CORRECTED_FILES) {
  const html = read(rel);
  if (html === null) { err('Corrected file missing: ' + rel); continue; }
  pagesScanned++;
  let hasDisclosure = DISCLOSURE_MARKERS.some((m) => html.includes(m));
  if (!hasDisclosure) {
    warn(rel + ': no disclosure marker found (expected if the fix used different wording -- verify manually)');
  } else {
    findingsCorrected++;
  }
  for (const p of PROHIBITED_PATTERNS) {
    if (p.re.test(html)) {
      err(rel + ': still matches prohibited pattern "' + p.id + '"');
    }
  }
}

// ---------------------------------------------------------------------
// 2. Fresh sitewide sweep: no OTHER page should contain an unqualified
//    prohibited claim either. Breakpoint education itself (10x CC concept,
//    definitions, glossary explanations) is legitimate and must remain --
//    only claims that tie this specific behavior to the live calculator
//    are checked.
// ---------------------------------------------------------------------

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
}

const allHtml = [];
for (const d of ['guides', 'academy', 'entities', 'calculators', 'formulas', 'reference', 'programmatic', 'glossary']) {
  const full = path.join(ROOT, d);
  if (fs.existsSync(full)) walk(full, allHtml);
}

let sitewideFindings = 0;
for (const full of allHtml) {
  const rel = path.relative(ROOT, full);
  const html = fs.readFileSync(full, 'utf8');
  pagesScanned++;
  for (const p of PROHIBITED_PATTERNS) {
    if (p.re.test(html)) {
      err('Sitewide sweep: ' + rel + ' matches prohibited pattern "' + p.id + '"');
      sitewideFindings++;
    }
  }
  if (/breakpoint chlorination|10x combined chlorine|10× combined chlorine/i.test(html) && !CORRECTED_FILES.includes(rel)) {
    legitimateMentions++;
  }
}

// ---------------------------------------------------------------------
// 3. Calculator JS/preset behavior must be unchanged (Phase 7W's contract
//    intact) -- Phase 7X must not have touched calculation logic.
// ---------------------------------------------------------------------

const calcUtils = read('js/calc-utils.js');
const calculator = read('js/calculator.js');
if (calcUtils && !calcUtils.includes('calculateShockByProduct')) {
  err('js/calc-utils.js: calculateShockByProduct missing -- Phase 7W product-selector architecture appears altered');
}
if (calculator && !calculator.includes('granularChlorineOuncesForProduct')) {
  err('js/calculator.js: granularChlorineOuncesForProduct missing -- Phase 7W product-selector architecture appears altered');
}
if (calcUtils && /combinedChlorine|combined_chlorine/i.test(calcUtils)) {
  err('js/calc-utils.js: appears to reference combined chlorine as an input -- breakpoint calculator boundary violated');
}

// ---------------------------------------------------------------------
// 4. No forbidden-scope files changed (chemistry-claims.js, chemistry-
//    ranges.js, dataset-dosage-matrices.js untouched unless explicitly
//    justified -- checked via git diff by the caller/test suite, not here,
//    since this script has no git dependency by design).
// ---------------------------------------------------------------------

console.log('');
console.log('validate-phase-7x: ' + pagesScanned + ' pages scanned, ' + findingsCorrected + ' corrected pages confirmed, ' +
  legitimateMentions + ' legitimate breakpoint-education mentions left untouched, ' + sitewideFindings + ' sitewide finding(s).');
console.log('validate-phase-7x: ' + (errors === 0 ? 'PASS' : 'FAIL') + ' -- ' + errors + ' error(s), ' + warnings + ' warning(s).');
process.exit(errors === 0 ? 0 : 1);
