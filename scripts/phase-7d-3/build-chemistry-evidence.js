#!/usr/bin/env node
'use strict';
/**
 * build-chemistry-evidence.js (Phase 7D.3, Steps 1-11)
 *
 * Builds the canonical chemistry evidence dataset using ONLY the
 * Phase 7D.2-validated extractor (extract-claims-v2.js) and reconciliation
 * logic (reconcile-claims-v2.js's scientificReviewStatus, reused directly,
 * not reimplemented). No second extraction algorithm is introduced.
 *
 * Canonical dataset location: reports/phase-7d-3/chemistry-evidence.csv
 * (+ .json). The repository's top-level data/ directory is reserved for
 * generated site-CONTENT JSON consumed directly by the build pipeline
 * (data/academy.json, data/entities/, etc.) -- putting an audit/evidence
 * dataset there risks it being mistaken for site content or swept up by
 * unrelated generator/content scripts. reports/phase-7d-3/ matches the
 * established convention every other phase in this project already uses
 * for its canonical phase output, so the dataset lives there instead,
 * per the brief's own "if the repository has an established convention,
 * use it and document it" instruction. See CLAIM-ID-METHODOLOGY.md.
 *
 * DETERMINISM: nothing in this file reads the system clock, Math.random,
 * or any other non-deterministic input. Two runs against the same source
 * files always produce byte-identical output (verified in
 * reports/phase-7d-3/REBUILD-SUMMARY.json "reproducibility" section).
 *
 * PROVENANCE: source_registry_ids is always [] in this rebuild. No
 * explicit, human-curated mapping from an individual extracted numeric
 * occurrence to a specific chemistry-sources.js entry exists yet -- Step 6
 * explicitly forbids inferring one from topic/parameter/range overlap.
 * Establishing that mapping is future citation-implementation work
 * (Phase 7E), not this rebuild.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { extractFromSentence } = require('../phase-7d-1/extract-claims-v2');
const { scientificReviewStatus, parseCsv } = require('../phase-7d-1/reconcile-claims-v2');
const { PARAMETERS } = require('../data/chemistry-knowledge');

const ROOT = path.join(__dirname, '..', '..');
const IN_FILE = path.join(ROOT, 'reports', 'phase-7a', 'chemical-claims.csv');
const OUT_DIR = path.join(ROOT, 'reports', 'phase-7d-3');

const VALID_PARAMETER_IDS = new Set([...PARAMETERS.map((p) => p.id), 'pool_volume', 'lsi', 'chemical_dosage']);
const EXTRACTION_STATUSES_EVALUATED = new Set(['CORRECT_EXTRACTION', 'CARRIED_CONTEXT']);
const REVIEW_REQUIRED_SCIENTIFIC_STATUSES = new Set(['REQUIRES_REVIEW', 'AMBIGUOUS']);

function toCsv(rows, fields) {
  const esc = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [fields.join(','), ...rows.map((r) => fields.map((f) => esc(r[f])).join(','))].join('\n') + '\n';
}

/**
 * claim_id: sha256("<source_url>|<claim_index>|<record_index>") truncated
 * to 16 hex chars. Deterministic and stable across repeated builds as long
 * as (a) the source claim text/order in chemical-claims.csv is unchanged
 * and (b) the extractor's per-claim record order is unchanged (it always
 * is -- extractFromSentence emits records left-to-right through the
 * sentence). No timestamp, no random component. See
 * CLAIM-ID-METHODOLOGY.md for the full specification and rationale.
 */
function makeClaimId(sourceUrl, claimIndex, recordIndex) {
  const key = `${sourceUrl}|${claimIndex}|${recordIndex}`;
  return crypto.createHash('sha256').update(key, 'utf8').digest('hex').slice(0, 16);
}

