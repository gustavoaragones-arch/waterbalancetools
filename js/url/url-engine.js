'use strict';

const BASE_URL = 'https://waterbalancetools.com';

function splitInput(rawValue) {
  let raw = String(rawValue == null ? '' : rawValue).trim().replace(/\\/g, '/');
  if (!raw) return { base: '/', suffix: '' };

  // Handle full absolute URL inputs.
  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      raw = `${u.pathname || '/'}${u.search || ''}${u.hash || ''}`;
    } catch (_) {
      // Fall back to raw string normalization.
    }
  }

  const q = raw.indexOf('?');
  const h = raw.indexOf('#');
  let cut = -1;
  if (q >= 0 && h >= 0) cut = Math.min(q, h);
  else if (q >= 0) cut = q;
  else if (h >= 0) cut = h;

  if (cut === -1) return { base: raw, suffix: '' };
  return { base: raw.slice(0, cut), suffix: raw.slice(cut) };
}

function normalizeSegment(segment) {
  let value = String(segment == null ? '' : segment).trim().toLowerCase();
  value = value.replace(/\s+/g, '-');
  value = value.replace(/-+/g, '-');
  value = value.replace(/^[-/]+|[-/]+$/g, '');
  return value;
}

function normalizePathPart(pathPart) {
  let base = String(pathPart == null ? '' : pathPart).trim().replace(/\\/g, '/');
  if (!base) return '/';

  // Remove domain if accidentally passed in as text.
  base = base.replace(/^https?:\/\/[^/]+/i, '');

  // Ensure leading slash and collapse duplicates.
  if (!base.startsWith('/')) base = '/' + base;
  base = base.replace(/^\/[a-z]:/i, '');
  if (!base.startsWith('/')) base = '/' + base;
  base = base.replace(/\/{2,}/g, '/');

  const segments = base.split('/').filter(Boolean).map((seg) => {
    let cleaned = normalizeSegment(seg);
    cleaned = cleaned.replace(/\.html$/i, '');
    return normalizeSegment(cleaned);
  }).filter(Boolean);

  // Remove terminal index.
  if (segments.length > 0 && segments[segments.length - 1] === 'index') {
    segments.pop();
  }

  // Collapse duplicate adjacent segments: /a/a/b -> /a/b
  const deduped = [];
  for (const seg of segments) {
    if (deduped.length && deduped[deduped.length - 1] === seg) continue;
    deduped.push(seg);
  }

  if (deduped.length === 0) return '/';
  return '/' + deduped.join('/');
}

function cleanPath(input) {
  const { base, suffix } = splitInput(input);
  const normalizedBase = normalizePathPart(base);
  return normalizedBase + suffix;
}

function buildUrl(input) {
  return cleanPath(input);
}

function href(input) {
  return buildUrl(input);
}

function absoluteUrl(input) {
  const normalized = cleanPath(input);
  if (normalized === '/') return BASE_URL + '/';
  return BASE_URL + normalized;
}

function canonicalUrl(input) {
  return absoluteUrl(input);
}

function sitemapUrl(input) {
  return absoluteUrl(input);
}

function normalizeHref(rawHref) {
  const raw = String(rawHref == null ? '' : rawHref).trim();
  if (!raw) return '/';

  // Preserve external links unchanged.
  if (/^(mailto:|tel:|javascript:|data:)/i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw) && !raw.startsWith(BASE_URL)) return raw;

  const { base, suffix } = splitInput(raw);
  let normalizedBase = base;

  // Convert relative hrefs to root-relative deterministic links.
  if (!/^https?:\/\//i.test(normalizedBase) && !normalizedBase.startsWith('/')) {
    normalizedBase = normalizedBase.replace(/^(\.\/)+/g, '');
    normalizedBase = normalizedBase.replace(/^(\.\.\/)+/g, '');
    normalizedBase = '/' + normalizedBase;
  }

  return cleanPath(normalizedBase + suffix);
}

function join(...parts) {
  let suffix = '';
  const allSegments = [];

  for (const part of parts) {
    const { base, suffix: sfx } = splitInput(part);
    if (sfx) suffix = sfx;

    let candidate = String(base || '').replace(/\\/g, '/');
    if (/^https?:\/\//i.test(candidate)) {
      try {
        candidate = new URL(candidate).pathname || '/';
      } catch (_) {
        candidate = '/';
      }
    }
    candidate = candidate.replace(/^\/+|\/+$/g, '');
    if (!candidate) continue;
    candidate.split('/').forEach((seg) => {
      if (!seg) return;
      allSegments.push(seg);
    });
  }

  const merged = '/' + allSegments.join('/');
  return cleanPath(merged + suffix);
}

function isCanonical(url) {
  const raw = String(url == null ? '' : url).trim();
  if (!raw) return false;
  if (/^https?:\/\//i.test(raw)) return raw === canonicalUrl(raw);
  return raw === cleanPath(raw);
}

module.exports = {
  BASE_URL,
  cleanPath,
  buildUrl,
  absoluteUrl,
  canonicalUrl,
  sitemapUrl,
  href,
  normalizeHref,
  normalizeSegment,
  join,
  isCanonical,
};
