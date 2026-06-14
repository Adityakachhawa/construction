import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

// Sheet sizes in sq ft (imperial) and sq m (metric)
const SHEET_SIZES_SQFT: Record<string, number> = {
  '4x8':  32,
  '4x10': 40,
  '4x12': 48,
};
const SHEET_SIZES_SQM: Record<string, number> = {
  '4x8':  32 * 0.092903,   // ~2.973 m²
  '4x10': 40 * 0.092903,   // ~3.716 m²
  '4x12': 48 * 0.092903,   // ~4.459 m²
};

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  const sheetSize = String(inputs.sheet_size ?? '4x8');
  const wastePct  = Number(inputs.waste_pct ?? 10) / 100;

  if (unitSystem === 'imperial') {
    const lengthFt = Number(inputs.length_ft ?? 12) + Number(inputs.length_in ?? 0) / 12;
    const widthFt  = Number(inputs.width_ft  ?? 10) + Number(inputs.width_in  ?? 0) / 12;

    const areaSqFt       = Math.round(lengthFt * widthFt * 10) / 10;
    const areaWithWaste  = Math.round(areaSqFt * (1 + wastePct) * 10) / 10;
    const sheetSqFt      = SHEET_SIZES_SQFT[sheetSize] ?? 32;
    const sheets_net     = Math.ceil(areaSqFt      / sheetSqFt);
    const sheets_waste   = Math.ceil(areaWithWaste / sheetSqFt);
    const covered_sqft   = sheets_waste * sheetSqFt;

    return {
      area_sqft: areaSqFt,
      area_sqm: Math.round(areaSqFt * 0.092903 * 100) / 100,
      sheets_net, sheets_waste,
      covered_sqft,
      covered_sqm: Math.round(covered_sqft * 0.092903 * 100) / 100,
    };
  } else {
    const lengthM = Number(inputs.length_m ?? 3.6);
    const widthM  = Number(inputs.width_m  ?? 3);

    const areaSqM       = Math.round(lengthM * widthM * 100) / 100;
    const areaWithWaste = Math.round(areaSqM * (1 + wastePct) * 100) / 100;
    const sheetSqM      = SHEET_SIZES_SQM[sheetSize] ?? SHEET_SIZES_SQM['4x8'];
    const sheets_net    = Math.ceil(areaSqM      / sheetSqM);
    const sheets_waste  = Math.ceil(areaWithWaste / sheetSqM);
    const covered_sqm   = Math.round(sheets_waste * sheetSqM * 100) / 100;

    return {
      area_sqm: areaSqM,
      area_sqft: Math.round(areaSqM * 10.7639 * 10) / 10,
      sheets_net, sheets_waste,
      covered_sqm,
      covered_sqft: Math.round(covered_sqm * 10.7639 * 10) / 10,
    };
  }
}

