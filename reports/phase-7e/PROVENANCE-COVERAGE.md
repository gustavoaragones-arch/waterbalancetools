# Provenance Coverage

**This report intentionally does not compute one blended "% covered" figure.** A single percentage would imply uniform factual coverage across a dataset where the vast majority of records (4439 of 5861) were never extracted as evaluable chemistry claims in the first place (navigation text, examples, non-numeric editorial content -- see Phase 7D.3). Each number below is reported separately, on its own honest denominator.

## Claim-level coverage

| Metric | Count | % of evaluated (1422) |
|---|---:|---:|
| Total extracted evidence records | 5861 | — |
| Scientifically evaluated (CORRECT_EXTRACTION/CARRIED_CONTEXT) | 1422 | 100% (denominator) |
| Direct provenance (matches a SUPPORTED canonical range) | 575 | 40.4% |
| Contextual provenance (matches a CONTEXTUAL canonical range) | 0 | 0.0% |
| Corroborating provenance | 0 | 0% (no records reached this tier this phase -- see below) |
| Conflicting with the canonical range | 499 | 35.1% |
| Requires expert review (no confirmed source yet) | 101 | 7.1% |
| Still unreviewed (never individually assessed) | 4686 | 329.5% |

CONTEXTUAL is 0 in the mechanical pass for a specific, disclosed reason: several parameters (e.g. total_alkalinity) have both a broad SUPPORTED range and a narrower CONTEXTUAL range covering an overlapping band of values; the mechanical classifier checks candidates in `chemistry-ranges.js`'s declared order and returns on the first overlap, so the broader SUPPORTED range is matched first for any value both ranges would accept. This does not mean no CONTEXTUAL support exists -- the Pool Alkalinity Levels Chart's production citation (see AUTHORITY-CHART-PROVENANCE.md) was deliberately, individually mapped to the CONTEXTUAL range (`range-ta-residential-practical`, 80-120 ppm) because that is the specific figure that chart states, not the broader 60-180 figure. CORROBORATING (a second, independent source agreeing with an already-DIRECT claim) is 0 because no claim family in `chemistry-claims.js` currently has more than one independently-confirmed primary source backing the same range -- every SUPPORTED range so far rests on a single source, a real limitation of the current 9-source registry, not a scoring artifact.

## Page-level coverage (production pages with at least one cited evidence record)

| Tier | Total pages with any evidence | Pages with provenance rendered or established |
|---|---:|---:|
| Tier 1 (calculators, authority charts) | 27 | 15 |
| Tier 2 (guides) | 48 | 33 |
| Tier 3 (programmatic) | 44 | 37 |

Production rendering (visible HTML citation blocks) was implemented for exactly **4** pages this phase (2 calculators, 2 authority charts) -- deliberately narrow, per the brief's explicit instruction not to mass-inject. "Pages with provenance established" above (data-level, via `provenance-mapping.csv`) is larger than "pages with a rendered block," which is intentional: establishing which claims *could* be cited is prerequisite research; only a reviewed subset was actually put into production HTML this phase.

## Source quality distribution

| Authority level | Count |
|---|---:|
| Primary government | 5 |
| Professional standards body | 2 |
| Academic | 1 |
| Manufacturer | 0 |
| Secondary | 1 |
| **Total sources in registry** | **9** |

7 of 9 sources are primary-government or professional-standards bodies (CDC, MAHC, ANSI/PHTA). The objective was maximum appropriate authority, not maximum citation count -- this phase added zero new sources to the registry (all citations reuse Phase 7D's existing, real, previously-researched sources), and expanded coverage by mapping existing sources to more claims, not by adding lower-quality ones.
