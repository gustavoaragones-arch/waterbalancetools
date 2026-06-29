#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'assets',
  'agent-transcripts',
  'templates',
  'partials',
  'scripts',
  'data',
  'components',
  'mcps',
  'terminals',
  'qa',
  'reports',
]);

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function walkFiles(dir, matcher, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walkFiles(full, matcher, out);
      continue;
    }
    if (e.isFile() && matcher(full)) out.push(full);
  }
  return out;
}

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function getAllPages() {
  return walkFiles(ROOT, (p) => p.endsWith('.html'));
}

function getVersionInfo() {
  const v = readJson(path.join(ROOT, 'data', 'datasets', 'version.json'), {});
  const trust = readJson(path.join(ROOT, 'data', 'trust', 'datasets.json'), {});
  return {
    platformVersion: v.websiteVersion || v.generatorVersion || 'unknown',
    datasetVersion: (v.datasets && Object.values(v.datasets)[0]) || 'unknown',
    entityVersion: v.entityVersion || 'unknown',
    knowledgeVersion: v.knowledgeGraphVersion || 'unknown',
    trustVersion: trust.version || 'unknown',
    buildDate: new Date().toISOString(),
  };
}

function createAuditResult(name) {
  return {
    id: name,
    summary: '',
    passedChecks: [],
    warnings: [],
    errors: [],
    metrics: {},
    recommendations: [],
    score: 100,
    critical: false,
  };
}

function has(html, pattern) {
  return pattern.test(html);
}

