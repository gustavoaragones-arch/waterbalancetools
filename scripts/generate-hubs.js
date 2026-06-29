#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const urlEngine = require('../js/url/url-engine');
const {
  template,
  fill,
  writeFile,
  SITE_HEADER,
  SITE_FOOTER,
  buildBreadcrumb,
  href,
  ROOT,
} = require('./template-utils');

const HUB_TEMPLATE = template('hub-template.html');
const NAV_PATH = path.join(ROOT, 'data', 'navigation.json');
const ENTITY_INDEX_PATH = path.join(ROOT, 'data', 'graph', 'entity-index.json');
const PLATFORM_PATH = path.join(ROOT, 'data', 'platform', 'platform.json');
const QA_SUMMARY_PATH = path.join(ROOT, 'qa-summary.json');

function readJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const nav = readJson(NAV_PATH, { pages: [] });
const entityIndex = readJson(ENTITY_INDEX_PATH, {});
const platform = readJson(PLATFORM_PATH, { platform: {} });
const qa = readJson(QA_SUMMARY_PATH, {});

const pages = nav.pages || [];
const entities = Object.values(entityIndex);

const HUBS = [
  {
    hubPath: '/calculators',
    title: 'Calculators Hub',
    description: 'All pool and hot tub calculators organized by use-case and maintenance workflow.',
    badge: 'Calculators',
  },
  {
    hubPath: '/charts',
    title: 'Charts Hub',
    description: 'Visual range charts for pool and spa chemistry with supporting calculator paths.',
    badge: 'Charts',
  },
  {
    hubPath: '/guides',
    title: 'Guides Hub',
    description: 'Guided explanations organized into practical problem-solving clusters.',
    badge: 'Guides',
  },
  {
    hubPath: '/guides/chlorine',
    title: 'Chlorine Guides Hub',
    description: 'Chlorine-specific troubleshooting, dosing, and maintenance decision guides.',
    badge: 'Guides',
  },
  {
    hubPath: '/guides/ph',
    title: 'pH Guides Hub',
    description: 'pH and alkalinity stabilization guides, from diagnostics to correction workflows.',
    badge: 'Guides',
  },
  {
    hubPath: '/guides/advanced',
    title: 'Advanced Guides Hub',
    description: 'Advanced chemistry scenarios and deeper technical interpretation guides.',
    badge: 'Guides',
  },
  {
    hubPath: '/guides/edge-cases',
    title: 'Edge Cases Guides Hub',
    description: 'Low-frequency but high-impact pool chemistry edge-case playbooks.',
    badge: 'Guides',
  },
  {
    hubPath: '/guides/hot-tub',
    title: 'Hot Tub Guides Hub',
    description: 'Hot tub-specific chemistry and maintenance troubleshooting guides.',
    badge: 'Guides',
  },
  {
    hubPath: '/guides/questions',
    title: 'Questions Guides Hub',
    description: 'Question-driven guide collection mapped to common search intents.',
    badge: 'Guides',
  },
  {
    hubPath: '/guides/seasonal',
    title: 'Seasonal Guides Hub',
    description: 'Seasonal opening, summer, and winter maintenance guide collection.',
    badge: 'Guides',
  },
  {
    hubPath: '/comparisons',
    title: 'Comparisons Hub',
    description: 'Side-by-side comparisons for core chemistry products and maintenance paths.',
    badge: 'Comparisons',
  },
  {
    hubPath: '/legal',
    title: 'Legal Hub',
    description: 'Ownership, legal, and policy pages for compliance and transparency.',
    badge: 'Legal',
  },
  {
    hubPath: '/maintenance',
    title: 'Maintenance Hub',
    description: 'Maintenance workflows and recurring service procedures.',
    badge: 'Maintenance',
  },
  {
    hubPath: '/programmatic',
    title: 'Programmatic Hub',
    description: 'Programmatic knowledge pages grouped by recurring calculation patterns.',
    badge: 'Programmatic',
  },
  {
    hubPath: '/programmatic/chlorine',
    title: 'Programmatic Chlorine Hub',
    description: 'Programmatic chlorine dosing pages grouped by volume and scenario.',
    badge: 'Programmatic',
  },
  {
    hubPath: '/programmatic/shock',
    title: 'Programmatic Shock Hub',
    description: 'Programmatic shock dosing pages by pool volume and event type.',
    badge: 'Programmatic',
  },
  {
    hubPath: '/programmatic/ph',
    title: 'Programmatic pH Hub',
    description: 'Programmatic pH adjustment pages and correction scenarios.',
    badge: 'Programmatic',
  },
  {
    hubPath: '/programmatic/hot-tubs',
    title: 'Programmatic Hot Tub Hub',
    description: 'Programmatic hot tub chemistry pages organized by spa volume.',
    badge: 'Programmatic',
  },
  {
    hubPath: '/programmatic/problems',
    title: 'Programmatic Problems Hub',
    description: 'Problem-resolution playbooks generated from recurring chemistry failures.',
    badge: 'Programmatic',
  },
  {
    hubPath: '/programmatic/explanations',
    title: 'Programmatic Explanations Hub',
    description: 'Conceptual explanation pages that support calculator interpretation.',
    badge: 'Programmatic',
  },
  {
    hubPath: '/programmatic/behavior',
    title: 'Programmatic Behavior Hub',
    description: 'Behavior and schedule-oriented pages for maintenance frequency decisions.',
    badge: 'Programmatic',
  },
];

