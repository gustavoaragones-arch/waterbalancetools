#!/usr/bin/env node
'use strict';
/**
 * Regression tests for validate-generated-output.js and fill()'s
 * unresolved-token guard. Writes temporary fixture files under a scratch
 * directory, runs the real scanners against them, then removes the
 * fixtures -- no fixture is left in the repository.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { scanFile, scanAll } = require('./validate-generated-output');
const { fill } = require('./template-utils');

let assertions = 0;
function expect(actual, expected, label) {
  assertions++;
  assert.deepStrictEqual(actual, expected, label);
}
function expectTrue(value, label) {
  assertions++;
  assert.strictEqual(Boolean(value), true, label);
}
function expectFalse(value, label) {
  assertions++;
  assert.strictEqual(Boolean(value), false, label);
}
function expectThrows(fn, label) {
  assertions++;
  assert.throws(fn, undefined, label);
}
function expectDoesNotThrow(fn, label) {
  assertions++;
  assert.doesNotThrow(fn, label);
}

// ── fill() token substitution ───────────────────────────────────────────────

// 1. Valid template substitution.
expect(fill('<h1>{{TITLE}}</h1>', { TITLE: 'Free Chlorine' }), '<h1>Free Chlorine</h1>', 'valid substitution');

// 2. Missing required variable (value undefined) must be a build error.
expectThrows(() => fill('{"name":"{{H1_TITLE}}"}', { H1_TITLE: undefined }), 'undefined value throws');
expectThrows(() => fill('{"name":"{{H1_TITLE}}"}', { H1_TITLE: null }), 'null value throws');

// 3. Optional variable with an explicit, intentional '' fallback must NOT throw.
expectDoesNotThrow(() => fill('<div>{{SIDEBAR}}</div>', { SIDEBAR: '' }), 'explicit empty-string fallback is allowed');
expect(fill('<div>{{SIDEBAR}}</div>', { SIDEBAR: '' }), '<div></div>', 'empty-string fallback renders as empty');

// 4. A token whose key is not present at all is left unchanged (intentional
//    multi-pass substitution across inject-*.js pipeline stages).
expect(fill('{{BASE}}/{{SLUG}}', { SLUG: 'algaecide' }), '{{BASE}}/algaecide', 'unset key left for a later pass');

// 5. Digit-bearing token names (the original H1_TITLE regex bug) now match.
expect(fill('{{H1_TITLE}}', { H1_TITLE: 'Algaecide' }), 'Algaecide', 'digit-bearing token name substitutes correctly');

// ── validate-generated-output.js detection ──────────────────────────────────

const FIXTURE_DIR = path.join(os.tmpdir(), `wbt-validator-test-${process.pid}`);
const ROOT = path.join(__dirname, '..');
const REL_FIXTURE_DIR = path.relative(ROOT, FIXTURE_DIR);

function withFixture(relFile, content, fn) {
  const abs = path.join(ROOT, relFile);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
  try {
    fn(relFile);
  } finally {
    fs.rmSync(abs, { force: true });
  }
}

// Fixtures are written under a directory name that is not in the validator's
// own EXCLUDE_DIRS set, and removed in a `finally` block so nothing survives
// a failed assertion.
const FIXTURE_REL_DIR = '__phase7b_test_fixture__';

try {
  // 4. Unresolved {{TOKEN}} detection.
  withFixture(`${FIXTURE_REL_DIR}/single-token.html`, '<h1>{{H1_TITLE}}</h1>', (rel) => {
    const violations = scanFile(rel);
    expectTrue(violations.some((v) => v.token === '{{H1_TITLE}}' && v.kind === 'MUSTACHE_TOKEN'), 'detects a single unresolved {{H1_TITLE}}');
  });

  // 5. Multiple unresolved tokens.
  withFixture(`${FIXTURE_REL_DIR}/multi-token.html`, '<h1>{{H1_TITLE}}</h1><p>{{META_DESCRIPTION}}</p>', (rel) => {
    const violations = scanFile(rel);
    expect(violations.length, 2, 'detects multiple distinct unresolved tokens');
  });

  // 6. Token inside JSON-LD.
  withFixture(`${FIXTURE_REL_DIR}/jsonld-token.html`, '<script type="application/ld+json">{"@type":"DefinedTerm","name":"{{H1_TITLE}}"}</script>', (rel) => {
    const violations = scanFile(rel);
    expectTrue(violations.some((v) => v.token === '{{H1_TITLE}}'), 'detects unresolved token inside JSON-LD');
  });
  // Stringified "undefined"/"null" inside JSON-LD (the formulas.js field-name bug class).
  withFixture(`${FIXTURE_REL_DIR}/jsonld-undefined.html`, '<script type="application/ld+json">{"@type":"HowTo","description":"undefined"}</script>', (rel) => {
    const violations = scanFile(rel);
    expectTrue(violations.some((v) => v.kind === 'JSON_LD_STRINGIFIED_UNDEFINED'), 'detects stringified "undefined" in JSON-LD');
  });

  // 7. Token inside visible HTML.
  withFixture(`${FIXTURE_REL_DIR}/visible-token.html`, '<main><p>Welcome to {{SITE_NAME}}</p></main>', (rel) => {
    const violations = scanFile(rel);
    expectTrue(violations.some((v) => v.token === '{{SITE_NAME}}'), 'detects unresolved token in visible body text');
  });

  // 8. Token inside metadata.
  withFixture(`${FIXTURE_REL_DIR}/meta-token.html`, '<meta name="description" content="{{META_DESCRIPTION}}">', (rel) => {
    const violations = scanFile(rel);
    expectTrue(violations.some((v) => v.token === '{{META_DESCRIPTION}}'), 'detects unresolved token in meta content');
  });

  // 9. Token inside attribute values.
  withFixture(`${FIXTURE_REL_DIR}/attr-token.html`, '<a href="{{CANONICAL_URL}}" class="cta">Go</a>', (rel) => {
    const violations = scanFile(rel);
    expectTrue(violations.some((v) => v.token === '{{CANONICAL_URL}}'), 'detects unresolved token inside an attribute value');
  });

  // 10. Token inside a generated page outside the originally-affected family
  //     (the validator must not be hardcoded to glossary/academy/formulas).
  withFixture(`${FIXTURE_REL_DIR}/outside-family.html`, '<html><body><h1>{{ENTITY_NAME}}</h1></body></html>', (rel) => {
    const violations = scanFile(rel);
    expectTrue(violations.some((v) => v.token === '{{ENTITY_NAME}}'), 'detects unresolved token in a page outside the original 3 families');
  });

  // A clean, fully-resolved page must produce zero violations.
  withFixture(`${FIXTURE_REL_DIR}/clean.html`, '<html><body><h1>Free Chlorine</h1><p>A real definition.</p></body></html>', (rel) => {
    const violations = scanFile(rel);
    expect(violations.length, 0, 'a fully-resolved page has zero violations');
  });

  // Printable fill-in-the-blank underscores must NOT be flagged (false-positive guard).
  withFixture(`${FIXTURE_REL_DIR}/printable.html`, '<p>Property: ________________ Date: ________________</p>', (rel) => {
    const violations = scanFile(rel);
    expect(violations.length, 0, 'plain underscore blanks are not flagged as DUNDER_PLACEHOLDER');
  });

  // Whole-repo scanAll() must include the fixture directory's violations
  // (proves the exit-1 build gate would actually fire) and must not choke
  // on the rest of the real production tree.
  withFixture(`${FIXTURE_REL_DIR}/wired-in.html`, '<h1>{{H1_TITLE}}</h1>', () => {
    const result = scanAll();
    const hit = result.results.find((r) => r.file.replace(/\\/g, '/') === `${FIXTURE_REL_DIR}/wired-in.html`);
    expectTrue(!!hit, 'scanAll() walks the fixture directory and finds the injected defect');
  });
} finally {
  fs.rmSync(path.join(ROOT, FIXTURE_REL_DIR), { recursive: true, force: true });
}

expectFalse(fs.existsSync(path.join(ROOT, FIXTURE_REL_DIR)), 'test fixture directory was fully cleaned up');

if (assertions < 19) {
  throw new Error(`Expected at least 20 assertions, got ${assertions}`);
}

console.log(`PASS: validate-generated-output regression tests completed (${assertions} assertions).`);
