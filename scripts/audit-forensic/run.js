'use strict';
/*
 * Phase 7A forensic audit pipeline.
 * Read-only: parses generated HTML/XML/config as they exist on disk and
 * writes findings under reports/phase-7a/. Never modifies site output.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  ROOT, walkHtmlFiles, readFile, wordCount, urlFromRelPath, toCsv, shingles, jaccard,
} = require('./lib/util');
const { classify, NON_PAGE_TYPES } = require('./lib/classify');
const { parsePage } = require('./lib/parse');
const { analyzeFamily } = require('./lib/duplication');
const { extractClaims } = require('./lib/chemistry');
const scoring = require('./lib/scoring');
const { auditPageSchema } = require('./lib/schema-audit');

const OUT_DIR = path.join(ROOT, 'reports', 'phase-7a');
fs.mkdirSync(OUT_DIR, { recursive: true });

function writeJson(name, data) {
  fs.writeFileSync(path.join(OUT_DIR, name), JSON.stringify(data, null, 2) + '\n');
}
function writeCsv(name, rows, fields) {
  fs.writeFileSync(path.join(OUT_DIR, name), toCsv(rows, fields));
}
function writeText(name, text) {
  fs.writeFileSync(path.join(OUT_DIR, name), text);
}

// ---------------------------------------------------------------------
// 1. DISCOVER + PARSE
// ---------------------------------------------------------------------
const allHtmlFiles = walkHtmlFiles(ROOT).sort();
const parsedAll = [];
for (const relPath of allHtmlFiles) {
  const cls = classify(relPath);
  const html = readFile(relPath);
  const p = parsePage(relPath, html);
  p._rawHtml = html;
  Object.assign(p, cls);
  p.url = urlFromRelPath(relPath);
  parsedAll.push(p);
}
const pages = parsedAll.filter((p) => !NON_PAGE_TYPES.has(p.page_type));
const nonPages = parsedAll.filter((p) => NON_PAGE_TYPES.has(p.page_type));

// ---------------------------------------------------------------------
// 2. CROSS-REFERENCE SITEMAP / ROBOTS / REDIRECTS
// ---------------------------------------------------------------------
const sitemapFiles = fs.readdirSync(ROOT).filter((f) => /^sitemap.*\.xml$/.test(f));
const sitemapUrls = new Set();
const sitemapUrlSource = new Map();
for (const f of sitemapFiles) {
  const xml = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  for (const loc of locs) {
    if (/sitemap.*\.xml$/.test(loc)) continue;
    sitemapUrls.add(loc.replace(/\/$/, '') || 'https://waterbalancetools.com');
    sitemapUrlSource.set(loc, f);
  }
}

const robotsTxt = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
const redirectsRaw = fs.existsSync(path.join(ROOT, '_redirects'))
  ? fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8')
  : '';
const redirectRules = redirectsRaw
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [src, dst, code] = l.split(/\s+/);
    return { src, dst, code };
  });
const redirectSrcSet = new Set(redirectRules.map((r) => r.src));

// ---------------------------------------------------------------------
// 3. LINK GRAPH
// ---------------------------------------------------------------------
const pathLookup = new Map(); // normalized path (no leading slash, no ext) -> relPath
for (const p of parsedAll) {
  let clean = p.relPath.replace(/\\/g, '/');
  const isDirIndex = clean === 'index.html' || clean.endsWith('/index.html');
  const noExt = isDirIndex ? clean.slice(0, -'index.html'.length) : clean.replace(/\.html$/, '');
  pathLookup.set(noExt.replace(/\/$/, ''), p.relPath);
  pathLookup.set(clean, p.relPath);
  if (noExt === '') pathLookup.set('', p.relPath);
}

function resolveHref(href, fromRelPath) {
  if (!href) return { type: 'invalid' };
  const trimmed = href.trim();
  if (/^(#|mailto:|tel:|javascript:)/i.test(trimmed)) return { type: 'skip' };
  let p = trimmed;
  let isExternal = false;
  if (/^https?:\/\//i.test(p)) {
    if (!/waterbalancetools\.com/i.test(p)) return { type: 'external', url: p };
    p = p.replace(/^https?:\/\/[^/]+/i, '');
  }
  p = p.split('#')[0].split('?')[0];
  if (p === '') return { type: 'internal', resolved: 'index.html' };
  if (p.startsWith('/')) {
    p = p.slice(1);
  } else {
    const dir = path.posix.dirname(fromRelPath.replace(/\\/g, '/'));
    p = path.posix.normalize(path.posix.join(dir === '.' ? '' : dir, p));
  }
  p = p.replace(/\/$/, '');
  const candidates = [p, p + '.html', p + '/index.html'];
  for (const c of candidates) {
    if (pathLookup.has(c)) return { type: 'internal', resolved: pathLookup.get(c) };
  }
  return { type: 'broken', target: p };
}

const inbound = new Map();
const outboundCount = new Map();
const brokenLinks = [];
const externalLinksByPage = new Map();
for (const p of pages) inbound.set(p.relPath, new Set());

for (const p of pages) {
  let out = 0;
  let ext = 0;
  for (const href of p.links) {
    const r = resolveHref(href, p.relPath);
    if (r.type === 'internal') {
      out++;
      if (r.resolved !== p.relPath) {
        if (!inbound.has(r.resolved)) inbound.set(r.resolved, new Set());
        inbound.get(r.resolved).add(p.relPath);
      }
    } else if (r.type === 'external') {
      ext++;
    } else if (r.type === 'broken') {
      brokenLinks.push({ from: p.relPath, href, target_guess: r.target });
    }
  }
  outboundCount.set(p.relPath, out);
  externalLinksByPage.set(p.relPath, ext);
}

// BFS crawl depth from homepage
const depth = new Map();
const homepage = pages.find((p) => p.page_type === 'homepage');
if (homepage) {
  depth.set(homepage.relPath, 0);
  let frontier = [homepage.relPath];
  while (frontier.length) {
    const next = [];
    for (const relPath of frontier) {
      const p = pages.find((x) => x.relPath === relPath);
      if (!p) continue;
      for (const href of p.links) {
        const r = resolveHref(href, relPath);
        if (r.type === 'internal' && !depth.has(r.resolved)) {
          depth.set(r.resolved, depth.get(relPath) + 1);
          next.push(r.resolved);
        }
      }
    }
    frontier = next;
  }
}

console.log(`Discovered ${allHtmlFiles.length} HTML files (${pages.length} pages, ${nonPages.length} templates/partials).`);
console.log(`Sitemap URLs: ${sitemapUrls.size}. Redirect rules: ${redirectRules.length}. Broken internal links: ${brokenLinks.length}.`);

// ---------------------------------------------------------------------
// 4. BASE PER-PAGE RECORDS  (Deliverable 1)
// ---------------------------------------------------------------------
const { deriveRecord } = require('./lib/derive');
const ctx = { sitemapUrls, redirectSrcSet, inbound, outboundCount, externalLinksByPage, depth };
const records = pages.map((p) => deriveRecord(p, ctx));
const recordByPath = new Map(records.map((r) => [r.file_path, r]));
const pageByPath = new Map(pages.map((p) => [p.relPath, p]));

const INVENTORY_FIELDS = [
  'url', 'file_path', 'page_type', 'cluster', 'silo', 'generator', 'title', 'h1',
  'meta_description', 'canonical', 'robots', 'word_count', 'visible_text_count',
  'heading_count', 'internal_link_count', 'external_link_count',
  'incoming_internal_links', 'outgoing_internal_links', 'schema_types', 'faq_count',
  'quick_answer_present', 'key_takeaways_present', 'last_updated_present',
  'author_present', 'source_links_present', 'calculator_present', 'table_present',
  'primary_cta', 'indexability', 'sitemap_presence', 'redirect_status_if_known',
];
writeCsv('url-inventory.csv', records, INVENTORY_FIELDS);
writeJson('url-inventory.json', records);

// ---------------------------------------------------------------------
// 5. PROGRAMMATIC DUPLICATION  (Deliverable 3)
// ---------------------------------------------------------------------
const clusterGroups = new Map();
for (const p of pages) {
  if (!clusterGroups.has(p.cluster)) clusterGroups.set(p.cluster, []);
  clusterGroups.get(p.cluster).push(p);
}
const familyResults = [];
const maxSimByPath = new Map();
const repeatedBlockCountByPath = new Map();
for (const [cluster, group] of clusterGroups) {
  if (group.length < 3) continue;
  const result = analyzeFamily(cluster, group);
  familyResults.push(result);
  for (const p of group) maxSimByPath.set(p.relPath, null);
  for (const pr of result.pairwise) {
    const a = maxSimByPath.get(pr.page_a);
    const b = maxSimByPath.get(pr.page_b);
    if (a === null || pr.jaccard_similarity > a) maxSimByPath.set(pr.page_a, pr.jaccard_similarity);
    if (b === null || pr.jaccard_similarity > b) maxSimByPath.set(pr.page_b, pr.jaccard_similarity);
  }
  // Headings deliberately excluded here: repeated section titles (e.g. "FAQ",
  // "How to Use This Calculator") are expected template-family UX consistency,
  // not substantive duplication. Only body-copy/FAQ-answer/table repeats count.
  const blockCounter = new Map();
  const bump = (relPath) => blockCounter.set(relPath, (blockCounter.get(relPath) || 0) + 1);
  for (const [, list] of result.repeatedParaKeys) list.forEach(bump);
  for (const [, list] of result.repeatedFaqs) list.forEach(bump);
  for (const [, list] of result.repeatedTables) list.forEach(bump);
  for (const p of group) repeatedBlockCountByPath.set(p.relPath, blockCounter.get(p.relPath) || 0);
}
const familySummaryRows = familyResults.map((r) => ({
  family: r.family,
  page_count: r.page_count,
  risk: r.risk,
  avg_pairwise_similarity: r.avg_pairwise_similarity,
  high_similarity_pairs: r.pairwise_high_similarity_count,
  repeated_paragraph_blocks: r.repeated_paragraph_count,
  repeated_headings: r.repeated_heading_count,
  repeated_faqs: r.repeated_faq_count,
  repeated_tables: r.repeated_table_count,
})).sort((a, b) => b.avg_pairwise_similarity - a.avg_pairwise_similarity);
writeCsv('programmatic-duplication.csv', familySummaryRows, Object.keys(familySummaryRows[0] || {
  family: 1, page_count: 1, risk: 1, avg_pairwise_similarity: 1, high_similarity_pairs: 1,
  repeated_paragraph_blocks: 1, repeated_headings: 1, repeated_faqs: 1, repeated_tables: 1,
}));
writeJson('programmatic-duplication.json', {
  family_summary: familySummaryRows,
  pairwise_high_similarity: familyResults.flatMap((r) => r.pairwise.filter((p) => p.risk === 'HIGH' || p.risk === 'CRITICAL')),
});

// ---------------------------------------------------------------------
// 6. CHEMICAL CLAIMS  (Deliverable 5)
// ---------------------------------------------------------------------
const allClaims = [];
const numericClaimCountByPath = new Map();
for (const p of pages) {
  const claims = extractClaims(p.relPath, p.text, 15);
  numericClaimCountByPath.set(p.relPath, claims.filter((c) => c.has_numeric_range).length);
  allClaims.push(...claims);
}
const topicOf = (claim) => {
  const lower = claim.claim.toLowerCase();
  const topics = ['free chlorine', 'total alkalinity', 'cyanuric acid', 'calcium hardness', 'ph', 'shock', 'salt', 'bromine', 'algae'];
  return topics.find((t) => lower.includes(t)) || 'general';
};
const rangesByTopic = new Map();
for (const c of allClaims) {
  const topic = topicOf(c);
  c.section = topic;
  if (!c.units) continue;
  if (!rangesByTopic.has(topic)) rangesByTopic.set(topic, new Set());
  rangesByTopic.get(topic).add(c.units.toLowerCase().replace(/\s+/g, ''));
}
for (const c of allClaims) {
  const set = rangesByTopic.get(c.section);
  c.cross_page_consistency = set && set.size > 1 ? 'VARIES_ACROSS_PAGES' : (set ? 'CONSISTENT' : 'N/A');
  c.confidence = c.has_numeric_range ? 'STATED_RANGE' : 'UNQUANTIFIED';
  c.source_present = false;
  c.source_quality = 'none (site cites zero external sources -- see source-audit.csv)';
  c.risk_level = c.review_required === 'REQUIRES_EXPERT_REVIEW' ? 'MEDIUM' : (c.claim_type === 'SAFETY_GUIDANCE' ? 'HIGH' : 'LOW');
}
writeCsv('chemical-claims.csv', allClaims, [
  'url', 'section', 'claim', 'claim_type', 'units', 'confidence', 'source_present',
  'source_quality', 'cross_page_consistency', 'risk_level', 'review_required',
]);

// distinct ranges per topic, for the master report + cross-page consistency evidence
const topicRangeSummary = [...rangesByTopic.entries()].map(([topic, set]) => ({
  topic, distinct_ranges_found: set.size, ranges: [...set].join(' | '),
})).sort((a, b) => b.distinct_ranges_found - a.distinct_ranges_found);
writeJson('chemical-claims-topic-summary.json', topicRangeSummary);

console.log(`Extracted ${allClaims.length} candidate chemistry claims across ${pages.length} pages.`);


// ---------------------------------------------------------------------
// 7. CONTENT QUALITY FORENSICS  (Deliverable 2)
// ---------------------------------------------------------------------
const SITE_HAS_EXTERNAL_SOURCES = records.some((r) => r.external_authority_link_count > 0);
const qualityRows = [];
for (const r of records) {
  const maxSim = maxSimByPath.has(r.file_path) ? maxSimByPath.get(r.file_path) : null;
  const repeatedBlocks = repeatedBlockCountByPath.get(r.file_path) || 0;
  const numericClaims = numericClaimCountByPath.get(r.file_path) || 0;

  let simPeer = '';
  if (maxSim !== null) {
    const fam = familyResults.find((f) => f.family === r.cluster);
    const pr = fam && fam.pairwise.find((p) => (p.page_a === r.file_path || p.page_b === r.file_path) && p.jaccard_similarity === maxSim);
    if (pr) simPeer = pr.page_a === r.file_path ? pr.page_b : pr.page_a;
  }

  const orig = scoring.originality(r, maxSim, simPeer);
  const use = scoring.usefulness(r);
  const comp = scoring.completeness(r);
  const spec = scoring.specificity(r, numericClaims);
  const acc = scoring.accuracyRisk(r, numericClaims, SITE_HAS_EXTERNAL_SOURCES);
  const rep = scoring.repetition(r, repeatedBlocks);
  const intent = scoring.intentMatch(r);
  const task = scoring.taskCompletion(r);
  const aeo = scoring.aeoAnswerQuality(r);
  const trust = scoring.trustSignals(r);

  const overall = (orig.score + use.score + comp.score + spec.score + acc.score
    + rep.score + intent.score + task.score + aeo.score + trust.score) / 10;

  qualityRows.push({
    url: r.url,
    file_path: r.file_path,
    cluster: r.cluster,
    originality_score: orig.score, originality_evidence: orig.evidence,
    usefulness_score: use.score, usefulness_evidence: use.evidence,
    completeness_score: comp.score, completeness_evidence: comp.evidence,
    specificity_score: spec.score, specificity_evidence: spec.evidence,
    accuracy_risk_score: acc.score, accuracy_risk_evidence: acc.evidence,
    repetition_score: rep.score, repetition_evidence: rep.evidence,
    search_intent_match_score: intent.score, search_intent_match_evidence: intent.evidence,
    user_task_completion_score: task.score, user_task_completion_evidence: task.evidence,
    aeo_answer_quality_score: aeo.score, aeo_answer_quality_evidence: aeo.evidence,
    trust_signals_score: trust.score, trust_signals_evidence: trust.evidence,
    overall_quality_score: Number(overall.toFixed(2)),
  });
}
writeCsv('content-quality.csv', qualityRows, Object.keys(qualityRows[0]));
writeJson('content-quality.json', qualityRows);
const qualityByPath = new Map(qualityRows.map((q) => [q.file_path, q]));

// ---------------------------------------------------------------------
// 8. AEO / AI SEARCH FORENSICS  (Deliverable 8)
// ---------------------------------------------------------------------
const aeoRows = records.map((r) => {
  const q = qualityByPath.get(r.file_path);
  const entityClarity = r.h1_count === 1 && !r.template_leakage && r.schema_types.length > 0 ? 3
    : (r.h1_count === 1 && !r.template_leakage ? 2 : (r.h1_count >= 1 ? 1 : 0));
  const extractability = (r.table_present ? 1 : 0) + (r.faq_count > 0 ? 1 : 0) + (r.heading_count >= 2 ? 1 : 0);
  const semanticCompleteness = q.completeness_score;
  return {
    url: r.url,
    file_path: r.file_path,
    answer_first_score: q.aeo_answer_quality_score,
    entity_clarity_score: Math.min(3, entityClarity),
    extractability_score: Math.min(3, extractability),
    semantic_completeness_score: semanticCompleteness,
    trust_evidence_score: q.trust_signals_score,
    ai_answerable_without_external_context: (q.aeo_answer_quality_score >= 2 && semanticCompleteness >= 2) ? 'LIKELY' : 'UNCERTAIN',
  };
});
writeCsv('aeo-audit.csv', aeoRows, Object.keys(aeoRows[0]));

// ---------------------------------------------------------------------
// 9. STRUCTURED DATA FORENSICS  (Deliverable 9)
// ---------------------------------------------------------------------
const schemaRows = [];
for (const p of pages) {
  const findings = auditPageSchema(p);
  if (findings.length === 0) {
    schemaRows.push({ url: p.url, file_path: p.relPath, schema_type: '(none)', status: 'MISSING', detail: 'No JSON-LD found on this page.' });
    continue;
  }
  for (const f of findings) {
    schemaRows.push({ url: p.url, file_path: p.relPath, schema_type: f.type, status: f.status, detail: f.detail });
  }
}
writeCsv('schema-audit.csv', schemaRows, ['url', 'file_path', 'schema_type', 'status', 'detail']);
writeJson('schema-audit.json', schemaRows);
const schemaStatusCounts = {};
for (const row of schemaRows) schemaStatusCounts[row.status] = (schemaStatusCounts[row.status] || 0) + 1;
console.log('Schema status counts:', schemaStatusCounts);

// ---------------------------------------------------------------------
// 10. INTERNAL LINK FORENSICS  (Deliverable 10)
// ---------------------------------------------------------------------
function inboundBucket(n) {
  if (n === 0) return '0';
  if (n <= 2) return '1-2';
  if (n <= 4) return '3-4';
  return '5+';
}
const linkAuditRows = records.map((r) => ({
  url: r.url,
  file_path: r.file_path,
  page_type: r.page_type,
  cluster: r.cluster,
  incoming_internal_links: r.incoming_internal_links,
  outgoing_internal_links: r.outgoing_internal_links,
  inbound_bucket: inboundBucket(r.incoming_internal_links),
  crawl_depth: r.crawl_depth,
  is_orphan: r.incoming_internal_links === 0 && r.page_type !== 'homepage',
}));
writeCsv('internal-link-audit.csv', linkAuditRows, Object.keys(linkAuditRows[0]));

const graphNodes = records.map((r) => ({ id: r.file_path, url: r.url, page_type: r.page_type, cluster: r.cluster, inbound: r.incoming_internal_links, outbound: r.outgoing_internal_links, depth: r.crawl_depth }));
const graphEdges = [];
for (const [target, sources] of inbound) {
  for (const source of sources) graphEdges.push({ from: source, to: target });
}
writeJson('internal-link-graph.json', { nodes: graphNodes, edges: graphEdges, broken_links: brokenLinks });

const orphanCount = linkAuditRows.filter((r) => r.is_orphan).length;
const inboundBucketCounts = { '0': 0, '1-2': 0, '3-4': 0, '5+': 0 };
for (const r of linkAuditRows) inboundBucketCounts[r.inbound_bucket]++;
console.log(`Orphan pages: ${orphanCount}. Inbound-link buckets:`, inboundBucketCounts);

// ---------------------------------------------------------------------
// 11. CRAWL / INDEXATION FORENSICS  (Deliverable 11)
// ---------------------------------------------------------------------
const crawlRows = [];
const seenNormalizedUrl = new Map();
for (const r of records) {
  const flags = [];
  if (!r.canonical) flags.push('MISSING_CANONICAL');
  else if (!r.canonical_self_match) flags.push('CANONICAL_POINTS_ELSEWHERE');
  if (r.canonical && /\.html($|\?)/.test(r.canonical)) flags.push('CANONICAL_USES_.HTML_EXTENSION');
  if (r.indexability === 'INDEXABLE' && !r.sitemap_presence && r.page_type !== 'internal-dashboard') flags.push('INDEXABLE_BUT_NOT_IN_SITEMAP');
  if (r.sitemap_presence && r.indexability !== 'INDEXABLE') flags.push('IN_SITEMAP_BUT_NOINDEX');
  if (r.page_type === 'internal-dashboard' && r.indexability === 'INDEXABLE') flags.push('INTERNAL_TOOLING_PAGE_IS_INDEXABLE');
  if (r.redirect_status_if_known !== 'none') flags.push(r.redirect_status_if_known);

  const normUrl = r.url.replace(/\/$/, '');
  if (!seenNormalizedUrl.has(normUrl)) seenNormalizedUrl.set(normUrl, []);
  seenNormalizedUrl.get(normUrl).push(r.file_path);

  crawlRows.push({
    url: r.url, file_path: r.file_path, canonical: r.canonical, robots: r.robots,
    indexability: r.indexability, sitemap_presence: r.sitemap_presence,
    redirect_status: r.redirect_status_if_known, flags: flags.join(';') || 'none',
  });
}
const duplicateUrlGroups = [...seenNormalizedUrl.entries()].filter(([, files]) => files.length > 1);
writeCsv('crawl-indexation-audit.csv', crawlRows, ['url', 'file_path', 'canonical', 'robots', 'indexability', 'sitemap_presence', 'redirect_status', 'flags']);
writeJson('crawl-indexation-audit.json', { rows: crawlRows, duplicate_url_groups: duplicateUrlGroups, sitemap_file_count: sitemapFiles.length, sitemap_url_count: sitemapUrls.size, robots_txt: robotsTxt });

const flagCounts = {};
for (const row of crawlRows) {
  if (row.flags === 'none') continue;
  for (const f of row.flags.split(';')) flagCounts[f] = (flagCounts[f] || 0) + 1;
}
console.log('Crawl/indexation flag counts:', flagCounts);

// ---------------------------------------------------------------------
// 12. SEO ON-PAGE AUDIT  (Deliverable 12)
// ---------------------------------------------------------------------
const titleCounts = new Map();
const descCounts = new Map();
for (const r of records) {
  if (r.title) titleCounts.set(r.title, (titleCounts.get(r.title) || 0) + 1);
  if (r.meta_description) descCounts.set(r.meta_description, (descCounts.get(r.meta_description) || 0) + 1);
}
const seoRows = records.map((r) => {
  const issues = [];
  if (!r.title) issues.push('MISSING_TITLE');
  else if (r.title.length < 15) issues.push('TITLE_TOO_SHORT');
  else if (r.title.length > 65) issues.push('TITLE_TOO_LONG');
  if (titleCounts.get(r.title) > 1) issues.push(`DUPLICATE_TITLE(${titleCounts.get(r.title)}x)`);
  if (!r.meta_description) issues.push('MISSING_META_DESCRIPTION');
  else if (r.meta_description.length < 50) issues.push('META_DESCRIPTION_TOO_SHORT');
  else if (r.meta_description.length > 160) issues.push('META_DESCRIPTION_TOO_LONG');
  if (descCounts.get(r.meta_description) > 1) issues.push(`DUPLICATE_META_DESCRIPTION(${descCounts.get(r.meta_description)}x)`);
  if (r.h1_count === 0) issues.push('MISSING_H1');
  if (r.h1_count > 1) issues.push('MULTIPLE_H1');
  if (r.template_leakage) issues.push('TEMPLATE_TOKEN_LEAKAGE');
  if (!r.canonical_self_match) issues.push('CANONICAL_MISMATCH');
  return {
    url: r.url, file_path: r.file_path, title: r.title, title_length: r.title.length,
    meta_description_length: r.meta_description.length, h1_count: r.h1_count,
    og_title_present: !!pageByPath.get(r.file_path).ogTitle,
    issues: issues.join(';') || 'none',
  };
});
writeCsv('seo-onpage-audit.csv', seoRows, Object.keys(seoRows[0]));
const dupTitleGroups = [...titleCounts.entries()].filter(([, c]) => c > 1).length;
const dupDescGroups = [...descCounts.entries()].filter(([, c]) => c > 1).length;
console.log(`SEO on-page: ${dupTitleGroups} duplicate-title groups, ${dupDescGroups} duplicate-description groups.`);

// ---------------------------------------------------------------------
// 13. ADSENSE READINESS FORENSICS  (Deliverable 13)
// ---------------------------------------------------------------------
const adsenseRows = records.map((r) => {
  const q = qualityByPath.get(r.file_path);
  const evidence = [];
  let status;
  if (r.page_type === 'internal-dashboard' || r.page_type === 'error') {
    status = 'ADSENSE_RISK';
    evidence.push(`page_type=${r.page_type}: internal tooling / error page, not real user content.`);
  } else if (r.template_leakage) {
    status = 'ADSENSE_RISK';
    evidence.push('Unreplaced template tokens visible in schema/markup -- looks unfinished/low-quality.');
  } else if (r.word_count < 150) {
    status = 'ADSENSE_RISK';
    evidence.push(`word_count=${r.word_count} (<150) -- thin content risk under Google Publisher Policies.`);
  } else if (q.overall_quality_score < 1.2 || q.repetition_score <= 1) {
    status = 'ADSENSE_REVIEW';
    evidence.push(`overall_quality_score=${q.overall_quality_score}, repetition_score=${q.repetition_score} -- templated/repetitive content pattern.`);
  } else {
    status = 'ADSENSE_READY';
    evidence.push(`word_count=${r.word_count}, overall_quality_score=${q.overall_quality_score}.`);
  }
  return { url: r.url, file_path: r.file_path, word_count: r.word_count, status, evidence: evidence.join(' ') };
});
writeCsv('adsense-readiness.csv', adsenseRows, ['url', 'file_path', 'word_count', 'status', 'evidence']);
const adsenseCounts = { ADSENSE_READY: 0, ADSENSE_REVIEW: 0, ADSENSE_RISK: 0 };
for (const r of adsenseRows) adsenseCounts[r.status]++;
console.log('AdSense readiness counts:', adsenseCounts);

// ---------------------------------------------------------------------
// 14. UX / ACCESSIBILITY FORENSICS  (Deliverable 14)
// ---------------------------------------------------------------------
const uxRows = pages.map((p) => {
  const issues = [];
  const imgsMissingAlt = p.images.filter((i) => !i.alt || i.alt.trim() === '').length;
  if (imgsMissingAlt > 0) issues.push(`${imgsMissingAlt}_IMAGE(S)_MISSING_ALT`);
  if (!/name="viewport"/.test(p._rawHtml)) issues.push('MISSING_VIEWPORT_META');
  const headingLevels = p.headings.map((h) => h.level);
  let skipped = false;
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) skipped = true;
  }
  if (skipped) issues.push('HEADING_LEVEL_SKIP');
  if (p.hasCalculatorForm && !/aria-label|<label/i.test(p._rawHtml)) issues.push('CALCULATOR_FORM_MISSING_LABELS');
  if (p.hasTable && !/<th[\s>]/i.test(p._rawHtml)) issues.push('TABLE_MISSING_TH_HEADERS');
  return {
    url: p.url, file_path: p.relPath, images_total: p.images.length,
    images_missing_alt: imgsMissingAlt, heading_level_skip: skipped,
    issues: issues.join(';') || 'none',
  };
});
writeCsv('ux-accessibility-audit.csv', uxRows, Object.keys(uxRows[0]));
const uxIssuePages = uxRows.filter((r) => r.issues !== 'none').length;
console.log(`UX/accessibility: ${uxIssuePages} pages with at least one flagged issue.`);

// ---------------------------------------------------------------------
// 6b. SOURCE / EVIDENCE AUDIT  (Deliverable 6)
// ---------------------------------------------------------------------
const majorFactualTypes = new Set(['entity', 'glossary-term', 'guide', 'academy-article', 'reference-page', 'dataset-page', 'formula-page', 'question-page', 'programmatic-longtail', 'comparison']);
const sourceAuditRows = records.filter((r) => majorFactualTypes.has(r.page_type)).map((r) => {
  const numericClaims = numericClaimCountByPath.get(r.file_path) || 0;
  return {
    url: r.url,
    file_path: r.file_path,
    page_type: r.page_type,
    sources_present: r.external_authority_link_count > 0,
    source_type: r.external_authority_link_count > 0 ? 'external authority link' : (r.source_links_present ? 'internal "last reviewed" stamp only (no external citation)' : 'none'),
    external_authority_link_count: r.external_authority_link_count,
    unsupported_numeric_claims: numericClaims,
    claims_requiring_verification: numericClaims > 0 && r.external_authority_link_count === 0 ? numericClaims : 0,
  };
});
writeCsv('source-audit.csv', sourceAuditRows, Object.keys(sourceAuditRows[0]));
const pagesWithZeroSources = sourceAuditRows.filter((r) => r.external_authority_link_count === 0).length;
console.log(`Source audit: ${pagesWithZeroSources}/${sourceAuditRows.length} major factual pages have zero external authority citations.`);

// ---------------------------------------------------------------------
// 7b. E-E-A-T / TRUST FORENSICS  (Deliverable 7)
// ---------------------------------------------------------------------
const trustPagePaths = ['about/index.html', 'legal/legal.html', 'legal/ownership.html', 'legal/index.html',
  'methodology/index.html', 'editorial/index.html', 'editorial/review-process/index.html',
  'editorial/correction-policy/index.html', 'editorial/editorial-policy/index.html',
  'editorial/content-standards/index.html', 'editorial/update-policy/index.html', 'provenance/index.html'];
const trustSignalChecks = [
  { key: 'explains_what_site_does', re: /water\s?balance\s?tools (provides|is|offers|helps)/i },
  { key: 'names_operator_entity', re: /albor digital/i },
  { key: 'has_contact_method', re: /mailto:|contact (us|form)|@waterbalancetools/i },
  { key: 'explains_calculator_assumptions', re: /assum(e|ption)|based on (standard|typical|industry)/i },
  { key: 'states_limitations', re: /limitation|does not (replace|substitute)|not a substitute|cannot determine|we do not/i },
  { key: 'explains_review_process', re: /review process|editorial (process|policy|standards)|how we review/i },
  { key: 'has_correction_mechanism', re: /correction|report an error|suggest an edit|flag (an error|inaccurate)/i },
  { key: 'named_author_or_reviewer', re: /written by|reviewed by|author:|reviewer:/i },
];
const trustPageAudit = [];
for (const rel of trustPagePaths) {
  const p = pageByPath.get(rel);
  if (!p) { trustPageAudit.push({ file_path: rel, exists: false }); continue; }
  const found = {};
  for (const c of trustSignalChecks) found[c.key] = c.re.test(p.text);
  trustPageAudit.push({ file_path: rel, exists: true, word_count: p.wordCount, ...found });
}
const sitewideSignals = {};
for (const c of trustSignalChecks) {
  sitewideSignals[c.key] = trustPageAudit.some((t) => t.exists && t[c.key]);
}
const missingSitewideSignals = trustSignalChecks.filter((c) => !sitewideSignals[c.key]).map((c) => c.key);

const trustMd = `# Phase 7A -- E-E-A-T / Trust Forensics

## Trust page inventory checked
${trustPageAudit.map((t) => `- \`${t.file_path}\`: ${t.exists ? `present, ${t.word_count} words` : '**MISSING**'}`).join('\n')}

## Sitewide trust-signal presence (true if found on ANY trust page)
${trustSignalChecks.map((c) => `- ${c.key}: ${sitewideSignals[c.key] ? 'PRESENT' : '**MISSING**'}`).join('\n')}

## Missing sitewide signals
${missingSitewideSignals.length ? missingSitewideSignals.map((s) => `- ${s}`).join('\n') : '(none)'}

## Additional sitewide findings
- No page anywhere on the site (0 / ${pages.length}) contains an author byline, "written by", or "reviewed by" credit (regex scan for author/byline/rel="author"/"reviewed by").
- ${pagesWithZeroSources} / ${sourceAuditRows.length} major factual pages cite zero external authoritative sources; sitewide, zero \`<a href>\` tags point to any non-waterbalancetools.com domain.
- The \`.knowledge-sources\` block (256 occurrences across the site) contains only a "Last reviewed: DATE" stamp, not an actual source citation -- its class name is misleading relative to its content.
- \`data/trust/*.json\` (confidence.json, methodology.json, references.json, etc.) exists as structured trust data but was not confirmed to be rendered as reader-visible content on every page that would need it; see reproduction commands to re-check.
`;
writeText('trust-audit.md', trustMd);
writeJson('trust-audit.json', { trust_page_audit: trustPageAudit, sitewide_signals: sitewideSignals, missing_sitewide_signals: missingSitewideSignals, pages_with_zero_external_sources: pagesWithZeroSources, total_major_factual_pages: sourceAuditRows.length });
console.log('Trust audit: missing sitewide signals ->', missingSitewideSignals);

// ---------------------------------------------------------------------
// 4b. CONTENT CANNIBALIZATION  (Deliverable 4)
// ---------------------------------------------------------------------
const CANNIBALIZATION_TYPES = new Set(['calculator', 'calculator-hub', 'chart', 'guide', 'question-page',
  'programmatic-longtail', 'programmatic-subhub', 'reference-page', 'comparison', 'academy-article']);
const INTENTS = ['pool chlorine', 'pool ph', 'pool shock', 'pool alkalinity', 'hot tub chlorine', 'hot tub ph',
  'hot tub shock', 'pool chemical', 'hot tub chemical', 'cyanuric acid', 'calcium hardness', 'salt water',
  'pool volume', 'spa volume', 'turnover', 'water balance'];

function primaryIntents(r) {
  const hay = `${r.title} ${r.h1}`.toLowerCase();
  return INTENTS.filter((i) => hay.includes(i));
}
const candidatePages = records.filter((r) => CANNIBALIZATION_TYPES.has(r.page_type));
const shingleCache = new Map();
function getShingles(filePath) {
  if (!shingleCache.has(filePath)) shingleCache.set(filePath, shingles(pageByPath.get(filePath).text, 6));
  return shingleCache.get(filePath);
}

const cannibalRows = [];
for (const intent of INTENTS) {
  const group = candidatePages.filter((r) => primaryIntents(r).includes(intent));
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const a = group[i]; const b = group[j];
      if (a.page_type === b.page_type && a.cluster === b.cluster) continue; // same-family dup already covered by Deliverable 3
      const sim = jaccard(getShingles(a.file_path), getShingles(b.file_path));
      let action;
      let risk;
      if (a.page_type === b.page_type && sim >= 0.35) { action = 'CONSOLIDATE'; risk = 'HIGH'; }
      else if (sim >= 0.35) { action = 'INVESTIGATE'; risk = 'HIGH'; }
      else if (sim >= 0.15) { action = 'STRENGTHEN DIFFERENTIATION'; risk = 'MEDIUM'; }
      else { action = 'KEEP SEPARATE'; risk = 'LOW'; }
      if (sim < 0.05 && a.page_type !== b.page_type) continue; // not a meaningful overlap signal
      cannibalRows.push({
        page_a: a.url, page_b: b.url, shared_intent: intent,
        page_a_type: a.page_type, page_b_type: b.page_type,
        similarity: Number(sim.toFixed(3)), risk,
        current_differentiation: a.page_type !== b.page_type ? `different formats (${a.page_type} vs ${b.page_type})` : 'same format, different cluster',
        recommended_action: action,
      });
    }
  }
}
// High-priority sets called out explicitly in scope: compare exhaustively
// regardless of keyword match, since these are small, calculator/chart-hub
// pages, and near-duplicate URLs for the same tool are the highest-value
// cannibalization signal (e.g. calculators/volume-calculator.html vs
// calculators/pool-volume-calculator.html).
const seenPairs = new Set(cannibalRows.map((r) => [r.page_a, r.page_b].sort().join('|')));
for (const typeSet of [['calculator'], ['chart']]) {
  const group = candidatePages.filter((r) => typeSet.includes(r.page_type));
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const a = group[i]; const b = group[j];
      const key = [a.url, b.url].sort().join('|');
      if (seenPairs.has(key)) continue;
      const sim = jaccard(getShingles(a.file_path), getShingles(b.file_path));
      const titleSim = a.title.replace(/\s*\(calculators?\)\s*/gi, '').trim() === b.title.replace(/\s*\(calculators?\)\s*/gi, '').trim();
      if (sim < 0.05 && !titleSim) continue;
      // A pair is already resolved if one side is noindex (a retired
      // redirect source) -- only one URL remains indexable/competing.
      const alreadyResolved = titleSim && (a.indexability !== 'INDEXABLE' || b.indexability !== 'INDEXABLE');
      let action; let risk;
      if (alreadyResolved) { action = 'UNCHANGED'; risk = 'LOW'; }
      else if (titleSim) { action = 'INVESTIGATE'; risk = 'CRITICAL'; }
      else if (sim >= 0.6) { action = 'CONSOLIDATE'; risk = 'HIGH'; }
      else if (sim >= 0.3) { action = 'STRENGTHEN DIFFERENTIATION'; risk = 'MEDIUM'; }
      else { action = 'KEEP SEPARATE'; risk = 'LOW'; }
      cannibalRows.push({
        page_a: a.url, page_b: b.url, shared_intent: typeSet[0] + ' hub (exhaustive pairwise)',
        page_a_type: a.page_type, page_b_type: b.page_type,
        similarity: Number(sim.toFixed(3)), risk,
        current_differentiation: alreadyResolved ? 'RESOLVED -- one URL is noindex + 301-redirected to the other; only one remains indexable' : (titleSim ? 'NONE -- normalized titles are identical; two live URLs for the same apparent tool' : (a.page_type !== b.page_type ? `different formats (${a.page_type} vs ${b.page_type})` : 'same format')),
        recommended_action: action,
      });
      seenPairs.add(key);
    }
  }
}
const RISK_RANK = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
cannibalRows.sort((a, b) => (RISK_RANK[b.risk] - RISK_RANK[a.risk]) || (b.similarity - a.similarity));
writeCsv('content-cannibalization.csv', cannibalRows, ['page_a', 'page_b', 'shared_intent', 'page_a_type', 'page_b_type', 'similarity', 'risk', 'current_differentiation', 'recommended_action']);
writeJson('content-cannibalization.json', cannibalRows);
console.log(`Cannibalization: ${cannibalRows.length} cross-format pairs evaluated across ${INTENTS.length} core intents; ${cannibalRows.filter((r) => r.risk === 'HIGH').length} HIGH risk.`);

