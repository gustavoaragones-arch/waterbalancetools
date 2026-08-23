# Phase 7A -- E-E-A-T / Trust Forensics

## Trust page inventory checked
- `about/index.html`: present, 228 words
- `legal/legal.html`: present, 427 words
- `legal/ownership.html`: present, 82 words
- `legal/index.html`: present, 246 words
- `methodology/index.html`: present, 54 words
- `editorial/index.html`: present, 129 words
- `editorial/review-process/index.html`: present, 286 words
- `editorial/correction-policy/index.html`: present, 262 words
- `editorial/editorial-policy/index.html`: present, 373 words
- `editorial/content-standards/index.html`: present, 271 words
- `editorial/update-policy/index.html`: present, 256 words
- `provenance/index.html`: present, 228 words

## Sitewide trust-signal presence (true if found on ANY trust page)
- explains_what_site_does: PRESENT
- names_operator_entity: PRESENT
- has_contact_method: PRESENT
- explains_calculator_assumptions: PRESENT
- states_limitations: PRESENT
- explains_review_process: PRESENT
- has_correction_mechanism: PRESENT
- named_author_or_reviewer: **MISSING**

## Missing sitewide signals
- named_author_or_reviewer

## Additional sitewide findings
- No page anywhere on the site (0 / 524) contains an author byline, "written by", or "reviewed by" credit (regex scan for author/byline/rel="author"/"reviewed by").
- 415 / 415 major factual pages cite zero external authoritative sources; sitewide, zero `<a href>` tags point to any non-waterbalancetools.com domain.
- The `.knowledge-sources` block (256 occurrences across the site) contains only a "Last reviewed: DATE" stamp, not an actual source citation -- its class name is misleading relative to its content.
- `data/trust/*.json` (confidence.json, methodology.json, references.json, etc.) exists as structured trust data but was not confirmed to be rendered as reader-visible content on every page that would need it; see reproduction commands to re-check.
