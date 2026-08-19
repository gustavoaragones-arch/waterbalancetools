'use strict';
/**
 * extract-claims-v2.js (Phase 7D.1)
 *
 * Corrected chemistry-claim extraction: proximity-based parameter
 * attribution instead of whole-sentence first-match-wins keyword search.
 *
 * Conceptual layering (Phase 7D.1 Step 16), kept as distinct fields rather
 * than collapsed into one status:
 *   RAW_TEXT -> CLAUSES -> NUMERIC_OCCURRENCES -> SEMANTIC_PARAMETER
 *   -> VALUE_TYPE/UNIT -> CONTEXT -> CLAIM_TYPE -> extraction_status
 *   (scientific_review_status is assigned later, by reconcile-claims-v2.js,
 *   never by this module -- extraction correctness and scientific
 *   correctness are independent dimensions, see Step 15.)
 */

const { ALIAS_INDEX, PARAMETERS } = require('../data/chemistry-knowledge');

// Unit -> plausible value_type. Used both to classify a numeric occurrence
// and to reject impossible parameter/unit pairings (Step 17).
const UNIT_VALUE_TYPE = {
  'ppm': 'concentration', 'mg/l': 'concentration', '%': 'concentration',
  '°f': 'temperature', '°c': 'temperature', 'f': 'temperature', 'c': 'temperature',
  'gal': 'volume', 'gallons': 'volume', 'gallon': 'volume', 'l': 'volume', 'liters': 'volume', 'litres': 'volume',
  'oz': 'mass_or_dosage', 'ounce': 'mass_or_dosage', 'ounces': 'mass_or_dosage',
  'lb': 'mass_or_dosage', 'lbs': 'mass_or_dosage', 'pound': 'mass_or_dosage', 'pounds': 'mass_or_dosage',
  // Phase 7D.2 (Step 9/17): time-duration units. Not allowed by any parameter
  // in PARAMETER_VALUE_TYPES, so a duration-typed number near a parameter
  // mention is always correctly rejected as IMPOSSIBLE_MAPPING/unattributed
  // rather than falling through to the blind 0-14-range "looks like pH"
  // heuristic (found via independent audit of real "wait N hours" /
  // "allow N hours before retesting" sentences -- see
  // reports/phase-7d-2/PHASE-7D-2-INDEPENDENT-VALIDATION.md).
  'hour': 'duration', 'hours': 'duration', 'hr': 'duration', 'hrs': 'duration',
  'minute': 'duration', 'minutes': 'duration', 'min': 'duration', 'mins': 'duration',
  'day': 'duration', 'days': 'duration',
};

// Which value_types are physically possible for each parameter. A pairing
// not in this table is an IMPOSSIBLE_MAPPING (Step 17 / Step 3-5).
const PARAMETER_VALUE_TYPES = {
  ph: ['ph_value'],
  free_chlorine: ['concentration'],
  combined_chlorine: ['concentration'],
  total_chlorine: ['concentration'],
  total_alkalinity: ['concentration'],
  calcium_hardness: ['concentration'],
  cyanuric_acid: ['concentration'],
  salt: ['concentration'],
  bromine: ['concentration'],
  water_temperature: ['temperature'],
  chlorine_demand: ['concentration'],
  shock_treatment: ['concentration', 'multiplier'],
  sanitizer: ['concentration'],
  oxidation: [],
  algae: [],
  pool_volume: ['volume'],
  chemical_dosage: ['mass_or_dosage'],
  lsi: ['index_value'],
};

// A small set of non-chemistry-parameter "pseudo parameters" the extractor
// must be able to name explicitly (Step 10), rather than forcing every
// number into one of the 15 real chemistry parameters.
const NON_CHEMISTRY_TERMS = {
  'pool volume': 'pool_volume', 'gallons': 'pool_volume', 'spa volume': 'pool_volume',
  'lsi': 'lsi', 'saturation index': 'lsi', 'langelier': 'lsi',
};

const CLAUSE_SPLIT_RE = /[,;]|(?<=[.!?])\s+|\band\b|\bwhich\b|\bwhile\b/i;

