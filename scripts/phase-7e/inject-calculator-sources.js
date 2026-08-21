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
 *
 * Phase 7L extends TARGETS to two more calculators and one non-calculator
 * static chart page (pool-chlorine-levels-chart.html) -- the mechanism is
 * file-agnostic (marker-comment injection before </main>), so reusing it
 * for a static authority-chart page is the "extend cleanly" path rather
 * than writing a second renderer/injector for the same job.
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
  {
    // Added Phase 7L: CALCULATOR-PROVENANCE.md (Phase 7E) already found this
    // calculator's target range citable ("No new review required beyond
    // what's already disclosed in the UI copy; target range citable") but
    // no citation block was ever rendered for it -- closing that gap.
    file: 'calculators/pool-ph-calculator.html',
    sourceIds: ['cdc-healthy-swimming-home-treatment'],
    note: 'The target range this calculator adjusts toward (7.0-7.8, commonly 7.2-7.6) is supported by the source below. The dosing formula is already disclosed in the UI as a simplified estimation that does not account for total alkalinity\'s buffering effect.',
  },
  {
    // Added Phase 7L. Per CALCULATOR-PROVENANCE.md, only the pH/free-
    // chlorine/total-alkalinity/calcium-hardness target ranges in this
    // combined calculator are source-supported -- CYA and salt target
    // ranges remain REQUIRES_REVIEW, and none of the five sub-formulas'
    // dosing constants are independently verified. The note says so
    // explicitly rather than implying the whole calculator is validated.
    file: 'calculators/chemical-calculator.html',
    sourceIds: ['cdc-healthy-swimming-home-treatment', 'cdc-mahc-2023', 'ansi-phta-11-2019', 'phta-total-alkalinity-fact-sheet'],
    note: 'The pH, free chlorine, total alkalinity, and calcium hardness target ranges used by this calculator are supported by the sources below. Its cyanuric acid and salt target ranges, and every dosing formula\'s product-concentration assumptions, have not been independently verified against a primary source -- see the Assumptions link above.',
  },
  {
    // Added Phase 7L: this static chart's "Double shock / algae" row was
    // corrected from an unsourced ~20 ppm figure to the Phase 7K-verified
    // ~30 ppm green-algae-recovery figure (same fix already made to the
    // Phase 7G shock-page generator). The citation supports that one row
    // only -- the "Standard shock" row above it remains uncited.
    file: 'pool-chlorine-levels-chart.html',
    sourceIds: ['poolspanews-algae-breakpoint-2016'],
    note: 'The "Green algae recovery" row above is supported by the source below. The "Standard shock" figure is common industry guidance without a single confirmed primary source.',
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
