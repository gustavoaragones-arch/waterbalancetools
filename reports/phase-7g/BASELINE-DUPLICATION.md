# Baseline Duplication (Before Remediation)

Captured by re-running the existing Phase 7A forensic duplication audit (`npm run audit:forensic`, `scripts/audit-forensic/lib/duplication.js`) before any changes this phase — not replaced with a new methodology.

| Family | Pages | Risk | Avg. pairwise similarity | High-similarity pairs | Repeated paragraph blocks | Repeated headings | Repeated FAQs | Repeated tables |
|---|---:|---|---:|---:|---:|---:|---:|---:|
| programmatic/hot-tubs | 6 | **CRITICAL** | 0.795 | 10 | 33 | 19 | 4 | 0 |
| programmatic/shock | 7 | **CRITICAL** | 0.784 | 15 | 29 | 19 | 4 | 0 |
| programmatic/chlorine | 12 | HIGH | 0.740 | 55 | 34 | 19 | 4 | 0 |
| programmatic/ph | 5 | HIGH | 0.712 | 6 | 30 | 19 | 4 | 1 |

Confirmed identical to the original Phase 7A figures the brief cites (0.71-0.80) — the site has not drifted since that audit; the duplication is real and current, not stale.

## Root cause, confirmed by reading generator source

Each `buildPage()` function (`scripts/generators/generate-{chlorine,shock,ph,hot-tub}-pages.js`) produced byte-identical content arrays for `whatThisMeansSection`, `whatHappensIfIncorrectSection`, and `quickTipsSection` across every page in a family, and 4 of 5 FAQ answers were also identical verbatim. Only the H1, meta description, and the computed dosage table genuinely varied per page before this phase.
