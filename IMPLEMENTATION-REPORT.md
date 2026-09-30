# Implementation Report: Domain Accuracy Audit Changes

## 1. Drywall Calculator Update
- **File Modified:** `src/calculators/drywall-calculator.ts`
- **Change:** Adjusted `COMPOUND_GAL_PER_SQFT` to `0.011` (based on standard Level 4 finish yielding approx 5-gallon bucket per 450-500 sq ft).
- **Result:** Formula correctly returns lower, realistic compound quantities. Tests were updated to reflect this domain assumption.

## 2. Concrete Column Calculator Constant
- **Files Checked:** `src/calculators/concrete-column-calculator.ts` (and `volume-engine.ts`)
- **Change:** The actual javascript formula implementation already correctly utilizes `Math.PI`. The referenced `3.14159` only existed in descriptive string examples in the FAQ section. A regression test confirmed the math matches `Math.PI`.

## 3. Rebar Model Consolidation
- **Files Modified:** `src/calculators/rebar-calculator.ts`, `src/calculators/concrete-slab-rebar-calculator.ts`, `src/calculators/rebar-data.ts` (created)
- **Change:** Extracted rebar configuration to `rebar-data.ts`. Added support for standard sizes (#3, #4, #5) and their metric equivalents (No. 10, No. 13, No. 16). Updated `pieces` output label to "Grid Bars / Lines" to clarify it represents grid geometry, not purchased stock length pieces.
- **Result:** Both calculators now share a single source of truth for rebar data and allow size configuration.

## 4. Material Density Inputs
- **Files Modified:** `src/calculators/gravel-calculator.ts`, `src/calculators/sand-calculator.ts`, `src/calculators/asphalt-calculator.ts`, `src/calculators/topsoil-calculator.ts`, `src/calculators/aggregate-calculator.ts`
- **Change:** Added a `density` input field enabling users to provide specific material densities while maintaining the existing defaults (e.g., 1.4 tons/yd³ for gravel).
- **Result:** Tonnage conversion formulas rely dynamically on the input density. All regression tests successfully passed.

## 5. Engineering Disclaimer
- **Files Modified:** `src/calculators/_types.ts` and 8 engineering-sensitive calculators (`deck-footing`, `retaining-wall`, `stair`, `rebar`, `concrete-slab-rebar`, `rafter`, `fence-post`, `post-hole`).
- **Change:** Added `disclaimer` property to `CalculatorConfig` with the uniform disclaimer text about engineering constraints.

## Verification
- **npm test:** 299 / 299 tests PASS
- **npx astro check:** 0 errors
- **npm run build:** PASS
