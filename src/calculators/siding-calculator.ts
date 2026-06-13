import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  const wastePct = Number(inputs.waste_pct ?? 10) / 100;

  if (unitSystem === 'imperial') {
    const heightFt      = Number(inputs.height_ft  ?? 9)  + Number(inputs.height_in  ?? 0) / 12;
    const widthFt       = Number(inputs.width_ft   ?? 30) + Number(inputs.width_in   ?? 0) / 12;
    const walls         = Math.max(1, Math.round(Number(inputs.walls ?? 4)));
    const windowSqFt    = Number(inputs.window_area_sqft ?? 60);
    const doorSqFt      = Number(inputs.door_area_sqft   ?? 40);
    const panelCovSqFt  = Number(inputs.panel_coverage_sqft ?? 100);

    const gross_area_sqft   = Math.round(heightFt * widthFt * walls * 10) / 10;
    const opening_area_sqft = Math.round((windowSqFt + doorSqFt) * 10) / 10;
    const net_area_sqft     = Math.round(Math.max(0, gross_area_sqft - opening_area_sqft) * 10) / 10;
    const required_area_sqft = Math.round(net_area_sqft * (1 + wastePct) * 10) / 10;
    const waste_area_sqft   = Math.round((required_area_sqft - net_area_sqft) * 10) / 10;
    const panels            = panelCovSqFt > 0 ? Math.ceil(required_area_sqft / panelCovSqFt) : 0;

    return {
      gross_area_sqft,
      opening_area_sqft,
      net_area_sqft,
      required_area_sqft,
      waste_area_sqft,
      panels,
    };
  } else {
    const heightM       = Number(inputs.height_m  ?? 2.7);
    const widthM        = Number(inputs.width_m   ?? 9);
    const walls         = Math.max(1, Math.round(Number(inputs.walls ?? 4)));
    const windowSqM     = Number(inputs.window_area_sqm ?? 5.6);
    const doorSqM       = Number(inputs.door_area_sqm   ?? 3.7);
    const panelCovSqM   = Number(inputs.panel_coverage_sqm ?? 9.3);

    const gross_area_sqm    = Math.round(heightM * widthM * walls * 100) / 100;
    const opening_area_sqm  = Math.round((windowSqM + doorSqM) * 100) / 100;
    const net_area_sqm      = Math.round(Math.max(0, gross_area_sqm - opening_area_sqm) * 100) / 100;
    const required_area_sqm  = Math.round(net_area_sqm * (1 + wastePct) * 100) / 100;
    const waste_area_sqm    = Math.round((required_area_sqm - net_area_sqm) * 100) / 100;
    const panels            = panelCovSqM > 0 ? Math.ceil(required_area_sqm / panelCovSqM) : 0;

    return {
      gross_area_sqm,
      opening_area_sqm,
      net_area_sqm,
      required_area_sqm,
      waste_area_sqm,
      panels,
    };
  }
}

