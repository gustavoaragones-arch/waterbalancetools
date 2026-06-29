#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'audit', 'indexing-audit');
const JSON_PATH = path.join(OUT_DIR, 'redirect-audit.json');
const REPORT_PATH = path.join(OUT_DIR, 'reports', 'redirect-audit.md');

function normalize(p) {
  return String(p || '').trim().split('?')[0].replace(/\/index\.html$/i, '/').replace(/\.html$/i, '').replace(/\/$/, '') || '/';
}

function run() {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  const file = path.join(ROOT, '_redirects');
  const lines = fs.existsSync(file)
    ? fs.readFileSync(file, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean)
    : [];

  const rules = [];
  for (const line of lines) {
    const [source, destination, status] = line.split(/\s+/);
    if (!source || !destination) continue;
    rules.push({
      source,
      destination,
      status: Number(status || 301),
      sourceClean: normalize(source),
      destClean: normalize(destination),
    });
  }

  const non301 = rules.filter((r) => r.status !== 301);
  const sourceMap = new Map(rules.map((r) => [r.sourceClean, r.destClean]));
  const chains = [];
  const loops = [];

  for (const r of rules) {
    const first = r.destClean;
    const second = sourceMap.get(first);
    if (second && second !== first) chains.push({ source: r.sourceClean, via: first, destination: second });
    if (second && second === r.sourceClean) loops.push({ a: r.sourceClean, b: first });
  }

  const extensionMismatch = rules.filter((r) => /\.html/i.test(r.source) || /index\.html/i.test(r.source) || /\.html/i.test(r.destination) || /index\.html/i.test(r.destination));
  const duplicatedSources = rules.filter((r, idx) => rules.findIndex((x) => x.sourceClean === r.sourceClean) !== idx);

  const result = {
    generatedAt: new Date().toISOString(),
    totalRules: rules.length,
    non301: non301.length,
    chains: chains.length,
    loops: loops.length,
    extensionMismatch: extensionMismatch.length,
    duplicatedSources: duplicatedSources.length,
    samples: {
      non301: non301.slice(0, 100),
      chains: chains.slice(0, 100),
      loops: loops.slice(0, 100),
      extensionMismatch: extensionMismatch.slice(0, 100),
      duplicatedSources: duplicatedSources.slice(0, 100),
    },
  };

  fs.writeFileSync(JSON_PATH, JSON.stringify(result, null, 2) + '\n', 'utf8');

  const md = `# Redirect Audit\n\n` +
    `- Redirect rules audited: ${result.totalRules}\n` +
    `- Non-301 rules: ${result.non301}\n` +
    `- Potential redirect chains: ${result.chains}\n` +
    `- Redirect loops: ${result.loops}\n` +
    `- Rules with extension/index variants: ${result.extensionMismatch}\n` +
    `- Duplicate redirect sources: ${result.duplicatedSources}\n\n` +
    `## Chain Samples\n\n` +
    (result.samples.chains.length ? result.samples.chains.slice(0, 20).map((x) => `- ${x.source} -> ${x.via} -> ${x.destination}`).join('\n') : '- None') + '\n\n' +
    `## Extension Variant Samples\n\n` +
    (result.samples.extensionMismatch.length ? result.samples.extensionMismatch.slice(0, 20).map((x) => `- ${x.source} -> ${x.destination}`).join('\n') : '- None') + '\n';

  fs.writeFileSync(REPORT_PATH, md, 'utf8');
  console.log(`audit-redirects: wrote ${JSON_PATH} and ${REPORT_PATH}`);
}

run();
