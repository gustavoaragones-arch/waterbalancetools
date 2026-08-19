'use strict';

const TERMS = [
  'free chlorine', 'total chlorine', 'combined chlorine', 'chloramine',
  'ph level', 'ph', 'total alkalinity', 'alkalinity', 'calcium hardness',
  'cyanuric acid', 'cya', 'shock', 'salt', 'salt-water', 'saltwater',
  'chlorine generator', 'bromine', 'orp', 'lsi', 'saturation index',
  'algae', 'algaecide', 'cloudy water', 'swimmer load', 'sunlight',
  'stabilizer', 'chlorine demand', 'dosing', 'dose', 'ppm', 'rain',
  'temperature', 'hot tub', 'spa',
];

const UNIT_RE = /(\d+(?:\.\d+)?\s?[-–to]{1,3}\s?\d+(?:\.\d+)?\s?(ppm|mg\/l|°f|°c|f\b|c\b|%)|\d+(?:\.\d+)?\s?(ppm|mg\/l|°f|°c|%))/i;
const RULE_OF_THUMB_RE = /\b(typically|usually|generally|rule of thumb|often|approximately|roughly|as a guideline|tends to)\b/i;
const SAFETY_RE = /\b(never mix|do not mix|hazard|danger|toxic|caution|unsafe|safety|swimmer safety|wait \d+|avoid swimming)\b/i;
const CALCULATED_RE = /\b(calculate|calculated|result|based on your|enter your|this calculator)\b/i;

function splitSentences(text) {
  return text.split(/(?<=[.!?])\s+(?=[A-Z(])/).map((s) => s.trim()).filter(Boolean);
}

function classifyClaim(sentence) {
  if (CALCULATED_RE.test(sentence)) return 'CALCULATED_VALUE';
  if (SAFETY_RE.test(sentence)) return 'SAFETY_GUIDANCE';
  if (RULE_OF_THUMB_RE.test(sentence)) return 'RULE_OF_THUMB';
  if (UNIT_RE.test(sentence)) return 'RANGE';
  return 'EDITORIAL_SIMPLIFICATION';
}

function extractClaims(relPath, text, maxPerPage) {
  maxPerPage = maxPerPage || 12;
  const sentences = splitSentences(text);
  const claims = [];
  for (const s of sentences) {
    const lower = s.toLowerCase();
    const hasTerm = TERMS.some((t) => lower.includes(t));
    const hasUnit = UNIT_RE.test(s);
    if (!hasTerm && !hasUnit) continue;
    if (s.split(' ').length < 5) continue;
    const unitMatch = s.match(UNIT_RE);
    claims.push({
      url: relPath,
      claim: s.length > 300 ? s.slice(0, 300) + '…' : s,
      claim_type: classifyClaim(s),
      units: unitMatch ? unitMatch[0] : '',
      has_numeric_range: hasUnit,
      review_required: !hasUnit ? 'REQUIRES_EXPERT_REVIEW' : 'ROUTINE',
    });
    if (claims.length >= maxPerPage) break;
  }
  return claims;
}

module.exports = { extractClaims, TERMS, UNIT_RE };
