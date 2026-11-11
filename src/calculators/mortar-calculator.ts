import { ceilQuantity } from './rounding';
import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

const JOINT_FACTORS: Record<string, number> = {
  '3/8in_brick':  0.025,
  '1/2in_brick':  0.033,
  '3/8in_block':  0.012,
  '1/2in_block':  0.016,
  '3/4in_stone':  0.060,
  'custom':        0.025,
};

const UNIT_COUNTS: Record<string, number> = {
  '3/8in_brick':  6.75,
  '1/2in_brick':  6.55,
  '3/8in_block':  1.125,
  '1/2in_block':  1.10,
  '3/4in_stone':  4.0,
  'custom':        6.75,
};

const BAG_YIELDS: Record<string, number> = {
  '60lb':   0.45,
  '80lb':   0.60,
  'custom': 0.60,
};

const UNIT_TYPE_OPTIONS = [
  { value: '3/8in_brick', label: 'Standard brick – 3/8″ joints (illustrative)' },
  { value: '1/2in_brick', label: 'Standard brick – 1/2″ joints (illustrative)' },
  { value: '3/8in_block', label: 'CMU block – 3/8″ joints (illustrative)' },
  { value: '1/2in_block', label: 'CMU block – 1/2″ joints (illustrative)' },
  { value: '3/4in_stone', label: 'Stone/rubble – 3/4″ joints (illustrative)' },
  { value: 'custom',      label: 'Custom joint factor' },
];

const BAG_SIZE_OPTIONS = [
  { value: '60lb',   label: '60 lb bag (0.45 ft³) - unverified yield' },
  { value: '80lb',   label: '80 lb bag (0.60 ft³) - unverified yield' },
  { value: 'custom', label: 'Custom yield' },
];

export function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  const unitType    = String(inputs.unit_type ?? '3/8in_brick');
  const jointFactor = unitType === 'custom'
    ? Number(inputs.custom_joint_factor ?? 0.025)
    : (JOINT_FACTORS[unitType] ?? 0.025);
  const unitCount   = UNIT_COUNTS[unitType] ?? 6.75;

  const bagSizeKey  = String(inputs.bag_size ?? '80lb');
  const yieldPerBag = bagSizeKey === 'custom'
    ? Number(inputs.custom_yield ?? 0.60)
    : (BAG_YIELDS[bagSizeKey] ?? 0.60);

  const wastePct = Number(inputs.waste_pct ?? 15) / 100;

  let wall_area_sqft: number;
  let wall_area_sqm: number;

  if (unitSystem === 'imperial') {
    const lengthFt = Number(inputs.length_ft ?? 0) + Number(inputs.length_in ?? 0) / 12;
    const heightFt = Number(inputs.height_ft ?? 0) + Number(inputs.height_in ?? 0) / 12;

    if (lengthFt <= 0 || heightFt <= 0 || yieldPerBag <= 0) {
      return { wall_area_sqft: 0, wall_area_sqm: 0, unit_count: 0, mortar_cuft: 0, mortar_cuyd: 0, mortar_cum: 0, net_bags: 0, bags_required: 0 };
    }

    wall_area_sqft = lengthFt * heightFt;
    wall_area_sqm  = wall_area_sqft * 0.092903;
  } else {
    const lengthM = Number(inputs.length_m ?? 0);
    const heightM = Number(inputs.height_m ?? 0);

    if (lengthM <= 0 || heightM <= 0 || yieldPerBag <= 0) {
      return { wall_area_sqft: 0, wall_area_sqm: 0, unit_count: 0, mortar_cuft: 0, mortar_cuyd: 0, mortar_cum: 0, net_bags: 0, bags_required: 0 };
    }

    const lengthFt = lengthM / 0.3048;
    const heightFt = heightM / 0.3048;
    wall_area_sqft = lengthFt * heightFt;
    wall_area_sqm  = lengthM * heightM;
  }

  const mortar_cuft_net = wall_area_sqft * jointFactor;
  const mortar_cuft     = mortar_cuft_net * (1 + wastePct);
  const mortar_cuyd     = mortar_cuft / 27;
  const mortar_cum      = mortar_cuft * 0.0283168;
  const unit_count      = ceilQuantity(wall_area_sqft * unitCount * (1 + wastePct));
  const bags_required   = ceilQuantity(mortar_cuft / yieldPerBag);
  const net_bags        = ceilQuantity(mortar_cuft_net / yieldPerBag);

  return {
    wall_area_sqft: Math.round(wall_area_sqft * 100)  / 100,
    wall_area_sqm:  Math.round(wall_area_sqm  * 100)  / 100,
    unit_count,
    mortar_cuft:    Math.round(mortar_cuft    * 100)  / 100,
    mortar_cuyd:    Math.round(mortar_cuyd    * 1000) / 1000,
    mortar_cum:     Math.round(mortar_cum     * 1000) / 1000,
    net_bags,
    bags_required,
  };
}

