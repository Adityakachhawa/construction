import { blockMortar, blockMortarInputs } from './block-mortar';
import { ceilQuantity } from './rounding';
import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

// Standard CMU: 8"Ã—16" nominal face = 128 inÂ² = 0.8889 ftÂ²
// 1 ftÂ² / 0.8889 ftÂ² = 1.125 blocks per sq ft
const BLOCKS_PER_SQFT = 1.125;
// Standard 200Ã—400 mm nominal face = 0.08 mÂ² â†’ 12.5 blocks per mÂ²
const BLOCKS_PER_SQM = 12.5;
// 80 lb bag concrete yields ~0.60 ftÂ³ (for core fill)


export function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const lengthFt  = Number(inputs.length_ft ?? 10) + Number(inputs.length_in ?? 0) / 12;
    const heightFt  = Number(inputs.height_ft ?? 8)  + Number(inputs.height_in  ?? 0) / 12;
    const wastePct  = Number(inputs.waste_pct ?? 5) / 100;

    const wallAreaSqFt = lengthFt * heightFt;
    const blocksNet    = wallAreaSqFt * BLOCKS_PER_SQFT;
    const blocks       = ceilQuantity(blocksNet * (1 + wastePct));

    const wallAreaSqM  = Math.round(wallAreaSqFt * 0.092903 * 100) / 100;

    return {
      blocks,
      ...blockMortar(blocks, inputs),
      wall_area_sqft: Math.round(wallAreaSqFt * 10) / 10,
      wall_area_sqm: wallAreaSqM,
    };
  } else {
    const lengthM   = Number(inputs.length_m ?? 3);
    const heightM   = Number(inputs.height_m ?? 2.4);
    const wastePct  = Number(inputs.waste_pct ?? 5) / 100;

    const wallAreaSqM  = lengthM * heightM;
    const blocksNet    = wallAreaSqM * BLOCKS_PER_SQM;
    const blocks       = ceilQuantity(blocksNet * (1 + wastePct));

    const wallAreaSqFt = Math.round(wallAreaSqM / 0.092903 * 10) / 10;

    return {
      blocks,
      ...blockMortar(blocks, inputs),
      wall_area_sqm: Math.round(wallAreaSqM * 100) / 100,
      wall_area_sqft: wallAreaSqFt,
    };
  }
}

