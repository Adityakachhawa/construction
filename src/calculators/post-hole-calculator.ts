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
  { value: '40lb', label: '40 lb bag (0.30 ft³)' },
  { value: '50lb', label: '50 lb bag (0.375 ft³)' },
  { value: '60lb', label: '60 lb bag (0.45 ft³)' },
  { value: '80lb', label: '80 lb bag (0.60 ft³)' },
];

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  const bagSizeKey  = String(inputs.bag_size ?? '80lb');
  const yieldPerBag = BAG_YIELDS[bagSizeKey] ?? 0.60;
  const wastePct    = Number(inputs.waste_pct ?? 10) / 100;
  const costPerBag  = Number(inputs.cost_per_bag ?? 0);

  if (unitSystem === 'imperial') {
    const diameterIn    = Number(inputs.diameter_in ?? 10);
    const depthFt       = Number(inputs.depth_ft ?? 3) + Number(inputs.depth_in ?? 0) / 12;
    const numHoles      = Math.max(1, Math.round(Number(inputs.num_holes ?? 4)));
    const postWidthIn   = Number(inputs.post_width_in ?? 4);
    const gravelDepthFt = Number(inputs.gravel_depth_in ?? 6) / 12;

    if (diameterIn <= 0 || depthFt <= 0) {
      return {
        excavation_cuft: 0, excavation_cuyd: 0, excavation_cum: 0,
        gravel_cuft: 0, gravel_cuyd: 0,
        concrete_cuft: 0, concrete_cuyd: 0, concrete_cum: 0,
        bags_per_hole: 0, bags_required: 0, cost: 0,
      };
    }

    const radiusFt = (diameterIn / 2) / 12;

    const hole_cuft_each    = Math.PI * radiusFt * radiusFt * depthFt;
    const gravel_cuft_each  = Math.PI * radiusFt * radiusFt * gravelDepthFt;

    const postSideFt = postWidthIn / 12;
    const post_displacement_cuft = Math.max(0, postSideFt * postSideFt * (depthFt - gravelDepthFt));

    const concrete_cuft_each             = Math.max(0, hole_cuft_each - gravel_cuft_each - post_displacement_cuft);
    const concrete_cuft_each_with_waste  = concrete_cuft_each * (1 + wastePct);

    const excavation_cuft = Math.round(hole_cuft_each * numHoles * 100) / 100;
    const excavation_cuyd = Math.round(excavation_cuft / 27 * 100) / 100;
    const excavation_cum  = Math.round(excavation_cuft * 0.0283168 * 1000) / 1000;
    const gravel_cuft     = Math.round(gravel_cuft_each * numHoles * 100) / 100;
    const gravel_cuyd     = Math.round(gravel_cuft / 27 * 100) / 100;
    const concrete_cuft   = Math.round(concrete_cuft_each_with_waste * numHoles * 100) / 100;
    const concrete_cuyd   = Math.round(concrete_cuft / 27 * 100) / 100;
    const concrete_cum    = Math.round(concrete_cuft * 0.0283168 * 1000) / 1000;
    const bags_per_hole   = Math.ceil(concrete_cuft_each_with_waste / yieldPerBag);
    const bags_required   = Math.ceil(concrete_cuft_each_with_waste * numHoles / yieldPerBag);
    const cost            = costPerBag > 0 ? Math.round(bags_required * costPerBag * 100) / 100 : 0;

    return {
      excavation_cuft, excavation_cuyd, excavation_cum,
      gravel_cuft, gravel_cuyd,
      concrete_cuft, concrete_cuyd, concrete_cum,
      bags_per_hole, bags_required, cost,
    };
  } else {
    const diameterM    = Number(inputs.diameter_mm ?? 250) / 1000;
    const depthM       = Number(inputs.depth_m ?? 0.9);
    const numHoles     = Math.max(1, Math.round(Number(inputs.num_holes ?? 4)));
    const postWidthM   = Number(inputs.post_width_mm ?? 100) / 1000;
    const gravelDepthM = Number(inputs.gravel_depth_mm ?? 150) / 1000;

    if (diameterM <= 0 || depthM <= 0) {
      return {
        excavation_cuft: 0, excavation_cuyd: 0, excavation_cum: 0,
        gravel_cuft: 0, gravel_cuyd: 0,
        concrete_cuft: 0, concrete_cuyd: 0, concrete_cum: 0,
        bags_per_hole: 0, bags_required: 0, cost: 0,
      };
    }

    const radiusM = diameterM / 2;

    const hole_cum_each    = Math.PI * radiusM * radiusM * depthM;
    const gravel_cum_each  = Math.PI * radiusM * radiusM * gravelDepthM;
    const post_disp_cum    = Math.max(0, postWidthM * postWidthM * (depthM - gravelDepthM));

    const concrete_cum_each              = Math.max(0, hole_cum_each - gravel_cum_each - post_disp_cum);
    const concrete_cum_each_with_waste   = concrete_cum_each * (1 + wastePct);
    const concrete_cuft_each_with_waste_metric = concrete_cum_each_with_waste * 35.3147;

    const excavation_cum  = Math.round(hole_cum_each * numHoles * 1000) / 1000;
    const excavation_cuft = Math.round(excavation_cum * 35.3147 * 100) / 100;
    const excavation_cuyd = Math.round(excavation_cum * 1.30795 * 100) / 100;
    const gravel_cuft     = Math.round(gravel_cum_each * numHoles * 35.3147 * 100) / 100;
    const gravel_cuyd     = Math.round(gravel_cuft / 27 * 100) / 100;
    const concrete_cum    = Math.round(concrete_cum_each_with_waste * numHoles * 1000) / 1000;
    const concrete_cuft   = Math.round(concrete_cuft_each_with_waste_metric * numHoles * 100) / 100;
    const concrete_cuyd   = Math.round(concrete_cuft / 27 * 100) / 100;
    const bags_per_hole   = Math.ceil(concrete_cuft_each_with_waste_metric / yieldPerBag);
    const bags_required   = Math.ceil(concrete_cuft_each_with_waste_metric * numHoles / yieldPerBag);
    const cost            = costPerBag > 0 ? Math.round(bags_required * costPerBag * 100) / 100 : 0;

    return {
      excavation_cuft, excavation_cuyd, excavation_cum,
      gravel_cuft, gravel_cuyd,
      concrete_cuft, concrete_cuyd, concrete_cum,
      bags_per_hole, bags_required, cost,
    };
  }
}

