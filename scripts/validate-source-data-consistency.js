#!/usr/bin/env node
/**
 * validate-source-data-consistency.js
 *
 * Permanent, general-purpose guard for the four populate-data.js families:
 * academy, formulas, glossary, reference. Checks that the compiled JSON
 * under data/ agrees with its authoritative editable source under
 * scripts/data/ (see scripts/populate-data.js's header comment for the
 * source-of-truth contract this enforces).
 *
 * Read-only. Makes no filesystem writes and does not regenerate anything --
 * if source and JSON disagree, that is reported as a failure to be fixed by
 * running `node scripts/populate-data.js` after correcting the source (or by
 * correcting the source itself if the JSON has content the source lacks),
 * never by having this script silently reconcile them.
 *
 * Exit code 0 = all four families consistent. Exit code 1 = at least one
 * inconsistency found. Suitable for use as a build gate (see
 * scripts/run-all-generators.js) or standalone:
 *   node scripts/validate-source-data-consistency.js
 */

'use strict';

const path = require('path');
const ROOT = path.join(__dirname, '..');

let errors = 0;
function err(msg) { console.log('ERROR: ' + msg); errors++; }
function ok(msg) { console.log('OK: ' + msg); }
function req(rel) { return require(path.join(ROOT, rel)); }

/**
 * Checks one family: a set of source records against one compiled JSON array.
 *
 * @param {string} label - family name for messages
 * @param {Array<object>} sourceRecords - concatenated source records, in populate-data.js order
 * @param {Array<object>} jsonRecords - the compiled data/*.json array
 * @param {string} idField - field name used as the record identifier
 * @param {string|null} slugField - field name used as the record slug, or null if none
 */
function checkFamily(label, sourceRecords, jsonRecords, idField, slugField) {
  const before = errors;

  // 1-2. Duplicate ids within source and within JSON.
  const countBy = (arr, field) => {
    const counts = {};
    arr.forEach((r) => { counts[r[field]] = (counts[r[field]] || 0) + 1; });
    return counts;
  };
  Object.entries(countBy(sourceRecords, idField)).filter(([, c]) => c > 1)
    .forEach(([id]) => err(label + ': duplicate id in source: ' + id));
  Object.entries(countBy(jsonRecords, idField)).filter(([, c]) => c > 1)
    .forEach(([id]) => err(label + ': duplicate id in data/*.json: ' + id));

  // 3. Duplicate slugs (where applicable).
  if (slugField) {
    Object.entries(countBy(sourceRecords, slugField)).filter(([, c]) => c > 1)
      .forEach(([slug]) => err(label + ': duplicate slug in source: ' + slug));
    Object.entries(countBy(jsonRecords, slugField)).filter(([, c]) => c > 1)
      .forEach(([slug]) => err(label + ': duplicate slug in data/*.json: ' + slug));
  }

  // 4. Count mismatch.
  if (sourceRecords.length !== jsonRecords.length) {
    err(label + ': record count mismatch -- source has ' + sourceRecords.length + ', data/*.json has ' + jsonRecords.length);
  }

  // 5. Records missing from JSON / missing from source.
  const sourceById = {};
  sourceRecords.forEach((r) => { sourceById[r[idField]] = r; });
  const jsonById = {};
  jsonRecords.forEach((r) => { jsonById[r[idField]] = r; });

  Object.keys(sourceById).filter((id) => !(id in jsonById)).forEach((id) => {
    err(label + ': record present in source but missing from data/*.json: ' + id + ' (run: node scripts/populate-data.js)');
  });
  Object.keys(jsonById).filter((id) => !(id in sourceById)).forEach((id) => {
    err(label + ': record present in data/*.json but missing from source: ' + id +
      ' (register it in the appropriate scripts/data/*.js source file -- do not edit data/*.json directly)');
  });

  // 6. Meaningful record-level differences for records present in both.
  Object.keys(sourceById).filter((id) => id in jsonById).forEach((id) => {
    if (JSON.stringify(sourceById[id]) !== JSON.stringify(jsonById[id])) {
      err(label + ': record "' + id + '" differs between source and data/*.json ' +
        '(run: node scripts/populate-data.js if the source is correct, or check for a stray hand-edit of the JSON)');
    }
  });

  if (errors === before) {
    ok(label + ': ' + jsonRecords.length + ' records, source and data/*.json fully consistent, 0 duplicate ids' + (slugField ? '/slugs' : ''));
  }
}

// ---------------------------------------------------------------------
// Academy: 8 source files concatenated in populate-data.js's exact order.
// ---------------------------------------------------------------------
const ACADEMY_SOURCE_FILES = [
  'academy-fundamentals', 'academy-sanitizers', 'academy-testing', 'academy-water-balance',
  'academy-troubleshooting', 'academy-hot-tubs', 'academy-equipment', 'academy-vacation-rentals',
];
const academySource = ACADEMY_SOURCE_FILES.reduce((acc, f) => acc.concat(req('scripts/data/' + f + '.js')), []);
checkFamily('academy', academySource, req('data/academy.json').articles, 'id', 'slug');

// ---------------------------------------------------------------------
// Formulas
// ---------------------------------------------------------------------
checkFamily('formulas', req('scripts/data/formulas-data.js'), req('data/formulas.json').formulas, 'id', 'slug');

// ---------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------
checkFamily('glossary', req('scripts/data/glossary-terms.js'), req('data/glossary.json').terms, 'id', 'slug');

// ---------------------------------------------------------------------
// Reference
// ---------------------------------------------------------------------
checkFamily('reference', req('scripts/data/reference-pages.js'), req('data/reference.json').pages, 'id', 'slug');

console.log('');
console.log('validate-source-data-consistency: ' + (errors === 0 ? 'PASS' : 'FAIL') + ' -- ' + errors + ' error(s).');
process.exit(errors === 0 ? 0 : 1);
