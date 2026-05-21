/**
 * Cloudflare Pages _redirects: legacy chlorine URLs, explanation path typos.
 * Run: node scripts/generate-redirects.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, '_redirects');

const LEGACY_CHLORINE = [
  'how-much-chlorine-for-5000-gallon-pool',
  'how-much-chlorine-for-10000-gallon-pool',
  'how-much-chlorine-for-15000-gallon-pool',
  'how-much-chlorine-for-20000-gallon-pool'
];

const EXPLANATION_SLUGS = [
  'why-ph-affects-chlorine',
  'what-is-pool-alkalinity',
  'why-shower-before-pool'
];

const lines = [
  '# Legacy programmatic chlorine (root) → canonical cluster',
  ''
];

for (const slug of LEGACY_CHLORINE) {
  const from = '/programmatic/' + slug;
  const to = '/programmatic/chlorine/' + slug;
  lines.push(from + ' ' + to + ' 301');
  lines.push(from + '.html ' + to + ' 301');
}

lines.push('', '# Explanation path typos → canonical folder', '');

for (const slug of EXPLANATION_SLUGS) {
  lines.push(
    '/programmatic/explanation/' + slug + ' /programmatic/explanations/' + slug + ' 301'
  );
  lines.push(
    '/programmatic/explanation/' +
      slug +
      '.html /programmatic/explanations/' +
      slug +
      ' 301'
  );
  lines.push('/explanations/' + slug + ' /programmatic/explanations/' + slug + ' 301');
  lines.push(
    '/explanations/' + slug + '.html /programmatic/explanations/' + slug + ' 301'
  );
}

lines.push(
  '',
  '/programmatic/explanation/* /programmatic/explanations/:splat 301',
  '/explanations/* /programmatic/explanations/:splat 301'
);

fs.writeFileSync(OUT, lines.join('\n') + '\n', 'utf8');
console.log('generate-redirects: wrote ' + OUT + ' (' + (lines.length - 4) + ' rules)');
