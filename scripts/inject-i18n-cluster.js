#!/usr/bin/env node
/**
 * inject-i18n-cluster.js
 *
 * Phase 8E: injects hreflang <link> tags and a minimal language-switcher
 * link into every page that data/i18n/translation-status.json reports as
 * having 2+ "translated" language variants. Data-driven and reusable --
 * a future phase adds more "translated" records and reruns this script
 * unmodified; no hardcoded file list lives here.
 *
 * Idempotent (Phase-8A-safe): strip regexes consume the exact leading
 * whitespace the paired insertion adds, so repeated builds never
 * accumulate blank lines (see docs/PHASE-8A-TEMPLATE-INJECTOR-REMEDIATION.md
 * for the failure mode this pattern avoids).
 *
 * Run: node scripts/inject-i18n-cluster.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { buildHreflangSet } = require('../js/i18n/hreflang');
const { availableSwitcherLinks } = require('../js/i18n/language-switcher');
const translationStatus = require('../js/i18n/translation-status');
const { stripLanguagePrefix } = require('../js/i18n/locale-url');
const { getLanguage } = require('../js/i18n/languages');

const ROOT = path.join(__dirname, '..');

const HREFLANG_START = '<!-- i18n-hreflang:start -->';
const HREFLANG_END = '<!-- i18n-hreflang:end -->';
const HREFLANG_STRIP_RE = new RegExp('\\s*' + HREFLANG_START + '[\\s\\S]*?' + HREFLANG_END, 'g');

const SWITCHER_START = '<!-- i18n-switcher:start -->';
const SWITCHER_END = '<!-- i18n-switcher:end -->';
const SWITCHER_STRIP_RE = new RegExp('\\s*' + SWITCHER_START + '[\\s\\S]*?' + SWITCHER_END, 'g');

function urlToFile(urlPath) {
  const rel = urlPath.replace(/^\//, '');
  const flat = path.join(ROOT, rel + '.html');
  if (fs.existsSync(flat)) return path.relative(ROOT, flat).replace(/\\/g, '/');
  const indexed = path.join(ROOT, rel, 'index.html');
  if (fs.existsSync(indexed)) return path.relative(ROOT, indexed).replace(/\\/g, '/');
  return null;
}

function buildHreflangBlock(entries) {
  const tags = entries.map((e) => '  <link rel="alternate" hreflang="' + e.hreflang + '" href="' + e.href + '">').join('\n');
  return '\n' + HREFLANG_START + '\n' + tags + '\n' + HREFLANG_END;
}

function buildSwitcherBlock(links, currentCode) {
  const items = links
    .filter((l) => l.code !== currentCode)
    .map((l) => '<a href="' + l.url + '" class="lang-switch" hreflang="' + l.hreflang + '" lang="' + l.code + '">' + l.code.toUpperCase() + '</a>')
    .join('');
  if (!items) return '';
  return '\n' + SWITCHER_START + items + SWITCHER_END;
}

function injectHreflang(html, entries) {
  let out = html.replace(HREFLANG_STRIP_RE, '');
  const canonicalMatch = out.match(/<link rel="canonical" href="[^"]+">/);
  if (!canonicalMatch) throw new Error('inject-i18n-cluster: no canonical tag found to anchor hreflang injection');
  return out.replace(canonicalMatch[0], canonicalMatch[0] + buildHreflangBlock(entries));
}

function injectSwitcher(html, links, currentCode) {
  let out = html.replace(SWITCHER_STRIP_RE, '');
  const block = buildSwitcherBlock(links, currentCode);
  if (!block) return out;
  // Phase 8N: the calculator pages this anchor was originally written
  // against keep a trailing slash ("/search/") through their final
  // post-processing pass, but the knowledge-platform families this phase
  // adds (glossary/formulas/reference, and academy before them) resolve
  // it without one ("/search") via the shared url-engine's own
  // normalization -- both are the same link. Matching either form keeps
  // the exact fail-fast guarantee (still throws if neither is present)
  // while recognizing both of the site's own valid representations.
  const searchLinkRe = /(<a href="\/search\/?"[^>]*>[\s\S]*?<\/a>)/;
  const m = out.match(searchLinkRe);
  if (!m) throw new Error('inject-i18n-cluster: no search nav link found to anchor language switcher injection');
  return out.replace(searchLinkRe, m[1] + block);
}

function run() {
  const units = translationStatus.getAllUnits();
  let filesTouched = 0;
  const touchedList = [];

  for (const unit of units) {
    const translatedCodes = Object.keys(unit.languages).filter((c) => unit.languages[c].status === 'translated');
    if (translatedCodes.length < 2) continue;

    const enEntry = unit.languages.en;
    if (!enEntry) continue;
    const enPathNoLang = stripLanguagePrefix(enEntry.url).path;

    for (const code of translatedCodes) {
      const urlPath = unit.languages[code].url;
      const file = urlToFile(urlPath);
      if (!file) {
        throw new Error('inject-i18n-cluster: content unit "' + unit.contentId + '" language "' + code + '" has no corresponding file on disk for URL "' + urlPath + '"');
      }
      const fullPath = path.join(ROOT, file);
      let html = fs.readFileSync(fullPath, 'utf8');

      const hreflangEntries = buildHreflangSet(enPathNoLang, translatedCodes);
      html = injectHreflang(html, hreflangEntries);

      const switcherLinks = availableSwitcherLinks(unit.contentId, enPathNoLang, code);
      html = injectSwitcher(html, switcherLinks, code);

      fs.writeFileSync(fullPath, html, 'utf8');
      filesTouched++;
      touchedList.push(file);
    }
  }

  for (const f of touchedList) console.log('  -> ' + f);
  console.log('inject-i18n-cluster: hreflang + language switcher injected into ' + filesTouched + ' file(s)');
}

// Runs at require() time, matching this codebase's established generator
// convention -- see generate-spanish-cluster.js.
run();

module.exports = { run, urlToFile, injectHreflang, injectSwitcher };
