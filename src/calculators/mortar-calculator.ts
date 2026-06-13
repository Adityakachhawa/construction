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
  { value: '3/8in_brick', label: 'Standard brick – 3/8″ joints' },
  { value: '1/2in_brick', label: 'Standard brick – 1/2″ joints' },
  { value: '3/8in_block', label: 'CMU block – 3/8″ joints' },
  { value: '1/2in_block', label: 'CMU block – 1/2″ joints' },
  { value: '3/4in_stone', label: 'Stone/rubble – 3/4″ joints' },
  { value: 'custom',      label: 'Custom joint factor' },
];

const BAG_SIZE_OPTIONS = [
  { value: '60lb',   label: '60 lb bag (0.45 ft³)' },
  { value: '80lb',   label: '80 lb bag (0.60 ft³)' },
  { value: 'custom', label: 'Custom yield' },
];

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
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

    const lengthFt = lengthM * 3.28084;
    const heightFt = heightM * 3.28084;
    wall_area_sqft = lengthFt * heightFt;
    wall_area_sqm  = lengthM * heightM;
  }

  const mortar_cuft_net = wall_area_sqft * jointFactor;
  const mortar_cuft     = mortar_cuft_net * (1 + wastePct);
  const mortar_cuyd     = mortar_cuft / 27;
  const mortar_cum      = mortar_cuft * 0.0283168;
  const unit_count      = Math.ceil(wall_area_sqft * unitCount * (1 + wastePct));
  const bags_required   = Math.ceil(mortar_cuft / yieldPerBag);
  const net_bags        = Math.ceil(mortar_cuft_net / yieldPerBag);

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
      helpText: 'Yield per bag in cubic feet. Check bag label.',
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
      helpText: 'Yield per bag in cubic feet. Check bag label.',
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
      label: 'Units Required',
      unit: 'units',
      format: 'number',
      description: 'Bricks, blocks, or stones (with waste)',
    },
    {
      id: 'mortar_cuft',
      label: 'Mortar Volume',
      unit: 'ft³',
      format: 'volume',
      description: 'Adjusted mortar volume including waste',
    },
    {
      id: 'mortar_cuyd',
      label: 'Mortar Volume',
      unit: 'yd³',
      format: 'volume',
    },
    {
      id: 'mortar_cum',
      label: 'Mortar Volume',
      unit: 'm³',
      format: 'volume',
    },
    {
      id: 'net_bags',
      label: 'Bags (net)',
      unit: 'bags',
      format: 'number',
    },
    {
      id: 'bags_required',
      label: 'Bags Required',
      unit: 'bags',
      format: 'number',
      description: 'Including waste factor — order this many',
    },
  ],
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
        'The joint factor represents cubic feet of mortar per square foot of wall face. It varies by unit type and joint width: standard 3/8″ brick ≈ 0.025 ft³/ft², CMU block ≈ 0.012 ft³/ft², stone with 3/4″ joints ≈ 0.060 ft³/ft². Use the Custom option for unusual specs.',
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
        'An 80 lb bag of mortar mix yields approximately 0.60 ft³; a 60 lb bag yields 0.45 ft³. Always round up — you cannot use a partial bag, and running short mid-course causes weak joints.',
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
        'For standard brick with 3/8″ joints, plan on approximately 0.025 ft³ of mortar per square foot of wall face. A 100 ft² wall needs about 2.5 ft³ of net mortar — roughly 5 bags of 80 lb mix before waste.',
    },
    {
      question: 'How many bags of mortar do I need?',
      answer:
        'An 80 lb bag yields 0.60 ft³. For a 100 ft² standard brick wall: 2.5 ft³ net ÷ 0.60 = 5 bags net. With 15% waste that rounds up to 6 bags. Use this calculator to get an exact count for your wall dimensions.',
    },
    {
      question: 'What type of mortar should I use?',
      answer:
        'Type S is recommended for below-grade and exterior applications where strength and moisture resistance matter. Type N is the standard general-purpose exterior mortar. Type M is used for load-bearing and below-grade heavy-duty work. Type O is for interior non-load-bearing applications only.',
    },
    {
      question: 'How thick should mortar joints be?',
      answer:
        '3/8″ is the standard joint thickness for both brick and CMU block. A 1/2″ joint is also acceptable for both. Stone joints vary widely — 1/2″ to 3/4″ is typical for ashlar; rubble stone may use joints up to 1″ thick.',
    },
    {
      question: 'How do I mix mortar?',
      answer:
        'Pre-mixed bags: add water per the label — typically 4–5 quarts per 80 lb bag. Site-mixed Type N mortar: 1 part Portland cement + 1 part hydrated lime + 6 parts masonry sand. Mix dry first, then add water gradually until the mix holds its shape but slides cleanly off a trowel.',
    },
    {
      question: 'How many bricks per square foot?',
      answer:
        'Standard modular brick (3-5/8″ × 2-1/4″ × 7-5/8″) lays at approximately 6.75 bricks per square foot with 3/8″ mortar joints. With 1/2″ joints the count drops slightly to about 6.55 bricks/ft².',
    },
    {
      question: 'How much does mortar cost?',
      answer:
        'A standard 80 lb bag of mortar mix typically costs $8–$12 at home improvement stores. A 100 ft² brick wall needs roughly 6 bags with waste, putting mortar material cost at $50–$75. Labour and additional materials (brick, block) are separate.',
    },
    {
      question: 'What is the difference between mortar and grout?',
      answer:
        'Mortar is used to bond masonry units together — it fills the joints between bricks, blocks, or stones and provides structural adhesion. Grout fills cavities inside CMU cores or the gaps in tile installations. The two mixes have different proportions and are not interchangeable.',
    },
  ],
};
