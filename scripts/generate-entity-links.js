#!/usr/bin/env node
/**
 * generate-entity-links.js
 *
 * Injects entity panels into existing HTML pages wherever a matching entity is found.
 * Strategy:
 *   - Builds a slug→entityId map from entity-index.json
 *   - Scans academy/, formulas/, glossary/, reference/ pages
 *   - For each page whose slug maps to an entity, inserts an entity panel
 *     immediately after the first <article class="knowledge-content..."> opening tag
 *     if not already present.
 *
 * Idempotent: pages already containing class="entity-panel" are skipped.
 *
 * Run: node scripts/generate-entity-links.js
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');

// ── Load entity data ───────────────────────────────────────────────────────────

const entityIndex = JSON.parse(fs.readFileSync(path.join(DATA, 'graph', 'entity-index.json'), 'utf8'));
const synonymsMap = JSON.parse(fs.readFileSync(path.join(DATA, 'graph', 'synonyms.json'), 'utf8'));

// ── Build panel HTML for an entity ────────────────────────────────────────────

const CALC_TITLES = {
  'chemical-calculator':          'Chemical Calculator',
  'pool-chlorine-calculator':     'Pool Chlorine Calculator',
  'pool-shock-calculator':        'Pool Shock Calculator',
  'pool-ph-calculator':           'Pool pH Calculator',
  'pool-alkalinity-calculator':   'Pool Alkalinity Calculator',
  'pool-cyanuric-acid-calculator':'Pool CYA Calculator',
  'pool-volume-calculator':       'Pool Volume Calculator',
  'pool-turnover-rate-calculator':'Pool Turnover Rate Calculator',
  'saltwater-pool-salt-calculator':'Salt Pool Calculator',
  'hot-tub-chlorine-calculator':  'Hot Tub Chlorine Calculator',
  'hot-tub-ph-calculator':        'Hot Tub pH Calculator',
  'hot-tub-shock-calculator':     'Hot Tub Shock Calculator',
  'spa-volume-calculator':        'Spa Volume Calculator',
  'volume-calculator':            'Volume Calculator',
};

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildPanel(entity) {
  const calcLinks = (entity.calculatorIds || []).slice(0, 4).map(id =>
    `<a href="/calculators/${id}" class="entity-panel-link">${esc(CALC_TITLES[id] || id)}</a>`
  ).join('');

  const relLinks = (entity.relatedEntities || []).slice(0, 6)
    .filter(id => entityIndex[id])
    .map(id => `<a href="/entities/${id}" class="entity-panel-link">${esc(entityIndex[id].name)}</a>`)
    .join('');

  const rangeBlock = (entity.idealRange && entity.idealRange !== 'N/A')
    ? `<div class="entity-panel-range"><strong>Ideal Range:</strong> ${esc(entity.idealRange)}</div>`
    : '';

  const calcSection = calcLinks
    ? `<div class="entity-panel-section"><strong>Calculators</strong><div class="entity-panel-links">${calcLinks}</div></div>`
    : '';

  const relSection = relLinks
    ? `<div class="entity-panel-section"><strong>Related</strong><div class="entity-panel-links">${relLinks}</div></div>`
    : '';

  return `<!-- entity-panel:${entity.id} -->
<aside class="entity-panel" aria-label="${esc(entity.name)} knowledge panel">
  <div class="entity-panel-header">
    <h3 class="entity-panel-name"><a href="/entities/${esc(entity.id)}">${esc(entity.name)}</a></h3>
    <span class="knowledge-badge knowledge-badge--${esc(entity.type)}">${esc(entity.type)}</span>
  </div>
  <p class="entity-panel-desc">${esc(entity.shortDescription)}</p>
  ${rangeBlock}
  ${calcSection}
  ${relSection}
  <a href="/entities/${esc(entity.id)}" class="entity-panel-cta">Full entity details →</a>
</aside>
<!-- /entity-panel:${entity.id} -->`;
}

// ── Build a map from term/slug keywords → entity ID ──────────────────────────

// For each entity, collect all of its synonyms and aliases as potential matches
const ENTITY_BY_KEYWORD = {};
Object.entries(synonymsMap).forEach(([entityId, terms]) => {
  terms.forEach(term => {
    ENTITY_BY_KEYWORD[term.toLowerCase()] = entityId;
  });
});
// Also index by entity name directly
Object.values(entityIndex).forEach(e => {
  ENTITY_BY_KEYWORD[e.name.toLowerCase()] = e.id;
});

// ── Build a map from page slug-fragment → entity ID ───────────────────────────
// Attempts to match the page's file path basename to an entity.

function slugToEntityId(filePath) {
  // e.g. glossary/free-chlorine.html → 'free-chlorine'
  const base = path.basename(filePath, '.html');

  // direct entity ID match
  if (entityIndex[base]) return base;

  // check synonyms/keywords
  const found = ENTITY_BY_KEYWORD[base.replace(/-/g, ' ')] ||
                ENTITY_BY_KEYWORD[base.replace(/-/g, '')] ||
                ENTITY_BY_KEYWORD[base];
  if (found) return found;

  return null;
}

// ── Walk directories and inject panels ────────────────────────────────────────

const TARGET_DIRS = ['glossary', 'formulas', 'academy', 'reference'];

let injected = 0;
let skipped  = 0;
let noMatch  = 0;

TARGET_DIRS.forEach(dir => {
  const dirPath = path.join(ROOT, dir);
  if (!fs.existsSync(dirPath)) return;

  walkHtml(dirPath).forEach(filePath => {
    const entityId = slugToEntityId(filePath);
    if (!entityId) {
      noMatch++;
      return;
    }

    const entity = entityIndex[entityId];
    if (!entity) {
      noMatch++;
      return;
    }

    let html = fs.readFileSync(filePath, 'utf8');

    // Skip if panel already injected
    if (html.includes(`entity-panel:${entityId}`) || html.includes('class="entity-panel"')) {
      skipped++;
      return;
    }

    // Injection point: after the opening <article class="knowledge-content..."> or <main>
    const INJECT_AFTER = /<article[^>]*class="[^"]*knowledge-content[^"]*"[^>]*>/;
    const FALLBACK_AFTER = /<main[^>]*>/;

    const panel = buildPanel(entity);
    let newHtml;

    if (INJECT_AFTER.test(html)) {
      newHtml = html.replace(INJECT_AFTER, m => m + '\n' + panel + '\n');
    } else if (FALLBACK_AFTER.test(html)) {
      newHtml = html.replace(FALLBACK_AFTER, m => m + '\n' + panel + '\n');
    } else {
      noMatch++;
      return;
    }

    fs.writeFileSync(filePath, newHtml, 'utf8');
    injected++;
  });
});

function walkHtml(dir) {
  const results = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      results.push(...walkHtml(full));
    } else if (f.endsWith('.html') && f !== 'index.html') {
      results.push(full);
    }
  });
  return results;
}

console.log(`generate-entity-links:`);
console.log(`  injected: ${injected} panels`);
console.log(`  already had panel: ${skipped}`);
console.log(`  no entity match: ${noMatch}`);
console.log(`Entity panels injected successfully.`);
