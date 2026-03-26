/**
 * One-time: append Ownership + Legal links to every page with footer-nav.
 * Idempotent: skips files that already include legal/ownership.html.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function walk(dir) {
  const files = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith('.')) files.push(...walk(full));
    else if (e.isFile() && e.name.endsWith('.html')) files.push(full);
  }
  return files;
}

const htmlFiles = walk(ROOT).filter(f => !f.includes('node_modules'));

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('<nav class="footer-nav">')) continue;
  if (content.includes('legal/ownership.html')) continue;

  const relDir = path.relative(ROOT, path.dirname(file));
  const depth =
    !relDir || relDir === '.' ? 0 : relDir.split(path.sep).length;
  const prefix = depth === 0 ? '' : '../'.repeat(depth);
  const insertLines =
    '\n      <a href="' +
    prefix +
    'legal/ownership.html">Ownership</a>\n      <a href="' +
    prefix +
    'legal/legal.html">Legal</a>';

  const replaced = content.replace(
    /<nav class="footer-nav">([\s\S]*?)<\/nav>\s*<p class="footer-copy">&copy; WaterBalanceTools.com<\/p>/,
    '<nav class="footer-nav">$1' +
      insertLines +
      '\n    </nav>\n    <p class="footer-copy">&copy; WaterBalanceTools.com</p>'
  );

  if (replaced === content) {
    console.warn('No replacement:', path.relative(ROOT, file));
  } else {
    fs.writeFileSync(file, replaced, 'utf8');
    console.log('Updated', path.relative(ROOT, file));
  }
}
