/**
 * result-renderer.js
 * Enhances calculator output panels into visual answer cards.
 *
 * Works non-destructively via MutationObserver — fires once when the
 * output-panel's "hidden" class is removed, parses chemical amounts
 * from whatever content the calculator JS already put there, and
 * prepends a styled answer card.  Original content (ads, re-test note)
 * is preserved below the card.
 */
(function () {
  'use strict';

  // ── Parsing helpers ──────────────────────────────────────────────────────

  // Matches "1.3 oz liquid chlorine", "0.4 oz pH reducer", "2 oz soda ash", etc.
  // Stops at known stopwords / punctuation so names don't bleed across sentences.
  var OZ_RE = /(\d+(?:\.\d+)?)\s*oz\s+([\w][^\n.;+(]*?)(?=\s+to\b|\s+for\b|\s+and\b|\s*[.(;+\n]|$)/gi;

  // Matches "1.5 chlorine tablet(s) (approx … oz equivalent)"
  var TABLET_RE = /(\d+(?:\.\d+)?)\s*(chlorine\s+tablet[s]?)/gi;

  var IN_RANGE_RE = /in range|no addition needed|no chlorine addition|levels? (?:are )?(?:in|within)/i;

  function titleCase(str) {
    return str.trim().replace(/\b([a-z])/g, function (_, c) { return c.toUpperCase(); });
  }

  function parseChemicals(text) {
    var items = [];

    // Tablets
    TABLET_RE.lastIndex = 0;
    var m;
    while ((m = TABLET_RE.exec(text)) !== null) {
      items.push({ amount: m[1], unit: '', name: titleCase(m[2]) });
    }

    // oz doses
    OZ_RE.lastIndex = 0;
    while ((m = OZ_RE.exec(text)) !== null) {
      var rawName = m[2].trim().replace(/\s+/g, ' ');
      // Skip very long or clearly non-chemical captures
      if (rawName.split(' ').length > 5) continue;
      items.push({ amount: m[1], unit: 'oz', name: titleCase(rawName) });
    }

    return items;
  }

  // ── Card builder ─────────────────────────────────────────────────────────

  function buildCard(panel) {
    var text = panel.textContent.trim();
    var chemicals = parseChemicals(text);
    var inRange = IN_RANGE_RE.test(text) && chemicals.length === 0;

    // Determine steps: hot-tub pages add "Run jets" instead
    var isHotTub = /hot.?tub|spa/i.test(document.title);
    var steps = isHotTub
      ? ['Run jets for 20 minutes', 'Retest water before soaking']
      : ['Run pump for 20–30 minutes', 'Retest water before swimming'];

    var bodyHtml;
    if (inRange) {
      bodyHtml = '<p class="crr-ok">No additions needed &mdash; your levels are within the target range.</p>';
    } else if (chemicals.length > 0) {
      bodyHtml = '<div class="crr-chemicals">' +
        chemicals.map(function (c, i) {
          return (i > 0 ? '<div class="crr-plus" aria-hidden="true">+</div>' : '') +
            '<div class="crr-item">' +
              '<span class="crr-amount">' + c.amount + (c.unit ? '\u202f' + c.unit : '') + '</span>' +
              '<span class="crr-name">' + c.name + '</span>' +
            '</div>';
        }).join('') +
        '</div>';
    } else {
      // Fallback: just style the existing text — don't duplicate it
      bodyHtml = '';
    }

    var stepsHtml = '<ol class="crr-steps">' +
      steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') +
      '</ol>';

    return '<div class="crr-card">' +
      '<div class="crr-header">' +
        '<span class="crr-check" aria-hidden="true">&#10003;</span>' +
        '<span class="crr-title">Your Recommendation</span>' +
      '</div>' +
      bodyHtml +
      stepsHtml +
    '</div>';
  }

  // ── Enhancer ─────────────────────────────────────────────────────────────

  function enhance(panel) {
    if (panel.dataset.crrDone) return;
    panel.dataset.crrDone = '1';
    panel.classList.add('crr-panel');

    // Suppress original h3 — card header replaces it visually
    var h = panel.querySelector('h3');
    if (h) h.style.display = 'none';

    panel.insertAdjacentHTML('afterbegin', buildCard(panel));
  }

  // ── Init ─────────────────────────────────────────────────────────────────

  function init() {
    document.querySelectorAll('.output-panel').forEach(function (p) {
      // Panel already visible (e.g. populated via URL params)
      if (!p.classList.contains('hidden')) { enhance(p); return; }
      // Watch for the calculator JS removing the "hidden" class
      new MutationObserver(function (mutations, obs) {
        if (!p.classList.contains('hidden')) {
          obs.disconnect();
          enhance(p);
        }
      }).observe(p, { attributes: true, attributeFilter: ['class'] });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
