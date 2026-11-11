# Release decision — targeted closure, 2026-11-10

**READY WITH DOCUMENTED LIMITATIONS.** No confirmed blocker remains in the previously identified issue set after this pass. This supersedes earlier NOT READY recommendations; it is a scoped deployment recommendation, not whole-site certification or authorization to deploy.

## Blockers corrected in this pass

- Mortar/grout outputs said “order this many” despite unverified presets. Result labels now say “Illustrative Bag Estimate,” copied/checklist output inherits that label, and descriptions/disclaimers explain the required product verification. Mortar interpretation no longer gives an unconditional order instruction. Numerical behavior is unchanged.
- Block variant notes retained fixed bar schedules, a fire-rating claim, fixed grout quantities and a missed “12 mortar bags” statement. Replaced these with dimension-specific area information and explicit approved-detail requirements. Existing count formulas, routes and metadata remain intact.
- Removed unsupported mortar-type/mix prescriptions, methodology claims that references certified all calculations, and deck-form wording implying excavation support. Useful geometry and worked examples remain.

## Final classification of the open concerns

| Concern | Classification | Reason |
|---|---|---|
| Mortar preset consumption and unit counts | DOCUMENTED LIMITATION | Clearly illustrative, with Custom joint factor available. Factors remain 0.025/0.033/0.012/0.016/0.060 ft3/ft2; unit counts remain 6.75/6.55/1.125/1.10/4 per ft2. Custom joint factor does not customize the separate unit-count assumption; now disclosed. |
| Mortar bag yields 0.45/0.60 ft3 for 60/80 lb | DOCUMENTED LIMITATION | Unverified presets are labeled; result is not a purchase instruction. Existing Custom yield accepts selected-product data. |
| Tile-grout yields 0.18/0.45/0.90 ft3 for 10/25/50 lb | DOCUMENTED LIMITATION | Same explicit illustrative labeling and Custom-yield route; no product accuracy claimed. |
| Grout small-joint approximation | DOCUMENTED LIMITATION | Geometry correction remains intact; approximation is disclosed. Wide joints/small tiles require product coverage checks. |
| Mortar/grout waste defaults and indicative prices | DOCUMENTED LIMITATION | Estimating allowances, not specifications or price quotes; users must verify actual waste and supplier price. |
| Concrete-block product coverage | DOCUMENTED LIMITATION | Earlier implementation withholds bags until product data is supplied. No 33/35/38/26 universal coverage remains active. User-supplied coverage is not independently authenticated. |
| Block core fill, weights, 40% fill and reinforcement examples | DOCUMENTED LIMITATION | Explicit hypothetical quantities, distinct from mortar/tile grout and approved reinforcement design. Removed contradictory prescriptions from notes. |
| Stud end/opening/corner and nominal-module conventions | DOCUMENTED LIMITATION | Existing layout caveats explain that counts are estimates rather than a placement plan. |
| Rebar stock division, cover, cutting and laps | DOCUMENTED LIMITATION | Prior corrections identify length-only lower bounds and require the approved schedule; do not claim complete purchasing or design coverage. |
| Footing/deck dimensions, frost/soil assumptions and full-grid layout | DOCUMENTED LIMITATION | Existing approved-plan requirements distinguish material geometry from structural sizing. Previously flagged prescriptive claims have been revised. |
| Preset-free material workflow or editable unit-count factor | FUTURE IMPROVEMENT | Would improve product matching, but is not necessary to release clearly disclosed estimates. Requires approval before changing defaults or numerical behavior. |
| Broader device, accessibility and regression coverage | FUTURE IMPROVEMENT | Additional assurance; absence of a full rerun is not evidence of a defect. Known scope gaps remain below. |

**Confirmed unresolved BLOCKER: none within this reviewed scope.** No manufacturer values were invented. No new product input is necessary for this release: existing custom inputs plus explicit assumptions suffice. If exact purchasing quantities are later required, the minimum proposal is to require explicit custom factor/yield confirmation (and an editable mortar unit-count factor); that numerical/interaction change has not been implemented and would require approval.

## Evidence and limits

Fresh: 6 selected imperial/metric mortar, grout and deck examples plus 2 mortar worked-example tests passed; 7 edited-route browser checks passed, including copied mortar/grout labels and three block variants. Zero page errors. No failed targeted tests in this pass. Source comparison confirms mortar/grout numeric constants and formula bodies unchanged, block numerical data unchanged, and mortar/grout SEO unchanged. `git diff --check` passed. Logs: `audit/release-blockers-*.log`.

Historical full-suite/build/SEO evidence remains historical. Not rerun: full suite, all 37 calculators, all 54 variants, production build, whole-site SEO, real devices or assistive technology. Only the mortar interpretation branch of the shared registry changed; other branches were not freshly tested. This decision does not certify engineering suitability or every sentence elsewhere on the site.

## Exact files changed in this pass

- src/calculators/mortar-calculator.ts
- src/calculators/grout-calculator.ts
- src/calculators/deck-footing-calculator.ts
- src/calculators/interpret-registry.ts
- src/data/block-wall-dimensions.ts
- src/pages/methodology/masonry.astro
- scripts/release-blockers-check.mjs (new targeted browser checks)
- audit/RELEASE-DECISION.md (this report)

No deployment, commit, push, page deletion or unrelated formula change. Targeted testing only; full regression validation was not performed.
