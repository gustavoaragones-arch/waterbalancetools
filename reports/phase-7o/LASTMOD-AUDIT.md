# Phase 7O — Lastmod / Freshness Signal Audit

## Finding

`scripts/generate-sitemaps.js` (the generator actually wired into `npm run build` -- the legacy `scripts/generate-sitemap.js` is a standalone `npm run sitemap` command not part of the automated pipeline, and was not touched) computed a single `TODAY = new Date().toISOString().slice(0, 10)` once per script invocation and stamped it as `<lastmod>` on **every one of 481 sitemap URLs**, regardless of whether that specific page's content had actually changed. This is a well-known sitemap anti-pattern: it overstates freshness for stable pages and, at scale, teaches crawlers to discount the `lastmod` signal for the whole site since it never varies meaningfully between pages.

This is distinct from (and does not touch) the already-disclosed `Date.now()`-based QA/freshness-scoring nondeterminism in `qa/` and `reports/*.html` dashboard pages, which are internal tooling, not production sitemap data.

## Fix

Replaced the uniform `TODAY` stamp with a per-file `lastmod` derived from that file's actual git commit history (`git log --format="C:%cs" --name-only -- "*.html"`, parsed once per build into a map, keeping the most recent commit date per file since `git log` is newest-first). A file with no commit history yet (newly added, uncommitted) falls back to `TODAY` -- which is honest, since that genuinely is the only date known for it. No date was invented; every value comes from real, existing commit history.

The sitemap index file's own `<lastmod>` (on the 8 `<sitemap>` entries in `sitemap.xml`) was left as `TODAY` -- that file genuinely is regenerated fresh every build, so `TODAY` is accurate for it; the finding was specifically about per-page content lastmod, not the index-of-sitemaps metadata.

## Before / after

Before: all 481 URLs showed the single build date.

After: lastmod values now span the real range of commit dates in the repository's history (spot-checked: 2026-08-18 through 2026-08-23 across the current sitemap, reflecting real Phase 7K-7O commit dates), with each page's actual last-touched commit.

## Residual limitation (disclosed, not fixed)

The already-documented footer/version-badge whitespace-injection nondeterminism causes many pages to receive a purely-cosmetic diff on most builds that get committed, which means their git-commit-based lastmod will still advance somewhat more often than their *substantive* content actually changes. This is a real, honest improvement over "always today" (git commit date is still dramatically more meaningful and non-fabricated), but it is not a perfect "true content change" signal until that separate whitespace nondeterminism is fixed in its own dedicated phase. Not fixed here -- fixing the footer-whitespace injector itself is out of this phase's scope (indexing/crawl optimization, not build-output determinism).

## Verdict

**FIXED at the generator source.** No lastmod values were fabricated; every value traces to a real git commit.
