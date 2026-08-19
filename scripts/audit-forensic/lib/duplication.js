'use strict';
const { shingles, jaccard, sha1, normalizeForShingle } = require('./util');

function paragraphs(text) {
  // bodyText() collapses tags to a single space-joined string, so we
  // approximate "paragraphs" as sentence-like chunks split on sentence
  // boundaries, filtered to a minimum length to avoid nav/boilerplate noise.
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z(])/)
    .map((s) => s.trim())
    .filter((s) => s.split(' ').length >= 8);
}

function classifyRisk(score) {
  if (score >= 0.75) return 'CRITICAL';
  if (score >= 0.5) return 'HIGH';
  if (score >= 0.25) return 'MEDIUM';
  return 'LOW';
}

function analyzeFamily(familyName, pages) {
  const results = [];
  const paraIndex = new Map();

  for (const p of pages) {
    p._shingles = shingles(p.text, 6);
    p._paras = paragraphs(p.text);
    for (const para of p._paras) {
      const key = sha1(normalizeForShingle(para));
      if (!paraIndex.has(key)) paraIndex.set(key, []);
      paraIndex.get(key).push(p.relPath);
    }
  }

  const repeatedParaKeys = [...paraIndex.entries()].filter(([, list]) => list.length > 1);
  const headingIndex = new Map();
  for (const p of pages) {
    for (const h of p.headings) {
      const key = h.text.toLowerCase().trim();
      if (!key) continue;
      if (!headingIndex.has(key)) headingIndex.set(key, []);
      headingIndex.get(key).push(p.relPath);
    }
  }
  const repeatedHeadings = [...headingIndex.entries()].filter(([, list]) => list.length > 1);

  const faqIndex = new Map();
  for (const p of pages) {
    for (const ld of p.jsonLd) {
      if (ld.parsed && ld.parsed['@type'] === 'FAQPage' && Array.isArray(ld.parsed.mainEntity)) {
        for (const q of ld.parsed.mainEntity) {
          const key = (q.name || '').toLowerCase().trim();
          if (!key) continue;
          if (!faqIndex.has(key)) faqIndex.set(key, []);
          faqIndex.get(key).push(p.relPath);
        }
      }
    }
  }
  const repeatedFaqs = [...faqIndex.entries()].filter(([, list]) => list.length > 1);

  const tableIndex = new Map();
  for (const p of pages) {
    const tables = [...(p._rawHtml || '').matchAll(/<table[\s\S]*?<\/table>/gi)];
    for (const t of tables) {
      const norm = normalizeForShingle(t[0].replace(/<[^>]+>/g, ' '));
      if (norm.length < 30) continue;
      const key = sha1(norm);
      if (!tableIndex.has(key)) tableIndex.set(key, []);
      tableIndex.get(key).push(p.relPath);
    }
  }
  const repeatedTables = [...tableIndex.entries()].filter(([, list]) => list.length > 1);

  const pairwise = [];
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      const a = pages[i];
      const b = pages[j];
      const sim = jaccard(a._shingles, b._shingles);
      if (sim > 0.15) {
        pairwise.push({
          family: familyName,
          page_a: a.relPath,
          page_b: b.relPath,
          jaccard_similarity: Number(sim.toFixed(3)),
          risk: classifyRisk(sim),
        });
      }
    }
  }
  pairwise.sort((a, b) => b.jaccard_similarity - a.jaccard_similarity);

  const avgSim = pairwise.length
    ? pairwise.reduce((s, r) => s + r.jaccard_similarity, 0) / pairwise.length
    : 0;

  return {
    family: familyName,
    page_count: pages.length,
    pairwise_high_similarity_count: pairwise.filter((r) => r.risk === 'HIGH' || r.risk === 'CRITICAL').length,
    avg_pairwise_similarity: Number(avgSim.toFixed(3)),
    repeated_paragraph_count: repeatedParaKeys.length,
    repeated_heading_count: repeatedHeadings.length,
    repeated_faq_count: repeatedFaqs.length,
    repeated_table_count: repeatedTables.length,
    risk: classifyRisk(avgSim),
    pairwise,
    repeatedParaKeys,
    repeatedHeadings,
    repeatedFaqs,
    repeatedTables,
  };
}

module.exports = { analyzeFamily, classifyRisk, paragraphs };
