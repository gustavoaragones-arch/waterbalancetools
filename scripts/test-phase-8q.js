#!/usr/bin/env node
/**
 * test-phase-8q.js
 *
 * Deterministic test suite for Phase 8Q (Academy Localization Architecture
 * Preparation). Exercises the synthetic fixtures required by the Phase 8Q
 * spec (Tests A-I) plus failure/rejection cases, against the REAL
 * repository code (template-utils.js, related-link-resolver.js,
 * academy-locale-scope.js) -- never merely asserting that a function
 * exists.
 *
 * No test here calls scripts/generate-academy.js via require() -- that
 * module, like every generator in this codebase, runs its own English
 * generation loop as a require()-time side effect. All fixture rendering
 * below composes template-utils.js's pure primitives directly (the exact
 * same primitives generate-academy.js itself calls), so this suite never
 * writes to disk and never mutates data/academy.json or
 * data/i18n/translation-status.json, transiently or otherwise.
 *
 * No network calls. No external APIs. Does not mutate or clean the
 * working tree.
 *
 * Run: node scripts/test-phase-8q.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let passed = 0;
let failed = 0;
function check(n, desc, cond) {
  if (cond) { console.log('PASS: ' + n + '. ' + desc); passed++; }
  else { console.log('FAIL: ' + n + '. ' + desc); failed++; }
}
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function exists(rel) { return fs.existsSync(path.join(ROOT, rel)); }

const tu = require(path.join(ROOT, 'scripts', 'template-utils'));
const resolver = require(path.join(ROOT, 'js', 'i18n', 'related-link-resolver'));
const scope = require(path.join(ROOT, 'js', 'i18n', 'academy-locale-scope'));
const { htmlLangAttr } = require(path.join(ROOT, 'js', 'i18n', 'html-lang'));
const { getLocalizedCanonical } = require(path.join(ROOT, 'js', 'i18n', 'locale-url'));
const academyData = require(path.join(ROOT, 'data', 'academy.json'));

resolver.reloadContentIndex();

/**
 * withSyntheticTranslationStatus(extraUnits, fn) -- runs `fn()` with
 * `extraUnits` transiently visible to BOTH consumers that read
 * data/i18n/translation-status.json (js/i18n/translation-status.js's own
 * getRecord()/isTranslated(), which reads it via an independent
 * fs.readFileSync + closure cache, and related-link-resolver.js's
 * buildContentIndex(), which reads it via require()), entirely in
 * process memory. The file on disk is NEVER opened for writing --
 * fs.readFileSync is intercepted so both consumers observe the extra
 * units for the duration of `fn()` only, then everything is restored to
 * the true on-disk state in a `finally` block (including on a thrown
 * assertion), so a failing test can never leave the process in a
 * corrupted state for subsequent tests.
 *
 * This lets a test exercise resolveRelatedLink()'s real Policy A
 * "translated" branch end-to-end for a synthetic Academy record, without
 * ever touching data/i18n/translation-status.json (or any file) on disk.
 */
function withSyntheticTranslationStatus(extraUnits, fn) {
  const fsMod = require('fs');
  const ts = require(path.join(ROOT, 'js', 'i18n', 'translation-status'));
  const jsonPath = ts.DATA_PATH;
  const originalReadFileSync = fsMod.readFileSync;

  fsMod.readFileSync = function (filePath, ...args) {
    const result = originalReadFileSync.call(fsMod, filePath, ...args);
    if (filePath === jsonPath || filePath === path.resolve(jsonPath)) {
      const parsed = JSON.parse(result);
      parsed.units = parsed.units.concat(extraUnits);
      return JSON.stringify(parsed);
    }
    return result;
  };

  function bustAndReload() {
    const resolvedJsonPath = require.resolve(jsonPath);
    delete require.cache[resolvedJsonPath];
    ts.reload();
    resolver.reloadContentIndex();
  }

  try {
    bustAndReload(); // now reading through the patched fs.readFileSync
    return fn();
  } finally {
    fsMod.readFileSync = originalReadFileSync;
    bustAndReload(); // restore: reading the TRUE on-disk content again
  }
}

