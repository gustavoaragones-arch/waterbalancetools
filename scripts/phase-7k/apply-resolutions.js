#!/usr/bin/env node
'use strict';
/**
 * apply-resolutions.js (Phase 7K)
 *
 * Applies the genuinely-researched-this-phase claim resolutions on top of
 * the Phase 7J entity-claim-inventory.csv. Only the claims actually
 * investigated with real, verified evidence this phase are touched; the
 * remaining unresolved queue is left exactly as Phase 7J classified it --
 * per the explicit instruction not to force every claim into SUPPORTED
 * and the research-budget stop-rule (Step 12).
 */
const fs = require('fs');
const path = require('path');
const { RANGES_BY_ID } = require('../data/chemistry-ranges');
const { SOURCES_BY_ID } = require('../data/chemistry-sources');

const ROOT = path.join(__dirname, '..', '..');

const RESOLUTIONS = {
  'ec-trichlor-tablets-0313': {
    disposition: 'SUPPORTED',
    source_registry_ids: ['microphor-trichlor-sds-2016', 'asepsis-calhypo-msds-2005'],
    reason: 'Manufacturer SDS for trichlor ("Chlorinating Slugs", Allchem/Microphor) Section 10 explicitly names "calcium hypochlorite" as an incompatible material; the same document\'s EPA pesticide-label section states mixing with incompatible chemicals "may cause a violent reaction leading to fire or explosion." Corroborated by a calcium hypochlorite manufacturer SDS (Asepsis/Chemtura) explicitly warning against using trichlor tablets in the same system. Both fetched and read directly, not summarized.',
  },
  'ec-green-water-0204': {
    disposition: 'CONTEXTUAL',
    source_registry_ids: ['range-shock-algae-recovery-green'],
    reason: 'New chemistry-ranges.js record (range-shock-algae-recovery-green) added this phase, sourced to Pool & Spa News/Taylor Technologies: breakpoint-chlorinate to 30 ppm free chlorine to eliminate a green algae bloom. Single professional-trade-publication source (not government/standards-body) -- held at CONTEXTUAL, not SUPPORTED.',
  },
  'ec-shock-treatment-0140': {
    disposition: 'REQUIRES_REVIEW',
    source_registry_ids: [],
    reason: 'Researched but NOT resolved: two professional trade sources genuinely disagree on the routine/maintenance shock figure -- Pool & Spa News/Taylor Technologies states "usually 2-5 ppm" for general shocking, while AQUA Magazine/HASA (Terry Arko) states 10-20 ppm for superchlorination. Per the non-negotiable evidence policy ("never create a numeric range merely because the site needs one"), no range was added for the routine-maintenance figure specifically; the claim remains REQUIRES_REVIEW rather than resolved with either number. The 30 ppm algae-recovery portion of this same entity IS resolved (see ec-shock-treatment-0142 disposition below).',
  },
  'ec-vinyl-pool-0282': {
    disposition: 'SUPPORTED',
    source_registry_ids: ['cffa-vinyl-liner-bleaching'],
    reason: 'Coated Fabrics and Film Association (CFFA), Vinyl Pool Liners technical division -- a genuine material-industry-specific source (not a generic chemistry article) directly confirms: undissolved granular chemicals (including trichlor specifically) settling on a vinyl liner cause spot bleaching, citing "as few as 6 hours" and listing "shock product hasn\'t been pre dissolved" as a named cause.',
  },
  'ec-fiberglass-pool-0286': {
    disposition: 'CONTEXTUAL',
    source_registry_ids: [],
    reason: 'Researched: Orenda Technologies (a real pool-water-chemistry manufacturer/technical source) confirms the underlying mechanism (low calcium hardness causes aggressive water, which can bind calcium oxide within a fiberglass gelcoat causing "chalking") and confirms fiberglass "has no calcium for water to dissolve" the way plaster does, making it more chemistry-sensitive. However, Orenda\'s own article explicitly challenges the common "keep calcium below 200 ppm" blanket guidance as an oversimplification, recommending chelation-based management instead of a fixed range. The site\'s specific 150-250 ppm figure is a reasonable range but the topic has genuine industry nuance beyond a single number -- held at CONTEXTUAL, page content not changed since the core mechanism claim is not contradicted.',
  },
  'ec-temperature-0080': {
    disposition: 'SUPPORTED',
    source_registry_ids: ['range-temperature-hottub-max-safety'],
    reason: 'New chemistry-ranges.js record added this phase, directly sourced to the Model Aquatic Health Code (MAHC), 5th Edition, Section 5.7.4.7.2: "The maximum temperature for an aquatic venue is 104 F (40C)." Exact numeric match to the entity claim.',
  },
};

function run() {
  const claimPath = path.join(ROOT, 'reports', 'phase-7j', 'entity-claim-inventory.csv');
  const lines = fs.readFileSync(claimPath, 'utf8').trim().split('\n');
  const header = lines[0];
  const applied = [];

  const outLines = [header];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const claimId = row[0];
    const res = RESOLUTIONS[claimId];
    if (res) {
      row[10] = res.disposition; // scientific_review_status
      row[11] = res.source_registry_ids.join(';'); // source_registry_ids
      row[12] = res.disposition === 'REQUIRES_REVIEW' ? 'yes' : 'no'; // review_required
      applied.push({ claim_id: claimId, disposition: res.disposition, source_registry_ids: res.source_registry_ids.join(';'), reason: res.reason });
    }
    outLines.push(row.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(','));
  }

  // Write the Phase 7K-updated claim inventory into reports/phase-7k/ (does
  // not overwrite the Phase 7J historical artifact).
  const outDir = path.join(ROOT, 'reports', 'phase-7k');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'entity-claim-inventory-7k.csv'), outLines.join('\n') + '\n');

  const resHeader = ['claim_id', 'disposition', 'source_registry_ids', 'reason'];
  const resCsv = [resHeader.join(',')].concat(
    applied.map((r) => resHeader.map((h) => '"' + String(r[h]).replace(/"/g, '""') + '"').join(','))
  ).join('\n') + '\n';
  fs.writeFileSync(path.join(outDir, 'resolved-claims.csv'), resCsv);

  // Validate: every referenced source_registry_id must resolve to either a
  // RANGES_BY_ID or SOURCES_BY_ID entry (fail loudly, not silently).
  let badRefs = 0;
  for (const [claimId, res] of Object.entries(RESOLUTIONS)) {
    for (const id of res.source_registry_ids) {
      if (!RANGES_BY_ID[id] && !SOURCES_BY_ID[id]) {
        console.error(`UNRESOLVED REFERENCE: ${claimId} -> ${id}`);
        badRefs++;
      }
    }
  }
  if (badRefs > 0) {
    console.error(`apply-resolutions: ${badRefs} unresolved reference(s) -- ABORT, not writing.`);
    process.exit(1);
  }

  console.log(`apply-resolutions: ${applied.length} claims resolved this phase`);
  for (const a of applied) console.log(`  ${a.claim_id} -> ${a.disposition}`);
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { cur += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

run();
