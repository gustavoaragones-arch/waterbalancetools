/**
 * Phase 6 — Topical Authority: generate cluster guides.
 * Creates guides/chlorine/ (5), guides/ph/ (5), guides/hot-tub/ (5).
 * Idempotent: overwrites to allow content updates.
 * Run: node scripts/generate-authority-guides.js
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = '../../';   // depth-2 from guides/cluster/

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function breadcrumbSchema(crumbs) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: 'https://waterbalancetools.com' + c.item
    }))
  });
}

function tableRows(rows) {
  return rows.map(r =>
    '        <tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>'
  ).join('\n');
}

function faqItems(items) {
  return items.map(([q, a]) =>
    '      <details class="paa-item">\n' +
    '        <summary>' + esc(q) + '</summary>\n' +
    '        <p>' + a + '</p>\n' +
    '      </details>'
  ).join('\n');
}

function html(opts) {
  const {
    slug, folder, canonicalPath, title, metaDesc, ogDesc, h1,
    quickAnswer, keyTakeaways, body, schemaExtra
  } = opts;

  const crumbs = [
    { name: 'Home', item: '/' },
    { name: 'Guides', item: '/guides/pool-chemistry-basics' },
    { name: title, item: canonicalPath }
  ];

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
  <link rel="stylesheet" href="${BASE}style.css">
  <script type="application/ld+json">
  ${breadcrumbSchema(crumbs)}
  </script>${schemaExtra || ''}
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3974004697476579" crossorigin="anonymous"></script>
</head>
<body>
  <header class="site-header">
    <a href="${BASE}index.html" class="logo-link"><img src="${BASE}assets/logo.svg" alt="WaterBalanceTools" class="logo" width="180" height="36"></a>
    <nav class="nav">
      <a href="${BASE}calculators/chemical-calculator.html">Chemical Calculator</a>
      <a href="${BASE}calculators/pool-volume-calculator.html">Volume Calculator</a>
      <a href="../pool-chemistry-basics.html">Chemistry Guide</a>
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
${body}
    <section class="credibility">
      <ul class="credibility-trust">
        <li>Typical range: 1–3 ppm chlorine</li>
        <li>Recommended pH: 7.2–7.6</li>
        <li>Test water regularly</li>
      </ul>
      <p>WaterBalanceTools provides practical calculators and guides for pool and hot tub water chemistry. These tools are designed to help maintain safe chlorine, pH, and total alkalinity within a healthy water balance.</p>
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
      <a href="../pool-chemistry-basics.html">Pool Chemistry Guide</a>
      <a href="${BASE}legal/ownership.html">Ownership</a>
      <a href="${BASE}legal/legal.html">Legal</a>
    </nav>
    <p class="footer-copy">&copy; WaterBalanceTools.com</p>
  </footer>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHLORINE CLUSTER
// ─────────────────────────────────────────────────────────────────────────────

const chlorineGuides = [

  {
    slug: 'how-often-should-i-shock-my-pool.html',
    folder: 'guides/chlorine',
    canonicalPath: '/guides/chlorine/how-often-should-i-shock-my-pool',
    title: 'How Often Should I Shock My Pool?',
    metaDesc: 'How often to shock a pool: weekly in swim season, after heavy use, after rain, or when FC drops. Full schedule + troubleshooting table.',
    ogDesc: 'Shock pools weekly during peak season and after any major event—heavy rain, algae, or FC crash. See the full schedule.',
    h1: 'How Often Should I Shock My Pool?',
    quickAnswer: 'Shock your pool once a week during swim season, and immediately after heavy rain, large parties, or when free chlorine drops below 1 ppm. Pools with algae or cloudy water may need two treatments. Always shock at dusk and keep the pump running overnight.',
    keyTakeaways: [
      'Weekly shocking is standard during peak swim season',
      'Shock after any event that dilutes or consumes chlorine',
      'Use the pool shock calculator to get the exact dose for your pool size',
      'Test FC before and 24 hours after shocking to confirm effectiveness'
    ],
    body: `    <p class="serp-direct"><strong>Most residential pools benefit from weekly shocking (calcium hypochlorite or sodium dichloro) during the swim season, with immediate shock treatments after heavy rain, algae outbreaks, or any event that crashes free chlorine.</strong></p>
    <h2>Standard shocking schedule</h2>
    <p>During active swim season (water above 60 °F), a weekly shock keeps chloramines in check, oxidizes organic waste, and protects the residual FC between doses. Off-season pools or pools with low bather loads can stretch to every two weeks.</p>
    <h2>When to shock immediately</h2>
    <ul>
      <li><strong>After heavy rain</strong> — dilutes chemicals and introduces organic debris</li>
      <li><strong>After large pool parties</strong> — heavy bather load consumes FC fast</li>
      <li><strong>FC below 1 ppm</strong> — active chlorine is insufficient for sanitation</li>
      <li><strong>Green or cloudy water</strong> — algae demands a double or triple shock dose</li>
      <li><strong>Strong chlorine smell</strong> — paradoxically indicates chloramines, not excess FC</li>
    </ul>
    <h2>Shocking frequency by scenario</h2>
    <table class="chart-table">
      <thead><tr><th>Situation</th><th>Recommended frequency</th><th>Dose</th></tr></thead>
      <tbody>
        <tr><td>Normal swim season</td><td>Weekly</td><td>1 lb per 10,000 gal</td></tr>
        <tr><td>Heavy use / party</td><td>Immediately after</td><td>1–2 lb per 10,000 gal</td></tr>
        <tr><td>After heavy rain</td><td>Within 24 hours</td><td>1 lb per 10,000 gal</td></tr>
        <tr><td>Algae treatment</td><td>Immediately + retest 24 h</td><td>2–3 lb per 10,000 gal</td></tr>
        <tr><td>Opening the pool</td><td>Once at startup</td><td>2 lb per 10,000 gal</td></tr>
        <tr><td>Off-season (60 °F or below)</td><td>Every 2–4 weeks</td><td>1 lb per 10,000 gal</td></tr>
      </tbody>
    </table>
    <h2>How to shock correctly</h2>
    <ol>
      <li>Test FC and pH first. Adjust pH to 7.2–7.4 <em>before</em> shocking for maximum effectiveness.</li>
      <li>Add shock at dusk or evening — UV light destroys unstabilized chlorine rapidly.</li>
      <li>Dissolve granular shock in a bucket of water first; pour around the perimeter.</li>
      <li>Run the pump for 8 hours minimum after dosing.</li>
      <li>Retest FC after 24 hours. Wait until FC returns to 1–3 ppm before swimming.</li>
    </ol>
    <h2>Calculator</h2>
    <p><a href="${BASE}calculators/pool-shock-calculator.html" class="btn btn-primary">Pool Shock Calculator</a> · <a href="${BASE}calculators/chemical-calculator.html">Full Chemical Calculator</a></p>
    <h2>Reference chart</h2>
    <p>See all chlorine target ranges: <a href="${BASE}pool-chlorine-levels-chart.html">Pool Chlorine Levels Chart</a></p>`
  },

  {
    slug: 'why-pool-chlorine-disappears-overnight.html',
    folder: 'guides/chlorine',
    canonicalPath: '/guides/chlorine/why-pool-chlorine-disappears-overnight',
    title: 'Why Pool Chlorine Disappears Overnight',
    metaDesc: 'Chlorine disappearing overnight usually means algae, high organic load, or chlorine demand. Diagnosis table and fix steps inside.',
    ogDesc: 'If pool chlorine drops to zero overnight, you have a chlorine demand problem. Here\'s how to diagnose and fix it.',
    h1: 'Why Pool Chlorine Disappears Overnight',
    quickAnswer: 'If free chlorine drops to near-zero overnight, the pool has chlorine demand — usually caused by algae growth, high phosphates, dead organic matter, or insufficient cyanuric acid (CYA) allowing chlorine to gas off during the day. Solve it by shocking to breakpoint, clearing organic matter, and confirming CYA is 30–50 ppm.',
    keyTakeaways: [
      'Overnight FC loss is almost always a chlorine demand issue, not a dosing problem',
      'Common causes: algae, high phosphates, insufficient CYA, organic debris',
      'The fix is a large breakpoint shock dose — not just topping up FC',
      'Check CYA levels; below 30 ppm outdoors loses FC rapidly to UV'
    ],
    body: `    <p class="serp-direct"><strong>When free chlorine disappears overnight, the water has a chlorine demand — reactive organic matter or algae is consuming FC faster than it can be maintained. Adding more chlorine without resolving the demand is ineffective.</strong></p>
    <h2>How to diagnose overnight chlorine loss</h2>
    <p>Test FC at dusk, then again at dawn before the pump runs. A drop of more than 1 ppm overnight (with no bathers) strongly indicates active consumption. A drop of 3+ ppm suggests significant algae growth even if water looks clear.</p>
    <h2>Causes and fixes</h2>
    <table class="chart-table">
      <thead><tr><th>Cause</th><th>Signs</th><th>Fix</th></tr></thead>
      <tbody>
        <tr><td>Early algae (invisible)</td><td>FC at zero in AM, slightly green tint</td><td>Triple-dose shock + brush walls</td></tr>
        <tr><td>High phosphates</td><td>FC drops despite regular dosing</td><td>Phosphate remover, then shock</td></tr>
        <tr><td>CYA too low (&lt;30 ppm)</td><td>FC fine in evening, gone by morning</td><td>Add stabilizer to 30–50 ppm</td></tr>
        <tr><td>Heavy debris / organic load</td><td>Leaves, grass, sunscreen residue</td><td>Skim, vacuum, then shock</td></tr>
        <tr><td>Chlorine demand from new fill</td><td>After refill or heavy dilution</td><td>Super-chlorinate to 10 ppm FC</td></tr>
        <tr><td>High combined chlorine (CC)</td><td>Strong chlorine smell, irritation</td><td>Breakpoint shock to oxidize CC</td></tr>
      </tbody>
    </table>
    <h2>The breakpoint shock method</h2>
    <p>Breakpoint chlorination means raising FC high enough to oxidize all combined chlorine and organic demand at once. Typically you need to raise FC to 10× the combined chlorine reading. Use the shock calculator to determine the dose for your pool volume.</p>
    <h2>Preventive steps</h2>
    <ul>
      <li>Test CYA monthly and maintain 30–50 ppm for outdoor pools.</li>
      <li>Remove organic debris before it sinks and consumes FC.</li>
      <li>Maintain FC at 2–3 ppm (not the bare minimum) during peak season.</li>
      <li>Run the filter for a full turnover cycle daily.</li>
    </ul>
    <h2>Calculator</h2>
    <p><a href="${BASE}calculators/pool-shock-calculator.html" class="btn btn-primary">Pool Shock Calculator</a> · <a href="${BASE}calculators/chemical-calculator.html">Full Chemical Calculator</a></p>
    <p>Reference: <a href="${BASE}pool-chlorine-levels-chart.html">Pool Chlorine Levels Chart</a></p>`
  },

  {
    slug: 'chlorine-too-high-after-shocking.html',
    folder: 'guides/chlorine',
    canonicalPath: '/guides/chlorine/chlorine-too-high-after-shocking',
    title: 'Chlorine Too High After Shocking: What to Do',
    metaDesc: 'Pool chlorine too high after shocking? Wait 24–48 hours, run the pump, and let UV reduce FC naturally. Exact steps by FC level inside.',
    ogDesc: 'Very high FC after shocking is expected — wait, circulate, and test before swimming. See the exact FC thresholds and actions.',
    h1: 'Chlorine Too High After Shocking: What to Do',
    quickAnswer: 'High FC after shocking is normal and expected. For most pools, wait 24–48 hours with the pump running and allow sunlight (or time if the pool is shaded) to reduce FC naturally. Do not swim until FC is below 5 ppm. If FC exceeds 20 ppm, partial dilution may be needed.',
    keyTakeaways: [
      'FC above 5 ppm is the standard no-swim threshold after shocking',
      'Running the pump and exposing the pool to sunlight lowers FC fastest',
      'Never add sodium thiosulfate unless FC is dangerously high (>20 ppm)',
      'For an algae shock, high FC is intentional — wait it out'
    ],
    body: `    <p class="serp-direct"><strong>After a routine shock dose, free chlorine will typically read 5–15 ppm and drop to safe swim levels (1–3 ppm) within 24–48 hours naturally. Higher readings from an algae treatment may take longer.</strong></p>
    <h2>FC levels after shocking — what to do</h2>
    <table class="chart-table">
      <thead><tr><th>FC reading</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        <tr><td>&lt; 5 ppm</td><td>Safe to swim</td><td>None required</td></tr>
        <tr><td>5–10 ppm</td><td>High — wait</td><td>Run pump; retest in 12–24 h</td></tr>
        <tr><td>10–20 ppm</td><td>Very high</td><td>Run pump, maximize sunlight, retest in 24–48 h</td></tr>
        <tr><td>20–30 ppm</td><td>Excessive</td><td>Consider 10–20% dilution; run pump continuously</td></tr>
        <tr><td>&gt; 30 ppm</td><td>Over-shocked</td><td>Partial drain/refill recommended; keep out of pool</td></tr>
      </tbody>
    </table>
    <h2>How to bring FC down faster</h2>
    <ul>
      <li><strong>Sunlight</strong> is the safest and fastest natural neutralizer — UV light breaks down free chlorine. Remove the cover and let the pool sit in direct sun.</li>
      <li><strong>Pump and filter</strong> — keep circulation running so all water passes through consistently.</li>
      <li><strong>Partial dilution</strong> — drain 15–20% and refill with fresh water only if FC is above 20 ppm and you need a quicker turnaround.</li>
      <li><strong>Sodium thiosulfate (neutralizer)</strong> — only use for emergency overfeeding (>30 ppm). Overdosing neutralizer depletes FC entirely and leaves the water unprotected.</li>
    </ul>
    <h2>How long to wait before swimming?</h2>
    <p>The generally accepted no-swim threshold is <strong>FC below 5 ppm</strong> for recreational swimming, and ideally 1–3 ppm for regular use. Heavy shock doses (algae treatment) may require an overnight or full 24–48 hour wait.</p>
    <h2>Calculator</h2>
    <p><a href="${BASE}calculators/pool-shock-calculator.html" class="btn btn-primary">Pool Shock Calculator</a> · <a href="${BASE}calculators/chemical-calculator.html">Full Chemical Calculator</a></p>
    <p>Reference: <a href="${BASE}pool-chlorine-levels-chart.html">Pool Chlorine Levels Chart</a></p>`
  },

  {
    slug: 'why-pool-wont-hold-chlorine.html',
    folder: 'guides/chlorine',
    canonicalPath: '/guides/chlorine/why-pool-wont-hold-chlorine',
    title: 'Why Pool Won\'t Hold Chlorine: Causes and Fixes',
    metaDesc: 'Pool won\'t hold chlorine? Common causes: low CYA, algae, high phosphates, or high organic load. Diagnosis table and step-by-step fix.',
    ogDesc: 'A pool that can\'t hold chlorine has a demand problem. Diagnose the cause and fix it—before adding more product.',
    h1: 'Why Pool Won\'t Hold Chlorine',
    quickAnswer: 'A pool that burns through chlorine is experiencing chlorine demand — the most common causes are insufficient cyanuric acid (CYA below 30 ppm), algae growth, high phosphate levels, or a heavy organic load from debris or bathers. Resolve the underlying cause before adding more chlorine.',
    keyTakeaways: [
      'CYA below 30 ppm causes FC to break down in direct sunlight within hours',
      'Algae — even invisible — can consume an entire FC dose overnight',
      'High phosphates feed algae and accelerate chlorine depletion',
      'Brushing walls and vacuuming before shocking dramatically improves results'
    ],
    body: `    <p class="serp-direct"><strong>When chlorine disappears faster than it can be replenished, adding more won't help until the root cause is resolved. Start with a diagnostic test of CYA, phosphates, and combined chlorine levels before dosing.</strong></p>
    <h2>Diagnostic checklist</h2>
    <table class="chart-table">
      <thead><tr><th>What to test</th><th>Target</th><th>If out of range</th></tr></thead>
      <tbody>
        <tr><td>Cyanuric acid (CYA)</td><td>30–50 ppm outdoor</td><td>Add stabilizer; FC will last much longer</td></tr>
        <tr><td>Phosphates</td><td>&lt; 200 ppb</td><td>Use phosphate remover before shocking</td></tr>
        <tr><td>Combined chlorine (CC)</td><td>&lt; 0.5 ppm</td><td>Breakpoint shock to 10× CC reading</td></tr>
        <tr><td>pH</td><td>7.2–7.6</td><td>High pH destroys chlorine effectiveness; lower first</td></tr>
        <tr><td>Total alkalinity</td><td>80–120 ppm</td><td>Fix TA before adjusting pH</td></tr>
        <tr><td>Calcium hardness</td><td>200–400 ppm</td><td>Very low CH makes water aggressive on surfaces</td></tr>
      </tbody>
    </table>
    <h2>CYA: the most overlooked factor</h2>
    <p>Outdoor pools without stabilizer lose up to 90% of their FC to UV within a few hours of direct sunlight. Cyanuric acid (CYA) shields chlorine from UV degradation. Keep CYA at 30–50 ppm for pools using traditional chlorine. Salt water pools can run slightly higher (60–80 ppm).</p>
    <h2>Algae demand — the silent consumer</h2>
    <p>Early-stage algae may be invisible but can consume enormous amounts of chlorine. If FC at dawn is zero after a full evening dose, suspect algae. Brush every wall surface, vacuum the floor, and perform a triple-dose shock. Retest at 24 and 48 hours.</p>
    <h2>Calculator</h2>
    <p><a href="${BASE}calculators/pool-shock-calculator.html" class="btn btn-primary">Pool Shock Calculator</a> · <a href="${BASE}calculators/chemical-calculator.html">Full Chemical Calculator</a></p>
    <p>Reference: <a href="${BASE}pool-chlorine-levels-chart.html">Pool Chlorine Levels Chart</a></p>`
  },

  {
    slug: 'free-chlorine-vs-total-chlorine.html',
    folder: 'guides/chlorine',
    canonicalPath: '/guides/chlorine/free-chlorine-vs-total-chlorine',
    title: 'Free Chlorine vs Total Chlorine Explained',
    metaDesc: 'Free chlorine is the active sanitizer; total chlorine = free + combined. How to interpret readings, combined chlorine limits, and when to shock.',
    ogDesc: 'Understanding free vs total vs combined chlorine helps you interpret test results correctly and know when to shock.',
    h1: 'Free Chlorine vs Total Chlorine Explained',
    quickAnswer: 'Free chlorine (FC) is the active portion that actually sanitizes. Total chlorine (TC) equals free plus combined chlorine (CC). Combined chlorine forms when FC reacts with nitrogen compounds and is ineffective as a sanitizer. If TC minus FC exceeds 0.5 ppm, shock to break down the combined chlorine.',
    keyTakeaways: [
      'Free chlorine (FC) is the only portion that actively kills bacteria and algae',
      'Combined chlorine (CC) = TC − FC; above 0.5 ppm indicates a chloramine problem',
      'The chlorine smell in pools is almost always combined chlorine, not excess free chlorine',
      'Breakpoint shock at 10× CC reading destroys chloramines'
    ],
    body: `    <p class="serp-direct"><strong>Most test kits measure both free chlorine (FC) and total chlorine (TC). Subtract FC from TC to get combined chlorine (CC). Ideal pools have CC near zero.</strong></p>
    <h2>The three forms of chlorine</h2>
    <table class="chart-table">
      <thead><tr><th>Form</th><th>What it is</th><th>Target</th></tr></thead>
      <tbody>
        <tr><td>Free chlorine (FC)</td><td>Active hypochlorous acid; kills pathogens</td><td>1–3 ppm (pools), 3–5 ppm (spas)</td></tr>
        <tr><td>Combined chlorine (CC)</td><td>Chloramines from FC reacting with ammonia/nitrogen</td><td>&lt; 0.5 ppm</td></tr>
        <tr><td>Total chlorine (TC)</td><td>FC + CC; total chlorine in the water</td><td>TC = FC when CC is near zero</td></tr>
      </tbody>
    </table>
    <h2>Why combined chlorine matters</h2>
    <p>Chloramines are the real cause of eye irritation, skin rash, and the distinctive "chlorine smell" at heavily-used pools. A strong chlorine odor is actually a warning that combined chlorine is too high — not that there is too much free chlorine.</p>
    <h2>When to interpret your readings</h2>
    <ul>
      <li><strong>FC = 2 ppm, TC = 2 ppm</strong> — Perfect. CC = 0. No action needed.</li>
      <li><strong>FC = 1 ppm, TC = 2 ppm</strong> — CC = 1 ppm. Needs breakpoint shock (10 ppm FC).</li>
      <li><strong>FC = 0, TC = 1 ppm</strong> — All chlorine is combined; no free chlorine. Shock immediately.</li>
    </ul>
    <h2>How to eliminate combined chlorine</h2>
    <p>Raise FC to at least <strong>10× the CC reading</strong> in a single dose. This is breakpoint chlorination — it destroys chloramines chemically, rather than diluting or masking them. <strong>The Pool Shock Calculator does not read a combined-chlorine value or calculate a breakpoint dose automatically</strong>: it offers flat FC-increase presets (5, 10, 15, or 20 ppm) for a chosen chlorine product. To use it for breakpoint chlorination, first calculate your own target (10 × your CC reading, added to your current FC), then select the closest calculator preset, or apply the <a href="${BASE}formulas/shock-formula.html">shock dose formula</a> directly for an exact figure using a non-stabilized product such as liquid chlorine or calcium hypochlorite.</p>
    <h2>Calculator</h2>
    <p><a href="${BASE}calculators/pool-shock-calculator.html" class="btn btn-primary">Pool Shock Calculator</a> · <a href="${BASE}calculators/chemical-calculator.html">Full Chemical Calculator</a></p>
    <p>Reference: <a href="${BASE}pool-chlorine-levels-chart.html">Pool Chlorine Levels Chart</a></p>`
  }

];

// ─────────────────────────────────────────────────────────────────────────────
// pH CLUSTER
// ─────────────────────────────────────────────────────────────────────────────

const phGuides = [

  {
    slug: 'why-pool-ph-keeps-rising.html',
    folder: 'guides/ph',
    canonicalPath: '/guides/ph/why-pool-ph-keeps-rising',
    title: 'Why Pool pH Keeps Rising',
    metaDesc: 'Pool pH keeps rising? Causes include CO2 off-gassing, aeration, algae, and high alkalinity. Fix guide and FAQ inside.',
    ogDesc: 'pH naturally drifts upward in most pools. Learn the main causes and how to stabilize it long-term.',
    h1: 'Why Pool pH Keeps Rising',
    quickAnswer: 'Pool pH rises naturally because CO2 constantly off-gasses from the water, which removes the acid that keeps pH stable. High alkalinity, heavy aeration (waterfalls, jets), algae growth, and certain sanitizers (especially salt chlorine generators) all accelerate this drift upward.',
    keyTakeaways: [
      'pH rises in virtually every pool — it is a natural chemical process',
      'High total alkalinity (above 120 ppm) amplifies pH drift',
      'Salt water pools and pools with jets or waterfalls rise fastest',
      'The fix is periodic small additions of muriatic acid or pH-down product'
    ],
    body: `    <p class="serp-direct"><strong>pH drift upward is expected in swimming pools. It is not a malfunction — it is driven by physics. Understanding the causes helps you prevent large swings and reduce the frequency of chemical additions.</strong></p>
    <h2>Causes of rising pool pH</h2>
    <table class="chart-table">
      <thead><tr><th>Cause</th><th>How it raises pH</th><th>Solution</th></tr></thead>
      <tbody>
        <tr><td>CO2 off-gassing</td><td>CO2 dissolved in water forms carbonic acid; as it escapes, acid is lost</td><td>Add pH-down periodically</td></tr>
        <tr><td>High alkalinity</td><td>TA acts as a pH buffer that resists lowering but accelerates rise</td><td>Lower TA to 80–100 ppm</td></tr>
        <tr><td>Aeration (jets, waterfalls, splashing)</td><td>More surface agitation = more CO2 loss = faster rise</td><td>Reduce aeration; use acid regularly</td></tr>
        <tr><td>Algae growth</td><td>Algae consume CO2 during photosynthesis, raising pH</td><td>Shock and treat algae</td></tr>
        <tr><td>Salt chlorine generator</td><td>SWG electrolysis produces alkaline by-products</td><td>Add acid more frequently</td></tr>
        <tr><td>High pH fill water</td><td>City/well water sometimes pH 7.8–8.2</td><td>Treat fill water before adding to pool</td></tr>
      </tbody>
    </table>
    <h2>How to stabilize pH long-term</h2>
    <p>Lower total alkalinity (TA) to the mid-80s ppm range. TA is the primary driver of pH rebound — lower TA means pH moves more freely but also means you can make smaller acid additions that stick. Most pools running 120+ ppm TA need acid every few days; pools at 80–90 ppm may need it weekly or less.</p>
    <section class="people-also-ask">
      <h2>Frequently Asked Questions</h2>
      <div class="paa-accordion">
${faqItems([
  ['Why does pool pH rise after rain?', 'Rainwater is slightly acidic (pH 5.6–6) and can briefly lower pool pH, but then accelerates CO2 off-gassing as the system equilibrates — often causing a net rise within 24 hours. Additional fill water from rain also tends to have a higher pH than the pool.'],
  ['Is it normal for pool pH to rise every day?', 'Yes, especially in summer when water temperature is high and there is heavy aeration. Checking pH twice a week and adding acid in small doses is normal pool maintenance.'],
  ['Does adding chlorine raise pH?', 'It depends on the product. Liquid chlorine (sodium hypochlorite) and calcium hypochlorite granules raise pH slightly. Trichlor tabs are acidic and tend to lower pH. Salt water chlorine generators produce a slight net rise.'],
  ['What happens if pool pH is always too high?', 'pH above 7.8 reduces chlorine effectiveness dramatically — at pH 8.0 only about 20% of FC is active hypochlorous acid. Swimmers may notice eye irritation, cloudy water, and scale formation on surfaces and equipment.']
])}
      </div>
    </section>
    <h2>Calculator</h2>
    <p><a href="${BASE}calculators/pool-ph-calculator.html" class="btn btn-primary">Pool pH Calculator</a> · <a href="${BASE}calculators/chemical-calculator.html">Full Chemical Calculator</a></p>
    <p>Reference: <a href="${BASE}pool-ph-levels-chart.html">Pool pH Levels Chart</a> · <a href="${BASE}pool-chemical-levels-chart.html">Pool Chemical Levels Chart</a></p>`
  },

  {
    slug: 'how-to-lower-pool-ph.html',
    folder: 'guides/ph',
    canonicalPath: '/guides/ph/how-to-lower-pool-ph',
    title: 'How to Lower Pool pH: Step-by-Step Guide',
    metaDesc: 'How to lower pool pH with muriatic acid or dry acid. Safe dose table, step-by-step instructions, and how to avoid over-correcting.',
    ogDesc: 'Lower pool pH safely with muriatic acid or pH-down. Dose by pool volume, add slowly, and retest after 4 hours.',
    h1: 'How to Lower Pool pH',
    quickAnswer: 'Lower pool pH by adding muriatic acid (hydrochloric acid) or dry acid (sodium bisulfate). Always dilute first, add near a return jet with the pump running, and retest after 4–6 hours. For a 10,000-gallon pool, 3–4 ounces of 31% muriatic acid typically lowers pH by about 0.2 points.',
    keyTakeaways: [
      'Muriatic acid is the most effective pH-lowering chemical for pools',
      'Never add more than 16 oz per 10,000 gallons in a single treatment',
      'Always adjust alkalinity before pH for more stable long-term results',
      'Wear gloves and eye protection when handling muriatic acid'
    ],
    body: `    <p class="serp-direct"><strong>Lowering pH is a routine maintenance task. The key is small, incremental additions — never dump large quantities in one spot. Always test pH and total alkalinity together and adjust TA first if it is significantly out of range.</strong></p>
    <h2>Dose table: muriatic acid (31.45%)</h2>
    <table class="chart-table">
      <thead><tr><th>Pool size</th><th>To lower pH by 0.2</th><th>To lower pH by 0.5</th></tr></thead>
      <tbody>
        <tr><td>5,000 gal</td><td>~2 oz</td><td>~5 oz</td></tr>
        <tr><td>10,000 gal</td><td>~4 oz</td><td>~10 oz</td></tr>
        <tr><td>15,000 gal</td><td>~6 oz</td><td>~15 oz</td></tr>
        <tr><td>20,000 gal</td><td>~8 oz</td><td>~20 oz</td></tr>
        <tr><td>30,000 gal</td><td>~12 oz</td><td>~30 oz</td></tr>
      </tbody>
    </table>
    <p><em>These are starting estimates only -- your pool's actual dose depends on total alkalinity and other factors. The pH calculator gives direction and adjustment-size guidance, not an exact dose; add incrementally and retest.</em></p>
    <h2>Step-by-step process</h2>
    <ol>
      <li><strong>Test first</strong> — measure current pH and total alkalinity.</li>
      <li><strong>Check TA</strong> — if TA is above 120 ppm, lower it first by adding acid in front of a return jet and letting the pool aerate. Repeat until TA reaches 80–100 ppm.</li>
      <li><strong>Check direction and size</strong> — use the pool pH calculator, then add product per its label instructions.</li>
      <li><strong>Dilute the acid</strong> — always add acid to water (never water to acid). Use a plastic bucket.</li>
      <li><strong>Add with pump running</strong> — pour slowly near a return jet, not in one spot on the pool surface.</li>
      <li><strong>Wait 4–6 hours</strong>, then retest. Make another small adjustment if needed.</li>
    </ol>
    <section class="people-also-ask">
      <h2>Frequently Asked Questions</h2>
      <div class="paa-accordion">
${faqItems([
  ['How long after adding muriatic acid can you swim?', 'Wait at least 30 minutes after adding a small dose (less than 8 oz) and confirm the pump has circulated the water. For larger doses, wait 2–4 hours and retest before swimming.'],
  ['Can I use vinegar to lower pool pH?', 'Technically yes, but impractically — you would need gallons of household vinegar to move pH in a pool. Muriatic acid or sodium bisulfate (dry acid) are purpose-made and far more cost-effective.'],
  ['What if I add too much acid?', 'Over-acidifying drops pH below 7.0, which can irritate skin and eyes, corrode metal equipment, and etch plaster. Add sodium bicarbonate (baking soda) to raise pH back up, or just wait as aeration will naturally push it back up.'],
  ['Does CO2 injection lower pool pH?', 'Yes. CO2 gas injection systems dissolve CO2 into pool water, forming carbonic acid that lowers pH gradually and precisely. It\'s used in commercial pools and some high-end residential installations.']
])}
      </div>
    </section>
    <h2>Calculator</h2>
    <p><a href="${BASE}calculators/pool-ph-calculator.html" class="btn btn-primary">Pool pH Calculator</a> · <a href="${BASE}calculators/chemical-calculator.html">Full Chemical Calculator</a></p>
    <p>Reference: <a href="${BASE}pool-ph-levels-chart.html">Pool pH Levels Chart</a> · <a href="${BASE}pool-chemical-levels-chart.html">Pool Chemical Levels Chart</a></p>`
  },

  {
    slug: 'does-rain-lower-pool-ph.html',
    folder: 'guides/ph',
    canonicalPath: '/guides/ph/does-rain-lower-pool-ph',
    title: 'Does Rain Lower Pool pH?',
    metaDesc: 'Does rain lower pool pH? Rainwater is acidic (pH ~5.6) but the effect on pool pH depends on pool volume, TA, and how much rain fell.',
    ogDesc: 'Rainwater is slightly acidic but usually has only a small effect on pool pH. Learn when rain matters and when to retest.',
    h1: 'Does Rain Lower Pool pH?',
    quickAnswer: 'Yes, rainwater is slightly acidic (typically pH 5.5–6.5) and does lower pool pH slightly. However, the effect is usually small unless there is a major downpour. More importantly, rain dilutes all chemicals including chlorine and alkalinity, so always retest after heavy rain.',
    keyTakeaways: [
      'Rainwater pH is typically 5.5–6.5, lower than the ideal pool range of 7.2–7.6',
      'A light rain has minimal effect; a heavy storm can significantly lower pH and dilute all chemicals',
      'After any significant rain, retest FC, pH, TA, and CYA',
      'Heavy rain can introduce organic debris that creates chlorine demand'
    ],
    body: `    <p class="serp-direct"><strong>Light rain on a large pool causes minimal pH change. A heavy downpour introducing 1,000+ gallons of acidic rainwater will lower pH measurably — and dilute chlorine, alkalinity, and stabilizer that need to be replaced.</strong></p>
    <h2>How much does rain affect pool chemistry?</h2>
    <table class="chart-table">
      <thead><tr><th>Rain event</th><th>Expected pH change</th><th>Action needed</th></tr></thead>
      <tbody>
        <tr><td>Light drizzle (under 0.5 in)</td><td>Negligible (−0.1 or less)</td><td>Test but likely no adjustment needed</td></tr>
        <tr><td>Moderate rain (0.5–1 in)</td><td>−0.1 to −0.3</td><td>Retest; small acid or bicarb adjustment</td></tr>
        <tr><td>Heavy rain (1–3 in)</td><td>−0.3 to −0.6</td><td>Retest all parameters; adjust FC, pH, TA</td></tr>
        <tr><td>Major storm / flooding</td><td>Potentially −0.5 or more</td><td>Full chemistry rebalance; consider partial drain</td></tr>
      </tbody>
    </table>
    <h2>What else does rain do to pool water?</h2>
    <ul>
      <li><strong>Dilutes FC</strong> — chlorine concentration drops in proportion to how much water was added. Shock after heavy rain.</li>
      <li><strong>Lowers TA</strong> — alkalinity buffers pH and rain dilutes it, making pH less stable afterward.</li>
      <li><strong>Lowers CYA</strong> — stabilizer dilution leads to faster chlorine loss from sunlight.</li>
      <li><strong>Introduces organic matter</strong> — pollen, dirt, grass, and runoff create chlorine demand.</li>
    </ul>
    <section class="people-also-ask">
      <h2>Frequently Asked Questions</h2>
      <div class="paa-accordion">
${faqItems([
  ['Should I cover the pool before rain?', 'Covering the pool before a storm prevents dilution and debris introduction. For light rain, the benefit is modest; for heavy storms with runoff risk, covering is strongly recommended.'],
  ['Does acid rain affect pool chemistry more?', 'Acid rain (pH below 5) from industrial areas can have a stronger lowering effect, but most residential pool owners in urban areas should follow the same post-rain testing routine regardless.'],
  ['How long after heavy rain should I wait before testing?', 'Wait at least 1–2 hours after rain stops to allow the water to circulate and mix, then test FC, pH, and alkalinity. For flooding or major storms, test within the first 24 hours.']
])}
      </div>
    </section>
    <h2>Calculator</h2>
    <p><a href="${BASE}calculators/pool-ph-calculator.html" class="btn btn-primary">Pool pH Calculator</a> · <a href="${BASE}calculators/chemical-calculator.html">Full Chemical Calculator</a></p>
    <p>Reference: <a href="${BASE}pool-ph-levels-chart.html">Pool pH Levels Chart</a> · <a href="${BASE}pool-chemical-levels-chart.html">Pool Chemical Levels Chart</a></p>`
  },

  {
    slug: 'can-you-swim-in-high-ph-water.html',
    folder: 'guides/ph',
    canonicalPath: '/guides/ph/can-you-swim-in-high-ph-water',
    title: 'Can You Swim in High pH Pool Water?',
    metaDesc: 'Can you swim in high pH water? pH 7.8–8.0 is uncomfortable; above 8.0 risks irritation and drastically reduced chlorine. Full guidance inside.',
    ogDesc: 'High pH water reduces chlorine effectiveness and causes irritation. Learn when it\'s safe and when to correct before swimming.',
    h1: 'Can You Swim in High pH Pool Water?',
    quickAnswer: 'You can swim in pH up to about 7.8 with minor discomfort, but above 8.0 the water becomes increasingly irritating to eyes and skin, and more importantly, chlorine effectiveness drops sharply — at pH 8.0 only about 20% of FC is in the active form. Correct pH before prolonged swimming.',
    keyTakeaways: [
      'pH 7.2–7.6 is optimal; 7.6–7.8 is acceptable with close monitoring',
      'Above pH 8.0, chlorine is largely inactive — bacteria risk increases',
      'Eye irritation and cloudy water are the most common high-pH symptoms',
      'Correct pH to 7.4 before a pool party or heavy use'
    ],
    body: `    <p class="serp-direct"><strong>The risk of high pH is less about direct physical harm and more about the dramatic loss of chlorine activity. A pool at pH 8.0 with 2 ppm FC effectively has only 0.4 ppm of active sanitizer — far below safe levels.</strong></p>
    <h2>pH safety thresholds</h2>
    <table class="chart-table">
      <thead><tr><th>pH range</th><th>Comfort</th><th>Chlorine effectiveness</th><th>Action</th></tr></thead>
      <tbody>
        <tr><td>7.2–7.6</td><td>Ideal, comfortable</td><td>50–80% active HC1O</td><td>None</td></tr>
        <tr><td>7.6–7.8</td><td>Good</td><td>35–50% active</td><td>Monitor; adjust if drifting higher</td></tr>
        <tr><td>7.8–8.0</td><td>Mild irritation possible</td><td>20–35% active</td><td>Lower pH before heavy use</td></tr>
        <tr><td>8.0–8.5</td><td>Eye/skin irritation likely</td><td>Under 20% active</td><td>Do not swim; adjust chemistry</td></tr>
        <tr><td>&gt; 8.5</td><td>Significant risk</td><td>&lt; 5% active</td><td>Drain partial; major rebalance</td></tr>
      </tbody>
    </table>
    <h2>Signs your pool pH is too high</h2>
    <ul>
      <li>Cloudy or hazy water (high pH causes calcium carbonate precipitation)</li>
      <li>Scale buildup on tile, ladders, and equipment</li>
      <li>Eye and skin irritation after swimming</li>
      <li>Chlorine tabs or granules are not keeping FC up despite regular dosing</li>
    </ul>
    <section class="people-also-ask">
      <h2>Frequently Asked Questions</h2>
      <div class="paa-accordion">
${faqItems([
  ['Does high pH cause green pool?', 'High pH alone does not cause green water, but by making chlorine ineffective, it allows algae to thrive. A pool at pH 8.2 with 2 ppm FC is poorly sanitized and vulnerable to algae blooms.'],
  ['Can you swim in pH 8.0 water?', 'A brief swim is unlikely to cause serious harm, but prolonged swimming in pH 8.0 water will likely cause eye irritation. More importantly, the pool\'s chlorine is mostly inactive at that pH, creating a sanitation risk.'],
  ['What happens to your body in high pH water?', 'High pH water is mildly basic. It can strip natural oils from skin, cause dry skin and irritated eyes, and at extreme values (pH 10+) cause chemical burns — but pool water at pH 8.0–8.5 typically causes only mild discomfort.']
])}
      </div>
    </section>
    <h2>Calculator</h2>
    <p><a href="${BASE}calculators/pool-ph-calculator.html" class="btn btn-primary">Pool pH Calculator</a> · <a href="${BASE}calculators/chemical-calculator.html">Full Chemical Calculator</a></p>
    <p>Reference: <a href="${BASE}pool-ph-levels-chart.html">Pool pH Levels Chart</a> · <a href="${BASE}pool-chemical-levels-chart.html">Pool Chemical Levels Chart</a></p>`
  },

  {
    slug: 'what-causes-high-pool-ph.html',
    folder: 'guides/ph',
    canonicalPath: '/guides/ph/what-causes-high-pool-ph',
    title: 'What Causes High Pool pH?',
    metaDesc: 'High pool pH causes: CO2 off-gassing, high alkalinity, algae, aeration, SWG systems, and high-pH fill water. Fix guide and FAQ.',
    ogDesc: 'pH rises in pools for several natural reasons. Understanding the cause lets you correct it more efficiently.',
    h1: 'What Causes High Pool pH?',
    quickAnswer: 'The main causes of high pool pH are CO2 off-gassing from the water surface, high total alkalinity (which resists downward correction), aeration from jets or waterfalls, algae growth consuming dissolved CO2, salt water chlorine generators, and fill water that enters with a high pH.',
    keyTakeaways: [
      'CO2 off-gassing is the universal cause of pH rise in all pools',
      'High total alkalinity amplifies pH drift and makes correction harder',
      'Salt chlorine generators and aeration features accelerate pH rise significantly',
      'Lowering TA to 80–90 ppm is the most effective long-term pH stabilizer'
    ],
    body: `    <p class="serp-direct"><strong>Pool pH naturally rises over time due to the physics of water chemistry. The question is not whether it will rise, but how fast — and that depends on alkalinity, aeration, and chlorine type.</strong></p>
    <h2>Root causes of high pool pH</h2>
    <table class="chart-table">
      <thead><tr><th>Cause</th><th>Why it raises pH</th><th>How to address</th></tr></thead>
      <tbody>
        <tr><td>CO2 off-gassing</td><td>Dissolved CO2 forms carbonic acid; losing CO2 removes acid</td><td>Regular acid additions; lower TA</td></tr>
        <tr><td>Total alkalinity too high</td><td>TA buffers against acid; pH rebounds after each correction</td><td>Lower TA to 80–100 ppm first</td></tr>
        <tr><td>Waterfalls, jets, aerators</td><td>Agitation accelerates CO2 loss</td><td>Add acid more frequently; reduce aeration</td></tr>
        <tr><td>Algae growth</td><td>Algae photosynthesize, consuming CO2 and raising pH</td><td>Shock and treat algae; check pH</td></tr>
        <tr><td>Salt water chlorine generator</td><td>Electrolysis produces OH⁻ ions</td><td>Add muriatic acid 2–3× per week</td></tr>
        <tr><td>High-pH fill water</td><td>City water often at pH 7.8–8.0</td><td>Add acid when filling; retest</td></tr>
        <tr><td>Calcium hypochlorite (granular shock)</td><td>Slightly alkaline pH 11.5 product</td><td>Balance with acid after shocking</td></tr>
      </tbody>
    </table>
    <h2>The alkalinity factor</h2>
    <p>Total alkalinity (TA) is the root amplifier of pH problems. When TA is high (120+ ppm), any acid addition is quickly neutralized, and pH drifts back upward within days. Lower TA to 80–90 ppm and pH becomes far easier to stabilize with small periodic additions.</p>
    <section class="people-also-ask">
      <h2>Frequently Asked Questions</h2>
      <div class="paa-accordion">
${faqItems([
  ['Does adding baking soda raise pH?', 'Baking soda (sodium bicarbonate) primarily raises total alkalinity and has only a slight effect on pH. It is not effective for dramatically raising pH; use sodium carbonate (soda ash/pH-up) for that.'],
  ['Does high temperature cause high pH?', 'Warmer water holds less dissolved CO2, which causes faster off-gassing and faster pH rise. This is why pool pH rises more quickly in summer and in heated pools.'],
  ['Can I test pH myself or do I need a professional?', 'Standard test strips and drop-based kits accurately measure pH. A digital pH meter gives the most precise readings. Professional pool service is only needed for complex chemistry imbalances, not routine pH testing.']
])}
      </div>
    </section>
    <h2>Calculator</h2>
    <p><a href="${BASE}calculators/pool-ph-calculator.html" class="btn btn-primary">Pool pH Calculator</a> · <a href="${BASE}calculators/chemical-calculator.html">Full Chemical Calculator</a></p>
    <p>Reference: <a href="${BASE}pool-ph-levels-chart.html">Pool pH Levels Chart</a> · <a href="${BASE}pool-chemical-levels-chart.html">Pool Chemical Levels Chart</a></p>`
  }

];

// ─────────────────────────────────────────────────────────────────────────────
// HOT TUB CLUSTER
// ─────────────────────────────────────────────────────────────────────────────

const hotTubGuides = [

  {
    slug: 'hot-tub-chlorine-too-high.html',
    folder: 'guides/hot-tub',
    canonicalPath: '/guides/hot-tub/hot-tub-chlorine-too-high',
    title: 'Hot Tub Chlorine Too High: What to Do',
    metaDesc: 'Hot tub chlorine too high? FC above 10 ppm causes irritation. Steps to lower it fast: remove cover, run jets, or dilute. Full guide.',
    ogDesc: 'Hot tub chlorine above 10 ppm? Aerate and dilute to bring it back to the safe 3–5 ppm range before soaking.',
    h1: 'Hot Tub Chlorine Too High: What to Do',
    quickAnswer: 'Hot tub chlorine above 10 ppm is too high for safe soaking. Remove the cover to expose water to air, run the jets with the cover off for 30 minutes, and test again. FC above 20 ppm requires partial draining. Target range is 3–5 ppm for hot tubs.',
    keyTakeaways: [
      'Safe hot tub FC range is 3–5 ppm; above 10 ppm causes irritation',
      'Opening the cover and running jets reduces FC through aeration and UV',
      'Hot tubs are small — over-shocking is easy and common',
      'Always use the hot tub calculator to dose precisely before adding chemicals'
    ],
    body: `    <p class="serp-direct"><strong>Because hot tubs hold far less water than pools (200–600 gallons vs 10,000+), chemical overdose is much easier to cause. Use the hot tub chlorine calculator before adding any product, and measure FC before each soak.</strong></p>
    <h2>FC levels in hot tubs — what to do</h2>
    <table class="chart-table">
      <thead><tr><th>FC level</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        <tr><td>&lt; 1 ppm</td><td>Too low — risk of bacteria</td><td>Add chlorine; use calculator for dose</td></tr>
        <tr><td>1–3 ppm</td><td>Acceptable low end</td><td>Monitor; add before next use</td></tr>
        <tr><td>3–5 ppm</td><td>Ideal range</td><td>None required</td></tr>
        <tr><td>5–10 ppm</td><td>High — wait</td><td>Remove cover; run jets; retest in 30–60 min</td></tr>
        <tr><td>10–20 ppm</td><td>Very high — do not soak</td><td>Aerate; add fresh water to dilute</td></tr>
        <tr><td>&gt; 20 ppm</td><td>Over-dosed</td><td>Drain 25–50%, refill, rebalance</td></tr>
      </tbody>
    </table>
    <h2>Why hot tubs lose and gain chlorine differently</h2>
    <p>Hot tub water is at 100–104 °F — warm water dramatically accelerates chlorine dissipation. This means you need to dose more frequently, but also means high FC drops faster than in a cool pool. Removing the cover and running jets can reduce FC by 50% within an hour in a hot, aerated spa.</p>
    <h2>Spa-specific troubleshooting</h2>
    <ul>
      <li><strong>After shocking the hot tub:</strong> Wait 15–30 minutes minimum before cover-on, and 1–4 hours before soaking. Test before each use.</li>
      <li><strong>Automatic dispensers:</strong> If a floating chlorine dispenser was left in too long, remove it and aerate.</li>
      <li><strong>Trichlor tabs in hot tubs:</strong> These are not recommended for spas — they aggressively acidify water and can overdose a small volume.</li>
    </ul>
    <h2>Calculator</h2>
    <p><a href="${BASE}calculators/hot-tub-chlorine-calculator.html" class="btn btn-primary">Hot Tub Chlorine Calculator</a></p>
    <p>Reference: <a href="${BASE}pool-chemical-levels-chart.html">Pool Chemical Levels Chart</a></p>`
  },

  {
    slug: 'hot-tub-chlorine-too-low.html',
    folder: 'guides/hot-tub',
    canonicalPath: '/guides/hot-tub/hot-tub-chlorine-too-low',
    title: 'Hot Tub Chlorine Too Low: Causes and Fix',
    metaDesc: 'Hot tub chlorine too low? Below 1 ppm, bacteria can grow in minutes at spa temperatures. Causes, fast fix, and prevention guide.',
    ogDesc: 'Hot tub FC below 1 ppm is a health risk at high temperatures. Learn the causes and how to raise chlorine safely and quickly.',
    h1: 'Hot Tub Chlorine Too Low: Causes and Fix',
    quickAnswer: 'Hot tub chlorine below 1 ppm is unsafe — at 100–104 °F, bacteria multiply very rapidly in under-sanitized water. Add granular dichlor (sodium dichloro-s-triazinetrione) at the rate of 1 teaspoon per 200 gallons to raise FC by approximately 4–5 ppm, then test after 20 minutes before soaking.',
    keyTakeaways: [
      'Hot tubs lose chlorine much faster than pools due to high water temperature',
      'Below 1 ppm FC at spa temperatures can allow dangerous bacteria growth within hours',
      'Dichlor granules are the best product for raising FC in hot tubs quickly',
      'Test FC before every soak — temperature and use will deplete it rapidly'
    ],
    body: `    <p class="serp-direct"><strong>Low chlorine in a hot tub is a more serious health concern than in a pool. Hot water temperatures of 100–104 °F create ideal conditions for bacterial growth, including Legionella, pseudomonas, and E. coli. Test before every use.</strong></p>
    <h2>Causes of low hot tub chlorine</h2>
    <table class="chart-table">
      <thead><tr><th>Cause</th><th>How it depletes FC</th><th>Fix</th></tr></thead>
      <tbody>
        <tr><td>High water temperature</td><td>Heat dramatically accelerates chlorine breakdown</td><td>Dose more frequently; test before soaking</td></tr>
        <tr><td>Heavy bather load</td><td>Sweat, oils, cosmetics consume FC rapidly</td><td>Shock immediately after each use</td></tr>
        <tr><td>Long gap between uses</td><td>Even sitting still, hot tub FC degrades over days</td><td>Test and dose before each soak</td></tr>
        <tr><td>High CYA or phosphates</td><td>Interfere with chlorine effectiveness</td><td>Test CYA; partial drain if over 100 ppm</td></tr>
        <tr><td>pH too high (above 7.8)</td><td>High pH makes FC inactive</td><td>Lower pH to 7.2–7.6 first</td></tr>
      </tbody>
    </table>
    <h2>How to raise hot tub chlorine safely</h2>
    <ol>
      <li>Use <strong>dichlor granules</strong> — the standard product for hot tub sanitization. Unlike trichlor tablets, dichlor dissolves quickly and is suitable for spa use.</li>
      <li>Add with jets running. Pre-dissolve granules in a cup of water if possible.</li>
      <li>Dose: approximately <strong>1 teaspoon of dichlor per 200 gallons</strong> raises FC ~4 ppm.</li>
      <li>Retest after 20 minutes. Target 3–5 ppm before soaking.</li>
    </ol>
    <h2>Calculator</h2>
    <p><a href="${BASE}calculators/hot-tub-chlorine-calculator.html" class="btn btn-primary">Hot Tub Chlorine Calculator</a></p>
    <p>Reference: <a href="${BASE}pool-chemical-levels-chart.html">Pool Chemical Levels Chart</a></p>`
  },

  {
    slug: 'how-often-to-shock-a-hot-tub.html',
    folder: 'guides/hot-tub',
    canonicalPath: '/guides/hot-tub/how-often-to-shock-a-hot-tub',
    title: 'How Often to Shock a Hot Tub',
    metaDesc: 'How often to shock a hot tub: weekly minimum, after every 2–3 soaks, or when water looks dull. Shock schedule and product guide.',
    ogDesc: 'Shock your hot tub weekly — or after every 2–3 uses. Small volume and high heat mean organic waste builds up fast.',
    h1: 'How Often to Shock a Hot Tub',
    quickAnswer: 'Shock your hot tub once a week, or after every 2–3 soaks — whichever comes first. Hot tubs accumulate body oils, sweat, and cosmetics faster per gallon than pools because of the small volume and high temperatures. Non-chlorine (oxidizing) shock can be used between chlorine shocks.',
    keyTakeaways: [
      'Weekly shocking is the minimum for a regularly-used hot tub',
      'After heavy use (more than 2 people), shock the same evening',
      'Non-chlorine MPS shock is faster (wait 20 min) vs chlorine shock (wait 4–8 h)',
      'Shocking extends the life of your water — change hot tub water every 3–4 months'
    ],
    body: `    <p class="serp-direct"><strong>The ratio of bathers to water volume in a hot tub is dramatically higher than in a pool. One person in a 400-gallon hot tub introduces proportionally 25× more organic waste per gallon than the same person in a 10,000-gallon pool. Frequent shocking is essential.</strong></p>
    <h2>Hot tub shocking schedule</h2>
    <table class="chart-table">
      <thead><tr><th>Situation</th><th>When to shock</th><th>Product</th></tr></thead>
      <tbody>
        <tr><td>Regular weekly maintenance</td><td>Every 7 days</td><td>Dichlor or non-chlorine MPS</td></tr>
        <tr><td>After 2+ people soaking</td><td>Same evening after use</td><td>Non-chlorine MPS (faster re-entry)</td></tr>
        <tr><td>After parties or heavy use</td><td>Immediately after</td><td>Dichlor + non-chlorine MPS combo</td></tr>
        <tr><td>Cloudy or foamy water</td><td>Immediately</td><td>Chlorine shock; inspect filter</td></tr>
        <tr><td>After adding new fill water</td><td>Before first use</td><td>Dichlor to establish FC baseline</td></tr>
      </tbody>
    </table>
    <h2>Non-chlorine vs chlorine shock</h2>
    <p><strong>Chlorine shock (dichlor or calcium hypochlorite)</strong> raises FC and kills bacteria directly. Wait 4–8 hours or until FC drops below 5 ppm before soaking.</p>
    <p><strong>Non-chlorine shock (MPS — potassium monopersulfate)</strong> oxidizes organic waste without raising FC significantly. You can typically re-enter the spa 20–30 minutes after adding. Use MPS after every soak and chlorine shock weekly.</p>
    <h2>Signs you should shock immediately</h2>
    <ul>
      <li>Water looks dull, milky, or slightly green</li>
      <li>Strong chemical or musty smell</li>
      <li>Skin or eye irritation after soaking</li>
      <li>FC tests at zero</li>
      <li>Foam that doesn't disperse</li>
    </ul>
    <h2>Calculator</h2>
    <p><a href="${BASE}calculators/hot-tub-chlorine-calculator.html" class="btn btn-primary">Hot Tub Chlorine Calculator</a></p>
    <p>Reference: <a href="${BASE}pool-chemical-levels-chart.html">Pool Chemical Levels Chart</a></p>`
  },

  {
    slug: 'hot-tub-ph-too-low.html',
    folder: 'guides/hot-tub',
    canonicalPath: '/guides/hot-tub/hot-tub-ph-too-low',
    title: 'Hot Tub pH Too Low: Causes and Fix',
    metaDesc: 'Hot tub pH too low? Below 7.2 corrodes equipment, irritates skin, and destabilizes chlorine. Step-by-step fix with dose guide.',
    ogDesc: 'Hot tub pH below 7.2 is acidic and damages jets, heater elements, and acrylic surfaces. Here\'s how to correct it safely.',
    h1: 'Hot Tub pH Too Low: Causes and Fix',
    quickAnswer: 'Hot tub pH below 7.2 causes corrosion of metal components, degrades acrylic and rubber seals, causes eye and skin irritation, and makes chlorine lose stability. Raise pH by adding sodium carbonate (pH-up / soda ash) — about ½ teaspoon raises pH by 0.2 in a 250-gallon hot tub.',
    keyTakeaways: [
      'Hot tub pH should stay in the 7.2–7.8 range; below 7.2 is corrosive',
      'Over-use of dichlor granules (pH 6.0–7.0) is the most common cause of low pH',
      'Sodium carbonate (soda ash / pH-up) raises pH quickly in small spa volumes',
      'Always raise alkalinity first if TA is also low — it stabilizes pH correction'
    ],
    body: `    <p class="serp-direct"><strong>Low pH in a hot tub is more common than in pools because small volumes amplify chemical shifts. Dichlor — the most popular hot tub sanitizer — has a pH of about 6.0–7.0 and consistently drops pH over time with regular use.</strong></p>
    <h2>Causes of low hot tub pH</h2>
    <table class="chart-table">
      <thead><tr><th>Cause</th><th>pH impact</th><th>Fix</th></tr></thead>
      <tbody>
        <tr><td>Dichlor overuse</td><td>Each dose adds acid; drops 0.1–0.3 per treatment</td><td>Add pH-up (sodium carbonate) weekly</td></tr>
        <tr><td>Acidic fill water</td><td>Well water or treated municipal water below pH 7</td><td>Raise pH before first use each refill</td></tr>
        <tr><td>Low alkalinity</td><td>Without TA buffer, pH swings freely and trends low</td><td>Raise TA to 80–120 ppm with bicarb</td></tr>
        <tr><td>Heavy bather load</td><td>Sweat is slightly acidic</td><td>Monitor pH more frequently; adjust after use</td></tr>
        <tr><td>Over-addition of muriatic acid</td><td>Excess acid drops pH below target</td><td>Add sodium carbonate to correct</td></tr>
      </tbody>
    </table>
    <h2>Dose guide: raising pH in a hot tub</h2>
    <table class="chart-table">
      <thead><tr><th>Hot tub size</th><th>To raise pH by 0.2</th><th>To raise pH by 0.5</th></tr></thead>
      <tbody>
        <tr><td>250 gal</td><td>~½ tsp sodium carbonate</td><td>~1 tsp</td></tr>
        <tr><td>400 gal</td><td>~¾ tsp</td><td>~1½ tsp</td></tr>
        <tr><td>600 gal</td><td>~1 tsp</td><td>~2½ tsp</td></tr>
      </tbody>
    </table>
    <p>Add with jets running. Retest after 20 minutes. Never add more than 1 oz per 250 gallons in a single treatment.</p>
    <h2>Calculator</h2>
    <p><a href="${BASE}calculators/hot-tub-chlorine-calculator.html" class="btn btn-primary">Hot Tub Chlorine Calculator</a></p>
    <p>Reference: <a href="${BASE}pool-chemical-levels-chart.html">Pool Chemical Levels Chart</a></p>`
  },

  {
    slug: 'hot-tub-alkalinity-too-high.html',
    folder: 'guides/hot-tub',
    canonicalPath: '/guides/hot-tub/hot-tub-alkalinity-too-high',
    title: 'Hot Tub Alkalinity Too High: What to Do',
    metaDesc: 'Hot tub total alkalinity too high? Above 150 ppm causes cloudy water, scale, and pH that won\'t stay down. Step-by-step fix.',
    ogDesc: 'High TA in a hot tub causes cloudy water, stubborn high pH, and scale. Lower it with muriatic acid added in front of a jet.',
    h1: 'Hot Tub Alkalinity Too High: What to Do',
    quickAnswer: 'Hot tub total alkalinity above 150 ppm causes pH to resist correction, creates scale on surfaces and the heater, and clouds the water. Lower TA by adding small doses of muriatic acid directly in front of a return jet with the pump running, then aerate aggressively to allow CO2 to escape and bring pH back up.',
    keyTakeaways: [
      'Target total alkalinity for hot tubs is 80–120 ppm',
      'Lower TA with muriatic acid added in front of a jet — not broadcast across the surface',
      'After adding acid, aerate (jets on, cover off) to allow pH to recover naturally',
      'It is common to require 2–3 treatments over 24 hours to lower TA significantly'
    ],
    body: `    <p class="serp-direct"><strong>High total alkalinity makes pool and spa water resistant to pH adjustment — acids just get neutralized by the TA buffer. The technique for lowering TA is specific: add acid to a concentrated area, then aerate to let pH recover, then repeat.</strong></p>
    <h2>Signs of high alkalinity in a hot tub</h2>
    <ul>
      <li>pH that keeps rising and resists acid corrections</li>
      <li>Cloudy or milky water</li>
      <li>White scale on the shell, jets, and heater</li>
      <li>TA test reads above 150 ppm</li>
    </ul>
    <h2>How to lower hot tub alkalinity</h2>
    <table class="chart-table">
      <thead><tr><th>Step</th><th>Action</th><th>Details</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>Test TA and pH</td><td>Baseline both readings before treatment</td></tr>
        <tr><td>2</td><td>Add muriatic acid</td><td>In front of one jet only; 1–2 oz per 500 gal</td></tr>
        <tr><td>3</td><td>Run jets, cover off</td><td>30–60 minutes of aeration; CO2 escape raises pH</td></tr>
        <tr><td>4</td><td>Retest TA and pH</td><td>After 2–4 hours; repeat if TA still above 120 ppm</td></tr>
        <tr><td>5</td><td>Confirm pH</td><td>Aeration should bring pH to 7.4–7.6 without adding base</td></tr>
      </tbody>
    </table>
    <h2>Why the acid-aerate method works</h2>
    <p>Adding acid in a localized area temporarily drops TA in that zone. Aeration then drives off CO2, which naturally raises pH without adding alkalinity. Over 2–3 treatment cycles, TA drops while pH stabilizes in the correct range.</p>
    <h2>Calculator</h2>
    <p><a href="${BASE}calculators/hot-tub-chlorine-calculator.html" class="btn btn-primary">Hot Tub Chlorine Calculator</a></p>
    <p>Reference: <a href="${BASE}pool-chemical-levels-chart.html">Pool Chemical Levels Chart</a></p>`
  }

];

// ─────────────────────────────────────────────────────────────────────────────
// WRITE ALL FILES
// ─────────────────────────────────────────────────────────────────────────────

function writePages(pages) {
  let written = 0;
  for (const opts of pages) {
    const dir  = path.join(ROOT, opts.folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, opts.slug);
    fs.writeFileSync(file, html(opts), 'utf8');
    written++;
  }
  return written;
}

const total =
  writePages(chlorineGuides) +
  writePages(phGuides) +
  writePages(hotTubGuides);

console.log('generate-authority-guides: wrote ' + total + ' guide pages');
