/**
 * Generate tools/index.html - Index Acceleration Grid linking to all calculators and programmatic pages.
 * Run from project root after other generators: node scripts/generate-tools-index.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'tools', 'index.html');

const CALCULATORS = [
  { name: 'Pool Chlorine Calculator', url: '../calculators/pool-chlorine-calculator.html' },
  { name: 'Hot Tub Chlorine Calculator', url: '../calculators/hot-tub-chlorine-calculator.html' },
  { name: 'Pool Shock Calculator', url: '../calculators/pool-shock-calculator.html' },
  { name: 'Pool pH Calculator', url: '../calculators/pool-ph-calculator.html' },
  { name: 'Hot Tub pH Calculator', url: '../calculators/hot-tub-ph-calculator.html' },
  { name: 'Pool Volume Calculator', url: '../calculators/pool-volume-calculator.html' },
  { name: 'Spa Volume Calculator', url: '../calculators/spa-volume-calculator.html' },
  { name: 'Pool Alkalinity Calculator', url: '../calculators/pool-alkalinity-calculator.html' },
  { name: 'Pool Cyanuric Acid (CYA) Calculator', url: '../calculators/pool-cyanuric-acid-calculator.html' },
  { name: 'Saltwater Pool Salt Calculator', url: '../calculators/saltwater-pool-salt-calculator.html' },
  { name: 'Hot Tub Shock Calculator', url: '../calculators/hot-tub-shock-calculator.html' },
  { name: 'Pool Turnover Rate Calculator', url: '../calculators/pool-turnover-rate-calculator.html' },
  { name: 'Chemical Calculator (full)', url: '../calculators/chemical-calculator.html' },
  { name: 'Volume Calculator (legacy)', url: '../calculators/volume-calculator.html' }
];

const CHARTS = [
  { name: 'Pool Chemical Levels Chart', url: '../charts/pool-chemical-levels-chart.html' },
  { name: 'Hot Tub Chemical Levels Chart', url: '../charts/hot-tub-chemical-levels-chart.html' },
  { name: 'Pool Water Balance Chart', url: '../charts/pool-water-balance-chart.html' }
];

const MAINTENANCE = [
  { name: 'How to Balance Pool Water', url: '../maintenance/how-to-balance-pool-water.html' },
  { name: 'How to Fix Cloudy Hot Tub', url: '../maintenance/how-to-fix-cloudy-hot-tub.html' },
  { name: 'How Often to Add Chlorine to Pool', url: '../maintenance/how-often-add-chlorine-pool.html' }
];

const PRINTABLES = [
  { name: 'Pool Maintenance Checklist', url: '../printables/pool-maintenance-checklist.html' },
  { name: 'Hot Tub Maintenance Log', url: '../printables/hot-tub-maintenance-log.html' },
  { name: 'Airbnb Pool Turnover Checklist', url: '../printables/airbnb-pool-turnover-checklist.html' }
];

const COMPARISONS = [
  { name: 'Liquid Chlorine vs Tablets', url: '../comparisons/liquid-chlorine-vs-tablets.html' },
  { name: 'Chlorine vs Bromine for Hot Tubs', url: '../comparisons/chlorine-vs-bromine-hot-tub.html' },
  { name: 'Saltwater Pool vs Chlorine', url: '../comparisons/saltwater-pool-vs-chlorine.html' }
];

const REFERENCE = [
  { name: 'Pool Chemicals Explained', url: '../reference/pool-chemicals-explained.html' },
  { name: 'Common Pool Chemistry Mistakes', url: '../reference/common-pool-chemistry-mistakes.html' }
];

function listHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort();
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

function linkList(baseUrl, files) {
  return files.map(f => '<li><a href="' + baseUrl + f + '">' + friendlyTitle(f) + '</a></li>').join('\n        ');
}

const chlorineFiles = listHtml(path.join(ROOT, 'programmatic', 'chlorine'));
const shockFiles = listHtml(path.join(ROOT, 'programmatic', 'shock'));
const phFiles = listHtml(path.join(ROOT, 'programmatic', 'ph'));
const hotTubFiles = listHtml(path.join(ROOT, 'programmatic', 'hot-tubs'));
const problemFiles = listHtml(path.join(ROOT, 'programmatic', 'problems'));
const explanationFiles = listHtml(path.join(ROOT, 'programmatic', 'explanations'));
const behaviorFiles = listHtml(path.join(ROOT, 'programmatic', 'behavior'));

const chlorineLinks = linkList('../programmatic/chlorine/', chlorineFiles);
const shockLinks = linkList('../programmatic/shock/', shockFiles);
const phLinks = linkList('../programmatic/ph/', phFiles);
const hotTubLinks = linkList('../programmatic/hot-tubs/', hotTubFiles);
const problemLinks = linkList('../programmatic/problems/', problemFiles);
const explanationLinks = linkList('../programmatic/explanations/', explanationFiles);
const behaviorLinks = linkList('../programmatic/behavior/', behaviorFiles);

const calcList = CALCULATORS.map(c => '<li><a href="' + c.url + '">' + c.name + '</a></li>').join('\n        ');
const chartsList = CHARTS.map(c => '<li><a href="' + c.url + '">' + c.name + '</a></li>').join('\n        ');
const maintenanceList = MAINTENANCE.map(m => '<li><a href="' + m.url + '">' + m.name + '</a></li>').join('\n        ');
const printablesList = PRINTABLES.map(p => '<li><a href="' + p.url + '">' + p.name + '</a></li>').join('\n        ');
const comparisonsList = COMPARISONS.map(c => '<li><a href="' + c.url + '">' + c.name + '</a></li>').join('\n        ');
const referenceList = REFERENCE.map(r => '<li><a href="' + r.url + '">' + r.name + '</a></li>').join('\n        ');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="All pool and hot tub calculators and dosage guides. Pool chlorine, shock, pH, volume, and hot tub tools.">
  <title>All Pool & Hot Tub Tools | WaterBalanceTools</title>
  <meta property="og:title" content="All Pool & Hot Tub Tools | WaterBalanceTools">
  <meta property="og:description" content="Calculators and dosage guides for pool and hot tub chemistry.">
  <link rel="stylesheet" href="../style.css">
</head>
<body class="calc-page">
  <header class="site-header">
    <a href="../index.html" class="logo-link"><img src="../assets/logo.svg" alt="WaterBalanceTools" class="logo" width="180" height="36"></a>
    <nav class="nav">
      <a href="../calculators/chemical-calculator.html">Chemical Calculator</a>
      <a href="../calculators/pool-volume-calculator.html">Volume Calculator</a>
      <a href="../guides/pool-chemistry-basics.html">Chemistry Guide</a>
    </nav>
  </header>
  <main class="container">
    <section class="hero hero-compact">
      <h1>All Pool & Hot Tub Tools</h1>
      <p class="hero-sub">Calculators and dosage guides. Find your pool size or hot tub size for instant chemical amounts.</p>
    </section>
    <div class="tools-grid">
      <section>
        <h2>Pool calculators</h2>
        <ul>
        ${calcList}
        </ul>
      </section>
      <section>
        <h2>Pool size guides — chlorine</h2>
        <ul>
        ${chlorineLinks || '<li>Run generate-chlorine-pages.js to generate.</li>'}
        </ul>
      </section>
      <section>
        <h2>Pool size guides — shock</h2>
        <ul>
        ${shockLinks || '<li>Run generate-shock-pages.js to generate.</li>'}
        </ul>
      </section>
      <section>
        <h2>Pool size guides — pH</h2>
        <ul>
        ${phLinks || '<li>Run generate-ph-pages.js to generate.</li>'}
        </ul>
      </section>
      <section>
        <h2>Hot tub guides</h2>
        <ul>
        ${hotTubLinks || '<li>Run generate-hot-tub-pages.js to generate.</li>'}
        </ul>
      </section>
      <section>
        <h2>Problem-solving guides</h2>
        <ul>
        ${problemLinks || '<li>Run generate-problem-pages.js to generate.</li>'}
        </ul>
      </section>
      <section>
        <h2>Explanations (why / what)</h2>
        <ul>
        ${explanationLinks || '<li>Run generate-explanation-pages.js to generate.</li>'}
        </ul>
      </section>
      <section>
        <h2>Schedules &amp; behavior</h2>
        <ul>
        ${behaviorLinks || '<li>Run generate-behavior-pages.js to generate.</li>'}
        </ul>
      </section>
      <section>
        <h2>Maintenance guides</h2>
        <ul>
        ${maintenanceList}
        </ul>
      </section>
      <section>
        <h2>Chemical charts</h2>
        <ul>
        ${chartsList}
        </ul>
      </section>
      <section>
        <h2>Printable resources</h2>
        <ul>
        ${printablesList}
        </ul>
      </section>
      <section>
        <h2>Comparisons</h2>
        <ul>
        ${comparisonsList}
        </ul>
      </section>
      <section>
        <h2>Reference</h2>
        <ul>
        ${referenceList}
        </ul>
      </section>
    </div>
  </main>
  <footer class="site-footer">
    <nav class="footer-nav">
      <a href="../calculators/pool-volume-calculator.html">Pool Volume Calculator</a>
      <a href="../calculators/pool-chlorine-calculator.html">Pool Chlorine Calculator</a>
      <a href="../calculators/pool-shock-calculator.html">Pool Shock Calculator</a>
      <a href="../calculators/pool-ph-calculator.html">Pool pH Calculator</a>
      <a href="../charts/pool-chemical-levels-chart.html">Pool Chemical Levels Chart</a>
      <a href="../maintenance/how-to-balance-pool-water.html">Pool Maintenance Guide</a>
    </nav>
    <p class="footer-copy">&copy; WaterBalanceTools.com</p>
  </footer>
</body>
</html>
`;

if (!fs.existsSync(path.join(ROOT, 'tools'))) fs.mkdirSync(path.join(ROOT, 'tools'), { recursive: true });
fs.writeFileSync(OUT_FILE, html, 'utf8');
console.log(
  'Tools index: wrote tools/index.html (chlorine: ' +
    chlorineFiles.length +
    ', shock: ' +
    shockFiles.length +
    ', ph: ' +
    phFiles.length +
    ', hot-tub: ' +
    hotTubFiles.length +
    ', problems: ' +
    problemFiles.length +
    ', explanations: ' +
    explanationFiles.length +
    ', behavior: ' +
    behaviorFiles.length +
    ')'
);
