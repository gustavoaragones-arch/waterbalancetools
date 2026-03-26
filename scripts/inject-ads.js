/**
 * Phase 3.7 — Non-invasive ad placeholders (AdSense-ready).
 * Tiered: programmatic (3), calculators (2), guides (2). Idempotent.
 * Run after inject-authority-layer.js. Replace client ID in ADSENSE_SCRIPT.
 * Usage: node scripts/inject-ads.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/** Async loader only; units use ins.adsbygoogle when you paste placements. */
const ADSENSE_SCRIPT =
  '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>';

const AD_INLINE = '\n    <div class="ad ad-inline"><!-- AdSense --></div>';
const AD_MID = '\n    <div class="ad ad-mid"><!-- AdSense --></div>';
const AD_BOTTOM = '\n    <div class="ad ad-bottom"><!-- AdSense --></div>';
const AD_RESULT = '\n    <div class="ad ad-result"><!-- AdSense --></div>';

/** Strip our ad placeholders (idempotent re-run). */
function stripAds(html) {
  return html.replace(/<div class="ad ad-[^"]*"[^>]*>\s*(?:<!--[\s\S]*?-->\s*)?<\/div>\s*/g, '');
}

function ensureAdsenseLoader(html) {
  if (html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) return html;
  if (!html.includes('</head>')) return html;
  return html.replace('</head>', '  ' + ADSENSE_SCRIPT + '\n</head>');
}

function injectMainMidAfterSecondSection(html) {
  return html.replace(/<main([^>]*)>([\s\S]*)<\/main>/i, (full, attrs, inner) => {
    let n = 0;
    const newInner = inner.replace(/<\/section>/gi, m => {
      n++;
      if (n === 2) return m + AD_MID;
      return m;
    });
    if (n < 2) return full;
    return '<main' + attrs + '>' + newInner + '</main>';
  });
}

function injectProgrammatic(html) {
  let h = html;
  if (h.includes('class="snippet"')) {
    h = h.replace(/(<div class="snippet">[\s\S]*?<\/div>)/, '$1' + AD_INLINE);
  }
  h = injectMainMidAfterSecondSection(h);
  h = h.replace(
    /(\s*)(<section class="link-matrix[^"]*"[^>]*>)/i,
    AD_BOTTOM + '\n$1$2'
  );
  return h;
}

function injectAfterResultPanel(html) {
  if (html.includes('id="result"')) {
    return html.replace(
      /(<div id="result"[^>]*class="[^"]*output-panel[^"]*"[^>]*>[\s\S]*?<\/div>)/i,
      '$1' + AD_RESULT
    );
  }
  if (html.includes('id="volume-output"')) {
    return html.replace(
      /(<div id="volume-output"[^>]*>[\s\S]*?<\/div>)/i,
      '$1' + AD_RESULT
    );
  }
  if (html.includes('id="output-panel"')) {
    return html.replace(
      /(<div id="output-panel"[^>]*>[\s\S]*?<\/div>)/i,
      '$1' + AD_RESULT
    );
  }
  return html;
}

function injectCalculator(html) {
  let h = injectAfterResultPanel(html);
  h = h.replace(/(\s*)(<section class="credibility">)/i, AD_BOTTOM + '\n$1$2');
  if (!h.includes('class="credibility"') && h.includes('</main>')) {
    h = h.replace('</main>', AD_BOTTOM + '\n  </main>');
  }
  return h;
}

function injectGuide(html) {
  let h = html;
  /** Prefer first h2 + paragraph (article-style); else first h2 + list. */
  const withP = h.replace(
    /(<h2>[^<]+<\/h2>\s*<p>[\s\S]*?<\/p>)/,
    '$1' + AD_MID
  );
  if (withP !== h) {
    h = withP;
  } else {
    h = h.replace(
      /(<h2>[^<]+<\/h2>\s*<ul>[\s\S]*?<\/ul>)/,
      '$1' + AD_MID
    );
  }
  if (h.includes('class="link-matrix"')) {
    h = h.replace(
      /(\s*)(<section class="link-matrix[^"]*"[^>]*>)/i,
      AD_BOTTOM + '\n$1$2'
    );
  } else if (h.includes('</main>')) {
    h = h.replace('</main>', AD_BOTTOM + '\n  </main>');
  } else if (/<article class="guide-content"/i.test(h)) {
    h = h.replace(/<\/article>/i, AD_BOTTOM + '\n  </article>');
  }
  return h;
}

function walkHtmlFiles(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkHtmlFiles(full, out);
    else if (e.name.endsWith('.html')) out.push(path.relative(ROOT, full).replace(/\\/g, '/'));
  }
}

function processFile(rel) {
  const full = path.join(ROOT, rel);
  let html = fs.readFileSync(full, 'utf8');
  if (!html.includes('</body>')) return false;

  html = stripAds(html);
  html = ensureAdsenseLoader(html);

  if (rel.startsWith('programmatic/')) {
    html = injectProgrammatic(html);
  } else if (rel.startsWith('calculators/')) {
    html = injectCalculator(html);
  } else if (rel.startsWith('guides/')) {
    html = injectGuide(html);
  } else {
    return false;
  }

  fs.writeFileSync(full, html, 'utf8');
  return true;
}

const files = [];
walkHtmlFiles(path.join(ROOT, 'programmatic'), files);
walkHtmlFiles(path.join(ROOT, 'calculators'), files);
walkHtmlFiles(path.join(ROOT, 'guides'), files);

let n = 0;
files.forEach(rel => {
  if (processFile(rel)) n++;
});
console.log('inject-ads: updated ' + n + ' pages');
