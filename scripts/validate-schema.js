/**
 * Validate structured data (JSON-LD) across calculator pages.
 * Rules: only one WebApplication, one FAQPage, one BreadcrumbList, one HowTo per page.
 * Usage: node scripts/validate-schema.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CALC_DIR = path.join(ROOT, 'calculators');
const TYPES_TO_CHECK = ['WebApplication', 'FAQPage', 'BreadcrumbList', 'HowTo'];

const LD_JSON_REGEX = /<script\s+type\s*=\s*["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi;

function getLdJsonBlocks(html) {
  const blocks = [];
  let match;
  LD_JSON_REGEX.lastIndex = 0;
  while ((match = LD_JSON_REGEX.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw) continue;
    blocks.push(raw);
  }
  return blocks;
}

function extractTypesFromJson(obj, types) {
  if (!obj || typeof obj !== 'object') return;
  if (obj['@type']) {
    const t = obj['@type'];
    const name = Array.isArray(t) ? t[0] : t;
    if (TYPES_TO_CHECK.includes(name)) types[name] = (types[name] || 0) + 1;
  }
  if (Array.isArray(obj['@graph'])) {
    obj['@graph'].forEach(item => extractTypesFromJson(item, types));
  }
}

function countTypesInPage(html) {
  const counts = { WebApplication: 0, FAQPage: 0, BreadcrumbList: 0, HowTo: 0 };
  const blocks = getLdJsonBlocks(html);
  blocks.forEach(raw => {
    try {
      const obj = JSON.parse(raw);
      extractTypesFromJson(obj, counts);
    } catch (e) {
      // skip invalid JSON
    }
  });
  return counts;
}

function listHtml(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.html')).sort();
}

let hasErrors = false;
const files = listHtml(CALC_DIR);

if (files.length === 0) {
  console.log('No HTML files in /calculators/');
  process.exit(0);
}

console.log('Validating structured data in /calculators/\n');

files.forEach(file => {
  const filePath = path.join(CALC_DIR, file);
  const html = fs.readFileSync(filePath, 'utf8');
  const counts = countTypesInPage(html);

  console.log(file);
  TYPES_TO_CHECK.forEach(type => {
    const n = counts[type] || 0;
    console.log('  ' + type + ': ' + n);
    if (n > 1) {
      console.log('  ERROR: Duplicate ' + type + ' in ' + file);
      hasErrors = true;
    }
  });
  console.log('');
});

if (hasErrors) {
  console.log('Validation FAILED: duplicate schema types found.');
  process.exit(1);
}

console.log('Validation passed: at most one of each type per page.');
process.exit(0);
