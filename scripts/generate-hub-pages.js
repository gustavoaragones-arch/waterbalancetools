/**
 * Regenerate silo authority hub pages under guides/.
 * Run: node scripts/generate-hub-pages.js
 */
const fs = require('fs');
const path = require('path');
const { getSiloForPath, getCalculatorRel } = require('./silo-map');

const ROOT = path.join(__dirname, '..');
const PROG = path.join(ROOT, 'programmatic');
const CALC = path.join(ROOT, 'calculators');
const GUIDES = path.join(ROOT, 'guides');
const ALK = path.join(PROG, 'alkalinity');

function walkHtmlFiles(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkHtmlFiles(full, out);
    else if (e.name.endsWith('.html')) out.push(path.relative(ROOT, full).replace(/\\/g, '/'));
  }
}

function hrefFromGuides(targetRelFromRoot) {
  return path
    .relative(GUIDES, path.join(ROOT, targetRelFromRoot))
    .replace(/\\/g, '/');
}

function friendlyTitle(filename) {
  const mPool = filename.match(/for-(\d+)-gallon-pool/);
  const mTub = filename.match(/for-(\d+)-gallon-hot-tub/);
  const mPh = filename.match(/(raise|lower)-ph-in-(\d+)-gallon/);
  const mShock = filename.match(/shock-for-(\d+)-gallon/);
  const mHowShock = filename.match(/how-much-shock-for-(\d+)-gallon-pool/);
  const mHowPh = filename.match(/how-to-adjust-ph-from-([\d-]+)-to-([\d-]+)\.html/);
  const mHtChem = filename.match(/hot-tub-chemicals-for-(\d+)-gallons/);
  if (mTub) return 'Chlorine for ' + parseInt(mTub[1], 10).toLocaleString() + ' gal hot tub';
  if (mPh) return (mPh[1] === 'raise' ? 'Raise pH' : 'Lower pH') + ' — ' + parseInt(mPh[2], 10).toLocaleString() + ' gal pool';
  if (mShock) return 'Shock for ' + parseInt(mShock[1], 10).toLocaleString() + ' gal pool';
  if (mHowShock) return 'How much shock — ' + parseInt(mHowShock[1], 10).toLocaleString() + ' gal';
  if (mHowPh) return 'Adjust pH ' + mHowPh[1].replace(/-/g, '.') + ' → ' + mHowPh[2].replace(/-/g, '.');
  if (mHtChem) return 'Hot tub chemicals — ' + parseInt(mHtChem[1], 10) + ' gal';
  if (mPool) return 'Chlorine for ' + parseInt(mPool[1], 10).toLocaleString() + ' gal pool';
  const name = filename.replace(/-/g, ' ').replace('.html', '');
  return name.replace(/\b\w/g, c => c.toUpperCase());
}

function buildPool() {
  const files = [];
  walkHtmlFiles(PROG, files);
  walkHtmlFiles(CALC, files);
  return files.map(relPath => ({
    relPath,
    silo: getSiloForPath(relPath)
  }));
}

function linksForSilo(pool, siloKey) {
  return pool
    .filter(p => p.silo === siloKey)
    .sort((a, b) => a.relPath.localeCompare(b.relPath))
    .map(p => {
      const label = friendlyTitle(path.basename(p.relPath)).split(/\s+/).slice(0, 8).join(' ');
      return '      <li><a href="' + hrefFromGuides(p.relPath) + '">' + label + '</a></li>';
    })
    .join('\n');
}

