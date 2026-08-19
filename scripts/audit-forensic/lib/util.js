'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');

const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', 'templates', 'partials',
  'components', 'scripts', 'data', 'js', 'public', 'lib', 'functions',
  'docs', '.claude'
]);
const EXCLUDE_PATHS = new Set(['reports/phase-7a']);

function walkHtmlFiles(dir, out) {
  out = out || [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full);
    if (entry.isDirectory()) {
      const topSeg = rel.split(path.sep)[0];
      if (EXCLUDE_DIRS.has(topSeg) || EXCLUDE_PATHS.has(rel)) continue;
      walkHtmlFiles(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(rel);
    }
  }
  return out;
}

function readFile(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&mdash;|&ndash;/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCount(text) {
  if (!text) return 0;
  const m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}

function extractMain(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1] : null;
}

function normalizeForShingle(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9%.\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shingles(text, n) {
  n = n || 6;
  const words = normalizeForShingle(text).split(' ').filter(Boolean);
  const set = new Set();
  for (let i = 0; i <= words.length - n; i++) {
    set.add(words.slice(i, i + n).join(' '));
  }
  return set;
}

function jaccard(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  const [small, big] = setA.size < setB.size ? [setA, setB] : [setB, setA];
  for (const x of small) if (big.has(x)) inter++;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

function sha1(str) {
  return require('crypto').createHash('sha1').update(str).digest('hex').slice(0, 12);
}

function urlFromRelPath(relPath) {
  let p = relPath.replace(/\\/g, '/');
  // Match the literal filename "index.html" only (a path segment boundary
  // before it, or the whole string), not any name that merely ends with the
  // substring "index.html" (e.g. "saturation-index.html" is a real term
  // page, not a directory index).
  if (p === 'index.html' || p.endsWith('/index.html')) {
    p = p.slice(0, -'index.html'.length);
    if (p === '') return 'https://waterbalancetools.com/';
    return `https://waterbalancetools.com/${p}`;
  }
  p = p.replace(/\.html$/, '');
  return `https://waterbalancetools.com/${p}`;
}

function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function toCsv(rows, fields) {
  const lines = [fields.join(',')];
  for (const row of rows) {
    lines.push(fields.map((f) => csvEscape(row[f])).join(','));
  }
  return lines.join('\n') + '\n';
}

module.exports = {
  ROOT,
  walkHtmlFiles,
  readFile,
  stripTags,
  wordCount,
  extractMain,
  normalizeForShingle,
  shingles,
  jaccard,
  sha1,
  urlFromRelPath,
  toCsv,
  csvEscape,
};
