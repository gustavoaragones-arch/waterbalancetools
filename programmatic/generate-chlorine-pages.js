/**
 * WaterBalanceTools — generate programmatic "How much chlorine for X gallon pool?" pages.
 * Run with Node: node generate-chlorine-pages.js
 * Writes HTML files to ../programmatic/ (same folder as this script).
 */

var fs = require('fs');
var path = require('path');

var OUTPUT_DIR = path.join(__dirname);
var GALLONS_LIST = [5000, 10000, 15000, 20000, 7500, 25000, 30000];

// Liquid 10%: oz = (gallons * ppm) / 128000
// Granular: oz = (gallons * ppm) / 10000
function liquidOz(gallons, ppm) {
  return (gallons * ppm) / 128000;
}
function granularOz(gallons, ppm) {
  return (gallons * ppm) / 10000;
}

function formatNum(n) {
  return n.toLocaleString();
}

function generatePage(gallons) {
  var to2ppmLiq = liquidOz(gallons, 2).toFixed(1);
  var to2ppmGran = granularOz(gallons, 2).toFixed(1);
  var to3ppmLiq = liquidOz(gallons, 3).toFixed(1);
  var to3ppmGran = granularOz(gallons, 3).toFixed(1);
  var slug = 'how-much-chlorine-for-' + formatNum(gallons).replace(/,/g, '') + '-gallon-pool';
  var title = 'How Much Chlorine for a ' + formatNum(gallons) + ' Gallon Pool? | WaterBalanceTools';
  var headline = 'How Much Chlorine for a ' + formatNum(gallons) + ' Gallon Pool?';

  var html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <meta name="description" content="Chlorine dosage for a ' + formatNum(gallons) + ' gallon pool. Liquid and granular amounts to reach 2–3 ppm. Free calculator.">\n  <title>' + title + '</title>\n  <meta property="og:title" content="' + headline + '">\n  <meta property="og:description" content="Chlorine amounts for a ' + formatNum(gallons) + ' gallon pool.">\n  <meta property="og:type" content="website">\n  <link rel="stylesheet" href="../style.css">\n</head>\n<body class="calc-page">\n  <header class="site-header">\n    <a href="../index.html" class="logo-link"><img src="../assets/logo.svg" alt="WaterBalanceTools" class="logo" width="180" height="36"></a>\n    <nav class="nav">\n      <a href="../calculators/chemical-calculator.html">Chemical Calculator</a>\n      <a href="../calculators/volume-calculator.html">Volume Calculator</a>\n      <a href="../guides/pool-chemistry-basics.html">Chemistry Guide</a>\n    </nav>\n  </header>\n  <main class="container">\n    <section class="hero hero-compact">\n      <h1>' + headline + '</h1>\n      <p class="hero-sub">Approximate chlorine amounts for a ' + formatNum(gallons) + ' gallon pool (from 0 ppm).</p>\n    </section>\n    <div class="output-panel">\n      <h3>Chlorine dosage (to reach target from 0 ppm)</h3>\n      <ul>\n        <li><strong>To 2 ppm:</strong> ' + to2ppmLiq + ' oz liquid chlorine (10%) or ' + to2ppmGran + ' oz granular shock</li>\n        <li><strong>To 3 ppm:</strong> ' + to3ppmLiq + ' oz liquid chlorine (10%) or ' + to3ppmGran + ' oz granular shock</li>\n      </ul>\n      <p>For your exact current level, use our calculator below.</p>\n    </div>\n    <section class="related-tools">\n      <h2>Related tools</h2>\n      <ul class="ring-links">\n        <li><a href="../calculators/pool-chlorine-calculator.html">Pool Chlorine Calculator</a></li>\n        <li><a href="../calculators/pool-volume-calculator.html">Pool Volume Calculator</a></li>\n        <li><a href="../calculators/pool-shock-calculator.html">Pool Shock Calculator</a></li>\n        <li><a href="../guides/pool-chemistry-basics.html">Pool Chemistry Guide</a></li>\n      </ul>\n    </section>\n  </main>\n  <footer class="site-footer">\n    <nav class="footer-nav">\n      <a href="../calculators/pool-volume-calculator.html">Pool Volume Calculator</a>\n      <a href="../calculators/pool-chlorine-calculator.html">Pool Chlorine Calculator</a>\n      <a href="../calculators/pool-shock-calculator.html">Pool Shock Calculator</a>\n      <a href="../calculators/pool-ph-calculator.html">Pool pH Calculator</a>\n      <a href="../guides/pool-chemistry-basics.html">Pool Chemistry Guide</a>\n    </nav>\n    <p class="footer-copy">&copy; WaterBalanceTools.com</p>\n  </footer>\n</body>\n</html>';

  return { slug: slug + '.html', html: html };
}

GALLONS_LIST.forEach(function (gallons) {
  var out = generatePage(gallons);
  var filePath = path.join(OUTPUT_DIR, out.slug);
  fs.writeFileSync(filePath, out.html, 'utf8');
  console.log('Wrote ' + out.slug);
});

console.log('Done. Generated ' + GALLONS_LIST.length + ' pages.');
