import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const lengthFt   = Number(inputs.length_ft  ?? 12) + Number(inputs.length_in  ?? 0) / 12;
    const widthFt    = Number(inputs.width_ft   ?? 10) + Number(inputs.width_in   ?? 0) / 12;
    const wastePct   = Number(inputs.waste_pct  ?? 10) / 100;
    const boxSqFt    = Number(inputs.box_coverage ?? 20);

    const areaSqFt        = Math.round(lengthFt * widthFt * 10) / 10;
    const areaWithWaste   = Math.round(areaSqFt * (1 + wastePct) * 10) / 10;
    const boxes           = boxSqFt > 0 ? Math.ceil(areaWithWaste / boxSqFt) : 0;

    return {
      area_sqft:        areaSqFt,
      area_sqm:         Math.round(areaSqFt * 0.092903 * 100) / 100,
      area_with_waste:  areaWithWaste,
      boxes,
    };
  } else {
    const lengthM  = Number(inputs.length_m  ?? 3.6);
    const widthM   = Number(inputs.width_m   ?? 3);
    const wastePct = Number(inputs.waste_pct ?? 10) / 100;
    const boxSqM   = Number(inputs.box_coverage_m2 ?? 1.85);

    const areaSqM        = Math.round(lengthM * widthM * 100) / 100;
    const areaWithWaste  = Math.round(areaSqM * (1 + wastePct) * 100) / 100;
    const boxes          = boxSqM > 0 ? Math.ceil(areaWithWaste / boxSqM) : 0;

    return {
      area_sqm:         areaSqM,
      area_sqft:        Math.round(areaSqM * 10.7639 * 10) / 10,
      area_with_waste:  areaWithWaste,
      boxes,
    };
  }
}