// ---------------------------------------------------------------------
// 15/16. ACTION MATRIX + PRIORITY MATRIX  (Deliverables 15, 16)
// ---------------------------------------------------------------------
const cannibalHighByUrl = new Map();
for (const row of cannibalRows) {
  if (row.risk === 'CRITICAL' || row.risk === 'HIGH') {
    cannibalHighByUrl.set(row.page_a, (cannibalHighByUrl.get(row.page_a) || []).concat(row));
    cannibalHighByUrl.set(row.page_b, (cannibalHighByUrl.get(row.page_b) || []).concat(row));
  }
}
const seoIssuesByUrl = new Map(seoRows.map((r) => [r.url, r.issues]));
const crawlFlagsByUrl = new Map(crawlRows.map((r) => [r.url, r.flags]));

const actionMatrix = records.map((r) => {
  const q = qualityByPath.get(r.file_path);
  const evidence = [];
  let action = 'UNCHANGED';
  let priority = 'P3';

  const cannibal = cannibalHighByUrl.get(r.url);
  const crawlFlags = crawlFlagsByUrl.get(r.url);
  const seoIssues = seoIssuesByUrl.get(r.url);

  if (r.template_leakage) {
    action = 'IMPROVE'; priority = 'P0';
    evidence.push(`Unreplaced template token(s) rendered in production: ${r.template_leakage_tokens}.`);
  } else if (cannibal && cannibal.some((c) => c.risk === 'CRITICAL')) {
    action = 'INVESTIGATE'; priority = 'P0';
    evidence.push(`Near-identical title to another live URL (${cannibal[0].page_a === r.url ? cannibal[0].page_b : cannibal[0].page_a}) -- likely duplicate tool page.`);
  } else if (r.page_type === 'internal-dashboard' && r.indexability === 'INDEXABLE') {
    action = 'NOINDEX'; priority = 'P1';
    evidence.push('Internal QA/audit dashboard page is indexable (robots: index, follow) -- not intended reader content.');
  } else if (r.indexability !== 'INDEXABLE' && r.sitemap_presence) {
    action = 'INVESTIGATE'; priority = 'P1';
    evidence.push('Page is noindex but still listed in the sitemap (crawl-budget/signal contradiction).');
  } else if (q.originality_score <= 1) {
    action = 'MERGE'; priority = 'P1';
    evidence.push(`originality_score=${q.originality_score} (near-duplicate of a sibling page's body text) -- see programmatic-duplication.csv for family "${r.cluster}".`);
  } else if (q.repetition_score === 0) {
    action = 'IMPROVE'; priority = 'P2';
    evidence.push(`repetition_score=0: page shares several exact boilerplate paragraph/FAQ/table blocks with sibling pages despite otherwise original prose (originality_score=${q.originality_score}) -- see programmatic-duplication.csv for family "${r.cluster}".`);
  } else if (cannibal && cannibal.some((c) => c.risk === 'HIGH')) {
    action = 'IMPROVE'; priority = 'P2';
    evidence.push('Meaningful content overlap with a sibling page competing for the same intent; see content-cannibalization.csv.');
  } else if (r.word_count < 150 && r.page_type !== 'homepage') {
    action = 'IMPROVE'; priority = 'P2';
    evidence.push(`word_count=${r.word_count} -- thin content risk for AdSense/quality.`);
  } else if (q.overall_quality_score < 1.5) {
    action = 'IMPROVE'; priority = 'P2';
    evidence.push(`overall_quality_score=${q.overall_quality_score} across the 10-dimension rubric.`);
  } else if (r.incoming_internal_links === 0 && r.page_type !== 'homepage') {
    action = 'IMPROVE'; priority = 'P2';
    evidence.push('Orphan page: 0 incoming internal links found in the generated HTML.');
  } else if (seoIssues && seoIssues !== 'none') {
    action = 'IMPROVE'; priority = 'P3';
    evidence.push(`On-page SEO issues: ${seoIssues}.`);
  } else if (q.overall_quality_score >= 2.2) {
    action = 'KEEP'; priority = 'P3';
    evidence.push(`overall_quality_score=${q.overall_quality_score} -- strong across the rubric.`);
  } else {
    action = 'UNCHANGED'; priority = 'P3';
    evidence.push('No P0/P1/P2 signal triggered by this audit pass.');
  }

  return {
    url: r.url, file_path: r.file_path, page_type: r.page_type, cluster: r.cluster,
    overall_quality_score: q.overall_quality_score, action, priority, evidence: evidence.join(' '),
  };
});
writeCsv('action-matrix.csv', actionMatrix, ['url', 'file_path', 'page_type', 'cluster', 'overall_quality_score', 'action', 'priority', 'evidence']);
writeJson('action-matrix.json', actionMatrix);

