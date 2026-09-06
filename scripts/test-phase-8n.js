#!/usr/bin/env node
/**
 * test-phase-8n.js
 *
 * Deterministic test suite for Phase 8N (Spanish Core Reference
 * Knowledge Production Cluster). Exercises the new locale-aware
 * rendering functions (localizeRecord, chrome, the updated
 * generateTerm/generateFormula/generateRefPage, buildBreadcrumb) against
 * real repository data, proving both: locale 'en' output is unchanged,
 * and locale 'es' output correctly surfaces each record's embedded `es`
 * object through chrome/heading text and content.
 *
 * No network calls. No external APIs. Deterministic.
 *
 * Run: node scripts/test-phase-8n.js
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

const BASELINE_SHA = 'af4ba29ad344b0a52e874e961498e20b09ae0578'; // Phase 8M closeout
let n = 1;

// ---------------------------------------------------------------------
// A. localizeRecord()
// ---------------------------------------------------------------------
{
  const { localizeRecord } = require('./template-utils');
  const record = { id: 'x', slug: 's', title: 'English Title', relatedCalculators: ['/a'], es: { title: 'Título Español' } };
  const en = localizeRecord(record, 'en');
  const es = localizeRecord(record, 'es');
  check(n++, 'localizeRecord(record, "en") returns the record unchanged', en === record);
  check(n++, 'localizeRecord(record, "es") overlays the es title', es.title === 'Título Español');
  check(n++, 'localizeRecord(record, "es") preserves structural fields absent from es', es.slug === 's' && JSON.stringify(es.relatedCalculators) === JSON.stringify(['/a']));
  check(n++, 'localizeRecord() on a record with no es object returns it unchanged even for locale es', localizeRecord({ id: 'y', title: 'T' }, 'es').title === 'T');

  const refRecord = { tables: [{ title: 'EN Title', headers: ['H1'], rows: [['r1']] }], es: { tables: [{ title: 'ES Title' }] } };
  const localizedRef = localizeRecord(refRecord, 'es');
  check(n++, 'localizeRecord() merges reference table title only, preserving headers', localizedRef.tables[0].title === 'ES Title' && JSON.stringify(localizedRef.tables[0].headers) === JSON.stringify(['H1']));
  check(n++, 'localizeRecord() preserves reference table rows untouched', JSON.stringify(localizedRef.tables[0].rows) === JSON.stringify([['r1']]));
}

// ---------------------------------------------------------------------
// B. chrome()
// ---------------------------------------------------------------------
{
  const { chrome } = require('./template-utils');
  check(n++, 'chrome() returns English default for locale undefined', chrome('whyItMatters', undefined) === 'Why It Matters');
  check(n++, 'chrome() returns English for locale "en"', chrome('whyItMatters', 'en') === 'Why It Matters');
  check(n++, 'chrome() returns Spanish for locale "es"', chrome('whyItMatters', 'es') === 'Por Qué Es Importante');
  check(n++, 'chrome() throws on an unknown key', (() => { try { chrome('nope', 'es'); return false; } catch (e) { return true; } })());
  check(n++, 'chrome("relatedToolsHeading") keeps the HTML-escaped ampersand in English', chrome('relatedToolsHeading', 'en') === 'Related Calculators &amp; Resources');
}

// ---------------------------------------------------------------------
// C. buildBreadcrumb() locale awareness
// ---------------------------------------------------------------------
{
  const { buildBreadcrumb } = require('./template-utils');
  const bcEn = buildBreadcrumb('glossary/free-chlorine', 'Free Chlorine', 'en');
  const bcEs = buildBreadcrumb('glossary/free-chlorine', 'Cloro Libre', 'es');
  check(n++, 'buildBreadcrumb locale "en" uses "Home"', /Home/.test(bcEn.nav) && !/Inicio/.test(bcEn.nav));
  check(n++, 'buildBreadcrumb locale "es" uses "Inicio"', /Inicio/.test(bcEs.nav) && !/>Home</.test(bcEs.nav));
  check(n++, 'buildBreadcrumb locale "es" translates the glossary hub label to "Glosario"', /Glosario/.test(bcEs.nav));
  check(n++, 'buildBreadcrumb locale "es" renders the localized leaf title, not the English one', /Cloro Libre/.test(bcEs.nav) && !/Free Chlorine/.test(bcEs.nav));
  check(n++, 'buildBreadcrumb locale "es" uses the Spanish breadcrumb aria-label', /Ruta de navegación/.test(bcEs.nav));
  check(n++, 'buildBreadcrumb hub crumb href stays the English hub URL in both locales (Policy A, hub untranslated)', /href="\/glossary"/.test(bcEn.nav) && /href="\/glossary"/.test(bcEs.nav));
  check(n++, 'buildBreadcrumb omitting locale (2-arg call) behaves exactly as locale "en" (back-compat for every other caller)', buildBreadcrumb('glossary/free-chlorine', 'Free Chlorine').nav === bcEn.nav);
}

// ---------------------------------------------------------------------
// D. generateTerm() English byte-identity + Spanish correctness
// ---------------------------------------------------------------------
{
  const { generateTerm, data } = require('./generate-glossary');
  const term = data.terms.find((t) => t.id === 'gl-001');
  const enOutput = generateTerm(term, 'en');
  const enOutputDefaultLocale = generateTerm(term);
  check(n++, 'generateTerm(term) with no locale arg produces byte-identical output to generateTerm(term, "en")', enOutput === enOutputDefaultLocale);
  check(n++, 'generateTerm English output uses "Definition" (untranslated label)', /<strong>Definition<\/strong>/.test(enOutput));
  check(n++, 'generateTerm English output does not contain the literal token {{DEFINITION_LABEL}} or any unresolved {{...}} token', !/\{\{[A-Z0-9_]+\}\}/.test(enOutput));

  const esOutput = generateTerm(term, 'es');
  check(n++, 'generateTerm Spanish output declares html lang="es"', /<html lang="es">/.test(esOutput));
  check(n++, 'generateTerm Spanish output uses the Spanish term as H1', /<h1>Cloro Libre<\/h1>/.test(esOutput));
  check(n++, 'generateTerm Spanish output uses "Definición" label, not "Definition"', /<strong>Definición<\/strong>/.test(esOutput) && !/<strong>Definition<\/strong>/.test(esOutput));
  check(n++, 'generateTerm Spanish output canonical points at /es/glossary/free-chlorine', /https:\/\/waterbalancetools\.com\/es\/glossary\/free-chlorine/.test(esOutput));
  check(n++, 'generateTerm Spanish output contains no unresolved {{...}} tokens', !/\{\{[A-Z0-9_]+\}\}/.test(esOutput));
}

// ---------------------------------------------------------------------
// E. generateFormula() equation/variables immutability under locale 'es'
// ---------------------------------------------------------------------
{
  const { generateFormula, data } = require('./generate-formulas');
  const formula = data.formulas.find((f) => f.id === 'formula-01');
  const enOutput = generateFormula(formula, 'en');
  const esOutput = generateFormula(formula, 'es');
  const equationEn = (enOutput.match(/<div class="formula-equation">([\s\S]*?)<\/div>/) || [])[1];
  const equationEs = (esOutput.match(/<div class="formula-equation">([\s\S]*?)<\/div>/) || [])[1];
  check(n++, 'generateFormula renders the identical equation string for locale "es" as for "en"', equationEn === equationEs);
  check(n++, 'generateFormula Spanish output uses "La Fórmula" heading', /La Fórmula/.test(esOutput));
  check(n++, 'generateFormula Spanish output has no unresolved {{...}} tokens', !/\{\{[A-Z0-9_]+\}\}/.test(esOutput));
  check(n++, 'generateFormula(formula) with no locale arg matches generateFormula(formula, "en")', generateFormula(formula) === enOutput);
}

// ---------------------------------------------------------------------
// F. generateRefPage() table header/row preservation under locale 'es'
// ---------------------------------------------------------------------
{
  const { generateRefPage, data } = require('./generate-reference');
  const page = data.pages.find((p) => p.id === 'ref-01');
  const esOutput = generateRefPage(page, 'es');
  const enOutput = generateRefPage(page, 'en');
  check(n++, 'generateRefPage Spanish output has no unresolved {{...}} tokens', !/\{\{[A-Z0-9_]+\}\}/.test(esOutput));
  check(n++, 'generateRefPage(page) with no locale arg matches generateRefPage(page, "en")', generateRefPage(page) === enOutput);
  // Every English table header cell must still be present verbatim in the Spanish rendering.
  const enHeaders = [...enOutput.matchAll(/<th>([^<]*)<\/th>/g)].map((m) => m[1]);
  const esHeaders = [...esOutput.matchAll(/<th>([^<]*)<\/th>/g)].map((m) => m[1]);
  check(n++, 'generateRefPage Spanish output preserves every English table header cell unchanged', JSON.stringify(enHeaders) === JSON.stringify(esHeaders));
}

// ---------------------------------------------------------------------
// G. generate-spanish-knowledge-cluster.js scope assertions
// ---------------------------------------------------------------------
{
  const src = read('scripts/generate-spanish-knowledge-cluster.js');
  check(n++, 'generate-spanish-knowledge-cluster.js asserts the glossary manifest matches exactly (throws on mismatch)', /assertManifestMatch/.test(src));
  check(n++, 'generate-spanish-knowledge-cluster.js asserts exactly 9 formulas', /formulas\.length !== 9/.test(src));
  check(n++, 'generate-spanish-knowledge-cluster.js cross-checks reference scope against getJsonDrivenScope()', /getJsonDrivenScope/.test(src));
}

// ---------------------------------------------------------------------
// H. inject-i18n-cluster.js search-link anchor tolerance
// ---------------------------------------------------------------------
{
  const { injectSwitcher } = require('./inject-i18n-cluster');
  const htmlTrailingSlash = '<a href="/search/" class="nav-search">x</a>';
  const htmlNoSlash = '<a href="/search" class="nav-search" style="foo">x</a>';
  const links = [{ code: 'es', hreflang: 'es', url: '/es/glossary/free-chlorine' }];
  check(n++, 'injectSwitcher anchors on a trailing-slash /search/ link (calculator page shape)', /i18n-switcher:start/.test(injectSwitcher(htmlTrailingSlash, links, 'en')));
  check(n++, 'injectSwitcher anchors on a no-trailing-slash /search link (glossary/formula/reference page shape)', /i18n-switcher:start/.test(injectSwitcher(htmlNoSlash, links, 'en')));
  check(n++, 'injectSwitcher still throws when no search link is present at all (fail-fast preserved)', (() => { try { injectSwitcher('<a href="/other">x</a>', links, 'en'); return false; } catch (e) { return true; } })());
}

// ---------------------------------------------------------------------
// I. qa-engine.js bilingual-aware checks
// ---------------------------------------------------------------------
{
  const src = read('scripts/qa-engine.js');
  check(n++, 'qa-engine.js TODO placeholder check is case-sensitive (does not flag the Spanish word "todo")', /\/\\bTODO\\b\//.test(src) && !/\\bTODO\\b\|lorem ipsum\/ig/.test(src));
  check(n++, 'qa-engine.js "missing updated date" check also recognizes "última revisión"', /última revisión/.test(src));
}

// Note: full-pipeline English byte-identity (post normalize-seo-metadata,
// inject-nav, entity panels, footer badges, etc.) is NOT re-checked here --
// Sections D-F above already require() generate-glossary.js/
// generate-formulas.js/generate-reference.js directly, which regenerates
// glossary/formulas/reference on disk in their PLAIN, pre-injector form as
// a side effect (the same require()-time-side-effect convention
// test-phase-8m.js already relies on). That plain-vs-fully-baked
// difference is expected here and is not a regression; the authoritative
// English-field-level non-regression proof is validate-phase-8n.js's
// check F1 (byte-identical JSON source data), and full-pipeline HTML
// byte-identity was independently verified via a real `node scripts/
// run-all-generators.js` run (see docs/PHASE-8N-SPANISH-CORE-REFERENCE-
// PRODUCTION.md). Always re-run the full pipeline after this test suite
// before treating the working tree as production-ready.

console.log('');
console.log(`test-phase-8n: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
