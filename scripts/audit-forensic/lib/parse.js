'use strict';
const { stripTags, wordCount, extractMain } = require('./util');

function attr(tag, name) {
  const m = tag && tag.match(new RegExp(name + '\\s*=\\s*"([^"]*)"', 'i'));
  return m ? m[1] : null;
}

function extractTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : null;
}

function extractMeta(html, name) {
  const re = new RegExp(`<meta[^>]+name=["']${name}["'][^>]*>`, 'i');
  const m = html.match(re);
  return m ? attr(m[0], 'content') : null;
}

function extractMetaProp(html, prop) {
  const re = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]*>`, 'i');
  const m = html.match(re);
  return m ? attr(m[0], 'content') : null;
}

function extractCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
  return m ? attr(m[0], 'href') : null;
}

function extractH1s(html) {
  const matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  return matches.map((m) => stripTags(m[1]).trim());
}

function extractHeadings(html) {
  const matches = [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)];
  return matches.map((m) => ({ level: Number(m[1]), text: stripTags(m[2]).trim() }));
}

function extractJsonLd(html) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const out = [];
  for (const b of blocks) {
    const raw = b[1].trim();
    let parsed = null;
    let error = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      error = e.message;
    }
    out.push({ raw, parsed, error });
  }
  return out;
}

function extractLinks(html) {
  const matches = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi)];
  return matches.map((m) => m[1]);
}

function extractImages(html) {
  const matches = [...html.matchAll(/<img\s+[^>]*>/gi)];
  return matches.map((m) => ({ tag: m[0], alt: attr(m[0], 'alt') }));
}

function bodyText(html) {
  const main = extractMain(html);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const source = main || (bodyMatch ? bodyMatch[1] : html);
  return stripTags(source);
}

function parsePage(relPath, html) {
  const h1s = extractH1s(html);
  const headings = extractHeadings(html);
  const jsonLd = extractJsonLd(html);
  const links = extractLinks(html);
  const images = extractImages(html);
  const text = bodyText(html);
  const robotsMeta = extractMeta(html, 'robots');
  const templatePlaceholders = [...new Set((html.match(/\{\{[A-Z0-9_]+\}\}/g) || []))];

  return {
    relPath,
    title: extractTitle(html),
    metaDescription: extractMeta(html, 'description'),
    canonical: extractCanonical(html),
    robotsMeta,
    ogTitle: extractMetaProp(html, 'og:title'),
    ogDescription: extractMetaProp(html, 'og:description'),
    lastUpdated: extractMeta(html, 'last-updated'),
    contentVersion: extractMeta(html, 'content-version'),
    h1s,
    headings,
    jsonLd,
    links,
    images,
    text,
    wordCount: wordCount(text),
    // Two legitimate visible-FAQ markup patterns coexist sitewide:
    // .faq-item (programmatic long-tail generator) and .paa-item (the
    // People Also Ask accordion used by charts/reference/guides pages,
    // <details class="paa-item">). Both are real, rendered <details>
    // content, not hidden schema -- recognize both (Phase 7H schema-audit
    // fix; previously only .faq-item was recognized, producing false
    // QUESTIONABLE FAQPage findings for every .paa-item page).
    hasFaqItem: /class="(faq-item|paa-item)"/.test(html),
    faqCount: (html.match(/class="(faq-item|paa-item)"/g) || []).length,
    hasQuickAnswer: /class="quick-answers?"/.test(html),
    hasKeyTakeaways: /class="(knowledge-takeaways|key-takeaways)"/.test(html),
    hasSourcesPanel: /class="(knowledge-sources|sources-panel|source-list)"/.test(html),
    hasTrustPanel: /class="trust-panel"/.test(html),
    hasTable: /<table[\s>]/.test(html),
    hasCalculatorForm: /class="[^"]*calculator[^"]*"/i.test(html) || /<form/i.test(html),
    templatePlaceholders,
    hasTemplateLeakage: templatePlaceholders.length > 0,
    rawLength: html.length,
  };
}

module.exports = { parsePage, attr };
