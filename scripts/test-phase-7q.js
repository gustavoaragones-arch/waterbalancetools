#!/usr/bin/env node
'use strict';
/**
 * Regression tests for Phase 7Q's specific production changes: the legacy
 * sitemap-generator safety guard, the AUTHORITY_RE domain-recognition fix,
 * the academy.json duplicate-id fix, and the new entity citations.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
let assertions = 0;
function expectTrue(value, label) { assertions++; assert.strictEqual(Boolean(value), true, label); }
function expectFalse(value, label) { assertions++; assert.strictEqual(Boolean(value), false, label); }
function expectEqual(actual, expected, label) { assertions++; assert.strictEqual(actual, expected, label); }

// ---------------------------------------------------------------------
// 1. Legacy sitemap generator refuses to run without an explicit override.
// ---------------------------------------------------------------------
{
  const before = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  let exitCode = 0;
  try {
    execSync('node scripts/generate-sitemap.js', { cwd: ROOT, stdio: 'pipe' });
  } catch (e) {
    exitCode = e.status;
  }
  expectEqual(exitCode, 1, 'generate-sitemap.js (singular) exits 1 without FORCE_LEGACY_SITEMAP');
  const after = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  expectEqual(after, before, 'generate-sitemap.js (singular) does not modify sitemap.xml when refusing to run');
}

// ---------------------------------------------------------------------
// 2. AUTHORITY_RE recognizes the new Phase 7K/7Q source domains but not an
//    arbitrary unrelated domain.
// ---------------------------------------------------------------------
{
  const { AUTHORITY_RE } = require('./audit-forensic/lib/derive');
  expectTrue(AUTHORITY_RE.test('https://www.phta.org/pub/?id=abc'), 'AUTHORITY_RE recognizes phta.org');
  expectTrue(AUTHORITY_RE.test('https://www.msdsdigital.com/xyz'), 'AUTHORITY_RE recognizes msdsdigital.com (manufacturer SDS host)');
  expectTrue(AUTHORITY_RE.test('https://cmahc.org/mahc_sections/1837'), 'AUTHORITY_RE recognizes cmahc.org');
  expectTrue(AUTHORITY_RE.test('https://www.cdc.gov/foo'), 'AUTHORITY_RE still recognizes pre-existing .gov domains');
  expectFalse(AUTHORITY_RE.test('https://randompoolblog.example.com/article'), 'AUTHORITY_RE does not treat an arbitrary unrelated blog domain as authoritative');
}

// ---------------------------------------------------------------------
// 3. data/academy.json has no duplicate article ids.
// ---------------------------------------------------------------------
{
  const academyData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'academy.json'), 'utf8'));
  const ids = academyData.articles.map((a) => a.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  expectEqual(dupes.length, 0, `data/academy.json has no duplicate article ids (found: ${dupes.join(', ')})`);
}

// ---------------------------------------------------------------------
// 4. New entity citations render for the 3 Phase 7Q-expanded entities and
//    resolve to real registered sources.
// ---------------------------------------------------------------------
{
  const { SOURCES_BY_ID } = require('./data/chemistry-sources');
  const expectations = [
    ['entities/water-replacement.html', 'phta-water-conservation-droughts-2021'],
    ['entities/cover.html', 'phta-water-conservation-droughts-2021'],
    ['entities/calcium-hypochlorite.html', 'phta-calcium-hypochlorite-fact-sheet-2021'],
  ];
  for (const [rel, sourceId] of expectations) {
    const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    expectTrue(html.includes('knowledge-sources-real'), `${rel} renders a real citation block`);
    const source = SOURCES_BY_ID[sourceId];
    expectTrue(!!source, `${sourceId} is registered in chemistry-sources.js`);
    expectTrue(html.includes(source.url), `${rel} cites the expected source URL`);
  }
}

// ---------------------------------------------------------------------
// 5. entities/maintenance-checklist.html's "Why Water Testing Matters"
//    cross-link (previously shadowed by the fund-06 id collision) resolves
//    correctly.
// ---------------------------------------------------------------------
{
  const html = fs.readFileSync(path.join(ROOT, 'entities', 'maintenance-checklist.html'), 'utf8');
  expectTrue(html.includes('Why Water Testing Matters'), 'maintenance-checklist entity links to the correct academy article after the fund-06 id-collision fix');
}

console.log(`test-phase-7q: ${assertions} assertions passed.`);
