# AEO Differentiation

## Structure (unchanged, already correct)

Every page in all 4 families already follows H1 → direct answer (`.serp-direct` + snippet block) → contextual explanation → table/steps → source, visible in static HTML with no JavaScript/accordion/calculator-interaction required to extract the first answer. This phase did not need to introduce this structure — it already existed.

## What changed: answer content, not answer structure

Before this phase, the *first FAQ answer* (the most AEO-extractable element, paired with FAQPage schema) was a generic instruction ("It depends on... use the calculator") — structurally present but informationally empty, identical in substance across every page in a family. After this phase, the first FAQ answer contains the actual computed number for that specific page (e.g. "roughly 1.6-4.7 oz of liquid chlorine... or 3.9-11.7 oz of granular shock" for a specific volume) — a genuinely distinct, extractable answer entity per URL, not a duplicated answer entity across competing URLs.

## Verification

Spot-checked rendered output for 2 pages per family (smallest and largest parametric value) after rebuild — confirmed the direct-answer FAQ text differs with real, correctly-computed numbers matching each page's own volume/level, and confirmed no page's answer is byte-identical to its nearest neighbor's answer.

## Not changed

FAQPage schema itself, breadcrumb schema, WebApplication schema, and the HowTo step schema were not modified — existing schema policy remains authoritative, per the brief's explicit instruction not to add FAQPage schema automatically or introduce new schema types.
