import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';
import { rectVolFt3, rectVolM3 } from './volume-engine';

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  if (unitSystem === 'imperial') {
    const lengthFt   = Number(inputs.length_ft  ?? 2) + Number(inputs.length_in  ?? 0) / 12;
    const widthFt    = Number(inputs.width_ft   ?? 2) + Number(inputs.width_in   ?? 0) / 12;
    const depthFt    = Number(inputs.depth_ft   ?? 1) + Number(inputs.depth_in   ?? 0) / 12;
    const count      = Math.max(1, Math.round(Number(inputs.count ?? 1)));
    const costPerYd3 = Number(inputs.cost_per_yard ?? 0);

    const single = rectVolFt3(lengthFt, widthFt, depthFt);
    const cubic_yards  = Math.round(single.cubic_yards  * count * 1000) / 1000;
    const cubic_feet   = Math.round(single.cubic_feet   * count * 100)  / 100;
    const cubic_meters = Math.round(single.cubic_meters * count * 1000) / 1000;
    const cost         = costPerYd3 > 0 ? Math.round(cubic_yards * costPerYd3 * 100) / 100 : 0;

    return { cubic_yards, cubic_feet, cubic_meters, cost };
  } else {
    const lengthM   = Number(inputs.length_m  ?? 0.6);
    const widthM    = Number(inputs.width_m   ?? 0.6);
    const depthM    = Number(inputs.depth_m   ?? 0.3);
    const count     = Math.max(1, Math.round(Number(inputs.count ?? 1)));
    const costPerM3 = Number(inputs.cost_per_m3 ?? 0);

    const single = rectVolM3(lengthM, widthM, depthM);
    const cubic_meters = Math.round(single.cubic_meters * count * 1000) / 1000;
    const cubic_feet   = Math.round(single.cubic_feet   * count * 100)  / 100;
    const cubic_yards  = Math.round(single.cubic_yards  * count * 1000) / 1000;
    const cost         = costPerM3 > 0 ? Math.round(cubic_meters * costPerM3 * 100) / 100 : 0;

    return { cubic_meters, cubic_feet, cubic_yards, cost };
  }
}

