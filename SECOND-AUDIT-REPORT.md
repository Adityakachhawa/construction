# ConstructCalc Second-Pass Domain Accuracy Audit

## 1. Executive Summary
This second-pass audit investigated specific domain inconsistencies, precision issues, and UX wording flagged during the first audit. The focus was on determining authoritative accuracy (e.g., USG guidelines for drywall), evaluating cross-calculator consistency (especially within the concrete and rebar suites), and verifying whether the calculators accidentally imply engineering-grade structural design rather than simple material estimation.

## 2. Corrections to First AUDIT-REPORT.md
The initial audit flagged `0.053 gal/sqft` for drywall joint compound as a HIGH severity issue but did not trace the exact magnitude of the error. This second pass confirms that the value represents an extreme 5x overestimation compared to standard industry practices.

## 3. Findings by Category

### 1. Drywall Calculator (Joint Compound)
- **Current Implementation:** Uses a hardcoded `COMPOUND_GAL_PER_SQFT = 0.053` (5.3 gallons per 100 sq ft). The FAQ text explicitly defends this, stating a 432 sq ft room requires "23 gallons (roughly 4-5 five-gallon buckets)".
- **Authoritative Verification:** The USG (United States Gypsum) estimating guide states that a standard Level 4 finish (tape coat + 2/3 finish coats) requires approximately 5.5 gallons of compound per 500 sq ft of drywall (or ~0.011 gal/sq ft).
- **Issue:** The current multiplier overestimates mud by exactly 500%. Five buckets of mud for a 14-sheet room is absurd; one bucket is typically sufficient for 15-20 sheets.
- **Recommended Action (Formula Change):** Update the multiplier to ~0.011 (or make finish level configurable).
- **Recommended Action (Wording Change):** Update the FAQ to reflect the new, accurate metric.

### 2. Rebar Calculators Consistency & Semantics
- **Metric Inconsistency:**
  - `rebar-calculator.ts` uses `REBAR_KG_PER_M = 0.888`. This represents a "hard metric" assumption, specifically the weight of standard 12mm European/Canadian rebar.
  - `concrete-slab-rebar-calculator.ts` uses `REBAR_KG_PER_M = 0.994`. This represents a "soft metric" conversion (0.668 lbs/ft converted exactly to kg/m).
- **Recommended Action (Implementation Change):** Standardize the metric weight. The best approach is to make rebar size configurable (e.g., #3, #4, #5 / No. 10, No. 13, No. 16). If a single default is kept, they must match (0.994 is technically the exact equivalent of the Imperial #4 default).
- **Output Semantics ("Pieces"):** Both calculators output "pieces" using the logic `rowCount + colCount`. This incorrectly implies orderable stock lengths. A 40ft slab row requires two 20ft pieces spliced together, not one "piece". 
- **Recommended Action (Wording/Formula Change):** Rename the output from "Rebar Pieces" to "Grid Rows & Columns", OR update the formula to accept a "Stock Length" input (e.g., 20ft) to calculate actual orderable pieces with lap splice waste.

### 3. Concrete Cross-Calculator Consistency
- **Volume Math:** `concrete-slab-calculator`, `concrete-column-calculator`, `concrete-footing-calculator`, `concrete-driveway-calculator`, and `concrete-slab-rebar-calculator` consistently use the shared `volume-engine.ts` for geometric calculations.
- **Standalone Math:** `concrete-bags-calculator.ts` performs inline volume calculation rather than using `volume-engine.ts`. However, the mathematical operations and conversion factors (`/ 27` for yards, `* 0.0283168` for meters) perfectly match the engine.
- **Bag Yields:** All calculators referencing bags consistently use the Quikrete/Sakrete standard: 40lb=0.30, 50lb=0.375, 60lb=0.45, 80lb=0.60.
- **Status:** PASS. No formula changes needed here.

### 4. Engineering-Sensitive Calculators
- **Calculators Reviewed:** Deck Footing, Retaining Wall, Stair, Rebar, Fence Post, Roof Pitch, Rafter.
- **Issue:** These calculators provide geometric volume and material counts but do not check structural viability. For example, `stair-calculator.ts` calculates risers and treads but does not warn the user if the result violates the IRC (International Residential Code) max 7.75" riser height. `retaining-wall-calculator.ts` estimates blocks but does not account for geogrid, drainage stone behind the wall, or overturning forces.
- **Recommended Action (Wording Change Only):** Add explicit disclaimer banners to these calculators stating: *"This calculator provides material estimates based on basic geometry. It does not perform structural engineering checks and does not guarantee compliance with local building codes (e.g., IBC/IRC). Always consult an engineer or local inspector for structural design."*

### 5. Material Density Calculators
- **Calculators Reviewed:** Gravel (1.4), Sand (1.35), Aggregate (1.5), Asphalt (2.025), Topsoil (1.1).
- **Issue:** These values are reasonable averages (e.g., 1.4 tons/yd³ is standard for crushed #57 stone). However, densities vary wildly based on moisture content and specific mineralogy. Wet sand can weigh 1.6 tons/yd³, while dry sand is 1.2. 
- **Recommended Action (New Inputs):** These should not remain hidden fixed constants. The calculators should introduce a "Material Density" input field that defaults to the current values but allows users (especially contractors) to override it with specific quarry data.

### 6. Math Precision & Shared Constants
- **PI Approximation:** `concrete-column-calculator.ts` hardcodes `3.14` instead of using the native `Math.PI`.
  - **Recommended Action (Formula Change):** Replace `3.14` with `Math.PI`.
- **Conversion Constants:** Constants like `0.3048` (ft to m) and `0.453592` (lbs to kg) are duplicated across dozens of files. While mathematically consistent, this is a code-smell.
  - **Status:** Safe to remain unchanged for now, but a future refactor should centralize these into a `constants.ts` file.

### 7. Output Semantics
- In addition to the "Pieces" issue in the rebar calculators, the `drywall-calculator.ts` estimates "Sheets (with 10% waste)" by calculating total square footage, dividing by sheet size, and applying waste. It assumes small offcuts can be pieced together perfectly. While 10% is a standard estimating rule of thumb, the calculator does not simulate actual panel layout. 
- **Status:** Acceptable as an estimator, but wording should clarify it is a square-footage abstraction, not a layout plan.

## 4. Summary of Required Actions

**A. Issues requiring formula changes:**
- Change `3.14` to `Math.PI` in `concrete-column-calculator.ts`.
- Change `COMPOUND_GAL_PER_SQFT` in `drywall-calculator.ts` from 0.053 to ~0.011 to match USG guidelines.

**B. Issues requiring new inputs:**
- Make Rebar Size (#3, #4, #5) a selectable input in all rebar calculators to dynamically adjust the weight multiplier (and resolve the 0.888 vs 0.994 metric inconsistency).
- Make Material Density an exposed, editable input field in the Gravel, Sand, Aggregate, Asphalt, and Topsoil calculators.

**C. Issues requiring wording changes only:**
- Fix the `drywall-calculator` FAQ text that defends the 23-gallon mud estimation.
- Rename "Pieces" to "Grid Rows & Columns" in rebar calculators, or clarify the definition in the UI.
- Add structural/code-compliance disclaimers to Stair, Retaining Wall, Deck Footing, and Rafter calculators.

**D. Issues that should remain unchanged:**
- Shared volumetric math (`volume-engine.ts`).
- Concrete bag yields (0.45, 0.60).
- Standard dimensional unit conversions.
