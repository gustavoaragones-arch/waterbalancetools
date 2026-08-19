#!/usr/bin/env node
'use strict';
/**
 * scan-chemistry-sources.js (Phase 7D Step 2)
 *
 * Scans scripts/, scripts/data/, data/, and js/ (source-level chemistry
 * constants -- NOT rendered HTML, which Phase 7A's chemical-claims.csv
 * already covers) for numeric chemistry values, and produces
 * reports/phase-7d/chemistry-source-inventory.csv/.json.
 *
 * This is a mechanical pattern scan (same methodology as Phase 7A's
 * chemistry claim extraction), not a manual line-by-line code review of
 * every file -- flagged as REQUIRES_REVIEW by default unless a value
 * matches something already in the canonical chemistry-ranges.js dataset.
 */
const fs = require('fs');
const path = require('path');
const { ALIAS_INDEX } = require('../data/chemistry-knowledge');
const { RANGES } = require('../data/chemistry-ranges');

const ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'reports', 'phase-7d');

const SCAN_DIRS = ['scripts', 'js', 'data'];
const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'audit-forensic', 'phase-7d']);
const SCAN_EXTENSIONS = new Set(['.js', '.json']);

function walk(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      walk(full, out);
    } else if (SCAN_EXTENSIONS.has(path.extname(e.name))) {
      out.push(full);
    }
  }
  return out;
}

const CHEMISTRY_TERMS = Object.keys(ALIAS_INDEX);
const NUMERIC_UNIT_RE = /(-?\d+(?:\.\d+)?)\s*(ppm|mg\/l|°f|°c|lb|lbs|oz|gal|gallons)\b/gi;

function classifyPoolOrSpa(filePath, line) {
  const hay = (filePath + ' ' + line).toLowerCase();
  const hasHotTub = /hot[\s-]?tub|spa\b/.test(hay);
  const hasPool = /\bpool\b/.test(hay);
  if (hasHotTub && hasPool) return 'both';
  if (hasHotTub) return 'hot_tub';
  if (hasPool) return 'pool';
  return 'unspecified';
}

function classifySanitizer(line) {
  const hay = line.toLowerCase();
  if (/bromine/.test(hay)) return 'bromine';
  if (/salt|swg|saltwater|salt water/.test(hay)) return 'saltwater_chlorine_generator';
  if (/chlorine|hypochlorite|dichlor|trichlor/.test(hay)) return 'chlorine';
  return 'unspecified';
}

function classifyScenario(line) {
  const hay = line.toLowerCase();
  if (/shock|breakpoint|superchlorinat/.test(hay)) return 'shock';
  if (/safety|hazard|danger|never mix/.test(hay)) return 'safety_guidance';
  if (/troubleshoot|fix|problem/.test(hay)) return 'troubleshooting';
  return 'target_range';
}

function findMatchedParameter(line) {
  const hay = line.toLowerCase();
  for (const term of CHEMISTRY_TERMS) {
    if (term.length < 2) continue;
    const re = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
    if (re.test(hay)) return ALIAS_INDEX[term];
  }
  return null;
}

function reviewStatusFor(parameterId, value, unit) {
  if (!parameterId) return 'REQUIRES_REVIEW';
  const candidates = RANGES.filter((r) => r.parameter_id === parameterId && r.unit && r.unit.toLowerCase() === (unit || '').toLowerCase());
  for (const r of candidates) {
    if (r.minimum !== null && r.maximum !== null && value >= r.minimum && value <= r.maximum) {
      return r.status === 'SUPPORTED' || r.status === 'VERIFIED' ? 'CONTEXTUAL' : 'REQUIRES_REVIEW';
    }
  }
  return 'REQUIRES_REVIEW';
}

const rows = [];
const files = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d), []));
for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matches = [...line.matchAll(NUMERIC_UNIT_RE)];
    if (matches.length === 0) continue;
    const parameterId = findMatchedParameter(line);
    if (!parameterId && !/chlorine|ph\b|alkalinity|hardness|cyanuric|salt|bromine|shock/i.test(line)) continue;
    for (const m of matches) {
      const value = Number(m[1]);
      const unit = m[2].toLowerCase() === 'mg/l' ? 'mg/L' : m[2].toLowerCase();
      rows.push({
        source_file: rel,
        source_type: rel.endsWith('.json') ? 'data_json' : (rel.startsWith('scripts/data/') ? 'data_module' : (rel.startsWith('js/') ? 'client_js' : 'generator_script')),
        parameter: parameterId || '(unmatched)',
        value,
        unit,
        context: line.trim().slice(0, 140),
        pool_or_spa: classifyPoolOrSpa(rel, line),
        sanitizer: classifySanitizer(line),
        scenario: classifyScenario(line),
        source_of_value: rel + ':' + (i + 1),
        generator_dependency: rel.startsWith('scripts/') && !rel.startsWith('scripts/data/') ? rel : '(data file, no direct generator)',
        claim_or_calculation: /function |=>|calculate/i.test(line) ? 'calculation' : 'claim',
        review_status: reviewStatusFor(parameterId, value, unit),
      });
    }
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });

function toCsv(rows, fields) {
  const esc = (v) => {
    const s = String(v == null ? '' : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [fields.join(','), ...rows.map((r) => fields.map((f) => esc(r[f])).join(','))].join('\n') + '\n';
}

const FIELDS = ['source_file', 'source_type', 'parameter', 'value', 'unit', 'context', 'pool_or_spa', 'sanitizer', 'scenario', 'source_of_value', 'generator_dependency', 'claim_or_calculation', 'review_status'];
fs.writeFileSync(path.join(OUT_DIR, 'chemistry-source-inventory.csv'), toCsv(rows, FIELDS));
fs.writeFileSync(path.join(OUT_DIR, 'chemistry-source-inventory.json'), JSON.stringify(rows, null, 2) + '\n');

console.log(`scan-chemistry-sources: scanned ${files.length} files, found ${rows.length} numeric chemistry-value occurrences.`);
