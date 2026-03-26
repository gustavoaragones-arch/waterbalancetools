/**
 * Credibility block (includes publisher) + footer legal on programmatic, calculators, and guides.
 * Idempotent. Run after build-link-matrix.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROG = path.join(ROOT, 'programmatic');
const CALC = path.join(ROOT, 'calculators');
const GUIDES = path.join(ROOT, 'guides');

const CREDIBILITY = `
    <section class="credibility">
      <ul class="credibility-trust">
        <li>Typical range: 1–3 ppm chlorine</li>
        <li>Recommended pH: 7.2–7.6</li>
        <li>Test water regularly</li>
      </ul>
      <p>WaterBalanceTools provides practical calculators and guides for pool and hot tub water chemistry.
These tools are designed to help maintain safe chlorine, pH, and total alkalinity within a healthy water balance.</p>
      <p class="meta publisher-meta">Published by Water Balance Tools · Operated by Albor Digital LLC</p>
    </section>`;

function walkHtmlFiles(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkHtmlFiles(full, out);
    else if (e.name.endsWith('.html')) out.push(path.relative(ROOT, full).replace(/\\/g, '/'));
  }
}

function hrefToLegal(relPath, file) {
  const dir = path.dirname(relPath);
  const depth = dir === '.' ? 0 : dir.split('/').length;
  const prefix = '../'.repeat(depth);
  return prefix + 'legal/' + file + '.html';
}

/** Remove standalone publisher lines so credibility is the single source (SERP order: … → link matrix → credibility). */
function stripAllPublisherMeta(html) {
  return html.replace(/<p class="meta publisher-meta">[\s\S]*?<\/p>\s*/g, '');
}

function injectCredibility(html) {
  if (html.includes('class="credibility"')) {
    return html.replace(/<section class="credibility">[\s\S]*?<\/section>/i, CREDIBILITY.trim());
  }
  if (html.includes('</main>')) {
    return html.replace(/<\/main>/i, CREDIBILITY + '\n  </main>');
  }
  if (/<article[^>]*class="[^"]*guide-content[^"]*"[^>]*>/i.test(html)) {
    return html.replace(/<\/article>/i, CREDIBILITY + '\n  </article>');
  }
  return html;
}

function ensureFooterLegal(html, relPath) {
  const block = html.match(/<footer class="site-footer"[^>]*>[\s\S]*?<\/footer>/i);
  if (!block) return html;
  const footerInner = block[0];
  if (footerInner.includes('legal/ownership.html') && footerInner.includes('legal/legal.html')) {
    return html;
  }
  const own = hrefToLegal(relPath, 'ownership');
  const leg = hrefToLegal(relPath, 'legal');
  const add =
    '\n      <a href="' +
    own +
    '">Ownership</a>\n      <a href="' +
    leg +
    '">Legal</a>';
  return html.replace(
    /(<footer class="site-footer">\s*<nav class="footer-nav">)([\s\S]*?)(<\/nav>)/i,
    (m, open, inner, close) => {
      if (inner.includes('legal/ownership.html') && inner.includes('legal/legal.html')) return m;
      return open + inner + add + '\n    ' + close;
    }
  );
}

function processFile(rel) {
  const full = path.join(ROOT, rel);
  let html = fs.readFileSync(full, 'utf8');
  html = stripAllPublisherMeta(html);
  html = injectCredibility(html);
  html = ensureFooterLegal(html, rel);
  fs.writeFileSync(full, html, 'utf8');
}

const files = [];
walkHtmlFiles(PROG, files);
walkHtmlFiles(CALC, files);
walkHtmlFiles(GUIDES, files);

let n = 0;
files.forEach(rel => {
  processFile(rel);
  n++;
});
console.log('inject-authority-layer: updated ' + n + ' pages (programmatic + calculators + guides)');
