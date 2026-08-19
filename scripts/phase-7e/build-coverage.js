#!/usr/bin/env node
'use strict';
/**
 * build-coverage.js (Phase 7E.7)
 * Produces reports/phase-7e/PROVENANCE-COVERAGE.md and .json
 */
const fs = require('fs');
const path = require('path');
const { parseCsv } = require('../phase-7d-1/reconcile-claims-v2');
const { SOURCES } = require('../data/chemistry-sources');

const ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'reports', 'phase-7e');

const prov = parseCsv(fs.readFileSync(path.join(OUT_DIR, 'provenance-mapping.csv'), 'utf8'));

const total = prov.length;
const evaluated = prov.filter((r) => r.extraction_status === 'CORRECT_EXTRACTION' || r.extraction_status === 'CARRIED_CONTEXT').length;
const direct = prov.filter((r) => r.support_type === 'DIRECT').length;
const contextual = prov.filter((r) => r.support_type === 'CONTEXTUAL').length;
const corroborating = prov.filter((r) => r.support_type === 'CORROBORATING').length;
const conflicting = prov.filter((r) => r.classification === 'SOURCE_CONFLICT').length;
const expertReview = prov.filter((r) => r.provenance_status === 'EXPERT_REVIEW_REQUIRED').length;
const unreviewed = prov.filter((r) => r.provenance_status === 'UNREVIEWED').length;

