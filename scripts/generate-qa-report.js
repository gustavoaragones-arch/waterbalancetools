#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { buildContext, runAuditByName, esc, ROOT } = require('./qa-engine');

const QA_DIR = path.join(ROOT, 'qa');
const REPORTS_DIR = path.join(ROOT, 'reports');

const REPORT_ORDER = [
  'architecture',
  'seo',
  'performance',
  'schema',
  'accessibility',
  'mobile',
  'links',
  'entities',
  'datasets',
  'calculators',
  'content',
  'ai-readiness',
];

const REPORT_FILES = {
  architecture: 'architecture.html',
  seo: 'seo.html',
  performance: 'performance.html',
  schema: 'schema.html',
  accessibility: 'accessibility.html',
  mobile: 'mobile.html',
  links: 'links.html',
  entities: 'entities.html',
  datasets: 'datasets.html',
  calculators: 'calculators.html',
  content: 'content.html',
  'ai-readiness': 'ai-readiness.html',
};

const CERTIFICATION_THRESHOLDS = {
  architecture: 95,
  seo: 98,
  performance: 95,
  schema: 100,
  accessibility: 95,
  mobile: 95,
  links: 100,
  entities: 98,
  datasets: 100,
  calculators: 100,
  content: 95,
  'ai-readiness': 95,
};

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function ensureDirs() {
  fs.mkdirSync(QA_DIR, { recursive: true });
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function scoreColor(score) {
  if (score >= 85) return { label: 'Green', color: '#1f8a3c' };
  if (score >= 65) return { label: 'Yellow', color: '#b78600' };
  return { label: 'Red', color: '#c13232' };
}

function renderList(items) {
  if (!items || !items.length) return '<p>None.</p>';
  return `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
}

function defaultRootCause(auditId, issueText) {
  if (/duplicate/i.test(issueText)) return `Duplicate output detected in shared ${auditId} generation path.`;
  if (/missing/i.test(issueText)) return `Required metadata/component was not emitted by the shared template layer.`;
  if (/broken/i.test(issueText)) return `Generated links or references resolve to invalid targets.`;
  return `Validation mismatch found in ${auditId} audit checks.`;
}

function defaultRecommendation(auditId, issueText) {
  if (/duplicate/i.test(issueText)) return `Consolidate duplicate values in ${auditId} generators/templates.`;
  if (/missing/i.test(issueText)) return `Ensure ${auditId} generator emits this field for all affected pages.`;
  if (/broken/i.test(issueText)) return `Correct source relationship/link generation and rerun pipeline.`;
  return `Review ${auditId} generation pipeline and fix root-cause logic.`;
}

function renderIssueTable(auditId, issues, severity) {
  if (!issues || !issues.length) return '<p>None.</p>';
  const rows = issues.map((msg) => `<tr>
    <td>${severity}</td>
    <td>${esc(msg)}</td>
    <td>Affected files are listed in audit metrics/logs.</td>
    <td>${esc(defaultRootCause(auditId, msg))}</td>
    <td>${esc(defaultRecommendation(auditId, msg))}</td>
    <td>Requires action</td>
  </tr>`).join('');
  return `<table class="qa-table"><thead><tr><th>Severity</th><th>Issue</th><th>Affected Files</th><th>Root Cause</th><th>Recommended Fix</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderMetricsTable(metrics) {
  const rows = Object.entries(metrics || {});
  if (!rows.length) return '<p>No metrics captured.</p>';
  return `<table class="qa-table"><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>${
    rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(typeof v === 'object' ? JSON.stringify(v) : String(v))}</td></tr>`).join('')
  }</tbody></table>`;
}

function htmlShell(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} | WaterBalanceTools QA</title>
  <meta name="robots" content="noindex, nofollow">
  <style>
    body{font-family:Inter,system-ui,-apple-system,sans-serif;margin:0;background:#f6f8fb;color:#1d2630}
    .wrap{max-width:1100px;margin:0 auto;padding:24px}
    .card{background:#fff;border:1px solid #dbe3ef;border-radius:10px;padding:18px;margin:14px 0}
    .h{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center}
    .score{font-weight:700;padding:6px 10px;border-radius:999px;color:#fff}
    .qa-table{width:100%;border-collapse:collapse}
    .qa-table th,.qa-table td{border:1px solid #e3e8f2;padding:8px 10px;text-align:left;font-size:14px}
    .qa-table th{background:#f0f4fb}
    a{color:#0b5cab;text-decoration:none}
    a:hover{text-decoration:underline}
    code{background:#eef3fa;padding:2px 6px;border-radius:4px}
    ul{margin:8px 0 0 20px}
  </style>
</head>
<body>
  <div class="wrap">${body}</div>
</body>
</html>`;
}

