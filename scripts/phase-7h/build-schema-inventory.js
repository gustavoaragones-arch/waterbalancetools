#!/usr/bin/env node
'use strict';
/**
 * build-schema-inventory.js (Phase 7H, Step 2)
 * Page-by-page schema inventory: what schema exists, what's expected for
 * that page type, and why.
 */
const fs = require('fs');
const path = require('path');
const urlPolicy = require('../url-policy');

const ROOT = path.join(__dirname, '..', '..');

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.git') || e.name === 'reports') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.isFile() && e.name.endsWith('.html')) out.push(full);
  }
}

function pageTypeFor(relPath) {
  if (relPath === 'index.html') return 'HOME';
  const isHubIndex = /\/index\.html$/.test(relPath) && relPath.split('/').length === 2;
  const top = relPath.split('/')[0];
  if (isHubIndex && (top === 'calculators' || top === 'glossary' || top === 'entities')) return 'HUB_INDEX';
  const map = {
    calculators: 'CALCULATOR', charts: 'AUTHORITY_CHART', guides: 'GUIDE', academy: 'GUIDE',
    glossary: 'GLOSSARY', entities: 'ENTITY', reference: 'REFERENCE', legal: 'LEGAL',
    editorial: 'POLICY_PAGE', methodology: 'POLICY_PAGE', provenance: 'POLICY_PAGE',
    revisions: 'POLICY_PAGE', releases: 'RELEASE_NOTES', printable: 'PRINTABLE', printables: 'PRINTABLE',
    programmatic: 'PROGRAMMATIC_LONGTAIL', comparisons: 'COMPARISON', formulas: 'FORMULA',
    resources: 'RESOURCE', maintenance: 'GUIDE', qa: 'INTERNAL_TOOLING', audit: 'INTERNAL_TOOLING',
    reports: 'INTERNAL_TOOLING', tools: 'INTERNAL_TOOLING', about: 'STATIC', search: 'INTERNAL_TOOLING',
  };
  if (relPath.indexOf('/') === -1) return 'ROOT_CHART_OR_UTILITY';
  return map[top] || 'OTHER';
}

// Expected schema by page type, per the Phase 7H canonical schema policy
// (see SCHEMA-RESOLUTION.md Step 3). Never require FAQPage/HowTo -- those
// are optional and content-gated everywhere.
const EXPECTED = {
  CALCULATOR: ['WebApplication', 'BreadcrumbList'],
  AUTHORITY_CHART: ['BreadcrumbList'],
  GUIDE: ['BreadcrumbList'],
  GLOSSARY: ['DefinedTerm', 'BreadcrumbList'],
  ENTITY: ['DefinedTerm', 'BreadcrumbList'],
  REFERENCE: ['BreadcrumbList'],
  LEGAL: ['BreadcrumbList'],
  POLICY_PAGE: ['WebPage', 'BreadcrumbList'],
  RELEASE_NOTES: ['WebPage', 'BreadcrumbList'],
  PRINTABLE: ['WebPage', 'BreadcrumbList'],
  PROGRAMMATIC_LONGTAIL: ['BreadcrumbList'],
  COMPARISON: ['BreadcrumbList'],
  FORMULA: ['BreadcrumbList'],
  RESOURCE: ['BreadcrumbList'],
  // Organization/WebSite schema is deliberately homepage-only sitewide
  // (see components/global-schema.html) -- duplicating it elsewhere risks
  // exactly the "multiple Organization entities" problem Step 19
  // prohibits, so STATIC pages (about/, etc.) are not expected to carry
  // their own copy.
  STATIC: ['BreadcrumbList'],
  HOME: ['Organization'],
  HUB_INDEX: ['BreadcrumbList'],
  ROOT_CHART_OR_UTILITY: ['BreadcrumbList'],
  INTERNAL_TOOLING: [],
  OTHER: [],
};

function run() {
  const pages = [];
  walk(ROOT, pages);
  const rows = [];

  for (const abs of pages) {
    const relPath = path.relative(ROOT, abs).replace(/\\/g, '/');
    if (urlPolicy.isNonPage(relPath)) continue;
    const html = fs.readFileSync(abs, 'utf8');
    const pageType = pageTypeFor(relPath);
    const isProd = urlPolicy.isProductionPage(relPath);
    const isIndexable = isProd && urlPolicy.isIndexablePage(relPath, html);
    const isRedirectSrc = urlPolicy.isRedirectSource(relPath);

    const typesPresent = [...html.matchAll(/"@type"\s*:\s*"([A-Za-z]+)"/g)].map((m) => m[1]);
    const uniquePresent = [...new Set(typesPresent)];
    const expected = EXPECTED[pageType] || [];

    let schemaStatus;
    let missingReason = '';
    let questionableReason = '';
    if (isRedirectSrc) {
      schemaStatus = 'NOT_APPLICABLE';
      missingReason = 'Retired REDIRECT_SOURCES URL -- non-production regardless of physical file presence.';
    } else if (!isProd) {
      schemaStatus = 'NOT_APPLICABLE';
      missingReason = 'Internal tooling / non-production directory per url-policy.js.';
    } else if (!isIndexable) {
      schemaStatus = uniquePresent.length ? 'PRESENT_NOINDEX' : 'NOT_REQUIRED_NOINDEX';
      missingReason = uniquePresent.length ? '' : 'Page is noindex; schema optional.';
    } else {
      const missing = expected.filter((t) => !uniquePresent.includes(t));
      schemaStatus = missing.length === 0 ? 'COMPLETE' : 'INCOMPLETE';
      missingReason = missing.length ? `Missing expected: ${missing.join(', ')}` : '';
    }

    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = h1Match ? h1Match[1].replace(/<[^>]*>/g, '').trim() : '';

    rows.push({
      url: 'https://waterbalancetools.com/' + relPath.replace(/index\.html$/, '').replace(/\.html$/, ''),
      page_type: pageType,
      visible_content_type: h1 ? 'has_h1' : 'no_h1',
      schema_types_present: uniquePresent.join(';'),
      schema_types_expected: expected.join(';'),
      schema_status: schemaStatus,
      questionable_reason: questionableReason,
      missing_reason: missingReason,
      source_of_schema: relPath.startsWith('calculators/') || relPath.startsWith('printable') || relPath === 'resources/index.html' ? 'static_hand_authored' : 'generator',
      generator: 'see PRODUCTION-CHANGES.md',
      template: pageType,
    });
  }

  const header = ['url', 'page_type', 'visible_content_type', 'schema_types_present', 'schema_types_expected', 'schema_status', 'questionable_reason', 'missing_reason', 'source_of_schema', 'generator', 'template'];
  const csv = [header.join(',')].concat(
    rows.map((r) => header.map((h) => '"' + String(r[h]).replace(/"/g, '""') + '"').join(','))
  ).join('\n') + '\n';

  const outDir = path.join(ROOT, 'reports', 'phase-7h');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'schema-inventory.csv'), csv);
  console.log(`build-schema-inventory: wrote ${rows.length} rows to reports/phase-7h/schema-inventory.csv`);
}

run();
