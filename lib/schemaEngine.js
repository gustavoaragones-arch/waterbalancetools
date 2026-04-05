/**
 * WaterBalanceTools — Centralized Structured Data Engine
 * Generates JSON-LD for WebApplication, FAQPage, BreadcrumbList, HowTo.
 * Each schema type is rendered at most once per page (no duplicates).
 * Works in Node (for static generators) and browser (for inline injection).
 */
(function (global, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    global.WaterBalanceSchema = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var BASE_URL = 'https://waterbalancetools.com';

  /**
   * WebApplication schema for calculator/tool pages
   */
  function generateWebApplicationSchema(opts) {
    var name = opts.name || 'Water Balance Calculator';
    var description = opts.description || '';
    var url = opts.url || BASE_URL;
    return {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: name,
      url: url,
      applicationCategory: 'CalculatorApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      description: description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    };
  }

  /**
   * FAQPage schema — single source for FAQ structured data (prevents duplicate FAQPage)
   */
  function generateFAQSchema(faqs) {
    if (!faqs || faqs.length === 0) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(function (faq) {
        var q = typeof faq === 'object' ? faq.question : faq.q;
        var a = typeof faq === 'object' ? faq.answer : faq.a;
        return {
          '@type': 'Question',
          name: q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: a
          }
        };
      })
    };
  }

  /**
   * BreadcrumbList schema
   */
  function generateBreadcrumbSchema(breadcrumbs) {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map(function (crumb, index) {
        var name = typeof crumb === 'object' ? crumb.name : crumb;
        var url = typeof crumb === 'object' ? crumb.url : (index === 0 ? BASE_URL + '/' : BASE_URL + '/' + crumb);
        return {
          '@type': 'ListItem',
          position: index + 1,
          name: name,
          item: url.indexOf('http') === 0 ? url : BASE_URL + (url.charAt(0) === '/' ? '' : '/') + url
        };
      })
    };
  }

  /**
   * HowTo schema
   */
  function generateHowToSchema(title, steps) {
    if (!title || !steps || steps.length === 0) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: title,
      step: steps.map(function (step) {
        return {
          '@type': 'HowToStep',
          text: typeof step === 'object' && step.text != null ? step.text : step
        };
      })
    };
  }

  /**
   * Organization schema (global, render once on homepage or layout)
   */
  function generateOrganizationSchema(opts) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: (opts && opts.name) || 'Water Balance Tools',
      url: (opts && opts.url) || BASE_URL
    };
  }

  /**
   * Renders a single schema object as a script tag string.
   * Returns empty string if schema is null/undefined.
   */
  function renderSchemaScript(schema) {
    if (!schema) return '';
    return '<script type="application/ld+json">' + JSON.stringify(schema) + '</script>';
  }

  /**
   * Renders all page schemas exactly once each. No duplicates.
   * Pass an object: { webApplication, faq, breadcrumb, howTo }
   * Each key can be the schema object or the arguments to generate (see below).
   * Returns concatenated script tags for injection into <head>.
   * Prefer calling this at build time (Node generators) so JSON-LD is in raw HTML;
   * avoid browser-only injection for Google indexing.
   */
  function renderAllSchemas(schemas) {
    if (!schemas) return '';
    var out = '';
    if (schemas.webApplication) {
      var wa = schemas.webApplication;
      out += renderSchemaScript(typeof wa === 'object' && wa['@type'] ? wa : generateWebApplicationSchema(wa));
    }
    if (schemas.faq) {
      var faq = schemas.faq;
      var faqSchema = Array.isArray(faq) ? generateFAQSchema(faq) : (faq && faq['@type'] === 'FAQPage' ? faq : generateFAQSchema(faq.items || []));
      if (faqSchema) out += renderSchemaScript(faqSchema);
    }
    if (schemas.breadcrumb) {
      var bc = schemas.breadcrumb;
      var bcSchema = Array.isArray(bc) ? generateBreadcrumbSchema(bc) : (bc && bc['@type'] === 'BreadcrumbList' ? bc : generateBreadcrumbSchema(bc.items || []));
      if (bcSchema) out += renderSchemaScript(bcSchema);
    }
    if (schemas.howTo) {
      var ht = schemas.howTo;
      var howToSchema = ht && ht['@type'] === 'HowTo' ? ht : (ht && ht.title && ht.steps ? generateHowToSchema(ht.title, ht.steps) : null);
      if (howToSchema) out += renderSchemaScript(howToSchema);
    }
    return out;
  }

  return {
    BASE_URL: BASE_URL,
    generateWebApplicationSchema: generateWebApplicationSchema,
    generateFAQSchema: generateFAQSchema,
    generateBreadcrumbSchema: generateBreadcrumbSchema,
    generateHowToSchema: generateHowToSchema,
    generateOrganizationSchema: generateOrganizationSchema,
    renderSchemaScript: renderSchemaScript,
    renderAllSchemas: renderAllSchemas
  };
});