function renderReportPage(name, result, ctx, trend) {
  const badge = scoreColor(result.score);
  const title = `${name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Audit`;
  const body = `
    <div class="card h">
      <div>
        <h1 style="margin:0">${esc(title)}</h1>
        <p style="margin:.35rem 0 0">Summary: ${esc(result.summary)}</p>
      </div>
      <div class="score" style="background:${badge.color}">${result.score}/100 · ${badge.label}</div>
    </div>
    <div class="card">
      <h2>Metadata</h2>
      ${renderMetricsTable({
        timestamp: ctx.timestamp,
        platformVersion: ctx.versions.platformVersion,
        datasetVersion: ctx.versions.datasetVersion,
        entityVersion: ctx.versions.entityVersion,
        trustVersion: ctx.versions.trustVersion,
        critical: result.critical,
        previousScore: trend.previousScore,
        currentScore: trend.currentScore,
        scoreChange: trend.scoreChange,
      })}
    </div>
    <div class="card"><h2>Passed Checks</h2>${renderList(result.passedChecks)}</div>
    <div class="card"><h2>Warnings</h2>${renderIssueTable(name, result.warnings, 'Warning')}</div>
    <div class="card"><h2>Errors</h2>${renderIssueTable(name, result.errors, 'Critical')}</div>
    <div class="card"><h2>Metrics</h2>${renderMetricsTable(result.metrics)}</div>
    <div class="card"><h2>Recommendations</h2>${renderList(result.recommendations)}</div>
    <p><a href="/qa/">← Back to QA Dashboard</a></p>
  `;
  return htmlShell(title, body);
}

function renderDashboard(results, ctx, totals, trends) {
  const scoreRows = REPORT_ORDER.map((k) => {
    const r = results[k];
    const c = scoreColor(r.score);
    const threshold = CERTIFICATION_THRESHOLDS[k];
    const pass = r.score >= threshold;
    return `<tr><td><a href="/reports/${REPORT_FILES[k]}">${esc(k)}</a></td><td>${r.score}</td><td>${threshold}</td><td>${trends[k].scoreChange}</td><td style="color:${c.color};font-weight:700">${c.label}</td><td>${pass ? 'Pass' : 'Fail'}</td><td>${r.errors.length}</td><td>${r.warnings.length}</td></tr>`;
  }).join('');
  const badge = scoreColor(totals.overallScore);

  const body = `
    <div class="card h">
      <div>
        <h1 style="margin:0">QA Certification Dashboard</h1>
        <p style="margin:.35rem 0 0">Platform Certification & Zero-Critical Remediation (Phase 5B.6)</p>
      </div>
      <div class="score" style="background:${badge.color}">${totals.overallScore}/100 · ${badge.label}</div>
    </div>
    <div class="card">
      <h2>Platform Snapshot</h2>
      ${renderMetricsTable({
        platformVersion: ctx.versions.platformVersion,
        buildDate: ctx.timestamp,
        datasetVersion: ctx.versions.datasetVersion,
        entityVersion: ctx.versions.entityVersion,
        knowledgeVersion: ctx.versions.knowledgeVersion,
        trustVersion: ctx.versions.trustVersion,
        totalPages: totals.totalPages,
        totalCalculators: totals.totalCalculators,
        totalAcademyArticles: totals.totalAcademyArticles,
        totalFormulaPages: totals.totalFormulaPages,
        totalGlossaryTerms: totals.totalGlossaryTerms,
        totalReferencePages: totals.totalReferencePages,
        totalEntities: totals.totalEntities,
        totalDatasets: totals.totalDatasets,
        brokenLinks: totals.brokenLinks,
        validationErrors: totals.validationErrors,
        warnings: totals.validationWarnings,
      })}
    </div>
    <div class="card">
      <h2>Audit Scores</h2>
      <table class="qa-table">
        <thead><tr><th>Audit</th><th>Score</th><th>Minimum</th><th>Delta</th><th>Status</th><th>Threshold</th><th>Errors</th><th>Warnings</th></tr></thead>
        <tbody>${scoreRows}</tbody>
      </table>
    </div>
  `;
  return htmlShell('QA Dashboard', body);
}