function titleForUrl(u) {
  const entry = pages.find((p) => p.url === u);
  return entry ? entry.title : u.split('/').filter(Boolean).pop().replace(/-/g, ' ');
}

function pageExists(u) {
  return pages.some((p) => p.url === u);
}

function linksByPrefix(prefix) {
  return pages
    .filter((p) => p.url.startsWith(prefix + '/') && p.url !== prefix)
    .sort((a, b) => a.url.localeCompare(b.url));
}

function buildCards(items, max = 8) {
  const rows = items.slice(0, max).map((p) =>
    `        <a class="knowledge-card" href="${href(p.url)}" data-hub-child-link="true"><div class="knowledge-card-title">${esc(p.title)}</div><p class="knowledge-card-desc">${esc(p.description || '')}</p></a>`
  );
  return rows.length ? rows.join('\n') : '        <p>No child pages found.</p>';
}

function buildList(items, max = 10) {
  const rows = items.slice(0, max).map((p) =>
    `        <li><a href="${href(p.url)}" data-hub-child-link="true">${esc(p.title)}</a></li>`
  );
  return rows.length ? rows.join('\n') : '        <li>No entries yet.</li>';
}

function childCategories(prefix) {
  const children = new Set();
  for (const p of pages) {
    if (!p.url.startsWith(prefix + '/')) continue;
    const rest = p.url.slice((prefix + '/').length);
    const seg = rest.split('/')[0];
    if (seg) children.add(seg);
  }
  return [...children].sort().map((seg) => {
    const target = href(urlEngine.join(prefix, seg));
    return {
      url: target,
      title: titleForUrl(target),
      description: `Browse ${seg.replace(/-/g, ' ')} content.`,
    };
  });
}

function relatedKnowledge(prefix) {
  const categories = new Set(['academy', 'glossary', 'reference', 'formulas', 'resources', 'entities']);
  const currentRoot = prefix.split('/').filter(Boolean)[0] || '';
  categories.delete(currentRoot);
  const results = [];
  for (const cat of categories) {
    const candidate = '/' + cat;
    if (pageExists(candidate)) {
      results.push({ url: candidate, title: titleForUrl(candidate) });
    }
  }
  return results;
}