let n = 1;

// ── Test A: English Academy record only -> English URL ─────────────────────

{
  const fund01 = academyData.articles.find((a) => a.id === 'fund-01');
  const result = resolver.resolveRelatedLink({ raw: '/' + fund01.slug, locale: 'en' });
  check(n++, 'Test A: an English-only Academy record resolves to its English URL at locale "en"',
    result.resolved === true && result.url === '/' + fund01.slug && result.family === 'academy');
}

// ── Test B: Academy record with synthetic Spanish localization -----------
//    Expected: Spanish localized fields can be consumed by the generator
//    architecture (localizeRecord + fill()).

{
  const syntheticArticle = {
    id: 'zz-fixture', slug: 'academy/fundamentals/zz-fixture', category: 'fundamentals',
    title: 'English Title', description: 'English description.', summary: 'English summary.',
    overview: 'English overview.', keyFacts: ['EN fact 1', 'EN fact 2'],
    sections: [{ h2: 'EN Section', body: 'EN body text.' }],
    examples: [{ title: 'EN Example', body: 'EN example body.' }],
    commonMistakes: ['EN mistake 1'], sources: ['EN Source'],
    relatedCalculators: ['/calculators/pool-chlorine-calculator'],
    es: {
      title: 'Título en Español',
      description: 'Descripción en español.',
      summary: 'Resumen en español.',
      overview: 'Resumen general en español.',
      keyFacts: ['Dato ES 1', 'Dato ES 2'],
      sections: [{ h2: 'Sección ES', body: 'Cuerpo ES.' }],
      examples: [{ title: 'Ejemplo ES', body: 'Cuerpo de ejemplo ES.' }],
      commonMistakes: ['Error ES 1'],
    },
  };
  const localized = tu.localizeRecord(syntheticArticle, 'es');
  const contentEs = tu.buildArticleContent(localized, 'es');
  const sidebarEs = tu.buildAcademySidebar(localized, [syntheticArticle], 'es');

  check(n++, 'Test B: localizeRecord("es") overlays every documented Academy `es` field',
    localized.title === 'Título en Español' &&
    localized.description === 'Descripción en español.' &&
    localized.summary === 'Resumen en español.' &&
    localized.overview === 'Resumen general en español.' &&
    localized.keyFacts[0] === 'Dato ES 1' &&
    localized.sections[0].h2 === 'Sección ES' &&
    localized.examples[0].title === 'Ejemplo ES' &&
    localized.commonMistakes[0] === 'Error ES 1');

  check(n++, 'Test B: structural fields (id/slug/category/relatedCalculators) are NOT overridden by `es`',
    localized.id === 'zz-fixture' && localized.slug === 'academy/fundamentals/zz-fixture' &&
    localized.category === 'fundamentals' &&
    JSON.stringify(localized.relatedCalculators) === JSON.stringify(['/calculators/pool-chlorine-calculator']));

  check(n++, 'Test B: buildArticleContent("es") renders localized Spanish headings and localized body content',
    contentEs.includes(tu.chrome('academyKeyFacts', 'es')) &&
    contentEs.includes('Dato ES 1') &&
    contentEs.includes('Sección ES') &&
    contentEs.includes(tu.chrome('academyExamples', 'es')) &&
    contentEs.includes('Ejemplo ES') &&
    contentEs.includes(tu.chrome('academyCommonMistakes', 'es')) &&
    contentEs.includes('Error ES 1'));

  check(n++, 'Test B: buildAcademySidebar("es") renders localized Spanish sidebar headings',
    sidebarEs.includes(tu.chrome('academyInThisCategory', 'es')) &&
    sidebarEs.includes(tu.chrome('academyOnThisPage', 'es')) &&
    sidebarEs.includes(tu.chrome('academyCalculatorsHeading', 'es')));
}

