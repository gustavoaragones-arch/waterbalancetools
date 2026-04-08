/**
 * Internal linking matrix: same-silo (5), cross-silo (2), primary calculator (1), silo hub.
 * Programmatic pages: "Go deeper" (1 advanced + 1 edge guide) before the matrix.
 * Depth guide pool: guides/advanced, guides/edge-cases, guides/seasonal (see DEPTH_SILO).
 * Idempotent. Strips legacy aeo-cross-links sections. Inserts before credibility or </main>.
 * Run: node scripts/build-link-matrix.js
 */
const fs = require('fs');
const path = require('path');
const {
  getSiloForPath,
  getHubRel,
  getCalculatorRel,
  SILO_KEYS
} = require('./silo-map');

function hubAnchorLabel(silo) {
  if (silo === 'chlorine') return 'Chlorine guide (hub)';
  if (silo === 'ph') return 'pH guide (hub)';
  if (silo === 'alkalinity') return 'Alkalinity guide (hub)';
  if (silo === 'hotTubs') return 'Hot tub chemistry (hub)';
  return 'Pool chemistry basics (hub)';
}

const ROOT = path.join(__dirname, '..');
const PROG = path.join(ROOT, 'programmatic');
const CALC = path.join(ROOT, 'calculators');
const GUIDES_ADV = path.join(ROOT, 'guides/advanced');
const GUIDES_EDGE = path.join(ROOT, 'guides/edge-cases');
const GUIDES_SEASON = path.join(ROOT, 'guides/seasonal');

/** Explicit silos for depth guides (folder-aware overrides). */
const DEPTH_SILO = {
  'guides/advanced/chlorine-vs-saltwater.html': 'chlorine',
  'guides/advanced/pool-chemistry-balance-explained.html': 'general',
  'guides/advanced/chlorine-breakdown-sunlight.html': 'chlorine',
  'guides/advanced/cya-stabilizer-explained.html': 'chlorine',
  'guides/edge-cases/pool-temperature-effect-chlorine.html': 'chlorine',
  'guides/edge-cases/swimming-after-shocking-pool.html': 'chlorine',
  'guides/edge-cases/rain-effect-on-pool-chemistry.html': 'general',
  'guides/edge-cases/high-cya-chlorine-lock.html': 'chlorine',
  'guides/edge-cases/over-shocking-pool-effects.html': 'chlorine',
  'guides/seasonal/opening-pool-chemistry-checklist.html': 'general',
  'guides/seasonal/closing-pool-chemistry-winter.html': 'general',
  'guides/seasonal/summer-high-chlorine-demand.html': 'chlorine',
  'guides/seasonal/winter-pool-maintenance-chemistry.html': 'general'
};

const ADVANCED_PAGES = [
  { rel: 'guides/advanced/chlorine-vs-saltwater.html', label: 'Chlorine vs saltwater pools' },
  { rel: 'guides/advanced/pool-chemistry-balance-explained.html', label: 'Pool chemistry balance explained' },
  { rel: 'guides/advanced/chlorine-breakdown-sunlight.html', label: 'Chlorine breakdown in sunlight' },
  { rel: 'guides/advanced/cya-stabilizer-explained.html', label: 'CYA stabilizer explained' }
];

const EDGE_PAGES = [
  { rel: 'guides/edge-cases/pool-temperature-effect-chlorine.html', label: 'Pool temperature & chlorine' },
  { rel: 'guides/edge-cases/swimming-after-shocking-pool.html', label: 'Swimming after shocking' },
  { rel: 'guides/edge-cases/rain-effect-on-pool-chemistry.html', label: 'Rain & pool chemistry' },
  { rel: 'guides/edge-cases/high-cya-chlorine-lock.html', label: 'High CYA chlorine lock' },
  { rel: 'guides/edge-cases/over-shocking-pool-effects.html', label: 'Over-shocking effects' }
];

/** Allow `class="link-matrix card"` etc. */
const LINK_MATRIX_RE =
  /\s*<section class="link-matrix[^"]*"[^>]*>[\s\S]*?<\/section>\s*/gi;