function shell(meta) {
  const { title, desc, body, path: outPath } = meta;
  const html =
    '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <meta name="description" content="' +
    desc.replace(/"/g, '&quot;') +
    '">\n' +
    '  <title>' +
    title.replace(/</g, '') +
    ' | WaterBalanceTools</title>\n' +
    '  <meta property="og:title" content="' +
    title.replace(/"/g, '&quot;') +
    ' | WaterBalanceTools">\n' +
    '  <meta property="og:description" content="' +
    desc.replace(/"/g, '&quot;') +
    '">\n' +
    '  <meta property="og:type" content="website">\n' +
    '  <link rel="stylesheet" href="../style.css">\n' +
    '</head>\n' +
    '<body>\n' +
    '  <header class="site-header">\n' +
    '    <a href="../index.html" class="logo-link">\n' +
    '      <img src="../assets/logo.svg" alt="WaterBalanceTools" class="logo" width="180" height="36">\n' +
    '    </a>\n' +
    '    <nav class="nav">\n' +
    '      <a href="../calculators/chemical-calculator.html">Chemical Calculator</a>\n' +
    '      <a href="../calculators/pool-volume-calculator.html">Volume Calculator</a>\n' +
    '      <a href="pool-chemistry-basics.html">Chemistry Guide</a>\n' +
    '    </nav>\n' +
    '  </header>\n' +
    '  <article class="guide-content">\n' +
    body +
    '\n  </article>\n' +
    '  <footer class="site-footer">\n' +
    '    <nav class="footer-nav">\n' +
    '      <a href="../calculators/pool-volume-calculator.html">Pool Volume Calculator</a>\n' +
    '      <a href="../calculators/pool-chlorine-calculator.html">Pool Chlorine Calculator</a>\n' +
    '      <a href="../calculators/pool-shock-calculator.html">Pool Shock Calculator</a>\n' +
    '      <a href="../calculators/pool-ph-calculator.html">Pool pH Calculator</a>\n' +
    '      <a href="pool-chemistry-basics.html">Pool Chemistry Guide</a>\n' +
    '      <a href="../legal/ownership.html">Ownership</a>\n' +
    '      <a href="../legal/legal.html">Legal</a>\n' +
    '    </nav>\n' +
    '    <p class="footer-copy">&copy; WaterBalanceTools.com</p>\n' +
    '  </footer>\n' +
    '</body>\n' +
    '</html>\n';
  fs.writeFileSync(outPath, html, 'utf8');
}

function main() {
  if (!fs.existsSync(ALK)) {
    fs.mkdirSync(ALK, { recursive: true });
  }

  const pool = buildPool();
  const calcCh = hrefFromGuides(getCalculatorRel('chlorine'));
  const listCh = linksForSilo(pool, 'chlorine');

  shell({
    path: path.join(GUIDES, 'chlorine-guide.html'),
    title: 'Pool Chlorine Guide',
    desc: 'Sanitizer levels, shock, green pool recovery, and chlorine dosing for pools.',
    h1: 'Pool Chlorine Guide',
    body:
      '    <h1>Pool Chlorine Guide</h1>\n' +
      '    <p class="silo-hub-lead">Free chlorine keeps water safe. Use this hub to jump to dosage tables, shock guides, and problem fixes.</p>\n' +
      '    <h2>What chlorine does</h2>\n' +
      '    <p>Chlorine kills bacteria and algae and oxidizes contaminants. You measure <strong>free chlorine</strong> (what is available to sanitize) and sometimes <strong>combined chlorine</strong> (chloramines), which you want to keep low.</p>\n' +
      '    <h2>Ideal levels (1–3 ppm)</h2>\n' +
      '    <p>For most residential pools, maintain <strong>1–3 ppm</strong> free chlorine. Test two to three times per week; increase after heavy use, rain, or visible algae.</p>\n' +
      '    <h2>Common problems</h2>\n' +
      '    <p>Green water, high chlorine after overdosing, and cloudy water tie back to sanitizer, filtration, and balance. Follow the problem guides below and confirm volume before dosing.</p>\n' +
      '    <h2>Dosage calculations</h2>\n' +
      '    <p>Use the primary calculator for exact ounces from your test readings, then cross-check size-based tables on our programmatic pages.</p>\n' +
      '    <p><a href="' +
      calcCh +
      '" class="btn btn-primary">Open pool chlorine calculator</a></p>\n' +
      '    <h2>All chlorine &amp; shock pages</h2>\n' +
      '    <ul class="ring-links hub-silo-list">\n' +
      listCh +
      '\n    </ul>\n' +
      '    <p><a href="pool-chemistry-basics.html">← Pool chemistry basics</a></p>'
  });

  const listPh = linksForSilo(pool, 'ph');
  shell({
    path: path.join(GUIDES, 'ph-guide.html'),
    title: 'Pool pH Guide',
    desc: 'Ideal pH range, how acid and base moves pH, and links to adjustment guides.',
    h1: 'Pool pH Guide',
    body:
      '    <h1>Pool pH Guide</h1>\n' +
      '    <p class="silo-hub-lead">pH affects bather comfort, equipment, and how well chlorine works. Keep it in range before chasing small chlorine changes.</p>\n' +
      '    <h2>What pH controls</h2>\n' +
      '    <p>pH measures how acidic or basic water is. Low pH can corrode metal and irritate skin; high pH can drive scale and weaken chlorine.</p>\n' +
      '    <h2>Ideal range</h2>\n' +
      '    <p>Target roughly <strong>7.2–7.6</strong> for pools unless your kit or plaster notes otherwise.</p>\n' +
      '    <h2>Acid and base</h2>\n' +
      '    <p>Acid (e.g. muriatic or dry acid) lowers pH; soda ash or borates (per label) can raise it. Move slowly and retest—especially when alkalinity is out of range.</p>\n' +
      '    <h2>Calculator</h2>\n' +
      '    <p><a href="' +
      hrefFromGuides(getCalculatorRel('ph')) +
      '" class="btn btn-primary">Open pool pH calculator</a></p>\n' +
      '    <h2>All pH-related pages</h2>\n' +
      '    <ul class="ring-links hub-silo-list">\n' +
      listPh +
      '\n    </ul>\n' +
      '    <p><a href="pool-chemistry-basics.html">← Pool chemistry basics</a></p>'
  });

  const listAlk = linksForSilo(pool, 'alkalinity');
  shell({
    path: path.join(GUIDES, 'alkalinity-guide.html'),
    title: 'Pool Alkalinity Guide',
    desc: 'Total alkalinity as a pH buffer, ideal range, and adjustment tools.',
    h1: 'Pool Alkalinity Guide',
    body:
      '    <h1>Pool Alkalinity Guide</h1>\n' +
      '    <p class="silo-hub-lead">Total alkalinity buffers pH so it does not swing wildly when you add chemicals or top off water.</p>\n' +
      '    <h2>What alkalinity does</h2>\n' +
      '    <p>It is the water’s capacity to resist pH change—often tied to bicarbonate and carbonate species. Fix alkalinity before large pH moves when possible.</p>\n' +
      '    <h2>Typical range</h2>\n' +
      '    <p>Many pools use <strong>80–120 ppm</strong> total alkalinity; follow your surface and sanitizer system for specifics.</p>\n' +
      '    <h2>Low vs high</h2>\n' +
      '    <p>Low alkalinity leads to pH bounce; high alkalinity can lock pH high until you lower TA in a controlled way.</p>\n' +
      '    <h2>Calculator</h2>\n' +
      '    <p><a href="' +
      hrefFromGuides(getCalculatorRel('alkalinity')) +
      '" class="btn btn-primary">Open pool alkalinity calculator</a></p>\n' +
      '    <h2>All alkalinity-related pages</h2>\n' +
      '    <ul class="ring-links hub-silo-list">\n' +
      listAlk +
      '\n    </ul>\n' +
      '    <p><a href="pool-chemistry-basics.html">← Pool chemistry basics</a></p>'
  });

  const listHt = linksForSilo(pool, 'hotTubs');
  shell({
    path: path.join(GUIDES, 'hot-tub-chemistry.html'),
    title: 'Hot Tub Chemistry Guide',
    desc: 'Spa volume, chlorine or bromine context, and hot-tub dosing tables.',
    h1: 'Hot Tub Chemistry',
    body:
      '    <h1>Hot Tub Chemistry</h1>\n' +
      '    <p class="silo-hub-lead">Smaller volume and higher temperature mean faster chemical swings—test often and dose conservatively.</p>\n' +
      '    <h2>Sanitizer</h2>\n' +
      '    <p>Many spas use chlorine or bromine; follow your product line and local health guidance. Our tools focus on chlorine-based dosing examples.</p>\n' +
      '    <h2>Volume matters</h2>\n' +
      '    <p>Confirm gallons before adding shock or sanitizer; use the spa volume calculator when unsure.</p>\n' +
      '    <h2>Calculator</h2>\n' +
      '    <p><a href="' +
      hrefFromGuides(getCalculatorRel('hotTubs')) +
      '" class="btn btn-primary">Open hot tub chlorine calculator</a></p>\n' +
      '    <h2>All hot tub pages</h2>\n' +
      '    <ul class="ring-links hub-silo-list">\n' +
      listHt +
      '\n    </ul>\n' +
      '    <p><a href="pool-chemistry-basics.html">← Pool chemistry basics</a></p>'
  });

  console.log('generate-hub-pages: wrote chlorine-guide, ph-guide, alkalinity-guide, hot-tub-chemistry');
}

main();

module.exports = { main };
