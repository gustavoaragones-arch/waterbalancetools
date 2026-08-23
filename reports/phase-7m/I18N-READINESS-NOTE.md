# Phase 7M — I18N Readiness Note

No Spanish or French content was implemented this phase. Phase 7M is not an internationalization phase. This note documents whether the seasonal/topical gaps identified this phase would benefit from eventual localization, for a future phase to consider.

## Seasonal content and localization

The site's seasonal-resilience content (temperature effects, indoor pool chemistry, hot tub cold-weather care, winterization/reopening) is written in hemisphere-neutral language already -- none of it assumes a Northern Hemisphere calendar. This is a genuine asset for future localization: a Spanish-language build serving Southern Hemisphere Spanish-speaking markets (e.g., Argentina, Chile) would need these exact same seasonal mechanics (temperature-driven chlorine demand, indoor pool chemistry, winterization) at a different calendar offset, not different content.

## Where localization would add the most value

- **Indoor pool chemistry** (new this phase): indoor pool ownership/operation is common in colder-climate Spanish- and French-speaking markets (e.g., Quebec, parts of Spain) where outdoor swim season is short. This content's hemisphere-neutral framing makes it a good localization candidate.
- **Hot tub / spa content**: the academy hot-tub cluster and programmatic hot-tub pages address year-round demand already; French-Canadian and European French markets have substantial spa ownership.
- **Temperature and evaporation guides**: both are climate-driven rather than season-driven, so they translate cleanly without calendar-specific rework.

## Where localization is lower priority

- Programmatic volume/dosage pages (chlorine, shock, pH, hot tub) rely on US customary units (gallons, ounces, pounds) throughout, including in the newly-added per-page unit conversions (quarts, pounds). A Spanish/French rollout would need a parallel metric-unit content strategy, not just translation -- this is a larger structural decision than string translation and is explicitly out of scope for a translation-readiness assessment.
- Legal/ownership/methodology pages carry jurisdiction-specific framing (US-oriented) that would need review before translation, not just conversion.

## No action taken

No translated strings, no language-switcher scaffolding, no hreflang tags, and no locale-specific routing were added or modified this phase, consistent with the explicit scope boundary.
