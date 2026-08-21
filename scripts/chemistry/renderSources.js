/**
 * renderSources.js
 *
 * Reusable rendering helpers for chemistry source citations. Phase 7D
 * builds this architecture but does NOT inject it into any production
 * page -- that is deliberately deferred to a later phase (see
 * reports/phase-7d/GENERATOR-CHEMISTRY-MIGRATION-PLAN.md). Kept separate
 * from chemistryKnowledge.js (data access) so rendering concerns don't leak
 * into the read API.
 */
'use strict';

const { getSources, getClaim } = require('./chemistryKnowledge');

function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// source_type gives a precise label where one exists; authority_level is
// the fallback for older records that predate source_type (Phase 7D-era
// sources only ever set authority_level). Phase 7K introduced source_type
// values that don't all map 1:1 onto an authority_level bucket -- e.g.
// "professional" previously meant only ANSI-accredited standards, but now
// also covers trade publications and material-industry associations,
// which are not standards bodies and must not be labeled as one.
const SOURCE_TYPE_LABELS = {
  government_public_health: 'Government / public health authority',
  industry_standard: 'Industry standard (ANSI-accredited)',
  academic_extension: 'University / extension program',
  medical_institution: 'Medical institution',
  manufacturer_sds: 'Manufacturer safety data sheet',
  professional_trade_publication: 'Professional trade publication',
  material_industry_association: 'Material industry association',
};

function authorityLabel(level) {
  const labels = {
    primary: 'Government / public health authority',
    professional: 'Industry standard (ANSI-accredited)',
    academic: 'University / extension program',
    manufacturer: 'Manufacturer technical documentation',
    secondary: 'Secondary source',
  };
  return labels[level] || level;
}

function sourceLabel(source) {
  if (source.source_type && SOURCE_TYPE_LABELS[source.source_type]) {
    return SOURCE_TYPE_LABELS[source.source_type];
  }
  return authorityLabel(source.authority_level);
}

/**
 * renderSourceList(sourceIds) -> HTML string. Matches the site's existing
 * `.knowledge-sources` naming convention but is semantically real (an
 * actual list of citations), unlike the current sitewide block, which the
 * Phase 7A audit found only ever contains a "Last reviewed" date -- see
 * reports/phase-7a/trust-audit.md.
 */
function renderSourceList(sourceIds) {
  const sources = getSources(sourceIds);
  if (sources.length === 0) return '';
  const items = sources.map((s) => (
    `<li class="knowledge-source-item">` +
    `<a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.title)}</a>` +
    ` &mdash; ${esc(s.organization)}` +
    ` <span class="knowledge-source-type">(${esc(sourceLabel(s))})</span>` +
    `</li>`
  )).join('\n  ');
  return `<section class="knowledge-sources-real">\n  <h3>Sources</h3>\n  <ul>\n  ${items}\n  </ul>\n</section>`;
}

/**
 * renderClaimSources(claimId) -> HTML string, or '' if the claim has no
 * source_ids (e.g. status REQUIRES_REVIEW / UNSUPPORTED claims render no
 * citation block rather than a misleading empty one).
 */
function renderClaimSources(claimId) {
  const claim = getClaim(claimId);
  if (!claim || !claim.source_ids || claim.source_ids.length === 0) return '';
  return renderSourceList(claim.source_ids);
}

module.exports = { renderSourceList, renderClaimSources, authorityLabel, sourceLabel };
