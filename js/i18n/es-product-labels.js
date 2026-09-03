/**
 * es-product-labels.js — Phase 8G: minimal, reusable Spanish localization
 * for dataset-driven product display strings surfaced at runtime by the
 * SHARED, sitewide js/calc-utils.js (SHOCK_PRODUCTS' `label`/
 * `mixingWarning` fields, e.g. "Calcium Hypochlorite (65%)"). Phase 8E
 * documented these as untranslated; this is the minimum safe mechanism
 * spec Section 18 requires: a lookup table loaded only on Spanish pages,
 * consumed by that page's own inline script -- js/calc-utils.js itself is
 * never modified, so English behavior and output are provably unaffected.
 *
 * Any English label/warning not present here falls back to the English
 * string at runtime rather than breaking; scripts/validate-phase-8g.js
 * asserts every label/warning actually reachable by a Spanish cluster
 * page IS covered, so a real gap fails the build validation gate loudly
 * instead of silently shipping an English fallback string.
 *
 * Used by all SEO calculator pages that need to localize a
 * calc-utils.js product object for display. Lightweight, no dependencies.
 */
(function () {
  'use strict';

  var LABELS = {
    'Liquid Chlorine (10%)': 'Cloro Líquido (10%)',
    'Liquid Chlorine (12.5%)': 'Cloro Líquido (12.5%)',
    'Calcium Hypochlorite (65%)': 'Hipoclorito de Calcio (65%)',
    'Calcium Hypochlorite (73%)': 'Hipoclorito de Calcio (73%)',
    'Sodium Dichlor (56%)': 'Dicloro de Sodio (56%)',
    'Trichlor Tablets (90%)': 'Tabletas de Tricloro (90%)',
  };

  var WARNINGS = {
    'Do not mix with trichlor or other chlorinating agents.': 'No mezclar con tricloro u otros agentes clorantes.',
    'Do not mix with calcium hypochlorite or other chlorinating agents.': 'No mezclar con hipoclorito de calcio u otros agentes clorantes.',
  };

  function label(en) {
    return Object.prototype.hasOwnProperty.call(LABELS, en) ? LABELS[en] : en;
  }
  function warning(en) {
    return Object.prototype.hasOwnProperty.call(WARNINGS, en) ? WARNINGS[en] : en;
  }

  window.WaterBalance = window.WaterBalance || {};
  window.WaterBalance.esProductLabels = {
    label: label,
    warning: warning,
    LABELS: LABELS,
    WARNINGS: WARNINGS,
  };
})();