function relatedEntities(prefix) {
  const key = prefix.split('/').filter(Boolean).slice(-1)[0] || 'pool';
  const scored = entities.map((e) => {
    const hay = `${e.name} ${(e.keywords || []).join(' ')}`.toLowerCase();
    const score = hay.includes(key) ? 2 : 0;
    return { e, score };
  });
  scored.sort((a, b) => b.score - a.score || a.e.id.localeCompare(b.e.id));
  return scored.slice(0, 10).map(({ e }) => ({ url: `/entities/${e.id}`, title: e.name }));
}

function recentPages(prefix) {
  return pages
    .filter((p) => p.url.startsWith(prefix + '/'))
    .sort((a, b) => String(b.lastReviewed || '').localeCompare(String(a.lastReviewed || '')))
    .slice(0, 10)
    .map((p) => ({ url: p.url, title: p.title }));
}

function collectionSchema(hubPath, title, childLinks) {
  const itemList = childLinks.slice(0, 24).map((p, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: p.title,
    url: urlEngine.absoluteUrl(p.url),
  }));
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    url: urlEngine.absoluteUrl(hubPath),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: itemList,
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'WaterBalanceTools',
      url: urlEngine.absoluteUrl('/'),
    },
  };
  return `<script type="application/ld+json">\n${JSON.stringify(schema)}\n</script>`;
}

function run() {
  const qaScore = qa.overallScore ?? platform.platform?.qaScore ?? 'N/A';
  const version = platform.platform?.version || '1.0.0';
  const codename = platform.platform?.codename || 'Platform';
  const versionBadge = `Platform v${version} ${codename} · QA ${qaScore}/100`;

  let written = 0;
  for (const hub of HUBS) {
    const hubPath = urlEngine.buildUrl(hub.hubPath);
    const hubDir = path.join(ROOT, hubPath.slice(1));
    const outFile = path.join(hubDir, 'index.html');

    const children = linksByPrefix(hubPath);
    const categoryCards = childCategories(hubPath);
    const featured = children.slice(0, 8);
    const calculators = pages.filter((p) => p.category === 'calculators');
    const resources = pages.filter((p) => p.category === 'resources');
    const related = relatedKnowledge(hubPath);
    const relEntities = relatedEntities(hubPath);
    const recents = recentPages(hubPath);

    const breadcrumb = buildBreadcrumb(hubPath, hub.title);
    const hubSchema = collectionSchema(hubPath, hub.title, children);

    const html = fill(HUB_TEMPLATE, {
      PAGE_TITLE: `${hub.title} | WaterBalanceTools`,
      META_DESCRIPTION: hub.description,
      CANONICAL_URL: urlEngine.canonicalUrl(hubPath),
      OG_TITLE: `${hub.title} | WaterBalanceTools`,
      OG_DESCRIPTION: hub.description,
      BREADCRUMB_SCHEMA: breadcrumb.schema || '',
      HUB_SCHEMA: hubSchema,
      SITE_HEADER,
      SITE_FOOTER,
      BREADCRUMB_NAV: breadcrumb.nav || '',
      HUB_PATH: hubPath,
      HUB_BADGE: hub.badge,
      HERO_TITLE: hub.title,
      HERO_DESCRIPTION: hub.description,
      READING_TIME: '4 min read',
      LAST_UPDATED: new Date().toISOString().slice(0, 10),
      VERSION_BADGE: versionBadge,
      SECTION_DESCRIPTION: `This hub consolidates crawlable entry points for ${hubPath}.`,
      FEATURED_CONTENT: buildCards(featured),
      CATEGORY_CARDS: buildCards(categoryCards.map((c) => ({ url: c.url, title: c.title, description: c.description }))),
      POPULAR_CALCULATORS: buildList(calculators),
      POPULAR_RESOURCES: buildList(resources),
      RELATED_KNOWLEDGE: buildList(related),
      RELATED_ENTITIES: buildList(relEntities),
      RECENTLY_UPDATED: buildList(recents),
    });

    writeFile(outFile, html);
    written++;
    console.log(`  → ${path.relative(ROOT, outFile).replace(/\\/g, '/')}`);
  }

  console.log(`generate-hubs: wrote ${written} hub page(s)`);
}

run();
