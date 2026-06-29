#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'audit', 'indexing-audit');
const JSON_PATH = path.join(OUT_DIR, 'search-console-analysis.json');
const REPORT_PATH = path.join(OUT_DIR, 'reports', 'search-console-analysis.md');

function readJson(file, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function run() {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const links = readJson(path.join(OUT_DIR, 'internal-links.json'), {});
  const canon = readJson(path.join(OUT_DIR, 'canonical-audit.json'), {});
  const sitemap = readJson(path.join(OUT_DIR, 'sitemap-audit.json'), {});
  const redirects = readJson(path.join(OUT_DIR, 'redirect-audit.json'), {});

  const redirectedUrls = redirects.totalRules || 0;
  const urls404Risk = (links.brokenInternalLinks || 0) + (sitemap.missingInBuild || 0);
  const alternateCanonicals = canon.nonSelfCanonical || 0;
  const crawledNotIndexedRisk = (links.orphanRisk || []).filter((x) => x.inbound <= 1).length;

  const payload = {
    generatedAt: new Date().toISOString(),
    dataSource: 'Repository and generated-output evidence only (no direct GSC API export provided).',
    issueEstimates: {
      redirectedUrls,
      urls404Risk,
      alternateCanonicals,
      crawledNotIndexedRisk,
    },
    evidence: {
      redirectRuleCount: redirects.totalRules || 0,
      brokenInternalLinks: links.brokenInternalLinks || 0,
      canonicalNonSelf: canon.nonSelfCanonical || 0,
      sitemapMissingInBuild: sitemap.missingInBuild || 0,
      orphanRiskPages: (links.orphanRisk || []).length,
    },
    confidence: {
      redirectedUrls: 'High',
      urls404Risk: 'Medium',
      alternateCanonicals: 'High',
      crawledNotIndexedRisk: 'Medium',
    },
    limitations: [
      'No direct Search Console issue export available in repository.',
      'Counts are evidence-backed estimates from crawl/build artifacts.',
    ],
  };

  fs.writeFileSync(JSON_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  const md = `# Search Console Analysis (Repository-Based)\n\n` +
    `- Data source: ${payload.dataSource}\n\n` +
    `## Redirect pages\n` +
    `- Estimated count: ${payload.issueEstimates.redirectedUrls}\n` +
    `- Evidence: _redirects rules = ${payload.evidence.redirectRuleCount}\n` +
    `- Confidence: ${payload.confidence.redirectedUrls}\n\n` +
    `## 404 URLs\n` +
    `- Estimated risk count: ${payload.issueEstimates.urls404Risk}\n` +
    `- Evidence: broken internal links (${payload.evidence.brokenInternalLinks}) + sitemap entries missing in build (${payload.evidence.sitemapMissingInBuild})\n` +
    `- Confidence: ${payload.confidence.urls404Risk}\n\n` +
    `## Alternate canonical URLs\n` +
    `- Count: ${payload.issueEstimates.alternateCanonicals}\n` +
    `- Evidence: non-self canonical count from canonical audit\n` +
    `- Confidence: ${payload.confidence.alternateCanonicals}\n\n` +
    `## Crawled, Not Indexed (risk heuristic)\n` +
    `- Estimated risk count: ${payload.issueEstimates.crawledNotIndexedRisk}\n` +
    `- Evidence: low-inbound/orphan-risk pages from internal-link crawl\n` +
    `- Confidence: ${payload.confidence.crawledNotIndexedRisk}\n\n` +
    `## Limitations\n` +
    payload.limitations.map((x) => `- ${x}`).join('\n') + '\n';

  fs.writeFileSync(REPORT_PATH, md, 'utf8');
  console.log(`audit-search-console: wrote ${JSON_PATH} and ${REPORT_PATH}`);
}

run();