export const plywoodCalculator: CalculatorConfig = {
  slug: 'plywood-calculator',
  name: 'Plywood Calculator',
  category: 'framing',
  description:
    'Calculate how many plywood sheets you need for any project. Enter area dimensions, sheet size, and waste percentage to get exact sheet count for subfloor, wall sheathing, or roof sheathing.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'length_ft',
      label: 'Length',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 5000,
      step: 1,
      defaultValue: 12,
      required: true,
      onlyIn: 'imperial',
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
      max: 5000,
      step: 1,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
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
      id: 'sheet_size',
      label: 'Sheet Size',
      type: 'select',
      options: [
        { value: '4x8',  label: '4×8 ft (32 sq ft)' },
        { value: '4x10', label: '4×10 ft (40 sq ft)' },
        { value: '4x12', label: '4×12 ft (48 sq ft)' },
      ],
      defaultValue: '4x8',
      required: true,
      onlyIn: 'imperial',
      helpText: '4×8 is the most common size for subfloor and sheathing.',
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
      onlyIn: 'imperial',
      helpText: 'Add 10% for standard cuts; 15% for diagonal or complex layouts.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Length',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 1500,
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
      max: 1500,
      step: 0.1,
      defaultValue: 3,
      defaultValueMetric: 3,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'sheet_size',
      label: 'Sheet Size',
      type: 'select',
      options: [
        { value: '4x8',  label: '1220×2440 mm (≈2.97 m²)' },
        { value: '4x10', label: '1220×3050 mm (≈3.72 m²)' },
        { value: '4x12', label: '1220×3660 mm (≈4.46 m²)' },
      ],
      defaultValue: '4x8',
      required: true,
      onlyIn: 'metric',
      helpText: '1220×2440 mm is the standard sheet for subfloor and sheathing.',
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
      onlyIn: 'metric',
      helpText: 'Add 10% for standard cuts; 15% for diagonal or complex layouts.',
    },
  ],
  outputs: [
    {
      id: 'sheets_waste',
      label: 'Sheets Required',
      unit: 'sheets',
      format: 'number',
      primary: true,
      description: 'Includes waste factor — order this many sheets',
    },
    {
      id: 'sheets_net',
      label: 'Sheets (no waste)',
      unit: 'sheets',
      format: 'number',
      description: 'Theoretical minimum without any waste allowance',
    },
    {
      id: 'area_sqft',
      label: 'Area',
      unit: 'ft²',
      format: 'area',
      description: 'Total floor, wall, or roof area entered',
    },
    {
      id: 'area_sqm',
      label: 'Area',
      unit: 'm²',
      format: 'area',
    },
    {
      id: 'covered_sqft',
      label: 'Total Sheet Coverage',
      unit: 'ft²',
      format: 'area',
      description: 'Area covered by all sheets ordered (sheets × sheet size)',
    },
    {
      id: 'covered_sqm',
      label: 'Total Sheet Coverage',
      unit: 'm²',
      format: 'area',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'drywall-calculator',
    'flooring-calculator',
  ],
  seo: {
    title: 'Plywood Calculator — Sheet Count for Subfloor, Sheathing & Roof',
    description:
      'Free plywood calculator — enter area length, width, sheet size, and waste % to get the exact number of plywood sheets for subfloor, wall sheathing, or roof sheathing projects.',
    h1: 'Plywood Calculator',
    focusKeyword: 'plywood calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate plywood sheet count for any area',
      'Supports 4×8, 4×10, and 4×12 sheet sizes',
      'Adjustable waste percentage',
      'Shows net sheets and sheets with waste separately',
      'Calculates total material coverage area',
      'Imperial and metric support',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate area',
      formula: 'Area (ft²) = Length (ft) × Width (ft)',
      description: 'This is the floor, wall, or roof surface to be covered',
    },
    {
      label: 'Apply waste factor',
      formula: 'Area with waste (ft²) = Area × (1 + Waste %)',
      description: 'Accounts for offcuts at edges, openings, and irregular shapes',
    },
    {
      label: 'Calculate sheets required',
      formula: 'Sheets = ⌈Area with waste ÷ Sheet size (ft²)⌉',
      description: 'Always round up — you cannot buy a fraction of a sheet. A 4×8 sheet covers 32 ft², 4×10 covers 40 ft², 4×12 covers 48 ft²',
    },
    {
      label: 'Calculate total coverage',
      formula: 'Coverage (ft²) = Sheets × Sheet size (ft²)',
      description: 'The area all purchased sheets would cover if laid without cuts — excess above your project area is the expected offcut material',
    },
    {
      label: 'Verify overage',
      formula: 'Overage = Coverage − Area',
      description: 'A healthy overage is 10–15% of the project area. If overage exceeds 20%, check whether a larger sheet size reduces waste',
    },
  ],
  faq: [
    {
      question: 'How many plywood sheets do I need for a 12×10 ft subfloor?',
      answer:
        'A 12×10 ft room is 120 sq ft. With standard 4×8 sheets (32 sq ft each): 120 ÷ 32 = 3.75, rounded up to 4 sheets net. With 10% waste: 120 × 1.10 = 132 sq ft ÷ 32 = 4.13, rounded up to 5 sheets. The calculator handles all rounding and waste automatically for any room size.',
    },
    {
      question: 'What size plywood sheets should I use?',
      answer:
        '4×8 ft (1220×2440 mm) is the standard and most widely available size — use it for subfloors, wall sheathing, and roof sheathing. 4×10 and 4×12 sheets reduce the number of seams on long runs (like roof rafters or floor joists spaced at 10-foot intervals) but cost more per sheet and are harder to handle solo. Use longer sheets when minimizing seams matters more than ease of transport.',
    },
    {
      question: 'What thickness plywood should I use for a subfloor?',
      answer:
        '3/4 inch (18–19 mm) tongue-and-groove plywood is the standard for subfloors over joists at 16-inch spacing. Use 1-1/8 inch (28 mm) for joists at 19.2 or 24-inch spacing. For roof sheathing, 7/16 inch (11 mm) OSB or 1/2 inch plywood is common at 24-inch rafter spacing; 5/8 inch for heavier loads. Wall sheathing is typically 7/16 to 1/2 inch.',
    },
    {
      question: 'How much waste should I add for plywood?',
      answer:
        '10% is standard for rectangular rooms with few openings. Increase to 15% for rooms with angled walls, bay windows, or many doors. Use 15–20% for diagonal subfloor or sheathing layouts, which produce significantly more offcut waste at every edge. Never go below 5% — even perfect layouts lose material to saw kerfs and edge trimming.',
    },
    {
      question: 'How do I calculate plywood for a roof?',
      answer:
        'Measure the roof slope length (not the horizontal span) for each roof plane, multiply by the ridge length to get the plane area, then add all planes together. For a gable roof: each side = rafter length × ridge length. Add 10% waste for standard gable roofs; 15% for hip roofs with diagonal cuts at all four corners. Use this calculator for each rectangular plane and sum the sheet counts.',
    },
    {
      question: 'Is plywood or OSB better for subfloor?',
      answer:
        'Both are code-compliant for subfloors. OSB is 10–15% cheaper per sheet and dimensionally uniform. Plywood is stiffer, holds fasteners better over time, and handles moisture exposure better during construction. Most builders use OSB for cost savings; some prefer plywood in wet climates or for premium builds. The sheet count calculation is identical — this calculator works for both materials.',
    },
    {
      question: 'How much does plywood cost?',
      answer:
        '3/4 inch plywood costs $55–$80 per 4×8 sheet at hardware stores (2025 pricing). For a 12×10 ft room needing 5 sheets: $275–$400 in material. OSB is $30–$50 per sheet for the same size. Prices vary significantly by region and fluctuate with lumber markets — always check current local pricing before budgeting.',
    },
    {
      question: 'Should I stagger plywood sheet seams?',
      answer:
        'Yes — always stagger seams by at least half a sheet (24 inches for 4×8 sheets) between rows. Aligned seams create a continuous weak line across the floor or wall. Staggering distributes loads across multiple joists or studs and is required by most building codes. Staggering does not increase material usage but does affect how you lay out cuts — plan your sheet arrangement before cutting.',
    },
  ],
};
