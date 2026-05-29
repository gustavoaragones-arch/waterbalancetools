/**
 * AdSense installer:
 *   1. Replace placeholder ca-pub-XXXXXXXXXXXXXXXX with real client ID on all HTML pages.
 *   2. Add <script> tag before </head> on content pages that don't have it yet.
 * Idempotent. Run: node scripts/inject-adsense.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CLIENT_ID = 'ca-pub-3974004697476579';
const PLACEHOLDER = 'ca-pub-XXXXXXXXXXXXXXXX';
const SCRIPT_TAG =
  '  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' +
  CLIENT_ID +
  '"\n       crossorigin="anonymous"></script>';

/** Pages/folders to never touch */
const SKIP_EXACT = new Set([
  '404.html',
  'all-pages.html',
  'components/ad.html',
  'components/global-schema.html',
  'templates/programmatic-template.html',
  'legal/legal.html',
  'legal/ownership.html'
]);
const SKIP_PREFIX = ['node_modules', '_site', '.git'];

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel = path.relative(ROOT, full).replace(/\\/g, '/');
    if (SKIP_PREFIX.some(p => rel.startsWith(p))) continue;
    if (e.isDirectory()) { walk(full, out); continue; }
    if (e.name.endsWith('.html')) out.push({ full, rel });
  }
}

const files = [];
walk(ROOT, files);

let replaced = 0;
let added = 0;

for (const { full, rel } of files) {
  if (SKIP_EXACT.has(rel)) continue;

  let html = fs.readFileSync(full, 'utf8');
  let changed = false;

  // 1. Replace placeholder with real client ID
  if (html.includes(PLACEHOLDER)) {
    html = html.split(PLACEHOLDER).join(CLIENT_ID);
    changed = true;
    replaced++;
  }

  // 2. Add tag if completely absent
  if (!html.includes(CLIENT_ID) && html.includes('</head>')) {
    html = html.replace('</head>', SCRIPT_TAG + '\n</head>');
    changed = true;
    added++;
  }

  if (changed) fs.writeFileSync(full, html, 'utf8');
}

console.log(
  'inject-adsense: replaced placeholder on ' + replaced + ' pages, ' +
  'added tag to ' + added + ' pages'
);