function runArchitectureAudit(ctx) {
  const r = createAuditResult('architecture');
  const templates = walkFiles(path.join(ROOT, 'templates'), (p) => p.endsWith('.html'));
  const partials = walkFiles(path.join(ROOT, 'partials'), (p) => p.endsWith('.html'));
  const scripts = walkFiles(path.join(ROOT, 'scripts'), (p) => p.endsWith('.js'));

  const duplicateNames = new Map();
  for (const f of [...templates, ...partials, ...scripts]) {
    const b = path.basename(f);
    duplicateNames.set(b, (duplicateNames.get(b) || 0) + 1);
  }
  const dup = [...duplicateNames.entries()].filter(([, n]) => n > 1).map(([b]) => b);
  if (dup.length) r.warnings.push(`Duplicate filenames across architecture: ${dup.slice(0, 20).join(', ')}`);
  else r.passedChecks.push('No duplicate template/partial/script filenames');

  const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
  const classMatches = css.match(/\.[a-zA-Z_][\w-]*\s*\{/g) || [];
  const classCount = {};
  classMatches.forEach((m) => {
    const k = m.replace('{', '').trim();
    classCount[k] = (classCount[k] || 0) + 1;
  });
  const duplicateCssClasses = Object.keys(classCount).filter((k) => classCount[k] > 1);
  r.metrics.duplicateCssClasses = duplicateCssClasses.length;
  if (duplicateCssClasses.length > 20) r.warnings.push(`Many duplicate CSS class definitions (${duplicateCssClasses.length})`);
  else r.passedChecks.push('No severe CSS class duplication');

  // Cloudflare static compatibility checks
  const hasServerCode = scripts.some((p) => {
    const src = fs.readFileSync(p, 'utf8');
    return (
      /require\(['"]express['"]\)|from ['"]express['"]/.test(src) ||
      /require\(['"]fastify['"]\)|from ['"]fastify['"]/.test(src) ||
      /require\(['"]koa['"]\)|from ['"]koa['"]/.test(src) ||
      /http\.createServer\s*\(/.test(src)
    );
  });
  if (hasServerCode) r.errors.push('Potential server-runtime dependency found in scripts');
  else r.passedChecks.push('Static-first build scripts (Cloudflare Pages compatible)');

  r.metrics.templates = templates.length;
  r.metrics.partials = partials.length;
  r.metrics.scripts = scripts.length;
  r.summary = 'Checks template/partial/script duplication and static-hosting compatibility.';
  r.score = r.errors.length
    ? Math.max(0, 100 - r.errors.length * 25 - r.warnings.length * 8)
    : Math.max(0, 100 - r.warnings.length * 4);
  r.critical = r.errors.length > 0;
  if (!r.recommendations.length) r.recommendations.push('Keep generator-only architecture with no server dependencies.');
  return r;
}

function runSeoAudit(ctx) {
  const r = createAuditResult('seo');
  const titles = new Map();
  const descs = new Map();
  let missingCanonical = 0;
  let missingOg = 0;
  let missingTwitter = 0;
  let missingH1 = 0;
  let badH1Count = 0;
  let missingLang = 0;
  let missingRobots = 0;
  let missingBreadcrumb = 0;

  for (const p of ctx.pages) {
    const html = fs.readFileSync(p, 'utf8');
    const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || '';
    const desc = (html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1] || '';
    if (title) titles.set(title, (titles.get(title) || 0) + 1);
    if (desc) descs.set(desc, (descs.get(desc) || 0) + 1);
    if (!has(html, /<link[^>]+rel="canonical"/i)) missingCanonical++;
    if (!has(html, /property="og:title"/i) || !has(html, /property="og:description"/i)) missingOg++;
    if (!has(html, /name="twitter:card"/i)) missingTwitter++;
    const h1s = html.match(/<h1\b[^>]*>/gi) || [];
    if (!h1s.length) missingH1++;
    if (h1s.length !== 1) badH1Count++;
    if (!has(html, /<html[^>]+lang=/i)) missingLang++;
    if (!has(html, /<meta[^>]+name="robots"/i)) missingRobots++;
    if (p !== path.join(ROOT, 'index.html') && !has(html, /class="breadcrumb"/)) missingBreadcrumb++;
  }

  const dupTitles = [...titles.entries()].filter(([, n]) => n > 1);
  const dupDescs = [...descs.entries()].filter(([, n]) => n > 1);
  if (dupTitles.length) r.errors.push(`Duplicate titles: ${dupTitles.length}`);
  if (dupDescs.length) r.warnings.push(`Duplicate descriptions: ${dupDescs.length}`);
  if (missingCanonical) r.errors.push(`Missing canonical on ${missingCanonical} page(s)`);
  if (missingOg) r.warnings.push(`Missing Open Graph tags on ${missingOg} page(s)`);
  if (missingTwitter) r.warnings.push(`Missing Twitter cards on ${missingTwitter} page(s)`);
  if (missingH1) r.errors.push(`Missing H1 on ${missingH1} page(s)`);
  if (badH1Count) r.errors.push(`Not exactly one H1 on ${badH1Count} page(s)`);
  if (missingLang) r.errors.push(`Missing html lang on ${missingLang} page(s)`);
  if (missingRobots) r.warnings.push(`Missing robots meta on ${missingRobots} page(s)`);
  if (missingBreadcrumb) r.warnings.push(`Missing breadcrumb on ${missingBreadcrumb} page(s)`);

  r.metrics.totalPages = ctx.pages.length;
  r.metrics.duplicateTitles = dupTitles.length;
  r.metrics.duplicateDescriptions = dupDescs.length;
  r.summary = 'Validates metadata uniqueness and required SEO tags.';
  r.score = r.errors.length
    ? Math.max(0, 100 - r.errors.length * 18 - r.warnings.length * 6)
    : Math.max(0, 100 - r.warnings.length * 2);
  r.critical = r.errors.length > 0;
  r.recommendations.push('Add twitter:card metadata in templates to reduce warnings.');
  return r;
}

function runPerformanceAudit(ctx) {
  const r = createAuditResult('performance');
  const cssPath = path.join(ROOT, 'style.css');
  const cssSizeKb = fs.existsSync(cssPath) ? Math.round(fs.statSync(cssPath).size / 1024) : 0;

  let maxHtmlKb = 0;
  let avgHtmlKb = 0;
  for (const p of ctx.pages) {
    const kb = fs.statSync(p).size / 1024;
    avgHtmlKb += kb;
    if (kb > maxHtmlKb) maxHtmlKb = kb;
  }
  avgHtmlKb = ctx.pages.length ? avgHtmlKb / ctx.pages.length : 0;

  const jsFiles = walkFiles(path.join(ROOT, 'js'), (p) => p.endsWith('.js'));
  const jsKb = Math.round(jsFiles.reduce((s, p) => s + fs.statSync(p).size, 0) / 1024);
  const svgCount = walkFiles(ROOT, (p) => p.endsWith('.svg')).length;

  r.metrics.maxHtmlKb = Number(maxHtmlKb.toFixed(1));
  r.metrics.avgHtmlKb = Number(avgHtmlKb.toFixed(1));
  r.metrics.cssKb = cssSizeKb;
  r.metrics.jsKb = jsKb;
  r.metrics.svgCount = svgCount;

  if (maxHtmlKb > 100) r.warnings.push(`Largest HTML file exceeds target: ${maxHtmlKb.toFixed(1)}KB`);
  else r.passedChecks.push('HTML size target met');
  if (cssSizeKb > 100) r.warnings.push(`CSS exceeds target: ${cssSizeKb}KB`);
  if (jsKb > 150) r.warnings.push(`JS bundle sum exceeds target: ${jsKb}KB`);
  if (maxHtmlKb > 180) r.errors.push('Critical HTML weight issue detected');

  r.summary = 'Measures file-size based performance budgets for static delivery.';
  r.score = Math.max(0, 100 - r.errors.length * 22 - r.warnings.length * 7);
  r.critical = r.errors.length > 0;
  r.recommendations.push('Minify CSS/JS in production pipeline if warnings persist.');
  return r;
}

function runSchemaAudit(ctx) {
  const r = createAuditResult('schema');
  const required = ['WebPage', 'BreadcrumbList', 'FAQPage'];
  const coverage = {};
  required.forEach((k) => { coverage[k] = 0; });
  let invalidJsonLd = 0;
  for (const p of ctx.pages) {
    const html = fs.readFileSync(p, 'utf8');
    const scripts = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
    if (!scripts.length) continue;
    for (const block of scripts) {
      const jsonText = block.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '').trim();
      try {
        const data = JSON.parse(jsonText);
        const type = data['@type'];
        if (type && coverage[type] !== undefined) coverage[type]++;
      } catch (_) {
        invalidJsonLd++;
      }
    }
  }
  Object.entries(coverage).forEach(([k, v]) => {
    if (v === 0) r.warnings.push(`Schema type not found: ${k}`);
  });
  if (invalidJsonLd) r.errors.push(`Invalid JSON-LD blocks: ${invalidJsonLd}`);
  r.metrics.schemaCoverage = coverage;
  r.summary = 'Checks JSON-LD validity and core schema coverage.';
  r.score = Math.max(0, 100 - r.errors.length * 20 - r.warnings.length * 8);
  r.critical = r.errors.length > 0;
  return r;
}

function runAccessibilityAudit(ctx) {
  const r = createAuditResult('accessibility');
  let missingAlt = 0;
  let missingLabel = 0;
  let missingAria = 0;
  let headingSkips = 0;
  for (const p of ctx.pages) {
    const html = fs.readFileSync(p, 'utf8');
    const imgs = html.match(/<img\b[^>]*>/gi) || [];
    imgs.forEach((img) => {
      if (!/alt=/.test(img)) missingAlt++;
    });
    const inputs = html.match(/<input\b[^>]*>/gi) || [];
    inputs.forEach((input) => {
      const type = ((input.match(/type="([^"]+)"/i) || [])[1] || 'text').toLowerCase();
      if (['hidden', 'submit', 'button', 'image', 'reset'].includes(type)) return;
      if (!/id=/.test(input)) return;
      if (/aria-label=|aria-labelledby=/i.test(input)) return;
      const id = (input.match(/id="([^"]+)"/) || [])[1];
      if (!id) return;
      if (new RegExp(`<label[^>]*>[^<]*<input[^>]+id="${id}"`, 'i').test(html)) return;
      const re = new RegExp(`<label[^>]+for="${id}"`, 'i');
      if (!re.test(html)) missingLabel++;
    });
    const buttons = html.match(/<button\b[^>]*>/gi) || [];
    buttons.forEach((btn) => {
      if (!/aria-label=/.test(btn) && />\s*</.test(btn)) missingAria++;
    });
    const hs = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
    for (let i = 1; i < hs.length; i++) {
      if (hs[i] - hs[i - 1] > 1) headingSkips++;
    }
  }
  if (missingAlt) r.errors.push(`Images missing alt attributes: ${missingAlt}`);
  if (missingLabel) r.errors.push(`Inputs without explicit label: ${missingLabel}`);
  if (missingAria) r.warnings.push(`Buttons missing accessible labels/content: ${missingAria}`);
  if (headingSkips) r.warnings.push(`Heading hierarchy skips detected: ${headingSkips}`);
  r.metrics = { missingAlt, missingLabel, missingAria, headingSkips };
  r.summary = 'Performs static WCAG-oriented checks for forms, images, and heading structure.';
  r.score = r.errors.length
    ? Math.max(0, 100 - r.errors.length * 18 - r.warnings.length * 6)
    : Math.max(0, 100 - r.warnings.length * 4);
  r.critical = missingAlt > 0 || missingLabel > 0;
  r.recommendations.push('Add skip-links and reduced-motion checks in next UX hardening pass.');
  return r;
}

function runMobileAudit(ctx) {
  const r = createAuditResult('mobile');
  let missingViewport = 0;
  let fixedWidths = 0;
  for (const p of ctx.pages) {
    const html = fs.readFileSync(p, 'utf8');
    if (!/<meta[^>]+name="viewport"/i.test(html)) missingViewport++;
    const inlineStyleWidths = html.match(/style="[^"]*width:\s*\d+px/gi) || [];
    fixedWidths += inlineStyleWidths.length;
  }
  if (missingViewport) r.errors.push(`Missing mobile viewport meta on ${missingViewport} page(s)`);
  if (fixedWidths > 40) r.warnings.push(`Potential fixed-width inline styles: ${fixedWidths}`);
  r.metrics = { missingViewport, fixedWidths };
  r.summary = 'Checks baseline mobile-readiness indicators.';
  r.score = Math.max(0, 100 - r.errors.length * 20 - r.warnings.length * 5);
  r.critical = missingViewport > 0;
  return r;
}

function runLinksAudit(ctx) {
  const r = createAuditResult('links');
  const crawlRules = readJson(path.join(ROOT, 'data', 'indexing', 'crawl-rules.json'), { rules: [] });
  const ruleByUrl = new Map((crawlRules.rules || []).map((x) => [x.url, x]));
  function isTier123(url) {
    const rule = ruleByUrl.get(url);
    if (!rule) return true;
    return ['Tier 1', 'Tier 2', 'Tier 3'].includes(rule.crawlTier);
  }
  function toPageUrl(filePath) {
    const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
    let clean = '/' + rel;
    clean = clean.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (clean.length > 1) clean = clean.replace(/\/$/, '');
    return clean;
  }
  function pageUrlVariants(pagePath) {
    const clean = toPageUrl(pagePath);
    const withSlash = clean.endsWith('/') ? clean : clean + '/';
    return new Set([clean, withSlash, clean.replace(/\/$/, '')]);
  }
  const pagesByUrl = new Set();
  ctx.pages.forEach((p) => pageUrlVariants(p).forEach((u) => pagesByUrl.add(u)));
  function pageExistsByHref(cleanUrl) {
    const normalized = cleanUrl.replace(/^\//, '');
    const absolute = path.join(ROOT, normalized);
    if (fs.existsSync(absolute)) return true;
    if (fs.existsSync(absolute + '.html')) return true;
    if (fs.existsSync(path.join(absolute, 'index.html'))) return true;
    return false;
  }
  const inbound = new Map();
  const outbound = new Map();
  let broken = 0;

  for (const p of ctx.pages) {
    const url = toPageUrl(p);
    const html = fs.readFileSync(p, 'utf8');
    const htmlWithoutCode = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ');
    const links = [...htmlWithoutCode.matchAll(/<a[^>]+href="([^"]+)"/gi)].map((m) => m[1]);
    const out = new Set();
    links.forEach((href) => {
      if (/^(mailto:|tel:|https?:\/\/|#|javascript:)/.test(href)) return;
      let normalized = href.split(/[?#]/)[0];
      if (!normalized) return;
      if (normalized.startsWith('./')) normalized = normalized.slice(1);
      if (!normalized.startsWith('/')) {
        const rel = path.join(path.dirname('/' + path.relative(ROOT, p).replace(/\\/g, '/')), normalized);
        normalized = rel.replace(/\\/g, '/');
      }
      normalized = normalized.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
      if (normalized.length > 1) normalized = normalized.replace(/\/$/, '');
      out.add(normalized);
      if (!pagesByUrl.has(normalized) && !pagesByUrl.has(normalized + '/') && !pageExistsByHref(normalized)) broken++;
      inbound.set(normalized, (inbound.get(normalized) || 0) + 1);
    });
    outbound.set(url, out.size);
  }

  const canonicalPages = ctx.pages.map((p) => toPageUrl(p));
  const corePages = canonicalPages.filter((u) => isTier123(u));
  const orphans = corePages.filter((u) => !['/', '/404'].includes(u) && (inbound.get(u) || inbound.get(u + '/') || 0) === 0);
  const lowOutbound = corePages.filter((u) => (outbound.get(u) || 0) < 3).length;
  const lowInbound = corePages.filter((u) => (inbound.get(u) || inbound.get(u + '/') || 0) < 3).length;
  if (broken) r.errors.push(`Broken internal links detected: ${broken}`);
  if (orphans.length) r.errors.push(`Orphan pages: ${orphans.length}`);
  if (lowInbound) r.warnings.push(`Pages with inbound links < 3: ${lowInbound}`);
  if (lowOutbound) r.warnings.push(`Pages with outbound links < 3: ${lowOutbound}`);
  r.metrics = { brokenLinks: broken, orphanPages: orphans.length, lowInbound, lowOutbound };
  r.summary = 'Builds inbound/outbound link statistics and detects broken internal links.';
  r.score = r.errors.length
    ? Math.max(0, 100 - r.errors.length * 22 - r.warnings.length * 5)
    : 100;
  r.critical = broken > 0 || orphans.length > 0;
  return r;
}

function runEntitiesAudit(ctx) {
  const r = createAuditResult('entities');
  const index = readJson(path.join(ROOT, 'data', 'graph', 'entity-index.json'), {});
  const rels = readJson(path.join(ROOT, 'data', 'graph', 'relationships.json'), []);
  const aliases = readJson(path.join(ROOT, 'data', 'graph', 'aliases.json'), {});
  const syn = readJson(path.join(ROOT, 'data', 'graph', 'synonyms.json'), {});
  const ids = Object.keys(index);
  const incoming = {};
  const outgoing = {};
  ids.forEach((id) => { incoming[id] = 0; outgoing[id] = 0; });
  rels.forEach((rel) => {
    if (outgoing[rel.from] !== undefined) outgoing[rel.from]++;
    if (incoming[rel.to] !== undefined) incoming[rel.to]++;
  });
  const orphans = ids.filter((id) => {
    const e = index[id] || {};
    const refs = [
      ...(e.calculatorIds || []), ...(e.formulaIds || []), ...(e.academyIds || []),
      ...(e.glossaryIds || []), ...(e.referenceIds || []), ...(e.resourceIds || []),
      ...(e.chartIds || []), ...(e.problemIds || []), ...(e.relatedEntities || []),
    ];
    return incoming[id] === 0 && outgoing[id] === 0 && refs.length === 0;
  });

  const aliasTargets = new Set(Object.values(aliases || {}));
  const duplicateAliasKeys = Object.keys(aliases || {}).length - new Set(Object.keys(aliases || {})).size;
  if (duplicateAliasKeys) r.errors.push('Duplicate aliases found');
  if (orphans.length) r.errors.push(`Orphan entities: ${orphans.length}`);

  const synonymSetCount = Object.keys(syn || {}).length;
  const density = ids.length ? Number((rels.length / ids.length).toFixed(2)) : 0;
  r.metrics = {
    totalEntities: ids.length,
    relationships: rels.length,
    relationshipDensity: density,
    orphanEntities: orphans.length,
    aliasCoverage: aliasTargets.size,
    synonymSets: synonymSetCount,
  };
  r.summary = 'Validates entity graph density, orphan risk, alias/synonym coverage.';
  r.score = Math.max(0, 100 - r.errors.length * 20 - r.warnings.length * 6);
  r.critical = orphans.length > 0;
  return r;
}

function runDatasetsAudit(ctx) {
  const r = createAuditResult('datasets');
  const dataDir = path.join(ROOT, 'data', 'datasets');
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json') && f !== 'resolved-ranges.json');
  let duplicateRecords = 0;
  let missingVersions = 0;
  let totalRecords = 0;
  files.forEach((f) => {
    const d = readJson(path.join(dataDir, f), {});
    if (!d.version) missingVersions++;
    const recs = Array.isArray(d.records) ? d.records : [];
    totalRecords += recs.length;
    const ids = new Set();
    recs.forEach((rec) => {
      if (!rec.id) return;
      if (ids.has(rec.id)) duplicateRecords++;
      ids.add(rec.id);
    });
  });
  if (duplicateRecords) r.errors.push(`Duplicate dataset records: ${duplicateRecords}`);
  if (missingVersions) r.errors.push(`Datasets missing version: ${missingVersions}`);
  r.metrics = { totalDatasets: files.length, totalRecords, duplicateRecords, missingVersions };
  r.summary = 'Checks canonical dataset versions and record uniqueness.';
  r.score = Math.max(0, 100 - r.errors.length * 25 - r.warnings.length * 6);
  r.critical = duplicateRecords > 0 || missingVersions > 0;
  return r;
}

function runCalculatorsAudit(ctx) {
  const r = createAuditResult('calculators');
  const calcDir = path.join(ROOT, 'calculators');
  const pages = fs.readdirSync(calcDir).filter((f) => f.endsWith('.html') && f !== 'index.html');
  let missingTrust = 0;
  let missingHero = 0;
  let missingForm = 0;
  let missingVersionBadge = 0;
  let missingMethodLinks = 0;
  pages.forEach((f) => {
    const html = fs.readFileSync(path.join(calcDir, f), 'utf8');
    if (!/trust-panel/.test(html)) missingTrust++;
    if (!/<h1/i.test(html)) missingHero++;
    if (!/<form/i.test(html)) missingForm++;
    if (!/version-badge/.test(html)) missingVersionBadge++;
    if (!/methodology\/|known-limitations|rounding-policy/i.test(html)) missingMethodLinks++;
  });
  if (missingTrust) r.errors.push(`Calculators missing trust panel: ${missingTrust}`);
  if (missingForm) r.errors.push(`Calculators missing calculator form: ${missingForm}`);
  if (missingHero) r.errors.push(`Calculators missing hero heading: ${missingHero}`);
  if (missingVersionBadge) r.errors.push(`Calculators missing version badge: ${missingVersionBadge}`);
  if (missingMethodLinks) r.warnings.push(`Calculators missing methodology links: ${missingMethodLinks}`);
  r.metrics = { totalCalculators: pages.length, missingTrust, missingHero, missingForm, missingVersionBadge, missingMethodLinks };
  r.summary = 'Validates required calculator sections and trust metadata components.';
  r.score = Math.max(0, 100 - r.errors.length * 20 - r.warnings.length * 6);
  r.critical = missingTrust > 0 || missingForm > 0 || missingHero > 0 || missingVersionBadge > 0;
  return r;
}

function runContentAudit(ctx) {
  const r = createAuditResult('content');
  let placeholder = 0;
  let missingUpdated = 0;
  let missingVersion = 0;
  const paragraphHashes = new Map();
  let duplicateParagraphs = 0;
  for (const p of ctx.pages) {
    const html = fs.readFileSync(p, 'utf8');
    const textOnly = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ');
    if (/\bTODO\b|lorem ipsum/ig.test(textOnly)) placeholder++;
    if (!/Last updated|last reviewed|lastUpdated/i.test(html)) missingUpdated++;
    if (!/version-badge|Version/i.test(html)) missingVersion++;
    const paras = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1].replace(/<[^>]+>/g, '').trim()).filter((t) => t.length > 40);
    paras.forEach((t) => {
      const key = t.toLowerCase();
      paragraphHashes.set(key, (paragraphHashes.get(key) || 0) + 1);
    });
  }
  for (const n of paragraphHashes.values()) if (n > 6) duplicateParagraphs++;
  if (placeholder) r.errors.push(`Placeholder/TODO text found in ${placeholder} page(s)`);
  if (missingUpdated) r.warnings.push(`Missing updated date indicators: ${missingUpdated}`);
  if (missingVersion) r.warnings.push(`Pages missing version cues: ${missingVersion}`);
  if (duplicateParagraphs) r.warnings.push(`Potential repeated paragraph blocks: ${duplicateParagraphs}`);
  r.metrics = { placeholderPages: placeholder, missingUpdated, missingVersion, duplicateParagraphBlocks: duplicateParagraphs };
  r.summary = 'Scans for placeholder content, update/version markers, and repeated copy.';
  r.score = r.errors.length
    ? Math.max(0, 100 - r.errors.length * 20 - r.warnings.length * 5)
    : Math.max(0, 100 - r.warnings.length * 2.5);
  r.critical = placeholder > 0;
  return r;
}

function runAiAudit(ctx) {
  const r = createAuditResult('ai-readiness');
  const entities = readJson(path.join(ROOT, 'data', 'graph', 'entity-index.json'), {});
  const rels = readJson(path.join(ROOT, 'data', 'graph', 'relationships.json'), []);
  const datasets = fs.readdirSync(path.join(ROOT, 'data', 'datasets')).filter((f) => f.endsWith('.json') && f !== 'resolved-ranges.json');
  const glossaryPages = fs.readdirSync(path.join(ROOT, 'glossary')).filter((f) => f.endsWith('.html') && f !== 'index.html').length;
  const formulaPages = fs.readdirSync(path.join(ROOT, 'formulas')).filter((f) => f.endsWith('.html') && f !== 'index.html').length;
  const referencePages = walkFiles(path.join(ROOT, 'reference'), (p) => p.endsWith('.html')).length;
  const schemaPages = ctx.pages.filter((p) => /"@context":"https:\/\/schema.org"|application\/ld\+json/.test(fs.readFileSync(p, 'utf8'))).length;
  const entityCount = Object.keys(entities).length;
  const relationDensity = entityCount ? Number((rels.length / entityCount).toFixed(2)) : 0;
  r.metrics = {
    entityCoverage: entityCount,
    datasetCoverage: datasets.length,
    relationshipDensity: relationDensity,
    schemaCoveragePages: schemaPages,
    glossaryCoverage: glossaryPages,
    formulaCoverage: formulaPages,
    referenceCoverage: referencePages,
  };
  if (entityCount < 80) r.errors.push('Entity coverage below expected baseline');
  if (datasets.length < 10) r.errors.push('Dataset coverage below expected baseline');
  if (relationDensity < 1.5) r.warnings.push('Relationship density below target for AI navigation');
  if (schemaPages < ctx.pages.length * 0.35) r.warnings.push('Schema coverage below 35% of pages');
  r.summary = 'Evaluates machine-readable readiness for entity-driven AI features.';
  r.recommendations.push('Increase schema coverage for long-tail pages and guides.');
  r.recommendations.push('Continue increasing entity links in calculators and resources.');
  r.score = Math.max(0, 100 - r.errors.length * 20 - r.warnings.length * 6);
  r.critical = r.errors.length > 0;
  return r;
}

function runIndexingIntelligenceAudit(ctx) {
  const r = createAuditResult('indexing-intelligence');
  const indexingDir = path.join(ROOT, 'data', 'indexing');
  const googleAuditDir = path.join(ROOT, 'audit', 'google');
  const priority = readJson(path.join(indexingDir, 'priority.json'), { records: [] });
  const rules = readJson(path.join(indexingDir, 'crawl-rules.json'), { rules: [] });
  const freshness = readJson(path.join(indexingDir, 'freshness.json'), { pages: [] });
  const weights = readJson(path.join(indexingDir, 'weights.json'), { edges: [] });
  const requiredReports = [
    'index.html',
    'priority-report.html',
    'weak-pages.html',
    'freshness.html',
    'crawl-depth.html',
    'authority-flow.html',
    'search-console-helper.html',
  ];

  const pages = priority.records || [];
  const hasPriority = pages.length;
  const avgPriority = hasPriority ? Number((pages.reduce((s, p) => s + (p.priority || 0), 0) / pages.length).toFixed(2)) : 0;
  const avgAuthority = (weights.edges || []).length
    ? Number(((weights.edges || []).reduce((s, e) => s + (e.weight || 0), 0) / (weights.edges || []).length).toFixed(2))
    : 0;
  const missingTiers = (rules.rules || []).filter((x) => !x.crawlTier).length;
  const freshCoverage = pages.length ? Number((((freshness.pages || []).length / pages.length) * 100).toFixed(2)) : 0;
  const hubCoverage = pages.filter((p) => p.hub).length;
  const weightedLinks = (weights.edges || []).length;

  requiredReports.forEach((f) => {
    if (!fs.existsSync(path.join(googleAuditDir, f))) r.errors.push(`Missing indexing report: audit/google/${f}`);
  });
  ['validation-list.csv', 'priority-pages.csv', 'weak-pages.csv', 'recently-updated.csv', 'crawl-review.md'].forEach((f) => {
    if (!fs.existsSync(path.join(googleAuditDir, f))) r.errors.push(`Missing Search Console companion file: audit/google/${f}`);
  });
  if (!hasPriority) r.errors.push('Priority coverage is empty');
  if (missingTiers > 0) r.errors.push(`Missing crawl tier assignments: ${missingTiers}`);
  if (freshCoverage < 95) r.errors.push(`Freshness coverage below 95%: ${freshCoverage}%`);
  if (hubCoverage < pages.length) r.errors.push(`Hub assignment incomplete: ${hubCoverage}/${pages.length}`);
  if (weightedLinks === 0) r.errors.push('Weighted link graph is empty');
  if (avgPriority < 30) r.warnings.push(`Average priority unexpectedly low: ${avgPriority}`);
  if (avgAuthority < 20) r.warnings.push(`Average authority unexpectedly low: ${avgAuthority}`);

  r.metrics = {
    priorityCoverage: pages.length,
    averagePriority: avgPriority,
    averageAuthority: avgAuthority,
    freshnessCoverage: freshCoverage,
    hubCoverage,
    weightedLinks,
    missingTiers,
  };
  r.summary = 'Evaluates crawl tiering, indexing priority, freshness, and Search Console readiness artifacts.';
  r.recommendations.push('Use weak-pages.csv to schedule contextual-link improvements.');
  r.recommendations.push('Validate top priority-pages.csv URLs first in Search Console.');
  r.score = Math.max(0, 100 - r.errors.length * 20 - r.warnings.length * 5);
  r.critical = r.errors.length > 0;
  return r;
}

const AUDIT_RUNNERS = {
  architecture: runArchitectureAudit,
  seo: runSeoAudit,
  performance: runPerformanceAudit,
  schema: runSchemaAudit,
  accessibility: runAccessibilityAudit,
  mobile: runMobileAudit,
  links: runLinksAudit,
  entities: runEntitiesAudit,
  datasets: runDatasetsAudit,
  calculators: runCalculatorsAudit,
  content: runContentAudit,
  'ai-readiness': runAiAudit,
  'indexing-intelligence': runIndexingIntelligenceAudit,
};

function runAuditByName(name, ctx) {
  const fn = AUDIT_RUNNERS[name];
  if (!fn) throw new Error(`Unknown audit: ${name}`);
  return fn(ctx);
}

function buildContext() {
  return {
    root: ROOT,
    pages: getAllPages(),
    versions: getVersionInfo(),
    timestamp: new Date().toISOString(),
  };
}

function runSingleAuditCli(name) {
  const ctx = buildContext();
  const result = runAuditByName(name, ctx);
  const out = {
    ...result,
    timestamp: ctx.timestamp,
    platformVersion: ctx.versions.platformVersion,
  };
  console.log(JSON.stringify(out, null, 2));
  if (result.critical) process.exit(1);
}

module.exports = {
  ROOT,
  esc,
  buildContext,
  runAuditByName,
  runSingleAuditCli,
};

