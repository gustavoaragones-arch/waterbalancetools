# PHASE 8H — GSC SITEMAP PROCESSING & INDEXATION READINESS AUDIT

## 1. Baseline
- Starting commit: `8a042c1d02318b6bf7bbe7cc88dc0d70066465ee` (Phase 8G closeout)
- Branch: `main`
- HEAD: `8a042c1d02318b6bf7bbe7cc88dc0d70066465ee`
- origin/main: `8a042c1d02318b6bf7bbe7cc88dc0d70066465ee` (HEAD == origin/main)
- Working-tree state: clean at start; clean at completion (only new files added — see Section 12)

## 2. Executive finding

**PASS — CURRENT SITEMAP HEALTHY**

## 3. Why GSC showed 0 discovered pages

Not a production defect. The sitemap-index architecture currently live in
production (`scripts/generate-sitemaps.js`, `sitemapindex` format) was
introduced in commit `1ce7eb6` on **2026-06-29** — the exact date GSC shows
for both "Submitted" and "Last read." This is strong evidence that Google's
one and only read of the sitemap happened at or near the moment that system
first went live, and that GSC has not re-crawled it in the more than two
months since (through the entire Phase 7B–7O SEO/indexing work and Phase
8A–8G multilingual rollout). Live production evidence gathered in this
audit — fetching and parsing the actual deployed sitemap.xml and all 8
child sitemaps — found the system fully valid, fully populated (487 URLs,
0 duplicates, 0 broken links), and apex-hostname-consistent throughout.
There is nothing currently wrong with the sitemap that would cause zero
discovery; the GSC figure reflects a stale, unrepeated read, not current
reality. Separately, GSC's own UI commonly displays "0" on the index row
itself for a `Sitemap index` type submission (real per-page counts appear
on the child-sitemap rows) — this cannot be confirmed against this specific
account from the repository, and should be checked manually (Section 11).

## 4. Live sitemap topology

| Parent sitemap | Child sitemap | Status | URL count | Hostname | Redirect | Validation |
|---|---|---|---|---|---|---|
| sitemap.xml | sitemap-calculators.xml | 200 | 24 | apex | none | valid XML |
| sitemap.xml | sitemap-guides.xml | 200 | 49 | apex | none | valid XML |
| sitemap.xml | sitemap-resources.xml | 200 | 9 | apex | none | valid XML |
| sitemap.xml | sitemap-academy.xml | 200 | 59 | apex | none | valid XML |
| sitemap.xml | sitemap-formulas.xml | 200 | 10 | apex | none | valid XML |
| sitemap.xml | sitemap-glossary.xml | 200 | 101 | apex | none | valid XML |
| sitemap.xml | sitemap-reference.xml | 200 | 37 | apex | none | valid XML |
| sitemap.xml | sitemap-other.xml | 200 | 198 | apex | none | valid XML |
| — | **Total** | 200 (index itself) | **487** | apex | none | valid `sitemapindex` |

0 duplicate URLs within any child sitemap, 0 duplicated across child
sitemaps, 0 non-apex `<loc>` values anywhere in the tree.

## 5. Apex vs www analysis

`www.waterbalancetools.com` returns **NXDOMAIN** — confirmed via `curl`,
`dig` (empty A/AAAA answers), and `nslookup`. No DNS record of any kind
exists for `www`. This is a DNS-zone-level absence outside this
repository's control, and it fully explains the historical GSC "Couldn't
fetch" entry: Google could never have fetched a hostname that has never
resolved. Zero references to `www.waterbalancetools.com` exist anywhere in
this codebase (scripts, generated pages, sitemaps, robots.txt, canonical
tags, hreflang) — the site's entire URL architecture has always been
apex-only. No remediation required or possible from this repository.

## 6. robots.txt analysis

Live production `robots.txt` is byte-identical to the committed repository
file: `Allow: /` for all agents, declares `Sitemap:
https://waterbalancetools.com/sitemap.xml`, zero `Disallow` directives, no
`www` reference. Nothing blocks the sitemap, any child sitemap, `/es/`, or
any calculator page.

## 7. Spanish sitemap analysis

All 9 Phase 8G/8E Spanish calculator URLs confirmed live, HTTP 200,
self-canonical, `robots: index, follow`, reciprocal hreflang with their
English counterparts, and present in `sitemap-calculators.xml` exactly once
each: `chemical-calculator`, `pool-volume-calculator`,
`pool-chlorine-calculator`, `pool-ph-calculator`, `pool-shock-calculator`,
`hot-tub-chlorine-calculator`, `hot-tub-ph-calculator`,
`hot-tub-shock-calculator`, `spa-volume-calculator`.

