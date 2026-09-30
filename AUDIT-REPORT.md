# ConstructCalc 37-Calculator Domain Accuracy Audit

## 1. Executive Summary
This audit reviewed the domain accuracy, mathematical formulas, and internal consistency of all 37 calculators in the ConstructCalc project. The audit distinguished between mathematical correctness (e.g., unit conversions) and construction-domain assumptions (e.g., material density, yield rates). While the mathematical foundations are generally solid, several calculators rely on hardcoded material assumptions that reduce their utility or risk overestimating materials. 

## 2. All 37 Calculators Reviewed
Total Calculators Audited: 37

The complete set of calculators includes: Aggregate, Asphalt, Board Foot, Concrete Bags, Concrete Block, Concrete Column, Concrete Driveway, Concrete Footing, Concrete Slab + Rebar, Concrete Slab, Deck Footing, Drywall, Excavation, Fence Post, Flooring, French Drain, Gravel, Grout, Insulation, Lumber, Metal Roofing, Mortar, Mulch, Paver Base, Plywood, Post Hole, Rafter, Rebar, Retaining Wall, Roof Pitch, Roofing, Sand, Siding, Square Footage, Stair, Stud, Topsoil.

## 3. Calculator-by-Calculator Findings

### Concrete Column Calculator
- **Severity:** MEDIUM
- **Category:** Math
- **Current:** Uses `3.14` hardcoded for Pi in volume calculation.
- **Expected:** Use `Math.PI` for engineering-grade precision.
- **Evidence:** JavaScript math standard and basic geometry.
- **Why it matters:** Rounding Pi to 3.14 introduces a small but unnecessary cumulative error in large column volume calculations.
- **Recommendation:** Replace `3.14` with `Math.PI`.
- **Configurable?:** NO

### Drywall Calculator
- **Severity:** HIGH
- **Category:** Domain Assumption
- **Current:** Uses a hardcoded `COMPOUND_GAL_PER_SQFT = 0.053` (i.e., 5.3 gallons per 100 sq ft).
- **Expected:** Standard estimating is ~5 gallons per 500 sq ft (~0.01 gal/sqft) for standard taping (Level 4). 0.05 is typically reserved for Level 5 finishes (full skim coat).
- **Evidence:** USG (United States Gypsum) Handbook.
- **Why it matters:** This assumption will overestimate joint compound requirements by up to 5x for standard finishing jobs.
- **Recommendation:** Update the default to a more typical Level 4 finish rate or make the finish level a user-selectable option.
- **Configurable?:** YES

### Rebar & Concrete Slab + Rebar Calculators
- **Severity:** MEDIUM
- **Category:** Domain Assumption
- **Current:** Hardcodes `REBAR_LBS_PER_FT = 0.668`.
- **Expected:** This is the specific weight for #4 (1/2") rebar.
- **Evidence:** CRSI (Concrete Reinforcing Steel Institute) tables.
- **Why it matters:** Users calculating for #3 (3/8", 0.376 lbs/ft) or #5 (5/8", 1.043 lbs/ft) rebar will receive entirely inaccurate weight estimates.
- **Recommendation:** Introduce a rebar size selection input, defaulting to #4.
- **Configurable?:** YES

### Gravel, Sand, Asphalt, Topsoil Calculators
- **Severity:** LOW
- **Category:** Domain Assumption
- **Current:** These calculators use fixed density constants (e.g., Gravel = 1.4 tons/yd³, Sand = 1.35 tons/yd³, Asphalt = 2.025 tons/yd³).
- **Expected:** Density varies heavily by moisture content, compaction, and specific material type (e.g., pea gravel vs. crushed limestone).
- **Evidence:** Standard aggregate charts (e.g., Vulcan Materials).
- **Why it matters:** Fixed densities provide a false sense of precision. A 1.4 multiplier might be accurate for clean crushed stone but wrong for river rock. 
- **Recommendation:** Keep as reasonable defaults, but add prominent disclaimer text or an "Advanced" toggle to override the density multiplier.
- **Configurable?:** YES

## 4. Shared Calculation Engine Findings
The `volume-engine.ts` correctly handles core geometry (cylinders, rectangles) and provides consistent baseline math for standard shapes. The shared rounding utility (`Math.round`) is used defensively.