export const mortarCalculator: CalculatorConfig = {
  slug: 'mortar-calculator',
  name: 'Mortar Calculator',
  category: 'masonry',
  description:
    'Calculate mortar volume, bags required, and unit counts for brick, block, stone, and masonry walls. Accounts for joint thickness, unit size, and waste factor.',
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
      helpText: 'Length (run) of the wall.',
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
      id: 'height_ft',
      label: 'Height',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 100,
      step: 1,
      defaultValue: 8,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Height of the wall.',
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
      id: 'unit_type',
      label: 'Unit Type',
      type: 'select',
      options: UNIT_TYPE_OPTIONS,
      defaultValue: '3/8in_brick',
      required: true,
      onlyIn: 'imperial',
      helpText: 'Select your masonry unit and joint size. This determines the joint factor used to calculate mortar volume.',
    },
    {
      id: 'custom_joint_factor',
      label: 'Custom Joint Factor',
      type: 'number',
      unit: 'ft³/ft²',
      min: 0.005,
      max: 0.2,
      step: 0.001,
      defaultValue: 0.025,
      onlyIn: 'imperial',
      helpText: 'Only used with "Custom" selection. Mortar volume per sq ft of wall face (typically 0.01–0.08).',
    },
    {
      id: 'bag_size',
      label: 'Bag Size',
      type: 'select',
      options: BAG_SIZE_OPTIONS,
      defaultValue: '80lb',
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'custom_yield',
      label: 'Custom Bag Yield',
      type: 'number',
      unit: 'ft³/bag',
      min: 0.1,
      max: 5,
      step: 0.01,
      defaultValue: 0.60,
      onlyIn: 'imperial',
      helpText: 'Enter mixed yield from the selected product data sheet; preset bag yields are unverified assumptions.',
    },
    {
      id: 'waste_pct',
      label: 'Waste Factor',
      type: 'number',
      unit: '%',
      min: 0,
      max: 30,
      step: 5,
      defaultValue: 15,
      onlyIn: 'imperial',
      helpText: 'Add 15% for typical masonry work; more for complex patterns or stone.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Length',
      type: 'number',
      unit: 'm',
      min: 0.3,
      max: 300,
      step: 0.1,
      defaultValue: 6,
      defaultValueMetric: 6,
      required: true,
      onlyIn: 'metric',
      helpText: 'Wall length in metres.',
    },
    {
      id: 'height_m',
      label: 'Height',
      type: 'number',
      unit: 'm',
      min: 0.3,
      max: 30,
      step: 0.1,
      defaultValue: 2.4,
      defaultValueMetric: 2.4,
      required: true,
      onlyIn: 'metric',
      helpText: 'Wall height in metres.',
    },
    {
      id: 'unit_type',
      label: 'Unit Type',
      type: 'select',
      options: UNIT_TYPE_OPTIONS,
      defaultValue: '3/8in_brick',
      required: true,
      onlyIn: 'metric',
      helpText: 'Select your masonry unit and joint size. This determines the joint factor used to calculate mortar volume.',
    },
    {
      id: 'custom_joint_factor',
      label: 'Custom Joint Factor',
      type: 'number',
      unit: 'ft³/ft²',
      min: 0.005,
      max: 0.2,
      step: 0.001,
      defaultValue: 0.025,
      onlyIn: 'metric',
      helpText: 'Custom joint factor in ft³ per ft² (used internally even in metric mode).',
    },
    {
      id: 'bag_size',
      label: 'Bag Size',
      type: 'select',
      options: BAG_SIZE_OPTIONS,
      defaultValue: '80lb',
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'custom_yield',
      label: 'Custom Bag Yield',
      type: 'number',
      unit: 'ft³/bag',
      min: 0.1,
      max: 5,
      step: 0.01,
      defaultValue: 0.60,
      onlyIn: 'metric',
      helpText: 'Enter mixed yield from the selected product data sheet; preset bag yields are unverified assumptions.',
    },
    {
      id: 'waste_pct',
      label: 'Waste Factor',
      type: 'number',
      unit: '%',
      min: 0,
      max: 30,
      step: 5,
      defaultValue: 15,
      onlyIn: 'metric',
      helpText: 'Add 15% for typical masonry work; more for complex patterns or stone.',
    },
  ],
  outputs: [
    {
      id: 'wall_area_sqft',
      label: 'Wall Area',
      unit: 'ft²',
      format: 'area',
      primary: true,
    },
    {
      id: 'wall_area_sqm',
      label: 'Wall Area',
      unit: 'm²',
      format: 'area',
    },
    {
      id: 'unit_count',
      label: 'Estimated Units',
      unit: 'units',
      format: 'number',
      description: 'Bricks, blocks, or stones (with waste)',
    },
    {
      id: 'mortar_cuft',
      label: 'Estimated Mortar Volume',
      unit: 'ft³',
      format: 'volume',
      description: 'Adjusted mortar volume including waste',
    },
    {
      id: 'mortar_cuyd',
      label: 'Estimated Mortar Volume',
      unit: 'yd³',
      format: 'volume',
    },
    {
      id: 'mortar_cum',
      label: 'Estimated Mortar Volume',
      unit: 'm³',
      format: 'volume',
    },
    {
      id: 'net_bags',
      label: 'Illustrative Bags (net)',
      unit: 'bags',
      format: 'number',
    },
    {
      id: 'bags_required',
      label: 'Illustrative Bag Estimate',
      unit: 'bags',
      format: 'number',
      description: 'Assumption-based estimate including waste; verify selected product coverage before ordering',
    },
  ],
  disclaimer: 'Assumption-based estimate, not a manufacturer coverage or engineering specification. Preset bag yields are unverified. Use Custom with the selected product mixed yield before ordering; verify geometry and waste separately. Mortar joint factors and unit counts are illustrative presets; Custom joint factor does not customize the separate unit-count assumption.',
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'concrete-block-calculator',
    'concrete-bags-calculator',
    'retaining-wall-calculator',
    'concrete-slab-calculator',
  ],
  seo: {
    title: 'Mortar Calculator – Estimate Mortar Mix & Bags Required',
    description:
      'Calculate mortar volume, bags required, and material estimates for brick, block, stone, and masonry construction projects.',
    h1: 'Mortar Calculator',
    focusKeyword: 'mortar calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate mortar volume for brick, block, and stone walls',
      'Pre-set joint factors for standard brick, CMU block, and stone',
      'Estimate unit counts for bricks, blocks, or stones',
      'Bag count for 60 lb and 80 lb mortar bags',
      'Adjustable waste factor',
      'Imperial and metric unit systems',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate wall area',
      formula: 'Wall Area = Length × Height',
      description:
        'Measure the face area of the wall in square feet. For openings like windows and doors, you may deduct them if they are significant — for small openings, leaving them in provides a useful safety buffer.',
    },
    {
      label: 'Apply joint factor',
      formula: 'Mortar Volume (net) = Wall Area × Joint Factor',
      description:
        'The joint factor is cubic feet of mortar per square foot of wall face. The listed factors are illustrative, not verified manufacturer consumption. Use Custom with a factor established for the actual unit dimensions, bedding and joints.',
    },
    {
      label: 'Apply waste factor',
      formula: 'Adjusted Mortar = Net Mortar × (1 + Waste %)',
      description:
        'Use 15% for standard masonry work. Increase to 20% or more for stone, irregular units, complex patterns, or when mixing by hand where spillage is more likely.',
    },
    {
      label: 'Calculate bags required',
      formula: 'Bags = ⌈Adjusted Mortar ÷ Yield per Bag⌉',
      description:
        'Preset yields are unverified assumptions. Enter the selected product mixed yield using the custom option; bag weight alone does not establish yield. Round the resulting order up to whole bags.',
    },
    {
      label: 'Estimate unit count',
      formula: 'Units = ⌈Wall Area × Units per ft²⌉',
      description:
        'Standard modular brick ≈ 6.75 bricks/ft² with 3/8″ joints. CMU 8×8×16 block ≈ 1.125 blocks/ft². The unit count includes the waste factor so you order enough material in one trip.',
    },
  ],
  faq: [
    {
      question: 'How much mortar do I need per square foot of brick wall?',
      answer:
        'The illustrative brick preset assumes 0.025 ft3 per square foot. Under that assumption, a 100 ft2 wall needs 2.5 ft3 net. Confirm the joint-volume factor from actual masonry dimensions and bedding before using it to order.',
    },
    {
      question: 'How many bags of mortar do I need?',
      answer:
        'Illustrative arithmetic only: 100 ft2 at 0.025 ft3/ft2 gives 2.5 ft3 net. At an assumed 0.60 ft3/bag, ceiling(2.5/0.60) is 5 bags. Adding 15% gives 2.875 ft3 and still 5 bags. These assumptions require product and geometry confirmation.',
    },
    {
      question: 'What type of mortar should I use?',
      answer:
        'Select mortar type from the project specification and the masonry/product requirements. Strength alone does not determine compatibility; this calculator does not select a suitable structural or restoration mortar.',
    },
    {
      question: 'How thick should mortar joints be?',
      answer:
        'Use the joint thickness specified for the selected masonry system. Preset thickness labels identify estimating assumptions, not permission to change the construction detail.',
    },
    {
      question: 'How do I mix mortar?',
      answer:
        'Follow the selected mortar product instructions for mixing water, mixing time and working time. Site-mixed mortar must follow the approved project specification; the calculator does not supply a mix design.',
    },
    {
      question: 'How many bricks per square foot?',
      answer:
        'Standard modular brick (3-5/8″ × 2-1/4″ × 7-5/8″) lays at approximately 6.75 bricks per square foot with 3/8″ mortar joints. With 1/2″ joints the count drops slightly to about 6.55 bricks/ft².',
    },
    {
      question: 'How much does mortar cost?',
      answer:
        'Use your supplier price and verified product yield for an order estimate. The calculator preset does not establish a universal bag count or current material price.',
    },
    {
      question: 'What is the difference between mortar and grout?',
      answer:
        'Mortar is used to bond masonry units together — it fills the joints between bricks, blocks, or stones and provides structural adhesion. Grout fills cavities inside CMU cores or the gaps in tile installations. The two mixes have different proportions and are not interchangeable.',
    },
  ],
  orderCallout: { hint: 'Illustrative area allowance only; not a verified material purchase quantity.' },
  wasteFactor: {
    default: 15,
    range: '10–20%',
    notes: 'Standard block work: 10–12%. Irregular stone or rubble masonry: up to 20%.',
  },
  references: [
    {
      title: 'ASTM C270 – Standard Specification for Mortar for Unit Masonry',
      organization: 'ASTM International',
      url: 'https://www.astm.org/',
    },
    {
      title: 'TMS 402 – Building Code Requirements for Masonry Structures',
      organization: 'The Masonry Society',
      url: 'https://masonrysociety.org/',
    },
  ],
};