function renderCertificationPage(results, ctx, overallScore, overallStatus, thresholdFailures, validationErrors, validationWarnings) {
  const rows = REPORT_ORDER.map((k) => `<tr><td>${esc(k)}</td><td>${results[k].score}</td><td>${CERTIFICATION_THRESHOLDS[k]}</td><td>${results[k].score >= CERTIFICATION_THRESHOLDS[k] ? 'Pass' : 'Fail'}</td></tr>`).join('');
  const recommendation = thresholdFailures.length === 0 ? 'Certified for production release.' : 'Not certified. Resolve failed categories before release.';
  const body = `
    <div class="card h">
      <div>
        <h1 style="margin:0">Platform Certification</h1>
        <p style="margin:.35rem 0 0">WaterBalanceTools Phase 5B.6 certification record</p>
      </div>
      <div class="score" style="background:${scoreColor(overallScore).color}">${overallScore}/100 · ${overallStatus}</div>
    </div>
    <div class="card">${renderMetricsTable({
      platformVersion: ctx.versions.platformVersion,
      buildDate: ctx.timestamp,
      overallScore,
      validationErrors,
      validationWarnings,
      criticalIssues: REPORT_ORDER.filter((k) => results[k].critical).length,
      releaseRecommendation: recommendation,
      certificationTimestamp: new Date().toISOString(),
    })}</div>
    <div class="card"><h2>Category Scores</h2><table class="qa-table"><thead><tr><th>Category</th><th>Score</th><th>Minimum</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="card"><h2>Threshold Failures</h2>${renderList(thresholdFailures.length ? thresholdFailures : ['None'])}</div>
  `;
  return htmlShell('Certification', body);
}

function writeSummaryArtifacts(summary) {
  fs.writeFileSync(path.join(ROOT, 'qa-summary.json'), JSON.stringify(summary, null, 2) + '\n', 'utf8');

  const csvRows = [
    ['audit', 'score', 'status', 'errors', 'warnings'],
    ...Object.entries(summary.audits).map(([k, a]) => [k, a.score, a.status, a.errors, a.warnings]),
    ['overall', summary.overallScore, summary.overallStatus, summary.validationErrors, summary.validationWarnings],
  ];
  fs.writeFileSync(path.join(ROOT, 'qa-summary.csv'), csvRows.map((r) => r.join(',')).join('\n') + '\n', 'utf8');

  let md = '# QA Summary\n\n';
  md += `- Build Date: ${summary.buildDate}\n- Platform Version: ${summary.platformVersion}\n- Overall Score: ${summary.overallScore} (${summary.overallStatus})\n`;
  md += `- Errors: ${summary.validationErrors}\n- Warnings: ${summary.validationWarnings}\n\n`;
  md += '| Audit | Score | Status | Errors | Warnings |\n|---|---:|---|---:|---:|\n';
  Object.entries(summary.audits).forEach(([k, a]) => {
    md += `| ${k} | ${a.score} | ${a.status} | ${a.errors} | ${a.warnings} |\n`;
  });
  fs.writeFileSync(path.join(ROOT, 'qa-summary.md'), md, 'utf8');
}

function countFiles(dir, filter) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter(filter).length;
}

function countHtmlRecursive(dir) {
  if (!fs.existsSync(dir)) return 0;
  let total = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      total += countHtmlRecursive(full);
    } else if (e.isFile() && e.name.endsWith('.html')) {
      total++;
    }
  }
  return total;
}

