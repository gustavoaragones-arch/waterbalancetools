#!/usr/bin/env node
'use strict';
/**
 * validate-schema-content-consistency.js (Phase 7H, Step 6)
 *
 * Cross-checks every page's JSON-LD structured data against its own
 * visible content. Structural JSON validity and schema-type completeness
 * are audited elsewhere (scripts/audit-forensic/lib/schema-audit.js,
 * re-run via `npm run audit:forensic`); this validator is specifically
 * about whether what the schema CLAIMS matches what a visitor/crawler can
 * actually see on the page.
 *
 * Fails the build on CRITICAL findings (fabricated/misleading schema).
 * WARN findings are reported but do not fail the build.
 */
const fs = require('fs');
const path = require('path');
const urlPolicy = require('./url-policy');

const ROOT = path.join(__dirname, '..');

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.git') || e.name === 'reports') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.isFile() && e.name.endsWith('.html')) out.push(full);
  }
}

// Only real, currently-production pages are in scope. templates/partials
// are never served directly (their {{TOKENS}} are fill-in placeholders by
// design) and REDIRECT_SOURCES paths are retired URLs that url-policy.js
// already says "must never be production/indexable again, regardless of
// whether the physical file still exists on disk" -- both would produce
// noise, not real findings, if checked here.
function inScope(relPath) {
  if (urlPolicy.isNonPage(relPath)) return false;
  if (urlPolicy.isRedirectSource(relPath)) return false;
  return true;
}