const AEO_CROSS_RE = /\s*<section class="aeo-cross-links[^>]*>[\s\S]*?<\/section>\s*/gi;
const DEPTH_AUTH_RE =
  /\s*<section class="depth-authority[^"]*"[^>]*>[\s\S]*?<\/section>\s*/gi;
const HUB_CTA_RE = /<p class="silo-hub-cta">[\s\S]*?<\/p>\s*/i;

/** Match generate-tools-index friendlyTitle for consistent anchors */
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

const CALC_ANCHOR = {
  'pool-chlorine-calculator.html': 'Pool chlorine dosing calculator',
  'pool-shock-calculator.html': 'Pool shock dose calculator',
  'pool-ph-calculator.html': 'Pool pH adjustment calculator',
  'hot-tub-ph-calculator.html': 'Hot tub pH calculator',
  'pool-alkalinity-calculator.html': 'Pool alkalinity calculator',
  'hot-tub-chlorine-calculator.html': 'Hot tub chlorine calculator',
  'chemical-calculator.html': 'Full pool chemical calculator',
  'pool-volume-calculator.html': 'Pool volume calculator'
};

function anchorForPage(relPath) {
  const base = path.basename(relPath);
  if (CALC_ANCHOR[base]) {
    const t = CALC_ANCHOR[base];
    return t.split(/\s+/).slice(0, 8).join(' ');
  }
  const ft = friendlyTitle(base);
  return ft.split(/\s+/).filter(Boolean).slice(0, 8).join(' ');
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function hashStr(str) {
  let h = 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Programmatic-only: one advanced + one edge guide (deterministic per URL). */
function depthAuthoritySection(fromRel) {
  const h = hashStr(fromRel);
  const adv = ADVANCED_PAGES[h % ADVANCED_PAGES.length];
  const edge = EDGE_PAGES[(h + 17) % EDGE_PAGES.length];
  const aHref = esc(hrefTo(fromRel, adv.rel));
  const eHref = esc(hrefTo(fromRel, edge.rel));
  return (
    '\n    <section class="depth-authority card">\n' +
    '      <h2>Go deeper</h2>\n' +
    '      <ul class="ring-links">\n' +
    '        <li><a href="' +
    aHref +
    '">Advanced: ' +
    esc(adv.label) +
    '</a></li>\n' +
    '        <li><a href="' +
    eHref +
    '">Edge case: ' +
    esc(edge.label) +
    '</a></li>\n' +
    '      </ul>\n' +
    '    </section>\n'
  );
}

function hrefTo(fromRel, targetRelFromRoot) {
  const dir = path.dirname(path.join(ROOT, fromRel));
  return path.relative(dir, path.join(ROOT, targetRelFromRoot)).replace(/\\/g, '/');
}

function walkHtmlFiles(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkHtmlFiles(full, out);
    else if (e.name.endsWith('.html')) out.push(path.relative(ROOT, full).replace(/\\/g, '/'));
  }
}

function primaryCalcRel(silo, selfRel) {
  const chain = [
    getCalculatorRel(silo),
    'calculators/chemical-calculator.html',
    'calculators/pool-volume-calculator.html'
  ];
  const seen = new Set();
  for (const c of chain) {
    if (seen.has(c)) continue;
    seen.add(c);
    if (c !== selfRel) return c;
  }
  return 'calculators/pool-volume-calculator.html';
}

function primaryCalcAnchor(silo, calcRel) {
  const base = path.basename(calcRel);
  if (CALC_ANCHOR[base]) return CALC_ANCHOR[base];
  if (silo === 'chlorine') return 'Pool chlorine dosing calculator';
  if (silo === 'ph') return 'Pool pH adjustment calculator';
  if (silo === 'alkalinity') return 'Pool alkalinity calculator';
  if (silo === 'hotTubs') return 'Hot tub chlorine calculator';
  return 'Full pool chemical calculator';
}

function pickSame(silo, selfRel, pool, count, excludeRel) {
  const candidates = pool
    .filter(p => p.silo === silo && p.relPath !== selfRel && p.relPath !== excludeRel)
    .sort((a, b) => a.relPath.localeCompare(b.relPath));
  if (candidates.length === 0) return [];
  const start =
    selfRel.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % candidates.length;
  const out = [];
  for (let i = 0; i < candidates.length && out.length < count; i++) {
    const c = candidates[(start + i) % candidates.length];
    if (!out.some(x => x.relPath === c.relPath)) out.push(c);
  }
  return out.slice(0, count);
}

function pickCross(selfSilo, selfRel, pool, excludeSet) {
  const order = SILO_KEYS.filter(s => s !== selfSilo && s !== 'general');
  const out = [];
  let offset = selfRel.length % 5;
  for (const silo of order) {
    if (out.length >= 2) break;
    const candidates = pool
      .filter(
        p =>
          p.silo === silo &&
          p.relPath !== selfRel &&
          !(excludeSet && excludeSet.has(p.relPath))
      )
      .sort((a, b) => a.relPath.localeCompare(b.relPath));
    if (candidates.length) {
      const pick = candidates[offset % candidates.length];
      if (!out.some(x => x.relPath === pick.relPath)) out.push(pick);
    }
  }
  if (out.length < 2) {
    const general = pool
      .filter(
        p =>
          p.silo === 'general' &&
          p.relPath !== selfRel &&
          !(excludeSet && excludeSet.has(p.relPath))
      )
      .sort((a, b) => a.relPath.localeCompare(b.relPath));
    for (const p of general) {
      if (out.length >= 2) break;
      if (!out.some(x => x.relPath === p.relPath)) out.push(p);
    }
  }
  return out.slice(0, 2);
}

function uniqueAnchors(items) {
  const seen = new Set();
  return items.map(item => {
    let a = anchorForPage(item.relPath);
    let key = a.toLowerCase();
    let n = 0;
    while (seen.has(key)) {
      n++;
      a = anchorForPage(item.relPath) + ' — ' + n;
      key = a.toLowerCase();
    }
    seen.add(key);
    return { ...item, anchor: a };
  });
}

function buildMatrixSection(fromRel, pool) {
  const self = pool.find(p => p.relPath === fromRel);
  const silo = self ? self.silo : 'general';

  const calcRel = primaryCalcRel(silo, fromRel);
  const sameRaw = pickSame(silo, fromRel, pool, 5, calcRel);
  const sameSet = new Set(sameRaw.map(x => x.relPath));
  sameSet.add(calcRel);
  const crossRaw = pickCross(silo, fromRel, pool, sameSet);

  const same = uniqueAnchors(sameRaw).filter(x => x.relPath !== fromRel);
  let cross = uniqueAnchors(crossRaw).filter(x => x.relPath !== fromRel);
  const sameHrefSet = new Set(same.map(x => hrefTo(fromRel, x.relPath)));
  cross = cross.filter(x => !sameHrefSet.has(hrefTo(fromRel, x.relPath)));
  const calcHref = hrefTo(fromRel, calcRel);
  const calcLabel = primaryCalcAnchor(silo, calcRel);
  const hubRel = getHubRel(silo);
  const hubHref = hrefTo(fromRel, hubRel);
  const hubLabel = hubAnchorLabel(silo);

  const sameItems = same
    .map(
      x =>
        '        <li><a href="' +
        esc(hrefTo(fromRel, x.relPath)) +
        '">' +
        esc(x.anchor) +
        '</a></li>'
    )
    .join('\n');

  const crossItems = cross
    .map(
      x =>
        '        <li><a href="' +
        esc(hrefTo(fromRel, x.relPath)) +
        '">' +
        esc(x.anchor) +
        '</a></li>'
    )
    .join('\n');

  const toolsItems =
    '        <li><a href="' +
    esc(calcHref) +
    '">' +
    esc(calcLabel) +
    '</a></li>';

  const hubItem =
    '        <li><a href="' +
    esc(hubHref) +
    '">' +
    esc(hubLabel) +
    '</a></li>';

  return (
    '\n    <section class="link-matrix link-matrix--mid card">\n' +
    '      <h2>Related Pool Chemistry Guides</h2>\n' +
    '      <div class="matrix-group">\n' +
    '        <h3>Related in this topic</h3>\n' +
    '        <ul class="ring-links">\n' +
    sameItems +
    '\n        </ul>\n' +
    '        <h3>Related topics</h3>\n' +
    '        <ul class="ring-links">\n' +
    crossItems +
    '\n        </ul>\n' +
    '        <h3>Tools</h3>\n' +
    '        <ul class="ring-links">\n' +
    toolsItems +
    '\n        </ul>\n' +
    '        <h3>Hub guide</h3>\n' +
    '        <ul class="ring-links">\n' +
    hubItem +
    '\n        </ul>\n' +
    '      </div>\n' +
    '    </section>\n  '
  );
}

function injectHubCtaAfterHero(html, fromRel, silo) {
  if (fromRel.startsWith('programmatic/')) return html;
  if (silo === 'general') return html;
  if (/class="silo-hub-cta"/.test(html)) return html;
  const hubHref = hrefTo(fromRel, getHubRel(silo));
  const block =
    '\n    <p class="silo-hub-cta"><a href="' + esc(hubHref) + '">See full guide →</a></p>\n';
  const replaced = html.replace(
    /(<section class="hero[^"]*"[^>]*>[\s\S]*?<\/section>)/i,
    '$1' + block
  );
  return replaced;
}

function stripLegacySections(html) {
  let h = html.replace(LINK_MATRIX_RE, '');
  h = h.replace(AEO_CROSS_RE, '');
  h = h.replace(DEPTH_AUTH_RE, '');
  return h;
}

/** Fallback: before credibility or end of main */
function insertBeforeCredibilityOrMain(html, block) {
  if (html.includes('class="credibility"')) {
    return html.replace(/(\s*)(<section class="credibility">)/i, block + '$1$2');
  }
  return html.replace('</main>', block + '</main>');
}

/**
 * Prefer mid-content: after serp-cta, else after hero, else before credibility.
 * Keeps 5+2+calculator+hub links in the upper half of the page when possible.
 */
function insertMatrixMidContent(html, block) {
  const ctaRe = /<section class="card serp-cta">[\s\S]*?<\/section>/i;
  const mCta = html.match(ctaRe);
  if (mCta) {
    const end = html.indexOf(mCta[0]) + mCta[0].length;
    return html.slice(0, end) + block + html.slice(end);
  }
  const heroRe = /<section class="hero[^"]*"[^>]*>[\s\S]*?<\/section>/i;
  const mHero = html.match(heroRe);
  if (mHero && /<main[\s\S]*class="container"/i.test(html)) {
    const end = html.indexOf(mHero[0]) + mHero[0].length;
    return html.slice(0, end) + block + html.slice(end);
  }
  return insertBeforeCredibilityOrMain(html, block);
}