function run() {
  ensureDirs();
  const previousSummary = readJson(path.join(ROOT, 'qa-summary.json'), null);
  const ctx = buildContext();
  const results = {};
  const trends = {};
  REPORT_ORDER.forEach((name) => {
    results[name] = runAuditByName(name, ctx);
    const prev = previousSummary?.audits?.[name]?.score;
    trends[name] = {
      previousScore: typeof prev === 'number' ? prev : 'n/a',
      currentScore: results[name].score,
      scoreChange: typeof prev === 'number' ? (results[name].score - prev) : 'n/a',
    };
    const html = renderReportPage(name, results[name], ctx, trends[name]);
    fs.writeFileSync(path.join(REPORTS_DIR, REPORT_FILES[name]), html, 'utf8');
  });

  const overallScore = Math.round(REPORT_ORDER.reduce((s, n) => s + results[n].score, 0) / REPORT_ORDER.length);
  const overallStatus = scoreColor(overallScore).label;
  const validationErrors = REPORT_ORDER.reduce((s, n) => s + results[n].errors.length, 0);
  const validationWarnings = REPORT_ORDER.reduce((s, n) => s + results[n].warnings.length, 0);
  const brokenLinks = (results.links.metrics && results.links.metrics.brokenLinks) || 0;
  const totalEntities = Object.keys(readJson(path.join(ROOT, 'data', 'graph', 'entity-index.json'), {})).length;
  const totalDatasets = fs.readdirSync(path.join(ROOT, 'data', 'datasets')).filter((f) => f.endsWith('.json') && f !== 'resolved-ranges.json').length;

  const totals = {
    overallScore,
    totalPages: ctx.pages.length,
    totalCalculators: countFiles(path.join(ROOT, 'calculators'), (f) => f.endsWith('.html')),
    totalAcademyArticles: countHtmlRecursive(path.join(ROOT, 'academy')) - 9,
    totalFormulaPages: countFiles(path.join(ROOT, 'formulas'), (f) => f.endsWith('.html')) - 1,
    totalGlossaryTerms: countFiles(path.join(ROOT, 'glossary'), (f) => f.endsWith('.html')) - 1,
    totalReferencePages: countHtmlRecursive(path.join(ROOT, 'reference')) - 1,
    totalEntities,
    totalDatasets,
    brokenLinks,
    validationErrors,
    validationWarnings,
  };

  const dashboard = renderDashboard(results, ctx, totals, trends);
  fs.writeFileSync(path.join(QA_DIR, 'index.html'), dashboard, 'utf8');

  const summary = {
    buildDate: ctx.timestamp,
    platformVersion: ctx.versions.platformVersion,
    overallScore,
    overallStatus,
    validationErrors,
    validationWarnings,
    thresholds: CERTIFICATION_THRESHOLDS,
    audits: Object.fromEntries(REPORT_ORDER.map((k) => [k, {
      score: results[k].score,
      status: scoreColor(results[k].score).label,
      errors: results[k].errors.length,
      warnings: results[k].warnings.length,
      previousScore: trends[k].previousScore,
      scoreChange: trends[k].scoreChange,
    }])),
  };
  writeSummaryArtifacts(summary);

  const criticalAudits = REPORT_ORDER.filter((k) => results[k].critical);
  const thresholdFailures = REPORT_ORDER
    .filter((k) => results[k].score < CERTIFICATION_THRESHOLDS[k])
    .map((k) => `${k}: ${results[k].score} < ${CERTIFICATION_THRESHOLDS[k]}`);
  const releaseGateFailed = criticalAudits.length > 0 ||
    thresholdFailures.length > 0 ||
    brokenLinks > 0 ||
    (results.calculators.metrics && results.calculators.metrics.missingTrust > 0) ||
    (results.seo.metrics && results.seo.metrics.duplicateTitles > 0);

  if (!releaseGateFailed) {
    const certHtml = renderCertificationPage(results, ctx, overallScore, overallStatus, thresholdFailures, validationErrors, validationWarnings);
    fs.writeFileSync(path.join(QA_DIR, 'certification.html'), certHtml, 'utf8');
  }

  console.log(`QA: reports generated (${REPORT_ORDER.length} audits), overall ${overallScore}/100`);
  console.log(`QA artifacts: /qa/index.html, /reports/*.html, qa-summary.{json,csv,md}`);
  if (releaseGateFailed) {
    console.error(`QA release gate failed. Critical audits: ${criticalAudits.join(', ') || 'none'}. Threshold failures: ${thresholdFailures.join('; ') || 'none'}`);
    process.exit(1);
  }
}

run();