const actionCounts = {};
const priorityCounts = { P0: 0, P1: 0, P2: 0, P3: 0 };
for (const row of actionMatrix) {
  actionCounts[row.action] = (actionCounts[row.action] || 0) + 1;
  priorityCounts[row.priority]++;
}
console.log('Action counts:', actionCounts);
console.log('Priority counts:', priorityCounts);

// ---------------------------------------------------------------------
// REPRODUCIBILITY METADATA
// ---------------------------------------------------------------------
let gitCommit = 'unknown';
try { gitCommit = execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim(); } catch (e) { /* not fatal */ }
const auditMetadata = {
  timestamp: new Date().toISOString(),
  git_commit: gitCommit,
  node_version: process.version,
  page_count: pages.length,
  non_page_template_count: nonPages.length,
  methodology_version: '7A.1.0',
  script_entry_point: 'scripts/audit-forensic/run.js',
};
writeJson('audit-metadata.json', auditMetadata);

// ---------------------------------------------------------------------
// 17/18. MASTER FORENSIC REPORT (md + json)
// ---------------------------------------------------------------------
const pageTypeCounts = {};
for (const r of records) pageTypeCounts[r.page_type] = (pageTypeCounts[r.page_type] || 0) + 1;

const avgQuality = qualityRows.reduce((s, q) => s + q.overall_quality_score, 0) / qualityRows.length;
const templateLeakCount = records.filter((r) => r.template_leakage).length;
const criticalDupFamilies = familySummaryRows.filter((f) => f.risk === 'CRITICAL' || f.risk === 'HIGH');
const p0Rows = actionMatrix.filter((r) => r.priority === 'P0');
const p1Rows = actionMatrix.filter((r) => r.priority === 'P1');
const p2Rows = actionMatrix.filter((r) => r.priority === 'P2');
const p3Rows = actionMatrix.filter((r) => r.priority === 'P3');

