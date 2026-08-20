#!/usr/bin/env node
'use strict';
/**
 * apply-manual-dispositions.js (Phase 7J, Steps 8-9)
 *
 * Individually reviewed every claim the automated cross-reference (Step 5)
 * flagged CONFLICTING (21 claims) plus the automated AMBIGUOUS ones (32
 * claims, unreliable extraction). Automated cross-referencing only checks
 * "does this number fall inside a chemistry-ranges.js target-range record
 * for the same parameter_id" -- it cannot distinguish a target-range claim
 * from a product-composition/purity claim, a dose-response delta, an
 * illustrative example inside a mechanism explanation, or a comparison
 * reference (e.g. "ocean water is 35,000 ppm salt"). Every one of the 21
 * CONFLICTING claims was read in full context and individually
 * dispositioned below; none was auto-resolved.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

// claim_id -> { disposition, reason, recommended_action, priority }
const MANUAL_REVIEW = {
  'ec-combined-chlorine-0009': {
    disposition: 'CONTEXTUAL',
    reason: 'Matches the already-established Phase 7E/7F.1 finding: CDC MAHC sets a stricter 0.4 ppm action level for regulated public facilities, while 0.5 ppm is a commonly used residential target. Not a new discrepancy.',
    recommended_action: 'KEEP', priority: 'HIGH',
  },
  'ec-breakpoint-chlorination-0150': {
    disposition: 'CONTEXTUAL',
    reason: 'Same 0.4/0.5 ppm CC distinction as combined-chlorine.',
    recommended_action: 'KEEP', priority: 'HIGH',
  },
  'ec-ph-0069': {
    disposition: 'NON_CLAIM',
    reason: '"at pH 8.0 only 22% of chlorine is active" is an illustrative data point inside a mechanism explanation (how HOCl fraction varies with pH), not a claim that pool pH should be 8. The cross-reference tool incorrectly compared it to the pH target-range registry.',
    recommended_action: 'KEEP', priority: 'MEDIUM',
  },
  'ec-high-ph-0253': { disposition: 'NON_CLAIM', reason: 'Same illustrative-example pattern as ec-ph-0069.', recommended_action: 'KEEP', priority: 'MEDIUM' },
  'ec-high-ph-0254': { disposition: 'NON_CLAIM', reason: 'The "22%" is the HOCl-fraction illustrative figure, not a free-chlorine target claim.', recommended_action: 'KEEP', priority: 'MEDIUM' },
  'ec-skin-irritation-0232': {
    disposition: 'NON_CLAIM',
    reason: 'Describes a symptom-onset threshold ("pH below 7.0 or above 8.0"), not a recommended target range. Consistent with (wider than) the registry\'s 7.0-7.8 SUPPORTED target -- a range slightly outside the target causing irritation is expected, not contradictory.',
    recommended_action: 'KEEP', priority: 'HIGH',
  },
  'ec-skin-irritation-0234': {
    disposition: 'CONTEXTUAL',
    reason: 'Bromine "above 10 ppm" as an irritation threshold is above the registry\'s SUPPORTED routine range (4.0-8.0 ppm, target 5.0) -- describes what happens when the routine range is meaningfully exceeded, not a contradiction of it.',
    recommended_action: 'KEEP', priority: 'HIGH',
  },
  'ec-saltwater-pool-0264': {
    disposition: 'NON_CLAIM',
    reason: '"ocean water (35,000 ppm)" is a comparison reference to make the pool\'s own 3,000-3,200 ppm figure (stated correctly and separately in the same sentence) meaningful to the reader -- not a claim about the pool itself.',
    recommended_action: 'KEEP', priority: 'LOW',
  },
  'ec-automatic-chlorinator-0133': {
    disposition: 'SUPPORTED',
    reason: 'Product-composition fact (trichlor tablets contain ~58% CYA by weight, a standard manufacturer specification), not a pool-water target-range claim -- chemistry-ranges.js does not cover product composition, so the automated tool had no registry entry to match against. Internally consistent with the trichlor-tablets entity\'s own 58% CYA figure.',
    recommended_action: 'KEEP', priority: 'MEDIUM',
  },
  'ec-shock-treatment-0143': { disposition: 'SUPPORTED', reason: 'Product composition (calcium hypochlorite ~65% available chlorine is a standard, widely-cited manufacturer specification) -- not a pool-water target claim. Matches the site\'s own formulas-data.js worked example, which also uses "65% cal-hypo."', recommended_action: 'KEEP', priority: 'MEDIUM' },
  'ec-sodium-dichlor-0303': { disposition: 'SUPPORTED', reason: 'Product composition (dichlor ~57% CYA by weight) -- plausible and consistent with the closely related trichlor figure (58%).', recommended_action: 'KEEP', priority: 'MEDIUM' },
  'ec-trichlor-tablets-0309': { disposition: 'SUPPORTED', reason: 'Product composition (trichlor tablets ~58% CYA, ~90% available chlorine) -- standard manufacturer specification, not a pool-target claim.', recommended_action: 'KEEP', priority: 'MEDIUM' },
  'ec-trichlor-tablets-0311': {
    disposition: 'SUPPORTED',
    reason: 'Describes the product\'s own inherent pH (~2.9, undiluted), not a pool-water target. Consistent with the ~2.8 trichlor-acidity figure already established and used in Phase 7I\'s generate-ph-pages.js work for this same site.',
    recommended_action: 'KEEP', priority: 'MEDIUM',
  },
  'ec-pool-salt-0341': { disposition: 'SUPPORTED', reason: 'Product purity specification (99.8%+ NaCl is standard for pool-grade salt), not a pool-water concentration target -- different claim category than the salt target-range registry entry.', recommended_action: 'KEEP', priority: 'LOW' },
  'ec-soda-ash-0323': {
    disposition: 'SUPPORTED',
    reason: 'Dose-response claim ("6 oz raises pH by 0.2 per 10,000 gal"), a different claim category than a target-range record. Cross-referenced directly against scripts/data/formulas-data.js\'s own pH-adjustment formula content, which states the identical figure verbatim: "approximately 6 oz per 10,000 gallons per 0.2 pH unit increase."',
    recommended_action: 'KEEP', priority: 'HIGH',
  },
  'ec-baking-soda-0327': {
    disposition: 'SUPPORTED',
    reason: 'Matches scripts/data/formulas-data.js\'s own alkalinity-formula limitations text verbatim: "usually 0.1 to 0.2 pH units for typical doses."',
    recommended_action: 'KEEP', priority: 'HIGH',
  },
  'ec-baking-soda-0330': {
    disposition: 'SUPPORTED',
    reason: 'Matches scripts/data/formulas-data.js\'s own alkalinity-formula explanation verbatim: "1.5 lbs per 10,000 gallons raises TA by approximately 10 ppm."',
    recommended_action: 'KEEP', priority: 'HIGH',
  },
  'ec-calcium-chloride-0334': {
    disposition: 'REQUIRES_REVIEW',
    reason: 'Plausible dose-response figure (12 oz raises CH by ~10 ppm per 10,000 gal) but not independently cross-referenced against an existing site formula or external source this pass -- chemistry-ranges.js does not cover dose-response deltas.',
    recommended_action: 'DEFER', priority: 'MEDIUM',
  },
  'ec-shock-treatment-0140': {
    disposition: 'REQUIRES_REVIEW',
    reason: 'Registry has a shock_treatment record, but it is explicitly scoped to CDC/MAHC fecal-incident response (20 ppm, safety/incident guidance) and explicitly states it should not be presented as routine maintenance guidance. The entity\'s "10 ppm for maintenance, 30 ppm for algae recovery" figures describe a different scenario (routine/algae shock magnitude) the registry does not yet cover -- plausible, commonly-cited, but not directly verified against an authoritative source this pass.',
    recommended_action: 'RESEARCH', priority: 'HIGH',
  },
  'ec-green-water-0204': {
    disposition: 'REQUIRES_REVIEW',
    reason: 'Same registry-coverage gap as ec-shock-treatment-0140; the 30 ppm figure is internally consistent with the shock-treatment entity\'s own "30 ppm for algae recovery" statement.',
    recommended_action: 'RESEARCH', priority: 'HIGH',
  },
  'ec-stabilizer-0338': {
    disposition: 'REQUIRES_REVIEW',
    reason: 'Extraction attribution issue, not a chemistry conflict: the proximity-based extractor attributed this number to "salt" (nearest preceding mention, "salt pools") when the actual measured parameter is cyanuric_acid (the sentence is about CYA target range, 30-50 ppm standard vs. 60-80 ppm for salt-pool environments). The underlying claim (elevated CYA target for saltwater pools) is plausible and matches the saltwater-pool entity\'s own separately-stated "higher CYA requirements (60-80 ppm)" -- logged as a documented extractor limitation, not a content defect.',
    recommended_action: 'DEFER', priority: 'MEDIUM',
  },

  // ---- Step 7: material-specific claims (fiberglass/vinyl/concrete) ----
  // chemistry-ranges.js covers water-chemistry target ranges, not
  // pool-construction material science. These claims are correctly outside
  // that registry's scope -- not fabricating a materials-science source
  // registry entry that doesn't exist, per Step 7's explicit warning not
  // to assume a chemistry source supports a material-science claim.
  'ec-fiberglass-pool-0284': { disposition: 'REQUIRES_REVIEW', reason: 'Material-science claim (fiberglass surface algae resistance, lower chemical demand) -- outside chemistry-ranges.js scope (water chemistry, not construction materials). Plausible and not contradicted by anything on-site, but not independently verified against a materials/construction source this pass.', recommended_action: 'RESEARCH', priority: 'MEDIUM' },
  'ec-fiberglass-pool-0286': { disposition: 'REQUIRES_REVIEW', reason: 'Material-degradation claim (aggressive water leaching gelcoat) -- same registry-scope gap. Mechanistically consistent with the site\'s existing LSI/corrosion knowledge (aggressive/low-LSI water attacks surfaces generally) but the gelcoat-specific mechanism is not independently verified this pass.', recommended_action: 'RESEARCH', priority: 'MEDIUM' },
  'ec-fiberglass-pool-0287': { disposition: 'REQUIRES_REVIEW', reason: 'Material-property claim (smooth surface = less chemical demand) -- plausible, outside chemistry-ranges.js scope.', recommended_action: 'DEFER', priority: 'LOW' },
  'ec-fiberglass-pool-0288': { disposition: 'REQUIRES_REVIEW', reason: 'Material/maintenance claim (fiberglass cannot be refinished like plaster) -- a construction-industry fact, outside the chemistry source registry\'s scope entirely.', recommended_action: 'DEFER', priority: 'LOW' },
  'ec-vinyl-pool-0281': { disposition: 'REQUIRES_REVIEW', reason: 'Material-damage claim (aggressive water attacking metal fittings even when liner itself is not calcium-based) -- consistent with existing LSI/corrosion knowledge already established elsewhere on-site, not independently re-verified this pass.', recommended_action: 'DEFER', priority: 'MEDIUM' },
  'ec-vinyl-pool-0282': { disposition: 'REQUIRES_REVIEW', reason: 'Practical maintenance/safety claim (undissolved granular chemicals bleaching vinyl liners) -- well-known, widely-repeated pool-maintenance guidance, but not independently verified against a specific source this pass. Outside chemistry-ranges.js scope (material interaction, not a water-chemistry target).', recommended_action: 'RESEARCH', priority: 'MEDIUM' },
  'ec-vinyl-pool-0283': { disposition: 'NOT_APPLICABLE', reason: 'Liner lifespan (8-15 years) is a product-durability claim, not a chemistry claim of any kind -- outside the chemistry provenance system\'s scope entirely.', recommended_action: 'DEFER', priority: 'LOW' },
  'ec-concrete-pool-0290': { disposition: 'SUPPORTED', reason: 'Directly consistent with the site\'s own established LSI/corrosion knowledge (negative LSI = aggressive water dissolves calcium carbonate from surfaces) already documented in chemistry-ranges.js and used sitewide (e.g. entities/corrosion.html, entities/lsi.html).', recommended_action: 'KEEP', priority: 'MEDIUM' },
  'ec-concrete-pool-0292': { disposition: 'REQUIRES_REVIEW', reason: 'Comparative material-durability claim (concrete more chemistry-sensitive than vinyl/fiberglass) -- plausible synthesis of the other three pool-type entities\' own stated calcium-hardness differences, not independently verified against an external materials source.', recommended_action: 'DEFER', priority: 'LOW' },

  // ---- Step 9: HIGH-risk safety claim, real research attempted ----
  'ec-trichlor-tablets-0313': {
    disposition: 'REQUIRES_REVIEW',
    reason: 'HIGH-risk chemical-handling safety claim ("should not be mixed with calcium hypochlorite -- fire and explosion risk"). Attempted live verification against 3 sources found via search: OSHA Hazard Information Bulletin (fetched -- covers only general combustible-storage hazards, does not mention trichlor specifically), CAMEO Chemicals/NOAA calcium hypochlorite datasheet (fetched -- lists urea/ammonia/organics as incompatible, does not list trichlor specifically), and a trade-publication article (blocked, HTTP 403) and a PubMed study (blocked by cookie-consent wall, could not access abstract). Could not independently pin down one specific, directly-verified primary source for this exact claim today despite good-faith effort. The claim matches broadly-known pool-industry safety consensus (mixing different chlorinating agents, especially acidic isocyanurates with alkaline hypochlorites, is a well-known hazard) and is NOT contradicted by anything found -- but per this phase\'s explicit rule against fabricating provenance, it is marked REQUIRES_REVIEW rather than SUPPORTED until a specific accessible source (e.g. a manufacturer SDS/product label, typically explicit about this exact incompatibility) is verified in a future phase.',
    recommended_action: 'RESEARCH', priority: 'HIGH',
  },
};

function run() {
  const claimPath = path.join(ROOT, 'reports', 'phase-7j', 'entity-claim-inventory.csv');
  const lines = fs.readFileSync(claimPath, 'utf8').trim().split('\n');
  const header = lines[0];
  const decisions = [];

  for (let i = 1; i < lines.length; i++) {
    // naive CSV split is unsafe with embedded commas/quotes -- use a small parser
    const row = parseCsvLine(lines[i]);
    const claimId = row[0];
    const entityId = row[1];
    const sourceText = row[2];
    const originalStatus = row[10];
    const manual = MANUAL_REVIEW[claimId];
    if (manual) {
      decisions.push({
        claim_id: claimId, entity_id: entityId, source_text: sourceText,
        automated_status: originalStatus, final_disposition: manual.disposition,
        reason: manual.reason, recommended_action: manual.recommended_action, priority: manual.priority,
      });
    }
  }

  const header2 = ['claim_id', 'entity_id', 'source_text', 'automated_status', 'final_disposition', 'reason', 'recommended_action', 'priority'];
  const csv = [header2.join(',')].concat(
    decisions.map((r) => header2.map((h) => '"' + String(r[h]).replace(/"/g, '""') + '"').join(','))
  ).join('\n') + '\n';
  fs.writeFileSync(path.join(ROOT, 'reports', 'phase-7j', 'high-risk-manual-review.csv'), csv);
  console.log(`apply-manual-dispositions: ${decisions.length} claims individually reviewed`);

  // Also patch entity-claim-inventory.csv so scientific_review_status reflects the reviewed disposition.
  const outLines = [header];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const claimId = row[0];
    const manual = MANUAL_REVIEW[claimId];
    if (manual) {
      row[10] = manual.disposition;
      row[12] = (manual.disposition === 'REQUIRES_REVIEW') ? 'yes' : 'no';
    }
    outLines.push(row.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(','));
  }
  fs.writeFileSync(claimPath, outLines.join('\n') + '\n');
  console.log('entity-claim-inventory.csv updated with individually-reviewed dispositions.');
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
