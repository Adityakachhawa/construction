import type {
  CalculatorConfig,
  CalculatorInputMap,
  CalculatorOutputMap,
  UnitSystem,
} from './_types';
import { rectVolFt3, rectVolM3 } from './volume-engine';

function formula(inputs: CalculatorInputMap, unitSystem: UnitSystem): CalculatorOutputMap {
  const swellPct       = Math.max(0, Number(inputs.swell_pct ?? 20)) / 100;
  const costPerUnit    = Math.max(0, Number(inputs.cost_per_unit ?? 0));

  if (unitSystem === 'imperial') {
    const lengthFt    = Number(inputs.length_ft ?? 0) + Number(inputs.length_in ?? 0) / 12;
    const widthFt     = Number(inputs.width_ft  ?? 0) + Number(inputs.width_in  ?? 0) / 12;
    const depthFt     = Number(inputs.depth_ft  ?? 0) + Number(inputs.depth_in  ?? 0) / 12;
    const truckCapYd3 = Math.max(0.1, Number(inputs.truck_capacity ?? 10));

    if (lengthFt <= 0 || widthFt <= 0 || depthFt <= 0) {
      return { cubic_yards: 0, cubic_feet: 0, cubic_meters: 0, expanded_yards: 0, truckloads: 0, cost: 0 };
    }

    const vol             = rectVolFt3(lengthFt, widthFt, depthFt);
    const expanded_yards  = Math.round(vol.cubic_yards * (1 + swellPct) * 100) / 100;
    const truckloads      = Math.ceil(expanded_yards / truckCapYd3);
    const cost            = costPerUnit > 0 ? Math.round(expanded_yards * costPerUnit * 100) / 100 : 0;

    return { ...vol, expanded_yards, truckloads, cost };
  } else {
    const lengthM     = Number(inputs.length_m ?? 0);
    const widthM      = Number(inputs.width_m  ?? 0);
    const depthM      = Number(inputs.depth_m  ?? 0);
    const truckCapM3  = Math.max(0.1, Number(inputs.truck_capacity ?? 7.6));

    if (lengthM <= 0 || widthM <= 0 || depthM <= 0) {
      return { cubic_yards: 0, cubic_feet: 0, cubic_meters: 0, expanded_m3: 0, truckloads: 0, cost: 0 };
    }

    const vol         = rectVolM3(lengthM, widthM, depthM);
    const expanded_m3 = Math.round(vol.cubic_meters * (1 + swellPct) * 1000) / 1000;
    const truckloads  = Math.ceil(expanded_m3 / truckCapM3);
    const cost        = costPerUnit > 0 ? Math.round(expanded_m3 * costPerUnit * 100) / 100 : 0;

    return { ...vol, expanded_m3, truckloads, cost };
  }
}

