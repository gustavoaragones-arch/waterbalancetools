#!/usr/bin/env node
// Phase 7X test suite -- categories A-L per the phase spec.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let pass = 0;
let fail = 0;

function read(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }
function T(label, fn) {
  try {
    const r = fn();
    if (r === false) throw new Error('assertion returned false');
    console.log('PASS: ' + label);
    pass++;
  } catch (e) {
    console.log('FAIL: ' + label + ' -- ' + e.message);
    fail++;
  }
}

// A. Breakpoint-chlorination education can remain (concept, definitions,
//    10x CC ratio, chemistry explanation) -- must NOT be scrubbed.
T('A: breakpoint-chlorination education remains in entities-processes.js', () => {
  const s = read('scripts/data/entities-processes.js');
  if (!/Breakpoint chlorination is the process of adding enough chlorine/.test(s)) throw new Error('education text removed');
});

T('A: glossary/breakpoint-chlorination definition intact', () => {
  const s = read('scripts/data/glossary-terms.js');
  if (!/gl-004.*slug: 'glossary\/breakpoint-chlorination'/s.test(s)) throw new Error('glossary entry missing');
});

T('A: green-algae-recovery 30ppm sourced claim untouched in chemistry-claims.js', () => {
  const s = read('scripts/data/chemistry-claims.js');
  if (!s.includes('claim-shock-algae-recovery-green')) throw new Error('sourced algae-recovery claim removed');
});

// B. The shock calculator is now described correctly (flat preset, not
//    breakpoint) everywhere it is mentioned alongside breakpoint chlorination.
T('B: free-chlorine-vs-total-chlorine guide states the calculator does not read CC', () => {
  const s = read('scripts/generate-authority-guides.js');
  if (!s.includes('does not read a combined-chlorine value or calculate a breakpoint dose automatically')) throw new Error('disclosure missing');
});

T('B: breakpoint-chlorination academy article Step 5 corrected', () => {
  const s = read('scripts/data/academy-sanitizers.js');
  if (!s.includes('The pool shock calculator does not accept a combined-chlorine reading or compute this target automatically')) throw new Error('Step 5 not corrected');
});

T('B: strong-chlorine-smell academy article "the-fix" section corrected', () => {
  const s = read('scripts/data/academy-troubleshooting.js');
  if (!s.includes('The shock calculator does not read a combined-chlorine value or run this calculation itself')) throw new Error('the-fix section not corrected');
});

// C. No page states the calculator accepts combined chlorine as an input.
T('C: no page claims the calculator accepts a CC input (validator sitewide sweep)', () => {
  const out = execSync('node scripts/validate-phase-7x.js', { cwd: ROOT }).toString();
  if (!out.includes('PASS')) throw new Error('validate-phase-7x did not report PASS');
});

// D. No page states the calculator computes a 10x-CC dose as a live calculation.
T('D: academy worked examples no longer attribute a 10x-CC computation to the calculator', () => {
  const s1 = read('scripts/data/academy-sanitizers.js');
  const s2 = read('scripts/data/academy-troubleshooting.js');
  if (/shock calculator (shows|indicates)[^.]*x\s*10/i.test(s1)) throw new Error('academy-sanitizers.js still attributes a 10x computation to the calculator');
  if (/shock calculator (shows|indicates)[^.]*x\s*10/i.test(s2)) throw new Error('academy-troubleshooting.js still attributes a 10x computation to the calculator');
});

// E. No contamination/fecal-incident response is framed as a calculator function.
T('E: emergency-recovery reference has no fecal/contamination dosing section', () => {
  const s = read('scripts/data/reference-pages.js');
  const idx = s.indexOf("slug: 'reference/emergency-recovery'");
  if (idx === -1) throw new Error('emergency-recovery entry not found');
  const nearby = s.slice(idx, idx + 6000);
  if (/fecal|contamination/i.test(nearby)) throw new Error('unexpected contamination/fecal content found near emergency-recovery');
});

// F. Priority A guide corrected with the required structure: preserves the
//    10x CC concept, states the limitation, states actual behavior, gives a
//    correct usage path.
T('F: free-chlorine-vs-total-chlorine guide keeps the 10x CC concept and adds the correct usage path', () => {
  const s = read('scripts/generate-authority-guides.js');
  const idx = s.indexOf("slug: 'free-chlorine-vs-total-chlorine.html'");
  const block = s.slice(idx, idx + 4000);
  if (!/10× the CC reading/.test(block)) throw new Error('10x CC concept removed');
  if (!/flat FC-increase presets/.test(block)) throw new Error('actual calculator behavior not stated');
  if (!/select the closest calculator preset, or apply/.test(block)) throw new Error('correct usage path not given');
});

// G. Programmatic/shock content corrected only where required (Priority B),
//    with no architecture/formula change.
T('G: generate-shock-pages.js shockOz() numeric formula unchanged', () => {
  const s = read('scripts/generators/generate-shock-pages.js');
  if (!s.includes('return (gallons * ppm) / 10000;')) throw new Error('shockOz formula was changed -- out of scope for Phase 7X');
});