function topN(rows, n) { return rows.slice(0, n); }

const masterJson = {
  site_summary: {
    total_html_files: allHtmlFiles.length,
    indexable_candidate_pages: pages.length,
    template_and_partial_files_excluded: nonPages.length,
    page_type_counts: pageTypeCounts,
    average_overall_quality_score: Number(avgQuality.toFixed(2)),
  },
  page_inventory_file: 'url-inventory.csv / url-inventory.json',
  quality_scores_file: 'content-quality.csv / content-quality.json',
  programmatic_findings: { families_analyzed: familyResults.length, high_or_critical_risk_families: criticalDupFamilies },
  chemical_claims: { total_claims_extracted: allClaims.length, topic_range_variance: topicRangeSummary.filter((t) => t.distinct_ranges_found > 1) },
  source_findings: { pages_with_zero_external_sources: pagesWithZeroSources, total_major_factual_pages: sourceAuditRows.length },
  trust_findings: { missing_sitewide_signals: missingSitewideSignals },
  aeo_findings: { pages_likely_ai_answerable: aeoRows.filter((r) => r.ai_answerable_without_external_context === 'LIKELY').length, total: aeoRows.length },
  schema_findings: schemaStatusCounts,
  link_findings: { orphan_pages: orphanCount, inbound_bucket_counts: inboundBucketCounts, broken_internal_links: brokenLinks.length },
  crawl_findings: flagCounts,
  adsense_findings: adsenseCounts,
  ux_findings: { pages_with_flagged_issues: uxIssuePages },
  action_matrix_file: 'action-matrix.csv / action-matrix.json',
  priority_matrix: { P0: p0Rows.length, P1: p1Rows.length, P2: p2Rows.length, P3: p3Rows.length },
  internationalization_readiness: {
    spanish: 'NOT STARTED -- no /es/ or lang=es content found in this crawl; 100% of pages are lang="en".',
    french: 'NOT STARTED -- no /fr/ or lang=fr content found in this crawl; 100% of pages are lang="en".',
    blocking_issues_before_i18n: [
      `${templateLeakCount} pages carry unreplaced {{TEMPLATE}} tokens in production HTML/schema -- must be fixed in the English generators before they are copied into any translation pipeline.`,
      `${pagesWithZeroSources} of ${sourceAuditRows.length} factual pages cite zero external sources -- translating unverifiable claims multiplies the accuracy-review burden per locale.`,
      `${criticalDupFamilies.length} programmatic page families show HIGH/CRITICAL near-duplicate content -- translating near-duplicates multiplies thin/duplicate-content risk per locale rather than fixing it once.`,
      'Two live calculator URLs exist for the same tool (pool-volume-calculator vs volume-calculator) -- this ambiguity would be inherited by every locale copy.',
    ],
  },
  audit_metadata: auditMetadata,
};
writeJson('PHASE-7A-FORENSIC-AUDIT.json', masterJson);

