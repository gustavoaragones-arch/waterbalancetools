'use strict';

function normalize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function auditPageSchema(page) {
  const findings = [];
  const typeCounts = new Map();
  for (const ld of page.jsonLd) {
    const type = ld.parsed && ld.parsed['@type'] ? ld.parsed['@type'] : 'INVALID_JSON';
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
  }

  for (const ld of page.jsonLd) {
    if (!ld.parsed) {
      findings.push({ type: 'INVALID_JSON', status: 'REQUIRES_REVIEW', detail: `JSON-LD block failed to parse: ${ld.error}` });
      continue;
    }
    const obj = ld.parsed;
    const type = obj['@type'] || 'UNKNOWN';
    const isDup = typeCounts.get(type) > 1;
    let status = 'VALID';
    const details = [];

    const rawStr = JSON.stringify(obj);
    if (/\{\{[A-Z0-9_]+\}\}/.test(rawStr)) {
      status = 'MISREPRESENTED';
      details.push('Contains an unreplaced {{TEMPLATE_TOKEN}} instead of real content.');
    }

    if (isDup) {
      details.push(`Type "${type}" appears ${typeCounts.get(type)} times on this page.`);
      if (status === 'VALID') status = 'DUPLICATE';
    }

    if (type === 'DefinedTerm' || type === 'Article' || type === 'WebPage') {
      const name = obj.name || '';
      const h1 = page.h1s[0] || '';
      if (h1 && name && normalize(name) !== normalize(h1) && !/\{\{/.test(name)) {
        details.push(`schema name "${name}" does not match H1 "${h1}".`);
        if (status === 'VALID') status = 'QUESTIONABLE';
      }
      if (obj.url && page.canonical && obj.url.replace(/\/$/, '') !== page.canonical.replace(/\/$/, '')) {
        details.push(`schema url "${obj.url}" does not match canonical "${page.canonical}".`);
        if (status === 'VALID') status = 'QUESTIONABLE';
      }
    }

    if (type === 'FAQPage') {
      const qCount = Array.isArray(obj.mainEntity) ? obj.mainEntity.length : 0;
      if (qCount > 0 && page.faqCount === 0) {
        details.push(`FAQPage schema declares ${qCount} question(s) but no visible .faq-item elements found -- possible visible/schema mismatch.`);
        status = 'QUESTIONABLE';
      }
    }

    if (type === 'BreadcrumbList') {
      const items = Array.isArray(obj.itemListElement) ? obj.itemListElement : [];
      const last = items[items.length - 1];
      const h1 = page.h1s[0] || '';
      if (last && last.name && h1 && normalize(last.name) !== normalize(h1)) {
        details.push(`Breadcrumb last item "${last.name}" does not match H1 "${h1}".`);
        if (status === 'VALID') status = 'QUESTIONABLE';
      }
    }

    if (type === 'WebApplication') {
      if (!obj.name || !obj.applicationCategory) {
        details.push('WebApplication missing name or applicationCategory.');
        status = 'REQUIRES_REVIEW';
      }
    }

    findings.push({ type, status, detail: details.join(' ') || 'No issues detected against structural checks performed.' });
  }

  return findings;
}

module.exports = { auditPageSchema };