function stripTags(s) {
  return String(s || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalize(s) {
  return (s || '').toLowerCase().replace(/&amp;/g, '&').replace(/[^a-z0-9]+/g, ' ').trim();
}

function extractJsonLd(html) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const out = [];
  for (const b of blocks) {
    const raw = b[1].trim();
    try {
      out.push({ raw, parsed: JSON.parse(raw) });
    } catch (e) {
      out.push({ raw, parsed: null, error: e.message });
    }
  }
  return out;
}

function run() {
  const pages = [];
  walk(ROOT, pages);

  const critical = [];
  const warnings = [];
  let pagesChecked = 0;

  const orgNames = new Set();
  let orgCount = 0;

  for (const abs of pages) {
    const relPath = path.relative(ROOT, abs).replace(/\\/g, '/');
    if (!inScope(relPath)) continue;
    const html = fs.readFileSync(abs, 'utf8');
    const jsonLd = extractJsonLd(html);
    if (!jsonLd.length) continue;
    pagesChecked++;

    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = h1Match ? stripTags(h1Match[1]) : '';
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    const canonical = canonicalMatch ? canonicalMatch[1] : null;
    const bodyText = stripTags(html);

    const faqVisible = /class="(faq-item|paa-item)"/.test(html);

    const typeCounts = new Map();

    for (const ld of jsonLd) {
      if (!ld.parsed) {
        critical.push({ file: relPath, rule: 'INVALID_JSON_LD', detail: ld.error });
        continue;
      }
      const obj = ld.parsed;
      const type = obj['@type'];
      if (type) typeCounts.set(type, (typeCounts.get(type) || 0) + 1);

      // Placeholder / template-leakage tokens.
      if (/\{\{[A-Z0-9_]+\}\}/.test(ld.raw)) {
        critical.push({ file: relPath, rule: 'TEMPLATE_TOKEN_IN_SCHEMA', detail: ld.raw.slice(0, 120) });
      }
      if (/"(undefined|null)"/.test(ld.raw)) {
        warnings.push({ file: relPath, rule: 'STRING_UNDEFINED_OR_NULL', detail: ld.raw.slice(0, 120) });
      }

      if (type === 'Organization') {
        orgCount++;
        if (obj.name) orgNames.add(obj.name);
      }

      if (type === 'Person') {
        // Explicit project rule: no fake Person entities anywhere.
        critical.push({ file: relPath, rule: 'PERSON_SCHEMA_PRESENT', detail: `Person schema found: ${JSON.stringify(obj).slice(0, 150)} -- Phase 7F closed this as a non-goal; no author/reviewer Person entities are authorized.` });
      }

      if (type === 'WebApplication') {
        // Only meaningful on the calculator's own page. Content pages that
        // merely reference/embed a related calculator's WebApplication
        // schema (a "here's a relevant tool" cross-reference, common on
        // programmatic long-tail pages) are legitimately pointing at a
        // DIFFERENT URL than their own canonical -- not a defect.
        if (relPath.startsWith('calculators/') && obj.url && canonical) {
          const a = obj.url.replace(/\/$/, '').replace(/\.html$/, '');
          const b = canonical.replace(/\/$/, '').replace(/\.html$/, '');
          if (a !== b) warnings.push({ file: relPath, rule: 'WEBAPPLICATION_URL_MISMATCH', detail: `${obj.url} vs canonical ${canonical}` });
        }
      }

      if (type === 'FAQPage') {
        const questions = Array.isArray(obj.mainEntity) ? obj.mainEntity : [];
        if (questions.length > 0 && !faqVisible) {
          critical.push({ file: relPath, rule: 'FAQ_SCHEMA_NOT_VISIBLE', detail: `${questions.length} question(s) declared, no .faq-item/.paa-item found in rendered HTML.` });
        } else if (faqVisible) {
          for (const q of questions) {
            const qText = q.name || '';
            const aText = (q.acceptedAnswer && q.acceptedAnswer.text) || '';
            if (qText && !bodyText.includes(qText.replace(/’/g, "'")) && !html.includes(qText)) {
              warnings.push({ file: relPath, rule: 'FAQ_QUESTION_NOT_IN_BODY', detail: qText.slice(0, 100) });
            }
            if (aText && aText.length > 15) {
              const snippet = aText.slice(0, 40);
              if (!bodyText.includes(snippet) && !html.includes(snippet)) {
                warnings.push({ file: relPath, rule: 'FAQ_ANSWER_NOT_IN_BODY', detail: snippet });
              }
            }
          }
        }
      }

      if (type === 'HowTo') {
        const steps = Array.isArray(obj.step) ? obj.step : [];
        const normBody = normalize(bodyText);
        const missing = steps.filter((s) => {
          const t = (typeof s === 'object' ? (s.text || s.name) : s) || '';
          if (!t) return false;
          // A short 3-5 word step name is expected to appear near-verbatim;
          // check a meaningful prefix rather than the whole string so minor
          // punctuation differences don't false-positive.
          const key = normalize(t).split(' ').slice(0, 4).join(' ');
          return key.length > 3 && !normBody.includes(key);
        });
        if (missing.length > 0) {
          warnings.push({ file: relPath, rule: 'HOWTO_STEPS_NOT_VISIBLE', detail: `${missing.length}/${steps.length} step(s) not found in visible body text, e.g. "${(missing[0].text || missing[0].name || missing[0])}"` });
        }
      }

      if (type === 'Article') {
        if (obj.headline && h1 && normalize(obj.headline) !== normalize(h1)) {
          warnings.push({ file: relPath, rule: 'ARTICLE_HEADLINE_MISMATCH', detail: `"${obj.headline}" vs H1 "${h1}"` });
        }
        if (obj.url && canonical) {
          const a = obj.url.replace(/\/$/, '');
          const b = canonical.replace(/\/$/, '');
          if (a !== b) warnings.push({ file: relPath, rule: 'ARTICLE_URL_MISMATCH', detail: `${obj.url} vs ${canonical}` });
        }
      }

      if (type === 'DefinedTerm') {
        // DefinedTerm.name is the canonical term, not the page title -- it
        // only needs to appear somewhere in the visible body text, not
        // equal the H1 (Phase 7H policy; see SCHEMA-RESOLUTION.md).
        const name = obj.name || '';
        if (name && !normalize(bodyText).includes(normalize(name))) {
          warnings.push({ file: relPath, rule: 'DEFINEDTERM_NAME_NOT_IN_BODY', detail: name });
        }
      }

      if (type === 'BreadcrumbList') {
        const items = Array.isArray(obj.itemListElement) ? obj.itemListElement : [];
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          if (it.position !== i + 1) {
            critical.push({ file: relPath, rule: 'BREADCRUMB_POSITION_GAP', detail: `expected position ${i + 1}, got ${it.position}` });
          }
          if (it.item) {
            const rel = it.item.replace(/^https?:\/\/[^/]+/, '');
            const relClean = rel.replace(/^\//, '').replace(/\/$/, '') + '.html';
            if (urlPolicy.isRedirectSource(relClean) || urlPolicy.isRedirectSource(rel.replace(/^\//, ''))) {
              critical.push({ file: relPath, rule: 'BREADCRUMB_REFERENCES_RETIRED_URL', detail: it.item });
            }
          }
        }
      }
    }

    for (const [type, count] of typeCounts.entries()) {
      if (count > 1 && (type === 'FAQPage' || type === 'Organization' || type === 'BreadcrumbList' || type === 'WebApplication')) {
        warnings.push({ file: relPath, rule: `DUPLICATE_${type.toUpperCase()}`, detail: `${type} appears ${count} times` });
      }
    }
  }

  if (orgNames.size > 1) {
    critical.push({ file: '(sitewide)', rule: 'MULTIPLE_ORGANIZATION_IDENTITIES', detail: `Distinct Organization names found: ${[...orgNames].join(', ')}` });
  }

  const result = {
    status: critical.length === 0 ? 'PASS' : 'FAIL',
    pages_checked: pagesChecked,
    critical_count: critical.length,
    warning_count: warnings.length,
    critical: critical.slice(0, 100),
    warnings: warnings.slice(0, 100),
  };

  const outDir = path.join(ROOT, 'reports', 'phase-7h');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'schema-content-consistency-results.json'), JSON.stringify(result, null, 2) + '\n');

  console.log(`validate-schema-content-consistency: ${result.status} -- ${pagesChecked} pages checked, ${critical.length} critical, ${warnings.length} warning(s).`);
  if (critical.length) {
    for (const c of critical.slice(0, 20)) console.log(`  [CRITICAL:${c.rule}] ${c.file} -- ${c.detail}`);
    process.exitCode = 1;
  }
  return result;
}

if (require.main === module) run();
module.exports = { run };