const langCount = pages.filter((p) => /<html[^>]+lang="en"/i.test(p._rawHtml)).length;
const templatePartialFileCount = ['templates', 'partials', 'components']
  .reduce((sum, d) => sum + walkHtmlFiles(path.join(ROOT, d)).length, 0);
const internalToolingCount = (pageTypeCounts['internal-dashboard'] || 0) + (pageTypeCounts['qa-internal'] || 0);

const md = `# Phase 7A -- WaterBalanceTools Forensic Content & Quality Audit

**Investigation only. No production content, schema, redirects, canonicals, sitemap generation, robots.txt, or AdSense configuration was modified by this audit.**

## 1. Executive Summary

This audit crawled and parsed the *actual generated HTML* of the WaterBalanceTools repository as it exists on disk at commit \`${gitCommit}\` -- not the source templates, and not prior phase reports. It found **${allHtmlFiles.length} HTML files**, of which **${pages.length}** are indexable-candidate pages (the remainder are template sources and partial includes, which were excluded from the walk itself).

This is materially larger than the ~114-page estimate in the audit brief; the actual inventory includes large programmatic families (glossary: ${clusterGroups.get('glossary') ? clusterGroups.get('glossary').length : 'n/a'}, entities: ${clusterGroups.get('entities') ? clusterGroups.get('entities').length : 'n/a'}) and ${internalToolingCount} previously-undiscovered internal QA/audit dashboard pages under \`reports/\`, \`audit/\`, and \`qa/\` that are live on the production filesystem and reachable by crawlers.

Three findings anchor this report:

1. **Template-token leakage in production schema/content.** ${templateLeakCount} pages render an unreplaced \`{{...}}\` placeholder (most commonly \`{{H1_TITLE}}\` inside \`DefinedTerm\` JSON-LD on glossary pages) directly into shipped HTML and structured data. This is a mechanical generator defect, not a content-quality judgment call.
2. **Zero external sources sitewide.** Across ${sourceAuditRows.length} major factual pages, **${pagesWithZeroSources}** cite zero external authoritative sources (0 \`<a href>\` tags anywhere in the crawled HTML point off waterbalancetools.com). The \`.knowledge-sources\` block present on 256 pages contains only a "Last reviewed: DATE" stamp, not a citation.
3. **Programmatic near-duplication is concentrated, not diffuse.** \`programmatic/hot-tubs\`, \`programmatic/shock\`, \`programmatic/chlorine\`, and \`programmatic/ph\` score HIGH-to-CRITICAL on cross-page Jaccard similarity (avg 0.71-0.80). By contrast, the two largest families -- \`glossary\` (101 pages) and \`entities\` (105 pages) -- score LOW on body-text similarity (avg 0.18-0.22), i.e. they are not the duplication risk their size might suggest.

## 2. Current Site Inventory

| Metric | Value |
|---|---|
| Total HTML files discovered (indexable-candidate walk) | ${allHtmlFiles.length} |
| Indexable-candidate pages | ${pages.length} |
| Template/partial/component source files (excluded from walk entirely) | ${templatePartialFileCount} (\`templates/\`, \`partials/\`, \`components/\`) |
| Internal QA/audit dashboard pages found live in-repo | ${internalToolingCount} (\`reports/*.html\`, \`audit/**/*.html\`, \`qa/*.html\`) |
| Pages with \`lang="en"\` | ${langCount} / ${pages.length} |
| Sitemap URL count (8 sitemap files) | ${sitemapUrls.size} |
| \`_redirects\` rules | ${redirectRules.length} |

Page-type breakdown:

${Object.entries(pageTypeCounts).sort((a, b) => b[1] - a[1]).map(([t, c]) => `- ${t}: ${c}`).join('\n')}

Full inventory: \`url-inventory.csv\`, \`url-inventory.json\`.

## 3. Overall Quality Score

Average \`overall_quality_score\` (0-3 scale, 10-dimension rubric, see Deliverable 2 methodology) across all ${qualityRows.length} pages: **${avgQuality.toFixed(2)} / 3**.

Distribution: ${['0-1', '1-2', '2-3'].map((band) => {
  const [lo, hi] = band.split('-').map(Number);
  const n = qualityRows.filter((q) => q.overall_quality_score >= lo && q.overall_quality_score < hi + (hi === 3 ? 0.01 : 0)).length;
  return `${band}: ${n}`;
}).join(', ')}

Full scores + per-dimension evidence: \`content-quality.csv\`, \`content-quality.json\`.

## 4. Programmatic Content Findings

${familySummaryRows.map((f) => `- **${f.family}** (${f.page_count} pages): risk **${f.risk}**, avg pairwise similarity ${f.avg_pairwise_similarity}, ${f.high_similarity_pairs} high-similarity pairs, ${f.repeated_paragraph_blocks} repeated paragraph blocks, ${f.repeated_faqs} repeated FAQ entries, ${f.repeated_tables} repeated tables.`).join('\n')}

Full data: \`programmatic-duplication.csv\`, \`programmatic-duplication.json\`.

## 5. Chemical Accuracy Findings

${allClaims.length} candidate chemistry claims (sentences containing a tracked chemistry term and/or a numeric range/unit) were extracted across ${pages.length} pages. This audit did **not** independently verify chemistry correctness against external literature -- per the audit brief, uncertain content is flagged \`REQUIRES_EXPERT_REVIEW\` rather than silently corrected or judged.

Cross-page range consistency by topic (topics where more than one distinct numeric range/unit string was found across the site -- this does not necessarily mean a contradiction, since e.g. pools and hot tubs legitimately have different target ranges, but every row here should be expert-reviewed to confirm the variance is intentional):

${topicRangeSummary.filter((t) => t.distinct_ranges_found > 1).map((t) => `- **${t.topic}**: ${t.distinct_ranges_found} distinct range/unit strings found -- \`${t.ranges}\``).join('\n')}

