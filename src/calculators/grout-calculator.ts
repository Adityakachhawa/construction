import { ceilQuantity } from './rounding';
import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';

const BAG_YIELDS: Record<string, number> = {
  '10lb':   0.18,
  '25lb':   0.45,
  '50lb':   0.90,
  'custom': 0.45,
};

const BAG_SIZE_OPTIONS = [
  { value: '10lb',   label: '10 lb bag (0.18 ft³) - unverified yield' },
  { value: '25lb',   label: '25 lb bag (0.45 ft³) - unverified yield' },
  { value: '50lb',   label: '50 lb bag (0.90 ft³) - unverified yield' },
  { value: 'custom', label: 'Custom yield' },
];

export function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  const bagSizeKey  = String(inputs.bag_size ?? '25lb');
  const yieldPerBag = bagSizeKey === 'custom'
    ? Number(inputs.custom_yield ?? 0.45)
    : (BAG_YIELDS[bagSizeKey] ?? 0.45);
  const wastePct = Number(inputs.waste_pct ?? 10) / 100;

  let tileLenIn: number;
  let tileWidIn: number;
  let jointIn: number;
  let depthIn: number;
  let areaSqft: number;
  let area_sqm: number;

  if (unitSystem === 'imperial') {
    tileLenIn = Number(inputs.tile_length_in ?? 12);
    tileWidIn = Number(inputs.tile_width_in  ?? 12);
    jointIn   = Number(inputs.joint_width_in ?? 0.125);
    depthIn   = Number(inputs.tile_depth_in  ?? 0.375);
    areaSqft  = Number(inputs.area_sqft ?? 100);
    area_sqm  = areaSqft * 0.092903;
  } else {
    tileLenIn = Number(inputs.tile_length_mm ?? 300) / 25.4;
    tileWidIn = Number(inputs.tile_width_mm  ?? 300) / 25.4;
    jointIn   = Number(inputs.joint_width_mm ?? 3)   / 25.4;
    depthIn   = Number(inputs.tile_depth_mm  ?? 10)  / 25.4;
    area_sqm  = Number(inputs.area_sqm ?? 10);
    areaSqft  = area_sqm * 10.7639;
  }

  // Zero-guard
  if (tileLenIn <= 0 || tileWidIn <= 0 || areaSqft <= 0 || yieldPerBag <= 0) {
    return {
      area_sqft: 0,
      area_sqm: 0,
      tile_count: 0,
      grout_cuft: 0,
      grout_cum: 0,
      grout_litres: 0,
      net_bags: 0,
      bags_required: 0,
    };
  }

  // Approximate joint volume per ft². All tile/joint dimensions are inches.
  // (L+W)/(L*W) has units 1/in: convert the resulting inches to feet ONCE.
  // Small-joint approximation; confirm bag yield against the selected product.
  const grout_per_sqft = jointIn * depthIn * (tileLenIn + tileWidIn) / (12 * tileLenIn * tileWidIn);

  const grout_cuft_net = areaSqft * grout_per_sqft;
  const grout_cuft     = grout_cuft_net * (1 + wastePct);
  const grout_cum      = grout_cuft * 0.0283168;

  const tileSqft   = (tileLenIn / 12) * (tileWidIn / 12);
  const tile_count = ceilQuantity((areaSqft / tileSqft) * (1 + wastePct));

  const bags_required = ceilQuantity(grout_cuft / yieldPerBag);
  const net_bags      = ceilQuantity(grout_cuft_net / yieldPerBag);

  return {
    area_sqft:     Math.round(areaSqft        * 100)    / 100,
    area_sqm:      Math.round(area_sqm        * 100)    / 100,
    tile_count,
    grout_cuft:    grout_cuft,
    grout_cum,
    grout_litres: grout_cum * 1000,
    net_bags,
    bags_required,
  };
}