export const excavationCalculator: CalculatorConfig = {
  slug: 'excavation-calculator',
  name: 'Excavation Calculator',
  category: 'excavation',
  description:
    'Calculate excavation volume, expanded soil, truckloads, and removal cost for basements, pools, trenches, foundations, and grading projects. Accounts for soil swell factor so you order the right number of trucks.',
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
      helpText: 'Horizontal length of the excavation area.',
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
      min: 1,
      max: 1000,
      step: 1,
      defaultValue: 20,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Horizontal width of the excavation area.',
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
      max: 100,
      step: 1,
      defaultValue: 6,
      required: true,
      onlyIn: 'imperial',
      helpText: 'Vertical depth of the cut. Typical basement: 8 ft; trench: 2–4 ft.',
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
      id: 'swell_pct',
      label: 'Swell Factor',
      type: 'number',
      unit: '%',
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 20,
      onlyIn: 'imperial',
      helpText: 'Soil expands when excavated: 15–25% for loam/topsoil, 25–40% for clay, 10–15% for sandy soil.',
    },
    {
      id: 'truck_capacity',
      label: 'Truck Capacity',
      type: 'number',
      unit: 'yd³',
      min: 1,
      max: 50,
      step: 1,
      defaultValue: 10,
      onlyIn: 'imperial',
      helpText: 'Standard dump truck: 10–14 yd³. Tandem axle: 14–16 yd³. Semi end-dump: 20–25 yd³.',
    },
    {
      id: 'cost_per_unit',
      label: 'Cost per yd³',
      type: 'number',
      unit: '$',
      min: 0,
      max: 10000,
      step: 0.01,
      defaultValue: 0,
      onlyIn: 'imperial',
      helpText: 'Optional. Typical range: $50–$200/yd³ depending on soil type, depth, and region.',
    },
    // ── Metric ────────────────────────────────────────
    {
      id: 'length_m',
      label: 'Length',
      type: 'number',
      unit: 'm',
      min: 0.5,
      max: 300,
      step: 0.1,
      defaultValue: 6,
      defaultValueMetric: 6,
      required: true,
      onlyIn: 'metric',
      helpText: 'Horizontal length of the excavation area.',
    },
    {
      id: 'width_m',
      label: 'Width',
      type: 'number',
      unit: 'm',
      min: 0.5,
      max: 300,
      step: 0.1,
      defaultValue: 6,
      defaultValueMetric: 6,
      required: true,
      onlyIn: 'metric',
      helpText: 'Horizontal width of the excavation area.',
    },
    {
      id: 'depth_m',
      label: 'Depth',
      type: 'number',
      unit: 'm',
      min: 0.1,
      max: 30,
      step: 0.1,
      defaultValue: 1.8,
      defaultValueMetric: 1.8,
      required: true,
      onlyIn: 'metric',
      helpText: 'Vertical depth of the cut. Typical basement: 2.4 m; trench: 0.6–1.2 m.',
    },
    {
      id: 'swell_pct',
      label: 'Swell Factor',
      type: 'number',
      unit: '%',
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 20,
      onlyIn: 'metric',
      helpText: 'Soil expands when excavated: 15–25% for loam/topsoil, 25–40% for clay, 10–15% for sandy soil.',
    },
    {
      id: 'truck_capacity',
      label: 'Truck Capacity',
      type: 'number',
      unit: 'm³',
      min: 0.5,
      max: 40,
      step: 0.5,
      defaultValue: 7.6,
      defaultValueMetric: 7.6,
      onlyIn: 'metric',
      helpText: 'Standard dump truck: 7–10 m³. Articulated hauler: 15–25 m³.',
    },
    {
      id: 'cost_per_unit',
      label: 'Cost per m³',
      type: 'number',
      unit: '$',
      min: 0,
      max: 10000,
      step: 0.01,
      defaultValue: 0,
      onlyIn: 'metric',
      helpText: 'Optional. Enter your local excavation rate per cubic metre.',
    },
  ],
  outputs: [
    {
      id: 'cubic_yards',
      label: 'Excavation Volume',
      unit: 'yd³',
      format: 'volume',
      primary: true,
      description: 'Bank (in-place) volume — cubic yards of soil before removal',
    },
    {
      id: 'cubic_feet',
      label: 'Excavation Volume',
      unit: 'ft³',
      format: 'volume',
      description: 'Bank volume in cubic feet',
    },
    {
      id: 'cubic_meters',
      label: 'Excavation Volume',
      unit: 'm³',
      format: 'volume',
      description: 'Bank volume in cubic metres',
    },
    {
      id: 'expanded_yards',
      label: 'Expanded Soil Volume',
      unit: 'yd³',
      format: 'volume',
      description: 'Volume after swell factor applied — what you actually haul away',
    },
    {
      id: 'expanded_m3',
      label: 'Expanded Soil Volume',
      unit: 'm³',
      format: 'volume',
      description: 'Expanded volume in cubic metres',
    },
    {
      id: 'truckloads',
      label: 'Truckloads Required',
      unit: 'loads',
      format: 'number',
      description: '⌈Expanded volume ÷ truck capacity⌉ — always rounded up',
    },
    {
      id: 'cost',
      label: 'Estimated Cost',
      unit: '$',
      format: 'currency',
      description: 'Expanded volume × cost per unit (shown when cost is entered)',
    },
  ],
  formula,
  unitSystems: ['imperial', 'metric'],
  relatedCalculators: [
    'gravel-calculator',
    'topsoil-calculator',
    'concrete-slab-calculator',
  ],
  seo: {
    title: 'Excavation Calculator – Soil Removal & Truckload Estimator',
    description:
      'Calculate excavation volume, soil removal, truckloads, swell factor, and excavation costs for construction and landscaping projects.',
    h1: 'Excavation Calculator',
    focusKeyword: 'excavation calculator',
  },
  schema: {
    appType: 'Construction Calculator',
    features: [
      'Calculate excavation volume in cubic yards, cubic feet, and cubic metres',
      'Apply soil swell factor to get true hauling volume',
      'Estimate truckloads based on truck capacity',
      'Optional cost estimate per cubic yard or cubic metre',
      'Supports imperial and metric unit systems',
      'Suitable for basements, pools, trenches, and foundations',
    ],
  },
  formulaSteps: [
    {
      label: 'Calculate bank (in-place) volume',
      formula: 'Volume = Length × Width × Depth',
      description:
        'Bank volume is the amount of soil in its undisturbed state. Measure length and width at ground level; measure depth from grade to the bottom of the cut. For irregular shapes, break the area into rectangles and sum them.',
    },
    {
      label: 'Apply swell factor to get loose volume',
      formula: 'Expanded Volume = Bank Volume × (1 + Swell Factor)',
      description:
        'When soil is excavated, it breaks apart and increases in volume — this is called "swell." Clay expands 25–40%; loam and topsoil 15–25%; sandy or granular soil 10–15%. You must haul the expanded (loose) volume, not the bank volume, so using bank volume to count truckloads will underestimate the number of trips.',
    },
    {
      label: 'Calculate truckloads',
      formula: 'Truckloads = ⌈Expanded Volume ÷ Truck Capacity⌉',
      description:
        'Divide the expanded volume by your truck\'s rated capacity and round up to the nearest whole number — you cannot send a partial truck. Standard dump trucks hold 10–14 yd³ (7–11 m³); tandems hold 14–16 yd³; semi end-dumps hold 20–25 yd³. Confirm capacity with your hauler as loads are often limited by road weight limits, not box volume.',
    },
    {
      label: 'Estimate excavation cost',
      formula: 'Cost = Expanded Volume × Cost per Unit',
      description:
        'Multiply the loose (expanded) volume by your contractor\'s rate per cubic yard or cubic metre. Excavation rates vary widely by soil type, depth, equipment access, and region. Typical range: $50–$200/yd³ for standard conditions. Hard rock or confined sites cost significantly more. Get itemised quotes that separate machine time, trucking, tipping fees, and permits.',
    },
    {
      label: 'Convert between units',
      formula: '1 yd³ = 27 ft³ = 0.7646 m³   |   1 m³ = 1.308 yd³ = 35.315 ft³',
      description:
        'Use these conversions to cross-check quotes from contractors who use different unit systems. Tipping (landfill) fees are commonly charged by the tonne — multiply cubic metres by soil density (typically 1.4–1.8 t/m³ for common soils) to estimate disposal weight.',
    },
  ],
  faq: [
    {
      question: 'What is excavation volume and how is it calculated?',
      answer:
        'Excavation volume is the amount of soil or rock removed from a site. For a rectangular pit, multiply length × width × depth — all in the same units. A 20 ft × 20 ft × 6 ft excavation contains 2,400 ft³ = 88.9 yd³. For irregular shapes, divide the area into rectangles and sum them. This calculator gives the bank (in-place) volume; the loose (expanded) volume you actually haul is larger due to swell.',
    },
    {
      question: 'What is soil swell factor and why does it matter?',
      answer:
        'When soil is disturbed, it breaks apart and occupies more space than it did in the ground — this increase is the swell factor. A 20% swell means 100 yd³ of bank soil produces 120 yd³ of loose soil to haul. If you ignore swell and order trucks based on bank volume, you will underestimate truckloads and potentially run short of hauling capacity on the day of excavation. Common swell values: loam/topsoil 15–25%, clay 25–40%, sandy gravel 10–15%, solid rock 30–50%.',
    },
    {
      question: 'How many cubic yards does a dump truck hold?',
      answer:
        'A standard single-axle dump truck holds about 10–12 cubic yards. A tandem-axle dump truck holds 14–16 yd³. A semi end-dump or transfer truck can hold 18–25 yd³. However, legal load limits are set by weight, not volume — in many jurisdictions the limit is 20–22 tonnes per load, so dense soils or wet clay may reduce the effective payload below the box capacity. Always confirm with your hauler.',
    },
    {
      question: 'How much does excavation cost per cubic yard?',
      answer:
        'Excavation costs depend heavily on soil type, depth, site access, and region. Typical ranges: $50–$100/yd³ for soft soil in open sites; $100–$200/yd³ for clay or restricted access; $200–$500+/yd³ for rock or confined urban sites. Costs usually include machine time, operator, and trucking but may exclude tipping fees, dewatering, shoring, permits, and surface restoration. Always obtain itemised quotes for large projects.',
    },
    {
      question: 'What is the difference between bank, loose, and compacted soil volumes?',
      answer:
        'Bank volume is the in-place volume before excavation — what you dig out. Loose volume is the expanded volume after excavation — what you haul. Compacted volume is the reduced volume after placing and compacting fill elsewhere — always less than bank. A useful rule of thumb: 1 yd³ bank ≈ 1.25 yd³ loose ≈ 0.9 yd³ compacted (varies by soil type). This calculator computes bank and loose volumes; compaction calculations depend on target density and fill specifications.',
    },
    {
      question: 'How do I calculate excavation for a basement?',
      answer:
        'Measure the footprint of the basement (length × width) and add 2–4 feet on each side for working room to form and waterproof the foundation walls. Depth is the finished basement floor depth plus 6–12 inches for the concrete slab and sub-base. Example: a 40 × 30 ft basement at 8 ft deep with 3 ft working space = 46 × 36 × 8 = 13,248 ft³ = 490 yd³. Add 20% swell → 588 yd³ loose = about 49 standard truck loads.',
    },
    {
      question: 'How deep can you excavate without shoring?',
      answer:
        'OSHA regulations (29 CFR 1926 Subpart P) require a protective system for trenches deeper than 5 feet in most soils, and for any trench where the soil is unstable. For excavations wider than they are deep, sloping the sides may be permitted instead of shoring — slope ratio depends on soil type (e.g. 1.5H:1V for Type C soils, 0.75H:1V for Type B, 0.5H:1V for Type A). Always consult local regulations and a geotechnical engineer for deep or urban excavations.',
    },
    {
      question: 'How do I convert cubic yards to cubic metres?',
      answer:
        '1 cubic yard = 0.7646 cubic metres. To convert yd³ to m³: multiply by 0.7646. To convert m³ to yd³: multiply by 1.308. Example: 100 yd³ = 76.46 m³. This matters when comparing quotes from contractors who use different unit systems, or when checking material specifications written in metric. This calculator shows both automatically.',
    },
  ],
};