// number, optional range, optional unit -- captures enough to recover the
// unit token even when it trails the second number in a range. Bare F/C
// (no degree symbol) is accepted as a temperature unit because some
// extracted page text loses the ° glyph -- matches Phase 7A's original
// UNIT_RE convention.
// Phase 7D.2 (Step 15/17) fix: the comma-grouped alternative previously
// allowed ZERO comma groups (`*`), so for a comma-less 4+ digit number like
// "18000" or "3200", JS regex alternation picked this alternative's
// degenerate match of just the first 1-3 digits ("180"/"320") instead of
// trying the second, longer-matching plain-digit alternative -- silently
// truncating real values (e.g. salt "3200 ppm" parsed as "320" + a stray
// "0"). Requiring at least one comma group (`+`) makes this alternative
// match ONLY genuinely comma-separated numbers ("10,000"), so a comma-less
// number always falls through to the plain `\d+` alternative and is
// captured in full. Found via independent golden-set-v2 authoring -- see
// reports/phase-7d-2/PHASE-7D-2-INDEPENDENT-VALIDATION.md.
const NUM = '-?\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|-?\\d+(?:\\.\\d+)?';
const NUMERIC_RE = new RegExp(
  `(${NUM})\\s*(?:[-–to]{1,4}\\s*(${NUM}))?\\s*(°f|°c|ppm|mg\\/l|%|gal(?:lons?)?|lbs?|pounds?|oz|ounces?|hours?|hrs?|minutes?|mins?|days?|f\\b|c\\b)?`,
  'gi'
);
function parseNum(s) { return Number(String(s).replace(/,/g, '')); }

// Protect thousands-separator commas (10,000) from clause splitting by
// temporarily replacing them with a space, splitting, then restoring.
const THOUSANDS_COMMA_RE = /(\d),(\d{3})/g;
function protectThousands(text) {
  let prev;
  let out = text;
  do { prev = out; out = out.replace(THOUSANDS_COMMA_RE, '$1 $2'); } while (out !== prev);
  return out;
}
function restoreThousands(text) {
  return text.replace(/(\d) (\d{3})/g, '$1,$2');
}

// Non-chemistry noise that must never be treated as a numeric chemistry
// occurrence: HTML entity codes (&#127919;), ISO dates (2026-06-01), and
// "N min read" reading-time UI chrome that leaks into extracted page text.
const HTML_ENTITY_RE = /&#\d+;|&[a-z]+;/gi;
// Bare date first (2026-06-01), then full ISO-8601 timestamps
// (2026-08-18T20:03:12.250Z) -- the bare-date pattern alone does not match
// a timestamp because \b fails at the digit-to-"T" transition (both are
// \w characters, so there is no word boundary there). Found via Phase
// 7D.3's dataset validator: an unstripped "buildDate 2026-08-18T20:03:12...Z"
// was being partially parsed as a numeric range "2026-8".
const ISO_DATE_RE = /\b\d{4}-\d{2}-\d{2}(?:T[\d:.,+Z-]+)?\b/g;
const READING_TIME_RE = /\b\d+\s*min\s*read\b/gi;

function stripNonChemistryNoise(text) {
  return text
    .replace(HTML_ENTITY_RE, ' ')
    .replace(ISO_DATE_RE, ' ')
    .replace(READING_TIME_RE, ' ');
}

// "between X and Y [unit]" is a single range, not two clauses -- normalize
// to "X-Y [unit]" before clause splitting so the later "and"-based clause
// split (needed for genuine composite sentences) doesn't sever a range's
// two ends onto opposite sides of a false clause boundary.
const BETWEEN_RANGE_RE = new RegExp(`\\bbetween\\s+(${NUM})\\s+and\\s+(${NUM})`, 'gi');
function normalizeBetweenRanges(text) {
  return text.replace(BETWEEN_RANGE_RE, (whole, a, b) => `${a}-${b}`);
}

function splitClauses(sentence) {
  const cleaned = normalizeBetweenRanges(stripNonChemistryNoise(sentence));
  const protectedText = protectThousands(cleaned);
  return protectedText.split(CLAUSE_SPLIT_RE)
    .map((c) => c && restoreThousands(c).trim())
    .filter((c) => c && c.length > 0);
}

// Longest-alias-first list, precomputed once.
const ALIASES_BY_LENGTH_DESC = Object.keys(ALIAS_INDEX)
  .filter((a) => a.length >= 2)
  .sort((a, b) => b.length - a.length);