## 5. Cross-Calculator Consistency Findings
Cross-calculator consistency is generally excellent. The project correctly isolates specific material assumptions to their respective calculators while relying on the shared volume math.
- **Concrete Bags vs. Footing/Slab:** Concrete calculators consistently assume 0.45 cu ft yield for 60lb bags and 0.60 cu ft for 80lb bags, which perfectly matches Quikrete/Sakrete manufacturer specs.
- **Roofing vs. Metal Roofing:** Both correctly isolate waste calculations, with Roofing utilizing standard 3-bundles-per-square math.

## 6. Material Density/Yield/Coverage Findings
- **Concrete Blocks:** `BLOCKS_PER_SQFT = 1.125` is accurate for standard 8x8x16 blocks with 3/8" mortar joints.
- **Stud Calculator:** Uses 4 corner studs hardcoded. This is acceptable as a baseline estimating metric.

## 7. Validation and Edge Cases
- **Negative/Zero inputs:** Many calculators process formulas without explicit early exits for inputs `< 0` in the backend formulas, relying strictly on frontend validation to prevent negative values.
- **Divide by Zero:** Calculators using spacing inputs (e.g., Rebar, Deck Footings) safely implement `Math.max(spacing, 0.01)` to prevent `Infinity` or `NaN` crashes when spacing is set to 0.

## 8. Documentation / FAQ / Formula Mismatches
The UX wording in some calculators (like Rebar or Joint Compound) may overstate accuracy by not clarifying the assumptions being made (e.g., assuming #4 rebar, or Level 5 drywall finish).

## 9. Critical Issues
No mathematically broken formulas or critical crashes were discovered. The issues are strictly confined to domain-level assumptions.

## 10. Recommended Fixes
1. Replace `3.14` with `Math.PI` in `concrete-column-calculator.ts`.
2. Refactor the `drywall-calculator.ts` joint compound multiplier to better reflect typical Level 4 finishing (or add a dropdown).
3. Add a "Rebar Size" parameter to `rebar-calculator.ts` and `concrete-slab-rebar-calculator.ts` to support #3 and #5 rebar instead of only hardcoding #4.

## 11. Items That Should NOT Be Changed
- The basic geometric formulas in `volume-engine.ts`.
- The concrete bag yields (0.45 / 0.60).
- The concrete block metrics (1.125 blocks/sqft).
- The global Constraint Validation API framework (which successfully traps the negative inputs before they reach the backend).

## 12. Sources
1. **USG (United States Gypsum) Handbook:** Joint compound coverage rates.
2. **CRSI (Concrete Reinforcing Steel Institute):** Standard rebar weights per linear foot.
3. **Quikrete Technical Data:** Bagged concrete yields.

---

### Compact Findings Table

| # | Calculator | Math | Units | Domain Assumptions | Validation | Documentation | Status |
|---|------------|------|-------|--------------------|------------|---------------|--------|
| 1 | Aggregate Calculator | PASS | PASS | REVIEW | PASS | PASS | PASS |
| 2 | Asphalt Calculator | PASS | PASS | REVIEW | PASS | PASS | PASS |
| 3 | Board Foot Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 4 | Concrete Bags Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 5 | Concrete Block Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 6 | Concrete Column Calculator | REVIEW | PASS | PASS | PASS | PASS | NEEDS FIX |
| 7 | Concrete Driveway Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 8 | Concrete Footing Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 9 | Concrete Slab + Rebar Calculator | PASS | PASS | REVIEW | PASS | REVIEW | NEEDS FIX |
| 10 | Concrete Slab Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 11 | Deck Footing Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 12 | Drywall Calculator | PASS | PASS | REVIEW | PASS | REVIEW | NEEDS FIX |
| 13 | Excavation Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 14 | Fence Post Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 15 | Flooring Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 16 | French Drain Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 17 | Gravel Calculator | PASS | PASS | REVIEW | PASS | REVIEW | PASS |
| 18 | Grout Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 19 | Insulation Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 20 | Lumber Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 21 | Metal Roofing Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 22 | Mortar Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 23 | Mulch Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 24 | Paver Base Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 25 | Plywood Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 26 | Post Hole Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 27 | Rafter Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 28 | Rebar Calculator | PASS | PASS | REVIEW | PASS | REVIEW | NEEDS FIX |
| 29 | Retaining Wall Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 30 | Roof Pitch Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 31 | Roofing Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 32 | Sand Calculator | PASS | PASS | REVIEW | PASS | REVIEW | PASS |
| 33 | Siding Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 34 | Square Footage Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 35 | Stair Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 36 | Stud Calculator | PASS | PASS | PASS | PASS | PASS | PASS |
| 37 | Topsoil Calculator | PASS | PASS | REVIEW | PASS | PASS | PASS |
