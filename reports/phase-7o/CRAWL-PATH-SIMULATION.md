# Phase 7O — Crawl Path Simulation

Generated: 2026-08-23

Real breadth-first simulation of crawl discovery starting from `/`, following only actual `<a href>` links found in the production HTML (contextual navigation + in-content links), matching how a search engine crawler would traverse the site.

## Results

- Canonical indexable pages (per url-policy.js): **480**
- Discovered via contextual crawl from homepage: **477**
- Undiscovered canonical pages (no contextual path from homepage at all): **3**
- Sitemap URL count: 488
- all-pages.html URL count: 169
- Pages present in both sitemap and all-pages.html (multiple independent discovery paths): 168

## Depth distribution (BFS from homepage)

- Depth 0: 1 pages
- Depth 1: 30 pages
- Depth 2: 170 pages
- Depth 3: 287 pages
- Depth 4: 4 pages
- Depth 5: 2 pages

## Undiscovered canonical pages

- /printables/airbnb-pool-turnover-checklist
- /printables/hot-tub-maintenance-log
- /printables/pool-maintenance-checklist
