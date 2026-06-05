/**
 * Phase 7 — Inject Entity Schema: scans reference/ pages with paa-item FAQ elements;
 * strips and re-injects DefinedTerm + FAQPage ld+json blocks.
 * Run: node scripts/inject-entity-schema.js
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REFS = path.join(ROOT, 'reference');

/** DefinedTerm definitions keyed by slug (without .html) */
const ENTITY_DEFS = {
  'chlorine-explained': {
    name: 'Chlorine',
    description: 'Chlorine is a chemical sanitizer used in swimming pools to kill bacteria, algae, and other pathogens. In pool water, chlorine exists as free chlorine (active) and combined chlorine (spent). The ideal free chlorine range for pools is 1–3 ppm.'
  },
  'free-chlorine-explained': {
    name: 'Free Chlorine',
    description: 'Free chlorine is the active form of chlorine in pool water — hypochlorous acid (HOCl) and hypochlorite ion (OCl⁻) — that kills bacteria, algae, and pathogens. Target range is 1–3 ppm for pools.'
  },
  'combined-chlorine-explained': {
    name: 'Combined Chlorine',
    description: 'Combined chlorine, or chloramines, is the portion of pool chlorine that has reacted with nitrogen compounds (from sweat, urine, cosmetics). It is ineffective as a sanitizer and causes the characteristic pool smell and eye irritation. Target: below 0.5 ppm.'
  },
  'cyanuric-acid-explained': {
    name: 'Cyanuric Acid',
    description: 'Cyanuric acid (CYA), also called pool stabilizer or conditioner, protects free chlorine from UV degradation in outdoor pools. The ideal range is 30–50 ppm. Above 100 ppm, CYA over-stabilizes chlorine causing chlorine lock.'
  },
  'total-alkalinity-explained': {
    name: 'Total Alkalinity',
    description: 'Total alkalinity (TA) is the measure of alkaline substances in pool water, primarily bicarbonates, that buffer pH from sudden swings. The ideal range is 80–120 ppm. Low TA causes pH to bounce erratically; high TA causes pH to drift upward and resist correction.'
  },
  'calcium-hardness-explained': {
    name: 'Calcium Hardness',
    description: 'Calcium hardness (CH) measures the concentration of dissolved calcium in pool water. The ideal range is 200–400 ppm. Low calcium creates aggressive water that dissolves surfaces; high calcium causes scale and cloudy water.'
  },
  'shock-treatment-explained': {
    name: 'Pool Shock Treatment',
    description: 'Pool shock treatment is the process of adding a large dose of oxidizer (usually calcium hypochlorite or sodium dichloro) to raise free chlorine to 10–20 ppm, destroying chloramines, algae, and organic contaminants through breakpoint chlorination.'
  },
  'salt-water-generator-explained': {
    name: 'Salt Water Generator',
    description: 'A salt water generator (SWG), also called a salt chlorine generator (SCG), produces chlorine by passing a low-salt solution through an electrolytic cell that converts sodium chloride (salt) into hypochlorous acid. Salt level target: 2,700–3,400 ppm.'
  }
};

/** Strip existing DefinedTerm and FAQPage ld+json blocks */
function stripEntitySchemas(html) {
  // Remove script blocks containing DefinedTerm or FAQPage
  return html.replace(
    /<script type="application\/ld\+json">\s*\{[^<]*"@type"\s*:\s*"(?:DefinedTerm|FAQPage)"[^<]*<\/script>\s*/gi,
    ''
  );
}

/** Extract FAQ pairs from details.paa-item elements */
function extractFaqs(html) {
  const faqs = [];
  const detailsRe = /<details class="paa-item"[^>]*>\s*<summary>([^<]+)<\/summary>\s*<p>([\s\S]*?)<\/p>\s*<\/details>/gi;
  let m;
  while ((m = detailsRe.exec(html)) !== null) {
    const q = m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
    const a = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    faqs.push({ q, a });
  }
  return faqs;
}

/** Build DefinedTerm + FAQPage ld+json blocks */
function buildSchemaBlocks(slug, faqs) {
  const def = ENTITY_DEFS[slug];
  if (!def) return '';

  const dtSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: def.name,
    description: def.description,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Pool Chemistry Glossary',
      url: 'https://waterbalancetools.com/pool-chemistry-system'
    }
  });

  const faqSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  });

  return (
    '\n  <script type="application/ld+json">\n  ' + dtSchema + '\n  </script>' +
    '\n  <script type="application/ld+json">\n  ' + faqSchema + '\n  </script>'
  );
}

/** Inject schema blocks after BreadcrumbList block */
function injectAfterBreadcrumb(html, schemaBlocks) {
  // Find BreadcrumbList script block and inject after it
  const bcRe = /(<script type="application\/ld\+json">[\s\S]*?"@type"\s*:\s*"BreadcrumbList"[\s\S]*?<\/script>)/i;
  const m = html.match(bcRe);
  if (m) {
    const idx = html.indexOf(m[0]) + m[0].length;
    return html.slice(0, idx) + schemaBlocks + html.slice(idx);
  }
  // Fallback: inject before closing </head>
  return html.replace('</head>', schemaBlocks + '\n</head>');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

if (!fs.existsSync(REFS)) {
  console.log('inject-entity-schema: reference/ folder not found, skipping');
  process.exit(0);
}

let processed = 0;
let skipped = 0;

for (const filename of fs.readdirSync(REFS)) {
  if (!filename.endsWith('.html')) continue;

  const filePath = path.join(REFS, filename);
  let html = fs.readFileSync(filePath, 'utf8');

  // Only process files that have paa-item FAQ elements
  if (!html.includes('paa-item')) {
    skipped++;
    continue;
  }

  const slug = filename.replace('.html', '');
  const faqs = extractFaqs(html);

  if (faqs.length === 0 || !ENTITY_DEFS[slug]) {
    skipped++;
    continue;
  }

  // Strip existing DefinedTerm/FAQPage schemas
  html = stripEntitySchemas(html);

  // Build and inject new schema blocks
  const schemaBlocks = buildSchemaBlocks(slug, faqs);
  html = injectAfterBreadcrumb(html, schemaBlocks);

  fs.writeFileSync(filePath, html, 'utf8');
  processed++;
}

console.log(
  'inject-entity-schema: processed ' + processed + ' entity pages, skipped ' + skipped
);
