import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  const shape = String(inputs.shape ?? 'rectangle');

  let area_sqft: number;
  let perimeter_ft: number;

  if (unitSystem === 'imperial') {
    const lengthFt  = Number(inputs.length_ft  ?? 12) + Number(inputs.length_in  ?? 0) / 12;
    const widthFt   = Number(inputs.width_ft   ?? 10) + Number(inputs.width_in   ?? 0) / 12;
    const sideFt    = Number(inputs.side_ft    ?? 10) + Number(inputs.side_in    ?? 0) / 12;
    const baseFt    = Number(inputs.base_ft    ?? 10) + Number(inputs.base_in    ?? 0) / 12;
    const heightFt  = Number(inputs.height_ft  ??  8) + Number(inputs.height_in  ?? 0) / 12;
    const radiusFt  = Number(inputs.radius_ft  ??  5) + Number(inputs.radius_in  ?? 0) / 12;

    switch (shape) {
      case 'square':
        area_sqft    = sideFt * sideFt;
        perimeter_ft = 4 * sideFt;
        break;
      case 'triangle':
        area_sqft    = (baseFt * heightFt) / 2;
        perimeter_ft = baseFt + 2 * Math.sqrt((baseFt / 2) ** 2 + heightFt ** 2);
        break;
      case 'circle':
        area_sqft    = Math.PI * radiusFt * radiusFt;
        perimeter_ft = 2 * Math.PI * radiusFt;
        break;
      case 'rectangle':
      default:
        area_sqft    = lengthFt * widthFt;
        perimeter_ft = 2 * (lengthFt + widthFt);
        break;
    }
  } else {
    // Metric — compute in SI units first
    const lengthM = Number(inputs.length_m ?? 3.6);
    const widthM  = Number(inputs.width_m  ?? 3.0);
    const sideM   = Number(inputs.side_m   ?? 3.0);
    const baseM   = Number(inputs.base_m   ?? 3.0);
    const heightM = Number(inputs.height_m ?? 2.4);
    const radiusM = Number(inputs.radius_m ?? 1.5);

    let area_sqm_direct: number;
    let perimeter_m_direct: number;

    switch (shape) {
      case 'square':
        area_sqm_direct    = sideM * sideM;
        perimeter_m_direct = 4 * sideM;
        break;
      case 'triangle':
        area_sqm_direct    = (baseM * heightM) / 2;
        perimeter_m_direct = baseM + 2 * Math.sqrt((baseM / 2) ** 2 + heightM ** 2);
        break;
      case 'circle':
        area_sqm_direct    = Math.PI * radiusM * radiusM;
        perimeter_m_direct = 2 * Math.PI * radiusM;
        break;
      case 'rectangle':
      default:
        area_sqm_direct    = lengthM * widthM;
        perimeter_m_direct = 2 * (lengthM + widthM);
        break;
    }

    // Convert to imperial for the shared return block
    area_sqft    = area_sqm_direct / 0.092903;
    perimeter_ft = perimeter_m_direct / 0.3048;
  }

  const area_sqm     = Math.round(area_sqft    * 0.092903 * 1000)    / 1000;
  const perimeter_m  = Math.round(perimeter_ft * 0.3048   * 1000)    / 1000;
  const acres        = Math.round(area_sqft / 43560        * 1000000) / 1000000;
  const hectares     = Math.round(area_sqm  / 10000        * 1000000) / 1000000;

  return {
    area_sqft:  Math.round(area_sqft    * 100) / 100,
    area_sqm,
    perimeter:  Math.round(perimeter_ft * 100) / 100,
    perimeter_m,
    acres,
    hectares,
  };
}

