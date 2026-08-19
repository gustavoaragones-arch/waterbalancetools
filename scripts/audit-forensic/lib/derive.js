'use strict';

const AUTHORITY_RE = /(\.gov\/|\.gov$|\.edu\/|\.edu$|who\.int|cdc\.gov|epa\.gov|nsf\.org|cpsc\.gov)/i;

function schemaTypesOf(page) {
  const types = [];
  for (const ld of page.jsonLd) {
    if (ld.parsed && ld.parsed['@type']) {
      types.push(ld.parsed['@type']);
    } else if (!ld.parsed) {
      types.push('INVALID_JSON');
    }
  }
  return types;
}

function primaryCta(html) {
  const m = html.match(/<a[^>]+class="[^"]*(cta|entity-panel-cta|calculator-cta)[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
  if (m) return m[2].replace(/<[^>]+>/g, '').trim();
  if (/class="[^"]*calculator[^"]*"/i.test(html)) return 'calculator interaction';
  return 'none detected';
}

function indexability(page) {
  if (page.robotsMeta && /noindex/i.test(page.robotsMeta)) return 'NOINDEX';
  if (page.page_type === 'error') return 'NOINDEX (error page)';
  if (page.page_type === 'template-source' || page.page_type === 'partial-include' || page.page_type === 'component-include') {
    return 'NON_PAGE';
  }
  return 'INDEXABLE';
}

function deriveRecord(page, ctx) {
  const {
    sitemapUrls, redirectSrcSet, inbound, outboundCount, externalLinksByPage, depth,
  } = ctx;

  const schemaTypes = schemaTypesOf(page);
  const outUrlNoSlash = page.url.replace(/\/$/, '') || page.url;
  const sitemapPresence = sitemapUrls.has(page.url) || sitemapUrls.has(outUrlNoSlash) || sitemapUrls.has(page.url + '/');
  const selfPath = '/' + page.relPath.replace(/index\.html$/, '').replace(/\.html$/, '');
  const redirectStatus = redirectSrcSet.has(selfPath.replace(/\/$/, '')) ? 'HAS_LEGACY_REDIRECT_SOURCE_COLLISION' : 'none';

  const externalAuthorityLinks = (page.links || []).filter((h) => AUTHORITY_RE.test(h)).length;

  const canonicalSelfMatch = page.canonical
    ? page.canonical.replace(/\/$/, '') === page.url.replace(/\/$/, '')
    : false;

  return {
    url: page.url,
    file_path: page.relPath,
    page_type: page.page_type,
    cluster: page.cluster,
    silo: page.silo,
    generator: page.generator,
    title: page.title || '',
    h1: page.h1s[0] || '',
    h1_count: page.h1s.length,
    meta_description: page.metaDescription || '',
    canonical: page.canonical || '',
    canonical_self_match: canonicalSelfMatch,
    robots: page.robotsMeta || '(none)',
    word_count: page.wordCount,
    visible_text_count: page.wordCount,
    heading_count: page.headings.length,
    internal_link_count: outboundCount.get(page.relPath) || 0,
    external_link_count: externalLinksByPage.get(page.relPath) || 0,
    incoming_internal_links: (inbound.get(page.relPath) || new Set()).size,
    outgoing_internal_links: outboundCount.get(page.relPath) || 0,
    crawl_depth: depth.has(page.relPath) ? depth.get(page.relPath) : null,
    schema_types: schemaTypes.join(';'),
    schema_count: schemaTypes.length,
    faq_count: page.faqCount,
    quick_answer_present: page.hasQuickAnswer,
    key_takeaways_present: page.hasKeyTakeaways,
    last_updated_present: !!page.lastUpdated,
    last_updated_value: page.lastUpdated || '',
    author_present: false,
    source_links_present: page.hasSourcesPanel,
    external_authority_link_count: externalAuthorityLinks,
    calculator_present: page.hasCalculatorForm,
    table_present: page.hasTable,
    primary_cta: primaryCta(page._rawHtml),
    indexability: indexability(page),
    sitemap_presence: sitemapPresence,
    redirect_status_if_known: redirectStatus,
    template_leakage: page.hasTemplateLeakage,
    template_leakage_tokens: page.templatePlaceholders.join(';'),
  };
}

module.exports = { deriveRecord, schemaTypesOf, AUTHORITY_RE };
