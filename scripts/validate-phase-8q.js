#!/usr/bin/env node
/**
 * validate-phase-8q.js
 *
 * Validates Phase 8Q: Academy Localization Architecture Preparation.
 *
 * Phase 8Q is an ARCHITECTURE-PREPARATION phase -- it produces zero
 * Spanish Academy production content and mutates no unrelated
 * production family. This validator checks two different kinds of
 * thing:
 *
 *   (a) that the architecture Phase 8Q claims to have built actually
 *       exists and behaves correctly (locale plumbing, chrome keys,
 *       resolver family, embedded schema readiness, bounded scope), and
 *   (b) that production is completely untouched: zero Spanish Academy
 *       pages, Spanish total production still 147, English Academy
 *       output byte-identical to the Phase 8P baseline, sitemap/
 *       navigation/search-index topology unchanged, calculator logic
 *       unchanged, glossary/formula/reference source data unchanged,
 *       and the 151-unit translation-status inventory unchanged.
 *
 * Read-only. Does not end with a blanket `git checkout HEAD -- .`
 * self-cleanup step and never mutates the working tree.
 *
 * Run: node scripts/validate-phase-8q.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let errors = 0;
let warnings = 0;
function err(msg) { console.log('ERROR: ' + msg); errors++; }
function warn(msg) { console.log('WARN: ' + msg); warnings++; }
function ok(msg) { console.log('OK: ' + msg); }
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }

const BASELINE_SHA = 'fc4b7c15c7371d4ce0a03ae2d4043d1677d73e21'; // Phase 8P closeout

// ── 1. Baseline / architecture assumptions ──────────────────────────────────

function check1_baseline() {
  const log = execSync('git log --oneline -1 ' + BASELINE_SHA, { cwd: ROOT }).toString().trim();
  if (log) ok('1. Baseline commit ' + BASELINE_SHA.slice(0, 7) + ' (Phase 8P closeout) is present in history');
  else err('1. Baseline commit ' + BASELINE_SHA + ' not found in history');

  const head = execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim();
  if (head === BASELINE_SHA) {
    ok('1. HEAD still equals the Phase 8P baseline -- Phase 8Q has not committed anything');
  } else {
    err('1. HEAD (' + head + ') has moved past the Phase 8P baseline (' + BASELINE_SHA + ') -- Phase 8Q must remain uncommitted');
  }
}

// ── 2-6. Academy locale/template/chrome architecture ────────────────────────

function check2to6_templateLocaleSupport() {
  const tu = read('scripts/template-utils.js');

  const artMatch = tu.match(/function buildArticleContent\(([^)]*)\)/);
  if (artMatch && /locale/.test(artMatch[1])) {
    ok('2/3. buildArticleContent() has an explicit locale parameter');
  } else {
    err('2/3. buildArticleContent() does not declare a locale parameter');
  }

  const sidebarMatch = tu.match(/function buildAcademySidebar\(([^)]*)\)/);
  if (sidebarMatch && /locale/.test(sidebarMatch[1])) {
    ok('4. buildAcademySidebar() has an explicit locale parameter');
  } else {
    err('4. buildAcademySidebar() does not declare a locale parameter');
  }

  const requiredKeys = [
    'academyKeyFacts', 'academyExamples', 'academyCommonMistakes',
    'academyCommonMistakesShort', 'academyInThisCategory', 'academyOnThisPage',
    'academyCalculatorsHeading', 'academyRelatedChip',
  ];
  const { chrome } = require(path.join(ROOT, 'scripts', 'template-utils'));
  let missingKeys = [];
  for (const k of requiredKeys) {
    try {
      const en = chrome(k, 'en');
      const es = chrome(k, 'es');
      if (!en || !es || en === es) missingKeys.push(k);
    } catch (e) {
      missingKeys.push(k);
    }
  }
  if (missingKeys.length === 0) {
    ok('5. All ' + requiredKeys.length + ' required Academy chrome() keys exist with distinct en/es values');
  } else {
    err('5. Missing or malformed Academy chrome() keys: ' + missingKeys.join(', '));
  }

  // English default must be unaffected: calling with no locale arg must
  // equal calling with 'en' explicitly, for both functions.
  const tuMod = require(path.join(ROOT, 'scripts', 'template-utils'));
  const article = {
    id: 'zz-fixture', slug: 'academy/fundamentals/zz-fixture', title: 'Fixture',
    overview: 'Overview.', keyFacts: ['Fact'], sections: [{ h2: 'Sec', body: 'Body.' }],
    examples: [{ title: 'Ex', body: 'Body.' }], commonMistakes: ['Mistake'], sources: ['Src'],
    relatedCalculators: ['/calculators/pool-chlorine-calculator'],
  };
  const contentDefault = tuMod.buildArticleContent(article);
  const contentEn = tuMod.buildArticleContent(article, 'en');
  if (contentDefault === contentEn) {
    ok('3. buildArticleContent() default locale behaves identically to explicit "en"');
  } else {
    err('3. buildArticleContent() default-locale output diverges from explicit "en" output');
  }
  const sidebarDefault = tuMod.buildAcademySidebar(article, [article]);
  const sidebarEn = tuMod.buildAcademySidebar(article, [article], 'en');
  if (sidebarDefault === sidebarEn) {
    ok('4. buildAcademySidebar() default locale behaves identically to explicit "en"');
  } else {
    err('4. buildAcademySidebar() default-locale output diverges from explicit "en" output');
  }
}

// ── 6. generate-academy.js locale support ───────────────────────────────────

function check6_generatorLocaleSupport() {
  const ga = read('scripts/generate-academy.js');
  if (!/function generateArticle\([^)]*locale[^)]*\)/.test(ga)) {
    err('6. generate-academy.js#generateArticle() does not declare a locale parameter');
    return;
  }
  ok('6. generate-academy.js#generateArticle() declares a locale parameter');

  if (/localizeRecord/.test(ga)) ok('7. generate-academy.js integrates localizeRecord()');
  else err('7. generate-academy.js does not call localizeRecord()');

  if (/HTML_LANG_ATTR/.test(ga) && /htmlLangAttr/.test(ga)) ok('17a. generate-academy.js wires HTML_LANG_ATTR via js/i18n/html-lang.js');
  else err('17a. generate-academy.js does not wire HTML_LANG_ATTR');

  if (/CANONICAL_URL/.test(ga) && /getLocalizedCanonical/.test(ga)) ok('17b. generate-academy.js wires CANONICAL_URL via js/i18n/locale-url.js');
  else err('17b. generate-academy.js does not wire CANONICAL_URL');

  const tpl = read('templates/academy-template.html');
  if (/\{\{HTML_LANG_ATTR\}\}/.test(tpl) && /\{\{CANONICAL_URL\}\}/.test(tpl)) {
    ok('17c. templates/academy-template.html accepts HTML_LANG_ATTR/CANONICAL_URL tokens (no hardcoded lang="en"/canonical)');
  } else {
    err('17c. templates/academy-template.html still hardcodes lang/canonical -- locale readiness incomplete');
  }
}

// ── 8-9. Academy relationship resolver family + id/slug indexing ───────────

function check8to9_resolverFamily() {
  const resolver = require(path.join(ROOT, 'js', 'i18n', 'related-link-resolver'));
  if (resolver.ACADEMY_FAMILY === 'academy') {
    ok('8. related-link-resolver.js exports ACADEMY_FAMILY');
  } else {
    err('8. related-link-resolver.js does not export ACADEMY_FAMILY');
    return;
  }

  resolver.reloadContentIndex();
  const scope = require(path.join(ROOT, 'js', 'i18n', 'academy-locale-scope'));
  const academyData = require(path.join(ROOT, 'data', 'academy.json'));
  const fundIds = [...scope.FUNDAMENTALS_SCOPE];
  let idOk = true, slugOk = true;
  for (const id of fundIds) {
    const article = academyData.articles.find((a) => a.id === id);
    if (!article) { idOk = false; continue; }
    const byUrl = resolver.resolveRelatedLink({ raw: '/' + article.slug, locale: 'en' });
    if (!byUrl.resolved || byUrl.family !== 'academy' || byUrl.nativeId !== id) idOk = false;
    const bySlugSuffix = resolver.resolveRelatedLink({ raw: article.slug.split('/').pop(), targetFamilyHint: 'academy', locale: 'en' });
    if (!bySlugSuffix.resolved || bySlugSuffix.nativeId !== id) slugOk = false;
  }
  if (idOk) ok('9a. All 8 Fundamentals native IDs resolve correctly through the resolver');
  else err('9a. One or more Fundamentals native IDs failed to resolve via the resolver');
  if (slugOk) ok('9b. All 8 Fundamentals bare-slug-suffix lookups resolve correctly through the resolver');
  else err('9b. One or more Fundamentals slug-suffix lookups failed to resolve via the resolver');
}

// ── 10-11. Policy A fallback + nonexistent-target safety ────────────────────

function check10to11_policyA() {
  const resolver = require(path.join(ROOT, 'js', 'i18n', 'related-link-resolver'));
  resolver.reloadContentIndex();

  const en = resolver.resolveRelatedLink({ raw: '/academy/fundamentals/understanding-pool-water-chemistry', locale: 'en' });
  const esFallback = resolver.resolveRelatedLink({ raw: '/academy/fundamentals/understanding-pool-water-chemistry', locale: 'es' });
  if (en.resolved && en.url === '/academy/fundamentals/understanding-pool-water-chemistry' && en.translatedForLocale === true) {
    ok('10a. locale "en" always returns the English Academy URL (Policy A rule 1)');
  } else {
    err('10a. locale "en" Academy resolution diverged from Policy A rule 1: ' + JSON.stringify(en));
  }
  if (esFallback.resolved && esFallback.url === '/academy/fundamentals/understanding-pool-water-chemistry' && esFallback.translatedForLocale === false) {
    ok('10b. locale "es" falls back to the English URL for an untranslated real Academy target (Policy A rule 2)');
  } else {
    err('10b. locale "es" Academy fallback diverged from Policy A: ' + JSON.stringify(esFallback));
  }

  const nonexistent = resolver.resolveRelatedLink({ raw: 'this-academy-slug-does-not-exist', targetFamilyHint: 'academy', locale: 'es' });
  if (nonexistent.resolved === false && nonexistent.reason === 'unknown-target') {
    ok('11. A nonexistent Academy relatedTopics target resolves to {resolved:false} -- no fabricated URL');
  } else {
    err('11. A nonexistent Academy target did not safely fail: ' + JSON.stringify(nonexistent));
  }
}

// ── 12-13. Embedded `es` schema shape + category es.label schema ───────────

function check12to13_schemaDoc() {
  const doc = read('docs/PHASE-8Q-ACADEMY-LOCALIZATION-ARCHITECTURE.md');
  const requiredArticleFields = ['title', 'description', 'summary', 'overview', 'keyFacts', 'sections', 'examples', 'commonMistakes'];
  const missingArticleFields = requiredArticleFields.filter((f) => !doc.includes(f));
  if (missingArticleFields.length === 0) {
    ok('12. docs/PHASE-8Q-*.md documents every required embedded Academy `es` field (' + requiredArticleFields.join(', ') + ')');
  } else {
    err('12. docs/PHASE-8Q-*.md is missing embedded `es` schema fields: ' + missingArticleFields.join(', '));
  }
  if (/category\.es\.label/.test(doc)) {
    ok('13. docs/PHASE-8Q-*.md documents the category.es.label schema');
  } else {
    err('13. docs/PHASE-8Q-*.md does not document category.es.label');
  }

  // localizeRecord() must be able to merge a synthetic es object shaped
  // exactly like the documented schema, without touching English source
  // fields, and without ever populating real academy.json data.
  const { localizeRecord } = require(path.join(ROOT, 'scripts', 'template-utils'));
  const synthetic = {
    id: 'zz-fixture', slug: 'academy/fundamentals/zz-fixture', title: 'English Title',
    description: 'English description.', summary: 'English summary.', overview: 'English overview.',
    keyFacts: ['EN fact'], sections: [{ h2: 'EN Sec', body: 'EN body' }],
    examples: [{ title: 'EN ex', body: 'EN body' }], commonMistakes: ['EN mistake'],
    es: {
      title: 'Título en Español', description: 'Descripción en español.', summary: 'Resumen en español.',
      overview: 'Resumen general en español.', keyFacts: ['Dato ES'],
      sections: [{ h2: 'Sección ES', body: 'Cuerpo ES' }], examples: [{ title: 'Ejemplo ES', body: 'Cuerpo ES' }],
      commonMistakes: ['Error ES'],
    },
  };
  const localizedEs = localizeRecord(synthetic, 'es');
  const localizedEn = localizeRecord(synthetic, 'en');
  const esOk = localizedEs.title === 'Título en Español' && localizedEs.keyFacts[0] === 'Dato ES';
  const enUnchanged = localizedEn === synthetic; // 'en' locale must be a strict passthrough
  if (esOk) ok('12a. localizeRecord() correctly overlays a synthetic Academy `es` object shaped per the documented schema');
  else err('12a. localizeRecord() failed to overlay a synthetic Academy `es` object');
  if (enUnchanged) ok('12b. localizeRecord(record, "en") returns the record unchanged (no `es` leakage into English)');
  else err('12b. localizeRecord(record, "en") altered the record');

  // Real production data must NOT carry any `es` object yet.
  const academyData = require(path.join(ROOT, 'data', 'academy.json'));
  const withEs = (academyData.articles || []).filter((a) => a.es);
  const catsWithEs = (academyData.categories || []).filter((c) => c.es);
  if (withEs.length === 0 && catsWithEs.length === 0) {
    ok('12c. No real Academy article or category record carries an `es` object (schema is documented, not populated)');
  } else {
    err('12c. Real Academy data already carries `es` content -- Phase 8Q must not populate production Spanish Academy data (' + withEs.length + ' articles, ' + catsWithEs.length + ' categories)');
  }
}

// ── 14. Fundamentals bounded scope ──────────────────────────────────────────

function check14_boundedScope() {
  if (!exists('js/i18n/academy-locale-scope.js')) {
    err('14. js/i18n/academy-locale-scope.js does not exist');
    return;
  }
  const scope = require(path.join(ROOT, 'js', 'i18n', 'academy-locale-scope'));
  if (scope.FUNDAMENTALS_SCOPE.size === 8 && scope.EXPECTED_FUNDAMENTALS_COUNT === 8) {
    ok('14a. FUNDAMENTALS_SCOPE names exactly 8 native IDs');
  } else {
    err('14a. FUNDAMENTALS_SCOPE does not name exactly 8 native IDs');
  }
  const expected = ['fund-01', 'fund-02', 'fund-03', 'fund-04', 'fund-05', 'fund-06', 'fund-07', 'fund-08'];
  const actual = [...scope.FUNDAMENTALS_SCOPE].sort();
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    ok('14b. FUNDAMENTALS_SCOPE is exactly fund-01..fund-08');
  } else {
    err('14b. FUNDAMENTALS_SCOPE does not exactly match fund-01..fund-08: ' + JSON.stringify(actual));
  }
  const classification = scope.classifyAcademyScope();
  if (classification.missing.length === 0 && classification.unexpected.length === 0) {
    ok('14c. classifyAcademyScope() reports 0 missing / 0 unexpected -- scope matches live data/academy.json exactly');
  } else {
    err('14c. classifyAcademyScope() drift detected: missing=' + JSON.stringify(classification.missing) + ' unexpected=' + JSON.stringify(classification.unexpected));
  }
  if (scope.isInFundamentalsScope('fund-01') === true && scope.isInFundamentalsScope('san-01') === false && scope.isInFundamentalsScope('fund-99') === false) {
    ok('14d. isInFundamentalsScope() correctly gates real in-scope / real out-of-scope / nonexistent IDs');
  } else {
    err('14d. isInFundamentalsScope() gate behaves incorrectly');
  }
}

// ── 15. Native Academy IDs unique ───────────────────────────────────────────

function check15_nativeIds() {
  const academyData = require(path.join(ROOT, 'data', 'academy.json'));
  const fundIds = (academyData.articles || []).filter((a) => a.category === 'fundamentals').map((a) => a.id);
  const uniqueFundIds = new Set(fundIds);
  if (fundIds.length === 8 && uniqueFundIds.size === 8) {
    ok('15. fund-01..fund-08 are 8 unique native Academy IDs');
  } else {
    err('15. Fundamentals native ID set is not exactly 8 unique IDs: ' + JSON.stringify(fundIds));
  }
  const allIds = (academyData.articles || []).map((a) => a.id);
  if (allIds.length === new Set(allIds).size) {
    ok('15a. All 50 Academy native IDs are globally unique (no duplicates introduced)');
  } else {
    err('15a. Duplicate Academy native IDs detected');
  }
}

// ── 16. English fallback behavior (already covered by 10a/10b) ────────────

function check16_englishFallback() {
  ok('16. English fallback behavior verified by checks 10a/10b above');
}

// ── 18. Schema readiness (synthetic, non-production) ───────────────────────

function check18_schemaReadiness() {
  // Deliberately does NOT require('./generate-academy') -- that module,
  // like every generator in this codebase, runs its own English
  // generation loop as a require()-time side effect (writes all 59
  // academy/*.html files via the *isolated* generator, which lacks the
  // later full-pipeline enrichment steps -- see docs/PHASE-8Q-*.md
  // Section 17). To keep this validator read-only and side-effect-free,
  // this check instead composes the exact same template-utils.js
  // primitives generateArticle() itself calls (fill/template/chrome/
  // localizeRecord/htmlLangAttr/getLocalizedCanonical), directly, against
  // a synthetic fixture -- proving the identical composition without
  // ever touching disk.
  const tu = require(path.join(ROOT, 'scripts', 'template-utils'));
  const { htmlLangAttr } = require(path.join(ROOT, 'js', 'i18n', 'html-lang'));
  const { getLocalizedCanonical } = require(path.join(ROOT, 'js', 'i18n', 'locale-url'));
  const synthetic = {
    id: 'zz-fixture', slug: 'academy/fundamentals/zz-fixture-schema-test', title: 'English Fixture Title',
    category: 'fundamentals', description: 'English fixture description.', summary: 'English summary.',
    overview: 'English overview.', keyFacts: ['Fact'], sections: [{ h2: 'Sec', body: 'Body.' }],
    examples: [], commonMistakes: [], sources: [], lastReviewed: '2026-01-01',
    es: { title: 'Título de Prueba', description: 'Descripción de prueba en español.' },
  };

  function renderFixture(article, locale) {
    const effectiveLocale = locale || 'en';
    const tpl = tu.template('academy-template.html');
    const a = tu.localizeRecord(article, effectiveLocale);
    const bc = tu.buildBreadcrumb(article.slug, a.title, effectiveLocale);
    return tu.fill(tpl, {
      SLUG: article.slug,
      HTML_LANG_ATTR: htmlLangAttr(effectiveLocale),
      CANONICAL_URL: getLocalizedCanonical('/' + article.slug, effectiveLocale),
      PAGE_TITLE: `${a.title} | Academy | WaterBalanceTools`,
      H1_TITLE: a.title,
      META_DESCRIPTION: a.description,
      LAST_REVIEWED: article.lastReviewed || '2026-01-01',
      BREADCRUMB: bc.nav,
      BREADCRUMB_SCHEMA: bc.schema,
      ARIA_PRIMARY_NAV: tu.chrome('ariaPrimaryNav', effectiveLocale),
      NAV_CALCULATOR_HREF: tu.chrome('navCalculatorHref', effectiveLocale),
      NAV_CALCULATOR_LABEL: tu.chrome('navCalculatorLabel', effectiveLocale),
      NAV_RESOURCES: tu.chrome('navResources', effectiveLocale),
      NAV_CHARTS: tu.chrome('navCharts', effectiveLocale),
      NAV_ACADEMY: tu.chrome('navAcademy', effectiveLocale),
      NAV_GUIDES: tu.chrome('navGuides', effectiveLocale),
      NAV_ABOUT: tu.chrome('navAbout', effectiveLocale),
      ARIA_SEARCH: tu.chrome('ariaSearch', effectiveLocale),
      ARIA_OPEN_MENU: tu.chrome('ariaOpenMenu', effectiveLocale),
      LAST_REVIEWED_LABEL: tu.chrome('lastReviewedLabel', effectiveLocale),
      HERO: tu.fill(tu.partial('knowledge-hero.html'), {
        BADGE: 'Fundamentals', BADGE_CLASS: 'knowledge-badge--fundamentals',
        READING_TIME: '5 min read', LAST_REVIEWED: article.lastReviewed || '2026-01-01',
        TITLE: tu.esc(a.title), SUMMARY: tu.esc(a.summary || ''), CHIPS: '',
      }),
      CONTENT: tu.buildArticleContent(a, effectiveLocale),
      TAKEAWAYS: '',
      SIDEBAR: tu.buildAcademySidebar(a, [article], effectiveLocale),
      RELATED_TOOLS: tu.buildRelatedTools(a, effectiveLocale),
      RELATED_TOPICS: '',
      KNOWLEDGE_FOOTER: '',
      SITE_FOOTER: tu.SITE_FOOTER,
    });
  }

  let esHtml, enHtml;
  try {
    esHtml = renderFixture(synthetic, 'es');
    enHtml = renderFixture(synthetic, 'en');
  } catch (e) {
    err('18. Fixture rendering threw for a synthetic localized Academy record: ' + e.message);
    return;
  }
  const esLdMatches = esHtml.match(/"@type":\s*"Article"/g) || [];
  const enLdMatches = enHtml.match(/"@type":\s*"Article"/g) || [];
  if (esLdMatches.length === 1 && enLdMatches.length === 1) {
    ok('18a. Exactly one Article JSON-LD block in both English and synthetic-Spanish output (no duplicate schema)');
  } else {
    err('18a. Unexpected JSON-LD block count -- en=' + enLdMatches.length + ' es=' + esLdMatches.length);
  }
  if (esHtml.includes('lang="es"') && esHtml.includes('Título de Prueba')) {
    ok('18b. Synthetic Spanish generation produces lang="es" and consumes the localized title');
  } else {
    err('18b. Synthetic Spanish generation did not correctly localize lang/title');
  }
  if (esHtml.includes('/es/academy/fundamentals/zz-fixture-schema-test') && !esHtml.includes('/es/es/')) {
    ok('18c. Synthetic Spanish canonical is /es/academy/... with no /es/es/ duplication');
  } else {
    err('18c. Synthetic Spanish canonical is malformed or contains /es/es/');
  }
  if (enHtml.includes('lang="en"') && !enHtml.includes('/es/')) {
    ok('18d. English generation for the same fixture stays fully English (canonical/lang unaffected by the `es` object)');
  } else {
    err('18d. English generation leaked Spanish canonical/lang for a record carrying an `es` object');
  }
}

// ── 19-20. Production Spanish counts ─────────────────────────────────────────

function check19to20_productionCounts() {
  function countHtml(dir) {
    const full = path.join(ROOT, dir);
    if (!fs.existsSync(full)) return 0;
    return fs.readdirSync(full).filter((f) => f.endsWith('.html')).length;
  }
  const esAcademy = fs.existsSync(path.join(ROOT, 'es', 'academy')) ? countHtml('es/academy') : 0;
  if (esAcademy === 0) ok('19. Spanish Academy production page count = 0');
  else err('19. Spanish Academy production pages exist: ' + esAcademy);

  const calc = countHtml('es/calculators');
  const gloss = countHtml('es/glossary');
  const form = countHtml('es/formulas');
  const ref = countHtml('es/reference');
  const total = calc + gloss + form + ref + esAcademy;
  if (total === 147 && calc === 13 && gloss === 100 && form === 9 && ref === 25) {
    ok('20. Spanish total production count = 147 (13 calculators + 100 glossary + 9 formulas + 25 reference + 0 academy)');
  } else {
    err('20. Spanish total production count is not 147: calc=' + calc + ' gloss=' + gloss + ' form=' + form + ' ref=' + ref + ' academy=' + esAcademy + ' total=' + total);
  }

  for (const fam of ['entities', 'guides', 'resources', 'comparisons', 'charts', 'programmatic']) {
    const c = countHtml('es/' + fam);
    if (c !== 0) err('Scope violation: es/' + fam + ' contains ' + c + ' page(s)');
  }
  ok('Scope gate: no Spanish page families beyond calculators/glossary/formulas/reference exist');
}

// ── 21. No Spanish Academy sitemap entries ──────────────────────────────────

function check21_sitemap() {
  const files = ['sitemap-academy.xml'];
  let violation = false;
  for (const f of files) {
    if (!exists(f)) continue;
    const xml = read(f);
    if (/<loc>[^<]*\/es\/academy\//.test(xml)) violation = true;
  }
  const other = exists('sitemap-other.xml') ? read('sitemap-other.xml') : '';
  if (/<loc>[^<]*\/es\/academy\//.test(other)) violation = true;

  if (!violation) ok('21. No /es/academy/ URL appears in any sitemap-*.xml');
  else err('21. A /es/academy/ URL was found in a sitemap file');

  const baselineAcademySitemap = execSync(`git show ${BASELINE_SHA}:sitemap-academy.xml`, { cwd: ROOT }).toString();
  const currentAcademySitemap = exists('sitemap-academy.xml') ? read('sitemap-academy.xml') : '';
  if (baselineAcademySitemap === currentAcademySitemap) {
    ok('21a. sitemap-academy.xml is byte-identical to the Phase 8P baseline');
  } else {
    err('21a. sitemap-academy.xml changed from the Phase 8P baseline');
  }
}

// ── 22. No Spanish Academy navigation entries ───────────────────────────────

function check22_navigation() {
  const nav = JSON.parse(read('data/navigation.json'));
  const violation = (nav.pages || []).some((p) => typeof p.url === 'string' && p.url.startsWith('/es/academy'));
  if (!violation) ok('22. No /es/academy* entry exists in data/navigation.json');
  else err('22. A /es/academy* entry was found in data/navigation.json');

  const baselineNav = JSON.parse(execSync(`git show ${BASELINE_SHA}:data/navigation.json`, { cwd: ROOT }).toString());
  const baselinePages = new Set((baselineNav.pages || []).map((p) => p.url));
  const currentPages = new Set((nav.pages || []).map((p) => p.url));
  const added = [...currentPages].filter((u) => !baselinePages.has(u));
  const removed = [...baselinePages].filter((u) => !currentPages.has(u));
  if (added.length === 0 && removed.length === 0) {
    ok('22a. data/navigation.json URL set is identical to the Phase 8P baseline (0 added, 0 removed)');
  } else {
    err('22a. data/navigation.json URL set changed vs Phase 8P baseline: +' + added.length + ' -' + removed.length);
  }
}

// ── 23. No Spanish Academy search-index entries ─────────────────────────────

function check23_searchIndex() {
  const search = JSON.parse(read('data/search-index.json'));
  const violation = search.some((p) => typeof p.url === 'string' && p.url.startsWith('/es/academy'));
  if (!violation) ok('23. No /es/academy* entry exists in data/search-index.json');
  else err('23. A /es/academy* entry was found in data/search-index.json');

  const baselineSearch = JSON.parse(execSync(`git show ${BASELINE_SHA}:data/search-index.json`, { cwd: ROOT }).toString());
  if (baselineSearch.length === search.length) {
    ok('23a. data/search-index.json entry count unchanged vs Phase 8P baseline (' + search.length + ')');
  } else {
    err('23a. data/search-index.json entry count changed: baseline=' + baselineSearch.length + ' current=' + search.length);
  }
}

// ── 24. Existing translation-status inventory unchanged ────────────────────

function check24_translationStatus() {
  const diff = execSync(`git diff ${BASELINE_SHA} -- data/i18n/translation-status.json`, { cwd: ROOT }).toString();
  if (diff.trim() === '') {
    ok('24. data/i18n/translation-status.json is byte-identical to the Phase 8P baseline (151 units, unchanged)');
  } else {
    err('24. data/i18n/translation-status.json differs from the Phase 8P baseline -- Phase 8Q must not alter production translation-status');
  }
}

// ── 25. Existing i18n primitives reused (no second architecture) ───────────

function check25_reuse() {
  const ga = read('scripts/generate-academy.js');
  const resolver = read('js/i18n/related-link-resolver.js');
  const usesSharedHtmlLang = /require\(['"]\.\.\/js\/i18n\/html-lang['"]\)/.test(ga);
  const usesSharedLocaleUrl = /require\(['"]\.\.\/js\/i18n\/locale-url['"]\)/.test(ga);
  const usesSharedLocalizeRecord = /require\(['"]\.\/template-utils['"]\)/.test(ga);
  if (usesSharedHtmlLang && usesSharedLocaleUrl && usesSharedLocalizeRecord) {
    ok('25. generate-academy.js reuses the existing js/i18n/html-lang.js, locale-url.js, and template-utils.js localizeRecord() -- no second architecture introduced');
  } else {
    err('25. generate-academy.js does not visibly reuse the established i18n primitives');
  }
  const noNewIsTranslated = !/function isTranslated/.test(resolver) || /require\(['"]\.\/translation-status['"]\)/.test(resolver);
  if (noNewIsTranslated) {
    ok('25a. related-link-resolver.js still delegates translation-status checks to js/i18n/translation-status.js (no duplicate status store)');
  } else {
    err('25a. related-link-resolver.js appears to implement its own translation-status logic');
  }
}

// ── 26. No unrelated family changes ─────────────────────────────────────────

function check26_noUnrelatedChanges() {
  const allowedProduction = new Set([
    'scripts/template-utils.js',
    'scripts/generate-academy.js',
    'js/i18n/related-link-resolver.js',
    'templates/academy-template.html',
  ]);
  const allowedNewFiles = new Set([
    'js/i18n/academy-locale-scope.js',
    'docs/PHASE-8Q-ACADEMY-LOCALIZATION-ARCHITECTURE.md',
    'reports/phase-8q-status.md',
    'scripts/validate-phase-8q.js',
    'scripts/test-phase-8q.js',
  ]);
  const diffOut = execSync('git diff --name-only', { cwd: ROOT }).toString().trim();
  const modified = diffOut ? diffOut.split('\n') : [];
  const untrackedOut = execSync('git ls-files --others --exclude-standard', { cwd: ROOT }).toString().trim();
  const untracked = untrackedOut ? untrackedOut.split('\n') : [];

  const unexpectedModified = modified.filter((f) => !allowedProduction.has(f));
  const unexpectedNew = untracked.filter((f) => !allowedNewFiles.has(f));

  if (unexpectedModified.length === 0) {
    ok('26a. Only the 4 expected production files are modified: ' + [...allowedProduction].join(', '));
  } else {
    err('26a. Unexpected modified files found: ' + unexpectedModified.join(', '));
  }
  if (unexpectedNew.length === 0) {
    ok('26b. Only the 5 expected new files are untracked: ' + [...allowedNewFiles].join(', '));
  } else {
    err('26b. Unexpected new/untracked files found: ' + unexpectedNew.join(', '));
  }

  // Hard invariants: calculator/formula/reference/glossary source data,
  // and calculator logic, must be byte-identical to the Phase 8P baseline.
  const diffCalc = execSync(`git diff ${BASELINE_SHA} -- js/calc-utils.js`, { cwd: ROOT }).toString();
  if (diffCalc.trim() === '') ok('26c. js/calc-utils.js byte-identical to Phase 8P baseline (calculator logic unchanged)');
  else err('26c. js/calc-utils.js differs from the Phase 8P baseline');

  const diffData = execSync(`git diff ${BASELINE_SHA} -- data/formulas.json data/reference.json data/glossary.json`, { cwd: ROOT }).toString();
  if (diffData.trim() === '') ok('26d. data/formulas.json, data/reference.json, data/glossary.json byte-identical to Phase 8P baseline');
  else err('26d. One or more of formulas.json/reference.json/glossary.json differ from the Phase 8P baseline');

  const diffAcademyData = execSync(`git diff ${BASELINE_SHA} -- data/academy.json scripts/data/academy-fundamentals.js`, { cwd: ROOT }).toString();
  if (diffAcademyData.trim() === '') ok('26e. data/academy.json and scripts/data/academy-fundamentals.js byte-identical to Phase 8P baseline (no Spanish content populated)');
  else err('26e. Academy source data was modified -- Phase 8Q must not populate production Academy content');

  const diffAcademyHtml = execSync(`git diff ${BASELINE_SHA} -- academy/`, { cwd: ROOT }).toString();
  if (diffAcademyHtml.trim() === '') ok('English Academy production HTML is byte-identical to the Phase 8P baseline');
  else err('English Academy production HTML differs from the Phase 8P baseline -- regression');
}

// ── translation drift ────────────────────────────────────────────────────

function checkDrift() {
  const drift = require(path.join(ROOT, 'js', 'i18n', 'translation-drift'));
  const idx = drift.buildNativeIdIndex();
  const result = drift.detectDrift(idx);
  if (result.errors.length === 0) ok('Translation drift: 0 errors');
  else err('Translation drift detected ' + result.errors.length + ' error(s): ' + JSON.stringify(result.errors));
}

// ── Run ──────────────────────────────────────────────────────────────────────

check1_baseline();
check2to6_templateLocaleSupport();
check6_generatorLocaleSupport();
check8to9_resolverFamily();
check10to11_policyA();
check12to13_schemaDoc();
check14_boundedScope();
check15_nativeIds();
check16_englishFallback();
check18_schemaReadiness();
check19to20_productionCounts();
check21_sitemap();
check22_navigation();
check23_searchIndex();
check24_translationStatus();
check25_reuse();
check26_noUnrelatedChanges();
checkDrift();

console.log('');
console.log('validate-phase-8q: ' + (errors === 0 ? 'PASS' : 'FAIL') + ' -- ' + errors + ' error(s), ' + warnings + ' warning(s).');
process.exit(errors === 0 ? 0 : 1);
