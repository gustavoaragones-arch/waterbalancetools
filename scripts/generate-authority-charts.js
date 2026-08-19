/**
 * Phase 6 — Chart Expansion: generate 5 new root-level chart pages.
 * Idempotent: overwrites to allow content updates.
 * Run: node scripts/generate-authority-charts.js
 */

'use strict';
const fs   = require('fs');
const path = require('path');
const { renderSourceList } = require('./chemistry/renderSources');

const ROOT = path.join(__dirname, '..');

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function faqSchema(items) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  });
}

function faqAccordion(items) {
  return items.map(([q, a]) =>
    '      <details class="paa-item">\n' +
    '        <summary>' + esc(q) + '</summary>\n' +
    '        <p>' + a + '</p>\n' +
    '      </details>'
  ).join('\n');
}

function chartHtml(opts) {
  const {
    slug, canonicalPath, title, metaDesc, ogDesc, h1,
    quickAnswer, keyTakeaways, tableHead, tableRows,
    faqItems, calcLinks, related, sourceIds
  } = opts;
  // Phase 7E.6: only rendered when this specific chart has an individually
  // reviewed, explicit source mapping (see AUTHORITY-CHART-PROVENANCE.md) --
  // charts without one render no citation block at all, rather than a
  // misleading generic one.
  const sourcesHtml = (sourceIds && sourceIds.length > 0) ? renderSourceList(sourceIds) : '';

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
  <meta property="og:description" content="${esc(ogDesc)}">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="style.css">
  <script type="application/ld+json">
  ${faqSchema(faqItems)}
  </script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3974004697476579" crossorigin="anonymous"></script>
</head>
<body class="calc-page">
  <header class="site-header">
    <a href="index.html" class="logo-link"><img src="assets/logo.svg" alt="WaterBalanceTools" class="logo" width="180" height="36"></a>
    <nav class="nav">
      <a href="calculators/chemical-calculator.html">Chemical Calculator</a>
      <a href="pool-chemical-levels-chart.html">Chemical Levels Chart</a>
      <a href="guides/pool-chemistry-basics.html">Chemistry Guide</a>
    </nav>
  </header>
  <main class="container guide-content">
    <h1>${esc(h1)}</h1>
    <section class="quick-answer">
      <h2>Quick Answer</h2>
      <p>${quickAnswer}</p>
    </section>
    <section class="key-takeaways">
      <ul>
${keyTakeaways.map(t => '        <li>' + t + '</li>').join('\n')}
      </ul>
    </section>
    <section class="chart-calc-crosslinks card">
      <h2>Calculate Your Levels</h2>
      <ul class="ring-links">
${calcLinks.map(([href, label]) => '        <li><a href="' + href + '">' + esc(label) + '</a></li>').join('\n')}
      </ul>
    </section>
    <h2>Reference table</h2>
    <table class="chart-table">
      <thead>
        <tr>${tableHead.map(h => '<th>' + h + '</th>').join('')}</tr>
      </thead>
      <tbody>
${tableRows.map(row => '        <tr>' + row.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('\n')}
      </tbody>
    </table>
    ${sourcesHtml}
    <section class="people-also-ask">
      <h2>Frequently Asked Questions</h2>
      <div class="paa-accordion">
${faqAccordion(faqItems)}
      </div>
    </section>
    <section class="card serp-cta">
      <h2>Calculate your dose</h2>
${calcLinks.map(([href, label]) => '      <p><a href="' + href + '" class="btn btn-primary">' + esc(label) + '</a></p>').join('\n')}
      <p>Also see: ${related.map(([href, label]) => '<a href="' + href + '">' + esc(label) + '</a>').join(' · ')}</p>
    </section>
    <div class="ad ad-bottom"><!-- AdSense --></div>
    <p class="updated">Last updated: June 2026</p>
  </main>
  <footer class="site-footer">
    <nav class="footer-nav">
      <a href="calculators/pool-volume-calculator.html">Pool Volume Calculator</a>
      <a href="calculators/pool-chlorine-calculator.html">Pool Chlorine Calculator</a>
      <a href="calculators/pool-shock-calculator.html">Pool Shock Calculator</a>
      <a href="calculators/pool-ph-calculator.html">Pool pH Calculator</a>
      <a href="pool-chemical-levels-chart.html">Chemical Levels Chart</a>
      <a href="pool-chlorine-levels-chart.html">Chlorine Levels Chart</a>
      <a href="legal/ownership.html">Ownership</a>
      <a href="legal/legal.html">Legal</a>
    </nav>
    <p class="footer-copy">&copy; WaterBalanceTools.com</p>
  </footer>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHART DATA
// ─────────────────────────────────────────────────────────────────────────────

const charts = [

  {
    slug: 'pool-cya-levels-chart.html',
    canonicalPath: '/pool-cya-levels-chart',
    title: 'Pool CYA (Cyanuric Acid) Levels Chart',
    metaDesc: 'Pool CYA levels chart: ideal range 30–50 ppm, what is too high, and how CYA affects chlorine effectiveness. Quick reference table.',
    ogDesc: 'CYA 30–50 ppm is ideal for outdoor pools. Too high locks chlorine; too low causes FC to degrade in sunlight.',
    h1: 'Pool CYA (Cyanuric Acid) Levels Chart',
    quickAnswer: 'Ideal cyanuric acid (CYA or stabilizer) for outdoor pools is 30–50 ppm. CYA protects chlorine from UV degradation. Above 100 ppm, CYA locks up chlorine and makes it largely ineffective — a condition called "chlorine lock." The only remedy for very high CYA is dilution.',
    keyTakeaways: [
      'CYA 30–50 ppm is the standard for outdoor chlorine pools',
      'Below 20 ppm: FC degrades in direct sunlight within hours',
      'Above 80 ppm: chlorine effectiveness drops significantly',
      'Above 100 ppm: partial drain and refill is the only fix'
    ],
    tableHead: ['CYA level', 'Status', 'Effect on chlorine', 'Action'],
    tableRows: [
      ['0–20 ppm', 'Too low', 'FC lost to UV in hours', 'Add stabilizer (cyanuric acid granules)'],
      ['20–30 ppm', 'Low', 'Moderate UV protection', 'Add stabilizer if outdoor pool'],
      ['30–50 ppm', 'Ideal', 'Good UV protection', 'None — maintain range'],
      ['50–80 ppm', 'Acceptable', 'Slight reduction in effectiveness', 'Monitor; avoid adding more stabilizer'],
      ['80–100 ppm', 'High', 'Noticeable chlorine lock', 'Partial drain (20–30%) and refill'],
      ['&gt; 100 ppm', 'Chlorine lock', 'FC mostly inactive', 'Drain 30–50% and refill; rebalance']
    ],
    faqItems: [
      ['What is CYA in a pool?', 'CYA stands for cyanuric acid, also called stabilizer or conditioner. It bonds loosely with free chlorine and protects it from being destroyed by ultraviolet light. Outdoor pools need 30–50 ppm CYA; indoor pools typically need none.'],
      ['What happens if CYA is too high?', 'Above 80–100 ppm, CYA over-stabilizes chlorine so that it cannot oxidize bacteria and algae effectively. This is sometimes called "chlorine lock." Adding more chlorine will not help. The only fix is dilution — partial drain and refill.'],
      ['How do I raise CYA in my pool?', 'Add granular cyanuric acid (stabilizer) through the skimmer or in a stocking held in front of a return jet. It dissolves slowly — allow 24–48 hours and retest. Add incrementally to avoid overshoot.'],
      ['Do salt water pools need CYA?', 'Yes. Salt water chlorine generators produce unstabilized chlorine (same as liquid chlorine) that degrades rapidly in sunlight. Most SWG pools run CYA at 60–80 ppm for efficient generator performance.']
    ],
    calcLinks: [
      ['calculators/chemical-calculator.html', 'Pool Chemical Calculator'],
      ['calculators/pool-cyanuric-acid-calculator.html', 'CYA Calculator']
    ],
    related: [
      ['pool-chemical-levels-chart.html', 'Pool Chemical Levels Chart'],
      ['pool-chlorine-levels-chart.html', 'Chlorine Levels Chart']
    ]
  },

  {
    slug: 'pool-alkalinity-levels-chart.html',
    canonicalPath: '/pool-alkalinity-levels-chart',
    title: 'Pool Alkalinity Levels Chart',
    metaDesc: 'Pool total alkalinity levels chart: ideal 80–120 ppm. What happens if low or high, and how alkalinity affects pH stability.',
    ogDesc: 'Total alkalinity 80–120 ppm buffers pH in pools. Too low causes pH swings; too high makes pH drift upward.',
    h1: 'Pool Alkalinity Levels Chart',
    quickAnswer: 'Ideal total alkalinity (TA) for most pools is 80–120 ppm. TA acts as a pH buffer — low TA causes rapid pH swings, while high TA causes pH to drift upward and resist downward correction. Always adjust TA before making pH adjustments.',
    keyTakeaways: [
      'Total alkalinity 80–120 ppm is the standard target for most pool types',
      'Low TA (below 60 ppm) causes pH to bounce erratically',
      'High TA (above 150 ppm) causes pH to drift up and resist acid corrections',
      'Always fix TA before adjusting pH for more stable, lasting results'
    ],
    tableHead: ['TA level', 'Status', 'Effect', 'Action'],
    tableRows: [
      ['&lt; 60 ppm', 'Too low', 'pH swings; corrosion risk', 'Add sodium bicarbonate (baking soda)'],
      ['60–80 ppm', 'Low', 'Some pH instability', 'Add bicarb; retest after 24 h'],
      ['80–120 ppm', 'Ideal', 'pH stable and buffered', 'None — maintain range'],
      ['120–150 ppm', 'Elevated', 'pH drifts upward', 'Add muriatic acid in small doses'],
      ['150–200 ppm', 'High', 'pH very resistant to correction; scale risk', 'Lower with acid; aerate to restore pH'],
      ['&gt; 200 ppm', 'Very high', 'Severe pH drift; cloudy water; scale', 'Partial drain + refill + rebalance']
    ],
    faqItems: [
      ['What is total alkalinity in a pool?', 'Total alkalinity measures the concentration of alkaline substances (mainly bicarbonates and carbonates) dissolved in pool water. These substances neutralize acid, preventing wild pH swings. It is measured in ppm (parts per million) with a test kit.'],
      ['How do I raise pool alkalinity?', 'Add sodium bicarbonate (baking soda). Use 1.5 lb per 10,000 gallons to raise TA by approximately 10 ppm. Broadcast it across the pool with the pump running, and retest after 24 hours.'],
      ['How do I lower pool alkalinity?', 'Add muriatic acid (pH reducer) directly in front of a return jet with the pump running. After adding, run jets or aerate with the cover off to allow CO2 to escape and let pH recover naturally. Repeat as needed over several days.'],
      ['Does alkalinity affect chlorine?', 'Yes indirectly. High alkalinity keeps pH elevated, which reduces chlorine effectiveness. Low alkalinity allows pH to drop, which is corrosive and also affects sanitizer balance. Correct TA first, then pH, then chlorine for best results.']
    ],
    calcLinks: [
      ['calculators/chemical-calculator.html', 'Pool Chemical Calculator'],
      ['calculators/pool-alkalinity-calculator.html', 'Alkalinity Calculator']
    ],
    related: [
      ['pool-chemical-levels-chart.html', 'Pool Chemical Levels Chart'],
      ['pool-ph-levels-chart.html', 'pH Levels Chart']
    ],
    // Phase 7E.6: only the ranges this chart states that were individually
    // confirmed against a real source in AUTHORITY-CHART-PROVENANCE.md --
    // the 80-120 ppm figure specifically, not every number on the page.
    sourceIds: ['phta-total-alkalinity-fact-sheet']
  },

  {
    slug: 'hot-tub-chlorine-levels-chart.html',
    canonicalPath: '/hot-tub-chlorine-levels-chart',
    title: 'Hot Tub Chlorine Levels Chart',
    metaDesc: 'Hot tub chlorine levels chart: ideal 3–5 ppm, safe swim threshold, what too high and too low means for health and equipment.',
    ogDesc: 'Hot tub FC should be 3–5 ppm. Higher is unsafe; lower allows bacteria. Full reference table and dosing guide.',
    h1: 'Hot Tub Chlorine Levels Chart',
    quickAnswer: 'Ideal free chlorine (FC) for hot tubs and spas is 3–5 ppm. At high temperatures (100–104 °F) bacteria multiply faster than in pools, requiring higher sanitizer levels. Below 1 ppm is unsafe; above 10 ppm causes irritation and you should wait before soaking.',
    keyTakeaways: [
      'Hot tubs require 3–5 ppm FC — higher than pools — due to elevated temperatures',
      'Below 1 ppm FC at spa temperatures creates health risks rapidly',
      'Test FC before every soak, not just weekly',
      'Dichlor granules are the standard product for hot tub chlorination'
    ],
    tableHead: ['FC level', 'Status', 'Health note', 'Action'],
    tableRows: [
      ['0 ppm', 'Critical', 'No sanitation — bacteria risk', 'Add dichlor immediately; do not enter'],
      ['&lt; 1 ppm', 'Too low', 'Bacteria can grow at spa temps', 'Add chlorine; test before soaking'],
      ['1–2 ppm', 'Low', 'Marginal for hot water', 'Add chlorine to reach 3 ppm'],
      ['3–5 ppm', 'Ideal', 'Safe, effective sanitation', 'None — maintain range'],
      ['5–10 ppm', 'High', 'Irritation possible', 'Remove cover; run jets; retest'],
      ['&gt; 10 ppm', 'Too high — do not enter', 'Significant irritation risk', 'Aerate; dilute; drain partial if &gt;20 ppm']
    ],
    faqItems: [
      ['What is the ideal chlorine level for a hot tub?', 'The ideal free chlorine for a hot tub is 3–5 ppm. Higher water temperatures (100–104 °F) increase sanitizer demand, so hot tubs need more chlorine than swimming pools. Test before every soak.'],
      ['Can hot tub chlorine levels be too high?', 'Yes. FC above 10 ppm causes skin and eye irritation and should not be used for soaking. High FC occurs most often after shocking or over-adding dichlor. Remove the cover, run jets, and retest after 30–60 minutes.'],
      ['Does bromine work better than chlorine in hot tubs?', 'Bromine is more stable at high temperatures and a pH of 7.0–7.8, making it a popular choice for hot tubs. However, chlorine (dichlor) is widely used and effective. The choice is personal preference — both sanitize effectively when dosed correctly.'],
      ['How often should I test hot tub chlorine?', 'Test before every use, and at minimum every 2–3 days even when not in use. Hot tub water loses chlorine faster than pool water due to high temperatures, small volume, and jet aeration.']
    ],
    calcLinks: [
      ['calculators/hot-tub-chlorine-calculator.html', 'Hot Tub Chlorine Calculator'],
      ['calculators/hot-tub-chlorine-calculator.html', 'Hot Tub Chlorine Calculator']
    ],
    related: [
      ['pool-chemical-levels-chart.html', 'Pool Chemical Levels Chart'],
      ['hot-tub-chemical-levels-chart.html', 'Hot Tub Chemical Levels Chart (detailed)']
    ],
    // Phase 7E.6: the 3-5 ppm FC target specifically -- confirmed against
    // CDC guidance in AUTHORITY-CHART-PROVENANCE.md.
    sourceIds: ['cdc-healthy-swimming-home-treatment']
  },

  {
    slug: 'hot-tub-chemical-levels-chart.html',
    canonicalPath: '/hot-tub-chemical-levels-chart',
    title: 'Hot Tub Chemical Levels Chart (All Parameters)',
    metaDesc: 'Hot tub chemical levels chart: ideal chlorine, pH, alkalinity, and calcium hardness ranges for spas, plus CDC guidance on cyanuric acid. Quick reference table + FAQ.',
    ogDesc: 'One-page hot tub chemistry reference. Ideal ranges for chlorine, pH, TA, and calcium hardness -- plus why CDC recommends against cyanuric acid in hot tubs.',
    h1: 'Hot Tub Chemical Levels Chart',
    // Corrected Phase 7F.1 (see reports/phase-7f-1/HOT-TUB-CYA-DECISION.md):
    // the prior "CYA 30-50 ppm (if using unstabilized chlorine)" wording
    // was internally inconsistent (unstabilized chlorine does not carry
    // CYA) and conflicted with CDC guidance against using cyanuric acid /
    // stabilized chlorine in hot tubs at all -- confirmed via chemistry
    // -ranges.js range-cya-hottub (SUPPORTED, cdc-healthy-swimming-home
    // -treatment) and independently corroborated by live research showing
    // CYA substantially slows pathogen (e.g. Pseudomonas aeruginosa) kill
    // time in hot tub conditions.
    quickAnswer: 'Ideal hot tub chemical levels: free chlorine 3–5 ppm, pH 7.2–7.8, total alkalinity 80–120 ppm, calcium hardness 150–250 ppm. CDC recommends against using cyanuric acid or stabilized chlorine products in hot tubs. Hot tubs require closer monitoring than pools because small water volume means chemicals shift faster.',
    keyTakeaways: [
      'Hot tub FC target (3–5 ppm) is higher than pools due to elevated temperature',
      'pH range for spas is 7.2–7.8 — slightly wider than pools',
      'Calcium hardness matters: too low damages the shell; too high causes scale',
      'Test all parameters every 2–3 days and always before soaking'
    ],
    tableHead: ['Parameter', 'Ideal range', 'Too low', 'Too high'],
    tableRows: [
      ['Free chlorine', '3–5 ppm', 'Bacteria/algae risk', 'Irritation; wait before soaking'],
      ['pH', '7.2–7.8', 'Corrosion; chlorine unstable', 'Chlorine ineffective; scale'],
      ['Total alkalinity', '80–120 ppm', 'pH swings', 'pH drift upward; cloudy water'],
      ['Calcium hardness', '150–250 ppm', 'Etching of shell/plumbing', 'Scale on heater and surfaces'],
      ['Cyanuric acid', 'Not recommended', 'N/A', 'CDC advises against CYA/stabilized chlorine in hot tubs — it slows pathogen kill time'],
      ['Total dissolved solids', '&lt; 1,500 ppm above fill', '—', 'Foamy, dull water; drain and refill']
    ],
    faqItems: [
      ['How often should I test hot tub water chemistry?', 'Test free chlorine and pH before every use, and at minimum every 2–3 days when the tub is idle. Test alkalinity and calcium hardness weekly or whenever problems appear.'],
      ['How do I balance a hot tub step by step?', 'Start with total alkalinity (target 80–120 ppm), then adjust pH (7.2–7.8), then sanitizer level (3–5 ppm FC). Test calcium hardness monthly and adjust if below 150 or above 300 ppm. Change water completely every 3–4 months.'],
      ['How often should hot tub water be changed?', 'Most hot tub manufacturers recommend a full water change every 3–4 months for a regularly-used spa. Divide the spa volume (gallons) by the number of daily bather-hours to estimate timing — more users means more frequent changes.'],
      ['Can I use pool chlorine in a hot tub?', 'Liquid chlorine (sodium hypochlorite) and unstabilized granular chlorine are sometimes used, but dichlor (sodium dichloro-s-triazinetrione) is the most practical hot tub sanitizer as it dissolves quickly and contributes slight stabilizer. Trichlor tablets are not recommended for hot tubs — they are highly acidic and can damage spa components.']
    ],
    calcLinks: [
      ['calculators/hot-tub-chlorine-calculator.html', 'Hot Tub Chlorine Calculator'],
      ['calculators/hot-tub-chlorine-calculator.html', 'Hot Tub Chlorine Calculator']
    ],
    related: [
      ['pool-chemical-levels-chart.html', 'Pool Chemical Levels Chart'],
      ['hot-tub-chlorine-levels-chart.html', 'Hot Tub Chlorine Levels Chart']
    ]
  },

  {
    slug: 'salt-water-pool-chemical-levels-chart.html',
    canonicalPath: '/salt-water-pool-chemical-levels-chart',
    title: 'Salt Water Pool Chemical Levels Chart',
    metaDesc: 'Salt water pool chemical levels chart: ideal salt ppm, chlorine, pH, TA, CYA, and calcium. SWG-specific targets and maintenance guide.',
    ogDesc: 'Salt water pools need 2,700–3,400 ppm salt plus balanced chlorine, pH, and CYA. See all parameters in one chart.',
    h1: 'Salt Water Pool Chemical Levels Chart',
    quickAnswer: 'A salt water pool should maintain salt levels of 2,700–3,400 ppm, free chlorine 1–3 ppm, pH 7.2–7.6, total alkalinity 80–120 ppm, CYA 60–80 ppm, and calcium hardness 200–400 ppm. Salt water pools produce chlorine via electrolysis — the chemistry is the same as regular pools, just generated on-site.',
    keyTakeaways: [
      'Salt water pools still require balanced chlorine, pH, alkalinity, and CYA',
      'Ideal salt level for most SWG systems is 2,700–3,400 ppm (check your generator)',
      'SWG systems produce alkaline by-products, so pH tends to rise faster — monitor closely',
      'CYA is essential for SWG pools: 60–80 ppm protects chlorine from UV'
    ],
    tableHead: ['Parameter', 'Ideal range', 'Notes'],
    tableRows: [
      ['Salt (NaCl)', '2,700–3,400 ppm', 'Confirm target with your SWG manual'],
      ['Free chlorine', '1–3 ppm', 'Same target as traditional chlorine pools'],
      ['pH', '7.2–7.6', 'SWG raises pH faster; check 3×/week'],
      ['Total alkalinity', '80–120 ppm', 'Lower end (80–100) reduces pH drift'],
      ['Cyanuric acid (CYA)', '60–80 ppm', 'SWG pools benefit from higher CYA vs trichlor pools'],
      ['Calcium hardness', '200–400 ppm', 'Low CH corrodes SWG cell; high causes scale'],
      ['Total dissolved solids', 'Varies', 'Monitor cell efficiency; flush cell annually']
    ],
    faqItems: [
      ['What salt level should a salt water pool have?', 'Most residential salt water chlorine generators are designed to operate at 2,700–3,400 ppm salt. Check your generator\'s manual for the exact target — running too low reduces chlorine output; too high can damage the cell and equipment.'],
      ['Do salt water pools still need chlorine?', 'Yes. A salt water pool generates chlorine on-site via electrolysis. The water chemistry is essentially the same as a traditional chlorine pool — you still need to test and manage free chlorine, pH, alkalinity, and CYA. The difference is convenience, not the chemistry.'],
      ['Is the pH harder to manage in a salt water pool?', 'Yes. Salt water chlorine generators produce a slightly alkaline by-product (sodium hydroxide) as a side effect of electrolysis, causing pH to drift upward more quickly than in traditional chlorine pools. Add muriatic acid regularly to maintain pH 7.2–7.6.'],
      ['Does rain affect a salt water pool more than a regular pool?', 'The effects are similar — dilution lowers all chemical levels including chlorine, pH, and alkalinity. However, in a salt water pool, heavy rain also lowers salt concentration, potentially reducing the generator\'s chlorine output until salt is replenished.']
    ],
    calcLinks: [
      ['calculators/saltwater-pool-salt-calculator.html', 'Saltwater Salt Calculator'],
      ['calculators/chemical-calculator.html', 'Pool Chemical Calculator']
    ],
    related: [
      ['pool-chemical-levels-chart.html', 'Pool Chemical Levels Chart'],
      ['pool-chlorine-levels-chart.html', 'Chlorine Levels Chart'],
      ['pool-cya-levels-chart.html', 'CYA Levels Chart']
    ]
  }

];

// ─────────────────────────────────────────────────────────────────────────────

let written = 0;
for (const opts of charts) {
  const file = path.join(ROOT, opts.slug);
  fs.writeFileSync(file, chartHtml(opts), 'utf8');
  written++;
}
console.log('generate-authority-charts: wrote ' + written + ' chart pages');
