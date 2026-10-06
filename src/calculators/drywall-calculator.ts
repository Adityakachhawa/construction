import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

// Standard drywall sheet sizes (width × height in feet)
const SHEET_SIZES_FT: Record<string, { w: number; h: number }> = {
  '4x8':  { w: 4, h: 8  },
  '4x10': { w: 4, h: 10 },
  '4x12': { w: 4, h: 12 },
};
// Metric equivalents (1.2 m × 2.4/3.0/3.6 m)
const SHEET_SIZES_M: Record<string, { w: number; h: number }> = {
  '4x8':  { w: 1.2, h: 2.44 },
  '4x10': { w: 1.2, h: 3.05 },
  '4x12': { w: 1.2, h: 3.66 },
};

const WASTE_FACTOR = 1.10; // 10% for cuts and offcuts

// Joint compound: ~0.011 gallons per sq ft of drywall (Standard USG Level 4 finish: ~5.5 gal per 500 sq ft)
const COMPOUND_GAL_PER_SQFT = 0.011;
// Tape: ~1 linear foot of tape per 2 sq ft of drywall (seams every 4 ft on 4-ft sheets)
const TAPE_LF_PER_SQFT = 0.5;

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  const sheetKey = String(inputs.sheet_size ?? '4x8');

  if (unitSystem === 'imperial') {
    const wallHeightFt = Number(inputs.wall_height_ft ?? 9) + Number(inputs.wall_height_in ?? 0) / 12;
    const wallWidthFt  = Number(inputs.wall_width_ft  ?? 12) + Number(inputs.wall_width_in ?? 0) / 12;
    const numWalls     = Math.max(1, Math.round(Number(inputs.num_walls ?? 4)));

    const sheet = SHEET_SIZES_FT[sheetKey] ?? SHEET_SIZES_FT['4x8'];
    const sheetAreaSqFt = sheet.w * sheet.h;

    const totalAreaSqFt  = wallHeightFt * wallWidthFt * numWalls;
    const sheetsNet      = totalAreaSqFt / sheetAreaSqFt;
    const sheetsWithWaste = Math.ceil(sheetsNet * WASTE_FACTOR);

    const compoundGal  = Math.round(totalAreaSqFt * COMPOUND_GAL_PER_SQFT * 10) / 10;
    const tapeLf       = Math.round(totalAreaSqFt * TAPE_LF_PER_SQFT);

    return {
      total_area_sqft:     Math.round(totalAreaSqFt * 10) / 10,
      total_area_sqm:      Math.round(totalAreaSqFt * 0.092903 * 10) / 10,
      sheets_net:          Math.ceil(sheetsNet),
      sheets_with_waste:   sheetsWithWaste,
      compound_gallons:    compoundGal,
      compound_liters:     Math.round(compoundGal * 3.78541 * 10) / 10,
      tape_linear_ft:      tapeLf,
      tape_linear_m:       Math.round(tapeLf * 0.3048),
    };
  } else {
    const wallHeightM = Number(inputs.wall_height_m ?? 2.7);
    const wallWidthM  = Number(inputs.wall_width_m  ?? 3.6);
    const numWalls    = Math.max(1, Math.round(Number(inputs.num_walls ?? 4)));

    const sheet = SHEET_SIZES_M[sheetKey] ?? SHEET_SIZES_M['4x8'];
    const sheetAreaM2 = sheet.w * sheet.h;

    const totalAreaM2    = wallHeightM * wallWidthM * numWalls;
    const sheetsNet      = totalAreaM2 / sheetAreaM2;
    const sheetsWithWaste = Math.ceil(sheetsNet * WASTE_FACTOR);

    // Convert compound to liters (1 gal ≈ 3.785 L)
    const compoundL  = Math.round(totalAreaM2 * COMPOUND_GAL_PER_SQFT * 10.764 * 3.785 / 10) / 10;
    const tapeM      = Math.round(totalAreaM2 * TAPE_LF_PER_SQFT * 0.3048);

    return {
      total_area_sqm:      Math.round(totalAreaM2 * 10) / 10,
      total_area_sqft:     Math.round(totalAreaM2 * 10.7639 * 10) / 10,
      sheets_net:          Math.ceil(sheetsNet),
      sheets_with_waste:   sheetsWithWaste,
      compound_liters:     compoundL,
      compound_gallons:    Math.round(compoundL / 3.78541 * 10) / 10,
      tape_linear_m:       tapeM,
      tape_linear_ft:      Math.round(tapeM / 0.3048),
    };
  }
}