function buildEvidence() {
  const claims = parseCsv(fs.readFileSync(IN_FILE, 'utf8'));
  const evidenceRows = [];
  const rejectedRows = []; // IMPOSSIBLE_MAPPING / NO_PARAMETER_IN_CLAUSE / NO_NUMERIC_CONTENT -- retained for audit (Step 10), excluded from the scientifically-evaluated population

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i];
    const extracted = extractFromSentence(claim.claim);

    if (extracted.length === 0) {
      const row = {
        claim_id: makeClaimId(claim.url, i, 0),
        source_url: claim.url,
        source_file: claim.url,
        source_claim: claim.claim,
        parameter_id: '',
        minimum: '', maximum: '', unit: '', value_type: '',
        environment: '',
        claim_type: '',
        extraction_status: 'NO_NUMERIC_CONTENT',
        scientific_review_status: 'NOT_EXTRACTED',
        source_registry_ids: '',
        review_required: false,
        notes: 'No numeric chemistry value found in this claim (editorial/non-numeric text).',
      };
      evidenceRows.push(row);
      rejectedRows.push(row);
      continue;
    }

    extracted.forEach((rec, recordIndex) => {
      const evaluated = EXTRACTION_STATUSES_EVALUATED.has(rec.extraction_status);
      const scientific = evaluated ? scientificReviewStatus(rec) : 'NOT_EXTRACTED';
      const row = {
        claim_id: makeClaimId(claim.url, i, recordIndex),
        source_url: claim.url,
        source_file: claim.url,
        source_claim: claim.claim,
        parameter_id: rec.parameter_id || '',
        minimum: rec.minimum, maximum: rec.maximum, unit: rec.unit, value_type: rec.value_type,
        environment: rec.environment,
        claim_type: rec.claim_type,
        extraction_status: rec.extraction_status,
        scientific_review_status: scientific,
        source_registry_ids: '', // never fabricated -- see file header
        review_required: REVIEW_REQUIRED_SCIENTIFIC_STATUSES.has(scientific),
        notes: rec.extraction_status === 'IMPOSSIBLE_MAPPING'
          ? `Rejected: ${rec.parameter_id || 'unknown'} does not accept a ${rec.value_type} value -- likely extraction noise, not a real claim about this parameter.`
          : rec.extraction_status === 'NO_PARAMETER_IN_CLAUSE'
          ? 'No chemistry-parameter mention found near this numeric value in its clause.'
          : '',
      };
      evidenceRows.push(row);
      if (!evaluated) rejectedRows.push(row);
    });
  }

  return { claims, evidenceRows, rejectedRows };
}

const FIELDS = ['claim_id', 'source_url', 'source_file', 'source_claim', 'parameter_id', 'minimum', 'maximum',
  'unit', 'value_type', 'environment', 'claim_type', 'extraction_status', 'scientific_review_status',
  'source_registry_ids', 'review_required', 'notes'];

function run() {
  const { claims, evidenceRows, rejectedRows } = buildEvidence();

  // Integrity self-check before writing: every claim_id must be unique.
  const seen = new Set();
  for (const r of evidenceRows) {
    if (seen.has(r.claim_id)) throw new Error(`Duplicate claim_id generated: ${r.claim_id}`);
    seen.add(r.claim_id);
  }

  // Deterministic parameter_id validity check (also enforced by
  // validate-chemistry-evidence-dataset.js, checked here too so a build
  // failure is caught immediately rather than only at validation time).
  for (const r of evidenceRows) {
    if (r.parameter_id && !VALID_PARAMETER_IDS.has(r.parameter_id)) {
      throw new Error(`Invalid parameter_id "${r.parameter_id}" on claim_id ${r.claim_id}`);
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const csvPath = path.join(OUT_DIR, 'chemistry-evidence.csv');
  const jsonPath = path.join(OUT_DIR, 'chemistry-evidence.json');
  fs.writeFileSync(csvPath, toCsv(evidenceRows, FIELDS));
  fs.writeFileSync(jsonPath, JSON.stringify(evidenceRows, null, 2) + '\n');

  console.log(`build-chemistry-evidence: ${claims.length} source claims -> ${evidenceRows.length} evidence records (${rejectedRows.length} retained-but-not-evaluated).`);
  console.log(`  wrote ${csvPath}`);
  console.log(`  wrote ${jsonPath}`);

  return { claims, evidenceRows, rejectedRows, csvPath, jsonPath };
}

if (require.main === module) run();
module.exports = { run, buildEvidence, makeClaimId, FIELDS, VALID_PARAMETER_IDS };
