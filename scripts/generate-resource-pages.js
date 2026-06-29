/**
 * generate-resource-pages.js
 *
 * Generates the /resources/ content cluster:
 *   resources/index.html             — hub page
 *   resources/<slug>.html            — individual printable resource pages
 *
 * Each resource page has:
 *   - Hero with title + print/download actions
 *   - Online HTML preview (checklist or log table)
 *   - Tips & how-to section
 *   - Related calculators
 *
 * Idempotent — regenerates from scratch on every run.
 * Run: node scripts/generate-resource-pages.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { SITE_HEADER, SITE_FOOTER, href, canonicalUrl, absoluteUrl } = require('./template-utils');

const ROOT         = path.join(__dirname, '..');
const RESOURCES_DIR = path.join(ROOT, 'resources');

if (!fs.existsSync(RESOURCES_DIR)) fs.mkdirSync(RESOURCES_DIR);

// ── Resource definitions ──────────────────────────────────────────────────────

const SVG_CLIPBOARD = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="12" y="16" width="40" height="44" rx="4" stroke="currentColor" stroke-width="3"/><path d="M24 8h16a4 4 0 0 1 0 8H24a4 4 0 0 1 0-8z" stroke="currentColor" stroke-width="2.5"/><path d="M20 30h24M20 38h24M20 46h16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`;

const RESOURCES = [
  {
    slug:        'pool-maintenance-checklist',
    title:       'Pool Maintenance Checklist',
    description: 'Keep your pool clean, safe, and chemically balanced with this complete weekly maintenance checklist. Covers all essential pool care tasks from skimming to chemical testing.',
    metaDesc:    'Free printable pool maintenance checklist. Weekly, monthly, and seasonal pool care tasks. Download or print for free.',
    labels:      ['Printable', 'Free Download', 'Letter & A4 Ready', 'One Page'],
    relatedCalcs: [
      { href: href('/calculators/chemical-calculator'),      label: 'Pool Chemical Calculator' },
      { href: href('/calculators/pool-chlorine-calculator'), label: 'Chlorine Calculator' },
      { href: href('/calculators/pool-ph-calculator'),       label: 'pH Calculator' },
    ],
    tips: [
      'Run the filter for at least 8 hours per day during swim season.',
      'Test water 2–3 times per week when the pool is in regular use.',
      'Shock the pool after heavy rain or high bather load.',
      'Brush walls and floor weekly to prevent algae buildup.',
    ],
    preview: buildChecklistPreview([
      { section: 'Daily Tasks' },
      'Skim surface debris',
      'Check and empty skimmer baskets',
      'Verify pump and filter are running',
      'Check water level',
      { section: 'Weekly Tasks' },
      'Test chlorine levels (target 1–3 ppm)',
      'Test pH (target 7.2–7.6)',
      'Brush pool walls and floor',
      'Vacuum pool floor',
      'Backwash filter if pressure is elevated',
      'Add chemicals as needed',
      { section: 'Monthly Tasks' },
      'Test total alkalinity (target 80–120 ppm)',
      'Test calcium hardness (target 200–400 ppm)',
      'Test cyanuric acid / stabilizer (target 30–50 ppm)',
      'Clean pool tiles and water line',
      'Inspect equipment for leaks or wear',
      { section: 'Seasonal Tasks' },
      'Open pool: shock, balance chemicals, prime pump',
      'Close pool: winterize plumbing, lower water level, cover pool',
    ]),
  },
  {
    slug:        'hot-tub-maintenance-log',
    title:       'Hot Tub Maintenance Log',
    description: 'Track your hot tub chemical readings and maintenance tasks with this simple log sheet. Keep a running record of water chemistry to spot trends and prevent problems.',
    metaDesc:    'Free printable hot tub maintenance log. Track chemical readings, water tests, and maintenance tasks. Download or print for free.',
    labels:      ['Printable', 'Free Download', 'Letter & A4 Ready', 'One Page'],
    relatedCalcs: [
      { href: href('/calculators/hot-tub-chlorine-calculator'), label: 'Hot Tub Chlorine Calculator' },
      { href: href('/calculators/hot-tub-ph-calculator'),       label: 'Hot Tub pH Calculator' },
      { href: href('/calculators/hot-tub-shock-calculator'),    label: 'Hot Tub Shock Calculator' },
    ],
    tips: [
      'Test water at least 2–3 times per week.',
      'Change hot tub water every 3–4 months.',
      'Rinse filters every 2 weeks; deep clean monthly.',
      'Shock after each heavy use session.',
    ],
    preview: buildLogTable(
      ['Date', 'Chlorine (ppm)', 'pH', 'Alkalinity (ppm)', 'Action Taken', 'Notes'],
      10
    ),
  },
  {
    slug:        'pool-opening-checklist',
    title:       'Pool Opening Checklist',
    description: 'Everything you need to do when opening your pool for the season. Follow this step-by-step checklist to safely bring your pool from winter storage to swim-ready condition.',
    metaDesc:    'Free printable pool opening checklist for spring. Step-by-step guide to opening your pool. Download or print for free.',
    labels:      ['Printable', 'Free Download', 'Letter & A4 Ready', 'One Page'],
    relatedCalcs: [
      { href: href('/calculators/chemical-calculator'),      label: 'Pool Chemical Calculator' },
      { href: href('/calculators/pool-shock-calculator'),    label: 'Pool Shock Calculator' },
      { href: href('/calculators/pool-volume-calculator'),   label: 'Pool Volume Calculator' },
    ],
    tips: [
      'Open the pool when daytime temps consistently exceed 70°F to prevent algae.',
      'Shock the pool the night before opening for best results.',
      'Run the pump continuously for 24 hours after adding opening chemicals.',
      'Wait for the water to clear before testing final chemistry.',
    ],
    preview: buildChecklistPreview([
      { section: 'Before You Start' },
      'Remove and clean winter pool cover',
      'Remove ice compensators and plugs',
      'Remove winter fencing or barriers',
      'Inspect pool deck and equipment area',
      { section: 'Equipment Startup' },
      'Reinstall drain plugs and return fittings',
      'Reconnect pump, filter, and heater',
      'Check all o-rings and gaskets for wear',
      'Prime the pump and check for air leaks',
      'Run equipment and check for leaks',
      { section: 'Water Preparation' },
      'Adjust water level to mid-skimmer',
      'Test current water chemistry',
      'Add stain and scale preventer',
      'Shock pool with recommended dose',
      'Run pump 24 hours after adding chemicals',
      { section: 'Final Chemistry Balance' },
      'Test and adjust pH (target 7.2–7.6)',
      'Test and adjust total alkalinity (80–120 ppm)',
      'Test and adjust cyanuric acid (30–50 ppm)',
      'Test and adjust calcium hardness (200–400 ppm)',
      'Confirm chlorine is at 1–3 ppm before swimming',
    ]),
  },
  {
    slug:        'pool-closing-checklist',
    title:       'Pool Closing Checklist',
    description: 'Properly close your pool at the end of the season with this complete winterization checklist. Protecting your pool in winter prevents costly repairs in spring.',
    metaDesc:    'Free printable pool closing / winterization checklist. Step-by-step guide to closing your pool for winter. Download or print for free.',
    labels:      ['Printable', 'Free Download', 'Letter & A4 Ready', 'One Page'],
    relatedCalcs: [
      { href: href('/calculators/chemical-calculator'),    label: 'Pool Chemical Calculator' },
      { href: href('/calculators/pool-shock-calculator'),  label: 'Pool Shock Calculator' },
      { href: href('/calculators/pool-volume-calculator'), label: 'Pool Volume Calculator' },
    ],
    tips: [
      'Close when overnight temps consistently fall below 65°F.',
      'Shock and balance chemistry 1–2 weeks before closing to allow residuals to dissipate.',
      'Use a safety cover rated for your climate zone.',
      'Add a winter algaecide to inhibit spring algae bloom.',
    ],
    preview: buildChecklistPreview([
      { section: 'Chemistry Balance (1–2 Weeks Before)' },
      'Shock pool with super-chlorination dose',
      'Adjust pH to 7.2–7.6',
      'Adjust total alkalinity to 80–120 ppm',
      'Adjust calcium hardness to 200–400 ppm',
      'Add winter algaecide',
      { section: 'Equipment Shutdown' },
      'Remove and store ladders, rails, and toys',
      'Clean pool thoroughly — vacuum and brush',
      'Backwash and clean filter',
      'Blow out or drain all plumbing lines',
      'Add antifreeze to plumbing if in freeze climate',
      'Remove and store pool pump impeller / drain plugs',
      'Disconnect and store heater and automation',
      { section: 'Cover and Close' },
      'Lower water level (12 inches below skimmer for solid cover)',
      'Install ice compensators / air pillows',
      'Install winter cover securely',
      'Remove all skimmer baskets and return fittings',
      'Store chemicals in a cool, dry location',
    ]),
  },
  {
    slug:        'airbnb-pool-turnover-checklist',
    title:       'Vacation Rental Pool Turnover Checklist',
    description: 'A fast, reliable pool inspection and handoff checklist for Airbnb, VRBO, and vacation rental properties. Ensure every guest arrives to a safe, clean, and chemically balanced pool.',
    metaDesc:    'Free printable Airbnb and vacation rental pool turnover checklist. Quick between-guest pool inspection and chemical check. Download or print for free.',
    labels:      ['Printable', 'Free Download', 'Letter & A4 Ready', 'One Page'],
    relatedCalcs: [
      { href: href('/calculators/chemical-calculator'),      label: 'Pool Chemical Calculator' },
      { href: href('/calculators/pool-chlorine-calculator'), label: 'Chlorine Calculator' },
      { href: href('/calculators/pool-ph-calculator'),       label: 'pH Calculator' },
    ],
    tips: [
      'Complete the turnover within 2–4 hours of guest checkout.',
      'Keep a log of chemical additions to identify patterns.',
      'Document any damage with photos before each guest arrival.',
      'Post pool rules laminated near the pool entrance.',
    ],
    preview: buildChecklistPreview([
      { section: 'Safety & Equipment' },
      'Inspect pool fence and latching gate',
      'Verify life ring and reaching pole are in place',
      'Check pool cover is stored or functioning correctly',
      'Inspect ladders and handrails for stability',
      { section: 'Cleaning' },
      'Skim surface debris',
      'Empty skimmer and pump baskets',
      'Brush walls and steps',
      'Vacuum pool floor',
      'Clean waterline tiles',
      'Wipe down pool furniture and deck',
      { section: 'Chemistry Test & Adjustment' },
      'Test chlorine (target 1–3 ppm)',
      'Test pH (target 7.2–7.6)',
      'Test total alkalinity (target 80–120 ppm)',
      'Add chemicals as needed and note quantities',
      { section: 'Confirmation' },
      'Water is clear, no visible algae',
      'Equipment running normally',
      'Pool area left clean and ready for guests',
      'Photo taken for records',
    ]),
  },
  {
    slug:        'pool-chemical-log-sheet',
    title:       'Pool Chemical Log Sheet',
    description: 'Track every chemical addition to your pool with this detailed log sheet. A consistent record helps you identify patterns, reduce waste, and maintain perfectly balanced water.',
    metaDesc:    'Free printable pool chemical log sheet. Track chlorine, pH, alkalinity additions and water test results. Download or print for free.',
    labels:      ['Printable', 'Free Download', 'Letter & A4 Ready', 'One Page'],
    relatedCalcs: [
      { href: href('/calculators/chemical-calculator'),      label: 'Pool Chemical Calculator' },
      { href: href('/calculators/pool-chlorine-calculator'), label: 'Chlorine Calculator' },
      { href: href('/calculators/pool-ph-calculator'),       label: 'pH Calculator' },
      { href: href('/calculators/pool-shock-calculator'),    label: 'Shock Calculator' },
    ],
    tips: [
      'Log readings before and after adding chemicals to see the effect.',
      'Use this sheet to communicate chemical history with a pool service.',
      'Note weather conditions — hot sunny days increase chlorine consumption.',
      'Over time, you can spot weekly patterns and pre-dose accordingly.',
    ],
    preview: buildLogTable(
      ['Date', 'Chlorine (ppm)', 'pH', 'Alk (ppm)', 'Added Chlorine', 'Added pH Up/Down', 'Other', 'Notes'],
      10
    ),
  },
  {
    slug:        'water-test-log',
    title:       'Water Test Log',
    description: 'A clean, simple log for recording pool or hot tub water test results. Works for both strips and liquid test kits. Helps you track water chemistry trends over the entire season.',
    metaDesc:    'Free printable water test log for pool and hot tub. Record chlorine, pH, alkalinity, hardness, and CYA readings. Download or print for free.',
    labels:      ['Printable', 'Free Download', 'Letter & A4 Ready', 'One Page'],
    relatedCalcs: [
      { href: href('/calculators/chemical-calculator'),          label: 'Pool Chemical Calculator' },
      { href: href('/calculators/pool-cyanuric-acid-calculator'), label: 'CYA Calculator' },
      { href: href('/calculators/pool-alkalinity-calculator'),   label: 'Alkalinity Calculator' },
    ],
    tips: [
      'Test at the same time each day for consistent results.',
      'Test before adding chemicals, never immediately after.',
      'Record the water temperature — it affects chemical readings.',
      'Use this log to show your pool tech the full chemical history.',
    ],
    preview: buildLogTable(
      ['Date', 'Time', 'Temp (°F)', 'Cl (ppm)', 'pH', 'Alk (ppm)', 'Ca Hard.', 'CYA (ppm)', 'Notes'],
      12
    ),
  },
  {
    slug:        'pool-shock-log',
    title:       'Pool Shock Treatment Log',
    description: 'Record every pool shock treatment to maintain a clear picture of how often, and how much, you shock your pool. Useful for troubleshooting recurring algae or chlorine demand issues.',
    metaDesc:    'Free printable pool shock treatment log. Track shock doses, product used, and water clarity results. Download or print for free.',
    labels:      ['Printable', 'Free Download', 'Letter & A4 Ready', 'One Page'],
    relatedCalcs: [
      { href: href('/calculators/pool-shock-calculator'),   label: 'Pool Shock Calculator' },
      { href: href('/calculators/chemical-calculator'),     label: 'Chemical Calculator' },
      { href: href('/calculators/pool-volume-calculator'),  label: 'Pool Volume Calculator' },
    ],
    tips: [
      'Shock in the evening to prevent UV from breaking down the chlorine.',
      'Run the pump for at least 8 hours after shocking.',
      'Do not swim until chlorine drops back to 1–3 ppm.',
      'Shock after heavy rain, high bather load, or visible algae.',
    ],
    preview: buildLogTable(
      ['Date', 'Product Used', 'Amount Added', 'Cl Before', 'Cl After (24h)', 'Water Clarity', 'Notes'],
      10
    ),
  },
];

// ── Preview builders ──────────────────────────────────────────────────────────

function buildChecklistPreview(items) {
  const rows = items.map(item => {
    if (typeof item === 'object' && item.section) {
      return `        <li class="section-header">${item.section}</li>`;
    }
    return `        <li>${item}</li>`;
  }).join('\n');
  return `      <ul class="resource-checklist">\n${rows}\n      </ul>`;
}

function buildLogTable(headers, rows) {
  const th = headers.map(h => `<th>${h}</th>`).join('');
  const blankRow = `<tr>${headers.map(() => '<td>&nbsp;</td>').join('')}</tr>`;
  const tbody = Array(rows).fill(blankRow).join('\n          ');
  return `      <div style="overflow-x:auto">
        <table class="resource-table">
          <thead><tr>${th}</tr></thead>
          <tbody>
          ${tbody}
          </tbody>
        </table>
      </div>`;
}

// ── Page template ─────────────────────────────────────────────────────────────

function resourcePage(r) {
  const labelsHtml = r.labels.map(l => `<span class="resource-label">&#10003;&nbsp;${l}</span>`).join('\n          ');
  const tipsHtml = r.tips.map(t => `<li>${t}</li>`).join('\n        ');
  const relatedHtml = r.relatedCalcs.map(c =>
    `          <a href="${c.href}" class="calc-card">${c.label}</a>`
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="canonical" href="${canonicalUrl(`/resources/${r.slug}`)}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${r.title} | Free Printable | WaterBalanceTools</title>
  <meta name="description" content="${r.metaDesc}">
  <link rel="stylesheet" href="../style.css">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3974004697476579" crossorigin="anonymous"></script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "${r.title}",
    "description": "${r.metaDesc}",
    "url": "${absoluteUrl(`/resources/${r.slug}`)}"
  }
  </script>
</head>
<body class="resource-page">
${SITE_HEADER}

  <main class="container">
    <section class="hero hero-compact">
      <div class="calc-hero-icon">${SVG_CLIPBOARD}</div>
      <h1>${r.title}</h1>
      <p>${r.description}</p>
      <div class="resource-actions-top no-print">
        <button onclick="window.print()" class="btn btn-primary">Print This Page</button>
        <a href="${href('/resources')}" class="btn btn-outline">&#8592; All Resources</a>
      </div>
      <div class="resource-labels" style="margin-top:0.75rem">
        ${labelsHtml}
      </div>
    </section>

    <section class="resource-preview">
      <h2>Preview &amp; Print</h2>
${r.preview}
    </section>

    <section class="resource-tips no-print">
      <h2>How to Use This Resource</h2>
      <ul>
        ${tipsHtml}
      </ul>
    </section>

    <section class="related-calculators no-print">
      <h2>Related Calculators</h2>
      <div class="related-calcs-cards">
${relatedHtml}
      </div>
    </section>

    <section class="link-matrix no-print">
      <h3>More Free Resources</h3>
      <ul>
        <li><a href="${href('/resources')}">All Free Printable Resources</a></li>
        <li><a href="${href('/guides/pool-chemistry-basics')}">Pool Chemistry Basics Guide</a></li>
        <li><a href="${href('/pool-chemical-levels-chart')}">Pool Chemical Levels Chart</a></li>
        <li><a href="${href('/calculators/chemical-calculator')}">Pool Chemical Calculator</a></li>
      </ul>
    </section>
  </main>

${SITE_FOOTER}
</body>
</html>`;
}

// ── Hub index page ────────────────────────────────────────────────────────────

function hubPage() {
  const cards = RESOURCES.map(r => {
    const labelsHtml = r.labels.slice(0, 2).map(l => `<span class="resource-label">&#10003;&nbsp;${l}</span>`).join(' ');
    return `        <a href="${href(`/resources/${r.slug}`)}" class="resource-hub-card">
          <h3>${r.title}</h3>
          <p>${r.description.split('.')[0]}.</p>
          <div class="resource-labels">${labelsHtml}</div>
        </a>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="canonical" href="${canonicalUrl('/resources')}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Free Pool &amp; Hot Tub Printable Resources | WaterBalanceTools</title>
  <meta name="description" content="Free printable checklists, log sheets, and maintenance forms for pool and hot tub owners. Download or print for free — no signup required.">
  <link rel="stylesheet" href="../style.css">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3974004697476579" crossorigin="anonymous"></script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Free Pool & Hot Tub Printable Resources",
    "description": "Free printable checklists, log sheets, and maintenance forms for pool and hot tub owners.",
    "url": "${absoluteUrl('/resources')}"
  }
  </script>
</head>
<body class="resource-page">
${SITE_HEADER}

  <main class="container">
    <section class="hero">
      <h1>Free Pool &amp; Hot Tub Printable Resources</h1>
      <p class="hero-sub">Printable checklists, maintenance logs, and chemical tracking sheets for pool and hot tub owners. All free — no email required.</p>
    </section>

    <section class="tools-section">
      <h2>All Resources</h2>
      <div class="resource-hub">
${cards}
      </div>
    </section>

    <section class="quick-answer">
      <h2>What formats are these resources available in?</h2>
      <p>All resources on this page are standard HTML pages that print cleanly in any browser. Click "Print This Page" on any resource to send it to your printer, or choose "Save as PDF" from your browser's print dialog to save a PDF copy. All resources are formatted to fit on one sheet of US Letter or A4 paper.</p>
    </section>

    <section class="link-matrix">
      <h3>Related Tools</h3>
      <ul>
        <li><a href="${href('/calculators/chemical-calculator')}">Pool Chemical Calculator</a></li>
        <li><a href="${href('/calculators/pool-shock-calculator')}">Pool Shock Calculator</a></li>
        <li><a href="${href('/calculators/hot-tub-chlorine-calculator')}">Hot Tub Chlorine Calculator</a></li>
        <li><a href="${href('/guides/pool-chemistry-basics')}">Pool Chemistry Basics Guide</a></li>
        <li><a href="${href('/pool-chemical-levels-chart')}">Pool Chemical Levels Chart</a></li>
      </ul>
    </section>
  </main>

${SITE_FOOTER}
</body>
</html>`;
}

// ── Write files ───────────────────────────────────────────────────────────────

// Hub
fs.writeFileSync(path.join(RESOURCES_DIR, 'index.html'), hubPage(), 'utf8');
console.log('  → resources/index.html');

// Individual pages
for (const r of RESOURCES) {
  const outPath = path.join(RESOURCES_DIR, `${r.slug}.html`);
  fs.writeFileSync(outPath, resourcePage(r), 'utf8');
  console.log(`  → resources/${r.slug}.html`);
}

console.log(`generate-resource-pages: wrote ${RESOURCES.length + 1} files`);