// ── Test C: relatedTopics target that HAS Spanish localization -----------
//    Expected: Spanish related target URL.

{
  // Primary, literal exercise of Test C: inject a synthetic "translated"
  // translation-status unit for a REAL Academy article (fund-02, which
  // carries no real unit today) entirely in memory (see
  // withSyntheticTranslationStatus() above -- no file is ever written to
  // disk), then call resolveRelatedLink() with a relatedTopics-shaped raw
  // reference to that same real article and assert it returns the
  // synthetic Spanish URL end-to-end, through the real resolver code path
  // (normalizeReference -> contentIdByNative -> isTranslated ->
  // getLocalizedUrl), exactly as a real translated Academy record would.
  const fund02 = academyData.articles.find((a) => a.id === 'fund-02');
  const syntheticEsUrl = '/es/' + fund02.slug;
  const syntheticUnit = {
    contentId: 'academy:fund-02',
    category: 'academy',
    languages: {
      en: { status: 'translated', url: '/' + fund02.slug },
      es: { status: 'translated', url: syntheticEsUrl },
    },
  };

  const relatedTopicsShapedResult = withSyntheticTranslationStatus([syntheticUnit], () =>
    resolver.resolveRelatedLink({ raw: fund02.slug, locale: 'es' })
  );
  check(n++, 'Test C (primary): a synthetic-translated Academy relatedTopics target resolves to its Spanish URL end-to-end',
    relatedTopicsShapedResult.resolved === true &&
    relatedTopicsShapedResult.url === syntheticEsUrl &&
    relatedTopicsShapedResult.family === 'academy' &&
    relatedTopicsShapedResult.nativeId === 'fund-02' &&
    relatedTopicsShapedResult.translatedForLocale === true);

  // Same target, locale 'en' -- Policy A rule 1 must still return the
  // English URL even while the synthetic Spanish unit is active.
  const enDuringSynthetic = withSyntheticTranslationStatus([syntheticUnit], () =>
    resolver.resolveRelatedLink({ raw: fund02.slug, locale: 'en' })
  );
  check(n++, 'Test C (locale "en" unaffected): the same synthetic-translated target still returns the English URL at locale "en"',
    enDuringSynthetic.resolved === true && enDuringSynthetic.url === '/' + fund02.slug && enDuringSynthetic.translatedForLocale === true);

  // Prove the synthetic injection is fully reverted: outside the
  // withSyntheticTranslationStatus() callback, fund-02 must go back to
  // being unresolved-as-translated (its real, unchanged es:missing/absent
  // state), and the real on-disk translation-status.json must still
  // report exactly 151 units.
  const afterRestore = resolver.resolveRelatedLink({ raw: fund02.slug, locale: 'es' });
  const realStatus = JSON.parse(read('data/i18n/translation-status.json'));
  check(n++, 'Test C (restoration): after the synthetic window closes, fund-02 reverts to its real (untranslated) fallback behavior',
    afterRestore.resolved === true && afterRestore.translatedForLocale === false && afterRestore.url === '/' + fund02.slug);
  check(n++, 'Test C (restoration): data/i18n/translation-status.json on disk still has exactly 151 units (no residual mutation)',
    realStatus.units.length === 151);

  // Structural + generic-mechanism evidence, retained as supplementary
  // proof (not a substitute for the end-to-end assertion above).
  const resolverSrc = read('js/i18n/related-link-resolver.js');
  const resolveFnMatch = resolverSrc.match(/function resolveRelatedLink\(options\) \{[\s\S]*?\n\}/);
  const familySpecificBranch = resolveFnMatch && /target\.family\s*===\s*['"]academy['"]/.test(resolveFnMatch[0]);
  check(n++, 'Test C (structural, supplementary): resolveRelatedLink() contains no Academy-specific branch -- Policy A is family-agnostic',
    resolveFnMatch !== null && familySpecificBranch === false);

  const { getLocalizedUrl } = require(path.join(ROOT, 'js', 'i18n', 'locale-url'));
  const transformed = getLocalizedUrl('/' + fund02.slug, 'es');
  check(n++, 'Test C (URL math, supplementary): getLocalizedUrl() correctly transforms a real Academy English URL into its /es/academy/... form',
    transformed === '/es/' + fund02.slug && !transformed.includes('/es/es/'));
}

// ── Test D: relatedTopics target that exists only in English -------------
//    Expected: English fallback URL.

{
  const fund01 = academyData.articles.find((a) => a.id === 'fund-01');
  // fund-01 has a REAL translation-status unit (academy:fund-01) that is
  // es:missing -- one flavor of "English only."
  const resultWithUnit = resolver.resolveRelatedLink({ raw: '/' + fund01.slug, locale: 'es' });
  check(n++, 'Test D (has a status unit, es:missing): falls back to the English URL, not fabricated, not suppressed',
    resultWithUnit.resolved === true && resultWithUnit.url === '/' + fund01.slug && resultWithUnit.translatedForLocale === false);

  const fund02 = academyData.articles.find((a) => a.id === 'fund-02');
  // fund-02 has NO translation-status unit registered at all -- the other
  // flavor of "English only."
  const resultNoUnit = resolver.resolveRelatedLink({ raw: '/' + fund02.slug, locale: 'es' });
  check(n++, 'Test D (no status unit registered at all): also falls back to the English URL',
    resultNoUnit.resolved === true && resultNoUnit.url === '/' + fund02.slug && resultNoUnit.translatedForLocale === false);
}

// ── Test E: relatedTopics target that does not exist -----------------------
//    Expected: no fabricated URL.

{
  const byUrl = resolver.resolveRelatedLink({ raw: '/academy/fundamentals/this-does-not-exist', locale: 'es' });
  const bySlugSuffix = resolver.resolveRelatedLink({ raw: 'this-slug-suffix-does-not-exist', targetFamilyHint: 'academy', locale: 'es' });
  check(n++, 'Test E: a nonexistent Academy URL never fabricates a URL',
    byUrl.resolved === false && byUrl.reason === 'unknown-target' && byUrl.url === undefined);
  check(n++, 'Test E: a nonexistent Academy slug suffix (with family hint) never fabricates a URL',
    bySlugSuffix.resolved === false && bySlugSuffix.reason === 'unknown-target' && bySlugSuffix.url === undefined);
}

// ── Test F: multiple Academy records, id/slug lookup ------------------------

{
  let allIdOk = true;
  let allSlugOk = true;
  const fundIds = [...scope.FUNDAMENTALS_SCOPE];
  for (const id of fundIds) {
    const article = academyData.articles.find((a) => a.id === id);
    const byUrl = resolver.resolveRelatedLink({ raw: '/' + article.slug, locale: 'en' });
    if (!byUrl.resolved || byUrl.nativeId !== id) allIdOk = false;
    const bySuffix = resolver.resolveRelatedLink({ raw: article.slug.split('/').pop(), targetFamilyHint: 'academy', locale: 'en' });
    if (!bySuffix.resolved || bySuffix.nativeId !== id) allSlugOk = false;
  }
  check(n++, 'Test F: all 8 real Fundamentals articles resolve correctly by native-ID-bearing URL', allIdOk);
  check(n++, 'Test F: all 8 real Fundamentals articles resolve correctly by bare slug suffix', allSlugOk);

  // relatedTopics-shaped full-slug lookup (Shape 2), which is how
  // Academy's own relatedTopics field actually references other articles.
  const fund01 = academyData.articles.find((a) => a.id === 'fund-01');
  let allFullSlugOk = true;
  for (const raw of (fund01.relatedTopics || [])) {
    const result = resolver.resolveRelatedLink({ raw, locale: 'en' });
    if (!result.resolved || result.family !== 'academy') allFullSlugOk = false;
  }
  check(n++, 'Test F: fund-01\'s real relatedTopics full-slug values all resolve via Shape 2 (no hint needed)',
    (fund01.relatedTopics || []).length > 0 && allFullSlugOk);
}

// ── Test G: category record with synthetic es.label -------------------------

{
  const syntheticCategory = { slug: 'fundamentals', label: 'Fundamentals', description: 'EN description', icon: 'book', es: { label: 'Fundamentos' } };
  const localizedCategory = tu.localizeRecord(syntheticCategory, 'es');
  check(n++, 'Test G: a synthetic category.es.label can be consumed via localizeRecord()',
    localizedCategory.label === 'Fundamentos');
  check(n++, 'Test G: category structural fields (slug/description/icon) are not overridden by es.label',
    localizedCategory.slug === 'fundamentals' && localizedCategory.description === 'EN description' && localizedCategory.icon === 'book');

  // Real category records must not carry es.label yet.
  const categoriesWithEs = (academyData.categories || []).filter((c) => c.es);
  check(n++, 'Test G: no real Academy category record carries an `es` object in production data',
    categoriesWithEs.length === 0);
}

// ── Test H: missing optional Spanish fields -> deterministic fallback ------

{
  const partialArticle = {
    id: 'zz-fixture-2', slug: 'academy/fundamentals/zz-fixture-2', category: 'fundamentals',
    title: 'EN Title', description: 'EN description.', summary: 'EN summary.', overview: 'EN overview.',
    keyFacts: ['EN fact'], sections: [{ h2: 'EN Sec', body: 'EN body' }],
    examples: [{ title: 'EN ex', body: 'EN body' }], commonMistakes: ['EN mistake'],
    es: { title: 'Título ES', description: 'Descripción ES' }, // summary/overview/keyFacts/sections/examples/commonMistakes omitted
  };
  const localized = tu.localizeRecord(partialArticle, 'es');
  check(n++, 'Test H: present `es` fields (title/description) are used',
    localized.title === 'Título ES' && localized.description === 'Descripción ES');
  check(n++, 'Test H: omitted `es` fields fall back deterministically to the English source (no undefined/null leak)',
    localized.summary === 'EN summary.' && localized.overview === 'EN overview.' &&
    JSON.stringify(localized.keyFacts) === JSON.stringify(['EN fact']) &&
    localized.sections[0].h2 === 'EN Sec' && localized.examples[0].title === 'EN ex' &&
    localized.commonMistakes[0] === 'EN mistake');

  let renderThrew = false;
  let contentHtml = '';
  try {
    contentHtml = tu.buildArticleContent(localized, 'es');
  } catch (e) {
    renderThrew = true;
  }
  check(n++, 'Test H: rendering a partially-localized record never throws and never emits literal "undefined"/"null"',
    !renderThrew && !contentHtml.includes('undefined') && !contentHtml.includes('null'));
}

// ── Test I: relatedGlossary / relatedFormulas -- deferred, no new UI --------

{
  const tuSrc = read('scripts/template-utils.js');
  const articleContentFn = tuSrc.match(/function buildArticleContent\([^)]*\) \{[\s\S]*?\n\}\n/)[0];
  const buildRelatedToolsFn = tuSrc.match(/function buildRelatedTools\([^)]*\) \{[\s\S]*?\n\}\n/)[0];
  check(n++, 'Test I: buildArticleContent() does not read/render relatedGlossary',
    !articleContentFn.includes('relatedGlossary'));
  check(n++, 'Test I: buildArticleContent() does not read/render relatedFormulas',
    !articleContentFn.includes('relatedFormulas'));
  check(n++, 'Test I: buildRelatedTools() does not read/render relatedGlossary',
    !buildRelatedToolsFn.includes('relatedGlossary'));
  check(n++, 'Test I: buildRelatedTools() does not read/render relatedFormulas',
    !buildRelatedToolsFn.includes('relatedFormulas'));

  // Real data still carries both fields untouched (stored, not rendered).
  const withRelatedGlossary = academyData.articles.filter((a) => (a.relatedGlossary || []).length > 0);
  const withRelatedFormulas = academyData.articles.filter((a) => (a.relatedFormulas || []).length > 0);
  check(n++, 'Test I: relatedGlossary data still exists in data/academy.json (deferred, not deleted)',
    withRelatedGlossary.length > 0);
  check(n++, 'Test I: relatedFormulas data still exists in data/academy.json (deferred, not deleted)',
    withRelatedFormulas.length > 0);
}

