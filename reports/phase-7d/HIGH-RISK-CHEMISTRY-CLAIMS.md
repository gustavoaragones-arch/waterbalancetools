# Phase 7D — High-Risk Chemistry Claims

Prioritizes claims where an incorrect or poorly-contextualized number carries real safety consequence: swimming safety, chlorine/shock concentration, hot-tub sanitation, chemical dosing, chemical mixing, pH safety, sanitizer interactions, chlorine/CYA relationships, temperature guidance. No wording is changed by this report -- every row is a recommendation for later review, not an edit.

## 1. CYA target discrepancy for saltwater pools (real, concrete finding)

| Page | Claim | Context | Source status | Risk | Recommended action |
|---|---|---|---|---|---|
| `academy/equipment/salt-systems.html` (sourced from `scripts/data/academy-equipment.js`) | "CYA of 60-80 ppm is needed for salt pool outdoor use to protect the generated chlorine from UV." | pool / saltwater chlorine generator / routine maintenance | `REQUIRES_REVIEW` (no primary source found) | **Medium** -- materially higher than the site's other outdoor-pool CYA guidance (30-50 ppm) with no confirmed chemical rationale for saltwater pools needing more | Have a chemistry-qualified reviewer confirm whether saltwater generation genuinely changes the CYA/UV-protection relationship, or whether this is simply an unverified figure that should be aligned with the general outdoor-pool range. See `CHEMISTRY-CONFLICT-POLICY.md` worked example. |

## 2. Chemical mixing / safety guidance (currently well-supported, low risk)

Sitewide "never mix chemicals" guidance (found on `reference/chemical-safety.html`, `reference/chemical-storage-guide.html`, `reference/chemical-compatibility.html`, and multiple `programmatic/chlorine/*` pages) is consistent with CDC (`cdc-pool-chemical-safety-toolkit`, `cdc-mmwr-pool-chemical-injuries`) and NPIC (`npic-pool-spa-chemicals-fact-sheet`) guidance researched in this phase. Classified `SUPPORTED`. **No urgent action** -- but see Section 4 (zero citations) below: this correct guidance is currently presented with no visible source, which is a trust/credibility risk even though the content itself is accurate.

## 3. Shock treatment / breakpoint chlorination dosing

| Page family | Claim pattern | Source status | Risk | Recommended action |
|---|---|---|---|---|
| `calculators/pool-shock-calculator.html`, `js/calc-utils.js` `calculateShock()` | Defaults to a 10 ppm target when no target is supplied; no combined-chlorine-based "10x" breakpoint logic is implemented | `REQUIRES_REVIEW` (industry rule of thumb, not CDC/MAHC-numeric) | **Medium** -- a user with high combined chlorine could under-dose relative to the commonly-cited 10x-combined-chlorine breakpoint guideline if they accept the calculator's un-adjusted default | Flagged as `CALCULATOR_REVIEW_REQUIRED` (Section 4 of the main report) -- not changed in this phase. A future phase should decide whether the calculator should accept a combined-chlorine input and apply the 10x heuristic, or continue as a simpler fixed-target tool with clearer labeling of that limitation. |
| `programmatic/shock/*` pages | Numeric shock dosing per gallon | `REQUIRES_REVIEW` | **Medium** | Reconcile against `range-shock-breakpoint-rule-of-thumb` in a future claim-by-claim pass; not attempted in this phase (3,933 claims, see coverage report). |

## 4. Zero external citations sitewide (systemic, umbrella risk)

Every high-risk claim above shares the same underlying issue Phase 7A already identified and this phase's own source audit reconfirmed: **0 of 413 major factual pages cite an external authoritative source.** This means even the claims classified `SUPPORTED` in this phase's research (e.g. CDC-backed pH/free-chlorine/bromine ranges) are currently presented to readers with no visible evidence trail. This is the single highest-leverage remediation opportunity identified by Phase 7D: adding real citations (via `scripts/chemistry/renderSources.js`, built but not yet wired into any page -- see the migration plan) would resolve the credibility gap for the ~32 claims already classified `SUPPORTED` without requiring new research.

## 5. Hot-tub-specific sanitation guidance

CDC guidance explicitly recommends *against* using cyanuric acid / stabilized chlorine in hot tubs (`range-cya-hottub`, `SUPPORTED`). This phase did not find any current site content asserting the opposite, but no dedicated check for this was run across all `hot_tub`/`spa` pages (out of scope for this phase's claim-by-claim budget). **Recommended for a targeted follow-up scan** before any hot-tub content is translated or expanded in a later phase.

## 6. Temperature-related guidance

`academy/fundamentals/how-temperature-changes-water-chemistry.html` makes claims about chlorine consumption changing with temperature (classified `CONTEXTUAL`/`SUPPORTED` where numeric and matched against the pool/hot-tub FC ranges). No primary source specifically quantifying the temperature-chlorine-demand relationship was researched in this phase; the qualitative direction (higher temperature -> faster chlorine consumption) is consistent with why CDC sets a higher hot-tub FC minimum, but the specific claim text was not independently verified. **Low-medium risk, recommend review** alongside Section 1.