export const squareFootageCalculator: CalculatorConfig = {
  slug: 'square-footage-calculator',
  name: 'Square Footage Calculator',
  category: 'masonry',
  description:
    'Calculate square footage, square meters, perimeter, acres, and hectares for any shape — rectangle, square, triangle, or circle. Ideal for rooms, flooring, roofing, landscaping, and construction projects.',
  inputs: [
    // ── Shape selector ────────────────────────────────────
    {
      id: 'shape',
      label: 'Shape',
      type: 'select',
      options: [
        { value: 'rectangle', label: 'Rectangle' },
        { value: 'square',    label: 'Square'    },
        { value: 'triangle',  label: 'Triangle'  },
        { value: 'circle',    label: 'Circle'    },
      ],
      defaultValue: 'rectangle',
      required: true,
    },
    // ── Imperial ──────────────────────────────────────────
    {
      id: 'length_ft',
      label: 'Length',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 500,
      step: 0.5,
      defaultValue: 12,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Longer dimension of the rectangle (e.g. room length). Enter feet here and any extra inches below.',
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
      min: 0,
      max: 500,
      step: 0.5,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Shorter dimension of the rectangle (e.g. room width).',
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
      id: 'side_ft',
      label: 'Side',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 500,
      step: 0.5,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Length of one side of the square — all four sides are equal.',
    },
    {
      id: 'side_in',
      label: 'Side (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'side_ft',
    },
    {
      id: 'base_ft',
      label: 'Base',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 500,
      step: 0.5,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Length of the triangle\'s base. Perimeter uses an isosceles approximation (two equal sides).',
    },
    {
      id: 'base_in',
      label: 'Base (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'base_ft',
    },
    {
      id: 'height_ft',
      label: 'Height',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 500,
      step: 0.5,
      defaultValue: 8,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Perpendicular height from base to apex — not the slant length.',
    },
    {
      id: 'height_in',
      label: 'Height (in)',
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
      id: 'radius_ft',
      label: 'Radius',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 250,
      step: 0.5,
      defaultValue: 5,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Distance from the center to the edge of the circle. Diameter ÷ 2 = radius.',
    },
    {
      id: 'radius_in',
      label: 'Radius (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'radius_ft',
    },
    // ── Metric ────────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Length',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 150,
      step: 0.1,
      defaultValue: 3.6,
      defaultValueMetric: 3.6,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'width_m',
      label: 'Width',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 150,
      step: 0.1,
      defaultValue: 3.0,
      defaultValueMetric: 3.0,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'side_m',
      label: 'Side',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 150,
      step: 0.1,
      defaultValue: 3.0,
      defaultValueMetric: 3.0,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'base_m',
      label: 'Base',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 150,
      step: 0.1,
      defaultValue: 3.0,
      defaultValueMetric: 3.0,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'height_m',
      label: 'Height',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 150,
      step: 0.1,
      defaultValue: 2.4,
      defaultValueMetric: 2.4,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'radius_m',
      label: 'Radius',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 75,
      step: 0.1,
      defaultValue: 1.5,
      defaultValueMetric: 1.5,
      required: true,
      onlyIn: 'metric',
    },
  ],
  outputs: [
    {
      id: 'area_sqft',
      label: 'Area',
      unit: 'ft²',
      format: 'area',
      primary: true,
      description: 'Total area in square feet',
    },
    {
      id: 'area_sqm',
      label: 'Area',
      unit: 'm²',
      format: 'area',
      description: 'Total area in square metres (ft² × 0.092903)',
    },
    {
      id: 'perimeter',
      label: 'Perimeter',
      unit: 'ft',
      format: 'length',
      description: 'Total perimeter or circumference in feet',
    },
    {
      id: 'perimeter_m',
      label: 'Perimeter',
      unit: 'm',
      format: 'length',
      description: 'Total perimeter or circumference in metres',
    },
    {
      id: 'acres',
      label: 'Acres',
      unit: 'ac',
      format: 'number',
      description: 'Area in acres (ft² ÷ 43,560)',
    },
    {
      id: 'hectares',
      label: 'Hectares',
      unit: 'ha',
      format: 'number',
      description: 'Area in hectares (m² ÷ 10,000)',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'flooring-calculator',
    'roofing-calculator',
    'siding-calculator',
    'drywall-calculator',
  ],
  seo: {
    title: 'Square Footage Calculator – Area & Room Size Calculator',
    description:
      'Calculate square footage, square meters, perimeter, acres, and area for rooms, flooring, roofing, landscaping, and construction projects.',
    h1: 'Square Footage Calculator',
    focusKeyword: 'square footage calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate square footage for rectangle, square, triangle, and circle shapes',
      'Area in both square feet and square metres',
      'Perimeter and circumference in feet and metres',
      'Acre and hectare conversions for land and landscaping projects',
      'Feet + inches fractional input for precise imperial measurements',
      'Supports flooring, roofing, painting, and construction estimating',
    ],
  },
  formulaSteps: [
    {
      label: 'Rectangle area',
      formula: 'Area (ft²) = Length (ft) × Width (ft)',
      description:
        'Multiply the two perpendicular dimensions. For rooms, measure wall-to-wall length and wall-to-wall width at floor level. Add a 5–10% waste factor for flooring or tiling to account for cuts and off-cuts.',
    },
    {
      label: 'Square area',
      formula: 'Area (ft²) = Side (ft) × Side (ft) = Side²',
      description:
        'A square is a special case of a rectangle where all four sides are equal. Square a single side measurement to get the area. Common for patios, tiles, and symmetrical rooms.',
    },
    {
      label: 'Triangle area',
      formula: 'Area (ft²) = ½ × Base (ft) × Height (ft)',
      description:
        'Height is the perpendicular distance from the base to the opposite apex — not the slant height. Perimeter uses an isosceles approximation: P = Base + 2 × √((Base/2)² + Height²). For non-isosceles triangles, measure all three sides directly.',
    },
    {
      label: 'Circle area',
      formula: 'Area (ft²) = π × Radius (ft)²',
      description:
        'Enter the radius (half the diameter). Circumference = 2 × π × Radius. Use this for circular patios, pools, round rooms, or any curved footprint.',
    },
    {
      label: 'Unit conversions',
      formula: 'Area (m²) = Area (ft²) × 0.092903 | Acres = Area (ft²) ÷ 43,560 | Hectares = Area (m²) ÷ 10,000',
      description:
        'One square foot equals 0.092903 square metres. One acre is 43,560 square feet. One hectare is 10,000 square metres (≈ 2.471 acres). These conversions are applied automatically to every result.',
    },
  ],
  faq: [
    {
      question: 'What is square footage?',
      answer:
        'Square footage is a measurement of area expressed in square feet (ft²). One square foot is the area of a square with sides 1 foot long. It is the standard area unit used in the United States for real estate listings, flooring, roofing, paint coverage, and construction material estimates. To find the square footage of a rectangle, multiply its length by its width.',
    },
    {
      question: 'How do I calculate the square footage of a room?',
      answer:
        'Measure the room\'s length and width at floor level using a tape measure. Multiply the two numbers: Area = Length × Width. For example, a 12 ft × 10 ft room is 120 ft². For L-shaped or irregular rooms, break the space into rectangles, calculate each one separately, then add the totals together.',
    },
    {
      question: 'How much flooring do I need for a given square footage?',
      answer:
        'Calculate the room\'s square footage, then add a waste factor before ordering materials. For hardwood or laminate, add 7–10% for cuts and alignment. For tile set on the diagonal, add 10–15%. For carpet, add 5–10% for seam placement. Always buy slightly more than you need — matching dye lots later can be difficult.',
    },
    {
      question: 'How do I estimate paint coverage from square footage?',
      answer:
        'A standard gallon of interior paint covers 350–400 ft² per coat. Calculate your wall area (perimeter × ceiling height, minus windows and doors), then divide by 350 for a conservative estimate. Add 10–15% for a second coat or porous surfaces like new drywall. Ceilings and trim require separate calculations.',
    },
    {
      question: 'How do I measure square footage for a roof?',
      answer:
        'Measure the footprint of the house (length × width), then multiply by a pitch factor for the slope. A flat roof uses a 1.0 factor; a 4/12 pitch uses about 1.054; a 6/12 pitch uses about 1.118; a 12/12 pitch uses about 1.414. For example, a 1,200 ft² footprint on a 6/12 pitch roof has approximately 1,341 ft² of actual roof surface. Add 10–15% for waste and ridge/hip cuts.',
    },
    {
      question: 'How many square feet are in an acre?',
      answer:
        'One acre equals exactly 43,560 square feet. It is roughly the area of a football field (without the end zones). To convert square feet to acres, divide by 43,560. For example, a 100 ft × 200 ft lot is 20,000 ft² = 0.459 acres. This calculator shows acres automatically alongside square footage.',
    },
    {
      question: 'How many square feet are in a hectare?',
      answer:
        'One hectare equals 10,000 square metres or approximately 107,639 square feet (about 2.471 acres). Hectares are the standard land area unit in most countries outside the United States. This calculator converts to hectares automatically from any shape input.',
    },
    {
      question: 'When should I use metric vs. imperial measurements?',
      answer:
        'Use imperial (feet and inches) for US residential construction, real estate, and retail material purchasing — most US product sizes and coverage rates are expressed in ft². Switch to metric for international projects, scientific calculations, or when materials are priced per m². This calculator supports both unit systems and converts results automatically between ft², m², acres, and hectares.',
    },
    {
      question: 'How do I calculate the perimeter of a room or shape?',
      answer:
        'Perimeter is the total distance around the outside of a shape. Rectangle: P = 2 × (Length + Width). Square: P = 4 × Side. Circle (circumference): C = 2 × π × Radius. Triangle (isosceles): P = Base + 2 × √((Base/2)² + Height²). Perimeter is useful for fencing, baseboard trim, edging, and any material sold by the linear foot.',
    },
    {
      question: 'How do contractors use square footage for construction estimates?',
      answer:
        'Contractors use square footage as the primary unit for material take-offs and labor estimates. Framing labor is often quoted per ft² of floor area; roofing and siding are quoted per "square" (100 ft²); concrete flatwork is priced per ft². Accurate area measurements reduce material waste and prevent costly shortages. Always add a project-specific waste allowance (5–15%) on top of the calculated area before purchasing materials.',
    },
  ],
};