export const postHoleCalculator: CalculatorConfig = {
  slug: 'post-hole-calculator',
  name: 'Post Hole Calculator',
  category: 'concrete',
  description:
    'Calculate concrete, gravel, and excavation volume for fence posts, deck posts, pergola posts, and pole foundations. Accounts for post displacement and gravel base so you order the exact number of bags.',
  inputs: [
    // ── Imperial ──────────────────────────────────────────────────────────
    {
      id: 'diameter_in',
      label: 'Hole Diameter',
      type: 'number',
      unit: 'in',
      min: 2,
      max: 48,
      step: 0.5,
      defaultValue: 10,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Hole diameter. Common: 8–10″ for fence posts (use 3× post width rule), 12–16″ for deck posts.',
    },
    {
      id: 'depth_ft',
      label: 'Hole Depth',
      type: 'number',
      unit: 'ft',
      min: 1,
      max: 20,
      step: 0.5,
      defaultValue: 3,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Hole depth. Rule of thumb: 1/3 of post height above grade, plus 6″ below frost line.',
    },
    {
      id: 'depth_in',
      label: 'Depth (in)',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 11,
      step: 1,
      defaultValue: 0,
      onlyIn: 'imperial',
      groupWith: 'depth_ft',
    },
    {
      id: 'num_holes',
      label: 'Number of Holes',
      type: 'number',
      unit: 'holes',
      min: 1,
      max: 500,
      step: 1,
      defaultValue: 4,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Total number of post holes.',
    },
    {
      id: 'post_width_in',
      label: 'Post Width',
      type: 'number',
      unit: 'in',
      min: 1,
      max: 18,
      step: 0.5,
      defaultValue: 4,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Post width (for square posts, enter the side length). Used to subtract post displacement from concrete volume.',
    },
    {
      id: 'gravel_depth_in',
      label: 'Gravel Base Depth',
      type: 'number',
      unit: 'in',
      min: 0,
      max: 24,
      step: 1,
      defaultValue: 6,
      onlyIn: 'imperial',
      helpText: 'Depth of gravel base at bottom of hole. Typically 4–6 inches for drainage.',
    },
    {
      id: 'bag_size',
      label: 'Bag Size',
      type: 'select',
      options: BAG_SIZE_OPTIONS,
      defaultValue: '80lb',
      required: true,
      onlyIn: 'imperial',
      helpText: 'Quikrete Fast-Setting 50 lb = 0.375 ft³; standard 80 lb = 0.60 ft³.',
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
      helpText: 'Add 10% for spillage and uneven holes.',
    },
    {
      id: 'cost_per_bag',
      label: 'Cost per Bag',
      type: 'number',
      unit: '$',
      min: 0,
      max: 100,
      step: 0.01,
      defaultValue: 0,
      onlyIn: 'imperial',
      helpText: 'Optional. Enter bag price for a cost estimate.',
    },
    // ── Metric ────────────────────────────────────────────────────────────
    {
      id: 'diameter_mm',
      label: 'Hole Diameter',
      type: 'number',
      unit: 'mm',
      min: 50,
      max: 1200,
      step: 10,
      defaultValue: 250,
      defaultValueMetric: 250,
      required: true,
      onlyIn: 'metric',
      helpText: 'Hole diameter in mm. Common: 200–250 mm for fence posts, 300–400 mm for deck posts.',
    },
    {
      id: 'depth_m',
      label: 'Hole Depth',
      type: 'number',
      unit: 'm',
      min: 0.3,
      max: 6,
      step: 0.1,
      defaultValue: 0.9,
      defaultValueMetric: 0.9,
      required: true,
      onlyIn: 'metric',
      helpText: 'Hole depth in metres.',
    },
    {
      id: 'num_holes',
      label: 'Number of Holes',
      type: 'number',
      unit: 'holes',
      min: 1,
      max: 500,
      step: 1,
      defaultValue: 4,
      required: true,
      onlyIn: 'metric',
      helpText: 'Total number of post holes.',
    },
    {
      id: 'post_width_mm',
      label: 'Post Width',
      type: 'number',
      unit: 'mm',
      min: 25,
      max: 450,
      step: 5,
      defaultValue: 100,
      required: true,
      onlyIn: 'metric',
      helpText: 'Post width in mm. Used to subtract post displacement.',
    },
    {
      id: 'gravel_depth_mm',
      label: 'Gravel Base Depth',
      type: 'number',
      unit: 'mm',
      min: 0,
      max: 600,
      step: 10,
      defaultValue: 150,
      onlyIn: 'metric',
      helpText: 'Gravel base depth in mm. Typically 100–150 mm.',
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
      id: 'waste_pct',
      label: 'Waste Factor',
      type: 'number',
      unit: '%',
      min: 0,
      max: 30,
      step: 5,
      defaultValue: 10,
      onlyIn: 'metric',
    },
    {
      id: 'cost_per_bag',
      label: 'Cost per Bag',
      type: 'number',
      unit: '$',
      min: 0,
      max: 100,
      step: 0.01,
      defaultValue: 0,
      onlyIn: 'metric',
    },
  ],
  outputs: [
    {
      id: 'excavation_cuft',
      label: 'Excavation Volume',
      unit: 'ft³',
      format: 'volume',
      description: 'Total volume of all holes combined',
    },
    {
      id: 'excavation_cuyd',
      label: 'Excavation Volume',
      unit: 'yd³',
      format: 'volume',
      primary: true,
    },
    {
      id: 'excavation_cum',
      label: 'Excavation Volume',
      unit: 'm³',
      format: 'volume',
    },
    {
      id: 'gravel_cuft',
      label: 'Gravel Required',
      unit: 'ft³',
      format: 'volume',
      description: 'Gravel base for all holes',
    },
    {
      id: 'gravel_cuyd',
      label: 'Gravel Required',
      unit: 'yd³',
      format: 'volume',
    },
    {
      id: 'concrete_cuft',
      label: 'Concrete Volume',
      unit: 'ft³',
      format: 'volume',
      description: 'Concrete fill (minus gravel and post) with waste',
    },
    {
      id: 'concrete_cuyd',
      label: 'Concrete Volume',
      unit: 'yd³',
      format: 'volume',
    },
    {
      id: 'concrete_cum',
      label: 'Concrete Volume',
      unit: 'm³',
      format: 'volume',
    },
    {
      id: 'bags_per_hole',
      label: 'Bags per Hole',
      unit: 'bags',
      format: 'number',
      description: 'Bags needed per individual hole',
    },
    {
      id: 'bags_required',
      label: 'Total Bags Required',
      unit: 'bags',
      format: 'number',
      description: 'All holes combined including waste',
    },
    {
      id: 'cost',
      label: 'Estimated Cost',
      unit: '$',
      format: 'currency',
      description: 'Total bags × cost per bag',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'concrete-bags-calculator',
    'concrete-footing-calculator',
    'fence-post-calculator',
    'deck-footing-calculator',
  ],
  seo: {
    title: 'Post Hole Calculator – Concrete & Gravel Estimator',
    description:
      'Calculate concrete, gravel, excavation volume, and bag requirements for fence posts, deck footings, pergolas, and pole foundations.',
    h1: 'Post Hole Calculator',
    focusKeyword: 'post hole calculator',
  },

  disclaimer: 'Construction estimate only: Results are based on the dimensions and assumptions entered. This calculator does not perform structural engineering or guarantee local building-code compliance. Verify project-specific requirements with your local building department or a qualified professional.',
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate concrete bags per hole and total for all holes',
      'Gravel base volume for drainage layer',
      'Excavation volume for all holes combined',
      'Post displacement subtracted from concrete volume',
      'Supports 40 lb, 50 lb, 60 lb, and 80 lb bags',
      'Imperial and metric unit systems',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate hole volume (cylinder)',
      formula: 'Hole Volume = π × r² × Depth',
      description:
        'r = half the diameter; a 10″ diameter × 3 ft deep hole = π × (5/12)² × 3 = 1.636 ft³',
    },
    {
      label: 'Calculate gravel base volume',
      formula: 'Gravel Volume = π × r² × Gravel Depth',
      description:
        'Subtract from total hole to get concrete zone; 6″ gravel base in 10″ hole = 0.273 ft³',
    },
    {
      label: 'Subtract post displacement',
      formula: 'Post Displacement = Post Width² × (Depth − Gravel Depth)',
      description:
        'A 4×4 post (3.5″ actual = 0.292 ft side) displaces 0.292² × 2.5 ft ≈ 0.213 ft³ of concrete space; using nominal for conservative estimate',
    },
    {
      label: 'Calculate concrete volume per hole',
      formula: 'Concrete = Hole Volume − Gravel Volume − Post Displacement',
      description:
        'Apply waste factor: Concrete × (1 + Waste%); example: 1.636 − 0.273 − 0.213 = 1.15 ft³ net, with 10% = 1.27 ft³',
    },
    {
      label: 'Calculate bags required',
      formula: 'Bags per Hole = ⌈Concrete per Hole ÷ Yield per Bag⌉',
      description:
        '80 lb bag = 0.60 ft³ → 1.27 ÷ 0.60 = 2.11 → 3 bags per hole; total = bags per hole × number of holes',
    },
  ],
  faq: [
    {
      question: 'How much concrete do I need for a fence post?',
      answer:
        'As a rule of thumb, most 8-ft fence posts with a 4×4 in a 10″ × 3 ft hole need 2–3 bags of 80 lb concrete.',
    },
    {
      question: 'How deep should fence post holes be?',
      answer:
        'Bury 1/3 of the total post length. An 8-ft post needs at least 2.5 ft below grade. Add 6 inches below the frost line in cold climates.',
    },
    {
      question: 'How wide should a post hole be?',
      answer:
        'At minimum 3× the post width. A 4×4 post needs a 12″ hole; a 6×6 post needs an 18″ hole. Go wider in sandy or loose soil.',
    },
    {
      question: 'Should I use gravel at the bottom of a post hole?',
      answer:
        'Yes — 4–6 inches of crushed gravel improves drainage and significantly extends post life by preventing standing water at the base.',
    },
    {
      question: 'How many bags of concrete per fence post?',
      answer:
        '10″ × 2.5 ft deep: 1–2 bags of 80 lb. 10″ × 3 ft deep: 2–3 bags. 12″ × 3.5 ft: 3–4 bags.',
    },
    {
      question: 'What type of concrete is best for fence posts?',
      answer:
        'Fast-setting concrete (Quikrete Fast-Setting) can be poured dry and sets in 20–40 minutes. Standard mix also works well and is slightly less expensive.',
    },
    {
      question: 'How long does post hole concrete take to set?',
      answer:
        'Fast-setting mix: 20–40 minutes. Standard mix: 24–48 hours before attaching fence panels. Cold weather slows the cure significantly.',
    },
    {
      question: 'What is the frost line depth for post holes?',
      answer:
        'It varies by location. Zone 6: 18–24″, Zone 5: 30–36″, Zone 4: 36–48″. Always check local building code — footings must extend below the frost line.',
    },
  ],
};