export const sidingCalculator: CalculatorConfig = {
  slug: 'siding-calculator',
  name: 'Siding Calculator',
  category: 'framing',
  description:
    'Calculate siding panels and material area for exterior walls. Enter wall height, width, number of walls, window and door openings, and waste percentage to get net wall area, required siding area, and panel count.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'height_ft',
      label: 'Wall Height',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 60,
      step: 1,
      defaultValue: 9,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Floor-to-eave height of the exterior wall.',
    },
    {
      id: 'height_in',
      label: 'Wall Height (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'height_ft',
    },
    {
      id: 'width_ft',
      label: 'Wall Width (per wall)',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 500,
      step: 1,
      defaultValue: 30,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Width of a single wall. All walls are assumed to be the same width.',
    },
    {
      id: 'width_in',
      label: 'Wall Width (in)',
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
      id: 'walls',
      label: 'Number of Walls',
      type: 'number',
      unit: 'walls',
      min: 1,
      max: 50,
      step: 1,
      defaultValue: 4,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Total exterior walls to side. Use 4 for a simple rectangular house.',
    },
    {
      id: 'window_area_sqft',
      label: 'Total Window Area',
      type: 'number',
      unit: 'ft²',
      min: 0,
      max: 5000,
      step: 1,
      defaultValue: 60,
      onlyIn: 'imperial',
      helpText: 'Sum of all window rough opening areas. Enter 0 if none.',
    },
    {
      id: 'door_area_sqft',
      label: 'Total Door Area',
      type: 'number',
      unit: 'ft²',
      min: 0,
      max: 2000,
      step: 1,
      defaultValue: 40,
      onlyIn: 'imperial',
      helpText: 'Sum of all exterior door rough opening areas. Enter 0 if none.',
    },
    {
      id: 'panel_coverage_sqft',
      label: 'Panel Coverage',
      type: 'number',
      unit: 'ft²',
      min: 1,
      max: 500,
      step: 1,
      defaultValue: 100,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Net area covered by one panel or one square of siding. 100 ft² = 1 square.',
    },
    {
      id: 'waste_pct',
      label: 'Waste %',
      type: 'number',
      unit: '%',
      min: 0,
      max: 40,
      step: 1,
      defaultValue: 10,
      onlyIn: 'imperial',
      helpText: '10% for simple rectangular walls; 15% for corners, gables, and trim cuts.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'height_m',
      label: 'Wall Height',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 18,
      step: 0.1,
      defaultValue: 2.7,
      defaultValueMetric: 2.7,
      required: true,
      onlyIn: 'metric',
      helpText: 'Floor-to-eave height of the exterior wall.',
    },
    {
      id: 'width_m',
      label: 'Wall Width (per wall)',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 150,
      step: 0.1,
      defaultValue: 9,
      defaultValueMetric: 9,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'walls',
      label: 'Number of Walls',
      type: 'number',
      unit: 'walls',
      min: 1,
      max: 50,
      step: 1,
      defaultValue: 4,
      required: true,
      onlyIn: 'metric',
      helpText: 'Total exterior walls to side.',
    },
    {
      id: 'window_area_sqm',
      label: 'Total Window Area',
      type: 'number',
      unit: 'm²',
      min: 0,
      max: 500,
      step: 0.1,
      defaultValue: 5.6,
      defaultValueMetric: 5.6,
      onlyIn: 'metric',
      helpText: 'Sum of all window rough opening areas. Enter 0 if none.',
    },
    {
      id: 'door_area_sqm',
      label: 'Total Door Area',
      type: 'number',
      unit: 'm²',
      min: 0,
      max: 200,
      step: 0.1,
      defaultValue: 3.7,
      defaultValueMetric: 3.7,
      onlyIn: 'metric',
      helpText: 'Sum of all exterior door rough opening areas.',
    },
    {
      id: 'panel_coverage_sqm',
      label: 'Panel Coverage',
      type: 'number',
      unit: 'm²',
      min: 0.1,
      max: 50,
      step: 0.1,
      defaultValue: 9.3,
      defaultValueMetric: 9.3,
      required: true,
      onlyIn: 'metric',
      helpText: 'Net area covered by one panel. 9.29 m² ≈ 1 square (100 ft²).',
    },
    {
      id: 'waste_pct',
      label: 'Waste %',
      type: 'number',
      unit: '%',
      min: 0,
      max: 40,
      step: 1,
      defaultValue: 10,
      onlyIn: 'metric',
      helpText: '10% for simple walls; 15% for corners, gables, and trim cuts.',
    },
  ],
  outputs: [
    {
      id: 'gross_area_sqft',
      label: 'Gross Wall Area',
      unit: 'ft²',
      format: 'area',
      primary: true,
      description: 'Total wall area before deducting openings (height × width × walls)',
    },
    {
      id: 'gross_area_sqm',
      label: 'Gross Wall Area',
      unit: 'm²',
      format: 'area',
    },
    {
      id: 'opening_area_sqft',
      label: 'Opening Deductions',
      unit: 'ft²',
      format: 'area',
      description: 'Total area of windows and doors subtracted from gross area',
    },
    {
      id: 'opening_area_sqm',
      label: 'Opening Deductions',
      unit: 'm²',
      format: 'area',
    },
    {
      id: 'net_area_sqft',
      label: 'Net Wall Area',
      unit: 'ft²',
      format: 'area',
      description: 'Actual siding area after deducting all openings',
    },
    {
      id: 'net_area_sqm',
      label: 'Net Wall Area',
      unit: 'm²',
      format: 'area',
    },
    {
      id: 'required_area_sqft',
      label: 'Required Siding Area (with waste)',
      unit: 'ft²',
      format: 'area',
      description: 'Net area plus waste factor — order material for this area',
    },
    {
      id: 'required_area_sqm',
      label: 'Required Siding Area (with waste)',
      unit: 'm²',
      format: 'area',
    },
    {
      id: 'waste_area_sqft',
      label: 'Waste Allowance',
      unit: 'ft²',
      format: 'area',
      description: 'Extra material to cover cuts at corners, openings, and edges',
    },
    {
      id: 'waste_area_sqm',
      label: 'Waste Allowance',
      unit: 'm²',
      format: 'area',
    },
    {
      id: 'panels',
      label: 'Panels / Squares Required',
      unit: 'panels',
      format: 'number',
      description: 'Required siding area ÷ panel coverage, rounded up',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'stud-calculator',
    'plywood-calculator',
    'drywall-calculator',
    'lumber-calculator',
  ],
  seo: {
    title: 'Siding Calculator – House Siding Material Estimator',
    description:
      'Free siding calculator — enter wall height, width, number of walls, window and door openings, and waste percentage to get net wall area, required siding area, and panel count for any exterior cladding project.',
    h1: 'Siding Calculator',
    focusKeyword: 'siding calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate gross and net wall area',
      'Deduct window and door openings automatically',
      'Calculate required siding area with waste factor',
      'Calculate panel or square count',
      'Adjustable waste percentage',
      'Imperial and metric support',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate gross wall area',
      formula: 'Gross Area (ft²) = Wall Height × Wall Width × Number of Walls',
      description:
        'Multiply the height and width of a single wall, then multiply by the number of walls. All walls are assumed to have the same dimensions — if walls differ in size, run the calculator once per unique wall size and add the results.',
    },
    {
      label: 'Calculate opening deductions',
      formula: 'Opening Area (ft²) = Total Window Area + Total Door Area',
      description:
        'Add up the rough opening areas of all windows and doors. Use rough opening dimensions (the framed hole), not the window/door unit size. Many contractors keep the full deduction for large openings and only partially deduct small openings (under 2 ft²) — this calculator deducts the full area you enter.',
    },
    {
      label: 'Calculate net wall area',
      formula: 'Net Area = Gross Area − Opening Area',
      description:
        'This is the actual surface that needs siding. It excludes all framed openings. Net area is the baseline for ordering material before waste is added.',
    },
    {
      label: 'Apply waste factor',
      formula: 'Required Area = Net Area × (1 + Waste %)',
      description:
        'Add 10% for simple rectangular walls with few cuts. Use 15% for homes with corners, gables, bay windows, or many openings. Lap siding and board-and-batten generate more waste at every horizontal cut; panel siding generates waste at vertical seams and corners.',
    },
    {
      label: 'Calculate panels or squares required',
      formula: 'Panels = ⌈Required Area ÷ Panel Coverage⌉',
      description:
        'Divide required area by the net coverage of one panel or one square (100 ft²) and round up. Enter 100 in the panel coverage field to get the number of squares — the standard unit used by siding suppliers.',
    },
  ],
  faq: [
    {
      question: 'How do I calculate how much siding I need?',
      answer:
        'Measure the height and width of each exterior wall and multiply to get wall area. Add all walls together for gross area. Subtract the area of windows and doors to get net area. Multiply net area by 1.10 (10% waste) to get the amount to order. Divide by 100 to convert square feet to squares — the unit most siding suppliers use. For a 9×30 ft wall with 20 ft² of windows: 9×30 = 270 ft² gross, 270 − 20 = 250 ft² net, 250 × 1.10 = 275 ft² = 2.75 squares → order 3 squares.',
    },
    {
      question: 'What is a square of siding?',
      answer:
        'A square is 100 square feet of siding coverage. It is the standard unit used by contractors and material suppliers. Vinyl siding, fiber cement, and engineered wood siding are all sold and priced per square. When getting quotes, confirm whether the price is per square of gross wall area (before deducting openings) or net coverage area — this affects your total cost significantly on homes with many windows.',
    },
    {
      question: 'Should I deduct for windows and doors when ordering siding?',
      answer:
        'Yes for large openings, but common practice varies. Most professional estimators deduct openings larger than 4 ft² and leave smaller openings in the count to cover trim cuts and waste around the opening. This calculator deducts the full area you enter — be conservative with your deductions (enter slightly less than the actual opening area) to ensure you have enough material for the cuts around each opening.',
    },
    {
      question: 'How much waste should I add for siding?',
      answer:
        '10% is standard for simple rectangular walls with no gables. Use 15% for homes with gable ends (the triangular section under the roof peak creates diagonal cuts), bay windows, or irregular geometry. Lap siding generates waste at every horizontal course cut at openings. Board-and-batten and board siding generate waste at vertical seams. Panel siding (4×8 sheets) is the most efficient — panels can be cut and stacked without much offcut waste on straight walls.',
    },
    {
      question: 'What types of siding are most common?',
      answer:
        'Vinyl siding is the most common residential choice — affordable ($3–$8/ft²), low maintenance, and available in many profiles. Fiber cement (e.g., James Hardie) costs more ($6–$12/ft² installed) but is more durable and paintable. Engineered wood siding is a middle ground in cost and performance. Traditional wood siding (cedar, pine) requires regular painting or staining but offers a premium look. Steel siding is more common in commercial and agricultural applications. This calculator works for any type — just enter the panel coverage for your specific product.',
    },
    {
      question: 'How do I measure a house with a gable end for siding?',
      answer:
        'For the rectangular portion of the wall, calculate height × width as normal. For the triangular gable: area = (base × height) ÷ 2, where base is the wall width and height is the vertical distance from the eave to the ridge. Add 15–20% waste for the gable section because every course is cut at an angle. If your gable is part of a rectangular wall (like a shed dormer), add the full gable area to the rectangular wall area before deducting openings.',
    },
    {
      question: 'How much does house siding cost?',
      answer:
        'Vinyl siding costs $3–$8 per square foot installed ($300–$800 per square). Fiber cement siding runs $6–$12 per square foot installed ($600–$1,200 per square). Traditional wood siding is $8–$15 per square foot installed. For a 2,000 ft² home with 20 squares of siding: vinyl = $6,000–$16,000; fiber cement = $12,000–$24,000; wood = $16,000–$30,000. Prices vary significantly by region, contractor, and market conditions — get at least three quotes.',
    },
    {
      question: 'What is the difference between lap siding and panel siding?',
      answer:
        'Lap siding (also called clapboard or horizontal siding) consists of long narrow boards or planks installed horizontally with each course overlapping the one below. The overlap creates the weather seal. Coverage depends on the exposure (the visible portion below the overlap) — a 6-inch plank with 4½-inch exposure covers 4.5 in per course, not 6 in. Panel siding uses 4×8 or 4×9 ft sheets installed vertically with battens over the seams. Panel siding is faster to install and generates less waste. This calculator works for both — use panel coverage per board or per sheet as appropriate.',
    },
  ],
};