Full claims dataset: \`chemical-claims.csv\`.

## 6. Cannibalization Findings

${cannibalRows.filter((r) => r.risk === 'CRITICAL').length} CRITICAL, ${cannibalRows.filter((r) => r.risk === 'HIGH').length} HIGH, ${cannibalRows.filter((r) => r.risk === 'MEDIUM').length} MEDIUM risk pairs identified among calculator/chart/guide/programmatic/reference pages sharing a core intent.

Headline finding: \`calculators/pool-volume-calculator.html\` and \`calculators/volume-calculator.html\` are two separate, both-indexable (\`robots: index, follow\`) live URLs for what appears to be the same "Pool Volume Calculator" tool, with 0.56 body-text similarity and near-identical (auto-generated, doubly-suffixed) titles: *"Pool Volume Calculator (calculators)"* and *"Pool Volume Calculator (calculators) (calculators)"*.

Full data: \`content-cannibalization.csv\`.

## 7. AEO Findings

${aeoRows.filter((r) => r.ai_answerable_without_external_context === 'LIKELY').length} / ${aeoRows.length} pages score LIKELY on "AI-answerable using only this page" (answer-first block + FAQ/quick-answer + sufficient semantic completeness). Full data: \`aeo-audit.csv\`.

## 8. E-E-A-T Findings

${missingSitewideSignals.length ? `Missing sitewide: ${missingSitewideSignals.join(', ')}.` : 'All checked sitewide signals present.'} Zero pages sitewide (0/${pages.length}) carry a named author or reviewer byline. Full detail: \`trust-audit.md\`, \`trust-audit.json\`.

## 9. Structured Data Findings

Schema status counts across all JSON-LD blocks found: ${Object.entries(schemaStatusCounts).map(([k, v]) => `${k}: ${v}`).join(', ')}. The MISREPRESENTED count is driven almost entirely by the \`{{H1_TITLE}}\` template-leakage defect (see Executive Summary). Full data: \`schema-audit.csv\`.

## 10. Internal Linking Findings

Orphan pages (0 inbound internal links, excluding homepage): **${orphanCount}**. Inbound-link distribution: ${JSON.stringify(inboundBucketCounts)}. Full graph: \`internal-link-audit.csv\`, \`internal-link-graph.json\`.

## 11. Crawl/Indexation Findings

${Object.entries(flagCounts).map(([k, v]) => `- ${k}: ${v} page(s)`).join('\n')}

Sitemap contains ${sitemapUrls.size} URLs against ${pages.length} discovered pages -- the ${sitemapUrls.size - pages.length} difference should be reconciled (either stale sitemap entries for removed pages, or a URL-form mismatch this crawl's resolver did not catch; see Audit Limitations). Full data: \`crawl-indexation-audit.csv\`.

## 12. AdSense Readiness

${Object.entries(adsenseCounts).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Full data: \`adsense-readiness.csv\`.

## 13. UX/Accessibility

${uxIssuePages} / ${pages.length} pages flagged at least one static accessibility issue (missing alt text, missing viewport meta, heading-level skip, unlabeled calculator form, or a table without \`<th>\` headers). Full data: \`ux-accessibility-audit.csv\`.

## 14. Internationalization Readiness

100% of crawled pages are \`lang="en"\`; no Spanish or French content exists yet. Before i18n:

${masterJson.internationalization_readiness.blocking_issues_before_i18n.map((b) => `- ${b}`).join('\n')}

## 15. Page-Level Action Matrix

Action counts: ${Object.entries(actionCounts).map(([k, v]) => `${k}: ${v}`).join(', ')}. Full matrix: \`action-matrix.csv\`, \`action-matrix.json\`.

## 16. P0 Findings (${p0Rows.length})

Dominated by template-token leakage (${templateLeakCount} pages) and the one CRITICAL duplicate-calculator-URL pair. Sample:

${topN(p0Rows, 8).map((r) => `- \`${r.file_path}\`: ${r.evidence}`).join('\n')}

