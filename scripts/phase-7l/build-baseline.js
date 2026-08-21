#!/usr/bin/env node
'use strict';
/**
 * build-baseline.js (Phase 7L, Step 1)
 * Fresh inventory of citation state sitewide before any Phase 7L rendering
 * changes. Run BEFORE any Phase 7L production edits.
 */
const fs = require('fs');
const path = require('path');
const { CLAIMS } = require('../data/chemistry-claims');
const { SOURCES } = require('../data/chemistry-sources');

const ROOT = path.join(__dirname, '..', '..');

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'reports') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
}

const allHtml = [];
walk(ROOT, allHtml);

let indexable = 0;
let withCitations = 0;
let citationCountTotal = 0;
const perPage = [];
const bySourceCount = {};

for (const file of allHtml) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);
  const isNoindex = /name="robots"\s+content="noindex/i.test(html);
  if (!isNoindex) indexable++;
  const hasCitations = html.includes('knowledge-sources-real');
  if (hasCitations) {
    withCitations++;
    const matches = [...html.matchAll(/knowledge-source-item[^>]*>\s*<a href="([^"]+)"/g)];
    citationCountTotal += matches.length;
    perPage.push({ url: rel, citations: matches.length });
    for (const m of matches) {
      bySourceCount[m[1]] = (bySourceCount[m[1]] || 0) + 1;
    }
  }
}

// Claim-family eligibility from the canonical chemistry-claims.js layer
const eligibleStatuses = new Set(['VERIFIED', 'SUPPORTED', 'CONTEXTUAL']);
const supportedClaims = CLAIMS.filter((c) => eligibleStatuses.has(c.status) && c.source_ids && c.source_ids.length > 0);
const unsupportedClaims = CLAIMS.filter((c) => !eligibleStatuses.has(c.status) || !c.source_ids || c.source_ids.length === 0);

const byParameter = {};
for (const c of CLAIMS) {
  byParameter[c.parameter_id] = byParameter[c.parameter_id] || { total: 0, supported: 0 };
  byParameter[c.parameter_id].total++;
  if (eligibleStatuses.has(c.status) && c.source_ids && c.source_ids.length) byParameter[c.parameter_id].supported++;
}

// Entity-level provenance from Phase 7K's resolved overlay
let entityResolved = [];
try {
  const csv = fs.readFileSync(path.join(ROOT, 'reports', 'phase-7k', 'resolved-claims.csv'), 'utf8').trim().split('\n').slice(1);
  entityResolved = csv.map((l) => l.split(',').map((s) => s.replace(/^"|"$/g, '')));
} catch (e) { /* ok if absent */ }

const summary = {
  generated: new Date().toISOString().slice(0, 10),
  total_html_files: allHtml.length,
  indexable_pages: indexable,
  pages_with_visible_citations: withCitations,
  total_citation_links: citationCountTotal,
  canonical_claims_total: CLAIMS.length,
  canonical_claims_supported_eligible: supportedClaims.length,
  canonical_claims_not_eligible: unsupportedClaims.length,
  sources_total: SOURCES.length,
  citation_count_by_source: bySourceCount,
  claims_by_parameter: byParameter,
  pages_with_citations_detail: perPage,
  entity_claims_resolved_phase_7k: entityResolved.length,
};

fs.mkdirSync(path.join(ROOT, 'reports', 'phase-7l'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'reports', 'phase-7l', 'PHASE-7L-BASELINE.json'), JSON.stringify(summary, null, 2));

const md = `# Phase 7L — Fresh Citation Baseline

Generated: ${summary.generated}

## Sitewide inventory

- Total HTML files: ${summary.total_html_files}
- Indexable pages (no noindex): ${summary.indexable_pages}
- Pages with visible external citations: ${summary.pages_with_visible_citations}
- Total citation links rendered sitewide: ${summary.total_citation_links}

## Canonical claim layer (chemistry-claims.js)

- Total canonical claims: ${summary.canonical_claims_total}
- Eligible for citation (VERIFIED/SUPPORTED/CONTEXTUAL with >=1 source): ${summary.canonical_claims_supported_eligible}
- Not eligible (REQUIRES_REVIEW/UNSUPPORTED/AMBIGUOUS or no source): ${summary.canonical_claims_not_eligible}

## Pages with visible citations (Phase 7E baseline, unchanged until this phase's edits)

${perPage.map((p) => `- ${p.url} (${p.citations} citation${p.citations === 1 ? '' : 's'})`).join('\n')}

## Citation count by source

${Object.entries(bySourceCount).map(([url, n]) => `- ${url}: ${n}`).join('\n') || '(none)'}

## Claims by parameter (total / eligible)

${Object.entries(byParameter).map(([p, v]) => `- ${p}: ${v.total} total, ${v.supported} eligible`).join('\n')}

## Entity-level (Phase 7J/7K)

- Entity claims resolved with real sourcing in Phase 7K: ${summary.entity_claims_resolved_phase_7k}

This is the pre-7L state. Phase 7E deliberately limited visible citation rendering to a small set of pages while the provenance architecture was being validated; Phase 7L's job is to expand this selectively using the now-expanded Phase 7K source registry, not to mass-inject.
`;

fs.writeFileSync(path.join(ROOT, 'reports', 'phase-7l', 'PHASE-7L-BASELINE.md'), md);
console.log(`Baseline: ${summary.total_html_files} html files, ${summary.pages_with_visible_citations} with citations (${summary.total_citation_links} links), ${summary.canonical_claims_supported_eligible}/${summary.canonical_claims_total} canonical claims eligible.`);