export const concreteBlockCalculator: CalculatorConfig = /* @__PURE__ */ (() => ({
  slug: 'concrete-block-calculator',
  name: 'Concrete Block Calculator',
  category: 'concrete',
  description:
    'Calculate how many concrete blocks (CMU) you need for any wall. Enter wall length and height to get block count, mortar bags, and wall area â€” with adjustable waste factor.',
  inputs: [
    ...blockMortarInputs,
    // â”€â”€ Imperial â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      helpText: 'Add 5â€“10% for cuts, breakage, and irregular corners.',
    },
    // â”€â”€ Metric â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      helpText: 'Add 5â€“10% for cuts, breakage, and irregular corners.',
    },
  ],
  outputs: [
    {
      id: 'blocks',
      label: 'Concrete Blocks',
      unit: 'blocks',
      format: 'number',
      primary: true,
      description: 'Standard 8Ã—8Ã—16 in CMU, includes waste factor',
    },
    {
      id: 'mortar_bags',
      label: 'Mortar Bags (selected product)',
      availableWhen: 'mortar_ready',
      unit: 'bags',
      format: 'number',
      description: 'Requires valid product coverage and matching bag/masonry specifications in Advanced',
    },
    {
      id: 'wall_area_sqft',
      label: 'Wall Area',
      unit: 'ftÂ²',
      format: 'area',
      description: 'Gross wall face area before deductions',
    },
    {
      id: 'wall_area_sqm',
      label: 'Wall Area',
      unit: 'mÂ²',
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
    title: 'Concrete Block Calculator â€” CMU Wall Estimator',
    description:
      'Free concrete block calculator â€” enter wall length and height to get the exact number of CMU blocks, mortar bags, and wall area for your project. Includes waste factor.',
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
      'Standard 8Ã—8Ã—16 in block sizing',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate wall area',
      formula: 'Wall Area (ftÂ²) = Length (ft) Ã— Height (ft)',
      description: 'Gross face area â€” subtract door and window openings if needed',
    },
    {
      label: 'Calculate blocks needed (net)',
      formula: 'Blocks = Wall Area (ftÂ²) Ã— 1.125',
      description:
        'A standard 8Ã—16 in nominal CMU covers 0.889 ftÂ² of wall face including the mortar joint. 1 Ã· 0.889 = 1.125 blocks per sq ft',
    },
    {
      label: 'Apply waste factor',
      formula: 'Blocks (with waste) = âŒˆBlocks Ã— (1 + Waste %)âŒ‰',
      description: 'Round up â€” you cannot order a fraction of a block',
    },
    {
      label: 'Calculate mortar bags',
      formula: 'Bags = ceiling(Block order x (1 + extra mortar allowance) / product coverage); or use verified per-block consumption / mixed yield',
      description:
        'Enter product coverage or verified consumption and mixed yield in Advanced. Block geometry records the coverage conditions; it does not change the nominal block count.',
    },
  ],
  faq: [
    {
      question: 'How many concrete blocks do I need per square foot?',
      answer:
        'A nominal 8 by 16 inch block face already includes the joint allowance: 128 square inches, or 8/9 square foot. This gives 1.125 blocks per square foot before cuts and waste; do not add the joint a second time.',
    },
    {
      question: 'What size are standard concrete blocks?',
      answer:
        'The most common CMU is the 8Ã—8Ã—16 in nominal block (actual dimensions 7.625Ã—7.625Ã—15.625 in). The 3/8 in mortar joint makes up the difference to the nominal size. Other common sizes include 4Ã—8Ã—16 in (partition walls), 6Ã—8Ã—16 in, and 12Ã—8Ã—16 in for thicker structural walls. All standard sizes share the same 8Ã—16 in nominal face, so this calculator applies to all of them.',
    },
    {
      question: 'How much mortar do I need for a block wall?',
      answer:
        'Mortar bags require product specifications. Enter blocks per bag or mixed yield with verified consumption per block, bag mass, actual dimensions, joints and bedding. The parent and dimension pages use the same calculation. Core grout is separate.',
    },
    {
      question: 'Should I deduct for windows and doors?',
      answer:
        'Yes â€” for accurate results, calculate the gross wall area first, then subtract the area of each opening (width Ã— height). Re-run the calculator with the net area, or calculate each section of solid wall separately and add the totals. Keep the cut blocks from openings â€” they can often be reused at corners or as half-blocks.',
    },
    {
      question: 'What waste factor should I use for a block wall?',
      answer:
        '5% is standard for straightforward rectangular walls. Increase to 10% for walls with many corners, curves, openings, or angled cuts. Blocks cut for corners and openings often cannot be reused elsewhere, so err on the side of ordering slightly more rather than waiting for a second delivery.',
    },
    {
      question: 'How many courses of block make 8 feet?',
      answer:
        'At 8 in nominal height per course (7.625 in block + 3/8 in mortar joint), exactly 12 courses equal 8 ft (96 in Ã· 8 in = 12). Common wall heights: 4 ft = 6 courses, 6 ft = 9 courses, 8 ft = 12 courses. If your wall height is not a multiple of 8 in, plan for a custom-cut top course.',
    },
    {
      question: 'Do I need rebar in a concrete block wall?',
      answer:
        'Most structural block walls require vertical rebar in the cores filled with grout, especially in seismic zones or for walls taller than 4 ft. Horizontal rebar (or joint reinforcement wire) is placed every other course for additional strength. Retaining walls, basement walls, and any wall supporting load almost always require reinforcement. Check your local building code â€” unreinforced CMU is generally only acceptable for small garden or landscape walls.',
    },
    {
      question: 'How much does a concrete block wall cost?',
      answer:
        'CMU blocks cost $2â€“$4 each at hardware stores or $1.50â€“$2.50 in bulk from a masonry supplier. A 20 ft Ã— 8 ft wall (â‰ˆ180 blocks) costs $360â€“$720 in block material alone. Add mortar ($8â€“$12 per bag Ã— 6 bags â‰ˆ $60), rebar if required, and labor (professional masons charge $15â€“$25 per sq ft installed). DIY block laying is feasible for experienced builders â€” expect 50â€“80 blocks per day for a first project.',
    },
  ],
  orderCallout: true,
  primaryIncludesWaste: true,
  wasteFactor: {
    default: 5,
    range: '3â€“5%',
    notes: 'CMU blocks have very low waste. Order 5% extra to cover broken blocks and end cuts.',
  },
  references: [
    {
      title: 'TMS 402 â€“ Building Code Requirements for Masonry Structures',
      organization: 'The Masonry Society',
      url: 'https://masonrysociety.org/',
    },
  ],
  presets: [
    {
      label: '10Ã—4 Garden Wall',
      values: { length_ft: 10, length_in: 0, height_ft: 4, height_in: 0, waste_pct: 5 },
      unit: 'imperial',
    },
    {
      label: '20Ã—6 Retaining Wall',
      values: { length_ft: 20, length_in: 0, height_ft: 6, height_in: 0, waste_pct: 5 },
      unit: 'imperial',
    },
    {
      label: '30Ã—8 Foundation Wall',
      values: { length_ft: 30, length_in: 0, height_ft: 8, height_in: 0, waste_pct: 5 },
      unit: 'imperial',
    },
    {
      label: '40Ã—8 Garage Perimeter',
      values: { length_ft: 40, length_in: 0, height_ft: 8, height_in: 0, waste_pct: 5 },
      unit: 'imperial',
    },
  ],
  referenceTable: {
    title: 'Standard CMU Block & Mortar Estimation Table',
    description: 'Calculations based on standard 8Ã—8Ã—16 inch hollow concrete masonry units (1.125 blocks per sq ft) with 3/8" mortar joints:',
    headers: ['Wall Dimensions (ft)', 'Wall Area (sq ft)', 'Net CMU Blocks', 'Order (+5% Waste)', 'Mortar Bags (product required)'],
    rows: [
      ['10â€² Ã— 4â€² Wall', '40', '45', '48', 'Product required'],
      ['20â€² Ã— 4â€² Wall', '80', '90', '95', 'Product required'],
      ['20â€² Ã— 6â€² Wall', '120', '135', '142', 'Product required'],
      ['30â€² Ã— 6â€² Wall', '180', '203', '213', 'Product required'],
      ['40â€² Ã— 8â€² Wall', '320', '360', '378', 'Product required'],
      ['50â€² Ã— 8â€² Wall', '400', '450', '473', 'Product required'],
    ],
  },
}))();
