'use strict';
/*
 * Deterministic, evidence-tagged heuristic rubric used across the ~500-page
 * inventory. Every score cites the measured signal(s) it was derived from,
 * per the Phase 7A requirement that scores not be arbitrary. This is a
 * mechanical proxy for human judgment at this scale, not a substitute for
 * it -- see "Audit Limitations" in the master report.
 */

function clamp03(n) { return Math.max(0, Math.min(3, n)); }

function originality(page, maxSim, simPeer) {
  let score;
  if (maxSim === null) score = 3;
  else if (maxSim < 0.25) score = 3;
  else if (maxSim < 0.5) score = 2;
  else if (maxSim < 0.75) score = 1;
  else score = 0;
  const evidence = maxSim === null
    ? 'Page has no sibling pages in its cluster family for comparison.'
    : `Max 6-word-shingle Jaccard similarity to sibling page "${simPeer}" in cluster "${page.cluster}" is ${maxSim.toFixed(2)}.`;
  return { score, evidence };
}

function usefulness(page) {
  const signals = [];
  if (page.calculator_present) signals.push('calculator/form present');
  if (page.table_present) signals.push('table present');
  if (page.faq_count > 0) signals.push(`${page.faq_count} FAQ items`);
  if (page.quick_answer_present) signals.push('quick-answer block present');
  const wc = page.word_count;
  let score = 0;
  if (signals.length >= 2 && wc >= 150) score = 3;
  else if (signals.length >= 1 && wc >= 100) score = 2;
  else if (wc >= 50) score = 1;
  else score = 0;
  const evidence = `word_count=${wc}; task-support signals=[${signals.join(', ') || 'none'}].`;
  return { score, evidence };
}

function completeness(page) {
  const wc = page.word_count;
  const hc = page.heading_count;
  let score;
  if (wc >= 400 && hc >= 4) score = 3;
  else if (wc >= 200 && hc >= 2) score = 2;
  else if (wc >= 80) score = 1;
  else score = 0;
  return { score, evidence: `word_count=${wc}, heading_count=${hc}.` };
}

function specificity(page, numericClaimCount) {
  let score;
  if (numericClaimCount >= 3) score = 3;
  else if (numericClaimCount >= 1) score = 2;
  else if (page.table_present) score = 1;
  else score = 0;
  return { score, evidence: `${numericClaimCount} sentence(s) with numeric ranges/units detected on page.` };
}

function accuracyRisk(page, claimCount, siteHasExternalSources) {
  // Score = confidence that a claim is verifiable/traceable on this page (3=low risk, 0=high risk).
  let score;
  let evidence;
  if (claimCount === 0) {
    score = 3;
    evidence = 'No chemistry claims with numeric ranges detected on this page.';
  } else if (siteHasExternalSources) {
    score = 2;
    evidence = `${claimCount} chemistry claim(s) detected; external sources exist sitewide.`;
  } else {
    score = 1;
    evidence = `${claimCount} chemistry claim(s) detected; page (and the site overall) cites zero external authoritative sources, so claims are unverifiable by a reader. See source-audit.csv.`;
  }
  return { score, evidence };
}

function repetition(page, repeatedBlockCount) {
  let score;
  if (repeatedBlockCount === 0) score = 3;
  else if (repeatedBlockCount <= 2) score = 2;
  else if (repeatedBlockCount <= 5) score = 1;
  else score = 0;
  return { score, evidence: `Page participates in ${repeatedBlockCount} exact repeated paragraph/heading/FAQ block(s) shared with sibling pages.` };
}

function intentMatch(page) {
  let score;
  const mdLen = (page.meta_description || '').length;
  if (page.template_leakage) {
    score = 0;
    return { score, evidence: `Unreplaced template token(s) found: ${page.template_leakage_tokens}. Title/H1/schema may not reflect real page intent.` };
  }
  if (mdLen >= 50 && mdLen <= 160 && page.h1_count === 1) score = 3;
  else if (page.meta_description && page.h1_count >= 1) score = 2;
  else if (page.h1_count >= 1) score = 1;
  else score = 0;
  return { score, evidence: `meta_description length=${mdLen} chars, h1_count=${page.h1_count}.` };
}

function taskCompletion(page) {
  if (page.page_type === 'calculator' || page.page_type === 'calculator-hub') {
    const score = page.calculator_present ? 3 : 0;
    return { score, evidence: `calculator_present=${page.calculator_present} for a calculator-type page.` };
  }
  return usefulness(page);
}

function aeoAnswerQuality(page) {
  let score = 0;
  const signals = [];
  if (page.quick_answer_present) { score += 1; signals.push('quick-answer block'); }
  if (page.faq_count > 0) { score += 1; signals.push(`${page.faq_count} FAQ item(s)`); }
  if (page.h1_count === 1 && page.word_count >= 80) { score += 1; signals.push('single clear H1 with sufficient body text'); }
  score = clamp03(score);
  return { score, evidence: signals.length ? signals.join('; ') : 'No answer-first structural signals detected.' };
}

function trustSignals(page) {
  let score = 0;
  const signals = [];
  if (page.last_updated_present) { score += 1; signals.push('last-updated date present'); }
  if (page.source_links_present) { signals.push('has "knowledge-sources"/"sources" block (site-wide check: contains no external citations, only a review date -- see source-audit.csv)'); }
  if (page.author_present) { score += 1; signals.push('named author/reviewer present'); }
  else { signals.push('no named author or reviewer anywhere on page (sitewide pattern)'); }
  if (page.external_authority_link_count > 0) { score += 1; signals.push(`${page.external_authority_link_count} external authority link(s)`); }
  score = clamp03(score);
  return { score, evidence: signals.join('; ') };
}

module.exports = {
  originality, usefulness, completeness, specificity, accuracyRisk,
  repetition, intentMatch, taskCompletion, aeoAnswerQuality, trustSignals,
};
