import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

// Standard CMU: 8"×16" nominal face = 128 in² = 0.8889 ft²
// 1 ft² / 0.8889 ft² = 1.125 blocks per sq ft
const BLOCKS_PER_SQFT = 1.125;
// Standard 200×400 mm nominal face = 0.08 m² → 12.5 blocks per m²
const BLOCKS_PER_SQM = 12.5;
// 1 bag of Type S/N mortar covers ~35 blocks at 3/8" joints
const BLOCKS_PER_MORTAR_BAG = 35;
// 80 lb bag concrete yields ~0.60 ft³ (for core fill)
const BAG_FT3 = 0.60;

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const lengthFt  = Number(inputs.length_ft ?? 10) + Number(inputs.length_in ?? 0) / 12;
    const heightFt  = Number(inputs.height_ft ?? 8)  + Number(inputs.height_in  ?? 0) / 12;
    const wastePct  = Number(inputs.waste_pct ?? 5) / 100;

    const wallAreaSqFt = lengthFt * heightFt;
    const blocksNet    = wallAreaSqFt * BLOCKS_PER_SQFT;
    const blocks       = Math.ceil(blocksNet * (1 + wastePct));
    const mortarBags   = Math.ceil(blocks / BLOCKS_PER_MORTAR_BAG);
    const wallAreaSqM  = Math.round(wallAreaSqFt * 0.092903 * 100) / 100;

    return {
      blocks,
      mortar_bags: mortarBags,
      wall_area_sqft: Math.round(wallAreaSqFt * 10) / 10,
      wall_area_sqm: wallAreaSqM,
    };
  } else {
    const lengthM   = Number(inputs.length_m ?? 3);
    const heightM   = Number(inputs.height_m ?? 2.4);
    const wastePct  = Number(inputs.waste_pct ?? 5) / 100;

    const wallAreaSqM  = lengthM * heightM;
    const blocksNet    = wallAreaSqM * BLOCKS_PER_SQM;
    const blocks       = Math.ceil(blocksNet * (1 + wastePct));
    const mortarBags   = Math.ceil(blocks / BLOCKS_PER_MORTAR_BAG);
    const wallAreaSqFt = Math.round(wallAreaSqM / 0.092903 * 10) / 10;

    return {
      blocks,
      mortar_bags: mortarBags,
      wall_area_sqm: Math.round(wallAreaSqM * 100) / 100,
      wall_area_sqft: wallAreaSqFt,
    };
  }
}