export const concreteFootingCalculator: CalculatorConfig = {
  slug: 'concrete-footing-calculator',
  name: 'Concrete Footing Calculator',
  category: 'concrete',
  description:
    'Calculate how much concrete you need for rectangular spread footings, strip footings, and pad footings. Enter length, width, depth, and number of footings for exact cubic yards and an optional cost estimate.',
  inputs: [
    // ── Imperial ──────────────────────────────────────
    {
      id: 'length_ft',
      label: 'Footing Length',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 500,
      step: 1,
      defaultValue: 2,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'length_in',
      label: 'Footing Length (in)',
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
      label: 'Footing Width',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 500,
      step: 1,
      defaultValue: 2,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Typically 2× the wall or post width above it.',
    },
    {
      id: 'width_in',
      label: 'Footing Width (in)',
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
      label: 'Footing Depth',
      type: 'number',
      unit: 'ft',
      min: 0,
      max: 20,
      step: 1,
      defaultValue: 1,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Must extend below local frost depth.',
    },
    {
      id: 'depth_in',
      label: 'Footing Depth (in)',
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
      id: 'count',
      label: 'Number of Footings',
      type: 'number',
      unit: 'footings',
      min: 1,
      max: 1000,
      step: 1,
      defaultValue: 4,
      required: true,
      onlyIn: 'imperial',
    },
    {
      id: 'cost_per_yard',
      label: 'Concrete Cost (optional)',
      type: 'number',
      unit: '$/yd³',
      min: 0,
      max: 2000,
      step: 5,
      defaultValue: 0,
      onlyIn: 'imperial',
      helpText: 'Ready-mix typically costs $130–$180 per cubic yard. Leave 0 to skip.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Footing Length',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 150,
      step: 0.05,
      defaultValue: 0.6,
      defaultValueMetric: 0.6,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'width_m',
      label: 'Footing Width',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 150,
      step: 0.05,
      defaultValue: 0.6,
      defaultValueMetric: 0.6,
      required: true,
      onlyIn: 'metric',
      helpText: 'Typically 2× the wall or post width above it.',
    },
    {
      id: 'depth_m',
      label: 'Footing Depth',
      type: 'number',
      unit: 'm',
      min: 0,
      max: 6,
      step: 0.05,
      defaultValue: 0.3,
      defaultValueMetric: 0.3,
      required: true,
      onlyIn: 'metric',
      helpText: 'Must extend below local frost depth.',
    },
    {
      id: 'count',
      label: 'Number of Footings',
      type: 'number',
      unit: 'footings',
      min: 1,
      max: 1000,
      step: 1,
      defaultValue: 4,
      defaultValueMetric: 4,
      required: true,
      onlyIn: 'metric',
    },
    {
      id: 'cost_per_m3',
      label: 'Concrete Cost (optional)',
      type: 'number',
      unit: '$/m³',
      min: 0,
      max: 2000,
      step: 5,
      defaultValue: 0,
      onlyIn: 'metric',
      helpText: 'Ready-mix typically costs $120–$200 per cubic meter. Leave 0 to skip.',
    },
  ],
  outputs: [
    {
      id: 'cubic_yards',
      label: 'Cubic Yards',
      unit: 'yd³',
      format: 'volume',
      primary: true,
      description: 'Total for all footings — standard US ready-mix order unit',
    },
    {
      id: 'cubic_feet',
      label: 'Cubic Feet',
      unit: 'ft³',
      format: 'volume',
    },
    {
      id: 'cubic_meters',
      label: 'Cubic Meters',
      unit: 'm³',
      format: 'volume',
      description: 'Standard metric concrete order unit',
    },
    {
      id: 'cost',
      label: 'Estimated Concrete Cost',
      unit: '$',
      format: 'currency',
      description: 'Material cost only — does not include labour or forming',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'concrete-slab-calculator',
    'concrete-driveway-calculator',
    'concrete-block-calculator',
    'rebar-calculator',
  ],
  seo: {
    title: 'Concrete Footing Calculator — Spread, Pad & Strip Footings',
    description:
      'Free concrete footing calculator — enter footing length, width, depth, and count to get exact cubic yards, cubic feet, cubic meters, and an optional cost estimate for any rectangular footing.',
    h1: 'Concrete Footing Calculator',
    focusKeyword: 'concrete footing calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate concrete volume for rectangular footings',
      'Supports spread footings, pad footings, and strip footings',
      'Multiple footing count support',
      'Optional material cost estimate',
      'Feet and inches input support',
      'Metric (meters) support',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate volume of one footing',
      formula: 'Volume (ft³) = Length (ft) × Width (ft) × Depth (ft)',
      description: 'Convert any inch measurements to feet first (inches ÷ 12)',
    },
    {
      label: 'Scale to all footings',
      formula: 'Total Volume (ft³) = Volume per footing × Number of footings',
    },
    {
      label: 'Convert to cubic yards',
      formula: 'Volume (yd³) = Total Volume (ft³) ÷ 27',
      description: 'There are 27 cubic feet in one cubic yard — the standard US ready-mix order unit',
    },
    {
      label: 'Convert to cubic meters (optional)',
      formula: 'Volume (m³) = Total Volume (ft³) × 0.0283168',
    },
    {
      label: 'Estimate concrete cost (optional)',
      formula: 'Cost = Volume (yd³) × Price per cubic yard',
      description: 'Leave the price field at 0 to skip the cost output',
    },
  ],
  faq: [
    {
      question: 'How do I calculate concrete for a footing?',
      answer:
        'Multiply footing length × width × depth to get cubic feet, then divide by 27 to convert to cubic yards. For 4 footings each 2 ft × 2 ft × 1 ft: volume = 4 × (2 × 2 × 1) = 16 ft³ ÷ 27 = 0.59 cubic yards. Add 5–10% overage when ordering. This calculator handles multiple footings and unit conversions automatically.',
    },
    {
      question: 'How deep should a concrete footing be?',
      answer:
        'Footings must extend below the local frost depth to prevent heaving. Minimum depths by region: Southern US (no frost) 12 inches, Mid-Atlantic 24–30 inches, Midwest 36–42 inches, Northern states and Canada 48–60+ inches. Always check your local building code — engineered footings may be required for load-bearing structures regardless of frost depth.',
    },
    {
      question: 'How wide should a concrete footing be?',
      answer:
        'A footing should be at least twice as wide as the wall or post it supports. For an 8-inch CMU wall, the footing should be 16 inches wide. For a 6×6 post, a 24-inch square pad is common for residential decks. Width also depends on soil bearing capacity — weak or expansive soils require wider footings to spread the load.',
    },
    {
      question: 'What is the difference between a footing and a foundation?',
      answer:
        'A footing is the widened base at the bottom of a foundation that distributes the structure\'s load to the soil. A foundation is the full below-grade structural system — it includes the footings plus any stem walls, piers, or slabs above them. The footing is always the lowest element and is always wider than the wall or column it supports.',
    },
    {
      question: 'Do I need rebar in a concrete footing?',
      answer:
        'Most building codes require horizontal rebar in spread and strip footings. A common minimum is two #4 bars (1/2 inch) running the length of the footing. Vertical dowels tie the footing to the wall above. For pad footings under posts, a grid of #4 bars at 12-inch spacing is typical. Always check local code — unreinforced footings are only permitted for very light, non-structural applications.',
    },
    {
      question: 'What PSI concrete should I use for footings?',
      answer:
        'Residential footings typically use 3,000 PSI (20 MPa) concrete, which is the minimum for most building codes. Increase to 3,500–4,000 PSI for footings in freeze-thaw climates, footings in contact with sulphate-bearing soils, or footings supporting heavy loads. Ask your ready-mix supplier for a mix with low water-cement ratio if durability is a concern.',
    },
    {
      question: 'How much overage should I order for footings?',
      answer:
        'Order 5–10% more concrete than calculated. Excavated trenches and holes are rarely perfectly dimensioned — soft spots, over-excavation, and form variation all consume extra concrete. For small pours (under 1 yard), round up to the nearest quarter yard. Most ready-mix companies have a minimum order of 1 cubic yard, so consider combining footing pours with any slab work scheduled on the same day.',
    },
    {
      question: 'Can I use bagged concrete for footings, or do I need ready-mix?',
      answer:
        'Bagged concrete (60 lb or 80 lb) is practical for up to 10–15 bags per session. An 80 lb bag yields about 0.60 ft³. For 4 footings at 2 ft × 2 ft × 1 ft each (16 ft³ total), you would need 27 bags — manageable for a weekend project. For larger foundations, ready-mix is faster and produces more consistent concrete. The break-even point is typically around 0.5–1 cubic yard.',
    },
  ],
  orderCallout: true,
  wasteFactor: {
    default: 10,
    range: '10–15%',
    notes: 'Irregular trenches and round tube forms lose more concrete to over-excavation — use 15% for footings dug by hand.',
  },
  references: [
    {
      title: 'IRC R403 – Footings',
      organization: 'International Residential Code',
      url: 'https://codes.iccsafe.org/',
    },
    {
      title: 'ACI 318 – Building Code for Structural Concrete',
      organization: 'American Concrete Institute',
      url: 'https://www.concrete.org/',
    },
  ],
};
