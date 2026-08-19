#!/usr/bin/env node
'use strict';
/**
 * inject-calculator-sources.js (Phase 7E.6)
 *
 * Idempotent marker-comment injection (same convention as the existing
 * platform-footer-badge / trust-panel markers already used across the
 * site) of a real external-source citation block into a small, explicitly
 * chosen Tier-1 calculator set. Only calculators with an individually
 * confirmed DIRECT source relationship (see CALCULATOR-PROVENANCE.md) get
 * a block -- this does not touch any calculator whose dosing constants are
 * still CALCULATOR_REVIEW_REQUIRED, since only the TARGET RANGE those two
 * calculators dose toward is source-supported, not the dosing formula
 * itself (the rendered text says so explicitly, see the note below).
 *
 * Distinct from the pre-existing "Calculation Trust Panel"
 * (inject-trust-panels.js), which links only to internal dataset pages
 * (/reference/datasets/...) -- this block is real external citations and
 * is intentionally kept separate rather than merged into that
 * pre-existing, separately-audited component.
 */
const fs = require('fs');
const path = require('path');
const { renderSourceList } = require('../chemistry/renderSources');

const ROOT = path.join(__dirname, '..', '..');

const TARGETS = [
  {
    file: 'calculators/pool-chlorine-calculator.html',
    sourceIds: ['cdc-healthy-swimming-home-treatment', 'cdc-mahc-2023'],
    note: 'The target range this calculator doses toward (1-3 ppm, or 2-4 ppm with cyanuric acid) is supported by the sources below. The dosing formula\'s product-concentration assumptions have not been independently verified against a specific manufacturer reference -- see the Assumptions link above.',
  },
  {
    file: 'calculators/hot-tub-chlorine-calculator.html',
    sourceIds: ['cdc-healthy-swimming-home-treatment'],
    note: 'The target range this calculator doses toward (3-5 ppm) is supported by the source below. The dosing formula\'s product-concentration assumptions have not been independently verified against a specific manufacturer reference -- see the Assumptions link above.',
  },
];

const START = '<!-- chemistry-sources:start -->';
const END = '<!-- chemistry-sources:end -->';

function run() {
  for (const t of TARGETS) {
    const filePath = path.join(ROOT, t.file);
    let html = fs.readFileSync(filePath, 'utf8');
    const sourcesHtml = renderSourceList(t.sourceIds);
    const block = `${START}\n<p class="knowledge-sources-note">${t.note}</p>\n${sourcesHtml}\n${END}`;

    const markerRe = new RegExp(`${START}[\\s\\S]*?${END}`);
    if (markerRe.test(html)) {
      html = html.replace(markerRe, block);
    } else {
      if (!html.includes('</main>')) throw new Error(`No </main> found in ${t.file}`);
      html = html.replace('</main>', `${block}\n</main>`);
    }
    fs.writeFileSync(filePath, html);
    console.log(`inject-calculator-sources: updated ${t.file}`);
  }
}

if (require.main === module) run();
module.exports = { run, TARGETS };
