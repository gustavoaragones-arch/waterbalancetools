#!/usr/bin/env node
'use strict';
/**
 * build-content-inventory.js (Phase 7P, Step 1)
 * Fresh, repository-grounded inventory of every canonical production page:
 * URL, title, H1, page type, topic-cluster tags, inbound links, crawl
 * depth, citation state, schema, word count, hub membership. Reuses the
 * same BFS/link-extraction approach as Phase 7O's crawl-path-simulation.js
 * so depth/inbound counts are measured, not estimated.
 */
const fs = require('fs');
const path = require('path');
const urlPolicy = require('../url-policy');

const ROOT = path.join(__dirname, '..', '..');
const SKIP_DIRS = new Set([...urlPolicy.NON_PAGE_DIRS, ...urlPolicy.INTERNAL_TOOLING_DIRS, 'components', 'templates', 'partials']);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
}
const allFiles = [];
walk(ROOT, allFiles);

function toPageUrl(filePath) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  let clean = '/' + rel;
  clean = clean.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (clean.length > 1) clean = clean.replace(/\/$/, '');
  return clean || '/';
}
const fileByUrl = new Map();
for (const f of allFiles) fileByUrl.set(toPageUrl(f), f);

function extractLinks(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const withoutCode = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const hrefs = [...withoutCode.matchAll(/<a[^>]+href="([^"]+)"/gi)].map((m) => m[1]);
  const out = new Set();
  for (const href of hrefs) {
    if (/^(mailto:|tel:|https?:\/\/|#|javascript:)/.test(href)) continue;
    let normalized = href.split(/[?#]/)[0];
    if (!normalized) continue;
    if (normalized.startsWith('./')) normalized = normalized.slice(1);
    if (!normalized.startsWith('/')) {
      const dir = path.dirname(toPageUrl(filePath) === '/' ? '/index' : '/' + path.relative(ROOT, filePath).replace(/\\/g, '/'));
      normalized = path.join(dir, normalized).replace(/\\/g, '/');
    }
    normalized = normalized.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (normalized.length > 1) normalized = normalized.replace(/\/$/, '');
    out.add(normalized || '/');
  }
  return out;
}

// BFS from homepage: depth map + inbound edge counts.
const visited = new Map(); // url -> depth
const inbound = new Map(); // url -> count of distinct linking pages
const queue = [['/', 0]];
visited.set('/', 0);
while (queue.length) {
  const [url, depth] = queue.shift();
  const file = fileByUrl.get(url) || fileByUrl.get(url + '/');
  if (!file) continue;
  const links = extractLinks(file);
  for (const l of links) {
    const target = fileByUrl.has(l) ? l : fileByUrl.has(l + '/') ? l + '/' : null;
    if (!target) continue;
    inbound.set(target, (inbound.get(target) || 0) + 1);
    if (!visited.has(target)) {
      visited.set(target, depth + 1);
      queue.push([target, depth + 1]);
    }
  }
}

function extract(re, html, group = 1) {
  const m = html.match(re);
  return m ? m[group].trim() : '';
}
function wordCount(html) {
  const noScriptStyle = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const main = noScriptStyle.match(/<main[\s\S]*?<\/main>/i);
  const scope = main ? main[0] : noScriptStyle;
  const text = scope.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ');
  return text.split(/\s+/).filter(Boolean).length;
}

const TOPIC_KEYWORDS = [
  ['chlorine', /chlorine|dichlor|trichlor|cal-?hypo|hypochlorite|sanitizer level/i],
  ['ph', /\bph\b/i],
  ['alkalinity', /alkalinity/i],
  ['calcium-hardness', /calcium hardness|calcium-hardness/i],
  ['cyanuric-acid', /cyanuric|\bcya\b|stabilizer/i],
  ['salt', /salt-?water|saltwater|salt system|\bswg\b/i],
  ['bromine', /bromine/i],
  ['shock', /shock/i],
  ['algae', /algae|algaecide/i],
  ['sanitizer', /sanitizer/i],
  ['water-temperature', /temperature|evaporation/i],
  ['pool-volume', /volume|gallons|\bsize\b/i],
  ['hot-tub-chemistry', /hot-?tub|spa\b/i],
  ['indoor-pools', /indoor pool/i],
  ['seasonal-maintenance', /winter|summer|season|opening|closing/i],
  ['troubleshooting', /cloudy|troubleshoot|problem|fix|mistake/i],
  ['testing', /test strip|testing|test kit/i],
  ['water-balance', /water balance|lsi|saturation index/i],
  ['equipment', /pump|filter|heater|liner|plaster|equipment|cover\b/i],
];
function tagTopics(text) {
  const hits = TOPIC_KEYWORDS.filter(([, re]) => re.test(text)).map(([k]) => k);
  return hits.join('|') || 'general';
}

function pageType(rel) {
  const top = urlPolicy.topDir(rel);
  return top || 'root';
}

const rows = [];
for (const f of allFiles) {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  if (!urlPolicy.isProductionPage(rel)) continue;
  const html = fs.readFileSync(f, 'utf8');
  const url = toPageUrl(f);
  const title = extract(/<title>([^<]*)<\/title>/i, html);
  const h1 = extract(/<h1[^>]*>([\s\S]*?)<\/h1>/i, html).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const description = extract(/<meta name="description" content="([^"]*)"/i, html);
  const robots = extract(/<meta name="robots" content="([^"]*)"/i, html) || 'index, follow';
  const canonical = extract(/<link rel="canonical" href="([^"]*)"/i, html);
  const schemaTypes = [...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
  const uniqueSchema = [...new Set(schemaTypes)].join('|');
  const hasCitationBlock = /<section class="knowledge-sources-real">/.test(html);
  const citationLinks = (html.match(/knowledge-source-item/g) || []).length;
  const wc = wordCount(html);
  const depth = visited.has(url) ? visited.get(url) : (visited.has(url + '/') ? visited.get(url + '/') : '');
  const inboundCount = inbound.get(url) || inbound.get(url + '/') || 0;
  const indexable = urlPolicy.isIndexablePage(rel);
  const redirectSource = urlPolicy.isRedirectSource(rel);
  const topicText = `${title} ${h1} ${description} ${rel}`;

  rows.push({
    url,
    rel,
    title,
    h1,
    page_type: pageType(rel),
    topics: tagTopics(topicText),
    inbound_links: inboundCount,
    crawl_depth: depth,
    indexable,
    redirect_source: redirectSource,
    robots,
    canonical,
    schema_types: uniqueSchema,
    citation_block: hasCitationBlock,
    citation_links: citationLinks,
    word_count: wc,
    description_present: !!description,
  });
}

function csvEscape(v) {
  const s = String(v === undefined || v === null ? '' : v);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
const headers = ['url', 'rel', 'title', 'h1', 'page_type', 'topics', 'inbound_links', 'crawl_depth', 'indexable', 'redirect_source', 'robots', 'canonical', 'schema_types', 'citation_block', 'citation_links', 'word_count', 'description_present'];
const csv = [headers.join(',')].concat(rows.map((r) => headers.map((h) => csvEscape(r[h])).join(','))).join('\n') + '\n';

fs.mkdirSync(path.join(ROOT, 'reports', 'phase-7p'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'reports', 'phase-7p', 'CONTENT-INVENTORY.csv'), csv);

const byType = {};
for (const r of rows) byType[r.page_type] = (byType[r.page_type] || 0) + 1;
console.log(`build-content-inventory: ${rows.length} production pages inventoried.`);
console.log(JSON.stringify(byType, null, 2));
