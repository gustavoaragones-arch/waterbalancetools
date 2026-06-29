/**
 * Phase 7 — Question Guide Pages: 6 "why/can" question pages.
 * Writes to guides/questions/ folder. Idempotent — overwrites on each run.
 * Run: node scripts/generate-question-pages.js
 */

'use strict';
const fs   = require('fs');
const path = require('path');
const urlEngine = require('../js/url/url-engine');
const { SITE_HEADER, SITE_FOOTER } = require('./template-utils');

const ROOT = path.join(__dirname, '..');

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function breadcrumbSchema(canonicalPath, title) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://waterbalancetools.com/' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: urlEngine.absoluteUrl('/guides/pool-chemistry-basics') },
      { '@type': 'ListItem', position: 3, name: title, item: urlEngine.absoluteUrl(canonicalPath) }
    ]
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
    quickAnswer, keyTakeaways,
    explanation,
    causesTableHeaders, causesRows,
    howToFixSteps,
    relatedCalcs,
    faqs
  } = opts;

  const crumbSchema = breadcrumbSchema(canonicalPath, title);
  const faqSchema   = faqPageSchema(faqs);

  const calcLinks = relatedCalcs.map(([href, label]) =>
    '        <li><a href="' + urlEngine.href('/calculators/' + href) + '">' + esc(label) + '</a></li>'
  ).join('\n');

  const fixSteps = howToFixSteps.map(step =>
    '      <li>' + step + '</li>'
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${urlEngine.canonicalUrl(canonicalPath)}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${esc(metaDesc)}">
  <title>${esc(title)} | WaterBalanceTools</title>
  <meta property="og:title" content="${esc(title)} | WaterBalanceTools">
  <meta property="og:description" content="${esc(metaDesc)}">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="/style.css">
  <script type="application/ld+json">
  ${crumbSchema}
  </script>
  <script type="application/ld+json">
  ${faqSchema}
  </script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3974004697476579" crossorigin="anonymous"></script>
</head>
<body>
${SITE_HEADER}
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
    <h2>Direct Explanation</h2>
    <p>${explanation}</p>
    <h2>Common Causes</h2>
    <table class="chart-table">
      <thead>
${tableRowsTh(causesTableHeaders)}
      </thead>
      <tbody>
${tableRows(causesRows)}
      </tbody>
    </table>
    <h2>How To Fix It</h2>
    <ol>
${fixSteps}
    </ol>
    <h2>Related Calculators</h2>
    <ul class="ring-links">
${calcLinks}
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
    </section>
    <div class="ad ad-bottom"><!-- AdSense --></div>
    <p class="updated">Last updated: June 2026</p>
  </main>
${SITE_FOOTER}
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION PAGE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

const questionPages = [

  {
    slug: 'why-does-pool-water-turn-cloudy.html',
    canonicalPath: '/guides/questions/why-does-pool-water-turn-cloudy',
    title: 'Why Does Pool Water Turn Cloudy?',
    metaDesc: 'Why does pool water turn cloudy? Causes include low chlorine, high pH, poor filtration, algae, and heavy rain. Diagnosis steps and fix guide.',
    quickAnswer: 'Cloudy pool water is caused by low chlorine allowing algae or bacteria growth, high pH or alkalinity causing calcium carbonate precipitation, poor filtration, or heavy organic debris after storms. The fix depends on the cause — test all parameters first.',
    keyTakeaways: [
      'Cloudy water from low FC is a sanitation risk — shock immediately',
      'High pH (above 7.8) causes calcium carbonate precipitation that clouds water',
      'Poor filtration allows particles to remain suspended rather than being captured',
      'After identifying the cause, fix chemistry first, then run filter continuously'
    ],
    explanation: 'Pool water turns cloudy when tiny particles — biological (algae, bacteria), chemical (calcium carbonate), or physical (dust, debris) — become too numerous for the filter to remove quickly. The most common triggers are low free chlorine (allowing algae or bacteria to multiply), high pH combined with high alkalinity (causing calcium to precipitate), and overwhelmed or dirty filters. Heavy rain events compound all three problems simultaneously: rain dilutes chlorine, lowers pH, and introduces massive organic loads that cloud water within hours.',
    causesTableHeaders: ['Cause', 'Why It Happens', 'Fix'],
    causesRows: [
      ['Low FC (&lt;1 ppm)', 'Insufficient sanitization allows bacteria and algae growth', 'Shock pool to 10 ppm FC; test and adjust pH first'],
      ['High pH (&gt;7.8)', 'Calcium carbonate precipitates out of solution at high pH', 'Add muriatic acid to lower pH to 7.2–7.4'],
      ['High alkalinity', 'Carbonate clouds form in high-TA, high-pH conditions', 'Lower TA with acid-aerate method; target 80–120 ppm'],
      ['Poor filtration', 'Particles not removed — dirty or undersized filter', 'Backwash sand filter; clean cartridge; run filter 24 h'],
      ['Algae bloom', 'Early algae growth creates photosynthesis by-products', 'Shock + brush all surfaces + algaecide + run filter'],
      ['Heavy bather load', 'Organic waste from swimmers overwhelms sanitizer', 'Shock immediately after heavy use; retest FC in 24 h']
    ],
    howToFixSteps: [
      'Test all water parameters: FC, TC, pH, alkalinity, CYA, and calcium hardness.',
      'Adjust pH to 7.2–7.4 first — this is step one regardless of other findings.',
      'If FC is below 1 ppm, shock the pool immediately at a full 1 lb per 10,000 gallons.',
      'Clean or backwash the filter; run filtration continuously until water clears.',
      'Brush pool walls and floor to break up algae colonies or settled debris.',
      'Add a clarifier or flocculant if water remains hazy after 24 hours of chemical correction.',
      'Retest all parameters at 24 and 48 hours after treatment; adjust as needed.'
    ],
    relatedCalcs: [
      ['chemical-calculator.html', 'Full Chemical Calculator'],
      ['pool-shock-calculator.html', 'Pool Shock Calculator']
    ],
    faqs: [
      ['Is cloudy water safe to swim in?', 'No. Cloudy water reduces visibility (a drowning risk) and is usually caused by low chlorine or high microbial load — both present health risks. Do not allow swimming in cloudy water until it clears and FC is confirmed at 1–3 ppm with pH 7.2–7.6.'],
      ['How long does it take to clear cloudy water?', 'With the correct chemical fix and continuous filtration, mildly cloudy water clears in 12–24 hours. Heavily cloudy or green water from an algae bloom may take 2–5 days of repeated shocking, brushing, and filtering to fully clear.'],
      ['Can I use flocculant for cloudy water?', 'Yes. Flocculant (floc) groups small particles into larger clumps that sink to the pool floor for vacuuming to waste. It\'s most effective when chemistry is already balanced. Turn off the pump after adding flocculant, wait 8–12 hours, then vacuum to waste (not through the filter).'],
      ['Why is my pool cloudy after shocking?', 'Temporary cloudiness after shock is normal — the high FC is oxidizing organic matter and killing algae, which create byproducts that temporarily cloud the water. This typically clears within 24–48 hours as the filter removes the oxidized particles. Run the filter continuously after shocking.'],
      ['Why is my pool cloudy after rain?', 'Heavy rain introduces organic debris (pollen, dirt, bacteria), dilutes chlorine and alkalinity, and can significantly change pH. This combination reduces sanitizer effectiveness and introduces particles that cloud the water. After any significant rain, test all parameters and shock if FC has dropped.']
    ]
  },

  {
    slug: 'why-does-hot-tub-water-smell.html',
    canonicalPath: '/guides/questions/why-does-hot-tub-water-smell',
    title: 'Why Does Hot Tub Water Smell?',
    metaDesc: 'Why does hot tub water smell? Usually combined chlorine or bacteria. Causes table and step-by-step fix for chemical odor, sulfur smell, and musty odor.',
    quickAnswer: 'Hot tub water smell is almost always caused by combined chlorine (chloramines) — spent chlorine that has reacted with body waste. The "chlorine smell" is paradoxically a sign of too little effective chlorine, not too much. Shock immediately and improve the sanitizing routine.',
    keyTakeaways: [
      'Chemical smell = chloramines from combined chlorine, not excess free chlorine',
      'Sulfur smell often indicates bacteria growth or biofilm in the plumbing',
      'High TDS (total dissolved solids) from old water also causes odor',
      'Shock weekly and drain completely every 3–4 months to prevent persistent odor'
    ],
    explanation: 'Hot tub water odor has a small number of root causes, but the most common by far is combined chlorine (chloramines). When free chlorine reacts with nitrogen from sweat, urine, and cosmetics, it forms chloramine compounds that off-gas from the hot water surface, producing the characteristic chemical smell. Because hot water (100–104°F) is far more volatile than pool water, even small amounts of combined chlorine produce a noticeable odor. A fresh, properly maintained hot tub with near-zero combined chlorine and 3–5 ppm FC has almost no odor. If yours smells, it is almost certainly a sanitizer chemistry problem.',
    causesTableHeaders: ['Cause', 'Why It Happens', 'Fix'],
    causesRows: [
      ['Combined chlorine (chloramines)', 'FC reacted with nitrogen from sweat/cosmetics', 'Shock with dichlor or MPS; raise FC to 10+ ppm'],
      ['Bacteria growth', 'Insufficient sanitizer at hot tub temperatures', 'Add chlorine immediately; raise FC to 5 ppm minimum'],
      ['Old water (high TDS)', 'Accumulated dissolved solids and contaminants', 'Drain and refill completely; balance from scratch'],
      ['Biofilm in pipes', 'Bacteria colony resistant to chlorine in plumbing', 'Drain, clean, and purge lines with a pipe cleaner product'],
      ['High pH (&gt;7.8)', 'Chlorine mostly inactive; bacteria and odor compounds thrive', 'Lower pH to 7.2–7.6 before shocking']
    ],
    howToFixSteps: [
      'Remove the hot tub cover and test FC, CC, pH, and alkalinity.',
      'If pH is above 7.6, lower it first with a pH-down product before adding sanitizer.',
      'Shock with sodium dichloro to raise FC to 10+ ppm, or use MPS (non-chlorine shock) for a faster re-entry option.',
      'Run the jets at full power for 30 minutes with the cover off to purge chloramines.',
      'If a sulfur or musty smell persists after shocking, drain the tub, clean all surfaces, and add a pipe-purging product before refilling.',
      'After refilling, balance all chemistry fresh: pH 7.4, TA 80–120 ppm, CH 150–250 ppm, FC 3–5 ppm.',
      'Require all bathers to shower before soaking going forward; shock after each use.'
    ],
    relatedCalcs: [
      ['hot-tub-chlorine-calculator.html', 'Hot Tub Chlorine Calculator']
    ],
    faqs: [
      ['Why does my hot tub smell like rotten eggs?', 'A sulfur or rotten egg smell from a hot tub is usually caused by sulfur-reducing bacteria (Desulfovibrio species) growing in the water or plumbing, or by very high TDS from old water. This requires a full drain, pipe purge with a biofilm cleaner, surface scrub, and refill — shocking alone may not eliminate a sulfur bacteria colony.'],
      ['Why does my hot tub smell like chlorine when I first open it?', 'The strong chlorine odor when you first lift the cover is almost always combined chlorine (chloramines) that have been accumulating under the closed cover. It is not excess free chlorine. Chloramines volatilize more easily in warm, enclosed spaces. Shock the tub, run the jets with the cover off for 30 minutes, and the odor should dissipate significantly.'],
      ['How often should I drain my hot tub?', 'Drain and completely refill your hot tub every 3–4 months under regular use (2–4 people using it 2–3 times per week). With heavier use or large numbers of bathers, drain more frequently — every 6–8 weeks. The more people use the tub, the faster TDS accumulates and the harder chemistry becomes to maintain.'],
      ['Can a smelly hot tub make me sick?', 'Yes. A hot tub that smells bad from chloramines indicates under-sanitization — meaning potential bacteria like Pseudomonas aeruginosa or even Legionella can be present at elevated temperatures. "Hot tub rash" (folliculitis) and respiratory infections can result from poorly maintained spa water. Treat any odor issue as a sanitation failure, not just a cosmetic problem.']
    ]
  },

  {
    slug: 'can-you-swim-after-shocking-a-pool.html',
    canonicalPath: '/guides/questions/can-you-swim-after-shocking-a-pool',
    title: 'Can You Swim After Shocking a Pool?',
    metaDesc: 'Can you swim after shocking a pool? Wait until FC drops below 5 ppm — usually 8–24 hours. Wait times by shock dose, and how to speed up FC reduction.',
    quickAnswer: 'Wait until free chlorine drops below 5 ppm before swimming after shocking — typically 8–24 hours depending on shock dose and sunlight. For algae treatment shocks (10–20 ppm FC), wait 24–48 hours. Always test before entering. Running the pump and removing the cover speeds recovery.',
    keyTakeaways: [
      'Safe swimming threshold: FC below 5 ppm; ideally 1–3 ppm',
      'Standard weekly shock: wait 8–24 hours with pump running',
      'Algae treatment shock (high dose): wait 24–48 hours and test before swimming',
      'Never estimate based on time alone — always test FC before swimmers enter'
    ],
    explanation: 'Pool shock raises free chlorine to levels high enough to oxidize chloramines and kill algae — but those same elevated FC levels are too high for safe swimming. The American Red Cross and CDC guidelines recommend not swimming when FC exceeds 5 ppm. At 10–20+ ppm, high FC causes eye and skin irritation, bleaches swimwear, and can cause respiratory discomfort, especially in children. Recovery time depends on the shock dose used, water temperature, sunlight exposure, and pump runtime — all of which affect the rate at which FC naturally decreases.',
    causesTableHeaders: ['Scenario', 'FC Range After Shock', 'Typical Wait Time'],
    causesRows: [
      ['Normal weekly shock (1 lb/10k gal)', '8–15 ppm', '8–24 hours with pump running + sun'],
      ['Algae treatment (double/triple shock)', '15–30 ppm', '24–48 hours; test before swimming'],
      ['Extreme over-shock', 'FC &gt;30 ppm', '48–72 hours or partial drain/refill required'],
      ['Hot tub shock (dichlor)', '10–20 ppm spa volume', '4–8 hours; test before soaking']
    ],
    howToFixSteps: [
      'After adding shock, run the pump continuously and remove the pool cover.',
      'Allow direct sunlight to reach the pool — UV light is the fastest natural FC reducer.',
      'After the minimum wait time (8 hours for standard shock), test FC with a DPD test kit.',
      'If FC is still above 5 ppm, continue running the pump and retest every 2–4 hours.',
      'For FC above 20 ppm, consider draining 15–20% of the pool and refilling with fresh water.',
      'Do not use sodium thiosulfate (neutralizer) unless FC is critically high (30+ ppm) — it can over-deplete FC and leave the pool unprotected.',
      'Once FC reads below 5 ppm, confirm pH is 7.2–7.6 before allowing swimmers to enter.'
    ],
    relatedCalcs: [
      ['pool-shock-calculator.html', 'Pool Shock Calculator']
    ],
    faqs: [
      ['What happens if you swim in a shocked pool?', 'Swimming with FC above 10 ppm causes eye redness, skin irritation, throat and nasal irritation, and bleaching of swimwear and hair. At extreme levels (20+ ppm), it can cause chemical burns to mucous membranes. Children, pregnant women, and people with skin conditions are most sensitive. Always test before swimming.'],
      ['Can I shock the pool in the morning and swim at night?', 'For a standard weekly maintenance shock (1 lb per 10,000 gallons), FC typically drops from 10–15 ppm to below 5 ppm within 8–16 hours with the pump running and sunlight. Shocking in the morning and swimming in the evening is generally safe if you test FC and confirm it\'s below 5 ppm before allowing swimmers in.'],
      ['How do I make FC drop faster after shocking?', 'Remove the pool cover to maximize sunlight exposure (UV breaks down chlorine fastest). Keep the pump running at full speed. For FC above 20 ppm, drain 15–20% of the pool and refill with fresh water to dilute. Aeration from waterfalls or returns also helps. Avoid sodium thiosulfate unless FC is dangerously high — it can over-deplete sanitizer.'],
      ['Can children swim after shocking sooner than adults?', 'No — children are actually more sensitive to high chlorine levels than adults because they spend more time underwater and are more likely to swallow water. Wait until FC is below 5 ppm for all swimmers, and for children with sensitive skin or asthma, consider waiting until FC is below 3 ppm.']
    ]
  },

  {
    slug: 'can-rain-affect-pool-chemistry.html',
    canonicalPath: '/guides/questions/can-rain-affect-pool-chemistry',
    title: 'Can Rain Affect Pool Chemistry?',
    metaDesc: 'Can rain affect pool chemistry? Yes — rain dilutes chlorine, pH, alkalinity, and CYA while introducing organic debris. What to test and fix after rain.',
    quickAnswer: 'Yes. Rain dilutes free chlorine, pH, alkalinity, and CYA. It introduces organic debris that creates chlorine demand. After heavy rain (1 inch or more), test and rebalance all parameters. A quick shock after every significant rainstorm prevents algae from getting a foothold.',
    keyTakeaways: [
      'Rain dilutes all pool chemicals — FC, pH, TA, and CYA all drop after heavy rain',
      'Rainwater (pH 5.5–6.5) is acidic and lowers pool pH significantly in large amounts',
      'Organic debris from rain creates immediate chlorine demand',
      'Shock after every storm of 1 inch or more to prevent algae growth'
    ],
    explanation: 'Rain affects pool water through three mechanisms: dilution, pH change, and organic loading. Rainwater is slightly acidic (pH 5.5–6.5 typically), and in large volumes significantly lowers pool pH and total alkalinity. The dilution effect proportionally reduces FC, CYA, and calcium hardness concentrations. Most critically, rain introduces organic matter — pollen, bird droppings, airborne bacteria, grass, and soil runoff — that creates instant chlorine demand. After a major storm, pools can experience a simultaneous drop in all protective parameters precisely when organic contamination is highest, creating ideal conditions for rapid algae establishment.',
    causesTableHeaders: ['Rain Event', 'Effect on Pool Chemistry', 'Action Needed'],
    causesRows: [
      ['Light drizzle (&lt;0.5 in)', 'Negligible — minor dilution only', 'Test; likely no major adjustment needed'],
      ['Moderate rain (0.5–1 in)', 'FC drops 10–20%; pH may drop 0.1–0.3', 'Test FC, pH, TA; small adjustments likely needed'],
      ['Heavy rain (1–3 in)', 'Significant dilution of all parameters; organic load high', 'Full rebalance: FC, pH, TA, CYA; shock within 24 h'],
      ['Major storm / flooding', 'Severe dilution; possible contamination', 'Consider partial drain; full rebalance; shock immediately']
    ],
    howToFixSteps: [
      'After rain stops, wait 1–2 hours for water to circulate and mix before testing.',
      'Test FC, pH, total alkalinity, and CYA to get an accurate post-rain baseline.',
      'Adjust pH to 7.2–7.4 first using muriatic acid or pH-down product if it has dropped.',
      'Shock the pool if FC has dropped below 1 ppm or significant rain (1+ inch) occurred.',
      'Add sodium bicarbonate if TA has dropped below 80 ppm.',
      'Add CYA stabilizer if it has dropped below 30 ppm (outdoor pools only).',
      'Run the pump and filter continuously until chemistry stabilizes and water is clear.'
    ],
    relatedCalcs: [
      ['chemical-calculator.html', 'Full Chemical Calculator']
    ],
    faqs: [
      ['Does rain lower pool pH?', 'Yes. Rainwater is slightly acidic (pH 5.5–6.5 typically) and can lower pool pH when added in significant volumes. Light rain has minimal effect on a large pool, but heavy rainfall (1+ inch) can drop pool pH by 0.2–0.5 points. Always retest pH after significant rain and adjust with a pH-up product if needed.'],
      ['How long after rain should I test my pool?', 'Wait at least 1–2 hours after rain stops to allow the pool circulation system to fully mix the water before testing. For large storms that added significant rainfall, run the pump for a full turnover cycle (typically 6–8 hours) before taking your final baseline test.'],
      ['Does rain wash dirt and bacteria into pools?', 'Yes. Rainwater picks up pollen, soil, organic matter, bird droppings, and airborne bacteria as it flows toward and into the pool. Surface runoff from your yard can introduce grass clippings, fertilizers, and high levels of nitrogen that immediately consume FC and promote algae growth.'],
      ['Should I cover the pool before a storm?', 'Covering the pool before a storm prevents debris and dilution, which significantly reduces the post-storm chemistry correction needed. For light rain, the benefit is modest. For heavy storms with potential runoff, covering the pool is strongly recommended — it can prevent hours of cleanup and chemical rebalancing work.']
    ]
  },

  {
    slug: 'why-is-my-pool-green-but-chlorine-is-high.html',
    canonicalPath: '/guides/questions/why-is-my-pool-green-but-chlorine-is-high',
    title: 'Why Is My Pool Green But Chlorine Is High?',
    metaDesc: 'Pool green but chlorine is high? Usually high pH making chlorine ineffective, CYA chlorine lock, or dead algae still in water. Diagnosis and fix guide.',
    quickAnswer: 'A green pool with high chlorine usually means the chlorine is present but ineffective — most often because pH is too high (above 7.8), CYA is too high causing chlorine lock, or the test kit is reading combined chlorine as free. Fix pH and CYA before shocking again.',
    keyTakeaways: [
      'High pH makes chlorine mostly inactive — at pH 8.0, less than 20% of FC is effective',
      'CYA above 100 ppm causes chlorine lock — FC is present but over-stabilized',
      'OTO test kits cannot distinguish free from combined chlorine — use DPD',
      'Fix pH first before any additional shocking — it is the single most impactful correction'
    ],
    explanation: 'When a pool is green despite normal-looking chlorine readings, the chlorine is almost always present but unable to work. The most common cause is high pH — at pH 7.8, over 60% of FC is in the weak hypochlorite ion form, and at pH 8.0, less than 20% is in the active hypochlorous acid form. Even 5 ppm FC at pH 8.0 effectively provides less sanitizing power than 1 ppm FC at pH 7.2. The second most common cause is excessive CYA (above 80–100 ppm), which over-stabilizes chlorine into a tightly bound, largely unavailable state. Additionally, some test kits (particularly OTO kits using yellow/orange color comparison) measure total chlorine, not free chlorine — a pool with 0 ppm FC but high combined chlorine will test "high" but provide zero sanitation.',
    causesTableHeaders: ['Cause', 'Why Chlorine Reads High But Is Ineffective', 'Fix'],
    causesRows: [
      ['High pH (&gt;7.8)', 'FC mostly inactive at high pH; less than 20% is HOCl at pH 8.0', 'Lower pH to 7.2–7.4 first; then re-shock'],
      ['CYA too high (&gt;100 ppm)', 'Chlorine lock: FC bound by excess stabilizer and unavailable', 'Drain 30–50%; refill; rebalance CYA to 30–50 ppm'],
      ['False FC reading (OTO kit)', 'Kit reads total chlorine, not free — CC counted as FC', 'Use DPD test kit or test strip that shows FC separately'],
      ['Dead algae not filtered', 'Green particles remain suspended after killing', 'Run filter continuously; add clarifier; vacuum to waste'],
      ['Copper in water', 'Metal oxidation or algaecide creates green color, not algae', 'Test for metals; use metal sequestrant; check source water']
    ],
    howToFixSteps: [
      'Test pH first. If above 7.6, lower to 7.2–7.4 before any other treatment.',
      'Test CYA. If above 80 ppm, plan a partial drain (30–50%) and refill to dilute CYA.',
      'Switch to a DPD test kit if using OTO — verify you are reading free chlorine accurately.',
      'Test for metals (copper, iron) if the water is green but algae is not confirmed.',
      'After correcting pH (and CYA if needed), shock the pool to 10+ ppm FC calculated at the correct pH.',
      'Brush all surfaces vigorously to physically dislodge algae colonies from walls and floor.',
      'Run the filter continuously for 24–48 hours; backwash or clean as needed; test FC again.'
    ],
    relatedCalcs: [
      ['chemical-calculator.html', 'Full Chemical Calculator'],
      ['pool-ph-calculator.html', 'Pool pH Calculator']
    ],
    faqs: [
      ['Can you have too much chlorine in a green pool?', 'No — the problem isn\'t too much chlorine, it\'s that the chlorine is ineffective. Before adding more chlorine, lower pH to 7.2–7.4 (so existing FC becomes active), check CYA, and switch to a DPD test kit to get an accurate free chlorine reading. More chlorine added into high-pH or high-CYA water is largely wasted.'],
      ['How long does it take to clear a green pool?', 'After correcting pH and CYA, and applying the correct shock dose, a pool with mild algae may clear in 1–3 days with continuous filtration. Heavy algae (deep green or black-green water) may take 3–7 days of repeated shocking, brushing, and filtering to fully clear. Patience and consistent chemistry are key.'],
      ['Why does my pool turn green overnight?', 'A pool that turns green overnight almost always had an existing algae problem that was barely controlled — when FC drops to zero (often due to low CYA, high FC demand, or insufficient dosing), algae proliferates rapidly in warm water. It is rarely new algae; it is existing algae that was suppressed but not eliminated growing back without FC protection.']
    ]
  },

  {
    slug: 'why-is-my-hot-tub-foamy.html',
    canonicalPath: '/guides/questions/why-is-my-hot-tub-foamy',
    title: 'Why Is My Hot Tub Foamy?',
    metaDesc: 'Why is my hot tub foamy? Causes: body products, low calcium hardness, high TDS, detergent in swimwear. Fix guide and long-term prevention.',
    quickAnswer: 'Hot tub foam is caused by surfactants in the water — most often from body lotion, shampoo, laundry detergent on swimwear, or excessive TDS (total dissolved solids). Low calcium hardness also causes foaming. Treat with anti-foam product short-term; drain and refill to solve it permanently.',
    keyTakeaways: [
      'Foam is caused by surfactants (soaps, lotions, detergents) from bathers or swimwear',
      'Low calcium hardness (below 150 ppm) makes water prone to stable foam bubbles',
      'High TDS from old water means the water can\'t hold more chemistry — drain and refill',
      'Anti-foam products are a temporary fix; only a drain and refill permanently resolves foam from TDS'
    ],
    explanation: 'Hot tub foam forms when surfactants in the water lower surface tension enough that the jets create stable bubbles instead of bursting them. Surfactants enter the water primarily from bathers — body lotions, hair products, deodorants, and the laundry detergent residue in swimwear. Even small amounts create persistent foam at the turbulence levels jets produce. Low calcium hardness amplifies foaming because soft water (low dissolved minerals) forms more stable bubbles. Over time, as total dissolved solids (TDS) accumulate, the water becomes increasingly reactive to any surfactant contamination, and persistent foaming becomes a sign that the water needs to be completely replaced.',
    causesTableHeaders: ['Cause', 'Why It Causes Foam', 'Fix'],
    causesRows: [
      ['Body products (lotion, soap, shampoo)', 'Surfactants lower surface tension; jets create stable bubbles', 'Require bathers to shower before soaking; use anti-foam short-term'],
      ['Low calcium hardness (&lt;150 ppm)', 'Soft water forms more stable foam bubbles', 'Raise CH to 150–250 ppm with calcium chloride'],
      ['High TDS (&gt;1,500 ppm above start)', 'Water over-saturated with dissolved solids', 'Drain and refill completely (every 3–4 months)'],
      ['Detergent residue in swimwear', 'Soap in fabric leaches into hot tub water with jets', 'Rinse swimwear thoroughly without detergent before use'],
      ['Over-use of chemicals', 'Excess foaming agents in certain product formulations', 'Shock and test; switch to basic dichlor/MPS routine']
    ],
    howToFixSteps: [
      'Add a small amount of anti-foam (defoamer) product directly to the water to suppress existing foam immediately.',
      'Test calcium hardness — if below 150 ppm, add calcium chloride to raise it to 150–250 ppm.',
      'Test TDS if possible — if above 1,500 ppm over starting TDS, plan a full drain.',
      'Require all bathers to shower with soap and rinse completely before entering the hot tub.',
      'Rinse all swimwear without detergent before use — or better yet, use dedicated hot tub swimwear that is never washed with laundry detergent.',
      'If foam persists despite chemistry corrections, drain the hot tub completely, clean all surfaces and jets, and refill.',
      'After refilling, balance all chemistry fresh (pH 7.4, TA 80–120 ppm, CH 150–250 ppm, FC 3–5 ppm) before first use.'
    ],
    relatedCalcs: [
      ['hot-tub-chlorine-calculator.html', 'Hot Tub Chlorine Calculator']
    ],
    faqs: [
      ['Is hot tub foam dangerous?', 'Foam itself is not directly dangerous, but it is a symptom of a sanitation and chemistry problem. Water that produces persistent foam usually has high surfactant contamination, potentially low FC, or high TDS — conditions that reduce sanitizer effectiveness. Treat foam as a warning sign to test and correct chemistry, not just apply anti-foam.'],
      ['Will anti-foam fix the problem?', 'Anti-foam (defoamer) products suppress existing foam quickly but do not address the underlying cause. They are a temporary fix. If you use anti-foam and foam returns within a session or two, you have a chemistry problem (low CH, high TDS) that requires draining and refilling to permanently resolve.'],
      ['How do I prevent foam in my hot tub?', 'The most effective prevention: shower before soaking (removes lotions, oils, cosmetics), rinse swimwear without detergent, maintain calcium hardness at 150–250 ppm, and drain and refill every 3–4 months. These practices eliminate the root causes and make anti-foam products unnecessary.'],
      ['Does low pH cause foam in hot tubs?', 'Low pH alone doesn\'t directly cause foam, but it indicates chemistry imbalance and often accompanies low calcium hardness (which does cause foam). A complete chemistry test always reveals the actual culprit. Fix pH, TA, and CH together when treating hot tub foam.']
    ]
  }

];

// ─────────────────────────────────────────────────────────────────────────────
// WRITE ALL FILES
// ─────────────────────────────────────────────────────────────────────────────

const dir = path.join(ROOT, 'guides', 'questions');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let written = 0;
for (const opts of questionPages) {
  const file = path.join(dir, opts.slug);
  fs.writeFileSync(file, html(opts), 'utf8');
  written++;
}

console.log('generate-question-pages: wrote ' + written + ' question guide pages');