export const drywallCalculator: CalculatorConfig = {
  slug: 'drywall-calculator',
  name: 'Drywall Calculator',
  category: 'framing',
  description:
    'Calculate how much drywall you need for any room or project. Enter wall dimensions to get total sheets, joint compound, tape, and estimated cost — with a 10% waste factor included.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'wall_height_ft',
      label: 'Wall Height',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 30,
      step: 1,
      defaultValue: 9,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'wall_height_in',
      label: 'Wall Height (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'wall_height_ft',
    },
    {
      id: 'wall_width_ft',
      label: 'Wall Width',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 500,
      step: 1,
      defaultValue: 12,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Width of one wall (or total perimeter if measuring all at once).',
    },
    {
      id: 'wall_width_in',
      label: 'Wall Width (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'wall_width_ft',
    },
    {
      id: 'num_walls',
      label: 'Number of Walls',
      type: 'number',
      unit: 'walls',
      min: 1,
      max: 50,
      step: 1,
      defaultValue: 4,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Enter 1 if wall_width is the total perimeter of all walls combined.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'wall_height_m',
      label: 'Wall Height',
      type: 'number',
      unit: 'm',
      min: 0.5,
      max: 9,
      step: 0.1,
      defaultValue: 2.7,
      defaultValueMetric: 2.7,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'wall_width_m',
      label: 'Wall Width',
      type: 'number',
      unit: 'm',
      min: 0.5,
      max: 150,
      step: 0.1,
      defaultValue: 3.6,
      defaultValueMetric: 3.6,
      required: true,
      onlyIn: 'metric',
      helpText: 'Width of one wall (or total perimeter).',
    },
    {
      id: 'num_walls',
      label: 'Number of Walls',
      type: 'number',
      unit: 'walls',
      min: 1,
      max: 50,
      step: 1,
      defaultValue: 4,
      defaultValueMetric: 4,
      required: true,
      onlyIn: 'metric',
    },
    // ── Shared (both unit systems) ─────────────────────
    {
      id: 'sheet_size',
      label: 'Sheet Size',
      type: 'select',
      defaultValue: '4x8',
      options: [
        { value: '4x8',  label: '4 × 8 ft (most common)' },
        { value: '4x10', label: '4 × 10 ft' },
        { value: '4x12', label: '4 × 12 ft (fewer seams)' },
      ],
      required: true,
      helpText: '4×8 is standard residential; 4×12 reduces horizontal seams on 9 ft walls.',
    },
  ],
  outputs: [
    {
      id: 'sheets_with_waste',
      label: 'Drywall Sheets (with 10% waste)',
      unit: 'sheets',
      format: 'number',
      primary: true,
      description: 'Order this quantity — includes 10% for cuts and offcuts',
    },
    {
      id: 'sheets_net',
      label: 'Sheets (no waste)',
      unit: 'sheets',
      format: 'number',
      description: 'Exact coverage before waste allowance',
    },
    {
      id: 'total_area_sqft',
      label: 'Total Wall Area',
      unit: 'ft²',
      format: 'area',
      description: 'Combined area of all walls entered',
    },
    {
      id: 'total_area_sqm',
      label: 'Total Wall Area',
      unit: 'm²',
      format: 'area',
    },
    {
      id: 'compound_gallons',
      label: 'Joint Compound',
      unit: 'gal',
      format: 'volume',
      description: 'Estimate for tape coat + 3 finish coats',
    },
    {
      id: 'compound_liters',
      label: 'Joint Compound',
      unit: 'L',
      format: 'volume',
    },
    {
      id: 'tape_linear_ft',
      label: 'Drywall Tape',
      unit: 'lf',
      format: 'length',
      description: 'Paper or mesh tape for all seams',
    },
    {
      id: 'tape_linear_m',
      label: 'Drywall Tape',
      unit: 'm',
      format: 'length',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: ['concrete-slab-calculator', 'rebar-calculator', 'paver-base-calculator'],
  seo: {
    title: 'Drywall Calculator — Sheets, Mud & Tape Estimator',
    description:
      'Free drywall calculator — enter wall height, width, and sheet size to calculate how many drywall sheets you need, plus joint compound, tape, and estimated project cost.',
    h1: 'Drywall Calculator',
    focusKeyword: 'drywall calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate drywall sheets needed',
      'Includes 10% waste factor',
      'Estimate joint compound (mud)',
      'Estimate drywall tape',
      'Support for 4×8, 4×10, and 4×12 sheet sizes',
      'Imperial and metric support',
      'Cost estimator',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate total wall area',
      formula: 'Total Area = Wall Height × Wall Width × Number of Walls',
      description: 'Multiply all three inputs — subtract door/window openings manually if needed',
    },
    {
      label: 'Calculate net sheets required',
      formula: 'Sheets (net) = ⌈Total Area ÷ Sheet Area⌉',
      description: 'Sheet area: 4×8 = 32 ft², 4×10 = 40 ft², 4×12 = 48 ft²',
    },
    {
      label: 'Apply waste factor',
      formula: 'Sheets (order) = ⌈Net Sheets × 1.10⌉',
      description: '10% waste accounts for cuts at corners, outlets, and windows',
    },
    {
      label: 'Estimate joint compound',
      formula: 'Compound (gal) = Total Area × 0.011',
      description: 'Provides enough for a tape coat plus three finish coats. Quantities vary by finish method.',
    },
    {
      label: 'Estimate tape',
      formula: 'Tape (lf) = Total Area × 0.5',
      description: 'One linear foot of tape per two square feet of drywall — approximates seam density',
    },
  ],
  faq: [
    {
      question: 'How do I calculate how much drywall I need?',
      answer:
        'Multiply each wall\'s height by its width to get the area, then add all walls together. Divide the total area by the sheet size (32 ft² for a 4×8 sheet, 40 ft² for 4×10, 48 ft² for 4×12) to get the net sheets. Add 10% for waste and round up: Sheets with waste = ⌈(Total Area ÷ 32) × 1.10⌉. For a room with four 9×12 ft walls, that\'s 4 × 108 = 432 ft² ÷ 32 = 13.5 net sheets. Multiply by 1.10 for waste (14.85) and round up to get 15 sheets to order.',
    },
    {
      question: 'What size drywall sheet should I use?',
      answer:
        '4×8 ft sheets are the most common and easiest to handle — one person can carry them. 4×12 ft sheets reduce horizontal seams on 9-foot ceilings (one sheet covers the full height, no butt joint in the middle) which saves finishing time. 4×10 ft is a compromise. Use 4×12 on tall walls if you have help handling them; use 4×8 for repairs, closets, or solo work.',
    },
    {
      question: 'How much joint compound (mud) do I need for drywall?',
      answer:
        'This calculator uses an estimate of 0.011 gallons of joint compound per square foot of drywall, which provides enough for a tape coat plus three finish coats. For a 432 sq ft room, that\'s about 4.8 gallons (roughly one 5-gallon bucket). Actual quantities will vary by finish method and experience. Buy all-purpose compound for the tape coat and topping or lightweight compound for finish coats.',
    },
    {
      question: 'How much drywall tape do I need?',
      answer:
        'A good rule of thumb is one linear foot of tape per two square feet of drywall. For a 432 sq ft room, that\'s about 216 linear feet of tape. Paper tape is preferred by professionals for strength; fiberglass mesh tape is easier for beginners. Buy tape in 75–500 ft rolls — for most rooms, two 150-ft rolls is enough.',
    },
    {
      question: 'How much waste should I add for drywall?',
      answer:
        'Add 10% for typical rectangular rooms with standard door and window placements. Increase to 15% for rooms with many angles, arched openings, or complex ceilings. The waste comes from cut pieces at corners that can\'t be reused, outlet and switch cutouts, and the occasional cracked sheet. This calculator adds 10% automatically.',
    },
    {
      question: 'How many sheets of drywall do I need for a 12×12 room?',
      answer:
        'A standard 12×12 room with 9-foot ceilings has four walls: 2 walls at 12×9 ft = 216 ft² and 2 walls at 12×9 ft = 216 ft², total 432 ft². At 32 ft² per 4×8 sheet: 432 ÷ 32 = 13.5 net sheets. With a 10% waste factor: ⌈13.5 × 1.10⌉ = 15 sheets. The ceiling adds another 144 ft², bringing the total area to 576 ft². 576 ÷ 32 = 18 net sheets. With 10% waste: ⌈18 × 1.10⌉ = 20 sheets total for walls and ceiling.',
    },
    {
      question: 'What thickness of drywall should I use?',
      answer:
        '½-inch (12.7 mm) drywall is standard for interior walls and ceilings in residential construction — it fits standard framing at 16 or 24 inches on center. ⅝-inch (15.9 mm) is used for fire-rated assemblies, garages, and commercial projects. ¼-inch is for curved walls or laminating over existing drywall. ⅜-inch is rarely used today. Use ½-inch for most projects unless code requires otherwise.',
    },
    {
      question: 'How much does drywall cost?',
      answer:
        'A standard 4×8 sheet of ½-inch drywall costs $12–$20 depending on brand and region. Specialty types (moisture-resistant, fire-rated) cost more. For a 16-sheet order at $15 per sheet, material cost is $240. Add joint compound ($20–$40 for a 5-gallon bucket), tape ($5–$15), screws ($10–$20), and corner bead ($20–$40). Professional installation adds $1.50–$3.50 per sq ft for labor on top of materials.',
    },
  ],
  orderCallout: true,
  wasteFactor: {
    default: 10,
    range: '10–15%',
    notes: 'Standard rooms: 10%. Many cuts around windows, doors, or irregular ceilings: 12–15%.',
  },
};