// ── English default-locale equivalence (regression guard) ──────────────────

{
  const article = academyData.articles.find((a) => a.id === 'fund-01');
  const catArticles = academyData.articles.filter((a) => a.category === 'fundamentals');
  check(n++, 'buildArticleContent(article) === buildArticleContent(article, "en") for a real article',
    tu.buildArticleContent(article) === tu.buildArticleContent(article, 'en'));
  check(n++, 'buildAcademySidebar(article, cats) === buildAcademySidebar(article, cats, "en") for a real article',
    tu.buildAcademySidebar(article, catArticles) === tu.buildAcademySidebar(article, catArticles, 'en'));
  check(n++, 'buildRelatedTopics(slugs, articles) === buildRelatedTopics(slugs, articles, "en") for real relatedTopics',
    tu.buildRelatedTopics(article.relatedTopics, academyData.articles) === tu.buildRelatedTopics(article.relatedTopics, academyData.articles, 'en'));
}

// ── Bounded scope: fails when an unexpected ID is (hypothetically) present ──

{
  const c1 = scope.classifyAcademyScope();
  check(n++, 'classifyAcademyScope() reports 0 missing and 0 unexpected against real data/academy.json today',
    c1.missing.length === 0 && c1.unexpected.length === 0);
  check(n++, 'isInFundamentalsScope() rejects a real non-Fundamentals article id (san-01)', scope.isInFundamentalsScope('san-01') === false);
  check(n++, 'isInFundamentalsScope() rejects a syntactically-plausible but nonexistent id (fund-09)', scope.isInFundamentalsScope('fund-09') === false);
  check(n++, 'isInFundamentalsScope() accepts every real fund-01..fund-08 id',
    [...scope.FUNDAMENTALS_SCOPE].every((id) => scope.isInFundamentalsScope(id) === true));
}

