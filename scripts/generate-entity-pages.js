/**
 * Phase 7 — Entity Reference Pages: 8 DefinedTerm + FAQPage authority pages.
 * Writes to reference/ folder. Idempotent — overwrites on each run.
 * Run: node scripts/generate-entity-pages.js
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = '../'; // depth-1 from root (reference/ folder)

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function breadcrumbSchema(canonicalPath, title) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://waterbalancetools.com/' },
      { '@type': 'ListItem', position: 2, name: 'Reference', item: 'https://waterbalancetools.com/reference/pool-chemistry-reference' },
      { '@type': 'ListItem', position: 3, name: title, item: 'https://waterbalancetools.com' + canonicalPath }
    ]
  });
}

function definedTermSchema(name, description) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name,
    description,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Pool Chemistry Glossary',
      url: 'https://waterbalancetools.com/pool-chemistry-system'
    }
  });
}

function faqPageSchema(faqs) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a }
    }))
  });
}

function faqItems(items) {
  return items.map(([q, a]) =>
    '      <details class="paa-item">\n' +
    '        <summary>' + esc(q) + '</summary>\n' +
    '        <p>' + a + '</p>\n' +
    '      </details>'
  ).join('\n');
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
    definedTermName, definedTermDesc,
    quickAnswer, keyTakeaways,
    whatIs, whyItMatters,
    idealRangeRows, tooLowRows, tooHighRows,
    relatedCalcs, relatedCharts, relatedGuides,
    faqs
  } = opts;

  const crumbSchema   = breadcrumbSchema(canonicalPath, title);
  const dtSchema      = definedTermSchema(definedTermName, definedTermDesc);
  const faqSchema     = faqPageSchema(faqs);

  const calcLinks = relatedCalcs.map(([href, label]) =>
    '        <li><a href="' + BASE + 'calculators/' + href + '">' + esc(label) + '</a></li>'
  ).join('\n');

  const chartLinks = relatedCharts.map(([href, label]) =>
    '        <li><a href="' + BASE + href + '">' + esc(label) + '</a></li>'
  ).join('\n');

  const guideLinks = relatedGuides.map(([href, label]) =>
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
  <script type="application/ld+json">
  ${dtSchema}
  </script>
  <script type="application/ld+json">
  ${faqSchema}
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
    <h2>What Is ${esc(definedTermName)}</h2>
    <p>${whatIs}</p>
    <h2>Why It Matters</h2>
    <p>${whyItMatters}</p>
    <h2>Ideal Range</h2>
    <table class="chart-table">
      <thead>
${tableRowsTh(['Parameter', 'Value', 'Notes'])}
      </thead>
      <tbody>
${tableRows(idealRangeRows)}
      </tbody>
    </table>
    <h2>Symptoms When Too Low</h2>
    <table class="chart-table">
      <thead>
${tableRowsTh(['Symptom', 'What It Means', 'Fix'])}
      </thead>
      <tbody>
${tableRows(tooLowRows)}
      </tbody>
    </table>
    <h2>Symptoms When Too High</h2>
    <table class="chart-table">
      <thead>
${tableRowsTh(['Symptom', 'What It Means', 'Fix'])}
      </thead>
      <tbody>
${tableRows(tooHighRows)}
      </tbody>
    </table>
    <h2>Related Calculators</h2>
    <ul class="ring-links">
${calcLinks}
    </ul>
    <h2>Related Charts</h2>
    <ul class="ring-links">
${chartLinks}
    </ul>
    <h2>Related Guides</h2>
    <ul class="ring-links">
${guideLinks}
    </ul>
    <section class="people-also-ask">
      <h2>Frequently Asked Questions</h2>
      <div class="paa-accordion">
${faqItems(faqs)}
      </div>
    </section>
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
// ENTITY PAGE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const entityPages = [

  {
    slug: 'chlorine-explained.html',
    canonicalPath: '/reference/chlorine-explained',
    title: 'Chlorine in Pools Explained',
    metaDesc: 'Chlorine in pools explained: free chlorine vs combined chlorine vs total chlorine, ideal ranges 1–3 ppm, what causes it to drop, and how to maintain it.',
    definedTermName: 'Chlorine',
    definedTermDesc: 'Chlorine is a chemical sanitizer used in swimming pools to kill bacteria, algae, and other pathogens. In pool water, chlorine exists as free chlorine (active) and combined chlorine (spent). The ideal free chlorine range for pools is 1–3 ppm.',
    quickAnswer: 'Chlorine is the primary sanitizer in pool water. It exists in three forms: free chlorine (active sanitizer, target 1–3 ppm), combined chlorine (spent, ineffective chloramines), and total chlorine (the sum). Effective sanitation requires free chlorine in the safe range with pH between 7.2–7.6.',
    keyTakeaways: [
      'Free chlorine kills bacteria and algae; target 1–3 ppm for pools',
      'Combined chlorine above 0.5 ppm causes irritation and odor — shock to eliminate',
      'pH dramatically affects chlorine activity: at pH 8.0 only 20% is active',
      'Test free chlorine 2–3 times per week during swim season'
    ],
    whatIs: 'Chlorine is the most widely used sanitizer for swimming pools and hot tubs. When added to water, it forms hypochlorous acid (HOCl) and hypochlorite ions (OCl⁻) — together called free chlorine. Free chlorine is the active form that kills bacteria, viruses, and algae by oxidizing cell membranes and metabolic enzymes. As it does its job, it reacts with nitrogen compounds from bather waste to form chloramines (combined chlorine), which are ineffective at sanitizing.',
    whyItMatters: 'Without adequate free chlorine, a pool becomes a breeding ground for Pseudomonas, E. coli, Cryptosporidium, and algae within hours. Maintaining 1–3 ppm FC prevents illness, keeps water clear, and protects the pool surface and equipment. pH management is equally critical: at pH 7.4, about 60% of FC is in the active HOCl form; at pH 8.0, that drops to under 20%, making high-pH pools dangerous even when chlorine "levels" appear normal.',
    idealRangeRows: [
      ['Free chlorine', '1–3 ppm', 'Pools; spas need 3–5 ppm'],
      ['Total chlorine', 'Equal to FC', 'Combined chlorine (TC−FC) should be near zero'],
      ['Combined chlorine', '&lt;0.5 ppm', 'Above 0.5 ppm = shock required']
    ],
    tooLowRows: [
      ['No sanitation protection', 'Bacteria and algae multiply unchecked', 'Add chlorine dose per calculator; target 2–3 ppm FC'],
      ['Green or cloudy water', 'Algae bloom or bacterial contamination', 'Shock pool with double or triple dose; brush walls'],
      ['Algae growth on surfaces', 'FC insufficient to inhibit algae photosynthesis', 'Triple-dose shock; brush; run filter 24 h continuously']
    ],
    tooHighRows: [
      ['Eye and skin irritation', 'Excess HOCl irritates mucous membranes', 'Remove cover; aerate; partial dilution if above 20 ppm'],
      ['Bleaching of swimwear', 'High FC oxidizes fabric dyes rapidly', 'Keep swimmers out until FC drops below 5 ppm'],
      ['Strong chemical odor', 'Often combined chlorine, not excess FC — test CC', 'If CC &gt;0.5 ppm, shock; if FC &gt;20 ppm, dilute']
    ],
    relatedCalcs: [
      ['pool-chlorine-calculator.html', 'Pool Chlorine Calculator'],
      ['pool-shock-calculator.html', 'Pool Shock Calculator'],
      ['chemical-calculator.html', 'Full Chemical Calculator']
    ],
    relatedCharts: [
      ['pool-chlorine-levels-chart.html', 'Pool Chlorine Levels Chart'],
      ['pool-chemical-levels-chart.html', 'Pool Chemical Levels Chart']
    ],
    relatedGuides: [
      ['guides/chlorine/free-chlorine-vs-total-chlorine.html', 'Free Chlorine vs Total Chlorine Explained'],
      ['guides/chlorine/why-pool-wont-hold-chlorine.html', 'Why Pool Won\'t Hold Chlorine']
    ],
    faqs: [
      ['What is free chlorine vs total chlorine?', 'Free chlorine (FC) is the active portion that sanitizes — hypochlorous acid and hypochlorite ions. Total chlorine (TC) includes both FC and combined chlorine (CC). When your test reads TC = 2 ppm and FC = 2 ppm, CC is zero and the pool is well-sanitized. When TC exceeds FC by more than 0.5 ppm, you have a chloramine problem requiring shock.'],
      ['What causes chlorine to drop fast?', 'The main causes are UV light (without CYA stabilizer, outdoor pools lose 90% of FC in a few hours), heavy bather load (sweat, oils, and urine consume FC), algae growth (invisible early-stage algae consumes massive amounts of FC overnight), and high pH (above 7.8, chlorine is mostly inactive and effectively wasted).'],
      ['How do I add chlorine to a pool?', 'Add liquid chlorine (sodium hypochlorite) by pouring slowly near a return jet with the pump running. For granular chlorine, pre-dissolve in a bucket of water first to prevent bleaching the pool surface. Never mix chlorine products together. Add at dusk if possible to prevent UV degradation before the chlorine circulates.'],
      ['Why does pool chlorine smell so strong?', 'The classic "pool smell" is actually combined chlorine (chloramines), not free chlorine. It occurs when FC reacts with nitrogen from sweat, urine, and cosmetics. A properly balanced pool with near-zero combined chlorine has almost no odor. If you smell "chlorine," it\'s a sign the pool needs shocking — not that it has too much chlorine.'],
      ['Can chlorine hurt you?', 'At normal pool levels (1–3 ppm FC), chlorine is safe for healthy swimmers. High FC (above 10 ppm) can cause eye, skin, and respiratory irritation. Combined chlorine (chloramines) causes the eye redness, skin irritation, and respiratory issues many people incorrectly attribute to excess chlorine. Proper balance prevents discomfort.'],
      ['How often should I add chlorine?', 'In summer with active use, pools typically need chlorine every 2–3 days to maintain 1–3 ppm FC. Without CYA stabilizer outdoors, daily dosing may be needed. Hot tubs need chlorine before or after every soak. Use a calculator to determine the right dose for your pool volume and current FC reading.']
    ]
  },

  {
    slug: 'free-chlorine-explained.html',
    canonicalPath: '/reference/free-chlorine-explained',
    title: 'Free Chlorine Explained',
    metaDesc: 'Free chlorine explained: what it is, why it\'s the only active sanitizer, how pH affects it, target range 1–3 ppm, and how to test and maintain it.',
    definedTermName: 'Free Chlorine',
    definedTermDesc: 'Free chlorine is the active form of chlorine in pool water — hypochlorous acid (HOCl) and hypochlorite ion (OCl⁻) — that kills bacteria, algae, and pathogens. Target range is 1–3 ppm for pools.',
    quickAnswer: 'Free chlorine (FC) is the fraction of chlorine in pool water that is still active and available to sanitize. It consists of hypochlorous acid and hypochlorite ions. Target 1–3 ppm for pools and 3–5 ppm for hot tubs. FC depletes as it kills pathogens and reacts with organic matter.',
    keyTakeaways: [
      'FC is the ONLY form of chlorine that actively sanitizes',
      'pH determines what % of FC is hypochlorous acid — the strongest form',
      'UV light destroys FC in minutes without CYA stabilizer',
      'Test FC daily in hot weather or heavy use'
    ],
    whatIs: 'Free chlorine is the portion of total chlorine in pool water that remains unreacted and available to kill pathogens. It exists in two forms: hypochlorous acid (HOCl), which is the more potent and fast-acting sanitizer, and hypochlorite ion (OCl⁻), which is weaker. The ratio of HOCl to OCl⁻ is controlled by pH — lower pH produces more HOCl. FC is consumed as it kills bacteria and oxidizes organic matter, which is why it must be continuously maintained.',
    whyItMatters: 'Free chlorine is the single most important pool chemistry parameter. Without it, even perfectly balanced pH and alkalinity provide zero protection against bacteria, viruses, and algae. FC is consumed by bather load, sunlight (UV), organic debris, and chemical reactions. Maintaining 1–3 ppm at all times prevents waterborne illness, green water, and equipment damage from organic acid buildup.',
    idealRangeRows: [
      ['Free Chlorine (pools)', '1–3 ppm', 'Test 2–3 times per week in swim season'],
      ['Free Chlorine (hot tubs)', '3–5 ppm', 'Higher due to elevated temperature and bather load'],
      ['pH influence', '7.2–7.4', 'At this pH, ~60–70% of FC is active HOCl']
    ],
    tooLowRows: [
      ['Zero FC reading', 'No active sanitizer — bacteria can multiply in hours', 'Add chlorine immediately; target 2–3 ppm; investigate demand'],
      ['Green or dull water tint', 'Early algae growth consuming FC faster than added', 'Triple-dose shock; brush all surfaces; run filter 24 h'],
      ['Positive bacteria test', 'Pathogen growth in unprotected water', 'Shock to 10+ ppm FC; test before swimmers return']
    ],
    tooHighRows: [
      ['Eye and skin irritation', 'Excess HOCl irritates mucous membranes', 'Remove cover; aerate; wait for FC to drop below 5 ppm'],
      ['Bleaching of swimwear or hair', 'High FC oxidizes fabric dyes and hair proteins', 'Avoid pool until FC drops; dilute if above 20 ppm'],
      ['Off-gassing from pool surface', 'Excess chlorine volatilizing at high concentration', 'Run pump; expose to sunlight; allow natural reduction']
    ],
    relatedCalcs: [
      ['pool-chlorine-calculator.html', 'Pool Chlorine Calculator'],
      ['chemical-calculator.html', 'Full Chemical Calculator'],
      ['hot-tub-chlorine-calculator.html', 'Hot Tub Chlorine Calculator']
    ],
    relatedCharts: [
      ['pool-chlorine-levels-chart.html', 'Pool Chlorine Levels Chart'],
      ['hot-tub-chlorine-levels-chart.html', 'Hot Tub Chlorine Levels Chart']
    ],
    relatedGuides: [
      ['guides/chlorine/free-chlorine-vs-total-chlorine.html', 'Free Chlorine vs Total Chlorine Explained'],
      ['guides/chlorine/why-pool-wont-hold-chlorine.html', 'Why Pool Won\'t Hold Chlorine'],
      ['reference/combined-chlorine-explained.html', 'Combined Chlorine Explained']
    ],
    faqs: [
      ['What is the difference between free chlorine and total chlorine?', 'Free chlorine (FC) is the active, unreacted chlorine available to sanitize. Total chlorine (TC) = FC + combined chlorine (CC). Combined chlorine has already reacted with nitrogen waste and is no longer effective. A healthy pool has TC ≈ FC with CC near zero. When CC rises above 0.5 ppm, breakpoint shock is required.'],
      ['What is the ideal free chlorine level for pools?', 'The ideal FC range for pools is 1–3 ppm. Hot tubs should maintain 3–5 ppm because high water temperatures (100–104°F) accelerate bacteria growth. Competitive swimming pools often target 1–3 ppm but test more frequently. Levels above 5 ppm require swimmers to wait before entering.'],
      ['How does pH affect free chlorine?', 'pH controls the ratio of HOCl (strong) to OCl⁻ (weak) forms of FC. At pH 7.0, ~75% of FC is HOCl. At pH 7.6, ~50% is HOCl. At pH 8.0, less than 20% is in the active form. This is why a pool at pH 8.0 with 3 ppm FC effectively has less sanitizing power than a pool at pH 7.4 with 1.5 ppm FC.'],
      ['Why does free chlorine drop so fast in outdoor pools?', 'Without cyanuric acid (CYA) stabilizer, UV light from sunlight can destroy 90% of FC within a few hours. CYA forms a temporary bond with chlorine molecules that shields them from UV while still allowing them to react when pathogens are present. Maintain CYA at 30–50 ppm in all outdoor pools.'],
      ['What happens if free chlorine drops to zero?', 'A pool with zero FC has no active protection against bacteria, viruses, and algae. In warm water (above 80°F), algae can begin growing within hours. Add chlorine immediately — if the water is already visibly green or cloudy, perform a triple-dose shock treatment, brush all surfaces, and run the filter continuously until clear.'],
      ['How do I raise free chlorine quickly?', 'Use liquid chlorine (sodium hypochlorite, 10–12%) for the fastest increase — it dissolves instantly and begins working immediately. Granular calcium hypochlorite (cal-hypo shock) also acts quickly but must be pre-dissolved in water before adding. Pour near a return jet with the pump running. Retest after 2–4 hours.']
    ]
  },

  {
    slug: 'combined-chlorine-explained.html',
    canonicalPath: '/reference/combined-chlorine-explained',
    title: 'Combined Chlorine (Chloramines) Explained',
    metaDesc: 'Combined chlorine (chloramines) explained: what causes it, why it causes pool smell and eye irritation, the 0.5 ppm limit, and how to eliminate it with breakpoint shock.',
    definedTermName: 'Combined Chlorine',
    definedTermDesc: 'Combined chlorine, or chloramines, is the portion of pool chlorine that has reacted with nitrogen compounds (from sweat, urine, cosmetics). It is ineffective as a sanitizer and causes the characteristic pool smell and eye irritation. Target: below 0.5 ppm.',
    quickAnswer: 'Combined chlorine is spent chlorine — the part that has already reacted with nitrogen waste and is no longer an active sanitizer. It causes the "pool smell," eye irritation, and skin rash. Target combined chlorine below 0.5 ppm. Eliminate it with breakpoint shock (raise FC to 10× the combined chlorine reading).',
    keyTakeaways: [
      'Combined chlorine (CC) = Total chlorine − Free chlorine; target CC below 0.5 ppm',
      'The "pool smell" is chloramines, not excess free chlorine — CC is the warning sign',
      'CC above 0.5 ppm requires breakpoint chlorination: FC raised to 10× the CC reading',
      'Bather hygiene (showering before swimming) dramatically reduces combined chlorine formation'
    ],
    whatIs: 'Combined chlorine (CC), commonly called chloramines, forms when free chlorine reacts with nitrogenous compounds from bather waste — primarily sweat, urine, sunscreen, and cosmetics. The resulting compounds (monochloramines, dichloramines, trichloramines) are far less effective at killing pathogens than free chlorine. They persist in water, accumulate over time, and are responsible for the characteristic "swimming pool" odor, eye redness, and skin irritation that many people incorrectly attribute to "too much chlorine."',
    whyItMatters: 'High combined chlorine is both a sanitation failure and a comfort problem. Chloramines provide minimal disinfection while consuming space in the total chlorine budget. They cause eye irritation, respiratory issues, skin rash, and the unmistakable chemical smell. In indoor pools, trichloramines off-gas into the air, creating a toxic atmosphere with prolonged exposure. Maintaining CC below 0.5 ppm through regular shock treatments is essential for swimmer comfort and water quality.',
    idealRangeRows: [
      ['Combined Chlorine (CC)', '&lt;0.5 ppm', 'Above 0.5 ppm requires breakpoint shock'],
      ['Free Chlorine (FC)', '1–3 ppm', 'FC must substantially exceed CC for proper sanitation'],
      ['Total Chlorine (TC)', 'Equal to FC', 'TC = FC when CC is near zero (ideal state)']
    ],
    tooLowRows: [
      ['CC near zero (ideal)', 'No chloramines present — excellent water quality', 'Maintain FC at 1–3 ppm; shower before swimming'],
      ['CC = 0 with low FC', 'All chlorine depleted — zero protection', 'Add chlorine immediately; target 2–3 ppm FC'],
      ['CC = 0 with water odor', 'Odor from other source (algae, sulfur, biofilm)', 'Test for other contaminants; consider draining hot tub']
    ],
    tooHighRows: [
      ['Strong chemical / pool odor', 'Chloramine off-gassing — classic warning sign', 'Shock to breakpoint: FC = 10× CC reading'],
      ['Eye redness and irritation', 'Chloramines irritate conjunctiva and mucous membranes', 'Do not swim; shock pool; test after 24 hours'],
      ['Cloudy or dull water', 'Chloramine haze combined with organic contamination', 'Shock, filter, and brush; consider partial drain for spas']
    ],
    relatedCalcs: [
      ['pool-shock-calculator.html', 'Pool Shock Calculator'],
      ['chemical-calculator.html', 'Full Chemical Calculator']
    ],
    relatedCharts: [
      ['pool-chlorine-levels-chart.html', 'Pool Chlorine Levels Chart']
    ],
    relatedGuides: [
      ['guides/chlorine/free-chlorine-vs-total-chlorine.html', 'Free Chlorine vs Total Chlorine Explained'],
      ['guides/chlorine/why-pool-chlorine-disappears-overnight.html', 'Why Pool Chlorine Disappears Overnight'],
      ['reference/chlorine-explained.html', 'Chlorine in Pools Explained']
    ],
    faqs: [
      ['What is combined chlorine and how does it form?', 'Combined chlorine (CC) forms when free chlorine reacts with nitrogen-containing compounds — primarily sweat, urine, and body lotions from swimmers. The resulting chloramine compounds are ineffective sanitizers and cause the "pool smell," eye irritation, and skin rash. Every pool forms some combined chlorine; the goal is to keep it below 0.5 ppm through regular shocking.'],
      ['How do I calculate combined chlorine?', 'Combined chlorine = Total chlorine (TC) − Free chlorine (FC). If your test reads TC = 2.5 ppm and FC = 2.0 ppm, then CC = 0.5 ppm — right at the limit. A DPD drop-based test kit or digital photometer measures both FC and TC separately; the math gives you CC. OTO kits measure only total chlorine and cannot distinguish the types.'],
      ['What is the maximum acceptable combined chlorine level?', 'The standard limit is 0.5 ppm CC. Above this threshold, chloramines are detectably odorous and irritating. Regulatory standards for public pools in many jurisdictions set 0.4 ppm as the maximum. The fix is breakpoint chlorination — raising FC to at least 10 times the CC reading in a single shock dose.'],
      ['What causes high combined chlorine in a pool?', 'High CC is caused by inadequate free chlorine relative to nitrogen load from bathers. Heavy use (parties, swim meets), infrequent shocking, insufficient FC levels, and improper bather hygiene (swimming without showering) all increase CC formation rate. Ironically, a strong "pool smell" is evidence of too little effective chlorine, not too much.'],
      ['How do I eliminate combined chlorine (breakpoint chlorination)?', 'Raise FC to at least 10× the CC reading in a single shock treatment. For CC = 0.5 ppm, raise FC to 5 ppm minimum. For CC = 1 ppm, raise FC to 10 ppm. This oxidizes all chloramine compounds and drives CC to near zero. Use cal-hypo shock (65–73%) calculated for your pool volume with the shock calculator.'],
      ['Can combined chlorine make you sick?', 'Chloramines cause eye and skin irritation and respiratory irritation, particularly in indoor pools where they off-gas into the air. While not acutely toxic at typical pool levels, prolonged exposure to elevated chloramine concentrations (common in competitive indoor swimming facilities) is linked to asthma development in young swimmers. Maintaining CC below 0.5 ppm protects swimmer health.']
    ]
  },

  {
    slug: 'cyanuric-acid-explained.html',
    canonicalPath: '/reference/cyanuric-acid-explained',
    title: 'Cyanuric Acid (CYA / Stabilizer) Explained',
    metaDesc: 'Cyanuric acid (CYA) explained: how pool stabilizer protects chlorine from UV, ideal range 30–50 ppm, what chlorine lock is, and how to lower CYA.',
    definedTermName: 'Cyanuric Acid',
    definedTermDesc: 'Cyanuric acid (CYA), also called pool stabilizer or conditioner, protects free chlorine from UV degradation in outdoor pools. The ideal range is 30–50 ppm. Above 100 ppm, CYA over-stabilizes chlorine causing chlorine lock.',
    quickAnswer: 'Cyanuric acid (CYA) is a pool stabilizer that shields free chlorine from UV light degradation. Without CYA, outdoor pools lose nearly all their chlorine within a few hours of sunlight. Keep CYA at 30–50 ppm. Above 100 ppm causes chlorine lock — the only fix is dilution.',
    keyTakeaways: [
      'CYA protects outdoor pool chlorine from UV light; without it, FC is destroyed in hours',
      'Ideal range: 30–50 ppm for traditional pools; 60–80 ppm for salt water pools',
      'Above 100 ppm causes "chlorine lock" — FC is present but largely ineffective',
      'CYA does not break down naturally; the only way to lower it is partial drain and refill'
    ],
    whatIs: 'Cyanuric acid (CYA), also known as pool stabilizer or pool conditioner, is a heterocyclic organic compound that forms a weak, reversible bond with hypochlorous acid in pool water. This bond protects chlorine molecules from being immediately destroyed by UV radiation from sunlight, extending their effective life in outdoor pools dramatically. When chlorine encounters a pathogen or organic compound, the CYA bond breaks and releases the chlorine to do its sanitizing work, then CYA reforms the bond with remaining or newly-added chlorine.',
    whyItMatters: 'Without CYA, an outdoor pool can lose 75–90% of its free chlorine within 2–4 hours of direct sunlight, making maintenance both expensive and ineffective. CYA allows chlorine to last throughout the day rather than requiring constant re-dosing. However, excessive CYA creates the opposite problem — it binds chlorine so tightly that FC loses effectiveness even at high concentrations, a condition known as chlorine lock. Maintaining CYA in the 30–50 ppm range balances UV protection with chlorine availability.',
    idealRangeRows: [
      ['CYA (outdoor pools)', '30–50 ppm', 'Below 20 ppm: significant UV loss; above 80 ppm: reduced effectiveness'],
      ['CYA (salt water pools)', '60–80 ppm', 'Slightly higher to compensate for continuous SWG output'],
      ['CYA (indoor pools)', '0 ppm', 'No UV exposure; CYA unnecessary and may impair sanitization']
    ],
    tooLowRows: [
      ['Rapid FC loss during the day', 'UV destroys unprotected chlorine within hours of sunlight', 'Add stabilizer/conditioner; raise CYA to 30–50 ppm'],
      ['FC at zero by midday', 'Pool unprotected during peak swim hours', 'Add CYA immediately; also check for algae demand'],
      ['Frequent expensive chlorine dosing', 'Burning through chlorine due to UV degradation', 'Raise CYA once; chlorine consumption will drop significantly']
    ],
    tooHighRows: [
      ['Chlorine lock (FC ineffective despite normal readings)', 'CYA over-binds FC; effective sanitizer drops dramatically', 'Drain 30–50% of pool water; refill; rebalance all parameters'],
      ['Persistent algae despite normal FC', 'Chlorine present but too stabilized to kill algae', 'Partial drain to lower CYA; rebalance before shocking'],
      ['Test kit reads FC present but pool is green', 'CYA masks true FC availability from colorimetric tests', 'Drain and refill to lower CYA below 80 ppm']
    ],
    relatedCalcs: [
      ['pool-cyanuric-acid-calculator.html', 'Pool Cyanuric Acid Calculator'],
      ['chemical-calculator.html', 'Full Chemical Calculator']
    ],
    relatedCharts: [
      ['pool-cya-levels-chart.html', 'Pool CYA Levels Chart'],
      ['pool-chemical-levels-chart.html', 'Pool Chemical Levels Chart']
    ],
    relatedGuides: [
      ['guides/advanced/cya-stabilizer-explained.html', 'CYA Stabilizer Explained (Advanced)'],
      ['guides/edge-cases/high-cya-chlorine-lock.html', 'High CYA Chlorine Lock'],
      ['guides/chlorine/why-pool-wont-hold-chlorine.html', 'Why Pool Won\'t Hold Chlorine']
    ],
    faqs: [
      ['What is cyanuric acid and why do I need it?', 'Cyanuric acid (CYA) is a pool stabilizer that shields free chlorine from UV light degradation. Without it, outdoor pools lose up to 90% of FC in a few hours of direct sunlight. CYA forms a reversible bond with chlorine that protects it from UV while still allowing it to react with pathogens. Target 30–50 ppm for outdoor pools using traditional chlorine.'],
      ['How do I add cyanuric acid to my pool?', 'Add granular CYA directly to the skimmer with the pump running, or dissolve in a bucket of warm water first and pour slowly around the pool perimeter. CYA dissolves slowly — allow 24–48 hours for it to fully incorporate before testing. CYA levels rise slowly so avoid multiple additions close together. Never mix with other chemicals.'],
      ['What happens if CYA is too high?', 'Above 80–100 ppm, CYA begins to over-stabilize chlorine in a condition known as chlorine lock. FC tests as present but is largely unavailable to kill pathogens, algae can grow despite apparent normal FC levels, and test results become unreliable. The only solution is to drain 30–50% of pool water and refill — CYA does not degrade naturally.'],
      ['How much CYA should a salt water pool have?', 'Salt water pools typically benefit from slightly higher CYA — 60–80 ppm — because the continuous chlorine generation from the SWG can compensate for some efficiency loss from higher stabilizer levels. This range provides excellent UV protection. Above 80 ppm in a salt water pool still carries chlorine lock risk.'],
      ['Does CYA affect pool chemistry tests?', 'High CYA can cause interference with OTO-based test kits (yellow/orange colorimetric chlorine tests), producing inconsistent or low FC readings. Use DPD-based test kits (pink color scale) for accurate FC measurement in CYA-stabilized pools. Digital photometers provide the most reliable results when CYA is above 30 ppm.'],
      ['Can CYA build up in hot tubs?', 'Yes. Dichlor (sodium dichloro-s-triazinetrione), the standard hot tub sanitizer, contains about 54% CYA by weight. Every dose adds a small amount of stabilizer to the water. After months of dichlor use, CYA can accumulate to 100+ ppm — one reason hot tub water should be completely drained and replaced every 3–4 months.']
    ]
  },

  {
    slug: 'total-alkalinity-explained.html',
    canonicalPath: '/reference/total-alkalinity-explained',
    title: 'Total Alkalinity Explained',
    metaDesc: 'Total alkalinity explained: how it buffers pH, ideal range 80–120 ppm, symptoms of low and high TA, and how to raise or lower it correctly.',
    definedTermName: 'Total Alkalinity',
    definedTermDesc: 'Total alkalinity (TA) is the measure of alkaline substances in pool water, primarily bicarbonates, that buffer pH from sudden swings. The ideal range is 80–120 ppm. Low TA causes pH to bounce erratically; high TA causes pH to drift upward and resist correction.',
    quickAnswer: 'Total alkalinity (TA) is the pH buffer in pool water. It determines how resistant the water is to pH changes. Target 80–120 ppm for most pools. Low TA causes chaotic pH swings; high TA causes pH to drift upward constantly and resist acid corrections.',
    keyTakeaways: [
      'TA is the pH buffer — it determines how stable pH is against chemical additions',
      'Low TA (below 60 ppm) causes wild pH swings; high TA (above 150 ppm) causes constant pH rise',
      'Raise TA with sodium bicarbonate; lower it with muriatic acid plus aeration',
      'Fix TA before adjusting pH — TA stability determines pH stability'
    ],
    whatIs: 'Total alkalinity (TA) measures the concentration of alkaline compounds — primarily bicarbonate ions (HCO₃⁻), carbonate ions (CO₃²⁻), and hydroxide ions (OH⁻) — dissolved in pool water. These compounds act as a chemical buffer, neutralizing both acid and base additions before they can change the pH. The higher the TA, the more resistant the water is to pH changes. Sodium bicarbonate (baking soda) is the standard chemical used to raise TA in pools.',
    whyItMatters: 'Without adequate alkalinity, pool pH fluctuates dramatically with every rain shower, chemical addition, or bather load change — making consistent chlorine performance impossible. However, excessively high TA causes pH to drift upward continuously, requiring constant acid additions that never quite stick. Maintaining TA at 80–120 ppm creates a balanced buffering system where pH responds predictably to corrections and holds stable between treatments.',
    idealRangeRows: [
      ['Total Alkalinity (pools)', '80–120 ppm', 'Lower end (80–90 ppm) preferred for pH stability'],
      ['Total Alkalinity (hot tubs)', '80–120 ppm', 'Same range; more critical due to smaller water volume'],
      ['Total Alkalinity (salt water pools)', '80–120 ppm', 'SWG pools may need slightly lower TA to counteract pH rise']
    ],
    tooLowRows: [
      ['Erratic pH swings', 'No buffer to resist pH changes from rain or chemicals', 'Add sodium bicarbonate (baking soda) to raise TA to 80–120 ppm'],
      ['pH drops sharply after acid addition', 'Low TA means acid over-corrects pH dramatically', 'Raise TA first; then pH corrections will be predictable'],
      ['Corrosive water (etching, surface damage)', 'Aggressive low-pH water attacks surfaces and equipment', 'Raise both TA and pH; inspect surfaces and metal fittings']
    ],
    tooHighRows: [
      ['pH constantly drifts upward', 'High TA resists acid; CO2 off-gassing raises pH faster', 'Lower TA to 80–90 ppm using acid-aerate method'],
      ['Cloudy or milky water', 'Calcium carbonate precipitation from high-pH, high-TA water', 'Lower TA and pH; run filter; brush surfaces'],
      ['Scale on tile, heater, and plumbing', 'Carbonate scale deposits in high-TA conditions', 'Lower TA; use scale inhibitor; clean scale with acid wash']
    ],
    relatedCalcs: [
      ['pool-alkalinity-calculator.html', 'Pool Alkalinity Calculator'],
      ['pool-ph-calculator.html', 'Pool pH Calculator'],
      ['chemical-calculator.html', 'Full Chemical Calculator']
    ],
    relatedCharts: [
      ['pool-alkalinity-levels-chart.html', 'Pool Alkalinity Levels Chart'],
      ['pool-ph-levels-chart.html', 'Pool pH Levels Chart']
    ],
    relatedGuides: [
      ['guides/ph/why-pool-ph-keeps-rising.html', 'Why Pool pH Keeps Rising'],
      ['guides/ph/how-to-lower-pool-ph.html', 'How to Lower Pool pH'],
      ['programmatic/problems/low-alkalinity-symptoms.html', 'Low Alkalinity Symptoms']
    ],
    faqs: [
      ['What is total alkalinity and how is it different from pH?', 'pH measures acidity on a 0–14 scale; total alkalinity (TA) measures the concentration of buffering compounds (primarily bicarbonates) in the water. TA determines how strongly water resists pH changes. High TA makes pH resistant to both increases and decreases, while low TA lets pH swing dramatically with any chemical addition or environmental change.'],
      ['How do I raise total alkalinity?', 'Add sodium bicarbonate (baking soda) — it\'s the standard TA increaser. About 1.4 pounds per 10,000 gallons raises TA by approximately 10 ppm. Pre-dissolve in water or broadcast across the pool with the pump running. Retest after 4–6 hours. Make multiple small additions rather than one large dose to avoid overshooting.'],
      ['How do I lower total alkalinity?', 'Add muriatic acid (hydrochloric acid) directly in front of a return jet — concentrated application — then run the pump and leave the cover off to allow CO2 to escape through aeration. The aeration naturally raises pH back to a safe level without adding alkalinity. Repeat the acid-aerate cycle over 24–48 hours until TA reaches the target range.'],
      ['What causes total alkalinity to drop over time?', 'Rainfall, fill water addition, and acid additions for pH correction all lower TA. The natural chemistry of pool operation also gradually depletes bicarbonate. Testing TA weekly and making small sodium bicarbonate additions keeps it in range. Heavy rain events may require a full chemical rebalance.'],
      ['Does total alkalinity affect chlorine?', 'Indirectly, yes. TA stabilizes pH, and pH has a dramatic effect on chlorine effectiveness. When TA is low and pH bounces erratically — sometimes above 8.0, sometimes below 7.0 — chlorine performance becomes unpredictable. Stable TA creates stable pH, which creates consistent and predictable chlorine sanitization.'],
      ['Can total alkalinity be too high?', 'Yes. Above 150–180 ppm, high TA causes pH to resist downward correction (acids just neutralize TA without moving pH much), creates calcium carbonate clouds in the water, and promotes scale on surfaces, heaters, and plumbing. Use the acid-aerate method to lower TA over 1–3 treatment cycles.']
    ]
  },

  {
    slug: 'calcium-hardness-explained.html',
    canonicalPath: '/reference/calcium-hardness-explained',
    title: 'Calcium Hardness in Pools Explained',
    metaDesc: 'Calcium hardness in pools explained: ideal range 200–400 ppm, what low and high calcium does to surfaces and water, and how to adjust it safely.',
    definedTermName: 'Calcium Hardness',
    definedTermDesc: 'Calcium hardness (CH) measures the concentration of dissolved calcium in pool water. The ideal range is 200–400 ppm. Low calcium creates aggressive water that dissolves surfaces; high calcium causes scale and cloudy water.',
    quickAnswer: 'Calcium hardness (CH) measures how much dissolved calcium is in pool water. Target 200–400 ppm. Water with very low CH is "hungry" and dissolves plaster, grout, and metal surfaces. Water with very high CH deposits scale on the heater, tile, and plumbing.',
    keyTakeaways: [
      'Target 200–400 ppm calcium hardness for pools; 150–250 ppm for hot tubs',
      'Low CH creates aggressive water that etches plaster, grout, and corrodes metal fittings',
      'High CH combined with high pH and alkalinity causes scale and cloudy water',
      'Use the Langelier Saturation Index (LSI) to verify overall water balance'
    ],
    whatIs: 'Calcium hardness (CH) measures the concentration of dissolved calcium ions (Ca²⁺) in pool water. Calcium is an essential mineral component of pool water balance. Along with pH and total alkalinity, calcium hardness is one of three major factors in the Langelier Saturation Index (LSI) — the calculation that determines whether pool water is corrosive (dissolving surfaces) or scale-forming (depositing minerals). Calcium chloride (CaCl₂) is the standard product used to raise pool calcium hardness.',
    whyItMatters: 'Pool water naturally seeks mineral equilibrium. Water with insufficient calcium (below 150 ppm) is chemically "hungry" — it will extract calcium from plaster, grout, concrete, tile grout, and metal equipment to satisfy its demand, causing pitting, etching, and corrosion. Water with excess calcium (above 500 ppm) combined with high pH and alkalinity deposits calcium carbonate scale on pool surfaces, heater elements, and plumbing, reducing equipment efficiency and lifespan.',
    idealRangeRows: [
      ['Calcium Hardness (pools)', '200–400 ppm', 'Vinyl liner pools can go lower (175–225 ppm)'],
      ['Calcium Hardness (hot tubs)', '150–250 ppm', 'Lower range preferred; high CH in spas causes scale faster'],
      ['Calcium Hardness (fiberglass)', '200–350 ppm', 'Fiberglass is more tolerant of low CH than plaster']
    ],
    tooLowRows: [
      ['Pitting or etching of plaster surface', 'Aggressive low-CH water dissolves calcium from surfaces', 'Raise CH to 200–400 ppm with calcium chloride'],
      ['Corrosion of metal components', 'Water leaching minerals from ladder rails and fittings', 'Add calcium chloride; inspect metal for damage; use sequestrant'],
      ['Foaming in hot tubs', 'Soft water (low CH) creates stable foam bubbles', 'Raise CH to 150–250 ppm; drain and refill if severely soft']
    ],
    tooHighRows: [
      ['White scale on tile and waterline', 'Calcium carbonate deposits in supersaturated water', 'Lower pH to 7.2; use scale inhibitor; acid wash deposits'],
      ['Cloudy water', 'Micro-scale particles suspended in high-CH water', 'Test full chemistry; lower pH and TA; run filter with clarifier'],
      ['Reduced heater efficiency', 'Scale coats heater elements, reducing heat transfer', 'Drain 20–30% and refill with softer water; acid clean heater']
    ],
    relatedCalcs: [
      ['chemical-calculator.html', 'Full Chemical Calculator']
    ],
    relatedCharts: [
      ['pool-chemical-levels-chart.html', 'Pool Chemical Levels Chart']
    ],
    relatedGuides: [
      ['reference/total-alkalinity-explained.html', 'Total Alkalinity Explained'],
      ['guides/pool-chemistry-basics.html', 'Pool Chemistry Basics Guide']
    ],
    faqs: [
      ['What is calcium hardness in pools?', 'Calcium hardness (CH) measures the concentration of dissolved calcium ions in pool water. It is one of three key parameters (with pH and total alkalinity) that determine water balance. Properly balanced calcium hardness prevents both corrosive water (which attacks surfaces) and scale-forming water (which deposits white mineral deposits on equipment and surfaces).'],
      ['How do I raise calcium hardness?', 'Add calcium chloride (CaCl₂) — sold as a pool chemical or as ice melt. About 12 ounces (340g) per 10,000 gallons raises CH by approximately 10 ppm. Pre-dissolve in a bucket of water before adding, and pour slowly near a return jet with the pump running. Calcium chloride dissolves exothermically (gets hot) — always add chemical to water, not water to chemical.'],
      ['Can I lower calcium hardness?', 'The primary way to lower CH is dilution — drain 20–30% of the pool water and replace with lower-hardness water. Chemical sequestrants (chelating agents) bind calcium ions and keep them in suspension, preventing scale, but don\'t actually reduce the CH test reading. If your fill water is naturally high in calcium (above 400 ppm), consider a water softener for refill water.'],
      ['What does low calcium hardness do to a pool?', 'Water with low calcium (below 150 ppm) is chemically unsatisfied and will extract calcium from plaster, grout, tile, and metal fittings — causing pitting, etching, and corrosion. Fiberglass pools are more tolerant of low CH, but plaster, shotcrete, and concrete pools develop visible surface damage within months if CH is chronically low.'],
      ['What is the ideal calcium hardness for hot tubs?', 'Hot tubs should maintain 150–250 ppm — slightly lower than pools because the smaller water volume and higher temperatures (100–104°F) make chemistry shifts more intense. Low CH in hot tubs commonly causes foam (soft water creates more stable bubbles), and high CH combined with high spa temperatures promotes rapid scale formation on heater elements.'],
      ['Does calcium hardness affect chlorine?', 'Calcium hardness doesn\'t directly affect chlorine chemistry, but it\'s a critical factor in the Langelier Saturation Index (LSI), which determines overall water balance. Proper CH combined with correct pH, alkalinity, and temperature creates balanced water that protects equipment and surfaces — creating the stable environment where chlorine performs most effectively and predictably.']
    ]
  },

  {
    slug: 'shock-treatment-explained.html',
    canonicalPath: '/reference/shock-treatment-explained',
    title: 'Pool Shock Treatment Explained',
    metaDesc: 'Pool shock treatment explained: what it is, types of shock, how breakpoint chlorination works, when to shock, and how long to wait before swimming.',
    definedTermName: 'Pool Shock Treatment',
    definedTermDesc: 'Pool shock treatment is the process of adding a large dose of oxidizer (usually calcium hypochlorite or sodium dichloro) to raise free chlorine to 10–20 ppm, destroying chloramines, algae, and organic contaminants through breakpoint chlorination.',
    quickAnswer: 'Shocking a pool means adding enough chlorine to reach breakpoint — typically raising FC to 10 ppm or higher — to oxidize chloramines, kill algae, and clear combined chlorine. Shock weekly during swim season and after heavy use. Always shock at dusk to prevent UV degradation.',
    keyTakeaways: [
      'Shock raises FC to 10+ ppm to destroy chloramines via breakpoint chlorination',
      'Use calcium hypochlorite (65–73%) for outdoor pools; dichlor for hot tubs',
      'Always shock at dusk — UV light destroys FC before it can work if added during daylight',
      'Wait until FC drops below 5 ppm before swimming — typically 8–24 hours after a standard shock'
    ],
    whatIs: 'Pool shock treatment is the practice of adding a concentrated dose of chlorine or oxidizer to pool water to rapidly raise free chlorine to a level high enough to oxidize all contaminants — a process called breakpoint chlorination. Unlike daily maintenance chlorine which maintains 1–3 ppm FC, shock treatments target 10–20+ ppm FC to destroy combined chlorine (chloramines), kill existing algae, oxidize organic waste, and restore water clarity. Calcium hypochlorite (cal-hypo, 65–73% available chlorine) is the most common pool shock product.',
    whyItMatters: 'Regular chlorine dosing maintains sanitation but doesn\'t eliminate the chloramine buildup that causes pool odor, eye irritation, and degraded water quality. Only breakpoint chlorination — shock — can chemically destroy existing chloramines. Shocking also provides a periodic deep sanitization that kills early-stage algae, oxidizes organic waste from bathers and debris, and gives the water clarity and freshness that routine FC maintenance alone cannot achieve.',
    idealRangeRows: [
      ['FC during shock (standard)', '10–15 ppm', 'For weekly maintenance shock; allows re-entry in 8–24 h'],
      ['FC during shock (algae treatment)', '15–30 ppm', 'Double or triple dose; wait 24–48 h before swimming'],
      ['FC after shock (safe to swim)', '&lt;5 ppm', 'Test before every swimmer re-entry after shocking']
    ],
    tooLowRows: [
      ['Shock dose insufficient for breakpoint', 'FC raised but not enough to oxidize all chloramines', 'Calculate correct dose per pool volume; never under-dose'],
      ['Persistent strong chlorine smell after shocking', 'Chloramines not fully oxidized — breakpoint not reached', 'Add second shock dose; raise FC to 10× CC reading'],
      ['Algae returns within days of shocking', 'Insufficient FC during shock left algae viable', 'Triple-dose shock; brush walls; maintain FC at 2–3 ppm after']
    ],
    tooHighRows: [
      ['Swimmers unable to use pool for 24+ hours', 'Shock dose was excessive for pool volume', 'Remove cover; run pump; allow sunlight to reduce FC naturally'],
      ['Bleaching of pool liner or surfaces', 'Prolonged exposure to 20+ ppm FC damages materials', 'Do not intentionally over-shock; partial drain if FC &gt;30 ppm'],
      ['Equipment seal degradation', 'Very high FC degrades rubber O-rings and pump seals', 'Keep FC below 20 ppm for extended periods; dilute if needed']
    ],
    relatedCalcs: [
      ['pool-shock-calculator.html', 'Pool Shock Calculator'],
      ['chemical-calculator.html', 'Full Chemical Calculator']
    ],
    relatedCharts: [
      ['pool-chlorine-levels-chart.html', 'Pool Chlorine Levels Chart'],
      ['pool-chemical-levels-chart.html', 'Pool Chemical Levels Chart']
    ],
    relatedGuides: [
      ['guides/chlorine/how-often-should-i-shock-my-pool.html', 'How Often Should I Shock My Pool'],
      ['guides/chlorine/chlorine-too-high-after-shocking.html', 'Chlorine Too High After Shocking'],
      ['guides/edge-cases/over-shocking-pool-effects.html', 'Over-Shocking Pool Effects']
    ],
    faqs: [
      ['What is the difference between shocking and regular chlorinating?', 'Regular chlorination maintains a residual FC of 1–3 ppm for daily sanitization. Shocking adds a much larger dose — typically 10 ppm or more — to achieve breakpoint chlorination, which oxidizes chloramines, kills algae, and resets water quality. Shocking is periodic treatment (weekly); regular chlorination is ongoing maintenance. You need both.'],
      ['How often should I shock my pool?', 'Shock weekly during swim season, and immediately after heavy rain, large gatherings, algae outbreaks, or when FC crashes below 1 ppm. At minimum, shock once per month even during low-use periods. Always shock when opening the pool at the start of the season after winter or spring closing.'],
      ['What type of shock is best for pools?', 'Calcium hypochlorite (cal-hypo, 65–73% available chlorine) is the most popular granular shock for pools — effective, affordable, and widely available. Sodium dichloro (dichlor) dissolves faster and adds some CYA stabilizer. Potassium monopersulfate (MPS) is a non-chlorine oxidizing shock useful between chlorine doses. Avoid using trichlor tablets as a shock product.'],
      ['When can I swim after shocking?', 'Wait until FC drops below 5 ppm before swimming. For a standard weekly maintenance shock, this takes 8–24 hours with the pump running and sun exposure. For a heavy algae treatment shock (FC 15–30 ppm), wait 24–48 hours and test before allowing swimmers. Always test — never estimate based on time alone.'],
      ['Why should I shock at night?', 'Shocking at dusk or nighttime prevents UV light from immediately destroying the freshly-added FC before it can oxidize contaminants and chloramines. During daylight in an outdoor pool without adequate CYA, chlorine degrades within hours. Shocking at night gives the dose a full 8+ hours to work, and the pool is typically ready by morning.'],
      ['Can I over-shock a pool?', 'Yes. FC above 20–30 ppm can bleach swimwear, irritate skin and eyes, and degrade pool equipment seals and liners over time. If you accidentally over-shock, remove the cover, run the pump, and let sunlight reduce FC naturally. Partial draining (15–20%) and refilling is recommended for FC consistently above 30 ppm.']
    ]
  },

  {
    slug: 'salt-water-generator-explained.html',
    canonicalPath: '/reference/salt-water-generator-explained',
    title: 'Salt Water Generator (SWG) Explained',
    metaDesc: 'Salt water generator explained: how electrolytic chlorine generation works, salt levels 2700–3400 ppm, chemistry management, pros and cons vs traditional chlorine.',
    definedTermName: 'Salt Water Generator',
    definedTermDesc: 'A salt water generator (SWG), also called a salt chlorine generator (SCG), produces chlorine by passing a low-salt solution through an electrolytic cell that converts sodium chloride (salt) into hypochlorous acid. Salt level target: 2,700–3,400 ppm.',
    quickAnswer: 'A salt water generator produces chlorine on-site by running salt water (2,700–3,400 ppm) through an electrolytic cell, converting NaCl into hypochlorous acid. The pool still contains chlorine — it is just generated continuously from salt rather than added manually. Chemistry management is identical to regular chlorine pools.',
    keyTakeaways: [
      'SWG pools still contain chlorine — salt is the source, not an alternative to chlorine',
      'Target salt level: 2,700–3,400 ppm (roughly 10× lower than ocean water)',
      'SWG pools drift to higher pH; more frequent acid additions are typically required',
      'Salt cells need cleaning every 3 months and replacement every 3–7 years'
    ],
    whatIs: 'A salt water generator (SWG), also called a salt chlorine generator (SCG) or electrolytic chlorine generator (ECG), is a pool equipment system that produces chlorine on-site by passing salt water through an electrolytic cell. The cell uses electrical current to split sodium chloride (NaCl) molecules into sodium (Na⁺) and hypochlorous acid (HOCl) — the active chlorine sanitizer. The process is self-regenerating: as the pool\'s salt level remains constant (salt is not consumed — only split), the SWG continuously produces fresh chlorine with only electricity and a pool\'s salt supply.',
    whyItMatters: 'Salt water generators eliminate the need to buy, store, and handle chlorine products, reducing chemical cost and exposure. They produce chlorine continuously at low levels rather than in periodic large doses, which many pool owners find results in more consistent water quality and fewer chemical spikes. The resulting pool water is often described as softer and gentler on skin, eyes, and swimwear compared to traditionally-chlorinated pools. However, SWG pools require the same full suite of water chemistry management — pH, alkalinity, CYA, and calcium hardness — and typically require more frequent acid additions.',
    idealRangeRows: [
      ['Salt level', '2,700–3,400 ppm', 'Check SWG manufacturer specification; most target ~3,200 ppm'],
      ['Free Chlorine (SWG pools)', '1–3 ppm', 'Same target as traditional pools; SWG maintains it continuously'],
      ['CYA (SWG pools)', '60–80 ppm', 'Slightly higher than traditional pools to protect generated FC']
    ],
    tooLowRows: [
      ['Low salt warning from SWG', 'Generator cannot produce sufficient chlorine below minimum salt', 'Add pool salt; 50 lb per 10,000 gal raises salt ~600 ppm'],
      ['FC drops despite SWG running', 'Salt level or cell output too low for demand', 'Test salt; clean cell; increase SWG output percentage'],
      ['SWG cell not producing chlorine', 'Calcified cell cannot generate effectively', 'Clean cell with mild acid solution; replace if plates are damaged']
    ],
    tooHighRows: [
      ['Salt level above 4,000 ppm', 'Excess salt can damage metal equipment and SWG cell', 'Partial drain and refill to reduce salt level'],
      ['Corrosion of metal fittings', 'High salt accelerates galvanic corrosion on ladders and returns', 'Maintain salt at 3,000–3,400 ppm; inspect bonding/grounding'],
      ['SWG error codes', 'High salt triggers system protection in most modern generators', 'Drain 20% and refill; retest salt before restarting generator']
    ],
    relatedCalcs: [
      ['saltwater-pool-salt-calculator.html', 'Saltwater Pool Salt Calculator'],
      ['chemical-calculator.html', 'Full Chemical Calculator']
    ],
    relatedCharts: [
      ['salt-water-pool-chemical-levels-chart.html', 'Salt Water Pool Chemical Levels Chart'],
      ['pool-chemical-levels-chart.html', 'Pool Chemical Levels Chart']
    ],
    relatedGuides: [
      ['guides/advanced/chlorine-vs-saltwater.html', 'Chlorine vs Salt Water Pools (Advanced)'],
      ['comparisons/salt-water-pool-vs-chlorine-pool.html', 'Salt Water Pool vs Chlorine Pool Comparison']
    ],
    faqs: [
      ['Does a salt water pool still use chlorine?', 'Yes. A salt water generator produces chlorine on-site by converting salt (NaCl) into hypochlorous acid through electrolysis. The pool water contains the same chlorine as a traditionally-chlorinated pool — it is just generated continuously from salt rather than added manually in product form. Salt water pools are chlorine pools with automated chlorine production.'],
      ['How much salt does a pool need?', 'Most SWG systems operate optimally at 2,700–3,400 ppm (check your specific generator\'s manual). This is roughly 10× lower than ocean water (35,000 ppm) and just above the threshold where water tastes noticeably salty (~4,000 ppm). To add salt, use pool-grade NaCl (not table salt or rock salt). About 50 pounds per 10,000 gallons raises salt concentration by approximately 600 ppm.'],
      ['Is a salt water pool cheaper to maintain?', 'Salt water pools have lower ongoing chemical costs (salt is far cheaper than packaged chlorine), but higher upfront equipment costs ($800–$2,500+ for the SWG unit plus installation). Salt cells need replacement every 3–7 years (~$200–600). Most pool owners find long-term chemistry costs are lower, but total ownership cost depends on electricity rates and cell replacement frequency.'],
      ['Do I still need to manage pool chemistry with a salt water generator?', 'Yes. Salt water pools require the same full water chemistry management: pH (7.2–7.6), total alkalinity (80–120 ppm), CYA (60–80 ppm), calcium hardness (200–400 ppm), and regular FC testing. SWG pools typically experience faster pH rise due to the electrolysis process, requiring more frequent muriatic acid additions than traditionally-chlorinated pools.'],
      ['What maintenance does a salt cell require?', 'Salt cells must be inspected every 3 months and cleaned if calcium scale has built up on the electrolytic plates. Scale dramatically reduces chlorine output. Most modern SWG units have a self-cleaning (reverse polarity) cycle, but manual cleaning with a mild acid solution (10:1 water to muriatic acid) is still periodically needed. Full cell replacement is required every 3–7 years.'],
      ['Can I use a salt water generator in a hot tub?', 'Salt water systems are available for hot tubs and operate at similar salt levels (2,500–3,000 ppm). They offer the same continuous chlorine generation benefits in a spa setting. Hot tub SWG cells typically have shorter lifespans due to higher temperatures and smaller water volume repeatedly cycling through the cell. Standard hot tub chemistry management still applies.']
    ]
  }

];

// ─────────────────────────────────────────────────────────────────────────────
// WRITE ALL FILES
// ─────────────────────────────────────────────────────────────────────────────

const dir = path.join(ROOT, 'reference');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let written = 0;
for (const opts of entityPages) {
  const file = path.join(dir, opts.slug);
  fs.writeFileSync(file, html(opts), 'utf8');
  written++;
}

console.log('generate-entity-pages: wrote ' + written + ' entity reference pages');