export const flooringCalculator: CalculatorConfig = {
  slug: 'flooring-calculator',
  name: 'Flooring Calculator',
  category: 'framing',
  description:
    'Calculate how much flooring you need for any room. Enter room dimensions, waste percentage, and box coverage to get total square footage, flooring required with waste, and boxes to order.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'length_ft',
      label: 'Room Length',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 500,
      step: 1,
      defaultValue: 12,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'length_in',
      label: 'Room Length (in)',
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
      label: 'Room Width',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 500,
      step: 1,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'width_in',
      label: 'Room Width (in)',
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
      id: 'waste_pct',
      label: 'Waste %',
      type: 'number',
      unit: '%',
      min: 0,
      max: 30,
      step: 1,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Straight lay: 10%. Diagonal: 15%. Herringbone: 15–20%.',
    },
    {
      id: 'box_coverage',
      label: 'Box Coverage',
      type: 'number',
      unit: 'ft²/box',
      min: 1,
      max: 200,
      step: 0.5,
      defaultValue: 20,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Check the label on your flooring box. Laminate: 16–22 ft². Hardwood: 18–24 ft².',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Room Length',
      type: 'number',
      unit: 'm',
      min: 0.5,
      max: 150,
      step: 0.1,
      defaultValue: 3.6,
      defaultValueMetric: 3.6,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'width_m',
      label: 'Room Width',
      type: 'number',
      unit: 'm',
      min: 0.5,
      max: 150,
      step: 0.1,
      defaultValue: 3,
      defaultValueMetric: 3,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'waste_pct',
      label: 'Waste %',
      type: 'number',
      unit: '%',
      min: 0,
      max: 30,
      step: 1,
      defaultValue: 10,
      defaultValueMetric: 10,
      required: true,
      onlyIn: 'metric',
      helpText: 'Straight lay: 10%. Diagonal: 15%. Herringbone: 15–20%.',
    },
    {
      id: 'box_coverage_m2',
      label: 'Box Coverage',
      type: 'number',
      unit: 'm²/box',
      min: 0.1,
      max: 20,
      step: 0.05,
      defaultValue: 1.85,
      defaultValueMetric: 1.85,
      required: true,
      onlyIn: 'metric',
      helpText: 'Check the flooring box label. Typical: 1.5–2.2 m² per box.',
    },
  ],
  outputs: [
    {
      id: 'area_with_waste',
      label: 'Flooring Required (with waste)',
      unit: 'ft²',
      unitMetric: 'm²',
      format: 'area',
      primary: true,
      description: 'Order at least this amount',
    },
    {
      id: 'boxes',
      label: 'Boxes to Order',
      unit: 'boxes',
      format: 'number',
      description: 'Based on box coverage entered above',
    },
    {
      id: 'area_sqft',
      label: 'Room Area',
      unit: 'ft²',
      format: 'area',
      description: 'Net floor area before waste',
    },
    {
      id: 'area_sqm',
      label: 'Room Area',
      unit: 'm²',
      format: 'area',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: ['drywall-calculator', 'concrete-slab-calculator', 'paver-base-calculator'],
  seo: {
    title: 'Flooring Calculator — Square Footage & Boxes Needed',
    description:
      'Free flooring calculator — enter room dimensions and box coverage to calculate how much flooring you need in square feet or meters, including waste, and how many boxes to order.',
    h1: 'Flooring Calculator',
    focusKeyword: 'flooring calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate floor area in square feet or meters',
      'Adjustable waste percentage by flooring type',
      'Calculate boxes to order from box coverage',
      'Supports laminate, hardwood, vinyl, and tile',
      'Imperial and metric support',
      'Cost estimator',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate room area',
      formula: 'Area (ft²) = Length (ft) × Width (ft)',
      description: 'For irregular rooms, break into rectangles and sum the areas',
    },
    {
      label: 'Apply waste factor',
      formula: 'Area with waste = Area × (1 + Waste % ÷ 100)',
      description: '10% for straight lay, 15% for diagonal, 15–20% for herringbone or brick pattern',
    },
    {
      label: 'Calculate boxes to order',
      formula: 'Boxes = ⌈Area with waste ÷ Box coverage⌉',
      description: 'Always round up — you cannot buy a partial box',
    },
  ],
  faq: [
    {
      question: 'How do I calculate how much flooring I need?',
      answer:
        'Multiply room length by room width to get square footage. Add a waste percentage (10% for straight lay, 15% for diagonal). Then divide by the coverage per box and round up. For a 12 × 10 ft room: 120 ft² × 1.10 = 132 ft² ÷ 20 ft² per box = 7 boxes. The calculator above handles all of this — just enter your dimensions.',
    },
    {
      question: 'How much extra flooring should I order for waste?',
      answer:
        'The recommended waste allowance depends on the installation pattern: straight lay (parallel to walls) 10%, diagonal (45°) 15%, herringbone or chevron 15–20%, rooms with many angles or alcoves add 5% extra. Always buy at least 10% extra — flooring is sold in boxes and you cannot return partial boxes at most stores. Keeping a few extra planks also lets you repair damage years later from the same dye lot.',
    },
    {
      question: 'How much flooring do I need for a 12×12 room?',
      answer:
        'A 12 × 12 ft room is 144 sq ft. With 10% waste: 144 × 1.10 = 158.4 sq ft to order. At 20 sq ft per box, that\'s ⌈158.4 ÷ 20⌉ = 8 boxes. At 22 sq ft per box (common for laminate), that\'s 8 boxes. Check the exact coverage on your chosen product — it varies by manufacturer and plank size.',
    },
    {
      question: 'How do I calculate laminate flooring?',
      answer:
        'Laminate flooring is calculated the same as any flooring: Length × Width × waste factor ÷ box coverage. Most laminate boxes cover 16–22 sq ft. Use 10% waste for a straight lay; 15% if cutting at an angle. Check the box label for exact coverage — the calculator above uses your entered box coverage so the result is accurate for your specific product.',
    },
    {
      question: 'How do I calculate hardwood flooring?',
      answer:
        'Measure each room length × width and sum all rooms you are flooring. Add 15% waste for solid hardwood (more offcuts due to longer acclimation cuts) or 10% for engineered hardwood with a straight lay. Hardwood boxes typically cover 18–24 sq ft. Enter your room dimensions and your product\'s box coverage in the calculator above for an accurate estimate.',
    },
    {
      question: 'How do I calculate vinyl plank flooring?',
      answer:
        'Vinyl plank (LVP/LVT) is calculated exactly like laminate: room area + waste ÷ box coverage. Most LVP boxes cover 18–23 sq ft. Use 10% waste for a straight lay; 15% for diagonal. Vinyl plank is forgiving to cut so waste is slightly lower than hardwood, but always buy extra for future repairs — colour matching years later is difficult.',
    },
    {
      question: 'What is the box coverage for flooring?',
      answer:
        'Box coverage is printed on every flooring box label — look for "sq ft per carton" or "coverage." Typical ranges: laminate 16–22 ft² per box, engineered hardwood 18–24 ft², luxury vinyl plank 18–23 ft², solid hardwood 20–25 ft², ceramic/porcelain tile varies widely. Enter the exact number from your product in the calculator above — using the right coverage avoids over- or under-ordering.',
    },
    {
      question: 'How do I measure a room for flooring?',
      answer:
        'Measure the longest length and widest width of the room in feet and inches. For L-shaped or irregular rooms, split the area into rectangles, calculate each separately, and add the totals. Include closets and areas under appliances that will not be removed — it\'s easier to cut around them than to come up short. Do not subtract small obstacles like doorways or floor vents.',
    },
  ],
};
