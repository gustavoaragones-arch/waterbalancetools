# Trust Language Audit

Sitewide scan (550 HTML files) for author/reviewer/reviewed/updated/methodology/sources/citations/ownership/contact/expert/scientific/verified language and specifically the dangerous phrase list from the brief.

## Dangerous phrases (expert reviewed, scientifically proven/verified, doctor approved, professional approved, certified by, CDC/PHTA approved, official source)

**0 occurrences sitewide**, confirmed both by manual grep and by `scripts/validate-trust-layer.js`. No fabricated authority claims exist on the site prior to or as a result of this phase.

## "certified" (484 occurrences)

Sampled and classified: **SUPPORTED**. Entirely benign usage — the "Production Certified" internal build/QA badge (an infrastructure status, not a health/scientific claim) and recommendations that users "consult a certified pool operator" (referring to real, external, third-party certification — not claiming WaterBalanceTools itself holds any certification). No occurrence claims the site or its content is itself certified by any authority.

## "industry standard" (7 occurrences)

Sampled and classified: **SUPPORTED**, with one caveat already addressed. Most usages (pump turnover rate, confidence-system documentation) describe genuinely well-established, uncontroversial figures. One usage — the About page's former claim that "All chemical dosing calculations are based on published industry standards" — was **POTENTIALLY_MISLEADING** given Phase 7E's finding that several dosing coefficients have no confirmed industry-standard source. **Corrected this phase** (see Editorial Identity report).

## Trust Panel confidence claims (calculator pages)

**POTENTIALLY_MISLEADING, found and corrected this phase.** 8 of 11 formula/calculator trust-panel records claimed `confidenceLevel: 'high'` / `sourceCategory: 'industry-standards'` (or `manufacturer-documentation` for salt) — language the site's own Trust Panel renders as "✓ High confidence... derived from well-established industry practice... strong practitioner consensus." Phase 7E's independent calculator audit (`reports/phase-7e/CALCULATOR-PROVENANCE.md`) found these same dosing coefficients were never independently verified against any such source. Corrected to `confidenceLevel: 'limited'` / `sourceCategory: 'internal-dataset'` for: chlorine dose, shock dose, alkalinity adjustment, salt adjustment, CYA adjustment, calcium hardness dose (both the formula-level record in `trust-formulas.js` and the calculator-level record in `trust-calculator-metadata.js`). Left unchanged (already appropriately hedged or independently verifiable): pH adjustment (`moderate`, already self-disclosed as a simplified linear approximation), pool volume / turnover / LSI (`very-high`, pure geometry/chemistry equations, not dependent on an external claim source).

## Editorial Policy "Evidence Standard" claim

**POTENTIALLY_MISLEADING, found and corrected this phase.** The Editorial Policy page stated "Claims without a traceable source are not published" — directly contradicted by Phase 7E's provenance work, which found 4,686 of 5,861 extracted chemistry evidence records have never been individually checked against a source. Corrected to accurately describe this as an active, ongoing goal rather than a completed guarantee (see `EDITORIAL-IDENTITY.md`).

## Organization schema logo

**Technical defect, found and corrected this phase.** `index.html` and `components/global-schema.html` declared `"logo": "https://waterbalancetools.com/logo.png"` — this file does not exist (the real, live logo is `/public/logo.svg`). Corrected in both files.

## Author / reviewer bylines

**0 occurrences of any author or reviewer name, fake or real, anywhere on the site.** No Person schema exists. No "Reviewed by [name]" text exists. This is disclosed as the current, honest state in `EDITORIAL-IDENTITY.md` rather than papered over with an invented editorial team identity.

## Summary

| Classification | Count | Examples |
|---|---:|---|
| SUPPORTED | 2 categories audited (certified, industry standard) | Benign, accurate usage |
| POTENTIALLY_MISLEADING → corrected | 3 findings | Trust Panel confidence (8 records), Editorial Policy evidence standard, About page methodology claim |
| Technical defect → corrected | 1 finding | Organization schema logo URL |
| MISSING | 1 (by design, not a defect) | No author/reviewer attribution system populated — correctly left empty rather than fabricated |
