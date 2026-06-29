#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PLATFORM_DIR = path.join(ROOT, 'data', 'platform');
const RELEASES_DIR = path.join(ROOT, 'releases');

const REQUIRED_FILES = [
  'platform.json',
  'versions.json',
  'compatibility.json',
  'release-policy.json',
];

const REQUIRED_SUBSYSTEMS = [
  'knowledgeGraph',
  'entityLayer',
  'datasets',
  'formulaEngine',
  'calculatorEngine',
  'trustSystem',
  'qaFramework',
];

function readJson(p, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function exists(p) {
  return fs.existsSync(p);
}

function parseSemver(v) {
  const m = String(v || '').match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

function cmpSemver(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

function run() {
  let errors = 0;
  let warnings = 0;

  function fail(msg) {
    errors++;
    console.error(`  ✗ ${msg}`);
  }
  function warn(msg) {
    warnings++;
    console.warn(`  ! ${msg}`);
  }
  function pass(msg) {
    console.log(`  ✓ ${msg}`);
  }

  console.log('validate-versioning: checking semantic platform versioning...');

  REQUIRED_FILES.forEach((name) => {
    const fp = path.join(PLATFORM_DIR, name);
    if (!exists(fp)) fail(`Missing required file: data/platform/${name}`);
    else pass(`data/platform/${name} exists`);
  });

  const platform = readJson(path.join(PLATFORM_DIR, 'platform.json'), {});
  const versions = readJson(path.join(PLATFORM_DIR, 'versions.json'), {});
  const compatibility = readJson(path.join(PLATFORM_DIR, 'compatibility.json'), { matrix: [] });

  const pvRaw = platform.platform?.version;
  const pv = parseSemver(pvRaw);
  if (!pv) fail(`Invalid platform semantic version: ${pvRaw}`);
  else pass(`Platform version ${pvRaw} is valid semver`);

  REQUIRED_SUBSYSTEMS.forEach((key) => {
    const raw = platform[key]?.version;
    const sv = parseSemver(raw);
    if (!sv) {
      fail(`Missing or invalid subsystem version: ${key}`);
      return;
    }
    if (pv && cmpSemver(pv, sv) < 0) {
      fail(`Platform version ${pvRaw} is older than subsystem ${key} ${raw}`);
      return;
    }
    pass(`Subsystem ${key} version ${raw} valid`);
  });

  const history = versions.releaseHistory || [];
  const uniqueVersions = new Set();
  history.forEach((r) => {
    if (!parseSemver(r.version)) fail(`Release history has invalid semver: ${r.version}`);
    if (uniqueVersions.has(r.version)) fail(`Duplicate release version in history: ${r.version}`);
    uniqueVersions.add(r.version);
    const sem = parseSemver(r.version);
    if (sem && sem.patch === 0 && !r.codename) {
      fail(`Missing codename for major/minor release: ${r.version}`);
    }
    if (r.subsystems) {
      REQUIRED_SUBSYSTEMS.forEach((s) => {
        if (!parseSemver(r.subsystems[s])) fail(`Release ${r.version} missing subsystem version for ${s}`);
      });
    } else {
      fail(`Release ${r.version} missing subsystem version object`);
    }
  });

  const platformEntry = history.find((r) => r.version === pvRaw);
  if (!platformEntry) fail(`Release history mismatch: missing current platform version ${pvRaw}`);
  else pass(`Release history includes current platform version ${pvRaw}`);

  const matrix = compatibility.matrix || [];
  if (!matrix.length) fail('Compatibility matrix mismatch: no rows found');
  else pass(`Compatibility matrix rows: ${matrix.length}`);

  const matrixCurrent = matrix.find((r) => r.platform === pvRaw);
  if (!matrixCurrent) fail(`Compatibility matrix mismatch: missing platform ${pvRaw}`);
  else pass(`Compatibility matrix includes ${pvRaw}`);

  if (!exists(path.join(RELEASES_DIR, 'index.html'))) fail('Release history mismatch: releases/index.html missing');
  else pass('releases/index.html exists');

  history.forEach((r) => {
    const fp = path.join(RELEASES_DIR, `${r.version}.html`);
    if (!exists(fp)) fail(`Release history mismatch: releases/${r.version}.html missing`);
  });
  if (history.length) pass('Release pages exist for all history versions');

  const badgeTargets = [
    path.join(ROOT, 'qa', 'index.html'),
    path.join(ROOT, 'qa', 'certification.html'),
    path.join(ROOT, 'about', 'index.html'),
    path.join(ROOT, 'methodology', 'index.html'),
    path.join(ROOT, 'revisions', 'index.html'),
  ];

  badgeTargets.forEach((fp) => {
    if (!exists(fp)) {
      warn(`Badge target missing (skipped): ${path.relative(ROOT, fp)}`);
      return;
    }
    const html = fs.readFileSync(fp, 'utf8');
    if (!html.includes(`v${pvRaw}`)) fail(`Version badge mismatch: ${path.relative(ROOT, fp)} missing v${pvRaw}`);
  });
  pass('Version badge checks completed');

  const compatibleRelease = compatibility.matrix.find((r) => r.platform === pvRaw);
  if (compatibleRelease && platform.platform?.status && !String(compatibleRelease.status || '').includes(platform.platform.status.split(' ')[0])) {
    warn(`Compatibility status (${compatibleRelease.status}) differs from platform status (${platform.platform.status})`);
  }

  console.log(`\nvalidate-versioning: Errors ${errors}, Warnings ${warnings}`);
  if (errors > 0) {
    console.error('validate-versioning: FAILED');
    process.exit(1);
  }
  console.log('validate-versioning: PASSED');
}

run();