export const groutCalculator: CalculatorConfig = {
  slug: 'grout-calculator',
  name: 'Grout Calculator',
  category: 'masonry',
  description:
    'Calculate grout volume and bags required for floor, wall, bathroom, kitchen, and tile installation projects. Enter tile dimensions, joint width, tile thickness, and total area to get an accurate grout estimate.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'tile_length_in',
      label: 'Tile Length',
      type: 'number',
      unit: 'in',
      min: 1,
      max: 48,
      step: 0.25,
      defaultValue: 12,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Tile length in inches. Common: 12″, 18″, 24″.',
    },
    {
      id: 'tile_width_in',
      label: 'Tile Width',
      type: 'number',
      unit: 'in',
      min: 1,
      max: 48,
      step: 0.25,
      defaultValue: 12,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Tile width in inches. Use same value as length for square tiles.',
    },
    {
      id: 'joint_width_in',
      label: 'Joint Width',
      type: 'number',
      unit: 'in',
      min: 0.0625,
      max: 1,
      step: 0.0625,
      defaultValue: 0.125,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Grout joint width in inches. Common: 1/16″ (rectified tiles), 1/8″ (standard), 3/16″–1/4″ (larger tiles).',
    },
    {
      id: 'tile_depth_in',
      label: 'Tile Thickness',
      type: 'number',
      unit: 'in',
      min: 0.125,
      max: 2,
      step: 0.0625,
      defaultValue: 0.375,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Tile thickness in inches. Common: 3/8″ (floor tile), 1/4″ (wall tile).',
    },
    {
      id: 'area_sqft',
      label: 'Tiled Area',
      type: 'number',
      unit: 'ft²',
      min: 1,
      max: 10000,
      step: 1,
      defaultValue: 100,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Total tiled area in square feet.',
    },
    {
      id: 'bag_size',
      label: 'Bag Size',
      type: 'select',
      options: BAG_SIZE_OPTIONS,
      defaultValue: '25lb',
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'custom_yield',
      label: 'Custom Bag Yield',
      type: 'number',
      unit: 'ft³/bag',
      min: 0.05,
      max: 5,
      step: 0.01,
      defaultValue: 0.45,
      onlyIn: 'imperial',
      helpText: 'Yield per bag in cubic feet from the bag label.',
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
      helpText: 'Add 10% for typical installations; more for diagonal layouts.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'tile_length_mm',
      label: 'Tile Length',
      type: 'number',
      unit: 'mm',
      min: 25,
      max: 1200,
      step: 5,
      defaultValue: 300,
      defaultValueMetric: 300,
      required: true,
      onlyIn: 'metric',
      helpText: 'Tile length in millimetres. Common: 300 mm (12″), 450 mm (18″), 600 mm (24″).',
    },
    {
      id: 'tile_width_mm',
      label: 'Tile Width',
      type: 'number',
      unit: 'mm',
      min: 25,
      max: 1200,
      step: 5,
      defaultValue: 300,
      defaultValueMetric: 300,
      required: true,
      onlyIn: 'metric',
      helpText: 'Tile width in millimetres.',
    },
    {
      id: 'joint_width_mm',
      label: 'Joint Width',
      type: 'number',
      unit: 'mm',
      min: 1,
      max: 25,
      step: 0.5,
      defaultValue: 3,
      defaultValueMetric: 3,
      required: true,
      onlyIn: 'metric',
      helpText: 'Grout joint width in mm. Common: 1.5–2 mm (rectified), 3 mm (standard), 5–6 mm (larger tiles).',
    },
    {
      id: 'tile_depth_mm',
      label: 'Tile Thickness',
      type: 'number',
      unit: 'mm',
      min: 3,
      max: 50,
      step: 0.5,
      defaultValue: 10,
      required: true,
      defaultValueMetric: 10,
      onlyIn: 'metric',
      helpText: 'Tile thickness in mm. Common: 10 mm (floor tile), 6 mm (wall tile).',
    },
    {
      id: 'area_sqm',
      label: 'Tiled Area',
      type: 'number',
      unit: 'm²',
      min: 0.5,
      max: 1000,
      step: 0.5,
      defaultValue: 10,
      defaultValueMetric: 10,
      required: true,
      onlyIn: 'metric',
      helpText: 'Total tiled area in square metres.',
    },
    {
      id: 'bag_size',
      label: 'Bag Size',
      type: 'select',
      options: BAG_SIZE_OPTIONS,
      defaultValue: '25lb',
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'custom_yield',
      label: 'Custom Bag Yield',
      type: 'number',
      unit: 'ft³/bag',
      min: 0.05,
      max: 5,
      step: 0.01,
      defaultValue: 0.45,
      onlyIn: 'metric',
      helpText: 'Yield per bag in cubic feet from the bag label.',
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
      helpText: 'Add 10% for typical installations; more for diagonal layouts.',
    },
  ],
  outputs: [
    {
      id: 'area_sqft',
      label: 'Tiled Area',
      unit: 'ft²',
      format: 'area',
    },
    {
      id: 'area_sqm',
      label: 'Tiled Area',
      unit: 'm²',
      format: 'area',
    },
    {
      id: 'tile_count',
      label: 'Tile Count',
      unit: 'tiles',
      format: 'number',
      description: 'Tiles needed including waste',
    },
    { id: 'grout_litres', label: 'Mixed grout including waste', unit: 'L', format: 'volume', primary: true, description: 'Bag estimates depend on the selected product yield.' },
    {
      id: 'grout_cuft',
      label: 'Grout Volume',
      unit: 'ft³',
      format: 'volume',
      description: 'Adjusted grout volume including waste',
    },
    {
      id: 'grout_cum',
      label: 'Grout Volume',
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
  disclaimer: 'Assumption-based estimate, not a manufacturer coverage or engineering specification. Preset bag yields are unverified. Use Custom with the selected product mixed yield before ordering; verify geometry and waste separately. Volume uses a small-joint approximation for tile grout, not masonry core grout.',
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'flooring-calculator',
    'mortar-calculator',
    'concrete-bags-calculator',
    'square-footage-calculator',
  ],
  seo: {
    title: 'Grout Calculator – Estimate Grout Needed for Tile Projects',
    description:
      'Calculate grout volume and bags required for floor, wall, bathroom, kitchen, and tile installation projects.',
    h1: 'Grout Calculator',
    focusKeyword: 'grout calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate grout volume based on tile size and joint width',
      'Supports 10 lb, 25 lb, and 50 lb grout bags',
      'Estimate tile count with waste factor',
      'Grout volume in cubic feet and cubic metres',
      'Adjustable waste percentage',
      'Imperial and metric unit systems',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate tiled area',
      formula: 'Area = Length × Width (of the room or surface)',
      description:
        'Measure the total surface area to be tiled in square feet (or square metres). For rooms with cabinets, islands, or fixtures, deduct those footprints if they are significant — for small obstacles, leaving them in provides a useful material buffer.',
    },
    {
      label: 'Calculate grout volume per square foot',
      formula: 'Grout/ft² = Joint Width × Tile Depth × (Tile L + Tile W) ÷ (12 × Tile L × Tile W)',
      description:
        'With all dimensions in inches, this is an approximate small-joint volume of grout within one square foot of installed tile. Larger tiles have fewer joints per square foot and therefore use less grout per ft² than small mosaic tiles with the same joint width.',
    },
    {
      label: 'Calculate total grout volume',
      formula: 'Total Grout = Area × Grout per ft²',
      description:
        'Multiply the tiled area by the per-square-foot grout volume. Example: 100 ft² of 12×12 tile with 1/8″ joints and 3/8″ depth → grout/ft² ≈ 0.000651 ft → net total ≈ 0.0651 ft³.',
    },
    {
      label: 'Apply waste factor',
      formula: 'Adjusted Grout = Total Grout × (1 + Waste %)',
      description:
        'Use 10% for standard straight-lay patterns. Increase to 15% for diagonal (45°) layouts and areas with many complex cuts around fixtures, outlets, or irregular edges.',
    },
    {
      label: 'Calculate bags required',
      formula: 'Bags = ⌈Adjusted Grout ÷ Yield per Bag⌉',
      description:
        'Bag yields shown in the presets are unverified illustrative assumptions. Select Custom and enter the mixed yield from the chosen grout product data sheet. Confirm bag or kit mass, water addition, tile dimensions, joint width/depth and waste. The small-joint volume approximation does not verify product coverage.',
    },
  ],
  faq: [
    {
      question: 'How do I calculate how much grout I need?',
      answer:
        'Multiply your tiled area by the grout volume per square foot — which depends on tile size, joint width, and tile thickness. The formula is: Grout/ft² = Joint Width × Tile Depth × (Tile L + Tile W) ÷ (12 × Tile L × Tile W). This calculator handles all the math once you enter your tile dimensions, joint width, and area.',
    },
    {
      question: 'What is the difference between sanded and unsanded grout?',
      answer:
        'Use the selected grout manufacturer instructions for permitted joint widths and tile compatibility. Sanded, unsanded, epoxy and premixed products have different limitations; joint width alone does not select a suitable product.',
    },
    {
      question: 'How much grout do I need for 100 sq ft of 12×12 tile?',
      answer:
        'With 1/8″ joints and 3/8″ tile depth: grout volume per ft² ≈ 0.000651 ft³, so 100 ft² requires about 0.0651 ft³ net. With the illustrative 25 lb bag assumption (0.45 ft³ yield) and 10% waste, you need 1 bag. Larger joints or thicker tiles will increase this amount.',
    },
    {
      question: 'How wide should grout joints be?',
      answer:
        'Choose joint width from the tile and grout manufacturer instructions and the project specification. This calculator estimates volume for the entered width; it does not determine an installation minimum.',
    },
    {
      question: 'What size grout bag do I need?',
      answer:
        'A 25 lb bag is the most common choice for residential bathroom, kitchen, and floor projects. Use a 50 lb bag for large commercial floors to reduce the number of bags to mix. A 10 lb bag is ideal for repairs, small backsplash areas, or touch-ups.',
    },
    {
      question: 'How long does grout take to cure?',
      answer:
        'Follow the selected grout technical data sheet for curing, traffic, water exposure and sealing. A generic curing time is not valid for all grout products.',
    },
    {
      question: 'Can I use this calculator for epoxy grout?',
      answer:
        'Epoxy grout coverage is similar by volume to cement grout, but epoxy is sold in pre-measured kits rather than by the bag. Use this calculator to determine the grout volume you need, then match that volume to the coverage chart on the epoxy grout kit you plan to purchase.',
    },
    {
      question: 'How much does grout cost?',
      answer:
        'Sanded grout in a standard 25 lb bag typically costs $12–20. Unsanded grout runs $15–25 per 25 lb bag. Epoxy grout kits are $30–60 each. Prices vary by brand, retailer, and region. For larger jobs, buying 50 lb bags generally offers better value per cubic foot.',
    },
  ],
  wasteFactor: {
    default: 10,
    range: '10–15%',
    notes: 'Straight-set tile: 10%. Mosaic or very small tiles with narrow joints: 15%.',
  },
};