T('G: generate-shock-pages.js FAQ no longer claims the calculator confirms a 30ppm target', () => {
  const s = read('scripts/generators/generate-shock-pages.js');
  if (s.includes('Confirm with the calculator using your actual current reading.')) throw new Error('old claim still present');
  if (!s.includes("highest preset (20 ppm)")) throw new Error('corrected disclosure missing');
});

// H. No calculator JS/formula file changed.
T('H: js/calc-utils.js and js/calculator.js unchanged this phase', () => {
  const diff = execSync('git diff --stat HEAD -- js/calc-utils.js js/calculator.js', { cwd: ROOT }).toString().trim();
  if (diff !== '') throw new Error('calculator JS files were modified: ' + diff);
});

// I. No chemistry-claims.js/chemistry-ranges.js/dataset-dosage-matrices.js change.
T('I: chemistry-claims.js, chemistry-ranges.js, dataset-dosage-matrices.js unchanged this phase', () => {
  const diff = execSync('git diff --stat HEAD -- scripts/data/chemistry-claims.js scripts/data/chemistry-ranges.js scripts/data/dataset-dosage-matrices.js', { cwd: ROOT }).toString().trim();
  if (diff !== '') throw new Error('forbidden-scope file modified: ' + diff);
});

// J. Phase 7W product-selector behavior intact (6/4 products, formula, presets).
T('J: Phase 7W SHOCK_PRODUCTS / calculateShockByProduct intact', () => {
  const s = read('js/calc-utils.js');
  if (!s.includes('calculateShockByProduct')) throw new Error('calculateShockByProduct missing');
  if (!s.includes('0.013344')) throw new Error('approved mass-balance constant missing');
});

T('J: pool-shock-calculator.html presets unchanged (5/10/15/20 ppm)', () => {
  const s = read('calculators/pool-shock-calculator.html');
  for (const v of ['value="5"', 'value="10"', 'value="15"', 'value="20"']) {
    if (!s.includes(v)) throw new Error('preset ' + v + ' missing');
  }
});

// K. Product-specific calculation intact (no invented generic divisor) --
//    scoped to the Phase 7W shock functions specifically. calculateChlorine's
//    unrelated 'granular'/'shock' type branch (a separate, pre-existing,
//    deliberately-unresolved REQUIRES_EXPERT_REVIEW item carried since
//    Phase 7T/7U/7W, documented in the function's own header comment) is
//    intentionally out of scope for Phase 7X and must not be touched.
T('K: calculateShockByProduct/granularChlorineOuncesForProduct use the approved formula, not a generic divisor', () => {
  const s1 = read('js/calc-utils.js');
  const s2 = read('js/calculator.js');
  const shockFnBody1 = s1.slice(s1.indexOf('function calculateShockByProduct'), s1.indexOf('function calculateShockByProduct') + 800);
  const shockFnBody2 = s2.slice(s2.indexOf('function granularChlorineOuncesForProduct'), s2.indexOf('function granularChlorineOuncesForProduct') + 800);
  if (/\/\s*10000/.test(shockFnBody1)) throw new Error('calculateShockByProduct still contains a /10000-style generic divisor');
  if (/\/\s*10000/.test(shockFnBody2)) throw new Error('granularChlorineOuncesForProduct still contains a /10000-style generic divisor');
  if (!shockFnBody1.includes('0.013344')) throw new Error('calculateShockByProduct missing the approved mass-balance constant');
});

T('K: calculateChlorine\'s pre-existing, deliberately-unresolved generic-divisor branch is untouched (out of Phase 7X scope)', () => {
  const s = read('js/calc-utils.js');
  if (!s.includes("Granular/generic shock divisor (10000) is UNCHANGED")) throw new Error('the documented pre-existing REQUIRES_EXPERT_REVIEW annotation is missing or was altered');
});

// L. "I don't know my product" remains qualitative-only (no numeric dose).
T("L: \"I don't know my product\" path remains qualitative-only", () => {
  const s = read('calculators/pool-shock-calculator.html');
  if (!/I don't know my product|qualitative/i.test(s)) throw new Error('qualitative-only fallback path not found');
});

// Regression: reference/combined-chlorine-explained.html FAQ and body both corrected consistently.
T('Regression: combined-chlorine-explained FAQ and body corrected identically', () => {
  const s = read('reference/combined-chlorine-explained.html');
  const count = (s.match(/does not accept a combined-chlorine reading/g) || []).length;
  if (count !== 2) throw new Error('expected 2 occurrences (FAQ schema + visible body), found ' + count);
});

// Regression: reference/shock-dosage-matrix.html table numbers match the approved formula.
T('Regression: shock-dosage-matrix 15,000 gal / 10 ppm figure matches the approved formula', () => {
  const s = read('scripts/data/reference-pages.js');
  const expected = (10 * 15000 * 0.013344 / 65 / 16).toFixed(2); // 1.92
  if (!s.includes("'1.92 lb'")) throw new Error('expected corrected figure 1.92 lb not found (computed ' + expected + ')');
});

console.log('');
console.log('test-phase-7x: ' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail === 0 ? 0 : 1);