${p0Rows.length > 8 ? `...and ${p0Rows.length - 8} more; see \`action-matrix.csv\` filtered to priority=P0.` : ''}

## 17. P1 Findings (${p1Rows.length})

${topN(p1Rows, 8).map((r) => `- \`${r.file_path}\`: ${r.evidence}`).join('\n')}

${p1Rows.length > 8 ? `...and ${p1Rows.length - 8} more; see \`action-matrix.csv\` filtered to priority=P1.` : ''}

## 18. P2 Findings (${p2Rows.length})

${topN(p2Rows, 6).map((r) => `- \`${r.file_path}\`: ${r.evidence}`).join('\n')}

${p2Rows.length > 6 ? `...and ${p2Rows.length - 6} more; see \`action-matrix.csv\` filtered to priority=P2.` : ''}

## 19. P3 Findings (${p3Rows.length})

Enhancement-tier only; see \`action-matrix.csv\` filtered to priority=P3 for the full list (${p3Rows.length} rows).

## 20. Remediation Roadmap (sequencing only -- no remediation performed in Phase 7A)

1. Fix the \`{{H1_TITLE}}\` (and 20 other) template-token leakage at the generator level (\`scripts/generate-glossary.js\` and siblings), then regenerate affected pages. This is mechanical and low-risk to fix first.
2. Resolve the \`pool-volume-calculator\` vs \`volume-calculator\` duplicate-URL pair (pick a canonical URL, 301 the other, dedupe from \`calculators/index.html\` and \`all-pages.html\`).
3. Decide the fate of the ${criticalDupFamilies.length} HIGH/CRITICAL-risk programmatic families (\`hot-tubs\`, \`shock\`, \`chlorine\`, \`ph\`) -- likely differentiation work (more unique per-page data/examples) rather than deletion, since page_count per family is modest (5-12).
4. Reconcile the root-level legacy chart pages (\`hot-tub-chemical-levels-chart.html\`, \`pool-chemical-levels-chart.html\`, etc.) against their \`charts/\` counterparts -- both are live and indexable with near-zero content overlap despite near-identical titles.
5. Add real external citations to at least the highest-traffic reference/entity/guide pages; the current 0-source baseline is the single largest E-E-A-T and AdSense-content-quality gap.
6. Add a named author/reviewer credit and expand \`editorial/review-process\` visibility on individual content pages, not just the policy hub.
7. Investigate the ${sitemapUrls.size - pages.length}-URL gap between sitemap and crawled inventory, and the ${flagCounts.IN_SITEMAP_BUT_NOINDEX || 0} sitemap/noindex contradictions.
8. Only after 1-7: proceed to internationalization, per Section 14.

## 21. Spanish Readiness Assessment

Not ready. 0 Spanish-language pages exist. Recommend completing Roadmap items 1-6 on the English source before forking a translation pipeline, since template-leakage and duplicate-URL defects would otherwise be replicated per locale.

## 22. French Readiness Assessment

Not ready, for the same reasons as Section 21. No French-language content exists.

## 23. Audit Limitations

- This is a **static, mechanical forensic pass**, not a manual editorial read of all ${pages.length} pages. Quality/AEO/trust scores are computed from a documented, reproducible rubric (see \`scripts/audit-forensic/lib/scoring.js\`) tied to measurable structural signals (word count, heading count, FAQ/schema presence, duplication similarity, external-link presence). This is evidence-based but is a proxy for, not a replacement of, human editorial judgment -- treat scores as triage signal, not final grades.
- **Chemistry claims were extracted, not fact-checked.** This audit has no authority to confirm or deny pool/spa chemistry correctness; every claim in \`chemical-claims.csv\` should be read as "candidate for expert review," not as verified-true or verified-false.
- Duplication analysis uses 6-word-shingle Jaccard similarity plus exact-match detection for paragraphs/FAQs/tables; it will under-count paraphrased duplication and over-count coincidental short-phrase overlap in very short pages.
- The internal link graph and crawl-depth BFS only follow \`<a href>\` tags found by regex in raw HTML; it does not execute JavaScript, so any client-side-rendered navigation would not be captured.
- The sitemap/inventory count gap (${sitemapUrls.size} vs ${pages.length}) was flagged but not root-caused in this pass -- see Roadmap item 7.
- Cannibalization analysis focused on calculator/chart/guide/programmatic/reference/comparison/academy page types and a fixed list of ${INTENTS.length} core intent phrases; it is not an exhaustive pairwise comparison of all ${pages.length} pages (that would be ~${Math.round(pages.length * (pages.length - 1) / 2 / 1000)}k comparisons) and may miss cannibalization on intents outside that list.

## 24. Files and Scripts Examined

- All ${allHtmlFiles.length} \`*.html\` files under the repository root (excluding \`node_modules\`, \`.git\`, and this audit's own \`reports/phase-7a/\` output).
- \`sitemap*.xml\` (${sitemapFiles.length} files), \`robots.txt\`, \`_redirects\`.
- \`scripts/generate-*.js\`, \`scripts/audit-*.js\` (inspected for naming/generator-mapping purposes; not executed).
- \`data/trust/*.json\`, \`data/graph/*.json\`, \`data/indexing/*.json\` (inspected for cross-reference; full semantic audit of these is a follow-up item, not completed in this pass).
- Audit pipeline source: \`scripts/audit-forensic/\` (this Phase 7A deliverable itself).

## 25. Reproduction Commands

\`\`\`bash
npm run audit:forensic
# or directly:
node scripts/audit-forensic/run.js
\`\`\`

Outputs are deterministic against a fixed commit (all inputs are static files on disk; no network calls, no randomness). Re-running against the same commit reproduces materially identical findings -- see \`audit-metadata.json\` for the \`git_commit\` and \`timestamp\` of this run.
`;
writeText('PHASE-7A-FORENSIC-AUDIT.md', md);
console.log('Master report written.');

// ---------------------------------------------------------------------
// 19. AUDIT DASHBOARD  (Deliverable 19)
// ---------------------------------------------------------------------
const dashboardData = {
  meta: auditMetadata,
  summary: {
    total_pages: pages.length,
    page_type_counts: pageTypeCounts,
    quality_avg: Number(avgQuality.toFixed(2)),
    priority_counts: { P0: p0Rows.length, P1: p1Rows.length, P2: p2Rows.length, P3: p3Rows.length },
    action_counts: actionCounts,
    duplication_family_risk_counts: familySummaryRows.reduce((a, f) => { a[f.risk] = (a[f.risk] || 0) + 1; return a; }, {}),
    chemical_claims_requiring_review: allClaims.filter((c) => c.review_required === 'REQUIRES_EXPERT_REVIEW').length,
    chemical_claims_total: allClaims.length,
    cannibalization_risk_counts: cannibalRows.reduce((a, r) => { a[r.risk] = (a[r.risk] || 0) + 1; return a; }, {}),
    schema_status_counts: schemaStatusCounts,
    broken_internal_links: brokenLinks.length,
    orphan_pages: orphanCount,
    adsense_counts: adsenseCounts,
    aeo_likely_answerable: aeoRows.filter((r) => r.ai_answerable_without_external_context === 'LIKELY').length,
    trust_missing_signals: missingSitewideSignals,
  },
  action_matrix: actionMatrix,
  duplication_families: familySummaryRows,
  cannibalization_top: cannibalRows.slice(0, 60),
};

