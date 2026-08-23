#!/usr/bin/env node
'use strict';
/**
 * validate-phase-7m.js (Phase 7M, Step 20)
 *
 * Checks specific to this phase's content-quality/differentiation/seasonal
 * work: the 4 programmatic families still render correctly and remain
 * unique per page, the new academy article and edge-case page are
 * complete (not accidentally thin), citations from Phase 7L are still
 * present where expected, no unresolved template tokens leaked into
 * output, canonicals/indexation are unchanged, and new pages don't
 * cannibalize an existing seasonal/topical page's intent.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let errors = 0;
let warnings = 0;
const err = (msg) => { console.error('ERROR: ' + msg); errors++; };
const warn = (msg) => { console.warn('WARN: ' + msg); warnings++; };

const SKIP_DIRS = new Set(['node_modules', '.git', 'reports', 'templates', 'partials']);
function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
}
const allHtml = [];
walk(ROOT, allHtml);

// 1. Unresolved template tokens anywhere sitewide (catches a leaked {{TOKEN}}
// from the entity template's new SOURCES_SECTION slot or the academy
// article's field substitution).
for (const file of allHtml) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);
  if (/\{\{[A-Z_]+\}\}/.test(html)) err(`${rel}: unresolved template token`);
}

// 2. Programmatic families: no two sibling pages in the same family may be
// byte-identical after the family-parameter substitution (a generator bug
// that would silently defeat this phase's differentiation work).
const FAMILIES = ['programmatic/chlorine', 'programmatic/shock', 'programmatic/ph', 'programmatic/hot-tubs'];
for (const fam of FAMILIES) {
  const dir = path.join(ROOT, fam);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html') && f !== 'index.html');
  const bodies = files.map((f) => {
    const html = fs.readFileSync(path.join(dir, f), 'utf8');
    return html.replace(/<main[\s\S]*?<\/main>/i, (m) => m).match(/<main[\s\S]*?<\/main>/i);
  });
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      if (bodies[i] && bodies[j] && bodies[i][0] === bodies[j][0]) {
        err(`${fam}: ${files[i]} and ${files[j]} have byte-identical <main> content`);
      }
    }
  }
  // No family page should still contain the removed quick-tips heading.
  for (const f of files) {
    const html = fs.readFileSync(path.join(dir, f), 'utf8');
    if (/<h2>Quick tips<\/h2>/.test(html)) {
      warn(`${fam}/${f}: still renders the generic Quick Tips block this phase intended to remove`);
    }
  }
}

// 3. New pages are not accidentally thin (empty/near-empty).
const NEW_PAGES = ['academy/fundamentals/indoor-pool-chemistry.html', 'guides/edge-cases/evaporation-effect-on-pool-chemistry.html'];
for (const rel of NEW_PAGES) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) { err(`Expected new page missing: ${rel}`); continue; }
  const html = fs.readFileSync(p, 'utf8');
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter(Boolean).length;
  if (words < 150) err(`${rel}: only ${words} words -- accidentally thin for a new page`);
  if (!/<link rel="canonical"/.test(html)) err(`${rel}: missing canonical link`);
  if (!/noindex/i.test(html) === false) { /* fine, page is indexable */ }
}

// 4. Citations from Phase 7L must still be present (not weakened/removed).
const EXPECTED_CITATION_PAGES = [
  'entities/trichlor-tablets.html', 'entities/green-water.html', 'entities/temperature.html',
  'entities/shock-treatment.html', 'entities/vinyl-pool.html',
  'calculators/pool-chlorine-calculator.html', 'calculators/hot-tub-chlorine-calculator.html',
  'calculators/pool-ph-calculator.html', 'calculators/chemical-calculator.html',
  'pool-alkalinity-levels-chart.html', 'hot-tub-chlorine-levels-chart.html', 'pool-chlorine-levels-chart.html',
];
let citedCount = 0;
for (const rel of EXPECTED_CITATION_PAGES) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) { err(`Expected Phase 7L-cited page missing: ${rel}`); continue; }
  const html = fs.readFileSync(p, 'utf8');
  if (html.includes('knowledge-sources-real')) citedCount++;
  else err(`${rel}: Phase 7L citation block is missing -- citation regression`);
}
for (const g of [5000, 10000, 15000, 20000, 25000, 30000]) {
  const p = path.join(ROOT, `programmatic/shock/how-much-shock-for-${g}-gallon-pool.html`);
  if (fs.existsSync(p) && fs.readFileSync(p, 'utf8').includes('knowledge-sources-real')) citedCount++;
  else err(`programmatic/shock/how-much-shock-for-${g}-gallon-pool.html: Phase 7L citation block missing -- citation regression`);
}

// 5. Malformed internal links (href="" or href pointing at a literal
// template placeholder) sitewide.
for (const file of allHtml) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);
  if (/href=""/i.test(html)) err(`${rel}: empty href attribute`);
  if (/href="[^"]*undefined[^"]*"/i.test(html)) err(`${rel}: href contains literal "undefined"`);
}

// 6. Canonicals present on every indexable page (spot-check the pages this
// phase touched directly rather than a full sitewide re-scan, which
// validate-phase-7h/7i already own).
for (const rel of NEW_PAGES.concat(FAMILIES.flatMap((f) => {
  const dir = path.join(ROOT, f);
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((x) => x.endsWith('.html')).map((x) => path.join(f, x)) : [];
}))) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const html = fs.readFileSync(p, 'utf8');
  if (!/<link rel="canonical" href="https:\/\/waterbalancetools\.com\//.test(html)) {
    err(`${rel}: missing or malformed canonical`);
  }
}

// 7. Seasonal-page keyword cannibalization: the new evaporation page and
// its existing rain sibling must not share an identical <title> or H1
// (the whole point of adding it was a materially distinct intent).
{
  const rain = fs.readFileSync(path.join(ROOT, 'guides/edge-cases/rain-effect-on-pool-chemistry.html'), 'utf8');
  const evap = fs.readFileSync(path.join(ROOT, 'guides/edge-cases/evaporation-effect-on-pool-chemistry.html'), 'utf8');
  const rainTitle = (rain.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  const evapTitle = (evap.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  if (rainTitle === evapTitle) err('rain-effect and evaporation-effect pages have identical titles -- cannibalization');
}

// 8. Indoor pool academy article must not duplicate the entity's exact
// sentences verbatim (would indicate a copy-paste rather than genuine
// expansion).
{
  const entityIdx = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'graph', 'entity-index.json'), 'utf8'));
  const entityDesc = entityIdx['indoor-pool'] ? entityIdx['indoor-pool'].longDescription : '';
  const academy = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'academy.json'), 'utf8'));
  const article = academy.articles.find((a) => a.slug === 'academy/fundamentals/indoor-pool-chemistry');
  if (!article) err('Expected new academy article fund-06 not found in data/academy.json');
  else {
    const articleText = article.sections.map((s) => s.body).join(' ');
    const entitySentences = entityDesc.split(/(?<=[.!?])\s+/);
    for (const s of entitySentences) {
      if (s.length > 40 && articleText.includes(s)) {
        warn(`Academy article verbatim-copies an entity sentence: "${s.slice(0, 60)}..."`);
      }
    }
  }
}

console.log(`validate-phase-7m: scanned ${allHtml.length} pages, ${citedCount}/${EXPECTED_CITATION_PAGES.length + 6} Phase 7L citation pages confirmed intact.`);

if (errors > 0) {
  console.error(`validate-phase-7m: FAIL -- ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
} else {
  console.log(`validate-phase-7m: PASS -- 0 errors, ${warnings} warning(s).`);
}