function processFile(rel, pool) {
  const full = path.join(ROOT, rel);
  let html = fs.readFileSync(full, 'utf8');
  if (!html.includes('</main>')) {
    console.warn('build-link-matrix: skip (no </main>):', rel);
    return false;
  }

  const self = pool.find(p => p.relPath === rel);
  const silo = self ? self.silo : 'general';

  html = stripLegacySections(html);
  html = html.replace(HUB_CTA_RE, '');
  html = injectHubCtaAfterHero(html, rel, silo);

  let block = '';
  if (rel.startsWith('programmatic/')) {
    block += depthAuthoritySection(rel);
  }
  block += buildMatrixSection(rel, pool);
  html = insertMatrixMidContent(html, block);
  fs.writeFileSync(full, html, 'utf8');
  return true;
}

function buildPool() {
  const files = [];
  walkHtmlFiles(PROG, files);
  walkHtmlFiles(CALC, files);
  walkHtmlFiles(GUIDES_ADV, files);
  walkHtmlFiles(GUIDES_EDGE, files);
  walkHtmlFiles(GUIDES_SEASON, files);
  return files.map(relPath => ({
    relPath,
    silo: DEPTH_SILO[relPath] ?? getSiloForPath(relPath)
  }));
}

const pool = buildPool();

let n = 0;
pool.forEach(p => {
  if (processFile(p.relPath, pool)) n++;
});

console.log(
  'build-link-matrix: updated ' + n + ' pages (programmatic + calculators + depth guides)'
);
