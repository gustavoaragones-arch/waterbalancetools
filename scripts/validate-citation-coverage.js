#!/usr/bin/env node
'use strict';
/**
 * validate-citation-coverage.js (Phase 7L, Step 19)
 *
 * Structural integrity checks for every rendered .knowledge-sources-real
 * citation block sitewide. Complements (does not replace) validate-trust-
 * layer.js's Tier-1-allowlist check -- this validator looks INSIDE each
 * citation block for malformed content, not just where blocks appear.
 */
const fs = require('fs');
const path = require('path');
const { SOURCES_BY_ID, SOURCES } = require('./data/chemistry-sources');
const { CLAIMS } = require('./data/chemistry-claims');

const ROOT = path.join(__dirname, '..');
let errors = 0;
let warnings = 0;
const err = (msg) => { console.error('ERROR: ' + msg); errors++; };
const warn = (msg) => { console.warn('WARN: ' + msg); warnings++; };

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'reports') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
}

const allHtml = [];
walk(ROOT, allHtml);

// Build a URL -> source lookup so we can check citation URLs against the
// registry (catches an accidental hand-typed URL that doesn't match any
// known source, or a source whose URL changed in the registry without the
// rendered page being regenerated).
const urlToSource = new Map();
for (const s of SOURCES) urlToSource.set(s.url, s);

// The type-label group is matched lazily up to the literal `)</span>`
// closer (not `[^)]*`) because labels like "Industry standard
// (ANSI-accredited)" contain their own nested parentheses.
const SOURCE_URL_RE = /<a href="([^"]+)" rel="noopener" target="_blank">([^<]*)<\/a>\s*&mdash;\s*([^<]*?)\s*<span class="knowledge-source-type">\(([\s\S]*?)\)<\/span>/g;

let totalCitationBlocks = 0;
let totalCitationLinks = 0;
const seenBlocksPerPage = new Map();

for (const file of allHtml) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const isNoindex = /name="robots"\s+content="noindex/i.test(html);

  const blockMatches = [...html.matchAll(/<section class="knowledge-sources-real">[\s\S]*?<\/section>/g)];
  if (blockMatches.length === 0) continue;

  totalCitationBlocks += blockMatches.length;

  // 4. Duplicate citation blocks on the same page.
  if (blockMatches.length > 1) {
    // Allow duplicates only if they cite genuinely different source sets
    // (e.g. two distinct claim-scoped blocks) -- flag identical blocks.
    const texts = blockMatches.map((m) => m[0]);
    const uniq = new Set(texts);
    if (uniq.size < texts.length) err(`${rel}: duplicate identical citation blocks on the same page`);
  }

  // 9. Citations on noindex/internal pages.
  if (isNoindex) {
    err(`${rel}: renders a citation block on a noindex page`);
  }

  for (const block of blockMatches) {
    const blockHtml = block[0];

    // 11. Unresolved template tokens.
    if (/\{\{[A-Z_]+\}\}/.test(blockHtml)) {
      err(`${rel}: citation block contains an unresolved template token`);
    }

    let m;
    SOURCE_URL_RE.lastIndex = 0;
    let linksInBlock = 0;
    while ((m = SOURCE_URL_RE.exec(blockHtml))) {
      linksInBlock++;
      totalCitationLinks++;
      const [, url, label, org, typeLabel] = m;

      // 6. Malformed URLs -- must be absolute HTTPS.
      if (!/^https:\/\//.test(url)) {
        err(`${rel}: citation URL is not HTTPS: ${url}`);
      }

      // 7. Empty source labels.
      if (!label || !label.trim()) err(`${rel}: citation has an empty title/label for ${url}`);
      if (!org || !org.trim()) err(`${rel}: citation has an empty organization for ${url}`);

      // 1/2. Citation points to unknown/unverified source.
      const source = urlToSource.get(url);
      if (!source) {
        err(`${rel}: citation URL does not match any registered source in chemistry-sources.js: ${url}`);
      }

      // 8. Source-scope mismatch (coarse check): a manufacturer_sds/
      // material_industry_association/professional_trade_publication
      // source must not be labeled as a government or ANSI-accredited
      // standard, and vice versa.
      if (source) {
        const expectedLabels = {
          government_public_health: 'Government / public health authority',
          industry_standard: 'Industry standard (ANSI-accredited)',
          academic_extension: 'University / extension program',
          medical_institution: 'Medical institution',
          manufacturer_sds: 'Manufacturer safety data sheet',
          professional_trade_publication: 'Professional trade publication',
          material_industry_association: 'Material industry association',
        };
        const expected = source.source_type ? expectedLabels[source.source_type] : null;
        if (expected && expected !== typeLabel) {
          err(`${rel}: source "${source.id}" rendered with label "${typeLabel}", expected "${expected}" for source_type "${source.source_type}"`);
        }
      }
    }
    if (linksInBlock === 0) {
      err(`${rel}: a knowledge-sources-real block rendered with zero parseable citation links (malformed markup?)`);
    }
  }
}

// 3/4/5. Citation does not map to a claim / unsupported claim presented as
// supported -- cross-check every claim that has source_ids against the
// registry, and confirm no claim below the eligible-status bar has
// source_ids populated in a way that would look "supported."
const ELIGIBLE_STATUSES = new Set(['VERIFIED', 'SUPPORTED', 'CONTEXTUAL']);
for (const c of CLAIMS) {
  for (const sid of c.source_ids || []) {
    if (!SOURCES_BY_ID[sid]) err(`Claim "${c.claim_id}" cites unresolved source_id "${sid}"`);
  }
  if (!ELIGIBLE_STATUSES.has(c.status) && c.source_ids && c.source_ids.length > 0) {
    warn(`Claim "${c.claim_id}" has status "${c.status}" but lists source_ids -- eligible-but-uncited candidate, not a rendering error`);
  }
}

// 10. Citations missing required provenance metadata (registry-level).
for (const s of SOURCES) {
  if (!s.organization || !s.title || !s.url) err(`Source "${s.id}" is missing required provenance metadata (organization/title/url)`);
  if (!s.source_type && !s.authority_level) err(`Source "${s.id}" has neither source_type nor authority_level -- cannot be labeled`);
}

console.log(`validate-citation-coverage: ${totalCitationBlocks} citation block(s), ${totalCitationLinks} citation link(s) scanned across ${allHtml.length} pages.`);

if (errors > 0) {
  console.error(`validate-citation-coverage: FAIL -- ${errors} error(s), ${warnings} warning(s).`);
  process.exit(1);
} else {
  console.log(`validate-citation-coverage: PASS -- 0 errors, ${warnings} warning(s).`);
}
