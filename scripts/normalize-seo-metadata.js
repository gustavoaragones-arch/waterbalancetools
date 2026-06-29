#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'assets', 'templates', 'partials']);

function walkHtml(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walkHtml(full, out);
      continue;
    }
    if (e.isFile() && e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function stripTags(s) {
  return String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function toCanonical(relPath) {
  const clean = relPath.replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '');
  if (!clean || clean === '') return 'https://waterbalancetools.com/';
  return `https://waterbalancetools.com/${clean.replace(/^\/+/, '')}`;
}

function ensureMeta(html, pattern, snippet) {
  if (pattern.test(html)) return html;
  return html.replace(/<\/head>/i, `  ${snippet}\n</head>`);
}

function normalizeHtmlOpenTag(html) {
  return html.replace(/<html(?![^>]*\blang=)([^>]*)>/i, '<html lang="en"$1>');
}

function ensureSingleH1(html, fallbackTitle) {
  const h1s = html.match(/<h1\b[^>]*>/gi) || [];
  if (h1s.length > 0) return html;
  const hiddenH1 = `\n  <h1 class="sr-only">${fallbackTitle}</h1>\n`;
  if (/<main\b/i.test(html)) return html.replace(/<main\b([^>]*)>/i, `<main$1>${hiddenH1}`);
  if (/<body[^>]*>/i.test(html)) return html.replace(/<body[^>]*>/i, (m) => `${m}${hiddenH1}`);
  return html;
}

function run() {
  const files = walkHtml(ROOT);
  const finalTitles = new Map();

  let updated = 0;

  files.forEach((p) => {
    const rel = path.relative(ROOT, p).replace(/\\/g, '/');
    let html = fs.readFileSync(p, 'utf8');
    const before = html;

    html = normalizeHtmlOpenTag(html);

    // Title derivation
    const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
    let title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
    title = stripTags(title);
    const h1Text = stripTags(h1);
    if (!title) title = h1Text || path.basename(rel, '.html').replace(/-/g, ' ');
    if (!/\|\s*WaterBalanceTools$/i.test(title)) title = `${title} | WaterBalanceTools`;

    // Make duplicate titles unique via path qualifier and basename fallback.
    const baseTitle = title;
    const existingForTitle = finalTitles.get(baseTitle) || [];
    if (existingForTitle.length > 0) {
      const section = rel.split('/')[0] || 'site';
      title = `${stripTags(baseTitle.replace(/\s*\|\s*WaterBalanceTools$/i, ''))} (${section}) | WaterBalanceTools`;
      const existingForSectionTitle = finalTitles.get(title) || [];
      if (existingForSectionTitle.length > 0) {
        const leaf = path.basename(rel, '.html').replace(/index$/i, rel.split('/').slice(-2, -1)[0] || 'page');
        title = `${stripTags(baseTitle.replace(/\s*\|\s*WaterBalanceTools$/i, ''))} (${section}/${leaf}) | WaterBalanceTools`;
      }
    }
    finalTitles.set(title, [...(finalTitles.get(title) || []), rel]);

    if (/<title>[\s\S]*?<\/title>/i.test(html)) {
      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
    } else {
      html = html.replace(/<\/head>/i, `  <title>${title}</title>\n</head>`);
    }

    // Description
    let desc = (html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1];
    if (!desc || desc.toLowerCase() === 'undefined' || desc.toLowerCase() === 'null') {
      const p1 = (html.match(/<p[^>]*>([\s\S]*?)<\/p>/i) || [])[1];
      desc = stripTags(p1).slice(0, 155);
      if (!desc) desc = `${stripTags(title.replace(/\s*\|\s*WaterBalanceTools$/i, ''))}.`;
    }
    desc = desc.trim();
    if (desc.length > 160) desc = desc.slice(0, 157) + '...';

    if (/<meta\s+name="description"\s+content="[^"]*"/i.test(html)) {
      html = html.replace(/<meta\s+name="description"\s+content="[^"]*"/i, `<meta name="description" content="${desc}"`);
    } else {
      html = html.replace(/<\/head>/i, `  <meta name="description" content="${desc}">\n</head>`);
    }

    // Required SEO/meta blocks
    html = ensureMeta(html, /<meta[^>]+name="viewport"/i, '<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    html = ensureMeta(html, /<meta[^>]+name="robots"/i, '<meta name="robots" content="index, follow">');
    html = ensureMeta(html, /<link[^>]+rel="canonical"/i, `<link rel="canonical" href="${toCanonical(rel)}">`);
    html = ensureMeta(html, /<meta[^>]+property="og:title"/i, `<meta property="og:title" content="${title}">`);
    html = ensureMeta(html, /<meta[^>]+property="og:description"/i, `<meta property="og:description" content="${desc}">`);
    html = ensureMeta(html, /<meta[^>]+name="twitter:card"/i, '<meta name="twitter:card" content="summary_large_image">');
    html = ensureMeta(html, /<meta[^>]+name="twitter:title"/i, `<meta name="twitter:title" content="${title}">`);
    html = ensureMeta(html, /<meta[^>]+name="twitter:description"/i, `<meta name="twitter:description" content="${desc}">`);
    html = ensureMeta(html, /<meta[^>]+name="last-updated"/i, '<meta name="last-updated" content="2026-06-29">');
    html = ensureMeta(html, /<meta[^>]+name="content-version"/i, '<meta name="content-version" content="v5B.6">');

    html = ensureSingleH1(html, stripTags(title.replace(/\s*\|\s*WaterBalanceTools$/i, '')));

    if (html !== before) {
      fs.writeFileSync(p, html, 'utf8');
      updated++;
    }
  });

  console.log(`normalize-seo-metadata: updated ${updated} page(s)`);
}

run();

