import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

const BAG_YIELDS: Record<string, number> = {
  '40lb': 0.30,
  '50lb': 0.375,
  '60lb': 0.45,
  '80lb': 0.60,
};

const BAG_SIZE_OPTIONS = [
  { value: '40lb',   label: '40 lb bag (0.30 ft³)' },
  { value: '50lb',   label: '50 lb bag (0.375 ft³)' },
  { value: '60lb',   label: '60 lb bag (0.45 ft³)' },
  { value: '80lb',   label: '80 lb bag (0.60 ft³)' },
  { value: 'custom', label: 'Custom yield' },
];

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  const bagSize      = String(inputs.bag_size ?? '60lb');
  const yieldPerBag  = bagSize === 'custom'
    ? Math.max(0.001, Number(inputs.custom_yield_cuft ?? 0.45))
    : (BAG_YIELDS[bagSize] ?? 0.45);
  const wastePct     = Number(inputs.waste_pct ?? 10) / 100;

  let volume_cuft: number;
  let volume_cuyd: number;
  let volume_cum:  number;

  if (unitSystem === 'imperial') {
    const lengthFt = Number(inputs.length_ft ?? 0) + Number(inputs.length_in ?? 0) / 12;
    const widthFt  = Number(inputs.width_ft  ?? 0) + Number(inputs.width_in  ?? 0) / 12;
    const depthFt  = Number(inputs.depth_ft  ?? 0) + Number(inputs.depth_in  ?? 0) / 12;

    if (lengthFt <= 0 || widthFt <= 0 || depthFt <= 0 || yieldPerBag <= 0) {
      return { volume_cuft: 0, volume_cuyd: 0, volume_cum: 0, net_bags: 0, bags_required: 0, yield_per_bag: 0 };
    }

    volume_cuft = lengthFt * widthFt * depthFt;
    volume_cuyd = volume_cuft / 27;
    volume_cum  = volume_cuft * 0.0283168;
  } else {
    const lengthM = Number(inputs.length_m  ?? 0);
    const widthM  = Number(inputs.width_m   ?? 0);
    const depthM  = Number(inputs.depth_mm  ?? 0) / 1000;

    if (lengthM <= 0 || widthM <= 0 || depthM <= 0 || yieldPerBag <= 0) {
      return { volume_cuft: 0, volume_cuyd: 0, volume_cum: 0, net_bags: 0, bags_required: 0, yield_per_bag: 0 };
    }

    volume_cum  = lengthM * widthM * depthM;
    volume_cuft = volume_cum * 35.3147;
    volume_cuyd = volume_cum * 1.30795;
  }

  const waste_volume_cuft = volume_cuft * (1 + wastePct);
  const bags_required     = Math.ceil(waste_volume_cuft / yieldPerBag);
  const net_bags          = Math.ceil(volume_cuft / yieldPerBag);

  return {
    volume_cuft:  Math.round(volume_cuft  * 100)  / 100,
    volume_cuyd:  Math.round(volume_cuyd  * 1000) / 1000,
    volume_cum:   Math.round(volume_cum   * 1000) / 1000,
    net_bags,
    bags_required,
    yield_per_bag: Math.round(yieldPerBag * 1000) / 1000,
  };
}

