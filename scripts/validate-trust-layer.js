#!/usr/bin/env node
'use strict';
/**
 * validate-trust-layer.js (Phase 7F.8)
 *
 * Sitewide scan of production HTML for trust/E-E-A-T integrity. Complements
 * (does not replace) the existing scripts/validate-trust.js, which checks
 * the Scientific Authority System's internal data consistency (confidence
 * levels, formula versions, trust panels present). This validator checks
 * the CONTENT of what's claimed, not just that the components exist.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const DANGEROUS_PHRASES = [
  /\bexpert reviewed\b/i, /\bscientifically proven\b/i, /\bscientifically verified\b/i,
  /\bdoctor approved\b/i, /\bphysician approved\b/i, /\bprofessional approved\b/i,
  /\bCDC approved\b/i, /\bPHTA approved\b/i, /\bANSI approved\b/i, /\bNPIC approved\b/i,
  /\bofficially endorsed\b/i, /\bcertified accurate\b/i,
];
const CREDENTIAL_TITLES_RE = /\b(Dr\.|M\.?D\.?|Ph\.?D\.?|R\.?N\.?|C\.?P\.?O\.?)\s+[A-Z][a-z]+/;

function walkHtmlFiles(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.git')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtmlFiles(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function run() {
  const violations = [];
  const warnings = [];

  // 1. Ownership / contact information present on canonical pages
  const ownershipPath = path.join(ROOT, 'legal', 'ownership.html');
  const aboutPath = path.join(ROOT, 'about', 'index.html');
  for (const [label, p] of [['legal/ownership.html', ownershipPath], ['about/index.html', aboutPath]]) {
    if (!fs.existsSync(p)) { violations.push({ rule: 'MISSING_OWNERSHIP_PAGE', detail: label }); continue; }
    const html = fs.readFileSync(p, 'utf8');
    if (!/contact@waterbalancetools\.com/i.test(html) && label === 'legal/ownership.html') {
      violations.push({ rule: 'MISSING_CONTACT_INFO', detail: label });
    }
    if (!/Albor Digital LLC/i.test(html)) violations.push({ rule: 'MISSING_OWNERSHIP_IDENTITY', detail: label });
  }

  // 2. Malformed contact data: every mailto: link must be a plausible email
  const allHtml = walkHtmlFiles(ROOT, []);
  for (const file of allHtml) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file);
    const mailtoMatches = html.match(/mailto:[^"'\s>]+/g) || [];
    for (const m of mailtoMatches) {
      const addr = m.replace('mailto:', '').split('?')[0];
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) violations.push({ rule: 'MALFORMED_CONTACT_EMAIL', detail: `${rel}: ${addr}` });
    }

    // 3. Person schema without an accompanying real-person marker (this
    // codebase has none by design; any appearance is flagged for review)
    if (/"@type"\s*:\s*"Person"/.test(html)) {
      violations.push({ rule: 'PERSON_SCHEMA_PRESENT', detail: rel });
    }

    // 4. Misleading medical/scholarly schema types
    if (/"@type"\s*:\s*"(MedicalWebPage|ScholarlyArticle|Review|NewsArticle)"/.test(html)) {
      violations.push({ rule: 'MISLEADING_SCHEMA_TYPE', detail: rel });
    }

    // 5. sameAs URLs (must be reviewed manually if present -- flagged as a
    // warning, not an automatic failure, since a real verified profile
    // could legitimately be added later)
    if (/"sameAs"/.test(html)) warnings.push(`${rel}: sameAs present -- verify it points to a real, official profile`);

    // 6. Dangerous unsupported trust language
    for (const re of DANGEROUS_PHRASES) {
      if (re.test(html)) violations.push({ rule: 'UNSUPPORTED_TRUST_CLAIM', detail: `${rel}: matched ${re}` });
    }

    // 7. Fabricated credentialed-author bylines (e.g. "Dr. Jane Smith")
    // outside of citation/source text referencing a real external source
    // (CDC/PHTA/etc. names are excluded via a simple allowlist check).
    const credMatch = html.match(CREDENTIAL_TITLES_RE);
    if (credMatch && !/CDC|PHTA|ANSI|NPIC|WHO/.test(html.slice(Math.max(0, credMatch.index - 50), credMatch.index))) {
      warnings.push(`${rel}: possible credentialed name "${credMatch[0]}" -- verify this is not a fabricated author/reviewer byline`);
    }

    // 8. Organization schema logo must not reference a non-existent local file
    const logoMatch = html.match(/"logo"\s*:\s*"https:\/\/waterbalancetools\.com\/([^"]+)"/);
    if (logoMatch) {
      const logoPath = path.join(ROOT, logoMatch[1]);
      if (!fs.existsSync(logoPath)) violations.push({ rule: 'ORGANIZATION_LOGO_FILE_MISSING', detail: `${rel}: ${logoMatch[1]}` });
    }

    // 9. Contradictory published/updated/reviewed dates (updated or
    // reviewed before published, on pages that expose all three)
    const pub = html.match(/data-published="(\d{4}-\d{2}-\d{2})"/);
    const upd = html.match(/data-updated="(\d{4}-\d{2}-\d{2})"|meta name="last-updated" content="(\d{4}-\d{2}-\d{2})"/);
    const rev = html.match(/Last reviewed:\s*(\d{4}-\d{2}-\d{2})/);
    const pubDate = pub && pub[1];
    const updDate = upd && (upd[1] || upd[2]);
    const revDate = rev && rev[1];
    if (pubDate && updDate && updDate < pubDate) violations.push({ rule: 'CONTRADICTORY_DATES', detail: `${rel}: updated (${updDate}) before published (${pubDate})` });
    if (pubDate && revDate && revDate < pubDate) violations.push({ rule: 'CONTRADICTORY_DATES', detail: `${rel}: reviewed (${revDate}) before published (${pubDate})` });
  }

  // 10. Duplicate editorial/methodology pages (same canonical topic served
  // at two different URLs)
  const editorialDir = path.join(ROOT, 'editorial');
  const methodologyDir = path.join(ROOT, 'methodology');
  const editorialSlugs = fs.existsSync(editorialDir) ? fs.readdirSync(editorialDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : [];
  const methodologySlugs = fs.existsSync(methodologyDir) ? fs.readdirSync(methodologyDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : [];
  const overlap = editorialSlugs.filter((s) => methodologySlugs.includes(s));
  if (overlap.length > 0) violations.push({ rule: 'DUPLICATE_EDITORIAL_METHODOLOGY_SLUG', detail: overlap.join(',') });

  // 11. Trust blocks (.knowledge-sources-real) present only where a real
  // sourceIds mapping was established -- cross-check against the known
  // Tier-1 rendering set from Phase 7E/7E.1.
  const KNOWN_TIER1_CITED_PAGES = [
    'calculators/pool-chlorine-calculator.html', 'calculators/hot-tub-chlorine-calculator.html',
    'pool-alkalinity-levels-chart.html', 'hot-tub-chlorine-levels-chart.html',
  ];
  for (const file of allHtml) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const html = fs.readFileSync(file, 'utf8');
    if (html.includes('knowledge-sources-real') && !KNOWN_TIER1_CITED_PAGES.includes(rel)) {
      warnings.push(`${rel}: renders a source-citation block outside the known, individually-reviewed Tier-1 set -- verify it has a real, reviewed source mapping before treating it as established.`);
    }
  }

  const result = {
    status: violations.length === 0 ? 'PASS' : 'FAIL',
    files_scanned: allHtml.length,
    violations_found: violations.length,
    violations: violations.slice(0, 60),
    warnings_count: warnings.length,
    warnings: warnings.slice(0, 30),
  };

  const outDir = path.join(ROOT, 'reports', 'phase-7f');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'trust-layer-validation-results.json'), JSON.stringify(result, null, 2) + '\n');

  console.log(`validate-trust-layer: ${result.status} -- ${allHtml.length} files scanned, ${violations.length} violation(s), ${warnings.length} warning(s).`);
  if (violations.length > 0) {
    for (const v of violations.slice(0, 20)) console.log(`  [${v.rule}] ${v.detail}`);
    process.exitCode = 1;
  }
  return result;
}

if (require.main === module) run();
module.exports = { run };