## 8. Canonical/indexability analysis

`url-policy.js`'s `isSitemapEligible()` enforces self-canonical-only
inclusion and excludes any `noindex` or redirect-source page at generation
time — unchanged, and confirmed still correctly enforced. Live spot-checks
across calculators, guides, academy, and reference categories found no
canonical mismatch, no unintended `noindex`, no unintended redirect.

## 9. Cache/staleness analysis

Live `sitemap.xml`: `cache-control: public, max-age=7200, must-revalidate`
via Cloudflare edge; repeat and cache-busted requests returned
byte-identical content (MD5-verified). A 2-hour edge cache cannot explain a
read that is over two months stale — the staleness is on the GSC side, not
in production caching. Live content matches the current committed
repository state exactly.

## 10. GSC interpretation

See Section 3. What can be concluded from repository/live evidence: the
deployed sitemap system is fully valid and fully populated today, and the
architecture's introduction date coincides exactly with GSC's last-read
date. What cannot be concluded from this repository: the internal state of
the user's GSC account, or how its UI is currently displaying per-child-
sitemap discovery counts. No GSC data was fabricated at any point in this
audit.

## 11. GSC resubmission recommendation

**A. RESUBMIT NOW** — submit exactly `https://waterbalancetools.com/sitemap.xml`.
Do not resubmit the `www` variant (Section 5). Resubmission does not
guarantee indexing; it prompts a fresh read. After resubmitting, check in
GSC: submission status (fresh "Success"), last read (today's date, not
June 29), discovered pages (on both the index row and, more importantly,
each of the 8 child-sitemap rows individually), child sitemap processing
status (all 8 "Success"), and errors/warnings (none expected).

## 12. Code changes

No production source changes were required. Files added (audit
deliverables only): `docs/PHASE-8H-GSC-SITEMAP-AUDIT.md`,
`reports/phase-8h-status.md`, `scripts/validate-phase-8h.js`. No file under
`calculators/`, `es/`, `scripts/generate-sitemaps.js`, `scripts/url-policy.js`,
`js/url/url-engine.js`, `robots.txt`, or any sitemap XML file was modified.

## 13. Validation results

`scripts/validate-phase-8h.js`: **PASS — 0 errors, 0 warnings** (10
lettered checks A–J covering baseline gate, robots.txt content, apex-only
`BASE_URL`, sitemap-index structure, apex-only hostnames sitewide,
child-sitemap validity, zero duplicate URLs, all 9 Spanish URLs present
exactly once, structural regeneration determinism, and the existing
URL-indexation/broken-links gates).

## 14. Regression results

PASS: `validate-url-indexation.js` (535 pages, 487 sitemap URLs, 0
violations), `check-broken-links.js` (0 broken, 535 pages),
`validate-datasets.js` (16 datasets, 0 errors), `validate-entities.js` (104
entities, 0 errors), `validate-trust.js` (0 errors),
`validate-source-data-consistency.js` (0 errors),
`validate-chemistry-knowledge.js` (0 structural errors; 19 pre-existing
orphan-source/orphan-range warnings, unchanged, unrelated to sitemaps),
`audit-accessibility.js` (score 100), `validate-phase-8d.js`,
`validate-phase-8e.js` (2 pre-existing warnings), `validate-phase-8g.js`,
`test-phase-8g.js` (26/26).

FAIL (known, pre-existing, not caused by this phase): `validate-phase-8f.js`
— 2 errors, the same hardcoded `esPages === 5` / `esEntries.length === 5`
stale-baseline assertions already dispositioned at Phase 8G closeout. Not
modified per this phase's explicit instruction not to repair stale
prior-phase validators.

## 15. Determinism

No production source changed, so the 3-full-build gate was not triggered.
Per the fallback instruction, `scripts/generate-sitemaps.js` was run three
consecutive times directly against the unmodified committed source: all
three runs produced byte-identical `sitemap.xml` and all 8 child sitemaps.
No unexplained URL churn. Working tree restored to the exact committed
state afterward and confirmed clean via `git status --porcelain`.

## 16. Deferred items

- Legacy, build-unwired `scripts/generate-sitemap.js` (singular) — dead
  code, not touched, flagged for a possible future cleanup phase.
- `generate-sitemaps.js`'s stale-file-on-empty-category behavior — dormant,
  not currently manifesting, worth a defensive fix in a future indexing
  phase if desired.
- Manual GSC-UI child-sitemap discovery-count verification — outside this
  repository's visibility, deferred to the Director's own GSC access.

## 17. Final Director gate

PHASE 8H STATUS:
PASS