export const concreteBlockCalculator: CalculatorConfig = {
  slug: 'concrete-block-calculator',
  name: 'Concrete Block Calculator',
  category: 'concrete',
  description:
    'Calculate how many concrete blocks (CMU) you need for any wall. Enter wall length and height to get block count, mortar bags, and wall area — with adjustable waste factor.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'length_ft',
      label: 'Wall Length',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 5000,
      step: 1,
      defaultValue: 20,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'length_in',
      label: 'Wall Length (in)',
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
      id: 'height_ft',
      label: 'Wall Height',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 8,
      required: true,
      onlyIn: 'imperial',
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
      id: 'waste_pct',
      label: 'Waste %',
      type: 'number',
      unit: '%',
      min: 0,
      max: 30,
      step: 1,
      defaultValue: 5,
      onlyIn: 'imperial',
      helpText: 'Add 5–10% for cuts, breakage, and irregular corners.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Wall Length',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 1500,
      step: 0.1,
      defaultValue: 6,
      defaultValueMetric: 6,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'height_m',
      label: 'Wall Height',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 30,
      step: 0.1,
      defaultValue: 2.4,
      defaultValueMetric: 2.4,
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
      defaultValue: 5,
      onlyIn: 'metric',
      helpText: 'Add 5–10% for cuts, breakage, and irregular corners.',
    },
  ],
  outputs: [
    {
      id: 'blocks',
      label: 'Concrete Blocks',
      unit: 'blocks',
      format: 'number',
      primary: true,
      description: 'Standard 8×8×16 in CMU, includes waste factor',
    },
    {
      id: 'mortar_bags',
      label: 'Mortar Bags (60 lb)',
      unit: 'bags',
      format: 'number',
      description: 'Type S mortar at 3/8 in joints, ~35 blocks per bag',
    },
    {
      id: 'wall_area_sqft',
      label: 'Wall Area',
      unit: 'ft²',
      format: 'area',
      description: 'Gross wall face area before deductions',
    },
    {
      id: 'wall_area_sqm',
      label: 'Wall Area',
      unit: 'm²',
      format: 'area',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'concrete-slab-calculator',
    'retaining-wall-calculator',
    'concrete-column-calculator',
    'rebar-calculator',
  ],
  seo: {
    title: 'Concrete Block Calculator — CMU Wall Estimator',
    description:
      'Free concrete block calculator — enter wall length and height to get the exact number of CMU blocks, mortar bags, and wall area for your project. Includes waste factor.',
    h1: 'Concrete Block Calculator',
    focusKeyword: 'concrete block calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate number of CMU concrete blocks',
      'Calculate mortar bags required',
      'Calculate wall area in square feet and square meters',
      'Adjustable waste percentage',
      'Imperial and metric support',
      'Standard 8×8×16 in block sizing',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate wall area',
      formula: 'Wall Area (ft²) = Length (ft) × Height (ft)',
      description: 'Gross face area — subtract door and window openings if needed',
    },
    {
      label: 'Calculate blocks needed (net)',
      formula: 'Blocks = Wall Area (ft²) × 1.125',
      description:
        'A standard 8×16 in nominal CMU covers 0.889 ft² of wall face including the mortar joint. 1 ÷ 0.889 = 1.125 blocks per sq ft',
    },
    {
      label: 'Apply waste factor',
      formula: 'Blocks (with waste) = ⌈Blocks × (1 + Waste %)⌉',
      description: 'Round up — you cannot order a fraction of a block',
    },
    {
      label: 'Calculate mortar bags',
      formula: 'Mortar bags = ⌈Blocks ÷ 35⌉',
      description:
        'One 60 lb bag of Type S mortar covers approximately 35 standard blocks at a 3/8 in joint thickness',
    },
  ],
  faq: [
    {
      question: 'How many concrete blocks do I need per square foot?',
      answer:
        'Standard 8×16 in nominal CMU blocks require 1.125 blocks per square foot of wall face. The formula accounts for the 3/8 in mortar joint — each block effectively covers 8.375 in × 16.375 in of wall area. For 100 sq ft of wall: 100 × 1.125 = 113 blocks before waste.',
    },
    {
      question: 'What size are standard concrete blocks?',
      answer:
        'The most common CMU is the 8×8×16 in nominal block (actual dimensions 7.625×7.625×15.625 in). The 3/8 in mortar joint makes up the difference to the nominal size. Other common sizes include 4×8×16 in (partition walls), 6×8×16 in, and 12×8×16 in for thicker structural walls. All standard sizes share the same 8×16 in nominal face, so this calculator applies to all of them.',
    },
    {
      question: 'How much mortar do I need for a block wall?',
      answer:
        'A 60 lb bag of Type S or Type N mortar covers approximately 35 standard CMU blocks at a 3/8 in joint. For every 35 blocks, budget one bag of mortar. A 20 ft × 8 ft wall needs about 180 blocks (with 5% waste) and approximately 6 bags of mortar. Always buy an extra bag — mortar consistency varies and running short mid-course causes joint defects.',
    },
    {
      question: 'Should I deduct for windows and doors?',
      answer:
        'Yes — for accurate results, calculate the gross wall area first, then subtract the area of each opening (width × height). Re-run the calculator with the net area, or calculate each section of solid wall separately and add the totals. Keep the cut blocks from openings — they can often be reused at corners or as half-blocks.',
    },
    {
      question: 'What waste factor should I use for a block wall?',
      answer:
        '5% is standard for straightforward rectangular walls. Increase to 10% for walls with many corners, curves, openings, or angled cuts. Blocks cut for corners and openings often cannot be reused elsewhere, so err on the side of ordering slightly more rather than waiting for a second delivery.',
    },
    {
      question: 'How many courses of block make 8 feet?',
      answer:
        'At 8 in nominal height per course (7.625 in block + 3/8 in mortar joint), exactly 12 courses equal 8 ft (96 in ÷ 8 in = 12). Common wall heights: 4 ft = 6 courses, 6 ft = 9 courses, 8 ft = 12 courses. If your wall height is not a multiple of 8 in, plan for a custom-cut top course.',
    },
    {
      question: 'Do I need rebar in a concrete block wall?',
      answer:
        'Most structural block walls require vertical rebar in the cores filled with grout, especially in seismic zones or for walls taller than 4 ft. Horizontal rebar (or joint reinforcement wire) is placed every other course for additional strength. Retaining walls, basement walls, and any wall supporting load almost always require reinforcement. Check your local building code — unreinforced CMU is generally only acceptable for small garden or landscape walls.',
    },
    {
      question: 'How much does a concrete block wall cost?',
      answer:
        'CMU blocks cost $2–$4 each at hardware stores or $1.50–$2.50 in bulk from a masonry supplier. A 20 ft × 8 ft wall (≈180 blocks) costs $360–$720 in block material alone. Add mortar ($8–$12 per bag × 6 bags ≈ $60), rebar if required, and labor (professional masons charge $15–$25 per sq ft installed). DIY block laying is feasible for experienced builders — expect 50–80 blocks per day for a first project.',
    },
  ],
  orderCallout: true,
  wasteFactor: {
    default: 5,
    range: '3–5%',
    notes: 'CMU blocks have very low waste. Order 5% extra to cover broken blocks and end cuts.',
  },
  references: [
    {
      title: 'TMS 402 – Building Code Requirements for Masonry Structures',
      organization: 'The Masonry Society',
      url: 'https://masonrysociety.org/',
    },
  ],
};
