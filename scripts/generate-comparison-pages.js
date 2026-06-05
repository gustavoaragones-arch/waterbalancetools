/**
 * Phase 7 — Comparison Pages: 5 feature comparison pages.
 * Writes to comparisons/ folder. Idempotent — overwrites on each run.
 * Run: node scripts/generate-comparison-pages.js
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = '../'; // depth-1 from root (comparisons/ folder)

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function breadcrumbSchema(canonicalPath, title) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://waterbalancetools.com/' },
      { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://waterbalancetools.com/pool-chemistry-system' },
      { '@type': 'ListItem', position: 3, name: title, item: 'https://waterbalancetools.com' + canonicalPath }
    ]
  });
}

function tableRowsTh(headers) {
  return '        <tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr>';
}

function tableRows(rows) {
  return rows.map(r =>
    '        <tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>'
  ).join('\n');
}

function html(opts) {
  const {
    slug, canonicalPath, title, metaDesc,
    optionA, optionB,
    quickAnswer, keyTakeaways,
    comparisonRows,
    prosA, consA, prosB, consB,
    bestUseCases,
    verdict,
    relatedCalcs,
    relatedEntities
  } = opts;

  const crumbSchema = breadcrumbSchema(canonicalPath, title);

  const calcLinks = relatedCalcs.map(([href, label]) =>
    '        <li><a href="' + BASE + 'calculators/' + href + '">' + esc(label) + '</a></li>'
  ).join('\n');

  const entityLinks = (relatedEntities || []).map(([href, label]) =>
    '        <li><a href="' + BASE + href + '">' + esc(label) + '</a></li>'
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://waterbalancetools.com${canonicalPath}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${esc(metaDesc)}">
  <title>${esc(title)} | WaterBalanceTools</title>
  <meta property="og:title" content="${esc(title)} | WaterBalanceTools">
  <meta property="og:description" content="${esc(metaDesc)}">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="${BASE}style.css">
  <script type="application/ld+json">
  ${crumbSchema}
  </script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3974004697476579" crossorigin="anonymous"></script>
</head>
<body>
  <header class="site-header">
    <a href="${BASE}index.html" class="logo-link"><img src="${BASE}assets/logo.svg" alt="WaterBalanceTools" class="logo" width="180" height="36"></a>
    <nav class="nav">
      <a href="${BASE}calculators/chemical-calculator.html">Chemical Calculator</a>
      <a href="${BASE}calculators/pool-volume-calculator.html">Volume Calculator</a>
      <a href="${BASE}guides/pool-chemistry-basics.html">Chemistry Guide</a>
    </nav>
  </header>
  <main class="container guide-content">
    <h1>${esc(title)}</h1>
    <section class="quick-answer">
      <h2>Quick Answer</h2>
      <p>${quickAnswer}</p>
    </section>
    <section class="key-takeaways">
      <ul>
${keyTakeaways.map(t => '        <li>' + t + '</li>').join('\n')}
      </ul>
    </section>
    <h2>Feature Comparison</h2>
    <table class="chart-table">
      <thead>
${tableRowsTh(['Feature', optionA, optionB])}
      </thead>
      <tbody>
${tableRows(comparisonRows)}
      </tbody>
    </table>
    <h2>${esc(optionA)}: Pros</h2>
    <ul>
${prosA.map(p => '      <li>' + p + '</li>').join('\n')}
    </ul>
    <h2>${esc(optionA)}: Cons</h2>
    <ul>
${consA.map(c => '      <li>' + c + '</li>').join('\n')}
    </ul>
    <h2>${esc(optionB)}: Pros</h2>
    <ul>
${prosB.map(p => '      <li>' + p + '</li>').join('\n')}
    </ul>
    <h2>${esc(optionB)}: Cons</h2>
    <ul>
${consB.map(c => '      <li>' + c + '</li>').join('\n')}
    </ul>
    <h2>Best Use Cases</h2>
    <ul>
${bestUseCases.map(u => '      <li>' + u + '</li>').join('\n')}
    </ul>
    <h2>Verdict</h2>
    <p>${verdict}</p>
    <h2>Related Calculators</h2>
    <ul class="ring-links">
${calcLinks}
    </ul>
${entityLinks ? '    <h2>Related Reference Pages</h2>\n    <ul class="ring-links">\n' + entityLinks + '\n    </ul>' : ''}
    <section class="credibility">
      <ul class="credibility-trust">
        <li>Typical range: 1–3 ppm chlorine</li>
        <li>Recommended pH: 7.2–7.6</li>
        <li>Test water regularly</li>
      </ul>
      <p>WaterBalanceTools provides practical calculators and guides for pool and hot tub water chemistry.</p>
      <p class="meta publisher-meta">Published by Water Balance Tools · Operated by Albor Digital LLC</p>
    </section>
    <div class="ad ad-bottom"><!-- AdSense --></div>
    <p class="updated">Last updated: June 2026</p>
  </main>
  <footer class="site-footer">
    <nav class="footer-nav">
      <a href="${BASE}calculators/pool-volume-calculator.html">Pool Volume Calculator</a>
      <a href="${BASE}calculators/pool-chlorine-calculator.html">Pool Chlorine Calculator</a>
      <a href="${BASE}calculators/pool-shock-calculator.html">Pool Shock Calculator</a>
      <a href="${BASE}calculators/pool-ph-calculator.html">Pool pH Calculator</a>
      <a href="${BASE}guides/pool-chemistry-basics.html">Pool Chemistry Guide</a>
      <a href="${BASE}legal/ownership.html">Ownership</a>
      <a href="${BASE}legal/legal.html">Legal</a>
    </nav>
    <p class="footer-copy">&copy; WaterBalanceTools.com</p>
  </footer>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPARISON PAGE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const comparisonPages = [

  {
    slug: 'chlorine-vs-bromine.html',
    canonicalPath: '/comparisons/chlorine-vs-bromine',
    title: 'Chlorine vs Bromine: Which Is Better for Your Pool?',
    metaDesc: 'Chlorine vs bromine comparison: cost, temperature stability, UV stability, odor, and best use cases. Which is better for pools vs hot tubs?',
    optionA: 'Chlorine',
    optionB: 'Bromine',
    quickAnswer: 'Chlorine is better for outdoor pools — cheaper, faster-acting, and backed by more products. Bromine is better for hot tubs and indoor pools — more stable at high temperatures and pH, less irritating to sensitive skin. For outdoor pools, use chlorine. For spas, bromine is a strong choice.',
    keyTakeaways: [
      'Chlorine is more cost-effective and works faster; ideal for outdoor pools',
      'Bromine is more pH-stable and performs better at high spa temperatures (100–104°F)',
      'Bromine cannot be easily stabilized against UV — only for indoor/covered pools or spas',
      'Bromine can be reactivated by shocking; chlorine chloramines cannot be recovered'
    ],
    comparisonRows: [
      ['Cost', 'Lower — widely available', 'Higher — more expensive per unit'],
      ['Temperature stability', 'Degrades faster above 85–95°F', 'Stable at spa temperatures (100–104°F)'],
      ['UV stability', 'Needs CYA for outdoor protection', 'Oxidized (not destroyed) by UV; cannot be easily stabilized outdoors'],
      ['Odor', 'Minimal when properly balanced', 'Distinctive bromine odor always present'],
      ['Reactivation', 'Cannot reactivate combined chlorine', 'Bromamines can be reactivated with shock (MPS or chlorine)'],
      ['pH impact', 'Raises pH slightly', 'Lower pH impact; more stable in spa range'],
      ['Availability', 'Widely available in multiple forms', 'Primarily tablets; fewer product options'],
      ['Best environment', 'Outdoor pools', 'Hot tubs, indoor pools, covered spas']
    ],
    prosA: [
      'Lower cost per treatment — chlorine products are widely available and affordable',
      'Faster sanitizing action — HOCl kills pathogens more rapidly than bromine',
      'Can be stabilized with CYA for outdoor use — essential for sun-exposed pools',
      'Wide range of product forms: liquid, granular, tablets',
      'Easier to lower levels if over-dosed — just expose to sunlight'
    ],
    consA: [
      'Degrades faster at high temperatures — less suitable for hot tubs at 100–104°F',
      'Combined chlorine (chloramines) cannot be reactivated — must be oxidized and re-dosed',
      'Without CYA, rapidly destroyed by UV in outdoor environments',
      'Chloramines are the leading cause of pool odor and swimmer irritation'
    ],
    prosB: [
      'More stable at high spa temperatures — maintains effectiveness at 100–104°F',
      'Bromamines can be reactivated with shock — more efficient use of product',
      'Less irritating to eyes and skin for many swimmers, especially in hot tubs',
      'More stable across a wider pH range — effective from 7.0 to 8.0',
      'Produces less harsh odor in some users\' experience'
    ],
    consB: [
      'Cannot be stabilized against UV — cannot be used effectively in outdoor pools',
      'Higher cost per treatment — tablets especially expensive over time',
      'Bromine smell is always noticeable to some degree, even when properly balanced',
      'Harder to lower levels if over-dosed (sunlight does not help)',
      'More difficult to find in granular or liquid form for quick adjustments'
    ],
    bestUseCases: [
      '<strong>Use chlorine:</strong> Outdoor residential and commercial pools, any pool with sun exposure, pools where cost is a primary concern',
      '<strong>Use bromine:</strong> Indoor hot tubs and spas, covered spa pools, indoor commercial pools, swimmers with sensitive skin or chlorine sensitivity',
      '<strong>Chlorine wins:</strong> Outdoor pools — UV stability via CYA is essential and bromine cannot provide it',
      '<strong>Bromine wins:</strong> Hot tubs — high temperatures are bromine\'s strength and chlorine\'s weakness'
    ],
    verdict: 'Use chlorine for outdoor pools — it is more economical, UV-stabilizable, and better-supported by products and testing equipment. Use bromine for hot tubs and indoor pools where high temperatures and stable pH chemistry are more important than UV resistance. There is no reason to use bromine in an outdoor pool, and there are strong reasons to consider it for a spa.',
    relatedCalcs: [
      ['pool-chlorine-calculator.html', 'Pool Chlorine Calculator'],
      ['hot-tub-chlorine-calculator.html', 'Hot Tub Chlorine Calculator']
    ],
    relatedEntities: [
      ['reference/chlorine-explained.html', 'Chlorine Explained'],
      ['reference/free-chlorine-explained.html', 'Free Chlorine Explained']
    ]
  },

  {
    slug: 'pool-shock-vs-chlorine.html',
    canonicalPath: '/comparisons/pool-shock-vs-chlorine',
    title: 'Pool Shock vs Chlorine: What\'s the Difference?',
    metaDesc: 'Pool shock vs regular chlorine: how they differ in purpose, concentration, frequency, and when to use each. They work together, not as alternatives.',
    optionA: 'Regular Chlorine',
    optionB: 'Pool Shock',
    quickAnswer: 'Pool shock is a super-concentrated dose of chlorine or oxidizer used to rapidly raise FC to breakpoint (10+ ppm), destroying chloramines and killing algae. Regular chlorine maintains daily FC. You need both: regular chlorine for maintenance, shock for treatment. They work together, not as alternatives.',
    keyTakeaways: [
      'Regular chlorine maintains 1–3 ppm FC for daily sanitization',
      'Pool shock raises FC to 10+ ppm for breakpoint chlorination — destroying chloramines',
      'They are complementary, not interchangeable — both are necessary',
      'Shock is for treatment events; regular chlorine is for ongoing maintenance'
    ],
    comparisonRows: [
      ['Purpose', 'Maintain 1–3 ppm FC for daily sanitation', 'Raise FC to 10+ ppm for breakpoint chlorination'],
      ['Concentration', 'Liquid: 10–12%; granular: 65–73% (cal-hypo)', 'Cal-hypo 65–73%; dichlor 56%; MPS (non-chlorine)'],
      ['Frequency', 'Every 2–3 days or as FC drops', 'Weekly + after events (rain, parties, algae)'],
      ['Wait to swim', 'Immediately if FC &lt;5 ppm', '8–24+ hours depending on dose and FC level'],
      ['Removes chloramines', 'No — regular dosing does not reach breakpoint', 'Yes — breakpoint chlorination oxidizes all chloramines'],
      ['Kills algae', 'Prevents when maintained; insufficient to cure', 'Yes — high-dose shock kills existing algae effectively'],
      ['pH impact', 'Minimal with proper dose', 'Cal-hypo raises pH significantly; always retest after']
    ],
    prosA: [
      'Maintains continuous sanitation protection at low FC levels',
      'Allows swimming at any time when FC is in the 1–3 ppm range',
      'Available in multiple convenient forms (liquid, tablets, granular)',
      'Lower cost per individual dose for ongoing maintenance',
      'Trichlor tablets provide slow, sustained release for consistent FC'
    ],
    consA: [
      'Cannot destroy existing chloramines — combined chlorine accumulates over time',
      'Insufficient to kill an established algae bloom',
      'Chloramines build up with repeated regular dosing without periodic shocking',
      'Trichlor tablets add CYA with every dose, potentially causing chlorine lock over time'
    ],
    prosB: [
      'Destroys chloramines through breakpoint chlorination — resets water quality',
      'High FC dose kills algae effectively when used in correct quantity',
      'Restores water clarity, freshness, and reduced odor after treatment',
      'Cal-hypo leaves no stabilizer residue — compatible with all pool types',
      'Non-chlorine shock (MPS) allows faster re-entry (20–30 minutes)'
    ],
    consB: [
      'Cannot be used as routine maintenance — too high an FC level for daily swimming',
      'Requires a wait period (8–24+ hours) before swimming after chlorine shock',
      'Cal-hypo raises pH, requiring acid correction after use',
      'Over-shocking is easy and expensive to recover from',
      'Must be stored carefully — calcium hypochlorite is a strong oxidizer'
    ],
    bestUseCases: [
      '<strong>Use regular chlorine:</strong> Daily/weekly maintenance; maintaining 1–3 ppm FC between shock events; routine tablet or liquid dosing',
      '<strong>Use shock:</strong> Weekly treatment events; after heavy rain or parties; when CC exceeds 0.5 ppm; when algae appears; when FC crashes to zero',
      '<strong>Both together:</strong> The optimal pool care routine uses regular chlorine for maintenance and scheduled shock for treatment — they serve different functions',
      '<strong>Use non-chlorine shock (MPS):</strong> After hot tub use when you want to re-enter quickly; as a regular oxidizer between chlorine shocks'
    ],
    verdict: 'Regular chlorine and pool shock are not alternatives — they are complementary parts of a complete pool care system. Use regular chlorine to maintain daily FC at 1–3 ppm, and shock weekly (or after events) to reach breakpoint and destroy accumulated chloramines. Pools maintained with only regular chlorine develop odor and water quality issues; pools managed with only shock have no consistent residual sanitizer.',
    relatedCalcs: [
      ['pool-shock-calculator.html', 'Pool Shock Calculator'],
      ['pool-chlorine-calculator.html', 'Pool Chlorine Calculator'],
      ['chemical-calculator.html', 'Full Chemical Calculator']
    ],
    relatedEntities: [
      ['reference/shock-treatment-explained.html', 'Shock Treatment Explained'],
      ['reference/chlorine-explained.html', 'Chlorine Explained']
    ]
  },

  {
    slug: 'free-chlorine-vs-total-chlorine.html',
    canonicalPath: '/comparisons/free-chlorine-vs-total-chlorine',
    title: 'Free Chlorine vs Total Chlorine: What\'s the Difference?',
    metaDesc: 'Free chlorine vs total chlorine explained: FC sanitizes, TC = FC + combined chlorine. How to interpret test results and when CC above 0.5 ppm requires action.',
    optionA: 'Free Chlorine (FC)',
    optionB: 'Total Chlorine (TC)',
    quickAnswer: 'Free chlorine (FC) is the active portion that sanitizes. Total chlorine (TC) = free + combined chlorine. Combined chlorine (CC = TC − FC) is spent chlorine that causes odor and irritation. Ideal: TC = FC with CC near zero. When CC exceeds 0.5 ppm, breakpoint shock is needed.',
    keyTakeaways: [
      'Free chlorine (FC) is the only form that actively kills bacteria and algae',
      'Total chlorine (TC) = Free Chlorine + Combined Chlorine',
      'Combined chlorine (CC = TC − FC) causes pool odor and eye irritation',
      'When CC exceeds 0.5 ppm, shock to 10× CC reading to eliminate chloramines'
    ],
    comparisonRows: [
      ['What it measures', 'Active, unreacted chlorine available to sanitize', 'All chlorine: free + combined (chloramines)'],
      ['Active sanitizer?', 'Yes — HOCl and OCl⁻ kill pathogens directly', 'No — TC is a total reading, not an activity measure'],
      ['Kills pathogens', 'Yes — this is its function', 'Combined chlorine fraction does NOT kill pathogens'],
      ['Causes odor/irritation', 'No — properly balanced FC has no harsh smell', 'Combined chlorine fraction causes odor and eye irritation'],
      ['Test target', '1–3 ppm (pools), 3–5 ppm (spas)', 'Ideally = FC; CC = TC − FC should be &lt;0.5 ppm'],
      ['How to measure', 'DPD test kit (shows FC specifically)', 'DPD test kit measures both FC and TC; OTO measures TC only'],
      ['When action needed', 'Below 1 ppm: add chlorine. Above 5 ppm: wait to swim', 'When TC significantly exceeds FC: breakpoint shock required']
    ],
    prosA: [
      'Directly measures what matters — active sanitizing power in the water',
      'Accurately reflects how much protection is present at any given moment',
      'DPD test kits for FC are widely available and accurate',
      'FC at 1–3 ppm provides consistent, reliable sanitation',
      'FC reading is the key input for chlorine dose calculations'
    ],
    consA: [
      'FC alone doesn\'t tell you about chloramine accumulation — always test TC too',
      'FC can read normal while CC is high and causing odor and irritation',
      'OTO test kits (common cheap yellow kits) measure TC, not FC — read carefully'
    ],
    prosB: [
      'Captures the full picture of chlorine in the water — free and combined together',
      'Combined with FC, allows calculation of combined chlorine (TC − FC = CC)',
      'Useful for diagnosing chloramine problems invisible in FC readings alone',
      'Required measurement for professional water quality compliance testing'
    ],
    consB: [
      'TC alone is not useful — you need both TC and FC to calculate CC',
      'OTO test kits only measure TC and cannot distinguish free from combined',
      'TC reading can be falsely reassuring — TC can be high while FC is zero',
      'Many pool owners confuse TC and FC, leading to incorrect dosing decisions'
    ],
    bestUseCases: [
      '<strong>Test FC to:</strong> Determine current sanitizing power; decide how much chlorine to add; confirm it\'s safe to swim after shocking',
      '<strong>Calculate CC from TC and FC to:</strong> Diagnose chloramine problems; determine shock dose (CC × 10 = minimum FC needed); explain odor and irritation',
      '<strong>For complete testing:</strong> Always measure both FC and TC with a DPD test kit; never rely on OTO (yellow/orange) kits for accurate pool chemistry management',
      '<strong>Shock when:</strong> CC = TC − FC exceeds 0.5 ppm; this is the standard trigger regardless of FC level'
    ],
    verdict: 'Free chlorine and total chlorine are measuring different things. FC tells you how much protection you have right now. TC − FC tells you how much chloramine contamination has built up. The ideal pool has TC = FC (no combined chlorine). When TC significantly exceeds FC, the pool needs breakpoint shock — raise FC to at least 10 times the CC reading to oxidize all chloramines.',
    relatedCalcs: [
      ['pool-shock-calculator.html', 'Pool Shock Calculator'],
      ['chemical-calculator.html', 'Full Chemical Calculator']
    ],
    relatedEntities: [
      ['reference/free-chlorine-explained.html', 'Free Chlorine Explained'],
      ['reference/combined-chlorine-explained.html', 'Combined Chlorine Explained']
    ]
  },

  {
    slug: 'liquid-chlorine-vs-tablets.html',
    canonicalPath: '/comparisons/liquid-chlorine-vs-tablets',
    title: 'Liquid Chlorine vs Chlorine Tablets: Which Is Better?',
    metaDesc: 'Liquid chlorine vs tablets: pH impact, CYA buildup, cost, speed, and SWG compatibility compared. When to use each for pools.',
    optionA: 'Liquid Chlorine',
    optionB: 'Chlorine Tablets (Trichlor)',
    quickAnswer: 'Liquid chlorine (sodium hypochlorite, ~10–12%) raises FC quickly and doesn\'t add stabilizer or lower pH aggressively. Trichlor tablets are convenient but slowly acidify water and raise CYA over time, eventually causing chlorine lock in outdoor pools. Use liquid for active treatment, tablets for routine maintenance.',
    keyTakeaways: [
      'Liquid chlorine adds no CYA and has minimal pH impact — safest for chemistry balance',
      'Trichlor tablets are highly convenient but consistently lower pH and raise CYA',
      'Over a full season, tablet use often requires CYA reduction via partial drain',
      'Liquid chlorine is preferred for salt water pools — tablets are incompatible with SWG'
    ],
    comparisonRows: [
      ['Form', '10–12% sodium hypochlorite solution', 'Solid trichloro-s-triazinetrione (90%+ available Cl₂)'],
      ['pH impact', 'Raises pH slightly (~11.0–12.0 product pH)', 'Lowers pH significantly (~pH 2.8–3.0 product pH)'],
      ['CYA impact', 'None — adds no stabilizer', 'Adds CYA with every dose (~54% CYA by weight)'],
      ['Speed of action', 'Immediate — dissolves and acts within minutes', 'Slow-dissolving — continuous gradual FC release'],
      ['Cost', 'Lower cost per unit chlorine; requires more frequent addition', 'More convenient; float dispensers require less monitoring'],
      ['SWG compatible', 'Yes — preferred for salt water pools', 'Never use in SWG pool — damages cell and chemistry'],
      ['Storage', 'Bulky; degrades in heat/sunlight; 1-year shelf life', 'Dry, stable storage; 5+ year shelf life if dry'],
      ['Best for', 'Active treatment; SWG pools; CYA control', 'Routine maintenance in non-SWG outdoor pools']
    ],
    prosA: [
      'No CYA accumulation — ideal for pools where CYA is already at or near target',
      'Immediate FC increase — useful when FC needs to be raised quickly',
      'Compatible with salt water pools and all pool types',
      'Raises pH slightly — partially offsets the acid additions needed for pH management',
      'Inexpensive per unit of available chlorine'
    ],
    consA: [
      'Bulky and heavy to handle — typically sold in 1-gallon jugs',
      'Shorter shelf life — degrades in sunlight and heat; replace annually',
      'Requires more frequent attention to maintain FC levels',
      'Raises pH slightly — still need to monitor and manage pH balance',
      'Less convenient for away travel or low-maintenance situations'
    ],
    prosB: [
      'Extremely convenient — float dispensers provide continuous slow-release FC',
      'Long shelf life — tablets remain effective for years when stored dry',
      'Cost-effective for low-effort routine maintenance',
      'Slow dissolution means fewer trips to the pool for dosing',
      'Effective CYA stabilizer source for pools starting the season with low CYA'
    ],
    consB: [
      'Consistently lowers pH — requires regular acid additions to counteract',
      'Adds CYA with every dose — over a season, CYA can reach 100+ ppm causing chlorine lock',
      'Absolutely incompatible with salt water pools (damages SWG electrolytic cell)',
      'Slow release means cannot quickly respond to FC crashes',
      'Not suitable for hot tubs — too acidifying for small spa volumes'
    ],
    bestUseCases: [
      '<strong>Use liquid chlorine:</strong> Salt water pools; pools where CYA is already at 50+ ppm; when you need to raise FC quickly; when you want precise control over pH and CYA',
      '<strong>Use trichlor tablets:</strong> Traditional outdoor pools during swim season; when CYA is starting below 30 ppm; float dispensers for convenient maintenance in well-established pools',
      '<strong>Avoid tablets:</strong> Salt water pools (never); hot tubs (too acidifying); pools with CYA already above 70 ppm',
      '<strong>Best combination:</strong> Use tablets for routine maintenance early in the season when CYA is low, then switch to liquid chlorine once CYA reaches 40–50 ppm to prevent further CYA accumulation'
    ],
    verdict: 'For most outdoor pools, a combination strategy works best: use trichlor tablets early in the season when CYA needs to be established, then transition to liquid chlorine once CYA reaches 40–50 ppm. For salt water pools, always use liquid chlorine — tablets are incompatible. For pools with CYA already at or near the limit, liquid chlorine is the only sensible choice for ongoing maintenance.',
    relatedCalcs: [
      ['pool-chlorine-calculator.html', 'Pool Chlorine Calculator'],
      ['pool-cyanuric-acid-calculator.html', 'Pool CYA Calculator'],
      ['chemical-calculator.html', 'Full Chemical Calculator']
    ],
    relatedEntities: [
      ['reference/chlorine-explained.html', 'Chlorine Explained'],
      ['reference/cyanuric-acid-explained.html', 'Cyanuric Acid Explained']
    ]
  },

  {
    slug: 'salt-water-pool-vs-chlorine-pool.html',
    canonicalPath: '/comparisons/salt-water-pool-vs-chlorine-pool',
    title: 'Salt Water Pool vs Chlorine Pool: Full Comparison',
    metaDesc: 'Salt water pool vs traditional chlorine pool: upfront cost, ongoing cost, water feel, chemistry management, pH behavior, and which is better for your situation.',
    optionA: 'Salt Water Pool (SWG)',
    optionB: 'Traditional Chlorine Pool',
    quickAnswer: 'Salt water pools use an electrolytic generator to produce chlorine from salt — the water still contains chlorine, just generated on-site. Salt water pools have lower operational cost after installation, gentler-feeling water, and consistent FC levels. Traditional chlorine pools have lower equipment cost and simpler chemistry.',
    keyTakeaways: [
      'Salt water pools still contain chlorine — the SWG converts salt to chlorine continuously',
      'Salt water feels softer and gentler; traditionally-chlorinated pools feel sharper',
      'SWG pools have higher upfront cost but lower ongoing chemical cost',
      'SWG pools require more frequent pH management — electrolysis raises pH faster'
    ],
    comparisonRows: [
      ['Chlorine source', 'Generated on-site from NaCl via electrolysis', 'Added manually: liquid, tablets, or granules'],
      ['Upfront equipment cost', '$800–$2,500+ for SWG unit + installation', 'Minimal — no special equipment needed'],
      ['Ongoing chemical cost', 'Low — salt ~$10/bag; electricity cost', 'Moderate — chlorine products, shock, CYA'],
      ['Water feel', 'Softer, silkier, gentler on skin/eyes', 'Standard chlorine pool feel; sharper at high FC'],
      ['pH behavior', 'Rises faster — electrolysis produces alkaline by-products', 'More stable; rises with CO2 off-gassing but slower'],
      ['Chemistry management', 'Same parameters; add acid more frequently', 'Standard chlorine management routine'],
      ['Cell maintenance', 'Clean cell every 3 months; replace every 3–7 years', 'No cell — simpler equipment maintenance'],
      ['CYA target', 'Slightly higher: 60–80 ppm', 'Standard: 30–50 ppm (outdoor pools)']
    ],
    prosA: [
      'Lower ongoing chemical costs once the system is paid off',
      'Continuous automated chlorine generation — less manual dosing',
      'Softer, more comfortable water feel for many swimmers',
      'Consistent FC levels without the spikes of manual chlorine additions',
      'Less handling of concentrated chlorine products'
    ],
    consA: [
      'High upfront equipment cost ($800–$2,500+) plus installation',
      'Salt cells require periodic cleaning and replacement (~$200–600 every 3–7 years)',
      'pH rises faster, requiring more frequent muriatic acid additions',
      'Higher electricity consumption for cell operation',
      'Slightly higher corrosion risk on metal fittings from salt environment'
    ],
    prosB: [
      'Low upfront cost — no special equipment required',
      'pH is more stable and easier to manage compared to SWG pools',
      'Simpler equipment — no cell to clean or replace',
      'Standard and well-understood chemistry management routine',
      'More flexible product options (liquid, tablets, granular)'
    ],
    consB: [
      'Requires purchasing and handling concentrated chlorine products regularly',
      'More manual effort to maintain consistent FC levels between doses',
      'Chlorine products cost more over time compared to salt',
      'FC levels can spike and crash without consistent monitoring and dosing',
      'Trichlor tablets can cause CYA accumulation over a season of use'
    ],
    bestUseCases: [
      '<strong>Choose salt water:</strong> New pool builds where the SWG cost can be planned upfront; households with multiple swimmers who prefer comfortable water; pools in direct sunlight where consistent FC is challenging to maintain manually',
      '<strong>Choose traditional chlorine:</strong> Existing pools where adding a SWG requires significant retrofit cost; smaller pools or hot tubs where manual dosing is manageable; situations where lower equipment complexity is preferred',
      '<strong>Either works:</strong> Chemistry parameters and water safety are equivalent in both systems when properly maintained',
      '<strong>Never mix:</strong> Trichlor tablets in an SWG pool — they damage the electrolytic cell and create rapid CYA accumulation'
    ],
    verdict: 'Salt water and traditional chlorine pools are equally capable of maintaining safe, clean water — the chemistry standards are identical. The choice is primarily about convenience and economics: SWG pools cost more to set up but less to operate over time, require more pH management but less product handling, and offer a softer water feel many swimmers prefer. If you\'re building a new pool, the SWG investment typically pays off within 3–5 years. If you have an existing pool, the retrofit cost may not justify switching.',
    relatedCalcs: [
      ['saltwater-pool-salt-calculator.html', 'Saltwater Pool Salt Calculator'],
      ['chemical-calculator.html', 'Full Chemical Calculator']
    ],
    relatedEntities: [
      ['reference/salt-water-generator-explained.html', 'Salt Water Generator Explained'],
      ['reference/chlorine-explained.html', 'Chlorine Explained'],
      ['salt-water-pool-chemical-levels-chart.html', 'Salt Water Pool Chemical Levels Chart']
    ]
  }

];

// ─────────────────────────────────────────────────────────────────────────────
// WRITE ALL FILES
// ─────────────────────────────────────────────────────────────────────────────

const dir = path.join(ROOT, 'comparisons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let written = 0;
for (const opts of comparisonPages) {
  const file = path.join(dir, opts.slug);
  fs.writeFileSync(file, html(opts), 'utf8');
  written++;
}

console.log('generate-comparison-pages: wrote ' + written + ' comparison pages');