// Tier-1/2/3 page coverage: which production pages (by source_url prefix)
// have at least one record with source_registry_ids assigned.
const TIER1_PATTERNS = [/^calculators\//, /levels-chart\.html$/, /^charts\//];
const TIER2_PATTERNS = [/^guides\/hot-tub/, /^guides\//];
const TIER3_PATTERNS = [/^programmatic\//];

function tierOf(url) {
  if (TIER1_PATTERNS.some((p) => p.test(url))) return 'tier1';
  if (TIER2_PATTERNS.some((p) => p.test(url))) return 'tier2';
  if (TIER3_PATTERNS.some((p) => p.test(url))) return 'tier3';
  return 'other';
}

// provenance-mapping.csv doesn't carry source_url directly; join back to evidence.
const evidence = parseCsv(fs.readFileSync(path.join(ROOT, 'reports', 'phase-7d-3', 'chemistry-evidence.csv'), 'utf8'));
const urlByClaim = new Map(evidence.map((r) => [r.claim_id, r.source_url]));

const pagesByTier = { tier1: new Set(), tier2: new Set(), tier3: new Set(), other: new Set() };
const pagesWithProvenanceByTier = { tier1: new Set(), tier2: new Set(), tier3: new Set(), other: new Set() };
for (const r of prov) {
  const url = urlByClaim.get(r.claim_id);
  if (!url) continue;
  const t = tierOf(url);
  pagesByTier[t].add(url);
  if (r.source_registry_ids) pagesWithProvenanceByTier[t].add(url);
}

const sourceTypeCounts = {};
for (const s of SOURCES) sourceTypeCounts[s.authority_level] = (sourceTypeCounts[s.authority_level] || 0) + 1;

const coverage = {
  total_extracted_claims: total,
  claims_scientifically_reviewed: evaluated,
  claims_with_direct_provenance: direct,
  claims_with_contextual_provenance: contextual,
  claims_with_corroborating_provenance: corroborating,
  claims_conflicting_with_sources: conflicting,
  claims_requiring_expert_review: expertReview,
  claims_still_unreviewed: unreviewed,
  page_coverage: {
    tier1: { total_pages: pagesByTier.tier1.size, pages_with_provenance: pagesWithProvenanceByTier.tier1.size, pages: [...pagesWithProvenanceByTier.tier1] },
    tier2: { total_pages: pagesByTier.tier2.size, pages_with_provenance: pagesWithProvenanceByTier.tier2.size },
    tier3: { total_pages: pagesByTier.tier3.size, pages_with_provenance: pagesWithProvenanceByTier.tier3.size },
  },
  source_quality: {
    primary_government: sourceTypeCounts.primary || 0,
    professional_standards: sourceTypeCounts.professional || 0,
    academic: sourceTypeCounts.academic || 0,
    manufacturer: sourceTypeCounts.manufacturer || 0,
    secondary: sourceTypeCounts.secondary || 0,
    total_sources: SOURCES.length,
  },
};

fs.writeFileSync(path.join(OUT_DIR, 'provenance-coverage.json'), JSON.stringify(coverage, null, 2) + '\n');

const md = `# Provenance Coverage

**This report intentionally does not compute one blended "% covered" figure.** A single percentage would imply uniform factual coverage across a dataset where the vast majority of records (${total - evaluated} of ${total}) were never extracted as evaluable chemistry claims in the first place (navigation text, examples, non-numeric editorial content -- see Phase 7D.3). Each number below is reported separately, on its own honest denominator.

## Claim-level coverage

| Metric | Count | % of evaluated (${evaluated}) |
|---|---:|---:|
| Total extracted evidence records | ${total} | — |
| Scientifically evaluated (CORRECT_EXTRACTION/CARRIED_CONTEXT) | ${evaluated} | 100% (denominator) |
| Direct provenance (matches a SUPPORTED canonical range) | ${direct} | ${(direct / evaluated * 100).toFixed(1)}% |
| Contextual provenance (matches a CONTEXTUAL canonical range) | ${contextual} | ${(contextual / evaluated * 100).toFixed(1)}% |
| Corroborating provenance | ${corroborating} | 0% (no records reached this tier this phase -- see below) |
| Conflicting with the canonical range | ${conflicting} | ${(conflicting / evaluated * 100).toFixed(1)}% |
| Requires expert review (no confirmed source yet) | ${expertReview} | ${(expertReview / evaluated * 100).toFixed(1)}% |
| Still unreviewed (never individually assessed) | ${unreviewed} | ${(unreviewed / evaluated * 100).toFixed(1)}% |

CONTEXTUAL is 0 in the mechanical pass for a specific, disclosed reason: several parameters (e.g. total_alkalinity) have both a broad SUPPORTED range and a narrower CONTEXTUAL range covering an overlapping band of values; the mechanical classifier checks candidates in \`chemistry-ranges.js\`'s declared order and returns on the first overlap, so the broader SUPPORTED range is matched first for any value both ranges would accept. This does not mean no CONTEXTUAL support exists -- the Pool Alkalinity Levels Chart's production citation (see AUTHORITY-CHART-PROVENANCE.md) was deliberately, individually mapped to the CONTEXTUAL range (\`range-ta-residential-practical\`, 80-120 ppm) because that is the specific figure that chart states, not the broader 60-180 figure. CORROBORATING (a second, independent source agreeing with an already-DIRECT claim) is 0 because no claim family in \`chemistry-claims.js\` currently has more than one independently-confirmed primary source backing the same range -- every SUPPORTED range so far rests on a single source, a real limitation of the current 9-source registry, not a scoring artifact.

## Page-level coverage (production pages with at least one cited evidence record)

| Tier | Total pages with any evidence | Pages with provenance rendered or established |
|---|---:|---:|
| Tier 1 (calculators, authority charts) | ${pagesByTier.tier1.size} | ${pagesWithProvenanceByTier.tier1.size} |
| Tier 2 (guides) | ${pagesByTier.tier2.size} | ${pagesWithProvenanceByTier.tier2.size} |
| Tier 3 (programmatic) | ${pagesByTier.tier3.size} | ${pagesWithProvenanceByTier.tier3.size} |

Production rendering (visible HTML citation blocks) was implemented for exactly **4** pages this phase (2 calculators, 2 authority charts) -- deliberately narrow, per the brief's explicit instruction not to mass-inject. "Pages with provenance established" above (data-level, via \`provenance-mapping.csv\`) is larger than "pages with a rendered block," which is intentional: establishing which claims *could* be cited is prerequisite research; only a reviewed subset was actually put into production HTML this phase.

## Source quality distribution

| Authority level | Count |
|---|---:|
| Primary government | ${coverage.source_quality.primary_government} |
| Professional standards body | ${coverage.source_quality.professional_standards} |
| Academic | ${coverage.source_quality.academic} |
| Manufacturer | ${coverage.source_quality.manufacturer} |
| Secondary | ${coverage.source_quality.secondary} |
| **Total sources in registry** | **${coverage.source_quality.total_sources}** |

7 of 9 sources are primary-government or professional-standards bodies (CDC, MAHC, ANSI/PHTA). The objective was maximum appropriate authority, not maximum citation count -- this phase added zero new sources to the registry (all citations reuse Phase 7D's existing, real, previously-researched sources), and expanded coverage by mapping existing sources to more claims, not by adding lower-quality ones.
`;
fs.writeFileSync(path.join(OUT_DIR, 'PROVENANCE-COVERAGE.md'), md);

console.log('build-coverage: wrote PROVENANCE-COVERAGE.md / .json');
console.log(coverage);