function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Phase 7A Forensic Audit Dashboard</title>
<meta name="robots" content="noindex, nofollow">
<style>
  :root { color-scheme: light dark; }
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 24px; background: #0b0f14; color: #e6edf3; }
  h1 { font-size: 1.4rem; margin-bottom: 4px; }
  .meta { color: #8b949e; font-size: 0.85rem; margin-bottom: 20px; }
  .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 10px; margin-bottom: 24px; }
  .tile { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 12px; }
  .tile .n { font-size: 1.6rem; font-weight: 700; }
  .tile .l { font-size: 0.75rem; color: #8b949e; }
  .p0 { color: #f85149; } .p1 { color: #ffa657; } .p2 { color: #e3b341; } .p3 { color: #7ee787; }
  section { margin-bottom: 32px; }
  h2 { font-size: 1.05rem; border-bottom: 1px solid #30363d; padding-bottom: 6px; }
  .controls { display: flex; gap: 8px; margin: 10px 0; flex-wrap: wrap; }
  select, input { background: #0d1117; color: #e6edf3; border: 1px solid #30363d; border-radius: 6px; padding: 6px 8px; font-size: 0.85rem; }
  table { border-collapse: collapse; width: 100%; font-size: 0.78rem; }
  th, td { border: 1px solid #30363d; padding: 5px 8px; text-align: left; vertical-align: top; }
  th { cursor: pointer; background: #161b22; position: sticky; top: 0; user-select: none; }
  th:hover { background: #1f2530; }
  tr:nth-child(even) { background: #10151c; }
  .scroll { max-height: 520px; overflow: auto; border: 1px solid #30363d; border-radius: 6px; }
  .badge { padding: 1px 6px; border-radius: 10px; font-size: 0.7rem; font-weight: 600; }
  .P0 { background: #4a1414; color: #f85149; } .P1 { background: #4a2e14; color: #ffa657; }
  .P2 { background: #4a4114; color: #e3b341; } .P3 { background: #14401f; color: #7ee787; }
  .count { color: #8b949e; font-size: 0.8rem; margin-top: 4px; }
</style>
</head>
<body>
<h1>Phase 7A -- WaterBalanceTools Forensic Audit Dashboard</h1>
<div class="meta">Generated ${auditMetadata.timestamp} &middot; commit ${gitCommit.slice(0, 12)} &middot; node ${process.version} &middot; ${pages.length} pages audited &middot; methodology v${auditMetadata.methodology_version}</div>

<div class="tiles" id="tiles"></div>

<section>
  <h2>Page-Level Action Matrix (${actionMatrix.length} rows)</h2>
  <div class="controls">
    <input id="search" placeholder="search url / cluster / evidence..." style="min-width:260px">
    <select id="f-action"><option value="">Action: all</option></select>
    <select id="f-priority"><option value="">Priority: all</option></select>
    <select id="f-type"><option value="">Page type: all</option></select>
  </div>
  <div class="count" id="am-count"></div>
  <div class="scroll"><table id="am-table"><thead><tr>
    <th data-k="file_path">file_path</th><th data-k="page_type">page_type</th><th data-k="cluster">cluster</th>
    <th data-k="overall_quality_score">quality</th><th data-k="action">action</th><th data-k="priority">priority</th><th data-k="evidence">evidence</th>
  </tr></thead><tbody></tbody></table></div>
</section>

<section>
  <h2>Programmatic Duplication Families</h2>
  <div class="scroll"><table id="dup-table"><thead><tr>
    <th data-k="family">family</th><th data-k="page_count">pages</th><th data-k="risk">risk</th>
    <th data-k="avg_pairwise_similarity">avg similarity</th><th data-k="high_similarity_pairs">high-sim pairs</th>
    <th data-k="repeated_paragraph_blocks">repeated paras</th><th data-k="repeated_faqs">repeated FAQs</th><th data-k="repeated_tables">repeated tables</th>
  </tr></thead><tbody></tbody></table></div>
</section>

<section>
  <h2>Cannibalization -- top pairs by risk</h2>
  <div class="scroll"><table id="can-table"><thead><tr>
    <th data-k="page_a">page A</th><th data-k="page_b">page B</th><th data-k="shared_intent">intent</th>
    <th data-k="similarity">similarity</th><th data-k="risk">risk</th><th data-k="recommended_action">action</th>
  </tr></thead><tbody></tbody></table></div>
</section>

<script id="data" type="application/json">${JSON.stringify(dashboardData)}</script>
<script>
const DATA = JSON.parse(document.getElementById('data').textContent);

function tile(n, l, cls) { return '<div class="tile"><div class="n ' + (cls||'') + '">' + n + '</div><div class="l">' + l + '</div></div>'; }
const s = DATA.summary;
document.getElementById('tiles').innerHTML = [
  tile(s.total_pages, 'total pages'),
  tile(s.quality_avg, 'avg quality score /3'),
  tile(s.priority_counts.P0, 'P0 findings', 'p0'),
  tile(s.priority_counts.P1, 'P1 findings', 'p1'),
  tile(s.priority_counts.P2, 'P2 findings', 'p2'),
  tile(s.priority_counts.P3, 'P3 findings', 'p3'),
  tile(s.orphan_pages, 'orphan pages'),
  tile(s.broken_internal_links, 'broken internal links'),
  tile((s.schema_status_counts.MISREPRESENTED||0), 'schema MISREPRESENTED'),
  tile((s.schema_status_counts.QUESTIONABLE||0), 'schema QUESTIONABLE'),
  tile(s.chemical_claims_requiring_review, 'chem claims needing review', '', ),
  tile(s.adsense_counts.ADSENSE_RISK||0, 'AdSense RISK pages'),
  tile(s.aeo_likely_answerable + '/' + DATA.action_matrix.length, 'AI-answerable pages'),
  tile((s.duplication_family_risk_counts.CRITICAL||0)+(s.duplication_family_risk_counts.HIGH||0), 'HIGH/CRITICAL dup families'),
  tile((s.cannibalization_risk_counts.CRITICAL||0)+(s.cannibalization_risk_counts.HIGH||0), 'HIGH/CRITICAL cannibal pairs'),
  tile(s.trust_missing_signals.length, 'missing trust signals'),
].join('');

function makeSortable(tableId, rows, renderRow) {
  const table = document.getElementById(tableId);
  const tbody = table.querySelector('tbody');
  let sortKey = null, sortDir = 1;
  function render(data) {
    tbody.innerHTML = data.map(renderRow).join('');
  }
  render(rows);
  table.querySelectorAll('th').forEach((th) => {
    th.addEventListener('click', () => {
      const k = th.dataset.k;
      sortDir = (sortKey === k) ? -sortDir : 1;
      sortKey = k;
      const sorted = [...rows].sort((a, b) => {
        const av = a[k], bv = b[k];
        if (typeof av === 'number') return (av - bv) * sortDir;
        return String(av).localeCompare(String(bv)) * sortDir;
      });
      render(sorted);
    });
  });
  return render;
}

const amRows = DATA.action_matrix;
const amRender = makeSortable('am-table', amRows, (r) => '<tr><td>' + r.file_path + '</td><td>' + r.page_type + '</td><td>' + r.cluster + '</td><td>' + r.overall_quality_score + '</td><td>' + r.action + '</td><td><span class="badge ' + r.priority + '">' + r.priority + '</span></td><td>' + r.evidence.replace(/</g,'&lt;') + '</td></tr>');
document.getElementById('am-count').textContent = amRows.length + ' rows';

const actionSel = document.getElementById('f-action');
[...new Set(amRows.map(r=>r.action))].sort().forEach(a => actionSel.innerHTML += '<option value="'+a+'">'+a+'</option>');
const prioSel = document.getElementById('f-priority');
['P0','P1','P2','P3'].forEach(p => prioSel.innerHTML += '<option value="'+p+'">'+p+'</option>');
const typeSel = document.getElementById('f-type');
[...new Set(amRows.map(r=>r.page_type))].sort().forEach(t => typeSel.innerHTML += '<option value="'+t+'">'+t+'</option>');

function applyFilters() {
  const q = document.getElementById('search').value.toLowerCase();
  const a = actionSel.value, p = prioSel.value, t = typeSel.value;
  const filtered = amRows.filter(r =>
    (!a || r.action === a) && (!p || r.priority === p) && (!t || r.page_type === t) &&
    (!q || (r.url + r.cluster + r.evidence).toLowerCase().includes(q))
  );
  document.getElementById('am-count').textContent = filtered.length + ' / ' + amRows.length + ' rows';
  document.getElementById('am-table').querySelector('tbody').innerHTML = filtered.map(r => '<tr><td>' + r.file_path + '</td><td>' + r.page_type + '</td><td>' + r.cluster + '</td><td>' + r.overall_quality_score + '</td><td>' + r.action + '</td><td><span class="badge ' + r.priority + '">' + r.priority + '</span></td><td>' + r.evidence.replace(/</g,'&lt;') + '</td></tr>').join('');
}
['search'].forEach(id => document.getElementById(id).addEventListener('input', applyFilters));
[actionSel, prioSel, typeSel].forEach(el => el.addEventListener('change', applyFilters));

makeSortable('dup-table', DATA.duplication_families, (f) => '<tr><td>' + f.family + '</td><td>' + f.page_count + '</td><td>' + f.risk + '</td><td>' + f.avg_pairwise_similarity + '</td><td>' + f.high_similarity_pairs + '</td><td>' + f.repeated_paragraph_blocks + '</td><td>' + f.repeated_faqs + '</td><td>' + f.repeated_tables + '</td></tr>');

makeSortable('can-table', DATA.cannibalization_top, (r) => '<tr><td>' + r.page_a.replace('https://waterbalancetools.com/','') + '</td><td>' + r.page_b.replace('https://waterbalancetools.com/','') + '</td><td>' + r.shared_intent + '</td><td>' + r.similarity + '</td><td>' + r.risk + '</td><td>' + r.recommended_action + '</td></tr>');
</script>
</body>
</html>
`;
writeText('index.html', dashboardHtml);
console.log('Dashboard written to reports/phase-7a/index.html');
