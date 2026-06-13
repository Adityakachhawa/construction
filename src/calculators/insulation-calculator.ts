import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const lengthFt = Number(inputs.length_ft ?? 0) + Number(inputs.length_in ?? 0) / 12;
    const widthFt  = Number(inputs.width_ft  ?? 0) + Number(inputs.width_in  ?? 0) / 12;
    const coverage = Number(inputs.coverage_sqft ?? 40);
    const wastePct = Number(inputs.waste_pct ?? 10) / 100;

    if (lengthFt <= 0 || widthFt <= 0 || coverage <= 0) {
      return { area_sqft: 0, area_sqm: 0, adjusted_area_sqft: 0, net_rolls: 0, rolls_required: 0, estimated_coverage_sqft: 0 };
    }

    const area_sqft           = Math.round(lengthFt * widthFt * 100) / 100;
    const area_sqm            = Math.round(area_sqft * 0.092903 * 100) / 100;
    const adjusted_area_sqft  = Math.round(area_sqft * (1 + wastePct) * 100) / 100;
    const net_rolls           = Math.ceil(area_sqft / coverage);
    const rolls_required      = Math.ceil(adjusted_area_sqft / coverage);
    const estimated_coverage_sqft = Math.round(rolls_required * coverage * 10) / 10;

    return { area_sqft, area_sqm, adjusted_area_sqft, net_rolls, rolls_required, estimated_coverage_sqft };
  } else {
    const length_m = Number(inputs.length_m ?? 0);
    const width_m  = Number(inputs.width_m  ?? 0);
    const coverage = Number(inputs.coverage_sqm ?? 3.7);
    const wastePct = Number(inputs.waste_pct ?? 10) / 100;

    if (length_m <= 0 || width_m <= 0 || coverage <= 0) {
      return { area_sqft: 0, area_sqm: 0, adjusted_area_sqft: 0, net_rolls: 0, rolls_required: 0, estimated_coverage_sqft: 0 };
    }

    const area_sqm            = Math.round(length_m * width_m * 100) / 100;
    const area_sqft           = Math.round(area_sqm * 10.7639 * 100) / 100;
    const adjusted_area_sqm   = area_sqm * (1 + wastePct);
    const net_rolls           = Math.ceil(area_sqm / coverage);
    const rolls_required      = Math.ceil(adjusted_area_sqm / coverage);
    const estimated_coverage_sqm = rolls_required * coverage;

    return {
      area_sqft: Math.round(area_sqft * 100) / 100,
      area_sqm:  Math.round(area_sqm  * 100) / 100,
      adjusted_area_sqft: Math.round(adjusted_area_sqm * 10.7639 * 100) / 100,
      net_rolls,
      rolls_required,
      estimated_coverage_sqft: Math.round(estimated_coverage_sqm * 10.7639 * 10) / 10,
    };
  }
}

