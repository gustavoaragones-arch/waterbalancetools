# Phase 7D — Source Selection Policy

## Preferred source hierarchy

1. **Government / public-health authorities** (`primary`) — CDC (Healthy Swimming, Model Aquatic Health Code, MMWR), EPA, CPSC. Preferred for any claim about safe sanitizer/pH ranges, chemical-mixing hazards, or public-health guidance.
2. **Recognized industry standards bodies** (`professional`) — ANSI-accredited standards developers, primarily the Pool & Hot Tub Alliance (PHTA), publisher of ANSI/APSP/ICC-11 (water quality in public pools and spas). Preferred for total alkalinity, calcium hardness, and similar water-balance parameters where CDC guidance is silent or less specific.
3. **University / extension programs** (`academic`) — e.g. NPIC (National Pesticide Information Center, Oregon State University Extension, EPA cooperative agreement). Used for chemical-safety and handling guidance.
4. **Manufacturer technical documentation** (`manufacturer`) — used *only* for equipment-specific claims (e.g. "Pentair-brand salt cells target X ppm"), never presented as a universal water-chemistry standard. A manufacturer claim must always be labeled with the specific brand/equipment it applies to.
5. **Peer-reviewed literature** — not used in this phase; no chemistry claim on the site required literature-level evidence beyond what CDC/PHTA/NPIC already cover. Reserved for a future phase if a claim requires it.
6. **Secondary sources** — used only to corroborate a primary/professional source, never as the sole basis for a numeric range. One secondary medical-institution source (Cleveland Clinic) is in the registry for this purpose and is not cited alone anywhere in the knowledge layer.

## Explicitly excluded

SEO blogs, affiliate sites, content farms, AI-generated pages, generic "pool maintenance" articles, forum/Reddit content. Several appeared in this phase's web search results (`poolchemtracker.com`, `sensorex.com`, `iopool.com`, `mavaquadoc.com`, etc.) and were deliberately not added to the source registry, even where their numbers happened to agree with a primary source -- agreement with a low-quality source is not evidence.

## Manufacturer-source use cases

Manufacturer guidance is appropriate only when: (a) the claim is genuinely equipment-specific (e.g. a salt-cell target range), and (b) the page/claim clearly states which manufacturer/equipment the number applies to. It is never used as a substitute for a general water-chemistry standard.

## When academic sources are appropriate

Used for safety/handling/toxicology-adjacent claims (chemical mixing hazards, chloramine health effects) where a university-extension or EPA-cooperative fact sheet exists and a CDC page does not cover the same specific point.

## How conflicting sources are handled

See `CHEMISTRY-CONFLICT-POLICY.md`. In summary: classify the context first (environment, sanitizer, scenario, equipment); only treat two values as a true conflict if the context is identical and no distinguishing factor explains the difference.

## How publication dates are treated

`publication_date` is recorded only when directly observed on the source (e.g. the MAHC 4th Edition's February 2023 cover date, or NPIC's January 2024 fact-sheet date). CDC's health-topic pages in this registry do not display a visible publication or last-reviewed date in the content actually retrieved; `publication_date` and `last_updated` are left `null` for those records rather than guessed. This is intentional and required by the Phase 7D brief ("Do not invent publication dates").

## How review dates are recorded

Every source and range record carries `accessed_date` (this phase's research date, 2026-08-18) and, where applicable, `reviewed_date`. No record is dated in the future or backdated.

## How unsupported claims are handled

A claim with no confirmed primary/professional source is marked `REQUIRES_REVIEW`, not `UNSUPPORTED` -- `UNSUPPORTED` is reserved for a claim actively contradicted by, or clearly inconsistent with, available evidence. A claim simply lacking a confirmed citation (the common case on this site, given 0/413 pages currently cite external sources) is a research gap, not a false claim, and the two are recorded differently on purpose.

## How contextual ranges are distinguished

Every range record carries explicit `environment`, `sanitizer`, `scenario`, and `temperature_context` fields (see `scripts/data/chemistry-ranges.js`). A claim is only compared against a range sharing the same context; pool-vs-hot-tub, chlorine-vs-bromine, and routine-vs-treatment differences are structurally distinguished before any "conflict" classification is attempted -- see `chemistry-consistency-matrix.csv` for the applied result.
