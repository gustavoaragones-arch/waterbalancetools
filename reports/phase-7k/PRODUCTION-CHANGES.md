# Phase 7K — Production Content Changes

## Summary

**One production change this phase**, directly required by newly-verified evidence, per Step 18. No entity page content was modified (unlike Phase 7I/7J, no entity claim resolved this phase required an on-page correction — the resolutions changed internal provenance-registry status, not published wording).

## `scripts/generators/generate-shock-pages.js` + its 6 output pages (`programmatic/shock/how-much-shock-for-{5000,10000,15000,20000,25000,30000}-gallon-pool.html`)

**Before:** The generator's "double dose" tier was hardcoded to 20 ppm and labeled as covering both "heavy algae" and "contamination" — a conflation of two distinct scenarios into one unsourced number.

**After:** Newly-verified evidence this phase (`range-shock-algae-recovery-green`, 30 ppm, Pool & Spa News/Taylor Technologies) shows the correct green-algae figure is 30 ppm, not 20 ppm, and that algae recovery and contamination response are not interchangeable with a single "double" figure. The generator's second dosage tier was relabeled "Green algae recovery (30 ppm)" with the math updated accordingly (`shockOz(gallons, 30)` in place of `shockOz(gallons, 20)`), and surrounding copy (FAQ answers, HowTo steps, "what this means" text) updated for internal consistency so the page no longer contradicts itself between the table and the prose. The "contamination" framing was dropped entirely rather than left attached to the wrong number — the site does not currently have residential-appropriate sourced guidance for a general "contamination" scenario, so no replacement claim was invented for it.

**Verification after the change:**
- `npm run build` — full site regenerated clean, all validators pass (see `PHASE-7K-STATUS.md`).
- `npm run audit:forensic` — 0 duplicate-title groups, 0 duplicate-description groups (same as baseline); schema/page counts match baseline exactly once a self-inflicted snapshot artifact was removed (see below).
- Two-build reproducibility check: the shock pages are byte-identical across two consecutive full builds.

## Self-caught issue during this phase's own audit work (not a production bug)

While preparing this phase's snapshot-then-restore forensic re-audit, an early snapshot copy at `reports/phase-7k/current-state-snapshot/` briefly included a copy of the forensic dashboard's `index.html`. Because the forensic crawler only excludes `reports/phase-7a/` by path, this stray file was picked up as a 523rd "real page" (one more than the 522-page baseline), inflating the MISSING-schema count by one and adding a phantom URL to the inventory. This was caught by diffing the fresh audit against the Phase 7K baseline's own recorded page count, the file was deleted, and the audit was re-run clean (522 pages, schema 950/39/3, matching baseline exactly). It never touched any file under `programmatic/`, `entities/`, or any other live site directory, and was never committed. Recorded here for a complete, honest audit trail, not because it affected production.