export const insulationCalculator: CalculatorConfig = {
  slug: 'insulation-calculator',
  name: 'Insulation Calculator',
  category: 'framing',
  description:
    'Calculate insulation rolls or batts required for walls, ceilings, attics, and floors. Enter area dimensions, coverage per roll, and waste percentage to get the exact quantity to order.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'length_ft',
      label: 'Length',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 1000,
      step: 1,
      defaultValue: 20,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Length of the area to insulate (e.g. wall run or room length).',
    },
    {
      id: 'length_in',
      label: 'Length (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'length_ft',
    },
    {
      id: 'width_ft',
      label: 'Width',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 500,
      step: 1,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Width of area. For walls, enter the wall height (typically 8–10 ft).',
    },
    {
      id: 'width_in',
      label: 'Width (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'width_ft',
    },
    {
      id: 'coverage_sqft',
      label: 'Coverage per Roll',
      type: 'number',
      unit: 'ft²/roll',
      min: 10,
      max: 1000,
      step: 1,
      defaultValue: 40,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Coverage per roll or batt from the product label. Common: 40–48 ft² per roll for R-13 batts.',
    },
    {
      id: 'waste_pct',
      label: 'Waste Factor',
      type: 'number',
      unit: '%',
      min: 0,
      max: 30,
      step: 5,
      defaultValue: 10,
      onlyIn: 'imperial',
      helpText: 'Add 10% for cuts around outlets, windows, and doors.',
    },
    {
      id: 'r_value',
      label: 'R-Value',
      type: 'number',
      unit: '(optional)',
      min: 0,
      max: 60,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      helpText: 'Optional. Enter the R-value of the insulation for reference (e.g. R-13 for 2×4 walls, R-19 for 2×6).',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Length',
      type: 'number',
      unit: 'm',
      min: 0.5,
      max: 300,
      step: 0.1,
      defaultValue: 6,
      defaultValueMetric: 6,
      required: true,
      onlyIn: 'metric',
      helpText: 'Length of the area to insulate.',
    },
    {
      id: 'width_m',
      label: 'Width',
      type: 'number',
      unit: 'm',
      min: 0.5,
      max: 150,
      step: 0.1,
      defaultValue: 3,
      defaultValueMetric: 3,
      required: true,
      onlyIn: 'metric',
      helpText: 'Width of area. For walls, use wall height (typically 2.4–3.0 m).',
    },
    {
      id: 'coverage_sqm',
      label: 'Coverage per Roll',
      type: 'number',
      unit: 'm²/roll',
      min: 1,
      max: 100,
      step: 0.5,
      defaultValue: 3.7,
      defaultValueMetric: 3.7,
      required: true,
      onlyIn: 'metric',
      helpText: 'Coverage per roll or batt from the product label. Common: 3.5–4.5 m² per roll.',
    },
    {
      id: 'waste_pct',
      label: 'Waste Factor',
      type: 'number',
      unit: '%',
      min: 0,
      max: 30,
      step: 5,
      defaultValue: 10,
      onlyIn: 'metric',
      helpText: 'Add 10% for cuts around outlets, windows, and doors.',
    },
    {
      id: 'r_value',
      label: 'R-Value',
      type: 'number',
      unit: '(optional)',
      min: 0,
      max: 60,
      step: 1,
      defaultValue: 0,
      onlyIn: 'metric',
      helpText: 'Optional R-value for reference.',
    },
  ],
  outputs: [
    {
      id: 'area_sqft',
      label: 'Area',
      unit: 'ft²',
      format: 'area',
      primary: true,
      description: 'Total area to insulate',
    },
    {
      id: 'area_sqm',
      label: 'Area',
      unit: 'm²',
      format: 'area',
      description: 'Total area in square metres',
    },
    {
      id: 'adjusted_area_sqft',
      label: 'Adjusted Area',
      unit: 'ft²',
      format: 'area',
      description: 'Area including waste factor',
    },
    {
      id: 'net_rolls',
      label: 'Rolls/Batts (net)',
      unit: 'rolls',
      format: 'number',
      description: 'Exact coverage — no waste',
    },
    {
      id: 'rolls_required',
      label: 'Rolls/Batts Required',
      unit: 'rolls',
      format: 'number',
      description: 'With waste factor — order this many',
    },
    {
      id: 'estimated_coverage_sqft',
      label: 'Estimated Coverage',
      unit: 'ft²',
      format: 'area',
      description: 'Total coverage of rolls ordered',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'stud-calculator',
    'lumber-calculator',
    'plywood-calculator',
    'square-footage-calculator',
  ],
  seo: {
    title: 'Insulation Calculator – Batt & Roll Coverage Estimator',
    description:
      'Calculate insulation rolls, batts, area coverage, waste allowance, and material requirements for walls, attics, ceilings, and floors.',
    h1: 'Insulation Calculator',
    focusKeyword: 'insulation calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate insulation rolls or batts for any area',
      'Area in square feet and square metres',
      'Adjustable waste percentage for cuts and offcuts',
      'Net and waste-adjusted roll counts',
      'Works for walls, ceilings, attics, and floors',
      'Imperial and metric unit systems',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate the insulation area',
      formula: 'Area = Length × Width',
      description:
        'For walls, multiply the wall run (total linear feet) by the wall height. For attics and floors, multiply room length by room width. Deducting window and door openings is optional but adds accuracy — each standard door is roughly 20 ft² and each window 6–15 ft².',
    },
    {
      label: 'Apply waste factor',
      formula: 'Adjusted Area = Area × (1 + Waste %)',
      description:
        'A 10% waste allowance is standard for typical walls. Use 15% for attics with obstructions like cross-bracing, plumbing vents, and HVAC ducts. Offcuts around electrical outlets, pipes, and corner framing are unavoidable — the waste factor ensures you do not run short mid-project.',
    },
    {
      label: 'Find coverage per roll or batt',
      formula: 'See product label — common: R-13 batt ≈ 40–48 ft² | R-19 batt ≈ 48–65 ft²',
      description:
        'Always read the coverage from the product label rather than estimating. Coverage varies by brand, thickness, and width — a 15″ wide batt covers a different area than a 23″ wide batt even at the same R-value. Rolls cover more per unit than pre-cut batts and suit large unobstructed areas like attic floors.',
    },
    {
      label: 'Calculate rolls or batts required',
      formula: 'Rolls = ⌈Adjusted Area ÷ Coverage per Roll⌉',
      description:
        'Divide the adjusted area by the coverage per roll and always round up to the nearest whole number — you cannot buy a fraction of a roll or batt. Pre-cut batts are sized to fit standard stud bays (16″ or 24″ OC); rolls are cut to length on-site. Both are calculated the same way by area.',
    },
    {
      label: 'Understand R-value',
      formula: 'Higher R = more thermal resistance',
      description:
        'R-13 is standard for 2×4 walls (3.5″ cavity); R-19 or R-21 for 2×6 walls (5.5″ cavity). Attics in cold climates typically require R-38 to R-49. R-value is additive when layering — two layers of R-19 batt yield R-38. Check your local building code for minimum R-value requirements by climate zone.',
    },
  ],
  faq: [
    {
      question: 'How do I calculate how much insulation I need?',
      answer:
        'Measure the length and width of the area to insulate and multiply them to get the square footage. Add a 10% waste factor for cuts around outlets, windows, and doors. Divide the adjusted area by the coverage per roll or batt (shown on the product label) and round up to the nearest whole number. This calculator does all of that automatically.',
    },
    {
      question: 'What R-value do I need for walls?',
      answer:
        'R-13 is the standard for 2×4 exterior walls; R-19 or R-21 for 2×6 walls. The required R-value depends on your climate zone — colder climates require higher values. Check your local building code (IRC Table N1102.1.2 in the US) for the minimum R-value for your zone. Higher R-values reduce heating and cooling costs but cost more upfront.',
    },
    {
      question: 'What is the difference between batts and rolls?',
      answer:
        'Batts are pre-cut to standard lengths (typically 93″ or 105″) sized to fit between studs or joists at standard spacing. Rolls are the same material in continuous lengths that you cut to size on-site. Batts suit framed walls and ceilings with consistent stud spacing; rolls are more economical for attic floors with fewer obstructions. Both are calculated the same way by area coverage.',
    },
    {
      question: 'How much insulation do I need for a 1,000 ft² attic?',
      answer:
        'At R-38 using batts with 40 ft² coverage per roll: 1,000 ft² × 1.10 waste factor = 1,100 ft² adjusted ÷ 40 ft² per roll = 28 rolls (rounded up). For R-38 you may need two layers of R-19 — calculate each layer separately. Actual coverage varies by product; always check the label.',
    },
    {
      question: 'Should I add a waste factor for insulation?',
      answer:
        'Yes. A 10% waste factor is standard for typical walls and floors. Use 15% for attics with cross-bracing, plumbing stacks, and HVAC penetrations. Cuts around electrical boxes, corner framing, and window/door rough openings generate offcuts that cannot be reused. Skipping the waste factor often leaves you one or two rolls short at the end of the job.',
    },
    {
      question: 'What is the coverage per roll of R-13 insulation?',
      answer:
        'R-13 batt insulation in 15″ width typically covers 40–48 ft² per bag (usually 10 batts at 93″ length). In 23″ width it covers 65–75 ft². Continuous rolls cover more — an R-13 roll can cover 87–115 ft² depending on width. Coverage varies by brand and product line, so always read the label rather than relying on averages.',
    },
    {
      question: 'How do I insulate a 2×4 vs 2×6 wall?',
      answer:
        'A 2×4 wall has a 3.5″ stud cavity — R-13 or R-15 batts fit perfectly. A 2×6 wall has a 5.5″ cavity — use R-19 or R-21 batts. Using an R-13 batt in a 2×6 cavity leaves an air gap and reduces effective performance. You can add rigid foam board to the exterior to increase total wall R-value without changing framing.',
    },
    {
      question: 'Can I use this calculator for spray foam?',
      answer:
        'This calculator is designed for batt and roll insulation priced and measured by area coverage. Spray foam is sold by the board-foot (1 ft² at 1″ thickness) or by two-component kit coverage in square feet at a given depth. Use a spray foam kit\'s stated coverage in ft² at your target depth as the "coverage per roll" input for a rough estimate, but for spray foam projects a dedicated board-foot calculator is more accurate.',
    },
  ],
};