export const concreteBagsCalculator: CalculatorConfig = {
  slug: 'concrete-bags-calculator',
  name: 'Concrete Bags Calculator',
  category: 'concrete',
  description:
    'Calculate how many bags of concrete you need for slabs, footings, posts, patios, and other projects. Supports 40 lb, 50 lb, 60 lb, and 80 lb bags with adjustable waste factor.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'length_ft',
      label: 'Length',
      type: 'number',
      unit: 'ft',
      min: 0.5,
      max: 500,
      step: 0.5,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Length of the area to fill.',
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
      min: 0.5,
      max: 500,
      step: 0.5,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Width of the area to fill.',
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
      id: 'depth_ft',
      label: 'Depth',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 20,
      step: 0,
      defaultValue: 0,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Thickness or depth of concrete. Enter feet here and inches below.',
    },
    {
      id: 'depth_in',
      label: 'Depth (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 4,
      required: true,
      onlyIn: 'imperial',
      groupWith: 'depth_ft',
      helpText: 'Common slab: 4″. Footings: 8–12″.',
    },
    // ── Shared: bag size (no onlyIn — shown in both) ──
    {
      id: 'bag_size',
      label: 'Bag Size',
      type: 'select',
      options: BAG_SIZE_OPTIONS,
      defaultValue: '60lb',
      required: true,
      helpText: 'Quikrete and Sakrete 80 lb bags yield 0.60 ft³; 60 lb bags yield 0.45 ft³.',
    },
    // ── Imperial-only fields ───────────────────────────
    {
      id: 'custom_yield_cuft',
      label: 'Custom Bag Yield',
      type: 'number',
      unit: 'ft³/bag',
      min: 0.1,
      max: 5,
      step: 0.01,
      defaultValue: 0.45,
      onlyIn: 'imperial',
      helpText: 'Enter the yield per bag in cubic feet (from bag label). Only used when "Custom yield" is selected.',
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
      helpText: 'Add 10% for typical projects; 15% for complex forms or irregular shapes.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Length',
      type: 'number',
      unit: 'm',
      min: 0.15,
      max: 150,
      step: 0.1,
      defaultValue: 3,
      defaultValueMetric: 3,
      required: true,
      onlyIn: 'metric',
      helpText: 'Length of the area to fill.',
    },
    {
      id: 'width_m',
      label: 'Width',
      type: 'number',
      unit: 'm',
      min: 0.15,
      max: 150,
      step: 0.1,
      defaultValue: 3,
      defaultValueMetric: 3,
      required: true,
      onlyIn: 'metric',
      helpText: 'Width of the area to fill.',
    },
    {
      id: 'depth_mm',
      label: 'Depth',
      type: 'number',
      unit: 'mm',
      min: 10,
      max: 600,
      step: 10,
      defaultValue: 100,
      defaultValueMetric: 100,
      required: true,
      onlyIn: 'metric',
      helpText: 'Slab thickness in millimetres. Common: 100 mm (4″), 150 mm (6″).',
    },
    {
      id: 'custom_yield_cuft',
      label: 'Custom Bag Yield',
      type: 'number',
      unit: 'ft³/bag',
      min: 0.1,
      max: 5,
      step: 0.01,
      defaultValue: 0.45,
      onlyIn: 'metric',
      helpText: 'Yield per bag in cubic feet (convert from bag label if needed).',
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
      helpText: 'Add 10% for typical projects; 15% for complex forms or irregular shapes.',
    },
  ],
  outputs: [
    {
      id: 'volume_cuft',
      label: 'Concrete Volume',
      unit: 'ft³',
      format: 'volume',
      description: 'Total volume before waste',
    },
    {
      id: 'volume_cuyd',
      label: 'Concrete Volume',
      unit: 'yd³',
      format: 'volume',
      primary: true,
      description: 'Total volume in cubic yards',
    },
    {
      id: 'volume_cum',
      label: 'Concrete Volume',
      unit: 'm³',
      format: 'volume',
    },
    {
      id: 'net_bags',
      label: 'Bags (net)',
      unit: 'bags',
      format: 'number',
      description: 'Bags for exact volume — no waste',
    },
    {
      id: 'bags_required',
      label: 'Bags Required',
      unit: 'bags',
      format: 'number',
      description: 'Bags including waste factor — order this many',
    },
    {
      id: 'yield_per_bag',
      label: 'Yield per Bag',
      unit: 'ft³',
      format: 'number',
      description: 'Cubic feet of concrete per bag',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'concrete-slab-calculator',
    'concrete-driveway-calculator',
    'concrete-footing-calculator',
    'concrete-column-calculator',
  ],
  seo: {
    title: 'Concrete Bags Calculator – How Many Bags of Concrete Do I Need?',
    description:
      'Calculate concrete bags required for slabs, footings, posts, patios, driveways, and other projects.',
    h1: 'Concrete Bags Calculator',
    focusKeyword: 'concrete bags calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate bags for 40 lb, 50 lb, 60 lb, and 80 lb bags',
      'Custom bag yield for any brand or size',
      'Volume in cubic feet, cubic yards, and cubic metres',
      'Adjustable waste factor',
      'Net and waste-adjusted bag counts',
      'Imperial and metric dimensions',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate concrete volume',
      formula: 'Volume = Length × Width × Depth',
      description:
        'Convert all dimensions to feet first: inches ÷ 12. Example: a 10 ft × 10 ft slab at 4″ thick = 10 × 10 × (4/12) = 33.33 ft³ = 1.23 yd³.',
    },
    {
      label: 'Apply waste factor',
      formula: 'Adjusted Volume = Volume × (1 + Waste %)',
      description:
        'A 10% waste factor is standard for straightforward pours. Use 15% for complex forms, irregular shapes, footings with uneven bases, or when working with large crews where spills are likely.',
    },
    {
      label: 'Determine bag yield',
      formula: 'Yield: 40 lb = 0.30 ft³ | 50 lb = 0.375 ft³ | 60 lb = 0.45 ft³ | 80 lb = 0.60 ft³',
      description:
        'Bag yield is the volume of mixed concrete produced by one bag. It is printed on every bag label. Quikrete and Sakrete use these standard yields; specialty mixes may differ — use the Custom yield option in that case.',
    },
    {
      label: 'Calculate bags required',
      formula: 'Bags = ⌈Adjusted Volume ÷ Yield per Bag⌉',
      description:
        'Always round up — you cannot use a partial bag, and running short mid-pour causes cold joints that weaken the slab. The net bag count (no waste) is also shown so you can see exactly how many bags the pure volume requires.',
    },
    {
      label: 'Convert units',
      formula: '1 yd³ = 27 ft³ = 0.7646 m³',
      description:
        'Ready-mix concrete is ordered by the cubic yard. If your project is under roughly 1 yd³ (27 ft³), bags are typically more economical and convenient. Above 1 yd³, a ready-mix delivery is usually faster and cheaper per unit.',
    },
  ],
  faq: [
    {
      question: 'How many bags of concrete do I need for a 10×10 slab?',
      answer:
        'A 10 ft × 10 ft slab at 4″ thick = 33.33 ft³ = 1.23 yd³. At 0.45 ft³ per 60 lb bag you need about 74 bags (with 10% waste) or 56 bags net. At 0.60 ft³ per 80 lb bag you need about 56 bags with waste or 42 bags net. Always add at least 10% for waste.',
    },
    {
      question: 'What is the yield of an 80 lb bag of concrete?',
      answer:
        'An 80 lb bag of standard concrete mix (Quikrete, Sakrete) yields 0.60 ft³ of mixed concrete. That means you need approximately 45 bags to fill one cubic yard (27 ft³ ÷ 0.60 = 45).',
    },
    {
      question: 'Should I use 60 lb or 80 lb bags?',
      answer:
        '80 lb bags are more economical per cubic foot and reduce the total number of bags to mix. 60 lb bags are easier to lift and carry — a good choice for solo DIY projects or when working overhead. Both produce the same mix strength; the only difference is weight and yield per bag.',
    },
    {
      question: 'When should I use bags vs ready-mix concrete?',
      answer:
        'Bagged concrete is practical for projects under about 1 cubic yard. Above 1 yd³, a ready-mix truck is typically faster, cheaper per unit, and produces a more consistent mix. The break-even point depends on local ready-mix delivery minimums — many suppliers have a 1–2 yd³ minimum.',
    },
    {
      question: 'How much does it cost to buy bags of concrete?',
      answer:
        'In the US, a 60 lb bag typically costs $5–$7 and an 80 lb bag $7–$10 at home improvement stores. That puts bagged concrete at roughly $130–$200 per cubic yard — comparable to or more expensive than ready-mix ($150–$200/yd³ delivered), which is why ready-mix is preferred for larger pours.',
    },
    {
      question: 'How thick should a concrete slab be?',
      answer:
        'For residential patios and walkways, 4″ (100 mm) is standard. Driveways that see passenger vehicles should be 4–6″. Slabs carrying heavy trucks or equipment should be 6″ or more. Interior floor slabs are typically 3.5–4″. Footings are sized by structural requirements — commonly 8–12″ for residential foundations.',
    },
    {
      question: 'How long does bagged concrete take to set?',
      answer:
        'Most standard concrete mixes reach initial set in 1–2 hours and are walkable after 24 hours. Full structural strength (3,000–4,000 psi) is reached at 28 days. Fast-setting mixes (e.g. Quikrete Fast-Setting) can bear weight in 3–4 hours. Temperature affects cure time: cold weather slows curing, hot weather accelerates it.',
    },
    {
      question: 'What is the waste factor for concrete?',
      answer:
        'Use 10% waste for typical rectangular slabs and straightforward pours. Use 15% for complex forms, curved shapes, irregular footings, or thick pours where estimating exact volume is difficult. Never round down on bags — running out of concrete mid-pour causes cold joints that permanently weaken the structure.',
    },
  ],
};
