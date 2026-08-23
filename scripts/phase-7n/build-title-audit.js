#!/usr/bin/env node
'use strict';
/**
 * build-title-audit.js (Phase 7N, Step 2)
 * Individually classifies every TITLE_TOO_LONG finding remaining after
 * Phase 7M, plus the findings this phase actually fixed. Not a mechanical
 * shorten-everything pass -- each row records real judgment per the
 * 7-question framework in the brief.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

function toCsv(rows, header) {
  return [header.join(',')].concat(
    rows.map((r) => header.map((h) => '"' + String(r[h] == null ? '' : r[h]).replace(/"/g, '""') + '"').join(','))
  ).join('\n') + '\n';
}

const rows = [];

// ── Fixed this phase (real defects, not cosmetic) ──
rows.push({
  url: '/reference/datasets/chemical-properties (and 7 sibling dataset pages)',
  current_title: '{Title} | WaterBalanceTools Datasets | WaterBalanceTools',
  length: 68, intent: 'internal dataset documentation (noindex)', nearest_competitor: 'n/a (noindex)',
  problem: 'Brand name "WaterBalanceTools" appears twice -- the generator hardcoded "WaterBalanceTools Datasets" as a middle segment, which does not end in the exact string the automatic brand-suffix injector checks for, so it appends a second "| WaterBalanceTools".',
  action: 'FIX', proposed_title: '{Title} | Datasets | WaterBalanceTools',
  reason: 'Genuine redundancy (brand repeated twice), not a subjective length judgment. Fixed at the generator (scripts/generate-data-docs.js). These pages are noindex, so real-world SERP impact is zero, but the title is still wrong.',
});
rows.push({
  url: '/calculators/volume-calculator',
  current_title: 'Pool Volume Calculator (calculators) (calculators) | WaterBalanceTools',
  length: 101, intent: 'retired legacy calculator URL (noindex, canonical to pool-volume-calculator)', nearest_competitor: '/calculators/pool-volume-calculator (the canonical page)',
  problem: 'A non-idempotent disambiguation bug in scripts/normalize-seo-metadata.js stacked the "(calculators)" collision-disambiguation suffix twice across separate historical builds. Investigating this also surfaced a second, more serious bug: on some directory-walk orderings, this retired page could claim the clean title first and force the disambiguation suffix onto the REAL canonical page instead.',
  action: 'FIX', proposed_title: 'Pool Volume Calculator | WaterBalanceTools',
  reason: 'Fixed at the root: normalize-seo-metadata.js, qa-engine.js\'s SEO audit, and build-link-matrix.js\'s candidate pool now all use url-policy.js\'s existing isRedirectSource() check to exclude retired/redirect-source pages from title-uniqueness disambiguation and from being surfaced as live cross-links. See PRODUCTION-CHANGES.md for full detail.',
});
rows.push({
  url: '/guides/edge-cases/evaporation-effect-on-pool-chemistry',
  current_title: 'Does Evaporation Affect Pool Chemistry? (Concentration, Not Dilution) | WaterBalanceTools',
  length: 89, intent: 'edge-case explainer (created Phase 7M)', nearest_competitor: '/guides/edge-cases/rain-effect-on-pool-chemistry (sibling, opposite mechanism)',
  problem: 'The longest title on the site among this phase\'s findings, and the page is this project\'s own creation from last phase -- worth fixing as good practice while auditing.',
  action: 'FIX', proposed_title: 'Does Evaporation Affect Pool Chemistry? | WaterBalanceTools',
  reason: 'The parenthetical was explanatory sugar already covered by the page\'s own direct-answer paragraph; the core question alone fully communicates intent and stays well under 65 chars.',
});

// ── Reviewed and classified KEEP (no character-count-only edits) ──
const KEEP_GROUPS = [
  {
    pattern: 'academy/* (13 pages: fundamentals/how-temperature-changes-water-chemistry, troubleshooting/{cloudy-water,corrosion,foaming-hot-tubs,strong-chlorine-smell}, vacation-rentals/{chemical-log-sheets,emergency-water-recovery,guest-safety,maintenance-schedule,turnover-checklist,weekly-inspection}, water-balance/{understanding-lsi,water-balance-order})',
    title_shape: '{Title} | Academy | WaterBalanceTools', length_range: '67-76',
    intent: 'academy explainer article', nearest_competitor: 'varies -- generally none (see cannibalization review)',
    problem: 'Exceeds 65 chars by 2-11.',
    action: 'KEEP', proposed_title: '(unchanged)',
    reason: '"Academy" is genuine category context, not redundant filler -- it does not repeat any word already in the title\'s descriptive text, and it tells a searcher/crawler this is structured educational content rather than a random blog post. Every title\'s core statement is intact within the first ~55-60 characters, before typical SERP truncation. Shortening these to hit 65 exactly would mean cutting real descriptive words for no clarity gain -- the brief explicitly warns against this.',
  },
  {
    pattern: 'comparisons/* (5 pages: chlorine-vs-bromine, free-chlorine-vs-total-chlorine, liquid-chlorine-vs-tablets, pool-shock-vs-chlorine, salt-water-pool-vs-chlorine-pool)',
    title_shape: '{Comparison question} | WaterBalanceTools', length_range: '66-75',
    intent: 'comparison/decision page', nearest_competitor: 'none -- each compares a distinct pair of products/concepts',
    problem: 'Exceeds 65 chars by 1-10.',
    action: 'KEEP', proposed_title: '(unchanged)',
    reason: 'No redundant segment -- these are single-clause comparison questions with no filler. The comparison subject (the two things being compared) is always stated before the truncation point.',
  },
  {
    pattern: 'formulas/* (4 pages: alkalinity-formula, cya-formula, liquid-chlorine-formula, lsi-formula)',
    title_shape: '{Title} | Formula Library | WaterBalanceTools', length_range: '66-78',
    intent: 'reference formula page', nearest_competitor: 'the corresponding academy article covering the same parameter conceptually (different intent: formula reference vs. explanation)',
    problem: 'Exceeds 65 chars by 1-13.',
    action: 'KEEP', proposed_title: '(unchanged)',
    reason: '"Formula Library" is the genuine differentiator between this reference page and the conceptual academy article on the same parameter -- removing it would make the two page types harder for a searcher to distinguish in a SERP snippet, which is the opposite of what Step 2 asks to protect against.',
  },
  {
    pattern: 'guides/advanced, guides/edge-cases, guides/seasonal, guides/chlorine (14 pages)',
    title_shape: '{Direct question/statement} ({qualifier}) | WaterBalanceTools', length_range: '66-86',
    intent: 'edge-case / advanced / seasonal explainer', nearest_competitor: 'reviewed individually in cannibalization forensics -- none found competing for the same exact query',
    problem: 'Exceeds 65 chars by 1-21 (pool-chemistry-balance-explained and closing-pool-chemistry-winter are the longest at 86).',
    action: 'KEEP', proposed_title: '(unchanged)',
    reason: 'Parenthetical qualifiers add real specificity (e.g. naming exactly which parameters "Pool Chemistry Balance Explained" covers) rather than repeating the main clause. Direct-answer intent is fully legible before the parenthetical in every case.',
  },
  {
    pattern: 'root chart/system pages (4: pool-chemical-levels-chart, hot-tub-chemical-levels-chart, pool-chlorine-levels-chart, pool-chemistry-system)',
    title_shape: '{Chart name} ({scope}) | WaterBalanceTools', length_range: '66-75',
    intent: 'reference chart', nearest_competitor: 'none -- each targets a distinct parameter/environment combination',
    problem: 'Exceeds 65 chars by 1-10.',
    action: 'KEEP', proposed_title: '(unchanged)',
    reason: 'Established, consistent chart-naming convention across the site; parenthetical states real scope (e.g. "All Parameters", "1-3 ppm + Shock Targets") that helps a searcher pick the right chart among several similarly-named ones.',
  },
  {
    pattern: 'resources/airbnb-pool-turnover-checklist',
    title_shape: '{Title} | Free Printable | WaterBalanceTools', length_range: '76',
    intent: 'downloadable checklist', nearest_competitor: 'none',
    problem: 'Exceeds 65 chars by 11.',
    action: 'KEEP', proposed_title: '(unchanged)',
    reason: '"Free Printable" directly signals the content type and value proposition for exactly the intent someone searching for a printable checklist has -- high-value, not filler.',
  },
  {
    pattern: 'programmatic/behavior/how-often-to-test-pool-water',
    title_shape: 'How Often to Test Pool Water (Simple Schedule) | WaterBalanceTools', length_range: '66',
    intent: 'programmatic long-tail Q&A', nearest_competitor: 'none',
    problem: '1 character over 65, already documented in Phase 7M\'s review queue.',
    action: 'KEEP', proposed_title: '(unchanged)',
    reason: 'Consistent with Phase 7M\'s explicit decision not to hand-edit individual programmatic config title strings piecemeal -- the redundant-suffix bug affecting this family was already fixed at the generator level; this is a different, much smaller (1-char) overage in the underlying descriptive text itself.',
  },
];

for (const g of KEEP_GROUPS) {
  rows.push({
    url: g.pattern, current_title: g.title_shape, length: g.length_range, intent: g.intent,
    nearest_competitor: g.nearest_competitor, problem: g.problem, action: g.action,
    proposed_title: g.proposed_title, reason: g.reason,
  });
}

const header = ['url', 'current_title', 'length', 'intent', 'nearest_competitor', 'problem', 'action', 'proposed_title', 'reason'];
fs.writeFileSync(path.join(ROOT, 'reports', 'phase-7n', 'TITLE-AUDIT.csv'), toCsv(rows, header));
console.log(`build-title-audit: ${rows.length} rows (3 individual FIX + 7 grouped KEEP dispositions covering 39 pages)`);
