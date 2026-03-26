/**
 * Semantic consistency: preferred pool water chemistry terminology.
 * Skips <script> and <style> contents. Run after generators and inject-authority-layer.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIRS = [
  path.join(ROOT, 'programmatic'),
  path.join(ROOT, 'calculators'),
  path.join(ROOT, 'guides')
];

/** Longer / more specific patterns first. */
const REPLACEMENTS = [
  [/chem mix/gi, 'pool water chemistry'],
  [/water stuff/gi, 'pool water chemistry'],
  [/pool chemicals levels/gi, 'pool water chemistry'],
  [/chlorine amount/gi, 'chlorine levels'],
  [/\bpH levels\b/gi, 'pH balance']
];

function walkHtmlFiles(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkHtmlFiles(full, out);
    else if (e.name.endsWith('.html')) out.push(path.relative(ROOT, full).replace(/\\/g, '/'));
  }
}

function protectScripts(html) {
  const scripts = [];
  const styled = html.replace(/(<script[^>]*>[\s\S]*?<\/script>)/gi, m => {
    scripts.push(m);
    return '\0SCRIPT' + (scripts.length - 1) + '\0';
  });
  const styles = [];
  const noStyle = styled.replace(/(<style[^>]*>[\s\S]*?<\/style>)/gi, m => {
    styles.push(m);
    return '\0STYLE' + (styles.length - 1) + '\0';
  });
  return { noStyle, scripts, styles };
}

function restoreScripts(text, scripts, styles) {
  let out = text;
  scripts.forEach((s, i) => {
    out = out.replace('\0SCRIPT' + i + '\0', s);
  });
  styles.forEach((s, i) => {
    out = out.replace('\0STYLE' + i + '\0', s);
  });
  return out;
}

function applyReplacements(chunk) {
  let s = chunk;
  for (const [re, rep] of REPLACEMENTS) {
    s = s.replace(re, rep);
  }
  s = s.replace(/\bpool chemicals\b(?!\s+explained)/gi, 'pool water chemistry');
  return s;
}

function normalizeProgrammaticTitles(html, relPath) {
  if (!relPath.startsWith('programmatic/')) return html;
  let h = html;
  h = h.replace(/\|\s*WaterBalanceTools\s*<\/title>/gi, '| Pool Water Chemistry Guide</title>');
  h = h.replace(
    /(<meta\s+property="og:title"\s+content="[^"]*)\|\s*WaterBalanceTools(")/gi,
    '$1| Pool Water Chemistry Guide$2'
  );
  return h;
}

function processFile(rel) {
  const full = path.join(ROOT, rel);
  let html = fs.readFileSync(full, 'utf8');
  const before = html;
  const { noStyle, scripts, styles } = protectScripts(html);
  let body = applyReplacements(noStyle);
  body = restoreScripts(body, scripts, styles);
  body = normalizeProgrammaticTitles(body, rel);
  if (body !== before) fs.writeFileSync(full, body, 'utf8');
  return body !== before;
}

const files = [];
DIRS.forEach(d => walkHtmlFiles(d, files));

let changed = 0;
files.forEach(rel => {
  if (processFile(rel)) changed++;
});
console.log('enforce-terminology: scanned ' + files.length + ' files, rewrote ' + changed);