/**
 * findAllParameterMentions(clauseLower) -> [{ parameterId, index }, ...]
 * every chemistry-parameter alias occurrence in the clause with its
 * character offset, so a numeric occurrence can be attributed to whichever
 * mention is nearest to it (proximity, not "first/longest alias found
 * anywhere in the whole clause").
 */
function findAllParameterMentions(clauseLower) {
  const mentions = [];
  const seenSpans = [];
  for (const alias of ALIASES_BY_LENGTH_DESC) {
    const re = new RegExp('\\b' + alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
    let m;
    while ((m = re.exec(clauseLower))) {
      const start = m.index; const end = start + alias.length;
      // Skip if this span is already covered by a longer alias match
      // (e.g. don't also record "ph" inside an already-matched "ph level").
      if (seenSpans.some(([s, e]) => start >= s && end <= e)) continue;
      seenSpans.push([start, end]);
      mentions.push({ parameterId: ALIAS_INDEX[alias], index: start });
    }
  }
  for (const [term, id] of Object.entries(NON_CHEMISTRY_TERMS)) {
    let idx = clauseLower.indexOf(term);
    while (idx !== -1) {
      mentions.push({ parameterId: id, index: idx });
      idx = clauseLower.indexOf(term, idx + term.length);
    }
  }
  return mentions;
}

function nearestParameter(mentions, numberIndex) {
  if (mentions.length === 0) return null;
  let best = null; let bestDist = Infinity;
  for (const men of mentions) {
    const dist = Math.abs(men.index - numberIndex);
    if (dist < bestDist) { bestDist = dist; best = men; }
  }
  return best ? best.parameterId : null;
}

function inferValueType(unitToken, numText, nearestParameterId) {
  if (unitToken) {
    const u = unitToken.toLowerCase();
    return UNIT_VALUE_TYPE[u] || 'unknown';
  }
  // No unit at all: infer from the nearest parameter rather than a blind
  // "0-14 with a decimal -> pH" guess, so an LSI value (also often a small
  // signed decimal) isn't mislabeled as a pH reading.
  const n = Number(numText);
  if (nearestParameterId === 'lsi' && !Number.isNaN(n)) return 'index_value';
  if (nearestParameterId === 'ph' && !Number.isNaN(n) && n >= 0 && n <= 14) return 'ph_value';
  if (!Number.isNaN(n) && n >= 0 && n <= 14 && /\.\d/.test(numText)) return 'ph_value';
  return 'unknown';
}

function isPlausiblePairing(parameterId, valueType) {
  if (!parameterId) return false;
  const allowed = PARAMETER_VALUE_TYPES[parameterId];
  if (!allowed) return false;
  return allowed.includes(valueType);
}

function detectClaimType(sentence) {
  const s = sentence.toLowerCase();
  if (/\b(calculate|calculated|result|based on your|enter your|this calculator)\b/.test(s)) return 'CALCULATED_VALUE';
  if (/\b(never mix|do not mix|hazard|danger|toxic|caution|unsafe|wait \d+|avoid swimming)\b/.test(s)) return 'SAFETY_GUIDANCE';
  if (/\b(for example|e\.g\.|example:|say your|suppose)\b/.test(s)) return 'EXAMPLE_INPUT';
  if (/\btypically|usually|generally|rule of thumb|often|approximately|roughly|as a guideline|tends to\b/.test(s)) return 'RULE_OF_THUMB';
  return 'RANGE';
}

function detectEnvironment(clauseLower, sentenceLower) {
  const hasHotTub = /\bhot[\s-]?tubs?\b|\bspas?\b/.test(clauseLower);
  const hasPool = /\bpools?\b/.test(clauseLower);
  if (hasHotTub && hasPool) return 'both';
  if (hasHotTub) return 'hot_tub';
  if (hasPool) return 'pool';
  // Do not fall back to whole-sentence/page-level inference -- unspecified
  // is preferred over a guess (Step 7).
  return 'unspecified';
}

/**
 * extractFromSentence(sentence) -> array of extraction records, one per
 * numeric occurrence successfully attributed to a clause. A sentence with
 * multiple clauses (composite sentence, Step 6) yields multiple
 * independent records, never one merged record.
 */
function extractFromSentence(sentence) {
  const claimType = detectClaimType(sentence);
  const clauses = splitClauses(sentence);
  const records = [];
  // Tracks the most recent explicit parameter mention (and environment),
  // updated from EVERY clause that mentions one -- even a clause with no
  // number of its own (e.g. "tested for pH ... targeting 7.2 to 7.6" splits
  // into a mention-only clause followed by a number-only clause) -- so a
  // later clause that continues the same subject without repeating its
  // name can still be attributed. Always marked with a lower-confidence
  // extraction_status rather than silently treated as explicit, and always
  // re-checked through isPlausiblePairing() so a carry-forward can never
  // silently produce an impossible parameter/unit combination.
  let lastParameterId = null;
  let lastEnvironment = 'unspecified';

  for (const clause of clauses) {
    const clauseLower = clause.toLowerCase();
    const mentions = findAllParameterMentions(clauseLower);
    const clauseEnvironment = detectEnvironment(clauseLower, sentence.toLowerCase());
    const numMatches = [...clause.matchAll(NUMERIC_RE)].filter((m) => m[0].trim().length > 0 && m[1] !== undefined);

    if (mentions.length > 0) lastParameterId = mentions[mentions.length - 1].parameterId;
    if (clauseEnvironment !== 'unspecified') lastEnvironment = clauseEnvironment;
    if (numMatches.length === 0) continue;

    for (const m of numMatches) {
      let lo = parseNum(m[1]);
      let hi = m[2] !== undefined ? parseNum(m[2]) : lo;
      // Normalize so minimum <= maximum always holds. The range group also
      // matches directional "from X to Y" phrasing (e.g. "adjust pH from
      // 7.8 to 7.4") and, more rarely, an arithmetic subtraction written as
      // "X - Y = Z" -- neither is a true target range, but swapping
      // preserves both original values losslessly rather than silently
      // dropping one, and keeps the dataset's minimum<=maximum invariant
      // intact without guessing which of the two numbers was "the" target.
      // Found via Phase 7D.3's dataset validator (Step 17, check 11).
      if (lo !== null && hi !== null && lo > hi) { const t = lo; lo = hi; hi = t; }
      const unitToken = m[3];
      // Attribute to the parameter mention nearest to THIS number's
      // position, not merely "a parameter mentioned somewhere in the
      // clause" -- this is what distinguishes "CYA of 60-80 ppm ... for
      // salt pool outdoor use" (nearest = cyanuric_acid, correct) from a
      // whole-clause keyword search (which would wrongly prefer "salt").
      const explicitParameterId = nearestParameter(mentions, m.index);
      const hintParameterId = explicitParameterId !== null ? explicitParameterId : lastParameterId;
      const valueType = inferValueType(unitToken, m[1], hintParameterId);
      let effectiveParameterId = explicitParameterId;
      let carried = false;
      if (effectiveParameterId === null && lastParameterId && isPlausiblePairing(lastParameterId, valueType)) {
        effectiveParameterId = lastParameterId;
        carried = true;
      }
      const plausible = isPlausiblePairing(effectiveParameterId, valueType);
      // Environment carries forward independently of whether the parameter
      // itself was explicit or carried -- "For pools, keep free chlorine
      // between 1 and 3 ppm" has an explicit parameter but an implicit
      // (preceding-clause) environment.
      const environment = clauseEnvironment !== 'unspecified' ? clauseEnvironment : lastEnvironment;

      records.push({
        clause,
        parameter_id: effectiveParameterId,
        minimum: lo, maximum: hi,
        unit: unitToken ? unitToken.toLowerCase() : (valueType === 'ph_value' ? 'ph_units' : ''),
        value_type: valueType,
        environment,
        claim_type: claimType,
        extraction_status: effectiveParameterId === null ? 'NO_PARAMETER_IN_CLAUSE'
          : !plausible ? 'IMPOSSIBLE_MAPPING'
          : carried ? 'CARRIED_CONTEXT'
          : 'CORRECT_EXTRACTION',
      });
    }
  }
  return records;
}

module.exports = {
  extractFromSentence, splitClauses, findAllParameterMentions, nearestParameter, inferValueType,
  isPlausiblePairing, detectClaimType, detectEnvironment, stripNonChemistryNoise,
  PARAMETER_VALUE_TYPES, UNIT_VALUE_TYPE, NON_CHEMISTRY_TERMS,
};
