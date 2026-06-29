#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const urlEngine = require('../js/url/url-engine');

const ROOT = path.join(__dirname, '..');
const NAV_PATH = path.join(ROOT, 'data', 'navigation.json');
const OUT_DIR = path.join(ROOT, 'audit', 'google');
const OUT_FILE = path.join(OUT_DIR, 'crawl-depth.html');

const SKIP_DIRS = new Set(['node_modules', '.git', 'assets', 'scripts', 'data', 'js', 'functions', 'lib', 'mcps', 'terminals', 'agent-transcripts', 'templates', 'partials']);

function walkHtml(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(full, out);
    else if (e.isFile() && e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function readJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function pageUrlFromFile(fp) {
  const rel = path.relative(ROOT, fp).replace(/\\/g, '/');
  return urlEngine.buildUrl(rel);
}

function parseLinks(html) {
  const out = [];
  const re = /<a[^>]+href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    if (/^(mailto:|tel:|javascript:|data:|https?:\/\/(?!waterbalancetools\.com))/i.test(href)) continue;
    out.push(urlEngine.normalizeHref(href));
  }
  return out;
}

function bfsDepth(graph, start) {
  const depth = new Map([[start, 0]]);
  const q = [start];
  while (q.length) {
    const u = q.shift();
    const d = depth.get(u);
    for (const v of (graph.get(u) || [])) {
      if (!depth.has(v)) {
        depth.set(v, d + 1);
        q.push(v);
      }
    }
  }
  return depth;
}

function run() {
  const files = walkHtml(ROOT);
  const pages = new Set();
  const graph = new Map();
  for (const fp of files) {
    const url = pageUrlFromFile(fp);
    pages.add(url);
    const links = parseLinks(fs.readFileSync(fp, 'utf8'));
    graph.set(url, links);
  }
  const depth = bfsDepth(graph, '/');
  const rows = [...pages].sort().map((url) => ({ url, depth: depth.has(url) ? depth.get(url) : 999 }));
  const maxDepth = rows.reduce((m, r) => Math.max(m, r.depth === 999 ? 0 : r.depth), 0);
  const avgDepth = rows.length ? (rows.reduce((s, r) => s + (r.depth === 999 ? 0 : r.depth), 0) / rows.length) : 0;
  const overTarget = rows.filter((r) => r.depth > 4);
  const unreachable = rows.filter((r) => r.depth === 999);
  const nav = readJson(NAV_PATH, { pages: [] });
  const titleByUrl = new Map((nav.pages || []).map((p) => [p.url, p.title]));

  const tableRows = rows.slice(0, 500).map((r) => `<tr><td>${r.url}</td><td>${titleByUrl.get(r.url) || ''}</td><td>${r.depth === 999 ? 'unreachable' : r.depth}</td></tr>`).join('\n');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Crawl Depth Audit</title><link rel="stylesheet" href="/style.css"></head><body><main class="container"><h1>Crawl Depth Audit</h1><p>Maximum clicks: ${maxDepth} · Average clicks: ${avgDepth.toFixed(2)} · Above target (&gt;4): ${overTarget.length} · Unreachable: ${unreachable.length}</p><table class="qa-table"><thead><tr><th>URL</th><th>Title</th><th>Depth</th></tr></thead><tbody>${tableRows}</tbody></table></main></body></html>`;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, html, 'utf8');
  console.log(`audit-crawl-depth: wrote audit/google/crawl-depth.html (${rows.length} pages)`);
}

run();