// ── Resolver regression guard: existing families unaffected by Academy ─────

{
  const calc = resolver.resolveRelatedLink({ raw: '/calculators/pool-chlorine-calculator', locale: 'en' });
  const glossaryEn = resolver.resolveRelatedLink({ raw: 'pool-volume', targetFamilyHint: 'glossary', locale: 'en' });
  const formulaDangling = resolver.resolveRelatedLink({ raw: 'turnover-rate', targetFamilyHint: 'glossary', locale: 'es' });
  check(n++, 'Calculator family resolution is unaffected by adding Academy to the resolver',
    calc.resolved === true && calc.family === 'calculator');
  check(n++, 'Glossary family resolution (locale "en") is unaffected by adding Academy to the resolver',
    glossaryEn.resolved === true && glossaryEn.family === 'glossary' && glossaryEn.url === '/glossary/pool-volume');
  check(n++, 'The pre-existing 13-dangling-target formula->glossary Policy-A fallback behavior is unaffected',
    formulaDangling.resolved === false && formulaDangling.reason === 'unknown-target');
}

// ── Template token readiness (no /es/es/, self-canonical, lang correctness)─

{
  const enTag = htmlLangAttr('en');
  const esTag = htmlLangAttr('es');
  check(n++, 'htmlLangAttr("en") === \'lang="en"\' (byte-identical to the pre-8Q hardcoded template value)', enTag === 'lang="en"');
  check(n++, 'htmlLangAttr("es") === \'lang="es"\'', esTag === 'lang="es"');

  const fund01 = academyData.articles.find((a) => a.id === 'fund-01');
  const enCanonical = getLocalizedCanonical('/' + fund01.slug, 'en');
  const esCanonical = getLocalizedCanonical('/' + fund01.slug, 'es');
  check(n++, 'getLocalizedCanonical(path, "en") reproduces the exact original hardcoded English canonical',
    enCanonical === 'https://waterbalancetools.com/' + fund01.slug);
  check(n++, 'getLocalizedCanonical(path, "es") produces a correct /es/academy/... canonical with no /es/es/',
    esCanonical === 'https://waterbalancetools.com/es/' + fund01.slug && !esCanonical.includes('/es/es/'));
}

// ── Artifact scope: exactly the expected files exist / do not exist ────────

{
  check(n++, 'js/i18n/academy-locale-scope.js exists', exists('js/i18n/academy-locale-scope.js'));
  check(n++, 'docs/PHASE-8Q-ACADEMY-LOCALIZATION-ARCHITECTURE.md exists', exists('docs/PHASE-8Q-ACADEMY-LOCALIZATION-ARCHITECTURE.md'));
  check(n++, 'reports/phase-8q-status.md exists', exists('reports/phase-8q-status.md'));
  check(n++, 'scripts/validate-phase-8q.js exists', exists('scripts/validate-phase-8q.js'));
  check(n++, 'No es/academy directory or file exists anywhere in the repository', !exists('es/academy'));
  check(n++, 'No docs/PHASE-8R-*.md exists -- Phase 8R was not started',
    !fs.readdirSync(path.join(ROOT, 'docs')).some((f) => /^PHASE-8R-/.test(f)));
  check(n++, 'No reports/phase-8r-status.md exists', !exists('reports/phase-8r-status.md'));
  check(n++, 'No scripts/validate-phase-8r.js exists', !exists('scripts/validate-phase-8r.js'));
}

// ── Explicit recommendation / readiness gate presence (report content) ─────

{
  const report = read('reports/phase-8q-status.md');
  check(n++, 'reports/phase-8q-status.md states ACADEMY_SPANISH_PAGES: 0', /ACADEMY_SPANISH_PAGES:\s*0/.test(report));
  check(n++, 'reports/phase-8q-status.md states SPANISH_TOTAL_PAGES: 147', /SPANISH_TOTAL_PAGES:\s*147/.test(report));
  check(n++, 'reports/phase-8q-status.md states FUNDAMENTALS_SCOPE: fund-01..fund-08', /FUNDAMENTALS_SCOPE:\s*fund-01\.\.fund-08/.test(report));
  check(n++, 'reports/phase-8q-status.md states PHASE_8R_STARTED: NO', /PHASE_8R_STARTED:\s*NO/.test(report));
  check(n++, 'reports/phase-8q-status.md states COMMIT: NONE and PUSH: NONE', /COMMIT:\s*NONE/.test(report) && /PUSH:\s*NONE/.test(report));
}

// ── Baseline integrity ───────────────────────────────────────────────────

{
  const BASELINE_SHA = 'fc4b7c15c7371d4ce0a03ae2d4043d1677d73e21';
  const head = execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim();
  check(n++, 'HEAD still equals the Phase 8P baseline (Phase 8Q made no commit)', head === BASELINE_SHA);
  const diffCalc = execSync(`git diff ${BASELINE_SHA} -- js/calc-utils.js data/formulas.json data/reference.json data/glossary.json data/i18n/translation-status.json`, { cwd: ROOT }).toString();
  check(n++, 'js/calc-utils.js and all core-reference/translation-status data are byte-identical to the Phase 8P baseline', diffCalc.trim() === '');
  const diffAcademyHtml = execSync(`git diff ${BASELINE_SHA} -- academy/`, { cwd: ROOT }).toString();
  check(n++, 'English Academy production HTML (academy/) is byte-identical to the Phase 8P baseline', diffAcademyHtml.trim() === '');
}

console.log('');
console.log('test-phase-8q: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
